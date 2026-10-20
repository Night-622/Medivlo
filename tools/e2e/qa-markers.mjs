// QA (Claude 7): quest markers reach the player (Claude 4's questMarkers → Claude 2's minimap/map). Per class:
//  1. the tracked quest's objective has a mark in this space (__world.questMarks().here)
//  2. the minimap draws it: a gold diamond where it should be when it's in the window, else a gold edge arrow
//     pointing toward it (read from the minimap's own draw commands, not guessed from pixels)
//  3. after a long walk away (teleport), the arrow still points the right way
//  4. M opens the map on the level holding the mark; the Journal's "Show on map" (real click) opens it focused
//  5. completing a stage moves the mark to the next objective
//  6. a lair objective points at the lair's outside door from the overworld
//   node tools/e2e/qa-markers.mjs [--base http://localhost:5170] [--class rimecaller,samurai,falconer] [--out tools/e2e/out/qa]
import { mkdirSync } from 'node:fs';
import { launch, sleep } from './cdp.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('base', 'http://localhost:5170'), OUT = arg('out', 'tools/e2e/out/qa');
const CLASSES = arg('class', 'rimecaller,samurai,falconer').split(',');
mkdirSync(OUT, { recursive: true });
let fails = 0, total = 0;
const check = (what, ok, detail = '') => { total++; if (!ok) fails++; console.log(`${ok ? 'PASS' : 'FAIL'} ${what}${detail ? ` :: ${String(detail).slice(0, 260)}` : ''}`); return ok; };
const page = await launch({ port: 9850 + Math.floor(Math.random() * 100) });
const errors = [];
page.on((m) => {
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails?.exception?.description?.split('\n')[0] ?? 'exception');
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200));
});
const ev = (e) => page.eval(e);
const waitFor = async (expr, ms = 90000) => { const t = Date.now(); while (Date.now() - t < ms) { try { if (await ev(expr)) return true; } catch { /* loading */ } await sleep(300); } return false; };
const endDialogue = async () => {
  for (let i = 0; i < 40; i++) {
    const n = await ev(`(async () => { const d = (await import('/src/narrative/client/dialogueClient.ts')).dialogueClient; return d.active ? d.view.choices.length : -1; })()`);
    if (n < 0) return;
    await page.press(n > 0 ? 'Digit1' : 'Space', 60); await sleep(300);
  }
};
const marks = () => ev('window.__world.questMarks()');

// what the minimap drew this frame: gold diamonds / arrows (window px), plus where the tracked mark should be
const minimap = () => ev(`(async () => {
  const { C, T, n } = await import('/src/ui/kit/hc/index.ts');
  const w = window.__game.scene.getScene('WorldV2'), mm = w.minimap, p = window.__hc.local();
  const [MW, MH] = T.component.minimap.map, S = T.component.minimap.scale, gold = n(C.gold);
  const buf = mm.marks.commandBuffer, tris = [];
  let fill = null;
  for (let i = 0; i < buf.length;) {
    const c = buf[i];
    if (c === 7) { fill = buf[i + 1]; i += 3; continue; }                    // FILL_STYLE color alpha
    if (c === 10) { if (fill === gold) tris.push(buf.slice(i + 1, i + 7)); i += 7; continue; } // FILL_TRIANGLE x1 y1 x2 y2 x3 y3
    i += c === 8 ? 4 : 1;                                                   // anything else: skip conservatively
  }
  // centre gold square (the player) is a rect, not a triangle; diamonds are pairs of triangles, the arrow is one
  const cents = tris.map((t) => [(t[0] + t[2] + t[4]) / 3, (t[1] + t[3] + t[5]) / 3]);
  const tracked = window.__world.questMarks().here.find((m) => m.tracked);
  const exp = tracked ? { x: tracked.x * S - (p.x * S - MW / 2), y: tracked.y * S - (p.y * S - MH / 2) } : null;
  return { MW, MH, tris: cents, exp, inWindow: exp ? exp.x >= 0 && exp.y >= 0 && exp.x <= MW && exp.y <= MH : null };
})()`);
const near = (a, b, r) => Math.hypot(a[0] - b.x, a[1] - b.y) <= r;
const angle = (from, to) => Math.atan2(to.y - from.y, to.x - from.x);
const adiff = (a, b) => { const d = Math.abs(a - b) % (2 * Math.PI); return d > Math.PI ? 2 * Math.PI - d : d; };

async function minimapShows(cls, label) {
  await sleep(700);
  const m = await minimap();
  if (!m.exp) return check(`${cls}: ${label}: a tracked mark in this space`, false, 'none');
  if (m.inWindow) return check(`${cls}: ${label}: gold diamond on the minimap at the objective`, m.tris.some((t) => near(t, m.exp, 4)), `want ${Math.round(m.exp.x)},${Math.round(m.exp.y)}; gold tris ${JSON.stringify(m.tris.map((t) => t.map(Math.round)))}`);
  const want = angle({ x: m.MW / 2, y: m.MH / 2 }, m.exp);
  const best = m.tris.map((t) => ({ t, d: adiff(angle({ x: m.MW / 2, y: m.MH / 2 }, { x: t[0], y: t[1] }), want), edge: Math.min(t[0], t[1], m.MW - t[0], m.MH - t[1]) }))
    .filter((x) => x.edge < 14).sort((a, b) => a.d - b.d)[0];
  return check(`${cls}: ${label}: gold edge arrow points toward the off-window objective`, !!best && best.d < 0.35, `want ${(want * 57.3).toFixed(0)}°, got ${best ? (angle({ x: m.MW / 2, y: m.MH / 2 }, { x: best.t[0], y: best.t[1] }) * 57.3).toFixed(0) + '°' : 'no arrow'}`);
}

async function enter(cls) {
  await page.goto(`${BASE}/`);
  if (!(await waitFor(`!!window.__game?.scene.isActive('MainMenu')`))) throw new Error('title never appeared');
  await ev(`(async () => { const core = await import('/src/core/index.ts'); const { defaultLook } = await import('/src/data/classes/hc/index.ts');
    const st = core.createNewGameState(0); st.player.name = 'Mara';
    st.player.hero = { classId: ${JSON.stringify(cls)}, look: defaultLook(${JSON.stringify(cls)}, 0), outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } };
    core.Game.set(st); window.__game.scene.getScene('MainMenu').scene.start('WorldV2'); return 1; })()`);
  if (!(await waitFor('!!(window.__hc && window.__hc.local() && window.__world?.questMarks)'))) throw new Error('world never appeared');
  await sleep(2500);
  await endDialogue();
  await ev(`(async () => { const c = await import('/src/core/index.ts'); window.__ui = []; c.bus.on('ui:open', (e) => window.__ui.push(e)); for (const e of window.__hc.enemies()) c.Services.get('combat').despawn(e.id); return 1; })()`);
}

try {
  for (const cls of CLASSES) {
    await enter(cls);
    const m0 = await marks();
    const tr = m0.here.find((m) => m.tracked);
    check(`${cls}: the tracked objective has a quest mark in the start realm`, !!tr, `${m0.all.length} marks, ${m0.here.length} here: ${m0.here.slice(0, 3).map((m) => m.label).join(' | ')}`);
    if (!tr) continue;
    await minimapShows(cls, 'at the start');
    await page.screenshot(`${OUT}/mk-${cls}-start.png`);

    // walk far away (teleport ~70 tiles to the side the mark isn't): the edge arrow must point back
    const p = await ev('window.__hc.local()');
    const dx = p.x >= tr.x ? 1 : -1;
    await ev(`window.__world.tp(${Math.round(tr.x / 32 + dx * 70)}, ${Math.round(tr.y / 32 + 20)})`);
    await sleep(1500);
    await minimapShows(cls, 'far away');
    await page.screenshot(`${OUT}/mk-${cls}-far.png`);
    await ev(`window.__world.tp(${Math.round(p.x / 32)}, ${Math.round(p.y / 32)})`); await sleep(1200);

    // M: the map opens on the level holding the mark
    await page.press('KeyM'); await sleep(1200);
    const lv = await ev(`(() => { const ms = window.__game.scene.getScene('WorldV2').map; return { open: ms.open, level: ms.level }; })()`);
    check(`${cls}: M opens the map on the mark's level`, lv.open && (lv.level?.space === tr.space || lv.level?.kind === 'village'), JSON.stringify(lv));
    await page.screenshot(`${OUT}/mk-${cls}-map.png`);
    await page.press('Escape'); await sleep(500); await page.press('Escape'); await sleep(500);

    // Journal › Show on map (real click on the button)
    await page.press('KeyJ'); await sleep(1200);
    await ev('(window.__ui.length = 0, 1)');
    await page.click(706 + 90, 646); await sleep(1200);
    const sent = (await ev('window.__ui')).find((e) => e.panel === 'map');
    const fo = await ev(`(() => { const ms = window.__game.scene.getScene('WorldV2').map; return { open: ms.open, focus: ms.focus ?? null, level: ms.level }; })()`);
    check(`${cls}: Journal "Show on map" opens the map focused on the tracked objective`, !!sent && fo.open && !!fo.focus && m0.all.some((m) => m.tracked && m.place === fo.focus), JSON.stringify({ sent, fo }));
    await page.screenshot(`${OUT}/mk-${cls}-show-on-map.png`);
    for (let i = 0; i < 3; i++) { await page.press('Escape'); await sleep(400); }
    if (await ev(`window.__game.scene.isActive('Pause')`)) { await page.press('Escape'); await sleep(400); }

    // completing the stage moves the mark
    const moved = await ev(`(async () => {
      const q = await import('/src/narrative/engine/quests.ts'); const c = await import('/src/core/index.ts');
      const id = c.Game.state.narrative.trackedQuest; const def = q.questDef(id); const st = q.currentStage(def);
      const next = typeof st.next === 'string' ? st.next : Array.isArray(st.next) ? st.next[0]?.to : null;
      if (!next) return { skip: 'last stage' };
      const before = window.__world.questMarks().all.filter((m) => m.tracked).map((m) => m.key);
      q.setStage(id, next);
      await new Promise((r) => setTimeout(r, 1200));
      const after = window.__world.questMarks().all.filter((m) => m.tracked).map((m) => m.key);
      return { id, from: st.id, to: next, before, after };
    })()`);
    if (moved.skip) console.log(`note ${cls}: stage-move check skipped (${moved.skip})`);
    else check(`${cls}: completing a stage moves the tracked mark to the next objective`, JSON.stringify(moved.before) !== JSON.stringify(moved.after) && moved.after.length > 0, JSON.stringify(moved));

    // a lair objective (its place is inside an instance) points at the lair's door from the overworld
    const lair = await ev(`(async () => {
      const c = await import('/src/core/index.ts'); const q = await import('/src/narrative/engine/quests.ts'); const mk = await import('/src/narrative/client/markers.ts');
      const { markerAt } = await import('/src/world/hc/spawns.ts');
      const S = c.classSchool(${JSON.stringify(cls)});
      for (const def of c.Registry.all('quest').filter((d) => d.id.startsWith('quest:' + ${JSON.stringify(cls)} + '-') && d.act === 'act1')) {
        for (const st of def.stages) {
          const place = st.objectives.map((o) => mk.objectivePlaces(o)[0]).find(Boolean) ?? mk.fallbackPlace(def, st.id);
          const lairId = place && (place.match(/^inst:([a-z]+-(capital|frontier)-lair-\\d+)$/)?.[1]);
          if (!lairId) continue;
          if (!q.isActive(def.id)) q.startQuest(def.id);
          q.setStage(def.id, st.id);
          c.Game.state.narrative.trackedQuest = def.id; c.bus.emit('quest:advanced', { questId: def.id, stage: st.id });
          await new Promise((r) => setTimeout(r, 1200));
          const door = markerAt('obj:' + lairId + '-door');
          const m = window.__world.questMarks().all.find((x) => x.tracked);
          return { quest: def.id, stage: st.id, place, door: door && [door.at[0] * 32 + 16, door.at[1] * 32 + 16], mark: m && [Math.round(m.x), Math.round(m.y)], space: m?.space };
        }
      }
      return null;
    })()`);
    if (!lair) console.log(`note ${cls}: no Act I stage whose place is a lair instance`);
    else check(`${cls}: a lair objective's mark sits at the lair door outside`, !!lair.mark && !!lair.door && Math.hypot(lair.mark[0] - lair.door[0], lair.mark[1] - lair.door[1]) <= 96, JSON.stringify(lair));
    if (lair?.mark) await minimapShows(cls, 'lair objective');
  }
} catch (e) { check('harness', false, String(e?.stack ?? e).split('\n').slice(0, 2).join(' < ')); }
const errs = errors.filter((e) => !/auth\/|firestore|Firebase/i.test(e));
check('no console errors', !errs.length, errs.slice(0, 4).join(' | '));
await page.close();
console.log(`\n${total - fails}/${total} passed`);
process.exit(fails ? 1 : 0);
