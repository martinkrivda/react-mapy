import { geoJSON, type FitBoundsOptions, type GeoJSONOptions } from 'leaflet';
import type { GeoJsonObject } from 'geojson';
import { useEffect } from 'react';

import { useLeafletMap } from './context';
import { runWhenMapReady } from './lifecycle';

/**
 * Props for a GeoJSON layer.
 */
export interface GeoJsonLayerProps {
  data: GeoJsonObject;
  fitBounds?: boolean;
  fitBoundsOptions?: FitBoundsOptions;
  layerOptions?: GeoJSONOptions;
}

/**
 * Adds GeoJSON data to the current map.
 */
export function GeoJsonLayer({
  data,
  fitBounds = false,
  fitBoundsOptions,
  layerOptions,
}: GeoJsonLayerProps): null {
  const map = useLeafletMap();

  useEffect(() => {
    const layer = geoJSON(data, layerOptions);
    let mounted = false;
    const cancel = runWhenMapReady(map, () => {
      layer.addTo(map);
      mounted = true;

      if (fitBounds && layer.getLayers().length > 0) {
        map.fitBounds(layer.getBounds(), fitBoundsOptions);
      }
    });

    return () => {
      cancel();

      if (mounted) {
        layer.remove();
      }
    };
  }, [data, fitBounds, fitBoundsOptions, layerOptions, map]);

  return null;
}
