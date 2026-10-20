/**
 * rules-props: uniques (Claude 5, docs/systems/BUILDS.md §5). 40 in all, every one of the 25 boss legendaries present
 * under its lg_* id with its own base; ids unique and resolvable (itemInfo); every u_* in exactly one loot table, the
 * one its home names (lg_* drop from their boss); two fixed affixes each, real, of different groups, fitting the
 * base's slot family, not class-locked, with values inside the affix's tier at the unique's minLevel; each effect does
 * something, passes the content guard, and names only hooks the sim reads.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { HC_AFFIXES } from '@/data/items/hc/affixes';
import { HC_LEGENDARIES } from '@/data/items/hc/legendary.gen';
import { HC_LOOT_TABLES } from '@/data/items/hc/lootTables';
import { HC_UNIQUES } from '@/data/items/hc/uniques';
import type { AffixSlot } from '@/systems/rules/affixTypes';
import { itemInfo } from '@/systems/rules/gear';
import type { Passive } from '@/systems/rules/types';
import { check } from './features-harness';

const SCALED = ['hp', 'ember', 'stamina', 'armor', 'sp', 'emberRegen', 'hpRegen', 'staminaRegen'];
const empty = (p: Passive): boolean => !(p.mods?.length || p.procs?.length || p.hooks?.length || p.spellMods?.length || p.convert?.length || p.aura?.length || p.spellLevels?.length);
/** hook ids the sim reads: quoted anywhere in src/systems/sim (hook(…, 'x') / hooks.get('x')) */
const SIM_SRC = readdirSync('src/systems/sim').filter((f) => f.endsWith('.ts')).map((f) => readFileSync(`src/systems/sim/${f}`, 'utf8')).join('\n');
const readBySim = (id: string): boolean => SIM_SRC.includes(`'${id}'`) || (id.startsWith('immune:') && SIM_SRC.includes('immune:'));

/** the affix slot families a base may roll in */
function familiesOf(base: string): AffixSlot[] {
  const i = itemInfo(base);
  if (!i) return [];
  if (i.slot === 'weapon') return i.weaponType === 'dagger' || i.weaponType === 'wand' ? ['weapon', 'offhand'] : ['weapon'];
  if (i.slot === 'head' || i.slot === 'chest' || i.slot === 'hands' || i.slot === 'feet' || i.slot === 'ring' || i.slot === 'amulet') return [i.slot];
  // legendary amulets on a relic base (i_tear): they are worn as amulets
  return ['amulet'];
}

export function uniqueProps(): void {
  const U = HC_UNIQUES, ids = U.map((x) => x.id);
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  const lg = HC_LEGENDARIES.map((l) => l.id), missingLg = lg.filter((x) => !ids.includes(x));
  const unresolved = U.filter((x) => !itemInfo(x.id) || !itemInfo(x.base)).map((x) => x.id);
  const lgBase = U.filter((x) => x.id.startsWith('lg_') && HC_LEGENDARIES.find((l) => l.id === x.id)?.base !== x.base).map((x) => x.id);
  check(U.length === 40 && !dup.length && !missingLg.length && !unresolved.length && !lgBase.length,
    `uniques: ${U.length} (all ${lg.length} legendaries under their lg_ ids and bases), ids unique, every id and base resolves`,
    [...dup.map((x) => `dup ${x}`), ...missingLg.map((x) => `missing ${x}`), ...unresolved.map((x) => `unresolved ${x}`), ...lgBase.map((x) => `base ${x}`)].join(', '));

  // homes: u_* in exactly the table its home names, nowhere else; lg_* from their boss
  const homeBad: string[] = [];
  for (const x of U) {
    const tables = HC_LOOT_TABLES.filter((t) => [...t.entries, ...(t.always ?? [])].some((e) => 'unique' in e && e.unique === x.id)).map((t) => t.id);
    if (x.id.startsWith('u_') ? tables.length !== 1 || tables[0] !== x.home : x.home !== 'boss' || tables.length) homeBad.push(`${x.id} home ${x.home} in [${tables.join(',')}]`);
  }
  const strayEntries = HC_LOOT_TABLES.flatMap((t) => t.entries.filter((e) => 'unique' in e && !ids.includes(e.unique)).map((e) => `${t.id}: ${(e as { unique: string }).unique}`));
  check(!homeBad.length && !strayEntries.length, 'uniques: every u_ sits in exactly its home table, legendaries drop from their boss, no table names an unknown unique', [...homeBad, ...strayEntries].slice(0, 4).join('; '));

  // affixes: real, two groups, fitting the base, not class-locked, inside the tier at minLevel
  const affBad: string[] = [];
  for (const x of U) {
    const L = x.minLevel ?? 1, fam = familiesOf(x.base);
    const defs = x.affixes.map((a) => [a, HC_AFFIXES.find((d) => d.id === a.id)] as const);
    if (x.affixes.length !== 2) affBad.push(`${x.id}: ${x.affixes.length} affixes`);
    if (new Set(defs.map(([, d]) => d?.group)).size !== defs.length) affBad.push(`${x.id}: same group twice`);
    for (const [a, d] of defs) {
      if (!d) { affBad.push(`${x.id}: unknown ${a.id}`); continue; }
      const t = [...d.tiers].reverse().find((y) => y.ilvl <= L);
      if (d.only) affBad.push(`${x.id}: ${a.id} is class-locked`);
      if (!d.slots.some((s) => fam.includes(s))) affBad.push(`${x.id}: ${a.id} doesn't roll on ${fam.join('/')}`);
      if (d.minIlvl > L || !t || a.v < t.min - 1e-9 || a.v > t.max + 1e-9) affBad.push(`${x.id}: ${a.id} v ${a.v} outside its tier at L${L}`);
    }
  }
  check(!affBad.length, 'uniques: 2 fixed affixes each, real, different groups, fitting the base, inside their tier at the minLevel', affBad.slice(0, 4).join('; '));

  // effects
  const fxBad: string[] = [];
  for (const x of U) {
    const e = x.effect;
    if (empty(e) || !x.text || /undefined|NaN|…/.test(x.text)) fxBad.push(`${x.id}: empty effect or text`);
    for (const m of e.mods ?? []) if (m.when && SCALED.includes(m.stat) && m.op !== 'flat') fxBad.push(`${x.id}: conditional ${m.op} ${m.stat}`);
    for (const h of e.hooks ?? []) if (!readBySim(h.id)) fxBad.push(`${x.id}: hook ${h.id} not read by the sim`);
  }
  check(!fxBad.length, 'uniques: every effect does something, passes the guard, and uses only hooks the sim reads', fxBad.slice(0, 4).join('; '));
}
