/**
 * Builds text, school of storm (Claude 4; overlay on Claude 3 / Claude 5's mechanics, docs/systems/BUILDS.md phase 8).
 * Keyed by frozen ids: perks pk_* (perks-storm.ts) and the school's new kit spells (kit-spells-new.ts). Flavour only, no
 * numbers (they are still being tuned); `name` only where the working name is replaced. Owner: Claude 4.
 */
import type { BuildText, SpellText } from '../hc-builds-text';

export const PERKS: Record<string, BuildText> = {
  // Stormlancer (the Thunderclap Heights, the Lance Clans)
  'pk_stormlancer_bright_lance': { flavour: 'A clan lance is tipped in copper and blessed in rain. It is also struck by lightning, often, on purpose.' },
  'pk_stormlancer_momentum': { flavour: 'A charge does not end when the ram stops. Ask anyone still flying over its head.' },
  'pk_stormlancer_thunderstep': { flavour: 'On the Heights the lightning strikes in patterns. Lancers learn to land exactly where it is about to.' },
  'pk_stormlancer_lancers_reach': { flavour: 'A longer lance reaches further and tires the rider sooner. The clan elders argue it out at every Thunderclap Run.' },
  'pk_stormlancer_live_wire': { flavour: 'Some lancers are born with a spark in them. The rams can tell, and refuse to stand downwind.' },
  'pk_stormlancer_arc_reach': { name: 'Long Fork', flavour: 'Lightning never strikes one thing when it can strike several. The Lance Clans think this very sociable of it.' },
  'pk_stormlancer_overload': { flavour: 'A shocked foe twitches like a ram at shearing. Lancers learn to strike in the twitch.' },
  'pk_stormlancer_static_field': { flavour: 'Stand near a Stormlancer in a storm and your hair rises to meet them. So, worryingly, does your sword.' },
  'pk_stormlancer_open_sky': { flavour: 'Under an open sky the bolt always knows where you are. Lancers count this as an advantage.' },
  'pk_stormlancer_thunderhead': { flavour: 'Strike-Reader Osric Quell insists the storm only answers good form. He has a scorch on every boot.' },
  'pk_stormlancer_eye_of_storm': { flavour: 'At the heart of the worst storm is the stillest place in Thunderreach. Lancers try to carry a little of it.' },
  'pk_stormlancer_galeborn': { flavour: 'Clan children ride before they walk, and run before they ride. Odran fell off before he did any of them.' },
  // Sparkwright (Spirehold, the Coil Guild)
  'pk_sparkwright_tuned_coils': { flavour: 'Ma Ohmsworth tunes copper like harp strings. A well-tuned coil sings; a badly tuned one sings louder, once.' },
  'pk_sparkwright_high_voltage': { name: 'Hot Copper', flavour: 'Coil Street rule: never touch copper that hums. Guildmother Tess has the missing eyebrows to show why.' },
  'pk_sparkwright_feedback': { name: 'Returning Spark', flavour: 'A good spell, like a good kettle, gives back a little of the heat you put in. Tess holds the patents to prove it.' },
  'pk_sparkwright_overclock': { name: 'Overwound', flavour: 'Wind the spring past the stop and it runs faster, hotter and briefly. Spirehold calls this “testing”.' },
  'pk_sparkwright_quick_build': { name: 'Rush Job', flavour: 'Coil Street workshops explode on the hour, politely, one at a time. The fast builders explode on the half-hour.' },
  'pk_sparkwright_better_parts': { flavour: 'The difference between a Coil Sentry and a heap of scrap is mostly the quality of the parts, and partly luck.' },
  'pk_sparkwright_grid': { name: 'Copper Web', flavour: 'A machine alone is an invention. Machines together are a workshop, and the Guild starts charging rent.' },
  'pk_sparkwright_spare_parts': { flavour: 'A Sparkwright’s coat is half pockets, and every pocket is half a machine. Some days that is armour.' },
  'pk_sparkwright_surge': { flavour: 'The Dynamo Halls never stop turning. Push the lever further and they turn faster and complain louder.' },
  'pk_sparkwright_capacitor': { name: 'Storm Jar', flavour: 'Spirehold bottles lightning in glass jars with copper lids. Label yours clearly; the jam is kept on the same shelf.' },
  'pk_sparkwright_discharge': { flavour: 'A Sparkwright who keeps too much in will let it out sooner or later, usually at a dinner party.' },
  'pk_sparkwright_insulated': { flavour: 'Rubber-backed, by Guild order, after the incident. Nobody will say which incident. There have been several.' },
  // School of Storm
  'pk_storm_crackle': { flavour: 'Thunderreach air crackles before every storm. Spirehold children learn to count the crackle, and then to run.' },
  'pk_storm_forked': { flavour: 'Lightning forks because it cannot make up its mind. The Coil Guild tried to patent this and was refused.' },
  'pk_storm_grounded': { flavour: 'Plant your feet and let the strike go into the ground. The ground has had worse, and will not complain.' },
  'pk_storm_static_skin': { flavour: 'Thunder-ram wool crackles when stroked. Stroke a Storm mage the wrong way and you will get the same.' },
  'pk_storm_lightning_reflexes': { flavour: 'The Storm school believes in going first and apologising after. The quick ones seldom have to apologise.' },
  'pk_storm_charged': { flavour: 'A charged mind hums like a tower in the rain. Guildmother Tess recommends a sit-down afterwards.' },
  'pk_storm_kinetic': { name: 'Stamp and Spark', flavour: 'Stamp on a Spirehold rug and you will spark. The Guild built a whole hall on this before anyone asked why.' },
  'pk_storm_tempest_mind': { name: 'Quick Weather', flavour: 'Thunderreach weather changes faster than you can remark on it. Its mages try very hard to keep up.' },
};

export const SPELLS: Record<string, SpellText> = {
  'spell:thunder-charge': { flavour: 'The Lance Clans charge the storm when it will not pass. Smaller things than storms seldom wait to be charged.' },
  'spell:static-guard': { flavour: 'Thunder-ram wool, worn on the inside. Anyone who strikes you learns why the rams are left alone.' },
  'spell:storm-spear': { flavour: 'Odran’s advice on throwing your lance: don’t. His advice once you have: run after it.' },
  'spell:arc-mine': { flavour: 'Coil Guild patent pending, again. Kindly do not tread on the patent.' },
  'spell:magnet-coil': { flavour: 'It pulls at nails, buckles, teeth and enemies, in roughly that order. Leave your spoons at home.' },
  'spell:static-nova': { flavour: 'Every workshop on Coil Street at once. Tess would like it known that this was not her idea, this time.' },
};
