import { IntegrationError } from '../errors';
import type { Coordinates } from '../../types/integrations';

const EARTH_RADIUS_KM = 6371.0088;

export function assertCoordinates(value: Coordinates): Coordinates {
  if (
    !Number.isFinite(value.latitude) ||
    !Number.isFinite(value.longitude) ||
    value.latitude < -90 ||
    value.latitude > 90 ||
    value.longitude < -180 ||
    value.longitude > 180
  ) {
    throw new IntegrationError('INVALID_COORDINATES', 'Valid latitude and longitude are required.', {
      statusCode: 400,
    });
  }

  return value;
}

/** Great-circle distance, explicitly labelled as a straight-line fallback. */
export function calculateStraightLineDistanceKm(origin: Coordinates, destination: Coordinates): number {
  assertCoordinates(origin);
  assertCoordinates(destination);

  const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(destination.latitude - origin.latitude);
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(origin.latitude)) *
      Math.cos(toRadians(destination.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
