import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import DigestView, { chronological, latestComplete, deltaCount, withGaps } from '../DigestView';
import { DIGEST_DATA, TOPICS } from '../../data/constants';

describe('the digests, as data', () => {
  it('reads growth deltas as numbers', () => {
    expect(deltaCount('+12 conversations')).toBe(12);
    expect(deltaCount('steady')).toBe(0);
  });

  it('runs oldest to newest on the strip and opens on the newest finished issue', () => {
    expect(chronological().at(-1)).toBe(DIGEST_DATA[0]);
    const open = latestComplete();
    expect(open.generating).toBeFalsy();
    expect(DIGEST_DATA.findIndex(d => !d.generating)).toBe(DIGEST_DATA.indexOf(open));
  });

  it('shows a month with no issue as a gap instead of closing it up', () => {
    const mk = (month) => ({ id: month, month, stats: { conversations: 1 } });
    expect(withGaps([mk('January 2026'), mk('October 2025')]).map(x => x.gap || x.month)).toEqual(['October 2025', 'November 2025', 'December 2025', 'January 2026']);
    expect(withGaps().filter(x => !x.gap)).toHaveLength(DIGEST_DATA.length);
  });

  it('every topic a digest names is a real topic', () => {
    const ids = new Set(TOPICS.map(t => t.id));
    for (const d of DIGEST_DATA) for (const t of [...d.deepened, ...d.goneQuiet]) expect(ids.has(t.topicId)).toBe(true);
  });
});

describe('the digest view', () => {
  it('opens the latest finished issue and switches with the month bars', () => {
    render(<DigestView />);
    expect(screen.getByRole('article', { name: `${latestComplete().month} digest` })).toBeTruthy();
    const inProgress = DIGEST_DATA.find(d => d.generating);
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${inProgress.month}: .*still being written`) }));
    const issue = screen.getByRole('article', { name: `${inProgress.month} digest` });
    expect(within(issue).getByRole('status').textContent).toMatch(/isn't over/);
  });

  it('topics open their timelines', () => {
    const onTopicClick = vi.fn();
    render(<DigestView onTopicClick={onTopicClick} />);
    const first = latestComplete().deepened[0];
    fireEvent.click(screen.getAllByRole('button', { name: `Open the ${first.name} timeline` })[0]);
    expect(onTopicClick).toHaveBeenCalledWith(expect.objectContaining({ id: first.topicId }));
  });
});
