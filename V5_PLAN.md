# ATLAS v5 — Demo Feature Plan

## The Core Problem with v4

v4 tells a compelling *output* story — you see your knowledge beautifully mapped. But it
skips the story of *how you got there*. The brief nails it:

> "The moat is the curation UX, not the LLM processing."

v4 shows zero curation. The loading sequence implies the AI does everything, which
commoditizes Atlas to "just another LLM wrapper." v5 must demonstrate that **human
judgment is the product** — the AI proposes, the human curates, and the knowledge base
improves over time.

---

## v5 Feature Set

### 1. Curation Pipeline UI/UX (PRIMARY)

The single biggest addition. After the loading sequence completes its five phases, v5
inserts a **curation step** before the dashboard reveal. This is the demo's new centerpiece.

#### 1A. Review Queue

A dedicated view where AI-classified items are presented for human review. Three columns
or a card-stack interface:

- **Left**: Raw AI classification (topic assignment, confidence score, extracted entities)
- **Center**: The source conversation snippet (the actual user question / AI response)
- **Right**: Action panel (Approve / Edit / Reject / Skip)

Each item shows:
- **Confidence badge** (High 90%+ green, Medium 70-89% amber, Low <70% red)
- **Topic assignment** with the topic color/icon
- **Extracted entities** as tags (tools, people, concepts)
- **Decision/insight flag** if the AI detected one

Demo behavior: Pre-populate with ~8-10 review items at varying confidence levels.
High-confidence items auto-approve with a subtle animation. Medium/low items pause for
user interaction. The queue drains as items are reviewed, with a satisfying progress
indicator.

#### 1B. Topic Curation Panel

After initial review, show a **topic overview** where users can:

- **Merge topics** — Drag "n8n & Airtable" onto "AI Automation" to combine them, or
  confirm they're separate
- **Split topics** — A broad topic like "Web Development" could split into "Frontend" and
  "DevOps"
- **Rename topics** — Edit AI-generated labels ("Gov Tech & Policy" → "Public Sector
  Technology")
- **Adjust topic colors** — Pick from a curated palette or let Atlas assign
- **Set importance** — Star/pin topics that matter most to the user

Visual: A grid of topic cards with drag-and-drop merge targets. Each card shows
conversation count, confidence score, and a mini-sparkline of activity over time.

#### 1C. Connection Validation

Present the 16 AI-discovered connections for user confirmation:

- Each connection shown as a card: Topic A ←→ Topic B, with the AI-generated label
  ("Domain expertise transferred") and strength score
- User can: **Confirm** (boost strength), **Edit label**, **Reject** (remove connection),
  or **Add new** connections the AI missed
- Visual: A simplified version of the connections graph with reviewable edges highlighted

#### 1D. Insight & Decision Review

Surface the AI-extracted decisions, pivots, and milestones:

- Card stack of extracted insights, each with source conversation reference
- User marks each as: **Correct** / **Partially correct (edit)** / **Not a real decision**
- Approved decisions get promoted to the Evolution timeline and topic timelines
- Shows the "edit trail" — what the AI proposed vs. what the human confirmed

#### 1E. Curation Summary & Confidence Dashboard

After curation is complete, show a summary screen before entering the dashboard:

- **X items reviewed, Y approved, Z edited, W rejected**
- **Overall knowledge base confidence score** (aggregate of all classifications)
- **"Your atlas is now human-verified"** — emotional payoff moment
- **Before/After comparison** — show how curation improved the knowledge graph
  (e.g., merged 2 topics, added 3 connections, corrected 4 classifications)

This replaces the current instant transition from loading → dashboard. The new flow is:
**Onboarding → Loading → Curation → Dashboard**

---

### 2. Conversation Drilldown View (NEW VIEW)

v4 has topic timelines but you can never see an actual *conversation*. v5 adds the ability
to click any timeline event and see a conversation preview:

- **Thread view**: Alternating user/AI message bubbles
- **Highlighted extractions**: Inline highlights showing what Atlas extracted
  (decisions in gold, entities underlined, topic tags in the margin)
- **Metadata sidebar**: Platform, date, word count, extracted entities, topic assignments
- **"Why this matters" AI note**: A one-line summary of why this conversation is
  significant to the topic

Demo behavior: 3-5 pre-built conversation previews for key timeline events (e.g., the
CourtCollect "first commit" moment, the Tyler Technologies "data model breakthrough").

---

### 3. Freshness & Staleness Indicators

The brief identifies "supersession" as a HIGH risk. v5 makes this visible:

- **Freshness badges** on topics: "Active" (conversation in last 30 days), "Cooling"
  (30-90 days), "Dormant" (90+ days), "Archived" (user-marked as complete)
- **Staleness warnings** on insights: "This decision was made 8 months ago — still
  relevant?"
- **Re-curation prompts**: "3 new conversations touch this topic since your last review"

Visual: Subtle color desaturation on dormant topics. A small pulse animation on topics
with new uncurated content.

---

### 4. Export & Share Preview

Show where the curated knowledge *goes*:

- **Obsidian vault preview**: A file-tree mockup showing the generated markdown structure
  (folders per topic, wikilinks between notes, MOC files)
- **Export format selector**: Obsidian / Markdown / JSON / CSV
- **"Share this insight" card**: Generate a shareable card image for a specific
  insight or evolution phase (think Spotify Wrapped aesthetic)

Demo behavior: Show the Obsidian vault structure as a read-only tree with expandable
folders. Clicking a file shows a markdown preview with wikilinks highlighted.

---

### 5. Incremental Sync Indicator (NEW)

Demonstrate that Atlas isn't just a one-time tool:

- **"Last synced" timestamp** in the nav bar
- **"+47 new conversations since last sync"** notification badge
- **Incremental loading** animation (much shorter than initial — just the new data)
- **New content highlight** — recently ingested conversations glow briefly in timelines

Demo behavior: A button in the nav that triggers a short "syncing 47 new conversations"
animation, then surfaces 2-3 new items in the review queue.

---

### 6. Keyboard Navigation & Quick Actions

Makes the demo feel like a *tool*, not just a visualization:

- **⌘K / Ctrl+K** command palette: Quick jump to any topic, view, or action
- **Arrow keys** to navigate review queue items
- **Enter** to approve, **E** to edit, **X** to reject in curation mode
- **Escape** to back out of drilldowns

---

### 7. Polished Demo Flow Enhancements

#### 7A. Guided Tour Mode

For stakeholder demos, a step-by-step walkthrough overlay:

- Tooltips pointing to each feature area with brief explanations
- "Next" / "Back" navigation through the tour
- Highlights the curation pipeline as the key differentiator
- Auto-skippable for returning users

#### 7B. Demo Persona Selector

On the onboarding screen, alongside "Use demo data", offer persona options:

- **"Power User" (3,847 convos)** — current demo dataset, shows scale
- **"New User" (200 convos)** — smaller dataset, shows the product works at any scale
- **"Team Lead" (preview)** — teaser for multi-user/team features (future)

#### 7C. Micro-interactions & Polish

- Haptic-style feedback on curation actions (subtle scale bounce on approve)
- Sound design hooks (optional, off by default) — soft chime on queue completion
- Confetti or shimmer burst when curation reaches 100% reviewed
- Smooth page transitions between views (slide or fade, not instant swap)

---

## Updated App Flow

```
v4:  Onboarding → Loading → Dashboard
v5:  Onboarding → Loading → Curation → Dashboard
                               ↑
                         THE NEW MOAT
```

The curation step is not a speed bump — it's the **product moment**. It's where the user
goes from "AI did something with my data" to "I shaped my knowledge base." That ownership
feeling is what makes Atlas stick.

---

## Implementation Priority

| Priority | Feature                        | Lines (est.) | Demo Impact |
|----------|--------------------------------|-------------|-------------|
| P0       | 1A. Review Queue               | ~200        | Critical    |
| P0       | 1B. Topic Curation Panel       | ~150        | Critical    |
| P0       | 1E. Curation Summary           | ~100        | Critical    |
| P1       | 2. Conversation Drilldown      | ~150        | High        |
| P1       | 1C. Connection Validation      | ~120        | High        |
| P1       | 1D. Insight & Decision Review  | ~120        | High        |
| P2       | 3. Freshness Indicators        | ~80         | Medium      |
| P2       | 5. Incremental Sync            | ~100        | Medium      |
| P2       | 4. Export Preview               | ~120        | Medium      |
| P3       | 6. Keyboard Navigation         | ~80         | Low-Med     |
| P3       | 7A. Guided Tour                | ~100        | Medium      |
| P3       | 7B. Persona Selector           | ~60         | Low         |
| P3       | 7C. Micro-interactions         | ~50         | Low         |

**Estimated total**: ~1,430 additional lines → v5 prototype at ~2,600 lines.

---

## What v5 Does NOT Include (Deferred to Production)

- Real file parsing (still simulated — this is a demo)
- SQLite / backend integration
- Actual LLM API calls
- User authentication
- URL routing / deep links (nice-to-have but not demo-critical)
- Light mode (dark theme IS the brand for demos)
- Accessibility audit (important for production, not for demo impact)
- Performance optimization (demo data is small enough)

---

## The Pitch Shift

**v4 pitch**: "Look at your AI conversations visualized beautifully."
**v5 pitch**: "Look at your AI conversations visualized beautifully — *and you're in control of every insight.*"

The curation pipeline transforms Atlas from a read-only dashboard into an interactive
knowledge workbench. That's the moat. That's what no competitor has. That's the demo
moment.
