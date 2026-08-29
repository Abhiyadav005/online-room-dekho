import { env } from '../../config/env';
import type { SmsProvider } from '../../types/integrations';
import { ConsoleSmsProvider, DisabledSmsProvider } from './SmsProvider';
import { TwilioSmsProvider } from './TwilioSmsProvider';

export * from './SmsProvider';
export * from './TwilioSmsProvider';

type SmsConfig = typeof env.sms;

let providerInstance: SmsProvider | undefined;

export function createSmsProvider(config: SmsConfig = env.sms): SmsProvider {
  switch (config.provider.trim().toLowerCase()) {
    case 'twilio':
      return new TwilioSmsProvider(config);
    case 'console':
      return new ConsoleSmsProvider();
    case 'disabled':
    case 'none':
    case '':
      return new DisabledSmsProvider();
    default:
      return new DisabledSmsProvider();
  }
}

/** Returns a process-wide provider instance; no credentials are logged. */
export function getSmsProvider(): SmsProvider {
  providerInstance ??= createSmsProvider();
  return providerInstance;
}

/** Test-only hook so test environments can replace env-derived instances. */
export function resetSmsProviderForTests(): void {
  providerInstance = undefined;
}
