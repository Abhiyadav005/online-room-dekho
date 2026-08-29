import { AppError } from '../utils/AppError';

export type IntegrationErrorCode =
  | 'AI_PROVIDER_ERROR'
  | 'AI_PROVIDER_NOT_CONFIGURED'
  | 'AI_RESPONSE_INVALID'
  | 'INVALID_AI_INPUT'
  | 'INVALID_COORDINATES'
  | 'INVALID_IMAGE_UPLOAD'
  | 'INVALID_OTP'
  | 'INVALID_PHONE_NUMBER'
  | 'MAP_PROVIDER_ERROR'
  | 'MAP_PROVIDER_NOT_CONFIGURED'
  | 'SMS_DELIVERY_FAILED'
  | 'SMS_PROVIDER_NOT_CONFIGURED'
  | 'STORAGE_PROVIDER_NOT_CONFIGURED'
  | 'STORAGE_PROVIDER_UNSUPPORTED';

/**
 * A small dependency-free error that central error middleware can safely map
 * to the existing { success, message, code } API envelope.
 */
export class IntegrationError extends AppError {
  public readonly expose: boolean;

  constructor(
    code: IntegrationErrorCode,
    message: string,
    options: {
      statusCode?: number;
      expose?: boolean;
      details?: Record<string, unknown>;
      cause?: unknown;
    } = {},
  ) {
    super(message, options.statusCode ?? 502, code, options.details);
    this.name = 'IntegrationError';
    this.expose = options.expose ?? true;

    if (options.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
