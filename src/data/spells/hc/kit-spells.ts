/**
 * The 72 class kit spells (3 per class), mechanics for the handoff's ability text (Claude 3).
 * Slot order follows the handoff; each is a free starting spell in the class's Spells tree.
 * Coefficients: damage = coef × (spell power or weapon power, per class scaling).
 */
import type { HcSpell } from '@/systems/rules/types';
import { atAim, atT, cone, dmg, kitSpell as k, line, mod, self, shot, single, st, status } from './build';

export const HC_KIT_SPELLS: HcSpell[] = [
  // ── Rime ──
  k('warden', 0, { cost: 8, cd: 2, range: 80, aim: 'direction', tags: ['area', 'control'], actions: [dmg(1.0, cone(80, 100), undefined, [st('chill', 3000)])] }),
  k('warden', 1, { cost: 14, cd: 10, range: 0, aim: 'self', tags: ['buff'], actions: [{ a: 'buff', id: 'hold-the-line', dur: 3000, to: 'self', flags: ['blockFront'], mods: [mod('moveSpeed', -0.5)] }] }),
  k('warden', 2, { cost: 20, cd: 12, range: 0, aim: 'self', tags: ['area', 'control'], actions: [{ a: 'zone', kind: 'field', area: self(96), dur: 5000, tick: 500, each: [status(st('chill', 1200), self(96))], visual: 'rime-ring' }] }),
  k('rimecaller', 0, { cost: 8, cd: 1, range: 360, aim: 'enemy', tags: ['projectile', 'control'], actions: [shot(1.0, { status: [st('chill', 2500)], visual: 'shard' })] }),
  k('rimecaller', 1, { cost: 14, cd: 8, range: 320, aim: 'ground', tags: ['area', 'control'], actions: [{ a: 'zone', kind: 'field', area: atAim(72), dur: 4000, tick: 500, each: [dmg(0.2, atAim(72), undefined, [st('root', 600)])], visual: 'hoarfrost' }] }),
  k('rimecaller', 2, { cost: 20, cd: 14, range: 260, aim: 'ground', tags: ['summon'], actions: [{ a: 'zone', kind: 'wall', area: { shape: 'line', at: 'aim', len: 128, width: 16 }, dur: 5000, blocksShots: true, visual: 'glacier' }] }),
  // ── Verdant ──
  k('ranger', 0, { cost: 8, cd: 2, range: 380, aim: 'direction', tags: ['projectile'], actions: [shot(0.55, { count: 5, spread: 40, speed: 540, visual: 'arrow' })] }),
  k('ranger', 1, { cost: 14, cd: 7, range: 360, aim: 'enemy', tags: ['projectile', 'control'], actions: [shot(0.6, { status: [st('root', 2500)], visual: 'thorn' })] }),
  k('ranger', 2, { cost: 20, cd: 12, range: 0, aim: 'self', tags: ['buff'], actions: [{ a: 'buff', id: 'herons-eye', dur: 10000, to: 'self', charges: 3, flags: ['nextHitsCrit'] }] }),
  k('hedgewitch', 0, { cost: 8, cd: 2, range: 230, aim: 'enemy', tags: ['projectile', 'control'], actions: [shot(0.9, { range: 230, visual: 'bramble', onHit: [{ a: 'pull', dist: 90, area: single }] })] }),
  k('hedgewitch', 1, { cost: 14, cd: 6, range: 300, aim: 'ground', tags: ['heal', 'area'], actions: [{ a: 'heal', coef: 1.2, over: 3000, to: 'area', r: 80 }] }),
  k('hedgewitch', 2, { cost: 20, cd: 12, range: 0, aim: 'self', tags: ['control'], actions: [status(st('blind', 3000), self(110))] }),
  // ── Ash ──
  k('arcanist', 0, { cost: 8, cd: 1, range: 380, aim: 'enemy', tags: ['projectile'], actions: [shot(1.0, { status: [st('burn', 3000, { chance: 0.25 })], visual: 'ash-bolt' })] }),
  k('arcanist', 1, { cost: 14, cd: 5, range: 0, aim: 'self', tags: ['area'], actions: [dmg(1.4, self(96), undefined, undefined, { flags: ['knockback'] })] }),
  k('arcanist', 2, { cost: 20, cd: 10, range: 0, aim: 'self', kind: 'radiance', tags: ['heal'], actions: [{ a: 'heal', coef: 1.5, over: 3000, to: 'allies', r: 120 }] }),
  k('reaver', 0, { cost: 8, cd: 2, range: 84, aim: 'direction', tags: ['area'], actions: [dmg(1.1, cone(84, 150), undefined, [st('burn', 2000)])] }),
  k('reaver', 1, {
    cost: 0, hpCost: 0.1, cd: 12, range: 0, aim: 'self', tags: ['buff'],
    actions: [{ a: 'buff', id: 'bloodburn', dur: 6000, to: 'self', mods: [mod('atkSpeed', 0.3), mod('lifesteal', 0.1)], procs: [{ on: 'hit', do: [status(st('burn', 2000), single)] }] }],
  }),
  k('reaver', 2, { cost: 20, cd: 8, range: 160, aim: 'ground', tags: ['move', 'area'], actions: [{ a: 'move', mode: 'leap', dist: 160, iframes: 300, land: [dmg(1.6, self(84), undefined, undefined, { flags: ['knockback'] })] }] }),
  // ── Storm ──
  k('stormlancer', 0, { cost: 8, cd: 3, range: 120, aim: 'direction', tags: ['move'], actions: [{ a: 'move', mode: 'dash', dist: 120, iframes: 150, path: [dmg(1.0, line(120, 28))] }] }),
  k('stormlancer', 1, { cost: 14, cd: 8, range: 0, aim: 'self', tags: ['buff'], actions: [{ a: 'buff', id: 'conductor', dur: 10000, to: 'self', charges: 3, flags: ['nextHitsChain'] }] }),
  k('stormlancer', 2, { cost: 20, cd: 10, range: 0, aim: 'self', castMs: 400, tags: ['area'], actions: [{ a: 'delay', ms: 400, then: [dmg(2.0, self(110), undefined, [st('shock', 2000)])] }] }),
  k('sparkwright', 0, { cost: 8, cd: 1.5, range: 260, aim: 'enemy', tags: ['projectile'], actions: [{ a: 'chain', coef: 0.9, jumps: 3, range: 140 }] }),
  k('sparkwright', 1, { cost: 14, cd: 10, range: 260, aim: 'ground', tags: ['summon'], actions: [{ a: 'zone', kind: 'totem', area: atAim(110), dur: 6000, tick: 600, each: [dmg(0.45, atAim(110), undefined, undefined, { maxTargets: 1 })], visual: 'tesla' }] }),
  k('sparkwright', 2, { cost: 20, cd: 14, range: 0, aim: 'self', tags: ['buff'], actions: [{ a: 'buff', id: 'overcharge', dur: 10000, to: 'self', charges: 1, flags: ['freeCasts'], mods: [mod('spellDmg', 0.25)] }] }),
  // ── Radiance ──
  k('oathbound', 0, { cost: 8, cd: 2, range: 80, aim: 'direction', tags: ['area'], actions: [dmg(1.0, cone(80, 100)), dmg(0.4, atT(56))] }),
  k('oathbound', 1, { cost: 14, cd: 14, range: 220, aim: 'ally', tags: ['heal'], actions: [{ a: 'heal', pctMax: 0.35, to: 'target' }] }),
  k('oathbound', 2, { cost: 20, cd: 16, range: 0, aim: 'self', tags: ['buff'], actions: [{ a: 'buff', id: 'oath-of-dawn', dur: 6000, to: 'allies', r: 170, mods: [mod('dmgTaken', -0.25)] }] }),
  k('cantor', 0, { cost: 12, cd: 3, range: 0, aim: 'self', tags: ['heal'], actions: [{ a: 'heal', coef: 1.0, over: 4000, to: 'allies', r: 170 }] }),
  k('cantor', 1, { cost: 10, cd: 2.5, range: 80, aim: 'direction', tags: ['area'], actions: [dmg(1.6, cone(80, 160), undefined, [st('burn', 2000)])] }),
  k('cantor', 2, { cost: 20, cd: 12, range: 0, aim: 'self', tags: ['control'], actions: [status(st('stun', 1500), self(120))] }),
  // ── Umbral ──
  k('shade', 0, { cost: 8, cd: 4, range: 240, aim: 'enemy', tags: ['move'], actions: [{ a: 'move', mode: 'behind', dist: 240, iframes: 200, land: [dmg(0.8, single)] }] }),
  k('shade', 1, { cost: 14, cd: 4, range: 280, aim: 'direction', kind: 'physical', tags: ['projectile'], actions: [shot(0.7, { count: 3, spread: 30, speed: 540, range: 280, status: [st('bleed', 3000)], visual: 'glass-blade' })] }),
  k('shade', 2, { cost: 20, cd: 10, range: 320, aim: 'enemy', tags: ['control'], actions: [status(st('mark', 8000, { power: 0.3 }), single, 1)] }),
  k('duskweaver', 0, { cost: 8, cd: 2, range: 340, aim: 'enemy', tags: ['control'], actions: [dmg(0.9, single), status(st('linked', 6000), atT(130), 2)] }),
  k('duskweaver', 1, { cost: 14, cd: 6, range: 320, aim: 'direction', tags: ['projectile'], actions: [shot(0.5, { speed: 150, range: 320, radius: 24, pierce: true, flags: ['absorb'], visual: 'eclipse-orb' })] }),
  k('duskweaver', 2, { cost: 20, cd: 9, range: 340, aim: 'enemy', tags: ['control'], actions: [dmg(0.6, single), status(st('doom', 8000, { power: 2.0 }), single, 1)] }),
  // ── Blade ──
  k('swordsman', 0, { cost: 8, cd: 4, range: 0, aim: 'self', tags: ['buff'], actions: [{ a: 'buff', id: 'riposte', dur: 1500, to: 'self', charges: 1, flags: ['parry'] }] }),
  k('swordsman', 1, { cost: 14, cd: 5, range: 110, aim: 'direction', tags: ['move'], actions: [{ a: 'move', mode: 'dash', dist: 110, iframes: 120, path: [dmg(1.2, line(110, 24), undefined, undefined, { maxTargets: 1 })] }] }),
  k('swordsman', 2, { cost: 20, cd: 7, range: 0, aim: 'self', tags: ['area'], actions: [dmg(1.6, self(84))] }),
  k('samurai', 0, { cost: 8, cd: 4, range: 130, aim: 'direction', castMs: 600, tags: ['area'], actions: [dmg(2.6, line(130, 30))] }),
  k('samurai', 1, { cost: 14, cd: 6, range: 150, aim: 'direction', tags: ['move'], actions: [{ a: 'move', mode: 'dash', dist: 150, iframes: 300, path: [dmg(1.0, line(150, 28))] }] }),
  k('samurai', 2, { cost: 20, cd: 14, range: 0, aim: 'self', tags: ['buff'], actions: [{ a: 'buff', id: 'still-mind', dur: 10000, to: 'self', charges: 3, flags: ['nextHitsCrit'] }] }),
  // ── Iron ──
  k('knight', 0, { cost: 8, cd: 5, range: 120, aim: 'direction', tags: ['move', 'control'], actions: [{ a: 'move', mode: 'charge', dist: 120, path: [dmg(1.2, line(120, 30), undefined, [st('knockdown', 800)])] }] }),
  k('knight', 1, { cost: 14, cd: 6, range: 80, aim: 'enemy', tags: ['control'], actions: [dmg(2.4, single, undefined, [st('taunt', 4000)], { flags: ['taunt'] })] }),
  k('knight', 2, { cost: 20, cd: 18, range: 0, aim: 'self', tags: ['buff'], actions: [{ a: 'buff', id: 'iron-resolve', dur: 8000, to: 'self', charges: 3, flags: ['invulnerable'] }] }),
  k('juggernaut', 0, { cost: 8, cd: 4, range: 0, aim: 'self', tags: ['area', 'control'], actions: [dmg(1.5, self(90), undefined, [st('stun', 600)])] }),
  k('juggernaut', 1, {
    cost: 14, cd: 9, range: 170, aim: 'direction', tags: ['move'],
    actions: [{ a: 'buff', id: 'unstoppable', dur: 2000, to: 'self', flags: ['unstoppable'] }, { a: 'move', mode: 'charge', dist: 170, path: [dmg(0.9, line(170, 36), undefined, undefined, { flags: ['knockback'] })] }],
  }),
  k('juggernaut', 2, { cost: 20, cd: 16, range: 0, aim: 'self', tags: ['buff'], actions: [{ a: 'buff', id: 'spiked-hide', dur: 8000, to: 'self', flags: ['reflect'], mods: [mod('armor', 0.2, 'pct')] }] }),
  // ── Fist ──
  k('monk', 0, { cost: 8, cd: 2, range: 70, aim: 'enemy', tags: [], actions: [{ a: 'repeat', n: 6, every: 100, then: [dmg(0.25, single)] }, { a: 'resource', momentum: 1 }] }),
  k('monk', 1, { cost: 14, cd: 6, range: 0, aim: 'self', tags: ['area', 'control'], actions: [dmg(1.1, self(84), undefined, [st('knockdown', 1000)])] }),
  k('monk', 2, { cost: 20, cd: 18, range: 0, aim: 'self', tags: ['buff', 'heal'], actions: [{ a: 'buff', id: 'inner-calm', dur: 12000, to: 'self', procs: [{ on: 'dash', do: [{ a: 'heal', pctMax: 0.05, to: 'self' }] }] }] }),
  k('brawler', 0, { cost: 8, cd: 3, range: 70, aim: 'enemy', castMs: 400, tags: ['control'], actions: [dmg(2.0, single, undefined, undefined, { flags: ['knockback'] })] }),
  k('brawler', 1, {
    cost: 14, cd: 8, range: 0, aim: 'self', tags: ['buff'],
    actions: [{ a: 'buff', id: 'rope-a-dope', dur: 1500, to: 'self', charges: 1, flags: ['parry'], procs: [{ on: 'parry', do: [{ a: 'repeat', n: 3, every: 150, then: [dmg(0.6, single)] }] }] }],
  }),
  k('brawler', 2, { cost: 20, cd: 20, range: 0, aim: 'self', kind: 'physical', tags: ['heal'], actions: [{ a: 'heal', pctMax: 0.25, to: 'self' }, { a: 'resource', stamina: 100 }] }),
  // ── Hunt ──
  k('huntsman', 0, { cost: 8, cd: 2, range: 420, aim: 'direction', castMs: 300, kind: 'physical', tags: ['projectile'], actions: [shot(1.6, { speed: 620, range: 420, pierce: true, visual: 'bolt' })] }),
  k('huntsman', 1, { cost: 14, cd: 8, range: 200, aim: 'ground', tags: ['summon', 'control'], actions: [{ a: 'zone', kind: 'trap', area: atAim(26), dur: 20000, trigger: [dmg(1.0, atAim(26), 'physical', [st('root', 2000), st('bleed', 4000)])], visual: 'bear-trap' }] }),
  k('huntsman', 2, { cost: 20, cd: 10, range: 400, aim: 'enemy', tags: ['control'], actions: [status(st('mark', 10000, { power: 0.2 }), single, 1), status(st('slow', 4000, { power: 0.3 }), single, 1)] }),
  k('falconer', 0, { cost: 8, cd: 2, range: 380, aim: 'enemy', tags: ['summon'], actions: [{ a: 'delay', ms: 250, then: [dmg(1.1, single)] }] }),
  k('falconer', 1, { cost: 14, cd: 8, range: 380, aim: 'enemy', tags: ['control', 'summon'], actions: [status(st('blind', 3000), single, 1), { a: 'repeat', n: 4, every: 500, then: [dmg(0.25, single)] }] }),
  k('falconer', 2, { cost: 12, cd: 3, range: 260, aim: 'direction', kind: 'physical', tags: ['projectile'], actions: [shot(1.2, { speed: 580, range: 260, visual: 'knife' })] }),
  // ── Guile ──
  k('corsair', 0, { cost: 8, cd: 2, range: 76, aim: 'direction', kind: 'physical', tags: ['area'], actions: [{ a: 'repeat', n: 3, every: 120, then: [dmg(0.5, cone(76, 90))] }] }),
  k('corsair', 1, { cost: 14, cd: 8, range: 90, aim: 'direction', tags: ['control'], actions: [status(st('blind', 3000), cone(90, 70))] }),
  k('corsair', 2, { cost: 20, cd: 8, range: 76, aim: 'enemy', tags: ['control'], actions: [dmg(1.2, single, 'physical', [st('stun', 1000)]), { a: 'steal', gold: 4, buffs: false, area: single }] }),
  k('jester', 0, { cost: 8, cd: 2, range: 300, aim: 'direction', kind: 'physical', tags: ['projectile'], actions: [shot(0.6, { count: 3, spread: 20, bounce: 2, speed: 480, range: 300, visual: 'spin-dagger' })] }),
  k('jester', 1, { cost: 14, cd: 10, range: 120, aim: 'direction', tags: ['move', 'summon'], actions: [{ a: 'zone', kind: 'decoy', area: self(16), dur: 4000, taunts: true, visual: 'jester-decoy' }, { a: 'move', mode: 'dash', dist: 120, iframes: 300 }] }),
  k('jester', 2, { cost: 20, cd: 14, range: 0, aim: 'self', tags: ['buff'], actions: [{ a: 'buff', id: 'punchline', dur: 10000, to: 'self', mods: [mod('crit', 0.25)] }] }),
  // ── Song ──
  k('bard', 0, { cost: 14, cd: 8, range: 0, aim: 'self', tags: ['buff'], actions: [{ a: 'buff', id: 'rousing-ballad', dur: 6000, to: 'allies', r: 190, mods: [mod('dmg', 0.15)] }] }),
  k('bard', 1, { cost: 8, cd: 3, range: 320, aim: 'ground', tags: ['area', 'control'], actions: [dmg(0.8, atAim(80), undefined, [st('confuse', 3000)])] }),
  k('bard', 2, { cost: 20, cd: 12, range: 340, aim: 'enemy', tags: ['control'], actions: [status(st('sleep', 6000), single, 1)] }),
  k('skald', 0, { cost: 14, cd: 10, range: 0, aim: 'self', tags: ['buff'], actions: [{ a: 'buff', id: 'war-chant', dur: 8000, to: 'allies', r: 190, mods: [mod('moveSpeed', 0.15), mod('armor', 0.2, 'pct')] }] }),
  k('skald', 1, { cost: 8, cd: 2, range: 80, aim: 'direction', kind: 'physical', tags: ['area'], actions: [dmg(1.3, cone(80, 100)), { a: 'buff', id: 'drumbeat', dur: 3000, to: 'self', mods: [mod('dmg', 0.1)] }] }),
  k('skald', 2, { cost: 20, cd: 120, range: 0, aim: 'self', tags: ['heal'], actions: [{ a: 'revive', pctMax: 0.5, r: 220 }, { a: 'heal', pctMax: 0.2, to: 'allies', r: 220 }] }),
];
