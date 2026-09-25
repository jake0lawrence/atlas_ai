import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import RewindMode, { monthOf, MONTHS, EVENTS, LAST_MILESTONE, PHASE_STARTS, stateAt } from '../RewindMode';
import { TOPICS, CONNECTIONS, EVOLUTION_PHASES, TIMELINE_DATA } from '../../data/constants';

const LAST = MONTHS.length - 1;

describe('the rewind, as data', () => {
  it('reads the activity months', () => {
    expect(monthOf('Jan 23')).toEqual({ key: '2023-01', label: 'Jan 2023' });
    expect(monthOf('Dec 25')).toEqual({ key: '2025-12', label: 'Dec 2025' });
    expect(MONTHS[0].label).toBe('Jan 2023');
    expect(MONTHS[LAST].label).toBe('Feb 2025');
  });

  it('uses the phases from Evolution, not its own', () => {
    // The old rewind named its own phases (Genesis, Exploration, ...) by step count.
    for (let i = 0; i < MONTHS.length; i++) expect(stateAt(i).phase, MONTHS[i].label).toBeGreaterThanOrEqual(0);
    expect(PHASE_STARTS).toEqual([0, 6, 12, 18, 24]);
    expect(EVOLUTION_PHASES[stateAt(LAST).phase].title).toBe('The Strategist');
  });

  it('places every timeline event in exactly one month', () => {
    const total = Object.values(TIMELINE_DATA).reduce((a, e) => a + e.length, 0);
    expect(EVENTS.length).toBe(total);
    expect(MONTHS.reduce((a, _, i) => a + stateAt(i).events.length, 0)).toBe(total);
    for (const e of EVENTS) expect(TIMELINE_DATA[e.topicId][e.index].date).toBe(e.date);
  });

  it('adds each topic once, in the month of its first milestone', () => {
    const arrivals = MONTHS.flatMap((_, i) => stateAt(i).newTopics);
    expect([...arrivals].sort()).toEqual(TOPICS.map(t => t.id).sort());
    expect(stateAt(0).newTopics).toEqual(['webdev']);
    const first = EVENTS.find(e => e.topicId === 'courtcollect').month;
    const i = MONTHS.findIndex(m => m.key === first);
    expect(stateAt(i).newTopics).toContain('courtcollect');
    expect(stateAt(i - 1).visible.has('courtcollect')).toBe(false);
  });

  it('draws a link once both of its topics are on the map, and ends with all of them', () => {
    for (let i = 0; i < MONTHS.length; i++) {
      const s = stateAt(i);
      for (const c of s.links) expect(s.visible.has(c.from) && s.visible.has(c.to)).toBe(true);
    }
    const end = stateAt(LAST);
    expect(end.links.length).toBe(CONNECTIONS.length);
    expect(end.milestones).toBe(EVENTS.length);
    expect(end.conversations).toBe(MONTHS.reduce((a, m) => a + m.conversations, 0));
  });

  it('ends where the timeline ends, with no empty year after it', () => {
    // The fixtures used to run a year past the timeline; the dates now agree.
    expect(LAST_MILESTONE).toBe('2025-02');
    expect(MONTHS[LAST].key).toBe(LAST_MILESTONE);
    const after = MONTHS.map((m, i) => [m, stateAt(i)]).filter(([m]) => m.key > LAST_MILESTONE);
    expect(after.length).toBe(0);
    for (const [, s] of after) expect(s.events).toEqual([]);
  });
});

describe('the rewind page', () => {
  const noop = () => {};
  afterEach(() => { delete window.matchMedia; vi.useRealTimers(); });

  describe('with reduced motion', () => {
    beforeEach(() => { window.matchMedia = () => ({ matches: true }); });

    it('opens on the finished map and never plays on its own', () => {
      vi.useFakeTimers();
      render(<RewindMode onClose={noop} />);
      act(() => { vi.advanceTimersByTime(5000); });
      expect(screen.getByRole('slider', { name: 'Month' }).getAttribute('aria-valuetext')).toBe('Feb 2025');
      expect(screen.getByRole('button', { name: 'Replay from the start' })).toBeTruthy();
      expect(screen.getByText('LLM conversation extraction concept')).toBeTruthy();
    });

    it('scrubs, jumps to a phase, and opens a topic', () => {
      const onTopicClick = vi.fn();
      render(<RewindMode onClose={noop} onTopicClick={onTopicClick} />);
      fireEvent.change(screen.getByRole('slider', { name: 'Month' }), { target: { value: '0' } });
      expect(screen.getByRole('button', { name: /^Web Development: 1 milestone by Jan 2023, new this month/ })).toBeTruthy();
      expect(screen.queryByRole('button', { name: /^CourtCollect:/ })).toBeNull();

      fireEvent.click(screen.getByRole('button', { name: /^The Architect,/ }));
      expect(screen.getByRole('button', { name: /^The Architect,/ }).getAttribute('aria-pressed')).toBe('true');
      expect(screen.getByRole('slider', { name: 'Month' }).getAttribute('aria-valuetext')).toBe('Jul 2024');

      fireEvent.click(screen.getByRole('button', { name: /^Keymaster:/ }));
      fireEvent.click(screen.getByRole('button', { name: 'Open the Keymaster timeline →' }));
      expect(onTopicClick).toHaveBeenCalledWith(TOPICS.find(t => t.id === 'keymaster'));
    });

    it('goes back to where it was opened from', () => {
      const onClose = vi.fn();
      render(<RewindMode onClose={onClose} backLabel="Evolution" />);
      fireEvent.click(screen.getByRole('button', { name: '← Back to Evolution' }));
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('does not autoplay over a scrub made before it starts', () => {
    vi.useFakeTimers();
    render(<RewindMode onClose={noop} />);
    fireEvent.click(screen.getByRole('button', { name: /^The Architect,/ }));
    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.getByRole('slider', { name: 'Month' }).getAttribute('aria-valuetext')).toBe('Jul 2024');
    expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy();
  });

  it('otherwise starts at the first month, plays, and stops at the last', () => {
    vi.useFakeTimers();
    render(<RewindMode onClose={noop} />);
    const month = () => screen.getByRole('slider', { name: 'Month' }).getAttribute('aria-valuetext');
    expect(month()).toBe('Jan 2023');
    act(() => { vi.advanceTimersByTime(600); }); // autoplay starts
    act(() => { vi.advanceTimersByTime(1200 * 2); });
    expect(month()).toBe('Mar 2023');
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    act(() => { vi.advanceTimersByTime(5000); });
    expect(month()).toBe('Mar 2023');
    fireEvent.click(screen.getByRole('button', { name: '5×' }));
    fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    act(() => { vi.advanceTimersByTime(240 * 60); });
    expect(month()).toBe('Feb 2025');
    expect(screen.getByRole('button', { name: 'Replay from the start' })).toBeTruthy();
  });
});

describe('/companion/rewind in the app', () => {
  it('is a page of its own: Back names the view it came from, Escape closes it', async () => {
    const { MemoryRouter } = await import('react-router-dom');
    const { default: App } = await import('../../App');
    const { default: useStore } = await import('../../store');
    render(<MemoryRouter initialEntries={['/companion/rewind']}><App /></MemoryRouter>);
    expect(screen.getByRole('button', { name: '← Back to Overview' })).toBeTruthy();
    expect(screen.queryByRole('navigation', { name: 'Stations' })).toBeNull();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(useStore.getState().showRewind).toBe(false);
    expect(screen.queryByRole('slider', { name: 'Month' })).toBeNull();
  });
});
