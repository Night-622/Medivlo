// QA (Claude 7): the player docs say only true things. Fact-checks docs/BUILD-IDEAS.md and docs/PATCH-NOTES.md against
// the game data (names as players see them, after the builds-text overlay):
//   BUILD-IDEAS, per build: the 1st pick is a school keystone in that class's tree, the 2nd a shared keystone the class
//     is offered (KEYSTONE_OFFERS), the armour is "your <School> armour" or a named hybrid with exactly those schools
//     (one of them the class's), the "Tome of X" is a tome spell from another school; "Level 12" holds (the two
//     keystones' cheapest unlock paths fit in the points of level 12) and the "~11 points" intro claim
//   PATCH-NOTES: default keys, rarity names, the affix words quoted, counts (uniques, spells, school spells), hybrid
//     names, the buffed spells, the "A Smith's Eye" quest, the smith's quoted choice, potion names (draughts/tonics)
// Node only.   node tools/e2e/qa-docs-facts.mjs [--verbose]
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const VERBOSE = process.argv.includes('--verbose');
const dir = mkdtempSync(join(tmpdir(), 'qa-docs-facts-'));
const entry = join(dir, 'entry.ts');
writeFileSync(entry, String.raw`
import { Registry, DEFAULT_KEYS } from '@/core';
import type { QuestDef, DialogueDef } from '@/core';
import { CAMPAIGNS } from '@/narrative/engine/classes';
import { allNodes } from '@/systems/rules/tree';
import { HC_HYBRIDS } from '@/data/items/hc/hybrid-sets';
import { HC_TOMES } from '@/data/items/hc/build-items';
import { KEYSTONE_OFFERS } from '@/data/skilltrees/hc/keystones';
import { HC_SHARED_KEYSTONES } from '@/data/skilltrees/hc/keystones';
import { HC_AFFIXES } from '@/data/items/hc/affixes';
import { HC_UNIQUES } from '@/data/items/hc/uniques';
import { HC_KIT_SPELLS_NEW } from '@/data/spells/hc/kit-spells-new';
import { HC_SCHOOL_SPELL_DEFS } from '@/data/spells/hc/school-spells';
import { spellDef } from '@/systems/rules/spells';
import { displayName, affixLabel } from '@/systems/rules/buildText';
import { rarityLabel } from '@/systems/rules/describeHc';
import { itemInfo } from '@/systems/rules/gear';
import { RARITY_ORDER } from '@/systems/rules/types';
import { SCHOOL_NAME } from '@/data/classes/hc';
const out: Record<string, unknown> = {};
out.classes = Object.fromEntries(CAMPAIGNS.map((c) => {
  const nodes = allNodes(c.id);
  // cheapest set of nodes that unlocks n (free nodes cost nothing; any-of takes the cheapest requirement)
  const memo = new Map<string, Set<string>>();
  const need = (id: string): Set<string> => {
    if (memo.has(id)) return memo.get(id)!;
    const n = nodes.find((x) => x.id === id)!; const s = new Set<string>(n.free ? [] : [id]);
    const rq = n.req.map(need);
    if (rq.length) { if (n.reqAny) { const best = rq.sort((a, b) => a.size - b.size)[0]; best.forEach((x) => s.add(x)); } else rq.forEach((r) => r.forEach((x) => s.add(x))); }
    memo.set(id, s); return s;
  };
  const tops = nodes.filter((n) => n.kind === 'top' && !n.shared).map((n) => ({ id: n.id, name: n.name, branch: n.branch, cost: need(n.id).size, need: [...need(n.id)] }));
  const shared = nodes.filter((n) => n.shared).map((n) => ({ id: n.id, name: n.name, cost: need(n.id).size, need: [...need(n.id)] }));
  return [c.id, { school: c.school, schoolName: SCHOOL_NAME[c.school], tops, shared, offers: (KEYSTONE_OFFERS[c.id] ?? []).map((k) => displayName('keystone', k, HC_SHARED_KEYSTONES.find((x) => x.id === k)?.name ?? k)) }];
}));
out.hybrids = HC_HYBRIDS.map((h) => ({ name: displayName('hybrid', h.schools[0] + '+' + h.schools[1], h.name), schools: h.schools.map((s) => SCHOOL_NAME[s]) }));
out.tomes = HC_TOMES.map((t) => ({ spell: spellDef(t.spell)?.name ?? t.spell, school: SCHOOL_NAME[t.school] }));
out.affixLabels = HC_AFFIXES.map((a) => affixLabel(a.id) ?? '').filter(Boolean);
out.rarities = RARITY_ORDER.map(rarityLabel);
out.uniques = HC_UNIQUES.length; out.kitNew = HC_KIT_SPELLS_NEW.length; out.schoolSpells = HC_SCHOOL_SPELL_DEFS.length;
out.spellNames = [...HC_KIT_SPELLS_NEW, ...HC_SCHOOL_SPELL_DEFS].map((s) => spellDef(s.id)?.name ?? s.name).concat((Registry.all('spell' as never) as { name: string }[]).map((s) => s.name));
out.questNames = (Registry.all('quest') as QuestDef[]).map((q) => q.name);
out.choices = (Registry.all('dialogue') as DialogueDef[]).flatMap((d) => Object.values(d.nodes).flatMap((n) => (n.choices ?? []).map((c) => c.text)));
out.keys = DEFAULT_KEYS;
out.potions = ['i_hp_s', 'i_em_s', 'i_hp_m', 'i_em_m', 'i_hp_l', 'i_em_l'].map((id) => itemInfo(id)?.name).filter(Boolean);
console.log('JSON ' + JSON.stringify(out));
`);
const outFile = join(dir, 'entry.mjs');
let data;
try {
  execFileSync(process.execPath, ['tools/narrative/build.mjs', entry, 'full'], { env: { ...process.env, OUT: outFile }, stdio: ['ignore', 'ignore', 'inherit'] });
  data = JSON.parse(execFileSync(process.execPath, [outFile], { encoding: 'utf8', maxBuffer: 64 << 20 }).split('\n').find((l) => l.startsWith('JSON ')).slice(5));
} catch (e) { console.log(`FAIL harness :: ${String(e.message).split('\n')[0]}\n\n0/1 passed`); process.exit(1); }

let pass = 0, fail = 0;
const check = (what, ok, detail = '') => { if (ok) pass++; else fail++; if (!ok || VERBOSE) console.log(`${ok ? 'PASS' : 'FAIL'} ${what}${detail ? ` :: ${detail}` : ''}`); return ok; };
const norm = (s) => s.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').trim();
const findName = (list, n) => list.find((x) => norm(x) === norm(n));

// ── BUILD-IDEAS ──
const ideas = readFileSync('docs/BUILD-IDEAS.md', 'utf8').replace(/\r/g, '').replace(/\n {2}(?=\S)/g, ' ').split('\n'); // join wrapped bullet lines
let cls = null;
const LEVEL = 12;
for (const raw of ideas) {
  const h = raw.match(/^\*\*([A-Z][a-z]+)\*\*\s*$/); if (h && data.classes[h[1].toLowerCase()]) { cls = h[1].toLowerCase(); continue; }
  const m = raw.match(/^- \*\*(.+?):\*\* (.+?)\. /); if (!m || !cls) continue;
  const C = data.classes[cls], build = `${cls} "${m[1]}"`;
  const picks = m[2].split(/,\s*/);
  const top = C.tops.find((t) => norm(t.name) === norm(picks[0]));
  check(`${build}: "${picks[0]}" is a school keystone in the ${cls} tree`, !!top, `class tops: ${C.tops.map((t) => t.name).join(', ')}`);
  const sh = C.shared.find((t) => norm(t.name) === norm(picks[1])) && findName(C.offers, picks[1]);
  check(`${build}: "${picks[1]}" is a shared keystone ${cls} is offered`, !!sh, `${cls} offers: ${C.offers.join(', ')}`);
  const armour = picks[2] ?? '';
  const own = armour.match(/^your (\w+) armour$/i), hyb = armour.match(/^the (.+?) hybrid(?: \((\w+) \+ (\w+)\))?$/i);
  if (own) check(`${build}: "${armour}" names the class's own school`, norm(own[1]) === norm(C.schoolName), `class school ${C.schoolName}`);
  else if (hyb) {
    const H = data.hybrids.find((x) => norm(x.name) === norm(hyb[1]));
    check(`${build}: the "${hyb[1]}" hybrid exists`, !!H, `hybrids: ${data.hybrids.map((x) => x.name).join(', ')}`);
    if (H) check(`${build}: the ${hyb[1]} hybrid includes ${C.schoolName}`, H.schools.some((s) => norm(s) === norm(C.schoolName)), `its schools: ${H.schools.join(' + ')}`);
    if (H && hyb[2]) check(`${build}: the ${hyb[1]} hybrid is ${hyb[2]} + ${hyb[3]}`, [hyb[2], hyb[3]].every((s) => H.schools.some((x) => norm(x) === norm(s))), `really ${H.schools.join(' + ')}`);
  } else check(`${build}: armour "${armour}" is "your <School> armour" or "the <Name> hybrid"`, false);
  const tome = picks.find((p) => /^Tome of /.test(p));
  if (tome) { const T = data.tomes.find((t) => norm(t.spell) === norm(tome.slice(8)));
    check(`${build}: "${tome}" is a real tome`, !!T, 'no school spell by that name');
    if (T) check(`${build}: "${tome}" teaches another school's spell`, norm(T.school) !== norm(C.schoolName), `${T.spell} is ${T.school}`); }
  if (top && sh) { const shN = C.shared.find((t) => norm(t.name) === norm(picks[1])); const need = new Set([...top.need, ...shN.need]);
    check(`${build}: both keystones unlock by level ${LEVEL}`, need.size <= LEVEL - 1, `${need.size} points needed → level ${need.size + 1}`); }
}
// intro claim: "The two keystones need about 11 skill points"
const costs = Object.values(data.classes).flatMap((C) => C.tops.flatMap((t) => C.shared.map((s) => new Set([...t.need, ...s.need]).size)));
check('BUILD-IDEAS intro: "the two keystones need about 11 skill points"', Math.min(...costs) >= 9 && Math.max(...costs) <= 13, `cheapest pair ${Math.min(...costs)}, dearest ${Math.max(...costs)} points`);

// ── PATCH-NOTES ──
const notes = readFileSync('docs/PATCH-NOTES.md', 'utf8');
const ACT = { Skills: 'skills', Codex: 'codex', Journal: 'journal', Map: 'map', Spells: 'spells', Pack: 'inventory' };
for (const m of notes.matchAll(/\b(Skills|Codex|Journal|Map|Spells|Pack) \(([A-Z])\)/g)) check(`PATCH-NOTES: ${m[1]} is ${m[2]} by default`, data.keys[ACT[m[1]]] === m[2], `default ${data.keys[ACT[m[1]]]}`);
const rr = notes.match(/from (\w+) to (\w+)/); if (rr) check(`PATCH-NOTES: rarities run ${rr[1]} → ${rr[2]}`, data.rarities[0] === rr[1] && data.rarities[data.rarities.length - 1] === rr[2], data.rarities.join(', '));
for (const m of notes.matchAll(/“([^”]+)”/g)) {
  const q = m[1];
  if (/^(Lamp-lit|of [A-Z])/.test(q)) check(`PATCH-NOTES: affix word "${q}" exists`, !!findName(data.affixLabels, q), '');
  else if (/Smith’s Eye/.test(q)) check(`PATCH-NOTES: quest "${q}" exists`, !!findName(data.questNames, q), '');
  else if (/stronger/i.test(q)) check(`PATCH-NOTES: smith choice "${q}" exists`, data.choices.some((c) => norm(c) === norm(q)), '');
}
const uq = notes.match(/(\d+) of them/); if (uq) check('PATCH-NOTES: unique count', Number(uq[1]) === data.uniques, `data ${data.uniques}`);
const ks = notes.match(/(\d+) new class spells/); if (ks) check('PATCH-NOTES: new class spells count', Number(ks[1]) === data.kitNew, `data ${data.kitNew}`);
const ss = notes.match(/the (\d+) school spells/); if (ss) check('PATCH-NOTES: school spells count', Number(ss[1]) === data.schoolSpells, `data ${data.schoolSpells}`);
const hy = notes.match(/such as ([^.]+)\./); if (hy) for (const n of hy[1].split(/,\s*|\s+or\s+/)) check(`PATCH-NOTES: hybrid "${n}" exists`, !!data.hybrids.find((x) => norm(x.name) === norm(n)), '');
const buff = notes.match(/stronger: ([^.]+)\./); if (buff) for (const n of buff[1].split(/,\s*|\s+and\s+/)) check(`PATCH-NOTES: spell "${n}" exists`, !!findName(data.spellNames, n), '');
if (/draughts and tonics/.test(notes)) check('PATCH-NOTES: potions are named draughts and tonics', data.potions.some((p) => /draught/i.test(p)) && data.potions.some((p) => /tonic/i.test(p)), data.potions.join(', '));
console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
