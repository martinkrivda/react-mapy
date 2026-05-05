import { haversineDistanceMeters, toGeoPoint } from './geometry';
import type { GeoPoint, GeoPointLike } from './types';

/**
 * Geographic point with optional heat intensity.
 */
export interface HeatmapPoint extends GeoPoint {
  intensity?: number;
}

/**
 * Public point input accepted by heatmap helpers.
 */
export type HeatmapPointLike = GeoPointLike | HeatmapPoint;

/**
 * Gradient definition consumed by the heatmap renderer.
 */
export type HeatmapGradient = Record<number, string>;

/**
 * Options for normalizing generic heatmap points.
 */
export interface NormalizeHeatmapPointsOptions {
  defaultIntensity?: number;
}

/**
 * Options for sampling historical tracks into heatmap points.
 */
export interface BuildTrackHeatmapPointsOptions {
  defaultIntensity?: number;
  sampleStepMeters?: number;
}

/**
 * Default warm gradient suited for event density and historical path overlays.
 */
export const DEFAULT_HEATMAP_GRADIENT: HeatmapGradient = Object.freeze({
  0.2: '#fde68a',
  0.4: '#f59e0b',
  0.7: '#dc2626',
  1: '#7f1d1d',
});

/**
 * Converts mixed point inputs into explicit heatmap points.
 */
export function normalizeHeatmapPoints(
  points: readonly HeatmapPointLike[],
  options: NormalizeHeatmapPointsOptions = {},
): HeatmapPoint[] {
  const defaultIntensity = options.defaultIntensity ?? 1;

  return points.map((point) => {
    const normalized = toGeoPoint(point);
    const intensity =
      'intensity' in point &&
      typeof point.intensity === 'number' &&
      Number.isFinite(point.intensity)
        ? point.intensity
        : defaultIntensity;

    return intensity === 1 ? normalized : { ...normalized, intensity };
  });
}

/**
 * Densifies historical tracks into heatmap points so repeated routes create a continuous heat layer.
 */
export function buildTrackHeatmapPoints(
  tracks: readonly (readonly GeoPointLike[])[],
  options: BuildTrackHeatmapPointsOptions = {},
): HeatmapPoint[] {
  const sampleStepMeters = Math.max(1, options.sampleStepMeters ?? 30);
  const defaultIntensity = options.defaultIntensity ?? 1;
  const heatmapPoints: HeatmapPoint[] = [];

  for (const track of tracks) {
    if (track.length === 0) {
      continue;
    }

    const normalizedTrack = track.map((point) => toGeoPoint(point));
    const firstPoint = normalizedTrack[0];

    if (!firstPoint) {
      continue;
    }

    heatmapPoints.push(
      defaultIntensity === 1 ? firstPoint : { ...firstPoint, intensity: defaultIntensity },
    );

    for (let index = 1; index < normalizedTrack.length; index += 1) {
      const start = normalizedTrack[index - 1];
      const end = normalizedTrack[index];

      if (!start || !end) {
        continue;
      }

      const distanceMeters = haversineDistanceMeters(start, end);
      const sampleCount = Math.max(1, Math.ceil(distanceMeters / sampleStepMeters));

      for (let sampleIndex = 1; sampleIndex <= sampleCount; sampleIndex += 1) {
        const factor = sampleIndex / sampleCount;
        const point = interpolatePoint(start, end, factor);

        heatmapPoints.push(
          defaultIntensity === 1 ? point : { ...point, intensity: defaultIntensity },
        );
      }
    }
  }

  return heatmapPoints;
}

function interpolatePoint(start: GeoPoint, end: GeoPoint, factor: number): GeoPoint {
  return {
    lat: start.lat + (end.lat - start.lat) * factor,
    lng: start.lng + (end.lng - start.lng) * factor,
  };
}
