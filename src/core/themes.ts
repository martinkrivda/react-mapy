/**
 * Built-in map presentation themes. These themes style the Leaflet UI surface and can
 * apply safe raster post-processing filters, but they do not replace the tile provider.
 */
export type MapThemePreset = 'dark' | 'mapbox' | 'mapy' | 'neutral';

/**
 * Fully resolved theme values consumed by the Leaflet wrapper.
 */
export interface MapThemeDefinition {
  accentColor: string;
  backgroundColor: string;
  controlBackdropFilter: string;
  controlBackground: string;
  controlBorderColor: string;
  controlColor: string;
  controlShadow: string;
  disabledColor: string;
  foregroundColor: string;
  id: string;
  mutedColor: string;
  popupBackground: string;
  popupBorderColor: string;
  popupColor: string;
  popupShadow: string;
  tileFilter: string;
  tileOpacity: number;
}

/**
 * Custom theme input. `extends` lets consumers start from a preset and override only
 * the specific surface or tile values they need.
 */
export interface MapThemeOverride extends Partial<Omit<MapThemeDefinition, 'id'>> {
  extends?: MapThemePreset;
  id?: string;
}

/**
 * Public theme input accepted by `LeafletMap`.
 */
export type MapTheme = MapThemeOverride | MapThemePreset;

const MAP_THEME_PRESETS = Object.freeze({
  dark: {
    accentColor: '#fafafa',
    backgroundColor: '#09090b',
    controlBackdropFilter: 'blur(18px)',
    controlBackground: 'rgba(24, 24, 27, 0.84)',
    controlBorderColor: 'rgba(244, 244, 245, 0.12)',
    controlColor: '#fafafa',
    controlShadow: '0 18px 50px rgba(0, 0, 0, 0.48)',
    disabledColor: '#71717a',
    foregroundColor: '#fafafa',
    id: 'dark',
    mutedColor: '#f4f4f5',
    popupBackground: 'rgba(24, 24, 27, 0.96)',
    popupBorderColor: 'rgba(244, 244, 245, 0.12)',
    popupColor: '#fafafa',
    popupShadow: '0 24px 56px rgba(0, 0, 0, 0.52)',
    tileFilter:
      'invert(0.92) hue-rotate(180deg) brightness(0.7) saturate(0.32) contrast(0.9) grayscale(0.15)',
    tileOpacity: 0.92,
  },
  mapbox: {
    accentColor: '#60a5fa',
    backgroundColor: '#0b1220',
    controlBackdropFilter: 'blur(18px)',
    controlBackground: 'rgba(15, 23, 42, 0.82)',
    controlBorderColor: 'rgba(96, 165, 250, 0.22)',
    controlColor: '#e5eef8',
    controlShadow: '0 20px 60px rgba(8, 15, 30, 0.48)',
    disabledColor: '#64748b',
    foregroundColor: '#e5eef8',
    id: 'mapbox',
    mutedColor: '#9fb0c4',
    popupBackground: 'rgba(15, 23, 42, 0.96)',
    popupBorderColor: 'rgba(96, 165, 250, 0.18)',
    popupColor: '#e5eef8',
    popupShadow: '0 24px 56px rgba(8, 15, 30, 0.5)',
    tileFilter: 'saturate(0.75) contrast(1.05) brightness(0.88) hue-rotate(-12deg)',
    tileOpacity: 0.96,
  },
  mapy: {
    accentColor: '#0f766e',
    backgroundColor: '#f8fafc',
    controlBackdropFilter: 'blur(16px)',
    controlBackground: 'rgba(255, 255, 255, 0.9)',
    controlBorderColor: '#cbd5e1',
    controlColor: '#0f172a',
    controlShadow: '0 12px 28px rgba(15, 23, 42, 0.18)',
    disabledColor: '#94a3b8',
    foregroundColor: '#0f172a',
    id: 'mapy',
    mutedColor: '#475569',
    popupBackground: 'rgba(255, 255, 255, 0.96)',
    popupBorderColor: '#dbe3ed',
    popupColor: '#0f172a',
    popupShadow: '0 20px 40px rgba(15, 23, 42, 0.18)',
    tileFilter: 'none',
    tileOpacity: 1,
  },
  neutral: {
    accentColor: '#404040',
    backgroundColor: '#f5f5f5',
    controlBackdropFilter: 'blur(14px)',
    controlBackground: 'rgba(250, 250, 250, 0.9)',
    controlBorderColor: '#d4d4d4',
    controlColor: '#171717',
    controlShadow: '0 10px 30px rgba(38, 38, 38, 0.12)',
    disabledColor: '#a3a3a3',
    foregroundColor: '#171717',
    id: 'neutral',
    mutedColor: '#525252',
    popupBackground: 'rgba(250, 250, 250, 0.96)',
    popupBorderColor: '#d4d4d4',
    popupColor: '#171717',
    popupShadow: '0 18px 40px rgba(38, 38, 38, 0.12)',
    tileFilter: 'grayscale(0.12) saturate(0.85) contrast(0.98)',
    tileOpacity: 0.98,
  },
} satisfies Record<MapThemePreset, MapThemeDefinition>);

/**
 * Built-in theme registry for controls, popups, and tile post-processing.
 */
export const mapThemes = MAP_THEME_PRESETS;

/**
 * Resolves a theme preset or override object into a complete, stable definition.
 */
export function resolveMapTheme(theme: MapTheme = 'mapy'): MapThemeDefinition {
  if (typeof theme === 'string') {
    return { ...MAP_THEME_PRESETS[theme] };
  }

  const baseTheme = MAP_THEME_PRESETS[theme.extends ?? 'mapy'];

  return {
    ...baseTheme,
    ...theme,
    id: theme.id ?? theme.extends ?? 'custom',
  };
}
