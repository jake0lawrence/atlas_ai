import { useState, useEffect } from "react";
import {
  BRIEFINGS, getTopicFreshness, RECURATION_COUNTS,
} from '../data/constants';
import { BODY, MONO } from '../styles/base';
import FreshnessBadge from './FreshnessBadge';

const TopicBubble = ({ topic, maxCount, onClick, onBriefMe, index, mobile, recentlySynced }) => {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const baseSize = mobile ? 44 : 52;
  const scaleRange = mobile ? 56 : 80;
  const size = baseSize + (topic.count / maxCount) * scaleRange;
  useEffect(() => { const t = setTimeout(() => setVisible(true), 600 + index * 50); return () => clearTimeout(t); }, [index]);

  const freshness = getTopicFreshness(topic);
  const isDormant = freshness === "dormant" || freshness === "archived";
  const hasUncurated = RECURATION_COUNTS[topic.id] > 0;
  const isNewlySynced = recentlySynced && recentlySynced.includes(topic.id);

  return (
    <div onClick={() => onClick(topic)}
      role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(topic); }}}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)} onTouchEnd={() => { setTimeout(() => setHovered(false), 1500); }}
      style={{
        width: size, height: size, borderRadius: "50%",
        background: `radial-gradient(circle at 30% 30%, ${topic.color}35, ${topic.color}10)`,
        border: `2px solid ${hovered ? topic.color : isNewlySynced ? "#10B981" : topic.color + "40"}`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        transform: `scale(${visible ? (hovered ? 1.15 : 1) : 0.5})`,
        opacity: visible ? 1 : 0, transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
        cursor: "pointer", position: "relative", flexShrink: 0,
        filter: isDormant ? "saturate(0.35)" : "none",
        boxShadow: hovered ? `0 0 30px ${topic.color}20, inset 0 0 15px ${topic.color}08` : "none",
        animation: isNewlySynced && visible ? "newGlow 2s ease-in-out 3" : hasUncurated && visible ? "freshPulse 3s ease-in-out infinite" : "none",
      }}>
      <span style={{ fontSize: size > 80 ? 22 : size > 60 ? 16 : 13 }}>{topic.icon}</span>
      {size > (mobile ? 65 : 75) && (
        <span style={{ fontFamily: BODY, fontSize: mobile ? 7 : 9, color: "rgba(255,255,255,0.6)", marginTop: 1, textAlign: "center", padding: "0 4px", lineHeight: 1.2, fontWeight: 500 }}>
          {topic.name.length > 12 ? topic.name.slice(0, 10) + "…" : topic.name}
        </span>
      )}
      {hovered && !mobile && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)",
          background: "rgba(8,8,12,0.97)", border: `1px solid ${topic.color}40`, borderRadius: 10,
          padding: "10px 14px", whiteSpace: "nowrap", zIndex: 50, minWidth: 180,
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: BODY, fontSize: 13, color: "#fff", fontWeight: 600 }}>{topic.icon} {topic.name}</span>
            <FreshnessBadge topic={topic} />
          </div>
          <div style={{ fontFamily: BODY, fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 5 }}>{topic.count} conversations · {(topic.words / 1000).toFixed(0)}k words</div>
          <div style={{ fontFamily: BODY, fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{topic.firstSeen} → {topic.lastSeen}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <span style={{ fontSize: 10, fontFamily: MONO, color: "#FBBF24" }}>Claude {topic.platform.claude}</span>
            <span style={{ fontSize: 10, fontFamily: MONO, color: "#3B82F6" }}>GPT {topic.platform.gpt}</span>
          </div>
          {RECURATION_COUNTS[topic.id] > 0 && (
            <div style={{ fontFamily: BODY, fontSize: 10, color: "#F59E0B", marginTop: 5, fontWeight: 500 }}>
              {RECURATION_COUNTS[topic.id]} new conversations since last review
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
            {BRIEFINGS[topic.id] && (
              <button onClick={e => { e.stopPropagation(); onBriefMe && onBriefMe(topic); }} style={{
                fontFamily: BODY, fontSize: 10, fontWeight: 600, color: topic.color,
                background: `${topic.color}15`, border: `1px solid ${topic.color}30`,
                borderRadius: 6, padding: "3px 10px", cursor: "pointer",
                transition: "all 0.2s", whiteSpace: "nowrap",
              }}>Brief me</button>
            )}
            <span style={{ fontFamily: BODY, fontSize: 10, color: "rgba(255,255,255,0.25)", fontWeight: 500 }}>Click to explore →</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicBubble;
