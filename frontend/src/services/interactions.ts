import { demoEnquiries, demoReviews, demoRooms } from '../data/demoRooms';
import type { Enquiry, Review, Room } from '../types';
import { api, shouldUseDemoFallback, unwrap } from './api';

export const interactionService = {
  async favourites(): Promise<Room[]> {
    try {
      const response = await api.get('/favourites');
      const data = unwrap<Room[] | { items: Room[] }>(response.data);
      return Array.isArray(data) ? data : data.items;
    } catch (error) {
      if (shouldUseDemoFallback(error)) return demoRooms.slice(0, 2);
      throw error;
    }
  },
  async toggleFavourite(roomId: string, active: boolean) {
    if (active) {
      const response = await api.post(`/favourites/${roomId}`);
      return unwrap<{ message?: string }>(response.data);
    }
    const response = await api.delete(`/favourites/${roomId}`);
    return unwrap<{ message?: string }>(response.data);
  },
  async reviews(roomId: string): Promise<Review[]> {
    try {
      const response = await api.get(`/rooms/${roomId}/reviews`);
      const data = unwrap<Review[] | { items: Review[] }>(response.data);
      return Array.isArray(data) ? data : data.items;
    } catch (error) {
      if (shouldUseDemoFallback(error)) return demoReviews;
      throw error;
    }
  },
  async addReview(roomId: string, values: { rating: number; comment: string }) {
    const response = await api.post(`/rooms/${roomId}/reviews`, values);
    return unwrap<Review>(response.data);
  },
  async reportRoom(roomId: string, values: { reason: string; detail?: string }) {
    const response = await api.post('/reports', { roomId, ...values });
    return unwrap<{ message?: string }>(response.data);
  },
  async sendEnquiry(roomId: string, values: { message: string; phone?: string }) {
    const response = await api.post('/enquiries', { roomId, ...values });
    return unwrap<Enquiry>(response.data);
  },
  async ownerEnquiries(): Promise<Enquiry[]> {
    try {
      const response = await api.get('/owner/enquiries');
      const data = unwrap<Enquiry[] | { items: Enquiry[] }>(response.data);
      return Array.isArray(data) ? data : data.items;
    } catch (error) {
      if (shouldUseDemoFallback(error)) return demoEnquiries;
      throw error;
    }
  },
};
