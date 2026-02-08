# CLAUDE.md — Atlas AI Project Conventions

## Project Overview
Atlas AI is a React/Vite single-page application for AI conversation knowledge extraction.
All application code currently lives in `src/App.jsx` (~7,100 lines). `src/main.jsx` is the Vite entry point.

## Build & Run
- **Dev server:** `npm run dev`
- **Production build:** `npm run build` (Vite)
- **No tests** — no test framework is installed
- **No linter** — no ESLint/Prettier config
- **No TypeScript** — plain JSX

## Architecture
- **State:** All state is local (`useState`). No state management library.
- **Styling:** Inline styles throughout. No CSS files, no CSS-in-JS library.
- **Routing:** Custom view-switching via state variable (`currentView`). No router library.
- **Data:** Simulated/hardcoded data constants defined at the top of App.jsx.

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
