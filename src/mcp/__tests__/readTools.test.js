import { describe, it, expect } from 'vitest';
import { createReadTools } from '../readTools';
import { leaks } from '../../privacy';
import { TIMELINE_DATA, TOPICS, CONTRADICTIONS_INITIAL, INSIGHT_DECISIONS } from '../../data/constants';

const tools = createReadTools({ baseUrl: 'https://atlas.example' });
const all = () => [
  tools.search({ query: 'supabase' }), tools.decisions(), tools.drift(),
  ...TOPICS.map(t => tools.topic({ id: t.id })),
];

describe('the read tools (V8_PLAN PR 2)', () => {
  it("answer PR 2's done-when question: what did I decide about CourtCollect's stack?", () => {
    const [first] = tools.search({ query: 'courtcollect stack' }).results;
    expect(first.title).toBe(INSIGHT_DECISIONS[0].aiProposal);
    expect(first.url).toBe('https://atlas.example/topic/courtcollect/conversation/2');
    expect(TIMELINE_DATA.courtcollect[2].date).toBe(first.date);
    const decided = tools.decisions({ topic: 'courtcollect' }).results.map(r => r.kind);
    expect(decided).toContain('pivot');
  });

  it('link every result to a page the app can open', () => {
    const items = [...tools.search({ query: 'a' , limit: 50 }).results, ...tools.decisions().results, ...tools.drift().results];
    expect(items.length).toBeGreaterThan(20);
    for (const r of items) {
      const m = new URL(r.url).pathname.match(/^\/topic\/([^/]+)(?:\/conversation\/(\d+))?$/);
      expect(m, r.url).toBeTruthy();
      expect(TOPICS.map(t => t.id)).toContain(m[1]);
      if (m[2]) expect(TIMELINE_DATA[m[1]][Number(m[2])], r.url).toBeTruthy();
      for (const k of ['id', 'kind', 'title', 'subtitle', 'date', 'url']) expect(r[k], `${r.id} ${k}`).toBeTruthy();
    }
  });

  it('filter and order decisions', () => {
    const list = tools.decisions().results;
    expect(list.map(r => r.date)).toEqual([...list.map(r => r.date)].sort());
    expect(tools.decisions({ type: 'pivot' }).results.every(r => r.kind === 'pivot')).toBe(true);
    expect(tools.decisions({ since: '2025-01' }).results.every(r => r.date >= '2025-01')).toBe(true);
    expect(tools.decisions({ topic: 'keymaster' }).results.every(r => r.topicId === 'keymaster')).toBe(true);
  });

  it('search needs every word and honors its filters', () => {
    expect(tools.search({ query: 'docker vercel' }).results.every(r => /docker/i.test(`${r.title} ${r.subtitle} ${r.snippet}`) && /vercel/i.test(`${r.title} ${r.subtitle} ${r.snippet}`))).toBe(true);
    expect(tools.search({ query: 'zzz' }).results).toEqual([]);
    expect(tools.search({ query: 'a', limit: 3 }).results).toHaveLength(3);
  });

  it('open a topic with its timeline and both directions of its links, and name the real ones when asked for a wrong one', () => {
    const t = tools.topic({ id: 'tyler' });
    expect(t.timeline).toHaveLength(TIMELINE_DATA.tyler.length);
    expect(t.connections.map(c => c.to)).toContain('courtcollect');
    const bad = tools.topic({ id: 'nope' });
    expect(bad.error).toMatch(/courtcollect/);
  });

  it('report every open contradiction with both positions', () => {
    const { results } = tools.drift();
    expect(results).toHaveLength(CONTRADICTIONS_INITIAL.length);
    for (const r of results) expect(r.earlier.position).toBeTruthy();
  });

  it('with privacy on, send no real name anywhere, ids and links included (#86)', () => {
    const priv = createReadTools({ baseUrl: 'https://atlas.example', privacy: true });
    const out = JSON.stringify([
      priv.search({ query: 'product a' }), priv.decisions(), priv.drift(), ...TOPICS.map(t => priv.topic({ id: t.id })),
    ]);
    expect(leaks(out)).toEqual([]);
    expect(priv.search({ query: 'product a stack' }).results[0].url).toBe('https://atlas.example/topic/product-a/conversation/2');
    expect(priv.topic({ id: 'Product A' }).name).toBe('Product A');
    expect(JSON.stringify(all())).toContain('CourtCollect');
  });
});
