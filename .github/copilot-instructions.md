# GitHub Copilot Instructions

This repository is `react-mapy`, a TypeScript React 19 library built on Leaflet.
Optimize for a small, stable, strongly typed public API.

## What This Library Is

- Reusable React map primitives and presets for host applications
- Provider-backed tile rendering, with Mapy.com as the default provider
- Pure parsers and geospatial utilities that remain testable without the browser
- Storybook-documented components and presets intended for real reuse, not app-specific logic

## Architecture Boundaries

- `src/core/` contains shared types, geometry helpers, provider contracts, heatmap helpers, and track utilities.
- `src/providers/` contains provider-specific behavior. Keep Mapy.com logic isolated under `src/providers/mapy/`.
- `src/leaflet/` contains low-level React wrappers around Leaflet primitives.
- `src/parsers/` must stay pure and should not depend on React or browser-only APIs.
- `src/presets/` contains higher-level ready-made layers built on top of lower layers.

Do not leak provider-specific behavior into `core` or generic Leaflet wrappers.

## Public API Expectations

- Prefer composition over monolithic components.
- Keep exports tree-shakeable and explicitly typed.
- Add JSDoc to public exports.
- Preserve backward compatibility when possible.
- Expose subpath-safe APIs through:
  - `react-mapy`
  - `react-mapy/core`
  - `react-mapy/leaflet`
  - `react-mapy/parsers`
  - `react-mapy/presets`
  - `react-mapy/providers/mapy`

## Dependency Rules

- `react`, `react-dom`, and `leaflet` are peer dependencies.
- Keep runtime dependencies minimal.
- Do not introduce Tailwind, shadcn, TanStack Router, or TanStack Query as runtime requirements.
- Do not bundle React or Leaflet into distributable output.

## Styling and UX

- Keep library styling minimal and framework-agnostic.
- Use extension points such as props, `className`, `style`, and composable children where appropriate.
- Avoid app-specific visual assumptions in low-level layers.

## Testing and Validation

Prefer tests for pure logic first, then focused component tests.

Before finishing code changes, run:

```bash
pnpm typecheck
pnpm test
pnpm build
```

Also run this when Storybook stories or docs change:

```bash
pnpm build-storybook
```

## Documentation

When public behavior changes:

- update `README.md`
- add or update Storybook stories
- keep usage examples aligned with the current API

## Repository Conventions

- Use `.yaml` for YAML files everywhere in this repository.
- Prefer pure utilities in `core` or `parsers` before adding new React wrappers.
- If a feature is specific to Mapy.com, keep it under `src/providers/mapy/` or a clearly named preset.

## Existing Guidance Files

For deeper project context, also follow:

- `AGENTS.md`
- `CLAUDE.md`
- `docs/agent-context/mapycom.md`
- `.github/copilot-workspace.yaml`
