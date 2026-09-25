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

## Integrations: which apps, in what order (issue #87)

`research/v8-mcp/INTEGRATIONS.md` (sourced 2026-09-24) answers the per-app questions:
setup steps, read and write, limits, consent controls, and how each renders links.
**Launch order, signed off by the owner on 2026-09-25:**

1. **Claude.** A custom connector works on every plan including Free (one connector),
   takes five steps, and allows writes with approval.
2. **ChatGPT.** Developer mode is enough for testing (paid plans, web only, a
   confirmation on every write). Free and Plus users need a published plugin, whose
   review forbids tools that ask for raw transcripts, so capture sends decisions and
   short summaries, not excerpts.
3. **Mistral Vibe and Grok,** as unlisted "also works" clients. They take the same URL
   with no review, but their write behavior is not documented well enough to promise
   capture.
4. **Gemini.** US adults, personal accounts, English only, Keep Activity on, and every
   write confirmed.
5. **Microsoft 365 Copilot,** only for a business customer who asks: a declarative
   agent someone packages and a tenant admin allows.

History and anyone who cannot connect keep the export import (PR 4), with reminders.
Share-link forwarding and a browser extension are not recommended: both run into vendor
terms against automated extraction. The report also proposes merging the two write
tools, because ChatGPT and Gemini show a dialog per write, and a pause, per-client and
per-topic controls on Atlas's side. PR 2's read tools exist as a prototype over the
fixtures, served locally by `research/v8-mcp/read-server.mjs` and hosted as a Vercel
function at `/api/mcp` (stateless Streamable HTTP, no auth, demo persona only). Claude
goes first, so the Claude.ai check below is the next step.

**Trying it in Claude.ai.** The endpoint only needs to be reachable: the project's
Vercel deployments, production included, currently sit behind Vercel Authentication,
which answers every request with a redirect to Vercel's sign-in. Once production is
public, add it in Claude.ai: Settings > Connectors > Add custom connector, name "Atlas",
URL `https://<production domain>/api/mcp` (append `?privacy=on` for the stand-ins), Add,
then ask "What did I decide about CourtCollect's stack?". No OAuth step appears, because
the prototype has none. `node research/v8-mcp/read-smoke.mjs <url>` checks the same URL
from a terminal first.

## Privacy mode: the open questions, decided (issue #86, 2026-09-25)

Privacy mode shipped in #95 with five questions left open. The owner asked for the
usual practice on each; these are the answers, and what they mean for v8.

- **Where it's applied: one enforcement point.** Shipped: a pure `aliasText` plus a
  DOM shield that rewrites whatever reaches the screen. Views cannot forget it.
- **Free text: string matching now, entity spans later.** The fixtures carry the entity
  list. With real archives, the enrichment pass (PR 5) tags entities and their types;
  the owner marks each one always hide or never hide, and the matcher stays as the
  backstop for anything the tagger missed.
- **Money: banded.** Exact figures become the band they fall in ("$800 budget" reads
  "$500–$1k budget", "$25/mo" reads "under $100/mo"), which keeps the order of
  magnitude and drops the number. Counts, dates and percentages stay exact: they are
  not identifying on their own.
- **Export: follows the mode, and says so.** Shipped. No "are you sure?" dialog on
  each export: a prompt that always appears gets clicked through, and the notice on the
  Export view is the ask.
- **The URL: stand-ins there too.** A topic's address reads `/topic/employer-a`, and
  that slug opens the topic, so a link copied while presenting still works. Entries
  already in the browser's history keep the spelling they were made with.
- **Scope: the switch is per device, the list is per account.** The switch describes
  the screen in front of you (presenting from a laptop should not change your phone),
  so it stays in the device's storage. What to hide, and the always and never marks,
  are the owner's data and move to the account with PR 0's storage. A connected chat
  app is another screen: its setting belongs to the connection (`?privacy=on` or the
  server's setting), not to the app's switch.

**Privacy mode is a display filter, not a security boundary.** Anyone at the keyboard
can turn it off. Sharing Atlas with someone else, or with a model, goes through
server-side aliasing (as the MCP endpoint's privacy setting does), never through the
switch.

## Open questions

- **Implicit decisions.** The capture eval used decisions stated in one line. Real
  conversations decide implicitly, drift, or reverse. The next eval needs longer and
  messier scripts before PR 3 relies on unprompted capture.
- **Enrichment quality.** Haiku's JSON always parsed and it found every stated
  decision. But its self-reported confidence sat at 90–98 for everything, so it cannot
  drive auto-approve (Sonnet 5 and Opus 5.5 were no better). Needs a scored comparison on real exports before PR 5.
- **Hosted or relay.** The PR 0 decision above.
- **tinyclaw.** Its agents are Claude CLI sessions, so they could use the same MCP
  server: the `atlas` team could read the decision log while it builds Atlas.
