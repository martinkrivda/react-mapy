import type { Meta, StoryObj } from '@storybook/react-vite';

import { GpxTrackLayer, LeafletMap } from '../src';
import { StoryFrame } from './StoryFrame';
import { pragueCenter, sampleTrack } from './demoData';

const meta = {
  component: GpxTrackLayer,
  tags: ['autodocs'],
  title: 'Presets/GpxTrackLayer',
} satisfies Meta<typeof GpxTrackLayer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PaceHighlightedTrack: Story = {
  args: {
    track: sampleTrack,
    weight: 6,
  },
  render: (args) => (
    <StoryFrame
      summary="The GPX preset renders parsed track data, colors each segment by computed pace, and shows a small pace legend badge in the map corner, while keeping GPX parsing itself completely independent of React."
      title="Pace-highlighted GPX track"
    >
      <LeafletMap center={pragueCenter} zoom={13}>
        <GpxTrackLayer {...args} />
      </LeafletMap>
    </StoryFrame>
  ),
};
