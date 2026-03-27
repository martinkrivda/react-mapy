import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

const leafletMocks = vi.hoisted(() => {
  let mapContainer: HTMLElement | { isConnected: boolean } = { isConnected: true };
  let mapPanes: Record<string, HTMLElement> = {};
  const mapSetView = vi.fn();
  const mapWhenReady = vi.fn((callback: () => void) => {
    callback();
  });
  const mapGetContainer = vi.fn(() => mapContainer);
  const mapGetPane = vi.fn((name?: string) => (name ? mapPanes[name] : mapPanes.overlayPane));
  const mapGetSize = vi.fn(() => ({ x: 800, y: 600 }));
  const mapLatLngToContainerPoint = vi.fn((point: [number, number]) => ({
    x: point[1] * 10,
    y: point[0] * 10,
  }));
  const mapLatLngToLayerPoint = vi.fn((point: [number, number]) => ({
    x: point[1] * 10,
    y: point[0] * 10,
  }));
  const mapContainerPointToLayerPoint = vi.fn((point: [number, number]) => ({
    x: point[0],
    y: point[1],
  }));
  const mapCreatePane = vi.fn((name: string, container?: HTMLElement) => {
    const pane = document.createElement('div');
    pane.className = `leaflet-pane ${name}`;
    (container ?? (mapContainer instanceof HTMLElement ? mapContainer : undefined))?.append(pane);
    mapPanes[name] = pane;
    return pane;
  });
  const mapOff = vi.fn();
  const mapOn = vi.fn();
  const mapRemove = vi.fn();
  const mapFitBounds = vi.fn();
  const domDisableClickPropagation = vi.fn();
  const domDisableScrollPropagation = vi.fn();
  const domCreate = vi.fn((tagName: string, className = '', container?: { appendChild?: Mock }) => {
    const element = {
      appendChild: vi.fn(),
      className,
      href: '',
      rel: '',
      src: '',
      style: {} as Record<string, string>,
      tagName,
      target: '',
    };

    container?.appendChild?.(element);

    return element;
  });
  const ControlMock = vi.fn(function Control(
    this: {
      onAdd?: (map: unknown) => unknown;
      options: { position?: string };
    },
    options?: { position?: string },
  ) {
    this.options = options ?? {};
  });
  ControlMock.prototype.addTo = vi.fn(function addTo(
    this: {
      onAdd?: (map: unknown) => unknown;
    },
    map: unknown,
  ) {
    this.onAdd?.(map);
    return this;
  });
  ControlMock.prototype.remove = vi.fn(function remove(
    this: {
      onAdd?: (map: unknown) => unknown;
    },
  ) {
    return this;
  });
  const leafletMapInstance = {
    containerPointToLayerPoint: mapContainerPointToLayerPoint,
    createPane: mapCreatePane,
    fitBounds: mapFitBounds,
    getContainer: mapGetContainer,
    getPane: mapGetPane,
    getSize: mapGetSize,
    latLngToContainerPoint: mapLatLngToContainerPoint,
    latLngToLayerPoint: mapLatLngToLayerPoint,
    off: mapOff,
    on: mapOn,
    remove: mapRemove,
    setView: mapSetView,
    whenReady: mapWhenReady,
  };

  const createLayer = () => {
    const layer = {
      addTo: vi.fn(() => layer),
      bindPopup: vi.fn(() => layer),
      bindTooltip: vi.fn(() => layer),
      getBounds: vi.fn(() => 'bounds'),
      getLayers: vi.fn(() => [1]),
      remove: vi.fn(),
    };

    return layer;
  };

  const divIconMock = vi.fn((options: Record<string, unknown>) => ({
    kind: 'div-icon',
    options,
  }));
  const simpleheatInstance = {
    clear: vi.fn(),
    data: vi.fn(),
    draw: vi.fn(),
    gradient: vi.fn(),
    max: vi.fn(),
    radius: vi.fn(),
    resize: vi.fn(),
  };
  simpleheatInstance.clear.mockImplementation(() => simpleheatInstance);
  simpleheatInstance.data.mockImplementation(() => simpleheatInstance);
  simpleheatInstance.draw.mockImplementation(() => simpleheatInstance);
  simpleheatInstance.gradient.mockImplementation(() => simpleheatInstance);
  simpleheatInstance.max.mockImplementation(() => simpleheatInstance);
  simpleheatInstance.radius.mockImplementation(() => simpleheatInstance);
  simpleheatInstance.resize.mockImplementation(() => simpleheatInstance);
  const simpleheatMock = vi.fn(() => simpleheatInstance);
  const imageOverlayMock = vi.fn(() => createLayer());
  const tileLayerMock = vi.fn(() => createLayer());
  const markerMock = vi.fn(() => createLayer());
  const polylineMock = vi.fn(() => createLayer());
  const geoJsonMock = vi.fn(() => createLayer());
  const featureGroupMock = vi.fn(() => createLayer());
  const mapMock = vi.fn((container: HTMLElement) => {
    mapContainer = container;
    mapPanes = {};
    mapCreatePane('mapPane', container);
    mapCreatePane('overlayPane', mapPanes.mapPane);
    return leafletMapInstance;
  });

  return {
    ControlMock,
    divIconMock,
    domCreate,
    domDisableClickPropagation,
    domDisableScrollPropagation,
    featureGroupMock,
    geoJsonMock,
    imageOverlayMock,
    leafletMapInstance,
    mapFitBounds,
    mapContainerPointToLayerPoint,
    mapCreatePane,
    mapGetContainer,
    mapGetPane,
    mapGetSize,
    mapLatLngToContainerPoint,
    mapLatLngToLayerPoint,
    mapMock,
    mapOff,
    mapOn,
    mapRemove,
    mapSetView,
    mapWhenReady,
    markerMock,
    polylineMock,
    simpleheatInstance,
    simpleheatMock,
    tileLayerMock,
  };
});

vi.mock('simpleheat', () => ({
  default: leafletMocks.simpleheatMock,
}));

vi.mock('leaflet', () => ({
  Control: leafletMocks.ControlMock,
  DomEvent: {
    disableClickPropagation: leafletMocks.domDisableClickPropagation,
    disableScrollPropagation: leafletMocks.domDisableScrollPropagation,
  },
  DomUtil: {
    create: leafletMocks.domCreate,
  },
  divIcon: leafletMocks.divIconMock,
  featureGroup: leafletMocks.featureGroupMock,
  geoJSON: leafletMocks.geoJsonMock,
  imageOverlay: leafletMocks.imageOverlayMock,
  map: leafletMocks.mapMock,
  marker: leafletMocks.markerMock,
  polyline: leafletMocks.polylineMock,
  tileLayer: leafletMocks.tileLayerMock,
}));

import {
  GeoreferencedImageOverlay,
  GpxTrackLayer,
  HeatmapLayer,
  LeafletMap,
  MapTileLayer,
  MarkerLayer,
  StreamTrackLayer,
} from '../src';
import { createMapyProvider } from '../src/providers/mapy';

describe('Leaflet React bindings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a Leaflet map instance and calls whenReady', () => {
    const handleReady = vi.fn();
    const { unmount, getByTestId } = render(
      <LeafletMap center={{ lat: 50.0755, lng: 14.4378 }} data-testid="map-root" whenReady={handleReady} zoom={13} />,
    );

    expect(leafletMocks.mapMock).toHaveBeenCalledWith(getByTestId('map-root'), expect.any(Object));
    expect(leafletMocks.mapSetView).toHaveBeenCalledWith([50.0755, 14.4378], 13);
    expect(handleReady).toHaveBeenCalledWith(leafletMocks.leafletMapInstance);

    unmount();

    expect(leafletMocks.mapRemove).toHaveBeenCalled();
  });

  it('applies preset theme classes and CSS variables to the map root', () => {
    const { getByTestId } = render(
      <LeafletMap center={{ lat: 50.0755, lng: 14.4378 }} data-testid="map-root" theme="dark" zoom={13} />,
    );

    const root = getByTestId('map-root');

    expect(root.className).toContain('react-mapy');
    expect(root.className).toContain('react-mapy--theme-dark');
    expect(root.style.getPropertyValue('--react-mapy-tile-filter')).toContain('invert');
    expect(root.style.getPropertyValue('--react-mapy-background')).toBe('#09090b');
    expect(root.style.getPropertyValue('--react-mapy-accent')).toBe('#fafafa');
    expect(document.getElementById('react-mapy-theme-styles')).not.toBeNull();
  });

  it('adds a provider-backed tile layer once the map is ready', async () => {
    const provider = createMapyProvider({ apiKey: 'demo-key', variant: 'outdoor' });

    render(
      <LeafletMap center={{ lat: 50.0755, lng: 14.4378 }} zoom={13}>
        <MapTileLayer provider={provider} />
      </LeafletMap>,
    );

    await waitFor(() => {
      expect(leafletMocks.tileLayerMock).toHaveBeenCalled();
    });

    expect(leafletMocks.tileLayerMock).toHaveBeenCalledWith(
      provider.urlTemplate,
      expect.objectContaining({
        attribution: provider.attribution,
        maxZoom: 19,
        minZoom: 0,
      }),
    );
    expect(leafletMocks.ControlMock).toHaveBeenCalledWith(
      expect.objectContaining({ position: 'bottomleft' }),
    );
  });

  it('renders a marker layer with popup and tooltip text', async () => {
    render(
      <LeafletMap center={{ lat: 50.0755, lng: 14.4378 }} zoom={13}>
        <MarkerLayer
          popupText="City center"
          position={{ lat: 50.0755, lng: 14.4378 }}
          tooltipText="Prague"
        />
      </LeafletMap>,
    );

    await waitFor(() => {
      expect(leafletMocks.markerMock).toHaveBeenCalledWith([50.0755, 14.4378], undefined);
    });

    const markerLayer = leafletMocks.markerMock.mock.results[0]?.value as
      | {
          bindPopup: Mock;
          bindTooltip: Mock;
        }
      | undefined;

    expect(markerLayer?.bindPopup).toHaveBeenCalledWith('City center');
    expect(markerLayer?.bindTooltip).toHaveBeenCalledWith('Prague');
  });

  it('renders a georeferenced image overlay from world-file metadata', async () => {
    render(
      <LeafletMap center={{ lat: 50.0755, lng: 14.4378 }} zoom={13}>
        <GeoreferencedImageOverlay
          imageSize={{ height: 50, width: 100 }}
          src="https://example.test/raster.png"
          worldFile={['0.01', '0', '0', '-0.01', '14.445', '50.095'].join('\n')}
        />
      </LeafletMap>,
    );

    await waitFor(() => {
      expect(leafletMocks.imageOverlayMock).toHaveBeenCalledWith(
        'https://example.test/raster.png',
        [
          [49.6, 14.44],
          [50.1, 15.44],
        ],
        undefined,
      );
    });
  });

  it('renders a heatmap canvas layer from geographic points', async () => {
    const { getByTestId } = render(
      <LeafletMap center={{ lat: 50.0755, lng: 14.4378 }} data-testid="map-root" zoom={13}>
        <HeatmapLayer
          blur={14}
          points={[
            { intensity: 1, lat: 50.0755, lng: 14.4378 },
            { intensity: 3, lat: 50.0762, lng: 14.4404 },
          ]}
          radius={20}
        />
      </LeafletMap>,
    );

    await waitFor(() => {
      expect(leafletMocks.simpleheatMock).toHaveBeenCalledWith(expect.any(HTMLCanvasElement));
    });

    const root = getByTestId('map-root');
    const canvas = root.querySelector('.react-mapy-heatmap');
    const pane = root.querySelector('.react-mapy-heatmap-pane');

    expect(canvas).not.toBeNull();
    expect(pane).not.toBeNull();
    expect(leafletMocks.simpleheatInstance.data).toHaveBeenCalledWith([
      [144.378, 500.755, 1],
      [144.404, 500.762, 3],
    ]);
    expect(leafletMocks.simpleheatInstance.resize).toHaveBeenCalled();
    expect(leafletMocks.simpleheatInstance.radius).toHaveBeenCalledWith(20, 14);
    expect(leafletMocks.simpleheatInstance.gradient).toHaveBeenCalled();
    expect(leafletMocks.mapCreatePane).toHaveBeenCalledWith(
      expect.stringContaining('react-mapy-heatmap-pane-'),
      expect.any(HTMLDivElement),
    );
    expect(leafletMocks.mapOn).toHaveBeenCalledWith('move', expect.any(Function));
  });

  it('renders a stream track legend badge for colored stream modes', async () => {
    render(
      <LeafletMap center={{ lat: 50.0755, lng: 14.4378 }} zoom={13}>
        <StreamTrackLayer
          colorMode="speed"
          points={[
            { lat: 50.0755, lng: 14.4378, speedKmh: 8 },
            { lat: 50.078, lng: 14.444, speedKmh: 14 },
          ]}
          speedDomain={{ maxKmh: 20, minKmh: 5 }}
        />
      </LeafletMap>,
    );

    await waitFor(() => {
      expect(leafletMocks.ControlMock).toHaveBeenCalledWith(
        expect.objectContaining({ position: 'topright' }),
      );
    });

    expect(leafletMocks.domCreate).toHaveBeenNthCalledWith(
      1,
      'div',
      'react-mapy-track-legend',
    );
  });

  it('renders a pace legend badge for GpxTrackLayer in pace mode', async () => {
    render(
      <LeafletMap center={{ lat: 50.0755, lng: 14.4378 }} zoom={13}>
        <GpxTrackLayer
          track={{
            points: [
              { lat: 50.0755, lng: 14.4378, time: new Date('2026-03-27T07:00:00Z') },
              { lat: 50.078, lng: 14.444, time: new Date('2026-03-27T07:02:10Z') },
            ],
            summary: {
              distanceMeters: 100,
              elevationGainMeters: 0,
              elevationLossMeters: 0,
              pointCount: 2,
            },
          }}
        />
      </LeafletMap>,
    );

    await waitFor(() => {
      expect(leafletMocks.domCreate).toHaveBeenCalledWith(
        'div',
        'react-mapy-track-legend__range',
        expect.any(Object),
      );
    });
  });

  it('renders a custom React marker icon with configured size', async () => {
    function CustomMarkerIcon({
      size = 32,
      width = size,
      height = size,
    }: {
      height?: number;
      size?: number;
      width?: number;
    }) {
      return (
        <svg data-height={height} data-size={size} data-width={width} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
    }

    render(
      <LeafletMap center={{ lat: 50.0755, lng: 14.4378 }} zoom={13}>
        <MarkerLayer
          customIcon={{
            component: CustomMarkerIcon,
            size: 40,
          }}
          position={{ lat: 50.0755, lng: 14.4378 }}
        />
      </LeafletMap>,
    );

    await waitFor(() => {
      expect(leafletMocks.divIconMock).toHaveBeenCalled();
    });

    expect(leafletMocks.divIconMock).toHaveBeenCalledWith(
      expect.objectContaining({
        className: 'react-mapy-marker-icon',
        iconAnchor: [20, 40],
        iconSize: [40, 40],
        popupAnchor: [0, -40],
      }),
    );

    const divIconOptions = leafletMocks.divIconMock.mock.calls[0]?.[0] as
      | {
          html?: string;
        }
      | undefined;

    expect(divIconOptions?.html).toContain('<svg');
    expect(divIconOptions?.html).toContain('data-size="40"');
    expect(leafletMocks.markerMock).toHaveBeenCalledWith(
      [50.0755, 14.4378],
      expect.objectContaining({
        icon: expect.objectContaining({ kind: 'div-icon' }),
      }),
    );
  });

  it('renders the built-in ofeed marker preset with preset sizing', async () => {
    render(
      <LeafletMap center={{ lat: 50.0755, lng: 14.4378 }} zoom={13}>
        <MarkerLayer
          customIcon={{
            preset: 'ofeed',
          }}
          position={{ lat: 50.0755, lng: 14.4378 }}
        />
      </LeafletMap>,
    );

    await waitFor(() => {
      expect(leafletMocks.divIconMock).toHaveBeenCalled();
    });

    expect(leafletMocks.divIconMock).toHaveBeenCalledWith(
      expect.objectContaining({
        className: 'react-mapy-marker-icon react-mapy-marker-icon--ofeed',
        iconAnchor: [20, 60],
        iconSize: [40, 60],
        popupAnchor: [0, -60],
      }),
    );

    const divIconOptions = leafletMocks.divIconMock.mock.calls[0]?.[0] as
      | {
          html?: string;
        }
      | undefined;

    expect(divIconOptions?.html).toContain('<img');
    expect(divIconOptions?.html).toContain('react-mapy-marker-icon__asset');
  });
});
