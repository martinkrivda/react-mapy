import type { Meta, StoryObj } from '@storybook/react';

import { LeafletMap, PolylineLayer } from '../src';
import { StoryFrame } from './StoryFrame';
import { polylinePath, pragueCenter } from './demoData';

const meta = {
  component: PolylineLayer,
  tags: ['autodocs'],
  title: 'Leaflet/PolylineLayer',
} satisfies Meta<typeof PolylineLayer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PolylineExample: Story = {
  args: {
    coordinates: polylinePath,
    pathOptions: {
      color: '#0f766e',
      dashArray: '10 8',
      opacity: 0.85,
      weight: 4,
    },
  },
  render: (args) => (
    <StoryFrame
      summary="PolylineLayer handles low-level route overlays without carrying any GPX or business-domain assumptions."
      title="Polyline route"
    >
      <LeafletMap center={pragueCenter} zoom={13}>
        <PolylineLayer {...args} />
      </LeafletMap>
    </StoryFrame>
  ),
};
