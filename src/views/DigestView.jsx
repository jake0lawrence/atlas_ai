import { useState } from "react";
import { TOPICS, DIGEST_DATA, PIVOT_ENTRIES } from '../data/constants';
import { C, alpha, white, FONTS, BODY, MONO, SPACE, TYPE } from '../styles/tokens';

// ─── The digests, as data ───────────────────────────────────────
// DIGEST_DATA runs newest first; the strip reads oldest to newest.
export const chronological = (digests = DIGEST_DATA) => [...digests].reverse();

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthIndex = (label) => { const [m, y] = label.split(" "); return Number(y) * 12 + MONTHS.indexOf(m); };

// The strip's columns, oldest first, with a { gap } column for every month
// that has no issue, so a missing month shows instead of silently closing up.
export const withGaps = (digests = DIGEST_DATA) => chronological(digests).flatMap((d, i, all) => {
  if (i === 0) return [d];
  const missing = [];
  for (let m = monthIndex(all[i - 1].month) + 1; m < monthIndex(d.month); m++) missing.push({ gap: `${MONTHS[m % 12]} ${Math.floor(m / 12)}` });
  return [...missing, d];
});

// The issue to open on: the newest one that is finished.
export const latestComplete = (digests = DIGEST_DATA) => digests.find(d => !d.generating) || digests[0];

// "+12 conversations" -> 12, so a topic's growth can be drawn to scale.
export const deltaCount = (delta) => Number(/\+(\d+)/.exec(delta)?.[1] || 0);

const TOPIC_BY_ID = Object.fromEntries(TOPICS.map(t => [t.id, t]));
const PIVOT_BY_TOPIC = Object.fromEntries(PIVOT_ENTRIES.map(p => [p.topicId, p]));
const PEAK = Math.max(...DIGEST_DATA.map(d => d.stats.conversations));

// ─── Pieces ─────────────────────────────────────────────────────
const sectionTitle = { fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 600, color: white(0.55), textTransform: "uppercase", letterSpacing: "0.08em", margin: `0 0 ${SPACE.md}px` };
const list = { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: SPACE.sm };
const card = { background: white(0.02), border: `1px solid ${white(0.07)}`, borderRadius: 12, padding: `${SPACE.md}px ${SPACE.lg}px` };

// The signature piece: one bar per month, height by conversations; the month
// still being written is drawn as an outline. Each bar opens that issue.
const MonthStrip = ({ selected, onSelect, mobile }) => (
  <div role="group" aria-label="Issues" style={{ display: "grid", gridTemplateColumns: `repeat(${withGaps().length}, 1fr)`, gap: mobile ? SPACE.sm : SPACE.md, alignItems: "end" }}>
    {withGaps().map(d => {
      if (d.gap) return (
        <div key={d.gap} style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: SPACE.xs, minWidth: 0 }}>
          <span style={{ fontFamily: MONO, fontSize: TYPE.xs, color: white(0.5), textAlign: "center" }}>–</span>
          <span aria-hidden="true" style={{ height: 2, background: white(0.15) }} />
          <span style={{ fontFamily: BODY, fontSize: TYPE.xs, color: white(0.55), textAlign: "center" }}>
            {mobile ? d.gap.replace(/^(\w{3})\w* (\d\d)(\d\d)$/, "$1 ’$3") : d.gap}<br />no issue
          </span>
        </div>
      );
      const on = d.id === selected;
      const h = Math.round((mobile ? 70 : 90) * d.stats.conversations / PEAK);
      return (
        <button key={d.id} onClick={() => onSelect(d.id)} aria-pressed={on}
          aria-label={`${d.month}: ${d.stats.conversations} conversations${d.generating ? ", still being written" : ""}`}
          style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: SPACE.xs, background: "none", border: "none", padding: 0, cursor: "pointer", minWidth: 0 }}>
          <span style={{ fontFamily: MONO, fontSize: TYPE.xs, fontWeight: 700, color: on ? C.gold : white(0.6), textAlign: "center" }}>{d.stats.conversations}</span>
          <span aria-hidden="true" style={{
            height: h, borderRadius: "6px 6px 2px 2px",
            background: d.generating ? "transparent" : on ? C.gold : alpha(C.gold, 0.3),
            border: `${d.generating ? "1.5px dashed" : "1px solid"} ${on ? C.gold : alpha(C.gold, 0.55)}`,
          }} />
          <span style={{ fontFamily: BODY, fontSize: TYPE.xs, fontWeight: on ? 700 : 500, color: on ? C.white : white(0.65), textAlign: "center" }}>
            {mobile ? d.month.replace(/^(\w{3})\w* (\d\d)(\d\d)$/, "$1 ’$3") : d.month}
          </span>
        </button>
      );
    })}
  </div>
);

const Stat = ({ value, label, color }) => (
  <div style={{ ...card, padding: `${SPACE.sm + 2}px ${SPACE.md}px` }}>
    <div style={{ fontFamily: MONO, fontSize: TYPE.xl, fontWeight: 700, color, lineHeight: 1.1 }}>{value}</div>
    <div style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.6), marginTop: 2 }}>{label}</div>
  </div>
);

const TopicLink = ({ id, name, color, onTopicClick }) => {
  const t = TOPIC_BY_ID[id];
  return t && onTopicClick
    ? <button onClick={() => onTopicClick(t)} aria-label={`Open the ${t.name} timeline`} style={{ fontFamily: BODY, fontSize: TYPE.base, fontWeight: 600, color, background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>{name}</button>
    : <span style={{ fontFamily: BODY, fontSize: TYPE.base, fontWeight: 600, color }}>{name}</span>;
};

const Section = ({ id, title, count, children }) => count > 0 && (
  <section aria-labelledby={id} style={{ marginBottom: SPACE.xl }}>
    <h3 id={id} style={sectionTitle}>{title} <span style={{ fontFamily: MONO, color: white(0.5) }}>· {count}</span></h3>
    {children}
  </section>
);

const Issue = ({ d, onTopicClick, mobile }) => {
  const maxDelta = Math.max(1, ...d.deepened.map(t => deltaCount(t.delta)));
  return (
    <article aria-label={`${d.month} digest`}>
      <header style={{ marginBottom: SPACE.lg }}>
        <div style={{ fontFamily: MONO, fontSize: TYPE.xs, color: d.generating ? C.gold : white(0.55), textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {d.generating ? "In progress · updates as you talk" : "Monthly digest"}
        </div>
        <h2 style={{ fontFamily: FONTS, fontSize: mobile ? TYPE.xl : TYPE.xxl - 2, fontWeight: 800, color: C.white, margin: `${SPACE.xs}px 0 0` }}>
          {d.month}{d.theme && <span style={{ color: C.gold }}>: {d.theme}</span>}
        </h2>
        {d.generating && (
          <p role="status" style={{ margin: `${SPACE.sm}px 0 0`, fontFamily: BODY, fontSize: TYPE.base, color: white(0.65), lineHeight: 1.55 }}>
            This month isn't over, so there is no theme yet. Here is what {d.stats.conversations} conversations have added so far.
          </p>
        )}
      </header>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: SPACE.sm, marginBottom: SPACE.xl }}>
        <Stat value={d.stats.conversations} label="Conversations" color={C.white} />
        <Stat value={d.stats.newTopics} label="New topics" color={d.stats.newTopics ? C.green : white(0.5)} />
        <Stat value={d.stats.pivots} label={d.stats.pivots === 1 ? "Pivot" : "Pivots"} color={d.stats.pivots ? C.purple : white(0.5)} />
        <Stat value={d.stats.insights} label="Insights kept" color={C.gold} />
      </div>

      <Section id={`${d.id}-deep`} title="Went deeper" count={d.deepened.length}>
        <ul style={list}>
          {d.deepened.map(t => (
            <li key={t.topicId} style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: SPACE.sm, flexWrap: "wrap" }}>
                <span aria-hidden="true">{t.icon}</span>
                <TopicLink id={t.topicId} name={t.name} color={t.color} onTopicClick={onTopicClick} />
                <span style={{ fontFamily: MONO, fontSize: TYPE.xs, color: C.green }}>{t.delta}</span>
              </div>
              <div aria-hidden="true" style={{ height: 4, background: white(0.06), borderRadius: 2, margin: `${SPACE.sm}px 0`, overflow: "hidden" }}>
                <div style={{ width: `${100 * deltaCount(t.delta) / maxDelta}%`, height: "100%", background: t.color }} />
              </div>
              <div style={{ fontFamily: BODY, fontSize: TYPE.base, color: white(0.7), lineHeight: 1.5 }}>{t.detail}</div>
            </li>
          ))}
        </ul>
      </Section>

      <Section id={`${d.id}-decisions`} title="Decisions made" count={d.decisions.length}>
        <ul style={list}>
          {d.decisions.map(x => (
            <li key={x.text} style={{ ...card, display: "flex", gap: SPACE.md, alignItems: "baseline" }}>
              <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: "50%", background: x.color, flexShrink: 0, transform: "translateY(-1px)" }} />
              <span style={{ fontFamily: BODY, fontSize: TYPE.base, color: white(0.85), lineHeight: 1.5 }}>{x.text}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id={`${d.id}-pivots`} title="Pivots" count={d.pivots.length}>
        <ul style={list}>
          {d.pivots.map(p => {
            const full = PIVOT_BY_TOPIC[p.topicId];
            return (
              <li key={p.text} style={{ ...card, borderColor: alpha(C.purple, 0.3) }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: SPACE.md, marginBottom: SPACE.sm }}>
                  <span style={{ fontFamily: BODY, fontSize: TYPE.base, fontWeight: 600, color: C.white, lineHeight: 1.45 }}>{p.text}</span>
                  {full && <span style={{ fontFamily: MONO, fontSize: TYPE.xs, color: full.annotated ? C.green : C.gold, flexShrink: 0 }}>{full.annotated ? "Has your note" : "No note yet"}</span>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr auto 1fr", gap: SPACE.sm, alignItems: "center" }}>
                  <span style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.65), lineHeight: 1.45 }}><strong style={{ color: white(0.5), fontWeight: 600 }}>Before: </strong>{p.before}</span>
                  <span aria-hidden="true" style={{ color: C.purple, textAlign: "center" }}>{mobile ? "↓" : "→"}</span>
                  <span style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.85), lineHeight: 1.45 }}><strong style={{ color: C.purple, fontWeight: 600 }}>After: </strong>{p.after}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section id={`${d.id}-links`} title="New connections" count={d.connections.length}>
        <ul style={list}>
          {d.connections.map(c => (
            <li key={c.from + c.to} style={{ ...card, display: "flex", gap: SPACE.md, alignItems: mobile ? "flex-start" : "baseline", flexDirection: mobile ? "column" : "row" }}>
              <span style={{ fontFamily: BODY, fontSize: TYPE.base, fontWeight: 600, color: c.color, flexShrink: 0 }}>{c.from} <span aria-hidden="true" style={{ color: white(0.5) }}>↔</span><span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}> and </span> <span style={{ color: white(0.85) }}>{c.to}</span></span>
              <span style={{ fontFamily: BODY, fontSize: TYPE.base, color: white(0.65), lineHeight: 1.5 }}>{c.label}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id={`${d.id}-quiet`} title="Went quiet" count={d.goneQuiet.length}>
        <ul style={list}>
          {d.goneQuiet.map(t => (
            <li key={t.topicId} style={{ ...card, borderStyle: "dashed" }}>
              <div style={{ display: "flex", alignItems: "center", gap: SPACE.sm, flexWrap: "wrap" }}>
                <span aria-hidden="true">{t.icon}</span>
                <TopicLink id={t.topicId} name={t.name} color={white(0.8)} onTopicClick={onTopicClick} />
                <span style={{ fontFamily: MONO, fontSize: TYPE.xs, color: white(0.55) }}>last active {t.lastActive}</span>
              </div>
              <div style={{ fontFamily: BODY, fontSize: TYPE.base, color: white(0.65), lineHeight: 1.5, marginTop: SPACE.xs }}>{t.detail}</div>
            </li>
          ))}
        </ul>
      </Section>
    </article>
  );
};

// ─── The view ───────────────────────────────────────────────────
const DigestView = ({ mobile, onTopicClick }) => {
  const [selected, setSelected] = useState(latestComplete().id);
  const digest = DIGEST_DATA.find(d => d.id === selected);
  const total = DIGEST_DATA.reduce((a, d) => a + d.stats.conversations, 0);
  const pivots = DIGEST_DATA.reduce((a, d) => a + d.stats.pivots, 0);
  const span = chronological();
  const gaps = withGaps().filter(g => g.gap);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <header style={{ marginBottom: SPACE.xl, maxWidth: 680 }}>
        <h1 style={{ fontFamily: FONTS, fontSize: mobile ? TYPE.xl : TYPE.xxl, fontWeight: 800, color: C.white, letterSpacing: "-0.01em", margin: 0 }}>Thinking <span style={{ color: C.gold }}>digest</span></h1>
        <p style={{ fontFamily: BODY, fontSize: mobile ? TYPE.base : TYPE.md, color: white(0.6), lineHeight: 1.55, margin: `${SPACE.sm}px 0 0` }}>
          One issue a month: what you went deeper on, what you decided, where you changed your mind. {DIGEST_DATA.length} issues from {span[0].month} to {span.at(-1).month}{gaps.length ? ` (none for ${gaps.map(g => g.gap).join(", ")})` : ""}, {total} conversations and {pivots} pivots.
        </p>
      </header>

      <section aria-label="Pick an issue" style={{ ...card, padding: mobile ? SPACE.md : SPACE.lg, borderRadius: 16, marginBottom: SPACE.xxl }}>
        <MonthStrip selected={selected} onSelect={setSelected} mobile={mobile} />
      </section>

      <Issue key={digest.id} d={digest} onTopicClick={onTopicClick} mobile={mobile} />
    </div>
  );
};

export default DigestView;
