import { IntegrationError } from '../errors';
import { assertCoordinates } from './coordinates';
import type {
  Coordinates,
  DistanceResult,
  GeocodeResult,
  MapsProvider,
  TravelMode,
} from '../../types/integrations';

interface GoogleAddressComponent {
  long_name?: unknown;
  types?: unknown;
}

interface GoogleGeocodeItem {
  formatted_address?: unknown;
  place_id?: unknown;
  geometry?: {
    location?: {
      lat?: unknown;
      lng?: unknown;
    };
  };
  address_components?: GoogleAddressComponent[];
}

interface GoogleGeocodeResponse {
  status?: unknown;
  results?: GoogleGeocodeItem[];
}

interface GoogleDistanceElement {
  status?: unknown;
  distance?: { value?: unknown };
  duration?: { value?: unknown };
}

interface GoogleDistanceResponse {
  status?: unknown;
  rows?: Array<{ elements?: GoogleDistanceElement[] }>;
}

/** Native-fetch Google Maps REST client. No API credentials are embedded. */
export class GoogleMapsProvider implements MapsProvider {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey.trim();
    if (!this.apiKey) {
      throw new IntegrationError(
        'MAP_PROVIDER_NOT_CONFIGURED',
        'Google Maps requires MAPS_API_KEY.',
        { statusCode: 503 },
      );
    }
  }

  public async geocode(query: string): Promise<GeocodeResult[]> {
    const cleanedQuery = query.trim();
    if (!cleanedQuery || cleanedQuery.length > 200) {
      throw new IntegrationError('MAP_PROVIDER_ERROR', 'A valid location query is required.', {
        statusCode: 400,
      });
    }

    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('address', cleanedQuery);
    url.searchParams.set('key', this.apiKey);
    const payload = await this.requestGeocode(url);
    return this.toGeocodeResults(payload);
  }

  public async reverseGeocode(coordinates: Coordinates): Promise<GeocodeResult[]> {
    assertCoordinates(coordinates);
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('latlng', `${coordinates.latitude},${coordinates.longitude}`);
    url.searchParams.set('key', this.apiKey);
    const payload = await this.requestGeocode(url);
    return this.toGeocodeResults(payload);
  }

  public async distance(
    origin: Coordinates,
    destination: Coordinates,
    mode: TravelMode,
  ): Promise<DistanceResult> {
    assertCoordinates(origin);
    assertCoordinates(destination);

    const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
    url.searchParams.set('origins', `${origin.latitude},${origin.longitude}`);
    url.searchParams.set('destinations', `${destination.latitude},${destination.longitude}`);
    url.searchParams.set('mode', mode);
    url.searchParams.set('key', this.apiKey);

    const payload = await this.requestJson<GoogleDistanceResponse>(url);
    if (payload.status !== 'OK') {
      throw new IntegrationError('MAP_PROVIDER_ERROR', 'Maps provider could not calculate distance.', {
        statusCode: 502,
        details: { providerStatus: typeof payload.status === 'string' ? payload.status : 'UNKNOWN' },
      });
    }

    const element = payload.rows?.[0]?.elements?.[0];
    const meters = element?.distance?.value;
    if (element?.status !== 'OK' || typeof meters !== 'number' || !Number.isFinite(meters)) {
      throw new IntegrationError('MAP_PROVIDER_ERROR', 'Maps provider could not calculate distance.', {
        statusCode: 422,
      });
    }

    const seconds = element.duration?.value;
    return {
      origin,
      destination,
      distanceKm: meters / 1000,
      durationMinutes:
        typeof seconds === 'number' && Number.isFinite(seconds) ? Math.ceil(seconds / 60) : undefined,
      mode,
      source: 'provider',
    };
  }

  private async requestGeocode(url: URL): Promise<GoogleGeocodeResponse> {
    const payload = await this.requestJson<GoogleGeocodeResponse>(url);
    if (payload.status === 'OK' || payload.status === 'ZERO_RESULTS') {
      return payload;
    }

    throw new IntegrationError('MAP_PROVIDER_ERROR', 'Maps provider could not resolve that location.', {
      statusCode: 502,
      details: { providerStatus: typeof payload.status === 'string' ? payload.status : 'UNKNOWN' },
    });
  }

  private async requestJson<T>(url: URL): Promise<T> {
    let response: Response;
    try {
      response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    } catch (cause) {
      throw new IntegrationError('MAP_PROVIDER_ERROR', 'Maps provider could not be reached.', {
        statusCode: 502,
        expose: false,
        cause,
      });
    }

    if (!response.ok) {
      throw new IntegrationError('MAP_PROVIDER_ERROR', 'Maps provider request failed.', {
        statusCode: 502,
        details: { providerStatus: response.status },
      });
    }

    try {
      return (await response.json()) as T;
    } catch (cause) {
      throw new IntegrationError('MAP_PROVIDER_ERROR', 'Maps provider returned an invalid response.', {
        statusCode: 502,
        expose: false,
        cause,
      });
    }
  }

  private toGeocodeResults(payload: GoogleGeocodeResponse): GeocodeResult[] {
    return (payload.results ?? []).flatMap((item) => {
      const latitude = item.geometry?.location?.lat;
      const longitude = item.geometry?.location?.lng;
      const formattedAddress = item.formatted_address;
      if (
        typeof latitude !== 'number' ||
        typeof longitude !== 'number' ||
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        typeof formattedAddress !== 'string'
      ) {
        return [];
      }

      const components = item.address_components ?? [];
      const componentByType = (type: string): string | undefined =>
        components.find((component) => Array.isArray(component.types) && component.types.includes(type))
          ?.long_name as string | undefined;

      return [{
        formattedAddress,
        coordinates: { latitude, longitude },
        placeId: typeof item.place_id === 'string' ? item.place_id : undefined,
        city: componentByType('locality') ?? componentByType('administrative_area_level_2'),
        area: componentByType('sublocality') ?? componentByType('sublocality_level_1'),
        country: componentByType('country'),
      }];
    });
  }
}
