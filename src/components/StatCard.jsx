import { useState, useEffect } from "react";
import { FONTS, BODY } from '../styles/base';
import AnimatedNumber from './AnimatedNumber';
import { C, white, TYPE } from '../styles/tokens';

const StatCard = ({ label, value, sub, delay, accent, mobile }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  const isNum = typeof value === "number";
  return (
    <div style={{
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: "all 0.7s cubic-bezier(0.16,1,0.3,1)",
      background: white(0.025), border: `1px solid ${white(0.06)}`,
      borderRadius: 14, padding: mobile ? "18px 16px" : "22px 20px",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: accent || C.gold, opacity: 0.5, borderRadius: "3px 0 0 3px" }} />
      <div style={{ fontFamily: FONTS, fontSize: mobile ? 32 : 38, fontWeight: 700, color: accent || C.gold, lineHeight: 1, letterSpacing: "-0.02em" }}>
        {isNum ? <AnimatedNumber value={value} delay={delay} /> : value}
      </div>
      <div style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.6), marginTop: 6, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontFamily: BODY, fontSize: TYPE.xs, color: white(0.45), marginTop: 3 }}>{sub}</div>}
    </div>
  );
};

export default StatCard;
