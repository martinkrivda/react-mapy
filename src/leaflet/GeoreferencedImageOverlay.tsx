import { imageOverlay, type FitBoundsOptions, type ImageOverlayOptions } from 'leaflet';
import { useEffect, useMemo } from 'react';

import { toLatLngTuple } from '../core/geometry';
import type { GeoBounds, GeoPointLike } from '../core/types';
import {
  computeGeographicImageBounds,
  parseWorldFile,
  type RasterImageSize,
  type WorldFileTransform,
} from '../parsers';
import type { ComputeGeographicImageBoundsOptions, ProjectedPoint } from '../parsers';
import { useLeafletMap } from './context';
import { runWhenMapReady } from './lifecycle';

export type GeoreferencedImageOverlayBounds =
  | GeoBounds
  | readonly [southWest: GeoPointLike, northEast: GeoPointLike];

/**
 * Props for displaying a georeferenced raster image above the current map.
 */
export interface GeoreferencedImageOverlayProps {
  allowApproximateRotation?: boolean;
  bounds?: GeoreferencedImageOverlayBounds;
  fitBounds?: boolean;
  fitBoundsOptions?: FitBoundsOptions;
  imageSize?: RasterImageSize;
  overlayOptions?: ImageOverlayOptions;
  projectPoint?: ComputeGeographicImageBoundsOptions['projectPoint'];
  src: string;
  worldFile?: string | WorldFileTransform;
}

/**
 * Displays a raster image as a Leaflet image overlay using either direct geographic bounds
 * or world-file metadata resolved into geographic bounds.
 */
export function GeoreferencedImageOverlay({
  allowApproximateRotation = false,
  bounds,
  fitBounds = false,
  fitBoundsOptions,
  imageSize,
  overlayOptions,
  projectPoint,
  src,
  worldFile,
}: GeoreferencedImageOverlayProps): null {
  const map = useLeafletMap();
  const resolvedBounds = useMemo(
    () =>
      resolveOverlayBounds({
        allowApproximateRotation,
        ...(bounds ? { bounds } : {}),
        ...(imageSize ? { imageSize } : {}),
        ...(projectPoint ? { projectPoint } : {}),
        ...(worldFile ? { worldFile } : {}),
      }),
    [allowApproximateRotation, bounds, imageSize, projectPoint, worldFile],
  );

  useEffect(() => {
    const overlay = imageOverlay(src, resolvedBounds, overlayOptions);
    let mounted = false;
    const cancel = runWhenMapReady(map, () => {
      overlay.addTo(map);
      mounted = true;

      if (fitBounds) {
        map.fitBounds(resolvedBounds, fitBoundsOptions);
      }
    });

    return () => {
      cancel();

      if (mounted) {
        overlay.remove();
      }
    };
  }, [fitBounds, fitBoundsOptions, map, overlayOptions, resolvedBounds, src]);

  return null;
}

function resolveOverlayBounds({
  allowApproximateRotation,
  bounds,
  imageSize,
  projectPoint,
  worldFile,
}: {
  allowApproximateRotation: boolean;
  bounds?: GeoreferencedImageOverlayBounds;
  imageSize?: RasterImageSize;
  projectPoint?: (point: ProjectedPoint) => GeoPointLike;
  worldFile?: string | WorldFileTransform;
}): [[number, number], [number, number]] {
  if (bounds) {
    return normalizeOverlayBounds(bounds);
  }

  if (!worldFile || !imageSize) {
    throw new Error(
      'GeoreferencedImageOverlay requires either `bounds` or both `worldFile` and `imageSize`.',
    );
  }

  const transform = typeof worldFile === 'string' ? parseWorldFile(worldFile) : worldFile;
  const geographicBounds = computeGeographicImageBounds(
    imageSize.width,
    imageSize.height,
    transform,
    {
      allowApproximateRotation,
      ...(projectPoint ? { projectPoint } : {}),
    },
  );

  return normalizeOverlayBounds(geographicBounds);
}

function normalizeOverlayBounds(
  bounds: GeoreferencedImageOverlayBounds,
): [[number, number], [number, number]] {
  if (isTupleBounds(bounds)) {
    return [toLatLngTuple(bounds[0]), toLatLngTuple(bounds[1])];
  }

  const normalizedBounds: GeoBounds = bounds;
  return [
    [normalizedBounds.south, normalizedBounds.west],
    [normalizedBounds.north, normalizedBounds.east],
  ];
}

function isTupleBounds(
  bounds: GeoreferencedImageOverlayBounds,
): bounds is readonly [southWest: GeoPointLike, northEast: GeoPointLike] {
  return Array.isArray(bounds);
}
