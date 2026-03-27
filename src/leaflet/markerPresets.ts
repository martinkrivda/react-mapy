import ofeedMarkerAssetUrl from '../assets/markers/ofeed-marker.svg';

export type MarkerPreset = 'ofeed';

export interface MarkerPresetDefinition {
  assetSrc?: string;
  anchor?: readonly [x: number, y: number];
  className?: string;
  popupAnchor?: readonly [x: number, y: number];
  size: readonly [width: number, height: number];
  svg?: string;
}

export const markerPresets: Record<MarkerPreset, MarkerPresetDefinition> = {
  ofeed: {
    assetSrc: ofeedMarkerAssetUrl,
    className: 'react-mapy-marker-icon--ofeed',
    size: [40, 60],
  },
};
