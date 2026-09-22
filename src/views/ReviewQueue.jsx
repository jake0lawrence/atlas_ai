import { useState, useEffect, useRef, useReducer } from "react";
import { TOPICS, REVIEW_QUEUE_DATA } from '../data/constants';
import useSound from '../hooks/useSound';
import { CSS } from '../styles/base';
import { screen } from '../styles/shared';
import { C, alpha, white, FONTS, BODY, MONO, SPACE, TYPE } from '../styles/tokens';
import ConfidenceBadge from '../components/ConfidenceBadge';
import { CurationHeader, KeyHints } from '../components/CurationChrome';

// ─── The queue, as data ─────────────────────────────────────────
// Classifications at or above this confidence are approved without asking;
// they stay listed (and undoable) under "Approved automatically".
export const AUTO_APPROVE_AT = 90;

const TOPIC_BY_ID = Object.fromEntries(TOPICS.map(t => [t.id, t]));

export const initialQueue = (data = REVIEW_QUEUE_DATA) => data.map(item => ({
  ...item,
  originalTopicId: item.topicId,
  status: item.confidence >= AUTO_APPROVE_AT ? "auto" : "pending",
}));

export const summarize = (items) => {
  const count = (s) => items.filter(i => i.status === s).length;
  const pending = count("pending");
  return {
    total: items.length, pending, decided: items.length - pending,
    auto: count("auto"), approved: count("approved"), edited: count("edited"), rejected: count("rejected"),
  };
};

// The pending item after (dir 1) or before (dir -1) `fromId`, wrapping; the
// first pending item when `fromId` is not pending; null when none are.
export const nextPending = (items, fromId, dir = 1) => {
  const pending = items.filter(i => i.status === "pending");
  if (pending.length === 0) return null;
  const at = pending.findIndex(i => i.id === fromId);
  if (at < 0) return pending[0];
  return pending[(at + dir + pending.length) % pending.length];
};

// The item on screen: the chosen one while it is still pending, else the first pending.
export const activeItem = ({ items, activeId }) => {
  const pending = items.filter(i => i.status === "pending");
  return pending.find(i => i.id === activeId) || pending[0] || null;
};

export const initialState = () => ({ items: initialQueue(), activeId: null, moving: false });

// Every change to the queue goes through here, so the keyboard and the
// buttons cannot disagree about which item they act on.
export const queueReducer = (state, action) => {
  const active = activeItem(state);
  switch (action.type) {
    case "decide": {
      if (!active) return state;
      const next = nextPending(state.items, active.id);
      return {
        items: state.items.map(i => i.id === active.id ? { ...i, status: action.status, topicId: action.topicId ?? i.topicId } : i),
        activeId: next && next.id !== active.id ? next.id : null,
        moving: false,
      };
    }
    case "step":
      return active ? { ...state, activeId: nextPending(state.items, active.id, action.dir)?.id ?? null, moving: false } : state;
    case "open":
      return { ...state, activeId: action.id, moving: false };
    case "undo":
      return { items: state.items.map(i => i.id === action.id ? { ...i, status: "pending", topicId: i.originalTopicId } : i), activeId: action.id, moving: false };
    case "toggleMove":
      return active ? { ...state, moving: !state.moving } : state;
    case "closeMove":
      return state.moving ? { ...state, moving: false } : state;
    default:
      return state;
  }
};

const KEY_ACTIONS = {
  a: { type: "decide", status: "approved" },
  x: { type: "decide", status: "rejected" },
  e: { type: "toggleMove" },
  s: { type: "step", dir: 1 },
  arrowdown: { type: "step", dir: 1 },
  arrowup: { type: "step", dir: -1 },
  escape: { type: "closeMove" },
};

const STATUS = {
  auto: { label: "Auto-approved", color: C.green },
  approved: { label: "Approved", color: C.green },
  edited: { label: "Moved", color: C.blue },
  rejected: { label: "Rejected", color: C.red },
};

const SHORTCUTS = [["A", "approve"], ["E", "move"], ["X", "reject"], ["S", "later"], ["↑ ↓", "previous / next"]];

// ─── Pieces ─────────────────────────────────────────────────────
const sectionTitle = { fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 600, color: white(0.55), textTransform: "uppercase", letterSpacing: "0.08em", margin: `0 0 ${SPACE.md}px` };
const label = { fontFamily: BODY, fontSize: TYPE.xs, fontWeight: 600, color: white(0.45), textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: SPACE.sm };
const list = { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: SPACE.sm };

const TopicName = ({ topic, size = TYPE.base, color }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.sm, minWidth: 0 }}>
    <span aria-hidden="true" style={{ fontSize: size + 1, flexShrink: 0 }}>{topic?.icon}</span>
    <span style={{ fontFamily: BODY, fontSize: size, fontWeight: 600, color: color || white(0.75), overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{topic?.name}</span>
  </span>
);

const Bubble = ({ who, text, color, mobile }) => (
  <div style={{ background: alpha(color, 0.06), border: `1px solid ${alpha(color, 0.15)}`, borderRadius: 12, padding: mobile ? `${SPACE.sm + 2}px ${SPACE.md}px` : `${SPACE.md}px ${SPACE.lg}px` }}>
    <div style={{ fontFamily: MONO, fontSize: TYPE.xs, fontWeight: 600, color, marginBottom: SPACE.xs }}>{who}</div>
    <div style={{ fontFamily: BODY, fontSize: mobile ? TYPE.base : 14, color: white(0.75), lineHeight: 1.55 }}>{text}</div>
  </div>
);

const ActionButton = ({ onClick, color, icon, children, primary, pressed, keyHint }) => (
  <button onClick={onClick} aria-pressed={pressed} aria-keyshortcuts={keyHint} style={{
    display: "flex", alignItems: "center", justifyContent: "center", gap: SPACE.sm, width: "100%",
    padding: `${SPACE.sm + 3}px ${SPACE.lg}px`, fontFamily: BODY, fontSize: TYPE.base, fontWeight: 600,
    color: primary ? C.bg0 : color, background: primary ? color : alpha(color, pressed ? 0.16 : 0.07),
    border: `1px solid ${primary ? color : alpha(color, 0.3)}`, borderRadius: 10, cursor: "pointer",
  }}>
    <span aria-hidden="true" style={{ fontSize: 14, lineHeight: 1 }}>{icon}</span>
    {children}
  </button>
);

const MovePicker = ({ item, onMove, onCancel }) => (
  <div role="group" aria-label="Move to another topic" style={{ marginTop: SPACE.lg, paddingTop: SPACE.lg, borderTop: `1px solid ${white(0.06)}` }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: SPACE.md }}>
      <div style={label}>Move this conversation to</div>
      <button onClick={onCancel} style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.5), background: "none", border: "none", cursor: "pointer", padding: 0 }}>Cancel</button>
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: SPACE.sm }}>
      {TOPICS.filter(t => t.id !== item.topicId).map(t => (
        <button key={t.id} onClick={() => onMove(t.id)} style={{
          display: "inline-flex", alignItems: "center", gap: SPACE.xs + 2, fontFamily: BODY, fontSize: TYPE.sm, color: white(0.75),
          background: white(0.03), border: `1px solid ${white(0.1)}`, borderRadius: 16, padding: `${SPACE.xs + 1}px ${SPACE.md}px`, cursor: "pointer",
        }}>
          <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: "50%", background: t.color }} />
          {t.name}
        </button>
      ))}
    </div>
  </div>
);

const ActiveCard = ({ item, position, pendingCount, moving, onAction, onMoveToggle, onMove, mobile, tablet }) => {
  const topic = TOPIC_BY_ID[item.topicId];
  return (
    <article aria-label={`Reviewing: ${topic?.name}`} style={{
      background: white(0.035), border: `1px solid ${alpha(C.gold, 0.35)}`, borderRadius: 14,
      padding: mobile ? SPACE.lg : SPACE.xl,
    }}>
      <div style={{ fontFamily: MONO, fontSize: TYPE.xs, color: white(0.45), marginBottom: SPACE.md }}>
        {position} of {pendingCount} waiting
      </div>
      <div style={{
        display: mobile ? "flex" : "grid", flexDirection: "column",
        gridTemplateColumns: tablet ? "1fr 1.4fr" : "240px 1fr 180px",
        gap: mobile ? SPACE.lg : SPACE.xl,
      }}>
        <section aria-label="What Atlas decided">
          <div style={label}>Atlas filed it under</div>
          <div style={{ marginBottom: SPACE.xs }}><TopicName topic={topic} size={15} color={topic?.color} /></div>
          <div style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.45), marginBottom: SPACE.md }}>{topic?.count} conversations in this topic</div>
          <div style={{ marginBottom: SPACE.md }}><ConfidenceBadge confidence={item.confidence} /></div>
          <div style={label}>Entities it found</div>
          <ul aria-label="Entities" style={{ listStyle: "none", margin: `0 0 ${SPACE.md}px`, padding: 0, display: "flex", flexWrap: "wrap", gap: SPACE.xs }}>
            {item.entities.map(e => (
              <li key={e} style={{ fontFamily: MONO, fontSize: TYPE.xs, padding: "3px 8px", borderRadius: 6, background: white(0.04), border: `1px solid ${white(0.1)}`, color: white(0.65) }}>{e}</li>
            ))}
          </ul>
          {item.decisionFlag && (
            <div style={{ padding: `${SPACE.sm}px ${SPACE.md}px`, borderRadius: 8, background: alpha(C.red, 0.06), border: `1px solid ${alpha(C.red, 0.2)}` }}>
              <div style={{ fontFamily: BODY, fontSize: TYPE.xs, color: C.red, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Decision detected</div>
              <div style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.7), marginTop: 2 }}>{item.decisionText}</div>
            </div>
          )}
        </section>

        <section aria-label="Conversation excerpt">
          <div style={label}>From the conversation</div>
          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.sm }}>
            <Bubble who="YOU" text={item.snippet.user} color={C.blue} mobile={mobile} />
            <Bubble who="AI" text={item.snippet.ai} color={C.gold} mobile={mobile} />
          </div>
        </section>

        <section aria-label="Your call" style={tablet ? { gridColumn: "1 / -1" } : undefined}>
          <div style={label}>Your call</div>
          <div style={{ display: tablet ? "grid" : "flex", gridTemplateColumns: "repeat(4, 1fr)", flexDirection: "column", gap: SPACE.sm }}>
            <ActionButton primary color={C.green} icon="✓" keyHint="A" onClick={() => onAction("approved")}>Approve</ActionButton>
            <ActionButton color={C.blue} icon="↪" keyHint="E" pressed={moving} onClick={onMoveToggle}>Move…</ActionButton>
            <ActionButton color={C.red} icon="✕" keyHint="X" onClick={() => onAction("rejected")}>Reject</ActionButton>
            <ActionButton color={C.white} icon="→" keyHint="S" onClick={() => onAction("later")}>Later</ActionButton>
          </div>
        </section>
      </div>
      {moving && <MovePicker item={item} onMove={onMove} onCancel={onMoveToggle} />}
    </article>
  );
};

const PendingRow = ({ item, onOpen, mobile }) => {
  const topic = TOPIC_BY_ID[item.topicId];
  return (
    <button onClick={onOpen} aria-label={`Review ${topic?.name}, ${item.confidence}% confidence`} style={{
      display: "flex", alignItems: "center", gap: SPACE.md, width: "100%", textAlign: "left",
      background: white(0.02), border: `1px solid ${white(0.07)}`, borderRadius: 12,
      padding: mobile ? `${SPACE.sm + 2}px ${SPACE.md}px` : `${SPACE.md}px ${SPACE.lg + 2}px`, cursor: "pointer",
    }}>
      <span style={{ flex: 1, minWidth: 0, display: "flex" }}><TopicName topic={topic} /></span>
      <ConfidenceBadge confidence={item.confidence} />
    </button>
  );
};

const DecidedRow = ({ item, onUndo, mobile }) => {
  const topic = TOPIC_BY_ID[item.topicId];
  const was = item.topicId !== item.originalTopicId ? TOPIC_BY_ID[item.originalTopicId] : null;
  const s = STATUS[item.status];
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: SPACE.md, flexWrap: mobile ? "wrap" : "nowrap",
      background: white(0.015), border: `1px solid ${white(0.05)}`, borderRadius: 12,
      padding: mobile ? `${SPACE.sm + 2}px ${SPACE.md}px` : `${SPACE.sm + 2}px ${SPACE.lg + 2}px`,
    }}>
      <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
      <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
        <TopicName topic={topic} color={item.status === "rejected" ? white(0.45) : undefined} />
        {was && <span style={{ fontFamily: BODY, fontSize: TYPE.xs, color: white(0.45) }}>was {was.name}</span>}
      </span>
      <span style={{ fontFamily: MONO, fontSize: TYPE.xs, color: s.color, textTransform: "uppercase", flexShrink: 0 }}>{s.label} · {item.confidence}%</span>
      <button onClick={onUndo} aria-label={`Undo: review ${topic?.name} again`} style={{
        fontFamily: BODY, fontSize: TYPE.sm, color: white(0.6), background: "none", border: `1px solid ${white(0.12)}`,
        borderRadius: 8, padding: `${SPACE.xs}px ${SPACE.md}px`, cursor: "pointer", flexShrink: 0,
      }}>Undo</button>
    </div>
  );
};

const nextButton = (primary) => ({
  fontFamily: BODY, fontSize: primary ? 15 : TYPE.base, fontWeight: 600,
  color: primary ? C.bg0 : white(0.75), background: primary ? C.gold : white(0.04),
  border: `1px solid ${primary ? C.gold : white(0.12)}`, borderRadius: 10,
  padding: primary ? `${SPACE.md + 2}px ${SPACE.xxl}px` : `${SPACE.sm + 2}px ${SPACE.xl}px`, cursor: "pointer",
});

// ─── The view ───────────────────────────────────────────────────
const ReviewQueue = ({ onComplete, onNavigate, mobile, w }) => {
  const [state, dispatch] = useReducer(queueReducer, undefined, initialState);
  const [soundOn, setSoundOn] = useState(false);
  const sound = useSound();
  const wasPending = useRef(null);

  const { items, moving } = state;
  const tablet = !mobile && w < 1024;
  const stats = summarize(items);
  const pending = items.filter(i => i.status === "pending");
  const active = activeItem(state);
  const decided = items.filter(i => ["approved", "edited", "rejected"].includes(i.status));
  const autos = items.filter(i => i.status === "auto");
  const hasPending = stats.pending > 0;

  // One chime when the last pending item gets a decision (not on mount).
  useEffect(() => {
    if (wasPending.current > 0 && stats.pending === 0) sound.play("chime");
    wasPending.current = stats.pending;
  }, [stats.pending, sound]);

  // Shortcuts act on whatever the reducer considers active. With nothing
  // pending they are unbound, so the arrow keys scroll the page again.
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

  const act = (status, topicId) => dispatch(status === "later" ? { type: "step", dir: 1 } : { type: "decide", status, topicId });
  const onUndo = (id) => dispatch({ type: "undo", id });

  const pct = Math.round((stats.decided / stats.total) * 100);
  const lede = `Atlas sorted ${stats.total} conversations into topics. ${stats.auto} were ${AUTO_APPROVE_AT}% certain or better and are approved already; the other ${stats.total - stats.auto} are yours to check.`;

  return (
    <div style={screen(mobile)}>
      <style>{CSS}</style>
      <main style={{ maxWidth: 1100, width: "100%", margin: "0 auto" }}>
        <CurationHeader view="curation" title="Review" accent="the sorting" lede={lede} onNavigate={onNavigate} mobile={mobile} />

        <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Conversations with a decision" style={{ marginBottom: SPACE.xl }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: SPACE.sm, fontFamily: MONO, fontSize: TYPE.xs }}>
            <span style={{ color: white(0.55) }}>{stats.decided} of {stats.total} decided · {stats.pending} waiting</span>
            <span style={{ color: stats.pending === 0 ? C.green : C.gold }}>{pct}%</span>
          </div>
          <div style={{ width: "100%", height: 6, background: white(0.05), borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: stats.pending === 0 ? C.green : C.gold, borderRadius: 3, transition: "width 0.4s ease" }} />
          </div>
        </div>

        <section aria-labelledby="rq-waiting" style={{ marginBottom: SPACE.xxl }}>
          <h2 id="rq-waiting" style={sectionTitle}>Waiting for you ({stats.pending})</h2>
          {active ? (
            <ol aria-label="Waiting for review" style={list}>
              {pending.map(item => (
                <li key={item.id}>
                  {item.id === active.id
                    ? <ActiveCard item={item} position={pending.indexOf(item) + 1} pendingCount={pending.length} moving={moving}
                        onAction={act} onMoveToggle={() => dispatch({ type: "toggleMove" })} onMove={(topicId) => act("edited", topicId)} mobile={mobile} tablet={tablet} />
                    : <PendingRow item={item} onOpen={() => dispatch({ type: "open", id: item.id })} mobile={mobile} />}
                </li>
              ))}
            </ol>
          ) : (
            <div role="status" style={{ textAlign: "center", padding: mobile ? `${SPACE.xl}px ${SPACE.lg}px` : `${SPACE.xxl}px`, background: alpha(C.green, 0.05), border: `1px solid ${alpha(C.green, 0.2)}`, borderRadius: 14 }}>
              <div style={{ fontFamily: FONTS, fontSize: mobile ? TYPE.xl : TYPE.xxl, fontWeight: 700, color: C.green, marginBottom: SPACE.sm }}>The queue is clear</div>
              <p style={{ fontFamily: BODY, fontSize: 14, color: white(0.65), margin: `0 0 ${SPACE.xl}px` }}>
                {stats.approved} approved, {stats.edited} moved, {stats.rejected} rejected, and {stats.auto} approved automatically.
              </p>
              <button onClick={onComplete} style={nextButton(true)}>Next: curate topics →</button>
            </div>
          )}
        </section>

        {decided.length > 0 && (
          <section aria-labelledby="rq-decided" style={{ marginBottom: SPACE.xxl }}>
            <h2 id="rq-decided" style={sectionTitle}>Your decisions ({decided.length})</h2>
            <ol aria-label="Your decisions" style={list}>
              {decided.map(item => <li key={item.id}><DecidedRow item={item} mobile={mobile} onUndo={() => onUndo(item.id)} /></li>)}
            </ol>
          </section>
        )}

        {autos.length > 0 && (
          <section aria-labelledby="rq-auto" style={{ marginBottom: SPACE.xxl }}>
            <h2 id="rq-auto" style={sectionTitle}>Approved automatically ({autos.length})</h2>
            <p style={{ fontFamily: BODY, fontSize: TYPE.base, color: white(0.5), margin: `-${SPACE.xs}px 0 ${SPACE.md}px` }}>
              {AUTO_APPROVE_AT}% confidence or higher. Undo one to review it yourself.
            </p>
            <ol aria-label="Approved automatically" style={list}>
              {autos.map(item => <li key={item.id}><DecidedRow item={item} mobile={mobile} onUndo={() => onUndo(item.id)} /></li>)}
            </ol>
          </section>
        )}

        <footer style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: SPACE.lg, flexWrap: "wrap", paddingTop: SPACE.xl, borderTop: `1px solid ${white(0.06)}` }}>
          <KeyHints keys={SHORTCUTS} mobile={mobile}>
            <button onClick={() => setSoundOn(sound.toggle())} aria-pressed={soundOn} style={{
              fontFamily: BODY, fontSize: TYPE.xs, color: soundOn ? C.gold : white(0.5), background: "none",
              border: `1px solid ${soundOn ? alpha(C.gold, 0.35) : white(0.12)}`, borderRadius: 12, padding: `2px ${SPACE.sm + 2}px`, cursor: "pointer",
            }}>♪ Sound {soundOn ? "on" : "off"}</button>
          </KeyHints>
          {stats.pending > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: SPACE.md, flexWrap: "wrap" }}>
              <span style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.45) }}>Undecided ones keep Atlas's topic.</span>
              <button onClick={onComplete} style={nextButton(false)}>Continue to topics →</button>
            </div>
          )}
        </footer>
      </main>
    </div>
  );
};

export default ReviewQueue;
