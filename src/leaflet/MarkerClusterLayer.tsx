import {
  divIcon,
  type DivIcon,
  type Layer,
  type LayerGroup,
  type Marker,
  type MarkerOptions,
} from 'leaflet';
import { useEffect } from 'react';

import { computeBounds, toLatLngTuple } from '../core';
import { useLeafletMap } from './context';
import { runWhenMapReady } from './lifecycle';
import { getMarkerClusterFactory } from './markerClusterRuntime';
import {
  buildCustomMarkerIcon,
  createLeafletMarker,
  type MarkerCustomIcon,
  type MarkerDefinition,
} from './markerUtils';
import { useLeafletMapZoom } from './useLeafletMapZoom';

export interface MarkerClusterGroupOptions {
  chunkedLoading?: boolean;
  disableClusteringAtZoom?: number;
  iconCreateFunction?: (cluster: MarkerClusterLike) => DivIcon;
  maxClusterRadius?: number | ((zoom: number) => number);
  polygonOptions?: object;
  removeOutsideVisibleBounds?: boolean;
  showCoverageOnHover?: boolean;
  spiderLegPolylineOptions?: object;
  spiderfyDistanceMultiplier?: number;
  spiderfyOnMaxZoom?: boolean;
  zoomToBoundsOnClick?: boolean;
}

interface MarkerClusterGroupLike extends LayerGroup {
  addLayer(layer: Layer): this;
  clearLayers(): this;
}

interface MarkerClusterLike {
  getAllChildMarkers(): Marker[];
  getChildCount(): number;
}

export interface MarkerClusterIconContext {
  count: number;
  markers: readonly ClusterMarkerDefinition[];
  zoom: number;
}

export type MarkerClusterIconRenderer = (
  context: MarkerClusterIconContext,
) => DivIcon | MarkerCustomIcon | string;

/**
 * Marker entry used by MarkerClusterLayer.
 */
export interface ClusterMarkerDefinition extends MarkerDefinition {
  id?: string | number;
}

/**
 * Props for a Leaflet marker cluster group.
 */
export interface MarkerClusterLayerProps {
  clusterOptions?: MarkerClusterGroupOptions;
  clusterIcon?: MarkerClusterIconRenderer;
  markers: readonly ClusterMarkerDefinition[];
  markerOptions?: MarkerOptions;
  onVisibleItemsChange?: (markers: readonly ClusterMarkerDefinition[]) => void;
  sharedIcon?: MarkerCustomIcon;
}

function resolveClusterIcon(result: DivIcon | MarkerCustomIcon | string, zoom: number): DivIcon {
  if (typeof result === 'string') {
    return divIcon({
      className: 'react-mapy-marker-cluster-icon',
      html: result,
    });
  }

  if ('options' in result) {
    return result;
  }

  return (
    buildCustomMarkerIcon(result, zoom) ?? divIcon({ className: 'react-mapy-marker-cluster-icon' })
  );
}

/**
 * Adds a Leaflet.markercluster group to the current map.
 *
 * Host applications must load the plugin once, for example with:
 * `await loadLeafletMarkerCluster();`
 */
export function MarkerClusterLayer({
  clusterOptions,
  clusterIcon,
  markers,
  markerOptions,
  onVisibleItemsChange,
  sharedIcon,
}: MarkerClusterLayerProps): null {
  const map = useLeafletMap();
  const zoom = useLeafletMapZoom();

  useEffect(() => {
    const createClusterGroup = getMarkerClusterFactory() as
      | ((options?: MarkerClusterGroupOptions) => MarkerClusterGroupLike)
      | undefined;

    if (!createClusterGroup) {
      throw new Error(
        'MarkerClusterLayer requires the Leaflet.markercluster plugin. Call loadLeafletMarkerCluster() or load the plugin in the host application before rendering this layer.',
      );
    }

    const metadataByMarker = new Map<Marker, ClusterMarkerDefinition>();
    const group = createClusterGroup({
      ...clusterOptions,
      ...(clusterIcon
        ? {
            iconCreateFunction: (cluster) => {
              const childMarkers = cluster.getAllChildMarkers();
              const childDefinitions = childMarkers.flatMap((markerLayer) => {
                const definition = metadataByMarker.get(markerLayer);
                return definition ? [definition] : [];
              });

              return resolveClusterIcon(
                clusterIcon({
                  count: cluster.getChildCount(),
                  markers: childDefinitions,
                  zoom,
                }),
                zoom,
              );
            },
          }
        : {}),
    });

    for (const markerDefinition of markers) {
      const mergedMarkerOptions = {
        ...markerOptions,
        ...markerDefinition.markerOptions,
      };

      const markerLayer = createLeafletMarker(
        {
          ...(markerDefinition.customIcon
            ? { customIcon: markerDefinition.customIcon }
            : sharedIcon
              ? { customIcon: sharedIcon }
              : {}),
          ...(Object.keys(mergedMarkerOptions).length > 0
            ? { markerOptions: mergedMarkerOptions }
            : {}),
          ...(markerDefinition.popupContent ? { popupContent: markerDefinition.popupContent } : {}),
          ...(markerDefinition.popupText ? { popupText: markerDefinition.popupText } : {}),
          position: markerDefinition.position,
          ...(markerDefinition.tooltipContent
            ? { tooltipContent: markerDefinition.tooltipContent }
            : {}),
          ...(markerDefinition.tooltipText ? { tooltipText: markerDefinition.tooltipText } : {}),
        },
        zoom,
      );

      metadataByMarker.set(markerLayer, markerDefinition);
      group.addLayer(markerLayer);
    }

    const emitVisibleItems = () => {
      if (!onVisibleItemsChange) {
        return;
      }

      const visibleBounds = map.getBounds();
      const nextVisibleMarkers = markers.filter((markerDefinition) =>
        visibleBounds.contains(toLatLngTuple(markerDefinition.position)),
      );

      onVisibleItemsChange(nextVisibleMarkers);
    };

    let mounted = false;
    const cancel = runWhenMapReady(map, () => {
      group.addTo(map);
      mounted = true;
      emitVisibleItems();
    });

    const groupedBounds = computeBounds(
      markers.map((markerDefinition) => markerDefinition.position),
    );

    const handleViewportChange = () => {
      if (mounted) {
        emitVisibleItems();
      }
    };

    if (onVisibleItemsChange && groupedBounds) {
      map.on('moveend', handleViewportChange);
      map.on('zoomend', handleViewportChange);
    }

    return () => {
      cancel();
      map.off('moveend', handleViewportChange);
      map.off('zoomend', handleViewportChange);
      group.clearLayers();

      if (mounted) {
        group.remove();
      }
    };
  }, [
    clusterIcon,
    clusterOptions,
    map,
    markerOptions,
    markers,
    onVisibleItemsChange,
    sharedIcon,
    zoom,
  ]);

  return null;
}
