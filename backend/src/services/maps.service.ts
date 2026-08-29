import { IntegrationError } from '../integrations/errors';
import {
  calculateStraightLineDistanceKm,
  getMapsProvider,
} from '../integrations/maps';
import type {
  Coordinates,
  DistanceResult,
  GeocodeResult,
  TravelMode,
} from '../types/integrations';

/**
 * Provider-agnostic map operations used by controllers. Distance retains an
 * honest straight-line fallback when no map vendor has been configured; it
 * never labels that fallback as a driving route.
 */
export class MapsService {
  public async geocode(query: string): Promise<GeocodeResult[]> {
    return getMapsProvider().geocode(query);
  }

  public async reverseGeocode(coordinates: Coordinates): Promise<GeocodeResult[]> {
    return getMapsProvider().reverseGeocode(coordinates);
  }

  public async calculateDistance(
    origin: Coordinates,
    destination: Coordinates,
    mode: TravelMode = 'driving',
  ): Promise<DistanceResult> {
    try {
      return await getMapsProvider().distance(origin, destination, mode);
    } catch (error) {
      if (error instanceof IntegrationError && error.code === 'MAP_PROVIDER_NOT_CONFIGURED') {
        return {
          origin,
          destination,
          distanceKm: calculateStraightLineDistanceKm(origin, destination),
          mode,
          source: 'straight_line',
        };
      }
      throw error;
    }
  }
}

let mapsService: MapsService | undefined;

export function getMapsService(): MapsService {
  mapsService ??= new MapsService();
  return mapsService;
}
