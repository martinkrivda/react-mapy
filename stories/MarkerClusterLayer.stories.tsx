import type { Meta, StoryObj } from '@storybook/react-vite';
import * as Leaflet from 'leaflet';
import { useState } from 'react';

import { LeafletMap, MarkerClusterLayer } from '../src';
import { StoryFrame } from './StoryFrame';
import { pragueCenter, sampleClusteredEvents } from './demoData';

type LeafletWithMarkerClusterRuntime = typeof Leaflet & {
  markerClusterGroup?: unknown;
};

function hasMarkerClusterPlugin() {
  return typeof (Leaflet as LeafletWithMarkerClusterRuntime).markerClusterGroup === 'function';
}

const meta = {
  component: MarkerClusterLayer,
  parameters: {
    docs: {
      description: {
        component:
          'Cluster repeated event markers with `MarkerClusterLayer`. Host applications must load `leaflet.markercluster` themselves before rendering the layer.',
      },
    },
  },
  tags: ['autodocs'],
  title: 'Leaflet/MarkerClusterLayer',
} satisfies Meta<typeof MarkerClusterLayer>;

export default meta;

type Story = StoryObj<typeof meta>;

function ClusterStoryFallback({ children }: { children: React.ReactNode }) {
  return hasMarkerClusterPlugin() ? (
    <>{children}</>
  ) : (
    <div
      style={{
        alignItems: 'center',
        background: 'linear-gradient(135deg, rgba(15,118,110,0.12), rgba(20,184,166,0.04))',
        border: '1px solid rgba(15,118,110,0.24)',
        borderRadius: 16,
        color: '#134e4a',
        display: 'flex',
        fontSize: 14,
        height: '100%',
        justifyContent: 'center',
        lineHeight: 1.5,
        minHeight: 320,
        padding: 24,
        textAlign: 'center',
      }}
    >
      Import `leaflet.markercluster` and its stylesheet in the Storybook host to preview live
      clusters here.
    </div>
  );
}

export const ClusteredEvents: Story = {
  args: {
    clusterOptions: {
      disableClusteringAtZoom: 17,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
    },
    markers: sampleClusteredEvents,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use this layer when multiple events can share the same coordinates. Each event still keeps its own popup and tooltip, while the plugin merges overlapping markers into clusters until the map is zoomed in enough.',
      },
    },
  },
  render: (args) => (
    <StoryFrame
      note={
        hasMarkerClusterPlugin()
          ? 'The Storybook environment has the markercluster plugin available.'
          : 'This preview environment does not currently load `leaflet.markercluster`. In a host app, import both the plugin and its CSS once before rendering `MarkerClusterLayer`.'
      }
      summary="MarkerClusterLayer is intended for repeated event locations, venue schedules, or any feed where several records can share the same map point."
      title="Cluster repeated event locations"
    >
      <ClusterStoryFallback>
        <LeafletMap center={pragueCenter} zoom={13}>
          <MarkerClusterLayer {...args} />
        </LeafletMap>
      </ClusterStoryFallback>
    </StoryFrame>
  ),
};

function ClusterDashboardStory() {
  const [visibleIds, setVisibleIds] = useState<string[]>([]);

  return (
    <StoryFrame
      note={
        hasMarkerClusterPlugin()
          ? `Currently visible items: ${visibleIds.length}`
          : 'Install the markercluster plugin in Storybook to preview custom cluster icons and visible-item tracking.'
      }
      summary="This example combines `clusterIcon` and `onVisibleItemsChange` so a host app can brand cluster badges and keep a synchronized side panel or result list."
      title="Custom cluster icons with visible items callback"
    >
      <div
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'minmax(0, 1fr)',
        }}
      >
        <div style={{ minHeight: 320 }}>
          <ClusterStoryFallback>
            <LeafletMap center={pragueCenter} zoom={13}>
              <MarkerClusterLayer
                clusterIcon={({ count, markers }) => {
                  const categoryCount = new Set(
                    markers
                      .map((marker) =>
                        'category' in marker && typeof marker.category === 'string'
                          ? marker.category
                          : null,
                      )
                      .filter(Boolean),
                  ).size;

                  return `
                    <div style="align-items:center;background:#0f766e;border:3px solid #ccfbf1;border-radius:999px;color:#f8fafc;display:grid;height:52px;justify-items:center;padding:8px;width:52px;">
                      <strong style="font-size:16px;line-height:1;">${count}</strong>
                      <span style="font-size:10px;line-height:1;">${categoryCount} cats</span>
                    </div>
                  `;
                }}
                markers={sampleClusteredEvents}
                onVisibleItemsChange={(markers) => {
                  setVisibleIds(
                    markers.flatMap((marker) =>
                      typeof marker.id === 'string' ? [marker.id] : [],
                    ),
                  );
                }}
              />
            </LeafletMap>
          </ClusterStoryFallback>
        </div>
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            color: '#0f172a',
            display: 'grid',
            gap: 8,
            padding: 16,
          }}
        >
          <strong style={{ fontSize: 14 }}>Visible event ids</strong>
          <code style={{ color: '#0f766e', fontSize: 13 }}>
            {visibleIds.length > 0 ? visibleIds.join(', ') : 'No visible items yet'}
          </code>
        </div>
      </div>
    </StoryFrame>
  );
}

export const ClusterDashboard: Story = {
  args: {
    markers: sampleClusteredEvents,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example of a feed-oriented map screen where the cluster layer drives both a branded cluster badge and a derived list of currently visible items.',
      },
    },
  },
  render: () => <ClusterDashboardStory />,
};
