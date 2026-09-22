import { useState } from "react";
import {
  TOPICS, INSIGHTS, REDISCOVERIES, INSIGHT_DECISIONS, getInsightStaleness,
  RECURATION_COUNTS, MONTHLY_ACTIVITY,
} from '../data/constants';
import StatCard from '../components/StatCard';
import TopicBubble from '../components/TopicBubble';
import ActivityChart from '../components/ActivityChart';
import { C, alpha, white, FONTS, BODY, MONO, SPACE, TYPE } from '../styles/tokens';

// The Atlas station's home: what the atlas holds, what needs you, how it got
// here. V7_PLAN.md row 4. Order is by what a returning user acts on first:
// the numbers, the map, the attention list, then the story and the traits.

/** Everything on the dashboard that asks the user to do something. Pure. */
export function buildAttention({ decisions = INSIGHT_DECISIONS, topics = TOPICS, counts = RECURATION_COUNTS, staleness = getInsightStaleness } = {}) {
  const byId = Object.fromEntries(topics.map(t => [t.id, t]));
  const stale = decisions
    .map(d => ({ ...d, warning: staleness(d.date), topic: byId[d.topicId] }))
    .filter(d => d.warning && d.topic);
  const unreviewed = topics
    .filter(t => counts[t.id] > 0)
    .map(t => ({ topic: t, count: counts[t.id] }))
    .sort((a, b) => b.count - a.count);
  return { stale, unreviewed, newConversations: unreviewed.reduce((n, u) => n + u.count, 0) };
}

/** The one-line story of the journey chart. Pure. */
export function summarizeJourney(months = MONTHLY_ACTIVITY) {
  if (!months.length) return null;
  const crossover = months.find(m => m.claude > m.gpt);
  const last = months[months.length - 1];
  const total = last.claude + last.gpt;
  return {
    crossover: crossover?.month ?? null,
    latestMonth: last.month,
    latestClaudeShare: total ? Math.round((100 * last.claude) / total) : 0,
  };
}

const SectionHead = ({ title, sub, action, mobile }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: SPACE.md, marginBottom: SPACE.md }}>
    <div style={{ minWidth: 0 }}>
      <h2 style={{ fontFamily: FONTS, fontSize: mobile ? TYPE.lg : TYPE.xl, color: C.white, fontWeight: 700, lineHeight: 1.2 }}>{title}</h2>
      {sub && <p style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.45), marginTop: SPACE.xs, lineHeight: 1.5 }}>{sub}</p>}
    </div>
    {action}
  </div>
);

const Card = ({ children, style, ...rest }) => (
  <div {...rest} style={{ background: white(0.025), border: `1px solid ${white(0.06)}`, borderRadius: 14, ...style }}>{children}</div>
);

const LegendItem = ({ swatch, label }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: BODY, fontSize: TYPE.xs, color: white(0.5) }}>
    {swatch}{label}
  </span>
);

export const AttentionPanel = ({ attention, onTopicClick, mobile }) => {
  const [showAll, setShowAll] = useState(false);
  const { stale, unreviewed, newConversations } = attention;
  const shown = showAll ? stale : stale.slice(0, 3);
  const empty = stale.length === 0 && unreviewed.length === 0;

  return (
    <section aria-label="Needs your attention" style={{ marginBottom: mobile ? SPACE.xxl : SPACE.xxxl }}>
      <SectionHead mobile={mobile} title="Needs your attention"
        sub={empty ? null : `${stale.length} decision${stale.length === 1 ? "" : "s"} to revisit · ${newConversations} new conversation${newConversations === 1 ? "" : "s"} across ${unreviewed.length} topic${unreviewed.length === 1 ? "" : "s"}`} />
      {empty ? (
        <Card style={{ padding: SPACE.xl, textAlign: "center" }}>
          <div style={{ fontSize: 22, marginBottom: SPACE.sm }}>✓</div>
          <div style={{ fontFamily: BODY, fontSize: TYPE.base, color: white(0.7), fontWeight: 600 }}>You're caught up</div>
          <div style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.45), marginTop: SPACE.xs }}>No stale decisions and nothing new since your last review.</div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "3fr 2fr", gap: SPACE.md }}>
          <Card style={{ padding: SPACE.lg }}>
            <div style={{ fontFamily: BODY, fontSize: TYPE.xs, color: alpha(C.red, 0.9), textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: SPACE.sm }}>⏳ Decisions to revisit</div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: SPACE.sm }}>
              {shown.map(d => (
                <li key={d.id} style={{ borderLeft: `2px solid ${d.topic.color}`, paddingLeft: SPACE.md }}>
                  <div style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.75), lineHeight: 1.5 }}>
                    <span style={{ color: d.topic.color, fontWeight: 600 }}>{d.topic.name}.</span> {d.aiProposal}
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: TYPE.xs, color: alpha(C.red, 0.85), marginTop: 2 }}>{d.warning}</div>
                </li>
              ))}
            </ul>
            {stale.length > 3 && (
              <button onClick={() => setShowAll(v => !v)} aria-expanded={showAll} style={{
                marginTop: SPACE.md, fontFamily: BODY, fontSize: TYPE.sm, color: white(0.55), background: "none",
                border: "none", padding: 0, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3,
              }}>{showAll ? "Show fewer" : `Show all ${stale.length}`}</button>
            )}
          </Card>
          <Card style={{ padding: SPACE.lg }}>
            <div style={{ fontFamily: BODY, fontSize: TYPE.xs, color: C.amber, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: SPACE.sm }}>✦ New since your last review</div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: SPACE.xs }}>
              {unreviewed.map(({ topic, count }) => (
                <li key={topic.id}>
                  <button onClick={() => onTopicClick(topic)} style={{
                    width: "100%", display: "flex", alignItems: "center", gap: SPACE.sm, textAlign: "left",
                    background: "none", border: "none", borderRadius: 8, padding: `${SPACE.sm}px ${SPACE.sm}px`, cursor: "pointer",
                  }}>
                    <span style={{ width: 20, textAlign: "center" }}>{topic.icon}</span>
                    <span style={{ flex: 1, fontFamily: BODY, fontSize: TYPE.sm, color: white(0.8) }}>{topic.name}</span>
                    <span style={{ fontFamily: MONO, fontSize: TYPE.xs, color: C.amber }}>+{count}</span>
                    <span aria-hidden style={{ color: white(0.3), fontSize: TYPE.sm }}>→</span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </section>
  );
};

const DashboardView = ({ mobile, tablet, totalConvos, totalWords, maxCount, onTopicClick, onBriefMe, recentlySynced, onRewind }) => {
  const attention = buildAttention();
  const journey = summarizeJourney();
  const gap = mobile ? SPACE.xxl : SPACE.xxxl;

  return (
    <>
      {/* Hero */}
      <header style={{ textAlign: "center", marginBottom: mobile ? SPACE.xl : SPACE.xxl }}>
        <div style={{ fontFamily: BODY, fontSize: TYPE.xs, color: alpha(C.gold, 0.6), textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: SPACE.md, fontWeight: 600 }}>Your AI knowledge atlas</div>
        <h1 style={{ fontFamily: FONTS, fontSize: mobile ? TYPE.xxl : TYPE.display, fontWeight: 800, color: C.white, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
          3 years of thinking,{mobile ? <br /> : " "}<span style={{ color: C.gold }}>mapped</span>
        </h1>
        <p style={{ fontFamily: BODY, fontSize: mobile ? TYPE.sm : TYPE.base, color: white(0.45), marginTop: SPACE.sm }}>Jan 2023 – Feb 2026 · ChatGPT + Claude · {(totalWords / 1000000).toFixed(1)}M words</p>
      </header>

      {/* Stat band */}
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : tablet ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: mobile ? SPACE.sm : SPACE.md, marginBottom: gap }}>
        <StatCard label="Conversations" value={totalConvos} sub="across 2 platforms" delay={100} accent={C.gold} mobile={mobile} />
        <StatCard label="Your words" value={Math.floor(totalWords * 0.38)} sub={mobile ? "your thinking in text" : "about a 1,600-page book"} delay={250} accent={C.green} mobile={mobile} />
        <StatCard label="Topic clusters" value={TOPICS.length} sub="auto-discovered" delay={400} accent={C.blue} mobile={mobile} />
        <StatCard label="Longest streak" value={34} sub="days · Nov 2024" delay={550} accent={C.purple} mobile={mobile} />
      </div>

      {/* Knowledge map */}
      <section data-tour="knowledge-map" aria-label="Knowledge map" style={{ marginBottom: gap }}>
        <SectionHead mobile={mobile} title="Knowledge map"
          sub={`${TOPICS.length} topics, sized by conversation count. ${mobile ? "Tap" : "Hover or click"} one to explore it.`}
          action={
            <button data-tour="rewind-btn" onClick={onRewind} style={{
              fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 500, color: C.pink, background: alpha(C.pink, 0.08),
              border: `1px solid ${alpha(C.pink, 0.25)}`, borderRadius: 8, padding: `${SPACE.sm - 2}px ${SPACE.md}px`,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
            }}><span aria-hidden>⏪</span> Rewind</button>
          } />
        <Card style={{ padding: mobile ? `${SPACE.lg}px ${SPACE.sm}px` : `${SPACE.xl}px ${SPACE.lg}px`, borderRadius: 18 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: mobile ? SPACE.sm : SPACE.md, justifyContent: "center", alignItems: "center" }}>
            {TOPICS.map((topic, i) => <TopicBubble key={topic.id} topic={topic} maxCount={maxCount} index={i} onClick={onTopicClick} onBriefMe={onBriefMe} mobile={mobile} recentlySynced={recentlySynced} />)}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: `${SPACE.xs}px ${SPACE.lg}px`, justifyContent: "center", marginTop: SPACE.lg, paddingTop: SPACE.md, borderTop: `1px solid ${white(0.05)}` }}>
            <LegendItem label="Bigger = more conversations" swatch={<span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}><span style={{ width: 6, height: 6, borderRadius: "50%", border: `1px solid ${white(0.5)}` }} /><span style={{ width: 10, height: 10, borderRadius: "50%", border: `1px solid ${white(0.5)}` }} /></span>} />
            <LegendItem label="Glowing ring = new since last review" swatch={<span style={{ width: 10, height: 10, borderRadius: "50%", border: `1px solid ${C.gold}`, boxShadow: `0 0 6px ${alpha(C.gold, 0.6)}` }} />} />
            <LegendItem label="Faded = dormant" swatch={<span style={{ width: 10, height: 10, borderRadius: "50%", background: white(0.15) }} />} />
          </div>
        </Card>
      </section>

      <AttentionPanel attention={attention} onTopicClick={onTopicClick} mobile={mobile} />

      {/* The journey */}
      <section data-tour="ai-journey" aria-label="Your AI journey" style={{ marginBottom: gap }}>
        <SectionHead mobile={mobile} title="Your AI journey"
          sub={journey?.crossover
            ? `Claude passed ChatGPT in ${journey.crossover}. By ${journey.latestMonth} it was ${journey.latestClaudeShare}% of your conversations.`
            : "Conversations per month, by platform."}
          action={
            <div style={{ display: "flex", gap: SPACE.md, flexShrink: 0 }}>
              <LegendItem label="ChatGPT" swatch={<span style={{ width: 10, height: 10, borderRadius: 2, background: C.blue }} />} />
              <LegendItem label="Claude" swatch={<span style={{ width: 10, height: 10, borderRadius: 2, background: C.gold }} />} />
            </div>
          } />
        <Card style={{ padding: mobile ? `${SPACE.lg}px ${SPACE.md}px ${SPACE.md}px` : `${SPACE.xl}px ${SPACE.xl}px ${SPACE.md}px` }}>
          <ActivityChart mobile={mobile} summary={journey} />
        </Card>
      </section>

      {/* Traits and rediscoveries */}
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? SPACE.xxl : SPACE.xl }}>
        <section aria-label="How you think">
          <SectionHead mobile={mobile} title="How you think" sub="Patterns across all 3,847 conversations." />
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: SPACE.sm }}>
            {INSIGHTS.slice(0, mobile ? 3 : 5).map(trait => (
              <li key={trait.title}>
                <Card style={{ padding: `${SPACE.md}px ${SPACE.lg}px` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: SPACE.sm, marginBottom: 2 }}>
                    <span style={{ fontFamily: BODY, fontSize: TYPE.base, color: C.gold, fontWeight: 600 }}><span aria-hidden>{trait.icon}</span> {trait.title}</span>
                    <span style={{ fontFamily: MONO, fontSize: TYPE.xs, color: alpha(C.gold, 0.8) }}>{trait.pct}%</span>
                  </div>
                  <div style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.55), lineHeight: 1.5, marginBottom: SPACE.sm }}>{trait.desc}</div>
                  <div role="progressbar" aria-label={trait.title} aria-valuenow={trait.pct} aria-valuemin={0} aria-valuemax={100} style={{ height: 4, background: white(0.06), borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${trait.pct}%`, height: "100%", background: C.gold, borderRadius: 2 }} />
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </section>
        <section aria-label="Rediscovered today">
          <SectionHead mobile={mobile} title="Rediscovered today" sub="Things you worked out once and may have forgotten." />
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: SPACE.sm }}>
            {REDISCOVERIES.map(item => (
              <li key={item.text}>
                <Card style={{ padding: `${SPACE.md}px ${SPACE.lg}px`, display: "flex", gap: SPACE.md }}>
                  <span aria-hidden style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontFamily: MONO, fontSize: TYPE.xs, color: alpha(C.gold, 0.8), marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.ago}</div>
                    <div style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.7), lineHeight: 1.55 }}>{item.text}</div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
};

export default DashboardView;
