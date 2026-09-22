import { useState, useEffect, useRef } from "react";
import {
  TOPICS, COMPANION_RESPONSES, COMPANION_SUGGESTION_CHIPS,
  CONTRADICTION_TYPE_CONFIG, RESOLUTION_OPTIONS,
} from '../data/constants';
import { FONTS, BODY, MONO, CSS } from '../styles/base';

// ─── CONVERSATION DRILLDOWN VIEW ─────────────────────────────
// ═══════════════════════════════════════════════════════════════
// ASK ATLAS — CONVERSATIONAL KNOWLEDGE QUERY
// ═══════════════════════════════════════════════════════════════
const AskAtlas = ({ onBack, onConversationClick, mobile, contradictions = [], resolvedContradictions = [], onResolveContradiction }) => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [expandedSources, setExpandedSources] = useState({});
  const [chips, setChips] = useState(COMPANION_SUGGESTION_CHIPS);
  const [expandedContradiction, setExpandedContradiction] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);
  const [showResolved, setShowResolved] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const askTimersRef = useRef([]);

  useEffect(() => {
    return () => askTimersRef.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSubmit = (q) => {
    const trimmed = (q || query).trim();
    if (!trimmed || isTyping) return;

    const userMsg = { role: "user", text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setQuery("");
    setIsTyping(true);

    const preBuilt = COMPANION_RESPONSES[trimmed];
    const delay = preBuilt ? 1200 + Math.random() * 800 : 800;

    askTimersRef.current.push(setTimeout(() => {
      if (preBuilt) {
        setMessages(prev => [...prev, { role: "atlas", ...preBuilt }]);
        setChips(COMPANION_SUGGESTION_CHIPS.filter(c => c !== trimmed));
      } else {
        setMessages(prev => [...prev, {
          role: "atlas",
          isDemo: true,
          answer: "This is a demo — in production, Atlas would search your full knowledge base of 3,847 conversations to synthesize an answer from your own words. The query you asked would be matched against your curated topics, decisions, and insights to compose a response with full source citations.",
          confidence: null,
          freshness: null,
          sources: [],
        }]);
      }
      setIsTyping(false);
    }, delay));
  };

  const toggleSource = (msgIdx) => {
    setExpandedSources(prev => ({ ...prev, [msgIdx]: !prev[msgIdx] }));
  };

  const handleResolve = (contradictionId, resolutionType) => {
    setResolvingId(contradictionId);
    askTimersRef.current.push(setTimeout(() => {
      onResolveContradiction && onResolveContradiction(contradictionId, resolutionType);
      setResolvingId(null);
      setExpandedContradiction(null);
    }, 500));
  };

  const getConfidenceLabel = (c) => {
    if (c >= 0.9) return { text: "High confidence", color: "#10B981" };
    if (c >= 0.75) return { text: "Good confidence", color: "#FBBF24" };
    if (c >= 0.5) return { text: "Moderate confidence", color: "#F97316" };
    return { text: "Low confidence", color: "#EF4444" };
  };

  const renderAnswer = (text) => {
    const parts = text.split(/(\[\d+\])/g);
    return parts.map((part, i) => {
      const match = part.match(/^\[(\d+)\]$/);
      if (match) {
        return (
          <span key={i} style={{
            fontFamily: MONO, fontSize: 10, color: "#FBBF24",
            background: "rgba(251,191,36,0.12)", padding: "1px 5px",
            borderRadius: 4, cursor: "default", fontWeight: 500,
            verticalAlign: "super", lineHeight: 1,
          }}>{part}</span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  // ─── Contradiction sidebar renderer ───────────────
  const renderContradictionSidebar = () => {
    const activeContradictions = contradictions || [];
    const resolved = resolvedContradictions || [];
    const totalCount = activeContradictions.length + resolved.length;

    return (
      <div style={{
        width: mobile ? "100%" : 280,
        flexShrink: 0,
        overflowY: "auto",
        padding: mobile ? "16px" : "0 0 0 20px",
        borderLeft: mobile ? "none" : "1px solid rgba(255,255,255,0.06)",
      }}>
        {/* Sidebar header */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: "rgba(251,191,36,0.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Thinking Drift
            </div>
            {activeContradictions.length > 0 && (
              <span style={{
                fontFamily: MONO, fontSize: 10, fontWeight: 600,
                color: "#EF4444", background: "rgba(239,68,68,0.12)",
                padding: "2px 7px", borderRadius: 10,
              }}>
                {activeContradictions.length}
              </span>
            )}
          </div>
          <div style={{ fontFamily: BODY, fontSize: 11, color: "rgba(255,255,255,0.2)", lineHeight: 1.4 }}>
            Positions that may have shifted since earlier decisions.
          </div>
        </div>

        {/* Active contradiction cards */}
        {activeContradictions.length === 0 && resolved.length === 0 && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 24, marginBottom: 8, opacity: 0.3 }}>✓</div>
            <div style={{ fontFamily: BODY, fontSize: 12, color: "rgba(255,255,255,0.2)" }}>No contradictions detected</div>
          </div>
        )}

        {activeContradictions.map((c) => {
          const typeConfig = CONTRADICTION_TYPE_CONFIG[c.type];
          const isExpanded = expandedContradiction === c.id;
          const isResolving = resolvingId === c.id;

          return (
            <div
              key={c.id}
              style={{
                background: `rgba(${c.type === "hard" ? "239,68,68" : c.type === "soft" ? "249,115,22" : "168,85,247"},${typeConfig.bgAlpha})`,
                border: `1px solid rgba(${c.type === "hard" ? "239,68,68" : c.type === "soft" ? "249,115,22" : "168,85,247"},0.15)`,
                borderRadius: 10,
                padding: "12px 14px",
                marginBottom: 10,
                cursor: "pointer",
                transition: "all 0.3s",
                opacity: isResolving ? 0 : 1,
                transform: isResolving ? "scale(0.95) translateX(20px)" : "scale(1) translateX(0)",
                animation: "fadeUp 0.4s ease both",
              }}
              onClick={() => setExpandedContradiction(isExpanded ? null : c.id)}
            >
              {/* Card header */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 13, flexShrink: 0 }}>{typeConfig.icon}</span>
                <span style={{ fontFamily: BODY, fontSize: 10, fontWeight: 600, color: typeConfig.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {typeConfig.label}
                </span>
                <span style={{ fontFamily: BODY, fontSize: 10, color: "rgba(255,255,255,0.15)", marginLeft: "auto" }}>
                  {c.icon} {c.topic}
                </span>
              </div>

              {/* Summary */}
              <div style={{ fontFamily: BODY, fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, marginBottom: isExpanded ? 12 : 0 }}>
                {c.summary}
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{ animation: "fadeUp 0.3s ease both" }} onClick={(e) => e.stopPropagation()}>
                  {/* Earlier position */}
                  <div style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 8, padding: "10px 12px", marginBottom: 8,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                      <span style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.25)", fontWeight: 600 }}>EARLIER</span>
                      <span style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.15)" }}>{c.earlier.source.conversationDate}</span>
                    </div>
                    <div style={{ fontFamily: BODY, fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
                      {c.earlier.position}
                    </div>
                    <div
                      style={{ fontFamily: BODY, fontSize: 10, color: c.color, marginTop: 6, cursor: "pointer", opacity: 0.7 }}
                      onClick={() => onConversationClick && onConversationClick(c.earlier.source.topicId)}
                    >
                      {c.earlier.source.topicName} · {c.earlier.source.title} →
                    </div>
                  </div>

                  {/* Current position */}
                  <div style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 8, padding: "10px 12px", marginBottom: 10,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                      <span style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.25)", fontWeight: 600 }}>CURRENT</span>
                      <span style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.15)" }}>{c.current.source.conversationDate}</span>
                    </div>
                    <div style={{ fontFamily: BODY, fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
                      {c.current.position}
                    </div>
                    <div
                      style={{ fontFamily: BODY, fontSize: 10, color: c.color, marginTop: 6, cursor: "pointer", opacity: 0.7 }}
                      onClick={() => onConversationClick && onConversationClick(c.current.source.topicId)}
                    >
                      {c.current.source.topicName} · {c.current.source.title} →
                    </div>
                  </div>

                  {/* Resolve buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.2)", marginBottom: 2, fontWeight: 500 }}>RESOLVE</div>
                    {RESOLUTION_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleResolve(c.id, opt.id)}
                        style={{
                          fontFamily: BODY, fontSize: 11, fontWeight: 500,
                          color: "rgba(255,255,255,0.55)",
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 6, padding: "7px 10px",
                          cursor: "pointer", transition: "all 0.2s",
                          display: "flex", alignItems: "center", gap: 7,
                          textAlign: "left", width: "100%",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${typeConfig.color}40`; e.currentTarget.style.background = `${typeConfig.color}08`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                      >
                        <span style={{ fontSize: 12, flexShrink: 0, opacity: 0.7 }}>{opt.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 11 }}>{opt.label}</div>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 1 }}>{opt.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Resolved section */}
        {resolved.length > 0 && (
          <div style={{ marginTop: activeContradictions.length > 0 ? 16 : 0 }}>
            <button
              onClick={() => setShowResolved(!showResolved)}
              style={{
                fontFamily: BODY, fontSize: 11, fontWeight: 500,
                color: "rgba(255,255,255,0.25)", background: "none",
                border: "none", cursor: "pointer", padding: "4px 0",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <span style={{ transform: showResolved ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "inline-block", fontSize: 10 }}>▸</span>
              {resolved.length} resolved
            </button>

            {showResolved && (
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6, animation: "fadeUp 0.3s ease both" }}>
                {resolved.map((c) => {
                  const resolution = RESOLUTION_OPTIONS.find(r => r.id === c.resolution);
                  return (
                    <div key={c.id} style={{
                      background: "rgba(255,255,255,0.015)",
                      border: "1px solid rgba(255,255,255,0.04)",
                      borderRadius: 8, padding: "8px 10px", opacity: 0.6,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                        <span style={{ fontSize: 10, color: "#10B981" }}>✓</span>
                        <span style={{ fontFamily: BODY, fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>{c.topic}</span>
                      </div>
                      <div style={{ fontFamily: BODY, fontSize: 10, color: "rgba(255,255,255,0.2)", lineHeight: 1.4 }}>
                        Resolved: {resolution?.label || c.resolution}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#08080C" }}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{ padding: mobile ? "20px 16px 0" : "28px 40px 0", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <button onClick={onBack} style={{ fontFamily: BODY, fontSize: 13, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 16px", cursor: "pointer", marginBottom: 16 }}>← Back to dashboard</button>
        <div style={{ textAlign: "center", marginBottom: mobile ? 16 : 24 }}>
          <div style={{ fontSize: mobile ? 10 : 12, fontFamily: BODY, color: "rgba(251,191,36,0.35)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 6, fontWeight: 600 }}>Companion</div>
          <h1 style={{ fontFamily: FONTS, fontSize: mobile ? 28 : 36, fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Ask <span style={{ color: "#FBBF24" }}>Atlas</span>
          </h1>
          <p style={{ fontFamily: BODY, fontSize: mobile ? 11 : 13, color: "rgba(255,255,255,0.25)", marginTop: 6 }}>Query your knowledge base. Get answers in your own words.</p>
        </div>
      </div>

      {/* Main content area: chat + sidebar */}
      <div style={{ flex: 1, display: "flex", flexDirection: mobile ? "column" : "row", overflow: "hidden", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        {/* Chat area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          {/* Messages area */}
          <div style={{ flex: 1, overflowY: "auto", padding: mobile ? "0 16px" : "0 40px" }}>
            <div style={{ maxWidth: 720, margin: "0 auto" }}>
              {messages.length === 0 && (
                <div style={{ textAlign: "center", padding: mobile ? "40px 0" : "60px 0", animation: "fadeUp 0.6s ease both" }}>
                  <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.6 }}>◈</div>
                  <p style={{ fontFamily: BODY, fontSize: mobile ? 13 : 15, color: "rgba(255,255,255,0.3)", lineHeight: 1.6, maxWidth: 400, margin: "0 auto" }}>
                    Ask anything about your 3,847 conversations across 14 topics. Atlas synthesizes answers from your own words.
                  </p>
                </div>
              )}

              {messages.map((msg, i) => {
                if (msg.role === "user") {
                  return (
                    <div key={i} style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16, animation: "fadeUp 0.35s ease both" }}>
                      <div style={{
                        maxWidth: mobile ? "90%" : "75%",
                        background: "linear-gradient(135deg, rgba(251,191,36,0.1), rgba(251,191,36,0.04))",
                        border: "1px solid rgba(251,191,36,0.2)",
                        borderRadius: "14px 14px 4px 14px",
                        padding: mobile ? "10px 14px" : "12px 18px",
                      }}>
                        <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(251,191,36,0.45)", marginBottom: 5, fontWeight: 500 }}>You</div>
                        <div style={{ fontFamily: BODY, fontSize: mobile ? 13 : 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>{msg.text}</div>
                      </div>
                    </div>
                  );
                }

                // Atlas response
                const conf = msg.confidence ? getConfidenceLabel(msg.confidence) : null;
                const isExpanded = expandedSources[i];
                return (
                  <div key={i} style={{ marginBottom: 24, animation: "fadeUp 0.5s ease both" }}>
                    <div style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 14,
                      padding: mobile ? "16px" : "20px 24px",
                    }}>
                      {/* Atlas label + badges */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                        <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(251,191,36,0.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Atlas</div>
                        {conf && (
                          <span style={{ fontFamily: BODY, fontSize: 10, padding: "2px 8px", borderRadius: 20, background: `${conf.color}15`, color: conf.color, fontWeight: 500 }}>
                            {conf.text} · {Math.round(msg.confidence * 100)}%
                          </span>
                        )}
                        {msg.isDemo && (
                          <span style={{ fontFamily: BODY, fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "rgba(139,92,246,0.1)", color: "#8B5CF6", fontWeight: 500 }}>
                            Demo Mode
                          </span>
                        )}
                        {msg.freshnessWarning && (
                          <span style={{ fontFamily: BODY, fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "rgba(239,68,68,0.08)", color: "#EF4444", fontWeight: 500 }}>
                            ⏳ Stale sources
                          </span>
                        )}
                      </div>

                      {/* Synthesized answer */}
                      <div style={{ fontFamily: BODY, fontSize: mobile ? 13 : 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, marginBottom: msg.sources && msg.sources.length > 0 ? 16 : 0 }}>
                        {renderAnswer(msg.answer)}
                      </div>

                      {/* Freshness warning detail */}
                      {msg.freshnessWarning && (
                        <div style={{
                          background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.1)",
                          borderRadius: 8, padding: "8px 12px", marginBottom: 12,
                          display: "flex", alignItems: "center", gap: 8,
                        }}>
                          <span style={{ fontSize: 12 }}>⏳</span>
                          <span style={{ fontFamily: BODY, fontSize: 11, color: "rgba(239,68,68,0.7)", lineHeight: 1.4 }}>{msg.freshnessWarning}</span>
                        </div>
                      )}

                      {/* Source toggle */}
                      {msg.sources && msg.sources.length > 0 && (
                        <button onClick={() => toggleSource(i)} style={{
                          fontFamily: BODY, fontSize: 12, fontWeight: 500,
                          color: "rgba(251,191,36,0.6)", background: "rgba(251,191,36,0.06)",
                          border: "1px solid rgba(251,191,36,0.12)", borderRadius: 8,
                          padding: "7px 14px", cursor: "pointer", transition: "all 0.25s",
                          display: "flex", alignItems: "center", gap: 6,
                        }}>
                          <span style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "inline-block" }}>▸</span>
                          {msg.sources.length} source{msg.sources.length > 1 ? "s" : ""} from your conversations
                        </button>
                      )}

                      {/* Expanded source panel */}
                      {isExpanded && msg.sources && (
                        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8, animation: "fadeUp 0.3s ease both" }}>
                          {msg.sources.map((src) => {
                            const topic = TOPICS.find(t => t.id === src.topicId);
                            return (
                              <div key={src.id} style={{
                                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                                borderRadius: 10, padding: mobile ? "12px" : "14px 16px",
                                cursor: "pointer", transition: "all 0.2s",
                              }}
                              onClick={() => onConversationClick && onConversationClick(src.topicId)}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(251,191,36,0.2)"; e.currentTarget.style.background = "rgba(251,191,36,0.03)"; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                  <span style={{
                                    fontFamily: MONO, fontSize: 10, fontWeight: 600,
                                    color: "#FBBF24", background: "rgba(251,191,36,0.12)",
                                    width: 20, height: 20, borderRadius: "50%",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                  }}>{src.id}</span>
                                  <span style={{ fontFamily: BODY, fontSize: 11, color: topic?.color || "#FBBF24", fontWeight: 600 }}>{topic?.icon} {src.topicName}</span>
                                  <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.2)" }}>{src.date}</span>
                                </div>
                                <div style={{ fontFamily: BODY, fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500, marginBottom: 6 }}>{src.title}</div>
                                <div style={{ fontFamily: BODY, fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.55, fontStyle: "italic" }}>
                                  "{src.excerpt.split(src.highlight).map((part, pi, arr) => (
                                    <span key={pi}>
                                      {part}
                                      {pi < arr.length - 1 && (
                                        <span style={{ background: "rgba(251,191,36,0.18)", color: "#FBBF24", padding: "1px 2px", borderRadius: 2, fontStyle: "normal", fontWeight: 500 }}>{src.highlight}</span>
                                      )}
                                    </span>
                                  ))}"
                                </div>
                                <div style={{ fontFamily: BODY, fontSize: 10, color: "rgba(251,191,36,0.35)", marginTop: 8 }}>Click to view full conversation →</div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 16, animation: "fadeUp 0.3s ease both" }}>
                  <div style={{
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "14px 14px 14px 4px", padding: "14px 20px",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(251,191,36,0.5)", fontWeight: 500, marginRight: 4 }}>Atlas</div>
                    <span className="atlas-typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(251,191,36,0.5)", animationDelay: "0s" }} />
                    <span className="atlas-typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(251,191,36,0.5)", animationDelay: "0.15s" }} />
                    <span className="atlas-typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(251,191,36,0.5)", animationDelay: "0.3s" }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Suggestion chips + input */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(8,8,12,0.95)", padding: mobile ? "12px 16px 20px" : "16px 40px 24px" }}>
            <div style={{ maxWidth: 720, margin: "0 auto" }}>
              {/* Chips */}
              {chips.length > 0 && messages.length < 3 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                  {chips.slice(0, mobile ? 2 : 4).map((chip, i) => (
                    <button key={i} onClick={() => handleSubmit(chip)} style={{
                      fontFamily: BODY, fontSize: mobile ? 11 : 12, color: "rgba(255,255,255,0.45)",
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 20, padding: mobile ? "6px 12px" : "7px 14px",
                      cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
                      overflow: "hidden", textOverflow: "ellipsis", maxWidth: mobile ? "100%" : 280,
                    }}>
                      {chip.length > (mobile ? 40 : 50) ? chip.slice(0, mobile ? 37 : 47) + "…" : chip}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} style={{ display: "flex", gap: 8 }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask about your knowledge base…"
                  disabled={isTyping}
                  style={{
                    flex: 1, fontFamily: BODY, fontSize: mobile ? 14 : 15,
                    color: "#fff", background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
                    padding: mobile ? "12px 16px" : "14px 20px",
                    outline: "none", transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(251,191,36,0.3)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
                />
                <button type="submit" disabled={isTyping || !query.trim()} style={{
                  fontFamily: BODY, fontSize: 14, fontWeight: 600,
                  color: isTyping || !query.trim() ? "rgba(255,255,255,0.2)" : "#08080C",
                  background: isTyping || !query.trim() ? "rgba(255,255,255,0.05)" : "#FBBF24",
                  border: "none", borderRadius: 12,
                  padding: mobile ? "12px 18px" : "14px 24px",
                  cursor: isTyping || !query.trim() ? "default" : "pointer",
                  transition: "all 0.25s", flexShrink: 0,
                }}>
                  Ask
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Contradiction sidebar */}
        {renderContradictionSidebar()}
      </div>
    </div>
  );
};

export default AskAtlas;
