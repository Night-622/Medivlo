// QA regression (Claude 7): Esc in a conversation must not lose what the conversation does.
// Esc on a line without choices calls dialogue.close(). It used to jump straight to the end, skipping the effects
// of every later line (quest flags, items given/taken, trust), so a player who skips text with Esc could leave
// a quest unadvanced or an item ungiven. For every dialogue, from every line where Esc works, this compares the
// game state after Esc with the state after pressing Space through to the next choice (or the end): they must match.
// Node only (bundles the Phaser-free narrative engine with tools/narrative/build.mjs); no browser, no server.
//   node tools/e2e/qa-dialogue-esc.mjs [--only dialogue:id,...] [--verbose]
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const dir = mkdtempSync(join(tmpdir(), 'qa-dlg-esc-'));
const entry = join(dir, 'entry.ts');
writeFileSync(entry, String.raw`
import { Game, Registry, bus, createNewGameState } from '@/core';
import type { DialogueDef } from '@/core';
import { installNarrativeAuthority, dialogue } from '@/narrative/engine';
import { newCharacter } from '@/systems/rules/character';
installNarrativeAuthority();
const ONLY = (process.env.QA_ONLY ?? '').split(',').filter(Boolean);
const VERBOSE = process.env.QA_VERBOSE === '1';
const fresh = () => {
  const s = createNewGameState();
  s.player.hero = { classId: 'warden', look: { skin: 0, hair: 0, hc: 0, eyes: 0, brows: 0, ec: 0, mouth: 0, mark: 0, body: 0 }, outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } } as never;
  s.character = newCharacter('warden');
  return s;
};
Game.set(fresh());
bus.emit('game:new', {} as never);
const base = JSON.stringify(Game.state);
type Runner = { def: DialogueDef | null; nodeId: string | null; sessionId: string; initiator: string; audience: unknown; visible: unknown[]; queue: unknown[]; goto(n: string | null): void };
const R = dialogue as unknown as Runner;
const reset = () => { R.queue.length = 0; R.def = null; R.nodeId = null; R.visible = []; Game.set(JSON.parse(base)); };
// park the runner on a line without re-applying anything (state = what it was on arrival at that line)
const park = (d: DialogueDef, node: string) => { R.def = d; R.nodeId = node; R.visible = []; R.sessionId = 'qa'; R.initiator = 'local'; R.audience = 'all'; };
const snap = () => { const s = JSON.parse(JSON.stringify(Game.state)); delete s.meta; return JSON.stringify({ s, at: R.def ? R.def.id + '@' + R.nodeId : null }); };
// the leaf paths that differ (what Esc lost), e.g. flags.arcanist.chart_copied
const diff = (a: string, b: string) => {
  const out: string[] = [];
  const walk = (x: unknown, y: unknown, p: string) => {
    if (out.length > 4 || JSON.stringify(x) === JSON.stringify(y)) return;
    if (x && y && typeof x === 'object' && typeof y === 'object') { for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) walk((x as never)[k], (y as never)[k], p ? p + '.' + k : k); return; }
    out.push(p + '=' + JSON.stringify(x));
  };
  try { walk(JSON.parse(a), JSON.parse(b), ''); } catch { out.push(b.slice(0, 120)); }
  return out.join(', ');
};
let pass = 0, fail = 0;
for (const d of (Registry.all('dialogue') as DialogueDef[])) {
  if (d.bark || (ONLY.length && !ONLY.includes(d.id))) continue;
  for (const [id, node] of Object.entries(d.nodes)) {
    if (node.choices?.length || !node.next) continue;     // Esc only works on lines without choices; last lines skip nothing
    // does anything after this line (up to the next choice) change state? if not, there is nothing to lose
    let n: string | null | undefined = node.next; const seen = new Set<string>(); let effects = 0;
    while (n && d.nodes[n] && !seen.has(n)) { seen.add(n); effects += d.nodes[n].effects?.length ?? 0; if (d.nodes[n].choices?.length) break; n = d.nodes[n].next; }
    if (!effects) continue;
    let viaSpace = '', viaEsc = '';
    try {
      reset(); park(d, id);
      for (let i = 0; i < 60 && R.def === d && !R.visible.length; i++) dialogue.advance();
      viaSpace = snap();
      reset(); park(d, id);
      dialogue.close();
      viaEsc = snap();
    } catch (e) { viaEsc = 'threw ' + String(e); }
    if (viaSpace === viaEsc) { pass++; if (VERBOSE) console.log('PASS ' + d.id + ' @' + id); }
    else { fail++; console.log('FAIL Esc on ' + d.id + ' @' + id + ' loses what Space through ' + seen.size + ' line(s) would do :: ' + diff(viaSpace, viaEsc)); }
  }
}
reset();
console.log('RESULT ' + pass + ' ' + fail);
`);
const out = join(dir, 'entry.mjs');
let res = '';
try {
  execFileSync(process.execPath, ['tools/narrative/build.mjs', entry, 'full'], { env: { ...process.env, OUT: out }, stdio: ['ignore', 'ignore', 'inherit'] });
  res = execFileSync(process.execPath, [out], {
    env: { ...process.env, QA_ONLY: arg('only', ''), QA_VERBOSE: process.argv.includes('--verbose') ? '1' : '0' },
    encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'pipe'],
  });
} catch (e) { res = `${e.stdout ?? ''}\nFAIL harness :: ${String(e.message).split('\n')[0]}`; }
const lines = res.split('\n').filter((l) => /^(PASS|FAIL) /.test(l));
for (const l of lines) console.log(l);
const m = res.match(/RESULT (\d+) (\d+)/);
const passed = m ? Number(m[1]) : 0, total = m ? passed + Number(m[2]) : lines.length || 1;
console.log(`\n${passed}/${total} passed`);
process.exit(m && Number(m[2]) === 0 ? 0 : 1);
