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
| Capturing every conversation silently | **Partly, and better than expected** | The model decides when to call a tool. In the capture eval (research/v8-mcp/FINDINGS.md), a tool description that says when to call it got stated decisions captured 24/24 on Sonnet 5 and Opus 5.5, with no false captures on trivial chats. Implicit decisions are untested. |

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

- **A hosted endpoint is required.** Every chat app that supports MCP (Claude web
  and mobile, ChatGPT, the Gemini app, Le Chat) connects from the vendor's cloud over
  HTTPS and cannot start a local process (research/v8-mcp/CLIENTS.md). A stdio-only
  server would reach Claude Desktop and developer tools and nothing else. So the MCP
  server speaks Streamable HTTP with OAuth at a public URL, and stdio is the extra
  transport for desktop and dev tools.
- **Where the data lives is still a choice.** Conversation history is the most
  personal data a person has. Two shapes keep it off a shared database:
  - Hosted storage per user, encrypted.
  - A thin public relay forwarding to a Node + SQLite process on the user's machine,
    which only works while that machine is on.

  Either way, the Vite app reads a local or hosted API instead of
  `src/data/constants.js`. This is the PR 0 decision.
- **Plain JS**, per CLAUDE.md, on the official MCP SDK.
- **The fixtures become seed data.** The first storage PR loads today's fixtures into
  SQLite and serves them back unchanged, so the sweep can prove the app renders
  identically before anything real flows through it.
- **Enrichment is a model pass, and it is cheap.** The demo fakes topic
  classification, entity extraction and decision detection. For real, each captured or
  imported conversation needs a model pass: an API key, a cost per conversation, and a
  queue. The loading screen's five stages (Parse, Normalize, Enrich, Connect, Build)
  are already the right progress model for it. Measured cost (FINDINGS.md), Haiku 4.5
  on the Batch API:
  - about $1.20 to backfill a typical heavy user's 460 conversations;
  - about $25 for 10,000.

### Tools

Read tools (annotated read-only):

| Tool | Returns |
|---|---|
| `atlas_search(query, topic?, since?)` | Matching conversations, decisions and insights, each with a source reference |
| `atlas_topic(id)` | A topic's summary, timeline and connections |
| `atlas_decisions(topic?, since?)` | The decision log, with pivots and milestones |
| `atlas_drift()` | Open contradictions between past decisions and recent conversations |

Write tools (never destructive, always pending until curated). Each description must
say when to call the tool ("call it when the user commits to a choice"). With one-line
descriptions, only 33–46% of stated decisions were captured. With these descriptions,
all of them were. Server `instructions` added nothing on top.

| Tool | Does |
|---|---|
| `atlas_capture(title, summary, excerpt?, topic_hint?)` | Files the current conversation for review |
| `atlas_log_decision(text, topic_hint?, date?)` | Proposes a decision, pivot or milestone |

Models reach for `atlas_log_decision` first when a decision is made. In 28 of 288 eval
conversations they wrote more than once, so the inbox groups writes by conversation.
Not every client allows writes: ChatGPT only in developer mode, Gemini with a
confirmation each time, Microsoft 365 Copilot not at all. The read tools are the part
that works everywhere. No delete tool, no tool that edits curated data. A resource per topic
(`atlas://topic/{id}`) and one for the weekly digest let clients attach context
without a tool call.

## Sequence

Same rules as v7: one reviewable change per PR, the safety net proves each one.

| # | PR | Done when |
|---|---|---|
| 0 | Decision: Atlas becomes a product; hosted storage or local store behind a relay | Owner signs off on this document |
| 1 | Storage: SQLite seeded from the fixtures, local API, app reads from it | Sweep: every route identical to v7 |
| 2 | MCP server (Streamable HTTP + OAuth, stdio too), read tools over the seeded data | Claude.ai answers "what did I decide about CourtCollect's stack?" from it |
| 3 | Write tools into a pending inbox; curation screens read the inbox | A capture from Claude shows up in the Review step, and undo works |
| 4 | Importers: ChatGPT `conversations.json` and the Claude export, parse and normalize only | Round-trip tests on sample exports; no enrichment yet |
| 5 | Enrichment pass (Haiku 4.5, Batch API) behind a queue, with cost estimated from the user's own export before it runs | The loading screen reports real progress on a real import |
| 6 | Onboarding: three doors | Screenshots for each door at 1280 and 390 |

## Answered (2026-09-23)

The three questions this section used to ask are measured in
`research/v8-mcp/FINDINGS.md`:

- **Capture reliability:** reliable for stated decisions when the tool description
  says when to call it, and 0 of 72 trivial chats were falsely captured.
- **Clients:** chat apps reach MCP servers only over public HTTPS, and several limit
  or forbid write tools. Hence the hosted endpoint above.
- **Cost:** a Haiku 4.5 batch backfill runs about $1.20 per typical heavy user and
  about $25 per 10,000 conversations.

## Open questions

- **Implicit decisions.** The capture eval used decisions stated in one line. Real
  conversations decide implicitly, drift, or reverse. The next eval needs longer and
  messier scripts before PR 3 relies on unprompted capture.
- **Enrichment quality.** Haiku's JSON always parsed and it found every stated
  decision. But its self-reported confidence sat at 90–98 for everything, so it cannot
  drive auto-approve. Needs a scored comparison on real exports before PR 5.
- **Hosted or relay.** The PR 0 decision above.
- **tinyclaw.** Its agents are Claude CLI sessions, so they could use the same MCP
  server: the `atlas` team could read the decision log while it builds Atlas.
