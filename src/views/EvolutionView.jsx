import { useState, useRef } from "react";
import {
  PLATFORM_INSIGHTS, EVOLUTION_PHASES, PIVOT_ENTRIES,
} from '../data/constants';
import { FONTS, BODY, MONO } from '../styles/base';
import { C, alpha, white, black } from '../styles/tokens';
import { grow, title, lede, monoSmall } from '../styles/shared';

const EvolutionView = ({ mobile, onRewind }) => {
  const [expanded, setExpanded] = useState(null);
  const [evoTab, setEvoTab] = useState("timeline");
  const [pivotAnnotations, setPivotAnnotations] = useState(() => {
    const initial = {};
    PIVOT_ENTRIES.forEach(p => { if (p.annotation) initial[p.id] = p.annotation; });
    return initial;
  });
  const [editingPivot, setEditingPivot] = useState(null);
  const [expandedPivot, setExpandedPivot] = useState(null);
  const annotationRef = useRef(null);

  const handleSaveAnnotation = (pivotId, text) => {
    setPivotAnnotations(prev => ({ ...prev, [pivotId]: text }));
    setEditingPivot(null);
  };

  const evoTabs = [
    { id: "timeline", label: "Timeline", icon: "◇" },
    { id: "pivots", label: "Pivots", icon: "↩️" },
  ];

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h2 style={title(mobile)}>How You Evolved</h2>
        <p style={lede(mobile)}>From asking "how do I" to designing entire systems.</p>
        {onRewind && (
          <button onClick={onRewind} style={{
            fontFamily: BODY, fontSize: mobile ? 11 : 12, fontWeight: 500,
            color: C.pink, background: alpha(C.pink, 0.08),
            border: `1px solid ${alpha(C.pink, 0.2)}`, borderRadius: 8,
            padding: mobile ? "7px 14px" : "8px 18px", cursor: "pointer",
            transition: "all 0.25s", marginTop: 12,
            display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: 14 }}>⏪</span> Watch It Build
          </button>
        )}
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 28 }}>
        {evoTabs.map(tab => (
          <button key={tab.id} onClick={() => setEvoTab(tab.id)} style={{
            fontFamily: BODY, fontSize: mobile ? 11 : 12, fontWeight: evoTab === tab.id ? 600 : 400,
            color: evoTab === tab.id ? C.bg0 : white(0.4),
            background: evoTab === tab.id ? C.purple : white(0.04),
            border: `1px solid ${evoTab === tab.id ? C.purple : white(0.08)}`,
            borderRadius: 8, padding: mobile ? "7px 16px" : "8px 20px", cursor: "pointer",
            transition: "all 0.25s", display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: 13 }}>{tab.icon}</span> {tab.label}
            {tab.id === "pivots" && <span style={{
              fontFamily: MONO, fontSize: 9, background: evoTab === tab.id ? black(0.2) : alpha(C.purple, 0.15),
              color: evoTab === tab.id ? black(0.6) : C.purple,
              padding: "1px 6px", borderRadius: 8, marginLeft: 2,
            }}>{PIVOT_ENTRIES.length}</span>}
          </button>
        ))}
      </div>

      {evoTab === "timeline" ? (
        <>
          <div style={{ position: "relative", paddingLeft: mobile ? 32 : 40 }}>
            <div style={{ position: "absolute", left: mobile ? 12 : 16, top: 0, bottom: 0, width: 3, background: `linear-gradient(180deg, ${C.blue}, ${C.green}, ${C.amber}, ${C.red}, ${C.purple}, ${C.pink})` }} />
            {EVOLUTION_PHASES.map((phase, i) => (
              <div key={i} style={{ marginBottom: 16, position: "relative", cursor: "pointer" }} onClick={() => setExpanded(expanded === i ? null : i)}>
                <div style={{ position: "absolute", left: mobile ? -26 : -30, top: 8, width: mobile ? 16 : 20, height: mobile ? 16 : 20, borderRadius: "50%", background: phase.color, border: `3px solid ${C.bg0}`, boxShadow: `0 0 10px ${phase.color}35` }} />
                <div style={{
                  background: expanded === i ? `linear-gradient(135deg, ${phase.color}0C, transparent)` : white(0.025),
                  border: `1px solid ${expanded === i ? phase.color + "28" : white(0.06)}`,
                  borderRadius: 12, padding: expanded === i ? (mobile ? "16px 18px" : "20px 24px") : (mobile ? "14px 16px" : "16px 20px"), transition: "all 0.3s",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <span style={{ fontFamily: MONO, fontSize: mobile ? 10 : 11, color: phase.color }}>{phase.period}</span>
                      <h3 style={{ fontFamily: FONTS, fontSize: mobile ? 17 : 20, color: C.white, margin: "3px 0 0", fontWeight: 600 }}>{phase.title}</h3>
                    </div>
                    <div style={{ fontFamily: BODY, fontSize: mobile ? 20 : 24, fontWeight: 700, color: phase.color + "50", flexShrink: 0 }}>{phase.conversations}</div>
                  </div>
                  {expanded === i && (
                    <div style={{ marginTop: 10 }} className="fade-up">
                      <p style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: white(0.5), lineHeight: 1.6 }}>{phase.desc}</p>
                      <div style={{ fontFamily: MONO, fontSize: 10, color: white(0.2), marginTop: 8 }}>{phase.conversations} conversations</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 14, marginTop: 36 }}>
            {PLATFORM_INSIGHTS.map((p, i) => (
              <div key={i} style={{ background: `linear-gradient(135deg, ${p.color}06, transparent)`, border: `1px solid ${p.color}18`, borderRadius: 12, padding: mobile ? "16px 18px" : "20px 24px" }}>
                <h4 style={{ fontFamily: BODY, fontSize: 12, color: p.color, fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>{p.label}</h4>
                {p.items.map((item, j) => (
                  <div key={j} style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: white(0.45), padding: "4px 0", borderBottom: j < p.items.length - 1 ? `1px solid ${white(0.04)}` : "none" }}>{item}</div>
                ))}
              </div>
            ))}
          </div>
        </>
      ) : (
        /* ── Pivots Tab ── */
        <div style={{ display: "flex", flexDirection: "column", gap: mobile ? 14 : 18 }}>
          <p style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: white(0.3), textAlign: "center", marginBottom: 4 }}>
            Auto-detected moments where your thinking shifted. Annotate to build your decision journal.
          </p>
          {PIVOT_ENTRIES.map((pivot) => {
            const isOpen = expandedPivot === pivot.id;
            const annotation = pivotAnnotations[pivot.id];
            const isEditing = editingPivot === pivot.id;
            return (
              <div key={pivot.id} className="fade-up" style={{
                background: isOpen ? `linear-gradient(135deg, ${pivot.topicColor}08, transparent)` : white(0.025),
                border: `1px solid ${isOpen ? pivot.topicColor + "25" : white(0.06)}`,
                borderRadius: 14, overflow: "hidden", transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
              }}>
                {/* Pivot header */}
                <div onClick={() => setExpandedPivot(isOpen ? null : pivot.id)} role="button" tabIndex={0}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpandedPivot(isOpen ? null : pivot.id); } }}
                  style={{ padding: mobile ? "14px 16px" : "18px 24px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{pivot.topicIcon}</span>
                  <div style={grow}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                      <span style={{ fontFamily: MONO, fontSize: mobile ? 9 : 10, color: pivot.topicColor }}>{pivot.date}</span>
                      <span style={monoSmall}>·</span>
                      <span style={{ fontFamily: BODY, fontSize: mobile ? 10 : 11, color: white(0.35) }}>{pivot.topicName}</span>
                      {annotation ? (
                        <span style={{ fontFamily: MONO, fontSize: 9, color: C.green, background: alpha(C.green, 0.1), padding: "1px 7px", borderRadius: 8 }}>annotated</span>
                      ) : (
                        <span style={{ fontFamily: MONO, fontSize: 9, color: C.gold, background: alpha(C.gold, 0.1), padding: "1px 7px", borderRadius: 8 }}>awaiting annotation</span>
                      )}
                    </div>
                    <h4 style={{ fontFamily: FONTS, fontSize: mobile ? 14 : 16, color: C.white, fontWeight: 600 }}>{pivot.title}</h4>
                  </div>
                  <span style={{ fontFamily: BODY, fontSize: 18, color: white(0.15), transition: "transform 0.25s", transform: isOpen ? "rotate(90deg)" : "rotate(0)", flexShrink: 0 }}>▸</span>
                </div>

                {/* Expanded pivot detail */}
                {isOpen && (
                  <div style={{ padding: mobile ? "0 16px 16px" : "0 24px 24px", borderTop: `1px solid ${white(0.05)}`, paddingTop: mobile ? 12 : 16 }} className="fade-up">
                    {/* Before → After */}
                    <div style={{ display: "flex", alignItems: mobile ? "stretch" : "center", flexDirection: mobile ? "column" : "row", gap: mobile ? 8 : 14, marginBottom: 16 }}>
                      <div style={{ flex: 1, padding: mobile ? "10px 12px" : "12px 16px", background: alpha(C.red, 0.05), borderRadius: 8, border: `1px solid ${alpha(C.red, 0.12)}` }}>
                        <div style={{ fontFamily: MONO, fontSize: 9, color: alpha(C.red, 0.5), textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Before</div>
                        <div style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: white(0.5), lineHeight: 1.5 }}>{pivot.before}</div>
                      </div>
                      <span style={{ fontFamily: BODY, fontSize: 16, color: alpha(C.purple, 0.4), flexShrink: 0, textAlign: "center" }}>→</span>
                      <div style={{ flex: 1, padding: mobile ? "10px 12px" : "12px 16px", background: alpha(C.green, 0.05), borderRadius: 8, border: `1px solid ${alpha(C.green, 0.12)}` }}>
                        <div style={{ fontFamily: MONO, fontSize: 9, color: alpha(C.green, 0.5), textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>After</div>
                        <div style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: white(0.5), lineHeight: 1.5 }}>{pivot.after}</div>
                      </div>
                    </div>

                    {/* Trigger */}
                    <div style={{ marginBottom: 16, padding: mobile ? "10px 12px" : "12px 16px", background: alpha(C.gold, 0.04), borderRadius: 8, border: `1px solid ${alpha(C.gold, 0.1)}` }}>
                      <div style={{ fontFamily: MONO, fontSize: 9, color: alpha(C.gold, 0.5), textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Trigger</div>
                      <div style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: white(0.45), lineHeight: 1.5 }}>{pivot.trigger}</div>
                    </div>

                    {/* Impact assessment */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontFamily: MONO, fontSize: 9, color: white(0.25), textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Affected Topics</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {pivot.impact.map((topic, i) => (
                          <span key={i} style={{
                            fontFamily: BODY, fontSize: mobile ? 10 : 11, color: white(0.4),
                            background: white(0.04), border: `1px solid ${white(0.08)}`,
                            borderRadius: 6, padding: "3px 10px",
                          }}>{topic}</span>
                        ))}
                      </div>
                    </div>

                    {/* Annotation field */}
                    <div style={{ padding: mobile ? "10px 12px" : "12px 16px", background: annotation ? alpha(C.green, 0.04) : alpha(C.purple, 0.04), borderRadius: 8, border: `1px solid ${annotation ? alpha(C.green, 0.12) : alpha(C.purple, 0.12)}` }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <div style={{ fontFamily: MONO, fontSize: 9, color: annotation ? alpha(C.green, 0.5) : alpha(C.purple, 0.5), textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          {annotation ? "Your Annotation" : "Changed my mind because..."}
                        </div>
                        {!isEditing && (
                          <button onClick={(e) => { e.stopPropagation(); setEditingPivot(pivot.id); }} style={{
                            fontFamily: BODY, fontSize: 10, color: C.purple, background: alpha(C.purple, 0.08),
                            border: `1px solid ${alpha(C.purple, 0.15)}`, borderRadius: 6, padding: "3px 10px", cursor: "pointer",
                          }}>{annotation ? "Edit" : "Annotate"}</button>
                        )}
                      </div>
                      {isEditing ? (
                        <div>
                          <textarea ref={annotationRef} defaultValue={annotation || ""} placeholder="Why did your thinking change? What did you learn?"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              width: "100%", minHeight: 70, fontFamily: BODY, fontSize: mobile ? 11 : 12,
                              color: white(0.6), background: black(0.3), border: `1px solid ${alpha(C.purple, 0.2)}`,
                              borderRadius: 6, padding: "8px 10px", resize: "vertical", outline: "none", lineHeight: 1.5,
                            }} />
                          <div style={{ display: "flex", gap: 8, marginTop: 8, justifyContent: "flex-end" }}>
                            <button onClick={(e) => { e.stopPropagation(); setEditingPivot(null); }} style={{
                              fontFamily: BODY, fontSize: 10, color: white(0.3), background: "transparent",
                              border: `1px solid ${white(0.08)}`, borderRadius: 6, padding: "4px 12px", cursor: "pointer",
                            }}>Cancel</button>
                            <button onClick={(e) => { e.stopPropagation(); handleSaveAnnotation(pivot.id, annotationRef.current?.value || ""); }} style={{
                              fontFamily: BODY, fontSize: 10, color: C.bg0, background: C.purple,
                              border: "none", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontWeight: 600,
                            }}>Save</button>
                          </div>
                        </div>
                      ) : annotation ? (
                        <div style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: white(0.45), lineHeight: 1.5, fontStyle: "italic" }}>"{annotation}"</div>
                      ) : (
                        <div style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: white(0.2), lineHeight: 1.5, fontStyle: "italic" }}>Click "Annotate" to record why your thinking changed...</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <div style={{ textAlign: "center", marginTop: 8, fontFamily: MONO, fontSize: mobile ? 9 : 10, color: white(0.15) }}>
            {PIVOT_ENTRIES.length} pivots detected · {PIVOT_ENTRIES.filter(p => pivotAnnotations[p.id]).length} annotated
          </div>
        </div>
      )}
    </div>
  );
};

export default EvolutionView;
