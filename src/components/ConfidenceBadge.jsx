import { MONO } from '../styles/base';

// ═══════════════════════════════════════════════════════════════
// REVIEW QUEUE (v5 Curation Pipeline — Section 1A)
// ═══════════════════════════════════════════════════════════════

const ConfidenceBadge = ({ confidence }) => {
  const isHigh = confidence >= 90;
  const isMed = confidence >= 70 && confidence < 90;
  const color = isHigh ? "#10B981" : isMed ? "#F59E0B" : "#EF4444";
  const label = isHigh ? "High" : isMed ? "Medium" : "Low";
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20,
      background: `${color}12`, border: `1px solid ${color}25`,
      fontFamily: MONO, fontSize: 11, color, fontWeight: 600,
    }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}60` }} />
      {confidence}% {label}
    </div>
  );
};

export default ConfidenceBadge;
