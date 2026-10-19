/**
 * DEV-only world audit: flood-fills walkable space per flag scenario and checks that landmarks, objects,
 * spawn zones and every world reference in quest/NPC data are reachable and exist. Exposed as window.__worldAudit().
 */
import { CHUNK_TILES, Collision, Game, Registry, type FlagValue, type WorldObject } from '@/core';
import { InstanceProvider, OverworldProvider, type ChunkProvider } from './chunkGen';
import type { WorldModel } from './model';
import { activeObjects } from './overlays';

const BLOCK = Collision.SOLID | Collision.WATER;
const BAD_SPAWN = BLOCK | Collision.NO_SPAWN | Collision.HAZARD;
const REACH = 1.6;

interface Grid { x0: number; y0: number; w: number; h: number; bits: Uint8Array; objects: WorldObject[] }

function buildGrid(p: ChunkProvider, x0: number, y0: number, w: number, h: number): Grid {
  const bits = new Uint8Array(w * h).fill(Collision.SOLID);
  const objects: WorldObject[] = [];
  const cx0 = Math.floor(x0 / CHUNK_TILES), cy0 = Math.floor(y0 / CHUNK_TILES);
  const cx1 = Math.floor((x0 + w - 1) / CHUNK_TILES), cy1 = Math.floor((y0 + h - 1) / CHUNK_TILES);
  for (let cy = Math.max(0, cy0); cy <= Math.min(p.heightChunks - 1, cy1); cy++) {
    for (let cx = Math.max(0, cx0); cx <= Math.min(p.widthChunks - 1, cx1); cx++) {
      const c = p.build(cx, cy);
      objects.push(...c.objects);
      for (let ly = 0; ly < CHUNK_TILES; ly++) for (let lx = 0; lx < CHUNK_TILES; lx++) {
        const gx = cx * CHUNK_TILES + lx - x0, gy = cy * CHUNK_TILES + ly - y0;
        if (gx >= 0 && gy >= 0 && gx < w && gy < h) bits[gy * w + gx] = c.collision[ly * CHUNK_TILES + lx];
      }
    }
  }
  return { x0, y0, w, h, bits, objects };
}

function flood(g: Grid, sx: number, sy: number): Uint8Array {
  const seen = new Uint8Array(g.w * g.h);
  const q: number[] = [];
  const push = (x: number, y: number) => {
    const gx = x - g.x0, gy = y - g.y0;
    if (gx < 0 || gy < 0 || gx >= g.w || gy >= g.h) return;
    const i = gy * g.w + gx;
    if (seen[i] || (g.bits[i] & BLOCK)) return;
    seen[i] = 1;
    q.push(i);
  };
  push(sx, sy);
  while (q.length) {
    const i = q.pop()!;
    const x = (i % g.w) + g.x0, y = Math.floor(i / g.w) + g.y0;
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }
  return seen;
}

/** Is any reached tile within r of (tx, ty)? */
function near(g: Grid, seen: Uint8Array, tx: number, ty: number, r: number): boolean {
  const R = Math.ceil(r);
  for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
    if (dx * dx + dy * dy > r * r) continue;
    const gx = tx + dx - g.x0, gy = ty + dy - g.y0;
    if (gx >= 0 && gy >= 0 && gx < g.w && gy < g.h && seen[gy * g.w + gx]) return true;
  }
  return false;
}

function withFlags<T>(flags: Record<string, FlagValue>, fn: () => T): T {
  const saved = Game.state.flags;
  Game.state.flags = { ...flags };
  try { return fn(); } finally { Game.state.flags = saved; }
}

export function auditWorld(model: WorldModel, start: [number, number]): string[] {
  const out: string[] = [];
  const say = (s: string) => out.push(s);
  const region = model.regions.get('region:aldermoor')!;
  const V = { x: 832, y: 896, w: 256, h: 256 };
  const pad = 24;

  // ---- overworld scenarios
  const scenarios: [string, Record<string, FlagValue>][] = [
    ['start', {}],
    ['mere-drained', { 'prologue.mere_drained': true }],
    ['prologue-complete', { 'prologue.mere_drained': true, 'prologue.complete': true }],
  ];
  for (const [name, flags] of scenarios) {
    withFlags(flags, () => {
      const g = buildGrid(new OverworldProvider(model), V.x - pad, V.y - pad, V.w + pad * 2, V.h + pad * 2);
      const seen = flood(g, start[0], start[1]);
      let leak: [number, number] | null = null;
      for (let i = 0; i < seen.length && !leak; i++) {
        if (!seen[i]) continue;
        const x = (i % g.w) + g.x0, y = Math.floor(i / g.w) + g.y0;
        if (x < V.x || y < V.y || x >= V.x + V.w || y >= V.y + V.h) leak = [x, y];
      }
      const closed = name !== 'prologue-complete';
      if (closed && leak) say(`[${name}] LEAK: valley escapable at world tile ${leak.join(',')}`);
      if (!closed && !leak) say(`[${name}] exits did not open`);
      const lmMiss = region.landmarks.filter((l) => !near(g, seen, l.at[0], l.at[1], l.discoverRadius)).map((l) => l.id);
      say(`[${name}] landmarks unreachable: ${lmMiss.join(', ') || 'none'}`);
      const objMiss = g.objects.filter((o) => o.kind !== 'trigger' && o.kind !== 'npc-anchor' && !near(g, seen, o.at[0], o.at[1], REACH)).map((o) => o.id);
      say(`[${name}] objects unreachable: ${[...new Set(objMiss)].join(', ') || 'none'}`);
      const anchorMiss = g.objects.filter((o) => o.kind === 'npc-anchor' && !near(g, seen, o.at[0], o.at[1], 2.5)).map((o) => o.id);
      if (anchorMiss.length) say(`[${name}] npc-anchors unreachable: ${[...new Set(anchorMiss)].join(', ')}`);
      if (name === 'start') {
        for (const z of region.spawnZones) {
          let ok = 0, reach = 0;
          for (let y = z.area.y; y < z.area.y + z.area.h; y++) for (let x = z.area.x; x < z.area.x + z.area.w; x++) {
            const gx = x - g.x0, gy = y - g.y0;
            if (gx < 0 || gy < 0 || gx >= g.w || gy >= g.h) continue;
            if (!(g.bits[gy * g.w + gx] & BAD_SPAWN)) { ok++; if (seen[gy * g.w + gx]) reach++; }
          }
          if (ok < z.maxAlive * 3 || reach < ok * 0.5) say(`[spawn] ${z.id}: ${ok} spawnable tiles, ${reach} reachable`);
        }
      }
    });
  }

  // ---- Act I overworld: all six Act I regions, flooded from Haldren market. Ylwen is expected sealed in act1-start.
  const act1Regions = ['region:kingsvale', 'region:greywater-marsh', 'region:witherdowns', 'region:ironspine-foothills', 'region:saltreach-coast', 'region:ylwen-deepwood'].map((id) => model.regions.get(id)).filter((r) => !!r);
  const act1Scen: [string, Record<string, FlagValue>][] = [
    ['act1-start', { 'prologue.complete': true, 'prologue.mere_drained': true }],
    ['act1-late', { 'prologue.complete': true, 'prologue.mere_drained': true, 'act1.varn_assault': true, 'act1.cinderhold_restored': true, 'act1.ylwen_pact': true, 'act1.korrath_gate_open': true }],
  ];
  for (const [name, flags] of act1Scen) {
    withFlags(flags, () => {
      const g = buildGrid(new OverworldProvider(model), 250, 500, 1170, 660);
      const seen = flood(g, 832, 700);
      const lmMiss = act1Regions.flatMap((r) => r.landmarks).filter((l) => !near(g, seen, l.at[0], l.at[1], l.discoverRadius)).map((l) => l.id);
      say(`[${name}] landmarks unreachable: ${lmMiss.join(', ') || 'none'}`);
      const objMiss = g.objects.filter((o) => o.kind !== 'trigger' && o.kind !== 'npc-anchor' && !near(g, seen, o.at[0], o.at[1], REACH)).map((o) => o.id);
      say(`[${name}] objects unreachable: ${[...new Set(objMiss)].join(', ') || 'none'}`);
      say(`[${name}] Brindlecross reachable from Haldren: ${near(g, seen, 958, 1036, 2)}`);
    });
  }

  // ---- Acts II and III: every gate open, whole continent, ferries followed.
  const allOpen: Record<string, FlagValue> = {
    'prologue.complete': true, 'prologue.mere_drained': true, 'act1.complete': true, 'act1.varn_assault': true, 'act1.cinderhold_restored': true,
    'act1.ylwen_pact': true, 'act1.korrath_gate_open': true, 'act2.northpass_open': true, 'act2.ashroad_known': true, 'act2.ship_passage': true,
  };
  const late: [string, Record<string, FlagValue>, string[]][] = [
    ['act2-open', allOpen, ['region:lantern-coast', 'region:ironspine', 'region:frostreach', 'region:saltreach-isles', 'region:sunscar', 'region:cinder-wastes']],
    ['act3-open', { ...allOpen, 'act3.breach_open': true, 'act3.heartforge_unsealed': true, 'act3.siege_active': true, 'world.mire_level': 5 },
      ['region:mirelands', 'region:kingsvale', 'region:greywater-marsh']],
  ];
  for (const [name, flags, regionIds] of late) withFlags(flags, () => {
    const g = buildGrid(new OverworldProvider(model), 0, 0, 2048, 1536);
    const seen = flood(g, 832, 700);
    for (let pass = 0; pass < 4; pass++) {
      for (const o of g.objects) {
        if (o.kind !== 'door' || o.props?.target !== 'tp' || !near(g, seen, o.at[0], o.at[1], REACH)) continue;
        const [tx, ty] = [Number(o.props.toX), Number(o.props.toY)];
        if (!seen[ty * g.w + tx]) { const more = flood(g, tx, ty); for (let i = 0; i < seen.length; i++) seen[i] |= more[i]; }
      }
    }
    const regs = regionIds.map((id) => model.regions.get(id)).filter((r) => !!r);
    const lmMiss = regs.flatMap((r) => r.landmarks).filter((l) => !near(g, seen, l.at[0], l.at[1], l.discoverRadius)).map((l) => l.id);
    say(`[${name}] landmarks unreachable: ${lmMiss.join(', ') || 'none'}`);
    const objMiss = g.objects.filter((o) => o.kind !== 'trigger' && o.kind !== 'npc-anchor' && !near(g, seen, o.at[0], o.at[1], REACH)).map((o) => o.id);
    say(`[${name}] objects unreachable: ${[...new Set(objMiss)].join(', ') || 'none'}`);
  });

  // ---- instances
  for (const inst of model.instances.values()) {
    for (const floor of inst.floors) {
      const overlay = model.overlays.get(floor.overlay);
      if (!overlay) { say(`[${inst.id}/${floor.id}] missing ${floor.overlay}`); continue; }
      const scen: Record<string, FlagValue> = { 'world.lever.abbey-floodgate': true, 'world.cleared.zone:abbey-reliquary': true };
      withFlags(scen, () => {
        const g = buildGrid(new InstanceProvider(overlay, '', inst.biome), 0, 0, overlay.size[0], overlay.size[1]);
        for (const [ename, [ex, ey]] of Object.entries(floor.entrances)) {
          if (g.bits[ey * g.w + ex] & BLOCK) say(`[${inst.id}/${floor.id}] entrance "${ename}" is inside a wall`);
        }
        const [sx, sy] = Object.values(floor.entrances)[0];
        const seen = flood(g, sx, sy);
        const miss = [...g.objects, ...activeObjects(overlay)].filter((o) => o.kind !== 'trigger' && !near(g, seen, o.at[0], o.at[1], REACH)).map((o) => o.id);
        if (miss.length) say(`[${inst.id}/${floor.id}] objects unreachable: ${[...new Set(miss)].join(', ')}`);
        for (const l of floor.landmarks ?? []) if (!near(g, seen, l.at[0], l.at[1], l.discoverRadius)) say(`[${inst.id}/${floor.id}] landmark unreachable: ${l.id}`);
        for (const o of g.objects.filter((x) => x.kind === 'door')) {
          const t = String(o.props?.target);
          if (t === 'overworld') continue;
          const ti = model.instances.get(t);
          const tf = ti?.floors.find((f) => f.id === (o.props?.floor ?? ti.floors[0].id));
          if (!tf || !(String(o.props?.entrance ?? 'main') in tf.entrances)) say(`[${inst.id}/${floor.id}] door ${o.id} → bad target ${t}/${o.props?.floor}/${o.props?.entrance}`);
        }
      });
    }
  }

  // ---- references from Claude 4's data
  const landmarkIds = new Set<string>();
  for (const r of model.regions.values()) r.landmarks.forEach((l) => landmarkIds.add(l.id));
  for (const i of model.instances.values()) i.floors.forEach((f) => f.landmarks?.forEach((l) => landmarkIds.add(l.id)));
  const objectIds = new Set<string>();
  for (const o of model.overlays.values()) {
    o.objects?.forEach((x) => objectIds.add(x.id));
    o.variants?.forEach((v) => v.objects?.forEach((x) => objectIds.add(x.id)));
  }
  const anchorLandmarks = new Set<string>();
  for (const o of model.overlays.values()) {
    [...(o.objects ?? []), ...(o.variants ?? []).flatMap((v) => v.objects ?? [])]
      .filter((x) => x.kind === 'npc-anchor').forEach((x) => anchorLandmarks.add(String(x.props?.landmark)));
  }
  const missing = new Set<string>();
  for (const q of Registry.all('quest')) for (const s of q.stages) for (const ob of s.objectives) {
    const o = ob as Record<string, unknown>;
    const reach = typeof o.reach === 'string' ? o.reach : null;
    if (reach?.startsWith('landmark:') && !landmarkIds.has(reach)) missing.add(`${q.id}: reach ${reach}`);
    if (reach?.startsWith('area:') && !objectIds.has(reach)) missing.add(`${q.id}: reach ${reach}`);
    if (reach?.startsWith('instance:') && !model.instances.has(reach)) missing.add(`${q.id}: reach ${reach}`);
    const it = typeof o.interact === 'string' ? o.interact : null;
    if (it && !(it.endsWith('*') ? [...objectIds].some((id) => id.startsWith(it.slice(0, -1))) : objectIds.has(it))) missing.add(`${q.id}: interact ${it}`);
    const mk = o.marker as { landmark?: string } | undefined;
    if (mk?.landmark && !landmarkIds.has(mk.landmark)) missing.add(`${q.id}: marker ${mk.landmark}`);
  }
  for (const n of Registry.all('npc')) {
    const spots = [n.home, ...(n.schedule ?? []).map((e) => e.at)];
    for (const s of spots) {
      if (!landmarkIds.has(s)) missing.add(`${n.id}: landmark ${s} does not exist`);
      else if (!anchorLandmarks.has(s) && !s.startsWith('landmark:abbey-')) missing.add(`${n.id}: no npc-anchor at ${s}`);
    }
  }
  say(`[refs] ${missing.size ? [...missing].join(' | ') : 'all quest/NPC world references resolve'}`);
  return out;
}
