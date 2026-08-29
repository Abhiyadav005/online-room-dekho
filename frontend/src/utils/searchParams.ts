import type { SearchFilters } from '../types';

const keys: (keyof SearchFilters)[] = ['query', 'city', 'area', 'minRent', 'maxRent', 'propertyType', 'roomType', 'furnished', 'genderPreference', 'maxDistance', 'minRating', 'verified', 'phoneVerified', 'availability', 'sort', 'page', 'limit'];

export const filtersFromParams = (params: URLSearchParams): SearchFilters => {
  const raw = Object.fromEntries(params.entries());
  const asNumber = (name: string) => raw[name] ? Number(raw[name]) : undefined;
  const asBoolean = (name: string) => raw[name] === 'true' ? true : undefined;
  return {
    query: raw.query || undefined, city: raw.city || undefined, area: raw.area || undefined,
    minRent: asNumber('minRent'), maxRent: asNumber('maxRent'), propertyType: raw.propertyType || undefined, roomType: raw.roomType || undefined,
    furnished: asBoolean('furnished'), genderPreference: raw.genderPreference || undefined, maxDistance: asNumber('maxDistance'), minRating: asNumber('minRating'),
    verified: asBoolean('verified'), phoneVerified: asBoolean('phoneVerified'), availability: raw.availability as SearchFilters['availability'] || undefined,
    facilities: params.getAll('facility'), sort: raw.sort as SearchFilters['sort'] || 'relevance', page: asNumber('page') || 1, limit: asNumber('limit') || 12,
  };
};

export const paramsFromFilters = (filters: SearchFilters) => {
  const params = new URLSearchParams();
  keys.forEach((key) => {
    const value = filters[key];
    if (value !== undefined && value !== '' && value !== false) params.set(key, String(value));
  });
  filters.facilities?.forEach((facility) => params.append('facility', facility));
  return params;
};
