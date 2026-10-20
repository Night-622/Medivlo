// QA (Claude 7): a new player's first ~15–20 minutes with one class, by REAL keyboard and mouse. DEV handles only
// observe (positions, quests, flags), except teleports on long hauls, which the report counts. Not a campaign bot:
// it follows the tracked quest for a few objectives, fights what attacks it, then checks the session flows.
//  creation (class by ↑/↓, typed name, Enter) → opening scene → First Steps keys → follow the tracker (walk with
//  WASD steering, F to talk/use, Space/1 through dialogue) → first lair (walk in, fight with clicks + 1–3) →
//  level-up and a skill point → a merchant in reach → death → Death screen → respawn → Pause › Save → reload →
//  Continue → same place, level, gold, pack and quests.
//   node tools/e2e/qa-first-session.mjs --class rimecaller [--base http://localhost:5170] [--objectives 5] [--out tools/e2e/out/qa]
import { mkdirSync, writeFileSync } from 'node:fs';
import { launch, sleep } from './cdp.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('base', 'http://localhost:5170'), OUT = arg('out', 'tools/e2e/out/qa'), CLS = arg('class', 'rimecaller');
const MAX_OBJ = Number(arg('objectives', '5'));
mkdirSync(OUT, { recursive: true });
let fails = 0, total = 0;
const log = { class: CLS, at: new Date().toISOString(), timeline: [], objectives: [], teleports: 0, deaths: 0, notes: [] };
const t0 = Date.now();
const mark = (what) => { const s = Math.round((Date.now() - t0) / 1000); log.timeline.push(`${s}s ${what}`); console.log(`  [${s}s] ${what}`); };
const check = (what, ok, detail = '') => { total++; if (!ok) fails++; console.log(`${ok ? 'PASS' : 'FAIL'} ${CLS}: ${what}${detail ? ` :: ${String(detail).slice(0, 260)}` : ''}`); return ok; };
const note = (what) => { log.notes.push(what); console.log(`note ${CLS}: ${what}`); };
const shot = (n) => page.screenshot(`${OUT}/fs-${CLS}-${n}.png`);

const page = await launch({ port: 9700 + Math.floor(Math.random() * 200) });
const errors = [];
page.on((m) => {
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails?.exception?.description?.split('\n')[0] ?? 'exception');
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200));
});
const ev = (e) => page.eval(e);
const waitFor = async (expr, ms = 30000) => { const t = Date.now(); while (Date.now() - t < ms) { try { if (await ev(expr)) return true; } catch { /* loading */ } await sleep(300); } return false; };
const active = (k) => ev(`!!window.__game?.scene.isActive(${JSON.stringify(k)})`);
const me = () => ev('window.__hc.local()');
const dlg = () => ev(`(async () => { const d = (await import('/src/narrative/client/dialogueClient.ts')).dialogueClient; return d.active ? { n: d.view.choices.length, text: d.view.text, who: d.view.speakerName } : null; })()`);
const lines = async (pick = 'Digit1') => { // a player reading: Space on lines, the first option on choices
  let n = 0;
  for (; n < 60; n++) { const d = await dlg(); if (!d) break; await page.press(d.n ? pick : 'Space', 60); await sleep(450); }
  return n;
};
const state = () => ev(`(async () => { const c = await import('/src/core/index.ts'); const ch = window.__hc.character(); const w = window.__world?.where();
  return { space: w?.space, tx: w?.tx, ty: w?.ty, level: ch.level, xp: ch.xp, gold: ch.gold, pack: ch.inventory.length, eq: Object.keys(ch.equipment).length,
    quests: Object.fromEntries(Object.entries(c.Game.state.narrative.quests).map(([k, v]) => [k, v.stage + (v.completed ? ':done' : '')])) }; })()`);
const despawnNear = () => ev(`(async () => { const c = await import('/src/core/index.ts'); const p = window.__hc.local(); for (const e of window.__hc.enemies()) if (Math.hypot(e.x - p.x, e.y - p.y) < 500) c.Services.get('combat').despawn(e.id); return 1; })()`);

// ── fight whatever is close, like a player: click it, cast 1–3, dash out at low HP ──
async function fight(ms = 20000, radius = 260) {
  const end = Date.now() + ms; const kills0 = (await ev('window.__hc.counts'))['enemy:killed'] ?? 0; let k = 0;
  while (Date.now() < end) {
    if (await active('Death')) return 'dead';
    const p = await me(); if (!p) return 'gone';
    const foes = (await ev('window.__hc.enemies()')).map((e) => ({ ...e, d: Math.hypot(e.x - p.x, e.y - p.y) })).filter((e) => e.d < radius).sort((a, b) => a.d - b.d);
    if (!foes.length) break;
    const at = await ev(`window.__hc.screenOf(${JSON.stringify(foes[0].id)})`);
    if (at) await page.click(Math.round(at.x), Math.round(at.y));
    await page.press(`Digit${1 + (k++ % 3)}`, 60);
    if (p.hp / p.maxHp < 0.35) await page.press('KeyQ', 60);
    await sleep(500);
  }
  return `${((await ev('window.__hc.counts'))['enemy:killed'] ?? 0) - kills0} kills`;
}

// ── walk to a pixel point with WASD steering; sidestep when stuck; teleport only on long hauls ──
const focused = async (id) => { const f = await ev('window.__world.focus()'); return !!f && !!id && (id.endsWith('*') ? f.startsWith(id.slice(0, -1)) : f === id); };
async function walkTo(x, y, { near = 40, budget = 90000, focusId = null, haul = 90, until = null, reachR = 1.5 } = {}) {
  let p = await me(); const start = Date.now(); let stuck = 0, side = 1;
  const far = Math.hypot(x - p.x, y - p.y) / 32;
  if (far > haul) { // a long haul: a player would walk minutes; we jump to ~25 tiles out and walk the rest
    const k = 25 / far; await ev(`window.__world.tp(${Math.round((x + (p.x - x) * k) / 32)}, ${Math.round((y + (p.y - y) * k) / 32)})`);
    log.teleports++; mark(`teleported (long haul ${Math.round(far)} tiles)`); await sleep(1500);
  }
  // a player sees the way round trees and walls: plan over the real walkable tiles (A*), then steer with WASD
  // the goal may sit on blocked ground (a cliff perch, a waystone): A* stops at the first reachable tile within reachR
  const avoid = []; // tiles the hero couldn't get through (props wider than their tile, a companion in the way)
  let path = await plan(x, y, reachR, avoid), wp = 0, replans = 0;
  if (!path) return { ok: false, why: 'no walkable path', stuck };
  let [ex, ey] = path[path.length - 1];
  let bestEnd = Infinity, lastGain = Date.now(), lastSkip = 0;
  while (Date.now() - start < budget) {
    p = await me();
    if (await active('Death')) return { ok: false, why: 'died', stuck };
    if (focusId && (await focused(focusId))) return { ok: true, stuck };
    if (until && (await until())) return { ok: true, stuck }; // e.g. a reach objective counted on the way
    if (Math.hypot(x - p.x, y - p.y) < near || Math.hypot(ex - p.x, ey - p.y) < 14) return { ok: true, stuck };
    while (wp < path.length - 1 && Math.hypot(path[wp][0] - p.x, path[wp][1] - p.y) < 14) wp++;
    const [tx, ty] = path[wp];
    const dx = tx - p.x, dy = ty - p.y;
    const keys = []; if (dx > 6) keys.push('KeyD'); if (dx < -6) keys.push('KeyA'); if (dy > 6) keys.push('KeyS'); if (dy < -6) keys.push('KeyW');
    if (!keys.length) { wp = Math.min(path.length - 1, wp + 1); continue; }
    if (process.env.QA_TRACE && (Date.now() - start) % 5000 < 300) console.log(`  trace: at ${Math.round(p.x / 32)},${Math.round(p.y / 32)} → wp ${wp}/${path.length} ${Math.round(tx / 32)},${Math.round(ty / 32)} keys ${keys.join('+')} · ui ${JSON.stringify(await ev(`(async () => ({ dlg: (await import('/src/narrative/client/dialogueClient.ts')).dialogueClient.active, panel: window.__hud?.().panelOpen, pause: window.__game.scene.isActive('Pause'), input: window.__game.scene.getScene('WorldV2').heroInput?.enabled ?? null }))()`))}`);
    // short taps near a waypoint, so the hero doesn't overshoot it and wobble back and forth
    await page.hold(keys, Math.hypot(dx, dy) < 40 ? 90 : 250);
    const q = await me();
    // progress watchdog: wobbling round a waypoint moves the hero, so "no movement" never fires; judge by distance
    // to the end of the path instead: 3 s without getting closer → skip a waypoint and nudge; 8 s → re-plan from here
    const dEnd = Math.hypot(ex - q.x, ey - q.y);
    if (dEnd < bestEnd - 8) { bestEnd = dEnd; lastGain = Date.now(); }
    else if (Date.now() - lastGain > 8000 && replans++ < 8) { stuck++; path = (await plan(x, y, reachR, avoid)) ?? path; wp = 0; [ex, ey] = path[path.length - 1]; bestEnd = Infinity; lastGain = Date.now(); continue; }
    else if (Date.now() - lastGain > 3000 && Date.now() - lastSkip > 3000) { stuck++; lastSkip = Date.now(); avoid.push([Math.floor(path[wp][0] / 32), Math.floor(path[wp][1] / 32)]); path = (await plan(x, y, reachR, avoid)) ?? path; wp = 0; [ex, ey] = path[path.length - 1]; side = -side; await page.hold(Math.abs(dx) > Math.abs(dy) ? [side > 0 ? 'KeyS' : 'KeyW'] : [side > 0 ? 'KeyD' : 'KeyA'], 120); }
    if (Math.hypot(q.x - p.x, q.y - p.y) < 3) { // caught on a corner: nudge, then re-plan from here
      stuck++; side = -side;
      await page.hold(Math.abs(dx) > Math.abs(dy) ? [side > 0 ? 'KeyS' : 'KeyW'] : [side > 0 ? 'KeyD' : 'KeyA'], 250);
      if (stuck % 4 === 0 && replans++ < 8) { path = (await plan(x, y, reachR, avoid)) ?? path; wp = 0; [ex, ey] = path[path.length - 1]; }
    }
    if ((await ev('window.__hc.enemies()')).some((e) => Math.hypot(e.x - q.x, e.y - q.y) < 160)) { await fight(15000); path = (await plan(x, y, reachR, avoid)) ?? path; wp = 0; [ex, ey] = path[path.length - 1]; }
    if (await dlg()) await lines(); // a scene can start on the way
  }
  return { ok: false, why: 'timeout', stuck };
}

// stand where the game offers [F] for `id`: walk there, then try the walkable tiles round it (nearest first) until
// it is the focus, the way a player shuffles about until the prompt shows
async function approach(id, x, y, budget = 45000) {
  const t0 = Date.now();
  await walkTo(x, y, { near: 20, budget: Math.min(budget, 30000), focusId: id });
  if (await focused(id)) return true;
  const ring = await ev(`(() => { const q = window.__game.scene.getScene('WorldV2').query, gx = Math.floor(${x} / 32), gy = Math.floor(${y} / 32), out = [];
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if ((dx || dy) && q.isWalkable(gx + dx, gy + dy)) out.push([gx + dx, gy + dy, Math.hypot(dx, dy)]);
    return out.sort((a, b) => a[2] - b[2]).map(([tx, ty]) => [tx * 32 + 16, ty * 32 + 16]); })()`);
  for (const [tx, ty] of ring) {
    if (Date.now() - t0 > budget) break;
    await walkTo(tx, ty, { near: 8, budget: 8000, focusId: id });
    if (await focused(id)) return true;
  }
  return focused(id);
}

// A* over walkable tiles in the hero's space (8-way, no corner cutting) → waypoints in world px, or null if none
const plan = (x, y, R = 1.5, avoid = []) => ev(`(() => {
  const avoid = new Set(${JSON.stringify(avoid.map(([a, b]) => a + ',' + b))});
  const q = window.__game.scene.getScene('WorldV2').query, p = window.__hc.local();
  const sx = Math.floor(p.x / 32), sy = Math.floor(p.y / 32), gx = Math.floor(${x} / 32), gy = Math.floor(${y} / 32);
  const ok = (tx, ty) => q.isWalkable(tx, ty) && !avoid.has(tx + ',' + ty);
  const key = (tx, ty) => tx * 100000 + ty, h = (tx, ty) => Math.hypot(tx - gx, ty - gy);
  const open = [[h(sx, sy), 0, sx, sy]], came = new Map([[key(sx, sy), null]]), cost = new Map([[key(sx, sy), 0]]);
  let found = null, n = 0;
  while (open.length && n++ < 60000) {
    let bi = 0; for (let i = 1; i < open.length; i++) if (open[i][0] < open[bi][0]) bi = i;
    const [, g, cx, cy] = open.splice(bi, 1)[0];
    if (h(cx, cy) <= ${R}) { found = [cx, cy]; break; }
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]) {
      const nx = cx + dx, ny = cy + dy;
      if (!ok(nx, ny) || (dx && dy && (!ok(cx + dx, cy) || !ok(cx, cy + dy)))) continue;
      const ng = g + (dx && dy ? 1.414 : 1), k = key(nx, ny);
      if (ng < (cost.get(k) ?? Infinity)) { cost.set(k, ng); came.set(k, [cx, cy]); open.push([ng + h(nx, ny), ng, nx, ny]); }
    }
  }
  if (!found) return null;
  const tiles = []; for (let c = found; c; c = came.get(key(c[0], c[1]))) tiles.unshift(c);
  const pts = tiles.map(([tx, ty]) => [tx * 32 + 16, ty * 32 + 16]);
  return q.isWalkable(gx, gy) && found[0] === gx && found[1] === gy ? [...pts, [${x}, ${y}]] : pts;
})()`);

// the tracked quest's first open objective, and where its gold quest mark is (what a player follows)
const nextObjective = () => ev(`(async () => {
  const c = await import('/src/core/index.ts'); const q = await import('/src/narrative/engine/quests.ts');
  const tracked = c.Game.state.narrative.trackedQuest;
  // the tracked quest first; when its objective has no mark (e.g. "finish First Steps"), a player follows another mark
  const act = q.activeQuests().sort((a, b) => Number(b.id === tracked) - Number(a.id === tracked));
  if (!act.length) return null;
  const marks = window.__world.questMarks();
  let first = null;
  for (const def of act) {
    const st = q.currentStage(def); const o = st?.objectives.find((x) => !x.optional && !q.objectiveDone(def, x));
    if (!o) continue;
    const kind = Object.keys(o).find((k) => ['talk', 'kill', 'collect', 'reach', 'interact', 'when'].includes(k));
    const id = kind === 'talk' ? o.talk : kind === 'interact' ? o.interact : null;
    const mine = (m) => m.key.startsWith(def.id + '#' + o.id + '#');
    const here = marks.here.find(mine), anywhere = marks.all.find(mine);
    const base = { quest: def.id, title: def.name, stage: st.id, kind, id, text: q.objectiveText(def, o), count: q.objectiveCount(def, o), target: q.objectiveTarget(o), tracked: def.id === tracked };
    if (here && kind === 'reach' && here.place.startsWith('landmark:')) {
      // a reach counts inside the landmark's own area: aim for its nearest walkable tile, not just "near the mark"
      const { landmarksAt } = await import('/src/world/hc/interact.ts');
      const q = window.__game.scene.getScene('WorldV2').query, p = window.__hc.local(), sp = window.__world.where().space;
      const gx = Math.floor(here.x / 32), gy = Math.floor(here.y / 32); let best = null;
      for (let y = gy - 12; y <= gy + 12; y++) for (let x = gx - 12; x <= gx + 12; x++) {
        if (!q.isWalkable(x, y) || !landmarksAt(sp, x * 32 + 16, y * 32 + 16).includes(here.place)) continue;
        const d = Math.hypot(x * 32 + 16 - p.x, y * 32 + 16 - p.y); if (!best || d < best[2]) best = [x * 32 + 16, y * 32 + 16, d];
      }
      if (best) return { ...base, at: [best[0], best[1]] };
    }
    if (here) return { ...base, at: [here.x, here.y] };
    first ??= anywhere ? { ...base, otherSpace: anywhere.space } : { ...base, at: null };
  }
  return first ?? { quest: act[0].id, none: true };
})()`);

try {
  // ── 1. character creation, real input ──
  await page.goto(`${BASE}/`);
  check('title appears', await waitFor(`!!window.__game?.scene.isActive('MainMenu')`, 120000));
  mark('title'); await sleep(1500);
  await page.press('Enter'); // fresh profile: New Game is selected
  check('Enter on the title opens character creation', await waitFor(`!!window.__game.scene.isActive('CharacterCreate')`, 20000));
  await sleep(2000);
  for (let i = 0; i < 30 && (await ev(`window.__game.scene.getScene('CharacterCreate').hc.classId`)) !== CLS; i++) { await page.press('ArrowDown', 50); await sleep(150); }
  check(`↓ reaches ${CLS} in the class list`, (await ev(`window.__game.scene.getScene('CharacterCreate').hc.classId`)) === CLS);
  for (let i = 0; i < 14; i++) await page.press('Backspace', 25);
  for (const ch of 'Wren') await page.press(`Key${ch.toUpperCase()}`, 25);
  await shot('1-create');
  await page.press('Enter');
  check('Begin → world', await waitFor('!!(window.__hc && window.__hc.local() && window.__world)', 120000));
  mark('in the world');
  const hero = await ev(`(async () => (await import('/src/core/index.ts')).Game.state.player.hero?.classId)()`);
  check('hero class is the one picked', hero === CLS, hero);

  // ── 2. opening scene ──
  await waitFor('(async () => (await import("/src/narrative/client/dialogueClient.ts")).dialogueClient.active)()', 8000);
  await shot('2-opening');
  const opening = await lines();
  mark(`opening: ${opening} lines/choices`);
  check('the opening scene can be read through with Space/1', !(await dlg()));

  // ── 3. First Steps from real keys ──
  for (const [keys, ms] of [[['KeyD'], 500], [['KeyA'], 500], [['Space'], 80], [['Digit1'], 80], [['KeyQ'], 80], [['KeyI'], 80]]) { await page.hold(keys, ms); await sleep(500); }
  await sleep(600); await page.press('Escape'); await sleep(600);
  if (await active('Pause')) { await page.press('Escape'); await sleep(400); }
  const tut = await ev(`(async () => { const c = await import('/src/core/index.ts'); return Object.fromEntries(Object.entries(c.Game.state.flags).filter(([k]) => k.startsWith('tut.'))); })()`);
  check('First Steps ticks move/dash/attack/potion/pack from real keys', ['move', 'dash', 'attack', 'potion', 'pack'].every((s) => tut[`tut.${s}`]), JSON.stringify(tut));
  // "pick an order in your journal and track it (J, then T)"
  await page.press('KeyJ'); await sleep(1200); await page.press('KeyT'); await sleep(800); await page.press('Escape'); await sleep(600);
  // "wake a frosted waystone (F)": walk to the nearest one and press F
  const stone = await ev(`(() => { const w = window.__game.scene.getScene('WorldV2'), p = window.__hc.local();
    const all = w.chunks.views().flatMap((c) => c.objects).filter((o) => o.kind === 'waystone').map((o) => ({ id: o.id, x: o.at[0] * 32 + 16, y: o.at[1] * 32 + 16 }));
    return all.sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0] ?? null; })()`);
  if (stone) { await approach(stone.id, stone.x, stone.y); await page.press('KeyF'); await sleep(1200); if (await dlg()) await lines(); }
  const tut2 = await ev(`(async () => { const c = await import('/src/core/index.ts'); return Object.fromEntries(Object.entries(c.Game.state.flags).filter(([k]) => k.startsWith('tut.'))); })()`);
  check('First Steps: J then T tracks a quest, F wakes the waystone', !!tut2['tut.track'] && !!tut2['tut.waystone'], JSON.stringify({ track: tut2['tut.track'], waystone: tut2['tut.waystone'], stone: stone?.id }));
  await shot('3-first-steps');

  // ── 4. follow the tracker ──
  const st0 = await state();
  for (let n = 0; n < MAX_OBJ; n++) {
    const o = await nextObjective();
    if (!o) { note('no active quest to follow'); break; }
    if (o.none) { await sleep(1500); continue; }
    const row = { quest: o.quest, stage: o.stage, kind: o.kind, text: o.text, ok: false };
    log.objectives.push(row);
    mark(`objective: [${o.kind}] ${o.text} (${o.title})`);
    if (o.otherSpace) { row.why = `in ${o.otherSpace}`; note(`objective "${o.text}" is in another space (${o.otherSpace}); stopping the follow here`); break; }
    if (!o.at) { row.why = 'no position to walk to'; note(`objective "${o.text}" has no marker or NPC position a player could be pointed at`); break; }
    const t = Date.now();
    // a search (obj:x-* with an area mark): a player looks around the area for the next one they haven't used yet
    if (o.kind === 'interact' && o.id.endsWith('*')) {
      const next = await ev(`(() => { const w = window.__game.scene.getScene('WorldV2'), p = window.__hc.local(), pre = ${JSON.stringify(o.id.slice(0, -1))}, used = ${JSON.stringify(log.used ?? [])};
        const all = w.chunks.views().flatMap((c) => c.objects).filter((x) => x.id.startsWith(pre) && !used.includes(x.id)).map((x) => ({ id: x.id, x: x.at[0] * 32 + 16, y: x.at[1] * 32 + 16 }));
        return all.sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0] ?? null; })()`);
      if (next) { o.at = [next.x, next.y]; o.id = next.id; (log.used ??= []).push(next.id); }
    }
    const moved = async () => { const a = await nextObjective(); return !a || a.quest !== o.quest || a.stage !== o.stage || a.text !== o.text || (a.count ?? 0) > (o.count ?? 0); };
    const w = await walkTo(o.at[0], o.at[1], { near: o.kind === 'kill' ? 64 : o.kind === 'reach' ? 12 : 48, focusId: o.kind === 'talk' || o.kind === 'interact' ? o.id : null, until: o.kind === 'reach' ? moved : null, reachR: o.kind === 'reach' ? 1 : 1.5 });
    row.walkS = Math.round((Date.now() - t) / 1000); row.stuck = w.stuck;
    if (!w.ok) { row.why = w.why; if (w.why === 'died') { log.deaths++; await page.press('Enter'); await sleep(3000); } continue; }
    if (o.kind === 'talk' || o.kind === 'interact') {
      if (!(await focused(o.id))) await approach(o.id, o.at[0], o.at[1], 30000);
      await page.press('KeyF'); await sleep(900);
      row.lines = await lines();
    } else if (o.kind === 'kill' || o.kind === 'collect') row.fight = await fight(60000, 420);
    await sleep(1200);
    const after = await nextObjective();
    row.ok = !after || after.quest !== o.quest || after.stage !== o.stage || after.text !== o.text || (after.count ?? 0) > (o.count ?? 0);
    mark(`  → ${row.ok ? 'done' : 'not done'} in ${Math.round((Date.now() - t) / 1000)} s (stuck ×${w.stuck}${row.lines ? `, ${row.lines} lines` : ''}${row.fight ? `, ${row.fight}` : ''})`);
  }
  const done = log.objectives.filter((r) => r.ok).length;
  check(`a new player can follow the tracker through ${Math.min(3, MAX_OBJ)}+ objectives by walking and talking`, done >= Math.min(3, MAX_OBJ), log.objectives.map((r) => `${r.kind}:${r.ok ? 'ok' : r.why ?? 'no'}`).join(' '));
  await shot('4-quests');

  // ── 5. first lair: walk to its door, F, fight inside ──
  const door = await ev(`(async () => { const { markerAt } = await import('/src/world/hc/spawns.ts'); const S = (await import('/src/core/index.ts')).classSchool(${JSON.stringify(CLS)}); const p = window.__hc.local();
    const c = ['capital', 'frontier'].map((s) => ({ id: 'obj:' + S + '-' + s + '-lair-1-door', m: markerAt('obj:' + S + '-' + s + '-lair-1-door') })).filter((x) => x.m && x.m.space === window.__world.where().space);
    c.sort((a, b) => Math.hypot(a.m.at[0] * 32 - p.x, a.m.at[1] * 32 - p.y) - Math.hypot(b.m.at[0] * 32 - p.x, b.m.at[1] * 32 - p.y)); return c[0] ? { id: c[0].id, x: c[0].m.at[0] * 32 + 16, y: c[0].m.at[1] * 32 + 16 } : null; })()`);
  if (check('the first lair door is in the start realm', !!door, JSON.stringify(door))) {
    const w = await walkTo(door.x, door.y, { near: 20, focusId: door.id, haul: 40 });
    const space0 = (await ev('window.__world.where()')).space;
    await page.press('KeyF'); await sleep(4000);
    if (await dlg()) await lines();
    const inside = (await ev('window.__world.where()')).space;
    check('F at the lair door takes the hero inside', inside !== space0, `${space0} → ${inside} (walk ok ${w.ok}, stuck ×${w.stuck})`);
    mark(`lair: ${inside}`); await shot('5-lair');
    const k0 = (await ev('window.__hc.counts'))['enemy:killed'] ?? 0;
    // explore toward the boss arena like a player (A* through the lair), fighting what's on the way
    const arena = await ev(`(async () => { const { questPlace } = await import('/src/world/hc/questPlaces.ts'); const sp = window.__world.where().space; const a = questPlace(sp, sp); return a ? [a.at[0] * 32 + 16, a.at[1] * 32 + 16] : null; })()`);
    if (arena) { const wa = await walkTo(arena[0], arena[1], { near: 96, budget: 150000 }); note(`lair: toward the boss arena ${wa.ok ? 'reached' : wa.why} (stuck ×${wa.stuck})`); await fight(30000, 500); }
    else note('lair: no boss arena found by questPlace');
    const kills = ((await ev('window.__hc.counts'))['enemy:killed'] ?? 0) - k0;
    mark(`lair fight: ${kills} kills, deaths so far ${log.deaths + ((await active('Death')) ? 1 : 0)}`);
    note(`first lair: ${kills} kills in ~2 min of real fighting`);
    if (await active('Death')) { log.deaths++; await page.press('Enter'); await sleep(3000); }
  }

  // ── 6. level-ups and a skill point spent by clicking ──
  const st1 = await state();
  mark(`level ${st0.level} → ${st1.level}, gold ${st0.gold} → ${st1.gold}, pack ${st0.pack} → ${st1.pack}`);
  const pts = await ev(`(async () => (await import('/src/systems/rules/character.ts')).availablePoints(window.__hc.character()))()`);
  if (pts > 0) {
    await page.press('KeyK'); await sleep(900); await shot('6-skills');
    const avail = () => ev(`(async () => (await import('/src/systems/rules/character.ts')).availablePoints(window.__hc.character()))()`);
    // the mouse at the spot hc-features uses; if that node isn't learnable in this class's tree, the keyboard path
    // (Claude 3's panelNav): a branch key, then Tab to each node, Enter picks it, Enter again learns it
    await page.click(468, 548); await sleep(250); await page.click(468, 548); await sleep(700);
    let pts2 = await avail(), how = 'mouse';
    for (const branch of ['Digit2', 'Digit1', 'Digit3']) {
      if (pts2 < pts) break;
      await page.press(branch); await sleep(500); how = `keys (branch ${branch.slice(5)})`;
      for (let i = 0; i < 40 && pts2 >= pts; i++) { await page.press('Tab'); await sleep(60); await page.press('Enter'); await sleep(120); await page.press('Enter'); await sleep(200); pts2 = await avail(); }
    }
    check('a skill point can be spent in Skills (K), by click or by keys', pts2 < pts, `${pts} → ${pts2} via ${how}`);
    await page.press('Escape'); await sleep(500);
  } else note(`no level-up in this session (level ${st1.level}); skill-point check skipped`);

  // ── 7. a merchant within reach of the start realm ──
  const shop = await ev(`(async () => { const { HC_SHOPS } = await import('/src/data/items/hc/shops.ts'); const c = await import('/src/core/index.ts'); const { markerAt } = await import('/src/world/hc/spawns.ts');
    const sp = 'realm:' + c.classSchool(${JSON.stringify(CLS)}); return HC_SHOPS.map((s) => ({ s: s.id, home: c.Registry.tryGet('npc', s.npc)?.home })).filter((x) => x.home && markerAt(x.home)?.space === sp).map((x) => x.s); })()`);
  check('a merchant (potions, buys loot) lives in the start realm', shop.length > 0, shop.join(', ') || 'none: every shop is in Concordia');

  // ── 8. death → Death screen → respawn ──
  if (!(await active('Death'))) {
    // creatures don't engage in a 'safe' zone (waystones, villages): step out into the wilds first, like a real death
    for (let i = 0; i < 8 && (await ev('window.__world.where().rule')) === 'safe'; i++) {
      const w0 = await ev('window.__world.where()'); await ev(`window.__world.tp(${w0.tx + 12 * (i % 2 ? -1 : 1)}, ${w0.ty + 10 * (i + 1)})`); await sleep(800);
    }
    await ev(`window.__hc.spawn('bx_${await ev(`(async () => (await import('/src/core/index.ts')).classSchool(${JSON.stringify(CLS)}))()`)}_5', 2, undefined, 60)`);
    // strike first, as a player would: a Shade stealths when out of combat (player.ts) and creatures can't target it
    for (let i = 0; i < 6 && !(await active('Death')); i++) { await fight(3000, 300); await page.press('Digit1'); await sleep(400); }
    await waitFor(`window.__game.scene.isActive('Death')`, 90000);
  }
  if (check('dying shows the Death screen', await active('Death'))) {
    await sleep(1500); await shot('8-death');
    const g0 = (await state()).gold;
    // the killers this test spawned stand at the waystone the hero respawns at: clear them (a real death is elsewhere)
    await despawnNear();
    await page.press('Enter'); await sleep(1200);
    const p = await me();
    check('Enter respawns the hero with full health', !(await active('Death')) && p && !p.dead && p.hp >= p.maxHp * 0.95, JSON.stringify(p && { hp: Math.round(p.hp), max: p.maxHp, dead: p.dead }));
    await despawnNear();
    mark(`respawned; gold ${g0} → ${(await state()).gold}`);
  }

  // ── 9. Pause › Save game → reload → Continue ──
  await page.press('Escape'); await sleep(900);
  if (check('Esc opens Pause', await active('Pause'))) {
    const labels = await ev(`window.__game.scene.getScene('Pause').items.map((i) => i.label.text)`).catch(() => []);
    const idx = Math.max(0, labels.findIndex((l) => /save/i.test(l)));
    for (let i = 0; i < idx; i++) { await page.press('ArrowDown', 50); await sleep(120); }
    await page.press('Enter'); await sleep(1500);
    const before = await state();
    await page.press('Escape'); await sleep(600);
    await page.goto(`${BASE}/`);
    await waitFor(`!!window.__game?.scene.isActive('MainMenu')`, 120000); await sleep(1500);
    await page.press('Enter'); // a save exists: Continue is selected
    check('Continue from the title loads the world', await waitFor('!!(window.__hc && window.__hc.local() && window.__world)', 120000));
    await sleep(3000); if (await dlg()) await lines();
    const after = await state();
    check('Continue: same space and spot (±2 tiles)', after.space === before.space && Math.abs(after.tx - before.tx) <= 2 && Math.abs(after.ty - before.ty) <= 2, `${before.space} ${before.tx},${before.ty} → ${after.space} ${after.tx},${after.ty}`);
    check('Continue: same level, XP, gold and pack', after.level === before.level && after.xp === before.xp && after.gold === before.gold && after.pack === before.pack && after.eq === before.eq, JSON.stringify({ before: [before.level, before.xp, before.gold, before.pack, before.eq], after: [after.level, after.xp, after.gold, after.pack, after.eq] }));
    check('Continue: same quests and stages', JSON.stringify(after.quests) === JSON.stringify(before.quests), Object.keys(before.quests).filter((k) => before.quests[k] !== after.quests[k]).join(', '));
    await shot('9-continued');
  }
} catch (e) { check('harness', false, String(e?.stack ?? e).split('\n').slice(0, 2).join(' < ')); }
const errs = errors.filter((e) => !/auth\/|firestore|Firebase/i.test(e));
check('no console errors', !errs.length, errs.slice(0, 4).join(' | '));
log.errors = errs.slice(0, 20); log.minutes = +((Date.now() - t0) / 60000).toFixed(1);
writeFileSync(`${OUT}/fs-${CLS}.json`, JSON.stringify(log, null, 2));
await page.close();
console.log(`\n${total - fails}/${total} passed`);
process.exit(fails ? 1 : 0);
