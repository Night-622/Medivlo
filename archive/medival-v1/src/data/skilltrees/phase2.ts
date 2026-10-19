/**
 * Phase 2 class trees: full five tiers, three branches, one keystone choice per tree (SYSTEMS.md §5).
 * Columns: branch A 0–2, B 3–5, C 6–8. Owner: Claude 3.
 */
import type { EffectDef, SkillNodeDef, SkillTreeDef, StatModifier } from '@/core';

const mod = (stat: StatModifier['stat'], op: StatModifier['op'], value: number, condition?: StatModifier['condition']): EffectDef =>
  ({ kind: 'modifier', mod: condition ? { stat, op, value, condition } : { stat, op, value } });
const hook = (name: string, params?: Record<string, number>): EffectDef => ({ kind: 'hook', hook: name, params });
const grant = (spell: `spell:${string}`): EffectDef => ({ kind: 'grantAbility', spell });

type N = Omit<SkillNodeDef, 'costPerRank' | 'pos'> & { col: number };
const build = (nodes: N[]): SkillNodeDef[] => nodes.map(({ col, ...n }) => ({ ...n, costPerRank: 1, pos: { col, row: n.tier - 1 } }));
const T: SkillTreeDef['tierThresholds'] = [0, 5, 10, 15, 20];

const reaver: SkillTreeDef = {
  id: 'skilltree:reaver', name: 'The Red Road', description: 'Fury, Blood and Iron.', treeKind: 'class', owner: 'class:reaver', tierThresholds: T,
  nodes: build([
    { id: 'savagery', name: 'Savagery', description: '+4% melee damage per rank.', type: 'minor', tier: 1, branch: 'fury', maxRank: 3, col: 1, effects: [mod('meleeDamage', 'increased', 0.04)] },
    { id: 'thick-blood', name: 'Thick Blood', description: '+5% max HP per rank.', type: 'minor', tier: 1, branch: 'blood', maxRank: 3, col: 4, effects: [mod('maxHp', 'increased', 0.05)] },
    { id: 'wolf-howl', name: 'Wolf Howl', description: 'Ability: Weaken nearby enemies and gain 30 Fury.', type: 'ability', tier: 1, branch: 'iron', maxRank: 1, col: 7, effects: [grant('spell:wolf-howl')] },
    { id: 'red-mist', name: 'Red Mist', description: '+15% damage while above 50 Fury.', type: 'notable', tier: 2, branch: 'fury', maxRank: 1, col: 0, requiresAny: ['savagery'], effects: [hook('furyDamage', { threshold: 50, pct: 0.15 })] },
    { id: 'crimson-leap', name: 'Crimson Leap', description: 'Ability: leap and slam where you land.', type: 'ability', tier: 2, branch: 'fury', maxRank: 1, col: 2, requiresAny: ['savagery'], effects: [grant('spell:crimson-leap')] },
    { id: 'open-veins', name: 'Open Veins', description: '+20% Bleed buildup per rank.', type: 'minor', tier: 2, branch: 'blood', maxRank: 2, col: 4, requiresAny: ['thick-blood'], effects: [mod('buildup.bleed', 'increased', 0.2)] },
    { id: 'hide-like-iron', name: 'Hide Like Iron', description: '+15 armour per rank.', type: 'minor', tier: 2, branch: 'iron', maxRank: 3, col: 7, requiresAny: ['wolf-howl'], effects: [mod('armor', 'flat', 15)] },
    { id: 'bloodlust', name: 'Bloodlust', description: 'Ability: +20% attack speed and 5% leech for 8 s.', type: 'ability', tier: 3, branch: 'blood', maxRank: 1, col: 3, requiresAny: ['open-veins'], effects: [grant('spell:bloodlust')] },
    { id: 'sanguine', name: 'Sanguine', description: 'Kills restore 4% of max HP.', type: 'notable', tier: 3, branch: 'blood', maxRank: 1, col: 5, requiresAny: ['open-veins'], effects: [mod('lifeOnKill', 'flat', 0.04)] },
    { id: 'frenzy', name: 'Frenzy', description: '+4% attack speed per rank.', type: 'minor', tier: 3, branch: 'fury', maxRank: 2, col: 1, requiresAny: ['red-mist', 'crimson-leap'], effects: [mod('attackSpeed', 'increased', 0.04)] },
    { id: 'unbowed', name: 'Unbowed', description: '+30% poise.', type: 'notable', tier: 3, branch: 'iron', maxRank: 1, col: 7, requiresAny: ['hide-like-iron'], effects: [mod('poise', 'increased', 0.3)] },
    { id: 'executioner', name: 'Executioner', description: '+40% damage to enemies below 30% HP.', type: 'notable', tier: 4, branch: 'fury', maxRank: 1, col: 1, requiresAny: ['frenzy'], effects: [hook('executeBonus', { threshold: 0.3, pct: 0.4 })] },
    { id: 'blood-price', name: 'Blood Price', description: 'Bloodcraft powers cost 30% less HP.', type: 'notable', tier: 4, branch: 'blood', maxRank: 1, col: 4, requiresAny: ['bloodlust', 'sanguine'], effects: [hook('bloodPrice', { pct: 0.3 })] },
    { id: 'iron-hide', name: 'Iron Will', description: '+15% status resist and +10% max HP.', type: 'minor', tier: 4, branch: 'iron', maxRank: 1, col: 7, requiresAny: ['unbowed'], effects: [mod('statusResist', 'flat', 0.15), mod('maxHp', 'increased', 0.1)] },
    { id: 'berserker', name: 'Berserker', description: 'Keystone: below 50% HP, +30% more damage and +15% attack speed. You cannot block, and healing received is reduced by 30%.', type: 'keystone', tier: 5, branch: 'fury', maxRank: 1, col: 1, requiresAny: ['executioner'], exclusiveGroup: 'reaver-keystone',
      effects: [mod('damageDealt', 'more', 0.3, { kind: 'hpBelow', pct: 0.5 }), mod('attackSpeed', 'increased', 0.15, { kind: 'hpBelow', pct: 0.5 }), mod('healingReceived', 'increased', -0.3)] },
    { id: 'red-tithe', name: 'The Red Tithe', description: 'Keystone: kills restore 8% of max HP and 25 Fury. Hearth Draughts heal 50% less.', type: 'keystone', tier: 5, branch: 'blood', maxRank: 1, col: 4, requiresAny: ['blood-price'], exclusiveGroup: 'reaver-keystone',
      effects: [mod('lifeOnKill', 'flat', 0.08), hook('furyOnKill', { amount: 25 }), hook('draughtPenalty', { pct: 0.5 })] },
    { id: 'juggernaut-blood', name: 'Mountain-Born', description: 'Keystone: +60% more poise and +40% armour; −10% move speed and dodge distance.', type: 'keystone', tier: 5, branch: 'iron', maxRank: 1, col: 7, requiresAny: ['iron-hide'], exclusiveGroup: 'reaver-keystone',
      effects: [mod('poise', 'more', 0.6), mod('armor', 'increased', 0.4), mod('moveSpeed', 'increased', -0.1), mod('dodgeDistance', 'increased', -0.1)] },
  ]),
};

const shade: SkillTreeDef = {
  id: 'skilltree:shade', name: 'The Quiet Way', description: 'Blades, Shadow and Venom.', treeKind: 'class', owner: 'class:shade', tierThresholds: T,
  nodes: build([
    { id: 'quick-hands', name: 'Quick Hands', description: '+4% attack speed per rank.', type: 'minor', tier: 1, branch: 'blades', maxRank: 3, col: 1, effects: [mod('attackSpeed', 'increased', 0.04)] },
    { id: 'fan-of-knives', name: 'Fan of Knives', description: 'Ability: five poisoned knives in a fan.', type: 'ability', tier: 1, branch: 'shadow', maxRank: 1, col: 4, effects: [grant('spell:fan-of-knives')] },
    { id: 'toxicology', name: 'Toxicology', description: '+20% Poison buildup per rank.', type: 'minor', tier: 1, branch: 'venom', maxRank: 3, col: 7, effects: [mod('buildup.poison', 'increased', 0.2)] },
    { id: 'keen-edge', name: 'Keen Edge', description: '+2% crit chance per rank.', type: 'minor', tier: 2, branch: 'blades', maxRank: 3, col: 0, requiresAny: ['quick-hands'], effects: [mod('critChance', 'flat', 0.02)] },
    { id: 'cutpurse', name: 'Cutpurse', description: '+25% gold found.', type: 'minor', tier: 2, branch: 'blades', maxRank: 1, col: 2, requiresAny: ['quick-hands'], effects: [mod('goldFind', 'increased', 0.25)] },
    { id: 'smoke-veil', name: 'Smoke Veil', description: 'Ability: blind nearby foes and slip into Stealth.', type: 'ability', tier: 2, branch: 'shadow', maxRank: 1, col: 4, requiresAny: ['fan-of-knives'], effects: [grant('spell:smoke-veil')] },
    { id: 'lingering-venom', name: 'Lingering Venom', description: '+15% damage against Poisoned enemies.', type: 'notable', tier: 2, branch: 'venom', maxRank: 1, col: 7, requiresAny: ['toxicology'], effects: [mod('damageDealt', 'increased', 0.15, { kind: 'targetHasStatus', status: 'poison' })] },
    { id: 'from-the-dark', name: 'From the Dark', description: 'Stealth strikes deal +50% more (on top of the doubling).', type: 'notable', tier: 3, branch: 'shadow', maxRank: 1, col: 3, requiresAny: ['smoke-veil'], effects: [hook('stealthBonus', { more: 0.5 })] },
    { id: 'deathmark', name: 'Deathmark', description: 'Ability: mark a target Vulnerable for 6 s.', type: 'ability', tier: 3, branch: 'shadow', maxRank: 1, col: 5, requiresAny: ['smoke-veil'], effects: [grant('spell:deathmark')] },
    { id: 'ghost-step', name: 'Ghost Step', description: 'Dodging costs 25% less stamina and rolls 15% further.', type: 'notable', tier: 3, branch: 'blades', maxRank: 1, col: 1, requiresAny: ['keen-edge', 'cutpurse'], effects: [mod('dodgeCost', 'increased', -0.25), mod('dodgeDistance', 'increased', 0.15)] },
    { id: 'virulence', name: 'Virulence', description: '+10% poison damage.', type: 'minor', tier: 3, branch: 'venom', maxRank: 1, col: 7, requiresAny: ['lingering-venom'], effects: [mod('damage.poison', 'increased', 0.1)] },
    { id: 'backstabber', name: 'Backstabber', description: 'Backstabs gain +25% crit chance.', type: 'notable', tier: 4, branch: 'blades', maxRank: 1, col: 1, requiresAny: ['ghost-step'], effects: [hook('backstabCrit', { bonus: 0.25 })] },
    { id: 'night-blade', name: 'Night Blade', description: '+20% damage at night.', type: 'minor', tier: 4, branch: 'shadow', maxRank: 1, col: 4, requiresAny: ['from-the-dark', 'deathmark'], effects: [mod('damageDealt', 'increased', 0.2, { kind: 'timeOfDay', phase: 'night' })] },
    { id: 'plague-blades', name: 'Plague Blades', description: 'Weapon hits also add 15 Poison buildup.', type: 'notable', tier: 4, branch: 'venom', maxRank: 1, col: 7, requiresAny: ['virulence'], effects: [{ kind: 'applyStatus', trigger: 'onHit', status: 'poison', target: 'target', buildup: 15 }] },
    { id: 'assassins-edge', name: 'Assassin’s Edge', description: 'Keystone: +50% crit multiplier and +10% crit chance; −20% max HP.', type: 'keystone', tier: 5, branch: 'blades', maxRank: 1, col: 1, requiresAny: ['backstabber'], exclusiveGroup: 'shade-keystone',
      effects: [mod('critMultiplier', 'flat', 0.5), mod('critChance', 'flat', 0.1), mod('maxHp', 'increased', -0.2)] },
    { id: 'shadow-dancer', name: 'Shadow Dancer', description: 'Keystone: dodging grants Stealth for 1 s. −30% armour.', type: 'keystone', tier: 5, branch: 'shadow', maxRank: 1, col: 4, requiresAny: ['night-blade'], exclusiveGroup: 'shade-keystone',
      effects: [{ kind: 'applyStatus', trigger: 'onDodge', status: 'stealth', target: 'self', durationMs: 1000 }, mod('armor', 'increased', -0.3)] },
    { id: 'venom-saint', name: 'Venom-Saint', description: 'Keystone: +60% more Poison buildup and +25% poison damage; −10% damage of other kinds.', type: 'keystone', tier: 5, branch: 'venom', maxRank: 1, col: 7, requiresAny: ['plague-blades'], exclusiveGroup: 'shade-keystone',
      effects: [mod('buildup.poison', 'more', 0.6), mod('damage.poison', 'increased', 0.25), mod('damageDealt', 'increased', -0.1)] },
  ]),
};

const oathbound: SkillTreeDef = {
  id: 'skilltree:oathbound', name: 'The Lantern Path', description: 'Smite, Ward and Lantern.', treeKind: 'class', owner: 'class:oathbound', tierThresholds: T,
  nodes: build([
    { id: 'zeal', name: 'Zeal', description: '+5% Radiance damage per rank.', type: 'minor', tier: 1, branch: 'smite', maxRank: 3, col: 1, effects: [mod('school.radiance', 'increased', 0.05)] },
    { id: 'sacred-ward', name: 'Sacred Ward', description: 'Ability: a ward of 25% max HP plus regeneration.', type: 'ability', tier: 1, branch: 'ward', maxRank: 1, col: 4, effects: [grant('spell:sacred-ward')] },
    { id: 'pilgrims-road', name: 'Pilgrim’s Road', description: '+5% max Ember and +0.5 Ember regen per rank.', type: 'minor', tier: 1, branch: 'lantern', maxRank: 3, col: 7, effects: [mod('maxMana', 'increased', 0.05), mod('manaRegen', 'flat', 0.5)] },
    { id: 'hammer-of-faith', name: 'Hammer of Faith', description: '+5% melee damage per rank.', type: 'minor', tier: 2, branch: 'smite', maxRank: 2, col: 0, requiresAny: ['zeal'], effects: [mod('meleeDamage', 'increased', 0.05)] },
    { id: 'banish', name: 'Banish', description: '+25% damage against the Hollowed and the Unwrought.', type: 'notable', tier: 2, branch: 'smite', maxRank: 1, col: 2, requiresAny: ['zeal'],
      effects: [mod('damageDealt', 'increased', 0.25, { kind: 'any', of: [{ kind: 'targetVariant', variant: 'hollowed' }, { kind: 'targetFamily', family: 'unwrought' }] })] },
    { id: 'shield-of-faith', name: 'Shield of Faith', description: '+12 armour and +10 block stability per rank.', type: 'minor', tier: 2, branch: 'ward', maxRank: 2, col: 4, requiresAny: ['sacred-ward'], effects: [mod('armor', 'flat', 12), mod('blockStability', 'flat', 10)] },
    { id: 'consecration', name: 'Consecration', description: 'Ability: hallowed ground that burns foes and mends you.', type: 'ability', tier: 2, branch: 'lantern', maxRank: 1, col: 7, requiresAny: ['pilgrims-road'], effects: [grant('spell:consecration')] },
    { id: 'judgment', name: 'Judgment', description: 'Ability: a piercing lance of light.', type: 'ability', tier: 3, branch: 'smite', maxRank: 1, col: 1, requiresAny: ['hammer-of-faith', 'banish'], effects: [grant('spell:judgment')] },
    { id: 'martyrs-grace', name: 'Martyr’s Grace', description: '+15% healing received (including Hearth Draughts).', type: 'notable', tier: 3, branch: 'ward', maxRank: 1, col: 4, requiresAny: ['shield-of-faith'], effects: [mod('healingReceived', 'increased', 0.15)] },
    { id: 'devoted', name: 'Devoted', description: 'Devotion is gained 50% faster.', type: 'notable', tier: 3, branch: 'lantern', maxRank: 1, col: 7, requiresAny: ['consecration'], effects: [hook('devotionGain', { mult: 1.5 })] },
    { id: 'radiant-steel', name: 'Radiant Steel', description: 'Weapon hits deal +15% damage as radiant.', type: 'notable', tier: 4, branch: 'smite', maxRank: 1, col: 1, requiresAny: ['judgment'], effects: [{ kind: 'hook', hook: 'convertPhysical', params: { pct: 0.15, to: 'radiant' } }] },
    { id: 'aegis', name: 'Aegis', description: '+10% max HP and +10% status resist.', type: 'minor', tier: 4, branch: 'ward', maxRank: 1, col: 4, requiresAny: ['martyrs-grace'], effects: [mod('maxHp', 'increased', 0.1), mod('statusResist', 'flat', 0.1)] },
    { id: 'lantern-light', name: 'Lantern-Light', description: '+15% Radiance damage and +10% cast speed.', type: 'minor', tier: 4, branch: 'lantern', maxRank: 1, col: 7, requiresAny: ['devoted'], effects: [mod('school.radiance', 'increased', 0.15), mod('castSpeed', 'increased', 0.1)] },
    { id: 'inquisitors-zeal', name: 'Inquisitor’s Zeal', description: 'Keystone: +40% more radiant damage against the Hollowed and Unwrought; −15% max Ember.', type: 'keystone', tier: 5, branch: 'smite', maxRank: 1, col: 1, requiresAny: ['radiant-steel'], exclusiveGroup: 'oath-keystone',
      effects: [mod('damage.radiant', 'more', 0.4, { kind: 'any', of: [{ kind: 'targetVariant', variant: 'hollowed' }, { kind: 'targetFamily', family: 'unwrought' }] }), mod('maxMana', 'increased', -0.15)] },
    { id: 'living-shrine', name: 'Living Shrine', description: 'Keystone: regenerate 2% max HP per second in combat; −20% damage dealt.', type: 'keystone', tier: 5, branch: 'ward', maxRank: 1, col: 4, requiresAny: ['aegis'], exclusiveGroup: 'oath-keystone',
      effects: [hook('percentRegen', { pct: 0.02 }), mod('damageDealt', 'increased', -0.2)] },
    { id: 'lantern-bearer', name: 'Lantern-Bearer', description: 'Keystone: prayers are always empowered (×1.5) but cost 50% more Ember.', type: 'keystone', tier: 5, branch: 'lantern', maxRank: 1, col: 7, requiresAny: ['lantern-light'], exclusiveGroup: 'oath-keystone',
      effects: [hook('alwaysEmpowered', { costMult: 1.5 })] },
  ]),
};

export default [reaver, shade, oathbound];
