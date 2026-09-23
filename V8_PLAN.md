# ATLAS v8 — Atlas as an MCP server (proposal)

Status: **proposal, not started.** v7 is the visual redesign and keeps Atlas a demo
(V7_PLAN.md, Step 0). This document is the case for what comes after, written down so
the decision is made on purpose rather than drifted into.

## The friction

Atlas today starts with a chore: request a data export from ChatGPT, wait for the
email, download the archive, do the same for Claude, then drop both files on the
onboarding screen. Most people will not do that twice, and nothing they talk about
after that day ever reaches Atlas. The atlas goes stale the moment it is built.

## What MCP fixes, and what it does not

An MCP server gives a model tools it can call during a conversation. It does not give
Atlas a way to read your chat history. So:

| Need | MCP helps? | Why |
|---|---|---|
| Years of past conversations | **No** | Only the providers' data exports reach history. Backfill stays a one-time import. |
| Conversations from today on | **Yes** | A capture tool the model calls ("save this to Atlas") files them as you go. No more exports. |
| Asking Atlas while you work | **Yes, and this is the bigger win** | Read tools let Claude answer "what did I decide about serverless last fall?" mid-chat, with Atlas as the source. That is the Companion station, without leaving the chat. |
| Capturing every conversation silently | **Only partly** | The model decides when to call a tool. Server instructions can ask it to capture substantive conversations, but it is best effort, not a guarantee. |

So the shape is: **import once, then MCP for everything after.** The export stops being
the price of admission and becomes an optional backfill.

## What it changes in the product

1. **The curation run becomes the inbox.** Nothing a model writes lands in the atlas
   directly. Captures arrive as pending items and go through the same screens v7 is
   building now: Review (classification), Topics, Connections, Insights (decisions,
   pivots, milestones), Summary. Those screens stop being a one-time wizard and become
   the place you check what Claude filed this week. v7's reducers, undo and "keep the
   N waiting" already fit that job.
2. **Onboarding gets three doors** instead of one: connect Claude (start empty, fill as
   you go), import exports (backfill), or the demo persona (today's default).
3. **The Companion station works in two places**: in Atlas, and inside any MCP client
   through the read tools. The Ask Atlas answer format (claims with numbered sources)
   carries over as the tool's output.

## Architecture

- **Local first.** Conversation history is the most personal data a person has. The
  default runs on the user's machine: a small Node process with a SQLite file, serving
  the MCP server over stdio (for Claude Desktop and Claude Code) and a local HTTP API
  that the Vite app reads instead of `src/data/constants.js`. A hosted version (Postgres
  plus auth, Streamable HTTP transport) comes later, if ever, and is its own decision.
- **Plain JS**, per CLAUDE.md, on the official MCP SDK.
- **The fixtures become seed data.** The first storage PR loads today's fixtures into
  SQLite and serves them back unchanged, so the sweep can prove the app renders
  identically before anything real flows through it.
- **Enrichment is the expensive part.** The demo fakes topic classification, entity
  extraction and decision detection. For real, each captured or imported conversation
  needs a model pass. That is an API key, a cost per conversation, and a queue; the
  loading screen's five stages (Parse, Normalize, Enrich, Connect, Build) are already
  the right progress model for it.

### Tools

Read tools (annotated read-only):

| Tool | Returns |
|---|---|
| `atlas_search(query, topic?, since?)` | Matching conversations, decisions and insights, each with a source reference |
| `atlas_topic(id)` | A topic's summary, timeline and connections |
| `atlas_decisions(topic?, since?)` | The decision log, with pivots and milestones |
| `atlas_drift()` | Open contradictions between past decisions and recent conversations |

Write tools (never destructive, always pending until curated):

| Tool | Does |
|---|---|
| `atlas_capture(title, summary, excerpt?, topic_hint?)` | Files the current conversation for review |
| `atlas_log_decision(text, topic_hint?, date?)` | Proposes a decision, pivot or milestone |

No delete tool, no tool that edits curated data. A resource per topic
(`atlas://topic/{id}`) and one for the weekly digest let clients attach context
without a tool call.

## Sequence

Same rules as v7: one reviewable change per PR, the safety net proves each one.

| # | PR | Done when |
|---|---|---|
| 0 | Decision: Atlas becomes a product, local first | Owner signs off on this document |
| 1 | Storage: SQLite seeded from the fixtures, local API, app reads from it | Sweep: every route identical to v7 |
| 2 | MCP server, read tools over the seeded data | Claude Desktop answers "what did I decide about CourtCollect's stack?" from it |
| 3 | Write tools into a pending inbox; curation screens read the inbox | A capture from Claude shows up in the Review step, and undo works |
| 4 | Importers: ChatGPT `conversations.json` and the Claude export, parse and normalize only | Round-trip tests on sample exports; no enrichment yet |
| 5 | Enrichment pass behind a queue, with cost shown before it runs | The loading screen reports real progress on a real import |
| 6 | Onboarding: three doors | Screenshots for each door at 1280 and 390 |

## Open questions

- **Which clients.** Claude supports MCP; support in other chat apps varies and changes.
  Capture only works in clients that support it, and the export import stays the path
  for the rest.
- **Capture reliability.** How often does a model call `atlas_capture` unprompted, given
  good server instructions? Measure before designing around it.
- **Cost.** Enrichment per conversation times a backlog of thousands. Needs a number
  before PR 5, and probably a cheaper model for the first pass.
- **tinyclaw.** Its agents are Claude CLI sessions, so they could use the same MCP
  server: the `atlas` team could read the decision log while it builds Atlas.
