/**
 * Act III enemies (docs/lore/14-act3-spec.md). Danger tier 5 (levels ~30–40); base values are level-1.
 * Ysolde yields instead of dying (tag `autoYield` + cleansable): at 10% HP she is defeated, sets
 * `act3.ysolde_defeated = 'yielded'`, and Claude 4's dialogue decides `act3.ysolde_fate` (spared / slain).
 * Owner: Claude 3.
 */
import type { EnemyAttackDef, EnemyDef } from '@/core';

type A = Omit<EnemyAttackDef, 'activeMs' | 'poiseDamage' | 'weight' | 'telegraph'> &
  Partial<Pick<EnemyAttackDef, 'activeMs' | 'poiseDamage' | 'weight' | 'telegraph'>>;
const atk = (a: A): EnemyAttackDef => ({ activeMs: 120, poiseDamage: 15, weight: 1, telegraph: 'flash', ...a });

const enemies: EnemyDef[] = [
  {
    id: 'enemy:drowned-thing', name: 'Drowned Thing', description: 'A shape the Mire dreamed and forgot to finish: too many arms, a mouth where a face should be, and water that never stops running off it.',
    family: 'unwrought', archetype: 'charger', rank: 'normal', phase: 3,
    base: { hp: 140, damage: 17, armor: 10, poise: 90, moveSpeed: 125 },
    resist: { shadow: 0.6, frost: 0.3, fire: -0.25, radiant: -0.3 }, statusResist: { frozen: 0.5 }, immune: ['poison', 'bleed'],
    attacks: [
      atk({ id: 'grasp', name: 'Grasping Arms', kind: 'melee', damageMult: 1.1, damageTypes: { shadow: 0.6, blunt: 0.4 }, windupMs: 500, recoveryMs: 600, cooldownMs: 1600, rangePx: 78, arcDeg: 140, poiseDamage: 35, weight: 3, telegraph: 'cone' }),
      atk({ id: 'undertow', name: 'Undertow Rush', kind: 'charge', damageMult: 1.5, damageTypes: { shadow: 1 }, windupMs: 650, activeMs: 380, recoveryMs: 900, cooldownMs: 5000, rangePx: 240, arcDeg: 45, poiseDamage: 55, weight: 2, telegraph: 'line' }),
      atk({ id: 'black-water', name: 'Black Water', kind: 'area', damageMult: 1.2, damageTypes: { shadow: 1 }, windupMs: 900, activeMs: 120, recoveryMs: 600, cooldownMs: 7000, rangePx: 260, radius: 90, poiseDamage: 30, weight: 1, telegraph: 'ring' }),
    ],
    ai: { perceptionPx: 320, fovDeg: 360, hearingPx: 340, aggression: 0.8, preferredRangePx: [40, 90], behaviors: ['approach', 'strafe'], callForHelpPx: 320 },
    loot: 'loot:drowned-thing', radius: 18, appearance: { shape: 'circle', color: '#153844', scale: 1.6 }, canBeElite: true, allowedTiers: [4, 5],
    tags: ['split:enemy:mireling:2'], codexEntry: 'lore:drowned-things',
  },
  {
    id: 'enemy:ysolde-pale-saint', name: 'Ysolde, the Pale Saint', description: 'Ysolde Maerin, who heard the Drowned Voice and believed it was mercy. Half-light, half-Mire, wholly certain.',
    family: 'folk', variant: 'hollowed', archetype: 'boss', rank: 'boss', phase: 3,
    base: { hp: 1900, damage: 20, armor: 14, poise: 220, moveSpeed: 120 },
    resist: { shadow: 0.5, radiant: 0.3, fire: -0.1 }, statusResist: { frozen: 0.6, bleed: 0.4, burn: 0.4 }, immune: ['poison'],
    attacks: [
      atk({ id: 'pale-light', name: 'Pale Light', kind: 'projectile', damageMult: 1, damageTypes: { radiant: 0.5, shadow: 0.5 }, windupMs: 500, activeMs: 50, recoveryMs: 400, cooldownMs: 1400, rangePx: 440, weight: 3, telegraph: 'line',
        projectile: { speed: 380, rangePx: 480, radius: 8, pierce: 0, color: '#e8e4f0', homingDegPerSec: 50 } }),
      atk({ id: 'drowned-halo', name: 'Drowned Halo', kind: 'area', damageMult: 1.4, damageTypes: { shadow: 1 }, windupMs: 850, activeMs: 120, recoveryMs: 600, cooldownMs: 6000, rangePx: 120, radius: 120, poiseDamage: 45, weight: 2, telegraph: 'ring' }),
      atk({ id: 'saints-step', name: 'Saint’s Step', kind: 'charge', damageMult: 1.3, damageTypes: { radiant: 1 }, windupMs: 550, activeMs: 280, recoveryMs: 700, cooldownMs: 5000, rangePx: 260, arcDeg: 40, poiseDamage: 40, weight: 2, telegraph: 'line' }),
      atk({ id: 'hymn-of-the-deep', name: 'Hymn of the Deep', kind: 'spell', damageMult: 0, damageTypes: { shadow: 1 }, windupMs: 1400, activeMs: 100, recoveryMs: 800, cooldownMs: 18000, rangePx: 999, poiseDamage: 0, weight: 2, telegraph: 'ring', minPhase: 2 }),
      atk({ id: 'drowning-mercy', name: 'Drowning Mercy', kind: 'area', damageMult: 2.6, damageTypes: { shadow: 1 }, windupMs: 2400, activeMs: 150, recoveryMs: 1000, cooldownMs: 15000, rangePx: 999, radius: 280, poiseDamage: 70, weight: 4, telegraph: 'ring', unblockable: true, minPhase: 3 }),
    ],
    ai: { perceptionPx: 520, fovDeg: 360, hearingPx: 520, aggression: 1, preferredRangePx: [120, 260], behaviors: ['kite', 'strafe'] },
    phases: [
      { atHpPct: 0.7, modifiers: [{ stat: 'attackSpeed', op: 'increased', value: 0.15 }], summon: { enemy: 'enemy:drowned-thing', count: 1 }, message: '“You could have rested. All of you.”' },
      { atHpPct: 0.4, modifiers: [{ stat: 'damageDealt', op: 'increased', value: 0.2 }], summon: { enemy: 'enemy:mireling', count: 4 }, message: 'Ysolde sings the Drowning Mercy: stagger her!' },
    ],
    cleansable: { atHpPct: 0.1, flag: 'act3.ysolde_defeated', value: 'yielded' },
    loot: 'loot:ysolde', radius: 16, appearance: { shape: 'diamond', color: '#e8e4f0', scale: 1.8 }, canBeElite: false,
    tags: ['autoYield', 'summon:enemy:drowned-thing:1'], codexEntry: 'lore:ysolde-maerin',
  },
  {
    id: 'enemy:nhal-risen', name: 'Nhal Risen', description: 'The Drowned Eighth Spark, risen in the Heart of Orr. The Mire wears a god’s shape, and the shape is hungry.',
    family: 'unwrought', archetype: 'boss', rank: 'boss', phase: 3,
    base: { hp: 2600, damage: 24, armor: 20, poise: 300, moveSpeed: 105 },
    resist: { shadow: 0.7, frost: 0.3, fire: -0.15, radiant: -0.2 }, statusResist: { frozen: 1, bleed: 0.6, burn: 0.3, shock: 0.3 }, immune: ['poison'],
    attacks: [
      atk({ id: 'drowning-fist', name: 'Drowning Fist', kind: 'melee', damageMult: 1.2, damageTypes: { shadow: 0.6, blunt: 0.4 }, windupMs: 560, recoveryMs: 600, cooldownMs: 1500, rangePx: 96, arcDeg: 130, poiseDamage: 50, weight: 3, telegraph: 'cone' }),
      atk({ id: 'tide-of-souls', name: 'Tide of Souls', kind: 'projectile', damageMult: 0.9, damageTypes: { shadow: 1 }, windupMs: 700, activeMs: 50, recoveryMs: 500, cooldownMs: 4500, rangePx: 460, weight: 2, telegraph: 'cone',
        projectile: { speed: 340, rangePx: 500, radius: 9, pierce: 1, count: 5, spreadDeg: 60, color: '#3a1c5c' } }),
      atk({ id: 'mire-rift', name: 'Mire Rift', kind: 'area', damageMult: 1.6, damageTypes: { shadow: 1 }, windupMs: 950, activeMs: 120, recoveryMs: 700, cooldownMs: 6500, rangePx: 360, radius: 110, poiseDamage: 50, weight: 2, telegraph: 'ring' }),
      atk({ id: 'spawn-of-nhal', name: 'Spawn of Nhal', kind: 'spell', damageMult: 0, damageTypes: { shadow: 1 }, windupMs: 1300, activeMs: 100, recoveryMs: 800, cooldownMs: 20000, rangePx: 999, poiseDamage: 0, weight: 2, telegraph: 'ring', minPhase: 2 }),
      atk({ id: 'unmaking', name: 'The Unmaking', kind: 'area', damageMult: 3, damageTypes: { shadow: 1 }, windupMs: 2600, activeMs: 150, recoveryMs: 1100, cooldownMs: 15000, rangePx: 999, radius: 300, poiseDamage: 90, weight: 4, telegraph: 'ring', unblockable: true, minPhase: 3 }),
    ],
    ai: { perceptionPx: 600, fovDeg: 360, hearingPx: 600, aggression: 1, preferredRangePx: [70, 200], behaviors: ['approach', 'strafe'] },
    phases: [
      { atHpPct: 0.7, modifiers: [{ stat: 'attackSpeed', op: 'increased', value: 0.15 }], summon: { enemy: 'enemy:drowned-thing', count: 2 }, message: 'The Heart of Orr groans: Nhal calls its spawn!' },
      { atHpPct: 0.4, modifiers: [{ stat: 'damageDealt', op: 'increased', value: 0.2 }, { stat: 'moveSpeed', op: 'increased', value: 0.15 }], summon: { enemy: 'enemy:mirebeast', count: 1 }, message: '“I was the eighth. I will be the only.”' },
      { atHpPct: 0.15, modifiers: [{ stat: 'attackSpeed', op: 'increased', value: 0.2 }], message: 'Nhal begins the Unmaking: break it, or be unmade!' },
    ],
    loot: 'loot:nhal-risen', radius: 28, appearance: { shape: 'circle', color: '#1a0f2b', scale: 2.8 }, canBeElite: false,
    tags: ['summon:enemy:mireling:4'], codexEntry: 'lore:nhal-risen',
  },
];

export default enemies;
