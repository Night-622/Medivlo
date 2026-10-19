/**
 * Ability cast pipeline (SYSTEMS.md §6): checks, costs (incl. overdraw → Cinderlung), rank/upgrade mods,
 * Attunement combos, deliveries, mastery.
 */
import { Registry, bus } from '@/core';
import type { BuildupStatus, EffectDef, SpellDef, SpellId, SpellModifier, StatModifier } from '@/core';
import { CINDERLUNG_MAX, GLOBAL_COOLDOWN_MS, OVERDRAW_HP_PER_EMBER, P } from '../balance';
import type { HitSpec } from '../combat/HitResolver';
import { dist, inSector } from './Actor';
import type { CombatRuntime } from './CombatRuntime';
import type { HitExtra } from './hazards';
import type { PlayerActor } from './Player';
import { applyEffectStatus } from './statusEffects';
import { lineSum, weaponInfo } from './weapon';

const hex = (s: string) => parseInt(s.replace('#', ''), 16);

export interface CastPlan { spell: SpellDef; castMs: number; mods: SpellModifier[]; empowered?: boolean }

/** modifiers from rank choices */
function rankMods(p: PlayerActor, spell: SpellDef): { mods: SpellModifier[]; rankMult: number } {
  const prog = p.gs.player.spellbook.known[spell.id];
  const rank = Math.max(1, Math.min(5, prog?.rank ?? 1));
  const mods: SpellModifier[] = [];
  for (const r of spell.ranks) for (const c of r.choices) if (prog?.choices.includes(c.id)) mods.push(...c.mods);
  // socketed glyphs (only as many as the current rank opens, and only if the spell has a matching tag)
  const open = spell.ranks[rank - 1]?.glyphSockets ?? 0;
  for (const uid of (prog?.glyphs ?? []).slice(0, open)) {
    const inst = p.gs.player.inventory.items.find((i) => i.uid === uid);
    const g = inst ? Registry.tryGet('item', inst.def)?.glyph : undefined;
    if (g && g.appliesTo.some((t) => spell.tags.includes(t))) mods.push(...g.mods);
  }
  return { mods, rankMult: spell.ranks[rank - 1]?.damageMult ?? 1 };
}

const hookParam = (effects: EffectDef[], hook: string, key: string): number | undefined => {
  const e = effects.find((x) => x.kind === 'hook' && x.hook === hook);
  return e && e.kind === 'hook' ? Number(e.params?.[key] ?? 0) || undefined : undefined;
};

const modSum = (mods: SpellModifier[], kind: SpellModifier['kind']) =>
  mods.filter((m) => m.kind === kind).reduce((a, m) => a * ('value' in m ? m.value : 1), 1);

/** Validate and pay; returns a plan or a reason string */
export function prepareCast(rt: CombatRuntime, spellId: SpellId): CastPlan | string {
  const p = rt.player;
  const spell = Registry.tryGet('spell', spellId);
  if (!spell) return 'Unknown ability';
  const now = rt.now;
  if (now < p.gcdUntil) return '';
  if ((p.cooldowns.get(spell.id) ?? 0) > now) return 'Not ready';
  if (spell.abilityKind === 'spell' && p.status.has('silence')) return 'Silenced';
  const { mods } = rankMods(p, spell);
  const empowered = spell.school === 'radiance' && !!p.hook('alwaysEmpowered');
  const costMult = modSum(mods, 'costMult') * (empowered ? p.hookNum('alwaysEmpowered', 'costMult', 1.5) : 1) * (spell.abilityKind === 'spell' ? p.hookNum('spellCostMult', 'mult', 1) : 1);
  const c = spell.cost;
  const healthCost = c.health ? (c.health <= 1 ? c.health * p.maxHp : c.health) * (1 - p.hookNum('bloodPrice', 'pct', 0)) : 0;
  if (c.stamina && p.stamina <= 0) return 'Too tired';
  if (c.resource && p.resource < c.resource) return `Need ${c.resource} ${p.cls?.resource.name ?? 'resource'}`;
  let overdrawHp = 0;
  if (c.mana) {
    const cost = c.mana * costMult;
    const missing = p.hook('alwaysOverdraw') ? cost : cost - p.mana; // Crown of Ozrah: Ember costs are paid in HP
    if (missing > 0) {
      const tolerance = p.hookNum('cinderTolerance', 'pct', 0);
      overdrawHp = missing * OVERDRAW_HP_PER_EMBER * (1 - tolerance);
      if (p.hp <= overdrawHp + 1) return 'Not enough Ember';
    }
  }
  if (healthCost && p.hp <= healthCost + 1) return 'Not enough HP';
  // pay
  if (c.stamina) p.spendStamina(c.stamina * costMult, now);
  if (c.resource) p.resource = p.resource - c.resource;
  if (healthCost) {
    p.hp -= healthCost;
    const ctr = p.gs.player.counters;
    if (spell.discipline === 'bloodcraft') ctr['bloodcraft.casts'] = (ctr['bloodcraft.casts'] ?? 0) + 1;
  }
  if (c.mana) {
    const cost = c.mana * costMult;
    if (overdrawHp > 0) {
      if (!p.hook('alwaysOverdraw')) p.mana = 0;
      p.hp -= overdrawHp;
      const pr = p.gs.player.progression;
      pr.cinderlung = Math.min(CINDERLUNG_MAX, (pr.cinderlung ?? 0) + 1);
      p.cinderDecayAt = now + 20_000;
      p.markDirty();
      rt.fx.label(p.x, p.y, 'Overdraw! Cinderlung', '#ff8a3d', now);
    } else p.mana -= cost;
  }
  const devotionFull = spell.school === 'radiance' && p.cls?.resource.id === 'devotion' && p.resource >= (p.cls.resource.max ?? 100);
  const cd = devotionFull ? 0 : spell.cooldownMs * modSum(mods, 'cooldownMult') * (1 - p.stats.derived.cooldownReduction);
  p.cooldowns.set(spell.id, now + cd);
  p.gcdUntil = now + GLOBAL_COOLDOWN_MS;
  const castMs = (spell.castTimeMs * modSum(mods, 'castTimeMult')) / (p.stats.derived.castSpeed * p.status.actionMult());
  if (devotionFull) { p.resource = 0; rt.fx.label(p.x, p.y - 12, 'Empowered prayer!', '#fbe7a3', now); }
  return { spell, castMs, mods, empowered: empowered || devotionFull };
}

/** glyph conversions: move pct of every line (or of one type) into another damage type */
function convertLines(lines: HitSpec['lines'], mods: SpellModifier[]): HitSpec['lines'] {
  let out = lines.map((l) => ({ ...l }));
  for (const m of mods) {
    if (m.kind !== 'convert') continue;
    const add: HitSpec['lines'] = [];
    for (const l of out) {
      if (m.from !== 'all' && l.type !== m.from) continue;
      if (l.type === m.to) continue;
      add.push({ type: m.to, min: l.min * m.pct, max: l.max * m.pct });
      l.min *= 1 - m.pct; l.max *= 1 - m.pct;
    }
    out = [...out, ...add];
  }
  return out;
}

function buildSpec(p: PlayerActor, spell: SpellDef, mods: SpellModifier[], rankMult: number): HitSpec | null {
  const buildup: Partial<Record<BuildupStatus, number>> = { ...(spell.buildup ?? {}) };
  for (const m of mods) if (m.kind === 'addBuildup') buildup[m.status] = (buildup[m.status] ?? 0) + m.value;
  const mult = rankMult * modSum(mods, 'damageMult');
  if (spell.weaponDamagePct) {
    const w = weaponInfo(p);
    let lines = w.lines;
    if (spell.damage?.length) {
      const s = lineSum(w.lines);
      lines = spell.damage.map((d) => ({ type: d.type, min: s.min / spell.damage!.length, max: s.max / spell.damage!.length }));
    }
    for (const [k, v] of Object.entries(w.buildup) as [BuildupStatus, number][]) buildup[k] = (buildup[k] ?? 0) + v;
    return {
      kind: w.kind === 'bow' ? 'ranged' : 'melee', lines: convertLines(lines, mods), scaling: w.scaling, mult: spell.weaponDamagePct * mult,
      poise: spell.poiseDamage ?? w.poise, buildup, critBonus: w.critBonus,
    };
  }
  if (!spell.damage?.length) return null;
  const lv = P(p.level);
  return {
    kind: spell.abilityKind === 'spell' ? 'spell' : spell.delivery.kind === 'projectile' ? 'ranged' : 'melee',
    lines: convertLines(spell.damage.map((d) => ({ type: d.type, min: d.min * lv, max: d.max * lv })), mods),
    scaling: spell.scaling, school: spell.school, mult, poise: spell.poiseDamage, buildup,
  };
}

/** Arcanist Attunement: same school builds stacks, switching spends them for a combo */
function attunement(rt: CombatRuntime, spell: SpellDef, effects: EffectDef[]): number {
  const p = rt.player;
  if (p.cls?.resource.id !== 'attunement' || !spell.school) return 1;
  let mult = 1;
  const stacks = Math.floor(p.resource);
  if (p.lastSchool && p.lastSchool !== spell.school && stacks >= 2) {
    mult = 1 + 0.15 * stacks;
    rt.fx.label(p.x, p.y - 10, `Combo ×${mult.toFixed(2)}`, '#d4a646', rt.now);
    if (p.lastSchool === 'ash' && spell.school === 'rime') effects.push({ kind: 'applyStatus', trigger: 'onHit', status: 'exposed', target: 'target', durationMs: 3000 });
    if (p.lastSchool === 'rime' && spell.school === 'storm') effects.push({ kind: 'applyStatus', trigger: 'onHit', status: 'shock', target: 'target', durationMs: 4000 });
    if (p.lastSchool === 'storm' && spell.school === 'ash') effects.push({ kind: 'applyStatus', trigger: 'onHit', status: 'burn', target: 'target', buildup: 60 });
    p.resource = 1;
  } else {
    p.gainResource(1, rt.now);
  }
  p.lastSchool = spell.school;
  return mult;
}

/** Perform the delivery after the cast time. */
export function executeCast(rt: CombatRuntime, plan: CastPlan, aimX: number, aimY: number): void {
  const p = rt.player;
  const now = rt.now;
  const { spell, mods } = plan;
  const { rankMult } = rankMods(p, spell);
  const effects: EffectDef[] = [...spell.effects, ...mods.flatMap((m) => (m.kind === 'effect' ? [m.effect] : []))];
  const combo = attunement(rt, spell, effects);
  const blood = spell.discipline === 'bloodcraft' ? 1 + (1 - p.hpPct) : 1; // +10% per 10% HP missing
  const spec = buildSpec(p, spell, mods, rankMult * combo * blood * (plan.empowered ? 1.5 : 1));
  p.gainResource(rt.resourceGain('onCast'), now);
  const angle = Math.atan2(aimY - p.y, aimX - p.x);
  p.facing = angle;
  const extra: HitExtra = { spellId: spell.id, effects, ashmark: spell.id === 'spell:ashmark' };
  const color = hex(spell.vfx.color);

  for (const e of effects) {
    if (e.kind === 'hook' && e.hook === 'lunge') rt.move(p, Math.cos(angle) * Number(e.params?.distance ?? 40), Math.sin(angle) * Number(e.params?.distance ?? 40));
    if (e.kind === 'hook' && e.hook === 'gainResource') p.gainResource(Number(e.params?.amount ?? 0), now);
    if (e.kind === 'applyStatus' && e.trigger === 'onCast') applyEffectStatus(rt, e, p, p);
  }
  const buffMods: StatModifier[] = effects.flatMap((e) => (e.kind === 'modifier' ? [e.mod] : []));
  const d = spell.delivery;
  const deliver = (spec: HitSpec | null, echo: boolean): void => {
  switch (d.kind) {
    case 'projectile': {
      if (!spec) break;
      const extraN = mods.filter((m) => m.kind === 'extraProjectiles').reduce((a, m) => a + ('value' in m ? m.value : 0), 0);
      const pierce = mods.filter((m) => m.kind === 'pierce').reduce((a, m) => a + ('value' in m ? m.value : 0), 0);
      const def = { ...d.projectile, count: (d.projectile.count ?? 1) + extraN, pierce: d.projectile.pierce + pierce,
        spreadDeg: d.projectile.spreadDeg ?? (extraN ? 25 : 0), radius: d.projectile.radius * modSum(mods, 'areaMult'),
        homingDegPerSec: d.projectile.homingDegPerSec ?? hookParam(effects, 'homing', 'deg') };
      rt.spawnProjectile(p, p.x, p.y - 14, angle, def, spec, extra);
      break;
    }
    case 'melee':
    case 'cone': {
      const arc = d.kind === 'melee' ? d.arcDeg : d.angleDeg;
      const reach = d.kind === 'melee' ? d.reachPx : d.rangePx;
      rt.fx.arc(p.x, p.y - 8, angle, arc, reach, color, now);
      if (spec) for (const e of rt.enemies) if (e.alive && inSector(p.x, p.y, angle, arc, reach, e.x, e.y, e.radius)) rt.applyHit(p, e, spec, extra);
      break;
    }
    case 'area': {
      let cx = p.x, cy = p.y;
      if (d.rangePx > 0) {
        const dd = Math.min(d.rangePx, dist(p.x, p.y, aimX, aimY));
        cx = p.x + Math.cos(angle) * dd; cy = p.y + Math.sin(angle) * dd;
      }
      rt.spawnArea({
        owner: p, team: 'player', x: cx, y: cy, radius: d.radius * modSum(mods, 'areaMult'), delayMs: d.delayMs,
        durationMs: (d.durationMs ?? 0) * modSum(mods, 'durationMult'), tickMs: d.tickMs ?? 500, color, spec: spec ?? undefined, extra,
        buff: buffMods.length ? { id: spell.id, mods: buffMods } : undefined,
      });
      break;
    }
    case 'aura':
    case 'self':
      if (buffMods.length) p.addBuff({ id: spell.id, until: now + (d.kind === 'aura' ? d.durationMs : 6000), mods: buffMods, procs: [] });
      rt.fx.ring(p.x, p.y - 8, 40, color, now, 400);
      break;
    case 'dash': {
      const dd = Math.min(d.distancePx, Math.max(40, dist(p.x, p.y, aimX, aimY)));
      rt.move(p, Math.cos(angle) * dd, Math.sin(angle) * dd);
      rt.fx.ring(p.x, p.y - 8, 30, color, now, 250);
      const slam = effects.find((e) => e.kind === 'hook' && e.hook === 'slamOnLand');
      if (d.damageOnPath && spec) {
        const r = slam && slam.kind === 'hook' ? Number(slam.params?.radius ?? 64) : 64;
        rt.fx.ring(p.x, p.y, r, color, now, 300);
        rt.fx.shake(0.005, 100);
        for (const e of rt.enemies) if (e.alive && dist(p.x, p.y, e.x, e.y) <= r + e.radius) rt.applyHit(p, e, spec, extra);
      }
      break;
    }
    case 'chain':
    case 'summon':
      break; // Phase 2
  }
  void echo;
  };
  deliver(spec, false);
  const echoMod = mods.find((m) => m.kind === 'echo');
  if (echoMod && echoMod.kind === 'echo' && spec && (d.kind === 'projectile' || d.kind === 'area' || d.kind === 'melee' || d.kind === 'cone')) {
    rt.scene.time.delayedCall(echoMod.delayMs, () => { if (p.alive) deliver({ ...spec, mult: (spec.mult ?? 1) * echoMod.damageMult }, true); });
  }
  gainMastery(p, spell.id, 10);
  bus.emit('spell:cast', { spellId: spell.id, school: spell.school });
}

export function gainMastery(p: PlayerActor, spellId: SpellId, amount: number): void {
  const sb = p.gs.player.spellbook;
  const prog = sb.known[spellId];
  const spell = Registry.tryGet('spell', spellId);
  if (!prog || !spell) return;
  prog.mastery += amount;
  // ranks 2–3 come from mastery alone; 4–5 need an essence (spellbook UI)
  while (prog.rank < 3 && prog.mastery >= (spell.ranks[prog.rank]?.masteryXp ?? Infinity)) {
    prog.rank++;
    bus.emit('spell:ranked', { spellId, rank: prog.rank });
  }
}
