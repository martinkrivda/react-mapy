import {
  featureGroup,
  polyline,
  type ControlPosition,
  type FitBoundsOptions,
  type PathOptions,
} from 'leaflet';
import { useEffect } from 'react';

import {
  buildElevationSegments,
  buildHeartRateSegments,
  buildSpeedSegments,
  toLatLngTuple,
} from '../core';
import type {
  ElevationColorOptions,
  HeartRateColorOptions,
  SpeedColorOptions,
  StreamPoint,
  TrackSmoothingOptions,
} from '../core';
import { useLeafletMap } from '../leaflet';
import { runWhenMapReady } from '../leaflet/lifecycle';
import { createTrackLegendBadge, retainTrackLegendBadge } from './trackLegend';

/**
 * Props for the high-level stream track visualization layer.
 */
export interface StreamTrackLayerProps {
  color?: string;
  colorMode?: 'elevation' | 'heart-rate' | 'solid' | 'speed';
  elevationDomain?: Pick<ElevationColorOptions, 'maxMeters' | 'minMeters'>;
  fallbackColor?: string;
  fitBounds?: boolean;
  fitBoundsOptions?: FitBoundsOptions;
  heartRateDomain?: Pick<HeartRateColorOptions, 'maxBpm' | 'minBpm'>;
  legendPosition?: ControlPosition;
  pathOptions?: PathOptions;
  points: readonly StreamPoint[];
  showLegend?: boolean;
  smooth?: TrackSmoothingOptions;
  speedDomain?: Pick<SpeedColorOptions, 'maxKmh' | 'minKmh'>;
  weight?: number;
}

/**
 * Renders stream points as either a solid track, speed-colored segments, or elevation-colored segments.
 */
export function StreamTrackLayer({
  color = '#0f172a',
  colorMode = 'speed',
  elevationDomain,
  fallbackColor = '#3388ff',
  fitBounds = false,
  fitBoundsOptions,
  heartRateDomain,
  legendPosition = 'topright',
  pathOptions,
  points,
  showLegend = true,
  smooth,
  speedDomain,
  weight = 4,
}: StreamTrackLayerProps): null {
  const map = useLeafletMap();

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
        showLegend && colorMode !== 'solid'
          ? retainTrackLegendBadge(
              map,
              createTrackLegendBadge({
                ...(colorMode === 'elevation' ? { elevationDomain } : {}),
                ...(colorMode === 'heart-rate' ? { heartRateDomain } : {}),
                mode: colorMode,
                ...(colorMode === 'speed' ? { speedDomain } : {}),
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
      } else if (colorMode === 'speed') {
        const segments = buildSpeedSegments(points, {
          fallbackColor,
          ...(speedDomain?.maxKmh !== undefined ? { maxKmh: speedDomain.maxKmh } : {}),
          ...(speedDomain?.minKmh !== undefined ? { minKmh: speedDomain.minKmh } : {}),
          ...(smooth ? { smooth } : {}),
        });

        if (segments.length === 0) {
          polyline(points.map(toLatLngTuple), {
            ...pathOptions,
            color: fallbackColor,
            weight,
          }).addTo(group);
        } else {
          for (const segment of segments) {
            polyline(segment.positions, {
              ...pathOptions,
              color: segment.color,
              weight,
            }).addTo(group);
          }
        }
      } else {
        const segments =
          colorMode === 'elevation'
            ? buildElevationSegments(points, {
                fallbackColor,
                ...(elevationDomain?.maxMeters !== undefined
                  ? { maxMeters: elevationDomain.maxMeters }
                  : {}),
                ...(elevationDomain?.minMeters !== undefined
                  ? { minMeters: elevationDomain.minMeters }
                  : {}),
                ...(smooth ? { smooth } : {}),
              })
            : buildHeartRateSegments(points, {
                fallbackColor,
                ...(heartRateDomain?.maxBpm !== undefined
                  ? { maxBpm: heartRateDomain.maxBpm }
                  : {}),
                ...(heartRateDomain?.minBpm !== undefined
                  ? { minBpm: heartRateDomain.minBpm }
                  : {}),
                ...(smooth ? { smooth } : {}),
              });

        if (segments.length === 0) {
          polyline(points.map(toLatLngTuple), {
            ...pathOptions,
            color: fallbackColor,
            weight,
          }).addTo(group);
        } else {
          for (const segment of segments) {
            polyline(segment.positions, {
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
    elevationDomain,
    fallbackColor,
    fitBounds,
    fitBoundsOptions,
    heartRateDomain,
    legendPosition,
    map,
    pathOptions,
    points,
    showLegend,
    smooth,
    speedDomain,
    weight,
  ]);

  return null;
}
