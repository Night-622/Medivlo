/**
 * Gear curve walk (Claude 5): one class campaign for a typical player, from the real loot rules. The route is
 * xp-project.ts's (Claude 3): each class's Act I–III quests in order, kills on the way (Claude 2's walk exports), quest
 * kill objectives, lair waves and bosses, quest rewards. On top: every kill rolls rollKillLoot, every chest in a cleared
 * instance rolls openChest (the instance's own generated chests), quest gold and hcItems pay out, and each quest ends
 * with a town visit (gear-curve-model.ts Player.town). Optional sites (Claude 2): the hero's own realm-side ruin cache
 * and cave after the 6th Act I main, each Morvane region's ruin and cave on the first visit.
 * Used by gear-curve.ts (the report) and boss-check.ts (bosses at the gear a typical player has).
 *   env: EXPLORE=1 also fights lair side rooms · OPT=0 skips the optional sites · RF=0 no Runeforge (model)
 */
import { readFileSync } from 'node:fs';
import type { QuestDef, WorldObject } from '@/core';
import { CLASS_SCHOOL } from '@/core/constants';
import { creature } from '@/systems/rules/creatures';
import { LEVEL_CAP, questXpMult, spawnCountMult, xpForKill, xpToNext } from '@/systems/rules/curves';
import type { Rarity } from '@/systems/rules/types';
import { QUEST_XP_TIER } from '@/systems/sim/shop';
import { ELITE } from '@/data/enemies/hc/elites';
import { InstanceGen } from '@/world/hc/instanceGen';
import { instanceDef } from '@/world/hc/spaces';
import { startAreaOf } from '@/world/hc/worldService';
import { spawnZones, type SpawnZoneDef } from '@/world/hc/spawns';
import { levelAt, stepDone } from '@/world/hc/bands';
import { Player } from './gear-curve-model';

const EXPLORE = process.env.EXPLORE === '1';
/** OPT=0 skips the optional realm and Morvane ruins and caves */
export const OPT = process.env.OPT !== '0';

type WalkZone = string | { id: string; level: [number, number]; elite: boolean; cap: number };
type Walk = Record<string, { quest: string; zones?: WalkZone[]; lairs?: string[] }[]>;
const walks: Walk = {};
for (const f of ['act1', 'act2', 'act3'].map((a) => `tools/playthrough/out/${a}-walks.json`)) {
  for (const [cls, list] of Object.entries(JSON.parse(readFileSync(f, 'utf8')) as Walk)) (walks[cls] ??= []).push(...list);
}
const spaceOfZone = (id: string): string | null => { const m = /^(?:camp|patrol|zone|guard|pack):([a-z]+)-/.exec(id); return m ? `realm:${m[1]}` : null; };
// (Concordia zones are not realm spaces: the lookup throws, and the exported band / cap carry them instead)
const zoneById = (id: string): SpawnZoneDef | undefined => { const sp = spaceOfZone(id); try { return sp ? spawnZones(sp).find((z) => z.id === id) : undefined; } catch { return undefined; } };
const tierOf = (id: string) => creature(id)?.tier ?? 'enemy';
/**
 * One act's quests for a class, as a player would take them: the class thread's and the shared spine's mains interleaved
 * in proportion (xp-project.ts); a side or bounty right after the latest main its `requires` names; a side that names
 * no main (open from the start) spread evenly through its list's mains instead of all after the first one (Claude 5:
 * xp-project put every open Concordia side before cc-wolves, so the shared mains read ~10 levels late).
 */
function timeline(qs: QuestDef[]): { q: QuestDef; t: number }[] {
  const isMain = (q: QuestDef) => q.type === 'main' || q.type === 'class';
  const mains = qs.filter(isMain), out = mains.map((q, k) => ({ q, t: (k + 0.5) / Math.max(1, mains.length) }));
  const tOf = new Map(out.map((x) => [x.q.id, x.t]));
  const open = qs.filter((q) => !isMain(q) && ![...mains].some((m) => JSON.stringify(q.requires ?? {}).includes(`"${m.id}"`)));
  for (const s of qs.filter((q) => !isMain(q))) {
    const refs = JSON.stringify(s.requires ?? {});
    const anchor = [...mains].reverse().find((m) => refs.includes(`"${m.id}"`));
    const t = anchor ? tOf.get(anchor.id)! + 1e-3 * (1 + out.length) : (open.indexOf(s) + 0.5) / Math.max(1, open.length);
    out.push({ q: s, t });
  }
  return out;
}
function actQuests(cls: string, act: QuestDef['act'], own: QuestDef[], shared: QuestDef[]): QuestDef[] {
  const gatedTo = (q: QuestDef) => [...JSON.stringify(q.requires ?? {}).matchAll(/"heroClass":"([a-z]+)"/g)].map((m) => m[1]);
  const mine = (q: QuestDef) => q.act === act && ['main', 'class', 'side', 'bounty'].includes(q.type) && gatedTo(q).every((c) => c === cls);
  return [...timeline(own.filter(mine)), ...timeline(shared.filter(mine))].sort((x, y) => x.t - y.t).map((x) => x.q);
}
const sharedQs = [...(await import('../../../src/data/quests/hc-concordia.ts')).default, ...(await import('../../../src/data/quests/hc-heart.ts')).default] as QuestDef[];
/** a class's own quest file */
export const questsOf = async (cls: string): Promise<QuestDef[]> => ((await import(`../../../src/data/quests/hc-${cls}.ts`)) as { default: QuestDef[] }).default;

/** XP (xp-project's Hero) driving the Player's level */
class Hero {
  xp = 0;
  /** XP attribution (xp-pacing.ts): every gain, in levels' worth at the time, to the current quest and source */
  onXp?: (levels: number) => void;
  constructor(readonly pl: Player) {}
  gain(n: number): void {
    const pl = this.pl;
    if (pl.level >= LEVEL_CAP) return;
    this.onXp?.(n / xpToNext(pl.level));
    this.xp += n;
    while (pl.level < LEVEL_CAP && this.xp >= xpToNext(pl.level)) { this.xp -= xpToNext(pl.level); pl.level = pl.level + 1; }
  }
  kill(id: string, level: number, tier: 'enemy' | 'mini' | 'boss', elite = false): void {
    this.gain(xpForKill(this.pl.level, level, tier) * (elite ? ELITE.xp : 1));
    this.pl.kill(id, level, tier, elite);
  }
}

export type XpSource = 'zone' | 'lair' | 'optional' | 'objective' | 'quest';
export interface Snap { L: number; ilvl: number; rarity: Record<string, number>; upgrade: number; gold: number; income: number; spent: number; ingots: number; empty: string[] }
export interface Run {
  cls: string; seed: number; snaps: Snap[]; end: number; upgrades: Player['t']['upgrades']; drops: Record<Rarity, number>; goldIn: Record<string, number>; goldOut: Record<string, number>;
  maxDry: [number, number]; kills: number; chests: number; reforges: number; lag: [number, number][];
}

/**
 * One campaign, quests in Claude 2's walk-export order. `checks`: snapshot levels (the first quest end at or past each); `onCheck` sees the Player there too
 * (boss-check copies the worn kit); `onQuest` gets each quest's id and the hero's exact level as it starts (hero-levels.ts).
 */
export function runClass(cls: string, seed: number, own: QuestDef[], checks: readonly number[], onCheck?: (L: number, pl: Player) => void,
  onQuest?: (quest: string, level: number) => void, opts: {
    party?: number; onXp?: (quest: string, src: XpSource, levels: number) => void;
    /** a quest's level band for rules/curves.ts questXpMult (the sim's lookup once it exports one); onQuestXp sees each reward's base levels and multiplier */
    questBand?: (quest: string) => readonly [number, number] | null; onQuestXp?: (quest: string, baseLevels: number, mult: number) => void;
  } = {}): Run {
  // a party meets bigger packs and lair waves (spawnCountMult); every hero near a kill gets its full XP (sim/death.ts),
  // so party size only changes how many kills there are. Bosses and quest objective kills stay single. (Loot here stays solo.)
  const crowd = spawnCountMult(opts.party ?? 1);
  const pl = new Player(cls, seed), h = new Hero(pl);
  let curQuest = '', curSrc: XpSource = 'zone';
  if (opts.onXp) h.onXp = (lv) => opts.onXp!(curQuest, curSrc, lv);
  const walk = new Map((walks[cls] ?? []).map((w) => [w.quest, w]));
  const named = new Set(JSON.stringify([...own, ...sharedQs]).match(/inst:[a-z0-9-]+/g) ?? []);
  const side = startAreaOf(cls).waystone.replace(/^ws:/, '');
  for (const n of [1, 2, 3]) named.add(`inst:${side}-lair-${n}`);
  const lairOf = new Map<string, string>();
  for (const i of named) { const d = instanceDef(i); for (const b of [d?.boss, d?.boss2]) if (b && !lairOf.has(b.creature)) lairOf.set(b.creature, i); }
  const bossLevel = (id: string) => { const d = instanceDef(lairOf.get(id) ?? ''); return [d?.boss, d?.boss2].find((b) => b?.creature === id)?.level; };
  const fallback = `bx_${CLASS_SCHOOL[cls]}_0`;
  const clearZone = (z: SpawnZoneDef) => { for (let k = 0; k < Math.round(z.cap * crowd); k++) h.kill(z.pool?.[k % Math.max(1, z.pool.length)] ?? fallback, (z.level[0] + z.level[1]) / 2, 'enemy', !!z.elite && k === 0); };
  // the band in force for this host (sim levelAt with the quests done so far): Sentinel lairs, the barrow, the abbey and
  // Morvane caves are banded per host class (Claude 2); their stored waves are at the instance level and shift by it
  const done = new Set<string>(), steps = stepDone(cls, (q) => done.has(q));
  const clearLair = (inst: string, bossByObjective: boolean) => {
    let chestShift = 0;
    for (const z of spawnZones(inst).filter((x) => EXPLORE || !x.id.includes(':side-'))) {
      const band = levelAt(z, steps, cls), shift = band[0] - z.level[0];
      if (!z.id.includes(':side-')) chestShift = shift;
      if (z.waves) for (const wave0 of z.waves) {
        const wave = wave0.map((e) => ({ ...e, level: e.level + shift }));
        // waves are stored for one player: a party's wave has round(n × mult) of the same creatures (bosses / minis stay one)
        const extra = wave.filter((e) => (e.tier ?? tierOf(e.creature)) === 'enemy');
        const more = Math.round(extra.length * crowd) - extra.length;
        for (const e of [...wave, ...Array.from({ length: Math.max(0, more) }, (_, k) => extra[k % Math.max(1, extra.length)])]) if (e) h.kill(e.creature, e.level, e.tier ?? tierOf(e.creature), !!e.elite);
      }
      else clearZone({ ...z, level: band });
    }
    const b = instanceDef(inst)?.boss;
    if (b && !bossByObjective) h.kill(b.creature, b.level, tierOf(b.creature));
    // the instance's own generated chests (main path and side rooms)
    const gen = new InstanceGen(instanceDef(inst)!);
    const objs = [...(gen as unknown as { objs: Map<string, WorldObject[]> }).objs.values()].flat().filter((o) => o.kind === 'chest');
    for (const o of objs) { const pr = o.props as Record<string, string | number | boolean>; pl.chest(o.id, { ...pr, level: Number(pr.level) + chestShift }); }
  };
  const snaps: Snap[] = [];
  const snap = (L: number) => {
    const s = pl.snapshot();
    snaps.push({ L, ilvl: s.ilvl, rarity: s.rarity, upgrade: s.upgrade, gold: pl.t.gold, income: Object.values(pl.t.goldIn).reduce((a, b) => a + b, 0), spent: Object.values(pl.t.goldOut).reduce((a, b) => a + b, 0), ingots: pl.t.ingots, empty: s.empty });
    onCheck?.(L, pl);
  };
  let next = 0, ownMains = 0;
  const cleared = new Set<string>(), regions = new Set<string>();
  // optional sites a typical player opens (Claude 2): their own realm side's ruin cache and cave once the lookout has
  // marked them (about the 6th Act I main), and each Morvane region's ruin and cave on the first visit
  const optional = (base: string, level: number, table: string, inst: string) => {
    curSrc = 'optional';
    if (OPT) { pl.chest(`obj:${base}-ruin-cache`, { level, rarity: 'rare', loot: table }); if (instanceDef(inst) && !cleared.has(inst)) { cleared.add(inst); clearLair(inst, false); } }
  };
  // the quest sequence: Claude 2's walk export order (it lists every quest, and bands.ts reads its expected levels in
  // that order); a class it doesn't cover falls back to the interleaved timeline
  const byId = new Map<string, QuestDef>([...own, ...sharedQs].map((q) => [q.id, q]));
  const exported = (walks[cls] ?? []).map((x) => byId.get(x.quest)).filter((q): q is QuestDef => !!q);
  const sequence = exported.length ? exported : (['act1', 'act2', 'act3'] as const).flatMap((act) => actQuests(cls, act, own, sharedQs));
  for (const q of sequence) {
    const act = q.act;
    const w = walk.get(q.id);
    onQuest?.(q.id, pl.level >= LEVEL_CAP ? LEVEL_CAP : pl.level + h.xp / xpToNext(pl.level));
    curQuest = q.id;
    if (act === 'act1' && own.includes(q) && (q.type === 'main' || q.type === 'class') && ++ownMains === 6)
      optional(side, Math.round(pl.level) + 1, `tbl:${CLASS_SCHOOL[cls]}-ruin`, `inst:${side}-cave`);
    for (const wz of w?.zones ?? []) {
      const r = /^region:([a-z]+)#/.exec(typeof wz === 'string' ? wz : wz.id)?.[1];
      if (r && !regions.has(r)) { regions.add(r); optional(r, typeof wz === 'string' ? Math.round(pl.level) : wz.level[1], 'tbl:morvane-ruin', `inst:${r}-cave`); }
    }
    curSrc = 'zone';
    for (const wz of w?.zones ?? []) {
      const z = typeof wz === 'string' ? zoneById(wz) : { ...(zoneById(wz.id) ?? { id: wz.id, space: '', at: [0, 0], r: 0, pool: [] }), level: wz.level, cap: wz.cap, elite: wz.elite } as SpawnZoneDef;
      if (z) clearZone(z);
    }
    const objKills = (q.stages.flatMap((s) => s.objectives) as { kill?: string; count?: number }[]).filter((o) => o.kill);
    const inst = [...new Set([q.region, ...(w?.lairs ?? []), ...objKills.map((o) => lairOf.get(o.kill as string))]
      .filter((r): r is string => !!r && r.startsWith('inst:') && !!instanceDef(r)))];
    curSrc = 'lair';
    for (const i of inst) if (!cleared.has(i)) { cleared.add(i); clearLair(i, objKills.some((o) => lairOf.get(o.kill as string) === i)); }
    curSrc = 'objective';
    for (const o of objKills) {
      const id = o.kill as string, lv = bossLevel(id) ?? (/^bx_[a-z]+_5$/.test(id) ? 14 : pl.level + 0.5);
      for (let k = 0; k < (o.count ?? 1); k++) h.kill(id, lv, tierOf(id));
    }
    pl.quest(q.reward?.gold, q.reward?.hcItems);
    curSrc = 'quest';
    if (q.reward?.xpTier) {
      const mult = questXpMult(pl.level, opts.questBand?.(q.id) ?? null);
      opts.onQuestXp?.(q.id, QUEST_XP_TIER[q.reward.xpTier], mult);
      h.gain(QUEST_XP_TIER[q.reward.xpTier] * xpToNext(pl.level) * mult);
    }
    done.add(q.id);
    pl.town();
    while (next < checks.length && pl.level >= checks[next]) snap(checks[next++]);
  }
  snap(pl.level);
  // longest stretch with no real upgrade (levels), from level 1 to the campaign's end
  const lv = [1, ...pl.t.upgrades.map((u) => u.level), pl.level];
  let maxDry: [number, number] = [0, 0];
  for (let i = 1; i < lv.length; i++) if (lv[i] - lv[i - 1] > maxDry[1] - maxDry[0]) maxDry = [lv[i - 1], lv[i]];
  return { cls, seed, snaps, end: pl.level, upgrades: pl.t.upgrades, drops: pl.t.drops, goldIn: pl.t.goldIn, goldOut: pl.t.goldOut, maxDry, kills: pl.t.kills, chests: pl.t.chests, reforges: pl.t.reforges, lag: pl.t.lag };
}
