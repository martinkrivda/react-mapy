import { describe, expect, it } from 'vitest';

import { mapThemes, resolveMapTheme } from '../src';

describe('map themes', () => {
  it('resolves built-in preset themes', () => {
    expect(resolveMapTheme('mapy')).toEqual(mapThemes.mapy);
    expect(resolveMapTheme('neutral')).toEqual(mapThemes.neutral);
  });

  it('extends a preset with partial overrides', () => {
    const theme = resolveMapTheme({
      extends: 'neutral',
      accentColor: '#18181b',
      tileOpacity: 0.9,
    });

    expect(theme.id).toBe('neutral');
    expect(theme.accentColor).toBe('#18181b');
    expect(theme.tileOpacity).toBe(0.9);
    expect(theme.controlBackground).toBe(mapThemes.neutral.controlBackground);
  });
});
