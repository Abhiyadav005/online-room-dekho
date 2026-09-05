export type UserRole = 'user' | 'owner' | 'admin';

export type TenantType =
  | 'student'
  | 'tourist'
  | 'family'
  | 'worker'
  | 'professional'
  | 'other';

export type PropertyType =
  | 'room'
  | 'flat'
  | 'house'
  | 'apartment';

export type RoomType =
  | 'single'
  | 'double'
  | 'shared'
  | '1bhk'
  | '2bhk'
  | '3bhk'
  | 'other';

export type FurnishingStatus =
  | 'furnished'
  | 'semi-furnished'
  | 'unfurnished';

export type GenderPreference =
  | 'any'
  | 'male'
  | 'female';

export type AvailabilityStatus =
  | 'available'
  | 'limited'
  | 'unavailable';

export type VerificationStatus =
  | 'pending'
  | 'verified'
  | 'rejected';

/* ================================================================
   USER
================================================================ */

export interface User {
  _id: string;

  name: string;

  email: string;

  phone?: string;

  role: UserRole;

  phoneVerified?: boolean;

  avatar?: string;

  /**
   * What type of tenant the user is.
   * Used for better room discovery.
   */
  tenantType?: TenantType;

  createdAt?: string;
}

/* ================================================================
   OWNER
================================================================ */

export interface OwnerSummary {
  _id: string;

  name: string;

  phone?: string;

  phoneVerified?: boolean;

  propertyVerified?: boolean;

  avatar?: string;

  joinedAt?: string;
}

/* ================================================================
   LOCATION
================================================================ */

export interface GeoPoint {
  type: 'Point';

  /**
   * [longitude, latitude]
   */
  coordinates: [number, number];
}

/* ================================================================
   ROOM / FLAT
================================================================ */

export interface Room {
  _id: string;

  title: string;

  description: string;

  /**
   * room / flat / house / apartment
   */
  propertyType: PropertyType | string;

  /**
   * single / double / shared / 1bhk / 2bhk / 3bhk
   */
  roomType: RoomType | string;

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

  genderPreference?: GenderPreference;

  furnishingStatus?: FurnishingStatus;

  /**
   * Example:
   * "1 person"
   * "2 people"
   * "Family"
   */
  occupancy?: string;

  owner?: OwnerSummary;

  createdAt?: string;

  updatedAt?: string;

  /**
   * AI-based search relevance score.
   */
  aiMatch?: number;

  /**
   * Useful for temporary / tourist rentals.
   * Example: 2 days, 1 week, 3 months.
   */
  minimumStayDays?: number;

  maximumStayDays?: number;
}

/* ================================================================
   REVIEWS
================================================================ */

export interface Review {
  _id: string;

  rating: number;

  comment: string;

  createdAt: string;

  user: Pick<User, '_id' | 'name'>;
}

/* ================================================================
   ENQUIRIES
================================================================ */

export interface Enquiry {
  _id: string;

  room: Pick<
    Room,
    '_id' | 'title' | 'monthlyRent' | 'images'
  >;

  message: string;

  status: 'new' | 'contacted' | 'closed';

  createdAt: string;
}

/* ================================================================
   ROOM PAGINATION
================================================================ */

export interface RoomPage {
  items: Room[];

  page: number;

  limit: number;

  total: number;

  totalPages: number;
}

/* ================================================================
   SEARCH FILTERS
================================================================ */

export interface SearchFilters {
  /**
   * Free-text search:
   * "BBDITM"
   * "railway station"
   * "room near office"
   */
  query?: string;

  city?: string;

  area?: string;

  landmark?: string;

  minRent?: number;

  maxRent?: number;

  propertyType?: PropertyType | string;

  roomType?: RoomType | string;

  tenantType?: TenantType;

  furnishingStatus?: FurnishingStatus;

  furnished?: boolean;

  facilities?: string[];

  genderPreference?: GenderPreference;

  maxDistance?: number;

  minRating?: number;

  verified?: boolean;

  phoneVerified?: boolean;

  availability?: AvailabilityStatus;

  /**
   * Monthly / short-term rental preference.
   */
  minimumStayDays?: number;

  sort?:
    | 'relevance'
    | 'rent_asc'
    | 'rent_desc'
    | 'nearest'
    | 'rating'
    | 'newest'
    | 'ai';

  page?: number;

  limit?: number;
}

/* ================================================================
   PROPERTY LISTING FORM
================================================================ */

export interface ListingFormValues {
  title: string;

  description: string;

  propertyType: PropertyType | string;

  roomType: RoomType | string;

  monthlyRent: number;

  securityDeposit?: number;

  city: string;

  area: string;

  address: string;

  landmark?: string;

  availableFrom?: string;

  furnishingStatus: FurnishingStatus;

  genderPreference: GenderPreference;

  occupancy?: string;

  facilities: string[];

  availabilityStatus: AvailabilityStatus;

  /**
   * Optional rental duration.
   */
  minimumStayDays?: number;

  maximumStayDays?: number;
}

/* ================================================================
   DASHBOARD
================================================================ */

export interface DashboardMetrics {
  label: string;

  value: string | number;

  change?: string;

  icon:
    | 'heart'
    | 'building'
    | 'message'
    | 'shield'
    | 'users'
    | 'alert';
}

/* ================================================================
   API RESPONSE
================================================================ */

export interface ApiResponse<T> {
  success: boolean;

  message?: string;

  data: T;
}

/* ================================================================
   AUTH RESPONSE
================================================================ */

export interface AuthResponse {
  user: User;

  token?: string;

  refreshToken?: string;
}

/* ================================================================
   ROOM CONTACT / ENQUIRY
================================================================ */

export interface RoomEnquiryInput {
  roomId: string;

  message: string;

  moveInDate?: string;

  tenantType?: TenantType;
}

/* ================================================================
   SAVED / FAVOURITE ROOM
================================================================ */

export interface FavouriteRoom {
  _id: string;

  room: Pick<
    Room,
    '_id' | 'title' | 'monthlyRent' | 'images' | 'city' | 'area'
  >;

  createdAt: string;
}