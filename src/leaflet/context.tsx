import { createContext, useContext } from 'react';
import type { Map as LeafletMapInstance } from 'leaflet';

export const LeafletMapContext = createContext<LeafletMapInstance | null>(null);

/**
 * Returns the Leaflet map instance created by `LeafletMap`.
 */
export function useLeafletMap(): LeafletMapInstance {
  const map = useContext(LeafletMapContext);

  if (!map) {
    throw new Error('Leaflet layers must be rendered inside <LeafletMap>.');
  }

  return map;
}
