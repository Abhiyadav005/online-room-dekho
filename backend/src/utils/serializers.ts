import type { IUser } from '../models/User';

export function publicUser(user: Pick<IUser, '_id' | 'name' | 'email' | 'phone' | 'role' | 'phoneVerified' | 'isSuspended' | 'avatarUrl' | 'createdAt' | 'updatedAt'>) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    phoneVerified: user.phoneVerified,
    isSuspended: user.isSuspended,
    ...(user.avatarUrl ? { avatarUrl: user.avatarUrl } : {}),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}
