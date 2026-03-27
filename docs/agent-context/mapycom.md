# Mapy.com Context For AI Agents

This file summarizes the Mapy.com developer context relevant to `react-mapy`.
It is a distilled project note based on user-provided documentation and should be
treated as implementation guidance for this repository, not as a full vendor spec.

## Core Principles

- most REST APIs require an API key from `developer.mapy.com`
- URL schemes for showing maps, search, and route deep links do not require an API key
- keep Mapy-specific behavior isolated from generic Leaflet and parser layers
- do not hardcode Mapy assumptions across the whole library

## Tile API

Mapy raster tiles are requested from:

`https://api.mapy.com/v1/maptiles/{mapset}/{tileSize}/{z}/{x}/{y}?apikey=API_KEY`

Useful examples:

- basic: `.../maptiles/basic/256/{z}/{x}/{y}?apikey=...`
- outdoor: `.../maptiles/outdoor/256/{z}/{x}/{y}?apikey=...`
- retina: `.../maptiles/basic/256@2x/{z}/{x}/{y}?apikey=...`

Important notes:

- examples use attribution linking to `https://api.mapy.com/copyright`
- Leaflet examples from Mapy.com include a logo control
- if logo support is added later, keep it provider-specific and opt-in
- supported variants mentioned in the provided docs include at least `basic`, `outdoor`, and aerial/static map variants

## APIs Relevant To Future Library Work

The following endpoints are good candidates for provider helpers or pure client utilities:

- forward geocoding: `/v1/geocode`
- reverse geocoding: `/v1/rgeocode`
- routing: `/v1/routing/route`
- matrix routing: `/v1/routing/matrix-m`
- elevation: `/v1/elevation`
- static maps: `/v1/static/map`
- static panorama: `/v1/static/pano`
- timezone by coordinate: `/v1/timezone/coordinate`
- timezone by name: `/v1/timezone/timezone`

When adding support for these endpoints:

- prefer pure fetch-independent request builders or pure response parsers where possible
- do not add a mandatory HTTP client dependency
- keep response types explicit and narrow
- avoid coupling low-level helpers to React

## URL Schemes

Mapy.com also supports direct links without API keys:

- show map: `https://mapy.com/fnc/v1/showmap`
- search: `https://mapy.com/fnc/v1/search`
- route: `https://mapy.com/fnc/v1/route`

These are useful for lightweight helpers or examples, but should not replace typed REST integrations when structured data is needed.

## Panorama

The provided docs mention a JavaScript panorama component loaded from:

`https://api.mapy.cz/js/panorama/v1/panorama.js`

If panorama support is added to this library:

- keep it as an optional, separate integration layer
- do not pull panorama runtime into the default Leaflet path
- consider a dedicated subpath export instead of adding it to the root API immediately

## Recommended Design For New Features

If implementing new Mapy.com support, prefer this order:

1. add provider or request/response types in `src/core/` only when truly generic
2. add Mapy-specific implementation in `src/providers/mapy/`
3. add pure parsing or transformation helpers in `src/parsers/`
4. expose React wrappers from `src/presets/` only when they improve reuse

Examples:

- routing response parser: `src/providers/mapy/`
- route GeoJSON adapter: `src/parsers/`
- `MapyRouteLayer` preset: `src/presets/`
- geocode client types: `src/providers/mapy/`

## Guardrails

- do not introduce backend proxy assumptions by default
- do not add business-specific map workflows into low-level primitives
- do not add heavy GIS dependencies unless there is a strong payoff
- do not make Mapy.com the hidden default in generic components outside the provider layer

## Source

This context comes from a user-provided Mapy.com documentation excerpt referencing:

- `https://context7.com/mapycom/developer`
