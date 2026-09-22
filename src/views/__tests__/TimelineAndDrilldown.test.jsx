import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import TimelineView, { hasTranscript } from '../TimelineView';
import ConversationDrilldown, { locateExtractions, splitCode, transcriptIndexes } from '../ConversationDrilldown';
import { TOPICS, TIMELINE_DATA, CONVERSATION_PREVIEWS } from '../../data/constants';

const topic = TOPICS.find(t => t.id === 'courtcollect');
const events = TIMELINE_DATA.courtcollect;

describe('fixtures', () => {
  it('every extraction resolves to its text in its message', () => {
    for (const [key, convo] of Object.entries(CONVERSATION_PREVIEWS)) {
      convo.messages.forEach((m, i) => {
        const found = locateExtractions(m.text, m.extractions);
        expect(found.map(e => e.text), `${key} message ${i}`).toEqual((m.extractions || []).map(e => e.text).sort((a, b) => m.text.indexOf(a) - m.text.indexOf(b)));
      });
    }
  });
});

describe('pure helpers', () => {
  it('locates by text, drops the unfound and the overlapping', () => {
    const text = 'use Jest for unit tests and Playwright for e2e';
    expect(locateExtractions(text, [
      { type: 'decision', text: 'Jest for unit tests', start: 99, end: 120 },
      { type: 'entity', text: 'unit tests', start: 0, end: 0 },
      { type: 'entity', text: 'Cypress', start: 0, end: 0 },
      { type: 'entity', text: 'Playwright', start: 0, end: 0 },
    ])).toEqual([
      { type: 'decision', text: 'Jest for unit tests', start: 4, end: 23 },
      { type: 'entity', text: 'Playwright', start: 28, end: 38 },
    ]);
  });
  it('splits fenced code from prose without the fences', () => {
    expect(splitCode('before\n```\na/\n  b\n```\nafter')).toEqual([
      { code: false, text: 'before\n' }, { code: true, text: 'a/\n  b' }, { code: false, text: 'after' },
    ]);
  });
  it('knows which events have transcripts', () => {
    expect(transcriptIndexes('courtcollect')).toEqual(events.map((_, i) => i).filter(i => hasTranscript('courtcollect', i)));
    expect(transcriptIndexes('nope')).toEqual([]);
  });
});

describe('TimelineView', () => {
  it('filters by type and only makes transcript events clickable', () => {
    const onEventClick = vi.fn();
    render(<TimelineView topic={topic} onBack={() => {}} onEventClick={onEventClick} mobile={false} newEvents={{}} />);
    const list = screen.getByRole('list', { name: 'CourtCollect timeline' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(events.length);
    const readable = within(list).getAllByRole('button', { name: /^Read the thread/ });
    expect(readable).toHaveLength(transcriptIndexes('courtcollect').length);
    fireEvent.click(readable[0]);
    expect(onEventClick).toHaveBeenCalledWith('courtcollect', transcriptIndexes('courtcollect')[0]);

    fireEvent.click(screen.getByRole('button', { name: /Build/ }));
    expect(within(list).getAllByRole('listitem')).toHaveLength(events.filter(e => e.type === 'build').length);
    expect(screen.getByRole('button', { name: /Build/ }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: /^All/ }));
    expect(within(list).getAllByRole('listitem')).toHaveLength(events.length);
  });

  it('breadcrumb returns to the overview', () => {
    const onBack = vi.fn();
    render(<TimelineView topic={topic} onBack={onBack} onEventClick={() => {}} mobile={false} newEvents={{}} />);
    fireEvent.click(within(screen.getByRole('navigation', { name: 'Breadcrumb' })).getByRole('button', { name: 'Overview' }));
    expect(onBack).toHaveBeenCalled();
  });
});

describe('ConversationDrilldown', () => {
  const idx = transcriptIndexes('courtcollect');

  it('renders code without fences and lists what was extracted', () => {
    render(<ConversationDrilldown topicId="courtcollect" eventIndex={4} onBack={() => {}} onHome={() => {}} onEventClick={() => {}} mobile={false} />);
    const thread = screen.getByRole('region', { name: 'Conversation thread' });
    expect(thread.textContent).not.toContain('```');
    expect(thread.querySelector('pre').textContent).toContain('courtcollect/');
    expect(within(thread).getByText('Require PR reviews', { selector: 'mark' })).toBeTruthy();
    expect(within(thread).getAllByRole('list', { name: 'Extracted by Atlas' }).length).toBeGreaterThan(0);
  });

  it('links to the neighbouring threads', () => {
    const onEventClick = vi.fn();
    const mid = idx[1];
    render(<ConversationDrilldown topicId="courtcollect" eventIndex={mid} onBack={() => {}} onHome={() => {}} onEventClick={onEventClick} mobile={false} />);
    const nav = screen.getByRole('navigation', { name: 'Other threads' });
    fireEvent.click(within(nav).getByRole('button', { name: /Earlier thread/ }));
    expect(onEventClick).toHaveBeenLastCalledWith('courtcollect', idx[0]);
    fireEvent.click(within(nav).getByRole('button', { name: /Later thread/ }));
    expect(onEventClick).toHaveBeenLastCalledWith('courtcollect', idx[2]);
  });

  it('gives an event without a transcript a real page, not a blank one', () => {
    const onEventClick = vi.fn();
    expect(idx).not.toContain(0);
    render(<ConversationDrilldown topicId="courtcollect" eventIndex={0} onBack={() => {}} onHome={() => {}} onEventClick={onEventClick} mobile={false} />);
    expect(screen.getByRole('heading', { level: 1, name: events[0].title })).toBeTruthy();
    expect(screen.getByText(/Only the summary of this conversation is in the demo/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: new RegExp(events[idx[0]].title) }));
    expect(onEventClick).toHaveBeenCalledWith('courtcollect', idx[0]);
  });

  it('handles an unknown topic', () => {
    render(<ConversationDrilldown topicId="nope" eventIndex={0} onBack={() => {}} onHome={() => {}} mobile={false} />);
    expect(screen.getByText("That conversation isn't in this atlas")).toBeTruthy();
  });
});
