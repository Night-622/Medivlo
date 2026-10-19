/** Headless content validation for the rebuild's systems data (Claude 3). Run: node tools/e2e/sim/run.mjs validate */
import { HC_CLASSES } from '@/data/classes/hc/classes.gen';
import { HC_KITS } from '@/data/classes/hc/kits';
import { HC_KIT_SPELLS } from '@/data/spells/hc/kit-spells';
import { HC_SCHOOL_SPELL_DEFS, HC_SCROLL_SPELLS, SCROLL_SPELL } from '@/data/spells/hc/school-spells';
import { allCreatures, unmappedAbilities } from '@/systems/rules/creatures';
import { HC_BESTIARY } from '@/data/enemies/hc/bestiary.gen';
import { buildTree } from '@/systems/rules/tree';
import { itemInfo } from '@/systems/rules/gear';

const problems: string[] = [];
const spells = [...HC_KIT_SPELLS, ...HC_SCHOOL_SPELL_DEFS, ...HC_SCROLL_SPELLS];
const ids = new Map<string, number>();
for (const s of spells) ids.set(s.id, (ids.get(s.id) ?? 0) + 1);
for (const [id, n] of ids) if (n > 1) problems.push(`duplicate spell id ${id}`);
for (const k of HC_KITS) for (const s of k.spells) if (!ids.has(s)) problems.push(`${k.classId}: missing spell ${s}`);
for (const [item, s] of Object.entries(SCROLL_SPELL)) if (!ids.has(s)) problems.push(`scroll ${item}: missing ${s}`);
if (HC_KITS.length !== 24) problems.push(`kits: ${HC_KITS.length}/24`);
for (const c of HC_CLASSES) {
  for (const b of ['spells', 'skills', 'upgrades'] as const) {
    const nodes = buildTree(c.id, b);
    if (nodes.length !== 24) problems.push(`${c.id}/${b}: ${nodes.length} nodes`);
    for (const n of nodes) {
      if (n.grantsSpell && !ids.has(n.grantsSpell)) problems.push(`${n.id}: missing spell ${n.grantsSpell}`);
      for (const r of n.req) if (!nodes.some((x) => x.id === r)) problems.push(`${n.id}: bad req ${r}`);
      if (!n.free && n.effects.every((e) => !e.mods?.length && !e.procs?.length && !e.hooks?.length && !e.spellMods?.length) && !n.grantsSpell) problems.push(`${c.id} ${n.id} (${n.name}): no effect`);
    }
  }
  if (!itemInfo(HC_KITS.find((k) => k.classId === c.id)!.startWeapon)) problems.push(`${c.id}: bad start weapon`);
}
const cr = allCreatures();
// 142 handoff + 10 regional rank-and-file + 1 escort body + 72 campaign bosses
if (cr.length !== 142 + 11 + 72) problems.push(`creatures ${cr.length}/225`);
for (const c of cr) if (c.body !== c.id && !HC_BESTIARY.some((b) => b.id === c.body)) problems.push(`${c.id}: body ${c.body} has no art`);
for (const c of cr.filter((x) => x.id.startsWith('cb_'))) if (c.phases.length < 3) problems.push(`${c.id}: ${c.phases.length} phases`);
for (const b of HC_BESTIARY) {
  const d = cr.find((x) => x.id === b.id)!;
  if (d.drops.length < b.drops.length) problems.push(`${b.id}: unresolved drops ${b.drops.join(', ')}`);
  for (const dr of d.drops) if (dr.kind === 'item' && !itemInfo(dr.id)) problems.push(`${b.id}: drop item ${dr.id} unknown`);
  if (b.tier === 'boss' && d.phases.length < 2) problems.push(`${b.id}: boss with ${d.phases.length} phases`);
}
const unm = unmappedAbilities();
console.log(`spells ${spells.length}, kits ${HC_KITS.length}, creatures ${cr.length}, unmapped abilities ${unm.length}`);
unm.forEach((u) => console.log('  unmapped', u));
problems.forEach((p) => console.log('  PROBLEM', p));
console.log(problems.length ? `FAIL ${problems.length}` : 'OK');

// set pieces: every HC_HAZARDS key is a real creature, and every set-piece rule line became a hook
{
  const { HC_HAZARDS } = await import('@/data/enemies/hc/hazards');
  const { creature } = await import('@/systems/rules/creatures');
  const badKeys = Object.keys(HC_HAZARDS).filter((k) => !creature(k));
  const needs: Record<string, string> = { vent: 'ventHeal|ventHurt|', light: 'lightOnly', pillar: 'shielded|paysBack|calmAura', anchor: 'anchorStun' };
  const bad = Object.entries(HC_HAZARDS).filter(([k, hs]) => {
    const hooks = (creature(k)?.hooks ?? []).map((h) => h.id).join(' ');
    return hs.some((h) => needs[h.kind] !== undefined && !new RegExp(needs[h.kind]).test(hooks));
  }).map(([k]) => k);
  console.log(badKeys.length || bad.length ? `  PROBLEM set pieces: unknown ${badKeys} / missing rule ${bad}` : `set pieces: ${Object.keys(HC_HAZARDS).length} bosses mapped, rules present`);
}
