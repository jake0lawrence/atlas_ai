import { useState, useEffect, useRef, useMemo } from "react";
import {
  TOPICS, REVIEW_QUEUE_DATA,
} from '../data/constants';
import useSound from '../hooks/useSound';
import { FONTS, BODY, MONO, CSS } from '../styles/base';
import ConfidenceBadge from '../components/ConfidenceBadge';

const ReviewQueue = ({ onComplete, mobile, w }) => {
  const [items, setItems] = useState(() => REVIEW_QUEUE_DATA.map(item => ({ ...item, status: "pending" })));
  const [activeIdx, setActiveIdx] = useState(null);
  const [autoApproving, setAutoApproving] = useState(new Set());
  const [started, setStarted] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [hapticId, setHapticId] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const sound = useSound();
  const reviewTimersRef = useRef([]);

  useEffect(() => {
    return () => reviewTimersRef.current.forEach(clearTimeout);
  }, []);

  // Derive activeIdx from items — moves to first pending whenever items change
  useEffect(() => {
    const firstPending = items.findIndex(i => i.status === "pending");
    if (firstPending >= 0) setActiveIdx(firstPending);
  }, [items]);

  const topicMap = useMemo(() => {
    const map = {};
    TOPICS.forEach(t => { map[t.id] = t; });
    return map;
  }, []);

  const reviewed = items.filter(i => i.status !== "pending").length;
  const total = items.length;
  const progress = total > 0 ? (reviewed / total) * 100 : 0;

  // Auto-approve high-confidence items sequentially after start
  useEffect(() => {
    if (started) return;
    setStarted(true);
    const highConfItems = items
      .map((item, idx) => ({ ...item, idx }))
      .filter(i => i.confidence >= 90);

    let delay = 800;
    highConfItems.forEach((item) => {
      reviewTimersRef.current.push(setTimeout(() => {
        setAutoApproving(prev => new Set([...prev, item.id]));
      }, delay));
      reviewTimersRef.current.push(setTimeout(() => {
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: "approved" } : i));
        setAutoApproving(prev => { const next = new Set(prev); next.delete(item.id); return next; });
      }, delay + 700));
      delay += 900;
    });
    // Active index is now derived via useEffect on items
  }, []);

  // Check if all done — play chime + trigger celebration
  useEffect(() => {
    if (reviewed === total && total > 0 && started) {
      reviewTimersRef.current.push(setTimeout(() => { setAllDone(true); sound.play("chime"); }, 400));
    }
  }, [reviewed, total, started, sound]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (!activeItem) return;
      if (e.key === "Enter") { e.preventDefault(); handleAction(activeItem.id, "approved"); }
      else if (e.key === "e" || e.key === "E") { e.preventDefault(); handleAction(activeItem.id, "edited"); }
      else if (e.key === "x" || e.key === "X") { e.preventDefault(); handleAction(activeItem.id, "rejected"); }
      else if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); handleAction(activeItem.id, "skipped"); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        const pendingBefore = [];
        items.forEach((item, i) => { if (i < activeIdx && item.status === "pending") pendingBefore.push(i); });
        if (pendingBefore.length > 0) setActiveIdx(pendingBefore[pendingBefore.length - 1]);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []); // keyboard navigation

  const handleAction = (id, action) => {
    // Haptic-style bounce feedback on approve/edit actions
    if (action === "approved" || action === "edited") {
      setHapticId(id);
      reviewTimersRef.current.push(setTimeout(() => setHapticId(null), 350));
    }
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: action } : i));
    // activeIdx is derived via useEffect on items
  };

  const activeItem = activeIdx !== null ? items[activeIdx] : null;
  const activeTopic = activeItem ? topicMap[activeItem.topicId] : null;

  const tablet = w >= 640 && w < 1024;

  return (
    <div style={{ minHeight: "100vh", background: "#08080C", display: "flex", flexDirection: "column", padding: mobile ? "24px 16px" : "32px 40px" }}>
      <style>{CSS}</style>

      {/* Ambient glow */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse at 50% 30%, rgba(251,191,36,0.04) 0%, transparent 50%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1100, width: "100%", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: mobile ? 20 : 28 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 14px", borderRadius: 20, marginBottom: 14,
            background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)",
            fontFamily: MONO, fontSize: 10, color: "#FBBF24", fontWeight: 600,
            letterSpacing: "0.08em",
          }}>
            CURATION
          </div>
          <h1 style={{ fontFamily: FONTS, fontSize: mobile ? 26 : 36, fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Review <span style={{ color: "#FBBF24" }}>Queue</span>
          </h1>
          <p style={{ fontFamily: BODY, fontSize: mobile ? 12 : 14, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>
            AI classified your conversations. Verify, edit, or reject each one.
          </p>
          <button onClick={() => { const on = sound.toggle(); setSoundEnabled(on); }} style={{
            marginTop: 8, fontFamily: MONO, fontSize: 10, color: soundEnabled ? "#FBBF24" : "rgba(255,255,255,0.2)",
            background: "transparent", border: `1px solid ${soundEnabled ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.08)"}`,
            borderRadius: 12, padding: "3px 10px", cursor: "pointer", transition: "all 0.2s",
          }}>
            {soundEnabled ? "♪ Sound On" : "♪ Sound Off"}
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: mobile ? 20 : 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              {reviewed} / {total} reviewed
            </span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: progress === 100 ? "#10B981" : "rgba(251,191,36,0.5)" }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.04)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              width: `${progress}%`, height: "100%",
              background: progress === 100 ? "linear-gradient(90deg, #10B981, #059669)" : "linear-gradient(90deg, #FBBF24CC, #FBBF24)",
              borderRadius: 3, transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
              boxShadow: progress === 100 ? "0 0 16px rgba(16,185,129,0.4)" : "0 0 12px rgba(251,191,36,0.3)",
            }} />
          </div>
        </div>

        {/* All done state */}
        {allDone ? (
          <div className="fade-up" style={{ textAlign: "center", padding: mobile ? "48px 20px" : "64px 40px", position: "relative", overflow: "hidden" }}>
            {/* Confetti burst */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", overflow: "hidden" }}>
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} style={{
                  position: "absolute",
                  left: `${10 + Math.random() * 80}%`,
                  top: "50%",
                  width: Math.random() > 0.5 ? 6 : 4,
                  height: Math.random() > 0.5 ? 6 : 10,
                  borderRadius: Math.random() > 0.5 ? "50%" : 2,
                  background: ["#FBBF24", "#10B981", "#3B82F6", "#EF4444", "#8B5CF6", "#EC4899"][i % 6],
                  animation: `confettiBurst ${0.8 + Math.random() * 0.6}s ease-out ${i * 40}ms both`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  opacity: 0.9,
                }} />
              ))}
            </div>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✓</div>
            <h2 style={{ fontFamily: FONTS, fontSize: mobile ? 24 : 32, fontWeight: 700, color: "#10B981", marginBottom: 8 }}>
              Queue Complete
            </h2>
            <p style={{ fontFamily: BODY, fontSize: mobile ? 13 : 15, color: "rgba(255,255,255,0.4)", marginBottom: 6, lineHeight: 1.6 }}>
              {items.filter(i => i.status === "approved").length} approved, {items.filter(i => i.status === "edited").length} edited, {items.filter(i => i.status === "rejected").length} rejected, {items.filter(i => i.status === "skipped").length} skipped
            </p>
            <p style={{ fontFamily: BODY, fontSize: 12, color: "rgba(255,255,255,0.2)", marginBottom: 28 }}>
              Your atlas is now human-verified.
            </p>
            <button onClick={onComplete} style={{
              fontFamily: BODY, fontSize: 16, fontWeight: 600, color: "#08080C",
              background: "linear-gradient(135deg, #FBBF24, #F59E0B)", border: "none",
              borderRadius: 12, padding: "14px 40px", cursor: "pointer",
              boxShadow: "0 4px 24px rgba(251,191,36,0.25)",
              transition: "all 0.25s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(251,191,36,0.35)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(251,191,36,0.25)"; }}
            >
              Enter Your Atlas →
            </button>
          </div>
        ) : (
          <>
            {/* Item list / queue */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {items.map((item, idx) => {
                const topic = topicMap[item.topicId];
                const isActive = idx === activeIdx;
                const isAutoApproving = autoApproving.has(item.id);
                const isDone = item.status !== "pending";
                const isHaptic = hapticId === item.id;

                return (
                  <div key={item.id} style={{
                    background: isActive ? "rgba(255,255,255,0.04)" : isDone ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${isActive ? "rgba(251,191,36,0.3)" : isDone ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 14, overflow: "hidden",
                    opacity: isDone && !isAutoApproving ? 0.4 : 1,
                    transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
                    animation: isHaptic ? "hapticBounce 0.35s ease" : isAutoApproving ? "autoApprove 0.7s ease forwards" : "queueSlideUp 0.5s ease both",
                    animationDelay: isAutoApproving ? "0s" : isHaptic ? "0s" : `${idx * 60}ms`,
                  }}>
                    {/* Compact row for non-active items */}
                    {!isActive ? (
                      <div style={{
                        display: "flex", alignItems: "center", gap: mobile ? 8 : 14,
                        padding: mobile ? "10px 12px" : "12px 18px",
                        cursor: item.status === "pending" ? "pointer" : "default",
                      }}
                        onClick={() => { if (item.status === "pending") setActiveIdx(idx); }}
                        role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (item.status === "pending") setActiveIdx(idx); }}}
                      >
                        {/* Status indicator */}
                        <div style={{
                          width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                          background: item.status === "approved" ? "#10B981" : item.status === "edited" ? "#3B82F6" : item.status === "rejected" ? "#EF4444" : item.status === "skipped" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.1)",
                        }} />
                        {/* Topic icon + name */}
                        <span style={{ fontSize: 14, flexShrink: 0 }}>{topic?.icon}</span>
                        <span style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: "rgba(255,255,255,0.5)", fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {topic?.name}
                        </span>
                        <ConfidenceBadge confidence={item.confidence} />
                        {isDone && (
                          <span style={{ fontFamily: MONO, fontSize: 10, color: item.status === "approved" ? "#10B981" : item.status === "edited" ? "#3B82F6" : item.status === "rejected" ? "#EF4444" : "rgba(255,255,255,0.2)", textTransform: "uppercase", flexShrink: 0 }}>
                            {item.status}
                          </span>
                        )}
                      </div>
                    ) : (
                      /* Expanded active item — three-column layout */
                      <div style={{ padding: mobile ? "16px 14px" : "20px 24px" }}>
                        {/* Three-column layout (stacks on mobile) */}
                        <div style={{
                          display: mobile ? "flex" : "grid",
                          gridTemplateColumns: tablet ? "1fr 1.5fr auto" : "280px 1fr 200px",
                          flexDirection: mobile ? "column" : undefined,
                          gap: mobile ? 16 : 20,
                        }}>
                          {/* LEFT: AI Classification */}
                          <div>
                            <div style={{ fontFamily: BODY, fontSize: 9, color: "rgba(255,255,255,0.15)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
                              AI Classification
                            </div>
                            {/* Topic */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                              <span style={{ fontSize: 20 }}>{activeTopic?.icon}</span>
                              <div>
                                <div style={{ fontFamily: BODY, fontSize: 14, color: activeTopic?.color, fontWeight: 600 }}>{activeTopic?.name}</div>
                                <div style={{ fontFamily: BODY, fontSize: 10, color: "rgba(255,255,255,0.2)" }}>{activeTopic?.count} conversations in topic</div>
                              </div>
                            </div>
                            {/* Confidence */}
                            <div style={{ marginBottom: 10 }}>
                              <ConfidenceBadge confidence={activeItem.confidence} />
                            </div>
                            {/* Entities */}
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                              {activeItem.entities.map((entity, ei) => (
                                <span key={ei} style={{
                                  fontFamily: MONO, fontSize: 10, padding: "3px 8px", borderRadius: 6,
                                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                                  color: "rgba(255,255,255,0.45)",
                                }}>{entity}</span>
                              ))}
                            </div>
                            {/* Decision flag */}
                            {activeItem.decisionFlag && (
                              <div style={{
                                display: "flex", alignItems: "center", gap: 6,
                                padding: "6px 10px", borderRadius: 8,
                                background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)",
                              }}>
                                <span style={{ fontSize: 12 }}>🎯</span>
                                <div>
                                  <div style={{ fontFamily: BODY, fontSize: 9, color: "#EF4444", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Decision Detected</div>
                                  <div style={{ fontFamily: BODY, fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{activeItem.decisionText}</div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* CENTER: Source Conversation */}
                          <div>
                            <div style={{ fontFamily: BODY, fontSize: 9, color: "rgba(255,255,255,0.15)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
                              Conversation Snippet
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {/* User message */}
                              <div style={{
                                background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)",
                                borderRadius: "12px 12px 12px 4px", padding: mobile ? "10px 12px" : "12px 16px",
                              }}>
                                <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(59,130,246,0.5)", marginBottom: 4, fontWeight: 600 }}>YOU</div>
                                <div style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.55 }}>{activeItem.snippet.user}</div>
                              </div>
                              {/* AI message */}
                              <div style={{
                                background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.1)",
                                borderRadius: "12px 12px 4px 12px", padding: mobile ? "10px 12px" : "12px 16px",
                              }}>
                                <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(251,191,36,0.5)", marginBottom: 4, fontWeight: 600 }}>AI</div>
                                <div style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.55 }}>{activeItem.snippet.ai}</div>
                              </div>
                            </div>
                          </div>

                          {/* RIGHT: Action Panel */}
                          <div>
                            <div style={{ fontFamily: BODY, fontSize: 9, color: "rgba(255,255,255,0.15)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
                              Actions
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              {[
                                { action: "approved", label: "Approve", color: "#10B981", icon: "✓" },
                                { action: "edited", label: "Edit", color: "#3B82F6", icon: "✎" },
                                { action: "rejected", label: "Reject", color: "#EF4444", icon: "✕" },
                                { action: "skipped", label: "Skip", color: "rgba(255,255,255,0.3)", icon: "→" },
                              ].map(btn => (
                                <button key={btn.action} onClick={() => handleAction(activeItem.id, btn.action)}
                                  style={{
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                    width: "100%", padding: mobile ? "10px 14px" : "11px 16px",
                                    fontFamily: BODY, fontSize: 13, fontWeight: 600,
                                    color: btn.action === "approved" ? "#08080C" : btn.color,
                                    background: btn.action === "approved" ? btn.color : `${btn.color}10`,
                                    border: `1px solid ${btn.action === "approved" ? btn.color : btn.color + "30"}`,
                                    borderRadius: 10, cursor: "pointer", transition: "all 0.2s",
                                  }}
                                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 4px 16px ${btn.color}25`; }}
                                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                                >
                                  <span style={{ fontSize: 14, lineHeight: 1 }}>{btn.icon}</span>
                                  {btn.label}
                                </button>
                              ))}
                            </div>
                            {/* Keyboard hint */}
                            {!mobile && (
                              <div style={{ marginTop: 12, fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.12)", lineHeight: 1.8 }}>
                                Enter approve · E edit · X reject · ↑↓ navigate · → skip
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Skip all / proceed button when no active item but not all done */}
            {activeIdx === null && !allDone && reviewed < total && (
              <div className="fade-up" style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontFamily: BODY, fontSize: 12, color: "rgba(255,255,255,0.2)", marginBottom: 12 }}>
                  Auto-approving high-confidence items...
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewQueue;
