import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useStore from '../store';
import { TOPICS } from '../data/constants';
import { PATH_TO_VIEW, VIEW_TO_PATH } from '../routes';
import { privatePath, realPath } from '../privacy';

// ─── Route Mapping ──────────────────────────────────────────

// Privacy mode (#86) shows topics by their stand-ins in the address bar too
// (/topic/employer-a); either spelling opens the topic.
function locationToState(shownPath) {
  const pathname = realPath(shownPath);
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

  // Not a page: the ⌘K palette opens over the current view (the dashboard on
  // a fresh load) and the URL is handed back to that view.
  if (pathname === '/search') return { view: 'dashboard', search: true };

  if (pathname.startsWith('/companion/diff/')) return { view: 'beliefDiffs' };
  if (pathname.startsWith('/companion/digest/')) return { view: 'digest' };

  const view = PATH_TO_VIEW[pathname];
  return { view: view || 'dashboard' };
}

const stateToPath = (state, privacy) => (privacy ? privatePath(realStateToPath(state)) : realStateToPath(state));

function realStateToPath({ view, selectedTopic, selectedEvent, selectedChain, showRewind }) {
  if (showRewind) return '/companion/rewind';
  if (view === 'conversation' && selectedEvent)
    return `/topic/${selectedEvent.topicId}/conversation/${selectedEvent.eventIndex}`;
  if (view === 'timeline' && selectedTopic)
    return `/topic/${selectedTopic.id}`;
  if (view === 'archaeology' && selectedChain)
    return `/archaeology/${selectedChain}`;
  return VIEW_TO_PATH[view] || '/dashboard';
}

const queryOf = (search) => new URLSearchParams(search).get('q') || '';

// ─── Hook ───────────────────────────────────────────────────

export default function useRouterSync() {
  const navigate = useNavigate();
  const location = useLocation();
  const skipNextUrlSync = useRef(false);
  // Latest router values, readable from effects without being dependencies:
  // the mount effect wants the first location only, and the state->URL effect
  // must run on state changes, not on every location change.
  const routerRef = useRef({ navigate, location });
  useLayoutEffect(() => { routerRef.current = { navigate, location }; }, [navigate, location]);

  const view = useStore(s => s.view);
  const selectedTopic = useStore(s => s.selectedTopic);
  const selectedEvent = useStore(s => s.selectedEvent);
  const selectedChain = useStore(s => s.selectedChain);
  const showRewind = useStore(s => s.showRewind);
  const privacy = useStore(s => s.privacy);
  const topicId = selectedTopic?.id;
  const eventTopicId = selectedEvent?.topicId;
  const eventIndex = selectedEvent?.eventIndex;

  // Deep-link: sync URL -> Zustand before first paint
  useLayoutEffect(() => {
    const state = locationToState(routerRef.current.location.pathname);
    const store = useStore.getState();
    if (state.view && state.view !== store.view) store.setView(state.view);
    if (state.selectedTopic) store.setSelectedTopic(state.selectedTopic);
    if (state.selectedEvent) store.setSelectedEvent(state.selectedEvent);
    if (state.selectedChain) store.setSelectedChain(state.selectedChain);
    if (state.showRewind) store.setShowRewind(true);
    if (state.search) store.openSearch(queryOf(routerRef.current.location.search));
    skipNextUrlSync.current = true;
  }, []);

  // A real name typed or bookmarked while privacy mode is on: respell it.
  // Not in the layout effect above, which runs before the router listens.
  useEffect(() => {
    const { pathname, search } = routerRef.current.location;
    const shown = privatePath(realPath(pathname));
    if (useStore.getState().privacy && shown !== pathname) routerRef.current.navigate(shown + search, { replace: true });
  }, []);

  // State -> URL: push a history entry when navigation state changes. Turning
  // privacy mode on or off respells the same page, so it replaces the entry.
  // (Entries already in the history keep the spelling they were made with.)
  const lastPrivacy = useRef(privacy);
  useEffect(() => {
    const respelled = lastPrivacy.current !== privacy;
    lastPrivacy.current = privacy;
    if (skipNextUrlSync.current) {
      skipNextUrlSync.current = false;
      return;
    }
    const store = useStore.getState();
    const expectedPath = stateToPath({
      view, selectedTopic: store.selectedTopic, selectedEvent: store.selectedEvent, selectedChain, showRewind,
    }, privacy);
    const { navigate: go, location: loc } = routerRef.current;
    if (expectedPath !== loc.pathname) go(expectedPath, { replace: respelled });
  }, [view, topicId, eventTopicId, eventIndex, selectedChain, showRewind, privacy]);

  // URL -> State: browser back / forward
  useEffect(() => {
    const store = useStore.getState();
    const currentPath = stateToPath({
      view: store.view,
      selectedTopic: store.selectedTopic,
      selectedEvent: store.selectedEvent,
      selectedChain: store.selectedChain,
      showRewind: store.showRewind,
    }, store.privacy);
    if (location.pathname === currentPath) return;

    const state = locationToState(location.pathname);
    if (state.search) {
      store.openSearch(queryOf(routerRef.current.location.search));
      routerRef.current.navigate(currentPath, { replace: true });
      return;
    }
    skipNextUrlSync.current = true;
    store.setView(state.view || 'dashboard');
    store.setSelectedTopic(state.selectedTopic || null);
    store.setSelectedEvent(state.selectedEvent || null);
    store.setSelectedChain(state.selectedChain || null);
    store.setShowRewind(!!state.showRewind);
  }, [location.pathname]);
}
