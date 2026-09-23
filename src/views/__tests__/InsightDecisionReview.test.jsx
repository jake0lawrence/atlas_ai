import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import InsightDecisionReview, {
  formatDate, timelinePositions, hasPastPerspective, initialState, insightsReducer, activeItem, nextPending, summarize,
} from '../InsightDecisionReview';
import { TOPICS, INSIGHT_DECISIONS, PAST_ANALOGIES } from '../../data/constants';

describe('the insights, as data', () => {
  it('every insight names a real topic, a known type and an ISO date', () => {
    for (const d of INSIGHT_DECISIONS) {
      expect(TOPICS.some(t => t.id === d.topicId)).toBe(true);
      expect(['decision', 'pivot', 'milestone']).toContain(d.type);
      expect(d.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    for (const a of PAST_ANALOGIES) expect(INSIGHT_DECISIONS.some(d => d.id === a.triggerDecisionId)).toBe(true);
  });

  it('formats dates without a time zone', () => {
    expect(formatDate('2024-09-15')).toBe('Sep 15, 2024');
    expect(formatDate('2025-01-01')).toBe('Jan 1, 2025');
  });

  it('places the oldest insight at 0 and the newest at 100, in date order', () => {
    const pos = timelinePositions(INSIGHT_DECISIONS);
    const byDate = [...INSIGHT_DECISIONS].sort((a, b) => a.date.localeCompare(b.date));
    expect(pos[byDate[0].id]).toBe(0);
    expect(pos[byDate.at(-1).id]).toBe(100);
    const ordered = byDate.map(d => pos[d.id]);
    expect([...ordered].sort((a, b) => a - b)).toEqual(ordered);
  });

  it('keeps, dismisses and moves on', () => {
    const s0 = initialState();
    const first = activeItem(s0);
    const s1 = insightsReducer(s0, { type: 'decide', status: 'rejected' });
    expect(s1.items.find(i => i.id === first.id).status).toBe('rejected');
    expect(activeItem(s1).id).toBe(nextPending(s0.items, first.id).id);
    expect(summarize(s1.items)).toMatchObject({ rejected: 1, kept: 0, decided: 1 });
  });

  it('a rewrite keeps the insight in your words; an unchanged rewrite is a plain keep', () => {
    const s0 = initialState();
    const first = activeItem(s0);
    const s1 = insightsReducer(s0, { type: 'rewrite', text: ' Chose Supabase. ' });
    expect(s1.items.find(i => i.id === first.id)).toMatchObject({ status: 'edited', humanEdit: 'Chose Supabase.' });
    expect(insightsReducer(s0, { type: 'rewrite', text: first.aiProposal }).items.find(i => i.id === first.id).status).toBe('correct');
    expect(insightsReducer(s0, { type: 'rewrite', text: '  ' })).toBe(s0);
  });

  it('undo clears the rewrite and brings the insight back', () => {
    let s = initialState();
    const first = activeItem(s);
    s = insightsReducer(s, { type: 'rewrite', text: 'Mine' });
    s = insightsReducer(s, { type: 'undo', id: first.id });
    expect(activeItem(s)).toMatchObject({ id: first.id, status: 'pending', humanEdit: null });
  });

  it('past perspective opens only where there is one', () => {
    const withPast = INSIGHT_DECISIONS.find(d => hasPastPerspective(d.id));
    const without = INSIGHT_DECISIONS.find(d => !hasPastPerspective(d.id));
    const s0 = insightsReducer(initialState(), { type: 'open', id: withPast.id });
    expect(insightsReducer(s0, { type: 'togglePast' }).showPast).toBe(true);
    const s1 = insightsReducer(initialState(), { type: 'open', id: without.id });
    expect(insightsReducer(s1, { type: 'togglePast' })).toBe(s1);
  });
});

describe('<InsightDecisionReview>', () => {
  const setup = (props = {}) => render(<InsightDecisionReview onComplete={vi.fn()} onNavigate={vi.fn()} mobile={false} w={1280} {...props} />);

  it('is step 4, with one timeline dot per insight', () => {
    setup();
    const rail = screen.getByRole('navigation', { name: 'Curation steps' });
    expect(within(rail).getByRole('button', { name: /Step 4: Insights/ }).getAttribute('aria-current')).toBe('step');
    expect(within(screen.getByRole('list', { name: 'Insights by date' })).getAllByRole('button')).toHaveLength(INSIGHT_DECISIONS.length);
  });

  it('a timeline dot opens that insight', () => {
    setup();
    const last = INSIGHT_DECISIONS.at(-1);
    const dots = within(screen.getByRole('list', { name: 'Insights by date' }));
    fireEvent.click(dots.getByRole('button', { name: new RegExp(formatDate(last.date)) }));
    expect(screen.getByRole('article').textContent).toContain(last.aiProposal);
  });

  it('keyboard acts on the insight on screen', () => {
    setup();
    fireEvent.keyDown(window, { key: 's' });
    const second = INSIGHT_DECISIONS[1];
    expect(screen.getByRole('article').textContent).toContain(second.aiProposal);
    fireEvent.keyDown(window, { key: 'a' });
    expect(within(screen.getByRole('list', { name: 'Your decisions' })).getByText(second.aiProposal)).toBeTruthy();
  });

  it('rewrite shows your words and what Atlas had', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /Rewrite/ }));
    fireEvent.change(screen.getByLabelText('Rewrite this insight'), { target: { value: 'Picked Supabase for speed.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save and keep' }));
    const decisions = within(screen.getByRole('list', { name: 'Your decisions' }));
    expect(decisions.getByText('Picked Supabase for speed.')).toBeTruthy();
    expect(decisions.getByText(INSIGHT_DECISIONS[0].aiProposal)).toBeTruthy();
  });

  it('keep-the-rest clears the list and offers the summary', () => {
    const onComplete = vi.fn();
    setup({ onComplete });
    fireEvent.click(screen.getByRole('button', { name: `Keep the ${INSIGHT_DECISIONS.length} waiting` }));
    expect(screen.getByRole('status').textContent).toMatch(new RegExp(`${INSIGHT_DECISIONS.length} turning points go on your timeline`));
    fireEvent.click(screen.getByRole('button', { name: /Next: see the summary/ }));
    expect(onComplete).toHaveBeenCalled();
  });
});
