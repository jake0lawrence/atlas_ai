#!/usr/bin/env bash
# =============================================================================
# ATLAS v5 — GitHub Issue Creator
# =============================================================================
# Creates all feature issues from V5_PLAN.md in the jake0lawrence/atlas_ai repo.
#
# Prerequisites:
#   - gh CLI installed and authenticated (run: gh auth login)
#
# Usage:
#   chmod +x create_v5_issues.sh
#   ./create_v5_issues.sh
# =============================================================================

set -euo pipefail

REPO="jake0lawrence/atlas_ai"

echo "Creating ATLAS v5 issues in $REPO..."
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# Create labels (idempotent — skips if they already exist)
# ─────────────────────────────────────────────────────────────────────────────

echo "Ensuring labels exist..."
gh label create "P0"                  --repo "$REPO" --color "B60205" --description "Critical — must have for demo"        2>/dev/null || true
gh label create "P1"                  --repo "$REPO" --color "D93F0B" --description "High — important for demo impact"     2>/dev/null || true
gh label create "P2"                  --repo "$REPO" --color "FBCA04" --description "Medium — nice to have for demo"       2>/dev/null || true
gh label create "P3"                  --repo "$REPO" --color "0E8A16" --description "Low — polish and stretch goals"       2>/dev/null || true
gh label create "feature"             --repo "$REPO" --color "1D76DB" --description "New feature"                          2>/dev/null || true
gh label create "curation-pipeline"   --repo "$REPO" --color "7057FF" --description "Curation Pipeline (v5 centerpiece)"   2>/dev/null || true
gh label create "new-view"            --repo "$REPO" --color "006B75" --description "New view / page"                      2>/dev/null || true
gh label create "enhancement"         --repo "$REPO" --color "A2EEEF" --description "Enhancement to existing functionality" 2>/dev/null || true
gh label create "ux"                  --repo "$REPO" --color "D4C5F9" --description "UX / interaction design"              2>/dev/null || true
gh label create "polish"              --repo "$REPO" --color "F9D0C4" --description "Visual polish and micro-interactions"  2>/dev/null || true
echo "Labels ready."
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# P0 — Critical Demo Impact
# ─────────────────────────────────────────────────────────────────────────────

echo "[1/13] Creating: 1A. Review Queue..."
gh issue create --repo "$REPO" \
  --title "Curation Pipeline: Implement Review Queue (1A)" \
  --label "P0,feature,curation-pipeline" \
  --body "$(cat <<'EOF'
## Overview

Implement the **Review Queue** — the centerpiece of the v5 curation pipeline. After the loading sequence completes its five phases, v5 inserts a curation step before the dashboard reveal. The Review Queue is a dedicated view where AI-classified items are presented for human review.

## Requirements

### Layout
Three columns or a card-stack interface:
- **Left**: Raw AI classification (topic assignment, confidence score, extracted entities)
- **Center**: The source conversation snippet (the actual user question / AI response)
- **Right**: Action panel (Approve / Edit / Reject / Skip)

### Per-Item Display
Each item shows:
- **Confidence badge** — High (90%+ green), Medium (70–89% amber), Low (<70% red)
- **Topic assignment** with topic color/icon
- **Extracted entities** as tags (tools, people, concepts)
- **Decision/insight flag** if the AI detected one

### Demo Behavior
- Pre-populate with ~8–10 review items at varying confidence levels
- High-confidence items auto-approve with a subtle animation
- Medium/low items pause for user interaction
- Queue drains as items are reviewed, with a satisfying progress indicator

## Priority
**P0** — Critical demo impact

## Estimated Size
~200 lines

## References
- [V5_PLAN.md — Section 1A](../V5_PLAN.md)
EOF
)"

echo "[2/13] Creating: 1B. Topic Curation Panel..."
gh issue create --repo "$REPO" \
  --title "Curation Pipeline: Implement Topic Curation Panel (1B)" \
  --label "P0,feature,curation-pipeline" \
  --body "$(cat <<'EOF'
## Overview

After initial review in the Review Queue, show a **Topic Curation Panel** where users can organize, merge, split, and rename AI-generated topics.

## Requirements

### User Actions
- **Merge topics** — Drag one topic onto another to combine (e.g., "n8n & Airtable" onto "AI Automation")
- **Split topics** — Break a broad topic like "Web Development" into "Frontend" and "DevOps"
- **Rename topics** — Edit AI-generated labels (e.g., "Gov Tech & Policy" → "Public Sector Technology")
- **Adjust topic colors** — Pick from a curated palette or let Atlas assign
- **Set importance** — Star/pin topics that matter most to the user

### Visual Design
A grid of topic cards with drag-and-drop merge targets. Each card shows:
- Conversation count
- Confidence score
- Mini-sparkline of activity over time

## Priority
**P0** — Critical demo impact

## Estimated Size
~150 lines

## References
- [V5_PLAN.md — Section 1B](../V5_PLAN.md)
EOF
)"

echo "[3/13] Creating: 1E. Curation Summary & Confidence Dashboard..."
gh issue create --repo "$REPO" \
  --title "Curation Pipeline: Implement Curation Summary & Confidence Dashboard (1E)" \
  --label "P0,feature,curation-pipeline" \
  --body "$(cat <<'EOF'
## Overview

After curation is complete, show a **summary screen** before entering the dashboard. This is the emotional payoff moment — the transition from "AI did something with my data" to "I shaped my knowledge base."

## Requirements

### Summary Metrics
- **X items reviewed, Y approved, Z edited, W rejected**
- **Overall knowledge base confidence score** (aggregate of all classifications)
- **"Your atlas is now human-verified"** — emotional payoff moment

### Before/After Comparison
Show how curation improved the knowledge graph:
- Topics merged
- Connections added
- Classifications corrected

### Updated App Flow
Replaces the current instant transition from loading → dashboard:
```
v4:  Onboarding → Loading → Dashboard
v5:  Onboarding → Loading → Curation → Dashboard
```

## Priority
**P0** — Critical demo impact

## Estimated Size
~100 lines

## References
- [V5_PLAN.md — Section 1E](../V5_PLAN.md)
EOF
)"

# ─────────────────────────────────────────────────────────────────────────────
# P1 — High Demo Impact
# ─────────────────────────────────────────────────────────────────────────────

echo "[4/13] Creating: 2. Conversation Drilldown View..."
gh issue create --repo "$REPO" \
  --title "Add Conversation Drilldown View" \
  --label "P1,feature,new-view" \
  --body "$(cat <<'EOF'
## Overview

v4 has topic timelines but you can never see an actual *conversation*. v5 adds the ability to click any timeline event and see a **conversation preview**.

## Requirements

### Thread View
- Alternating user/AI message bubbles
- **Highlighted extractions**: Inline highlights showing what Atlas extracted (decisions in gold, entities underlined, topic tags in the margin)

### Metadata Sidebar
- Platform
- Date
- Word count
- Extracted entities
- Topic assignments

### AI Context Note
- **"Why this matters"** — A one-line AI-generated summary of why this conversation is significant to the topic

### Demo Behavior
3–5 pre-built conversation previews for key timeline events (e.g., the CourtCollect "first commit" moment, the Tyler Technologies "data model breakthrough").

## Priority
**P1** — High demo impact

## Estimated Size
~150 lines

## References
- [V5_PLAN.md — Section 2](../V5_PLAN.md)
EOF
)"

echo "[5/13] Creating: 1C. Connection Validation..."
gh issue create --repo "$REPO" \
  --title "Curation Pipeline: Implement Connection Validation (1C)" \
  --label "P1,feature,curation-pipeline" \
  --body "$(cat <<'EOF'
## Overview

Present the 16 AI-discovered connections for user confirmation as part of the curation pipeline.

## Requirements

### Connection Cards
Each connection shown as a card:
- **Topic A ←→ Topic B** with the AI-generated label (e.g., "Domain expertise transferred")
- **Strength score** indicator

### User Actions
- **Confirm** — Boost connection strength
- **Edit label** — Change the AI-generated connection description
- **Reject** — Remove the connection
- **Add new** — Create connections the AI missed

### Visual
A simplified version of the connections graph with reviewable edges highlighted.

## Priority
**P1** — High demo impact

## Estimated Size
~120 lines

## References
- [V5_PLAN.md — Section 1C](../V5_PLAN.md)
EOF
)"

echo "[6/13] Creating: 1D. Insight & Decision Review..."
gh issue create --repo "$REPO" \
  --title "Curation Pipeline: Implement Insight & Decision Review (1D)" \
  --label "P1,feature,curation-pipeline" \
  --body "$(cat <<'EOF'
## Overview

Surface the AI-extracted decisions, pivots, and milestones for human review as part of the curation pipeline.

## Requirements

### Card Stack
- Card stack of extracted insights, each with source conversation reference
- User marks each as: **Correct** / **Partially correct (edit)** / **Not a real decision**

### Promotion Logic
- Approved decisions get promoted to the Evolution timeline and topic timelines

### Edit Trail
- Shows what the AI proposed vs. what the human confirmed
- Visible provenance for all curated insights

## Priority
**P1** — High demo impact

## Estimated Size
~120 lines

## References
- [V5_PLAN.md — Section 1D](../V5_PLAN.md)
EOF
)"

# ─────────────────────────────────────────────────────────────────────────────
# P2 — Medium Demo Impact
# ─────────────────────────────────────────────────────────────────────────────

echo "[7/13] Creating: 3. Freshness & Staleness Indicators..."
gh issue create --repo "$REPO" \
  --title "Add Freshness & Staleness Indicators" \
  --label "P2,feature,enhancement" \
  --body "$(cat <<'EOF'
## Overview

The brief identifies "supersession" as a HIGH risk. v5 makes this visible with freshness and staleness indicators throughout the UI.

## Requirements

### Freshness Badges on Topics
- **Active** — Conversation in last 30 days
- **Cooling** — 30–90 days since last conversation
- **Dormant** — 90+ days since last conversation
- **Archived** — User-marked as complete

### Staleness Warnings on Insights
- Example: "This decision was made 8 months ago — still relevant?"

### Re-curation Prompts
- Example: "3 new conversations touch this topic since your last review"

### Visual
- Subtle color desaturation on dormant topics
- Small pulse animation on topics with new uncurated content

## Priority
**P2** — Medium demo impact

## Estimated Size
~80 lines

## References
- [V5_PLAN.md — Section 3](../V5_PLAN.md)
EOF
)"

echo "[8/13] Creating: 5. Incremental Sync Indicator..."
gh issue create --repo "$REPO" \
  --title "Add Incremental Sync Indicator" \
  --label "P2,feature,enhancement" \
  --body "$(cat <<'EOF'
## Overview

Demonstrate that Atlas isn't just a one-time tool — it supports incremental updates and ongoing knowledge management.

## Requirements

### Nav Bar Elements
- **"Last synced" timestamp** in the nav bar
- **"+47 new conversations since last sync"** notification badge

### Sync Animation
- **Incremental loading** animation (much shorter than initial — just the new data)

### New Content Highlight
- Recently ingested conversations glow briefly in timelines

### Demo Behavior
A button in the nav that triggers a short "syncing 47 new conversations" animation, then surfaces 2–3 new items in the review queue.

## Priority
**P2** — Medium demo impact

## Estimated Size
~100 lines

## References
- [V5_PLAN.md — Section 5](../V5_PLAN.md)
EOF
)"

echo "[9/13] Creating: 4. Export & Share Preview..."
gh issue create --repo "$REPO" \
  --title "Add Export & Share Preview" \
  --label "P2,feature,enhancement" \
  --body "$(cat <<'EOF'
## Overview

Show where the curated knowledge *goes* — preview export formats and shareable outputs.

## Requirements

### Obsidian Vault Preview
- File-tree mockup showing the generated markdown structure
- Folders per topic, wikilinks between notes, MOC (Map of Content) files

### Export Format Selector
- Obsidian / Markdown / JSON / CSV

### Shareable Insight Cards
- **"Share this insight"** — Generate a shareable card image for a specific insight or evolution phase (Spotify Wrapped aesthetic)

### Demo Behavior
Show the Obsidian vault structure as a read-only tree with expandable folders. Clicking a file shows a markdown preview with wikilinks highlighted.

## Priority
**P2** — Medium demo impact

## Estimated Size
~120 lines

## References
- [V5_PLAN.md — Section 4](../V5_PLAN.md)
EOF
)"

# ─────────────────────────────────────────────────────────────────────────────
# P3 — Lower Priority
# ─────────────────────────────────────────────────────────────────────────────

echo "[10/13] Creating: 6. Keyboard Navigation & Quick Actions..."
gh issue create --repo "$REPO" \
  --title "Add Keyboard Navigation & Quick Actions" \
  --label "P3,feature,ux" \
  --body "$(cat <<'EOF'
## Overview

Makes the demo feel like a *tool*, not just a visualization. Adds keyboard-driven navigation and command palette.

## Requirements

### Command Palette
- **Cmd+K / Ctrl+K** — Quick jump to any topic, view, or action

### Review Queue Navigation
- **Arrow keys** to navigate review queue items
- **Enter** to approve
- **E** to edit
- **X** to reject

### General Navigation
- **Escape** to back out of drilldowns

## Priority
**P3** — Low-Medium demo impact

## Estimated Size
~80 lines

## References
- [V5_PLAN.md — Section 6](../V5_PLAN.md)
EOF
)"

echo "[11/13] Creating: 7A. Guided Tour Mode..."
gh issue create --repo "$REPO" \
  --title "Add Guided Tour Mode (7A)" \
  --label "P3,feature,ux" \
  --body "$(cat <<'EOF'
## Overview

For stakeholder demos, add a step-by-step walkthrough overlay that highlights key features.

## Requirements

### Tour Overlay
- Tooltips pointing to each feature area with brief explanations
- **"Next" / "Back"** navigation through the tour
- Highlights the curation pipeline as the key differentiator

### Smart Behavior
- Auto-skippable for returning users

## Priority
**P3** — Medium demo impact

## Estimated Size
~100 lines

## References
- [V5_PLAN.md — Section 7A](../V5_PLAN.md)
EOF
)"

echo "[12/13] Creating: 7B. Demo Persona Selector..."
gh issue create --repo "$REPO" \
  --title "Add Demo Persona Selector (7B)" \
  --label "P3,feature,ux" \
  --body "$(cat <<'EOF'
## Overview

On the onboarding screen, alongside "Use demo data", offer persona options to showcase Atlas at different scales.

## Requirements

### Persona Options
- **"Power User" (3,847 convos)** — Current demo dataset, shows scale
- **"New User" (200 convos)** — Smaller dataset, shows the product works at any scale
- **"Team Lead" (preview)** — Teaser for multi-user/team features (future)

## Priority
**P3** — Low demo impact

## Estimated Size
~60 lines

## References
- [V5_PLAN.md — Section 7B](../V5_PLAN.md)
EOF
)"

echo "[13/13] Creating: 7C. Micro-interactions & Polish..."
gh issue create --repo "$REPO" \
  --title "Add Micro-interactions & Polish (7C)" \
  --label "P3,feature,polish" \
  --body "$(cat <<'EOF'
## Overview

UI polish and micro-interactions that make the demo feel premium and responsive.

## Requirements

### Haptic-style Feedback
- Subtle scale bounce on curation approve actions

### Sound Design Hooks
- Optional (off by default) — soft chime on queue completion

### Celebration Moments
- Confetti or shimmer burst when curation reaches 100% reviewed

### Page Transitions
- Smooth transitions between views (slide or fade, not instant swap)

## Priority
**P3** — Low demo impact

## Estimated Size
~50 lines

## References
- [V5_PLAN.md — Section 7C](../V5_PLAN.md)
EOF
)"

echo ""
echo "============================================="
echo "All 13 v5 issues created successfully!"
echo "============================================="
echo ""
echo "Summary:"
echo "  P0 (Critical): 3 issues  — Review Queue, Topic Curation, Curation Summary"
echo "  P1 (High):     3 issues  — Conversation Drilldown, Connection Validation, Insight Review"
echo "  P2 (Medium):   3 issues  — Freshness Indicators, Incremental Sync, Export Preview"
echo "  P3 (Low):      4 issues  — Keyboard Nav, Guided Tour, Persona Selector, Micro-interactions"
echo ""
echo "View all issues: https://github.com/$REPO/issues"
