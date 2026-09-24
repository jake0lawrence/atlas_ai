import { useState } from "react";
import { BELIEF_DIFFS, ARCHAEOLOGY_CHAINS } from '../data/constants';
import { C, alpha, white, FONTS, BODY, MONO, SPACE, TYPE } from '../styles/tokens';

// ─── The diffs, as data ─────────────────────────────────────────
// Which decision chains explain each diff. Written out, so a renamed topic
// can't silently drop or change its links (a test holds every id to a chain).
export const CHAINS_FOR = {
  "ai-tools": ["why-typescript"],
  "automation": ["why-event-driven", "why-vercel"],
  "courtcollect-arch": ["why-event-driven", "why-vercel"],
};

export const diffStats = (diff) => {
  const count = (type) => diff.lines.filter(l => l.type === type).length;
  return { removed: count("removed"), context: count("context"), added: count("added") };
};

// What you believed at each end: then = dropped + kept, now = kept + new.
// The diff itself lists everything, dropped first, then kept, then new.
export const beliefsAt = (diff, mode) => {
  const of = (type) => diff.lines.filter(l => l.type === type);
  if (mode === "then") return [...of("removed"), ...of("context")];
  if (mode === "now") return [...of("context"), ...of("added")];
  return [...of("removed"), ...of("context"), ...of("added")];
};

const MODES = [
  { id: "then", label: "Then" },
  { id: "diff", label: "What changed" },
  { id: "now", label: "Now" },
];

const LINE = {
  removed: { mark: "−", label: "Dropped", color: C.red, bg: alpha(C.red, 0.07) },
  context: { mark: "=", label: "Kept", color: white(0.6), bg: "transparent" },
  added: { mark: "+", label: "New", color: C.green, bg: alpha(C.green, 0.07) },
};

// ─── Pieces ─────────────────────────────────────────────────────
const sectionTitle = { fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 600, color: white(0.55), textTransform: "uppercase", letterSpacing: "0.08em", margin: `0 0 ${SPACE.md}px` };
const list = { listStyle: "none", margin: 0, padding: 0 };

// Dropped / kept / new as one proportional bar, in words underneath.
const Balance = ({ stats }) => {
  const total = stats.removed + stats.context + stats.added;
  const parts = [["removed", stats.removed], ["context", stats.context], ["added", stats.added]];
  return (
    <div>
      <div role="img" aria-label={`${stats.removed} dropped, ${stats.context} kept, ${stats.added} new`} style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", gap: 2 }}>
        {parts.map(([k, n]) => n > 0 && <span key={k} style={{ flex: n / total, background: k === "context" ? white(0.25) : LINE[k].color }} />)}
      </div>
      <div aria-hidden="true" style={{ display: "flex", gap: SPACE.lg, marginTop: SPACE.xs + 2, fontFamily: MONO, fontSize: TYPE.xs }}>
        {parts.map(([k, n]) => <span key={k} style={{ color: k === "context" ? white(0.6) : LINE[k].color }}>{LINE[k].mark}{n} {LINE[k].label.toLowerCase()}</span>)}
      </div>
    </div>
  );
};

const Line = ({ line, mode }) => {
  const l = LINE[line.type];
  // In "then" and "now" every line is simply what you believed; the marks belong to the diff.
  const plain = mode !== "diff";
  return (
    <li style={{ display: "flex", gap: SPACE.md, alignItems: "baseline", padding: `${SPACE.sm + 2}px ${SPACE.lg}px`, background: plain ? "transparent" : l.bg, borderTop: `1px solid ${white(0.05)}` }}>
      <span aria-hidden="true" style={{ fontFamily: MONO, fontSize: TYPE.base, fontWeight: 700, color: plain ? white(0.35) : l.color, width: 14, flexShrink: 0, textAlign: "center" }}>{plain ? "·" : l.mark}</span>
      {!plain && <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{l.label}: </span>}
      <span style={{
        fontFamily: BODY, fontSize: TYPE.md, lineHeight: 1.5,
        color: plain ? white(0.85) : line.type === "context" ? white(0.65) : white(0.9),
        textDecoration: !plain && line.type === "removed" ? "line-through" : "none", textDecorationColor: alpha(C.red, 0.6),
      }}>{line.text}</span>
    </li>
  );
};

// ─── The view ───────────────────────────────────────────────────
const BeliefDiffsView = ({ mobile, onArchaeologyClick }) => {
  const [selected, setSelected] = useState(BELIEF_DIFFS[0].id);
  const [mode, setMode] = useState("diff");
  const diff = BELIEF_DIFFS.find(d => d.id === selected);
  const stats = diffStats(diff);
  const lines = beliefsAt(diff, mode);
  const chains = (CHAINS_FOR[diff.id] || []).map(id => ARCHAEOLOGY_CHAINS[id]).filter(Boolean);
  const heading = mode === "then" ? `What you believed, ${diff.earlier.label}` : mode === "now" ? `What you believe, ${diff.current.label}` : `${diff.earlier.label} → ${diff.current.label}`;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <header style={{ marginBottom: SPACE.xl, maxWidth: 680 }}>
        <h1 style={{ fontFamily: FONTS, fontSize: mobile ? TYPE.xl : TYPE.xxl, fontWeight: 800, color: C.white, letterSpacing: "-0.01em", margin: 0 }}>Belief <span style={{ color: C.gold }}>diffs</span></h1>
        <p style={{ fontFamily: BODY, fontSize: mobile ? TYPE.base : TYPE.md, color: white(0.6), lineHeight: 1.55, margin: `${SPACE.sm}px 0 0` }}>
          How your thinking on {BELIEF_DIFFS.length} subjects changed, read like a code diff: what you dropped, what held, and what you believe now.
        </p>
      </header>

      <div role="group" aria-label="Subject" style={{ display: "flex", flexWrap: "wrap", gap: SPACE.sm, marginBottom: SPACE.xl }}>
        {BELIEF_DIFFS.map(d => {
          const on = d.id === selected;
          return (
            <button key={d.id} onClick={() => setSelected(d.id)} aria-pressed={on} style={{
              display: "inline-flex", alignItems: "center", gap: SPACE.xs + 2, fontFamily: BODY, fontSize: TYPE.base, fontWeight: on ? 600 : 500,
              color: on ? C.bg0 : white(0.75), background: on ? d.color : white(0.04), border: `1px solid ${on ? d.color : white(0.14)}`,
              borderRadius: 20, padding: `${SPACE.xs + 3}px ${SPACE.lg}px`, cursor: "pointer",
            }}><span aria-hidden="true">{d.icon}</span>{d.topic}</button>
          );
        })}
      </div>

      <section aria-labelledby="bd-diff" style={{ background: white(0.02), border: `1px solid ${white(0.08)}`, borderRadius: 14, overflow: "hidden", marginBottom: SPACE.xl }}>
        <div style={{ display: "flex", alignItems: mobile ? "flex-start" : "center", justifyContent: "space-between", gap: SPACE.md, flexDirection: mobile ? "column" : "row", padding: mobile ? SPACE.md : `${SPACE.lg}px ${SPACE.lg}px` }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h2 id="bd-diff" style={{ fontFamily: FONTS, fontSize: TYPE.lg, fontWeight: 700, color: C.white, margin: `0 0 ${SPACE.sm}px` }}>
              <span aria-hidden="true">{diff.icon} </span>{diff.topic} <span style={{ fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 400, color: white(0.6) }}>{heading}</span>
            </h2>
            <Balance stats={stats} />
          </div>
          <div role="group" aria-label="Show" style={{ display: "inline-flex", background: white(0.04), border: `1px solid ${white(0.1)}`, borderRadius: 10, padding: 3, flexShrink: 0 }}>
            {MODES.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)} aria-pressed={mode === m.id} style={{
                fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 600, color: mode === m.id ? C.bg0 : white(0.7),
                background: mode === m.id ? C.gold : "transparent", border: "none", borderRadius: 7, padding: `${SPACE.xs + 2}px ${SPACE.md}px`, cursor: "pointer",
              }}>{m.label}</button>
            ))}
          </div>
        </div>
        <ul aria-label={heading} style={{ ...list, position: "relative" }}>
          {lines.map(line => <Line key={line.type + line.text} line={line} mode={mode} />)}
        </ul>
      </section>

      {chains.length > 0 && (
        <section aria-labelledby="bd-chains">
          <h2 id="bd-chains" style={sectionTitle}>Trace the decisions behind it</h2>
          <ul style={{ ...list, display: "flex", flexDirection: "column", gap: SPACE.sm }}>
            {chains.map(c => (
              <li key={c.id}>
                <button onClick={() => onArchaeologyClick?.(c.id)} style={{
                  display: "flex", alignItems: "center", gap: SPACE.md, width: "100%", textAlign: "left",
                  background: alpha(c.color, 0.05), border: `1px solid ${alpha(c.color, 0.3)}`, borderRadius: 10,
                  padding: `${SPACE.md}px ${SPACE.lg}px`, cursor: "pointer",
                }}>
                  <span aria-hidden="true" style={{ fontSize: 18, color: c.color, width: 22, textAlign: "center", flexShrink: 0 }}>{c.icon}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontFamily: BODY, fontSize: TYPE.base, fontWeight: 600, color: C.white }}>{c.title}</span>
                    <span style={{ display: "block", fontFamily: BODY, fontSize: TYPE.sm, color: white(0.6), lineHeight: 1.45, marginTop: 2 }}>{c.summary}</span>
                  </span>
                  <span aria-hidden="true" style={{ fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 600, color: c.color, flexShrink: 0 }}>Trace →</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default BeliefDiffsView;
