import type { Meta, StoryObj } from '@storybook/react-vite';

import { GeoreferencedImageOverlay, LeafletMap, MapTileLayer } from '../src';
import { createMapyProvider } from '../src/providers/mapy';
import { pragueCenter } from './demoData';
import { storybookMapyApiKey } from './mapyApiKey';
import { StoryFrame } from './StoryFrame';

const imageWidth = 400;
const imageHeight = 240;
const west = 14.418;
const north = 50.0832;
const scaleX = 0.00008;
const scaleY = -0.00006;
const originX = west + scaleX / 2;
const originY = north + scaleY / 2;
const worldFile = [scaleX, 0, 0, scaleY, originX, originY].join('\n');

const overlaySvg = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${imageWidth} ${imageHeight}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#dc2626" stop-opacity="0.18" />
        <stop offset="100%" stop-color="#0f766e" stop-opacity="0.18" />
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0f172a" stroke-opacity="0.18" stroke-width="1" />
      </pattern>
    </defs>
    <rect width="${imageWidth}" height="${imageHeight}" fill="url(#bg)" />
    <rect width="${imageWidth}" height="${imageHeight}" fill="url(#grid)" />
    <rect x="20" y="20" width="${imageWidth - 40}" height="${imageHeight - 40}" rx="18" fill="#ffffff" fill-opacity="0.38" stroke="#0f172a" stroke-opacity="0.35" stroke-width="2" />
    <text x="50%" y="48%" text-anchor="middle" font-size="28" font-family="ui-sans-serif, system-ui, sans-serif" font-weight="700" fill="#0f172a">World file overlay</text>
    <text x="50%" y="62%" text-anchor="middle" font-size="16" font-family="ui-sans-serif, system-ui, sans-serif" fill="#334155">JPG/PNG + pgw/jgw/tfw workflow</text>
  </svg>
`);

const overlaySrc = `data:image/svg+xml;charset=utf-8,${overlaySvg}`;

interface GeoreferencedImageOverlayStoryProps {
  apiKey: string;
  opacity: number;
}

function GeoreferencedImageOverlayStory({ apiKey, opacity }: GeoreferencedImageOverlayStoryProps) {
  const provider = apiKey ? createMapyProvider({ apiKey, variant: 'basic' }) : undefined;

  return (
    <StoryFrame
      note="This example uses a browser-friendly SVG raster plus a six-line world file. GeoTIFFs are not decoded directly by the library runtime."
      summary="GeoreferencedImageOverlay lets you place a raster image above the map using either direct geographic bounds or image plus world-file metadata."
      title="Georeferenced image overlay"
    >
      <LeafletMap center={pragueCenter} zoom={14}>
        {provider ? <MapTileLayer provider={provider} /> : null}
        <GeoreferencedImageOverlay
          imageSize={{ height: imageHeight, width: imageWidth }}
          overlayOptions={{ opacity }}
          src={overlaySrc}
          worldFile={worldFile}
        />
      </LeafletMap>
    </StoryFrame>
  );
}

const meta = {
  component: GeoreferencedImageOverlayStory,
  tags: ['autodocs'],
  title: 'Leaflet/GeoreferencedImageOverlay',
} satisfies Meta<typeof GeoreferencedImageOverlayStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WorldFileOverlay: Story = {
  args: {
    apiKey: storybookMapyApiKey,
    opacity: 0.72,
  },
};
