// Enrichment cost measurement for V8_PLAN.md's open question: what does one
// model pass over a backlog of thousands of conversations cost?
//
// Two measurements, both taken from the API's own usage numbers rather than
// estimated:
//   tokens  - Claude tokens per character for each model's tokenizer, by the
//             difference between a request carrying a transcript and the same
//             request carrying one word.
//   enrich  - the real enrichment prompt below, run over real transcripts (the
//             capture eval's own conversations): input and output tokens per
//             conversation, thinking split out, and whether the JSON parses.
//
//   node cost.mjs --models claude-haiku-4-5,claude-sonnet-5 --n 12 --out results/cost.jsonl
import { spawn } from "node:child_process";
import { readFileSync, appendFileSync, mkdtempSync, mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : fallback;
};
const MODELS = arg("models", "claude-haiku-4-5,claude-sonnet-5").split(",");
const N = Number(arg("n", "12"));
const EFFORT = arg("effort", "low");
const OUT = resolve(HERE, arg("out", "results/cost.jsonl"));
const WORK = mkdtempSync(join(tmpdir(), "atlas-cost-"));
mkdirSync(dirname(OUT), { recursive: true });

// What Atlas needs from each conversation to fill its screens: the Review
// queue (topic + confidence + entities), the Insights step (decisions, pivots,
// milestones) and the timeline (a title and a one-line summary).
export const ENRICH_PROMPT = `You index one AI chat conversation for a personal knowledge base.
Return only a JSON object, no prose, with these fields:
- "title": at most 8 words.
- "summary": one sentence.
- "topic": a short topic name the conversation belongs to (reuse an obvious existing project or domain name if the user mentions one).
- "confidence": 0-100, how sure you are of the topic.
- "entities": up to 6 named tools, companies, products or concepts.
- "insights": a list of {"type": "decision" | "pivot" | "milestone", "text": one sentence in the user's terms}. Only what the user actually decided or reached; an empty list is normal.`;

const run = (args) => new Promise((ok) => {
  const p = spawn("claude", args, { cwd: WORK, env: process.env });
  let out = "", err = "";
  p.stdout.on("data", b => { out += b; });
  p.stderr.on("data", b => { err += b; });
  p.on("close", code => ok({ code, out, err }));
});

const ask = async (model, system, prompt, extra = []) => {
  const res = await run(["-p", prompt, "--model", model, "--output-format", "json", "--session-id", randomUUID(),
    "--no-session-persistence", "--system-prompt", system, "--tools", "", "--strict-mcp-config", ...extra]);
  const j = JSON.parse(res.out);
  const u = j.usage;
  return {
    result: j.result,
    input_total: u.input_tokens + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0),
    output: u.output_tokens,
    thinking: u.output_tokens_details?.thinking_tokens ?? null,
    cost_usd: j.total_cost_usd,
  };
};

// Transcripts: the capture eval's conversations, one per scenario and model,
// rendered the way an export importer would hand them to the enrichment pass.
const records = readFileSync(resolve(HERE, arg("transcripts", "results/capture.jsonl")), "utf8").trim().split("\n").map(l => JSON.parse(l)).filter(r => r.ok);
const { scenarios } = JSON.parse(readFileSync(join(HERE, "scenarios.json"), "utf8"));
const byId = Object.fromEntries(scenarios.map(s => [s.id, s]));
const seen = new Set();
const transcripts = [];
for (const r of records) {
  const key = `${r.scenario}|${r.model}`;
  if (seen.has(key) || transcripts.length >= N) continue;
  seen.add(key);
  const s = byId[r.scenario];
  const text = r.turns.map((t, i) => `User: ${s.turns[i]}\n\nAssistant: ${t.reply ?? ""}`).join("\n\n");
  transcripts.push({ id: key, chars: text.length, text });
}

const tokenSys = "Reply with the single word OK.";
for (const model of MODELS) {
  const base = await ask(model, tokenSys, "OK");
  const baseEnrich = await ask(model, ENRICH_PROMPT, "OK", ["--effort", EFFORT]);
  appendFileSync(OUT, JSON.stringify({ kind: "baseline", model, token_baseline: base.input_total, enrich_baseline: baseEnrich.input_total }) + "\n");
  for (const t of transcripts) {
    const tok = await ask(model, tokenSys, t.text);
    const enr = await ask(model, ENRICH_PROMPT, t.text, ["--effort", EFFORT]);
    let valid = false;
    try { JSON.parse((enr.result || "").replace(/^```(?:json)?\s*|\s*```$/g, "")); valid = true; } catch { valid = false; }
    const rec = {
      kind: "sample", model, effort: EFFORT, transcript: t.id, chars: t.chars,
      transcript_tokens: tok.input_total - base.input_total,
      enrich_input: enr.input_total, enrich_output: enr.output, enrich_thinking: enr.thinking,
      json_valid: valid, enrich_result: enr.result,
    };
    appendFileSync(OUT, JSON.stringify(rec) + "\n");
    console.log(`${model} ${t.id} chars=${t.chars} tokens=${rec.transcript_tokens} out=${enr.output} thinking=${enr.thinking} json=${valid}`);
  }
}
