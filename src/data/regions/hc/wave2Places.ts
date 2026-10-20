/**
 * Wave 2 Concordia places (Claude 4's Act II class threads and Act III class quests) for the schools gated on the
 * PC, 2026-10-20 on. Same format as CONCORDIA_EXTRA: at the anchor's front plus (dx, dy) tiles; every offset here
 * was checked walkable and on a tile of its own.
 */
import type { FlagCond } from '@/core';
import type { ConcordiaExtra } from './campaignPlaces';

const c = (id: string, near: string, name: string, dx?: number, dy?: number, label?: string, when?: FlagCond): ConcordiaExtra => ({ id, near, name, dx, dy, label, when });

/** Inside Sentinel lairs, after the boss (merged into INSTANCE_EXTRA). */
export const WAVE2_INSTANCE: Record<string, string[]> = {
  'inst:sentinel-ash': ['obj:knight-konrad-signet'], // the forge-stone where the smiths worked
  'inst:sentinel-iron': ['obj:sparkwright-volta-seat'], // the crown Volta ordered, in the Engine's forge-bed
  'inst:sentinel-rime': ['obj:stormlancer-cass-lance'], // at the top of the road, once the Colossus is down
  'inst:drowned-abbey': ['obj:jester-sorrow-ropes'], // the bell-ropes Sorrow left in the nave, after Morwen
};
WAVE2_INSTANCE['inst:sentinel-rime'].push('obj:juggernaut-colossus-pay'); // where the Colossus stood
WAVE2_INSTANCE['inst:sentinel-ash'].push('obj:brawler-ringside-stool'); // ringside by Ashmaw's arena
WAVE2_INSTANCE['inst:sentinel-storm'] = ['obj:monk-nest-carving']; // the rim of the Stormcrow's nest
WAVE2_INSTANCE['inst:sentinel-iron'].push('obj:corsair-engine-pattern-book'); // the tailors' pattern-book on the Engine's cold anvil
WAVE2_INSTANCE['inst:varric-barrow'] = ['obj:oathbound-ilsabet-candle']; // at the foot of Varric's throne of shields
WAVE2_INSTANCE['inst:sentinel-verdant'] = ['obj:bard-willow-playbill']; // on a Willow root
WAVE2_INSTANCE['inst:sentinel-hunt'] = ['obj:skald-ulf-camp']; // a swept hollow under the Deep Glade roots

export const WAVE2_CONCORDIA: ConcordiaExtra[] = [
  // Knight
  c('area:knight-gildport-road', 'landmark:gate-circle+landmark:iron-embassy-gildport', 'The road to Gildport'),
  c('area:knight-kiln-road', 'landmark:gate-circle+landmark:kiln-great-kiln', 'The road to the Ashfall'),
  c('obj:knight-reply-letter', 'obj:arch-iron', 'Gideon’s courier under the Iron arch', -1, 1, 'Answer'),
  c('landmark:knight-gold-stair', 'landmark:iron-embassy-gildport', 'The gold stair', -22, -12), // ~25 tiles from the embassy towards the Buried Engine (Stannard's escort)
  c('obj:knight-stair-vigil', 'landmark:twelve-stairs', 'The foot of the Twelve Stairs', -5, 1, 'Keep vigil'),
  c('obj:knight-regiment-case', 'landmark:twelve-stairs', 'A dropped colour-case', 5, 1, 'Open'),
  c('obj:knight-shield-sword', 'landmark:legion-camp', 'Swords the freed have laid down', 2, -2, 'Choose a sword'),
  // Sparkwright
  c('obj:sparkwright-kit-spire', 'landmark:cliff-storm-spire', 'The gap in the Spire', 0, 0, 'Examine'),
  c('landmark:sparkwright-ladder-head', 'landmark:cliff-storm-spire', 'The ladder-head', 10, -26), // above the three anchor points, ~25 steps up (Prudence's escort)
  c('obj:sparkwright-black-spark-1', 'landmark:gild-clocktower', 'A black scorch mark', -2, 0, 'Study'),
  c('obj:sparkwright-black-spark-2', 'landmark:gild-golden-crust', 'A black scorch mark', -2, 1, 'Study'),
  c('obj:sparkwright-black-spark-3', 'landmark:gild-gilded-row', 'A black scorch mark', -4, 0, 'Study'),
  // Stormlancer
  c('obj:stormlancer-dare-board', 'landmark:cliff-wind-yard', 'The dare-board', 0, 1, 'Read'),
  c('landmark:stormlancer-cliff-lip', 'landmark:cliff-wind-yard', 'The cliff lip', -11, -9), // just above the last charge-flag, looking down on Cliffstair
  c('obj:stormlancer-cass-sign-1', 'ws:frost', 'A runner’s mark', 3, -4, 'Study'),
  c('obj:stormlancer-cass-sign-2', 'ws:frost', 'A runner’s mark', -3, -8, 'Study'),
  c('obj:stormlancer-cass-sign-3', 'ws:frost', 'A runner’s mark', 4, -13, 'Study'),
  c('obj:stormlancer-thistle-tracks', 'landmark:heart-camp', 'A ram’s tracks', 11, 3, 'Follow'),
  c('obj:stormlancer-hay-cart', 'landmark:heart-camp', 'A hay cart', 3, -4, 'Take some hay'),
  c('obj:stormlancer-lancers-fire', 'landmark:heart-camp', 'The fast ones’ fire', -9, 1, 'Sit'),
  c('obj:stormlancer-walking-line', 'landmark:legion-camp', 'The way out of the Legion', 6, -2, 'Walk'),
  // Jester
  c('landmark:jester-wisp-yard', 'landmark:ford-will-o-wisp', 'The yard behind the Will-o’-Wisp', 0, -8),
  c('obj:jester-joke-wall', 'landmark:jester-wisp-yard', 'The joke wall', 0, -1, 'Read'),
  c('landmark:jester-lake-steps', 'landmark:shore-fish-mill', 'The old lake steps', 22, -12), // from the Fish Mill towards the water (Winnifred's escort)
  c('landmark:jester-chip-stall', 'landmark:brind-market', 'The chip stall', 4, -2),
  c('obj:jester-reply-fennick', 'landmark:jester-chip-stall', 'A gull by the chip stall', 0, -1, 'Send a reply'),
  c('landmark:jester-camp-crate', 'landmark:heart-camp', 'The edge of the camp', -13, 1),
  c('obj:jester-camp-crate', 'landmark:jester-camp-crate', 'A crate to stand on', 0, -1, 'Stand up'),
  c('landmark:jester-pearl-stair', 'landmark:twelve-stairs', 'The east side of the Stairs', 10, -3),
  c('obj:jester-stair-pearls', 'landmark:jester-pearl-stair', 'Black pearls on the stair', 0, -1, 'Gather'),
  c('obj:jester-last-pearl', 'landmark:heart-camp', 'The last pearl', -2, 3, 'Look'),
  c('obj:jester-plume-rack', 'landmark:legion-camp', 'A knight’s helm on a rack', 6, -4, 'Return the plume'),
  // Juggernaut
  c('landmark:juggernaut-listening-shaft', 'landmark:juggernaut-dig-camp', 'The old bore-hole', 18, -22), // a walk from the dig camp (Jenks's escort)
  c('area:juggernaut-gold-road', 'landmark:juggernaut-dig-camp', 'Into the Gilded Ruins', -4, 19), // just inside region:gilded, where the Brindlecross → dig camp walk enters the Ruins (A*, ~20 steps short of the camp),
  c('obj:juggernaut-reply-whistle', 'obj:arch-iron', 'A whistle on a nail under the Iron arch', 0, 2, 'Answer'),
  c('obj:juggernaut-legion-count', 'landmark:legion-camp', 'The Legion’s shift board', 6, -6, 'Count'),
  c('obj:juggernaut-shift-tally', 'landmark:heart-camp', 'A shift tally on a cart', 9, -2, 'Read'),
  c('obj:juggernaut-pay-lamp', 'landmark:heart-camp', 'A pay lamp', 10, 1, 'Light'),
  // Monk
  c('obj:monk-welcome-broom', 'landmark:fist-welcome-hall', 'A broom by the door', 0, 1, 'Sweep'),
  c('area:monk-briar-road', 'landmark:gate-circle+landmark:fist-welcome-hall', 'The road into Briar Hollow'),
  c('obj:monk-reply-stone', 'obj:arch-fist', 'A flat stone under the Fist arch', 0, 1, 'Answer'),
  // the Fist stretch of the Twelve Stairs, just above the Fist stone
  c('obj:monk-stair-bead-1', 'landmark:twelve-stairs', 'A prayer bead', 2, -3, 'Pick up'),
  c('obj:monk-stair-bead-2', 'landmark:twelve-stairs', 'A prayer bead', 1, -4, 'Pick up'),
  c('obj:monk-stair-bead-3', 'landmark:twelve-stairs', 'A prayer bead', 0, -5, 'Pick up'),
  c('obj:monk-stair-cloak', 'landmark:twelve-stairs', 'A folded cloak on the step', 1, -3, 'Examine'),
  c('obj:monk-camp-pebbles', 'landmark:heart-camp', 'Pebbles laid out in a game', -4, 4, 'Look'),
  // Brawler
  c('landmark:brawler-bog-edge', 'landmark:thorn-briar-kettle', 'The edge of the bog', 6, 22), // out from the Briar & Kettle (Moll's escort)
  c('area:brawler-briar-road', 'landmark:gate-circle+landmark:thorn-briar-kettle', 'The road into Briar Hollow'),
  c('obj:brawler-camp-embers', 'landmark:heart-camp', 'A fire’s embers', -1, 3, 'Sit'),
  c('obj:brawler-sold-ranks', 'landmark:legion-camp', 'The sold fighters’ rank', -6, -6, 'Call the names'),
  c('obj:brawler-ticket-stubs', 'landmark:twelve-stairs', 'Ticket stubs on the step', 0, -3, 'Gather'),
  // Corsair
  c('obj:corsair-bog-scales', 'landmark:ford-bog-market', 'A brass fish-scale on the punts', 2, 1, 'Examine'),
  c('landmark:corsair-cart-head', 'landmark:gild-gilded-row', 'The cart-head', 18, 16), // where the pearl-carts tip into a chute, a walk from Gilded Row (Rosie's escort)
  c('obj:corsair-reply-bottle', 'obj:arch-guile', 'A green bottle in the lee of the Guile arch', -1, 1, 'Answer'),
  c('obj:corsair-legion-captain', 'landmark:legion-camp', 'A hollow Brine Fleet captain', 0, -8, 'Look'),
  c('obj:corsair-flagship-crew', 'landmark:legion-camp', 'A white row of sailors', 6, -8, 'Look'),
  c('landmark:corsair-flagship-aground', 'landmark:heart-camp', 'The white flagship, aground', 21, -4), // the nearest shallows to the camp
  c('obj:corsair-flagship-cabin', 'landmark:corsair-flagship-aground', 'The Admiral’s cabin', 0, -1, 'Enter'),
  c('landmark:corsair-widow-mooring', 'landmark:weeping-wall', 'The Merry Widow’s mooring', -29, -2), // black water along the foot of the Wall
  c('obj:corsair-widow-heart', 'landmark:corsair-widow-mooring', 'The Widow’s bell and crew list', 0, -1, 'Read'),
  c('obj:corsair-camp-bell', 'landmark:duskweaver-cook-fire', 'A bell on the tallest tent-pole', -1, -2, 'Ring'),
  // the Heart (Claude 4): a gathering spot in front of the twelve school stones
  c('obj:heart-stairs-foot', 'landmark:twelve-stairs', 'The foot of the Twelve Stairs', 0, 1, 'Gather'),
  // Cantor
  c('landmark:cantor-causeway-end', 'landmark:shore-chapel', 'The end of the old causeway', -9, -18), // along the shore from the Shore Chapel (Mother Ysmay's escort)
  c('area:cantor-gloam-edge', 'landmark:shore-chapel', 'The edge of the Gloamwood', -106, -1), // just inside region:gloam where the chapel → first scorched oak walk enters (A*)
  c('obj:cantor-lucan-tripod', 'landmark:sentinel-verdant', 'A folded tripod in a ring of burned grass', 5, -2, 'Examine'),
  c('obj:cantor-compline-candle', 'landmark:heart-camp', 'A candle among the camp stores', -4, -3, 'Take'),
  c('obj:cantor-legion-compline', 'landmark:legion-camp', 'Hollowed, lying asleep', -6, -8, 'Look'),
  c('obj:cantor-recruits-roll', 'landmark:heart-camp', 'A roll by the fire', 1, 2, 'Read'),
  c('obj:cantor-herald-loaves', 'landmark:twelve-stairs-top', 'Loaves at the head of the stair', 0, 1, 'Examine'),
  // Oathbound
  c('obj:oathbound-shorewatch-rota', 'landmark:oathbound-shorewatch-post', 'The watch-rota board', -1, 0, 'Read'),
  c('area:oathbound-goose-lane', 'landmark:gate-circle+landmark:brind-gilded-goose', 'The lane to the Goose'), // on Hamish's escort (Gate Circle → the Goose, 70 steps, walkable)
  c('obj:oathbound-ilsabet-grey', 'landmark:legion-camp', 'A saddled grey horse', 2, -8, 'Look'),
  c('obj:oathbound-grey-road', 'landmark:heart-camp', 'The road south', 0, 8, 'Look'),
  c('obj:oathbound-sworn-swords', 'landmark:heart-camp', 'Swords by the fire', 2, 1, 'Examine'),
  c('obj:oathbound-sworn-vigil', 'obj:oathbound-radiance-stair', 'The head of the Radiance stair', 0, 1, 'Keep vigil'),
  c('obj:oathbound-gallant-farewell', 'obj:oathbound-radiance-stair', 'A place to say goodbye', 1, 1, 'Stand'),
  c('obj:oathbound-squired-kit', 'landmark:heart-camp', 'A squire’s kit', -6, 3, 'Examine'),
  // Bard
  c('obj:bard-chapel-steps', 'landmark:shore-chapel', 'The chapel steps', 0, 1, 'Listen'),
  c('landmark:bard-abbey-landing', 'landmark:shore-chapel', 'The old Abbey landing', -26, -30), // reeds on the Abbey water, 32 steps from the chapel, clear of Cantor's causeway (Eulalie's escort)
  c('obj:bard-marchetti-desk', 'landmark:gloam-stags-rest', 'A writing-desk under a lilac awning', 6, -1, 'Examine'),
  c('obj:bard-arch-reply', 'obj:arch-song', 'The foot of the Song arch', 0, 2, 'Answer'),
  c('area:bard-shore-road', 'landmark:brind-gilded-goose', 'The road to Abbeyshore', 160, -70), // 40% along the Goose → Shore Chapel walk (A*), clear of cc-shore-road at the halfway mark
  c('obj:bard-aria-quiet', 'landmark:heart-camp', 'The surgeons’ tent', -8, -2, 'Look in'),
  c('obj:bard-buskers-fire', 'landmark:heart-camp', 'A fire ringed with hearthstones', 0, 2, 'Sit'),
  c('obj:bard-receipt-book', 'landmark:legion-camp', 'A receipt book in the baggage', -4, -6, 'Read'),
  c('obj:bard-lullaby-legion', 'landmark:legion-camp', 'The front of the ranks', 0, 1, 'Sing'),
  // Skald
  c('obj:skald-mill-loft', 'landmark:shore-fish-mill', 'The drum-loft over the wheel', 0, -1, 'Climb'),
  c('landmark:skald-gloam-treeline', 'landmark:lodge-kennels', 'A birch treeline', 22, -45), // out towards the stag glade, 47 steps, past the Huntsman's trail head (Ebba's escort)
  c('obj:skald-arch-reply', 'obj:arch-song', 'The foot of the Song arch', -1, 2, 'Answer'),
  c('area:skald-gloam-path', 'landmark:lodge-kennels+landmark:skald-gloam-treeline', 'The Gloamwood path'),
  c('obj:skald-relay-post', 'landmark:heart-camp', 'A drum on a post by the old road', 2, 8, 'Strike'),
  c('obj:skald-camp-cask', 'landmark:heart-camp', 'A cask on a supply cart', 1, -4, 'Examine'),
  c('obj:skald-legion-muster', 'landmark:legion-camp', 'A cart-length slate', 4, -8, 'Read'),
  c('obj:skald-legion-drum', 'landmark:legion-camp', 'The great summons drum', -2, -8, 'Strike'),
  // shared Concordia Act II depth (Claude 5): Brindlecross, the roads out, Abbeyshore. Area centres are points on
  // the A* walks (Brindlecross → wolf tracks, Thornhollow → Stag's Rest, the Goose → Shore Chapel)
  c('obj:cc-goose-letters', 'obj:brind-goose-bed', 'A washstand drawer of letters', -4, 0, 'Open the drawer', { flag: 'cc.goose_letters_open' }), // 4 tiles off the bed and Wil; usable only in cc-warm-bed 'letters' (Claude 4's flag)
  c('obj:cc-waystone-listen', 'landmark:brind-waystone', 'A few steps from the waystone', 4, -2, 'Listen', { flag: 'cc.waystone_listen_open' }), // 4 tiles from Sela Moth; usable only in cc-waystones 'listen' (Claude 4's flag)
  c('area:cc-gloam-edge', 'landmark:gloam-wolf-tracks', 'Where the moor meets the Gloamwood', 0, 4), // where the walk from Brindlecross enters region:gloam
  c('area:cc-shore-road', 'landmark:brind-gilded-goose', 'The milestone on the shore road', 201, -111), // halfway to the Shore Chapel
  c('area:cc-briar-path', 'landmark:thorn-briar-kettle', 'The Briar path into the Gloamwood', 150, -13), // just inside region:gloam on the walk from Thornhollow
  c('area:cc-low-water', 'landmark:abbey-north-door', 'The lake edge at low water', 0, 2),
  c('area:cc-shore-dusk', 'landmark:shore-chapel', 'The last stretch into Abbeyshore', -19, 0),
];
