/**
 * Shared harness for the features gate (tools/e2e/sim/features.ts): checks, a seeded headless world with real
 * InputFrames, training dummies, and an effect checker that reads what a spell's definition says it does and
 * watches the sim's events and state for each of those effects. No randomness is asserted on.
 */
import { Btn, type InputFrame } from '@/net/types';
import type { Action, CharacterSave, HcSpell } from '@/systems/rules/types';
import { Sim } from '@/systems/sim/Sim';
import type { EnemyEnt, PlayerEnt } from '@/systems/sim/state';
import type { SimPorts } from '@/systems/sim/world';

export const DT = 1000 / 30;
export const SPACE = 't';

// ───────────── checks ─────────────
let checks = 0, fails = 0;
const failed: string[] = [];
export function check(ok: boolean, what: string, why = ''): boolean {
  checks++;
  if (!ok) { fails++; failed.push(what); }
  console.log(ok ? 'ok  ' : 'FAIL', ok || !why ? what : `${what} — ${why}`);
  return ok;
}
export const tally = (): { checks: number; fails: number; failed: string[] } => ({ checks, fails, failed: [...failed] });
export const near = (a: number, b: number, eps = 0.01): boolean => Math.abs(a - b) <= eps;

// ───────────── world ─────────────
export interface Ev { name: string; p: Record<string, unknown> }

export interface World {
  sim: Sim;
  events: Ev[];
  /** one 1/30 s tick; every listed player gets one fresh InputFrame (unlisted players send nothing) */
  tick(input?: Record<string, Partial<InputFrame>>): void;
  /** tick for ms with the same held input (button edges only fire on the first tick) */
  run(ms: number, input?: Record<string, Partial<InputFrame>>): void;
  /** press then release buttons for one player */
  press(pid: string, buttons: number, f?: Partial<InputFrame>): void;
  player(pid: string): PlayerEnt;
  since(i: number, name?: string): Ev[];
}

export function world(opts: { party?: number; seed?: number; rule?: 'safe' | 'wild' } = {}): World {
  const events: Ev[] = [];
  const ports: SimPorts = {
    move: (_s, x, y, dx, dy) => ({ x: x + dx, y: y + dy }), clear: () => true, zoneRule: () => opts.rule ?? 'wild',
    respawnPoint: () => ({ space: SPACE, x: 0, y: 0 }), emit: (name, p) => events.push({ name, p: p as unknown as Record<string, unknown> }),
    partySize: () => opts.party ?? 1, realmRule: () => 'peaceful',
  };
  const sim = new Sim(ports, opts.seed ?? 7);
  let seq = 0, tickNo = 0;
  const frame = (f: Partial<InputFrame>): InputFrame => ({ seq: ++seq, t: 0, move: { x: 0, y: 0 }, aim: { x: 0, y: 40 }, buttons: 0, target: null, ...f });
  const tick = (input: Record<string, Partial<InputFrame>> = {}) => {
    const m = new Map(Object.entries(input).map(([pid, f]) => [pid, [frame(f)]]));
    sim.step(DT, ++tickNo, m);
  };
  return {
    sim, events, tick,
    run(ms, input = {}) { for (let t = 0; t < ms - 1e-6; t += DT) tick(input); },
    press(pid, buttons, f = {}) { tick({ [pid]: { ...f, buttons } }); tick({ [pid]: { ...f, buttons: 0 } }); },
    player: (pid) => sim.w.players.get(`p:${pid}`)!,
    since: (i, name) => events.slice(i).filter((e) => !name || e.name === name),
  };
}

/** Add a hero (trusted save, like the authority's own player) at a point. */
export function hero(w: World, pid: string, save: CharacterSave, x = 0, y = 0): PlayerEnt {
  return w.sim.addPlayer(pid, save, { space: SPACE, x, y });
}

/** A training dummy: a real creature that never moves, never attacks and cannot die. */
export function dummy(w: World, x: number, y: number, level = 1, creatureId = 'bx_wolf'): EnemyEnt {
  const id = w.sim.spawn({ creature: creatureId, level, space: SPACE, x, y, dormant: true });
  const e = w.sim.w.enemies.get(id)!;
  e.maxHp = e.hp = 1e9;
  e.dmg = 0;
  e.cdef = { ...e.cdef, ai: { ...e.cdef.ai, speed: 0, immobile: true, attackRange: 0, aggro: 0 }, abilities: [], phases: [], onDeath: [], lowHp: [] };
  return e;
}

// ───────────── spell effects ─────────────
export type Effect = 'damage' | 'status' | 'heal' | 'shield' | 'buff' | 'zone' | 'decoy' | 'summon' | 'move' | 'displace' | 'momentum' | 'stamina' | 'ember' | 'cooldowns' | 'revive' | 'steal';

export interface Expect { effects: Set<Effect>; statuses: Set<string>; buffs: Set<string> }

/** What a spell's actions say it does (recursing into delays, repeats, movement paths, zones and projectile hits). */
export function expectedEffects(spell: HcSpell): Expect {
  const out: Expect = { effects: new Set(), statuses: new Set(), buffs: new Set() };
  const status = (id: string, chance?: number) => { if (chance === undefined || chance >= 1) { out.effects.add('status'); out.statuses.add(id); } };
  const walk = (acts: Action[] | undefined): void => {
    for (const a of acts ?? []) {
      switch (a.a) {
        case 'damage': out.effects.add('damage'); for (const s of a.status ?? []) status(s.id, s.chance); break;
        case 'projectile': out.effects.add('damage'); for (const s of a.status ?? []) status(s.id, s.chance); walk(a.onHit); break;
        case 'chain': out.effects.add('damage'); for (const s of a.status ?? []) status(s.id, s.chance); break;
        case 'status': status(a.status.id, a.status.chance); break;
        case 'heal': out.effects.add('heal'); break;
        case 'shield': out.effects.add('shield'); break;
        case 'buff': out.effects.add('buff'); out.buffs.add(a.id); break;
        case 'zone': out.effects.add(a.kind === 'decoy' ? 'decoy' : 'zone'); walk(a.each); walk(a.trigger); break;
        case 'summon': out.effects.add('summon'); break;
        case 'move': out.effects.add('move'); walk(a.path); walk(a.land); break;
        case 'pull': case 'knock': out.effects.add('displace'); break;
        case 'resource':
          if (a.momentum) out.effects.add('momentum');
          if (a.stamina) out.effects.add('stamina');
          if (a.ember) out.effects.add('ember');
          break;
        case 'cooldowns': out.effects.add('cooldowns'); break;
        case 'revive': out.effects.add('revive'); break;
        case 'steal': if (a.gold) out.effects.add('steal'); break;
        case 'delay': case 'repeat': walk(a.then); break;
        case 'cleanse': break;
      }
    }
  };
  walk(spell.actions);
  return out;
}

/** Watches one cast: construct it just before the cast, sample() after every tick, then missing(). */
export class EffectWatch {
  private ev0: number;
  private st0: number; private gold0: number; private em0: number;
  private x0: number; private y0: number;
  private dummy0: Map<string, { x: number; y: number }>;
  private buffs = new Set<string>();
  private zones = false; private decoy = false; private summon = false; private shield = false;
  private moved = 0; private displaced = 0; private momentum = 0; private stamina = 0;

  constructor(private w: World, private p: PlayerEnt, private dummies: EnemyEnt[], private ally?: PlayerEnt) {
    this.ev0 = w.events.length;
    this.st0 = p.stamina; this.gold0 = p.save.gold; this.em0 = p.ember;
    this.x0 = p.x; this.y0 = p.y;
    this.dummy0 = new Map(dummies.map((d) => [d.id, { x: d.x, y: d.y }]));
  }

  sample(): void {
    const p = this.p, w = this.w.sim.w;
    for (const b of p.buffs) this.buffs.add(b.id);
    for (const z of w.zones.values()) if (z.cast.caster === p) this.zones = true;
    for (const e of w.enemies.values()) {
      if (e.ownerId !== p.id) continue;
      if (e.def === p.def) this.decoy = true; else if (e.def !== 'pet:hawk' && !e.storyPet) this.summon = true;
    }
    if (p.shield > 0) this.shield = true;
    this.moved = Math.max(this.moved, Math.hypot(p.x - this.x0, p.y - this.y0));
    for (const d of this.dummies) { const o = this.dummy0.get(d.id)!; this.displaced = Math.max(this.displaced, Math.hypot(d.x - o.x, d.y - o.y)); }
    this.momentum = Math.max(this.momentum, p.momentum);
    this.stamina = Math.max(this.stamina, p.stamina - this.st0);
  }

  /** Effects (and statuses / buffs) the definition promised that the sim never showed. */
  missing(exp: Expect, extra: { cooldownsReset?: () => boolean } = {}): string[] {
    const ev = this.w.events.slice(this.ev0), p = this.p;
    const ids = new Set(this.dummies.map((d) => d.id));
    const miss: string[] = [];
    const seen: Record<Effect, () => boolean> = {
      damage: () => ev.some((e) => e.name === 'combat:hit' && e.p.sourceId === p.id && ids.has(String(e.p.targetId)) && e.p.kind === 'dmg' && Number(e.p.amount) > 0),
      status: () => true, // per status below
      heal: () => ev.some((e) => e.name === 'combat:hit' && e.p.sourceId === p.id && e.p.kind === 'heal'),
      shield: () => this.shield,
      buff: () => true, // per buff below
      zone: () => this.zones,
      decoy: () => this.decoy,
      summon: () => this.summon,
      move: () => this.moved >= 15,
      displace: () => this.displaced >= 5,
      momentum: () => this.momentum > 0,
      stamina: () => this.stamina > 20,
      ember: () => p.ember > this.em0,
      cooldowns: () => extra.cooldownsReset?.() ?? false,
      revive: () => !!this.ally && !this.ally.downed && !this.ally.dead,
      steal: () => p.save.gold > this.gold0,
    };
    for (const e of exp.effects) if (!seen[e]()) miss.push(e);
    for (const s of exp.statuses) {
      if (!ev.some((e) => e.name === 'status:changed' && ids.has(String(e.p.entityId)) && e.p.status === s && Number(e.p.stacks) > 0)) miss.push(`status:${s}`);
    }
    for (const b of exp.buffs) if (!this.buffs.has(b)) miss.push(`buff:${b}`);
    return miss;
  }
}

export const CAST_BTN = [Btn.CAST1, Btn.CAST2, Btn.CAST3, Btn.CAST4] as const;
export const describe = (e: Expect): string => [...e.effects].map(String).filter((x) => x !== 'status' && x !== 'buff')
  .concat([...e.statuses].map((s) => `status:${s}`), [...e.buffs].map((b) => `buff:${b}`)).join('+') || 'none';
