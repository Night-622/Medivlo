/**
 * Body clearance (Claude 2, for Claude 3's sprite-sized hitboxes: heroes r12, bosses to ~r47). The sim moves a
 * body of radius r as a 1.6r × 1.2r box against tile collision (src/systems/sim/index.ts → moveAndCollide), so a
 * body fits wherever a ceil(1.6r/32) × ceil(1.2r/32) block of tiles is free, and slides between such spots.
 * Arena hazards (sim circles, ~r40, that creatures steer round) count as blocked tiles.
 *   ENTRY=tools/playthrough/clearance.ts OUT=<file> node tools/playthrough/build.mjs && node <file>
 * Reports, per boss spawn: can the largest boss that spawns there stand at its spawn, and how much of the floor a
 * hero can reach round it (12 tiles) it can reach; per lair pack room: can its biggest creature get out to the
 * instance entrance (or is it walled into its room); per story kill objective with a body over r20 out in a realm
 * or Concordia (spawned at its quest marker): the same arena test round the marker.
 */
import { CHUNK_TILES, TILE_SIZE, type WorldObject } from '@/core';
import { creature } from '@/systems/rules/creatures';
import { HC_CAMPAIGN_BOSSES } from '@/data/enemies/hc/campaign';
import { SENTINELS } from '@/data/regions/hc/sentinels';
import { AREAS, REALMS, instanceDef, spaceRuntime } from '@/world/hc/spaces';
import { SpaceQuery } from '@/world/hc/runtime';
import { markerAt, spawnZones } from '@/world/hc/spawns';
import { Game, Registry, createNewGameState, type QuestDef } from '@/core';
import type { InstanceGen } from '@/world/hc/instanceGen';

const COVER_MIN = 0.6; // a boss that reaches less of its arena than this is easy to kite or wall off
const R = 12; // tiles round a boss spawn that count as its arena

const inst = AREAS.flatMap((a) => [...[1, 2, 3].map((n) => `inst:${a.school}-${a.side}-lair-${n}`), `inst:${a.school}-${a.side}-cave`])
  .concat(['frost', 'gilded', 'storm', 'abbey', 'gloam', 'briar', 'ash', 'alder', 'road', 'marsh'].map((r) => `inst:${r}-cave`),
    ['inst:varric-barrow', 'inst:drowned-abbey', 'inst:concord-citadel'], SENTINELS.map((s) => s.inst))
  .filter((id) => instanceDef(id));
const spaces = [...REALMS.filter((r) => r.school).map((r) => r.space), 'concordia', ...inst];
const box = (r: number): [number, number] => [Math.ceil((1.6 * r) / TILE_SIZE), Math.ceil((1.2 * r) / TILE_SIZE)];
/** FORCE_R=<px>: test every body at this radius (proves the check can fail) */
const radiusOf = (id: string) => Number(process.env.FORCE_R) || (creature(id)?.radius ?? 0);
const ACT3 = HC_CAMPAIGN_BOSSES.filter((b) => b.slot === 'herald' || b.slot === 'chimera').map((b) => b.id);

Game.set(createNewGameState());
Registry.load();
/** story kills of big bodies at a marker in an open space: space → [{ creature, at, quest }] */
const kills = new Map<string, { creature: string; at: [number, number]; quest: string }[]>();
for (const qd of Registry.all('quest') as QuestDef[]) for (const st of qd.stages) for (const o of st.objectives as Record<string, any>[]) {
  if (!o.kill || !o.marker || radiusOf(String(o.kill)) <= 20) continue;
  const m = markerAt(String(o.marker.landmark ?? o.marker.place ?? o.marker.region ?? ''));
  if (!m || m.space.startsWith('inst:')) continue;
  kills.set(m.space, [...(kills.get(m.space) ?? []), { creature: String(o.kill), at: m.at, quest: `${qd.id}#${st.id}` }]);
}
let storyKills = 0;
let problems = 0, bosses = 0, rooms = 0, maxBoss = 0, maxRoom = 0, minCover = 1, worstCover = '';
const caps: string[] = [];
for (const space of spaces) {
  const rt = spaceRuntime(space), g = rt.gen;
  const q = new SpaceQuery(rt, () => ({ hour: 12, phase: 'day' }) as never);
  const objs: WorldObject[] = [];
  const isInst = space.startsWith('inst:');
  const cw = Math.ceil(g.widthTiles / CHUNK_TILES), ch = Math.ceil(g.heightTiles / CHUNK_TILES);
  for (let cy = 0; cy < ch; cy++) for (let cx = 0; cx < cw; cx++) objs.push(...g.objects(cx, cy));
  const hazards = objs.filter((o) => o.id.startsWith('hz:') && typeof o.props?.hazard === 'string');
  const blockedAt = (tx: number, ty: number): boolean => {
    if (!q.isWalkable(tx, ty)) return true;
    for (const h of hazards) {
      const hx = h.at[0] * TILE_SIZE + 16, hy = (h.at[1] - 1) * TILE_SIZE + 16, r = Number(h.props?.r) || 40;
      if (Math.hypot(tx * TILE_SIZE + 16 - hx, ty * TILE_SIZE + 16 - hy) < r) return true;
    }
    return false;
  };
  /** box-position flood fill (top-left tiles) inside a window; returns the tiles the box can cover */
  const reach = (sx: number, sy: number, [bw, bh]: [number, number], win: [number, number, number, number]): Set<string> => {
    const fits = (x: number, y: number) => {
      if (x < win[0] || y < win[1] || x + bw - 1 > win[2] || y + bh - 1 > win[3]) return false;
      for (let j = 0; j < bh; j++) for (let i = 0; i < bw; i++) if (blockedAt(x + i, y + j)) return false;
      return true;
    };
    const seen = new Set<string>(), cover = new Set<string>(), todo: [number, number][] = [];
    // any placement that covers the start tile
    for (let j = 0; j < bh; j++) for (let i = 0; i < bw; i++) if (fits(sx - i, sy - j)) { todo.push([sx - i, sy - j]); seen.add(`${sx - i},${sy - j}`); }
    while (todo.length) {
      const [x, y] = todo.pop()!;
      for (let j = 0; j < bh; j++) for (let i = 0; i < bw; i++) cover.add(`${x + i},${y + j}`);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const k = `${x + dx},${y + dy}`;
        if (!seen.has(k) && fits(x + dx, y + dy)) { seen.add(k); todo.push([x + dx, y + dy]); }
      }
    }
    return cover;
  };

  for (const o of objs.filter((x) => x.id.startsWith('boss:'))) {
    const pr = o.props ?? {};
    const sx = Number(pr.x), sy = Number(pr.y);
    if (!Number.isFinite(sx)) continue;
    const ids = pr.boss === 'class:act3' ? ACT3 : [String(pr.boss)];
    const big = ids.map((id) => [id, radiusOf(id)] as const).sort((a, b) => b[1] - a[1])[0];
    if (!big || !big[1]) continue;
    bosses++;
    const win: [number, number, number, number] = [sx - R, sy - R, sx + R, sy + R];
    const hero = reach(sx, sy, box(12), win), mine = reach(sx, sy, box(big[1]), win);
    const cov = hero.size ? [...hero].filter((k) => mine.has(k)).length / hero.size : 0;
    maxBoss = Math.max(maxBoss, big[1]);
    if (cov < minCover) { minCover = cov; worstCover = `${big[0]} r${big[1]} in ${space}`; }
    if (!mine.size || cov < COVER_MIN) {
      problems++;
      // the largest radius that would still cover COVER_MIN of the arena
      let fitR = big[1];
      while (fitR > 8) { fitR -= 2; const m = reach(sx, sy, box(fitR), win); if (m.size && [...hero].filter((k) => m.has(k)).length / hero.size >= COVER_MIN) break; }
      console.log(`BOSS ${space} ${o.id} ${big[0]} r${big[1]} (box ${box(big[1]).join('×')} tiles): ${mine.size ? `reaches ${(cov * 100).toFixed(0)}% of its arena` : 'cannot stand at its spawn'}; fits at r≤${fitR}`);
      caps.push(`${big[0]} r${big[1]} → r${fitR} (${space})`);
    }
  }

  for (const k of kills.get(space) ?? []) {
    storyKills++;
    const [sx, sy] = k.at, r = radiusOf(k.creature);
    const win: [number, number, number, number] = [sx - R, sy - R, sx + R, sy + R];
    const hero = reach(sx, sy, box(12), win), mine = reach(sx, sy, box(r), win);
    const cov = hero.size ? [...hero].filter((x) => mine.has(x)).length / hero.size : 0;
    if (!mine.size || cov < COVER_MIN) { problems++; console.log(`KILL ${space} ${k.quest} ${k.creature} r${r} at ${k.at}: ${mine.size ? `reaches ${(cov * 100).toFixed(0)}%` : 'cannot stand at the marker'}`); }
  }

  if (!isInst) continue;
  const gen = g as InstanceGen, [ex, ey] = gen.entrance;
  for (const z of spawnZones(space)) {
    const ids = [...new Set([...z.pool, ...(z.waves ?? []).flat().map((s) => s.creature)])];
    const big = ids.map((id) => [id, radiusOf(id)] as const).sort((a, b) => b[1] - a[1])[0];
    if (!big || !big[1]) continue;
    rooms++;
    maxRoom = Math.max(maxRoom, big[1]);
    const win: [number, number, number, number] = [0, 0, g.widthTiles - 1, g.heightTiles - 1];
    const c = reach(Math.round(z.at[0]), Math.round(z.at[1]), box(big[1]), win);
    const out = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => c.has(`${ex + dx},${ey + dy}`));
    if (!c.size || !out) {
      problems++;
      console.log(`ROOM ${space} ${z.id} ${big[0]} r${big[1]} (box ${box(big[1]).join('×')}): ${c.size ? "can't get out to the entrance" : 'cannot stand in its room'}`);
    }
  }
}
console.log(`${storyKills} big-body story kills in the open; ${bosses} boss spawns (largest r${maxBoss}, lowest arena reach ${(minCover * 100).toFixed(0)}%: ${worstCover}), ${rooms} lair pack rooms (largest r${maxRoom}); problems ${problems}`);
if (caps.length) console.log(`caps:\n  ${[...new Set(caps)].join('\n  ')}`);
