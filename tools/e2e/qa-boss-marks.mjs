// QA (Claude 7): a lair boss's quest mark points at its lair. For every class, each kill objective whose creature is
// one of the class's lair bosses (instanceGen.lairBoss, lairs 1–3) must put its mark (questMarkers' place: own
// places, else fallbackPlace) within 3 tiles of that lair's outside door. Before the fix, 65 of 72 pointed 34–175
// tiles away (e.g. rimecaller "Defeat the Glacier Blob" → a zone 119 tiles from lair 1). Node only.
//   node tools/e2e/qa-boss-marks.mjs [--class a,b] [--verbose]
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const dir = mkdtempSync(join(tmpdir(), 'qa-boss-marks-'));
const entry = join(dir, 'entry.ts');
writeFileSync(entry, String.raw`
import { Game, Registry, classSchool, createNewGameState } from '@/core';
import type { QuestDef } from '@/core';
import { CAMPAIGNS } from '@/narrative/engine/classes';
import { warmMarkers, markerAt } from '@/world/hc/spawns';
import { questPlace } from '@/world/hc/questPlaces';
import { lairBoss } from '@/world/hc/instanceGen';
import { objectivePlaces, fallbackPlace } from '@/narrative/client/markers';
while (warmMarkers());
const ONLY = (process.env.QA_CLASS ?? '').split(',').filter(Boolean);
const VERBOSE = process.env.QA_VERBOSE === '1';
const quests = Registry.all('quest') as QuestDef[];
// questMarkers() reads the campaign class from the game state, as in the game: one hero per row
const setHero = (cls: string) => { const s = createNewGameState(); s.player.hero = { classId: cls, look: { skin: 0, hair: 0, hc: 0, eyes: 0, brows: 0, ec: 0, mouth: 0, mark: 0, body: 0 }, outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } } as never; Game.set(s); };
for (const c of CAMPAIGNS) {
  if (ONLY.length && !ONLY.includes(c.id)) continue;
  setHero(c.id);
  const S = classSchool(c.id)!;
  const lairs = [1, 2, 3].map((i) => ({ i, creature: lairBoss(S, c.side, i, c.id).creature, door: markerAt('obj:' + S + '-' + c.side + '-lair-' + i + '-door') }));
  let n = 0; const far: string[] = [];
  for (const q of quests.filter((q) => q.id.startsWith('quest:' + c.id + '-'))) for (const s of q.stages) for (const o of s.objectives) {
    if (!('kill' in o)) continue;
    const lair = lairs.find((l) => l.creature === o.kill);
    if (!lair || !lair.door) continue;
    n++;
    const p = objectivePlaces(o)[0] ?? fallbackPlace(q, s.id); const at = p ? questPlace(p) : null;
    const d = at && at.space === lair.door.space ? Math.round(Math.hypot(at.at[0] - lair.door.at[0], at.at[1] - lair.door.at[1])) : null;
    if (d === null || d > 3) far.push('lair ' + lair.i + ' "' + o.text + '" (' + q.id + '/' + s.id + ') → ' + p + ', ' + (d === null ? 'other space/none' : d + ' tiles from the door'));
  }
  if (!n) continue;
  console.log((far.length ? 'FAIL ' : 'PASS ') + c.id + ': ' + (n - far.length) + '/' + n + ' lair-boss marks at their lair door' + (far.length && !VERBOSE ? ' :: ' + far[0] : ''));
  if (VERBOSE) for (const f of far) console.log('    ' + f);
  console.log('ROW ' + (far.length ? 0 : 1));
}
`);
const out = join(dir, 'entry.mjs');
let res = '';
try {
  execFileSync(process.execPath, ['tools/narrative/build.mjs', entry, 'full'], { env: { ...process.env, OUT: out }, stdio: ['ignore', 'ignore', 'inherit'] });
  res = execFileSync(process.execPath, [out], {
    env: { ...process.env, QA_CLASS: arg('class', ''), QA_VERBOSE: process.argv.includes('--verbose') ? '1' : '0' },
    encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'pipe'],
  });
} catch (e) { res = `${e.stdout ?? ''}\nFAIL harness :: ${String(e.message).split('\n')[0]}`; }
for (const l of res.split('\n')) if (/^(PASS|FAIL|    )/.test(l)) console.log(l);
const rows = [...res.matchAll(/^ROW (\d)/gm)].map((m) => Number(m[1]));
const passed = rows.filter(Boolean).length;
console.log(`\n${passed}/${rows.length || 1} passed`);
process.exit(rows.length && passed === rows.length ? 0 : 1);
