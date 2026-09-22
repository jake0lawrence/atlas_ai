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
  { path: '/topic/courtcollect/conversation/4', view: 'conversation' },
  { path: '/topic/courtcollect/conversation/0', view: 'conversation', note: 'event without a transcript: the summary-only page' },
  { path: '/archaeology/why-typescript', view: 'archaeology' },
  { path: '/companion/rewind', view: 'dashboard', overlay: 'rewind' },
  { path: '/nope', view: 'dashboard', note: 'unknown path falls back to the dashboard' },
];

// Everything the sweep and the screenshot baseline visit. `setup` runs in the
// page after load (keyboard shortcuts open the palette / sidebar / brief card).
// `mobile: true` adds the route to the 390-wide baseline; a view's redesign PR
// flags its own route (V7_PLAN.md, principle 7).
const MOBILE_ROUTES = new Set(['/', '/loading', '/dashboard', '/companion', '/connections', '/companion/diff', '/topic/courtcollect', '/topic/courtcollect/conversation/4']);
export const SWEEP_ROUTES = [
  ...Object.keys(PATH_TO_VIEW).map(path => ({ path, mobile: MOBILE_ROUTES.has(path) })),
  ...DEEP_LINKS.map(({ path }) => ({ path, mobile: MOBILE_ROUTES.has(path) })),
  // The first-visit guided tour covers the dashboard, so the baseline seeds the
  // "tour seen" flags for every route except this one, which captures the tour.
  { path: '/dashboard', id: 'dashboard-tour', tour: true },
  // Ask Atlas with an answer on screen and its second citation opened.
  // `mask` hides elements that are not the subject of the shot and move with
  // the scroll offset (the fixed companion tab rounds differently after a
  // scroll). Every other route still captures that tab.
  { path: '/companion', id: 'companion-answer', mask: ['[title^="Open companion"]'], setup: async (page) => {
    await page.getByRole('button', { name: /current thinking on serverless/ }).click();
    await page.clock.runFor(1600).catch(() => page.waitForTimeout(1600)); // fake clock in the baseline, real in the sweep
    await page.getByRole('button', { name: 'Source 2' }).click();
    await page.clock.runFor(100).catch(() => page.waitForTimeout(100));
    // The citation scrolls its source into view; reset so fixed elements
    // (the companion tab) sit in the same place in every full-page capture.
    await page.evaluate(() => window.scrollTo(0, 0));
  } },
  { path: '/dashboard', id: 'dashboard-palette', setup: async (page) => { await page.keyboard.press('Control+k'); } },
  { path: '/dashboard', id: 'dashboard-sidebar', setup: async (page) => { await page.keyboard.press('Control+/'); } },
];
