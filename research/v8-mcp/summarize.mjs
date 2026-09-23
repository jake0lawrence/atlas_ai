// Summarize the capture eval: for each model and server condition, the share
// of conversations in which the model wrote to Atlas, with a 95% Wilson
// interval, split by scenario kind. Prints markdown.
//
//   node summarize.mjs results/capture.jsonl
import { readFileSync } from "node:fs";

// 95% Wilson score interval for k successes in n trials.
export const wilson = (k, n, z = 1.96) => {
  if (n === 0) return [0, 0];
  const p = k / n;
  const d = 1 + (z * z) / n;
  const c = (p + (z * z) / (2 * n)) / d;
  const h = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
  return [Math.max(0, c - h), Math.min(1, c + h)];
};

const pct = (x) => `${Math.round(x * 100)}%`;
const cell = (rows) => {
  const n = rows.length;
  const k = rows.filter(r => r.captured).length;
  const [lo, hi] = wilson(k, n);
  return n ? `${pct(k / n)} (${k}/${n}, ${pct(lo)}-${pct(hi)})` : "-";
};

if (process.argv[1] && process.argv[1].endsWith("summarize.mjs")) {
  const file = process.argv[2] || "results/capture.jsonl";
  const all = readFileSync(file, "utf8").trim().split("\n").map(l => JSON.parse(l));
  const rows = all.filter(r => r.ok);
  const failed = all.length - rows.length;
  const models = [...new Set(rows.map(r => r.model))];
  const variants = ["bare", "described", "instructed"].filter(v => rows.some(r => r.variant === v));

  console.log(`${rows.length} conversations scored (${failed} excluded for a CLI or API error). Cost of the eval itself: $${all.reduce((s, r) => s + r.cost_usd, 0).toFixed(2)}.\n`);
  console.log("Share of conversations with an Atlas write (atlas_capture or atlas_log_decision), 95% Wilson interval:\n");
  console.log("| Model | Server condition | Decision, unprompted (should capture) | Trivial (should not) | Explicit request (should capture) |");
  console.log("|---|---|---|---|---|");
  for (const m of models) for (const v of variants) {
    const g = rows.filter(r => r.model === m && r.variant === v);
    console.log(`| ${m} | ${v} | ${cell(g.filter(r => r.kind === "decision"))} | ${cell(g.filter(r => r.kind === "trivial"))} | ${cell(g.filter(r => r.kind === "explicit"))} |`);
  }

  console.log("\nPer decision scenario, unprompted capture rate (all conditions pooled per model):\n");
  const ids = [...new Set(rows.filter(r => r.kind === "decision").map(r => r.scenario))];
  console.log(`| Scenario | ${models.join(" | ")} |`);
  console.log(`|---|${models.map(() => "---").join("|")}|`);
  for (const id of ids) console.log(`| ${id} | ${models.map(m => cell(rows.filter(r => r.model === m && r.scenario === id))).join(" | ")} |`);

  console.log("\nWhen the unprompted capture happened (decision scenarios, captured runs):\n");
  for (const m of models) for (const v of variants) {
    const g = rows.filter(r => r.model === m && r.variant === v && r.kind === "decision" && r.captured);
    const t1 = g.filter(r => r.first_capture_turn === 1).length;
    console.log(`- ${m} / ${v}: ${g.length} captured; ${t1} on turn 1 (before the user stated the decision), ${g.length - t1} on turn 2`);
  }

  const searches = rows.filter(r => r.tools.includes("atlas_search"));
  console.log(`\natlas_search was called in ${searches.length} of ${rows.length} conversations (${[...new Set(searches.map(r => `${r.model}/${r.variant}`))].join(", ") || "none"}).`);
}
