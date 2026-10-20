/**
 * PvP duel matrix (Claude 5 for Claude 1, 2026-10-21; report only — the user decides how much to trust PvP under power
 * fantasy). Every class pair (24 × 24, mirrors included) at L20 and L40 with builds-make's typical build and gear,
 * through the real duel rules: realmRule 'duels', both heroes duelWith each other, the duel ends at 1 HP (sim/coop.ts
 * pvpDeath), hard CC halved between players (sim/combat.ts). Two bots play builds-fight.ts's Bot logic aimed at each
 * other (casts, slash, potions, dodge the other's wind-ups, ranged kiting). Per duel: winner, time to kill, one-shot
 * (from ≥ 95% health to the duel's end within 2 s), no kill in 120 s, and stun-lock (the longest unbroken hard-CC chain
 * on a hero, and the share of the fight spent under hard CC).
 *   node tools/e2e/sim/run.mjs pvp-duels [classId…]      → tools/e2e/out/pvp-duels.md   (SEEDS=n, default 2; sides swap)
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { CLASS_SCHOOL } from '@/core/constants';
import { Btn, type InputFrame } from '@/net/types';
import { hasSlash } from '@/systems/rules/slash';
import type { CharacterSave } from '@/systems/rules/types';
import { Sim } from '@/systems/sim/Sim';
import type { PlayerEnt } from '@/systems/sim/state';
import type { SimPorts } from '@/systems/sim/world';
import { CAST, chooseSlot, DT } from './builds-fight';
import { seedOf, typicalBuild } from './builds-make';

const LEVELS = [20, 40] as const;
const SEEDS = Number(process.env.SEEDS) || 2;
const CAP_S = 120, ONE_SHOT_MS = 2000, LOCK_MS = 3000;
const HARD = ['stun', 'freeze', 'knockdown', 'sleep', 'root', 'taunt', 'confuse'];
const args = process.argv.slice(3);
const CLASSES = args.length ? args : Object.keys(CLASS_SCHOOL);

interface Duel { winner: 0 | 1 | -1; secs: number; oneShot: boolean; lockMs: number[]; ccShare: number[]; dealt: number[]; healed: number[]; crash?: string }

function duel(a: CharacterSave, b: CharacterSave, seed: number): Duel {
  let ended: { winner: string } | null = null;
  const dealt = [0, 0], healed = [0, 0];
  const ports: SimPorts = {
    move: (_s, x, y, dx, dy) => ({ x: Math.max(-600, Math.min(600, x + dx)), y: Math.max(-600, Math.min(600, y + dy)) }),
    clear: () => true, zoneRule: () => 'wild', respawnPoint: () => ({ space: 'test', x: 0, y: 0 }),
    emit: (name, p) => {
      if (name === 'duel:ended') ended = p as { winner: string };
      if (name === 'combat:hit') {
        const h = p as { sourceId: string; targetId: string; amount: number; kind?: string };
        const s = h.sourceId === 'p:a' ? 0 : h.sourceId === 'p:b' ? 1 : -1, tg = h.targetId === 'p:a' ? 0 : h.targetId === 'p:b' ? 1 : -1;
        if (h.kind === 'dmg' && s >= 0 && tg === 1 - s) dealt[s] += h.amount;
        if (h.kind === 'heal' && tg >= 0) healed[tg] += h.amount;
      }
    },
    partySize: () => 2, realmRule: () => 'duels',
  };
  const sim = new Sim(ports, seed);
  sim.shopEnv = { flag: () => false, priceMult: () => 1 };
  const ids = ['a', 'b'];
  const ps: PlayerEnt[] = [sim.addPlayer('a', structuredClone(a), { space: 'test', x: -90, y: 0 }), sim.addPlayer('b', structuredClone(b), { space: 'test', x: 90, y: 0 })];
  ps[0].duelWith = ps[1].id; ps[1].duelWith = ps[0].id;
  for (const p of ps) p.spawnProtectUntil = 0;
  const seq = [0, 0], held = [0, 0], fullAt = [0, 0], lockStart = [-1, -1], lockMs = [0, 0], ccMs = [0, 0];
  let oneShot = false;
  for (let tick = 1; tick <= 30 * CAP_S; tick++) {
    if (ended) break;
    const frames = new Map<string, InputFrame[]>();
    ps.forEach((p, i) => {
      const o = ps[1 - i], d = Math.hypot(o.x - p.x, o.y - p.y) || 1;
      if (p.hp >= p.maxHp * 0.95) fullAt[i] = sim.w.t;
      const cc = HARD.some((s) => p.statuses.has(s as never));
      if (cc) { ccMs[i] += DT; if (lockStart[i] < 0) lockStart[i] = sim.w.t; lockMs[i] = Math.max(lockMs[i], sim.w.t - lockStart[i]); } else lockStart[i] = -1;
      let buttons = Btn.ATTACK, mx = 0, my = 0;
      if (tick % 15 === (i * 7) % 15) { const s = chooseSlot(sim, p); if (s !== undefined) buttons |= CAST[s]; }
      if (hasSlash(p.save.classId) && tick % 2 === 0 && sim.w.t >= (p.cds.get('slash') ?? 0)) buttons |= Btn.SLASH;
      if (p.hp < p.maxHp * 0.4) buttons |= Btn.POTION_Q;
      if (p.ember < 20) buttons |= Btn.POTION_E;
      const winding = o.windup && d < 320;
      if (winding && tick % 4 === 0) buttons |= Btn.DASH;
      const melee = !['bow', 'staff', 'wand'].includes(p.weapon.type);
      if (!melee && d < 120) { mx = (p.x - o.x) / d; my = (p.y - o.y) / d; } else if (melee && d > 60) { mx = (o.x - p.x) / d; my = (o.y - p.y) / d; } else if (!melee && d > 300) { mx = (o.x - p.x) / d; my = (o.y - p.y) / d; }
      if (winding) { mx = (p.x - o.x) / d - (p.y - o.y) / d * 0.5; my = (p.y - o.y) / d + (p.x - o.x) / d * 0.5; }
      frames.set(ids[i], [{ seq: ++seq[i], t: sim.w.t, move: { x: mx, y: my }, aim: { x: o.x, y: o.y }, buttons: (buttons & ~held[i]) | (buttons & Btn.ATTACK), target: o.id }]);
      held[i] = buttons & ~Btn.ATTACK;
    });
    try {
      sim.step(DT, tick, frames);
      if (held.some(Boolean)) { sim.step(0.0001, tick, new Map([...frames].map(([id, [f]]) => [id, [{ ...f, seq: ++seq[ids.indexOf(id)], buttons: Btn.ATTACK }]]))); held.fill(0); }
    } catch (e) { return { winner: -1, secs: Math.round(tick / 30), oneShot: false, lockMs, ccShare: [0, 0], dealt, healed, crash: (e as Error).stack?.split('\n').slice(0, 3).join(' | ') }; }
    if (ended) {
      const w = ids.indexOf((ended as { winner: string }).winner) as 0 | 1, loser = 1 - w;
      oneShot = sim.w.t - fullAt[loser] <= ONE_SHOT_MS;
      const secs = sim.w.t / 1000;
      return { winner: w, secs, oneShot, lockMs, ccShare: ccMs.map((m) => m / Math.max(1, sim.w.t)), dealt, healed };
    }
  }
  return { winner: -1, secs: CAP_S, oneShot: false, lockMs, ccShare: ccMs.map((m) => m / Math.max(1, sim.w.t)), dealt, healed };
}

// ───────────── matrix ─────────────
const t0 = Date.now();
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
const perClass = new Map<string, { dps: number[]; hps: number[]; cc: number[] }>();
interface Cell { a: string; b: string; L: number; wins: [number, number]; draws: number; secs: number[]; oneShots: string[]; maxLock: number; lockBy: string; crashes: number }
const cells: Cell[] = [];
for (const L of LEVELS) {
  const saves = new Map(CLASSES.map((c) => [c, typicalBuild(c, L).save]));
  for (let i = 0; i < CLASSES.length; i++) for (let j = i; j < CLASSES.length; j++) {
    const a = CLASSES[i], b = CLASSES[j];
    const c: Cell = { a, b, L, wins: [0, 0], draws: 0, secs: [], oneShots: [], maxLock: 0, lockBy: '', crashes: 0 };
    for (let k = 0; k < SEEDS; k++) {
      const swap = k % 2 === 1;
      const r = duel(saves.get(swap ? b : a)!, saves.get(swap ? a : b)!, seedOf('pvp', a, b, L, k));
      if (r.crash) { c.crashes++; continue; }
      [0, 1].forEach((s) => { const who = `${(swap ? 1 - s : s) === 0 ? a : b}@${L}`, pc = perClass.get(who) ?? { dps: [], hps: [], cc: [] }; pc.dps.push(r.dealt[s] / Math.max(1, r.secs)); pc.hps.push(r.healed[s] / Math.max(1, r.secs)); pc.cc.push(r.ccShare[s]); perClass.set(who, pc); });
      const w = r.winner < 0 ? -1 : (swap ? 1 - r.winner : r.winner);
      if (w < 0) c.draws++; else { c.wins[w as 0 | 1]++; c.secs.push(r.secs); if (r.oneShot) c.oneShots.push(`${w === 0 ? a : b} one-shot ${w === 0 ? b : a} (${r.secs.toFixed(1)} s)`); }
      // the lock suffered by each side (indices follow the swap)
      [0, 1].forEach((s) => { const victim = (swap ? 1 - s : s) === 0 ? a : b, by = victim === a ? b : a; if (r.lockMs[s] > c.maxLock) { c.maxLock = r.lockMs[s]; c.lockBy = `${by} on ${victim}`; } });
    }
    cells.push(c);
  }
  console.log(`L${L}: ${cells.filter((c) => c.L === L).length} pairs`);
}

// ───────────── report ─────────────
const md: string[] = ['# PvP duel matrix', '', `Generated by tools/e2e/sim/pvp-duels.ts (${SEEDS} duels per pair, sides swapped; typical build and gear; real duel rules). ` +
  `One-shot = the loser went from ≥ 95% health to the duel's end within ${ONE_SHOT_MS / 1000} s. No kill = 120 s without a result. Stun-lock = a hero held by hard CC for ≥ ${LOCK_MS / 1000} s without a break.`, ''];
for (const L of LEVELS) {
  const cs = cells.filter((c) => c.L === L), duels = cs.reduce((a, c) => a + c.wins[0] + c.wins[1] + c.draws, 0);
  const ttk = cs.flatMap((c) => c.secs).sort((x, y) => x - y);
  const record = new Map(CLASSES.map((x) => [x, { w: 0, l: 0, d: 0 }]));
  for (const c of cs) {
    if (c.a === c.b) { record.get(c.a)!.d += c.draws; continue; }
    record.get(c.a)!.w += c.wins[0]; record.get(c.a)!.l += c.wins[1]; record.get(c.b)!.w += c.wins[1]; record.get(c.b)!.l += c.wins[0]; record.get(c.a)!.d += c.draws; record.get(c.b)!.d += c.draws;
  }
  const oneShots = cs.flatMap((c) => c.oneShots), noKill = cs.filter((c) => c.draws > 0), locks = cs.filter((c) => c.maxLock >= LOCK_MS);
  md.push(`## L${L}`, '', `- ${duels} duels; median time to kill ${ttk[ttk.length >> 1]?.toFixed(1) ?? '—'} s (10th–90th percentile ${ttk[Math.floor(ttk.length * 0.1)]?.toFixed(1)}–${ttk[Math.floor(ttk.length * 0.9)]?.toFixed(1)} s)`,
    `- one-shots: ${oneShots.length}${oneShots.length ? ` — ${oneShots.slice(0, 12).join('; ')}${oneShots.length > 12 ? '; …' : ''}` : ''}`,
    `- no kill in ${CAP_S} s: ${noKill.length} pairs${noKill.length ? ` — ${noKill.slice(0, 15).map((c) => `${c.a} vs ${c.b}`).join(', ')}${noKill.length > 15 ? ', …' : ''}` : ''}`,
    `- stun-locks (≥ ${LOCK_MS / 1000} s unbroken): ${locks.length} pairs${locks.length ? ` — ${locks.sort((x, y) => y.maxLock - x.maxLock).slice(0, 10).map((c) => `${c.lockBy} ${(c.maxLock / 1000).toFixed(1)} s`).join(', ')}` : ''}`,
    `- crashes: ${cs.reduce((a, c) => a + c.crashes, 0)}`, '');
  md.push('| class | wins | losses | no kill | win rate (non-mirror) | damage / s on the foe | healing / s | time under hard CC |', '|---|---|---|---|---|---|---|---|');
  for (const [cls, r] of [...record].sort((x, y) => y[1].w / Math.max(1, y[1].w + y[1].l) - x[1].w / Math.max(1, x[1].w + x[1].l))) { const pc = perClass.get(`${cls}@${L}`); md.push(`| ${cls} | ${r.w} | ${r.l} | ${r.d} | ${((r.w / Math.max(1, r.w + r.l)) * 100).toFixed(0)}% | ${pc ? mean(pc.dps).toFixed(0) : '—'} | ${pc ? mean(pc.hps).toFixed(0) : '—'} | ${pc ? (mean(pc.cc) * 100).toFixed(0) + '%' : '—'} |`); }
  md.push('', `### L${L} matrix (row's wins − losses vs column; · = even, ∞ = no kill)`, '', '| | ' + CLASSES.map((c) => c.slice(0, 4)).join(' | ') + ' |', '|---|' + CLASSES.map(() => '---|').join(''));
  for (const a of CLASSES) md.push(`| ${a} | ${CLASSES.map((b) => { const c = cs.find((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a))!; if (!c) return ''; const [wa, wb] = c.a === a ? c.wins : [c.wins[1], c.wins[0]]; return c.draws && !wa && !wb ? '∞' : wa === wb ? '·' : String(wa - wb); }).join(' | ')} |`);
  md.push('');
}
mkdirSync('tools/e2e/out', { recursive: true });
writeFileSync('tools/e2e/out/pvp-duels.md', md.join('\n'));
console.log(`report tools/e2e/out/pvp-duels.md · run time ${((Date.now() - t0) / 1000).toFixed(1)} s`);
