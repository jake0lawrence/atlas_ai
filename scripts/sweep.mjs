#!/usr/bin/env node
// Route sweep: serve a built `dist/`, visit every route in the route table in
// headless Chromium, and record what rendered (text, markup, errors) so two
// builds can be diffed. This is the seed of the Playwright screenshot baseline
// in tests/e2e; keep the two route lists in sync via src/routes.js.
//
//   node scripts/sweep.mjs --dist dist --out sweep.json
//   node scripts/sweep.mjs --compare before.json after.json
//
// Exit code is 1 when a route raised a page error, when --compare finds a
// difference, or when a route could not be reached.

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { SWEEP_ROUTES } from '../src/routes.js';

const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : dflt; };

if (args[0] === '--compare') {
  process.exit(compare(args[1], args[2]));
}

const DIST = path.resolve(opt('--dist', 'dist'));
const OUT = opt('--out', 'sweep.json');
const VIEWPORT = { width: 1280, height: 900 };
const SETTLE_MS = Number(opt('--settle', 2500)); // StatCard counters finish by ~2.2s

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };

function serve(dir) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, 'http://x');
      let file = path.join(dir, url.pathname);
      if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(dir, 'index.html'); // SPA fallback
      res.setHeader('Content-Type', MIME[path.extname(file)] || 'application/octet-stream');
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

function normalize(html) {
  // Strip what legitimately differs run to run: hashed asset names, timers.
  return html
    .replace(/\/assets\/[\w-]+\.(js|css)/g, '/assets/x.$1')
    .replace(/transition-delay:\s*[\d.]+m?s/g, 'transition-delay:x')
    .replace(/animation-delay:\s*[\d.]+m?s/g, 'animation-delay:x')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

async function sweep() {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) { console.error(`no build at ${DIST}; run npm run build first`); process.exit(1); }
  const { server, port } = await serve(DIST);
  const browser = await chromium.launch();
  const results = {};
  let failed = 0;
  for (const route of SWEEP_ROUTES) {
    const ctx = await browser.newContext({ viewport: VIEWPORT, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
    // Resource failures are reported (with their URL) by `requestfailed` below; the
    // console echo of the same failure carries no URL, so skip it.
    page.on('console', m => { if (m.type() === 'error' && !/^Failed to load resource/.test(m.text())) errors.push(`console: ${m.text()}`); });
    page.on('requestfailed', r => { if (!/fonts\.g(oogleapis|static)\.com/.test(r.url())) errors.push(`request: ${r.url()} ${r.failure()?.errorText}`); });
    await page.route(/fonts\.g(oogleapis|static)\.com/, r => r.abort()); // deterministic type
    try {
      await page.goto(`http://127.0.0.1:${port}${route.path}`, { waitUntil: 'networkidle' });
      if (route.setup) await route.setup(page);
      await page.waitForTimeout(SETTLE_MS);
      const [text, html] = await Promise.all([
        page.evaluate(() => document.body.innerText),
        page.evaluate(() => document.body.innerHTML),
      ]);
      results[route.id || route.path] = { text, html: normalize(html), errors };
      if (errors.length) failed++;
      console.log(`${errors.length ? 'FAIL' : 'ok  '} ${(route.id || route.path).padEnd(40)} ${text.length} chars${errors.length ? '\n     ' + errors.join('\n     ') : ''}`);
    } catch (e) {
      failed++;
      results[route.id || route.path] = { text: '', html: '', errors: [`navigation: ${e.message}`] };
      console.log(`FAIL ${route.path} ${e.message}`);
    }
    await ctx.close();
  }
  await browser.close();
  server.close();
  fs.writeFileSync(OUT, JSON.stringify(results, null, 1));
  console.log(`\nwrote ${OUT} (${Object.keys(results).length} routes, ${failed} with errors)`);
  return failed ? 1 : 0;
}

function compare(a, b) {
  const A = JSON.parse(fs.readFileSync(a, 'utf8'));
  const B = JSON.parse(fs.readFileSync(b, 'utf8'));
  let diffs = 0;
  for (const route of new Set([...Object.keys(A), ...Object.keys(B)])) {
    const x = A[route], y = B[route];
    if (!x || !y) { diffs++; console.log(`ONLY IN ${x ? 'A' : 'B'}: ${route}`); continue; }
    const sameText = x.text === y.text, sameHtml = x.html === y.html;
    if (sameText && sameHtml) { console.log(`same ${route}`); continue; }
    diffs++;
    console.log(`DIFF ${route}: text ${sameText ? 'same' : 'differs'}, markup ${sameHtml ? 'same' : 'differs'}`);
    if (!sameHtml) {
      let i = 0; while (i < x.html.length && x.html[i] === y.html[i]) i++;
      console.log(`     first markup difference at ${i}:\n     A: ...${x.html.slice(Math.max(0, i - 60), i + 80)}\n     B: ...${y.html.slice(Math.max(0, i - 60), i + 80)}`);
    }
  }
  console.log(diffs ? `\n${diffs} route(s) differ` : '\nall routes identical');
  return diffs ? 1 : 0;
}

process.exit(await sweep());
