import 'leaflet';

declare module 'leaflet.markercluster' {
  export {};
}

declare module 'leaflet.markercluster/dist/leaflet.markercluster-src.js' {
  export {};
}

declare module 'leaflet' {
  interface MarkerCluster extends LayerGroup {
    getAllChildMarkers(): Marker[];
    getChildCount(): number;
  }

  interface MarkerClusterGroupOptions {
    chunkedLoading?: boolean;
    disableClusteringAtZoom?: number;
    iconCreateFunction?: (cluster: MarkerCluster) => DivIcon;
    maxClusterRadius?: number | ((zoom: number) => number);
    polygonOptions?: object;
    removeOutsideVisibleBounds?: boolean;
    showCoverageOnHover?: boolean;
    spiderLegPolylineOptions?: object;
    spiderfyDistanceMultiplier?: number;
    spiderfyOnMaxZoom?: boolean;
    zoomToBoundsOnClick?: boolean;
  }

  interface MarkerClusterGroup extends LayerGroup {
    addLayer(layer: Layer): this;
    clearLayers(): this;
  }
}
