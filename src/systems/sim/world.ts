/**
 * SimWorld (Claude 3): containers, ids, ports to the outside (world collision, events, net) and shared queries.
 * Import only Phaser-free modules here (never the '@/core' barrel, which pulls in Vite-only code).
 */
import { Rng } from '@/core/rng';
import type { GameEventName, GameEvents } from '@/core/events';
import type { RealmRule } from '@/net/types';
import { compile, evalCond, type CondCtx } from '@/systems/rules/stats';
import type { Passive } from '@/systems/rules/types';
import type { Combatant, EnemyEnt, LootEnt, PlayerEnt, ProjectileEnt, Vec, ZoneEnt } from './state';

export type ZoneRule = 'safe' | 'arena' | 'wild';

/** Everything the sim needs from outside. Production wires these to Services/bus; tests stub them. */
export interface SimPorts {
  /** slide a circle of radius r from (x,y) by (dx,dy) against world collision */
  move(space: string, x: number, y: number, dx: number, dy: number, r: number): Vec;
  /** true when nothing blocks a shot between the two points */
  clear(space: string, x0: number, y0: number, x1: number, y1: number): boolean;
  zoneRule(space: string, x: number, y: number): ZoneRule;
  respawnPoint(playerId: string): { space: string; x: number; y: number };
  emit<K extends GameEventName>(name: K, payload: GameEvents[K]): void;
  partySize(): number;
  realmRule(): RealmRule;
  /** world A* between two points (px waypoints, tile centres), null when unreachable; absent in headless tests */
  path?(space: string, x0: number, y0: number, x1: number, y1: number): Vec[] | null;
}

export class SimWorld {
  t = 0;
  tick = 0;
  frozen = false;
  /** authority story flags (set by Sim from its shop/story env) */
  flag: (key: string) => unknown = () => undefined;
  readonly rng: Rng;
  readonly players = new Map<string, PlayerEnt>();
  /** creatures and pets */
  readonly enemies = new Map<string, EnemyEnt>();
  readonly projectiles = new Map<string, ProjectileEnt>();
  readonly zones = new Map<string, ZoneEnt>();
  readonly loot = new Map<string, LootEnt>();
  /** arena hazards in boss rooms (sim/hazards.ts) */
  readonly hazards = new Map<string, import('./hazards').HazardEnt>();
  private seq = 0;
  private timers: { at: number; fn: () => void }[] = [];

  constructor(readonly ports: SimPorts, seed = 1) { this.rng = new Rng(seed); }

  /** run fn after ms of sim time (delays, repeats, heal-over-time) */
  later(ms: number, fn: () => void): void { this.timers.push({ at: this.t + ms, fn }); }
  runTimers(): void {
    if (!this.timers.length) return;
    const due = this.timers.filter((x) => x.at <= this.t);
    if (!due.length) return;
    this.timers = this.timers.filter((x) => x.at > this.t);
    for (const d of due) d.fn();
  }

  nextId(prefix: 'e' | 'pet' | 'proj' | 'fx' | 'loot'): string { return `${prefix}:${++this.seq}`; }

  emit<K extends GameEventName>(name: K, payload: GameEvents[K]): void { this.ports.emit(name, payload); }

  combatant(id: string | null | undefined): Combatant | undefined {
    if (!id) return undefined;
    return this.players.get(id) ?? this.enemies.get(id);
  }

  *combatants(space: string): Iterable<Combatant> {
    for (const p of this.players.values()) if (p.space === space && !p.dead) yield p;
    for (const e of this.enemies.values()) if (e.space === space && !e.dead) yield e;
  }

  /** Can `a` damage `b`? Teams, PvP rules by realm type, duels, safe zones and spawn protection. */
  hostile(a: Combatant, b: Combatant): boolean {
    if (a === b || a.dead || b.dead) return false;
    if (a.team !== b.team) return true;
    if (a.kind !== 'player' || b.kind !== 'player') return false;
    const pa = a as PlayerEnt, pb = b as PlayerEnt;
    if (pa.downed || pb.downed || this.t < pb.spawnProtectUntil || this.t < pa.spawnProtectUntil) return false;
    switch (this.ports.realmRule()) {
      case 'peaceful': return false;
      case 'duels': return pa.duelWith === pb.id && pb.duelWith === pa.id;
      case 'arena': return this.ports.zoneRule(a.space, a.x, a.y) === 'arena' && this.ports.zoneRule(b.space, b.x, b.y) === 'arena';
      case 'ffa': return this.ports.zoneRule(a.space, a.x, a.y) !== 'safe' && this.ports.zoneRule(b.space, b.x, b.y) !== 'safe';
    }
  }

  ally(a: Combatant, b: Combatant): boolean { return a.team === b.team && !this.hostile(a, b); }

  /** Targetable right now (not stealthed / untargetable / downed). */
  targetable(c: Combatant): boolean {
    if (c.dead) return false;
    if (c.kind === 'player' && ((c as PlayerEnt).downed || (c as PlayerEnt).stealth)) return false;
    if (c.buffs.some((b) => b.flags.includes('untargetable') || b.flags.includes('stealth'))) return false;
    // set pieces: "cannot be targeted until flag <f>" (Captain Nobody's name, the Unremembered's names), from a phase on
    if (c.kind === 'enemy') for (const [k, fromPhase] of c.stats.hooks) {
      if (k.startsWith('targetableOnFlag:') && (c as EnemyEnt).phase + 1 >= fromPhase && !this.flag(k.slice(17))) return false;
    }
    return true;
  }

  nearestHostile(from: Combatant, r: number, filter?: (c: Combatant) => boolean): Combatant | undefined {
    let best: Combatant | undefined, bd = r * r;
    for (const c of this.combatants(from.space)) {
      if (!this.hostile(from, c) || !this.targetable(c) || (filter && !filter(c))) continue;
      const d = dist2(from, c);
      if (d <= bd) { bd = d; best = c; }
    }
    return best;
  }

  /** Recompile base + active buffs when buffs changed. */
  refresh(c: Combatant): void {
    if (!c.statsDirty) return;
    const extra: Passive[] = c.buffs.filter((b) => b.mods.length || b.procs.length).map((b) => ({ mods: b.mods, procs: b.procs }));
    c.stats = extra.length ? compileOnto(c.base, extra) : c.base;
    c.statsDirty = false;
  }

  condCtx(c: Combatant, target?: Combatant | null): CondCtx {
    const p = c.kind === 'player' ? (c as PlayerEnt) : null;
    let alliesNear = 0;
    if (target !== undefined) for (const o of this.combatants(c.space)) if (o !== c && o.team === c.team && dist2(o, c) < 300 * 300) alliesNear++;
    return {
      hpFrac: c.hp / Math.max(1, c.maxHp),
      targetHpFrac: target ? target.hp / Math.max(1, target.maxHp) : undefined,
      targetStatuses: target ? new Set(target.statuses.keys()) : undefined,
      targetTier: target ? (target.kind === 'player' ? 'player' : (target as EnemyEnt).tier) : undefined,
      distance: target ? Math.sqrt(dist2(c, target)) : undefined,
      alliesNear,
      inCombat: this.t < c.inCombatUntil,
      stationaryMs: this.t - c.movedAt,
      weapon: p?.weapon.type,
      behind: target ? isBehind(c, target) : false,
      fromStealth: !!p?.stealth || c.buffs.some((b) => b.flags.includes('stealth')),
      momentum: p?.momentum ?? 0,
    };
  }
  evalCond = evalCond;
}

/** Layer buff passives on top of an already compiled base. */
function compileOnto(base: ReturnType<typeof compile>, extra: Passive[]): ReturnType<typeof compile> {
  const add = compile(extra);
  const stats = { ...base.stats };
  for (const [k, v] of Object.entries(add.stats)) {
    // pct buffs on scaled stats (armor +20%) arrive as base 0 × …; treat pct-only buffs as relative to the base
    stats[k] = (stats[k] ?? 0) + v;
  }
  for (const s of extra) for (const m of s.mods ?? []) {
    if (m.op === 'pct' && !m.when && ['hp', 'ember', 'stamina', 'armor', 'sp', 'emberRegen', 'hpRegen', 'staminaRegen'].includes(m.stat)) {
      stats[m.stat] = (base.stats[m.stat] ?? 0) * (1 + m.value) + (stats[m.stat] - (base.stats[m.stat] ?? 0));
    }
  }
  const more = { ...base.more };
  for (const [k, v] of Object.entries(add.more)) more[k] = (more[k] ?? 1) * v;
  const hooks = new Map(base.hooks);
  for (const [k, v] of add.hooks) hooks.set(k, (hooks.get(k) ?? 0) + v);
  return {
    stats, more, hooks,
    conditional: [...base.conditional, ...add.conditional],
    procs: [...base.procs, ...add.procs],
    spellMods: [...base.spellMods, ...add.spellMods],
  };
}

/**
 * A free place to put a player near (x, y): rings growing outward (0, 30, 48, 66 … px, 8 directions), taking the
 * first spot that collision lets us reach from the anchor and that no other living player stands on (26 px).
 * Used for joins, realm arrivals and every respawn, so nobody spawns on top of anybody.
 */
export function freeSpot(w: SimWorld, space: string, x: number, y: number, self?: string): { space: string; x: number; y: number } {
  const taken = (px: number, py: number) => [...w.players.values()].some((o) => o.id !== self && !o.dead && o.space === space && (o.x - px) ** 2 + (o.y - py) ** 2 < 26 * 26);
  if (!taken(x, y)) return { space, x, y };
  for (const r of [30, 48, 66, 84, 102, 130]) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + (r % 2 ? 0.4 : 0);
      const want = { x: x + Math.cos(a) * r, y: y + Math.sin(a) * r };
      const got = w.ports.move(space, x, y, want.x - x, want.y - y, 10);
      if ((got.x - want.x) ** 2 + (got.y - want.y) ** 2 > 6 * 6) continue; // blocked on the way
      if (!taken(got.x, got.y)) return { space, x: got.x, y: got.y };
    }
  }
  return { space, x, y };
}

export const dist2 = (a: Vec, b: Vec): number => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
export const dist = (a: Vec, b: Vec): number => Math.sqrt(dist2(a, b));
export const norm = (x: number, y: number): Vec => { const l = Math.hypot(x, y) || 1; return { x: x / l, y: y / l }; };
/** attacker is behind the target (opposite its facing) */
export function isBehind(att: Vec, tgt: { x: number; y: number; face: Vec }): boolean {
  const d = norm(att.x - tgt.x, att.y - tgt.y);
  return d.x * tgt.face.x + d.y * tgt.face.y < -0.3;
}
export const facing4 = (v: Vec): 'n' | 'e' | 's' | 'w' => (Math.abs(v.x) > Math.abs(v.y) ? (v.x > 0 ? 'e' : 'w') : v.y > 0 ? 's' : 'n');
