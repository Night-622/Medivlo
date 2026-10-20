/**
 * Curated hybrid set bonuses (Claude 5 for Claude 3, docs/systems/BUILDS.md §5): 2 pieces of school A + 2 of school B.
 * Twelve themed pairs, each school in exactly two (a ring: ash–rime–storm–iron–fist–blade–guile–umbral–hunt–verdant–
 * song–radiance–ash); every other pair keeps the generic fallback (both schools' 4-piece effects at 50%). Each passive
 * is worth about one 4-piece effect and replaces the fallback for its pair (rules/gear.ts hybridBonus, Claude 3).
 * Names and lines are working text for Claude 4.
 */
import type { Action, Area, Modifier, Passive, SchoolId } from '@/systems/rules/types';

export interface HybridSet { schools: [SchoolId, SchoolId]; name: string; text: string; passive: Passive }

const f = (stat: Modifier['stat'], value: number, when?: Modifier['when']): Modifier => ({ stat, op: 'flat', value, ...(when ? { when } : {}) });
const tgt: Area = { shape: 'single', at: 'target' };
const at = (r: number): Area => ({ shape: 'circle', at: 'target', r });
const near = (r: number): Area => ({ shape: 'circle', at: 'self', r });
const buff = (id: string, dur: number, mods: Modifier[], extra: Partial<Extract<Action, { a: 'buff' }>> = {}): Action => ({ a: 'buff', id, dur, to: 'self', mods, ...extra });

export const HC_HYBRIDS: HybridSet[] = [
  { schools: ['ash', 'rime'], name: 'Steam', text: 'Critical hits burst into scalding steam: 50% Ash damage around the target and chill for 2 s (2 s).',
    passive: { procs: [{ on: 'crit', icd: 2000, do: [{ a: 'damage', coef: 0.5, kind: 'ash', area: at(72), status: [{ id: 'chill', dur: 2000 }] }] }] } },
  { schools: ['rime', 'storm'], name: 'Blizzard', text: 'Your chains jump to 1 more foe; hits have a 20% chance to chill; +10% damage to chilled foes.',
    passive: { mods: [f('chains', 1), f('dmg', 0.1, { c: 'targetHas', status: 'chill' })], procs: [{ on: 'hit', chance: 0.2, do: [{ a: 'status', status: { id: 'chill', dur: 2000 }, area: tgt }] }] } },
  { schools: ['storm', 'iron'], name: 'Lightning Rod', text: '+5% block chance; blocking calls lightning that chains to 3 foes (60% Storm, 1 s).',
    passive: { mods: [f('block', 0.05)], procs: [{ on: 'block', icd: 1000, do: [{ a: 'chain', coef: 0.6, kind: 'storm', jumps: 3, range: 140 }] }] } },
  { schools: ['iron', 'fist'], name: 'Iron Body', text: '+1 maximum Momentum; at 3 or more Momentum you take 12% less damage.',
    passive: { mods: [f('maxMomentum', 1), f('dmgTaken', -0.12, { c: 'momentum', min: 3 })] } },
  { schools: ['fist', 'blade'], name: 'Flurry', text: '+6% attack speed; every 4th hit makes the next one a critical hit.',
    passive: { mods: [f('atkSpeed', 0.06)], procs: [{ on: 'hit', every: 4, do: [buff('hy:flurry', 3000, [], { charges: 1, flags: ['nextHitsCrit'] })] }] } },
  { schools: ['blade', 'guile'], name: 'Duelist’s Gambit', text: '+5% critical chance; landing a dash makes your next 2 hits critical (5 s).',
    passive: { mods: [f('crit', 0.05)], procs: [{ on: 'dashEnd', icd: 5000, do: [buff('hy:gambit', 3000, [], { charges: 2, flags: ['nextHitsCrit'] })] }] } },
  { schools: ['guile', 'umbral'], name: 'Shadowplay', text: 'Kills hide you in shadow for 1.5 s (4 s); hits from stealth deal 60% more.',
    passive: { mods: [{ stat: 'dmg', op: 'more', value: 0.6, when: { c: 'fromStealth' } }], procs: [{ on: 'kill', icd: 4000, do: [buff('hy:shadowplay', 1500, [], { flags: ['stealth'] })] }] } },
  { schools: ['umbral', 'hunt'], name: 'Night Stalker', text: 'Every 5th attack marks the foe (+25% damage taken, 6 s); +15% damage to marked foes.',
    passive: { mods: [f('dmg', 0.15, { c: 'targetHas', status: 'mark' })], procs: [{ on: 'attack', every: 5, do: [{ a: 'status', status: { id: 'mark', dur: 6000, power: 0.25 }, area: tgt, maxTargets: 1 }] }] } },
  { schools: ['hunt', 'verdant'], name: 'Wildwood', text: 'Hits have a 15% chance to root the foe for 1 s (3 s); +15% damage to rooted foes.',
    passive: { mods: [f('dmg', 0.15, { c: 'targetHas', status: 'root' })], procs: [{ on: 'hit', chance: 0.15, icd: 3000, do: [{ a: 'status', status: { id: 'root', dur: 1000 }, area: tgt }] }] } },
  { schools: ['verdant', 'song'], name: 'Pastoral', text: 'You and allies near you receive 10% more healing; +3 health per second in combat.',
    passive: { mods: [f('hpRegen', 3, { c: 'inCombat' })], aura: [{ id: 'hy:pastoral', r: 160, mods: [f('healingTaken', 0.1)] }] } },
  { schools: ['song', 'radiance'], name: 'Hymnal', text: 'Your buffs are 20% stronger and last 20% longer; +15% healing done.',
    passive: { mods: [f('buffPower', 0.2), f('buffDur', 0.2), f('healing', 0.15)] } },
  { schools: ['radiance', 'ash'], name: 'Sunfire', text: 'Your heals scorch foes near you for 40% Ash damage (1.5 s); +10% healing done.',
    passive: { mods: [f('healing', 0.1)], procs: [{ on: 'heal', icd: 1500, do: [{ a: 'damage', coef: 0.4, kind: 'ash', area: near(96) }] }] } },
];
