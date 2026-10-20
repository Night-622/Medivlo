/**
 * Build teaching check (Claude 4): every first-time build hint has its Codex entry, a trigger in tutorial.ts, valid
 * `{key:…}` tokens and house style; every craft Codex entry ends in one plain "How it works:" paragraph; no player-facing
 * tip or hint names a fixed key letter. Part of check.sh.
 * Usage: node $(node tools/narrative/build.mjs tools/narrative/build-hints-check.ts full)
 */
import { readFileSync } from 'node:fs';
import { DEFAULT_KEYS, Registry } from '@/core';
import type { LoreEntry } from '@/core';
import { BUILD_HINTS } from '@/data/tips/hc-build-hints';
import { TIPS } from '@/data/tips/hc-tips';

let bad = 0;
const fail = (m: string) => { bad++; console.log(`  ✗ ${m}`); };
const actions = new Set(Object.keys(DEFAULT_KEYS));
const tutorial = readFileSync('src/narrative/client/tutorial.ts', 'utf8');

function style(id: string, s: string): void {
  if (/'/.test(s)) fail(`${id}: straight apostrophe`);
  if (/\d/.test(s)) fail(`${id}: a digit (numbers are still tuned)`);
  if (/\b(TODO|TBD|lorem|placeholder)\b/i.test(s)) fail(`${id}: placeholder`);
  for (const [, a] of s.matchAll(/\{key:([a-zA-Z0-9]+)\}/g)) if (a !== 'move' && !actions.has(a)) fail(`${id}: unknown key action {key:${a}}`);
  // a fixed letter where a binding belongs ("press T", "(I)", "[E]")
  if (/\bpress [A-Z]\b|\([A-Z]\)|\[[A-Z]\]/.test(s.replace(/\{key:[a-zA-Z0-9]+\}/g, ''))) fail(`${id}: names a fixed key; use {key:<action>}`);
}

for (const [id, h] of Object.entries(BUILD_HINTS)) {
  style(`hint.${id}`, h.text);
  if (h.text.length > 140) fail(`hint.${id}: ${h.text.length} characters (one toast line, ≤ 140)`);
  if (!Registry.tryGet('lore', h.lore)) fail(`hint.${id}: no Codex entry ${h.lore}`);
  if (!tutorial.includes(`'${id}'`)) fail(`hint.${id}: no trigger in narrative/client/tutorial.ts`);
}
const craft = (Registry.all('lore') as LoreEntry[]).filter((e) => e.id.startsWith('lore:hc-craft-'));
for (const e of craft) {
  style(e.id, `${e.name} ${e.source ?? ''} ${e.body}`);
  const paras = e.body.split('\n\n');
  if (!paras[paras.length - 1].startsWith('How it works: ')) fail(`${e.id}: the last paragraph is not "How it works: …"`);
  if (paras.filter((p) => p.startsWith('How it works')).length !== 1) fail(`${e.id}: more than one "How it works" paragraph`);
  if (e.body.length > 900) fail(`${e.id}: ${e.body.length} characters (keep it short, ≤ 900)`);
  if (!Object.values(BUILD_HINTS).some((h) => h.lore === e.id)) fail(`${e.id}: no hint opens it`);
}
for (const [i, t] of TIPS.entries()) if (/\bpress [A-Z]\b|\([A-Z]\)|\[[A-Z]\]/.test(t.text.replace(/\{key:[a-zA-Z0-9]+\}/g, ''))) fail(`tip ${i}: names a fixed key: ${t.text}`);

console.log(`build hints ${Object.keys(BUILD_HINTS).length}, craft codex ${craft.length}, tips ${TIPS.length}: ${bad ? `${bad} problem(s)` : 'OK'}`);
process.exit(bad ? 1 : 0);
