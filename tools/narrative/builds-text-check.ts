/**
 * Builds text check (Claude 4): every frozen id in Claude 3 / Claude 5's builds tables has overlay text, every overlay id
 * exists, and the text keeps the house style (one line, curly apostrophes, no digits while numbers are tuned, no
 * placeholders, names unique). Usage: node $(node tools/narrative/build.mjs tools/narrative/builds-text-check.ts full)
 * SCHOOL=ash to narrow the perk/spell report; VERBOSE=1 lists every missing id.
 */
import { HC_SCHOOL_PERKS } from '@/data/skilltrees/hc/index';
import { HC_SHARED_KEYSTONES } from '@/data/skilltrees/hc/keystones';
import { HC_MASTERY } from '@/data/skilltrees/hc/mastery';
import { HC_KIT_SPELLS_NEW } from '@/data/spells/hc/kit-spells-new';
import { HC_SCHOOL_SPELL_DEFS } from '@/data/spells/hc/school-spells';
import { HC_AFFIXES } from '@/data/items/hc/affixes';
import { HC_BUILD_ITEMS, HC_RUNES } from '@/data/items/hc/build-items';
import { HC_UNIQUES } from '@/data/items/hc/uniques';
import { HC_HYBRIDS } from '@/data/items/hc/hybrid-sets';
import { AFFIX_TEXT, ITEM_TEXT, KEYSTONE_TEXT, MASTERY_TEXT, PERK_TEXT, RUNE_TEXT, SPELL_TEXT, UNIQUE_TEXT, HYBRID_TEXT } from '@/data/lore/hc-builds-text';

const SCHOOL = process.env.SCHOOL;
let bad = 0;
const out: string[] = [];
const fail = (m: string) => { bad++; out.push(`  ✗ ${m}`); };

function table(name: string, ids: string[], text: Record<string, { name?: string; flavour?: string; label?: string; lore?: string }>): void {
  const want = new Set(ids);
  const missing = ids.filter((id) => !text[id]);
  const orphans = Object.keys(text).filter((id) => !want.has(id));
  console.log(`${name.padEnd(9)} ${ids.length - missing.length}/${ids.length} written${orphans.length ? `, ${orphans.length} unknown ids` : ''}`);
  if (process.env.VERBOSE && missing.length) console.log(`          missing: ${missing.join(' ')}`);
  for (const id of orphans) fail(`${name}: ${id} is not a known id`);
  for (const [id, t] of Object.entries(text)) {
    for (const s of [t.name, t.flavour, t.label, t.lore].filter((x): x is string => typeof x === 'string')) {
      if (/'/.test(s)) fail(`${id}: straight apostrophe`);
      if (/\d/.test(s)) fail(`${id}: a digit (numbers are still being tuned): ${s}`);
      if (/\b(TODO|TBD|lorem|placeholder)\b/i.test(s)) fail(`${id}: placeholder`);
      if (/\n/.test(s)) fail(`${id}: more than one line`);
    }
    if (t.flavour !== undefined && (t.flavour.length < 12 || t.flavour.length > 160)) fail(`${id}: flavour is ${t.flavour.length} characters (12–160)`);
    if (t.lore !== undefined && (t.lore.length < 12 || t.lore.length > 200)) fail(`${id}: lore is ${t.lore.length} characters (12–200)`);
  }
}

const schools = HC_SCHOOL_PERKS.filter((s) => !SCHOOL || s.school === SCHOOL);
const perks = schools.flatMap((s) => [...s.classes.flatMap((c) => c.signature), ...s.perks]);
const classIds = new Set(schools.flatMap((s) => s.classes.map((c) => c.classId)));
const spells = [...HC_KIT_SPELLS_NEW, ...HC_SCHOOL_SPELL_DEFS].filter((sp) => !SCHOOL || sp.school === SCHOOL);
table('perks', perks.map((p) => p.id), SCHOOL ? Object.fromEntries(Object.entries(PERK_TEXT).filter(([id]) => perks.some((p) => p.id === id))) : PERK_TEXT);
table('spells', spells.map((s) => s.id), SCHOOL ? Object.fromEntries(Object.entries(SPELL_TEXT).filter(([id]) => spells.some((s) => s.id === id))) : SPELL_TEXT);
if (!SCHOOL) {
  table('keystones', HC_SHARED_KEYSTONES.map((k) => k.id), KEYSTONE_TEXT);
  table('mastery', HC_MASTERY.map((m) => `${m.classId}:${m.weapon}`), MASTERY_TEXT);
  table('affixes', HC_AFFIXES.map((a) => a.id), AFFIX_TEXT);
  table('runes', HC_RUNES.map((r) => r.id), RUNE_TEXT);
  table('items', HC_BUILD_ITEMS.filter((i) => i.cat !== 'rune').map((i) => i.id), ITEM_TEXT);
  table('uniques', HC_UNIQUES.map((u) => u.id), UNIQUE_TEXT);
  table('hybrids', HC_HYBRIDS.map((h) => h.schools.join('+')), HYBRID_TEXT);
} else void classIds;

// display names stay unique across perks, keystones, spells, uniques and hybrid sets (a renamed spell must not collide with a perk)
const names = new Map<string, string[]>();
const add = (id: string, n: string) => names.set(n, [...(names.get(n) ?? []), id]);
for (const p of perks) add(p.id, PERK_TEXT[p.id]?.name ?? p.name);
for (const s of spells) add(s.id, SPELL_TEXT[s.id]?.name ?? s.name);
if (!SCHOOL) for (const k of HC_SHARED_KEYSTONES) add(k.id, KEYSTONE_TEXT[k.id]?.name ?? k.name);
if (!SCHOOL) for (const u of HC_UNIQUES) add(u.id, UNIQUE_TEXT[u.id]?.name ?? u.name);
if (!SCHOOL) for (const h of HC_HYBRIDS) { const k = h.schools.join('+'); add(k, HYBRID_TEXT[k]?.name ?? h.name); }
for (const [n, ids] of names) if (ids.length > 1) fail(`name “${n}” used by ${ids.join(', ')}`);

for (const l of out) console.log(l);
console.log(bad ? `${bad} problem(s)` : 'STYLE OK');
