export { computeBounds, haversineDistanceMeters, toGeoPoint, toLatLngTuple } from './geometry';
export { computeDataBounds } from './viewport';
export {
  buildTrackHeatmapPoints,
  DEFAULT_HEATMAP_GRADIENT,
  normalizeHeatmapPoints,
} from './heatmap';
export {
  buildPaceSegments,
  calculatePaceSecondsPerKilometer,
  DEFAULT_PACE_COLOR_STOPS,
} from './pacing';
export type {
  BuildTrackHeatmapPointsOptions,
  HeatmapGradient,
  HeatmapPoint,
  HeatmapPointLike,
  NormalizeHeatmapPointsOptions,
} from './heatmap';
export type { BuildPaceSegmentsOptions, PaceColorStop, PaceSegment } from './pacing';
export {
  buildElevationSegments,
  buildHeartRateSegments,
  buildSpeedSegments,
  emaSmoothPoints,
  elevationToColor,
  heartRateToColor,
  hslToHex,
  speedToColor,
  toTimeSeconds,
  zipStreamToPoints,
} from './tracks';
export { mapThemes, resolveMapTheme } from './themes';
export type {
  BuildElevationSegmentsOptions,
  BuildHeartRateSegmentsOptions,
  BuildSpeedSegmentsOptions,
  ElevationColorOptions,
  ElevationSegment,
  HeartRateColorOptions,
  HeartRateSegment,
  SpeedColorOptions,
  SpeedSegment,
  TrackSmoothingOptions,
  ZipStreamToPointsInput,
} from './tracks';
export type { MapTheme, MapThemeDefinition, MapThemeOverride, MapThemePreset } from './themes';
export type {
  TileCoordinates,
  TileProviderBranding,
  TileProviderBrandingPosition,
  TileLayerConfig,
  TileProvider,
  TileProviderCapabilities,
  TileProviderConfigBase,
} from './providers';
export type {
  GeoBounds,
  GeoPoint,
  GeoPointLike,
  GeoPointTuple,
  StreamPoint,
  TimeValue,
  TimedGeoPoint,
} from './types';
export type { FitToDataInput } from './viewport';
