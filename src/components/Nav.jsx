import { useState, useEffect, useRef } from "react";
import { BODY, MONO } from '../styles/base';

const Nav = ({ view, onNavigate, mobile, tablet, lastSyncTime, newCount, isSyncing, onSync, onCmdK }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const tabs = [
    { id: "dashboard", label: "Overview", icon: "◈" },
    { id: "companion", label: "Companion", icon: "◆", tour: "companion-tab" },
    { id: "connections", label: "Connections", icon: "◎" },
    { id: "evolution", label: "Evolution", icon: "◇" },
    { id: "beliefDiffs", label: "Belief Diffs", icon: "⇄", tour: "belief-diffs-tab" },
    { id: "digest", label: "Digest", icon: "📅", tour: "digest-tab" },
    { id: "search", label: "Search", icon: "⌕" },
    { id: "export", label: "Export", icon: "↗" },
  ];

  const activeTab = tabs.find(t => t.id === view) || tabs[0];

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  // Close menu on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const handleKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [menuOpen]);

  // ── Mobile: hamburger + dropdown ──
  if (mobile) {
    return (
      <div style={{ margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          {/* Hamburger + active tab label */}
          <div ref={menuRef} style={{ position: "relative" }}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Navigation menu"
              aria-expanded={menuOpen}
              role="button"
              tabIndex={0}
              style={{
                fontFamily: BODY, fontSize: 13, fontWeight: 600,
                color: "#FBBF24", background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10,
                padding: "10px 14px", cursor: "pointer", transition: "all 0.25s",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1, transition: "transform 0.2s", transform: menuOpen ? "rotate(90deg)" : "none" }}>☰</span>
              <span>{activeTab.icon} {activeTab.label}</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginLeft: 2 }}>▾</span>
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 6px)", left: 0,
                background: "#141418", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12, padding: 4, zIndex: 1000,
                minWidth: 200, boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
              }}>
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { onNavigate(tab.id); setMenuOpen(false); }}
                    {...(tab.tour ? { "data-tour": tab.tour } : {})}
                    role="menuitem"
                    style={{
                      display: "flex", alignItems: "center", gap: 10, width: "100%",
                      fontFamily: BODY, fontSize: 13, fontWeight: view === tab.id ? 600 : 400,
                      color: view === tab.id ? "#08080C" : "rgba(255,255,255,0.5)",
                      background: view === tab.id ? "#FBBF24" : "transparent",
                      border: "none", borderRadius: 8, padding: "11px 14px",
                      cursor: "pointer", transition: "all 0.15s", textAlign: "left",
                    }}
                  >
                    <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right controls — compact on mobile */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {!isSyncing && newCount > 0 && (
              <span style={{
                fontFamily: BODY, fontSize: 9, fontWeight: 600,
                color: "#FBBF24", background: "rgba(251,191,36,0.1)",
                border: "1px solid rgba(251,191,36,0.2)",
                padding: "3px 8px", borderRadius: 12,
                animation: "freshPulse 2s ease infinite",
              }}>
                +{newCount} new
              </span>
            )}
            <button data-tour="sync" onClick={onSync} disabled={isSyncing}
              style={{
                fontFamily: BODY, fontSize: 10, fontWeight: 500,
                color: isSyncing ? "rgba(255,255,255,0.3)" : "#FBBF24",
                background: isSyncing ? "rgba(255,255,255,0.03)" : "rgba(251,191,36,0.08)",
                border: `1px solid ${isSyncing ? "rgba(255,255,255,0.06)" : "rgba(251,191,36,0.2)"}`,
                borderRadius: 8, padding: "7px 10px",
                cursor: isSyncing ? "default" : "pointer", transition: "all 0.25s",
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              <span style={{ display: "inline-block", animation: isSyncing ? "syncSpin 1s linear infinite" : "none" }}>⟳</span>
              {isSyncing ? "Syncing…" : "Sync"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Tablet & Desktop ──
  const iconOnly = tablet;
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      margin: "0 auto 36px", gap: 12, flexWrap: "nowrap",
    }}>
      <nav data-tour="nav" style={{
        display: "flex", gap: 3, padding: 3,
        background: "rgba(255,255,255,0.03)", borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
      }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => onNavigate(tab.id)}
            {...(tab.tour ? { "data-tour": tab.tour } : {})}
            title={iconOnly ? tab.label : undefined}
            style={{
              fontFamily: BODY, fontSize: iconOnly ? 15 : 13, fontWeight: view === tab.id ? 600 : 400,
              color: view === tab.id ? "#08080C" : "rgba(255,255,255,0.4)",
              background: view === tab.id ? "#FBBF24" : "transparent",
              border: "none", borderRadius: 8,
              padding: iconOnly ? "9px 12px" : "10px 20px",
              cursor: "pointer", transition: "all 0.25s", whiteSpace: "nowrap",
            }}
          >{iconOnly ? tab.icon : `${tab.icon} ${tab.label}`}</button>
        ))}
      </nav>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        {!tablet && onCmdK && (
          <button data-tour="cmd-k" onClick={onCmdK} style={{
            fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.25)",
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 6, padding: "5px 10px", cursor: "pointer", transition: "all 0.2s",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <span style={{ fontSize: 11 }}>⌕</span>
            <span style={{ color: "rgba(255,255,255,0.15)" }}>⌘K</span>
          </button>
        )}
        {!tablet && !isSyncing && lastSyncTime && (
          <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
            Synced {lastSyncTime}
          </span>
        )}
        {!isSyncing && newCount > 0 && (
          <span style={{
            fontFamily: BODY, fontSize: 10, fontWeight: 600,
            color: "#FBBF24", background: "rgba(251,191,36,0.1)",
            border: "1px solid rgba(251,191,36,0.2)",
            padding: "3px 8px", borderRadius: 12,
            animation: "freshPulse 2s ease infinite",
          }}>
            +{newCount} new
          </span>
        )}
        <button data-tour="sync" onClick={onSync} disabled={isSyncing}
          style={{
            fontFamily: BODY, fontSize: 11, fontWeight: 500,
            color: isSyncing ? "rgba(255,255,255,0.3)" : "#FBBF24",
            background: isSyncing ? "rgba(255,255,255,0.03)" : "rgba(251,191,36,0.08)",
            border: `1px solid ${isSyncing ? "rgba(255,255,255,0.06)" : "rgba(251,191,36,0.2)"}`,
            borderRadius: 8, padding: "8px 14px",
            cursor: isSyncing ? "default" : "pointer", transition: "all 0.25s",
            display: "flex", alignItems: "center", gap: 5,
          }}
        >
          <span style={{ display: "inline-block", animation: isSyncing ? "syncSpin 1s linear infinite" : "none" }}>⟳</span>
          {isSyncing ? "Syncing…" : "Sync"}
        </button>
      </div>
    </div>
  );
};

export default Nav;
