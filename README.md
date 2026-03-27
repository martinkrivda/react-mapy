# react-mapy

[![CI](https://img.shields.io/github/actions/workflow/status/martinkrivda/react-mapy/ci.yaml?branch=main&label=CI)](https://github.com/martinkrivda/react-mapy/actions/workflows/ci.yaml)
[![Node.js Version](https://img.shields.io/badge/node.js-22.20%20LTS-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![pnpm Version](https://img.shields.io/badge/pnpm-10.20.0-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![React](https://img.shields.io/badge/react-19-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![Leaflet](https://img.shields.io/badge/leaflet-1.9.4-199900?logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![GitHub Sponsors](https://img.shields.io/badge/sponsor-GitHub-ea4aaa?logo=githubsponsors&logoColor=white)](https://github.com/sponsors/martinkrivda)
[![GitHub Stars](https://img.shields.io/github/stars/martinkrivda/react-mapy?style=social)](https://github.com/martinkrivda/react-mapy/stargazers)

`react-mapy` is a TypeScript React 19 map component library powered by Leaflet, with Mapy.com as the default tile provider.

It is designed for frontend applications that want a small, strongly typed map API without pulling in framework-specific UI choices. The library ships with composable Leaflet wrappers, Mapy.com provider support, GPX and georeferenced asset utilities, historical heatmaps, colored stream tracks, and Storybook-backed documentation.

⭐ Star us on GitHub — it motivates us a lot!

If you want to support ongoing maintenance, you can sponsor development here:
[github.com/sponsors/martinkrivda](https://github.com/sponsors/martinkrivda)

## Why react-mapy

- Small public API with tree-shakeable exports
- React 19 friendly
- Leaflet-powered rendering with no React or Leaflet bundling in library output
- Provider abstraction instead of hardcoded tile URLs
- Mapy.com support with automatic branding and attribution handling
- Minimal, framework-agnostic styling
- Pure parser and utility layers that stay testable without the browser
- Storybook for development and public component documentation

## What You Get

- `LeafletMap`, `MapTileLayer`, `MarkerLayer`, `PolylineLayer`, `GeoJsonLayer`
- `HeatmapLayer` for event density and historical route overlays
- `GpxTrackLayer` with pace-based segment coloring and in-map legend
- `StreamTrackLayer` with speed, elevation, and heart-rate coloring
- `GeoreferencedImageOverlay` for world-file based raster overlays
- `createMapyProvider` and `mapyProvider`
- `parseGpx`, `parseWorldFile`, and georeferenced image helpers
- `zipStreamToPoints`, `buildTrackHeatmapPoints`, geometry and coloring utilities

## Repository Layout

```text
src/
  core/         shared types, geometry helpers, heatmap and track utilities
  providers/    provider implementations, currently Mapy.com
  leaflet/      low-level React wrappers around Leaflet primitives
  parsers/      pure GPX and georeferencing utilities
  presets/      higher-level reusable map layers
  assets/       bundled library assets such as built-in marker icons
stories/        Storybook stories and docs
playground/     local Vite playground
test/           Vitest unit and component tests
```

## Requirements

- Node.js version pinned in [`.nvmrc`](./.nvmrc): `22.20.0`
- pnpm `10.20.0`

Recommended setup:

```bash
nvm install
nvm use
corepack enable
corepack prepare pnpm@10.20.0 --activate
pnpm -v
```

## Getting Started

Install the library and its peer dependencies:

```bash
pnpm add react-mapy react react-dom leaflet
```

Peer dependencies:

- `react` `^19.0.0`
- `react-dom` `^19.0.0`
- `leaflet` `^1.9.4`

Import Leaflet CSS once in your host app:

```ts
import 'leaflet/dist/leaflet.css';
```

### Minimal Map

```tsx
import { LeafletMap, MapTileLayer, MarkerLayer } from 'react-mapy';
import { createMapyProvider } from 'react-mapy/providers/mapy';

const provider = createMapyProvider({
  apiKey: import.meta.env.VITE_MAPY_API_KEY,
  variant: 'outdoor',
});

export function MapExample() {
  return (
    <LeafletMap center={{ lat: 50.0755, lng: 14.4378 }} zoom={13} style={{ height: 420 }}>
      <MapTileLayer provider={provider} />
      <MarkerLayer position={{ lat: 50.0755, lng: 14.4378 }} tooltipText="Prague" />
    </LeafletMap>
  );
}
```

### Mapy.com Provider

Mapy-specific behavior is isolated in `react-mapy/providers/mapy`. The map layer itself accepts a provider object rather than hardcoded URLs.

```tsx
import { LeafletMap, MapTileLayer, PolylineLayer } from 'react-mapy';
import { createMapyProvider } from 'react-mapy/providers/mapy';

const provider = createMapyProvider({
  apiKey: import.meta.env.VITE_MAPY_API_KEY,
  language: 'en',
  retina: true,
  variant: 'basic',
});

const route = [
  { lat: 50.0784, lng: 14.4208 },
  { lat: 50.081, lng: 14.4285 },
  { lat: 50.0781, lng: 14.4367 },
  { lat: 50.0738, lng: 14.4439 },
];

export function ProviderExample() {
  return (
    <LeafletMap center={route[0]} zoom={13} style={{ height: 480 }}>
      <MapTileLayer provider={provider} />
      <PolylineLayer coordinates={route} pathOptions={{ color: '#0f766e', weight: 4 }} />
    </LeafletMap>
  );
}
```

When you use the Mapy provider, the library renders the required Mapy.com logo control automatically by default. If you disable provider branding manually, you are responsible for keeping the integration compliant.

For development, prototypes, or internal tools, the current direct client-side mode stays supported:

```tsx
const provider = createMapyProvider({
  apiKey: import.meta.env.VITE_MAPY_API_KEY,
  variant: 'outdoor',
});
```

For production applications where you do not want to expose the Mapy.com API key in frontend code, you can switch the same provider factory to a backend-proxied mode:

```tsx
const provider = createMapyProvider({
  language: 'en',
  proxy: {
    urlTemplate: '/api/mapy/tiles/{variant}/{tileSize}/{z}/{x}/{y}?lang={lang}',
  },
  variant: 'outdoor',
});
```

That keeps the React map API unchanged while moving the sensitive API key usage to your backend service.

Example backend flow:

- frontend requests `/api/mapy/tiles/outdoor/256/14/8956/5513?lang=en`
- your backend adds the private `apikey`
- backend fetches the tile from Mapy.com
- backend streams the tile response back to the browser

This library intentionally supports both modes:

- direct frontend Mapy.com requests with `apiKey`
- backend-proxied tile delivery with `proxy.urlTemplate`

## Usage

### Custom Markers

`MarkerLayer` supports:

- default Leaflet marker behavior
- custom SVG markup
- React-rendered SVG content
- Lucide-style icon components
- built-in presets such as `ofeed`

Custom React SVG:

```tsx
import { LeafletMap, MapTileLayer, MarkerLayer } from 'react-mapy';
import { createMapyProvider } from 'react-mapy/providers/mapy';

function PinIcon({ width = 36, height = 36 }: { height?: number; size?: number; width?: number }) {
  return (
    <svg viewBox="0 0 36 36" width={width} height={height} fill="none">
      <path
        d="M18 33c6.5-8.2 9.8-13.8 9.8-18A9.8 9.8 0 1 0 8.2 15c0 4.2 3.3 9.8 9.8 18Z"
        fill="#0f766e"
      />
      <circle cx="18" cy="15" r="5.2" fill="#f8fafc" />
    </svg>
  );
}

const provider = createMapyProvider({
  apiKey: import.meta.env.VITE_MAPY_API_KEY,
  variant: 'basic',
});

export function CustomMarkerExample() {
  return (
    <LeafletMap center={{ lat: 50.0755, lng: 14.4378 }} zoom={13} style={{ height: 420 }}>
      <MapTileLayer provider={provider} />
      <MarkerLayer
        customIcon={{
          component: PinIcon,
          size: [36, 36],
        }}
        position={{ lat: 50.0755, lng: 14.4378 }}
        tooltipText="Custom marker"
      />
    </LeafletMap>
  );
}
```

Built-in `ofeed` marker preset:

```tsx
<MarkerLayer
  customIcon={{
    preset: 'ofeed',
    size: [40, 60],
  }}
  position={{ lat: 50.0755, lng: 14.4378 }}
  tooltipText="ofeed location"
/>
```

### Theme Presets

`LeafletMap` supports built-in presentation themes:

- `mapy`
- `dark`
- `neutral`
- `mapbox`

These presets style Leaflet controls, popups, attribution surfaces, and raster tile treatment. They do not change the provider itself.

```tsx
import { LeafletMap, MapTileLayer } from 'react-mapy';
import { createMapyProvider } from 'react-mapy/providers/mapy';

const provider = createMapyProvider({
  apiKey: import.meta.env.VITE_MAPY_API_KEY,
  variant: 'basic',
});

export function ThemedMapExample() {
  return (
    <LeafletMap
      center={{ lat: 50.0755, lng: 14.4378 }}
      theme="dark"
      zoom={13}
      style={{ height: 420 }}
    >
      <MapTileLayer provider={provider} />
    </LeafletMap>
  );
}
```

You can also extend a preset:

```tsx
<LeafletMap
  center={{ lat: 50.0755, lng: 14.4378 }}
  theme={{
    extends: 'neutral',
    accentColor: '#18181b',
    controlBorderColor: '#a1a1aa',
    tileFilter: 'grayscale(0.18) saturate(0.8) contrast(0.96)',
  }}
  zoom={13}
>
  <MapTileLayer provider={provider} />
</LeafletMap>
```

### GPX Tracks

`parseGpx` is pure and independent of React. `GpxTrackLayer` consumes the parsed track and handles pace-based coloring at render time.

```tsx
import { GpxTrackLayer, LeafletMap, MapTileLayer, parseGpx } from 'react-mapy';
import { createMapyProvider } from 'react-mapy/providers/mapy';

const provider = createMapyProvider({
  apiKey: import.meta.env.VITE_MAPY_API_KEY,
  variant: 'outdoor',
});

const document = parseGpx(gpxXmlString);
const track = document.tracks[0];

export function GpxExample() {
  if (!track) {
    return null;
  }

  return (
    <LeafletMap center={{ lat: 50.0755, lng: 14.4378 }} zoom={13} style={{ height: 480 }}>
      <MapTileLayer provider={provider} />
      <GpxTrackLayer track={track} colorMode="pace" weight={5} />
    </LeafletMap>
  );
}
```

### Stream Points and Colored Tracks

Use `zipStreamToPoints` to merge stream arrays and render them through `StreamTrackLayer`.

```tsx
import { LeafletMap, StreamTrackLayer, zipStreamToPoints } from 'react-mapy';

const streamPoints = zipStreamToPoints({
  elevation,
  path,
  speedKmh,
  time,
});

export function StreamExample() {
  return (
    <LeafletMap center={{ lat: 50.0755, lng: 14.4378 }} zoom={13} style={{ height: 480 }}>
      <StreamTrackLayer
        points={streamPoints}
        smooth={{ alpha: 0.25, samplesPerSeg: 6 }}
        speedDomain={{ minKmh: 5, maxKmh: 20 }}
        weight={6}
      />
    </LeafletMap>
  );
}
```

The same preset supports `speed`, `elevation`, `heart-rate`, and `solid` display modes.

### Heatmaps

Use `HeatmapLayer` under current markers or active tracks to visualize historical density.

```tsx
import { HeatmapLayer, LeafletMap, MarkerLayer, buildTrackHeatmapPoints } from 'react-mapy';

const historicalEvents = [
  { lat: 50.0756, lng: 14.4377 },
  { lat: 50.0758, lng: 14.438 },
  { lat: 50.0762, lng: 14.4404 },
];

const historicalTracks = [
  [
    { lat: 50.0782, lng: 14.4213 },
    { lat: 50.0796, lng: 14.4261 },
    { lat: 50.0784, lng: 14.4316 },
  ],
];

const historicalTrackHeatmap = buildTrackHeatmapPoints(historicalTracks, {
  sampleStepMeters: 25,
});

export function EventHeatmapExample() {
  return (
    <LeafletMap center={{ lat: 50.0755, lng: 14.4378 }} zoom={13} style={{ height: 480 }}>
      <HeatmapLayer points={historicalEvents} radius={28} />
      <MarkerLayer position={{ lat: 50.0755, lng: 14.4378 }} tooltipText="Current event" />
    </LeafletMap>
  );
}

export function HistoricalTrackHeatmapExample() {
  return (
    <LeafletMap center={{ lat: 50.0755, lng: 14.4378 }} zoom={13} style={{ height: 480 }}>
      <HeatmapLayer points={historicalTrackHeatmap} radius={22} />
    </LeafletMap>
  );
}
```

### Georeferenced Raster Overlays

`GeoreferencedImageOverlay` supports browser-friendly rasters with geographic bounds or world-file metadata.

```tsx
import { GeoreferencedImageOverlay, LeafletMap } from 'react-mapy';

export function OverlayExample() {
  return (
    <LeafletMap center={{ lat: 50.0755, lng: 14.4378 }} zoom={14} style={{ height: 480 }}>
      <GeoreferencedImageOverlay
        src={imageUrl}
        imageSize={{ width: 400, height: 240 }}
        worldFile={worldFileText}
        overlayOptions={{ opacity: 0.72 }}
      />
    </LeafletMap>
  );
}
```

The runtime focuses on the practical `PNG/JPG + world file` workflow. GeoTIFF decoding is intentionally not part of the runtime bundle.

## Public Exports

Root package:

- `react-mapy`

Focused subpath exports:

- `react-mapy/core`
- `react-mapy/leaflet`
- `react-mapy/parsers`
- `react-mapy/presets`
- `react-mapy/providers/mapy`

Mapy provider types also export proxy configuration helpers:

- `MapyProviderOptions`
- `MapyProxyOptions`

## Local Development

Clone the repository and install dependencies:

```bash
git clone https://github.com/martinkrivda/react-mapy.git
cd react-mapy
pnpm install
```

For local Mapy.com tile preview, create `.env.local` in the repository root:

```env
VITE_MAPY_API_KEY=your_mapy_api_key
```

Available local workflows:

- `pnpm dev` - run the Vite playground
- `pnpm storybook` - run Storybook on port `6006`
- `pnpm lint` - lint the repository
- `pnpm typecheck` - run strict TypeScript checks
- `pnpm test` - run Vitest
- `pnpm build` - build ESM, CJS, and `.d.ts` outputs
- `pnpm build-storybook` - build Storybook statically
- `pnpm changeset` - create a changeset entry

Default local URLs:

- Playground: `http://localhost:5173`
- Storybook: `http://localhost:6006`

## Contributing

Issues and pull requests are welcome.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for:

- branch naming and Conventional Commit rules
- Changesets-based versioning and release flow
- semver guidance for `patch`, `minor`, and `major`
- pull request expectations and validation commands
- project Code of Conduct

## Commits

Conventional Commits are preferred. Examples:

```bash
git commit -m "feat(marker): add ofeed built-in marker preset"
git commit -m "fix(heatmap): keep overlay above tiles during pan"
git commit -m "docs(readme): refresh getting started section"
git commit -m "test(stream): cover elevation color legend"
```

## Storybook and Playground

Storybook is the recommended place to inspect and compare variants:

- theme presets
- Mapy.com tile variants
- custom marker options
- heatmaps
- GPX and stream track presets
- georeferenced overlays

Use the Vite playground when you want a single integration surface and a fast local sandbox.

## Donations

If this library saves you time or ships into production, consider supporting maintenance through GitHub Sponsors:

[github.com/sponsors/martinkrivda](https://github.com/sponsors/martinkrivda)

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE).
