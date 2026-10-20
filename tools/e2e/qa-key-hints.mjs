// QA (Claude 7): every key a player is told to press follows their bindings. Scans the string literals of every
// player-facing source (src/data: quests, dialogue, lore, npcs, tips, items, builds text; UI code: src/ui,
// src/narrative/client, src/world/render, src/systems/view, src/scenes) for:
//   hard-coded keys   "press F", "hold Shift", "tap Q", "Space to dash", "[F]", "(J)", "I to open", "WASD", "right-click"
//                     (Esc / Enter / Space-or-Enter to continue / arrows are fixed menu keys: allowed)
//   unknown actions   {key:<action>} tokens and keyLabel('<action>') calls naming an action Settings doesn't have
// Every key reference must be a {key:action} token (data) or keyLabel / formatKeys (code). Node only, no bundling.
//   node tools/e2e/qa-key-hints.mjs [--verbose] [--selftest: 8 bad strings caught, 4 good ones pass]
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const VERBOSE = process.argv.includes('--verbose');
const ROOTS = ['src/data', 'src/ui', 'src/narrative/client', 'src/world/render', 'src/systems/view', 'src/scenes'];
const settings = readFileSync('src/core/settings.ts', 'utf8');
const ACTIONS = new Set([...settings.match(/export type Action =([\s\S]*?);/)[1].matchAll(/'([a-zA-Z0-9]+)'/g)].map((m) => m[1]).concat(['move']));
// keys a player could rebind: the default letters plus Space/Shift/Tab/Ctrl/Alt/digits (Esc, Enter, arrows are menu keys)
// capital letters only ("hold a line" is an article); digits are the fixed dialogue-choice keys, except in a cast hint
const KEY = String.raw`(?:[A-Z]|Space(?:bar)?|Shift|Ctrl|Control|Alt|Tab|LMB|RMB)`;
const RULES = [
  [new RegExp(String.raw`\b(?:[Pp]ress|[Hh]old|[Tt]ap|[Hh]it|[Uu]se)\s+(?:the\s+)?${KEY}(?:\s+key)?\b(?!['’]s)(?![a-z])`), 'hard-coded key'],
  [/\b(?:press|hold|tap)\s+[1-9]\s+to\s+(?:cast|use|drink|dash)\b|\b[1-9]\s+to\s+cast\b/i, 'hard-coded cast key'],
  [new RegExp(String.raw`\[${KEY}\]`), 'hard-coded [key]'],
  [new RegExp(String.raw`\((?:[FIJKBMPTLQERWASD])\)`), 'hard-coded (key)'],
  [new RegExp(String.raw`\b(?:[FIJKBMPTLQER])\s+to\s+(?:open|close|talk|use|interact|track|dash|cast|drink|read|search|wake|revive|skip|pick|loot|enter|leave)\b`), 'hard-coded key hint'],
  [/\b(?:Space|Shift|Tab|Ctrl)\s+to\s+(?:dash|run|sprint|dodge|roll|jump|cast|use|switch|swap|track)\b/i, 'hard-coded key hint'],
  [/\bWASD\b/, 'hard-coded WASD (use {key:move})'],
  [/\b(?:right|middle)[- ]click/i, 'right/middle click (no handler: the game uses the left button only)'],
];
// --selftest: known-bad strings must all be caught and known-good prose must all pass, or the scan is blind
if (process.argv.includes('--selftest')) {
  const flagged = (s) => RULES.some(([re]) => re.test(s)) || [...s.matchAll(/\{key:([a-zA-Z0-9]+)\}/g)].some((t) => !ACTIONS.has(t[1]));
  const badOnes = ['Press F to talk', '[E] Use the lever', 'Open your pack (I)', 'Space to dash', 'Move with WASD', 'Right-click to drop', 'Hold Shift to sprint', 'Use {key:jump} to leap'];
  const goodOnes = ['She could hold a breach with a broom.', 'Press 1 or 2', 'chains hit 1 more foe', 'Talk with {key:interact}, move with {key:move}'];
  const miss = badOnes.filter((s) => !flagged(s)), wrong = goodOnes.filter(flagged);
  for (const s of miss) console.log(`FAIL selftest: not caught "${s}"`);
  for (const s of wrong) console.log(`FAIL selftest: flagged good prose "${s}"`);
  const n = badOnes.length + goodOnes.length, f = miss.length + wrong.length;
  console.log(`\n${n - f}/${n} passed`);
  process.exit(f ? 1 : 0);
}
const files = [];
const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (p.endsWith('.ts')) files.push(p); } };
for (const r of ROOTS) walk(r);

let scanned = 0; const bad = [];
for (const f of files) {
  const src = readFileSync(f, 'utf8').split('\n');
  src.forEach((line, i) => {
    const code = line.replace(/\/\/.*$/, '');
    if (/^\s*(\*|\/\*|import |export \{)/.test(line)) return;
    // keyLabel('x') / formatKeys calls naming an unknown action
    for (const m of code.matchAll(/keyLabel\(\s*'([a-zA-Z0-9]+)'/g)) if (!ACTIONS.has(m[1])) bad.push(`${f}:${i + 1}: keyLabel('${m[1]}') names no action`);
    // player-facing literals: quoted strings with a space in them (identifiers and keys have none)
    for (const m of code.matchAll(/'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)) {
      const s = (m[1] ?? m[2] ?? m[3] ?? '').replace(/\$\{[^}]*\}/g, '…');
      if (!/\s/.test(s) || s.length < 4) continue;
      // logic, not text: event codes, key-code comparisons, CSS, regexes
      if (/ev\.(key|code)|KeyCodes|keydown-|isAction\(|style=|font:|px;/.test(code) && s.length < 30) continue;
      scanned++;
      for (const t of s.matchAll(/\{key:([a-zA-Z0-9]+)\}/g)) if (!ACTIONS.has(t[1])) bad.push(`${f}:${i + 1}: {key:${t[1]}} names no action :: "${s.slice(0, 90)}"`);
      for (const [re, why] of RULES) { const hit = s.match(re); if (hit) { bad.push(`${f}:${i + 1}: ${why} "${hit[0]}" :: "${s.slice(0, 110)}"`); break; } }
    }
  });
}
const byOwner = {};
const owner = (f) => /src[\\/](narrative|ui[\\/]narrative|data[\\/](quests|dialogue|lore|npcs|factions|tips))/.test(f) ? 'Claude 4' : /src[\\/](world|ui[\\/]map|data[\\/]regions)/.test(f) ? 'Claude 2' : /src[\\/](systems|ui[\\/]character|data[\\/](classes|traits|items|spells|skilltrees|enemies))/.test(f) ? 'Claude 3' : 'Claude 1 / Claude 6';
for (const b of bad) (byOwner[owner(b)] ??= []).push(b);
for (const [o, list] of Object.entries(byOwner)) {
  console.log(`FAIL ${o}: ${list.length} hard-coded or unknown key reference(s)`);
  for (const b of list.slice(0, VERBOSE ? 9999 : 8)) console.log('    ' + b);
  if (!VERBOSE && list.length > 8) console.log(`    … ${list.length - 8} more (--verbose)`);
}
if (!bad.length) console.log(`PASS every key reference in ${scanned} player-facing strings follows the bindings`);
console.log(`\n${scanned - bad.length}/${scanned} passed`);
process.exit(bad.length ? 1 : 0);
