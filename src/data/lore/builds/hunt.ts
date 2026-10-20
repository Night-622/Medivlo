/**
 * Builds text, school of hunt (Claude 4; overlay on Claude 3 / Claude 5's mechanics, docs/systems/BUILDS.md phase 8).
 * Keyed by frozen ids: perks pk_* (perks-hunt.ts) and the school's new kit spells (kit-spells-new.ts). Flavour only, no
 * numbers (they are still being tuned); `name` only where the working name is replaced. Owner: Claude 4.
 */
import type { BuildText, SpellText } from '../hc-builds-text';

export const PERKS: Record<string, BuildText> = {
  // ── Huntsman (Antlerford)
  pk_huntsman_heavy_draw: { flavour: 'A Lodge crossbow takes a grown hunter and a stout boot to span. Bannock spans his with one hand, apologising.' },
  pk_huntsman_long_shot: { flavour: 'Shoot from far enough off and the quarry never knows there was a conversation. The old law frowns, and allows it.' },
  pk_huntsman_broadheads: { flavour: 'Broadheads are for ending a chase, not for showing off. The Trophy Barons use them for showing off.' },
  pk_huntsman_steady_aim: { flavour: 'Stand still long enough in the Greywilds and the deer forget you. Sometimes, so does the rest of the hunt.' },
  pk_huntsman_set_traps: { flavour: 'The Lodge sets its traps by the old law and marks every one. The poachers simply set more.' },
  pk_huntsman_jaws: { flavour: 'Lodge trappers give their traps names. The worst of them are named after aunts.' },
  pk_huntsman_snare_line: { flavour: 'A good snare line runs where the quarry was going anyway. A great one runs where it is going next.' },
  pk_huntsman_pit_fighter: { name: 'Held Fast', flavour: 'Caught is not killed, the Lodge teaches. Caught is the moment you decide what kind of hunter you are.' },
  pk_huntsman_keen_tracker: { flavour: 'Bannock can read a trail three days cold. He reads it slowly and softly, so the trail can keep up.' },
  pk_huntsman_quarry: { flavour: 'Name what you kill, says the old law. Lodge hunters name the quarry first, to be on the safe side.' },
  pk_huntsman_mark_the_herd: { flavour: 'The Elkway is empty now, but the old blazes still mark its trees. The Lodge keeps adding new ones, out of hope.' },
  pk_huntsman_relentless: { flavour: 'The chase is a conversation, the Lodge says. Some hunters simply refuse to let it end.' },
  // ── Falconer (the Hawkmoor)
  pk_falconer_high_stoop: { flavour: 'The higher a falcon climbs, the harder it comes down. Wren says the same of Mews gossip.' },
  pk_falconer_sharp_talons: { flavour: 'The Mews trims its birds’ talons every spring. The birds have them sharp again by summer, out of spite.' },
  pk_falconer_rending_dive: { flavour: 'A falcon never strikes twice where once will do. It simply makes certain that once is memorable.' },
  pk_falconer_bond: { flavour: 'Old Wren is half blind and sees more than anyone on the Mews Cliffs. She borrows Pibb’s eyes, and Pibb charges her in mice.' },
  pk_falconer_tireless_wings: { flavour: 'A Hawkmoor bird can circle all day under those huge skies. Its falconer lies down in the heather to watch.' },
  pk_falconer_hardy_bird: { flavour: 'A Mews bird is fed first, warmed first and patched first. The falconer gets what is left, usually a scolding.' },
  pk_falconer_blinded_prey: { flavour: 'Wren lost an eye to a goshawk she unhooded too fast. She never blamed the bird, and never let it forget.' },
  pk_falconer_screech: { flavour: 'Nothing on the Hawkmoor likes the sound of a falcon in a temper, least of all the falcon’s neighbours.' },
  pk_falconer_quick_throw: { flavour: 'While the bird is away, the falconer works. It is the only time the bird allows it.' },
  pk_falconer_knife_work: { flavour: 'A Mews knife cuts jesses, meat and arguments short. Falconers wear it on the hip the bird can’t reach.' },
  pk_falconer_lone_hunter: { flavour: 'Some falconers fly no bird for a season, to learn what the bird does for them. Most come back very hungry.' },
  pk_falconer_falcons_eye: { flavour: 'A falcon sees the mouse from a mile up and your mistake from further. It has never kept quiet about either.' },
  // ── Hunt school
  pk_hunt_predator_instinct: { flavour: 'The Greywilds teach a hunter to think like the wolf. The wolves, for their part, have started thinking like the Lodge.' },
  pk_hunt_first_blood: { flavour: 'The first bolt tells the quarry the hunt has begun. The old law says it should also be the best one.' },
  pk_hunt_hide_cloak: { flavour: 'Every Lodge cloak is cut from a hide that was named, thanked and argued over at supper.' },
  pk_hunt_disengage: { flavour: 'There is no shame in leaving a chase, the Lodge says. There is a great deal of shame in being caught by one.' },
  pk_hunt_camouflage: { flavour: 'In the bracken of the Old Snares a still hunter is only more bracken. The ticks know, but ticks never tell.' },
  pk_hunt_trail_wind: { flavour: 'Walk the Elkway with the wind at your back and you never tire. Walk it the other way and the deer smell your supper.' },
  pk_hunt_field_dressing: { flavour: 'Dress the kill where it falls, then your own scrapes. By the old law nothing is wasted, least of all a hunter.' },
  pk_hunt_patience: { flavour: 'Bannock reads the autumn count aloud once a year, and the whole Lodge waits on every word. That is patience.' },
};

export const SPELLS: Record<string, SpellText> = {
  // ── Huntsman
  'spell:spike-trap': { flavour: 'Antlerford’s smiths forge spikes for the Lodge and for the poachers. They swear they can’t tell the difference.' },
  'spell:net-shot': { flavour: 'A net is the kindest shot in the Lodge. It gives you time to decide, and the quarry time to argue.' },
  'spell:kill-shot': { flavour: 'Take a breath, take your time, take only what the hunt gives. Then take the shot.' },
  // ── Falconer
  'spell:talon-rake': { flavour: 'The falcon passes so low the grass parts behind it. Whatever was standing in the grass parts too.' },
  'spell:hawks-cry': { flavour: 'Every sheep on the Hawkmoor lies flat at that cry. No falcon has ever taken a sheep, but the sheep are not taking chances.' },
  'spell:sky-hunt': { flavour: 'Under the Hawkmoor’s huge skies a falcon has room to come round again. And again. And again.' },
};
