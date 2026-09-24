import { useState, useEffect, useRef, useId } from "react";
import { TOPICS, TIMELINE_DATA, SEARCH_RESULTS } from '../data/constants';
import { C, alpha, white, black, FONTS, BODY, MONO, SPACE, TYPE } from '../styles/tokens';

// The one search surface. ⌘K opens it anywhere, the Search action in the
// header opens it, and /search is not a page: the router opens this over the
// current view (with ?q= filled in) and hands the URL back.

// ─── Search, as data ────────────────────────────────────────────
export const PAGES = [
  { id: "dashboard", label: "Overview", icon: "◈", sub: "Atlas · every topic at a glance" },
  { id: "connections", label: "Connections", icon: "◎", sub: "Atlas · how your topics link" },
  { id: "evolution", label: "Evolution", icon: "◇", sub: "Atlas · phases and pivots" },
  { id: "curation", label: "Curate", icon: "◇", sub: "Review what Atlas extracted" },
  { id: "companion", label: "Ask", icon: "◆", sub: "Companion · ask your own history" },
  { id: "beliefDiffs", label: "Belief Diffs", icon: "⇄", sub: "Companion · what you changed your mind about" },
  { id: "digest", label: "Digest", icon: "▤", sub: "Companion · month by month" },
  { id: "liveCapture", label: "Live", icon: "●", sub: "Companion · what the model logged today" },
  { id: "export", label: "Export", icon: "↗", sub: "Markdown, JSON, CSV or an Obsidian vault" },
  { id: "rewind", label: "Rewind", icon: "⏪", sub: "Replay the map growing, month by month" },
];

// Every suggestion is a query some fixture answers (a test holds this).
export const SUGGESTIONS = [...new Set(SEARCH_RESULTS.map(r => r.query))];

export const wordsOf = (query) => query.toLowerCase().split(/\s+/).filter(Boolean);
const hasAll = (text, words) => { const t = text.toLowerCase(); return words.every(w => t.includes(w)); };

// Where a conversation result goes: its own conversation when the topic's
// timeline has an event that day, the topic's timeline otherwise, and
// nowhere for a conversation never filed under a topic.
export const targetOf = (result) => {
  if (!result.topicId) return null;
  const i = (TIMELINE_DATA[result.topicId] || []).findIndex(e => e.date === result.date);
  return i >= 0 ? { kind: "conversation", topicId: result.topicId, eventIndex: i } : { kind: "topic", topicId: result.topicId };
};

// Every word must appear somewhere; a result whose title holds more of the
// words ranks higher, then the newer one.
export const searchAll = (query) => {
  const words = wordsOf(query);
  if (!words.length) return { conversations: [], topics: TOPICS, pages: PAGES };
  const inTitle = (r) => words.filter(w => r.title.toLowerCase().includes(w)).length;
  const conversations = SEARCH_RESULTS
    .filter(r => hasAll(`${r.query} ${r.title} ${r.preview} ${r.platform}`, words))
    .sort((a, b) => inTitle(b) - inTitle(a) || b.date.localeCompare(a.date));
  const topics = TOPICS.filter(t => hasAll(`${t.name} ${t.category}`, words));
  const pages = PAGES.filter(p => hasAll(`${p.label} ${p.sub}`, words));
  return { conversations, topics, pages };
};

// The text split into runs, each marked whether it matched one of the words.
export const highlight = (text, words) => {
  if (!words.length) return [{ text, hit: false }];
  const escaped = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${escaped.join("|")})`, "ig");
  return text.split(re).filter(Boolean).map(part => ({ text: part, hit: words.includes(part.toLowerCase()) }));
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const formatDate = (iso) => { const [y, m, d] = iso.split("-").map(Number); return `${MONTHS[m - 1]} ${d}, ${y}`; };

const topicName = (id) => TOPICS.find(t => t.id === id)?.name;

// The groups flattened into the order the arrow keys walk. Browsing (no
// query yet) leads with the pages; a search leads with what it found.
export const optionsOf = ({ conversations, topics, pages }, browsing = false) => {
  const c = conversations.map(r => ({ key: `c-${r.title}`, group: "conversations", result: r, target: targetOf(r), disabled: !targetOf(r) }));
  const t = topics.map(x => ({ key: `t-${x.id}`, group: "topics", topic: x }));
  const p = pages.map(x => ({ key: `p-${x.id}`, group: "pages", page: x }));
  return browsing ? [...p, ...t] : [...c, ...t, ...p];
};

// Next enabled option from `from` in direction `dir` (1 or -1), clamped at the ends.
export const step = (options, from, dir) => {
  for (let i = from + dir; i >= 0 && i < options.length; i += dir) if (!options[i].disabled) return i;
  return from;
};

const GROUPS = [
  { id: "conversations", label: "Conversations" },
  { id: "topics", label: "Topics" },
  { id: "pages", label: "Go to" },
];

// ─── Pieces ─────────────────────────────────────────────────────
const Marked = ({ text, words }) => highlight(text, words).map((p, i) => p.hit
  ? <mark key={i} style={{ background: alpha(C.gold, 0.22), color: C.white, borderRadius: 3, padding: "0 1px" }}>{p.text}</mark>
  : p.text); // plain text, not a span: an accessible name drops a span's leading space

const kbd = { fontFamily: MONO, fontSize: TYPE.xs, color: white(0.55), padding: "2px 6px", borderRadius: 5, border: `1px solid ${white(0.14)}`, background: white(0.04) };

const Hint = ({ children, color = white(0.5) }) => (
  <span style={{ fontFamily: BODY, fontSize: TYPE.xs, color, flexShrink: 0, whiteSpace: "nowrap" }}>{children}</span>
);

const Row = ({ option, words, active, mobile }) => {
  if (option.group === "conversations") {
    const { result: r, target } = option;
    const platform = r.platform === "Claude" ? C.gold : C.blue;
    const where = target ? topicName(target.topicId) : "Unfiled";
    return (
      <>
        <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 4, background: platform, flexShrink: 0, marginTop: 6 }} />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontFamily: BODY, fontSize: TYPE.base, fontWeight: 600, color: option.disabled ? white(0.7) : C.white }}><Marked text={r.title} words={words} /></span>
          <span style={{ display: "block", fontFamily: BODY, fontSize: TYPE.sm, color: white(0.6), lineHeight: 1.45, marginTop: 2 }}><Marked text={r.preview} words={words} /></span>
          <span style={{ display: "block", fontFamily: MONO, fontSize: TYPE.xs, color: white(0.5), marginTop: SPACE.xs }}>
            <span style={{ color: platform }}>{r.platform}</span> · {formatDate(r.date)} · {where}
          </span>
        </span>
        {!mobile && (target
          ? <Hint color={active ? C.gold : white(0.5)}>{target.kind === "conversation" ? "Open conversation" : "Open timeline"}</Hint>
          : <Hint>No timeline to open</Hint>)}
      </>
    );
  }
  if (option.group === "topics") {
    const t = option.topic;
    return (
      <>
        <span aria-hidden="true" style={{ fontSize: 16, width: 22, textAlign: "center", flexShrink: 0 }}>{t.icon}</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontFamily: BODY, fontSize: TYPE.base, fontWeight: 600, color: C.white }}><Marked text={t.name} words={words} /></span>
          <span style={{ display: "block", fontFamily: BODY, fontSize: TYPE.sm, color: white(0.6), marginTop: 2 }}>{t.count} conversations · {t.category}</span>
        </span>
        <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 4, background: t.color, flexShrink: 0 }} />
      </>
    );
  }
  const p = option.page;
  return (
    <>
      <span aria-hidden="true" style={{ fontFamily: MONO, fontSize: TYPE.md, color: C.gold, width: 22, textAlign: "center", flexShrink: 0 }}>{p.icon}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontFamily: BODY, fontSize: TYPE.base, fontWeight: 600, color: C.white }}><Marked text={p.label} words={words} /></span>
        <span style={{ display: "block", fontFamily: BODY, fontSize: TYPE.sm, color: white(0.6), marginTop: 2 }}>{p.sub}</span>
      </span>
    </>
  );
};

const Suggestions = ({ onPick, label }) => (
  <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: SPACE.xs + 2 }}>
    <span style={{ fontFamily: BODY, fontSize: TYPE.xs, color: white(0.55), marginRight: SPACE.xs }}>{label}</span>
    {SUGGESTIONS.map(s => (
      <button key={s} onClick={() => onPick(s)} style={{
        fontFamily: BODY, fontSize: TYPE.xs, fontWeight: 500, color: white(0.75), background: white(0.04),
        border: `1px solid ${white(0.12)}`, borderRadius: 20, padding: `3px ${SPACE.sm + 2}px`, cursor: "pointer",
      }}>{s}</button>
    ))}
  </div>
);

// ─── The palette ────────────────────────────────────────────────
// Mounted only while open, so every opening starts from its initial query.
const Palette = ({ initialQuery = "", onClose, onNavigate, onTopicClick, onConversationClick, mobile }) => {
  const [query, setQuery] = useState(initialQuery);
  const words = wordsOf(query);
  const found = searchAll(query);
  const options = optionsOf(found, !words.length);
  const firstEnabled = step(options, -1, 1);
  const [active, setActive] = useState(firstEnabled);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const id = useId();
  const optionId = (i) => `${id}-option-${i}`;
  const current = options[active] && !options[active].disabled ? active : -1;

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView?.({ block: "nearest" });
  }, [current, query]);

  const search = (q) => {
    setQuery(q);
    setActive(step(optionsOf(searchAll(q), !wordsOf(q).length), -1, 1));
    inputRef.current?.focus();
  };

  const open = (option) => {
    if (!option || option.disabled) return;
    if (option.group === "conversations") {
      const t = option.target;
      if (t.kind === "conversation") onConversationClick?.(t.topicId, t.eventIndex);
      else onTopicClick?.(TOPICS.find(x => x.id === t.topicId));
    } else if (option.group === "topics") onTopicClick?.(option.topic);
    else onNavigate?.(option.page.id);
    onClose();
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
    // The arrows and Enter belong to the input; a focused button keeps its own Enter.
    if (e.target !== inputRef.current) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(step(options, current, 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(step(options, current < 0 ? options.length : current, -1)); }
    else if (e.key === "Enter") { e.preventDefault(); open(options[current]); }
  };

  const total = found.conversations.length + found.topics.length + found.pages.length;
  const status = !words.length ? "" : total === 0 ? `Nothing matches ${query.trim()}` : `${found.conversations.length} conversations, ${found.topics.length} topics, ${found.pages.length} pages`;

  return (
    <div role="dialog" aria-modal="true" aria-label="Search" onKeyDown={onKeyDown} style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: mobile ? `${SPACE.xxxl}px ${SPACE.lg}px` : `${SPACE.xxxl * 2}px ${SPACE.xl}px` }}>
      <div onClick={onClose} aria-hidden="true" style={{ position: "fixed", inset: 0, background: black(0.6), backdropFilter: "blur(4px)" }} />
      <div style={{
        position: "relative", width: "100%", maxWidth: 600, maxHeight: mobile ? "80vh" : "70vh", display: "flex", flexDirection: "column",
        background: C.bg2, border: `1px solid ${alpha(C.gold, 0.2)}`, borderRadius: 14,
        boxShadow: `0 24px 80px ${black(0.5)}, 0 0 0 1px ${white(0.05)}`, overflow: "hidden", animation: "fadeUp 0.15s ease both",
      }}>
        <div style={{ padding: mobile ? SPACE.md : `${SPACE.md + 2}px ${SPACE.lg + 2}px`, borderBottom: `1px solid ${white(0.08)}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: SPACE.md }}>
            <span aria-hidden="true" style={{ fontFamily: MONO, fontSize: TYPE.lg, color: C.gold }}>⌕</span>
            <input
              ref={inputRef}
              value={query}
              onChange={e => search(e.target.value)}
              role="combobox"
              aria-expanded="true"
              aria-controls={`${id}-list`}
              aria-autocomplete="list"
              aria-activedescendant={current >= 0 ? optionId(current) : undefined}
              aria-label="Search conversations, topics and pages"
              placeholder="Search conversations, topics, pages…"
              style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", fontFamily: BODY, fontSize: TYPE.md, color: C.white }}
            />
            {query && <button onClick={() => search("")} style={{ ...kbd, fontFamily: BODY, cursor: "pointer" }}>Clear</button>}
            <button onClick={onClose} aria-label="Close search" style={{ ...kbd, cursor: "pointer" }}>esc</button>
          </div>
          {!words.length && <div style={{ marginTop: SPACE.md }}><Suggestions onPick={search} label="Try" /></div>}
        </div>

        <div role="status" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{status}</div>

        <div ref={listRef} id={`${id}-list`} role="listbox" aria-label="Results" style={{ overflowY: "auto", flex: 1, padding: `${SPACE.xs}px 0` }}>
          {total === 0 && (
            <div style={{ padding: mobile ? SPACE.lg : `${SPACE.xl}px ${SPACE.xl}px` }}>
              <p style={{ fontFamily: FONTS, fontSize: TYPE.md, fontWeight: 600, color: C.white, margin: 0 }}>Nothing matches “{query.trim()}”</p>
              <p style={{ fontFamily: BODY, fontSize: TYPE.sm, color: white(0.6), lineHeight: 1.5, margin: `${SPACE.xs}px 0 ${SPACE.md}px` }}>
                Every word has to appear in a conversation, a topic or a page. This demo searches {SEARCH_RESULTS.length} sample conversations, {TOPICS.length} topics and {PAGES.length} pages.
              </p>
              <Suggestions onPick={search} label="These find something:" />
            </div>
          )}
          {[...GROUPS].sort((a, b) => options.findIndex(o => o.group === a.id) - options.findIndex(o => o.group === b.id)).map(g => {
            const rows = options.map((o, i) => [o, i]).filter(([o]) => o.group === g.id);
            if (!rows.length) return null;
            return (
              <div key={g.id} role="group" aria-labelledby={`${id}-${g.id}`}>
                <div id={`${id}-${g.id}`} style={{ display: "flex", justifyContent: "space-between", fontFamily: BODY, fontSize: TYPE.xs, fontWeight: 600, color: white(0.55), textTransform: "uppercase", letterSpacing: "0.08em", padding: `${SPACE.md}px ${mobile ? SPACE.md : SPACE.lg + 2}px ${SPACE.xs}px` }}>
                  <span>{g.label}</span><span aria-hidden="true" style={{ fontFamily: MONO, letterSpacing: 0 }}>{rows.length}</span>
                </div>
                {rows.map(([o, i]) => {
                  const on = i === current;
                  return (
                    <div
                      key={o.key}
                      id={optionId(i)}
                      role="option"
                      aria-selected={on}
                      aria-disabled={o.disabled || undefined}
                      onClick={() => open(o)}
                      onMouseMove={() => { if (!o.disabled && !on) setActive(i); }}
                      style={{
                        display: "flex", alignItems: o.group === "conversations" ? "flex-start" : "center", gap: SPACE.md,
                        padding: `${SPACE.sm + 2}px ${mobile ? SPACE.md : SPACE.lg + 2}px`, cursor: o.disabled ? "default" : "pointer",
                        background: on ? alpha(C.gold, 0.1) : "transparent",
                        boxShadow: on ? `inset 2px 0 0 ${C.gold}` : "none",
                      }}
                    >
                      <Row option={o} words={words} active={on} mobile={mobile} />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {!mobile && (
          <div style={{ display: "flex", alignItems: "center", gap: SPACE.lg, padding: `${SPACE.sm + 2}px ${SPACE.lg + 2}px`, borderTop: `1px solid ${white(0.08)}`, fontFamily: BODY, fontSize: TYPE.xs, color: white(0.55) }}>
            <span><span style={kbd}>↑</span> <span style={kbd}>↓</span> move</span>
            <span><span style={kbd}>↵</span> open</span>
            <span><span style={kbd}>esc</span> close</span>
            <span style={{ marginLeft: "auto" }}>{SEARCH_RESULTS.length} sample conversations are searchable</span>
          </div>
        )}
      </div>
    </div>
  );
};

const CommandPalette = ({ open, ...props }) => (open ? <Palette {...props} /> : null);

export default CommandPalette;
