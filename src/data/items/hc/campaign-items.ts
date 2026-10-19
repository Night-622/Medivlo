/**
 * Bespoke story items (Claude 3) from Claude 4's docs/lore/hollow-crown/11-bespoke-items.md.
 * Each item is an alias of its old stand-in (`base`), which supplies the art and base stats (weapon damage, armour,
 * set membership, trinket stats). On top of that it gets its own name, a story rarity, an equip slot and a small
 * themed passive. Relics are quest keepsakes: no slot, no stats, never sold.
 */
import type { Modifier, Passive, Rarity } from '@/systems/rules/types';

export interface CampaignItem {
  id: string;
  name: string;
  /** stand-in handoff id: art + base stats */
  base: string;
  classId: string;
  kind: 'trinket' | 'gear' | 'relic';
  /** trinkets: which jewellery slot they take */
  slot?: 'ring' | 'amulet';
  rarity: Rarity;
  desc: string;
  passive?: Passive;
}

const m = (stat: Modifier['stat'], value: number, when?: Modifier['when']): Modifier => ({ stat, op: 'flat', value, when });
const T = (id: string, name: string, base: string, classId: string, slot: 'ring' | 'amulet', desc: string, passive: Passive): CampaignItem =>
  ({ id, name, base, classId, kind: 'trinket', slot, rarity: 'wrought', desc, passive });
const G = (id: string, name: string, base: string, classId: string, desc: string, passive: Passive): CampaignItem =>
  ({ id, name, base, classId, kind: 'gear', rarity: 'wrought', desc, passive });
const R = (id: string, name: string, base: string, classId: string, desc: string): CampaignItem =>
  ({ id, name, base, classId, kind: 'relic', rarity: 'runed', desc });

export const HC_CAMPAIGN_ITEMS: CampaignItem[] = [
  // ── mentor farewell gifts (I-9)
  T('i_thrane_lantern', 'Thrane’s Hat-Lantern', 'i_lantern', 'arcanist', 'amulet', 'It lights where nothing else will.', { mods: [m('dmg.ash', 0.06), m('emberRegen', 0.5)] }),
  T('i_brenna_axe_ring', 'Brenna’s Axe-Ring', 'i_emberring', 'reaver', 'ring', 'Forged from the head of a broken war-axe.', { mods: [m('lifesteal', 0.03), m('dmg', 0.05, { c: 'hpBelow', pct: 0.5 })] }),
  T('i_halla_hour_pin', 'Halla’s Hour-Pin', 'i_moonpend', 'rimecaller', 'amulet', 'Never worn. Still keeps time.', { mods: [m('cdr', 0.04)] }),
  T('i_halla_watch', 'Halla’s Pocket-Watch', 'i_locket', 'rimecaller', 'amulet', 'Stopped at 11.52, and wound again.', { mods: [m('slowPower', 0.1), m('statusDur', 0.08)] }),
  T('i_dagny_horn', 'Dagny’s Watch-Horn', 'i_bonecharm', 'warden', 'amulet', 'One blast for wolves, two for the Breach.', { mods: [m('block', 0.04), m('armor', 0.05, undefined)].map((x, i) => (i === 1 ? { ...x, op: 'pct' as const } : x)) }),
  T('i_dagny_fin_crest', 'Dagny’s Fin Crest', 'i_signet', 'warden', 'ring', 'The crest off her shield, filed to fit a finger.', { mods: [m('resist.rime', 0.1), m('block', 0.03)] }),
  T('i_tess_goggles', 'Tess’s Forty-Year Goggles', 'i_copper', 'sparkwright', 'amulet', 'Scorched, scratched, and still the best pair in Spirehold.', { mods: [m('chains', 1)] }),
  T('i_odran_pennant', 'Odran’s Lance-Pennant', 'i_silk', 'stormlancer', 'amulet', 'It snaps in a wind that isn’t there.', { mods: [m('moveSpeed', 0.05), m('dmg.storm', 0.05)] }),
  T('i_celestine_sun', 'The Little Sun', 'i_sunpend', 'cantor', 'amulet', 'The sun off Celestine’s censer lid.', { mods: [m('healing', 0.08)] }),
  T('i_beatrix_oath_ring', 'Beatrix’s Oath-Ring', 'i_signet', 'oathbound', 'ring', 'Worn sun outward, as the oath requires.', { mods: [m('healingTaken', 0.08), m('block', 0.03)] }),
  R('i_nyx_kept_name', 'Nyx’s Kept Name', 'i_locket', 'duskweaver', 'A name, whispered once into a locket and kept.'),
  T('i_nyx_spectacles', 'Nyx’s Spectacles', 'i_moonpend', 'duskweaver', 'amulet', 'Through them, every ink stain is a word.', { mods: [m('dmg.umbral', 0.06), m('crit', 0.02)] }),
  T('i_mab_picks', 'The Mab Set', 'i_picks', 'shade', 'amulet', 'Grey Mab’s own picks. They have opened worse than locks.', { mods: [m('crit', 0.04, { c: 'behind' })] }),
  R('i_yarrow_acorn', 'Yarrow’s Winter Acorn', 'i_sunpend', 'hedgewitch', 'From the tree’s last winter. Keep it safe.'),
  G('w_holt_waymark_knife', 'Holt’s Waymark Knife', 'w_dagger_steel', 'ranger', 'It has notched every trail in the Thornwilds.', { mods: [m('dmg', 0.06, { c: 'targetFar', px: 200 })] }),
  G('w_ferro_blade', 'Ferro’s Blade', 'w_sword_steel', 'swordsman', 'The blade she beat him with.', { mods: [m('crit', 0.04), m('critd', 0.1)] }),
  T('i_ferro_signet', 'The Ladder’s Signet', 'i_signet', 'swordsman', 'ring', 'Gold, worn smooth by every champion of the Ladder.', { mods: [m('atkSpeed', 0.05)] }),
  G('a_kanemori_hat', 'Kanemori’s Hat', 'a_blade_mail_helm', 'samurai', '“Yours.”', { mods: [m('crit', 0.05, { c: 'targetHpAbove', pct: 0.8 })] }),
  G('w_gideon_sword', 'Gideon’s Sword', 'w_sword_steel', 'knight', 'From the last Turning.', { mods: [m('block', 0.05), m('dmg', 0.04)] }),
  T('i_gussie_whistle', 'Gussie’s Shift-Whistle', 'i_copper', 'juggernaut', 'amulet', 'Three blasts and the shift is done.', { mods: [m('stunTaken', -0.15), { stat: 'hp', op: 'pct', value: 0.04 }] }),
  T('i_shirin_stones_bowl', 'Shirin’s Stones Bowl', 'i_onyx', 'monk', 'amulet', 'One black stone in it is loaded.', { mods: [m('maxMomentum', 1)] }),
  T('i_pops_towel', 'Pops’s Corner Towel', 'i_st', 'brawler', 'amulet', 'Thrown in only once, years ago.', { mods: [m('hpRegen', 2, { c: 'inCombat' }), m('staminaRegen', 3)] }),
  T('i_bannock_horn', 'Bannock’s Lodge Horn', 'i_bonecharm', 'huntsman', 'amulet', 'Elk bone. It calls the Lodge home.', { mods: [m('dmg', 0.08, { c: 'targetHas', status: 'mark' })] }),
  G('a_wren_glove', 'Old Wren’s Glove', 'a_hunt_leather_hands', 'falconer', 'Fifty years of talons.', { hooks: [{ id: 'petPower', value: 0.25 }] }),
  G('w_little_fennick', 'Little Fennick', 'w_wand_wood', 'jester', 'A birch marotte that heckles your foes.', { mods: [m('crit', 0.05)] }),
  T('i_dot_compass', 'Dot’s Compass', 'i_copper', 'corsair', 'ring', 'It points at what you owe most.', { mods: [m('gold', 0.1), m('itemFind', 0.05)] }),
  T('i_rosalind_opera_glasses', 'Rosalind’s Opera Glasses', 'i_bonecharm', 'bard', 'amulet', 'Mother-of-pearl. She saw every flubbed note.', { mods: [m('buffDur', 0.1), m('buffPower', 0.05)] }),
  G('w_ragna_saga_staff', 'Ragna’s Saga-Staff', 'w_staff_iron', 'skald', 'Notched for every saga that was lost.', { mods: [m('buffDur', 0.1), m('dmg.song', 0.06)] }),
  // ── Act III keepsakes
  R('i_gideons_spurs', 'Gideon’s Spurs', 'i_signet', 'knight', 'He won’t need them where he’s going.'),
  R('i_first_whistle', 'The First Whistle', 'i_copper', 'juggernaut', 'The whistle that started the first shift.'),
  R('i_holts_punchline', 'Holt’s Punchline', 'i_map', 'ranger', 'Written on the back of a waymark. You have to be there.'),
  R('i_black_tear_plume', 'Black-Tear Plume', 'i_feather', 'all', 'A feather dipped in the last black tear.'),
];

export const campaignItem = (id: string): CampaignItem | undefined => HC_CAMPAIGN_ITEMS.find((x) => x.id === id);

/** Story pets and the mount, given by flags in the class campaigns. Cosmetic followers on borrowed bestiary bodies. */
export interface StoryPet { flag: string; classId: string; name: string; body: string; mount?: boolean }
export const HC_STORY_PETS: StoryPet[] = [
  { flag: 'arcanist.pudding_pet', classId: 'arcanist', name: 'Pudding', body: 'bx_emberslime' },
  { flag: 'sparkwright.kettle_pet', classId: 'sparkwright', name: 'Kettle', body: 'bx_sentry' },
  { flag: 'stormlancer.biddy_mount', classId: 'stormlancer', name: 'Biddy', body: 'bx_storm_3', mount: true },
  { flag: 'monk.vespers_pet', classId: 'monk', name: 'Vespers', body: 'bx_boar' },
  { flag: 'juggernaut.sergeant_pet', classId: 'juggernaut', name: 'Sergeant', body: 'bx_beetle' },
  { flag: 'huntsman.biscuit_pet', classId: 'huntsman', name: 'Biscuit', body: 'bx_wolf' },
  { flag: 'falconer.pibb_pet', classId: 'falconer', name: 'Pibb', body: 'bx_crow' },
  { flag: 'corsair.interest_pet', classId: 'corsair', name: 'Interest', body: 'bx_goldslime' },
  { flag: 'bard.encore_pet', classId: 'bard', name: 'Encore', body: 'bx_direwolf' },
];
