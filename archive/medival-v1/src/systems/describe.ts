/**
 * Human-readable text for effects, modifiers and stats (tooltips, character creation).
 */
import { Registry } from '@/core';
import type { CombatCondition, EffectDef, StatId, StatModifier } from '@/core';

const LABEL: Record<string, string> = {
  might: 'Might', finesse: 'Finesse', vigor: 'Vigor', intellect: 'Intellect', will: 'Will',
  maxHp: 'Max HP', maxStamina: 'Max Stamina', maxMana: 'Max Ember', hpRegen: 'HP regen', staminaRegen: 'Stamina regen',
  manaRegen: 'Ember regen', armor: 'Armour', poise: 'Poise', moveSpeed: 'Move speed', attackSpeed: 'Attack speed',
  castSpeed: 'Cast speed', critChance: 'Crit chance', critMultiplier: 'Crit multiplier', cooldownReduction: 'Cooldown reduction',
  blockEfficiency: 'Block efficiency', blockStability: 'Block stability', parryWindow: 'Parry window', dodgeCost: 'Dodge cost',
  dodgeDistance: 'Dodge distance', equipLoad: 'Equip load', healingReceived: 'Healing received', healingDone: 'Healing done',
  lifeOnKill: 'Life on kill', lifeLeech: 'Life leech', statusResist: 'Status resist', damageTaken: 'Damage taken',
  damageDealt: 'Damage', meleeDamage: 'Melee damage', rangedDamage: 'Ranged damage', spellDamage: 'Spell damage',
  itemFind: 'Item find', goldFind: 'Gold find', xpGain: 'XP gain', draughtCharges: 'Hearth Draught charges', abilitySlots: 'Ability slots',
};
const SCHOOL: Record<string, string> = { ash: 'Ash', rime: 'Rime', storm: 'Storm', radiance: 'Radiance', umbral: 'Umbral', verdant: 'Verdant' };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function statLabel(stat: StatId): string {
  if (LABEL[stat]) return LABEL[stat];
  const [group, key] = stat.split('.');
  if (group === 'damage') return `${cap(key)} damage`;
  if (group === 'resist') return `${cap(key)} resistance`;
  if (group === 'buildup') return `${cap(key)} buildup`;
  if (group === 'school') return `${SCHOOL[key] ?? cap(key)} spell damage`;
  return stat;
}

/** stats whose flat values are fractions shown as % */
function isPercentStat(stat: StatId): boolean {
  if (/^(damage|resist|school)\./.test(stat)) return true;
  return [
    'critChance', 'critMultiplier', 'cooldownReduction', 'statusResist', 'lifeLeech', 'lifeOnKill', 'attackSpeed', 'castSpeed',
    'blockEfficiency', 'dodgeCost', 'dodgeDistance', 'healingReceived', 'healingDone', 'damageTaken', 'damageDealt',
    'meleeDamage', 'rangedDamage', 'spellDamage', 'itemFind', 'goldFind', 'xpGain',
  ].includes(stat);
}

const sign = (v: number) => (v >= 0 ? '+' : '−');
const fmtPct = (v: number) => `${sign(v)}${Math.round(Math.abs(v) * 1000) / 10}%`;
const fmtNum = (v: number) => `${sign(v)}${Math.round(Math.abs(v) * 10) / 10}`;

export function describeCondition(c: CombatCondition): string {
  switch (c.kind) {
    case 'hpBelow': return `below ${Math.round(c.pct * 100)}% HP`;
    case 'hpAbove': return `above ${Math.round(c.pct * 100)}% HP`;
    case 'timeOfDay': return c.phase === 'night' ? 'at night' : 'by day';
    case 'inCombat': return c.value ? 'in combat' : 'out of combat';
    case 'inStealth': return 'while stealthed';
    case 'targetFamily': return `vs ${c.family}`;
    case 'targetVariant': return `vs ${cap(c.variant)}`;
    case 'targetRank': return `vs ${c.rank}s`;
    case 'targetHasStatus': return `vs ${c.status} targets`;
    case 'selfHasStatus': return `while ${c.status}`;
    case 'weaponFamily': return `with ${c.family}s`;
    case 'armorWeight': return `in ${c.weight} armour`;
    case 'school': return `with ${SCHOOL[c.school]} spells`;
    case 'flag': return `if ${c.flag}`;
    case 'all': return c.of.map(describeCondition).join(' and ');
    case 'any': return c.of.map(describeCondition).join(' or ');
  }
}

export function describeModifier(m: StatModifier): string {
  const label = statLabel(m.stat);
  let s: string;
  if (m.op === 'more') s = `${fmtPct(m.value)} more ${label}`;
  else if (m.op === 'increased') s = `${fmtPct(m.value)} ${label}`;
  else if (m.stat === 'parryWindow') s = `${fmtNum(m.value)} ms ${label}`;
  else s = isPercentStat(m.stat) ? `${fmtPct(m.value)} ${label}` : `${fmtNum(m.value)} ${label}`;
  return m.condition ? `${s} ${describeCondition(m.condition)}` : s;
}

/** Text for named hooks (bespoke effects). Extend alongside effects/hooks.ts. */
export const HOOK_TEXT: Record<string, string> = {
  secondWind: 'Below 30% HP, heal 25% over 5 s (90 s cooldown)',
  retaliation: 'Blocking deals 30% of blocked damage back',
  riposteBoost: 'Ripostes deal ×1.8 and refund 20 stamina',
  sunder: 'Heavy attacks apply Vulnerable for 3 s',
  executioner: '+50% more damage to Staggered or Exposed enemies',
  deathCheater: 'Once every 5 min, a lethal hit leaves you at 1 HP',
  noblePurse: 'Start with 200 extra gold',
  focusedDraw: 'Full draws grant +1 Focus',
  steadyAim: 'Standing still while drawing: +25% draw speed',
  quickNock: 'Dodging reloads your next shot instantly',
  kindling: 'Burning enemies take +15% damage from you',
  leyFlow: 'Spell kills restore 8 Ember',
  splitOnDeath: 'Splits into two smaller Mirelings on death',
  convertPhysical: '30% of your weapon’s physical damage is dealt as fire',
  emberOnHollowedKill: 'Killing a Hollowed restores 10 Ember',
  bleedLeech: 'Heal for 5% of damage dealt to Bleeding enemies',
  stealthPull: 'Hitting from stealth pulls you to the target (Shade, Phase 2)',
  edricsOath: 'Your first block every 6 s is a perfect parry; ripostes restore 25 Resolve',
  shopDiscount: 'Merchants give you better prices',
  darkCraftCost: 'Umbral spells and Bloodcraft cost 50% more',
  wolfFriend: 'Wolves of the Gloamwood will not attack you unprovoked',
  spellCrit: 'Your spells can critically strike',
  cinderTolerance: 'Overdraw costs 30% less HP',
  gainResource: 'Gain class resource',
  lunge: 'Lunge forward',
  ashmarkPurge: 'Purges Mire-taint: damages Hollowed and Unwrought, cleanses the subdued',
  wardBurn: 'Attackers who strike your ward build Burn',
  cinderstorm: 'Burning enemies you kill explode',
  bleedFreeze: 'Bleed triggers also Freeze the target',
  frozenShatter: 'Frozen enemies you kill shatter, dealing frost damage around them',
  alwaysOverdraw: 'Every cast overdraws: Ember costs are paid in HP',
  heavyPin: 'Fully charged heavy attacks pin the target (Root + Vulnerable for 2 s)',
  slamOnLand: 'Slam the ground where you land',
  banesHollowed: '×1.5 damage against the Hollowed and Unwrought',
  furyDamage: '+15% damage while above 50 Fury',
  executeBonus: '+40% damage to enemies below 30% HP',
  bloodPrice: 'Bloodcraft costs less HP',
  furyOnKill: 'Kills grant extra Fury',
  draughtPenalty: 'Hearth Draughts heal 50% less',
  stealthBonus: 'Stealth strikes deal more damage',
  backstabCrit: 'Backstabs gain +25% crit chance',
  devotionGain: 'Devotion is gained 50% faster',
  percentRegen: 'Regenerate a share of max HP each second in combat',
  alwaysEmpowered: 'Prayers are always empowered but cost 50% more Ember',
  longShot: 'Arrows deal more damage the farther they fly',
  companionStrike: 'A spirit hawk strikes your foe every few seconds',
  companionBleed: 'The hawk’s strikes build Bleed',
  companionSpeed: 'The hawk strikes more often',
  companionPower: 'The hawk strikes far harder',
  attunementMax: 'Attunement can reach 5 stacks',
  spellCostMult: 'Spells cost more Ember',
  spellbladeCdr: 'Melee hits shorten your spell cooldowns',
  emberOnHit: 'Melee hits restore Ember',
  wardBoost: 'Your wards are stronger',
  noDodge: 'You cannot dodge-roll',
  omniBlock: 'You block attacks from every direction',
  noShield: 'Shields no longer work for you',
};

export function describeEffect(e: EffectDef): string {
  switch (e.kind) {
    case 'modifier': return describeModifier(e.mod);
    case 'grantAbility': return `Grants ${Registry.tryGet('spell', e.spell)?.name ?? e.spell}`;
    case 'applyStatus': {
      const chance = e.chance !== undefined && e.chance < 1 ? `${Math.round(e.chance * 100)}% chance to ` : '';
      const amount = e.buildup ? ` (${e.buildup} buildup)` : e.durationMs ? ` for ${e.durationMs / 1000} s` : '';
      const who = e.target === 'self' ? 'yourself' : e.target === 'area' ? 'nearby enemies' : 'the target';
      return `${cap(e.trigger.replace(/^on/, 'on '))}: ${chance}apply ${cap(e.status)} to ${who}${amount}`;
    }
    case 'hook': return HOOK_TEXT[e.hook] ?? e.hook;
    case 'proficiency': return `Proficient with ${e.weapon ?? `${e.armor} armour`}`;
    case 'dialogueTag': return `Opens “${e.tag}” dialogue options`;
  }
}
