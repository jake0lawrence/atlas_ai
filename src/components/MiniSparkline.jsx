// ═══════════════════════════════════════════════════════════════
// TOPIC CURATION PANEL (v5 Curation Pipeline — Section 1B)
// ═══════════════════════════════════════════════════════════════

const MiniSparkline = ({ data, color, width = 48, height = 16 }) => {
  const max = Math.max(...data);
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - (v / max) * height}`).join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
    </svg>
  );
};

export default MiniSparkline;
