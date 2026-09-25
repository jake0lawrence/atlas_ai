import { useState } from "react";
import { DEMO_PERSONAS, TOPICS, CONNECTIONS } from '../data/constants';
import { CSS } from '../styles/base';
import DropZone from '../components/DropZone';
import { C, alpha, white, FONTS, BODY, MONO, SPACE, TYPE } from '../styles/tokens';

// The front door. One screen, one action: pick a demo atlas (the default) or,
// behind a disclosure, drop your own exports; either way the single CTA builds.
// V7_PLAN.md row 2.

const PERSONAS = DEMO_PERSONAS.filter(p => p.enabled);
const COMING = DEMO_PERSONAS.filter(p => !p.enabled);

const FACTS = [
  { value: "3,847", label: "conversations" },
  { value: String(TOPICS.length), label: "topic clusters" },
  { value: String(CONNECTIONS.length), label: "connections" },
  { value: "2 yrs", label: "Jan 2023 – Feb 2025" },
];

const OnboardingView = ({ onStart, mobile }) => {
  const [persona, setPersona] = useState(PERSONAS[0]?.id ?? null);
  const [showExports, setShowExports] = useState(false);
  const [gptFile, setGptFile] = useState(null);
  const [claudeFile, setClaudeFile] = useState(null);

  const hasFiles = Boolean(gptFile || claudeFile);
  const source = hasFiles ? "files" : "demo";
  const active = PERSONAS.find(p => p.id === persona) || PERSONAS[0];
  const canBuild = hasFiles || Boolean(active);

  const pickPersona = (id) => { setPersona(id); setGptFile(null); setClaudeFile(null); };
  const build = () => { if (canBuild) onStart(); };

  const ctaLabel = source === "files"
    ? (gptFile && claudeFile ? "Build from both exports →" : gptFile ? "Build from ChatGPT →" : "Build from Claude →")
    : `Build the ${active?.label ?? "demo"} atlas →`;

  return (
    <div style={{ minHeight: "100vh", background: C.bg0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: mobile ? `${SPACE.xxl}px ${SPACE.lg}px` : `${SPACE.xxxl}px ${SPACE.xxl}px` }}>
      <style>{CSS}</style>
      <div aria-hidden style={{ position: "fixed", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "140%", height: "50%", background: `radial-gradient(ellipse at center, ${alpha(C.gold, 0.05)} 0%, transparent 60%)`, pointerEvents: "none" }} />

      <main style={{ maxWidth: 680, width: "100%", position: "relative", zIndex: 1 }}>
        {/* Pitch */}
        <div style={{ textAlign: "center", marginBottom: mobile ? SPACE.xl : SPACE.xxl }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: SPACE.sm, marginBottom: SPACE.lg }}>
            <span style={{ fontSize: mobile ? 28 : 32, lineHeight: 1 }}>🧠</span>
            <span style={{ fontFamily: FONTS, fontSize: mobile ? TYPE.xl : TYPE.xxl, fontWeight: 700, color: C.white }}>Atlas</span>
          </div>
          <div style={{ fontFamily: BODY, fontSize: TYPE.xs, color: alpha(C.gold, 0.6), textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 600, marginBottom: SPACE.md }}>Your mind, mapped</div>
          <h1 style={{ fontFamily: FONTS, fontSize: mobile ? TYPE.xxl : TYPE.display, fontWeight: 800, color: C.white, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: SPACE.md }}>
            Two years of AI conversations.<br />
            <span style={{ color: C.gold }}>One map.</span>
          </h1>
          <p style={{ fontFamily: BODY, fontSize: mobile ? TYPE.base : TYPE.md, color: white(0.5), lineHeight: 1.6, maxWidth: 520, margin: "0 auto" }}>
            Atlas reads your ChatGPT and Claude exports and turns them into the topics you keep returning to, the decisions you made, and the connections between them.
          </p>
        </div>

        {/* What an atlas holds */}
        <dl style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: SPACE.sm, margin: `0 0 ${SPACE.xl}px` }}>
          {FACTS.map(f => (
            <div key={f.label} style={{ textAlign: "center", padding: `${SPACE.md}px ${SPACE.sm}px`, background: white(0.02), border: `1px solid ${white(0.05)}`, borderRadius: 10 }}>
              <dt style={{ fontFamily: FONTS, fontSize: TYPE.xl, fontWeight: 700, color: C.gold, lineHeight: 1 }}>{f.value}</dt>
              <dd style={{ fontFamily: BODY, fontSize: TYPE.xs, color: white(0.35), marginTop: SPACE.xs, textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</dd>
            </div>
          ))}
        </dl>

        {/* The one card */}
        <section aria-label="Start" style={{ background: white(0.025), border: `1px solid ${white(0.07)}`, borderRadius: 16, padding: mobile ? SPACE.lg : SPACE.xl }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: SPACE.md, marginBottom: SPACE.md, flexWrap: "wrap" }}>
            <h2 style={{ fontFamily: FONTS, fontSize: TYPE.lg, color: C.white, fontWeight: 600 }}>Start with a demo atlas</h2>
            <span style={{ fontFamily: BODY, fontSize: TYPE.xs, color: white(0.3) }}>Built from real conversation patterns, no upload needed</span>
          </div>

          <div role="radiogroup" aria-label="Demo persona" style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : `repeat(${PERSONAS.length}, 1fr)`, gap: SPACE.sm }}>
            {PERSONAS.map(p => {
              const selected = source === "demo" && p.id === persona;
              return (
                <button key={p.id} role="radio" aria-checked={selected} onClick={() => pickPersona(p.id)} style={{
                  display: "flex", alignItems: "center", gap: SPACE.md, textAlign: "left",
                  background: selected ? alpha(C.gold, 0.08) : white(0.02),
                  border: `1px solid ${selected ? alpha(C.gold, 0.5) : white(0.08)}`,
                  borderRadius: 12, padding: `${SPACE.md}px ${SPACE.lg}px`, cursor: "pointer", transition: "border-color 0.2s, background 0.2s",
                }}>
                  <span style={{ fontSize: 22, width: 32, textAlign: "center", flexShrink: 0 }}>{p.icon}</span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontFamily: BODY, fontSize: TYPE.md, fontWeight: 600, color: selected ? C.gold : C.white }}>{p.label}</span>
                    <span style={{ display: "block", fontFamily: BODY, fontSize: TYPE.sm, color: white(0.4), marginTop: 2 }}>{p.convos} conversations · {p.detail}</span>
                  </span>
                  <span aria-hidden style={{ marginLeft: "auto", width: 16, height: 16, borderRadius: "50%", flexShrink: 0, border: `2px solid ${selected ? C.gold : white(0.2)}`, background: selected ? C.gold : "transparent", boxShadow: selected ? `inset 0 0 0 3px ${C.bg0}` : "none" }} />
                </button>
              );
            })}
          </div>

          {/* Own exports, behind a disclosure */}
          <div style={{ marginTop: SPACE.lg, borderTop: `1px solid ${white(0.06)}`, paddingTop: SPACE.md }}>
            <button onClick={() => setShowExports(o => !o)} aria-expanded={showExports} style={{
              fontFamily: BODY, fontSize: TYPE.base, color: showExports ? C.white : white(0.5), background: "none", border: "none",
              padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: SPACE.sm,
            }}>
              <span style={{ display: "inline-block", transition: "transform 0.2s", transform: showExports ? "rotate(90deg)" : "none", fontSize: TYPE.xs }}>▶</span>
              I have my own exports
              {hasFiles && <span style={{ fontFamily: MONO, fontSize: TYPE.xs, color: C.green, marginLeft: SPACE.xs }}>· {[gptFile, claudeFile].filter(Boolean).length} ready</span>}
            </button>
            {showExports && (
              <div className="fade-up" style={{ marginTop: SPACE.md }}>
                <p style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.35), marginBottom: SPACE.md, lineHeight: 1.5 }}>
                  Drop either file, or both. Atlas reads the export formats ChatGPT and Claude produce today; nothing leaves your browser.
                </p>
                <div style={{ display: "flex", gap: SPACE.md, flexDirection: mobile ? "column" : "row" }}>
                  <DropZone platform="ChatGPT" icon="💬" color={C.green} subtitle="Settings → Data controls → Export → conversations.json" accepted={gptFile} onFile={setGptFile} mobile={mobile} />
                  <DropZone platform="Claude" icon="🟠" color={C.gold} subtitle="Settings → Account → Export data → ZIP" accepted={claudeFile} onFile={setClaudeFile} mobile={mobile} />
                </div>
              </div>
            )}
          </div>

          {/* The one action */}
          <div style={{ marginTop: SPACE.xl, display: "flex", flexDirection: mobile ? "column" : "row", alignItems: mobile ? "stretch" : "center", justifyContent: "space-between", gap: SPACE.md }}>
            <button onClick={build} disabled={!canBuild} style={{
              fontFamily: BODY, fontSize: TYPE.md, fontWeight: 600, color: C.bg0,
              background: `linear-gradient(135deg, ${C.gold}, ${C.amber})`, border: "none", borderRadius: 12,
              padding: `${SPACE.md + 2}px ${SPACE.xxl}px`, cursor: canBuild ? "pointer" : "default",
              boxShadow: `0 4px 24px ${alpha(C.gold, 0.25)}, 0 0 0 1px ${alpha(C.gold, 0.3)}`, transition: "transform 0.2s, box-shadow 0.2s",
            }}>{ctaLabel}</button>
            <span style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.3), textAlign: mobile ? "center" : "right" }}>
              {source === "files" ? "Parsed and mapped in your browser." : "Takes about ten seconds."}
            </span>
          </div>
        </section>

        <p style={{ textAlign: "center", fontFamily: BODY, fontSize: TYPE.sm, color: white(0.25), marginTop: mobile ? SPACE.xl : SPACE.xxl, lineHeight: 1.6 }}>
          Your data never leaves your browser.
          {COMING.length > 0 && <> {COMING.map(p => `${p.label} atlases (${p.detail.replace(" · Coming soon", "")}) are coming.`).join(" ")}</>}
        </p>
      </main>
    </div>
  );
};

export default OnboardingView;
