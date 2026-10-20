#!/usr/bin/env node
/**
 * Triage of client error reports (Firestore clientErrors) from a LOCAL export. Owner: Claude 6. Reads files only:
 * fetching production data is a separate, user-approved step.
 *
 *   node tools/e2e/triage-errors.mjs <export.json> [--maps <dir with *.js.map>] [--current "<build stamp>"]
 *
 * <export.json>: the Firestore REST list response ({ documents: [{ fields }] }) or an array of
 * { message, stack, build, scenes, role, ua, at }. Groups reports by message + top stack frame, marks noise (browser
 * extensions, cross-origin "Script error.", ResizeObserver loops, builds older than --current), and, given the build's
 * source maps (vite build.sourcemap 'hidden'), maps minified frames back to src/ file:line.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const file = process.argv[2];
if (!file || file.startsWith('--')) { console.log('usage: node tools/e2e/triage-errors.mjs <export.json> [--maps dir] [--current "<build>"]'); process.exit(2); }
const raw = JSON.parse(readFileSync(file, 'utf8'));
const val = (v) => v?.stringValue ?? v?.integerValue ?? v?.doubleValue ?? v?.timestampValue ?? null;
const reports = (Array.isArray(raw) ? raw : (raw.documents ?? []).map((d) => Object.fromEntries(Object.entries(d.fields ?? {}).map(([k, v]) => [k, val(v)]))))
  .map((r) => ({ message: String(r.message ?? ''), stack: String(r.stack ?? ''), build: String(r.build ?? ''), scenes: String(r.scenes ?? ''), role: String(r.role ?? ''), ua: String(r.ua ?? ''), at: Number(r.at ?? 0) }));

// ───────── source maps (VLQ decode of the "mappings" field, no dependency) ─────────
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function decodeMappings(mappings) {
  const lines = []; let src = 0, sl = 0, sc = 0;
  for (const line of mappings.split(';')) {
    const segs = []; let col = 0;
    for (const seg of line.split(',')) {
      if (!seg) continue;
      const v = []; let shift = 0, value = 0;
      for (const ch of seg) {
        const d = B64.indexOf(ch); value += (d & 31) << shift;
        if (d & 32) shift += 5; else { v.push(value & 1 ? -(value >>> 1) : value >>> 1); shift = 0; value = 0; }
      }
      col += v[0];
      if (v.length >= 4) { src += v[1]; sl += v[2]; sc += v[3]; segs.push([col, src, sl, sc]); }
    }
    lines.push(segs);
  }
  return lines;
}
const maps = new Map();
const mapDir = arg('maps', null);
if (mapDir && existsSync(mapDir)) for (const f of readdirSync(mapDir).filter((x) => x.endsWith('.js.map'))) {
  const m = JSON.parse(readFileSync(join(mapDir, f), 'utf8'));
  maps.set(f.replace(/\.map$/, ''), { sources: m.sources, lines: decodeMappings(m.mappings) });
}
function original(fileName, line, col) {
  const m = maps.get(fileName);
  const segs = m?.lines[line - 1];
  if (!segs?.length) return null;
  let best = null;
  for (const s of segs) { if (s[0] <= col - 1) best = s; else break; }
  best ??= segs[0];
  const src = m.sources[best[1]];
  return `${src.includes('src/') ? src.slice(src.lastIndexOf('src/')) : src.replace(/^(\.\.\/)+/, '')}:${best[2] + 1}`;
}

// ───────── grouping and noise ─────────
const frames = (stack) => [...stack.matchAll(/(?:at\s+(?:(\S+)\s+\()?)?((?:https?|chrome-extension|moz-extension|safari-(?:web-)?extension):\/\/[^\s)]+?):(\d+):(\d+)/g)]
  .map((x) => ({ fn: x[1] ?? '', url: x[2], line: Number(x[3]), col: Number(x[4]) }));
const norm = (msg) => msg.replace(/\d+(\.\d+)?/g, '#').replace(/["'`][^"'`]{20,}["'`]/g, '"…"').slice(0, 140);
const current = arg('current', null);
function noise(r, fr) {
  if (fr.some((f) => /extension:\/\//.test(f.url))) return 'browser extension';
  if (/^Script error\.?$/.test(r.message)) return 'cross-origin script (no detail)';
  if (/ResizeObserver loop/.test(r.message)) return 'ResizeObserver loop (benign)';
  if (current && r.build && r.build !== current && r.build < current) return `older build (${r.build})`;
  return null;
}
const groups = new Map();
for (const r of reports) {
  const fr = frames(r.stack);
  const top = fr[0];
  const where = top ? `${basename(top.url)}:${top.line}:${top.col}` : '(no frame)';
  const key = `${norm(r.message)} @ ${where}`;
  const g = groups.get(key) ?? { message: r.message, where, n: 0, builds: new Set(), scenes: new Set(), roles: new Set(), first: Infinity, last: 0, noise: noise(r, fr), src: null };
  g.n++; g.builds.add(r.build); r.scenes.split(',').filter(Boolean).forEach((s) => g.scenes.add(s)); if (r.role) g.roles.add(r.role);
  g.first = Math.min(g.first, r.at || Infinity); g.last = Math.max(g.last, r.at || 0);
  if (!g.src && top) g.src = fr.map((f) => original(basename(f.url), f.line, f.col)).filter(Boolean).slice(0, 3).join(' ← ') || null;
  if (g.noise && !noise(r, fr)) g.noise = null; // one real (non-noise) report makes the group real
  groups.set(key, g);
}
const day = (t) => (Number.isFinite(t) && t > 0 ? new Date(t).toISOString().slice(0, 16).replace('T', ' ') : '?');
const sorted = [...groups.values()].sort((a, b) => Number(!!a.noise) - Number(!!b.noise) || b.n - a.n);
console.log(`${reports.length} reports, ${groups.size} groups (${sorted.filter((g) => !g.noise).length} real, ${sorted.filter((g) => g.noise).length} noise)${maps.size ? `, ${maps.size} source maps loaded` : ', no source maps (frames stay minified)'}\n`);
for (const g of sorted) {
  console.log(`${g.noise ? 'NOISE' : 'REAL '} ×${g.n}  ${g.message.slice(0, 120)}`);
  console.log(`        at ${g.where}${g.src ? `  →  ${g.src}` : ''}`);
  console.log(`        builds ${[...g.builds].join(', ') || '?'} · scenes ${[...g.scenes].slice(0, 6).join(',') || '?'} · ${[...g.roles].join(',') || '?'} · ${day(g.first)} → ${day(g.last)}${g.noise ? ` · ${g.noise}` : ''}`);
}
