// Enrichment cost model. Every input is either measured here or published:
//   - Claude tokens per Llama-2 token, per model: measured on identical text
//     (cost.jsonl transcript_tokens vs llama_counts.json)
//   - fixed prompt overhead per call: measured (enrich baseline minus token baseline)
//   - output tokens per conversation: measured, visible text only (thinking off is
//     how a batch extraction job would run; thinking-on is reported as a ceiling)
//   - conversation sizes and archive sizes: LENGTHS.md (published, Llama-2 tokens)
//   - prices: platform.claude.com/docs/en/about-claude/pricing, read 2026-09-23
//
//   node model.mjs cost.jsonl llama_counts.json
import { readFileSync } from "node:fs";

export const PRICES = { // USD per million tokens: [input, output]; Batch API is half of both
  "claude-haiku-4-5": [1, 5],
  "claude-sonnet-5": [2, 10],
  "claude-opus-5-5": [4, 20],
};

export const SIZES = { low: 570, base: 4400, high: 8200 }; // Llama-2 tokens per conversation (LENGTHS.md)
export const ARCHIVES = { "typical heavy user": 460, "Atlas demo persona": 3847, "10k-conversation tail": 10000 };

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const q = (xs, p) => { const s = [...xs].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };

export const perConversation = ({ ratio, overhead, output }, llamaTokens, [pin, pout]) =>
  ((overhead + llamaTokens * ratio) * pin + output * pout) / 1e6;

if (process.argv[1] && process.argv[1].endsWith("model.mjs")) {
  const [costFile, llamaFile] = process.argv.slice(2);
  const rows = readFileSync(costFile, "utf8").trim().split("\n").map(l => JSON.parse(l));
  const llama = JSON.parse(readFileSync(llamaFile, "utf8"));
  const models = [...new Set(rows.filter(r => r.kind === "sample").map(r => r.model))];

  const fit = {};
  console.log("## Measured, per model\n");
  console.log("| Model | Samples | Claude tokens per Llama-2 token | Chars per Claude token | Prompt overhead (tokens) | Visible output per conversation (mean / p90) | Thinking, if left on (mean) | JSON valid |");
  console.log("|---|---|---|---|---|---|---|---|");
  for (const m of models) {
    const s = rows.filter(r => r.kind === "sample" && r.model === m && llama[r.transcript]);
    const b = rows.find(r => r.kind === "baseline" && r.model === m);
    const ratio = s.reduce((a, r) => a + r.transcript_tokens, 0) / s.reduce((a, r) => a + llama[r.transcript].llama2_tokens, 0);
    const cpt = s.reduce((a, r) => a + r.chars, 0) / s.reduce((a, r) => a + r.transcript_tokens, 0);
    const overhead = b.enrich_baseline - b.token_baseline;
    const visible = s.map(r => r.enrich_output - (r.enrich_thinking || 0));
    const thinking = s.map(r => r.enrich_thinking || 0);
    fit[m] = { ratio, overhead, output: mean(visible), outputThinking: mean(visible) + mean(thinking) };
    console.log(`| ${m} | ${s.length} | ${ratio.toFixed(3)} | ${cpt.toFixed(2)} | ${overhead} | ${Math.round(mean(visible))} / ${q(visible, 0.9)} | ${Math.round(mean(thinking))} | ${s.filter(r => r.json_valid).length}/${s.length} |`);
  }

  console.log("\n## Cost per conversation (USD), Batch API (50% off), thinking off\n");
  console.log(`| Model | ${Object.entries(SIZES).map(([k, v]) => `${k} (${v} Llama-2 tokens)`).join(" | ")} |`);
  console.log(`|---|${Object.keys(SIZES).map(() => "---").join("|")}|`);
  for (const m of models) {
    const p = PRICES[m].map(x => x / 2);
    console.log(`| ${m} | ${Object.values(SIZES).map(n => `$${perConversation(fit[m], n, p).toFixed(5)}`).join(" | ")} |`);
  }

  console.log("\n## Backfill cost for a whole archive (USD), Batch API, thinking off, base-case size\n");
  console.log(`| Model | ${Object.entries(ARCHIVES).map(([k, v]) => `${k} (${v.toLocaleString()})`).join(" | ")} | Same, high size, 10k archive | Standard API (no batch), base size, demo persona | Thinking left on, base size, demo persona |`);
  console.log(`|---|${Object.keys(ARCHIVES).map(() => "---").join("|")}|---|---|---|`);
  for (const m of models) {
    const half = PRICES[m].map(x => x / 2);
    const cells = Object.values(ARCHIVES).map(n => `$${(n * perConversation(fit[m], SIZES.base, half)).toFixed(2)}`);
    const hi = `$${(10000 * perConversation(fit[m], SIZES.high, half)).toFixed(2)}`;
    const std = `$${(3847 * perConversation(fit[m], SIZES.base, PRICES[m])).toFixed(2)}`;
    const think = `$${(3847 * perConversation({ ...fit[m], output: fit[m].outputThinking }, SIZES.base, half)).toFixed(2)}`;
    console.log(`| ${m} | ${cells.join(" | ")} | ${hi} | ${std} | ${think} |`);
  }
}
