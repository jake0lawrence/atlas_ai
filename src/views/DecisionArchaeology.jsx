import {
  TOPICS, ARCHAEOLOGY_CHAINS,
} from '../data/constants';
import { FONTS, BODY, MONO } from '../styles/base';

// ─── DECISION ARCHAEOLOGY VIEW ──────────────────────────────

const DecisionArchaeology = ({ chainId, onBack, onConversationClick, mobile }) => {
  const chain = ARCHAEOLOGY_CHAINS[chainId];
  if (!chain) return null;

  const ROLE_META = {
    seed: { label: "Seed", color: "#FBBF24", icon: "🌱", desc: "Where this idea first appeared" },
    supporting: { label: "Supporting", color: "#10B981", icon: "✅", desc: "Evidence that reinforced the decision" },
    challenging: { label: "Challenging", color: "#EF4444", icon: "⚡", desc: "Moments where the idea was questioned" },
    resolution: { label: "Resolution", color: "#3B82F6", icon: "🎯", desc: "Where the final decision crystallized" },
  };

  const confidenceLabel = (c) => c >= 0.9 ? "Strong" : c >= 0.75 ? "Moderate" : "Weak";
  const confidenceColor = (c) => c >= 0.9 ? "#10B981" : c >= 0.75 ? "#FBBF24" : "#EF4444";

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <button onClick={onBack} style={{
          fontFamily: BODY, fontSize: 12, color: "rgba(255,255,255,0.4)",
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8, padding: "6px 12px", cursor: "pointer", transition: "all 0.2s",
        }}>← Back</button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>{chain.icon}</span>
            <h2 style={{ fontFamily: FONTS, fontSize: mobile ? 20 : 26, color: "#fff", letterSpacing: "-0.02em" }}>
              {chain.title}
            </h2>
          </div>
          <p style={{ fontFamily: BODY, fontSize: mobile ? 10 : 12, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>
            Decision Archaeology — trace the chain of reasoning
          </p>
        </div>
      </div>

      {/* Summary card */}
      <div style={{
        background: `${chain.color}08`, border: `1px solid ${chain.color}20`,
        borderRadius: 12, padding: mobile ? "14px 16px" : "16px 20px", marginBottom: 24,
      }}>
        <div style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.5, marginBottom: 10 }}>
          {chain.summary}
        </div>
        <div style={{
          fontFamily: MONO, fontSize: mobile ? 9 : 10, color: chain.color,
          padding: "6px 10px", background: `${chain.color}10`, borderRadius: 6,
          border: `1px solid ${chain.color}15`, display: "inline-block",
        }}>
          Resolution: {chain.resolution}
        </div>
      </div>

      {/* Role legend */}
      <div style={{
        display: "flex", gap: mobile ? 8 : 14, marginBottom: 24, flexWrap: "wrap",
      }}>
        {Object.entries(ROLE_META).map(([key, meta]) => (
          <div key={key} style={{
            display: "flex", alignItems: "center", gap: 5,
            fontFamily: BODY, fontSize: mobile ? 9 : 10, color: "rgba(255,255,255,0.3)",
          }}>
            <span style={{ fontSize: 12 }}>{meta.icon}</span>
            <span style={{ color: meta.color, fontWeight: 600 }}>{meta.label}</span>
          </div>
        ))}
      </div>

      {/* Chain timeline */}
      <div style={{ position: "relative", paddingLeft: mobile ? 24 : 36 }}>
        {/* Main trunk line */}
        <div style={{
          position: "absolute", left: mobile ? 8 : 14, top: 8, bottom: 8,
          width: 2, background: "rgba(255,255,255,0.06)",
        }} />

        {chain.nodes.map((node, i) => {
          const meta = ROLE_META[node.role];
          const topic = TOPICS.find(t => t.id === node.topicId);
          const isBranch = node.role === "supporting" || node.role === "challenging";

          return (
            <div key={node.id} style={{ position: "relative", marginBottom: i < chain.nodes.length - 1 ? 20 : 0 }} className="fade-up">
              {/* Node dot on the trunk */}
              <div style={{
                position: "absolute",
                left: mobile ? -20 : -28,
                top: 16,
                width: mobile ? 12 : 16,
                height: mobile ? 12 : 16,
                borderRadius: "50%",
                background: meta.color,
                border: `2px solid #08080C`,
                boxShadow: `0 0 8px ${meta.color}40`,
                zIndex: 2,
              }} />

              {/* Branch indicator for supporting/challenging */}
              {isBranch && (
                <div style={{
                  position: "absolute",
                  left: mobile ? -8 : -12,
                  top: 22,
                  width: mobile ? 8 : 12,
                  height: 2,
                  background: meta.color,
                  opacity: 0.4,
                }} />
              )}

              {/* Node card */}
              <div
                style={{
                  background: `${meta.color}06`,
                  border: `1px solid ${meta.color}18`,
                  borderRadius: 12,
                  padding: mobile ? "14px 14px" : "16px 20px",
                  cursor: "pointer",
                  transition: "all 0.25s",
                  marginLeft: isBranch ? (mobile ? 8 : 16) : 0,
                }}
                onClick={() => onConversationClick && onConversationClick(node.topicId, node.eventIndex)}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${meta.color}40`; e.currentTarget.style.background = `${meta.color}10`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${meta.color}18`; e.currentTarget.style.background = `${meta.color}06`; }}
              >
                {/* Card header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14 }}>{meta.icon}</span>
                    <span style={{
                      fontFamily: MONO, fontSize: mobile ? 8 : 9, color: meta.color,
                      textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600,
                    }}>{meta.label}</span>
                    <span style={{ fontFamily: MONO, fontSize: mobile ? 8 : 9, color: "rgba(255,255,255,0.2)" }}>·</span>
                    <span style={{ fontFamily: MONO, fontSize: mobile ? 8 : 9, color: "rgba(255,255,255,0.25)" }}>{node.date}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {topic && (
                      <span style={{
                        fontFamily: BODY, fontSize: mobile ? 8 : 9, color: topic.color,
                        background: `${topic.color}12`, padding: "2px 8px", borderRadius: 10,
                        fontWeight: 500,
                      }}>{topic.icon} {topic.name}</span>
                    )}
                    <span style={{
                      fontFamily: MONO, fontSize: mobile ? 8 : 9,
                      color: confidenceColor(node.confidence),
                      background: `${confidenceColor(node.confidence)}12`,
                      padding: "2px 6px", borderRadius: 4, fontWeight: 500,
                    }}>{confidenceLabel(node.confidence)} ({Math.round(node.confidence * 100)}%)</span>
                  </div>
                </div>

                {/* Card title & summary */}
                <div style={{ fontFamily: FONTS, fontSize: mobile ? 14 : 16, color: "#fff", fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>
                  {node.title}
                </div>
                <div style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5, marginBottom: 10 }}>
                  {node.summary}
                </div>

                {/* Conversation snippet */}
                {node.snippet && (
                  <div style={{
                    background: "rgba(0,0,0,0.3)", borderRadius: 8,
                    padding: mobile ? "10px 12px" : "12px 14px",
                    border: "1px solid rgba(255,255,255,0.04)",
                  }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontFamily: MONO, fontSize: 9, color: "#FBBF24", fontWeight: 600, flexShrink: 0, marginTop: 1 }}>YOU</span>
                      <span style={{ fontFamily: BODY, fontSize: mobile ? 10 : 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.4, fontStyle: "italic" }}>
                        "{node.snippet.user.length > 120 ? node.snippet.user.slice(0, 117) + "..." : node.snippet.user}"
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ fontFamily: MONO, fontSize: 9, color: "#3B82F6", fontWeight: 600, flexShrink: 0, marginTop: 1 }}>AI</span>
                      <span style={{ fontFamily: BODY, fontSize: mobile ? 10 : 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.4, fontStyle: "italic" }}>
                        "{node.snippet.ai.length > 120 ? node.snippet.ai.slice(0, 117) + "..." : node.snippet.ai}"
                      </span>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                  <span style={{ fontFamily: MONO, fontSize: mobile ? 8 : 9, color: "rgba(255,255,255,0.15)" }}>
                    {node.messages} messages
                  </span>
                  <span style={{ fontFamily: BODY, fontSize: mobile ? 9 : 10, color: meta.color, opacity: 0.6 }}>
                    View conversation →
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Other archaeology chains */}
      <div style={{ marginTop: 40 }}>
        <h3 style={{ fontFamily: FONTS, fontSize: mobile ? 15 : 17, color: "#fff", marginBottom: 12 }}>
          Other Decision Chains
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Object.values(ARCHAEOLOGY_CHAINS).filter(c => c.id !== chainId).map(c => (
            <button key={c.id} onClick={() => onBack("archaeology", c.id)} style={{
              background: `${c.color}06`, border: `1px solid ${c.color}15`,
              borderRadius: 10, padding: mobile ? "12px 14px" : "12px 18px",
              cursor: "pointer", transition: "all 0.25s", textAlign: "left",
              display: "flex", alignItems: "center", gap: 10,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${c.color}30`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = `${c.color}15`; }}
            >
              <span style={{ fontSize: 18 }}>{c.icon}</span>
              <div>
                <div style={{ fontFamily: FONTS, fontSize: mobile ? 13 : 14, color: "#fff", fontWeight: 600 }}>{c.title}</div>
                <div style={{ fontFamily: BODY, fontSize: mobile ? 10 : 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                  {c.nodes.length} conversations · {c.nodes[0].date} → {c.nodes[c.nodes.length - 1].date}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DecisionArchaeology;
