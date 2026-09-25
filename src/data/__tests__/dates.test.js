// The fixtures once ran in two camps a year apart: the timeline, search and
// archaeology ended Feb 2025, while the digests, pivots, drift, last-seen dates
// and "today" ended Feb 2026, the same events a year later. The timeline won;
// this holds every dated fixture to it.
import { describe, it, expect } from 'vitest';
import {
  TOPICS, TIMELINE_DATA, MONTHLY_ACTIVITY, EVOLUTION_PHASES, PIVOT_ENTRIES, DIGEST_DATA,
  CONTRADICTIONS_INITIAL, BELIEF_DIFFS, SYNC_NEW_EVENTS, DEMO_NOW,
} from '../constants';
import constantsSource from '../constants.js?raw';

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const iso = (monthYear) => { const [m, y] = monthYear.split(" "); return `${y.length === 2 ? `20${y}` : y}-${String(MON.indexOf(m) + 1).padStart(2, "0")}`; };
const NOW = `${DEMO_NOW.getFullYear()}-${String(DEMO_NOW.getMonth() + 1).padStart(2, "0")}`;
const monthsBetween = (a, b) => { const [ay, am] = a.split("-").map(Number); const [by, bm] = b.split("-").map(Number); return (by - ay) * 12 + (bm - am); };
const lastEvent = (id) => TIMELINE_DATA[id].map(e => e.date).sort().at(-1).slice(0, 7);

describe('every dated fixture agrees with the timeline', () => {
  it('today is the month of the last timeline event', () => {
    const last = Object.keys(TIMELINE_DATA).map(lastEvent).sort().at(-1);
    expect(NOW).toBe(last);
    expect(NOW).toBe('2025-02');
  });

  it("each topic was last seen within a month of its last timeline event, never after today", () => {
    for (const t of TOPICS) {
      const seen = iso(t.lastSeen);
      expect(seen <= NOW, t.id).toBe(true);
      expect(monthsBetween(lastEvent(t.id), seen), `${t.id}: last seen ${t.lastSeen}, last event ${lastEvent(t.id)}`).toBeGreaterThanOrEqual(0);
      expect(monthsBetween(lastEvent(t.id), seen), t.id).toBeLessThanOrEqual(1);
      expect(iso(t.firstSeen), t.id).toBe(TIMELINE_DATA[t.id].map(e => e.date).sort()[0].slice(0, 7));
    }
  });

  it('activity and the phases end today', () => {
    expect(iso(MONTHLY_ACTIVITY.at(-1).month)).toBe(NOW);
    expect(iso(EVOLUTION_PHASES.at(-1).period.split("–")[1].trim())).toBe(NOW);
  });

  it('pivots, digests, drift, belief diffs and the sync all fall on or before today', () => {
    for (const p of PIVOT_ENTRIES) expect(iso(p.date) <= NOW, p.id).toBe(true);
    for (const d of DIGEST_DATA) expect(iso(d.month.replace(/^(\w{3})\w*/, "$1")) <= NOW, d.id).toBe(true);
    for (const c of CONTRADICTIONS_INITIAL) for (const side of [c.earlier, c.current]) expect(side.date.slice(0, 7) <= NOW, c.id).toBe(true);
    for (const b of BELIEF_DIFFS) expect(b.earlier.date < b.current.date && b.current.date <= NOW, b.id).toBe(true);
    for (const [id, e] of Object.entries(SYNC_NEW_EVENTS)) {
      expect(e.date.slice(0, 7), id).toBe(NOW);
      expect(e.date > TIMELINE_DATA[id].map(x => x.date).sort().at(-1), `${id} syncs in after its timeline`).toBe(true);
    }
  });

  it('nothing is dated in 2026', () => {
    expect(constantsSource).not.toMatch(/2026|\b(Jan|Feb) 26\b/);
  });
});
