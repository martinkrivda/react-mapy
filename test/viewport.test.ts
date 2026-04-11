import type { FeatureCollection } from 'geojson';
import { describe, expect, it } from 'vitest';

import { computeDataBounds } from '../src';

describe('computeDataBounds', () => {
  it('merges points, paths, explicit bounds, and geojson into one bounding box', () => {
    const geoJson = {
      features: [
        {
          geometry: {
            coordinates: [
              [14.43, 50.07],
              [14.447, 50.082],
            ],
            type: 'LineString',
          },
          properties: {},
          type: 'Feature',
        },
      ],
      type: 'FeatureCollection',
    } satisfies FeatureCollection;

    const bounds = computeDataBounds({
      bounds: [
        {
          east: 14.445,
          north: 50.079,
          south: 50.074,
          west: 14.434,
        },
      ],
      geoJson,
      paths: [[{ lat: 50.071, lng: 14.433 }, { lat: 50.08, lng: 14.441 }]],
      points: [{ lat: 50.069, lng: 14.432 }],
    });

    expect(bounds).toEqual({
      east: 14.447,
      north: 50.082,
      south: 50.069,
      west: 14.43,
    });
  });

  it('returns undefined when no data is provided', () => {
    expect(computeDataBounds({})).toBeUndefined();
  });
});
