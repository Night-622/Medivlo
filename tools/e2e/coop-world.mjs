// Co-op in the real game world (Claude 1): tab A plays a Warden and opens its world (hostGame → join code),
// tab B (an Arcanist) joins by code into WorldV2 as a guest. Checks both heroes exist on both sides, guest movement
// reaches the host's sim, chat crosses, party session shows 2. Screenshots both tabs.
//   npx vite --config tools/e2e/vite.test.config.mjs ; node tools/e2e/coop-world.mjs [--out dir]
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { acquireChrome, CHROME_PATH } from './chrome-lock.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('base', 'http://localhost:5199');
const OUT = arg('out', 'tools/e2e/out');
mkdirSync(OUT, { recursive: true });
const PORT = 9800 + Math.floor(Math.random() * 100);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await acquireChrome('coop-world');
const chrome = spawn(CHROME_PATH, ['--headless=new', '--mute-audio', `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${mkdtempSync(join(process.env.SCRATCH ?? tmpdir(), 'cdp-'))}`, '--window-size=1280,720',
  // both tabs must keep their game loops running
  '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows',
  '--disable-features=CalculateNativeWinOcclusion,IntensiveWakeUpThrottling', '--autoplay-policy=no-user-gesture-required', 'about:blank'], { stdio: 'ignore' });
setTimeout(() => { console.log('TIMEOUT'); chrome.kill('SIGKILL'); process.exit(2); }, 8 * 60_000).unref();

async function tab(url) {
  const t = await (await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
  let id = 0; const pending = new Map(); const errors = [];
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d.result ?? d); pending.delete(d.id); }
    if (d.method === 'Runtime.exceptionThrown') errors.push(d.params.exceptionDetails?.exception?.description?.split('\n').slice(0, 3).join(' | ')); };
  const send = (method, params = {}) => { const i = ++id; ws.send(JSON.stringify({ id: i, method, params })); return new Promise((r) => pending.set(i, r)); };
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  const ev = async (expr) => { const r = await send('Runtime.evaluate', { expression: `(async () => (${expr}))()`, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 500)); return r.result?.value; };
  const key = async (code, ms = 80) => {
    const k = code.replace(/^Key/, '');
    await send('Input.dispatchKeyEvent', { type: 'keyDown', code, key: k.toLowerCase(), windowsVirtualKeyCode: k.charCodeAt(0) });
    await sleep(ms);
    await send('Input.dispatchKeyEvent', { type: 'keyUp', code, key: k.toLowerCase(), windowsVirtualKeyCode: k.charCodeAt(0) });
  };
  const shot = async (file) => { const s = await send('Page.captureScreenshot', { format: 'png' }); if (s.data) writeFileSync(file, Buffer.from(s.data, 'base64')); };
  const waitFor = async (expr, ms = 90000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await ev(expr)) return true; } catch { /* page still loading */ } await sleep(500); } return false; };
  return { ev, key, shot, waitFor, errors, close: () => ws.close() };
}

const results = [];
const check = (name, ok, detail = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + String(detail).slice(0, 220) : ''}`); };
const hero = (name, cls) => `(async () => {
  const core = await import('/src/core/index.ts');
  const { defaultLook } = await import('/src/data/classes/hc/index.ts');
  const st = core.createNewGameState(0);
  st.player.name = ${JSON.stringify(name)};
  st.player.hero = { classId: ${JSON.stringify(cls)}, look: defaultLook(${JSON.stringify(cls)}, 0), outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } };
  st.world.location.space = 'concordia';
  core.Game.set(st);
  return true;
})()`;
const endDialogue = async (T) => {
  for (let i = 0; i < 30; i++) {
    const n = await T.ev(`(async () => { const d = (await import('/src/narrative/client/dialogueClient.ts')).dialogueClient; return d.active ? d.view.choices.length : -1; })()`);
    if (n < 0) return;
    await T.ev(`(async () => { const d = (await import('/src/narrative/client/dialogueClient.ts')).dialogueClient; if (d.view.choices.length) d.choose(d.view.choices.at(-1).index); else d.advance(); return 1; })()`);
    await sleep(300);
  }
};
const players = `(async () => { const c = await import('/src/core/index.ts'); return (c.Services.tryGet('combat')?.players() ?? []).map((p) => ({ id: p.playerId ?? p.id, x: Math.round(p.x), y: Math.round(p.y), space: p.space })); })()`;

try {
  for (let i = 0; i < 40; i++) { await sleep(250); try { await fetch(`http://127.0.0.1:${PORT}/json/version`); break; } catch {} }
  const A = await tab(`${BASE}/`);
  check('host title up', await A.waitFor(`!!window.__game?.scene.isActive('MainMenu')`));
  await A.ev(hero('Hosty', 'warden'));
  await A.ev(`(window.__game.scene.getScene('MainMenu').scene.start('WorldV2'), 1)`);
  check('host in WorldV2', await A.waitFor(`!!window.__game.scene.isActive('HudV2')`));
  await sleep(3000);
  await endDialogue(A);
  const code = await A.ev(`(async () => (await import('/src/net/coop/index.ts')).hostGame(() => true))()`);
  check('host opened its world', typeof code === 'string' && code.length === 6, code);

  const B = await tab(`${BASE}/`);
  check('guest title up', await B.waitFor(`!!window.__game?.scene.isActive('MainMenu')`));
  await B.ev(hero('Gus', 'arcanist'));
  const joined = await B.ev(`(async () => { const coop = await import('/src/net/coop/index.ts'); const g = await coop.joinGame(${JSON.stringify(code)}); return { role: g.role, members: g.session().members.map((m) => m.name) }; })()`);
  check('guest joined by code', joined?.role === 'guest' && joined.members.length === 2, JSON.stringify(joined));
  await B.ev(`(window.__game.scene.getScene('MainMenu').scene.start('WorldV2', { guest: true }), 1)`);
  check('guest in WorldV2', await B.waitFor(`!!window.__game.scene.isActive('HudV2')`));
  await sleep(6000);
  await endDialogue(B);

  const hostSees = await A.ev(players);
  check('host sim has both heroes', hostSees.length === 2, JSON.stringify(hostSees));
  const gWorld = await B.ev(`(() => { const s = window.__game.scene.getScene('WorldV2'); return { space: s.space }; })()`);
  check('guest renders the host\'s space', gWorld.space === hostSees[0]?.space, JSON.stringify({ gWorld, host: hostSees[0]?.space }));
  const guestId = await B.ev(`(async () => (await import('/src/core/index.ts')).Services.get('net').localPlayer)()`);
  const before = hostSees.find((p) => p.id === guestId);
  await B.key('KeyD', 1200); await sleep(800);
  const after = (await A.ev(players)).find((p) => p.id === guestId);
  check('guest input moves its hero on the host', !!before && !!after && after.x - before.x > 20, JSON.stringify({ before, after }));
  await B.ev(`(async () => (await import('/src/core/index.ts')).Services.get('net').send({ type: 'chat', text: 'hi from guest' }))()`);
  await sleep(1200);
  const hostChat = await A.ev(`window.__game.scene.getScene('HudV2').chat?.lines?.map((l) => l.text) ?? []`);
  check('guest chat shows on the host HUD', hostChat.includes('hi from guest'), JSON.stringify(hostChat));
  // party vote in a real story scene: host opens a party-scope two-choice dialogue, both vote differently, host wins the tie
  const dc = `(await import('/src/narrative/client/dialogueClient.ts')).dialogueClient`;
  await endDialogue(A); await endDialogue(B);
  const opened = await A.ev(`(async () => !!window.narrative?.testVote?.())()`);
  check('host opens a party dialogue', opened);
  const seen = await B.waitFor(`(async () => { const d = ${dc}; return d.view?.dialogueId === 'dialogue:dev-test-vote' && d.view?.choices.length === 2; })()`, 15000);
  check('guest sees the same scene with both choices', seen);
  await B.shot(join(OUT, 'coop-vote-guest.png'));
  // one-time hints are local (narrative:toast local: true): the guest must not also show the host's copy (was 2)
  await sleep(800);
  const voteHints = await B.ev(`(window.__hud?.().texts ?? []).filter((t) => t.text.startsWith('Party vote')).length`);
  check('guest shows at most one vote hint (the host\'s is not replicated)', voteHints <= 1, String(voteHints));
  await A.ev(`(async () => { const d = ${dc}; d.choose(0); return 1; })()`);
  await B.ev(`(async () => { const d = ${dc}; d.choose(1); return 1; })()`);
  const decided = await A.waitFor(`(async () => (await import('/src/core/index.ts')).Game.state.flags['dev.test_vote'] !== undefined)()`, 40000);
  const flag = await A.ev(`(async () => (await import('/src/core/index.ts')).Game.state.flags['dev.test_vote'])()`);
  check('tied vote resolves to the host\'s pick', decided && flag === 'a', JSON.stringify(flag));
  await endDialogue(A); await endDialogue(B);
  await A.shot(join(OUT, 'coop-host.png'));
  await B.shot(join(OUT, 'coop-guest.png'));
  // Drop-in again (user rule: "any time if they have joined before"). On real Firestore the second knock on the same
  // room used to be refused (peer docs are create-only); leaving on purpose used to look like a kick → title.
  await B.ev(`(async () => { const c = await import('/src/core/index.ts'); window.__kicks = 0; c.bus.on('net:kicked', () => window.__kicks++); (await import('/src/net/coop/index.ts')).leaveCoop(); return 1; })()`);
  const gone = await A.waitFor(`(async () => !(await import('/src/core/index.ts')).Services.get('net').session().members.find((m) => m.playerId === ${JSON.stringify(guestId)})?.connected)()`, 15000);
  await sleep(1500);
  const stayed = await B.ev(`({ kicks: window.__kicks, title: window.__game.scene.isActive('MainMenu') })`);
  check('leaving on purpose is not a kick', gone && stayed.kicks === 0 && !stayed.title, JSON.stringify({ gone, ...stayed }));
  const rejoined = await B.ev(`(async () => { const coop = await import('/src/net/coop/index.ts'); try { const g = await coop.joinGame(${JSON.stringify(code)}); return { role: g.role }; } catch (e) { return { error: String(e?.message ?? e) }; } })()`);
  check('guest rejoins the same session by code', rejoined?.role === 'guest', JSON.stringify(rejoined));
  const back = await A.waitFor(`(async () => !!(await import('/src/core/index.ts')).Services.get('net').session().members.find((m) => m.playerId === ${JSON.stringify(guestId)})?.connected)()`, 15000);
  const snaps = await B.ev(`(async () => { const n = (await import('/src/core/index.ts')).Services.get('net'); let k = 0; const off = n.addConsumer({ kinds: ['player', 'enemy'], apply: () => { k++; } }); await new Promise((r) => setTimeout(r, 2500)); off(); return k; })()`);
  check('host shows the rejoined guest and streams to them', back && snaps > 5, JSON.stringify({ back, snaps }));
  // the host stops sending (stalled browser, lost network): the guest says so, then clears when snapshots return
  await A.ev(`(async () => { const n = (await import('/src/core/index.ts')).Services.get('net').current; n.__flush = n.flush; n.flush = () => {}; return 1; })()`);
  const waitText = `(window.__game.scene.getScene('HudV2').children.list.find((o) => o.text === 'Waiting for the host…')?.visible ?? false)`;
  const shown = await B.waitFor(waitText, 8000);
  await A.ev(`(async () => { const n = (await import('/src/core/index.ts')).Services.get('net').current; n.flush = n.__flush; return 1; })()`);
  const cleared = await B.waitFor(`!${waitText}`, 5000);
  check('a guest sees "Waiting for the host…" while no snapshots arrive, and it clears', shown && cleared, JSON.stringify({ shown, cleared }));
  // a guest whose world restarts (door, reload) sends a fresh input stream from seq 1: the host must still follow it
  await B.ev(`(window.__game.scene.getScene('WorldV2').scene.restart({ guest: true }), 1)`); await sleep(6000); await endDialogue(B);
  const r0 = (await A.ev(players)).find((p) => p.id === guestId);
  await B.key('KeyD', 1200); await sleep(800);
  const r1 = (await A.ev(players)).find((p) => p.id === guestId);
  check('guest input still moves its hero after the guest world restarts', !!r0 && !!r1 && r1.x - r0.x > 20, JSON.stringify({ r0, r1 }));
  // The host minimises its window: rAF stops and Phaser pauses its loop (emulated with the visibility API, which is
  // what Phaser listens to). The sim used to stop with it and every guest froze.
  const setHidden = (h) => `(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => ${h} }); Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => '${h ? 'hidden' : 'visible'}' }); document.dispatchEvent(new Event('visibilitychange')); if (${h}) window.__game.loop.sleep(); else window.__game.loop.wake(); return 1; })()`; // hidden tabs get no rAF: Phaser's loop stops
  const simTick = `(async () => (await import('/src/net/index.ts')).sim.tick)()`;
  await A.ev(setHidden(true));
  await sleep(300);
  const t0 = await A.ev(simTick);
  const gBefore = (await A.ev(players)).find((p) => p.id === guestId);
  const hiddenSnaps = B.ev(`(async () => { const n = (await import('/src/core/index.ts')).Services.get('net'); let k = 0; const off = n.addConsumer({ kinds: ['player', 'enemy'], apply: () => { k++; } }); await new Promise((r) => setTimeout(r, 2500)); off(); return k; })()`);
  await B.key('KeyA', 1200);
  const hs = await hiddenSnaps;
  const t1 = await A.ev(simTick);
  const gAfter = (await A.ev(players)).find((p) => p.id === guestId);
  check('a hidden host keeps the world running for guests (at 30 Hz, not doubled)', t1 - t0 > 40 && t1 - t0 < 115 && hs > 10 && !!gBefore && !!gAfter && gBefore.x - gAfter.x > 20, JSON.stringify({ ticks: t1 - t0, guestSnaps: hs, moved: gBefore && gAfter ? gBefore.x - gAfter.x : null}));
  await A.ev(setHidden(false));
  await sleep(800);
  await sleep(1500); const t2 = await A.ev(simTick); await sleep(2000); const t3 = await A.ev(simTick);
  check('…and runs on Phaser again once shown (worker stopped, not doubled)', t3 - t2 > 8 && t3 - t2 < 70, // headless resumes a woken loop at ~10 fps (18–25 ticks); a real tab at full rate
    `ticks in 2 s: ${t3 - t2}`);
  const errs = [...A.errors, ...B.errors].filter((e) => !/auth\/|firestore|Firebase/i.test(e ?? ''));
  check('no page errors', !errs.length, errs.slice(0, 3).join(' || '));
} catch (e) { check('harness', false, String(e)); }
chrome.kill('SIGKILL');
const failed = results.filter((x) => !x).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
