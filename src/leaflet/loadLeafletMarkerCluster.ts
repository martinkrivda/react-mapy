import {
  getLeafletGlobalRuntime,
  getMutableLeafletRuntime,
  syncMarkerClusterApi,
} from './markerClusterRuntime';

/**
 * Loads the optional Leaflet.markercluster plugin in ESM hosts such as Vite.
 *
 * The plugin's UMD/CommonJS bundle expects a mutable global Leaflet runtime
 * during evaluation, so this helper exposes Leaflet's default runtime before
 * importing the plugin and mirrors any attached cluster APIs back afterward.
 */
export async function loadLeafletMarkerCluster(): Promise<void> {
  const runtime = getLeafletGlobalRuntime();
  const leafletRuntime = getMutableLeafletRuntime();

  if (runtime) {
    runtime.L = leafletRuntime;
    runtime.Leaflet = leafletRuntime;
  }

  await import('leaflet.markercluster');

  syncMarkerClusterApi(leafletRuntime, runtime?.L);
  syncMarkerClusterApi(leafletRuntime, runtime?.Leaflet);

  if (!leafletRuntime.markerClusterGroup) {
    throw new Error(
      'Leaflet.markercluster loaded, but markerClusterGroup is unavailable on the Leaflet runtime.',
    );
  }
}
