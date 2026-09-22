// The route table, shared by the router hook, the render tests, the sweep
// script and the Playwright screenshot baseline. Change it here only.

export const PATH_TO_VIEW = {
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

// The information architecture (principle 5): three stations, and which view
// lives under which. The Nav renders this; nothing else hard-codes the tabs.
// Curate has no sub-views in the shell because the curation run is a
// full-screen flow; its station button starts the run. Search is ⌘K and
// Export is a header action, so neither is a station.
export const STATIONS = [
  { id: 'curate', label: 'Curate', icon: '◇', hint: 'Review what the AI proposed', view: 'curation', tour: 'curate-tab',
    views: ['curation', 'topicCuration', 'connectionValidation', 'insightReview', 'curationSummary'], tabs: [] },
  { id: 'atlas', label: 'Atlas', icon: '◈', hint: 'Your knowledge, mapped', view: 'dashboard', tour: 'atlas-tab',
    views: ['dashboard', 'connections', 'evolution', 'timeline', 'conversation'],
    tabs: [
      { view: 'dashboard', label: 'Overview' },
      { view: 'connections', label: 'Connections' },
      { view: 'evolution', label: 'Evolution' },
    ] },
  { id: 'companion', label: 'Companion', icon: '◆', hint: 'Ask, diff, digest', view: 'companion', tour: 'companion-tab',
    views: ['companion', 'beliefDiffs', 'digest', 'archaeology'],
    tabs: [
      { view: 'companion', label: 'Ask Atlas' },
      { view: 'beliefDiffs', label: 'Belief Diffs', tour: 'belief-diffs-tab' },
      { view: 'digest', label: 'Digest', tour: 'digest-tab' },
    ] },
];

/** The station a view belongs to, or null for the utility views (search, export) and the front door. */
export const stationFor = (view) => STATIONS.find(s => s.views.includes(view)) || null;

export const VIEW_TO_PATH = Object.fromEntries(
  Object.entries(PATH_TO_VIEW).map(([path, view]) => [view, path]),
);

// Parameterized deep links, with one concrete example of each that resolves
// against the fixtures, plus the overlays the dashboard can open.
export const DEEP_LINKS = [
  { path: '/topic/courtcollect', view: 'timeline' },
  { path: '/topic/courtcollect/conversation/4', view: 'conversation' }, // event 4 has a preview; events without one render nothing
  { path: '/archaeology/why-typescript', view: 'archaeology' },
  { path: '/companion/rewind', view: 'dashboard', overlay: 'rewind' },
  { path: '/nope', view: 'dashboard', note: 'unknown path falls back to the dashboard' },
];

// Everything the sweep and the screenshot baseline visit. `setup` runs in the
// page after load (keyboard shortcuts open the palette / sidebar / brief card).
export const SWEEP_ROUTES = [
  ...Object.keys(PATH_TO_VIEW).map(path => ({ path })),
  ...DEEP_LINKS.map(({ path }) => ({ path })),
  { path: '/dashboard', id: 'dashboard-palette', setup: async (page) => { await page.keyboard.press('Control+k'); } },
  { path: '/dashboard', id: 'dashboard-sidebar', setup: async (page) => { await page.keyboard.press('Control+/'); } },
];
