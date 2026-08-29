import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

export type OtpPurpose = 'phone_verification' | 'password_reset';

export interface IOTP {
  _id: Types.ObjectId;
  phone: string;
  purpose: OtpPurpose;
  codeHash: string;
  attempts: number;
  maxAttempts: number;
  lastSentAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type OTPDocument = HydratedDocument<IOTP>;

const otpSchema = new Schema<IOTP>(
  {
    phone: { type: String, required: true, trim: true, index: true },
    purpose: { type: String, enum: ['phone_verification', 'password_reset'], required: true },
    codeHash: { type: String, required: true, select: false },
    attempts: { type: Number, default: 0, min: 0 },
    maxAttempts: { type: Number, required: true, min: 1 },
    lastSentAt: { type: Date, required: true },
    // TTL index automatically removes expired transient OTP records.
    expiresAt: { type: Date, required: true, index: { expires: 0 } }
  },
  { timestamps: true, versionKey: false }
);

otpSchema.index({ phone: 1, purpose: 1 }, { unique: true });

export const OTP = model<IOTP>('OTP', otpSchema);
