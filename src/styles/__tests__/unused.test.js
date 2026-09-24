// The retire gate (V7_PLAN.md, PR 21): every color, keyframe and shared style
// the style modules define is used somewhere, so the palette cannot quietly
// grow back to the 35 colors v6 ended with. Delete what nothing uses; this
// test says which.
import { describe, it, expect } from 'vitest';
import { C, PLATFORM } from '../tokens';
import { CSS } from '../base';
import * as shared from '../shared';

const SOURCES = import.meta.glob(['../../**/*.{js,jsx}', '!../../**/__tests__/**'], { query: '?raw', import: 'default', eager: true });
const outside = (file) => Object.entries(SOURCES).filter(([path]) => !path.endsWith(file)).map(([, src]) => src).join('\n');

describe('the style modules carry nothing unused', () => {
  it('every color is used outside tokens.js', () => {
    const rest = outside('styles/tokens.js');
    // `white` and `black` back the white() / black() helpers.
    const unused = Object.keys(C).filter(k => !['white', 'black'].includes(k) && !new RegExp(`\\bC\\.${k}\\b`).test(rest));
    expect(unused).toEqual([]);
    for (const k of Object.keys(PLATFORM)) expect(rest).toMatch(/\bPLATFORM\b/, k);
  });

  it('every keyframe is used by a view or by a class in the stylesheet', () => {
    const rest = outside('styles/base.js');
    const names = [...CSS.matchAll(/@keyframes (\w+)/g)].map(m => m[1]);
    const usedByClass = (n) => new RegExp(`animation:\\s*${n}\\b`).test(CSS);
    const unused = names.filter(n => !usedByClass(n) && !new RegExp(`\\b${n}\\b`).test(rest));
    expect(unused).toEqual([]);
  });

  it('every shared style is imported somewhere', () => {
    const rest = outside('styles/shared.js');
    const imports = [...rest.matchAll(/import \{([^}]*)\} from '[./]*styles\/shared'/g)].flatMap(m => m[1].split(',').map(s => s.trim()));
    const unused = Object.keys(shared).filter(k => !imports.includes(k));
    expect(unused).toEqual([]);
  });

  it('reduced motion stops inline animations too, not only the classes', () => {
    const block = CSS.slice(CSS.indexOf('@media (prefers-reduced-motion: reduce)'));
    expect(block).toMatch(/\*, \*::before, \*::after \{[^}]*animation-duration: 0\.01ms !important/);
    expect(block).toMatch(/transition-duration: 0\.01ms !important/);
  });
});
