/**
 * Builds text, school of guile (Claude 4; overlay on Claude 3 / Claude 5's mechanics, docs/systems/BUILDS.md phase 8).
 * Keyed by frozen ids: perks pk_* (perks-guile.ts) and the school's new kit spells (kit-spells-new.ts). Flavour only, no
 * numbers (they are still being tuned); `name` only where the working name is replaced. Owner: Claude 4.
 */
import type { BuildText, SpellText } from '../hc-builds-text';

export const PERKS: Record<string, BuildText> = {
  // ── Corsair (Gallows Reef)
  pk_corsair_quick_cutlass: { flavour: 'Dot Brine draws her cutlass faster than anyone in the Fleet, and her purse slower than anyone alive.' },
  pk_corsair_boarding_party: { flavour: 'Brine Fleet boarding rules are short: over the rail, keep your hat on, and nobody touches the rum till after.' },
  pk_corsair_salt_wounds: { flavour: 'On Gallows Reef everything stings: the sea, the rum and the prices. A cut is only the reef saying hello.' },
  pk_corsair_dual_wield: { flavour: 'One cutlass for the enemy and one for the captain who owes you wages. Dot’s crew all carry two.' },
  pk_corsair_sand_pockets: { name: 'Dirtier Tricks', flavour: 'There are no rules on Gallows Reef, only habits. Corsairs take great pride in their bad ones.' },
  pk_corsair_cheap_shot: { flavour: 'A Fleet duel ends when one side can’t see. Who threw the sand is a matter for the inquiry, held in the tavern.' },
  pk_corsair_pocket_sand: { flavour: 'Every Corsair keeps a pocket of Gallows sand. The reef has very little left, and would like it back.' },
  pk_corsair_kick_low: { flavour: 'Velvet Harbour fencing masters teach the high guard. Corsairs thank them for it, from somewhere around the knee.' },
  pk_corsair_deep_pockets: { flavour: 'In the Brine Market the stallholders nail down their stock. The cleverer ones nail down their customers.' },
  pk_corsair_treasure_nose: { flavour: 'A Corsair can smell a hoard on the Crow Islands through the gulls, the crows and the other Corsairs.' },
  pk_corsair_pirates_luck: { flavour: 'Luck is only money that hasn’t decided whose it is yet. Corsairs help it decide.' },
  pk_corsair_rum_ration: { flavour: 'The Fleet’s articles promise a rum ration to every hand. Dot signed them, so it is mostly promise.' },
  // ── Jester (Velvet Harbour)
  pk_jester_more_balls: { name: 'Seventh Ball', flavour: 'Any fool can juggle six. A Velvet Court fool juggles seven, and drops the one the King was watching.' },
  pk_jester_showmanship: { flavour: 'Fennick Pantaloon says the joke is half the act. The other half is the bow, and the bow is where the money is.' },
  pk_jester_ricochet: { flavour: 'A good jest bounces round the Velvet Court and lands on someone who wasn’t even listening. So does a good knife.' },
  pk_jester_extra_dagger: { flavour: 'The audience counts the daggers. A professional makes sure they always count one short.' },
  pk_jester_tumbler: { flavour: 'Fennick still falls over on purpose. The floor of the Velvet Court has never once taken him by surprise.' },
  pk_jester_acrobat: { flavour: 'Fennick’s mother walked the high rope over the Docks. Fennick walks the low one, and calls it modesty.' },
  pk_jester_slapstick: { flavour: 'Slip on nothing, fall on no one, and leave the whole room arguing about whose fault it was.' },
  pk_jester_now_you_see_me: { flavour: 'The Masquerade Quarter has been in carnival for thirty years. Nobody there is where they seem, least of all the fools.' },
  pk_jester_good_timing: { flavour: 'The secret of comedy, says Fennick, is in the pause. He then pauses until somebody throws a cabbage.' },
  pk_jester_running_gag: { flavour: 'A joke told twice at court is tiresome. Told every night for a year, it becomes a tradition and draws a pension.' },
  pk_jester_encore: { name: 'Paid Twice', flavour: 'Court fools are paid by the laugh. A fool called back for an encore is paid twice, and robbed once on the way home.' },
  pk_jester_tough_crowd: { flavour: 'When the Velvet Court stops laughing, a fool gets sharper. When it starts throwing things, sharper still.' },
  // ── Guile school
  pk_guile_sly: { flavour: 'In Tidecourt there is always another way round. The sly know it, and the slyer have already sold you the map.' },
  pk_guile_exploit: { flavour: 'A blind man will pay any price, the Exchange says, and a slow one will pay it twice.' },
  pk_guile_light_armour: { name: 'Soft Shoes', flavour: 'A fool’s shoes are soft so the King can’t hear him leave. A cutpurse’s are soft for the same reason, and a different king.' },
  pk_guile_smoke_bomb: { name: 'Up the Sleeve', flavour: 'Every fool keeps one up a sleeve for the moment the joke goes wrong. Fennick has gone through hundreds.' },
  pk_guile_slippery: { flavour: 'Nobody in Tidecourt has ever been caught. They have only been briefly misplaced, then let go for a fee.' },
  pk_guile_quick_wits: { flavour: 'On the Exchange Floor a promise changes hands faster than coin. Keep up, or become the promise.' },
  pk_guile_opportunist: { flavour: 'Every scuffle on the Velvet Docks has three sides: the two fighting, and the one picking both their pockets.' },
  pk_guile_silver_tongue: { flavour: 'A court fool tells the truth because he is paid not to. The art is getting paid by both sides.' },
};

export const SPELLS: Record<string, SpellText> = {
  // ── Corsair
  'spell:pistol-shot': { flavour: 'The Fleet keeps its pistols dry, loaded and loud. Loud matters most: half the fights end at the bang.' },
  'spell:grappling-hook': { flavour: 'Corsairs board from behind, because the front of a ship is where the people expecting them are.' },
  'spell:broadside': { flavour: 'The Overdraft carries guns on one side only. Dot sold the others, and steers very carefully.' },
  // ── Jester
  'spell:knife-fan': { flavour: 'Velvet Court fools practise with the butter knives first. The King’s butler has never forgiven them.' },
  'spell:jack-in-the-box': { flavour: 'Made in the Masquerade Quarter, where a box with a face in it is the least surprising thing in the street.' },
  'spell:grand-finale': { flavour: 'Fennick has given a dozen farewell performances. Each had a grand finale, an encore and a collection plate.' },
};
