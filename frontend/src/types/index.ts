export type UserRole = 'user' | 'owner' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  phoneVerified?: boolean;
  avatar?: string;
}

export interface OwnerSummary {
  _id: string;
  name: string;
  phone?: string;
  phoneVerified?: boolean;
  propertyVerified?: boolean;
  avatar?: string;
  joinedAt?: string;
}

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number];
}

export type AvailabilityStatus = 'available' | 'limited' | 'unavailable';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface Room {
  _id: string;
  title: string;
  description: string;
  propertyType: string;
  roomType: string;
  monthlyRent: number;
  securityDeposit?: number;
  address: string;
  city: string;
  area?: string;
  landmark?: string;
  location?: GeoPoint;
  distance?: number;
  facilities: string[];
  images: string[];
  availabilityStatus: AvailabilityStatus;
  availableFrom?: string;
  verificationStatus: VerificationStatus;
  averageRating: number;
  reviewCount: number;
  genderPreference?: 'any' | 'male' | 'female';
  furnishingStatus?: 'furnished' | 'semi-furnished' | 'unfurnished';
  occupancy?: string;
  owner?: OwnerSummary;
  createdAt?: string;
  aiMatch?: number;
}

export interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: Pick<User, '_id' | 'name'>;
}

export interface Enquiry {
  _id: string;
  room: Pick<Room, '_id' | 'title' | 'monthlyRent' | 'images'>;
  message: string;
  status: 'new' | 'contacted' | 'closed';
  createdAt: string;
}

export interface RoomPage {
  items: Room[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SearchFilters {
  query?: string;
  city?: string;
  area?: string;
  minRent?: number;
  maxRent?: number;
  propertyType?: string;
  roomType?: string;
  furnished?: boolean;
  facilities?: string[];
  genderPreference?: string;
  maxDistance?: number;
  minRating?: number;
  verified?: boolean;
  phoneVerified?: boolean;
  availability?: AvailabilityStatus;
  sort?: 'relevance' | 'rent_asc' | 'rent_desc' | 'nearest' | 'rating' | 'newest' | 'ai';
  page?: number;
  limit?: number;
}

export interface ListingFormValues {
  title: string;
  description: string;
  propertyType: string;
  roomType: string;
  monthlyRent: number;
  securityDeposit?: number;
  city: string;
  area: string;
  address: string;
  landmark?: string;
  availableFrom?: string;
  furnishingStatus: 'furnished' | 'semi-furnished' | 'unfurnished';
  genderPreference: 'any' | 'male' | 'female';
  occupancy?: string;
  facilities: string[];
  availabilityStatus: AvailabilityStatus;
}

export interface DashboardMetrics {
  label: string;
  value: string | number;
  change?: string;
  icon: 'heart' | 'building' | 'message' | 'shield' | 'users' | 'alert';
}
