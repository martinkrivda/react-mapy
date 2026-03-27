import type { GeoBounds, TimedGeoPoint } from '../../core/types';

/**
 * Aggregate statistics for a parsed GPX structure.
 */
export interface GpxSummary {
  bounds?: GeoBounds;
  distanceMeters: number;
  durationSeconds?: number;
  elevationGainMeters: number;
  elevationLossMeters: number;
  pointCount: number;
}

/**
 * Common metadata fields extracted from a GPX document.
 */
export interface GpxMetadata {
  bounds?: GeoBounds;
  description?: string;
  keywords?: string;
  name?: string;
  time?: Date;
}

/**
 * GPX waypoint record.
 */
export interface GpxWaypoint extends TimedGeoPoint {
  comment?: string;
  description?: string;
  name?: string;
  symbol?: string;
}

/**
 * Parsed GPX route.
 */
export interface GpxRoute {
  name?: string;
  points: GpxWaypoint[];
  summary: GpxSummary;
}

/**
 * Parsed GPX track point.
 */
export interface GpxTrackPoint extends TimedGeoPoint {
  extensions?: Record<string, unknown>;
  name?: string;
}

/**
 * Parsed GPX track segment.
 */
export interface GpxTrackSegment {
  points: GpxTrackPoint[];
  summary: GpxSummary;
}

/**
 * Parsed GPX track.
 */
export interface GpxTrack {
  description?: string;
  name?: string;
  segments: GpxTrackSegment[];
  summary: GpxSummary;
}

/**
 * Complete parsed GPX document.
 */
export interface GpxDocument {
  bounds?: GeoBounds;
  metadata?: GpxMetadata;
  routes: GpxRoute[];
  tracks: GpxTrack[];
  waypoints: GpxWaypoint[];
}

/**
 * Parser options for retaining extra GPX extension payloads.
 */
export interface ParseGpxOptions {
  preserveExtensions?: boolean;
}
