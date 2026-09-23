import { useState, useEffect, useReducer } from "react";
import { TOPICS, CONNECTIONS } from '../data/constants';
import { CSS } from '../styles/base';
import { screen } from '../styles/shared';
import { C, alpha, white, BODY, MONO, SPACE, TYPE } from '../styles/tokens';
import { CurationHeader, KeyHints } from '../components/CurationChrome';

// ─── The connections, as data ───────────────────────────────────
const TOPIC_BY_ID = Object.fromEntries(TOPICS.map(t => [t.id, t]));

export const initialConnections = (data = CONNECTIONS) => data.map((c, i) => ({
  ...c, id: i, status: "pending", originalLabel: c.label, added: false,
}));

export const initialState = () => ({ items: initialConnections(), activeId: null, editing: false });

const pendingOf = (items) => items.filter(i => i.status === "pending");

export const activeItem = ({ items, activeId }) => {
  const pending = pendingOf(items);
  return pending.find(i => i.id === activeId) || pending[0] || null;
};

// The pending connection after (1) or before (-1) `fromId`, wrapping.
export const nextPending = (items, fromId, dir = 1) => {
  const pending = pendingOf(items);
  if (pending.length === 0) return null;
  const at = pending.findIndex(i => i.id === fromId);
  if (at < 0) return pending[0];
  return pending[(at + dir + pending.length) % pending.length];
};

export const summarize = (items) => {
  const count = (s) => items.filter(i => i.status === s).length;
  return {
    total: items.length, pending: count("pending"), decided: items.length - count("pending"),
    confirmed: count("confirmed"), edited: count("edited"), rejected: count("rejected"),
    added: items.filter(i => i.added).length,
  };
};

const samePair = (a, b) => (a.from === b.from && a.to === b.to) || (a.from === b.to && a.to === b.from);

// Why a new connection can't be added, or null when it can.
export const addProblem = (items, { from, to, label }) => {
  if (!from || !to) return "Pick both topics.";
  if (from === to) return "A topic can't connect to itself.";
  if (!label.trim()) return "Say what connects them.";
  if (items.some(i => i.status !== "rejected" && samePair(i, { from, to }))) return "Those two topics are already connected.";
  return null;
};

// Every change to the list goes through here, so keys and buttons agree
// on which connection they act on.
export const connectionsReducer = (state, action) => {
  const active = activeItem(state);
  const decide = (status, patch = {}) => {
    const next = nextPending(state.items, active.id);
    return {
      items: state.items.map(i => i.id === active.id ? { ...i, ...patch, status } : i),
      activeId: next && next.id !== active.id ? next.id : null,
      editing: false,
    };
  };
  switch (action.type) {
    case "decide":
      return active ? decide(action.status) : state;
    case "relabel": {
      const label = action.label.trim();
      if (!active || !label) return state;
      return label === active.label ? decide("confirmed") : decide("edited", { label });
    }
    case "step":
      return active ? { ...state, activeId: nextPending(state.items, active.id, action.dir)?.id ?? null, editing: false } : state;
    case "open":
      return { ...state, activeId: action.id, editing: false };
    case "toggleEdit":
      return active ? { ...state, editing: !state.editing } : state;
    case "closeEdit":
      return state.editing ? { ...state, editing: false } : state;
    case "undo":
      return {
        ...state, activeId: action.id, editing: false,
        items: state.items.flatMap(i => i.id !== action.id ? [i] : i.added ? [] : [{ ...i, status: "pending", label: i.originalLabel }]),
      };
    case "add": {
      if (addProblem(state.items, action)) return state;
      const id = Math.max(...state.items.map(i => i.id)) + 1;
      const item = { id, from: action.from, to: action.to, label: action.label.trim(), originalLabel: action.label.trim(), strength: 0.5, status: "confirmed", added: true };
      return { ...state, items: [...state.items, item] };
    }
    case "confirmRest":
      return { ...state, items: state.items.map(i => i.status === "pending" ? { ...i, status: "confirmed" } : i), activeId: null, editing: false };
    default:
      return state;
  }
};

// Topic positions on an ellipse, in fixture order, so the drawing is the same every run.
export const layout = (ids, { cx = 200, cy = 130, rx = 170, ry = 104 } = {}) =>
  Object.fromEntries(ids.map((id, i) => {
    const a = (i / ids.length) * Math.PI * 2 - Math.PI / 2;
    return [id, { x: Math.round((cx + rx * Math.cos(a)) * 10) / 10, y: Math.round((cy + ry * Math.sin(a)) * 10) / 10 }];
  }));

const POS = layout(TOPICS.map(t => t.id));

const STATUS = {
  pending: { label: "Waiting", color: white(0.3) },
  confirmed: { label: "Confirmed", color: C.green },
  edited: { label: "Relabeled", color: C.blue },
  rejected: { label: "Rejected", color: C.red },
};

const KEY_ACTIONS = {
  a: { type: "decide", status: "confirmed" },
  x: { type: "decide", status: "rejected" },
  e: { type: "toggleEdit" },
  s: { type: "step", dir: 1 },
  arrowdown: { type: "step", dir: 1 },
  arrowup: { type: "step", dir: -1 },
  escape: { type: "closeEdit" },
};

const SHORTCUTS = [["A", "confirm"], ["E", "relabel"], ["X", "reject"], ["S", "later"], ["↑ ↓", "previous / next"]];

// ─── Pieces ─────────────────────────────────────────────────────
const sectionTitle = { fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 600, color: white(0.55), textTransform: "uppercase", letterSpacing: "0.08em", margin: `0 0 ${SPACE.md}px` };
const label = { fontFamily: BODY, fontSize: TYPE.xs, fontWeight: 600, color: white(0.45), textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: SPACE.sm };
const list = { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: SPACE.sm };
const field = { fontFamily: BODY, fontSize: TYPE.base, color: C.white, background: white(0.06), border: `1px solid ${white(0.18)}`, borderRadius: 8, padding: `${SPACE.sm}px ${SPACE.md}px`, width: "100%", boxSizing: "border-box" };
const hidden = { position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" };

const button = (color, primary) => ({
  display: "flex", alignItems: "center", justifyContent: "center", gap: SPACE.sm,
  padding: `${SPACE.sm + 2}px ${SPACE.lg}px`, fontFamily: BODY, fontSize: TYPE.base, fontWeight: 600,
  color: primary ? C.bg0 : color, background: primary ? color : alpha(color, 0.07),
  border: `1px solid ${primary ? color : alpha(color, 0.3)}`, borderRadius: 10, cursor: "pointer",
});

const Pair = ({ conn, size = TYPE.base }) => {
  const from = TOPIC_BY_ID[conn.from];
  const to = TOPIC_BY_ID[conn.to];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.sm, minWidth: 0, flexWrap: "wrap", fontFamily: BODY, fontSize: size, fontWeight: 600 }}>
      <span style={{ color: from?.color }}><span aria-hidden="true">{from?.icon} </span>{from?.name}</span>
      <span aria-label="and" style={{ color: white(0.4), fontWeight: 400 }}>↔</span>
      <span style={{ color: to?.color }}><span aria-hidden="true">{to?.icon} </span>{to?.name}</span>
    </span>
  );
};

const Strength = ({ value }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.sm, fontFamily: MONO, fontSize: TYPE.xs, color: white(0.55) }}>
    <span aria-hidden="true" style={{ width: 56, height: 5, background: white(0.08), borderRadius: 3, overflow: "hidden" }}>
      <span style={{ display: "block", width: `${Math.round(value * 100)}%`, height: "100%", background: C.purple }} />
    </span>
    {Math.round(value * 100)}% strong
  </span>
);

// The graph taking shape: every topic, every connection, colored by decision.
const Graph = ({ items, active, stats }) => {
  const summary = `Connection graph: ${stats.total} connections between ${TOPICS.length} topics. ${stats.confirmed + stats.edited} kept, ${stats.rejected} rejected, ${stats.pending} waiting.${active ? ` Now reviewing ${TOPIC_BY_ID[active.from]?.name} and ${TOPIC_BY_ID[active.to]?.name}.` : ""}`;
  const lit = active ? new Set([active.from, active.to]) : new Set();
  const ordered = [...items].sort((a, b) => (a.id === active?.id) - (b.id === active?.id));
  return (
    <figure style={{ margin: 0 }}>
      <svg viewBox="0 0 400 260" role="img" aria-label={summary} style={{ width: "100%", height: "auto", display: "block" }}>
        {ordered.map(c => {
          const a = POS[c.from];
          const b = POS[c.to];
          if (!a || !b) return null;
          const isActive = c.id === active?.id;
          const color = isActive ? C.gold : STATUS[c.status].color;
          return (
            <line key={c.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={color} strokeWidth={isActive ? 3 : 1 + c.strength * 2}
              strokeDasharray={c.status === "rejected" ? "4 4" : undefined}
              strokeOpacity={isActive ? 1 : c.status === "rejected" ? 0.45 : c.status === "pending" ? 0.6 : 0.85}
              strokeLinecap="round" />
          );
        })}
        {TOPICS.map(t => {
          const p = POS[t.id];
          const on = lit.has(t.id);
          return (
            <g key={t.id}>
              <circle cx={p.x} cy={p.y} r={on ? 15 : 12} fill={on ? alpha(t.color, 0.35) : C.bg1} stroke={t.color} strokeWidth={on ? 2.5 : 1.5} strokeOpacity={on ? 1 : 0.6} />
              <text x={p.x} y={p.y + 4.5} textAnchor="middle" fontSize={on ? 14 : 12}>{t.icon}</text>
            </g>
          );
        })}
      </svg>
      <figcaption style={{ display: "flex", flexWrap: "wrap", gap: `${SPACE.xs}px ${SPACE.md}px`, justifyContent: "center", marginTop: SPACE.sm, fontFamily: BODY, fontSize: TYPE.xs, color: white(0.55) }}>
        {[["Now", C.gold], ...Object.values(STATUS).map(s => [s.label, s.color])].map(([name, color]) => (
          <span key={name} style={{ display: "inline-flex", alignItems: "center", gap: SPACE.xs }}>
            <span aria-hidden="true" style={{ width: 14, height: 3, borderRadius: 2, background: color }} />{name}
          </span>
        ))}
      </figcaption>
    </figure>
  );
};

const RelabelForm = ({ conn, dispatch }) => {
  const [text, setText] = useState(conn.label);
  return (
    <form onSubmit={e => { e.preventDefault(); dispatch({ type: "relabel", label: text }); }} style={{ display: "flex", flexDirection: "column", gap: SPACE.sm }}>
      <label>
        <span style={hidden}>Label for this connection</span>
        <input value={text} onChange={e => setText(e.target.value)} autoFocus onKeyDown={e => { if (e.key === "Escape") { e.stopPropagation(); dispatch({ type: "closeEdit" }); } }} style={{ ...field, fontSize: 15 }} />
      </label>
      <span style={{ display: "flex", gap: SPACE.sm }}>
        <button type="submit" style={button(C.blue, true)}>Save label</button>
        <button type="button" onClick={() => dispatch({ type: "closeEdit" })} style={button(C.white)}>Cancel</button>
      </span>
    </form>
  );
};

const ActiveCard = ({ conn, position, pendingCount, editing, dispatch, mobile, wide }) => (
  <article aria-label={`Reviewing: ${TOPIC_BY_ID[conn.from]?.name} and ${TOPIC_BY_ID[conn.to]?.name}`} style={{
    background: white(0.035), border: `1px solid ${alpha(C.gold, 0.35)}`, borderRadius: 14, padding: mobile ? SPACE.lg : SPACE.xl,
    display: "flex", flexDirection: "column", gap: SPACE.lg,
  }}>
    <div style={{ fontFamily: MONO, fontSize: TYPE.xs, color: white(0.45) }}>{position} of {pendingCount} waiting</div>
    <div>
      <div style={label}>Atlas connected</div>
      <Pair conn={conn} size={15} />
      <div style={{ marginTop: SPACE.sm }}><Strength value={conn.strength} /></div>
    </div>
    <div>
      <div style={label}>Because of</div>
      {editing
        ? <RelabelForm conn={conn} dispatch={dispatch} />
        : <div style={{ fontFamily: BODY, fontSize: mobile ? 15 : 17, color: white(0.85), padding: `${SPACE.sm}px ${SPACE.md + 2}px`, borderRadius: 10, background: alpha(C.purple, 0.06), border: `1px solid ${alpha(C.purple, 0.18)}` }}>“{conn.label}”</div>}
    </div>
    {!editing && (
      <div role="group" aria-label="Your call" style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : wide ? "repeat(4, 1fr)" : "1fr 1fr", gap: SPACE.sm }}>
        <button onClick={() => dispatch({ type: "decide", status: "confirmed" })} aria-keyshortcuts="A" style={button(C.green, true)}><span aria-hidden="true">✓</span>Confirm</button>
        <button onClick={() => dispatch({ type: "toggleEdit" })} aria-keyshortcuts="E" style={button(C.blue)}><span aria-hidden="true">✎</span>Relabel</button>
        <button onClick={() => dispatch({ type: "decide", status: "rejected" })} aria-keyshortcuts="X" style={button(C.red)}><span aria-hidden="true">✕</span>Reject</button>
        <button onClick={() => dispatch({ type: "step", dir: 1 })} aria-keyshortcuts="S" style={button(C.white)}><span aria-hidden="true">→</span>Later</button>
      </div>
    )}
  </article>
);

const Row = ({ conn, children, mobile }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: SPACE.md, flexWrap: mobile ? "wrap" : "nowrap",
    background: white(0.02), border: `1px solid ${white(0.07)}`, borderRadius: 12,
    padding: mobile ? `${SPACE.sm + 2}px ${SPACE.md}px` : `${SPACE.sm + 2}px ${SPACE.lg}px`,
  }}>
    <span style={{ flex: mobile ? "1 1 100%" : 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
      <Pair conn={conn} />
      <span style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.55) }}>“{conn.label}”{conn.status === "edited" ? ` (was “${conn.originalLabel}”)` : ""}</span>
    </span>
    {children}
  </div>
);

const AddForm = ({ items, dispatch, onClose }) => {
  const [draft, setDraft] = useState({ from: "", to: "", label: "" });
  const [tried, setTried] = useState(false);
  const problem = addProblem(items, draft);
  const set = (k) => (e) => setDraft(d => ({ ...d, [k]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    setTried(true);
    if (!problem) { dispatch({ type: "add", ...draft }); onClose(); }
  };
  return (
    <form onSubmit={submit} aria-label="Add a connection" style={{ background: alpha(C.purple, 0.05), border: `1px solid ${alpha(C.purple, 0.25)}`, borderRadius: 14, padding: SPACE.lg, display: "flex", flexDirection: "column", gap: SPACE.md }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: SPACE.md }}>
        {[["from", "From topic"], ["to", "To topic"]].map(([k, text]) => (
          <label key={k} style={{ display: "flex", flexDirection: "column", gap: SPACE.xs, fontFamily: BODY, fontSize: TYPE.sm, color: white(0.6) }}>
            {text}
            <select value={draft[k]} onChange={set(k)} style={field}>
              <option value="" style={{ background: C.navy }}>Choose…</option>
              {TOPICS.map(t => <option key={t.id} value={t.id} style={{ background: C.navy }}>{t.name}</option>)}
            </select>
          </label>
        ))}
      </div>
      <label style={{ display: "flex", flexDirection: "column", gap: SPACE.xs, fontFamily: BODY, fontSize: TYPE.sm, color: white(0.6) }}>
        What connects them
        <input value={draft.label} onChange={set("label")} placeholder="Shared tech stack" style={field} />
      </label>
      {tried && problem && <p role="alert" style={{ margin: 0, fontFamily: BODY, fontSize: TYPE.sm, color: C.red }}>{problem}</p>}
      <span style={{ display: "flex", gap: SPACE.sm }}>
        <button type="submit" style={button(C.purple, true)}>Add connection</button>
        <button type="button" onClick={onClose} style={button(C.white)}>Cancel</button>
      </span>
    </form>
  );
};

const undoButton = { fontFamily: BODY, fontSize: TYPE.sm, color: white(0.6), background: "none", border: `1px solid ${white(0.12)}`, borderRadius: 8, padding: `${SPACE.xs}px ${SPACE.md}px`, cursor: "pointer", flexShrink: 0 };

// ─── The view ───────────────────────────────────────────────────
const ConnectionValidation = ({ onComplete, onNavigate, mobile, w }) => {
  const [state, dispatch] = useReducer(connectionsReducer, undefined, initialState);
  const [adding, setAdding] = useState(false);
  const { items, editing } = state;
  const stats = summarize(items);
  const active = activeItem(state);
  const pending = pendingOf(items);
  const decided = items.filter(i => i.status !== "pending");
  const wide = !mobile && w >= 1024;
  const hasPending = stats.pending > 0;

  // Shortcuts go through the reducer; off while a form has focus or nothing waits.
  useEffect(() => {
    if (!hasPending) return undefined;
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const action = KEY_ACTIONS[e.key.toLowerCase()];
      if (!action) return;
      e.preventDefault();
      dispatch(action);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hasPending]);

  const pct = Math.round((stats.decided / stats.total) * 100);

  return (
    <div style={screen(mobile)}>
      <style>{CSS}</style>
      <main style={{ maxWidth: 1100, width: "100%", margin: "0 auto" }}>
        <CurationHeader
          view="connectionValidation" title="Check the" accent="connections" onNavigate={onNavigate} mobile={mobile}
          lede={`Atlas linked your topics in ${CONNECTIONS.length} places. Confirm the links that are real, relabel the ones it named badly, reject the rest, and add any it missed.`}
        />

        <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Connections with a decision" style={{ marginBottom: SPACE.xl }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: SPACE.sm, fontFamily: MONO, fontSize: TYPE.xs }}>
            <span style={{ color: white(0.55) }}>{stats.decided} of {stats.total} decided · {stats.pending} waiting</span>
            <span style={{ color: hasPending ? C.gold : C.green }}>{pct}%</span>
          </div>
          <div style={{ width: "100%", height: 6, background: white(0.05), borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: hasPending ? C.gold : C.green, borderRadius: 3, transition: "width 0.4s ease" }} />
          </div>
        </div>

        <section aria-labelledby="cv-now" style={{ display: "grid", gridTemplateColumns: wide ? "400px 1fr" : "1fr", gap: SPACE.xl, alignItems: "start", marginBottom: SPACE.xxl }}>
          <div style={{ background: white(0.02), border: `1px solid ${white(0.07)}`, borderRadius: 14, padding: SPACE.lg }}>
            <Graph items={items} active={active} stats={stats} />
          </div>
          <div>
            <h2 id="cv-now" style={sectionTitle}>{active ? "Now reviewing" : "All reviewed"}</h2>
            {active
              ? <ActiveCard key={active.id} conn={active} position={pending.indexOf(active) + 1} pendingCount={pending.length} editing={editing} dispatch={dispatch} mobile={mobile} wide={wide} />
              : (
                <div role="status" style={{ padding: SPACE.xl, background: alpha(C.green, 0.05), border: `1px solid ${alpha(C.green, 0.2)}`, borderRadius: 14 }}>
                  <p style={{ margin: `0 0 ${SPACE.lg}px`, fontFamily: BODY, fontSize: 15, color: white(0.8), lineHeight: 1.5 }}>
                    Every connection has a decision: {stats.confirmed} confirmed, {stats.edited} relabeled, {stats.rejected} rejected{stats.added ? `, ${stats.added} of them added by you` : ""}.
                  </p>
                  <button onClick={onComplete} style={{ ...button(C.gold, true), display: "inline-flex", fontSize: 15 }}>Next: review insights →</button>
                </div>
              )}
          </div>
        </section>

        {pending.length > 1 && (
          <section aria-labelledby="cv-waiting" style={{ marginBottom: SPACE.xxl }}>
            <h2 id="cv-waiting" style={sectionTitle}>Also waiting ({pending.length - 1})</h2>
            <ol aria-label="Also waiting" style={list}>
              {pending.filter(c => c.id !== active?.id).map(c => (
                <li key={c.id}>
                  <Row conn={c} mobile={mobile}>
                    <Strength value={c.strength} />
                    <button onClick={() => dispatch({ type: "open", id: c.id })} aria-label={`Review ${TOPIC_BY_ID[c.from]?.name} and ${TOPIC_BY_ID[c.to]?.name}`} style={undoButton}>Review</button>
                  </Row>
                </li>
              ))}
            </ol>
          </section>
        )}

        {decided.length > 0 && (
          <section aria-labelledby="cv-decided" style={{ marginBottom: SPACE.xxl }}>
            <h2 id="cv-decided" style={sectionTitle}>Your decisions ({decided.length})</h2>
            <ol aria-label="Your decisions" style={list}>
              {decided.map(c => (
                <li key={c.id}>
                  <Row conn={c} mobile={mobile}>
                    <span style={{ fontFamily: MONO, fontSize: TYPE.xs, color: STATUS[c.status].color, textTransform: "uppercase" }}>{c.added ? "Added" : STATUS[c.status].label}</span>
                    <button onClick={() => dispatch({ type: "undo", id: c.id })} aria-label={c.added ? `Remove the connection you added between ${TOPIC_BY_ID[c.from]?.name} and ${TOPIC_BY_ID[c.to]?.name}` : `Undo: review ${TOPIC_BY_ID[c.from]?.name} and ${TOPIC_BY_ID[c.to]?.name} again`} style={undoButton}>{c.added ? "Remove" : "Undo"}</button>
                  </Row>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section aria-labelledby="cv-add" style={{ marginBottom: SPACE.xxl }}>
          <h2 id="cv-add" style={sectionTitle}>Missing a link?</h2>
          {adding
            ? <AddForm items={items} dispatch={dispatch} onClose={() => setAdding(false)} />
            : <button onClick={() => setAdding(true)} style={{ ...button(C.purple), width: "100%", borderStyle: "dashed" }}>+ Add a connection Atlas missed</button>}
        </section>

        <footer style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: SPACE.lg, flexWrap: "wrap", paddingTop: SPACE.xl, borderTop: `1px solid ${white(0.06)}` }}>
          <KeyHints keys={SHORTCUTS} mobile={mobile} />
          {hasPending && (
            <div style={{ display: "flex", alignItems: "center", gap: SPACE.md, flexWrap: "wrap" }}>
              <button onClick={() => dispatch({ type: "confirmRest" })} style={button(C.green)}>Confirm the {stats.pending} waiting</button>
              <button onClick={onComplete} style={button(C.white)}>Continue to insights →</button>
            </div>
          )}
        </footer>
      </main>
    </div>
  );
};

export default ConnectionValidation;
