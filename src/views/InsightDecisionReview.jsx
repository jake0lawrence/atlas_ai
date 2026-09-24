import { useState, useEffect, useReducer } from "react";
import { TOPICS, INSIGHT_DECISIONS, PAST_ANALOGIES } from '../data/constants';
import { CSS } from '../styles/base';
import { screen } from '../styles/shared';
import { C, alpha, white, BODY, MONO, SPACE, TYPE } from '../styles/tokens';
import PastPerspectivePanel from '../components/PastPerspectivePanel';
import { CurationHeader, KeyHints } from '../components/CurationChrome';

// ─── The insights, as data ──────────────────────────────────────
const TOPIC_BY_ID = Object.fromEntries(TOPICS.map(t => [t.id, t]));
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "2024-09-15" -> "Sep 15, 2024", without a Date, so no time zone can move it a day.
export const formatDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
};

const dayNumber = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86400000;
};

// Where each insight sits on the strip, 0-100 by date, oldest at 0.
export const timelinePositions = (items) => {
  const days = items.map(i => dayNumber(i.date));
  const min = Math.min(...days);
  const span = Math.max(...days) - min || 1;
  return Object.fromEntries(items.map((i, k) => [i.id, Math.round(((days[k] - min) / span) * 1000) / 10]));
};

export const hasPastPerspective = (id) => PAST_ANALOGIES.some(a => a.triggerDecisionId === id);

export const initialState = () => ({
  items: INSIGHT_DECISIONS.map(d => ({ ...d, status: "pending", humanEdit: null })),
  activeId: null, editing: false, showPast: false,
});

const pendingOf = (items) => items.filter(i => i.status === "pending");

export const activeItem = ({ items, activeId }) => {
  const pending = pendingOf(items);
  return pending.find(i => i.id === activeId) || pending[0] || null;
};

export const nextPending = (items, fromId, dir = 1) => {
  const pending = pendingOf(items);
  if (pending.length === 0) return null;
  const at = pending.findIndex(i => i.id === fromId);
  if (at < 0) return pending[0];
  return pending[(at + dir + pending.length) % pending.length];
};

export const summarize = (items) => {
  const count = (s) => items.filter(i => i.status === s).length;
  const kept = count("correct") + count("edited");
  return { total: items.length, pending: count("pending"), decided: items.length - count("pending"), correct: count("correct"), edited: count("edited"), rejected: count("rejected"), kept };
};

// Every change goes through here, so the keys and the buttons act on the same insight.
export const insightsReducer = (state, action) => {
  const active = activeItem(state);
  const decide = (status, humanEdit = null) => {
    const next = nextPending(state.items, active.id);
    return {
      items: state.items.map(i => i.id === active.id ? { ...i, status, humanEdit } : i),
      activeId: next && next.id !== active.id ? next.id : null,
      editing: false, showPast: false,
    };
  };
  switch (action.type) {
    case "decide":
      return active ? decide(action.status) : state;
    case "rewrite": {
      const text = action.text.trim();
      if (!active || !text) return state;
      return text === active.aiProposal ? decide("correct") : decide("edited", text);
    }
    case "step":
      return active ? { ...state, activeId: nextPending(state.items, active.id, action.dir)?.id ?? null, editing: false, showPast: false } : state;
    case "open":
      return { ...state, activeId: action.id, editing: false, showPast: false };
    case "toggleEdit":
      return active ? { ...state, editing: !state.editing } : state;
    case "closeEdit":
      return state.editing ? { ...state, editing: false } : state;
    case "togglePast":
      return active && hasPastPerspective(active.id) ? { ...state, showPast: !state.showPast } : state;
    case "undo":
      return { ...state, activeId: action.id, editing: false, showPast: false, items: state.items.map(i => i.id === action.id ? { ...i, status: "pending", humanEdit: null } : i) };
    case "keepRest":
      return { ...state, activeId: null, editing: false, showPast: false, items: state.items.map(i => i.status === "pending" ? { ...i, status: "correct" } : i) };
    default:
      return state;
  }
};

const TYPES = {
  decision: { label: "Decision", color: C.red, icon: "🎯" },
  pivot: { label: "Pivot", color: C.purple, icon: "↩" },
  milestone: { label: "Milestone", color: C.amber, icon: "🏆" },
};

const STATUS = {
  correct: { label: "Kept", color: C.green },
  edited: { label: "Kept, rewritten", color: C.blue },
  rejected: { label: "Dismissed", color: C.red },
};

const KEY_ACTIONS = {
  a: { type: "decide", status: "correct" },
  x: { type: "decide", status: "rejected" },
  e: { type: "toggleEdit" },
  s: { type: "step", dir: 1 },
  arrowright: { type: "step", dir: 1 },
  arrowleft: { type: "step", dir: -1 },
  escape: { type: "closeEdit" },
};

const SHORTCUTS = [["A", "keep"], ["E", "rewrite"], ["X", "dismiss"], ["S", "later"], ["← →", "previous / next"]];

// ─── Pieces ─────────────────────────────────────────────────────
const sectionTitle = { fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 600, color: white(0.55), textTransform: "uppercase", letterSpacing: "0.08em", margin: `0 0 ${SPACE.md}px` };
const label = { fontFamily: BODY, fontSize: TYPE.xs, fontWeight: 600, color: white(0.45), textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: SPACE.sm };
const list = { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: SPACE.sm };
const hidden = { position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" };

const button = (color, primary) => ({
  display: "flex", alignItems: "center", justifyContent: "center", gap: SPACE.sm,
  padding: `${SPACE.sm + 2}px ${SPACE.lg}px`, fontFamily: BODY, fontSize: TYPE.base, fontWeight: 600,
  color: primary ? C.bg0 : color, background: primary ? color : alpha(color, 0.07),
  border: `1px solid ${primary ? color : alpha(color, 0.3)}`, borderRadius: 10, cursor: "pointer",
});

const smallButton = { fontFamily: BODY, fontSize: TYPE.sm, color: white(0.65), background: "none", border: `1px solid ${white(0.14)}`, borderRadius: 8, padding: `${SPACE.xs}px ${SPACE.md}px`, cursor: "pointer", flexShrink: 0 };

const TypeBadge = ({ type }) => {
  const t = TYPES[type];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.xs, padding: `2px ${SPACE.sm + 2}px`, borderRadius: 12, background: alpha(t.color, 0.12), border: `1px solid ${alpha(t.color, 0.35)}`, fontFamily: MONO, fontSize: TYPE.xs, fontWeight: 600, color: t.color }}>
      <span aria-hidden="true">{t.icon}</span>{t.label}
    </span>
  );
};

const TopicTag = ({ id }) => {
  const t = TOPIC_BY_ID[id];
  return <span style={{ fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 600, color: t?.color }}><span aria-hidden="true">{t?.icon} </span>{t?.name}</span>;
};

// The timeline being built: every insight at its date, marked by decision.
const Strip = ({ items, active, dispatch, mobile }) => {
  const pos = timelinePositions(items);
  const first = [...items].sort((a, b) => a.date.localeCompare(b.date))[0];
  const last = [...items].sort((a, b) => b.date.localeCompare(a.date))[0];
  return (
    <figure style={{ margin: `0 0 ${SPACE.xxl}px`, background: white(0.02), border: `1px solid ${white(0.07)}`, borderRadius: 14, padding: `${SPACE.lg}px ${mobile ? SPACE.lg : SPACE.xl}px ${SPACE.md}px` }}>
      <figcaption style={{ ...label, marginBottom: SPACE.lg }}>What goes on your Evolution timeline</figcaption>
      <ol aria-label="Insights by date" style={{ listStyle: "none", margin: 0, padding: 0, position: "relative", height: 44 }}>
        <li aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, top: 21, height: 2, background: white(0.12), borderRadius: 1 }} />
        {items.map(i => {
          const t = TYPES[i.type];
          const isActive = i.id === active?.id;
          const rejected = i.status === "rejected";
          const kept = i.status === "correct" || i.status === "edited";
          const size = isActive ? 22 : 16;
          return (
            <li key={i.id} style={{ position: "absolute", left: `${pos[i.id]}%`, top: 22, transform: "translate(-50%, -50%)" }}>
              <button
                onClick={() => (i.status === "pending" ? dispatch({ type: "open", id: i.id }) : dispatch({ type: "undo", id: i.id }))}
                aria-label={`${t.label}, ${TOPIC_BY_ID[i.topicId]?.name}, ${formatDate(i.date)}: ${i.status === "pending" ? "waiting" : STATUS[i.status].label}${isActive ? ", on screen" : ""}. ${i.status === "pending" ? "Review it" : "Undo and review it again"}.`}
                aria-current={isActive ? "true" : undefined}
                style={{
                  width: size, height: size, borderRadius: "50%", padding: 0, cursor: "pointer", display: "block",
                  background: kept ? t.color : rejected ? C.bg0 : alpha(t.color, 0.2),
                  border: `2px solid ${rejected ? alpha(C.red, 0.7) : t.color}`,
                  boxShadow: isActive ? `0 0 0 3px ${C.bg0}, 0 0 0 5px ${C.gold}` : "none",
                  opacity: rejected ? 0.6 : 1,
                }}
              />
            </li>
          );
        })}
      </ol>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: SPACE.xs, fontFamily: MONO, fontSize: TYPE.xs, color: white(0.5) }}>
        <span>{formatDate(first.date)}</span><span>{formatDate(last.date)}</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: `${SPACE.xs}px ${SPACE.lg}px`, marginTop: SPACE.md, fontFamily: BODY, fontSize: TYPE.xs, color: white(0.55) }}>
        {Object.entries(TYPES).map(([k, t]) => (
          <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: SPACE.xs }}><span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: "50%", background: t.color }} />{t.label}</span>
        ))}
        <span>Filled: kept · Hollow: waiting · Faded: dismissed</span>
      </div>
    </figure>
  );
};

const RewriteForm = ({ item, dispatch, mobile }) => {
  const [text, setText] = useState(item.aiProposal);
  return (
    <form onSubmit={e => { e.preventDefault(); dispatch({ type: "rewrite", text }); }} style={{ display: "flex", flexDirection: "column", gap: SPACE.sm }}>
      <label>
        <span style={hidden}>Rewrite this insight</span>
        <textarea value={text} onChange={e => setText(e.target.value)} autoFocus rows={3}
          onKeyDown={e => {
            if (e.key === "Escape") { e.stopPropagation(); dispatch({ type: "closeEdit" }); }
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); dispatch({ type: "rewrite", text }); }
          }}
          style={{ width: "100%", boxSizing: "border-box", fontFamily: BODY, fontSize: mobile ? 15 : 17, color: C.white, lineHeight: 1.5, background: white(0.06), border: `1px solid ${white(0.2)}`, borderRadius: 10, padding: `${SPACE.md}px ${SPACE.md + 2}px`, resize: "vertical" }} />
      </label>
      <span style={{ display: "flex", gap: SPACE.sm, alignItems: "center", flexWrap: "wrap" }}>
        <button type="submit" style={button(C.blue, true)}>Save and keep</button>
        <button type="button" onClick={() => dispatch({ type: "closeEdit" })} style={button(C.white)}>Cancel</button>
        {!mobile && <span style={{ fontFamily: BODY, fontSize: TYPE.xs, color: white(0.5) }}>Enter saves, Shift+Enter adds a line</span>}
      </span>
    </form>
  );
};

const ActiveCard = ({ item, position, pendingCount, editing, showPast, dispatch, mobile, wide }) => (
  <article aria-label={`Reviewing: ${TYPES[item.type].label}, ${TOPIC_BY_ID[item.topicId]?.name}`} style={{
    background: white(0.035), border: `1px solid ${alpha(C.gold, 0.35)}`, borderRadius: 14,
    padding: mobile ? SPACE.lg : SPACE.xl, display: "flex", flexDirection: "column", gap: SPACE.lg,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: SPACE.md, flexWrap: "wrap" }}>
      <TypeBadge type={item.type} />
      <TopicTag id={item.topicId} />
      <span style={{ fontFamily: MONO, fontSize: TYPE.xs, color: white(0.5) }}>{formatDate(item.date)}</span>
      <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: TYPE.xs, color: white(0.45) }}>{position} of {pendingCount} waiting</span>
    </div>

    <div>
      <div style={label}>Atlas's reading</div>
      {editing
        ? <RewriteForm item={item} dispatch={dispatch} mobile={mobile} />
        : <p style={{ margin: 0, fontFamily: BODY, fontSize: mobile ? 16 : 19, fontWeight: 500, color: white(0.9), lineHeight: 1.5 }}>{item.aiProposal}</p>}
    </div>

    <div>
      <div style={label}>Where it came from</div>
      <div style={{ background: white(0.025), border: `1px solid ${white(0.07)}`, borderRadius: 10, padding: `${SPACE.md}px ${SPACE.lg}px`, display: "flex", flexDirection: "column", gap: SPACE.sm }}>
        <p style={{ margin: 0, fontFamily: BODY, fontSize: TYPE.base, color: white(0.7), lineHeight: 1.5 }}><span style={{ fontFamily: MONO, fontSize: TYPE.xs, fontWeight: 600, color: C.blue, marginRight: SPACE.sm }}>YOU</span>{item.sourceSnippet.user}</p>
        <p style={{ margin: 0, fontFamily: BODY, fontSize: TYPE.base, color: white(0.6), lineHeight: 1.5 }}><span style={{ fontFamily: MONO, fontSize: TYPE.xs, fontWeight: 600, color: C.gold, marginRight: SPACE.sm }}>AI</span>{item.sourceSnippet.ai}</p>
        <span style={{ fontFamily: MONO, fontSize: TYPE.xs, color: white(0.45) }}>{item.sourceRef}</span>
      </div>
    </div>

    {hasPastPerspective(item.id) && !editing && (
      <div>
        <button onClick={() => dispatch({ type: "togglePast" })} aria-expanded={showPast} style={{ ...button(C.purple), width: "100%", justifyContent: "flex-start" }}>
          <span aria-hidden="true">🪞</span>What did past-you decide in a similar spot?
          <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: TYPE.xs }}>{showPast ? "hide" : "show"}</span>
        </button>
        {showPast && <PastPerspectivePanel decisionId={item.id} mobile={mobile} onClose={() => dispatch({ type: "togglePast" })} />}
      </div>
    )}

    {!editing && (
      <div role="group" aria-label="Your call" style={{ display: "grid", gridTemplateColumns: wide ? "repeat(4, 1fr)" : "1fr 1fr", gap: SPACE.sm }}>
        <button onClick={() => dispatch({ type: "decide", status: "correct" })} aria-keyshortcuts="A" style={button(C.green, true)}><span aria-hidden="true">✓</span>It happened</button>
        <button onClick={() => dispatch({ type: "toggleEdit" })} aria-keyshortcuts="E" style={button(C.blue)}><span aria-hidden="true">✎</span>Rewrite…</button>
        <button onClick={() => dispatch({ type: "decide", status: "rejected" })} aria-keyshortcuts="X" style={button(C.red)}><span aria-hidden="true">✕</span>Not a real {TYPES[item.type].label.toLowerCase()}</button>
        <button onClick={() => dispatch({ type: "step", dir: 1 })} aria-keyshortcuts="S" style={button(C.white)}><span aria-hidden="true">→</span>Later</button>
      </div>
    )}
  </article>
);

const DecidedRow = ({ item, dispatch, mobile }) => {
  const s = STATUS[item.status];
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: SPACE.md, flexWrap: mobile ? "wrap" : "nowrap", background: white(0.02), border: `1px solid ${white(0.07)}`, borderRadius: 12, padding: `${SPACE.md}px ${mobile ? SPACE.md : SPACE.lg}px` }}>
      <span style={{ flex: mobile ? "1 1 100%" : 1, minWidth: 0, display: "flex", flexDirection: "column", gap: SPACE.xs }}>
        <span style={{ display: "flex", alignItems: "center", gap: SPACE.sm, flexWrap: "wrap" }}>
          <TypeBadge type={item.type} /><TopicTag id={item.topicId} />
          <span style={{ fontFamily: MONO, fontSize: TYPE.xs, color: white(0.5) }}>{formatDate(item.date)}</span>
        </span>
        <span style={{ fontFamily: BODY, fontSize: TYPE.base, color: item.status === "rejected" ? white(0.5) : white(0.8), lineHeight: 1.5 }}>{item.humanEdit || item.aiProposal}</span>
        {item.status === "edited" && <span style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.5), lineHeight: 1.5 }}>Atlas had: <s>{item.aiProposal}</s></span>}
      </span>
      <span style={{ fontFamily: MONO, fontSize: TYPE.xs, color: s.color, textTransform: "uppercase", paddingTop: 3 }}>{s.label}</span>
      <button onClick={() => dispatch({ type: "undo", id: item.id })} aria-label={`Undo: review the ${TYPES[item.type].label.toLowerCase()} from ${formatDate(item.date)} again`} style={smallButton}>Undo</button>
    </div>
  );
};

// ─── The view ───────────────────────────────────────────────────
const InsightDecisionReview = ({ onComplete, onNavigate, mobile, w }) => {
  const [state, dispatch] = useReducer(insightsReducer, undefined, initialState);
  const { items, editing, showPast } = state;
  const stats = summarize(items);
  const active = activeItem(state);
  const pending = pendingOf(items);
  const decided = items.filter(i => i.status !== "pending").sort((a, b) => a.date.localeCompare(b.date));
  const wide = !mobile && w >= 1024;
  const hasPending = stats.pending > 0;

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

  return (
    <div style={screen(mobile)}>
      <style>{CSS}</style>
      <main style={{ maxWidth: 1100, width: "100%", margin: "0 auto" }}>
        <CurationHeader
          view="insightReview" title="Confirm the" accent="turning points" onNavigate={onNavigate} mobile={mobile}
          lede={`Atlas pulled ${stats.total} decisions, pivots and milestones out of your conversations. The ones you keep go on your Evolution timeline, so check that each happened the way it says.`}
        />

        <Strip items={items} active={active} dispatch={dispatch} mobile={mobile} />

        <section aria-labelledby="ir-now" style={{ marginBottom: SPACE.xxl, maxWidth: 860 }}>
          <h2 id="ir-now" style={sectionTitle}>{active ? "Now reviewing" : "All reviewed"}</h2>
          {active
            ? <ActiveCard key={active.id} item={active} position={pending.indexOf(active) + 1} pendingCount={pending.length} editing={editing} showPast={showPast} dispatch={dispatch} mobile={mobile} wide={wide} />
            : (
              <div role="status" style={{ padding: SPACE.xl, background: alpha(C.green, 0.05), border: `1px solid ${alpha(C.green, 0.2)}`, borderRadius: 14 }}>
                <p style={{ margin: `0 0 ${SPACE.lg}px`, fontFamily: BODY, fontSize: 15, color: white(0.8), lineHeight: 1.5 }}>
                  {stats.kept} {stats.kept === 1 ? "turning point goes" : "turning points go"} on your timeline ({stats.edited} in your words), and {stats.rejected} {stats.rejected === 1 ? "was" : "were"} dismissed.
                </p>
                <button onClick={() => onComplete(stats)} style={{ ...button(C.gold, true), display: "inline-flex", fontSize: 15 }}>Next: see the summary →</button>
              </div>
            )}
        </section>

        {decided.length > 0 && (
          <section aria-labelledby="ir-decided" style={{ marginBottom: SPACE.xxl }}>
            <h2 id="ir-decided" style={sectionTitle}>Your decisions, by date ({decided.length})</h2>
            <ol aria-label="Your decisions" style={list}>
              {decided.map(i => <li key={i.id}><DecidedRow item={i} dispatch={dispatch} mobile={mobile} /></li>)}
            </ol>
          </section>
        )}

        <footer style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: SPACE.lg, flexWrap: "wrap", paddingTop: SPACE.xl, borderTop: `1px solid ${white(0.06)}` }}>
          <KeyHints keys={SHORTCUTS} mobile={mobile} />
          {hasPending && (
            <div style={{ display: "flex", alignItems: "center", gap: SPACE.md, flexWrap: "wrap" }}>
              <button onClick={() => dispatch({ type: "keepRest" })} style={button(C.green)}>Keep the {stats.pending} waiting</button>
              <button onClick={() => onComplete(stats)} style={button(C.white)}>Continue to the summary →</button>
            </div>
          )}
        </footer>
      </main>
    </div>
  );
};

export default InsightDecisionReview;
