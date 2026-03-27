import { map as createLeafletMap, type Map as LeafletMapInstance, type MapOptions } from 'leaflet';
import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import { toLatLngTuple } from '../core/geometry';
import { resolveMapTheme, type MapTheme } from '../core/themes';
import type { GeoPointLike } from '../core/types';
import { LeafletMapContext } from './context';
import { isMapUsable } from './lifecycle';
import { ensureMapThemeStyles } from './themeStyles';

/**
 * Props for the root Leaflet map wrapper.
 */
export interface LeafletMapProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  center: GeoPointLike;
  children?: ReactNode;
  mapOptions?: Omit<MapOptions, 'center' | 'zoom'>;
  /**
   * Presentation theme for Leaflet controls, popups, attribution, and raster tile treatment.
   * Built-in presets: `mapy`, `dark`, `neutral`, and `mapbox`. You can also pass a custom
   * override object that extends a preset.
   */
  theme?: MapTheme;
  whenReady?: (map: LeafletMapInstance) => void;
  zoom: number;
}

function joinClassNames(...values: Array<string | undefined>): string {
  return values.filter(Boolean).join(' ');
}

function toThemeClassName(id: string): string {
  return `react-mapy--theme-${id.replaceAll(/[^a-z0-9-]+/gi, '-').toLowerCase()}`;
}

function createThemeStyle(theme: ReturnType<typeof resolveMapTheme>): CSSProperties {
  return {
    '--react-mapy-accent': theme.accentColor,
    '--react-mapy-background': theme.backgroundColor,
    '--react-mapy-control-backdrop': theme.controlBackdropFilter,
    '--react-mapy-control-background': theme.controlBackground,
    '--react-mapy-control-border': theme.controlBorderColor,
    '--react-mapy-control-color': theme.controlColor,
    '--react-mapy-control-shadow': theme.controlShadow,
    '--react-mapy-disabled': theme.disabledColor,
    '--react-mapy-foreground': theme.foregroundColor,
    '--react-mapy-muted': theme.mutedColor,
    '--react-mapy-popup-background': theme.popupBackground,
    '--react-mapy-popup-border': theme.popupBorderColor,
    '--react-mapy-popup-color': theme.popupColor,
    '--react-mapy-popup-shadow': theme.popupShadow,
    '--react-mapy-tile-filter': theme.tileFilter,
    '--react-mapy-tile-opacity': String(theme.tileOpacity),
  } as CSSProperties;
}

/**
 * Creates and owns a Leaflet map instance for nested layers.
 */
export function LeafletMap({
  center,
  children,
  className,
  mapOptions,
  style,
  theme = 'mapy',
  whenReady,
  zoom,
  ...divProps
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMapInstance | null>(null);
  const initialCenterRef = useRef(center);
  const initialZoomRef = useRef(zoom);
  const initialMapOptionsRef = useRef(mapOptions);
  const whenReadyRef = useRef(whenReady);
  const [map, setMap] = useState<LeafletMapInstance | null>(null);
  const resolvedTheme = resolveMapTheme(theme);

  useEffect(() => {
    whenReadyRef.current = whenReady;
  }, [whenReady]);

  useEffect(() => {
    ensureMapThemeStyles();
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    let disposed = false;

    const instance = createLeafletMap(containerRef.current, {
      attributionControl: true,
      zoomControl: true,
      ...initialMapOptionsRef.current,
    });

    mapRef.current = instance;
    instance.setView(toLatLngTuple(initialCenterRef.current), initialZoomRef.current);
    instance.whenReady(() => {
      if (disposed || !isMapUsable(instance)) {
        return;
      }

      whenReadyRef.current?.(instance);
      setMap(instance);
    });

    return () => {
      disposed = true;
      setMap(null);
      mapRef.current = null;
      instance.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !isMapUsable(mapRef.current)) {
      return;
    }

    mapRef.current.setView(toLatLngTuple(center), zoom, { animate: false });
  }, [center, zoom]);

  return (
    <div
      {...divProps}
      className={joinClassNames('react-mapy', toThemeClassName(resolvedTheme.id), className)}
      ref={containerRef}
      style={{
        height: '100%',
        minHeight: 320,
        width: '100%',
        ...createThemeStyle(resolvedTheme),
        ...style,
      }}
    >
      {map ? <LeafletMapContext.Provider value={map}>{children}</LeafletMapContext.Provider> : null}
    </div>
  );
}
