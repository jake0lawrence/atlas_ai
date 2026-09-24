import { C, alpha, white, black, BODY, SPACE, TYPE } from '../styles/tokens';

// The sync's progress, bottom right while it runs. A status region, so a
// screen reader hears each phase without the panel taking focus.
export const SYNC_PHASES = ["connecting", "downloading", "processing", "complete"];

export const phaseLabels = (newCount) => ({
  connecting: "Connecting to your chat history",
  downloading: `Fetching ${newCount} new conversations`,
  processing: "Sorting them into topics",
  complete: "Sync complete",
});

const SyncOverlay = ({ isSyncing, syncPhase, syncProgress, newCount, mobile }) => {
  if (!isSyncing) return null;
  const labels = phaseLabels(newCount);
  const at = SYNC_PHASES.indexOf(syncPhase);
  const done = syncPhase === "complete";
  return (
    <div role="status" aria-live="polite" aria-label="Sync progress" style={{
      position: "fixed", bottom: mobile ? SPACE.lg : SPACE.xl, right: mobile ? SPACE.lg : SPACE.xl, zIndex: 1000,
      width: mobile ? "calc(100vw - 32px)" : 300, maxWidth: 300,
      background: C.bg1, border: `1px solid ${alpha(done ? C.green : C.gold, 0.35)}`, borderRadius: 14,
      padding: `${SPACE.lg}px ${SPACE.lg + 2}px`, boxShadow: `0 8px 32px ${black(0.5)}`,
    }}>
      <div style={{ fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 700, color: white(0.85), marginBottom: SPACE.sm + 2 }}>Syncing</div>
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: SPACE.xs + 2 }}>
        {SYNC_PHASES.map((p, i) => {
          const state = i < at || done ? "done" : i === at ? "now" : "next";
          return (
            <li key={p} aria-current={state === "now" ? "step" : undefined} style={{
              display: "flex", alignItems: "center", gap: SPACE.sm, fontFamily: BODY, fontSize: TYPE.sm,
              color: state === "done" ? C.green : state === "now" ? C.gold : white(0.5), fontWeight: state === "now" ? 600 : 400,
            }}>
              <span aria-hidden="true" style={{ width: 12, textAlign: "center" }}>{state === "done" ? "✓" : state === "now" ? "●" : "○"}</span>
              {labels[p]}
            </li>
          );
        })}
      </ol>
      <div aria-hidden="true" style={{ height: 4, background: white(0.08), borderRadius: 2, marginTop: SPACE.md, overflow: "hidden" }}>
        <div style={{ width: `${syncProgress}%`, height: "100%", background: done ? C.green : C.gold, borderRadius: 2 }} />
      </div>
    </div>
  );
};

export default SyncOverlay;
