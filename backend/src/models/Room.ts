import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

export const propertyTypes = ['room', 'pg', 'hostel', 'flat', 'apartment', '1bhk', '2bhk', '3bhk', 'shared_accommodation'] as const;
export const roomTypes = ['single', 'shared', 'entire_property', 'studio'] as const;
export const facilityNames = [
  'wifi',
  'parking',
  'ac',
  'cooler',
  'washing_machine',
  'kitchen',
  'balcony',
  'power_backup',
  'cctv',
  'security',
  'food',
  'electricity',
  'water',
  'attached_bathroom'
] as const;

export type PropertyType = (typeof propertyTypes)[number];
export type RoomType = (typeof roomTypes)[number];
export type FacilityName = (typeof facilityNames)[number];

export interface IPoint {
  type: 'Point';
  coordinates: [number, number];
}

export interface IRoom {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  ownerProfile?: Types.ObjectId;
  title: string;
  description: string;
  propertyType: PropertyType;
  roomType: RoomType;
  monthlyRent: number;
  securityDeposit: number;
  location: IPoint;
  address: string;
  city: string;
  area?: string;
  landmark?: string;
  availableFrom?: Date;
  furnishing: 'furnished' | 'semi_furnished' | 'unfurnished';
  bathroom: 'attached' | 'shared' | 'private';
  facilities: FacilityName[];
  genderPreference: 'male' | 'female' | 'any';
  occupancy: number;
  roomSizeSqFt?: number;
  images: string[];
  availabilityStatus: 'available' | 'unavailable' | 'available_soon';
  verificationStatus: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  averageRating: number;
  reviewCount: number;
  viewCount: number;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type RoomDocument = HydratedDocument<IRoom>;

const pointSchema = new Schema<IPoint>(
  {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (coordinates: number[]) =>
          coordinates.length === 2 &&
          Number.isFinite(coordinates[0]) &&
          Number.isFinite(coordinates[1]) &&
          coordinates[0] >= -180 && coordinates[0] <= 180 &&
          coordinates[1] >= -90 && coordinates[1] <= 90,
        message: 'Location must be [longitude, latitude]'
      }
    }
  },
  { _id: false }
);

const roomSchema = new Schema<IRoom>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ownerProfile: { type: Schema.Types.ObjectId, ref: 'OwnerProfile' },
    title: { type: String, required: true, trim: true, minlength: 8, maxlength: 160 },
    description: { type: String, required: true, trim: true, minlength: 20, maxlength: 5_000 },
    propertyType: { type: String, required: true, enum: propertyTypes, index: true },
    roomType: { type: String, required: true, enum: roomTypes, index: true },
    monthlyRent: { type: Number, required: true, min: 0, index: true },
    securityDeposit: { type: Number, default: 0, min: 0 },
    location: { type: pointSchema, required: true },
    address: { type: String, required: true, trim: true, maxlength: 500 },
    city: { type: String, required: true, trim: true, maxlength: 100, index: true },
    area: { type: String, trim: true, maxlength: 100, index: true },
    landmark: { type: String, trim: true, maxlength: 160 },
    availableFrom: { type: Date },
    furnishing: { type: String, enum: ['furnished', 'semi_furnished', 'unfurnished'], default: 'unfurnished', index: true },
    bathroom: { type: String, enum: ['attached', 'shared', 'private'], default: 'shared' },
    facilities: [{ type: String, enum: facilityNames }],
    genderPreference: { type: String, enum: ['male', 'female', 'any'], default: 'any', index: true },
    occupancy: { type: Number, min: 1, max: 50, default: 1 },
    roomSizeSqFt: { type: Number, min: 1 },
    images: [{ type: String, trim: true, maxlength: 2_048 }],
    availabilityStatus: { type: String, enum: ['available', 'unavailable', 'available_soon'], default: 'available', index: true },
    verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    isActive: { type: Boolean, default: true, index: true },
    averageRating: { type: Number, min: 0, max: 5, default: 0, index: true },
    reviewCount: { type: Number, min: 0, default: 0 },
    viewCount: { type: Number, min: 0, default: 0 },
    rejectionReason: { type: String, trim: true, maxlength: 500, select: false }
  },
  { timestamps: true, versionKey: false }
);

roomSchema.index({ location: '2dsphere' });
roomSchema.index({ city: 1, area: 1, isActive: 1, verificationStatus: 1 });
roomSchema.index({ owner: 1, isActive: 1, createdAt: -1 });
roomSchema.index({ monthlyRent: 1, averageRating: -1 });

export const Room = model<IRoom>('Room', roomSchema);
