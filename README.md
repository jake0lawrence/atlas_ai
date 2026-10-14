# 🧠 Atlas

**Your mind, mapped.** Atlas turns two years of ChatGPT and Claude conversations into the topics you keep returning to, the decisions you made, and the connections between them.

**Live demo: [jakelawrence.xyz/atlas](https://www.jakelawrence.xyz/atlas/)**

This is an interactive demo. Every figure on screen comes from fixtures in `src/data/constants.js`; there is no backend. Names show as typed stand-ins ("Employer A", "Person 1") until you switch privacy mode off with ◐ in the header or Alt+Shift+P.

## Quick start

```bash
npm ci
npm run dev       # http://localhost:5173/atlas/
npm run check     # lint, unit/render tests, build
npm run test:e2e  # screenshot baseline (Playwright)
```

## Deploy

The repo is the Vercel project `atlas-ai`. Every merge to `main` deploys to production; pull requests get preview deploys, which stay behind Vercel Authentication.

- The app is built for the sub-path `/atlas/` (`base` in `vite.config.js`, `BASE_PATH` in `src/routes.js` as the router's basename). jakelawrence.xyz rewrites `/atlas/*` to this project's production alias, so the browser only ever sees jakelawrence.xyz.
- `vercel.json` maps `/atlas/assets/*`, the public files and `/atlas/api/*` onto the build, sends every other `/atlas/*` path to `index.html` (deep links like `/atlas/topic/courtcollect` load directly), and redirects `/` to `/atlas/`.
- `api/mcp.js` serves the read-only MCP tools at `/atlas/api/mcp` (stateless Streamable HTTP, no auth). Production sets `ATLAS_PRIVACY=on`, so the endpoint always answers with stand-ins; `ATLAS_PUBLIC_URL` (`https://www.jakelawrence.xyz/atlas`) is the base for result links. Check it with `node research/v8-mcp/read-smoke.mjs https://www.jakelawrence.xyz/atlas/api/mcp`.

## Stack

React 18, Vite, Zustand, React Router, inline styles over `src/styles/tokens.js`. Vitest with jsdom, Playwright for screenshots, ESLint 9. Conventions and the source map are in `CLAUDE.md`; plans by version are in `V*_PLAN.md`.
