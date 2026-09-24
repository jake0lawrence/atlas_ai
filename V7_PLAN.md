# ATLAS v7 — The Redesign

## Where v6 left things

v4 through v6 each added a layer to the same prototype: the visualization (v4), the
curation pipeline (v5), the companion and the thinking changelog (v6). Every layer
shipped, and the demo tells all three stories. But it tells them the way it was built:
as accretion. Nineteen full-screen views, an eight-tab nav plus a companion sidebar
plus two guided tours, 35 distinct colors, and a footer that still says "v5."

**Step 0 decision (made in the restructure PR): Atlas stays a demo.** No backend, no
real ingestion. v7 is not a feature release. It is the release where the demo starts
looking like one product instead of three stacked prototypes.

> **v6**: "Your knowledge compounds."
> **v7**: "It looks like it does."

## What v7 is

A visual and information-architecture redesign, shipped **one view per PR**, on top of
three prerequisites that are now done or in flight:

| Prereq | PR | State |
|---|---|---|
| Split `App.jsx` into `src/views`, `src/components`, `src/styles` | #66 | open, draft |
| Token module (`src/styles/tokens.js`, `shared.js`); no color literal outside it (lint-enforced) | #67 | merged |
| Safety net: ESLint, a render test per view and per route, a Playwright screenshot baseline of the route table, CI | #67 | merged |

The prerequisites are what make one-view-per-PR safe: a redesign PR touches one file
in `src/views/`, the render test proves it still mounts on every route, the screenshot
diff shows exactly what changed and nothing else, and the lint refuses a new hex value.

## Design principles (proposed, decide before PR 1)

These are the calls that shape every view PR. They are proposals; the owner ratifies
or amends them in the first PR of the sequence, after which they are the standard.

1. **One palette.** The token module names 35 colors because that is how many the code
   used. The redesign should need about a third of that: a background ramp (`bg0`..`bg3`),
   the brand gold, the two platform accents (Claude gold, GPT blue), and four semantic
   accents (green / red / purple / amber). Topic colors stay as fixture data. Removing a
   token is a one-line diff that lint then enforces everywhere.
2. **A type scale, not per-element sizes.** Today every element picks its own
   `fontSize: mobile ? 11 : 12`. `shared.js` already holds `display`, `title`, `lede`,
   `body`, `mono`, `eyebrow`; the redesign extends that to a full scale and views use
   only the scale.
3. **A spacing scale** (4 / 8 / 12 / 16 / 24 / 32 / 48) in `tokens.js`, same argument.
4. **Motion has a budget.** The global stylesheet defines 24 keyframes. Keep the ones
   that carry meaning (view transition, auto-approve, sync spin, new-item glow), cut the
   decorative ones, and gate everything behind `prefers-reduced-motion`. The sweep and
   the Playwright baseline already run with reduced motion.
5. **Three destinations, not eight tabs.** The nav today: Overview, Companion,
   Connections, Evolution, Belief Diffs, Digest, Search, Export, plus a sidebar and a
   command palette. The v6 thesis is a loop with three stations: **Curate → Atlas →
   Companion**. The proposed IA folds Connections and Evolution under Atlas (the map),
   Belief Diffs and Digest under Companion (the changelog), keeps Search as ⌘K only,
   and moves Export into the header. One tour, not two.
6. **Empty and error states are designed.** The drilldown renders nothing for an event
   without a preview; the router sends unknown paths to the dashboard silently. Every
   view gets a designed empty state in its PR.
7. **Mobile is a first-class viewport.** Every view PR adds the 390-wide screenshot
   for its route to the baseline: flag the route `mobile` in `src/routes.js`
   (`MOBILE_ROUTES`) and run `npm run test:e2e:update`. PR 1 seeds it with the
   onboarding, dashboard, connections, belief-diffs and timeline routes.

**Status after PR 1:** principles 3 (spacing scale) and 5 (three stations) are
implemented in the shell; 2 (type scale) exists in `tokens.js` and is used by the
shell, views adopt it as their PR comes up; 1, 4 and 6 are applied view by view and
closed out in PR 21. Two tour steps (Belief Diffs, Digest) spotlight page tabs that
are only visible when the Companion station is active, so from the dashboard they
fall back to the centered tooltip; PR 20 rewrites the tour to the new IA.

## The sequence

Order is by leverage: the shell first (everything sits in it), then the front door
(first impression), then the payoff (the v6 thesis), then the curation run (the v5
moat), then the secondary views, then the overlays. Each PR is one view file plus
its route's baseline PNGs; no PR touches two views.

| # | PR | Route | File | What changes | Done when |
|---|---|---|---|---|---|
| 1 | Shell + Nav **(merged, #68)** | all | `App.jsx`, `components/Nav.jsx` | The three-station nav (Atlas / Curate / Companion) with page tabs under the active station, wordmark, actions row (⌘K, sync, Export, Tour), hero only on the dashboard, footer fixed, one tour button. Adds the `SPACE` and `TYPE` scales to `tokens.js`, the `mobile` screenshot project, and removes the last `exhaustive-deps` suppressions. | Render + route tests green; baseline updated for every route (the shell is in all of them); PR text records each principle as accepted or amended. |
| 2 | Onboarding **(merged, #69)** | `/` | `views/OnboardingView.jsx` | One card, one CTA: the demo persona is the default path (first persona pre-selected, CTA live on load), own exports sit behind a disclosure and take over the CTA when a file lands, the disabled persona becomes a footnote instead of a dead card, and a four-fact strip (read from the fixtures) replaces the steps row. | Baseline for `/` at 1280 and 390. |
| 3 | Loading **(merged, #71)** | `/loading` | `views/LoadingView.jsx` | The five stages (Parse / Normalize / Enrich / Connect / Build) are the page: each shows done / running / waiting, a finished stage keeps its last finding as a one-line summary, the running stage carries the step log, discovered topics land as chips under Enrich. Overall progress bar with a real `progressbar` role, a "Skip to the atlas" link after 1.5 s, and the two infinite animations (brain glow, shimmer) removed; class animations gated behind `prefers-reduced-motion` in `base.js`. | Same. |
| 4 | Dashboard **(merged, #72)** | `/dashboard` | `views/DashboardView.jsx` (+ its three dashboard-only components) | Hero moves in from `App.jsx`. Order: stats, map (with a legend), "Needs your attention" (stale decisions + new conversations in one panel, with a caught-up empty state), the journey (with its takeaway in words), traits and rediscoveries. Contrast raised on the scales; `TopicBubble` timer leak fixed and every bubble labeled. The baseline now seeds "tour seen" so the dashboard is visible; a `dashboard-tour` route keeps the tour covered. | Same, plus palette/sidebar baselines. |
| 5 | Companion (Ask Atlas) **(merged, #73)** | `/companion` | `views/AskAtlas.jsx` | Moves inside the shell (last full-screen page; the Ask / Belief Diffs / Digest tabs now show on it). Empty state lists the four demo questions in full and says what the demo can answer. Citations are buttons: clicking [n] opens the sources with that one highlighted and scrolled into view, and a citation never wraps away from its word. Drift panel cards are buttons with readable contrast and a designed empty state. New `companion-answer` baseline route drives the answered state. | Same. |
| 6 | Timeline + Drilldown **(merged, #74)** | `/topic/:id`, `/topic/:id/conversation/:n` | `views/TimelineView.jsx`, `views/ConversationDrilldown.jsx`, `components/Breadcrumbs.jsx` | Two views, one PR, because the drilldown is the timeline's detail state. Breadcrumbs (Overview › topic › thread) replace the lone back link. The timeline gets a type filter (`aria-pressed` chips) and says how many threads carry a transcript; only those events are buttons, the rest are marked "Summary only". The drilldown highlights extractions by finding their text in the message (unfound or overlapping ones are dropped, and a test holds every fixture extraction to resolving), renders code as `<pre>` without the fences, links the earlier and later thread, and gives an event with no transcript a designed summary-only page listing the threads that can be read. Both reveal intervals removed; the timeline wrapper widens to 960, which also fixes a horizontal overflow at 1280. New baselines: the summary-only page, and the drilldown at 390. | Same. |
| 7 | Review Queue **(merged, #75)** | `/curation` | `views/ReviewQueue.jsx`, `components/CurationChrome.jsx` | The curation run, screen 1 of 5. Shared curation chrome extracted to `components/CurationChrome.jsx` and reused by 8–11: a five-step rail of buttons (`aria-current="step"`), the step header, "Skip to the atlas", and `KeyHints`. The run stays outside the shell, like onboarding and loading. Queue state moves into a pure reducer: items at 90%+ are approved up front (listed and undoable under "Approved automatically") instead of on staggered timers, Edit becomes Move (a topic picker that records where the conversation came from), Skip becomes Later, every decision can be undone, and "Continue to topics" is available before the queue is clear. Keyboard shortcuts now work (the old handler was bound once to a null item). Confetti, bounce, glow and stagger animations removed. New baselines: `/curation` at 390, and `curation-move` (one decision, move picker open). | Same. |
| 8 | Topic Curation **(merged, #76)** | `/curation/topics` | `views/TopicCurationPanel.jsx` | Confidence values move to a fixture (`TOPIC_CONFIDENCE`) and a split's new color is the first unused palette color, so no `Math.random` is left in `src/`. Adopts the curation chrome. Atlas's merge and split suggestions are listed up front with Merge / Split / Dismiss; every card shows its actions (Rename, Color, Merge…, Split) as real buttons instead of hiding them behind a click on the card; stars are toggle buttons; rename is a labeled form; the sparkline says its trend in words. All changes go through a pure reducer with an undo stack, and the footer shows the last change with Undo. The separate "Topics curated" screen is gone: one button goes to the next step. Also fixes the intermittent `companion-answer` screenshot (the mask flickered; the fixed tab is now hidden in that route's setup). | Same, and the sweep reports this route identical run to run. |
| 9 | Connection Validation **(merged, #77)** | `/curation/connections` | `views/ConnectionValidation.jsx` | Adopts the curation chrome. The row of icons that called itself a graph becomes one: an inline-SVG graph of all 14 topics and every connection, drawn in a fixed ellipse layout, with the connection under review in gold and each edge colored by its decision (confirmed, relabeled, rejected dashed), plus a legend and a text summary for screen readers. State moves into a pure reducer: keyboard shortcuts act on the connection on screen (the old handler was bound once and always acted on the first), Edit becomes a labeled Relabel form (an unchanged label counts as a confirm), Later skips without deciding, every decision has Undo, and "Confirm the N waiting" replaces the unlabeled bulk approve. Adding a connection checks for both topics, a label, a self-link and a duplicate pair, and says which. The strength bump on confirm and the separate "validated" screen are gone. Also: `alpha()` now throws in dev and tests on a non-hex color, the bug behind this PR's white-on-white Cancel and PR 6's invisible chip. | Same. |
| 10 | Insight Review **(merged, #78)** | `/curation/insights` | `views/InsightDecisionReview.jsx`, `components/PastPerspectivePanel.jsx` | Adopts the curation chrome. Signature piece: a timeline strip of every insight placed by its date (pure `timelinePositions`), marked by type and by decision, where each dot is a button that opens that insight (or undoes it); it is the Evolution timeline you are about to keep. State moves into a pure reducer, so keyboard shortcuts act on the insight on screen (the old handler was bound once to the first); "Partially correct" becomes a labeled Rewrite form (unchanged text is a plain keep) and the decision row shows your words with Atlas's struck through; Later, Undo and "Keep the N waiting" as in the other curation steps. Dismiss/promote card animations, their 400 ms timers, the card-stack decoration and the separate "reviewed" screen are gone. The past-perspective toggle gets `aria-expanded`; `PastPerspectivePanel` (only used here) gets a labeled close button and readable text contrast. | Same. |
| 11 | Curation Summary **(merged, #81)** | `/curation/summary` | `views/CurationSummary.jsx` | Adopts the curation chrome. The page reported fixed numbers (48 reviewed, 34 approved, a 91% confidence ring) whatever you did; it now reports the run. Each step hands its tally to the store when you finish it (`curationResults`, one line per step view, the one exception to one view per PR), and a step you skipped reports its fixtures untouched, says "Not finished" and links back to it. Signature piece: one square per proposal, per step, colored by what happened to it (kept, changed, rejected, approved automatically, waiting), with a legend and a text summary per step; topic edits are listed by name since they are not proposals. The rail ticks only finished steps (`CurationHeader` takes `done`). Count-up animation, phase timers, confetti glow and the before/after table of invented deltas removed. New baselines: `/curation/summary` (nothing finished) and `curation-summary-run` (the whole run clicked through with a few decisions), both at 1280 and 390. | Same. |
| 12 | Evolution **(this PR)** | `/evolution` | `views/EvolutionView.jsx` | Under the Atlas station. The Timeline / Pivots tabs become one page. Signature piece: one bar per phase, height by conversations, each a button (`aria-pressed`) that selects the phase, with the pivots that happened in it marked underneath (pure `monthIndex` / `phaseRange` / `phaseOf`; a test holds the phases back to back and every pivot inside one). The selected phase shows its description, its share of the archive and links to its pivots. Pivots are `aria-expanded` buttons instead of clickable divs; the note is a labeled, controlled form (an emptied note removes it), and the topics a pivot touched open their timelines. Headline and lede computed from the fixtures; contrast raised throughout. New baselines: `/evolution` at 390, and `evolution-pivot` (an earlier phase selected, a pivot open with its note form) at 1280 and 390. | Same. |
| 13 | Connections | `/connections` | `views/ConnectionsView.jsx` | Under the Atlas station. | Same. |
| 14 | Belief Diffs | `/companion/diff` | `views/BeliefDiffsView.jsx` | Under the Companion station. | Same. |
| 15 | Digest | `/companion/digest` | `views/DigestView.jsx` | Under the Companion station. | Same. |
| 16 | Decision Archaeology | `/archaeology/:chain` | `views/DecisionArchaeology.jsx` | | Same. |
| 17 | Export | `/export` | `views/ExportPreview.jsx` | Moves into the header per principle 5. | Same. |
| 18 | Search | `/search` | `views/SearchView.jsx`, `components/CommandPalette.jsx` | One search surface (⌘K); the route redirects into it. | Same. |
| 19 | Rewind | `/companion/rewind` | `views/RewindMode.jsx` | | Same. |
| 20 | Overlays | dashboard | `components/BriefingCard.jsx`, `CompanionSidebar.jsx`, `GuidedTour.jsx`, `SyncOverlay.jsx` | The one remaining tour; sidebar and brief card on the scales. | Same. |
| 21 | Retire | | `tokens.js`, `base.js`, `shared.js` | Delete the tokens, keyframes and shared styles nothing uses any more; bump the footer to v7. | Lint green with the smaller palette. |

Twenty-one PRs. Small ones (9–11, 12–16) are an afternoon each; 1, 4, 5 and 7 are the
ones that set patterns and deserve a review pass before the next PR starts.

### The per-PR checklist

Every view PR carries the same body, so review is the same every time:

```
## View
<name> at <route>, file src/views/<File>.jsx

## Before / after
<the two baseline PNGs, side by side>

## Principles touched
<which of 1–7 this view exercises, and any amendment proposed>

## Verification
- [ ] npm run lint          (no new color literals; no shadowed imports)
- [ ] npm run test          (render + route tests)
- [ ] npm run test:e2e      (only this route's PNGs changed; the diff is attached)
- [ ] npm run sweep -- --compare   (every other route identical to main)
```

## Bugs found while building the safety net (fix inside the view's PR)

- `/topic/<id>/conversation/<n>` renders nothing (only the sidebar) when the fixture
  has no preview for that event. The timeline only links events that have one, so it is
  reachable only by URL, but a shared link to it is a blank page. → PR 6.
- `/curation/topics` uses `Math.random()` for confidence values, so it renders
  differently every load and cannot hold a baseline. → PR 8.
- ~~`useRouterSync` still carries two `exhaustive-deps` suppressions~~ → fixed in PR 1
  (router values read through a ref that a layout effect keeps current).
- ~~The footer says "Atlas · v5."~~ → fixed in PR 1.
- The screenshot tolerance was a ratio (`maxDiffPixelRatio: 0.002`), which let a
  changed word pass and left a stale baseline in place. → fixed in PR 3
  (`maxDiffPixels: 40`, and local runs never reuse a server).

## What v7 does NOT include

- New views or new fixtures. If a redesign needs a fixture field, add the field; do not
  add a feature.
- A backend, real ingestion, or real LLM calls (Step 0). What comes after, if anything, is proposed in
  [`V8_PLAN.md`](V8_PLAN.md): Atlas as a local MCP server, so conversations reach it
  without repeated exports.
- TypeScript, CSS files, Tailwind or a component library. The conventions in CLAUDE.md
  hold; the redesign is done with the token module and inline styles.

## Running the sequence with tinyclaw

[tinyclaw](https://github.com/jake0lawrence/tinyclaw) (the owner's fork of jlia0's
multi-agent, multi-channel assistant) runs teams of `claude` CLI agents in tmux, each
in its own workspace, talking to each other through a file queue and to the owner
through Telegram / Discord / WhatsApp. It has a cron-style `schedule` skill and an
`agent-browser` skill. That is the right shape for a 21-PR sequence of small,
same-shaped changes, provided the human gate stays where it is: the PR review.

**Team.** One team, `atlas`, three agents:

| Agent | Role | Reads | Writes |
|---|---|---|---|
| `atlas-lead` (leader) | Picks the next unchecked row in the table above, writes the view brief from the principles, hands off, reports back. | `V7_PLAN.md`, open PRs | the brief (a `[@atlas-coder: ...]` message), the Telegram summary |
| `atlas-coder` | Implements one view on a `claude/v7-<view>` branch, runs `npm run check`, updates the baseline, opens a draft PR with the checklist body. | the brief, `src/styles/*`, `src/views/<File>.jsx` | one view file, its PNGs, the PR |
| `atlas-reviewer` | Reads the PR diff and the screenshot diff, runs the sweep compare, answers with a review that names any principle violated. | the PR | a PR review (never a merge) |

**Loop.** The `schedule` skill fires `@atlas next view` nightly. The lead picks the row,
the coder ships a draft PR, the reviewer reviews it, the lead posts one Telegram line
with the PR link and the reviewer's verdict. The owner reads the PR on a phone in the
morning: approve and merge, or reply `@atlas-coder the nav should ...` and the coder
picks up the thread (tinyclaw keeps per-agent conversation state across restarts).

**Why the safety net had to come first.** An unattended agent PR is only reviewable
when the PR itself proves what it did. `npm run check` is the coder's definition of
done; the screenshot diff is the reviewer's evidence; the sweep compare is the proof
that no other route moved. Without those, a nightly PR is a nightly liability.

**What it needs.** A machine that stays on (tinyclaw lives in tmux, so a Mac mini or
a small VPS, not a laptop), the Claude Code CLI signed in, `gh` on the path for the
coder, a Telegram bot token, and a clone of this repo per agent workspace. Nothing in
the repo changes for it: the plan table is the queue, the checklist is the contract,
CI is the gate.

**What it should not do.** Merge. Touch two views in one PR. Skip a red check. Amend
the principles on its own: a principle change is a proposal in the PR body for the
owner to accept.
