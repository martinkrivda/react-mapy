import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

function fromWorkspace(relativePath: string): string {
  return fileURLToPath(new URL(relativePath, import.meta.url));
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^react-mapy\/providers\/mapy$/,
        replacement: fromWorkspace('./src/providers/mapy/index.ts'),
      },
      {
        find: /^react-mapy\/parsers$/,
        replacement: fromWorkspace('./src/parsers/index.ts'),
      },
      {
        find: /^react-mapy\/presets$/,
        replacement: fromWorkspace('./src/presets/index.ts'),
      },
      {
        find: /^react-mapy\/leaflet$/,
        replacement: fromWorkspace('./src/leaflet/index.ts'),
      },
      {
        find: /^react-mapy\/core$/,
        replacement: fromWorkspace('./src/core/index.ts'),
      },
      {
        find: /^react-mapy$/,
        replacement: fromWorkspace('./src/index.ts'),
      },
    ],
  },
  root: fromWorkspace('./playground'),
});
