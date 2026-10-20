/**
 * Campaign walks (Claude 2): each class's quests in play order, walked by A* through every objective in the act's
 * space, with every spawn zone whose creatures come within aggro of the walk and every instance entered.
 *   act1Walks()  the home realm, from the side's waystone (feeds the zone-band table, bands.ts, and its check)
 *   actWalks()   Act II / III in Concordia (the class thread plus the shared acts the class gets), for Claude 3's
 *                XP projection (walks-export.ts → out/act2-walks.json, act3-walks.json)
 * Needs the content Registry: bundle with tools/playthrough/build.mjs.
 */
import { Game, Registry, createNewGameState, type NpcDef, type QuestDef } from '@/core';
import { AREAS, spaceRuntime } from '@/world/hc/spaces';
import { spawnZones, type SpawnZoneDef } from '@/world/hc/spawns';
import { SpaceQuery } from '@/world/hc/runtime';
import { doorInto, where, whereCreature, type Spot } from './places';

/** creature aggro reach (Claude 3: 240 px) */
export const AGGRO_TILES = 7.5;
/** expected hero level while doing Act I main quest i (1-based): L1 at the first, ~L13 at the gate */
export const expectedLevel = (main: number): number => 1 + 1.3 * (main - 1);
/** Act II and III level bands (Act I ends L13–14, II L26–28, III L38–40) */
const ACT_BAND: Record<'act2' | 'act3', [number, number]> = { act2: [14, 27], act3: [28, 39] };

export interface QuestWalk {
  quest: string;
  type: string;
  /** 1-based index among the class's Act I main quests (mains only) */
  main?: number;
  /** the main quest this one is played during (sides: the one after the last main they need) */
  during: number;
  /** spawn zones within aggro of the walk, and instances entered */
  zones: string[];
  lairs: string[];
}
export interface ClassWalk { cls: string; school: string; side: 'capital' | 'frontier'; mains: string[]; quests: QuestWalk[] }

let loaded = false;
function load(): void {
  if (loaded) return;
  loaded = true;
  Game.set(createNewGameState());
  Registry.load();
}

type Cond = { all?: Cond[]; any?: Cond[]; not?: Cond; questCompleted?: string; heroClass?: string; heroSchool?: string };
const needs = (c: Cond | undefined, out: string[] = []): string[] => {
  if (!c) return out;
  if (c.questCompleted) out.push(c.questCompleted);
  for (const x of [...(c.all ?? []), ...(c.any ?? [])]) needs(x, out);
  return out;
};
/** Whether a class can ever get a quest with this condition (its class/school tests; everything else may pass). */
const fits = (c: Cond | undefined, cls: string, school: string): boolean => {
  if (!c) return true;
  if (c.heroClass) return c.heroClass.replace(/^class:/, '') === cls;
  if (c.heroSchool) return c.heroSchool === school;
  if (c.all) return c.all.every((x) => fits(x, cls, school));
  if (c.any) return c.any.some((x) => fits(x, cls, school));
  if (c.not && (c.not.heroClass || c.not.heroSchool)) return !fits(c.not, cls, school);
  return true;
};

/** Distance (tiles) from a point to a zone's centre, or to its patrol line. */
function reach(z: SpawnZoneDef, p: [number, number]): number {
  if (!z.patrol || z.patrol.length < 2) return Math.hypot(p[0] - z.at[0], p[1] - z.at[1]);
  let best = Infinity;
  for (let i = 0; i < z.patrol.length - 1; i++) {
    const [a, b] = [z.patrol[i], z.patrol[i + 1]], vx = b[0] - a[0], vy = b[1] - a[1], l2 = vx * vx + vy * vy || 1;
    const u = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / l2));
    best = Math.min(best, Math.hypot(p[0] - a[0] - u * vx, p[1] - a[1] - u * vy));
  }
  return best;
}

/** Walk quests in order through `space` from `start`: zones passed and instances entered, per quest. */
function walkQuests(space: string, start: [number, number], order: QuestDef[], cls: string, npcs: Map<string, NpcDef>, maxNodes: number): { zones: string[]; lairs: string[] }[] {
  const zones = spawnZones(space).filter((z) => !z.rect && !z.waves);
  const q = new SpaceQuery(spaceRuntime(space), () => ({ hour: 12, phase: 'day' }) as never);
  let pos = start;
  return order.map((qd) => {
    const hit = new Set<string>(), lairs = new Set<string>();
    for (const st of qd.stages) for (const o of st.objectives as Record<string, any>[]) {
      if (o.optional) continue;
      let spot: Spot | null = null;
      if (o.talk) { const home = npcs.get(o.talk)?.home; spot = home ? where(home) : null; }
      else if (o.interact) spot = where(String(o.interact).replace('*', '1'));
      else if (o.reach) spot = where(o.reach);
      else if (o.kill) spot = (o.marker && where(o.marker.landmark ?? o.marker.place ?? o.marker.region)) || whereCreature(String(o.kill), cls);
      else if (o.marker) spot = where(o.marker.landmark ?? o.marker.place ?? o.marker.region);
      if (!spot) continue;
      if (spot.space.startsWith('inst:')) {
        lairs.add(spot.space);
        const door = doorInto(spot.space);
        if (!door || door.space !== space) continue;
        spot = door;
      }
      if (spot.space !== space) continue;
      const path = (q.findPath(pos, spot.at, maxNodes) as [number, number][] | null) ?? [pos, spot.at];
      for (const p of path) for (const z of zones) {
        if (hit.has(z.id) || Math.abs(p[0] - z.at[0]) > z.r + AGGRO_TILES + 200 || Math.abs(p[1] - z.at[1]) > z.r + AGGRO_TILES + 200) continue;
        if (reach(z, p) <= z.r + AGGRO_TILES) hit.add(z.id);
      }
      pos = spot.at;
    }
    return { zones: [...hit], lairs: [...lairs] };
  });
}

/** Walk every class's Act I (or just `only`). */
export function act1Walks(only?: string[]): ClassWalk[] {
  load();
  const npcs = new Map((Registry.all('npc') as NpcDef[]).map((n) => [n.id, n]));
  const quests = Registry.all('quest') as QuestDef[];
  const out: ClassWalk[] = [];
  for (const area of AREAS) {
    const cls = area.className?.toLowerCase();
    if (!cls || (only && !only.includes(cls))) continue;
    const space = `realm:${area.school}`;
    const act1 = quests.filter((q) => q.campaign === cls && (q as { act?: string }).act === 'act1');
    const mains = act1.filter((q) => q.type === 'main').map((q) => q.id as string);
    // play order: a side that needs main k done is played during main k+1, before it (a side needing a side
    // inherits that side's slot); data order within a slot
    const during = new Map<string, number>(mains.map((id, i) => [id, i + 1]));
    const doneBy = (id: string): number => (mains.includes(id) ? mains.indexOf(id) + 1 : (during.get(id) ?? 1) - 1);
    for (let pass = 0; pass < 4; pass++) for (const q of act1) {
      if (q.type === 'main') continue;
      const after = Math.max(0, ...needs((q as { requires?: Cond }).requires).map(doneBy));
      during.set(q.id, Math.min(mains.length, after + 1));
    }
    const rank = (x: QuestDef) => during.get(x.id)! * 2 + (x.type === 'main' ? 1 : 0);
    const order = act1.map((x, i) => [x, i] as const).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).map(([x]) => x);
    const ws = where(`ws:${area.school}-${area.side}`);
    const walked = walkQuests(space, ws ? ws.at : [192, 128], order, cls, npcs, 400_000);
    const walks: QuestWalk[] = order.map((qd, i) => ({ quest: qd.id, type: qd.type, main: qd.type === 'main' ? mains.indexOf(qd.id) + 1 : undefined, during: during.get(qd.id)!, ...walked[i] }));
    out.push({ cls, school: area.school, side: area.side as 'capital' | 'frontier', mains, quests: walks });
  }
  return out;
}

export interface ActQuestWalk { quest: string; type: string; campaign: string; order: number; expected: number; zones: string[]; lairs: string[] }

/**
 * Act II or III for each class (or `only`): its own act quests plus the shared ones it can get, in play order
 * (by `requires` depth, then data order), walked through Concordia from the Gate Circle (II) or the Heart camp (III).
 * `expected` runs along the act's level band by position in that order.
 */
export function actWalks(act: 'act2' | 'act3', only?: string[]): { cls: string; quests: ActQuestWalk[] }[] {
  load();
  const npcs = new Map((Registry.all('npc') as NpcDef[]).map((n) => [n.id, n]));
  const quests = Registry.all('quest') as QuestDef[];
  const start = where(act === 'act2' ? 'landmark:gate-circle' : 'landmark:heart-camp')?.at ?? [600, 660];
  const [lo, hi] = ACT_BAND[act];
  const out: { cls: string; quests: ActQuestWalk[] }[] = [];
  for (const area of AREAS) {
    const cls = area.className?.toLowerCase();
    if (!cls || (only && !only.includes(cls))) continue;
    const mine = quests.filter((q) => (q as { act?: string }).act === act && (q.campaign === cls || q.campaign === 'shared')
      && fits((q as { requires?: Cond }).requires, cls, area.school));
    const ids = new Set(mine.map((q) => q.id as string));
    const depth = new Map<string, number>();
    const depthOf = (q: QuestDef, seen = new Set<string>()): number => {
      if (depth.has(q.id)) return depth.get(q.id)!;
      if (seen.has(q.id)) return 0;
      seen.add(q.id);
      const pre = needs((q as { requires?: Cond }).requires).filter((id) => ids.has(id)).map((id) => mine.find((x) => x.id === id)!);
      const d = pre.length ? 1 + Math.max(...pre.map((p) => depthOf(p, seen))) : 0;
      depth.set(q.id, d);
      return d;
    };
    const order = mine.map((x, i) => [x, i] as const).sort((a, b) => depthOf(a[0]) - depthOf(b[0]) || a[1] - b[1]).map(([x]) => x);
    const walked = walkQuests('concordia', start, order, cls, npcs, 3_000_000);
    out.push({
      cls,
      quests: order.map((qd, i) => ({
        quest: qd.id, type: qd.type, campaign: String(qd.campaign), order: i + 1,
        expected: +(lo + ((hi - lo) * i) / Math.max(1, order.length - 1)).toFixed(1), ...walked[i],
      })),
    });
  }
  return out;
}
