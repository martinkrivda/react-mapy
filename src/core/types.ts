/**
 * Geographic point in WGS84 latitude and longitude coordinates.
 */
export interface GeoPoint {
  lat: number;
  lng: number;
}

/**
 * Geographic point with optional elevation and timestamp metadata.
 */
export interface TimedGeoPoint extends GeoPoint {
  elevation?: number;
  time?: Date;
}

/**
 * Public timestamp input accepted by stream-oriented helpers.
 */
export type TimeValue = Date | number | string;

/**
 * Geographic point enriched with optional stream metadata.
 */
export interface StreamPoint extends GeoPoint {
  distanceKm?: number;
  elevation?: number;
  heartRate?: number;
  speedKmh?: number;
  time?: TimeValue | null;
}

/**
 * Minimal geographic bounds representation.
 */
export interface GeoBounds {
  south: number;
  west: number;
  north: number;
  east: number;
}

/**
 * Tuple shorthand accepted by component props and geometry helpers.
 */
export type GeoPointTuple = readonly [lat: number, lng: number];

/**
 * Convenient point input shape accepted by public APIs.
 */
export type GeoPointLike = GeoPoint | GeoPointTuple;
