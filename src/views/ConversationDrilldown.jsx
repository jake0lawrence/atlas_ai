import { useState, useEffect } from "react";
import {
  TOPICS, TIMELINE_DATA, TYPE_META, CONVERSATION_PREVIEWS,
} from '../data/constants';
import { FONTS, BODY, MONO } from '../styles/base';
import { C, alpha, white } from '../styles/tokens';
import { grow } from '../styles/shared';

const ConversationDrilldown = ({ topicId, eventIndex, onBack, mobile }) => {
  const previewKey = `${topicId}:${eventIndex}`;
  const convo = CONVERSATION_PREVIEWS[previewKey];
  const topic = TOPICS.find(t => t.id === topicId);
  const events = TIMELINE_DATA[topicId] || [];
  const event = events[eventIndex];
  const meta = TYPE_META[event?.type] || TYPE_META.build;
  const [visibleMsgs, setVisibleMsgs] = useState(0);

  useEffect(() => {
    setVisibleMsgs(0);
    if (!convo) return;
    const interval = setInterval(() => {
      setVisibleMsgs(prev => { if (prev >= convo.messages.length) { clearInterval(interval); return prev; } return prev + 1; });
    }, 120);
    return () => clearInterval(interval);
  }, [previewKey, convo]);

  if (!convo || !topic || !event) return null;

  const renderHighlightedText = (msg) => {
    if (!msg.extractions || msg.extractions.length === 0) return msg.text;
    const parts = [];
    let lastIndex = 0;
    const sorted = [...msg.extractions].sort((a, b) => a.start - b.start);
    sorted.forEach((ext, i) => {
      if (ext.start > lastIndex) parts.push(<span key={`t${i}`}>{msg.text.slice(lastIndex, ext.start)}</span>);
      if (ext.type === "decision") {
        parts.push(<span key={`e${i}`} style={{ background: alpha(C.gold, 0.18), color: C.gold, padding: "1px 4px", borderRadius: 3, fontWeight: 500 }}>{msg.text.slice(ext.start, ext.end)}</span>);
      } else if (ext.type === "entity") {
        parts.push(<span key={`e${i}`} style={{ textDecoration: "underline", textDecorationColor: alpha(C.gold, 0.4), textUnderlineOffset: 3 }}>{msg.text.slice(ext.start, ext.end)}</span>);
      }
      lastIndex = ext.end;
    });
    if (lastIndex < msg.text.length) parts.push(<span key="tail">{msg.text.slice(lastIndex)}</span>);
    return parts;
  };

  return (
    <div style={{ padding: "0 0 40px" }}>
      <button onClick={onBack} style={{ fontFamily: BODY, fontSize: 13, color: white(0.4), background: white(0.04), border: `1px solid ${white(0.08)}`, borderRadius: 8, padding: "8px 16px", cursor: "pointer", marginBottom: 24 }}>← Back to timeline</button>

      {/* Event header */}
      <div style={{ display: "flex", alignItems: mobile ? "flex-start" : "center", gap: mobile ? 10 : 14, marginBottom: 8, flexDirection: mobile ? "column" : "row" }}>
        <span style={{ fontSize: mobile ? 28 : 34 }}>{topic.icon}</span>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontFamily: BODY, fontSize: 10, padding: "2px 8px", borderRadius: 20, background: `${meta.color}12`, color: meta.color, fontWeight: 500 }}>{meta.icon} {meta.label}</span>
            <span style={{ fontFamily: BODY, fontSize: 10, padding: "2px 8px", borderRadius: 20, background: convo.platform === "Claude" ? alpha(C.gold, 0.1) : alpha(C.blue, 0.1), color: convo.platform === "Claude" ? C.gold : C.blue, fontWeight: 500 }}>{convo.platform}</span>
          </div>
          <h2 style={{ fontFamily: FONTS, fontSize: mobile ? 22 : 28, fontWeight: 700, color: C.white }}>{event.title}</h2>
          <p style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: white(0.3), marginTop: 3 }}>{topic.name} · {convo.date} · {event.messages} messages</p>
        </div>
      </div>

      {/* Why this matters */}
      <div style={{ background: `linear-gradient(135deg, ${alpha(C.gold, 0.06)}, ${alpha(C.gold, 0.02)})`, border: `1px solid ${alpha(C.gold, 0.15)}`, borderRadius: 10, padding: mobile ? "12px 14px" : "14px 18px", margin: "16px 0 20px", display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>💡</span>
        <div>
          <div style={{ fontFamily: BODY, fontSize: 9, color: alpha(C.gold, 0.5), textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 4 }}>Why this matters</div>
          <div style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: white(0.6), lineHeight: 1.55 }}>{convo.whyItMatters}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: mobile ? 0 : 24, flexDirection: mobile ? "column" : "row" }}>
        {/* Thread view */}
        <div style={grow}>
          <div style={{ fontFamily: BODY, fontSize: 10, color: white(0.2), textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 14 }}>Conversation thread</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {convo.messages.map((msg, i) => {
              const isUser = msg.role === "user";
              const isVisible = i < visibleMsgs;
              return (
                <div key={i} style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(12px)",
                  transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                  display: "flex",
                  justifyContent: isUser ? "flex-end" : "flex-start",
                }}>
                  <div style={{
                    maxWidth: mobile ? "92%" : "82%",
                    background: isUser
                      ? `linear-gradient(135deg, ${alpha(C.gold, 0.1)}, ${alpha(C.gold, 0.04)})`
                      : white(0.03),
                    border: `1px solid ${isUser ? alpha(C.gold, 0.2) : white(0.06)}`,
                    borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    padding: mobile ? "10px 13px" : "12px 16px",
                  }}>
                    <div style={{ fontFamily: MONO, fontSize: 9, color: isUser ? alpha(C.gold, 0.45) : white(0.2), marginBottom: 5, fontWeight: 500 }}>
                      {isUser ? "You" : convo.platform}
                    </div>
                    <div style={{
                      fontFamily: msg.text.startsWith("```") ? MONO : BODY,
                      fontSize: msg.text.startsWith("```") ? (mobile ? 10 : 11) : (mobile ? 12 : 13),
                      color: white(0.65),
                      lineHeight: 1.6,
                      whiteSpace: msg.text.startsWith("```") ? "pre-wrap" : "normal",
                    }}>
                      {isUser ? msg.text : renderHighlightedText(msg)}
                    </div>
                    {/* Topic tags in margin for AI messages with extractions */}
                    {!isUser && msg.extractions && msg.extractions.length > 0 && (
                      <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
                        {msg.extractions.map((ext, j) => (
                          <span key={j} style={{
                            fontFamily: MONO, fontSize: 8, padding: "2px 6px", borderRadius: 8,
                            background: ext.type === "decision" ? alpha(C.gold, 0.1) : white(0.04),
                            color: ext.type === "decision" ? C.gold : white(0.3),
                            border: `1px solid ${ext.type === "decision" ? alpha(C.gold, 0.15) : white(0.06)}`,
                          }}>
                            {ext.type === "decision" ? "🎯 Decision" : "📌 Entity"}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ fontFamily: BODY, fontSize: mobile ? 10 : 11, color: white(0.15), marginTop: 16, textAlign: "center", fontStyle: "italic" }}>
            Showing excerpt · {event.messages} total messages in this thread
          </div>
        </div>

        {/* Metadata sidebar */}
        <div style={{
          width: mobile ? "100%" : 220, flexShrink: 0,
          marginTop: mobile ? 24 : 0,
          background: white(0.02),
          border: `1px solid ${white(0.06)}`,
          borderRadius: 12,
          padding: mobile ? "16px" : "18px",
          alignSelf: "flex-start",
        }}>
          <div style={{ fontFamily: BODY, fontSize: 10, color: white(0.2), textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 14 }}>Metadata</div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: BODY, fontSize: 10, color: white(0.25), marginBottom: 4 }}>Platform</div>
            <div style={{ fontFamily: BODY, fontSize: 13, color: convo.platform === "Claude" ? C.gold : C.blue, fontWeight: 500 }}>{convo.platform}</div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: BODY, fontSize: 10, color: white(0.25), marginBottom: 4 }}>Date</div>
            <div style={{ fontFamily: MONO, fontSize: 12, color: white(0.55) }}>{convo.date}</div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: BODY, fontSize: 10, color: white(0.25), marginBottom: 4 }}>Word count</div>
            <div style={{ fontFamily: MONO, fontSize: 12, color: white(0.55) }}>{convo.wordCount.toLocaleString()}</div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: BODY, fontSize: 10, color: white(0.25), marginBottom: 6 }}>Extracted entities</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {convo.entities.map((ent, i) => (
                <span key={i} style={{ fontFamily: BODY, fontSize: 10, padding: "3px 8px", borderRadius: 12, background: white(0.04), border: `1px solid ${white(0.08)}`, color: white(0.5) }}>{ent}</span>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontFamily: BODY, fontSize: 10, color: white(0.25), marginBottom: 6 }}>Topic assignments</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {convo.topicTags.map((tag, i) => {
                const tagTopic = TOPICS.find(t => t.name === tag);
                const tagColor = tagTopic ? tagTopic.color : C.gold;
                return (
                  <span key={i} style={{ fontFamily: BODY, fontSize: 10, padding: "3px 8px", borderRadius: 12, background: `${tagColor}12`, border: `1px solid ${tagColor}25`, color: tagColor, fontWeight: 500 }}>{tag}</span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationDrilldown;
