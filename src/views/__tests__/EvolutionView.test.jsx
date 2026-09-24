import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import EvolutionView, { monthIndex, phaseRange, phaseOf } from '../EvolutionView';
import { EVOLUTION_PHASES, PIVOT_ENTRIES } from '../../data/constants';

describe('the phases, as data', () => {
  it('reads "Mon YYYY" dates and nothing else', () => {
    expect(monthIndex('Jan 2023')).toBe(2023 * 12);
    expect(monthIndex('Dec 2025') - monthIndex('Jan 2025')).toBe(11);
    expect(monthIndex('2025-01')).toBeNull();
    expect(monthIndex('Foo 2025')).toBeNull();
  });

  it('reads both period forms', () => {
    expect(phaseRange('Jan – Jun 2023')).toEqual({ start: monthIndex('Jan 2023'), end: monthIndex('Jun 2023'), label: 'Jan 2023' });
    expect(phaseRange('Jul 2025 – Feb 2026')).toEqual({ start: monthIndex('Jul 2025'), end: monthIndex('Feb 2026'), label: 'Jul 2025' });
  });

  it('the phases run in order, back to back, with no gap or overlap', () => {
    const ranges = EVOLUTION_PHASES.map(p => phaseRange(p.period));
    for (const r of ranges) expect(r.start).toBeLessThanOrEqual(r.end);
    for (let i = 1; i < ranges.length; i++) expect(ranges[i].start).toBe(ranges[i - 1].end + 1);
  });

  it('every pivot falls in a phase', () => {
    for (const p of PIVOT_ENTRIES) expect(phaseOf(p.date)).toBeGreaterThanOrEqual(0);
    expect(phaseOf('Jan 2020')).toBe(-1);
  });
});

describe('the evolution view', () => {
  it('opens on the latest phase and switches with the phase bars', () => {
    render(<EvolutionView />);
    const bars = within(screen.getByRole('group', { name: 'Phases' })).getAllByRole('button');
    expect(bars).toHaveLength(EVOLUTION_PHASES.length);
    expect(bars.at(-1).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(bars[0]);
    expect(bars[0].getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('region', { name: `${EVOLUTION_PHASES[0].title}, selected phase` })).toBeTruthy();
  });

  it('a pivot opens, takes a note and counts it', () => {
    const pivot = PIVOT_ENTRIES.find(p => !p.annotation);
    const noted = PIVOT_ENTRIES.filter(p => p.annotation).length;
    render(<EvolutionView />);
    expect(screen.getByRole('heading', { name: `Pivots · ${noted} of ${PIVOT_ENTRIES.length} with your note` })).toBeTruthy();
    const card = screen.getByRole('article', { name: pivot.title });
    const toggle = within(card).getAllByRole('button')[0];
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(within(card).getByRole('button', { name: 'Add a note' }));
    fireEvent.change(within(card).getByLabelText('Why did your thinking change?'), { target: { value: 'It broke quietly.' } });
    fireEvent.click(within(card).getByRole('button', { name: 'Save' }));
    expect(within(screen.getByRole('article', { name: pivot.title })).getByText('It broke quietly.')).toBeTruthy();
    expect(screen.getByRole('heading', { name: `Pivots · ${noted + 1} of ${PIVOT_ENTRIES.length} with your note` })).toBeTruthy();
  });

  it('topics a pivot touched open their timeline', () => {
    const onTopicClick = vi.fn();
    render(<EvolutionView onTopicClick={onTopicClick} />);
    const card = screen.getByRole('article', { name: PIVOT_ENTRIES[0].title });
    fireEvent.click(within(card).getAllByRole('button')[0]);
    fireEvent.click(within(card).getByRole('button', { name: 'Open the CourtCollect timeline' }));
    expect(onTopicClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'courtcollect' }));
  });
});
