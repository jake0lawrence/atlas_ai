import { useState, useEffect } from "react";
import {
  TOUR_STEPS, TOUR_STORAGE_KEY,
} from '../data/constants';
import { FONTS, BODY, MONO } from '../styles/base';

// ═══════════════════════════════════════════════════════════════
// GUIDED TOUR MODE (7A)
// ═══════════════════════════════════════════════════════════════

const GuidedTour = ({ active, onClose, mobile, steps = TOUR_STEPS, storageKey = TOUR_STORAGE_KEY }) => {
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  useEffect(() => {
    if (!active) { setStep(0); setTargetRect(null); }
  }, [active]);

  // Track target element position and scroll it into view
  useEffect(() => {
    if (!active) return;
    const current = steps[step];
    if (!current.target) { setTargetRect(null); return; }

    const el = document.querySelector(current.target);
    if (!el) { setTargetRect(null); return; }

    const updateRect = () => {
      const r = el.getBoundingClientRect();
      setTargetRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    // Measure immediately for instant positioning
    updateRect();

    // Scroll into view if needed, then re-measure after scroll settles
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    const timer = setTimeout(updateRect, 400);

    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [active, step, steps]);

  useEffect(() => {
    if (!active) return;
    const handleKey = (e) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowRight" || e.key === "Enter") { e.preventDefault(); step < steps.length - 1 ? setStep(s => s + 1) : handleFinish(); }
      if (e.key === "ArrowLeft" && step > 0) { e.preventDefault(); setStep(s => s - 1); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  const handleFinish = () => {
    try { localStorage.setItem(storageKey, "true"); } catch (e) { console.warn('Failed to save tour state:', e); }
    onClose();
  };

  if (!active) return null;

  const current = steps[step];
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;
  const hasTarget = !!current.target && !!targetRect;
  const spotPad = 10;

  // Shared tooltip inner content
  const tooltipInner = (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: mobile ? 22 : 26 }}>{current.icon}</span>
          <h3 style={{ fontFamily: FONTS, fontSize: mobile ? 18 : 21, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{current.title}</h3>
        </div>
        <button onClick={handleFinish} style={{
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 6, padding: "3px 8px", cursor: "pointer",
          fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.25)",
        }}>ESC</button>
      </div>
      <p style={{ fontFamily: BODY, fontSize: mobile ? 13 : 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, marginBottom: 24 }}>{current.description}</p>
      {current.highlight && (
        <div style={{
          background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)",
          borderRadius: 8, padding: "8px 12px", marginBottom: 20,
          fontFamily: BODY, fontSize: 11, color: "#FBBF24", fontWeight: 500,
        }}>The curation pipeline is Atlas's key differentiator — your judgment shapes the knowledge base.</div>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 18 : 6, height: 6, borderRadius: 3,
              background: i === step ? "#FBBF24" : i < step ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.1)",
              transition: "all 0.25s",
            }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {!isFirst && (
            <button onClick={() => setStep(s => s - 1)} style={{
              fontFamily: BODY, fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.4)",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, padding: "7px 16px", cursor: "pointer", transition: "all 0.2s",
            }}>Back</button>
          )}
          {isFirst && (
            <button onClick={handleFinish} style={{
              fontFamily: BODY, fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.3)",
              background: "transparent", border: "none", padding: "7px 10px", cursor: "pointer",
            }}>Skip tour</button>
          )}
          <button onClick={() => isLast ? handleFinish() : setStep(s => s + 1)} style={{
            fontFamily: BODY, fontSize: 12, fontWeight: 600,
            color: "#08080C", background: "#FBBF24",
            border: "none", borderRadius: 8, padding: "7px 20px",
            cursor: "pointer", transition: "all 0.2s",
          }}>{isLast ? "Get Started" : "Next"}</button>
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: 12, fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.15)" }}>
        {step + 1} / {steps.length} · Use arrow keys to navigate
      </div>
    </>
  );

  // Card style (shared between both modes)
  const cardStyle = {
    background: current.highlight ? "linear-gradient(135deg, #131318 0%, rgba(251,191,36,0.06) 100%)" : "#131318",
    border: `1px solid ${current.highlight ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.1)"}`,
    borderRadius: 16, padding: mobile ? "24px 20px" : "28px 28px 24px",
    boxShadow: current.highlight ? "0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(251,191,36,0.08)" : "0 24px 80px rgba(0,0,0,0.5)",
    animation: "fadeUp 0.25s ease both",
  };

  // ── Spotlight mode: highlight the target element, position tooltip near it ──
  if (hasTarget) {
    const spaceBelow = window.innerHeight - (targetRect.top + targetRect.height + spotPad);
    const placeBelow = spaceBelow > 280;
    const tooltipWidth = mobile ? Math.min(window.innerWidth - 32, 360) : 420;
    const tooltipLeft = Math.max(16, Math.min(
      targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
      window.innerWidth - tooltipWidth - 16
    ));

    return (
      <div role="dialog" aria-modal="true" aria-label="Guided tour" style={{ position: "fixed", inset: 0, zIndex: 10000 }} onClick={handleFinish}>
        {/* Spotlight cutout: box-shadow darkens everything except the target */}
        <div style={{
          position: "fixed",
          top: targetRect.top - spotPad,
          left: targetRect.left - spotPad,
          width: targetRect.width + spotPad * 2,
          height: targetRect.height + spotPad * 2,
          borderRadius: 12,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)",
          pointerEvents: "none",
          transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 10001,
        }} />
        {/* Gold border ring around the spotlight area */}
        <div style={{
          position: "fixed",
          top: targetRect.top - spotPad,
          left: targetRect.left - spotPad,
          width: targetRect.width + spotPad * 2,
          height: targetRect.height + spotPad * 2,
          borderRadius: 12,
          border: "1.5px solid rgba(251,191,36,0.4)",
          pointerEvents: "none",
          transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 10002,
        }} />
        {/* Tooltip card positioned relative to spotlight */}
        <div onClick={e => e.stopPropagation()} style={{
          position: "fixed",
          ...(placeBelow
            ? { top: targetRect.top + targetRect.height + spotPad + 16 }
            : { bottom: window.innerHeight - targetRect.top + spotPad + 16 }),
          left: tooltipLeft,
          width: tooltipWidth, maxWidth: "calc(100vw - 32px)",
          zIndex: 10003,
          ...cardStyle,
        }}>
          {tooltipInner}
        </div>
      </div>
    );
  }

  // ── Centered mode: for steps without a specific target element ──
  return (
    <div role="dialog" aria-modal="true" aria-label="Guided tour" style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={handleFinish}>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", transition: "opacity 0.3s" }} />
      <div onClick={e => e.stopPropagation()} style={{
        position: "relative", width: mobile ? "90%" : 420, maxWidth: "90vw",
        zIndex: 1,
        ...cardStyle,
      }}>
        {tooltipInner}
      </div>
    </div>
  );
};

export default GuidedTour;
