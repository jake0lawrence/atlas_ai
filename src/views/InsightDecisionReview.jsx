import { useState, useEffect, useRef, useMemo } from "react";
import {
  TOPICS, INSIGHT_DECISIONS, PAST_ANALOGIES,
} from '../data/constants';
import { FONTS, BODY, MONO, CSS } from '../styles/base';
import { rowTight, stackTight, screen, display, lede, body, monoSmall, track } from '../styles/shared';
import PastPerspectivePanel from '../components/PastPerspectivePanel';
import { C, alpha, white } from '../styles/tokens';

// ═══════════════════════════════════════════════════════════════
// INSIGHT & DECISION REVIEW (v5 Curation Pipeline — Section 1D)
// ═══════════════════════════════════════════════════════════════

const InsightDecisionReview = ({ onComplete, mobile }) => {
  const [decisions, setDecisions] = useState(() =>
    INSIGHT_DECISIONS.map(d => ({ ...d, status: "pending", humanEdit: null }))
  );
  const [activeIdx, setActiveIdx] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [done, setDone] = useState(false);
  const [showTrail, setShowTrail] = useState(null);
  const [showPastPerspective, setShowPastPerspective] = useState(false);
  const [dismissAnim, setDismissAnim] = useState(null); // "correct" | "reject" | null
  const insightTimersRef = useRef([]);

  useEffect(() => {
    return () => insightTimersRef.current.forEach(clearTimeout);
  }, []);

  const topicMap = useMemo(() => {
    const map = {};
    TOPICS.forEach(t => { map[t.id] = t; });
    return map;
  }, []);

  const reviewed = decisions.filter(d => d.status !== "pending").length;
  const total = decisions.length;
  const progress = total > 0 ? (reviewed / total) * 100 : 0;
  const active = activeIdx !== null && activeIdx < total ? decisions[activeIdx] : null;

  const typeMeta = {
    decision: { label: "Decision", color: C.red, icon: "🎯" },
    pivot: { label: "Pivot", color: C.purple, icon: "↩️" },
    milestone: { label: "Milestone", color: C.yellow, icon: "🏆" },
  };

  const moveNext = (fromIdx) => {
    const start = (fromIdx ?? activeIdx ?? -1) + 1;
    let next = decisions.findIndex((d, i) => i >= start && d.status === "pending");
    if (next < 0) next = decisions.findIndex(d => d.status === "pending");
    setActiveIdx(next >= 0 ? next : null);
    setShowPastPerspective(false);
  };

  const handleCorrect = (idx) => {
    setDismissAnim("correct");
    insightTimersRef.current.push(setTimeout(() => {
      setDecisions(prev => prev.map((d, i) => i === idx ? { ...d, status: "correct" } : d));
      setDismissAnim(null);
      moveNext(idx);
    }, 400));
  };

  const handleEdit = (idx) => {
    setEditing(true);
    setEditText(decisions[idx].aiProposal);
  };

  const commitEdit = (idx) => {
    if (editText.trim() && editText.trim() !== decisions[idx].aiProposal) {
      setDismissAnim("correct");
      insightTimersRef.current.push(setTimeout(() => {
        setDecisions(prev => prev.map((d, i) =>
          i === idx ? { ...d, status: "edited", humanEdit: editText.trim() } : d
        ));
        setDismissAnim(null);
        setEditing(false);
        setEditText("");
        moveNext(idx);
      }, 400));
    } else {
      setEditing(false);
      setEditText("");
    }
  };

  const handleReject = (idx) => {
    setDismissAnim("reject");
    insightTimersRef.current.push(setTimeout(() => {
      setDecisions(prev => prev.map((d, i) => i === idx ? { ...d, status: "rejected" } : d));
      setDismissAnim(null);
      moveNext(idx);
    }, 400));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (editing || done) return;
      if (activeIdx === null) return;
      if (e.key === "Enter") { e.preventDefault(); handleCorrect(activeIdx); }
      else if (e.key === "e" || e.key === "E") { e.preventDefault(); handleEdit(activeIdx); }
      else if (e.key === "x" || e.key === "X") { e.preventDefault(); handleReject(activeIdx); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (reviewed === total && total > 0 && !done) insightTimersRef.current.push(setTimeout(() => setDone(true), 500));
  }, [reviewed, total, done]);

  const correct = decisions.filter(d => d.status === "correct").length;
  const edited = decisions.filter(d => d.status === "edited").length;
  const rejected = decisions.filter(d => d.status === "rejected").length;
  const promoted = correct + edited;

  return (
    <div style={screen(mobile)}>
      <style>{CSS}</style>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(ellipse at 50% 30%, ${alpha(C.yellow, 0.04)} 0%, transparent 50%)`, pointerEvents: "none" }} />

      <div style={{ maxWidth: 800, width: "100%", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: mobile ? 20 : 28 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 14px", borderRadius: 20, marginBottom: 14,
            background: alpha(C.yellow, 0.08), border: `1px solid ${alpha(C.yellow, 0.2)}`,
            fontFamily: MONO, fontSize: 10, color: C.yellow, fontWeight: 600, letterSpacing: "0.08em",
          }}>
            CURATION · STEP 4
          </div>
          <h1 style={display(mobile)}>
            Review <span style={{ color: C.yellow }}>Decisions & Insights</span>
          </h1>
          <p style={{ ...lede(mobile), marginTop: 6 }}>
            AI extracted {total} key decisions, pivots, and milestones. Confirm accuracy before they join your timeline.
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: mobile ? 20 : 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: white(0.3) }}>{reviewed} / {total} reviewed</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: progress === 100 ? C.green : alpha(C.yellow, 0.5) }}>{Math.round(progress)}%</span>
          </div>
          <div style={track}>
            <div style={{
              width: `${progress}%`, height: "100%",
              background: progress === 100 ? `linear-gradient(90deg, ${C.green}, ${C.greenDeep})` : `linear-gradient(90deg, ${C.yellow}CC, ${C.yellow})`,
              borderRadius: 3, transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
              boxShadow: progress === 100 ? `0 0 16px ${alpha(C.green, 0.4)}` : `0 0 12px ${alpha(C.yellow, 0.3)}`,
            }} />
          </div>
        </div>

        {done ? (
          <div className="fade-up" style={{ textAlign: "center", padding: mobile ? "48px 20px" : "64px 40px" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎯</div>
            <h2 style={{ fontFamily: FONTS, fontSize: mobile ? 24 : 32, fontWeight: 700, color: C.yellow, marginBottom: 8 }}>
              Insights Reviewed
            </h2>
            <p style={body(mobile)}>
              {correct} confirmed, {edited} edited, {rejected} rejected
            </p>
            <p style={{ fontFamily: BODY, fontSize: 12, color: white(0.2), marginBottom: 28 }}>
              {promoted} insight{promoted !== 1 ? "s" : ""} promoted to your Evolution timeline.
            </p>
            <button onClick={onComplete} style={{
              fontFamily: BODY, fontSize: 16, fontWeight: 600, color: C.bg0,
              background: `linear-gradient(135deg, ${C.yellow}, ${C.yellowDeep})`, border: "none",
              borderRadius: 12, padding: "14px 40px", cursor: "pointer",
              boxShadow: `0 4px 24px ${alpha(C.yellow, 0.25)}`, transition: "all 0.25s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 32px ${alpha(C.yellow, 0.35)}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 24px ${alpha(C.yellow, 0.25)}`; }}
            >
              Continue →
            </button>
          </div>
        ) : (
          <>
            {/* Active card (card stack top) */}
            {active && (
              <div
                key={active.id}
                className="fade-up"
                style={{
                  background: white(0.03), borderRadius: 18,
                  border: `1px solid ${alpha(C.yellow, 0.2)}`, overflow: "hidden",
                  marginBottom: 16, position: "relative",
                  animation: dismissAnim === "correct" ? "cardPromote 0.4s ease both"
                    : dismissAnim === "reject" ? "cardDismiss 0.4s ease both" : undefined,
                }}
              >
                {/* Card header with type badge and topic */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: mobile ? "14px 16px 10px" : "16px 24px 12px",
                  borderBottom: `1px solid ${white(0.04)}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "3px 10px", borderRadius: 12,
                      background: `${typeMeta[active.type].color}15`,
                      border: `1px solid ${typeMeta[active.type].color}30`,
                      fontFamily: MONO, fontSize: 10, color: typeMeta[active.type].color, fontWeight: 600,
                    }}>
                      {typeMeta[active.type].icon} {typeMeta[active.type].label}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ fontSize: 14 }}>{topicMap[active.topicId]?.icon}</span>
                      <span style={{ fontFamily: BODY, fontSize: 13, color: topicMap[active.topicId]?.color, fontWeight: 600 }}>
                        {topicMap[active.topicId]?.name}
                      </span>
                    </span>
                  </div>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: white(0.15) }}>
                    {activeIdx + 1} / {total}
                  </span>
                </div>

                {/* AI proposal */}
                <div style={{ padding: mobile ? "16px 16px 12px" : "20px 24px 16px" }}>
                  <div style={{ fontFamily: BODY, fontSize: 9, color: white(0.15), textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontWeight: 600 }}>
                    AI-Extracted Insight
                  </div>
                  {editing ? (
                    <div>
                      <textarea
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        autoFocus
                        rows={3}
                        style={{
                          fontFamily: BODY, fontSize: mobile ? 15 : 17, fontWeight: 500, color: C.white,
                          background: white(0.06), border: `1px solid ${alpha(C.yellow, 0.3)}`,
                          borderRadius: 10, padding: "12px 14px", width: "100%", outline: "none",
                          lineHeight: 1.5, resize: "vertical",
                        }}
                        onKeyDown={e => {
                          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitEdit(activeIdx); }
                          if (e.key === "Escape") { setEditing(false); setEditText(""); }
                        }}
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                        <span style={monoSmall}>
                          Enter to save · Escape to cancel
                        </span>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => { setEditing(false); setEditText(""); }} style={{
                            fontFamily: BODY, fontSize: 12, color: white(0.3),
                            background: "none", border: `1px solid ${white(0.1)}`,
                            borderRadius: 8, padding: "6px 14px", cursor: "pointer",
                          }}>Cancel</button>
                          <button onClick={() => commitEdit(activeIdx)} style={{
                            fontFamily: BODY, fontSize: 12, fontWeight: 600, color: C.bg0,
                            background: C.yellow, border: "none",
                            borderRadius: 8, padding: "6px 14px", cursor: "pointer",
                          }}>Save Edit</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      fontFamily: BODY, fontSize: mobile ? 16 : 19, fontWeight: 500,
                      color: white(0.75), lineHeight: 1.5,
                      padding: "12px 16px", borderRadius: 12,
                      background: alpha(C.yellow, 0.04), border: `1px solid ${alpha(C.yellow, 0.1)}`,
                    }}>
                      {active.aiProposal}
                    </div>
                  )}
                </div>

                {/* Source conversation snippet */}
                <div style={{ padding: mobile ? "0 16px 16px" : "0 24px 20px" }}>
                  <div style={{ fontFamily: BODY, fontSize: 9, color: white(0.15), textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontWeight: 600 }}>
                    Source Conversation
                  </div>
                  <div style={{
                    background: white(0.02), borderRadius: 10,
                    border: `1px solid ${white(0.04)}`, padding: mobile ? "10px 12px" : "12px 16px",
                  }}>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ fontFamily: MONO, fontSize: 9, color: alpha(C.gold, 0.35), marginRight: 6 }}>YOU</span>
                      <span style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: white(0.35), lineHeight: 1.5 }}>
                        {active.sourceSnippet.user}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontFamily: MONO, fontSize: 9, color: alpha(C.purple, 0.4), marginRight: 6 }}>AI</span>
                      <span style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: white(0.25), lineHeight: 1.5 }}>
                        {active.sourceSnippet.ai}
                      </span>
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: 9, color: white(0.1), marginTop: 8 }}>
                      {active.sourceRef}
                    </div>
                  </div>
                </div>

                {/* Past perspective button */}
                {!editing && PAST_ANALOGIES.some(a => a.triggerDecisionId === active.id) && (
                  <div style={{ padding: mobile ? "0 16px 8px" : "0 24px 10px" }}>
                    <button
                      onClick={() => setShowPastPerspective(prev => !prev)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setShowPastPerspective(prev => !prev); } }}
                      style={{
                        display: "flex", alignItems: "center", gap: 6, width: "100%",
                        fontFamily: BODY, fontSize: mobile ? 11 : 12, fontWeight: 500,
                        color: showPastPerspective ? C.purple : alpha(C.purple, 0.6),
                        background: showPastPerspective ? alpha(C.purple, 0.1) : alpha(C.purple, 0.04),
                        border: `1px solid ${showPastPerspective ? alpha(C.purple, 0.3) : alpha(C.purple, 0.12)}`,
                        borderRadius: 10, padding: mobile ? "8px 12px" : "9px 14px",
                        cursor: "pointer", transition: "all 0.25s",
                      }}
                      onMouseEnter={e => { if (!showPastPerspective) { e.currentTarget.style.background = alpha(C.purple, 0.08); e.currentTarget.style.borderColor = alpha(C.purple, 0.2); } }}
                      onMouseLeave={e => { if (!showPastPerspective) { e.currentTarget.style.background = alpha(C.purple, 0.04); e.currentTarget.style.borderColor = alpha(C.purple, 0.12); } }}
                    >
                      <span style={{ fontSize: 14 }}>🪞</span>
                      Past perspective
                      <span style={{ fontFamily: MONO, fontSize: 9, color: alpha(C.purple, 0.35), marginLeft: "auto" }}>
                        {showPastPerspective ? "hide" : "show"}
                      </span>
                    </button>
                    {showPastPerspective && (
                      <PastPerspectivePanel decisionId={active.id} mobile={mobile} onClose={() => setShowPastPerspective(false)} />
                    )}
                  </div>
                )}

                {/* Actions */}
                {!editing && (
                  <div style={{
                    display: "flex", gap: 8, padding: mobile ? "0 16px 16px" : "0 24px 20px",
                    flexDirection: mobile ? "column" : "row",
                  }}>
                    {[
                      { action: "correct", label: "Correct", color: C.green, icon: "✓", desc: "Promote to timeline" },
                      { action: "edit", label: "Partially Correct", color: C.blue, icon: "✎", desc: "Edit & promote" },
                      { action: "reject", label: "Not a Real Decision", color: C.red, icon: "✕", desc: "Dismiss" },
                    ].map(btn => (
                      <button key={btn.action}
                        onClick={() => {
                          if (btn.action === "correct") handleCorrect(activeIdx);
                          else if (btn.action === "edit") handleEdit(activeIdx);
                          else handleReject(activeIdx);
                        }}
                        style={{
                          flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                          padding: mobile ? "12px 14px" : "14px 16px",
                          fontFamily: BODY, fontSize: 13, fontWeight: 600,
                          color: btn.action === "correct" ? C.bg0 : btn.color,
                          background: btn.action === "correct" ? btn.color : `${btn.color}10`,
                          border: `1px solid ${btn.action === "correct" ? btn.color : btn.color + "30"}`,
                          borderRadius: 12, cursor: "pointer", transition: "all 0.2s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 4px 16px ${btn.color}25`; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                      >
                        <span style={rowTight}>
                          <span style={{ fontSize: 14, lineHeight: 1 }}>{btn.icon}</span>
                          {btn.label}
                        </span>
                        <span style={{
                          fontSize: 9, fontWeight: 400, opacity: 0.7,
                          color: btn.action === "correct" ? C.bg0 : btn.color,
                        }}>{btn.desc}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Keyboard hints */}
                {!editing && !mobile && (
                  <div style={{
                    padding: "0 24px 14px", fontFamily: MONO, fontSize: 9,
                    color: white(0.1), textAlign: "center",
                  }}>
                    Enter correct · E edit · X reject
                  </div>
                )}
              </div>
            )}

            {/* Stacked cards behind (visual depth) */}
            {active && decisions.filter(d => d.status === "pending").length > 1 && (
              <div style={{ position: "relative", height: 12, marginBottom: 12 }}>
                {[1, 2].map(offset => {
                  const remaining = decisions.filter(d => d.status === "pending").length - 1;
                  if (offset > remaining) return null;
                  return (
                    <div key={offset} style={{
                      position: "absolute", left: offset * 6, right: offset * 6, top: -4 - offset * 4,
                      height: 8, borderRadius: "0 0 14px 14px",
                      background: white(0.015 - offset * 0.005),
                      border: `1px solid ${white(0.03)}`,
                      borderTop: "none", zIndex: -offset,
                    }} />
                  );
                })}
              </div>
            )}

            {/* Reviewed items (edit trail) */}
            {reviewed > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{
                  fontFamily: BODY, fontSize: 9, color: white(0.15),
                  textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span>Edit Trail</span>
                  <span style={{ fontFamily: MONO, fontSize: 9, color: white(0.08) }}>
                    — AI proposed vs. human confirmed
                  </span>
                </div>
                <div style={stackTight}>
                  {decisions.filter(d => d.status !== "pending").map(d => {
                    const topic = topicMap[d.topicId];
                    const meta = typeMeta[d.type];
                    const isTrailOpen = showTrail === d.id;
                    return (
                      <div key={d.id} style={{
                        background: white(0.015), borderRadius: 12,
                        border: `1px solid ${white(0.04)}`,
                        overflow: "hidden", transition: "all 0.3s",
                      }}>
                        <div
                          style={{
                            display: "flex", alignItems: "center", gap: mobile ? 8 : 12,
                            padding: mobile ? "10px 12px" : "11px 16px",
                            cursor: d.status === "edited" ? "pointer" : "default",
                          }}
                          onClick={() => d.status === "edited" && setShowTrail(isTrailOpen ? null : d.id)}
                        >
                          <div style={{
                            width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                            background: d.status === "correct" ? C.green : d.status === "edited" ? C.blue : C.red,
                          }} />
                          <span style={{ fontSize: 13, flexShrink: 0 }}>{meta.icon}</span>
                          <span style={{ fontSize: 12, flexShrink: 0 }}>{topic?.icon}</span>
                          <span style={{
                            fontFamily: BODY, fontSize: mobile ? 11 : 12, color: white(0.4),
                            fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {d.humanEdit || d.aiProposal}
                          </span>
                          <span style={{
                            fontFamily: MONO, fontSize: 10, flexShrink: 0, textTransform: "uppercase",
                            color: d.status === "correct" ? C.green : d.status === "edited" ? C.blue : C.red,
                          }}>
                            {d.status === "correct" ? "promoted" : d.status === "edited" ? "edited ▾" : "dismissed"}
                          </span>
                        </div>
                        {/* Expanded edit trail for edited items */}
                        {isTrailOpen && d.status === "edited" && (
                          <div className="fade-up" style={{
                            padding: mobile ? "0 12px 12px" : "0 16px 14px",
                            display: "flex", flexDirection: "column", gap: 8,
                          }}>
                            <div style={{
                              background: alpha(C.red, 0.04), border: `1px solid ${alpha(C.red, 0.1)}`,
                              borderRadius: 8, padding: "8px 12px",
                            }}>
                              <span style={{ fontFamily: MONO, fontSize: 9, color: alpha(C.red, 0.5), display: "block", marginBottom: 4 }}>AI PROPOSED</span>
                              <span style={{ fontFamily: BODY, fontSize: 12, color: white(0.3), lineHeight: 1.5, textDecoration: "line-through", textDecorationColor: alpha(C.red, 0.3) }}>
                                {d.aiProposal}
                              </span>
                            </div>
                            <div style={{
                              background: alpha(C.green, 0.04), border: `1px solid ${alpha(C.green, 0.1)}`,
                              borderRadius: 8, padding: "8px 12px",
                            }}>
                              <span style={{ fontFamily: MONO, fontSize: 9, color: alpha(C.green, 0.5), display: "block", marginBottom: 4 }}>HUMAN CONFIRMED</span>
                              <span style={{ fontFamily: BODY, fontSize: 12, color: white(0.5), lineHeight: 1.5 }}>
                                {d.humanEdit}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom bar */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: mobile ? "14px 0" : "16px 0", marginTop: 12,
              borderTop: `1px solid ${white(0.05)}`,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 11, color: white(0.2) }}>
                {reviewed > 0 ? `${promoted} promoted · ${rejected} dismissed` : "Review each insight"}
              </div>
              <button onClick={() => {
                setDecisions(prev => prev.map(d => d.status === "pending" ? { ...d, status: "correct" } : d));
              }} style={{
                fontFamily: BODY, fontSize: 14, fontWeight: 600,
                color: reviewed > 0 ? C.bg0 : white(0.5),
                background: reviewed > 0 ? `linear-gradient(135deg, ${C.yellow}, ${C.yellowDeep})` : white(0.06),
                border: reviewed > 0 ? "none" : `1px solid ${white(0.1)}`,
                borderRadius: 10, padding: "10px 28px", cursor: "pointer",
                boxShadow: reviewed > 0 ? `0 4px 20px ${alpha(C.yellow, 0.25)}` : "none",
                transition: "all 0.3s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {reviewed > 0 ? "Approve Remaining →" : "Approve All →"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InsightDecisionReview;
