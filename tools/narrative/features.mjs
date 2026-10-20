// Narrative features test (Claude 5 for Claude 4): real keyboard and mouse in WorldV2, one PASS/FAIL line per check.
// DEV handles (window.narrative, __world, __hc, core imports) only SET UP state; every check is driven by real input.
// Part of the pre-deploy check. Checks: First Steps ticks from a real key; talking with the interact key opens a
// dialogue, a number key and a mouse click each advance it, Farewell closes it, the HUD fades and returns; a TRUST
// choice moves trust, the diamonds and a teal toast; a quest started in talk shows in the tracker and the Journal,
// a stage done by real input updates both, completion moves it to Done and pays XP; an object scene plays on [F]
// and its codex unlock toasts and shows in the Codex with its text; [School] and INSIGHT options show for the
// right party; a party vote in solo resolves at once; no console errors.
//   node tools/narrative/features.mjs [--base http://localhost:5196] [--out tools/e2e/out]
import { mkdirSync } from 'node:fs';
import { launch, sleep } from '../e2e/cdp.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('base', 'http://localhost:5196'), OUT = arg('out', 'tools/e2e/out');
mkdirSync(OUT, { recursive: true });
const T0 = Date.now();
let fails = 0, total = 0;
const check = (what, ok, detail = '') => { total++; if (!ok) fails++; console.log(`${ok ? 'PASS' : 'FAIL'} ${what}${detail ? ` :: ${detail}` : ''}`); };

const page = await launch({ port: 9200 + Math.floor(Math.random() * 300) });
const errors = [];
page.on((m) => {
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails?.exception?.description?.split('\n')[0] ?? 'exception');
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200));
});
const waitFor = async (fn, ms = 15000) => { const t = Date.now(); while (Date.now() - t < ms) { const v = await fn(); if (v) return v; await sleep(250); } return null; };
const core = (body) => page.eval(`(async () => { const c = await import('/src/core/index.ts'); ${body} })()`);
const N = (expr) => page.eval(`window.narrative.${expr}`);
const hud = () => page.eval('window.__hud ? window.__hud() : null');
const flag = (k) => core(`return c.getFlag(${JSON.stringify(k)});`);
const quest = (id) => core(`return c.Game.state.narrative.quests[${JSON.stringify(id)}] ?? null;`);
/** the client's dialogue view (what the box shows): id, node, text, choices [{index,text,enabled,school,insight}], trust */
const dlg = () => page.eval(`(async () => { const d = (await import('/src/narrative/client/dialogueClient.ts')).dialogueClient.view;
  return d && { id: d.dialogueId, node: d.nodeId, text: d.text, trust: d.trust, npc: d.npcId,
    choices: d.choices.map((c) => ({ index: c.index, text: c.text, enabled: c.enabled, school: c.school ?? null, insight: c.insight ?? null })) }; })()`);
/** visible texts of the narrative UI scene (dialogue box, Journal, Codex) with page coordinates */
const nui = () => page.eval(`(() => {
  const s = window.__game.scene.getScene('NarrativeUi'); if (!s || !s.sys.isActive()) return [];
  const c = s.game.canvas.getBoundingClientRect(), sx = c.width / s.scale.width, sy = c.height / s.scale.height, out = [];
  const walk = (list, a) => { for (const o of list) { if (o.visible === false) continue; const al = a * (o.alpha ?? 1);
    if (o.list) walk(o.list, al); else if (typeof o.text === 'string' && o.text && o.getBounds) { const b = o.getBounds();
      out.push({ text: o.text, alpha: al, x: Math.round(c.left + b.centerX * sx), y: Math.round(c.top + b.centerY * sy), bx: b.x, by: b.y }); } } };
  walk(s.children.list, s.cameras.main.alpha); return out; })()`);
/** the CDP key code for a game action, from the player's own bindings */
const keyOf = async (action) => {
  const k = await core(`return c.Settings.key(${JSON.stringify(action)});`);
  if (/^[A-Z]$/.test(k)) return `Key${k}`;
  if (/^\d$/.test(k)) return `Digit${k}`;
  return { SPACE: 'Space', ESC: 'Escape', ENTER: 'Enter', TAB: 'Tab' }[k] ?? k;
};
const pressAction = async (action) => page.press(await keyOf(action), 70);
/** press the number key for a choice (display order = view order) */
const pick = async (pred) => {
  const v = await dlg(); const i = v?.choices.findIndex(pred) ?? -1;
  if (i < 0) return false;
  await page.press(`Digit${i + 1}`, 60); await sleep(500); return true;
};
/** click a choice with the mouse, on its rendered text */
const clickChoice = async (text) => {
  const t = await waitFor(async () => (await nui()).find((o) => o.text.replace(/\s+/g, ' ') === text && o.alpha > 0.5), 3000);
  if (!t) return false;
  await page.click(t.x, t.y); await sleep(600); return true;
};
/** click a row/tab in the narrative UI by its text (exact, or a prefix) */
const clickText = async (pred) => {
  const t = await waitFor(async () => (await nui()).find((o) => o.alpha > 0.5 && pred(o.text)), 3000);
  if (!t) return false;
  await page.click(t.x, t.y); await sleep(600); return true;
};
/** finish whatever conversation is open: Farewell if offered (menus loop back to their start), else the last choice, or continue */
const endDialogue = async () => {
  for (let i = 0; i < 40; i++) {
    const v = await dlg(); if (!v) return;
    if (v.choices.length) {
      const bye = v.choices.findIndex((c) => c.enabled && /^(Farewell|Goodbye|Leave)/.test(c.text));
      const last = v.choices.map((c) => c.enabled).lastIndexOf(true);
      await page.press(`Digit${(bye >= 0 ? bye : Math.max(0, last)) + 1}`, 60);
    }
    else await page.press('Space', 60);
    await sleep(350);
  }
};
const continueUntil = async (pred, n = 12) => { for (let i = 0; i < n; i++) { const v = await dlg(); if (!v || pred(v)) return v; if (v.choices.length) return v; await page.press('Space', 60); await sleep(400); } return dlg(); };
/** stand beside a world NPC (snapshot entity) or a placed object, and wait until it is the [F] focus */
const npcPos = (id) => page.eval(`(window.__game.scene.getScene('WorldV2').npcs?.view.list() ?? []).find((n) => n.id === ${JSON.stringify(id)}) ?? null`);
const placeTile = (place) => page.eval(`(async () => { const m = (await import('/src/world/hc/spawns.ts')).markerAt(${JSON.stringify(place)}); return m ? m.at : null; })()`);
/** teleport beside the target, trying the tiles round it until it (not a neighbouring object) holds the [F] focus */
const walkTo = async (id, place) => {
  const t = place ? await waitFor(() => placeTile(place), 20000) : await waitFor(async () => { const n = await npcPos(id); return n && [Math.floor(n.x / 32), Math.floor(n.y / 32)]; }, 20000);
  if (!t) return false;
  const ring = [[0, 1], [0, 0], [-1, 0], [1, 0], [0, -1], [-1, 1], [1, 1], [-2, 0], [2, 0], [0, 2], [-1, -1], [1, -1]];
  for (const [dx, dy] of ring) {
    await page.eval(`window.__world.tp(${t[0] + dx}, ${t[1] + dy})`);
    if (await waitFor(async () => (await page.eval('window.__world.focus()')) === id, 1500)) return true;
  }
  return false;
};
const events = () => page.eval('window.__ev.splice(0)');
/** press the interact key at an NPC until their dialogue opens (after a conversation the HUD fades back in first) */
const talk = async (id, dialogueId) => {
  await waitFor(async () => (await hud())?.alpha === 1, 4000);
  for (let i = 0; i < 3; i++) {
    // NPCs keep their schedules and wander a little between conversations: step back up to them if needed
    if ((await page.eval('window.__world.focus()')) !== id && id.startsWith('npc:')) await walkTo(id);
    await pressAction('interact');
    const d = await waitFor(async () => { const x = await dlg(); return x && (!dialogueId || x.id === dialogueId) ? x : null; }, 2500);
    if (d) return d;
  }
  return null;
};

try {
  // ── boot as a fresh Warden in Frostmere, with First Steps on ──
  await page.goto(`${BASE}/?scene=WorldV2&space=realm:rime&hc_class=warden`);
  await waitFor(() => page.eval('!!(window.__hc && window.__hc.local() && window.__hud && window.narrative && window.__world)'), 120000);
  // the dev URL picks the combat kit only; the story needs a hero (as character creation sets it)
  await core(`const { defaultLook } = await import('/src/data/classes/hc/index.ts');
    c.Game.state.player.hero = { classId: 'warden', look: defaultLook('warden', 0), outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } };
    c.syncHeroClass(c.Game.state);`);
  await sleep(1500);
  await endDialogue();
  await core(`window.__ev = []; for (const n of ['narrative:toast', 'quest:started', 'quest:completed', 'codex:unlocked', 'ui:open', 'ui:close']) c.bus.on(n, (e) => window.__ev.push({ n, ...e }));`);

  // ── First Steps ticks from a real key ──
  await N(`flag('tut.on', true)`);
  if (!(await quest('quest:warden-first-steps'))) await N(`start('quest:warden-first-steps')`);
  await sleep(600);
  const moveBefore = await flag('tut.move');
  await page.hold([await keyOf('up')], 400); await sleep(500);
  const fs = await quest('quest:warden-first-steps');
  check('First Steps: a real move key ticks the move step', !!fs && !moveBefore && (await flag('tut.move')) === true, `quest ${!!fs}, flag ${moveBefore} → ${await flag('tut.move')}`);
  check('First Steps shows in the HUD tracker', (await hud())?.texts.some((t) => t.text === 'FIRST STEPS'));

  // ── [School] and INSIGHT options for the party (a Warden alone: Rime yes, Radiance/Song not offered) ──
  await page.eval(`(async () => (await import('/src/narrative/engine/dialogue.ts')).openDialogue('dialogue:sentinel-release-rime'))()`);
  let v = await continueUntil((x) => x.choices.length > 0);
  const rime = v?.choices.find((c) => c.school === 'rime');
  check('[School] option of the hero’s school is offered and can be picked', !!rime && rime.enabled, JSON.stringify(v?.choices.map((c) => [c.school, c.enabled])));
  if (rime) await pick((c) => c.school === 'rime');
  check('picking it by number key follows it', (await dlg())?.node === 'keep', (await dlg())?.node);
  await endDialogue();
  await page.eval(`(async () => (await import('/src/narrative/engine/dialogue.ts')).openDialogue('dialogue:sentinel-release-morwen'))()`);
  v = await continueUntil((x) => x.choices.length > 0);
  check('other schools’ [School] options are not offered to this party', !!v && v.choices.length > 0 && !v.choices.some((c) => c.school === 'radiance' || c.school === 'song'), JSON.stringify(v?.choices.map((c) => c.school)));
  await endDialogue();

  // ── a party vote in solo resolves at once ──
  await N('testVote()');
  v = await continueUntil((x) => x.choices.length > 0);
  await pick(() => true);
  check('a party vote in solo resolves on the first pick', (await flag('dev.test_vote')) != null, `dev.test_vote=${await flag('dev.test_vote')}`);
  await endDialogue();

  // ── into Concordia (Act II): the Brindlecross people ──
  await N(`flag('story.gate_open', true)`); await N(`flag('story.act', 2)`);
  await page.eval(`window.__world.space('concordia')`);
  await waitFor(() => page.eval(`(() => { try { return window.__world.where().space === 'concordia' && !!window.__hc.local(); } catch { return false; } })()`), 60000);
  await sleep(2000);
  await endDialogue();
  await events();

  // ── talk with the interact key; number key and mouse each advance; Farewell closes; the HUD fades and returns ──
  const atSela = await walkTo('npc:sela');
  check('walk up to Sela: [F] focus is on her', atSela);
  const xpBefore = await hud();
  await pressAction('interact');
  v = await waitFor(() => dlg(), 5000);
  check('the interact key opens her dialogue', v?.id === 'dialogue:cc-sela', v?.id);
  const faded = await waitFor(async () => ((await hud())?.alpha ?? 1) < 0.05, 3000);
  check('the HUD fades under the dialogue', !!faded);
  await pick((c) => /wake them/.test(c.text));
  v = await dlg();
  check('a choice by number key advances (Teach me to wake them)', v?.node === 'wake', v?.node);
  check('the quest offer starts the quest', !!(await quest('quest:cc-waystones')));
  await endDialogue();
  check('the HUD returns when the dialogue ends', !!(await waitFor(async () => (await hud())?.alpha === 1, 3000)));
  v = await talk('npc:sela', 'dialogue:cc-sela');
  const compass = v?.choices.find((c) => /compass/i.test(c.text));
  const clicked = compass ? await clickChoice(compass.text) : false;
  const seen = clicked ? '' : (await nui()).filter((o) => o.x > 600 && o.y > 400).map((o) => o.text.slice(0, 30)).join(' | ');
  check('a choice by mouse click advances (compass)', clicked && (await dlg())?.node === 'compass', `${clicked} ${(await dlg())?.node} ${seen}`);
  await endDialogue();
  const opened = await talk('npc:sela', 'dialogue:cc-sela');
  const bye = opened && await pick((c) => c.text === 'Farewell.');
  check('Farewell closes the dialogue', !!opened && !!bye && !!(await waitFor(async () => !(await dlg()), 3000)), `opened ${!!opened}, farewell offered ${!!bye}`);

  // ── quests in the tracker and the Journal ──
  let h;
  const inTracker = (hh, s) => !!hh?.texts.some((t) => t.text.includes(s) && t.alpha > 0.5);
  const isQuestRow = (s) => s === 'Wake the Waystones';
  await pressAction('journal');
  check('the Journal (Active) lists it', !!(await waitFor(async () => (await nui()).some((t) => t.text.includes('Wake the Waystones')), 4000)));
  // select it and track it with T, as a player does; the HUD tracker follows the tracked quest
  const selected = await clickText(isQuestRow);
  await page.press('KeyT', 60); await sleep(400);
  await page.screenshot(`${OUT}/features-journal.png`);
  await page.press('Escape', 60); await sleep(800);
  h = await waitFor(async () => { const x = await hud(); return inTracker(x, 'Wake the Waystones') ? x : null; }, 3000) ?? await hud();
  check('tracking it (click + T in the Journal) shows it in the HUD tracker', selected && inTracker(h, 'Wake the Waystones') && inTracker(h, 'Brindlecross waystone'), `selected ${selected}`);
  // stage by real input: walk to the Brindlecross waystone and wake it with the interact key
  const atStone = await walkTo('ws:brind', 'landmark:brind-waystone');
  if (atStone) { await pressAction('interact'); }
  const st = await waitFor(async () => ((await quest('quest:cc-waystones'))?.stage === 'wood' ? 'wood' : null), 6000);
  h = await hud();
  check('waking the waystone with [F] completes the stage', st === 'wood', `focus ok ${atStone}, stage ${(await quest('quest:cc-waystones'))?.stage}`);
  check('the tracker shows the next stage', inTracker(h, 'Gloamwood Glade'));
  await pressAction('journal');
  await clickText(isQuestRow);
  check('the Journal shows the next stage', !!(await waitFor(async () => (await nui()).some((t) => /Gloamwood Glade|Three more stones/.test(t.text)), 4000)));
  await page.press('Escape', 60); await sleep(500);
  // finish it (set-up via DEV), the last talk by real input
  await core(`const me = c.Services.get('net').localPlayer; for (const w of ['ws:glade', 'ws:stag', 'ws:briar']) c.bus.emit('waystone:woken', { playerId: me, waystone: w, space: 'concordia' });`);
  await sleep(600);
  if (await walkTo('npc:sela')) { await talk('npc:sela', 'dialogue:cc-sela-report'); await endDialogue(); }
  await N(`flag('cc.waystone_heart', true)`);
  const done = await waitFor(async () => (await quest('quest:cc-waystones'))?.completed === true, 6000);
  await sleep(800);
  const h2 = await hud();
  check('completing it pays XP (bar or level rises)', !!done && (Number(h2.text.lvl) > Number(xpBefore.text.lvl) || h2.bars.xp > xpBefore.bars.xp), `lvl ${xpBefore.text.lvl}→${h2.text.lvl} xp ${xpBefore.bars.xp}→${h2.bars.xp}`);
  await pressAction('journal');
  const doneTab = await clickText((s) => /^Done\b/.test(s));
  const doneSeen = await waitFor(async () => (await nui()).some((t) => t.text.includes('Wake the Waystones')), 3000);
  check('the Journal’s Done tab lists it', doneTab && !!doneSeen, `tab ${doneTab}; ${(await nui()).filter((o) => o.x < 470).map((o) => o.text.slice(0, 24)).slice(0, 12).join(' | ')}`);
  await page.press('Escape', 60); await sleep(500);

  // ── trust: a TRUST choice moves trust, the diamonds and a teal toast ──
  await N(`flag('trust.sela', 3)`);
  await events();
  if (await walkTo('npc:sela')) await talk('npc:sela', 'dialogue:cc-sela');
  await pick((c) => /storms bother/.test(c.text));
  v = await waitFor(async () => { const d = await dlg(); return d?.id === 'dialogue:cc-sela-confide' ? d : null; }, 5000);
  v = await continueUntil((x) => x.choices.length > 0);
  const t0 = v?.trust;
  await pick((c) => /warning you/.test(c.text));
  await sleep(500);
  v = await dlg();
  const evs = await events();
  check('a TRUST choice raises trust', (await flag('trust.sela')) === 4, `trust ${await flag('trust.sela')}`);
  check('the trust diamonds update in the dialogue', t0 === 3 && v?.trust === 4, `${t0} → ${v?.trust}`);
  const trustToast = evs.find((e) => e.n === 'narrative:toast' && e.kind === 'trust');
  // the HUD is faded under the dialogue, so the toast has to be readable once the conversation closes
  await endDialogue();
  const shown = trustToast && await waitFor(async () => inTracker(await hud(), trustToast.text.slice(0, 10)), 3000);
  check('a teal trust toast shows (readable after the dialogue closes)', !!shown, trustToast ? `${trustToast.text} (kind trust → teal)` : 'no trust toast event');

  // ── INSIGHT: hidden until its insight is known ──
  v = (await walkTo('npc:nanbriar')) ? await talk('npc:nanbriar', 'dialogue:cc-nan') : null;
  const hiddenBefore = !!v && !v.choices.some((c) => /Citadel gardens/.test(c.text));
  await endDialogue();
  await N(`flag('insight.tears_seed', true)`);
  v = await talk('npc:nanbriar', 'dialogue:cc-nan');
  check('an INSIGHT-gated option is hidden, then shown once the insight is known', hiddenBefore && !!v?.choices.some((c) => /Citadel gardens/.test(c.text)), `before hidden ${hiddenBefore}`);
  await endDialogue();

  // ── an object scene on [F], its codex unlock, and the Codex ──
  await events();
  const atFind = await walkTo('obj:alder-view-find', 'obj:alder-view-find');
  if (atFind) await pressAction('interact');
  v = await waitFor(() => dlg(), 5000);
  check('[F] on a placed object plays its scene', atFind && v?.id === 'dialogue:obj-alder-view-find', `focus ${atFind}, ${v?.id}`);
  await endDialogue();
  const ev2 = await events();
  const unlocked = await core(`return c.Game.state.narrative.codexUnlocked.includes('lore:hc-alder-rise');`);
  check('the codex unlock toasts', unlocked && ev2.some((e) => e.n === 'narrative:toast' && e.kind === 'codex'), ev2.filter((e) => e.n === 'narrative:toast').map((e) => `${e.kind}:${e.text}`).join(' | '));
  await pressAction('codex');
  await waitFor(async () => (await nui()).some((t) => t.text === 'Codex'), 4000);
  let entry = (await nui()).find((t) => t.text === 'Bellwether Rise');
  if (!entry) { const cat = (await nui()).find((t) => t.text === 'Places'); if (cat) { await page.click(cat.x, cat.y); await sleep(600); } entry = (await nui()).find((t) => t.text === 'Bellwether Rise'); }
  if (entry) { await page.click(entry.x, entry.y); await sleep(600); }
  await page.screenshot(`${OUT}/features-codex.png`);
  check('the Codex shows the entry with its text', !!entry && (await nui()).some((t) => t.text.includes('highest point on the Alder moor')), entry ? 'entry found' : 'entry missing');
  await page.press('Escape', 60); await sleep(400);

  check('no console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
} catch (e) {
  check('harness', false, e.message);
}
await page.close();
console.log(`\n${total - fails}/${total} passed (${Math.round((Date.now() - T0) / 1000)} s)`);
process.exit(fails ? 1 : 0);
