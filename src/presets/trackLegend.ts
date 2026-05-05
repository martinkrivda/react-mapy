import {
  Control,
  DomEvent,
  DomUtil,
  type ControlPosition,
  type Map as LeafletMapInstance,
} from 'leaflet';

import {
  DEFAULT_PACE_COLOR_STOPS,
  elevationToColor,
  heartRateToColor,
  speedToColor,
  type ElevationColorOptions,
  type HeartRateColorOptions,
  type PaceColorStop,
  type SpeedColorOptions,
} from '../core';

type TrackLegendMode = 'elevation' | 'heart-rate' | 'pace' | 'speed';

interface TrackLegendBadge {
  gradient: string;
  label: string;
  rangeLabel: string;
}

interface TrackLegendControlOptions {
  position?: ControlPosition;
}

interface TrackLegendDescriptorOptions {
  elevationDomain?: Pick<ElevationColorOptions, 'maxMeters' | 'minMeters'>;
  heartRateDomain?: Pick<HeartRateColorOptions, 'maxBpm' | 'minBpm'>;
  mode: TrackLegendMode;
  paceColorStops?: readonly PaceColorStop[];
  speedDomain?: Pick<SpeedColorOptions, 'maxKmh' | 'minKmh'>;
}

export function createTrackLegendBadge({
  elevationDomain,
  heartRateDomain,
  mode,
  paceColorStops,
  speedDomain,
}: TrackLegendDescriptorOptions): TrackLegendBadge {
  switch (mode) {
    case 'elevation': {
      const minMeters = elevationDomain?.minMeters ?? 0;
      const maxMeters = elevationDomain?.maxMeters ?? 1_500;
      const midMeters = (minMeters + maxMeters) / 2;

      return {
        gradient: toLinearGradient([
          elevationToColor(minMeters, { maxMeters, minMeters }),
          elevationToColor(midMeters, { maxMeters, minMeters }),
          elevationToColor(maxMeters, { maxMeters, minMeters }),
        ]),
        label: 'Elevation',
        rangeLabel: `${formatLegendValue(minMeters)} -> ${formatLegendValue(maxMeters)} m`,
      };
    }
    case 'heart-rate': {
      const minBpm = heartRateDomain?.minBpm ?? 90;
      const maxBpm = heartRateDomain?.maxBpm ?? 190;
      const midBpm = (minBpm + maxBpm) / 2;

      return {
        gradient: toLinearGradient([
          heartRateToColor(minBpm, { maxBpm, minBpm }),
          heartRateToColor(midBpm, { maxBpm, minBpm }),
          heartRateToColor(maxBpm, { maxBpm, minBpm }),
        ]),
        label: 'Heart rate',
        rangeLabel: `${formatLegendValue(minBpm)} -> ${formatLegendValue(maxBpm)} bpm`,
      };
    }
    case 'pace': {
      const resolvedPaceColorStops =
        paceColorStops && paceColorStops.length > 0 ? paceColorStops : DEFAULT_PACE_COLOR_STOPS;

      return {
        gradient: toLinearGradient(resolvedPaceColorStops.map((stop) => stop.color)),
        label: 'Pace',
        rangeLabel: formatPaceLegendRange(resolvedPaceColorStops),
      };
    }
    case 'speed':
    default: {
      const minKmh = speedDomain?.minKmh ?? 5;
      const maxKmh = speedDomain?.maxKmh ?? 20;
      const midKmh = (minKmh + maxKmh) / 2;

      return {
        gradient: toLinearGradient([
          speedToColor(minKmh, { maxKmh, minKmh }),
          speedToColor(midKmh, { maxKmh, minKmh }),
          speedToColor(maxKmh, { maxKmh, minKmh }),
        ]),
        label: 'Speed',
        rangeLabel: `${formatLegendValue(minKmh)} -> ${formatLegendValue(maxKmh)} km/h`,
      };
    }
  }
}

export function retainTrackLegendBadge(
  map: LeafletMapInstance,
  badge: TrackLegendBadge,
  options: TrackLegendControlOptions = {},
): () => void {
  const control = new Control({
    position: options.position ?? 'topright',
  });

  control.onAdd = () => {
    const container = DomUtil.create('div', 'react-mapy-track-legend');
    const label = DomUtil.create('div', 'react-mapy-track-legend__label', container);
    const scale = DomUtil.create('div', 'react-mapy-track-legend__scale', container);
    const range = DomUtil.create('div', 'react-mapy-track-legend__range', container);

    label.textContent = badge.label;
    scale.style.background = badge.gradient;
    range.textContent = badge.rangeLabel;

    DomEvent.disableClickPropagation(container);
    DomEvent.disableScrollPropagation(container);

    return container;
  };

  control.addTo(map);

  return () => {
    control.remove();
  };
}

function formatLegendValue(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatPaceLegendRange(colorStops: readonly PaceColorStop[]): string {
  const firstFiniteStop = colorStops.find((stop) => Number.isFinite(stop.upToSecondsPerKilometer));
  const finiteStops = colorStops.filter((stop) => Number.isFinite(stop.upToSecondsPerKilometer));
  const lastFiniteStop = finiteStops[finiteStops.length - 1];

  if (!firstFiniteStop || !lastFiniteStop) {
    return 'Fast -> slow';
  }

  return `${formatPace(firstFiniteStop.upToSecondsPerKilometer)} /km -> ${formatPace(lastFiniteStop.upToSecondsPerKilometer)}+ /km`;
}

function formatPace(secondsPerKilometer: number): string {
  const safeSeconds = Math.max(0, Math.round(secondsPerKilometer));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function toLinearGradient(colors: readonly string[]): string {
  return `linear-gradient(90deg, ${colors
    .map((color, index) => {
      const stop = colors.length === 1 ? 0 : Math.round((index / (colors.length - 1)) * 100);
      return `${color} ${stop}%`;
    })
    .join(', ')})`;
}
