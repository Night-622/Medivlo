/**
 * rules-props: affix pool invariants (Claude 5, docs/systems/BUILDS.md §2.3). Ids unique; each group is one kind;
 * tiers start at the affix's minIlvl, rise in item level, keep min ≤ max and never shrink in size; texts show {v};
 * proc affixes are wrought+; no conditional pct/more on a scaled stat; spell-specific affixes resolve to the class's
 * own kit spells and schools; and every slot can fill every rarity's affix count with distinct groups (at most two
 * prefixes and two suffixes) at every item level, without class-only affixes.
 */
import { HC_CLASSES } from '@/data/classes/hc/classes.gen';
import { kitFor } from '@/data/classes/hc/kits';
import { NEW_KIT } from '@/data/spells/hc/kit-spells-new';
import { HC_AFFIXES } from '@/data/items/hc/affixes';
import { AFFIX_COUNT, type AffixDef, type AffixSlot } from '@/systems/rules/affixTypes';
import { spellDef } from '@/systems/rules/spells';
import { RARITY_ORDER, type Rarity } from '@/systems/rules/types';
import { check } from './features-harness';

const SLOTS: AffixSlot[] = ['weapon', 'offhand', 'head', 'chest', 'hands', 'feet', 'ring', 'amulet'];
const SCALED = ['hp', 'ember', 'stamina', 'armor', 'sp', 'emberRegen', 'hpRegen', 'staminaRegen'];
const ri = (r: Rarity): number => RARITY_ORDER.indexOf(r);

/** distinct groups a drop of this slot / rarity / ilvl can draw from, per kind (class-only affixes left out) */
function pool(slot: AffixSlot, rarity: Rarity, ilvl: number): { prefix: number; suffix: number } {
  const ok = (a: AffixDef) => !a.only && a.slots.includes(slot) && a.minIlvl <= ilvl && ri(a.minRarity ?? 'common') <= ri(rarity) && a.weight > 0;
  const groups = (k: AffixDef['kind']) => new Set(HC_AFFIXES.filter((a) => a.kind === k && ok(a)).map((a) => a.group)).size;
  return { prefix: groups('prefix'), suffix: groups('suffix') };
}

export function affixProps(): void {
  const A = HC_AFFIXES;
  const ids = A.map((a) => a.id), dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  check(!dup.length, `affixes: all ${A.length} ids unique`, dup.slice(0, 5).join(', '));

  const kindOf = new Map<string, string>(), mixed = new Set<string>();
  for (const a of A) { const k = kindOf.get(a.group); if (k && k !== a.kind) mixed.add(a.group); kindOf.set(a.group, a.kind); }
  check(!mixed.size, `affixes: each of ${kindOf.size} groups is all prefix or all suffix`, [...mixed].join(', '));

  const tierBad = A.filter((a) => {
    const t = a.tiers;
    if (!t.length || t[0].ilvl !== a.minIlvl) return true;
    return t.some((x, i) => x.min > x.max || !Number.isFinite(x.min) || !Number.isFinite(x.max)
      || (i > 0 && (x.ilvl <= t[i - 1].ilvl || Math.abs(x.min) < Math.abs(t[i - 1].min) - 1e-9 || Math.abs(x.max) < Math.abs(t[i - 1].max) - 1e-9)));
  }).map((a) => a.id);
  check(!tierBad.length, 'affixes: tiers start at minIlvl, rise in item level, keep min ≤ max and never shrink in size', tierBad.slice(0, 5).join(', '));

  // proc affixes scale their coefficients by v, a power multiplier, so their text needn't show it
  const shapeBad = A.filter((a) => (!('proc' in a.effect) && !a.text.includes('{v}')) || !a.slots.length || a.slots.some((s) => !SLOTS.includes(s)) || !(a.weight > 0)
    || a.id.startsWith('pre_') !== (a.kind === 'prefix')).map((a) => a.id);
  check(!shapeBad.length, 'affixes: every non-proc text shows {v}, slots are real, weights positive, pre_/suf_ ids match their kind', shapeBad.slice(0, 5).join(', '));

  const procs = A.filter((a) => 'proc' in a.effect);
  const procBad = procs.filter((a) => a.minRarity !== 'wrought' || a.weight > 5 || !('proc' in a.effect && a.effect.proc.do.length)).map((a) => a.id);
  check(procs.length > 0 && !procBad.length, `affixes: ${procs.length} proc affixes are wrought+, weight ≤ 5, and do something`, procBad.join(', '));

  const raw = A.filter((a) => 'mod' in a.effect && a.effect.mod.when && SCALED.includes(a.effect.mod.stat) && a.effect.mod.op !== 'flat').map((a) => a.id);
  check(!raw.length, 'affixes: no conditional increased/more modifier on a scaled stat', raw.join(', '));

  // spell-specific: resolve, and belong to the class / school they are locked to
  const spellBad: string[] = [];
  for (const a of A) {
    if ('spellLevels' in a.effect) {
      const id = a.effect.spellLevels, cls = a.only?.classId;
      if (!cls || !spellDef(id) || ![...kitFor(cls).spells, ...(NEW_KIT[cls] ?? [])].includes(id)) spellBad.push(a.id);
    }
    if ('schoolLevels' in a.effect && a.only?.school !== a.effect.schoolLevels) spellBad.push(a.id);
  }
  const kitSpells = HC_CLASSES.reduce((n, c) => n + kitFor(c.id).spells.length + (NEW_KIT[c.id]?.length ?? 0), 0);
  const lvl = A.filter((a) => 'spellLevels' in a.effect).length, sch = A.filter((a) => 'schoolLevels' in a.effect).length;
  check(!spellBad.length && lvl === kitSpells && sch === 12, `affixes: "+1 to <spell>" for all ${kitSpells} kit spells and "+1 to <school>" for 12 schools, each locked to its own class / school`, spellBad.slice(0, 5).join(', '));

  // coverage: every slot can fill every rarity's count with distinct groups, ≤ 2 prefixes and ≤ 2 suffixes
  const short: string[] = [];
  for (const slot of SLOTS) for (const r of RARITY_ORDER) {
    const need = AFFIX_COUNT[r][1];
    if (!need) continue;
    for (let L = 1; L <= 40; L++) {
      const p = pool(slot, r, L);
      if (Math.min(p.prefix, 2) + Math.min(p.suffix, 2) < need) { short.push(`${slot} ${r} L${L} (${p.prefix}p/${p.suffix}s)`); break; }
    }
  }
  check(!short.length, 'affixes: every slot fills every rarity\'s affix count at every item level (≤ 2 prefixes + ≤ 2 suffixes, no class-only affixes)', short.slice(0, 6).join('; '));
}
