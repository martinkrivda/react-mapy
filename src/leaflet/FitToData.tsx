import type { FitBoundsOptions } from 'leaflet';
import { useEffect } from 'react';

import { computeDataBounds, type FitToDataInput } from '../core';
import { useLeafletMap } from './context';
import { runWhenMapReady } from './lifecycle';

export interface FitToDataProps extends FitToDataInput {
  fitBoundsOptions?: FitBoundsOptions;
}

/**
 * Fits the current map viewport to mixed map data inputs.
 */
export function FitToData({
  bounds,
  fitBoundsOptions,
  geoJson,
  paths,
  points,
}: FitToDataProps): null {
  const map = useLeafletMap();

  useEffect(() => {
    const nextBounds = computeDataBounds({
      ...(bounds ? { bounds } : {}),
      ...(geoJson ? { geoJson } : {}),
      ...(paths ? { paths } : {}),
      ...(points ? { points } : {}),
    });

    if (!nextBounds) {
      return;
    }

    return runWhenMapReady(map, () => {
      map.fitBounds(
        [
          [nextBounds.south, nextBounds.west],
          [nextBounds.north, nextBounds.east],
        ],
        fitBoundsOptions,
      );
    });
  }, [bounds, fitBoundsOptions, geoJson, map, paths, points]);

  return null;
}
