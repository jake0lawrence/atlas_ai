// Privacy mode (#86), as data: every identifying name in ENTITIES gets a
// typed, stable stand-in, and aliasText swaps them in any string. Pure, so
// the DOM shield, the exports, the clipboard and the palette's search all
// hide the same names the same way.
import { ENTITIES } from './data/constants';

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

export const aliasText = (text) => {
  if (typeof text !== "string" || !text) return text;
  let out = text;
  for (const { re, alias } of RULES) out = out.replace(re, alias);
  return out;
};

// Does a string still carry a real name? The route test holds every screen to this.
export const leaks = (text) => RULES.filter(({ re }) => { re.lastIndex = 0; return re.test(text); }).map(r => r.re.source);
