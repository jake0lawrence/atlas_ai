import { useRef, useCallback } from "react";

const useSound = () => {
  const ctxRef = useRef(null);
  const enabledRef = useRef(false);
  const play = useCallback((type) => {
    if (!enabledRef.current) return;
    try {
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = ctxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (type === "chime") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) { console.warn('Audio playback failed:', e); }
  }, []);
  const toggle = useCallback(() => { enabledRef.current = !enabledRef.current; return enabledRef.current; }, []);
  return { play, toggle, isEnabled: () => enabledRef.current };
};

export default useSound;
