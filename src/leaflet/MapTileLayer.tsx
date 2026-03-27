import { tileLayer, type TileLayerOptions } from 'leaflet';
import { useEffect } from 'react';

import type { TileProvider } from '../core/providers';
import { useLeafletMap } from './context';
import { runWhenMapReady } from './lifecycle';
import { retainProviderBranding } from './providerBranding';

/**
 * Props for the renderer-agnostic tile layer wrapper.
 */
export interface MapTileLayerProps {
  layerOptions?: TileLayerOptions;
  provider: TileProvider;
  showProviderBranding?: boolean;
}

/**
 * Adds a tile layer to the current map using a provider object.
 */
export function MapTileLayer({
  layerOptions,
  provider,
  showProviderBranding = true,
}: MapTileLayerProps): null {
  const map = useLeafletMap();

  useEffect(() => {
    const providerConfig = provider.getLayerConfig();
    const layer = tileLayer(provider.urlTemplate, {
      ...providerConfig,
      ...layerOptions,
      attribution: layerOptions?.attribution ?? provider.attribution,
    });
    let mounted = false;
    let releaseBranding = () => {};
    const cancel = runWhenMapReady(map, () => {
      layer.addTo(map);
      mounted = true;

      if (showProviderBranding) {
        releaseBranding = retainProviderBranding(map, provider);
      }
    });

    return () => {
      cancel();
      releaseBranding();

      if (mounted) {
        layer.remove();
      }
    };
  }, [layerOptions, map, provider, showProviderBranding]);

  return null;
}
