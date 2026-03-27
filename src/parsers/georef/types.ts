import type { GeoPointLike } from '../../core/types';

/**
 * Affine world file transform.
 */
export interface WorldFileTransform {
  originX: number;
  originY: number;
  rotationX: number;
  rotationY: number;
  scaleX: number;
  scaleY: number;
}

/**
 * Projected point produced by world file math.
 */
export interface ProjectedPoint {
  x: number;
  y: number;
}

/**
 * Computed projected bounds for a raster image.
 */
export interface GeoreferencedImageBounds {
  corners: {
    bottomLeft: ProjectedPoint;
    bottomRight: ProjectedPoint;
    topLeft: ProjectedPoint;
    topRight: ProjectedPoint;
  };
  maxX: number;
  maxY: number;
  minX: number;
  minY: number;
}

/**
 * Pixel dimensions of a raster image.
 */
export interface RasterImageSize {
  height: number;
  width: number;
}

/**
 * Options for translating projected raster bounds into geographic bounds usable on a web map.
 */
export interface ComputeGeographicImageBoundsOptions {
  allowApproximateRotation?: boolean;
  projectPoint?: (point: ProjectedPoint) => GeoPointLike;
}
