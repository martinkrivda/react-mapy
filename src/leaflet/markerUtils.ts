import { divIcon, marker, type Marker, type MarkerOptions } from 'leaflet';
import {
  cloneElement,
  createElement,
  isValidElement,
  type ComponentType,
  type ReactElement,
  type ReactNode,
} from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { toLatLngTuple } from '../core/geometry';
import type { GeoPointLike } from '../core/types';
import {
  markerPresets,
  type MarkerColorScheme,
  type MarkerPreset,
} from './markerPresets';

export type MarkerIconSize = number | readonly [width: number, height: number];
export type MarkerIconSizeResolver = (zoom: number) => MarkerIconSize;
export type MarkerResponsiveIconSize = MarkerIconSize | MarkerIconSizeResolver;

/**
 * Higher-level custom marker icon options for inline SVG and React-rendered icons.
 */
export interface MarkerCustomIcon {
  anchor?: readonly [x: number, y: number];
  className?: string;
  colorScheme?: MarkerColorScheme;
  component?: ComponentType<Record<string, unknown>>;
  componentProps?: Record<string, unknown>;
  content?: ReactNode;
  html?: string;
  popupAnchor?: readonly [x: number, y: number];
  preset?: MarkerPreset;
  size?: MarkerResponsiveIconSize;
  svg?: string;
}

export interface MarkerDefinition {
  customIcon?: MarkerCustomIcon;
  markerOptions?: MarkerOptions;
  popupContent?: ReactNode;
  popupText?: string;
  position: GeoPointLike;
  tooltipContent?: ReactNode;
  tooltipText?: string;
}

const DEFAULT_MARKER_ICON_SIZE: readonly [number, number] = [32, 32];

function resolveResponsiveIconSize(
  size: MarkerResponsiveIconSize | undefined,
  zoom: number | undefined,
): MarkerIconSize | undefined {
  if (typeof size === 'function') {
    return size(zoom ?? 0);
  }

  return size;
}

function normalizeIconSize(size?: MarkerIconSize): readonly [number, number] {
  if (typeof size === 'number') {
    return [size, size];
  }

  if (Array.isArray(size) && size.length === 2) {
    return [size[0], size[1]];
  }

  return DEFAULT_MARKER_ICON_SIZE;
}

function normalizeAnchor(
  anchor: readonly [number, number] | undefined,
  [width, height]: readonly [number, number],
): readonly [number, number] {
  return anchor ?? [Math.round(width / 2), height];
}

function normalizePopupAnchor(
  popupAnchor: readonly [number, number] | undefined,
  [, height]: readonly [number, number],
): readonly [number, number] {
  return popupAnchor ?? [0, -height];
}

function toMutablePointTuple([x, y]: readonly [number, number]): [number, number] {
  return [x, y];
}

function joinClassNames(...values: Array<string | undefined>): string {
  return values.filter(Boolean).join(' ');
}

function escapeAttribute(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
}

function sizePropsForIcon([width, height]: readonly [number, number]): Record<string, unknown> {
  if (width === height) {
    return {
      height,
      size: width,
      width,
    };
  }

  return { height, width };
}

function wrapIconHtml(
  html: string,
  _size: readonly [number, number],
  className?: string,
): string {
  const style = [
    'align-items:center',
    'display:flex',
    'height:100%',
    'justify-content:center',
    'width:100%',
  ].join(';');

  return `<div class="${escapeAttribute(joinClassNames('react-mapy-marker-icon__inner', className))}" style="${style}">${html}</div>`;
}

function renderReactMarkerContent(
  icon: MarkerCustomIcon,
  size: readonly [number, number],
): string | null {
  const sizedProps = sizePropsForIcon(size);
  let content: ReactNode = null;

  if (icon.component) {
    content = createElement(icon.component, {
      ...icon.componentProps,
      ...sizedProps,
    });
  } else if (icon.content) {
    if (isValidElement(icon.content)) {
      content = cloneElement(icon.content as ReactElement<Record<string, unknown>>, {
        ...(icon.content.props as Record<string, unknown>),
        ...sizedProps,
      });
    } else {
      content = icon.content;
    }
  }

  if (!content) {
    return null;
  }

  return renderToStaticMarkup(createElement('div', null, content));
}

function renderOverlayContent(content: ReactNode | undefined): string | null {
  if (content === undefined || content === null || content === false) {
    return null;
  }

  if (typeof content === 'string' || typeof content === 'number') {
    return String(content);
  }

  return renderToStaticMarkup(createElement('div', null, content));
}

function normalizeSvgMarkup(svg: string, [width, height]: readonly [number, number]): string {
  const trimmed = svg.trim();

  if (!trimmed.toLowerCase().startsWith('<svg')) {
    return trimmed;
  }

  const withoutDimensions = trimmed
    .replace(/\swidth=(['"]).*?\1/gi, '')
    .replace(/\sheight=(['"]).*?\1/gi, '')
    .replace(/\sstyle=(['"]).*?\1/gi, '');

  return withoutDimensions.replace(
    /<svg\b/i,
    `<svg width="${width}" height="${height}" style="display:block;"`,
  );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function buildAssetIconHtml(
  assetSrc: string,
  [width, height]: readonly [number, number],
): string {
  return `<img alt="" class="react-mapy-marker-icon__asset" draggable="false" height="${height}" src="${escapeHtml(assetSrc)}" style="display:block;height:100%;width:100%;" width="${width}" />`;
}

export function buildCustomMarkerIcon(icon: MarkerCustomIcon, zoom?: number) {
  const preset = icon.preset ? markerPresets[icon.preset] : undefined;
  const size = normalizeIconSize(resolveResponsiveIconSize(icon.size ?? preset?.size, zoom));
  const presetAssetSrc =
    (icon.colorScheme ? preset?.assetSrcByColorScheme?.[icon.colorScheme] : undefined) ??
    preset?.assetSrc;
  const html =
    icon.html ??
    (icon.svg ? normalizeSvgMarkup(icon.svg, size) : null) ??
    (presetAssetSrc ? buildAssetIconHtml(presetAssetSrc, size) : null) ??
    (preset?.svg ? normalizeSvgMarkup(preset.svg, size) : null) ??
    renderReactMarkerContent(icon, size);

  if (!html) {
    return null;
  }

  return divIcon({
    className: joinClassNames('react-mapy-marker-icon', preset?.className, icon.className),
    html: wrapIconHtml(html, size),
    iconAnchor: toMutablePointTuple(normalizeAnchor(icon.anchor ?? preset?.anchor, size)),
    iconSize: [...size],
    popupAnchor: toMutablePointTuple(
      normalizePopupAnchor(icon.popupAnchor ?? preset?.popupAnchor, size),
    ),
  });
}

export function createLeafletMarker({
  customIcon,
  markerOptions,
  popupContent,
  popupText,
  position,
  tooltipContent,
  tooltipText,
}: MarkerDefinition, zoom?: number): Marker {
  const icon = customIcon ? buildCustomMarkerIcon(customIcon, zoom) : undefined;
  const nextMarkerOptions = icon
    ? {
        ...markerOptions,
        icon,
      }
    : markerOptions;
  const layer = marker(toLatLngTuple(position), nextMarkerOptions);

  const resolvedPopupContent = popupContent ? renderOverlayContent(popupContent) : popupText ?? null;

  if (resolvedPopupContent) {
    layer.bindPopup(resolvedPopupContent);
  }

  const resolvedTooltipContent = tooltipContent
    ? renderOverlayContent(tooltipContent)
    : tooltipText ?? null;

  if (resolvedTooltipContent) {
    layer.bindTooltip(resolvedTooltipContent);
  }

  return layer;
}
