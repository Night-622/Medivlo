/**
 * Builds text, school of radiance (Claude 4; overlay on Claude 3 / Claude 5's mechanics, docs/systems/BUILDS.md phase 8).
 * Keyed by frozen ids: perks pk_* (perks-radiance.ts) and the school's new kit spells (kit-spells-new.ts). Flavour only,
 * no numbers (they are still being tuned); `name` only where the working name is replaced. Owner: Claude 4.
 */
import type { BuildText, SpellText } from '../hc-builds-text';

export const PERKS: Record<string, BuildText> = {
  // Oathbound (the Gilded March, the Order of Oathkeep)
  'pk_oathbound_dawn_hammer': { name: 'Hammer-Sworn', flavour: 'Oathkeep’s Hall of Broken Swords has no broken hammers in it. Knights of the March notice these things.' },
  'pk_oathbound_judgement': { flavour: 'Strike the proud while they are still proud, says Ser Beatrix. A humbled foe is a waste of a good swing.' },
  'pk_oathbound_blinding_blow': { flavour: 'Solarian plate is polished every dawn by tradition and every dusk by vanity. Both catch the eye at the right moment.' },
  'pk_oathbound_zealot': { flavour: 'The Brightwatch admire your zeal. Your healers, who have to follow you about, admire it rather less.' },
  'pk_oathbound_ready_hands': { flavour: 'An Oathbound’s hands are sworn to two things: the hilt, and whoever is bleeding nearest to it.' },
  'pk_oathbound_devotion': { flavour: 'Devotion runs both ways on the March. You keep the village, and the village keeps a bed made up for you.' },
  'pk_oathbound_martyr': { flavour: 'Every blow a knight takes is one the village does not. Oathkeep calls it the cheapest bargain in the realm.' },
  'pk_oathbound_smite_heal': { flavour: 'The Order teaches mercy and the hammer in the same lesson. Recruits are seldom sure which is being shown.' },
  'pk_oathbound_long_oath': { flavour: 'The Shorewatch oath ends “until relieved by Oathkeep”. Nobody came for thirty years, and the oath held.' },
  'pk_oathbound_aegis': { name: 'Sworn Shield', flavour: 'A shield sworn to a friend is heavier than one carried for yourself, and it holds a good deal better.' },
  'pk_oathbound_bastion': { flavour: 'Oathkeep’s walls were built to be leaned on. So, by long tradition, were its knights.' },
  'pk_oathbound_crusade': { name: 'March Banner', flavour: 'Where the March banner goes, the villages follow, with pitchforks and very strong opinions.' },
  // Cantor (Dawnspire, the Cathedral Choir)
  'pk_cantor_full_voice': { flavour: 'Mother Celestine can be heard from the back of the Cathedral in a whisper. She has not whispered in years.' },
  'pk_cantor_choir': { flavour: 'One voice is a prayer. A choir is a prayer that refuses to be ignored.' },
  'pk_cantor_overflow': { flavour: 'A Cantor’s grace is meant to be poured, not measured. The Choir’s accounts have never balanced.' },
  'pk_cantor_vow_of_silence': { flavour: 'Some Cantors stop singing the healing hymns and start singing the other kind. The Choir does not discuss them at supper.' },
  'pk_cantor_heavy_censer': { flavour: 'A censer is holy smoke on a chain. Add enough brass and it becomes an argument on a chain.' },
  'pk_cantor_incense': { flavour: 'Dawnspire incense is blessed, bitter and very nearly a weapon. The novices cough in perfect harmony.' },
  'pk_cantor_purifying_smoke': { flavour: 'Cathedral smoke gets into everything: robes, hair, and the courage of anyone standing downwind.' },
  'pk_cantor_thurible': { flavour: 'The thurible bearer walks first in every procession, so the faithful know where to follow and the wicked where to flee.' },
  'pk_cantor_ringing': { flavour: 'A true chord rings on in the Cathedral stones long after the singer stops. In Dawnspire, nobody quite stops.' },
  'pk_cantor_resonance': { flavour: 'Sing the right note in the Choir Cloisters and the windows sing it back, a little late and very pleased with themselves.' },
  'pk_cantor_sanctuary': { name: 'Cloister Peace', flavour: 'In the Cloister gardens even the Brightwatch speak softly. Wounds close faster where nobody is shouting.' },
  'pk_cantor_hallowed_mind': { flavour: 'Every hymn of healing gives a little back to the singer. Mother Celestine has lived on that for six years.' },
  // School of Radiance
  'pk_radiance_dawnfire': { flavour: 'Solaria’s first light is the cruellest: it gets into armour joints and under eyelids, and it never apologises.' },
  'pk_radiance_righteous': { flavour: 'The bigger they are, the more of them there is to shine on. Oathkeep keeps a list of the biggest.' },
  'pk_radiance_halo': { flavour: 'A Solarian halo is mostly polish and posture. The rest is the Cathedral’s light, which never quite leaves you.' },
  'pk_radiance_divine_shield': { name: 'Dawn Ward', flavour: 'The light comes when you are lowest, say the Cantors. In Solaria it comes all the time, so this is mostly a figure of speech.' },
  'pk_radiance_blessed': { flavour: 'Blessed twice, as Solarians say: once by a priest, and once by somebody who actually meant it.' },
  'pk_radiance_prayer': { name: 'Lauds', flavour: 'Lauds is the dawn hymn, sung every hour in Dawnspire, because every hour in Dawnspire is technically dawn.' },
  'pk_radiance_tithe': { flavour: 'The Cathedral takes its tithe from the harvest. The Oathbound take theirs from whoever started the fight.' },
  'pk_radiance_long_light': { flavour: 'The sun has not set over the Sun Cathedral in thirty years. Solarians are very polite, and very tired.' },
};

export const SPELLS: Record<string, SpellText> = {
  'spell:hammer-of-dawn': { flavour: 'The Oathbound arrive the way dawn does in Solaria: suddenly, from above, and far too bright for anyone’s liking.' },
  'spell:sanctuary-ground': { flavour: 'Wherever an Oathbound plants their feet and swears, the ground is Oathkeep for a while.' },
  'spell:judgement-day': { name: 'Pillar of Noon', flavour: 'Noon in Dawnspire is a column of light so heavy it has to be held up. Now and then it is dropped on someone.' },
  'spell:choral-burst': { flavour: 'The Choir’s loudest note is the same for friend and foe. Friends are simply expected to enjoy it.' },
  'spell:silence': { name: 'Hushing Chord', flavour: 'Compline was banned for singing the light down gently. This chord sings everything down, and is not gentle.' },
  'spell:benediction': { flavour: 'A Cantor’s blessing is a promise from the light itself, and the light, in Solaria, keeps very long hours.' },
};
