/**
 * Phase 2 class spells and powers: Reaver (Bloodcraft), Shade (shadowcraft), Oathbound (Radiance). Owner: Claude 3.
 * cost.health ≤ 1 means a fraction of max HP (Bloodcraft).
 */
import type { SpellDef, SpellRankDef } from '@/core';

const MASTERY = [0, 200, 600, 1500, 3000];
const DMG = [1, 1.1, 1.2, 1.35, 1.5];
const SOCKETS = [0, 1, 1, 2, 3];
const ranks = (essence: `item:${string}` | null): SpellRankDef[] => MASTERY.map((masteryXp, i) => ({
  masteryXp, damageMult: DMG[i], glyphSockets: SOCKETS[i], choices: [],
  essenceCost: essence && i >= 3 ? { item: essence, qty: i === 3 ? 1 : 3 } : undefined,
}));

const spells: SpellDef[] = [
  // ───────── Reaver ─────────
  {
    id: 'spell:blood-rend', name: 'Blood Rend', abilityKind: 'power', discipline: 'bloodcraft', phase: 2,
    description: 'Open a vein and tear: a wide blow for 130% weapon damage with heavy Bleed. Costs 6% of max HP; Bloodcraft hits harder the more you have bled.',
    cost: { health: 0.06 }, cooldownMs: 5000, castTimeMs: 200, canMoveWhileCasting: false, targeting: 'direction',
    delivery: { kind: 'melee', arcDeg: 130, reachPx: 66, weaponScaled: true },
    weaponDamagePct: 1.3, scaling: {}, buildup: { bleed: 45 }, poiseDamage: 28, effects: [],
    tags: ['melee'], ranks: ranks(null), vfx: { color: '#c94545', shape: 'arc' },
  },
  {
    id: 'spell:crimson-leap', name: 'Crimson Leap', abilityKind: 'power', discipline: 'bloodcraft', phase: 2,
    description: 'Leap up to 170 px and crash down, hitting everything where you land for 110% weapon damage. Costs 5% of max HP.',
    cost: { health: 0.05, stamina: 15 }, cooldownMs: 9000, castTimeMs: 150, canMoveWhileCasting: false, targeting: 'point',
    delivery: { kind: 'dash', distancePx: 170, damageOnPath: true },
    weaponDamagePct: 1.1, scaling: {}, poiseDamage: 40, effects: [{ kind: 'hook', hook: 'slamOnLand', params: { radius: 72 } }],
    tags: ['movement', 'area'], ranks: ranks(null), vfx: { color: '#c94545', shape: 'burst' },
  },
  {
    id: 'spell:bloodlust', name: 'Bloodlust', abilityKind: 'power', discipline: 'bloodcraft', phase: 2,
    description: 'For 8 s: +20% attack speed and 5% life leech. Costs 10% of max HP.',
    cost: { health: 0.1 }, cooldownMs: 22000, castTimeMs: 0, canMoveWhileCasting: true, targeting: 'self',
    delivery: { kind: 'aura', radius: 0, durationMs: 8000 }, scaling: {},
    effects: [{ kind: 'modifier', mod: { stat: 'attackSpeed', op: 'increased', value: 0.2 } }, { kind: 'modifier', mod: { stat: 'lifeLeech', op: 'flat', value: 0.05 } }],
    tags: ['buff'], ranks: ranks(null), vfx: { color: '#9b2c2c', shape: 'ring' },
  },
  {
    id: 'spell:wolf-howl', name: 'Wolf Howl', abilityKind: 'power', discipline: 'martial', phase: 2,
    description: 'A Hrothi war-howl: nearby enemies are Weakened (−25% damage) for 5 s; gain 30 Fury.',
    cost: { stamina: 25 }, cooldownMs: 16000, castTimeMs: 250, canMoveWhileCasting: false, targeting: 'self',
    delivery: { kind: 'area', radius: 140, rangePx: 0, delayMs: 0 },
    damage: [{ type: 'blunt', min: 1, max: 2 }], scaling: {}, poiseDamage: 10,
    effects: [{ kind: 'applyStatus', trigger: 'onHit', status: 'weaken', target: 'target', durationMs: 5000 }, { kind: 'hook', hook: 'gainResource', params: { amount: 30 } }],
    tags: ['area', 'curse'], ranks: ranks(null), vfx: { color: '#a09a8e', shape: 'ring' },
  },
  // ───────── Shade ─────────
  {
    id: 'spell:shadowstep', name: 'Shadowstep', abilityKind: 'power', discipline: 'shadowcraft', phase: 2,
    description: 'Step through the dark, up to 150 px, and vanish: Stealth for 2 s. Your first hit from Stealth is a guaranteed crit for double damage.',
    cost: { stamina: 20 }, cooldownMs: 8000, castTimeMs: 0, canMoveWhileCasting: true, targeting: 'point',
    delivery: { kind: 'dash', distancePx: 150, damageOnPath: false }, scaling: {},
    effects: [{ kind: 'applyStatus', trigger: 'onCast', status: 'stealth', target: 'self', durationMs: 2000 }],
    tags: ['movement'], ranks: ranks(null), vfx: { color: '#7a44b8', shape: 'burst' },
  },
  {
    id: 'spell:fan-of-knives', name: 'Fan of Knives', abilityKind: 'power', discipline: 'shadowcraft', phase: 2,
    description: 'Throw five knives in a fan, each 55% weapon damage with Poison buildup.',
    cost: { stamina: 22 }, cooldownMs: 7000, castTimeMs: 150, canMoveWhileCasting: false, targeting: 'direction',
    delivery: { kind: 'projectile', projectile: { speed: 620, rangePx: 260, radius: 4, pierce: 0, count: 5, spreadDeg: 60, color: '#a09a8e' } },
    weaponDamagePct: 0.55, scaling: {}, buildup: { poison: 25 }, poiseDamage: 4, effects: [],
    tags: ['projectile'], ranks: ranks(null), vfx: { color: '#a09a8e', shape: 'bolt' },
  },
  {
    id: 'spell:smoke-veil', name: 'Smoke Veil', abilityKind: 'power', discipline: 'shadowcraft', phase: 2,
    description: 'Burst a smoke flask at your feet: enemies inside are Blinded (half their attacks miss) for 4 s and you slip into Stealth.',
    cost: { stamina: 25 }, cooldownMs: 18000, castTimeMs: 0, canMoveWhileCasting: true, targeting: 'self',
    delivery: { kind: 'area', radius: 100, rangePx: 0, delayMs: 0, durationMs: 4000, tickMs: 1000 },
    damage: [{ type: 'poison', min: 1, max: 1 }], scaling: {},
    effects: [
      { kind: 'applyStatus', trigger: 'onHit', status: 'blind', target: 'target', durationMs: 1200 },
      { kind: 'applyStatus', trigger: 'onCast', status: 'stealth', target: 'self', durationMs: 2500 },
    ],
    tags: ['area', 'curse'], ranks: ranks(null), vfx: { color: '#5a554d', shape: 'ring' },
  },
  {
    id: 'spell:deathmark', name: 'Deathmark', abilityKind: 'power', discipline: 'shadowcraft', phase: 2,
    description: 'Flick a marked blade: the target is Vulnerable (+25% damage taken) for 6 s.',
    cost: { stamina: 15 }, cooldownMs: 12000, castTimeMs: 100, canMoveWhileCasting: true, targeting: 'direction',
    delivery: { kind: 'projectile', projectile: { speed: 800, rangePx: 420, radius: 5, pierce: 0, color: '#c9a2f0' } },
    weaponDamagePct: 0.5, scaling: {}, effects: [{ kind: 'applyStatus', trigger: 'onHit', status: 'vulnerable', target: 'target', durationMs: 6000 }],
    tags: ['projectile', 'curse'], ranks: ranks(null), vfx: { color: '#c9a2f0', shape: 'bolt' },
  },
  // ───────── Oathbound ─────────
  {
    id: 'spell:lantern-smite', name: 'Lantern Smite', abilityKind: 'spell', school: 'radiance', phase: 2,
    description: 'Call down the Lantern’s light on a point: radiant damage and heavy poise damage. ×1.5 against the Hollowed.',
    cost: { mana: 14 }, cooldownMs: 3000, castTimeMs: 300, canMoveWhileCasting: false, targeting: 'point',
    delivery: { kind: 'area', radius: 64, rangePx: 220, delayMs: 250 },
    damage: [{ type: 'radiant', min: 16, max: 21 }], scaling: { will: 'A', might: 'D' }, poiseDamage: 35,
    effects: [{ kind: 'hook', hook: 'banesHollowed', params: { mult: 1.5 } }],
    tags: ['area'], ranks: ranks('item:essence-ash'), vfx: { color: '#fbe7a3', shape: 'burst' },
  },
  {
    id: 'spell:sacred-ward', name: 'Sacred Ward', abilityKind: 'spell', school: 'radiance', phase: 2,
    description: 'A ward absorbing 25% of max HP for 8 s, and regenerate 2% HP per second while it holds.',
    cost: { mana: 20 }, cooldownMs: 16000, castTimeMs: 200, canMoveWhileCasting: true, targeting: 'self',
    delivery: { kind: 'self' }, scaling: {},
    effects: [
      { kind: 'applyStatus', trigger: 'onCast', status: 'ward', target: 'self', durationMs: 8000, magnitude: 0.25 },
      { kind: 'applyStatus', trigger: 'onCast', status: 'regen', target: 'self', durationMs: 8000, magnitude: 3 },
    ],
    tags: ['buff', 'heal'], ranks: ranks(null), vfx: { color: '#fbe7a3', shape: 'ring' },
  },
  {
    id: 'spell:consecration', name: 'Consecration', abilityKind: 'spell', school: 'radiance', phase: 2,
    description: 'Hallow the ground around you for 6 s: enemies inside take radiant damage; you regenerate HP while you stand in it.',
    cost: { mana: 26 }, cooldownMs: 18000, castTimeMs: 400, canMoveWhileCasting: false, targeting: 'self',
    delivery: { kind: 'area', radius: 110, rangePx: 0, delayMs: 0, durationMs: 6000, tickMs: 500 },
    damage: [{ type: 'radiant', min: 4, max: 6 }], scaling: { will: 'B' }, poiseDamage: 4,
    effects: [{ kind: 'modifier', mod: { stat: 'hpRegen', op: 'flat', value: 4 } }],
    tags: ['area', 'aura', 'heal'], ranks: ranks(null), vfx: { color: '#ebc969', shape: 'ring' },
  },
  {
    id: 'spell:judgment', name: 'Judgment', abilityKind: 'spell', school: 'radiance', phase: 2,
    description: 'A lance of white light that pierces every foe in a line.',
    cost: { mana: 28 }, cooldownMs: 9000, castTimeMs: 500, canMoveWhileCasting: false, targeting: 'direction',
    delivery: { kind: 'projectile', projectile: { speed: 900, rangePx: 520, radius: 7, pierce: 6, color: '#fff8e8' } },
    damage: [{ type: 'radiant', min: 28, max: 36 }], scaling: { will: 'A' }, poiseDamage: 30,
    effects: [{ kind: 'hook', hook: 'banesHollowed', params: { mult: 1.5 } }],
    tags: ['projectile'], ranks: ranks(null), vfx: { color: '#fff8e8', shape: 'beam' },
  },
];

export default spells;
