import { useState } from "react";
import {
  DEMO_PERSONAS,
} from '../data/constants';
import { FONTS, BODY, MONO, CSS } from '../styles/base';
import DropZone from '../components/DropZone';
import { C, alpha, white } from '../styles/tokens';

const OnboardingView = ({ onStart, mobile }) => {
  const [gptFile, setGptFile] = useState(null);
  const [claudeFile, setClaudeFile] = useState(null);
  const [selectedPersona, setSelectedPersona] = useState(null);

  const hasAnyFile = gptFile || claudeFile;

  const handleDemo = (personaId) => {
    setSelectedPersona(personaId);
    setGptFile("conversations.json");
    setClaudeFile(personaId === "new" ? null : "claude-export-2026-02.zip");
    setTimeout(() => onStart(), 800);
  };

  const handleBuild = () => { if (hasAnyFile) onStart(); };

  return (
    <div style={{ minHeight: "100vh", background: C.bg0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: mobile ? "32px 16px" : "48px 32px" }}>
      <style>{CSS}</style>

      {/* Background glow */}
      <div style={{ position: "fixed", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "140%", height: "50%", background: `radial-gradient(ellipse at center, ${alpha(C.gold, 0.04)} 0%, transparent 60%)`, pointerEvents: "none" }} />

      <div style={{ maxWidth: 720, width: "100%", position: "relative", zIndex: 1 }}>
        {/* Logo & Hero */}
        <div style={{ textAlign: "center", marginBottom: mobile ? 36 : 48 }}>
          <div style={{ fontSize: mobile ? 48 : 64, marginBottom: 16, animation: "glow 3s infinite ease-in-out" }}>🧠</div>
          <h1 style={{ fontFamily: FONTS, fontSize: mobile ? 36 : 52, fontWeight: 800, color: C.white, lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 8 }}>
            <span style={{ color: C.gold }}>Atlas</span>
          </h1>
          <p style={{ fontFamily: BODY, fontSize: mobile ? 14 : 17, color: white(0.4), lineHeight: 1.6, maxWidth: 500, margin: "0 auto" }}>
            Transform your AI conversation history into a structured, searchable knowledge base.
          </p>
        </div>

        {/* How it works — tiny steps */}
        <div style={{ display: "flex", justifyContent: "center", gap: mobile ? 16 : 32, marginBottom: mobile ? 28 : 40, flexWrap: "wrap" }}>
          {[
            { n: "1", label: "Export your data", sub: "from ChatGPT & Claude" },
            { n: "2", label: "Drop files here", sub: "we parse & normalize" },
            { n: "3", label: "Explore your atlas", sub: "topics, connections, insights" },
          ].map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: i === 1 ? alpha(C.gold, 0.15) : white(0.04), border: `1px solid ${i === 1 ? alpha(C.gold, 0.3) : white(0.08)}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 11, color: i === 1 ? C.gold : white(0.3), fontWeight: 600, flexShrink: 0 }}>{step.n}</div>
              <div>
                <div style={{ fontFamily: BODY, fontSize: 12, color: C.white, fontWeight: 500 }}>{step.label}</div>
                <div style={{ fontFamily: BODY, fontSize: 10, color: white(0.2) }}>{step.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Drop Zones */}
        <div style={{ display: "flex", gap: mobile ? 12 : 16, flexDirection: mobile ? "column" : "row", marginBottom: 20 }}>
          <DropZone
            platform="ChatGPT" icon="💬" color={C.green}
            subtitle="Settings → Data controls → Export → Download conversations.json"
            accepted={gptFile} onFile={setGptFile} mobile={mobile}
          />
          <DropZone
            platform="Claude" icon="🟠" color={C.gold}
            subtitle="Settings → Account → Export data → Download ZIP file"
            accepted={claudeFile} onFile={setClaudeFile} mobile={mobile}
          />
        </div>

        {/* Build button */}
        {hasAnyFile && (
          <div className="fade-up" style={{ textAlign: "center", marginBottom: 20 }}>
            <button onClick={handleBuild} style={{
              fontFamily: BODY, fontSize: 16, fontWeight: 600, color: C.bg0,
              background: `linear-gradient(135deg, ${C.gold}, ${C.amber})`, border: "none",
              borderRadius: 12, padding: "14px 40px", cursor: "pointer",
              boxShadow: `0 4px 24px ${alpha(C.gold, 0.25)}, 0 0 0 1px ${alpha(C.gold, 0.3)}`,
              transition: "all 0.25s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 32px ${alpha(C.gold, 0.35)}, 0 0 0 1px ${alpha(C.gold, 0.4)}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 24px ${alpha(C.gold, 0.25)}, 0 0 0 1px ${alpha(C.gold, 0.3)}`; }}
            >
              Build My Atlas →
            </button>
            <div style={{ fontFamily: BODY, fontSize: 11, color: white(0.2), marginTop: 10 }}>
              {gptFile && claudeFile ? "Both sources ready" : gptFile ? "ChatGPT only — Claude is optional" : "Claude only — ChatGPT is optional"}
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, margin: `${hasAnyFile ? 12 : 24}px 0` }}>
          <div style={{ flex: 1, height: 1, background: white(0.06) }} />
          <span style={{ fontFamily: BODY, fontSize: 11, color: white(0.15), textTransform: "uppercase", letterSpacing: "0.1em" }}>or</span>
          <div style={{ flex: 1, height: 1, background: white(0.06) }} />
        </div>

        {/* Demo persona selector */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: BODY, fontSize: 12, color: white(0.3), marginBottom: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            ✨ Try a demo persona
          </div>
          <div style={{ display: "flex", gap: mobile ? 8 : 12, justifyContent: "center", flexWrap: "wrap" }}>
            {DEMO_PERSONAS.map(p => (
              <button key={p.id} disabled={!p.enabled || selectedPersona !== null}
                onClick={() => p.enabled && handleDemo(p.id)}
                onMouseEnter={e => { if (p.enabled && !selectedPersona) { e.currentTarget.style.background = `${p.color}11`; e.currentTarget.style.borderColor = `${p.color}55`; } }}
                onMouseLeave={e => { if (p.enabled && selectedPersona !== p.id) { e.currentTarget.style.background = white(0.02); e.currentTarget.style.borderColor = white(0.08); } }}
                style={{
                  fontFamily: BODY, fontSize: 13, color: !p.enabled ? white(0.2) : selectedPersona === p.id ? p.color : white(0.6),
                  background: selectedPersona === p.id ? `${p.color}11` : white(0.02),
                  border: `1px solid ${selectedPersona === p.id ? `${p.color}55` : white(0.08)}`,
                  borderRadius: 10, padding: mobile ? "10px 14px" : "12px 20px", cursor: p.enabled ? "pointer" : "default",
                  transition: "all 0.25s", opacity: !p.enabled ? 0.5 : 1, minWidth: mobile ? 0 : 160,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                }}
              >
                <span style={{ fontSize: 18 }}>{p.icon}</span>
                <span style={{ fontWeight: 600 }}>{p.label}</span>
                <span style={{ fontSize: 11, color: white(0.3), fontWeight: 400 }}>
                  {p.convos !== "—" ? `${p.convos} convos` : "Preview"}
                </span>
                <span style={{ fontSize: 10, color: white(0.15), fontWeight: 400 }}>{p.detail}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: mobile ? 40 : 56 }}>
          <div style={{ fontFamily: BODY, fontSize: 10, color: white(0.08) }}>
            Your data never leaves your browser. Atlas processes everything locally.
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingView;
