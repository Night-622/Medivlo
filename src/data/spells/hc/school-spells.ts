/**
 * School spells (Claude 3): per school, 2 top-node spells and 1 ultimate for the Spells tree (handoff SKSP),
 * plus the scroll-only spells. Ultimates have a 90 s cooldown.
 */
import { HC_SCHOOL_SPELLS } from '@/data/classes/hc/classes.gen';
import type { HcSpell, SchoolId } from '@/systems/rules/types';
import { atAim, atT, cone, dmg, line, mod, schoolSpell, screen, self, shot, single, st, status } from './build';

type Mech = Parameters<typeof schoolSpell>[3];
const T = (school: SchoolId, i: 0 | 1 | 2, m: Mech): HcSpell => {
  const [name, desc] = HC_SCHOOL_SPELLS[school][i];
  return schoolSpell(school, name, desc, { ...m, tags: i === 2 ? [...m.tags, 'ultimate'] : m.tags });
};
const top1 = { cost: 28, cd: 9 }, top2 = { cost: 24, cd: 11 }, ult = { cost: 80, cd: 90 };

export const HC_SCHOOL_SPELL_DEFS: HcSpell[] = [
  // Ash
  T('ash', 0, { ...top1, range: 360, aim: 'ground', castMs: 500, tags: ['area'], actions: [{ a: 'delay', ms: 700, then: [dmg(3.2, atAim(96), undefined, [st('burn', 4000)])] }] }),
  T('ash', 1, { ...top2, range: 260, aim: 'ground', tags: ['area'], actions: [{ a: 'zone', kind: 'field', area: { shape: 'line', at: 'aim', len: 160, width: 32 }, dur: 5000, tick: 500, each: [dmg(0.5, { shape: 'line', at: 'aim', len: 160, width: 32 }, undefined, [st('burn', 2000)])], visual: 'flame-wall' }] }),
  T('ash', 2, { ...ult, range: 0, aim: 'self', tags: ['area'], actions: [{ a: 'repeat', n: 8, every: 500, then: [dmg(1.6, screen, undefined, [st('burn', 3000)], { maxTargets: 3 })] }] }),
  // Rime
  T('rime', 0, { ...top1, range: 340, aim: 'ground', tags: ['area', 'control'], actions: [{ a: 'zone', kind: 'field', area: atAim(100), dur: 4000, tick: 500, each: [dmg(0.45, atAim(100), undefined, [st('chill', 1500)])], visual: 'blizzard' }] }),
  T('rime', 1, { ...top2, cd: 8, range: 420, aim: 'direction', tags: ['projectile'], actions: [shot(3.2, { speed: 620, range: 420, pierce: true, visual: 'ice-lance' })] }),
  T('rime', 2, { ...ult, range: 0, aim: 'self', tags: ['control'], actions: [status(st('freeze', 4000), screen)] }),
  // Storm
  T('storm', 0, { ...top1, range: 360, aim: 'direction', tags: ['projectile', 'area'], actions: [shot(0.4, { speed: 120, range: 360, radius: 30, pierce: true, visual: 'ball-lightning', onHit: [{ a: 'chain', coef: 0.4, jumps: 2, range: 120 }] })] }),
  T('storm', 1, { ...top2, range: 0, aim: 'self', tags: ['area', 'control'], actions: [dmg(1.2, self(120), undefined, [st('stun', 1500)])] }),
  T('storm', 2, { ...ult, range: 0, aim: 'self', tags: ['area'], actions: [{ a: 'repeat', n: 12, every: 500, then: [dmg(1.1, self(180), undefined, [st('shock', 1500)], { maxTargets: 2 })] }] }),
  // Radiance
  T('radiance', 0, { ...top1, range: 360, aim: 'direction', tags: ['area', 'heal'], actions: [dmg(2.0, line(360, 28)), { a: 'heal', coef: 0.8, to: 'allies', r: 0 }] }),
  T('radiance', 1, { ...top2, range: 0, aim: 'self', tags: ['buff', 'area'], actions: [{ a: 'zone', kind: 'field', area: self(110), dur: 6000, tick: 500, each: [{ a: 'buff', id: 'sanctuary', dur: 600, to: 'area', r: 110, mods: [mod('dmgTaken', -0.4)] }], visual: 'sanctuary' }] }),
  T('radiance', 2, { ...ult, range: 0, aim: 'self', tags: ['heal', 'control'], actions: [{ a: 'heal', pctMax: 1, to: 'party' }, status(st('blind', 3000), screen)] }),
  // Umbral
  T('umbral', 0, { ...top1, range: 320, aim: 'enemy', tags: ['move'], actions: [{ a: 'move', mode: 'blink', dist: 320, iframes: 250, land: [dmg(1.4, single)] }] }),
  T('umbral', 1, { ...top2, range: 180, aim: 'direction', tags: ['area'], actions: [dmg(1.6, cone(180, 60), undefined, undefined, { flags: ['lifesteal'] })] }),
  T('umbral', 2, { ...ult, range: 0, aim: 'self', tags: ['buff'], actions: [{ a: 'buff', id: 'eclipse', dur: 5000, to: 'self', flags: ['stealth'], mods: [mod('dmg', 1, 'more')] }] }),
  // Verdant
  T('verdant', 0, { ...top1, range: 340, aim: 'ground', tags: ['area', 'control'], actions: [dmg(1.2, atAim(96), undefined, [st('root', 2500)])] }),
  T('verdant', 1, { ...top2, range: 340, aim: 'direction', tags: ['projectile'], actions: [shot(0.7, { count: 7, spread: 60, speed: 500, range: 340, status: [st('bleed', 4000)], visual: 'thorn' })] }),
  T('verdant', 2, { ...ult, range: 0, aim: 'self', tags: ['summon'], actions: [{ a: 'summon', what: 'treant', count: 3, dur: 15000, power: 1 }] }),
  // Blade
  T('blade', 0, { ...top1, range: 160, aim: 'direction', tags: ['move', 'area'], actions: [{ a: 'move', mode: 'dash', dist: 160, iframes: 400, path: [{ a: 'repeat', n: 4, every: 80, then: [dmg(0.6, self(70))] }] }] }),
  T('blade', 1, { ...top2, cost: 16, cd: 6, range: 0, aim: 'self', tags: ['buff'], actions: [{ a: 'buff', id: 'perfect-parry', dur: 4000, to: 'self', charges: 1, flags: ['parry'], procs: [{ on: 'parry', do: [dmg(3.0, single)] }] }] }),
  T('blade', 2, { ...ult, range: 0, aim: 'self', tags: ['area'], actions: [dmg(4.0, screen, undefined, undefined, { flags: ['alwaysCrit'] })] }),
  // Iron
  T('iron', 0, { ...top1, range: 120, aim: 'ground', tags: ['summon'], actions: [{ a: 'zone', kind: 'wall', area: { shape: 'line', at: 'aim', len: 140, width: 18 }, dur: 6000, blocksShots: true, visual: 'iron-wall' }] }),
  T('iron', 1, { ...top2, range: 0, aim: 'self', tags: ['area', 'control'], actions: [dmg(1.5, self(130), undefined, [st('knockdown', 1500)])] }),
  T('iron', 2, { ...ult, range: 0, aim: 'self', tags: ['buff'], actions: [{ a: 'buff', id: 'unbreakable', dur: 6000, to: 'self', flags: ['invulnerable', 'unstoppable'] }] }),
  // Fist
  T('fist', 0, { ...top1, range: 130, aim: 'enemy', tags: ['move'], actions: [{ a: 'move', mode: 'leap', dist: 130, land: [dmg(2.2, atT(48), undefined, [st('knockdown', 1200)], { flags: ['launch'] })] }] }),
  T('fist', 1, { ...top2, range: 0, aim: 'self', tags: ['buff'], actions: [{ a: 'buff', id: 'iron-skin', dur: 4000, to: 'self', mods: [mod('dmgTaken', -0.5)] }] }),
  T('fist', 2, { ...ult, range: 80, aim: 'enemy', castMs: 600, tags: ['area'], actions: [dmg(5.0, single), dmg(1.5, screen, undefined, [st('stun', 1500)])] }),
  // Hunt
  T('hunt', 0, { ...top1, range: 260, aim: 'ground', tags: ['summon', 'control'], actions: [{ a: 'zone', kind: 'trap', area: atAim(28), dur: 30000, trigger: [status(st('root', 3000), atAim(28), 1)], visual: 'snare' }] }),
  T('hunt', 1, { ...top2, range: 480, aim: 'direction', castMs: 400, kind: 'physical', tags: ['projectile'], actions: [shot(2.4, { speed: 760, range: 480, pierce: true, visual: 'arrow' })] }),
  T('hunt', 2, { ...ult, range: 0, aim: 'self', tags: ['control'], actions: [status(st('mark', 10000, { power: 0.5 }), screen)] }),
  // Guile
  T('guile', 0, { ...top1, range: 0, aim: 'self', tags: ['buff', 'control'], actions: [status(st('confuse', 3000), self(110)), { a: 'buff', id: 'smoke-bomb', dur: 3000, to: 'self', flags: ['stealth'] }] }),
  T('guile', 1, { ...top2, range: 220, aim: 'enemy', kind: 'physical', tags: ['move'], actions: [{ a: 'move', mode: 'behind', dist: 220, land: [dmg(3.0, single, undefined, undefined, { flags: ['alwaysCrit'] })] }] }),
  T('guile', 2, { ...ult, range: 0, aim: 'self', tags: ['area'], actions: [{ a: 'steal', gold: 25, buffs: true, area: self(200) }] }),
  // Song
  T('song', 0, { ...top1, range: 0, aim: 'self', castMs: 0, tags: ['buff'], actions: [{ a: 'buff', id: 'ballad-of-valour', dur: 8000, to: 'allies', r: 220, mods: [mod('dmg', 0.2)] }] }),
  T('song', 1, { ...top2, range: 0, aim: 'self', tags: ['area', 'control'], actions: [dmg(1.2, self(130), undefined, undefined, { flags: ['knockback'] })] }),
  T('song', 2, { ...ult, range: 0, aim: 'self', tags: ['buff'], actions: [{ a: 'cooldowns', reduceMs: 'all', to: 'allies', r: 400 }] }),
];

/** Scroll-only spells (consumable scrolls cast these without Ember). Others reuse school spells. */
export const HC_SCROLL_SPELLS: HcSpell[] = [
  schoolSpell('ash', 'Fireball', 'Hurl a ball of fire that bursts on impact.', { cost: 0, cd: 0, range: 380, aim: 'direction', tags: ['projectile'], actions: [shot(2.0, { visual: 'fireball', onHit: [dmg(1.0, atT(64), undefined, [st('burn', 3000)])] })] }),
  schoolSpell('rime', 'Frost Nova', 'Freeze every foe around you.', { cost: 0, cd: 0, range: 0, aim: 'self', tags: ['control'], actions: [dmg(0.8, self(110), undefined, [st('freeze', 2500)])] }),
  schoolSpell('storm', 'Chain Lightning', 'Lightning leaps from foe to foe.', { cost: 0, cd: 0, range: 300, aim: 'enemy', tags: ['projectile'], actions: [{ a: 'chain', coef: 1.5, jumps: 5, range: 160 }] }),
  schoolSpell('verdant', 'Entangle', 'Roots burst up around a foe.', { cost: 0, cd: 0, range: 320, aim: 'enemy', tags: ['control'], actions: [status(st('root', 4000), atT(80))] }),
];

/** Scroll item → spell id. */
export const SCROLL_SPELL: Record<string, string> = {
  i_scroll_ash: 'spell:fireball', i_scroll_rime: 'spell:frost-nova', i_scroll_storm: 'spell:chain-lightning',
  i_scroll_radiance: 'spell:sanctuary', i_scroll_umbral: 'spell:shadow-step', i_scroll_verdant: 'spell:entangle',
};
