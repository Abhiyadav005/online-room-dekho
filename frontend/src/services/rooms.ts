import { demoRooms } from '../data/demoRooms';
import type { ListingFormValues, Room, RoomPage, SearchFilters } from '../types';
import { api, shouldUseDemoFallback, unwrap } from './api';

const normaliseRoom = (room: Room & { id?: string }): Room => ({
  ...room,
  _id: room._id || room.id || crypto.randomUUID(),
  facilities: room.facilities || [],
  images: room.images || [],
  availabilityStatus: room.availabilityStatus || 'available',
  verificationStatus: room.verificationStatus || 'pending',
  averageRating: Number(room.averageRating || 0),
  reviewCount: Number(room.reviewCount || 0),
});

const demoFilter = (filters: SearchFilters): Room[] => {
  const query = `${filters.query || ''} ${filters.city || ''} ${filters.area || ''}`.trim().toLowerCase();
  const selectedFacilities = filters.facilities || [];
  let values = demoRooms.filter((room) => {
    const searchable = `${room.title} ${room.description} ${room.city} ${room.area} ${room.landmark}`.toLowerCase();
    if (query && !searchable.includes(query)) return false;
    if (filters.minRent && room.monthlyRent < filters.minRent) return false;
    if (filters.maxRent && room.monthlyRent > filters.maxRent) return false;
    if (filters.propertyType && room.propertyType !== filters.propertyType) return false;
    if (filters.roomType && room.roomType !== filters.roomType) return false;
    if (filters.furnished && room.furnishingStatus !== 'furnished') return false;
    if (filters.genderPreference && filters.genderPreference !== 'any' && room.genderPreference !== 'any' && room.genderPreference !== filters.genderPreference) return false;
    if (filters.maxDistance && (room.distance || 0) > filters.maxDistance) return false;
    if (filters.minRating && room.averageRating < filters.minRating) return false;
    if (filters.verified && room.verificationStatus !== 'verified') return false;
    if (filters.phoneVerified && !room.owner?.phoneVerified) return false;
    if (filters.availability && room.availabilityStatus !== filters.availability) return false;
    return selectedFacilities.every((facility) => room.facilities.some((item) => item.toLowerCase() === facility.toLowerCase()));
  });
  switch (filters.sort) {
    case 'rent_asc': values = values.sort((a, b) => a.monthlyRent - b.monthlyRent); break;
    case 'rent_desc': values = values.sort((a, b) => b.monthlyRent - a.monthlyRent); break;
    case 'nearest': values = values.sort((a, b) => (a.distance || 999) - (b.distance || 999)); break;
    case 'rating': values = values.sort((a, b) => b.averageRating - a.averageRating); break;
    case 'newest': values = values.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()); break;
    case 'ai': values = values.sort((a, b) => (b.aiMatch || 0) - (a.aiMatch || 0)); break;
  }
  return values;
};

const demoPage = (filters: SearchFilters = {}): RoomPage => {
  const all = demoFilter(filters);
  const page = Number(filters.page || 1);
  const limit = Number(filters.limit || 12);
  return { items: all.slice((page - 1) * limit, page * limit), page, limit, total: all.length, totalPages: Math.max(1, Math.ceil(all.length / limit)) };
};

export const roomService = {
  async search(filters: SearchFilters = {}): Promise<RoomPage> {
    try {
      const response = await api.get('/search/rooms', { params: filters });
      const data = unwrap<RoomPage | { rooms?: Room[]; items?: Room[]; total?: number; page?: number; limit?: number; totalPages?: number }>(response.data);
      const items = 'items' in data ? data.items : data.rooms;
      if (!items) return demoPage(filters);
      return {
        items: items.map(normaliseRoom),
        total: data.total ?? items.length,
        page: data.page ?? 1,
        limit: data.limit ?? items.length,
        totalPages: data.totalPages ?? 1,
      };
    } catch (error) {
      if (shouldUseDemoFallback(error)) return demoPage(filters);
      throw error;
    }
  },
  async getById(id: string): Promise<Room> {
    try {
      const response = await api.get(`/rooms/${id}`);
      return normaliseRoom(unwrap<Room>(response.data));
    } catch (error) {
      const room = demoRooms.find((item) => item._id === id);
      if (room && shouldUseDemoFallback(error)) return room;
      throw error;
    }
  },
  async create(values: ListingFormValues): Promise<Room> {
    const response = await api.post('/rooms', values);
    return normaliseRoom(unwrap<Room>(response.data));
  },
  async update(id: string, values: ListingFormValues): Promise<Room> {
    const response = await api.put(`/rooms/${id}`, values);
    return normaliseRoom(unwrap<Room>(response.data));
  },
  async changeAvailability(id: string, availabilityStatus: Room['availabilityStatus']) {
    const response = await api.patch(`/rooms/${id}/availability`, { availabilityStatus });
    return unwrap<Room>(response.data);
  },
  async remove(id: string) {
    const response = await api.delete(`/rooms/${id}`);
    return unwrap<{ message?: string }>(response.data);
  },
  async aiSearch(query: string): Promise<{ filters: Partial<SearchFilters>; explanation?: string }> {
    try {
      const response = await api.post('/search/ai', { query });
      return unwrap<{ filters: Partial<SearchFilters>; explanation?: string }>(response.data);
    } catch (error) {
      if (!shouldUseDemoFallback(error)) throw error;
      const lower = query.toLowerCase();
      const rent = lower.match(/(?:₹|rs\.?|under|within|below)\s*(\d{4,5})/) || lower.match(/(\d{4,5})\s*(?:ke andar|budget)/);
      const filters: Partial<SearchFilters> = {
        maxRent: rent ? Number(rent[1]) : undefined,
        furnished: lower.includes('furnished'),
        facilities: lower.includes('wifi') || lower.includes('wi-fi') ? ['Wi-Fi'] : [],
        city: lower.includes('lucknow') ? 'Lucknow' : undefined,
        sort: 'ai',
      };
      return { filters, explanation: 'I turned your request into budget, furnishing and facility filters. Refine them any time.' };
    }
  },
  async recommendations(filters: SearchFilters = {}) {
    try {
      const response = await api.post('/ai/recommend', { filters });
      return unwrap<Room[]>(response.data).map(normaliseRoom);
    } catch (error) {
      if (shouldUseDemoFallback(error)) return demoFilter({ ...filters, sort: 'ai' }).slice(0, 3);
      throw error;
    }
  },
};
