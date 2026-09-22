import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  TOPICS, CONNECTIONS, TIMELINE_DATA, MONTHLY_ACTIVITY,
} from '../data/constants';
import { FONTS, BODY, MONO } from '../styles/base';
import { C, alpha, white, black } from '../styles/tokens';

// ═══════════════════════════════════════════════════════════════
// REWIND MODE — Animated Knowledge Graph Timeline
// ═══════════════════════════════════════════════════════════════
const RewindMode = ({ onClose, mobile }) => {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [hovered, setHovered] = useState(null);
  const timerRef = useRef(null);
  const totalSteps = MONTHLY_ACTIVITY.length;

  // Pre-compute topic positions in radial layout
  const positions = useMemo(() => TOPICS.map((t, i) => {
    const angle = (i / TOPICS.length) * Math.PI * 2 - Math.PI / 2;
    const r = mobile ? 32 : 36;
    return { id: t.id, x: 50 + r * Math.cos(angle), y: 50 + r * Math.sin(angle) };
  }), [mobile]);

  // Parse month string to end-of-month Date
  const monthToDate = useCallback((monthStr) => {
    const M = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
    const [mon, yr] = monthStr.split(" ");
    return new Date(2000 + parseInt(yr), M[mon] + 1, 0);
  }, []);

  // Compute graph state at current step
  const graphState = useMemo(() => {
    const endDate = monthToDate(MONTHLY_ACTIVITY[step].month);
    const counts = {};
    let events = 0;
    Object.entries(TIMELINE_DATA).forEach(([tid, evts]) => {
      evts.forEach(e => {
        if (new Date(e.date) <= endDate) { counts[tid] = (counts[tid] || 0) + 1; events++; }
      });
    });
    const visible = new Set(Object.keys(counts));
    const conns = CONNECTIONS.filter(c => visible.has(c.from) && visible.has(c.to));
    let convos = 0;
    for (let i = 0; i <= step; i++) convos += MONTHLY_ACTIVITY[i].gpt + MONTHLY_ACTIVITY[i].claude;
    const phases = [
      { max: 6, name: "Genesis", color: C.blue, desc: "First explorations" },
      { max: 12, name: "Exploration", color: C.green, desc: "Topics multiply" },
      { max: 18, name: "Connection", color: C.amber, desc: "Links forming" },
      { max: 24, name: "Deepening", color: C.red, desc: "Core topics grow" },
      { max: 30, name: "Synthesis", color: C.purple, desc: "Dense network" },
      { max: 39, name: "Mastery", color: C.pink, desc: "Expertise zones" },
    ];
    const phase = phases.find(p => step < p.max) || phases[phases.length - 1];
    return { counts, visible, conns, convos, events, phase, month: MONTHLY_ACTIVITY[step].month };
  }, [step, monthToDate]);

  const maxEvts = useMemo(() => Math.max(...Object.values(TIMELINE_DATA).map(e => e.length)), []);

  // Playback timer
  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setStep(prev => {
          if (prev >= totalSteps - 1) { setPlaying(false); return prev; }
          return prev + 1;
        });
      }, 2000 / speed);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, speed, totalSteps]);

  // Auto-play on mount
  useEffect(() => { const t = setTimeout(() => setPlaying(true), 600); return () => clearTimeout(t); }, []);

  const togglePlay = () => {
    if (step >= totalSteps - 1) { setStep(0); setPlaying(true); }
    else setPlaying(!playing);
  };

  const ht = hovered ? TOPICS.find(t => t.id === hovered) : null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9990,
      background: alpha(C.bg0, 0.97), backdropFilter: "blur(12px)",
      display: "flex", flexDirection: "column",
      animation: "rewindFadeIn 0.4s ease both",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: mobile ? "16px 16px 8px" : "20px 32px 8px",
      }}>
        <div>
          <h2 style={{ fontFamily: FONTS, fontSize: mobile ? 20 : 26, color: C.white, fontWeight: 700, margin: 0 }}>
            Rewind Mode
          </h2>
          <div style={{ fontFamily: BODY, fontSize: mobile ? 10 : 12, color: white(0.3), marginTop: 2 }}>
            Watch your knowledge graph build itself
          </div>
        </div>
        <button onClick={onClose} style={{
          background: white(0.06), border: `1px solid ${white(0.1)}`,
          borderRadius: 8, padding: "8px 14px", cursor: "pointer",
          fontFamily: BODY, fontSize: 12, color: white(0.5),
        }}>
          ✕ Close
        </button>
      </div>

      {/* Phase indicator */}
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        <span style={{
          fontFamily: MONO, fontSize: mobile ? 10 : 12,
          color: graphState.phase.color, fontWeight: 600,
          padding: "4px 14px", borderRadius: 20,
          background: `${graphState.phase.color}12`,
          border: `1px solid ${graphState.phase.color}25`,
        }}>
          {graphState.phase.name} — {graphState.phase.desc}
        </span>
      </div>

      {/* Graph canvas */}
      <div style={{ flex: 1, position: "relative", margin: mobile ? "8px 8px" : "8px 32px", overflow: "hidden" }}>
        {/* SVG connections */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          {graphState.conns.map((conn, i) => {
            const from = positions.find(p => p.id === conn.from);
            const to = positions.find(p => p.id === conn.to);
            if (!from || !to) return null;
            return (
              <line key={i}
                x1={`${from.x}%`} y1={`${from.y}%`}
                x2={`${to.x}%`} y2={`${to.y}%`}
                stroke={graphState.phase.color}
                strokeOpacity={0.12 + conn.strength * 0.22}
                strokeWidth={1 + conn.strength * 1.5}
                style={{ transition: "all 0.8s ease" }}
              />
            );
          })}
        </svg>

        {/* Topic nodes */}
        {TOPICS.map((topic, i) => {
          const pos = positions[i];
          const count = graphState.counts[topic.id] || 0;
          const isVisible = graphState.visible.has(topic.id);
          const size = isVisible ? (mobile ? 24 : 32) + (count / maxEvts) * (mobile ? 36 : 52) : 0;
          const isHovered = hovered === topic.id;
          return (
            <div key={topic.id}
              onMouseEnter={() => !playing && setHovered(topic.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => { if (!playing) setHovered(hovered === topic.id ? null : topic.id); }}
              style={{
                position: "absolute",
                left: `${pos.x}%`, top: `${pos.y}%`,
                transform: `translate(-50%, -50%) scale(${isHovered ? 1.15 : 1})`,
                width: size, height: size, borderRadius: "50%",
                background: `radial-gradient(circle at 35% 35%, ${topic.color}CC, ${topic.color}60)`,
                border: `2px solid ${isHovered ? topic.color : `${topic.color}40`}`,
                opacity: isVisible ? 1 : 0,
                transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)",
                cursor: playing ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: isVisible ? `0 0 ${8 + count * 2}px ${topic.color}25` : "none",
              }}
            >
              {isVisible && size > (mobile ? 30 : 40) && (
                <span style={{ fontSize: mobile ? 12 : 16, pointerEvents: "none" }}>{topic.icon}</span>
              )}
              {isVisible && (isHovered || size > (mobile ? 50 : 60)) && (
                <div style={{
                  position: "absolute", top: "100%", marginTop: 4,
                  fontFamily: BODY, fontSize: mobile ? 8 : 10, color: topic.color,
                  whiteSpace: "nowrap", fontWeight: 600, pointerEvents: "none",
                  textShadow: `0 1px 4px ${black(0.8)}`,
                }}>
                  {topic.name}
                </div>
              )}
            </div>
          );
        })}

        {/* Hovered topic detail (during pause) */}
        {ht && !playing && (
          <div style={{
            position: "absolute", bottom: mobile ? 8 : 16, left: "50%", transform: "translateX(-50%)",
            background: alpha(C.ink, 0.95), border: `1px solid ${ht.color}30`,
            borderRadius: 10, padding: mobile ? "10px 14px" : "12px 18px",
            minWidth: mobile ? 200 : 240, textAlign: "center",
            animation: "fadeUp 0.2s ease both",
          }}>
            <div style={{ fontFamily: BODY, fontSize: mobile ? 12 : 14, color: C.white, fontWeight: 600 }}>{ht.icon} {ht.name}</div>
            <div style={{ fontFamily: MONO, fontSize: mobile ? 9 : 10, color: white(0.3), marginTop: 4 }}>
              {graphState.counts[ht.id] || 0} events by {graphState.month} · Depth: {ht.depth}
            </div>
          </div>
        )}
      </div>

      {/* Running stats */}
      <div style={{
        display: "flex", justifyContent: "center", gap: mobile ? 16 : 32,
        padding: mobile ? "8px 16px" : "10px 32px",
      }}>
        {[
          { label: "Conversations", value: graphState.convos.toLocaleString() },
          { label: "Active Topics", value: graphState.visible.size },
          { label: "Connections", value: graphState.conns.length },
          { label: "Date", value: graphState.month },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: MONO, fontSize: mobile ? 14 : 18, color: graphState.phase.color, fontWeight: 700 }}>{s.value}</div>
            <div style={{ fontFamily: BODY, fontSize: mobile ? 8 : 10, color: white(0.25), marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{
        display: "flex", alignItems: "center", gap: mobile ? 10 : 16,
        padding: mobile ? "12px 16px 20px" : "12px 32px 24px",
      }}>
        <button onClick={togglePlay} style={{
          width: mobile ? 36 : 40, height: mobile ? 36 : 40, borderRadius: "50%",
          background: graphState.phase.color, border: "none",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: mobile ? 14 : 16, color: C.white, flexShrink: 0,
          boxShadow: `0 0 16px ${graphState.phase.color}40`,
        }}>
          {playing ? "⏸" : step >= totalSteps - 1 ? "⟳" : "▶"}
        </button>
        <div style={{ flex: 1 }}>
          <input
            type="range" min={0} max={totalSteps - 1} value={step}
            onChange={e => { setStep(parseInt(e.target.value)); setPlaying(false); }}
            className="rewind-slider"
            style={{
              width: "100%", height: 6,
              WebkitAppearance: "none", appearance: "none",
              background: `linear-gradient(90deg, ${graphState.phase.color} ${(step / (totalSteps - 1)) * 100}%, ${white(0.08)} ${(step / (totalSteps - 1)) * 100}%)`,
              borderRadius: 3, outline: "none", cursor: "pointer",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          {[1, 2, 5].map(s => (
            <button key={s} onClick={() => setSpeed(s)} style={{
              fontFamily: MONO, fontSize: mobile ? 9 : 10, fontWeight: speed === s ? 700 : 400,
              color: speed === s ? graphState.phase.color : white(0.3),
              background: speed === s ? `${graphState.phase.color}15` : "transparent",
              border: `1px solid ${speed === s ? `${graphState.phase.color}30` : white(0.08)}`,
              borderRadius: 6, padding: mobile ? "4px 8px" : "5px 10px",
              cursor: "pointer", transition: "all 0.2s",
            }}>
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RewindMode;
