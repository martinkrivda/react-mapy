import type { GeoBounds, GeoPoint, GeoPointLike, GeoPointTuple } from './types';

const EARTH_RADIUS_METERS = 6_371_008.8;

/**
 * Normalizes a public point input into a `{ lat, lng }` object.
 */
export function toGeoPoint(point: GeoPointLike): GeoPoint {
  if (Array.isArray(point)) {
    const tuple = point as GeoPointTuple;
    const lat = tuple[0];
    const lng = tuple[1];
    return { lat, lng };
  }

  const normalized = point as GeoPoint;
  return { lat: normalized.lat, lng: normalized.lng };
}

/**
 * Converts a public point input into the tuple shape expected by Leaflet.
 */
export function toLatLngTuple(point: GeoPointLike): [number, number] {
  const normalized = toGeoPoint(point);
  return [normalized.lat, normalized.lng];
}

/**
 * Computes a geographic bounding box for a collection of points.
 */
export function computeBounds(points: readonly GeoPointLike[]): GeoBounds | undefined {
  if (points.length === 0) {
    return undefined;
  }

  let south = Number.POSITIVE_INFINITY;
  let west = Number.POSITIVE_INFINITY;
  let north = Number.NEGATIVE_INFINITY;
  let east = Number.NEGATIVE_INFINITY;

  for (const point of points) {
    const normalized = toGeoPoint(point);

    south = Math.min(south, normalized.lat);
    west = Math.min(west, normalized.lng);
    north = Math.max(north, normalized.lat);
    east = Math.max(east, normalized.lng);
  }

  return { east, north, south, west };
}

/**
 * Calculates the haversine distance between two geographic points in meters.
 */
export function haversineDistanceMeters(from: GeoPointLike, to: GeoPointLike): number {
  const fromPoint = toGeoPoint(from);
  const toPoint = toGeoPoint(to);
  const lat1 = toRadians(fromPoint.lat);
  const lat2 = toRadians(toPoint.lat);
  const deltaLat = toRadians(toPoint.lat - fromPoint.lat);
  const deltaLng = toRadians(toPoint.lng - fromPoint.lng);

  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}
