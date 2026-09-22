import { useState, useEffect, useRef } from "react";
import { LOAD_PIPELINE, PHASE_META } from '../data/constants';
import { CSS } from '../styles/base';
import { C, alpha, white, FONTS, BODY, MONO, SPACE, TYPE } from '../styles/tokens';

// The pipeline as the story of what Atlas does: five named stages, each
// showing its state (done / running / waiting) and what it found. The step
// log lives inside the running stage; the topics discovered while enriching
// land as chips under that stage. V7_PLAN.md row 3.

const PHASES = ["parse", "normalize", "enrich", "connect", "build"];
const BLURB = {
  parse: "Read both exports",
  normalize: "One message format across platforms",
  enrich: "Topics, entities and decisions",
  connect: "Connections, insights and the timeline",
  build: "Index and render the atlas",
};
const TIMINGS = [300, 900, 1600, 2300, 2800, 3400, 4100, 4800, 5500, 6200, 6800, 7400, 8000, 8500, 9000, 9600, 10100, 10400];
const REVEAL_AT = 10800;
const DONE_AT = 12000;
const SKIP_AFTER = 1500;
const TOTAL_CONVOS = 3847;

const LoadingView = ({ onComplete, mobile }) => {
  const [stageIdx, setStageIdx] = useState(0);
  const [discoveries, setDiscoveries] = useState([]);
  const [showReveal, setShowReveal] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  const timersRef = useRef([]);

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  useEffect(() => {
    TIMINGS.forEach((t, i) => {
      timersRef.current.push(setTimeout(() => {
        setStageIdx(i);
        if (LOAD_PIPELINE[i].discovery) setDiscoveries(prev => [...prev, LOAD_PIPELINE[i].discovery]);
      }, t));
    });
    timersRef.current.push(setTimeout(() => setCanSkip(true), SKIP_AFTER));
    timersRef.current.push(setTimeout(() => setShowReveal(true), REVEAL_AT));
    timersRef.current.push(setTimeout(() => onComplete(), DONE_AT));
  }, [onComplete]);

  const step = LOAD_PIPELINE[stageIdx] || LOAD_PIPELINE[LOAD_PIPELINE.length - 1];
  const phaseIdx = PHASES.indexOf(step.phase);
  const accent = PHASE_META[step.phase].color;
  const convoCount = Math.floor((step.pct / 100) * TOTAL_CONVOS);

  // The last detail each finished phase produced is its one-line summary.
  const summaryOf = (phase) => {
    const details = LOAD_PIPELINE.filter(s => s.phase === phase && s.detail).map(s => s.detail);
    return details[details.length - 1] || BLURB[phase];
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: mobile ? `${SPACE.xl}px ${SPACE.lg}px` : SPACE.xxl, position: "relative", overflow: "hidden" }}>
      <style>{CSS}</style>
      <div aria-hidden style={{ position: "fixed", inset: 0, background: `radial-gradient(ellipse at 50% 30%, ${accent}0A 0%, transparent 55%)`, transition: "background 1s ease", pointerEvents: "none" }} />

      <main aria-live="polite" style={{ maxWidth: 600, width: "100%", position: "relative", zIndex: 1 }}>
        {/* Header: what is happening overall */}
        <div style={{ textAlign: "center", marginBottom: SPACE.xl }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: SPACE.sm, marginBottom: SPACE.md }}>
            <span style={{ fontSize: 24, lineHeight: 1 }}>🧠</span>
            <span style={{ fontFamily: FONTS, fontSize: TYPE.lg, fontWeight: 700, color: C.white }}>Atlas</span>
          </div>
          {showReveal ? (
            <div className="fade-up">
              <h1 style={{ fontFamily: FONTS, fontSize: mobile ? TYPE.xl : TYPE.xxl, fontWeight: 700, color: C.gold, lineHeight: 1.15 }}>Your atlas is ready.</h1>
              <p style={{ fontFamily: BODY, fontSize: TYPE.base, color: white(0.4), marginTop: SPACE.sm }}>Opening your knowledge map.</p>
            </div>
          ) : (
            <>
              <h1 style={{ fontFamily: FONTS, fontSize: mobile ? TYPE.xl : TYPE.xxl, fontWeight: 700, color: C.white, lineHeight: 1.15 }}>Building your atlas</h1>
              <p style={{ fontFamily: BODY, fontSize: TYPE.base, color: white(0.4), marginTop: SPACE.sm }}>Five passes over {TOTAL_CONVOS.toLocaleString()} conversations, all in your browser.</p>
            </>
          )}
        </div>

        {/* Overall progress */}
        <div role="progressbar" aria-valuenow={step.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Overall progress" style={{ marginBottom: SPACE.xl }}>
          <div style={{ width: "100%", height: 6, background: white(0.05), borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${step.pct}%`, height: "100%", background: accent, borderRadius: 3, transition: "width 0.6s cubic-bezier(0.16,1,0.3,1), background 0.5s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: SPACE.sm }}>
            <span style={{ fontFamily: MONO, fontSize: TYPE.xs, color: white(0.3) }}>{convoCount.toLocaleString()} / {TOTAL_CONVOS.toLocaleString()} conversations</span>
            <span style={{ fontFamily: MONO, fontSize: TYPE.xs, color: accent }}>{step.pct}%</span>
          </div>
        </div>

        {/* The five stages */}
        <ol aria-label="Stages" style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: SPACE.sm }}>
          {PHASES.map((phase, i) => {
            const meta = PHASE_META[phase];
            const state = i < phaseIdx || showReveal ? "done" : i === phaseIdx ? "running" : "waiting";
            const color = state === "waiting" ? white(0.25) : meta.color;
            return (
              <li key={phase} aria-current={state === "running" ? "step" : undefined} style={{
                display: "flex", gap: SPACE.md, alignItems: "flex-start",
                padding: `${SPACE.md}px ${SPACE.lg}px`, borderRadius: 12,
                background: state === "running" ? alpha(C.white, 0.035) : state === "done" ? white(0.02) : "transparent",
                border: `1px solid ${state === "running" ? `${meta.color}40` : state === "done" ? white(0.06) : white(0.04)}`,
                opacity: state === "waiting" ? 0.55 : 1, transition: "background 0.4s, border-color 0.4s, opacity 0.4s",
              }}>
                <div aria-hidden style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: state === "done" ? TYPE.base : 16, fontWeight: 700, color: state === "done" ? C.bg0 : color,
                  background: state === "done" ? meta.color : state === "running" ? `${meta.color}1A` : white(0.04),
                  border: `1px solid ${state === "done" ? meta.color : state === "running" ? `${meta.color}60` : white(0.08)}`,
                }}>{state === "done" ? "✓" : meta.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: SPACE.sm }}>
                    <span style={{ fontFamily: BODY, fontSize: TYPE.md, fontWeight: 600, color: state === "waiting" ? white(0.5) : C.white }}>
                      {phase.charAt(0).toUpperCase() + phase.slice(1)}
                      <span style={{ fontFamily: MONO, fontSize: TYPE.xs, color: white(0.25), marginLeft: SPACE.sm }}>{i + 1}/5</span>
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: TYPE.xs, color, letterSpacing: "0.06em", flexShrink: 0 }}>
                      {state === "done" ? "DONE" : state === "running" ? meta.label : "WAITING"}
                    </span>
                  </div>
                  <div style={{ fontFamily: BODY, fontSize: TYPE.base, color: state === "running" ? white(0.75) : white(0.4), marginTop: 2, lineHeight: 1.5 }}>
                    {state === "running" && !showReveal ? step.msg : state === "done" ? summaryOf(phase) : BLURB[phase]}
                  </div>
                  {state === "running" && !showReveal && step.detail && (
                    <div key={stageIdx} className="fade-up" style={{ fontFamily: MONO, fontSize: TYPE.xs, color: `${meta.color}B3`, marginTop: SPACE.xs, lineHeight: 1.5 }}>{step.detail}</div>
                  )}
                  {phase === "enrich" && discoveries.length > 0 && (
                    <ul aria-label="Discovered topics" style={{ listStyle: "none", margin: `${SPACE.sm}px 0 0`, padding: 0, display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {discoveries.map((d, k) => (
                        <li key={d.name} className="slide-in" style={{
                          display: "inline-flex", alignItems: "center", gap: 6, fontFamily: BODY, fontSize: TYPE.sm, color: white(0.7),
                          background: white(0.04), border: `1px solid ${white(0.08)}`, borderRadius: 20, padding: `3px ${SPACE.md}px 3px ${SPACE.sm}px`, animationDelay: `${k * 40}ms`,
                        }}>
                          <span>{d.icon}</span>{d.name}<span style={{ fontFamily: MONO, fontSize: TYPE.xs, color: alpha(C.gold, 0.6) }}>{d.count}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        <div style={{ textAlign: "center", marginTop: SPACE.xl, minHeight: 20 }}>
          {canSkip && !showReveal && (
            <button onClick={onComplete} className="fade-up" style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.35), background: "none", border: "none", cursor: "pointer", padding: `${SPACE.xs}px ${SPACE.sm}px`, textDecoration: "underline", textUnderlineOffset: 3 }}>
              Skip to the atlas
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default LoadingView;
