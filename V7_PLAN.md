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
| Token module (`src/styles/tokens.js`, `shared.js`); no color literal outside it (lint-enforced) | this branch | done |
| Safety net: ESLint, a render test per view and per route, a Playwright screenshot baseline of the route table, CI | this branch | done |

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
   for its route to the baseline.

## The sequence

Order is by leverage: the shell first (everything sits in it), then the front door
(first impression), then the payoff (the v6 thesis), then the curation run (the v5
moat), then the secondary views, then the overlays. Each PR is one view file plus
its route's baseline PNGs; no PR touches two views.

| # | PR | Route | File | What changes | Done when |
|---|---|---|---|---|---|
| 1 | Shell + Nav | all | `App.jsx`, `components/Nav.jsx` | The three-station nav, header with sync + export, footer fixed, single tour entry point. Ratifies the principles above. | Render + route tests green; baseline updated for every route (the shell is in all of them); PR text records each principle as accepted or amended. |
| 2 | Onboarding | `/` | `views/OnboardingView.jsx` | The drop zones and persona picker become the pitch: one screen, one action. | Baseline for `/` at 1280 and 390. |
| 3 | Loading | `/loading` | `views/LoadingView.jsx` | The five-phase pipeline as the story of what Atlas does, on the motion budget. | Same. |
| 4 | Dashboard | `/dashboard` | `views/DashboardView.jsx` | Stat band, journey chart, knowledge map, staleness alerts on the type and spacing scales; empty state for a fresh atlas. | Same, plus palette/sidebar baselines. |
| 5 | Companion (Ask Atlas) | `/companion` | `views/AskAtlas.jsx` | The demo closer: response cards with citations, the contradiction panel, the source drawer. | Same. |
| 6 | Timeline + Drilldown | `/topic/:id`, `/topic/:id/conversation/:n` | `views/TimelineView.jsx`, `views/ConversationDrilldown.jsx` | Two views, one PR, because the drilldown is the timeline's detail state. Designed empty state for events without a preview. | Same. |
| 7 | Review Queue | `/curation` | `views/ReviewQueue.jsx` | The curation run, screen 1 of 5. Shared curation chrome (progress rail, keyboard hints) extracted to `components/` here and reused by 8–11. | Same. |
| 8 | Topic Curation | `/curation/topics` | `views/TopicCurationPanel.jsx` | Seed the random confidence values so the baseline is stable. | Same, and the sweep reports this route identical run to run. |
| 9 | Connection Validation | `/curation/connections` | `views/ConnectionValidation.jsx` | | Same. |
| 10 | Insight Review | `/curation/insights` | `views/InsightDecisionReview.jsx` | | Same. |
| 11 | Curation Summary | `/curation/summary` | `views/CurationSummary.jsx` | | Same. |
| 12 | Evolution | `/evolution` | `views/EvolutionView.jsx` | Under the Atlas station. | Same. |
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
- `useRouterSync` still carries two `eslint-disable-next-line react-hooks/exhaustive-deps`
  comments (the third was unused and is removed). CLAUDE.md says never suppress that
  rule. → PR 1, when the shell is open anyway.
- The footer says "Atlas · v5." → PR 21.

## What v7 does NOT include

- New views or new fixtures. If a redesign needs a fixture field, add the field; do not
  add a feature.
- A backend, real ingestion, or real LLM calls (Step 0).
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
