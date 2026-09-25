import { useState, useEffect } from "react";
import { MONTHLY_ACTIVITY } from '../data/constants';
import { C, white, MONO, SPACE, TYPE } from '../styles/tokens';

// Stacked monthly bars, Claude over ChatGPT. The axis labels every six months
// and a text summary (for screen readers) come from the same data.
const LABEL_MONTHS = new Set(["Jan 23", "Jul 23", "Jan 24", "Jul 24", "Jan 25"]);

const ActivityChart = ({ mobile, summary }) => {
  const [visible, setVisible] = useState(false);
  const maxVal = Math.max(...MONTHLY_ACTIVITY.map(m => m.gpt + m.claude));
  const plot = mobile ? 72 : 110;
  useEffect(() => { const t = setTimeout(() => setVisible(true), 300); return () => clearTimeout(t); }, []);
  const label = summary?.crossover
    ? `Conversations per month from ${MONTHLY_ACTIVITY[0].month} to ${summary.latestMonth}. Claude passed ChatGPT in ${summary.crossover} and reached ${summary.latestClaudeShare}% by ${summary.latestMonth}.`
    : "Conversations per month by platform.";
  return (
    <figure role="img" aria-label={label} style={{ margin: 0, opacity: visible ? 1 : 0, transition: "opacity 0.6s ease" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: mobile ? 1 : 2, height: plot + 4, borderBottom: `1px solid ${white(0.1)}` }}>
        {MONTHLY_ACTIVITY.map(m => {
          const isCross = summary?.crossover === m.month;
          return (
            <div key={m.month} title={`${m.month}: ${m.claude} Claude, ${m.gpt} ChatGPT`} style={{ display: "flex", flexDirection: "column", flex: 1, gap: 1, position: "relative" }}>
              {isCross && <div aria-hidden style={{ position: "absolute", left: "50%", bottom: 0, height: plot + 4, borderLeft: `1px dashed ${white(0.35)}` }} />}
              <div style={{ height: (m.claude / maxVal) * plot, background: C.gold, borderRadius: "2px 2px 0 0" }} />
              <div style={{ height: (m.gpt / maxVal) * plot, background: C.blue }} />
            </div>
          );
        })}
      </div>
      <div aria-hidden style={{ display: "flex", marginTop: SPACE.xs }}>
        {MONTHLY_ACTIVITY.map(m => (
          <span key={m.month} style={{ flex: 1, textAlign: "center", fontFamily: MONO, fontSize: TYPE.xs, color: white(0.45), whiteSpace: "nowrap", overflow: "visible" }}>
            {LABEL_MONTHS.has(m.month) && !mobile ? m.month : LABEL_MONTHS.has(m.month) && m.month.startsWith("Jan") ? `'${m.month.slice(-2)}` : ""}
          </span>
        ))}
      </div>
    </figure>
  );
};

export default ActivityChart;
