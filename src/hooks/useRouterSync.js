import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useStore from '../store';
import { TOPICS } from '../data/constants';

// ─── Route Mapping ──────────────────────────────────────────

const PATH_TO_VIEW = {
  '/': 'onboarding',
  '/loading': 'loading',
  '/curation': 'curation',
  '/curation/topics': 'topicCuration',
  '/curation/connections': 'connectionValidation',
  '/curation/insights': 'insightReview',
  '/curation/summary': 'curationSummary',
  '/dashboard': 'dashboard',
  '/companion': 'companion',
  '/companion/diff': 'beliefDiffs',
  '/companion/digest': 'digest',
  '/evolution': 'evolution',
  '/connections': 'connections',
  '/search': 'search',
  '/export': 'export',
};

const VIEW_TO_PATH = Object.fromEntries(
  Object.entries(PATH_TO_VIEW).map(([path, view]) => [view, path]),
);

function locationToState(pathname) {
  const convMatch = pathname.match(/^\/topic\/([^/]+)\/conversation\/(\d+)$/);
  if (convMatch) {
    const topic = TOPICS.find(t => t.id === convMatch[1]);
    return topic
      ? { view: 'conversation', selectedTopic: topic, selectedEvent: { topicId: convMatch[1], eventIndex: parseInt(convMatch[2], 10) } }
      : { view: 'dashboard' };
  }

  const topicMatch = pathname.match(/^\/topic\/([^/]+)$/);
  if (topicMatch) {
    const topic = TOPICS.find(t => t.id === topicMatch[1]);
    return topic ? { view: 'timeline', selectedTopic: topic } : { view: 'dashboard' };
  }

  const archMatch = pathname.match(/^\/archaeology\/([^/]+)$/);
  if (archMatch) return { view: 'archaeology', selectedChain: archMatch[1] };

  if (pathname === '/companion/rewind') return { view: 'dashboard', showRewind: true };

  if (pathname.startsWith('/companion/diff/')) return { view: 'beliefDiffs' };
  if (pathname.startsWith('/companion/digest/')) return { view: 'digest' };

  const view = PATH_TO_VIEW[pathname];
  return { view: view || 'dashboard' };
}

function stateToPath({ view, selectedTopic, selectedEvent, selectedChain, showRewind }) {
  if (showRewind) return '/companion/rewind';
  if (view === 'conversation' && selectedEvent)
    return `/topic/${selectedEvent.topicId}/conversation/${selectedEvent.eventIndex}`;
  if (view === 'timeline' && selectedTopic)
    return `/topic/${selectedTopic.id}`;
  if (view === 'archaeology' && selectedChain)
    return `/archaeology/${selectedChain}`;
  return VIEW_TO_PATH[view] || '/dashboard';
}

// ─── Hook ───────────────────────────────────────────────────

export default function useRouterSync() {
  const navigate = useNavigate();
  const location = useLocation();
  const skipNextUrlSync = useRef(false);

  const view = useStore(s => s.view);
  const selectedTopic = useStore(s => s.selectedTopic);
  const selectedEvent = useStore(s => s.selectedEvent);
  const selectedChain = useStore(s => s.selectedChain);
  const showRewind = useStore(s => s.showRewind);

  // Deep-link: sync URL → Zustand before first paint
  useLayoutEffect(() => {
    const state = locationToState(location.pathname);
    const store = useStore.getState();
    if (state.view && state.view !== store.view) store.setView(state.view);
    if (state.selectedTopic) store.setSelectedTopic(state.selectedTopic);
    if (state.selectedEvent) store.setSelectedEvent(state.selectedEvent);
    if (state.selectedChain) store.setSelectedChain(state.selectedChain);
    if (state.showRewind) store.setShowRewind(true);
    skipNextUrlSync.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // State → URL: push history entry when navigation state changes
  useEffect(() => {
    if (skipNextUrlSync.current) {
      skipNextUrlSync.current = false;
      return;
    }
    const expectedPath = stateToPath({ view, selectedTopic, selectedEvent, selectedChain, showRewind });
    if (expectedPath !== location.pathname) {
      navigate(expectedPath);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, selectedTopic?.id, selectedEvent?.topicId, selectedEvent?.eventIndex, selectedChain, showRewind]);

  // URL → State: browser back / forward
  useEffect(() => {
    const store = useStore.getState();
    const currentPath = stateToPath({
      view: store.view,
      selectedTopic: store.selectedTopic,
      selectedEvent: store.selectedEvent,
      selectedChain: store.selectedChain,
      showRewind: store.showRewind,
    });
    if (location.pathname === currentPath) return;

    skipNextUrlSync.current = true;
    const state = locationToState(location.pathname);
    store.setView(state.view || 'dashboard');
    store.setSelectedTopic(state.selectedTopic || null);
    store.setSelectedEvent(state.selectedEvent || null);
    store.setSelectedChain(state.selectedChain || null);
    store.setShowRewind(!!state.showRewind);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
}
