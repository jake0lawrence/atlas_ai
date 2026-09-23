// Capture-reliability eval for V8_PLAN.md's open question: how often does a
// model call Atlas's write tools on its own?
//
// Each run is one scripted two-turn conversation driven through headless
// Claude Code (a real MCP client) against stub-server.mjs. Claude Code's own
// system prompt is replaced by a neutral chat-assistant prompt and its built-in
// tools are turned off, so the only tools the model sees are Atlas's. The stub
// logs every tool call; that log, not the model's text, is the ground truth.
//
//   node capture-eval.mjs --models claude-sonnet-5 --variants bare,described,instructed --reps 3 --out results/run.jsonl
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, existsSync, appendFileSync, mkdtempSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : fallback;
};

const MODELS = arg("models", "claude-sonnet-5").split(",");
const VARIANTS = arg("variants", "bare,described,instructed").split(",");
const REPS = Number(arg("reps", "3"));
const ONLY = arg("only", "");
const CONCURRENCY = Number(arg("concurrency", "6"));
const OUT = resolve(HERE, arg("out", "results/capture.jsonl"));

export const SYSTEM_PROMPT = "You are Claude, an AI assistant in a chat app, talking with the user. Be helpful and concise. Use the tools available to you when they help.";
const ALLOWED = ["atlas_search", "atlas_capture", "atlas_log_decision"].map(t => `mcp__atlas__${t}`).join(",");

const { scenarios } = JSON.parse(readFileSync(join(HERE, "scenarios.json"), "utf8"));
const chosen = ONLY ? scenarios.filter(s => ONLY.split(",").includes(s.id)) : scenarios;

// Run everything from an empty directory so no CLAUDE.md or project settings leak in.
const WORK = mkdtempSync(join(tmpdir(), "atlas-capture-"));
mkdirSync(dirname(OUT), { recursive: true });

const run = (args, env) => new Promise((ok) => {
  const p = spawn("claude", args, { cwd: WORK, env: { ...process.env, ...env } });
  let out = "", err = "";
  p.stdout.on("data", b => { out += b; });
  p.stderr.on("data", b => { err += b; });
  p.on("close", code => ok({ code, out, err }));
});

const once = async ({ model, variant, scenario, rep }) => {
  const id = randomUUID();
  const log = join(WORK, `${id}.calls.jsonl`);
  const cfg = join(WORK, `${id}.mcp.json`);
  writeFileSync(cfg, JSON.stringify({
    mcpServers: { atlas: { command: "node", args: [join(HERE, "stub-server.mjs")], env: { ATLAS_VARIANT: variant, ATLAS_LOG: log } } },
  }));
  const turns = [];
  for (const [i, text] of scenario.turns.entries()) {
    const before = existsSync(log) ? readFileSync(log, "utf8").split("\n").filter(Boolean).length : 0;
    const res = await run([
      "-p", text, "--model", model, "--output-format", "json",
      ...(i === 0 ? ["--session-id", id] : ["--resume", id]),
      "--system-prompt", SYSTEM_PROMPT, "--tools", "",
      "--strict-mcp-config", "--mcp-config", cfg, "--allowedTools", ALLOWED,
    ]);
    let parsed = {};
    try { parsed = JSON.parse(res.out); } catch (e) { parsed = { parse_error: String(e), raw: res.out.slice(0, 400), stderr: res.err.slice(0, 400) }; }
    const calls = existsSync(log) ? readFileSync(log, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l)).slice(before) : [];
    turns.push({
      turn: i + 1, exit: res.code, is_error: parsed.is_error ?? null, cost_usd: parsed.total_cost_usd ?? null,
      usage: parsed.usage ? { input: parsed.usage.input_tokens, output: parsed.usage.output_tokens, cache_read: parsed.usage.cache_read_input_tokens, cache_write: parsed.usage.cache_creation_input_tokens } : null,
      reply: typeof parsed.result === "string" ? parsed.result : null,
      calls: calls.map(c => ({ tool: c.tool, args: c.args })),
      error: parsed.parse_error ? parsed : undefined,
    });
  }
  const writes = turns.flatMap(t => t.calls.filter(c => c.tool !== "atlas_search").map(c => ({ ...c, turn: t.turn })));
  const record = {
    model, variant, scenario: scenario.id, kind: scenario.kind, rep, session: id,
    captured: writes.length > 0, first_capture_turn: writes[0]?.turn ?? null,
    tools: [...new Set(turns.flatMap(t => t.calls.map(c => c.tool)))],
    ok: turns.every(t => t.exit === 0 && !t.error && t.is_error !== true),
    cost_usd: turns.reduce((s, t) => s + (t.cost_usd || 0), 0),
    turns,
  };
  appendFileSync(OUT, JSON.stringify(record) + "\n");
  return record;
};

const jobs = [];
for (const model of MODELS) for (const variant of VARIANTS) for (const scenario of chosen) for (let rep = 1; rep <= REPS; rep++) jobs.push({ model, variant, scenario, rep });

let done = 0, spent = 0;
const worker = async () => {
  while (jobs.length) {
    const job = jobs.shift();
    const r = await once(job);
    done += 1; spent += r.cost_usd;
    process.stdout.write(`${done} ${r.model} ${r.variant} ${r.scenario}#${r.rep} captured=${r.captured} ok=${r.ok} $${r.cost_usd.toFixed(4)} (total $${spent.toFixed(2)})\n`);
  }
};
console.log(`${jobs.length} runs -> ${OUT}`);
await Promise.all(Array.from({ length: Math.min(CONCURRENCY, jobs.length) }, worker));
console.log(`done: ${done} runs, $${spent.toFixed(2)}`);
