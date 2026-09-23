import { useState, useReducer } from "react";
import {
  TOPICS, CURATED_PALETTE, TOPIC_SPARKLINES, TOPIC_CONFIDENCE, SPLIT_SUGGESTIONS, MERGE_SUGGESTIONS,
} from '../data/constants';
import { CSS } from '../styles/base';
import { screen } from '../styles/shared';
import { C, alpha, white, BODY, MONO, SPACE, TYPE } from '../styles/tokens';
import ConfidenceBadge from '../components/ConfidenceBadge';
import MiniSparkline from '../components/MiniSparkline';
import { CurationHeader } from '../components/CurationChrome';

// ─── The topic set, as data ─────────────────────────────────────
const FLAT = [3, 3, 3, 3, 3, 3];

export const initialTopics = () => TOPICS.map(t => ({
  ...t, starred: false, mergedFrom: [],
  confidence: TOPIC_CONFIDENCE[t.id] ?? 80,
  spark: TOPIC_SPARKLINES[t.id] || FLAT,
}));

export const initialState = () => ({ topics: initialTopics(), past: [], log: [], dismissed: [] });

const byId = (topics, id) => topics.find(t => t.id === id);

// The first palette color no topic is using, so a split never shares a color.
export const freeColor = (topics) => CURATED_PALETTE.find(c => !topics.some(t => t.color === c)) || CURATED_PALETTE[0];

// The name a merge produces: Atlas's suggested name for that pair, else the target's.
export const mergedName = (from, into) => {
  const s = MERGE_SUGGESTIONS.find(m => (m.from === from.id && m.into === into.id) || (m.from === into.id && m.into === from.id));
  return s ? s.suggestedName : into.name;
};

// Atlas's merge and split suggestions that still apply and were not dismissed.
export const openSuggestions = ({ topics, dismissed }) => [
  ...MERGE_SUGGESTIONS
    .filter(m => byId(topics, m.from) && byId(topics, m.into))
    .map(m => ({ key: `merge:${m.from}`, kind: "merge", from: byId(topics, m.from), into: byId(topics, m.into), name: m.suggestedName })),
  ...Object.entries(SPLIT_SUGGESTIONS)
    .filter(([id]) => byId(topics, id) && !byId(topics, `${id}_split`))
    .map(([id, s]) => ({ key: `split:${id}`, kind: "split", topic: byId(topics, id), into: s.into })),
].filter(s => !dismissed.includes(s.key));

// The step's tally, handed to the Summary when you move on.
export const summarize = ({ topics, log }) => ({
  total: TOPICS.length, now: topics.length, changes: log.length, log,
  starred: topics.filter(t => t.starred).length,
});

// Record a change: the previous topics go on the undo stack, the entry on the log.
const commit = (state, topics, entry) => ({
  ...state, topics,
  past: [...state.past, { topics: state.topics, log: state.log }],
  log: [...state.log, entry],
});

export const topicsReducer = (state, action) => {
  const { topics } = state;
  switch (action.type) {
    case "rename": {
      const t = byId(topics, action.id);
      const name = action.name.trim();
      if (!t || !name || name === t.name) return state;
      return commit(state, topics.map(x => x.id === t.id ? { ...x, name } : x), `Renamed ${t.name} to ${name}`);
    }
    case "star": {
      const t = byId(topics, action.id);
      if (!t) return state;
      return commit(state, topics.map(x => x.id === t.id ? { ...x, starred: !x.starred } : x), `${t.starred ? "Unstarred" : "Starred"} ${t.name}`);
    }
    case "recolor": {
      const t = byId(topics, action.id);
      if (!t || t.color === action.color) return state;
      return commit(state, topics.map(x => x.id === t.id ? { ...x, color: action.color } : x), `Recolored ${t.name}`);
    }
    case "merge": {
      const from = byId(topics, action.from);
      const into = byId(topics, action.into);
      if (!from || !into || from.id === into.id) return state;
      const merged = {
        ...into,
        name: mergedName(from, into),
        count: into.count + from.count,
        words: into.words + from.words,
        starred: into.starred || from.starred,
        mergedFrom: [...into.mergedFrom, from.name, ...from.mergedFrom],
      };
      return commit(state, topics.filter(x => x.id !== from.id).map(x => x.id === into.id ? merged : x), `Merged ${from.name} into ${into.name}`);
    }
    case "split": {
      const t = byId(topics, action.id);
      const s = SPLIT_SUGGESTIONS[action.id];
      if (!t || !s || byId(topics, `${t.id}_split`)) return state;
      const half = Math.floor(t.count / 2);
      const halfWords = Math.floor(t.words / 2);
      const first = { ...t, name: s.into[0], icon: s.icons[0], count: half, words: halfWords };
      const second = { ...t, id: `${t.id}_split`, name: s.into[1], icon: s.icons[1], count: t.count - half, words: t.words - halfWords, color: freeColor(topics), starred: false, mergedFrom: [] };
      const at = topics.indexOf(t);
      return commit(state, [...topics.slice(0, at), first, second, ...topics.slice(at + 1)], `Split ${t.name} into ${s.into[0]} and ${s.into[1]}`);
    }
    case "dismiss":
      return state.dismissed.includes(action.key) ? state : { ...state, dismissed: [...state.dismissed, action.key] };
    case "undo": {
      const prev = state.past.at(-1);
      if (!prev) return state;
      return { ...state, topics: prev.topics, log: prev.log, past: state.past.slice(0, -1) };
    }
    default:
      return state;
  }
};

// ─── Pieces ─────────────────────────────────────────────────────
const sectionTitle = { fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 600, color: white(0.55), textTransform: "uppercase", letterSpacing: "0.08em", margin: `0 0 ${SPACE.md}px` };
const list = { listStyle: "none", margin: 0, padding: 0 };

const smallButton = (color = white(0.7), strong) => ({
  fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 500, color,
  background: strong ? alpha(color, 0.1) : white(0.03),
  border: `1px solid ${strong ? alpha(color, 0.35) : white(0.1)}`,
  borderRadius: 8, padding: `${SPACE.xs + 1}px ${SPACE.md}px`, cursor: "pointer",
});

const trend = (data) => {
  const first = data.slice(0, 3).reduce((a, b) => a + b, 0);
  const last = data.slice(-3).reduce((a, b) => a + b, 0);
  return last > first * 1.2 ? "rising" : last < first * 0.8 ? "cooling" : "steady";
};

const Suggestion = ({ s, dispatch, mobile }) => (
  <li style={{
    display: "flex", alignItems: mobile ? "flex-start" : "center", flexDirection: mobile ? "column" : "row",
    gap: SPACE.md, padding: `${SPACE.md}px ${SPACE.lg}px`, borderRadius: 12,
    background: alpha(s.kind === "merge" ? C.purple : C.green, 0.05),
    border: `1px solid ${alpha(s.kind === "merge" ? C.purple : C.green, 0.2)}`,
  }}>
    <span style={{ flex: 1, fontFamily: BODY, fontSize: 14, color: white(0.8), lineHeight: 1.5 }}>
      {s.kind === "merge"
        ? <>Merge <strong>{s.from.name}</strong> into <strong>{s.into.name}</strong>, as “{s.name}”.</>
        : <>Split <strong>{s.topic.name}</strong> into <strong>{s.into[0]}</strong> and <strong>{s.into[1]}</strong>.</>}
    </span>
    <span style={{ display: "flex", gap: SPACE.sm, flexShrink: 0 }}>
      <button
        onClick={() => dispatch(s.kind === "merge" ? { type: "merge", from: s.from.id, into: s.into.id } : { type: "split", id: s.topic.id })}
        style={smallButton(s.kind === "merge" ? C.purple : C.green, true)}
      >{s.kind === "merge" ? "Merge" : "Split"}</button>
      <button onClick={() => dispatch({ type: "dismiss", key: s.key })} style={smallButton()}>Dismiss</button>
    </span>
  </li>
);

const RenameForm = ({ topic, onDone, dispatch }) => {
  const [name, setName] = useState(topic.name);
  const save = () => { dispatch({ type: "rename", id: topic.id, name }); onDone(); };
  return (
    <form onSubmit={e => { e.preventDefault(); save(); }} style={{ display: "flex", gap: SPACE.sm, marginTop: SPACE.md }}>
      <label style={{ flex: 1, minWidth: 0 }}>
        <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>New name for {topic.name}</span>
        <input
          value={name} onChange={e => setName(e.target.value)} autoFocus
          onKeyDown={e => { if (e.key === "Escape") onDone(); }}
          style={{ width: "100%", fontFamily: BODY, fontSize: TYPE.base, color: C.white, background: white(0.06), border: `1px solid ${white(0.2)}`, borderRadius: 8, padding: `${SPACE.xs + 2}px ${SPACE.sm}px` }}
        />
      </label>
      <button type="submit" style={smallButton(C.gold, true)}>Save</button>
      <button type="button" onClick={onDone} style={smallButton()}>Cancel</button>
    </form>
  );
};

const ColorPicker = ({ topic, onDone, dispatch }) => (
  <div role="group" aria-label={`Color for ${topic.name}`} style={{ display: "flex", flexWrap: "wrap", gap: SPACE.sm, marginTop: SPACE.md }}>
    {CURATED_PALETTE.map((c, i) => (
      <button key={c} aria-label={`Color ${i + 1}`} aria-pressed={c === topic.color}
        onClick={() => { dispatch({ type: "recolor", id: topic.id, color: c }); onDone(); }}
        style={{ width: 24, height: 24, borderRadius: "50%", background: c, cursor: "pointer", border: `2px solid ${c === topic.color ? C.white : "transparent"}`, padding: 0 }}
      />
    ))}
  </div>
);

const MergePicker = ({ topic, topics, onDone, dispatch }) => (
  <div role="group" aria-label={`Merge ${topic.name} into`} style={{ marginTop: SPACE.md }}>
    <div style={{ fontFamily: BODY, fontSize: TYPE.xs, color: white(0.5), marginBottom: SPACE.sm }}>Merge into:</div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: SPACE.xs + 2 }}>
      {topics.filter(t => t.id !== topic.id).map(t => (
        <button key={t.id} onClick={() => { dispatch({ type: "merge", from: topic.id, into: t.id }); onDone(); }} style={{ ...smallButton(), display: "inline-flex", alignItems: "center", gap: SPACE.xs + 2, borderRadius: 16 }}>
          <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: "50%", background: t.color }} />{t.name}
        </button>
      ))}
    </div>
  </div>
);

const TopicCard = ({ topic, topics, open, setOpen, dispatch, mobile }) => {
  const panel = open?.id === topic.id ? open.kind : null;
  const toggle = (kind) => setOpen(panel === kind ? null : { id: topic.id, kind });
  const done = () => setOpen(null);
  return (
    <li>
      <article aria-label={topic.name} style={{
        height: "100%", boxSizing: "border-box",
        background: panel ? white(0.045) : white(0.025),
        border: `1px solid ${panel ? alpha(topic.color, 0.45) : white(0.07)}`,
        borderRadius: 14, padding: mobile ? SPACE.md + 2 : SPACE.lg,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: SPACE.sm + 2 }}>
          <span aria-hidden="true" style={{ fontSize: 20, lineHeight: 1.2 }}>{topic.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: 0, fontFamily: BODY, fontSize: 15, fontWeight: 600, color: topic.color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{topic.name}</h3>
            <div style={{ fontFamily: MONO, fontSize: TYPE.xs, color: white(0.5), marginTop: 2 }}>
              {topic.count} conversations · {Math.round(topic.words / 1000)}k words
            </div>
            {topic.mergedFrom.length > 0 && (
              <div style={{ fontFamily: BODY, fontSize: TYPE.xs, color: white(0.5), marginTop: 2 }}>includes {topic.mergedFrom.join(", ")}</div>
            )}
          </div>
          <button onClick={() => dispatch({ type: "star", id: topic.id })} aria-pressed={topic.starred} aria-label={`Star ${topic.name}`} style={{
            background: "none", border: "none", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: SPACE.xs,
            color: topic.starred ? C.gold : white(0.35),
          }}>{topic.starred ? "★" : "☆"}</button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: SPACE.sm + 2, marginTop: SPACE.md }}>
          <ConfidenceBadge confidence={topic.confidence} />
          <span role="img" aria-label={`Activity over six months: ${trend(topic.spark)}`} style={{ display: "inline-flex" }}>
            <MiniSparkline data={topic.spark} color={topic.color} />
          </span>
          <span style={{ fontFamily: BODY, fontSize: TYPE.xs, color: white(0.45) }}>{trend(topic.spark)}</span>
        </div>

        <div role="group" aria-label={`Edit ${topic.name}`} style={{ display: "flex", flexWrap: "wrap", gap: SPACE.xs + 2, marginTop: SPACE.md }}>
          <button onClick={() => toggle("rename")} aria-expanded={panel === "rename"} style={smallButton()}>Rename</button>
          <button onClick={() => toggle("color")} aria-expanded={panel === "color"} style={{ ...smallButton(), display: "inline-flex", alignItems: "center", gap: SPACE.xs + 2 }}>
            <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: "50%", background: topic.color }} />Color
          </button>
          <button onClick={() => toggle("merge")} aria-expanded={panel === "merge"} style={smallButton()}>Merge…</button>
          {SPLIT_SUGGESTIONS[topic.id] && !topics.some(t => t.id === `${topic.id}_split`) && (
            <button onClick={() => dispatch({ type: "split", id: topic.id })} style={smallButton()}>Split</button>
          )}
        </div>

        {panel === "rename" && <RenameForm topic={topic} onDone={done} dispatch={dispatch} />}
        {panel === "color" && <ColorPicker topic={topic} onDone={done} dispatch={dispatch} />}
        {panel === "merge" && <MergePicker topic={topic} topics={topics} onDone={done} dispatch={dispatch} />}
      </article>
    </li>
  );
};

// ─── The view ───────────────────────────────────────────────────
const TopicCurationPanel = ({ onComplete, onNavigate, mobile, w }) => {
  const [state, dispatch] = useReducer(topicsReducer, undefined, initialState);
  const [open, setOpen] = useState(null); // { id, kind: "rename" | "color" | "merge" }
  const { topics, log } = state;
  const suggestions = openSuggestions(state);
  const tablet = !mobile && w < 1024;
  const starred = topics.filter(t => t.starred).length;

  const act = (action) => { setOpen(null); dispatch(action); };

  return (
    <div style={screen(mobile)}>
      <style>{CSS}</style>
      <main style={{ maxWidth: 1100, width: "100%", margin: "0 auto" }}>
        <CurationHeader
          view="topicCuration" title="Shape the" accent="topics" onNavigate={onNavigate} mobile={mobile}
          lede={`Atlas found ${TOPICS.length} topics. Rename, recolor, merge or split them until the map matches how you think about your work, and star the ones that matter most.`}
        />

        {suggestions.length > 0 && (
          <section aria-labelledby="tc-suggest" style={{ marginBottom: SPACE.xxl }}>
            <h2 id="tc-suggest" style={sectionTitle}>Atlas suggests ({suggestions.length})</h2>
            <ul style={{ ...list, display: "flex", flexDirection: "column", gap: SPACE.sm }}>
              {suggestions.map(s => <Suggestion key={s.key} s={s} dispatch={act} mobile={mobile} />)}
            </ul>
          </section>
        )}

        <section aria-labelledby="tc-topics" style={{ marginBottom: SPACE.xxl }}>
          <h2 id="tc-topics" style={sectionTitle}>
            Your topics ({topics.length}){starred > 0 ? ` · ${starred} starred` : ""}
          </h2>
          <ul style={{ ...list, display: "grid", gridTemplateColumns: mobile ? "1fr" : tablet ? "1fr 1fr" : "1fr 1fr 1fr", gap: mobile ? SPACE.sm + 2 : SPACE.md + 2 }}>
            {topics.map(t => <TopicCard key={t.id} topic={t} topics={topics} open={open} setOpen={setOpen} dispatch={act} mobile={mobile} />)}
          </ul>
        </section>

        <footer style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: SPACE.lg, flexWrap: "wrap", paddingTop: SPACE.xl, borderTop: `1px solid ${white(0.06)}` }}>
          <div role="status" style={{ display: "flex", alignItems: "center", gap: SPACE.md, flexWrap: "wrap", fontFamily: BODY, fontSize: TYPE.sm, color: white(0.55) }}>
            {log.length === 0
              ? "No changes yet. Atlas's topics are kept as they are."
              : <>
                  <span>{log.length} change{log.length > 1 ? "s" : ""}. Last: {log.at(-1)}.</span>
                  <button onClick={() => act({ type: "undo" })} style={smallButton()}>Undo</button>
                </>}
          </div>
          <button onClick={() => onComplete(summarize(state))} style={{
            fontFamily: BODY, fontSize: 15, fontWeight: 600, color: C.bg0, background: C.gold,
            border: `1px solid ${C.gold}`, borderRadius: 10, padding: `${SPACE.md}px ${SPACE.xxl}px`, cursor: "pointer",
          }}>Next: check connections →</button>
        </footer>
      </main>
    </div>
  );
};

export default TopicCurationPanel;
