/**
 * Builds text, school of verdant (Claude 4; overlay on Claude 3 / Claude 5's mechanics, docs/systems/BUILDS.md phase 8).
 * Keyed by frozen ids: perks pk_* (perks-verdant.ts) and the school's new kit spells (kit-spells-new.ts). Flavour only, no
 * numbers (they are still being tuned); `name` only where the working name is replaced. Owner: Claude 4.
 */
import type { BuildText, SpellText } from '../hc-builds-text';

export const PERKS: Record<string, BuildText> = {
  // ---------- Ranger (the Thornwilds)
  pk_ranger_full_quiver: { flavour: 'Holt Barrow packs a full quiver and no lunch. He says the wilds provide. Mostly they provide nettles.' },
  pk_ranger_long_draw: { flavour: 'Thornwilds paths move in the night, so Wayfarers shoot from a long way off, before the path changes its mind.' },
  pk_ranger_barbed_heads: { flavour: 'Barbed heads go in easily and come out with opinions. Wayfarers file their own, and are proud of the opinions.' },
  pk_ranger_extra_arrow: { name: 'Doubled Nock', flavour: 'Two arrows on one string. Holt calls it showing off, and does it whenever somebody is watching.' },
  pk_ranger_quick_snare: { flavour: 'A Wayfarer can set a snare walking, talking or half asleep. Fully asleep is frowned upon, but it has been done.' },
  pk_ranger_hold_fast: { flavour: 'Holt Barrow’s joke begins: a beetle, a boar and a Circle witch walk into a snare. Nobody has heard the rest.' },
  pk_ranger_thorn_burst: { flavour: 'Everything in the Thornwilds has thorns, including the advice. Especially the advice.' },
  pk_ranger_skirmisher: { flavour: 'Stand still in the Thornwilds and something grows on you. Wayfarers keep moving, and stay mostly free of moss.' },
  pk_ranger_sharp_eye: { flavour: 'The heron stands in the Bloomfen all day and misses nothing. The Wayfarers stand beside it and take notes.' },
  pk_ranger_deadeye: { flavour: 'At Wayfarer’s Rest the target is a pine cone on a string. The best shots cut the string instead, to spare the cone.' },
  pk_ranger_still_hunter: { flavour: 'Be the tree, says the Wayfarers’ first lesson. The second lesson is that trees do not sneeze.' },
  pk_ranger_hawk_reflex: { flavour: 'A heron waits an age and strikes in a blink. Rangers try to copy both halves, and mostly manage the waiting.' },
  // ---------- Hedgewitch (Rootholme)
  pk_hedgewitch_long_lash: { flavour: 'Mother Yarrow asks the brambles nicely before she throws them. They go further for being asked.' },
  pk_hedgewitch_thornbound: { flavour: 'In Rootholme a bramble that takes hold does not let go until it is thanked, and sometimes not even then.' },
  pk_hedgewitch_bitter_sap: { flavour: 'Sap from the Sap Wells is sweet at the top and bitter at the bottom. Hedgewitches bottle the bottom.' },
  pk_hedgewitch_wild_growth: { flavour: 'Can there be too much life? The Elder Tree grows a ring a day, swallowing streets, and is no help with the answer.' },
  pk_hedgewitch_strong_brew: { flavour: 'Nettle, yarrow and whatever was nearest. Mother Yarrow says the secret is stirring with conviction.' },
  pk_hedgewitch_herbalist: { flavour: 'Every Hedgewitch knows a herb for every ailment, and a second herb for what the first one does to you.' },
  pk_hedgewitch_overgrowth: { flavour: 'When a Hedgewitch mends somebody, the ground mends with her, and holds on to anyone who tries to interrupt.' },
  pk_hedgewitch_tea_circle: { flavour: 'The Root Circle meets in a ring and disagrees in a ring, but nobody has ever once refused the tea.' },
  pk_hedgewitch_bright_moths: { flavour: 'Moths come to a lantern the way gossip comes to the Bough Markets: quickly, and in great numbers.' },
  pk_hedgewitch_moth_dust: { flavour: 'Moth dust in the eyes is quite harmless, the witches say, unless you were hoping to see anything.' },
  pk_hedgewitch_mothkin: { flavour: 'Hedgewitch moths are raised on sugared sap and lantern light. They are loyal, greedy and alarmingly large.' },
  pk_hedgewitch_lantern_light: { flavour: 'A lantern gutters lowest just before it catches. So, says Mother Yarrow, do Hedgewitches.' },
  // ---------- Verdant school
  pk_verdant_rootcraft: { flavour: 'Growth and rot are one thing seen from two ends. Rootcraft is knowing which end to hold.' },
  pk_verdant_venom: { flavour: 'Wildheart is generous with its poisons. It has so very many, and it does so like to share.' },
  pk_verdant_barkskin: { flavour: 'Hedgewitches say a good bark is worse than a bite. Rangers only say it keeps the rain off.' },
  pk_verdant_thornskin: { flavour: 'Bloomkin grow thorns where other folk grow manners. Nobody is sure yet whose side the thorns are on.' },
  pk_verdant_regrowth: { flavour: 'Cut a hedge to the root and it is back by spring, crosser than before and twice as thick.' },
  pk_verdant_green_sap: { flavour: 'Rootholme runs on sap: sweet in the pancakes, sticky on the stairs and green in the veins of everyone born there.' },
  pk_verdant_forager: { flavour: 'A Wayfarer never walks home with empty pockets. Mushrooms, mostly. Sometimes even the right ones.' },
  pk_verdant_seasons: { flavour: 'Everyone in Wildheart argues about compost. Nobody argues with the seasons; they always win in the end.' },
};

export const SPELLS: Record<string, SpellText> = {
  'spell:piercing-arrow': { flavour: 'A Wayfarer’s arrow goes through bramble, beetle and boar, and stops for nothing but a good tree.' },
  'spell:vault': { name: 'Parting Snare', flavour: 'Leave a gift on the path for whoever is following. The Thornwilds taught the Wayfarers their manners.' },
  'spell:rain-of-arrows': { flavour: 'Bloomfen folk call it Wayfarer weather: overcast, with a sudden chance of arrows.' },
  'spell:strangling-vines': { flavour: 'The vines were only resting. They were waiting for somebody to stand still in the wrong place.' },
  'spell:bottled-sunlight': { flavour: 'Corked at noon in the Canopy Hollows, where the light is thickest. Shake well. Do not open in the dark.' },
  'spell:moth-swarm': { flavour: 'Open the lantern and the moths come out hungry. They prefer wool, but they will settle for faces.' },
};
