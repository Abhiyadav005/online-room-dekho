import { api, unwrap } from './api';
import type { User, UserRole } from '../types';

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(credentials: { email: string; password: string }) {
    const response = await api.post('/auth/login', credentials);
    return unwrap<AuthResponse>(response.data);
  },
  async register(values: { name: string; email: string; phone: string; password: string; role: UserRole }) {
    const response = await api.post('/auth/register', values);
    return unwrap<AuthResponse>(response.data);
  },
  async logout() {
    await api.post('/auth/logout');
  },
  async sendOtp(phone: string, purpose = 'phone_verification') {
    const response = await api.post('/auth/send-otp', { phone, purpose });
    return unwrap<{ expiresAt?: string }>(response.data);
  },
  async verifyOtp(phone: string, otp: string, purpose = 'phone_verification') {
    const response = await api.post('/auth/verify-otp', { phone, otp, purpose });
    return unwrap<{ user?: User }>(response.data);
  },
  async requestReset(email: string) {
    const response = await api.post('/auth/forgot-password', { email });
    return unwrap<{ message?: string }>(response.data);
  },
  async resetPassword(token: string, password: string) {
    const response = await api.post('/auth/reset-password', { token, password });
    return unwrap<{ message?: string }>(response.data);
  },
};
