# ATLAS v6 — "Your Atlas Remembers"

## The Core Problem with v5

v5 nailed the curation story — the user shapes their knowledge base, not the AI. But
after curation is done, the knowledge just... sits there. A beautifully organized library
nobody visits. The curated knowledge graph is an artifact, not a tool.

> "Curation without application is just sophisticated filing."

v5 proves the moat (human judgment is the product). v6 proves the **payoff** — that all
that curation effort compounds into something you actively use. The knowledge flywheel
closes: curation makes the companion smarter, and the companion's usefulness motivates
more curation.

---

## The V6 Thesis

Two directions converge into one narrative:

**Direction A — Knowledge Companion**: Your curated knowledge becomes queryable.
Atlas talks back, surfaces what you know when you need it, and prevents you from
re-discovering things you already figured out.

**Direction C — Thinking Changelog**: Your intellectual evolution becomes visible
and navigable. Diff your thinking, trace decision chains, watch your knowledge
graph grow over time, and catch when your thinking drifts from earlier decisions.

Combined pitch:

> **v5**: "You're in control of every insight."
> **v6**: "Your knowledge compounds — Atlas remembers so you don't have to."

---

## Updated App Flow

```
v5:  Onboarding → Loading → Curation → Dashboard
v6:  Onboarding → Loading → Curation → Dashboard ⟷ Companion
                                                      ↑
                                                 THE PAYOFF
```

The Companion isn't a linear step — it's a persistent layer accessible from anywhere.
The dashboard shows you what you know. The companion helps you **use** what you know.

---

## v6 Feature Set

### 1. Ask Atlas — Conversational Knowledge Query (PRIMARY)

The marquee feature. A chat-like interface where you query your own knowledge base.

#### Interface
- **Chat input** at the bottom of a dedicated Companion view
- **Response cards** that synthesize across multiple conversations
- Each response includes:
  - **Synthesized answer** — Written as a coherent paragraph, not raw excerpts
  - **Source citations** — Inline references like [1], [2] linking to source conversations
  - **Source panel** — Expandable sidebar showing the actual conversation excerpts that
    informed the answer, with highlights on the relevant passages
  - **Confidence indicator** — How well-supported the answer is by the knowledge base
  - **Freshness warning** — If the answer relies on stale conversations (6+ months old)

#### Demo Queries (Pre-Built)
- "What's my current thinking on serverless architecture?"
- "When did I decide to use TypeScript for CourtCollect?"
- "What are the tradeoffs I've identified with n8n vs. custom automation?"
- "Summarize my evolution on AI-assisted development"

#### Demo Behavior
Pre-built query/response pairs that showcase the synthesis capability. The user types
(or selects from suggestions), and the response animates in with citations that link
back to the Conversation Drilldown view. Typing a custom query shows a tasteful
"This is a demo — in production, Atlas would search your full knowledge base" message.

#### Why This Matters
This is the "holy shit, it actually knows me" moment. The user realizes their curation
effort wasn't just organizational busywork — it built a personal knowledge assistant
that quotes their own words back to them. This is the demo closer.

---

### 2. Belief Diffs — Side-by-Side Thinking Comparison (NEW VIEW)

Compare your position on a topic at two different points in time, rendered like a
code diff but for natural language.

#### Interface
- **Two-column layout** — Left: earlier position, Right: current position
- **Diff rendering**:
  - Red-strikethrough lines = abandoned beliefs or positions
  - Green-highlighted lines = new positions or evolved thinking
  - Gray lines = unchanged beliefs (context)
- **Time selector** — Two date pickers or a range slider to choose comparison points
- **Topic filter** — Select which topic to diff

#### Demo Data
Pre-built diffs for 2-3 topics:
- **AI Development Tools**: Early 2024 ("ChatGPT is sufficient for all coding tasks")
  vs. Late 2025 ("Claude for architecture, specialized models for specific tasks")
- **Automation Philosophy**: Mid 2024 ("Automate everything with no-code tools")
  vs. 2025 ("Strategic automation — automate the boring, hand-craft the critical")
- **CourtCollect Architecture**: Initial design ("monolith with REST API")
  vs. current ("event-driven with specialized microservices")

#### Visual Design
Inspired by GitHub's diff view but warmer — serif fonts for the belief text, with
subtle background tinting (soft red/green) instead of harsh code-diff colors.

---

### 3. Monthly Thinking Digest — Auto-Generated Knowledge Summary (NEW VIEW)

A "Spotify Wrapped for your thinking" — monthly or quarterly auto-generated reports
that synthesize how your knowledge graph evolved.

#### Digest Contents
Each digest includes:
- **New Topics Emerged** — Topics that appeared this month
- **Topics Deepened** — Topics with significant new conversation activity
- **Topics Gone Quiet** — Previously active topics that went dormant
- **Key Decisions Made** — Major decisions extracted from conversations this period
- **Pivots Detected** — Moments where thinking shifted direction
- **Connections Formed** — New cross-topic relationships discovered
- **Stat Line** — "47 conversations, 3 new topics, 2 pivots, 12 insights curated"

#### Interface
- **Card-based timeline** — Scroll through months, each as a beautiful summary card
- **Current month** at top, with a "generating..." animation to show it's live
- **Expandable sections** — Click any section to see the underlying conversations
- **Share button** — Generate a shareable card image (building on v5 export)

#### Demo Behavior
Pre-built digests for 3-4 months showing realistic evolution. January 2026 shows
heavy CourtCollect activity. December 2025 shows the shift to Claude-native workflows.
October 2025 shows the automation deep-dive period.

---

### 4. Pre-flight Briefings — Context Cards Before Conversations

Before starting a new AI conversation on a topic, Atlas generates a one-page
"here's what you already know" context card.

#### Briefing Card Contents
- **Topic summary** — One-paragraph synthesis of your current position
- **Key decisions** — Bullet list of decisions you've made on this topic
- **Open questions** — Unresolved threads Atlas detected in past conversations
- **Relevant connections** — Other topics that relate (with one-line context each)
- **Last activity** — When you last explored this topic and what you discussed
- **Suggested starting prompt** — A pre-written prompt that picks up where you left off

#### Interface
- Accessible from any topic bubble or topic card via a "Brief me" button
- Renders as a modal overlay or slide-out panel
- "Copy to clipboard" button to paste the briefing into a new AI conversation

#### Demo Behavior
Pre-built briefings for 3-4 key topics. Clicking "Brief me" on CourtCollect shows
a rich context card with the project's history, key architectural decisions, and
a suggested prompt like: "Continue from where we left off on the event processing
pipeline — last time we discussed moving to a pub/sub model..."

---

### 5. Decision Archaeology — Trace the Chain of Reasoning

Click any current belief, decision, or practice and trace the chain of conversations
that led to it. Like `git blame` for your thinking.

#### Interface
- **Entry point**: Click any decision or insight in the dashboard, timeline, or digest
- **Chain view**: A vertical timeline showing:
  - The **seed** — First conversation where this idea appeared
  - **Supporting conversations** — Evidence that reinforced the decision
  - **Challenging conversations** — Moments where the idea was questioned
  - The **resolution** — The conversation where the final decision crystallized
- Each node in the chain links to the Conversation Drilldown view
- **Confidence annotation** — How well-supported each step in the chain is

#### Visual Design
A branching timeline (like a simplified git graph) where the main trunk is the
decision's evolution and branches are supporting/challenging evidence.

#### Demo Behavior
Pre-built archaeology chains for 2-3 key decisions:
- "Why TypeScript?" — Traces from initial JS frustration → type safety conversation
  → team scalability argument → final adoption decision
- "Why event-driven architecture?" — Traces from monolith pain points → pub/sub
  research → prototype conversation → production commitment

---

### 6. Contradiction Detection — Flag Thinking Drift

Atlas flags when your recent conversations contradict earlier decisions, helping you
distinguish between intentional pivots and unconscious drift.

#### Alert Types
- **Hard contradiction** — Direct reversal of a stated position
  - "In March you explicitly decided against microservices. Your last 3 conversations
    assume a microservices architecture."
- **Soft drift** — Gradual shift without acknowledgment
  - "Your early conversations emphasized no-code tools. Recent conversations are
    increasingly code-heavy. Intentional evolution?"
- **Stale assumption** — Building on outdated context
  - "This conversation references your Airtable setup, but you migrated away from
    Airtable 4 months ago."

#### Interface
- **Alert cards** in the Companion view sidebar
- Each card shows:
  - The **earlier position** (with source link)
  - The **current position** (with source link)
  - A **"Resolve" action**: Intentional Pivot / Updated My Thinking / Good Catch, Fix It
- Resolving a contradiction creates an entry in the Thinking Changelog

#### Demo Behavior
Pre-populate 3-4 contradiction alerts at varying severity levels. Resolving them
demonstrates how Atlas turns cognitive drift into conscious decisions.

---

### 7. Rewind Mode — Animated Knowledge Graph Timeline

A timeline slider that replays your knowledge graph building itself chronologically.
Watch topics emerge, grow, connect, and fade in real-time animation.

#### Interface
- **Full-screen overlay** accessible from the dashboard or Evolution view
- **Timeline scrubber** — Horizontal slider from first conversation to present
- **Play/Pause controls** — Auto-play at adjustable speed (1x, 2x, 5x)
- **Knowledge graph canvas** — Topics appear as dots, grow into sized circles,
  form connection lines, and change color/opacity over time

#### Animation Phases
As the slider moves forward:
1. **Genesis** (Early 2023) — First few topic dots appear, small and isolated
2. **Exploration** (Mid 2023) — Topics multiply, some grow faster than others
3. **Connection** (Late 2023) — Lines start forming between related topics
4. **Deepening** (2024) — Core topics grow large, peripheral ones stabilize
5. **Synthesis** (2025) — Dense connection network, topic merges visible
6. **Mastery** (2026) — Stable clusters with high confidence, clear expertise zones

#### Running Stats
During playback, a running counter shows:
- Total conversations processed
- Active topics
- Connections formed
- Current month/year

#### Demo Behavior
Full animation runs ~30 seconds at 5x speed. Can be paused at any point to
explore the graph at that moment in time. Clicking a topic during pause shows
what it looked like at that date.

---

### 8. Pivot Detection & Journaling

Auto-detect when your thinking shifted on a topic and create annotatable "pivot entries."

#### Detection Logic (Simulated)
Atlas identifies pivots when:
- Sentiment/stance on a topic reverses within a short window
- A "decision" conversation is followed by conversations that contradict it
- Language patterns shift (e.g., from "we should" to "we shouldn't")

#### Pivot Entry Format
Each pivot entry includes:
- **Before state** — Your position/approach before the pivot
- **Trigger** — The conversation or event that caused the shift
- **After state** — Your new position/approach
- **User annotation field** — "Changed my mind because..." (editable)
- **Impact assessment** — Which other decisions/topics this pivot affected

#### Interface
- Pivots surface in the Monthly Digest and in topic timelines
- A dedicated "Pivots" tab in the Evolution view showing all detected pivots
- Annotation turns auto-detected pivots into a decision journal — for free

#### Demo Behavior
Pre-built pivot entries for 3-4 key moments, with one already annotated and
two awaiting user annotation.

---

### 9. "What Would Past-Me Say?" — Historical Reasoning Recall

Select a current decision point and Atlas surfaces your reasoning from analogous
past decisions.

#### Interface
- **Entry point**: A "Past perspective" button on any decision or insight card
- **Response format**: A card showing:
  - The **analogous past decision** Atlas found
  - **How you reasoned** last time (excerpt from conversation)
  - **What was different** then vs. now (context comparison)
  - **Outcome** — If known, what happened after the past decision
- Multiple past analogies may be shown, ranked by relevance

#### Demo Behavior
Pre-built analogy pairs:
- Current: "Should I use a managed database for the new project?" →
  Past: "6 months ago you evaluated managed vs. self-hosted for CourtCollect,
  chose managed because..." (with the actual reasoning conversation linked)
- Current: "Is this automation worth building?" →
  Past: "Last year you built a similar automation for X. Outcome: saved 3 hours/week
  but maintenance cost was higher than expected."

---

### 10. Companion Sidebar — Persistent Knowledge Assistant Panel

A collapsible sidebar that lives alongside all views, providing contextual
knowledge suggestions based on what you're currently viewing.

#### Behavior by View
- **Dashboard**: "You haven't visited [Topic] in 3 months — here's what's changed"
- **Timeline**: "This event connects to a similar event in [Other Topic]"
- **Connections**: "Atlas found a potential new connection between X and Y"
- **Evolution**: "Your thinking on [Topic] has shifted 3 times — see the diffs"
- **Conversation Drilldown**: "This contradicts a decision you made in [Date]"

#### Interface
- **Collapsible** — Toggle with a keyboard shortcut (Cmd+/) or sidebar button
- **Contextual cards** — 2-3 suggestion cards that update as you navigate
- **Quick actions** — Each card has relevant actions (View diff, Ask Atlas, Brief me)
- **Minimized state** — When collapsed, shows a small badge with suggestion count

#### Demo Behavior
Pre-built contextual suggestions for each view. Navigating between views triggers
smooth card transitions in the sidebar.

---

## Architecture: Breaking the Monolith

v6 is the right moment to restructure the codebase. The single 4,490-line App.jsx
served v4 and v5 well as a rapid prototype, but v6's Companion features demand
better organization.

### 11. Component Architecture Refactor

```
src/
├── App.jsx                    # Root component, routing, global state
├── views/
│   ├── OnboardingView.jsx
│   ├── LoadingView.jsx
│   ├── CurationView.jsx      # Contains all curation sub-components
│   ├── DashboardView.jsx
│   ├── TimelineView.jsx
│   ├── ConversationDrilldown.jsx
│   ├── ConnectionsView.jsx
│   ├── EvolutionView.jsx
│   ├── SearchView.jsx
│   ├── ExportView.jsx
│   ├── CompanionView.jsx      # NEW — Ask Atlas main view
│   ├── BeliefDiffsView.jsx    # NEW — Side-by-side thinking comparison
│   ├── DigestView.jsx         # NEW — Monthly thinking digests
│   └── RewindView.jsx         # NEW — Animated knowledge graph replay
├── components/
│   ├── Nav.jsx
│   ├── CommandPalette.jsx
│   ├── CompanionSidebar.jsx   # NEW — Persistent knowledge panel
│   ├── TopicBubble.jsx
│   ├── StatCard.jsx
│   ├── FreshnessBadge.jsx
│   ├── ConfidenceBadge.jsx
│   ├── GuidedTour.jsx
│   └── ...
├── data/
│   ├── topics.js
│   ├── connections.js
│   ├── conversations.js
│   ├── timeline.js
│   ├── digests.js             # NEW — Monthly digest data
│   ├── diffs.js               # NEW — Belief diff data
│   ├── contradictions.js      # NEW — Contradiction detection data
│   └── companion-responses.js # NEW — Pre-built Ask Atlas responses
├── hooks/
│   ├── useWindowSize.js
│   ├── useSound.js
│   └── useCompanionContext.js  # NEW — Contextual sidebar logic
├── store/
│   └── index.js               # Zustand or Context+Reducer
└── styles/
    ├── theme.js               # Design tokens, colors, typography
    └── animations.js          # Shared animation definitions
```

### 12. State Management

Move from scattered `useState` to a lightweight store:
- **Zustand** (preferred — minimal boilerplate, React-native)
- Or **React Context + useReducer** (zero dependencies)

Key state slices:
- `navigation` — Current view, history, sidebar state
- `knowledgeBase` — Topics, connections, insights (shared across views)
- `curation` — Review queue state, curation progress
- `companion` — Query history, cached responses, sidebar suggestions

### 13. URL Routing

Add React Router for deep-linkable views:
- `/` → Onboarding
- `/dashboard` → Dashboard
- `/topic/:id` → Timeline
- `/topic/:id/conversation/:id` → Drilldown
- `/companion` → Ask Atlas
- `/companion/diff/:topic` → Belief Diffs
- `/companion/digest/:month` → Monthly Digest
- `/companion/rewind` → Rewind Mode
- `/evolution` → Evolution
- `/connections` → Connections
- `/export` → Export

### 14. V6 Guided Tour Extension

Extend the existing guided tour to cover Companion features:
- New tour steps for Ask Atlas, Belief Diffs, Digest, and Rewind
- "What's New in v6" mini-tour for returning users
- Highlight the Companion Sidebar on first encounter

---

## Implementation Priority

| Priority | # | Feature                          | Lines (est.) | Demo Impact |
|----------|---|----------------------------------|-------------|-------------|
| P0       | 1 | Ask Atlas — Knowledge Query      | ~300        | Critical    |
| P0       | 2 | Belief Diffs — Thinking Comparison | ~200      | Critical    |
| P0       | 3 | Monthly Thinking Digest          | ~200        | Critical    |
| P1       | 4 | Pre-flight Briefings             | ~150        | High        |
| P1       | 5 | Decision Archaeology             | ~180        | High        |
| P1       | 6 | Contradiction Detection          | ~150        | High        |
| P1       | 7 | Rewind Mode                      | ~250        | High        |
| P2       | 8 | Pivot Detection & Journaling     | ~120        | Medium      |
| P2       | 9 | "What Would Past-Me Say?"        | ~120        | Medium      |
| P2       | 10| Companion Sidebar                | ~150        | Medium      |
| P3       | 11| Component Architecture Refactor  | ~0 net*     | Foundation  |
| P3       | 12| State Management (Zustand)       | ~100        | Foundation  |
| P3       | 13| URL Routing (React Router)       | ~80         | Foundation  |
| P3       | 14| V6 Guided Tour Extension         | ~80         | Medium      |

*Refactor is net-zero lines — moves existing code, doesn't add.*

**Estimated total new code**: ~2,080 lines → v6 prototype at ~6,500 lines
(post-refactor, distributed across ~30 files instead of 1).

---

## What v6 Does NOT Include (Deferred)

- Real LLM-powered query answering (demo uses pre-built responses)
- Actual NLP-based contradiction detection (simulated with curated data)
- Real diff algorithm for beliefs (pre-built comparison data)
- Backend / database integration (still frontend-only prototype)
- Multi-user / team features (Direction E — potential v7)
- Metacognition analytics (Direction F — potential v7)
- Mobile app or browser extension
- Real Obsidian sync (still export-only)

---

## The Pitch Shift

| Version | Pitch | User Feels |
|---------|-------|------------|
| **v4**  | "Look at your conversations visualized" | "Cool, that's pretty" |
| **v5**  | "You're in control of every insight" | "I own this knowledge" |
| **v6**  | "Your knowledge compounds — Atlas remembers so you don't have to" | "I can't work without this" |

v5 proved the moat. v6 proves the **addiction loop**. The curated knowledge becomes
something you actively consult, something that saves you time, something that catches
your blind spots. The flywheel:

```
Better curation → Smarter companion → More usage → More conversations →
More to curate → Better curation → ...
```

That's the story. Atlas isn't a dashboard. It isn't a filing system. **It's your
memory, externalized.**

*This is your mind, remembered.*
