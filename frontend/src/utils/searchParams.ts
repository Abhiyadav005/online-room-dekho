import type { SearchFilters } from '../types';

/* ================================================================
   SEARCH PARAMETER KEYS
================================================================ */

const filterKeys: (keyof SearchFilters)[] = [
  'query',
  'city',
  'area',
  'landmark',
  'minRent',
  'maxRent',
  'propertyType',
  'roomType',
  'tenantType',
  'furnishingStatus',
  'furnished',
  'genderPreference',
  'maxDistance',
  'minRating',
  'verified',
  'phoneVerified',
  'availability',
  'minimumStayDays',
  'sort',
  'page',
  'limit',
];

/* ================================================================
   HELPERS
================================================================ */

const getString = (
  params: URLSearchParams,
  key: string,
): string | undefined => {
  const value = params.get(key);

  if (!value || value.trim() === '') {
    return undefined;
  }

  return value.trim();
};

const getNumber = (
  params: URLSearchParams,
  key: string,
): number | undefined => {
  const value = getString(params, key);

  if (!value) {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
};

const getBoolean = (
  params: URLSearchParams,
  key: string,
): boolean | undefined => {
  const value = getString(params, key);

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return undefined;
};

/* ================================================================
   URL PARAMS → SEARCH FILTERS
================================================================ */

export const filtersFromParams = (
  params: URLSearchParams,
): SearchFilters => {
  return {
    query: getString(params, 'query'),

    city: getString(params, 'city'),

    area: getString(params, 'area'),

    landmark: getString(params, 'landmark'),

    minRent: getNumber(params, 'minRent'),

    maxRent: getNumber(params, 'maxRent'),

    propertyType: getString(params, 'propertyType'),

    roomType: getString(params, 'roomType'),

    tenantType:
      getString(params, 'tenantType') as
        | SearchFilters['tenantType']
        | undefined,

    furnishingStatus:
      getString(params, 'furnishingStatus') as
        | SearchFilters['furnishingStatus']
        | undefined,

    furnished: getBoolean(params, 'furnished'),

    genderPreference:
      getString(params, 'genderPreference') as
        | SearchFilters['genderPreference']
        | undefined,

    maxDistance: getNumber(params, 'maxDistance'),

    minRating: getNumber(params, 'minRating'),

    verified: getBoolean(params, 'verified'),

    phoneVerified: getBoolean(params, 'phoneVerified'),

    availability:
      getString(params, 'availability') as
        | SearchFilters['availability']
        | undefined,

    minimumStayDays: getNumber(
      params,
      'minimumStayDays',
    ),

    facilities: params
      .getAll('facility')
      .filter(Boolean),

    sort:
      (getString(params, 'sort') as SearchFilters['sort']) ||
      'relevance',

    page: getNumber(params, 'page') || 1,

    limit: getNumber(params, 'limit') || 12,
  };
};

/* ================================================================
   SEARCH FILTERS → URL PARAMS
================================================================ */

export const paramsFromFilters = (
  filters: SearchFilters,
): URLSearchParams => {
  const params = new URLSearchParams();

  filterKeys.forEach((key) => {
    const value = filters[key];

    if (
      value === undefined ||
      value === null ||
      value === '' ||
      value === false
    ) {
      return;
    }

    /*
     * Facilities are handled separately below because
     * multiple facilities can have the same query key.
     */
    if (key === 'facilities') {
      return;
    }

    params.set(key, String(value));
  });

  /* ==============================================================
     MULTIPLE FACILITIES
  ============================================================== */

  filters.facilities?.forEach((facility) => {
    if (facility.trim()) {
      params.append('facility', facility.trim());
    }
  });

  return params;
};

/* ================================================================
   BUILD SEARCH URL
================================================================ */

export const buildSearchQuery = (
  filters: SearchFilters,
): string => {
  const params = paramsFromFilters(filters);

  const queryString = params.toString();

  return queryString ? `?${queryString}` : '';
};

/* ================================================================
   NORMALIZE SEARCH FILTERS
================================================================ */

export const normalizeSearchFilters = (
  filters: SearchFilters,
): SearchFilters => {
  return {
    ...filters,

    query: filters.query?.trim() || undefined,

    city: filters.city?.trim() || undefined,

    area: filters.area?.trim() || undefined,

    landmark: filters.landmark?.trim() || undefined,

    minRent:
      filters.minRent !== undefined &&
      Number.isFinite(filters.minRent)
        ? Math.max(0, filters.minRent)
        : undefined,

    maxRent:
      filters.maxRent !== undefined &&
      Number.isFinite(filters.maxRent)
        ? Math.max(0, filters.maxRent)
        : undefined,

    maxDistance:
      filters.maxDistance !== undefined &&
      Number.isFinite(filters.maxDistance)
        ? Math.max(0, filters.maxDistance)
        : undefined,

    minRating:
      filters.minRating !== undefined &&
      Number.isFinite(filters.minRating)
        ? Math.min(
            5,
            Math.max(0, filters.minRating),
          )
        : undefined,

    minimumStayDays:
      filters.minimumStayDays !== undefined &&
      Number.isFinite(filters.minimumStayDays)
        ? Math.max(1, filters.minimumStayDays)
        : undefined,

    facilities: filters.facilities?.filter(
      (facility) => facility.trim().length > 0,
    ),

    page: Math.max(1, filters.page || 1),

    limit: Math.min(
      100,
      Math.max(1, filters.limit || 12),
    ),
  };
};

/* ================================================================
   CLEAR PAGINATION WHEN FILTERS CHANGE
================================================================ */

export const resetSearchPagination = (
  filters: SearchFilters,
): SearchFilters => {
  return {
    ...filters,
    page: 1,
  };
};