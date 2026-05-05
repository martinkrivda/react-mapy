import type { Map as LeafletMapInstance } from 'leaflet';

/**
 * Returns `true` when the Leaflet map still has a live DOM container and panes.
 */
export function isMapUsable(map: LeafletMapInstance): boolean {
  try {
    return map.getContainer().isConnected && map.getPane('mapPane') !== undefined;
  } catch {
    return false;
  }
}

/**
 * Defers work until the map is ready and still attached to the DOM.
 */
export function runWhenMapReady(map: LeafletMapInstance, callback: () => void): () => void {
  let disposed = false;

  map.whenReady(() => {
    if (disposed || !isMapUsable(map)) {
      return;
    }

    callback();
  });

  return () => {
    disposed = true;
  };
}
