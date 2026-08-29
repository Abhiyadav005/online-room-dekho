import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

export interface IOwnerProfile {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  businessName?: string;
  bio?: string;
  whatsappNumber?: string;
  profileImageUrl?: string;
  propertyVerified: boolean;
  verificationNote?: string;
  isSuspended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type OwnerProfileDocument = HydratedDocument<IOwnerProfile>;

const ownerProfileSchema = new Schema<IOwnerProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    businessName: { type: String, trim: true, maxlength: 120 },
    bio: { type: String, trim: true, maxlength: 1_000 },
    whatsappNumber: { type: String, trim: true, maxlength: 20 },
    profileImageUrl: { type: String, trim: true, maxlength: 2_048 },
    // This means an admin reviewed one or more property listings, not an identity check.
    propertyVerified: { type: Boolean, default: false, index: true },
    verificationNote: { type: String, trim: true, maxlength: 500, select: false },
    isSuspended: { type: Boolean, default: false, index: true }
  },
  { timestamps: true, versionKey: false }
);

export const OwnerProfile = model<IOwnerProfile>('OwnerProfile', ownerProfileSchema);
