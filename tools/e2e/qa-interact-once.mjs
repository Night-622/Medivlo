// QA (Claude 7): each object counts once. "Read the five hold-gauges" (interact: 'obj:hold-gauge-*', count: 5) went
// to 2/5 by pressing F twice on the same gauge, so a search could be finished without finding everything. For every
// counted interact objective in the data, using the same object twice must count 1, and two different objects 2.
// Node only (the Phaser-free narrative engine).
//   node tools/e2e/qa-interact-once.mjs [--verbose]
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'qa-interact-once-'));
const entry = join(dir, 'entry.ts');
writeFileSync(entry, String.raw`
import { Game, Registry, bus, createNewGameState } from '@/core';
import { CAMPAIGNS } from '@/narrative/engine/classes';
import type { QuestDef } from '@/core';
import { installNarrativeAuthority } from '@/narrative/engine';
import { startQuest, setStage, questDef, currentStage, objectiveCount } from '@/narrative/engine/quests';
import { newCharacter } from '@/systems/rules/character';
installNarrativeAuthority();
const VERBOSE = process.env.QA_VERBOSE === '1';
const fresh = (cls: string) => {
  const s = createNewGameState();
  s.player.hero = { classId: cls, look: { skin: 0, hair: 0, hc: 0, eyes: 0, brows: 0, ec: 0, mouth: 0, mark: 0, body: 0 }, outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } } as never;
  s.character = newCharacter(cls);
  Game.set(s);
};
let pass = 0, fail = 0;
for (const def of Registry.all('quest') as QuestDef[]) for (const st of def.stages) for (const o of st.objectives) {
  if (!('interact' in o) || !o.interact.endsWith('*') || (o.count ?? 1) < 2) continue;
  const cls = (def.id.match(/^quest:([a-z]+)-/)?.[1]) ?? 'warden';
  fresh(CAMPAIGNS.some((c) => c.id === cls) ? cls : 'warden');
  bus.emit('game:new', {} as never);
  try {
    startQuest(def.id); setStage(def.id, st.id);
    const d = questDef(def.id)!;
    if (currentStage(d)?.id !== st.id) { if (VERBOSE) console.log('skip ' + def.id + '/' + st.id + ' (stage did not open)'); continue; }
    const base = o.interact.slice(0, -1);
    bus.emit('interact' as never, { objectId: base + '1', playerId: 'local' } as never);
    bus.emit('interact' as never, { objectId: base + '1', playerId: 'local' } as never);
    const same = objectiveCount(d, o);
    bus.emit('interact' as never, { objectId: base + '2', playerId: 'local' } as never);
    const two = objectiveCount(d, o);
    if (same === 1 && two === 2) { pass++; if (VERBOSE) console.log('PASS ' + def.id + '/' + st.id + '/' + o.id); }
    else { fail++; console.log('FAIL ' + def.id + '/' + st.id + '/' + o.id + ' "' + o.text + '": the same object twice counts ' + same + ', then a second object ' + two + ' (want 1, then 2)'); }
  } catch (e) { fail++; console.log('FAIL ' + def.id + '/' + st.id + ' threw ' + String(e).slice(0, 120)); }
}
console.log('RESULT ' + pass + ' ' + fail);
`);
const out = join(dir, 'entry.mjs');
let res = '';
try {
  execFileSync(process.execPath, ['tools/narrative/build.mjs', entry, 'full'], { env: { ...process.env, OUT: out }, stdio: ['ignore', 'ignore', 'inherit'] });
  res = execFileSync(process.execPath, [out], { env: { ...process.env, QA_VERBOSE: process.argv.includes('--verbose') ? '1' : '0' }, encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'pipe'] });
} catch (e) { res = `${e.stdout ?? ''}\nFAIL harness :: ${String(e.message).split('\n')[0]}`; }
const lines = res.split('\n').filter((l) => /^(PASS|FAIL|skip) /.test(l));
for (const l of lines.slice(0, 40)) console.log(l);
if (lines.length > 40) console.log(`… ${lines.length - 40} more`);
const m = res.match(/RESULT (\d+) (\d+)/);
const passed = m ? Number(m[1]) : 0, total = m ? passed + Number(m[2]) : 1;
console.log(`\n${passed}/${total} passed`);
process.exit(m && Number(m[2]) === 0 ? 0 : 1);
