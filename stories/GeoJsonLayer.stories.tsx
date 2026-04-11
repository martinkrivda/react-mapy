import type { Meta, StoryObj } from '@storybook/react-vite';

import { GeoJsonLayer, LeafletMap } from '../src';
import { StoryFrame } from './StoryFrame';
import { pragueCenter, sampleGeoJson } from './demoData';

const meta = {
  component: GeoJsonLayer,
  tags: ['autodocs'],
  title: 'Leaflet/GeoJsonLayer',
} satisfies Meta<typeof GeoJsonLayer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const GeoJsonExample: Story = {
  args: {
    data: sampleGeoJson,
    layerOptions: {
      style: () => ({
        color: '#2563eb',
        opacity: 0.9,
        weight: 5,
      }),
    },
  },
  render: (args) => (
    <StoryFrame
      summary="GeoJsonLayer keeps raw GeoJSON rendering separate from higher-level presets, which makes it useful for overlays, diagnostics, and editing tooling."
      title="GeoJSON overlay"
    >
      <LeafletMap center={pragueCenter} zoom={13}>
        <GeoJsonLayer {...args} />
      </LeafletMap>
    </StoryFrame>
  ),
};
