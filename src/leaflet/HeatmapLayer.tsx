import type { FitBoundsOptions } from 'leaflet';
import { useEffect, useId, useMemo } from 'react';
import simpleheat from 'simpleheat';

import {
  computeBounds,
  DEFAULT_HEATMAP_GRADIENT,
  normalizeHeatmapPoints,
  type HeatmapGradient,
  type HeatmapPointLike,
} from '../core';
import { useLeafletMap } from './context';
import { isMapUsable, runWhenMapReady } from './lifecycle';

/**
 * Props for rendering a canvas-based heatmap above the map tiles.
 */
export interface HeatmapLayerProps {
  blur?: number;
  fitBounds?: boolean;
  fitBoundsOptions?: FitBoundsOptions;
  gradient?: HeatmapGradient;
  maxIntensity?: number;
  minOpacity?: number;
  opacity?: number;
  points: readonly HeatmapPointLike[];
  radius?: number;
  zIndex?: number;
}

/**
 * Renders a lightweight canvas heatmap suited for event density and historical route overlays.
 */
export function HeatmapLayer({
  blur = 18,
  fitBounds = false,
  fitBoundsOptions,
  gradient = DEFAULT_HEATMAP_GRADIENT,
  maxIntensity,
  minOpacity = 0.05,
  opacity = 0.78,
  points,
  radius = 24,
  zIndex = 350,
}: HeatmapLayerProps): null {
  const map = useLeafletMap();
  const paneId = useId();
  const normalizedPoints = useMemo(() => normalizeHeatmapPoints(points), [points]);
  const paneName = useMemo(
    () => `react-mapy-heatmap-pane-${paneId.replaceAll(/[^a-z0-9-]+/gi, '')}`,
    [paneId],
  );

  useEffect(() => {
    if (normalizedPoints.length === 0) {
      return;
    }

    const container = map.getContainer();

    if (!(container instanceof HTMLElement)) {
      return;
    }

    const pane = map.getPane(paneName) ?? map.createPane(paneName, container);

    if (!(pane instanceof HTMLElement)) {
      return;
    }

    pane.classList.add('react-mapy-heatmap-pane');
    pane.style.inset = '0';
    pane.style.pointerEvents = 'none';
    pane.style.zIndex = String(zIndex);

    const canvas = document.createElement('canvas');
    canvas.className = 'react-mapy-heatmap';
    canvas.style.height = '100%';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.width = '100%';
    pane.append(canvas);

    const heat = simpleheat(canvas);
    let mounted = false;

    const redraw = () => {
      if (!isMapUsable(map)) {
        return;
      }

      const size = map.getSize();
      const width = Math.max(1, Math.round(size.x));
      const height = Math.max(1, Math.round(size.y));

      if (canvas.width !== width) {
        canvas.width = width;
      }

      if (canvas.height !== height) {
        canvas.height = height;
      }

      heat.resize();

      canvas.style.opacity = String(opacity);

      const heatData = normalizedPoints
        .map((point) => {
          const projected = map.latLngToContainerPoint([point.lat, point.lng]);
          return [projected.x, projected.y, point.intensity ?? 1] as [number, number, number];
        })
        .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));

      if (heatData.length === 0) {
        heat.clear().draw(minOpacity);
        return;
      }

      const resolvedMaxIntensity =
        maxIntensity ?? heatData.reduce((currentMax, point) => Math.max(currentMax, point[2]), 1);

      heat
        .data(heatData)
        .max(resolvedMaxIntensity)
        .radius(radius, blur)
        .gradient(gradient)
        .draw(minOpacity);
    };

    const cancel = runWhenMapReady(map, () => {
      mounted = true;

      if (fitBounds) {
        const bounds = computeBounds(normalizedPoints);

        if (bounds) {
          map.fitBounds(
            [
              [bounds.south, bounds.west],
              [bounds.north, bounds.east],
            ],
            fitBoundsOptions,
          );
        }
      }

      redraw();
    });

    const eventNames = ['move', 'moveend', 'resize', 'viewreset', 'zoom', 'zoomend'] as const;

    for (const eventName of eventNames) {
      map.on(eventName, redraw);
    }

    return () => {
      cancel();

      for (const eventName of eventNames) {
        map.off(eventName, redraw);
      }

      if (mounted && canvas.isConnected) {
        canvas.remove();
      }

      if (pane.childElementCount === 0) {
        pane.remove();
      }
    };
  }, [
    blur,
    fitBounds,
    fitBoundsOptions,
    gradient,
    map,
    maxIntensity,
    minOpacity,
    normalizedPoints,
    opacity,
    paneName,
    radius,
    zIndex,
  ]);

  return null;
}
