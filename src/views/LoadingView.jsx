import { useState, useEffect, useRef } from "react";
import {
  LOAD_PIPELINE, PHASE_META,
} from '../data/constants';
import { FONTS, BODY, MONO, CSS } from '../styles/base';
import { C, alpha, white } from '../styles/tokens';
import { row, stackTight } from '../styles/shared';

// ═══════════════════════════════════════════════════════════════
// ENHANCED LOADING VIEW
// ═══════════════════════════════════════════════════════════════
const LoadingView = ({ onComplete, mobile }) => {
  const [stageIdx, setStageIdx] = useState(0);
  const [discoveries, setDiscoveries] = useState([]);
  const [showReveal, setShowReveal] = useState(false);
  const totalConvos = 3847;
  const timersRef = useRef([]);

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const timings = [
      300, 900, 1600, 2300, 2800, 3400, 4100, 4800, 5500,
      6200, 6800, 7400, 8000, 8500, 9000, 9600, 10100, 10400,
    ];
    timings.forEach((t, i) => {
      timersRef.current.push(setTimeout(() => {
        setStageIdx(i);
        if (LOAD_PIPELINE[i].discovery) {
          setDiscoveries(prev => [...prev, LOAD_PIPELINE[i].discovery]);
        }
      }, t));
    });
    timersRef.current.push(setTimeout(() => setShowReveal(true), 10800));
    timersRef.current.push(setTimeout(() => onComplete(), 12000));
  }, [onComplete]);

  const stage = LOAD_PIPELINE[stageIdx] || LOAD_PIPELINE[LOAD_PIPELINE.length - 1];
  const phaseMeta = PHASE_META[stage.phase];
  const convoCount = Math.floor((stage.pct / 100) * totalConvos);

  return (
    <div style={{ minHeight: "100vh", background: C.bg0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: mobile ? "24px 16px" : "32px", position: "relative", overflow: "hidden" }}>
      <style>{CSS}</style>

      {/* Ambient glow that shifts with phase */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(ellipse at 50% 40%, ${phaseMeta.color}08 0%, transparent 50%)`, transition: "background 1s ease", pointerEvents: "none" }} />

      <div style={{ maxWidth: 560, width: "100%", position: "relative", zIndex: 1 }}>
        {/* Brain + phase indicator */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: mobile ? 48 : 56, marginBottom: 16, animation: "glow 2.5s infinite ease-in-out" }}>🧠</div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 14px", borderRadius: 20,
            background: `${phaseMeta.color}12`, border: `1px solid ${phaseMeta.color}25`,
            fontFamily: MONO, fontSize: 10, color: phaseMeta.color, fontWeight: 600,
            letterSpacing: "0.08em", transition: "all 0.4s",
          }}>
            {phaseMeta.icon} {phaseMeta.label}
          </div>
        </div>

        {/* Status message */}
        <div style={{ textAlign: "center", minHeight: 56, marginBottom: 24 }}>
          <div style={{ fontFamily: FONTS, fontSize: mobile ? 18 : 22, color: C.white, marginBottom: 6, transition: "all 0.3s" }}>
            {stage.msg}
          </div>
          {stage.detail && (
            <div key={stageIdx} className="fade-up" style={{ fontFamily: BODY, fontSize: mobile ? 11 : 13, color: white(0.3), lineHeight: 1.5 }}>
              {stage.detail}
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ width: "100%", height: 5, background: white(0.04), borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              width: `${stage.pct}%`, height: "100%",
              background: `linear-gradient(90deg, ${phaseMeta.color}CC, ${phaseMeta.color})`,
              borderRadius: 3, transition: "width 0.6s cubic-bezier(0.16,1,0.3,1), background 0.5s ease",
              boxShadow: `0 0 16px ${phaseMeta.color}40`,
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontFamily: MONO, fontSize: 10, color: white(0.15) }}>
              {convoCount.toLocaleString()} / {totalConvos.toLocaleString()} conversations
            </span>
            <span style={{ fontFamily: MONO, fontSize: 10, color: phaseMeta.color + "80" }}>
              {stage.pct}%
            </span>
          </div>
        </div>

        {/* Phase progress dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 4, margin: "20px 0 28px" }}>
          {Object.entries(PHASE_META).map(([key, meta]) => {
            const phaseOrder = ["parse", "normalize", "enrich", "connect", "build"];
            const currentPhaseIdx = phaseOrder.indexOf(stage.phase);
            const thisIdx = phaseOrder.indexOf(key);
            const isActive = thisIdx === currentPhaseIdx;
            const isDone = thisIdx < currentPhaseIdx;
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: isActive ? 24 : 8, height: 8, borderRadius: 4,
                  background: isDone ? meta.color : isActive ? meta.color : white(0.06),
                  opacity: isDone ? 0.5 : 1,
                  transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                  boxShadow: isActive ? `0 0 8px ${meta.color}40` : "none",
                }} />
              </div>
            );
          })}
        </div>

        {/* Discovery feed */}
        {discoveries.length > 0 && (
          <div style={{
            background: white(0.02), border: `1px solid ${white(0.05)}`,
            borderRadius: 12, padding: mobile ? "14px 16px" : "16px 20px",
          }}>
            <div style={{ fontFamily: BODY, fontSize: 10, color: white(0.2), textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
              Discovered Topics
            </div>
            <div style={stackTight}>
              {discoveries.map((d, i) => (
                <div key={i} className="slide-in" style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 12px", borderRadius: 8,
                  background: white(0.02),
                  animationDelay: `${i * 50}ms`,
                }}>
                  <div style={row}>
                    <span style={{ fontSize: 16 }}>{d.icon}</span>
                    <span style={{ fontFamily: BODY, fontSize: 13, color: white(0.6), fontWeight: 500 }}>{d.name}</span>
                  </div>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: alpha(C.gold, 0.4) }}>{d.count} convos</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reveal animation */}
        {showReveal && (
          <div className="fade-up" style={{ textAlign: "center", marginTop: 28 }}>
            <div style={{ fontFamily: FONTS, fontSize: mobile ? 20 : 24, color: C.gold, fontWeight: 700 }}>
              Your atlas is ready.
            </div>
            <div style={{
              fontFamily: BODY, fontSize: 12, color: white(0.25), marginTop: 6,
              background: `linear-gradient(90deg, ${alpha(C.gold, 0)} 0%, ${alpha(C.gold, 0.08)} 50%, ${alpha(C.gold, 0)} 100%)`,
              backgroundSize: "200% 100%", animation: "shimmer 2s infinite linear",
              padding: "6px 0", borderRadius: 4,
            }}>
              Entering your knowledge map...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingView;
