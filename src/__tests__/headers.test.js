// @vitest-environment node
// The response headers vercel.json sets on every path. The sweep serves the
// same headers, so a CSP that blocks the app fails there; this test holds the
// policy itself, so a loosened directive fails here.
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';

const vercel = JSON.parse(fs.readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'));
const rule = vercel.headers.find(r => r.source === '/(.*)');
const header = (key) => rule?.headers.find(h => h.key.toLowerCase() === key.toLowerCase())?.value;
const csp = Object.fromEntries((header('Content-Security-Policy') || '').split(';').map(d => d.trim().split(/\s+/)).map(([k, ...v]) => [k, v]));

describe('vercel.json response headers', () => {
  it('apply to every path, the app and /atlas/api alike', () => {
    expect(rule).toBeDefined();
    for (const p of ['/atlas/', '/atlas/dashboard', '/atlas/api/mcp']) expect(new RegExp(`^${rule.source}$`).test(p)).toBe(true);
  });

  it('forbid framing, by CSP and by X-Frame-Options', () => {
    expect(csp['frame-ancestors']).toEqual(["'none'"]);
    expect(header('X-Frame-Options')).toBe('DENY');
  });

  it('run only the app\'s own scripts: no inline, no eval, no third party', () => {
    expect(csp['script-src']).toEqual(["'self'"]);
    expect(csp['default-src']).toEqual(["'self'"]);
    expect(csp['object-src']).toEqual(["'none'"]);
    expect(csp['base-uri']).toEqual(["'none'"]);
    expect(header('Content-Security-Policy')).not.toMatch(/unsafe-eval|\*/);
  });

  it('allow outside origins only for the web fonts', () => {
    const outside = Object.values(csp).flat().filter(s => /^https?:/.test(s));
    expect(outside.sort()).toEqual(['https://fonts.googleapis.com', 'https://fonts.gstatic.com']);
  });

  it('set a referrer policy, nosniff, and turn off device features the demo never uses', () => {
    expect(header('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(header('X-Content-Type-Options')).toBe('nosniff');
    expect(header('Permissions-Policy')).toMatch(/camera=\(\).*microphone=\(\).*geolocation=\(\)/);
  });
});
