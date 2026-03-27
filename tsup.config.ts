import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  entry: {
    index: 'src/index.ts',
    core: 'src/core/index.ts',
    leaflet: 'src/leaflet/index.ts',
    parsers: 'src/parsers/index.ts',
    presets: 'src/presets/index.ts',
    'providers/mapy': 'src/providers/mapy/index.ts',
  },
  external: ['leaflet', 'react', 'react-dom'],
  format: ['esm', 'cjs'],
  loader: {
    '.svg': 'dataurl',
  },
  skipNodeModulesBundle: true,
  sourcemap: true,
  splitting: false,
  target: 'es2022',
  tsconfig: 'tsconfig.build.json',
  treeshake: true,
});
