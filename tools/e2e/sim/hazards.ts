/** Arena hazards (Claude 3): one check per kind. Run: node tools/e2e/sim/run.mjs hazards */
import { ELITE } from '@/data/enemies/hc/elites';
import type { CreatureTier } from '@/core/hc';
import { newCharacter } from '@/systems/rules/character';
import { Sim } from '@/systems/sim/Sim';
import type { SimPorts } from '@/systems/sim/world';

let fails = 0;
const check = (ok: boolean, what: string) => { console.log(ok ? 'ok  ' : 'FAIL', what); if (!ok) fails++; };
const ports: SimPorts = {
  move: (_s, x, y, dx, dy) => ({ x: x + dx, y: y + dy }), clear: () => true, zoneRule: () => 'wild',
  respawnPoint: () => ({ space: 'room', x: 0, y: 0 }), emit: () => {}, partySize: () => 1, realmRule: () => 'peaceful',
};
function room(creature: string, tier: CreatureTier = 'boss') {
  const s = new Sim(ports, 3);
  s.localPlayer = 'p';
  s.receive({ type: 'loadout', data: newCharacter('reaver') as never }, 'p');
  const p = s.w.players.get('p:p')!;
  p.spawnProtectUntil = 0; // a hero already in the world, not one just (re)spawned
  const id = s.spawn({ creature, level: 12, space: 'room', x: 100, y: 0, tier });
  const step = (ms: number) => { for (let t = 0; t < ms; t += 1000 / 30) s.step(1000 / 30, 0, new Map()); };
  return { s, p, boss: s.w.enemies.get(id)!, id, step, act: (hid: string) => s.receive({ type: 'act', domain: 'systems', action: 'hazard', args: { id: hid } }, 'p') };
}

// anchor: Hask charging into cooled stone is stunned and Vulnerable; burns do not stick
{
  const r = room('cb_hask-the-unburnt');
  r.s.addHazard({ id: 'hz:a', space: 'room', x: 160, y: 0, r: 22, kind: 'anchor' });
  r.boss.motion = { vx: 300, vy: 0, until: r.s.w.t + 1000, iframes: false };
  r.step(300);
  check(r.boss.statuses.has('stun') && r.boss.statuses.has('vulnerable'), 'anchor: Hask charging into stone is stunned and Vulnerable');
  r.s.applyStatus(r.id, { id: 'burn', dur: 3000 });
  check(!r.boss.statuses.has('burn'), 'Hask is immune to burning');
}
// vent: heals a ventHeal boss while erupting; dousing stops it; F only in range
{
  const r = room('cb_provost-morrow');
  r.boss.stats.hooks.set('ventHeal', 1); r.boss.base.hooks.set('ventHeal', 1);
  r.boss.cdef = { ...r.boss.cdef, abilities: [], phases: [], lowHp: [] }; // only the vent may heal him here
  r.s.addHazard({ id: 'hz:v', space: 'room', x: 100, y: 0, r: 40, kind: 'vent' });
  r.boss.hp = r.boss.maxHp * 0.5;
  r.boss.ai = 'dormant';
  r.step(9000);
  check(r.boss.hp > r.boss.maxHp * 0.5, `vent: the boss heals while it erupts (${Math.round((r.boss.hp / r.boss.maxHp) * 100)}%)`);
  r.p.x = 400;
  r.act('hz:v');
  check(r.s.w.hazards.get('hz:v')!.dousedUntil === 0, 'vent: F from too far away does nothing');
  r.p.x = 110;
  r.act('hz:v');
  const hp = r.boss.hp;
  r.step(9000);
  check(r.boss.hp <= hp + 1, 'vent: a doused vent stops healing');
}
// light: a lightOnly boss takes no damage in the dark, full damage in lit light
{
  const r = room('cb_shadow-that-left');
  r.boss.stats.hooks.set('lightOnly', 1); r.boss.base.hooks.set('lightOnly', 1);
  r.s.addHazard({ id: 'hz:l', space: 'room', x: 100, y: 0, r: 60, kind: 'light' });
  const hp0 = r.boss.hp;
  r.s.damage(r.id, 500, 'physical', r.p.id);
  check(r.boss.hp === hp0, 'light: no damage in the dark');
  r.p.x = 110; r.act('hz:l');
  r.s.damage(r.id, 500, 'physical', r.p.id);
  check(r.boss.hp < hp0, 'light: damage lands once the lantern is lit');
}
// pillar: shielded boss takes 20% until the pillars fall (3 strikes each)
{
  const r = room('cb_perpetual-engine'); // mapped: gears = pillars, shielded
  r.s.addHazard({ id: 'hz:p', space: 'room', x: 20, y: 0, r: 16, kind: 'pillar' });
  const hp0 = r.boss.hp;
  r.s.damage(r.id, 1000, 'physical', r.p.id);
  const shieldedHit = hp0 - r.boss.hp;
  for (let i = 0; i < 3; i++) r.act('hz:p');
  const hp1 = r.boss.hp;
  r.s.damage(r.id, 1000, 'physical', r.p.id);
  check((hp1 - r.boss.hp) > shieldedHit * 3, `pillar: hits get through once the pillar falls (${Math.round(shieldedHit)} → ${Math.round(hp1 - r.boss.hp)})`);
}
// hazards clear with the boss
{
  const r = room('cb_hask-the-unburnt');
  r.s.addHazard({ id: 'hz:a', space: 'room', x: 160, y: 0, r: 22, kind: 'anchor' });
  r.s.damage(r.id, 1e9, 'physical', r.p.id);
  check(r.boss.yielded && !r.s.w.hazards.size, 'hazards clear when the room\'s boss yields');
}
console.log(fails ? `FAIL ${fails}` : 'OK');

// yieldOnFlag: a story beat (flag) ends the fight at any HP
{
  const { abilityFor } = await import('@/data/enemies/hc/abilities');
  const ab = abilityFor('Yields on flag samurai.sheathed.', { kind: 'blade', tier: 'boss', arch: 'humanoid', region: 'x' });
  check(ab.matched && ab.hooks?.[0]?.id === 'yieldOnFlag:samurai.sheathed', `ability text → ${ab.hooks?.[0]?.id}`);
  const r = room('cb_ikeda-shun');
  let flag = false;
  r.s.shopEnv = { flag: (k) => (k === 'samurai.sheathed' ? flag : undefined), priceMult: () => 1 };
  r.boss.base.hooks.set('yieldOnFlag:samurai.sheathed', 1); r.boss.statsDirty = true;
  r.step(2000);
  check(!r.boss.yielded, 'fights on while the beat has not happened');
  flag = true;
  r.step(1200);
  check(r.boss.yielded && r.boss.hp > 1, `yields at once when the flag is set (hp ${Math.round(r.boss.hp)})`);
  console.log(fails ? `FAIL ${fails}` : 'OK (yieldOnFlag)');
}

// ── Claude 4 mapping rules
{
  // reflectCharge: Cass charging into a braced (still) hero is stunned and hurt
  const r = room('cb_cass-vantor');
  r.p.movedAt = r.s.w.t - 2000; r.p.x = 140; r.p.y = 0;
  r.boss.motion = { vx: 400, vy: 0, until: r.s.w.t + 600, iframes: false, path: [{ a: 'damage', coef: 1, area: { shape: 'single', at: 'target', r: 0 } }], pathCast: { caster: r.boss, kind: 'storm', power: 10, isSpell: false, target: null, aim: { x: 0, y: 0 }, dir: { x: 1, y: 0 }, dmgMult: 1, areaMult: 1, durMult: 1, flags: [], depth: 0 }, hitIds: new Set() };
  const hp0 = r.boss.hp, php = r.p.hp;
  r.step(300);
  check(r.boss.statuses.has('stun') && r.boss.hp < hp0 && r.p.hp === php, 'braced hero: Cass\'s charge turns back on her (stun, damage, hero unhurt)');
}
{
  // targetableOnFlag: Captain Nobody cannot be hit until his name is called
  const r = room('cb_captain-nobody');
  let named = false;
  r.s.shopEnv = { flag: (k) => (k === 'corsair.nobody_named' ? named : undefined), priceMult: () => 1 };
  const hp0 = r.boss.hp;
  check(!r.s.w.targetable(r.boss), 'Captain Nobody: untargetable before his name is called');
  named = true;
  r.s.damage(r.id, 300, 'physical', r.p.id);
  check(r.s.w.targetable(r.boss) && r.boss.hp < hp0, 'Captain Nobody: targetable once corsair.nobody_named is set');
}
{
  // ventHurt: Volta's pylons, rewired by the hero, erupt on her
  const r = room('cb_volta-sterne');
  r.boss.cdef = { ...r.boss.cdef, ai: { ...r.boss.cdef.ai, speed: 0 } }; // pinned on the pylon for the unit check (in play she must be baited there)
  r.s.addHazard({ id: 'hz:p', space: 'room', x: 100, y: 0, r: 40, kind: 'vent' });
  r.p.x = 120; r.act('hz:p');
  const hp0 = r.boss.hp;
  const hz = r.s.w.hazards.get('hz:p')!;
  if (process.env.DEBUG) console.log('  turnedUntil', hz.turnedUntil, 't', r.s.w.t, 'next', hz.nextCycle);
  r.step(9500);
  if (process.env.DEBUG) console.log('  boss', Math.round(r.boss.x), Math.round(r.boss.y), 'hp', Math.round(r.boss.hp), '/', Math.round(hp0), 'hero dead', r.p.dead, 'active', hz.activeUntil);
  check(r.boss.hp < hp0, 'ventHurt: a turned pylon erupts on Volta');
}
{
  // calmAura: the Hooded Man's stones slow the party until broken
  const r = room('cb_the-hooded-man');
  r.boss.ai = 'dormant';
  r.s.addHazard({ id: 'hz:s', space: 'room', x: 20, y: 0, r: 16, kind: 'pillar' });
  r.step(1100);
  check(r.p.statuses.has('slow'), 'calmAura: standing stones slow the party');
  for (let i = 0; i < 3; i++) r.act('hz:s');
  r.p.statuses.delete('slow'); r.step(1500);
  check(!r.p.statuses.has('slow'), 'calmAura: lifted once the stones are broken');
}
{
  // cover: Lucan's beam does not reach a hero in the shade; the shade burns away, then returns at the next phase
  const r = room('cb_lucan-brightwater');
  r.p.x = 0; r.p.y = 0; r.boss.x = 200; r.boss.y = 0;
  r.s.addHazard({ id: 'hz:c', space: 'room', x: 100, y: 0, r: 24, kind: 'cover', charges: 2 });
  const { runActions } = await import('@/systems/sim/actions');
  const { basicCast } = await import('@/systems/sim/combat');
  const beam = () => runActions(r.s.w, [{ a: 'damage', coef: 2, area: { shape: 'circle', at: 'self', r: 300 } }], { ...basicCast(r.s.w, r.boss, r.p), power: 50 });
  const hp0 = r.p.hp;
  beam(); beam();
  check(r.p.hp === hp0, 'cover: two beams stopped by the shade');
  beam();
  check(r.p.hp < hp0, 'cover: the third gets through once the shade is burnt away');
  r.boss.hp = r.boss.maxHp * 0.6;
  for (let i = 0; i < 60 && r.boss.phase === 0; i++) r.step(1000 / 30); // stop right at the phase change
  check(r.s.w.hazards.get('hz:c')!.charges === 2, 'cover: a phase change brings the shade back');
}
{
  // anchorYield: the Unsheathed driven into its sheath in its last phase ends the fight
  const r = room('cb_the-unsheathed');
  r.s.addHazard({ id: 'hz:sheath', space: 'room', x: 160, y: 0, r: 24, kind: 'anchor' });
  r.boss.phase = r.boss.cdef.phases.length - 1;
  r.boss.motion = { vx: 300, vy: 0, until: r.s.w.t + 1000, iframes: false };
  r.step(300);
  check(r.boss.yielded, 'anchorYield: sheathed in its last phase, the Unsheathed yields');
}
console.log(fails ? `FAIL ${fails}` : 'OK (mapping rules)');

// ── elites and patrols
{
  const r = room('bx_wolf', 'enemy');
  const plain = r.boss;
  const id = r.s.spawn({ creature: 'bx_wolf', level: 12, space: 'room', x: 300, y: 0, elite: ['vampiric', 'molten'] });
  const e = r.s.w.enemies.get(id)!;
  check(Math.abs(e.maxHp - plain.maxHp * ELITE.hp * 0.9) <= 2 && (e.elite ?? []).join() === 'vampiric,molten', `elite: ${ELITE.hp}× health less 10% for the second affix, and its affixes (${e.maxHp} vs ${plain.maxHp})`);
  check(e.cdef.onDeath.length > plain.cdef.onDeath.length && (e.stats.stats.lifesteal ?? 0) >= 0.2, 'elite: molten adds a death burst, vampiric adds life steal');
  const snap = r.s.collect('p').find((x) => x.id === id)!;
  check(snap.data?.ename === 'Vampiric Molten Gloamwood Wolf' && snap.data?.elite === 'vampiric,molten', `snapshot carries the champion name (${snap.data?.ename})`);
  const rnd = r.s.w.enemies.get(r.s.spawn({ creature: 'bx_wolf', level: 12, space: 'room', x: 500, y: 0, elite: true }))!;
  check((rnd.elite?.length ?? 0) >= 1, `elite: true rolls ${rnd.elite?.join('+')}`);
  const pid = r.s.spawn({ creature: 'bx_wolf', level: 12, space: 'room', x: 900, y: 900, patrol: [{ x: 900, y: 900 }, { x: 1100, y: 900 }] });
  const pat = r.s.w.enemies.get(pid)!;
  r.p.x = -2000;
  r.step(4000);
  check(pat.x > 950, `patrol: walks its route while idle (x ${Math.round(pat.x)})`);
  console.log(fails ? `FAIL ${fails}` : 'OK (elites)');
}
