import { useState } from "react";
import {
  TOPICS, CURATED_PALETTE, TOPIC_SPARKLINES, SPLIT_SUGGESTIONS,
  MERGE_SUGGESTIONS,
} from '../data/constants';
import { FONTS, BODY, MONO, CSS } from '../styles/base';
import ConfidenceBadge from '../components/ConfidenceBadge';
import MiniSparkline from '../components/MiniSparkline';

const TopicCurationPanel = ({ onComplete, mobile, w }) => {
  const [topics, setTopics] = useState(() => TOPICS.map(t => ({
    ...t, starred: false, confidence: Math.floor(70 + Math.random() * 25),
  })));
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [colorPickerId, setColorPickerId] = useState(null);
  const [merging, setMerging] = useState(null); // { fromId, suggestion }
  const [merged, setMerged] = useState(new Set()); // IDs that have been merged away
  const [changeLog, setChangeLog] = useState([]); // track user actions for summary
  const [done, setDone] = useState(false);

  const tablet = w >= 640 && w < 1024;

  const startRename = (t) => { setEditingId(t.id); setEditName(t.name); };
  const commitRename = () => {
    if (editingId && editName.trim()) {
      setTopics(prev => prev.map(t => t.id === editingId ? { ...t, name: editName.trim() } : t));
      setChangeLog(prev => [...prev, "renamed"]);
    }
    setEditingId(null);
  };

  const toggleStar = (id) => {
    setTopics(prev => prev.map(t => t.id === id ? { ...t, starred: !t.starred } : t));
    setChangeLog(prev => [...prev, "starred"]);
  };

  const changeColor = (id, color) => {
    setTopics(prev => prev.map(t => t.id === id ? { ...t, color } : t));
    setColorPickerId(null);
    setChangeLog(prev => [...prev, "recolored"]);
  };

  const startMerge = (fromId) => {
    const suggestion = MERGE_SUGGESTIONS.find(m => m.from === fromId);
    setMerging({ fromId, suggestion });
  };

  const executeMerge = (targetId) => {
    if (!merging) return;
    const source = topics.find(t => t.id === merging.fromId);
    const suggestion = merging.suggestion;
    setTopics(prev => prev.map(t => {
      if (t.id === targetId) {
        return {
          ...t,
          name: suggestion?.suggestedName || `${t.name} + ${source?.name}`,
          count: t.count + (source?.count || 0),
          words: t.words + (source?.words || 0),
        };
      }
      return t;
    }));
    setMerged(prev => new Set([...prev, merging.fromId]));
    setMerging(null);
    setSelectedId(null);
    setChangeLog(prev => [...prev, "merged"]);
  };

  const executeSplit = (topicId) => {
    const suggestion = SPLIT_SUGGESTIONS[topicId];
    if (!suggestion) return;
    const original = topics.find(t => t.id === topicId);
    if (!original) return;
    const half = Math.floor(original.count / 2);
    const halfWords = Math.floor(original.words / 2);
    setTopics(prev => {
      const idx = prev.findIndex(t => t.id === topicId);
      const newTopics = [...prev];
      newTopics[idx] = { ...original, name: suggestion.into[0], icon: suggestion.icons[0], count: half, words: halfWords };
      newTopics.splice(idx + 1, 0, {
        ...original, id: topicId + "_split", name: suggestion.into[1], icon: suggestion.icons[1],
        count: original.count - half, words: original.words - halfWords, color: CURATED_PALETTE[Math.floor(Math.random() * CURATED_PALETTE.length)],
      });
      return newTopics;
    });
    setSelectedId(null);
    setChangeLog(prev => [...prev, "split"]);
  };

  const visibleTopics = topics.filter(t => !merged.has(t.id));
  const renames = changeLog.filter(c => c === "renamed").length;
  const merges = changeLog.filter(c => c === "merged").length;
  const splits = changeLog.filter(c => c === "split").length;
  const stars = topics.filter(t => t.starred).length;
  const totalChanges = renames + merges + splits + stars + changeLog.filter(c => c === "recolored").length;

  return (
    <div style={{ minHeight: "100vh", background: "#08080C", display: "flex", flexDirection: "column", padding: mobile ? "24px 16px" : "32px 40px" }}>
      <style>{CSS}</style>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse at 50% 30%, rgba(59,130,246,0.04) 0%, transparent 50%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1100, width: "100%", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: mobile ? 20 : 28 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 14px", borderRadius: 20, marginBottom: 14,
            background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)",
            fontFamily: MONO, fontSize: 10, color: "#3B82F6", fontWeight: 600, letterSpacing: "0.08em",
          }}>
            CURATION · STEP 2
          </div>
          <h1 style={{ fontFamily: FONTS, fontSize: mobile ? 26 : 36, fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Curate <span style={{ color: "#3B82F6" }}>Topics</span>
          </h1>
          <p style={{ fontFamily: BODY, fontSize: mobile ? 12 : 14, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>
            Rename, recolor, merge, split, or star the topics AI discovered.
          </p>
        </div>

        {done ? (
          <div className="fade-up" style={{ textAlign: "center", padding: mobile ? "48px 20px" : "64px 40px" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✨</div>
            <h2 style={{ fontFamily: FONTS, fontSize: mobile ? 24 : 32, fontWeight: 700, color: "#3B82F6", marginBottom: 8 }}>
              Topics Curated
            </h2>
            <p style={{ fontFamily: BODY, fontSize: mobile ? 13 : 15, color: "rgba(255,255,255,0.4)", marginBottom: 6, lineHeight: 1.6 }}>
              {visibleTopics.length} topics{merges > 0 ? `, ${merges} merged` : ""}{splits > 0 ? `, ${splits} split` : ""}{renames > 0 ? `, ${renames} renamed` : ""}{stars > 0 ? `, ${stars} starred` : ""}
            </p>
            <p style={{ fontFamily: BODY, fontSize: 12, color: "rgba(255,255,255,0.2)", marginBottom: 28 }}>
              Your knowledge map now reflects your intent.
            </p>
            <button onClick={onComplete} style={{
              fontFamily: BODY, fontSize: 16, fontWeight: 600, color: "#08080C",
              background: "linear-gradient(135deg, #3B82F6, #2563EB)", border: "none",
              borderRadius: 12, padding: "14px 40px", cursor: "pointer",
              boxShadow: "0 4px 24px rgba(59,130,246,0.25)", transition: "all 0.25s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(59,130,246,0.35)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(59,130,246,0.25)"; }}
            >
              Continue →
            </button>
          </div>
        ) : (
          <>
            {/* Merge mode banner */}
            {merging && (
              <div className="fade-up" style={{
                background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.25)",
                borderRadius: 10, padding: "10px 16px", marginBottom: 16,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontFamily: BODY, fontSize: 13, color: "#A855F7" }}>
                  Select a target topic to merge <strong>{topics.find(t => t.id === merging.fromId)?.name}</strong> into
                  {merging.suggestion && <span style={{ color: "rgba(255,255,255,0.3)" }}> — suggested: {merging.suggestion.suggestedName}</span>}
                </span>
                <button onClick={() => setMerging(null)} style={{
                  fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.3)",
                  background: "none", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 6, padding: "4px 10px", cursor: "pointer",
                }}>Cancel</button>
              </div>
            )}

            {/* Topic grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: mobile ? "1fr" : tablet ? "1fr 1fr" : "1fr 1fr 1fr",
              gap: mobile ? 10 : 14, marginBottom: 24,
            }}>
              {visibleTopics.map((topic, idx) => {
                const isSelected = selectedId === topic.id;
                const isMergeTarget = merging && merging.fromId !== topic.id;
                const sparkData = TOPIC_SPARKLINES[topic.id] || [3, 3, 3, 3, 3, 3];
                const hasSplit = SPLIT_SUGGESTIONS[topic.id];
                const hasMerge = MERGE_SUGGESTIONS.find(m => m.from === topic.id);

                return (
                  <div key={topic.id} style={{
                    background: isSelected ? "rgba(255,255,255,0.05)" : isMergeTarget ? "rgba(168,85,247,0.04)" : "rgba(255,255,255,0.025)",
                    border: `1px solid ${isSelected ? "rgba(59,130,246,0.35)" : isMergeTarget ? "rgba(168,85,247,0.25)" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 14, padding: mobile ? "14px 14px" : "16px 18px",
                    cursor: merging ? (isMergeTarget ? "pointer" : "default") : "pointer",
                    transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                    animation: `topicCardIn 0.4s ease both`,
                    animationDelay: `${idx * 50}ms`,
                  }}
                    onClick={() => {
                      if (merging && isMergeTarget) { executeMerge(topic.id); return; }
                      if (!merging) setSelectedId(isSelected ? null : topic.id);
                    }}
                    onMouseEnter={e => { if (isMergeTarget) e.currentTarget.style.borderColor = "rgba(168,85,247,0.5)"; }}
                    onMouseLeave={e => { if (isMergeTarget) e.currentTarget.style.borderColor = "rgba(168,85,247,0.25)"; }}
                  >
                    {/* Card header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{topic.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {editingId === topic.id ? (
                          <input
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onBlur={commitRename}
                            onKeyDown={e => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setEditingId(null); }}
                            autoFocus
                            style={{
                              fontFamily: BODY, fontSize: 14, fontWeight: 600, color: topic.color,
                              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)",
                              borderRadius: 6, padding: "2px 6px", width: "100%", outline: "none",
                            }}
                            onClick={e => e.stopPropagation()}
                          />
                        ) : (
                          <div style={{ fontFamily: BODY, fontSize: 14, fontWeight: 600, color: topic.color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {topic.name}
                          </div>
                        )}
                        <div style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 1 }}>
                          {topic.count} convos · {(topic.words / 1000).toFixed(0)}k words
                        </div>
                      </div>
                      {/* Star button */}
                      <div
                        onClick={e => { e.stopPropagation(); toggleStar(topic.id); }}
                        style={{
                          cursor: "pointer", fontSize: 16, flexShrink: 0,
                          animation: topic.starred ? "starPop 0.3s ease" : "none",
                          filter: topic.starred ? "none" : "grayscale(1) opacity(0.3)",
                          transition: "filter 0.2s",
                        }}
                      >
                        {topic.starred ? "⭐" : "☆"}
                      </div>
                    </div>

                    {/* Stats row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: isSelected ? 12 : 0 }}>
                      <ConfidenceBadge confidence={topic.confidence} />
                      <MiniSparkline data={sparkData} color={topic.color} />
                      {/* Color dot */}
                      <div style={{ position: "relative", marginLeft: "auto" }}>
                        <div
                          onClick={e => { e.stopPropagation(); setColorPickerId(colorPickerId === topic.id ? null : topic.id); }}
                          style={{
                            width: 14, height: 14, borderRadius: "50%", background: topic.color,
                            cursor: "pointer", border: "2px solid rgba(255,255,255,0.1)", transition: "transform 0.2s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.3)"; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                        />
                        {/* Color picker popup */}
                        {colorPickerId === topic.id && (
                          <div onClick={e => e.stopPropagation()} style={{
                            position: "absolute", top: 22, right: 0, zIndex: 10,
                            background: "rgba(20,20,28,0.95)", border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 10, padding: 8, display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4,
                            boxShadow: "0 8px 32px rgba(0,0,0,0.5)", minWidth: 140,
                          }}>
                            {CURATED_PALETTE.map(c => (
                              <div key={c} onClick={() => changeColor(topic.id, c)} style={{
                                width: 18, height: 18, borderRadius: "50%", background: c, cursor: "pointer",
                                border: c === topic.color ? "2px solid #fff" : "2px solid transparent",
                                transition: "transform 0.15s",
                              }}
                                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.25)"; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expanded actions when selected */}
                    {isSelected && !merging && (
                      <div className="fade-up" style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingTop: 4 }}>
                        <button onClick={e => { e.stopPropagation(); startRename(topic); }} style={{
                          fontFamily: BODY, fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.5)",
                          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 8, padding: "5px 12px", cursor: "pointer", transition: "all 0.2s",
                        }}
                          onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
                          onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                        >Rename</button>
                        {hasMerge && (
                          <button onClick={e => { e.stopPropagation(); startMerge(topic.id); }} style={{
                            fontFamily: BODY, fontSize: 11, fontWeight: 500, color: "#A855F7",
                            background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.2)",
                            borderRadius: 8, padding: "5px 12px", cursor: "pointer", transition: "all 0.2s",
                          }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(168,85,247,0.12)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(168,85,247,0.06)"; }}
                          >Merge →</button>
                        )}
                        {hasSplit && (
                          <button onClick={e => { e.stopPropagation(); executeSplit(topic.id); }} style={{
                            fontFamily: BODY, fontSize: 11, fontWeight: 500, color: "#10B981",
                            background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)",
                            borderRadius: 8, padding: "5px 12px", cursor: "pointer", transition: "all 0.2s",
                          }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(16,185,129,0.12)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(16,185,129,0.06)"; }}
                          >Split</button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom bar */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: mobile ? "14px 0" : "16px 0",
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}>
              <div style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
                {totalChanges > 0 ? `${totalChanges} change${totalChanges > 1 ? "s" : ""} made` : "Click a topic to curate"}
              </div>
              <button onClick={() => setDone(true)} style={{
                fontFamily: BODY, fontSize: 14, fontWeight: 600,
                color: totalChanges > 0 ? "#08080C" : "rgba(255,255,255,0.5)",
                background: totalChanges > 0 ? "linear-gradient(135deg, #3B82F6, #2563EB)" : "rgba(255,255,255,0.06)",
                border: totalChanges > 0 ? "none" : "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10, padding: "10px 28px", cursor: "pointer",
                boxShadow: totalChanges > 0 ? "0 4px 20px rgba(59,130,246,0.25)" : "none",
                transition: "all 0.3s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {totalChanges > 0 ? "Looks Good →" : "Skip — Looks Good →"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TopicCurationPanel;
