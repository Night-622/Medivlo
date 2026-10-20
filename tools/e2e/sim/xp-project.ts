/**
 * Static Act I–III XP projection (Claude 3; no bots, no browser). MAINS=1 skips side quests and bounties (the
 * catch-up guard: a hero who skipped sides must still close the gap on the act's own enemies). Walks each class's Act I quests in order: kills on the
 * way (Claude 2's walk export: spawn zones within aggro of each quest's A* walk, each cleared once per pass), the
 * quest's own kill objectives, every lair room's waves and side packs, then the quest reward. XP comes from the real
 * rules (xpForKill, QUEST_XP_TIER, ELITE.xp), so a change to bands or curves shows up here.
 *   node tools/e2e/sim/run.mjs xp-project            quests + objectives + lairs (+ walks when WALK is set)
 *   WALK=tools/playthrough/out/act1-walks.json node tools/e2e/sim/run.mjs xp-project
 */
import { readFileSync } from 'node:fs';
import type { QuestDef } from '@/core';
import { CLASS_SCHOOL } from '@/core/constants';
import { creature } from '@/systems/rules/creatures';
import { xpForKill, xpToNext, LEVEL_CAP } from '@/systems/rules/curves';
import { QUEST_XP_TIER } from '@/systems/sim/shop';
import { ELITE } from '@/data/enemies/hc/elites';
import { instanceDef } from '@/world/hc/spaces';
import { startAreaOf } from '@/world/hc/worldService';
import { spawnZones, type SpawnZoneDef } from '@/world/hc/spawns';

/** Claude 2's walk export (tools/playthrough/walks-export.ts): zones by id, or with the band / cap in force at that quest */
type WalkZone = string | { id: string; level: [number, number]; elite: boolean; cap: number };
type Walk = Record<string, { quest: string; zones?: WalkZone[]; zonesWalk?: WalkZone[]; lairs?: string[] }[]>;

// calibration overrides (KPL=kills per level, QT=quest tiers "a,b,c"): the same formula as curves.ts xpForKill
const KPL = Number(process.env.KPL) || 0;
const QT: Record<1 | 2 | 3, number> = process.env.QT ? Object.fromEntries(process.env.QT.split(',').map((v, i) => [i + 1, Number(v)])) as Record<1 | 2 | 3, number> : QUEST_XP_TIER;
const TIER_XP = { enemy: 1, mini: 6, boss: 25 } as const;
// FALL=<per level>: prototype a smooth under-level falloff (×(1 − FALL·levels below), floor 10%) instead of the −5 cliff
const FALL = Number(process.env.FALL) || 0;
// UPB=<per level>: catch-up bonus for enemies above you (×(1 + UPB·levels above, max 5))
const UPB = Number(process.env.UPB) || 0;
const falloff = (hero: number, enemy: number) => (enemy >= hero ? 1 + UPB * Math.min(5, enemy - hero) : Math.max(0.1, 1 - FALL * (hero - enemy)));
// KPLF="L:kpl,L:kpl,…": kills per level as a piecewise-linear function of the HERO's level (the curve's shape)
const KPLF = (process.env.KPLF ?? '').split(',').filter(Boolean).map((x) => x.split(':').map(Number) as [number, number]);
const kplAt = (L: number): number => {
  if (!KPLF.length) return KPL || 32;
  if (L <= KPLF[0][0]) return KPLF[0][1];
  for (let i = 1; i < KPLF.length; i++) if (L <= KPLF[i][0]) { const [a, x] = KPLF[i - 1], [b, y] = KPLF[i]; return x + ((y - x) * (L - a)) / (b - a); }
  return KPLF[KPLF.length - 1][1];
};
const killXp = (hero: number, enemy: number, tier: 'enemy' | 'mini' | 'boss') => FALL || KPLF.length || UPB
  ? Math.max(1, Math.round((xpToNext(Math.min(enemy, hero + (Number(process.env.UP) || 5))) / kplAt(hero)) * TIER_XP[tier] * falloff(hero, enemy)))
  : !KPL ? xpForKill(hero, enemy, tier)
  : Math.max(1, Math.round((xpToNext(Math.min(enemy, hero + 5)) / KPL) * TIER_XP[tier] * (enemy <= hero - 5 ? 0.1 : 1)));
/** quest-only skips lair side rooms; EXPLORE=1 clears them too */
const EXPLORE = process.env.EXPLORE === '1';

class Hero {
  level = 1; xp = 0; fromKills = 0; fromQuests = 0;
  gain(n: number, src: 'kill' | 'quest'): void {
    if (this.level >= LEVEL_CAP || !Number.isFinite(n)) return; // capped: XP no longer counts
    if (src === 'kill') this.fromKills += n; else this.fromQuests += n;
    this.xp += n;
    while (this.level < LEVEL_CAP && this.xp >= xpToNext(this.level)) { this.xp -= xpToNext(this.level); this.level++; }
  }
  kill(level: number, tier: 'enemy' | 'mini' | 'boss', elite = false): void { this.gain(killXp(this.level, level, tier) * (elite ? ELITE.xp : 1), 'kill'); }
  get exact(): number { return this.level >= LEVEL_CAP ? LEVEL_CAP : this.level + this.xp / xpToNext(this.level); }
}

const tierOf = (id: string) => creature(id)?.tier ?? 'enemy';
const spaceOfZone = (id: string): string | null => {
  const m = /^(?:camp|patrol|zone|guard|pack):([a-z]+)-/.exec(id);
  return m ? `realm:${m[1]}` : null;
};
const zoneById = (id: string): SpawnZoneDef | undefined => { const sp = spaceOfZone(id); return sp ? spawnZones(sp).find((z) => z.id === id) : undefined; };

/** One clear of an ambient zone: its solo cap at the band's mean, the first one elite if the zone is elite-led. */
function clearZone(h: Hero, z: SpawnZoneDef): number {
  for (let k = 0; k < z.cap; k++) h.kill((z.level[0] + z.level[1]) / 2, 'enemy', !!z.elite && k === 0);
  return z.cap;
}

/** Every room of a lair: waves (main rooms) and packs (side rooms), plus the boss unless an objective kills it. */
function clearLair(h: Hero, inst: string, bossByObjective: boolean): number {
  let n = 0;
  for (const z of spawnZones(inst).filter((x) => EXPLORE || !x.id.includes(':side-'))) {
    if (z.waves) for (const wave of z.waves) for (const e of wave) { h.kill(e.level, e.tier ?? 'enemy', !!e.elite); n++; }
    else { n += clearZone(h, z); }
  }
  const b = instanceDef(inst)?.boss;
  if (b && !bossByObjective) { h.kill(b.level, tierOf(b.creature)); n++; }
  return n;
}

/** Mains (and class-thread quests) in file order; each side or bounty right after the latest main its `requires`
 * names (or after the first main). Bounties count once (they repeat after each rest). */
function order(qs: QuestDef[]): QuestDef[] {
  const isMain = (q: QuestDef) => q.type === 'main' || q.type === 'class';
  const mains = qs.filter(isMain);
  const after = new Map<string, QuestDef[]>();
  for (const s of qs.filter((q) => !isMain(q))) {
    const refs = JSON.stringify(s.requires ?? {});
    const anchor = [...mains].reverse().find((m) => refs.includes(`"${m.id}"`)) ?? mains[0];
    if (anchor) after.set(anchor.id, [...(after.get(anchor.id) ?? []), s]);
  }
  return mains.flatMap((m) => [m, ...(after.get(m.id) ?? [])]);
}

/** One act for a class: its own thread and the shared act, mains interleaved in proportion (the class thread and
 * the shared spine run side by side); quests gated to another class are left out. */
function actQuests(cls: string, act: QuestDef['act'], own: QuestDef[], shared: QuestDef[]): QuestDef[] {
  const gatedTo = (q: QuestDef) => [...JSON.stringify(q.requires ?? {}).matchAll(/"heroClass":"([a-z]+)"/g)].map((m) => m[1]);
  const mine = (q: QuestDef) => q.act === act && (process.env.MAINS === '1' ? ['main', 'class'] : ['main', 'class', 'side', 'bounty']).includes(q.type) && gatedTo(q).every((c) => c === cls);
  const a = order(own.filter(mine)), b = order(shared.filter(mine));
  return [...a.map((q, k) => ({ q, t: (k + 0.5) / a.length })), ...b.map((q, k) => ({ q, t: (k + 0.5) / b.length }))]
    .sort((x, y) => x.t - y.t).map((x) => x.q);
}

// WALK may list several files (comma-separated): one per act
const walks: Walk = {};
for (const f of (process.env.WALK ?? '').split(',').filter(Boolean)) {
  for (const [cls, list] of Object.entries(JSON.parse(readFileSync(f, 'utf8')) as Walk)) (walks[cls] ??= []).push(...list);
}
const ACTS = [['act1', 14], ['act2', 28], ['act3', 40]] as const;
const sharedQs = [...(await import('../../../src/data/quests/hc-concordia.ts')).default, ...(await import('../../../src/data/quests/hc-heart.ts')).default] as QuestDef[];
type Row = { cls: string; end: number[]; killShare: number; kills: number; quests: number };
const rows: Row[] = [];
for (const cls of Object.keys(CLASS_SCHOOL)) {
  const mod = (await import(`../../../src/data/quests/hc-${cls}.ts`).catch(() => null)) as { default: QuestDef[] } | null;
  if (!mod) continue;
  const walk = new Map((walks[cls] ?? []).map((w) => [w.quest, w]));
  // every instance the class's quests name (its lairs, Sentinel lairs, the citadel), keyed by its boss(es)
  const named = new Set(JSON.stringify([...mod.default, ...sharedQs]).match(/inst:[a-z0-9-]+/g) ?? []);
  const side = startAreaOf(cls).waystone.replace(/^ws:/, '');
  for (const n of [1, 2, 3]) named.add(`inst:${side}-lair-${n}`);
  const lairOf = new Map<string, string>();
  for (const i of named) { const d = instanceDef(i); for (const b of [d?.boss, d?.boss2]) if (b && !lairOf.has(b.creature)) lairOf.set(b.creature, i); }
  const bossLevel = (id: string) => { const d = instanceDef(lairOf.get(id) ?? ''); return [d?.boss, d?.boss2].find((b) => b?.creature === id)?.level; };
  const h = new Hero();
  const cleared = new Set<string>();
  const row: Row = { cls, end: [], killShare: 0, kills: 0, quests: 0 };
  for (const [act] of ACTS) {
    for (const q of actQuests(cls, act, mod.default, sharedQs)) {
      row.quests++;
      const w = walk.get(q.id);
      // ZONES=walk: the on-foot route (default: Claude 2's fast-travel route)
      for (const wz of (process.env.ZONES === 'walk' ? w?.zonesWalk ?? w?.zones : w?.zones) ?? []) {
        // (an exported zone carries its band, cap and elite flag: no lookup, so Concordia zones work too)
        const z = typeof wz === 'string' ? zoneById(wz) : { id: wz.id, space: '', at: [0, 0] as [number, number], r: 0, pool: [], level: wz.level, cap: wz.cap, elite: wz.elite };
        if (z) row.kills += clearZone(h, z as SpawnZoneDef);
      }
      const objKills = q.stages.flatMap((s) => s.objectives).filter((o) => o.kill);
      // a lair counts when the quest is set in it, the walk enters it, or an objective kills its boss
      const inst = [...new Set([q.region, ...(w?.lairs ?? []), ...objKills.map((o) => lairOf.get(o.kill as string))]
        .filter((r): r is string => !!r && r.startsWith('inst:') && !!instanceDef(r)))];
      for (const i of inst) if (!cleared.has(i)) { cleared.add(i); row.kills += clearLair(h, i, objKills.some((o) => lairOf.get(o.kill as string) === i)); }
      for (const o of objKills) {
        const id = o.kill as string;
        // an instance boss at its own level, a realm boss at its gate (L14), story packs at the hero's level
        const lv = bossLevel(id) ?? (/^bx_[a-z]+_5$/.test(id) ? 14 : h.level + 0.5);
        for (let k = 0; k < (o.count ?? 1); k++) { h.kill(lv, tierOf(id)); row.kills++; }
      }
      if (process.env.DEBUG === cls) console.log(`  ${act} ${q.type.padEnd(4)} ${q.id.slice(6).padEnd(36)} ${String(q.region).padEnd(30)} L${h.exact.toFixed(2)} kills ${row.kills}`);
      const tier = q.reward?.xpTier;
      if (tier) h.gain(QT[tier] * xpToNext(h.level), 'quest');
    }
    row.end.push(h.exact);
  }
  row.killShare = h.fromKills / (h.fromKills + h.fromQuests);
  rows.push(row);
}

rows.sort((a, b) => a.end[0] - b.end[0]);
for (const r of rows) console.log(`${r.cls.padEnd(12)} quests ${String(r.quests).padStart(2)}  kills ${String(r.kills).padStart(4)}  kill XP ${(r.killShare * 100).toFixed(0).padStart(2)}%  ends ${r.end.map((e) => 'L' + e.toFixed(1)).join(' / ')}`);
console.log(`(${EXPLORE ? 'explorer' : 'quest-only'}, ${process.env.WALK ? 'with walks' : 'no walks: objectives + lairs only'}${KPL ? `, KPL ${KPL}` : ''}${process.env.QT ? `, QT ${process.env.QT}` : ''})`);
ACTS.forEach(([act, target], k) => {
  const e = rows.map((r) => r.end[k]).sort((a, b) => a - b);
  console.log(`${act} end: min L${e[0].toFixed(1)}  median L${e[Math.floor(e.length / 2)].toFixed(1)}  max L${e[e.length - 1].toFixed(1)}  (target ~L${target - 1}–${target})`);
});
