/**
 * Builds text, school of fist (Claude 4; overlay on Claude 3 / Claude 5's mechanics, docs/systems/BUILDS.md phase 8).
 * Keyed by frozen ids: perks pk_* (perks-fist.ts) and the school's new kit spells (kit-spells-new.ts). Flavour only, no
 * numbers (they are still being tuned); `name` only where the working name is replaced. Owner: Claude 4.
 */
import type { BuildText, SpellText } from '../hc-builds-text';

export const PERKS: Record<string, BuildText> = {
  // ── Monk (Stonecloister)
  pk_monk_swift_palms: { flavour: 'Novices count the palms aloud. Somewhere past eighty the counting stops, and the palms carry on without them.' },
  pk_monk_flowing_strikes: { flavour: 'Water never hurries down the Thousand Stairs, and never stops. Be the water, novices are told, and mind the tea stalls.' },
  pk_monk_open_palm: { flavour: 'An open hand can offer tea or end an argument. In Stonecloister it usually does both, in that order.' },
  pk_monk_endless_flurry: { flavour: 'Every good blow makes the next one easier, the Abbess says. She says the same of fibs, and of second helpings.' },
  pk_monk_wide_sweep: { flavour: 'Taught on the Prayer Terraces, where the goats learned it first and have never let the novices forget it.' },
  pk_monk_still_water: { flavour: 'Still water waits for whatever falls into it. A monk waits for much the same, only standing over it.' },
  pk_monk_whirling_staff: { flavour: 'Land, turn, and let the staff finish the sentence. The Bell Courts have heard every word of it.' },
  pk_monk_ascetic: { flavour: 'Give up the armour, the boots and the second bowl of broth. The Abbess keeps the broth, for safekeeping.' },
  pk_monk_deep_calm: { flavour: 'The Ninefold Abbot meditated so hard he split into nine. Aim for slightly less calm than that.' },
  pk_monk_light_feet: { flavour: 'Every path in Mountainreach is a stair. Climb them all day for a year and you stop counting, then stop puffing.' },
  pk_monk_empty_hand: { flavour: 'Come with nothing in your hands and leave with whatever you need. The Cloud Kitchen cooks call that theft.' },
  pk_monk_breath: { flavour: 'The mountain has been breathing in for a thousand years. The monks are waiting to hear what it says.' },
  // ── Brawler (the Lowfold Pits)
  pk_brawler_loaded_fist: { flavour: 'The bookies of Knuckletown check every glove for horseshoes. They have never once thought to check the arm.' },
  pk_brawler_knockout: { flavour: 'Pops has a rule for the big one: wait till they’re tired, then wait till you’re angry, then stop waiting.' },
  pk_brawler_haymaker_heart: { flavour: 'Nobody in the Lowfold Pits saves anything for later. Later is when the bookies collect.' },
  pk_brawler_glass_jaw: { flavour: 'Hit first, hit hard and never let them find out. Doc Lint has made a good living off the ones who did.' },
  pk_brawler_on_the_ropes: { flavour: 'The ropes are the safest place in the ring, Pops says, as long as you remember to leave them.' },
  pk_brawler_iron_chin: { flavour: 'Big Mother Ox has taken every punch in the Lowfold for nineteen years, and complained about only one.' },
  pk_brawler_counterpunch: { flavour: 'Let them say their piece, then answer it. In the Pits that counts as good manners.' },
  pk_brawler_take_a_hit: { flavour: 'Every bruise in Knuckletown is a lesson. Some of its fighters are very well educated.' },
  pk_brawler_quick_recovery: { flavour: 'Pops keeps the count by stirring the noodles. You are expected up before they’re done.' },
  pk_brawler_tough_as_nails: { flavour: 'A Lowfold fighter mends between bouts, between rounds and, if pushed, between punches.' },
  pk_brawler_last_round: { flavour: 'The bookies stop taking bets on the last round. Too many favourites have lost it to someone with nothing left to lose.' },
  pk_brawler_crowd_pleaser: { flavour: 'Knuckletown cheers anyone still standing. Stand long enough and they bring out the bunting.' },
  // ── Fist school
  pk_fist_iron_fists: { name: 'Granite Knuckles', flavour: 'Stonecloister novices strike the same stone every morning. After ten years, one of them wins.' },
  pk_fist_combo_master: { name: 'Stair Rhythm', flavour: 'Every landing on the Thousand Stairs has a tea stall. Climb in time: step, step, step, tea.' },
  pk_fist_hardened_body: { flavour: 'Pops calls it conditioning and the Abbess calls it stillness. Both mean being hit until it stops mattering.' },
  pk_fist_evasion: { name: 'Goat-Footed', flavour: 'No monk has ever landed a blow on a Prayer Terrace goat. The monks have stopped pretending they tried.' },
  pk_fist_stone_stance: { flavour: 'Stand like the mountain, the Abbess teaches. The mountain has been kicked by better than this.' },
  pk_fist_deep_breath: { flavour: 'Breathe in at the foot of the stair and out at the top. Novices who forget the middle are carried down.' },
  pk_fist_ki_flow: { name: 'Bellows Breath', flavour: 'The Cloud Kitchen fires are fanned by breath alone. Its cooks have the finest lungs on the mountain, and the worst tempers.' },
  pk_fist_discipline: { flavour: 'Shirin Tal won her abbacy at stones. Discipline, she says, is knowing exactly which rules you are cheating at.' },
};

export const SPELLS: Record<string, SpellText> = {
  // ── Monk
  'spell:flowing-palm': { flavour: 'Water does not strike the stone once. It simply never stops, and the stone always tires first.' },
  'spell:wind-walk': { flavour: 'A monk who masters it reaches the top of the Thousand Stairs before the tea goes cold. Nobody else ever has.' },
  'spell:crane-kick': { flavour: 'Learned from the cranes on the high tarns, who never once agreed to teach it.' },
  // ── Brawler
  'spell:uppercut': { flavour: 'Knuckletown calls it showing them the sky. Most fighters have never seen so much of it at once.' },
  'spell:bob-and-weave': { flavour: 'Pops learned it ducking his wife’s ladle, he says. Marta, he adds, never once missed.' },
  'spell:knockout-blow': { flavour: 'The whole Grand Pit goes quiet while you wind it up. Then the bookies start crying.' },
};
