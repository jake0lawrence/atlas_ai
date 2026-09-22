// Screenshot baseline of the route table. Grown from scripts/sweep.mjs: same
// routes, same viewport, same font blocking, but the oracle is a pixel diff
// against tests/e2e/__screenshots__ instead of a markup diff between builds.
//
// Update on purpose: `npx playwright test --update-snapshots`, then review the
// changed PNGs in the PR like any other diff.
import { test, expect } from '@playwright/test';
import { SWEEP_ROUTES } from '../../src/routes.js';

// Every view is time-driven somewhere (stat counters, the loading pipeline,
// staggered reveals). The page runs on a paused fake clock that is advanced by
// a fixed amount after load, so every capture sees the same instant.
const SETTLE_MS = 2500; // the dashboard stat counters finish by ~2.2s
const FROZEN_AT = new Date('2026-02-14T15:00:00Z');

// Seeded PRNG so views that call Math.random() (TopicCurationPanel's confidence
// values) render the same way every run. mulberry32, seed 42.
const SEED_RANDOM = `(() => { let a = 42; Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();`;

test.beforeEach(async ({ page }) => {
  // Web fonts come from Google; block them so the baseline is the same with
  // or without network, and so it does not change when Google reships a font.
  await page.route(/fonts\.g(oogleapis|static)\.com/, r => r.abort());
  await page.addInitScript(SEED_RANDOM);
  await page.clock.install({ time: FROZEN_AT });
  await page.clock.pauseAt(FROZEN_AT);
});

for (const route of SWEEP_ROUTES) {
  const id = route.id || route.path;
  const name = id === '/' ? 'root' : id.replace(/^\//, '').replace(/\//g, '--');

  test(`${id} matches its baseline`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile' && !route.mobile, 'not in the mobile baseline yet');
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !/^Failed to load resource/.test(m.text())) errors.push(m.text()); });

    await page.goto(route.path, { waitUntil: 'networkidle' });
    if (route.setup) await route.setup(page);
    await page.clock.runFor(SETTLE_MS);

    expect(errors, 'no page or console errors').toEqual([]);
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
  });
}
