import { defineConfig, devices } from '@playwright/test';

// Screenshot baseline of the route table (tests/e2e/routes.spec.js).
// Baselines are captured on Linux Chromium (the CI runner); on another OS run
// `npx playwright test --update-snapshots` once and expect font differences.
export default defineConfig({
  testDir: 'tests/e2e',
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    // Not a top-level `use` option in this Playwright version: there it is
    // silently ignored and matchMedia reads false. It has to go through
    // contextOptions to reach the page.
    contextOptions: { reducedMotion: 'reduce' },
    ...devices['Desktop Chrome'],
    viewport: { width: 1280, height: 900 },
  },
  expect: {
    // An absolute budget, not a ratio: 0.002 of a 1280x900 page is ~2,300 px,
    // enough for a whole word to change unseen (it did: "Parse" vs "Pars").
    toHaveScreenshot: { maxDiffPixels: 40, animations: 'disabled', caret: 'hide' },
  },
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    // Always build fresh: reusing a server that outlived a previous run once
    // captured a baseline from a stale bundle.
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } },
    // Phone-width baseline for the routes flagged `mobile` in src/routes.js.
    { name: 'mobile', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 } },
  ],
});
