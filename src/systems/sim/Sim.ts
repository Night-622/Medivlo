/**
 * The systems simulation (Claude 3): one authority-side object that steps players, creatures, projectiles,
 * zones, loot and co-op rules, answers Services.combat, receives client messages and produces snapshot entities.
 * Phaser-free: the public-realm server runs the same class.
 */
import type { ClientMsg, EntityState, InputFrame, PartyMember, PlayerId } from '@/net/types';
import type { CharacterSave } from '@/systems/rules/types';
import type { CombatantInfo, CombatService, DamageKind, SpawnRequest, StatusApply } from '@/core/hc';
import { applyStatus, dealDamage, heal, tickBuffs, tickStatuses } from './combat';
import { respawn, tickCoop } from './coop';
import { stepEnemy } from './enemy';
import { tickProjectiles, tickZones } from './entities';
import { useItem } from './items';
import { buy, sell, questReward, questTake, type QuestRewardEv, type ShopEnv } from './shop';
import { runeforge } from './runeforge';
import { loseEscort, tickEscorts } from './escort';
import { chestsOf, openChest, rollKillLoot, tickLoot } from './loot';
import { addHazard, clearHazards, removeHazard, tickHazards, useHazard, type HazardSpec } from './hazards';
import { nearPlayers, yieldEnemy } from './death';
import { createPlayer, rebuildPlayer, stepPlayer } from './player';
import { spawnCreature, spawnPet, spawnStoryPet } from './spawn';
import { HC_STORY_PETS } from '@/data/items/hc/campaign-items';
import { eliteAffix } from '@/data/enemies/hc/elites';
import type { Combatant, EnemyEnt, PlayerEnt } from './state';
import { dist2, facing4, freeSpot, SimWorld, type SimPorts } from './world';
import { xpToNext } from '@/systems/rules/curves';
import { sanitizeLoadout } from '@/systems/rules/validate';
import { lookKey, paperdoll, type HeroLookLite } from '@/systems/rules/paperdoll';

const AOI = 1400;
/** a duel challenge can be accepted for this long (ms of sim time) */
const DUEL_ASK_MS = 30_000;

export class Sim implements CombatService {
  readonly w: SimWorld;
  private members = new Set<PlayerId>();
  /** pending duel challenges: challenger → { target, when } (expire after DUEL_ASK_MS) */
  private duelAsks = new Map<PlayerId, { to: PlayerId; at: number }>();

  /** shop pricing + flags (wired by installSystemsAuthority; defaults for tests) */
  shopEnv: ShopEnv = { flag: () => undefined, priceMult: () => 1 };
  /** the authority's own player (solo / co-op host); null on a dedicated server. Only it may self-teleport. */
  localPlayer: PlayerId | null = null;

  constructor(ports: SimPorts, seed = (Date.now() >>> 0)) {
    this.w = new SimWorld(ports, seed);
    this.w.flag = (k) => this.shopEnv.flag(k);
  }

  questReward(e: QuestRewardEv): void { questReward(this.w, e); }
  questTake(item: string, qty: number): void { questTake(this.w, item, qty); }
  /** A player used a world chest (interact kind 'chest'); false if their character already opened it. */
  openChest(playerId: PlayerId, objectId: string, props: Record<string, string | number | boolean>): boolean {
    const p = this.w.players.get(`p:${playerId}`);
    return !!p && !p.dead && openChest(this.w, p, objectId, props);
  }

  // ───────────── loop ─────────────
  step(dt: number, tick: number, inputs: Map<PlayerId, InputFrame[]>): void {
    const w = this.w;
    w.t += dt;
    w.tick = tick;
    w.runTimers();
    for (const p of w.players.values()) {
      stepPlayer(w, p, inputs.get(p.playerId) ?? [], dt);
      this.ensurePets(p);
    }
    for (const e of w.enemies.values()) stepEnemy(w, e, dt);
    for (const c of [...w.players.values(), ...w.enemies.values()] as Combatant[]) {
      if (c.dead) continue;
      tickStatuses(w, c);
      tickBuffs(w, c);
    }
    tickProjectiles(w, dt);
    tickZones(w);
    tickLoot(w);
    tickHazards(w, dt);
    if (tick % 30 === 0) this.storyYields();
    tickCoop(w, dt);
    tickEscorts(w, dt);
  }

  private ensurePets(p: PlayerEnt): void {
    if (p.dead) return;
    // story pets: one cosmetic follower once its gift flag is set (flags are the authority world's)
    if (this.w.tick % 30 === 0) {
      const sp = HC_STORY_PETS.find((x) => x.classId === p.save.classId && this.shopEnv.flag(x.flag));
      if (sp && ![...this.w.enemies.values()].some((e) => e.ownerId === p.id && e.storyPet === sp.flag && !e.dead)) spawnStoryPet(this.w, p.id, sp.flag, sp.body);
    }
    if (!p.stats.hooks.get('hawk')) return;
    for (const e of this.w.enemies.values()) if (e.ownerId === p.id && e.def === 'pet:hawk' && !e.dead) return;
    spawnPet(this.w, p.id, 'hawk', p.x + 12, p.y - 12);
  }

  // ───────────── players & messages ─────────────
  addPlayer(playerId: PlayerId, save: CharacterSave, at?: { space: string; x: number; y: number }): PlayerEnt {
    const pos = at ?? this.joinPoint(playerId);
    const existing = this.w.players.get(`p:${playerId}`);
    if (existing) { existing.save = save; rebuildPlayer(this.w, existing); return existing; }
    return createPlayer(this.w, playerId, save, pos.space, pos.x, pos.y);
  }

  /**
   * Where a newcomer appears (REBUILD: co-op guests "appear beside the host"): next to the host's hero when this
   * authority has one in the world, else the world's respawn point (public realms, or the host's own first spawn).
   */
  private joinPoint(playerId: PlayerId): { space: string; x: number; y: number } {
    const host = this.localPlayer && playerId !== this.localPlayer ? this.w.players.get(`p:${this.localPlayer}`) : undefined;
    const anchor = host && !host.dead ? { space: host.space, x: host.x, y: host.y } : this.w.ports.respawnPoint(playerId);
    // never on top of anyone: beside the host, or spread around the shared arrival point (public realms)
    return freeSpot(this.w, anchor.space, anchor.x, anchor.y, `p:${playerId}`);
  }

  removePlayer(playerId: PlayerId): void {
    const id = `p:${playerId}`;
    const leaving = this.w.players.get(id);
    const partner = leaving?.duelWith ? this.w.players.get(leaving.duelWith) : undefined;
    if (partner) { partner.duelWith = null; this.w.emit('duel:ended', { winner: partner.playerId, loser: playerId }); }
    this.duelAsks.delete(playerId);
    this.w.players.delete(id);
    for (const e of this.w.enemies.values()) {
      if (e.ownerId === id) this.w.enemies.delete(e.id);
      e.threat.delete(id);
      if (e.targetId === id) e.targetId = null;
    }
  }

  /** net.onMembers: drop players who left (joiners appear with their first `loadout`). */
  syncMembers(members: PartyMember[]): void {
    const now = new Set(members.filter((m) => m.connected).map((m) => m.playerId));
    for (const id of this.members) if (!now.has(id)) this.removePlayer(id);
    this.members = now;
  }

  /** Authority-side travel (doors, waystones, space changes). */
  teleport(playerId: PlayerId, space: string, x: number, y: number): boolean {
    const p = this.w.players.get(`p:${playerId}`);
    if (!p || !Number.isFinite(x) || !Number.isFinite(y) || !space) return false;
    p.space = space; p.x = x; p.y = y; p.motion = null; p.target = null;
    return true;
  }

  /** net.onClient: loadout / act / duel. */
  receive(msg: ClientMsg, from: PlayerId): void {
    const p = this.w.players.get(`p:${from}`);
    switch (msg.type) {
      case 'loadout': {
        // never trust a client save: clamp, drop unknown items, replay the tree, limit the hotbar
        const save = from === this.localPlayer ? (msg.data as unknown as CharacterSave) : sanitizeLoadout(msg.data);
        if (!save?.classId) return;
        if (p) { p.save = from === this.localPlayer ? save : mergeRemote(p.save, save); rebuildPlayer(this.w, p); } else this.addPlayer(from, save);
        return;
      }
      case 'act': {
        if (msg.domain !== 'systems' || !p) return;
        if (msg.action === 'respawn' && p.dead) respawn(this.w, p);
        if (msg.action === 'useItem') useItem(this.w, p, String(msg.args.uid));
        if (msg.action === 'hazard') useHazard(this.w, p, String(msg.args.id));
        if (msg.action === 'buy') { const err = buy(this.w, p, String(msg.args.shop), String(msg.args.item), this.shopEnv); if (err) this.w.emit('systems:notice', { playerId: from, text: err, kind: 'error' }); }
        if (msg.action === 'reforge' || msg.action === 'socket' || msg.action === 'salvage') { const err = runeforge(this.w, p, msg.action, msg.args); if (err) this.w.emit('systems:notice', { playerId: from, text: err, kind: 'error' }); }
        if (msg.action === 'sell') { const err = sell(this.w, p, String(msg.args.shop), String(msg.args.uid)); if (err) this.w.emit('systems:notice', { playerId: from, text: err, kind: 'error' }); }
        // position is authority-internal: only the authority's own player may move itself (its world code runs here);
        // the world moves remote players with sim.teleport()
        if (msg.action === 'teleport' && from === this.localPlayer) this.teleport(from, String(msg.args.space ?? p.space), Number(msg.args.x), Number(msg.args.y));
        return;
      }
      case 'duel': {
        if (!p || typeof msg.target !== 'string' || msg.target === from) return; // no self-challenges
        const other = this.w.players.get(`p:${msg.target}`);
        if (!other || p.duelWith || other.duelWith) return; // nobody already in a duel
        if (msg.accept) {
          // accept: the target of a live, unexpired ask pairs with its challenger
          const ask = this.duelAsks.get(msg.target);
          if (!ask || ask.to !== from || this.w.t - ask.at > DUEL_ASK_MS) return;
          this.duelAsks.delete(msg.target);
          p.duelWith = other.id; other.duelWith = p.id;
          this.w.emit('duel:started', { a: msg.target, b: from });
        } else {
          this.duelAsks.set(from, { to: msg.target, at: this.w.t });
          this.w.emit('duel:asked', { from, to: msg.target });
        }
        return;
      }
      default:
    }
  }

  // ───────────── snapshot ─────────────
  collect(viewer: PlayerId): EntityState[] {
    const w = this.w, me = w.players.get(`p:${viewer}`);
    const space = me?.space;
    const near = (e: { space: string; x: number; y: number }) => !me || (e.space === space && dist2(e, me) <= AOI * AOI);
    const out: EntityState[] = [];
    for (const p of w.players.values()) out.push(playerState(w, p));
    for (const e of w.enemies.values()) if (near(e)) out.push(enemyState(w, e));
    for (const pr of w.projectiles.values()) if (!pr.dead && near(pr)) out.push({
      id: pr.id, space: pr.space, kind: 'projectile', def: pr.visual, x: Math.round(pr.x), y: Math.round(pr.y), facing: facing4({ x: pr.vx, y: pr.vy }), anim: 'fly',
      data: { vx: Math.round(pr.vx), vy: Math.round(pr.vy), k: pr.kind, r: pr.radius, team: pr.team },
    });
    for (const z of w.zones.values()) if (near(z)) out.push({
      id: z.id, space: z.space, kind: 'object', def: `fx:${z.visual}`, x: Math.round(z.x), y: Math.round(z.y), facing: facing4(z.dir), anim: z.kind,
      data: { shape: z.area.shape, r: Math.round(z.area.r ?? 0), len: z.area.len ?? 0, w: z.area.width ?? 0, ang: Math.round(Math.atan2(z.dir.y, z.dir.x) * 57.3), ms: Math.max(0, Math.round(z.until - w.t)), team: z.team, k: z.cast.kind },
    });
    for (const h of w.hazards.values()) if (near(h)) out.push({
      id: h.id, space: h.space, kind: 'object', def: `hz:${h.kind}`, x: Math.round(h.x), y: Math.round(h.y), facing: 's', anim: h.kind,
      data: { r: h.r, on: w.t < h.activeUntil, doused: w.t < h.dousedUntil, left: Number.isFinite(h.charges) ? h.charges : -1 },
    });
    for (const l of w.loot.values()) if (near(l)) out.push({
      id: l.id, space: l.space, kind: 'loot', def: l.item?.base ?? 'gold', x: Math.round(l.x), y: Math.round(l.y), facing: 's', anim: 'idle', owner: l.lockTo?.slice(2),
      data: { qty: l.item?.qty ?? l.gold ?? 0, ilvl: l.item?.ilvl ?? 0 },
    });
    return out;
  }

  // ───────────── CombatService ─────────────
  spawn(req: SpawnRequest): string { return spawnCreature(this.w, req)?.id ?? ''; }
  /** Bosses whose in-fight story beat is a flag (`yieldOnFlag:<flag>`, Claude 4's mapping) yield once it is set. */
  private storyYields(): void {
    for (const e of this.w.enemies.values()) {
      if (e.dead || e.yielded || e.kind !== 'enemy') continue;
      for (const k of e.stats.hooks.keys()) {
        if (k.startsWith('yieldOnFlag:') && this.w.flag(k.slice(12))) { yieldEnemy(this.w, e); break; }
      }
    }
  }

  // ───────────── arena hazards (docs/systems/ARENA_HAZARDS.md) ─────────────
  addHazard(h: HazardSpec): void { addHazard(this.w, h); }
  removeHazard(id: string): void { removeHazard(this.w, id); }

  /** Despawning a yielded boss is the story sparing it (or letting it escape): the party still gets its loot. */
  despawn(id: string): void {
    const e = this.w.enemies.get(id);
    if (e?.escort && !e.dead) loseEscort(this.w, e, 'despawned');
    if (e?.yielded && !e.dead && e.team === 'enemies') rollKillLoot(this.w, e, nearPlayers(this.w, e));
    if (e && e.tier !== 'enemy') clearHazards(this.w, e.space);
    this.w.enemies.delete(id);
  }
  damage(targetId: string, amount: number, kind: DamageKind, sourceId?: string): void {
    const t = this.w.combatant(targetId);
    if (t) dealDamage(this.w, sourceId ? this.w.combatant(sourceId) ?? null : null, t, amount, kind, { dot: true, noProc: true });
  }
  heal(targetId: string, amount: number): void { const t = this.w.combatant(targetId); if (t) heal(this.w, t, t, amount); }
  applyStatus(targetId: string, status: StatusApply): void { const t = this.w.combatant(targetId); if (t) applyStatus(this.w, null, t, status); }
  entitiesNear(space: string, x: number, y: number, r: number, kinds?: CombatantInfo['kind'][]): CombatantInfo[] {
    const out: CombatantInfo[] = [];
    for (const c of this.w.combatants(space)) if ((!kinds || kinds.includes(c.kind)) && dist2(c, { x, y }) <= r * r) out.push(info(c));
    return out;
  }
  players(): CombatantInfo[] { return [...this.w.players.values()].map(info); }
  setFrozen(frozen: boolean): void { this.w.frozen = frozen; }
}

/**
 * A remote player's later loadouts may rearrange (equip, learn, bind, dye) but not mint: the authority keeps level, XP,
 * gold, points and legendaries, and only items it already knows (by uid, with its own ilvl/qty) survive.
 */
function mergeRemote(prev: CharacterSave, next: CharacterSave): CharacterSave {
  const known = new Map<string, CharacterSave['inventory'][number]>();
  for (const it of [...prev.inventory, ...Object.values(prev.equipment)]) if (it) known.set(it.uid, it);
  // gems and item levels are the runeforge's business (authority): a loadout only rearranges known pieces
  const keep = (it: CharacterSave['inventory'][number] | undefined): CharacterSave['inventory'][number] | undefined => (it && known.has(it.uid) ? { ...known.get(it.uid)! } : undefined);
  const equipment: CharacterSave['equipment'] = {};
  for (const [slot, it] of Object.entries(next.equipment)) { const k = keep(it); if (k) equipment[slot as keyof CharacterSave['equipment']] = k; }
  const used = new Set(Object.values(equipment).map((x) => x!.uid));
  const inventory = next.inventory.map(keep).filter((x): x is NonNullable<typeof x> => !!x && !used.has(x.uid));
  // anything the client dropped from its lists stays in the pack (no silent deletion either)
  for (const it of known.values()) if (!used.has(it.uid) && !inventory.some((x) => x.uid === it.uid)) inventory.push(it);
  return {
    ...next, inventory, equipment,
    level: prev.level, xp: prev.xp, gold: prev.gold, bonusPoints: prev.bonusPoints, legendariesSeen: prev.legendariesSeen,
    chests: [...chestsOf(prev)], // authority-owned: a client can not forget a chest to loot it again
  } as CharacterSave;
}

function info(c: Combatant): CombatantInfo {
  return {
    id: c.id, kind: c.kind, def: c.def, space: c.space, x: c.x, y: c.y, hp: Math.round(c.hp), maxHp: c.maxHp, level: c.level,
    downed: c.kind === 'player' ? !!(c as PlayerEnt).downed : undefined, playerId: c.kind === 'player' ? (c as PlayerEnt).playerId : undefined,
  };
}

const csv = (xs: Iterable<string>) => [...xs].join(',');

function playerState(w: SimWorld, p: PlayerEnt): EntityState {
  const cd = (i: number) => { const id = p.save.hotbar[i]; return id ? Math.max(0, Math.round((p.cds.get(id) ?? 0) - w.t)) : 0; };
  return {
    id: p.id, space: p.space, kind: 'player', def: p.def, x: Math.round(p.x), y: Math.round(p.y), facing: facing4(p.face),
    anim: p.dead ? 'dead' : p.downed ? 'down' : p.anim, hp: Math.max(0, Math.round(p.hp)), maxHp: p.maxHp, owner: p.playerId,
    data: {
      em: Math.round(p.ember), emMax: p.emberMax, st: Math.round(p.stamina), stMax: p.staminaMax,
      lvl: p.save.level, xp: p.save.xp, xpMax: xpToNext(p.save.level), sh: Math.round(p.shield), mo: p.momentum, dc: p.dashCharges,
      c1: cd(0), c2: cd(1), c3: cd(2), c4: cd(3), cq: Math.max(0, Math.round(p.potionReadyAt.q - w.t)), ce: Math.max(0, Math.round(p.potionReadyAt.e - w.t)),
      cast: p.windup?.label ?? '', tg: p.target ?? '', s: csv(p.statuses.keys()), b: csv(p.buffs.map((b) => b.id)),
      lk: lookOf(p),
      down: p.downed ? Math.round(p.downed.until - w.t) : 0, rv: p.downed ? Math.round(p.downed.revive) : 0, stealth: p.stealth,
    },
  };
}

/** The loadout may carry the hero look (client adds it); the key drives re-baking on every client. */
function lookOf(p: PlayerEnt): string {
  const look = (p.save as unknown as { look?: HeroLookLite }).look;
  return lookKey(p.save.classId, look, paperdoll(p.save, look));
}

/** "Vampiric Molten Thunderbird": affix prefixes + the creature's name. */
function eliteName(e: EnemyEnt): string {
  return [...(e.elite ?? []).map((a) => eliteAffix(a)?.prefix ?? a), e.cdef.name.replace(/^The /, '')].join(' ');
}

function enemyState(w: SimWorld, e: EnemyEnt): EntityState {
  return {
    id: e.id, space: e.space, kind: e.kind, def: e.def, x: Math.round(e.x), y: Math.round(e.y), facing: facing4(e.face), anim: e.dead ? 'die' : e.anim,
    hp: Math.max(0, Math.round(e.hp)), maxHp: e.maxHp, owner: e.ownerId?.slice(2),
    data: { lvl: e.level, tier: e.tier, ph: e.phase + 1, cos: !!e.storyPet, elite: e.elite?.join(',') ?? '', ename: e.elite?.length ? eliteName(e) : '', s: csv(e.statuses.keys()), cast: e.windup?.label ?? '', sh: Math.round(e.shield), team: e.team,
      ...(e.escort ? { esc: 1, npc: e.escort.npc ?? '', name: e.cdef.name, down: e.escort.down ? Math.max(0, Math.round(e.escort.down.until - w.t)) : 0, rv: Math.round(e.escort.down?.revive ?? 0) } : {}) },
  };
}
