import {
  Control,
  DomEvent,
  DomUtil,
  type Map as LeafletMapInstance,
} from 'leaflet';

import type { TileProvider, TileProviderBranding } from '../core/providers';

interface BrandingEntry {
  control: Control;
  refCount: number;
}

const brandingRegistry = new WeakMap<LeafletMapInstance, Map<string, BrandingEntry>>();

/**
 * Adds provider-required branding to a map and reference-counts it across layers.
 */
export function retainProviderBranding(
  map: LeafletMapInstance,
  provider: TileProvider,
): () => void {
  if (!provider.branding) {
    return () => {};
  }

  const entries = getBrandingEntries(map);
  const key = getBrandingKey(provider);
  let entry = entries.get(key);

  if (!entry) {
    const brandingControl = createBrandingControl(provider.branding);
    brandingControl.addTo(map);
    entry = {
      control: brandingControl,
      refCount: 0,
    };
    entries.set(key, entry);
  }

  entry.refCount += 1;

  return () => {
    const currentEntry = entries.get(key);

    if (!currentEntry) {
      return;
    }

    currentEntry.refCount -= 1;

    if (currentEntry.refCount <= 0) {
      currentEntry.control.remove();
      entries.delete(key);
    }

    if (entries.size === 0) {
      brandingRegistry.delete(map);
    }
  };
}

function getBrandingEntries(map: LeafletMapInstance): Map<string, BrandingEntry> {
  const existingEntries = brandingRegistry.get(map);

  if (existingEntries) {
    return existingEntries;
  }

  const nextEntries = new Map<string, BrandingEntry>();
  brandingRegistry.set(map, nextEntries);
  return nextEntries;
}

function getBrandingKey(provider: TileProvider): string {
  const branding = provider.branding;

  if (!branding) {
    return provider.id;
  }

  return [
    provider.id,
    branding.position ?? 'bottomleft',
    branding.href,
    branding.imageUrl,
    branding.minHeight ?? 30,
  ].join(':');
}

function createBrandingControl(branding: TileProviderBranding): Control {
  const brandingControl = new Control({
    position: branding.position ?? 'bottomleft',
  });

  brandingControl.onAdd = () => {
    const container = DomUtil.create('div', 'react-mapy-provider-branding');
    const link = DomUtil.create(
      'a',
      'react-mapy-provider-branding__link',
      container,
    );
    const image = DomUtil.create(
      'img',
      'react-mapy-provider-branding__image',
      link,
    );

    link.href = branding.href;
    link.target = branding.target ?? '_blank';
    link.rel = branding.rel ?? 'noreferrer noopener';
    link.ariaLabel = branding.alt;
    link.style.display = 'block';
    link.style.lineHeight = '0';

    image.src = branding.imageUrl;
    image.alt = branding.alt;
    image.style.display = 'block';
    image.style.height = `${branding.minHeight ?? 30}px`;
    image.style.width = 'auto';

    container.style.background = 'transparent';
    container.style.border = '0';
    container.style.boxShadow = 'none';

    DomEvent.disableClickPropagation(container);
    DomEvent.disableScrollPropagation(container);

    return container;
  };

  return brandingControl;
}
