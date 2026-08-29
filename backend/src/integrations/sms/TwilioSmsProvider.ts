import { randomUUID } from 'crypto';

import { IntegrationError } from '../errors';
import { OtpCapableSmsProvider } from './SmsProvider';
import type { SmsDeliveryResult, SmsMessage } from '../../types/integrations';

interface TwilioConfig {
  apiKey: string;
  apiSecret: string;
  from: string;
}

interface TwilioMessageResponse {
  sid?: unknown;
}

/**
 * A minimal Twilio REST implementation using Node's native fetch. API key is
 * interpreted as the Twilio Account SID and API secret as the Auth Token.
 */
export class TwilioSmsProvider extends OtpCapableSmsProvider {
  private readonly accountSid: string;
  private readonly authToken: string;
  private readonly from: string;

  constructor(config: TwilioConfig) {
    super();
    this.accountSid = config.apiKey.trim();
    this.authToken = config.apiSecret.trim();
    this.from = config.from.trim();

    if (!this.accountSid || !this.authToken || !this.from) {
      throw new IntegrationError(
        'SMS_PROVIDER_NOT_CONFIGURED',
        'Twilio requires SMS_API_KEY, SMS_API_SECRET, and SMS_FROM.',
        { statusCode: 503 },
      );
    }
  }

  public async send(message: SmsMessage): Promise<SmsDeliveryResult> {
    const form = new URLSearchParams({
      To: message.to,
      From: this.from,
      Body: message.body,
    });
    const encodedAccountSid = encodeURIComponent(this.accountSid);

    let response: Response;
    try {
      response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${encodedAccountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: form.toString(),
          signal: AbortSignal.timeout(10_000),
        },
      );
    } catch (cause) {
      throw new IntegrationError('SMS_DELIVERY_FAILED', 'SMS provider could not be reached.', {
        statusCode: 502,
        expose: false,
        cause,
      });
    }

    if (!response.ok) {
      // The provider response can include phone numbers; do not expose or log it.
      throw new IntegrationError('SMS_DELIVERY_FAILED', 'SMS provider rejected the message.', {
        statusCode: 502,
        details: { providerStatus: response.status },
      });
    }

    let payload: TwilioMessageResponse = {};
    try {
      payload = (await response.json()) as TwilioMessageResponse;
    } catch {
      // A 2xx response is still accepted even if a proxy stripped the JSON body.
    }

    return {
      provider: 'twilio',
      messageId: typeof payload.sid === 'string' ? payload.sid : `twilio-${randomUUID()}`,
      acceptedAt: new Date(),
    };
  }
}
