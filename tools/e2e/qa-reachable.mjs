// QA (Claude 7): can a new player walk to every Act I objective? For each class, flood-fill the walkable tiles of its
// school realm from its start waystone (4-way, the world's own isWalkable), then check every Act I objective's place
// as the quest marks resolve it (objectivePlaces / fallbackPlace → questPlace from the overworld):
//   landmark / area / zone → some tile inside it is reachable (that is what fires 'reach');
//   object / door / NPC home → a reachable tile within interact range (FocusPrompt 1.9 tiles).
// An unreachable objective is a soft-lock risk (or needs a route the player can't find). Places in another space
// (Concordia, an instance) are skipped here. Node only.
//   node tools/e2e/qa-reachable.mjs [--class a,b] [--verbose]
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const dir = mkdtempSync(join(tmpdir(), 'qa-reachable-'));
const entry = join(dir, 'entry.ts');
writeFileSync(entry, String.raw`
import { Game, Registry, createNewGameState } from '@/core';
import type { QuestDef, NpcDef } from '@/core';
import { CAMPAIGNS } from '@/narrative/engine/classes';
import { spaceRuntime } from '@/world/hc/spaces';
import { SpaceQuery } from '@/world/hc/runtime';
import { markerAt, warmMarkers } from '@/world/hc/spawns';
import { questPlace } from '@/world/hc/questPlaces';
import { landmarksAt } from '@/world/hc/interact';
import { startAreaOf } from '@/world/hc/worldService';
import { objectivePlaces, fallbackPlace } from '@/narrative/client/markers';
while (warmMarkers());
const ONLY = (process.env.QA_CLASS ?? '').split(',').filter(Boolean);
const VERBOSE = process.env.QA_VERBOSE === '1';
const quests = Registry.all('quest') as QuestDef[];
const setHero = (cls: string) => { const s = createNewGameState(); s.player.hero = { classId: cls, look: { skin: 0, hair: 0, hc: 0, eyes: 0, brows: 0, ec: 0, mouth: 0, mark: 0, body: 0 }, outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } } as never; Game.set(s); };
const AREA = /^(landmark|area|zone|region):/;
const fills = new Map<string, Uint8Array>();
for (const c of CAMPAIGNS) {
  if (ONLY.length && !ONLY.includes(c.id)) continue;
  setHero(c.id);
  const start = startAreaOf(c.id), rt = spaceRuntime(start.space), q = new SpaceQuery(rt, () => ({ hour: 12, phase: 'day' as never }));
  const W = rt.gen.widthTiles, H = rt.gen.heightTiles;
  // flood fill from a walkable tile beside the start waystone (one per waystone, shared by both classes of a side)
  let seen = fills.get(start.waystone);
  if (!seen) {
    seen = new Uint8Array(W * H);
    const ws = markerAt(start.waystone)!; let s0: number | null = null;
    for (let r = 0; r < 6 && s0 === null; r++) for (let dy = -r; dy <= r && s0 === null; dy++) for (let dx = -r; dx <= r && s0 === null; dx++) if (q.isWalkable(ws.at[0] + dx, ws.at[1] + dy)) s0 = ws.at[0] + dx + (ws.at[1] + dy) * W;
    const stack = [s0!]; seen[s0!] = 1;
    while (stack.length) { const i = stack.pop()!; const x = i % W, y = (i / W) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const j = nx + ny * W; if (seen[j] || !q.isWalkable(nx, ny)) continue; seen[j] = 1; stack.push(j); } }
    fills.set(start.waystone, seen);
  }
  const ok = (tx: number, ty: number) => tx >= 0 && ty >= 0 && tx < W && ty < H && seen![tx + ty * W] === 1;
  const reachable = (place: string): boolean | null => {
    const id = place.startsWith('npc:') ? (Registry.tryGet('npc', place) as NpcDef | undefined)?.home : place;
    const at = id ? questPlace(id) : null;
    if (!at || at.space !== start.space) return null; // another space: not this check's business
    const [gx, gy] = at.at;
    // a piece inside an instance resolves to that instance's door out here: the door must be reachable, like an object
    const viaDoor = !!id && markerAt(id)?.space !== start.space;
    if (id && !viaDoor && id.startsWith('landmark:')) {
      for (let y = gy - 14; y <= gy + 14; y++) for (let x = gx - 14; x <= gx + 14; x++) if (ok(x, y) && landmarksAt(start.space, x * 32 + 16, y * 32 + 16).includes(id)) return true;
      return false;
    }
    const r = id && AREA.test(id) && !viaDoor ? 6 : 2; // areas/zones: their centre region; objects, doors, NPCs: interact range
    for (let y = gy - r; y <= gy + r; y++) for (let x = gx - r; x <= gx + r; x++) if (ok(x, y) && Math.hypot(x - gx, y - gy) <= r) return true;
    return false;
  };
  let n = 0; const bad: string[] = [];
  for (const def of quests.filter((d) => d.id.startsWith('quest:' + c.id + '-') && d.act === 'act1')) for (const st of def.stages) for (const o of st.objectives) {
    if (o.hidden) continue;
    const own = objectivePlaces(o, c.id); const places = own.length ? own : [fallbackPlace(def, st.id)].filter((p): p is string => !!p);
    for (const p of places) { const r = reachable(p); if (r === null) continue; n++; if (!r) bad.push(def.id + '/' + st.id + ' "' + o.text + '" → ' + p); }
  }
  console.log((bad.length ? 'FAIL ' : 'PASS ') + c.id + ': ' + (n - bad.length) + '/' + n + ' Act I places in ' + start.space + ' reachable on foot from ' + start.waystone + (bad.length && !VERBOSE ? ' :: ' + bad[0] : ''));
  if (VERBOSE) for (const b of bad) console.log('    ' + b);
  console.log('ROW ' + (bad.length ? 0 : 1));
}
`);
const out = join(dir, 'entry.mjs');
let res = '';
try {
  execFileSync(process.execPath, ['tools/narrative/build.mjs', entry, 'full'], { env: { ...process.env, OUT: out }, stdio: ['ignore', 'ignore', 'inherit'] });
  res = execFileSync(process.execPath, [out], { env: { ...process.env, QA_CLASS: arg('class', ''), QA_VERBOSE: process.argv.includes('--verbose') ? '1' : '0' }, encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'pipe'] });
} catch (e) { res = `${e.stdout ?? ''}\nFAIL harness :: ${String(e.message).split('\n')[0]}`; }
for (const l of res.split('\n')) if (/^(PASS|FAIL|    )/.test(l)) console.log(l);
const rows = [...res.matchAll(/^ROW (\d)/gm)].map((m) => Number(m[1]));
const passed = rows.filter(Boolean).length;
console.log(`\n${passed}/${rows.length || 1} passed`);
process.exit(rows.length && passed === rows.length ? 0 : 1);
