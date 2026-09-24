import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GuidedTour, { placeCard } from '../GuidedTour';
import CompanionSidebar, { suggestionsFor, resolveAction } from '../CompanionSidebar';
import BriefingCard, { lastActivityOf, briefingText } from '../BriefingCard';
import SyncOverlay from '../SyncOverlay';
import { neighbors } from '../../views/ConnectionsView';
import { PATH_TO_VIEW } from '../../routes';
import {
  TOUR_STEPS, TOUR_STORAGE_KEY, COMPANION_SIDEBAR_SUGGESTIONS, TOPICS, BRIEFINGS, TIMELINE_DATA, getTopicFreshness,
} from '../../data/constants';
import useStore from '../../store';
import App from '../../App';

const topic = (id) => TOPICS.find(t => t.id === id);
const initialStore = useStore.getState();
beforeEach(() => { useStore.setState(initialStore, true); localStorage.clear(); });

describe('the guided tour', () => {
  it('is one tour, and every target it names is on the dashboard', () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    render(<MemoryRouter initialEntries={['/dashboard']}><App /></MemoryRouter>);
    for (const s of TOUR_STEPS.filter(x => x.target)) expect(document.querySelector(s.target), s.title).not.toBeNull();
  });

  it('shows once on the first dashboard visit, including to someone who finished the v5 tour', () => {
    vi.useFakeTimers();
    localStorage.setItem('atlas_tour_completed', 'true');
    render(<MemoryRouter initialEntries={['/dashboard']}><App /></MemoryRouter>);
    act(() => { vi.advanceTimersByTime(700); });
    expect(useStore.getState().tourActive).toBe(true);
    vi.useRealTimers();
  });

  it('walks forward and back, and counts its steps', () => {
    render(<GuidedTour active onClose={() => {}} />);
    expect(screen.getByRole('heading', { name: 'Welcome to Atlas' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('heading', { name: 'Three stations' })).toBeTruthy();
    expect(screen.getByText(`2 of ${TOUR_STEPS.length}`, { exact: false })).toBeTruthy();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowRight' });
    expect(screen.getByRole('heading', { name: 'Your topics' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('heading', { name: 'Three stations' })).toBeTruthy();
  });

  it('is marked seen however it ends', () => {
    for (const end of ['skip', 'escape', 'finish']) {
      localStorage.clear();
      const onClose = vi.fn();
      const { unmount } = render(<GuidedTour active onClose={onClose} />);
      if (end === 'skip') fireEvent.click(screen.getByRole('button', { name: 'Skip tour' }));
      if (end === 'escape') fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
      if (end === 'finish') {
        for (let i = 1; i < TOUR_STEPS.length; i++) fireEvent.click(screen.getByRole('button', { name: 'Next' }));
        fireEvent.click(screen.getByRole('button', { name: 'Start exploring' }));
      }
      expect(onClose, end).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem(TOUR_STORAGE_KEY), end).toBe('true');
      unmount();
    }
  });

  it('places its card below the target when it fits, above otherwise, on screen', () => {
    const vp = { width: 1280, height: 900 };
    expect(placeCard({ top: 20, left: 600, width: 80, height: 30 }, vp, 420)).toEqual({ left: 430, top: 76 });
    expect(placeCard({ top: 800, left: 600, width: 80, height: 30 }, vp, 420)).toEqual({ left: 430, bottom: 126 });
    expect(placeCard({ top: 20, left: 1250, width: 20, height: 20 }, vp, 420).left).toBe(1280 - 420 - 16);
    expect(placeCard({ top: 20, left: 0, width: 20, height: 20 }, vp, 420).left).toBe(16);
  });
});

describe('the companion sidebar, as data', () => {
  const all = Object.values(COMPANION_SIDEBAR_SUGGESTIONS).flat();
  const views = new Set(Object.values(PATH_TO_VIEW));

  it('sends every action somewhere real', () => {
    for (const s of all) {
      for (const a of s.actions) {
        if (a.view) expect(views, `${s.id} ${a.label}`).toContain(a.view);
        const id = a.topic || a.brief;
        if (id && id !== 'current') expect(topic(id), `${s.id} ${a.label}`).toBeTruthy();
        if (a.brief && a.brief !== 'current') expect(BRIEFINGS[a.brief], `${s.id} has a briefing`).toBeTruthy();
      }
    }
  });

  it('only claims what the fixtures say', () => {
    // Knowledge Mgmt was called stale; it is active. Keymaster is the one cooling.
    expect(getTopicFreshness(topic('keymaster'))).toBe('cooling');
    expect(topic('keymaster').lastSeen).toBe('Dec 2025');
    expect(topic('courtcollect').count).toBe(47);
    const degree = (id) => neighbors(id).length;
    expect(degree('automation')).toBe(5);
    expect(Math.max(...TOPICS.map(t => degree(t.id)))).toBe(5);
    // "Potential new connection" between these two was already a connection.
    expect(neighbors('gamedev').map(n => n.id)).toEqual(['writing']);
    expect(neighbors('writing').map(n => n.id)).toEqual(['gamedev']);
    // "Never connected Personal Finance to automation": it is, and only to that.
    expect(topic('finance').count).toBe(28);
    expect(neighbors('finance').map(n => n.id)).toEqual(['automation']);
  });

  it('says when its suggestions are the overview\'s, and drops actions with no topic on screen', () => {
    expect(suggestionsFor('export').general).toBe(true);
    expect(suggestionsFor('timeline').general).toBe(false);
    expect(resolveAction({ label: 'Brief me', brief: 'current' }, null)).toBeNull();
    expect(resolveAction({ label: 'Brief me', brief: 'current' }, topic('hmprg'))).toEqual({ kind: 'brief', topic: topic('hmprg') });
    expect(resolveAction({ label: 'Open timeline', topic: 'keymaster' })).toEqual({ kind: 'topic', topic: topic('keymaster') });
    expect(resolveAction({ label: 'View diff', view: 'beliefDiffs' })).toEqual({ kind: 'view', id: 'beliefDiffs' });
  });
});

describe('the companion sidebar', () => {
  it('is a real toggle, hidden while closed', () => {
    const onToggle = vi.fn();
    const { rerender } = render(<CompanionSidebar isOpen={false} onToggle={onToggle} view="dashboard" />);
    const toggle = screen.getByRole('button', { name: /Open the companion: 3 suggestions/ });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(document.getElementById('companion-sidebar').getAttribute('aria-hidden')).toBe('true');
    fireEvent.click(toggle);
    expect(onToggle).toHaveBeenCalled();
    rerender(<CompanionSidebar isOpen onToggle={onToggle} view="dashboard" />);
    expect(screen.getByRole('complementary', { name: 'Companion' })).toBeTruthy();
  });

  it('opens what each action names', () => {
    const h = { onNavigate: vi.fn(), onTopicClick: vi.fn(), onBriefMe: vi.fn() };
    render(<CompanionSidebar isOpen onToggle={() => {}} view="dashboard" {...h} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Open timeline' })[0]);
    expect(h.onTopicClick).toHaveBeenCalledWith(topic('keymaster'));
    fireEvent.click(screen.getByRole('button', { name: 'Brief me: CourtCollect' }));
    expect(h.onBriefMe).toHaveBeenCalledWith(topic('courtcollect'));
    fireEvent.click(screen.getByRole('button', { name: 'View diff' }));
    expect(h.onNavigate).toHaveBeenCalledWith('beliefDiffs');
  });

  it('briefs the topic on screen, and leaves that out when there is none', () => {
    const onBriefMe = vi.fn();
    const { rerender } = render(<CompanionSidebar isOpen onToggle={() => {}} view="timeline" currentTopic={topic('jobsearch')} onBriefMe={onBriefMe} />);
    fireEvent.click(screen.getByRole('button', { name: 'Brief me' }));
    expect(onBriefMe).toHaveBeenCalledWith(topic('jobsearch'));
    rerender(<CompanionSidebar isOpen onToggle={() => {}} view="timeline" currentTopic={null} onBriefMe={onBriefMe} />);
    expect(screen.queryByRole('button', { name: /Brief me/ })).toBeNull();
  });
});

describe('the briefing card', () => {
  it('reads the last activity from the timeline, not a typed date', () => {
    const last = lastActivityOf('courtcollect');
    const events = TIMELINE_DATA.courtcollect;
    expect(last.date).toBe([...events].map(e => e.date).sort().at(-1));
    expect(events[last.index].title).toBe(last.title);
    // The typed version said "Feb 3, 2026" for an event the timeline dates 2025-02-03.
    expect(briefingText(topic('courtcollect'))).toContain(`LAST ACTIVITY (Feb 3, 2025)`);
  });

  it('copies the briefing as text and says so', async () => {
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    render(<BriefingCard topic={topic('hmprg')} onClose={() => {}} />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Copy briefing' })); });
    expect(writeText).toHaveBeenCalledWith(briefingText(topic('hmprg')));
    expect(screen.getByRole('status').textContent).toMatch(/^Copied/);
  });

  it('opens a connection, the last conversation, or the timeline', () => {
    const h = { onClose: vi.fn(), onTopicClick: vi.fn(), onConversationClick: vi.fn() };
    render(<BriefingCard topic={topic('courtcollect')} {...h} />);
    expect(screen.getByRole('dialog', { name: /CourtCollect/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /^Tyler Technologies:/ }));
    expect(h.onTopicClick).toHaveBeenCalledWith(topic('tyler'));
    fireEvent.click(screen.getByRole('button', { name: /Josephine TX integration/ }));
    expect(h.onConversationClick).toHaveBeenCalledWith('courtcollect', lastActivityOf('courtcollect').index);
    expect(h.onClose).toHaveBeenCalledTimes(2);
  });

  it('says so when a topic has no briefing, instead of rendering nothing', () => {
    const onTopicClick = vi.fn();
    render(<BriefingCard topic={topic('writing')} onClose={() => {}} onTopicClick={onTopicClick} />);
    expect(screen.getByText(/hasn't written a briefing for Creative Writing yet/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Copy briefing' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Open the timeline →' }));
    expect(onTopicClick).toHaveBeenCalledWith(topic('writing'));
  });
});

describe('the sync overlay', () => {
  afterEach(() => vi.useRealTimers());

  it('marks what is done, what is running and what is next', () => {
    render(<SyncOverlay isSyncing syncPhase="downloading" syncProgress={40} newCount={47} />);
    const steps = screen.getAllByRole('listitem');
    expect(steps.map(s => s.textContent.slice(0, 1))).toEqual(['✓', '●', '○', '○']);
    expect(steps[1].getAttribute('aria-current')).toBe('step');
    expect(steps[1].textContent).toContain('Fetching 47 new conversations');
    expect(screen.getByRole('status', { name: 'Sync progress' })).toBeTruthy();
  });

  it('renders nothing when no sync is running', () => {
    const { container } = render(<SyncOverlay isSyncing={false} />);
    expect(container.innerHTML).toBe('');
  });
});
