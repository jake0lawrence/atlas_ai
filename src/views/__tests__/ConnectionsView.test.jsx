import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import ConnectionsView, { neighbors, ringOrder, ringPositions } from '../ConnectionsView';
import { TOPICS, CONNECTIONS } from '../../data/constants';

describe('the graph, as data', () => {
  it('every connection joins two real topics', () => {
    const ids = new Set(TOPICS.map(t => t.id));
    for (const c of CONNECTIONS) { expect(ids.has(c.from)).toBe(true); expect(ids.has(c.to)).toBe(true); }
  });

  it('lists a topic\'s neighbors from either end, strongest first', () => {
    const conns = [{ from: 'a', to: 'b', label: 'x', strength: 0.4 }, { from: 'c', to: 'a', label: 'y', strength: 0.9 }];
    expect(neighbors('a', conns)).toEqual([{ id: 'c', label: 'y', strength: 0.9 }, { id: 'b', label: 'x', strength: 0.4 }]);
    expect(neighbors('z', conns)).toEqual([]);
  });

  it('places every topic exactly once, starting from the most connected', () => {
    const order = ringOrder();
    expect([...order].sort()).toEqual(TOPICS.map(t => t.id).sort());
    const degree = id => neighbors(id).length;
    expect(Math.max(...TOPICS.map(t => degree(t.id)))).toBe(degree(order[0]));
    expect(ringOrder()).toEqual(order); // same every run
  });

  it('puts strongly linked topics next to each other more often than fixture order does', () => {
    const adjacentLinks = (order) => order.filter((id, i) => neighbors(id).some(n => n.id === order[(i + 1) % order.length])).length;
    expect(adjacentLinks(ringOrder())).toBeGreaterThan(adjacentLinks(TOPICS.map(t => t.id)));
  });

  it('keeps every node inside the drawing', () => {
    for (const p of Object.values(ringPositions(ringOrder()))) {
      expect(p.x).toBeGreaterThanOrEqual(10); expect(p.x).toBeLessThanOrEqual(90);
      expect(p.y).toBeGreaterThanOrEqual(10); expect(p.y).toBeLessThanOrEqual(90);
    }
  });
});

describe('the connections view', () => {
  it('opens on the strongest connections, and a topic button selects it', () => {
    render(<ConnectionsView onTopicClick={() => {}} />);
    expect(screen.getByRole('region', { name: 'Strongest connections' })).toBeTruthy();
    const node = screen.getByRole('button', { name: /^Job Search: / });
    fireEvent.click(node);
    expect(node.getAttribute('aria-pressed')).toBe('true');
    const panel = screen.getByRole('region', { name: 'Job Search connections' });
    expect(within(panel).getAllByRole('listitem')).toHaveLength(neighbors('jobsearch').length);
  });

  it('moves between neighbors, opens the timeline, and goes back', () => {
    const onTopicClick = vi.fn();
    render(<ConnectionsView onTopicClick={onTopicClick} />);
    fireEvent.click(screen.getByRole('button', { name: /^Job Search: / }));
    fireEvent.click(screen.getByRole('button', { name: "Show Resumes & Cover Letters's connections" }));
    expect(screen.getByRole('region', { name: 'Resumes & Cover Letters connections' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Open the Resumes & Cover Letters timeline/ }));
    expect(onTopicClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'resumes' }));
    fireEvent.click(screen.getByRole('button', { name: 'Back to the strongest connections' }));
    expect(screen.getByRole('region', { name: 'Strongest connections' })).toBeTruthy();
  });
});
