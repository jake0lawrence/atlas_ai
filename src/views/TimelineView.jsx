import { useState } from "react";
import { TIMELINE_DATA, TYPE_META, CONVERSATION_PREVIEWS } from '../data/constants';
import FreshnessBadge from '../components/FreshnessBadge';
import Breadcrumbs from '../components/Breadcrumbs';
import { C, alpha, white, FONTS, BODY, MONO, SPACE, TYPE } from '../styles/tokens';

// One topic's story, oldest first. The type chips filter the timeline; only
// events with a transcript in the demo are clickable, and they say so.
// V7_PLAN.md row 6.

export const hasTranscript = (topicId, index) => Boolean(CONVERSATION_PREVIEWS[`${topicId}:${index}`]);

const FilterChip = ({ label, count, color, active, onClick }) => {
  return (
    <button onClick={onClick} aria-pressed={active} style={{
      fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 500, cursor: "pointer", borderRadius: 16, padding: `${SPACE.xs}px ${SPACE.md}px`,
      color: active ? C.bg0 : color, background: active ? color : alpha(color, 0.1), border: `1px solid ${alpha(color, active ? 1 : 0.3)}`,
    }}>{label} <span style={{ fontFamily: MONO, opacity: 0.8 }}>{count}</span></button>
  );
};

const TimelineView = ({ topic, onBack, onEventClick, mobile, newEvents }) => {
  const [filter, setFilter] = useState(null);
  const baseEvents = TIMELINE_DATA[topic.id] || [];
  const syncedEvent = newEvents && newEvents[topic.id];
  const events = syncedEvent ? [...baseEvents, syncedEvent] : baseEvents;
  const typeCounts = {};
  events.forEach(e => { typeCounts[e.type] = (typeCounts[e.type] || 0) + 1; });
  const totalMsgs = events.reduce((a, e) => a + e.messages, 0);
  const transcripts = events.filter((_, i) => hasTranscript(topic.id, i)).length;
  const shown = events.map((e, i) => ({ e, i })).filter(({ e }) => !filter || e.type === filter);

  return (
    <div style={{ paddingBottom: SPACE.xxl }}>
      <Breadcrumbs items={[{ label: "Overview", onClick: onBack }, { label: topic.name }]} />

      <header style={{ display: "flex", alignItems: mobile ? "flex-start" : "center", gap: SPACE.lg, marginBottom: SPACE.lg, flexDirection: mobile ? "column" : "row" }}>
        <span aria-hidden style={{ fontSize: mobile ? 32 : 40, lineHeight: 1 }}>{topic.icon}</span>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: SPACE.sm, flexWrap: "wrap" }}>
            <h1 style={{ fontFamily: FONTS, fontSize: mobile ? TYPE.xxl - 2 : 32, fontWeight: 700, color: C.white }}>{topic.name}</h1>
            <FreshnessBadge topic={topic} style={{ fontSize: TYPE.xs, padding: "3px 9px" }} />
          </div>
          <p style={{ fontFamily: BODY, fontSize: TYPE.base, color: white(0.55), marginTop: SPACE.xs }}>{topic.count} conversations · {(topic.words / 1000).toFixed(0)}k words · {topic.firstSeen} – {topic.lastSeen}</p>
        </div>
      </header>

      <p style={{ fontFamily: BODY, fontSize: TYPE.base, color: white(0.7), lineHeight: 1.6, padding: `${SPACE.md}px ${SPACE.lg}px`, borderLeft: `3px solid ${topic.color}`, background: alpha(topic.color, 0.05), borderRadius: "0 10px 10px 0", marginBottom: SPACE.xl }}>
        {events.length} threads and {totalMsgs.toLocaleString()} messages: {typeCounts.build || 0} build sessions, {typeCounts.decision || 0} decision{typeCounts.decision === 1 ? "" : "s"}, {typeCounts.pivot || 0} pivot{typeCounts.pivot === 1 ? "" : "s"}, {typeCounts.milestone || 0} milestone{typeCounts.milestone === 1 ? "" : "s"}. {transcripts} {transcripts === 1 ? "has its" : "have their"} full transcript in this demo.
      </p>

      <div role="group" aria-label="Filter by type" style={{ display: "flex", gap: SPACE.xs + 2, flexWrap: "wrap", marginBottom: SPACE.xl }}>
        <FilterChip label="All" count={events.length} color={C.white} active={filter === null} onClick={() => setFilter(null)} />
        {Object.entries(TYPE_META).map(([type, meta]) => typeCounts[type] ? (
          <FilterChip key={type} label={`${meta.icon} ${meta.label}`} count={typeCounts[type]} color={meta.color} active={filter === type} onClick={() => setFilter(type)} />
        ) : null)}
      </div>

      <ol aria-label={`${topic.name} timeline`} style={{ listStyle: "none", margin: 0, padding: 0, position: "relative", paddingLeft: mobile ? 26 : 34 }}>
        <div aria-hidden style={{ position: "absolute", left: mobile ? 8 : 11, top: 6, bottom: 6, width: 2, background: alpha(topic.color, 0.35) }} />
        {shown.map(({ e: event, i }) => {
          const meta = TYPE_META[event.type] || TYPE_META.build;
          const readable = hasTranscript(topic.id, i);
          const isNew = syncedEvent && i === events.length - 1;
          const accent = isNew ? C.green : meta.color;
          const body = (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: SPACE.sm, flexWrap: "wrap", marginBottom: SPACE.xs }}>
                <span style={{ display: "flex", gap: SPACE.xs + 2, alignItems: "center" }}>
                  <span style={{ fontFamily: BODY, fontSize: TYPE.xs, padding: "2px 8px", borderRadius: 20, background: alpha(meta.color, 0.12), color: meta.color, fontWeight: 600 }}>{meta.icon} {meta.label}</span>
                  {isNew && <span style={{ fontFamily: BODY, fontSize: TYPE.xs, padding: "2px 7px", borderRadius: 10, background: alpha(C.green, 0.15), color: C.green, fontWeight: 700 }}>NEW</span>}
                </span>
                <span style={{ fontFamily: MONO, fontSize: TYPE.xs, color: white(0.5) }}>{event.date}</span>
              </div>
              <h2 style={{ fontFamily: FONTS, fontSize: mobile ? TYPE.md : TYPE.lg - 2, color: C.white, fontWeight: 600, margin: `${SPACE.xs}px 0` }}>{event.title}</h2>
              <p style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.6), lineHeight: 1.5 }}>{event.summary}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: SPACE.sm, gap: SPACE.sm }}>
                <span style={{ fontFamily: MONO, fontSize: TYPE.xs, color: white(0.45) }}>{event.messages} messages</span>
                {readable
                  ? <span style={{ fontFamily: BODY, fontSize: TYPE.sm, color: C.gold, fontWeight: 600 }}>Read the thread →</span>
                  : <span style={{ fontFamily: BODY, fontSize: TYPE.xs, color: white(0.4) }}>Summary only</span>}
              </div>
            </>
          );
          const card = {
            display: "block", width: "100%", textAlign: "left", borderRadius: 11, padding: mobile ? `${SPACE.md}px ${SPACE.md + 2}px` : `${SPACE.md + 2}px ${SPACE.lg + 2}px`,
            background: isNew ? alpha(C.green, 0.05) : white(0.025), border: `1px solid ${readable ? alpha(C.gold, 0.3) : white(0.07)}`, borderLeft: `3px solid ${accent}`,
          };
          return (
            <li key={i} style={{ position: "relative", marginBottom: SPACE.md }}>
              <span aria-hidden style={{ position: "absolute", left: mobile ? -22 : -28, top: 16, width: 12, height: 12, borderRadius: "50%", background: accent, border: `3px solid ${C.bg0}` }} />
              {readable
                ? <button onClick={() => onEventClick && onEventClick(topic.id, i)} aria-label={`Read the thread: ${event.title}`} style={{ ...card, cursor: "pointer", fontFamily: BODY }}>{body}</button>
                : <article style={card}>{body}</article>}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default TimelineView;
