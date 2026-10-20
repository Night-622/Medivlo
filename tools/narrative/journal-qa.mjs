// Journal QA (Claude 4): the quest detail shows the current stage's journal paragraph and the diary of past stages, at
// Large text, with campaign tokens resolved; the detail column scrolls. A Warden on the Stone Court's 'sibling' stage
// (journal: "the {sibling} who carries…" → "the Rimecaller who carries…"), two stages of diary behind it.
// Needs the no-HMR test server; takes the chrome-lock via cdp.mjs.
//   node tools/narrative/journal-qa.mjs [--base http://localhost:5199] [--out tools/e2e/out/qa]
import { mkdirSync } from 'node:fs';
import { launch, sleep } from '../e2e/cdp.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('base', 'http://localhost:5199');
const OUT = arg('out', 'tools/e2e/out/qa');
mkdirSync(OUT, { recursive: true });

const page = await launch({ port: 9500 + Math.floor(Math.random() * 300) });
const errors = [];
page.on((m) => {
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails?.exception?.description?.split('\n').slice(0, 6).join(' | ') ?? 'exception');
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200));
});
const waitFor = async (expr, ms = 90000) => { const t = Date.now(); while (Date.now() - t < ms) { if (await page.eval(expr)) return true; await sleep(400); } return false; };
let bad = 0;
const ok = (c, m) => { console.log(`${c ? 'ok  ' : 'FAIL'} ${m}`); if (!c) bad++; };
// every Text in the journal scene, recursively (visible ones only)
const texts = () => page.eval(`(() => {
  const out = [], walk = (o) => { if (!o || o.visible === false) return; if (o.type === 'Text') out.push(o.text); (o.list ?? []).forEach(walk); };
  window.__game.scene.getScene('NarrativeUi').children.list.forEach(walk);
  return JSON.stringify(out);
})()`).then((s) => JSON.parse(s));

try {
  await page.goto(`${BASE}/`);
  await waitFor(`!!window.__game?.scene.isActive('MainMenu')`);
  await page.eval(`(async () => {
    const core = await import('/src/core/index.ts');
    const { defaultLook } = await import('/src/data/classes/hc/index.ts');
    core.Settings.set('textSize', 'large');
    const st = core.createNewGameState(0);
    st.player.name = 'Ana';
    st.player.hero = { classId: 'warden', look: defaultLook('warden', 0), outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } };
    st.world.location.space = 'concordia';
    st.flags['story.act'] = 2;
    st.narrative.quests['quest:cc-stone-court'] = { stage: 'sibling', objectives: {} };
    st.narrative.ext.questStages = { 'quest:cc-stone-court': ['court', 'charter', 'sibling'] };
    st.narrative.trackedQuest = 'quest:cc-stone-court';
    core.Game.set(st);
    window.__game.scene.getScene('MainMenu').scene.start('WorldV2');
  })()`);
  await waitFor(`!!window.__game.scene.isActive('HudV2')`);
  await sleep(4000);
  // close whatever opened on arrival, then the Journal on the Story tab with the Stone Court selected
  for (let i = 0; i < 20; i++) { const a = await page.eval(`(async () => (await import('/src/narrative/client/dialogueClient.ts')).dialogueClient.active)()`); if (!a) break; await page.press('Escape', 60); await sleep(300); }
  await page.press('KeyJ', 60); await sleep(1500);
  await page.screenshot(`${OUT}/journal-detail.png`);
  const t1 = await texts();
  ok(t1.some((s) => s.includes('the Rimecaller who carries')), 'the current stage’s journal paragraph is shown, with {sibling} resolved');
  ok(!t1.some((s) => /\{(class|sibling|siblingbearer|school|realm|start|mentor|nemesis|halfstone)\}/.test(s)), 'no raw campaign token anywhere on screen');
  ok(t1.includes('So far'), 'the diary of past stages is shown');
  ok(t1.some((s) => s.includes('Tracked: its next step')), 'the note on a tracked quest says it is tracked');
  // scroll the detail column
  await page.eval(`(() => { const s = window.__game.scene.getScene('NarrativeUi'); s.input.emit('wheel', { x: 600, y: 420 }, [], 0, 400, 0); })()`);
  await sleep(600);
  await page.screenshot(`${OUT}/journal-detail-scrolled.png`);
} catch (e) { console.log('ERROR', String(e)); bad++; }
ok(!errors.length, errors.length ? `page errors:\n  ${errors.slice(0, 6).join('\n  ')}` : 'no page errors');
console.log(bad ? `${bad} FAILED` : 'ALL PASS');
await page.close();
process.exit(bad ? 1 : 0);
