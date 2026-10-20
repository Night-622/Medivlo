/**
 * Builds text, school of rime (Claude 4; overlay on Claude 3 / Claude 5's mechanics, docs/systems/BUILDS.md phase 8).
 * Keyed by frozen ids: perks pk_* (perks-rime.ts) and the school's new kit spells (kit-spells-new.ts). Flavour only, no
 * numbers (they are still being tuned); `name` only where the working name is replaced. Owner: Claude 4.
 */
import type { BuildText, SpellText } from '../hc-builds-text';

export const PERKS: Record<string, BuildText> = {
  // Warden (the Wardwall, the Wardens of the Wall)
  'pk_warden_heavy_slam': { name: 'Wall-Hammer', flavour: 'A tower shield is a wall you can carry. Swing it hard enough and it is a wall that pays a visit.' },
  'pk_warden_glacial_weight': { flavour: 'Cold iron hits harder and cold bone breaks easier. The Wardens of the Wall did those sums long ago.' },
  'pk_warden_frost_bite': { name: 'Wolfrun Bite', flavour: 'Snow Wolves of the Wolfrun bite to hold, not to kill. The Wardens learned the trick and kept the teeth.' },
  'pk_warden_avalanche': { name: 'Heavy Snows', flavour: 'Heavy snow moves slowly and takes the whole pass with it. The Wardwall has always admired that.' },
  'pk_warden_steady_line': { flavour: 'Dagny cannot hear the horn any more, but she can feel a shield line go steady through her boots.' },
  'pk_warden_frozen_bulwark': { flavour: 'Wardwall shields are left out to rime overnight. A frozen face throws a blade off sideways.' },
  'pk_warden_retaliation': { name: 'Wall’s Answer', flavour: 'Strike the Wardwall and it does not move. Strike a Warden and you learn the wall was the polite one.' },
  'pk_warden_stand_fast': { flavour: 'Old Ingrith Halfmile has kept the furthest watch-fire alone for a lifetime. Nobody has ever relieved her.' },
  'pk_warden_ward_craft': { name: 'Wardcraft', flavour: 'Wardens draw their rime-wards in the snow with a spear-butt, quick and ugly. They hold all the same.' },
  'pk_warden_cold_front': { flavour: 'Stand near a Warden long enough and the fight goes out of you, along with the feeling in your toes.' },
  'pk_warden_oath_of_ice': { name: 'Shield-Kin', flavour: 'On the Wall the one beside you is your kin, whatever their mother says. The shields overlap to prove it.' },
  'pk_warden_winters_grasp': { flavour: 'Wardwall grandmothers say winter has hands. The Wardens agree, usually while blowing on their own.' },
  // Rimecaller (Glacierhome, the Archive of the Spire)
  'pk_rimecaller_keen_shard': { flavour: 'Archivists cut their shards along the grain of the ice, as neatly as a ruled line in a ledger.' },
  'pk_rimecaller_brittle': { flavour: 'Glacierhome’s registers note the exact cold at which everything breaks. Halla has a favourite.' },
  'pk_rimecaller_shatter_shot': { flavour: 'In the Mirror Gallery one cracked pane takes its neighbours with it. The curators have stopped sweeping.' },
  'pk_rimecaller_deep_winter': { flavour: 'Clerk Cornelius Teal wrote “cold; still” in the register every day for thirty years, and was right every time.' },
  'pk_rimecaller_spreading_frost': { flavour: 'Frost spreads the way gossip does in the Archive: quietly, along the shelves, and faster than you would think.' },
  'pk_rimecaller_permafrost': { flavour: 'What the Archive keeps, it keeps. Ask the thief in the Frozen Market how long a moment can last.' },
  'pk_rimecaller_frostbite_field': { name: 'Held Still', flavour: 'A held thing cannot dodge. The Regent learned that on a whole city; Rimecallers learn it on wolves.' },
  'pk_rimecaller_glacial_ambition': { name: 'Slow Scholarship', flavour: 'An archivist who hurries is an archivist who misfiles. Nobody has ever seen Halla Vint run.' },
  'pk_rimecaller_quick_wall': { name: 'Hasty Glacier', flavour: 'A glacier in a hurry offends every principle of the Archive. Halla allows it, and makes a note.' },
  'pk_rimecaller_ice_mirror': { flavour: 'The Mirror Gallery’s panes hold whatever looks into them, including, with a little practice, a fist.' },
  'pk_rimecaller_cold_blood': { flavour: 'When the hearth runs low, Rimecallers think colder, not faster. Halla calls it thrift; apprentices call it chilblains.' },
  'pk_rimecaller_blizzard_heart': { flavour: 'Glacierhome held a whole night still for thirty years. Slowing a few wolves is hardly worth the ink.' },
  // School of Rime
  'pk_rime_frostbite': { flavour: 'Frostbite is the cold’s way of keeping a souvenir. The Archive has a drawer of them, labelled.' },
  'pk_rime_icicle_edge': { flavour: 'An icicle is a sword the roof has spent all winter sharpening. Wardens knock them down before they drop.' },
  'pk_rime_glacial_skin': { name: 'Fourth Layer', flavour: 'Wool, then fur, then oilskin, and a fourth layer of pure Frostmere stubbornness on top.' },
  'pk_rime_frozen_retort': { flavour: 'In Frostmere a cold answer is the politest kind. It also leaves the questioner unable to feel their face.' },
  'pk_rime_ice_block': { flavour: 'When the city began to melt, the Regent froze the hour. Smaller workings serve for smaller emergencies.' },
  'pk_rime_clear_mind': { name: 'Cold Clarity', flavour: 'A cold room keeps a clear head, which is why no fire has been lit in the Hall of Held Hours since it was built.' },
  'pk_rime_snowfall': { flavour: 'Snow comes down soft and adds up. The Wardwall has a saying about it, and a roof that has been rebuilt often.' },
  'pk_rime_winter_patience': { flavour: 'What stays still, lasts. Frostmere’s oldest proverb, carved over the Archive door and on most of its gravestones.' },
};

export const SPELLS: Record<string, SpellText> = {
  'spell:frost-rampart': { flavour: 'The Wardwall in small: one slab of ice, one Warden behind it, and nothing getting past either.' },
  'spell:guardians-step': { flavour: 'Dagny’s first order to recruits: when someone falls, close the gap. She repeats it, loudly, just in case.' },
  'spell:glacial-reckoning': { flavour: 'A whole winter’s cold is stored in the Wardwall’s stones. A Warden can spend it in a single breath.' },
  'spell:frozen-lance': { flavour: 'The Archive’s straightest line, and the only one an archivist will happily see crossed out.' },
  'spell:cold-snap': { flavour: 'For a moment everything near you is held, as Glacierhome was held. It is a very short thirty years.' },
  'spell:whiteout': { flavour: 'In a Frostmere whiteout you cannot see your own hand. Rimecallers prefer it when you cannot see theirs.' },
};
