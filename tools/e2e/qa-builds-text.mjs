// QA (Claude 7): the deeper-builds content reads cleanly. For perks (school + class signature), shared keystones, hybrid sets,
// weapon mastery, the new kit spells, school spells, runes, uniques, affixes and build materials/tomes:
//   coverage: every mechanics id has its text overlay entry (src/data/lore/hc-builds-text.ts: flavour, or an affix label)
//   names:    the name a player sees (overlay name ?? working name) is a proper name (capitalised, no ids, no '_')
//   text:     mechanical lines (one per rank for perks) have no raw {tokens}, NaN/undefined, long decimals
//             (0.30000000004), sign glitches (+-), double spaces or placeholders; flavour quotes no numbers
//   wired:    renamed spells show their new name (spellDef), item titles carry affix words, unique tooltips their flavour
//   tooltips: every line describeHc.itemTooltip() writes for ~400 seeded rolled items (weapons + armour, ilvl 3–40,
//             upgrades 0–5) passes the same text checks
// Expect coverage FAILs while Claude 4's text is still landing. Node only.
//   node tools/e2e/qa-builds-text.mjs [--verbose] [--only perks,spells,…]
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const dir = mkdtempSync(join(tmpdir(), 'qa-builds-text-'));
const entry = join(dir, 'entry.ts');
writeFileSync(entry, String.raw`
import { HC_SCHOOL_PERKS } from '@/data/skilltrees/hc/index';
import { HC_SHARED_KEYSTONES } from '@/data/skilltrees/hc/keystones';
import { HC_MASTERY } from '@/data/skilltrees/hc/mastery';
import { HC_KIT_SPELLS_NEW } from '@/data/spells/hc/kit-spells-new';
import { HC_SCHOOL_SPELL_DEFS } from '@/data/spells/hc/school-spells';
import { HC_RUNES, HC_BUILD_ITEMS } from '@/data/items/hc/build-items';
import { HC_UNIQUES } from '@/data/items/hc/uniques';
import { HC_AFFIXES } from '@/data/items/hc/affixes';
import { HC_WEAPONS } from '@/data/items/hc/weapons.gen';
import { HC_PIECES } from '@/data/items/hc/armour.gen';
import { PERK_TEXT, SPELL_TEXT, KEYSTONE_TEXT, MASTERY_TEXT, AFFIX_TEXT, RUNE_TEXT, ITEM_TEXT, UNIQUE_TEXT, HYBRID_TEXT } from '@/data/lore/hc-builds-text';
import { HC_HYBRIDS } from '@/data/items/hc/hybrid-sets';
import { itemTooltip } from '@/systems/rules/describeHc';
import { rollInstance } from '@/systems/rules/affixes';
import { Rng } from '@/core/rng';
import { spellDef } from '@/systems/rules/spells';
import { uniqueInstance } from '@/systems/rules/uniques';

const ONLY = (process.env.QA_ONLY ?? '').split(',').filter(Boolean);
const VERBOSE = process.env.QA_VERBOSE === '1';
const BAD: [RegExp, string][] = [
  [/NaN|undefined|\bnull\b|Infinity|\[object/, 'broken value'],
  [/\{[^}]*\}/, 'raw {token}'],
  [/\d\.\d{3,}/, 'long decimal'],
  [/\+\s*-\s*\d|\+\+|--\d/, 'sign glitch'],
  [/ {2,}/, 'double space'],
  [/^\s|\s$/, 'stray whitespace'],
  [/\bTODO\b|\bTBD\b|FIXME|lorem ipsum/i, 'placeholder'],
  [/\s[,.;:]/, 'space before punctuation'],
];
const textProblem = (t: unknown): string | null => {
  if (typeof t !== 'string' || !t.trim()) return 'empty';
  for (const [re, why] of BAD) if (re.test(t)) return why + ' in "' + t.slice(0, 90) + '"';
  return null;
};
const nameProblem = (name: unknown, id: string): string | null => {
  if (typeof name !== 'string' || !name.trim()) return 'no name';
  if (name === id || /_/.test(name)) return 'name looks like an id: "' + name + '"';
  if (!/^[A-Z0-9'’"(«]/.test(name)) return 'name not capitalised: "' + name + '"';
  return textProblem(name);
};
const flavourProblem = (f: unknown): string | null => {
  if (typeof f !== 'string' || !f.trim()) return 'no flavour';
  if (/\d/.test(f)) return 'flavour quotes a number: "' + f.slice(0, 90) + '"';
  return textProblem(f);
};

type Row = { cat: string; id: string; problems: string[] };
const rows: Row[] = [];
const add = (cat: string, id: string, ...problems: (string | null)[]) => rows.push({ cat, id, problems: problems.filter((p): p is string => !!p) });

// ── perks: school perks + each class's 12 signature perks ──
for (const sp of HC_SCHOOL_PERKS) {
  const all = [...sp.perks, ...sp.classes.flatMap((c) => c.signature)];
  for (const p of all) {
    const o = PERK_TEXT[p.id];
    add('perks', p.id, o ? null : 'no text overlay entry', o ? flavourProblem(o.flavour) : null, nameProblem(o?.name ?? p.name, p.id),
      p.text.length !== p.ranks ? 'text has ' + p.text.length + ' lines for ' + p.ranks + ' ranks' : null, ...p.text.map(textProblem));
  }
}
for (const k of HC_SHARED_KEYSTONES) {
  const o = KEYSTONE_TEXT[k.id];
  add('keystones', k.id, o ? null : 'no text overlay entry', o ? flavourProblem(o.flavour) : null, nameProblem(o?.name ?? k.name, k.id), ...k.text.map(textProblem));
}
for (const m of HC_MASTERY) {
  const key = m.classId + ':' + m.weapon, o = MASTERY_TEXT[key];
  add('mastery', key, o ? null : 'no text overlay entry', o ? flavourProblem(o.flavour) : null, nameProblem(o?.name ?? m.name, key), textProblem(m.text));
}
for (const [cat, list] of [['kit spells', HC_KIT_SPELLS_NEW], ['school spells', HC_SCHOOL_SPELL_DEFS]] as const) {
  for (const s of list) {
    const o = SPELL_TEXT[s.id];
    add(cat, s.id, o ? null : 'no text overlay entry', o ? flavourProblem(o.flavour) : null, nameProblem(o?.name ?? s.name, s.id), textProblem(s.desc));
  }
}
for (const r of HC_RUNES) {
  const o = RUNE_TEXT[r.id];
  add('runes', r.id, o ? null : 'no text overlay entry', o ? flavourProblem(o.flavour) : null, nameProblem(o?.name ?? r.name, r.id), textProblem(r.desc));
}
for (const u of HC_UNIQUES) {
  const o = UNIQUE_TEXT[u.id];
  add('uniques', u.id, o ? null : 'no text overlay entry', o ? flavourProblem(o.flavour) : null, nameProblem(o?.name ?? u.name, u.id), textProblem(u.text), o?.lore ? textProblem(o.lore) : null);
}
for (const a of HC_AFFIXES) {
  const o = AFFIX_TEXT[a.id];
  const v = (a.text.match(/\{v\}/g) ?? []).length;
  const samples = a.tiers.flatMap((t) => [t.min, t.max]).map((x) => a.text.replace('{v}', String(Math.round(x * 100))));
  // suffix labels follow the base name and start in lower case: "Iron Sword of the Bear"
  const label = o && a.kind === 'suffix' ? o.label.replace(/^of /, 'Of ') : o?.label;
  add('affixes', a.id, o ? null : 'no label (item-name word)', o ? nameProblem(label, a.id) : null, v > 1 ? '{v} appears ' + v + ' times' : null,
    ...samples.map(textProblem));
}
for (const h of HC_HYBRIDS) {
  const key = h.schools[0] + '+' + h.schools[1], o = HYBRID_TEXT[key];
  add('hybrid sets', key, o ? null : 'no text overlay entry', o ? flavourProblem(o.flavour) : null, nameProblem(o?.name ?? h.name, key), textProblem(h.text));
}
for (const it of HC_BUILD_ITEMS) {
  const o = ITEM_TEXT[it.id] ?? RUNE_TEXT[it.id]; // rune items share the rune's id and text
  add('materials & tomes', it.id, o ? null : 'no text overlay entry', o ? flavourProblem(o.flavour) : null, nameProblem(o?.name ?? (it as { name?: string }).name, it.id), textProblem((it as { desc?: string }).desc));
}

// ── tooltips of rolled items ──
const rng = new Rng(20261021);
const bases = [...HC_WEAPONS.map((w) => w.id), ...HC_PIECES.map((p) => p.id)].filter((_, i) => i % 2 === 0);
let tipItems = 0;
for (const [i, base] of bases.entries()) {
  const ilvl = [3, 12, 24, 40][i % 4];
  const it = { uid: 'qa' + i, base, ilvl, qty: 1, upgrade: i % 6, ...rollInstance(rng, base, ilvl, i % 3) } as never;
  let lines: { text: string }[] = [];
  try { lines = itemTooltip(it, [], 'ash' as never, []); } catch (e) { add('tooltips', base + '@' + ilvl, 'itemTooltip threw ' + String(e).slice(0, 100)); continue; }
  tipItems++;
  add('tooltips', base + '@' + ilvl + (i % 6 ? ' +' + (i % 6) : ''), lines.length ? null : 'no lines', ...lines.map((l) => textProblem(l.text)));
}

// ── wired: the overlay reaches what the UI draws (names via the defs, flavour and affix words via the tooltips) ──
for (const [id, t] of Object.entries(SPELL_TEXT)) {
  if (!t.name) continue;
  const shown = spellDef(id)?.name;
  add('wired', 'spell ' + id, shown === t.name ? null : 'spell name shows "' + shown + '", overlay says "' + t.name + '"');
}
const sword = HC_WEAPONS[0]?.id;
for (const a of HC_AFFIXES.filter((x) => x.kind === 'prefix' && AFFIX_TEXT[x.id]).slice(0, 12)) {
  const it = { uid: 'qa-' + a.id, base: sword, ilvl: 40, qty: 1, rarity: 'wrought', affixes: [{ id: a.id, v: a.tiers[0]?.min ?? 0.1 }] } as never;
  const title = itemTooltip(it, [], 'ash' as never, [])[0]?.text ?? '';
  add('wired', 'affix ' + a.id, title.includes(AFFIX_TEXT[a.id].label) ? null : 'item title "' + title + '" lacks the affix word "' + AFFIX_TEXT[a.id].label + '"');
}
for (const u of HC_UNIQUES.filter((x) => UNIQUE_TEXT[x.id]).slice(0, 12)) {
  const it = { uid: 'qa-' + u.id, ...uniqueInstance(u.id, 40) } as never; // built exactly as a drop is
  const lines = itemTooltip(it, [], 'ash' as never, []).map((l) => l.text);
  const want = UNIQUE_TEXT[u.id].flavour;
  add('wired', 'unique ' + u.id, lines.some((l) => l.includes(want.slice(0, 40))) ? null : 'tooltip lacks its flavour ("' + want.slice(0, 50) + '…")');
}

// hybrid sets: 2 cloth pieces of school A + 2 of school B worn → the piece's tooltip names the bonus as the overlay does
for (const h of HC_HYBRIDS) {
  const key = h.schools[0] + '+' + h.schools[1], want = HYBRID_TEXT[key]?.name ?? h.name;
  const piece = (s: string, p: string) => ({ uid: 'qa-' + s + p, base: 'a_' + s + '_cloth_' + p, ilvl: 20, qty: 1 });
  const worn = [piece(h.schools[0], 'helm'), piece(h.schools[0], 'chest'), piece(h.schools[1], 'hands'), piece(h.schools[1], 'feet')];
  const lines = itemTooltip(worn[0] as never, worn as never, h.schools[0] as never, []).map((l) => l.text);
  add('wired', 'hybrid ' + key, lines.some((l) => l.startsWith('Hybrid: ' + want + '.')) ? null : 'hybrid line is "' + (lines.find((l) => l.startsWith('Hybrid')) ?? 'missing') + '", want "Hybrid: ' + want + '."');
}

const cats = [...new Set(rows.map((r) => r.cat))];
for (const cat of cats) {
  if (ONLY.length && !ONLY.some((o) => cat.startsWith(o))) continue;
  const mine = rows.filter((r) => r.cat === cat), bad = mine.filter((r) => r.problems.length);
  const why: Record<string, number> = {};
  for (const r of bad) for (const p of r.problems) { const k = p.replace(/ \(".*$/, '').replace(/:? ".*$/, '').replace(/ in$/, ''); why[k] = (why[k] ?? 0) + 1; }
  console.log((bad.length ? 'FAIL ' : 'PASS ') + cat + ': ' + (mine.length - bad.length) + '/' + mine.length + ' clean' + (bad.length ? ' :: ' + Object.entries(why).map(([k, n]) => k + ' ×' + n).join(', ') : '') + (cat === 'tooltips' ? ' (' + tipItems + ' rolled items)' : ''));
  for (const r of bad.slice(0, VERBOSE ? 9999 : 3)) console.log('    ' + r.id + ': ' + r.problems.join('; '));
  if (!VERBOSE && bad.length > 3) console.log('    … ' + (bad.length - 3) + ' more (--verbose)');
  console.log('ROW ' + (mine.length - bad.length) + ' ' + mine.length);
}
`);
const out = join(dir, 'entry.mjs');
let res = '';
try {
  execFileSync(process.execPath, ['tools/narrative/build.mjs', entry, 'full'], { env: { ...process.env, OUT: out }, stdio: ['ignore', 'ignore', 'inherit'] });
  res = execFileSync(process.execPath, [out], { env: { ...process.env, QA_ONLY: arg('only', ''), QA_VERBOSE: process.argv.includes('--verbose') ? '1' : '0' }, encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'pipe'] });
} catch (e) { res = `${e.stdout ?? ''}\nFAIL harness :: ${String(e.message).split('\n')[0]}\nROW 0 1`; }
for (const l of res.split('\n')) if (/^(PASS|FAIL|    )/.test(l)) console.log(l);
const rows = [...res.matchAll(/^ROW (\d+) (\d+)/gm)].map((m) => [Number(m[1]), Number(m[2])]);
const passed = rows.reduce((n, r) => n + r[0], 0), total = rows.reduce((n, r) => n + r[1], 0);
console.log(`\n${passed}/${total || 1} passed`);
process.exit(total && passed === total ? 0 : 1);
