/**
 * Phase 1 "small trees": tiers 1–3 of each class tree (SYSTEMS.md §5). Owner: Claude 3.
 * Layout: 3 branches × columns; pos.col 0–8, pos.row = tier-1 (UI grid).
 */
import type { EffectDef, SkillNodeDef, SkillTreeDef, StatModifier } from '@/core';

const mod = (stat: StatModifier['stat'], op: StatModifier['op'], value: number, condition?: StatModifier['condition']): EffectDef =>
  ({ kind: 'modifier', mod: condition ? { stat, op, value, condition } : { stat, op, value } });
const hook = (name: string, params?: Record<string, number>): EffectDef => ({ kind: 'hook', hook: name, params });
const grant = (spell: `spell:${string}`): EffectDef => ({ kind: 'grantAbility', spell });

type N = Omit<SkillNodeDef, 'costPerRank' | 'pos'> & { col: number };
const build = (nodes: N[]): SkillNodeDef[] =>
  nodes.map(({ col, ...n }) => ({ ...n, costPerRank: 1, pos: { col, row: n.tier - 1 } }));

const THRESHOLDS: SkillTreeDef['tierThresholds'] = [0, 5, 10, 15, 20];

const warden: SkillTreeDef = {
  id: 'skilltree:warden', name: 'The Shield-Sworn', description: 'Shield, Blade and Command.', treeKind: 'class', owner: 'class:warden',
  tierThresholds: THRESHOLDS,
  nodes: build([
    { id: 'stout', name: 'Stout', description: '+5% max HP per rank.', type: 'minor', tier: 1, branch: 'shield', maxRank: 3, col: 1, effects: [mod('maxHp', 'increased', 0.05)] },
    { id: 'honed-edge', name: 'Honed Edge', description: '+4% melee damage per rank.', type: 'minor', tier: 1, branch: 'blade', maxRank: 3, col: 4, effects: [mod('meleeDamage', 'increased', 0.04)] },
    { id: 'rallying-shout', name: 'Rallying Shout', description: 'Ability: for 6 s gain +20% damage and 25 Resolve.', type: 'ability', tier: 1, branch: 'command', maxRank: 1, col: 7, effects: [grant('spell:rallying-shout')] },
    { id: 'braced', name: 'Braced', description: 'Blocking costs 25% less stamina.', type: 'notable', tier: 2, branch: 'shield', maxRank: 1, col: 0, requiresAny: ['stout'], effects: [mod('blockEfficiency', 'flat', 0.25)] },
    { id: 'iron-skin', name: 'Iron Skin', description: '+12 armour per rank.', type: 'minor', tier: 2, branch: 'shield', maxRank: 3, col: 2, requiresAny: ['stout'], effects: [mod('armor', 'flat', 12)] },
    { id: 'riposte', name: 'Riposte', description: 'Ripostes deal ×1.8 instead of ×1.3 and refund 20 stamina.', type: 'notable', tier: 2, branch: 'blade', maxRank: 1, col: 3, requiresAny: ['honed-edge'], effects: [hook('riposteBoost', { mult: 1.8, stamina: 20 })] },
    { id: 'cleave', name: 'Cleave', description: 'Ability: a 150° sweep for 120% weapon damage.', type: 'ability', tier: 2, branch: 'blade', maxRank: 1, col: 5, requiresAny: ['honed-edge'], effects: [grant('spell:cleave')] },
    { id: 'second-wind', name: 'Second Wind', description: 'Below 30% HP, heal 25% over 5 s (90 s cooldown).', type: 'notable', tier: 2, branch: 'command', maxRank: 1, col: 7, requiresAny: ['rallying-shout'], effects: [hook('secondWind', { threshold: 0.3, heal: 0.25, durationMs: 5000, cooldownMs: 90000 })] },
    { id: 'unyielding', name: 'Unyielding', description: '+30% poise and +15 block stability.', type: 'notable', tier: 3, branch: 'shield', maxRank: 1, col: 0, requiresAny: ['braced', 'iron-skin'], effects: [mod('poise', 'increased', 0.3), mod('blockStability', 'flat', 15)] },
    { id: 'retaliation', name: 'Retaliation', description: 'Blocking deals 30% of the blocked damage back to the attacker.', type: 'notable', tier: 3, branch: 'shield', maxRank: 1, col: 2, requiresAll: ['braced'], effects: [hook('retaliation', { pct: 0.3 })] },
    { id: 'tempo', name: 'Tempo', description: '+4% attack speed per rank.', type: 'minor', tier: 3, branch: 'blade', maxRank: 2, col: 3, requiresAny: ['riposte', 'cleave'], effects: [mod('attackSpeed', 'increased', 0.04)] },
    { id: 'sunder', name: 'Sunder', description: 'Heavy attacks make the target Vulnerable (+25% damage taken) for 3 s.', type: 'notable', tier: 3, branch: 'blade', maxRank: 1, col: 5, requiresAny: ['riposte', 'cleave'], effects: [hook('sunder', { durationMs: 3000 })] },
    { id: 'war-banner', name: 'War Banner', description: 'Ability: plant a banner: +15% damage and +20 armour nearby for 8 s (40 Resolve).', type: 'ability', tier: 3, branch: 'command', maxRank: 1, col: 7, requiresAny: ['second-wind'], effects: [grant('spell:war-banner')] },
    { id: 'shield-mastery', name: 'Shield Mastery', description: '+20% block efficiency and +10% armour.', type: 'notable', tier: 4, branch: 'shield', maxRank: 1, col: 1, requiresAny: ['unyielding', 'retaliation'], effects: [mod('blockEfficiency', 'flat', 0.2), mod('armor', 'increased', 0.1)] },
    { id: 'executioner', name: 'Executioner', description: '+50% more damage to Staggered or Exposed enemies.', type: 'notable', tier: 4, branch: 'blade', maxRank: 1, col: 4, requiresAny: ['tempo', 'sunder'], effects: [mod('damageDealt', 'more', 0.5, { kind: 'any', of: [{ kind: 'targetHasStatus', status: 'stagger' }, { kind: 'targetHasStatus', status: 'exposed' }] })] },
    { id: 'stalwart-presence', name: 'Stalwart Presence', description: '−10% damage taken in combat and +2 HP regen.', type: 'notable', tier: 4, branch: 'command', maxRank: 1, col: 7, requiresAny: ['war-banner'], effects: [mod('damageTaken', 'increased', -0.1, { kind: 'inCombat', value: true }), mod('hpRegen', 'flat', 2)] },
    { id: 'living-fortress', name: 'Living Fortress', description: 'Keystone: you cannot dodge-roll. You block from every direction, with +50% armour and +30% block efficiency.', type: 'keystone', tier: 5, branch: 'shield', maxRank: 1, col: 1, requiresAny: ['shield-mastery'], exclusiveGroup: 'warden-keystone',
      effects: [hook('noDodge'), hook('omniBlock'), mod('armor', 'increased', 0.5), mod('blockEfficiency', 'flat', 0.3)] },
    { id: 'oath-of-the-blade', name: 'Oath of the Blade', description: 'Keystone: shields no longer work for you. +30% more melee damage and +10% attack speed.', type: 'keystone', tier: 5, branch: 'blade', maxRank: 1, col: 4, requiresAny: ['executioner'], exclusiveGroup: 'warden-keystone',
      effects: [hook('noShield'), mod('meleeDamage', 'more', 0.3), mod('attackSpeed', 'increased', 0.1)] },
    { id: 'last-stand', name: 'Last Stand', description: 'Keystone: −30% more damage taken below 50% HP and kills restore 5% HP; −15% max HP.', type: 'keystone', tier: 5, branch: 'command', maxRank: 1, col: 7, requiresAny: ['stalwart-presence'], exclusiveGroup: 'warden-keystone',
      effects: [mod('damageTaken', 'more', -0.3, { kind: 'hpBelow', pct: 0.5 }), mod('lifeOnKill', 'flat', 0.05), mod('maxHp', 'increased', -0.15)] },
  ]),
};

const ranger: SkillTreeDef = {
  id: 'skilltree:ranger', name: 'The Thornwise Path', description: 'Marksman, Trapper and Wilds.', treeKind: 'class', owner: 'class:ranger',
  tierThresholds: THRESHOLDS,
  nodes: build([
    { id: 'steady-hand', name: 'Steady Hand', description: '+4% ranged damage per rank.', type: 'minor', tier: 1, branch: 'marksman', maxRank: 3, col: 1, effects: [mod('rangedDamage', 'increased', 0.04)] },
    { id: 'volley', name: 'Volley', description: 'Ability: loose three arrows in a fan.', type: 'ability', tier: 1, branch: 'trapper', maxRank: 1, col: 4, effects: [grant('spell:volley')] },
    { id: 'fleet', name: 'Fleet', description: '+3% move speed per rank.', type: 'minor', tier: 1, branch: 'wilds', maxRank: 3, col: 7, effects: [mod('moveSpeed', 'increased', 0.03)] },
    { id: 'keen-arrows', name: 'Keen Arrows', description: '+2% crit chance per rank.', type: 'minor', tier: 2, branch: 'marksman', maxRank: 3, col: 0, requiresAny: ['steady-hand'], effects: [mod('critChance', 'flat', 0.02)] },
    { id: 'focused-draw', name: 'Focused Draw', description: 'Full draws grant +1 extra Focus.', type: 'notable', tier: 2, branch: 'marksman', maxRank: 1, col: 2, requiresAny: ['steady-hand'], effects: [hook('focusedDraw', { extra: 1 })] },
    { id: 'serrated-arrows', name: 'Serrated Arrows', description: 'Arrow hits add 15 Bleed buildup.', type: 'notable', tier: 2, branch: 'trapper', maxRank: 1, col: 3, requiresAny: ['volley'], effects: [{ kind: 'applyStatus', trigger: 'onHit', status: 'bleed', target: 'target', buildup: 15 }] },
    { id: 'caltrops', name: 'Caltrops', description: 'Ability: scatter caltrops that slow and bleed.', type: 'ability', tier: 2, branch: 'trapper', maxRank: 1, col: 5, requiresAny: ['volley'], effects: [grant('spell:caltrops')] },
    { id: 'quick-nock', name: 'Quick Nock', description: 'Dodging costs 15% less stamina and your next shot draws instantly.', type: 'notable', tier: 2, branch: 'wilds', maxRank: 1, col: 7, requiresAny: ['fleet'], effects: [mod('dodgeCost', 'increased', -0.15), hook('quickNock')] },
    { id: 'deadly-aim', name: 'Deadly Aim', description: '+25% crit multiplier.', type: 'notable', tier: 3, branch: 'marksman', maxRank: 1, col: 0, requiresAny: ['keen-arrows', 'focused-draw'], effects: [mod('critMultiplier', 'flat', 0.25)] },
    { id: 'piercing-shot', name: 'Piercing Shot', description: 'Ability: a shot that passes through 3 enemies.', type: 'ability', tier: 3, branch: 'marksman', maxRank: 1, col: 2, requiresAny: ['focused-draw'], effects: [grant('spell:piercing-shot')] },
    { id: 'hunters-patience', name: 'Hunter’s Patience', description: '+20% damage against Rooted or Slowed enemies.', type: 'notable', tier: 3, branch: 'trapper', maxRank: 1, col: 4, requiresAny: ['serrated-arrows', 'caltrops'],
      effects: [mod('damageDealt', 'increased', 0.2, { kind: 'any', of: [{ kind: 'targetHasStatus', status: 'root' }, { kind: 'targetHasStatus', status: 'slow' }] })] },
    { id: 'thornwise-remedies', name: 'Thornwise Remedies', description: '+15% healing received and +1 HP regen.', type: 'minor', tier: 3, branch: 'wilds', maxRank: 1, col: 6, requiresAny: ['quick-nock'], effects: [mod('healingReceived', 'increased', 0.15), mod('hpRegen', 'flat', 1)] },
    { id: 'beastbane', name: 'Beastbane', description: '+15% damage against beasts.', type: 'minor', tier: 3, branch: 'wilds', maxRank: 2, col: 8, requiresAny: ['quick-nock'], effects: [mod('damageDealt', 'increased', 0.15, { kind: 'targetFamily', family: 'beast' })] },
    { id: 'swift-quiver', name: 'Swift Quiver', description: '+12% attack speed with bows.', type: 'notable', tier: 4, branch: 'marksman', maxRank: 1, col: 1, requiresAny: ['deadly-aim', 'piercing-shot'], effects: [mod('attackSpeed', 'increased', 0.12, { kind: 'weaponFamily', family: 'bow' })] },
    { id: 'snare-master', name: 'Snare Master', description: '+25% Bleed and Poison buildup.', type: 'notable', tier: 4, branch: 'trapper', maxRank: 1, col: 4, requiresAny: ['hunters-patience'], effects: [mod('buildup.bleed', 'increased', 0.25), mod('buildup.poison', 'increased', 0.25)] },
    { id: 'evasion', name: 'Evasion', description: '+20% dodge distance and −15% dodge cost.', type: 'notable', tier: 4, branch: 'wilds', maxRank: 1, col: 7, requiresAny: ['thornwise-remedies', 'beastbane'], effects: [mod('dodgeDistance', 'increased', 0.2), mod('dodgeCost', 'increased', -0.15)] },
    { id: 'deadshot', name: 'Deadshot', description: 'Keystone: +60% crit multiplier and +8% crit chance; −15% attack speed.', type: 'keystone', tier: 5, branch: 'marksman', maxRank: 1, col: 1, requiresAny: ['swift-quiver'], exclusiveGroup: 'ranger-keystone',
      effects: [mod('critMultiplier', 'flat', 0.6), mod('critChance', 'flat', 0.08), mod('attackSpeed', 'increased', -0.15)] },
    { id: 'apex-trapper', name: 'Apex Trapper', description: 'Keystone: +35% more damage to Rooted, Slowed or Bleeding enemies; −15% max HP.', type: 'keystone', tier: 5, branch: 'trapper', maxRank: 1, col: 4, requiresAny: ['snare-master'], exclusiveGroup: 'ranger-keystone',
      effects: [mod('damageDealt', 'more', 0.35, { kind: 'any', of: [{ kind: 'targetHasStatus', status: 'root' }, { kind: 'targetHasStatus', status: 'slow' }, { kind: 'targetHasStatus', status: 'bleed' }] }), mod('maxHp', 'increased', -0.15)] },
    { id: 'wild-heart', name: 'Wild Heart', description: 'Keystone: +20% max HP, +3 HP regen and +10% move speed; −10% damage.', type: 'keystone', tier: 5, branch: 'wilds', maxRank: 1, col: 7, requiresAny: ['evasion'], exclusiveGroup: 'ranger-keystone',
      effects: [mod('maxHp', 'increased', 0.2), mod('hpRegen', 'flat', 3), mod('moveSpeed', 'increased', 0.1), mod('damageDealt', 'increased', -0.1)] },
  ]),
};

const arcanist: SkillTreeDef = {
  id: 'skilltree:arcanist', name: 'The Ley-Scholar', description: 'Ash, Lore and Ward.', treeKind: 'class', owner: 'class:arcanist',
  tierThresholds: THRESHOLDS,
  nodes: build([
    { id: 'searing-mind', name: 'Searing Mind', description: '+5% Ash spell damage per rank.', type: 'minor', tier: 1, branch: 'ash', maxRank: 3, col: 1, effects: [mod('school.ash', 'increased', 0.05)] },
    { id: 'ley-reserves', name: 'Ley Reserves', description: '+5% max Ember per rank.', type: 'minor', tier: 1, branch: 'lore', maxRank: 3, col: 4, effects: [mod('maxMana', 'increased', 0.05)] },
    { id: 'flame-ward', name: 'Flame Ward', description: 'Ability: a ward that absorbs 20% max HP and burns attackers.', type: 'ability', tier: 1, branch: 'ward', maxRank: 1, col: 7, effects: [grant('spell:flame-ward')] },
    { id: 'ember-burst', name: 'Ember Burst', description: 'Ability: fire erupts around you.', type: 'ability', tier: 2, branch: 'ash', maxRank: 1, col: 0, requiresAny: ['searing-mind'], effects: [grant('spell:ember-burst')] },
    { id: 'kindling', name: 'Kindling', description: '+15% damage against Burning enemies.', type: 'notable', tier: 2, branch: 'ash', maxRank: 1, col: 2, requiresAny: ['searing-mind'], effects: [mod('damageDealt', 'increased', 0.15, { kind: 'targetHasStatus', status: 'burn' })] },
    { id: 'quickened-cast', name: 'Quickened Cast', description: '+5% cast speed per rank.', type: 'minor', tier: 2, branch: 'lore', maxRank: 2, col: 4, requiresAny: ['ley-reserves'], effects: [mod('castSpeed', 'increased', 0.05)] },
    { id: 'ley-flow', name: 'Ley Flow', description: 'Spell kills restore 8 Ember.', type: 'notable', tier: 2, branch: 'lore', maxRank: 1, col: 5, requiresAny: ['ley-reserves'], effects: [hook('leyFlow', { amount: 8 })] },
    { id: 'cinder-tolerance', name: 'Cinder Tolerance', description: 'Overdraw costs 30% less HP and +10% fire resistance.', type: 'notable', tier: 2, branch: 'ward', maxRank: 1, col: 7, requiresAny: ['flame-ward'], effects: [hook('cinderTolerance', { pct: 0.3 }), mod('resist.fire', 'flat', 0.1)] },
    { id: 'pyromancy', name: 'Pyromancy', description: '+25% Burn buildup per rank.', type: 'minor', tier: 3, branch: 'ash', maxRank: 2, col: 0, requiresAny: ['ember-burst', 'kindling'], effects: [mod('buildup.burn', 'increased', 0.25)] },
    { id: 'conflagrate', name: 'Conflagrate', description: 'Ability: a column of fire at a point.', type: 'ability', tier: 3, branch: 'ash', maxRank: 1, col: 2, requiresAny: ['kindling'], effects: [grant('spell:conflagrate')] },
    { id: 'ley-sight', name: 'Ley-Sight', description: 'Your spells can critically strike.', type: 'notable', tier: 3, branch: 'lore', maxRank: 1, col: 4, requiresAny: ['quickened-cast', 'ley-flow'], effects: [hook('spellCrit')] },
    { id: 'arcane-springs', name: 'Arcane Springs', description: '+15% Ember regen per rank.', type: 'minor', tier: 3, branch: 'lore', maxRank: 2, col: 5, requiresAny: ['ley-flow'], effects: [mod('manaRegen', 'increased', 0.15)] },
    { id: 'ashen-skin', name: 'Ashen Skin', description: '+20 armour and +10% max HP.', type: 'notable', tier: 3, branch: 'ward', maxRank: 1, col: 7, requiresAny: ['cinder-tolerance'], effects: [mod('armor', 'flat', 20), mod('maxHp', 'increased', 0.1)] },
    { id: 'elemental-mastery', name: 'Elemental Mastery', description: '+12% fire, frost and lightning damage.', type: 'notable', tier: 4, branch: 'ash', maxRank: 1, col: 1, requiresAny: ['pyromancy', 'conflagrate'], effects: [mod('damage.fire', 'increased', 0.12), mod('damage.frost', 'increased', 0.12), mod('damage.lightning', 'increased', 0.12)] },
    { id: 'quickening', name: 'Quickening', description: '+10% cast speed and +5% cooldown reduction.', type: 'notable', tier: 4, branch: 'lore', maxRank: 1, col: 4, requiresAny: ['ley-sight', 'arcane-springs'], effects: [mod('castSpeed', 'increased', 0.1), mod('cooldownReduction', 'flat', 0.05)] },
    { id: 'ley-ward', name: 'Ley Ward', description: '+15% max Ember and +15 armour.', type: 'notable', tier: 4, branch: 'ward', maxRank: 1, col: 7, requiresAny: ['ashen-skin'], effects: [mod('maxMana', 'increased', 0.15), mod('armor', 'flat', 15)] },
    { id: 'cinder-heart', name: 'Cinder Heart', description: 'Keystone: every cast overdraws (Ember costs are paid in HP); +35% more spell damage.', type: 'keystone', tier: 5, branch: 'ash', maxRank: 1, col: 1, requiresAny: ['elemental-mastery'], exclusiveGroup: 'arcanist-keystone',
      effects: [hook('alwaysOverdraw'), mod('spellDamage', 'more', 0.35)] },
    { id: 'ley-conduit', name: 'Ley Conduit', description: 'Keystone: +60% Ember regen and +20% max Ember; −20% max HP.', type: 'keystone', tier: 5, branch: 'lore', maxRank: 1, col: 4, requiresAny: ['quickening'], exclusiveGroup: 'arcanist-keystone',
      effects: [mod('manaRegen', 'increased', 0.6), mod('maxMana', 'increased', 0.2), mod('maxHp', 'increased', -0.2)] },
    { id: 'stone-mind', name: 'Stone Mind', description: 'Keystone: +40% armour and +15% max HP; −10% spell damage.', type: 'keystone', tier: 5, branch: 'ward', maxRank: 1, col: 7, requiresAny: ['ley-ward'], exclusiveGroup: 'arcanist-keystone',
      effects: [mod('armor', 'increased', 0.4), mod('maxHp', 'increased', 0.15), mod('spellDamage', 'increased', -0.1)] },
  ]),
};

export default [warden, ranger, arcanist];
