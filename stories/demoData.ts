import type { FeatureCollection } from 'geojson';

import { buildTrackHeatmapPoints, zipStreamToPoints } from '../src';
import { parseGpx } from '../src/parsers';

export const pragueCenter = { lat: 50.0755, lng: 14.4378 } as const;
export const polylinePath = [
  { lat: 50.0784, lng: 14.4208 },
  { lat: 50.081, lng: 14.4285 },
  { lat: 50.0781, lng: 14.4367 },
  { lat: 50.0738, lng: 14.4439 },
] as const;
export const sampleGeoJson: FeatureCollection = {
  features: [
    {
      geometry: {
        coordinates: [
          [14.4308, 50.0704],
          [14.4351, 50.0801],
          [14.4428, 50.0774],
          [14.4401, 50.0693],
          [14.4308, 50.0704],
        ],
        type: 'LineString',
      },
      properties: {
        name: 'Riverside circuit',
      },
      type: 'Feature',
    },
  ],
  type: 'FeatureCollection',
};
export const sampleGpx = parseGpx(`<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="react-mapy storybook">
  <metadata>
    <name>Prague training loop</name>
    <time>2026-03-26T07:00:00Z</time>
  </metadata>
  <trk>
    <name>Tempo morning</name>
    <trkseg>
      <trkpt lat="50.0784" lon="14.4208"><ele>190</ele><time>2026-03-26T07:00:00Z</time></trkpt>
      <trkpt lat="50.0798" lon="14.4255"><ele>192</ele><time>2026-03-26T07:02:25Z</time></trkpt>
      <trkpt lat="50.0782" lon="14.4311"><ele>194</ele><time>2026-03-26T07:05:05Z</time></trkpt>
      <trkpt lat="50.0759" lon="14.4381"><ele>196</ele><time>2026-03-26T07:08:10Z</time></trkpt>
      <trkpt lat="50.0736" lon="14.4444"><ele>194</ele><time>2026-03-26T07:11:45Z</time></trkpt>
    </trkseg>
  </trk>
</gpx>`);
const requiredTrack = sampleGpx.tracks[0];

if (!requiredTrack) {
  throw new Error('Expected the Storybook GPX sample to include a track.');
}

export const sampleTrack = requiredTrack;
export const sampleStreamPoints = zipStreamToPoints({
  elevation: [188, 205, 228, 214, 236],
  heartRate: [132, 141, 156, 168, 151],
  path: [
    { lat: 50.0784, lng: 14.4208 },
    { lat: 50.0798, lng: 14.4255 },
    { lat: 50.0782, lng: 14.4311 },
    { lat: 50.0759, lng: 14.4381 },
    { lat: 50.0736, lng: 14.4444 },
  ],
  distance: [0, 0.52, 1.07, 1.74, 2.31],
  speedKmh: [8.2, 10.8, 14.6, 18.4, 12.1],
  time: [
    '2026-03-26T07:00:00Z',
    '2026-03-26T07:02:25Z',
    '2026-03-26T07:05:05Z',
    '2026-03-26T07:08:10Z',
    '2026-03-26T07:11:45Z',
  ],
});

export const historicalEventHeatmapPoints = [
  { lat: 50.0756, lng: 14.4377 },
  { lat: 50.0757, lng: 14.4379 },
  { lat: 50.0758, lng: 14.438 },
  { lat: 50.0758, lng: 14.438 },
  { lat: 50.0762, lng: 14.4404 },
  { lat: 50.0762, lng: 14.4404 },
  { lat: 50.0762, lng: 14.4404 },
  { lat: 50.0738, lng: 14.4341 },
  { lat: 50.0738, lng: 14.4341 },
  { lat: 50.0745, lng: 14.4454 },
  { lat: 50.0789, lng: 14.4305 },
  { lat: 50.0789, lng: 14.4305 },
  { lat: 50.0789, lng: 14.4305 },
  { lat: 50.0791, lng: 14.4312 },
] as const;

export const historicalTrackPaths = [
  [
    { lat: 50.0782, lng: 14.4213 },
    { lat: 50.0796, lng: 14.4261 },
    { lat: 50.0784, lng: 14.4316 },
    { lat: 50.0761, lng: 14.4383 },
    { lat: 50.0739, lng: 14.4441 },
  ],
  [
    { lat: 50.0786, lng: 14.4221 },
    { lat: 50.0802, lng: 14.4271 },
    { lat: 50.0787, lng: 14.4324 },
    { lat: 50.0764, lng: 14.4389 },
    { lat: 50.0742, lng: 14.4447 },
  ],
  [
    { lat: 50.0778, lng: 14.4206 },
    { lat: 50.0791, lng: 14.4251 },
    { lat: 50.0778, lng: 14.4308 },
    { lat: 50.0755, lng: 14.4376 },
    { lat: 50.0731, lng: 14.4436 },
  ],
] as const;

export const historicalTrackHeatmapPoints = buildTrackHeatmapPoints(historicalTrackPaths, {
  sampleStepMeters: 25,
});
