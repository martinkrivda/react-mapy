const MAP_THEME_STYLE_ELEMENT_ID = 'react-mapy-theme-styles';

const MAP_THEME_CSS = `
.react-mapy {
  background: var(--react-mapy-background);
  color: var(--react-mapy-foreground);
}

.react-mapy .leaflet-tile-pane {
  filter: var(--react-mapy-tile-filter);
  opacity: var(--react-mapy-tile-opacity);
  transform-origin: center center;
  transition:
    filter 160ms ease,
    opacity 160ms ease;
}

.react-mapy .leaflet-bar,
.react-mapy .leaflet-control-attribution,
.react-mapy .react-mapy-provider-branding {
  backdrop-filter: var(--react-mapy-control-backdrop);
  background: var(--react-mapy-control-background);
  border: 1px solid var(--react-mapy-control-border);
  box-shadow: var(--react-mapy-control-shadow);
}

.react-mapy .leaflet-bar,
.react-mapy .react-mapy-provider-branding {
  border-radius: 16px;
  overflow: hidden;
}

.react-mapy .leaflet-control-attribution {
  border-radius: 999px;
  color: var(--react-mapy-muted);
  padding: 4px 10px;
}

.react-mapy .react-mapy-track-legend {
  backdrop-filter: var(--react-mapy-control-backdrop);
  background: var(--react-mapy-control-background);
  border: 1px solid var(--react-mapy-control-border);
  border-radius: 16px;
  box-shadow: var(--react-mapy-control-shadow);
  color: var(--react-mapy-control-color);
  min-width: 132px;
  padding: 10px 12px;
}

.react-mapy .react-mapy-track-legend__label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.react-mapy .react-mapy-track-legend__scale {
  border-radius: 999px;
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.12);
  height: 8px;
  margin-top: 8px;
}

.react-mapy .react-mapy-track-legend__range {
  color: var(--react-mapy-muted);
  font-size: 11px;
  margin-top: 6px;
}

.react-mapy .leaflet-control-attribution a,
.react-mapy .react-mapy-provider-branding__link {
  color: var(--react-mapy-accent);
}

.react-mapy .leaflet-bar a,
.react-mapy .leaflet-bar a:hover,
.react-mapy .leaflet-bar a:focus {
  background: transparent;
  border-bottom-color: var(--react-mapy-control-border);
  color: var(--react-mapy-control-color);
}

.react-mapy .leaflet-bar a:last-child {
  border-bottom: 0;
}

.react-mapy .leaflet-control-zoom a.leaflet-disabled {
  color: var(--react-mapy-disabled);
}

.react-mapy .leaflet-popup-content-wrapper,
.react-mapy .leaflet-popup-tip {
  background: var(--react-mapy-popup-background);
  color: var(--react-mapy-popup-color);
}

.react-mapy .leaflet-popup-content-wrapper {
  border: 1px solid var(--react-mapy-popup-border);
  box-shadow: var(--react-mapy-popup-shadow);
}

.react-mapy .leaflet-popup-close-button,
.react-mapy .leaflet-popup-close-button:hover {
  color: var(--react-mapy-muted);
}
`;

/**
 * Injects the minimal built-in theme styles once per document.
 */
export function ensureMapThemeStyles(): void {
  if (typeof document === 'undefined') {
    return;
  }

  if (document.getElementById(MAP_THEME_STYLE_ELEMENT_ID)) {
    return;
  }

  const styleElement = document.createElement('style');
  styleElement.id = MAP_THEME_STYLE_ELEMENT_ID;
  styleElement.textContent = MAP_THEME_CSS;
  document.head.append(styleElement);
}
