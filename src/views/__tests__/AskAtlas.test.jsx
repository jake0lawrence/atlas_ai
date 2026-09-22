import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import AskAtlas, { splitCitations, citationRuns, confidenceLabel } from '../AskAtlas';
import { COMPANION_SUGGESTION_CHIPS, COMPANION_RESPONSES, CONTRADICTIONS_INITIAL } from '../../data/constants';

const Q = COMPANION_SUGGESTION_CHIPS[0];

describe('pure helpers', () => {
  it('splits citations into numbers', () => {
    expect(splitCitations('a [1] b [12]')).toEqual(['a ', 1, ' b ', 12]);
    expect(splitCitations('none')).toEqual(['none']);
  });
  it('keeps a citation with its word and trailing punctuation', () => {
    expect(citationRuns('the sole developer [1]. You chose')).toEqual([
      'the sole ', { before: 'developer ', cites: [1], after: '.' }, ' You chose',
    ]);
    expect(citationRuns('fast [1][2], but')).toEqual([{ before: 'fast ', cites: [1, 2], after: ',' }, ' but']);
    expect(citationRuns('[3] leads')).toEqual([{ before: '', cites: [3], after: '' }, ' leads']);
  });
  it('labels confidence bands', () => {
    expect(confidenceLabel(0.91).text).toBe('High confidence');
    expect(confidenceLabel(0.8).text).toBe('Good confidence');
    expect(confidenceLabel(0.6).text).toBe('Moderate confidence');
    expect(confidenceLabel(0.2).text).toBe('Low confidence');
  });
});

describe('AskAtlas', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('shows every suggested question in full when empty', () => {
    render(<AskAtlas mobile={false} contradictions={[]} />);
    for (const q of COMPANION_SUGGESTION_CHIPS) expect(screen.getByRole('button', { name: new RegExp(q.replace(/[?.]/g, '\\$&')) })).toBeTruthy();
  });

  it('answers a suggested question and a citation opens its source', () => {
    render(<AskAtlas mobile={false} contradictions={[]} />);
    fireEvent.click(screen.getByRole('button', { name: /current thinking on serverless/ }));
    expect(screen.getByRole('status', { name: 'Atlas is answering' })).toBeTruthy();
    act(() => vi.advanceTimersByTime(1600));
    const answer = screen.getByRole('article', { name: 'Atlas answer' });
    expect(within(answer).getByText(/High confidence · 91%/)).toBeTruthy();
    expect(within(answer).queryByRole('list', { name: 'Sources' })).toBeNull();

    fireEvent.click(within(answer).getByRole('button', { name: 'Source 2' }));
    const sources = within(answer).getByRole('list', { name: 'Sources' });
    const items = within(sources).getAllByRole('listitem');
    expect(items).toHaveLength(COMPANION_RESPONSES[Q].sources.length);
    expect(items.map(li => li.getAttribute('aria-current'))).toEqual([null, 'true', null]);

    // the asked question drops out of the follow-up chips
    expect(screen.queryAllByRole('button', { name: /current thinking on serverless/ })).toHaveLength(0);
  });

  it('answers anything else with the demo note, not a fake answer', () => {
    render(<AskAtlas mobile={false} contradictions={[]} />);
    fireEvent.change(screen.getByRole('textbox', { name: /Ask a question/ }), { target: { value: 'what is my favorite color' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ask' }));
    act(() => vi.advanceTimersByTime(1600));
    expect(screen.getByText('Demo')).toBeTruthy();
    expect(screen.getByText(/This demo answers the four suggested questions/)).toBeTruthy();
  });

  it('resolves a drift card through the callback, and shows an empty state with none', () => {
    const onResolve = vi.fn();
    const { unmount } = render(<AskAtlas mobile={false} contradictions={CONTRADICTIONS_INITIAL} onResolveContradiction={onResolve} />);
    const panel = screen.getByRole('complementary', { name: 'Thinking drift' });
    const first = CONTRADICTIONS_INITIAL[0];
    fireEvent.click(within(panel).getAllByRole('button', { expanded: false })[0]);
    fireEvent.click(within(panel).getByRole('button', { name: /Intentional Pivot/ }));
    act(() => vi.advanceTimersByTime(600));
    expect(onResolve).toHaveBeenCalledWith(first.id, 'pivot');
    unmount();

    render(<AskAtlas mobile={false} contradictions={[]} />);
    expect(screen.getByText('No drift right now')).toBeTruthy();
  });

  it('clears its timers on unmount', () => {
    const { unmount } = render(<AskAtlas mobile={false} contradictions={[]} />);
    fireEvent.click(screen.getByRole('button', { name: /current thinking on serverless/ }));
    unmount();
    expect(() => act(() => vi.advanceTimersByTime(5000))).not.toThrow();
  });
});
