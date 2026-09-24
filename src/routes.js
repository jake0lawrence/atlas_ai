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
  '/companion/live': 'liveCapture',
  '/evolution': 'evolution',
  '/connections': 'connections',
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
  { path: '/archaeology/nope', view: 'archaeology', note: 'unknown chain: the designed not-found page' },
  { path: '/companion/rewind', view: 'dashboard', overlay: 'rewind' },
  { path: '/search', view: 'dashboard', overlay: 'search', note: 'not a page: opens the ⌘K palette and hands the URL back' },
  { path: '/nope', view: 'dashboard', note: 'unknown path falls back to the dashboard' },
];

// Everything the sweep and the screenshot baseline visit. `setup` runs in the
// page after load (keyboard shortcuts open the palette / sidebar / brief card).
// `mobile: true` adds the route to the 390-wide baseline; a view's redesign PR
// flags its own route (V7_PLAN.md, principle 7).
const MOBILE_ROUTES = new Set(['/', '/loading', '/curation', '/curation/topics', '/curation/connections', '/curation/insights', '/curation/summary', '/dashboard', '/companion', '/connections', '/evolution', '/export', '/companion/diff', '/companion/digest', '/companion/live', '/topic/courtcollect', '/topic/courtcollect/conversation/4', '/archaeology/why-typescript', '/archaeology/nope', '/search']);
export const SWEEP_ROUTES = [
  ...Object.keys(PATH_TO_VIEW).map(path => ({ path, mobile: MOBILE_ROUTES.has(path) })),
  ...DEEP_LINKS.map(({ path }) => ({ path, mobile: MOBILE_ROUTES.has(path) })),
  // The first-visit guided tour covers the dashboard, so the baseline seeds the
  // "tour seen" flags for every route except this one, which captures the tour.
  { path: '/dashboard', id: 'dashboard-tour', tour: true },
  // Ask Atlas with an answer on screen and its second citation opened.
  // The fixed companion tab is not the subject and rounds a pixel differently
  // after the scroll, so it is hidden here (a `mask` follows the same box and
  // flickers with it). Every other route still captures that tab.
  { path: '/companion', id: 'companion-answer', setup: async (page) => {
    await page.addStyleTag({ content: '[title^="Open companion"] { visibility: hidden !important; }' });
    await page.getByRole('button', { name: /current thinking on serverless/ }).click();
    await page.clock.runFor(1600).catch(() => page.waitForTimeout(1600)); // fake clock in the baseline, real in the sweep
    await page.getByRole('button', { name: 'Source 2' }).click();
    await page.clock.runFor(100).catch(() => page.waitForTimeout(100));
    // The citation scrolls its source into view; reset so fixed elements
    // (the companion tab) sit in the same place in every full-page capture.
    await page.evaluate(() => window.scrollTo(0, 0));
  } },
  // The review queue mid-run: one decision made, the move picker open.
  { path: '/curation', id: 'curation-move', setup: async (page) => {
    await page.getByRole('button', { name: /Approve/ }).click();
    await page.getByRole('button', { name: /Move/ }).click();
  } },
  // Topic curation after a suggested merge, with a card's color picker open.
  { path: '/curation/topics', id: 'curation-topics-edit', setup: async (page) => {
    await page.getByRole('region', { name: /Atlas suggests/ }).getByRole('button', { name: 'Merge', exact: true }).first().click();
    await page.getByRole('article', { name: 'Keymaster' }).getByRole('button', { name: 'Color' }).click();
  } },
  // Connections mid-review: one confirmed, one rejected, the relabel form open.
  { path: '/curation/connections', id: 'curation-connections-mid', setup: async (page) => {
    await page.getByRole('button', { name: /Confirm$/ }).click();
    await page.getByRole('button', { name: /Reject$/ }).click();
    await page.getByRole('button', { name: /Relabel$/ }).click();
  } },
  // Insight review: the first kept, the next one's past perspective open.
  { path: '/curation/insights', id: 'curation-insights-past', setup: async (page) => {
    await page.getByRole('button', { name: /It happened/ }).click();
    await page.getByRole('button', { name: /What did past-you decide/ }).click();
  } },
  // The whole curation run, finished with a few decisions in each step, so the
  // summary shows recorded results rather than the untouched fixtures.
  { path: '/curation', id: 'curation-summary-run', mobile: true, setup: async (page) => {
    await page.getByRole('button', { name: /Approve/ }).click();
    await page.getByRole('button', { name: /Continue to topics/ }).click();
    await page.getByRole('region', { name: /Atlas suggests/ }).getByRole('button', { name: 'Merge', exact: true }).first().click();
    await page.getByRole('button', { name: /Next: check connections/ }).click();
    await page.getByRole('button', { name: /Confirm$/ }).click();
    await page.getByRole('button', { name: /Reject$/ }).click();
    await page.getByRole('button', { name: /Continue to insights/ }).click();
    await page.getByRole('button', { name: /It happened/ }).click();
    await page.getByRole('button', { name: /Continue to the summary/ }).click();
    await page.getByRole('heading', { name: /Where the run/ }).waitFor();
  } },
  // Evolution with an earlier phase selected and a pivot open, its note form out.
  { path: '/evolution', id: 'evolution-pivot', mobile: true, setup: async (page) => {
    await page.getByRole('button', { name: /^The Builder,/ }).click();
    const card = page.getByRole('article', { name: /^From 'automate everything'/ });
    await card.getByRole('button').first().click();
    await card.getByRole('button', { name: 'Add a note' }).click();
  } },
  // Connections with one topic selected: its links lit, its panel open.
  { path: '/connections', id: 'connections-topic', mobile: true, setup: async (page) => {
    await page.getByRole('button', { name: /^Job Search: / }).click();
  } },
  // Belief diffs on another subject, showing what you believed then.
  { path: '/companion/diff', id: 'belief-diffs-then', mobile: true, setup: async (page) => {
    await page.getByRole('button', { name: /Automation Philosophy/ }).click();
    await page.getByRole('button', { name: 'Then', exact: true }).click();
  } },
  // The digest's in-progress month: outlined bar, no theme yet.
  { path: '/companion/digest', id: 'digest-in-progress', mobile: true, setup: async (page) => {
    await page.getByRole('button', { name: /still being written/ }).click();
  } },
  // A decision chain with one step picked on the arc, its card highlighted.
  { path: '/archaeology/why-vercel', id: 'archaeology-step', mobile: true, setup: async (page) => {
    await page.getByRole('button', { name: /^Challenging, / }).click();
    await page.clock.runFor(100).catch(() => page.waitForTimeout(100));
    await page.evaluate(() => window.scrollTo(0, 0));
  } },
  // Export with the CSV preview: the generated file, first lines shown.
  { path: '/export', id: 'export-csv', mobile: true, setup: async (page) => {
    await page.getByRole('button', { name: /CSV/ }).click();
  } },
  // A shared search: /search?q= opens the palette with the query typed.
  { path: '/search?q=docker', id: 'search-docker', mobile: true },
  { path: '/dashboard', id: 'dashboard-palette', setup: async (page) => { await page.keyboard.press('Control+k'); } },
  { path: '/dashboard', id: 'dashboard-sidebar', setup: async (page) => { await page.keyboard.press('Control+/'); } },
];
