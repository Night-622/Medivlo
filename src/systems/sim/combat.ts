/**
 * Combat resolution (Claude 3, HOLLOW_CROWN.md §2.1): damage pipeline, healing, shields, statuses, buffs, procs.
 * hit = base × (1+Σinc) × Πmore × crit × mitigation × (1+taken) — armour vs physical/martial, resist vs magic.
 */
import { MAGIC_SCHOOLS } from '@/core/constants';
import { hook, moreWith, statWith } from '@/systems/rules/stats';
import type { Action, DamageKind, HitFlag, Proc, StatusApply, StatusId, Trigger } from '@/systems/rules/types';
import { runActions } from './actions';
import { spendStormCharge } from './keystones';
import { onCombatantZero } from './death';
import { hazardDamageMult } from './hazards';
import type { BuffInst, CastCtx, Combatant, EnemyEnt, PlayerEnt, StatusInst } from './state';
import { isBehind, type SimWorld } from './world';

const HARD_CC: StatusId[] = ['stun', 'freeze', 'knockdown', 'sleep', 'root', 'taunt', 'confuse'];
const STATUS_MS: Record<StatusId, number> = {
  burn: 3000, chill: 3000, freeze: 1500, shock: 3000, bleed: 4000, poison: 5000, root: 2000, stun: 1500, blind: 3000, mark: 6000,
  sleep: 4000, taunt: 3000, slow: 2500, knockdown: 900, confuse: 3000, vulnerable: 4000, weaken: 4000, stealth: 5000, linked: 6000, doom: 8000,
};
const DOT: Partial<Record<StatusId, number>> = { burn: 0.2, bleed: 0.15, poison: 0.12 };

export const isMagic = (k: DamageKind): boolean => (MAGIC_SCHOOLS as readonly string[]).includes(k);
export const has = (c: Combatant, s: StatusId): boolean => c.statuses.has(s);
export const flagged = (c: Combatant, f: BuffInst['flags'][number]): boolean => c.buffs.some((b) => b.flags.includes(f) && (b.charges === undefined || b.charges > 0));
export const incapacitated = (c: Combatant): boolean => has(c, 'stun') || has(c, 'freeze') || has(c, 'knockdown') || has(c, 'sleep');
export const rooted = (c: Combatant): boolean => incapacitated(c) || has(c, 'root');

export interface HitOpts { cast?: CastCtx; isSpell?: boolean; flags?: HitFlag[]; noProc?: boolean; status?: StatusApply[]; dot?: boolean }

/** Deal damage; returns the amount that landed (after shields). */
/** Melee guard (see dealDamage); bows, staves and wands fight from range. */
const MELEE_GUARD = 0.12;
const RANGED_WEAPONS = new Set(['bow', 'staff', 'wand']);

export function dealDamage(w: SimWorld, src: Combatant | null, tgt: Combatant, raw: number, kind: DamageKind, o: HitOpts = {}): number {
  if (tgt.dead || raw <= 0) return 0;
  const flags = o.flags ?? [];
  const hitInfo = { x: Math.round(tgt.x), y: Math.round(tgt.y), sourceId: src?.id ?? 'world', targetId: tgt.id, type: kind };
  if (src && src !== tgt && !w.hostile(src, tgt) && !o.dot) return 0;
  // scripted damage (no source) finishes a yielded boss: the story chose "destroy"
  if (!src && tgt.kind === 'enemy' && (tgt as EnemyEnt).yielded) { tgt.hp = 0; tgt.buffs = []; onCombatantZero(w, tgt, null); return raw; }
  if (((tgt.motion?.iframes || (tgt.iframesUntil ?? 0) > w.t) && !o.dot) || flagged(tgt, 'invulnerable')) {
    consumeCharge(w, tgt, 'invulnerable');
    w.emit('combat:hit', { ...hitInfo, amount: 0, crit: false, kind: 'immune' });
    return 0;
  }
  if (src) { w.refresh(src); }
  w.refresh(tgt);
  // blind: attacks miss half the time
  if (src && has(src, 'blind') && !o.isSpell && !o.dot && w.rng.chance(0.5)) {
    w.emit('combat:hit', { ...hitInfo, amount: 0, crit: false, kind: 'miss' });
    return 0;
  }
  // parry (buff) — negate and counter
  if (src && !o.dot && flagged(tgt, 'parry')) {
    consumeCharge(w, tgt, 'parry');
    w.emit('combat:hit', { ...hitInfo, amount: 0, crit: false, kind: 'block' });
    fireProcs(w, tgt, 'parry', src);
    if (tgt.kind === 'player') counterAttack(w, tgt as PlayerEnt, src);
    return 0;
  }
  let amount = raw, crit = false;
  if (src) {
    const ctx = w.condCtx(src, tgt);
    const inc = 1 + statWith(src.stats, 'dmg', ctx) + statWith(src.stats, `dmg.${kind}`, ctx)
      + statWith(src.stats, o.isSpell ? 'spellDmg' : 'attackDmg', ctx);
    amount *= Math.max(0.1, inc) * moreWith(src.stats, 'dmg', ctx);
    const berserk = hook(src.stats, 'berserker');
    if (berserk) amount *= 1 + berserk * Math.floor((1 - ctx.hpFrac) * 10);
    if (hook(src.stats, 'armorToDamage')) amount += (src.stats.stats.armor ?? 0) * 0.15;
    // Eye of the Storm: charges built standing still go into the next real hit
    if (src.kind === 'player' && !o.dot && hook(src.stats, 'stormCharge')) amount *= spendStormCharge(src as PlayerEnt);
    if (!o.dot) {
      const forced = flags.includes('alwaysCrit') || consumeCharge(w, src, 'nextHitsCrit');
      const chance = statWith(src.stats, 'crit', ctx) + (forced ? 1 : 0);
      if (w.rng.chance(chance)) { crit = true; amount *= 1 + Math.max(0, statWith(src.stats, 'critd', ctx)); }
    }
  }
  // mitigation
  const ignoreArmor = flags.includes('ignoreArmor') || (src ? consumeCharge(w, src, 'nextHitsTrue') : false);
  if (isMagic(kind)) amount *= 1 - Math.min(0.6, tgt.stats.stats[`resist.${kind}`] ?? 0);
  else if (!ignoreArmor && !o.dot) {
    const armor = tgt.kind === 'enemy' || tgt.kind === 'pet' ? (tgt as EnemyEnt).armor : tgt.stats.stats.armor ?? 0;
    amount *= 1 - Math.min(0.75, armor / (armor + 40 + 12 * (src?.level ?? tgt.level)));
  }
  const tctx = w.condCtx(tgt, src);
  let taken = 1 + statWith(tgt.stats, 'dmgTaken', tctx) + (has(tgt, 'vulnerable') ? 0.25 : 0) + (tgt.statuses.get('mark')?.power ?? 0);
  if (kind === 'storm' && has(tgt, 'shock')) taken += 0.15;
  if (src && has(src, 'weaken')) taken -= 0.25;
  // melee guard: heroes who fight in the pack (melee weapon) take 12% less from creatures (gauntlet: melee ran dry first)
  if (tgt.kind === 'player' && src && src.kind !== 'player' && MELEE_GUARD && !RANGED_WEAPONS.has((tgt as PlayerEnt).weapon.type)) taken -= MELEE_GUARD;
  amount *= Math.max(0.1, taken);
  if (src?.kind === 'player' && tgt.kind === 'player') amount *= 0.5; // PvP normalisation
  // arena set pieces: light-only bosses in the dark, shielded / pay-back bosses while pillars stand
  if (w.hazards.size && tgt.kind === 'enemy') {
    const hm = hazardDamageMult(w, tgt, src, amount);
    if (hm <= 0) { w.emit('combat:hit', { ...hitInfo, amount: 0, crit: false, kind: 'immune' }); return 0; }
    amount *= hm;
  }
  // thick skin: first hit every N ms is halved
  const thick = hook(tgt.stats, 'thickSkin');
  if (thick && w.t - tgt.lastHalvedAt >= thick && !o.dot) { amount *= 0.5; tgt.lastHalvedAt = w.t; }
  // block (chance; front block negates)
  if (src && !o.dot && !o.isSpell) {
    const front = flagged(tgt, 'blockFront') && !isBehind(src, tgt);
    if (front || w.rng.chance(Math.min(0.75, tgt.stats.stats.block ?? 0))) {
      amount = front ? 0 : amount * 0.4;
      w.emit('combat:hit', { ...hitInfo, amount: Math.round(amount), crit: false, kind: 'block' });
      fireProcs(w, tgt, 'block', src);
      if (amount <= 0) return 0;
    }
  }
  if (src && tgt.kind !== 'player' && hook(tgt.stats, 'frontBlock') && !isBehind(src, tgt)) amount *= 1 - hook(tgt.stats, 'frontBlock');
  // elite affixes: warding (pack nearby) and thorny (melee hits sting back)
  if (tgt.kind === 'enemy' && src && !o.dot) {
    const ward = hook(tgt.stats, 'warding');
    if (ward && [...w.combatants(tgt.space)].some((x) => x !== tgt && x.team === tgt.team && (x.x - tgt.x) ** 2 + (x.y - tgt.y) ** 2 < 150 * 150)) amount *= 1 - ward;
    const thorn = hook(tgt.stats, 'thorny');
    // thorns sting, they do not duel: capped per hit so fast multi-hit melee is not out-traded (Thorny Lava Slime vs Corsair)
    if (thorn && !o.isSpell && (src.x - tgt.x) ** 2 + (src.y - tgt.y) ** 2 < 100 * 100) dealDamage(w, tgt, src, Math.min(amount * thorn, src.maxHp * 0.015), 'physical', { dot: true, noProc: true });
  }
  amount = Math.max(1, Math.round(amount));
  // shields
  let landed = amount;
  if (tgt.shield > 0 && w.t < tgt.shieldUntil) {
    const soak = Math.min(tgt.shield, landed);
    tgt.shield -= soak;
    landed -= soak;
  }
  tgt.hp -= landed;
  tgt.inCombatUntil = w.t + 5000;
  if (src) src.inCombatUntil = w.t + 5000;
  if (has(tgt, 'sleep')) tgt.statuses.delete('sleep');
  w.emit('combat:hit', { ...hitInfo, amount, crit, kind: 'dmg' });
  if (tgt.kind === 'player' && src) (tgt as PlayerEnt).lastHitBy = src.id;
  if (tgt.kind === 'player') w.emit('player:damaged', { amount, type: kind as never, sourceId: src?.id ?? 'world', playerId: (tgt as PlayerEnt).playerId });
  if (src) {
    tgt.threat.set(src.id, (tgt.threat.get(src.id) ?? 0) + amount * (flags.includes('taunt') ? 5 : 1));
    const ls = (src.stats.stats.lifesteal ?? 0) + (flags.includes('lifesteal') ? 0.5 : 0);
    if (ls > 0) heal(w, src, src, amount * ls, true);
    if (flagged(tgt, 'reflect') && !o.isSpell && !o.dot) dealDamage(w, tgt, src, amount * 0.3, 'physical', { noProc: true, dot: true });
    if (hook(tgt.stats, 'thornskin') && !o.isSpell && !o.dot && Math.hypot(src.x - tgt.x, src.y - tgt.y) < 90) applyStatus(w, tgt, src, { id: 'root', dur: 1000 });
  }
  // linked: share half with the other linked targets of the same source
  const link = tgt.statuses.get('linked');
  if (link && !o.dot) for (const other of w.combatants(tgt.space)) {
    if (other !== tgt && other.statuses.get('linked')?.sourceId === link.sourceId) dealDamage(w, null, other, amount * 0.5, kind, { dot: true });
  }
  for (const s of o.status ?? []) applyStatus(w, src, tgt, s, o.cast);
  if (src && !o.noProc && !flags.includes('noProc') && !o.dot) {
    fireProcs(w, src, 'hit', tgt);
    if (crit) fireProcs(w, src, 'crit', tgt);
    if (consumeCharge(w, src, 'nextHitsChain')) runActions(w, [{ a: 'chain', coef: 0.5, kind: 'storm', jumps: 2 + (src.stats.stats.chains ?? 0), range: 130 }], o.cast ?? basicCast(w, src, tgt));
  }
  if (tgt.kind === 'player' && !o.dot) fireProcs(w, tgt, 'hurt', src ?? undefined);
  if (tgt.kind === 'player' && tgt.hp / tgt.maxHp < 0.5) fireProcs(w, tgt, 'lowHp', src ?? undefined);
  if (tgt.hp <= 0) onCombatantZero(w, tgt, src);
  return landed;
}

export function heal(w: SimWorld, src: Combatant, tgt: Combatant, amount: number, silent = false): number {
  if (tgt.dead || amount <= 0) return 0;
  const mult = (1 + (src.stats.stats.healing ?? 0)) * (1 + (tgt.stats.stats.healingTaken ?? 0));
  const want = amount * mult, room = tgt.maxHp - tgt.hp, got = Math.min(room, want);
  tgt.hp += got;
  if (want > room && hook(src.stats, 'overheal')) addShield(w, tgt, want - room, 6000);
  if (!silent && got >= 1) {
    w.emit('combat:hit', { x: Math.round(tgt.x), y: Math.round(tgt.y), sourceId: src.id, targetId: tgt.id, amount: Math.round(got), type: 'radiance', crit: false, kind: 'heal' });
    fireProcs(w, src, 'heal', tgt);
    if (tgt !== src) fireProcs(w, tgt, 'heal', src);
  }
  return got;
}

export function addShield(w: SimWorld, c: Combatant, amount: number, dur: number): void {
  c.shield = (w.t < c.shieldUntil ? c.shield : 0) + amount;
  c.shieldUntil = w.t + dur;
}

export function applyStatus(w: SimWorld, src: Combatant | null, tgt: Combatant, s: StatusApply, cast?: CastCtx): void {
  if (tgt.dead || (s.chance !== undefined && !w.rng.chance(s.chance))) return;
  if (hook(tgt.stats, `immune:${s.id}`)) return;
  // Sure Footed: no slow lands while you are dashing
  if ((s.id === 'slow' || s.id === 'chill') && tgt.motion && hook(tgt.stats, 'dashNoSlow')) return;
  // Pyromaniac's price: every burn you set singes you too (1% of your max HP, at most every 0.5 s)
  if (s.id === 'burn' && src && src !== tgt && src.kind === 'player' && hook(src.stats, 'selfSinge') && w.t >= ((src as PlayerEnt).singeAt ?? 0)) {
    (src as PlayerEnt).singeAt = w.t + 500;
    dealDamage(w, src, src, src.maxHp * 0.01, 'ash', { dot: true, noProc: true });
  }
  const boss = tgt.kind === 'enemy' && (tgt as EnemyEnt).tier === 'boss';
  const hard = HARD_CC.includes(s.id);
  if (hard && (w.t < tgt.ccImmuneUntil || flagged(tgt, 'unstoppable') || hook(tgt.stats, 'unstoppable'))) return;
  let dur = s.dur ?? STATUS_MS[s.id];
  if (src) dur *= 1 + (src.stats.stats.statusDur ?? 0) + (s.id === 'root' ? src.stats.stats.rootDur ?? 0 : 0);
  if (src && s.id === 'root') dur += hook(src.stats, 'rootDurMs');
  if (src && s.id === 'burn') dur += hook(src.stats, 'burnDurMs');
  if (hard && tgt.kind === 'player') dur *= Math.max(0.2, 1 + (tgt.stats.stats.stunTaken ?? 0));
  if (hard && src?.kind === 'player' && tgt.kind === 'player') dur *= 0.5;
  if (hard && boss) { dur *= 0.5; tgt.ccImmuneUntil = w.t + dur + 4000; }
  const prev = tgt.statuses.get(s.id);
  const power = (s.power ?? defaultPower(s.id)) * (src && (s.id === 'slow' || s.id === 'chill') ? 1 + (src.stats.stats.slowPower ?? 0) : 1);
  const dotCoef = DOT[s.id] ?? 0;
  const burnBonus = s.id === 'burn' && src ? 1 + hook(src.stats, 'burnPower') : 1;
  const dps = dotCoef ? dotCoef * (cast?.power ?? (src ? srcPower(src) : 10)) * burnBonus : 0;
  const stacks = Math.min(s.id === 'poison' || s.id === 'chill' ? 5 : 1, (prev?.stacks ?? 0) + 1);
  const inst: StatusInst = {
    id: s.id, until: Math.max(prev?.until ?? 0, w.t + dur), power, sourceId: src?.id ?? 'world',
    dps: Math.max(prev?.dps ?? 0, dps) * (s.id === 'poison' ? stacks : 1) / (s.id === 'poison' && prev ? prev.stacks : 1),
    kind: cast?.kind ?? (s.id === 'burn' ? 'ash' : 'physical'), stacks, nextTick: prev?.nextTick ?? w.t + 500,
  };
  tgt.statuses.set(s.id, inst);
  if (s.id === 'taunt' && src && tgt.kind !== 'player') (tgt as EnemyEnt).targetId = src.id;
  // chill builds to freeze (Rimecaller passive: 3 stacks, otherwise 4)
  if (s.id === 'chill' && stacks >= (src && hook(src.stats, 'chillToFreeze') ? 3 : 4)) {
    tgt.statuses.delete('chill');
    applyStatus(w, src, tgt, { id: 'freeze', dur: 1200 });
  }
  if (hard) { tgt.windup = null; if (tgt.motion && !tgt.motion.iframes) tgt.motion = null; }
  w.emit('status:changed', { entityId: tgt.id, status: s.id, stacks, ms: Math.round(inst.until - w.t) });
}

const defaultPower = (s: StatusId): number => (s === 'slow' ? 0.3 : s === 'chill' ? 0.25 : s === 'mark' ? 0.25 : 0);
export const srcPower = (c: Combatant): number =>
  c.kind === 'player' ? ((c as PlayerEnt).weapon.min + (c as PlayerEnt).weapon.max) / 2 + (c.stats.stats.sp ?? 0) * 0.5 : (c as EnemyEnt).dmg;

/** Status timers and damage over time. */
export function tickStatuses(w: SimWorld, c: Combatant): void {
  for (const [id, s] of c.statuses) {
    if (w.t >= s.until) {
      c.statuses.delete(id);
      w.emit('status:changed', { entityId: c.id, status: id, stacks: 0, ms: 0 });
      continue;
    }
    if (s.dps > 0 && w.t >= s.nextTick) {
      s.nextTick += 500;
      dealDamage(w, w.combatant(s.sourceId) ?? null, c, s.dps / 2, s.kind, { dot: true, noProc: true });
      if (id === 'burn' && c.dead && hook(w.combatant(s.sourceId)?.stats ?? c.stats, 'burnSpread')) {
        for (const o of w.combatants(c.space)) if (Math.hypot(o.x - c.x, o.y - c.y) < 80 && o.team === c.team) applyStatus(w, w.combatant(s.sourceId) ?? null, o, { id: 'burn' });
      }
      if (c.dead) return;
    }
  }
  if (c.shield > 0 && w.t >= c.shieldUntil) c.shield = 0;
}

// ───────────── buffs ─────────────
export function addBuff(w: SimWorld, src: Combatant, tgt: Combatant, a: Extract<Action, { a: 'buff' }>, durMult = 1): void {
  const stacks = hook(src.stats, 'buffStacks');
  const existing = tgt.buffs.filter((b) => b.id === a.id);
  if (existing.length && existing.length >= Math.max(1, stacks)) tgt.buffs = tgt.buffs.filter((b) => b !== existing[0]);
  const ally = tgt !== src;
  const dur = a.dur * durMult * (1 + (src.stats.stats.buffDur ?? 0));
  const power = 1 + (ally || a.to !== 'self' ? src.stats.stats.buffPower ?? 0 : 0);
  tgt.buffs.push({
    id: a.id, until: w.t + dur, sourceId: src.id, charges: a.charges,
    mods: (a.mods ?? []).map((m) => ({ ...m, value: m.value * power })), procs: a.procs ?? [], flags: a.flags ?? [],
  });
  tgt.statsDirty = true;
  if (a.flags?.includes('stealth') && tgt.kind === 'player') (tgt as PlayerEnt).stealth = true;
}

export function tickBuffs(w: SimWorld, c: Combatant): void {
  const before = c.buffs.length;
  c.buffs = c.buffs.filter((b) => w.t < b.until && (b.charges === undefined || b.charges > 0));
  if (c.buffs.length !== before) {
    c.statsDirty = true;
    if (c.kind === 'player' && !c.buffs.some((b) => b.flags.includes('stealth'))) (c as PlayerEnt).stealth = (c as PlayerEnt).stealth && c.buffs.length === before;
  }
}

/** Use one charge of a flagged buff; true if one was used. */
export function consumeCharge(w: SimWorld, c: Combatant, flag: BuffInst['flags'][number]): boolean {
  const b = c.buffs.find((x) => x.flags.includes(flag) && w.t < x.until && (x.charges === undefined || x.charges > 0));
  if (!b) return false;
  if (b.charges !== undefined) { b.charges--; if (b.charges <= 0) { b.until = w.t; c.statsDirty = true; } }
  return true;
}

// ───────────── procs ─────────────
export function fireProcs(w: SimWorld, c: Combatant, on: Trigger, target?: Combatant): void {
  if (c.dead) return;
  w.refresh(c);
  const procs: Proc[] = c.stats.procs;
  for (const p of procs) {
    if (p.on !== on) continue;
    if (p.every) {
      const n = (c.procCount.get(p) ?? 0) + 1;
      c.procCount.set(p, n);
      if (n % p.every !== 0) continue;
    }
    if (p.icd && w.t < (c.procReadyAt.get(p) ?? 0)) continue;
    if (p.chance !== undefined && !w.rng.chance(p.chance)) continue;
    if (p.when && !w.evalCond(p.when, w.condCtx(c, target ?? null))) continue;
    if (p.icd) c.procReadyAt.set(p, w.t + p.icd);
    // proc damage never triggers further procs (no chains of chains)
    runActions(w, p.do, { ...basicCast(w, c, target ?? null, true), flags: ['noProc'] });
  }
}

/** A cast context for procs / basic hits: power from the caster's weapon or creature damage. */
export function basicCast(_w: SimWorld, c: Combatant, target: Combatant | null, isSpell = false): CastCtx {
  const aim = target ? { x: target.x, y: target.y } : { x: c.x + c.face.x * 40, y: c.y + c.face.y * 40 };
  return { caster: c, kind: c.kind === 'player' ? kindOf(c as PlayerEnt) : (c as EnemyEnt).cdef.kind,
    power: srcPower(c), isSpell, target, aim, dir: c.face, dmgMult: 1, areaMult: 1, durMult: 1, flags: [], depth: 0 };
}
/** Basic-attack damage kind: kit override, else the school for martial classes, else physical. */
export const kindOf = (p: PlayerEnt): DamageKind => p.kit.basic?.kind ?? (isMagic(p.school) ? 'physical' : p.school);

function counterAttack(w: SimWorld, p: PlayerEnt, src: Combatant): void {
  const roll = w.rng.range(p.weapon.min, p.weapon.max) * (1 + (p.stats.stats.power ?? 0));
  dealDamage(w, p, src, roll * 2, 'physical', { noProc: true });
  if (hook(p.stats, 'parryRefundsDash')) p.dashCharges = Math.max(p.dashCharges, Math.round(p.stats.stats.dashCharges ?? 1));
}
