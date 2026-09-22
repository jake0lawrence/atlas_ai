import { useState } from "react";
import {
  ARCHAEOLOGY_CHAINS, DIGEST_DATA, PIVOT_ENTRIES,
} from '../data/constants';
import { FONTS, BODY, MONO } from '../styles/base';
import { C, alpha, white } from '../styles/tokens';
import { row, grow, container } from '../styles/shared';

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
      borderBottom: `1px solid ${white(0.04)}`,
    }}>
      <div style={row}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: color || white(0.6), fontWeight: 500 }}>{title}</span>
      </div>
      <div style={row}>
        {count > 0 && <span style={{ fontFamily: MONO, fontSize: 10, color: color || C.gold, background: `${color || C.gold}12`, padding: "2px 8px", borderRadius: 10 }}>{count}</span>}
        <span style={{ fontFamily: BODY, fontSize: 12, color: white(0.2), transition: "transform 0.2s", transform: expandedSection === sectionKey ? "rotate(90deg)" : "rotate(0)" }}>▸</span>
      </div>
    </button>
  );

  return (
    <div style={container}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <button onClick={onBack} style={{
          fontFamily: BODY, fontSize: 12, color: white(0.4),
          background: white(0.04), border: `1px solid ${white(0.08)}`,
          borderRadius: 8, padding: "6px 12px", cursor: "pointer", transition: "all 0.2s",
        }}>← Back</button>
        <div>
          <h2 style={{ fontFamily: FONTS, fontSize: mobile ? 20 : 26, color: C.white, letterSpacing: "-0.02em" }}>
            Thinking Digest
          </h2>
          <p style={{ fontFamily: BODY, fontSize: mobile ? 10 : 12, color: white(0.25), marginTop: 2 }}>
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
                ? `linear-gradient(135deg, ${alpha(C.gold, 0.04)}, ${alpha(C.gold, 0.01)})`
                : isExpanded
                  ? `linear-gradient(135deg, ${white(0.035)}, ${white(0.015)})`
                  : white(0.025),
              border: `1px solid ${isGenerating ? alpha(C.gold, 0.15) : isExpanded ? white(0.1) : white(0.06)}`,
              borderRadius: 14, overflow: "hidden",
              transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
            }}>
              {/* Card header — always visible */}
              <div onClick={() => !isGenerating && toggleMonth(digest.id)} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!isGenerating) toggleMonth(digest.id); }}} style={{
                padding: mobile ? "16px 16px" : "20px 24px",
                cursor: isGenerating ? "default" : "pointer",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div style={grow}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <h3 style={{ fontFamily: FONTS, fontSize: mobile ? 17 : 20, color: C.white, fontWeight: 600 }}>
                      {digest.month}
                    </h3>
                    {isGenerating && (
                      <span style={{
                        fontFamily: MONO, fontSize: 10, color: C.gold,
                        background: alpha(C.gold, 0.1), padding: "3px 10px",
                        borderRadius: 20, animation: "pulse 2s ease-in-out infinite",
                      }}>generating...</span>
                    )}
                  </div>
                  {digest.theme && (
                    <div style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: alpha(C.gold, 0.5), fontWeight: 500, marginBottom: 6 }}>
                      {digest.theme}
                    </div>
                  )}
                  {/* Stat line */}
                  <div style={{
                    fontFamily: MONO, fontSize: mobile ? 9 : 10, color: white(0.25),
                    display: "flex", flexWrap: "wrap", gap: mobile ? 8 : 14,
                  }}>
                    <span>{digest.stats.conversations} conversations</span>
                    {digest.stats.newTopics > 0 && <span style={{ color: C.green }}>+{digest.stats.newTopics} new topics</span>}
                    {digest.stats.pivots > 0 && <span style={{ color: C.purple }}>{digest.stats.pivots} pivot{digest.stats.pivots !== 1 ? "s" : ""}</span>}
                    <span>{digest.stats.insights} insights curated</span>
                  </div>
                </div>
                {!isGenerating && (
                  <span style={{
                    fontFamily: BODY, fontSize: 18, color: white(0.15),
                    transition: "transform 0.25s", transform: isExpanded ? "rotate(90deg)" : "rotate(0)",
                    flexShrink: 0, marginLeft: 12,
                  }}>▸</span>
                )}
              </div>

              {/* Expanded content */}
              {isExpanded && !isGenerating && (
                <div style={{
                  padding: mobile ? "0 16px 16px" : "0 24px 24px",
                  borderTop: `1px solid ${white(0.05)}`,
                  paddingTop: mobile ? 12 : 16,
                }} className="fade-up">
                  {/* Topics Deepened */}
                  {digest.deepened.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <SectionHeader sectionKey={`${digest.id}-deepened`} icon="📈" title="Topics Deepened" count={digest.deepened.length} color={C.green} />
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
                              <div style={grow}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                  <span style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: t.color, fontWeight: 600 }}>{t.name}</span>
                                  <span style={{ fontFamily: MONO, fontSize: 10, color: C.green }}>{t.delta}</span>
                                </div>
                                <div style={{ fontFamily: BODY, fontSize: mobile ? 10 : 11, color: white(0.35), marginTop: 2, lineHeight: 1.4 }}>{t.detail}</div>
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
                      <SectionHeader sectionKey={`${digest.id}-quiet`} icon="💤" title="Topics Gone Quiet" count={digest.goneQuiet.length} color={C.slate} />
                      {expandedSection === `${digest.id}-quiet` && (
                        <div style={{ padding: "8px 0 4px", display: "flex", flexDirection: "column", gap: 6 }} className="fade-up">
                          {digest.goneQuiet.map((t, i) => (
                            <div key={i} style={{
                              display: "flex", alignItems: "center", gap: 10,
                              padding: mobile ? "8px 10px" : "8px 14px",
                              background: alpha(C.slate, 0.06), borderRadius: 8,
                              border: `1px solid ${alpha(C.slate, 0.12)}`,
                            }}>
                              <span style={{ fontSize: 16, flexShrink: 0, opacity: 0.5 }}>{t.icon}</span>
                              <div style={grow}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                  <span style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: white(0.4), fontWeight: 500 }}>{t.name}</span>
                                  <span style={{ fontFamily: MONO, fontSize: 10, color: alpha(C.slate, 0.6) }}>last: {t.lastActive}</span>
                                </div>
                                <div style={{ fontFamily: BODY, fontSize: mobile ? 10 : 11, color: white(0.25), marginTop: 2, lineHeight: 1.4 }}>{t.detail}</div>
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
                      <SectionHeader sectionKey={`${digest.id}-decisions`} icon="🎯" title="Key Decisions Made" count={digest.decisions.length} color={C.red} />
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
                                <span style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: white(0.5), lineHeight: 1.4, flex: 1 }}>{d.text}</span>
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
                      <SectionHeader sectionKey={`${digest.id}-pivots`} icon="↩️" title="Pivots Detected" count={digest.pivots.length} color={C.purple} />
                      {expandedSection === `${digest.id}-pivots` && (
                        <div style={{ padding: "8px 0 4px", display: "flex", flexDirection: "column", gap: 6 }} className="fade-up">
                          {digest.pivots.map((p, i) => {
                            const fullPivot = PIVOT_ENTRIES.find(pe => pe.topicId === p.topicId);
                            return (
                              <div key={i} style={{
                                padding: mobile ? "10px 10px" : "10px 14px",
                                background: alpha(C.purple, 0.04), borderRadius: 8,
                                border: `1px solid ${alpha(C.purple, 0.12)}`,
                              }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                  <div style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: white(0.55), fontWeight: 500 }}>{p.text}</div>
                                  {fullPivot && (
                                    <span style={{ fontFamily: MONO, fontSize: 9, color: fullPivot.annotated ? C.green : C.gold, background: fullPivot.annotated ? alpha(C.green, 0.1) : alpha(C.gold, 0.1), padding: "1px 7px", borderRadius: 8, flexShrink: 0, marginLeft: 8 }}>
                                      {fullPivot.annotated ? "journaled" : "needs annotation"}
                                    </span>
                                  )}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: mobile ? 8 : 14 }}>
                                  <div style={{ flex: 1, padding: "6px 10px", background: alpha(C.red, 0.06), borderRadius: 6, border: `1px solid ${alpha(C.red, 0.1)}` }}>
                                    <div style={{ fontFamily: MONO, fontSize: 9, color: alpha(C.red, 0.5), textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Before</div>
                                    <div style={{ fontFamily: BODY, fontSize: mobile ? 10 : 11, color: white(0.4), lineHeight: 1.4 }}>{p.before}</div>
                                  </div>
                                  <span style={{ fontFamily: BODY, fontSize: 14, color: alpha(C.purple, 0.4), flexShrink: 0 }}>→</span>
                                  <div style={{ flex: 1, padding: "6px 10px", background: alpha(C.green, 0.06), borderRadius: 6, border: `1px solid ${alpha(C.green, 0.1)}` }}>
                                    <div style={{ fontFamily: MONO, fontSize: 9, color: alpha(C.green, 0.5), textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>After</div>
                                    <div style={{ fontFamily: BODY, fontSize: mobile ? 10 : 11, color: white(0.4), lineHeight: 1.4 }}>{p.after}</div>
                                  </div>
                                </div>
                                {fullPivot && (
                                  <div style={{ marginTop: 8, fontFamily: BODY, fontSize: mobile ? 10 : 11, color: alpha(C.purple, 0.4), fontStyle: "italic" }}>
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
                      <SectionHeader sectionKey={`${digest.id}-connections`} icon="🔗" title="Connections Formed" count={digest.connections.length} color={C.blue} />
                      {expandedSection === `${digest.id}-connections` && (
                        <div style={{ padding: "8px 0 4px", display: "flex", flexDirection: "column", gap: 6 }} className="fade-up">
                          {digest.connections.map((c, i) => (
                            <div key={i} style={{
                              padding: mobile ? "8px 10px" : "8px 14px",
                              background: alpha(C.blue, 0.04), borderRadius: 8,
                              border: `1px solid ${alpha(C.blue, 0.1)}`,
                              display: "flex", alignItems: "center", gap: 8,
                            }}>
                              <span style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: c.color, fontWeight: 600, flexShrink: 0 }}>{c.from}</span>
                              <span style={{ fontFamily: BODY, fontSize: 10, color: white(0.15) }}>↔</span>
                              <span style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: white(0.5), fontWeight: 500, flexShrink: 0 }}>{c.to}</span>
                              {!mobile && <span style={{ fontFamily: BODY, fontSize: 10, color: white(0.2), marginLeft: 4 }}>— {c.label}</span>}
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
        fontFamily: MONO, fontSize: mobile ? 9 : 10, color: white(0.15),
      }}>
        {DIGEST_DATA.length} months of thinking · {DIGEST_DATA.reduce((a, d) => a + d.stats.conversations, 0)} conversations · {DIGEST_DATA.reduce((a, d) => a + d.stats.pivots, 0)} pivots detected
      </div>
    </div>
  );
};

export default DigestView;
