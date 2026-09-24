// Design tokens for Atlas.
//
// This is the only place in src/ allowed to spell a color (ESLint enforces it:
// see the `no-restricted-syntax` rule in eslint.config.js). Views and components
// import `C` for solid colors and `alpha` / `white` for translucent ones.
//
// `alpha()` emits `rgba(r,g,b,a)` with no spaces, which is byte-for-byte what the
// pre-token markup contained, so the rendered DOM is unchanged by the migration.

export const C = {
  // Surfaces
  bg0: "#08080C",      // page background
  bg1: "#0D0D12",
  bg2: "#131318",
  bg3: "#141418",
  black: "#000",
  white: "#fff",

  // Brand accent (Claude gold) and its neighbors
  gold: "#FBBF24",
  amber: "#F59E0B",
  yellow: "#EAB308",

  // Semantic accents
  green: "#10B981",
  greenBright: "#22C55E",
  red: "#EF4444",
  redLight: "#F87171",
  rose: "#E11D48",
  blue: "#3B82F6",
  sky: "#0EA5E9",
  cyan: "#06B6D4",
  teal: "#14B8A6",
  purple: "#A855F7",
  violet: "#8B5CF6",
  indigo: "#6366F1",
  fuchsia: "#D946EF",
  pink: "#EC4899",
  orange: "#F97316",
  orangeLight: "#FB923C",
  lime: "#84CC16",
  slate: "#64748B",
  slateDeep: "#475569",

  // One-off: the TypeScript logo blue in the archaeology fixture
  tsBlue: "#3178C6",
};

// Platform accents, named for what they mean on screen.
export const PLATFORM = {
  claude: C.gold,
  gpt: C.blue,
};

const HEX_CACHE = new Map();

function hexToRgb(hex) {
  let rgb = HEX_CACHE.get(hex);
  if (rgb) return rgb;
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map(ch => ch + ch).join("");
  rgb = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
  HEX_CACHE.set(hex, rgb);
  return rgb;
}

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * `alpha(C.gold, 0.35)` -> `"rgba(251,191,36,0.35)"`. Hex in only: an rgba
 * string (say `white(0.7)` handed to a helper that calls alpha) used to come
 * out as `rgba(NaN,...)`, an invisible color that no test noticed. Dev and
 * tests throw on it; a production build keeps the color it was given.
 */
export function alpha(hex, a) {
  if (!HEX.test(hex)) {
    const msg = `alpha() takes a hex color from C, got ${JSON.stringify(hex)}. Pass C.white (not white(0.7)) to helpers that call alpha().`;
    if (import.meta.env?.DEV) throw new Error(msg);
    console.warn(msg);
    return hex;
  }
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

/** Translucent white, the workhorse of the dark theme: `white(0.3)`. */
export const white = (a) => alpha(C.white, a);

/** Translucent black, for scrims and shadows. */
export const black = (a) => alpha(C.black, a);

// Typography stacks
export const FONTS = `'Playfair Display', 'Georgia', serif`;
export const BODY = `'Libre Franklin', 'Helvetica Neue', sans-serif`;
export const MONO = `'JetBrains Mono', 'Fira Code', monospace`;

// Spacing scale (px). Views pick from here, not from arbitrary numbers.
export const SPACE = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 };

// Type scale (px). `shared.js` builds its text styles on it.
export const TYPE = { xs: 10, sm: 11, base: 13, md: 15, lg: 18, xl: 22, xxl: 28, display: 40 };
