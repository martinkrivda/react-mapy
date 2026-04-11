import type { Meta, StoryObj } from '@storybook/react-vite';

import { LeafletMap, StreamTrackLayer } from '../src';
import { StoryFrame } from './StoryFrame';
import { pragueCenter, sampleStreamPoints } from './demoData';

const meta = {
  component: StreamTrackLayer,
  tags: ['autodocs'],
  title: 'Presets/StreamTrackLayer',
} satisfies Meta<typeof StreamTrackLayer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const StreamSpeedExample: Story = {
  args: {
    colorMode: 'speed',
    points: sampleStreamPoints,
    smooth: { alpha: 0.25, samplesPerSeg: 6 },
    speedDomain: { maxKmh: 20, minKmh: 5 },
    weight: 6,
  },
  render: (args) => (
    <StoryFrame
      summary="The speed preset accepts stream points, optionally smooths the track geometry, colors each rendered segment on a red-yellow-green speed ramp, and shows a small legend badge in the map corner."
      title="Speed-colored stream track"
    >
      <LeafletMap center={pragueCenter} zoom={13}>
        <StreamTrackLayer {...args} />
      </LeafletMap>
    </StoryFrame>
  ),
};

export const StreamElevationExample: Story = {
  args: {
    colorMode: 'elevation',
    elevationDomain: { maxMeters: 260, minMeters: 180 },
    points: sampleStreamPoints,
    smooth: { alpha: 0.25, samplesPerSeg: 6 },
    weight: 6,
  },
  render: (args) => (
    <StoryFrame
      summary="The same stream preset can color the rendered route by elevation when stream points include elevation values, with a red-to-brown legend badge explaining the current scale."
      title="Elevation-colored stream track"
    >
      <LeafletMap center={pragueCenter} zoom={13}>
        <StreamTrackLayer {...args} />
      </LeafletMap>
    </StoryFrame>
  ),
};

export const StreamHeartRateExample: Story = {
  args: {
    colorMode: 'heart-rate',
    heartRateDomain: { maxBpm: 180, minBpm: 120 },
    points: sampleStreamPoints,
    smooth: { alpha: 0.25, samplesPerSeg: 6 },
    weight: 6,
  },
  render: (args) => (
    <StoryFrame
      summary="Heart-rate mode colors the route with red shades only, where the darkest segment corresponds to the highest heart rate, and the corner badge shows the active bpm range."
      title="Heart-rate-colored stream track"
    >
      <LeafletMap center={pragueCenter} zoom={13}>
        <StreamTrackLayer {...args} />
      </LeafletMap>
    </StoryFrame>
  ),
};
