#!/usr/bin/env bash
# =============================================================================
# ATLAS v6 — GitHub Issue Creator
# =============================================================================
# Creates all feature issues from V6_PLAN.md in the jake0lawrence/atlas_ai repo.
#
# Theme: "Your Atlas Remembers" — Knowledge Companion + Thinking Changelog
#
# Prerequisites:
#   - gh CLI installed and authenticated (run: gh auth login)
#
# Usage:
#   chmod +x create_v6_issues.sh
#   ./create_v6_issues.sh
# =============================================================================

set -euo pipefail

REPO="jake0lawrence/atlas_ai"

echo "Creating ATLAS v6 issues in $REPO..."
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Create new labels (idempotent — skips if they already exist)
# ─────────────────────────────────────────────────────────────────────────────

echo "Ensuring labels exist..."
gh label create "v6"                   --repo "$REPO" --color "6F42C1" --description "Atlas v6 — Your Atlas Remembers"       2>/dev/null || true
gh label create "companion"            --repo "$REPO" --color "0969DA" --description "Knowledge Companion features"          2>/dev/null || true
gh label create "thinking-changelog"   --repo "$REPO" --color "BF3989" --description "Thinking Changelog features"           2>/dev/null || true
gh label create "architecture"         --repo "$REPO" --color "656D76" --description "Codebase architecture improvements"    2>/dev/null || true
# Reuse existing labels: P0, P1, P2, P3, feature, new-view, enhancement, ux, polish
echo "Labels ready."
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# P0 — Critical Demo Impact
# ─────────────────────────────────────────────────────────────────────────────

echo "[1/14] Creating: Ask Atlas — Conversational Knowledge Query..."
gh issue create --repo "$REPO" \
  --title "Companion: Implement Ask Atlas — Conversational Knowledge Query" \
  --label "P0,v6,feature,new-view,companion" \
  --body "$(cat <<'EOF'
## Overview

The marquee v6 feature. A **chat-like interface** where users query their own knowledge base and receive synthesized answers composed entirely of their own words, with citations back to source conversations.

This is the "holy shit, it actually knows me" demo moment.

## Requirements

### Interface
- **Chat input** at the bottom of a dedicated Companion view
- **Response cards** that synthesize across multiple conversations, each including:
  - **Synthesized answer** — Coherent paragraph, not raw excerpts
  - **Source citations** — Inline `[1]`, `[2]` references linking to source conversations
  - **Source panel** — Expandable sidebar showing actual conversation excerpts with highlighted relevant passages
  - **Confidence indicator** — How well-supported the answer is by the knowledge base
  - **Freshness warning** — If the answer relies on stale conversations (6+ months old)

### Pre-Built Demo Queries
- "What's my current thinking on serverless architecture?"
- "When did I decide to use TypeScript for CourtCollect?"
- "What are the tradeoffs I've identified with n8n vs. custom automation?"
- "Summarize my evolution on AI-assisted development"

### Demo Behavior
- Pre-built query/response pairs that showcase synthesis capability
- User types or selects from suggestion chips
- Response animates in with citations that link back to Conversation Drilldown view
- Custom queries show a tasteful "This is a demo" message
- Suggestion chips update based on current knowledge base context

## Priority
**P0** — Critical demo impact. This is the v6 centerpiece.

## Estimated Size
~300 lines

## References
- [V6_PLAN.md — Section 1](V6_PLAN.md)
EOF
)"

echo "[2/14] Creating: Belief Diffs — Side-by-Side Thinking Comparison..."
gh issue create --repo "$REPO" \
  --title "Thinking Changelog: Implement Belief Diffs View" \
  --label "P0,v6,feature,new-view,thinking-changelog" \
  --body "$(cat <<'EOF'
## Overview

Compare your position on a topic at two different points in time, rendered like a **code diff but for natural language**. Red-strikethrough for abandoned beliefs, green-highlighted for new positions.

## Requirements

### Interface
- **Two-column layout** — Left: earlier position, Right: current position
- **Diff rendering**:
  - Red-strikethrough lines = abandoned beliefs/positions
  - Green-highlighted lines = new positions/evolved thinking
  - Gray lines = unchanged beliefs (context)
- **Time selector** — Two date pickers or a range slider to choose comparison points
- **Topic filter** — Select which topic to diff

### Pre-Built Diffs (Demo Data)
- **AI Development Tools**: Early 2024 ("ChatGPT is sufficient for all coding tasks") vs. Late 2025 ("Claude for architecture, specialized models for specific tasks")
- **Automation Philosophy**: Mid 2024 ("Automate everything with no-code") vs. 2025 ("Strategic automation — automate the boring, hand-craft the critical")
- **CourtCollect Architecture**: Initial ("monolith with REST API") vs. current ("event-driven with specialized microservices")

### Visual Design
Inspired by GitHub's diff view but warmer — serif fonts for belief text, subtle background tinting (soft red/green) instead of harsh code-diff colors.

## Priority
**P0** — Critical demo impact

## Estimated Size
~200 lines

## References
- [V6_PLAN.md — Section 2](V6_PLAN.md)
EOF
)"

echo "[3/14] Creating: Monthly Thinking Digest..."
gh issue create --repo "$REPO" \
  --title "Thinking Changelog: Implement Monthly Thinking Digest" \
  --label "P0,v6,feature,new-view,thinking-changelog" \
  --body "$(cat <<'EOF'
## Overview

A **"Spotify Wrapped for your thinking"** — auto-generated monthly reports that synthesize how your knowledge graph evolved. Shows new topics, pivots, deepened expertise, and key decisions in a beautiful, scrollable card format.

## Requirements

### Digest Contents (Per Month)
- **New Topics Emerged** — Topics that appeared this month
- **Topics Deepened** — Topics with significant new conversation activity
- **Topics Gone Quiet** — Previously active topics that went dormant
- **Key Decisions Made** — Major decisions extracted from conversations
- **Pivots Detected** — Moments where thinking shifted direction
- **Connections Formed** — New cross-topic relationships discovered
- **Stat Line** — "47 conversations, 3 new topics, 2 pivots, 12 insights curated"

### Interface
- **Card-based timeline** — Scroll through months, each as a summary card
- **Current month** at top with a "generating..." animation
- **Expandable sections** — Click to see underlying conversations
- **Share button** — Generate a shareable card image (builds on v5 export)

### Demo Behavior
Pre-built digests for 3–4 months:
- **January 2026** — Heavy CourtCollect activity
- **December 2025** — Shift to Claude-native workflows
- **October 2025** — Automation deep-dive period

## Priority
**P0** — Critical demo impact

## Estimated Size
~200 lines

## References
- [V6_PLAN.md — Section 3](V6_PLAN.md)
EOF
)"

# ─────────────────────────────────────────────────────────────────────────────
# P1 — High Demo Impact
# ─────────────────────────────────────────────────────────────────────────────

echo "[4/14] Creating: Pre-flight Briefings..."
gh issue create --repo "$REPO" \
  --title "Companion: Implement Pre-flight Briefings — Context Cards" \
  --label "P1,v6,feature,companion" \
  --body "$(cat <<'EOF'
## Overview

Before starting a new AI conversation on a topic, Atlas generates a one-page **"here's what you already know" context card**. Shows past decisions, unresolved questions, and relevant connections. Prevents re-discovering things you already figured out.

## Requirements

### Briefing Card Contents
- **Topic summary** — One-paragraph synthesis of current position
- **Key decisions** — Bullet list of decisions made on this topic
- **Open questions** — Unresolved threads from past conversations
- **Relevant connections** — Related topics with one-line context each
- **Last activity** — When you last explored this topic and what you discussed
- **Suggested starting prompt** — Pre-written prompt that picks up where you left off

### Interface
- Accessible from any topic bubble/card via a **"Brief me"** button
- Renders as a modal overlay or slide-out panel
- **"Copy to clipboard"** button to paste briefing into a new AI conversation

### Demo Behavior
Pre-built briefings for 3–4 key topics. Clicking "Brief me" on CourtCollect shows a rich context card with project history, architectural decisions, and a suggested continuation prompt.

## Priority
**P1** — High demo impact

## Estimated Size
~150 lines

## References
- [V6_PLAN.md — Section 4](V6_PLAN.md)
EOF
)"

echo "[5/14] Creating: Decision Archaeology..."
gh issue create --repo "$REPO" \
  --title "Thinking Changelog: Implement Decision Archaeology" \
  --label "P1,v6,feature,thinking-changelog" \
  --body "$(cat <<'EOF'
## Overview

Click any current belief, decision, or practice and **trace the chain of conversations that led to it**. Like \`git blame\` for your thinking.

## Requirements

### Chain View
A vertical timeline showing:
- The **seed** — First conversation where this idea appeared
- **Supporting conversations** — Evidence that reinforced the decision
- **Challenging conversations** — Moments where the idea was questioned
- The **resolution** — Conversation where the final decision crystallized
- Each node links to the Conversation Drilldown view
- **Confidence annotation** — How well-supported each step is

### Visual Design
A branching timeline (like a simplified git graph) — main trunk is the decision's evolution, branches are supporting/challenging evidence.

### Entry Point
Click any decision or insight in the dashboard, timeline, or digest.

### Demo Behavior
Pre-built archaeology chains for 2–3 key decisions:
- **"Why TypeScript?"** — JS frustration → type safety conversation → team scalability argument → adoption decision
- **"Why event-driven architecture?"** — Monolith pain points → pub/sub research → prototype conversation → production commitment

## Priority
**P1** — High demo impact

## Estimated Size
~180 lines

## References
- [V6_PLAN.md — Section 5](V6_PLAN.md)
EOF
)"

echo "[6/14] Creating: Contradiction Detection..."
gh issue create --repo "$REPO" \
  --title "Companion: Implement Contradiction Detection" \
  --label "P1,v6,feature,companion" \
  --body "$(cat <<'EOF'
## Overview

Atlas flags when your recent conversations **contradict earlier decisions**, helping distinguish between intentional pivots and unconscious drift.

## Requirements

### Alert Types
- **Hard contradiction** — Direct reversal of a stated position
  - "In March you explicitly decided against microservices. Your last 3 conversations assume a microservices architecture."
- **Soft drift** — Gradual shift without acknowledgment
  - "Your early conversations emphasized no-code tools. Recent conversations are increasingly code-heavy."
- **Stale assumption** — Building on outdated context
  - "This conversation references your Airtable setup, but you migrated away 4 months ago."

### Interface
- **Alert cards** in the Companion view sidebar
- Each card shows:
  - The **earlier position** (with source link)
  - The **current position** (with source link)
  - **"Resolve" action**: Intentional Pivot / Updated My Thinking / Good Catch, Fix It
- Resolving a contradiction creates an entry in the Thinking Changelog

### Demo Behavior
Pre-populate 3–4 contradiction alerts at varying severity levels. Resolving them demonstrates how Atlas turns cognitive drift into conscious decisions.

## Priority
**P1** — High demo impact

## Estimated Size
~150 lines

## References
- [V6_PLAN.md — Section 6](V6_PLAN.md)
EOF
)"

echo "[7/14] Creating: Rewind Mode..."
gh issue create --repo "$REPO" \
  --title "Thinking Changelog: Implement Rewind Mode — Animated Knowledge Graph" \
  --label "P1,v6,feature,new-view,thinking-changelog" \
  --body "$(cat <<'EOF'
## Overview

A **timeline slider that replays your knowledge graph building itself chronologically**. Watch topics emerge, grow, connect, and fade in real-time animation. The most visually impressive feature in v6.

## Requirements

### Interface
- **Full-screen overlay** accessible from dashboard or Evolution view
- **Timeline scrubber** — Horizontal slider from first conversation to present
- **Play/Pause controls** — Auto-play at adjustable speed (1x, 2x, 5x)
- **Knowledge graph canvas** — Topics appear as dots, grow into sized circles, form connection lines, change color/opacity over time

### Animation Phases
1. **Genesis** (Early 2023) — First few topic dots appear, small and isolated
2. **Exploration** (Mid 2023) — Topics multiply, some grow faster
3. **Connection** (Late 2023) — Lines form between related topics
4. **Deepening** (2024) — Core topics grow large, peripheral ones stabilize
5. **Synthesis** (2025) — Dense connection network, topic merges visible
6. **Mastery** (2026) — Stable clusters with high confidence, clear expertise zones

### Running Stats
During playback, a running counter shows:
- Total conversations processed
- Active topics
- Connections formed
- Current month/year

### Demo Behavior
Full animation runs ~30 seconds at 5x speed. Pause at any point to explore the graph at that moment. Click a topic during pause to see its state at that date.

## Priority
**P1** — High demo impact

## Estimated Size
~250 lines

## References
- [V6_PLAN.md — Section 7](V6_PLAN.md)
EOF
)"

# ─────────────────────────────────────────────────────────────────────────────
# P2 — Medium Demo Impact
# ─────────────────────────────────────────────────────────────────────────────

echo "[8/14] Creating: Pivot Detection & Journaling..."
gh issue create --repo "$REPO" \
  --title "Thinking Changelog: Implement Pivot Detection & Journaling" \
  --label "P2,v6,feature,thinking-changelog" \
  --body "$(cat <<'EOF'
## Overview

Auto-detect when your thinking shifted on a topic and create annotatable **"pivot entries"** — turning unconscious changes into a documented decision journal.

## Requirements

### Pivot Entry Format
- **Before state** — Position/approach before the pivot
- **Trigger** — The conversation or event that caused the shift
- **After state** — New position/approach after the pivot
- **User annotation field** — "Changed my mind because..." (editable)
- **Impact assessment** — Which other decisions/topics this pivot affected

### Interface
- Pivots surface in the Monthly Digest and in topic timelines
- A dedicated **"Pivots" tab** in the Evolution view showing all detected pivots
- Annotation turns auto-detected pivots into a decision journal — for free

### Demo Behavior
Pre-built pivot entries for 3–4 key moments. One already annotated, two awaiting user annotation.

## Priority
**P2** — Medium demo impact

## Estimated Size
~120 lines

## References
- [V6_PLAN.md — Section 8](V6_PLAN.md)
EOF
)"

echo "[9/14] Creating: What Would Past-Me Say?..."
gh issue create --repo "$REPO" \
  --title "Companion: Implement 'What Would Past-Me Say?' — Historical Reasoning Recall" \
  --label "P2,v6,feature,companion" \
  --body "$(cat <<'EOF'
## Overview

Select a current decision point and Atlas surfaces your reasoning from **analogous past decisions**. Like consulting a wiser version of yourself.

## Requirements

### Interface
- **Entry point**: A "Past perspective" button on any decision or insight card
- **Response format**: A card showing:
  - The **analogous past decision** Atlas found
  - **How you reasoned** last time (excerpt from conversation)
  - **What was different** then vs. now (context comparison)
  - **Outcome** — What happened after the past decision (if known)
- Multiple past analogies may be shown, ranked by relevance

### Demo Behavior
Pre-built analogy pairs:
- Current: "Should I use a managed database?" → Past: "6 months ago you evaluated managed vs. self-hosted for CourtCollect — chose managed because..."
- Current: "Is this automation worth building?" → Past: "Last year you built a similar automation. Outcome: saved 3 hours/week but maintenance was higher than expected."

## Priority
**P2** — Medium demo impact

## Estimated Size
~120 lines

## References
- [V6_PLAN.md — Section 9](V6_PLAN.md)
EOF
)"

echo "[10/14] Creating: Companion Sidebar..."
gh issue create --repo "$REPO" \
  --title "Companion: Implement Persistent Companion Sidebar" \
  --label "P2,v6,feature,companion,ux" \
  --body "$(cat <<'EOF'
## Overview

A **collapsible sidebar** that lives alongside all views, providing contextual knowledge suggestions based on what you're currently viewing.

## Requirements

### Contextual Behavior by View
- **Dashboard**: "You haven't visited [Topic] in 3 months — here's what's changed"
- **Timeline**: "This event connects to a similar event in [Other Topic]"
- **Connections**: "Atlas found a potential new connection between X and Y"
- **Evolution**: "Your thinking on [Topic] has shifted 3 times — see the diffs"
- **Conversation Drilldown**: "This contradicts a decision you made in [Date]"

### Interface
- **Collapsible** — Toggle with Cmd+/ or sidebar button
- **Contextual cards** — 2–3 suggestion cards that update as you navigate
- **Quick actions** — Each card has relevant actions (View diff, Ask Atlas, Brief me)
- **Minimized state** — When collapsed, shows a small badge with suggestion count

### Demo Behavior
Pre-built contextual suggestions for each view. Navigating between views triggers smooth card transitions in the sidebar.

## Priority
**P2** — Medium demo impact

## Estimated Size
~150 lines

## References
- [V6_PLAN.md — Section 10](V6_PLAN.md)
EOF
)"

# ─────────────────────────────────────────────────────────────────────────────
# P3 — Architecture & Polish
# ─────────────────────────────────────────────────────────────────────────────

echo "[11/14] Creating: Component Architecture Refactor..."
gh issue create --repo "$REPO" \
  --title "Architecture: Break the Monolith — Component File Structure" \
  --label "P3,v6,architecture,enhancement" \
  --body "$(cat <<'EOF'
## Overview

Split the monolithic `App.jsx` (4,490 lines) into a proper component architecture. v6 features demand better organization — the single-file approach served v4/v5 well for rapid prototyping, but the Companion features need clean separation of concerns.

## Requirements

### Target Structure
```
src/
├── App.jsx                    # Root: routing + global state only
├── views/                     # One file per view/page
│   ├── OnboardingView.jsx
│   ├── LoadingView.jsx
│   ├── CurationView.jsx
│   ├── DashboardView.jsx
│   ├── TimelineView.jsx
│   ├── ConversationDrilldown.jsx
│   ├── ConnectionsView.jsx
│   ├── EvolutionView.jsx
│   ├── SearchView.jsx
│   ├── ExportView.jsx
│   ├── CompanionView.jsx      # NEW
│   ├── BeliefDiffsView.jsx    # NEW
│   ├── DigestView.jsx         # NEW
│   └── RewindView.jsx         # NEW
├── components/                # Shared UI components
├── data/                      # All simulated data constants
├── hooks/                     # Custom React hooks
└── styles/                    # Design tokens + animations
```

### Constraints
- **Net-zero lines** — This is a reorganization, not a rewrite
- **No behavior changes** — App should function identically after refactor
- **Incremental** — Can be done view-by-view, doesn't need to be one big bang

## Priority
**P3** — Foundation for all v6 features

## Estimated Size
~0 net new lines (reorganization)

## References
- [V6_PLAN.md — Architecture Section](V6_PLAN.md)
EOF
)"

echo "[12/14] Creating: State Management..."
gh issue create --repo "$REPO" \
  --title "Architecture: Add Centralized State Management" \
  --label "P3,v6,architecture,enhancement" \
  --body "$(cat <<'EOF'
## Overview

Replace scattered `useState` calls with a lightweight centralized store. The Companion features require shared state across views (query history, cached responses, sidebar suggestions).

## Requirements

### Recommended: Zustand
- Minimal boilerplate, React-native, no providers needed
- ~1KB gzipped

### State Slices
- **navigation** — Current view, history stack, sidebar toggle
- **knowledgeBase** — Topics, connections, insights (shared across all views)
- **curation** — Review queue state, curation progress
- **companion** — Query history, cached responses, sidebar context suggestions

### Alternative: React Context + useReducer
- Zero additional dependencies
- Slightly more boilerplate but keeps the prototype dependency-free

## Priority
**P3** — Foundation for Companion features

## Estimated Size
~100 lines

## References
- [V6_PLAN.md — Architecture Section](V6_PLAN.md)
EOF
)"

echo "[13/14] Creating: URL Routing..."
gh issue create --repo "$REPO" \
  --title "Architecture: Add URL Routing with React Router" \
  --label "P3,v6,architecture,enhancement" \
  --body "$(cat <<'EOF'
## Overview

Add React Router so views are **deep-linkable**. Critical for demo scenarios where you want to jump directly to a specific feature or share a view with stakeholders.

## Requirements

### Route Map
- \`/\` → Onboarding
- \`/dashboard\` → Dashboard
- \`/topic/:id\` → Timeline
- \`/topic/:id/conversation/:id\` → Conversation Drilldown
- \`/companion\` → Ask Atlas
- \`/companion/diff/:topic\` → Belief Diffs
- \`/companion/digest/:month\` → Monthly Digest
- \`/companion/rewind\` → Rewind Mode
- \`/evolution\` → Evolution
- \`/connections\` → Connections
- \`/export\` → Export

### Behavior
- Browser back/forward should work naturally
- Nav bar highlights current route
- Command palette (Cmd+K) navigates via router

## Priority
**P3** — Foundation for demo workflow

## Estimated Size
~80 lines

## References
- [V6_PLAN.md — Architecture Section](V6_PLAN.md)
EOF
)"

echo "[14/14] Creating: V6 Guided Tour Extension..."
gh issue create --repo "$REPO" \
  --title "Add V6 Guided Tour Extension — Companion Feature Tour" \
  --label "P3,v6,feature,ux" \
  --body "$(cat <<'EOF'
## Overview

Extend the existing v5 guided tour to cover the new Companion and Thinking Changelog features.

## Requirements

### New Tour Steps
- **Ask Atlas** — Show the query interface and demonstrate a pre-built query
- **Belief Diffs** — Walk through a side-by-side comparison
- **Monthly Digest** — Highlight the "Spotify Wrapped" summary cards
- **Rewind Mode** — Trigger the animated graph replay

### "What's New in v6" Mini-Tour
- Shorter tour specifically for returning users
- Focuses only on features new to v6
- Auto-offered when v5 users return

### Companion Sidebar Introduction
- Highlight the sidebar on first encounter
- Explain contextual suggestions and quick actions

## Priority
**P3** — Medium demo impact

## Estimated Size
~80 lines

## References
- [V6_PLAN.md — Section 14](V6_PLAN.md)
EOF
)"

echo ""
echo "============================================="
echo "  All 14 v6 issues created successfully!"
echo "============================================="
echo ""
echo "Summary:"
echo "  P0 (Critical):     3 issues  — Ask Atlas, Belief Diffs, Monthly Digest"
echo "  P1 (High):         4 issues  — Pre-flight Briefings, Decision Archaeology, Contradiction Detection, Rewind Mode"
echo "  P2 (Medium):       3 issues  — Pivot Journaling, Past-Me Recall, Companion Sidebar"
echo "  P3 (Architecture): 4 issues  — Component Refactor, State Management, URL Routing, Tour Extension"
echo ""
echo "New labels created: v6, companion, thinking-changelog, architecture"
echo ""
echo "View all issues: https://github.com/$REPO/issues"
