/**
 * Build simulator (Claude 3 helper): a build through the REAL authority sim (src/systems/sim/Sim.ts), played by
 * the fight.ts bot (casts, potions, dashes on wind-ups, slash for martial classes). Single-life fights (pack, boss)
 * and a lair with HP carried between waves (deaths respawn, like gauntlet.ts). Metered from the sim's own events.
 */
import { Btn, type InputFrame } from '@/net/types';
import { MAGIC_SCHOOLS } from '@/core/constants';
import { hasSlash } from '@/systems/rules/slash';
import { lairWaves } from '@/systems/rules/encounters';
import type { Action, CharacterSave, SchoolId } from '@/systems/rules/types';
import { Sim } from '@/systems/sim/Sim';
import { spellView } from '@/systems/sim/player';
import type { EnemyEnt, PlayerEnt } from '@/systems/sim/state';
import type { SimPorts } from '@/systems/sim/world';

export const DT = 1000 / 30;
export const PID = 'bot';
const PEID = `p:${PID}`;

export interface Meter { dealt: number; taken: number; healed: number; potions: number; deaths: number; takenBy: Record<string, number> }
export interface Spawn { creature: string; level: number; x: number; y: number; tier?: 'enemy' | 'mini' | 'boss'; elite?: boolean }

export interface Arena { sim: Sim; m: Meter; p: PlayerEnt }

/** A fresh seeded world with one bot hero; the meter reads combat:hit / player:damaged / item:used / player:died. */
export function arena(save: CharacterSave, seed: number, bound = 2000): Arena {
  const m: Meter = { dealt: 0, taken: 0, healed: 0, potions: 0, deaths: 0, takenBy: {} };
  let sim: Sim | undefined;
  const mine = (id: string): boolean => {
    if (id === PEID || id.startsWith('pet:')) return true;
    const e = sim?.w.enemies.get(id);
    return !!e && e.ownerId === PEID;
  };
  const ports: SimPorts = {
    move: (_s, x, y, dx, dy) => ({ x: Math.max(-bound, Math.min(bound, x + dx)), y: Math.max(-bound, Math.min(bound, y + dy)) }),
    clear: () => true,
    zoneRule: () => 'wild',
    respawnPoint: () => ({ space: 'test', x: 0, y: 0 }),
    emit: (name, payload) => {
      if (name === 'combat:hit') {
        const h = payload as { sourceId: string; targetId: string; amount: number; kind?: string };
        if (h.kind === 'dmg' && h.targetId !== PEID && mine(h.sourceId)) m.dealt += h.amount;
        if (h.kind === 'heal' && h.targetId === PEID) m.healed += h.amount;
      } else if (name === 'player:damaged') {
        const d = payload as { amount: number; type: string; playerId: string };
        if (d.playerId === PID) { m.taken += d.amount; m.takenBy[d.type] = (m.takenBy[d.type] ?? 0) + d.amount; }
      } else if (name === 'item:used') {
        const u = payload as { playerId: string; def: string };
        if (u.playerId === PID && /^i_(hp|em)_/.test(String(u.def))) m.potions++;
      } else if (name === 'player:died') {
        if ((payload as { playerId: string }).playerId === PID) m.deaths++;
      }
    },
    partySize: () => 1,
    realmRule: () => 'peaceful',
  };
  sim = new Sim(ports, seed);
  // the bot performs the in-fight story beats that gate targeting (reading the names, calling Nobody by name)
  sim.shopEnv = { flag: (k) => /names_read|nobody_named/.test(k), priceMult: () => 1 };
  const p = sim.addPlayer(PID, structuredClone(save), { space: 'test', x: 0, y: 0 });
  return { sim, m, p };
}

export const CAST = [Btn.CAST1, Btn.CAST2, Btn.CAST3, Btn.CAST4] as const;

/**
 * Which hotbar slot to press (every 15 ticks, like fight.ts), with three player habits fight.ts lacks: never press a
 * spell you cannot pay for, nor an enemy-aimed spell whose target is out of its range (the sim refuses both without a
 * cooldown, so fight.ts keeps pressing that slot and never reaches the next one), and fire the ultimate when it is up.
 */
export function chooseSlot(sim: Sim, p: PlayerEnt): number | undefined {
  const tgt = p.target ? sim.w.combatant(p.target) : undefined;
  const ready = (i: number): boolean => {
    const id = p.save.hotbar[i];
    const sp = id ? p.spells.get(id) : undefined;
    if (!sp || sim.w.t < (p.cds.get(sp.id) ?? 0)) return false;
    if (sp.aim === 'enemy' && sp.range > 0 && tgt && Math.hypot(tgt.x - p.x, tgt.y - p.y) - tgt.r > sp.range) return false;
    return !!sp.hpCost || (p.stats.hooks.get('spellsCostHp') ?? 0) > 0 || p.ember >= spellView(p, sp).cost;
  };
  // heal priority (Claude 5): below 60% health a ready heal, shield or defensive self-buff comes before any damage spell
  // (the ultimate included), whatever its slot; above 90% heals are not wasted. Without this a cooldown cut made the bot
  // reach its damage slots more often and its heals less, so cooldown reduction read as a survival loss.
  const frac = p.hp / Math.max(1, p.maxHp);
  const kind = (i: number): 'heal' | 'defend' | 'other' => {
    const sp = p.spells.get(p.save.hotbar[i] ?? '');
    if (!sp) return 'other';
    const acts = flatActions(sp.actions);
    if (sp.tags.includes('heal') || acts.some((a) => a.a === 'heal')) return 'heal';
    // a self / ally buff is a defence only when it defends (Claude 5): Net Shot's move-speed buff made the bot hold Ember for it
    if (acts.some((a) => a.a === 'shield') || (sp.tags.includes('buff') && acts.some((a) => a.a === 'buff' && (a.to === 'self' || a.to === 'allies') && defensive(a)))) return 'defend';
    return 'other';
  };
  // below 80% health, keep Ember for the cheapest heal / defence: a damage spell may not dip under its cost
  const costOf = (i: number): number => { const sp = p.spells.get(p.save.hotbar[i] ?? ''); return sp ? spellView(p, sp).cost : 0; };
  const saves = [0, 1, 2, 3].filter((i) => p.save.hotbar[i] && kind(i) !== 'other');
  const reserve = frac < 0.8 && saves.length ? Math.min(...saves.map(costOf)) : 0;
  const usable = (i: number): boolean => ready(i) && !(frac > 0.9 && kind(i) === 'heal') && !(kind(i) === 'other' && p.ember - costOf(i) < reserve);
  if (frac < 0.6) {
    const save = [0, 1, 2, 3].find((i) => usable(i) && kind(i) !== 'other');
    if (save !== undefined) return save;
  }
  const ult = [0, 1, 2, 3].find((i) => usable(i) && !!p.spells.get(p.save.hotbar[i]!)?.tags.includes('ultimate'));
  return ult ?? [0, 1, 2, 3].find(usable);
}

const DEF_STATS = /^(dmgTaken|armor|block|dodge|hp|hpRegen|healingTaken|res\.)/;
const DEF_FLAGS = new Set(['parry', 'invulnerable', 'unstoppable', 'stealth', 'untargetable', 'taunt', 'reflect', 'blockFront', 'absorb', 'lifesteal']);
function defensive(a: Extract<Action, { a: 'buff' }>): boolean {
  return (a.mods ?? []).some((m) => DEF_STATS.test(m.stat)) || (a.flags ?? []).some((f) => DEF_FLAGS.has(f));
}

/** a spell's actions, flattened through delays, repeats, moves, zones and projectile hits */
function flatActions(acts: Action[] | undefined, out: Action[] = []): Action[] {
  for (const a of acts ?? []) {
    out.push(a);
    if (a.a === 'delay' || a.a === 'repeat') flatActions(a.then, out);
    if (a.a === 'move') { flatActions(a.path, out); flatActions(a.land, out); }
    if (a.a === 'zone') { flatActions(a.each, out); flatActions(a.trigger, out); }
    if (a.a === 'projectile') flatActions(a.onHit, out);
  }
  return out;
}

export const foesOf = (sim: Sim): EnemyEnt[] => [...sim.w.enemies.values()].filter((e) => !e.dead && !e.yielded && e.team === 'enemies');

/** The fight.ts bot as a stateful driver: one step() per 1/30 s tick (presses are edges, released next tick). */
export class Bot {
  private seq = 0; private held = 0;
  /** potions: false in probes (measure the build, not the pack) */
  constructor(private a: Arena, private opts: { potions?: boolean } = {}) {}

  step(tick: number): void {
    const { sim, p } = this.a;
    const foes = foesOf(sim);
    if (!foes.length || p.dead) { this.idle(tick); return; }
    foes.sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y));
    // like a player: focus the boss / mini unless an add is right on top of us
    const big = foes.find((e) => e.tier !== 'enemy');
    const t = big && Math.hypot(foes[0].x - p.x, foes[0].y - p.y) > 60 ? big : foes[0];
    const d = Math.hypot(t.x - p.x, t.y - p.y) || 1;
    let buttons = Btn.ATTACK;
    if (tick % 15 === 0) {
      const slot = chooseSlot(sim, p);
      if (slot !== undefined) buttons |= CAST[slot];
    }
    if (hasSlash(p.save.classId) && tick % 2 === 0 && sim.w.t >= (p.cds.get('slash') ?? 0)) buttons |= Btn.SLASH;
    if (this.opts.potions !== false) {
      if (p.hp < p.maxHp * 0.4) buttons |= Btn.POTION_Q;
      if (p.ember < 20) buttons |= Btn.POTION_E;
    }
    const winding = foes.find((e) => e.windup && e.windup.label !== 'basic' && Math.hypot(e.x - p.x, e.y - p.y) < 320);
    if (winding && tick % 4 === 0) buttons |= Btn.DASH;
    const melee = !['bow', 'staff', 'wand'].includes(p.weapon.type);
    const kite = !melee && d < 120;
    let mx = kite ? (p.x - t.x) / d : 0, my = kite ? (p.y - t.y) / d : 0;
    const zone = [...sim.w.zones.values()].find((z) => z.team === 'enemies' && Math.hypot(z.x - p.x, z.y - p.y) < (z.area.r ?? 60) + 14);
    if (zone) { const zd = Math.hypot(p.x - zone.x, p.y - zone.y) || 1; mx = (p.x - zone.x) / zd; my = (p.y - zone.y) / zd; }
    if (winding) { const wd = Math.hypot(p.x - winding.x, p.y - winding.y) || 1; mx = (p.x - winding.x) / wd - (p.y - winding.y) / wd * 0.5; my = (p.y - winding.y) / wd + (p.x - winding.x) / wd * 0.5; }
    const frame: InputFrame = { seq: ++this.seq, t: sim.w.t, move: { x: mx, y: my }, aim: { x: t.x, y: t.y }, buttons: buttons & ~this.held | (buttons & Btn.ATTACK), target: t.id };
    this.held = buttons & ~Btn.ATTACK;
    sim.step(DT, tick, new Map([[PID, [frame]]]));
    if (this.held) { const rel: InputFrame = { ...frame, seq: ++this.seq, buttons: Btn.ATTACK }; this.held = 0; sim.step(0.0001, tick, new Map([[PID, [rel]]])); }
  }

  /** No foes (or dead): stand still; a dead hero presses Respawn after 3 s. */
  idle(tick: number, respawnAfterMs = 3000, diedAt = 0): void {
    const { sim, p } = this.a;
    if (p.dead && sim.w.t >= diedAt + respawnAfterMs) sim.receive({ type: 'act', domain: 'systems', action: 'respawn', args: {} }, PID);
    sim.step(DT, tick, new Map([[PID, [{ seq: ++this.seq, t: sim.w.t, move: { x: 0, y: 0 }, aim: { x: p.x, y: p.y + 40 }, buttons: 0, target: null }]]]));
  }
}

export interface FightResult {
  won: boolean;
  /** seconds of combat (the cap on a timeout) */
  secs: number;
  dealt: number; taken: number; healed: number; potions: number; deaths: number;
  maxHp: number;
  /** fraction of raw incoming damage removed by armour / resist / block / damage taken (from the build's stats) */
  mitig: number;
  hpLeft: number;
  crash?: string;
}

/** Mitigation per damage kind from the hero's compiled stats (mirrors combat.ts dealDamage), attacker level L. */
export function takenMult(p: PlayerEnt, kind: string, L: number): number {
  const st = p.base.stats;
  let m: number;
  if ((MAGIC_SCHOOLS as readonly string[]).includes(kind)) m = 1 - Math.min(0.6, st[`resist.${kind as SchoolId}`] ?? 0);
  else { const a = st.armor ?? 0; m = 1 - Math.min(0.75, a / (a + 40 + 12 * L)); }
  const guard = ['bow', 'staff', 'wand'].includes(p.weapon.type) ? 0 : 0.12;
  m *= Math.max(0.1, 1 + (st.dmgTaken ?? 0) - guard);
  m *= 1 - 0.6 * Math.min(0.75, st.block ?? 0);
  return m;
}

/** 1 − Σtaken / Σraw over the damage kinds the fight actually dealt (reference: physical when nothing landed). */
export function mitigationOf(p: PlayerEnt, takenBy: Record<string, number>, L: number): number {
  let taken = 0, raw = 0;
  for (const [k, v] of Object.entries(takenBy)) { taken += v; raw += v / takenMult(p, k, L); }
  return raw > 0 ? 1 - taken / raw : 1 - takenMult(p, 'physical', L);
}

function result(a: Arena, won: boolean, ticks: number, L: number, crash?: string): FightResult {
  const { m, p } = a;
  return { won, secs: Math.round(ticks / 30), dealt: m.dealt, taken: m.taken, healed: m.healed, potions: m.potions, deaths: m.deaths,
    maxHp: p.maxHp, mitig: mitigationOf(p, m.takenBy, L), hpLeft: Math.round((Math.max(0, p.hp) / p.maxHp) * 100), crash };
}

/** One life vs these spawns (pack / boss); lost on death or after capSecs. */
export function runFight(save: CharacterSave, spawns: Spawn[], seed: number, capSecs = 600): FightResult {
  const a = arena(save, seed);
  for (const s of spawns) a.sim.spawn({ creature: s.creature, level: s.level, space: 'test', x: s.x, y: s.y, tier: s.tier, elite: s.elite });
  const bot = new Bot(a);
  for (let tick = 1; tick <= 30 * capSecs; tick++) {
    const foes = foesOf(a.sim);
    if (!foes.length || a.p.dead || a.p.downed) return result(a, !foes.length && !a.p.dead && !a.p.downed, tick, save.level);
    try { bot.step(tick); } catch (e) { return result(a, false, tick, save.level, (e as Error).stack?.split('\n').slice(0, 3).join(' | ')); }
  }
  return result(a, false, 30 * capSecs, save.level);
}

/** Lair: lairWaves(realm, L, rooms) wave by wave with HP carried over; deaths respawn (3 s) and the wave stays. */
export function runLair(save: CharacterSave, realm: string, seed: number, rooms = 5, waveCapSecs = 240): FightResult & { waves: number; cleared: number } {
  const L = save.level;
  const a = arena(save, seed, 600);
  const bot = new Bot(a);
  const waves = lairWaves(realm, L, rooms, 1, seed).flatMap((r) => r.waves);
  let tick = 0, combat = 0, cleared = 0, diedAt = 0, wasDead = false;
  try {
    for (const wave of waves) {
      wave.forEach((s, i) => a.sim.spawn({ creature: s.creature, level: s.level, tier: s.tier, elite: s.elite, space: 'test', x: 160 + (i % 3) * 40, y: -60 + Math.floor(i / 3) * 50 }));
      let done = false;
      for (let t = 0; t < 30 * waveCapSecs; t++) {
        tick++; combat++;
        if (!foesOf(a.sim).length) { done = true; break; }
        if (a.p.dead && !wasDead) diedAt = a.sim.w.t;
        wasDead = a.p.dead;
        if (a.p.dead) bot.idle(tick, 3000, diedAt); else bot.step(tick);
      }
      if (!done) break;
      cleared++;
      // walk to the next room: a few seconds of out-of-combat regen, like a real lair
      for (let t = 0; t < 30 * 4; t++) bot.idle(++tick, 0, 0);
    }
  } catch (e) {
    return { ...result(a, false, combat, L, (e as Error).stack?.split('\n').slice(0, Number(process.env.STACK ?? 3)).join(' | ')), waves: waves.length, cleared };
  }
  return { ...result(a, cleared === waves.length, combat, L), waves: waves.length, cleared };
}
