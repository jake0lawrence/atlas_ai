import { useState, useEffect, useRef } from "react";
import { FONTS, BODY, MONO, CSS } from '../styles/base';
import { C, alpha, white } from '../styles/tokens';
import { screen, display } from '../styles/shared';

// ═══════════════════════════════════════════════════════════════
// CURATION SUMMARY & CONFIDENCE DASHBOARD (v5 1E)
// ═══════════════════════════════════════════════════════════════

const CurationSummary = ({ onComplete, mobile }) => {
  const [phase, setPhase] = useState(0); // 0: counting, 1: stats revealed, 2: before/after, 3: ready
  const [counters, setCounters] = useState({ reviewed: 0, approved: 0, edited: 0, rejected: 0, confidence: 0 });
  const curationTimersRef = useRef([]);

  useEffect(() => {
    return () => curationTimersRef.current.forEach(clearTimeout);
  }, []);


  // Aggregate stats from the full curation pipeline (simulated from demo data)
  const finalStats = {
    reviewed: 48, // 10 queue + 14 topics + 16 connections + 8 insights
    approved: 34,
    edited: 9,
    rejected: 5,
    confidence: 91,
  };

  const beforeAfter = [
    { label: "Topics merged", before: "14 separate topics", after: "12 focused topics", icon: "🔗", delta: "2 merged" },
    { label: "Topics renamed", before: "AI-generated labels", after: "Human-verified names", icon: "✏️", delta: "3 renamed" },
    { label: "Connections validated", before: "16 AI-discovered", after: "14 confirmed + 1 added", icon: "🕸️", delta: "2 rejected" },
    { label: "Insights promoted", before: "8 AI-extracted", after: "7 on your timeline", icon: "🎯", delta: "1 dismissed" },
    { label: "Overall confidence", before: "72%", after: "91%", icon: "📊", delta: "+19%" },
  ];

  // Animate counters on mount
  useEffect(() => {
    const duration = 1200;
    const steps = 30;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCounters({
        reviewed: Math.round(finalStats.reviewed * ease),
        approved: Math.round(finalStats.approved * ease),
        edited: Math.round(finalStats.edited * ease),
        rejected: Math.round(finalStats.rejected * ease),
        confidence: Math.round(finalStats.confidence * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);

    // Phase transitions
    curationTimersRef.current.push(setTimeout(() => setPhase(1), 1400));
    curationTimersRef.current.push(setTimeout(() => setPhase(2), 2200));
    curationTimersRef.current.push(setTimeout(() => setPhase(3), 3000));

    return () => clearInterval(timer);
  }, []);

  const statCards = [
    { label: "Items Reviewed", value: counters.reviewed, color: C.gold, icon: "📋" },
    { label: "Approved", value: counters.approved, color: C.green, icon: "✓" },
    { label: "Edited", value: counters.edited, color: C.blue, icon: "✎" },
    { label: "Rejected", value: counters.rejected, color: C.red, icon: "✕" },
  ];

  return (
    <div style={screen(mobile)}>
      <style>{CSS}</style>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(ellipse at 50% 30%, ${alpha(C.green, 0.05)} 0%, transparent 50%)`, pointerEvents: "none" }} />

      <div style={{ maxWidth: 800, width: "100%", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div className="fade-up" style={{ textAlign: "center", marginBottom: mobile ? 24 : 36 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 14px", borderRadius: 20, marginBottom: 14,
            background: alpha(C.green, 0.08), border: `1px solid ${alpha(C.green, 0.25)}`,
            fontFamily: MONO, fontSize: 10, color: C.green, fontWeight: 600, letterSpacing: "0.08em",
          }}>
            CURATION COMPLETE
          </div>
          <h1 style={display(mobile)}>
            Your Atlas is Now <span style={{ color: C.green }}>Human-Verified</span>
          </h1>
          <p style={{ fontFamily: BODY, fontSize: mobile ? 12 : 14, color: white(0.3), marginTop: 8, lineHeight: 1.6 }}>
            You reviewed AI classifications, curated topics, validated connections, and confirmed insights.
            <br />Every data point in your knowledge base has been shaped by your judgment.
          </p>
        </div>

        {/* Confidence ring */}
        <div className="fade-up" style={{ textAlign: "center", marginBottom: mobile ? 28 : 40, animationDelay: "0.2s" }}>
          <div style={{ position: "relative", display: "inline-block", width: mobile ? 120 : 150, height: mobile ? 120 : 150 }}>
            <svg width={mobile ? 120 : 150} height={mobile ? 120 : 150} viewBox="0 0 150 150" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="75" cy="75" r="62" fill="none" stroke={white(0.04)} strokeWidth="8" />
              <circle cx="75" cy="75" r="62" fill="none" stroke="url(#confidenceGrad)" strokeWidth="8"
                strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 62}`}
                strokeDashoffset={`${2 * Math.PI * 62 * (1 - counters.confidence / 100)}`}
                style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)" }} />
              <defs>
                <linearGradient id="confidenceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={C.green} />
                  <stop offset="100%" stopColor={C.greenDeep} />
                </linearGradient>
              </defs>
            </svg>
            <div style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}>
              <div style={{ fontFamily: MONO, fontSize: mobile ? 32 : 40, fontWeight: 700, color: C.green, lineHeight: 1 }}>
                {counters.confidence}%
              </div>
              <div style={{ fontFamily: BODY, fontSize: 10, color: white(0.25), marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                confidence
              </div>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{
          display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)",
          gap: mobile ? 10 : 14, marginBottom: mobile ? 28 : 40,
        }}>
          {statCards.map((stat, i) => (
            <div key={stat.label} className="fade-up" style={{
              background: white(0.025), borderRadius: 14,
              border: `1px solid ${stat.color}15`, padding: mobile ? "16px 14px" : "20px 18px",
              textAlign: "center", animationDelay: `${0.3 + i * 0.1}s`,
            }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{stat.icon}</div>
              <div style={{
                fontFamily: MONO, fontSize: mobile ? 28 : 32, fontWeight: 700,
                color: stat.color, lineHeight: 1, marginBottom: 4,
              }}>
                {stat.value}
              </div>
              <div style={{
                fontFamily: BODY, fontSize: mobile ? 10 : 11, color: white(0.3),
                fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em",
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Before/After comparison */}
        {phase >= 2 && (
          <div className="fade-up" style={{ marginBottom: mobile ? 28 : 40 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: mobile ? 14 : 18,
            }}>
              <h2 style={{ fontFamily: FONTS, fontSize: mobile ? 18 : 22, fontWeight: 700, color: C.white }}>
                How Curation Improved Your Atlas
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: mobile ? 8 : 10 }}>
              {beforeAfter.map((item, i) => (
                <div key={item.label} className="fade-up" style={{
                  background: white(0.02), borderRadius: 14,
                  border: `1px solid ${white(0.05)}`, overflow: "hidden",
                  animationDelay: `${i * 0.1}s`,
                }}>
                  <div style={{
                    display: "flex", alignItems: mobile ? "flex-start" : "center",
                    flexDirection: mobile ? "column" : "row",
                    gap: mobile ? 8 : 0,
                    padding: mobile ? "14px 14px" : "14px 20px",
                  }}>
                    {/* Label */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: 8,
                      width: mobile ? "100%" : "160px", flexShrink: 0,
                    }}>
                      <span style={{ fontSize: 16 }}>{item.icon}</span>
                      <span style={{ fontFamily: BODY, fontSize: 13, color: white(0.5), fontWeight: 600 }}>
                        {item.label}
                      </span>
                    </div>

                    {/* Before → After */}
                    <div style={{
                      flex: 1, display: "flex", alignItems: "center", gap: mobile ? 8 : 12,
                      flexDirection: mobile ? "column" : "row", width: mobile ? "100%" : "auto",
                    }}>
                      <div style={{
                        flex: 1, padding: "8px 12px", borderRadius: 8,
                        background: alpha(C.red, 0.04), border: `1px solid ${alpha(C.red, 0.1)}`,
                        width: mobile ? "100%" : "auto",
                      }}>
                        <span style={{ fontFamily: MONO, fontSize: 9, color: alpha(C.red, 0.4), display: "block", marginBottom: 2 }}>BEFORE</span>
                        <span style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: white(0.3) }}>{item.before}</span>
                      </div>

                      <span style={{ fontFamily: MONO, fontSize: 14, color: white(0.15), flexShrink: 0 }}>→</span>

                      <div style={{
                        flex: 1, padding: "8px 12px", borderRadius: 8,
                        background: alpha(C.green, 0.04), border: `1px solid ${alpha(C.green, 0.1)}`,
                        width: mobile ? "100%" : "auto",
                      }}>
                        <span style={{ fontFamily: MONO, fontSize: 9, color: alpha(C.green, 0.4), display: "block", marginBottom: 2 }}>AFTER</span>
                        <span style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: white(0.45) }}>{item.after}</span>
                      </div>
                    </div>

                    {/* Delta badge */}
                    {!mobile && (
                      <div style={{
                        flexShrink: 0, marginLeft: 12,
                        padding: "4px 10px", borderRadius: 8,
                        background: alpha(C.green, 0.08), border: `1px solid ${alpha(C.green, 0.15)}`,
                        fontFamily: MONO, fontSize: 10, color: C.green, fontWeight: 500,
                      }}>
                        {item.delta}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Continue button */}
        {phase >= 3 && (
          <div className="fade-up" style={{ textAlign: "center", padding: mobile ? "16px 0 48px" : "24px 0 64px" }}>
            <p style={{
              fontFamily: BODY, fontSize: mobile ? 12 : 14, color: white(0.2),
              marginBottom: 20, lineHeight: 1.6,
            }}>
              Your knowledge base is ready. Every insight, connection, and classification has been shaped by you.
            </p>
            <button onClick={onComplete} style={{
              fontFamily: BODY, fontSize: 16, fontWeight: 600, color: C.bg0,
              background: `linear-gradient(135deg, ${C.green}, ${C.greenDeep})`, border: "none",
              borderRadius: 12, padding: "14px 44px", cursor: "pointer",
              boxShadow: `0 4px 24px ${alpha(C.green, 0.3)}`, transition: "all 0.25s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 32px ${alpha(C.green, 0.4)}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 24px ${alpha(C.green, 0.3)}`; }}
            >
              Explore Your Atlas →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurationSummary;
