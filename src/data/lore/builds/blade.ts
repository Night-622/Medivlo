/**
 * Builds text, school of blade (Claude 4; overlay on Claude 3 / Claude 5's mechanics, docs/systems/BUILDS.md phase 8).
 * Keyed by frozen ids: perks pk_* (perks-blade.ts) and the school's new kit spells (kit-spells-new.ts). Flavour only, no
 * numbers (they are still being tuned); `name` only where the working name is replaced. Owner: Claude 4.
 */
import type { BuildText, SpellText } from '../hc-builds-text';

export const PERKS: Record<string, BuildText> = {
  // ---------- Swordsman (Edgewater)
  pk_swordsman_quick_guard: { flavour: 'Maestra Ferro’s first lesson is the guard. Her second is the guard. Her third, if you are lucky, is lunch.' },
  pk_swordsman_counter_rhythm: { flavour: 'Every parry is a question. The Salles of Edgewater teach that the answer should come quickly, and smart.' },
  pk_swordsman_perfect_parry: { flavour: 'Named for the Grand Salle’s automaton, which has never been touched, and has never been invited anywhere.' },
  pk_swordsman_open_guard: { flavour: 'Leave a gap in your guard and see who walks through it. On the Duelling Bridges, most of them land in the river.' },
  pk_swordsman_long_lunge: { flavour: 'Ferro learned the lunge from her grandmother, who sold eels, and never once let one get away.' },
  pk_swordsman_footwork: { flavour: 'In Edgewater they say a duel is won by the feet and signed by the sword. The feet never get the credit.' },
  pk_swordsman_flowing_steel: { flavour: 'Breathe out on the cut and in on the recovery. Breathe in on the cut and you will soon learn why not.' },
  pk_swordsman_lunging_cut: { flavour: 'Arrive point first, and the rest of you shortly after. It is the polite way to join a quarrel in Edgewater.' },
  pk_swordsman_storm_of_steel: { flavour: 'When a whole bridge challenges you at once, the Ladder still counts it as one bout each. Clerks love a crowd.' },
  pk_swordsman_battle_trance: { name: 'Ladder Fever', flavour: 'Ladder fever: the longer the bout goes on, the better you feel, and the worse you look.' },
  pk_swordsman_whirlwind_heart: { flavour: 'Win a bout and the bridge cheers. Win another straight after and they start laying bets on you.' },
  pk_swordsman_last_duellist: { flavour: 'Alone on the bridge, with no second and no crowd. Only then, Ferro says, do you learn what kind of duellist you are.' },
  // ---------- Samurai (the Hushpine Terraces)
  pk_samurai_drawn_blade: { flavour: 'The sheath, not the edge, is what a sword is for. So the Hushpine Order draws seldom, and very fast.' },
  pk_samurai_first_cut: { flavour: 'On the Temple Road speaking aloud is rude. The first cut is how a Samurai says good morning.' },
  pk_samurai_one_stroke: { flavour: 'Stand as still as a Hushpine until the mist gets bored and drifts away. Then cut, once.' },
  pk_samurai_bleeding_edge: { flavour: 'A clean cut takes a moment to be noticed. Hushpine novices count the breaths it takes, silently.' },
  pk_samurai_gale_step: { flavour: 'The wind through the Hushpines never stops to ask the way. Nor does the Samurai who learns to walk with it.' },
  pk_samurai_wind_breath: { flavour: 'Kanemori breathes so quietly that novices once held a mirror to his mouth. He found it rude, and said nothing.' },
  pk_samurai_passing_cut: { flavour: 'You pass, the foe turns, and only then does the cut arrive, like a letter that came the long way round.' },
  pk_samurai_ronin: { flavour: 'The Ronin Companies swear no oaths and keep no masters, and so they die young and beautifully dressed.' },
  pk_samurai_deep_focus: { name: 'Unspoken Word', flavour: 'Kanemori spends perhaps a word a month. Every one he does not say goes into the stillness instead.' },
  pk_samurai_zanshin: { flavour: 'After the cut, remain. The cut is finished; you are not. Hushpine novices paint it inside their rice bowls.' },
  pk_samurai_clear_water: { flavour: 'The Terrace tea-gardens are watered by hand, a cup at a time, until the mind is as clear as the cup.' },
  pk_samurai_death_poem: { flavour: 'Every Samurai keeps a death poem folded in one sleeve. The good ones are short. The best are never read.' },
  // ---------- Blade school
  pk_blade_keen: { flavour: 'Every child in Steelvale learns the sword before they learn to read. Some never quite get round to reading.' },
  pk_blade_hamstring: { flavour: 'A foe who cannot chase you cannot challenge you again, which on the Ladder is very nearly winning.' },
  pk_blade_parry_stance: { flavour: 'In Edgewater the parry is taught first and the cut second, so that the cut always has something to answer.' },
  pk_blade_second_guard: { flavour: 'The second’s duty: when your duellist falters, step close, stand square, and look as large as you can.' },
  pk_blade_sidestep: { flavour: 'The silver grass of Steelvale bends to the wind and springs back. The duellists who copy it live longest.' },
  pk_blade_endurance: { name: 'Duellist’s Lungs', flavour: 'A Ladder bout can run from breakfast to supper. Edgewater duellists train their wind on the bridges, at a run.' },
  pk_blade_tempo: { name: 'Fencer’s Measure', flavour: 'Keep the measure and the measure keeps you. Every salle master says it, usually while you are on the floor.' },
  pk_blade_honed_mind: { flavour: 'A whetstone for the blade and a quiet hour for the mind. The Hushpine Order holds that neither is optional.' },
};

export const SPELLS: Record<string, SpellText> = {
  'spell:counter-stance': { flavour: 'Stand ready and let them come. The Ladder board has a whole column for duellists who forgot to.' },
  'spell:disarm': { flavour: 'A twist of the wrist and the grip goes slack. Celandine Sallow does the same thing with a well-chosen insult.' },
  'spell:dancing-steel': { flavour: 'Blade Dancers cross the Bamboo Shallows without a splash. Their students mostly master the dancing.' },
  'spell:crescent-cut': { flavour: 'A cut shaped like the new moon over the Terraces: thin, bright, and gone before you look up.' },
  'spell:mountain-stance': { flavour: 'Be the mountain, says the Hushpine scroll. Mountains do not hurry, and nothing hurries past them.' },
  'spell:falling-petals': { flavour: 'Hushpine blossom falls all at once in spring. So, if they are unlucky, does the Samurai’s opponent.' },
};
