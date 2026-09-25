import { useState } from "react";
import { TOPICS, CONNECTIONS, INSIGHTS, EVOLUTION_PHASES, VAULT_TREE, EXPORT_FORMATS, DEMO_NOW } from '../data/constants';
import { aliasText } from '../privacy';
import { C, alpha, white, black, FONTS, BODY, MONO, SPACE, TYPE } from '../styles/tokens';

// ─── The export, as data ────────────────────────────────────────
// Every preview and download is generated from the same fixtures the rest of
// the demo reads, so what you see here is exactly what you would get.
const TOPIC_BY_ID = Object.fromEntries(TOPICS.map(t => [t.id, t]));
const linksOf = (id) => CONNECTIONS.filter(c => c.from === id || c.to === id).map(c => ({ id: c.from === id ? c.to : c.from, label: c.label, strength: c.strength }));
const EXPORTED = `${DEMO_NOW.getFullYear()}-${String(DEMO_NOW.getMonth() + 1).padStart(2, "0")}-${String(DEMO_NOW.getDate()).padStart(2, "0")}`;

// RFC 4180: quote a field that holds a comma, a quote or a line break.
export const csvField = (v) => {
  const s = String(v ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const toCSV = (topics = TOPICS) => [
  "topic_id,name,category,conversations,words,first_seen,last_seen,depth,claude,chatgpt",
  ...topics.map(t => [t.id, t.name, t.category, t.count, t.words, t.firstSeen, t.lastSeen, t.depth, t.platform.claude, t.platform.gpt].map(csvField).join(",")),
].join("\n") + "\n";

export const toJSON = (topics = TOPICS, connections = CONNECTIONS) => JSON.stringify({
  atlas: {
    exported: EXPORTED,
    stats: { topics: topics.length, connections: connections.length, conversations: topics.reduce((a, t) => a + t.count, 0), words: topics.reduce((a, t) => a + t.words, 0) },
    topics: topics.map(t => ({ id: t.id, name: t.name, category: t.category, conversations: t.count, words: t.words, firstSeen: t.firstSeen, lastSeen: t.lastSeen, depth: t.depth, platform: t.platform })),
    connections: connections.map(c => ({ from: c.from, to: c.to, label: c.label, strength: c.strength })),
  },
}, null, 2) + "\n";

export const toMarkdown = (topics = TOPICS) => [
  "# Atlas knowledge export",
  "",
  `Exported ${EXPORTED}. ${topics.length} topics, ${CONNECTIONS.length} connections.`,
  ...topics.flatMap(t => [
    "",
    `## ${t.name}`,
    "",
    `- Category: ${t.category}`,
    `- Conversations: ${t.count} (${t.platform.claude} Claude, ${t.platform.gpt} ChatGPT)`,
    `- Words: ${t.words.toLocaleString("en-US")}`,
    `- Active: ${t.firstSeen} to ${t.lastSeen}`,
    ...linksOf(t.id).map(l => `- Connected to ${TOPIC_BY_ID[l.id]?.name}: ${l.label}`),
  ]),
].join("\n") + "\n";

export const vaultFiles = (nodes = VAULT_TREE, path = []) => nodes.flatMap(n => n.type === "folder" ? vaultFiles(n.children, [...path, n.name]) : [{ ...n, path: [...path, n.name].join("/") }]);

export const byteSize = (text) => new TextEncoder().encode(text).length;
export const formatBytes = (n) => n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} KB`;

const FILES = vaultFiles();
const OUTPUTS = {
  obsidian: { text: FILES.map(f => f.content).join("\n"), files: FILES.length },
  markdown: { text: toMarkdown(), files: 1, name: "atlas.md", type: "text/markdown" },
  json: { text: toJSON(), files: 1, name: "atlas.json", type: "application/json" },
  csv: { text: toCSV(), files: 1, name: "atlas.csv", type: "text/csv" },
};

// Hand the text to the browser as a file. Returns false where that isn't possible.
const download = (name, text, type) => {
  if (typeof URL === "undefined" || !URL.createObjectURL) return false;
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  return true;
};

// ─── Pieces ─────────────────────────────────────────────────────
const sectionTitle = { fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 600, color: white(0.55), textTransform: "uppercase", letterSpacing: "0.08em", margin: `0 0 ${SPACE.md}px` };
const list = { listStyle: "none", margin: 0, padding: 0 };
const button = (color, primary) => ({
  display: "inline-flex", alignItems: "center", gap: SPACE.xs + 2, fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 600,
  color: primary ? C.bg0 : color, background: primary ? color : alpha(color, 0.07),
  border: `1px solid ${primary ? color : alpha(color, 0.35)}`, borderRadius: 8, padding: `${SPACE.xs + 3}px ${SPACE.md}px`, cursor: "pointer",
});

const Wikilinks = ({ text }) => text.split(/(\[\[.*?\]\])/g).map((part, i) =>
  part.startsWith("[[") && part.endsWith("]]")
    ? <span key={i} style={{ color: C.gold, background: alpha(C.gold, 0.1), padding: "0 4px", borderRadius: 3 }}>{part.slice(2, -2)}</span>
    : part);

const Note = ({ content, mobile }) => (
  <div style={{ fontFamily: BODY, fontSize: TYPE.base, color: white(0.75), lineHeight: 1.7 }}>
    {content.split("\n").map((line, i) => {
      if (line.startsWith("# ")) return <div key={i} style={{ fontFamily: FONTS, fontSize: mobile ? TYPE.lg : TYPE.xl, color: C.white, fontWeight: 700, margin: `0 0 ${SPACE.sm}px` }}>{line.slice(2)}</div>;
      if (line.startsWith("## ")) return <div key={i} style={{ fontFamily: FONTS, fontSize: TYPE.md, color: C.gold, fontWeight: 600, margin: `${SPACE.md}px 0 ${SPACE.xs}px` }}>{line.slice(3)}</div>;
      if (line.startsWith("- ")) return <div key={i} style={{ paddingLeft: SPACE.md, position: "relative" }}><span aria-hidden="true" style={{ position: "absolute", left: 0, color: white(0.4) }}>·</span><Wikilinks text={line.slice(2)} /></div>;
      if (line.trim() === "") return <div key={i} style={{ height: SPACE.sm }} />;
      return <div key={i}><Wikilinks text={line.replace(/\*\*/g, "")} /></div>;
    })}
  </div>
);

const Tree = ({ nodes, open, toggle, selected, onSelect, depth = 0 }) => (
  <ul style={{ ...list, paddingLeft: depth ? SPACE.md : 0 }}>
    {nodes.map(n => n.type === "folder" ? (
      <li key={n.name}>
        <button onClick={() => toggle(n.name)} aria-expanded={Boolean(open[n.name])} style={{ display: "flex", alignItems: "center", gap: SPACE.xs + 2, width: "100%", background: "none", border: "none", padding: `${SPACE.xs + 1}px ${SPACE.sm}px`, cursor: "pointer", fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 600, color: C.white, textAlign: "left", borderRadius: 6 }}>
          <span aria-hidden="true" style={{ color: C.gold, fontSize: TYPE.xs, width: 10, display: "inline-block", transform: open[n.name] ? "rotate(90deg)" : "none" }}>▶</span>
          {n.name}<span style={{ fontFamily: MONO, fontSize: TYPE.xs, color: white(0.5), marginLeft: "auto" }}>{n.children.length}</span>
        </button>
        {open[n.name] && <Tree nodes={n.children} open={open} toggle={toggle} selected={selected} onSelect={onSelect} depth={depth + 1} />}
      </li>
    ) : (
      <li key={n.name}>
        <button onClick={() => onSelect(n.name)} aria-current={selected === n.name ? "true" : undefined} style={{
          display: "block", width: "100%", textAlign: "left", background: selected === n.name ? alpha(C.gold, 0.1) : "none",
          border: "none", borderLeft: `2px solid ${selected === n.name ? C.gold : "transparent"}`, padding: `${SPACE.xs + 1}px ${SPACE.sm}px ${SPACE.xs + 1}px ${SPACE.sm + 14}px`,
          cursor: "pointer", fontFamily: BODY, fontSize: TYPE.sm, color: selected === n.name ? C.gold : white(0.75), overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{n.name}</button>
      </li>
    ))}
  </ul>
);

const PREVIEW_LINES = 24;

// ─── The view ───────────────────────────────────────────────────
const ExportPreview = ({ mobile, privacy }) => {
  const [format, setFormat] = useState("obsidian");
  const [open, setOpen] = useState({ "Atlas Vault": true, "CourtCollect": true });
  const [file, setFile] = useState(FILES[0].name);
  const [status, setStatus] = useState("");
  const [card, setCard] = useState(0);
  const current = FILES.find(f => f.name === file);
  const out = OUTPUTS[format];
  const lines = out.text.trimEnd().split("\n");
  const cards = [
    ...EVOLUTION_PHASES.map(p => ({ key: p.title, title: p.title, kicker: p.period, body: p.desc, figure: `${p.conversations} conversations`, color: p.color })),
    ...INSIGHTS.map(x => ({ key: x.title, title: x.title, kicker: "Thinking pattern", body: x.desc, figure: `${x.pct}%`, color: C.gold })),
  ];
  const shown = cards[card];

  // With privacy mode on, what leaves the page carries the same stand-ins as
  // the screen (#86): the file, its name and anything copied.
  const hide = (t) => (privacy ? aliasText(t) : t);
  const save = (name, text, type) => setStatus(download(hide(name), hide(text), type) ? `Downloaded ${hide(name)}.` : "This browser can't save files from the page.");
  const copy = async (text, what) => {
    try { await navigator.clipboard.writeText(hide(text)); setStatus(`Copied ${hide(what)}.`); }
    catch (e) { console.warn("export copy:", e); setStatus("Copy didn't work here. Select the text and copy it instead."); }
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <header style={{ marginBottom: SPACE.xl, maxWidth: 680 }}>
        <h1 style={{ fontFamily: FONTS, fontSize: mobile ? TYPE.xl : TYPE.xxl, fontWeight: 800, color: C.white, letterSpacing: "-0.01em", margin: 0 }}>Take your atlas <span style={{ color: C.gold }}>with you</span></h1>
        <p style={{ fontFamily: BODY, fontSize: mobile ? TYPE.base : TYPE.md, color: white(0.6), lineHeight: 1.55, margin: `${SPACE.sm}px 0 0` }}>
          The same {TOPICS.length} topics and {CONNECTIONS.length} connections in four shapes. Each preview is the file itself, generated from your atlas; download or copy any of them.
        </p>
      </header>

      <section aria-labelledby="ex-formats" style={{ marginBottom: SPACE.xl }}>
        <h2 id="ex-formats" style={sectionTitle}>Format</h2>
        <div role="group" aria-label="Format" style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: SPACE.sm }}>
          {EXPORT_FORMATS.map(f => {
            const on = f.id === format;
            const o = OUTPUTS[f.id];
            return (
              <button key={f.id} onClick={() => { setFormat(f.id); setStatus(""); }} aria-pressed={on} style={{
                textAlign: "left", background: on ? alpha(C.gold, 0.1) : white(0.025), border: `1px solid ${on ? C.gold : white(0.1)}`,
                borderRadius: 10, padding: `${SPACE.md}px ${SPACE.md}px`, cursor: "pointer",
              }}>
                <span style={{ display: "block", fontFamily: BODY, fontSize: TYPE.base, fontWeight: 700, color: on ? C.gold : C.white }}><span aria-hidden="true">{f.icon} </span>{f.label}</span>
                <span style={{ display: "block", fontFamily: BODY, fontSize: TYPE.sm, color: white(0.65), marginTop: 2 }}>{f.desc}</span>
                <span style={{ display: "block", fontFamily: MONO, fontSize: TYPE.xs, color: white(0.6), marginTop: SPACE.xs }}>{o.files} file{o.files > 1 ? "s" : ""} · {formatBytes(byteSize(o.text))}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="ex-preview" style={{ background: white(0.02), border: `1px solid ${white(0.08)}`, borderRadius: 14, overflow: "hidden", marginBottom: SPACE.sm }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: SPACE.md, flexWrap: "wrap", padding: `${SPACE.md}px ${SPACE.lg}px`, borderBottom: `1px solid ${white(0.08)}` }}>
          <h2 id="ex-preview" style={{ margin: 0, fontFamily: MONO, fontSize: TYPE.sm, fontWeight: 600, color: white(0.75), overflowWrap: "anywhere" }}>
            {format === "obsidian" ? `Vault · ${current.path}` : `${out.name} · ${lines.length} lines`}
          </h2>
          <div style={{ display: "flex", gap: SPACE.sm, flexWrap: "wrap" }}>
            {format === "obsidian" ? (
              <>
                <button onClick={() => copy(current.content, current.name)} style={button(C.white)}>Copy note</button>
                <button onClick={() => save(current.name, current.content, "text/markdown")} style={button(C.gold, true)}>Download note</button>
              </>
            ) : (
              <>
                <button onClick={() => copy(out.text, out.name)} style={button(C.white)}>Copy</button>
                <button onClick={() => save(out.name, out.text, out.type)} style={button(C.gold, true)}>Download {out.name}</button>
              </>
            )}
          </div>
        </div>

        {format === "obsidian" ? (
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "260px 1fr" }}>
            <nav aria-label="Vault files" style={{ padding: SPACE.sm, borderRight: mobile ? "none" : `1px solid ${white(0.08)}`, borderBottom: mobile ? `1px solid ${white(0.08)}` : "none" }}>
              <Tree nodes={VAULT_TREE} open={open} toggle={(n) => setOpen(o => ({ ...o, [n]: !o[n] }))} selected={file} onSelect={(n) => { setFile(n); setStatus(""); }} />
            </nav>
            <div style={{ padding: mobile ? SPACE.md : SPACE.xl, minWidth: 0 }}>
              <Note content={current.content} mobile={mobile} />
              <p style={{ margin: `${SPACE.xl}px 0 0`, fontFamily: BODY, fontSize: TYPE.sm, color: white(0.55) }}>
                The demo vault holds {FILES.length} sample notes. A full export writes a note per topic and per conversation, linked the same way.
              </p>
            </div>
          </div>
        ) : (
          <pre tabIndex={0} aria-label={`${out.name} contents`} style={{ margin: 0, padding: mobile ? SPACE.md : SPACE.lg, background: black(0.3), fontFamily: MONO, fontSize: TYPE.sm, color: white(0.8), lineHeight: 1.6, overflowX: "auto", whiteSpace: "pre" }}>
            {lines.slice(0, PREVIEW_LINES).join("\n")}
            {lines.length > PREVIEW_LINES && <span style={{ color: white(0.5) }}>{`\n… ${lines.length - PREVIEW_LINES} more lines in the file`}</span>}
          </pre>
        )}
      </section>
      {privacy && <p style={{ margin: `0 0 ${SPACE.sm}px`, fontFamily: BODY, fontSize: TYPE.sm, color: white(0.6) }}>Privacy mode is on, so downloads and copies use the same stand-ins as the screen.</p>}
      <p role="status" style={{ minHeight: 20, margin: `0 0 ${SPACE.xl}px`, fontFamily: BODY, fontSize: TYPE.sm, color: C.green }}>{status}</p>

      <section aria-labelledby="ex-share">
        <h2 id="ex-share" style={sectionTitle}>Share a card</h2>
        <div role="group" aria-label="Card" style={{ display: "flex", flexWrap: "wrap", gap: SPACE.xs + 2, marginBottom: SPACE.md }}>
          {cards.map((c, i) => (
            <button key={c.key} onClick={() => setCard(i)} aria-pressed={i === card} style={{
              fontFamily: BODY, fontSize: TYPE.sm, fontWeight: 500, color: i === card ? C.bg0 : white(0.8),
              background: i === card ? c.color : white(0.04), border: `1px solid ${i === card ? c.color : white(0.14)}`,
              borderRadius: 20, padding: `${SPACE.xs + 1}px ${SPACE.md}px`, cursor: "pointer",
            }}>{c.title}</button>
          ))}
        </div>
        <figure style={{ margin: 0, background: alpha(shown.color, 0.07), border: `1px solid ${alpha(shown.color, 0.4)}`, borderRadius: 16, padding: mobile ? SPACE.lg : `${SPACE.xl}px ${SPACE.xxl}px` }}>
          <div style={{ fontFamily: MONO, fontSize: TYPE.xs, color: white(0.6), textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: SPACE.md }}>Atlas · {shown.kicker}</div>
          <div style={{ fontFamily: FONTS, fontSize: mobile ? TYPE.xl : TYPE.xxl, color: C.white, fontWeight: 800, letterSpacing: "-0.02em" }}>{shown.title}</div>
          <p style={{ fontFamily: BODY, fontSize: TYPE.md, color: white(0.75), lineHeight: 1.55, margin: `${SPACE.sm}px 0 ${SPACE.md}px`, maxWidth: 520 }}>{shown.body}</p>
          <div style={{ fontFamily: FONTS, fontSize: TYPE.xl, fontWeight: 800, color: shown.color }}>{shown.figure}</div>
          <figcaption style={{ marginTop: SPACE.lg }}>
            <button onClick={() => copy(`${shown.title} (${shown.kicker}): ${shown.body} ${shown.figure}.`, "the card as text")} style={button(shown.color, true)}>Copy as text</button>
          </figcaption>
        </figure>
      </section>
    </div>
  );
};

export default ExportPreview;
