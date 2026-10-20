/**
 * Spawning (Claude 3): creatures from spawn requests, creature summons and splits, player pets (hawk, treants,
 * legendary echoes). Creature stats come from rules/creatures (level, tier promotion, party scaling).
 */
import { compile } from '@/systems/rules/stats';
import { makeEscort, type EscortSpawn } from './escort';
import { abilityFor } from '@/data/enemies/hc/abilities';
import { ELITE, eliteAffix, eliteBandTop, HC_ELITE_AFFIXES, type EliteAffix } from '@/data/enemies/hc/elites';
import { allCreatures, creature, creatureStats, type CreatureDef } from '@/systems/rules/creatures';
import type { SpawnRequest } from '@/systems/rules/types';
import { newCombatantBase, type CastCtx, type EnemyEnt, type Team } from './state';
import type { SimWorld } from './world';
import { fireProcs } from './combat';

/** Player pets: not in the bestiary, so they borrow a body + a few numbers. */
const PETS: Record<string, { body: string; hp: number; dmg: number; speed: number; attackMs: number; range: number; flying: boolean }> = {
  hawk: { body: 'bx_crow', hp: 0.3, dmg: 0.35, speed: 160, attackMs: 2600, range: 30, flying: true },
  treant: { body: 'bx_verdant_0', hp: 0.6, dmg: 0.5, speed: 70, attackMs: 1400, range: 40, flying: false },
};

export function spawnCreature(w: SimWorld, req: SpawnRequest & EscortSpawn & { team?: Team; summonerId?: string; ownerId?: string; expiresAt?: number; power?: number }): EnemyEnt | null {
  const def = creature(req.creature);
  if (!def) { console.warn(`[sim] unknown creature ${req.creature}`); return null; }
  const tier = req.tier ?? def.tier;
  const st = creatureStats(def, req.level, w.ports.partySize(), tier);
  const power = req.power ?? 1;
  const id = w.nextId(req.ownerId ? 'pet' : 'e');
  // elites (PACING.md): affixes add abilities and rules on top of the creature
  const affixes = req.elite && !req.ownerId ? pickAffixes(w, req.elite, req.level) : [];
  const extra = affixes.flatMap((a) => (a.lines ?? []).map((t) => abilityFor(t, { kind: def.kind, tier, arch: def.arch, region: def.region })));
  const cdef = affixes.length ? {
    ...def,
    abilities: [...def.abilities, ...extra.filter((x) => x.use === 'attack' || x.use === 'self')],
    onDeath: [...def.onDeath, ...extra.filter((x) => x.use === 'onDeath')],
    ai: { ...def.ai, speed: def.ai.speed * Math.max(1, ...affixes.map((a) => a.speed ?? 1)), attackMs: def.ai.attackMs / Math.max(1, ...affixes.map((a) => a.speed ?? 1)) },
    radius: def.radius + 2,
  } : def;
  // each affix past the first trades 10% of the elite's health for its mechanic (more to read, not more to chew)
  const mult = affixes.length ? { ...ELITE, hp: ELITE.hp * (1 - 0.1 * (affixes.length - 1)) } : { hp: 1, dmg: 1, armor: 1 };
  const base = compile([
    { mods: Object.entries(def.resist).map(([k, v]) => ({ stat: `resist.${k}` as never, op: 'flat' as const, value: v })), hooks: def.hooks },
    ...affixes.map((a) => a.passive ?? {}),
  ]);
  const e: EnemyEnt = {
    ...newCombatantBase(),
    id, kind: req.ownerId ? 'pet' : 'enemy', def: def.id, space: req.space, x: req.x, y: req.y, r: cdef.radius, face: { x: 0, y: 1 },
    team: req.team ?? (req.ally ? 'players' : 'enemies'), level: req.level, hp: Math.round(st.hp * power * mult.hp), maxHp: Math.round(st.hp * power * mult.hp),
    base, stats: base, cdef, tier, dmg: st.dmg * power * mult.dmg, armor: st.armor * mult.armor,
    elite: affixes.length ? affixes.map((a) => a.id) : undefined, patrol: req.patrol?.length ? req.patrol.map((p) => ({ x: p.x, y: p.y })) : undefined, patrolI: 0, zoneId: req.zoneId, home: { x: req.x, y: req.y },
    ai: req.dormant ? 'dormant' : req.ownerId ? 'follow' : 'idle', targetId: null, attackReadyAt: 0, abilityReadyAt: new Map(),
    phase: 0, revived: false, yielded: false, interludes: 0, summonerId: req.summonerId, ownerId: req.ownerId, expiresAt: req.expiresAt, path: [], pathAt: 0,
  };
  e.movedAt = w.t;
  // stagger opening cooldowns so packs don't fire in sync
  for (const ab of [...cdef.abilities, ...(cdef.phases[0] ?? [])]) e.abilityReadyAt.set(ab, w.t + 1500 + w.rng.range(0, ab.cd * 0.6));
  // escorts: allied, tougher than a pack creature (half a mini of their level by default), revivable
  const esc = makeEscort(req);
  if (esc) {
    e.escort = esc;
    e.team = 'players';
    e.hp = e.maxHp = Math.round(creatureStats(def, req.level, w.ports.partySize(), 'mini').hp * (req.escort?.hp ?? 0.5));
  }
  w.enemies.set(id, e);
  return e;
}

/** Explicit affix ids, or 1–2 random ones; at the top of an act's level band (ELITE_BAND_TOPS) one more. */
function pickAffixes(w: SimWorld, want: boolean | string[], level: number): EliteAffix[] {
  if (Array.isArray(want)) return want.map(eliteAffix).filter((a): a is EliteAffix => !!a).slice(0, 3);
  const n = (w.rng.chance(0.4) ? 2 : 1) + (eliteBandTop(level) ? 1 : 0);
  const pool = [...HC_ELITE_AFFIXES];
  const out: EliteAffix[] = [];
  while (out.length < n && pool.length) out.push(pool.splice(w.rng.int(0, pool.length - 1), 1)[0]);
  return out;
}

/** Summon action: creature adds (enemies), pets (players), splits and echoes. */
export function spawnSummon(w: SimWorld, c: CastCtx, what: string, count: number, dur: number, power: number): void {
  const me = c.caster;
  const around = (i: number) => {
    const ang = (i / Math.max(1, count)) * Math.PI * 2 + w.rng.range(0, 1);
    return { x: me.x + Math.cos(ang) * (me.r + 24), y: me.y + Math.sin(ang) * (me.r + 24) };
  };
  if (me.kind === 'player') {
    const pet = what.startsWith('echo:') ? null : PETS[what];
    for (let i = 0; i < count; i++) {
      const at = around(i);
      const e = pet
        ? spawnPet(w, me.id, what, at.x, at.y, dur)
        : spawnCreature(w, { creature: what.slice(5), level: me.level, space: me.space, x: at.x, y: at.y, tier: 'enemy', ownerId: me.id, team: 'players', expiresAt: w.t + dur, power });
      if (e && pet === null) e.dmg = (c.power * power) / 2;
      // deeper builds: minion damage / HP from the owner's passives, and the 'summon' trigger
      if (e) { const st = me.stats.stats; e.dmg *= 1 + (st.minionDmg ?? 0); e.maxHp = Math.round(e.maxHp * (1 + (st.minionHp ?? 0))); e.hp = e.maxHp; }
    }
    if (!c.flags.includes('noProc')) fireProcs(w, me, 'summon');
    return;
  }
  // creatures: cap live adds per summoner
  const alive = [...w.enemies.values()].filter((x) => x.summonerId === me.id && !x.dead).length;
  const room = Math.max(0, (me.kind === 'enemy' && (me as EnemyEnt).tier === 'boss' ? 8 : 5) - alive);
  const pool = summonPool(me as EnemyEnt, what);
  for (let i = 0; i < Math.min(count, room); i++) {
    const at = around(i);
    const add = spawnCreature(w, {
      creature: pool[i % pool.length], level: Math.max(1, me.level - (what === 'split' ? 0 : 1)), space: me.space, x: at.x, y: at.y,
      // adds called by bosses and minis hit softer and fall faster than wild ones
      tier: 'enemy', summonerId: me.id, team: me.team, power: what === 'split' ? power : me.kind === 'enemy' && (me as EnemyEnt).tier !== 'enemy' ? 0.6 : 1,
    });
    // called into a fight, they join it at once: the summoner's grudges become theirs
    // rooted summons (snapvines, totems) wither after 30 s, so a long fight does not fill up with turrets
    if (add && what !== 'split' && (add.cdef.ai.immobile || add.cdef.ai.speed === 0)) add.expiresAt = w.t + (dur || 30_000);
    if (add && me.kind === 'enemy') {
      add.ai = 'engage';
      for (const [id, t] of (me as EnemyEnt).threat) add.threat.set(id, t);
      const near = w.nearestHostile(add, 2000);
      if (near && !add.threat.size) add.threat.set(near.id, 1);
    }
  }
}

function summonPool(me: EnemyEnt, what: string): string[] {
  if (what === 'split') return [me.cdef.tier === 'enemy' ? me.cdef.id : 'bx_slime'];
  if (what === 'elemental-slimes') return ['bx_emberslime', 'bx_rimeslime', 'bx_voidslime', 'bx_goldslime'];
  if (what !== 'same-region' && creature(what)) return [what];
  const same = allCreatures().filter((d: CreatureDef) => d.tier === 'enemy' && d.region === me.cdef.region && d.id !== me.cdef.id);
  if (same.length) return same.map((d) => d.id);
  // campaign bosses have no home region: call creatures of their own element (realm creatures first)
  const kin = allCreatures().filter((d: CreatureDef) => d.tier === 'enemy' && d.elements.includes(me.cdef.kind) && d.id.startsWith('bx_'));
  return kin.length ? kin.map((d) => d.id) : ['bx_slime'];
}

export function spawnPet(w: SimWorld, ownerId: string, kind: string, x: number, y: number, dur = 0): EnemyEnt | null {
  const owner = w.players.get(ownerId);
  const p = PETS[kind];
  if (!owner || !p) return null;
  const e = spawnCreature(w, { creature: p.body, level: owner.level, space: owner.space, x, y, tier: 'enemy', ownerId, team: 'players', expiresAt: dur ? w.t + dur : undefined });
  if (!e) return null;
  const petPower = 1 + (owner.stats.hooks.get('petPower') ?? 0);
  e.def = `pet:${kind}`;
  e.maxHp = e.hp = Math.round(owner.maxHp * p.hp);
  e.dmg = (((owner.weapon.min + owner.weapon.max) / 2) * (1 + (owner.stats.stats.power ?? 0)) + (owner.stats.stats.sp ?? 0) * 0.3) * p.dmg * petPower;
  e.cdef = { ...e.cdef, ai: { ...e.cdef.ai, speed: p.speed, attackMs: p.attackMs, attackRange: p.range, flying: p.flying, ranged: false, immobile: false, flee: false }, abilities: [], phases: [], onDeath: [] };
  return e;
}

/** A decoy that looks like its caster and taunts foes nearby (Jester's Pratfall, Misdirection). */
export function spawnDecoy(w: SimWorld, c: CastCtx, at: { x: number; y: number }, dur: number): void {
  const me = c.caster;
  const e = spawnCreature(w, { creature: 'bx_hollowed', level: me.level, space: me.space, x: at.x, y: at.y, tier: 'enemy', ownerId: me.id, team: me.team, expiresAt: w.t + dur });
  if (!e) return;
  e.def = me.def;
  e.maxHp = e.hp = Math.round(me.maxHp * 0.3);
  e.dmg = 0;
  e.cdef = { ...e.cdef, ai: { ...e.cdef.ai, speed: 0, immobile: true, attackRange: 0, aggro: 0 }, abilities: [], phases: [], onDeath: [], lowHp: [] };
  e.ai = 'dormant';
  for (const o of w.combatants(me.space)) {
    if (!w.hostile(me, o) || o.kind === 'player' || Math.hypot(o.x - at.x, o.y - at.y) > 200) continue;
    o.statuses.set('taunt', { id: 'taunt', until: w.t + Math.min(dur, 3000), power: 0, sourceId: e.id, dps: 0, kind: 'physical', stacks: 1, nextTick: Infinity });
  }
}

/** A story pet (gift flags from the class campaigns): a cosmetic follower on a borrowed body. */
export function spawnStoryPet(w: SimWorld, ownerId: string, flag: string, body: string): EnemyEnt | null {
  const owner = w.players.get(ownerId);
  if (!owner) return null;
  const e = spawnCreature(w, { creature: body, level: owner.level, space: owner.space, x: owner.x - 16, y: owner.y + 10, tier: 'enemy', ownerId, team: 'players' });
  if (!e) return null;
  e.storyPet = flag;
  e.dmg = 0;
  e.cdef = { ...e.cdef, ai: { ...e.cdef.ai, speed: 150, attackRange: 0, ranged: false, immobile: false, flee: false }, abilities: [], phases: [], onDeath: [], lowHp: [] };
  e.buffs.push({ id: 'story-pet', until: Infinity, sourceId: e.id, mods: [], procs: [], flags: ['invulnerable', 'untargetable'] });
  e.statsDirty = true;
  return e;
}
