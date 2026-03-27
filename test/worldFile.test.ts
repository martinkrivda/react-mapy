import { describe, expect, it } from 'vitest';

import {
  applyWorldFileTransform,
  computeGeographicImageBounds,
  computeGeoreferencedImageBounds,
  hasWorldFileRotation,
  parseWorldFile,
} from '../src/parsers';

describe('world file utilities', () => {
  it('parses affine transforms and projects pixel corners', () => {
    const transform = parseWorldFile(['2', '0', '0', '-2', '100', '200'].join('\n'));

    expect(transform.scaleX).toBe(2);
    expect(transform.scaleY).toBe(-2);
    expect(applyWorldFileTransform(transform, 10, 5)).toEqual({ x: 120, y: 190 });

    const bounds = computeGeoreferencedImageBounds(100, 50, transform);

    expect(bounds.minX).toBe(99);
    expect(bounds.maxX).toBe(299);
    expect(bounds.maxY).toBe(201);
    expect(bounds.minY).toBe(101);
  });

  it('computes geographic bounds for axis-aligned world files', () => {
    const transform = parseWorldFile(['0.1', '0', '0', '-0.1', '14.45', '50.05'].join('\n'));
    const bounds = computeGeographicImageBounds(10, 5, transform);

    expect(bounds.east).toBeCloseTo(15.4);
    expect(bounds.north).toBeCloseTo(50.1);
    expect(bounds.south).toBeCloseTo(49.6);
    expect(bounds.west).toBeCloseTo(14.4);
    expect(hasWorldFileRotation(transform)).toBe(false);
  });

  it('requires explicit opt-in when the world file contains rotation', () => {
    const transform = parseWorldFile(['1', '0.02', '0.01', '-1', '100', '200'].join('\n'));

    expect(hasWorldFileRotation(transform)).toBe(true);
    expect(() => computeGeographicImageBounds(10, 5, transform)).toThrow(
      /allowApproximateRotation/u,
    );
  });
});
