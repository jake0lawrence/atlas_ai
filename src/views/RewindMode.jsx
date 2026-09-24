import { useState, useEffect, useRef } from "react";
import { TOPICS, CONNECTIONS, TIMELINE_DATA, MONTHLY_ACTIVITY, EVOLUTION_PHASES } from '../data/constants';
import { C, alpha, white, FONTS, BODY, MONO, SPACE, TYPE } from '../styles/tokens';
import { ringOrder, ringPositions } from './ConnectionsView';
import { phaseOf } from './EvolutionView';

// ─── The rewind, as data ────────────────────────────────────────
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "Jan 23" -> { key: "2023-01", label: "Jan 2023" }
export const monthOf = (short) => {
  const [m, y] = short.split(" ");
  return { key: `20${y}-${String(MON.indexOf(m) + 1).padStart(2, "0")}`, label: `${m} 20${y}` };
};

export const MONTHS = MONTHLY_ACTIVITY.map(a => ({ ...monthOf(a.month), conversations: a.gpt + a.claude }));

// Every timeline event, oldest first, with its topic and its index in that
// topic's timeline (the index a conversation link needs).
export const EVENTS = Object.entries(TIMELINE_DATA)
  .flatMap(([topicId, events]) => events.map((e, index) => ({ ...e, topicId, index, month: e.date.slice(0, 7) })))
  .sort((a, b) => a.date.localeCompare(b.date) || a.topicId.localeCompare(b.topicId));

// The last month the sample timeline has a milestone in. After it only the
// conversation counts are simulated, and the page says so.
export const LAST_MILESTONE = EVENTS.at(-1).month;

const topicsBy = (key) => {
  const counts = {};
  for (const e of EVENTS) if (e.month <= key) counts[e.topicId] = (counts[e.topicId] || 0) + 1;
  return counts;
};

// The map as it stood at the end of month `step`, and what that month added.
export const stateAt = (step) => {
  const m = MONTHS[step];
  const counts = topicsBy(m.key);
  const visible = new Set(Object.keys(counts));
  const before = step > 0 ? new Set(Object.keys(topicsBy(MONTHS[step - 1].key))) : new Set();
  const links = CONNECTIONS.filter(c => visible.has(c.from) && visible.has(c.to));
  return {
    month: m,
    counts,
    visible,
    newTopics: TOPICS.filter(t => visible.has(t.id) && !before.has(t.id)).map(t => t.id),
    links,
    newLinks: links.filter(c => !(before.has(c.from) && before.has(c.to))),
    events: EVENTS.filter(e => e.month === m.key),
    milestones: Object.values(counts).reduce((a, n) => a + n, 0),
    conversations: MONTHS.slice(0, step + 1).reduce((a, x) => a + x.conversations, 0),
    phase: phaseOf(m.label),
  };
};

const STATES = MONTHS.map((_, i) => stateAt(i));
const monthLabel = (key) => MONTHS.find(m => m.key === key)?.label ?? key;
const LAST = MONTHS.length - 1;
const POS = ringPositions(ringOrder());
const TOPIC_BY_ID = Object.fromEntries(TOPICS.map(t => [t.id, t]));
const FINAL_MAX = Math.max(...Object.values(STATES[LAST].counts));
const BUSIEST = Math.max(...STATES.map(s => s.events.length));
// Each phase's first month on the scrubber, so a phase button can jump there.
export const PHASE_STARTS = EVOLUTION_PHASES.map((_, i) => STATES.findIndex(s => s.phase === i));

const TYPE_LABEL = { research: "Research", problem: "Problem", build: "Build", decision: "Decision", idea: "Idea", milestone: "Milestone", pivot: "Pivot" };
const reducedMotion = () => Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
const TICK_MS = 1200;

// ─── Pieces ─────────────────────────────────────────────────────
const sectionTitle = { fontFamily: BODY, fontSize: TYPE.xs, fontWeight: 600, color: white(0.55), textTransform: "uppercase", letterSpacing: "0.08em", margin: `0 0 ${SPACE.sm}px` };
const list = { listStyle: "none", margin: 0, padding: 0 };
const chip = (color, on) => ({
  fontFamily: MONO, fontSize: TYPE.xs, fontWeight: on ? 700 : 500, color: on ? C.bg0 : white(0.7),
  background: on ? color : white(0.04), border: `1px solid ${on ? color : white(0.14)}`,
  borderRadius: 6, padding: `${SPACE.xs}px ${SPACE.sm + 2}px`, cursor: "pointer",
});

// The signature piece: the Connections ring, drawn as it stood that month.
// Topics not yet discussed hold their place as faint outlines; a topic or a
// link that arrived this month is ringed in the phase color.
const RingMap = ({ state, color, selected, onSelect, mobile, motion }) => {
  const fresh = new Set(state.newTopics);
  const ease = motion ? "all 0.6s cubic-bezier(0.16,1,0.3,1)" : "none";
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: mobile ? "1 / 1" : "4 / 3" }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {state.links.map(c => {
          const a = POS[c.from];
          const b = POS[c.to];
          const isNew = state.newLinks.includes(c);
          return (
            <line key={`${c.from}-${c.to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={isNew ? color : C.white} strokeOpacity={isNew ? 0.85 : 0.12 + c.strength * 0.2}
              strokeWidth={0.8 + c.strength * 2} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
          );
        })}
      </svg>
      {TOPICS.map(t => {
        const p = POS[t.id];
        const count = state.counts[t.id] || 0;
        const place = { position: "absolute", left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -50%)" };
        if (!count) {
          return <span key={t.id} aria-hidden="true" style={{ ...place, width: mobile ? 14 : 18, height: mobile ? 14 : 18, borderRadius: "50%", border: `1px dashed ${white(0.18)}` }} />;
        }
        const on = selected === t.id;
        const size = Math.round((mobile ? 22 : 28) + (count / FINAL_MAX) * (mobile ? 18 : 30));
        return (
          <button key={t.id} onClick={() => onSelect(on ? null : t.id)} aria-pressed={on}
            aria-label={`${t.name}: ${count} milestone${count === 1 ? "" : "s"} by ${state.month.label}${fresh.has(t.id) ? ", new this month" : ""}`}
            style={{ ...place, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
            <span aria-hidden="true" style={{
              width: size, height: size, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: Math.round(size * 0.42), background: on ? alpha(t.color, 0.35) : C.bg1, border: `2px solid ${t.color}`,
              boxShadow: fresh.has(t.id) ? `0 0 0 4px ${alpha(color, 0.45)}` : on ? `0 0 0 4px ${alpha(t.color, 0.25)}` : "none",
              transition: ease,
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

const Stat = ({ value, label, color }) => (
  <div style={{ minWidth: 0 }}>
    <div style={{ fontFamily: MONO, fontSize: TYPE.lg, fontWeight: 700, color }}>{value}</div>
    <div style={{ fontFamily: BODY, fontSize: TYPE.xs, color: white(0.6), marginTop: 2 }}>{label}</div>
  </div>
);

// What the month added: the milestones logged in it, the topics and links
// that first appeared. After the sample timeline ends, it says that instead.
const ThisMonth = ({ state }) => {
  const shown = state.events.slice(0, 6);
  const past = state.month.key > LAST_MILESTONE;
  return (
    <section aria-labelledby="rw-month">
      <h2 id="rw-month" style={sectionTitle}>{state.month.label}</h2>
      <p style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.7), lineHeight: 1.5, margin: `0 0 ${SPACE.md}px` }}>
        {MONTHS.find(m => m.key === state.month.key).conversations} conversations.
        {state.newTopics.length > 0 && <> New: {state.newTopics.map(id => TOPIC_BY_ID[id].name).join(", ")}.</>}
        {state.newLinks.length > 0 && <> {state.newLinks.length} new link{state.newLinks.length > 1 ? "s" : ""}.</>}
      </p>
      {shown.length > 0 ? (
        <ul style={{ ...list, display: "flex", flexDirection: "column", gap: SPACE.sm }}>
          {shown.map(e => {
            const t = TOPIC_BY_ID[e.topicId];
            return (
              <li key={`${e.topicId}-${e.index}`} style={{ borderLeft: `2px solid ${t.color}`, paddingLeft: SPACE.sm + 2 }}>
                <div style={{ fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 600, color: C.white, lineHeight: 1.4 }}>{e.title}</div>
                <div style={{ fontFamily: MONO, fontSize: TYPE.xs, color: white(0.55), marginTop: 2 }}>{t.name} · {TYPE_LABEL[e.type] || e.type}</div>
              </li>
            );
          })}
          {state.events.length > shown.length && (
            <li style={{ fontFamily: BODY, fontSize: TYPE.xs, color: white(0.6) }}>and {state.events.length - shown.length} more that month</li>
          )}
        </ul>
      ) : (
        <p style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.6), lineHeight: 1.5, margin: 0, padding: SPACE.md, border: `1px dashed ${white(0.12)}`, borderRadius: 8 }}>
          {past
            ? `The sample timeline ends in ${monthLabel(LAST_MILESTONE)}. From here on only the conversation counts are simulated, so the map holds still.`
            : "No milestone logged this month."}
        </p>
      )}
    </section>
  );
};

const TopicCard = ({ id, state, onTopicClick }) => {
  const t = TOPIC_BY_ID[id];
  const count = state.counts[id] || 0;
  const latest = [...EVENTS].reverse().find(e => e.topicId === id && e.month <= state.month.key);
  return (
    <section aria-label={`${t.name} so far`} style={{ background: alpha(t.color, 0.06), border: `1px solid ${alpha(t.color, 0.3)}`, borderRadius: 10, padding: SPACE.md, marginBottom: SPACE.lg }}>
      <div style={{ fontFamily: BODY, fontSize: TYPE.base, fontWeight: 700, color: C.white }}><span aria-hidden="true">{t.icon} </span>{t.name}</div>
      <div style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.7), lineHeight: 1.5, marginTop: SPACE.xs }}>
        {count} milestone{count === 1 ? "" : "s"} by {state.month.label}{latest ? <>, the latest “{latest.title}”.</> : "."}
      </div>
      {onTopicClick && (
        <button onClick={() => onTopicClick(t)} style={{ marginTop: SPACE.sm, fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 600, color: t.color, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
          Open the {t.name} timeline →
        </button>
      )}
    </section>
  );
};

// Under the slider: one column per month, height by milestones logged, and
// the six phases from Evolution as buttons that jump to their first month.
const Scrubber = ({ step, onStep, color, mobile }) => (
  <div>
    <div aria-hidden="true" style={{ display: "flex", alignItems: "flex-end", gap: 1, height: 28, marginBottom: SPACE.xs }}>
      {STATES.map((s, i) => (
        <span key={s.month.key} style={{
          flex: 1, height: s.events.length ? 4 + Math.round(24 * s.events.length / BUSIEST) : 2, borderRadius: 1,
          background: i === step ? color : i < step ? white(0.35) : white(0.12),
        }} />
      ))}
    </div>
    <input
      type="range" min={0} max={LAST} value={step}
      onChange={e => onStep(Number(e.target.value))}
      aria-label="Month" aria-valuetext={MONTHS[step].label}
      className="rewind-slider"
      style={{
        width: "100%", height: 6, margin: 0, WebkitAppearance: "none", appearance: "none", borderRadius: 3, outline: "none", cursor: "pointer",
        background: `linear-gradient(90deg, ${color} ${(step / LAST) * 100}%, ${white(0.1)} ${(step / LAST) * 100}%)`,
      }}
    />
    <div role="group" aria-label="Jump to a phase" style={{ display: "flex", gap: 2, marginTop: SPACE.sm }}>
      {EVOLUTION_PHASES.map((p, i) => {
        const start = PHASE_STARTS[i];
        const end = PHASE_STARTS[i + 1] ?? MONTHS.length;
        const on = STATES[step].phase === i;
        return (
          <button key={p.title} onClick={() => onStep(start)} aria-pressed={on}
            aria-label={`${p.title}, ${p.period}`}
            style={{
              flex: end - start, minWidth: on ? "max-content" : 0, fontFamily: BODY, fontSize: TYPE.xs, fontWeight: on ? 700 : 500,
              color: on ? C.bg0 : white(0.7), background: on ? p.color : alpha(p.color, 0.12),
              border: `1px solid ${alpha(p.color, on ? 1 : 0.4)}`, borderRadius: 4, padding: `3px ${SPACE.xs}px`,
              cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>{mobile && !on ? "\u00a0" : p.title.replace(/^The /, "")}</button>
        );
      })}
    </div>
  </div>
);

// ─── The view ───────────────────────────────────────────────────
const RewindMode = ({ onClose, onTopicClick, backLabel, mobile }) => {
  // With reduced motion the rewind opens on the finished map and waits; it
  // never plays on its own.
  const [motion] = useState(() => !reducedMotion());
  const [step, setStep] = useState(motion ? 0 : LAST);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [selected, setSelected] = useState(null);
  const state = STATES[step];
  const phase = EVOLUTION_PHASES[state.phase];
  const color = phase.color;

  // Autoplay, unless the reader got there first: a scrub or a pick in the
  // first moments is theirs to keep.
  const touched = useRef(false);
  useEffect(() => {
    if (!motion) return undefined;
    const t = setTimeout(() => { if (!touched.current) setPlaying(true); }, 600);
    return () => clearTimeout(t);
  }, [motion]);

  // Playback runs until the last month, then stops by itself.
  const running = playing && step < LAST;
  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setStep(s => Math.min(s + 1, LAST)), TICK_MS / speed);
    return () => clearInterval(id);
  }, [running, speed]);

  const scrub = (i) => { touched.current = true; setPlaying(false); setStep(i); };
  const toggle = () => {
    touched.current = true;
    if (running) { setPlaying(false); return; }
    if (step >= LAST) setStep(0);
    setPlaying(true);
  };
  const pick = (id) => { touched.current = true; setPlaying(false); setSelected(id); };
  const shownTopic = selected && state.counts[selected] ? selected : null;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: SPACE.md, marginBottom: SPACE.lg }}>
        <button onClick={onClose} style={{ fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 600, color: white(0.75), background: white(0.04), border: `1px solid ${white(0.12)}`, borderRadius: 8, padding: `${SPACE.xs + 2}px ${SPACE.md}px`, cursor: "pointer" }}>
          ← {backLabel ? `Back to ${backLabel}` : "Back"}
        </button>
        {!mobile && <span style={{ fontFamily: BODY, fontSize: TYPE.xs, color: white(0.55) }}>esc closes</span>}
      </div>

      <header style={{ marginBottom: SPACE.lg, maxWidth: 680 }}>
        <h1 style={{ fontFamily: FONTS, fontSize: mobile ? TYPE.xl : TYPE.xxl, fontWeight: 800, color: C.white, letterSpacing: "-0.01em", margin: 0 }}>Rewind</h1>
        <p style={{ fontFamily: BODY, fontSize: mobile ? TYPE.base : TYPE.md, color: white(0.6), lineHeight: 1.55, margin: `${SPACE.sm}px 0 0` }}>
          Your map, month by month from {MONTHS[0].label} to {MONTHS[LAST].label}: each topic appears with its first milestone and grows with the rest.
        </p>
      </header>

      <div aria-live="polite" style={{ display: "flex", alignItems: "baseline", gap: SPACE.md, flexWrap: "wrap", marginBottom: SPACE.md }}>
        <span style={{ fontFamily: FONTS, fontSize: mobile ? TYPE.lg : TYPE.xl, fontWeight: 700, color: C.white }}>{state.month.label}</span>
        <span style={{ fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 700, color: C.bg0, background: color, borderRadius: 12, padding: `2px ${SPACE.sm + 2}px` }}>{phase.title}</span>
        {!mobile && <span style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.6) }}>{phase.period}</span>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "minmax(0, 1.7fr) minmax(0, 1fr)", gap: mobile ? SPACE.lg : SPACE.xl, alignItems: "start" }}>
        <div style={{ background: white(0.02), border: `1px solid ${white(0.08)}`, borderRadius: 14, padding: mobile ? SPACE.sm : SPACE.lg }}>
          <RingMap state={state} color={color} selected={shownTopic} onSelect={pick} mobile={mobile} motion={motion} />
        </div>
        <div>
          {shownTopic && <TopicCard id={shownTopic} state={state} onTopicClick={onTopicClick} />}
          <ThisMonth state={state} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: SPACE.lg, margin: `${SPACE.xl}px 0`, padding: `${SPACE.md}px 0`, borderTop: `1px solid ${white(0.08)}`, borderBottom: `1px solid ${white(0.08)}` }}>
        <Stat value={state.conversations.toLocaleString("en-US")} label="Conversations so far" color={color} />
        <Stat value={`${state.visible.size} of ${TOPICS.length}`} label="Topics on the map" color={color} />
        <Stat value={`${state.links.length} of ${CONNECTIONS.length}`} label="Links between them" color={color} />
        <Stat value={state.milestones} label="Milestones logged" color={color} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: mobile ? SPACE.md : SPACE.lg }}>
        <button onClick={toggle} aria-label={running ? "Pause" : step >= LAST ? "Replay from the start" : "Play"} style={{
          width: 44, height: 44, borderRadius: "50%", flexShrink: 0, background: color, border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: TYPE.md, color: C.bg0, fontWeight: 700,
        }}><span aria-hidden="true">{running ? "❚❚" : step >= LAST ? "↺" : "▶"}</span></button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Scrubber step={step} onStep={scrub} color={color} mobile={mobile} />
        </div>
        {!mobile && (
          <div role="group" aria-label="Speed" style={{ display: "flex", gap: SPACE.xs, flexShrink: 0 }}>
            {[1, 2, 5].map(s => <button key={s} onClick={() => setSpeed(s)} aria-pressed={speed === s} style={chip(color, speed === s)}>{s}×</button>)}
          </div>
        )}
      </div>
    </div>
  );
};

export default RewindMode;
