/**
 * Hitbox test harness (Claude 3 helper): a headless world on the real authority Sim, inert dummy bodies, input
 * frames, and "did this effect reach that body" from the sim's own events. No geometry here (see hitboxes-shapes.ts).
 */
import { Btn, type InputFrame, type RealmRule } from '@/net/types';
import { newCharacter } from '@/systems/rules/character';
import type { GameEventName, GameEvents } from '@/core/events';
import { allCreatures, type CreatureDef } from '@/systems/rules/creatures';
import { Sim } from '@/systems/sim/Sim';
import type { EnemyEnt, PlayerEnt } from '@/systems/sim/state';
import type { SimPorts } from '@/systems/sim/world';

export const DT = 1000 / 30;
export const SEED = 7;

// ───────────── checks ─────────────
export const tally = { checks: 0, fails: 0, probes: 0 };
export function check(ok: boolean, what: string, detail: string[] = []): boolean {
  tally.checks++;
  if (!ok) tally.fails++;
  console.log(ok ? 'ok  ' : 'FAIL', what);
  // details are indented and never start with "FAIL" (the pre-deploy runner reads line starts)
  if (!ok) for (const d of detail.slice(0, Number(process.env.HB_DETAIL ?? 14))) console.log(`       - ${d}`);
  if (!ok && detail.length > Number(process.env.HB_DETAIL ?? 14)) console.log(`       - … and ${detail.length - Number(process.env.HB_DETAIL ?? 14)} more`);
  return ok;
}

/** Findings collected across a section, reported as one aggregated check per category. */
export class Findings {
  readonly items = new Map<string, string[]>();
  readonly tried = new Map<string, number>();
  add(cat: string, ok: boolean, line: string): void {
    this.tried.set(cat, (this.tried.get(cat) ?? 0) + 1);
    if (!ok) { const l = this.items.get(cat) ?? []; l.push(line); this.items.set(cat, l); }
  }
  report(cat: string, what: string): void {
    const n = this.tried.get(cat) ?? 0;
    if (!n) return;
    const bad = this.items.get(cat) ?? [];
    check(!bad.length, `${what} (${n - bad.length}/${n} probes)`, bad);
  }
}

// ───────────── world ─────────────
export interface Ev { name: GameEventName; p: GameEvents[GameEventName] }

export class World {
  readonly sim: Sim;
  readonly events: Ev[] = [];
  private seq = 0;
  private tick = 0;
  constructor(readonly rule: RealmRule = 'peaceful', party = 1) {
    const ports: SimPorts = {
      move: (_s, x, y, dx, dy) => ({ x: x + dx, y: y + dy }), clear: () => true, zoneRule: () => 'wild',
      respawnPoint: () => ({ space: 't', x: 0, y: 0 }), emit: (name, p) => { this.events.push({ name, p }); },
      partySize: () => party, realmRule: () => rule,
    };
    this.sim = new Sim(ports, SEED);
  }
  get t(): number { return this.sim.w.t; }

  /** A level-10 hero with no tree; huge HP so creature tests never down it. */
  hero(id: string, classId: string, x = 0, y = 0, tough = false): PlayerEnt {
    const p = this.sim.addPlayer(id, { ...newCharacter(classId), level: 10, gold: 100 }, { space: 't', x, y });
    p.spawnProtectUntil = 0;
    if (tough) { p.maxHp = 1e9; p.hp = 1e9; }
    return p;
  }

  /** A real creature at (x, y). inert: no AI movement, attacks or abilities, effectively unkillable. */
  creature(def: CreatureDef, x: number, y: number, inert = true): EnemyEnt {
    const id = this.sim.spawn({ creature: def.id, level: 10, space: 't', x, y });
    const e = this.sim.w.enemies.get(id);
    if (!e) throw new Error(`spawn failed: ${def.id}`);
    e.hp = e.maxHp = 1e9;
    if (inert) {
      e.cdef = { ...e.cdef, abilities: [], phases: [], onDeath: [], lowHp: [], ai: { ...e.cdef.ai, speed: 0, ranged: false, attackRange: -1e9 } };
      e.attackReadyAt = Infinity;
    }
    return e;
  }

  /** One tick with these frames (playerId → partial frame). */
  step(input: Record<string, Partial<InputFrame>> = {}): void {
    this.tick++;
    const m = new Map(Object.entries(input).map(([pid, f]) => [pid, [{ seq: ++this.seq, t: 0, move: { x: 0, y: 0 }, aim: { x: 0, y: 0 }, buttons: 0, target: null, ...f } as InputFrame]]));
    this.sim.step(DT, this.tick, m);
  }
  run(ms: number): void { for (let t = 0; t < ms; t += DT) this.step(); }
  /** Press buttons for one tick (an edge), then release on the next. */
  press(pid: string, f: Partial<InputFrame>): void {
    this.step({ [pid]: f });
    this.step({ [pid]: { ...f, buttons: 0 } });
  }

  /** Did anything `from` did reach `targetId`? damage/block/immune hit, a status, a push, or a theft. */
  reached(targetId: string, from: string, since = 0, pos0?: { x: number; y: number }): boolean {
    for (const e of this.events.slice(since)) {
      if (e.name === 'combat:hit') {
        const h = e.p as GameEvents['combat:hit'];
        if (h.targetId === targetId && h.sourceId === from && h.kind !== 'heal') return true;
      }
      if (e.name === 'status:changed') {
        const s = e.p as GameEvents['status:changed'];
        if (s.entityId === targetId && s.stacks > 0) return true;
      }
    }
    const c = this.sim.w.combatant(targetId);
    return !!(c && pos0 && Math.hypot(c.x - pos0.x, c.y - pos0.y) > 0.5);
  }
  /** Gold stolen by / from a player (steal actions). */
  goldMoved(playerId: string, since = 0): boolean {
    return this.events.slice(since).some((e) => e.name === 'loot:granted' && (e.p as GameEvents['loot:granted']).playerId === playerId && !!(e.p as GameEvents['loot:granted']).gold);
  }
}

export const BTN = Btn;

// ───────────── test bodies ─────────────
/** Smallest and largest creature bodies with no passive rule switches (nothing that dodges, blocks or absorbs). */
export function testBodies(): CreatureDef[] {
  const plain = allCreatures().filter((c) => !c.hooks.length && c.id.startsWith('bx_'));
  const by = [...plain].sort((a, b) => a.radius - b.radius || a.id.localeCompare(b.id));
  return [by[0], by[by.length - 1]];
}
