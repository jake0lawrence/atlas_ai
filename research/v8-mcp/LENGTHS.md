# How big is a chat history

Researched 2026-09-23 from published sources. These are the inputs to the enrichment
cost model in `FINDINGS.md`.

## Gaps

**No source publishes a median, p90 or p99 of tokens per conversation.** The papers give
means with standard deviations per turn. Values marked "derived" multiply the published
average turns by the mean tokens per turn. That is exact only if the paper averaged
tokens over all turns, and none of them says so.

Most token counts use the **Llama-2** tokenizer. `FINDINGS.md` converts them to Claude
tokens with a ratio measured on the same text.

## Tokens and turns per conversation

| Source (dataset dates) | Turns / conversation | Tokens per turn (user / assistant) | Derived tokens / conversation | Tokenizer |
|---|---|---|---|---|
| LMSYS-Chat-1M, arxiv.org/abs/2309.11998, Table 1 (2023) | mean 2.0 | 69.5 / 214.5 | **568** | Llama-2 |
| WildChat-1M, arxiv.org/abs/2405.01470, Table 1 (2023-24) | mean 2.54 | 295.6 / 441.3 | **1,872** | Llama-2 |
| ShareGPT (as reported in WildChat Table 1) | 3.51 | 94.5 / 348.5 | 1,555 | Llama-2 |
| ShareChat, ChatGPT shares, arxiv.org/abs/2512.17843, Table 1 (2023-25) | mean 5.28, median 2 | 142.4 / 1,230.3 | **7,247** | Llama-2 |
| ShareChat, Claude shares (n=946) | mean 4.49, median 2 | 138.7 / 576.2 | 3,210 | Llama-2 |
| InVivoGPT, full GDPR exports of 300 users, arxiv.org/abs/2602.01114, Table 2 (2022-26) | **mean 6.0 ± 17.8** | not reported | not reported | n/a |
| ThoughtTrace, arxiv.org/abs/2605.20087, App. B.3 | WildChat 1 exchange: over 60% | n/a | Under about 1k tokens: nearly 60% of WildChat-1M, over 90% of LMSYS | o200k |
| Clio, arxiv.org/abs/2412.13678, Table 3 notes | n/a | n/a | "1,000 tokens", an **assumption** in Anthropic's own cost model, not a measurement | n/a |

Anthropic's Economic Index "Cadences" report (June 2026) gives only relative figures.
Token use per conversation is "extremely right-skewed", and some conversations use
"several orders of magnitude" more than the median.

## Conversations per heavy user

| Source | Value |
|---|---|
| InVivoGPT, Table 2 | 460.8 ± 531.1 conversations per user, over 714 active days (about 236 per year) |
| WildChat power users (at least 100 conversations and 90 days) | 418.3 ± 974.5 per user, over 333 days (about 458 per year) |
| Health-privacy donation study, arxiv.org/abs/2609.14697 §3.1 | 202,590 conversations across 1,252 users, about 162 per user lifetime |

## Base case used in the cost model

- **Mean: about 4.4k Llama-2 tokens per conversation.** This is 6.0 turns (InVivoGPT, the
  only full-history source) × 737 tokens per turn (WildChat).
- **Sensitivity: 0.57k (LMSYS) to 8.2k.** The top end is 6.0 turns × ShareChat's 1,373
  tokens per turn.
- **Archive size:** a typical heavy user has 400-460 conversations. The Atlas demo
  persona has 3,847, which sits in the tail.

## Biases the sources state

- LMSYS users are hobbyists and researchers, and WildChat users skew toward IT. Both are
  free public chatbots, so their conversations run short.
- ShareChat counts conversations people chose to share publicly, which skews dense.
- InVivoGPT recruited users with at least 100 conversations over at least 90 days: the
  population Atlas is for.
