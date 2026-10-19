/**
 * Act II enemies (docs/lore/11-act2-spec.md). Danger tiers 3–4 (levels ~16–28); base values are level-1.
 * Owner: Claude 3.
 */
import type { EnemyAttackDef, EnemyDef } from '@/core';

type A = Omit<EnemyAttackDef, 'activeMs' | 'poiseDamage' | 'weight' | 'telegraph'> &
  Partial<Pick<EnemyAttackDef, 'activeMs' | 'poiseDamage' | 'weight' | 'telegraph'>>;
const atk = (a: A): EnemyAttackDef => ({ activeMs: 120, poiseDamage: 15, weight: 1, telegraph: 'flash', ...a });

const enemies: EnemyDef[] = [
  {
    id: 'enemy:wrought-sentinel', name: 'Wrought Sentinel', description: 'An Orrin iron guardian, still keeping the Vault of Nine Nails for masters dead a thousand years.',
    family: 'wrought', archetype: 'shieldbearer', rank: 'normal', phase: 2,
    base: { hp: 120, damage: 15, armor: 30, poise: 90, moveSpeed: 85 },
    resist: { slash: 0.35, pierce: 0.45, blunt: -0.2, lightning: -0.35, fire: 0.2, poison: 0.5 }, statusResist: { frozen: 0.5 }, immune: ['bleed', 'poison'],
    attacks: [
      atk({ id: 'iron-fist', name: 'Iron Fist', kind: 'melee', damageMult: 1.2, damageTypes: { blunt: 1 }, windupMs: 600, recoveryMs: 700, cooldownMs: 1800, rangePx: 62, arcDeg: 100, poiseDamage: 45, weight: 3, telegraph: 'cone' }),
      atk({ id: 'rune-pulse', name: 'Rune Pulse', kind: 'area', damageMult: 1.1, damageTypes: { lightning: 0.5, blunt: 0.5 }, windupMs: 900, activeMs: 120, recoveryMs: 700, cooldownMs: 7000, rangePx: 90, radius: 96, buildup: { shock: 30 }, poiseDamage: 35, weight: 1, telegraph: 'ring' }),
    ],
    ai: { perceptionPx: 260, fovDeg: 120, hearingPx: 260, aggression: 0.55, preferredRangePx: [30, 62], behaviors: ['approach', 'shieldFront'] },
    loot: 'loot:wrought-sentinel', radius: 17, appearance: { shape: 'square', color: '#566170', scale: 1.4 }, canBeElite: true, allowedTiers: [3, 4], codexEntry: 'lore:wrought-sentinels',
  },
  {
    id: 'enemy:rime-wolf', name: 'Rime Wolf', description: 'A white wolf of Frostreach. Its breath freezes on your skin before its teeth do.',
    family: 'beast', archetype: 'skirmisher', rank: 'normal', phase: 2,
    base: { hp: 52, damage: 12, armor: 4, poise: 22, moveSpeed: 190 },
    resist: { frost: 0.6, fire: -0.3 }, statusResist: { frozen: 1 }, immune: [],
    attacks: [
      atk({ id: 'lunge', name: 'Frost Lunge', kind: 'charge', damageMult: 1, damageTypes: { slash: 0.6, frost: 0.4 }, windupMs: 330, activeMs: 220, recoveryMs: 420, cooldownMs: 1500, rangePx: 100, arcDeg: 60, buildup: { frozen: 20 }, weight: 3, telegraph: 'line' }),
      atk({ id: 'breath', name: 'Rime Breath', kind: 'area', damageMult: 0.8, damageTypes: { frost: 1 }, windupMs: 600, activeMs: 100, recoveryMs: 500, cooldownMs: 6000, rangePx: 120, radius: 60, buildup: { frozen: 35 }, poiseDamage: 10, weight: 1, telegraph: 'ring' }),
    ],
    ai: { perceptionPx: 300, fovDeg: 180, hearingPx: 340, aggression: 0.75, preferredRangePx: [34, 80], behaviors: ['packHunt', 'flank', 'strafe'], callForHelpPx: 360, dodgeChance: 0.15 },
    loot: 'loot:rime-wolf', radius: 12, appearance: { shape: 'triangle', color: '#bdf0f7', scale: 1.05 }, canBeElite: true, allowedTiers: [3, 4], codexEntry: 'lore:rime-wolves',
  },
  {
    id: 'enemy:hrothi-champion', name: 'Sigrun’s Champion', description: 'A Wolf-Moot champion: bearded axe, painted shield, and a blood-oath to win or die.',
    family: 'folk', archetype: 'brute', rank: 'champion', phase: 2,
    base: { hp: 70, damage: 14, armor: 18, poise: 90, moveSpeed: 145 },
    resist: { frost: 0.3 }, statusResist: { bleed: 0.4 }, immune: [],
    attacks: [
      atk({ id: 'axe-flurry', name: 'Axe Flurry', kind: 'melee', damageMult: 1, damageTypes: { slash: 1 }, windupMs: 380, recoveryMs: 400, cooldownMs: 1100, rangePx: 58, arcDeg: 110, buildup: { bleed: 25 }, weight: 3 }),
      atk({ id: 'shield-rush', name: 'Shield Rush', kind: 'charge', damageMult: 1.3, damageTypes: { blunt: 1 }, windupMs: 520, activeMs: 300, recoveryMs: 700, cooldownMs: 5000, rangePx: 200, arcDeg: 40, poiseDamage: 55, weight: 1, telegraph: 'line' }),
      atk({ id: 'wolf-rage', name: 'Wolf-Rage Cleave', kind: 'melee', damageMult: 2, damageTypes: { slash: 1 }, windupMs: 900, activeMs: 160, recoveryMs: 900, cooldownMs: 8000, rangePx: 70, arcDeg: 170, poiseDamage: 70, weight: 2, telegraph: 'cone', unblockable: true }),
    ],
    ai: { perceptionPx: 400, fovDeg: 360, hearingPx: 400, aggression: 0.9, preferredRangePx: [30, 70], behaviors: ['approach', 'strafe', 'shieldFront', 'dodgeTelegraphs'], dodgeChance: 0.2 },
    loot: 'loot:act2-champion', radius: 14, appearance: { shape: 'diamond', color: '#8a5a33', scale: 1.3 }, canBeElite: false,
  },
  {
    id: 'enemy:salt-corsair-champion', name: 'Kestrel’s Champion', description: 'The Salt League’s best blade: cutlass, hook, and the manners of a knife-fight.',
    family: 'folk', archetype: 'skirmisher', rank: 'champion', phase: 2,
    base: { hp: 60, damage: 13, armor: 10, poise: 60, moveSpeed: 170 },
    resist: { frost: 0.1 }, statusResist: {}, immune: [],
    attacks: [
      atk({ id: 'cutlass', name: 'Cutlass Riposte', kind: 'melee', damageMult: 1, damageTypes: { slash: 1 }, windupMs: 300, recoveryMs: 350, cooldownMs: 900, rangePx: 52, arcDeg: 90, buildup: { bleed: 20 }, weight: 3 }),
      atk({ id: 'hook-lunge', name: 'Hook Lunge', kind: 'charge', damageMult: 1.4, damageTypes: { pierce: 1 }, windupMs: 450, activeMs: 220, recoveryMs: 500, cooldownMs: 3500, rangePx: 150, arcDeg: 40, poiseDamage: 30, weight: 2, telegraph: 'line' }),
      atk({ id: 'pistol', name: 'Salt-Pistol', kind: 'projectile', damageMult: 1.6, damageTypes: { pierce: 0.6, fire: 0.4 }, windupMs: 800, activeMs: 50, recoveryMs: 600, cooldownMs: 9000, rangePx: 360, weight: 1, telegraph: 'line',
        projectile: { speed: 700, rangePx: 380, radius: 4, pierce: 0, color: '#ffb04a' } }),
    ],
    ai: { perceptionPx: 400, fovDeg: 360, hearingPx: 400, aggression: 0.85, preferredRangePx: [40, 90], behaviors: ['strafe', 'dodgeTelegraphs', 'retreatAfterAttack'], dodgeChance: 0.35 },
    loot: 'loot:act2-champion', radius: 12, appearance: { shape: 'diamond', color: '#2f6f6a', scale: 1.2 }, canBeElite: false,
  },
  {
    id: 'enemy:hrothi-raider', name: 'Hrothi Raider', description: 'A northern raider: bearded axe, round shield and a wolf-pelt cloak, come south for plunder.',
    family: 'folk', archetype: 'skirmisher', rank: 'normal', phase: 2,
    base: { hp: 62, damage: 12, armor: 10, poise: 32, moveSpeed: 150 },
    resist: { frost: 0.3, fire: -0.1 }, statusResist: {}, immune: [],
    attacks: [
      atk({ id: 'axe-chop', name: 'Axe Chop', kind: 'melee', damageMult: 1, damageTypes: { slash: 1 }, windupMs: 340, recoveryMs: 380, cooldownMs: 1000, rangePx: 50, arcDeg: 100, buildup: { bleed: 20 }, weight: 3 }),
      atk({ id: 'shield-shove', name: 'Shield Shove', kind: 'charge', damageMult: 0.8, damageTypes: { blunt: 1 }, windupMs: 450, activeMs: 200, recoveryMs: 500, cooldownMs: 4000, rangePx: 110, arcDeg: 50, poiseDamage: 40, weight: 1, telegraph: 'line' }),
      atk({ id: 'throwing-axe', name: 'Throwing Axe', kind: 'projectile', damageMult: 1.1, damageTypes: { slash: 1 }, windupMs: 600, activeMs: 50, recoveryMs: 500, cooldownMs: 6000, rangePx: 300, weight: 1, telegraph: 'line',
        projectile: { speed: 480, rangePx: 320, radius: 5, pierce: 0, color: '#a09a8e' } }),
    ],
    ai: { perceptionPx: 300, fovDeg: 160, hearingPx: 320, aggression: 0.7, preferredRangePx: [36, 80], behaviors: ['strafe', 'flank', 'shieldFront', 'dodgeTelegraphs'], dodgeChance: 0.15, callForHelpPx: 340 },
    loot: 'loot:hrothi-raider', radius: 12, appearance: { shape: 'diamond', color: '#6d4c2f', scale: 1.05 }, canBeElite: true, allowedTiers: [2, 3, 4],
  },
  {
    id: 'enemy:cinderdrake-whelp', name: 'Cinderdrake Whelp', description: 'A feral young drake of the Cinder Wastes, all teeth and sparks.',
    family: 'cinderdrake', archetype: 'skirmisher', rank: 'minion', phase: 2,
    base: { hp: 40, damage: 10, armor: 8, poise: 20, moveSpeed: 170 },
    resist: { fire: 0.7, frost: -0.3 }, statusResist: {}, immune: ['burn'],
    attacks: [
      atk({ id: 'spark-bite', name: 'Spark Bite', kind: 'melee', damageMult: 1, damageTypes: { slash: 0.5, fire: 0.5 }, windupMs: 300, recoveryMs: 350, cooldownMs: 1000, rangePx: 44, arcDeg: 80, buildup: { burn: 20 }, weight: 1 }),
    ],
    ai: { perceptionPx: 300, fovDeg: 360, hearingPx: 300, aggression: 0.9, preferredRangePx: [20, 60], behaviors: ['approach', 'flank'] },
    loot: 'loot:none', radius: 10, appearance: { shape: 'triangle', color: '#e0661c', scale: 0.9 }, canBeElite: false,
  },
  {
    id: 'enemy:ashwyrm', name: 'The Ashwyrm of the Glass Throne', description: 'An elder Cinderdrake coiled around the Glass Throne. The Ashen Kings bred its line; nothing commands it now.',
    family: 'cinderdrake', archetype: 'boss', rank: 'boss', phase: 2,
    base: { hp: 1700, damage: 20, armor: 22, poise: 240, moveSpeed: 110 },
    resist: { fire: 0.7, frost: -0.3, lightning: 0.1 }, statusResist: { burn: 9, frozen: 0.5, bleed: 0.3 }, immune: ['burn'],
    attacks: [
      atk({ id: 'fire-breath', name: 'Fire Breath', kind: 'area', damageMult: 1.6, damageTypes: { fire: 1 }, windupMs: 1000, activeMs: 150, recoveryMs: 800, cooldownMs: 6000, rangePx: 260, radius: 110, buildup: { burn: 60 }, poiseDamage: 40, weight: 3, telegraph: 'ring' }),
      atk({ id: 'tail-sweep', name: 'Tail Sweep', kind: 'melee', damageMult: 1.3, damageTypes: { blunt: 1 }, windupMs: 650, recoveryMs: 700, cooldownMs: 3500, rangePx: 110, arcDeg: 200, poiseDamage: 60, weight: 2, telegraph: 'cone' }),
      atk({ id: 'claw', name: 'Glass Claw', kind: 'melee', damageMult: 1.1, damageTypes: { slash: 0.7, fire: 0.3 }, windupMs: 420, recoveryMs: 500, cooldownMs: 1500, rangePx: 80, arcDeg: 100, poiseDamage: 30, weight: 3 }),
      atk({ id: 'brood-call', name: 'Brood Call', kind: 'spell', damageMult: 0, damageTypes: { fire: 1 }, windupMs: 1200, activeMs: 100, recoveryMs: 700, cooldownMs: 18000, rangePx: 999, poiseDamage: 0, weight: 2, telegraph: 'ring', minPhase: 2 }),
      atk({ id: 'ash-storm', name: 'Ash Storm', kind: 'area', damageMult: 2.6, damageTypes: { fire: 1 }, windupMs: 2400, activeMs: 150, recoveryMs: 1000, cooldownMs: 16000, rangePx: 999, radius: 280, buildup: { burn: 80 }, poiseDamage: 70, weight: 4, telegraph: 'ring', unblockable: true, minPhase: 3 }),
    ],
    ai: { perceptionPx: 520, fovDeg: 360, hearingPx: 520, aggression: 1, preferredRangePx: [70, 200], behaviors: ['approach', 'strafe'] },
    phases: [
      { atHpPct: 0.66, modifiers: [{ stat: 'attackSpeed', op: 'increased', value: 0.15 }], summon: { enemy: 'enemy:cinderdrake-whelp', count: 3 }, message: 'The brood answers the Ashwyrm!' },
      { atHpPct: 0.33, modifiers: [{ stat: 'damageDealt', op: 'increased', value: 0.2 }], message: 'The Ashwyrm takes wing: the ash storm is coming!' },
    ],
    loot: 'loot:ashwyrm', radius: 26, appearance: { shape: 'triangle', color: '#8c3a10', scale: 2.4 }, canBeElite: false,
    tags: ['summon:enemy:cinderdrake-whelp:2'], codexEntry: 'lore:cinderdrakes-and-ashwyrms',
  },
  {
    id: 'enemy:mirebeast', name: 'Mirebeast', description: 'The Mire given a body: a heaving mass of black water, reeds and drowned bone. Cut it open and Mirelings spill out.',
    family: 'unwrought', archetype: 'brute', rank: 'normal', phase: 2,
    base: { hp: 150, damage: 17, armor: 6, poise: 100, moveSpeed: 90 },
    resist: { shadow: 0.6, fire: -0.3, radiant: -0.3, pierce: 0.3 }, statusResist: {}, immune: ['poison', 'bleed'],
    attacks: [
      atk({ id: 'engulf', name: 'Engulf', kind: 'melee', damageMult: 1.3, damageTypes: { shadow: 0.6, blunt: 0.4 }, windupMs: 700, activeMs: 160, recoveryMs: 800, cooldownMs: 2200, rangePx: 70, arcDeg: 130, poiseDamage: 50, weight: 3, telegraph: 'cone' }),
      atk({ id: 'mire-surge', name: 'Mire Surge', kind: 'area', damageMult: 1.2, damageTypes: { shadow: 1 }, windupMs: 900, activeMs: 120, recoveryMs: 700, cooldownMs: 6000, rangePx: 280, radius: 90, poiseDamage: 30, weight: 2, telegraph: 'ring' }),
    ],
    ai: { perceptionPx: 280, fovDeg: 360, hearingPx: 300, aggression: 0.7, preferredRangePx: [30, 70], behaviors: ['approach'] },
    loot: 'loot:mirebeast', radius: 20, appearance: { shape: 'circle', color: '#1b2a22', scale: 1.8 }, canBeElite: true, allowedTiers: [3, 4, 5],
    tags: ['split:enemy:mireling:3'], codexEntry: 'lore:mirebeasts',
  },
];

export default enemies;
