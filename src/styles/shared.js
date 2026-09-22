// Shared inline styles: the objects that were pasted verbatim across views.
// Plain objects are used as `style={row}`; the ones that depend on the
// breakpoint are functions of `mobile`. Extend with `{ ...lede(mobile), marginTop: 6 }`.
import { C, white, FONTS, BODY, MONO } from './tokens';

// Layout
export const row = { display: "flex", alignItems: "center", gap: 8 };
export const rowTight = { display: "flex", alignItems: "center", gap: 6 };
export const stack = { display: "flex", flexDirection: "column", gap: 8 };
export const stackTight = { display: "flex", flexDirection: "column", gap: 6 };
export const grow = { flex: 1, minWidth: 0 };
export const container = { maxWidth: 960, margin: "0 auto" };
export const screen = (mobile) => ({ minHeight: "100vh", background: C.bg0, display: "flex", flexDirection: "column", padding: mobile ? "24px 16px" : "32px 40px" });

// Type
export const eyebrow = { fontFamily: BODY, fontSize: 9, color: white(0.15), textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 };
export const display = (mobile) => ({ fontFamily: FONTS, fontSize: mobile ? 26 : 36, fontWeight: 800, color: C.white, lineHeight: 1.1, letterSpacing: "-0.02em" });
export const title = (mobile) => ({ fontFamily: FONTS, fontSize: mobile ? 24 : 28, color: C.white, marginBottom: 6, fontWeight: 700 });
export const lede = (mobile) => ({ fontFamily: BODY, fontSize: mobile ? 12 : 14, color: white(0.3) });
export const body = (mobile) => ({ fontFamily: BODY, fontSize: mobile ? 13 : 15, color: white(0.4), marginBottom: 6, lineHeight: 1.6 });
export const mono = { fontFamily: MONO, fontSize: 10, color: white(0.2) };
export const monoSmall = { fontFamily: MONO, fontSize: 9, color: white(0.15) };

// Bars
export const track = { width: "100%", height: 6, background: white(0.04), borderRadius: 3, overflow: "hidden" };
