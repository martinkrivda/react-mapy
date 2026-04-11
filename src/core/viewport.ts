import type {
  Feature,
  FeatureCollection,
  GeoJsonObject,
  Geometry,
  GeometryCollection,
  Position,
} from 'geojson';

import { computeBounds } from './geometry';
import type { GeoBounds, GeoPointLike } from './types';

export interface FitToDataInput {
  bounds?: readonly GeoBounds[];
  geoJson?: GeoJsonObject;
  paths?: readonly (readonly GeoPointLike[])[];
  points?: readonly GeoPointLike[];
}

function mergeBounds(values: readonly GeoBounds[]): GeoBounds | undefined {
  if (values.length === 0) {
    return undefined;
  }

  let south = Number.POSITIVE_INFINITY;
  let west = Number.POSITIVE_INFINITY;
  let north = Number.NEGATIVE_INFINITY;
  let east = Number.NEGATIVE_INFINITY;

  for (const value of values) {
    south = Math.min(south, value.south);
    west = Math.min(west, value.west);
    north = Math.max(north, value.north);
    east = Math.max(east, value.east);
  }

  return { east, north, south, west };
}

function collectFeatureCoordinates(value: Feature): Position[] {
  return value.geometry ? collectGeometryCoordinates(value.geometry) : [];
}

function collectFeatureCollectionCoordinates(value: FeatureCollection): Position[] {
  return value.features.flatMap(collectFeatureCoordinates);
}

function collectGeometryCollectionCoordinates(value: GeometryCollection): Position[] {
  return value.geometries.flatMap(collectGeometryCoordinates);
}

function collectGeometryCoordinates(value: Geometry): Position[] {
  switch (value.type) {
    case 'GeometryCollection':
      return collectGeometryCollectionCoordinates(value);
    case 'Point':
      return [value.coordinates];
    case 'MultiPoint':
    case 'LineString':
      return value.coordinates;
    case 'MultiLineString':
    case 'Polygon':
      return value.coordinates.flat();
    case 'MultiPolygon':
      return value.coordinates.flat(2);
  }
}

function collectGeoJsonCoordinates(value: GeoJsonObject): Position[] {
  switch (value.type) {
    case 'Feature':
      return collectFeatureCoordinates(value as Feature);
    case 'FeatureCollection':
      return collectFeatureCollectionCoordinates(value as FeatureCollection);
    default:
      return collectGeometryCoordinates(value as Geometry);
  }
}

/**
 * Computes a geographic bounding box from mixed map data inputs.
 */
export function computeDataBounds({
  bounds = [],
  geoJson,
  paths = [],
  points = [],
}: FitToDataInput): GeoBounds | undefined {
  const collectedBounds: GeoBounds[] = [...bounds];

  if (points.length > 0) {
    const pointBounds = computeBounds(points);

    if (pointBounds) {
      collectedBounds.push(pointBounds);
    }
  }

  for (const path of paths) {
    const pathBounds = computeBounds(path);

    if (pathBounds) {
      collectedBounds.push(pathBounds);
    }
  }

  if (geoJson) {
    const geoJsonPoints = collectGeoJsonCoordinates(geoJson).flatMap((position) => {
      const [lng, lat] = position;

      if (typeof lat !== 'number' || typeof lng !== 'number') {
        return [];
      }

      return [{ lat, lng }];
    });
    const geoJsonBounds = computeBounds(geoJsonPoints);

    if (geoJsonBounds) {
      collectedBounds.push(geoJsonBounds);
    }
  }

  return mergeBounds(collectedBounds);
}
