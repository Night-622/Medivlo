// Narrative UI QA (Claude 4): the restyled dialogue box, journal, tracker and codex driven with the WORST real data
// (tools/narrative/ui-worst.ts): longest quest names, a 4-player party vote with 7 choices, deep trust, long lines.
// Needs the no-HMR test server; takes the chrome-lock via cdp.mjs.
//   node tools/narrative/ui-qa.mjs [--base http://localhost:5199] [--out tools/e2e/out/qa]
import { mkdirSync } from 'node:fs';
import { launch, sleep } from '../e2e/cdp.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('base', 'http://localhost:5199');
const OUT = arg('out', 'tools/e2e/out/qa');
mkdirSync(OUT, { recursive: true });

// worst cases found by ui-worst.ts (real ids)
const LONG_QUESTS = ['quest:hunt-bounty-arrow-thief-briarlings', 'quest:guile-bounty-parliament-of-pockets', 'quest:huntsman-bounty-old-snares-tick-swarm', 'quest:juggernaut-bounty-rusted-drill-sergeant', 'quest:cantor-bounty-overzealous-acolytes'];

const page = await launch({ port: 9500 + Math.floor(Math.random() * 300) });
const errors = [];
page.on((m) => {
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails?.exception?.description?.split('\n').slice(0, 6).join(' | ') ?? 'exception');
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200));
});
const waitFor = async (expr, ms = 90000) => { const t = Date.now(); while (Date.now() - t < ms) { if (await page.eval(expr)) return true; await sleep(400); } return false; };
const endDialogue = async () => {
  for (let i = 0; i < 30; i++) {
    const n = await page.eval(`(async () => { const d = (await import('/src/narrative/client/dialogueClient.ts')).dialogueClient; return d.active ? d.view.choices.length : -1; })()`);
    if (n < 0) return;
    await page.press(n > 0 ? `Digit${Math.min(9, n)}` : 'Space', 60);
    await sleep(400);
  }
};
const shot = async (name) => { await sleep(900); await page.screenshot(`${OUT}/${name}.png`); console.log('shot', name); };

try {
  await page.goto(`${BASE}/`);
  await waitFor(`!!window.__game?.scene.isActive('MainMenu')`);
  const found = await page.eval(`(async () => {
    const core = await import('/src/core/index.ts');
    const { defaultLook } = await import('/src/data/classes/hc/index.ts');
    const st = core.createNewGameState(0);
    st.player.name = 'Bartholomew-Augustin';
    st.player.hero = { classId: 'warden', look: defaultLook('warden', 0), outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } };
    st.world.location.space = 'concordia';
    core.Game.set(st);
    core.Registry.load();
    // every quest name the journal may have to fit: the longest ones live, plus a page of real ones done
    const all = core.Registry.all('quest');
    const pick = (ids) => ids.map((id) => all.find((q) => q.id === id) || all.find((q) => q.name.length >= 30)).filter(Boolean);
    const longest = [...all].sort((a, b) => b.name.length - a.name.length).slice(0, 12);
    for (const q of [...pick(${JSON.stringify(LONG_QUESTS)}), ...longest]) st.narrative.quests[q.id] = { stage: q.firstStage, objectives: {} };
    for (const q of all.filter((q) => q.campaign === 'warden').slice(0, 14)) st.narrative.quests[q.id] = { stage: q.stages.at(-1).id, objectives: {}, completed: true };
    st.narrative.trackedQuest = longest[0].id;
    st.narrative.codexUnlocked = core.Registry.all('lore').map((l) => l.id);
    st.flags['trust.maren'] = 5; st.flags['trust.hobb'] = 3; st.flags['story.act'] = 2;
    st.flags['tut.on'] = true; st.flags['tut.move'] = true;
    st.narrative.quests['quest:warden-first-steps'] = { stage: 'steps', objectives: {} };
    st.flags['story.gate_open'] = undefined;
    window.__game.scene.getScene('MainMenu').scene.start('WorldV2');
    return { tracked: longest[0].name, live: Object.keys(st.narrative.quests).length };
  })()`);
  console.log('state', JSON.stringify(found));
  await waitFor(`!!window.__game.scene.isActive('HudV2')`);
  await sleep(5000);
  await endDialogue();
  await shot('qa-hud-tracker');

  // deep trust: Maren at Devoted
  await page.eval(`window.narrative?.talk('npc:maren')`);
  await shot('qa-dialogue-devoted');
  await endDialogue();

  // a 4-player party vote with every chip, a long choice, a lockedLabel and other schools' options, 45 s left
  await page.eval(`(() => {
    const ui = window.__game.scene.getScene('NarrativeUi');
    ui.box.show({
      sessionId: 'qa', dialogueId: 'dialogue:cc-nan-tear', npcId: 'npc:maren', speakerId: 'npc:maren', speakerName: 'Maren Hollis', mood: 'neutral',
      text: 'The tear is still warm. Nan Tilly holds it up to the lamp, and for a moment the whole kitchen goes quiet, the way a room does when somebody has said a true thing.',
      audience: 'all', initiator: 'local', trust: 5,
      choices: [
        { index: 0, text: 'Ask her where she found it.', enabled: true, quest: true },
        { index: 1, text: '(Take her hand.) It’s all right. Whatever it is, you don’t have to carry it on your own any more.', enabled: true, trust: 1 },
        { index: 2, text: 'It hums at the same pitch as the Bell. The thirteenth pitch, the one nobody tuned.', enabled: true, insight: true },
        { index: 3, text: 'Read the frost on it, the way the Archive taught you.', enabled: true, school: 'rime' },
        { index: 4, text: 'Hold it to the light and see what shadow it throws.', enabled: false, school: 'umbral' },
        { index: 5, text: 'Swear on your oath that you’ll bring it back.', enabled: false, chip: 'Needs Trusted' },
        { index: 6, text: 'Tell her it’s nothing. Tell her to put it in the drawer and forget it.', enabled: true, trust: -1 },
      ],
      votes: { 0: ['a', 'b'], 1: ['c'], 3: ['local'] }, deadline: Date.now() + 45000, canPick: true,
    });
  })()`);
  await shot('qa-vote-7');
  // the longest line in the game, no choices
  await page.eval(`(async () => {
    const core = await import('/src/core/index.ts');
    const d = core.Registry.get('dialogue', 'dialogue:obj-duskblade-stall');
    window.__game.scene.getScene('NarrativeUi').box.show({ sessionId: 'qa2', dialogueId: d.id, speakerId: 'narrator', speakerName: '', mood: 'neutral', text: d.nodes.home.text, audience: 'all', initiator: 'local', choices: [] });
  })()`);
  await shot('qa-longest-line');
  await page.eval(`window.__game.scene.getScene('NarrativeUi').box.show(null)`);

  await page.press('KeyJ', 60);
  await shot('qa-journal');
  for (let i = 0; i < 5; i++) { await page.press('ArrowDown', 60); await sleep(150); }
  await shot('qa-journal-row5');
  await page.press('Escape', 60); await sleep(500);
  await page.press('KeyL', 60);
  await shot('qa-codex');
  await page.press('Escape', 60);
} catch (e) { console.log('ERROR', String(e)); }
console.log(errors.length ? `page errors:\n  ${errors.slice(0, 8).join('\n  ')}` : 'no page errors');
await page.close();
process.exit(0);
