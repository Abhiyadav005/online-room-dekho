import { randomBytes, randomInt, scrypt as scryptCallback, timingSafeEqual } from 'crypto';

import { env } from '../config/env';
import { IntegrationError } from '../integrations/errors';
import {
  buildOtpSmsMessage,
  getSmsProvider,
  isValidSmsOtpCode,
  normalizeSmsPhone,
} from '../integrations/sms';
import type { OtpDraft, OtpPurpose } from '../types/integrations';

const OTP_DIGITS = 6;

async function scryptHash(password: string, salt: Buffer, keylen: number): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, keylen, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(Buffer.from(derivedKey as Uint8Array));
    });
  });
}

export interface SendOtpInput {
  to: string;
  /** Plain text exists only long enough to create and send a single SMS. */
  code: string;
  purpose: OtpPurpose;
}

/**
 * Normalizes Indian 10-digit mobile numbers and E.164 input to an E.164 phone
 * number. Country-specific defaults are intentionally explicit here rather
 * than being guessed by the SMS provider.
 */
export function normalizePhoneNumber(input: string, defaultCountryCode = '+91'): string {
  return normalizeSmsPhone(input, defaultCountryCode);
}

export function isValidOtpCode(code: string): boolean {
  return isValidSmsOtpCode(code);
}

/** Generates a cryptographically secure, fixed-width OTP. */
export function generateSecureOtp(): string {
  return randomInt(0, 10 ** OTP_DIGITS).toString().padStart(OTP_DIGITS, '0');
}

/**
 * Stores OTPs as an independently salted scrypt hash. The returned format is
 * safe to persist in the temporary OTP collection, but is not an API DTO.
 */
export async function hashOtp(code: string): Promise<string> {
  if (!isValidOtpCode(code)) {
    throw new IntegrationError('INVALID_OTP', 'OTP must be a six-digit number.', { statusCode: 400 });
  }

  const salt = randomBytes(16);
  const derived = await scryptHash(code, salt, 64);
  return `scrypt-v1:${salt.toString('base64url')}:${derived.toString('base64url')}`;
}

export async function verifyOtpHash(code: string, storedHash: string): Promise<boolean> {
  if (!isValidOtpCode(code)) {
    return false;
  }

  const [version, encodedSalt, encodedHash, ...extra] = storedHash.split(':');
  if (version !== 'scrypt-v1' || !encodedSalt || !encodedHash || extra.length > 0) {
    return false;
  }

  try {
    const salt = Buffer.from(encodedSalt, 'base64url');
    const expected = Buffer.from(encodedHash, 'base64url');
    if (salt.length !== 16 || expected.length !== 64) {
      return false;
    }

    const actual = await scryptHash(code, salt, expected.length);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export async function createOtpDraft(ttlMinutes = env.sms.otpTtlMinutes): Promise<OtpDraft> {
  const safeTtl = Number.isInteger(ttlMinutes) && ttlMinutes > 0 && ttlMinutes <= 60
    ? ttlMinutes
    : env.sms.otpTtlMinutes;
  const code = generateSecureOtp();

  return {
    code,
    codeHash: await hashOtp(code),
    expiresAt: new Date(Date.now() + safeTtl * 60_000),
  };
}

export function buildOtpMessage(code: string, purpose: OtpPurpose, ttlMinutes = env.sms.otpTtlMinutes): string {
  return buildOtpSmsMessage(code, purpose, ttlMinutes);
}

/**
 * Dispatches an already-generated OTP. It never persists, logs, or returns the
 * code. Persist the hash from createOtpDraft before calling this function.
 */
export async function sendOtp({ to, code, purpose }: SendOtpInput): Promise<void> {
  await getSmsProvider().sendOtp({ phone: to, code, purpose });
}
