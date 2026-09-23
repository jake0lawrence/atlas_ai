import { CSS } from '../styles/base';
import { screen } from '../styles/shared';
import { C, alpha, white, FONTS, BODY, MONO, SPACE, TYPE } from '../styles/tokens';
import { CurationHeader, CURATION_STEPS } from '../components/CurationChrome';
import { initialQueue, summarize as summarizeQueue } from './ReviewQueue';
import { initialTopics, summarize as summarizeTopics } from './TopicCurationPanel';
import { initialConnections, summarize as summarizeConnections } from './ConnectionValidation';
import { initialState as initialInsights, summarize as summarizeInsights } from './InsightDecisionReview';

// ─── The run, as data ───────────────────────────────────────────
// `results` holds each step's tally, recorded when you finish that step
// (store.curationResults). A step you skipped reports what it holds untouched:
// its auto-approvals, everything else waiting.

// What each decision means, one color per meaning across the whole run.
export const MARKS = {
  kept: { label: "Kept as proposed", color: C.green },
  changed: { label: "Changed by you", color: C.blue },
  rejected: { label: "Rejected", color: C.red },
  auto: { label: "Approved automatically", color: C.green, faint: true },
  waiting: { label: "Waiting", color: C.white, empty: true },
};

const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

// "a, b and c", skipping empty parts.
export const listOf = (parts) => {
  const p = parts.filter(Boolean);
  return p.length <= 1 ? (p[0] || "") : `${p.slice(0, -1).join(", ")} and ${p.at(-1)}`;
};

const untouched = {
  curation: () => summarizeQueue(initialQueue()),
  topicCuration: () => summarizeTopics({ topics: initialTopics(), log: [] }),
  connectionValidation: () => summarizeConnections(initialConnections()),
  insightReview: () => summarizeInsights(initialInsights().items),
};

// One row per step: its tally, its proposals as marks, and a sentence.
export const ledger = (results = {}) => CURATION_STEPS.filter(s => untouched[s.view]).map(({ view, label }) => {
  const visited = Boolean(results[view]);
  const r = results[view] || untouched[view]();
  if (view === "curation") {
    const counts = { kept: r.approved, changed: r.edited, rejected: r.rejected, auto: r.auto, waiting: r.pending };
    const yours = listOf([r.approved && `approved ${r.approved}`, r.edited && `moved ${r.edited}`, r.rejected && `rejected ${r.rejected}`]);
    return {
      view, label, visited, counts, total: r.total, noun: "classifications",
      sentence: visited
        ? `${yours ? `You ${yours} of ${r.total} classifications. ` : `You didn't change any of the ${r.total} classifications. `}${r.auto} passed automatically at 90% confidence or more${r.pending ? `, and ${r.pending} are waiting` : ""}.`
        : `Not finished. ${r.auto} of ${r.total} classifications passed automatically at 90% confidence or more; the other ${r.pending} are waiting for you.`,
    };
  }
  if (view === "topicCuration") {
    return {
      view, label, visited, counts: null, total: r.total, noun: "topics", log: r.log,
      sentence: visited
        ? r.changes === 0
          ? `You kept Atlas's ${r.total} topics as they are${r.starred ? ` and starred ${r.starred}` : ""}.`
          : `${plural(r.changes, "change")}: Atlas's ${r.total} topics are now ${r.now}${r.starred ? `, ${r.starred} of them starred` : ""}.`
        : `Not finished. Atlas's ${r.total} topics stand as proposed.`,
    };
  }
  if (view === "connectionValidation") {
    const counts = { kept: r.confirmed - r.added, changed: r.edited + r.added, rejected: r.rejected, waiting: r.pending };
    const yours = listOf([r.confirmed - r.added && `confirmed ${r.confirmed - r.added}`, r.edited && `relabeled ${r.edited}`, r.rejected && `rejected ${r.rejected}`, r.added && `added ${r.added} of your own`]);
    const found = r.total - r.added;
    return {
      view, label, visited, counts, total: r.total, noun: "connections",
      sentence: visited
        ? `${yours ? `Of ${found} connections Atlas found, you ${yours}.` : `You didn't decide any of the ${found} connections.`}${r.pending ? ` ${r.pending} are waiting.` : ""}`
        : `Not finished. All ${found} connections Atlas found are waiting for you.`,
    };
  }
  const counts = { kept: r.correct, changed: r.edited, rejected: r.rejected, waiting: r.pending };
  const yours = listOf([r.correct && `kept ${r.correct}`, r.edited && `rewrote ${r.edited}`, r.rejected && `dismissed ${r.rejected}`]);
  return {
    view, label, visited, counts, total: r.total, noun: "turning points",
    sentence: visited
      ? `${yours ? `Of ${r.total} turning points, you ${yours}.` : `You didn't decide any of the ${r.total} turning points.`}${r.pending ? ` ${r.pending} are waiting.` : ""}`
      : `Not finished. All ${r.total} turning points are waiting for you.`,
  };
});

// The run's totals over every proposal (the rows with marks). Topic edits are
// not proposals, so they are counted on their own.
export const totals = (rows) => {
  const sum = (key) => rows.reduce((a, r) => a + (r.counts?.[key] || 0), 0);
  const t = { kept: sum("kept"), changed: sum("changed"), rejected: sum("rejected"), auto: sum("auto"), waiting: sum("waiting") };
  return {
    ...t,
    decided: t.kept + t.changed + t.rejected,
    proposals: rows.reduce((a, r) => a + (r.counts ? r.total : 0), 0),
    topicChanges: rows.find(r => r.view === "topicCuration" && r.visited)?.log.length || 0,
  };
};

// ─── Pieces ─────────────────────────────────────────────────────
const sectionTitle = { fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 600, color: white(0.55), textTransform: "uppercase", letterSpacing: "0.08em", margin: `0 0 ${SPACE.md}px` };
const list = { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: SPACE.sm };

const markStyle = (key, size = 14) => {
  const m = MARKS[key];
  return {
    width: size, height: size, borderRadius: 3, flexShrink: 0, boxSizing: "border-box",
    background: m.empty ? "transparent" : m.faint ? alpha(m.color, 0.3) : m.color,
    border: `1.5px solid ${m.empty ? white(0.35) : m.color}`,
  };
};

// Every proposal in the step as one square, in the order of the legend.
const Marks = ({ row }) => (
  <div role="img" aria-label={`${row.label}: ${Object.entries(row.counts).filter(([, n]) => n).map(([k, n]) => `${n} ${MARKS[k].label.toLowerCase()}`).join(", ")}`}
    style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
    {Object.entries(row.counts).flatMap(([k, n]) => Array.from({ length: n }, (_, i) => <span key={`${k}${i}`} style={markStyle(k)} />))}
  </div>
);

const Legend = () => (
  <ul aria-label="What the squares mean" style={{ ...list, flexDirection: "row", flexWrap: "wrap", gap: `${SPACE.xs}px ${SPACE.lg}px`, marginBottom: SPACE.lg }}>
    {Object.entries(MARKS).map(([k, m]) => (
      <li key={k} style={{ display: "flex", alignItems: "center", gap: SPACE.xs + 2, fontFamily: BODY, fontSize: TYPE.sm, color: white(0.65) }}>
        <span aria-hidden="true" style={markStyle(k, 12)} />{m.label}
      </li>
    ))}
  </ul>
);

const Stat = ({ value, label, color }) => (
  <div style={{ background: white(0.025), border: `1px solid ${white(0.07)}`, borderRadius: 12, padding: `${SPACE.md}px ${SPACE.lg}px` }}>
    <div style={{ fontFamily: MONO, fontSize: TYPE.xxl, fontWeight: 700, color, lineHeight: 1.1 }}>{value}</div>
    <div style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.6), marginTop: SPACE.xs }}>{label}</div>
  </div>
);

const goButton = { fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 600, color: C.gold, background: alpha(C.gold, 0.07), border: `1px solid ${alpha(C.gold, 0.3)}`, borderRadius: 8, padding: `${SPACE.xs + 2}px ${SPACE.md}px`, cursor: "pointer", flexShrink: 0 };

const StepRow = ({ row, onNavigate, mobile }) => {
  const shownLog = row.log?.slice(0, 5) || [];
  return (
    <article aria-label={row.label} style={{ background: white(0.02), border: `1px solid ${row.visited ? white(0.07) : alpha(C.gold, 0.2)}`, borderRadius: 14, padding: mobile ? SPACE.md : `${SPACE.lg}px ${SPACE.xl}px` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: SPACE.md, marginBottom: SPACE.sm }}>
        <h3 style={{ margin: 0, fontFamily: FONTS, fontSize: TYPE.md, fontWeight: 700, color: C.white }}>
          {row.label} <span style={{ fontFamily: MONO, fontSize: TYPE.xs, fontWeight: 500, color: white(0.5), marginLeft: SPACE.xs }}>{plural(row.total, row.noun.replace(/s$/, ""), row.noun)}</span>
        </h3>
        {!row.visited && <button onClick={() => onNavigate?.(row.view)} style={goButton}>Go to {row.label}</button>}
      </div>
      <p style={{ margin: `0 0 ${row.counts || shownLog.length ? SPACE.md : 0}px`, fontFamily: BODY, fontSize: TYPE.base, color: white(0.75), lineHeight: 1.55 }}>{row.sentence}</p>
      {row.counts && <Marks row={row} />}
      {row.visited && shownLog.length > 0 && (
        <ul aria-label="Your topic changes" style={{ ...list, gap: SPACE.xs }}>
          {shownLog.map((entry, i) => (
            <li key={i} style={{ display: "flex", alignItems: "center", gap: SPACE.sm, fontFamily: BODY, fontSize: TYPE.sm, color: white(0.7) }}>
              <span aria-hidden="true" style={markStyle("changed", 10)} />{entry}
            </li>
          ))}
          {row.log.length > shownLog.length && <li style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.5), paddingLeft: SPACE.lg }}>and {row.log.length - shownLog.length} more</li>}
        </ul>
      )}
    </article>
  );
};

// ─── The view ───────────────────────────────────────────────────
const CurationSummary = ({ results = {}, onComplete, onNavigate, mobile }) => {
  const rows = ledger(results);
  const t = totals(rows);
  const visited = rows.filter(r => r.visited).length;
  const done = visited === rows.length && t.waiting === 0;

  const lede = visited === 0
    ? `You haven't finished a curation step yet, so Atlas's ${t.proposals} proposals stand as they are. Each step below says what is waiting.`
    : `Atlas proposed ${t.proposals} classifications, connections and turning points. You decided ${t.decided} yourself (${t.changed + t.rejected} changed or rejected), ${t.auto} passed automatically${t.waiting ? ` and ${t.waiting} are still waiting` : ""}.${t.topicChanges ? ` You also made ${plural(t.topicChanges, "change")} to the topics.` : ""}`;

  return (
    <div style={screen(mobile)}>
      <style>{CSS}</style>
      <main style={{ maxWidth: 960, width: "100%", margin: "0 auto" }}>
        <CurationHeader
          view="curationSummary" onNavigate={onNavigate} mobile={mobile} done={rows.filter(r => r.visited).map(r => r.view)}
          title={done ? "Every proposal" : "Where the run"} accent={done ? "checked" : "stands"} lede={lede}
        />

        <section aria-label="Totals" style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: SPACE.md, marginBottom: SPACE.xxl }}>
          <Stat value={t.decided} label="Decided by you" color={C.white} />
          <Stat value={t.changed + t.rejected} label="Changed or rejected" color={C.blue} />
          <Stat value={t.auto} label="Approved automatically" color={C.green} />
          <Stat value={t.waiting} label="Still waiting" color={t.waiting ? C.gold : white(0.5)} />
        </section>

        <section aria-labelledby="cs-steps" style={{ marginBottom: SPACE.xxl }}>
          <h2 id="cs-steps" style={sectionTitle}>Step by step · one square per proposal</h2>
          <Legend />
          <ol style={list}>
            {rows.map(r => <li key={r.view}><StepRow row={r} onNavigate={onNavigate} mobile={mobile} /></li>)}
          </ol>
        </section>

        <footer style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: SPACE.lg, flexWrap: "wrap", paddingTop: SPACE.xl, borderTop: `1px solid ${white(0.06)}` }}>
          <p role="status" style={{ margin: 0, fontFamily: BODY, fontSize: TYPE.sm, color: white(0.6), lineHeight: 1.5, maxWidth: 520 }}>
            {t.waiting
              ? "Anything still waiting stays as Atlas proposed it. You can open the atlas now and finish later."
              : "Your atlas is built from what you kept and changed."}
          </p>
          <button onClick={onComplete} style={{
            fontFamily: BODY, fontSize: 15, fontWeight: 600, color: C.bg0, background: C.gold,
            border: `1px solid ${C.gold}`, borderRadius: 10, padding: `${SPACE.md}px ${SPACE.xxl}px`, cursor: "pointer",
          }}>Open your atlas →</button>
        </footer>
      </main>
    </div>
  );
};

export default CurationSummary;
