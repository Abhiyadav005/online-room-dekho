import { env } from '../../config/env';
import type { MapsProvider } from '../../types/integrations';
import { DisabledMapsProvider } from './MapsProvider';
import { GoogleMapsProvider } from './GoogleMapsProvider';

export * from './coordinates';
export * from './MapsProvider';
export * from './GoogleMapsProvider';

type MapsConfig = typeof env.maps;

let providerInstance: MapsProvider | undefined;

export function createMapsProvider(config: MapsConfig = env.maps): MapsProvider {
  switch (config.provider.trim().toLowerCase()) {
    case 'google':
    case 'google_maps':
      return new GoogleMapsProvider(config.apiKey);
    case 'disabled':
    case 'none':
    case '':
    default:
      return new DisabledMapsProvider();
  }
}

export function getMapsProvider(): MapsProvider {
  providerInstance ??= createMapsProvider();
  return providerInstance;
}

export function resetMapsProviderForTests(): void {
  providerInstance = undefined;
}
