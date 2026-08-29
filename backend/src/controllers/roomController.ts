import type { FilterQuery } from 'mongoose';
import type { Request, Response } from 'express';
import { OwnerProfile } from '../models/OwnerProfile';
import { Room, type FacilityName, type IRoom } from '../models/Room';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { ok } from '../utils/apiResponse';
import { pageResult, parsePagination } from '../utils/pagination';
import { recordAudit } from '../utils/audit';

interface RoomSearchInput {
  q?: string;
  city?: string;
  area?: string;
  landmark?: string;
  minRent?: number;
  maxRent?: number;
  propertyType?: IRoom['propertyType'];
  roomType?: IRoom['roomType'];
  furnishing?: IRoom['furnishing'];
  facilities?: string;
  genderPreference?: IRoom['genderPreference'];
  availability?: IRoom['availabilityStatus'];
  minRating?: number;
  verified?: 'true' | 'false';
  ownerPhoneVerified?: 'true' | 'false';
  longitude?: number;
  latitude?: number;
  radiusKm?: number;
  sort?: 'relevance' | 'rent_asc' | 'rent_desc' | 'nearest' | 'rating' | 'newest' | 'ai';
  page?: number;
  limit?: number;
}

const ownerPublicFields = 'name phoneVerified avatarUrl';
const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function facilityList(raw: string | undefined): FacilityName[] {
  if (!raw) return [];
  const allowed = new Set<FacilityName>([
    'wifi', 'parking', 'ac', 'cooler', 'washing_machine', 'kitchen', 'balcony', 'power_backup', 'cctv', 'security', 'food', 'electricity', 'water', 'attached_bathroom'
  ]);
  return [...new Set(raw.split(',').map((value) => value.trim()).filter((value): value is FacilityName => allowed.has(value as FacilityName)))];
}

async function buildPublicFilter(input: RoomSearchInput): Promise<FilterQuery<IRoom>> {
  const filter: FilterQuery<IRoom> = { isActive: true, verificationStatus: 'approved' };
  if (input.city) filter.city = new RegExp(`^${escapeRegex(input.city)}$`, 'i');
  if (input.area) filter.area = new RegExp(escapeRegex(input.area), 'i');
  if (input.landmark) filter.landmark = new RegExp(escapeRegex(input.landmark), 'i');
  if (input.propertyType) filter.propertyType = input.propertyType;
  if (input.roomType) filter.roomType = input.roomType;
  if (input.furnishing) filter.furnishing = input.furnishing;
  if (input.genderPreference) filter.genderPreference = input.genderPreference;
  if (input.availability) filter.availabilityStatus = input.availability;
  if (input.minRent !== undefined || input.maxRent !== undefined) {
    filter.monthlyRent = { ...(input.minRent !== undefined ? { $gte: input.minRent } : {}), ...(input.maxRent !== undefined ? { $lte: input.maxRent } : {}) };
  }
  if (input.minRating !== undefined) filter.averageRating = { $gte: input.minRating };
  const facilities = facilityList(input.facilities);
  if (facilities.length) filter.facilities = { $all: facilities };
  if (input.q) {
    const text = new RegExp(escapeRegex(input.q), 'i');
    filter.$or = [{ title: text }, { description: text }, { address: text }, { city: text }, { area: text }, { landmark: text }];
  }
  if (input.ownerPhoneVerified) {
    const owners = await User.find({ phoneVerified: input.ownerPhoneVerified === 'true' }).select('_id').lean();
    filter.owner = { $in: owners.map((owner) => owner._id) };
  }
  if (input.longitude !== undefined && input.latitude !== undefined) {
    filter.location = {
      $near: {
        $geometry: { type: 'Point', coordinates: [input.longitude, input.latitude] },
        ...(input.radiusKm ? { $maxDistance: input.radiusKm * 1_000 } : {})
      }
    };
  }
  return filter;
}

function sortFor(input: RoomSearchInput): Record<string, 1 | -1> | undefined {
  if (input.longitude !== undefined && input.latitude !== undefined) return undefined; // $near controls order.
  switch (input.sort) {
    case 'rent_asc': return { monthlyRent: 1, createdAt: -1 };
    case 'rent_desc': return { monthlyRent: -1, createdAt: -1 };
    case 'rating': return { averageRating: -1, reviewCount: -1, createdAt: -1 };
    case 'newest': return { createdAt: -1 };
    default: return { createdAt: -1 };
  }
}

export async function listRooms(req: Request, res: Response): Promise<Response> {
  const input = req.query as unknown as RoomSearchInput;
  const pagination = parsePagination(input.page, input.limit);
  const filter = await buildPublicFilter(input);
  const [items, total] = await Promise.all([
    Room.find(filter)
      .sort(sortFor(input))
      .skip(pagination.skip)
      .limit(pagination.limit)
      .select('-rejectionReason')
      .populate('owner', ownerPublicFields)
      .lean(),
    Room.countDocuments(filter)
  ]);
  return ok(res, pageResult(items, total, pagination));
}

export async function getRoom(req: Request, res: Response): Promise<Response> {
  const room = await Room.findOne({ _id: req.params.id, isActive: true, verificationStatus: 'approved' })
    .select('-rejectionReason')
    .populate('owner', ownerPublicFields)
    .lean();
  if (!room) throw new AppError('Room not found', 404, 'ROOM_NOT_FOUND');
  void Room.updateOne({ _id: room._id }, { $inc: { viewCount: 1 } }).exec();
  return ok(res, room);
}

export async function createRoom(req: Request, res: Response): Promise<Response> {
  if (!req.auth) throw new AppError('Authentication is required', 401, 'AUTH_REQUIRED');
  const user = await User.findById(req.auth.userId).select('phoneVerified isSuspended');
  if (!user || user.isSuspended) throw new AppError('This account is unavailable', 403, 'ACCOUNT_UNAVAILABLE');
  if (!user.phoneVerified) throw new AppError('Verify your mobile number before creating a listing', 403, 'PHONE_VERIFICATION_REQUIRED');
  const ownerProfile = await OwnerProfile.findOne({ user: req.auth.userId });
  if (ownerProfile?.isSuspended) throw new AppError('Owner profile is suspended', 403, 'OWNER_SUSPENDED');
  const room = await Room.create({ ...req.body, owner: req.auth.userId, ...(ownerProfile ? { ownerProfile: ownerProfile._id } : {}) });
  await recordAudit(req, { actor: req.auth.userId, action: 'room.create', entityType: 'room', entityId: room._id });
  return res.status(201).json({ success: true, data: room });
}

export async function updateRoom(req: Request, res: Response): Promise<Response> {
  if (!req.auth) throw new AppError('Authentication is required', 401, 'AUTH_REQUIRED');
  const room = await Room.findOneAndUpdate(
    { _id: req.params.id, owner: req.auth.userId },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!room) throw new AppError('Room not found or not owned by you', 404, 'ROOM_NOT_FOUND');
  await recordAudit(req, { actor: req.auth.userId, action: 'room.update', entityType: 'room', entityId: room._id });
  return ok(res, room);
}

export async function deactivateRoom(req: Request, res: Response): Promise<Response> {
  if (!req.auth) throw new AppError('Authentication is required', 401, 'AUTH_REQUIRED');
  const room = await Room.findOneAndUpdate({ _id: req.params.id, owner: req.auth.userId }, { isActive: false, availabilityStatus: 'unavailable' }, { new: true });
  if (!room) throw new AppError('Room not found or not owned by you', 404, 'ROOM_NOT_FOUND');
  await recordAudit(req, { actor: req.auth.userId, action: 'room.deactivate', entityType: 'room', entityId: room._id });
  return ok(res, { deactivated: true });
}

export async function updateAvailability(req: Request, res: Response): Promise<Response> {
  if (!req.auth) throw new AppError('Authentication is required', 401, 'AUTH_REQUIRED');
  const room = await Room.findOneAndUpdate({ _id: req.params.id, owner: req.auth.userId }, { $set: req.body }, { new: true, runValidators: true });
  if (!room) throw new AppError('Room not found or not owned by you', 404, 'ROOM_NOT_FOUND');
  await recordAudit(req, { actor: req.auth.userId, action: 'room.availability_update', entityType: 'room', entityId: room._id, metadata: { availabilityStatus: room.availabilityStatus } });
  return ok(res, room);
}

export async function listOwnerRooms(req: Request, res: Response): Promise<Response> {
  if (!req.auth) throw new AppError('Authentication is required', 401, 'AUTH_REQUIRED');
  const pagination = parsePagination(req.query.page, req.query.limit);
  const [items, total] = await Promise.all([
    Room.find({ owner: req.auth.userId }).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit).lean(),
    Room.countDocuments({ owner: req.auth.userId })
  ]);
  return ok(res, pageResult(items, total, pagination));
}

export { buildPublicFilter, sortFor, type RoomSearchInput };
