import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import CurationSummary, { ledger, totals, listOf } from '../CurationSummary';
import { initialQueue, summarize as summarizeQueue, queueReducer, initialState as queueState } from '../ReviewQueue';
import { initialState as topicsState, topicsReducer, summarize as summarizeTopics } from '../TopicCurationPanel';
import { initialState as connectionsState, connectionsReducer, summarize as summarizeConnections } from '../ConnectionValidation';
import { initialState as insightsState, insightsReducer, summarize as summarizeInsights } from '../InsightDecisionReview';
import { REVIEW_QUEUE_DATA, CONNECTIONS, INSIGHT_DECISIONS, TOPICS } from '../../data/constants';
import useStore from '../../store';

// A run where every step was finished with a few real decisions in it.
const finishedRun = () => {
  let q = queueState();
  q = queueReducer(q, { type: 'decide', status: 'approved' });
  q = queueReducer(q, { type: 'decide', status: 'rejected' });
  let t = topicsState();
  t = topicsReducer(t, { type: 'rename', id: TOPICS[0].id, name: 'Renamed' });
  let c = connectionsState();
  c = connectionsReducer(c, { type: 'decide', status: 'confirmed' });
  c = connectionsReducer(c, { type: 'decide', status: 'rejected' });
  let i = insightsState();
  i = insightsReducer(i, { type: 'keepRest' });
  return {
    curation: summarizeQueue(q.items),
    topicCuration: summarizeTopics(t),
    connectionValidation: summarizeConnections(c.items),
    insightReview: summarizeInsights(i.items),
  };
};

describe('the ledger, as data', () => {
  it('joins parts in words and skips empty ones', () => {
    expect(listOf(['a', 0, 'b', '', 'c'])).toBe('a, b and c');
    expect(listOf(['a'])).toBe('a');
    expect(listOf([0, ''])).toBe('');
  });

  it('with nothing finished, every step is unvisited and reports the fixtures untouched', () => {
    const rows = ledger({});
    expect(rows.map(r => r.view)).toEqual(['curation', 'topicCuration', 'connectionValidation', 'insightReview']);
    expect(rows.every(r => !r.visited && r.sentence.startsWith('Not finished.'))).toBe(true);
    const auto = summarizeQueue(initialQueue()).auto;
    const t = totals(rows);
    expect(t).toMatchObject({ decided: 0, changed: 0, rejected: 0, auto, topicChanges: 0 });
    expect(t.proposals).toBe(REVIEW_QUEUE_DATA.length + CONNECTIONS.length + INSIGHT_DECISIONS.length);
    expect(t.waiting).toBe(t.proposals - auto);
  });

  it('one square per proposal: every row with marks adds up to its total', () => {
    for (const run of [{}, finishedRun()]) {
      for (const r of ledger(run).filter(x => x.counts)) {
        expect(Object.values(r.counts).reduce((a, n) => a + n, 0)).toBe(r.total);
      }
    }
  });

  it('counts what was actually decided', () => {
    const rows = ledger(finishedRun());
    expect(rows.every(r => r.visited)).toBe(true);
    const t = totals(rows);
    // queue: 1 approved + 1 rejected; connections: 1 confirmed + 1 rejected; insights: all kept
    expect(t.decided).toBe(2 + 2 + INSIGHT_DECISIONS.length);
    expect(t.rejected).toBe(2);
    expect(t.changed).toBe(0);
    expect(t.topicChanges).toBe(1); // the rename
    expect(rows.find(r => r.view === 'topicCuration').sentence).toMatch(/^1 change: Atlas's 14 topics are now 14/);
    expect(rows.find(r => r.view === 'insightReview').sentence).toBe(`Of ${INSIGHT_DECISIONS.length} turning points, you kept ${INSIGHT_DECISIONS.length}.`);
  });

  it('a connection you added counts as your change, not as one Atlas proposed', () => {
    let c = connectionsState();
    c = connectionsReducer(c, { type: 'add', from: TOPICS[0].id, to: TOPICS[1].id, label: 'Shares a stack' });
    const row = ledger({ connectionValidation: summarizeConnections(c.items) }).find(r => r.view === 'connectionValidation');
    expect(row.counts).toMatchObject({ kept: 0, changed: 1 });
    expect(row.sentence).toMatch(`Of ${CONNECTIONS.length} connections Atlas found, you added 1 of your own.`);
  });
});

describe('the summary view', () => {
  it('with nothing finished, says so and offers a way into each step', () => {
    const onNavigate = vi.fn();
    render(<CurationSummary results={{}} onComplete={() => {}} onNavigate={onNavigate} />);
    expect(screen.getByText(/You haven't finished a curation step yet/)).toBeTruthy();
    // The rail ticks only finished steps, not every step before this one.
    expect(screen.getByRole('button', { name: 'Step 1: Review' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Go to Topics' }));
    expect(onNavigate).toHaveBeenCalledWith('topicCuration');
  });

  it('shows the recorded decisions and the topic changes, with no way back to a finished step', () => {
    const onComplete = vi.fn();
    render(<CurationSummary results={finishedRun()} onComplete={onComplete} onNavigate={() => {}} />);
    expect(screen.queryByRole('button', { name: /^Go to/ })).toBeNull();
    expect(screen.getByRole('button', { name: 'Step 4: Insights (done)' })).toBeTruthy();
    const topics = screen.getByRole('article', { name: 'Topics' });
    expect(within(topics).getByText(`Renamed ${TOPICS[0].name} to Renamed`)).toBeTruthy();
    const review = screen.getByRole('article', { name: 'Review' });
    expect(within(review).getByRole('img').getAttribute('aria-label')).toMatch(/1 kept as proposed, 1 rejected/);
    fireEvent.click(screen.getByRole('button', { name: 'Open your atlas →' }));
    expect(onComplete).toHaveBeenCalled();
  });
});

describe('the store records each finished step', () => {
  beforeEach(() => useStore.setState({ curationResults: {} }));
  it('keeps one tally per step, the latest winning', () => {
    const { recordCuration } = useStore.getState();
    act(() => { recordCuration('curation', { total: 1 }); recordCuration('curation', { total: 2 }); recordCuration('insightReview', { total: 3 }); });
    expect(useStore.getState().curationResults).toEqual({ curation: { total: 2 }, insightReview: { total: 3 } });
  });
});
