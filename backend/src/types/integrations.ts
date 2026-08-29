/**
 * Contracts shared by external-provider integrations and the services that use
 * them.  They deliberately contain plain data only: controllers are
 * responsible for translating database documents into these DTOs.
 */

export const PROPERTY_TYPES = [
  'room',
  'pg',
  'hostel',
  'flat',
  'apartment',
  '1bhk',
  '2bhk',
  '3bhk',
  'shared_accommodation',
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const ROOM_TYPES = ['single', 'double', 'triple', 'shared', 'private'] as const;
export type RoomType = (typeof ROOM_TYPES)[number];

export const AMENITY_KEYS = [
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
  'water',
  'electricity',
] as const;

export type AmenityKey = (typeof AMENITY_KEYS)[number];

export const GENDER_PREFERENCES = ['male', 'female', 'any'] as const;
export type GenderPreference = (typeof GENDER_PREFERENCES)[number];

export const SEARCH_SORTS = [
  'relevance',
  'rent_asc',
  'rent_desc',
  'nearest',
  'rating_desc',
  'newest',
  'recommended',
] as const;
export type SearchSort = (typeof SEARCH_SORTS)[number];

/**
 * This is the only search shape AI code may produce.  It contains no MongoDB
 * operators, regular expressions, or arbitrary field names.
 */
export interface SafeSearchFilters {
  city?: string;
  location?: string;
  minRent?: number;
  maxRent?: number;
  propertyTypes?: PropertyType[];
  roomTypes?: RoomType[];
  furnished?: boolean;
  amenities?: AmenityKey[];
  genderPreference?: GenderPreference;
  maxDistanceKm?: number;
  verifiedProperty?: boolean;
  verifiedPhone?: boolean;
  available?: boolean;
  minimumRating?: number;
  sortBy?: SearchSort;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type TravelMode = 'driving' | 'walking' | 'bicycling' | 'transit';

export interface SmsMessage {
  to: string;
  body: string;
  purpose: OtpPurpose;
}

export interface SmsDeliveryResult {
  provider: string;
  messageId: string;
  acceptedAt: Date;
}

export interface SendOtpRequest {
  phone: string;
  /** Exists only in memory while an SMS is dispatched; never log or return it. */
  code: string;
  purpose: OtpPurpose;
}

export interface SmsProvider {
  send(message: SmsMessage): Promise<SmsDeliveryResult>;
  sendOtp(request: SendOtpRequest): Promise<void>;
}

export const OTP_PURPOSES = [
  'registration',
  'login',
  'phone_verification',
  'owner_verification',
  'password_reset',
] as const;

export type OtpPurpose = (typeof OTP_PURPOSES)[number];

export interface OtpDraft {
  /** Internal only. Never serialize this field into an API response or log it. */
  code: string;
  codeHash: string;
  expiresAt: Date;
}

export interface GeocodeResult {
  formattedAddress: string;
  coordinates: Coordinates;
  placeId?: string;
  city?: string;
  area?: string;
  country?: string;
}

export interface DistanceResult {
  origin: Coordinates;
  destination: Coordinates;
  distanceKm: number;
  durationMinutes?: number;
  mode: TravelMode;
  /** Road distance from a provider or a labelled great-circle fallback. */
  source: 'provider' | 'straight_line';
}

export interface MapsProvider {
  geocode(query: string): Promise<GeocodeResult[]>;
  reverseGeocode(coordinates: Coordinates): Promise<GeocodeResult[]>;
  distance(
    origin: Coordinates,
    destination: Coordinates,
    mode: TravelMode,
  ): Promise<DistanceResult>;
}

export interface SearchParseResult {
  filters: SafeSearchFilters;
  /** A short, safe summary suitable for UI; it is never treated as a query. */
  summary?: string;
}

export interface AssistantPlan {
  message: string;
  filters?: SafeSearchFilters;
  action?: AssistantAction;
}

export type AssistantAction =
  | { type: 'searchRooms'; filters: SafeSearchFilters }
  | { type: 'getRoomDetails'; roomId: string }
  | { type: 'getNearbyRooms'; origin: Coordinates; radiusKm: number }
  | { type: 'getDistance'; origin: Coordinates; destination: Coordinates; mode?: TravelMode }
  | { type: 'none' };

export interface AiProvider {
  parseSearch(input: string): Promise<SearchParseResult>;
  planAssistantReply(input: string, currentFilters?: SafeSearchFilters): Promise<AssistantPlan>;
}

/**
 * A controller supplies already-authorized, database-derived values.  The
 * recommendation service never opens a database connection by itself.
 */
export interface RecommendationCandidate {
  id: string;
  title: string;
  monthlyRent: number;
  propertyType?: PropertyType;
  roomType?: RoomType;
  furnished?: boolean;
  amenities?: AmenityKey[];
  distanceKm?: number;
  available?: boolean;
  rating?: number;
  verifiedProperty?: boolean;
  verifiedPhone?: boolean;
}

export interface RoomRecommendation {
  roomId: string;
  matchPercent: number;
  reasons: string[];
}

export interface UploadInput {
  originalName: string;
  mimeType: string;
  size: number;
  /** A multer memory-storage buffer is compatible with Uint8Array. */
  buffer: Uint8Array;
}

export interface ValidatedImageUpload extends UploadInput {
  safeName: string;
}

export interface StoredObject {
  key: string;
  provider: string;
  /** Undefined for the intentionally non-persistent development stub. */
  url?: string;
  persisted: boolean;
}

export interface StorageProvider {
  upload(file: ValidatedImageUpload): Promise<StoredObject>;
}
