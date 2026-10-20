/**
 * Deeper-builds items (Claude 3, docs/systems/BUILDS.md §2.2, §4, §6): spell runes, rune dust, school Essences and
 * tomes. Working names; Claude 4 restyles. Icons borrow existing atlas frames (`icon`) until art exists.
 * - Runes (`rn_<id>`) stack in the pack; slotting one into a spell uses it up (unslotting gives it back).
 * - Rune dust comes from salvaging affixed gear; Essences drop in their school's caves (loot tables) and pay for
 *   Imbue and rune crafting.
 * - A tome (`t_<spell slug>`) teaches one school spell of another school (one at a time; a second replaces the first).
 */
import { SCHOOL_NAME } from '@/data/classes/hc';
import { HC_SCHOOL_SPELL_DEFS } from '@/data/spells/hc/school-spells';
import type { RuneDef } from '@/systems/rules/affixTypes';
import type { HcItemBase, SchoolId } from '@/systems/rules/types';

export const RUNE_DUST = 'i_runedust';
export const essenceOf = (school: SchoolId): string => `i_essence_${school}`;
const SCHOOLS: SchoolId[] = ['ash', 'rime', 'storm', 'radiance', 'umbral', 'verdant', 'blade', 'iron', 'fist', 'hunt', 'guile', 'song'];

const rune = (id: string, name: string, desc: string, fits: RuneDef['fits'], mod: RuneDef['mod'], gold: number, dust: number, rarity: RuneDef['rarity'] = 'ember', extra: { item: string; qty: number }[] = []): RuneDef =>
  ({ id: `rn_${id}`, name, desc, fits, mod, rarity, craft: { gold, items: [{ item: RUNE_DUST, qty: dust }, ...extra] } });

export const HC_RUNES: RuneDef[] = [
  rune('volley', 'Rune of Volley', 'Projectile spells fire 2 more projectiles, each 20% weaker.', ['projectile'], { count: 2, dmg: -0.2 }, 120, 4, 'runed'),
  rune('chain', 'Rune of Chains', 'Hits chain to 2 more foes nearby for 60% damage.', [], { chain: 2 }, 140, 5, 'runed'),
  rune('pierce', 'Rune of Piercing', 'Projectiles pass through every foe in their path.', ['projectile'], { pierce: true }, 90, 3),
  rune('split', 'Rune of Splitting', 'Projectiles split into three weaker copies.', ['projectile'], { split: true }, 110, 4),
  rune('wide', 'Rune of Reach', 'The spell’s area is 40% larger.', ['area'], { area: 0.4 }, 90, 3),
  rune('linger', 'Rune of Lingering', 'Damaging spells leave a burning field for 3 s.', [], { linger: 3000 }, 110, 4),
  rune('burst', 'Rune of Bursting', 'Repeating spells land all at once for 50% more.', [], { burst: true, dmg: 0.5 }, 140, 5, 'runed'),
  rune('haste', 'Rune of Haste', '20% shorter cooldown and cast time.', [], { haste: 0.2 }, 120, 4),
  rune('echo', 'Rune of Echoes', '25% chance to cast the spell again for free.', [], { echo: 0.25 }, 160, 6, 'runed'),
  rune('thrift', 'Rune of Thrift', 'The spell costs 25% less.', [], { cost: -0.25 }, 80, 3, 'fine'),
  rune('power', 'Rune of Power', '+30% damage; the spell costs 30% more.', [], { dmg: 0.3, cost: 0.3 }, 100, 4),
  rune('ward', 'Rune of Warding', 'Casting shields you for 8% of your max health (4 s).', [], { ward: 0.08 }, 100, 4),
  rune('leech', 'Rune of Leeching', '6% of the spell’s damage heals you.', [], { leech: 0.06 }, 120, 4),
  rune('twin', 'Rune of Twins', 'Also strikes a second foe nearby for 75%.', [], { twin: true }, 150, 6, 'runed'),
  rune('long', 'Rune of Duration', 'The spell’s effects last 40% longer.', [], { dur: 0.4 }, 90, 3),
  // Convert: one rune per school (the spell deals that school's damage); crafted with the school's Essence
  ...SCHOOLS.map((s) => rune(`convert_${s}`, `Rune of ${SCHOOL_NAME[s]}`, `The spell deals ${SCHOOL_NAME[s]} damage.`, [], { convert: s }, 120, 3, 'ember', [{ item: essenceOf(s), qty: 1 }])),
];

/** Tomes: one per non-ultimate school spell. */
export const HC_TOMES: { item: string; spell: string; school: SchoolId }[] = HC_SCHOOL_SPELL_DEFS
  .filter((s) => !s.tags.includes('ultimate'))
  .map((s) => ({ item: `t_${s.id.replace(/^spell:/, '')}`, spell: s.id, school: s.school }));

export interface HcBuildItem extends HcItemBase { icon: string }

export const HC_BUILD_ITEMS: HcBuildItem[] = [
  ...HC_RUNES.map((r): HcBuildItem => ({ id: r.id, cat: 'rune', name: r.name, rarity: r.rarity, desc: r.desc, value: Math.round(r.craft.gold * 0.6), icon: 'i_amethyst' })),
  { id: RUNE_DUST, cat: 'material', name: 'Rune Dust', rarity: 'fine', desc: 'Ground from enchanted gear at the Runeforge. Crafts runes.', value: 6, icon: 'i_moon' },
  ...SCHOOLS.map((s): HcBuildItem => ({ id: essenceOf(s), cat: 'material', name: `Essence of ${SCHOOL_NAME[s]}`, rarity: 'runed', desc: `Pure ${SCHOOL_NAME[s]}. Imbues a weapon or crafts a ${SCHOOL_NAME[s]} rune.`, value: 40, icon: 'i_sapphire' })),
  ...HC_TOMES.map((t): HcBuildItem => {
    const sp = HC_SCHOOL_SPELL_DEFS.find((x) => x.id === t.spell)!;
    return { id: t.item, cat: 'tome', name: `Tome of ${sp.name}`, rarity: 'wrought', desc: `Teaches ${sp.name} (${SCHOOL_NAME[t.school]}) as your one off-school spell. ${sp.desc}`, value: 400, icon: `i_scroll_${['ash', 'rime', 'storm', 'radiance', 'umbral', 'verdant'].includes(t.school) ? t.school : 'ash'}` };
  }),
];
