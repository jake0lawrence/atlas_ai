import { useState } from "react";
import {
  ARCHAEOLOGY_CHAINS, DIGEST_DATA, PIVOT_ENTRIES,
} from '../data/constants';
import { FONTS, BODY, MONO } from '../styles/base';

// ─── MONTHLY THINKING DIGEST ────────────────────────────────

const DigestView = ({ mobile, onBack, onArchaeologyClick }) => {
  const [expandedMonth, setExpandedMonth] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleMonth = (id) => setExpandedMonth(expandedMonth === id ? null : id);
  const toggleSection = (key) => setExpandedSection(expandedSection === key ? null : key);

  const SectionHeader = ({ sectionKey, icon, title, count, color }) => (
    <button onClick={() => toggleSection(sectionKey)} style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
      background: "transparent", border: "none", cursor: "pointer", padding: "8px 0",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: color || "rgba(255,255,255,0.6)", fontWeight: 500 }}>{title}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {count > 0 && <span style={{ fontFamily: MONO, fontSize: 10, color: color || "#FBBF24", background: `${color || "#FBBF24"}12`, padding: "2px 8px", borderRadius: 10 }}>{count}</span>}
        <span style={{ fontFamily: BODY, fontSize: 12, color: "rgba(255,255,255,0.2)", transition: "transform 0.2s", transform: expandedSection === sectionKey ? "rotate(90deg)" : "rotate(0)" }}>▸</span>
      </div>
    </button>
  );

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <button onClick={onBack} style={{
          fontFamily: BODY, fontSize: 12, color: "rgba(255,255,255,0.4)",
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8, padding: "6px 12px", cursor: "pointer", transition: "all 0.2s",
        }}>← Back</button>
        <div>
          <h2 style={{ fontFamily: FONTS, fontSize: mobile ? 20 : 26, color: "#fff", letterSpacing: "-0.02em" }}>
            Thinking Digest
          </h2>
          <p style={{ fontFamily: BODY, fontSize: mobile ? 10 : 12, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>
            Your monthly knowledge evolution — Spotify Wrapped for your thinking
          </p>
        </div>
      </div>

      {/* Monthly digest cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: mobile ? 14 : 18 }}>
        {DIGEST_DATA.map((digest) => {
          const isExpanded = expandedMonth === digest.id;
          const isGenerating = digest.generating;

          return (
            <div key={digest.id} className="fade-up" style={{
              background: isGenerating
                ? "linear-gradient(135deg, rgba(251,191,36,0.04), rgba(251,191,36,0.01))"
                : isExpanded
                  ? "linear-gradient(135deg, rgba(255,255,255,0.035), rgba(255,255,255,0.015))"
                  : "rgba(255,255,255,0.025)",
              border: `1px solid ${isGenerating ? "rgba(251,191,36,0.15)" : isExpanded ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)"}`,
              borderRadius: 14, overflow: "hidden",
              transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
            }}>
              {/* Card header — always visible */}
              <div onClick={() => !isGenerating && toggleMonth(digest.id)} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!isGenerating) toggleMonth(digest.id); }}} style={{
                padding: mobile ? "16px 16px" : "20px 24px",
                cursor: isGenerating ? "default" : "pointer",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <h3 style={{ fontFamily: FONTS, fontSize: mobile ? 17 : 20, color: "#fff", fontWeight: 600 }}>
                      {digest.month}
                    </h3>
                    {isGenerating && (
                      <span style={{
                        fontFamily: MONO, fontSize: 10, color: "#FBBF24",
                        background: "rgba(251,191,36,0.1)", padding: "3px 10px",
                        borderRadius: 20, animation: "pulse 2s ease-in-out infinite",
                      }}>generating...</span>
                    )}
                  </div>
                  {digest.theme && (
                    <div style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: "rgba(251,191,36,0.5)", fontWeight: 500, marginBottom: 6 }}>
                      {digest.theme}
                    </div>
                  )}
                  {/* Stat line */}
                  <div style={{
                    fontFamily: MONO, fontSize: mobile ? 9 : 10, color: "rgba(255,255,255,0.25)",
                    display: "flex", flexWrap: "wrap", gap: mobile ? 8 : 14,
                  }}>
                    <span>{digest.stats.conversations} conversations</span>
                    {digest.stats.newTopics > 0 && <span style={{ color: "#10B981" }}>+{digest.stats.newTopics} new topics</span>}
                    {digest.stats.pivots > 0 && <span style={{ color: "#A855F7" }}>{digest.stats.pivots} pivot{digest.stats.pivots !== 1 ? "s" : ""}</span>}
                    <span>{digest.stats.insights} insights curated</span>
                  </div>
                </div>
                {!isGenerating && (
                  <span style={{
                    fontFamily: BODY, fontSize: 18, color: "rgba(255,255,255,0.15)",
                    transition: "transform 0.25s", transform: isExpanded ? "rotate(90deg)" : "rotate(0)",
                    flexShrink: 0, marginLeft: 12,
                  }}>▸</span>
                )}
              </div>

              {/* Expanded content */}
              {isExpanded && !isGenerating && (
                <div style={{
                  padding: mobile ? "0 16px 16px" : "0 24px 24px",
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                  paddingTop: mobile ? 12 : 16,
                }} className="fade-up">
                  {/* Topics Deepened */}
                  {digest.deepened.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <SectionHeader sectionKey={`${digest.id}-deepened`} icon="📈" title="Topics Deepened" count={digest.deepened.length} color="#10B981" />
                      {expandedSection === `${digest.id}-deepened` && (
                        <div style={{ padding: "8px 0 4px", display: "flex", flexDirection: "column", gap: 6 }} className="fade-up">
                          {digest.deepened.map((t, i) => (
                            <div key={i} style={{
                              display: "flex", alignItems: "center", gap: 10,
                              padding: mobile ? "8px 10px" : "8px 14px",
                              background: `${t.color}08`, borderRadius: 8,
                              border: `1px solid ${t.color}15`,
                            }}>
                              <span style={{ fontSize: 16, flexShrink: 0 }}>{t.icon}</span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                  <span style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: t.color, fontWeight: 600 }}>{t.name}</span>
                                  <span style={{ fontFamily: MONO, fontSize: 10, color: "#10B981" }}>{t.delta}</span>
                                </div>
                                <div style={{ fontFamily: BODY, fontSize: mobile ? 10 : 11, color: "rgba(255,255,255,0.35)", marginTop: 2, lineHeight: 1.4 }}>{t.detail}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Topics Gone Quiet */}
                  {digest.goneQuiet.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <SectionHeader sectionKey={`${digest.id}-quiet`} icon="💤" title="Topics Gone Quiet" count={digest.goneQuiet.length} color="#64748B" />
                      {expandedSection === `${digest.id}-quiet` && (
                        <div style={{ padding: "8px 0 4px", display: "flex", flexDirection: "column", gap: 6 }} className="fade-up">
                          {digest.goneQuiet.map((t, i) => (
                            <div key={i} style={{
                              display: "flex", alignItems: "center", gap: 10,
                              padding: mobile ? "8px 10px" : "8px 14px",
                              background: "rgba(100,116,139,0.06)", borderRadius: 8,
                              border: "1px solid rgba(100,116,139,0.12)",
                            }}>
                              <span style={{ fontSize: 16, flexShrink: 0, opacity: 0.5 }}>{t.icon}</span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                  <span style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{t.name}</span>
                                  <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(100,116,139,0.6)" }}>last: {t.lastActive}</span>
                                </div>
                                <div style={{ fontFamily: BODY, fontSize: mobile ? 10 : 11, color: "rgba(255,255,255,0.25)", marginTop: 2, lineHeight: 1.4 }}>{t.detail}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Key Decisions */}
                  {digest.decisions.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <SectionHeader sectionKey={`${digest.id}-decisions`} icon="🎯" title="Key Decisions Made" count={digest.decisions.length} color="#EF4444" />
                      {expandedSection === `${digest.id}-decisions` && (
                        <div style={{ padding: "8px 0 4px", display: "flex", flexDirection: "column", gap: 6 }} className="fade-up">
                          {digest.decisions.map((d, i) => {
                            const matchingChain = Object.values(ARCHAEOLOGY_CHAINS).find(c => c.topicId === d.topicId);
                            return (
                              <div key={i} style={{
                                padding: mobile ? "8px 10px" : "8px 14px",
                                background: `${d.color}06`, borderRadius: 8,
                                border: `1px solid ${d.color}12`,
                                display: "flex", alignItems: "center", gap: 8,
                                cursor: matchingChain ? "pointer" : "default",
                                transition: "all 0.2s",
                              }}
                              onClick={() => matchingChain && onArchaeologyClick && onArchaeologyClick(matchingChain.id)}
                              onMouseEnter={e => { if (matchingChain) e.currentTarget.style.borderColor = `${d.color}30`; }}
                              onMouseLeave={e => { if (matchingChain) e.currentTarget.style.borderColor = `${d.color}12`; }}
                              >
                                <span style={{ fontFamily: BODY, fontSize: 12, color: d.color, fontWeight: 600 }}>●</span>
                                <span style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.4, flex: 1 }}>{d.text}</span>
                                {matchingChain && <span style={{ fontFamily: BODY, fontSize: mobile ? 9 : 10, color: d.color, opacity: 0.5, flexShrink: 0 }}>Trace →</span>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pivots Detected */}
                  {digest.pivots.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <SectionHeader sectionKey={`${digest.id}-pivots`} icon="↩️" title="Pivots Detected" count={digest.pivots.length} color="#A855F7" />
                      {expandedSection === `${digest.id}-pivots` && (
                        <div style={{ padding: "8px 0 4px", display: "flex", flexDirection: "column", gap: 6 }} className="fade-up">
                          {digest.pivots.map((p, i) => {
                            const fullPivot = PIVOT_ENTRIES.find(pe => pe.topicId === p.topicId);
                            return (
                              <div key={i} style={{
                                padding: mobile ? "10px 10px" : "10px 14px",
                                background: "rgba(168,85,247,0.04)", borderRadius: 8,
                                border: "1px solid rgba(168,85,247,0.12)",
                              }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                  <div style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>{p.text}</div>
                                  {fullPivot && (
                                    <span style={{ fontFamily: MONO, fontSize: 9, color: fullPivot.annotated ? "#10B981" : "#FBBF24", background: fullPivot.annotated ? "rgba(16,185,129,0.1)" : "rgba(251,191,36,0.1)", padding: "1px 7px", borderRadius: 8, flexShrink: 0, marginLeft: 8 }}>
                                      {fullPivot.annotated ? "journaled" : "needs annotation"}
                                    </span>
                                  )}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: mobile ? 8 : 14 }}>
                                  <div style={{ flex: 1, padding: "6px 10px", background: "rgba(239,68,68,0.06)", borderRadius: 6, border: "1px solid rgba(239,68,68,0.1)" }}>
                                    <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(239,68,68,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Before</div>
                                    <div style={{ fontFamily: BODY, fontSize: mobile ? 10 : 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>{p.before}</div>
                                  </div>
                                  <span style={{ fontFamily: BODY, fontSize: 14, color: "rgba(168,85,247,0.4)", flexShrink: 0 }}>→</span>
                                  <div style={{ flex: 1, padding: "6px 10px", background: "rgba(16,185,129,0.06)", borderRadius: 6, border: "1px solid rgba(16,185,129,0.1)" }}>
                                    <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(16,185,129,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>After</div>
                                    <div style={{ fontFamily: BODY, fontSize: mobile ? 10 : 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>{p.after}</div>
                                  </div>
                                </div>
                                {fullPivot && (
                                  <div style={{ marginTop: 8, fontFamily: BODY, fontSize: mobile ? 10 : 11, color: "rgba(168,85,247,0.4)", fontStyle: "italic" }}>
                                    Trigger: {fullPivot.trigger.length > 100 ? fullPivot.trigger.slice(0, 100) + "..." : fullPivot.trigger}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Connections Formed */}
                  {digest.connections.length > 0 && (
                    <div style={{ marginBottom: 4 }}>
                      <SectionHeader sectionKey={`${digest.id}-connections`} icon="🔗" title="Connections Formed" count={digest.connections.length} color="#3B82F6" />
                      {expandedSection === `${digest.id}-connections` && (
                        <div style={{ padding: "8px 0 4px", display: "flex", flexDirection: "column", gap: 6 }} className="fade-up">
                          {digest.connections.map((c, i) => (
                            <div key={i} style={{
                              padding: mobile ? "8px 10px" : "8px 14px",
                              background: "rgba(59,130,246,0.04)", borderRadius: 8,
                              border: "1px solid rgba(59,130,246,0.1)",
                              display: "flex", alignItems: "center", gap: 8,
                            }}>
                              <span style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: c.color, fontWeight: 600, flexShrink: 0 }}>{c.from}</span>
                              <span style={{ fontFamily: BODY, fontSize: 10, color: "rgba(255,255,255,0.15)" }}>↔</span>
                              <span style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: "rgba(255,255,255,0.5)", fontWeight: 500, flexShrink: 0 }}>{c.to}</span>
                              {!mobile && <span style={{ fontFamily: BODY, fontSize: 10, color: "rgba(255,255,255,0.2)", marginLeft: 4 }}>— {c.label}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer stat */}
      <div style={{
        textAlign: "center", marginTop: mobile ? 24 : 32,
        fontFamily: MONO, fontSize: mobile ? 9 : 10, color: "rgba(255,255,255,0.15)",
      }}>
        {DIGEST_DATA.length} months of thinking · {DIGEST_DATA.reduce((a, d) => a + d.stats.conversations, 0)} conversations · {DIGEST_DATA.reduce((a, d) => a + d.stats.pivots, 0)} pivots detected
      </div>
    </div>
  );
};

export default DigestView;
