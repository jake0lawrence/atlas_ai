import { useState } from "react";
import { TOPICS, ARCHAEOLOGY_CHAINS, TIMELINE_DATA } from '../data/constants';
import Breadcrumbs from '../components/Breadcrumbs';
import { C, alpha, white, black, FONTS, BODY, MONO, SPACE, TYPE } from '../styles/tokens';

// ─── The chain, as data ─────────────────────────────────────────
export const ROLES = {
  seed: { label: "Seed", color: C.gold, desc: "where the idea first came up" },
  supporting: { label: "Supporting", color: C.green, desc: "evidence for it" },
  challenging: { label: "Challenging", color: C.red, desc: "a moment you doubted it" },
  resolution: { label: "Resolution", color: C.blue, desc: "where the decision settled" },
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const formatDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
};
const dayNumber = (iso) => { const [y, m, d] = iso.split("-").map(Number); return Date.UTC(y, m - 1, d) / 86400000; };

// Each node's place on the chain's own time axis, 0-100.
export const axisPositions = (nodes) => {
  const days = nodes.map(n => dayNumber(n.date));
  const lo = Math.min(...days);
  const span = Math.max(...days) - lo || 1;
  return Object.fromEntries(nodes.map((n, i) => [n.id, Math.round(((days[i] - lo) / span) * 1000) / 10]));
};

export const monthsBetween = (a, b) => {
  const [ya, ma] = a.split("-").map(Number);
  const [yb, mb] = b.split("-").map(Number);
  return (yb - ya) * 12 + (mb - ma);
};

// "17 months", "7 weeks", "3 days": the chain's span in words.
export const spanInWords = (a, b) => {
  const days = dayNumber(b) - dayNumber(a);
  const unit = (n, one) => `${n} ${one}${n === 1 ? "" : "s"}`;
  if (days < 14) return unit(days, "day");
  if (days < 90) return unit(Math.round(days / 7), "week");
  return unit(monthsBetween(a, b), "month");
};

// The timeline event a node really came from: only when the event at its
// index has the node's own date. Otherwise the index points at some other
// conversation, and the honest link is the topic's timeline.
export const sourceEvent = (node) => {
  const ev = (TIMELINE_DATA[node.topicId] || [])[node.eventIndex];
  return ev && ev.date === node.date ? ev : null;
};

const TOPIC_BY_ID = Object.fromEntries(TOPICS.map(t => [t.id, t]));

// ─── Pieces ─────────────────────────────────────────────────────
const sectionTitle = { fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 600, color: white(0.55), textTransform: "uppercase", letterSpacing: "0.08em", margin: `0 0 ${SPACE.md}px` };
const list = { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: SPACE.md };
const linkButton = (color) => ({ fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 600, color, background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" });

// The signature piece: the argument laid out in time. Evidence for the idea
// sits above the line, doubts below it, from the seed to the resolution.
const TugOfWar = ({ chain, active, onPick, mobile }) => {
  const pos = axisPositions(chain.nodes);
  const H = mobile ? 150 : 170;
  const mid = H / 2;
  const y = (role) => role === "supporting" ? mid - (mobile ? 42 : 50) : role === "challenging" ? mid + (mobile ? 42 : 50) : mid;
  return (
    <div style={{ position: "relative", height: H, margin: `0 ${mobile ? SPACE.lg : SPACE.xxl}px` }}>
      <div aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, top: mid, height: 2, background: white(0.15) }} />
      <span aria-hidden="true" style={{ position: "absolute", left: 0, top: 4, fontFamily: BODY, fontSize: TYPE.xs, color: C.green }}>for</span>
      <span aria-hidden="true" style={{ position: "absolute", left: 0, bottom: 4, fontFamily: BODY, fontSize: TYPE.xs, color: C.red }}>against</span>
      {chain.nodes.map(n => {
        const r = ROLES[n.role];
        const on = active === n.id;
        const size = Math.round((mobile ? 14 : 16) + n.confidence * (mobile ? 8 : 10));
        return (
          <div key={n.id}>
            {(n.role === "supporting" || n.role === "challenging") && (
              <span aria-hidden="true" style={{ position: "absolute", left: `${pos[n.id]}%`, top: Math.min(mid, y(n.role)), height: Math.abs(mid - y(n.role)), width: 2, marginLeft: -1, background: alpha(r.color, 0.5) }} />
            )}
            <button onClick={() => onPick(n.id)} aria-pressed={on}
              aria-label={`${r.label}, ${formatDate(n.date)}: ${n.title}`}
              style={{
                position: "absolute", left: `${pos[n.id]}%`, top: y(n.role), transform: "translate(-50%, -50%)",
                width: size, height: size, borderRadius: n.role === "resolution" || n.role === "seed" ? 4 : "50%",
                background: on ? r.color : C.bg1, border: `2.5px solid ${r.color}`, padding: 0, cursor: "pointer",
                boxShadow: on ? `0 0 0 4px ${alpha(r.color, 0.25)}` : "none",
              }} />
          </div>
        );
      })}
      <span aria-hidden="true" style={{ position: "absolute", left: 0, top: mid + 18, transform: "translateX(-50%)", fontFamily: MONO, fontSize: TYPE.xs, color: white(0.6), whiteSpace: "nowrap" }}>{chain.nodes[0].date.slice(0, 7)}</span>
      <span aria-hidden="true" style={{ position: "absolute", right: 0, top: mid + 18, transform: "translateX(50%)", fontFamily: MONO, fontSize: TYPE.xs, color: white(0.6), whiteSpace: "nowrap" }}>{chain.nodes.at(-1).date.slice(0, 7)}</span>
    </div>
  );
};

const Node = ({ node, active, onConversationClick, onTopicClick, mobile }) => {
  const r = ROLES[node.role];
  const topic = TOPIC_BY_ID[node.topicId];
  const ev = sourceEvent(node);
  return (
    <article id={`node-${node.id}`} aria-label={`${r.label}: ${node.title}`} style={{
      background: active ? alpha(r.color, 0.06) : white(0.02), border: `1px solid ${active ? alpha(r.color, 0.5) : white(0.08)}`,
      borderLeft: `3px solid ${r.color}`, borderRadius: 12, padding: mobile ? SPACE.md : `${SPACE.lg}px ${SPACE.xl}px`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: SPACE.sm, flexWrap: "wrap", marginBottom: SPACE.sm, fontFamily: MONO, fontSize: TYPE.xs }}>
        <span style={{ color: r.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{r.label}</span>
        <span style={{ color: white(0.6) }}>{formatDate(node.date)}</span>
        {topic && <span style={{ color: topic.color }}><span aria-hidden="true">{topic.icon} </span>{topic.name}</span>}
        <span style={{ color: white(0.6) }}>{node.messages} messages</span>
      </div>
      <h3 style={{ fontFamily: FONTS, fontSize: TYPE.lg - 1, fontWeight: 700, color: C.white, margin: `0 0 ${SPACE.xs}px`, lineHeight: 1.3 }}>{node.title}</h3>
      <p style={{ margin: `0 0 ${SPACE.md}px`, fontFamily: BODY, fontSize: TYPE.base, color: white(0.75), lineHeight: 1.55 }}>{node.summary}</p>
      {node.snippet && (
        <figure style={{ margin: `0 0 ${SPACE.md}px`, background: black(0.3), border: `1px solid ${white(0.06)}`, borderRadius: 8, padding: `${SPACE.sm + 2}px ${SPACE.md}px`, display: "flex", flexDirection: "column", gap: SPACE.sm }}>
          {[["You", C.gold, node.snippet.user], ["AI", C.blue, node.snippet.ai]].map(([who, color, text]) => (
            <blockquote key={who} style={{ margin: 0, display: "flex", gap: SPACE.sm, fontFamily: BODY, fontSize: TYPE.sm, color: white(0.75), lineHeight: 1.5 }}>
              <span style={{ fontFamily: MONO, fontSize: TYPE.xs, fontWeight: 700, color, flexShrink: 0, width: 26, paddingTop: 1 }}>{who}</span>
              <span>{text}</span>
            </blockquote>
          ))}
        </figure>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: SPACE.md, flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: SPACE.sm, fontFamily: BODY, fontSize: TYPE.xs, color: white(0.6) }}>
          Atlas's confidence
          <span aria-hidden="true" style={{ width: 60, height: 4, background: white(0.08), borderRadius: 2, overflow: "hidden" }}>
            <span style={{ display: "block", width: `${node.confidence * 100}%`, height: "100%", background: r.color }} />
          </span>
          <span style={{ fontFamily: MONO }}>{Math.round(node.confidence * 100)}%</span>
        </span>
        {ev && onConversationClick
          ? <button onClick={() => onConversationClick(node.topicId, node.eventIndex)} style={linkButton(r.color)}>Open the conversation →</button>
          : topic && onTopicClick && <button onClick={() => onTopicClick(topic)} style={linkButton(topic.color)}>Open the {topic.name} timeline →</button>}
      </div>
    </article>
  );
};

const OtherChains = ({ exclude, onOpen, mobile }) => {
  const chains = Object.values(ARCHAEOLOGY_CHAINS).filter(c => c.id !== exclude);
  return (
    <section aria-labelledby="da-others" style={{ marginTop: SPACE.xxl }}>
      <h2 id="da-others" style={sectionTitle}>{exclude ? "Other decision chains" : "Decision chains"}</h2>
      <ul style={{ ...list, gap: SPACE.sm }}>
        {chains.map(c => (
          <li key={c.id}>
            <button onClick={() => onOpen(c.id)} style={{
              display: "flex", alignItems: "center", gap: SPACE.md, width: "100%", textAlign: "left",
              background: alpha(c.color, 0.05), border: `1px solid ${alpha(c.color, 0.3)}`, borderRadius: 10,
              padding: mobile ? SPACE.md : `${SPACE.md}px ${SPACE.lg}px`, cursor: "pointer",
            }}>
              <span aria-hidden="true" style={{ fontSize: 18, color: c.color, width: 22, textAlign: "center", flexShrink: 0 }}>{c.icon}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontFamily: BODY, fontSize: TYPE.base, fontWeight: 600, color: C.white }}>{c.title}</span>
                <span style={{ display: "block", fontFamily: BODY, fontSize: TYPE.sm, color: white(0.6), marginTop: 2 }}>
                  {c.nodes.length} conversations, {formatDate(c.nodes[0].date)} to {formatDate(c.nodes.at(-1).date)}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

// ─── The view ───────────────────────────────────────────────────
const DecisionArchaeology = ({ chainId, onBack, onOpenChain, onConversationClick, onTopicClick, mobile }) => {
  const chain = ARCHAEOLOGY_CHAINS[chainId];
  const [active, setActive] = useState(null);
  const open = onOpenChain || ((id) => onBack?.("archaeology", id));

  if (!chain) {
    return (
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <Breadcrumbs items={[{ label: "Overview", onClick: () => onBack?.() }, { label: "Decision chain not found" }]} />
        <h1 style={{ fontFamily: FONTS, fontSize: mobile ? TYPE.xl : TYPE.xxl, fontWeight: 800, color: C.white, margin: 0 }}>No chain called “{chainId}”</h1>
        <p style={{ fontFamily: BODY, fontSize: TYPE.md, color: white(0.65), lineHeight: 1.55, margin: `${SPACE.sm}px 0 0` }}>
          The link may be old. These are the decision chains Atlas has traced:
        </p>
        <OtherChains onOpen={open} mobile={mobile} />
      </div>
    );
  }

  const count = (role) => chain.nodes.filter(n => n.role === role).length;
  const span = spanInWords(chain.nodes[0].date, chain.nodes.at(-1).date);
  const pick = (id) => {
    setActive(id);
    const smooth = !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(() => document.getElementById(`node-${id}`)?.scrollIntoView?.({ behavior: smooth ? "smooth" : "auto", block: "center" }));
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <Breadcrumbs items={[{ label: "Overview", onClick: () => onBack?.() }, { label: chain.title }]} />

      <header style={{ marginBottom: SPACE.xl, maxWidth: 720 }}>
        <div style={{ fontFamily: MONO, fontSize: TYPE.xs, color: chain.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>Decision archaeology</div>
        <h1 style={{ fontFamily: FONTS, fontSize: mobile ? TYPE.xl : TYPE.xxl, fontWeight: 800, color: C.white, letterSpacing: "-0.01em", margin: `${SPACE.xs}px 0 0` }}>
          <span aria-hidden="true" style={{ color: chain.color }}>{chain.icon} </span>{chain.title}
        </h1>
        <p style={{ fontFamily: BODY, fontSize: mobile ? TYPE.base : TYPE.md, color: white(0.65), lineHeight: 1.55, margin: `${SPACE.sm}px 0 0` }}>
          {chain.summary}. Traced through {chain.nodes.length} conversations over {span}: {count("supporting")} for it, {count("challenging")} against.
        </p>
      </header>

      <section aria-labelledby="da-arc" style={{ background: white(0.02), border: `1px solid ${white(0.07)}`, borderRadius: 16, padding: mobile ? SPACE.md : SPACE.xl, marginBottom: SPACE.xl }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: SPACE.md, flexWrap: "wrap", marginBottom: SPACE.md }}>
          <h2 id="da-arc" style={{ ...sectionTitle, margin: 0 }}>How the argument went</h2>
          <ul aria-label="Roles" style={{ ...list, flexDirection: "row", flexWrap: "wrap", gap: `${SPACE.xs}px ${SPACE.md}px` }}>
            {Object.entries(ROLES).map(([k, r]) => (
              <li key={k} style={{ display: "flex", alignItems: "center", gap: SPACE.xs + 2, fontFamily: BODY, fontSize: TYPE.xs, color: white(0.7) }}>
                <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: k === "seed" || k === "resolution" ? 2 : "50%", border: `2px solid ${r.color}` }} />{r.label}
              </li>
            ))}
          </ul>
        </div>
        <TugOfWar chain={chain} active={active} onPick={pick} mobile={mobile} />
        <div style={{ marginTop: SPACE.lg, padding: `${SPACE.md}px ${SPACE.lg}px`, borderRadius: 10, background: alpha(C.blue, 0.06), border: `1px solid ${alpha(C.blue, 0.3)}` }}>
          <div style={{ fontFamily: MONO, fontSize: TYPE.xs, color: C.blue, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: SPACE.xs }}>Where it landed</div>
          <p style={{ margin: 0, fontFamily: BODY, fontSize: TYPE.base, color: white(0.85), lineHeight: 1.55 }}>{chain.resolution}</p>
        </div>
      </section>

      <section aria-labelledby="da-steps">
        <h2 id="da-steps" style={sectionTitle}>Step by step</h2>
        <ol style={list}>
          {chain.nodes.map(n => (
            <li key={n.id}>
              <Node node={n} active={active === n.id} onConversationClick={onConversationClick} onTopicClick={onTopicClick} mobile={mobile} />
            </li>
          ))}
        </ol>
      </section>

      <OtherChains exclude={chain.id} onOpen={(id) => { setActive(null); open(id); }} mobile={mobile} />
    </div>
  );
};

export default DecisionArchaeology;
