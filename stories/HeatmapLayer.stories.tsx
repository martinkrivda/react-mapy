import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  HeatmapLayer,
  LeafletMap,
  MapTileLayer,
  MarkerLayer,
  StreamTrackLayer,
} from '../src';
import { createMapyProvider } from '../src/providers/mapy';
import {
  historicalEventHeatmapPoints,
  historicalTrackHeatmapPoints,
  pragueCenter,
  sampleStreamPoints,
} from './demoData';
import { storybookMapyApiKey } from './mapyApiKey';
import { StoryFrame } from './StoryFrame';

interface HeatmapStoryProps {
  apiKey: string;
}

function EventHeatmapStory({ apiKey }: HeatmapStoryProps) {
  const provider = apiKey ? createMapyProvider({ apiKey, variant: 'basic' }) : undefined;

  return (
    <StoryFrame
      note="Repeated historical event points naturally build up a darker continuous area while isolated locations stay as lighter spots."
      summary="Use HeatmapLayer below your current event marker to show where similar actions historically concentrated."
      title="Historical event heatmap"
    >
      <LeafletMap center={pragueCenter} zoom={13}>
        {provider ? <MapTileLayer provider={provider} /> : null}
        <HeatmapLayer points={historicalEventHeatmapPoints} radius={28} />
        <MarkerLayer popupText="Current event" position={pragueCenter} tooltipText="Current event" />
      </LeafletMap>
    </StoryFrame>
  );
}

function TrackHeatmapStory({ apiKey }: HeatmapStoryProps) {
  const provider = apiKey ? createMapyProvider({ apiKey, variant: 'basic' }) : undefined;

  return (
    <StoryFrame
      note="The current stream track stays as a fully readable polyline while the historical routes underneath collapse into a continuous path-density heat layer."
      summary="Flatten historical route archives into heatmap points and render the live or current stream polyline above them."
      title="Historical route heatmap"
    >
      <LeafletMap center={pragueCenter} zoom={13}>
        {provider ? <MapTileLayer provider={provider} /> : null}
        <HeatmapLayer points={historicalTrackHeatmapPoints} radius={22} />
        <StreamTrackLayer
          colorMode="speed"
          points={sampleStreamPoints}
          showLegend={false}
          smooth={{ alpha: 0.25, samplesPerSeg: 6 }}
          speedDomain={{ maxKmh: 20, minKmh: 5 }}
          weight={6}
        />
      </LeafletMap>
    </StoryFrame>
  );
}

const meta = {
  component: EventHeatmapStory,
  tags: ['autodocs'],
  title: 'Leaflet/HeatmapLayer',
} satisfies Meta<typeof EventHeatmapStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EventDensity: Story = {
  args: {
    apiKey: storybookMapyApiKey,
  } satisfies HeatmapStoryProps,
  render: (args) => <EventHeatmapStory apiKey={args.apiKey} />,
};

export const HistoricalTracks: Story = {
  args: {
    apiKey: storybookMapyApiKey,
  } satisfies HeatmapStoryProps,
  render: (args) => <TrackHeatmapStory apiKey={args.apiKey} />,
};
