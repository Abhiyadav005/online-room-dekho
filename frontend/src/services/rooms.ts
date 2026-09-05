import { demoRooms } from '../data/demoRooms';
import type {
  ListingFormValues,
  Room,
  RoomPage,
  SearchFilters,
} from '../types';

import {
  api,
  shouldUseDemoFallback,
  unwrap,
} from './api';

/* ================================================================
   NORMALIZE ROOM DATA
================================================================ */

const normaliseRoom = (
  room: Room & { id?: string },
): Room => ({
  ...room,

  _id:
    room._id ||
    room.id ||
    crypto.randomUUID(),

  title: room.title || 'Room for Rent',

  description:
    room.description || '',

  propertyType:
    room.propertyType || 'room',

  roomType:
    room.roomType || 'single',

  monthlyRent:
    Number(room.monthlyRent || 0),

  facilities:
    room.facilities || [],

  images:
    room.images || [],

  availabilityStatus:
    room.availabilityStatus || 'available',

  verificationStatus:
    room.verificationStatus || 'pending',

  averageRating:
    Number(room.averageRating || 0),

  reviewCount:
    Number(room.reviewCount || 0),

  city:
    room.city || '',

  address:
    room.address || '',
});

/* ================================================================
   TEXT SEARCH
================================================================ */

const matchesTextSearch = (
  room: Room,
  filters: SearchFilters,
): boolean => {
  const query = filters.query
    ?.trim()
    .toLowerCase();

  if (!query) {
    return true;
  }

  const searchableText = [
    room.title,
    room.description,
    room.propertyType,
    room.roomType,
    room.city,
    room.area,
    room.landmark,
    room.address,
    ...(room.facilities || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  /*
   * Search every word instead of requiring the complete
   * query string to appear exactly.
   *
   * Example:
   * "room near college"
   *
   * can match a listing containing:
   * "room", "college", and "near".
   */

  const words = query
    .split(/\s+/)
    .filter(Boolean);

  return words.every((word) =>
    searchableText.includes(word),
  );
};

/* ================================================================
   FACILITY MATCH
================================================================ */

const matchesFacilities = (
  room: Room,
  filters: SearchFilters,
): boolean => {
  const selectedFacilities =
    filters.facilities || [];

  if (selectedFacilities.length === 0) {
    return true;
  }

  const roomFacilities =
    (room.facilities || []).map((facility) =>
      facility.toLowerCase(),
    );

  return selectedFacilities.every(
    (facility) =>
      roomFacilities.includes(
        facility.toLowerCase(),
      ),
  );
};

/* ================================================================
   DEMO FILTERING
================================================================ */

const demoFilter = (
  filters: SearchFilters,
): Room[] => {
  let values = demoRooms.filter((room) => {
    /* Text */
    if (!matchesTextSearch(room, filters)) {
      return false;
    }

    /* City */
    if (
      filters.city &&
      !room.city
        .toLowerCase()
        .includes(filters.city.toLowerCase())
    ) {
      return false;
    }

    /* Area */
    if (
      filters.area &&
      !(room.area || '')
        .toLowerCase()
        .includes(filters.area.toLowerCase())
    ) {
      return false;
    }

    /* Landmark */
    if (
      filters.landmark &&
      !(room.landmark || '')
        .toLowerCase()
        .includes(
          filters.landmark.toLowerCase(),
        )
    ) {
      return false;
    }

    /* Minimum rent */
    if (
      filters.minRent !== undefined &&
      room.monthlyRent < filters.minRent
    ) {
      return false;
    }

    /* Maximum rent */
    if (
      filters.maxRent !== undefined &&
      room.monthlyRent > filters.maxRent
    ) {
      return false;
    }

    /* Property type */
    if (
      filters.propertyType &&
      room.propertyType !==
        filters.propertyType
    ) {
      return false;
    }

    /* Room type */
    if (
      filters.roomType &&
      room.roomType !==
        filters.roomType
    ) {
      return false;
    }

    /* Tenant type */
    /*
     * Tenant type is mainly used by the real backend.
     * Demo listings remain available for all suitable
     * tenant categories unless a future listing explicitly
     * defines restrictions.
     */

    /* Furnishing */
    if (
      filters.furnishingStatus &&
      room.furnishingStatus !==
        filters.furnishingStatus
    ) {
      return false;
    }

    /*
     * Backward-compatible furnished filter.
     */
    if (
      filters.furnished === true &&
      room.furnishingStatus !==
        'furnished'
    ) {
      return false;
    }

    /* Gender preference */
    if (
      filters.genderPreference &&
      filters.genderPreference !== 'any' &&
      room.genderPreference !== 'any' &&
      room.genderPreference !==
        filters.genderPreference
    ) {
      return false;
    }

    /* Distance */
    if (
      filters.maxDistance !== undefined &&
      (room.distance ?? Infinity) >
        filters.maxDistance
    ) {
      return false;
    }

    /* Rating */
    if (
      filters.minRating !== undefined &&
      room.averageRating <
        filters.minRating
    ) {
      return false;
    }

    /* Verified property */
    if (
      filters.verified === true &&
      room.verificationStatus !==
        'verified'
    ) {
      return false;
    }

    /* Verified owner phone */
    if (
      filters.phoneVerified === true &&
      !room.owner?.phoneVerified
    ) {
      return false;
    }

    /* Availability */
    if (
      filters.availability &&
      room.availabilityStatus !==
        filters.availability
    ) {
      return false;
    }

    /* Minimum stay */
    if (
      filters.minimumStayDays !==
        undefined &&
      room.minimumStayDays !== undefined &&
      room.minimumStayDays >
        filters.minimumStayDays
    ) {
      return false;
    }

    /* Facilities */
    if (
      !matchesFacilities(room, filters)
    ) {
      return false;
    }

    return true;
  });

  /* ==============================================================
     SORTING
  ============================================================== */

  switch (filters.sort) {
    case 'rent_asc':
      values = values.sort(
        (a, b) =>
          a.monthlyRent -
          b.monthlyRent,
      );
      break;

    case 'rent_desc':
      values = values.sort(
        (a, b) =>
          b.monthlyRent -
          a.monthlyRent,
      );
      break;

    case 'nearest':
      values = values.sort(
        (a, b) =>
          (a.distance ?? Infinity) -
          (b.distance ?? Infinity),
      );
      break;

    case 'rating':
      values = values.sort(
        (a, b) =>
          b.averageRating -
          a.averageRating,
      );
      break;

    case 'newest':
      values = values.sort(
        (a, b) =>
          new Date(
            b.createdAt || 0,
          ).getTime() -
          new Date(
            a.createdAt || 0,
          ).getTime(),
      );
      break;

    case 'ai':
      values = values.sort(
        (a, b) =>
          (b.aiMatch ?? 0) -
          (a.aiMatch ?? 0),
      );
      break;

    case 'relevance':
    default:
      /*
       * Keep verified and highly-rated listings
       * naturally near the top.
       */
      values = values.sort(
        (a, b) => {
          const scoreA =
            (a.aiMatch ?? 0) +
            (a.verificationStatus ===
            'verified'
              ? 10
              : 0);

          const scoreB =
            (b.aiMatch ?? 0) +
            (b.verificationStatus ===
            'verified'
              ? 10
              : 0);

          return scoreB - scoreA;
        },
      );

      break;
  }

  return values;
};

/* ================================================================
   DEMO PAGINATION
================================================================ */

const demoPage = (
  filters: SearchFilters = {},
): RoomPage => {
  const all = demoFilter(filters);

  const page = Math.max(
    1,
    Number(filters.page || 1),
  );

  const limit = Math.max(
    1,
    Number(filters.limit || 12),
  );

  const start =
    (page - 1) * limit;

  const end =
    start + limit;

  return {
    items: all.slice(start, end),

    page,

    limit,

    total: all.length,

    totalPages: Math.max(
      1,
      Math.ceil(
        all.length / limit,
      ),
    ),
  };
};

/* ================================================================
   ROOM SERVICE
================================================================ */

export const roomService = {
  /* ==============================================================
     SEARCH ROOMS / FLATS
  ============================================================== */

  async search(
    filters: SearchFilters = {},
  ): Promise<RoomPage> {
    try {
      const response = await api.get(
        '/search/rooms',
        {
          params: filters,
        },
      );

      const data = unwrap<
        | RoomPage
        | {
            rooms?: Room[];
            items?: Room[];
            total?: number;
            page?: number;
            limit?: number;
            totalPages?: number;
          }
      >(response.data);

      const items =
        'items' in data
          ? data.items
          : data.rooms;

      /*
       * If backend responds successfully but
       * doesn't provide room items, use demo data.
       */
      if (!items) {
        return demoPage(filters);
      }

      return {
        items: items.map(
          normaliseRoom,
        ),

        total:
          data.total ??
          items.length,

        page:
          data.page ??
          Number(filters.page || 1),

        limit:
          data.limit ??
          Number(filters.limit || 12),

        totalPages:
          data.totalPages ??
          Math.max(
            1,
            Math.ceil(
              (data.total ??
                items.length) /
                (data.limit ??
                  Number(
                    filters.limit ||
                      12,
                  )),
            ),
          ),
      };
    } catch (error) {
      /*
       * During frontend development, if backend
       * is unavailable, automatically show demo
       * rooms instead of breaking the page.
       */
      if (
        shouldUseDemoFallback(error)
      ) {
        return demoPage(filters);
      }

      throw error;
    }
  },

  /* ==============================================================
     GET ROOM BY ID
  ============================================================== */

  async getById(
    id: string,
  ): Promise<Room> {
    try {
      const response =
        await api.get(
          `/rooms/${id}`,
        );

      return normaliseRoom(
        unwrap<Room>(
          response.data,
        ),
      );
    } catch (error) {
      const demoRoom =
        demoRooms.find(
          (room) =>
            room._id === id,
        );

      if (
        demoRoom &&
        shouldUseDemoFallback(
          error,
        )
      ) {
        return demoRoom;
      }

      throw error;
    }
  },

  /* ==============================================================
     OWNER — CREATE ROOM / FLAT
  ============================================================== */

  async create(
    values: ListingFormValues,
  ): Promise<Room> {
    const response =
      await api.post(
        '/rooms',
        values,
      );

    return normaliseRoom(
      unwrap<Room>(
        response.data,
      ),
    );
  },

  /* ==============================================================
     OWNER — UPDATE ROOM / FLAT
  ============================================================== */

  async update(
    id: string,
    values: ListingFormValues,
  ): Promise<Room> {
    const response =
      await api.put(
        `/rooms/${id}`,
        values,
      );

    return normaliseRoom(
      unwrap<Room>(
        response.data,
      ),
    );
  },

  /* ==============================================================
     OWNER — CHANGE AVAILABILITY
  ============================================================== */

  async changeAvailability(
    id: string,
    availabilityStatus:
      Room['availabilityStatus'],
  ) {
    const response =
      await api.patch(
        `/rooms/${id}/availability`,
        {
          availabilityStatus,
        },
      );

    return normaliseRoom(
      unwrap<Room>(
        response.data,
      ),
    );
  },

  /* ==============================================================
     OWNER — DELETE LISTING
  ============================================================== */

  async remove(
    id: string,
  ) {
    const response =
      await api.delete(
        `/rooms/${id}`,
      );

    return unwrap<{
      message?: string;
    }>(response.data);
  },

  /* ==============================================================
     AI SEARCH
  ============================================================== */

  async aiSearch(
    query: string,
  ): Promise<{
    filters: Partial<SearchFilters>;
    explanation?: string;
  }> {
    try {
      const response =
        await api.post(
          '/search/ai',
          {
            query,
          },
        );

      return unwrap<{
        filters: Partial<SearchFilters>;
        explanation?: string;
      }>(response.data);
    } catch (error) {
      if (
        !shouldUseDemoFallback(
          error,
        )
      ) {
        throw error;
      }

      const lower =
        query
          .toLowerCase()
          .trim();

      /*
       * Budget detection
       *
       * Examples:
       * "under 10000"
       * "below 15000"
       * "₹12000"
       * "12000 ke andar"
       */

      const rentMatch =
        lower.match(
          /(?:₹|rs\.?|under|below|within|budget)\s*(\d{4,6})/,
        ) ||
        lower.match(
          /(\d{4,6})\s*(?:ke andar|budget|tak)/,
        );

      const maxRent =
        rentMatch
          ? Number(
              rentMatch[1],
            )
          : undefined;

      /* Property */
      const propertyType =
        lower.includes('flat')
          ? 'flat'
          : lower.includes('house')
            ? 'house'
            : lower.includes('apartment')
              ? 'apartment'
              : lower.includes(
                    'room',
                  )
                ? 'room'
                : undefined;

      /* BHK */
      const roomType =
        lower.includes('3 bhk')
          ? '3bhk'
          : lower.includes('2 bhk')
            ? '2bhk'
            : lower.includes(
                  '1 bhk',
                )
              ? '1bhk'
              : lower.includes(
                    'shared',
                  )
                ? 'shared'
                : lower.includes(
                      'single',
                    )
                  ? 'single'
                  : undefined;

      /* Tenant */
      const tenantType =
        lower.includes('student')
          ? 'student'
          : lower.includes(
                'tourist',
              )
            ? 'tourist'
            : lower.includes(
                  'family',
                )
              ? 'family'
              : lower.includes(
                    'worker',
                  )
                ? 'worker'
                : lower.includes(
                      'professional',
                    ) ||
                    lower.includes(
                      'job',
                    )
                  ? 'professional'
                  : undefined;

      const filters: Partial<SearchFilters> =
        {
          maxRent,

          propertyType,

          roomType,

          tenantType,

          furnished:
            lower.includes(
              'furnished',
            ),

          facilities:
            lower.includes(
              'wifi',
            ) ||
            lower.includes(
              'wi-fi',
            )
              ? ['Wi-Fi']
              : [],

          city:
            lower.includes(
              'lucknow',
            )
              ? 'Lucknow'
              : undefined,

          sort: 'ai',
        };

      return {
        filters,

        explanation:
          'I converted your request into room type, property type, budget, tenant and facility filters. You can refine them anytime.',
      };
    }
  },

  /* ==============================================================
     AI RECOMMENDATIONS
  ============================================================== */

  async recommendations(
    filters: SearchFilters = {},
  ): Promise<Room[]> {
    try {
      const response =
        await api.post(
          '/ai/recommend',
          {
            filters,
          },
        );

      return unwrap<Room[]>(
        response.data,
      ).map(
        normaliseRoom,
      );
    } catch (error) {
      if (
        shouldUseDemoFallback(
          error,
        )
      ) {
        return demoFilter({
          ...filters,
          sort: 'ai',
        }).slice(0, 3);
      }

      throw error;
    }
  },
};