import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Enquiry } from '../models/Enquiry';
import { Favourite } from '../models/Favourite';
import { Report } from '../models/Report';
import { Review } from '../models/Review';
import { Room } from '../models/Room';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { ok } from '../utils/apiResponse';
import { pageResult, parsePagination } from '../utils/pagination';
import { recordAudit } from '../utils/audit';

function getRouteParamId(value: string | string[] | undefined, name: string): string {
  const result = Array.isArray(value) ? value[0] : value;
  if (!result || result.trim() === '') {
    throw new AppError(`${name} is required`, 400, 'INVALID_ROUTE_PARAM');
  }
  return result;
}

async function ensurePublicRoom(roomId: string) {
  const room = await Room.findOne({ _id: roomId, isActive: true, verificationStatus: 'approved' });
  if (!room) throw new AppError('Room not found', 404, 'ROOM_NOT_FOUND');
  return room;
}

async function recomputeRating(roomId: Types.ObjectId): Promise<void> {
  const [result] = await Review.aggregate<{ _id: Types.ObjectId; averageRating: number; reviewCount: number }>([
    { $match: { room: roomId, status: 'visible' } },
    { $group: { _id: '$room', averageRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } }
  ]);
  await Room.findByIdAndUpdate(roomId, {
    averageRating: result ? Math.round(result.averageRating * 10) / 10 : 0,
    reviewCount: result?.reviewCount ?? 0
  });
}

export async function listFavourites(req: Request, res: Response): Promise<Response> {
  if (!req.auth) throw new AppError('Authentication is required', 401, 'AUTH_REQUIRED');
  const pagination = parsePagination(req.query.page, req.query.limit);
  const [items, total] = await Promise.all([
    Favourite.find({ user: req.auth.userId })
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate({ path: 'room', match: { isActive: true, verificationStatus: 'approved' }, select: '-rejectionReason', populate: { path: 'owner', select: 'name phoneVerified avatarUrl' } })
      .lean(),
    Favourite.countDocuments({ user: req.auth.userId })
  ]);
  // A room may have been removed after it was saved. Do not surface stale private listing data.
  return ok(res, pageResult(items.filter((item) => item.room), total, pagination));
}

export async function addFavourite(req: Request, res: Response): Promise<Response> {
  if (!req.auth) throw new AppError('Authentication is required', 401, 'AUTH_REQUIRED');
  const roomId = getRouteParamId(req.params.roomId, 'roomId');
  await ensurePublicRoom(roomId);
  const favourite = await Favourite.findOneAndUpdate(
    { user: req.auth.userId, room: roomId },
    { $setOnInsert: { user: req.auth.userId, room: roomId } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  await recordAudit(req, { actor: req.auth.userId, action: 'favourite.add', entityType: 'room', entityId: favourite.room });
  return res.status(201).json({ success: true, data: { favourite } });
}

export async function removeFavourite(req: Request, res: Response): Promise<Response> {
  if (!req.auth) throw new AppError('Authentication is required', 401, 'AUTH_REQUIRED');
  const roomId = getRouteParamId(req.params.roomId, 'roomId');
  await Favourite.deleteOne({ user: req.auth.userId, room: roomId });
  await recordAudit(req, { actor: req.auth.userId, action: 'favourite.remove', entityType: 'room', entityId: new Types.ObjectId(roomId) });
  return ok(res, { removed: true });
}

export async function listReviews(req: Request, res: Response): Promise<Response> {
  const roomId = getRouteParamId(req.params.roomId, 'roomId');
  const pagination = parsePagination(req.query.page, req.query.limit);
  const [items, total] = await Promise.all([
    Review.find({ room: roomId, status: 'visible' })
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate('user', 'name avatarUrl')
      .lean(),
    Review.countDocuments({ room: roomId, status: 'visible' })
  ]);
  return ok(res, pageResult(items, total, pagination));
}

export async function createReview(req: Request, res: Response): Promise<Response> {
  if (!req.auth) throw new AppError('Authentication is required', 401, 'AUTH_REQUIRED');
  const roomId = getRouteParamId(req.params.roomId, 'roomId');
  const room = await ensurePublicRoom(roomId);
  if (room.owner.equals(req.auth.userId)) throw new AppError('You cannot review your own listing', 403, 'SELF_REVIEW');
  if (await Review.exists({ room: room._id, user: req.auth.userId })) {
    throw new AppError('You have already reviewed this room', 409, 'DUPLICATE_REVIEW');
  }
  const review = await Review.create({ room: room._id, user: req.auth.userId, ...req.body });
  await recomputeRating(room._id);
  await recordAudit(req, { actor: req.auth.userId, action: 'review.create', entityType: 'review', entityId: review._id, metadata: { roomId: room._id.toString() } });
  return res.status(201).json({ success: true, data: review });
}

async function ensureReportTarget(targetType: string, targetId: string): Promise<void> {
  const found = targetType === 'room'
    ? await Room.exists({ _id: targetId })
    : targetType === 'review'
      ? await Review.exists({ _id: targetId })
      : await User.exists({ _id: targetId, ...(targetType === 'owner' ? { role: 'owner' } : {}) });
  if (!found) throw new AppError('Report target was not found', 404, 'REPORT_TARGET_NOT_FOUND');
}

export async function createReport(req: Request, res: Response): Promise<Response> {
  if (!req.auth) throw new AppError('Authentication is required', 401, 'AUTH_REQUIRED');
  const { targetType, targetId, reason, description } = req.body as { targetType: 'room' | 'owner' | 'review' | 'user'; targetId: string; reason: string; description?: string };
  if (targetId === req.auth.userId.toString()) throw new AppError('You cannot report yourself', 400, 'INVALID_REPORT');
  await ensureReportTarget(targetType, targetId);
  if (await Report.exists({ reporter: req.auth.userId, targetType, targetId, status: { $in: ['open', 'under_review'] } })) {
    throw new AppError('You already have an open report for this item', 409, 'DUPLICATE_REPORT');
  }
  const report = await Report.create({ reporter: req.auth.userId, targetType, targetId, reason, description });
  await recordAudit(req, { actor: req.auth.userId, action: 'report.create', entityType: 'report', entityId: report._id, metadata: { targetType, targetId, reason } });
  return res.status(201).json({ success: true, data: report });
}

export async function createEnquiry(req: Request, res: Response): Promise<Response> {
  if (!req.auth) throw new AppError('Authentication is required', 401, 'AUTH_REQUIRED');
  const roomId = getRouteParamId(req.params.roomId, 'roomId');
  const room = await ensurePublicRoom(roomId);
  if (room.owner.equals(req.auth.userId)) throw new AppError('You cannot enquire about your own listing', 400, 'SELF_ENQUIRY');
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  if (await Enquiry.exists({ tenant: req.auth.userId, room: room._id, createdAt: { $gte: tenMinutesAgo } })) {
    throw new AppError('Please wait before sending another enquiry for this room', 429, 'ENQUIRY_COOLDOWN');
  }
  const enquiry = await Enquiry.create({ tenant: req.auth.userId, room: room._id, owner: room.owner, ...req.body });
  await recordAudit(req, { actor: req.auth.userId, action: 'enquiry.create', entityType: 'enquiry', entityId: enquiry._id, metadata: { roomId: room._id.toString() } });
  return res.status(201).json({ success: true, data: enquiry });
}

export async function listOwnerEnquiries(req: Request, res: Response): Promise<Response> {
  if (!req.auth) throw new AppError('Authentication is required', 401, 'AUTH_REQUIRED');
  const pagination = parsePagination(req.query.page, req.query.limit);
  const [items, total] = await Promise.all([
    Enquiry.find({ owner: req.auth.userId })
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate('room', 'title monthlyRent city area images')
      .populate('tenant', 'name phone avatarUrl phoneVerified')
      .lean(),
    Enquiry.countDocuments({ owner: req.auth.userId })
  ]);
  return ok(res, pageResult(items, total, pagination));
}

export async function updateEnquiryStatus(req: Request, res: Response): Promise<Response> {
  if (!req.auth) throw new AppError('Authentication is required', 401, 'AUTH_REQUIRED');
  const enquiry = await Enquiry.findOneAndUpdate({ _id: req.params.id, owner: req.auth.userId }, { $set: { status: req.body.status } }, { new: true });
  if (!enquiry) throw new AppError('Enquiry not found', 404, 'ENQUIRY_NOT_FOUND');
  await recordAudit(req, { actor: req.auth.userId, action: 'enquiry.status_update', entityType: 'enquiry', entityId: enquiry._id, metadata: { status: enquiry.status } });
  return ok(res, enquiry);
}

export { recomputeRating };
