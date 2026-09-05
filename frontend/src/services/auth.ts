import type {
  User,
  UserRole,
} from '../types';

import {
  api,
  authStorage,
  unwrap,
} from './api';

/* ================================================================
   TYPES
================================================================ */

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RefreshResponse {
  token: string;
}

/* ================================================================
   AUTH SERVICE
================================================================ */

export const authService = {
  /* ==============================================================
     LOGIN
  ============================================================== */

  async login(credentials: {
    email: string;
    password: string;
    role?: UserRole;
  }): Promise<AuthResponse> {
    /*
     * Backend login currently authenticates using only:
     * email + password.
     *
     * Role is kept in the frontend interface so the Login UI can
     * distinguish between User and Room Owner login.
     *
     * We intentionally do NOT send role to the backend because
     * authController.login() doesn't use it.
     */

    const response = await api.post(
      '/auth/login',
      {
        email:
          credentials.email
            .trim()
            .toLowerCase(),

        password:
          credentials.password,
      },
    );

    const result =
      unwrap<AuthResponse>(
        response.data,
      );

    if (result.token) {
      authStorage.setToken(
        result.token,
      );
    }

    return result;
  },

  /* ==============================================================
     USER REGISTRATION
  ============================================================== */

  async registerUser(values: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<AuthResponse> {
    const response =
      await api.post(
        '/auth/register',
        {
          name:
            values.name.trim(),

          email:
            values.email
              .trim()
              .toLowerCase(),

          phone:
            values.phone.trim(),

          password:
            values.password,

          role: 'user',
        },
      );

    const result =
      unwrap<AuthResponse>(
        response.data,
      );

    if (result.token) {
      authStorage.setToken(
        result.token,
      );
    }

    return result;
  },

  /* ==============================================================
     ROOM OWNER REGISTRATION
  ============================================================== */

  async registerOwner(values: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<AuthResponse> {
    const response =
      await api.post(
        '/auth/register',
        {
          name:
            values.name.trim(),

          email:
            values.email
              .trim()
              .toLowerCase(),

          phone:
            values.phone.trim(),

          password:
            values.password,

          role: 'owner',
        },
      );

    const result =
      unwrap<AuthResponse>(
        response.data,
      );

    if (result.token) {
      authStorage.setToken(
        result.token,
      );
    }

    return result;
  },

  /* ==============================================================
     REFRESH ACCESS TOKEN
  ============================================================== */

  async refresh(): Promise<string> {
    const response =
      await api.post(
        '/auth/refresh',
      );

    const result =
      unwrap<RefreshResponse>(
        response.data,
      );

    if (!result.token) {
      throw new Error(
        'Unable to refresh your session.',
      );
    }

    authStorage.setToken(
      result.token,
    );

    return result.token;
  },

  /* ==============================================================
     LOGOUT
  ============================================================== */

  async logout(): Promise<void> {
    try {
      await api.post(
        '/auth/logout',
      );
    } finally {
      /*
       * Always remove the access token locally,
       * even if the backend is unavailable.
       */
      authStorage.clearToken();
    }
  },

  /* ==============================================================
     SEND OTP
  ============================================================== */

  async sendOtp(
    phone: string,
    purpose:
      | 'phone_verification'
      | 'password_reset' =
      'phone_verification',
  ) {
    const response =
      await api.post(
        '/auth/send-otp',
        {
          phone:
            phone.trim(),

          purpose,
        },
      );

    return unwrap<{
      sent?: boolean;
      expiresAt?: string;
      expiresInSeconds?: number;
    }>(
      response.data,
    );
  },

  /* ==============================================================
     VERIFY PHONE OTP
  ============================================================== */

  async verifyOtp(
    phone: string,
    otp: string,
    purpose:
      | 'phone_verification' =
      'phone_verification',
  ) {
    const response =
      await api.post(
        '/auth/verify-otp',
        {
          phone:
            phone.trim(),

          otp:
            otp.trim(),

          purpose,
        },
      );

    return unwrap<{
      verified?: boolean;
      user?: User;
    }>(
      response.data,
    );
  },

  /* ==============================================================
     FORGOT PASSWORD
  ============================================================== */

  async requestReset(
    phone: string,
  ) {
    const response =
      await api.post(
        '/auth/forgot-password',
        {
          phone:
            phone.trim(),
        },
      );

    return unwrap<{
      sent?: boolean;
      message?: string;
    }>(
      response.data,
    );
  },

  /* ==============================================================
     RESET PASSWORD
  ============================================================== */

  async resetPassword(
    phone: string,
    otp: string,
    password: string,
  ): Promise<AuthResponse> {
    const response =
      await api.post(
        '/auth/reset-password',
        {
          phone:
            phone.trim(),

          otp:
            otp.trim(),

          password,
        },
      );

    /*
     * Current backend returns:
     *
     * {
     *   success: true,
     *   data: {
     *     reset: true,
     *     token: "..."
     *   }
     * }
     *
     * It does NOT return a user object.
     */

    const result =
      unwrap<{
        reset: boolean;
        token: string;
      }>(
        response.data,
      );

    if (!result.token) {
      throw new Error(
        'Password was reset, but a new session could not be created.',
      );
    }

    authStorage.setToken(
      result.token,
    );

    /*
     * User information can be fetched by AuthContext
     * after the new token is created.
     */
    return {
      user: {} as User,
      token: result.token,
    };
  },

  /* ==============================================================
     CURRENT LOGIN STATE
  ============================================================== */

  isAuthenticated(): boolean {
    return authStorage.isLoggedIn();
  },

  /* ==============================================================
     CURRENT TOKEN
  ============================================================== */

  getToken(): string | null {
    return authStorage.getToken();
  },
};