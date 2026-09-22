import { useState, useMemo } from "react";
import {
  TOPICS, CONNECTIONS,
} from '../data/constants';
import { BODY } from '../styles/base';
import { C, white } from '../styles/tokens';
import { stack, title, lede } from '../styles/shared';

const ConnectionsView = ({ onTopicClick, mobile }) => {
  const [selected, setSelected] = useState(null);
  const topicMap = useMemo(() => {
    const map = {};
    TOPICS.forEach(t => { map[t.id] = t; });
    return map;
  }, []);
  const adjacency = {};
  CONNECTIONS.forEach(c => {
    if (!adjacency[c.from]) adjacency[c.from] = [];
    if (!adjacency[c.to]) adjacency[c.to] = [];
    adjacency[c.from].push({ target: c.to, label: c.label, strength: c.strength });
    adjacency[c.to].push({ target: c.from, label: c.label, strength: c.strength });
  });
  const highlighted = new Set();
  if (selected) { highlighted.add(selected); (adjacency[selected] || []).forEach(a => highlighted.add(a.target)); }
  const handleInteract = (id) => setSelected(selected === id ? null : id);

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h2 style={title(mobile)}>How Your Ideas Connect</h2>
        <p style={lede(mobile)}>{mobile ? "Tap" : "Hover"} topics to see relationships.</p>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: mobile ? 8 : 12, justifyContent: "center", padding: mobile ? "20px 12px" : "24px 16px", background: white(0.015), borderRadius: 18, border: `1px solid ${white(0.04)}`, marginBottom: 20 }}>
        {TOPICS.map(topic => {
          const isHighlighted = !selected || highlighted.has(topic.id);
          const isSource = selected === topic.id;
          const maxC = Math.max(...TOPICS.map(t => t.count));
          const size = (mobile ? 42 : 52) + (topic.count / maxC) * (mobile ? 40 : 56);
          return (
            <div key={topic.id}
              onMouseEnter={() => !mobile && setSelected(topic.id)}
              onMouseLeave={() => !mobile && setSelected(null)}
              onClick={() => mobile ? (isSource ? onTopicClick(topic) : handleInteract(topic.id)) : onTopicClick(topic)}
              style={{
                width: size, height: size, borderRadius: "50%",
                background: isSource ? `radial-gradient(circle, ${topic.color}45, ${topic.color}15)` : `radial-gradient(circle, ${topic.color}20, ${topic.color}06)`,
                border: `2px solid ${isSource ? topic.color : isHighlighted ? topic.color + "50" : topic.color + "10"}`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                opacity: isHighlighted ? 1 : 0.15,
                transform: isSource ? "scale(1.18)" : "scale(1)",
                transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)", cursor: "pointer",
                boxShadow: isSource ? `0 0 24px ${topic.color}25` : "none", flexShrink: 0,
              }}>
              <span style={{ fontSize: size > 70 ? 18 : size > 50 ? 14 : 11 }}>{topic.icon}</span>
              {size > (mobile ? 55 : 65) && <span style={{ fontFamily: BODY, fontSize: mobile ? 6 : 8, color: white(isHighlighted ? 0.55 : 0.15), marginTop: 1, textAlign: "center", fontWeight: 500 }}>{topic.name.slice(0, 10)}</span>}
            </div>
          );
        })}
      </div>
      {selected && adjacency[selected] ? (
        <div className="fade-up" style={{ background: white(0.025), border: `1px solid ${white(0.08)}`, borderRadius: 14, padding: mobile ? "16px 18px" : "20px 24px" }}>
          <div style={{ fontFamily: BODY, fontSize: mobile ? 13 : 14, color: C.white, fontWeight: 600, marginBottom: 12 }}>{topicMap[selected]?.icon} {topicMap[selected]?.name} connects to:</div>
          <div style={stack}>
            {adjacency[selected].sort((a, b) => b.strength - a.strength).map((conn, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <div style={{ width: mobile ? 50 : 80, height: 4, background: white(0.05), borderRadius: 2, overflow: "hidden", flexShrink: 0 }}><div style={{ width: `${conn.strength * 100}%`, height: "100%", background: topicMap[conn.target]?.color || C.gray, borderRadius: 2 }} /></div>
                <span style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: topicMap[conn.target]?.color || C.gray, fontWeight: 500 }}>{topicMap[conn.target]?.icon} {topicMap[conn.target]?.name}</span>
                <span style={{ fontFamily: BODY, fontSize: mobile ? 10 : 11, color: white(0.25) }}>— {conn.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ background: white(0.015), borderRadius: 14, padding: "18px 22px", border: `1px dashed ${white(0.06)}`, textAlign: "center" }}>
          <div style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: white(0.25) }}>{CONNECTIONS.length} connections across {TOPICS.length} clusters.</div>
        </div>
      )}
    </div>
  );
};

export default ConnectionsView;
