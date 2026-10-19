/**
 * Act I enemies (docs/lore/10-act1-spec.md). Danger tiers 2–3 (levels 6–20); base values are level-1.
 * Summoners: attack kind 'spell' + tag `summon:<enemyId>:<count>` (handled by the combat runtime).
 * Owner: Claude 3.
 */
import type { EnemyAttackDef, EnemyDef } from '@/core';

type A = Omit<EnemyAttackDef, 'activeMs' | 'poiseDamage' | 'weight' | 'telegraph'> &
  Partial<Pick<EnemyAttackDef, 'activeMs' | 'poiseDamage' | 'weight' | 'telegraph'>>;
const atk = (a: A): EnemyAttackDef => ({ activeMs: 120, poiseDamage: 15, weight: 1, telegraph: 'flash', ...a });
const proj = (speed: number, range: number, radius: number, color: string, extra: Partial<NonNullable<EnemyAttackDef['projectile']>> = {}) =>
  ({ speed, rangePx: range, radius, pierce: 0, color, ...extra });

const enemies: EnemyDef[] = [
  {
    id: 'enemy:cinder-shade', name: 'Cinder Shade', description: 'The burned dead of the Purge. Ash for skin, embers for eyes, still screaming the old oaths.',
    family: 'restless', archetype: 'caster', rank: 'normal', phase: 2,
    base: { hp: 48, damage: 11, armor: 2, poise: 20, moveSpeed: 120 },
    resist: { fire: 0.5, frost: -0.25, radiant: -0.3, slash: 0.2 }, statusResist: {}, immune: ['bleed', 'poison', 'burn'],
    attacks: [
      atk({ id: 'ember-spit', name: 'Ember Spit', kind: 'projectile', damageMult: 1, damageTypes: { fire: 1 }, windupMs: 550, activeMs: 50, recoveryMs: 400, cooldownMs: 1600, rangePx: 320, buildup: { burn: 25 }, weight: 3, telegraph: 'line',
        projectile: proj(360, 360, 6, '#ffb04a') }),
      atk({ id: 'flare', name: 'Death-Flare', kind: 'area', damageMult: 1.3, damageTypes: { fire: 1 }, windupMs: 800, activeMs: 100, recoveryMs: 600, cooldownMs: 6000, rangePx: 80, radius: 80, buildup: { burn: 40 }, poiseDamage: 25, weight: 2, telegraph: 'ring' }),
    ],
    ai: { perceptionPx: 300, fovDeg: 220, hearingPx: 300, aggression: 0.6, preferredRangePx: [120, 220], behaviors: ['kite', 'strafe'], callForHelpPx: 260 },
    loot: 'loot:cinder-shade', radius: 11, appearance: { shape: 'diamond', color: '#8c3a10', scale: 1 }, canBeElite: true, allowedTiers: [2, 3], codexEntry: 'lore:cinder-shades',
  },
  {
    id: 'enemy:rust-wraith', name: 'Rust-Wraith', description: 'What remains of a fallen Orrin giant: rust and grief, still trying to finish its last blow.',
    family: 'wrought', archetype: 'brute', rank: 'normal', phase: 2,
    base: { hp: 105, damage: 16, armor: 22, poise: 70, moveSpeed: 75 },
    resist: { slash: 0.3, pierce: 0.4, lightning: -0.3, frost: 0.2 }, statusResist: { frozen: 0.5 }, immune: ['bleed', 'poison'],
    attacks: [
      atk({ id: 'slam', name: 'Rusted Slam', kind: 'area', damageMult: 1.5, damageTypes: { blunt: 1 }, windupMs: 900, activeMs: 120, recoveryMs: 900, cooldownMs: 3200, rangePx: 70, radius: 72, poiseDamage: 55, weight: 2, telegraph: 'ring' }),
      atk({ id: 'sweep', name: 'Iron Sweep', kind: 'melee', damageMult: 1.1, damageTypes: { blunt: 0.7, slash: 0.3 }, windupMs: 600, recoveryMs: 700, cooldownMs: 1800, rangePx: 70, arcDeg: 150, poiseDamage: 35, weight: 3, telegraph: 'cone' }),
      atk({ id: 'rust-cloud', name: 'Rust Cloud', kind: 'area', damageMult: 0.5, damageTypes: { poison: 1 }, windupMs: 700, activeMs: 100, recoveryMs: 500, cooldownMs: 9000, rangePx: 260, radius: 90, poiseDamage: 0, weight: 1, telegraph: 'ring' }),
    ],
    ai: { perceptionPx: 240, fovDeg: 140, hearingPx: 260, aggression: 0.6, preferredRangePx: [30, 64], behaviors: ['approach'] },
    loot: 'loot:rust-wraith', radius: 18, appearance: { shape: 'square', color: '#8a5a33', scale: 1.5 }, canBeElite: true, allowedTiers: [2, 3, 4], codexEntry: 'lore:rust-wraiths',
  },
  {
    id: 'enemy:barrow-wight', name: 'Barrow-Wight', description: 'An old king’s sworn man, still keeping a watch nobody remembers setting. Its blade is rimed with the river’s cold.',
    family: 'restless', archetype: 'skirmisher', rank: 'normal', phase: 2,
    base: { hp: 70, damage: 13, armor: 12, poise: 40, moveSpeed: 130 },
    resist: { frost: 0.5, pierce: 0.4, blunt: -0.3, radiant: -0.3, shadow: 0.3 }, statusResist: {}, immune: ['bleed', 'poison'],
    attacks: [
      atk({ id: 'rime-cut', name: 'Rime Cut', kind: 'melee', damageMult: 1, damageTypes: { slash: 0.6, frost: 0.4 }, windupMs: 380, recoveryMs: 450, cooldownMs: 1200, rangePx: 54, arcDeg: 100, buildup: { frozen: 20 }, weight: 3 }),
      atk({ id: 'grave-lunge', name: 'Grave Lunge', kind: 'charge', damageMult: 1.4, damageTypes: { pierce: 1 }, windupMs: 520, activeMs: 220, recoveryMs: 600, cooldownMs: 4500, rangePx: 120, arcDeg: 40, poiseDamage: 30, weight: 1, telegraph: 'line' }),
    ],
    ai: { perceptionPx: 260, fovDeg: 160, hearingPx: 280, aggression: 0.7, preferredRangePx: [36, 70], behaviors: ['strafe', 'dodgeTelegraphs', 'retreatAfterAttack'], dodgeChance: 0.2, callForHelpPx: 300 },
    loot: 'loot:barrow-wight', radius: 12, appearance: { shape: 'triangle', color: '#8fd3ff', scale: 1.05 }, canBeElite: true, allowedTiers: [2, 3], codexEntry: 'lore:the-restless',
  },
  {
    id: 'enemy:choir-acolyte', name: 'Choir Acolyte', description: 'A novice of the Drowned Choir: hooked mire-knife, wet robes, and a hymn under the breath.',
    family: 'folk', archetype: 'skirmisher', rank: 'normal', phase: 2,
    base: { hp: 58, damage: 11, armor: 5, poise: 25, moveSpeed: 145 },
    resist: { shadow: 0.25, fire: -0.1 }, statusResist: {}, immune: [],
    attacks: [
      atk({ id: 'hook-knife', name: 'Hooked Knife', kind: 'melee', damageMult: 1, damageTypes: { slash: 0.7, shadow: 0.3 }, windupMs: 320, recoveryMs: 380, cooldownMs: 1000, rangePx: 46, arcDeg: 90, buildup: { bleed: 20 }, weight: 3 }),
      atk({ id: 'mire-bolt', name: 'Mire Bolt', kind: 'projectile', damageMult: 0.9, damageTypes: { shadow: 1 }, windupMs: 600, activeMs: 50, recoveryMs: 450, cooldownMs: 4000, rangePx: 300, weight: 1, telegraph: 'line',
        projectile: proj(320, 340, 6, '#4a6b5a') }),
    ],
    ai: { perceptionPx: 280, fovDeg: 150, hearingPx: 300, aggression: 0.65, preferredRangePx: [36, 80], behaviors: ['strafe', 'flank', 'dodgeTelegraphs'], dodgeChance: 0.2, callForHelpPx: 320 },
    loot: 'loot:drowned-choir', radius: 11, appearance: { shape: 'diamond', color: '#3a5c4f', scale: 1 }, canBeElite: true, allowedTiers: [2, 3],
  },
  {
    id: 'enemy:reed-priest', name: 'Reed-Priest', description: 'A Choir priest in rotted reeds. Where it sings, the mud stands up and walks.',
    family: 'folk', archetype: 'summoner', rank: 'normal', phase: 2,
    base: { hp: 62, damage: 12, armor: 4, poise: 30, moveSpeed: 110 },
    resist: { shadow: 0.4, fire: -0.15 }, statusResist: {}, immune: [],
    attacks: [
      atk({ id: 'call-the-mire', name: 'Call the Mire', kind: 'spell', damageMult: 0, damageTypes: { shadow: 1 }, windupMs: 1200, activeMs: 100, recoveryMs: 700, cooldownMs: 11000, rangePx: 360, poiseDamage: 0, weight: 3, telegraph: 'ring' }),
      atk({ id: 'drowning-word', name: 'Drowning Word', kind: 'area', damageMult: 1.2, damageTypes: { shadow: 1 }, windupMs: 900, activeMs: 100, recoveryMs: 600, cooldownMs: 5000, rangePx: 300, radius: 64, poiseDamage: 20, weight: 2, telegraph: 'ring' }),
    ],
    ai: { perceptionPx: 320, fovDeg: 180, hearingPx: 320, aggression: 0.5, preferredRangePx: [170, 260], behaviors: ['kite'], callForHelpPx: 360 },
    loot: 'loot:drowned-choir', radius: 11, appearance: { shape: 'diamond', color: '#5f7f5a', scale: 1.05 }, canBeElite: true, allowedTiers: [2, 3],
    tags: ['summon:enemy:mireling:2'],
  },
  {
    id: 'enemy:drowned-knight', name: 'Drowned Knight', description: 'A Choir knight in drowned silver, taken by the Mire and kept: heavy, patient and cold.',
    family: 'folk', variant: 'hollowed', archetype: 'brute', rank: 'normal', phase: 2,
    base: { hp: 115, damage: 17, armor: 20, poise: 80, moveSpeed: 100 },
    resist: { fire: -0.25, radiant: -0.25, shadow: 0.4, slash: 0.2 }, statusResist: { bleed: 0.3 }, immune: ['poison'],
    attacks: [
      atk({ id: 'silver-cleave', name: 'Drowned-Silver Cleave', kind: 'melee', damageMult: 1.2, damageTypes: { slash: 0.7, shadow: 0.3 }, windupMs: 650, activeMs: 140, recoveryMs: 700, cooldownMs: 2000, rangePx: 66, arcDeg: 140, poiseDamage: 45, weight: 3, telegraph: 'cone' }),
      atk({ id: 'tide-charge', name: 'Tide Charge', kind: 'charge', damageMult: 1.5, damageTypes: { blunt: 1 }, windupMs: 700, activeMs: 380, recoveryMs: 900, cooldownMs: 6000, rangePx: 220, arcDeg: 40, poiseDamage: 60, weight: 1, telegraph: 'line' }),
    ],
    ai: { perceptionPx: 280, fovDeg: 150, hearingPx: 280, aggression: 0.6, preferredRangePx: [30, 66], behaviors: ['approach', 'shieldFront'], callForHelpPx: 320 },
    loot: 'loot:drowned-knight', radius: 15, appearance: { shape: 'square', color: '#3f5f66', scale: 1.3 }, canBeElite: true, allowedTiers: [3, 4], codexEntry: 'lore:drowned-knights',
  },
  // ───────── bosses ─────────
  {
    id: 'enemy:reed-mother', name: 'The Reed-Mother', description: 'High priestess of the Drowned Choir. She sings with the Mire’s voice, and the fen answers.',
    family: 'folk', archetype: 'boss', rank: 'boss', phase: 2,
    base: { hp: 1100, damage: 16, armor: 8, poise: 160, moveSpeed: 100 },
    resist: { shadow: 0.5, frost: 0.2, fire: -0.15, radiant: -0.2 }, statusResist: { frozen: 0.5, bleed: 0.3 }, immune: [],
    attacks: [
      atk({ id: 'reed-lash', name: 'Reed Lash', kind: 'melee', damageMult: 1.1, damageTypes: { slash: 0.5, shadow: 0.5 }, windupMs: 500, recoveryMs: 500, cooldownMs: 1800, rangePx: 110, arcDeg: 110, poiseDamage: 30, weight: 3, telegraph: 'cone' }),
      atk({ id: 'mire-pool', name: 'Mire Pool', kind: 'area', damageMult: 1.3, damageTypes: { shadow: 1 }, windupMs: 900, activeMs: 100, recoveryMs: 500, cooldownMs: 5000, rangePx: 360, radius: 90, poiseDamage: 25, weight: 2, telegraph: 'ring' }),
      atk({ id: 'choir-call', name: 'Choir Call', kind: 'spell', damageMult: 0, damageTypes: { shadow: 1 }, windupMs: 1400, activeMs: 100, recoveryMs: 800, cooldownMs: 16000, rangePx: 999, poiseDamage: 0, weight: 2, telegraph: 'ring' }),
      atk({ id: 'drowning-hymn', name: 'Drowning Hymn', kind: 'area', damageMult: 2.4, damageTypes: { shadow: 1 }, windupMs: 2400, activeMs: 150, recoveryMs: 900, cooldownMs: 15000, rangePx: 999, radius: 240, poiseDamage: 60, weight: 4, telegraph: 'ring', unblockable: true, minPhase: 3 }),
    ],
    ai: { perceptionPx: 460, fovDeg: 360, hearingPx: 460, aggression: 1, preferredRangePx: [90, 220], behaviors: ['kite', 'strafe'] },
    phases: [
      { atHpPct: 0.66, modifiers: [{ stat: 'attackSpeed', op: 'increased', value: 0.15 }], summon: { enemy: 'enemy:choir-acolyte', count: 2 }, message: 'The Choir answers its Mother!' },
      { atHpPct: 0.33, modifiers: [{ stat: 'moveSpeed', op: 'increased', value: 0.2 }], summon: { enemy: 'enemy:mireling', count: 4 }, message: 'The Reed-Mother begins the Drowning Hymn: stagger her!' },
    ],
    loot: 'loot:reed-mother', radius: 18, appearance: { shape: 'diamond', color: '#2f4a3a', scale: 2 }, canBeElite: false,
    tags: ['summon:enemy:choir-acolyte:2'], codexEntry: 'lore:reed-mother',
  },
  {
    id: 'enemy:aldwin-varn', name: 'Aldwin Varn, the Drowned Lord', description: 'Lord of drowned Varn, holding court for a family the Mire made from his grief.',
    family: 'folk', variant: 'hollowed', archetype: 'boss', rank: 'boss', phase: 2,
    base: { hp: 1500, damage: 19, armor: 16, poise: 200, moveSpeed: 135 },
    resist: { shadow: 0.5, slash: 0.15, fire: -0.2, radiant: -0.25 }, statusResist: { bleed: 0.5, frozen: 0.6 }, immune: ['poison'],
    attacks: [
      atk({ id: 'hook-flurry', name: 'Hook Flurry', kind: 'melee', damageMult: 1, damageTypes: { slash: 0.6, shadow: 0.4 }, windupMs: 420, recoveryMs: 450, cooldownMs: 1400, rangePx: 60, arcDeg: 110, buildup: { bleed: 30 }, poiseDamage: 25, weight: 3 }),
      atk({ id: 'drowned-lunge', name: 'Drowned Lunge', kind: 'charge', damageMult: 1.6, damageTypes: { pierce: 0.6, shadow: 0.4 }, windupMs: 600, activeMs: 320, recoveryMs: 800, cooldownMs: 5000, rangePx: 260, arcDeg: 40, poiseDamage: 50, weight: 2, telegraph: 'line' }),
      atk({ id: 'black-tide', name: 'Black Tide', kind: 'area', damageMult: 1.5, damageTypes: { shadow: 1 }, windupMs: 950, activeMs: 120, recoveryMs: 700, cooldownMs: 7000, rangePx: 120, radius: 120, poiseDamage: 40, weight: 2, telegraph: 'ring' }),
      atk({ id: 'court-of-the-drowned', name: 'Court of the Drowned', kind: 'spell', damageMult: 0, damageTypes: { shadow: 1 }, windupMs: 1500, activeMs: 100, recoveryMs: 800, cooldownMs: 18000, rangePx: 999, poiseDamage: 0, weight: 2, telegraph: 'ring', minPhase: 2 }),
      atk({ id: 'drowning-grief', name: 'Drowning Grief', kind: 'area', damageMult: 2.6, damageTypes: { shadow: 1 }, windupMs: 2200, activeMs: 150, recoveryMs: 1000, cooldownMs: 16000, rangePx: 999, radius: 260, poiseDamage: 70, weight: 4, telegraph: 'ring', unblockable: true, minPhase: 3 }),
    ],
    ai: { perceptionPx: 480, fovDeg: 360, hearingPx: 480, aggression: 1, preferredRangePx: [40, 120], behaviors: ['approach', 'strafe'] },
    phases: [
      { atHpPct: 0.66, modifiers: [{ stat: 'attackSpeed', op: 'increased', value: 0.15 }], summon: { enemy: 'enemy:drowned-knight', count: 1 }, message: 'Aldwin calls his drowned guard!' },
      { atHpPct: 0.33, modifiers: [{ stat: 'damageDealt', op: 'increased', value: 0.2 }], summon: { enemy: 'enemy:drowned-dead', count: 3 }, message: '“My wife… my sons… stand with me!”' },
    ],
    loot: 'loot:aldwin-varn', radius: 17, appearance: { shape: 'diamond', color: '#1f3a40', scale: 1.9 }, canBeElite: false,
    tags: ['summon:enemy:drowned-dead:3'], codexEntry: 'lore:aldwin-varn',
  },
];

export default enemies;
