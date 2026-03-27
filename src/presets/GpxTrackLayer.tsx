import {
  featureGroup,
  polyline,
  type ControlPosition,
  type FitBoundsOptions,
  type PathOptions,
} from 'leaflet';
import { useEffect } from 'react';

import { buildPaceSegments, DEFAULT_PACE_COLOR_STOPS, toLatLngTuple } from '../core';
import type { PaceColorStop } from '../core';
import { useLeafletMap } from '../leaflet';
import { runWhenMapReady } from '../leaflet/lifecycle';
import type { GpxTrack, GpxTrackSegment } from '../parsers/gpx';
import { createTrackLegendBadge, retainTrackLegendBadge } from './trackLegend';

/**
 * Props for the high-level GPX track visualization layer.
 */
export interface GpxTrackLayerProps {
  color?: string;
  colorMode?: 'pace' | 'solid';
  fallbackColor?: string;
  fitBounds?: boolean;
  fitBoundsOptions?: FitBoundsOptions;
  legendPosition?: ControlPosition;
  minimumDistanceMeters?: number;
  paceColorStops?: readonly PaceColorStop[];
  pathOptions?: PathOptions;
  showLegend?: boolean;
  track: GpxTrack | GpxTrackSegment;
  weight?: number;
}

/**
 * Renders a parsed GPX track with either a single stroke or pace-based coloring.
 */
export function GpxTrackLayer({
  color = '#0f172a',
  colorMode = 'pace',
  fallbackColor = '#64748b',
  fitBounds = false,
  fitBoundsOptions,
  legendPosition = 'topright',
  minimumDistanceMeters,
  paceColorStops = DEFAULT_PACE_COLOR_STOPS,
  pathOptions,
  showLegend = true,
  track,
  weight = 4,
}: GpxTrackLayerProps): null {
  const map = useLeafletMap();
  const points = 'segments' in track ? track.segments.flatMap((segment) => segment.points) : track.points;

  useEffect(() => {
    if (points.length < 2) {
      return;
    }

    const group = featureGroup();
    let mounted = false;
    let releaseLegend = () => {};
    const cancel = runWhenMapReady(map, () => {
      group.addTo(map);
      mounted = true;
      releaseLegend =
        showLegend && colorMode === 'pace'
          ? retainTrackLegendBadge(
              map,
              createTrackLegendBadge({
                mode: 'pace',
                paceColorStops,
              }),
              { position: legendPosition },
            )
          : () => {};

      if (colorMode === 'solid') {
        polyline(points.map(toLatLngTuple), {
          ...pathOptions,
          color,
          weight,
        }).addTo(group);
      } else {
        const segments = buildPaceSegments(points, {
          colorStops: paceColorStops,
          fallbackColor,
          ...(minimumDistanceMeters !== undefined ? { minimumDistanceMeters } : {}),
        });

        if (segments.length === 0) {
          polyline(points.map(toLatLngTuple), {
            ...pathOptions,
            color: fallbackColor,
            weight,
          }).addTo(group);
        } else {
          for (const segment of segments) {
            polyline([toLatLngTuple(segment.start), toLatLngTuple(segment.end)], {
              ...pathOptions,
              color: segment.color,
              weight,
            }).addTo(group);
          }
        }
      }

      if (fitBounds && group.getLayers().length > 0) {
        map.fitBounds(group.getBounds(), fitBoundsOptions);
      }
    });

    return () => {
      cancel();
      releaseLegend();

      if (mounted) {
        group.remove();
      }
    };
  }, [
    color,
    colorMode,
    fallbackColor,
    fitBounds,
    fitBoundsOptions,
    legendPosition,
    map,
    minimumDistanceMeters,
    paceColorStops,
    pathOptions,
    points,
    showLegend,
    weight,
  ]);

  return null;
}
