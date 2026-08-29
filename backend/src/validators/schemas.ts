import { z } from 'zod';
import { facilityNames, propertyTypes, roomTypes, type FacilityName, type PropertyType, type RoomType } from '../models/Room';
import { reportReasons } from '../models/Report';

const phone = z.string().trim().regex(/^\+[1-9]\d{7,14}$/, 'Use an E.164 phone number, e.g. +919876543210');
const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid resource id');
const propertyType = z.enum([...propertyTypes] as [PropertyType, ...PropertyType[]]);
const roomType = z.enum([...roomTypes] as [RoomType, ...RoomType[]]);
const facility = z.enum([...facilityNames] as [FacilityName, ...FacilityName[]]);

export const idParamsSchema = z.object({ id: objectId });
export const roomIdParamsSchema = z.object({ roomId: objectId });

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  phone,
  password: z.string().min(8).max(128),
  role: z.enum(['user', 'owner']).default('user')
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128)
});

export const sendOtpSchema = z.object({
  phone,
  purpose: z.enum(['phone_verification', 'password_reset'])
});

export const verifyOtpSchema = z.object({
  phone,
  purpose: z.enum(['phone_verification', 'password_reset']),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be six digits')
});

export const resetPasswordSchema = z.object({
  phone,
  otp: z.string().regex(/^\d{6}$/),
  password: z.string().min(8).max(128)
});

const pointSchema = z
  .object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)])
  })
  .strict();

const roomFields = {
  title: z.string().trim().min(8).max(160),
  description: z.string().trim().min(20).max(5_000),
  propertyType,
  roomType,
  monthlyRent: z.coerce.number().finite().min(0).max(10_000_000),
  securityDeposit: z.coerce.number().finite().min(0).max(100_000_000).default(0),
  location: pointSchema,
  address: z.string().trim().min(5).max(500),
  city: z.string().trim().min(2).max(100),
  area: z.string().trim().max(100).optional(),
  landmark: z.string().trim().max(160).optional(),
  availableFrom: z.coerce.date().optional(),
  furnishing: z.enum(['furnished', 'semi_furnished', 'unfurnished']).default('unfurnished'),
  bathroom: z.enum(['attached', 'shared', 'private']).default('shared'),
  facilities: z.array(facility).max(facilityNames.length).default([]),
  genderPreference: z.enum(['male', 'female', 'any']).default('any'),
  occupancy: z.coerce.number().int().min(1).max(50).default(1),
  roomSizeSqFt: z.coerce.number().finite().positive().max(100_000).optional(),
  images: z.array(z.string().url().max(2_048)).max(12).default([]),
  availabilityStatus: z.enum(['available', 'unavailable', 'available_soon']).default('available')
};

export const createRoomSchema = z.object(roomFields).strict();
export const updateRoomSchema = z.object(roomFields).partial().strict().refine((value) => Object.keys(value).length > 0, 'At least one field is required');
export const availabilitySchema = z.object({
  availabilityStatus: z.enum(['available', 'unavailable', 'available_soon']),
  availableFrom: z.coerce.date().optional()
});

export const roomSearchSchema = z.object({
  q: z.string().trim().max(160).optional(),
  city: z.string().trim().max(100).optional(),
  area: z.string().trim().max(100).optional(),
  landmark: z.string().trim().max(160).optional(),
  minRent: z.coerce.number().min(0).optional(),
  maxRent: z.coerce.number().min(0).optional(),
  propertyType: propertyType.optional(),
  roomType: roomType.optional(),
  furnishing: z.enum(['furnished', 'semi_furnished', 'unfurnished']).optional(),
  facilities: z.string().trim().max(400).optional(),
  genderPreference: z.enum(['male', 'female', 'any']).optional(),
  availability: z.enum(['available', 'unavailable', 'available_soon']).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  verified: z.enum(['true', 'false']).optional(),
  ownerPhoneVerified: z.enum(['true', 'false']).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  radiusKm: z.coerce.number().positive().max(100).optional(),
  sort: z.enum(['relevance', 'rent_asc', 'rent_desc', 'nearest', 'rating', 'newest', 'ai']).optional(),
  page: z.coerce.number().int().positive().max(10_000).optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
}).superRefine((value, ctx) => {
  if (value.minRent !== undefined && value.maxRent !== undefined && value.minRent > value.maxRent) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['maxRent'], message: 'maxRent must be at least minRent' });
  }
  const hasLongitude = value.longitude !== undefined;
  const hasLatitude = value.latitude !== undefined;
  if (hasLongitude !== hasLatitude) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['longitude'], message: 'longitude and latitude must be supplied together' });
  }
});

export const aiSearchSchema = z.object({
  query: z.string().trim().min(3).max(1_000),
  location: z.object({ longitude: z.number().min(-180).max(180), latitude: z.number().min(-90).max(90) }).optional()
});

export const recommendationSchema = z.object({
  roomIds: z.array(objectId).min(1).max(30).optional(),
  preferences: z.object({
    maxRent: z.number().min(0).optional(),
    facilities: z.array(facility).max(facilityNames.length).optional(),
    propertyType: propertyType.optional(),
    roomType: roomType.optional(),
    location: z.object({ longitude: z.number(), latitude: z.number() }).optional()
  }).default({})
});

export const chatSchema = z.object({
  message: z.string().trim().min(1).max(1_000),
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().trim().min(1).max(1_000) })).max(20).default([])
});

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(4).max(1_000)
});

export const reportSchema = z.object({
  targetType: z.enum(['room', 'owner', 'review', 'user']),
  targetId: objectId,
  reason: z.enum([...reportReasons]),
  description: z.string().trim().min(4).max(1_500).optional()
});

export const enquirySchema = z.object({
  message: z.string().trim().min(5).max(1_500),
  contactPhone: phone.optional()
});

export const enquiryStatusSchema = z.object({ status: z.enum(['new', 'contacted', 'closed']) });

export const ownerProfileSchema = z.object({
  businessName: z.string().trim().min(2).max(120).optional(),
  bio: z.string().trim().max(1_000).optional(),
  whatsappNumber: phone.optional(),
  profileImageUrl: z.string().url().max(2_048).optional()
}).strict();

export const suspensionSchema = z.object({ suspended: z.boolean(), reason: z.string().trim().min(4).max(500).optional() });
export const listingModerationSchema = z.object({ reason: z.string().trim().min(4).max(500).optional() });
export const reportStatusSchema = z.object({
  status: z.enum(['open', 'under_review', 'resolved', 'dismissed']),
  resolutionNote: z.string().trim().max(1_000).optional()
});

export const geocodeSchema = z.object({ address: z.string().trim().min(2).max(300) });
export const reverseGeocodeSchema = z.object({ longitude: z.coerce.number().min(-180).max(180), latitude: z.coerce.number().min(-90).max(90) });
export const distanceSchema = z.object({
  fromLongitude: z.coerce.number().min(-180).max(180),
  fromLatitude: z.coerce.number().min(-90).max(90),
  toLongitude: z.coerce.number().min(-180).max(180),
  toLatitude: z.coerce.number().min(-90).max(90)
});
