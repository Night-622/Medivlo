/**
 * Players (Claude 3): build from CharacterSave, consume InputFrames (handoff controls), move, dash, auto-attack,
 * cast 1–4, drink Q/E. Authority only.
 */
import { HC_CLASSES } from '@/data/classes/hc/classes.gen';
import { kitFor, spellScaling } from '@/data/classes/hc/kits';
import { Btn, type InputFrame } from '@/net/types';
import { P } from '@/systems/rules/curves';
import { weaponBase, weaponDamage } from '@/systems/rules/gear';
import { playerPassives } from '@/systems/rules/playerStats';
import { compile, hook } from '@/systems/rules/stats';
import { spellDef } from '@/systems/rules/spells';
import type { BasicAttack, CharacterSave, HcSpell, SpellMod, WeaponType } from '@/systems/rules/types';
import { motionTick, runActions } from './actions';
import { basicCast, consumeCharge, dealDamage, fireProcs, flagged, heal, incapacitated, isMagic, kindOf, rooted } from './combat';
import { newCombatantBase, type CastCtx, type Combatant, type PlayerEnt } from './state';
import { dist, dist2, isBehind, norm, type SimWorld } from './world';

const BASE_SPEED = 130;
const DASH = { dist: 72, ms: 220, cost: 25, gap: 400, recharge: 1000 };
const POTION_CD = 8000;

export const BASIC: Record<WeaponType, BasicAttack> = {
  sword: { form: 'melee', interval: 650, range: 60, arc: 110, coef: 1 },
  axe: { form: 'melee', interval: 800, range: 62, arc: 140, coef: 1 },
  mace: { form: 'melee', interval: 800, range: 58, arc: 100, coef: 1 },
  spear: { form: 'melee', interval: 750, range: 88, arc: 50, coef: 1 },
  dagger: { form: 'melee', interval: 450, range: 52, arc: 90, coef: 1 },
  bow: { form: 'ranged', interval: 750, range: 380, projectileSpeed: 560, coef: 1, visual: 'arrow' },
  staff: { form: 'ranged', interval: 800, range: 340, projectileSpeed: 420, coef: 1 },
  wand: { form: 'ranged', interval: 600, range: 340, projectileSpeed: 460, coef: 0.9 },
};
const CLEAVE: WeaponType[] = ['axe', 'spear'];

export function createPlayer(w: SimWorld, playerId: string, save: CharacterSave, space: string, x: number, y: number): PlayerEnt {
  const kit = kitFor(save.classId);
  const cls = HC_CLASSES.find((c) => c.id === save.classId)!;
  const empty = compile([]);
  const p: PlayerEnt = {
    ...newCombatantBase(),
    id: `p:${playerId}`, kind: 'player', def: `class:${save.classId}`, space, x, y, r: 10, face: { x: 0, y: 1 }, team: 'players',
    level: save.level, hp: 1, maxHp: 1, base: empty, stats: empty, playerId, school: cls.school, save, kit,
    weapon: { type: kit.weapons[0], min: 1, max: 2, offMin: 0, offMax: 0 }, spells: new Map(),
    ember: 0, emberMax: 0, stamina: 0, staminaMax: 0, momentum: 0, dashCharges: 1, dashReadyAt: 0, cds: new Map(),
    attackReadyAt: 0, potionReadyAt: { q: 0, e: 0 }, target: null, aim: { x, y: y + 40 }, move: { x: 0, y: 0 }, buttons: 0, lastSeq: -1,
    downed: null, respawnAt: 0, stealth: false, duelWith: null, spawnProtectUntil: w.t + 3000, attackCount: 0, lastHitBy: null,
  };
  rebuildPlayer(w, p);
  p.hp = p.maxHp; p.ember = p.emberMax; p.stamina = p.staminaMax;
  w.players.set(p.id, p);
  return p;
}

/** Recompute everything derived from the save (level, gear, tree). Keeps current HP/Ember fractions. */
export function rebuildPlayer(_w: SimWorld, p: PlayerEnt): void {
  const s = p.save;
  p.level = s.level;
  const { passives: sources, spells: treeSpells } = playerPassives(s);
  const hpFrac = p.maxHp > 1 ? p.hp / p.maxHp : 1, emFrac = p.emberMax ? p.ember / p.emberMax : 1;
  p.base = compile(sources);
  p.statsDirty = true;
  p.stats = p.base;
  p.maxHp = Math.round(p.base.stats.hp ?? 100);
  p.emberMax = Math.round(p.base.stats.ember ?? 100);
  p.staminaMax = Math.round(p.base.stats.stamina ?? 100);
  p.hp = Math.max(1, Math.round(p.maxHp * hpFrac));
  p.ember = p.emberMax * emFrac;
  // weapons: main hand, else the class start weapon at 70%
  const main = s.equipment.main, off = s.equipment.off;
  const mainId = main?.base ?? p.kit.startWeapon, mainLvl = main?.ilvl ?? s.level;
  const [min, max] = weaponDamage(mainId, mainLvl).map((v) => v * (main ? 1 : 0.7));
  const [offMin, offMax] = off ? weaponDamage(off.base, off.ilvl).map((v) => v * 0.5) : [0, 0];
  p.weapon = { type: weaponBase(mainId)?.type ?? p.kit.weapons[0], min, max, offMin, offMax };
  // spells: kit + tree grants
  p.spells.clear();
  for (const id of [...p.kit.spells, ...treeSpells]) { const sp = spellDef(id); if (sp) p.spells.set(id, sp); }
  if (!s.hotbar.some(Boolean)) s.hotbar = [p.kit.spells[0], p.kit.spells[1], p.kit.spells[2], null];
  p.dashCharges = Math.min(p.dashCharges, Math.round(p.base.stats.dashCharges ?? 1));
}

// ───────────── per-tick control ─────────────
export function stepPlayer(w: SimWorld, p: PlayerEnt, frames: InputFrame[], dt: number): void {
  w.refresh(p);
  for (const f of frames) {
    // defensive: AuthorityNet sanitises frames, but a malformed one must never throw inside the tick
    if (!f || typeof f.seq !== 'number' || !f.move || !f.aim || !Number.isFinite(f.aim.x) || !Number.isFinite(f.aim.y)) continue;
    if (f.seq <= p.lastSeq) continue;
    p.lastSeq = f.seq;
    const pressed = f.buttons & ~p.buttons;
    p.buttons = f.buttons;
    p.move = clampMove(f.move);
    p.aim = f.aim;
    if (f.target !== undefined) setTarget(w, p, f.target);
    if (p.dead || p.downed || w.frozen) continue;
    if (pressed & Btn.DASH) dash(w, p);
    if (pressed & Btn.CAST1) cast(w, p, 0);
    if (pressed & Btn.CAST2) cast(w, p, 1);
    if (pressed & Btn.CAST3) cast(w, p, 2);
    if (pressed & Btn.CAST4) cast(w, p, 3);
    if (pressed & Btn.POTION_Q) potion(w, p, 'q');
    if (pressed & Btn.POTION_E) potion(w, p, 'e');
  }
  if (p.dead) return;
  regen(w, p, dt);
  move(w, p, dt);
  if (p.downed || w.frozen) return;
  if (p.windup && w.t >= p.windup.until) { const go = p.windup.then; p.windup = null; go(); }
  autoAttack(w, p);
  // dash charges
  const maxCharges = Math.round(p.stats.stats.dashCharges ?? 1);
  if (p.dashCharges < maxCharges && w.t >= p.dashReadyAt + DASH.recharge) { p.dashCharges++; p.dashReadyAt = w.t; }
  // Shade: stealth after a while out of combat
  const st = hook(p.stats, 'stealthOutOfCombat');
  if (st && !p.stealth && w.t > p.inCombatUntil - 5000 + st) p.stealth = true;
}

const clampMove = (m: { x: number; y: number }) => {
  if (!Number.isFinite(m.x) || !Number.isFinite(m.y)) return { x: 0, y: 0 };
  const l = Math.hypot(m.x, m.y);
  return l > 1 ? { x: m.x / l, y: m.y / l } : { x: m.x, y: m.y };
};

function setTarget(w: SimWorld, p: PlayerEnt, id: string | null): void {
  if (id === null) { if (p.buttons & Btn.ATTACK) p.target = null; return; }
  const t = w.combatant(id);
  if (t && w.hostile(p, t)) p.target = id;
}

function regen(w: SimWorld, p: PlayerEnt, dt: number): void {
  const s = dt / 1000, st = p.stats.stats;
  if (p.downed) return;
  const inCombat = w.t < p.inCombatUntil;
  // in combat: gear/tree regen (incl. "in combat" bonuses); out of combat: +2% max HP per second
  const hpRegen = (st.hpRegen ?? 0) + (inCombat ? condFlat(p, 'hpRegen') : p.maxHp * 0.02);
  p.hp = Math.min(p.maxHp, p.hp + hpRegen * s);
  p.ember = Math.min(p.emberMax, p.ember + (st.emberRegen ?? 5) * s);
  if (!p.motion) p.stamina = Math.min(p.staminaMax, p.stamina + (st.staminaRegen ?? 20) * s);
}
const condFlat = (p: PlayerEnt, stat: string) => p.stats.conditional.filter((m) => m.stat === stat && m.op === 'flat').reduce((a, m) => a + m.value, 0);

function speedOf(w: SimWorld, p: Combatant): number {
  if (rooted(p) || p.windup) return 0;
  let v = BASE_SPEED * (1 + (p.stats.stats.moveSpeed ?? 0));
  const chill = p.statuses.get('chill'), slow = p.statuses.get('slow');
  if (chill) v *= 1 - Math.min(0.7, chill.power * Math.min(chill.stacks, 3));
  if (slow) v *= 1 - Math.min(0.7, slow.power);
  if (p.kind === 'player' && (p as PlayerEnt).downed) v *= 0.3;
  void w;
  return v;
}

function move(w: SimWorld, p: PlayerEnt, dt: number): void {
  const s = dt / 1000;
  if (p.motion) {
    const m = p.motion, ended = w.t >= m.until;
    const n = w.ports.move(p.space, p.x, p.y, m.vx * s, m.vy * s, p.r);
    p.x = n.x; p.y = n.y; p.movedAt = w.t;
    motionTick(w, p, ended);
    if (ended && p.motion === m) p.motion = null;
    return;
  }
  let dir = p.move;
  // auto-approach the click target when not steering
  const t = w.combatant(p.target);
  if (t && (t.dead || t.space !== p.space || dist2(p, t) > 700 * 700)) p.target = null;
  if (!dir.x && !dir.y && t && !p.downed && dist(p, t) > attackRange(p) + t.r) dir = norm(t.x - p.x, t.y - p.y);
  if (p.statuses.has('confuse') && (dir.x || dir.y)) dir = { x: -dir.y, y: dir.x };
  const v = speedOf(w, p);
  if ((dir.x || dir.y) && v > 0) {
    const n = w.ports.move(p.space, p.x, p.y, dir.x * v * s, dir.y * v * s, p.r);
    if (n.x !== p.x || n.y !== p.y) p.movedAt = w.t;
    p.x = n.x; p.y = n.y;
    p.face = norm(dir.x, dir.y);
    if (w.t >= p.animUntil) p.anim = 'walk';
  } else if (w.t >= p.animUntil) p.anim = p.downed ? 'down' : 'idle';
}

function dash(w: SimWorld, p: PlayerEnt): void {
  if (incapacitated(p) || p.statuses.has('root') || p.motion || p.windup) return;
  if (p.dashCharges <= 0 || w.t < p.dashReadyAt + DASH.gap) return;
  const free = flagged(p, 'freeDash');
  if (!free && p.stamina < DASH.cost) return;
  if (!free) p.stamina -= DASH.cost;
  p.dashCharges--;
  p.dashReadyAt = w.t;
  const d = p.move.x || p.move.y ? norm(p.move.x, p.move.y) : norm(p.aim.x - p.x, p.aim.y - p.y);
  const v = (DASH.dist / DASH.ms) * 1000;
  p.motion = { vx: d.x * v, vy: d.y * v, until: w.t + DASH.ms, iframes: true };
  p.face = d;
  p.anim = 'dash'; p.animUntil = w.t + DASH.ms;
  fireProcs(w, p, 'dash');
  w.emit('ability:cast', { casterId: p.id, ability: 'dash', x: Math.round(p.x), y: Math.round(p.y), tx: Math.round(p.x + d.x * DASH.dist), ty: Math.round(p.y + d.y * DASH.dist), ms: DASH.ms });
}

// ───────────── basic attacks ─────────────
const basicOf = (p: PlayerEnt): BasicAttack => ({ ...BASIC[p.weapon.type], ...(p.kit.basic ?? {}) } as BasicAttack);
const attackRange = (p: PlayerEnt): number => basicOf(p).range;

function weaponRoll(w: SimWorld, p: PlayerEnt): number {
  const roll = w.rng.range(p.weapon.min, p.weapon.max) + (p.weapon.offMax ? w.rng.range(p.weapon.offMin, p.weapon.offMax) : 0);
  const caster = p.weapon.type === 'staff' || p.weapon.type === 'wand' ? (p.stats.stats.sp ?? 0) * 0.6 : 0;
  return roll * (1 + (p.stats.stats.power ?? 0)) + caster;
}

function autoAttack(w: SimWorld, p: PlayerEnt): void {
  if (incapacitated(p) || p.windup || p.motion || w.t < p.attackReadyAt) return;
  const b = basicOf(p);
  const t = w.combatant(p.target);
  const ground = !t && (p.buttons & Btn.ATTACK);
  if (!t && !ground) return;
  if (t && (!w.hostile(p, t) || !w.targetable(t))) { p.target = null; return; }
  const aim = t ? { x: t.x, y: t.y } : p.aim;
  const d = dist(p, aim);
  if (t && d > b.range + t.r) return;
  const atkSpeed = 1 + (p.stats.stats.atkSpeed ?? 0) + (p.school === 'fist' ? p.momentum * 0.05 : 0);
  p.attackReadyAt = w.t + b.interval / Math.max(0.3, atkSpeed);
  p.face = norm(aim.x - p.x, aim.y - p.y);
  p.anim = 'attack'; p.animUntil = w.t + 250;
  p.attackCount++;
  fireProcs(w, p, 'attack', t);
  const fromStealth = p.stealth;
  const hits = b.hits ?? 1;
  for (let i = 0; i < hits; i++) {
    const kind = t && hook(p.stats, 'behindUmbral') && isBehind(p, t) ? 'umbral' : kindOf(p);
    const amount = weaponRoll(w, p) * b.coef * (hits > 1 ? 0.6 : 1);
    if (b.form === 'melee') {
      const cast: CastCtx = { ...basicCast(w, p, t ?? null), dir: p.face, aim };
      const foes = [...w.combatants(p.space)].filter((x) => w.hostile(p, x) && w.targetable(x) && inArc(p, x, b.range, b.arc ?? 90));
      foes.sort((a, z) => (a === t ? -1 : z === t ? 1 : dist2(p, a) - dist2(p, z)));
      for (const f of foes.slice(0, CLEAVE.includes(p.weapon.type) ? 3 : 1)) dealDamage(w, p, f, amount, kind, { cast });
    } else {
      runActions(w, [{ a: 'projectile', coef: b.coef * (hits > 1 ? 0.6 : 1), kind, speed: b.projectileSpeed ?? 460, range: b.range + 40, visual: b.visual ?? `${kind}-bolt`, homing: !!t }],
        { ...basicCast(w, p, t ?? null), power: amount / b.coef, dir: p.face, aim });
    }
  }
  if (fromStealth) { p.stealth = false; p.buffs = p.buffs.filter((x) => !x.flags.includes('stealth')); p.statsDirty = true; }
}
const inArc = (p: Combatant, x: Combatant, range: number, arc: number) => {
  const dx = x.x - p.x, dy = x.y - p.y, d = Math.hypot(dx, dy);
  if (d > range + x.r) return false;
  return d < x.r + p.r || (dx * p.face.x + dy * p.face.y) / d >= Math.cos((arc * Math.PI) / 360);
};

// ───────────── spells ─────────────
interface SpellView { spell: HcSpell; dmg: number; cost: number; cd: number; area: number; dur: number; echo: number; twin: boolean; split: boolean; linger: number }
export function spellView(p: PlayerEnt, spell: HcSpell): SpellView {
  const mods = p.stats.spellMods.filter((m: SpellMod) => m.spell === spell.id || m.spell === '*');
  const sum = (k: keyof SpellMod) => mods.reduce((a, m) => a + (typeof m[k] === 'number' ? (m[k] as number) : 0), 0);
  const ult = spell.tags.includes('ultimate');
  return {
    spell, dmg: 1 + sum('dmg'), area: 1 + sum('area'), dur: 1 + sum('dur'), echo: sum('echo'), linger: sum('linger'),
    twin: mods.some((m) => m.twin), split: mods.some((m) => m.split),
    cost: Math.max(0, spell.cost * (1 + sum('cost') + (p.stats.stats.emberCost ?? 0))),
    cd: Math.max(0.25, spell.cd * (1 + sum('cd')) * (1 - Math.min(0.5, p.stats.stats.cdr ?? 0)) * (ult ? 1 - (p.stats.stats.ultCdr ?? 0) : 1)),
  };
}

export function cast(w: SimWorld, p: PlayerEnt, slot: number, spellOverride?: HcSpell): boolean {
  const id = spellOverride?.id ?? p.save.hotbar[slot];
  const spell = spellOverride ?? (id ? p.spells.get(id) : undefined);
  if (!spell || incapacitated(p) || p.windup || p.motion) return false;
  if (!spellOverride && w.t < (p.cds.get(spell.id) ?? 0)) return false;
  const v = spellView(p, spell);
  const free = !!spellOverride || flagged(p, 'freeCasts');
  const hpPay = spell.hpCost ? spell.hpCost * p.maxHp : hook(p.stats, 'spellsCostHp') ? (v.cost / Math.max(1, p.emberMax)) * p.maxHp * 0.5 : 0;
  if (!free && !hpPay && p.ember < v.cost) return false;
  if (!free && hpPay && p.hp <= hpPay) return false;
  // aim
  let target: Combatant | null = null;
  const t = w.combatant(p.target);
  if (spell.aim === 'enemy') target = t && w.hostile(p, t) ? t : w.nearestHostile({ ...p, x: p.aim.x, y: p.aim.y } as Combatant, 160) ?? null;
  if (spell.aim === 'ally') target = nearestAlly(w, p, p.aim, spell.range) ?? p;
  const aimPt = spell.aim === 'ground' ? clampTo(p, p.aim, spell.range) : target ? { x: target.x, y: target.y } : p.aim;
  const dir = norm(aimPt.x - p.x, aimPt.y - p.y);
  if (spell.aim !== 'self') p.face = dir;
  if (!free) { if (hpPay) p.hp -= hpPay; else p.ember -= v.cost; consumeCharge(w, p, 'freeCasts'); }
  if (!spellOverride) p.cds.set(spell.id, w.t + v.cd * 1000);
  const scaling = spellScaling(p.save.classId);
  const wAvg = ((p.weapon.min + p.weapon.max) / 2) * (1 + (p.stats.stats.power ?? 0));
  const power = scaling === 'spell' ? (p.stats.stats.sp ?? 0) + wAvg * 0.25 : wAvg + (p.stats.stats.sp ?? 0) * 0.25;
  const ctx: CastCtx = {
    caster: p, spellId: spell.id, kind: spell.kind, power, isSpell: true, target, aim: aimPt, dir,
    dmgMult: v.dmg, areaMult: v.area, durMult: v.dur, flags: [], depth: 0,
  };
  const actions = v.split ? spell.actions.map((a) => (a.a === 'projectile' ? { ...a, count: (a.count ?? 1) * 3, spread: (a.spread ?? 0) + 30, coef: a.coef * 0.4 } : a)) : spell.actions;
  const go = () => {
    p.anim = 'cast'; p.animUntil = w.t + 300;
    w.emit('ability:cast', { casterId: p.id, ability: spell.id, x: Math.round(p.x), y: Math.round(p.y), tx: Math.round(aimPt.x), ty: Math.round(aimPt.y), ms: 300 });
    runActions(w, actions, ctx);
    if (v.twin && target) {
      const other = w.nearestHostile(target, 140, (x) => x !== target);
      if (other) runActions(w, actions, { ...ctx, target: other, aim: { x: other.x, y: other.y }, dmgMult: ctx.dmgMult * 0.75 });
    }
    if (v.linger) {
      const dmgActs = actions.filter((a) => a.a === 'damage' || a.a === 'projectile');
      if (dmgActs.length) runActions(w, [{ a: 'zone', kind: 'field', area: { shape: 'circle', at: 'aim', r: 60 }, dur: v.linger, tick: 500, each: [{ a: 'damage', coef: 0.2, area: { shape: 'circle', at: 'aim', r: 60 } }], visual: `${spell.kind}-linger` }], ctx);
    }
    if (v.echo && w.rng.chance(v.echo)) w.later(400, () => runActions(w, actions, { ...ctx, depth: 1 }));
    fireProcs(w, p, 'cast', target ?? undefined);
    if (spell.tags.includes('ultimate')) fireProcs(w, p, 'ultimate');
    if (spell.tags.includes('ultimate') && hook(p.stats, 'encore')) w.later(1500, () => runActions(w, actions, { ...ctx, depth: 1 }));
  };
  if (spell.castMs) { p.windup = { until: w.t + spell.castMs, then: go, label: spell.id }; p.anim = 'cast'; p.animUntil = w.t + spell.castMs; }
  else go();
  return true;
}

const clampTo = (p: Combatant, pt: { x: number; y: number }, range: number) => {
  const d = dist(p, pt);
  if (d <= range || !range) return pt;
  return { x: p.x + ((pt.x - p.x) / d) * range, y: p.y + ((pt.y - p.y) / d) * range };
};
function nearestAlly(w: SimWorld, p: PlayerEnt, at: { x: number; y: number }, range: number): Combatant | undefined {
  let best: Combatant | undefined, bd = 80 * 80;
  for (const c of w.combatants(p.space)) if (w.ally(p, c) && dist2(c, at) < bd && dist(p, c) <= range) { bd = dist2(c, at); best = c; }
  return best;
}

// ───────────── potions ─────────────
const HP_POTS: [string, number][] = [['i_hp_l', 200], ['i_hp_s', 80]];
const EM_POTS: [string, number][] = [['i_em_l', 150], ['i_em_s', 60]];

export function potion(w: SimWorld, p: PlayerEnt, which: 'q' | 'e'): boolean {
  if (w.t < p.potionReadyAt[which] || incapacitated(p)) return false;
  const list = which === 'q' ? HP_POTS : EM_POTS;
  const found = list.map(([id, v]) => ({ it: p.save.inventory.find((x) => x.base === id && x.qty > 0), v })).find((x) => x.it);
  if (!found?.it) return false;
  consumeItem(w, p, found.it.uid);
  p.potionReadyAt[which] = w.t + POTION_CD * (1 - (p.stats.hooks.get('potionCdr') ?? 0));
  if (which === 'q') {
    const total = found.v * P(p.level) * (1 + (p.stats.stats.potionHeal ?? 0));
    for (let i = 1; i <= 6; i++) w.later(i * 500, () => heal(w, p, p, total / 6, i < 6));
  } else p.ember = Math.min(p.emberMax, p.ember + found.v);
  fireProcs(w, p, 'potion');
  return true;
}

export function consumeItem(w: SimWorld, p: PlayerEnt, uid: string): void {
  const inv = p.save.inventory, i = inv.findIndex((x) => x.uid === uid);
  if (i < 0) return;
  const it = inv[i];
  it.qty--;
  if (it.qty <= 0) inv.splice(i, 1);
  w.emit('item:used', { playerId: p.playerId, uid, def: it.base as never }); // v1 ItemId type until cutover
}

export { isMagic };
