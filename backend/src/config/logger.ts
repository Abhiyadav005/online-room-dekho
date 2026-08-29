import pino from 'pino';
import { env } from './env';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (env.nodeEnv === 'production' ? 'info' : 'debug'),
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.currentPassword',
      'req.body.newPassword',
      'req.body.otp',
      'password',
      'token',
      'refreshToken'
    ],
    censor: '[REDACTED]'
  }
});
