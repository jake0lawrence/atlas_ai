import { useState, useEffect, useRef } from "react";
import { TOUR_STEPS, TOUR_STORAGE_KEY } from '../data/constants';
import { C, alpha, white, black, FONTS, BODY, MONO, SPACE, TYPE } from '../styles/tokens';

// The one guided tour (v7): a spotlight on each target that is on screen, a
// centered card for a step whose target is not (the phone menu hides the
// stations and the ⌘K button). Every way out, the last step, Skip, Escape or
// a click outside, marks the tour seen, so it does not come back next load.

const reducedMotion = () => Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
const SPOT_PAD = 10;

export const markSeen = (storageKey) => {
  try { localStorage.setItem(storageKey, "true"); } catch (e) { console.warn('tour: could not save that it was seen:', e); }
};

// Where the card goes: below the target when it fits, above otherwise, kept
// on screen horizontally. Pure, so the arithmetic is tested.
export const placeCard = (rect, viewport, cardWidth, cardHeight = 280) => {
  const below = viewport.height - (rect.top + rect.height + SPOT_PAD) > cardHeight;
  const left = Math.max(16, Math.min(rect.left + rect.width / 2 - cardWidth / 2, viewport.width - cardWidth - 16));
  return below
    ? { left, top: rect.top + rect.height + SPOT_PAD + 16 }
    : { left, bottom: viewport.height - rect.top + SPOT_PAD + 16 };
};

const button = (primary) => ({
  fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 600, borderRadius: 8, cursor: "pointer",
  padding: `${SPACE.sm}px ${SPACE.lg}px`,
  color: primary ? C.bg0 : white(0.75), background: primary ? C.gold : white(0.05),
  border: `1px solid ${primary ? C.gold : white(0.14)}`,
});

const Tour = ({ onClose, mobile, steps, storageKey }) => {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);
  const nextRef = useRef(null);
  const current = steps[step];
  const last = step === steps.length - 1;

  const finish = () => { markSeen(storageKey); onClose(); };
  const go = (to) => { if (to >= 0 && to < steps.length) setStep(to); };

  // Follow the target: measure it, bring it into view, re-measure on scroll
  // and resize. A step without a target on screen gets the centered card.
  useEffect(() => {
    const el = current.target ? document.querySelector(current.target) : null;
    const measure = () => {
      if (!el) { setRect(null); return; }
      const r = el.getBoundingClientRect();
      setRect(r.width || r.height ? { top: r.top, left: r.left, width: r.width, height: r.height } : null);
    };
    el?.scrollIntoView?.({ behavior: reducedMotion() ? "auto" : "smooth", block: "nearest" });
    measure();
    const settle = setTimeout(measure, 400);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      clearTimeout(settle);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [current.target]);

  useEffect(() => { nextRef.current?.focus({ preventScroll: true }); }, [step]);

  // The arrows step through the tour; Enter and Space stay with the focused button.
  const onKeyDown = (e) => {
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); finish(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); if (last) finish(); else go(step + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); go(step - 1); }
  };

  const motion = !reducedMotion();
  const cardWidth = mobile ? Math.min(window.innerWidth - 32, 360) : 420;
  const place = rect ? placeCard(rect, { width: window.innerWidth, height: window.innerHeight }, cardWidth) : null;
  const titleId = "tour-step-title";

  const card = (
    <div onClick={e => e.stopPropagation()} style={{
      position: "fixed", zIndex: 10003, width: cardWidth, maxWidth: "calc(100vw - 32px)",
      ...(place || { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }),
      background: C.bg2, border: `1px solid ${alpha(C.gold, 0.3)}`, borderRadius: 16,
      padding: mobile ? SPACE.xl - 4 : `${SPACE.xl + 4}px ${SPACE.xl + 4}px ${SPACE.xl}px`,
      boxShadow: `0 24px 80px ${black(0.6)}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: SPACE.md, marginBottom: SPACE.md }}>
        <span aria-hidden="true" style={{ fontSize: mobile ? TYPE.xl : TYPE.xxl }}>{current.icon}</span>
        <h2 id={titleId} style={{ fontFamily: FONTS, fontSize: mobile ? TYPE.lg : TYPE.xl, fontWeight: 700, color: C.white, lineHeight: 1.2, margin: 0 }}>{current.title}</h2>
      </div>
      <p style={{ fontFamily: BODY, fontSize: mobile ? TYPE.base : TYPE.md - 1, color: white(0.75), lineHeight: 1.6, margin: `0 0 ${SPACE.xl}px` }}>{current.description}</p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: SPACE.md }}>
        <ol aria-label="Tour steps" style={{ display: "flex", gap: SPACE.xs, listStyle: "none", margin: 0, padding: 0 }}>
          {steps.map((s, i) => (
            <li key={s.title} aria-current={i === step ? "step" : undefined} style={{
              width: i === step ? 18 : 6, height: 6, borderRadius: 3,
              background: i === step ? C.gold : i < step ? alpha(C.gold, 0.45) : white(0.18),
              transition: motion ? "width 0.25s" : "none",
            }}><span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{s.title}</span></li>
          ))}
        </ol>
        <div style={{ display: "flex", gap: SPACE.sm }}>
          {step === 0
            ? <button onClick={finish} style={{ ...button(false), background: "transparent", border: "1px solid transparent", color: white(0.6) }}>Skip tour</button>
            : <button onClick={() => go(step - 1)} style={button(false)}>Back</button>}
          <button ref={nextRef} onClick={() => (last ? finish() : go(step + 1))} style={button(true)}>{last ? "Start exploring" : "Next"}</button>
        </div>
      </div>
      <div style={{ marginTop: SPACE.md, fontFamily: MONO, fontSize: TYPE.xs, color: white(0.55), textAlign: "center" }}>
        {step + 1} of {steps.length}{!mobile && " · ← → to move, esc to close"}
      </div>
    </div>
  );

  return (
    <div role="dialog" aria-modal="true" aria-label="Guided tour" aria-describedby={titleId} onKeyDown={onKeyDown} onClick={finish}
      style={{ position: "fixed", inset: 0, zIndex: 10000 }}>
      {rect ? (
        <div aria-hidden="true" style={{
          position: "fixed", zIndex: 10001, pointerEvents: "none", borderRadius: 12,
          top: rect.top - SPOT_PAD, left: rect.left - SPOT_PAD, width: rect.width + SPOT_PAD * 2, height: rect.height + SPOT_PAD * 2,
          boxShadow: `0 0 0 9999px ${black(0.6)}`, border: `1.5px solid ${alpha(C.gold, 0.55)}`,
          transition: motion ? "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
        }} />
      ) : (
        <div aria-hidden="true" style={{ position: "fixed", inset: 0, background: black(0.65) }} />
      )}
      {card}
    </div>
  );
};

// Mounted only while active, so every run starts from the first step.
const GuidedTour = ({ active, onClose, mobile, steps = TOUR_STEPS, storageKey = TOUR_STORAGE_KEY }) =>
  active ? <Tour onClose={onClose} mobile={mobile} steps={steps} storageKey={storageKey} /> : null;

export default GuidedTour;
