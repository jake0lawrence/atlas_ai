# 🧠 Atlas

**Your mind, mapped.** Atlas turns two years of ChatGPT and Claude conversations into the topics you keep returning to, the decisions you made, and the connections between them.

**Live demo: [atlas.jakelawrence.xyz](https://atlas.jakelawrence.xyz)**

This is an interactive demo. Every figure on screen comes from fixtures in `src/data/constants.js`; there is no backend. Names show as typed stand-ins ("Employer A", "Person 1") until you switch privacy mode off with ◐ in the header or Alt+Shift+P.

## Quick start

```bash
npm ci
npm run dev       # http://localhost:5173
npm run check     # lint, unit/render tests, build
npm run test:e2e  # screenshot baseline (Playwright)
```

## Deploy

The repo is the Vercel project `atlas-ai`. Every merge to `main` deploys to production at atlas.jakelawrence.xyz; pull requests get preview deploys, which stay behind Vercel Authentication.

- `vercel.json` rewrites every path except `/api/*` to `index.html`, so deep links like `/topic/courtcollect` load directly.
- `api/mcp.js` serves the read-only MCP tools at `/api/mcp` (stateless Streamable HTTP, no auth). Production sets `ATLAS_PRIVACY=on`, so the endpoint always answers with stand-ins; `ATLAS_PUBLIC_URL` sets the base for result links. Check it with `node research/v8-mcp/read-smoke.mjs https://atlas.jakelawrence.xyz/api/mcp`.

## Stack

React 18, Vite, Zustand, React Router, inline styles over `src/styles/tokens.js`. Vitest with jsdom, Playwright for screenshots, ESLint 9. Conventions and the source map are in `CLAUDE.md`; plans by version are in `V*_PLAN.md`.
