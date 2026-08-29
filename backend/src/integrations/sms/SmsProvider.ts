import { randomUUID } from 'crypto';

import { env, isProduction } from '../../config/env';
import { IntegrationError } from '../errors';
import type {
  OtpPurpose,
  SendOtpRequest,
  SmsDeliveryResult,
  SmsMessage,
  SmsProvider,
} from '../../types/integrations';

export type {
  SendOtpRequest,
  SmsDeliveryResult,
  SmsMessage,
  SmsProvider,
} from '../../types/integrations';

const OTP_DIGITS = 6;

export function normalizeSmsPhone(input: string, defaultCountryCode = '+91'): string {
  const compact = input.trim().replace(/[\s().-]/g, '');
  const withPrefix = /^\d{10}$/.test(compact)
    ? `${defaultCountryCode}${compact}`
    : compact.startsWith('00')
      ? `+${compact.slice(2)}`
      : compact;

  if (!/^\+[1-9]\d{7,14}$/.test(withPrefix)) {
    throw new IntegrationError('INVALID_PHONE_NUMBER', 'A valid mobile number is required.', {
      statusCode: 400,
    });
  }

  return withPrefix;
}

export function isValidSmsOtpCode(code: string): boolean {
  return new RegExp(`^\\d{${OTP_DIGITS}}$`).test(code);
}

export function buildOtpSmsMessage(code: string, purpose: OtpPurpose, ttlMinutes: number): string {
  if (!isValidSmsOtpCode(code)) {
    throw new IntegrationError('INVALID_OTP', 'OTP must be a six-digit number.', { statusCode: 400 });
  }

  const purposeCopy: Record<OtpPurpose, string> = {
    registration: 'registration',
    login: 'sign-in',
    phone_verification: 'phone verification',
    owner_verification: 'owner verification',
    password_reset: 'password reset',
  };

  return `Smart Room Finder: ${code} is your ${purposeCopy[purpose]} code. It expires in ${ttlMinutes} minutes. Do not share it.`;
}

export abstract class OtpCapableSmsProvider implements SmsProvider {
  public abstract send(message: SmsMessage): Promise<SmsDeliveryResult>;

  public async sendOtp({ phone, code, purpose }: SendOtpRequest): Promise<void> {
    const to = normalizeSmsPhone(phone);
    const body = buildOtpSmsMessage(code, purpose, env.sms.otpTtlMinutes);
    await this.send({ to, body, purpose });
  }
}

/**
 * A deliberate no-op is safer than silently pretending an OTP was delivered.
 * Applications should surface this as a service-unavailable configuration
 * error until a real provider is configured.
 */
export class DisabledSmsProvider extends OtpCapableSmsProvider {
  public async send(): Promise<SmsDeliveryResult> {
    throw new IntegrationError(
      'SMS_PROVIDER_NOT_CONFIGURED',
      'SMS delivery is not configured.',
      { statusCode: 503 },
    );
  }
}

/**
 * Useful for local wiring checks. It intentionally logs only a masked number
 * and never the SMS body, because it can contain an OTP.
 */
export class ConsoleSmsProvider extends OtpCapableSmsProvider {
  public async send(message: SmsMessage): Promise<SmsDeliveryResult> {
    if (isProduction) {
      throw new IntegrationError(
        'SMS_PROVIDER_NOT_CONFIGURED',
        'The console SMS provider cannot be used in production.',
        { statusCode: 503 },
      );
    }

    // Do not include message.body here. OTPs must never enter application logs.
    const lastFour = message.to.slice(-4);
    console.info(`[sms:console] accepted ${message.purpose} OTP for ***${lastFour}`);

    return {
      provider: 'console',
      messageId: `console-${randomUUID()}`,
      acceptedAt: new Date(),
    };
  }
}
