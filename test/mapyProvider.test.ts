import { describe, expect, it } from 'vitest';

import { createMapyProvider, mapyProvider } from '../src/providers/mapy';

describe('createMapyProvider', () => {
  it('builds typed provider metadata and URLs', () => {
    const provider = createMapyProvider({
      apiKey: 'demo-key',
      language: 'en',
      retina: true,
      variant: 'basic',
    });

    expect(provider.id).toBe('mapy');
    expect(provider.capabilities.supportedVariants).toContain('outdoor');
    expect(provider.urlTemplate).toContain('/basic/256/{z}/{x}/{y}');
    expect(provider.urlTemplate).toContain('apikey=demo-key');
    expect(provider.urlTemplate).toContain('lang=en');
    expect(provider.branding).toMatchObject({
      href: 'https://mapy.com/',
      imageUrl: 'https://api.mapy.com/img/api/logo.svg',
      minHeight: 30,
      position: 'bottomleft',
    });
    expect(provider.buildTileUrl({ x: 5, y: 10, z: 12 })).toContain('/12/5/10');
    expect(provider.getLayerConfig()).toMatchObject({
      detectRetina: true,
      maxZoom: 19,
      minZoom: 0,
      tileSize: 256,
    });
  });

  it('exports a default outdoor provider instance', () => {
    expect(mapyProvider.config.variant).toBe('outdoor');
    expect(mapyProvider.attribution).toContain('Seznam.cz a.s. a další');
  });

  it('supports proxied tile URLs for backend delivery', () => {
    const provider = createMapyProvider({
      language: 'cs',
      proxy: {
        query: {
          source: 'storybook',
        },
        urlTemplate: '/api/mapy/tiles/{variant}/{tileSize}/{z}/{x}/{y}?lang={lang}',
      },
      variant: 'outdoor',
    });

    expect(provider.urlTemplate).toBe(
      '/api/mapy/tiles/outdoor/256/{z}/{x}/{y}?lang=cs&source=storybook',
    );
    expect(provider.buildTileUrl({ x: 8956, y: 5513, z: 14 })).toBe(
      '/api/mapy/tiles/outdoor/256/14/8956/5513?lang=cs&source=storybook',
    );
    expect(provider.urlTemplate).not.toContain('apikey=');
  });
});
