/**
 * Subclass trees (SYSTEMS.md §3.1), unlocked at level 15: 8 nodes each, tier gates 0/3/6/9/12, one capstone.
 * Owner: Claude 3.
 */
import type { ClassId, EffectDef, SkillNodeDef, SkillTreeDef, StatModifier } from '@/core';

const mod = (stat: StatModifier['stat'], op: StatModifier['op'], value: number, condition?: StatModifier['condition']): EffectDef =>
  ({ kind: 'modifier', mod: condition ? { stat, op, value, condition } : { stat, op, value } });
const hook = (name: string, params?: Record<string, number>): EffectDef => ({ kind: 'hook', hook: name, params });

type N = [id: string, name: string, description: string, type: SkillNodeDef['type'], tier: 1 | 2 | 3 | 4 | 5, col: number, maxRank: number, effects: EffectDef[], requires?: string[]];
const T: SkillTreeDef['tierThresholds'] = [0, 3, 6, 9, 12];

function sub(id: string, name: string, owner: ClassId, description: string, nodes: N[]): SkillTreeDef {
  return {
    id: `skilltree:${id}`, name, description, treeKind: 'subclass', owner, tierThresholds: T,
    nodes: nodes.map(([nid, nname, desc, type, tier, col, maxRank, effects, requires]) => ({
      id: nid, name: nname, description: desc, type, tier, branch: id, maxRank, costPerRank: 1, effects,
      requiresAny: requires, pos: { col, row: tier - 1 },
    })),
  };
}

const trees: SkillTreeDef[] = [
  sub('bulwark', 'Bulwark', 'class:warden', 'Taunts, tower shields and damage return.', [
    ['wall', 'The Wall', '+20% block efficiency.', 'notable', 1, 4, 1, [mod('blockEfficiency', 'flat', 0.2)]],
    ['bastion', 'Bastion', '+15 armour per rank.', 'minor', 1, 2, 3, [mod('armor', 'flat', 15)]],
    ['thorns', 'Thorned Rim', 'Blocking returns 30% of blocked damage.', 'notable', 2, 4, 1, [hook('retaliation', { pct: 0.3 })], ['wall']],
    ['stand-fast', 'Stand Fast', '+20% poise per rank.', 'minor', 2, 6, 2, [mod('poise', 'increased', 0.2)], ['wall', 'bastion']],
    ['resolute', 'Resolute', '−10% damage taken.', 'notable', 3, 4, 1, [mod('damageTaken', 'increased', -0.1)], ['thorns', 'stand-fast']],
    ['iron-heart', 'Iron Heart', '+10% max HP per rank.', 'minor', 3, 2, 2, [mod('maxHp', 'increased', 0.1)], ['thorns']],
    ['parry-master', 'Parry Master', '+60 ms parry window.', 'notable', 4, 4, 1, [mod('parryWindow', 'flat', 60)], ['resolute']],
    ['unbreakable', 'Unbreakable', 'Capstone: −25% damage taken; −10% damage dealt.', 'keystone', 5, 4, 1, [mod('damageTaken', 'more', -0.25), mod('damageDealt', 'increased', -0.1)], ['parry-master']],
  ]),
  sub('vanguard', 'Vanguard', 'class:warden', 'Charges and war-banner auras.', [
    ['forward', 'Forward!', '+8% move speed.', 'minor', 1, 4, 1, [mod('moveSpeed', 'increased', 0.08)]],
    ['banner-bearer', 'Banner-Bearer', '+10% damage in combat.', 'notable', 1, 2, 1, [mod('damageDealt', 'increased', 0.1, { kind: 'inCombat', value: true })]],
    ['spearhead', 'Spearhead', '+6% melee damage per rank.', 'minor', 2, 4, 3, [mod('meleeDamage', 'increased', 0.06)], ['forward', 'banner-bearer']],
    ['rally', 'Rally', 'Kills restore 3% HP.', 'notable', 2, 6, 1, [mod('lifeOnKill', 'flat', 0.03)], ['forward']],
    ['shock-troop', 'Shock Troop', 'Heavy attacks make the target Vulnerable for 4 s.', 'notable', 3, 4, 1, [hook('sunder', { durationMs: 4000 })], ['spearhead']],
    ['drill', 'Drill', '+4% attack speed per rank.', 'minor', 3, 2, 2, [mod('attackSpeed', 'increased', 0.04)], ['spearhead']],
    ['warlord', 'Warlord', '+10% damage and +10% armour.', 'notable', 4, 4, 1, [mod('damageDealt', 'increased', 0.1), mod('armor', 'increased', 0.1)], ['shock-troop', 'drill']],
    ['standard', 'The Standard', 'Capstone: +25% more damage in combat; −15% max HP.', 'keystone', 5, 4, 1, [mod('damageDealt', 'more', 0.25, { kind: 'inCombat', value: true }), mod('maxHp', 'increased', -0.15)], ['warlord']],
  ]),
  sub('deadeye', 'Deadeye', 'class:ranger', 'Long shots and crits.', [
    ['eagle-eye', 'Eagle Eye', '+5% crit chance.', 'notable', 1, 4, 1, [mod('critChance', 'flat', 0.05)]],
    ['steady', 'Steady', '+5% ranged damage per rank.', 'minor', 1, 2, 3, [mod('rangedDamage', 'increased', 0.05)]],
    ['long-shot', 'Long Shot', 'Arrows deal up to +30% damage the farther they fly.', 'notable', 2, 4, 1, [hook('longShot', { pct: 0.3 })], ['eagle-eye']],
    ['lethal', 'Lethal', '+15% crit multiplier per rank.', 'minor', 2, 6, 2, [mod('critMultiplier', 'flat', 0.15)], ['eagle-eye', 'steady']],
    ['headhunter', 'Headhunter', '+25% damage to elites and bosses.', 'notable', 3, 4, 1, [mod('damageDealt', 'increased', 0.25, { kind: 'any', of: [{ kind: 'targetRank', rank: 'elite' }, { kind: 'targetRank', rank: 'boss' }, { kind: 'targetRank', rank: 'champion' }] })], ['long-shot']],
    ['patience', 'Patience', '+1 Focus on full draw.', 'minor', 3, 2, 1, [hook('focusedDraw', { extra: 1 })], ['long-shot']],
    ['marked-prey', 'Marked Prey', 'Crits make the target Vulnerable for 3 s.', 'notable', 4, 4, 1, [{ kind: 'applyStatus', trigger: 'onCrit', status: 'vulnerable', target: 'target', durationMs: 3000 }], ['headhunter', 'patience']],
    ['one-shot', 'One Shot', 'Capstone: +40% more ranged damage; −20% attack speed.', 'keystone', 5, 4, 1, [mod('rangedDamage', 'more', 0.4), mod('attackSpeed', 'increased', -0.2)], ['marked-prey']],
  ]),
  sub('beastwarden', 'Beastwarden', 'class:ranger', 'A Kethra-blessed spirit hawk fights beside you.', [
    ['spirit-hawk', 'Spirit Hawk', 'A spirit hawk strikes your foe every 3 s for 40% of your weapon damage.', 'notable', 1, 4, 1, [hook('companionStrike', { pct: 0.4, everyMs: 3000 })]],
    ['wild-kin', 'Wild Kin', '+5% max HP per rank.', 'minor', 1, 2, 3, [mod('maxHp', 'increased', 0.05)]],
    ['talons', 'Talons', 'The hawk’s strikes add 25 Bleed buildup.', 'notable', 2, 4, 1, [hook('companionBleed', { buildup: 25 })], ['spirit-hawk']],
    ['pack-sense', 'Pack Sense', '+5% damage per rank.', 'minor', 2, 6, 2, [mod('damageDealt', 'increased', 0.05)], ['spirit-hawk', 'wild-kin']],
    ['swift-wings', 'Swift Wings', 'The hawk strikes every 2 s.', 'notable', 3, 4, 1, [hook('companionSpeed', { everyMs: 2000 })], ['talons']],
    ['thornhide', 'Thornhide', '+15% status resist.', 'minor', 3, 2, 1, [mod('statusResist', 'flat', 0.15)], ['talons']],
    ['kethras-favour', 'Kethra’s Favour', '+2 HP regen and +10% healing received.', 'notable', 4, 4, 1, [mod('hpRegen', 'flat', 2), mod('healingReceived', 'increased', 0.1)], ['swift-wings', 'thornhide']],
    ['great-hunt', 'The Great Hunt', 'Capstone: the hawk deals 100% weapon damage; you deal 10% less.', 'keystone', 5, 4, 1, [hook('companionPower', { pct: 1.0 }), mod('damageDealt', 'increased', -0.1)], ['kethras-favour']],
  ]),
  sub('elementalist', 'Elementalist', 'class:arcanist', 'Three-school combos; Attunement up to 5.', [
    ['deep-attunement', 'Deep Attunement', 'Attunement can reach 5 stacks.', 'notable', 1, 4, 1, [hook('attunementMax', { max: 5 })]],
    ['elemental-lore', 'Elemental Lore', '+5% spell damage per rank.', 'minor', 1, 2, 3, [mod('spellDamage', 'increased', 0.05)]],
    ['fire-and-ice', 'Fire and Ice', '+15% fire and frost damage.', 'notable', 2, 4, 1, [mod('damage.fire', 'increased', 0.15), mod('damage.frost', 'increased', 0.15)], ['deep-attunement']],
    ['ley-well', 'Ley Well', '+10% max Ember per rank.', 'minor', 2, 6, 2, [mod('maxMana', 'increased', 0.1)], ['deep-attunement', 'elemental-lore']],
    ['catalyst', 'Catalyst', '+20% status buildup from spells.', 'notable', 3, 4, 1, [mod('buildup.burn', 'increased', 0.2), mod('buildup.frozen', 'increased', 0.2), mod('buildup.shock', 'increased', 0.2)], ['fire-and-ice']],
    ['quick-mind', 'Quick Mind', '+5% cooldown reduction.', 'minor', 3, 2, 1, [mod('cooldownReduction', 'flat', 0.05)], ['fire-and-ice']],
    ['prism', 'Prism', 'Spells can crit (Ley-Sight) and +10% crit chance.', 'notable', 4, 4, 1, [hook('spellCrit'), mod('critChance', 'flat', 0.1)], ['catalyst', 'quick-mind']],
    ['avatar', 'Avatar of the Sparks', 'Capstone: +30% more spell damage; spells cost 30% more Ember.', 'keystone', 5, 4, 1, [mod('spellDamage', 'more', 0.3), hook('spellCostMult', { mult: 1.3 })], ['prism']],
  ]),
  sub('spellblade', 'Spellblade', 'class:arcanist', 'Steel and ember: melee hits cut spell cooldowns.', [
    ['blade-and-word', 'Blade and Word', 'Melee hits reduce spell cooldowns by 0.3 s.', 'notable', 1, 4, 1, [hook('spellbladeCdr', { ms: 300 })], undefined],
    ['arming', 'Arming', 'Proficiency with swords; +5% melee damage per rank.', 'minor', 1, 2, 3, [{ kind: 'proficiency', weapon: 'sword' }, mod('meleeDamage', 'increased', 0.05)]],
    ['ember-edge', 'Ember Edge', 'Weapon hits deal +20% as fire.', 'notable', 2, 4, 1, [{ kind: 'hook', hook: 'convertPhysical', params: { pct: 0.2, to: 'fire' } }], ['blade-and-word']],
    ['warded-steel', 'Warded Steel', '+10 armour per rank; proficiency with medium armour.', 'minor', 2, 6, 2, [mod('armor', 'flat', 10), { kind: 'proficiency', armor: 'medium' }], ['blade-and-word', 'arming']],
    ['spell-strike', 'Spell-Strike', '+15% spell damage in combat.', 'notable', 3, 4, 1, [mod('spellDamage', 'increased', 0.15, { kind: 'inCombat', value: true })], ['ember-edge']],
    ['battle-mage', 'Battle-Mage', '+10% max HP.', 'minor', 3, 2, 1, [mod('maxHp', 'increased', 0.1)], ['ember-edge']],
    ['flowing', 'Flowing Form', 'Melee hits restore 2 Ember.', 'notable', 4, 4, 1, [hook('emberOnHit', { amount: 2 })], ['spell-strike', 'battle-mage']],
    ['emberwarden', 'Emberwarden', 'Capstone: melee cuts cooldowns by 0.6 s; −15% spell damage.', 'keystone', 5, 4, 1, [hook('spellbladeCdr', { ms: 600 }), mod('spellDamage', 'increased', -0.15)], ['flowing']],
  ]),
  sub('bloodletter', 'Bloodletter', 'class:reaver', 'Bleed, leech, and HP-cost scaling.', [
    ['haemophage', 'Haemophage', 'Heal for 5% of damage dealt to Bleeding enemies.', 'notable', 1, 4, 1, [hook('bleedLeech', { pct: 0.05 })]],
    ['serration', 'Serration', '+20% Bleed buildup per rank.', 'minor', 1, 2, 3, [mod('buildup.bleed', 'increased', 0.2)]],
    ['exsanguinate', 'Exsanguinate', '+20% damage against Bleeding targets.', 'notable', 2, 4, 1, [mod('damageDealt', 'increased', 0.2, { kind: 'targetHasStatus', status: 'bleed' })], ['haemophage']],
    ['blood-rite', 'Blood Rite', '+5% max HP per rank.', 'minor', 2, 6, 2, [mod('maxHp', 'increased', 0.05)], ['haemophage', 'serration']],
    ['crimson-tide', 'Crimson Tide', 'Bloodcraft costs 20% less HP.', 'notable', 3, 4, 1, [hook('bloodPrice', { pct: 0.2 })], ['exsanguinate']],
    ['life-tap', 'Life Tap', '+2% life leech.', 'minor', 3, 2, 1, [mod('lifeLeech', 'flat', 0.02)], ['exsanguinate']],
    ['vein-ripper', 'Vein-Ripper', 'Hits add 15 Bleed buildup.', 'notable', 4, 4, 1, [{ kind: 'applyStatus', trigger: 'onHit', status: 'bleed', target: 'target', buildup: 15 }], ['crimson-tide', 'life-tap']],
    ['sanguine-lord', 'Sanguine Lord', 'Capstone: +6% life leech; healing from all other sources −40%.', 'keystone', 5, 4, 1, [mod('lifeLeech', 'flat', 0.06), mod('healingReceived', 'increased', -0.4)], ['vein-ripper']],
  ]),
  sub('juggernaut', 'Juggernaut', 'class:reaver', 'Poise and unstoppable heavies.', [
    ['immovable', 'Immovable', '+40% poise.', 'notable', 1, 4, 1, [mod('poise', 'increased', 0.4)]],
    ['plated', 'Plated', '+15 armour per rank.', 'minor', 1, 2, 3, [mod('armor', 'flat', 15)]],
    ['crushing', 'Crushing', 'Heavies make the target Vulnerable (Sunder).', 'notable', 2, 4, 1, [hook('sunder', { durationMs: 3000 })], ['immovable']],
    ['bulk', 'Bulk', '+8% max HP per rank.', 'minor', 2, 6, 2, [mod('maxHp', 'increased', 0.08)], ['immovable', 'plated']],
    ['earthshaker', 'Earthshaker', '+25% damage to Staggered enemies.', 'notable', 3, 4, 1, [mod('damageDealt', 'increased', 0.25, { kind: 'targetHasStatus', status: 'stagger' })], ['crushing']],
    ['heavy-hands', 'Heavy Hands', '+15% equip load.', 'minor', 3, 2, 1, [mod('equipLoad', 'increased', 0.15)], ['crushing']],
    ['bedrock', 'Bedrock', '+20% status resist.', 'notable', 4, 4, 1, [mod('statusResist', 'flat', 0.2)], ['earthshaker', 'heavy-hands']],
    ['avalanche', 'Avalanche', 'Capstone: +30% more melee damage; −20% move speed.', 'keystone', 5, 4, 1, [mod('meleeDamage', 'more', 0.3), mod('moveSpeed', 'increased', -0.2)], ['bedrock']],
  ]),
  sub('assassin', 'Assassin', 'class:shade', 'Stealth burst and executes.', [
    ['silent-death', 'Silent Death', 'Stealth strikes deal +50% more.', 'notable', 1, 4, 1, [hook('stealthBonus', { more: 0.5 })]],
    ['precision', 'Precision', '+3% crit chance per rank.', 'minor', 1, 2, 3, [mod('critChance', 'flat', 0.03)]],
    ['coup-de-grace', 'Coup de Grâce', '+40% damage to enemies below 30% HP.', 'notable', 2, 4, 1, [hook('executeBonus', { threshold: 0.3, pct: 0.4 })], ['silent-death']],
    ['vanish', 'Vanish', 'Kills grant Stealth for 1.5 s.', 'notable', 2, 6, 1, [{ kind: 'applyStatus', trigger: 'onKill', status: 'stealth', target: 'self', durationMs: 1500 }], ['silent-death', 'precision']],
    ['cruel', 'Cruel', '+20% crit multiplier.', 'minor', 3, 4, 1, [mod('critMultiplier', 'flat', 0.2)], ['coup-de-grace']],
    ['shadow-feet', 'Shadow Feet', '−20% dodge cost.', 'minor', 3, 2, 1, [mod('dodgeCost', 'increased', -0.2)], ['coup-de-grace']],
    ['kingslayer', 'Kingslayer', '+20% damage to elites and bosses.', 'notable', 4, 4, 1, [mod('damageDealt', 'increased', 0.2, { kind: 'any', of: [{ kind: 'targetRank', rank: 'elite' }, { kind: 'targetRank', rank: 'boss' }] })], ['cruel', 'shadow-feet']],
    ['death-from-shadow', 'Death from Shadow', 'Capstone: stealth strikes deal +100% more; −25% max HP.', 'keystone', 5, 4, 1, [hook('stealthBonus', { more: 1.0 }), mod('maxHp', 'increased', -0.25)], ['kingslayer']],
  ]),
  sub('hexblade', 'Hexblade', 'class:shade', 'Umbral curses on dagger hits.', [
    ['hex', 'Hex', 'Hits have a 25% chance to Weaken the target for 4 s.', 'notable', 1, 4, 1, [{ kind: 'applyStatus', trigger: 'onHit', status: 'weaken', target: 'target', durationMs: 4000, chance: 0.25 }]],
    ['veil-lore', 'Veil Lore', '+8% shadow damage per rank.', 'minor', 1, 2, 3, [mod('damage.shadow', 'increased', 0.08)]],
    ['umbral-edge', 'Umbral Edge', 'Weapon hits deal +20% as shadow.', 'notable', 2, 4, 1, [{ kind: 'hook', hook: 'convertPhysical', params: { pct: 0.2, to: 'shadow' } }], ['hex']],
    ['grey-robes', 'Grey Robes', '+10% status resist per rank.', 'minor', 2, 6, 2, [mod('statusResist', 'flat', 0.1)], ['hex', 'veil-lore']],
    ['doom', 'Doom', 'Crits make the target Vulnerable for 3 s.', 'notable', 3, 4, 1, [{ kind: 'applyStatus', trigger: 'onCrit', status: 'vulnerable', target: 'target', durationMs: 3000 }], ['umbral-edge']],
    ['siphon', 'Siphon', '+2% life leech.', 'minor', 3, 2, 1, [mod('lifeLeech', 'flat', 0.02)], ['umbral-edge']],
    ['malediction', 'Malediction', '+20% damage to Weakened targets.', 'notable', 4, 4, 1, [mod('damageDealt', 'increased', 0.2, { kind: 'targetHasStatus', status: 'weaken' })], ['doom', 'siphon']],
    ['morrows-hand', 'Morrow’s Hand', 'Capstone: every hit Weakens; −15% max HP.', 'keystone', 5, 4, 1, [{ kind: 'applyStatus', trigger: 'onHit', status: 'weaken', target: 'target', durationMs: 4000 }, mod('maxHp', 'increased', -0.15)], ['malediction']],
  ]),
  sub('lightbringer', 'Lightbringer', 'class:oathbound', 'Heals, wards and auras.', [
    ['mercy', 'Mercy', '+20% healing done and received.', 'notable', 1, 4, 1, [mod('healingDone', 'increased', 0.2), mod('healingReceived', 'increased', 0.2)]],
    ['lantern-glow', 'Lantern Glow', '+1 HP regen per rank.', 'minor', 1, 2, 3, [mod('hpRegen', 'flat', 1)]],
    ['bright-ward', 'Bright Ward', 'Wards you cast are 30% stronger.', 'notable', 2, 4, 1, [hook('wardBoost', { pct: 0.3 })], ['mercy']],
    ['pilgrims-faith', 'Pilgrim’s Faith', '+1 Hearth Draught charge.', 'minor', 2, 6, 1, [mod('draughtCharges', 'flat', 1)], ['mercy', 'lantern-glow']],
    ['beacon', 'Beacon', '+15% Radiance damage.', 'notable', 3, 4, 1, [mod('school.radiance', 'increased', 0.15)], ['bright-ward']],
    ['serenity', 'Serenity', '+15% Ember regen.', 'minor', 3, 2, 1, [mod('manaRegen', 'increased', 0.15)], ['bright-ward']],
    ['saints-light', 'Saint’s Light', 'Kills restore 5% HP.', 'notable', 4, 4, 1, [mod('lifeOnKill', 'flat', 0.05)], ['beacon', 'serenity']],
    ['living-lantern', 'Living Lantern', 'Capstone: regenerate 3% HP per second in combat; −25% damage dealt.', 'keystone', 5, 4, 1, [hook('percentRegen', { pct: 0.03 }), mod('damageDealt', 'increased', -0.25)], ['saints-light']],
  ]),
  sub('inquisitor', 'Inquisitor', 'class:oathbound', 'The Order of the Wick: Radiance damage, anti-Mire, anti-mage.', [
    ['wick-oath', 'Wick-Oath', '+25% damage against the Hollowed and Unwrought.', 'notable', 1, 4, 1, [mod('damageDealt', 'increased', 0.25, { kind: 'any', of: [{ kind: 'targetVariant', variant: 'hollowed' }, { kind: 'targetFamily', family: 'unwrought' }] })]],
    ['tempered', 'Tempered', '+5% Radiance damage per rank.', 'minor', 1, 2, 3, [mod('school.radiance', 'increased', 0.05)]],
    ['purge', 'Purge', 'Hits have a 50% chance to make the target Vulnerable for 3 s.', 'notable', 2, 4, 1, [{ kind: 'applyStatus', trigger: 'onHit', status: 'vulnerable', target: 'target', durationMs: 3000, chance: 0.5 }], ['wick-oath']],
    ['witchfinder', 'Witchfinder', '+10% shadow resistance per rank.', 'minor', 2, 6, 2, [mod('resist.shadow', 'flat', 0.1)], ['wick-oath', 'tempered']],
    ['brand', 'Brand', 'Weapon hits deal +20% as radiant.', 'notable', 3, 4, 1, [{ kind: 'hook', hook: 'convertPhysical', params: { pct: 0.2, to: 'radiant' } }], ['purge']],
    ['zealotry', 'Zealotry', '+5% attack and cast speed.', 'minor', 3, 2, 1, [mod('attackSpeed', 'increased', 0.05), mod('castSpeed', 'increased', 0.05)], ['purge']],
    ['pyre-law', 'Pyre Law', '+15% fire damage.', 'notable', 4, 4, 1, [mod('damage.fire', 'increased', 0.15)], ['brand', 'zealotry']],
    ['the-wick', 'The Wick Burns', 'Capstone: +35% more radiant damage; −20% healing received.', 'keystone', 5, 4, 1, [mod('damage.radiant', 'more', 0.35), mod('healingReceived', 'increased', -0.2)], ['pyre-law']],
  ]),
];

export default trees;
