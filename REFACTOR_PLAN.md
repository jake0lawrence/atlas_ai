# Atlas AI Refactoring Plan

## Why the Original Prompt Froze

The original prompt asked Claude to do **8 categories of work simultaneously** on a 7,113-line monolithic file:
- Split into components/data/hooks/styles
- Add ErrorBoundary components
- Fix 20+ timer memory leaks
- Fix useEffect dependency arrays
- Fix setState anti-patterns
- Add useMemo optimizations
- Fix error handling
- Add accessibility attributes
- Update GitHub issues
- Create CLAUDE.md

Claude read the 7,113-line file in overlapping chunks (consuming ~50k+ tokens of context just on file reads), spawned background agents that competed for the same file, and froze before committing anything.

**Lesson: One concern per prompt. Commit after each.**

---

## The 6-Prompt Approach

Each prompt below is designed to:
- Focus on **one category** of changes
- Require reading only the **relevant sections** of App.jsx (not the whole file)
- Complete in **under 30 minutes** of Claude time
- End with a **commit** so progress is saved

### Prompt 1: CLAUDE.md + GitHub Issue Cleanup (5 min)
**What:** Create project conventions file, close implemented issues, update stale references.
**Why first:** Zero code changes, low risk, immediate value.

```
Create a CLAUDE.md file for this repository with the following:
- Project structure: React/Vite, single-page app, all code in src/App.jsx (7,113 lines)
- Build: `npm run dev` for development, `npm run build` for production
- No tests, no linter, no TypeScript — plain JSX
- Convention: All state is local (useState), no state management library
- Convention: Inline styles throughout (no CSS files)
- Add a "Self-Update" section: if Claude encounters an issue where having
  a note in CLAUDE.md would have prevented the problem, it should update
  the file as part of the fix.

Then review the open GitHub issues on jake0lawrence/atlas_ai:
- Close #36 (Contradiction Detection) — already implemented in AskAtlas component
- Close #37 (Rewind Mode) — already implemented as RewindMode component
- Update #41 (Break the Monolith) — note the file is now 7,113 lines (not 4,490)
- Leave #38-40, #42-44 open as-is

Commit with message: "chore: add CLAUDE.md and clean up GitHub issues"
```

---

### Prompt 2: Extract Data Constants (15 min)
**What:** Move all data arrays/objects (TOPICS, CONNECTIONS, INSIGHTS, etc.) to `src/data/constants.js`.
**Why second:** Pure extraction, no logic changes, biggest line-count reduction (~1,200 lines).

```
Extract all data constants from src/App.jsx into src/data/constants.js.

The data constants are defined between lines 15-1140 of App.jsx. They include:
- TOPICS, CONNECTIONS, INSIGHTS (lines 15-120)
- EVOLUTION_STAGES, CONVERSATIONS, monthlyActivity, SEARCH_RESULTS (lines 121-560)
- COMPANION_PROMPTS, COMPANION_MEMORY_LOG, THINKING_CHANGELOG (lines 561-800)
- BELIEF_DIFFS, DIGEST_DATA (lines 801-1000)
- DECISION_TREE, REWIND_SNAPSHOTS (lines 1001-1100)
- CONTRADICTIONS_INITIAL, CONTRADICTION_TYPE_CONFIG, RESOLUTION_OPTIONS (lines 1101-1140)

Steps:
1. Create src/data/constants.js with all constants as named exports
2. Update the top of App.jsx to import them:
   `import { TOPICS, CONNECTIONS, ... } from './data/constants';`
3. Delete the constant definitions from App.jsx
4. Verify: `npm run build` should succeed with no errors

Do NOT touch any component code. Only move data.
Commit with message: "refactor: extract data constants to src/data/constants.js"
```

---

### Prompt 3: Extract Hooks + Add ErrorBoundary (10 min)
**What:** Move custom hooks to `src/hooks/`, create ErrorBoundary component.
**Why third:** Small extraction (hooks are ~50 lines), ErrorBoundary is new code.

```
Extract custom hooks from src/App.jsx and create an ErrorBoundary component.

1. Create src/hooks/useWindowSize.js — extract the useWindowSize hook (lines 4-12)
2. Create src/hooks/useSound.js — extract the useSound hook (search for "const useSound")
   IMPORTANT: The current useSound has an empty catch {} block. Fix it to:
   `catch (e) { console.warn('Audio playback failed:', e); }`
3. Create src/components/ErrorBoundary.jsx — a React class component that:
   - Catches errors via componentDidCatch
   - Shows a fallback UI with "Something went wrong" + a retry button
   - Logs the error to console.error
4. Update App.jsx imports to use the extracted hooks
5. Wrap the main view-switching logic in App's return with <ErrorBoundary>
6. Verify: `npm run build`

Commit with message: "refactor: extract hooks, add ErrorBoundary"
```

---

### Prompt 4: Fix Timer Memory Leaks (20 min)
**What:** Add cleanup to all 20+ setTimeout/setInterval calls that lack it.
**Why fourth:** Bug fixes, no structural changes, but requires reading specific component sections.

```
Fix all setTimeout/setInterval memory leaks in src/App.jsx.

The following components have timers that are never cleaned up. For each one,
store the timer ID in a ref and clear it on unmount or before re-setting.

Fix these specific locations (use grep to find exact current line numbers):

1. **LoadingView** — Multiple setTimeout in a forEach loop.
   Fix: Store all timer IDs in an array ref, clear them all in useEffect cleanup.

2. **ReviewQueue** — Auto-approve cascade with setTimeout chain.
   Fix: Use a ref to track active timers, clear in useEffect cleanup.
   Also fix: handleAction has setTimeout outside useEffect — use a ref.

3. **ConnectionValidation** — Action handlers with setTimeout.
   Fix: Store timer IDs in refs, clear on unmount.

4. **InsightDecisionReview** — Three action handlers + done timeout.
   Fix: Same pattern — refs for timer IDs, clear on unmount.

5. **CurationSummary** — Phase transition timeouts (setInterval IS cleared, but setTimeouts are not).
   Fix: Track setTimeout IDs alongside the existing setInterval cleanup.

6. **BriefingCard** — Clipboard copy feedback timer.
   Fix: Store in ref, clear on unmount.

7. **App component** — Tour activation + sync cascade timeouts.
   Fix: Store in refs, clear on unmount.

Pattern to use:
```jsx
const timerRef = useRef(null);
useEffect(() => {
  return () => { if (timerRef.current) clearTimeout(timerRef.current); };
}, []);
// Then in handlers: timerRef.current = setTimeout(...)
```

Do NOT change any other code. Only fix timer leaks.
Verify: `npm run build`
Commit with message: "fix: clean up all setTimeout/setInterval memory leaks"
```

---

### Prompt 5: Fix useEffect Dependencies + setState Anti-patterns (15 min)
**What:** Add dependency arrays, decouple setState calls, add useMemo.
**Why fifth:** Focused state-management fixes.

```
Fix React state management anti-patterns in src/App.jsx.

**Part A: Fix useEffect dependency arrays**
These 4 components register keyboard listeners in useEffect with NO dependency
array, causing the listener to tear down and re-add on every render:
- ReviewQueue (search for "addEventListener.*keydown" near review queue)
- ConnectionValidation
- InsightDecisionReview
- GuidedTour

Fix: Add `[]` as the dependency array for each. Remove the eslint-disable comments.

**Part B: Fix setState-inside-setState**
In ReviewQueue, setActiveIdx() is called inside setItems() updater callbacks.
Fix: Use useEffect to derive activeIdx from items state instead of coupling them.

**Part C: Add useMemo for expensive computations**
Search for `const topicMap = {}` — this pattern appears 4 times, rebuilding a
map from TOPICS array on every render. Wrap each in useMemo:
```jsx
const topicMap = useMemo(() => {
  const map = {};
  TOPICS.forEach(t => { map[t.id] = t; });
  return map;
}, []);
```

Do NOT change anything else.
Verify: `npm run build`
Commit with message: "fix: useEffect deps, setState anti-patterns, add useMemo"
```

---

### Prompt 6: Error Handling + Accessibility (15 min)
**What:** Fix silent catches, add .catch() to promises, add basic a11y attributes.
**Why last:** Polish pass — lower severity, higher volume of small changes.

```
Fix error handling and add basic accessibility to src/App.jsx.

**Part A: Fix silent error swallowing**
Search for `catch {}` and `catch (e) {}` — there should be ~3 instances:
- Web Audio API try/catch → add: console.warn('Audio error:', e)
- localStorage.setItem try/catch → add: console.warn('localStorage write failed:', e)
- localStorage.getItem try/catch → add: console.warn('localStorage read failed:', e)

**Part B: Fix unhandled promise rejection**
In BriefingCard, find navigator.clipboard.writeText().then(...).
Add .catch(err => console.warn('Clipboard write failed:', err))

**Part C: Add basic accessibility**
1. Find all `<div onClick=` patterns that act as buttons. Add:
   - `role="button"`
   - `tabIndex={0}`
   - `onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); <existing-click-handler>(e); }}}`

2. Find modal/overlay components (BriefingCard, GuidedTour, CommandPalette).
   Add: `role="dialog"` and `aria-modal="true"` to their root overlay div.

3. Find progress bar divs (styled width-percentage divs). Add:
   `role="progressbar"` aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}

4. Find search inputs and add aria-label="Search" if no label exists.

Do NOT add aria attributes to every element — just the critical interactive
elements and landmarks listed above.
Verify: `npm run build`
Commit with message: "fix: error handling, accessibility basics"
```

---

## Key Principles

1. **One concern per prompt** — don't mix structural refactoring with bug fixes
2. **Specific line references** — tell Claude where to look instead of making it read the whole file
3. **Commit after each prompt** — progress is never lost
4. **Build verification** — every prompt ends with `npm run build`
5. **Don't over-scope** — the original prompt tried to create 15+ new files AND fix 20+ bugs AND update 9 issues. Any one of those is a full prompt.
6. **Guide the search** — saying "search for `const topicMap`" is better than "find all expensive computations"
