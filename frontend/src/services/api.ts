import axios, { AxiosError } from 'axios';

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  message?: string;
  code?: string;
}

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL,
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('roomdekho_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const unwrap = <T>(payload: ApiEnvelope<T> | T): T => {
  if (typeof payload === 'object' && payload !== null && 'success' in payload) {
    const envelope = payload as ApiEnvelope<T>;
    if (envelope.success === false) throw new Error(envelope.message || 'The request could not be completed.');
    return envelope.data as T;
  }
  return payload as T;
};

export const apiMessage = (error: unknown, fallback = 'Something went wrong. Please try again.') => {
  const axiosError = error as AxiosError<ApiEnvelope<unknown>>;
  return axiosError.response?.data?.message || (error instanceof Error ? error.message : fallback);
};

export const shouldUseDemoFallback = (error: unknown) => {
  const axiosError = error as AxiosError;
  return !axiosError.response || axiosError.response.status >= 500 || axiosError.response.status === 404;
};
