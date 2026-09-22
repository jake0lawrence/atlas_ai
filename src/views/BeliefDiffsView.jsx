import { useState } from "react";
import {
  BELIEF_DIFFS, ARCHAEOLOGY_CHAINS,
} from '../data/constants';
import { FONTS, BODY, MONO } from '../styles/base';

// ─── BELIEF DIFFS VIEW ──────────────────────────────────────

const BeliefDiffsView = ({ mobile, onBack, onArchaeologyClick }) => {
  const [selectedDiff, setSelectedDiff] = useState(0);
  const diff = BELIEF_DIFFS[selectedDiff];

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
            Belief Diffs
          </h2>
          <p style={{ fontFamily: BODY, fontSize: mobile ? 10 : 12, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>
            How your thinking evolved — rendered like a code diff
          </p>
        </div>
      </div>

      {/* Topic selector pills */}
      <div style={{
        display: "flex", gap: 8, marginBottom: mobile ? 20 : 28,
        overflowX: "auto", WebkitOverflowScrolling: "touch",
        paddingBottom: 4,
      }}>
        {BELIEF_DIFFS.map((d, i) => (
          <button key={d.id} onClick={() => setSelectedDiff(i)} style={{
            fontFamily: BODY, fontSize: mobile ? 11 : 12, fontWeight: selectedDiff === i ? 600 : 400,
            color: selectedDiff === i ? "#08080C" : "rgba(255,255,255,0.5)",
            background: selectedDiff === i ? d.color : "rgba(255,255,255,0.04)",
            border: `1px solid ${selectedDiff === i ? d.color : "rgba(255,255,255,0.08)"}`,
            borderRadius: 20, padding: mobile ? "7px 14px" : "8px 18px",
            cursor: "pointer", transition: "all 0.25s", whiteSpace: "nowrap",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: 14 }}>{d.icon}</span>
            {d.topic}
          </button>
        ))}
      </div>

      {/* Time range header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: mobile ? 12 : 24,
        marginBottom: mobile ? 16 : 24,
        padding: mobile ? "12px 14px" : "14px 20px",
        background: "rgba(255,255,255,0.02)", borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: MONO, fontSize: mobile ? 9 : 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>Earlier</div>
          <div style={{ fontFamily: FONTS, fontSize: mobile ? 14 : 16, color: "rgba(239,68,68,0.8)", fontWeight: 600 }}>{diff.earlier.label}</div>
        </div>
        <div style={{ fontFamily: BODY, fontSize: 18, color: "rgba(255,255,255,0.15)" }}>→</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: MONO, fontSize: mobile ? 9 : 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>Current</div>
          <div style={{ fontFamily: FONTS, fontSize: mobile ? 14 : 16, color: "rgba(16,185,129,0.8)", fontWeight: 600 }}>{diff.current.label}</div>
        </div>
      </div>

      {/* Diff stats bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: mobile ? 12 : 20,
        marginBottom: mobile ? 12 : 16,
        padding: mobile ? "8px 12px" : "8px 16px",
        background: "rgba(255,255,255,0.02)", borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.05)",
        fontFamily: MONO, fontSize: mobile ? 10 : 11,
      }}>
        <span style={{ color: diff.color, fontWeight: 600 }}>{diff.icon} {diff.topic}</span>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
        <span style={{ color: "rgba(239,68,68,0.7)" }}>−{diff.lines.filter(l => l.type === "removed").length} removed</span>
        <span style={{ color: "rgba(16,185,129,0.7)" }}>+{diff.lines.filter(l => l.type === "added").length} added</span>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>{diff.lines.filter(l => l.type === "context").length} unchanged</span>
      </div>

      {/* Diff view */}
      <div style={{
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.08)",
        overflow: "hidden",
        background: "rgba(255,255,255,0.015)",
      }}>
        {/* Column headers */}
        <div style={{
          display: mobile ? "none" : "grid", gridTemplateColumns: "1fr 1fr",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{
            padding: "10px 20px",
            fontFamily: MONO, fontSize: 10, fontWeight: 500,
            color: "rgba(239,68,68,0.5)", textTransform: "uppercase", letterSpacing: "0.1em",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(239,68,68,0.02)",
          }}>
            {diff.earlier.label}
          </div>
          <div style={{
            padding: "10px 20px",
            fontFamily: MONO, fontSize: 10, fontWeight: 500,
            color: "rgba(16,185,129,0.5)", textTransform: "uppercase", letterSpacing: "0.1em",
            background: "rgba(16,185,129,0.02)",
          }}>
            {diff.current.label}
          </div>
        </div>

        {/* Diff lines — two-column on desktop, stacked on mobile */}
        {mobile ? (
          /* Mobile: unified diff view */
          <div>
            {diff.lines.map((line, i) => {
              const bgMap = {
                removed: "rgba(239,68,68,0.06)",
                added: "rgba(16,185,129,0.06)",
                context: "transparent",
              };
              const prefixMap = { removed: "−", added: "+", context: " " };
              const colorMap = {
                removed: "rgba(239,68,68,0.7)",
                added: "rgba(16,185,129,0.7)",
                context: "rgba(255,255,255,0.15)",
              };
              return (
                <div key={i} style={{
                  display: "flex", gap: 8, alignItems: "baseline",
                  padding: "10px 14px",
                  background: bgMap[line.type],
                  borderBottom: i < diff.lines.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none",
                }}>
                  <span style={{
                    fontFamily: MONO, fontSize: 12, color: colorMap[line.type],
                    width: 14, flexShrink: 0, textAlign: "center", fontWeight: 600,
                  }}>{prefixMap[line.type]}</span>
                  <span style={{
                    fontFamily: FONTS, fontSize: 13, lineHeight: 1.5,
                    color: line.type === "context" ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.75)",
                    textDecoration: line.type === "removed" ? "line-through" : "none",
                    textDecorationColor: "rgba(239,68,68,0.4)",
                  }}>{line.text}</span>
                </div>
              );
            })}
          </div>
        ) : (
          /* Desktop: two-column diff */
          <div>
            {(() => {
              const removed = diff.lines.filter(l => l.type === "removed");
              const context = diff.lines.filter(l => l.type === "context");
              const added = diff.lines.filter(l => l.type === "added");
              const rows = [];

              // Removed lines — left side only
              removed.forEach((line, i) => {
                rows.push(
                  <div key={`r-${i}`} style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                    <div style={{
                      padding: "10px 20px", display: "flex", gap: 10, alignItems: "baseline",
                      background: "rgba(239,68,68,0.05)",
                      borderRight: "1px solid rgba(255,255,255,0.06)",
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                    }}>
                      <span style={{ fontFamily: MONO, fontSize: 11, color: "rgba(239,68,68,0.5)", width: 14, flexShrink: 0, textAlign: "center", fontWeight: 600 }}>−</span>
                      <span style={{
                        fontFamily: FONTS, fontSize: 14, lineHeight: 1.5,
                        color: "rgba(255,255,255,0.65)",
                        textDecoration: "line-through",
                        textDecorationColor: "rgba(239,68,68,0.4)",
                      }}>{line.text}</span>
                    </div>
                    <div style={{
                      padding: "10px 20px",
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                      background: "rgba(239,68,68,0.02)",
                    }} />
                  </div>
                );
              });

              // Context lines — both sides
              context.forEach((line, i) => {
                rows.push(
                  <div key={`c-${i}`} style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                    <div style={{
                      padding: "10px 20px", display: "flex", gap: 10, alignItems: "baseline",
                      borderRight: "1px solid rgba(255,255,255,0.06)",
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                    }}>
                      <span style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.12)", width: 14, flexShrink: 0, textAlign: "center" }}> </span>
                      <span style={{ fontFamily: FONTS, fontSize: 14, lineHeight: 1.5, color: "rgba(255,255,255,0.3)" }}>{line.text}</span>
                    </div>
                    <div style={{
                      padding: "10px 20px", display: "flex", gap: 10, alignItems: "baseline",
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                    }}>
                      <span style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.12)", width: 14, flexShrink: 0, textAlign: "center" }}> </span>
                      <span style={{ fontFamily: FONTS, fontSize: 14, lineHeight: 1.5, color: "rgba(255,255,255,0.3)" }}>{line.text}</span>
                    </div>
                  </div>
                );
              });

              // Added lines — right side only
              added.forEach((line, i) => {
                rows.push(
                  <div key={`a-${i}`} style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                    <div style={{
                      padding: "10px 20px",
                      borderRight: "1px solid rgba(255,255,255,0.06)",
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                      background: "rgba(16,185,129,0.02)",
                    }} />
                    <div style={{
                      padding: "10px 20px", display: "flex", gap: 10, alignItems: "baseline",
                      background: "rgba(16,185,129,0.05)",
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                    }}>
                      <span style={{ fontFamily: MONO, fontSize: 11, color: "rgba(16,185,129,0.5)", width: 14, flexShrink: 0, textAlign: "center", fontWeight: 600 }}>+</span>
                      <span style={{
                        fontFamily: FONTS, fontSize: 14, lineHeight: 1.5,
                        color: "rgba(255,255,255,0.75)",
                      }}>{line.text}</span>
                    </div>
                  </div>
                );
              });

              return rows;
            })()}
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{
        display: "flex", gap: mobile ? 14 : 24, justifyContent: "center",
        marginTop: mobile ? 16 : 20,
        padding: "12px 0",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }} />
          <span style={{ fontFamily: BODY, fontSize: mobile ? 10 : 11, color: "rgba(255,255,255,0.3)" }}>Abandoned belief</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }} />
          <span style={{ fontFamily: BODY, fontSize: mobile ? 10 : 11, color: "rgba(255,255,255,0.3)" }}>New position</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }} />
          <span style={{ fontFamily: BODY, fontSize: mobile ? 10 : 11, color: "rgba(255,255,255,0.3)" }}>Unchanged</span>
        </div>
      </div>

      {/* Decision Archaeology link */}
      {(() => {
        const relatedChains = Object.values(ARCHAEOLOGY_CHAINS).filter(c => {
          const diffTopicLower = diff.topic.toLowerCase();
          return diffTopicLower.includes("courtcollect") || diffTopicLower.includes("architecture")
            ? c.topicId === "courtcollect"
            : diffTopicLower.includes("ai") || diffTopicLower.includes("tool")
              ? c.topicId === "webdev"
              : diffTopicLower.includes("automation")
                ? c.topicId === "courtcollect"
                : false;
        });
        if (relatedChains.length === 0) return null;
        return (
          <div style={{
            marginTop: mobile ? 20 : 24,
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12, padding: mobile ? "14px 14px" : "16px 20px",
          }}>
            <div style={{ fontFamily: BODY, fontSize: mobile ? 10 : 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 10 }}>
              🔍 Trace the decisions behind this evolution
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {relatedChains.map(c => (
                <button key={c.id} onClick={() => onArchaeologyClick && onArchaeologyClick(c.id)} style={{
                  background: `${c.color}08`, border: `1px solid ${c.color}18`,
                  borderRadius: 8, padding: mobile ? "10px 12px" : "10px 16px",
                  cursor: "pointer", transition: "all 0.25s", textAlign: "left",
                  display: "flex", alignItems: "center", gap: 8,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${c.color}35`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${c.color}18`; }}
                >
                  <span style={{ fontSize: 14 }}>{c.icon}</span>
                  <span style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: "rgba(255,255,255,0.5)", flex: 1 }}>{c.title}</span>
                  <span style={{ fontFamily: BODY, fontSize: mobile ? 9 : 10, color: c.color, opacity: 0.6 }}>Trace →</span>
                </button>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default BeliefDiffsView;
