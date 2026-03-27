import { haversineDistanceMeters, toGeoPoint } from './geometry';
import type {
  GeoPoint,
  GeoPointLike,
  StreamPoint,
  TimeValue,
} from './types';

/**
 * Options for converting speed into a display color.
 */
export interface SpeedColorOptions {
  fallbackColor?: string;
  maxKmh?: number;
  minKmh?: number;
}

/**
 * Options for converting elevation into a display color.
 */
export interface ElevationColorOptions {
  fallbackColor?: string;
  maxMeters?: number;
  minMeters?: number;
}

/**
 * Options for converting heart rate into a display color.
 */
export interface HeartRateColorOptions {
  fallbackColor?: string;
  maxBpm?: number;
  minBpm?: number;
}

/**
 * Options for track smoothing and curve densification.
 */
export interface TrackSmoothingOptions {
  alpha?: number;
  samplesPerSeg?: number;
}

/**
 * Segment generated from consecutive stream points and colored by speed.
 */
export interface SpeedSegment {
  color: string;
  end: GeoPoint;
  positions: [
    [lat: number, lng: number],
    [lat: number, lng: number],
  ];
  speedKmh?: number;
  start: GeoPoint;
}

/**
 * Segment generated from consecutive stream points and colored by elevation.
 */
export interface ElevationSegment {
  color: string;
  elevationMeters?: number;
  end: GeoPoint;
  positions: [
    [lat: number, lng: number],
    [lat: number, lng: number],
  ];
  start: GeoPoint;
}

/**
 * Segment generated from consecutive stream points and colored by heart rate.
 */
export interface HeartRateSegment {
  color: string;
  end: GeoPoint;
  heartRateBpm?: number;
  positions: [
    [lat: number, lng: number],
    [lat: number, lng: number],
  ];
  start: GeoPoint;
}

/**
 * Options used to derive colored speed segments from stream points.
 */
export interface BuildSpeedSegmentsOptions extends SpeedColorOptions {
  smooth?: TrackSmoothingOptions;
}

/**
 * Options used to derive colored elevation segments from stream points.
 */
export interface BuildElevationSegmentsOptions extends ElevationColorOptions {
  smooth?: TrackSmoothingOptions;
}

/**
 * Options used to derive colored heart-rate segments from stream points.
 */
export interface BuildHeartRateSegmentsOptions extends HeartRateColorOptions {
  smooth?: TrackSmoothingOptions;
}

/**
 * Input streams merged by `zipStreamToPoints`.
 */
export interface ZipStreamToPointsInput {
  altitude?: readonly (number | null | undefined)[];
  distance?: readonly (number | null | undefined)[];
  distanceKm?: readonly (number | null | undefined)[];
  elevation?: readonly (number | null | undefined)[];
  heartRate?: readonly (number | null | undefined)[];
  path?: readonly GeoPointLike[];
  speedKmh?: readonly (number | null | undefined)[];
  time?: readonly (TimeValue | null | undefined)[];
}

/**
 * Converts a supported HSL color into a hex string.
 */
export function hslToHex(hue: number, saturation: number, lightness: number): string {
  const safeSaturation = clamp(saturation, 0, 1);
  const safeLightness = clamp(lightness, 0, 1);
  const chroma = safeSaturation * Math.min(safeLightness, 1 - safeLightness);

  const channel = (offset: number): number => {
    const k = (offset + hue / 30) % 12;
    const color = safeLightness - chroma * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(255 * color);
  };

  const red = channel(0);
  const green = channel(8);
  const blue = channel(4);

  return `#${[red, green, blue]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')}`;
}

/**
 * Maps speed in km/h to a red-yellow-green color ramp.
 */
export function speedToColor(
  speedKmh: number | undefined,
  options: SpeedColorOptions = {},
): string {
  const {
    fallbackColor = '#3388ff',
    maxKmh = 20,
    minKmh = 5,
  } = options;

  if (!Number.isFinite(speedKmh)) {
    return fallbackColor;
  }

  const denominator = Math.max(1e-6, maxKmh - minKmh);
  const normalized = clamp(((speedKmh ?? 0) - minKmh) / denominator, 0, 1);
  const hue = normalized * 120;

  return hslToHex(hue, 1, 0.5);
}

/**
 * Maps elevation in meters to a blue-green-yellow-red color ramp.
 */
export function elevationToColor(
  elevationMeters: number | undefined,
  options: ElevationColorOptions = {},
): string {
  const {
    fallbackColor = '#3388ff',
    maxMeters = 1_500,
    minMeters = 0,
  } = options;

  if (!Number.isFinite(elevationMeters)) {
    return fallbackColor;
  }

  const denominator = Math.max(1e-6, maxMeters - minMeters);
  const normalized = clamp(((elevationMeters ?? 0) - minMeters) / denominator, 0, 1);

  return interpolateHexColor('#ef4444', '#7c2d12', normalized);
}

/**
 * Maps heart rate to a light-to-dark red ramp where the highest heart rate is darkest.
 */
export function heartRateToColor(
  heartRateBpm: number | undefined,
  options: HeartRateColorOptions = {},
): string {
  const {
    fallbackColor = '#ef4444',
    maxBpm = 190,
    minBpm = 90,
  } = options;

  if (!Number.isFinite(heartRateBpm)) {
    return fallbackColor;
  }

  const denominator = Math.max(1e-6, maxBpm - minBpm);
  const normalized = clamp(((heartRateBpm ?? 0) - minBpm) / denominator, 0, 1);
  const lightness = 0.82 - normalized * 0.54;

  return hslToHex(0, 1, lightness);
}

/**
 * Smooths point geometry with an exponential moving average while preserving other fields.
 */
export function emaSmoothPoints<TPoint extends GeoPoint>(
  points: readonly TPoint[],
  alpha = 0.25,
): TPoint[] {
  if (points.length === 0) {
    return [];
  }

  const smoothedPoints = new Array<TPoint>(points.length);
  const safeAlpha = clamp(alpha, 0, 1);
  const firstPoint = points[0];

  if (!firstPoint) {
    return [];
  }

  smoothedPoints[0] = { ...firstPoint };

  for (let index = 1; index < points.length; index += 1) {
    const point = points[index];
    const previousPoint = smoothedPoints[index - 1];

    if (!point || !previousPoint) {
      continue;
    }

    smoothedPoints[index] = {
      ...point,
      lat: previousPoint.lat + safeAlpha * (point.lat - previousPoint.lat),
      lng: previousPoint.lng + safeAlpha * (point.lng - previousPoint.lng),
    };
  }

  return smoothedPoints.filter((point): point is TPoint => point !== undefined);
}

/**
 * Converts a mixed stream response into point objects that can be rendered directly.
 */
export function zipStreamToPoints({
  altitude = [],
  distance = [],
  distanceKm,
  elevation = [],
  heartRate = [],
  path = [],
  speedKmh = [],
  time = [],
}: ZipStreamToPointsInput): StreamPoint[] {
  const elevationStream = elevation.length > 0 ? elevation : altitude;
  const distanceKmStream = distanceKm ?? [];
  const distanceStream = distanceKmStream.length > 0 ? distanceKmStream : distance;

  return path.map((pointLike, index) => {
    const point = toGeoPoint(pointLike);
    const nextPoint: StreamPoint = {
      ...point,
    };

    const pointTime = time[index];
    const pointSpeed = speedKmh[index];
    const pointElevation = elevationStream[index];
    const pointHeartRate = heartRate[index];
    const pointDistanceKm = distanceStream[index];

    if (pointTime !== null && pointTime !== undefined) {
      nextPoint.time = pointTime;
    }

    if (typeof pointSpeed === 'number' && Number.isFinite(pointSpeed)) {
      nextPoint.speedKmh = pointSpeed;
    }

    if (typeof pointElevation === 'number' && Number.isFinite(pointElevation)) {
      nextPoint.elevation = pointElevation;
    }

    if (typeof pointHeartRate === 'number' && Number.isFinite(pointHeartRate)) {
      nextPoint.heartRate = pointHeartRate;
    }

    if (typeof pointDistanceKm === 'number' && Number.isFinite(pointDistanceKm)) {
      nextPoint.distanceKm = pointDistanceKm;
    }

    return nextPoint;
  });
}

/**
 * Creates colored render segments from stream points, with optional smoothing and densification.
 */
export function buildSpeedSegments(
  points: readonly StreamPoint[],
  options: BuildSpeedSegmentsOptions = {},
): SpeedSegment[] {
  if (points.length < 2) {
    return [];
  }

  const {
    fallbackColor = '#3388ff',
    maxKmh = 20,
    minKmh = 5,
    smooth,
  } = options;
  const alpha = smooth?.alpha;
  const basePoints =
    alpha !== undefined && Number.isFinite(alpha) ? emaSmoothPoints(points, alpha) : [...points];
  const samplesPerSeg = Math.max(1, Math.floor(smooth?.samplesPerSeg ?? 1));
  const segments: SpeedSegment[] = [];

  for (let index = 1; index < basePoints.length; index += 1) {
    const startPoint = basePoints[index - 1];
    const endPoint = basePoints[index];
    const originalStartPoint = points[index - 1];
    const originalEndPoint = points[index];

    if (!startPoint || !endPoint || !originalStartPoint || !originalEndPoint) {
      continue;
    }

    if (!isFinitePoint(startPoint) || !isFinitePoint(endPoint)) {
      continue;
    }

    const resolvedSpeedKmh = resolveSegmentSpeedKmh(originalStartPoint, originalEndPoint);
    const color = speedToColor(resolvedSpeedKmh, {
      fallbackColor,
      maxKmh,
      minKmh,
    });

    if (samplesPerSeg === 1) {
      segments.push({
        color,
        end: toSimplePoint(endPoint),
        positions: [
          [startPoint.lat, startPoint.lng],
          [endPoint.lat, endPoint.lng],
        ],
        ...(resolvedSpeedKmh !== undefined ? { speedKmh: resolvedSpeedKmh } : {}),
        start: toSimplePoint(startPoint),
      });
      continue;
    }

    const previousControlPoint = basePoints[index - 2] ?? startPoint;
    const nextControlPoint = basePoints[index + 1] ?? endPoint;
    let previousPoint = toSimplePoint(startPoint);

    for (let sampleIndex = 1; sampleIndex <= samplesPerSeg; sampleIndex += 1) {
      const currentPoint = catmullRomPoint(
        previousControlPoint,
        startPoint,
        endPoint,
        nextControlPoint,
        sampleIndex / samplesPerSeg,
      );

      segments.push({
        color,
        end: currentPoint,
        positions: [
          [previousPoint.lat, previousPoint.lng],
          [currentPoint.lat, currentPoint.lng],
        ],
        ...(resolvedSpeedKmh !== undefined ? { speedKmh: resolvedSpeedKmh } : {}),
        start: previousPoint,
      });

      previousPoint = currentPoint;
    }
  }

  return segments;
}

/**
 * Creates colored render segments from stream points using average segment elevation.
 */
export function buildElevationSegments(
  points: readonly StreamPoint[],
  options: BuildElevationSegmentsOptions = {},
): ElevationSegment[] {
  if (points.length < 2) {
    return [];
  }

  const {
    fallbackColor = '#3388ff',
    maxMeters = 1_500,
    minMeters = 0,
    smooth,
  } = options;
  const alpha = smooth?.alpha;
  const basePoints =
    alpha !== undefined && Number.isFinite(alpha) ? emaSmoothPoints(points, alpha) : [...points];
  const samplesPerSeg = Math.max(1, Math.floor(smooth?.samplesPerSeg ?? 1));
  const segments: ElevationSegment[] = [];

  for (let index = 1; index < basePoints.length; index += 1) {
    const startPoint = basePoints[index - 1];
    const endPoint = basePoints[index];
    const originalStartPoint = points[index - 1];
    const originalEndPoint = points[index];

    if (!startPoint || !endPoint || !originalStartPoint || !originalEndPoint) {
      continue;
    }

    if (!isFinitePoint(startPoint) || !isFinitePoint(endPoint)) {
      continue;
    }

    const elevationMeters = resolveSegmentElevationMeters(originalStartPoint, originalEndPoint);
    const color = elevationToColor(elevationMeters, {
      fallbackColor,
      maxMeters,
      minMeters,
    });

    if (samplesPerSeg === 1) {
      segments.push({
        color,
        ...(elevationMeters !== undefined ? { elevationMeters } : {}),
        end: toSimplePoint(endPoint),
        positions: [
          [startPoint.lat, startPoint.lng],
          [endPoint.lat, endPoint.lng],
        ],
        start: toSimplePoint(startPoint),
      });
      continue;
    }

    const previousControlPoint = basePoints[index - 2] ?? startPoint;
    const nextControlPoint = basePoints[index + 1] ?? endPoint;
    let previousPoint = toSimplePoint(startPoint);

    for (let sampleIndex = 1; sampleIndex <= samplesPerSeg; sampleIndex += 1) {
      const currentPoint = catmullRomPoint(
        previousControlPoint,
        startPoint,
        endPoint,
        nextControlPoint,
        sampleIndex / samplesPerSeg,
      );

      segments.push({
        color,
        ...(elevationMeters !== undefined ? { elevationMeters } : {}),
        end: currentPoint,
        positions: [
          [previousPoint.lat, previousPoint.lng],
          [currentPoint.lat, currentPoint.lng],
        ],
        start: previousPoint,
      });

      previousPoint = currentPoint;
    }
  }

  return segments;
}

/**
 * Creates colored render segments from stream points using average segment heart rate.
 */
export function buildHeartRateSegments(
  points: readonly StreamPoint[],
  options: BuildHeartRateSegmentsOptions = {},
): HeartRateSegment[] {
  if (points.length < 2) {
    return [];
  }

  const {
    fallbackColor = '#ef4444',
    maxBpm = 190,
    minBpm = 90,
    smooth,
  } = options;
  const alpha = smooth?.alpha;
  const basePoints =
    alpha !== undefined && Number.isFinite(alpha) ? emaSmoothPoints(points, alpha) : [...points];
  const samplesPerSeg = Math.max(1, Math.floor(smooth?.samplesPerSeg ?? 1));
  const segments: HeartRateSegment[] = [];

  for (let index = 1; index < basePoints.length; index += 1) {
    const startPoint = basePoints[index - 1];
    const endPoint = basePoints[index];
    const originalStartPoint = points[index - 1];
    const originalEndPoint = points[index];

    if (!startPoint || !endPoint || !originalStartPoint || !originalEndPoint) {
      continue;
    }

    if (!isFinitePoint(startPoint) || !isFinitePoint(endPoint)) {
      continue;
    }

    const heartRateBpm = resolveSegmentHeartRateBpm(originalStartPoint, originalEndPoint);
    const color = heartRateToColor(heartRateBpm, {
      fallbackColor,
      maxBpm,
      minBpm,
    });

    if (samplesPerSeg === 1) {
      segments.push({
        color,
        end: toSimplePoint(endPoint),
        ...(heartRateBpm !== undefined ? { heartRateBpm } : {}),
        positions: [
          [startPoint.lat, startPoint.lng],
          [endPoint.lat, endPoint.lng],
        ],
        start: toSimplePoint(startPoint),
      });
      continue;
    }

    const previousControlPoint = basePoints[index - 2] ?? startPoint;
    const nextControlPoint = basePoints[index + 1] ?? endPoint;
    let previousPoint = toSimplePoint(startPoint);

    for (let sampleIndex = 1; sampleIndex <= samplesPerSeg; sampleIndex += 1) {
      const currentPoint = catmullRomPoint(
        previousControlPoint,
        startPoint,
        endPoint,
        nextControlPoint,
        sampleIndex / samplesPerSeg,
      );

      segments.push({
        color,
        end: currentPoint,
        ...(heartRateBpm !== undefined ? { heartRateBpm } : {}),
        positions: [
          [previousPoint.lat, previousPoint.lng],
          [currentPoint.lat, currentPoint.lng],
        ],
        start: previousPoint,
      });

      previousPoint = currentPoint;
    }
  }

  return segments;
}

/**
 * Normalizes supported timestamp values into seconds.
 */
export function toTimeSeconds(value: TimeValue | null | undefined): number | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (value instanceof Date) {
    const milliseconds = value.getTime();
    return Number.isFinite(milliseconds) ? milliseconds / 1_000 : undefined;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  const milliseconds = new Date(value).getTime();
  return Number.isFinite(milliseconds) ? milliseconds / 1_000 : undefined;
}

function catmullRomPoint(
  p0: GeoPoint,
  p1: GeoPoint,
  p2: GeoPoint,
  p3: GeoPoint,
  t: number,
): GeoPoint {
  const t2 = t * t;
  const t3 = t2 * t;
  const interpolate = (a0: number, a1: number, a2: number, a3: number): number =>
    0.5 *
    (2 * a1 +
      (-a0 + a2) * t +
      (2 * a0 - 5 * a1 + 4 * a2 - a3) * t2 +
      (-a0 + 3 * a1 - 3 * a2 + a3) * t3);

  return {
    lat: interpolate(p0.lat, p1.lat, p2.lat, p3.lat),
    lng: interpolate(p0.lng, p1.lng, p2.lng, p3.lng),
  };
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function interpolateHexColor(from: string, to: string, factor: number): string {
  const safeFactor = clamp(factor, 0, 1);
  const fromColor = parseHexColor(from);
  const toColor = parseHexColor(to);

  return toHexColor({
    blue: Math.round(fromColor.blue + (toColor.blue - fromColor.blue) * safeFactor),
    green: Math.round(fromColor.green + (toColor.green - fromColor.green) * safeFactor),
    red: Math.round(fromColor.red + (toColor.red - fromColor.red) * safeFactor),
  });
}

function isFinitePoint(point: GeoPoint): boolean {
  return Number.isFinite(point.lat) && Number.isFinite(point.lng);
}

function parseHexColor(value: string): { blue: number; green: number; red: number } {
  const normalized = value.replace('#', '');

  return {
    blue: Number.parseInt(normalized.slice(4, 6), 16),
    green: Number.parseInt(normalized.slice(2, 4), 16),
    red: Number.parseInt(normalized.slice(0, 2), 16),
  };
}

function resolveSegmentSpeedKmh(start: StreamPoint, end: StreamPoint): number | undefined {
  if (
    typeof start.speedKmh === 'number' &&
    Number.isFinite(start.speedKmh) &&
    typeof end.speedKmh === 'number' &&
    Number.isFinite(end.speedKmh)
  ) {
    return roundToTwoDecimals((start.speedKmh + end.speedKmh) / 2);
  }

  const startTimeSeconds = toTimeSeconds(start.time);
  const endTimeSeconds = toTimeSeconds(end.time);

  if (
    startTimeSeconds === undefined ||
    endTimeSeconds === undefined ||
    endTimeSeconds <= startTimeSeconds
  ) {
    return undefined;
  }

  const distanceMeters = haversineDistanceMeters(start, end);
  const durationSeconds = endTimeSeconds - startTimeSeconds;

  if (durationSeconds <= 0) {
    return undefined;
  }

  return roundToTwoDecimals((distanceMeters / durationSeconds) * 3.6);
}

function resolveSegmentElevationMeters(start: StreamPoint, end: StreamPoint): number | undefined {
  if (
    typeof start.elevation === 'number' &&
    Number.isFinite(start.elevation) &&
    typeof end.elevation === 'number' &&
    Number.isFinite(end.elevation)
  ) {
    return roundToTwoDecimals((start.elevation + end.elevation) / 2);
  }

  return undefined;
}

function resolveSegmentHeartRateBpm(start: StreamPoint, end: StreamPoint): number | undefined {
  if (
    typeof start.heartRate === 'number' &&
    Number.isFinite(start.heartRate) &&
    typeof end.heartRate === 'number' &&
    Number.isFinite(end.heartRate)
  ) {
    return roundToTwoDecimals((start.heartRate + end.heartRate) / 2);
  }

  return undefined;
}

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

function toSimplePoint(point: GeoPoint): GeoPoint {
  return { lat: point.lat, lng: point.lng };
}

function toHexColor(color: { blue: number; green: number; red: number }): string {
  return `#${[color.red, color.green, color.blue]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')}`;
}
