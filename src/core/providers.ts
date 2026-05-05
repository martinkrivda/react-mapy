/**
 * Tile coordinates in XYZ notation.
 */
export interface TileCoordinates {
  x: number;
  y: number;
  z: number;
}

/**
 * Generic tile layer configuration that concrete renderers can adapt.
 */
export interface TileLayerConfig {
  attribution: string;
  detectRetina?: boolean;
  maxZoom?: number;
  minZoom?: number;
  subdomains?: string | string[];
  tileSize?: number;
  tms?: boolean;
  zoomOffset?: number;
}

/**
 * Supported map control anchor positions for provider branding.
 */
export type TileProviderBrandingPosition = 'bottomleft' | 'bottomright' | 'topleft' | 'topright';

/**
 * Optional provider branding metadata required by some tile sources.
 */
export interface TileProviderBranding {
  alt: string;
  href: string;
  imageUrl: string;
  minHeight?: number;
  position?: TileProviderBrandingPosition;
  rel?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
}

/**
 * Shared base configuration shape for provider factories.
 */
export interface TileProviderConfigBase {
  language?: string;
  maxZoom?: number;
  minZoom?: number;
  retina: boolean;
  tileSize: 256 | 512;
  variant?: string;
}

/**
 * Provider-level capabilities surfaced to consumers.
 */
export interface TileProviderCapabilities {
  defaultVariant?: string;
  maxZoom?: number;
  minZoom?: number;
  supportedVariants: readonly string[];
  supportsLanguage: boolean;
  supportsRetina: boolean;
}

/**
 * Renderer-agnostic tile provider contract used by map layers.
 */
export interface TileProvider<TConfig extends TileProviderConfigBase = TileProviderConfigBase> {
  attribution: string;
  branding?: TileProviderBranding;
  buildTileUrl(coordinates: TileCoordinates): string;
  capabilities: TileProviderCapabilities;
  config: Readonly<TConfig>;
  getLayerConfig(): Readonly<TileLayerConfig>;
  id: string;
  label: string;
  urlTemplate: string;
}
