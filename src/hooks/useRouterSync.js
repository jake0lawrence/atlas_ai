import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useStore from '../store';
import { TOPICS } from '../data/constants';
import { PATH_TO_VIEW, VIEW_TO_PATH } from '../routes';

// ─── Route Mapping ──────────────────────────────────────────

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

  // The path the store currently describes. Pure, so it is derived in render;
  // the State → URL effect below keys on it instead of on the five state
  // fields it is built from.
  const expectedPath = stateToPath({ view, selectedTopic, selectedEvent, selectedChain, showRewind });

  // The latest location and navigate, readable from mount-only effects
  // without listing them as dependencies (they change on every navigation,
  // which is exactly when those effects must not re-run).
  const locationRef = useRef(location.pathname);
  const navigateRef = useRef(navigate);
  useEffect(() => {
    locationRef.current = location.pathname;
    navigateRef.current = navigate;
  }, [location.pathname, navigate]);

  // Deep-link: sync URL → Zustand before first paint
  useLayoutEffect(() => {
    const state = locationToState(locationRef.current);
    const store = useStore.getState();
    if (state.view && state.view !== store.view) store.setView(state.view);
    if (state.selectedTopic) store.setSelectedTopic(state.selectedTopic);
    if (state.selectedEvent) store.setSelectedEvent(state.selectedEvent);
    if (state.selectedChain) store.setSelectedChain(state.selectedChain);
    if (state.showRewind) store.setShowRewind(true);
    skipNextUrlSync.current = true;
  }, []);

  // State → URL: push a history entry when the store's path changes
  useEffect(() => {
    if (skipNextUrlSync.current) {
      skipNextUrlSync.current = false;
      return;
    }
    if (expectedPath !== locationRef.current) {
      navigateRef.current(expectedPath);
    }
  }, [expectedPath]);

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
  }, [location.pathname]);
}
