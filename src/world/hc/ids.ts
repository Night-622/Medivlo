/**
 * Every id the generated world actually contains, for Claude 4's validateContent() source (dev only: it
 * builds every space's generator, ~1–2 s). Pure, no Phaser.
 *   places:  spaces, regions/areas/zones, villages, waystones, landmarks, instance ids that doors lead to
 *   objects: every other object id (obj:, npc-anchor:, doors…), plus lair-interior set pieces queued for lairs
 */
import { MORVANE_REGIONS } from '@/data/regions/hc/morvane';
import { CHUNK_TILES } from '@/core';
import type { ConcordiaGen } from './concordiaGen';
import type { RealmGen } from './realmGen';
import { AREAS, ARENAS, REALMS, allWaystones, instanceDef, spaceRuntime } from './spaces';

export function worldIds(): { places: Set<string>; objects: Set<string> } {
  const places = new Set<string>(), objects = new Set<string>();
  const spaces = [...REALMS.map((r) => r.space), ...ARENAS.map((a) => a.id)];
  for (const s of spaces) places.add(s);
  for (const r of MORVANE_REGIONS) places.add(r.id);
  for (const a of AREAS) {
    places.add(a.id);
    places.add(`area:${a.school}-gate`);
    a.zones.forEach((_, i) => places.add(`zone:${a.school}-${a.side}-${i + 1}`));
    a.lairs.forEach((_, i) => places.add(`inst:${a.school}-${a.side}-lair-${i + 1}`));
  }
  for (const w of allWaystones()) places.add(w.id);
  for (const s of spaces) {
    const gen = spaceRuntime(s).gen;
    const villages = (gen as Partial<RealmGen>).villages ?? (s === 'concordia' ? (gen as ConcordiaGen).data.villages : []);
    for (const v of villages) places.add(v.id);
    for (const id of (gen as Partial<RealmGen>).optional?.keys() ?? []) places.add(id);
    for (const id of (gen as Partial<RealmGen>).triggers?.keys() ?? []) places.add(id);
    for (const pieces of (gen as Partial<RealmGen>).lairPieces?.values() ?? []) {
      for (const p of pieces) (p.id.startsWith('landmark:') ? places : objects).add(p.id);
    }
    const cw = Math.ceil(gen.widthTiles / CHUNK_TILES), ch = Math.ceil(gen.heightTiles / CHUNK_TILES);
    for (let cy = 0; cy < ch; cy++) for (let cx = 0; cx < cw; cx++) {
      for (const o of gen.objects(cx, cy)) {
        if (o.id.startsWith('landmark:') || o.id.startsWith('ws:')) places.add(o.id);
        else objects.add(o.id);
        const t = o.props?.target;
        if (typeof t === 'string' && t.startsWith('inst:')) places.add(t);
      }
    }
  }
  // pieces that live inside instances (the drowned nave's clapper, lair relics)
  for (const id of [...places].filter((p) => p.startsWith('inst:'))) {
    const d = instanceDef(id);
    for (const p of d?.pieces ?? []) (p.id.startsWith('landmark:') ? places : objects).add(p.id);
    // everything generated inside (codex finds, chests, the cave's cache and find, exits)
    if (d) {
      const g = spaceRuntime(id).gen;
      for (let cy = 0; cy < Math.ceil(g.heightTiles / CHUNK_TILES); cy++) for (let cx = 0; cx < Math.ceil(g.widthTiles / CHUNK_TILES); cx++) {
        for (const o of g.objects(cx, cy)) (o.id.startsWith('landmark:') ? places : objects).add(o.id);
      }
    }
  }
  return { places, objects };
}
