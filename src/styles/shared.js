// Shared inline styles: the objects that were pasted verbatim across views.
// Plain objects are used as `style={row}`; the ones that depend on the
// breakpoint are functions of `mobile`. Extend with `{ ...lede(mobile), marginTop: 6 }`.
import { C, white, FONTS, BODY } from './tokens';

// Layout
export const row = { display: "flex", alignItems: "center", gap: 8 };
export const rowTight = { display: "flex", alignItems: "center", gap: 6 };
export const container = { maxWidth: 960, margin: "0 auto" };
export const screen = (mobile) => ({ minHeight: "100vh", background: C.bg0, display: "flex", flexDirection: "column", padding: mobile ? "24px 16px" : "32px 40px" });

// Type
export const title = (mobile) => ({ fontFamily: FONTS, fontSize: mobile ? 24 : 28, color: C.white, marginBottom: 6, fontWeight: 700 });
export const lede = (mobile) => ({ fontFamily: BODY, fontSize: mobile ? 12 : 14, color: white(0.3) });

