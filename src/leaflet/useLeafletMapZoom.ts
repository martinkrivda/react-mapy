import { useEffect, useState } from 'react';

import { useLeafletMap } from './context';

/**
 * Tracks the current Leaflet zoom level for layers that need zoom-aware rendering.
 */
export function useLeafletMapZoom(): number {
  const map = useLeafletMap();
  const [zoom, setZoom] = useState(() => map.getZoom());

  useEffect(() => {
    const syncZoom = () => {
      setZoom((currentZoom) => {
        const nextZoom = map.getZoom();
        return currentZoom === nextZoom ? currentZoom : nextZoom;
      });
    };

    map.on('zoomend', syncZoom);

    return () => {
      map.off('zoomend', syncZoom);
    };
  }, [map]);

  return zoom;
}
