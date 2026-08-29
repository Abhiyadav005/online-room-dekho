import type { Request, Response } from 'express';
import { AuditLog } from '../models/AuditLog';
import { OwnerProfile } from '../models/OwnerProfile';
import { Report } from '../models/Report';
import { Review } from '../models/Review';
import { Room } from '../models/Room';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { ok } from '../utils/apiResponse';
import { pageResult, parsePagination } from '../utils/pagination';
import { publicUser } from '../utils/serializers';
import { recordAudit } from '../utils/audit';
import { recomputeRating } from './interactionController';

const escaped = (value: string): RegExp => new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

export async function listUsers(req: Request, res: Response): Promise<Response> {
  const pagination = parsePagination(req.query.page, req.query.limit);
  const q = typeof req.query.q === 'string' ? req.query.q.slice(0, 100) : undefined;
  const role = typeof req.query.role === 'string' && ['user', 'owner', 'admin'].includes(req.query.role) ? req.query.role : undefined;
  const filter = { ...(role ? { role } : {}), ...(q ? { $or: [{ name: escaped(q) }, { email: escaped(q) }, { phone: escaped(q) }] } : {}) };
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit).lean(),
    User.countDocuments(filter)
  ]);
  return ok(res, pageResult(items.map(publicUser), total, pagination));
}

export async function listOwners(req: Request, res: Response): Promise<Response> {
  const pagination = parsePagination(req.query.page, req.query.limit);
  const [items, total] = await Promise.all([
    OwnerProfile.find().sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit).populate('user', 'name email phone phoneVerified isSuspended avatarUrl').lean(),
    OwnerProfile.countDocuments()
  ]);
  return ok(res, pageResult(items, total, pagination));
}

export async function listAdminRooms(req: Request, res: Response): Promise<Response> {
  const pagination = parsePagination(req.query.page, req.query.limit);
  const verificationStatus = typeof req.query.verificationStatus === 'string' && ['pending', 'approved', 'rejected'].includes(req.query.verificationStatus)
    ? req.query.verificationStatus
    : undefined;
  const filter = verificationStatus ? { verificationStatus } : {};
  const [items, total] = await Promise.all([
    Room.find(filter).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit).populate('owner', 'name email phone phoneVerified isSuspended').lean(),
    Room.countDocuments(filter)
  ]);
  return ok(res, pageResult(items, total, pagination));
}

export async function approveRoom(req: Request, res: Response): Promise<Response> {
  if (!req.auth) throw new AppError('Authentication is required', 401, 'AUTH_REQUIRED');
  const room = await Room.findByIdAndUpdate(req.params.id, { verificationStatus: 'approved', rejectionReason: undefined }, { new: true });
  if (!room) throw new AppError('Room not found', 404, 'ROOM_NOT_FOUND');
  await OwnerProfile.updateOne({ user: room.owner }, { $set: { propertyVerified: true } });
  await recordAudit(req, { actor: req.auth.userId, action: 'admin.room_approve', entityType: 'room', entityId: room._id });
  return ok(res, room);
}

export async function rejectRoom(req: Request, res: Response): Promise<Response> {
  if (!req.auth) throw new AppError('Authentication is required', 401, 'AUTH_REQUIRED');
  const room = await Room.findByIdAndUpdate(
    req.params.id,
    { verificationStatus: 'rejected', rejectionReason: req.body.reason ?? 'Listing needs changes before approval' },
    { new: true }
  );
  if (!room) throw new AppError('Room not found', 404, 'ROOM_NOT_FOUND');
  await recordAudit(req, { actor: req.auth.userId, action: 'admin.room_reject', entityType: 'room', entityId: room._id });
  return ok(res, room);
}

export async function suspendUser(req: Request, res: Response): Promise<Response> {
  if (!req.auth) throw new AppError('Authentication is required', 401, 'AUTH_REQUIRED');
  if (req.params.id === req.auth.userId.toString()) throw new AppError('You cannot suspend yourself', 400, 'INVALID_SUSPENSION');
  const user = await User.findByIdAndUpdate(req.params.id, { isSuspended: req.body.suspended }, { new: true });
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  if (user.role === 'owner') await OwnerProfile.updateOne({ user: user._id }, { isSuspended: req.body.suspended });
  await recordAudit(req, { actor: req.auth.userId, action: req.body.suspended ? 'admin.user_suspend' : 'admin.user_restore', entityType: 'user', entityId: user._id, metadata: { reason: req.body.reason } });
  return ok(res, publicUser(user));
}

export async function suspendOwner(req: Request, res: Response): Promise<Response> {
  if (!req.auth) throw new AppError('Authentication is required', 401, 'AUTH_REQUIRED');
  const user = await User.findOneAndUpdate({ _id: req.params.id, role: 'owner' }, { isSuspended: req.body.suspended }, { new: true });
  if (!user) throw new AppError('Owner not found', 404, 'OWNER_NOT_FOUND');
  await OwnerProfile.updateOne({ user: user._id }, { isSuspended: req.body.suspended });
  if (req.body.suspended) await Room.updateMany({ owner: user._id }, { isActive: false, availabilityStatus: 'unavailable' });
  await recordAudit(req, { actor: req.auth.userId, action: req.body.suspended ? 'admin.owner_suspend' : 'admin.owner_restore', entityType: 'user', entityId: user._id, metadata: { reason: req.body.reason } });
  return ok(res, publicUser(user));
}

export async function listReports(req: Request, res: Response): Promise<Response> {
  const pagination = parsePagination(req.query.page, req.query.limit);
  const status = typeof req.query.status === 'string' && ['open', 'under_review', 'resolved', 'dismissed'].includes(req.query.status) ? req.query.status : undefined;
  const filter = status ? { status } : {};
  const [items, total] = await Promise.all([
    Report.find(filter).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit).populate('reporter', 'name email phone').populate('resolvedBy', 'name email').lean(),
    Report.countDocuments(filter)
  ]);
  return ok(res, pageResult(items, total, pagination));
}

export async function updateReport(req: Request, res: Response): Promise<Response> {
  if (!req.auth) throw new AppError('Authentication is required', 401, 'AUTH_REQUIRED');
  const report = await Report.findByIdAndUpdate(req.params.id, { $set: { ...req.body, resolvedBy: req.auth.userId } }, { new: true });
  if (!report) throw new AppError('Report not found', 404, 'REPORT_NOT_FOUND');
  await recordAudit(req, { actor: req.auth.userId, action: 'admin.report_update', entityType: 'report', entityId: report._id, metadata: { status: report.status } });
  return ok(res, report);
}

export async function moderateReview(req: Request, res: Response): Promise<Response> {
  if (!req.auth) throw new AppError('Authentication is required', 401, 'AUTH_REQUIRED');
  const review = await Review.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!review) throw new AppError('Review not found', 404, 'REVIEW_NOT_FOUND');
  await recomputeRating(review.room);
  await recordAudit(req, { actor: req.auth.userId, action: 'admin.review_moderate', entityType: 'review', entityId: review._id, metadata: { status: review.status } });
  return ok(res, review);
}

export async function getAdminStats(_req: Request, res: Response): Promise<Response> {
  const [users, owners, rooms, verifiedPhoneOwners, verifiedProperties, pendingListings, reports, activeListings] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'owner' }),
    Room.countDocuments(),
    User.countDocuments({ role: 'owner', phoneVerified: true }),
    Room.countDocuments({ verificationStatus: 'approved' }),
    Room.countDocuments({ verificationStatus: 'pending' }),
    Report.countDocuments({ status: { $in: ['open', 'under_review'] } }),
    Room.countDocuments({ isActive: true, availabilityStatus: { $ne: 'unavailable' } })
  ]);
  return ok(res, { users, owners, rooms, verifiedPhoneOwners, verifiedProperties, pendingListings, reports, activeListings, inactiveListings: rooms - activeListings });
}

export async function listAuditLogs(req: Request, res: Response): Promise<Response> {
  const pagination = parsePagination(req.query.page, req.query.limit);
  const [items, total] = await Promise.all([
    AuditLog.find().sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit).populate('actor', 'name email role').lean(),
    AuditLog.countDocuments()
  ]);
  return ok(res, pageResult(items, total, pagination));
}
