import type { Request, Response } from 'express';
import { Enquiry } from '../models/Enquiry';
import { OwnerProfile } from '../models/OwnerProfile';
import { Room } from '../models/Room';
import { AppError } from '../utils/AppError';
import { ok } from '../utils/apiResponse';
import { recordAudit } from '../utils/audit';

export async function getOwnerProfile(req: Request, res: Response): Promise<Response> {
  if (!req.auth) throw new AppError('Authentication is required', 401, 'AUTH_REQUIRED');
  let profile = await OwnerProfile.findOne({ user: req.auth.userId }).populate('user', 'name email phone phoneVerified avatarUrl');
  if (!profile) {
    profile = await OwnerProfile.create({ user: req.auth.userId });
    await profile.populate('user', 'name email phone phoneVerified avatarUrl');
  }
  return ok(res, profile);
}

export async function updateOwnerProfile(req: Request, res: Response): Promise<Response> {
  if (!req.auth) throw new AppError('Authentication is required', 401, 'AUTH_REQUIRED');
  const profile = await OwnerProfile.findOneAndUpdate(
    { user: req.auth.userId },
    { $set: req.body, $setOnInsert: { user: req.auth.userId } },
    { new: true, upsert: true, runValidators: true }
  ).populate('user', 'name email phone phoneVerified avatarUrl');
  await recordAudit(req, { actor: req.auth.userId, action: 'owner.profile_update', entityType: 'owner_profile', entityId: profile._id });
  return ok(res, profile);
}

export async function ownerStats(req: Request, res: Response): Promise<Response> {
  if (!req.auth) throw new AppError('Authentication is required', 401, 'AUTH_REQUIRED');
  const [roomStats, enquiryStats] = await Promise.all([
    Room.aggregate<{ _id: string; count: number; views: number }>([
      { $match: { owner: req.auth.userId } },
      { $group: { _id: '$availabilityStatus', count: { $sum: 1 }, views: { $sum: '$viewCount' } } }
    ]),
    Enquiry.aggregate<{ _id: string; count: number }>([
      { $match: { owner: req.auth.userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
  ]);
  return ok(res, { rooms: roomStats, enquiries: enquiryStats });
}
