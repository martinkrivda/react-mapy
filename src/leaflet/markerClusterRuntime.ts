import LeafletDefault from 'leaflet';
import * as LeafletNamespace from 'leaflet';

import type { MarkerClusterGroupOptions } from './MarkerClusterLayer';

export type LeafletWithMarkerCluster = typeof LeafletNamespace & {
  MarkerCluster?: unknown;
  MarkerClusterGroup?: unknown;
  markerClusterGroup?: (options?: MarkerClusterGroupOptions) => unknown;
};

export type LeafletGlobalRuntime = typeof globalThis & {
  L?: LeafletWithMarkerCluster;
  Leaflet?: LeafletWithMarkerCluster;
};

export function getLeafletGlobalRuntime(): LeafletGlobalRuntime | undefined {
  if (typeof globalThis === 'undefined') {
    return undefined;
  }

  return globalThis;
}

export function getMutableLeafletRuntime(): LeafletWithMarkerCluster {
  return LeafletDefault ?? LeafletNamespace;
}

export function syncMarkerClusterApi(
  target: LeafletWithMarkerCluster,
  source: LeafletWithMarkerCluster | undefined,
): void {
  if (!source) {
    return;
  }

  if (!target.MarkerClusterGroup && source.MarkerClusterGroup) {
    target.MarkerClusterGroup = source.MarkerClusterGroup;
  }

  if (!target.MarkerCluster && source.MarkerCluster) {
    target.MarkerCluster = source.MarkerCluster;
  }

  if (!target.markerClusterGroup && source.markerClusterGroup) {
    target.markerClusterGroup = source.markerClusterGroup;
  }
}

export function getMarkerClusterFactory() {
  const leafletRuntime = getMutableLeafletRuntime();
  const runtime = getLeafletGlobalRuntime();

  if (!leafletRuntime.markerClusterGroup && runtime?.L?.markerClusterGroup) {
    syncMarkerClusterApi(leafletRuntime, runtime.L);
  }

  return leafletRuntime.markerClusterGroup ?? runtime?.L?.markerClusterGroup;
}
