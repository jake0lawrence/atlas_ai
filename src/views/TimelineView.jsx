import { useState, useEffect } from "react";
import {
  TIMELINE_DATA, TYPE_META, CONVERSATION_PREVIEWS,
} from '../data/constants';
import { FONTS, BODY, MONO } from '../styles/base';
import { row, rowTight, mono } from '../styles/shared';
import FreshnessBadge from '../components/FreshnessBadge';
import { C, alpha, white } from '../styles/tokens';

const TimelineView = ({ topic, onBack, onEventClick, mobile, newEvents }) => {
  const baseEvents = TIMELINE_DATA[topic.id] || [];
  const syncedEvent = newEvents && newEvents[topic.id];
  const events = syncedEvent ? [...baseEvents, syncedEvent] : baseEvents;
  const [visibleCount, setVisibleCount] = useState(0);
  useEffect(() => {
    setVisibleCount(0);
    const interval = setInterval(() => {
      setVisibleCount(prev => { if (prev >= events.length) { clearInterval(interval); return prev; } return prev + 1; });
    }, 90);
    return () => clearInterval(interval);
  }, [topic.id, events.length]);
  const typeCounts = {};
  events.forEach(e => { typeCounts[e.type] = (typeCounts[e.type] || 0) + 1; });
  const totalMsgs = events.reduce((a, e) => a + e.messages, 0);

  return (
    <div style={{ padding: "0 0 40px" }}>
      <button onClick={onBack} style={{ fontFamily: BODY, fontSize: 13, color: white(0.4), background: white(0.04), border: `1px solid ${white(0.08)}`, borderRadius: 8, padding: "8px 16px", cursor: "pointer", marginBottom: 24 }}>← Back</button>
      <div style={{ display: "flex", alignItems: mobile ? "flex-start" : "center", gap: mobile ? 12 : 16, marginBottom: 6, flexDirection: mobile ? "column" : "row" }}>
        <span style={{ fontSize: mobile ? 32 : 40 }}>{topic.icon}</span>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 style={{ fontFamily: FONTS, fontSize: mobile ? 26 : 32, fontWeight: 700, color: C.white }}>{topic.name}</h2>
            <FreshnessBadge topic={topic} style={{ fontSize: 10, padding: "3px 9px" }} />
          </div>
          <p style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: white(0.35), marginTop: 4 }}>{topic.count} conversations · {(topic.words / 1000).toFixed(0)}k words · {topic.firstSeen} → {topic.lastSeen}</p>
        </div>
      </div>
      <div style={{ background: `linear-gradient(135deg, ${topic.color}08, transparent)`, border: `1px solid ${topic.color}20`, borderRadius: 12, padding: mobile ? "14px 16px" : "16px 20px", margin: "18px 0 24px" }}>
        <div style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: white(0.55), lineHeight: 1.6 }}>
          <span style={{ color: topic.color, fontWeight: 600 }}>Story arc: </span>
          {events.length} threads. {typeCounts.build || 0} build sessions, {typeCounts.decision || 0} decisions, {typeCounts.pivot || 0} pivots, {typeCounts.milestone || 0} milestones. {totalMsgs} messages exchanged.
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
        {Object.entries(TYPE_META).map(([type, meta]) => (
          typeCounts[type] ? (
            <span key={type} style={{ fontFamily: BODY, fontSize: 10, padding: "3px 9px", borderRadius: 20, background: `${meta.color}12`, color: meta.color, border: `1px solid ${meta.color}20`, fontWeight: 500 }}>{meta.icon} {meta.label} ({typeCounts[type]})</span>
          ) : null
        ))}
      </div>
      <div style={{ position: "relative", paddingLeft: mobile ? 28 : 36 }}>
        <div style={{ position: "absolute", left: mobile ? 9 : 12, top: 0, bottom: 0, width: 2, background: `linear-gradient(180deg, ${topic.color}70, ${topic.color}08)` }} />
        {events.map((event, i) => {
          const meta = TYPE_META[event.type] || TYPE_META.build;
          const isVisible = i < visibleCount;
          const previewKey = `${topic.id}:${i}`;
          const hasPreview = !!CONVERSATION_PREVIEWS[previewKey];
          const isNewEvent = syncedEvent && i === events.length - 1;
          return (
            <div key={i} onClick={() => hasPreview && onEventClick && onEventClick(topic.id, i)} style={{ marginBottom: 14, position: "relative", opacity: isVisible ? 1 : 0, transform: isVisible ? "translateX(0)" : "translateX(-10px)", transition: "all 0.45s cubic-bezier(0.16,1,0.3,1)", cursor: hasPreview ? "pointer" : "default" }}>
              <div style={{ position: "absolute", left: mobile ? -24 : -30, top: 10, width: mobile ? 12 : 14, height: mobile ? 12 : 14, borderRadius: "50%", background: isNewEvent ? C.green : meta.color, border: `3px solid ${C.bg0}`, boxShadow: `0 0 8px ${isNewEvent ? C.green : meta.color}35` }} />
              <div style={{ background: isNewEvent ? alpha(C.green, 0.04) : white(0.025), border: `1px solid ${isNewEvent ? alpha(C.green, 0.2) : hasPreview ? alpha(C.gold, 0.15) : white(0.06)}`, borderRadius: 11, padding: mobile ? "12px 14px" : "14px 18px", borderLeft: `3px solid ${isNewEvent ? C.green : meta.color}`, transition: "border-color 0.2s, background 0.2s", animation: isNewEvent ? "newGlow 2s ease-in-out 3" : "none" }}
                onMouseEnter={e => { if (hasPreview) { e.currentTarget.style.background = white(0.045); e.currentTarget.style.borderColor = alpha(C.gold, 0.25); } }}
                onMouseLeave={e => { if (hasPreview) { e.currentTarget.style.background = white(0.025); e.currentTarget.style.borderColor = alpha(C.gold, 0.15); } }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5, flexWrap: "wrap", gap: 6 }}>
                  <div style={rowTight}>
                    <span style={{ fontFamily: BODY, fontSize: 10, padding: "2px 8px", borderRadius: 20, background: `${meta.color}12`, color: meta.color, fontWeight: 500 }}>{meta.icon} {meta.label}</span>
                    {isNewEvent && <span style={{ fontFamily: BODY, fontSize: 9, padding: "2px 7px", borderRadius: 10, background: alpha(C.green, 0.15), color: C.green, fontWeight: 600 }}>NEW</span>}
                  </div>
                  <div style={row}>
                    {hasPreview && <span style={{ fontFamily: BODY, fontSize: 9, padding: "2px 7px", borderRadius: 10, background: alpha(C.gold, 0.1), color: C.gold, fontWeight: 500 }}>View thread →</span>}
                    <span style={mono}>{event.date}</span>
                  </div>
                </div>
                <h3 style={{ fontFamily: FONTS, fontSize: mobile ? 14 : 16, color: C.white, margin: "5px 0 3px", fontWeight: 600 }}>{event.title}</h3>
                <p style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: white(0.4), lineHeight: 1.5 }}>{event.summary}</p>
                <div style={{ fontFamily: MONO, fontSize: 9, color: white(0.15), marginTop: 6 }}>{event.messages} messages</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineView;
