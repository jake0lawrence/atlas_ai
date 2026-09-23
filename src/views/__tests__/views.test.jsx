// Render smoke test: one case per view, one per route.
//
// A view "passes" when it mounts against the fixtures without throwing and
// without React logging an error, and paints something. A route passes when
// mounting the whole App at that URL lands the store on the expected view.
// This is the floor the redesign PRs stand on; per-view behavior tests go in
// their own files next to the view.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { TOPICS } from '../../data/constants';
import { PATH_TO_VIEW, DEEP_LINKS } from '../../routes';
import useStore from '../../store';
import App from '../../App';

import OnboardingView from '../OnboardingView';
import LoadingView from '../LoadingView';
import ReviewQueue from '../ReviewQueue';
import TopicCurationPanel from '../TopicCurationPanel';
import ConnectionValidation from '../ConnectionValidation';
import InsightDecisionReview from '../InsightDecisionReview';
import CurationSummary from '../CurationSummary';
import DashboardView from '../DashboardView';
import TimelineView from '../TimelineView';
import ConversationDrilldown from '../ConversationDrilldown';
import AskAtlas from '../AskAtlas';
import BeliefDiffsView from '../BeliefDiffsView';
import DigestView from '../DigestView';
import LiveCaptureView from '../LiveCaptureView';
import DecisionArchaeology from '../DecisionArchaeology';
import RewindMode from '../RewindMode';
import EvolutionView from '../EvolutionView';
import ConnectionsView from '../ConnectionsView';
import SearchView from '../SearchView';
import ExportPreview from '../ExportPreview';

const noop = () => {};
const topic = TOPICS[0];
const base = { mobile: false, tablet: false, w: 1280 };

// Every full-screen view with the smallest prop set that renders it.
const VIEWS = [
  ['OnboardingView', OnboardingView, { onStart: noop }],
  ['LoadingView', LoadingView, { onComplete: noop }],
  ['ReviewQueue', ReviewQueue, { onComplete: noop }],
  ['TopicCurationPanel', TopicCurationPanel, { onComplete: noop }],
  ['ConnectionValidation', ConnectionValidation, { onComplete: noop }],
  ['InsightDecisionReview', InsightDecisionReview, { onComplete: noop }],
  ['CurationSummary', CurationSummary, { onComplete: noop }],
  ['DashboardView', DashboardView, { totalConvos: 3847, totalWords: 2_000_000, maxCount: 156, onTopicClick: noop, onBriefMe: noop, recentlySynced: [], onRewind: noop }],
  ['TimelineView', TimelineView, { topic, onBack: noop, onEventClick: noop, newEvents: {} }],
  ['ConversationDrilldown', ConversationDrilldown, { topicId: topic.id, eventIndex: 4, onBack: noop }],
  ['AskAtlas', AskAtlas, { onBack: noop, onConversationClick: noop, onResolveContradiction: noop }],
  ['BeliefDiffsView', BeliefDiffsView, { onBack: noop, onArchaeologyClick: noop }],
  ['DigestView', DigestView, { onBack: noop, onArchaeologyClick: noop }],
  ['LiveCaptureView', LiveCaptureView, { onTopicClick: noop }],
  ['DecisionArchaeology', DecisionArchaeology, { chainId: 'why-typescript', onBack: noop, onConversationClick: noop }],
  ['RewindMode', RewindMode, { onClose: noop }],
  ['EvolutionView', EvolutionView, { onRewind: noop }],
  ['ConnectionsView', ConnectionsView, { onTopicClick: noop }],
  ['SearchView', SearchView, {}],
  ['ExportPreview', ExportPreview, {}],
];

const initialStore = useStore.getState();
let consoleError;

beforeEach(() => {
  useStore.setState(initialStore, true);
  localStorage.clear();
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  consoleError.mockRestore();
});

function reactErrors() {
  // Timer-driven state updates after the assertion are expected in a smoke
  // test; anything else React logs (keys, invalid DOM nesting, throws) fails.
  return consoleError.mock.calls
    .map(args => String(args[0]))
    .filter(msg => !msg.includes('not wrapped in act'));
}

describe('views render against the fixtures', () => {
  it.each(VIEWS)('%s', (_name, View, props) => {
    const { container } = render(<View {...base} {...props} />);
    expect(container.textContent.trim().length).toBeGreaterThan(0);
    expect(reactErrors()).toEqual([]);
  });

  it('every view in src/views has a case here', async () => {
    const files = Object.keys(import.meta.glob('../*.jsx'));
    const named = new Set(VIEWS.map(([name]) => name));
    const missing = files.map(f => f.replace('../', '').replace('.jsx', '')).filter(n => !named.has(n));
    expect(missing).toEqual([]);
  });
});

describe('routes mount the App on the right view', () => {
  const routes = [
    ...Object.entries(PATH_TO_VIEW).map(([path, view]) => [path, view]),
    ...DEEP_LINKS.map(({ path, view }) => [path, view]),
  ];

  it.each(routes)('%s -> %s', (path, view) => {
    const { container } = render(
      <MemoryRouter initialEntries={[path]}><App /></MemoryRouter>,
    );
    expect(useStore.getState().view).toBe(view);
    expect(container.textContent.trim().length).toBeGreaterThan(0);
    expect(reactErrors()).toEqual([]);
  });

  it('/companion/rewind opens the rewind overlay on the dashboard', () => {
    render(<MemoryRouter initialEntries={['/companion/rewind']}><App /></MemoryRouter>);
    expect(useStore.getState().showRewind).toBe(true);
  });
});
