import { useState, useEffect, useRef } from "react";
import { TOPICS, BRIEFINGS, TIMELINE_DATA } from '../data/constants';
import FreshnessBadge from './FreshnessBadge';
import { C, alpha, white, black, FONTS, BODY, MONO, SPACE, TYPE } from '../styles/tokens';

// ─── The briefing, as data ──────────────────────────────────────
// The last activity is the topic's latest timeline event, read from the
// timeline rather than typed beside it (three of four typed dates had drifted
// a year from the event they named), so it can link to that conversation.
export const lastActivityOf = (topicId) => {
  const events = TIMELINE_DATA[topicId] || [];
  if (!events.length) return null;
  const index = events.reduce((best, e, i) => (e.date >= events[best].date ? i : best), 0);
  return { ...events[index], index };
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const formatDate = (iso) => { const [y, m, d] = iso.split("-").map(Number); return `${MONTHS[m - 1]} ${d}, ${y}`; };

const nameOf = (id) => TOPICS.find(t => t.id === id)?.name || id;

// The briefing as plain text, the form it is copied in to paste into a chat.
export const briefingText = (topic, briefing = BRIEFINGS[topic.id]) => {
  const last = lastActivityOf(topic.id);
  return [
    `PRE-FLIGHT BRIEFING: ${topic.name}`,
    "=".repeat(40),
    "",
    "SUMMARY",
    briefing.summary,
    "",
    "KEY DECISIONS",
    ...briefing.decisions.map(d => `  - ${d}`),
    "",
    "OPEN QUESTIONS",
    ...briefing.openQuestions.map(q => `  - ${q}`),
    "",
    "RELEVANT CONNECTIONS",
    ...briefing.connections.map(c => `  - ${nameOf(c.topicId)}: ${c.summary}`),
    ...(last ? ["", `LAST ACTIVITY (${formatDate(last.date)})`, `${last.title}: ${last.summary}`] : []),
    "",
    "SUGGESTED STARTING PROMPT",
    briefing.suggestedPrompt,
  ].join("\n");
};

// ─── Pieces ─────────────────────────────────────────────────────
const Section = ({ title, color, children }) => (
  <section style={{ marginBottom: SPACE.xl }}>
    <h3 style={{ fontFamily: BODY, fontSize: TYPE.sm, color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", margin: `0 0 ${SPACE.sm}px` }}>{title}</h3>
    {children}
  </section>
);

const Marked = ({ items, mark, color }) => (
  <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: SPACE.xs + 2 }}>
    {items.map(text => (
      <li key={text} style={{ display: "flex", gap: SPACE.sm, alignItems: "baseline" }}>
        <span aria-hidden="true" style={{ fontFamily: MONO, fontSize: TYPE.sm, fontWeight: 700, color, flexShrink: 0 }}>{mark}</span>
        <span style={{ fontFamily: BODY, fontSize: TYPE.base, color: white(0.8), lineHeight: 1.5 }}>{text}</span>
      </li>
    ))}
  </ul>
);

const rowButton = { display: "flex", gap: SPACE.md, alignItems: "center", width: "100%", textAlign: "left", background: white(0.03), border: `1px solid ${white(0.1)}`, borderRadius: 8, padding: `${SPACE.sm + 2}px ${SPACE.md}px`, cursor: "pointer" };

// ─── The card ───────────────────────────────────────────────────
const BriefingCard = ({ topic, onClose, onTopicClick, onConversationClick, mobile }) => {
  const briefing = BRIEFINGS[topic.id];
  const last = lastActivityOf(topic.id);
  const [status, setStatus] = useState(null);
  const timer = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => { closeRef.current?.focus(); }, []);
  useEffect(() => () => clearTimeout(timer.current), []);

  const say = (s) => { setStatus(s); clearTimeout(timer.current); timer.current = setTimeout(() => setStatus(null), 2500); };
  const copy = () => {
    const text = briefingText(topic, briefing);
    if (!navigator.clipboard?.writeText) { say("fail"); return; }
    navigator.clipboard.writeText(text).then(() => say("ok")).catch((e) => { console.warn('briefing: clipboard refused:', e); say("fail"); });
  };
  const openTopic = (t) => { onClose(); onTopicClick?.(t); };

  const headingId = `briefing-${topic.id}`;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby={headingId} onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 9999, background: black(0.75), backdropFilter: "blur(8px)",
      display: "flex", alignItems: mobile ? "flex-start" : "center", justifyContent: "center", padding: mobile ? SPACE.lg : SPACE.xxxl - 8,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.bg1, border: `1px solid ${alpha(topic.color, 0.35)}`, borderRadius: 18, width: "100%", maxWidth: 640,
        maxHeight: mobile ? "calc(100vh - 32px)" : "90vh", overflow: "auto", boxShadow: `0 24px 80px ${black(0.6)}`,
      }}>
        <header style={{ padding: mobile ? `${SPACE.xl}px ${SPACE.lg}px ${SPACE.lg}px` : `${SPACE.xl}px ${SPACE.xl + 4}px ${SPACE.lg}px`, borderBottom: `1px solid ${alpha(topic.color, 0.2)}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: SPACE.md }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: BODY, fontSize: TYPE.xs, color: topic.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: SPACE.xs }}>Pre-flight briefing</div>
            <h2 id={headingId} style={{ display: "flex", alignItems: "center", gap: SPACE.sm, flexWrap: "wrap", fontFamily: FONTS, fontSize: mobile ? TYPE.xl : TYPE.xxl, fontWeight: 700, color: C.white, margin: 0 }}>
              <span aria-hidden="true">{topic.icon}</span>{topic.name}<FreshnessBadge topic={topic} />
            </h2>
            <div style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.6), marginTop: SPACE.xs }}>
              {topic.count} conversations · {Math.round(topic.words / 1000)}k words · {topic.firstSeen} to {topic.lastSeen}
            </div>
          </div>
          <button ref={closeRef} onClick={onClose} aria-label="Close the briefing" style={{
            background: white(0.05), border: `1px solid ${white(0.14)}`, borderRadius: 8, width: 32, height: 32, flexShrink: 0,
            cursor: "pointer", color: white(0.7), fontSize: TYPE.lg, display: "flex", alignItems: "center", justifyContent: "center",
          }}><span aria-hidden="true">×</span></button>
        </header>

        <div style={{ padding: mobile ? SPACE.lg : `${SPACE.xl}px ${SPACE.xl + 4}px` }}>
          {!briefing && (
            <p style={{ fontFamily: BODY, fontSize: TYPE.md, color: white(0.75), lineHeight: 1.6, margin: `0 0 ${SPACE.xl}px`, padding: SPACE.md, border: `1px dashed ${white(0.16)}`, borderRadius: 10 }}>
              Atlas hasn't written a briefing for {topic.name} yet. Briefings exist for {Object.keys(BRIEFINGS).map(nameOf).join(", ")}. Its timeline has everything logged so far.
            </p>
          )}
          {briefing && (
            <>
              <Section title="Summary" color={topic.color}>
                <p style={{ fontFamily: BODY, fontSize: TYPE.md - 1, color: white(0.8), lineHeight: 1.65, margin: 0 }}>{briefing.summary}</p>
              </Section>
              <Section title="Key decisions" color={C.green}><Marked items={briefing.decisions} mark="+" color={C.green} /></Section>
              <Section title="Open questions" color={C.gold}><Marked items={briefing.openQuestions} mark="?" color={C.gold} /></Section>
              <Section title="Relevant connections" color={C.blue}>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: SPACE.xs + 2 }}>
                  {briefing.connections.map(c => {
                    const t = TOPICS.find(x => x.id === c.topicId);
                    return (
                      <li key={c.topicId}>
                        <button onClick={() => openTopic(t)} style={rowButton}>
                          <span aria-hidden="true" style={{ fontSize: TYPE.md, flexShrink: 0 }}>{t.icon}</span>
                          <span style={{ flex: 1, minWidth: 0, fontFamily: BODY, fontSize: TYPE.sm, lineHeight: 1.5 }}>
                            <span style={{ color: t.color, fontWeight: 700 }}>{t.name}</span>
                            <span style={{ color: white(0.7) }}>: {c.summary}</span>
                          </span>
                          <span aria-hidden="true" style={{ color: white(0.5), flexShrink: 0 }}>→</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </Section>
            </>
          )}

          {last && (
            <Section title="Last activity" color={white(0.7)}>
              <button onClick={() => { onClose(); onConversationClick?.(topic.id, last.index); }} style={rowButton}>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontFamily: MONO, fontSize: TYPE.xs, color: white(0.6) }}>{formatDate(last.date)}</span>
                  <span style={{ display: "block", fontFamily: BODY, fontSize: TYPE.base, fontWeight: 600, color: C.white, marginTop: 2 }}>{last.title}</span>
                  <span style={{ display: "block", fontFamily: BODY, fontSize: TYPE.sm, color: white(0.7), marginTop: 2 }}>{last.summary}</span>
                </span>
                <span aria-hidden="true" style={{ color: white(0.5), flexShrink: 0 }}>→</span>
              </button>
            </Section>
          )}

          {briefing && (
            <Section title="Suggested starting prompt" color={C.purple}>
              <blockquote style={{ margin: 0, background: alpha(C.purple, 0.07), borderRadius: 10, padding: `${SPACE.md}px ${SPACE.lg}px`, border: `1px solid ${alpha(C.purple, 0.25)}`, fontFamily: BODY, fontSize: TYPE.base, color: white(0.8), lineHeight: 1.6 }}>
                {briefing.suggestedPrompt}
              </blockquote>
            </Section>
          )}

          <div style={{ display: "flex", gap: SPACE.sm, flexWrap: "wrap", alignItems: "center" }}>
            {briefing && (
              <button onClick={copy} style={{
                flex: 1, minWidth: 200, padding: `${SPACE.md}px 0`, borderRadius: 10, cursor: "pointer",
                background: alpha(topic.color, 0.12), border: `1px solid ${alpha(topic.color, 0.4)}`,
                fontFamily: BODY, fontSize: TYPE.base, fontWeight: 700, color: topic.color,
              }}>Copy briefing</button>
            )}
            <button onClick={() => openTopic(topic)} style={{
              flex: briefing ? "0 0 auto" : 1, padding: `${SPACE.md}px ${SPACE.lg}px`, borderRadius: 10, cursor: "pointer",
              background: white(0.04), border: `1px solid ${white(0.14)}`, fontFamily: BODY, fontSize: TYPE.base, fontWeight: 600, color: white(0.85),
            }}>Open the timeline →</button>
          </div>
          <p role="status" style={{ minHeight: 18, margin: `${SPACE.sm}px 0 0`, fontFamily: BODY, fontSize: TYPE.sm, color: status === "fail" ? C.red : C.green }}>
            {status === "ok" ? "Copied. Paste it into a new chat to pick up where you left off." : status === "fail" ? "The browser would not let Atlas copy. Select the text above instead." : ""}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BriefingCard;
