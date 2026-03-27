import type { TileCoordinates, TileProvider } from '../../core/providers';
import type { TileProviderConfigBase } from '../../core/providers';
import type { TileProviderBranding } from '../../core/providers';

/**
 * Mapy.com map set identifiers exposed by this library.
 */
export type MapyVariant = 'aerial' | 'basic' | 'names-overlay' | 'outdoor' | 'winter';

/**
 * Backend proxy configuration for production-safe tile delivery without exposing the API key.
 *
 * The template supports Leaflet placeholders `{z}`, `{x}`, `{y}` plus provider placeholders
 * `{variant}`, `{tileSize}`, and `{lang}` when relevant.
 *
 * Example:
 * `/api/mapy/tiles/{variant}/{tileSize}/{z}/{x}/{y}?lang={lang}`
 */
export interface MapyProxyOptions {
  query?: Readonly<Record<string, boolean | number | string>>;
  urlTemplate: string;
}

/**
 * Configuration used to build a Mapy.com tile provider instance.
 */
export interface MapyProviderOptions extends TileProviderConfigBase {
  apiKey?: string;
  proxy?: MapyProxyOptions;
  variant?: MapyVariant;
}

const MAPY_ATTRIBUTION =
  '&copy; <a href="https://api.mapy.com/copyright" target="_blank" rel="noreferrer noopener">Seznam.cz a.s. a další</a>';
const MAPY_BRANDING = Object.freeze({
  alt: 'Mapy.com',
  href: 'https://mapy.com/',
  imageUrl: 'https://api.mapy.com/img/api/logo.svg',
  minHeight: 30,
  position: 'bottomleft',
  rel: 'noreferrer noopener',
  target: '_blank',
} satisfies TileProviderBranding);
const MAPY_PROVIDER_ID = 'mapy';
const MAPY_PROVIDER_LABEL = 'Mapy.com';
const MAPY_SUPPORTED_VARIANTS = [
  'basic',
  'outdoor',
  'aerial',
  'winter',
  'names-overlay',
] as const satisfies readonly MapyVariant[];

/**
 * Creates a configured Mapy.com tile provider.
 */
export function createMapyProvider(options: Partial<MapyProviderOptions> = {}): TileProvider<MapyProviderOptions> {
  const config = {
    maxZoom: options.maxZoom ?? 19,
    minZoom: options.minZoom ?? 0,
    retina: options.retina ?? false,
    tileSize: options.tileSize ?? 256,
    variant: options.variant ?? 'outdoor',
    ...definedProps({
      apiKey: options.apiKey,
      language: options.language,
      proxy: options.proxy,
    }),
  } satisfies {
    apiKey?: string;
    language?: string;
    maxZoom: number;
    minZoom: number;
    proxy?: MapyProxyOptions;
    retina: boolean;
    tileSize: 256 | 512;
    variant: MapyVariant;
  };

  const layerConfig = Object.freeze({
    attribution: MAPY_ATTRIBUTION,
    detectRetina: config.retina,
    maxZoom: config.maxZoom,
    minZoom: config.minZoom,
    tileSize: config.tileSize,
  });

  return Object.freeze({
    attribution: MAPY_ATTRIBUTION,
    branding: MAPY_BRANDING,
    buildTileUrl(coordinates: TileCoordinates): string {
      return buildMapyTileUrl(config, coordinates);
    },
    capabilities: {
      defaultVariant: 'outdoor',
      maxZoom: 19,
      minZoom: 0,
      supportedVariants: MAPY_SUPPORTED_VARIANTS,
      supportsLanguage: true,
      supportsRetina: true,
    },
    config: Object.freeze(config),
    getLayerConfig() {
      return layerConfig;
    },
    id: MAPY_PROVIDER_ID,
    label: MAPY_PROVIDER_LABEL,
    urlTemplate: buildMapyTileUrl(config, { x: '{x}', y: '{y}', z: '{z}' }),
  });
}

/**
 * Default Mapy.com provider instance using the outdoor map set.
 */
export const mapyProvider = createMapyProvider();

function buildMapyTileUrl(
  config: MapyProviderOptions,
  coordinates: TileCoordinates | PlaceholderTileCoordinates,
): string {
  if (config.proxy) {
    return buildMapyProxyTileUrl(config, config.proxy, coordinates);
  }

  const query = new URLSearchParams();

  if (config.apiKey) {
    query.set('apikey', config.apiKey);
  }

  if (config.language) {
    query.set('lang', config.language);
  }

  const queryString = query.toString();
  const suffix = queryString.length > 0 ? `?${queryString}` : '';

  return `https://api.mapy.com/v1/maptiles/${config.variant}/${config.tileSize}/${coordinates.z}/${coordinates.x}/${coordinates.y}${suffix}`;
}

function buildMapyProxyTileUrl(
  config: MapyProviderOptions,
  proxy: MapyProxyOptions,
  coordinates: TileCoordinates | PlaceholderTileCoordinates,
): string {
  const replacedTemplate = proxy.urlTemplate
    .replaceAll('{variant}', config.variant ?? '')
    .replaceAll('{tileSize}', String(config.tileSize))
    .replaceAll('{lang}', config.language ?? '')
    .replaceAll('{z}', String(coordinates.z))
    .replaceAll('{x}', String(coordinates.x))
    .replaceAll('{y}', String(coordinates.y));

  return appendQueryParams(replacedTemplate, proxy.query);
}

interface PlaceholderTileCoordinates {
  x: '{x}';
  y: '{y}';
  z: '{z}';
}

function appendQueryParams(
  url: string,
  query: MapyProxyOptions['query'],
): string {
  if (!query || Object.keys(query).length === 0) {
    return url;
  }

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    searchParams.set(key, String(value));
  }

  const queryString = searchParams.toString();

  if (queryString.length === 0) {
    return url;
  }

  return `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
}

function definedProps<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as Partial<T>;
}
