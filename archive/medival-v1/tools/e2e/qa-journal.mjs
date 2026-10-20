// QA (Claude 7): the Journal shows the story. Every quest stage carries journal prose (2,537 stages, ~51k words) that
// no screen displayed. For a tracked quest at its 2nd+ stage, J (real key) must show the current stage's journal
// text, and no raw placeholder ({sibling}, {key:…}, {mentor}…) may appear anywhere in the Journal.
//   node tools/e2e/qa-journal.mjs [--base http://localhost:5170] [--class rimecaller,samurai,falconer] [--out tools/e2e/out/qa]
import { mkdirSync } from 'node:fs';
import { launch, sleep } from './cdp.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('base', 'http://localhost:5170'), OUT = arg('out', 'tools/e2e/out/qa');
const CLASSES = arg('class', 'rimecaller,samurai,falconer').split(',');
mkdirSync(OUT, { recursive: true });
let fails = 0, total = 0;
const check = (what, ok, detail = '') => { total++; if (!ok) fails++; console.log(`${ok ? 'PASS' : 'FAIL'} ${what}${detail ? ` :: ${String(detail).slice(0, 260)}` : ''}`); };
const page = await launch({ port: 9250 + Math.floor(Math.random() * 50) });
const errors = [];
page.on((m) => {
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails?.exception?.description?.split('\n')[0] ?? 'exception');
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200));
});
const ev = (e) => page.eval(e);
const waitFor = async (expr, ms = 90000) => { const t = Date.now(); while (Date.now() - t < ms) { try { if (await ev(expr)) return true; } catch { /* loading */ } await sleep(300); } return false; };
const norm = (s) => s.replace(/\s+/g, ' ').trim();
// every visible Text in the narrative overlay (containers included), joined
const journalText = () => ev(`(() => { const out = []; const walk = (o) => { if (!o || o.visible === false) return; if (o.type === 'Text' && o.text) out.push(o.text); (o.list || []).forEach(walk); };
  window.__game.scene.getScene('NarrativeUi').children.list.forEach(walk); return out.join(' '); })()`);

try {
  for (const cls of CLASSES) {
    await page.goto(`${BASE}/`);
    if (!(await waitFor(`!!window.__game?.scene.isActive('MainMenu')`))) throw new Error('title never appeared');
    await ev(`(async () => { const core = await import('/src/core/index.ts'); const { defaultLook } = await import('/src/data/classes/hc/index.ts');
      const st = core.createNewGameState(0); st.player.name = 'Ione';
      st.player.hero = { classId: ${JSON.stringify(cls)}, look: defaultLook(${JSON.stringify(cls)}, 0), outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } };
      core.Game.set(st); window.__game.scene.getScene('MainMenu').scene.start('WorldV2'); return 1; })()`);
    await waitFor('!!(window.__hc && window.__hc.local() && window.__world)');
    await sleep(2500);
    for (let i = 0; i < 30; i++) { const a = await ev(`(async () => (await import('/src/narrative/client/dialogueClient.ts')).dialogueClient.active)()`); if (!a) break; await page.press('Space'); await sleep(300); }
    // the class's first main quest with 3+ stages, moved to its 2nd stage and tracked
    const q = await ev(`(async () => {
      const c = await import('/src/core/index.ts'); const qs = await import('/src/narrative/engine/quests.ts'); const { interpolate } = await import('/src/narrative/engine/dialogue.ts');
      const def = c.Registry.all('quest').find((d) => d.id.startsWith('quest:' + ${JSON.stringify(cls)} + '-') && d.act === 'act1' && d.type === 'main' && d.stages.length >= 3 && !d.id.endsWith('-first-steps'));
      if (!def) return null;
      if (!qs.isActive(def.id)) qs.startQuest(def.id);
      qs.setStage(def.id, def.stages[1].id);
      c.Game.state.narrative.trackedQuest = def.id; c.bus.emit('quest:advanced', { questId: def.id, stage: def.stages[1].id });
      return { id: def.id, name: def.name, stage: def.stages[1].id, journal: interpolate(c.formatKeys ? c.formatKeys(def.stages[1].journal) : def.stages[1].journal) };
    })()`);
    if (!q) { check(`${cls}: a main Act I quest with 3+ stages`, false); continue; }
    await sleep(800);
    await page.press('KeyJ'); await sleep(1500);
    const shown = norm(await journalText());
    const want = norm(q.journal).slice(0, 48);
    check(`${cls}: J shows the current stage's journal text (${q.name} › ${q.stage})`, shown.includes(want), `want "${want}…"; journal shows "${shown.slice(0, 160)}…"`);
    const raw = shown.match(/\{[a-zA-Z.]+(:[^}]*)?\}/g);
    check(`${cls}: no raw {placeholders} in the Journal`, !raw, raw?.join(' '));
    await page.screenshot(`${OUT}/journal-${cls}.png`);
    await page.press('Escape'); await sleep(600);
  }
} catch (e) { check('harness', false, String(e?.stack ?? e).split('\n').slice(0, 2).join(' < ')); }
const errs = errors.filter((e) => !/auth\/|firestore|Firebase/i.test(e));
check('no console errors', !errs.length, errs.slice(0, 4).join(' | '));
await page.close();
console.log(`\n${total - fails}/${total} passed`);
process.exit(fails ? 1 : 0);
