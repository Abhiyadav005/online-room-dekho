import 'dotenv/config';

const asNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const asBoolean = (value: string | undefined, fallback = false): boolean =>
  value === undefined ? fallback : value.toLowerCase() === 'true';

/**
 * Environment is centralized so integrations never reach into process.env.
 * Secrets are intentionally never included in logs or API responses.
 */
export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: asNumber(process.env.PORT, 5000),
  mongoUri: process.env.MONGODB_URI ?? '',
  jwtSecret: process.env.JWT_SECRET ?? '',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  cookieSecure: asBoolean(process.env.COOKIE_SECURE, false),
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  sms: {
    provider: process.env.SMS_PROVIDER ?? 'disabled',
    apiKey: process.env.SMS_API_KEY ?? '',
    apiSecret: process.env.SMS_API_SECRET ?? '',
    from: process.env.SMS_FROM ?? '',
    otpTtlMinutes: asNumber(process.env.OTP_TTL_MINUTES, 10),
    resendCooldownSeconds: asNumber(process.env.OTP_RESEND_COOLDOWN_SECONDS, 60),
    maxAttempts: asNumber(process.env.OTP_MAX_ATTEMPTS, 5)
  },
  ai: {
    provider: process.env.AI_PROVIDER ?? 'disabled',
    apiKey: process.env.AI_API_KEY ?? '',
    model: process.env.AI_MODEL ?? ''
  },
  maps: {
    provider: process.env.MAP_PROVIDER ?? 'disabled',
    apiKey: process.env.MAPS_API_KEY ?? ''
  },
  storage: {
    provider: process.env.STORAGE_PROVIDER ?? 'disabled',
    apiKey: process.env.STORAGE_API_KEY ?? '',
    apiSecret: process.env.STORAGE_API_SECRET ?? '',
    bucket: process.env.STORAGE_BUCKET ?? '',
    maxUploadBytes: asNumber(process.env.MAX_UPLOAD_BYTES, 5 * 1024 * 1024)
  }
} as const;

export const isProduction = env.nodeEnv === 'production';

export function assertRuntimeConfiguration(): void {
  if (!env.mongoUri) {
    throw new Error('MONGODB_URI is required');
  }
  if (env.jwtSecret.length < 32 || env.jwtRefreshSecret.length < 32) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must each be at least 32 characters');
  }
}
