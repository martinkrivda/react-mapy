import { afterEach, describe, expect, it, vi } from 'vitest';

type MarkerClusterFactory = (options?: unknown) => unknown;

type LeafletRuntime = {
  MarkerCluster?: unknown;
  MarkerClusterGroup?: unknown;
  markerClusterGroup?: MarkerClusterFactory;
};

type TestGlobalRuntime = {
  L?: LeafletRuntime;
  Leaflet?: LeafletRuntime;
};

const runtime = globalThis as unknown as TestGlobalRuntime;

function mockLeaflet(leafletRuntime: LeafletRuntime): void {
  vi.doMock('leaflet', () => ({
    ...leafletRuntime,
    default: leafletRuntime,
  }));
}

async function importLoader() {
  return import('../src/leaflet/loadLeafletMarkerCluster');
}

afterEach(() => {
  vi.resetModules();
  vi.doUnmock('leaflet');
  vi.doUnmock('leaflet.markercluster');
  delete runtime.L;
  delete runtime.Leaflet;
});

describe('loadLeafletMarkerCluster', () => {
  it('loads the plugin against the mutable Leaflet runtime and exposes markerClusterGroup', async () => {
    const markerClusterGroup = vi.fn();
    const leafletRuntime: LeafletRuntime = {};

    mockLeaflet(leafletRuntime);
    vi.doMock('leaflet.markercluster', () => {
      expect(runtime.L).toBe(leafletRuntime);
      expect(runtime.Leaflet).toBe(leafletRuntime);
      leafletRuntime.markerClusterGroup = markerClusterGroup;

      return {};
    });

    const { loadLeafletMarkerCluster } = await importLoader();

    await loadLeafletMarkerCluster();

    expect(leafletRuntime.markerClusterGroup).toBe(markerClusterGroup);
    expect(runtime.L?.markerClusterGroup).toBe(markerClusterGroup);
    expect(runtime.Leaflet?.markerClusterGroup).toBe(markerClusterGroup);
  });

  it('mirrors cluster APIs back when the plugin attaches them to global L', async () => {
    const markerClusterGroup = vi.fn();
    const MarkerClusterGroup = vi.fn();
    const MarkerCluster = vi.fn();
    const leafletRuntime: LeafletRuntime = {};
    const pluginRuntime: LeafletRuntime = {
      MarkerCluster,
      MarkerClusterGroup,
      markerClusterGroup,
    };

    mockLeaflet(leafletRuntime);
    vi.doMock('leaflet.markercluster', () => {
      runtime.L = pluginRuntime;

      return {};
    });

    const { loadLeafletMarkerCluster } = await importLoader();

    await loadLeafletMarkerCluster();

    expect(leafletRuntime.markerClusterGroup).toBe(markerClusterGroup);
    expect(leafletRuntime.MarkerClusterGroup).toBe(MarkerClusterGroup);
    expect(leafletRuntime.MarkerCluster).toBe(MarkerCluster);
  });

  it('throws a useful error when the plugin import completes without a factory', async () => {
    const leafletRuntime: LeafletRuntime = {};

    mockLeaflet(leafletRuntime);
    vi.doMock('leaflet.markercluster', () => ({}));

    const { loadLeafletMarkerCluster } = await importLoader();

    await expect(loadLeafletMarkerCluster()).rejects.toThrow(
      'Leaflet.markercluster loaded, but markerClusterGroup is unavailable on the Leaflet runtime.',
    );
  });

  it('uses global L as a fallback factory for marker cluster layers', async () => {
    const markerClusterGroup = vi.fn();
    const leafletRuntime: LeafletRuntime = {};

    mockLeaflet(leafletRuntime);
    runtime.L = { markerClusterGroup };

    const { getMarkerClusterFactory } = await import('../src/leaflet/markerClusterRuntime');

    expect(getMarkerClusterFactory()).toBe(markerClusterGroup);
    expect(leafletRuntime.markerClusterGroup).toBe(markerClusterGroup);
  });
});
