import type { Preview } from '@storybook/react-vite';

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { loadLeafletMarkerCluster } from '../src';
import '../stories/storybook.css';

await loadLeafletMarkerCluster();

const preview: Preview = {
  parameters: {
    controls: {
      expanded: true,
    },
    docs: {
      toc: true,
    },
    layout: 'fullscreen',
  },
};

export default preview;
