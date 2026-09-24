import { useState } from "react";
import { TOPICS, CONNECTIONS } from '../data/constants';
import { C, alpha, white, FONTS, BODY, MONO, SPACE, TYPE } from '../styles/tokens';

// ─── The graph, as data ─────────────────────────────────────────
// Every connection seen from one topic, strongest first.
export const neighbors = (id, connections = CONNECTIONS) => connections
  .filter(c => c.from === id || c.to === id)
  .map(c => ({ id: c.from === id ? c.to : c.from, label: c.label, strength: c.strength }))
  .sort((a, b) => b.strength - a.strength || a.id.localeCompare(b.id));

// Order topics around the ring so connected topics sit near each other:
// start from the most connected, then keep taking the unplaced topic with the
// strongest link to the last one placed (ties and strangers in fixture order).
export const ringOrder = (topics = TOPICS, connections = CONNECTIONS) => {
  const degree = (id) => neighbors(id, connections).length;
  const left = [...topics].map(t => t.id);
  const start = left.reduce((best, id) => degree(id) > degree(best) ? id : best, left[0]);
  const order = [start];
  left.splice(left.indexOf(start), 1);
  while (left.length) {
    const last = order.at(-1);
    const next = neighbors(last, connections).find(n => left.includes(n.id))?.id
      ?? order.flatMap(id => neighbors(id, connections)).find(n => left.includes(n.id))?.id
      ?? left[0];
    order.push(next);
    left.splice(left.indexOf(next), 1);
  }
  return order;
};

// Positions on an ellipse, in percent of the drawing, so nodes (HTML buttons)
// and edges (SVG) share one coordinate system at any width.
export const ringPositions = (order) => Object.fromEntries(order.map((id, i) => {
  const a = (i / order.length) * Math.PI * 2 - Math.PI / 2;
  return [id, { x: Math.round((50 + 40 * Math.cos(a)) * 10) / 10, y: Math.round((50 + 40 * Math.sin(a)) * 10) / 10 }];
}));

const TOPIC_BY_ID = Object.fromEntries(TOPICS.map(t => [t.id, t]));
const POS = ringPositions(ringOrder());
const MAX_COUNT = Math.max(...TOPICS.map(t => t.count));
const STRONGEST = [...CONNECTIONS].sort((a, b) => b.strength - a.strength).slice(0, 5);

// ─── Pieces ─────────────────────────────────────────────────────
const sectionTitle = { fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 600, color: white(0.55), textTransform: "uppercase", letterSpacing: "0.08em", margin: `0 0 ${SPACE.md}px` };
const list = { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: SPACE.xs + 2 };
const linkButton = (color) => ({ fontFamily: BODY, fontSize: TYPE.base, fontWeight: 600, color, background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" });

const Strength = ({ value, color }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.sm, flexShrink: 0 }}>
    <span aria-hidden="true" style={{ width: 56, height: 4, background: white(0.08), borderRadius: 2, overflow: "hidden" }}>
      <span style={{ display: "block", width: `${value * 100}%`, height: "100%", background: color }} />
    </span>
    <span style={{ fontFamily: MONO, fontSize: TYPE.xs, color: white(0.6), width: 30 }}>{Math.round(value * 100)}%</span>
  </span>
);

// The signature piece: every topic on a ring, every connection drawn, node size
// by conversations. Selecting a topic lights its links and dims the rest.
const Graph = ({ selected, onSelect, mobile }) => {
  const lit = selected ? new Set([selected, ...neighbors(selected).map(n => n.id)]) : null;
  const color = selected ? TOPIC_BY_ID[selected].color : null;
  const touches = (c) => Boolean(selected) && (c.from === selected || c.to === selected);
  const edges = [...CONNECTIONS].sort((a, b) => touches(a) - touches(b)); // lit links draw on top
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: mobile ? "1 / 1" : "16 / 9" }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {edges.map(c => {
          const a = POS[c.from];
          const b = POS[c.to];
          const on = touches(c);
          return (
            <line key={`${c.from}-${c.to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={on ? color : C.white} strokeOpacity={on ? 0.9 : selected ? 0.06 : 0.12 + c.strength * 0.2}
              strokeWidth={(on ? 1.5 : 1) * (0.8 + c.strength * 2.2)} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
          );
        })}
      </svg>
      {TOPICS.map(t => {
        const p = POS[t.id];
        const on = selected === t.id;
        const dim = lit && !lit.has(t.id);
        const size = Math.round((mobile ? 26 : 34) + (t.count / MAX_COUNT) * (mobile ? 18 : 30));
        const n = neighbors(t.id).length;
        return (
          <button key={t.id} onClick={() => onSelect(on ? null : t.id)} aria-pressed={on}
            aria-label={`${t.name}: ${t.count} conversations, ${n} connection${n === 1 ? "" : "s"}`}
            style={{
              position: "absolute", left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -50%)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              background: "none", border: "none", padding: 0, cursor: "pointer", opacity: dim ? 0.3 : 1,
            }}>
            <span aria-hidden="true" style={{
              width: size, height: size, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: Math.round(size * 0.42), background: on ? alpha(t.color, 0.35) : C.bg1,
              border: `2px solid ${t.color}`, boxShadow: on ? `0 0 0 4px ${alpha(t.color, 0.2)}` : "none",
            }}>{t.icon}</span>
            {!mobile && (
              <span aria-hidden="true" style={{ fontFamily: BODY, fontSize: TYPE.xs, fontWeight: on ? 700 : 500, color: on ? C.white : white(0.7), whiteSpace: "nowrap", background: alpha(C.bg0, 0.8), padding: "0 4px", borderRadius: 4 }}>{t.name}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

const TopicPanel = ({ id, onSelect, onTopicClick, mobile }) => {
  const t = TOPIC_BY_ID[id];
  const links = neighbors(id);
  return (
    <div role="region" aria-live="polite" aria-label={`${t.name} connections`}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: SPACE.md, flexWrap: "wrap", marginBottom: SPACE.md }}>
        <h2 style={{ fontFamily: FONTS, fontSize: TYPE.lg, fontWeight: 700, color: C.white, margin: 0 }}>
          <span aria-hidden="true">{t.icon} </span>{t.name} <span style={{ fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 400, color: white(0.6) }}>connects to {links.length === 0 ? "nothing yet" : `${links.length} topic${links.length > 1 ? "s" : ""}`}</span>
        </h2>
        {onTopicClick && (
          <button onClick={() => onTopicClick(t)} style={{ fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 600, color: t.color, background: alpha(t.color, 0.08), border: `1px solid ${alpha(t.color, 0.35)}`, borderRadius: 8, padding: `${SPACE.xs + 2}px ${SPACE.md}px`, cursor: "pointer" }}>
            Open the {t.name} timeline →
          </button>
        )}
      </div>
      {links.length === 0 ? (
        <p style={{ margin: 0, fontFamily: BODY, fontSize: TYPE.base, color: white(0.6) }}>Atlas hasn't found a link from this topic to another one yet.</p>
      ) : (
        <ul style={list}>
          {links.map(l => {
            const o = TOPIC_BY_ID[l.id];
            return (
              <li key={l.id} style={{ display: "flex", alignItems: mobile ? "flex-start" : "center", gap: SPACE.md, flexDirection: mobile ? "column" : "row", padding: `${SPACE.sm}px 0`, borderTop: `1px solid ${white(0.06)}` }}>
                <Strength value={l.strength} color={o.color} />
                <button onClick={() => onSelect(l.id)} aria-label={`Show ${o.name}'s connections`} style={{ ...linkButton(o.color), flexShrink: 0 }}>
                  <span aria-hidden="true">{o.icon} </span>{o.name}
                </button>
                <span style={{ fontFamily: BODY, fontSize: TYPE.base, color: white(0.7) }}>{l.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const Overview = ({ onSelect, mobile }) => (
  <div role="region" aria-label="Strongest connections">
    <h2 style={sectionTitle}>Strongest connections</h2>
    <ol style={list}>
      {STRONGEST.map(c => {
        const a = TOPIC_BY_ID[c.from];
        const b = TOPIC_BY_ID[c.to];
        return (
          <li key={`${c.from}-${c.to}`} style={{ display: "flex", alignItems: mobile ? "flex-start" : "center", gap: SPACE.md, flexDirection: mobile ? "column" : "row", padding: `${SPACE.sm}px 0`, borderTop: `1px solid ${white(0.06)}` }}>
            <Strength value={c.strength} color={C.gold} />
            <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.sm, flexWrap: "wrap" }}>
              <button onClick={() => onSelect(a.id)} style={linkButton(a.color)}>{a.name}</button>
              <span aria-hidden="true" style={{ color: white(0.5) }}>↔</span>
              <button onClick={() => onSelect(b.id)} style={linkButton(b.color)}>{b.name}</button>
            </span>
            <span style={{ fontFamily: BODY, fontSize: TYPE.base, color: white(0.7) }}>{c.label}</span>
          </li>
        );
      })}
    </ol>
    <p style={{ margin: `${SPACE.md}px 0 0`, fontFamily: BODY, fontSize: TYPE.sm, color: white(0.6) }}>Pick a topic on the map, or a name above, to see everything it connects to.</p>
  </div>
);

// ─── The view ───────────────────────────────────────────────────
const ConnectionsView = ({ onTopicClick, mobile }) => {
  const [selected, setSelected] = useState(null);
  const hub = ringOrder()[0];
  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <header style={{ marginBottom: SPACE.xl, maxWidth: 680 }}>
        <h1 style={{ fontFamily: FONTS, fontSize: mobile ? TYPE.xl : TYPE.xxl, fontWeight: 800, color: C.white, letterSpacing: "-0.01em", margin: 0 }}>How your ideas <span style={{ color: C.gold }}>connect</span></h1>
        <p style={{ fontFamily: BODY, fontSize: mobile ? TYPE.base : TYPE.md, color: white(0.6), lineHeight: 1.55, margin: `${SPACE.sm}px 0 0` }}>
          {CONNECTIONS.length} connections between {TOPICS.length} topics. {TOPIC_BY_ID[hub].name} is the most connected, with {neighbors(hub).length}. Bigger circles hold more conversations; thicker lines are stronger links.
        </p>
      </header>

      <section aria-label="Connection map" style={{ background: white(0.02), border: `1px solid ${white(0.07)}`, borderRadius: 16, padding: mobile ? SPACE.sm : SPACE.lg, marginBottom: SPACE.xl }}>
        <Graph selected={selected} onSelect={setSelected} mobile={mobile} />
      </section>

      <section style={{ background: white(0.02), border: `1px solid ${white(0.07)}`, borderRadius: 14, padding: mobile ? SPACE.md : `${SPACE.lg}px ${SPACE.xl}px` }}>
        {selected
          ? <TopicPanel id={selected} onSelect={setSelected} onTopicClick={onTopicClick} mobile={mobile} />
          : <Overview onSelect={setSelected} mobile={mobile} />}
        {selected && (
          <button onClick={() => setSelected(null)} style={{ ...linkButton(white(0.7)), fontSize: TYPE.sm, fontWeight: 500, marginTop: SPACE.md, textDecoration: "underline", textUnderlineOffset: 3 }}>
            Back to the strongest connections
          </button>
        )}
      </section>
    </div>
  );
};

export default ConnectionsView;
