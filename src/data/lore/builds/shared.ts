/**
 * Builds text shared across schools (Claude 4): shared keystones (ks_*), weapon mastery (`${classId}:${weapon}`),
 * affix labels (pre_* / suf_*), runes (rn_*), build materials and tomes, and (once uniques.ts is fixed) uniques.
 * Flavour only, no numbers. Owner: Claude 4.
 */
import { HC_AFFIXES } from '@/data/items/hc/affixes';
import { HC_CLASSES } from '@/data/classes/hc/classes.gen';
import type { AffixText, BuildText } from '../hc-builds-text';

export const KEYSTONES: Record<string, BuildText> = {
  ks_blood_magic: { flavour: 'The Reavers call it paying in the old coin. The Conclave calls it unlicensed, which is how you know it works.' },
  ks_iron_grip: { flavour: 'Learned your letters? Good. Now hit something with them.' },
  ks_arcane_edge: { flavour: 'Every blow strikes a little spark back. Sparkwrights call it thrift; duellists call it cheating.' },
  ks_glass_cannon: { name: 'Burning Bright', flavour: 'A candle lit at both ends lights the whole room beautifully, and briefly.' },
  ks_untouchable: { flavour: 'Fennick’s first rule of fooling: be somewhere else when the pie lands.' },
  ks_conduit: { flavour: 'Stand close enough to a bonfire and everyone gets warm, friend or otherwise.' },
  ks_pack_leader: { flavour: 'Bannock says a good hunter walks at the back and lets the hounds have the glory.' },
  ks_elementalist: { flavour: 'Every school’s fire burns its own colour. Learn enough of them and the colours start arguing on your side.' },
  ks_spellblade: { flavour: 'Fight to a rhythm, and on the last beat of the bar let the magic answer for you.' },
  ks_juggernaut_heart: { name: 'Unmoved', flavour: 'Big Aud Fenner held up the roof for a whole night and never noticed she was being shouted at.' },
  ks_executioner: { flavour: 'Finish what you start. Start nothing you cannot finish. Edgewater has it carved over the Ladder door.' },
  ks_vampire: { name: 'Bloodkin', flavour: 'What you spill, you keep. It is an old Muster habit, and the healers have never forgiven it.' },
  ks_ember_shield: { flavour: 'Spirehold engineers stand inside their own sparks. The sparks, out of professional courtesy, go round.' },
  ks_berserker: { flavour: 'The Red Muster says a wound is only your body arguing. Win the argument.' },
  ks_fortress: { flavour: 'An Ironhold saying: a wall that walks is just a cart. Stand still and be a wall.' },
  ks_tempest: { name: 'The Last Beat', flavour: 'Stormlancers count the beats between strikes. On the last beat, the sky joins in.' },
  ks_hoarder: { flavour: 'Velvet Harbour wisdom: nobody ever lost a fight by stopping to pick up the money. Several lost one that way.' },
  ks_phase_step: { flavour: 'Duskmere thieves never land where they jumped from. They land where a shadow was waiting for them.' },
  ks_chain_reaction: { flavour: 'Kilnhold’s fire wardens have a word for what happens when one barrel goes up. The word is “barrels”.' },
  ks_lifebinder: { flavour: 'Mother Yarrow’s rule: tend the wound and the hand that bandages it. Neither heals alone.' },
};

export const MASTERY: Record<string, BuildText> = {
  'warden:sword': { flavour: 'The Wall’s oldest blades were forged to hold a line, not to win a fight. They have held it a very long time.' },
  'warden:mace': { flavour: 'Wardens say a mace is a sword that has stopped making excuses.' },
  'warden:spear': { flavour: 'Keep them at the end of the spear, pup, and the Wall keeps you.' },
  'rimecaller:staff': { flavour: 'Cut from the one tree in Frostmere that grows slowly enough to suit an archivist.' },
  'rimecaller:wand': { flavour: 'A sliver of the held hour, sharpened. It is always slightly colder than the room.' },
  'ranger:bow': { flavour: 'Holt’s rule: if you can see the whites of their eyes, you have walked too close.' },
  'hedgewitch:staff': { flavour: 'Bent by a hedge, not by a carpenter, and twice as clever for it.' },
  'hedgewitch:wand': { flavour: 'Mother Yarrow keeps one in every pot of nettles, just in case.' },
  'arcanist:staff': { flavour: 'Every Kilnhold staff is licensed. This one has the permit nailed to it.' },
  'arcanist:wand': { flavour: 'Cinder wands are cheap, quick and warm. Magister Thrane calls them adolescent.' },
  'reaver:axe': { flavour: 'The Red Muster gives every recruit an axe and one piece of advice: hold the sharp end away from you.' },
  'reaver:sword': { flavour: 'A sword is an axe that went to school. The Muster forgives it.' },
  'reaver:mace': { flavour: 'Hammered out of a pyre-grate after the fire went out. It remembers.' },
  'stormlancer:spear': { flavour: 'A lance is a promise to arrive first. The Lance Clans keep their promises at a gallop.' },
  'sparkwright:wand': { flavour: 'Coil Guild regulation issue. Do not lick.' },
  'sparkwright:staff': { flavour: 'Every Spirehold rooftop has one, and every Spirehold rooftop has been very lucky.' },
  'sparkwright:mace': { flavour: 'Guildmother Ampery’s first invention was a spanner. Her second was a better spanner.' },
  'oathbound:mace': { flavour: 'Blessed at dawn, polished at noon, swung at whoever is still arguing at dusk.' },
  'oathbound:sword': { flavour: 'The Shorewatch swear on their blades and then, sensibly, keep them sharp.' },
  'cantor:mace': { flavour: 'It swings like a censer. It also swings like a mace. The Cathedral likes to be prepared.' },
  'cantor:wand': { flavour: 'Rung once a day, at the Hour of Lamps, by somebody very patient.' },
  'cantor:staff': { flavour: 'Carried at the head of every procession, and now and then into the head of anyone who interrupts one.' },
  'shade:dagger': { flavour: 'Duskmere glass, ground so thin it forgets to cast a shadow.' },
  'shade:sword': { flavour: 'The Veil’s oath is lift, keep and give back warm. The sword does the lifting.' },
  'duskweaver:wand': { flavour: 'A wand for drawing the thread out of the night, one stitch at a time.' },
  'duskweaver:staff': { flavour: 'Cut on the one night a year when Nocturne’s moon goes out. Nobody remembers which night.' },
  'duskweaver:dagger': { flavour: 'For cutting threads, sealing letters and, now and then, more than either.' },
  'swordsman:sword': { flavour: 'Maestra Ferro’s first lesson: the blade is the polite part. You are the rude part.' },
  'samurai:sword': { flavour: 'Ikeda keeps every sheath Old Tomoe sends him. The swords he gives away.' },
  'knight:sword': { flavour: 'Every Knight of the Order is handed this sword once, and told to be worthy of it every morning after.' },
  'knight:mace': { flavour: 'Ironhold calls it a morning star. Its targets call it the end of the morning.' },
  'knight:spear': { flavour: 'Built for a charge across the March. It still points, hopefully, at the horizon.' },
  'juggernaut:mace': { flavour: 'A Rivet Town tool first, a weapon second, and an argument settler at the end of a shift.' },
  'juggernaut:axe': { flavour: 'Swung by the shift that finishes the job, never the shift that starts it.' },
  'monk:staff': { flavour: 'The Abbess says a staff is a stair you carry with you.' },
  'monk:spear': { flavour: 'Every monk at Stonecloister digs the garden with it. Some of them dig other things.' },
  'brawler:mace': { flavour: 'Pops says it isn’t a club, it’s a strong suggestion.' },
  'brawler:dagger': { flavour: 'Knuckletown issue. Wear them on the hand you don’t write with.' },
  'huntsman:bow': { flavour: 'The Lodge doesn’t trust a weapon you can carry loaded. The Lodge also doesn’t miss.' },
  'falconer:bow': { flavour: 'Light enough to draw with a hawk on the other arm, and the hawk approves.' },
  'falconer:dagger': { flavour: 'Wren calls it the beak. She means it kindly.' },
  'corsair:sword': { flavour: 'Every Fleet cutlass is notched once for every captain who tried to buy it.' },
  'corsair:dagger': { flavour: 'Dot keeps one in each boot, and a third that nobody has found yet.' },
  'jester:dagger': { flavour: 'A fool keeps three in the air at once. The fourth is for emergencies.' },
  'jester:wand': { flavour: 'Covered in bells, so the court always knows exactly which way to duck.' },
  'bard:wand': { flavour: 'Strung like a lute and swung like a conductor’s baton, depending on the audience.' },
  'bard:dagger': { flavour: 'Every bard carries a dirk. Not every critic knows it.' },
  'skald:axe': { flavour: 'The beard on the axe is for hooking shields. The beard on the Skald is just for show.' },
  'skald:mace': { flavour: 'Strike it and the Fells answer from three valleys away.' },
};

/** "+1 to all <school> spells": a word of each school's own */
const SCHOOL_LABEL: Record<string, string> = {
  ash: 'Kiln-blessed', rime: 'Hour-held', storm: 'Thunder-struck', radiance: 'Lamp-lit', umbral: 'Dusk-woven', verdant: 'Root-bound',
  blade: 'Ladder-tried', iron: 'Forge-sworn', fist: 'Stair-climbed', hunt: 'Lodge-marked', guile: 'Fool’s-gold', song: 'Choir-tuned',
};
/** the few ids whose words don't read well when spelled out from the id */
const LABEL: Record<string, string> = { pre_mighty: 'Mighty', pre_channelling: 'Channelling', suf_of_vigour: 'of Vigour' };
const titled = (id: string): string => id.replace(/^(pre|suf)_/, '').split('_')
  .map((w, i) => (i > 0 && (w === 'of' || w === 'the') ? w : w[0].toUpperCase() + w.slice(1))).join(' ').replace(/^Of /, 'of ');
const className = (id?: string): string => HC_CLASSES.find((c) => c.id === id)?.name ?? '';

/**
 * Affix words on the item name, for every affix id. Hand-made affixes read from their ids ('pre_burning' → "Burning",
 * 'suf_of_the_frost_step' → "of the Frost Step"); a class's "+1 to <kit spell>" is "<Class>’s" (they only roll for that
 * class); "+1 to all <school> spells" takes the school's word.
 */
export const AFFIXES: Record<string, AffixText> = Object.fromEntries(HC_AFFIXES.map((a) => {
  if (LABEL[a.id]) return [a.id, { label: LABEL[a.id] }];
  const school = /^pre_lvl_school_([a-z]+)$/.exec(a.id)?.[1];
  if (school) return [a.id, { label: SCHOOL_LABEL[school] }];
  if (a.id.startsWith('pre_lvl_') && a.only?.classId) return [a.id, { label: `${className(a.only.classId)}’s` }];
  return [a.id, { label: titled(a.id) }];
}));

export const RUNES: Record<string, BuildText> = {
  rn_volley: { flavour: 'Spirehold engineers solve every problem with more of the thing. Sometimes it works.' },
  rn_chain: { flavour: 'Like gossip in Velvet Harbour: it never stops at the first person it hits.' },
  rn_pierce: { flavour: 'The Lodge carves it on arrowheads meant for hunts that cannot afford a second shot.' },
  rn_split: { flavour: 'Cut a spell in three and each part still remembers what the whole was for.' },
  rn_wide: { flavour: 'For the Magister who wants the whole street to know who cast it.' },
  rn_linger: { flavour: 'Kilnhold children are told not to stand where a spell has been. They do it anyway.' },
  rn_burst: { flavour: 'Why say a thing many times when you could shout it once?' },
  rn_haste: { flavour: 'Carved with a running stroke, by a smith who was already late for something.' },
  rn_echo: { flavour: 'Cut in the Answering Cave, where every word comes back, eventually, in a better voice.' },
  rn_thrift: { flavour: 'A Tidecourt rune. It does the same work for less and never asks where the savings went.' },
  rn_power: { flavour: 'More of everything, including the bill. The Coil Guild approves of both halves.' },
  rn_ward: { flavour: 'The Shorewatch scratch it inside their helmets, where nobody can see it but the sea.' },
  rn_leech: { flavour: 'The Red Muster’s rune: whatever you spend in a fight, take some of it back.' },
  rn_twin: { flavour: 'The Moonwell twins swear it was carved for them. Both of them swear it, at once.' },
  rn_long: { name: 'Rune of the Long Hour', flavour: 'Cut by an archivist of Glacierhome, who saw no reason anything should ever end promptly.' },
  rn_convert_ash: { flavour: 'The spell comes out smelling faintly of the Great Kiln, and of somebody’s eyebrows.' },
  rn_convert_rime: { flavour: 'The spell comes out cold, patient and very slightly disapproving.' },
  rn_convert_storm: { flavour: 'The spell comes out crackling, and leaves everyone’s hair standing up behind it.' },
  rn_convert_radiance: { flavour: 'The spell comes out polished. The Cathedral will be pleased.' },
  rn_convert_umbral: { flavour: 'The spell comes out quiet, and leaves no shadow on the ground behind it.' },
  rn_convert_verdant: { flavour: 'The spell comes out green and growing, and something has already rooted in it.' },
  rn_convert_blade: { flavour: 'The spell comes out with an edge on it, and bows before it strikes.' },
  rn_convert_iron: { flavour: 'The spell comes out heavy, and lands like a shift ending.' },
  rn_convert_fist: { flavour: 'The spell comes out barefoot, and has climbed a great many stairs to get here.' },
  rn_convert_hunt: { flavour: 'The spell comes out on the scent, and does not stop until it has found its quarry.' },
  rn_convert_guile: { flavour: 'The spell comes out grinning, and has picked a pocket on its way.' },
  rn_convert_song: { flavour: 'The spell comes out in tune, and somebody in the back row is humming along.' },
};

export const ITEMS: Record<string, BuildText> = {
  i_runedust: { flavour: 'What is left when a good sword is ground down to its ideas. It glitters with them.' },
  i_essence_ash: { flavour: 'A pinch of the first fire, in a jar the Conclave insists you have a permit for.' },
  i_essence_rime: { flavour: 'A minute of the held hour, bottled. Do not open it in a hurry.' },
  i_essence_storm: { flavour: 'It crackles in the jar and points, always, towards the nearest tall thing.' },
  i_essence_radiance: { flavour: 'A spoonful of the Hour of Lamps. It lights the inside of your pack.' },
  i_essence_umbral: { flavour: 'You cannot see it in the jar. That is how you know it is still in there.' },
  i_essence_verdant: { flavour: 'Keep it in the dark and water it on Sundays. It has opinions about both.' },
  i_essence_blade: { flavour: 'It rings when you shake it, and it always rings the same note as your sword.' },
  i_essence_iron: { flavour: 'Heavier than it looks, and twice as patient as the person carrying it.' },
  i_essence_fist: { flavour: 'It feels warm in the hand, and slightly as if it is waiting for you to stand up straight.' },
  i_essence_hunt: { flavour: 'It smells of pine, wet fur and a long walk home. Some hunters carry it just for that.' },
  i_essence_guile: { flavour: 'The jar is labelled honestly. That alone should make you suspicious.' },
  i_essence_song: { flavour: 'Hold it to your ear and it hums the first bar of something you nearly remember.' },
  t_meteor: { flavour: 'Written by a Magister of Kilnhold for readers he plainly expected to set fire to things.' },
  't_flame-wall': { flavour: 'The margins are scorched in exactly the places a student would have practised.' },
  t_blizzard: { flavour: 'A Rimecaller’s manual, indexed, cross-indexed and bound in something that never quite thaws.' },
  't_ice-lance': { flavour: 'The diagrams are all drawn very slowly, in a hand that never once rushed a line.' },
  't_ball-lightning': { flavour: 'Coil Guild approved. Chapter one is a list of things not to stand under.' },
  t_thunderclap: { flavour: 'Read it aloud and the windows rattle. Read it quietly and they still rattle a little.' },
  t_sunbeam: { flavour: 'Gilded on every page. The Cathedral does not believe in an unilluminated margin.' },
  t_sanctuary: { flavour: 'Copied out by the Close’s novices, each of whom added a small prayer of their own in the gutter.' },
  't_shadow-step': { flavour: 'Half the pages are blank. The other half insist the blank ones are the important ones.' },
  't_soul-siphon': { flavour: 'Bound in black, and slightly warmer than a book should be.' },
  t_overgrowth: { flavour: 'Something has been pressed between every page, and some of it is still growing.' },
  't_thorn-volley': { flavour: 'Mother Yarrow’s notes in the margins are mostly about keeping your elbows in.' },
  't_blade-dance': { flavour: 'An Edgewater manual of footwork, with the Ladder’s rules printed, as ever, on the back.' },
  't_perfect-parry': { flavour: 'The book has one lesson, repeated on every page, and the last page is a mirror.' },
  't_shield-wall': { flavour: 'Ironhold drill, in the order it is to be shouted. Every line ends “and hold”.' },
  t_earthshaker: { flavour: 'A Rivet Town manual. The binding has been repaired with rivets, twice.' },
  't_dragon-kick': { flavour: 'Every illustration is of the same monk, at a slightly different height off the ground.' },
  't_iron-skin': { flavour: 'The Abbess’s commentary runs to one line per chapter: “Stand up straight.”' },
  't_snare-trap': { flavour: 'Lodge knots, drawn from life. Several of the lives look very surprised.' },
  't_piercing-shot': { flavour: 'The Lodge’s old law is written inside the cover: take only what you need.' },
  't_smoke-bomb': { flavour: 'The title page says it belongs to the Thieves’ Exchange. The rest of the book disagrees.' },
  t_backstab: { flavour: 'Every chapter begins “Approach from behind”. So does the index.' },
  't_ballad-of-valour': { flavour: 'Sheet music from Lyrehaven, with the hard bars circled by an understudy in a hurry.' },
  't_war-drum': { flavour: 'A drum-book of the Fells. Each rhythm is named for whoever first played it too loud.' },
};


/** the twelve curated hybrid set bonuses (HC_HYBRIDS), keyed `${schools[0]}+${schools[1]}`; the effect line stays Claude 5’s */
export const HYBRIDS: Record<string, BuildText> = {
  'ash+rime': { name: 'Scald', flavour: 'Cinderreach and Frostmere have argued for a thousand years. Put them together and the argument boils.' },
  'rime+storm': { name: 'Hailstorm', flavour: 'Frostmere sends the cold, Thunderreach sends the wind, and everybody else sends apologies.' },
  'storm+iron': { flavour: 'Ironhold builds tall and Thunderreach strikes tall. Somebody had to stand in between, holding a shield.' },
  'iron+fist': { flavour: 'Anvilgate plate on a Stonecloister frame. The monks call it cheating. The knights call it a good start.' },
  'fist+blade': { flavour: 'Mountainreach fists and Steelvale steel, in no particular order and in great quantity.' },
  'blade+guile': { name: 'Dirty Fencing', flavour: 'Edgewater teaches the rules of the duel. Tidecourt teaches which ones nobody is watching.' },
  'guile+umbral': { flavour: 'Nocturne keeps the memories and Tidecourt sells them. Between the two, nobody quite sees you leave.' },
  'umbral+hunt': { flavour: 'The Greywilds hunt by day and Nocturne by dusk. Wear both and the quarry never gets an evening off.' },
  'hunt+verdant': { flavour: 'The Lodge takes only what the forest gives. In this coat, the forest gives rather a lot of roots.' },
  'verdant+song': { flavour: 'Wildheart grows it and Harmonia sings to it. Nothing in the meadow stays hurt for long.' },
  'song+radiance': { flavour: 'Solarian oaths set to Harmonian music. The choir keeps every promise, and keeps it on key.' },
  'radiance+ash': { flavour: 'Dawnspire’s light and Kilnhold’s fire. Mending a friend has never been so warm for everybody else.' },
};
