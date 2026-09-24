import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import BeliefDiffsView, { CHAINS_FOR, diffStats, beliefsAt } from '../BeliefDiffsView';
import { BELIEF_DIFFS, ARCHAEOLOGY_CHAINS } from '../../data/constants';

describe('the diffs, as data', () => {
  it('every diff has lines of known types and links only to chains that exist', () => {
    for (const d of BELIEF_DIFFS) {
      for (const l of d.lines) expect(['removed', 'context', 'added']).toContain(l.type);
      for (const id of CHAINS_FOR[d.id] || []) expect(ARCHAEOLOGY_CHAINS[id]).toBeTruthy();
    }
    for (const id of Object.keys(CHAINS_FOR)) expect(BELIEF_DIFFS.some(d => d.id === id)).toBe(true);
  });

  it('then is dropped + kept, now is kept + new, and the diff is all of it', () => {
    const d = BELIEF_DIFFS[0];
    const s = diffStats(d);
    expect(beliefsAt(d, 'then')).toHaveLength(s.removed + s.context);
    expect(beliefsAt(d, 'now')).toHaveLength(s.context + s.added);
    expect(beliefsAt(d, 'diff')).toHaveLength(d.lines.length);
    expect(beliefsAt(d, 'then').some(l => l.type === 'added')).toBe(false);
    expect(beliefsAt(d, 'now').some(l => l.type === 'removed')).toBe(false);
  });
});

describe('the belief diffs view', () => {
  it('switches subject and between then, the diff and now', () => {
    render(<BeliefDiffsView />);
    const second = BELIEF_DIFFS[1];
    fireEvent.click(screen.getByRole('button', { name: new RegExp(second.topic) }));
    expect(screen.getByRole('button', { name: new RegExp(second.topic) }).getAttribute('aria-pressed')).toBe('true');
    const s = diffStats(second);
    fireEvent.click(screen.getByRole('button', { name: 'Now' }));
    const now = screen.getByRole('list', { name: `What you believe, ${second.current.label}` });
    expect(within(now).getAllByRole('listitem')).toHaveLength(s.context + s.added);
    fireEvent.click(screen.getByRole('button', { name: 'Then' }));
    expect(within(screen.getByRole('list', { name: `What you believed, ${second.earlier.label}` })).getAllByRole('listitem')).toHaveLength(s.removed + s.context);
  });

  it('traces a subject to its decision chains', () => {
    const onArchaeologyClick = vi.fn();
    render(<BeliefDiffsView onArchaeologyClick={onArchaeologyClick} />);
    const chain = ARCHAEOLOGY_CHAINS[CHAINS_FOR[BELIEF_DIFFS[0].id][0]];
    fireEvent.click(screen.getByRole('button', { name: new RegExp(chain.title.replace('?', '\\?')) }));
    expect(onArchaeologyClick).toHaveBeenCalledWith(chain.id);
  });
});
