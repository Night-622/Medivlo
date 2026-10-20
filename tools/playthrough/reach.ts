/**
 * New-player reach check (Claude 2, for Claude 1's safety net): can a hero body actually get to everything the
 * game points at? A hero (r12) moves as a 1×1-tile box (clearance.ts), so tile reachability is the hero's.
 * Per space, one flood of walkable tiles from its waystones and village centres (an instance: from its entrance);
 * Concordia twice, with the Heart gate sealed and open (Heart places may need it open, nothing else may).
 * Tested against the floods:
 *   - every quest objective place of all 24 campaigns and the shared quests (Claude 4's objectivePlaces): objects
 *     and landmarks within prompt range of a reached tile, areas/regions/zones/villages with a reached tile near
 *     their centre, instances at their door (and their inside pieces from the entrance), NPCs as below
 *   - every NPC at every spot it can stand (home and schedule, as the snapshots place it): on walkable ground and
 *     within talk-prompt range of a reached tile
 *   - every chest and search object: within prompt range (FocusPrompt's 1.9 tiles) of a reached tile
 *   ENTRY=tools/playthrough/checks.ts OUT=<file> node tools/playthrough/build.mjs && node <file> reach
 */
import { CHUNK_TILES, Game, Registry, TILE_SIZE, createNewGameState, setFlag, type NpcDef, type QuestDef, type WorldObject } from '@/core';
import { SENTINELS } from '@/data/regions/hc/sentinels';
import { AREAS, ARENAS, REALMS, allWaystones, instanceDef, spaceRuntime } from '@/world/hc/spaces';
import { SpaceQuery } from '@/world/hc/runtime';
import { markerAt, warmMarkers } from '@/world/hc/spawns';
import { morvaneRegionAt } from '@/world/hc/overview';
import { npcsIn } from '@/world/hc/npcs';
import type { InstanceGen } from '@/world/hc/instanceGen';
import type { RealmGen } from '@/world/hc/realmGen';
import type { ConcordiaGen } from '@/world/hc/concordiaGen';
import { CAMPAIGNS } from '@/narrative/engine/classes';
import { objectivePlaces } from '@/narrative/client/markers';

/** FocusPrompt's range (the [F] prompt shows only inside it) */
const PROMPT = 1.9;
/** an area objective counts as reached with a reached tile this close to its centre */
const AREA_R = 8;

Game.set(createNewGameState());
Registry.load();
while (warmMarkers());

const INSTANCES = AREAS.flatMap((a) => [...[1, 2, 3].map((n) => `inst:${a.school}-${a.side}-lair-${n}`), `inst:${a.school}-${a.side}-cave`])
  .concat(['frost', 'gilded', 'storm', 'abbey', 'gloam', 'briar', 'ash', 'alder', 'road', 'marsh'].map((r) => `inst:${r}-cave`),
    ['inst:varric-barrow', 'inst:drowned-abbey', 'inst:concord-citadel'], SENTINELS.map((s) => s.inst))
  .filter((id) => instanceDef(id));
const OPEN = [...REALMS.filter((r) => r.school).map((r) => r.space), 'concordia'];
const SPACES = [...OPEN, ...ARENAS.map((a) => a.id), ...INSTANCES];

interface Flood { space: string; w: number; h: number; seen: Uint8Array; q: SpaceQuery }
const query = (space: string) => new SpaceQuery(spaceRuntime(space), () => ({ hour: 12, phase: 'day' }) as never);

function flood(space: string, sources: [number, number][]): Flood {
  const q = query(space), g = spaceRuntime(space).gen, w = g.widthTiles, h = g.heightTiles;
  const seen = new Uint8Array(w * h), todo: number[] = [];
  const push = (x: number, y: number) => { if (x >= 0 && y >= 0 && x < w && y < h && !seen[y * w + x] && q.isWalkable(x, y)) { seen[y * w + x] = 1; todo.push(y * w + x); } };
  // a source on a blocked tile (a waystone's own stone) starts from the tiles round it
  for (const [x, y] of sources) for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) push(x + dx, y + dy);
  while (todo.length) {
    const k = todo.pop()!, x = k % w, y = (k / w) | 0;
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
    // diagonal steps as A* takes them: both sides open
    for (const [dx, dy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) if (q.isWalkable(x + dx, y) && q.isWalkable(x, y + dy)) push(x + dx, y + dy);
  }
  return { space, w, h, seen, q };
}
const reached = (f: Flood, x: number, y: number) => x >= 0 && y >= 0 && x < f.w && y < f.h && f.seen[y * f.w + x] === 1;
/** a reached tile whose centre is within `r` tiles of the px point (or of an object's box) */
function near(f: Flood, px: number, py: number, r: number, box?: { at: [number, number]; size?: [number, number] }): boolean {
  const cx = px / TILE_SIZE, cy = py / TILE_SIZE, R = Math.ceil(r) + 2;
  for (let ty = Math.floor(cy) - R; ty <= Math.floor(cy) + R; ty++) for (let tx = Math.floor(cx) - R; tx <= Math.floor(cx) + R; tx++) {
    if (!reached(f, tx, ty)) continue;
    const mx = tx + 0.5, my = ty + 0.5;
    let d: number;
    if (box) { const [w, h] = box.size ?? [1, 1]; d = Math.hypot(Math.max(box.at[0] - mx, 0, mx - (box.at[0] + w)), Math.max(box.at[1] - my, 0, my - (box.at[1] + h))); }
    else d = Math.hypot(mx - cx, my - cy);
    if (d <= r) return true;
  }
  return false;
}

// ───────────── floods and the object index ─────────────
const t0 = performance.now();
const floods = new Map<string, Flood>();
const objects = new Map<string, { space: string; o: WorldObject }>();
for (const space of SPACES) {
  const g = spaceRuntime(space).gen;
  const all: WorldObject[] = [];
  for (let cy = 0; cy < Math.ceil(g.heightTiles / CHUNK_TILES); cy++) for (let cx = 0; cx < Math.ceil(g.widthTiles / CHUNK_TILES); cx++) all.push(...g.objects(cx, cy));
  for (const o of all) if (!objects.has(o.id)) objects.set(o.id, { space, o });
  let src: [number, number][];
  if (space.startsWith('inst:')) src = [(g as InstanceGen).entrance];
  else if (space.startsWith('arena:')) src = all.filter((o) => o.kind === 'door' || o.kind === 'waystone').map((o) => o.at);
  else {
    const vil = space === 'concordia' ? (g as ConcordiaGen).data.villages : (g as RealmGen).villages;
    src = [...allWaystones().filter((w) => w.space === space).map((w) => w.at), ...vil.map((v) => v.at)];
  }
  floods.set(space, flood(space, src));
}
// the Heart behind the Weeping Wall: a second Concordia flood with the gate open
setFlag('story.heart_open', true);
const heartOpen = flood('concordia', [...allWaystones().filter((w) => w.space === 'concordia').map((w) => w.at)]);
setFlag('story.heart_open', false);
const inHeart = (space: string, x: number, y: number) => space === 'concordia' && morvaneRegionAt(x / 4, y / 4)?.id === 'region:heart';
const ms = Math.round(performance.now() - t0);

const problems: string[] = [];
const fail = (s: string) => problems.push(s);
/** reached in its space's flood (Concordia: the open-Heart flood for places inside the Heart) */
const floodFor = (space: string, tx: number, ty: number) => (inHeart(space, tx, ty) ? heartOpen : floods.get(space));

// ───────────── NPCs: every spot each can stand ─────────────
const npcs = Registry.all('npc') as NpcDef[];
const allAt = new Map<string, NpcDef[]>();
for (const n of npcs) for (const lm of new Set([n.home, ...(n.schedule ?? []).map((s) => s.at)].filter(Boolean) as string[])) allAt.set(lm, [...(allAt.get(lm) ?? []), n]);
const npcOk = new Map<string, boolean>();
let npcSpots = 0;
for (const space of SPACES) {
  for (const s of npcsIn(space, allAt)) {
    npcSpots++;
    const tx = Math.floor(s.x / TILE_SIZE), ty = Math.floor((s.y - 1) / TILE_SIZE), f = floodFor(space, tx, ty)!;
    const ok = near(f, s.x, s.y - 8, PROMPT);
    const onGround = f.q.isWalkable(tx, ty);
    if (!ok) fail(`NPC ${s.npc.id} at ${space} ${tx},${ty}: no reachable tile within ${PROMPT} tiles`);
    else if (!onGround) fail(`NPC ${s.npc.id} at ${space} ${tx},${ty}: stands inside collision`);
    npcOk.set(s.npc.id, (npcOk.get(s.npc.id) ?? false) || ok);
  }
}

// ───────────── chests and search objects ─────────────
let usables = 0;
for (const { space, o } of objects.values()) {
  if (o.kind !== 'chest' && o.kind !== 'interactable') continue;
  if (o.props?.hazard) continue; // arena hazards are the sim's (circles fought round), not [F] objects
  usables++;
  const f = floodFor(space, o.at[0], o.at[1])!;
  if (!near(f, o.at[0] * TILE_SIZE, o.at[1] * TILE_SIZE, PROMPT, o)) fail(`${o.kind.toUpperCase()} ${o.id} at ${space} ${o.at}: no reachable tile within ${PROMPT} tiles`);
}

// ───────────── quest objective places ─────────────
const quests = Registry.all('quest') as QuestDef[];
const clsOf = (q: QuestDef) => CAMPAIGNS.find((c) => q.id.startsWith(`quest:${c.id}-`))?.id ?? '';
const placeOk = new Map<string, string | null>(); // place → problem (null: fine)
function checkPlace(id: string): string | null {
  if (placeOk.has(id)) return placeOk.get(id)!;
  let why: string | null = null;
  if (id.startsWith('npc:')) why = npcOk.get(id) ? null : npcOk.has(id) ? 'NPC out of reach' : 'NPC stands nowhere';
  else if (id.startsWith('inst:')) {
    const door = markerAt(id), f = door && floodFor(door.space, door.at[0], door.at[1]);
    why = !door ? 'no door' : !f || !near(f, door.at[0] * TILE_SIZE + 16, door.at[1] * TILE_SIZE + 16, PROMPT) ? `door at ${door.space} ${door.at} out of reach` : null;
  } else if (objects.has(id) && !/^(region|zone|area|vil):/.test(id)) {
    const { space, o } = objects.get(id)!, f = floodFor(space, o.at[0], o.at[1])!;
    const r = o.kind === 'trigger' ? 0.5 : PROMPT;
    why = near(f, o.at[0] * TILE_SIZE, o.at[1] * TILE_SIZE, r, o) ? null : `${space} ${o.at} out of reach`;
  } else {
    const m = markerAt(id), f = m && floodFor(m.space, m.at[0], m.at[1]);
    why = !m ? 'unresolved' : !f || !near(f, m.at[0] * TILE_SIZE + 16, m.at[1] * TILE_SIZE + 16, AREA_R) ? `area centre ${m.space} ${m.at}: nothing reachable within ${AREA_R}` : null;
  }
  placeOk.set(id, why);
  return why;
}
let objectives = 0;
for (const q of quests) for (const st of q.stages) for (const o of st.objectives) {
  if (o.hidden) continue;
  const places = objectivePlaces(o, clsOf(q));
  if (!places.length) continue;
  objectives++;
  for (const p of places) { const why = checkPlace(p); if (why) fail(`OBJECTIVE ${q.id}#${st.id}/${o.id} → ${p}: ${why}`); }
}

const uniq = [...new Set(problems)];
const LIMIT = Number(process.env.REACH_ALL) ? Infinity : 80;
for (const p of uniq.slice(0, LIMIT)) console.log(p);
if (uniq.length > LIMIT) console.log(`… ${uniq.length - LIMIT} more (REACH_ALL=1 lists them all)`);
console.log(`reach: ${SPACES.length} spaces flooded in ${ms} ms; ${objectives} objectives (${placeOk.size} places), ${npcSpots} NPC spots, ${usables} chests and search objects; problems ${uniq.length}`);
if (uniq.length) process.exitCode = 1;
