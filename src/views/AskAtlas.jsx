import { useState, useEffect, useRef } from "react";
import {
  TOPICS, COMPANION_RESPONSES, COMPANION_SUGGESTION_CHIPS,
  CONTRADICTION_TYPE_CONFIG, RESOLUTION_OPTIONS,
} from '../data/constants';
import { C, alpha, white, FONTS, BODY, MONO, SPACE, TYPE } from '../styles/tokens';

// Ask Atlas: the Companion station's home and the demo's closer. Answers are
// built from the user's own conversations and every claim carries a citation;
// clicking a citation opens the sources with that one highlighted. The drift
// panel beside it lists positions that may have shifted. V7_PLAN.md row 5.

const ANSWER_DELAY = 1500;
const RESOLVE_DELAY = 500;
const DEMO_ANSWER = "This demo answers the four suggested questions. With your real history, Atlas would search all 3,847 conversations, match your question against your curated topics, decisions and insights, and answer in your own words with every source cited.";
const DRIFT_COLOR = { hard: C.red, soft: C.orange, stale: C.purple };

export function confidenceLabel(c) {
  if (c >= 0.9) return { text: "High confidence", color: C.green };
  if (c >= 0.75) return { text: "Good confidence", color: C.gold };
  if (c >= 0.5) return { text: "Moderate confidence", color: C.orange };
  return { text: "Low confidence", color: C.red };
}

/** Split an answer into text and citation parts: "a [1] b" -> ["a ", 1, " b"]. Pure. */
export function splitCitations(text) {
  return text.split(/(\[\d+\])/g).filter(Boolean).map(p => {
    const m = p.match(/^\[(\d+)\]$/);
    return m ? Number(m[1]) : p;
  });
}

/**
 * Group each citation with the word before it and the punctuation after it,
 * so a line never breaks between a claim and its number ("developer [1].").
 * Returns strings and { before, cites, after } runs. Pure.
 */
export function citationRuns(text) {
  const parts = splitCitations(text);
  const out = [];
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (typeof p !== "number") { out.push(p); continue; }
    const run = { before: "", cites: [p], after: "" };
    const prev = out[out.length - 1];
    if (typeof prev === "string") {
      const m = prev.match(/(\S+\s?)$/);
      if (m) { run.before = m[1]; out[out.length - 1] = prev.slice(0, -m[1].length); }
    }
    while (typeof parts[i + 1] === "number") run.cites.push(parts[++i]);
    if (typeof parts[i + 1] === "string") {
      run.after = parts[i + 1].match(/^[^\s\w]*/)[0];
      parts[i + 1] = parts[i + 1].slice(run.after.length);
    }
    out.push(run);
  }
  return out.filter(x => x !== "");
}

const Badge = ({ color, children }) => (
  <span style={{ fontFamily: BODY, fontSize: TYPE.xs, padding: `2px ${SPACE.sm}px`, borderRadius: 20, background: alpha(color, 0.12), color, fontWeight: 600 }}>{children}</span>
);

const Highlighted = ({ text, highlight }) => {
  const parts = highlight ? text.split(highlight) : [text];
  return parts.map((part, i) => (
    <span key={i}>{part}{i < parts.length - 1 && (
      <mark style={{ background: alpha(C.gold, 0.2), color: C.gold, padding: "1px 2px", borderRadius: 2, fontStyle: "normal", fontWeight: 500 }}>{highlight}</mark>
    )}</span>
  ));
};

const Answer = ({ msg, mobile, onConversationClick }) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const conf = msg.confidence ? confidenceLabel(msg.confidence) : null;
  const sources = msg.sources || [];
  const sourceRefs = useRef({});
  const cite = (n) => { setOpen(true); setActive(n); };
  useEffect(() => {
    if (!open || active == null) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    sourceRefs.current[active]?.scrollIntoView?.({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [open, active]);

  return (
    <article aria-label="Atlas answer" style={{ background: white(0.03), border: `1px solid ${white(0.08)}`, borderRadius: 14, padding: mobile ? SPACE.lg : `${SPACE.xl - 4}px ${SPACE.xl}px`, marginBottom: SPACE.xl, animation: "fadeUp 0.4s ease both" }}>
      <div style={{ display: "flex", alignItems: "center", gap: SPACE.sm, marginBottom: SPACE.md, flexWrap: "wrap" }}>
        <span style={{ fontFamily: MONO, fontSize: TYPE.xs, color: C.gold, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>◆ Atlas</span>
        {conf && <Badge color={conf.color}>{conf.text} · {Math.round(msg.confidence * 100)}%</Badge>}
        {sources.length > 0 && <Badge color={C.gold}>{sources.length} source{sources.length === 1 ? "" : "s"}</Badge>}
        {msg.isDemo && <Badge color={C.violet}>Demo</Badge>}
        {msg.freshnessWarning && <Badge color={C.red}>⏳ Stale sources</Badge>}
      </div>

      <p style={{ fontFamily: BODY, fontSize: mobile ? TYPE.base : TYPE.md, color: white(0.8), lineHeight: 1.7, margin: 0 }}>
        {citationRuns(msg.answer).map((part, i) => typeof part === "string" ? <span key={i}>{part}</span> : (
          <span key={i} style={{ whiteSpace: "nowrap" }}>
            {part.before}
            {part.cites.map(n => (
              <button key={n} onClick={() => cite(n)} aria-label={`Source ${n}`} aria-pressed={active === n} style={{
                fontFamily: MONO, fontSize: TYPE.xs, fontWeight: 600, lineHeight: 1, verticalAlign: "super",
                color: active === n ? C.bg0 : C.gold, background: active === n ? C.gold : alpha(C.gold, 0.14),
                border: "none", borderRadius: 4, padding: "2px 5px", margin: "0 1px", cursor: "pointer",
              }}>{n}</button>
            ))}
            {part.after}
          </span>
        ))}
      </p>

      {msg.freshnessWarning && (
        <div style={{ display: "flex", gap: SPACE.sm, alignItems: "center", marginTop: SPACE.md, padding: `${SPACE.sm}px ${SPACE.md}px`, background: alpha(C.red, 0.06), border: `1px solid ${alpha(C.red, 0.15)}`, borderRadius: 8, fontFamily: BODY, fontSize: TYPE.sm, color: alpha(C.red, 0.9) }}>
          <span aria-hidden>⏳</span>{msg.freshnessWarning}
        </div>
      )}

      {sources.length > 0 && (
        <div style={{ marginTop: SPACE.lg, borderTop: `1px solid ${white(0.06)}`, paddingTop: SPACE.md }}>
          <button onClick={() => { setOpen(o => !o); if (open) setActive(null); }} aria-expanded={open} style={{
            fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 500, color: white(0.65), background: "none", border: "none", padding: 0, cursor: "pointer",
            display: "flex", alignItems: "center", gap: SPACE.sm,
          }}>
            <span aria-hidden style={{ display: "inline-block", transition: "transform 0.2s", transform: open ? "rotate(90deg)" : "none", fontSize: TYPE.xs }}>▶</span>
            {open ? "Hide sources" : `Show the ${sources.length} conversations this came from`}
          </button>
          {open && (
            <ol aria-label="Sources" style={{ listStyle: "none", margin: `${SPACE.md}px 0 0`, padding: 0, display: "flex", flexDirection: "column", gap: SPACE.sm }}>
              {sources.map(src => {
                const topic = TOPICS.find(t => t.id === src.topicId);
                const isActive = active === src.id;
                return (
                  <li key={src.id} ref={el => { sourceRefs.current[src.id] = el; }} aria-current={isActive ? "true" : undefined} style={{
                    background: isActive ? alpha(C.gold, 0.06) : white(0.02), border: `1px solid ${isActive ? alpha(C.gold, 0.45) : white(0.07)}`,
                    borderRadius: 10, padding: mobile ? SPACE.md : `${SPACE.md}px ${SPACE.lg}px`, transition: "border-color 0.2s, background 0.2s",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: SPACE.sm, marginBottom: SPACE.xs, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: MONO, fontSize: TYPE.xs, fontWeight: 700, color: C.bg0, background: C.gold, minWidth: 18, height: 18, borderRadius: 9, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{src.id}</span>
                      <span style={{ fontFamily: BODY, fontSize: TYPE.sm, color: topic?.color || C.gold, fontWeight: 600 }}><span aria-hidden>{topic?.icon}</span> {src.topicName}</span>
                      <span style={{ fontFamily: MONO, fontSize: TYPE.xs, color: white(0.45) }}>{src.date}</span>
                    </div>
                    <div style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.8), fontWeight: 600, marginBottom: SPACE.xs }}>{src.title}</div>
                    <blockquote style={{ margin: 0, fontFamily: BODY, fontSize: TYPE.sm, color: white(0.6), lineHeight: 1.6, fontStyle: "italic" }}>
                      “<Highlighted text={src.excerpt} highlight={src.highlight} />”
                    </blockquote>
                    <button onClick={() => onConversationClick && onConversationClick(src.topicId)} style={{
                      marginTop: SPACE.sm, fontFamily: BODY, fontSize: TYPE.xs, color: C.gold, background: "none", border: "none", padding: 0, cursor: "pointer",
                    }}>Open the {src.topicName} timeline →</button>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      )}
    </article>
  );
};

const DriftSide = ({ label, side, color, onConversationClick }) => (
  <div style={{ background: white(0.03), border: `1px solid ${white(0.07)}`, borderRadius: 8, padding: `${SPACE.sm}px ${SPACE.md}px`, marginBottom: SPACE.sm }}>
    <div style={{ display: "flex", gap: SPACE.sm, marginBottom: SPACE.xs }}>
      <span style={{ fontFamily: MONO, fontSize: TYPE.xs, color: white(0.5), fontWeight: 600 }}>{label}</span>
      <span style={{ fontFamily: MONO, fontSize: TYPE.xs, color: white(0.4) }}>{side.source.conversationDate}</span>
    </div>
    <div style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.7), lineHeight: 1.5 }}>{side.position}</div>
    <button onClick={() => onConversationClick && onConversationClick(side.source.topicId)} style={{ marginTop: SPACE.xs, fontFamily: BODY, fontSize: TYPE.xs, color, background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>
      {side.source.topicName} · {side.source.title} →
    </button>
  </div>
);

const DriftCard = ({ c, expanded, resolving, onToggle, onResolve, onConversationClick }) => {
  const cfg = CONTRADICTION_TYPE_CONFIG[c.type];
  const color = DRIFT_COLOR[c.type] || C.purple;
  return (
    <li style={{
      background: alpha(color, 0.06), border: `1px solid ${alpha(color, expanded ? 0.4 : 0.2)}`, borderRadius: 10,
      transition: "opacity 0.3s, transform 0.3s", opacity: resolving ? 0 : 1, transform: resolving ? "translateX(16px)" : "none",
    }}>
      <button onClick={onToggle} aria-expanded={expanded} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: `${SPACE.md}px ${SPACE.md + 2}px` }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: SPACE.sm, marginBottom: SPACE.xs }}>
          <span aria-hidden style={{ color }}>{cfg.icon}</span>
          <span style={{ fontFamily: BODY, fontSize: TYPE.xs, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{cfg.label}</span>
        </div>
        <div style={{ fontFamily: BODY, fontSize: TYPE.xs, color: white(0.5), marginBottom: SPACE.xs }}><span aria-hidden>{c.icon}</span> {c.topic}</div>
        <div style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.75), lineHeight: 1.5 }}>{c.summary}</div>
      </button>
      {expanded && (
        <div style={{ padding: `0 ${SPACE.md + 2}px ${SPACE.md}px` }}>
          <DriftSide label="EARLIER" side={c.earlier} color={color} onConversationClick={onConversationClick} />
          <DriftSide label="NOW" side={c.current} color={color} onConversationClick={onConversationClick} />
          <div style={{ fontFamily: MONO, fontSize: TYPE.xs, color: white(0.5), margin: `${SPACE.xs}px 0` }}>How should Atlas record this?</div>
          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.xs }}>
            {RESOLUTION_OPTIONS.map(opt => (
              <button key={opt.id} onClick={() => onResolve(opt.id)} style={{
                display: "flex", alignItems: "center", gap: SPACE.sm, textAlign: "left", width: "100%",
                fontFamily: BODY, color: white(0.8), background: white(0.04), border: `1px solid ${white(0.1)}`, borderRadius: 6,
                padding: `${SPACE.sm - 1}px ${SPACE.md - 2}px`, cursor: "pointer",
              }}>
                <span aria-hidden style={{ width: 14, textAlign: "center", color }}>{opt.icon}</span>
                <span>
                  <span style={{ display: "block", fontSize: TYPE.sm, fontWeight: 600 }}>{opt.label}</span>
                  <span style={{ display: "block", fontSize: TYPE.xs, color: white(0.5) }}>{opt.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </li>
  );
};

const DriftPanel = ({ contradictions, resolved, mobile, onResolveContradiction, onConversationClick, timersRef }) => {
  const [expanded, setExpanded] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);
  const [showResolved, setShowResolved] = useState(false);

  const resolve = (id, type) => {
    setResolvingId(id);
    timersRef.current.push(setTimeout(() => {
      onResolveContradiction && onResolveContradiction(id, type);
      setResolvingId(null);
      setExpanded(null);
    }, RESOLVE_DELAY));
  };

  return (
    <aside aria-label="Thinking drift" style={{ width: mobile ? "100%" : 300, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: SPACE.xs }}>
        <h2 style={{ fontFamily: FONTS, fontSize: TYPE.lg, color: C.white, fontWeight: 700 }}>Thinking drift</h2>
        {contradictions.length > 0 && <Badge color={C.red}>{contradictions.length} open</Badge>}
      </div>
      <p style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.5), lineHeight: 1.5, marginBottom: SPACE.md }}>Places where what you do now contradicts what you decided earlier.</p>

      {contradictions.length === 0 ? (
        <div style={{ textAlign: "center", padding: `${SPACE.xl}px ${SPACE.md}px`, background: white(0.02), border: `1px dashed ${white(0.1)}`, borderRadius: 10 }}>
          <div aria-hidden style={{ fontSize: 20, color: C.green, marginBottom: SPACE.xs }}>✓</div>
          <div style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.7), fontWeight: 600 }}>No drift right now</div>
          <div style={{ fontFamily: BODY, fontSize: TYPE.xs, color: white(0.45), marginTop: SPACE.xs }}>Atlas checks new conversations against your decisions on every sync.</div>
        </div>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: SPACE.sm }}>
          {contradictions.map(c => (
            <DriftCard key={c.id} c={c} expanded={expanded === c.id} resolving={resolvingId === c.id}
              onToggle={() => setExpanded(expanded === c.id ? null : c.id)}
              onResolve={type => resolve(c.id, type)} onConversationClick={onConversationClick} />
          ))}
        </ul>
      )}

      {resolved.length > 0 && (
        <div style={{ marginTop: SPACE.md }}>
          <button onClick={() => setShowResolved(s => !s)} aria-expanded={showResolved} style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.55), background: "none", border: "none", padding: 0, cursor: "pointer" }}>
            {showResolved ? "▾" : "▸"} {resolved.length} resolved
          </button>
          {showResolved && (
            <ul style={{ listStyle: "none", margin: `${SPACE.sm}px 0 0`, padding: 0, display: "flex", flexDirection: "column", gap: SPACE.xs }}>
              {resolved.map(c => (
                <li key={c.id} style={{ fontFamily: BODY, fontSize: TYPE.xs, color: white(0.55), padding: `${SPACE.sm}px ${SPACE.md}px`, background: white(0.02), border: `1px solid ${white(0.06)}`, borderRadius: 8 }}>
                  <span style={{ color: C.green }}>✓</span> {c.topic}: {RESOLUTION_OPTIONS.find(r => r.id === c.resolution)?.label || c.resolution}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </aside>
  );
};

const AskAtlas = ({ onConversationClick, mobile, contradictions = [], resolvedContradictions = [], onResolveContradiction }) => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const timersRef = useRef([]);
  const endRef = useRef(null);

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);
  useEffect(() => {
    if (!messages.length) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    endRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
  }, [messages.length, isTyping]);

  const asked = new Set(messages.filter(m => m.role === "user").map(m => m.text));
  const remaining = COMPANION_SUGGESTION_CHIPS.filter(q => !asked.has(q));

  const ask = (q) => {
    const text = (q ?? query).trim();
    if (!text || isTyping) return;
    setMessages(prev => [...prev, { role: "user", text }]);
    setQuery("");
    setIsTyping(true);
    const answer = COMPANION_RESPONSES[text];
    timersRef.current.push(setTimeout(() => {
      setMessages(prev => [...prev, answer ? { role: "atlas", ...answer } : { role: "atlas", isDemo: true, answer: DEMO_ANSWER, sources: [] }]);
      setIsTyping(false);
    }, ANSWER_DELAY));
  };

  const chat = (
    <section aria-label="Ask Atlas" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
      <header style={{ marginBottom: SPACE.xl }}>
        <h1 style={{ fontFamily: FONTS, fontSize: mobile ? TYPE.xl : TYPE.xxl, color: C.white, fontWeight: 800, letterSpacing: "-0.01em" }}>Ask <span style={{ color: C.gold }}>Atlas</span></h1>
        <p style={{ fontFamily: BODY, fontSize: TYPE.base, color: white(0.55), marginTop: SPACE.xs, lineHeight: 1.5 }}>Answers built from your own conversations, with every source cited. Click a number to see where it came from.</p>
      </header>

      <div aria-live="polite" style={{ flex: 1 }}>
        {messages.length === 0 && (
          <div style={{ animation: "fadeUp 0.4s ease both" }}>
            <div style={{ fontFamily: BODY, fontSize: TYPE.xs, color: alpha(C.gold, 0.8), textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600, marginBottom: SPACE.sm }}>Try one of these</div>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: SPACE.sm }}>
              {COMPANION_SUGGESTION_CHIPS.map(q => (
                <button key={q} onClick={() => ask(q)} style={{
                  textAlign: "left", fontFamily: BODY, fontSize: TYPE.base, color: white(0.8), lineHeight: 1.45,
                  background: white(0.03), border: `1px solid ${white(0.09)}`, borderRadius: 12, padding: `${SPACE.md}px ${SPACE.lg}px`, cursor: "pointer",
                  display: "flex", gap: SPACE.sm, alignItems: "flex-start",
                }}><span aria-hidden style={{ color: C.gold }}>◆</span>{q}</button>
              ))}
            </div>
            <p style={{ fontFamily: BODY, fontSize: TYPE.xs, color: white(0.45), marginTop: SPACE.md, lineHeight: 1.5 }}>The demo answers these four. Any other question shows what a real answer would draw on.</p>
          </div>
        )}

        {messages.map((msg, i) => msg.role === "user" ? (
          <div key={i} style={{ display: "flex", justifyContent: "flex-end", marginBottom: SPACE.md }}>
            <div style={{ maxWidth: mobile ? "90%" : "75%", background: alpha(C.gold, 0.1), border: `1px solid ${alpha(C.gold, 0.25)}`, borderRadius: "14px 14px 4px 14px", padding: `${SPACE.sm + 2}px ${SPACE.lg}px`, fontFamily: BODY, fontSize: TYPE.base, color: C.white, lineHeight: 1.5 }}>{msg.text}</div>
          </div>
        ) : <Answer key={i} msg={msg} mobile={mobile} onConversationClick={onConversationClick} />)}

        {isTyping && (
          <div role="status" aria-label="Atlas is answering" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: SPACE.md, padding: `${SPACE.md}px ${SPACE.lg}px`, background: white(0.03), border: `1px solid ${white(0.08)}`, borderRadius: "14px 14px 14px 4px" }}>
            <span style={{ fontFamily: MONO, fontSize: TYPE.xs, color: C.gold, marginRight: SPACE.xs }}>◆ Atlas</span>
            {[0, 0.15, 0.3].map(d => <span key={d} className="atlas-typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: alpha(C.gold, 0.7), animationDelay: `${d}s` }} />)}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={{ paddingTop: SPACE.md, marginTop: SPACE.md, borderTop: messages.length ? `1px solid ${white(0.07)}` : "none" }}>
        {messages.length > 0 && remaining.length > 0 && (
          <div style={{ display: "flex", gap: SPACE.xs + 2, flexWrap: "wrap", marginBottom: SPACE.sm }}>
            {remaining.map(q => (
              <button key={q} onClick={() => ask(q)} disabled={isTyping} style={{
                fontFamily: BODY, fontSize: TYPE.sm, color: white(0.7), background: white(0.04), border: `1px solid ${white(0.1)}`,
                borderRadius: 16, padding: `${SPACE.xs + 1}px ${SPACE.md}px`, cursor: isTyping ? "default" : "pointer", textAlign: "left",
              }}>{q}</button>
            ))}
          </div>
        )}
        <form onSubmit={e => { e.preventDefault(); ask(); }} style={{ display: "flex", gap: SPACE.sm }}>
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} disabled={isTyping}
            aria-label="Ask a question about your conversations" placeholder="Ask about your knowledge base…"
            style={{ flex: 1, minWidth: 0, fontFamily: BODY, fontSize: TYPE.md, color: C.white, background: white(0.05), border: `1px solid ${white(0.14)}`, borderRadius: 12, padding: `${SPACE.md}px ${SPACE.lg}px`, outline: "none" }} />
          <button type="submit" disabled={isTyping || !query.trim()} style={{
            fontFamily: BODY, fontSize: TYPE.base, fontWeight: 600, borderRadius: 12, border: "none", padding: `${SPACE.md}px ${SPACE.xl}px`, flexShrink: 0,
            color: isTyping || !query.trim() ? white(0.35) : C.bg0, background: isTyping || !query.trim() ? white(0.06) : C.gold,
            cursor: isTyping || !query.trim() ? "default" : "pointer",
          }}>Ask</button>
        </form>
      </div>
    </section>
  );

  return (
    <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", gap: mobile ? SPACE.xxl : SPACE.xl, alignItems: "flex-start" }}>
      {chat}
      <DriftPanel contradictions={contradictions} resolved={resolvedContradictions} mobile={mobile}
        onResolveContradiction={onResolveContradiction} onConversationClick={onConversationClick} timersRef={timersRef} />
    </div>
  );
};

export default AskAtlas;
