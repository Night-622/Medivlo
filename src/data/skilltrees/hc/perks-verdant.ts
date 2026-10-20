/**
 * Verdant perks (Claude 5 for Claude 3, docs/systems/BUILDS.md §3; slots in rules/perkTypes.ts). Ranger and Hedgewitch
 * signatures (12 each, path i themed on kit spell i and the new kit spell i+3) and 8 Verdant school perks. Each
 * exclusive c1 / c2 pair is two different playstyles. effects[r-1] is the whole effect at rank r. Numbers follow the
 * HOLLOW_CROWN.md §2.1 budgets: a perk ≈ a 3-rank node of the old tree; trade-offs net about +20%.
 */
import type { ClassPerks, PerkDef, PerkKind, SchoolPerks } from '@/systems/rules/perkTypes';
import type { Passive } from '@/systems/rules/types';

const one = (id: string, name: string, kind: PerkKind, text: string, fx: Passive): PerkDef => ({ id, name, kind, ranks: 1, text: [text], effects: [fx] });
/** 3-rank perks are front-loaded: text / fx get a rank weight of 1.5 / 2.25 / 3 (rank 3 as written, rank 1 half of it) */
const RANK_W = [1.5, 2.25, 3];
const three = (id: string, name: string, kind: PerkKind, text: (r: number) => string, fx: (r: number) => Passive): PerkDef =>
  ({ id, name, kind, ranks: 3, text: RANK_W.map(text), effects: RANK_W.map(fx) });
const near = (r: number) => ({ shape: 'circle' as const, at: 'self' as const, r });
const tgt = { shape: 'single' as const, at: 'target' as const };

const VOLLEY = 'spell:volley', SNARE = 'spell:thornsnare', HERON = 'spell:herons-eye';
const LASH = 'spell:bramble-lash', BREW = 'spell:field-brew', MOTH = 'spell:moth-lantern';

const ranger: ClassPerks = {
  classId: 'ranger',
  signature: [
    // path 0: Volley (+ new spell 3): arrows by the handful
    one('pk_ranger_full_quiver', 'Full Quiver', 'power', '+1 to Volley and Piercing Arrow.',
      { spellLevels: [{ spell: VOLLEY, levels: 1 }, { spell: 'spell:piercing-arrow', levels: 1 }] }),
    three('pk_ranger_long_draw', 'Long Draw', 'power', (r) => `+${r * 5}% damage to foes 200 px or more away.`,
      (r) => ({ mods: [{ stat: 'dmg', op: 'flat', value: 0.05 * r, when: { c: 'targetFar', px: 200 } }] })),
    one('pk_ranger_barbed_heads', 'Barbed Heads', 'trigger', 'Hits have a 25% chance to make the foe bleed for 3 s.',
      { procs: [{ on: 'hit', chance: 0.25, do: [{ a: 'status', status: { id: 'bleed', dur: 3000 }, area: tgt }] }] }),
    one('pk_ranger_extra_arrow', 'Extra Arrow', 'tradeoff', '+1 projectile on every shot, −15% damage.',
      { mods: [{ stat: 'projCount', op: 'flat', value: 1 }, { stat: 'dmg', op: 'flat', value: -0.15 }] }),
    // path 1: Thornsnare (+ new spell 4): the trapper
    one('pk_ranger_quick_snare', 'Quick Snare', 'power', 'Thornsnare recharges 20% faster, costs 15% less and hits 30% harder.', { spellMods: [{ spell: SNARE, cd: -0.2, cost: -0.15, dmg: 0.3 }] }),
    three('pk_ranger_hold_fast', 'Hold Fast', 'power', (r) => `+${r * 6}% damage to rooted foes; +${(1.5 * r).toFixed(1)}% damage to all foes.`,
      (r) => ({ mods: [{ stat: 'dmg', op: 'flat', value: 0.015 * r }, { stat: 'dmg', op: 'flat', value: 0.06 * r, when: { c: 'targetHas', status: 'root' } }] })),
    one('pk_ranger_thorn_burst', 'Thorn Burst', 'trigger', 'Setting any status bursts thorns around the foe for 50% weapon power, once every 1 s.',
      { procs: [{ on: 'statusApplied', icd: 1000, do: [{ a: 'damage', coef: 0.5, kind: 'verdant', area: { shape: 'circle', at: 'target', r: 56 } }] }] }),
    one('pk_ranger_skirmisher', 'Skirmisher', 'power', 'While moving: +12% damage and +5% move speed.',
      { mods: [{ stat: 'dmg', op: 'flat', value: 0.12, when: { c: 'moving' } }, { stat: 'moveSpeed', op: 'flat', value: 0.05 }] }),
    // path 2: Heron's Eye (+ new spell 5): the patient marksman
    one('pk_ranger_sharp_eye', 'Sharp Eye', 'power', 'Heron’s Eye recharges 30% faster; +6% critical chance; +4% damage.', { spellMods: [{ spell: HERON, cd: -0.3 }], mods: [{ stat: 'dmg', op: 'flat', value: 0.04 }, { stat: 'crit', op: 'flat', value: 0.06 }] }),
    three('pk_ranger_deadeye', 'Deadeye', 'power', (r) => `+${r * 2}% critical chance and +${r * 8}% critical damage.`,
      (r) => ({ mods: [{ stat: 'crit', op: 'flat', value: 0.02 * r }, { stat: 'critd', op: 'flat', value: 0.08 * r }] })),
    one('pk_ranger_still_hunter', 'Still Hunter', 'power', 'After standing still for 1 s: +20% damage.',
      { mods: [{ stat: 'dmg', op: 'flat', value: 0.2, when: { c: 'stationary', ms: 1000 } }] }),
    one('pk_ranger_hawk_reflex', 'Heron’s Reflex', 'trigger', 'Critical hits: +15% attack speed for 3 s; +2% critical chance.',
      { mods: [{ stat: 'crit', op: 'flat', value: 0.02 }], procs: [{ on: 'attackCrit', icd: 3000, do: [{ a: 'buff', id: 'rng:reflex', dur: 3000, to: 'self', mods: [{ stat: 'atkSpeed', op: 'flat', value: 0.15 }] }] }] }),
  ],
};

const hedgewitch: ClassPerks = {
  classId: 'hedgewitch',
  signature: [
    // path 0: Bramble Lash (+ new spell 3): thorns that drag and bind
    one('pk_hedgewitch_long_lash', 'Long Lash', 'power', '+1 to Bramble Lash and Strangling Vines.',
      { spellLevels: [{ spell: LASH, levels: 1 }, { spell: 'spell:strangling-vines', levels: 1 }] }),
    three('pk_hedgewitch_thornbound', 'Thornbound', 'power', (r) => `Your roots last ${r * 10}% longer.`, (r) => ({ mods: [{ stat: 'rootDur', op: 'flat', value: 0.1 * r }] })),
    one('pk_hedgewitch_bitter_sap', 'Bitter Sap', 'trigger', 'Hits have a 25% chance to poison the foe for 4 s.',
      { procs: [{ on: 'hit', chance: 0.25, do: [{ a: 'status', status: { id: 'poison', dur: 4000 }, area: tgt }] }] }),
    one('pk_hedgewitch_wild_growth', 'Wild Growth', 'tradeoff', '+35% spell damage, −20% healing done.',
      { mods: [{ stat: 'spellDmg', op: 'flat', value: 0.35 }, { stat: 'healing', op: 'flat', value: -0.2 }] }),
    // path 1: Field Brew (+ new spell 4): the brewer
    one('pk_hedgewitch_strong_brew', 'Strong Brew', 'power', 'Field Brew heals 40% more and costs 15% less; +4% Verdant damage.', { mods: [{ stat: 'dmg.verdant', op: 'flat', value: 0.04 }], spellMods: [{ spell: BREW, dmg: 0.4, cost: -0.15 }] }),
    three('pk_hedgewitch_herbalist', 'Herbalist', 'power', (r) => `+${r * 6}% healing done and +${r * 10}% potion healing.`,
      (r) => ({ mods: [{ stat: 'healing', op: 'flat', value: 0.06 * r }, { stat: 'potionHeal', op: 'flat', value: 0.1 * r }] })),
    one('pk_hedgewitch_overgrowth', 'Overgrowth', 'trigger', 'Your heals also root foes around you for 1 s, once every 4 s; +5% Verdant damage; +3% critical chance.',
      { mods: [{ stat: 'crit', op: 'flat', value: 0.03 }, { stat: 'dmg.verdant', op: 'flat', value: 0.05 }], procs: [{ on: 'heal', icd: 4000, do: [{ a: 'status', status: { id: 'root', dur: 1000 }, area: near(96) }] }] }),
    one('pk_hedgewitch_tea_circle', 'Tea Circle', 'aura', 'You and allies near you receive 15% more healing.',
      { aura: [{ id: 'hdw:tea', r: 160, mods: [{ stat: 'healingTaken', op: 'flat', value: 0.15 }] }] }),
    // path 2: Moth Lantern (+ new spell 5): the night garden
    one('pk_hedgewitch_bright_moths', 'Bright Moths', 'power', 'Moth Lantern recharges 25% faster and lasts 30% longer.', { spellMods: [{ spell: MOTH, cd: -0.25, dur: 0.3 }] }),
    three('pk_hedgewitch_moth_dust', 'Moth Dust', 'power', (r) => `+${r * 6}% damage to blinded foes; +${(1.5 * r).toFixed(1)}% damage to all foes.`,
      (r) => ({ mods: [{ stat: 'dmg', op: 'flat', value: 0.015 * r }, { stat: 'dmg', op: 'flat', value: 0.06 * r, when: { c: 'targetHas', status: 'blind' } }] })),
    one('pk_hedgewitch_mothkin', 'Mothkin', 'power', '+25% summon damage and +25% summon health; Moth Swarm deals 30% more and Moth Lantern blinds 30% longer.',
      { spellMods: [{ spell: 'spell:moth-swarm', dmg: 0.3 }, { spell: 'spell:moth-lantern', dur: 0.3 }], mods: [{ stat: 'minionDmg', op: 'flat', value: 0.25 }, { stat: 'minionHp', op: 'flat', value: 0.25 }] }),
    one('pk_hedgewitch_lantern_light', 'Lantern Light', 'resource', 'Below 30% Ember: +3 Ember per second; above 50% Ember, +12% spell damage; +4% damage.',
      { mods: [{ stat: 'dmg', op: 'flat', value: 0.04 }, { stat: 'spellDmg', op: 'flat', value: 0.12, when: { c: 'emberAbove', pct: 0.5 } }, { stat: 'emberRegen', op: 'flat', value: 3, when: { c: 'emberBelow', pct: 0.3 } }] }),
  ],
};

const school: PerkDef[] = [
  // p0 offence
  one('pk_verdant_rootcraft', 'Rootcraft', 'power', '+12% Verdant damage; your roots last 10% longer.',
    { mods: [{ stat: 'dmg.verdant', op: 'flat', value: 0.12 }, { stat: 'rootDur', op: 'flat', value: 0.1 }] }),
  one('pk_verdant_venom', 'Venomous', 'power', '+30% poison and bleed damage; +5% status chance; +4% Verdant damage.',
    { mods: [{ stat: 'dmg.verdant', op: 'flat', value: 0.04 }, { stat: 'statusChance', op: 'flat', value: 0.05 }, { stat: 'statusDmg.poison', op: 'flat', value: 0.3 }, { stat: 'statusDmg.bleed', op: 'flat', value: 0.3 }] }),
  // p1 defence
  three('pk_verdant_barkskin', 'Barkskin', 'power', (r) => `+${r * 5}% Verdant resistance and +${r * 2}% max health.`,
    (r) => ({ mods: [{ stat: 'resist.verdant', op: 'flat', value: 0.05 * r }, { stat: 'hp', op: 'pct', value: 0.02 * r }] })),
  one('pk_verdant_thornskin', 'Thornskin', 'trigger', 'When hit: thorns strike the foes around you, once every 4 s.',
    { procs: [{ on: 'hurt', icd: 4000, do: [{ a: 'damage', coef: 0.35, kind: 'verdant', area: near(64) }] }] }),
  one('pk_verdant_regrowth', 'Regrowth', 'trigger', 'Below 50% health: heal 20% over 4 s, once every 45 s.',
    { procs: [{ on: 'lowHp', icd: 45000, do: [{ a: 'heal', pctMax: 0.2, over: 4000, to: 'self' }] }] }),
  // p2 focus / resource
  three('pk_verdant_green_sap', 'Green Sap', 'resource', (r) => `+${(0.3 * r).toFixed(1)} Ember per second; +${r * 5}% stamina regeneration.`,
    (r) => ({ mods: [{ stat: 'emberRegen', op: 'flat', value: 0.3 * r }, { stat: 'staminaRegen', op: 'pct', value: 0.05 * r }] })),
  one('pk_verdant_forager', 'Forager', 'resource', 'Kills restore 5 Ember and 10 stamina; +4% damage.',
    { mods: [{ stat: 'dmg', op: 'flat', value: 0.04 }], procs: [{ on: 'kill', do: [{ a: 'resource', ember: 5, stamina: 10 }] }] }),
  one('pk_verdant_seasons', 'Turn of Seasons', 'power', '6% shorter cooldowns and +5% Verdant damage.',
    { mods: [{ stat: 'cdr', op: 'flat', value: 0.06 }, { stat: 'dmg.verdant', op: 'flat', value: 0.05 }] }),
];

export const PERKS: SchoolPerks = { school: 'verdant', classes: [ranger, hedgewitch], perks: school };
