import { haversineDistanceMeters } from './geometry';
import type { TimedGeoPoint } from './types';

/**
 * Pace threshold expressed in seconds per kilometer.
 */
export interface PaceColorStop {
  color: string;
  label?: string;
  upToSecondsPerKilometer: number;
}

/**
 * Colored route segment derived from consecutive timed GPS points.
 */
export interface PaceSegment {
  color: string;
  distanceMeters: number;
  durationSeconds?: number;
  end: TimedGeoPoint;
  paceSecondsPerKilometer?: number;
  start: TimedGeoPoint;
}

/**
 * Options for GPX pace segmentation.
 */
export interface BuildPaceSegmentsOptions {
  colorStops?: readonly PaceColorStop[];
  fallbackColor?: string;
  minimumDistanceMeters?: number;
}

/**
 * Default pace color scale used by `GpxTrackLayer`.
 */
export const DEFAULT_PACE_COLOR_STOPS: readonly PaceColorStop[] = [
  { color: '#1d4ed8', label: 'Very fast', upToSecondsPerKilometer: 240 },
  { color: '#0f766e', label: 'Fast', upToSecondsPerKilometer: 300 },
  { color: '#65a30d', label: 'Moderate', upToSecondsPerKilometer: 360 },
  { color: '#f59e0b', label: 'Easy', upToSecondsPerKilometer: 450 },
  { color: '#dc2626', label: 'Slow', upToSecondsPerKilometer: Number.POSITIVE_INFINITY },
] as const;

/**
 * Converts distance and duration into seconds per kilometer.
 */
export function calculatePaceSecondsPerKilometer(
  distanceMeters: number,
  durationSeconds: number,
): number | undefined {
  if (distanceMeters <= 0 || durationSeconds <= 0) {
    return undefined;
  }

  return durationSeconds / (distanceMeters / 1_000);
}

/**
 * Resolves a display color for a pace value.
 */
export function getPaceColor(
  paceSecondsPerKilometer: number | undefined,
  colorStops: readonly PaceColorStop[] = DEFAULT_PACE_COLOR_STOPS,
  fallbackColor = '#64748b',
): string {
  if (paceSecondsPerKilometer === undefined) {
    return fallbackColor;
  }

  const match = colorStops.find((stop) => paceSecondsPerKilometer <= stop.upToSecondsPerKilometer);
  return match?.color ?? fallbackColor;
}

/**
 * Splits consecutive timed points into colored pace segments.
 */
export function buildPaceSegments(
  points: readonly TimedGeoPoint[],
  options: BuildPaceSegmentsOptions = {},
): PaceSegment[] {
  if (points.length < 2) {
    return [];
  }

  const {
    colorStops = DEFAULT_PACE_COLOR_STOPS,
    fallbackColor = '#64748b',
    minimumDistanceMeters = 1,
  } = options;

  const segments: PaceSegment[] = [];

  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1];
    const end = points[index];

    if (!start || !end) {
      continue;
    }

    const distanceMeters = haversineDistanceMeters(start, end);

    if (distanceMeters < minimumDistanceMeters) {
      continue;
    }

    const durationSeconds = getDurationSeconds(start.time, end.time);
    const paceSecondsPerKilometer =
      durationSeconds === undefined
        ? undefined
        : calculatePaceSecondsPerKilometer(distanceMeters, durationSeconds);

    const segment: PaceSegment = {
      color: getPaceColor(paceSecondsPerKilometer, colorStops, fallbackColor),
      distanceMeters,
      end,
      start,
      ...(durationSeconds !== undefined ? { durationSeconds } : {}),
      ...(paceSecondsPerKilometer !== undefined ? { paceSecondsPerKilometer } : {}),
    };

    segments.push(segment);
  }

  return segments;
}

function getDurationSeconds(start?: Date, end?: Date): number | undefined {
  if (!start || !end) {
    return undefined;
  }

  const durationSeconds = (end.getTime() - start.getTime()) / 1_000;
  return durationSeconds > 0 ? durationSeconds : undefined;
}
