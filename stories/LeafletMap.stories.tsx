import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  FitToData,
  LeafletMap,
  MarkerLayer,
  MapTileLayer,
  type MapTheme,
  type MapThemePreset,
} from '../src';
import { createMapyProvider } from '../src/providers/mapy';
import { polylinePath, pragueCenter, sampleClusteredEvents, sampleGeoJson } from './demoData';
import { storybookMapyApiKey } from './mapyApiKey';
import { StoryFrame } from './StoryFrame';

const presetThemes = [
  'mapy',
  'dark',
  'neutral',
  'mapbox',
] as const satisfies readonly MapThemePreset[];

interface PresetThemeStoryProps {
  apiKey: string;
  theme: MapThemePreset;
}

function getThemeSummary(theme: MapThemePreset): string {
  switch (theme) {
    case 'dark':
      return 'Dark keeps the same provider tiles but inverts and tones them for low-light dashboards and night-oriented map views.';
    case 'mapbox':
      return 'Mapbox is a mapbox-inspired presentation theme with cooler surfaces and restrained raster filtering, while still rendering the current provider tiles.';
    case 'neutral':
      return 'Neutral follows a shadcn-like grayscale surface language with soft borders and restrained map treatment for admin or internal tooling UIs.';
    case 'mapy':
      return 'Mapy is the default presentation theme and stays closest to the native Mapy.com visual language.';
  }
}

function getThemeNote(apiKey: string, theme: MapThemePreset): string {
  if (!apiKey) {
    return 'Set the `apiKey` control to a valid Mapy.com API key to preview live tiles in Storybook.';
  }

  if (theme === 'mapbox') {
    return 'This is a mapbox-inspired presentation theme over the same tile provider, not a real Mapbox basemap.';
  }

  return 'Themes style the Leaflet UI and raster tile presentation layer. They do not replace the underlying provider.';
}

function getThemeTitle(theme: MapThemePreset): string {
  switch (theme) {
    case 'dark':
      return 'Dark theme';
    case 'mapbox':
      return 'Mapbox-inspired theme';
    case 'neutral':
      return 'Neutral theme';
    case 'mapy':
      return 'Mapy theme';
  }
}

function PresetThemeMapStory({ apiKey, theme }: PresetThemeStoryProps) {
  const provider = apiKey ? createMapyProvider({ apiKey, variant: 'basic' }) : undefined;

  return (
    <StoryFrame
      note={getThemeNote(apiKey, theme)}
      summary={getThemeSummary(theme)}
      title={getThemeTitle(theme)}
    >
      <LeafletMap center={pragueCenter} theme={theme} zoom={13}>
        {provider ? <MapTileLayer provider={provider} /> : null}
        <MarkerLayer popupText="Prague city center" position={pragueCenter} tooltipText="Praha" />
      </LeafletMap>
    </StoryFrame>
  );
}

interface CustomThemeStoryProps {
  apiKey: string;
  theme: MapTheme;
}

function CustomThemeMapStory({ apiKey, theme }: CustomThemeStoryProps) {
  const provider = apiKey ? createMapyProvider({ apiKey, variant: 'basic' }) : undefined;

  return (
    <StoryFrame
      note="Custom themes extend a preset rather than introducing a separate tile provider contract."
      summary="You can start from `neutral`, `dark`, `mapy`, or `mapbox` and override only the surface or tile values you actually want to change."
      title="Custom theme extension"
    >
      <LeafletMap center={pragueCenter} theme={theme} zoom={13}>
        {provider ? <MapTileLayer provider={provider} /> : null}
        <MarkerLayer popupText="Prague city center" position={pragueCenter} tooltipText="Praha" />
      </LeafletMap>
    </StoryFrame>
  );
}

const meta = {
  component: LeafletMap,
  parameters: {
    docs: {
      description: {
        component:
          'The root map wrapper owns the Leaflet instance and provides context for nested layers. It also accepts built-in presentation themes: `mapy`, `dark`, `neutral`, and `mapbox`, plus custom theme override objects.',
      },
    },
  },
  tags: ['autodocs'],
  title: 'Leaflet/LeafletMap',
} satisfies Meta<typeof LeafletMap>;

export default meta;

type Story = StoryObj<typeof meta>;
type PresetThemeStory = StoryObj<PresetThemeStoryProps>;
type CustomThemeStory = StoryObj<CustomThemeStoryProps>;

export const BasicMap: Story = {
  args: {
    center: pragueCenter,
    zoom: 13,
  },
  render: (args) => (
    <StoryFrame
      summary="A minimal map wrapper with no required styling framework and no tile-source assumptions."
      title="Basic map shell"
    >
      <LeafletMap {...args}>
        <MarkerLayer popupText="Prague city center" position={pragueCenter} tooltipText="Praha" />
      </LeafletMap>
    </StoryFrame>
  ),
};

export const ThemePlayground: PresetThemeStory = {
  args: {
    apiKey: storybookMapyApiKey,
    theme: 'mapy',
  },
  argTypes: {
    apiKey: {
      control: 'text',
      description: 'Mapy.com API key used for live tile preview.',
    },
    theme: {
      control: 'inline-radio',
      description: 'Built-in theme preset for the Leaflet surface and raster tile treatment.',
      options: presetThemes,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive playground for the built-in theme presets. Use this when you want to compare `mapy`, `dark`, `neutral`, and `mapbox` on the same map composition.',
      },
    },
  },
  render: (args) => <PresetThemeMapStory {...args} />,
};

export const MapyTheme: PresetThemeStory = {
  args: {
    apiKey: storybookMapyApiKey,
    theme: 'mapy',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Default preset. Closest to the native Mapy.com feel and the recommended baseline for Mapy-backed applications.',
      },
    },
  },
  render: (args) => <PresetThemeMapStory {...args} />,
};

export const DarkTheme: PresetThemeStory = {
  args: {
    apiKey: storybookMapyApiKey,
    theme: 'dark',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Dark preset for low-light surfaces. Useful for dark dashboards or applications where the map should visually recede into a darker shell.',
      },
    },
  },
  render: (args) => <PresetThemeMapStory {...args} />,
};

export const NeutralTheme: PresetThemeStory = {
  args: {
    apiKey: storybookMapyApiKey,
    theme: 'neutral',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Neutral preset inspired by grayscale admin surfaces. Good fit for shadcn-like dashboards and internal tools where the map should feel quieter.',
      },
    },
  },
  render: (args) => <PresetThemeMapStory {...args} />,
};

export const MapboxTheme: PresetThemeStory = {
  args: {
    apiKey: storybookMapyApiKey,
    theme: 'mapbox',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Mapbox-inspired preset. It aims for a cooler, more productized feel while still rendering the currently selected tile provider rather than switching to Mapbox tiles.',
      },
    },
  },
  render: (args) => <PresetThemeMapStory {...args} />,
};

export const CustomThemeExtension: CustomThemeStory = {
  args: {
    apiKey: storybookMapyApiKey,
    theme: {
      accentColor: '#18181b',
      controlBorderColor: '#a1a1aa',
      extends: 'neutral',
      id: 'neutral-zinc',
      tileFilter: 'grayscale(0.18) saturate(0.8) contrast(0.96)',
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example of extending a built-in preset instead of starting from scratch. This keeps the API small while still allowing branded surface adjustments.',
      },
    },
  },
  render: (args) => <CustomThemeMapStory {...args} />,
};

export const FitToDataController: Story = {
  args: {
    center: pragueCenter,
    zoom: 13,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use `FitToData` when the host screen combines markers, paths, and GeoJSON overlays and you want one explicit viewport controller rather than repeating `fitBounds` behavior inside every layer.',
      },
    },
  },
  render: (args) => (
    <StoryFrame
      note="This example merges explicit points, a path, and GeoJSON into one viewport decision."
      summary="`FitToData` is a small controller component that computes merged bounds from mixed data sources and applies a single `map.fitBounds(...)` call."
      title="Fit viewport to mixed map data"
    >
      <LeafletMap {...args}>
        <FitToData
          fitBoundsOptions={{ padding: [28, 28] }}
          geoJson={sampleGeoJson}
          paths={[polylinePath]}
          points={sampleClusteredEvents.map((event) => event.position)}
        />
        {sampleClusteredEvents.slice(0, 3).map((event) => (
          <MarkerLayer
            key={event.id}
            popupText={event.popupText}
            position={event.position}
            tooltipText={event.tooltipText}
          />
        ))}
      </LeafletMap>
    </StoryFrame>
  ),
};
