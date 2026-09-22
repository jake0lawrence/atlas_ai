import { BODY } from '../styles/base';

const SyncOverlay = ({ isSyncing, syncPhase, syncProgress, newCount, mobile }) => {
  if (!isSyncing) return null;
  const phases = [
    { key: "connecting", label: "Connecting to API…" },
    { key: "downloading", label: `Fetching ${newCount} new conversations…` },
    { key: "processing", label: "Processing & classifying…" },
    { key: "complete", label: "Sync complete!" },
  ];
  const activeIdx = phases.findIndex(p => p.key === syncPhase);
  return (
    <div style={{
      position: "fixed", bottom: mobile ? 16 : 24, right: mobile ? 16 : 24,
      background: "rgba(8,8,12,0.95)", border: "1px solid rgba(251,191,36,0.2)",
      borderRadius: 14, padding: mobile ? "14px 16px" : "16px 20px",
      minWidth: mobile ? 240 : 280, zIndex: 1000,
      animation: "fadeUp 0.4s ease", boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    }}>
      <div style={{ fontFamily: BODY, fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 10, fontWeight: 500 }}>
        Incremental Sync
      </div>
      {phases.map((p, i) => (
        <div key={p.key} style={{
          fontFamily: BODY, fontSize: mobile ? 11 : 12,
          color: i < activeIdx ? "#10B981" : i === activeIdx ? "#FBBF24" : "rgba(255,255,255,0.2)",
          marginBottom: 6, display: "flex", alignItems: "center", gap: 8, transition: "color 0.3s",
        }}>
          <span style={{ fontSize: 10 }}>{i < activeIdx ? "✓" : i === activeIdx ? "●" : "○"}</span>
          {p.label}
        </div>
      ))}
      <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, marginTop: 10, overflow: "hidden" }}>
        <div style={{
          width: `${syncProgress}%`, height: "100%",
          background: syncPhase === "complete" ? "#10B981" : "linear-gradient(90deg, #FBBF24, #F59E0B)",
          borderRadius: 2, transition: "width 0.4s ease",
        }} />
      </div>
    </div>
  );
};

export default SyncOverlay;
