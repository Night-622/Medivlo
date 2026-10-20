/**
 * rules-props: perk table invariants (Claude 5, docs/systems/BUILDS.md §3, rules/perkTypes.ts). Per school file: its
 * two classes are the school's; 12 signatures per class and 8 school perks; 3 ranks exactly in the b slots; one text
 * and one effect per rank, every effect doing something; ranks never weaker than the one before; exclusive c1 / c2
 * picks differ; ids unique and prefixed; spell references resolve (or are this class's new-spell placeholders); no
 * conditional pct/more on a scaled stat; no old variant (echo/split/twin/wide/linger/burst: runes now).
 */
import { HC_CLASSES } from '@/data/classes/hc/classes.gen';
import { HC_SCHOOL_PERKS } from '@/data/skilltrees/hc';
import { spellDef } from '@/systems/rules/spells';
import type { PerkDef, SchoolPerks } from '@/systems/rules/perkTypes';
import type { Passive } from '@/systems/rules/types';
import { check } from './features-harness';

const SCALED = ['hp', 'ember', 'stamina', 'armor', 'sp', 'emberRegen', 'hpRegen', 'staminaRegen'];
const SIG_B = [1, 5, 9], SCHOOL_B = [2, 5];
const VARIANTS = ['echo', 'split', 'twin', 'linger', 'burst'];

/** every number in a passive, in a stable order (to compare rank r with rank r-1) */
const nums = (p: Passive): number[] => JSON.stringify(p).match(/-?\d+(\.\d+)?(e-?\d+)?/g)?.map(Number) ?? [];
const empty = (p: Passive): boolean => !(p.mods?.length || p.procs?.length || p.hooks?.length || p.spellMods?.length || p.convert?.length || p.aura?.length || p.spellLevels?.length);

/** problems with one perk (empty = fine) */
function perkBad(p: PerkDef, want: 1 | 3, prefix: string, classId?: string): string[] {
  const bad: string[] = [];
  if (!p.id.startsWith(prefix)) bad.push(`${p.id}: id should start ${prefix}`);
  if (p.ranks !== want || p.text.length !== want || p.effects.length !== want) bad.push(`${p.id}: ranks ${p.ranks}/${p.text.length}/${p.effects.length}, slot wants ${want}`);
  if (p.text.some((t) => !t || /undefined|NaN|…/.test(t))) bad.push(`${p.id}: broken text`);
  if (p.effects.some(empty)) bad.push(`${p.id}: a rank does nothing`);
  for (let r = 1; r < p.effects.length; r++) {
    const a = nums(p.effects[r - 1]), b = nums(p.effects[r]);
    if (a.length !== b.length || b.some((v, i) => Math.abs(v) < Math.abs(a[i]) - 1e-9) || JSON.stringify(a) === JSON.stringify(b)) bad.push(`${p.id}: rank ${r + 1} not stronger than rank ${r}`);
  }
  for (const fx of p.effects) {
    for (const m of fx.mods ?? []) if (m.when && SCALED.includes(m.stat) && m.op !== 'flat') bad.push(`${p.id}: conditional ${m.op} on ${m.stat}`);
    for (const s of [...(fx.spellMods ?? []).map((x) => x.spell), ...(fx.spellLevels ?? []).map((x) => x.spell)]) {
      const placeholder = !!classId && new RegExp(`^spell:new-${classId}-[345]$`).test(s);
      if (s !== '*' && !spellDef(s) && !placeholder) bad.push(`${p.id}: unknown spell ${s}`);
    }
    for (const sm of fx.spellMods ?? []) for (const v of VARIANTS) if (v in sm) bad.push(`${p.id}: '${v}' is a rune now`);
    if ((fx.spellMods ?? []).some((sm) => 'area' in sm)) bad.push(`${p.id}: spell area is the Wide rune now`);
  }
  return bad;
}

/** problems with one school's table (empty = fine); also used on drafts before they join HC_SCHOOL_PERKS */
export function schoolPerksBad(sp: SchoolPerks): string[] {
    const bad: string[] = [];
    const own = HC_CLASSES.filter((c) => c.school === sp.school).map((c) => c.id).sort();
    if (sp.classes.map((c) => c.classId).sort().join() !== own.join()) bad.push(`classes ${sp.classes.map((c) => c.classId)} vs ${own}`);
    for (const cp of sp.classes) {
      if (cp.signature.length !== 12) bad.push(`${cp.classId}: ${cp.signature.length} signatures, want 12`);
      cp.signature.forEach((p, i) => bad.push(...perkBad(p, SIG_B.includes(i) ? 3 : 1, `pk_${cp.classId}_`, cp.classId)));
      for (const i of [2, 6, 10]) if (cp.signature[i] && JSON.stringify(cp.signature[i].effects) === JSON.stringify(cp.signature[i + 1]?.effects)) bad.push(`${cp.classId}: exclusive pair ${i}/${i + 1} identical`);
    }
    if (sp.perks.length !== 8) bad.push(`${sp.perks.length} school perks, want 8`);
    sp.perks.forEach((p, i) => bad.push(...perkBad(p, SCHOOL_B.includes(i) ? 3 : 1, `pk_${sp.school}_`)));
    return bad;
}

export function perkProps(): void {
  const ids = new Map<string, number>();
  const covered = new Set<string>();
  for (const sp of HC_SCHOOL_PERKS) {
    const bad = schoolPerksBad(sp);
    sp.classes.forEach((c) => covered.add(c.classId));
    for (const p of [...sp.classes.flatMap((c) => c.signature), ...sp.perks]) ids.set(p.id, (ids.get(p.id) ?? 0) + 1);
    check(!bad.length, `perks ${sp.school}: 2 × 12 signatures + 8 school perks fill their slots (ranks, texts, effects, spells, guard, no rune variants)`, bad.slice(0, 5).join('; '));
  }
  const dup = [...ids].filter(([, n]) => n > 1).map(([id]) => id);
  check(!dup.length, `perks: all ${ids.size} ids unique across schools`, dup.join(', '));
  console.log(`   (perk tables so far: ${HC_SCHOOL_PERKS.map((s) => s.school).join(', ')}; ${covered.size}/24 classes)`);
}
