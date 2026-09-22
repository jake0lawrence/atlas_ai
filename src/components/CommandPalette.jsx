import { useState, useEffect, useRef } from "react";
import {
  TOPICS,
} from '../data/constants';
import { BODY, MONO } from '../styles/base';

// ─── COMMAND PALETTE ─────────────────────────────────────────
const CommandPalette = ({ open, onClose, onNavigate, onTopicClick, mobile }) => {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);

  const views = [
    { type: "view", id: "dashboard", label: "Overview", icon: "◈", sub: "Main dashboard" },
    { type: "view", id: "connections", label: "Connections", icon: "◎", sub: "Knowledge graph" },
    { type: "view", id: "evolution", label: "Evolution", icon: "◇", sub: "Decisions & milestones" },
    { type: "view", id: "beliefDiffs", label: "Belief Diffs", icon: "⇄", sub: "How your thinking evolved" },
    { type: "view", id: "digest", label: "Thinking Digest", icon: "📅", sub: "Monthly knowledge evolution" },
    { type: "view", id: "search", label: "Search", icon: "⌕", sub: "Search conversations" },
    { type: "view", id: "export", label: "Export", icon: "↗", sub: "Export & share" },
    { type: "view", id: "rewind", label: "Rewind Mode", icon: "⏪", sub: "Animated knowledge graph timeline" },
  ];
  const topics = TOPICS.map(t => ({ type: "topic", id: t.id, label: t.name, icon: t.icon, sub: `${t.count} conversations`, color: t.color, topic: t }));
  const all = [...views, ...topics];

  const q = query.toLowerCase().trim();
  const filtered = q ? all.filter(item => item.label.toLowerCase().includes(q) || (item.sub && item.sub.toLowerCase().includes(q))) : all;

  useEffect(() => {
    if (open) { setQuery(""); setSelectedIdx(0); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  useEffect(() => { setSelectedIdx(0); }, [query]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(prev => Math.min(prev + 1, filtered.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx(prev => Math.max(prev - 1, 0)); }
      else if (e.key === "Enter" && filtered.length > 0) { e.preventDefault(); handleSelect(filtered[selectedIdx]); }
      else if (e.key === "Escape") { e.preventDefault(); onClose(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  const handleSelect = (item) => {
    if (item.type === "view") onNavigate(item.id);
    else if (item.type === "topic") onTopicClick(item.topic);
    onClose();
  };

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Command palette" style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: mobile ? 60 : 120 }} onClick={onClose}>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />
      <div onClick={e => e.stopPropagation()} style={{
        position: "relative", width: mobile ? "92%" : 480, maxHeight: "60vh",
        background: "#131318", border: "1px solid rgba(251,191,36,0.15)",
        borderRadius: 14, boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
        overflow: "hidden", animation: "fadeUp 0.15s ease both",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: mobile ? "12px 14px" : "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontFamily: MONO, fontSize: 13, color: "rgba(251,191,36,0.5)" }}>⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Search commands"
            placeholder="Jump to topic, view, or action..."
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              fontFamily: BODY, fontSize: mobile ? 14 : 15, color: "#fff",
            }}
          />
          <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.2)", padding: "3px 7px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>ESC</span>
        </div>
        <div style={{ maxHeight: "calc(60vh - 54px)", overflowY: "auto" }}>
          {filtered.length === 0 && (
            <div style={{ padding: "24px 18px", textAlign: "center", fontFamily: BODY, fontSize: 13, color: "rgba(255,255,255,0.25)" }}>No results found</div>
          )}
          {filtered.map((item, i) => (
            <div
              key={`${item.type}-${item.id}`}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setSelectedIdx(i)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: mobile ? "10px 14px" : "10px 18px",
                cursor: "pointer", transition: "background 0.1s",
                background: i === selectedIdx ? "rgba(251,191,36,0.08)" : "transparent",
                borderLeft: i === selectedIdx ? "2px solid #FBBF24" : "2px solid transparent",
              }}
            >
              <span style={{ fontSize: 16, width: 24, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: BODY, fontSize: 13, fontWeight: 500, color: i === selectedIdx ? "#fff" : "rgba(255,255,255,0.7)" }}>{item.label}</div>
                <div style={{ fontFamily: BODY, fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 1 }}>{item.sub}</div>
              </div>
              <span style={{
                fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.2)",
                padding: "2px 7px", borderRadius: 4,
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                textTransform: "capitalize",
              }}>{item.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
