import * as Leaflet from 'leaflet';

type LeafletGlobalRuntime = typeof globalThis & {
  L?: typeof Leaflet;
};

/**
 * Loads the optional Leaflet.markercluster plugin in ESM hosts such as Vite.
 *
 * The plugin's UMD bundle expects a global `L` reference during evaluation,
 * so this helper assigns the current Leaflet runtime to `globalThis.L`
 * before importing the plugin.
 */
export async function loadLeafletMarkerCluster(): Promise<void> {
  const runtime = globalThis as LeafletGlobalRuntime;

  if (runtime.L !== Leaflet) {
    runtime.L = Leaflet;
  }

  await import('leaflet.markercluster');
}
