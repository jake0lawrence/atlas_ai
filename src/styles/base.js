// The global stylesheet every view injects via <style>, plus the font stacks
// re-exported from the token module so existing imports keep working.
import { C, alpha, white, FONTS, BODY, MONO } from './tokens';

export { FONTS, BODY, MONO };

export const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Libre+Franklin:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg0}; }
  @keyframes glow { 0%, 100% { filter: drop-shadow(0 0 8px ${alpha(C.gold, 0.3)}); transform: scale(1); } 50% { filter: drop-shadow(0 0 20px ${alpha(C.gold, 0.6)}); transform: scale(1.08); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
  @keyframes borderGlow { 0%, 100% { border-color: ${alpha(C.gold, 0.15)}; } 50% { border-color: ${alpha(C.gold, 0.4)}; } }
  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes autoApprove { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.9; transform: scale(1.01); border-color: ${alpha(C.green, 0.5)}; } 100% { opacity: 0; transform: scale(0.97) translateX(40px); } }
  @keyframes queueSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes topicCardIn { from { opacity: 0; transform: scale(0.92) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }
  @keyframes mergeOut { 0% { opacity: 1; transform: scale(1); } 60% { opacity: 0.6; transform: scale(0.85); } 100% { opacity: 0; transform: scale(0.7) translateX(20px); height: 0; margin: 0; padding: 0; overflow: hidden; } }
  @keyframes starPop { 0% { transform: scale(1); } 50% { transform: scale(1.35); } 100% { transform: scale(1); } }
  @keyframes cardDismiss { 0% { opacity: 1; transform: translateX(0) scale(1); } 100% { opacity: 0; transform: translateX(60px) scale(0.92); } }
  @keyframes cardPromote { 0% { opacity: 1; transform: translateY(0); } 50% { box-shadow: 0 0 24px ${alpha(C.green, 0.3)}; } 100% { opacity: 0; transform: translateY(-30px) scale(0.95); } }
  @keyframes freshPulse { 0%, 100% { box-shadow: 0 0 0 0 ${alpha(C.gold, 0)}; } 50% { box-shadow: 0 0 12px 3px ${alpha(C.gold, 0.25)}; } }
  @keyframes syncSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes newGlow { 0%, 100% { box-shadow: 0 0 0 0 ${alpha(C.green, 0)}; border-color: ${alpha(C.green, 0.15)}; } 50% { box-shadow: 0 0 16px 4px ${alpha(C.green, 0.25)}; border-color: ${alpha(C.green, 0.4)}; } }
  @keyframes hapticBounce { 0% { transform: scale(1); } 40% { transform: scale(0.93); } 70% { transform: scale(1.05); } 100% { transform: scale(1); } }
  @keyframes confettiBurst { 0% { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); } 50% { opacity: 0.8; } 100% { opacity: 0; transform: translateY(-90px) rotate(180deg) scale(0.4); } }
  @keyframes viewFadeSlide { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes atlasTyping { 0%, 60%, 100% { opacity: 0.25; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-4px); } }
  .atlas-typing-dot { animation: atlasTyping 1.2s ease-in-out infinite; }
  @keyframes rewindFadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
  .rewind-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: ${C.white}; cursor: pointer; box-shadow: 0 0 8px ${white(0.3)}; }
  .rewind-slider::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: ${C.white}; border: none; cursor: pointer; }
  .fade-up { animation: fadeUp 0.6s ease both; }
  .slide-in { animation: slideIn 0.5s ease both; }
  .view-transition { animation: viewFadeSlide 0.45s cubic-bezier(0.16,1,0.3,1) both; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${alpha(C.gold, 0.15)}; border-radius: 3px; }
`;
