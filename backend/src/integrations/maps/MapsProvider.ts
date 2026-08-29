import { IntegrationError } from '../errors';
import type {
  Coordinates,
  DistanceResult,
  GeocodeResult,
  MapsProvider,
  TravelMode,
} from '../../types/integrations';

export type {
  Coordinates,
  DistanceResult,
  GeocodeResult,
  MapsProvider,
  TravelMode,
} from '../../types/integrations';

export class DisabledMapsProvider implements MapsProvider {
  private unavailable(): never {
    throw new IntegrationError(
      'MAP_PROVIDER_NOT_CONFIGURED',
      'Maps provider is not configured for this environment.',
      { statusCode: 503 },
    );
  }

  public async geocode(_query: string): Promise<GeocodeResult[]> {
    return this.unavailable();
  }

  public async reverseGeocode(_coordinates: Coordinates): Promise<GeocodeResult[]> {
    return this.unavailable();
  }

  public async distance(
    _origin: Coordinates,
    _destination: Coordinates,
    _mode: TravelMode,
  ): Promise<DistanceResult> {
    return this.unavailable();
  }
}
