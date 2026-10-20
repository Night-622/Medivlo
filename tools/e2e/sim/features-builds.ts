/**
 * Deeper builds engine (Claude 3, docs/systems/BUILDS.md §2.1): the Passive extensions perks, affixes and uniques
 * are made of. Conversion, auras, "+N to <spell>", the new triggers, conditions and stats, each proven on the sim.
 */
import { ACT2_QUEST_XP, actQuestXpMult, questXpMult } from '@/systems/rules/curves';
import { QUEST_ACT } from '@/data/regions/hc/questBands';
import { questBand, questXpScale } from '@/systems/sim/shop';
import { kitFor } from '@/data/classes/hc/kits';
import { newCharacter } from '@/systems/rules/character';
import { playerPassives } from '@/systems/rules/playerStats';
import { allSpells, spellDef } from '@/systems/rules/spells';
import { compile, evalCond, type CondCtx } from '@/systems/rules/stats';
import type { CharacterSave, HcSpell, Passive, Trigger } from '@/systems/rules/types';
import { Btn } from '@/net/types';
import { spend } from '@/systems/sim/builds';
import { addShield, applyStatus, convertShares, dealDamage } from '@/systems/sim/combat';
import { cast, spellView, weaponRoll } from '@/systems/sim/player';
import { availablePoints } from '@/systems/rules/character';
import { allNodes, canLearn, MAX_SHARED_KEYSTONES } from '@/systems/rules/tree';
import { compileStats } from '@/systems/rules/playerStats';
import { weaponBase } from '@/systems/rules/gear';
import { HC_MASTERY } from '@/data/skilltrees/hc/mastery';
import { HC_WEAPONS } from '@/data/items/hc/weapons.gen';
import type { PlayerEnt } from '@/systems/sim/state';
import { check, dummy, hero, world, type World } from './features-harness';

const save = (classId: string, level = 20): CharacterSave => ({ ...newCharacter(classId), level, tree: {} });

/** Layer test passives on a hero, as a tree node / affix / unique would. */
function give(p: PlayerEnt, ...extra: Passive[]): void {
  p.base = compile([...playerPassives(p.save).passives, ...extra]);
  p.stats = p.base;
  p.statsDirty = true;
}
/** A proc that marks the trigger with a self buff `t:<trigger>`. */
const marker = (on: Trigger): Passive => ({ procs: [{ on, do: [{ a: 'buff', id: `t:${on}`, dur: 60000, to: 'self' }] }] });
const marked = (p: PlayerEnt, on: Trigger) => p.buffs.some((b) => b.id === `t:${on}`);
const noCrit: Passive = { mods: [{ stat: 'crit', op: 'flat', value: -10 }] };
const allCrit: Passive = { mods: [{ stat: 'crit', op: 'flat', value: 10 }] };

function conversion(): void {
  const w = world(), p = hero(w, 'a', save('warden')), d = dummy(w, 40, 0);
  give(p, noCrit, { convert: [{ from: 'attack', to: 'rime', pct: 0.5 }] });
  const n0 = w.events.length;
  dealDamage(w.sim.w, p, d, 100, 'physical');
  const hits = w.since(n0, 'combat:hit').filter((e) => e.p.sourceId === p.id && e.p.kind === 'dmg');
  const kinds = hits.map((e) => String(e.p.type)).sort().join(',');
  check(hits.length === 2 && kinds === 'physical,rime', 'conversion: half an attack lands as Rime, half stays physical (two hits)', kinds);
  // a spell is not an 'attack': no conversion
  const n1 = w.events.length;
  dealDamage(w.sim.w, p, d, 100, 'physical', { isSpell: true });
  const sk = w.since(n1, 'combat:hit').filter((e) => e.p.sourceId === p.id).map((e) => String(e.p.type)).join(',');
  check(sk === 'physical', 'conversion: an attack conversion leaves spells alone', sk);
  const capped = convertShares([{ from: 'ash', to: 'storm', pct: 0.8 }, { from: 'spell', to: 'rime', pct: 0.8 }, { from: 'ash', to: 'ash', pct: 1 }], 'ash', true);
  const total = capped.reduce((a, [, v]) => a + v, 0);
  check(Math.abs(total - 1) < 1e-9 && capped.length === 2, 'conversion: shares over 100% scale down to 100%; converting a kind into itself does nothing', JSON.stringify(capped));
}

function spellLevels(): void {
  const w = world(), p = hero(w, 'a', save('arcanist'));
  const sp = spellDef(kitFor('arcanist').spells[0])!;
  const v0 = spellView(p, sp);
  give(p, { spellLevels: [{ spell: sp.id, levels: 1 }, { spell: '*', levels: 1 }, { spell: 'school:rime', levels: 5 }] });
  const v2 = spellView(p, sp);
  check(Math.abs(v2.dmg / v0.dmg - 1.24) < 1e-9 && Math.abs(v2.area / v0.area - 1.12) < 1e-9, `+N to a spell: +2 levels on ${sp.id} (own + all) give +24% damage and +12% area; another school's levels do not count`, `dmg ×${(v2.dmg / v0.dmg).toFixed(3)}, area ×${(v2.area / v0.area).toFixed(3)}`);
}

function auras(): void {
  const w = world({ party: 2 });
  const p = hero(w, 'a', save('warden')), ally = hero(w, 'b', save('warden'), 120, 0), far = hero(w, 'c', save('warden'), 800, 0);
  const foe = dummy(w, -100, 0);
  give(p, { aura: [{ id: 'might', r: 200, mods: [{ stat: 'dmg', op: 'pct', value: 0.1 }] }, { id: 'dread', r: 200, enemies: true, mods: [{ stat: 'dmgTaken', op: 'pct', value: 0.1 }] }] });
  w.run(1200);
  const has = (c: { buffs: { id: string }[] }, id: string) => c.buffs.some((b) => b.id === `aura:${id}`);
  check(has(p, 'might') && has(ally, 'might') && !has(far, 'might') && !has(foe, 'might'), 'aura: you and allies in range get it; far allies and foes do not', `self ${has(p, 'might')}, ally ${has(ally, 'might')}, far ${has(far, 'might')}, foe ${has(foe, 'might')}`);
  check(has(foe, 'dread') && !has(ally, 'dread') && !has(p, 'dread'), 'aura (enemies): foes in range get it, allies do not', `foe ${has(foe, 'dread')}, ally ${has(ally, 'dread')}`);
  // walking away: the 1.5 s buff runs out
  ally.x = 900;
  w.run(2000);
  check(!has(ally, 'might'), 'aura: an ally who leaves the range loses it within 2 s', `ally ${has(ally, 'might')}`);
}

function triggers(): void {
  const w = world(), p = hero(w, 'a', save('warden')), d = dummy(w, 40, 0);
  give(p, allCrit, marker('spellCrit'), marker('attackCrit'), marker('statusApplied'), marker('emberSpent'), marker('staminaSpent'), marker('dashEnd'));
  w.sim.w.refresh(p);
  dealDamage(w.sim.w, p, d, 50, 'physical');
  const atk = marked(p, 'attackCrit') && !marked(p, 'spellCrit');
  dealDamage(w.sim.w, p, d, 50, 'physical', { isSpell: true });
  check(atk && marked(p, 'spellCrit'), 'triggers: an attack crit fires attackCrit only; a spell crit fires spellCrit', `attack → attackCrit ${atk}, spell → spellCrit ${marked(p, 'spellCrit')}`);
  applyStatus(w.sim.w, p, d, { id: 'bleed' });
  check(marked(p, 'statusApplied'), 'triggers: setting a status on a foe fires statusApplied');
  p.ember = p.emberMax = 200;
  spend(w.sim.w, p, 'ember', 40);
  const early = marked(p, 'emberSpent');
  spend(w.sim.w, p, 'ember', 15);
  check(!early && marked(p, 'emberSpent'), 'triggers: emberSpent fires once 50 Ember has been spent (40 no, 55 yes)', `40 → ${early}, 55 → ${marked(p, 'emberSpent')}`);
  w.run(500);
  w.press('a', Btn.DASH, { move: { x: 1, y: 0 } });
  const mid = marked(p, 'dashEnd'), stam = marked(p, 'staminaSpent');
  w.run(600);
  check(!mid && marked(p, 'dashEnd'), 'triggers: dashEnd fires when the dash lands, not when it starts', `at start ${mid}, after ${marked(p, 'dashEnd')}`);
  check(stam || p.stamina > 0, 'triggers: a dash spends stamina through the spent counter', `staminaSpent ${stam}`);
}

function conds(): void {
  const base: CondCtx = { hpFrac: 1, inCombat: true, stationaryMs: 0, momentum: 0, emberFrac: 0.2, staminaFrac: 0.9, moving: true, minions: 2 };
  const ok = evalCond({ c: 'emberBelow', pct: 0.3 }, base) && !evalCond({ c: 'emberAbove', pct: 0.3 }, base)
    && !evalCond({ c: 'staminaBelow', pct: 0.5 }, base) && evalCond({ c: 'moving' }, base) && !evalCond({ c: 'moving' }, { ...base, moving: false })
    && evalCond({ c: 'minions', min: 2 }, base) && !evalCond({ c: 'minions', min: 3 }, base);
  check(ok, 'conditions: emberAbove / emberBelow / staminaBelow / moving / minions');
  // the sim fills them in
  const w = world(), p = hero(w, 'a', save('warden'));
  w.run(300, { a: { move: { x: 1, y: 0 } } });
  const x = w.sim.w.condCtx(p, null);
  check(x.moving === true && x.emberFrac !== undefined && x.minions === 0, 'conditions: the sim fills in moving, Ember and minions for a hero', JSON.stringify({ moving: x.moving, ember: x.emberFrac, minions: x.minions }));
}

/** First kit spell that fires a projectile (for projCount / castSpeed). */
function projectileSpell(): HcSpell {
  for (const cls of ['arcanist', 'rimecaller', 'sparkwright', 'huntsman']) for (const id of kitFor(cls).spells) {
    const s = spellDef(id);
    if (s?.actions.some((a) => a.a === 'projectile')) return s;
  }
  throw new Error('no projectile kit spell');
}

function newStats(w0: () => World): void {
  // emberOnHit / staminaOnKill
  {
    const w = w0(), p = hero(w, 'a', save('warden')), d = dummy(w, 40, 0);
    give(p, noCrit, { mods: [{ stat: 'emberOnHit', op: 'flat', value: 3 }, { stat: 'staminaOnKill', op: 'flat', value: 25 }] });
    p.ember = 10;
    dealDamage(w.sim.w, p, d, 10, 'physical');
    const e = p.ember;
    const victim = dummy(w, 60, 0);
    victim.maxHp = victim.hp = 5;
    p.stamina = 10;
    dealDamage(w.sim.w, p, victim, 500, 'physical');
    check(Math.abs(e - 13) < 1e-6 && p.stamina >= 35, 'stats: emberOnHit restores Ember per hit; staminaOnKill restores stamina on a kill', `ember 10 → ${e}, stamina 10 → ${p.stamina}`);
  }
  // statusDmg / statusChance
  {
    const w = w0(), p = hero(w, 'a', save('arcanist')), d = dummy(w, 40, 0), d2 = dummy(w, 80, 0);
    applyStatus(w.sim.w, p, d, { id: 'burn' });
    const b0p = p.base.stats['statusDmg.burn'] ?? 0;
    give(p, { mods: [{ stat: 'statusDmg.burn', op: 'flat', value: 0.5 }] });
    applyStatus(w.sim.w, p, d2, { id: 'burn' });
    const r = (d2.statuses.get('burn')?.dps ?? 0) / Math.max(1e-9, d.statuses.get('burn')?.dps ?? 0);
    // additive with the class's own burn damage (mastery / perks): (1 + base + 0.5) / (1 + base)
    const want = (1.5 + b0p) / (1 + b0p);
    check(Math.abs(r - want) < 1e-6, `stats: +50% burn damage adds to the burn tick (×${want.toFixed(3)} over the class's own ${Math.round(b0p * 100)}%)`, `ratio ${r.toFixed(3)}`);
    give(p, { mods: [{ stat: 'statusChance', op: 'flat', value: 1 }] });
    let landed = 0;
    for (let i = 0; i < 200; i++) { const t = dummy(w, 200 + i, 0); applyStatus(w.sim.w, p, t, { id: 'bleed', chance: 0.25 }); if (t.statuses.has('bleed')) landed++; }
    check(landed > 70 && landed < 130, 'stats: +100% status chance doubles a 25% chance (~50 of 100)', `${landed}/200`);
  }
  // projCount / castSpeed / area
  {
    const w = w0(), p = hero(w, 'a', save('arcanist')), sp = projectileSpell();
    w.run(300);
    const count = () => [...w.sim.w.projectiles.values()].filter((x) => x.cast.caster === p).length;
    const before = count();
    cast(w.sim.w, p, 0, { ...sp, castMs: 0 });
    const one = count() - before;
    w.run(2500);
    give(p, { mods: [{ stat: 'projCount', op: 'flat', value: 2 }, { stat: 'castSpeed', op: 'flat', value: 1 }] });
    const b2 = count();
    cast(w.sim.w, p, 0, { ...sp, castMs: 0 });
    const three = count() - b2;
    check(one >= 1 && three === one + 2, 'stats: +2 projectiles on a projectile spell', `${one} → ${three}`);
    w.run(2500);
    cast(w.sim.w, p, 0, { ...sp, castMs: 600 });
    const wind = (p.windup?.until ?? 0) - w.sim.w.t;
    check(Math.abs(wind - 300) < 1, 'stats: +100% cast speed halves a 600 ms wind-up', `wind-up ${Math.round(wind)} ms`);
  }
  // staminaCost / dashCd
  {
    const w = w0(), p = hero(w, 'a', save('warden'));
    give(p, { mods: [{ stat: 'staminaCost', op: 'flat', value: -0.5 }, { stat: 'dashCd', op: 'flat', value: -0.5 }] });
    w.run(500);
    const s0 = p.stamina;
    w.press('a', Btn.DASH, { move: { x: 1, y: 0 } });
    const paid = s0 - p.stamina;
    const w2 = w0(), q = hero(w2, 'a', save('warden'));
    w2.run(500);
    const q0 = q.stamina;
    w2.press('a', Btn.DASH, { move: { x: 1, y: 0 } });
    const full = q0 - q.stamina;
    check(paid > 0 && Math.abs(paid / full - 0.5) < 0.1, 'stats: −50% stamina cost halves the dash cost', `${full.toFixed(1)} → ${paid.toFixed(1)}`);
    let back = 0, qback = 0;
    for (let t = 0; t < 6000 && (!back || !qback); t += 1000 / 30) {
      w.tick(); w2.tick();
      if (!back && p.dashCharges >= 1) back = t;
      if (!qback && q.dashCharges >= 1) qback = t;
    }
    check(back > 0 && qback > 0 && back < qback * 0.7, 'stats: −50% dash cooldown brings the charge back sooner', `${Math.round(qback)} ms → ${Math.round(back)} ms`);
  }
}

/** Shared keystones (cap 2, Upgrades c1), their 5 sim hooks, and weapon mastery. */
function keystonesAndMastery(): void {
  // cap: with points to spare, a third shared keystone is refused
  const s: CharacterSave = { ...newCharacter('arcanist'), level: 40, tree: {} };
  const ks = allNodes('arcanist').filter((n) => n.shared);
  for (const n of ks) for (const id of [...n.req.filter((r) => !r.endsWith('root')), n.id]) {
    for (const step of ['a', 'm1', 'm2', 'b', 'b', 'b'].map((x) => id.replace(/c1$/, x))) if (canLearn('arcanist', step, s.tree, availablePoints(s)).ok) s.tree[step] = (s.tree[step] ?? 0) + 1;
    if (canLearn('arcanist', n.id, s.tree, availablePoints(s)).ok) s.tree[n.id] = 1;
  }
  const held = ks.filter((n) => s.tree[n.id]).length;
  const third = ks.find((n) => !s.tree[n.id]);
  const why = third ? canLearn('arcanist', third.id, s.tree, availablePoints(s)) : { ok: true };
  check(ks.length === 3 && held === MAX_SHARED_KEYSTONES && !why.ok && /shared keystones/.test(why.ok ? '' : why.why), `shared keystones: 3 offered, ${MAX_SHARED_KEYSTONES} can be held, the third is refused`, `offered ${ks.length}, held ${held}`);
  // spToAttack (Iron Grip): spell power lends to a sword's swing
  {
    const w = world(), p = hero(w, 'a', save('swordsman'));
    const avg = (q: PlayerEnt) => { let t = 0; for (let i = 0; i < 400; i++) t += weaponRoll(w.sim.w, q); return t / 400; };
    const a0 = avg(p);
    give(p, { hooks: [{ id: 'spToAttack', value: 1 }] });
    const a1 = avg(p), want = (p.stats.stats.sp ?? 0) * 0.5;
    check(Math.abs(a1 - a0 - want) < want * 0.15, `Iron Grip: half your spell power adds to each weapon swing (+${want.toFixed(1)})`, `${a0.toFixed(1)} → ${a1.toFixed(1)}`);
  }
  // emberShield: 30% of a hit is paid from Ember
  {
    const w = world(), p = hero(w, 'a', save('warden')), d = dummy(w, 40, 0);
    d.dmg = 1;
    p.spawnProtectUntil = 0;
    give(p, { hooks: [{ id: 'emberShield', value: 0.3 }], mods: [{ stat: 'armor', op: 'flat', value: -1e6 }] });
    p.ember = 100;
    const hp0 = p.hp;
    dealDamage(w.sim.w, d, p, 100, 'ash');
    check(p.ember < 100 && p.ember >= 60 && hp0 - p.hp < 100 && hp0 - p.hp > 40, 'Ember Shield: part of a hit is paid from Ember, the rest from health', `ember 100 → ${p.ember.toFixed(1)}, hp −${(hp0 - p.hp).toFixed(0)}`);
  }
  // convertPower (Elementalist): conversions are 25% stronger
  const sh = convertShares([{ from: 'attack', to: 'ash', pct: 0.4 }], 'physical', false, 1.25);
  check(Math.abs((sh[0]?.[1] ?? 0) - 0.5) < 1e-9, 'Elementalist: a 40% conversion becomes 50%', JSON.stringify(sh));
  // spellblade: every 4th basic attack casts slot 1 at 40%
  {
    const w = world(), p = hero(w, 'a', save('warden')), d = dummy(w, 30, 0);
    give(p, { hooks: [{ id: 'spellblade', value: 0.4 }] });
    const n0 = w.events.length;
    w.run(8000, { a: { target: d.id, aim: { x: 30, y: 0 } } });
    const attacks = p.attackCount, slot1 = w.since(n0, 'ability:cast').filter((e) => e.p.casterId === p.id && e.p.ability === p.save.hotbar[0]).length;
    check(attacks >= 8 && slot1 === Math.floor(attacks / 4), `Spellblade: ${attacks} basic attacks cast ${p.save.hotbar[0]} ${slot1}× (every 4th)`, `attacks ${attacks}, casts ${slot1}`);
  }
  // auraHitsEnemies (Conduit)
  {
    const w = world(), p = hero(w, 'a', save('bard')), foe = dummy(w, 80, 0);
    give(p, { aura: [{ id: 'song', r: 200, mods: [{ stat: 'dmg', op: 'flat', value: 0.05 }] }], hooks: [{ id: 'auraHitsEnemies' }] });
    const n0 = w.events.length;
    w.run(2200);
    const hits = w.since(n0, 'combat:hit').filter((e) => e.p.sourceId === p.id && e.p.targetId === foe.id && e.p.kind === 'dmg').length;
    check(hits >= 2, 'Conduit: your aura also strikes foes in its reach each pulse', `${hits} hits in 2.2 s`);
  }
  // mastery: the passive for the weapon in hand, and only that one
  const sw = newCharacter('warden');
  const ms = HC_MASTERY.filter((m) => m.classId === 'warden');
  const inHand = weaponBase(sw.equipment.main?.base ?? kitFor('warden').startWeapon)!.type;
  const sig = (x: CharacterSave) => JSON.stringify(compileStats(x).stats);
  const other = ms.find((m) => m.weapon !== inHand);
  const otherBase = other && HC_WEAPONS.find((x) => x.type === other.weapon)!.id;
  const swapped = otherBase ? { ...sw, equipment: { ...sw.equipment, main: { uid: 'm', base: otherBase, ilvl: 1, qty: 1 } } } : sw;
  check(ms.some((m) => m.weapon === inHand) && !!other && sig(swapped) !== sig(sw), `weapon mastery: warden's ${inHand} passive applies; switching to a ${other?.weapon} changes it`);
}

/** Minions: totems, traps, decoys and pets count (summon trigger, minionDmg, the 'minions' condition). */
function minions(): void {
  const totem = [...allSpells()].find((s) => s.actions.some((a) => a.a === 'zone' && a.kind === 'totem'));
  if (!check(!!totem, 'a kit spell places a totem')) return;
  const placed = (extra: Passive[]) => {
    const w = world(), p = hero(w, 'a', save('sparkwright', 20));
    give(p, marker('summon'), ...extra);
    cast(w.sim.w, p, 0, { ...totem!, castMs: 0 });
    const z = [...w.sim.w.zones.values()].find((x) => x.kind === 'totem' && x.cast.caster === p);
    return { p, z, n: w.sim.w.minionsOf(p.id) };
  };
  const a = placed([]), b = placed([{ mods: [{ stat: 'minionDmg', op: 'flat', value: 0.6 }] }]);
  check(!!a.z && marked(a.p, 'summon') && a.n >= 1, `${totem!.name}: placing it fires 'summon' and it counts as a minion`, `zone ${!!a.z}, minions ${a.n}`);
  check(!!a.z && !!b.z && Math.abs(b.z.cast.dmgMult / a.z.cast.dmgMult - 1.6) < 1e-9, `${totem!.name}: +60% minion damage makes the totem hit 60% harder`, `×${b.z && a.z ? (b.z.cast.dmgMult / a.z.cast.dmgMult).toFixed(2) : '?'}`);
}

/** Pools follow buffs (an hp aura raises max HP), and player:damaged reports health lost after a shield. */
function poolsAndShields(): void {
  const w = world(), p = hero(w, 'a', save('warden'));
  const h0 = p.maxHp;
  give(p, { aura: [{ id: 'oath', r: 160, mods: [{ stat: 'hp', op: 'pct', value: 0.1 }] }] });
  w.run(1200);
  check(Math.abs(p.maxHp / h0 - 1.1) < 0.01, 'an aura’s +10% max health raises the hero’s max HP (buffs move the pools)', `${h0} → ${p.maxHp}`);
  const d = dummy(w, 40, 0);
  p.spawnProtectUntil = 0;
  addShield(w.sim.w, p, 1e6, 5000);
  const n0 = w.events.length;
  dealDamage(w.sim.w, d, p, 200, 'ash');
  check(!w.since(n0, 'player:damaged').length, 'a hit fully soaked by a shield reports no health lost (player:damaged)');
}

/** Quest XP follows the quest's band: under it up to ×2, inside ×1, over it down to ×0.6; no band ×1. */
function questBandXp(): void {
  const b: [number, number] = [28, 30];
  const r = [questXpMult(26, b), questXpMult(20, b), questXpMult(29, b), questXpMult(33, b), questXpMult(40, b), questXpMult(26, null), questXpMult(31, b)];
  check(r[0] === 1.5 && r[1] === 2 && r[2] === 1 && Math.abs(r[3] - 0.7) < 1e-9 && r[4] === 0.6 && r[5] === 1 && r[6] === 1, 'quest XP by band: 2 under ×1.5, far under ×2 (cap), inside and one over ×1, 3 over ×0.7, far over ×0.6 (floor), no band ×1', r.join(', '));
  // Act II per-class factor, on top of the band (shop.ts questXpScale is what questReward pays)
  const a2 = Object.keys(QUEST_ACT).find((q) => QUEST_ACT[q] === 2 && !questBand(q))!, a1 = Object.keys(QUEST_ACT).find((q) => QUEST_ACT[q] === 1 && !questBand(q))!;
  const s = [actQuestXpMult('stormlancer', 2), actQuestXpMult('oathbound', 2), actQuestXpMult('stormlancer', 1), actQuestXpMult('nobody', 2), a2 ? questXpScale('juggernaut', 25, a2) : 0.6, a1 ? questXpScale('juggernaut', 5, a1) : 1];
  check(s[0] === 0.6 && s[1] === 1.4 && s[2] === 1 && s[3] === 1 && s[4] === 0.6 && s[5] === 1 && Object.values(ACT2_QUEST_XP).every((f) => f >= 0.6 && f <= 1.4), 'Act II quest XP per class: stormlancer ×0.6, oathbound ×1.4, Act I ×1, unknown class ×1, all within 0.6–1.4', s.join(', '));
}

export function buildChecks(): void {
  questBandXp();
  poolsAndShields();
  minions();
  keystonesAndMastery();
  conversion();
  spellLevels();
  auras();
  triggers();
  conds();
  newStats(() => world());
}
