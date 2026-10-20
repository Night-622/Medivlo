/**
 * Set pieces Claude 4 added while writing each campaign's quest data (beyond the outline sections that
 * landmarks.ts is generated from). Hand-kept; `near` anchors a piece beside another placed piece.
 */
import type { SetPieceDef } from '@/world/hc/types';
import { CAMPAIGN_CONCORDIA, CAMPAIGN_PIECES, RETIRED, type ConcordiaExtra } from './campaignPlaces';
import { WAVE2_CONCORDIA, WAVE2_INSTANCE } from './wave2Places';
import type { FlagCond } from '@/core';

export { RETIRED };

type Area = SetPieceDef['area'];
const A: Area = 'area:ash-capital', AF: Area = 'area:ash-frontier';
const range = (base: string, n: number, where: string, note: string, near?: string, area: Area = A): SetPieceDef[] =>
  Array.from({ length: n }, (_, i) => ({ id: `${base}-${i + 1}`, area, where, note, near }));

/** Arcanist (2026-10-20). */
const ARCANIST: SetPieceDef[] = [
  { id: 'landmark:great-kiln-gate', area: A, where: 'zone-1', note: 'the Great Kiln gate, I-1' },
  { id: 'landmark:sweeps-yard', area: A, where: 'zone-1', note: '' },
  { id: 'landmark:watch-board-kilnhold', area: A, where: 'zone-1', note: 'bounty board' },
  ...range('obj:pudding-trail', 3, 'zone-1', 'from the permit office towards Thrane\'s study', 'landmark:kiln-permit-office'),
  { id: 'landmark:glaze-workshop', area: A, where: 'zone-2', note: '' },
  { id: 'landmark:prentice-yard', area: A, where: 'zone-2', note: '' },
  { id: 'obj:contest-bucket', area: A, where: 'zone-2', note: 'prentice contest', near: 'landmark:prentice-yard' },
  { id: 'obj:contest-blanket', area: A, where: 'zone-2', note: 'prentice contest', near: 'landmark:prentice-yard' },
  { id: 'obj:contest-sand', area: A, where: 'zone-2', note: 'prentice contest', near: 'landmark:prentice-yard' },
  ...range('obj:archive-crate', 3, 'zone-2', 'outside the glass archive', 'landmark:glass-archive'),
  { id: 'landmark:pigeon-loft', area: A, where: 'zone-3', note: '' },
  { id: 'obj:observatory-lens', area: A, where: 'zone-3', note: 'at the observatory', near: 'landmark:kiln-observatory' },
  { id: 'obj:kiln-flue-tears', area: A, where: 'zone-4', note: 'behind a false wall' },
  { id: 'obj:kiln-crying-grate', area: A, where: 'zone-4', note: 'at the stokers\' gallery', near: 'landmark:stokers-gallery' },
  ...range('obj:kiln-thermometer', 3, 'zone-4', ''),
  { id: 'landmark:golem-masters-house', area: A, where: 'zone-4', note: 'the far end of the Roots' },
  { id: 'obj:golem-master-grave', area: A, where: 'zone-4', note: '', near: 'landmark:golem-masters-house' },
  { id: 'landmark:slime-grotto', area: A, where: 'zone-4', note: 'the deepest Root' },
  { id: 'obj:zealot-cages', area: A, where: 'lair-1', note: '' },
  { id: 'obj:ledger-page', area: A, where: 'lair-2', note: '' },
  // Arcanist Act I depth pilot (Claude 4, PACING): beats spread over the city, the Roots, the archive and the Cinder Road
  ...range('obj:arcanist-gutter-tear', 3, 'zone-1', 'along the gutters'),
  ...range('obj:arcanist-office-fire', 3, 'zone-1', 'Pudding\'s fires', 'landmark:kiln-permit-office'),
  { id: 'obj:arcanist-stoking-ledger', area: A, where: 'zone-1', note: 'at the Permit Office', near: 'landmark:kiln-permit-office' },
  ...range('obj:arcanist-weeping-chimney', 3, 'zone-1', 'the sweeps\' chimneys', 'landmark:sweeps-yard'),
  { id: 'landmark:arcanist-chapel-door', area: A, where: 'zone-1', note: 'the boarded-up chapel' },
  { id: 'obj:arcanist-chapel-candle', area: A, where: 'zone-1', note: 'on the chapel step', near: 'landmark:arcanist-chapel-door' },
  { id: 'area:arcanist-kiln-lanes', area: A, where: 'zone-1', note: 'I-1 travel banter on the walk', near: 'landmark:great-kiln-gate+landmark:thrane-study' },
  { id: 'obj:arcanist-singing-vase', area: A, where: 'zone-2', note: 'in the glaze workshop', near: 'landmark:glaze-workshop' },
  ...range('obj:arcanist-apprentice-bench', 3, 'zone-2', 'the missing apprentices\' benches', 'landmark:glaze-workshop'),
  { id: 'landmark:arcanist-terrace-view', area: A, where: 'zone-3', note: 'the Smoke Terraces' },
  { id: 'obj:arcanist-star-chart', area: A, where: 'zone-3', note: 'at the observatory', near: 'landmark:kiln-observatory' },
  { id: 'obj:arcanist-fuel-cart', area: A, where: 'zone-4', note: 'by the old flue', near: 'obj:kiln-flue-tears' },
  { id: 'obj:arcanist-conclave-glove', area: A, where: 'zone-4', note: 'dropped by the flue', near: 'obj:kiln-flue-tears' },
  ...range('obj:arcanist-trapped-archivist', 3, 'lair-2', 'one per archive rooms'),
  { id: 'landmark:arcanist-cinder-shrine', area: A, where: 'road', note: 'wayside shrine on the Cinder Road' },
  { id: 'obj:arcanist-cinder-shrine', area: A, where: 'road', note: 'the shrine itself', near: 'landmark:arcanist-cinder-shrine' },
];

/** Reaver (2026-10-20). */
const REAVER: SetPieceDef[] = [
  { id: 'landmark:muster-ring', area: AF, where: 'zone-1', note: 'the vote ring' },
  { id: 'landmark:muster-wager-ring', area: AF, where: 'zone-1', note: '' },
  ...range('obj:axe-target', 3, 'zone-1', 'A Wager of Axes', 'landmark:muster-wager-ring', AF),
  { id: 'landmark:muster-cookfire', area: AF, where: 'zone-1', note: '' },
  { id: 'landmark:muster-quartermaster', area: AF, where: 'zone-1', note: 'bounty stake' },
  ...range('obj:fallen-reaver', 3, 'zone-2', 'beyond the palisade', undefined, AF),
  ...range('obj:fire-cap', 3, 'zone-2', 'cooled lava', undefined, AF),
  ...range('obj:vein-marker', 3, 'zone-2', 'Red Veins', undefined, AF),
  { id: 'obj:muster-well', area: AF, where: 'zone-2', note: '', near: 'landmark:muster-well' },
  ...range('obj:war-banner', 4, 'zone-3', '4 is the Concord banner', 'landmark:bone-ridge-banners', AF),
  { id: 'obj:old-cinder-cairn', area: AF, where: 'zone-3', note: 'the Ridge top' },
  { id: 'obj:drake-egg-nest', area: AF, where: 'zone-4', note: 'the scree below the Roost' },
  { id: 'obj:muster-war-banner', area: AF, where: 'lair-1', note: '' },
  { id: 'obj:brand-pit-seal', area: AF, where: 'lair-2', note: '' },
  // Reaver Act I depth pass (Claude 4, PACING): the Muster, just past the line, the Fields, the trail and the Cinder Road
  ...range('obj:reaver-wounded', 3, 'zone-1', 'laid out round the cookfire', 'landmark:muster-cookfire', AF),
  { id: 'landmark:reaver-watchtower', area: AF, where: 'zone-1', note: 'a tower on the palisade (Brenna at dawn)' },
  { id: 'obj:reaver-jory-book', area: AF, where: 'zone-1', note: 'under the stakes board', near: 'landmark:muster-wager-ring' },
  { id: 'obj:reaver-ring-pole', area: AF, where: 'zone-1', note: '', near: 'landmark:muster-ring' },
  { id: 'landmark:reaver-hask-vein', area: AF, where: 'way-2', note: 'just past the line' },
  { id: 'obj:reaver-hask-vein', area: AF, where: 'way-2', note: 'on the vein’s lip', near: 'landmark:reaver-hask-vein' },
  { id: 'obj:reaver-brenna-handprint', area: AF, where: 'way-2', note: 'on the vein’s lip', near: 'landmark:reaver-hask-vein' },
  { id: 'landmark:reaver-white-lava', area: AF, where: 'zone-2', note: 'deep in the Fields' },
  { id: 'obj:reaver-footprints-end', area: AF, where: 'zone-2', note: '', near: 'landmark:reaver-white-lava' },
  { id: 'area:reaver-fields-track', area: AF, where: 'zone-2', note: 'banter on the walk', near: 'landmark:muster-palisade+landmark:reaver-white-lava' },
  { id: 'landmark:reaver-truce-village', area: AF, where: 'zone-2', note: 'the far edge of the Fields' },
  { id: 'obj:reaver-truce-pot', area: AF, where: 'zone-2', note: '', near: 'landmark:reaver-truce-village' },
  { id: 'obj:reaver-well-cistern', area: AF, where: 'zone-2', note: '', near: 'landmark:muster-well' },
  { id: 'landmark:reaver-vein-confluence', area: AF, where: 'zone-2', note: 'the north edge, towards the gate' },
  { id: 'obj:reaver-vein-confluence', area: AF, where: 'zone-2', note: '', near: 'landmark:reaver-vein-confluence' },
  { id: 'obj:reaver-ginnet-axe', area: AF, where: 'way-3', note: 'the raiders’ trail towards the Battle-Kiln' },
  { id: 'obj:reaver-cinder-stone-1', area: AF, where: 'way-3', note: 'the ford' },
  { id: 'obj:reaver-cinder-stone-2', area: AF, where: 'zone-3', note: 'a hilltop' },
  { id: 'obj:reaver-cinder-stone-3', area: AF, where: 'zone-3', note: 'the old ram-pens', near: 'landmark:bone-ridge-banners' },
  { id: 'obj:reaver-brand-whelp', area: AF, where: 'lair-2', note: 'behind the last pit-mouth' },
  { id: 'landmark:reaver-road-camp', area: AF, where: 'road', note: 'the last camp on the Cinder Road' },
  { id: 'obj:reaver-last-campfire', area: AF, where: 'road', note: '', near: 'landmark:reaver-road-camp' },
];

/** Bard and Skald (Song, 2026-10-20). */
const SC: Area = 'area:song-capital', SF: Area = 'area:song-frontier';
const p = (id: string, area: Area, where: string, note = '', near?: string): SetPieceDef => ({ id, area, where, note, near });
const SONG: SetPieceDef[] = [
  p('landmark:opera-quarter-board', SC, 'zone-1', 'bounty board'),
  p('landmark:opera-box-office', SC, 'zone-1', 'steps outside the Grand Opera', 'landmark:grand-opera'),
  p('landmark:opera-gardens', SC, 'zone-1', 'Bellflower beds'),
  p('landmark:choir-loft-stair', SC, 'zone-1', 'behind the dress circle; the way to lair 1', 'landmark:grand-opera'),
  p('obj:choir-loft-stair', SC, 'zone-1', '', 'landmark:choir-loft-stair'),
  p('obj:lullaby-note-1', SC, 'zone-1', 'the Quarter pump', 'landmark:humming-fountain'),
  p('obj:lullaby-note-2', SC, 'zone-1', 'the night-watchman’s corner', 'landmark:grand-opera'),
  p('obj:lullaby-note-3', SC, 'zone-1', 'the dressing room', 'landmark:rosalind-dressing-room'),
  p('obj:rosalind-letters', SC, 'zone-1', '', 'landmark:rosalind-dressing-room'),
  p('obj:opera-roof-nest', SC, 'zone-1', 'the Opera roof', 'landmark:grand-opera'),
  p('landmark:lyrehaven-meadow-road', SC, 'zone-1', 'the north edge, where the gate road starts'),
  p('landmark:chestnut-brazier', SC, 'zone-2', 'the Busking Steps', 'landmark:busking-steps-pitch'),
  p('obj:playoff-pitch', SC, 'zone-2', '', 'landmark:busking-steps-pitch'),
  ...range('obj:stolen-tune', 3, 'zone-2', 'lamp-post, window box, drainpipe', undefined, SC),
  p('landmark:conservatory-hall', SC, 'zone-3'),
  p('obj:practice-room-pipe', SC, 'zone-3', '', 'landmark:practice-room-nine'),
  p('obj:great-metronome', SC, 'zone-3', '', 'landmark:great-metronome'),
  p('obj:murmur-lost-page', SC, 'zone-4', 'behind a painted sea flat', 'landmark:prompt-box'),
  p('landmark:costume-store', SC, 'zone-4', 'the Opera Wardrobe'),
  p('obj:phantom-hymn-book', SC, 'lair-1', 'the lectern'),
  p('obj:organ-chorister-pipes', SC, 'lair-2'),
  p('landmark:sigrun-fold', SF, 'zone-1'),
  p('obj:sigrun-fold', SF, 'zone-1', '', 'landmark:sigrun-fold'),
  p('landmark:relay-stead', SF, 'zone-1'),
  p('landmark:steads-board', SF, 'zone-1', 'bounty post'),
  p('obj:rubbing-paper-1', SF, 'zone-1', 'the Saga Hall chest', 'landmark:saga-hall'),
  p('obj:rubbing-paper-2', SF, 'zone-1', 'the drum-maker’s bench', 'landmark:relay-stead'),
  p('obj:rubbing-paper-3', SF, 'zone-1', 'the tally shelf', 'landmark:saga-hall'),
  p('obj:hollow-echo-tarn', SF, 'zone-2', 'below relay drum 3', 'obj:relay-drum-3'),
  p('landmark:brackenhow', SF, 'zone-2', 'a cottage'),
  p('obj:scarrow-pike-cairn', SF, 'zone-2', 'the summit', 'landmark:scarrow-pike'),
  p('landmark:whistling-tarn', SF, 'zone-2'),
  p('obj:nobody-much-cairn', SF, 'zone-2', 'lower Fells, by a dry-stone wall'),
  ...range('obj:saga-tarn', 4, 'zone-2', 'high tarns', undefined, SF),
  p('landmark:saga-stones-ring', SF, 'zone-3'),
  p('obj:stone-with-no-saga', SF, 'zone-3', '', 'landmark:stone-with-no-saga'),
  p('obj:weeping-rune', SF, 'zone-3', 'in the ring', 'landmark:saga-stones-ring'),
  p('landmark:egg-thieves-camp', SF, 'zone-4', 'a gully under the cliffs'),
  p('obj:egg-thief-crates', SF, 'zone-4', '', 'landmark:egg-thieves-camp'),
  p('obj:boathouse-seal-hide', SF, 'zone-4', 'the boathouse at the cliff foot'),
  p('obj:hoddersgill-feast-drum', SF, 'lair-1', 'by the high seat'),
  p('landmark:fells-gate-cairn', SF, 'gate', 'the gate road'),
];

/** n numbered pieces (`base-1..n`) in one zone, optionally beside an anchor. */
const nn = (base: string, n: number, area: Area, where: string, note = '', near?: string) => range(base, n, where, note, near, area);

/** Hedgewitch and Ranger (Verdant, 2026-10-20). */
const VC: Area = 'area:verdant-capital', VF: Area = 'area:verdant-frontier';
const VERDANT: SetPieceDef[] = [
  p('landmark:lantern-row', VC, 'zone-1'), ...nn('obj:lantern-cat', 4, VC, 'zone-1', 'knot-holes, a branch, a hollow bench', 'landmark:lantern-row'),
  p('landmark:compost-bough', VC, 'zone-1'), ...nn('obj:bough-compost', 3, VC, 'zone-1', '', 'landmark:compost-bough'),
  p('landmark:circle-notice-bough', VC, 'zone-1', 'bounty board'), ...nn('obj:yarrow-diary', 3, VC, 'zone-1', '', 'landmark:yarrow-bower'),
  p('landmark:sap-tappers-well', VC, 'zone-2'), p('obj:sap-well-kettle', VC, 'zone-2', 'far side of the Well', 'landmark:sap-tappers-well'),
  p('obj:treacle-tap', VC, 'zone-2'), ...nn('obj:ostara-ward-bed', 3, VC, 'zone-2', '', 'landmark:ostara-sap-garden'),
  p('landmark:spindle-street', VC, 'zone-3'), ...nn('obj:cellar-sleeper', 3, VC, 'zone-3'),
  ...nn('obj:mudlark-bundle', 3, VC, 'zone-3', '', 'landmark:mudlark-cellar'), p('obj:mudlark-door', VC, 'zone-3', '', 'landmark:mudlark-cellar'),
  ...nn('obj:thistledown-sight', 3, VC, 'zone-3'),
  p('landmark:kite-bough', VC, 'zone-4'), ...nn('obj:canopy-kite', 3, VC, 'zone-4', '', 'landmark:kite-bough'),
  p('landmark:canopy-graft-crown', VC, 'zone-4'), ...nn('obj:canopy-graft', 3, VC, 'zone-4', 'leading up to the crown', 'landmark:canopy-graft-crown'),
  p('obj:topmost-leaf', VC, 'zone-4', '', 'landmark:topmost-leaf'), p('obj:listening-knot', VC, 'zone-4', '', 'landmark:listening-knot'),
  p('obj:seed-vault-ledger', VC, 'lair-2'),
  p('landmark:wayfarer-fire', VF, 'zone-1'), p('landmark:wayfarer-bounty-stake', VF, 'zone-1'), ...nn('obj:salt-cache', 3, VF, 'zone-1'),
  p('obj:salt-squirrel', VF, 'zone-1', 'an old pine at the camp edge', 'landmark:wayfarer-fire'),
  p('obj:memorial-carving', VF, 'zone-1', '', 'landmark:wayfarer-memorial-tree'), p('obj:holt-aldo-waymark', VF, 'zone-1', 'behind the lookout', 'landmark:holt-lookout'),
  ...nn('obj:eaten-cart', 2, VF, 'zone-2', 'the supply trail'), p('obj:kit-fernsby-bow', VF, 'zone-2', 'under a holly'),
  p('landmark:gerald-the-tree', VF, 'zone-2'), ...nn('obj:fond-path', 3, VF, 'zone-2', '', 'landmark:gerald-the-tree'),
  p('landmark:pennick-camp', VF, 'zone-2'), ...nn('obj:humming-briar', 3, VF, 'zone-2', '', 'landmark:pennick-camp'),
  p('obj:old-rot-log', VF, 'zone-2', '', 'landmark:old-rot-stump'),
  p('landmark:fen-wedding-green', VF, 'zone-3'), ...nn('obj:fen-lily', 4, VF, 'zone-3', '', 'landmark:fen-wedding-green'), ...nn('obj:census-bloomkin', 4, VF, 'zone-3', 'round the fen'),
  p('landmark:rotking-throne', VF, 'zone-4', 'the edge of the Rotting Glade'), p('obj:hatchley-keepsake', VF, 'zone-4', '', 'landmark:hatchley-cottage'),
  ...nn('obj:aldo-supper-mushroom', 3, VF, 'zone-4', 'a stone ring'),
  p('obj:mossback-carcass', VF, 'lair-1'), p('obj:beetle-mound-spores', VF, 'lair-2'),
];

/** Swordsman and Samurai (Blade, 2026-10-20). */
const BC: Area = 'area:blade-capital', BF: Area = 'area:blade-frontier';
const BLADE: SetPieceDef[] = [
  p('landmark:thimble-shop', BC, 'zone-1'), p('obj:percy-practice-dummy', BC, 'zone-1', '', 'landmark:thimble-shop'),
  p('obj:percy-bout-ring', BC, 'zone-1', '', 'landmark:ladder-board'), p('landmark:sallow-booth', BC, 'zone-1'),
  ...nn('obj:insult-test', 3, BC, 'zone-1', '', 'landmark:sallow-booth'), p('landmark:quarter-watch-post', BC, 'zone-1'),
  p('obj:ferro-bout-record', BC, 'zone-1', 'a desk in the salle', 'landmark:ferro-salle'),
  p('landmark:champions-bridge', BC, 'zone-2'), p('landmark:rills-bridge', BC, 'zone-2'), p('obj:rill-lunch-basket', BC, 'zone-2', '', 'landmark:rills-bridge'),
  p('obj:rosa-sarto-revenant', BC, 'zone-2', 'mid-span', 'landmark:sisters-bridge'),
  p('obj:varric-statue', BC, 'zone-3', '', 'landmark:varric-statue'), p('landmark:grand-salle-steps', BC, 'zone-3', 'outside lair 2'),
  p('landmark:bellows-forge', BC, 'zone-4'), p('obj:scabbard-pattern', BC, 'zone-4', 'the pattern-loft', 'landmark:bellows-forge'),
  ...nn('obj:armoury-rack', 3, BC, 'zone-4', '', 'landmark:armoury-roll'), p('obj:ferro-empty-slot', BC, 'zone-4', '', 'landmark:armoury-roll'),
  p('obj:sword-saint-rest', BC, 'lair-1'), p('obj:ladder-original-roll', BC, 'lair-2'), p('obj:grand-salle-piste', BC, 'lair-2'),
  p('landmark:temple-road-gate', BF, 'zone-1'), p('landmark:temple-road-shrine', BF, 'zone-1'), p('obj:temple-road-shrine', BF, 'zone-1', '', 'landmark:temple-road-shrine'),
  ...nn('obj:pilgrim-sign-stone', 3, BF, 'zone-1', 'milestones'), p('obj:fallen-pine-rings', BF, 'zone-1', '', 'landmark:fallen-pine'),
  p('landmark:hushpine-elders-yard', BF, 'zone-2'), p('landmark:hushpine-fifth-yard', BF, 'zone-2'),
  p('obj:kenta-practice-post', BF, 'zone-2', '', 'landmark:hushpine-fifth-yard'), ...nn('obj:word-slip', 3, BF, 'zone-2'),
  p('obj:ashina-spring-source', BF, 'zone-2', '', 'landmark:ashina-spring'),
  p('landmark:daisuke-camp', BF, 'zone-3'), p('obj:tomoe-whetstone-wheel', BF, 'zone-3', '', 'landmark:tomoe-whetstone'),
  p('landmark:natsu-landing', BF, 'zone-4'), p('obj:lonely-dancer', BF, 'zone-4', 'the old channel'), p('obj:dancer-partner-sword', BF, 'zone-4', 'the old channel', 'obj:lonely-dancer'),
  ...nn('obj:frog-pond-reed', 3, BF, 'zone-4', '', 'landmark:frog-pond'),
  p('obj:ronin-fort-stockade', BF, 'lair-1'), p('obj:high-terrace-bell', BF, 'lair-3', 'night scene'),
];

export const SET_PIECES_EXTRA: SetPieceDef[] = [...ARCANIST, ...REAVER, ...SONG, ...VERDANT, ...BLADE, ...CAMPAIGN_PIECES];

/** Set pieces inside Concordia instances, by instance id. */
/** Pieces spread one per room on the way in (first … last room before the boss), in order. */
export const INSTANCE_ROOMS: Record<string, string[]> = {
  // Heart depth pass (Claude 4): the feast hall, the portrait gallery, the guard post outside the throne-room door
  'inst:concord-citadel': ['obj:heart-citadel-hall-1', 'obj:heart-citadel-hall-2', 'obj:heart-citadel-hall-3'],
};

export const INSTANCE_EXTRA: Record<string, string[]> = {
  'inst:drowned-abbey': ['obj:drowned-choir-stalls'],
  'inst:sentinel-hunt': ['obj:stag-glade-drumstone', 'obj:warden-torvald-shield'],
  'inst:sentinel-verdant': ['obj:shade-willow-roots'],
  'inst:sentinel-storm': ['obj:swordsman-spire-glove', 'obj:falconer-great-hood'], // wave 2, after the boss: the Spire top's rail, the great hood on the nest
  'inst:sentinel-umbral': ['obj:samurai-spinner-record', 'obj:huntsman-corva-rope'], // wave 2, after the boss: the last uncut thread, a cut silk rope
  'inst:sentinel-iron': ['obj:iron-engine-anvil', 'obj:arcanist-engine-setting'], // + the Engine's cooling forge-bed (Arcanist Act II)
  'inst:sentinel-fist': ['obj:fist-abbot-seat', 'obj:hedgewitch-graft-knife'],
  'inst:sentinel-guile': ['obj:duskweaver-queen-ledger', 'obj:rimecaller-regent-lantern'], // wave 2: the Lantern Queen's arena, after the boss
  // in-fight story objects for Claude 3's arena rules (Claude 4)
  'inst:blade-capital-lair-3': ['obj:swordsman-third-again'],
  'inst:guile-frontier-lair-2': ['obj:corsair-widow-bell', 'obj:corsair-widow-log', 'obj:corsair-widow-letter', 'obj:corsair-widow-wheel'],
  'inst:umbral-capital-lair-2': ['obj:duskweaver-name-wall-1', 'obj:duskweaver-name-wall-2', 'obj:duskweaver-name-wall-3'],
  'inst:varric-barrow': [...[1, 2, 3].map((i) => `obj:swordsman-endless-duel-${i}`), ...[1, 2, 3].map((i) => `obj:samurai-muster-rank-${i}`), 'obj:reaver-varric-roll'],
};
for (const [inst, ids] of Object.entries(WAVE2_INSTANCE)) INSTANCE_EXTRA[inst] = [...(INSTANCE_EXTRA[inst] ?? []), ...ids];

/**
 * Concordia places added by campaigns, anchored to anything already placed (landmark, waystone, object):
 * at the anchor's front plus (dx, dy) tiles. `landmark:` ids become 4×3 triggers there.
 */
export type { ConcordiaExtra };
const c = (id: string, near: string, name: string, dx?: number, dy?: number, label?: string, when?: FlagCond): ConcordiaExtra => ({ id, near, name, dx, dy, label, when });
export const CONCORDIA_EXTRA: ConcordiaExtra[] = [
  ...CAMPAIGN_CONCORDIA,
  ...WAVE2_CONCORDIA,
  c('obj:kiln-ash-ring', 'landmark:kiln-cinder-mug', 'Ash ring', -1, 0),
  // ── Wave 2 (Claude 4: Act II threads, Act III class quests) ──
  // Reaver
  c('obj:reaver-kilnmouth-axes', 'landmark:kiln-cinder-mug', 'Three Reaver axes over the hearth', 1, 0, 'Examine'),
  c('area:reaver-kilnmouth-road', 'landmark:gate-circle+landmark:kiln-great-kiln', 'The Kilnmouth road'),
  c('obj:reaver-muster-sign-1', 'obj:arch-ash', 'Hobnailed bootprints in step', 0, 2, 'Study'),
  c('obj:reaver-muster-sign-2', 'landmark:brind-graveyard', 'The lychgate prints', 0, -2, 'Study'),
  c('obj:reaver-muster-sign-3', 'landmark:barrow-door', 'A standing stone with a rally-mark', -9, 5, 'Study'),
  c('area:reaver-barrow-moor', 'landmark:brind-graveyard+landmark:barrow-door', 'The barrow moor'),
  c('obj:reaver-hask-axe', 'landmark:twelve-stairs-top', 'Hask\'s axe on the top stair', 2, 0, 'Take'),
  c('obj:reaver-stair-mark', 'obj:heart-peace-axe-stone', 'An old Muster rally-mark', 1, 1, 'Study'),
  c('obj:reaver-legion-axe-row', 'obj:legion-reavers', 'Nineteen axes in a row', 4, 1, 'Examine'),
  // Hedgewitch
  c('area:hedgewitch-briar-road', 'landmark:gate-circle+landmark:thorn-hedge-house', 'The hedge road'),
  c('obj:hedgewitch-hedge-pots', 'landmark:thorn-hedge-house', 'Labelled pots from home', 1, 0, 'Examine'),
  c('area:hedgewitch-gloam-road', 'landmark:thorn-briar-cottage+landmark:gloam-stags-rest', 'Into the Gloamwood'),
  c('obj:hedgewitch-willow-bark', 'landmark:gloam-stags-rest', 'The Willow\'s trunk', 2, -1, 'Examine'),
  c('landmark:hedgewitch-eel-hut', 'landmark:thorn-briar-cottage', 'Jennet\'s eel-hut', 6, 4),
  c('landmark:hedgewitch-bog-edge', 'obj:sentinel-fist-door', 'The edge of the deep bog', -8, 6),
  c('obj:hedgewitch-reply-briar', 'obj:hedgewitch-yarrow-leaf', 'A new leaf in the briar', 1, 0, 'Examine'),
  c('obj:hedgewitch-camp-bedroll', 'landmark:heart-camp', 'Your bedroll', -4, 2, 'Rest'),
  c('obj:hedgewitch-concordant-bed', 'landmark:twelve-stairs', 'Nan\'s old garden bed', -3, 2, 'Examine'),
  c('obj:hedgewitch-gran-pail', 'landmark:twelve-stairs', 'A sap-pail with a ribbon bow', 3, 2, 'Examine'),
  c('obj:hedgewitch-thistle-spot-1', 'landmark:heart-camp', 'Behind the cook-tent', 3, -2, 'Search'),
  c('obj:hedgewitch-thistle-spot-2', 'landmark:heart-camp', 'By the tethering-posts', 6, 1, 'Search'),
  c('obj:hedgewitch-thistle-spot-3', 'landmark:heart-camp', 'The camp edge, where the Legion road begins', 8, -4, 'Search'),
  c('landmark:hedgewitch-thistle-patch', 'obj:hedgewitch-thistle-spot-3', 'Thistledown\'s patch', 0, 1),
  // Ranger
  c('area:ranger-briar-road', 'landmark:gate-circle+landmark:thorn-hedge-house', 'The hedge road'),
  c('obj:ranger-hedge-loft', 'landmark:thorn-hedge-house', 'The loft hatch', -1, 0, 'Climb'),
  c('area:ranger-gloam-ways', 'obj:ranger-old-blaze-1+obj:ranger-old-blaze-3', 'The old blazes'),
  c('obj:ranger-willow-log', 'landmark:gloam-stags-rest', 'A fallen grey oak', -2, 2, 'Examine'),
  c('landmark:ranger-glade-camp', 'ws:glade', 'Teasel\'s fire', 0, 30), // 30–40 tiles from the stag glade (escort start)
  c('obj:ranger-reply-blaze', 'obj:ranger-holt-blaze', 'Bare stone for a blaze', 1, 0, 'Blaze'),
  c('obj:ranger-stair-foot', 'landmark:twelve-stairs', 'A test blaze at the foot of the Stairs', 0, 2, 'Examine'),
  c('obj:ranger-bedroll-rot', 'obj:ranger-aldo-garden', 'Honest rot by the bedroll', 1, 0, 'Examine'),
  c('obj:ranger-aldo-bell', 'landmark:twelve-stairs', 'A hollow bell', 2, 1, 'Examine'),
  c('obj:ranger-aldo-crack', 'landmark:twelve-stairs-top', 'The crack where he sat', -2, 0, 'Examine'),
  c('obj:ranger-salt-trail-1', 'landmark:heart-camp', 'A porridge bowl on a crate', -2, -2, 'Examine'),
  c('obj:ranger-salt-trail-2', 'landmark:heart-camp', 'A helmet by the fire', 1, 3, 'Examine'),
  c('obj:ranger-salt-trail-3', 'obj:ranger-salt-pole', 'A tent-guy', 1, 0, 'Follow'),
  c('obj:ranger-squirrel-blaze', 'landmark:twelve-stairs', 'The first step', -1, 1, 'Examine'),
  // Duskweaver
  c('landmark:duskweaver-umbral-corner', 'landmark:brind-graveyard', 'The Umbral corner', 5, 3),
  c('obj:duskweaver-umbral-corner', 'landmark:duskweaver-umbral-corner', 'Small stones and a bronze bell', 0, 1, 'Examine'),
  c('landmark:duskweaver-root-hollow', 'landmark:sentinel-umbral', 'A hollow in the root-caves', -6, 4),
  c('obj:duskweaver-last-record', 'landmark:duskweaver-root-hollow', 'A thread into the dark', 0, 1, 'Follow'),
  c('landmark:duskweaver-ford-edge', 'landmark:ford-lantern-shop', 'The end of the causeway', 0, 10),
  c('area:duskweaver-ford-causeway', 'landmark:ford-lantern-shop+landmark:duskweaver-ford-edge', 'The ford causeway'),
  c('obj:duskweaver-reply-to-nyx', 'obj:arch-umbral', 'A courier satchel on the post', 1, 0, 'Open'),
  c('landmark:duskweaver-stair-landing', 'landmark:twelve-stairs', 'A sheltered landing', -4, -6),
  c('obj:duskweaver-stair-landing', 'landmark:duskweaver-stair-landing', 'The landing', 0, 1, 'Rest'),
  c('obj:duskweaver-heart-lantern', 'landmark:heart-camp', 'A paper lantern facing home', 7, 2, 'Examine'),
  c('obj:duskweaver-button-phial', 'landmark:legion-camp', 'A lone phial in the dust', -6, 0, 'Take'),
  c('obj:duskweaver-phial-shelf', 'landmark:heart-camp', 'A supply crate', 2, -1, 'Search'),
  c('obj:duskweaver-paw-prints', 'landmark:legion-camp', 'Two sets of paw prints', 3, 3, 'Study'),
  c('landmark:duskweaver-cook-fire', 'landmark:heart-camp', 'The cook-fire', -1, 2),
  c('obj:duskweaver-heart-saucer', 'landmark:duskweaver-cook-fire', 'A saucer by the fire', 1, 1, 'Examine'),
  // Shade
  c('obj:shade-rat-hiding-hole', 'landmark:coach-drowned-rat', 'Two loose floorboards', 1, 0, 'Search'),
  c('landmark:shade-web-edge', 'landmark:sentinel-umbral', 'The edge of the Spinner\'s web', -4, 3),
  c('landmark:shade-root-mouth', 'landmark:sentinel-umbral', 'The root-cave mouth', -20, 10),
  c('area:shade-root-caves', 'landmark:shade-root-mouth+landmark:shade-web-edge', 'The root-caves'),
  c('landmark:shade-shadow-camp', 'landmark:gloam-stags-rest', 'A camp by the stream', 6, 4),
  c('obj:shade-shadow-camp-1', 'landmark:shade-shadow-camp', 'A fire-ring', 0, 1, 'Examine'),
  c('obj:shade-shadow-camp-2', 'landmark:shade-shadow-camp', 'A list under a stone', -2, 1, 'Read'),
  c('obj:shade-shadow-camp-3', 'landmark:shade-shadow-camp', 'A lantern on a low branch', 2, 0, 'Light'),
  c('landmark:shade-free-bridge', 'landmark:gate-circle', 'The free bridge', 0, 0),
  c('obj:shade-reply-to-mab', 'landmark:shade-free-bridge', 'Nettle\'s slate', 1, 0, 'Read'),
  c('landmark:shade-umbral-stair', 'landmark:twelve-stairs', 'The ninth step', -3, -4),
  c('obj:shade-stair-chalk', 'landmark:shade-umbral-stair', 'Chalk hood-and-key signs', -1, 2, 'Study'),
  c('obj:shade-thread-home', 'landmark:heart-camp', 'A grey thread on a tent-pole', -6, -1, 'Follow'),
  c('obj:shade-small-shadow', 'landmark:heart-camp', 'At the edge of the lantern-light', 4, 4, 'Look'),
  // Rimecaller
  c('obj:rimecaller-remembering-slate', 'landmark:warden-wardenhold-keep', 'A wall of black slate', 1, 0, 'Read'),
  c('landmark:rimecaller-held-road', 'ws:frost', 'The held road', 3, -47), // up the pass road, short of the High Pass: ~32 steps from the Wardenhold keep (Mina's escort)
  c('obj:rimecaller-sledge-trail-1', 'landmark:ford-ford-keeper', 'Frosted sledge runners', 2, 1, 'Study'),
  c('obj:rimecaller-sledge-trail-2', 'landmark:ford-bog-market', 'A chandler\'s chit', 1, 0, 'Read'),
  c('obj:rimecaller-sledge-trail-3', 'landmark:ford-lantern-shop', 'A held light with a "Return" tag', 2, 2, 'Take'),
  c('obj:rimecaller-arch-reply', 'obj:arch-rime', 'A crack in the ice', 0, 1, 'Examine'),
  c('obj:rimecaller-heart-reading', 'landmark:heart-camp', 'A lee behind a supply cart', 6, -2, 'Read'),
  c('obj:rimecaller-heart-snowdrop', 'landmark:legion-camp', 'A single snowdrop', 0, -4, 'Examine'),
  c('obj:rimecaller-anselm-ring', 'landmark:legion-camp', 'The hollowed ring round the chair', -4, -2, 'Examine'),
  c('obj:rimecaller-anselm-cup', 'landmark:legion-camp', 'The cup by the chair', -2, 0, 'Examine'),
  c('obj:rimecaller-still-gazers', 'obj:rimecaller-still-one', 'A gazing crowd', 0, 3, 'Examine'),
  // Warden
  c('obj:warden-gate-log', 'landmark:warden-wardens-gate', 'A log-book on the gatepost', 1, 0, 'Read'),
  c('obj:warden-turnback-stone', 'obj:warden-pass-cairn-3', 'A turning stone', 0, -2, 'Examine'),
  c('landmark:warden-procession-road', 'obj:warden-torvald-gloam-table', 'The notched flat stone', 0, -4),
  c('obj:warden-gate-horn', 'landmark:warden-wardens-gate', 'The Wardenhold horn', -1, 0, 'Sound'),
  c('obj:warden-legion-warden', 'landmark:legion-camp', 'A hollowed Warden out of step', 5, -2, 'Examine'),
  c('obj:warden-heart-table', 'landmark:heart-camp', 'A long trestle table', 0, 4, 'Sit'),
  c('obj:warden-goat-cairn', 'obj:warden-gubbins-banner', 'The mouth of Gubbins\'s gully', 2, 0, 'Examine'),
  // Swordsman
  c('area:swordsman-green', 'landmark:gate-circle+landmark:brind-watch-house', 'The Brindlecross green'),
  c('obj:swordsman-watch-ladder', 'landmark:brind-watch-house', 'The chalk Ladder on the whitewash', 1, 0, 'Read'),
  c('area:swordsman-cliff-road', 'landmark:gate-circle+landmark:cliff-lightning-jar', 'The cliff road'),
  c('obj:swordsman-jar-slate', 'landmark:cliff-lightning-jar', 'The slate behind the bar', 1, 0, 'Read'),
  c('obj:swordsman-reply-arch', 'obj:arch-blade', 'The challenge slot in the keystone', 0, 1, 'Examine'),
  c('obj:swordsman-kept-boy', 'landmark:twelve-stairs', 'A boy in a rung-400 sash', -2, 3, 'Talk'),
  c('obj:swordsman-percy-chalk', 'landmark:twelve-stairs', 'The Heart Ladder, chalked on the first step', 1, 0, 'Read'),
  // Samurai
  c('area:samurai-chapel-road', 'landmark:gate-circle+landmark:brind-chapel', 'The chapel road'),
  c('obj:samurai-pilgrim-strips', 'landmark:brind-chapel', 'Blank prayer-strips on the back rail', -1, 0, 'Examine'),
  c('area:samurai-gloam-threads', 'landmark:gloam-wolf-tracks+obj:sentinel-umbral-door', 'Under the Gloamwood'),
  c('landmark:samurai-root-mouth', 'obj:sentinel-umbral-door', 'The cave mouth', 0, 3),
  c('obj:samurai-reply-strip', 'obj:arch-blade', 'Beside the old faded prayer-strip', -1, 1, 'Tie'),
  c('obj:samurai-voice-step', 'landmark:twelve-stairs', 'The foot of the Stairs', 0, 3, 'Stand'),
  c('obj:samurai-legion-cages', 'landmark:legion-camp', 'Broken-open cages', -6, -4, 'Examine'),
  c('obj:samurai-heart-sweep', 'obj:samurai-heart-post', 'The practice ground', 1, 1, 'Practise'),
  // Huntsman
  c('landmark:huntsman-lodge-hall', 'landmark:lodge-hunters-lodge', 'The lodge hall', 2, -1),
  c('obj:huntsman-old-law-board', 'landmark:huntsman-lodge-hall', 'A black oak board over the fire', 0, 1, 'Read'),
  c('landmark:huntsman-trail-head', 'landmark:lodge-hunters-lodge', 'The head of the Stag\'s trail', 16, -30), // towards the stag glade; ~32 steps (Thaddeus's escort)
  c('obj:huntsman-corva-sign-1', 'landmark:lodge-hunters-lodge', 'A silver-shod print at the ford', -20, -12, 'Study'),
  c('obj:huntsman-corva-sign-2', 'landmark:lodge-hunters-lodge', 'A Lodge-buried fire at a deer-path crossing', -40, -23, 'Study'),
  c('obj:huntsman-corva-sign-3', 'landmark:lodge-hunters-lodge', 'A card bolted to a birch', -61, -35, 'Read'),
  c('area:huntsman-lodge-path', 'landmark:lodge-hunters-lodge+landmark:huntsman-trail-head', 'The lodge path'),
  c('landmark:huntsman-gate-milestone', 'landmark:gate-circle', 'The old milestone', 10, 4),
  c('obj:huntsman-reply-sorrel', 'landmark:huntsman-gate-milestone', 'A sprig of sorrel on the milestone', 0, 1, 'Examine'),
  c('landmark:huntsman-hunt-stair', 'landmark:twelve-stairs', 'Halfway up the Hunt stair', 4, -6),
  c('obj:huntsman-stair-banner', 'landmark:huntsman-hunt-stair', 'An iron banner-arm', 0, 1, 'Examine'),
  c('obj:huntsman-heart-tally', 'landmark:heart-camp', 'The side-board of a supply cart', 3, 2, 'Read'),
  c('landmark:huntsman-snipe-pack', 'landmark:heart-camp', 'Quentin\'s pack', -8, 3),
  c('obj:huntsman-tenth-notice', 'landmark:huntsman-snipe-pack', 'The tenth notice', 0, 1, 'Read'),
  c('landmark:huntsman-wagon-line', 'landmark:heart-camp', 'The far end of the wagon line', 9, 6),
  c('obj:huntsman-calf-watch', 'landmark:huntsman-wagon-line', 'Facing the dark', 0, 1, 'Watch'),
  // Falconer
  c('landmark:falconer-cormorant-bank', 'landmark:shore-ferry-house', 'A mud-bank below the ferry', 3, 4),
  c('obj:falconer-cormorant-perches', 'landmark:falconer-cormorant-bank', 'A row of old oars with crosspieces', 0, 1, 'Examine'),
  c('landmark:falconer-silent-holly', 'landmark:gloam-stag-glade', 'A holly by the silent road', -8, 6),
  c('obj:falconer-silent-nest', 'landmark:falconer-silent-holly', 'A silent nest', 0, 1, 'Look'),
  c('landmark:falconer-supper-ledge', 'landmark:cliff-lightning-jar', 'A flat rock below the hooded ledges', 0, -19), // ~24 steps up the cliff path (Bartle's escort)
  c('area:falconer-cliff-path', 'landmark:cliff-lightning-jar+landmark:falconer-supper-ledge', 'The Stormcliff path'),
  c('landmark:falconer-gate-dovecote', 'landmark:brind-gilded-goose', 'The dovecote behind the inn', 0, -4),
  c('obj:falconer-reply-to-wren', 'landmark:falconer-gate-dovecote', 'A note for Wren', 0, -4, 'Read', { flag: 'falconer.reply_open' }), // up at the dovecote, clear of the Goose bed's [F] focus; usable only in its reply stage (Claude 4)
  c('landmark:falconer-perch-post', 'landmark:heart-camp', 'A perch-post', -5, -3),
  c('obj:falconer-jess-post', 'landmark:falconer-perch-post', 'Jesses on the post', 0, 1, 'Examine'),
  c('obj:falconer-fallen-hoods', 'landmark:legion-camp', 'Three hoods in the dust', 2, -3, 'Examine'),
  c('landmark:falconer-camp-east', 'landmark:heart-camp', 'The east edge of the camp', 12, 0),
  c('obj:falconer-windscour-road', 'landmark:falconer-camp-east', 'The road home', 0, 1, 'Look'),
  c('obj:falconer-fledgling-feathers', 'landmark:legion-camp', 'A feather trail between the tents', -2, -2, 'Follow'),
  c('landmark:falconer-tent-foot', 'landmark:heart-camp', 'The foot of the fledglings\' tent', -3, -5),
  c('obj:falconer-feather-count', 'landmark:falconer-tent-foot', 'The feather count', 0, 1, 'Count'),
  // Arcanist Act II/III (Claude 4's reference pass): Kilnmouth, the Gilded Ruins, the Gate Circle, the Legion camp
  c('landmark:arcanist-vent-head', 'landmark:kiln-great-kiln', 'The breath-vents', 24, 0), // a walk from Kilnmouth (walkable, checked)
  c('obj:arcanist-kilnmouth-kiln', 'landmark:kiln-great-kiln', 'The cold Kiln', 0, 1, 'Examine'),
  c('area:arcanist-kilnmouth-road', 'landmark:gate-circle+landmark:kiln-great-kiln', 'The Kilnmouth road'),
  c('obj:arcanist-gild-smoke-1', 'landmark:gild-clocktower', 'A smoking chimney', 2, 1, 'Examine'),
  c('obj:arcanist-gild-smoke-2', 'landmark:gild-golden-crust', 'A smoking chimney', 2, 1, 'Examine'),
  c('obj:arcanist-gild-smoke-3', 'landmark:gild-sparkwright-works', 'A smoking chimney, a fuel barrel at its foot', 3, 1, 'Examine'),
  c('obj:arcanist-pigeon-post', 'obj:arch-ash', 'A soot-pigeon on the Ash arch', 1, 0, 'Examine'),
  c('obj:arcanist-lissa-ledger', 'landmark:legion-camp', 'A dropped ledger', 0, -2, 'Read'),
  // Heart depth pass (Claude 4): the bearers' camp the night before the Wall, and the Legion's camp
  c('obj:heart-camp-fire', 'landmark:heart-camp', 'The bearers\' fires', 0, 1, 'Sit'),
  c('obj:heart-maren-pelt', 'landmark:heart-camp', 'Maren\'s small fire', -5, 3, 'Sit'),
  c('obj:heart-legion-roll', 'landmark:legion-camp', 'The muster roll', 0, 0, 'Read'),
  c('obj:heart-godric-helmet', 'landmark:legion-camp', 'A helmet on a trophy spear', 4, -2, 'Examine'),
  // shared Concordia depth pass (Claude 4): Brindlecross and the Gloamwood stag
  c('area:cc-moor-road', 'landmark:gate-circle+landmark:brind-elders-house', 'The moor road'),
  c('obj:cc-abbey-register', 'landmark:brind-chapel', 'The Abbey register, under a cloth', 2, 0, 'Read'),
  c('obj:cc-court-charter', 'landmark:stone-court', 'The Concord charter', 0, -3, 'Read'),
  c('obj:cc-odo-anvil', 'landmark:brind-anvil', 'Odo\'s anvil'),
  c('obj:cc-mill-wheel', 'landmark:brind-mill', 'The millrace wheel'),
  // the stag's line from the wolf tracks towards the glade, and its signs off the path (walkable, checked)
  c('obj:cc-stag-print-1', 'obj:gloam-wolf-tracks', 'A stag\'s print', 23, -50, 'Study'),
  c('obj:cc-stag-print-2', 'obj:gloam-wolf-tracks', 'A stag\'s print', 42, -93, 'Study'),
  c('obj:cc-stag-sign-1', 'obj:gloam-wolf-tracks', 'A rubbed oak', -23, -8, 'Examine'),
  c('obj:cc-stag-sign-2', 'obj:gloam-wolf-tracks', 'A trampled briar', 23, 19, 'Examine'),
  c('obj:cc-stag-sign-3', 'obj:gloam-wolf-tracks', 'A dead flower ring', -10, -28, 'Examine'),
  // Song
  c('obj:lost-name-1', 'landmark:shore-fish-mill', 'Reeds below the mill', 0, 3, 'Search the reeds'),
  c('obj:lost-name-2', 'landmark:shore-fish-mill', "The mill's nets", -2, 0, 'Search the nets'),
  c('obj:lost-name-3', 'landmark:shore-ferry-house', 'A jar', 3, 0),
  c('obj:shore-dirge-stone', 'landmark:shore-chapel', 'The dirge stone', 0, 4, 'Read the stone'),
  c('obj:nave-name-drum', 'obj:drowned-bell', 'A drum on the water', 2, -2, 'Strike the drum'),
  c('landmark:gloam-stags-rest', 'obj:sentinel-verdant-door', "Stag's Rest", 0, 1),
  c('obj:marchetti-horn-1', 'ws:stag', "Marchetti's horn", -5, -2, 'Sound the horn'),
  c('obj:marchetti-horn-2', 'ws:stag', "Marchetti's horn", 5, -2, 'Sound the horn'),
  c('obj:marchetti-horn-3', 'ws:stag', "Marchetti's horn", 0, 5, 'Sound the horn'),
  c('obj:willow-refrain-stone', 'obj:sentinel-verdant-door', 'A stone in the roots', 3, 0, 'Listen'),
  c('landmark:gloam-empty-patch', 'ws:stag', 'A shadowless moss circle', 10, -7),
  c('obj:gloam-empty-patch', 'ws:stag', 'The empty patch', 10, -6, 'Step in'),
  c('obj:ulf-glade-drum', 'landmark:gloam-stag-glade', "Ulf's drum", 1, 0, 'Strike the drum'),
  c('obj:ranger-hide', 'landmark:gloam-stag-glade', "A ranger's hide", 0, -7, 'Look inside'),
  c('obj:song-arch-letter', 'obj:arch-song', 'A letter tucked in the arch', -1, 1, 'Read'),
  c('obj:song-arch-drum', 'obj:arch-song', 'A drum by the arch', 1, 1, 'Strike the drum'),
  c('obj:song-court-duet', 'landmark:stone-court', 'The embassy steps', 0, -1, 'Sing'),
  // Verdant
  c('obj:hedgewitch-yarrow-leaf', 'obj:arch-verdant', 'A yarrow leaf on the arch', -1, 1, 'Take the leaf'),
  c('obj:ranger-holt-blaze', 'obj:arch-verdant', 'A holt blaze', 1, 1, 'Read the blaze'),
  c('obj:verdant-court-bench', 'landmark:stone-court', 'A bench of living wood', -3, 0, 'Sit'),
  c('obj:blade-court-bench', 'landmark:stone-court', 'A bench of crossed blades', 3, 0, 'Sit'),
  c('obj:hedgewitch-abbot-cairn', 'landmark:thorn-greenbriar-nursery', 'The abbot’s cairn', 0, -4, 'Look'),
  c('obj:hedgewitch-sap-pail-1', 'obj:sentinel-fist-door', "A sap pail", -9, -4, "Take the pail"),
  c('obj:hedgewitch-sap-pail-2', 'obj:sentinel-fist-door', "A sap pail", -6, -2, "Take the pail"),
  c('obj:hedgewitch-sap-pail-3', 'obj:sentinel-fist-door', "A sap pail", -3, -1, "Take the pail"),
  c('obj:hedgewitch-seed-pot', 'obj:sentinel-fist-door', 'A seed pot', -1, 1, 'Take the pot'),
  c('obj:hedgewitch-willow-root-1', 'obj:sentinel-verdant-door', "A willow root", -3, 0, "Touch the root"),
  c('obj:hedgewitch-willow-root-2', 'obj:sentinel-verdant-door', "A willow root", 2, 1, "Touch the root"),
  c('obj:hedgewitch-willow-root-3', 'obj:sentinel-verdant-door', "A willow root", 4, -1, "Touch the root"),
  c('obj:hedgewitch-song-bough-1', 'ws:stag', "A singing bough", -6, 1, "Listen"),
  c('obj:hedgewitch-song-bough-2', 'ws:stag', "A singing bough", 6, 1, "Listen"),
  c('obj:hedgewitch-song-bough-3', 'ws:stag', "A singing bough", 0, -6, "Listen"),
  c('obj:ranger-old-blaze-1', 'ws:glade', "An old Wayfarer blaze", -10, 6, "Read the blaze"),
  c('obj:ranger-old-blaze-2', 'ws:glade', "An old Wayfarer blaze", -18, 12, "Read the blaze"),
  c('obj:ranger-old-blaze-3', 'ws:glade', "An old Wayfarer blaze", -26, 18, "Read the blaze"),
  c('obj:ranger-barren-spore-1', 'landmark:gloam-stag-glade', "Barren spores", -4, 2, "Gather"),
  c('obj:ranger-barren-spore-2', 'landmark:gloam-stag-glade', "Barren spores", 5, 2, "Gather"),
  c('obj:ranger-barren-spore-3', 'landmark:gloam-stag-glade', "Barren spores", 0, 4, "Gather"),
  c('obj:ranger-stag-glade-edge', 'landmark:gloam-stag-glade', 'The edge of the glade', 7, -3, 'Look'),
  c('obj:ranger-stag-run-1', 'ws:glade', "The old Turning road", 6, 8, "Follow the run"),
  c('obj:ranger-stag-run-2', 'ws:glade', "The old Turning road", 12, 14, "Follow the run"),
  c('obj:ranger-stag-run-3', 'ws:glade', "The old Turning road", 18, 20, "Follow the run"),
  c('obj:ranger-saga-verse-1', 'landmark:gloam-wolf-tracks', "A carved verse", -4, -3, "Read"),
  c('obj:ranger-saga-verse-2', 'landmark:gloam-wolf-tracks', "A carved verse", 3, -5, "Read"),
  c('obj:ranger-saga-verse-3', 'landmark:gloam-wolf-tracks', "A carved verse", 6, 2, "Read"),
  // Blade
  c('obj:samurai-cut-thread-1', 'obj:sentinel-umbral-door', "A cut thread", -3, -2, "Look"),
  c('obj:samurai-cut-thread-2', 'obj:sentinel-umbral-door', "A cut thread", 0, -3, "Look"),
  c('obj:samurai-cut-thread-3', 'obj:sentinel-umbral-door', "A cut thread", 3, -2, "Look"),
  c('obj:samurai-web-crossing-1', 'obj:sentinel-umbral-door', "A web crossing", -5, 1, "Cross"),
  c('obj:samurai-web-crossing-2', 'obj:sentinel-umbral-door', "A web crossing", 5, 1, "Cross"),
  c('obj:samurai-web-crossing-3', 'obj:sentinel-umbral-door', "A web crossing", 0, 3, "Cross"),
  c('obj:samurai-quiet-pew', 'landmark:brind-chapel', 'The back pew', -2, 0, 'Sit'),
  c('obj:swordsman-reaver-stand', 'landmark:brind-graveyard', 'A Reaver’s stand', -2, -1, 'Stand'),
  c('obj:samurai-oath-stone', 'obj:barrow-door', 'An oath stone', 2, 1, 'Kneel'),
  c('obj:swordsman-spire-challenge-1', 'landmark:cliff-storm-spire', "A challenge mark", 0, -1, "Answer"),
  c('obj:swordsman-spire-challenge-2', 'landmark:cliff-storm-spire', "A challenge mark", 1, -3, "Answer"),
  c('obj:swordsman-spire-challenge-3', 'landmark:cliff-storm-spire', "A challenge mark", -1, -5, "Answer"),
  c('obj:swordsman-falcon-perch', 'landmark:cliff-storm-spire', 'A falcon’s perch', 2, -3, 'Look'),
];

