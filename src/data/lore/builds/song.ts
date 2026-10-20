/**
 * Builds text, school of song (Claude 4; overlay on Claude 3 / Claude 5's mechanics, docs/systems/BUILDS.md phase 8).
 * Keyed by frozen ids: perks pk_* (perks-song.ts) and the school's new kit spells (kit-spells-new.ts). Flavour only, no
 * numbers (they are still being tuned); `name` only where the working name is replaced. Owner: Claude 4.
 */
import type { BuildText, SpellText } from '../hc-builds-text';

export const PERKS: Record<string, BuildText> = {
  // ── Bard (Lyrehaven)
  pk_bard_full_chorus: { flavour: 'A busker with a full chorus behind him wins every turf war on the Busking Steps, until the chorus asks to be paid.' },
  pk_bard_anthem: { flavour: 'Every street in Lyrehaven has its own anthem. The Opera Quarter has three, and none of them agree.' },
  pk_bard_crescendo: { flavour: 'Every song must build, Rosalind says. She has been building to her comeback for seven years now.' },
  pk_bard_solo_act: { flavour: 'Rosalind never shared a stage, a dressing room or a curtain call. She shared a bow once, and still regrets it.' },
  pk_bard_sour_notes: { flavour: 'The Conservatory teaches every wrong note there is, so its bards know exactly which ones to play at you.' },
  pk_bard_discord: { flavour: 'Pellow, the terrible tenor, has won more converts to the Discord than its founders ever did.' },
  pk_bard_feedback: { flavour: 'Sing too near the Grand Organ and it sings back, louder and worse. The Organ That Ate a Choir never learned manners.' },
  pk_bard_heckle: { flavour: 'Lyrehaven audiences heckle with love. The bards return it with interest, and now and then with the lute.' },
  pk_bard_soft_voice: { flavour: 'Rosalind once put a whole stalls to sleep with a whisper. She insists it was the lullaby and not the third act.' },
  pk_bard_long_song: { flavour: 'The Conservatory keeps songs too long to sing in one sitting. The students bring sandwiches.' },
  pk_bard_rude_awakening: { flavour: 'Nothing in Lyrehaven wakes a sleeper like the last cymbal of the overture. The percussion wait all night for it.' },
  pk_bard_restful_tune: { flavour: 'Crumley plays his squeezebox on the Busking Steps until the whole street sits down. It may be the tune. It may be surrender.' },
  // ── Skald (the Echoing Fells)
  pk_skald_loud_chant: { flavour: 'In the Echoing Fells a shout comes back changed. A war chant comes back with friends.' },
  pk_skald_shield_song: { name: 'Shield Ring', flavour: 'Fells warriors lock shields and sing until the wall is the song. Nobody has found where the one ends and the other starts.' },
  pk_skald_battle_cry: { flavour: 'Every Fells child is given a name-beat at their first singing. Shout yours in battle and your whole valley answers.' },
  pk_skald_berserkergang: { flavour: 'The sagas sing of warriors who fought without shirts, shields or sense. The sagas are long, and the warriors brief.' },
  pk_skald_steady_beat: { flavour: 'Ketil and Sweyn have drummed side by side for years and never agreed on a tempo. The steady beat is the one between them.' },
  pk_skald_war_drum: { flavour: 'News crosses the Fells by drum, valley to valley. War is the only news that makes the drummers hurry.' },
  pk_skald_thunder_beat: { flavour: 'The great drums of the Drum-Steads are struck so hard that the sheep in the next valley lie down to listen.' },
  pk_skald_marching_song: { flavour: 'A Fells marching song has a verse for every hill on the road. Skalds take the long way home on purpose.' },
  pk_skald_retold_saga: { flavour: 'A saga changes a little every time it is told. Ragna says that is how you know it is still alive.' },
  pk_skald_hero_tale: { flavour: 'Every hero in the sagas grows a little taller with each telling. Some of them were very short to begin with.' },
  pk_skald_unsung: { flavour: 'Not every hero gets a saga. Ragna says the ones who don’t are usually too busy holding the line.' },
  pk_skald_last_verse: { flavour: 'Ragna knows nine hundred sagas and is losing one a week. She always remembers how they end.' },
  // ── Song school
  pk_song_resonant: { flavour: 'The meadows of Harmonia once hummed whenever the wind blew. A good voice can still get them started.' },
  pk_song_harmony: { flavour: 'Two voices in harmony are worth three alone, says the Conservatory. Its accountants disagree, but they can’t sing.' },
  pk_song_steady_voice: { flavour: 'A Lyrehaven singer finishes the aria whatever the gallery throws. Cabbages are a compliment; chairs are a review.' },
  pk_song_lament: { flavour: 'Harmonia has a lament for everything, including laments. Sung well, it makes everyone feel better, which is the trick.' },
  pk_song_counter_melody: { name: 'Countermelody', flavour: 'When the tune turns against you, sing against the tune. The Conservatory calls it counterpoint; the Fells call it shouting.' },
  pk_song_breath_control: { flavour: 'Conservatory students must hold one note across the courtyard and back. The pigeons have learned to move.' },
  pk_song_applause: { flavour: 'Applause in Lyrehaven is a currency. Rosalind has been living off her savings for seven years.' },
  pk_song_tempo: { name: 'Fermata', flavour: 'A fermata means hold the note as long as you like. Lyrehaven conductors have been known to leave for supper.' },
};

export const SPELLS: Record<string, SpellText> = {
  // ── Bard
  'spell:ballad-of-swiftness': { flavour: 'A Lyrehaven quickstep, written for audiences who arrive late. Nobody has missed an overture since.' },
  'spell:discordant-wave': { flavour: 'The Discord call it the purest note there is. Everyone standing in front of it calls it something else.' },
  'spell:showstopper': { flavour: 'Lyrehaven critics call a chord like that a showstopper, then complain in print that the show has stopped.' },
  // ── Skald
  'spell:chant-of-fury': { flavour: 'Fells war chants are older than the Saga Halls. Nobody remembers the words, but everybody knows when to shout.' },
  'spell:shield-song': { flavour: 'Sung over the shield-wall before the first blow. The words are old, the tune is older, and the wall holds.' },
  'spell:saga-strike': { flavour: 'Strike a blow worth a saga and the Skalds will sing it. Strike a better one and they must rewrite the ending.' },
};
