import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import DashboardView, { AttentionPanel, buildAttention, summarizeJourney } from '../DashboardView';
import { TOPICS, INSIGHT_DECISIONS, RECURATION_COUNTS, getInsightStaleness } from '../../data/constants';

const base = { mobile: false, tablet: false, totalConvos: 3847, totalWords: 2_000_000, maxCount: 156, onBriefMe: () => {}, recentlySynced: [], onRewind: () => {} };

describe('buildAttention', () => {
  it('pairs every stale decision with its topic and sorts unreviewed topics by count', () => {
    const a = buildAttention();
    // Six months or older, counted back from the demo's today (Feb 7 2025).
    expect(a.stale.map(d => d.id)).toEqual(INSIGHT_DECISIONS.filter(d => getInsightStaleness(d.date)).map(d => d.id));
    expect(a.stale.length).toBe(2);
    expect(a.stale.every(d => d.topic && d.warning)).toBe(true);
    expect(a.unreviewed.map(u => u.count)).toEqual([...a.unreviewed.map(u => u.count)].sort((x, y) => y - x));
    expect(a.newConversations).toBe(Object.values(RECURATION_COUNTS).reduce((n, c) => n + c, 0));
  });

  it('drops decisions whose topic is unknown and fresh ones', () => {
    const a = buildAttention({
      decisions: [{ id: 1, topicId: 'nope', date: '2020-01-01' }, { id: 2, topicId: TOPICS[0].id, date: '2026-02-01' }],
      staleness: d => (d < '2025-01-01' ? 'old' : null),
      counts: {},
    });
    expect(a.stale).toEqual([]);
    expect(a.unreviewed).toEqual([]);
  });
});

describe('summarizeJourney', () => {
  it('finds the crossover month and the latest Claude share', () => {
    expect(summarizeJourney([
      { month: 'A', gpt: 10, claude: 0 }, { month: 'B', gpt: 5, claude: 6 }, { month: 'C', gpt: 1, claude: 3 },
    ])).toEqual({ crossover: 'B', latestMonth: 'C', latestClaudeShare: 75 });
    expect(summarizeJourney([])).toBeNull();
  });

  it('matches the fixtures: Claude passed ChatGPT in Feb 24 and is 89% by Feb 25', () => {
    expect(summarizeJourney()).toEqual({ crossover: 'Feb 24', latestMonth: 'Feb 25', latestClaudeShare: 89 });
  });
});

describe('AttentionPanel', () => {
  it('shows up to three decisions, expands to all, and opens a topic from the new-conversations list', () => {
    const onTopicClick = vi.fn();
    const attention = buildAttention();
    render(<AttentionPanel attention={attention} onTopicClick={onTopicClick} mobile={false} />);
    const panel = screen.getByRole('region', { name: 'Needs your attention' });
    const decisions = () => within(panel).getAllByText(/still relevant\?/);
    expect(decisions()).toHaveLength(Math.min(3, attention.stale.length));
    if (attention.stale.length > 3) fireEvent.click(within(panel).getByRole('button', { name: `Show all ${attention.stale.length}` }));
    expect(decisions()).toHaveLength(attention.stale.length);
    const top = attention.unreviewed[0];
    fireEvent.click(within(panel).getByRole('button', { name: new RegExp(top.topic.name) }));
    expect(onTopicClick).toHaveBeenCalledWith(top.topic);
  });

  it('has a designed empty state', () => {
    render(<AttentionPanel attention={{ stale: [], unreviewed: [], newConversations: 0 }} onTopicClick={() => {}} mobile={false} />);
    expect(screen.getByText("You're caught up")).toBeTruthy();
  });
});

describe('DashboardView', () => {
  it('keeps the tour targets and states the journey takeaway in words', () => {
    render(<DashboardView {...base} onTopicClick={() => {}} />);
    for (const t of ['knowledge-map', 'ai-journey', 'rewind-btn']) {
      expect(document.querySelector(`[data-tour='${t}']`), t).not.toBeNull();
    }
    expect(screen.getByText(/Claude passed ChatGPT in Feb 24\. By Feb 25 it was 89%/)).toBeTruthy();
    expect(screen.getByRole('img', { name: /Claude passed ChatGPT in Feb 24/ })).toBeTruthy();
  });

  it('labels every topic bubble with its name and count', () => {
    render(<DashboardView {...base} onTopicClick={() => {}} />);
    for (const t of TOPICS) expect(screen.getByRole('button', { name: new RegExp(`^${t.name}: ${t.count} conversations`) })).toBeTruthy();
  });
});
