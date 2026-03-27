import { describe, expect, it } from 'vitest';

import {
  buildElevationSegments,
  buildHeartRateSegments,
  buildSpeedSegments,
  emaSmoothPoints,
  elevationToColor,
  heartRateToColor,
  hslToHex,
  speedToColor,
  toTimeSeconds,
  zipStreamToPoints,
} from '../src';

describe('track utilities', () => {
  it('converts HSL colors to hex and maps speed to a red-yellow-green ramp', () => {
    expect(hslToHex(0, 1, 0.5)).toBe('#ff0000');
    expect(hslToHex(120, 1, 0.5)).toBe('#00ff00');
    expect(speedToColor(5, { maxKmh: 20, minKmh: 5 })).toBe('#ff0000');
    expect(speedToColor(20, { maxKmh: 20, minKmh: 5 })).toBe('#00ff00');
    expect(elevationToColor(0, { maxMeters: 1_500, minMeters: 0 })).toBe('#ef4444');
    expect(elevationToColor(1_500, { maxMeters: 1_500, minMeters: 0 })).toBe('#7c2d12');
    expect(heartRateToColor(90, { maxBpm: 190, minBpm: 90 })).toBe('#ffa3a3');
    expect(heartRateToColor(190, { maxBpm: 190, minBpm: 90 })).toBe('#8f0000');
  });

  it('smooths points while preserving the other fields', () => {
    const points = [
      { lat: 0, lng: 0, speedKmh: 10, time: '2026-03-26T07:00:00Z' },
      { lat: 10, lng: 10, speedKmh: 12, time: '2026-03-26T07:01:00Z' },
    ] as const;

    const smoothedPoints = emaSmoothPoints(points, 0.5);

    expect(smoothedPoints[1]).toMatchObject({
      lat: 5,
      lng: 5,
      speedKmh: 12,
      time: '2026-03-26T07:01:00Z',
    });
  });

  it('zips path, time, and speed streams into renderable points', () => {
    const points = zipStreamToPoints({
      distance: [0, 0.52],
      elevation: [188, 205],
      heartRate: [132, 141],
      path: [
        { lat: 50.0784, lng: 14.4208 },
        { lat: 50.0798, lng: 14.4255 },
      ],
      speedKmh: [8.2, 10.8],
      time: ['2026-03-26T07:00:00Z', '2026-03-26T07:02:25Z'],
    });

    expect(points).toEqual([
      {
        distanceKm: 0,
        elevation: 188,
        heartRate: 132,
        lat: 50.0784,
        lng: 14.4208,
        speedKmh: 8.2,
        time: '2026-03-26T07:00:00Z',
      },
      {
        distanceKm: 0.52,
        elevation: 205,
        heartRate: 141,
        lat: 50.0798,
        lng: 14.4255,
        speedKmh: 10.8,
        time: '2026-03-26T07:02:25Z',
      },
    ]);
  });

  it('builds speed-colored segments and supports curve densification', () => {
    const points = zipStreamToPoints({
      elevation: [188, 205, 228],
      path: [
        { lat: 50.0784, lng: 14.4208 },
        { lat: 50.0798, lng: 14.4255 },
        { lat: 50.0782, lng: 14.4311 },
      ],
      speedKmh: [8.2, 10.8, 14.6],
      time: ['2026-03-26T07:00:00Z', '2026-03-26T07:02:25Z', '2026-03-26T07:05:05Z'],
    });

    const directSegments = buildSpeedSegments(points, {
      maxKmh: 20,
      minKmh: 5,
    });
    const smoothedSegments = buildSpeedSegments(points, {
      maxKmh: 20,
      minKmh: 5,
      smooth: { alpha: 0.25, samplesPerSeg: 4 },
    });

    expect(directSegments).toHaveLength(2);
    expect(directSegments[0]?.speedKmh).toBe(9.5);
    expect(directSegments[0]?.color).toBeTruthy();
    expect(smoothedSegments).toHaveLength(8);
  });

  it('builds elevation-colored segments from stream points', () => {
    const points = zipStreamToPoints({
      elevation: [188, 205, 228],
      path: [
        { lat: 50.0784, lng: 14.4208 },
        { lat: 50.0798, lng: 14.4255 },
        { lat: 50.0782, lng: 14.4311 },
      ],
    });

    const segments = buildElevationSegments(points, {
      maxMeters: 300,
      minMeters: 150,
      smooth: { alpha: 0.25, samplesPerSeg: 2 },
    });

    expect(segments).toHaveLength(4);
    expect(segments[0]?.elevationMeters).toBe(196.5);
    expect(segments[0]?.color).toBeTruthy();
  });

  it('builds heart-rate-colored segments from stream points', () => {
    const points = zipStreamToPoints({
      heartRate: [132, 141, 156],
      path: [
        { lat: 50.0784, lng: 14.4208 },
        { lat: 50.0798, lng: 14.4255 },
        { lat: 50.0782, lng: 14.4311 },
      ],
    });

    const segments = buildHeartRateSegments(points, {
      maxBpm: 180,
      minBpm: 120,
      smooth: { alpha: 0.25, samplesPerSeg: 2 },
    });

    expect(segments).toHaveLength(4);
    expect(segments[0]?.heartRateBpm).toBe(136.5);
    expect(segments[0]?.color).toBeTruthy();
  });

  it('normalizes supported timestamp values to seconds', () => {
    expect(toTimeSeconds(120)).toBe(120);
    expect(toTimeSeconds(new Date('2026-03-26T07:00:00Z'))).toBe(1_774_508_400);
    expect(toTimeSeconds('2026-03-26T07:00:00Z')).toBe(1_774_508_400);
  });
});
