import { describe, expect, it } from 'vitest';

import { buildPaceSegments } from '../src/core';
import { parseGpx } from '../src/parsers';

const sampleGpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="react-mapy tests">
  <metadata>
    <name>Tempo session</name>
    <time>2026-03-26T07:00:00Z</time>
  </metadata>
  <wpt lat="50.0755" lon="14.4378">
    <name>Start</name>
  </wpt>
  <trk>
    <name>Track one</name>
    <trkseg>
      <trkpt lat="50.0784" lon="14.4208"><ele>190</ele><time>2026-03-26T07:00:00Z</time></trkpt>
      <trkpt lat="50.0798" lon="14.4255"><ele>192</ele><time>2026-03-26T07:02:25Z</time></trkpt>
      <trkpt lat="50.0782" lon="14.4311"><ele>194</ele><time>2026-03-26T07:05:05Z</time></trkpt>
      <trkpt lat="50.0759" lon="14.4381"><ele>196</ele><time>2026-03-26T07:08:10Z</time></trkpt>
    </trkseg>
  </trk>
</gpx>`;

describe('parseGpx', () => {
  it('parses tracks, metadata, and summaries without DOM APIs', () => {
    const document = parseGpx(sampleGpx);
    const track = document.tracks[0];

    expect(document.metadata?.name).toBe('Tempo session');
    expect(document.waypoints).toHaveLength(1);
    expect(document.tracks).toHaveLength(1);
    expect(track?.segments).toHaveLength(1);
    expect(track?.summary.pointCount).toBe(4);
    expect(track?.summary.distanceMeters).toBeGreaterThan(1_000);
    expect(track?.summary.durationSeconds).toBe(490);
  });

  it('produces pace segments from parsed track points', () => {
    const track = parseGpx(sampleGpx).tracks[0];

    if (!track) {
      throw new Error('Expected GPX fixture to include a track.');
    }

    const segments = buildPaceSegments(track.segments[0]?.points ?? []);

    expect(segments).toHaveLength(3);
    expect(segments[0]?.paceSecondsPerKilometer).toBeGreaterThan(0);
    expect(segments[0]?.color).toBeTruthy();
  });
});
