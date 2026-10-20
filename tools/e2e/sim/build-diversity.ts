/**
 * Endgame build diversity (Claude 5 for Claude 1, 2026-10-21; the user's "complex builds" goal). At L40 for each class:
 * how many genuinely different builds are viable — typical, spell-heavy, melee, tank (builds-make.ts), hybrid-set
 * (2 + 2 with each curated partner school, BUILDS.md §5), keystone-centred (each school keystone and each offered shared
 * keystone, via its path), crossover (an off-school tome spell from each partner school in slot 4) — each scored on the
 * Act III boss and a realm pack at L40 (2 seeds each). Viable = wins every fight and its speed (√ of boss and pack speed
 * vs the class's fastest) is within 15% of the best. Then every unique / legendary on the typical build of the classes
 * that can wear it, against the plain L40 item in that slot.
 *   node tools/e2e/sim/run.mjs build-diversity [classId…]      → tools/e2e/out/build-diversity.md   (UNIQUES=0 skips)
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { CLASS_SCHOOL } from '@/core/constants';
import { kitFor } from '@/data/classes/hc/kits';
import { HC_PIECES } from '@/data/items/hc/armour.gen';
import { HC_TOMES } from '@/data/items/hc/build-items';
import { HC_HYBRIDS } from '@/data/items/hc/hybrid-sets';
import { HC_UNIQUES } from '@/data/items/hc/uniques';
import { KEYSTONE_OFFERS } from '@/data/skilltrees/hc/keystones';
import { itemInfo, slotsFor } from '@/systems/rules/gear';
import { allNodes } from '@/systems/rules/tree';
import type { CharacterSave, GearSlot, ItemInstance, SchoolId } from '@/systems/rules/types';
import { runFight, type FightResult } from './builds-fight';
import { archetypeBuilds, learnList, seedOf, SKILLS_OFFENCE, TYPICAL_SPELLS, typicalBuild, type Build } from './builds-make';
import { bossFor } from './builds-run';

const L = 40, SEEDS = 2, VIABLE = 0.85;
const args = process.argv.slice(3);
const CLASSES = args.length ? args : Object.keys(CLASS_SCHOOL);
const t0 = Date.now();
const clone = (s: CharacterSave): CharacterSave => structuredClone(s);
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);

interface Score { won: boolean; boss: number; pack: number; hp: number; fights: FightResult[] }
function score(s: CharacterSave, cls: string): Score {
  const school = CLASS_SCHOOL[cls], boss = bossFor(cls, 34).id;
  const fights: FightResult[] = [];
  for (let k = 0; k < SEEDS; k++) {
    fights.push(runFight(s, [{ creature: boss, level: L, x: 200, y: 0 }], seedOf('div', cls, 'boss', k)));
    // a 10-creature realm pack: long enough (20–40 s) that whole-second fight times don't swamp the comparison
    fights.push(runFight(s, Array.from({ length: 10 }, (_, j) => ({ creature: `bx_${school}_${j % 3}`, level: L, x: 150 + (j % 4) * 30, y: -90 + Math.floor(j / 4) * 60 + (j % 4) * 10 })), seedOf('div', cls, 'pack', k)));
  }
  const b = fights.filter((_, i) => i % 2 === 0), p = fights.filter((_, i) => i % 2 === 1);
  return { won: fights.every((f) => f.won), boss: mean(b.map((f) => f.secs)), pack: mean(p.map((f) => f.secs)), hp: mean(fights.map((f) => f.hpLeft)), fights };
}

// ───────────── the builds ─────────────
interface Cand { group: string; label: string; save: CharacterSave }
const partners = (school: SchoolId): SchoolId[] => HC_HYBRIDS.filter((h) => h.schools.includes(school)).map((h) => h.schools.find((x) => x !== school)!);

/** 2 + 2 armour: helm / chest of the class's own set, hands / feet of the partner's, same style as worn */
function hybridSave(base: CharacterSave, partner: SchoolId): CharacterSave {
  const s = clone(base), own = s.equipment.chest && HC_PIECES.find((p) => p.id === s.equipment.chest!.base);
  if (!own) return s;
  const style = own.set.split('_').slice(1).join('_');
  for (const slot of ['hands', 'feet'] as const) {
    const pc = HC_PIECES.find((p) => p.set === `${partner}_${style}` && p.slot === slot);
    if (pc) s.equipment[slot] = { uid: `hy${slot}`, base: pc.id, ilvl: L, qty: 1 };
  }
  return s;
}

function keystoneSaves(cls: string, kit: CharacterSave): Cand[] {
  const out: Cand[] = [];
  const mk = (label: string, list: (string | [string, number])[]) => {
    const s = clone(kit);
    s.tree = {};
    learnList(cls, s, list);
    out.push({ group: 'keystone', label, save: s });
  };
  // school keystone 2 through the offence path (as keystone 1) plus the focus path, so the two differ by the keystone
  const SK_T1: (string | [string, number])[] = [['sk_p0a', 5], 'sk_p0m1', 'sk_p0m2', ['sk_p0b', 3], 'sk_p2a', 'sk_p2m1', 'sk_p2m2', 'sk_p2b', 'sk_p2c1', 'sk_t1', 'sk_u'];
  const nodes = allNodes(cls), name = (id: string) => nodes.find((n) => n.id === id)?.name ?? id;
  // every offered shared keystone with each school keystone: a keystone is judged on its best pairing
  (KEYSTONE_OFFERS[cls] ?? []).forEach((ks, i) => {
    const path: (string | [string, number])[] = [`up_p${i}a`, `up_p${i}m1`, `up_p${i}m2`, `up_p${i}b`, `up_p${i}c1`];
    mk(`${name('sk_t0')} + ${ks}`, [...TYPICAL_SPELLS.slice(0, 10), ...path, ...SKILLS_OFFENCE, ...TYPICAL_SPELLS.slice(10)]);
    mk(`${name('sk_t1')} + ${ks}`, [...TYPICAL_SPELLS.slice(0, 10), ...path, ...SK_T1, ...TYPICAL_SPELLS.slice(10)]);
  });
  return out;
}

/** the archetypes (tree + gear together, builds-make.ts) */
function archetypes(cls: string): Cand[] {
  return [{ group: 'typical', label: 'typical', save: typicalBuild(cls, L).save },
    ...(archetypeBuilds(cls, L) as Build[]).map((b) => ({ group: b.kind === 'spell' ? 'spell-heavy' : b.kind, label: b.label, save: b.save }))];
}
/** variants on the class's best archetype kit (its gear and trinkets), so they compare builds, not trinkets */
/** swaps on the class's best build: a hybrid set in place of its own 4-piece, an off-school tome spell in slot 4 */
function swaps(cls: string, best: CharacterSave): Cand[] {
  const school = CLASS_SCHOOL[cls] as SchoolId, typ = best;
  const out: Cand[] = partners(school).map((p) => ({ group: 'hybrid-set', label: `hybrid ${school}+${p}`, save: hybridSave(typ, p) }));
  // crossover: one tome spell of each partner school, bound to slot 4
  for (const p of partners(school)) {
    const tome = HC_TOMES.find((t) => t.school === p);
    if (!tome) continue;
    const s = clone(typ); s.tomeSpell = tome.spell; s.hotbar[3] = tome.spell;
    out.push({ group: 'crossover', label: `crossover: ${tome.spell.replace('spell:', '')} (${p})`, save: s });
  }
  return out;
}

// ───────────── run ─────────────
interface Res { cls: string; group: string; label: string; sc: Score; rel: number; viable: boolean }
const res: Res[] = [];
const typicalScore = new Map<string, Score>();
const speedOf = (sc: Score) => (sc.won ? 1 / Math.sqrt(sc.boss * Math.max(1, sc.pack)) : 0);
const topBuild = new Map<string, string>(), bestBuild = new Map<string, string>(), bestKit = new Map<string, string>(), baseScore = new Map<string, Score>(), baseSave = new Map<string, CharacterSave>();
for (const cls of CLASSES) {
  const arch = archetypes(cls).map((c) => ({ c, sc: score(c.save, cls) }));
  const top = [...arch].sort((a, b) => speedOf(b.sc) - speedOf(a.sc))[0];
  bestKit.set(cls, top.c.label);
  // stage 2: every keystone pairing on that kit; stage 3: hybrid / crossover swaps on the best of everything so far
  const ksb = keystoneSaves(cls, top.c.save).map((c) => ({ c, sc: score(c.save, cls) }));
  const lead = [...arch, ...ksb].sort((a, b) => speedOf(b.sc) - speedOf(a.sc))[0];
  bestBuild.set(cls, lead.c.label); baseScore.set(cls, lead.sc); baseSave.set(cls, lead.c.save);
  const sw = swaps(cls, lead.c.save).map((c) => ({ c, sc: score(c.save, cls) }));
  // stage 4: the best armour set (own or a hybrid) and the best tome (none or one) together, then every keystone pairing
  // again on top of them: a keystone / set / tome is viable if swapping it into the best build stays within 15%
  const bestOf = (grp: string) => [...sw.filter((x) => x.c.group === grp)].sort((a, b) => speedOf(b.sc) - speedOf(a.sc))[0];
  const hyb = bestOf('hybrid-set'), tom = bestOf('crossover');
  const useHyb = !!hyb && speedOf(hyb.sc) > speedOf(lead.sc), useTome = !!tom && speedOf(tom.sc) > speedOf(lead.sc);
  const top4 = clone(useHyb ? hyb.c.save : lead.c.save);
  if (useTome) { top4.tomeSpell = tom.c.save.tomeSpell; top4.hotbar[3] = tom.c.save.hotbar[3]; }
  const kit4 = clone(top4);
  const ks4 = keystoneSaves(cls, kit4).map((c) => ({ c: { ...c, group: 'keystone' }, sc: score(c.save, cls) }));
  // the swaps again on the top build (set and tome alternatives with everything else at its best)
  const lead4 = [...ks4].sort((a, b) => speedOf(b.sc) - speedOf(a.sc))[0];
  const sw4 = swaps(cls, lead4.c.save).map((c) => ({ c, sc: score(c.save, cls) }));
  const own4 = clone(lead4.c.save);
  if (useHyb) { const plain = lead.c.save; for (const sl of ['hands', 'feet'] as const) if (plain.equipment[sl]) own4.equipment[sl] = plain.equipment[sl]; }
  const noTome = clone(lead4.c.save); delete noTome.tomeSpell; noTome.hotbar[3] = lead.c.save.hotbar[3];
  const extras = [{ c: { group: 'own set', label: 'own 4-piece set', save: own4 }, sc: score(own4, cls) }, { c: { group: 'no tome', label: 'no tome', save: noTome }, sc: score(noTome, cls) }];
  topBuild.set(cls, `${lead4.c.label}${useHyb ? ' · ' + hyb.c.label : ''}${useTome ? ' · ' + tom.c.label : ''}`);
  const cs = [...arch, ...ks4, ...sw4, ...extras];
  // speed = 1 / √(boss time × pack time), relative to the class's single best build (so the best reads 100%)
  const best = Math.max(...cs.map((x) => speedOf(x.sc)));
  for (const { c, sc } of cs) {
    const rel = speedOf(sc) / best;
    res.push({ cls, group: c.group, label: c.label, sc, rel, viable: sc.won && rel >= VIABLE });
    if (c.group === 'typical') typicalScore.set(cls, sc);
  }
  const a = axis(cls);
  console.log(`${cls.padEnd(12)} top ${topBuild.get(cls)} · viable keystones ${a.k}/${a.kn} · sets ${a.s}/${a.sn} · tomes ${a.t}/${a.tn}`);
}

// uniques: on the typical build of the classes that can wear it, vs the plain L40 item in that slot
interface URes { id: string; name: string; slot: string; tested: number; gains: { cls: string; rel: number }[] }
const ures: URes[] = [];
if (process.env.UNIQUES !== '0') {
  const SAMPLE = ['warden', 'arcanist', 'oathbound', 'swordsman', 'huntsman', 'bard'];
  for (const u of HC_UNIQUES) {
    const info = itemInfo(u.base);
    if (!info) continue;
    const slot = slotsFor(info)[0] as GearSlot | undefined;
    if (!slot) continue;
    const who = info.weaponType ? CLASSES.filter((c) => kitFor(c).weapons.includes(info.weaponType!)) : SAMPLE.filter((c) => CLASSES.includes(c));
    const r: URes = { id: u.id, name: u.name, slot, tested: 0, gains: [] };
    for (const cls of who.slice(0, 4)) {
      const s = baseSave.get(cls) ?? typicalBuild(cls, L).save, plain = baseScore.get(cls) ?? score(s, cls);
      const t = clone(s);
      t.equipment[slot] = { uid: 'uq', base: u.id, ilvl: L, qty: 1 } as ItemInstance;
      if (info.weaponType && (slot === 'main') && ['spear', 'bow', 'staff'].includes(info.weaponType)) delete t.equipment.off;
      const sc = score(t, cls);
      r.tested++;
      r.gains.push({ cls, rel: sc.won ? Math.sqrt((plain.boss / sc.boss) * (plain.pack / Math.max(1, sc.pack))) : 0 });
    }
    ures.push(r);
  }
}

// ───────────── report ─────────────
const GROUPS = ['typical', 'spell-heavy', 'melee', 'tank', 'hybrid-set', 'keystone', 'crossover'];
function axis(cls: string) {
  const rs = res.filter((r) => r.cls === cls);
  const k = rs.filter((r) => r.group === 'keystone'), s = rs.filter((r) => r.group === 'hybrid-set' || r.group === 'own set'), tm = rs.filter((r) => r.group === 'crossover' || r.group === 'no tome');
  const v = (xs: Res[]) => xs.filter((r) => r.viable).length;
  return { k: v(k), kn: k.length, s: v(s), sn: s.length, t: v(tm), tn: tm.length, a: v(rs.filter((r) => ['typical', 'spell-heavy', 'melee', 'tank'].includes(r.group))) };
}
const md: string[] = ['# Endgame build diversity (L40)', '', `Generated by tools/e2e/sim/build-diversity.ts. Each build fights the Act III boss and a 10-creature realm pack at L40 (${SEEDS} seeds). ` +
  `Speed = 1 / √(boss time × pack time) vs the class's best build (which reads 100%); viable = every fight won and speed ≥ ${VIABLE * 100}%. Gear: builds-make's end-game kits (keptUpTier at L40, unrolled bases). ` +
  'Crossover = an off-school tome spell (the only way to bring another school in besides hybrid sets and uniques). Hybrid, keystone and crossover variants are built on the class’s best archetype kit (gear and trinkets) so they compare builds, not trinkets.', ''];
const groupsOf = (cls: string) => GROUPS.filter((g) => res.some((r) => r.cls === cls && r.group === g && r.viable));
md.push('## Viable choices per axis at the top build', '', 'For each class: the top build (stage 4), then how many options on each axis stay within 15% when swapped in with everything else at its best: keystone pairings, armour set (own 4-piece or a curated hybrid), off-school tome (none or one per partner school). Combos ≈ the product. Archetypes = builds-make\u2019s tree + gear packages without a shared keystone (for reference).', '', '| class | top build | keystones | sets | tomes | viable combos | archetypes |', '|---|---|---|---|---|---|---|', ...CLASSES.map((c) => { const a = axis(c); return `| ${c} | ${topBuild.get(c)} | ${a.k}/${a.kn} | ${a.s}/${a.sn} | ${a.t}/${a.tn} | ${Math.max(1, a.k) * Math.max(1, a.s) * Math.max(1, a.t)} | ${a.a}/4 |`; }), '');
md.push('## Viable build families per class (best of each family)', '', 'Stages: the archetypes (tree + gear) give the best kit; every keystone pairing is tried on that kit; hybrid sets and crossover spells are swaps on the best build overall. Keystone column: best pairing (n viable of all pairings).', '', '| class | best build | families | ' + GROUPS.join(' | ') + ' |', '|---|---|---|' + GROUPS.map(() => '---|').join(''));
for (const cls of CLASSES) {
  md.push(`| ${cls} | ${bestBuild.get(cls)} (${bestKit.get(cls)} kit) | ${groupsOf(cls).length} | ${GROUPS.map((g) => { const rs = res.filter((r) => r.cls === cls && r.group === g); if (!rs.length) return '—'; const b = [...rs].sort((x, y) => y.rel - x.rel)[0]; const extra = g === 'keystone' ? ` (${rs.filter((r) => r.viable).length}/${rs.length})` : ''; return `${b.viable ? '**' : ''}${(b.rel * 100).toFixed(0)}%${b.viable ? '**' : ''}${extra}${b.sc.won ? '' : ' ✗'}`; }).join(' | ')} |`);
}
const collapse = CLASSES.filter((c) => { const a = axis(c); return Math.max(1, a.k) * Math.max(1, a.s) * Math.max(1, a.t) <= 2; });
md.push('', `Classes with ≤ 2 viable combos (one build in practice): ${collapse.length ? collapse.map((c) => { const a = axis(c); return `${c} (keystones ${a.k}, sets ${a.s}, tomes ${a.t})`; }).join('; ') : 'none'}.`, '');
// keystones
const ks = res.filter((r) => r.group === 'keystone');
const byKs = new Map<string, Res[]>();
for (const part of [0, 1] as const) {
  const best = new Map<string, Res>();
  for (const r of ks) {
    const k = (part ? 'shared: ' : 'school: ') + r.label.split(' + ')[part], key = `${k}|${r.cls}`;
    if (!best.has(key) || best.get(key)!.rel < r.rel) best.set(key, r);
  }
  for (const [key, r] of best) { const k = key.split('|')[0]; byKs.set(k, [...(byKs.get(k) ?? []), r]); }
}
md.push('## Keystones', '', '| keystone | classes tested | viable for | best speed | mean speed |', '|---|---|---|---|---|');
for (const [k, rs] of [...byKs].sort((a, b) => mean(a[1].map((r) => r.rel)) - mean(b[1].map((r) => r.rel)))) md.push(`| ${k} | ${rs.length} | ${rs.filter((r) => r.viable).map((r) => r.cls).join(', ') || '**nobody**'} | ${(Math.max(...rs.map((r) => r.rel)) * 100).toFixed(0)}% | ${(mean(rs.map((r) => r.rel)) * 100).toFixed(0)}% |`);
// hybrids
const hy = res.filter((r) => r.group === 'hybrid-set');
md.push('', '## Hybrid sets (swapped onto the class’s best build, vs that build on its own 4-piece set)', '', '| pair | classes | speed vs typical (per class) | viable for |', '|---|---|---|---|');
const pairKey = (l: string) => l.replace('hybrid ', '').split('+').sort().join('+');
for (const key of [...new Set(hy.map((r) => pairKey(r.label)))]) {
  const rs = hy.filter((r) => pairKey(r.label) === key);
  md.push(`| ${key} | ${rs.length} | ${rs.map((r) => { const t = baseScore.get(r.cls)!; return `${r.cls} ${((Math.sqrt((t.boss / r.sc.boss) * (t.pack / Math.max(1, r.sc.pack))) - 1) * 100).toFixed(0)}%`; }).join(', ')} | ${rs.filter((r) => r.viable).map((r) => r.cls).join(', ') || '**nobody**'} |`);
}
if (ures.length) {
  md.push('', '## Uniques and legendaries (on the class’s best build, vs the plain L40 item in that slot; an armour unique also breaks the 4-piece set)', '', '| unique | slot | classes tested | speed vs plain | verdict |', '|---|---|---|---|---|');
  for (const u of ures.sort((a, b) => mean(a.gains.map((g) => g.rel)) - mean(b.gains.map((g) => g.rel)))) {
    const best = Math.max(...u.gains.map((g) => g.rel));
    md.push(`| ${u.id} ${u.name} | ${u.slot} | ${u.tested} | ${u.gains.map((g) => `${g.cls} ${((g.rel - 1) * 100).toFixed(0)}%`).join(', ')} | ${best < 0.98 ? '**worse than plain for all**' : best < 1.02 ? 'no gain' : ''} |`);
  }
}
md.push('', '## Every build', '', '| class | family | build | won | boss s | pack s | HP left | speed | viable |', '|---|---|---|---|---|---|---|---|---|');
for (const r of res) md.push(`| ${r.cls} | ${r.group} | ${r.label} | ${r.sc.won ? 'yes' : '**no**'} | ${r.sc.boss.toFixed(0)} | ${r.sc.pack.toFixed(0)} | ${r.sc.hp.toFixed(0)}% | ${(r.rel * 100).toFixed(0)}% | ${r.viable ? 'yes' : ''} |`);
mkdirSync('tools/e2e/out', { recursive: true });
writeFileSync('tools/e2e/out/build-diversity.md', md.join('\n'));
console.log(`report tools/e2e/out/build-diversity.md · run time ${((Date.now() - t0) / 1000).toFixed(1)} s`);
