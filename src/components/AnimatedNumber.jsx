import { useState, useEffect } from "react";

// ─── SHARED COMPONENTS (from v3) ────────────────────────────

const AnimatedNumber = ({ value, delay = 0 }) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setStarted(true), delay); return () => clearTimeout(t); }, [delay]);
  useEffect(() => {
    if (!started) return;
    const dur = 1400, steps = 35, inc = value / steps;
    let cur = 0;
    const timer = setInterval(() => {
      cur += inc;
      if (cur >= value) { setCount(value); clearInterval(timer); } else setCount(Math.floor(cur));
    }, dur / steps);
    return () => clearInterval(timer);
  }, [started, value]);
  return <>{count.toLocaleString()}</>;
};

export default AnimatedNumber;
