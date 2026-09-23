# V8 open questions, measured

Run 2026-09-23. V8_PLAN.md left three questions open before designing around them:

1. How reliably does a model call the capture tool on its own?
2. Which chat apps can use an Atlas MCP server at all?
3. What does enrichment cost over a backlog of thousands of conversations?

Short answers:

1. **Reliably, if the tool description says when to call it.** With one-line
   descriptions, Sonnet 5 captured 33% of stated decisions and Opus 5.5 46%. With
   descriptions that say "call it when the user commits to a choice", both captured
   24/24 and still captured 0 of 12 trivial exchanges. Adding server-level instructions
   on top changed nothing measurable.
2. **Every consumer chat app that supports MCP connects from the vendor's cloud over
   HTTPS. None can start a local process.** A local stdio server reaches Claude Desktop
   and developer tools only. Reaching Claude web and mobile, ChatGPT, Gemini or Le Chat
   takes a hosted endpoint, or a relay or tunnel to the user's machine. Write tools are
   restricted further in several of those (ChatGPT developer mode only, Gemini confirms
   every write, Microsoft 365 Copilot read-only).
3. **Small.** A one-time backfill with Haiku 4.5 through the Batch API costs about
   $1.20 for a typical heavy user (460 conversations) and about $25 for 10,000
   conversations. The full table is below.

The rest of this document is the method, the numbers and the caveats.

## 1. Capture reliability

### Method

- `stub-server.mjs` is a stub of the proposed server: `atlas_search`, `atlas_capture`
  (`title`, `summary`) and `atlas_log_decision` (`decision`, `topic?`). It stores
  nothing and logs every call.
- Three server conditions, set by `ATLAS_VARIANT`:
  - **bare**: "Save a conversation to Atlas." / "Log a decision in Atlas."
  - **described**: each description says what the tool is for and when to call it
    ("Call it when the user commits to a choice. It lands in a review inbox for the
    user to confirm.").
  - **instructed**: described, plus server `instructions` asking the model to capture
    decisions, pivots, plans and conclusions without being asked, and to skip small talk.
- `scenarios.json` holds 12 two-turn user scripts:
  - six **decision** scenarios, where the user reaches a decision and never mentions
    Atlas (should be captured);
  - three **trivial** ones: unit conversion, grammar, trivia (should not be);
  - three **explicit** ones, where the user asks for the save (the ceiling).
- `capture-eval.mjs` plays each script through Claude Code headless. It uses a neutral
  system prompt, no built-in tools, and only the Atlas server. It covers two models ×
  three conditions × 12 scenarios × 4 repetitions = **288 conversations**. There were
  0 errors, and the eval cost $15.60.
- A conversation counts as captured if it made any Atlas write (`atlas_capture` or
  `atlas_log_decision`). Intervals are 95% Wilson.

### Results

Full tables are in `results/capture-summary.md`, raw records in `results/capture.jsonl`.

| Model | Condition | Decision, unprompted | Trivial | Explicit |
|---|---|---|---|---|
| Sonnet 5 | bare | 33% (8/24, 18–53%) | 0/12 | 12/12 |
| Sonnet 5 | described | **100% (24/24, 86–100%)** | 0/12 | 12/12 |
| Sonnet 5 | instructed | 100% (24/24, 86–100%) | 0/12 | 12/12 |
| Opus 5.5 | bare | 46% (11/24, 28–65%) | 0/12 | 12/12 |
| Opus 5.5 | described | **100% (24/24, 86–100%)** | 0/12 | 12/12 |
| Opus 5.5 | instructed | 100% (24/24, 86–100%) | 0/12 | 12/12 |

The trivial column's upper bound is 24% per cell at n=12. Pooled across all six cells,
the false-capture rate is 0/72, with an upper bound of 5%.

What else the transcripts show:

- **Timing.** Every unprompted capture happened on turn 2, right after the user stated
  the decision. None happened on turn 1, while the user was still asking.
- **Which tool.** Models preferred `atlas_log_decision` over `atlas_capture` for
  decisions. Counting write calls across all scenarios:

  | Condition | `atlas_log_decision` | `atlas_capture` |
  |---|---|---|
  | bare | 36 | 14 |
  | described | 68 | 13 |
  | instructed | 69 | 15 |

- **Duplicates.** 28 conversations wrote more than once, usually a decision plus a
  capture of the same exchange. The inbox has to dedupe or group writes from one
  conversation.
- **Disclosure.** In 186 of 187 captured conversations, the reply told the user it
  had saved something.
- **Content.** The saved decision text was specific and in the user's terms, for
  example "After three days fighting Docker/Prisma build issues on Railway, switching
  to Vercel + Supabase Cloud."
- **Search.** `atlas_search` was called in 97 of 288 conversations. Every call was on
  turn 1 of a decision or explicit scenario, never on a trivial one. Models check the
  atlas before advising, unprompted. That is the Companion use case working with no
  instruction to do it.

### Caveats

- **The decisions are clean.** Each scenario states its decision in one sentence
  ("That's final"). Real conversations decide implicitly, drift, or never quite decide.
  The rates above are a ceiling for that kind of conversation, not an estimate. The
  next eval should use longer, messier conversations with implicit or reversed
  decisions.
- **Claude Code is a proxy for the client.** Claude.ai, ChatGPT and Gemini wrap MCP in
  their own system prompts, approval prompts and tool-selection logic. The model
  behavior carries over. The client behavior (does the user approve a write, does the
  client surface the tool at all) has to be checked per client.
- **Two models, two turns, four repetitions.** Weaker models and long conversations
  were not tested. Under bare descriptions, three scenarios were missed most often
  (counts are out of 8 runs):
  - D6, choosing a language to learn: 0 of 8 captured.
  - D3, declining a job offer: 1 of 8.
  - D1, picking a database: 2 of 8.

  D4, a pricing call ending in "That's final", was captured 8 of 8. Decisions stated
  softly or about the user's own life may be the harder class.

### What it means for the design

- Tool descriptions carry the behavior. Write the "when to call" into each write tool's
  description; do not rely on server `instructions`, which added nothing here and which
  some clients may not pass through.
- Keep `atlas_log_decision` as its own tool. Models reach for it first when a decision
  is made.
- The inbox needs dedupe by conversation.

## 2. Clients

Full table, sources and unverified items: `CLIENTS.md`.

| Where the user chats | Can reach a local stdio server? | Remote HTTPS server? | Can write (capture)? |
|---|---|---|---|
| Claude web, mobile | No | Yes | Yes, with approval; Free plan: 1 custom connector |
| Claude Desktop, Claude Code | Yes | Yes | Yes |
| ChatGPT | No (tunnel only) | Yes | Developer mode only: web, paid plans, confirmation per write |
| Gemini app | No | Yes | Yes, confirmation per write; US, 18+ |
| Le Chat | No | Yes | Yes, Free plan included |
| Microsoft 365 Copilot | No | Yes, admin-built | **No**, read-only |
| IDEs and coding CLIs (Cursor, VS Code, Zed, Codex, Gemini CLI, ...) | Yes | Yes | Yes |

What this changes: V8_PLAN's "local first, stdio" architecture reaches only desktop
and developer tools. Atlas needs a remote Streamable HTTP endpoint with OAuth to reach
the apps where most conversations happen. Local storage is still possible behind a
relay, but the endpoint has to be public.

## 3. Enrichment cost

### Method

- `cost.mjs` runs the real enrichment prompt (`ENRICH_PROMPT`) over 12 transcripts
  from the capture eval, one per scenario. The prompt asks for title, summary, topic,
  confidence, entities, and decisions/pivots/milestones as JSON.
- It records input, output and thinking tokens from the API's own usage numbers, and
  whether the JSON parses. It also measures each model's tokens for the bare
  transcript, from the difference between a request with the transcript and the same
  request with one word.
- `llama_count.py` counts the same transcripts with the Llama-2 tokenizer. That gives a
  measured Claude-to-Llama-2 ratio per model, which converts the published
  conversation sizes (`LENGTHS.md`, all in Llama-2 tokens) to Claude tokens.
- `model.mjs` combines those with list prices (platform.claude.com pricing, read
  2026-09-23):

  | Model | Input / output per MTok |
  |---|---|
  | Haiku 4.5 | $1 / $5 |
  | Sonnet 5 | $2 / $10 |
  | Opus 5.5 | $4 / $20 |

  The Batch API halves both.
- Sizes (`LENGTHS.md`):
  - Base case: 4.4k Llama-2 tokens per conversation. That is InVivoGPT's 6.0 turns
    from full exports × WildChat's 737 tokens per turn.
  - Range: 0.57k to 8.2k.
  - Archives: 460 conversations for a typical heavy user, 3,847 for the demo persona,
    10,000 for the tail.

### Results

Haiku 4.5 is complete (12 transcripts). Sonnet 5 and Opus 5.5 are still running, and their rows will be added here.

#### Measured, per model

| Model | Samples | Claude tokens per Llama-2 token | Chars per Claude token | Prompt overhead (tokens) | Visible output per conversation (mean / p90) | Thinking, if left on (mean) | JSON valid |
|---|---|---|---|---|---|---|---|
| claude-haiku-4-5 | 12 | 0.926 | 3.99 | 151 | 171 / 224 | 1664 | 12/12 |

#### Cost per conversation (USD), Batch API (50% off), thinking off

| Model | low (570 Llama-2 tokens) | base (4400 Llama-2 tokens) | high (8200 Llama-2 tokens) |
|---|---|---|---|
| claude-haiku-4-5 | $0.00077 | $0.00254 | $0.00430 |

#### Backfill cost for a whole archive (USD), Batch API, thinking off, base-case size

| Model | typical heavy user (460) | Atlas demo persona (3,847) | 10k-conversation tail (10,000) | Same, high size, 10k archive | Standard API (no batch), base size, demo persona | Thinking left on, base size, demo persona |
|---|---|---|---|---|---|---|
| claude-haiku-4-5 | $1.17 | $9.78 | $25.41 | $43.01 | $19.55 | $25.78 |

### Caveats

- **No published source gives a median or p90 conversation length**, only means.
  Conversation length is heavily right-skewed, so a few very long conversations can
  dominate an archive's cost. The high-size column (8.2k per conversation) is the
  sensitivity check, and a real importer should show the estimate from the user's own
  export before it runs.
- **Thinking.** Claude Code runs Haiku 4.5 with thinking even at low effort. Visible
  output averaged under 200 tokens, but thinking averaged over 1,600. A batch job would
  run with thinking off, which is what the headline numbers assume. The
  "thinking left on" column shows what forgetting that costs.
- **Tokenizer.** Sonnet 5 and Opus 5.5 produce about 30–40% more tokens than Haiku 4.5
  for the same text. That matches Anthropic's note on the newer tokenizer, and it is
  already in the numbers above.
- **Quality was checked by eye, not scored.** All outputs parsed as JSON. Haiku found
  the right decision in all six decision transcripts and no insights in the three
  trivial ones. Two things need work:
  - Its `confidence` sat at 90–98 for everything, so it cannot drive
    `AUTO_APPROVE_AT` as-is.
  - It sometimes filed a plan ("update the landing page tonight") as a milestone.

  Choosing Haiku for the first pass needs a scored comparison against a larger model
  on real exports.

### What it means for the design

- Cost does not block PR 5. Haiku 4.5 on the Batch API is the default first pass. Show
  the estimate from the user's own export before running.
- Confidence for the Review queue should come from something other than the model's
  self-report, such as agreement between two passes or with the user's existing topics.

## Reproducing

```bash
cd research/v8-mcp && npm install
node capture-eval.mjs --models claude-sonnet-5,claude-opus-5-5 --variants bare,described,instructed --reps 4 --out results/capture.jsonl
node summarize.mjs results/capture.jsonl > results/capture-summary.md
node cost.mjs --models claude-haiku-4-5,claude-sonnet-5,claude-opus-5-5 --n 12 --out results/cost.jsonl
python3 llama_count.py results/capture.jsonl llama2-tokenizer.json > results/llama_counts.json
node model.mjs results/cost.jsonl results/llama_counts.json > results/cost-model.md
```

Both evals call the `claude` CLI, so they spend real money on the account it is
signed in to.
