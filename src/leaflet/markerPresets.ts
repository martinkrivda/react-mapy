import ofeedMarkerDarkAssetUrl from '../assets/markers/ofeed-marker-dark.svg';
import ofeedMarkerAssetUrl from '../assets/markers/ofeed-marker.svg';

export type MarkerPreset = 'ofeed';
export type MarkerColorScheme = 'dark' | 'light';

export interface MarkerPresetDefinition {
  assetSrc?: string;
  assetSrcByColorScheme?: Partial<Record<MarkerColorScheme, string>>;
  anchor?: readonly [x: number, y: number];
  className?: string;
  popupAnchor?: readonly [x: number, y: number];
  size: readonly [width: number, height: number];
  svg?: string;
}

export const markerPresets: Record<MarkerPreset, MarkerPresetDefinition> = {
  ofeed: {
    assetSrc: ofeedMarkerAssetUrl,
    assetSrcByColorScheme: {
      dark: ofeedMarkerDarkAssetUrl,
      light: ofeedMarkerAssetUrl,
    },
    className: 'react-mapy-marker-icon--ofeed',
    size: [40, 60],
  },
};
