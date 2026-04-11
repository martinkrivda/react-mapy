import type { MarkerOptions } from 'leaflet';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

import type { GeoPointLike } from '../core/types';
import { runWhenMapReady } from './lifecycle';
import {
  createLeafletMarker,
  type MarkerCustomIcon,
} from './markerUtils';
import { useLeafletMap } from './context';
import { useLeafletMapZoom } from './useLeafletMapZoom';

/**
 * Props for a single marker layer.
 */
export interface MarkerLayerProps {
  customIcon?: MarkerCustomIcon;
  markerOptions?: MarkerOptions;
  popupContent?: ReactNode;
  popupText?: string;
  position: GeoPointLike;
  tooltipContent?: ReactNode;
  tooltipText?: string;
}

/**
 * Adds a single Leaflet marker to the current map.
 */
export function MarkerLayer({
  customIcon,
  markerOptions,
  popupContent,
  popupText,
  position,
  tooltipContent,
  tooltipText,
}: MarkerLayerProps): null {
  const map = useLeafletMap();
  const zoom = useLeafletMapZoom();

  useEffect(() => {
    const layer = createLeafletMarker({
      ...(customIcon ? { customIcon } : {}),
      ...(markerOptions ? { markerOptions } : {}),
      ...(popupContent ? { popupContent } : {}),
      ...(popupText ? { popupText } : {}),
      position,
      ...(tooltipContent ? { tooltipContent } : {}),
      ...(tooltipText ? { tooltipText } : {}),
    }, zoom);

    let mounted = false;
    const cancel = runWhenMapReady(map, () => {
      layer.addTo(map);
      mounted = true;
    });

    return () => {
      cancel();

      if (mounted) {
        layer.remove();
      }
    };
  }, [customIcon, map, markerOptions, popupContent, popupText, position, tooltipContent, tooltipText, zoom]);

  return null;
}

export type { MarkerCustomIcon, MarkerIconSize, MarkerResponsiveIconSize } from './markerUtils';
