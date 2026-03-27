import type { Preview } from '@storybook/react';

import 'leaflet/dist/leaflet.css';
import '../stories/storybook.css';

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
