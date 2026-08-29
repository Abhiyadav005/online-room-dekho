import bcrypt from 'bcryptjs';
import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

export type UserRole = 'user' | 'owner' | 'admin';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  phoneVerified: boolean;
  isSuspended: boolean;
  avatarUrl?: string;
  passwordResetTokenHash?: string;
  passwordResetExpiresAt?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

export type UserDocument = HydratedDocument<IUser>;

const phonePattern = /^\+[1-9]\d{7,14}$/;

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254, unique: true },
    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      validate: { validator: (phone: string) => phonePattern.test(phone), message: 'Phone must use E.164 format' }
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'owner', 'admin'], default: 'user', index: true },
    phoneVerified: { type: Boolean, default: false, index: true },
    isSuspended: { type: Boolean, default: false, index: true },
    avatarUrl: { type: String, trim: true, maxlength: 2_048 },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpiresAt: { type: Date, select: false },
    lastLoginAt: { type: Date }
  },
  { timestamps: true, versionKey: false }
);

userSchema.index({ role: 1, isSuspended: 1, createdAt: -1 });

userSchema.methods.comparePassword = function comparePassword(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

export const User = model<IUser>('User', userSchema);
export { phonePattern };
