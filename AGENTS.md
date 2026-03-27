# AGENTS.md

## Project

`react-mapy` is a TypeScript React 19 library built on top of Leaflet.
The main goal is to provide a small, strongly typed public API for map rendering,
provider-backed tile layers, GPX rendering, and spatial utilities.

## Architecture

Keep code organized by responsibility:

- `src/core/`: shared types, provider interfaces, geometry helpers, pacing utilities
- `src/providers/`: provider-specific implementations, currently Mapy.com
- `src/leaflet/`: low-level React wrappers around Leaflet primitives
- `src/parsers/`: pure parsers and geospatial utilities without React/DOM coupling
- `src/presets/`: higher-level ready-made layers and presets

Do not leak provider-specific behavior into `core` or generic Leaflet wrappers.
If a feature is Mapy.com-specific, isolate it under `src/providers/mapy/` or create a clearly named preset.

## Package Constraints

- `react`, `react-dom`, and `leaflet` are peer dependencies
- keep runtime dependencies minimal
- prefer tree-shakeable exports and stable explicit types
- styling must stay minimal and framework-agnostic
- parser logic should remain testable in a Node environment

## Development Commands

- `pnpm dev`: local Vite playground
- `pnpm storybook`: component docs/dev environment
- `pnpm lint`: ESLint
- `pnpm typecheck`: strict TypeScript check
- `pnpm test`: Vitest
- `pnpm build`: tsup library build

## Implementation Guidelines

- prefer composition over monolithic components
- document public exports with JSDoc
- keep public APIs stable and explicit
- add tests for pure logic first, then targeted component tests
- avoid DOM-heavy abstractions when a pure utility or provider contract is enough
- use `.yaml` for YAML files everywhere in the repository
- YAML files in this repository must use the `.yaml` extension only

## Mapy.com Context

Relevant Mapy.com notes for this repository are summarized in
`docs/agent-context/mapycom.md`.

Use that context when extending:

- Mapy raster tile providers
- geocoding / reverse geocoding helpers
- routing and matrix routing helpers
- elevation and panorama utilities
- Mapy-specific presets or examples

## Current Scope

The current MVP covers:

- Leaflet map container and common vector layers
- provider-backed tile layers
- Mapy.com tile provider
- GPX parsing
- GPX track rendering with pace-based segment coloring
- basic georeferenced asset helpers

If you add new API surface, prefer:

1. pure parser or service in `src/parsers/` or `src/providers/`
2. typed export from a focused subpath
3. optional React wrapper or preset only when there is clear reuse value
