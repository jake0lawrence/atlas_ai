import { COMPANION_SIDEBAR_SUGGESTIONS, TOPICS } from '../data/constants';
import { C, alpha, white, black, BODY, MONO, SPACE, TYPE } from '../styles/tokens';

// ─── The suggestions, as data ───────────────────────────────────
// The suggestions for a view, or the overview's when it has none of its own
// (then `general` is true and the header says so rather than claiming they
// are about this page).
export const suggestionsFor = (view) => COMPANION_SIDEBAR_SUGGESTIONS[view]
  ? { list: COMPANION_SIDEBAR_SUGGESTIONS[view], general: false }
  : { list: COMPANION_SIDEBAR_SUGGESTIONS.dashboard, general: true };

// Where an action goes, or null when it names the topic on screen and there
// is none (the action is then left out, not shown dead).
export const resolveAction = (action, currentTopic) => {
  if (action.view) return { kind: "view", id: action.view };
  const id = (action.topic || action.brief) === "current" ? currentTopic?.id : (action.topic || action.brief);
  const topic = TOPICS.find(t => t.id === id);
  if (!topic) return null;
  return { kind: action.brief ? "brief" : "topic", topic };
};

const reducedMotion = () => Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

// ─── The sidebar ────────────────────────────────────────────────
const CompanionSidebar = ({ isOpen, onToggle, view, onNavigate, onTopicClick, onBriefMe, currentTopic, mobile }) => {
  const { list, general } = suggestionsFor(view);
  const width = mobile ? 280 : 320;
  const ease = reducedMotion() ? "none" : "cubic-bezier(0.4,0,0.2,1)";
  const slide = ease === "none" ? "none" : `transform 0.3s ${ease}, visibility 0.3s`;

  const act = (target) => {
    if (target.kind === "view") onNavigate?.(target.id);
    else if (target.kind === "topic") onTopicClick?.(target.topic);
    else onBriefMe?.(target.topic);
    if (mobile) onToggle();
  };

  return (
    <>
      <button
        data-tour="companion-sidebar"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls="companion-sidebar"
        aria-label={isOpen ? "Close the companion (⌘/)" : `Open the companion: ${list.length} suggestions (⌘/)`}
        title={isOpen ? "Close companion (⌘/)" : "Open companion (⌘/)"}
        style={{
          position: "fixed", right: isOpen ? width : 0, top: "50%", transform: "translateY(-50%)", zIndex: 1100,
          // The tab sits on every page; it keeps its v6 look so no other baseline moves.
          width: 36, height: 64, borderRadius: "8px 0 0 8px", padding: 0, font: "inherit", color: "inherit",
          background: alpha(C.gold, 0.1), border: `1px solid ${alpha(C.gold, 0.2)}`, borderRight: "none",
          cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: SPACE.xs,
          transition: ease === "none" ? "none" : `right 0.3s ${ease}`,
        }}>
        <span aria-hidden="true" style={{ fontSize: 14 }}>{isOpen ? "›" : "‹"}</span>
        {!isOpen && (
          <span aria-hidden="true" style={{
            fontFamily: MONO, fontSize: 9, fontWeight: 600, color: C.gold, background: alpha(C.gold, 0.15),
            borderRadius: 6, width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
          }}>{list.length}</span>
        )}
      </button>

      <aside id="companion-sidebar" aria-label="Companion" aria-hidden={!isOpen} style={{
        position: "fixed", right: 0, top: 0, bottom: 0, width, zIndex: 1099,
        background: C.bg1, borderLeft: `1px solid ${white(0.1)}`, boxShadow: isOpen ? `-12px 0 40px ${black(0.4)}` : "none",
        transform: isOpen ? "translateX(0)" : `translateX(${width}px)`, visibility: isOpen ? "visible" : "hidden",
        transition: slide, display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: `${SPACE.xl}px ${SPACE.lg}px ${SPACE.md}px`, borderBottom: `1px solid ${white(0.08)}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: SPACE.md }}>
          <div>
            <h2 style={{ fontFamily: BODY, fontSize: TYPE.sm, color: C.gold, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, margin: 0 }}>Companion</h2>
            <p style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.6), margin: `${SPACE.xs}px 0 0` }}>
              {general ? `${list.length} suggestions from your overview` : `${list.length} suggestions for this page`}
            </p>
          </div>
          <button onClick={onToggle} aria-label="Close the companion" style={{ fontFamily: MONO, fontSize: TYPE.xs, color: white(0.7), background: white(0.05), border: `1px solid ${white(0.14)}`, borderRadius: 6, padding: `3px ${SPACE.sm}px`, cursor: "pointer" }}>esc ⌘/</button>
        </div>

        <ul style={{ flex: 1, overflowY: "auto", listStyle: "none", margin: 0, padding: SPACE.md, display: "flex", flexDirection: "column", gap: SPACE.md }}>
          {list.map(s => {
            const actions = s.actions.map(a => [a, resolveAction(a, currentTopic)]).filter(([, t]) => t);
            return (
              <li key={s.id} style={{ background: white(0.03), border: `1px solid ${alpha(s.accent, 0.25)}`, borderLeft: `3px solid ${s.accent}`, borderRadius: 10, padding: SPACE.md }}>
                <h3 style={{ display: "flex", alignItems: "center", gap: SPACE.sm, fontFamily: BODY, fontSize: TYPE.base, fontWeight: 700, color: C.white, margin: `0 0 ${SPACE.xs + 2}px` }}>
                  <span aria-hidden="true">{s.icon}</span>{s.title}
                </h3>
                <p style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.7), lineHeight: 1.55, margin: `0 0 ${SPACE.md}px` }}>{s.description}</p>
                <div style={{ display: "flex", gap: SPACE.sm, flexWrap: "wrap" }}>
                  {actions.map(([a, target]) => (
                    <button key={a.label} onClick={() => act(target)} style={{
                      fontFamily: BODY, fontSize: TYPE.xs, fontWeight: 600, color: s.accent,
                      background: alpha(s.accent, 0.08), border: `1px solid ${alpha(s.accent, 0.35)}`,
                      borderRadius: 6, padding: `${SPACE.xs}px ${SPACE.md - 2}px`, cursor: "pointer",
                    }}>{a.label}{target.kind === "brief" && target.topic.id !== currentTopic?.id ? `: ${target.topic.name}` : ""}</button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </aside>
    </>
  );
};

export default CompanionSidebar;
