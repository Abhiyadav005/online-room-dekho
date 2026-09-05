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
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ================================================================
   AUTH TOKEN
================================================================ */

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('roomdekho_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/* ================================================================
   RESPONSE HANDLER
================================================================ */

api.interceptors.response.use(
  (response) => response,

  (error: AxiosError<ApiEnvelope<unknown>>) => {
    /*
     * If the backend returns 401, remove the invalid token.
     * We don't redirect automatically here because the UI/router
     * should decide what to show to the user.
     */
    if (error.response?.status === 401) {
      localStorage.removeItem('roomdekho_token');
    }

    return Promise.reject(error);
  },
);

/* ================================================================
   API RESPONSE UNWRAPPER
================================================================ */

export const unwrap = <T>(
  payload: ApiEnvelope<T> | T,
): T => {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'success' in payload
  ) {
    const envelope = payload as ApiEnvelope<T>;

    if (envelope.success === false) {
      throw new Error(
        envelope.message ||
          'The request could not be completed.',
      );
    }

    /*
     * Some backend endpoints may return:
     *
     * { success: true, data: {...} }
     *
     * while some may directly return data.
     */
    return envelope.data as T;
  }

  return payload as T;
};

/* ================================================================
   API ERROR MESSAGE
================================================================ */

export const apiMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string => {
  if (axios.isAxiosError(error)) {
    const axiosError =
      error as AxiosError<ApiEnvelope<unknown>>;

    const serverMessage =
      axiosError.response?.data?.message;

    if (serverMessage) {
      return serverMessage;
    }

    if (axiosError.code === 'ECONNABORTED') {
      return 'The server took too long to respond. Please try again.';
    }

    if (!axiosError.response) {
      return 'Unable to connect to the server. Please make sure the backend is running.';
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

/* ================================================================
   DEMO FALLBACK
================================================================ */

export const shouldUseDemoFallback = (
  error: unknown,
): boolean => {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  /*
   * No response means the backend is not reachable.
   * 404 means the requested API endpoint is unavailable.
   * 5xx means the backend failed.
   *
   * In these cases the frontend can safely use demo room data
   * where the calling feature supports it.
   */
  return (
    !error.response ||
    error.response.status === 404 ||
    error.response.status >= 500
  );
};

/* ================================================================
   AUTH HELPERS
================================================================ */

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem('roomdekho_token');
  },

  setToken(token: string): void {
    localStorage.setItem('roomdekho_token', token);
  },

  clearToken(): void {
    localStorage.removeItem('roomdekho_token');
  },

  isLoggedIn(): boolean {
    return Boolean(
      localStorage.getItem('roomdekho_token'),
    );
  },
};