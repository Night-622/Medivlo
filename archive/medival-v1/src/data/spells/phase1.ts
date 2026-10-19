/**
 * Phase 1 spells and powers (SYSTEMS.md §6). Owner: Claude 3.
 * Note: when a power has both `weaponDamagePct` and `damage`, the weapon roll is converted to the
 * damage types listed in `damage` (min/max ignored), e.g. Shield Bash deals blunt.
 */
import type { SpellDef, SpellRankDef, SpellUpgradeChoice } from '@/core';

const MASTERY = [0, 200, 600, 1500, 3000];
const DMG = [1, 1.1, 1.2, 1.35, 1.5];
const SOCKETS = [0, 1, 1, 2, 3];

function ranks(essence: `item:${string}` | null, choices: Partial<Record<2 | 3 | 5, SpellUpgradeChoice[]>> = {}): SpellRankDef[] {
  return MASTERY.map((masteryXp, i) => {
    const rank = (i + 1) as 1 | 2 | 3 | 4 | 5;
    return {
      masteryXp,
      damageMult: DMG[i],
      glyphSockets: SOCKETS[i],
      essenceCost: essence && rank >= 4 ? { item: essence, qty: rank === 4 ? 1 : 3 } : undefined,
      choices: (rank === 2 || rank === 3 || rank === 5 ? choices[rank] : undefined) ?? [],
    };
  });
}

const spells: SpellDef[] = [
  // ───────── class starters ─────────
  {
    id: 'spell:shield-bash', name: 'Shield Bash', abilityKind: 'power', discipline: 'martial', phase: 1,
    description: 'Lunge behind your shield and slam the foe. Deals 80% weapon damage as blunt with heavy poise damage, and interrupts casts.',
    cost: { stamina: 25 }, cooldownMs: 6000, castTimeMs: 0, canMoveWhileCasting: false, targeting: 'direction',
    delivery: { kind: 'melee', arcDeg: 80, reachPx: 58, weaponScaled: true },
    weaponDamagePct: 0.8, damage: [{ type: 'blunt', min: 0, max: 0 }], scaling: {}, poiseDamage: 60,
    effects: [{ kind: 'hook', hook: 'lunge', params: { distance: 40 } }],
    tags: ['melee'], ranks: ranks(null), vfx: { color: '#d8d0bf', shape: 'arc' },
  },
  {
    id: 'spell:pinning-shot', name: 'Pinning Shot', abilityKind: 'power', discipline: 'archery', phase: 1,
    description: 'A heavy shaft that pins the target to the ground. Deals 140% weapon damage and roots for 2 s (bosses are slowed instead).',
    cost: { stamina: 20 }, cooldownMs: 8000, castTimeMs: 150, canMoveWhileCasting: false, targeting: 'direction',
    delivery: { kind: 'projectile', projectile: { speed: 780, rangePx: 600, radius: 5, pierce: 0, color: '#c9b48a' } },
    weaponDamagePct: 1.4, scaling: {}, poiseDamage: 20,
    effects: [{ kind: 'applyStatus', trigger: 'onHit', status: 'root', target: 'target', durationMs: 2000 }],
    tags: ['projectile'], ranks: ranks(null), vfx: { color: '#c9b48a', shape: 'bolt' },
  },
  {
    id: 'spell:ash-bolt', name: 'Ash Bolt', abilityKind: 'spell', school: 'ash', phase: 1,
    description: 'Hurl a bolt of Ashvar’s fire. Builds Burn.',
    cost: { mana: 12 }, cooldownMs: 800, castTimeMs: 250, canMoveWhileCasting: true, targeting: 'direction',
    delivery: { kind: 'projectile', projectile: { speed: 420, rangePx: 420, radius: 6, pierce: 0, color: '#ff8a3d' } },
    damage: [{ type: 'fire', min: 15, max: 20 }], scaling: { intellect: 'A' }, buildup: { burn: 35 }, poiseDamage: 6,
    effects: [], tags: ['projectile'],
    ranks: ranks('item:essence-ash', {
      2: [
        { id: 'kindling', name: 'Kindling', description: '+40% Burn buildup.', mods: [{ kind: 'addBuildup', status: 'burn', value: 14 }] },
        { id: 'quickfire', name: 'Quickfire', description: '−30% cast time.', mods: [{ kind: 'castTimeMult', value: 0.7 }] },
      ],
      3: [
        { id: 'splitting-flame', name: 'Splitting Flame', description: '+2 bolts at 60% damage.', mods: [{ kind: 'extraProjectiles', value: 2, spreadDeg: 25 }, { kind: 'damageMult', value: 0.6 }] },
        { id: 'searing-core', name: 'Searing Core', description: 'Pierces 2 targets.', mods: [{ kind: 'pierce', value: 2 }] },
      ],
      5: [
        { id: 'cinderstorm', name: 'Cinderstorm', description: 'Burning targets that die explode for 50% damage.', mods: [{ kind: 'effect', effect: { kind: 'hook', hook: 'cinderstorm', params: { pct: 0.5, radius: 80 } } }] },
        { id: 'lance-of-ashvar', name: 'Lance of Ashvar', description: '+50% damage and size; −20% speed.', mods: [{ kind: 'damageMult', value: 1.5 }, { kind: 'areaMult', value: 1.5 }] },
      ],
    }),
    vfx: { color: '#ff8a3d', shape: 'bolt' },
  },
  // ───────── universal ─────────
  {
    id: 'spell:ashmark', name: 'Ashmark', abilityKind: 'power', discipline: 'ashmark', phase: 1,
    description: 'Burn the Mire out of what is near you. Damages Hollowed and Unwrought (×1.5 vs Hollowed), and cleanses weakened cleansable foes (press F).',
    cost: { mana: 10 }, cooldownMs: 10000, castTimeMs: 300, canMoveWhileCasting: false, targeting: 'self',
    delivery: { kind: 'area', radius: 84, rangePx: 0, delayMs: 0 },
    damage: [{ type: 'fire', min: 14, max: 18 }], scaling: { will: 'C', intellect: 'C' }, poiseDamage: 15,
    effects: [{ kind: 'hook', hook: 'ashmarkPurge', params: { hollowedMult: 1.5 } }],
    tags: ['area'], ranks: ranks(null), vfx: { color: '#ffb347', shape: 'ring' },
  },
  {
    id: 'spell:frostbite', name: 'Frostbite', abilityKind: 'spell', school: 'rime', phase: 1,
    description: 'A cone of Saela’s cold. Chills, and builds toward Frozen.',
    cost: { mana: 15 }, cooldownMs: 3000, castTimeMs: 300, canMoveWhileCasting: false, targeting: 'direction',
    delivery: { kind: 'cone', angleDeg: 55, rangePx: 120 },
    damage: [{ type: 'frost', min: 14, max: 18 }], scaling: { intellect: 'A', will: 'D' }, buildup: { frozen: 45 }, poiseDamage: 8,
    effects: [{ kind: 'applyStatus', trigger: 'onHit', status: 'chill', target: 'target', durationMs: 3000, magnitude: 2 }],
    tags: ['area'], ranks: ranks('item:essence-rime'), vfx: { color: '#8fd3ff', shape: 'arc' },
  },
  // ───────── Warden tree abilities ─────────
  {
    id: 'spell:rallying-shout', name: 'Rallying Shout', abilityKind: 'power', discipline: 'martial', phase: 1,
    description: 'For 6 s: +20% damage. Gain 25 Resolve.',
    cost: { stamina: 30 }, cooldownMs: 18000, castTimeMs: 200, canMoveWhileCasting: true, targeting: 'self',
    delivery: { kind: 'aura', radius: 0, durationMs: 6000 }, scaling: {},
    effects: [{ kind: 'modifier', mod: { stat: 'damageDealt', op: 'increased', value: 0.2 } }, { kind: 'hook', hook: 'gainResource', params: { amount: 25 } }],
    tags: ['buff'], ranks: ranks(null), vfx: { color: '#d4a646', shape: 'ring' },
  },
  {
    id: 'spell:cleave', name: 'Cleave', abilityKind: 'power', discipline: 'martial', phase: 1,
    description: 'A wide sweeping heavy blow: 120% weapon damage in a 150° arc.',
    cost: { stamina: 25 }, cooldownMs: 7000, castTimeMs: 250, canMoveWhileCasting: false, targeting: 'direction',
    delivery: { kind: 'melee', arcDeg: 150, reachPx: 66, weaponScaled: true },
    weaponDamagePct: 1.2, scaling: {}, poiseDamage: 30, effects: [],
    tags: ['melee'], ranks: ranks(null), vfx: { color: '#f2e6cf', shape: 'arc' },
  },
  {
    id: 'spell:war-banner', name: 'War Banner', abilityKind: 'power', discipline: 'martial', phase: 1,
    description: 'Plant a banner for 8 s. While you stand near it: +15% damage and +20 armour. Costs 40 Resolve.',
    cost: { resource: 40 }, cooldownMs: 25000, castTimeMs: 400, canMoveWhileCasting: false, targeting: 'self',
    delivery: { kind: 'area', radius: 160, rangePx: 0, delayMs: 0, durationMs: 8000, tickMs: 250 }, scaling: {},
    effects: [{ kind: 'modifier', mod: { stat: 'damageDealt', op: 'increased', value: 0.15 } }, { kind: 'modifier', mod: { stat: 'armor', op: 'flat', value: 20 } }],
    tags: ['buff', 'aura'], ranks: ranks(null), vfx: { color: '#9b2c2c', shape: 'ring' },
  },
  // ───────── Ranger tree abilities ─────────
  {
    id: 'spell:volley', name: 'Volley', abilityKind: 'power', discipline: 'archery', phase: 1,
    description: 'Loose three arrows in a fan, each dealing 80% weapon damage.',
    cost: { stamina: 22 }, cooldownMs: 6000, castTimeMs: 200, canMoveWhileCasting: false, targeting: 'direction',
    delivery: { kind: 'projectile', projectile: { speed: 680, rangePx: 520, radius: 4, pierce: 0, count: 3, spreadDeg: 30, color: '#e8d9b5' } },
    weaponDamagePct: 0.8, scaling: {}, poiseDamage: 6, effects: [],
    tags: ['projectile'], ranks: ranks(null), vfx: { color: '#e8d9b5', shape: 'bolt' },
  },
  {
    id: 'spell:caltrops', name: 'Caltrops', abilityKind: 'power', discipline: 'archery', phase: 1,
    description: 'Scatter iron caltrops. Enemies in the area are slowed and bleed.',
    cost: { stamina: 18 }, cooldownMs: 12000, castTimeMs: 200, canMoveWhileCasting: true, targeting: 'point',
    delivery: { kind: 'area', radius: 70, rangePx: 260, delayMs: 150, durationMs: 6000, tickMs: 500 },
    damage: [{ type: 'pierce', min: 2, max: 3 }], scaling: { finesse: 'C' }, buildup: { bleed: 12 },
    effects: [{ kind: 'applyStatus', trigger: 'onHit', status: 'slow', target: 'target', durationMs: 700, magnitude: 0.4 }],
    tags: ['area', 'trap'], ranks: ranks(null), vfx: { color: '#8d9196', shape: 'burst' },
  },
  {
    id: 'spell:piercing-shot', name: 'Piercing Shot', abilityKind: 'power', discipline: 'archery', phase: 1,
    description: 'A full-strength shot that passes through up to 3 enemies for 160% weapon damage.',
    cost: { stamina: 25 }, cooldownMs: 9000, castTimeMs: 450, canMoveWhileCasting: false, targeting: 'direction',
    delivery: { kind: 'projectile', projectile: { speed: 950, rangePx: 720, radius: 5, pierce: 3, color: '#f2e6cf' } },
    weaponDamagePct: 1.6, scaling: {}, poiseDamage: 18, effects: [],
    tags: ['projectile'], ranks: ranks(null), vfx: { color: '#f2e6cf', shape: 'beam' },
  },
  // ───────── Arcanist tree abilities ─────────
  {
    id: 'spell:ember-burst', name: 'Ember Burst', abilityKind: 'spell', school: 'ash', phase: 1,
    description: 'Fire erupts around you, scorching and staggering nearby foes.',
    cost: { mana: 22 }, cooldownMs: 6000, castTimeMs: 200, canMoveWhileCasting: false, targeting: 'self',
    delivery: { kind: 'area', radius: 96, rangePx: 0, delayMs: 0 },
    damage: [{ type: 'fire', min: 16, max: 22 }], scaling: { intellect: 'A' }, buildup: { burn: 40 }, poiseDamage: 25, effects: [],
    tags: ['area'], ranks: ranks('item:essence-ash'), vfx: { color: '#ff8a3d', shape: 'ring' },
  },
  {
    id: 'spell:flame-ward', name: 'Flame Ward', abilityKind: 'spell', school: 'ash', phase: 1,
    description: 'Wrap yourself in ember: a ward absorbing 20% of max HP for 8 s. Attackers who strike it build Burn.',
    cost: { mana: 20 }, cooldownMs: 15000, castTimeMs: 200, canMoveWhileCasting: true, targeting: 'self',
    delivery: { kind: 'self' }, scaling: {},
    effects: [
      { kind: 'applyStatus', trigger: 'onCast', status: 'ward', target: 'self', durationMs: 8000, magnitude: 0.2 },
      { kind: 'hook', hook: 'wardBurn', params: { buildup: 25 } },
    ],
    tags: ['buff'], ranks: ranks('item:essence-ash'), vfx: { color: '#ffb347', shape: 'ring' },
  },
  {
    id: 'spell:conflagrate', name: 'Conflagrate', abilityKind: 'spell', school: 'ash', phase: 1,
    description: 'Call down a column of fire at a point. Massive damage and Burn after a short delay.',
    cost: { mana: 30 }, cooldownMs: 10000, castTimeMs: 600, canMoveWhileCasting: false, targeting: 'point',
    delivery: { kind: 'area', radius: 80, rangePx: 380, delayMs: 600 },
    damage: [{ type: 'fire', min: 34, max: 44 }], scaling: { intellect: 'A' }, buildup: { burn: 60 }, poiseDamage: 35, effects: [],
    tags: ['area'], ranks: ranks('item:essence-ash'), vfx: { color: '#ff6a2a', shape: 'burst' },
  },
];

export default spells;
