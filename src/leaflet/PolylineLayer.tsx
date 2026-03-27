import { polyline, type FitBoundsOptions, type PolylineOptions } from 'leaflet';
import { useEffect } from 'react';

import { toLatLngTuple } from '../core/geometry';
import type { GeoPointLike } from '../core/types';
import { useLeafletMap } from './context';
import { runWhenMapReady } from './lifecycle';

/**
 * Props for a polyline layer.
 */
export interface PolylineLayerProps {
  coordinates: readonly GeoPointLike[];
  fitBounds?: boolean;
  fitBoundsOptions?: FitBoundsOptions;
  pathOptions?: PolylineOptions;
}

/**
 * Adds a polyline to the current map.
 */
export function PolylineLayer({
  coordinates,
  fitBounds = false,
  fitBoundsOptions,
  pathOptions,
}: PolylineLayerProps): null {
  const map = useLeafletMap();

  useEffect(() => {
    if (coordinates.length < 2) {
      return;
    }

    const layer = polyline(coordinates.map(toLatLngTuple), pathOptions);
    let mounted = false;
    const cancel = runWhenMapReady(map, () => {
      layer.addTo(map);
      mounted = true;

      if (fitBounds) {
        map.fitBounds(layer.getBounds(), fitBoundsOptions);
      }
    });

    return () => {
      cancel();

      if (mounted) {
        layer.remove();
      }
    };
  }, [coordinates, fitBounds, fitBoundsOptions, map, pathOptions]);

  return null;
}
