import { useState } from "react";
import { TOPICS, MCP_CLIENTS, MCP_TOOLS, MCP_CAPTURE_LOG } from '../data/constants';
import { title, lede } from '../styles/shared';
import { C, PLATFORM, alpha, white, BODY, MONO, SPACE, TYPE } from '../styles/tokens';

// Live capture: what the model wrote into Atlas through the (mock) Atlas MCP
// server during today's chats. Exports do the one-time backfill; this is how
// the atlas stays current without re-exporting. There is no server: every
// entry is a fixture in MCP_CAPTURE_LOG.

const TOPIC_BY_ID = Object.fromEntries(TOPICS.map(t => [t.id, t]));
const TOOL_BY_NAME = Object.fromEntries(MCP_TOOLS.map(t => [t.name, t]));
const CLIENT_BY_ID = Object.fromEntries(MCP_CLIENTS.map(c => [c.id, c]));

const KINDS = {
  decision: { label: "Decisions", color: C.red },
  topic: { label: "Topics", color: C.blue },
  pivot: { label: "Pivots", color: C.purple },
  link: { label: "Links", color: C.amber },
  read: { label: "Reads", color: C.slate },
};

export const kindOf = (entry) => TOOL_BY_NAME[entry.tool]?.kind || "topic";

export const filterLog = (log, kind) => kind === "all" ? log : log.filter(e => kindOf(e) === kind);

// Entries that don't need review are applied as they arrive; the rest wait
// for a keep / discard.
export const statusOf = (entry, decisions) =>
  kindOf(entry) === "read" ? "read" : entry.review ? (decisions[entry.id] || "waiting") : "applied";

export const summarizeCapture = (log, decisions) => {
  const count = (s) => log.filter(e => statusOf(e, decisions) === s).length;
  return {
    total: log.length,
    applied: count("applied") + count("kept"),
    waiting: count("waiting"),
    discarded: count("discarded"),
    chats: new Set(log.map(e => e.chat)).size,
  };
};

// ─── Pieces ─────────────────────────────────────────────────────
const sectionTitle = { fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 600, color: white(0.55), textTransform: "uppercase", letterSpacing: "0.08em", margin: `0 0 ${SPACE.md}px` };
const card = { background: white(0.025), border: `1px solid ${white(0.07)}`, borderRadius: 12, padding: SPACE.lg };
const list = { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: SPACE.sm };

const chip = (color, active) => ({
  fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 600, cursor: "pointer",
  color: active ? C.bg0 : color, background: active ? color : alpha(color, 0.07),
  border: `1px solid ${active ? color : alpha(color, 0.25)}`, borderRadius: 16,
  padding: `${SPACE.xs + 1}px ${SPACE.md}px`, whiteSpace: "nowrap",
});

const button = (color, primary) => ({
  fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 600, cursor: "pointer",
  color: primary ? C.bg0 : color, background: primary ? color : alpha(color, 0.07),
  border: `1px solid ${primary ? color : alpha(color, 0.3)}`, borderRadius: 8,
  padding: `${SPACE.xs + 2}px ${SPACE.md}px`,
});

const ClientBadge = ({ id }) => {
  const color = PLATFORM[id] || C.slate;
  return (
    <span style={{ fontFamily: BODY, fontSize: TYPE.xs, fontWeight: 600, color, background: alpha(color, 0.1), border: `1px solid ${alpha(color, 0.25)}`, borderRadius: 10, padding: `1px ${SPACE.sm}px` }}>
      {CLIENT_BY_ID[id]?.name || id}
    </span>
  );
};

const TopicTag = ({ topic, onTopicClick }) => {
  if (!topic) return null;
  const style = { fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 600, color: topic.color, background: "none", border: "none", padding: 0, cursor: onTopicClick ? "pointer" : "default" };
  return onTopicClick
    ? <button onClick={() => onTopicClick(topic)} style={style} aria-label={`Open ${topic.name}`}>{topic.icon} {topic.name}</button>
    : <span style={style}>{topic.icon} {topic.name}</span>;
};

const STATUS = {
  applied: { label: "Applied", color: C.green },
  read: { label: "Read only, nothing written", color: C.slate },
  kept: { label: "Kept", color: C.green },
  waiting: { label: "Waiting for you", color: C.gold },
  discarded: { label: "Discarded", color: C.slate },
};

const Entry = ({ entry, status, onDecide, onTopicClick, mobile }) => {
  const kind = kindOf(entry);
  const color = KINDS[kind].color;
  const topic = TOPIC_BY_ID[entry.topicId];
  const toTopic = TOPIC_BY_ID[entry.toId];
  const s = STATUS[status];
  const dim = status === "discarded";
  return (
    <li>
      <article aria-label={`${entry.time} ${entry.tool}`} style={{
        display: "grid", gridTemplateColumns: mobile ? "1fr" : "72px 1fr", gap: mobile ? SPACE.xs : SPACE.md,
        padding: SPACE.md, borderRadius: 10, opacity: dim ? 0.5 : 1,
        background: status === "waiting" ? alpha(C.gold, 0.04) : white(0.02),
        border: `1px solid ${status === "waiting" ? alpha(C.gold, 0.25) : white(0.06)}`,
        borderLeft: `3px solid ${color}`,
      }}>
        <div style={{ fontFamily: MONO, fontSize: TYPE.xs, color: white(0.45), paddingTop: 2 }}>{entry.time}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: SPACE.sm, flexWrap: "wrap", marginBottom: SPACE.xs }}>
            <code style={{ fontFamily: MONO, fontSize: TYPE.xs, color }}>{entry.tool}</code>
            <ClientBadge id={entry.client} />
            <span style={{ fontFamily: BODY, fontSize: TYPE.xs, color: white(0.4), overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>in “{entry.chat}”</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: SPACE.sm, flexWrap: "wrap", marginBottom: SPACE.xs }}>
            <TopicTag topic={topic} onTopicClick={onTopicClick} />
            {entry.newTopic && <span style={{ fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 600, color: C.gold }}>+ new topic: {entry.newTopic}</span>}
            {toTopic && <><span style={{ color: white(0.3), fontSize: TYPE.sm }}>↔</span><TopicTag topic={toTopic} onTopicClick={onTopicClick} /></>}
          </div>
          <p style={{ fontFamily: BODY, fontSize: TYPE.base, color: white(0.75), lineHeight: 1.5, margin: 0, textDecoration: dim ? "line-through" : "none" }}>{entry.text}</p>
          {entry.why && <p style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.5), lineHeight: 1.5, margin: `${SPACE.xs}px 0 0` }}><strong style={{ color: white(0.6) }}>Why:</strong> {entry.why}</p>}
          {entry.before && (
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: SPACE.sm, marginTop: SPACE.sm }}>
              {[["Before", entry.before, C.red], ["After", entry.after, C.green]].map(([k, v, c]) => (
                <div key={k} style={{ padding: `${SPACE.sm}px ${SPACE.md}px`, borderRadius: 8, background: alpha(c, 0.06), border: `1px solid ${alpha(c, 0.15)}` }}>
                  <div style={{ fontFamily: MONO, fontSize: TYPE.xs, color: c, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>{k}</div>
                  <div style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.6), lineHeight: 1.4 }}>{v}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: SPACE.sm, flexWrap: "wrap", marginTop: SPACE.sm }}>
            <span style={{ fontFamily: BODY, fontSize: TYPE.xs, fontWeight: 600, color: s.color }}>● {s.label}</span>
            {status === "waiting" && (
              <>
                <button onClick={() => onDecide(entry.id, "kept")} style={button(C.green, true)}>Keep</button>
                <button onClick={() => onDecide(entry.id, "discarded")} style={button(C.slate)}>Discard</button>
              </>
            )}
            {(status === "kept" || status === "discarded") && (
              <button onClick={() => onDecide(entry.id, null)} style={button(C.slate)}>Undo</button>
            )}
          </div>
        </div>
      </article>
    </li>
  );
};

const Stat = ({ value, label, color }) => (
  <div style={{ ...card, padding: `${SPACE.md}px ${SPACE.lg}px`, flex: 1, minWidth: 110 }}>
    <div style={{ fontFamily: MONO, fontSize: TYPE.xl, fontWeight: 700, color }}>{value}</div>
    <div style={{ fontFamily: BODY, fontSize: TYPE.xs, color: white(0.45), textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{label}</div>
  </div>
);

// ─── View ───────────────────────────────────────────────────────
const LiveCaptureView = ({ mobile, onTopicClick }) => {
  const [kind, setKind] = useState("all");
  const [decisions, setDecisions] = useState({});
  const decide = (id, status) => setDecisions(d => {
    const next = { ...d };
    if (status) next[id] = status; else delete next[id];
    return next;
  });

  const summary = summarizeCapture(MCP_CAPTURE_LOG, decisions);
  const shown = filterLog(MCP_CAPTURE_LOG, kind);
  const counts = Object.fromEntries(Object.keys(KINDS).map(k => [k, filterLog(MCP_CAPTURE_LOG, k).length]));

  return (
    <div className="fade-up">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: SPACE.md, flexWrap: "wrap", marginBottom: SPACE.xl }}>
        <div style={{ maxWidth: 620 }}>
          <h1 style={{ ...title(mobile), margin: `0 0 ${SPACE.sm}px` }}>Logged while you talked</h1>
          <p style={{ ...lede(mobile), color: white(0.55), lineHeight: 1.6, margin: 0 }}>
            With the Atlas MCP server connected, the model writes decisions, pivots and topic notes into your atlas during the conversation. Your exports filled in the past once; this keeps it current, so you never export again.
          </p>
        </div>
        <span style={{ fontFamily: MONO, fontSize: TYPE.xs, color: C.gold, border: `1px dashed ${alpha(C.gold, 0.4)}`, borderRadius: 8, padding: `${SPACE.xs}px ${SPACE.sm}px`, whiteSpace: "nowrap" }}>
          Demo · no server, simulated log
        </span>
      </div>

      <div style={{ display: "flex", gap: SPACE.sm, flexWrap: "wrap", marginBottom: SPACE.xl }}>
        <Stat value={summary.total} label={`calls · ${summary.chats} chats`} color={C.white} />
        <Stat value={summary.applied} label="applied" color={C.green} />
        <Stat value={summary.waiting} label="waiting for you" color={C.gold} />
        {summary.discarded > 0 && <Stat value={summary.discarded} label="discarded" color={C.slate} />}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "minmax(0, 1fr) 280px", gap: SPACE.xl, alignItems: "start" }}>
        <section aria-label="Today's capture log">
          <div role="group" aria-label="Filter by kind" style={{ display: "flex", gap: SPACE.xs + 2, flexWrap: "wrap", marginBottom: SPACE.md }}>
            <button onClick={() => setKind("all")} aria-pressed={kind === "all"} style={chip(C.gold, kind === "all")}>All {MCP_CAPTURE_LOG.length}</button>
            {Object.entries(KINDS).map(([k, { label, color }]) => (
              <button key={k} onClick={() => setKind(k)} aria-pressed={kind === k} style={chip(color, kind === k)}>{label} {counts[k]}</button>
            ))}
          </div>
          <h2 style={sectionTitle}>Today · Feb 7</h2>
          <ol style={list}>
            {shown.map(e => (
              <Entry key={e.id} entry={e} status={statusOf(e, decisions)} onDecide={decide} onTopicClick={onTopicClick} mobile={mobile} />
            ))}
          </ol>
        </section>

        <aside style={{ display: "flex", flexDirection: "column", gap: SPACE.lg }}>
          <section style={card} aria-label="Connected clients">
            <h2 style={sectionTitle}>Connected</h2>
            <ul style={list}>
              {MCP_CLIENTS.map(c => (
                <li key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: SPACE.sm }}>
                  <span style={{ display: "flex", alignItems: "center", gap: SPACE.sm }}>
                    <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 4, background: C.green }} />
                    <ClientBadge id={c.id} />
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: TYPE.xs, color: white(0.45) }}>since {c.connected} · {c.calls} calls</span>
                </li>
              ))}
            </ul>
          </section>

          <section style={card} aria-label="What the model can do">
            <h2 style={sectionTitle}>What the model can do</h2>
            <ul style={list}>
              {MCP_TOOLS.map(t => (
                <li key={t.name}>
                  <code style={{ fontFamily: MONO, fontSize: TYPE.xs, color: KINDS[t.kind].color }}>{t.name}</code>
                  <div style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.5), lineHeight: 1.4, marginTop: 2 }}>{t.desc}</div>
                </li>
              ))}
            </ul>
            <p style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.45), lineHeight: 1.5, margin: `${SPACE.md}px 0 0` }}>
              It only adds. Anything that changes the atlas’s shape (a new topic, a new connection, a reversed decision) waits for you.
            </p>
          </section>

          <section style={{ ...card, background: alpha(C.gold, 0.04), borderColor: alpha(C.gold, 0.15) }} aria-label="Where the past comes from">
            <h2 style={{ ...sectionTitle, color: C.gold }}>The past still comes from exports</h2>
            <p style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.55), lineHeight: 1.5, margin: 0 }}>
              The model can only hand over the conversation it is in. Your history before you connected came from one ChatGPT and Claude export.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default LiveCaptureView;
