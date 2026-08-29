import type { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { User, type UserRole } from '../models/User';
import { AppError } from '../utils/AppError';
import { verifyAccessToken } from '../utils/jwt';
import { asyncHandler } from '../utils/asyncHandler';

export const requireAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) {
    throw new AppError('Authentication is required', 401, 'AUTH_REQUIRED');
  }
  const claims = verifyAccessToken(header.slice(7));
  if (!Types.ObjectId.isValid(claims.sub)) throw new AppError('Authentication token is invalid', 401, 'INVALID_TOKEN');

  const user = await User.findById(claims.sub).select('role isSuspended').lean();
  if (!user || user.isSuspended) throw new AppError('This account is unavailable', 403, 'ACCOUNT_UNAVAILABLE');
  req.auth = { userId: user._id, role: user.role };
  next();
});

export const allowRoles = (...roles: UserRole[]) => (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.auth) return next(new AppError('Authentication is required', 401, 'AUTH_REQUIRED'));
  if (!roles.includes(req.auth.role)) return next(new AppError('You do not have permission for this action', 403, 'FORBIDDEN'));
  next();
};
