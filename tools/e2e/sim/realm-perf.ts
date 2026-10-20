/**
 * Sim cost at public-realm scale (Claude 3): N bot heroes in one authority Sim, moving, fighting and casting against
 * packs that respawn, in one space or spread over several. Measures tick ms (median / p99), snapshot bytes per viewer
 * (collect → JSON) and heap growth over a stretch of sim time.
 *   node tools/e2e/sim/run.mjs realm-perf [gate|full] [players…]     gate: 25 players · 60 s, budget p99 < 16 ms
 * Output follows the gate convention: "FAIL" lines, run time, last line "N/M passed".
 * Profile: node --cpu-prof node_modules/.cache/sim/realm-perf.mjs full 25
 */
import { CLASS_SCHOOL } from '@/core/constants';
import { Btn, type InputFrame } from '@/net/types';
import { newCharacter } from '@/systems/rules/character';
import { Sim } from '@/systems/sim/Sim';
import type { SimPorts } from '@/systems/sim/world';

const [mode = 'gate', ...rest] = process.argv.slice(3);
const SIZES = rest.length ? rest.map(Number) : mode === 'full' ? [1, 10, 25, 50] : [25];
const SECONDS = mode === 'full' ? 300 : 60;
const DT = 1000 / 30;
const BUDGET_P99 = 16, BUDGET_SNAPSHOT = 24_000;
const CLASSES = Object.keys(CLASS_SCHOOL);

let fails = 0, checks = 0;
const check = (ok: boolean, what: string, why = '') => { checks++; if (!ok) fails++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}${why ? ` — ${why}` : ''}`); };

interface Result { players: number; spaces: number; medianMs: number; p99Ms: number; maxMs: number; snapBytes: number; heapMb: number; enemies: number }

function run(players: number, spaces: number): Result {
  const ports: SimPorts = {
    move: (_s, x, y, dx, dy) => ({ x: Math.max(-1500, Math.min(1500, x + dx)), y: Math.max(-1500, Math.min(1500, y + dy)) }),
    clear: () => true, zoneRule: () => 'wild', respawnPoint: () => ({ space: 's0', x: 0, y: 0 }), emit: () => {},
    partySize: () => 1, realmRule: () => 'peaceful',
  };
  const sim = new Sim(ports, 7);
  const ids: string[] = [];
  for (let i = 0; i < players; i++) {
    const id = `h${i}`, space = `s${i % spaces}`;
    sim.addPlayer(id, { ...newCharacter(CLASSES[i % CLASSES.length]), level: 20 }, { space, x: (i % 7) * 60 - 180, y: Math.floor(i / 7) * 60 - 180 });
    ids.push(id);
  }
  // three creatures per hero around its space, topped up as they die (a busy public realm)
  const want = players * 3;
  const topUp = () => {
    let alive = 0;
    for (const e of sim.w.enemies.values()) if (!e.dead && !e.ownerId) alive++;
    for (let k = alive; k < want; k++) {
      const s = `s${k % spaces}`, a = (k * 2.399) % (Math.PI * 2), r = 250 + (k % 5) * 60;
      sim.spawn({ creature: 'bx_wolf', level: 20, space: s, x: Math.cos(a) * r, y: Math.sin(a) * r });
    }
  };
  topUp();
  let seq = 0;
  const times: number[] = [];
  const ticks = Math.round((SECONDS * 1000) / DT);
  const gc = (globalThis as { gc?: () => void }).gc;
  gc?.();
  const heap0 = process.memoryUsage().heapUsed;
  for (let t = 1; t <= ticks; t++) {
    const inputs = new Map<string, InputFrame[]>();
    for (let i = 0; i < ids.length; i++) {
      const p = sim.w.players.get(`p:${ids[i]}`);
      if (!p) continue;
      // walk in slow circles, aim at the nearest creature, cast one of 1–3 now and then, dash sometimes
      const ang = (t / 90 + i) % (Math.PI * 2);
      let near: { id: string; x: number; y: number } | null = null, best = 1e12;
      for (const e of sim.w.enemies.values()) {
        if (e.dead || e.space !== p.space) continue;
        const d = (e.x - p.x) ** 2 + (e.y - p.y) ** 2;
        if (d < best) { best = d; near = e; }
      }
      const cast = t % 45 === (i % 45) ? [Btn.CAST1, Btn.CAST2, Btn.CAST3][(t / 45 + i) % 3 | 0] : 0;
      const dash = t % 150 === (i % 150) ? Btn.DASH : 0;
      inputs.set(ids[i], [{ seq: ++seq, t: 0, move: { x: Math.cos(ang) * 0.6, y: Math.sin(ang) * 0.6 }, aim: near ? { x: near.x, y: near.y } : { x: p.x, y: p.y + 40 }, buttons: cast | dash | Btn.ATTACK, target: near?.id ?? null }]);
      if (p.dead) sim.receive({ type: 'act', domain: 'systems', action: 'respawn', args: {} } as never, ids[i]);
    }
    const t0 = performance.now();
    sim.step(DT, t, inputs);
    times.push(performance.now() - t0);
    if (t % 30 === 0) topUp();
  }
  let snap = 0;
  for (const id of ids.slice(0, Math.min(ids.length, 10))) snap = Math.max(snap, JSON.stringify(sim.collect(id)).length);
  gc?.();
  const heapMb = (process.memoryUsage().heapUsed - heap0) / 1048576;
  times.sort((a, b) => a - b);
  const q = (f: number) => times[Math.min(times.length - 1, Math.floor(times.length * f))];
  return { players, spaces, medianMs: q(0.5), p99Ms: q(0.99), maxMs: times[times.length - 1], snapBytes: snap, heapMb, enemies: sim.w.enemies.size };
}

const t0 = Date.now();
const rows: Result[] = [];
for (const n of SIZES) {
  rows.push(run(n, 1));
  if (n >= 10) rows.push(run(n, Math.max(2, Math.round(n / 10))));
}
for (const r of rows) {
  console.log(`# ${String(r.players).padStart(2)} heroes · ${r.spaces} space${r.spaces > 1 ? 's' : ''} · tick median ${r.medianMs.toFixed(2)} ms p99 ${r.p99Ms.toFixed(2)} ms max ${r.maxMs.toFixed(1)} ms · snapshot ≤ ${r.snapBytes} B/viewer · heap +${r.heapMb.toFixed(1)} MB over ${SECONDS} s · ${r.enemies} creatures`);
}
const gate = rows.find((r) => r.players === 25 && r.spaces === 1);
if (gate) {
  check(gate.p99Ms < BUDGET_P99, `25 heroes in one space: tick p99 < ${BUDGET_P99} ms`, `${gate.p99Ms.toFixed(2)} ms`);
  check(gate.snapBytes < BUDGET_SNAPSHOT, `25 heroes in one space: snapshot < ${BUDGET_SNAPSHOT} B per viewer`, `${gate.snapBytes} B`);
}
check(rows.every((r) => Number.isFinite(r.p99Ms)), 'no crash', `${rows.length} runs`);
if (fails) process.exitCode = 1;
console.log(`run time ${((Date.now() - t0) / 1000).toFixed(1)} s — ${fails ? `FAILED (${fails})` : 'OK'}`);
console.log(`${checks - fails}/${checks} passed`);
