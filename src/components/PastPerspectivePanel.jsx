import {
  TOPICS, PAST_ANALOGIES,
} from '../data/constants';
import { BODY, MONO } from '../styles/base';

// ═══════════════════════════════════════════════════════════════
// "WHAT WOULD PAST-ME SAY?" — HISTORICAL REASONING RECALL
// ═══════════════════════════════════════════════════════════════

const PastPerspectivePanel = ({ decisionId, mobile, onClose }) => {
  const analogy = PAST_ANALOGIES.find(a => a.triggerDecisionId === decisionId);
  if (!analogy) return null;

  const topicMap = {};
  TOPICS.forEach(t => { topicMap[t.id] = t; });

  const outcomeColors = { positive: "#10B981", mixed: "#F59E0B", negative: "#EF4444" };
  const outcomeIcons = { positive: "✓", mixed: "⚖", negative: "✗" };

  return (
    <div className="fade-up" style={{ marginTop: 12, background: "linear-gradient(135deg, rgba(168,85,247,0.06), rgba(168,85,247,0.02), rgba(8,8,12,0.95))", border: "1px solid rgba(168,85,247,0.2)", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: mobile ? "12px 14px 8px" : "14px 20px 10px", borderBottom: "1px solid rgba(168,85,247,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>🪞</span>
          <span style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, fontWeight: 600, color: "#A855F7" }}>What Would Past-Me Say?</span>
        </div>
        <button onClick={onClose} role="button" tabIndex={0} style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.25)", background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "2px 8px", cursor: "pointer" }}>✕</button>
      </div>
      <div style={{ padding: mobile ? "10px 14px" : "12px 20px 6px" }}>
        <div style={{ fontFamily: BODY, fontSize: 10, color: "rgba(168,85,247,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 6 }}>Current Decision Point</div>
        <div style={{ fontFamily: BODY, fontSize: mobile ? 13 : 14, color: "rgba(255,255,255,0.6)", fontWeight: 500, marginBottom: 12 }}>{analogy.currentQuestion}</div>
      </div>
      {analogy.analogies.map((a, i) => {
        const topic = topicMap[a.topicId];
        return (
          <div key={i} style={{ padding: mobile ? "0 14px 14px" : "0 20px 16px", borderTop: i > 0 ? "1px solid rgba(168,85,247,0.06)" : undefined, marginTop: i > 0 ? 8 : 0 }}>
            {/* Relevance + past decision header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontFamily: MONO, fontSize: 9, color: "#A855F7", background: "rgba(168,85,247,0.12)", padding: "2px 7px", borderRadius: 8, fontWeight: 600 }}>{a.relevance}% match</span>
              {topic && <span style={{ fontSize: 12 }}>{topic.icon}</span>}
              <span style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.2)" }}>{a.sourceRef}</span>
            </div>
            {/* Past decision */}
            <div style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, marginBottom: 10 }}>{a.pastDecision}</div>
            {/* Past reasoning excerpt */}
            <div style={{ background: "rgba(168,85,247,0.04)", border: "1px solid rgba(168,85,247,0.1)", borderRadius: 10, padding: mobile ? "10px 12px" : "10px 14px", marginBottom: 10 }}>
              <div style={{ fontFamily: BODY, fontSize: 9, color: "rgba(168,85,247,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 6 }}>How You Reasoned</div>
              <div style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, fontStyle: "italic" }}>"{a.pastReasoning}"</div>
            </div>
            {/* Source conversation excerpt */}
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.04)", padding: mobile ? "8px 10px" : "8px 12px", marginBottom: 10 }}>
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 9, color: "rgba(251,191,36,0.35)", marginRight: 6 }}>YOU</span>
                <span style={{ fontFamily: BODY, fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>{a.pastSnippet.user}</span>
              </div>
              <div>
                <span style={{ fontFamily: MONO, fontSize: 9, color: "rgba(168,85,247,0.4)", marginRight: 6 }}>AI</span>
                <span style={{ fontFamily: BODY, fontSize: 11, color: "rgba(255,255,255,0.25)", lineHeight: 1.5 }}>{a.pastSnippet.ai}</span>
              </div>
            </div>
            {/* Context comparison: then vs now */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
              <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 8, padding: "8px 10px", border: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(239,68,68,0.5)", marginBottom: 4, fontWeight: 600 }}>THEN — {a.pastDate}</div>
                <div style={{ fontFamily: BODY, fontSize: 10, color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>{a.thenContext}</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 8, padding: "8px 10px", border: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(16,185,129,0.5)", marginBottom: 4, fontWeight: 600 }}>NOW</div>
                <div style={{ fontFamily: BODY, fontSize: 10, color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>{a.nowContext}</div>
              </div>
            </div>
            {/* Outcome */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: `${outcomeColors[a.outcomeType]}08`, border: `1px solid ${outcomeColors[a.outcomeType]}18`, borderRadius: 8, padding: "8px 10px" }}>
              <span style={{ fontFamily: MONO, fontSize: 12, color: outcomeColors[a.outcomeType], flexShrink: 0, marginTop: 1 }}>{outcomeIcons[a.outcomeType]}</span>
              <div>
                <div style={{ fontFamily: MONO, fontSize: 9, color: `${outcomeColors[a.outcomeType]}90`, fontWeight: 600, marginBottom: 3 }}>OUTCOME</div>
                <div style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{a.outcome}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PastPerspectivePanel;
