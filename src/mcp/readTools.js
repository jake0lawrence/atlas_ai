// The read side of the v8 MCP server (V8_PLAN.md, PR 2), as pure functions
// over the demo fixtures, so the prototype server in research/v8-mcp and the
// tests share one implementation. PR 1 replaces the fixtures with the SQLite
// seed; the shapes here stay.
//
// Every result item has one shape (research/v8-mcp/INTEGRATIONS.md, section 4):
// an absolute `url` into the Atlas app plus `title` and `subtitle`, which is
// what ChatGPT needs to build a citation and what Microsoft 365 Copilot infers
// clickable citations from. With privacy on (#86), every string that leaves
// Atlas carries the same stand-ins as the screen, ids and urls included.
import {
  TOPICS, CONNECTIONS, TIMELINE_DATA, INSIGHT_DECISIONS, PIVOT_ENTRIES, CONTRADICTIONS_INITIAL,
} from '../data/constants.js';
import { aliasText } from '../privacy.js';

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const TOPIC_BY_ID = Object.fromEntries(TOPICS.map(t => [t.id, t]));
export const DECISION_KINDS = ["decision", "pivot", "milestone"];

// "Dec 2025" -> "2025-12", so pivots sort and filter with the ISO dates.
const monthToIso = (text) => {
  const [m, y] = text.split(" ");
  return `${y}-${String(MONTHS.indexOf(m) + 1).padStart(2, "0")}`;
};

// A conversation link only when the topic's timeline has an event that day
// (the rule the palette and archaeology use), the topic's timeline otherwise.
const pathFor = (topicId, date) => {
  const i = (TIMELINE_DATA[topicId] || []).findIndex(e => e.date === date);
  return i >= 0 ? `/topic/${topicId}/conversation/${i}` : `/topic/${topicId}`;
};

const wordsOf = (query) => String(query || "").toLowerCase().split(/\s+/).filter(Boolean);

export function createReadTools({ baseUrl = "http://localhost:5173", privacy = false } = {}) {
  const show = privacy ? aliasText : (s) => s;
  // Private links carry the alias as a slug (/topic/product-a): they no longer
  // resolve in the app, which is the price of not naming the topic.
  const url = (path) => new URL(privacy ? aliasText(path).replace(/ /g, "-").toLowerCase() : path, baseUrl).toString();
  const item = ({ id, kind, title, subtitle, snippet, date, topicId, path }) => ({
    id: show(id), kind, title: show(title), subtitle: show(subtitle), snippet: show(snippet), date, topicId: show(topicId), url: url(path),
  });
  const topicName = (id) => TOPIC_BY_ID[id]?.name || id;

  const events = Object.entries(TIMELINE_DATA).flatMap(([topicId, list]) => list.map((e, i) => item({
    id: `event:${topicId}:${i}`, kind: DECISION_KINDS.includes(e.type) ? e.type : "conversation",
    title: e.title, subtitle: `${topicName(topicId)} · ${e.date} · ${e.messages} messages`, snippet: e.summary,
    date: e.date, topicId, path: `/topic/${topicId}/conversation/${i}`,
  })));
  const curated = INSIGHT_DECISIONS.map(d => item({
    id: `decision:${d.id}`, kind: d.type, title: d.aiProposal, subtitle: d.sourceRef, snippet: d.aiProposal,
    date: d.date, topicId: d.topicId, path: pathFor(d.topicId, d.date),
  }));
  const pivots = PIVOT_ENTRIES.map(p => item({
    id: `pivot:${p.id}`, kind: "pivot", title: p.title, subtitle: `${topicName(p.topicId)} · ${p.date}`,
    snippet: `Before: ${p.before} After: ${p.after}`, date: monthToIso(p.date), topicId: p.topicId, path: `/topic/${p.topicId}`,
  }));
  const everything = [...curated, ...pivots, ...events];

  const filter = (list, { topic, since, kind } = {}) => list.filter(r =>
    (!topic || r.topicId === show(topic)) && (!since || r.date >= since) && (!kind || r.kind === kind));

  return {
    // Every word must appear in the title, subtitle or snippet (as shown);
    // curated decisions rank first, then more words in the title, then newer.
    search({ query, topic, since, limit = 10 } = {}) {
      const words = wordsOf(query);
      const hits = filter(everything, { topic, since }).filter(r => {
        const text = `${r.title} ${r.subtitle} ${r.snippet}`.toLowerCase();
        return words.every(w => text.includes(w));
      });
      const inTitle = (r) => words.filter(w => r.title.toLowerCase().includes(w)).length;
      const rank = (r) => (r.id.startsWith("decision:") ? 1 : 0);
      hits.sort((a, b) => rank(b) - rank(a) || inTitle(b) - inTitle(a) || b.date.localeCompare(a.date));
      return { results: hits.slice(0, limit) };
    },

    topic({ id } = {}) {
      const t = TOPICS.find(x => show(x.id) === id || x.id === id);
      if (!t) return { error: `No topic "${id}". Topics: ${TOPICS.map(x => show(x.id)).join(", ")}.` };
      return {
        id: show(t.id), name: show(t.name), category: t.category, count: t.count, firstSeen: t.firstSeen, lastSeen: t.lastSeen,
        url: url(`/topic/${t.id}`),
        timeline: events.filter(r => r.topicId === show(t.id)),
        connections: CONNECTIONS.filter(c => c.from === t.id || c.to === t.id)
          .map(c => ({ to: show(c.from === t.id ? c.to : c.from), label: show(c.label), strength: c.strength })),
      };
    },

    // Curated decisions, logged pivots, and timeline events marked decision,
    // pivot or milestone, oldest first.
    decisions({ topic, since, type } = {}) {
      const marked = events.filter(r => DECISION_KINDS.includes(r.kind));
      const results = filter([...curated, ...pivots, ...marked], { topic, since, kind: type });
      return { results: results.sort((a, b) => a.date.localeCompare(b.date)) };
    },

    // Where current conversations contradict an earlier decision.
    drift() {
      return {
        results: CONTRADICTIONS_INITIAL.map(c => ({
          ...item({ id: c.id, kind: "drift", title: c.summary, subtitle: `${topicName(c.topicId)} · ${c.severity}`, snippet: c.summary, date: c.current?.date || c.earlier.date, topicId: c.topicId, path: `/topic/${c.topicId}` }),
          earlier: { date: c.earlier.date, position: show(c.earlier.position) },
          current: c.current ? { date: c.current.date, position: show(c.current.position) } : null,
        })),
      };
    },
  };
}
