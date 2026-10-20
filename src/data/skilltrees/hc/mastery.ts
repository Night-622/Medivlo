/**
 * Weapon mastery (Claude 5 for Claude 3, docs/systems/BUILDS.md §3): one small Passive per class × kit weapon type,
 * active while that weapon is in the main hand. Each nudges the weapon toward the class's way of fighting (about a
 * minor node's worth), so switching weapons changes how a class plays, not only its numbers.
 */
import type { MasteryDef } from '@/systems/rules/perkTypes';
import type { Modifier, Passive, StatKey, WeaponType } from '@/systems/rules/types';

const f = (stat: StatKey, value: number, when?: Modifier['when']): Modifier => ({ stat, op: 'flat', value, ...(when ? { when } : {}) });
const tgt = { shape: 'single' as const, at: 'target' as const };
const m = (classId: string, weapon: WeaponType, name: string, text: string, passive: Passive): MasteryDef => ({ classId, weapon, name, text, passive });
const onCrit = (status: 'stun' | 'bleed' | 'burn' | 'chill' | 'shock' | 'blind' | 'root' | 'poison', dur: number, chance = 1): Passive =>
  ({ procs: [{ on: 'crit', chance, icd: 1000, do: [{ a: 'status', status: { id: status, dur }, area: tgt }] }] });

export const HC_MASTERY: MasteryDef[] = [
  // Rime
  m('warden', 'sword', 'Frostguard Blade', '+5% block chance and +5% attack speed.', { mods: [f('block', 0.05), f('atkSpeed', 0.05)] }),
  m('warden', 'mace', 'Glacier Maul', '15% chance on critical hit to stun the foe for 1 s.', onCrit('stun', 1000, 0.15)),
  m('warden', 'spear', 'Icewall Spear', '+8% damage to foes 120 px or more away; +4% block chance.', { mods: [f('dmg', 0.08, { c: 'targetFar', px: 120 }), f('block', 0.04)] }),
  m('rimecaller', 'staff', 'Winterwood Staff', '+8% spell damage and +10% slow strength.', { mods: [f('spellDmg', 0.08), f('slowPower', 0.1)] }),
  m('rimecaller', 'wand', 'Icicle Wand', '+10% cast speed.', { mods: [f('castSpeed', 0.1)] }),
  // Verdant
  m('ranger', 'bow', 'Yew Longbow', '+8% damage to foes 200 px or more away; +3% critical chance.', { mods: [f('dmg', 0.08, { c: 'targetFar', px: 200 }), f('crit', 0.03)] }),
  m('hedgewitch', 'staff', 'Crooked Staff', '+10% healing done and +10% root duration.', { mods: [f('healing', 0.1), f('rootDur', 0.1)] }),
  m('hedgewitch', 'wand', 'Willow Wand', 'Critical hits poison the foe for 3 s.', onCrit('poison', 3000)),
  // Ash
  m('arcanist', 'staff', 'Ember Staff', '+8% Ash damage and +10% burn damage.', { mods: [f('dmg.ash', 0.08), f('statusDmg.burn', 0.1)] }),
  m('arcanist', 'wand', 'Cinder Wand', '+10% cast speed; critical hits burn the foe for 2 s.', { mods: [f('castSpeed', 0.1)], ...onCrit('burn', 2000) }),
  m('reaver', 'axe', 'Muster Axe', '+6% attack damage and +2% lifesteal.', { mods: [f('attackDmg', 0.06), f('lifesteal', 0.02)] }),
  m('reaver', 'sword', 'Red Blade', '+8% attack speed.', { mods: [f('atkSpeed', 0.08)] }),
  m('reaver', 'mace', 'Pyre Hammer', '15% chance on critical hit to stun the foe for 1 s; +5% armour.', { ...onCrit('stun', 1000, 0.15), mods: [{ stat: 'armor', op: 'pct', value: 0.05 }] }),
  // Storm
  m('stormlancer', 'spear', 'Thunder Lance', 'Landing a dash: +10% damage for 2 s.', { procs: [{ on: 'dashEnd', do: [{ a: 'buff', id: 'mst:lance', dur: 2000, to: 'self', mods: [f('dmg', 0.1)] }] }] }),
  m('sparkwright', 'wand', 'Coil Wand', '+10% cast speed.', { mods: [f('castSpeed', 0.1)] }),
  m('sparkwright', 'staff', 'Lightning Rod', 'Your chains jump to 1 more foe.', { mods: [f('chains', 1)] }),
  m('sparkwright', 'mace', 'Spanner', '+15% summon damage; critical hits shock the foe for 2 s.', { mods: [f('minionDmg', 0.15)], ...onCrit('shock', 2000) }),
  // Radiance
  m('oathbound', 'mace', 'Dawn Hammer', '+10% healing received and +5% armour.', { mods: [f('healingTaken', 0.1), { stat: 'armor', op: 'pct', value: 0.05 }] }),
  m('oathbound', 'sword', 'Oath Blade', 'Critical hits blind the foe for 1 s.', onCrit('blind', 1000)),
  m('cantor', 'mace', 'Censer Mace', '+8% Radiance damage.', { mods: [f('dmg.radiance', 0.08)] }),
  m('cantor', 'wand', 'Chime Wand', '+10% healing done.', { mods: [f('healing', 0.1)] }),
  m('cantor', 'staff', 'Processional Staff', '+15% buff duration.', { mods: [f('buffDur', 0.15)] }),
  // Umbral
  m('shade', 'dagger', 'Nightglass Dagger', '+10% damage from behind.', { mods: [f('dmg', 0.1, { c: 'behind' })] }),
  m('shade', 'sword', 'Shadow Blade', 'Critical hits make the foe bleed for 3 s.', onCrit('bleed', 3000)),
  m('duskweaver', 'wand', 'Thread Wand', '+10% status duration.', { mods: [f('statusDur', 0.1)] }),
  m('duskweaver', 'staff', 'Eclipse Staff', '+8% spell damage.', { mods: [f('spellDmg', 0.08)] }),
  m('duskweaver', 'dagger', 'Ritual Knife', '+2% lifesteal.', { mods: [f('lifesteal', 0.02)] }),
  // Blade
  m('swordsman', 'sword', 'Duelling Sword', 'A parry restores 10 stamina.', { procs: [{ on: 'parry', do: [{ a: 'resource', stamina: 10 }] }] }),
  m('samurai', 'sword', 'Katana', '+15% critical damage.', { mods: [f('critd', 0.15)] }),
  // Iron
  m('knight', 'sword', 'Arming Sword', '+5% block chance.', { mods: [f('block', 0.05)] }),
  m('knight', 'mace', 'Morning Star', '15% chance on critical hit to stun the foe for 1 s.', onCrit('stun', 1000, 0.15)),
  m('knight', 'spear', 'Cavalry Lance', 'Landing a dash: +10% damage for 2 s.', { procs: [{ on: 'dashEnd', do: [{ a: 'buff', id: 'mst:cavalry', dur: 2000, to: 'self', mods: [f('dmg', 0.1)] }] }] }),
  m('juggernaut', 'mace', 'Great Maul', '+10% damage to stunned foes.', { mods: [f('dmg', 0.1, { c: 'targetHas', status: 'stun' })] }),
  m('juggernaut', 'axe', 'Headsman Axe', '+10% damage to foes below 30% health.', { mods: [f('dmg', 0.1, { c: 'targetHpBelow', pct: 0.3 })] }),
  // Fist
  m('monk', 'staff', 'Quarterstaff', 'Every 4th hit grants 1 Momentum.', { procs: [{ on: 'hit', every: 4, do: [{ a: 'resource', momentum: 1 }] }] }),
  m('monk', 'spear', 'Monk Spade', '+8% attack speed.', { mods: [f('atkSpeed', 0.08)] }),
  m('brawler', 'mace', 'Knuckle Club', '15% chance on critical hit to stun the foe for 1 s.', onCrit('stun', 1000, 0.15)),
  m('brawler', 'dagger', 'Brass Knuckles', '+8% attack speed.', { mods: [f('atkSpeed', 0.08)] }),
  // Hunt
  m('huntsman', 'bow', 'Crossbow', '+10% damage to marked foes.', { mods: [f('dmg', 0.1, { c: 'targetHas', status: 'mark' })] }),
  m('falconer', 'bow', 'Hunting Bow', '+10% summon damage.', { mods: [f('minionDmg', 0.1)] }),
  m('falconer', 'dagger', 'Talon Knife', 'Critical hits make the foe bleed for 3 s.', onCrit('bleed', 3000)),
  // Guile
  m('corsair', 'sword', 'Cutlass', '+8% attack speed.', { mods: [f('atkSpeed', 0.08)] }),
  m('corsair', 'dagger', 'Boot Knife', 'Critical hits blind the foe for 1 s.', onCrit('blind', 1000)),
  m('jester', 'dagger', 'Juggling Knives', '+3% critical chance and +8% critical damage.', { mods: [f('crit', 0.03), f('critd', 0.08)] }),
  m('jester', 'wand', 'Bauble Wand', '+10% status chance.', { mods: [f('statusChance', 0.1)] }),
  // Song
  m('bard', 'wand', 'Lute Wand', '+15% buff duration.', { mods: [f('buffDur', 0.15)] }),
  m('bard', 'dagger', 'Dirk', '+8% attack speed.', { mods: [f('atkSpeed', 0.08)] }),
  m('skald', 'axe', 'Bearded Axe', '+8% attack damage.', { mods: [f('attackDmg', 0.08)] }),
  m('skald', 'mace', 'War Drum Mace', '+10% buff strength.', { mods: [f('buffPower', 0.1)] }),
];
