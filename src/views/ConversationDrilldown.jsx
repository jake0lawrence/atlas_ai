import {
  TOPICS, TIMELINE_DATA, TYPE_META, CONVERSATION_PREVIEWS,
} from '../data/constants';
import Breadcrumbs from '../components/Breadcrumbs';
import { C, alpha, white, FONTS, BODY, MONO, SPACE, TYPE } from '../styles/tokens';

// One conversation from a topic's timeline: why it matters, the thread with
// what Atlas extracted from it, and the way to the neighbouring threads.
// Events without a transcript in the demo get a designed page, not a blank one.
// V7_PLAN.md row 6.

/**
 * Where each extraction sits in the message, found by its text (the fixture
 * offsets drift). Unfound or overlapping extractions are dropped rather than
 * highlighting the wrong words. Pure.
 */
export function locateExtractions(text, extractions = []) {
  const found = [];
  for (const ext of extractions) {
    const at = ext.text ? text.indexOf(ext.text) : -1;
    if (at < 0) continue;
    found.push({ ...ext, start: at, end: at + ext.text.length });
  }
  found.sort((a, b) => a.start - b.start);
  return found.filter((e, i) => i === 0 || e.start >= found[i - 1].end);
}

/** Split a message into prose and ``` fenced code, without the fences. Pure. */
export function splitCode(text) {
  const parts = text.split(/```[a-z]*\n?/);
  return parts.map((p, i) => ({ code: i % 2 === 1, text: i % 2 === 1 ? p.replace(/\n$/, "") : p })).filter(p => p.text.trim() !== "");
}

/** Indexes of this topic's events that have a transcript. Pure. */
export const transcriptIndexes = (topicId) =>
  (TIMELINE_DATA[topicId] || []).map((_, i) => i).filter(i => CONVERSATION_PREVIEWS[`${topicId}:${i}`]);

const Highlighted = ({ text, extractions }) => {
  const ranges = locateExtractions(text, extractions);
  const out = [];
  let last = 0;
  ranges.forEach((r, i) => {
    if (r.start > last) out.push(<span key={`t${i}`}>{text.slice(last, r.start)}</span>);
    const slice = text.slice(r.start, r.end);
    out.push(r.type === "decision"
      ? <mark key={`e${i}`} style={{ background: alpha(C.gold, 0.2), color: C.gold, padding: "1px 3px", borderRadius: 3, fontWeight: 500 }}>{slice}</mark>
      : <span key={`e${i}`} style={{ textDecoration: "underline", textDecorationColor: alpha(C.gold, 0.6), textUnderlineOffset: 3 }}>{slice}</span>);
    last = r.end;
  });
  if (last < text.length) out.push(<span key="tail">{text.slice(last)}</span>);
  return out;
};

const MessageBody = ({ msg, isUser }) => splitCode(msg.text).map((part, i) => part.code ? (
  <pre key={i} style={{ fontFamily: MONO, fontSize: TYPE.xs + 1, color: white(0.8), background: C.bg0, border: `1px solid ${white(0.08)}`, borderRadius: 8, padding: SPACE.md, margin: `${SPACE.sm}px 0`, overflowX: "auto", lineHeight: 1.5 }}>{part.text}</pre>
) : (
  <p key={i} style={{ fontFamily: BODY, fontSize: TYPE.base, color: white(0.8), lineHeight: 1.6, margin: 0 }}>
    {isUser ? part.text : <Highlighted text={part.text} extractions={msg.extractions} />}
  </p>
));

const ThreadLink = ({ label, event, onClick, align }) => (
  <button onClick={onClick} style={{ flex: 1, minWidth: 0, textAlign: align, background: white(0.025), border: `1px solid ${white(0.08)}`, borderRadius: 10, padding: `${SPACE.md}px ${SPACE.lg}px`, cursor: "pointer" }}>
    <div style={{ fontFamily: BODY, fontSize: TYPE.xs, color: white(0.5), marginBottom: 2 }}>{label}</div>
    <div style={{ fontFamily: BODY, fontSize: TYPE.sm, color: C.gold, fontWeight: 600 }}>{event.title}</div>
  </button>
);

const MetaRow = ({ label, children }) => (
  <div style={{ marginBottom: SPACE.md }}>
    <div style={{ fontFamily: BODY, fontSize: TYPE.xs, color: white(0.5), marginBottom: SPACE.xs }}>{label}</div>
    {children}
  </div>
);

const Pill = ({ color, children }) => (
  <span style={{ fontFamily: BODY, fontSize: TYPE.xs, padding: "3px 8px", borderRadius: 12, background: alpha(color, 0.1), border: `1px solid ${alpha(color, 0.25)}`, color }}>{children}</span>
);

const ConversationDrilldown = ({ topicId, eventIndex, onBack, onHome, onEventClick, mobile }) => {
  const convo = CONVERSATION_PREVIEWS[`${topicId}:${eventIndex}`];
  const topic = TOPICS.find(t => t.id === topicId);
  const event = (TIMELINE_DATA[topicId] || [])[eventIndex];

  if (!topic || !event) {
    return (
      <div style={{ padding: `${SPACE.xxxl}px 0`, textAlign: "center" }}>
        <h1 style={{ fontFamily: FONTS, fontSize: TYPE.xl, color: C.white }}>That conversation isn't in this atlas</h1>
        <button onClick={onHome} style={{ marginTop: SPACE.lg, fontFamily: BODY, fontSize: TYPE.base, color: C.gold, background: "none", border: "none", cursor: "pointer" }}>Back to the overview →</button>
      </div>
    );
  }

  const meta = TYPE_META[event.type] || TYPE_META.build;
  const threads = transcriptIndexes(topicId);
  const pos = threads.indexOf(eventIndex);
  const prev = pos > 0 ? threads[pos - 1] : null;
  const next = pos >= 0 && pos < threads.length - 1 ? threads[pos + 1] : null;
  const events = TIMELINE_DATA[topicId];
  const go = (i) => onEventClick && onEventClick(topicId, i);

  const header = (
    <>
      <Breadcrumbs items={[{ label: "Overview", onClick: onHome }, { label: topic.name, onClick: onBack }, { label: event.title }]} />
      <header style={{ marginBottom: SPACE.lg }}>
        <div style={{ display: "flex", gap: SPACE.sm, marginBottom: SPACE.sm, flexWrap: "wrap" }}>
          <Pill color={meta.color}>{meta.icon} {meta.label}</Pill>
          {convo && <Pill color={convo.platform === "Claude" ? C.gold : C.blue}>{convo.platform}</Pill>}
        </div>
        <h1 style={{ fontFamily: FONTS, fontSize: mobile ? TYPE.xl : TYPE.xxl, fontWeight: 700, color: C.white, lineHeight: 1.2 }}>{event.title}</h1>
        <p style={{ fontFamily: BODY, fontSize: TYPE.base, color: white(0.55), marginTop: SPACE.xs }}><span aria-hidden>{topic.icon}</span> {topic.name} · {event.date} · {event.messages} messages</p>
      </header>
    </>
  );

  if (!convo) {
    return (
      <div style={{ paddingBottom: SPACE.xxl }}>
        {header}
        <section aria-label="Summary" style={{ background: white(0.025), border: `1px solid ${white(0.08)}`, borderRadius: 12, padding: SPACE.xl }}>
          <p style={{ fontFamily: BODY, fontSize: TYPE.md, color: white(0.8), lineHeight: 1.6 }}>{event.summary}</p>
          <p style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.55), lineHeight: 1.6, marginTop: SPACE.md }}>
            Only the summary of this conversation is in the demo. With your own export, Atlas shows the full thread here with its decisions and entities marked.
          </p>
          {threads.length > 0 && (
            <>
              <div style={{ fontFamily: BODY, fontSize: TYPE.xs, color: alpha(C.gold, 0.8), textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, margin: `${SPACE.lg}px 0 ${SPACE.sm}px` }}>Threads you can read in {topic.name}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: SPACE.sm }}>
                {threads.map(i => <ThreadLink key={i} label={events[i].date} event={events[i]} onClick={() => go(i)} align="left" />)}
              </div>
            </>
          )}
        </section>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: SPACE.xxl }}>
      {header}

      <aside aria-label="Why this matters" style={{ display: "flex", gap: SPACE.md, background: alpha(C.gold, 0.06), border: `1px solid ${alpha(C.gold, 0.2)}`, borderRadius: 10, padding: `${SPACE.md}px ${SPACE.lg}px`, marginBottom: SPACE.xl }}>
        <span aria-hidden>💡</span>
        <div>
          <div style={{ fontFamily: BODY, fontSize: TYPE.xs, color: C.gold, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: SPACE.xs }}>Why this matters</div>
          <div style={{ fontFamily: BODY, fontSize: TYPE.base, color: white(0.8), lineHeight: 1.55 }}>{convo.whyItMatters}</div>
        </div>
      </aside>

      {/* Stretched on a phone: a fit-content column grew to the widest code line
          and pushed the page 23px past the screen; the code block scrolls instead. */}
      <div style={{ display: "flex", gap: SPACE.xl, flexDirection: mobile ? "column" : "row", alignItems: mobile ? "stretch" : "flex-start" }}>
        <section aria-label="Conversation thread" style={{ flex: 1, minWidth: 0 }}>
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: SPACE.sm + 2 }}>
            {convo.messages.map((msg, i) => {
              const isUser = msg.role === "user";
              const found = isUser ? [] : locateExtractions(msg.text, msg.extractions);
              return (
                <li key={i} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: mobile ? "94%" : "84%", minWidth: 0,
                    background: isUser ? alpha(C.gold, 0.08) : white(0.03), border: `1px solid ${isUser ? alpha(C.gold, 0.25) : white(0.08)}`,
                    borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px", padding: `${SPACE.md}px ${SPACE.lg}px`,
                  }}>
                    <div style={{ fontFamily: MONO, fontSize: TYPE.xs, color: isUser ? C.gold : white(0.5), marginBottom: SPACE.xs, fontWeight: 600 }}>{isUser ? "You" : convo.platform}</div>
                    <MessageBody msg={msg} isUser={isUser} />
                    {found.length > 0 && (
                      <ul aria-label="Extracted by Atlas" style={{ listStyle: "none", margin: `${SPACE.sm}px 0 0`, padding: 0, display: "flex", flexDirection: "column", gap: SPACE.xs }}>
                        {found.map((ext, j) => (
                          <li key={j} style={{ fontFamily: BODY, fontSize: TYPE.xs, color: ext.type === "decision" ? C.gold : white(0.6) }}>
                            <span aria-hidden>{ext.type === "decision" ? "🎯" : "📌"}</span> <strong style={{ fontWeight: 600 }}>{ext.type === "decision" ? "Decision" : "Entity"}:</strong> {ext.text}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
          <p style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.5), marginTop: SPACE.lg, textAlign: "center" }}>An excerpt: {convo.messages.length} of {event.messages} messages.</p>
          {(prev != null || next != null) && (
            <nav aria-label="Other threads" style={{ display: "flex", gap: SPACE.sm, marginTop: SPACE.lg, flexDirection: mobile ? "column" : "row" }}>
              {prev != null && <ThreadLink label="← Earlier thread" event={events[prev]} onClick={() => go(prev)} align="left" />}
              {next != null && <ThreadLink label="Later thread →" event={events[next]} onClick={() => go(next)} align="right" />}
            </nav>
          )}
        </section>

        <aside aria-label="About this conversation" style={{ width: mobile ? "100%" : 230, flexShrink: 0, background: white(0.025), border: `1px solid ${white(0.08)}`, borderRadius: 12, padding: SPACE.lg }}>
          <MetaRow label="Platform"><div style={{ fontFamily: BODY, fontSize: TYPE.base, color: convo.platform === "Claude" ? C.gold : C.blue, fontWeight: 600 }}>{convo.platform}</div></MetaRow>
          <MetaRow label="Date"><div style={{ fontFamily: MONO, fontSize: TYPE.sm, color: white(0.8) }}>{convo.date}</div></MetaRow>
          <MetaRow label="Words"><div style={{ fontFamily: MONO, fontSize: TYPE.sm, color: white(0.8) }}>{convo.wordCount.toLocaleString()}</div></MetaRow>
          <MetaRow label="Entities"><div style={{ display: "flex", flexWrap: "wrap", gap: SPACE.xs }}>{convo.entities.map(e => <Pill key={e} color={C.white}>{e}</Pill>)}</div></MetaRow>
          <MetaRow label="Topics"><div style={{ display: "flex", flexWrap: "wrap", gap: SPACE.xs }}>{convo.topicTags.map(tag => <Pill key={tag} color={TOPICS.find(t => t.name === tag)?.color || C.gold}>{tag}</Pill>)}</div></MetaRow>
        </aside>
      </div>
    </div>
  );
};

export default ConversationDrilldown;
