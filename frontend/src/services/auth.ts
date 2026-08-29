import { api, unwrap } from './api';
import type { User, UserRole } from '../types';

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(credentials: {
    email: string;
    password: string;
    role: UserRole;
  }) {
    const response = await api.post('/api/auth/login', credentials);
    return unwrap<AuthResponse>(response.data);
  },

  async registerUser(values: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) {
    const response = await api.post('/api/auth/register', {
      ...values,
      role: 'user',
    });

    return unwrap<AuthResponse>(response.data);
  },

  async registerOwner(values: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) {
    const response = await api.post('/api/auth/register', {
      ...values,
      role: 'owner',
    });

    return unwrap<AuthResponse>(response.data);
  },

  async logout() {
    await api.post('/api/auth/logout');
  },

  async sendOtp(
    phone: string,
    purpose = 'phone_verification'
  ) {
    const response = await api.post('/api/auth/send-otp', {
      phone,
      purpose,
    });

    return unwrap<{ expiresAt?: string }>(response.data);
  },

  async verifyOtp(
    phone: string,
    otp: string,
    purpose = 'phone_verification'
  ) {
    const response = await api.post('/api/auth/verify-otp', {
      phone,
      otp,
      purpose,
    });

    return unwrap<{ user?: User }>(response.data);
  },

  async requestReset(phone: string) {
    const response = await api.post('/api/auth/forgot-password', {
      phone,
    });

    return unwrap<{ message?: string }>(response.data);
  },

  async resetPassword(
    phone: string,
    otp: string,
    password: string
  ) {
    const response = await api.post('/api/auth/reset-password', {
      phone,
      otp,
      password,
    });

    return unwrap<AuthResponse>(response.data);
  },
};