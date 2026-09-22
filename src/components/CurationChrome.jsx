import { C, alpha, white, FONTS, BODY, MONO, SPACE, TYPE } from '../styles/tokens';

// Chrome shared by the five curation screens: the step rail, the page header,
// and the keyboard hints. The run is a first-visit wizard (like onboarding and
// loading), so it sits outside the shell; the rail is its navigation, and
// "Skip to the atlas" is the way out from any step.
export const CURATION_STEPS = [
  { view: "curation", label: "Review" },
  { view: "topicCuration", label: "Topics" },
  { view: "connectionValidation", label: "Connections" },
  { view: "insightReview", label: "Insights" },
  { view: "curationSummary", label: "Summary" },
];

export const stepIndex = (view) => CURATION_STEPS.findIndex(s => s.view === view);

const StepButton = ({ step, n, state, onClick, mobile }) => {
  const current = state === "current";
  const done = state === "done";
  const color = current ? C.gold : done ? C.green : white(0.55);
  return (
    <button
      onClick={onClick}
      aria-current={current ? "step" : undefined}
      aria-label={`Step ${n}: ${step.label}${done ? " (done)" : ""}`}
      style={{
        display: "flex", alignItems: "center", gap: SPACE.sm, width: "100%",
        background: current ? alpha(C.gold, 0.08) : "transparent",
        border: `1px solid ${current ? alpha(C.gold, 0.3) : "transparent"}`,
        borderRadius: 8, padding: `${SPACE.xs + 2}px ${mobile ? SPACE.xs : SPACE.sm}px`,
        cursor: current ? "default" : "pointer", justifyContent: "center",
      }}
    >
      <span aria-hidden="true" style={{
        width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontFamily: MONO, fontSize: TYPE.xs, fontWeight: 700,
        color: current ? C.bg0 : color,
        background: current ? C.gold : done ? alpha(C.green, 0.12) : "transparent",
        border: `1px solid ${current ? C.gold : done ? alpha(C.green, 0.4) : white(0.25)}`,
      }}>
        {done ? "✓" : n}
      </span>
      {!mobile && (
        <span style={{ fontFamily: BODY, fontSize: TYPE.sm, fontWeight: current ? 600 : 500, color }}>{step.label}</span>
      )}
    </button>
  );
};

// The rail, title and lede. `view` is the current step; `onNavigate(view)`
// moves to another step or, with "dashboard", leaves the run.
export const CurationHeader = ({ view, title, accent, lede, onNavigate, mobile }) => {
  const current = stepIndex(view);
  const step = CURATION_STEPS[current];
  return (
    <header style={{ marginBottom: mobile ? SPACE.xl : SPACE.xxl }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: SPACE.md, marginBottom: SPACE.lg }}>
        <nav aria-label="Curation steps" style={{ flex: 1, minWidth: 0 }}>
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: `repeat(${CURATION_STEPS.length}, 1fr)`, gap: SPACE.xs }}>
            {CURATION_STEPS.map((s, i) => (
              <li key={s.view}>
                <StepButton
                  step={s} n={i + 1} mobile={mobile}
                  state={i === current ? "current" : i < current ? "done" : "todo"}
                  onClick={() => { if (i !== current) onNavigate?.(s.view); }}
                />
              </li>
            ))}
          </ol>
        </nav>
        <button onClick={() => onNavigate?.("dashboard")} style={{
          fontFamily: BODY, fontSize: TYPE.sm, color: white(0.6), background: "none", border: "none",
          cursor: "pointer", padding: `${SPACE.xs}px 0`, textDecoration: "underline", textUnderlineOffset: 3, flexShrink: 0,
        }}>
          {mobile ? "Skip" : "Skip to the atlas"}
        </button>
      </div>
      <div style={{ fontFamily: MONO, fontSize: TYPE.xs, color: alpha(C.gold, 0.8), letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: SPACE.sm }}>
        Curation · step {current + 1} of {CURATION_STEPS.length}{step ? ` · ${step.label}` : ""}
      </div>
      <h1 style={{ fontFamily: FONTS, fontSize: mobile ? TYPE.xxl : 34, fontWeight: 800, color: C.white, lineHeight: 1.15, letterSpacing: "-0.02em", margin: 0 }}>
        {title}{accent && <> <span style={{ color: C.gold }}>{accent}</span></>}
      </h1>
      {lede && <p style={{ fontFamily: BODY, fontSize: mobile ? TYPE.base : TYPE.md, color: white(0.55), lineHeight: 1.55, margin: `${SPACE.sm}px 0 0`, maxWidth: 680 }}>{lede}</p>}
    </header>
  );
};

// A row of shortcut hints. `keys` is [[key, what], ...]. Hidden on touch
// layouts, where there is no keyboard to hint at.
export const KeyHints = ({ keys, mobile, children }) => {
  if (mobile && !children) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: `${SPACE.xs}px ${SPACE.md}px`, fontFamily: BODY, fontSize: TYPE.xs, color: white(0.5) }}>
      {!mobile && keys.map(([k, what]) => (
        <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: SPACE.xs }}>
          <kbd style={{ fontFamily: MONO, fontSize: TYPE.xs, color: white(0.6), background: white(0.05), border: `1px solid ${white(0.12)}`, borderRadius: 4, padding: "1px 5px" }}>{k}</kbd>
          {what}
        </span>
      ))}
      {children}
    </div>
  );
};
