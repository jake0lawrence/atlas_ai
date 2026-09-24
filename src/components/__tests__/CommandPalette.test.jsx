import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import CommandPalette, { PAGES, SUGGESTIONS, searchAll, targetOf, highlight, optionsOf, step, formatDate } from '../CommandPalette';
import { STATIONS } from '../Nav';
import { SEARCH_RESULTS, TOPICS, TIMELINE_DATA } from '../../data/constants';
import useStore from '../../store';
import App from '../../App';

describe('search, as data', () => {
  it('offers every page the nav does, and nothing that is not a page', () => {
    const navPages = STATIONS.flatMap(s => (s.pages.length ? s.pages.map(p => p.id) : [s.home]));
    const ids = PAGES.map(p => p.id);
    for (const id of navPages) expect(ids, id).toContain(id);
    expect(ids).not.toContain('search');
  });

  it('files every result under a real topic or none', () => {
    for (const r of SEARCH_RESULTS) {
      if (r.topicId !== null) expect(TOPICS.map(t => t.id), r.title).toContain(r.topicId);
    }
  });

  it('opens a conversation only when its topic has an event that same day', () => {
    for (const r of SEARCH_RESULTS) {
      const t = targetOf(r);
      if (t?.kind === 'conversation') expect(TIMELINE_DATA[r.topicId][t.eventIndex].date, r.title).toBe(r.date);
    }
    const docker = targetOf(SEARCH_RESULTS.find(r => r.title === 'CourtCollect Docker debugging'));
    expect(docker).toEqual({ kind: 'conversation', topicId: 'courtcollect', eventIndex: TIMELINE_DATA.courtcollect.findIndex(e => e.date === '2024-11-14') });
    // Keymaster has nothing on 2024-08-22 (that day's event belongs to n8n), so it opens the timeline.
    expect(targetOf(SEARCH_RESULTS.find(r => r.title === 'Keymaster container setup'))).toEqual({ kind: 'topic', topicId: 'keymaster' });
    expect(targetOf(SEARCH_RESULTS.find(r => r.title === 'Date night restaurant recommendations'))).toBeNull();
  });

  it('needs every word, and ranks title matches first', () => {
    // "restaurant gina" used to match anything with either word, Gina's CRSS program included.
    expect(searchAll('restaurant gina').conversations.map(r => r.title)).toEqual([
      'Date night restaurant recommendations', 'Chicago weekend trip planning',
    ]);
    expect(searchAll('docker').conversations.map(r => r.title)).toEqual(['CourtCollect Docker debugging', 'Keymaster container setup']);
    expect(searchAll('keymaster').topics.map(t => t.id)).toEqual(['keymaster']);
    expect(searchAll('companion').pages.length).toBeGreaterThan(1);
    expect(searchAll('zzz')).toEqual({ conversations: [], topics: [], pages: [] });
  });

  it('lists every topic and page for an empty query', () => {
    const all = searchAll('  ');
    expect(all.conversations).toEqual([]);
    expect(all.topics.length).toBe(TOPICS.length);
    expect(all.pages).toBe(PAGES);
  });

  it('suggests only queries that find something', () => {
    for (const s of SUGGESTIONS) expect(searchAll(s).conversations.length, s).toBeGreaterThan(0);
  });

  it('marks the matched words, whatever their case', () => {
    expect(highlight('CourtCollect Docker debugging', ['docker'])).toEqual([
      { text: 'CourtCollect ', hit: false }, { text: 'Docker', hit: true }, { text: ' debugging', hit: false },
    ]);
    expect(highlight('a+b', ['+'])).toEqual([{ text: 'a', hit: false }, { text: '+', hit: true }, { text: 'b', hit: false }]);
    expect(highlight('plain', [])).toEqual([{ text: 'plain', hit: false }]);
  });

  it('walks the options skipping the ones with nowhere to go', () => {
    const options = optionsOf(searchAll('restaurant'));
    expect(options.every(o => o.disabled)).toBe(true);
    expect(step(options, -1, 1)).toBe(-1);
    const mixed = [{ disabled: false }, { disabled: true }, { disabled: false }];
    expect(step(mixed, 0, 1)).toBe(2);
    expect(step(mixed, 2, 1)).toBe(2);
    expect(step(mixed, 2, -1)).toBe(0);
  });

  it('leads with the pages while browsing, with the results once searching', () => {
    expect(optionsOf(searchAll(''), true)[0]).toMatchObject({ group: 'pages', page: { id: 'dashboard' } });
    expect(optionsOf(searchAll('docker'))[0]).toMatchObject({ group: 'conversations' });
  });

  it('formats dates in words', () => {
    expect(formatDate('2024-11-14')).toBe('Nov 14, 2024');
  });
});

describe('the palette', () => {
  const setup = (props = {}) => {
    const handlers = { onClose: vi.fn(), onNavigate: vi.fn(), onTopicClick: vi.fn(), onConversationClick: vi.fn() };
    render(<CommandPalette open {...handlers} {...props} />);
    return handlers;
  };
  const input = () => screen.getByRole('combobox');

  it('renders nothing while closed', () => {
    const { container } = render(<CommandPalette open={false} onClose={() => {}} />);
    expect(container.innerHTML).toBe('');
  });

  it('starts from the query it was opened with, first result active', () => {
    setup({ initialQuery: 'docker' });
    expect(input().value).toBe('docker');
    const selected = screen.getAllByRole('option').find(o => o.getAttribute('aria-selected') === 'true');
    expect(selected.textContent).toContain('CourtCollect Docker debugging');
    expect(input().getAttribute('aria-activedescendant')).toBe(selected.id);
  });

  it('opens the conversation on Enter, the timeline on the next result', () => {
    const h = setup({ initialQuery: 'docker' });
    fireEvent.keyDown(input(), { key: 'Enter' });
    expect(h.onConversationClick).toHaveBeenCalledWith('courtcollect', TIMELINE_DATA.courtcollect.findIndex(e => e.date === '2024-11-14'));
    expect(h.onClose).toHaveBeenCalled();
  });

  it('moves with the arrows and opens a topic timeline', () => {
    const h = setup({ initialQuery: 'docker' });
    fireEvent.keyDown(input(), { key: 'ArrowDown' });
    fireEvent.keyDown(input(), { key: 'Enter' });
    expect(h.onTopicClick).toHaveBeenCalledWith(TOPICS.find(t => t.id === 'keymaster'));
  });

  it('goes to a page', () => {
    const h = setup();
    fireEvent.change(input(), { target: { value: 'belief' } });
    fireEvent.click(screen.getByRole('option', { name: /Belief Diffs/ }));
    expect(h.onNavigate).toHaveBeenCalledWith('beliefDiffs');
  });

  it('shows an unfiled conversation but does not pretend to open it', () => {
    const h = setup({ initialQuery: 'restaurant' });
    const row = screen.getByRole('option', { name: /Date night restaurant/ });
    expect(row.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(row);
    fireEvent.keyDown(input(), { key: 'Enter' });
    expect(h.onClose).not.toHaveBeenCalled();
    expect(screen.getAllByText('No timeline to open').length).toBe(2);
  });

  it('fills the query from a suggestion, and designs the empty result', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'dice game' }));
    expect(input().value).toBe('dice game');
    fireEvent.change(input(), { target: { value: 'quantum' } });
    expect(screen.getByText(/Nothing matches “quantum”/)).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('Nothing matches quantum');
    fireEvent.click(screen.getByRole('button', { name: 'supabase auth' }));
    expect(input().value).toBe('supabase auth');
  });

  it('closes on Escape and from its close button', () => {
    const h = setup();
    fireEvent.keyDown(input(), { key: 'Escape' });
    fireEvent.click(screen.getByRole('button', { name: 'Close search' }));
    expect(h.onClose).toHaveBeenCalledTimes(2);
  });
});

describe('/search', () => {
  const initialStore = useStore.getState();
  beforeEach(() => { useStore.setState(initialStore, true); localStorage.clear(); });

  it('is not a page: it opens the palette over the dashboard with the query typed', () => {
    const Where = () => <output data-testid="where">{useLocation().pathname}</output>;
    render(<MemoryRouter initialEntries={['/search?q=dice']}><App /><Where /></MemoryRouter>);
    expect(screen.getByTestId('where').textContent).toBe('/dashboard');
    expect(useStore.getState().view).toBe('dashboard');
    expect(useStore.getState().cmdPaletteOpen).toBe(true);
    expect(screen.getByRole('combobox').value).toBe('dice');
    expect(screen.getByRole('option', { name: /Dice or Die core gameplay loop/ })).toBeTruthy();
  });

  it('a fresh ⌘K opens empty', () => {
    render(<MemoryRouter initialEntries={['/search?q=dice']}><App /></MemoryRouter>);
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' });
    expect(useStore.getState().cmdPaletteOpen).toBe(false);
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.getByRole('combobox').value).toBe('');
  });
});
