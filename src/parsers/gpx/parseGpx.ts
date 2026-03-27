import { XMLParser } from 'fast-xml-parser';

import { computeBounds, haversineDistanceMeters } from '../../core/geometry';
import type { GeoBounds, TimedGeoPoint } from '../../core/types';
import type {
  GpxDocument,
  GpxMetadata,
  GpxRoute,
  GpxSummary,
  GpxTrack,
  GpxTrackPoint,
  GpxTrackSegment,
  GpxWaypoint,
  ParseGpxOptions,
} from './types';

const gpxParser = new XMLParser({
  attributeNamePrefix: '',
  ignoreAttributes: false,
  parseAttributeValue: false,
  parseTagValue: false,
  removeNSPrefix: true,
  trimValues: true,
});

/**
 * Parses a GPX document into typed, DOM-free data structures.
 */
export function parseGpx(source: string, options: ParseGpxOptions = {}): GpxDocument {
  if (source.trim().length === 0) {
    throw new Error('GPX source is empty.');
  }

  const parsedDocument = gpxParser.parse(source) as { gpx?: Record<string, unknown> };
  const root = asRecord(parsedDocument.gpx);

  if (!root) {
    throw new Error('Unable to parse GPX document.');
  }

  const metadata = parseMetadata(asRecord(root.metadata));
  const waypoints = toArray(root.wpt)
    .map(asRecord)
    .flatMap((node) => (node ? [parseWaypoint(node)] : []));
  const routes = toArray(root.rte)
    .map(asRecord)
    .flatMap((node) => (node ? [parseRoute(node)] : []));
  const tracks = toArray(root.trk)
    .map(asRecord)
    .flatMap((node) => (node ? [parseTrack(node, options)] : []));

  const allPoints = [
    ...waypoints,
    ...routes.flatMap((route) => route.points),
    ...tracks.flatMap((track) => track.segments.flatMap((segment) => segment.points)),
  ];
  const bounds = metadata?.bounds ?? computeBounds(allPoints);

  return {
    routes,
    tracks,
    waypoints,
    ...definedProps({
      bounds,
      metadata,
    }),
  } as GpxDocument;
}

function parseMetadata(node?: Record<string, unknown>): GpxMetadata | undefined {
  if (!node) {
    return undefined;
  }

  const bounds = parseBounds(asRecord(node.bounds));
  const metadata = {
    ...definedProps({
      bounds,
      description: asString(node.desc),
      keywords: asString(node.keywords),
      name: asString(node.name),
      time: parseDate(node.time),
    }),
  } as GpxMetadata;

  return hasDefinedValue(metadata) ? metadata : undefined;
}

function parseWaypoint(node: Record<string, unknown>): GpxWaypoint {
  return {
    lat: parseRequiredNumber(node.lat, 'lat'),
    lng: parseRequiredNumber(node.lon, 'lon'),
    ...definedProps({
      comment: asString(node.cmt),
      description: asString(node.desc),
      elevation: parseNumber(node.ele),
      name: asString(node.name),
      symbol: asString(node.sym),
      time: parseDate(node.time),
    }),
  } as GpxWaypoint;
}

function parseRoute(node: Record<string, unknown>): GpxRoute {
  const points = toArray(node.rtept)
    .map(asRecord)
    .flatMap((routePoint) => (routePoint ? [parseWaypoint(routePoint)] : []));

  return {
    points,
    summary: summarizePoints(points),
    ...definedProps({
      name: asString(node.name),
    }),
  } as GpxRoute;
}

function parseTrack(node: Record<string, unknown>, options: ParseGpxOptions): GpxTrack {
  const segments = toArray(node.trkseg)
    .map(asRecord)
    .flatMap((segment) => (segment ? [parseTrackSegment(segment, options)] : []));
  const allPoints = segments.flatMap((segment) => segment.points);

  return {
    segments,
    summary: summarizePoints(allPoints),
    ...definedProps({
      description: asString(node.desc),
      name: asString(node.name),
    }),
  } as GpxTrack;
}

function parseTrackSegment(node: Record<string, unknown>, options: ParseGpxOptions): GpxTrackSegment {
  const points = toArray(node.trkpt)
    .map(asRecord)
    .flatMap((trackPoint) => (trackPoint ? [parseTrackPoint(trackPoint, options)] : []));

  return {
    points,
    summary: summarizePoints(points),
  };
}

function parseTrackPoint(node: Record<string, unknown>, options: ParseGpxOptions): GpxTrackPoint {
  return {
    lat: parseRequiredNumber(node.lat, 'lat'),
    lng: parseRequiredNumber(node.lon, 'lon'),
    ...definedProps({
      elevation: parseNumber(node.ele),
      extensions: options.preserveExtensions ? asRecord(node.extensions) : undefined,
      name: asString(node.name),
      time: parseDate(node.time),
    }),
  } as GpxTrackPoint;
}

function summarizePoints(points: readonly TimedGeoPoint[]): GpxSummary {
  let distanceMeters = 0;
  let durationSeconds = 0;
  let hasDuration = false;
  let elevationGainMeters = 0;
  let elevationLossMeters = 0;

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];

    if (!previous || !current) {
      continue;
    }

    distanceMeters += haversineDistanceMeters(previous, current);

    const durationDelta = getDurationSeconds(previous.time, current.time);

    if (durationDelta !== undefined) {
      durationSeconds += durationDelta;
      hasDuration = true;
    }

    if (previous.elevation !== undefined && current.elevation !== undefined) {
      const elevationDelta = current.elevation - previous.elevation;

      if (elevationDelta > 0) {
        elevationGainMeters += elevationDelta;
      } else {
        elevationLossMeters += Math.abs(elevationDelta);
      }
    }
  }

  return {
    distanceMeters,
    elevationGainMeters,
    elevationLossMeters,
    pointCount: points.length,
    ...definedProps({
      bounds: computeBounds(points),
      durationSeconds: hasDuration ? durationSeconds : undefined,
    }),
  } as GpxSummary;
}

function parseBounds(node?: Record<string, unknown>): GeoBounds | undefined {
  if (!node) {
    return undefined;
  }

  const south = parseNumber(node.minlat);
  const west = parseNumber(node.minlon);
  const north = parseNumber(node.maxlat);
  const east = parseNumber(node.maxlon);

  if (
    south === undefined ||
    west === undefined ||
    north === undefined ||
    east === undefined
  ) {
    return undefined;
  }

  return { east, north, south, west };
}

function parseRequiredNumber(value: unknown, fieldName: string): number {
  const parsed = parseNumber(value);

  if (parsed === undefined) {
    throw new Error(`GPX point is missing a valid "${fieldName}" value.`);
  }

  return parsed;
}

function parseNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseDate(value: unknown): Date | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function getDurationSeconds(start?: Date, end?: Date): number | undefined {
  if (!start || !end) {
    return undefined;
  }

  const durationSeconds = (end.getTime() - start.getTime()) / 1_000;
  return durationSeconds > 0 ? durationSeconds : undefined;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function toArray<T>(value: T | readonly T[] | undefined): readonly T[] {
  if (value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value as T];
}

function hasDefinedValue<T extends object>(value: T): boolean {
  return Object.values(value).some((entry) => entry !== undefined);
}

function definedProps<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as Partial<T>;
}
