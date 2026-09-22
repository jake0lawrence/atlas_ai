import {
  COMPANION_SIDEBAR_SUGGESTIONS,
} from '../data/constants';
import { BODY, MONO } from '../styles/base';

// ─── COMPANION SIDEBAR ──────────────────────────────────────

const CompanionSidebar = ({ isOpen, onToggle, view, onNavigate, mobile }) => {
  const suggestions = COMPANION_SIDEBAR_SUGGESTIONS[view] || COMPANION_SIDEBAR_SUGGESTIONS.dashboard;
  const sidebarWidth = mobile ? 260 : 300;

  return (
    <>
      {/* Minimized toggle button — always visible */}
      <div
        data-tour="companion-sidebar"
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}
        title={isOpen ? "Close companion (⌘/)" : "Open companion (⌘/)"}
        style={{
          position: "fixed", right: isOpen ? sidebarWidth : 0, top: "50%", transform: "translateY(-50%)",
          zIndex: 1100, width: 36, height: 64, borderRadius: "8px 0 0 8px",
          background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", borderRight: "none",
          cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
          transition: "right 0.3s cubic-bezier(0.4,0,0.2,1), background 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(251,191,36,0.18)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(251,191,36,0.1)"; }}
      >
        <span style={{ fontSize: 14 }}>{isOpen ? "›" : "‹"}</span>
        {!isOpen && (
          <span style={{
            fontFamily: MONO, fontSize: 9, fontWeight: 600, color: "#FBBF24",
            background: "rgba(251,191,36,0.15)", borderRadius: 6, width: 18, height: 18,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{suggestions.length}</span>
        )}
      </div>

      {/* Sidebar panel */}
      <div style={{
        position: "fixed", right: 0, top: 0, bottom: 0, width: sidebarWidth, zIndex: 1099,
        background: "rgba(8,8,12,0.97)", borderLeft: "1px solid rgba(255,255,255,0.06)",
        transform: isOpen ? "translateX(0)" : `translateX(${sidebarWidth}px)`,
        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontFamily: BODY, fontSize: 11, color: "rgba(251,191,36,0.5)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600, marginBottom: 2 }}>Companion</div>
            <div style={{ fontFamily: BODY, fontSize: 10, color: "rgba(255,255,255,0.2)" }}>{suggestions.length} suggestions for this view</div>
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={onToggle}
            onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}
            style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.04)", borderRadius: 4, padding: "3px 6px", cursor: "pointer" }}
          >⌘/</div>
        </div>

        {/* Suggestion cards */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {suggestions.map((s, i) => (
            <div key={s.id} style={{
              background: "rgba(255,255,255,0.025)", border: `1px solid ${s.accent}22`,
              borderRadius: 10, padding: "14px 14px 10px", borderLeft: `3px solid ${s.accent}`,
              animation: `fadeUp 0.35s ${i * 0.08}s both`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                <span style={{ fontSize: 14 }}>{s.icon}</span>
                <span style={{ fontFamily: BODY, fontSize: 12, fontWeight: 600, color: s.accent }}>{s.title}</span>
              </div>
              <div style={{ fontFamily: BODY, fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.55, marginBottom: 10 }}>{s.description}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {s.actions.map((action) => (
                  <button key={action} onClick={() => {
                    if (action === "Ask Atlas" || action === "Ask this") onNavigate("companion");
                    else if (action === "View diff") onNavigate("beliefDiffs");
                    else if (action === "View timeline") onNavigate("timeline");
                    else if (action === "View connection" || action === "View connections") onNavigate("connections");
                    else if (action === "Brief me") onNavigate("companion");
                  }} style={{
                    fontFamily: BODY, fontSize: 10, fontWeight: 500, color: s.accent,
                    background: `${s.accent}10`, border: `1px solid ${s.accent}25`,
                    borderRadius: 6, padding: "4px 10px", cursor: "pointer", transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${s.accent}20`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${s.accent}10`; }}
                  >{action}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CompanionSidebar;
