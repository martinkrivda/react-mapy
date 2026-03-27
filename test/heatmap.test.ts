import { describe, expect, it } from 'vitest';

import { buildTrackHeatmapPoints, normalizeHeatmapPoints } from '../src';

describe('heatmap utilities', () => {
  it('normalizes points and keeps explicit intensities', () => {
    const points = normalizeHeatmapPoints(
      [
        { lat: 50.0755, lng: 14.4378 },
        { intensity: 3, lat: 50.076, lng: 14.4381 },
      ],
      { defaultIntensity: 0.5 },
    );

    expect(points).toEqual([
      { intensity: 0.5, lat: 50.0755, lng: 14.4378 },
      { intensity: 3, lat: 50.076, lng: 14.4381 },
    ]);
  });

  it('densifies historical tracks into continuous heatmap points', () => {
    const points = buildTrackHeatmapPoints(
      [
        [
          { lat: 50.0755, lng: 14.4378 },
          { lat: 50.0755, lng: 14.4398 },
        ],
      ],
      { defaultIntensity: 2, sampleStepMeters: 50 },
    );

    expect(points.length).toBeGreaterThan(2);
    expect(points[0]).toEqual({
      intensity: 2,
      lat: 50.0755,
      lng: 14.4378,
    });
    expect(points.at(-1)).toEqual({
      intensity: 2,
      lat: 50.0755,
      lng: 14.4398,
    });
  });
});
