import type { Meta, StoryObj } from '@storybook/react';

import { LeafletMap, MapTileLayer } from '../src';
import { createMapyProvider, type MapyVariant } from '../src/providers/mapy';
import { storybookMapyApiKey } from './mapyApiKey';
import { StoryFrame } from './StoryFrame';
import { pragueCenter } from './demoData';

interface MapyStoryProps {
  apiKey: string;
  variant: MapyVariant;
}

interface MapyProxyStoryProps {
  language: string;
  proxyUrlTemplate: string;
  variant: MapyVariant;
}

const recommendedProxyUrlTemplate =
  '/rest/v1/map/tiles/{variant}/{tileSize}/{z}/{x}/{y}?lang={lang}';

function MapyTileLayerStory({ apiKey, variant }: MapyStoryProps) {
  const provider = apiKey ? createMapyProvider({ apiKey, variant }) : undefined;

  return (
    <StoryFrame
      note={
        apiKey
          ? undefined
          : 'Set the `apiKey` control to a valid Mapy.com API key to preview live tiles in Storybook.'
      }
      summary="The tile layer consumes a provider object instead of a hardcoded URL, which keeps the public API stable as additional providers are added."
      title="Mapy.com tile layer"
    >
      <LeafletMap center={pragueCenter} zoom={13}>
        {provider ? <MapTileLayer provider={provider} /> : null}
      </LeafletMap>
    </StoryFrame>
  );
}

function MapyProxyTileLayerStory({
  language,
  proxyUrlTemplate,
  variant,
}: MapyProxyStoryProps) {
  const provider = createMapyProvider({
    ...(language ? { language } : {}),
    proxy: {
      urlTemplate: proxyUrlTemplate,
    },
    variant,
  });

  return (
    <StoryFrame
      note="This story keeps the Mapy.com API key off the frontend. For live preview in local Storybook, expose the same path from your backend or set `STORYBOOK_MAPY_PROXY_TARGET` and restart Storybook."
      note="This story keeps the Mapy.com API key off the frontend. For live preview in local Storybook, expose the same `/rest/v1/map/tiles/*` path from your backend or set `STORYBOOK_MAPY_PROXY_TARGET` and restart Storybook."
      summary="Use the same provider factory in proxy mode when your backend should fetch Mapy.com tiles and inject the private API key server-side."
      title="Mapy.com tile layer via backend proxy"
    >
      <LeafletMap center={pragueCenter} zoom={13}>
        <MapTileLayer provider={provider} />
      </LeafletMap>
    </StoryFrame>
  );
}

const meta = {
  component: MapyTileLayerStory,
  parameters: {
    docs: {
      description: {
        component:
          'The tile layer accepts a provider object, which means you can switch between direct frontend Mapy.com requests and backend-proxied tile delivery without changing the `MapTileLayer` API.',
      },
    },
  },
  tags: ['autodocs'],
  title: 'Leaflet/MapTileLayer',
} satisfies Meta<typeof MapyTileLayerStory>;

export default meta;

type Story = StoryObj<typeof meta>;
type ProxyStory = StoryObj<MapyProxyStoryProps>;

export const MapyProviderExample: Story = {
  args: {
    apiKey: storybookMapyApiKey,
    variant: 'outdoor',
  },
};

export const MapyBackendProxyExample: ProxyStory = {
  args: {
    language: 'en',
    proxyUrlTemplate: recommendedProxyUrlTemplate,
    variant: 'outdoor',
  },
  argTypes: {
    language: {
      control: 'text',
      description: 'Optional language placeholder value injected into the proxy URL template.',
    },
    proxyUrlTemplate: {
      control: 'text',
      description:
        'Frontend-visible backend endpoint. Storybook can proxy `/rest/v1/map/tiles/*` to your real backend when `STORYBOOK_MAPY_PROXY_TARGET` is set.',
    },
    variant: {
      control: 'inline-radio',
      description: 'Mapy tileset variant forwarded to your backend endpoint.',
      options: ['basic', 'outdoor', 'aerial', 'winter', 'names-overlay'],
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Frontend integration for production-safe tile delivery. The browser calls your own endpoint, and your backend attaches the private Mapy.com API key before forwarding the tile response.',
      },
      source: {
        code: `import { LeafletMap, MapTileLayer } from 'react-mapy';
import { createMapyProvider } from 'react-mapy/providers/mapy';

const provider = createMapyProvider({
  language: 'en',
  variant: 'outdoor',
  proxy: {
    urlTemplate: '/rest/v1/map/tiles/{variant}/{tileSize}/{z}/{x}/{y}?lang={lang}',
  },
});

export function ProxiedTilesExample() {
  return (
    <LeafletMap center={{ lat: 50.0755, lng: 14.4378 }} zoom={13} style={{ height: 420 }}>
      <MapTileLayer provider={provider} />
    </LeafletMap>
  );
}`,
      },
    },
  },
  render: (args) => <MapyProxyTileLayerStory {...args} />,
};
