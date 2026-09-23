## Measured, per model

| Model | Samples | Claude tokens per Llama-2 token | Chars per Claude token | Prompt overhead (tokens) | Visible output per conversation (mean / p90) | Thinking, if left on (mean) | JSON valid |
|---|---|---|---|---|---|---|---|
| claude-haiku-4-5 | 12 | 0.926 | 3.99 | 151 | 171 / 224 | 1664 | 12/12 |
| claude-sonnet-5 | 12 | 1.302 | 2.84 | 204 | 207 / 267 | 0 | 12/12 |
| claude-opus-5-5 | 12 | 1.300 | 2.85 | 206 | 181 / 219 | 0 | 12/12 |

## Cost per conversation (USD), Batch API (50% off), thinking off

| Model | low (570 Llama-2 tokens) | base (4400 Llama-2 tokens) | high (8200 Llama-2 tokens) |
|---|---|---|---|
| claude-haiku-4-5 | $0.00077 | $0.00254 | $0.00430 |
| claude-sonnet-5 | $0.00198 | $0.00697 | $0.01191 |
| claude-opus-5-5 | $0.00370 | $0.01366 | $0.02355 |

## Backfill cost for a whole archive (USD), Batch API, thinking off, base-case size

| Model | typical heavy user (460) | Atlas demo persona (3,847) | 10k-conversation tail (10,000) | Same, high size, 10k archive | Standard API (no batch), base size, demo persona | Thinking left on, base size, demo persona |
|---|---|---|---|---|---|---|
| claude-haiku-4-5 | $1.17 | $9.78 | $25.41 | $43.01 | $19.55 | $25.78 |
| claude-sonnet-5 | $3.20 | $26.80 | $69.67 | $119.15 | $53.60 | $26.80 |
| claude-opus-5-5 | $6.29 | $52.56 | $136.63 | $235.46 | $105.12 | $52.56 |
