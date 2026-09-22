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
