import { IntegrationError } from '../errors';
import type {
  AmenityKey,
  AssistantAction,
  AssistantPlan,
  Coordinates,
  GenderPreference,
  PropertyType,
  RoomType,
  SafeSearchFilters,
  SearchParseResult,
  SearchSort,
  TravelMode,
} from '../../types/integrations';
import {
  AMENITY_KEYS,
  GENDER_PREFERENCES,
  PROPERTY_TYPES,
  ROOM_TYPES,
  SEARCH_SORTS,
} from '../../types/integrations';

const MAX_LOCATION_LENGTH = 120;
const MAX_INPUT_LENGTH = 1_500;
const MAX_RENT = 500_000;
const MAX_DISTANCE_KM = 100;

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasOwn = (record: UnknownRecord, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(record, key);

const normalizeSearchText = (value: string, label: string, maxLength: number): string => {
  const text = value.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text || text.length > maxLength || /[$][a-zA-Z_]|[{}[\]\\]/.test(text)) {
    throw new IntegrationError('INVALID_AI_INPUT', `Invalid ${label}.`, { statusCode: 400 });
  }
  return text;
};

const enumValue = <T extends readonly string[]>(value: unknown, allowed: T): T[number] | undefined => {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().toLowerCase();
  return (allowed as readonly string[]).includes(normalized) ? (normalized as T[number]) : undefined;
};

const enumValues = <T extends readonly string[]>(value: unknown, allowed: T): T[number][] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const entries = [...new Set(value.map((item) => enumValue(item, allowed)).filter(Boolean))] as T[number][];
  return entries.length > 0 ? entries : undefined;
};

const finiteNumber = (value: unknown, name: string, min: number, max: number): number | undefined => {
  if (value === undefined) return undefined;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw new IntegrationError('INVALID_AI_INPUT', `Invalid ${name}.`, { statusCode: 400 });
  }
  return value;
};

const booleanValue = (value: unknown, name: string): boolean | undefined => {
  if (value === undefined) return undefined;
  if (typeof value !== 'boolean') {
    throw new IntegrationError('INVALID_AI_INPUT', `Invalid ${name}.`, { statusCode: 400 });
  }
  return value;
};

/**
 * Whitelists and bounds AI output before a controller can translate it into a
 * Mongo query. Unknown keys and all query operators are discarded.
 */
export function validateSearchFilters(value: unknown): SafeSearchFilters {
  if (!isRecord(value)) {
    throw new IntegrationError('INVALID_AI_INPUT', 'AI filters must be an object.', { statusCode: 400 });
  }

  const filters: SafeSearchFilters = {};
  if (hasOwn(value, 'city') && value.city !== undefined) {
    if (typeof value.city !== 'string') throw new IntegrationError('INVALID_AI_INPUT', 'Invalid city.', { statusCode: 400 });
    filters.city = normalizeSearchText(value.city, 'city', MAX_LOCATION_LENGTH);
  }
  if (hasOwn(value, 'location') && value.location !== undefined) {
    if (typeof value.location !== 'string') throw new IntegrationError('INVALID_AI_INPUT', 'Invalid location.', { statusCode: 400 });
    filters.location = normalizeSearchText(value.location, 'location', MAX_LOCATION_LENGTH);
  }

  const minRent = finiteNumber(value.minRent, 'minimum rent', 0, MAX_RENT);
  const maxRent = finiteNumber(value.maxRent, 'maximum rent', 0, MAX_RENT);
  if (minRent !== undefined) filters.minRent = Math.round(minRent);
  if (maxRent !== undefined) filters.maxRent = Math.round(maxRent);
  if (filters.minRent !== undefined && filters.maxRent !== undefined && filters.minRent > filters.maxRent) {
    throw new IntegrationError('INVALID_AI_INPUT', 'Minimum rent cannot exceed maximum rent.', { statusCode: 400 });
  }

  const propertyTypes = enumValues(value.propertyTypes, PROPERTY_TYPES);
  if (value.propertyTypes !== undefined && !propertyTypes) {
    throw new IntegrationError('INVALID_AI_INPUT', 'Invalid property type.', { statusCode: 400 });
  }
  if (propertyTypes) filters.propertyTypes = propertyTypes as PropertyType[];

  const roomTypes = enumValues(value.roomTypes, ROOM_TYPES);
  if (value.roomTypes !== undefined && !roomTypes) {
    throw new IntegrationError('INVALID_AI_INPUT', 'Invalid room type.', { statusCode: 400 });
  }
  if (roomTypes) filters.roomTypes = roomTypes as RoomType[];

  const amenities = enumValues(value.amenities, AMENITY_KEYS);
  if (value.amenities !== undefined && !amenities) {
    throw new IntegrationError('INVALID_AI_INPUT', 'Invalid amenity.', { statusCode: 400 });
  }
  if (amenities) filters.amenities = amenities as AmenityKey[];

  const genderPreference = enumValue(value.genderPreference, GENDER_PREFERENCES);
  if (value.genderPreference !== undefined && !genderPreference) {
    throw new IntegrationError('INVALID_AI_INPUT', 'Invalid gender preference.', { statusCode: 400 });
  }
  if (genderPreference) filters.genderPreference = genderPreference as GenderPreference;

  const sortBy = enumValue(value.sortBy, SEARCH_SORTS);
  if (value.sortBy !== undefined && !sortBy) {
    throw new IntegrationError('INVALID_AI_INPUT', 'Invalid sort option.', { statusCode: 400 });
  }
  if (sortBy) filters.sortBy = sortBy as SearchSort;

  const maxDistanceKm = finiteNumber(value.maxDistanceKm, 'maximum distance', 0.1, MAX_DISTANCE_KM);
  if (maxDistanceKm !== undefined) filters.maxDistanceKm = maxDistanceKm;
  const minimumRating = finiteNumber(value.minimumRating, 'minimum rating', 0, 5);
  if (minimumRating !== undefined) filters.minimumRating = minimumRating;

  const furnished = booleanValue(value.furnished, 'furnished setting');
  const verifiedProperty = booleanValue(value.verifiedProperty, 'property verification setting');
  const verifiedPhone = booleanValue(value.verifiedPhone, 'phone verification setting');
  const available = booleanValue(value.available, 'availability setting');
  if (furnished !== undefined) filters.furnished = furnished;
  if (verifiedProperty !== undefined) filters.verifiedProperty = verifiedProperty;
  if (verifiedPhone !== undefined) filters.verifiedPhone = verifiedPhone;
  if (available !== undefined) filters.available = available;

  return filters;
}

export function mergeSafeSearchFilters(
  current: SafeSearchFilters | undefined,
  next: SafeSearchFilters,
): SafeSearchFilters {
  const base = current ? validateSearchFilters(current) : {};
  const update = validateSearchFilters(next);
  return validateSearchFilters({
    ...base,
    ...update,
    propertyTypes: update.propertyTypes ?? base.propertyTypes,
    roomTypes: update.roomTypes ?? base.roomTypes,
    amenities: update.amenities ?? base.amenities,
  });
}

const parseAmount = (raw: string, suffix: string | undefined): number | undefined => {
  const number = Number(raw.replace(/,/g, ''));
  const amount = suffix?.toLowerCase() === 'k' ? number * 1_000 : number;
  return Number.isFinite(amount) && amount >= 500 && amount <= MAX_RENT ? Math.round(amount) : undefined;
};

const extractFirstAmount = (text: string, patterns: RegExp[]): number | undefined => {
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      const amount = parseAmount(match[1], match[2]);
      if (amount !== undefined) return amount;
    }
  }
  return undefined;
};

const PROPERTY_MATCHES: Array<[RegExp, PropertyType]> = [
  [/\b(?:shared\s+(?:accommodation|room)|sharing)\b/i, 'shared_accommodation'],
  [/\b1\s*bhk\b/i, '1bhk'],
  [/\b2\s*bhk\b/i, '2bhk'],
  [/\b3\s*bhk\b/i, '3bhk'],
  [/\bapartment\b/i, 'apartment'],
  [/\bhostel\b/i, 'hostel'],
  [/\b(?:pg|paying guest)\b/i, 'pg'],
  [/\bflat\b/i, 'flat'],
  [/\broom\b/i, 'room'],
];

const ROOM_MATCHES: Array<[RegExp, RoomType]> = [
  [/\bsingle\b/i, 'single'],
  [/\bdouble\b/i, 'double'],
  [/\btriple\b/i, 'triple'],
  [/\bshared\b/i, 'shared'],
  [/\bprivate\b/i, 'private'],
];

const AMENITY_MATCHES: Array<[RegExp, AmenityKey]> = [
  [/\bwi[-\s]?fi\b/i, 'wifi'],
  [/\bparking\b/i, 'parking'],
  [/\b(?:air\s*conditioning|a\/c|\bac\b)\b/i, 'ac'],
  [/\bcooler\b/i, 'cooler'],
  [/\b(?:washing machine|washer)\b/i, 'washing_machine'],
  [/\bkitchen\b/i, 'kitchen'],
  [/\bbalcony\b/i, 'balcony'],
  [/\bpower\s*backup\b/i, 'power_backup'],
  [/\bcctv\b/i, 'cctv'],
  [/\bsecurity\b/i, 'security'],
  [/\bfood\b/i, 'food'],
  [/\bwater\b/i, 'water'],
  [/\belectricity\b/i, 'electricity'],
];

const cleanLocation = (value: string): string | undefined => {
  const cleaned = value
    .replace(/\b(?:i need|i want|mujhe|room|pg|flat|hostel|furnished|unfurnished|with|without)\b/gi, ' ')
    .replace(/\b(?:under|within|below|less than|budget|rent|for|nearby)\b.*$/i, ' ')
    .replace(/\b\d+(?:\.\d+)?\s*(?:km|kilometers?|k)\b.*$/i, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned || cleaned.length > MAX_LOCATION_LENGTH || /[$][a-zA-Z_]|[{}[\]\\]/.test(cleaned)) {
    return undefined;
  }
  return cleaned;
};

/** A deterministic, credential-free parser used in development and as a safe fallback. */
export function parseRuleBasedSearch(input: string): SearchParseResult {
  const text = normalizeSearchText(input, 'search request', MAX_INPUT_LENGTH);
  const lower = text.toLowerCase();
  const raw: Record<string, unknown> = {};

  const between = /\b(?:between|from)\s*(?:₹|rs\.?|inr)?\s*(\d[\d,]*)(k)?\s*(?:and|to|[-–])\s*(?:₹|rs\.?|inr)?\s*(\d[\d,]*)(k)?\b/i.exec(lower);
  if (between) {
    const first = parseAmount(between[1], between[2]);
    const second = parseAmount(between[3], between[4]);
    if (first !== undefined && second !== undefined) {
      raw.minRent = Math.min(first, second);
      raw.maxRent = Math.max(first, second);
    }
  } else {
    const maxRent = extractFirstAmount(lower, [
      /(?:under|within|below|less than|max(?:imum)?|budget(?:\s+of)?)\s*(?:₹|rs\.?|inr)?\s*(\d[\d,]*)(k)?\b/i,
      /(?:₹|rs\.?|inr)?\s*(\d[\d,]*)(k)?\s*(?:ke\s*)?(?:andar|tak|or less|or below|maximum)\b/i,
      /(?:rent|budget|price)\D{0,16}(\d[\d,]*)(k)?\b/i,
    ]);
    const minRent = extractFirstAmount(lower, [
      /(?:above|over|more than|at least|min(?:imum)?)\s*(?:₹|rs\.?|inr)?\s*(\d[\d,]*)(k)?\b/i,
      /(?:₹|rs\.?|inr)?\s*(\d[\d,]*)(k)?\s*(?:se\s*)?(?:zyada|adhik|or more)\b/i,
    ]);
    if (maxRent !== undefined) raw.maxRent = maxRent;
    if (minRent !== undefined) raw.minRent = minRent;

    // A bare budget such as "7000" is common during assistant follow-ups.
    if (maxRent === undefined && minRent === undefined && /^\s*(?:₹|rs\.?|inr)?\s*\d[\d,]*(?:k)?\s*$/i.test(text)) {
      const bare = /(?:₹|rs\.?|inr)?\s*(\d[\d,]*)(k)?/i.exec(text);
      if (bare) raw.maxRent = parseAmount(bare[1], bare[2]);
    }
  }

  const propertyTypes = PROPERTY_MATCHES.filter(([pattern]) => pattern.test(lower)).map(([, value]) => value);
  if (propertyTypes.length) raw.propertyTypes = propertyTypes;
  const roomTypes = ROOM_MATCHES.filter(([pattern]) => pattern.test(lower)).map(([, value]) => value);
  if (roomTypes.length) raw.roomTypes = roomTypes;
  const amenities = AMENITY_MATCHES.filter(([pattern]) => pattern.test(lower)).map(([, value]) => value);
  if (amenities.length) raw.amenities = amenities;

  if (/\b(?:unfurnished|without furniture)\b/i.test(lower)) raw.furnished = false;
  else if (/\b(?:furnished|semi[-\s]?furnished)\b/i.test(lower)) raw.furnished = true;

  if (/\b(?:girls?|women|female)\b/i.test(lower)) raw.genderPreference = 'female';
  else if (/\b(?:boys?|men|male)\b/i.test(lower)) raw.genderPreference = 'male';
  else if (/\b(?:any gender|co[-\s]?ed|all genders)\b/i.test(lower)) raw.genderPreference = 'any';

  const distanceMatch = /\b(\d+(?:\.\d+)?)\s*(?:km|kilomet(?:er|re)s?)\b/i.exec(lower);
  if (distanceMatch) {
    const distance = Number(distanceMatch[1]);
    if (Number.isFinite(distance) && distance > 0 && distance <= MAX_DISTANCE_KM) raw.maxDistanceKm = distance;
  }
  const ratingMatch = /\b([1-5](?:\.\d)?)\s*(?:star|stars|rating)\b/i.exec(lower);
  if (ratingMatch) raw.minimumRating = Number(ratingMatch[1]);

  if (/\b(?:verified property|property verified)\b/i.test(lower)) raw.verifiedProperty = true;
  if (/\b(?:verified phone|phone verified)\b/i.test(lower)) raw.verifiedPhone = true;
  if (/\b(?:available|vacant|immediately)\b/i.test(lower)) raw.available = true;

  if (/\b(?:cheapest|lowest rent|low to high)\b/i.test(lower)) raw.sortBy = 'rent_asc';
  else if (/\b(?:highest rent|high to low)\b/i.test(lower)) raw.sortBy = 'rent_desc';
  else if (/\b(?:nearest|closest)\b/i.test(lower)) raw.sortBy = 'nearest';
  else if (/\b(?:highest rated|best rated)\b/i.test(lower)) raw.sortBy = 'rating_desc';
  else if (/\b(?:newest|latest)\b/i.test(lower)) raw.sortBy = 'newest';

  const beforeNear = /\b(.{2,80}?)\s+(?:ke\s+)?paas\b/i.exec(text)?.[1];
  const afterNear = /\b(?:near|nearby|close to|around)\s+(.{2,80}?)(?=$|[,.;]|\b(?:with|under|within|below|for|furnished|unfurnished)\b)/i.exec(text)?.[1];
  const location = cleanLocation(beforeNear ?? afterNear ?? '');
  if (location) raw.location = location;

  return { filters: validateSearchFilters(raw) };
}

const validateCoordinates = (value: unknown): Coordinates | undefined => {
  if (!isRecord(value)) return undefined;
  const latitude = value.latitude;
  const longitude = value.longitude;
  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180
  ) return undefined;
  return { latitude, longitude };
};

const validateTravelMode = (value: unknown): TravelMode | undefined =>
  value === 'driving' || value === 'walking' || value === 'bicycling' || value === 'transit'
    ? value
    : undefined;

export function validateAssistantAction(value: unknown): AssistantAction | undefined {
  if (!isRecord(value) || typeof value.type !== 'string') return undefined;
  switch (value.type) {
    case 'none':
      return { type: 'none' };
    case 'searchRooms':
      return isRecord(value.filters) ? { type: 'searchRooms', filters: validateSearchFilters(value.filters) } : undefined;
    case 'getRoomDetails':
      return typeof value.roomId === 'string' && /^[a-f\d]{24}$/i.test(value.roomId)
        ? { type: 'getRoomDetails', roomId: value.roomId }
        : undefined;
    case 'getNearbyRooms': {
      const origin = validateCoordinates(value.origin);
      const radiusKm = finiteNumber(value.radiusKm, 'radius', 0.1, MAX_DISTANCE_KM);
      return origin && radiusKm !== undefined ? { type: 'getNearbyRooms', origin, radiusKm } : undefined;
    }
    case 'getDistance': {
      const origin = validateCoordinates(value.origin);
      const destination = validateCoordinates(value.destination);
      const mode = validateTravelMode(value.mode);
      return origin && destination
        ? { type: 'getDistance', origin, destination, ...(mode ? { mode } : {}) }
        : undefined;
    }
    default:
      return undefined;
  }
}

export function validateAssistantPlan(value: unknown): AssistantPlan {
  if (!isRecord(value) || typeof value.message !== 'string') {
    throw new IntegrationError('AI_RESPONSE_INVALID', 'AI provider returned an invalid assistant response.', {
      statusCode: 502,
    });
  }
  const message = value.message.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!message || message.length > 500) {
    throw new IntegrationError('AI_RESPONSE_INVALID', 'AI provider returned an invalid assistant response.', {
      statusCode: 502,
    });
  }

  const filters = value.filters === undefined ? undefined : validateSearchFilters(value.filters);
  const action = value.action === undefined ? undefined : validateAssistantAction(value.action);
  return {
    message,
    ...(filters ? { filters } : {}),
    ...(action ? { action } : {}),
  };
}
