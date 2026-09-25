import { useState } from "react";
import { TOPICS, PLATFORM_INSIGHTS, EVOLUTION_PHASES, PIVOT_ENTRIES } from '../data/constants';
import { C, alpha, white, black, FONTS, BODY, MONO, SPACE, TYPE } from '../styles/tokens';

// ─── The phases, as data ────────────────────────────────────────
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "Dec 2025" -> months since year 0, or null when it does not parse.
export const monthIndex = (text) => {
  const m = /^([A-Z][a-z]{2}) (\d{4})$/.exec(text.trim());
  if (!m || !MONTHS.includes(m[1])) return null;
  return Number(m[2]) * 12 + MONTHS.indexOf(m[1]);
};

// "Jan – Jun 2023" or "Jul 2024 – Feb 2025" -> { start, end, label: "Jan 2023" }.
// A start month without a year takes the end's year.
export const phaseRange = (period) => {
  const [a, b] = period.split("–").map(s => s.trim());
  const endYear = b.slice(-4);
  const startText = /\d{4}$/.test(a) ? a : `${a} ${endYear}`;
  return { start: monthIndex(startText), end: monthIndex(b), label: startText };
};

// The index of the phase a "Mon YYYY" date falls in, or -1.
export const phaseOf = (date, phases = EVOLUTION_PHASES) => {
  const at = monthIndex(date);
  return phases.findIndex(p => { const r = phaseRange(p.period); return at >= r.start && at <= r.end; });
};

const TOPIC_BY_NAME = Object.fromEntries(TOPICS.map(t => [t.name, t]));
const TOPIC_BY_ID = Object.fromEntries(TOPICS.map(t => [t.id, t]));
const TOTAL = EVOLUTION_PHASES.reduce((a, p) => a + p.conversations, 0);
const PEAK = Math.max(...EVOLUTION_PHASES.map(p => p.conversations));
const PIVOTS_BY_PHASE = EVOLUTION_PHASES.map((_, i) => PIVOT_ENTRIES.filter(p => phaseOf(p.date) === i));

// ─── Pieces ─────────────────────────────────────────────────────
const sectionTitle = { fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 600, color: white(0.55), textTransform: "uppercase", letterSpacing: "0.08em", margin: `0 0 ${SPACE.md}px` };
const label = { fontFamily: MONO, fontSize: TYPE.xs, color: white(0.55), textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: SPACE.xs };
const list = { listStyle: "none", margin: 0, padding: 0 };
const smallButton = (color = C.white, primary) => ({
  fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 600, color: primary ? C.bg0 : color,
  background: primary ? color : alpha(color, 0.07), border: `1px solid ${primary ? color : alpha(color, 0.3)}`,
  borderRadius: 8, padding: `${SPACE.xs + 2}px ${SPACE.md}px`, cursor: "pointer", flexShrink: 0,
});

// The signature piece: one bar per phase, height by conversations, with the
// pivots that happened in it marked underneath. Each bar selects its phase.
const PhaseBand = ({ selected, onSelect, mobile }) => (
  <div role="group" aria-label="Phases" style={{ display: "grid", gridTemplateColumns: `repeat(${EVOLUTION_PHASES.length}, 1fr)`, gap: mobile ? SPACE.xs : SPACE.sm, alignItems: "end" }}>
    {EVOLUTION_PHASES.map((p, i) => {
      const on = i === selected;
      const pivots = PIVOTS_BY_PHASE[i];
      return (
        <button key={p.title} onClick={() => onSelect(i)} aria-pressed={on}
          aria-label={`${p.title}, ${p.period}: ${p.conversations} conversations${pivots.length ? `, ${pivots.length} pivot${pivots.length > 1 ? "s" : ""}` : ""}`}
          style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: SPACE.xs, background: "none", border: "none", padding: 0, cursor: "pointer", minWidth: 0 }}>
          <span style={{ fontFamily: MONO, fontSize: mobile ? TYPE.xs : TYPE.sm, fontWeight: 700, color: on ? p.color : white(0.6), textAlign: "center" }}>{p.conversations}</span>
          <span aria-hidden="true" style={{
            height: Math.round((mobile ? 110 : 150) * p.conversations / PEAK), borderRadius: "6px 6px 2px 2px",
            background: on ? p.color : alpha(p.color, 0.35), border: `1px solid ${on ? p.color : alpha(p.color, 0.6)}`,
          }} />
          <span aria-hidden="true" style={{ display: "flex", justifyContent: "center", gap: 3, minHeight: 10 }}>
            {pivots.map(pv => <span key={pv.id} style={{ width: 8, height: 8, transform: "rotate(45deg)", background: C.purple }} />)}
          </span>
          <span style={{ fontFamily: BODY, fontSize: TYPE.xs, color: on ? C.white : white(0.6), fontWeight: on ? 600 : 400, textAlign: "center", lineHeight: 1.3 }}>
            {mobile ? phaseRange(p.period).label.replace(/^(\w{3}) \d\d(\d\d)$/, "$1 ’$2") : phaseRange(p.period).label}
          </span>
        </button>
      );
    })}
  </div>
);

const TopicChip = ({ name, onTopicClick }) => {
  const t = TOPIC_BY_NAME[name];
  const style = { fontFamily: BODY, fontSize: TYPE.sm, color: t ? t.color : white(0.7), background: t ? alpha(t.color, 0.08) : white(0.04), border: `1px solid ${t ? alpha(t.color, 0.3) : white(0.1)}`, borderRadius: 6, padding: `2px ${SPACE.sm + 2}px` };
  return t && onTopicClick
    ? <button onClick={() => onTopicClick(t)} aria-label={`Open the ${t.name} timeline`} style={{ ...style, cursor: "pointer" }}>{t.icon} {t.name}</button>
    : <span style={style}>{name}</span>;
};

const Pivot = ({ pivot, open, onToggle, annotation, editing, onEdit, onSave, onCancel, onTopicClick, mobile }) => {
  const [draft, setDraft] = useState(annotation || "");
  const topic = TOPIC_BY_ID[pivot.topicId];
  const detailId = `pivot-${pivot.id}`;
  return (
    <article id={`${detailId}-card`} aria-label={pivot.title} style={{ background: open ? alpha(pivot.topicColor, 0.04) : white(0.02), border: `1px solid ${open ? alpha(pivot.topicColor, 0.3) : white(0.07)}`, borderRadius: 14 }}>
      <button onClick={onToggle} aria-expanded={open} aria-controls={detailId}
        style={{ display: "flex", alignItems: "center", gap: SPACE.md, width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: mobile ? SPACE.md : `${SPACE.lg}px ${SPACE.xl}px` }}>
        <span aria-hidden="true" style={{ fontSize: 20, flexShrink: 0 }}>{pivot.topicIcon}</span>
        <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ display: "flex", alignItems: "center", gap: SPACE.sm, flexWrap: "wrap", fontFamily: BODY, fontSize: TYPE.sm }}>
            <span style={{ fontFamily: MONO, color: pivot.topicColor }}>{pivot.date}</span>
            <span style={{ color: white(0.6) }}>{pivot.topicName}</span>
            <span style={{ fontFamily: MONO, fontSize: TYPE.xs, color: annotation ? C.green : C.gold }}>{annotation ? "Annotated" : "Not annotated"}</span>
          </span>
          <span style={{ fontFamily: FONTS, fontSize: mobile ? TYPE.md : TYPE.lg - 2, fontWeight: 600, color: C.white, lineHeight: 1.3 }}>{pivot.title}</span>
        </span>
        <span aria-hidden="true" style={{ color: white(0.5), transform: open ? "rotate(90deg)" : "none", flexShrink: 0 }}>▸</span>
      </button>

      {open && (
        <div id={detailId} style={{ padding: mobile ? `0 ${SPACE.md}px ${SPACE.md}px` : `0 ${SPACE.xl}px ${SPACE.xl}px`, display: "flex", flexDirection: "column", gap: SPACE.lg }}>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr auto 1fr", gap: SPACE.sm, alignItems: "center" }}>
            <div style={{ padding: SPACE.md, borderRadius: 8, background: white(0.03), border: `1px solid ${white(0.08)}` }}>
              <div style={label}>Before</div>
              <div style={{ fontFamily: BODY, fontSize: TYPE.base, color: white(0.7), lineHeight: 1.5 }}>{pivot.before}</div>
            </div>
            <span aria-hidden="true" style={{ color: C.purple, textAlign: "center" }}>{mobile ? "↓" : "→"}</span>
            <div style={{ padding: SPACE.md, borderRadius: 8, background: alpha(C.purple, 0.06), border: `1px solid ${alpha(C.purple, 0.25)}` }}>
              <div style={{ ...label, color: C.purple }}>After</div>
              <div style={{ fontFamily: BODY, fontSize: TYPE.base, color: white(0.85), lineHeight: 1.5 }}>{pivot.after}</div>
            </div>
          </div>

          <div>
            <div style={label}>What changed it</div>
            <p style={{ margin: 0, fontFamily: BODY, fontSize: TYPE.base, color: white(0.75), lineHeight: 1.55 }}>{pivot.trigger}</p>
          </div>

          <div>
            <div style={label}>Topics it touched</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: SPACE.xs + 2 }}>
              {topic && !pivot.impact.includes(topic.name) && <TopicChip name={topic.name} onTopicClick={onTopicClick} />}
              {pivot.impact.map(name => <TopicChip key={name} name={name} onTopicClick={onTopicClick} />)}
            </div>
          </div>

          <div style={{ padding: SPACE.md, borderRadius: 8, background: annotation ? alpha(C.green, 0.05) : white(0.02), border: `1px solid ${annotation ? alpha(C.green, 0.25) : white(0.08)}` }}>
            {editing ? (
              <form onSubmit={(e) => { e.preventDefault(); onSave(draft); }}>
                <label htmlFor={`${detailId}-note`} style={{ ...label, display: "block" }}>Why did your thinking change?</label>
                <textarea id={`${detailId}-note`} value={draft} onChange={e => setDraft(e.target.value)} rows={3}
                  placeholder="What you learned, in your words"
                  style={{ width: "100%", boxSizing: "border-box", fontFamily: BODY, fontSize: TYPE.base, color: C.white, background: black(0.3), border: `1px solid ${alpha(C.purple, 0.4)}`, borderRadius: 6, padding: SPACE.sm, resize: "vertical", lineHeight: 1.5 }} />
                <div style={{ display: "flex", gap: SPACE.sm, justifyContent: "flex-end", marginTop: SPACE.sm }}>
                  <button type="button" onClick={() => { setDraft(annotation || ""); onCancel(); }} style={smallButton()}>Cancel</button>
                  <button type="submit" style={smallButton(C.purple, true)}>Save</button>
                </div>
              </form>
            ) : (
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: SPACE.md }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ ...label, color: annotation ? C.green : white(0.55) }}>{annotation ? "Your note" : "No note yet"}</div>
                  <p style={{ margin: 0, fontFamily: BODY, fontSize: TYPE.base, color: annotation ? white(0.8) : white(0.55), lineHeight: 1.55 }}>
                    {annotation || "Say why your thinking changed, so the next time it comes up you have your own reasons, not just the outcome."}
                  </p>
                </div>
                <button onClick={onEdit} style={smallButton(C.purple)}>{annotation ? "Edit" : "Add a note"}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
};

// ─── The view ───────────────────────────────────────────────────
const EvolutionView = ({ mobile, onRewind, onTopicClick }) => {
  const [selected, setSelected] = useState(EVOLUTION_PHASES.length - 1);
  const [openPivot, setOpenPivot] = useState(null);
  const [editing, setEditing] = useState(null);
  const [notes, setNotes] = useState(() => Object.fromEntries(PIVOT_ENTRIES.filter(p => p.annotation).map(p => [p.id, p.annotation])));
  const phase = EVOLUTION_PHASES[selected];
  const phasePivots = PIVOTS_BY_PHASE[selected];
  const noted = PIVOT_ENTRIES.filter(p => notes[p.id]).length;
  const first = EVOLUTION_PHASES[0];
  const last = EVOLUTION_PHASES.at(-1);

  const open = (id) => { setOpenPivot(id); setEditing(null); };
  // From the phase panel: open the pivot and bring it into view.
  const showPivot = (id) => {
    open(id);
    const smooth = !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(() => document.getElementById(`pivot-${id}-card`)?.scrollIntoView?.({ behavior: smooth ? "smooth" : "auto", block: "start" }));
  };
  const save = (id, text) => {
    const t = text.trim();
    setNotes(prev => { const next = { ...prev }; if (t) next[id] = t; else delete next[id]; return next; });
    setEditing(null);
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <header style={{ display: "flex", alignItems: mobile ? "flex-start" : "flex-end", justifyContent: "space-between", gap: SPACE.lg, flexDirection: mobile ? "column" : "row", marginBottom: SPACE.xl }}>
        <div style={{ maxWidth: 640 }}>
          <h1 style={{ fontFamily: FONTS, fontSize: mobile ? TYPE.xl : TYPE.xxl, fontWeight: 800, color: C.white, letterSpacing: "-0.01em", margin: 0 }}>How you <span style={{ color: C.purple }}>evolved</span></h1>
          <p style={{ fontFamily: BODY, fontSize: mobile ? TYPE.base : TYPE.md, color: white(0.6), lineHeight: 1.55, margin: `${SPACE.sm}px 0 0` }}>
            {TOTAL.toLocaleString("en-US")} conversations in {EVOLUTION_PHASES.length} phases, from {first.title} ({phaseRange(first.period).label}) to {last.title} today, and {PIVOT_ENTRIES.length} pivots where your thinking changed.
          </p>
        </div>
        {onRewind && (
          <button onClick={onRewind} style={smallButton(C.purple)}><span aria-hidden="true">⏪ </span>Watch it build</button>
        )}
      </header>

      <section aria-labelledby="ev-phases" style={{ background: white(0.02), border: `1px solid ${white(0.07)}`, borderRadius: 16, padding: mobile ? SPACE.md : SPACE.xl, marginBottom: SPACE.xxl }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: SPACE.md, flexWrap: "wrap", marginBottom: SPACE.lg }}>
          <h2 id="ev-phases" style={{ ...sectionTitle, margin: 0 }}>Conversations per phase</h2>
          <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.xs + 2, fontFamily: BODY, fontSize: TYPE.sm, color: white(0.6) }}>
            <span aria-hidden="true" style={{ width: 8, height: 8, transform: "rotate(45deg)", background: C.purple }} />a pivot in that phase
          </span>
        </div>
        <PhaseBand selected={selected} onSelect={setSelected} mobile={mobile} />

        <div role="region" aria-live="polite" aria-label={`${phase.title}, selected phase`} style={{ marginTop: SPACE.xl, paddingTop: SPACE.lg, borderTop: `1px solid ${white(0.07)}` }}>
          <div style={{ fontFamily: MONO, fontSize: TYPE.xs, color: phase.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Phase {selected + 1} of {EVOLUTION_PHASES.length} · {phase.period}
          </div>
          <h3 style={{ fontFamily: FONTS, fontSize: TYPE.xl, fontWeight: 700, color: C.white, margin: `${SPACE.xs}px 0 ${SPACE.sm}px` }}>{phase.title}</h3>
          <p style={{ margin: 0, fontFamily: BODY, fontSize: TYPE.base, color: white(0.75), lineHeight: 1.6, maxWidth: 720 }}>
            {phase.desc} <span style={{ color: white(0.55) }}>{phase.conversations} conversations, {Math.round(100 * phase.conversations / TOTAL)}% of the archive.</span>
          </p>
          {phasePivots.length > 0 && (
            <ul aria-label={`Pivots in ${phase.title}`} style={{ ...list, display: "flex", flexWrap: "wrap", gap: SPACE.sm, marginTop: SPACE.md }}>
              {phasePivots.map(p => (
                <li key={p.id}>
                  <button onClick={() => showPivot(p.id)} style={{ ...smallButton(C.purple), textAlign: "left", fontWeight: 500 }}>
                    <span aria-hidden="true">◆ </span>{p.date}: {p.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section aria-labelledby="ev-pivots" style={{ marginBottom: SPACE.xxl }}>
        <h2 id="ev-pivots" style={sectionTitle}>Pivots · {noted} of {PIVOT_ENTRIES.length} with your note</h2>
        <p style={{ margin: `0 0 ${SPACE.md}px`, fontFamily: BODY, fontSize: TYPE.base, color: white(0.6), lineHeight: 1.55 }}>
          Moments Atlas found where a decision reversed. Add a note to say why, in your words.
        </p>
        <ol style={{ ...list, display: "flex", flexDirection: "column", gap: SPACE.sm }}>
          {PIVOT_ENTRIES.map(p => (
            <li key={p.id}>
              <Pivot
                key={`${p.id}:${notes[p.id] || ""}`}
                pivot={p} mobile={mobile} onTopicClick={onTopicClick}
                open={openPivot === p.id} onToggle={() => open(openPivot === p.id ? null : p.id)}
                annotation={notes[p.id]} editing={editing === p.id}
                onEdit={() => setEditing(p.id)} onCancel={() => setEditing(null)} onSave={(text) => save(p.id, text)}
              />
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="ev-platforms">
        <h2 id="ev-platforms" style={sectionTitle}>Which assistant, for what</h2>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: SPACE.md }}>
          {PLATFORM_INSIGHTS.map(p => (
            <div key={p.label} style={{ background: alpha(p.color, 0.04), border: `1px solid ${alpha(p.color, 0.25)}`, borderRadius: 12, padding: mobile ? SPACE.md : `${SPACE.lg}px ${SPACE.xl}px` }}>
              <h3 style={{ fontFamily: BODY, fontSize: TYPE.sm, color: p.color, fontWeight: 600, margin: `0 0 ${SPACE.sm}px`, textTransform: "uppercase", letterSpacing: "0.06em" }}>{p.label}</h3>
              <ul style={list}>
                {p.items.map((item, j) => (
                  <li key={item} style={{ fontFamily: BODY, fontSize: TYPE.base, color: white(0.75), padding: `${SPACE.xs + 1}px 0`, borderBottom: j < p.items.length - 1 ? `1px solid ${white(0.06)}` : "none" }}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default EvolutionView;
