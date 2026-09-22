import { useState, useEffect, useRef } from "react";
import { STATIONS, stationFor } from '../routes';
import { BODY, MONO, FONTS } from '../styles/base';
import { C, alpha, white, black, SPACE, TEXT } from '../styles/tokens';

// ─── THE SHELL HEADER ────────────────────────────────────────
//
// Three stations (Curate → Atlas → Companion) from the STATIONS registry in
// src/routes.js, the active station's tabs underneath, and the utilities on
// the right: ⌘K, sync status, Export, Tour. Nothing here knows a view id
// that the registry does not.

const utilityButton = (accent, active) => ({
  fontFamily: BODY, fontSize: TEXT.sm, fontWeight: 500,
  color: active ? C.bg0 : accent ? C.gold : white(0.4),
  background: active ? C.gold : accent ? alpha(C.gold, 0.08) : white(0.03),
  border: `1px solid ${active ? C.gold : accent ? alpha(C.gold, 0.2) : white(0.08)}`,
  borderRadius: 8, padding: `7px ${SPACE.md}px`, cursor: "pointer", transition: "all 0.25s",
  display: "flex", alignItems: "center", gap: SPACE.xs + 1, whiteSpace: "nowrap",
});

const Brand = ({ onClick, mobile }) => (
  <button onClick={onClick} title="Overview" aria-label="Atlas overview" style={{
    display: "flex", alignItems: "center", gap: SPACE.sm, background: "transparent", border: "none",
    cursor: "pointer", padding: 0, color: C.white,
  }}>
    <span aria-hidden="true" style={{ fontSize: mobile ? TEXT.lg : TEXT.xl, color: C.gold, lineHeight: 1 }}>◈</span>
    <span style={{ fontFamily: FONTS, fontSize: mobile ? TEXT.lg : TEXT.xl, fontWeight: 700, letterSpacing: "-0.01em" }}>Atlas</span>
  </button>
);

const NewBadge = ({ count, mobile }) => (
  <span style={{
    fontFamily: BODY, fontSize: mobile ? 9 : TEXT.xs, fontWeight: 600,
    color: C.gold, background: alpha(C.gold, 0.1),
    border: `1px solid ${alpha(C.gold, 0.2)}`,
    padding: "3px 8px", borderRadius: 12,
    animation: "freshPulse 2s ease infinite", whiteSpace: "nowrap",
  }}>
    +{count} new
  </span>
);

const SyncButton = ({ isSyncing, onSync, mobile }) => (
  <button data-tour="sync" onClick={onSync} disabled={isSyncing} style={{
    ...utilityButton(true),
    color: isSyncing ? white(0.3) : C.gold,
    background: isSyncing ? white(0.03) : alpha(C.gold, 0.08),
    border: `1px solid ${isSyncing ? white(0.06) : alpha(C.gold, 0.2)}`,
    fontSize: mobile ? TEXT.xs : TEXT.sm,
    padding: mobile ? "7px 10px" : `8px ${SPACE.md + 2}px`,
    cursor: isSyncing ? "default" : "pointer",
  }}>
    <span aria-hidden="true" style={{ display: "inline-block", animation: isSyncing ? "syncSpin 1s linear infinite" : "none" }}>⟳</span>
    {isSyncing ? "Syncing…" : "Sync"}
  </button>
);

const Nav = ({ view, onNavigate, mobile, tablet, lastSyncTime, newCount, isSyncing, onSync, onCmdK, onTour }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const station = stationFor(view);
  const tabs = station?.tabs || [];

  // Close the mobile menu on outside click and on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    const handleKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  const go = (target) => { onNavigate(target); setMenuOpen(false); };

  // ── The station tabs row (shared by every breakpoint) ──
  const tabRow = tabs.length > 1 && (
    <div role="tablist" aria-label={`${station.label} views`} style={{
      display: "flex", gap: mobile ? SPACE.xs : SPACE.sm, justifyContent: mobile ? "flex-start" : "center",
      overflowX: "auto", paddingBottom: 2,
    }}>
      {tabs.map(tab => {
        const active = view === tab.view;
        return (
          <button key={tab.view} role="tab" aria-selected={active} onClick={() => go(tab.view)}
            {...(tab.tour ? { "data-tour": tab.tour } : {})}
            style={{
              fontFamily: BODY, fontSize: mobile ? TEXT.sm : TEXT.md, fontWeight: active ? 600 : 400,
              color: active ? C.gold : white(0.4), background: "transparent",
              border: "none", borderBottom: `2px solid ${active ? C.gold : "transparent"}`,
              padding: mobile ? `6px ${SPACE.sm}px 8px` : `6px ${SPACE.md}px 9px`,
              cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
            }}
          >{tab.label}</button>
        );
      })}
    </div>
  );

  // ── Mobile: brand + sync + menu, tabs underneath ──
  if (mobile) {
    return (
      <header style={{ margin: `0 0 ${SPACE.xl}px`, display: "flex", flexDirection: "column", gap: SPACE.md }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: SPACE.sm }}>
          <Brand onClick={() => go("dashboard")} mobile />
          <div style={{ display: "flex", alignItems: "center", gap: SPACE.xs + 2 }}>
            {!isSyncing && newCount > 0 && <NewBadge count={newCount} mobile />}
            <SyncButton isSyncing={isSyncing} onSync={onSync} mobile />
            <div ref={menuRef} style={{ position: "relative" }}>
              <button data-tour="nav" onClick={() => setMenuOpen(o => !o)} aria-label="Navigation menu" aria-expanded={menuOpen}
                style={{ ...utilityButton(false, menuOpen), padding: "7px 10px", fontSize: TEXT.md }}>
                <span aria-hidden="true">{station ? station.icon : "☰"}</span>
                <span style={{ fontSize: TEXT.sm }}>{station ? station.label : "Menu"}</span>
                <span aria-hidden="true" style={{ fontSize: 9, opacity: 0.6 }}>▾</span>
              </button>
              {menuOpen && (
                <div role="menu" style={{
                  position: "absolute", top: "calc(100% + 6px)", right: 0,
                  background: C.bg3, border: `1px solid ${white(0.1)}`,
                  borderRadius: 12, padding: SPACE.xs, zIndex: 1000,
                  minWidth: 220, boxShadow: `0 12px 40px ${black(0.6)}`,
                }}>
                  {STATIONS.map((s, i) => (
                    <div key={s.id} style={{ borderTop: i ? `1px solid ${white(0.05)}` : "none", paddingTop: i ? SPACE.xs : 0, marginTop: i ? SPACE.xs : 0 }}>
                      <button role="menuitem" onClick={() => go(s.view)} data-tour={s.tour} style={{
                        display: "flex", alignItems: "center", gap: SPACE.sm + 2, width: "100%",
                        fontFamily: BODY, fontSize: TEXT.md, fontWeight: 600,
                        color: station?.id === s.id ? C.bg0 : white(0.7),
                        background: station?.id === s.id ? C.gold : "transparent",
                        border: "none", borderRadius: 8, padding: `10px ${SPACE.md}px`,
                        cursor: "pointer", textAlign: "left",
                      }}>
                        <span aria-hidden="true" style={{ width: 18, textAlign: "center" }}>{s.icon}</span>
                        <span style={{ flex: 1 }}>{s.label}</span>
                        <span style={{ fontFamily: BODY, fontSize: TEXT.xs, fontWeight: 400, opacity: 0.6 }}>{s.hint}</span>
                      </button>
                      {s.tabs.map(tab => (
                        <button key={tab.view} role="menuitem" onClick={() => go(tab.view)} style={{
                          display: "block", width: "100%",
                          fontFamily: BODY, fontSize: TEXT.sm, fontWeight: view === tab.view ? 600 : 400,
                          color: view === tab.view ? C.gold : white(0.45),
                          background: "transparent", border: "none", borderRadius: 6,
                          padding: `7px ${SPACE.md}px 7px ${SPACE.xxl + SPACE.sm}px`,
                          cursor: "pointer", textAlign: "left",
                        }}>{tab.label}</button>
                      ))}
                    </div>
                  ))}
                  <div style={{ borderTop: `1px solid ${white(0.05)}`, marginTop: SPACE.xs, paddingTop: SPACE.xs, display: "flex", gap: SPACE.xs }}>
                    <button role="menuitem" data-tour="export" onClick={() => go("export")} style={{ ...utilityButton(false, view === "export"), flex: 1, justifyContent: "center" }}>↗ Export</button>
                    <button role="menuitem" onClick={() => { setMenuOpen(false); onTour?.(); }} style={{ ...utilityButton(false), flex: 1, justifyContent: "center" }}>? Tour</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {tabRow}
      </header>
    );
  }

  // ── Tablet & desktop: brand | stations | utilities, tabs underneath ──
  return (
    <header style={{ margin: `0 auto ${tablet ? SPACE.xl : SPACE.xxl}px`, display: "flex", flexDirection: "column", gap: SPACE.md }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: SPACE.md }}>
        <Brand onClick={() => go("dashboard")} />

        <nav data-tour="nav" aria-label="Stations" style={{
          display: "flex", gap: 3, padding: 3,
          background: white(0.03), borderRadius: 10,
          border: `1px solid ${white(0.06)}`,
        }}>
          {STATIONS.map(s => {
            const active = station?.id === s.id;
            return (
              <button key={s.id} onClick={() => go(s.view)} data-tour={s.tour} title={s.hint} aria-current={active ? "page" : undefined}
                style={{
                  fontFamily: BODY, fontSize: TEXT.md, fontWeight: active ? 600 : 400,
                  color: active ? C.bg0 : white(0.45),
                  background: active ? C.gold : "transparent",
                  border: "none", borderRadius: 8,
                  padding: tablet ? `9px ${SPACE.lg}px` : `10px ${SPACE.xl}px`,
                  cursor: "pointer", transition: "all 0.25s", whiteSpace: "nowrap",
                  display: "flex", alignItems: "center", gap: SPACE.sm,
                }}
              >
                <span aria-hidden="true" style={{ fontSize: TEXT.lg, lineHeight: 1 }}>{s.icon}</span>
                {s.label}
              </button>
            );
          })}
        </nav>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: SPACE.sm }}>
          {!tablet && onCmdK && (
            <button data-tour="cmd-k" onClick={onCmdK} title="Search (⌘K)" style={{
              fontFamily: MONO, fontSize: TEXT.xs, color: white(0.25),
              background: white(0.03), border: `1px solid ${white(0.08)}`,
              borderRadius: 6, padding: "6px 10px", cursor: "pointer", transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: SPACE.xs + 1,
            }}>
              <span aria-hidden="true" style={{ fontSize: TEXT.sm }}>⌕</span>
              <span style={{ color: white(0.15) }}>⌘K</span>
            </button>
          )}
          {!tablet && !isSyncing && lastSyncTime && (
            <span style={{ fontFamily: MONO, fontSize: TEXT.xs, color: white(0.2), whiteSpace: "nowrap" }}>Synced {lastSyncTime}</span>
          )}
          {!isSyncing && newCount > 0 && <NewBadge count={newCount} />}
          <SyncButton isSyncing={isSyncing} onSync={onSync} />
          <button data-tour="export" onClick={() => go("export")} title="Export & share" aria-current={view === "export" ? "page" : undefined}
            style={utilityButton(false, view === "export")}>
            <span aria-hidden="true">↗</span>{!tablet && "Export"}
          </button>
          {onTour && (
            <button onClick={onTour} title="Take the guided tour" aria-label="Guided tour" style={{ ...utilityButton(false), padding: "7px 10px", fontFamily: MONO }}>?</button>
          )}
        </div>
      </div>
      {tabRow}
    </header>
  );
};

export default Nav;
