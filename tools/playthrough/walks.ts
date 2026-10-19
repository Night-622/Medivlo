/**
 * Act I walks (Claude 2): each class's Act I quests in play order, walked by A* from the side's waystone through
 * every objective in its home realm, with every spawn zone whose creatures come within aggro of the walk and
 * every instance entered. Feeds the zone-band table (bands.ts), its check (checks.ts bands) and Claude 3's XP
 * projection (out/act1-walks.json). Needs the content Registry: bundle with tools/playthrough/build.mjs.
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

type Cond = { all?: Cond[]; any?: Cond[]; not?: Cond; questCompleted?: string };
const needs = (c: Cond | undefined, out: string[] = []): string[] => {
  if (!c) return out;
  if (c.questCompleted) out.push(c.questCompleted);
  for (const x of [...(c.all ?? []), ...(c.any ?? [])]) needs(x, out);
  return out;
};

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
    const zones = spawnZones(space).filter((z) => !z.rect && !z.waves);
    const q = new SpaceQuery(spaceRuntime(space), () => ({ hour: 12, phase: 'day' }) as never);
    const ws = where(`ws:${area.school}-${area.side}`);
    let pos: [number, number] = ws ? ws.at : [192, 128];
    const walks: QuestWalk[] = [];
    for (const qd of order) {
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
        const path = (q.findPath(pos, spot.at, 400000) as [number, number][] | null) ?? [pos, spot.at];
        for (const p of path) for (const z of zones) if (!hit.has(z.id) && reach(z, p) <= z.r + AGGRO_TILES) hit.add(z.id);
        pos = spot.at;
      }
      walks.push({ quest: qd.id, type: qd.type, main: qd.type === 'main' ? mains.indexOf(qd.id) + 1 : undefined, during: during.get(qd.id)!, zones: [...hit], lairs: [...lairs] });
    }
    out.push({ cls, school: area.school, side: area.side as 'capital' | 'frontier', mains, quests: walks });
  }
  return out;
}

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
