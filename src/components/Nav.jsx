import { useState, useEffect, useRef } from "react";
import { C, alpha, white, black, FONTS, BODY, MONO, SPACE, TYPE } from '../styles/tokens';
import useStore from '../store';

// The shell's top bar: wordmark, the three stations, and the actions.
//
// Stations are the v6 loop (Curate -> Atlas -> Companion). A station with
// pages shows them as a second row when it is active. Search and Export are
// actions, not destinations, so they live on the right with Sync and Tour.
export const STATIONS = [
  {
    id: "atlas", label: "Atlas", icon: "◈", home: "dashboard",
    pages: [
      { id: "dashboard", label: "Overview" },
      { id: "connections", label: "Connections" },
      { id: "evolution", label: "Evolution" },
    ],
  },
  { id: "curate", label: "Curate", icon: "◇", home: "curation", pages: [] },
  {
    id: "companion", label: "Companion", icon: "◆", home: "companion", tour: "companion-tab",
    pages: [
      { id: "companion", label: "Ask" },
      { id: "beliefDiffs", label: "Belief Diffs", tour: "belief-diffs-tab" },
      { id: "digest", label: "Digest", tour: "digest-tab" },
      { id: "liveCapture", label: "Live" },
    ],
  },
];

const STATION_OF_VIEW = {
  dashboard: "atlas", connections: "atlas", evolution: "atlas",
  timeline: "atlas", conversation: "atlas", archaeology: "atlas", export: "atlas",
  curation: "curate", topicCuration: "curate", connectionValidation: "curate", insightReview: "curate", curationSummary: "curate",
  companion: "companion", beliefDiffs: "companion", digest: "companion", liveCapture: "companion",
};

export const stationFor = (view) => STATIONS.find(s => s.id === STATION_OF_VIEW[view]) || STATIONS[0];

const ACTION_BUTTON = {
  fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 500, color: white(0.45),
  background: white(0.03), border: `1px solid ${white(0.08)}`, borderRadius: 8,
  padding: `${SPACE.sm}px ${SPACE.md}px`, cursor: "pointer", transition: "all 0.2s",
  display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
};

const Wordmark = ({ onClick, compact }) => (
  <button onClick={onClick} aria-label="Atlas home" style={{
    display: "flex", alignItems: "center", gap: SPACE.sm, background: "none", border: "none",
    cursor: "pointer", padding: 0, flexShrink: 0,
  }}>
    <span style={{ fontSize: compact ? 18 : 20, lineHeight: 1 }}>🧠</span>
    <span style={{ fontFamily: FONTS, fontSize: compact ? TYPE.lg : TYPE.xl, fontWeight: 700, color: C.white, letterSpacing: "-0.01em" }}>Atlas</span>
    {!compact && <span style={{ fontFamily: BODY, fontSize: TYPE.xs, color: white(0.25), letterSpacing: "0.12em", textTransform: "uppercase", marginLeft: SPACE.xs }}>Your mind, mapped</span>}
  </button>
);

const SyncButton = ({ isSyncing, onSync, size = TYPE.sm }) => (
  <button data-tour="sync" onClick={onSync} disabled={isSyncing} style={{
    ...ACTION_BUTTON, fontSize: size,
    color: isSyncing ? white(0.3) : C.gold,
    background: isSyncing ? white(0.03) : alpha(C.gold, 0.08),
    border: `1px solid ${isSyncing ? white(0.06) : alpha(C.gold, 0.2)}`,
    cursor: isSyncing ? "default" : "pointer",
  }}>
    <span style={{ display: "inline-block", animation: isSyncing ? "syncSpin 1s linear infinite" : "none" }}>⟳</span>
    {isSyncing ? "Syncing…" : "Sync"}
  </button>
);

const NewChip = ({ count }) => (
  <span style={{
    fontFamily: BODY, fontSize: TYPE.xs, fontWeight: 600, color: C.gold,
    background: alpha(C.gold, 0.1), border: `1px solid ${alpha(C.gold, 0.2)}`,
    padding: `3px ${SPACE.sm}px`, borderRadius: 12, animation: "freshPulse 2s ease infinite", whiteSpace: "nowrap",
  }}>+{count} new</span>
);

// Privacy mode's switch (#86): deliberately quiet, a glyph among the actions,
// so turning it on does not announce to a viewer that something is hidden.
// The owner's cue is the half-moon turning over and a small dot.
const PrivacyToggle = ({ on, onToggle }) => (
  <button onClick={onToggle} aria-pressed={on} aria-label="Privacy mode (Alt+Shift+P)" title="Privacy mode (Alt+Shift+P)" style={{
    ...ACTION_BUTTON, position: "relative", fontSize: TYPE.sm, color: white(0.3), padding: `${SPACE.sm}px ${SPACE.sm + 2}px`,
  }}>
    <span aria-hidden="true">{on ? "◑" : "◐"}</span>
    {on && <span aria-hidden="true" style={{ position: "absolute", top: 5, right: 5, width: 4, height: 4, borderRadius: 2, background: alpha(C.gold, 0.7) }} />}
  </button>
);

const Nav = ({ view, onNavigate, mobile, tablet, lastSyncTime, newCount, isSyncing, onSync, onCmdK, onExport, onTour }) => {
  const privacy = useStore(s => s.privacy);
  const togglePrivacy = useStore(s => s.togglePrivacy);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const station = stationFor(view);
  const pages = station.pages;

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [menuOpen]);

  const go = (id) => { onNavigate(id); setMenuOpen(false); };

  // ── Mobile: wordmark, sync, and one menu holding stations + pages + actions ──
  if (mobile) {
    return (
      <header style={{ marginBottom: SPACE.xl, display: "flex", flexDirection: "column", gap: SPACE.md }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: SPACE.sm }}>
          <Wordmark compact onClick={() => go("dashboard")} />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {!isSyncing && newCount > 0 && <NewChip count={newCount} />}
            <SyncButton isSyncing={isSyncing} onSync={onSync} size={TYPE.xs} />
            <div ref={menuRef} style={{ position: "relative" }}>
              <button data-tour="nav" onClick={() => setMenuOpen(o => !o)} aria-label="Navigation menu" aria-expanded={menuOpen} style={{
                ...ACTION_BUTTON, color: C.gold, fontWeight: 600, padding: `${SPACE.sm}px ${SPACE.md}px`,
              }}>
                <span style={{ fontSize: 16, lineHeight: 1 }}>☰</span>
                <span>{station.icon} {station.label}</span>
              </button>
              {menuOpen && (
                <div role="menu" style={{
                  position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 1000, minWidth: 220,
                  background: C.bg3, border: `1px solid ${white(0.1)}`, borderRadius: 12, padding: SPACE.xs,
                  boxShadow: `0 12px 40px ${black(0.6)}`,
                }}>
                  {STATIONS.map(s => (
                    <div key={s.id}>
                      <button role="menuitem" onClick={() => go(s.home)} {...(s.tour ? { "data-tour": s.tour } : {})} style={{
                        display: "flex", alignItems: "center", gap: SPACE.md, width: "100%", textAlign: "left",
                        fontFamily: BODY, fontSize: TYPE.base, fontWeight: 600,
                        color: s.id === station.id ? C.bg0 : white(0.7),
                        background: s.id === station.id ? C.gold : "transparent",
                        border: "none", borderRadius: 8, padding: `${SPACE.md}px ${SPACE.lg}px`, cursor: "pointer",
                      }}>
                        <span style={{ width: 18, textAlign: "center" }}>{s.icon}</span>{s.label}
                      </button>
                      {s.pages.map(p => (
                        <button key={p.id} role="menuitem" onClick={() => go(p.id)} {...(p.tour ? { "data-tour": p.tour } : {})} style={{
                          display: "block", width: "100%", textAlign: "left",
                          fontFamily: BODY, fontSize: TYPE.sm, fontWeight: view === p.id ? 600 : 400,
                          color: view === p.id ? C.gold : white(0.45),
                          background: "transparent", border: "none", padding: `${SPACE.sm}px ${SPACE.lg}px ${SPACE.sm}px ${SPACE.xxxl}px`, cursor: "pointer",
                        }}>{p.label}</button>
                      ))}
                    </div>
                  ))}
                  <div style={{ borderTop: `1px solid ${white(0.06)}`, margin: `${SPACE.xs}px 0` }} />
                  {[["search", "⌕", "Search"], ["export", "↗", "Export"]].map(([id, icon, label]) => (
                    <button key={id} role="menuitem" onClick={() => { if (id === "search") { setMenuOpen(false); onCmdK?.(); } else go(id); }} style={{
                      display: "flex", alignItems: "center", gap: SPACE.md, width: "100%", textAlign: "left",
                      fontFamily: BODY, fontSize: TYPE.base, color: white(0.55), background: "transparent",
                      border: "none", borderRadius: 8, padding: `${SPACE.md}px ${SPACE.lg}px`, cursor: "pointer",
                    }}><span style={{ width: 18, textAlign: "center" }}>{icon}</span>{label}</button>
                  ))}
                  <button role="menuitemcheckbox" aria-checked={privacy} onClick={() => { togglePrivacy(); setMenuOpen(false); }} style={{
                    display: "flex", alignItems: "center", gap: SPACE.md, width: "100%", textAlign: "left",
                    fontFamily: BODY, fontSize: TYPE.base, color: white(0.55), background: "transparent",
                    border: "none", borderRadius: 8, padding: `${SPACE.md}px ${SPACE.lg}px`, cursor: "pointer",
                  }}><span aria-hidden="true" style={{ width: 18, textAlign: "center" }}>{privacy ? "◑" : "◐"}</span>Privacy mode{privacy ? " · on" : ""}</button>
                </div>
              )}
            </div>
          </div>
        </div>
        {pages.length > 1 && (
          <nav aria-label={`${station.label} pages`} style={{ display: "flex", gap: SPACE.xs, overflowX: "auto" }}>
            {pages.map(p => <PageTab key={p.id} page={p} active={view === p.id} onClick={() => go(p.id)} />)}
          </nav>
        )}
      </header>
    );
  }

  // ── Tablet & desktop ──
  return (
    <header style={{ marginBottom: SPACE.xl }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: SPACE.md }}>
        <Wordmark compact={tablet} onClick={() => go("dashboard")} />

        <nav data-tour="nav" aria-label="Stations" style={{
          display: "flex", gap: 3, padding: 3, background: white(0.03), borderRadius: 10, border: `1px solid ${white(0.06)}`, flexShrink: 0,
        }}>
          {STATIONS.map(s => {
            const active = s.id === station.id;
            return (
              <button key={s.id} onClick={() => go(s.home)} aria-current={active ? "page" : undefined}
                {...(s.tour ? { "data-tour": s.tour } : {})} style={{
                  fontFamily: BODY, fontSize: TYPE.base, fontWeight: active ? 600 : 500,
                  color: active ? C.bg0 : white(0.5), background: active ? C.gold : "transparent",
                  border: "none", borderRadius: 8, padding: `${SPACE.sm + 1}px ${tablet ? SPACE.md : SPACE.xl}px`,
                  cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6,
                }}>
                <span style={{ fontSize: TYPE.xs, opacity: active ? 0.7 : 0.5 }}>{s.icon}</span>{s.label}
              </button>
            );
          })}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: SPACE.sm, flexShrink: 0 }}>
          {onCmdK && (
            <button data-tour="cmd-k" onClick={onCmdK} title="Search (⌘K)" aria-label="Search (⌘K)" style={{ ...ACTION_BUTTON, fontFamily: MONO, fontSize: TYPE.xs, color: white(0.3) }}>
              <span style={{ fontSize: TYPE.sm }}>⌕</span>{!tablet && <span style={{ color: white(0.18) }}>⌘K</span>}
            </button>
          )}
          <PrivacyToggle on={privacy} onToggle={togglePrivacy} />
          {!tablet && !isSyncing && lastSyncTime && (
            <span style={{ fontFamily: MONO, fontSize: TYPE.xs, color: white(0.2), whiteSpace: "nowrap" }}>Synced {lastSyncTime}</span>
          )}
          {!isSyncing && newCount > 0 && <NewChip count={newCount} />}
          <SyncButton isSyncing={isSyncing} onSync={onSync} />
          {onExport && (
            <button data-tour="export" onClick={onExport} title="Export" aria-current={view === "export" ? "page" : undefined} style={{
              ...ACTION_BUTTON, color: view === "export" ? C.gold : white(0.45),
              border: `1px solid ${view === "export" ? alpha(C.gold, 0.3) : white(0.08)}`,
            }}><span>↗</span>{!tablet && "Export"}</button>
          )}
          {onTour && (
            <button onClick={onTour} title="Take the guided tour" style={ACTION_BUTTON}><span>🗺️</span>{!tablet && "Tour"}</button>
          )}
        </div>
      </div>

      {pages.length > 1 && (
        <nav aria-label={`${station.label} pages`} style={{ display: "flex", gap: SPACE.xs, marginTop: SPACE.md, borderBottom: `1px solid ${white(0.06)}` }}>
          {pages.map(p => <PageTab key={p.id} page={p} active={view === p.id} onClick={() => go(p.id)} />)}
        </nav>
      )}
    </header>
  );
};

const PageTab = ({ page, active, onClick }) => (
  <button onClick={onClick} aria-current={active ? "page" : undefined} {...(page.tour ? { "data-tour": page.tour } : {})} style={{
    fontFamily: BODY, fontSize: TYPE.base, fontWeight: active ? 600 : 400,
    color: active ? C.gold : white(0.4), background: "transparent", border: "none",
    borderBottom: `2px solid ${active ? C.gold : "transparent"}`, marginBottom: -1,
    padding: `${SPACE.sm}px ${SPACE.md}px`, cursor: "pointer", transition: "color 0.2s", whiteSpace: "nowrap",
  }}>{page.label}</button>
);

export default Nav;
