# CLAUDE.md — Atlas AI Project Conventions

## Project Overview
Atlas AI is a React/Vite single-page application for AI conversation knowledge extraction.
It is a **demo**: every figure on screen comes from the fixtures in `src/data/constants.js`,
and there is no backend. `src/main.jsx` is the Vite entry point.

## Source layout

| Path | What lives here |
|---|---|
| `src/App.jsx` | The shell: reads the Zustand store, owns keyboard shortcuts + the sync cascade, and switches between views. Nothing else. |
| `src/views/` | One file per full-screen view (`OnboardingView`, `LoadingView`, the five curation screens, `DashboardView`, `AskAtlas`, `RewindMode`, ...). Each exports a default component. |
| `src/components/` | Shared pieces used by more than one view (`Nav`, `CommandPalette`, `CompanionSidebar`, `GuidedTour`, `StatCard`, badges, sparklines, `ErrorBoundary`). `Nav` is the shell's top bar: three stations (Atlas / Curate / Companion, `STATIONS`), page tabs under the active one, actions on the right. Every routed view maps to a station (`stationFor`, tested). |
| `src/styles/tokens.js` | **The only file allowed to spell a color.** `C.gold`, `alpha(C.red, 0.1)`, `white(0.3)`, `black(0.5)`, the `FONTS` / `BODY` / `MONO` stacks, and the `SPACE` / `TYPE` scales (px). ESLint (`no-restricted-syntax`) fails on a hex or `rgba(` literal anywhere else. |
| `src/styles/shared.js` | Inline-style objects shared across views (`row`, `stack`, `grow`, `screen(mobile)`, `eyebrow`, `display(mobile)`, `title`, `lede`, `body`, `mono`, `track`). Extend with a spread: `{ ...lede(mobile), marginTop: 6 }`. |
| `src/styles/base.js` | The global `CSS` string (keyframes, scrollbar, font import) every view injects via `<style>`; re-exports the font stacks. |
| `src/routes.js` | The route table (`PATH_TO_VIEW`, `DEEP_LINKS`, `SWEEP_ROUTES`), shared by the router hook, the render tests, the sweep and the screenshot baseline. |
| `scripts/sweep.mjs` | Route sweep over a built `dist/` (see Build & Run). |
| `tests/e2e/` | Playwright screenshot baseline of the route table. |
| `src/data/constants.js` | All demo fixtures (`TOPICS`, `CONNECTIONS`, tour steps, companion responses, ...). |
| `src/store.js` | Zustand store: navigation, knowledge-base, sync, curation and companion slices. |
| `src/hooks/` | `useWindowSize`, `useSound`, `useRouterSync` (URL <-> store sync over the table in `src/routes.js`). |

Adding a view: create `src/views/<Name>.jsx`, add its route to `PATH_TO_VIEW` in
`src/routes.js`, wire it into the switch in `App.jsx`, add its case to
`src/views/__tests__/views.test.jsx` (the suite fails without it), and run
`npm run test:e2e:update` to capture its baseline.

## Build & Run
- **Dev server:** `npm run dev`
- **Production build:** `npm run build` (Vite)
- **Lint:** `npm run lint` (ESLint 9 flat config, `eslint.config.js`). Zero errors is the bar; React Compiler lints are warnings.
- **Tests:** `npm run test` (Vitest + jsdom). `src/views/__tests__/views.test.jsx` mounts every view and every route; a view without a case there fails the suite.
- **Screenshots:** `npm run test:e2e` (Playwright, Chromium, web fonts blocked, paused fake clock) diffs every route in `src/routes.js` against `tests/e2e/__screenshots__/desktop/` (1280x900) and, for routes flagged in `MOBILE_ROUTES`, `__screenshots__/mobile/` (390x844). Change a view on purpose → `npm run test:e2e:update` and commit the PNGs.
- **Sweep:** `npm run sweep -- --dist dist --out after.json`, then `npm run sweep -- --compare before.json after.json`: renders every route from a built `dist/` and diffs text + markup between two builds. Use it to prove a refactor changed nothing.
- **All of it:** `npm run check` (lint, test, build). CI runs check + screenshots on every PR (`.github/workflows/ci.yml`).
- **No TypeScript** — plain JSX

## Architecture
- **State:** Cross-view state lives in the Zustand store (`src/store.js`); per-view UI state stays local (`useState`).
- **Styling:** Inline styles throughout. Colors come only from `src/styles/tokens.js`, repeated style objects from `src/styles/shared.js`, keyframes from `src/styles/base.js`. No CSS files, no CSS-in-JS library, no color literals in views.
- **Routing:** React Router, synced to the store's `view` by `useRouterSync`. Views never call the router directly; they call store actions or the callbacks App passes them.
- **Data:** Simulated fixtures in `src/data/constants.js`.

## Conventions
- Components are defined as function components with hooks
- Data constants (TOPICS, CONNECTIONS, INSIGHTS, etc.) are plain JS arrays/objects
- Custom hooks: `useWindowSize`, `useSound`
- Interactive elements use `onClick` handlers on divs (accessibility is being improved)

## Known Patterns to Watch For
- **Timer cleanup:** Every `setTimeout`/`setInterval` inside a component MUST be cleared on unmount. Use a ref to store the timer ID and clear it in `useEffect` cleanup.
- **useEffect dependencies:** Always provide a dependency array. `[]` for mount-only effects. Never suppress `eslint-disable-next-line react-hooks/exhaustive-deps` — fix the deps instead.
- **setState coupling:** Never call `setState` for one piece of state inside the updater function of another. Use `useEffect` to derive dependent state.
- **Error handling:** Never use empty `catch {}` blocks. At minimum: `catch (e) { console.warn('context:', e); }`
- **Accessibility:** Interactive divs need `role="button"`, `tabIndex={0}`, and keyboard event handlers.
- **Shadowed imports:** `no-shadow` is an error. A local `const meta = ...` next to `import { meta } from '../styles/shared'` compiled fine and silently dropped a font from a timeline stamp; the sweep caught it, the lint now catches it first.
- **Screenshot tolerance is an absolute pixel budget** (`maxDiffPixels` in `playwright.config.js`), never a ratio: a ratio of a full page hides a changed word, and `--update-snapshots` then leaves the stale PNG in place because the actual is "within tolerance". If a recapture prints no "re-generated" line, the baseline did not change. A pure color change (an alpha nudged from 0.4 to 0.55) can also fall under Playwright's per-pixel color threshold, so no pixel counts as different at all: delete the affected PNGs and recapture, which prints "writing actual" for each.
- **Stateful screenshots:** a route in `SWEEP_ROUTES` can drive the page with `setup` (click, then `page.clock.runFor(ms).catch(() => page.waitForTimeout(ms))` so it works under the baseline's fake clock and the sweep's real one). If `setup` scrolls, reset with `window.scrollTo(0, 0)`, and hide fixed overlays that are not the subject with `page.addStyleTag({ content: '... { visibility: hidden !important; }' })`; they round differently after a scroll. Not `mask`: the mask box follows the element, lands a pixel off, and fails intermittently (`companion-answer` did, 144-432 pixels, about one run in two). Scroll with `behavior: "smooth"` only when reduced motion is off, or the capture races the compositor.
- **`alpha()` takes hex only.** A style helper that calls `alpha(color, ...)` must be passed a `C.*` token, never `white(0.7)`: an rgba string came out as `rgba(NaN,...)`, which rendered an invisible button twice before `alpha()` started throwing on it in dev and tests (production logs a warning and keeps the color).
- **Never `pkill`/kill-by-name from the agent shell** (`pkill -f "vite preview"` matches the shell's own command line and kills the session, exit 144). Playwright owns its web server; let it start and stop it (`reuseExistingServer: false`).
- **Reduced motion in the baseline is not what the config says.** `reducedMotion: 'reduce'` in `playwright.config.js` does not reach `matchMedia` here (it reads `false`), so views that branch on `prefers-reduced-motion` are captured with motion on. A route that needs the reduced path emulates it in `setup`: `await page.emulateMedia({ reducedMotion: 'reduce' }); await page.reload()` (see `rewind-reduced`).
- **Highlighting inside an accessible name:** wrap only the matched run (`<mark>`) and leave the rest as plain text nodes. A `<span>` holding " Diffs" loses its leading space in the computed name, so a palette option read as "BeliefDiffs" and `getByRole('option', { name: /Belief Diffs/ })` found nothing.
- **Verifying a refactor:** build `main` and the branch, sweep both, compare. Identical markup on every route is the standard for a no-behavior-change PR. Fixture values that vary run to run (a `Math.random()` in render) break that and the screenshot baseline alike; put them in `src/data/constants.js` instead, as `TOPIC_CONFIDENCE` did for `/curation/topics`.

## Self-Update Policy
If Claude encounters an issue during development where having a note in this file would have prevented the problem, Claude should update this file as part of the fix. Examples:
- A new build gotcha discovered during `npm run build`
- A pattern that causes React warnings
- A file/component naming convention that wasn't documented
