import { describe, it, expect } from 'vitest';
import { C, alpha, white } from '../tokens';

describe('alpha', () => {
  it('turns a hex token into rgba', () => {
    expect(alpha(C.white, 0.5).match(/[\d.]+/g)).toEqual(['255', '255', '255', '0.5']);
    expect(alpha(C.white, 0.3)).toBe(white(0.3));
  });

  it('refuses an rgba string instead of rendering an invisible color', () => {
    // A helper handed white(0.7) used to produce rgba(NaN,...): an invisible
    // button in PR 6 and a white-on-white Cancel in PR 9.
    expect(() => alpha(white(0.7), 0.07)).toThrow(/takes a hex color/);
    expect(() => alpha('transparent', 0.5)).toThrow(/takes a hex color/);
  });
});
