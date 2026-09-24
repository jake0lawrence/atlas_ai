import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import DecisionArchaeology, { ROLES, formatDate, axisPositions, monthsBetween, spanInWords, sourceEvent } from '../DecisionArchaeology';
import { ARCHAEOLOGY_CHAINS, TIMELINE_DATA, TOPICS } from '../../data/constants';

const chains = Object.values(ARCHAEOLOGY_CHAINS);

describe('the chains, as data', () => {
  it('every node has a known role and topic, in date order, from a seed to a resolution', () => {
    const ids = new Set(TOPICS.map(t => t.id));
    for (const c of chains) {
      expect(c.nodes[0].role).toBe('seed');
      expect(c.nodes.at(-1).role).toBe('resolution');
      for (const n of c.nodes) { expect(ROLES[n.role]).toBeTruthy(); expect(ids.has(n.topicId)).toBe(true); }
      const dates = c.nodes.map(n => n.date);
      expect([...dates].sort()).toEqual(dates);
    }
  });

  it('places the seed at 0 and the resolution at 100', () => {
    for (const c of chains) {
      const pos = axisPositions(c.nodes);
      expect(pos[c.nodes[0].id]).toBe(0);
      expect(pos[c.nodes.at(-1).id]).toBe(100);
    }
  });

  it('formats dates and spans without a time zone', () => {
    expect(formatDate('2023-03-14')).toBe('Mar 14, 2023');
    expect(monthsBetween('2023-03-14', '2024-08-25')).toBe(17);
    expect(spanInWords('2023-03-14', '2024-08-25')).toBe('17 months');
    expect(spanInWords('2024-10-01', '2024-11-16')).toBe('7 weeks');
    expect(spanInWords('2024-11-14', '2024-11-15')).toBe('1 day');
  });

  it('links a step to a conversation only when that conversation is really the step', () => {
    for (const c of chains) for (const n of c.nodes) {
      const ev = sourceEvent(n);
      if (ev) expect(ev.date).toBe(n.date);
      const raw = (TIMELINE_DATA[n.topicId] || [])[n.eventIndex];
      if (!raw || raw.date !== n.date) expect(ev).toBeNull();
    }
    // The Vercel chain's last two steps are real events on the CourtCollect timeline.
    const vercel = ARCHAEOLOGY_CHAINS['why-vercel'].nodes;
    expect(sourceEvent(vercel.at(-1))).toBeTruthy();
    expect(sourceEvent(ARCHAEOLOGY_CHAINS['why-typescript'].nodes[0])).toBeNull();
  });
});

describe('the archaeology view', () => {
  it('picks a step on the arc and highlights its card', () => {
    render(<DecisionArchaeology chainId="why-typescript" />);
    const node = ARCHAEOLOGY_CHAINS['why-typescript'].nodes[2];
    const marker = screen.getByRole('button', { name: new RegExp(`^Challenging, .*${node.title}`) });
    fireEvent.click(marker);
    expect(marker.getAttribute('aria-pressed')).toBe('true');
  });

  it('opens real conversations, falls back to the topic timeline, and moves between chains', () => {
    const onConversationClick = vi.fn();
    const onTopicClick = vi.fn();
    const onOpenChain = vi.fn();
    render(<DecisionArchaeology chainId="why-vercel" onConversationClick={onConversationClick} onTopicClick={onTopicClick} onOpenChain={onOpenChain} />);
    const nodes = ARCHAEOLOGY_CHAINS['why-vercel'].nodes;
    const last = screen.getByRole('article', { name: `Resolution: ${nodes.at(-1).title}` });
    fireEvent.click(within(last).getByRole('button', { name: /Open the conversation/ }));
    expect(onConversationClick).toHaveBeenCalledWith(nodes.at(-1).topicId, nodes.at(-1).eventIndex);
    fireEvent.click(screen.getByRole('button', { name: /Why TypeScript\?/ }));
    expect(onOpenChain).toHaveBeenCalledWith('why-typescript');
  });

  it('an unknown chain gets a designed page listing the real ones', () => {
    const onBack = vi.fn();
    render(<DecisionArchaeology chainId="nope" onBack={onBack} onOpenChain={() => {}} />);
    expect(screen.getByRole('heading', { name: /No chain called/ })).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /^Why / })).toHaveLength(chains.length);
    fireEvent.click(screen.getByRole('button', { name: 'Overview' }));
    expect(onBack).toHaveBeenCalled();
  });
});
