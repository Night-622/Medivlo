/**
 * rules-props: curated hybrid set bonuses (Claude 5, docs/systems/BUILDS.md §5). 12 pairs; each unordered pair once;
 * two different real schools; every school in at least one pair; each passive does something, passes the content guard
 * and names only hooks the sim reads; names and lines present.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { HC_SCHOOLS } from '@/data/items/hc/armour.gen';
import { HC_HYBRIDS } from '@/data/items/hc/hybrid-sets';
import type { Passive } from '@/systems/rules/types';
import { check } from './features-harness';

const SCALED = ['hp', 'ember', 'stamina', 'armor', 'sp', 'emberRegen', 'hpRegen', 'staminaRegen'];
const empty = (p: Passive): boolean => !(p.mods?.length || p.procs?.length || p.hooks?.length || p.spellMods?.length || p.convert?.length || p.aura?.length || p.spellLevels?.length);
const SIM_SRC = readdirSync('src/systems/sim').filter((f) => f.endsWith('.ts')).map((f) => readFileSync(`src/systems/sim/${f}`, 'utf8')).join('\n');

export function hybridProps(): void {
  const H = HC_HYBRIDS, schools = new Set<string>(HC_SCHOOLS);
  const keys = H.map((h) => [...h.schools].sort().join('+')), dup = keys.filter((k, i) => keys.indexOf(k) !== i);
  const shape = H.filter((h) => h.schools[0] === h.schools[1] || !h.schools.every((s) => schools.has(s))).map((h) => h.schools.join('+'));
  const unused = [...schools].filter((s) => !H.some((h) => h.schools.includes(s as never)));
  check(H.length === 12 && !dup.length && !shape.length && !unused.length, `hybrids: ${H.length} curated pairs, each unordered pair once, two different real schools, every school used`,
    [...dup.map((x) => `dup ${x}`), ...shape.map((x) => `bad ${x}`), ...unused.map((x) => `unused ${x}`)].join(', '));
  const bad: string[] = [];
  for (const h of H) {
    const k = h.schools.join('+');
    if (!h.name || !h.text || /undefined|NaN|…/.test(h.text) || empty(h.passive)) bad.push(`${k}: empty`);
    for (const m of h.passive.mods ?? []) if (m.when && SCALED.includes(m.stat) && m.op !== 'flat') bad.push(`${k}: conditional ${m.op} ${m.stat}`);
    for (const hk of h.passive.hooks ?? []) if (!SIM_SRC.includes(`'${hk.id}'`)) bad.push(`${k}: hook ${hk.id} not read`);
  }
  check(!bad.length, 'hybrids: every bonus has a name and line, does something, passes the guard, uses only hooks the sim reads', bad.join('; '));
}
