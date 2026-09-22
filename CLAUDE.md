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
| `src/components/` | Shared pieces used by more than one view (`Nav`, `CommandPalette`, `CompanionSidebar`, `GuidedTour`, `StatCard`, badges, sparklines, `ErrorBoundary`). |
| `src/styles/base.js` | `FONTS` / `BODY` / `MONO` font stacks and the global `CSS` string every view injects via `<style>`. The token module of the restructure lands here. |
| `src/data/constants.js` | All demo fixtures (`TOPICS`, `CONNECTIONS`, tour steps, companion responses, ...). |
| `src/store.js` | Zustand store: navigation, knowledge-base, sync, curation and companion slices. |
| `src/hooks/` | `useWindowSize`, `useSound`, `useRouterSync` (URL <-> store view mapping; the route table lives there). |

Adding a view: create `src/views/<Name>.jsx`, add its route to `PATH_TO_VIEW` in
`src/hooks/useRouterSync.js`, and wire it into the switch in `App.jsx`.

## Build & Run
- **Dev server:** `npm run dev`
- **Production build:** `npm run build` (Vite)
- **No tests** — no test framework is installed
- **No linter** — no ESLint/Prettier config
- **No TypeScript** — plain JSX

## Architecture
- **State:** Cross-view state lives in the Zustand store (`src/store.js`); per-view UI state stays local (`useState`).
- **Styling:** Inline styles throughout, with the shared font stacks + global stylesheet in `src/styles/base.js`. No CSS files, no CSS-in-JS library.
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

## Self-Update Policy
If Claude encounters an issue during development where having a note in this file would have prevented the problem, Claude should update this file as part of the fix. Examples:
- A new build gotcha discovered during `npm run build`
- A pattern that causes React warnings
- A file/component naming convention that wasn't documented
