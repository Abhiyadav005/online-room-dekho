import axios, { AxiosError } from 'axios';

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  message?: string;
  code?: string;
  details?: {
    fieldErrors?: Record<string, string[]>;
    formErrors?: string[];
  };
}

const getBaseUrl = (): string => {
  const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (!envUrl) return '/api';
  const clean = envUrl.replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

const baseURL = getBaseUrl();
const authTokenKey = 'roomdekho_token';

const getStoredToken = (): string | null => {
  try {
    const token = localStorage.getItem(authTokenKey);
    return token && token.trim() ? token.trim() : null;
  } catch {
    return null;
  }
};

const applyAuthToken = (token: string | null): void => {
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete axios.defaults.headers.common.Authorization;
};

export const api = axios.create({
  baseURL,
  timeout: 12000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

applyAuthToken(getStoredToken());

/* ================================================================
   AUTH TOKEN
================================================================ */

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
      applyAuthToken(token);
    } else {
      delete config.headers?.Authorization;
      applyAuthToken(null);
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

  async (error: AxiosError<ApiEnvelope<unknown>>) => {
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean });

    // If 401 occurs and this request hasn't been retried yet, attempt silent refresh
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post<{ success: boolean; data?: { token?: string } }>(
          `${baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = refreshResponse.data?.data?.token;
        if (newToken) {
          authStorage.setToken(newToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return api(originalRequest);
        }
      } catch {
        // Refresh failed, clean session
        localStorage.removeItem(authTokenKey);
        localStorage.removeItem('roomdekho_user');
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem(authTokenKey);
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

    const details = axiosError.response?.data?.details;
    const fieldErrors = details?.fieldErrors
      ? Object.entries(details.fieldErrors)
        .flatMap(([field, messages]) => messages.map((message) => `${field}: ${message}`))
        .join(' ')
      : '';

    if (serverMessage && fieldErrors) {
      return `${serverMessage} ${fieldErrors}`;
    }

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
    return getStoredToken();
  },

  setToken(token: string): void {
    localStorage.setItem(authTokenKey, token.trim());
    applyAuthToken(token.trim());
  },

  clearToken(): void {
    localStorage.removeItem(authTokenKey);
    applyAuthToken(null);
  },

  isLoggedIn(): boolean {
    return Boolean(getStoredToken());
  },
};