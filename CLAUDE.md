# CLAUDE.md

## Project

`react-mapy` is a TypeScript React 19 library built on Leaflet.
It provides a small, strongly typed public API for map rendering, provider-backed tile layers, GPX rendering, and spatial utilities.

## Architecture

```
src/core/        shared types, provider interfaces, geometry helpers, pacing utilities
src/providers/   provider-specific implementations (currently Mapy.com)
src/leaflet/     low-level React wrappers around Leaflet primitives
src/parsers/     pure parsers and geospatial utilities — no React/DOM dependency
src/presets/     higher-level ready-made layers and presets
```

**Hard boundaries:**

- Do not leak provider-specific behavior into `core` or generic Leaflet wrappers.
- Mapy.com-specific code belongs in `src/providers/mapy/` or a clearly named preset.
- Parser logic must remain testable in a Node environment (no DOM coupling).

## Package Constraints

- `react`, `react-dom`, and `leaflet` are **peer dependencies** — do not add them as runtime deps.
- Keep runtime dependencies minimal.
- Prefer tree-shakeable exports and stable, explicit types.
- Styling must stay minimal and framework-agnostic (no Tailwind, no shadcn).

## Public Entry Points

- `react-mapy`
- `react-mapy/core`
- `react-mapy/leaflet`
- `react-mapy/parsers`
- `react-mapy/presets`
- `react-mapy/providers/mapy`

When adding new API surface:

1. Start with a pure parser or service in `src/parsers/` or `src/providers/`.
2. Export it from a focused subpath with explicit types.
3. Add a React wrapper or preset only when there is clear reuse value.

## Development Commands

```bash
pnpm dev            # local Vite playground
pnpm storybook      # component docs / dev environment
pnpm lint           # ESLint
pnpm typecheck      # strict TypeScript check
pnpm test           # Vitest
pnpm build          # tsup library build (ESM, CJS, .d.ts)
pnpm build-storybook
```

## Implementation Guidelines

- Prefer **composition** over monolithic components.
- Document all public exports with **JSDoc**.
- Keep public APIs **stable and explicit** — avoid breaking changes.
- Write **tests for pure logic first**, then targeted component tests.
- Avoid DOM-heavy abstractions when a pure utility or provider contract is enough.
- Use `.yaml` for YAML files everywhere in the repository.
- YAML files in this repository must use the `.yaml` extension only.

## Mapy.com Context

Extended Mapy.com notes live in `docs/agent-context/mapycom.md`.

Consult that file when working on:

- Mapy raster tile providers
- Geocoding / reverse-geocoding helpers
- Routing and matrix routing helpers
- Elevation and panorama utilities
- Mapy-specific presets or examples

## Current MVP Scope

- Leaflet map container and common vector layers
- Provider-backed tile layers
- Mapy.com tile provider
- GPX parsing (`parseGpx` — pure, no DOM)
- GPX track rendering with pace-based segment coloring (`GpxTrackLayer`)
- Basic georeferenced asset helpers (`parseWorldFile`, `computeGeoreferencedImageBounds`)

## Tooling

| Tool                       | Purpose                                 |
| -------------------------- | --------------------------------------- |
| `pnpm`                     | Package management                      |
| `tsup`                     | Library build (ESM + CJS + `.d.ts`)     |
| `vite`                     | Local playground                        |
| `storybook`                | Component docs (React + Vite, Autodocs) |
| `vitest` + Testing Library | Unit and component tests                |
| `changesets`               | Versioning and releases                 |
| GitHub Actions             | CI: lint, typecheck, test, build        |
