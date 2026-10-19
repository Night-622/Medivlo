/**
 * Phase 1 enemies (SYSTEMS.md §8.4). Base values are level-1; scaled by P(L) (HP) and D(L) (damage).
 * Owner: Claude 3. Ids agreed with Claude 2 (spawns) and Claude 4 (lore).
 */
import type { EnemyAttackDef, EnemyDef } from '@/core';

type A = Omit<EnemyAttackDef, 'activeMs' | 'poiseDamage' | 'weight' | 'telegraph'> &
  Partial<Pick<EnemyAttackDef, 'activeMs' | 'poiseDamage' | 'weight' | 'telegraph'>>;
const atk = (a: A): EnemyAttackDef => ({ activeMs: 120, poiseDamage: 15, weight: 1, telegraph: 'flash', ...a });

const enemies: EnemyDef[] = [
  {
    id: 'enemy:gloamwood-wolf', name: 'Gloamwood Wolf', description: 'Lean grey hunters of the Gloamwood. They circle before they bite.',
    family: 'beast', archetype: 'skirmisher', rank: 'normal', phase: 1,
    base: { hp: 38, damage: 9, armor: 2, poise: 18, moveSpeed: 175 }, resist: {}, statusResist: {}, immune: [],
    attacks: [
      atk({ id: 'lunge', name: 'Lunge', kind: 'charge', damageMult: 1, damageTypes: { slash: 1 }, windupMs: 340, activeMs: 220, recoveryMs: 450, cooldownMs: 1600, rangePx: 90, arcDeg: 60, buildup: { poison: 10 }, weight: 3, telegraph: 'line' }),
      atk({ id: 'bite', name: 'Bite', kind: 'melee', damageMult: 0.7, damageTypes: { slash: 1 }, windupMs: 260, recoveryMs: 320, cooldownMs: 900, rangePx: 40, arcDeg: 70, weight: 2 }),
    ],
    ai: { perceptionPx: 260, fovDeg: 160, hearingPx: 320, aggression: 0.7, preferredRangePx: [34, 70], behaviors: ['packHunt', 'flank', 'strafe', 'fleeAtLowHp'], fleeBelowHp: 0.2, callForHelpPx: 300, dodgeChance: 0.15 },
    loot: 'loot:gloamwood-wolf', radius: 12, appearance: { shape: 'triangle', color: '#7d7f86', scale: 1 }, canBeElite: true, allowedTiers: [1, 2],
  },
  {
    id: 'enemy:hollowed-wolf', name: 'Hollowed Wolf', description: 'A wolf the Mire has hollowed out. Black tears; no fear.',
    family: 'beast', variant: 'hollowed', archetype: 'skirmisher', rank: 'normal', phase: 1,
    base: { hp: 44, damage: 10, armor: 2, poise: 20, moveSpeed: 180 },
    resist: { fire: -0.25, radiant: -0.25, shadow: 0.25 }, statusResist: {}, immune: ['poison'],
    attacks: [
      atk({ id: 'lunge', name: 'Lunge', kind: 'charge', damageMult: 1, damageTypes: { slash: 0.6, shadow: 0.4 }, windupMs: 340, activeMs: 220, recoveryMs: 450, cooldownMs: 1500, rangePx: 90, arcDeg: 60, weight: 3, telegraph: 'line' }),
      atk({ id: 'bite', name: 'Bite', kind: 'melee', damageMult: 0.7, damageTypes: { slash: 1 }, windupMs: 260, recoveryMs: 320, cooldownMs: 900, rangePx: 40, arcDeg: 70, weight: 2 }),
    ],
    ai: { perceptionPx: 300, fovDeg: 200, hearingPx: 320, aggression: 0.9, preferredRangePx: [30, 60], behaviors: ['packHunt', 'flank', 'strafe'] },
    loot: 'loot:mireling', radius: 12, appearance: { shape: 'triangle', color: '#c9c7c0', scale: 1 }, canBeElite: false,
  },
  {
    id: 'enemy:hollowed-thrall', name: 'Hollowed Thrall', description: 'Someone’s neighbour, once. Pale skin, black tears, a slow and terrible grip.',
    family: 'folk', variant: 'hollowed', archetype: 'brute', rank: 'normal', phase: 1,
    base: { hp: 70, damage: 13, armor: 4, poise: 40, moveSpeed: 85 },
    resist: { fire: -0.25, radiant: -0.25, shadow: 0.25 }, statusResist: {}, immune: ['poison'],
    attacks: [
      atk({ id: 'claw', name: 'Clawing Swing', kind: 'melee', damageMult: 1, damageTypes: { blunt: 0.6, shadow: 0.4 }, windupMs: 500, activeMs: 150, recoveryMs: 600, cooldownMs: 1800, rangePx: 52, arcDeg: 90, poiseDamage: 25, weight: 3 }),
      atk({ id: 'flail', name: 'Flailing Lunge', kind: 'melee', damageMult: 1.5, damageTypes: { blunt: 1 }, windupMs: 700, activeMs: 180, recoveryMs: 800, cooldownMs: 4500, rangePx: 58, arcDeg: 120, poiseDamage: 40, weight: 1, telegraph: 'cone' }),
    ],
    ai: { perceptionPx: 220, fovDeg: 120, hearingPx: 260, aggression: 0.5, preferredRangePx: [20, 48], behaviors: ['approach'] },
    loot: 'loot:hollowed-thrall', radius: 13, appearance: { shape: 'square', color: '#bdbab0', scale: 1.05 }, canBeElite: true,
  },
  {
    id: 'enemy:mireling', name: 'Mireling', description: 'A hopping knot of Mire. Cut it, and it becomes two.',
    family: 'unwrought', archetype: 'swarm', rank: 'minion', phase: 1,
    base: { hp: 30, damage: 8, armor: 0, poise: 8, moveSpeed: 125 },
    resist: { fire: -0.3, radiant: -0.2, shadow: 0.5 }, statusResist: {}, immune: ['poison', 'bleed'],
    attacks: [
      atk({ id: 'hop', name: 'Hop', kind: 'charge', damageMult: 1, damageTypes: { shadow: 1 }, windupMs: 320, activeMs: 200, recoveryMs: 380, cooldownMs: 1100, rangePx: 80, arcDeg: 50, weight: 1, telegraph: 'line' }),
    ],
    ai: { perceptionPx: 240, fovDeg: 360, hearingPx: 260, aggression: 0.8, preferredRangePx: [20, 70], behaviors: ['approach', 'splitOnDeath'] },
    loot: 'loot:mireling', radius: 10, appearance: { shape: 'circle', color: '#26332a', scale: 1 }, canBeElite: true, tags: ['split:enemy:mireling-small:2'],
  },
  {
    id: 'enemy:mireling-small', name: 'Mireling Spawn', description: 'What is left of a Mireling. Still hungry.',
    family: 'unwrought', archetype: 'swarm', rank: 'minion', phase: 1, xpMult: 0.3,
    base: { hp: 20, damage: 6, armor: 0, poise: 4, moveSpeed: 145 },
    resist: { fire: -0.3, radiant: -0.2, shadow: 0.5 }, statusResist: {}, immune: ['poison', 'bleed'],
    attacks: [
      atk({ id: 'hop', name: 'Hop', kind: 'charge', damageMult: 1, damageTypes: { shadow: 1 }, windupMs: 300, activeMs: 180, recoveryMs: 350, cooldownMs: 1000, rangePx: 64, arcDeg: 50, weight: 1, telegraph: 'line' }),
    ],
    ai: { perceptionPx: 240, fovDeg: 360, hearingPx: 260, aggression: 0.9, preferredRangePx: [16, 60], behaviors: ['approach'] },
    loot: 'loot:none', radius: 7, appearance: { shape: 'circle', color: '#33443a', scale: 0.7 }, canBeElite: false,
  },
  {
    id: 'enemy:ashfoot-cutthroat', name: 'Ashfoot Cutthroat', description: 'One of the Ashfoot Reavers: quick knife, quicker feet.',
    family: 'folk', archetype: 'skirmisher', rank: 'normal', phase: 1,
    base: { hp: 55, damage: 10, armor: 6, poise: 25, moveSpeed: 150 }, resist: {}, statusResist: {}, immune: [],
    attacks: [
      atk({ id: 'slash', name: 'Slash', kind: 'melee', damageMult: 1, damageTypes: { slash: 1 }, windupMs: 300, recoveryMs: 350, cooldownMs: 900, rangePx: 46, arcDeg: 90, buildup: { bleed: 20 }, weight: 3 }),
      atk({ id: 'stab', name: 'Lunging Stab', kind: 'charge', damageMult: 1.4, damageTypes: { pierce: 1 }, windupMs: 450, activeMs: 200, recoveryMs: 550, cooldownMs: 3500, rangePx: 100, arcDeg: 40, poiseDamage: 25, weight: 1, telegraph: 'line' }),
    ],
    ai: { perceptionPx: 260, fovDeg: 140, hearingPx: 300, aggression: 0.6, preferredRangePx: [36, 70], behaviors: ['strafe', 'dodgeTelegraphs', 'retreatAfterAttack'], dodgeChance: 0.25, callForHelpPx: 280 },
    loot: 'loot:ashfoot-bandit', radius: 11, appearance: { shape: 'diamond', color: '#a0522d', scale: 1 }, canBeElite: true,
  },
  {
    id: 'enemy:ashfoot-archer', name: 'Ashfoot Archer', description: 'An Ashfoot Reaver with a hunting bow and no scruples.',
    family: 'folk', archetype: 'archer', rank: 'normal', phase: 1,
    base: { hp: 40, damage: 9, armor: 3, poise: 15, moveSpeed: 135 }, resist: {}, statusResist: {}, immune: [],
    attacks: [
      atk({ id: 'shot', name: 'Shot', kind: 'projectile', damageMult: 1, damageTypes: { pierce: 1 }, windupMs: 650, activeMs: 50, recoveryMs: 450, cooldownMs: 1800, rangePx: 380, weight: 3, telegraph: 'line',
        projectile: { speed: 430, rangePx: 420, radius: 4, pierce: 0, color: '#e8d9b5' } }),
      atk({ id: 'volley', name: 'Volley', kind: 'projectile', damageMult: 0.8, damageTypes: { pierce: 1 }, windupMs: 850, activeMs: 50, recoveryMs: 600, cooldownMs: 6000, rangePx: 340, weight: 1, telegraph: 'cone',
        projectile: { speed: 400, rangePx: 380, radius: 4, pierce: 0, count: 3, spreadDeg: 30, color: '#e8d9b5' } }),
    ],
    ai: { perceptionPx: 340, fovDeg: 140, hearingPx: 300, aggression: 0.5, preferredRangePx: [190, 260], behaviors: ['kite'], callForHelpPx: 280 },
    loot: 'loot:ashfoot-bandit', radius: 11, appearance: { shape: 'diamond', color: '#8b6b3d', scale: 0.95 }, canBeElite: true,
  },
  {
    id: 'enemy:drowned-dead', name: 'Drowned Dead', description: 'The abbey’s drowned, risen with their shields and their grief. The river would not take them.',
    family: 'restless', archetype: 'shieldbearer', rank: 'normal', phase: 1,
    base: { hp: 75, damage: 12, armor: 10, poise: 45, moveSpeed: 80 },
    resist: { pierce: 0.5, blunt: -0.3, radiant: -0.25, frost: 0.25 }, statusResist: {}, immune: ['bleed', 'poison'],
    attacks: [
      atk({ id: 'shove', name: 'Shield Shove', kind: 'melee', damageMult: 0.7, damageTypes: { blunt: 1 }, windupMs: 420, recoveryMs: 500, cooldownMs: 2200, rangePx: 44, arcDeg: 80, poiseDamage: 35, weight: 1 }),
      atk({ id: 'hook', name: 'Hooked Slash', kind: 'melee', damageMult: 1.1, damageTypes: { slash: 1 }, windupMs: 480, recoveryMs: 600, cooldownMs: 1600, rangePx: 52, arcDeg: 100, weight: 2 }),
    ],
    ai: { perceptionPx: 220, fovDeg: 130, hearingPx: 240, aggression: 0.5, preferredRangePx: [24, 50], behaviors: ['approach', 'shieldFront'] },
    loot: 'loot:drowned-dead', radius: 13, appearance: { shape: 'square', color: '#5f7f86', scale: 1.05 }, canBeElite: true,
  },
  {
    id: 'enemy:wick-soldier', name: 'Wick Soldier', description: 'A soldier of the Order of the Wick: shield, mace and certainty.',
    family: 'folk', archetype: 'shieldbearer', rank: 'normal', phase: 1,
    base: { hp: 80, damage: 12, armor: 14, poise: 45, moveSpeed: 115 }, resist: { radiant: 0.2 }, statusResist: {}, immune: [],
    attacks: [
      atk({ id: 'mace', name: 'Mace Blow', kind: 'melee', damageMult: 1, damageTypes: { blunt: 1 }, windupMs: 420, recoveryMs: 500, cooldownMs: 1300, rangePx: 48, arcDeg: 90, poiseDamage: 25, weight: 3 }),
      atk({ id: 'bash', name: 'Shield Bash', kind: 'charge', damageMult: 0.8, damageTypes: { blunt: 1 }, windupMs: 550, activeMs: 200, recoveryMs: 600, cooldownMs: 5000, rangePx: 90, arcDeg: 60, poiseDamage: 50, weight: 1, telegraph: 'line' }),
    ],
    ai: { perceptionPx: 280, fovDeg: 140, hearingPx: 300, aggression: 0.6, preferredRangePx: [28, 56], behaviors: ['approach', 'shieldFront', 'strafe'], callForHelpPx: 320 },
    loot: 'loot:wick-soldier', radius: 12, appearance: { shape: 'square', color: '#c9a646', scale: 1 }, canBeElite: true,
  },
  // ───────── bosses ─────────
  {
    id: 'enemy:hollowed-white-stag', name: 'The Hollowed White Stag', description: 'Kethra’s white stag, taken by the Mire. Something holy still flickers under the rot.',
    family: 'beast', variant: 'hollowed', archetype: 'charger', rank: 'boss', phase: 1, xpMult: 0.6,
    base: { hp: 450, damage: 14, armor: 8, poise: 110, moveSpeed: 170 },
    resist: { fire: -0.15, radiant: -0.2, shadow: 0.3 }, statusResist: { bleed: 0.5, frozen: 0.5 }, immune: ['poison'],
    attacks: [
      atk({ id: 'charge', name: 'Antler Charge', kind: 'charge', damageMult: 1.6, damageTypes: { pierce: 1 }, windupMs: 600, activeMs: 650, recoveryMs: 900, cooldownMs: 5000, rangePx: 320, arcDeg: 50, poiseDamage: 60, weight: 3, telegraph: 'line' }),
      atk({ id: 'stomp', name: 'Stomp', kind: 'area', damageMult: 1.2, damageTypes: { blunt: 1 }, windupMs: 700, activeMs: 100, recoveryMs: 700, cooldownMs: 6000, rangePx: 90, radius: 96, poiseDamage: 45, weight: 2, telegraph: 'ring' }),
      atk({ id: 'swipe', name: 'Antler Swipe', kind: 'melee', damageMult: 1, damageTypes: { slash: 1 }, windupMs: 420, recoveryMs: 500, cooldownMs: 1600, rangePx: 72, arcDeg: 120, poiseDamage: 25, weight: 3 }),
    ],
    ai: { perceptionPx: 400, fovDeg: 360, hearingPx: 400, aggression: 1, preferredRangePx: [60, 180], behaviors: ['approach', 'strafe'] },
    phases: [{ atHpPct: 0.5, modifiers: [{ stat: 'attackSpeed', op: 'increased', value: 0.15 }], summon: { enemy: 'enemy:hollowed-wolf', count: 2 }, message: 'The Stag calls the hollowed pack!' }],
    cleansable: { atHpPct: 0.15, flag: 'prologue.stag_fate', value: 'cleansed' },
    loot: 'loot:hollowed-white-stag', radius: 22, appearance: { shape: 'triangle', color: '#efe9da', scale: 2 }, canBeElite: false,
    codexEntry: 'lore:the-white-stag',
  },
  {
    id: 'enemy:abbess-morwen', name: 'Abbess Morwen, the Drowned', description: 'She prayed to the river for her sisters. Something in the Mire answered.',
    family: 'folk', archetype: 'boss', rank: 'boss', phase: 1,
    base: { hp: 900, damage: 15, armor: 6, poise: 150, moveSpeed: 95 },
    resist: { shadow: 0.5, fire: -0.1, radiant: -0.2 }, statusResist: { frozen: 0.5, bleed: 0.3 }, immune: [],
    attacks: [
      atk({ id: 'mire-bolt', name: 'Mire Bolt', kind: 'projectile', damageMult: 1, damageTypes: { shadow: 1 }, windupMs: 520, activeMs: 50, recoveryMs: 400, cooldownMs: 1400, rangePx: 420, weight: 3, telegraph: 'line',
        projectile: { speed: 300, rangePx: 460, radius: 8, pierce: 0, color: '#4a6b5a', homingDegPerSec: 40 } }),
      atk({ id: 'mire-burst', name: 'Mire Burst', kind: 'area', damageMult: 1.4, damageTypes: { shadow: 1 }, windupMs: 850, activeMs: 100, recoveryMs: 600, cooldownMs: 7000, rangePx: 110, radius: 110, poiseDamage: 40, weight: 2, telegraph: 'ring' }),
      atk({ id: 'drowned-hymn', name: 'Drowned Hymn', kind: 'area', damageMult: 2.6, damageTypes: { shadow: 1 }, windupMs: 2600, activeMs: 150, recoveryMs: 900, cooldownMs: 14000, rangePx: 999, radius: 260, poiseDamage: 60, weight: 4, telegraph: 'ring', unblockable: true, minPhase: 2 }),
    ],
    ai: { perceptionPx: 480, fovDeg: 360, hearingPx: 480, aggression: 1, preferredRangePx: [150, 260], behaviors: ['kite'] },
    phases: [
      { atHpPct: 0.66, modifiers: [{ stat: 'moveSpeed', op: 'increased', value: 0.15 }], summon: { enemy: 'enemy:drowned-dead', count: 2 }, message: 'The drowned sisters rise!' },
      { atHpPct: 0.33, modifiers: [{ stat: 'attackSpeed', op: 'increased', value: 0.2 }], summon: { enemy: 'enemy:mireling', count: 4 }, message: 'Morwen begins the Drowned Hymn: stagger her to break it!' },
    ],
    loot: 'loot:abbess-morwen', radius: 16, appearance: { shape: 'diamond', color: '#2f4a44', scale: 1.8 }, canBeElite: false,
    codexEntry: 'lore:abbess-morwen',
  },
];

export default enemies;
