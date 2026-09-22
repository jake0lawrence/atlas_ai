import { useState, useEffect } from "react";
import {
  MONTHLY_ACTIVITY,
} from '../data/constants';
import { MONO } from '../styles/base';

const ActivityChart = ({ mobile }) => {
  const [visible, setVisible] = useState(false);
  const maxVal = Math.max(...MONTHLY_ACTIVITY.map(m => m.gpt + m.claude));
  useEffect(() => { const t = setTimeout(() => setVisible(true), 300); return () => clearTimeout(t); }, []);
  const labelMonths = ["Jan 23", "Jul 23", "Jan 24", "Jul 24", "Jan 25", "Jul 25", "Jan 26"];
  return (
    <div style={{ opacity: visible ? 1 : 0, transition: "opacity 1s ease" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: mobile ? 1 : 2, height: mobile ? 80 : 110, padding: "0 2px" }}>
        {MONTHLY_ACTIVITY.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <div style={{ height: (m.claude / maxVal) * (mobile ? 68 : 95), background: "linear-gradient(180deg, #FBBF24, #D97706)", borderRadius: "2px 2px 0 0", transition: "height 1s ease", transitionDelay: `${i * 20}ms` }} />
              <div style={{ height: (m.gpt / maxVal) * (mobile ? 68 : 95), background: "linear-gradient(180deg, #3B82F6, #1D4ED8)", borderRadius: "0 0 2px 2px", transition: "height 1s ease", transitionDelay: `${i * 20}ms` }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, padding: "0 2px" }}>
        {MONTHLY_ACTIVITY.map((m, i) => (
          <span key={i} style={{ fontFamily: MONO, fontSize: mobile ? 6 : 8, color: "rgba(255,255,255,0.12)", flex: 1, textAlign: "center" }}>
            {labelMonths.includes(m.month) ? m.month : ""}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ActivityChart;
