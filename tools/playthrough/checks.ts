/**
 * World checks (Claude 2): fast Node validators for placement and generation. No browser, no campaign runs.
 *   ENTRY=tools/playthrough/checks.ts OUT=<file> node tools/playthrough/build.mjs && node <file> <check> [arg]
 *   (build.mjs expands the content Registry's import.meta.glob, which `bands` needs)
 * Checks:
 *   unplaced            every obj:/landmark:/area:/zone: id in the hc quest and dialogue files that the world lacks
 *   pieces              set pieces (outline + campaign extras + instance extras) all placed; retired ids absent
 *   instances           every instance builds; side rooms and usable objects reachable from the entrance
 *   triggers <realm>    story trigger zones of a realm (or concordia) and whether each resolves as its own region
 *   markers <inst>      the instance map markers of one instance
 *   exists <ids,…>      which of these world ids are missing (anchors for a placement list)
 *   escort <a> <b>      an escort leg: both ends resolve (placePos) and the walk between them (path steps)
 *   bands [classes]     realm spawn bands vs each class's Act I quest walks: every band a walk passes ≤ expected
 *                       level + 2 (tools/playthrough/bands.ts; regenerate the table with `bands.ts gen`)
 *   bands-concordia     the same for Concordia vs Acts II/III, plus main quests ≥ expected − 4 (concordiaBands.ts)
 *   class-objects       class story objects: usable only in their own classes' campaigns (classObjects.ts)
 *   clearance           bodies fit their arenas, lair corridors and story markers (clearance.ts)
 * Each check exits non-zero on failure; tools/playthrough/suite.mjs runs the fast set (pre-deploy).
 */
import { readFileSync, readdirSync } from 'node:fs';
import { CHUNK_TILES } from '@/core';
import { worldIds } from '@/world/hc/ids';
import { AREAS, instanceDef, spaceRuntime } from '@/world/hc/spaces';
import { SpaceQuery } from '@/world/hc/runtime';
import { mapMarkers } from '@/world/hc/overview';
import { HcWorldService } from '@/world/hc/worldService';
import type { InstanceGen } from '@/world/hc/instanceGen';
import type { RealmGen } from '@/world/hc/realmGen';
import { CONCORDIA_EXTRA, INSTANCE_EXTRA, RETIRED, SET_PIECES_EXTRA } from '@/data/regions/hc/setPiecesExtra';
import { SET_PIECES } from '@/data/regions/hc/landmarks';
import { SENTINELS } from '@/data/regions/hc/sentinels';

const [check, arg] = process.argv.slice(2);
const quiet = () => { const w = console.warn; const out: string[] = []; console.warn = (...a: unknown[]) => { out.push(a.join(' ')); }; return () => { console.warn = w; return out; }; };
const query = (space: string) => new SpaceQuery(spaceRuntime(space), () => ({ hour: 12, phase: 'day' }));

if (check === 'unplaced') {
  const { places, objects } = worldIds();
  const all = [...places, ...objects];
  const files = [...readdirSync('src/data/quests').filter((f) => f.startsWith('hc-')).map((f) => `src/data/quests/${f}`),
    ...readdirSync('src/data/dialogue').filter((f) => f.startsWith('hc-')).map((f) => `src/data/dialogue/${f}`)];
  let n = 0;
  for (const f of files) {
    const miss = new Set<string>();
    for (const m of readFileSync(f, 'utf8').matchAll(/['"`]((?:obj|landmark|area|zone):[a-z0-9-]+\*?)['"`]/g)) {
      const id = m[1];
      if (/-\$\{|heart$/.test(id)) continue;
      if (id.endsWith('*') ? all.some((x) => x.startsWith(id.slice(0, -1))) : places.has(id) || objects.has(id)) continue;
      miss.add(id);
    }
    if (miss.size) { n += miss.size; console.log(f, miss.size, [...miss].slice(0, 30).join(' ')); }
  }
  console.log(n ? `${n} unplaced` : 'unplaced: none');
  if (n) process.exitCode = 1;
} else if (check === 'pieces') {
  const done = quiet();
  const { places, objects } = worldIds();
  const warn = done();
  const want = [...SET_PIECES.map((p) => p.id).filter((id) => !RETIRED.has(id)), ...SET_PIECES_EXTRA.map((p) => p.id), ...CONCORDIA_EXTRA.map((x) => x.id), ...Object.values(INSTANCE_EXTRA).flat()];
  const miss = want.filter((w) => !places.has(w) && !objects.has(w));
  console.log(`${want.length} set pieces; missing ${miss.length} ${miss.slice(0, 20).join(', ')}`);
  console.log('retired present:', [...RETIRED].filter((r) => places.has(r) || objects.has(r)).join(', ') || 'none');
  console.log(`placement warnings ${warn.length}`, warn.slice(0, 10).join(' | '));
  if (miss.length || warn.length || [...RETIRED].some((r) => places.has(r) || objects.has(r))) process.exitCode = 1;
} else if (check === 'instances') {
  const ids = AREAS.flatMap((a) => [...[1, 2, 3].map((n) => `inst:${a.school}-${a.side}-lair-${n}`), `inst:${a.school}-${a.side}-cave`])
    .concat(['frost', 'gilded', 'storm', 'abbey', 'gloam', 'briar', 'ash', 'alder', 'road', 'marsh'].map((r) => `inst:${r}-cave`), ['inst:varric-barrow', 'inst:drowned-abbey', 'inst:concord-citadel'], SENTINELS.map((s) => s.inst));
  let bad = 0, sides = 0, objs = 0;
  for (const id of ids) {
    if (!instanceDef(id)) { console.log('NO DEF', id); bad++; continue; }
    const g = spaceRuntime(id).gen as InstanceGen, q = query(id), [ex, ey] = g.entrance;
    for (const r of g.branches) {
      sides++;
      if (!q.findPath([ex, ey], [r.x + (r.w >> 1), r.y + (r.h >> 1)], 400000)) { bad++; console.log(id, 'side room unreachable', r); }
    }
    for (let cy = 0; cy < Math.ceil(g.heightTiles / CHUNK_TILES); cy++) for (let cx = 0; cx < Math.ceil(g.widthTiles / CHUNK_TILES); cx++) {
      for (const o of g.objects(cx, cy)) {
        if (o.kind === 'trigger') continue;
        objs++;
        const near = [[0, 0], [0, 1], [1, 0], [-1, 0], [0, -1]].map(([dx, dy]) => [o.at[0] + dx, o.at[1] + dy] as [number, number]).find((t) => q.isWalkable(t[0], t[1]));
        if (!near || !q.findPath([ex, ey], near, 400000)) { bad++; console.log(id, 'object unreachable', o.id, o.at); }
      }
    }
  }
  console.log(`${ids.length} instances, ${sides} side rooms, ${objs} objects; problems ${bad}`);
  if (bad) process.exitCode = 1;
} else if (check === 'triggers') {
  const space = arg === 'concordia' ? 'concordia' : `realm:${arg ?? 'ash'}`;
  const g = spaceRuntime(space).gen as Partial<RealmGen> & RealmGen;
  for (const [id, t] of g.triggers ?? []) console.log(id, t.at, g.regionAt(t.at[0], t.at[1]) === id ? 'ok' : `SHADOWED by ${g.regionAt(t.at[0], t.at[1])}`);
} else if (check === 'markers') {
  const id = arg ?? 'inst:ash-capital-lair-2';
  const ms = mapMarkers(id);
  for (const k of ['exit', 'boss', 'chest', 'find']) console.log(k, ms.filter((m) => m.kind === k).map((m) => `${m.name || m.id}@${m.at}`).join(' | '));
} else if (check === 'escort') {
  const w = new HcWorldService(() => ({ hour: 12, phase: 'day' }) as never, () => 'concordia', () => null, () => []);
  const b = process.argv[4];
  const pa = w.placePos(arg ?? ''), pb = w.placePos(b ?? '');
  if (!pa || !pb) console.log('UNRESOLVED', arg, !!pa, b, !!pb);
  else {
    const t = (p: { x: number; y: number }): [number, number] => [Math.floor(p.x / 32), Math.floor(p.y / 32)];
    const path = pa.space === pb.space ? w.query(pa.space).findPath(t(pa), t(pb), 3_000_000) : null;
    console.log(`${arg} ${pa.space} ${t(pa)} → ${b} ${pb.space} ${t(pb)}: ${path ? `walkable, ${path.length} steps` : 'NO PATH'}`);
  }
} else if (check === 'exists') {
  const { places, objects } = worldIds();
  const miss = (arg ?? '').split(',').filter((x) => x && !places.has(x) && !objects.has(x));
  console.log(miss.length ? `missing: ${miss.join(' ')}` : 'all exist');
} else if (check === 'bands') {
  await import('./bands'); // reads argv itself: mode 'bands' = its check, arg = classes
} else if (check === 'bands-concordia') {
  await import('./concordiaBands'); // Concordia bands vs every class's Act II/III walks (~3 min)
} else if (check === 'class-objects') {
  await import('./classObjects'); // each class as host sees only its own story objects, and all of them
} else if (check === 'clearance') {
  await import('./clearance'); // bosses, minis and packs fit their arenas, corridors and markers
} else {
  console.log('checks: exists <ids> | unplaced | pieces | instances | triggers <realm|concordia> | markers <inst> | escort <a> <b> | bands [classes]');
}
