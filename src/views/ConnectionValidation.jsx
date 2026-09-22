import { useState, useEffect, useRef, useMemo } from "react";
import {
  TOPICS, CONNECTIONS,
} from '../data/constants';
import { FONTS, BODY, MONO, CSS } from '../styles/base';

// ═══════════════════════════════════════════════════════════════
// CONNECTION VALIDATION (v5 Curation Pipeline — Section 1C)
// ═══════════════════════════════════════════════════════════════

const ConnectionValidation = ({ onComplete, mobile, w }) => {
  const [connections, setConnections] = useState(() =>
    CONNECTIONS.map((c, i) => ({ ...c, id: i, status: "pending" }))
  );
  const [activeIdx, setActiveIdx] = useState(0);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editLabel, setEditLabel] = useState("");
  const [done, setDone] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newFrom, setNewFrom] = useState("");
  const [newTo, setNewTo] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const connTimersRef = useRef([]);

  useEffect(() => {
    return () => connTimersRef.current.forEach(clearTimeout);
  }, []);

  const topicMap = useMemo(() => {
    const map = {};
    TOPICS.forEach(t => { map[t.id] = t; });
    return map;
  }, []);

  const reviewed = connections.filter(c => c.status !== "pending").length;
  const total = connections.length;
  const progress = total > 0 ? (reviewed / total) * 100 : 0;
  const active = activeIdx !== null ? connections[activeIdx] : null;
  const tablet = w >= 640 && w < 1024;

  const moveNext = (fromIdx) => {
    const start = (fromIdx ?? activeIdx ?? -1) + 1;
    let next = connections.findIndex((c, i) => i >= start && c.status === "pending");
    if (next < 0) next = connections.findIndex(c => c.status === "pending");
    setActiveIdx(next >= 0 ? next : null);
  };

  const handleAction = (idx, action) => {
    setConnections(prev => prev.map((c, i) => {
      if (i !== idx) return c;
      const s = action === "confirmed" ? Math.min(c.strength + 0.1, 1) : c.strength;
      return { ...c, status: action, strength: s };
    }));
    connTimersRef.current.push(setTimeout(() => moveNext(idx), 150));
  };

  const startEdit = (idx) => { setEditingIdx(idx); setEditLabel(connections[idx].label); };
  const commitEdit = () => {
    if (editingIdx !== null && editLabel.trim()) {
      setConnections(prev => prev.map((c, i) =>
        i === editingIdx ? { ...c, label: editLabel.trim(), status: "edited" } : c
      ));
      connTimersRef.current.push(setTimeout(() => moveNext(editingIdx), 150));
    }
    setEditingIdx(null);
  };

  const addConnection = () => {
    if (newFrom && newTo && newFrom !== newTo && newLabel.trim()) {
      setConnections(prev => [...prev, {
        id: prev.length, from: newFrom, to: newTo,
        label: newLabel.trim(), strength: 0.5, status: "confirmed",
      }]);
      setAdding(false); setNewFrom(""); setNewTo(""); setNewLabel("");
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (editingIdx !== null || done || adding) return;
      if (activeIdx === null) return;
      if (e.key === "Enter") { e.preventDefault(); handleAction(activeIdx, "confirmed"); }
      else if (e.key === "e" || e.key === "E") { e.preventDefault(); startEdit(activeIdx); }
      else if (e.key === "x" || e.key === "X") { e.preventDefault(); handleAction(activeIdx, "rejected"); }
      else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = connections.findIndex((c, i) => i > activeIdx && c.status === "pending");
        setActiveIdx(next >= 0 ? next : activeIdx);
      }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        let prev = -1;
        for (let i = activeIdx - 1; i >= 0; i--) { if (connections[i].status === "pending") { prev = i; break; } }
        if (prev >= 0) setActiveIdx(prev);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (reviewed === total && total > 0 && !done) connTimersRef.current.push(setTimeout(() => setDone(true), 400));
  }, [reviewed, total, done]);

  const confirmed = connections.filter(c => c.status === "confirmed").length;
  const edited = connections.filter(c => c.status === "edited").length;
  const rejected = connections.filter(c => c.status === "rejected").length;

  // Mini-graph: determine highlighted topics from active connection
  const highlightedTopics = new Set();
  if (active) { highlightedTopics.add(active.from); highlightedTopics.add(active.to); }

  return (
    <div style={{ minHeight: "100vh", background: "#08080C", display: "flex", flexDirection: "column", padding: mobile ? "24px 16px" : "32px 40px" }}>
      <style>{CSS}</style>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse at 50% 30%, rgba(168,85,247,0.04) 0%, transparent 50%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1100, width: "100%", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: mobile ? 20 : 28 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 14px", borderRadius: 20, marginBottom: 14,
            background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)",
            fontFamily: MONO, fontSize: 10, color: "#A855F7", fontWeight: 600, letterSpacing: "0.08em",
          }}>
            CURATION · STEP 3
          </div>
          <h1 style={{ fontFamily: FONTS, fontSize: mobile ? 26 : 36, fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Validate <span style={{ color: "#A855F7" }}>Connections</span>
          </h1>
          <p style={{ fontFamily: BODY, fontSize: mobile ? 12 : 14, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>
            AI discovered {CONNECTIONS.length} connections between your topics. Confirm, edit, or reject.
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: mobile ? 20 : 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{reviewed} / {total} reviewed</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: progress === 100 ? "#10B981" : "rgba(168,85,247,0.5)" }}>{Math.round(progress)}%</span>
          </div>
          <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.04)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              width: `${progress}%`, height: "100%",
              background: progress === 100 ? "linear-gradient(90deg, #10B981, #059669)" : "linear-gradient(90deg, #A855F7CC, #A855F7)",
              borderRadius: 3, transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
              boxShadow: progress === 100 ? "0 0 16px rgba(16,185,129,0.4)" : "0 0 12px rgba(168,85,247,0.3)",
            }} />
          </div>
        </div>

        {done ? (
          <div className="fade-up" style={{ textAlign: "center", padding: mobile ? "48px 20px" : "64px 40px" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔗</div>
            <h2 style={{ fontFamily: FONTS, fontSize: mobile ? 24 : 32, fontWeight: 700, color: "#A855F7", marginBottom: 8 }}>
              Connections Validated
            </h2>
            <p style={{ fontFamily: BODY, fontSize: mobile ? 13 : 15, color: "rgba(255,255,255,0.4)", marginBottom: 6, lineHeight: 1.6 }}>
              {confirmed} confirmed, {edited} edited, {rejected} rejected{connections.length > CONNECTIONS.length ? `, ${connections.length - CONNECTIONS.length} added` : ""}
            </p>
            <p style={{ fontFamily: BODY, fontSize: 12, color: "rgba(255,255,255,0.2)", marginBottom: 28 }}>
              Your knowledge graph now reflects real relationships.
            </p>
            <button onClick={onComplete} style={{
              fontFamily: BODY, fontSize: 16, fontWeight: 600, color: "#08080C",
              background: "linear-gradient(135deg, #A855F7, #7C3AED)", border: "none",
              borderRadius: 12, padding: "14px 40px", cursor: "pointer",
              boxShadow: "0 4px 24px rgba(168,85,247,0.25)", transition: "all 0.25s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(168,85,247,0.35)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(168,85,247,0.25)"; }}
            >
              Continue →
            </button>
          </div>
        ) : (
          <>
            {/* Mini connection graph */}
            <div style={{
              background: "rgba(255,255,255,0.015)", borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.04)", padding: mobile ? "16px 12px" : "20px 16px",
              marginBottom: mobile ? 16 : 24, overflow: "hidden",
            }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: mobile ? 6 : 10, justifyContent: "center", alignItems: "center" }}>
                {TOPICS.map(topic => {
                  const isHighlighted = highlightedTopics.has(topic.id);
                  const isFrom = active && active.from === topic.id;
                  const isTo = active && active.to === topic.id;
                  const size = mobile ? 36 : 44;
                  return (
                    <div key={topic.id} style={{
                      width: size, height: size, borderRadius: "50%",
                      background: isFrom || isTo ? `radial-gradient(circle, ${topic.color}40, ${topic.color}15)` : `radial-gradient(circle, ${topic.color}12, ${topic.color}04)`,
                      border: `2px solid ${isFrom || isTo ? topic.color : topic.color + "15"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      opacity: active ? (isHighlighted ? 1 : 0.2) : 0.5,
                      transform: isFrom || isTo ? "scale(1.15)" : "scale(1)",
                      transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                      boxShadow: isFrom || isTo ? `0 0 16px ${topic.color}30` : "none",
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: mobile ? 12 : 15 }}>{topic.icon}</span>
                    </div>
                  );
                })}
              </div>
              {active && (
                <div className="fade-up" style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: mobile ? 8 : 12,
                  marginTop: mobile ? 10 : 14, padding: "8px 0",
                }}>
                  <span style={{ fontFamily: BODY, fontSize: mobile ? 11 : 13, color: topicMap[active.from]?.color, fontWeight: 600 }}>
                    {topicMap[active.from]?.icon} {topicMap[active.from]?.name}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: "rgba(168,85,247,0.5)" }}>←→</span>
                  <span style={{ fontFamily: BODY, fontSize: mobile ? 11 : 13, color: topicMap[active.to]?.color, fontWeight: 600 }}>
                    {topicMap[active.to]?.icon} {topicMap[active.to]?.name}
                  </span>
                </div>
              )}
            </div>

            {/* Connection cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {connections.map((conn, idx) => {
                const fromT = topicMap[conn.from];
                const toT = topicMap[conn.to];
                const isActive = idx === activeIdx;
                const isDone = conn.status !== "pending";
                const isEditing = editingIdx === idx;

                return (
                  <div key={conn.id} style={{
                    background: isActive ? "rgba(255,255,255,0.04)" : isDone ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${isActive ? "rgba(168,85,247,0.3)" : isDone ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 14, overflow: "hidden",
                    opacity: isDone && !isActive ? 0.4 : 1,
                    transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
                    animation: `queueSlideUp 0.5s ease both`,
                    animationDelay: `${idx * 40}ms`,
                  }}>
                    {!isActive ? (
                      /* Compact row */
                      <div style={{
                        display: "flex", alignItems: "center", gap: mobile ? 6 : 12,
                        padding: mobile ? "10px 12px" : "12px 18px",
                        cursor: conn.status === "pending" ? "pointer" : "default",
                      }}
                        onClick={() => { if (conn.status === "pending") setActiveIdx(idx); }}
                        role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (conn.status === "pending") setActiveIdx(idx); }}}
                      >
                        <div style={{
                          width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                          background: conn.status === "confirmed" ? "#10B981" : conn.status === "edited" ? "#3B82F6" : conn.status === "rejected" ? "#EF4444" : "rgba(255,255,255,0.1)",
                        }} />
                        <span style={{ fontSize: 13, flexShrink: 0 }}>{fromT?.icon}</span>
                        <span style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: "rgba(255,255,255,0.4)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {fromT?.name}
                        </span>
                        <span style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.12)", flexShrink: 0 }}>↔</span>
                        <span style={{ fontSize: 13, flexShrink: 0 }}>{toT?.icon}</span>
                        <span style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: "rgba(255,255,255,0.4)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>
                          {toT?.name}
                        </span>
                        {/* Strength bar */}
                        <div style={{ width: mobile ? 30 : 50, height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
                          <div style={{ width: `${conn.strength * 100}%`, height: "100%", background: "#A855F7", borderRadius: 2 }} />
                        </div>
                        {isDone && (
                          <span style={{
                            fontFamily: MONO, fontSize: 10, flexShrink: 0, textTransform: "uppercase",
                            color: conn.status === "confirmed" ? "#10B981" : conn.status === "edited" ? "#3B82F6" : "#EF4444",
                          }}>{conn.status}</span>
                        )}
                      </div>
                    ) : (
                      /* Expanded active card */
                      <div style={{ padding: mobile ? "16px 14px" : "20px 24px" }}>
                        <div style={{
                          display: mobile ? "flex" : "grid",
                          gridTemplateColumns: tablet ? "1fr 1fr auto" : "1fr 1.2fr 200px",
                          flexDirection: mobile ? "column" : undefined,
                          gap: mobile ? 16 : 20,
                        }}>
                          {/* LEFT: Connection info */}
                          <div>
                            <div style={{ fontFamily: BODY, fontSize: 9, color: "rgba(255,255,255,0.15)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
                              Connection
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                              <span style={{ fontSize: 20 }}>{fromT?.icon}</span>
                              <span style={{ fontFamily: BODY, fontSize: 14, color: fromT?.color, fontWeight: 600 }}>{fromT?.name}</span>
                            </div>
                            <div style={{
                              fontFamily: MONO, fontSize: 11, color: "rgba(168,85,247,0.4)",
                              padding: "2px 0", marginBottom: 10, marginLeft: 4,
                            }}>↕ connects to</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                              <span style={{ fontSize: 20 }}>{toT?.icon}</span>
                              <span style={{ fontFamily: BODY, fontSize: 14, color: toT?.color, fontWeight: 600 }}>{toT?.name}</span>
                            </div>
                            {/* Strength */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.2)" }}>Strength</span>
                              <div style={{ width: 80, height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
                                <div style={{ width: `${conn.strength * 100}%`, height: "100%", background: "linear-gradient(90deg, #A855F7, #7C3AED)", borderRadius: 3 }} />
                              </div>
                              <span style={{ fontFamily: MONO, fontSize: 10, color: "#A855F7" }}>{Math.round(conn.strength * 100)}%</span>
                            </div>
                          </div>

                          {/* CENTER: Label */}
                          <div>
                            <div style={{ fontFamily: BODY, fontSize: 9, color: "rgba(255,255,255,0.15)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
                              AI-Generated Label
                            </div>
                            {isEditing ? (
                              <div>
                                <input
                                  value={editLabel}
                                  onChange={e => setEditLabel(e.target.value)}
                                  onBlur={commitEdit}
                                  onKeyDown={e => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditingIdx(null); }}
                                  autoFocus
                                  style={{
                                    fontFamily: BODY, fontSize: 15, fontWeight: 500, color: "#fff",
                                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(168,85,247,0.3)",
                                    borderRadius: 8, padding: "8px 12px", width: "100%", outline: "none",
                                  }}
                                />
                                <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.15)", marginTop: 6 }}>
                                  Enter to save · Escape to cancel
                                </div>
                              </div>
                            ) : (
                              <div style={{
                                fontFamily: BODY, fontSize: mobile ? 15 : 17, fontWeight: 500,
                                color: "rgba(255,255,255,0.65)", lineHeight: 1.5,
                                padding: "8px 14px", borderRadius: 10,
                                background: "rgba(168,85,247,0.04)", border: "1px solid rgba(168,85,247,0.1)",
                              }}>
                                "{conn.label}"
                              </div>
                            )}
                          </div>

                          {/* RIGHT: Actions */}
                          <div>
                            <div style={{ fontFamily: BODY, fontSize: 9, color: "rgba(255,255,255,0.15)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
                              Actions
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              {[
                                { action: "confirmed", label: "Confirm", color: "#10B981", icon: "✓" },
                                { action: "edit", label: "Edit Label", color: "#3B82F6", icon: "✎" },
                                { action: "rejected", label: "Reject", color: "#EF4444", icon: "✕" },
                              ].map(btn => (
                                <button key={btn.action} onClick={() => btn.action === "edit" ? startEdit(idx) : handleAction(idx, btn.action)}
                                  style={{
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                    width: "100%", padding: mobile ? "10px 14px" : "11px 16px",
                                    fontFamily: BODY, fontSize: 13, fontWeight: 600,
                                    color: btn.action === "confirmed" ? "#08080C" : btn.color,
                                    background: btn.action === "confirmed" ? btn.color : `${btn.color}10`,
                                    border: `1px solid ${btn.action === "confirmed" ? btn.color : btn.color + "30"}`,
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
                            {!mobile && (
                              <div style={{ marginTop: 12, fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.12)", lineHeight: 1.8 }}>
                                Enter confirm · E edit · X reject
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

            {/* Add new connection */}
            {adding ? (
              <div className="fade-up" style={{
                background: "rgba(168,85,247,0.04)", border: "1px solid rgba(168,85,247,0.2)",
                borderRadius: 14, padding: mobile ? "16px 14px" : "20px 24px", marginBottom: 20,
              }}>
                <div style={{ fontFamily: BODY, fontSize: 13, color: "#A855F7", fontWeight: 600, marginBottom: 12 }}>
                  Add a Connection AI Missed
                </div>
                <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", gap: 10, marginBottom: 12 }}>
                  <select value={newFrom} onChange={e => setNewFrom(e.target.value)} style={{
                    fontFamily: BODY, fontSize: 13, color: "#fff", background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", flex: 1, outline: "none",
                  }}>
                    <option value="" style={{ background: "#1a1a2e" }}>From topic...</option>
                    {TOPICS.map(t => <option key={t.id} value={t.id} style={{ background: "#1a1a2e" }}>{t.icon} {t.name}</option>)}
                  </select>
                  <select value={newTo} onChange={e => setNewTo(e.target.value)} style={{
                    fontFamily: BODY, fontSize: 13, color: "#fff", background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", flex: 1, outline: "none",
                  }}>
                    <option value="" style={{ background: "#1a1a2e" }}>To topic...</option>
                    {TOPICS.filter(t => t.id !== newFrom).map(t => <option key={t.id} value={t.id} style={{ background: "#1a1a2e" }}>{t.icon} {t.name}</option>)}
                  </select>
                </div>
                <input
                  value={newLabel} onChange={e => setNewLabel(e.target.value)}
                  placeholder="Connection label (e.g., 'Shared tech stack')"
                  onKeyDown={e => { if (e.key === "Enter") addConnection(); }}
                  style={{
                    fontFamily: BODY, fontSize: 13, color: "#fff", background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px",
                    width: "100%", outline: "none", marginBottom: 12,
                  }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={addConnection} disabled={!newFrom || !newTo || !newLabel.trim()} style={{
                    fontFamily: BODY, fontSize: 13, fontWeight: 600, color: newFrom && newTo && newLabel.trim() ? "#08080C" : "rgba(255,255,255,0.3)",
                    background: newFrom && newTo && newLabel.trim() ? "#A855F7" : "rgba(255,255,255,0.04)",
                    border: "none", borderRadius: 8, padding: "8px 20px", cursor: "pointer", transition: "all 0.2s",
                  }}>Add Connection</button>
                  <button onClick={() => setAdding(false)} style={{
                    fontFamily: BODY, fontSize: 13, color: "rgba(255,255,255,0.3)",
                    background: "none", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8, padding: "8px 16px", cursor: "pointer",
                  }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAdding(true)} style={{
                fontFamily: BODY, fontSize: 12, fontWeight: 500, color: "rgba(168,85,247,0.6)",
                background: "none", border: "1px dashed rgba(168,85,247,0.2)",
                borderRadius: 10, padding: "10px 18px", cursor: "pointer", width: "100%",
                marginBottom: 20, transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(168,85,247,0.4)"; e.currentTarget.style.color = "#A855F7"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(168,85,247,0.2)"; e.currentTarget.style.color = "rgba(168,85,247,0.6)"; }}
              >
                + Add a connection AI missed
              </button>
            )}

            {/* Bottom bar */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: mobile ? "14px 0" : "16px 0",
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}>
              <div style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
                {reviewed > 0 ? `${confirmed} confirmed · ${edited} edited · ${rejected} rejected` : "Review each connection"}
              </div>
              <button onClick={() => {
                setConnections(prev => prev.map(c => c.status === "pending" ? { ...c, status: "confirmed" } : c));
              }} style={{
                fontFamily: BODY, fontSize: 14, fontWeight: 600,
                color: reviewed > 0 ? "#08080C" : "rgba(255,255,255,0.5)",
                background: reviewed > 0 ? "linear-gradient(135deg, #A855F7, #7C3AED)" : "rgba(255,255,255,0.06)",
                border: reviewed > 0 ? "none" : "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10, padding: "10px 28px", cursor: "pointer",
                boxShadow: reviewed > 0 ? "0 4px 20px rgba(168,85,247,0.25)" : "none",
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

export default ConnectionValidation;
