// Privacy mode (#86), as data: every identifying name in ENTITIES gets a
// typed, stable stand-in, and aliasText swaps them in any string. Pure, so
// the DOM shield, the exports, the clipboard and the palette's search all
// hide the same names the same way.
import { ENTITIES, TOPICS } from './data/constants.js';

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// People get numbers ("Person 1"), everything else letters ("Company B"),
// counted per type in list order, so an alias never changes between loads.
export const ALIASES = (() => {
  const seen = {};
  return ENTITIES.map(e => {
    const n = seen[e.type] = (seen[e.type] || 0) + 1;
    return { ...e, alias: `${e.type} ${e.type === "Person" ? n : LETTERS[n - 1]}` };
  });
})();

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Every spelling, longest first so "Tyler Technologies" wins over "Tyler".
// Short forms (IL) match case-sensitively; the rest ignore case, because the
// fixtures also carry lowercase search queries ("interview transunion").
const RULES = ALIASES
  .flatMap(e => [e.name, ...(e.also || [])].map(form => ({ form, alias: e.alias })))
  .sort((a, b) => b.form.length - a.form.length)
  .map(({ form, alias }) => ({ re: new RegExp(`\\b${escape(form)}\\b`, form.length <= 3 ? "g" : "gi"), alias }));

// Money (#86): an exact figure (a budget, a price, a salary) is identifying in
// a way a count is not, so it becomes the band it falls in: "$800 budget"
// reads "$500–$1k budget", "$25/mo" reads "under $100/mo". The band keeps the
// order of magnitude, which is what the atlas needs.
const EDGES = [100, 500, 1e3, 5e3, 10e3, 25e3, 50e3, 100e3, 250e3, 500e3, 1e6];
const dollars = (n) => (n >= 1e6 ? `$${n / 1e6}M` : n >= 1e3 ? `$${n / 1e3}k` : `$${n}`);
const UNIT = { k: 1e3, m: 1e6 };
export const moneyBand = (amount) => {
  const hi = EDGES.findIndex(e => amount < e);
  if (hi === 0) return `under ${dollars(EDGES[0])}`;
  if (hi === -1) return `${dollars(EDGES.at(-1))}+`;
  return `${dollars(EDGES[hi - 1])}–${dollars(EDGES[hi])}`;
};
// A dollar figure, but not one that is already a band: never right after a
// dash or "under", never before a dash or "+". aliasText has to be idempotent,
// because the shield sees its own writes come back.
const MONEY = /(?<!–|under )\$((?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?)([kKmM])?(?![\w–+]|[.,]\d)/g;

export const aliasText = (text) => {
  if (typeof text !== "string" || !text) return text;
  let out = text;
  for (const { re, alias } of RULES) out = out.replace(re, alias);
  return out.replace(MONEY, (_, n, unit) => moneyBand(Number(n.replace(/,/g, "")) * (UNIT[unit?.toLowerCase()] || 1)));
};

// Does a string still carry a real name or an exact amount? The route test
// holds every screen to this.
export const leaks = (text) => [...RULES.map(r => r.re), MONEY]
  .filter(re => { re.lastIndex = 0; return re.test(text); })
  .map(re => re.source);

// The address bar (#86): with the mode on, a topic's URL carries its stand-in
// as a slug (/topic/tyler reads /topic/employer-a), and the app resolves that
// slug back, so a private link still opens. The MCP tools' private links use
// the same slugs.
const slug = (s) => aliasText(s).replace(/ /g, "-").toLowerCase();
const PRIVATE_ID = Object.fromEntries(TOPICS.filter(t => slug(t.id) !== t.id).map(t => [t.id, slug(t.id)]));
const REAL_ID = Object.fromEntries(Object.entries(PRIVATE_ID).map(([id, s]) => [s, id]));
const mapSegments = (table) => (path) => path.split("/").map(seg => table[seg] || seg).join("/");
export const privatePath = mapSegments(PRIVATE_ID);
export const realPath = mapSegments(REAL_ID);
