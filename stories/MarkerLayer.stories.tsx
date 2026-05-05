import type { Meta, StoryObj } from '@storybook/react-vite';

import { LeafletMap, MarkerLayer } from '../src';
import { StoryFrame } from './StoryFrame';
import { pragueCenter } from './demoData';

function PinIcon({ height = 36, width = 36 }: { height?: number; size?: number; width?: number }) {
  return (
    <svg
      fill="none"
      height={height}
      viewBox="0 0 36 36"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18 33c6.5-8.2 9.8-13.8 9.8-18A9.8 9.8 0 1 0 8.2 15c0 4.2 3.3 9.8 9.8 18Z"
        fill="#0f766e"
      />
      <circle cx="18" cy="15" fill="#f8fafc" r="5.2" />
    </svg>
  );
}

const meta = {
  component: MarkerLayer,
  tags: ['autodocs'],
  title: 'Leaflet/MarkerLayer',
} satisfies Meta<typeof MarkerLayer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const MarkerExample: Story = {
  args: {
    popupText: 'A single marker can be composed with any tile layer or overlay.',
    position: pragueCenter,
    tooltipText: 'Prague',
  },
  render: (args) => (
    <StoryFrame
      summary="MarkerLayer stays intentionally small: one marker, optional popup/tooltip text, and Leaflet marker options."
      title="Single marker layer"
    >
      <LeafletMap center={pragueCenter} zoom={13}>
        <MarkerLayer {...args} />
      </LeafletMap>
    </StoryFrame>
  ),
};

export const CustomSvgMarker: Story = {
  args: {
    customIcon: {
      component: PinIcon,
      size: [36, 36],
    },
    popupText: 'Custom marker content can come from React-rendered SVG.',
    position: pragueCenter,
    tooltipText: 'Custom icon',
  },
  render: (args) => (
    <StoryFrame
      summary="MarkerLayer can render custom SVG markers from inline React content or any icon component, including Lucide-style components that accept width, height, or size props."
      title="Custom SVG marker"
    >
      <LeafletMap center={pragueCenter} zoom={13}>
        <MarkerLayer {...args} />
      </LeafletMap>
    </StoryFrame>
  ),
};

export const OfeedPresetMarker: Story = {
  args: {
    customIcon: {
      colorScheme: 'light',
      preset: 'ofeed',
      size: [40, 60],
    },
    popupText: 'Built-in ofeed preset marker.',
    position: pragueCenter,
    tooltipText: 'ofeed',
  },
  render: (args) => (
    <StoryFrame
      summary="MarkerLayer also ships with preset brand markers. Use `customIcon.preset` when you want a consistent built-in marker variant without copying SVG markup into the host app."
      title="ofeed preset marker"
    >
      <LeafletMap center={pragueCenter} zoom={13}>
        <MarkerLayer {...args} />
      </LeafletMap>
    </StoryFrame>
  ),
};

export const OfeedPresetMarkerDark: Story = {
  args: {
    customIcon: {
      colorScheme: 'dark',
      preset: 'ofeed',
      size: [40, 60],
    },
    popupText: 'Built-in ofeed preset marker for dark map surfaces.',
    position: pragueCenter,
    tooltipText: 'ofeed dark',
  },
  render: (args) => (
    <StoryFrame
      summary="Preset markers can also select a dark color scheme, which is useful when the host application renders the map in a dark presentation theme."
      title="ofeed preset marker for dark mode"
    >
      <LeafletMap center={pragueCenter} theme="dark" zoom={13}>
        <MarkerLayer {...args} />
      </LeafletMap>
    </StoryFrame>
  ),
};

export const ResponsiveOfeedMarker: Story = {
  args: {
    customIcon: {
      colorScheme: 'light',
      preset: 'ofeed',
      size: (zoom) => (zoom >= 15 ? [40, 60] : [24, 36]),
    },
    popupText: 'The marker grows as you zoom in.',
    position: pragueCenter,
    tooltipText: 'responsive ofeed',
  },
  render: (args) => (
    <StoryFrame
      note="This is useful for branded markers that look too dominant on overview zoom levels but should stay legible when the user zooms in."
      summary="`customIcon.size` can now be a function of the current map zoom. Use this for responsive marker sizing without wiring your own map event listeners."
      title="Responsive marker size by zoom"
    >
      <LeafletMap center={pragueCenter} zoom={13}>
        <MarkerLayer {...args} />
      </LeafletMap>
    </StoryFrame>
  ),
};

export const ReactPopupContent: Story = {
  args: {
    customIcon: {
      component: PinIcon,
      size: [36, 36],
    },
    popupContent: (
      <div
        style={{
          display: 'grid',
          gap: 6,
          minWidth: 180,
        }}
      >
        <strong style={{ fontSize: 15 }}>Prague city center</strong>
        <span style={{ color: '#475569', fontSize: 13 }}>
          Static React markup rendered into the Leaflet popup.
        </span>
        <span
          style={{
            background: '#ccfbf1',
            borderRadius: 999,
            color: '#115e59',
            display: 'inline-block',
            fontSize: 12,
            fontWeight: 600,
            padding: '4px 8px',
            width: 'fit-content',
          }}
        >
          Open now
        </span>
      </div>
    ),
    position: pragueCenter,
    tooltipContent: <span style={{ fontWeight: 600 }}>React tooltip content</span>,
  },
  render: (args) => (
    <StoryFrame
      note="The popup content is rendered as static markup, so this is ideal for presentational content and summaries."
      summary="`popupContent` and `tooltipContent` accept `ReactNode`, which makes it easier to ship richer content without pushing popup composition into host-app string templates."
      title="React popup and tooltip content"
    >
      <LeafletMap center={pragueCenter} zoom={13}>
        <MarkerLayer {...args} />
      </LeafletMap>
    </StoryFrame>
  ),
};
