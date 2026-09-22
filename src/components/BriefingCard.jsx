import { useState, useEffect, useRef } from "react";
import {
  TOPICS, BRIEFINGS,
} from '../data/constants';
import { FONTS, BODY, MONO } from '../styles/base';
import { stackTight } from '../styles/shared';
import FreshnessBadge from './FreshnessBadge';
import { C, alpha, white, black } from '../styles/tokens';

// ─── PRE-FLIGHT BRIEFING CARD ──────────────────────────────
const BriefingCard = ({ topic, onClose, mobile }) => {
  const briefing = BRIEFINGS[topic.id];
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);

  useEffect(() => {
    return () => { if (copyTimerRef.current) clearTimeout(copyTimerRef.current); };
  }, []);

  if (!briefing) return null;

  const handleCopy = () => {
    const connTopics = briefing.connections.map(c => {
      const t = TOPICS.find(tp => tp.id === c.topicId);
      return `  - ${t?.name || c.topicId}: ${c.summary}`;
    }).join("\n");

    const text = [
      `PRE-FLIGHT BRIEFING: ${topic.name}`,
      `${"=".repeat(40)}`,
      ``,
      `SUMMARY`,
      briefing.summary,
      ``,
      `KEY DECISIONS`,
      ...briefing.decisions.map(d => `  - ${d}`),
      ``,
      `OPEN QUESTIONS`,
      ...briefing.openQuestions.map(q => `  - ${q}`),
      ``,
      `RELEVANT CONNECTIONS`,
      connTopics,
      ``,
      `LAST ACTIVITY (${briefing.lastActivity.date})`,
      `${briefing.lastActivity.title}: ${briefing.lastActivity.summary}`,
      ``,
      `SUGGESTED STARTING PROMPT`,
      briefing.suggestedPrompt,
    ].join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    }).catch(err => console.warn('Clipboard write failed:', err));
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Topic briefing" onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: black(0.75), backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: mobile ? 16 : 40,
      animation: "fadeUp 0.3s ease both",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.bg1, border: `1px solid ${topic.color}30`,
        borderRadius: 18, width: "100%", maxWidth: 640,
        maxHeight: "90vh", overflow: "auto",
        boxShadow: `0 24px 80px ${black(0.6)}, 0 0 40px ${topic.color}10`,
      }}>
        {/* Header */}
        <div style={{
          padding: mobile ? "20px 18px 16px" : "24px 28px 18px",
          borderBottom: `1px solid ${topic.color}15`,
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 22 }}>{topic.icon}</span>
              <span style={{ fontFamily: FONTS, fontSize: mobile ? 20 : 24, fontWeight: 700, color: C.white }}>{topic.name}</span>
              <FreshnessBadge topic={topic} />
            </div>
            <div style={{ fontFamily: BODY, fontSize: 11, color: white(0.25), textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500 }}>
              Pre-flight Briefing · {topic.count} conversations · {(topic.words / 1000).toFixed(0)}k words
            </div>
          </div>
          <button onClick={onClose} style={{
            background: white(0.05), border: `1px solid ${white(0.1)}`,
            borderRadius: 8, width: 32, height: 32, cursor: "pointer",
            color: white(0.4), fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
          }}>x</button>
        </div>

        <div style={{ padding: mobile ? "18px 18px 20px" : "22px 28px 28px" }}>
          {/* Summary */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontFamily: BODY, fontSize: 11, color: topic.color, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Summary</div>
            <div style={{ fontFamily: BODY, fontSize: mobile ? 13 : 14, color: white(0.6), lineHeight: 1.65 }}>
              {briefing.summary}
            </div>
          </div>

          {/* Key Decisions */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontFamily: BODY, fontSize: 11, color: C.green, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Key Decisions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {briefing.decisions.map((d, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: C.green, marginTop: 3, flexShrink: 0 }}>+</span>
                  <span style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: white(0.5), lineHeight: 1.5 }}>{d}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Open Questions */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontFamily: BODY, fontSize: 11, color: C.gold, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Open Questions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {briefing.openQuestions.map((q, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: C.gold, marginTop: 3, flexShrink: 0 }}>?</span>
                  <span style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: white(0.45), lineHeight: 1.5 }}>{q}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Relevant Connections */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontFamily: BODY, fontSize: 11, color: C.blue, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Relevant Connections</div>
            <div style={stackTight}>
              {briefing.connections.map((conn, i) => {
                const connTopic = TOPICS.find(t => t.id === conn.topicId);
                return (
                  <div key={i} style={{
                    display: "flex", gap: 10, alignItems: "center",
                    background: white(0.02), borderRadius: 8,
                    padding: "8px 12px", border: `1px solid ${white(0.04)}`,
                  }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{connTopic?.icon}</span>
                    <div>
                      <span style={{ fontFamily: BODY, fontSize: 12, color: connTopic?.color || C.white, fontWeight: 600 }}>{connTopic?.name}</span>
                      <span style={{ fontFamily: BODY, fontSize: 12, color: white(0.3), marginLeft: 6 }}>— {conn.summary}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Last Activity */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontFamily: BODY, fontSize: 11, color: white(0.25), fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Last Activity</div>
            <div style={{
              background: white(0.02), borderRadius: 8,
              padding: "10px 14px", border: `1px solid ${white(0.04)}`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: white(0.25), marginBottom: 4 }}>{briefing.lastActivity.date}</div>
              <div style={{ fontFamily: BODY, fontSize: 13, color: white(0.55), fontWeight: 500 }}>{briefing.lastActivity.title}</div>
              <div style={{ fontFamily: BODY, fontSize: 12, color: white(0.3), marginTop: 2 }}>{briefing.lastActivity.summary}</div>
            </div>
          </div>

          {/* Suggested Prompt */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontFamily: BODY, fontSize: 11, color: C.purple, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Suggested Starting Prompt</div>
            <div style={{
              background: alpha(C.purple, 0.05), borderRadius: 10,
              padding: mobile ? "12px 14px" : "14px 18px",
              border: `1px solid ${alpha(C.purple, 0.15)}`,
              fontFamily: BODY, fontSize: mobile ? 12 : 13, color: white(0.55),
              lineHeight: 1.6, fontStyle: "italic",
            }}>
              "{briefing.suggestedPrompt}"
            </div>
          </div>

          {/* Copy Button */}
          <button onClick={handleCopy} style={{
            width: "100%", padding: "12px 0", borderRadius: 10,
            background: copied ? alpha(C.green, 0.12) : `${topic.color}12`,
            border: `1px solid ${copied ? alpha(C.green, 0.3) : `${topic.color}25`}`,
            fontFamily: BODY, fontSize: 13, fontWeight: 600,
            color: copied ? C.green : topic.color,
            cursor: "pointer", transition: "all 0.25s",
          }}>
            {copied ? "Copied to clipboard!" : "Copy briefing to clipboard"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BriefingCard;
