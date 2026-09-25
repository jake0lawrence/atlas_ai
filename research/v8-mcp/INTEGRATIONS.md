# Integrations: connecting Atlas to the chat app people already use (issue #87)

Researched 2026-09-24. This builds on `V8_PLAN.md`, `research/v8-mcp/FINDINGS.md` and
`research/v8-mcp/CLIENTS.md` (all measured or sourced 2026-09-23) and does not repeat
what they establish. Where a claim below comes from those files it cites them. Every
other claim cites a vendor page and the date it was read. help.openai.com, openai.com
and x.ai return 403 to automated reads; claims from those domains come from search
excerpts of the official page and are marked "(excerpt)". Anything not confirmed
against a vendor source is marked **UNVERIFIED**.

## Summary

Launch in this order: **Claude first, then ChatGPT, then Mistral Vibe and Grok as
unlisted "also works" clients, then Gemini, and Microsoft 365 Copilot only for a
business customer who asks.** Claude is first because a custom connector works on every
plan including Free (one connector), takes about five clicks, allows writes with
approval, runs read-only tools without a prompt, syncs to mobile, and is the client
PR 2's done-when already names. ChatGPT has the largest audience but needs two steps:
developer mode (paid plans, web only, a confirmation on every write that resets each
conversation) is enough for testing, and reaching Free users requires publishing a
reviewed plugin, whose guidelines forbid tools that ask for "raw chat transcripts",
so `atlas_capture` must send summaries and decisions, not excerpts. Vibe and Grok take
the same URL with no review and cost almost nothing to support, but their write
behavior is not documented well enough to promise capture. Gemini is limited to US
adults on personal accounts in English, requires Keep Activity on, and confirms every
write. Microsoft 365 Copilot is not self-serve: someone has to package a declarative
agent and a tenant admin has to allow it. For history and for anyone who cannot
connect, the answer stays the export import (V8_PLAN), with reminders; Google Takeout
is the only vendor that schedules recurring exports. Share-link forwarding and a
browser extension both run into vendor terms that prohibit automated extraction, and
share-link content is only in the page HTML for three of six vendors, so neither
should be built.

Two corrections to the 2026-09-23 files, found today:

- **Microsoft 365 Copilot is not read-only.** Custom *federated connectors* are
  read-only (what CLIENTS.md checked), but a *declarative agent* with an MCP plugin can
  "create, update, and delete data", with confirmation for tools that modify data
  (learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/overview-plugins,
  updated 2026-08-21, read 2026-09-24).
- **Le Chat is now Mistral Vibe.** Same URL (chat.mistral.ai), same accounts; MCP
  connectors now live in "Vibe Work" (help.mistral.ai/en/articles/682992-le-chat-is-now-vibe,
  updated 2026-08-12, read 2026-09-24). The CLIENTS.md docs link redirects to
  docs.mistral.ai/vibe/work/connectors/mcp-connectors.

## Per-app table

"Steps" counts user actions from a signed-in chat to a working connection, including
the OAuth consent at Atlas, and excludes plan upgrades. Read = Atlas answers inside the
app; Write = the app can call `atlas_capture` / `atlas_log_decision`.

| App | Recommended path | Setup steps (count) | Read | Write | Limits (plan, region, confirmation) | Sources |
|---|---|---|---|---|---|---|
| **Claude** (web, desktop; mobile uses what web added) | Custom connector by URL now; Connectors Directory listing later | **5**: Customize > Connectors; Add custom connector; paste URL; Add; Connect (OAuth consent). Directory listing: **3** (find, Connect, consent) | Yes; read-only tools run without per-call confirmation; MCP Apps render inline | Yes, with approval (destructive tools always prompt) | Free: 1 custom connector; Pro/Max: many; Team/Enterprise: Owner adds it org-wide first. Adding connectors on mobile is beta | support.claude.com/en/articles/11175166 (upd. 2026-08-11); claude.com/docs/connectors/custom/remote-mcp; claude.com/docs/connectors/building/review-criteria; support.claude.com/en/articles/11176164 (upd. 2026-08-20) |
| **ChatGPT, developer mode** (Plus, Pro, Business, Enterprise, Edu) | Testing and early adopters | **6**: Settings > enable Developer mode; open Plugins; "+" to create app; enter name, URL, auth; save; OAuth consent. Per-chat selection UNVERIFIED | Yes | Yes; confirmation on every write, "remember" lasts one conversation, refresh re-prompts | Web only; not Free. Availability "can depend on account and workspace policy". A third-party claim (peliqan.io, coworker.ai) that Plus and Pro get read/fetch only in developer mode conflicts with OpenAI's page, which names no such split: UNVERIFIED, test on a Plus account | developers.openai.com/api/docs/guides/developer-mode; developers.openai.com/plugins/deploy/connect-chatgpt.md; CLIENTS.md |
| **ChatGPT, published plugin** (Free, Go, Plus, Pro) | The path to Free and Plus users; needs OpenAI review | **3** (find in directory, Connect, OAuth consent), UNVERIFIED exact flow | Yes; `search`/`fetch` results with a non-empty `url` become citations | Yes, write tools are allowed in published plugins if annotated; user setting "Important actions" (default) / "Any changes" / "Always ask" (excerpt) | Review, verified publisher identity, privacy policy, domain verification; publisher picks countries. No raw transcripts in tool inputs. Plans: apps on Free/Go/Plus/Pro outside EEA/CH/UK at the 2025 launch (excerpt); 2026 region list UNVERIFIED | developers.openai.com/plugins/deploy/submission.md; developers.openai.com/plugins/app-guidelines.md; developers.openai.com/api/docs/mcp; help.openai.com/en/articles/11487775 (excerpt) |
| **Mistral Vibe** (was Le Chat) | Custom MCP connector, unlisted | **5**: Connectors; Add Connector; Custom MCP Connector tab; name + URL; Connect (auth auto-detected) | Yes | Yes; per-function "Always allow" toggle, manual approval otherwise | All plans; admin-only feature, but on Free/Pro/Student the account owner is the admin. Custom connectors do not support resources, dynamic tool discovery or prompt templates. HTTPS with valid cert, Streamable HTTP | docs.mistral.ai/vibe/work/connectors/mcp-connectors (read 2026-09-24) |
| **Grok** (web, iOS, Android) | Custom MCP connector, unlisted | **4**: grok.com/connectors; New Connector > Custom; enter URL; complete auth | Yes | Custom-server writes: UNVERIFIED; approval behavior not documented | "Connectors are available to all Grok users"; Business/Enterprise need an admin to provision. A third-party claim that writes need SuperGrok/Premium+ is UNVERIFIED | docs.x.ai/grok/connectors.md (read 2026-09-24); x.ai/news/grok-connectors (2026-05-06) |
| **Gemini app** | Custom app via MCP URL (web setup, then mobile) | **5**: Settings > Connected Apps > Custom apps > Add a custom app; paste URL; OAuth. Then `@`-mention the app per prompt. Prerequisite: Keep Activity on | Yes; link and citation rendering UNVERIFIED | Yes; "manual confirmation for any write actions" | 18+, US, personal account only, English only, Keep Activity required. No plan named | support.google.com/gemini/answer/17209137 (read 2026-09-24) |
| **Microsoft 365 Copilot** | Declarative agent with an MCP plugin, built by us and deployed by a tenant | End user: **3** (open agent, Sign in, allow data sharing). Builder + admin: ~10 (Agents Toolkit, OAuth registration, provision, admin upload policy or catalog approval) | Yes; clickable citations when results carry `url`; MCP Apps supported | Yes, "tools and APIs that modify data" require confirmation; first send to a plugin always asks | Needs "Upload custom apps" or catalog publishing by admin; works in Copilot Chat without a Copilot license ("Custom actions" ✅). Federated connectors: read-only, Global or AI Administrator | learn.microsoft.com/.../extensibility/overview-plugins (upd. 2026-08-21); .../build-mcp-plugins (upd. 2026-08-11); .../prerequisites (upd. 2026-07-13); .../connectors/set-up-custom-federated-connectors (upd. 2026-09-22) |
| Microsoft Copilot (consumer) | Export only | n/a | No MCP support found | No | CSV export of activity history | support.microsoft.com/en-us/privacy/manage-your-copilot-activity-history-in-the-privacy-dashboard (excerpt) |
| Claude Code, Codex, Cursor, VS Code, Zed | Same remote URL, or stdio | 1 command or config entry | Yes | Yes | See CLIENTS.md | CLIENTS.md |
| Perplexity | Not evaluated beyond CLIENTS.md | UNVERIFIED | UNVERIFIED | UNVERIFIED | Pro and up (excerpt, CLIENTS.md) | CLIENTS.md |

## 1. Apps without MCP write access: how conversations get in

"Without write access" today means ChatGPT Free and Go until Atlas is a published
plugin, Gemini users outside the US or on work accounts, consumer Microsoft Copilot,
and M365 Copilot tenants that will not deploy an agent. Four options were evaluated.

### 1a. Scheduled or reminded re-exports

| Vendor | Export today | Format | Delivery | Recurring? | Source (read 2026-09-24) |
|---|---|---|---|---|---|
| ChatGPT | Settings > Data controls > Export | ZIP with `conversations.json` and `chat.html` (format per third-party guides; the help page says "chat history and other relevant account data") | Email or SMS; "up to 7 days"; link expires 24 hours after receipt and must be opened while signed in to the same account | No. How often it can be requested: UNVERIFIED | help.openai.com/en/articles/7260999 (excerpt) |
| Claude | Settings > Privacy > Export data (web, desktop; not iOS/Android) | JSON (per third-party guides; the help page does not state a format) | Email link, expires 24 hours after delivery, must be signed in. Team/Enterprise: Primary Owner only | No. Rate limit not stated | support.claude.com/en/articles/9450526 (upd. 2026-07-08) |
| Gemini | Google Takeout > My Activity > Gemini Apps (Gems are under "Gemini") | ZIP/TGZ; activity defaults to HTML, JSON selectable | Email link valid ~7 days, 5 downloads; or delivered to Drive, Dropbox, OneDrive, Box. "Most people get the link ... the same day" | **Yes: "every 2 months for one year"** (not for Advanced Protection users) | support.google.com/gemini/answer/16920332; support.google.com/accounts/answer/3024190 |
| Microsoft Copilot (consumer) | Privacy dashboard > Copilot > Export all activity history | CSV of prompts and responses | Immediate download | No | support.microsoft.com/en-us/privacy/manage-your-copilot-activity-history-in-the-privacy-dashboard (excerpt) |
| Microsoft 365 Copilot | No end-user export; admins use Purview eDiscovery | n/a | n/a | n/a | UNVERIFIED from Microsoft docs (third-party sources only) |
| Mistral Vibe | admin.mistral.ai/account/export, Export button | Not stated | Download (appears immediate) | No | help.mistral.ai/en/articles/347623 (upd. 2026-08-12) |
| Grok | accounts.x.ai/data, or Settings > Data Controls | JSON, email link | "a few minutes" | No | UNVERIFIED (third-party guides only; x.ai returns 403) |

What this means for Atlas:

- **Reminders, not automation.** ChatGPT and Claude export links expire in 24 hours
  and must be opened while signed in, so Atlas cannot take a forwarded export email and
  fetch the file server-side. The user has to download and drop it. A monthly reminder
  (email or in-app) plus an importer that dedupes by the vendor's conversation id is the
  whole feature. Re-imports must be incremental: the ChatGPT export is the full history
  every time.
- **Gemini is the one exception.** Takeout can schedule six exports a year to Google
  Drive, Dropbox, OneDrive or Box. Atlas could pick those up from the user's storage,
  but that needs a storage connector with read access to the Takeout folder. Which OAuth
  scope reaches Takeout files: UNVERIFIED.
- **Consumer Copilot's CSV and M365's admin-only export** make those two the weakest
  import sources. Neither is worth an importer before there is demand.

### 1b. A browser extension that reads the open conversation

Technically easy (third-party exporters already do it, e.g.
github.com/pionxzh/chatgpt-exporter), but the vendor terms point the other way:

- OpenAI Terms of Use prohibit users from "automatically or programmatically extract
  data or Output" (openai.com/policies/row-terms-of-use, excerpt, read 2026-09-24).
- Anthropic Consumer Terms prohibit accessing the Services "through automated or
  non-human means, whether through a bot, script, or otherwise" and "to crawl, scrape,
  or otherwise harvest data or information from our Services" (anthropic.com/legal/consumer-terms,
  effective 2025-10-08, read 2026-09-24).
- Microsoft Services Agreement, AI Services section: "you may not use web scraping, web
  harvesting, or web data extraction methods to extract data from the AI services"
  (microsoft.com/en-us/servicesagreement, effective 2025-09-30, read 2026-09-24).
- Google Terms prohibit automated access "in violation of the machine-readable
  instructions on our web pages (for example, robots.txt ...)" (policies.google.com/terms,
  effective 2026-07-30, read 2026-09-24); gemini.google.com/robots.txt disallows `/app/`
  and `/chat/` (read 2026-09-24).
- Chrome Web Store: from 2026-08-01, data an extension collects "must now be strictly
  necessary to the extension's disclosed single purpose" and all collection must be
  "prominently disclosed" (developer.chrome.com/blog/cws-policy-updates-2026, read 2026-09-24).

Whether a user-triggered "clip this chat" button counts as "programmatic extraction" is
a legal question this document does not answer. The DOM also changes without notice.
**Recommendation: do not build it.** If a manual path is wanted, a paste box ("paste a
conversation or a summary") has none of these problems.

### 1c. Forwarding share links

All six consumer apps have share links, and all are snapshots: later messages are not
included unless the user re-shares. Measured 2026-09-24 with a plain HTTPS GET (desktop
Chrome user agent, one real public link each, found on Hacker News, compared against a
made-up id on the same host):

| App | Link form | Snapshot? | Conversation text in the returned HTML? | robots.txt for that path | Source |
|---|---|---|---|---|---|
| ChatGPT | chatgpt.com/share/<uuid> | Yes (excerpt, third-party) | **Yes.** Title in `<title>`; full messages in a serialized payload (`linear_conversation`, also `continue_conversation_url` and `backing_conversation_id`). Undocumented format | `Allow: /share/` | measured; help.openai.com/en/articles/7925741 (excerpt) |
| Claude | claude.ai/share/<uuid> | Yes; files and "raw data retrieved from MCP tool calls" excluded | **No.** Same 128,579-byte shell as a made-up id. The data endpoint (`/api/chat_snapshots/<id>`) returned a Cloudflare "Just a moment..." challenge | `Disallow: /api/*` | measured; support.claude.com/en/articles/10593882 (upd. 2026-06-15) |
| Gemini | gemini.google.com/share/<id> (g.co/gemini/share redirects) | Yes | **No.** Generic title; page size within 200 bytes of a made-up id | `/share/` not disallowed | measured; support.google.com/gemini/answer/13743730 (excerpt) |
| Grok | grok.com/share/<id> | UNVERIFIED | **Yes.** Title and first prompt in meta tags; messages in the page payload | `Allow: /` | measured |
| Mistral Vibe | chat.mistral.ai/chat/<uuid> | Yes, a "cloned snapshot"; cannot be revoked | **Yes.** Title and messages rendered in HTML | no rules returned | measured; help.mistral.ai/en/articles/364510 (excerpt) |
| Microsoft Copilot | copilot.microsoft.com/shares/<id> | UNVERIFIED | **No.** 38 KB shell, generic title | `/chats/*` disallowed, `/shares` not | measured |

Conclusion: share-link import would work for three apps, through undocumented page
formats that can change any day, under the same OpenAI term quoted in 1b, and each link
is public to anyone who has it. It also only captures conversations the user remembers
to share. **Not recommended.** The one legitimate use is as a manual fallback where the
user pastes a link and Atlas asks them to paste the text instead if the fetch fails;
even that should wait for legal review.

### 1d. App-specific extension points

- **ChatGPT custom GPT actions: dead end.** "New GPT creation is not available on
  personal ChatGPT accounts, including Free, Go, Plus, and Pro"; it remains in Business,
  Enterprise and Edu (help.openai.com/en/articles/9300383 and 8554397, excerpt, read
  2026-09-24). Third-party reports say GPTs are being phased out for business plans in
  favor of Workspace Agents (UNVERIFIED from OpenAI). The extension point that replaces
  them is the MCP-based plugin, which is Atlas's MCP server plus review.
- **ChatGPT published plugin: the real path to Free and Plus.** Write tools are
  permitted when annotated (developers.openai.com/plugins/deploy/submission.md). The
  guidelines constrain Atlas directly: "Do not request the full conversation history,
  raw chat transcripts, or broad contextual fields 'just in case'", and "Your MCP server
  must not pull, reconstruct, or infer the full chat log from the client or elsewhere"
  (developers.openai.com/plugins/app-guidelines.md, read 2026-09-24). So a reviewed
  Atlas can file *decisions and short summaries the model writes*, not transcripts.
  `atlas_capture`'s optional `excerpt` should be dropped or capped to a quote of the
  decision sentence, and the privacy policy has to say exactly that.
- **Gemini: custom apps are the only third-party route.** The Connected Apps directory
  lists partners (Canva, Dropbox, Instacart, OpenTable, Zillow) (blog.google, "Gemini
  Spark updates", 2026-06-30, read 2026-09-24); how a third party gets listed:
  UNVERIFIED. Whether a Gem can use a custom app: UNVERIFIED.
- **Microsoft 365 Copilot: declarative agent + MCP plugin.** Agents Toolkit wraps an MCP
  server URL into an agent ("Start with an MCP Server"), with OAuth static or dynamic
  registration or Entra SSO; redirect URL `https://teams.microsoft.com/api/platform/v1.0/oAuthRedirect`
  (learn.microsoft.com/.../build-mcp-plugins, upd. 2026-08-11). "Custom actions" work in
  Copilot Chat without a Copilot license (.../prerequisites, upd. 2026-07-13). A
  third-party claim that federated connectors get write actions in October 2026 is
  UNVERIFIED; the Microsoft page (upd. 2026-09-22) still says read-only.
- **Grok, Vibe: custom MCP only.** How to get into their catalogs: UNVERIFIED.

## 2. Setup friction: fewest steps per app

Counts are in the table above. What drives them, and what Atlas can do about it:

- **OAuth with automatic client setup keeps every flow to "paste URL, consent".**
  Claude prefers the Client ID Metadata Document ("Use Claude's published identity",
  nothing to set up) and falls back to Dynamic Client Registration
  (claude.com/docs/connectors/custom/remote-mcp, read 2026-09-24). Vibe auto-detects
  "OAuth 2.1 (with dynamic client registration)". Gemini asks for credentials under
  "Advanced features" only when the server lacks DCR. M365 supports "OAuth (with dynamic
  registration)". **Atlas's OAuth server should support both CIMD and DCR**; then no
  client needs a pasted client ID.
- **Claude's "Sign in when needed" (lazy auth)** lets a user add the connector without
  signing in and be prompted on the first protected call
  (claude.com/docs/connectors/building/lazy-authentication). Not needed for Atlas, where
  every tool is per-user.
- **Directory listings cut steps from 5-6 to 3** in Claude and ChatGPT, at the cost of a
  review. Claude directory review requires `title` plus `readOnlyHint`/`destructiveHint`
  on every tool (claude.com/docs/connectors/building/review-criteria). ChatGPT review
  requires all three hints with a written justification, verified identity, a privacy
  policy and a demo account with sample data (developers.openai.com/plugins/app-guidelines.md,
  .../deploy/app-review.md). The demo persona in `src/data/constants.js` is that demo
  account.
- **The fourth onboarding door** ("connect your chat app") should show the per-app URL
  and a numbered list per app, detect which app the user picks, and say plainly when a
  plan or region rules it out (ChatGPT Free before publication, Gemini outside the US).

## 3. Consent and noise

What each app gives the user today:

| App | Per-chat enable | Approval prompts | Other controls | Source |
|---|---|---|---|---|
| Claude | "+" > Connectors toggle per conversation | Read-only tools run without per-call confirmation; destructive tools always prompt; user can set a tool to Blocked (and "Always allow"); Team/Enterprise owners set Always allow / Needs approval / Blocked org-wide. How a non-destructive write (Atlas's) is treated: UNVERIFIED, test in PR 3 | Incognito chats; memory toggles in Settings | claude.com/docs/connectors/building/review-criteria; claude.com/docs/connectors/custom/remote-mcp; support.claude.com/en/articles/11176164; support.claude.com/en/articles/12260368 (excerpt) |
| ChatGPT dev mode | UNVERIFIED | Every write; "remember" per tool for the rest of that conversation; new conversation or refresh prompts again | Payload shown as JSON before approval | developers.openai.com/api/docs/guides/developer-mode |
| ChatGPT published | UNVERIFIED | "Important actions" (default), "Any changes", "Always ask"; some risky actions blocked | Workspace admins set allowed actions | help.openai.com/en/articles/11487775 (excerpt) |
| Gemini | `@`-mention the app | Every write | Keep Activity must stay on | support.google.com/gemini/answer/17209137 |
| Vibe | UNVERIFIED | Per-function "Always allow", else manual | n/a | docs.mistral.ai/vibe/work/connectors/mcp-connectors |
| Grok | UNVERIFIED | UNVERIFIED | n/a | docs.x.ai/grok/connectors.md |
| M365 Copilot | Agent chosen explicitly | First send to a plugin asks (once or always); modifying tools confirm, retrieving tools do not | Admin enable/disable, staged rollout | learn.microsoft.com/.../overview-plugins |

Noise follows from this: in ChatGPT and Gemini, every capture is a confirmation dialog.
FINDINGS.md found 28 of 288 eval conversations wrote twice (a decision plus a capture of
the same exchange). In those two apps that is two dialogs for one decision. So:

- **Merge the write tools or make one of them rare.** Either fold `atlas_capture` into
  `atlas_log_decision` (with an optional `summary`), or describe `atlas_capture` as
  "only when the user asks to save the conversation". Re-run the capture eval on
  whichever wording is chosen; the eval showed descriptions drive behavior.
- **Annotate honestly**: writes `readOnlyHint: false`, `destructiveHint: false`,
  `openWorldHint: false` (bounded private account, per OpenAI's definition in
  developers.openai.com/plugins/deploy/app-review.md). Reads `readOnlyHint: true` so
  Claude and M365 run them without a prompt.
- **Tell the user what was filed** in the tool result text. The eval already found
  models disclose saves 186/187 times; a short result ("Filed for review in Atlas:
  <decision>") keeps that.

What Atlas itself needs to offer, because the apps' controls are all-or-nothing per
tool:

1. **Pause capture** (global, with a duration: 1 hour, 1 day, until resumed). While
   paused, write tools return a non-error result saying capture is paused and nothing
   was stored, so the model tells the user instead of retrying.
2. **Per-client switch** (capture from Claude on, from ChatGPT off). Each connection is
   its own OAuth grant, so the server knows the client; `MCP_CLIENTS` in the fixtures
   already models this.
3. **Per-topic mute and per-topic "never share out".** Mute drops writes whose topic
   resolves to a muted topic. "Never share out" removes a topic from read-tool results
   in third-party apps; this is where issue #86's privacy mode applies to integrations.
4. **Per-chat opt-out** has no protocol support: MCP carries no stable conversation id
   Atlas can rely on (whether ChatGPT or Claude pass one in `_meta`: UNVERIFIED). The
   practical version is an instruction in the write tools' descriptions ("never call
   this if the user said the chat is off the record") plus the app's own per-chat
   connector toggle, and the inbox as the real gate: nothing lands in the atlas
   without review (V8_PLAN).
5. **Group and dedupe writes per conversation** in the inbox (FINDINGS.md).

## 4. Read-side answers: links back to Atlas

| App | Links and citations from tool results | Rich content | Source |
|---|---|---|---|
| Claude | Model writes links from tool text (rendering of links in plain text: UNVERIFIED as documented behavior). MCP Apps can call `ui/open-link`; custom connectors "always show" an "Open external link" confirmation; directory connectors can allowlist origins | MCP Apps on web, desktop and iOS/Android for all users; Team/Enterprise owners can disable UI-rendering tools | claude.com/docs/connectors/building/mcp-apps/external-links; support.claude.com/en/articles/13454812 (upd. 2026-08-11) |
| ChatGPT | "ChatGPT creates citation metadata only when `url` is a non-empty string" for `search`/`fetch` results (deep research and company knowledge) | MCP Apps UI (`text/html;profile=mcp-app`, `_meta.ui.resourceUri`, alias `openai/outputTemplate`); `window.openai.openExternal` for vetted links, redirect targets allowlisted via `openai/widgetCSP.redirect_domains` | developers.openai.com/api/docs/mcp; developers.openai.com/plugins/build/chatgpt-ui.md; developers.openai.com/plugins/reference.md |
| M365 Copilot | Clickable citations when each result has a URL; inferred automatically from field names (`url`, `title`, `subtitle`, array under `results`), or set with `response_semantics`. Without a URL: "a representative pill or icon", not clickable. Plain URLs in responses "might" render clickable; "Don't rely on" it | MCP Apps; Adaptive Cards for API plugins | learn.microsoft.com/.../plugin-citations (upd. 2026-09-04); .../overview-plugins |
| Gemini | UNVERIFIED | UNVERIFIED | support.google.com/gemini/answer/17209137 says nothing on rendering |
| Vibe | UNVERIFIED; custom connectors do not support resources, so `resource_link` and embedded resources are unlikely to render | UNVERIFIED | docs.mistral.ai/vibe/work/connectors/mcp-connectors |
| Grok | UNVERIFIED | UNVERIFIED | docs.x.ai/grok/connectors.md |

Design that works across all of them: every read result carries an absolute `url` into
the Atlas web app (the deep links already exist: `/topic/<id>`,
`/topic/<id>/conversation/<eventIndex>`, `/archaeology/<chainId>` in `src/routes.js`),
plus `title` and `subtitle`, in a flat `results` array. Return it in `structuredContent`
and as serialized JSON in a text block, as the MCP spec recommends for compatibility
(modelcontextprotocol.io/specification/latest/server/tools, spec 2026-07-28, read
2026-09-24). That one shape satisfies ChatGPT's `id`/`title`/`url` citation rule and
M365's alias inference with no manifest work. The Ask Atlas format (answer with
numbered sources, `COMPANION_RESPONSES`) maps onto it: the model writes the answer, the
sources are the results. An MCP App view (a topic timeline card) is a later nicety for
Claude, ChatGPT and M365; do not start there.

## 5. Follow-up: the harder capture eval

Out of scope here, and still a prerequisite for relying on unprompted capture in PR 3
(V8_PLAN open questions). Scope it as: 6+ turn scripts where the decision is implied
("fine, let's just go with Postgres then"), drifts over turns, is reversed later in the
same chat, or is about the user's own life (the classes FINDINGS.md found hardest: D6
language, D3 job offer, D1 database). Score whether the write happens, whether the
reversal is filed as a pivot rather than a second decision, and false captures. Run it
against the merged-write wording from section 3, since that changes the tool surface.
Client behavior (approval dialogs) cannot be measured in Claude Code headless and needs
a manual pass per app.

## The first prototype (V8_PLAN PR 2: read tools)

**Built, over the fixtures rather than the SQLite seed** (PR 1 has not landed):
`src/mcp/readTools.js` holds the four tools as pure functions, tested in
`src/mcp/__tests__/readTools.test.js`; `research/v8-mcp/read-server.mjs` serves them
over stdio or Streamable HTTP (`--http 8787`); `research/v8-mcp/read-smoke.mjs` checks
both transports with the MCP client and asks PR 2's question, which returns the
Supabase + Next.js decision first, linked to its own conversation. With
`ATLAS_PRIVACY=on` (#86) every string it returns, ids and links included, carries the
stand-ins. Not done: OAuth, a public HTTPS endpoint, and the check against Claude.ai
itself, which needs the tunnel. The design it follows is below, as written before it
was built.

Target: Claude.ai answers "what did I decide about CourtCollect's stack?" from Atlas.
Four read-only tools, all `readOnlyHint: true`, `openWorldHint: false`, each with a
`title`. Use underscores in names: `src/data/constants.js` `MCP_TOOLS` currently uses
dotted names (`atlas.log_decision`, `atlas.search`) while V8_PLAN uses `atlas_search`.
Dots are legal in MCP tool names (spec, above), but whether every client accepts them is
UNVERIFIED, and underscores avoid the question; update the fixture to match.

Every result item uses one shape so citations work in ChatGPT and M365:

```json
{ "id": "decision:1", "kind": "decision", "title": "Chose Supabase + Next.js",
  "subtitle": "CourtCollect · 2024-09-15", "snippet": "...", "date": "2024-09-15",
  "topicId": "courtcollect", "url": "https://<atlas-host>/topic/courtcollect/conversation/2" }
```

| Tool | Input | Output (`structuredContent`) | Fixture data it reads |
|---|---|---|---|
| `atlas_search` | `query` (string, required), `topic?` (topic id), `since?` (ISO date), `limit?` (default 10) | `{ results: Item[] }`, kinds `conversation`, `decision`, `pivot`, `milestone` | `TIMELINE_DATA` (title + summary per event; url `/topic/<id>/conversation/<index>`), `INSIGHT_DECISIONS` (`aiProposal`, `sourceRef`), `PIVOT_ENTRIES` (title, before, after), `SEARCH_RESULTS` (title, preview), `TOPICS` for names. `SEARCH_RESULTS` is keyed by exact demo queries, so the prototype needs a simple token match across all of these rather than a lookup |
| `atlas_topic` | `id` (topic id, required) | `{ id, name, category, count, firstSeen, lastSeen, url, timeline: Item[], connections: [{ to, label, strength }] }` | `TOPICS`, `TIMELINE_DATA[id]`, `CONNECTIONS` (both directions), optionally `TOPIC_CONFIDENCE`, `DIGEST_DATA` for recent change |
| `atlas_decisions` | `topic?`, `since?`, `type?` (`decision` \| `pivot` \| `milestone`) | `{ results: Item[] }` sorted by date, with `sourceRef` in `subtitle` | `INSIGHT_DECISIONS`, plus `TIMELINE_DATA` events whose `type` is `decision`, `pivot` or `milestone`, plus `PIVOT_ENTRIES`. For the done-when question this returns `INSIGHT_DECISIONS` #1 (Supabase + Next.js, 2024-09-15) and #2 (pivot to Vercel + Supabase Cloud, 2024-11-16) |
| `atlas_drift` | none | `{ results: Item[] }`, one per open contradiction, with `earlier` and `current` `{ date, position }` | `CONTRADICTIONS_INITIAL` (`summary`, `earlier`, `current`, `severity`); url `/topic/<topicId>` |

Two resources from V8_PLAN can wait (`atlas://topic/{id}`, the weekly digest): Vibe's
custom connectors do not support resources at all, and read tools cover the same
ground everywhere.

Practical notes for the PR:

- **Seeding:** `src/data/constants.js` imported `'../styles/tokens'` without an
  extension, so plain `node` could not load it. The import now carries `.js` (done with
  the prototype); PR 2 proper should still read the SQLite seed, not the module.
- **Public URL:** tools need an absolute base URL for `url` (an env var such as
  `ATLAS_PUBLIC_URL`), since chat apps open the link outside Atlas.
- **Transport and auth:** Streamable HTTP at a public HTTPS URL with a valid certificate
  (Vibe requires it; all chat apps connect from their cloud per CLIENTS.md), OAuth with
  CIMD and DCR (section 2). For the PR 2 demo, Claude's "No sign-in" option is enough
  against seeded data; real data needs OAuth before it leaves localhost.
- **Response minimization:** no internal ids, timestamps or trace ids beyond what the
  answer needs (developers.openai.com/plugins/app-guidelines.md); cheap to follow from
  the start and required for the ChatGPT review later.
- **Test harness:** `research/v8-mcp/stub-server.mjs` is the starting point; its
  `atlas_search` can be swapped for the four tools above and the capture eval's search
  calls reused as a smoke test.
