import { computeBounds, toGeoPoint } from '../../core/geometry';
import type { GeoBounds } from '../../core/types';
import type {
  ComputeGeographicImageBoundsOptions,
  GeoreferencedImageBounds,
  ProjectedPoint,
  WorldFileTransform,
} from './types';

/**
 * Parses a six-line world file into an affine transform.
 */
export function parseWorldFile(source: string): WorldFileTransform {
  const lines = source
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length !== 6) {
    throw new Error(`Expected 6 world file values, received ${lines.length}.`);
  }

  const values = lines.map((line) => Number.parseFloat(line));

  if (values.some((value) => Number.isNaN(value))) {
    throw new Error('World file contains invalid numeric values.');
  }

  const [scaleX, rotationY, rotationX, scaleY, originX, originY] = values as [
    number,
    number,
    number,
    number,
    number,
    number,
  ];

  return {
    originX,
    originY,
    rotationX,
    rotationY,
    scaleX,
    scaleY,
  };
}

/**
 * Applies a world file transform to a pixel coordinate.
 */
export function applyWorldFileTransform(
  transform: WorldFileTransform,
  pixelX: number,
  pixelY: number,
): ProjectedPoint {
  return {
    x: transform.scaleX * pixelX + transform.rotationX * pixelY + transform.originX,
    y: transform.rotationY * pixelX + transform.scaleY * pixelY + transform.originY,
  };
}

/**
 * Returns true when the world file contains rotation terms and therefore cannot be rendered
 * exactly by Leaflet's axis-aligned image overlay without an additional rotation-aware plugin.
 */
export function hasWorldFileRotation(transform: WorldFileTransform): boolean {
  return Math.abs(transform.rotationX) > 1e-10 || Math.abs(transform.rotationY) > 1e-10;
}

/**
 * Computes projected outer bounds for a georeferenced raster image.
 */
export function computeGeoreferencedImageBounds(
  width: number,
  height: number,
  transform: WorldFileTransform,
): GeoreferencedImageBounds {
  if (width <= 0 || height <= 0) {
    throw new Error('Image width and height must be positive.');
  }

  const topLeft = applyWorldFileTransform(transform, -0.5, -0.5);
  const topRight = applyWorldFileTransform(transform, width - 0.5, -0.5);
  const bottomLeft = applyWorldFileTransform(transform, -0.5, height - 0.5);
  const bottomRight = applyWorldFileTransform(transform, width - 0.5, height - 0.5);
  const xs = [topLeft.x, topRight.x, bottomLeft.x, bottomRight.x];
  const ys = [topLeft.y, topRight.y, bottomLeft.y, bottomRight.y];

  return {
    corners: {
      bottomLeft,
      bottomRight,
      topLeft,
      topRight,
    },
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
    minX: Math.min(...xs),
    minY: Math.min(...ys),
  };
}

/**
 * Computes geographic bounds for a raster image that can be used directly with Leaflet's
 * `imageOverlay`. When no `projectPoint` callback is supplied, the world file coordinates are
 * treated as `x=lng` and `y=lat`.
 */
export function computeGeographicImageBounds(
  width: number,
  height: number,
  transform: WorldFileTransform,
  options: ComputeGeographicImageBoundsOptions = {},
): GeoBounds {
  if (hasWorldFileRotation(transform) && !options.allowApproximateRotation) {
    throw new Error(
      'Rotated world files require allowApproximateRotation=true because Leaflet image overlays are axis-aligned.',
    );
  }

  const bounds = computeGeoreferencedImageBounds(width, height, transform);
  const corners = Object.values(bounds.corners).map((point) =>
    options.projectPoint ? toGeoPoint(options.projectPoint(point)) : { lat: point.y, lng: point.x },
  );
  const geographicBounds = computeBounds(corners);

  if (!geographicBounds) {
    throw new Error('Unable to resolve geographic bounds from the provided raster metadata.');
  }

  return geographicBounds;
}
