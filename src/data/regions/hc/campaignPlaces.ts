/**
 * Campaign placement lists (Claude 4, 2026-10-20 onwards) in a compact line format, parsed at load. Pure data.
 *   Realm line:     `<where>: <id>[..N] [@anchor] [# note]`        where = zone-1..4 | lair-1..3 | gate | road
 *                   (way-2..4 = halfway along the road out to zone N; road = halfway up the road to the gate; a lair piece whose note says "rooms" goes one per lair room)
 *   Concordia line: `<id>[..N] @<anchor> [dx,dy | dx,dy | …] [# Name]`  (one offset per numbered piece)
 */
import type { SetPieceDef } from '@/world/hc/types';

type Area = SetPieceDef['area'];
export interface ConcordiaExtra { id: string; near: string; name: string; label?: string; dx?: number; dy?: number }

const ids = (id: string): string[] => {
  const m = /^(.*)-(\d+)\.\.(\d+)$/.exec(id);
  return m ? Array.from({ length: Number(m[3]) - Number(m[2]) + 1 }, (_, i) => `${m[1]}-${Number(m[2]) + i}`) : [id];
};

/** Parse realm lines for one start area. */
function realmList(area: Area, text: string): SetPieceDef[] {
  const out: SetPieceDef[] = [];
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith("//")) continue;
    const [body, note = ''] = line.split('#').map((x) => x.trim());
    const m = /^(zone-\d|lair-\d|way-\d|gate|road):\s*(\S+)(?:\s+@(\S+))?$/.exec(body);
    if (!m) throw new Error(`[setPiecesExtra] bad line: ${line}`);
    for (const id of ids(m[2])) out.push({ id, area, where: m[1], note, near: m[3] });
  }
  return out;
}

const titled = (id: string) => id.replace(/^[a-z]+:/, '').replace(/-\d+$/, '').split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');

/** Parse Concordia lines. */
function concordiaList(text: string): ConcordiaExtra[] {
  const out: ConcordiaExtra[] = [];
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith("//")) continue;
    const [body, name] = line.split('#').map((x) => x.trim());
    const m = /^(\S+)\s+@(\S+)(?:\s+(.+))?$/.exec(body);
    if (!m) throw new Error(`[setPiecesExtra] bad line: ${line}`);
    const offs = (m[3] ?? '').split('|').map((s) => s.trim()).filter(Boolean).map((s) => s.split(',').map(Number) as [number, number]);
    ids(m[1]).forEach((id, i) => {
      const o = offs[i] ?? offs[0];
      out.push({ id, near: m[2], name: name ?? titled(id), dx: o?.[0], dy: o?.[1] });
    });
  }
  return out;
}

/** Outline ids Claude 4 retired (they stay out of the world). */
export const RETIRED = new Set(['obj:fledgling-nest']);

// ───────────── Iron (Knight, Juggernaut) ─────────────
const IRON = [
  ...realmList('area:iron-capital', `
    zone-1: landmark:order-chapterhouse
    zone-1: landmark:hilde-toll-house
    zone-1: obj:hilde-gate-1..3 @landmark:hilde-toll-house
    zone-1: obj:bakery-gate # a gate built round a bakery, Lantern Street
    zone-1: landmark:anvilgate-toll-board # bounty board
    zone-1: obj:vigil-shield @landmark:order-chapel
    zone-1: obj:contrition-shelves @landmark:office-of-contrition
    zone-2: obj:tilt-quintain-1..3 @landmark:tilt-yard-lists
    zone-2: obj:queens-route-1..3 @landmark:duty-stall # towards the Wall
    zone-2: obj:duty-saddle # the foot of the Wall arch
    zone-3: landmark:forge-rivet-benches
    zone-3: obj:rivet-crate-1..3 @landmark:forge-rivet-benches
    zone-4: landmark:wall-masons-stair
    zone-4: obj:mason-mark-1..3 @landmark:wall-masons-stair
    zone-4: landmark:wall-walk-steps
    zone-4: obj:wall-high-tower @landmark:wall-dubbing-tower # the top of the highest tower
    lair-1: obj:berenika-tomb
    lair-1: obj:gideon-spurs # the drowned crypts under the barrow well
    lair-2: obj:heraldry-roll # lectern
    // Knight Act I depth (Claude 4's helpers)
    zone-1: landmark:knight-colossus-breach @landmark:gideon-quarters # the first hole the Colossus made, by the chapel
    zone-1: area:knight-dawn-wards @landmark:order-chapel+landmark:knight-colossus-breach
    zone-2: landmark:knight-order-stables @landmark:tilt-yard-lists
    zone-2: obj:knight-new-horse-1..3 @landmark:knight-order-stables # a bay mare, a grey colt, the last stall with a saddlebag
    zone-4: obj:knight-council-dawn @landmark:wall-walk-steps # dawn view over the gate road
    zone-3: obj:knight-cradle-clue-1..3 @landmark:colossus-cradle # plans on the wall, delivery tags, a cart-sized mould
    road: landmark:knight-last-toll # the Last Toll, an iron arch with no walls
    road: obj:knight-last-toll @landmark:knight-last-toll # the toll-box on a post
    road: area:knight-gate-road @landmark:knight-last-toll+obj:iron-gate-seal
    zone-1: landmark:knight-brack-bakery @landmark:hilde-toll-house # Corisande Brack's bakery front
    zone-1: obj:knight-brack-oven @landmark:knight-brack-bakery
    zone-1: obj:knight-bray-first-letter @landmark:order-chapterhouse # the Chapterhouse post-basket
    zone-2: landmark:knight-tilt-stands @landmark:tilt-yard-lists # the stands above the lists
    zone-2: obj:knight-mudge-father @landmark:knight-tilt-stands # Wat's father in the stands
    way-3: landmark:knight-deepworks-lift # the great cage-lift at the Forge's edge
    way-3: obj:knight-lift-ledger @landmark:knight-deepworks-lift
    zone-1: obj:knight-chapel-altar @landmark:order-chapel # the altar rail
    zone-1: landmark:knight-ilka-house # a green door on Lamp Lane
    zone-1: obj:knight-ilka-door @landmark:knight-ilka-house
  `),
  ...realmList('area:iron-frontier', `
    zone-1: obj:shaft-head-prop @landmark:rivet-shaft-head
    zone-1: landmark:lotte-house
    zone-1: obj:lotte-door-1..3 @landmark:lotte-house
    zone-1: landmark:rivet-tally-board # bounty board
    zone-1: obj:pennys-ledger @landmark:rivet-company-store
    zone-2: landmark:deepworks-rail-yard
    zone-2: obj:dilly-race-cart @landmark:deepworks-rail-yard
    zone-2: obj:singing-seam-echo @landmark:singing-seam
    zone-3: obj:agathe-crane-ladder @landmark:agathe-crane
    zone-3: landmark:slag-contest-yard
    zone-3: obj:slag-sculpture-1..3 @landmark:slag-contest-yard
    zone-4: landmark:tinker-twins-cart
    zone-4: obj:scrap-part-1..3 @landmark:tinker-twins-cart
    zone-4: obj:teasdale-pick # in the scrap
    zone-4: landmark:brotherhood-shrine # Scrapfields edge
    zone-4: obj:brotherhood-shrine @landmark:brotherhood-shrine
    zone-4: obj:magda-strongbox @landmark:scrap-hive-mound
    lair-1: obj:foundry-pail-heap
    lair-2: obj:strike-banner
    lair-3: landmark:hollow-lode-mouth # the lair 3 entrance (approach)
    // Juggernaut Act I depth (Claude 4's helpers)
    zone-1: area:juggernaut-rivet-street @landmark:rivet-shaft-head+landmark:rivet-tally-board
    zone-2: obj:juggernaut-boiler-clue-1..3 # the golems' water-tank, a new pipe-joint, the drain grating
    zone-1: obj:juggernaut-payday-1..3 # the baker's, the cobbler's, the tavern
    zone-1: obj:juggernaut-whistle-dawn @landmark:rivet-shaft-head # dawn scene
    zone-3: obj:juggernaut-quiet-miner-1..2 # a crate by the Lode road, a swept yard
    zone-3: obj:juggernaut-quiet-miner-3 @landmark:hollow-lode-mouth
    road: landmark:juggernaut-lamp-post # the top of the main line
    road: obj:juggernaut-lamp-post @landmark:juggernaut-lamp-post
    road: area:juggernaut-main-line @landmark:juggernaut-lamp-post+obj:iron-gate-seal
    zone-1: obj:juggernaut-lotte-invite @landmark:rivet-shaft-head # the shaft-head notice board
    zone-1: landmark:juggernaut-pay-office @landmark:rivet-company-store # the Regency's pay office
    zone-1: obj:juggernaut-auditor-desk @landmark:juggernaut-pay-office
    way-2: landmark:juggernaut-old-gallery @landmark:singing-seam # the oldest gallery
    way-2: obj:juggernaut-song-board @landmark:juggernaut-old-gallery
    zone-3: landmark:juggernaut-slag-bridge @landmark:agathe-crane # under the crane's jib
    zone-3: obj:juggernaut-slag-dam @landmark:juggernaut-slag-bridge
    zone-1: obj:juggernaut-slag-canary @landmark:gussie-whistle-house # the whistle-house step
    zone-4: landmark:juggernaut-scrap-hill @landmark:tinker-twins-cart # a scrap heap
    zone-4: obj:juggernaut-twins-cart @landmark:juggernaut-scrap-hill
  `),
];

// ───────────── Fist (Monk, Brawler) ─────────────
const FIST = [
  ...realmList('area:fist-capital', `
    zone-1: obj:landing-customer-1..3 @landmark:yuen-tea-stall # landings above the stall
    zone-1: landmark:prayer-flag-lines
    zone-1: obj:prayer-flag-1..3 @landmark:prayer-flag-lines
    zone-1: landmark:thousand-stairs-foot # where the gate road starts
    zone-2: landmark:terrace-goat-pens
    zone-2: obj:matins-roof @landmark:meditation-hall-roof
    zone-2: obj:forgotten-goat-shrine # the end of an old goat path
    zone-2: landmark:novice-dormitory
    zone-2: obj:sop-sleeping-mat @landmark:novice-dormitory # night
    zone-3: obj:great-bell-rope @landmark:great-bell # night
    zone-3: landmark:empty-cells-cloister
    zone-3: obj:empty-cell-1..3 @landmark:empty-cells-cloister
    zone-4: obj:kitchen-pot-1..3 @landmark:cloud-kitchen-hearth
    zone-4: landmark:climbers-rice-store
    zone-4: obj:rice-sacks @landmark:climbers-rice-store
    lair-1: obj:guardian-hall-novices # far door
    lair-2: obj:ninefold-cushion
    lair-3: obj:kell-throne-arm @landmark:mountain-king-throne # approach
    // Monk Act I depth (Claude 4's helpers)
    zone-1: area:monk-midnight-stairs @landmark:landing-600-tea-stall+landmark:great-bell
    zone-1: obj:monk-tear-trail-1..2 # up the Stairs: the rain-groove, Tamsk's dropped staff on a landing
    zone-1: obj:monk-tear-trail-3 @landmark:guardian-hall-gate # under the Guardian Hall door
    way-2: landmark:monk-foundling-stair # a broad step on the old pilgrim path below the cloister
    way-2: area:monk-foundling-path @landmark:terrace-goat-pens+landmark:monk-foundling-stair
    zone-3: obj:monk-cells-dusk @landmark:great-bell # dusk scene
    zone-4: landmark:monk-climber-camp @landmark:cloud-kitchen-hearth # the Climbers' camp on the cloud-side
    zone-4: obj:monk-climber-camp-1..3 @landmark:monk-climber-camp # bedrolls, an empty cook-pot, Kestrel's bedroll
    zone-4: obj:monk-climbers-pot @landmark:monk-climber-camp
    road: landmark:monk-kell-stone # a grey boulder at a bend below the Stair Gate
    road: obj:monk-kell-stone @landmark:monk-kell-stone
    road: area:monk-gate-road @landmark:monk-kell-stone+obj:fist-gate-seal
    zone-1: obj:monk-yuen-tea-bush @landmark:thousand-stairs-foot # an old tea bush by the first step
    zone-2: landmark:monk-prayer-pole @landmark:prayer-flag-lines # on the Prayer Terraces
    zone-2: obj:monk-flag-reading @landmark:monk-prayer-pole
    zone-1: landmark:monk-step-611 @landmark:landing-600-tea-stall # step 611, just above the tea stall
    zone-1: obj:monk-sop-step @landmark:monk-step-611 # night scene
    zone-3: landmark:monk-ringers-loft @landmark:great-bell # the ringers' loft
    zone-3: obj:monk-bell-rope @landmark:monk-ringers-loft
    zone-3: landmark:monk-kestrel-cell @landmark:empty-cells-cloister # the end of the north cloister
    zone-3: obj:monk-kestrel-cell @landmark:monk-kestrel-cell
  `),
  ...realmList('area:fist-frontier', `
    zone-1: obj:village-ring-corner @landmark:knuckletown-village-ring
    zone-1: obj:noodle-door-1..3 @landmark:pops-noodle-cart
    zone-1: obj:abigail-bout-1..3 @landmark:knuckletown-village-ring
    zone-1: landmark:knuckletown-bunting-row
    zone-1: obj:bunting-1..4 @landmark:knuckletown-bunting-row
    zone-1: landmark:league-bounty-board
    zone-2: landmark:lowfold-practice-ring
    zone-2: obj:tilly-corner-1..3 @landmark:lowfold-practice-ring
    zone-2: obj:silk-goat @landmark:doc-lint-tent
    zone-3: obj:nob-goat-1..3 @landmark:nob-goat-shed
    zone-3: landmark:goat-path-shelter # a stone hut on the high path
    zone-3: obj:goat-path-shelter @landmark:goat-path-shelter
    zone-3: obj:marta-herb-ledge # above the third bend
    zone-4: landmark:quarry-tunnel # under the Stair Gate
    zone-4: obj:quarry-tunnel-mouth @landmark:quarry-tunnel
    zone-4: landmark:quarry-undercard-ring
    zone-4: obj:undercard-purse @landmark:quarry-undercard-ring
    zone-4: obj:quarry-names-wall @landmark:quarry-names-wall
    lair-1: obj:dojo-students
    lair-2: obj:ox-corner-stool
    // Brawler Act I depth (Claude 4's helpers)
    zone-1: area:brawler-cart-home @landmark:knuckletown-village-ring+landmark:pops-noodle-cart
    zone-1: obj:brawler-door-clue-1 @obj:noodle-door-1 # the locked doors on Pops's round
    zone-1: obj:brawler-door-clue-2 @obj:noodle-door-2
    zone-1: obj:brawler-door-clue-3 @obj:noodle-door-3
    zone-2: obj:brawler-pit-talk-1..3 @landmark:grand-pit-gate # fighters with tickets, a chestnut-seller, a poster
    zone-2: obj:brawler-purse-dawn @landmark:grand-pit-gate # dawn scene
    zone-4: obj:brawler-fighter-trail-1..2 # down the quarry steps: a hand-wrap, a glove
    zone-4: obj:brawler-fighter-trail-3 @landmark:quarry-tunnel # a torn ticket by the tunnel
    road: landmark:brawler-last-corner # a stone bench halfway up the Stair Gate road
    road: obj:brawler-last-corner @landmark:brawler-last-corner
    road: area:brawler-gate-road @landmark:brawler-last-corner+obj:fist-gate-seal
    zone-1: landmark:brawler-runner-booth @landmark:abigail-book-stall # across the square
    zone-1: obj:brawler-runner-booth @landmark:brawler-runner-booth
    zone-1: landmark:brawler-crouch-attic @landmark:knuckletown-bunting-row # the Crouch house attic
    zone-1: obj:brawler-old-bunting @landmark:brawler-crouch-attic
    zone-2: obj:brawler-doc-patient @landmark:lowfold-practice-ring
    zone-1: obj:brawler-tilly-bout @landmark:knuckletown-village-ring # Tilly's corner post
    zone-3: landmark:brawler-climbers-tent # the recruiting tent at the foot of the Goat Paths
    zone-3: obj:brawler-climbers-tent @landmark:brawler-climbers-tent
    way-3: landmark:brawler-harvest-ring # a rope square in a stubble field down the Goat Paths
    way-3: obj:brawler-coat-bout @landmark:brawler-harvest-ring
    zone-1: landmark:brawler-fight-board @landmark:knuckletown-village-ring # beside the village ring
    zone-1: obj:brawler-fight-board @landmark:brawler-fight-board
  `),
];

// ───────────── Rime (Rimecaller, Warden) ─────────────
const RIME = [
  ...realmList('area:rime-capital', `
    zone-1: landmark:spire-stair-board # bounty board
    zone-2: obj:rime-treaty-copy # under glass, deep stack
    zone-2: obj:market-price-ledger
    zone-2: obj:first-keeping @landmark:archive-oldest-vault
    zone-4: obj:dry-firewood-1..3 # a warm corner
    zone-4: obj:undercrypt-thermometer # north wall
    zone-4: obj:frozen-hat # in the tunnel ice
    zone-4: obj:thaw-snowflake # a dripping ceiling
    lair-1: obj:cistern-keepers # keepers frozen in the ice
    lair-2: obj:reflection-shard # the gallery floor
    // Rimecaller Act I depth (Claude 4's helpers)
    way-2: landmark:rimecaller-mile-clock # the Thaw Road, at the city's edge
    way-2: obj:rimecaller-mile-clock @landmark:rimecaller-mile-clock
    zone-1: obj:rimecaller-melt-run-1..3 # the hold gauges' melt runs
    zone-2: obj:rimecaller-enquiries-book @landmark:hall-of-held-hours
    zone-2: landmark:rimecaller-reading-room
    zone-2: obj:rimecaller-founders-minute @landmark:rimecaller-reading-room
    zone-3: landmark:rimecaller-physician-surgery
    zone-3: obj:rimecaller-physician-daybook @landmark:rimecaller-physician-surgery
    zone-3: obj:rimecaller-sugar-lid @landmark:frozen-market-stalls # the Thirty-Year Haggle
    zone-3: obj:rimecaller-ticked-clock-1..3 # the Regent's Key
    zone-4: landmark:rimecaller-keepers-hut
    zone-4: obj:rimecaller-keepers-log @landmark:rimecaller-keepers-hut
    zone-4: obj:rimecaller-nim-tin @landmark:rimecaller-keepers-hut
    zone-4: landmark:rimecaller-drip-pipe
    zone-4: obj:rimecaller-drip-pipe @landmark:rimecaller-drip-pipe
    zone-1: area:rimecaller-market-walk @landmark:halla-vint-study+landmark:frozen-market-stalls
    zone-2: area:rimecaller-spire-stair @landmark:spire-stair-board+landmark:archive-oldest-vault
    zone-4: area:rimecaller-thaw-road @landmark:rimecaller-mile-clock+landmark:rime-conduits
  `),
  ...realmList('area:rime-frontier', `
    zone-1: landmark:wardwall-stores
    zone-1: obj:ration-ledger @landmark:wardwall-stores
    zone-1: obj:misheard-moat # behind the stables
    zone-1: obj:misheard-cake # mess kitchen
    zone-1: obj:misheard-hedge # the bramble hedge by the Gatehouse
    zone-2: landmark:rampart-bowyers-post
    zone-2: obj:frozen-reply-1..4 # drifts below the Rampart
    zone-2: obj:ingrith-fire @landmark:last-watch-fire
    zone-3: landmark:wolfrun-parley-cairn
    zone-3: landmark:wolfrun-snowed-hut
    zone-4: obj:oven-firestone-1..4 # old clan cairns on the fell
    lair-1: obj:jarl-mead-cauldron # the centre of the hall
    lair-2: obj:hundredth-warden-rest # the founder's barrow
    // Warden Act I depth (Claude 4's helpers)
    zone-1: obj:warden-missing-warden-1..3 @landmark:rime-frontier-gatehouse
    zone-1: landmark:warden-bread-drop # the wall's foot
    zone-1: obj:warden-bread-drop @landmark:warden-bread-drop
    zone-1: obj:warden-stray-pup # the White Pack
    zone-2: obj:warden-seep-crack-1..3 @landmark:rampart-bowyers-post # along the Long Rampart
    zone-2: landmark:warden-breach-ice
    zone-2: obj:warden-fallen-hollowed-1..3 @landmark:warden-breach-ice
    way-2: landmark:warden-far-lamp
    way-2: obj:warden-far-lamp @landmark:warden-far-lamp
    zone-3: landmark:warden-clan-camp
    zone-3: obj:warden-clan-fire-1..3 @landmark:warden-clan-camp
    zone-3: landmark:warden-cairn-field
    zone-3: obj:warden-leif-cairn @landmark:warden-cairn-field
    zone-4: landmark:warden-stair-foot
    zone-4: obj:warden-smugglers-niche @landmark:warden-stair-foot
    way-3: landmark:warden-boundary-stone # out on the open snow
    zone-1: area:warden-rampart-walk @landmark:rime-frontier-gatehouse+landmark:rampart-bowyers-post
    zone-4: area:warden-jarlsfell-road @landmark:rime-frontier-gatehouse+landmark:jarlsfell-steading-oven
    zone-4: area:warden-barrow-road @landmark:jarlsfell-steading-oven+obj:rime-frontier-lair-2-door
  `),
];

// ───────────── Storm (Sparkwright, Stormlancer) ─────────────
const STORM = [
  ...realmList('area:storm-capital', `
    zone-1: landmark:pim-joule-workshop
    zone-1: obj:pim-toaster @landmark:pim-joule-workshop
    zone-1: landmark:fire-marshals-post # bounties
    zone-2: obj:tower-scrap-1..3 # fallen tower crowns
    zone-2: obj:tower-seven-counterweight @landmark:tower-seven
    zone-2: obj:jump-ring-1..4 # hoops between the leaning towers
    zone-3: obj:dynamo-lunch-tin @landmark:dynamo-wheel-three
    zone-3: obj:first-kettle-patent # a Vault annexe drawer near the lair 2 entrance
    zone-4: obj:copper-root-1..6 @landmark:root-tuning-chamber
    zone-4: obj:tess-notebook @obj:storm-stone-scorch
    zone-4: obj:wisp-nursery-nest # deep in the Foundations
    lair-1: obj:belfry-bell
    lair-2: obj:jammed-patent-sheet # in the Engine's last gear
    // Sparkwright Act I depth (Claude 4's helpers)
    zone-1: obj:sparkwright-blast-site-1..3 @landmark:tess-ampery-workshop # the Ohms' workshop, the varnish shop, the bellows-mender's
    way-2: landmark:sparkwright-rod-lookout # past the end of Coil Street, the storm over the Copper Gate
    way-2: obj:sparkwright-storm-glass @landmark:sparkwright-rod-lookout # a Guild storm-glass on a stand
    way-3: landmark:sparkwright-apprentice-tree # a lone copper-beech past the Copper Spires
    way-3: obj:sparkwright-apprentice-tree @landmark:sparkwright-apprentice-tree # three apprentices stuck in it
    way-3: landmark:sparkwright-orphanage # the yellow orphanage on Sump Lane
    way-3: obj:sparkwright-orphanage-door @landmark:sparkwright-orphanage # the door and its drawings
    way-4: landmark:sparkwright-founding-stone # under the Lightning Tower's first copper root
    way-4: obj:sparkwright-founding-stone @landmark:sparkwright-founding-stone # a carved humming tower
    road: landmark:sparkwright-line-pylon # a lightning-line pylon halfway up the Copper Road
    road: obj:sparkwright-line-pylon @landmark:sparkwright-line-pylon # a snapped harness clip and a glove
    zone-1: area:sparkwright-coil-street @landmark:tess-ampery-workshop+landmark:pim-joule-workshop
    zone-2: area:sparkwright-spires-walk @landmark:tower-seven+landmark:witchs-belfry-door
    zone-3: area:sparkwright-vault-steps @landmark:chancellery+landmark:dynamo-wheel-three
    road: area:sparkwright-copper-road @landmark:sparkwright-line-pylon+obj:storm-gate-seal
  `),
  ...realmList('area:storm-frontier', `
    zone-1: obj:cass-saddle-blanket @landmark:thistles-stall
    zone-1: obj:wind-chime-1..4 @landmark:chime-yard
    zone-1: obj:odran-practice-post @landmark:odran-gale-steading
    zone-2: obj:thunderclap-run-post-1..3 # the Run course
    zone-2: obj:strike-step-1..4 # the open Heights
    zone-2: obj:cowards-cairn-names @landmark:cowards-cairn
    zone-3: obj:stormlancer-fledgling-nest @landmark:gorge-rockfall
    zone-3: obj:rockfall-start @landmark:gorge-rockfall
    zone-4: obj:warm-step @landmark:eyrie-stair
    zone-4: obj:thunderbird-nest-1..3 @landmark:eyrie-stair # ledges on the Steps
    lair-1: obj:crag-herd-edge
    lair-2: obj:aerie-fledglings
    // Stormlancer Act I depth (Claude 4's helpers)
    zone-1: obj:stormlancer-stray-ram-1..2 @landmark:chime-yard # a ram in a hedge; an ewe in Gwenna's washing
    way-2: obj:stormlancer-stray-ram-3 # at the edge of the Heights, Cass's pennant in its wool
    zone-2: obj:stormlancer-black-strike-1..3 @obj:lightning-pattern-stones # scorched rings round the grazing hollow
    zone-2: landmark:stormlancer-brave-stone # in sight of the Coward's Cairn across the plain
    zone-2: obj:stormlancer-brave-stone @landmark:stormlancer-brave-stone
    zone-2: landmark:stormlancer-wake-stone # a lone mossy pattern-stone, far side of the Heights
    zone-2: obj:stormlancer-wake-stone @landmark:stormlancer-wake-stone
    way-2: landmark:stormlancer-storm-edge # the edge of the Heights, the storm in view
    way-2: obj:stormlancer-thistle-lookout @landmark:stormlancer-storm-edge # where Thistle stands and calls
    way-3: landmark:stormlancer-updraft-ledge # halfway up the gorge path
    way-3: obj:stormlancer-updraft-ledge @landmark:stormlancer-updraft-ledge
    way-3: landmark:stormlancer-wager-post # the top of the gorge path
    way-3: obj:stormlancer-wager-post @landmark:stormlancer-wager-post
    way-4: landmark:stormlancer-steps-foot # bracken at the foot of the Eyrie Steps
    way-4: obj:stormlancer-tally-book @landmark:stormlancer-steps-foot # Tally's lost counting-book
    zone-3: obj:stormlancer-matriarch-feather @obj:storm-frontier-lair-2-door # where Old Clatterwing roosts
    road: landmark:stormlancer-riders-cairn # a riders' cairn wound with thread, halfway down the cliff road
    road: obj:stormlancer-riders-cairn @landmark:stormlancer-riders-cairn
    zone-1: area:stormlancer-pasture-night @landmark:chime-yard+landmark:odran-gale-steading
    zone-1: area:stormlancer-crag-path @landmark:odran-gale-steading+obj:storm-frontier-lair-1-door
    zone-3: area:stormlancer-gorge-descent @landmark:gorge-rockfall+obj:storm-frontier-lair-2-door
    road: area:stormlancer-cliff-road @landmark:stormlancer-riders-cairn+obj:storm-gate-seal
  `),
];

// ───────────── Hunt (Huntsman, Falconer) ─────────────
const HUNT = [
  ...realmList('area:hunt-capital', `
    zone-1: landmark:antlerford-kennels
    zone-1: landmark:lodge-east-milestone
    zone-1: obj:lodge-east-milestone @landmark:lodge-east-milestone # night
    zone-1: landmark:lodge-tally-board # bounty board
    zone-1: obj:lumm-hat @landmark:great-lodge-hall # the loft
    zone-1: obj:biscuit-hare-run @landmark:great-lodge-hall # the paddock behind
    zone-2: landmark:pockle-glovers
    zone-2: obj:lusk-back-room @landmark:lusk-tannery
    zone-3: landmark:elkway-tally-stone
    zone-3: landmark:gamekeepers-lodge
    zone-3: obj:elkway-snare-1..3 # across the Elkway
    zone-3: obj:elkway-calf
    zone-3: obj:calf-cover-1..3 @obj:elkway-calf
    zone-4: landmark:charcoal-burners-hut
    zone-4: obj:pelt-cart-tracks @landmark:poachers-camp-stockade
    zone-4: obj:old-snare-1..3
    zone-4: obj:snare-tree-letter @landmark:snare-tree
    lair-1: obj:poacher-pelt-store
    lair-2: obj:hunting-party-tags
    // Huntsman Act I depth (Claude 4's helpers)
    zone-3: obj:huntsman-elk-track-1..3 @landmark:elkway-tally-stone # the elk's ring round a pulled cairn, off the road
    way-3: landmark:huntsman-baron-hide # Corva's hide: a platform in an oak over a clearing on the Elkway
    way-3: obj:huntsman-snipe-basket @landmark:huntsman-baron-hide # at the foot of the oak
    way-4: obj:huntsman-flight-sign-1..2 # the herd's flight south towards the Tick Hollows
    way-4: obj:huntsman-flight-sign-3 @landmark:tick-hollows-mouth # the last, by the Hollows
    zone-3: obj:huntsman-game-book @landmark:gamekeepers-lodge # on the lodge table
    road: landmark:huntsman-counting-post # an oak post halfway up the gate road
    road: obj:huntsman-counting-post @landmark:huntsman-counting-post
    zone-1: landmark:huntsman-old-kennels # burned-out kennels past the east milestone
    zone-1: obj:huntsman-old-kennel-lintel @landmark:huntsman-old-kennels # the carved lintel
    zone-2: landmark:huntsman-harle-cottage # a doorstep in the Tannery Lanes
    zone-2: obj:huntsman-harle-door @landmark:huntsman-harle-cottage # old Mister Harle on his step
    zone-3: obj:huntsman-calf-thicket @obj:calf-cover-3 # the deepest thicket
    zone-4: obj:huntsman-silk-snare @obj:pelt-cart-tracks # across a deer-path by the old cart track
    zone-4: obj:huntsman-osric-hide @obj:pelt-cart-tracks # a turf-roofed hide above the track
    zone-1: area:huntsman-yard-walk @landmark:trophy-hall-gates+landmark:bannock-hearth
    zone-2: area:huntsman-hide-ride @landmark:lusk-tannery+landmark:huntsman-baron-hide
    zone-3: area:huntsman-elkway-flight @landmark:elkway-tally-stone+landmark:tick-hollows-mouth
    zone-3: area:huntsman-gate-road @landmark:elkway-tally-stone+landmark:huntsman-counting-post
  `),
  ...realmList('area:hunt-frontier', `
    zone-1: landmark:mews-post-loft
    zone-1: obj:mews-dead-letter @landmark:mews-post-loft
    zone-1: landmark:hawkmoor-gate-road # where the gate road starts
    zone-1: obj:mews-lure-post @landmark:mews-cliff-perches
    zone-1: obj:mews-hen-run
    zone-1: obj:mews-free-perch-1..3 @landmark:mews-cliff-perches
    zone-1: obj:jess-knot-1..3 @landmark:jess-maker-hut
    zone-1: obj:pibb-flight-1..3 @landmark:wren-ledge
    zone-2: obj:hawkmoor-tor-1..3 # one on each of three tors
    zone-2: obj:coyle-fold @landmark:coyle-steading
    zone-2: obj:moor-post-box-1..3 # three steadings
    zone-3: landmark:ketterick-camp
    zone-3: obj:hooded-steading-1..3
    zone-3: obj:herd-bones-1..3
    zone-3: obj:pollard-doorstep @landmark:quiet-steading
    zone-4: obj:featherfall-bird-1..3
    zone-4: obj:fledgling-perch-1..3
    zone-4: obj:falconer-fledgling-nest @obj:fledgling-perch-2
    lair-2: obj:hollow-eyrie-nest
    // Falconer Act I depth (Claude 4's helpers)
    zone-1: landmark:falconer-cliff-top # top of the cliff stair, looking out to the Moor's Crown
    way-4: obj:falconer-fall-feather-1..2 # fallen birds from the tors towards the Featherfall
    way-4: obj:falconer-fall-feather-3 @landmark:feather-counter-cairn # on the Featherfall rim
    zone-1: obj:falconer-hooded-bird-1..3 @landmark:mews-cliff-perches # along the perches
    zone-1: obj:falconer-teodor-bunk @obj:wren-first-hood # a bunk in the old mews at the cliff foot
    road: landmark:falconer-leaving-post # a larch pole thick with cut jesses, halfway down the gate road
    road: obj:falconer-leaving-post @landmark:falconer-leaving-post
    zone-1: obj:falconer-new-perch @landmark:wren-ledge
    zone-1: obj:falconer-post-hawk @landmark:mews-post-loft # a hooded post-hawk in the loft
    zone-2: obj:falconer-wimble-tor @landmark:coyle-steading # the tor behind the steading
    zone-3: obj:falconer-turned-bones @obj:herd-bones-3 # apart, at the far edge of the last drift
    zone-1: area:falconer-cliff-stair @landmark:wren-ledge+landmark:falconer-cliff-top
    zone-2: area:falconer-featherfall-rim @landmark:coyle-steading+landmark:feather-counter-cairn
    zone-1: area:falconer-gate-road @landmark:hawkmoor-gate-road+landmark:falconer-leaving-post
  `),
];

// ───────────── Guile (Jester, Corsair) ─────────────
const GUILE = [
  ...realmList('area:guile-capital', `
    zone-1: landmark:masque-gangplank # docks
    zone-1: landmark:harbour-watch-house # bounty board
    zone-1: landmark:gudgeon-fish-stall
    zone-1: obj:chip-stall-1..3 @landmark:gudgeon-fish-stall
    zone-2: landmark:worst-joke-stage
    zone-2: obj:worst-joke-charter @landmark:worst-joke-stage
    zone-2: obj:pantaloon-stage @landmark:worst-joke-stage
    zone-2: obj:mask-ribbon-1..3 @landmark:phantom-theatre
    zone-2: obj:squibb-portrait-canvas @landmark:squibb-portrait
    zone-3: obj:promise-stall @landmark:thieves-exchange
    zone-3: obj:weather-desk-1..3 @landmark:thieves-exchange
    zone-3: obj:palace-fools-drawer @landmark:counting-house
    zone-4: obj:pellam-lamp @landmark:pellam-lamp # night
    zone-4: obj:pellam-receipt @landmark:pellam-lamp # a tin in its base
    lair-1: obj:phantom-mask-rack
    // Jester Act I depth (Claude 4's helpers)
    zone-3: landmark:jester-palace-steps # the palace steps above the Exchange
    zone-3: obj:jester-walking-coin-1..2 @landmark:thieves-exchange # gutters across the Exchange Floor
    zone-3: obj:jester-walking-coin-3 @landmark:counting-house # on the Counting House steps
    zone-4: obj:jester-shop-queue-1..3 @landmark:sorrows-laughing-shop # the queue down the Crooked Stairs
    road: landmark:jester-jest-house # an old toll booth halfway up the toll road
    road: obj:jester-toll-slate @landmark:jester-jest-house # the slate on the booth wall
    zone-4: obj:jester-tab-book @landmark:sorrows-laughing-shop # the clerk's tab-book by the red door
    zone-1: landmark:jester-harbour-chapel # a little harbour chapel on the Docks
    zone-1: obj:jester-wedding-altar @landmark:jester-harbour-chapel
    zone-1: obj:jester-solarian-berth # the far end of the Docks: a sea-chest under a parasol
    zone-4: obj:jester-refund-door-1..3 # doors on the 3rd, 5th and 7th landings of the Crooked Stairs
    zone-1: area:jester-dock-walk @landmark:masque-gangplank+landmark:fennick-attic
    zone-3: area:jester-palace-walk @landmark:thieves-exchange+landmark:jester-palace-steps
    zone-3: area:jester-coin-gutters @landmark:thieves-exchange+landmark:counting-house
    road: area:jester-toll-road @landmark:pellam-lamp+landmark:jester-jest-house
  `),
  ...realmList('area:guile-frontier', `
    zone-1: landmark:brine-market-board # bounty board
    zone-1: landmark:sals-last-plank
    zone-1: landmark:quill-net-loft
    zone-1: obj:creditor-barrel-1..3
    zone-1: obj:market-edge-divers # the outer planks
    zone-1: obj:thousand-knot-strand-1..3 @landmark:thousand-knot
    zone-1: obj:overdraft-helm @landmark:the-overdraft
    zone-2: landmark:white-flagship-berth
    zone-2: obj:tusk-hat @landmark:hat-gibbets
    zone-2: obj:whispering-pearl @landmark:hat-gibbets
    zone-2: obj:first-article-page @landmark:hat-gibbets
    zone-3: landmark:nell-gant-cottage
    zone-3: obj:false-lantern-1..3 # on the cove rocks
    zone-3: obj:nell-lantern # a high rock at the cove mouth
    zone-3: obj:colley-hire-ledger @landmark:colley-lantern-stall # night
    zone-3: obj:colley-stall-counter @landmark:colley-lantern-stall
    zone-4: landmark:pennywhistle-camp
    zone-4: obj:pennywhistle-x @landmark:pennywhistle-camp
    zone-4: obj:pennywhistle-chest @landmark:pennywhistle-camp
    zone-4: obj:crow-pearl-hoard # on a sea-stack
    zone-4: obj:crow-nest-crown
    lair-1: obj:overdraft-tow-line
    // Corsair Act I depth (Claude 4's helpers)
    zone-1: obj:corsair-mooring-line-1..3 @landmark:the-overdraft # bow line, stern bollard, a notice-post on the planks
    zone-1: obj:corsair-hold-pearls @landmark:the-overdraft # the sea-chest in the hold
    zone-1: obj:corsair-paid-creditor-1..3 @landmark:brine-market-board # three stalls round the Brine Market
    zone-4: obj:corsair-ration-hut-1..3 @landmark:grief-ration-huts # the three huts
    road: landmark:corsair-last-bell # a bell-buoy at the channel mouth
    road: obj:corsair-last-bell @landmark:corsair-last-bell # the buoy itself
    zone-1: obj:corsair-overdraft-patch @landmark:the-overdraft # the gap in the starboard rail
    zone-1: area:corsair-market-planks @landmark:the-overdraft+landmark:brine-market-board
    road: area:corsair-channel-mouth @landmark:the-overdraft+landmark:corsair-last-bell
  `),
];

// ───────────── Radiance (Cantor, Oathbound) ─────────────
const RADIANCE = [
  ...realmList('area:radiance-capital', `
    zone-1: obj:close-lamp-1..3 @landmark:close-steps # guttered lamps on the Close steps
    zone-1: landmark:close-postern
    zone-1: obj:close-postern @landmark:close-postern # the watched back gate
    zone-1: landmark:cathedral-great-doors # the lair 3 entrance
    zone-2: landmark:choir-dormitory
    zone-2: obj:choir-spare-robe @landmark:choir-dormitory # vestry rack
    zone-2: obj:lauds-lectern # brass lectern
    zone-2: obj:moonflower-cutting @landmark:moonflower-bed
    zone-2: landmark:reliquary-door # the lair 2 entrance, under the Cloisters
    zone-3: landmark:sunward-market-cross
    zone-3: obj:market-charter @landmark:sunward-market-cross
    zone-3: landmark:mote-stall
    zone-3: obj:albin-stall-shutters @landmark:mote-stall
    zone-3: obj:lull-cart-trail-1..3 @landmark:lull-cart # blue bottles in the ruts
    zone-3: obj:lull-draught-crate @landmark:lull-cart
    zone-3: landmark:undercroft-stair # behind the Market, down to zone 4
    zone-3: obj:undercroft-door @landmark:undercroft-stair
    zone-4: landmark:orla-alcove
    zone-4: obj:jar-rain-1009 @landmark:undercroft-jar-shelves
    zone-4: obj:undercroft-dark-bed # a crack with earth in it
    lair-1: obj:great-bell-muffle # the great bell's clapper
    lair-2: obj:reliquary-evidence-box # in the Saint's ribcage
    // Cantor Act I depth (Claude 4's helpers)
    zone-1: obj:cantor-sleepers-book @landmark:brightwatch-house # the Book of Sleepers, chained in the porch
    zone-1: landmark:cantor-fine-book-desk @landmark:brightwatch-house # the porch desk
    zone-1: obj:cantor-fine-book @landmark:cantor-fine-book-desk # Sergeant Bellamy's own fine-book
    zone-3: obj:cantor-draught-stall-1..3 @landmark:sunward-market-cross # raided draught-stalls on the back row
    zone-2: landmark:cantor-alto-stall # the empty alto stall in the Cloister quire
    zone-2: obj:cantor-alto-stall @landmark:cantor-alto-stall
    zone-2: obj:cantor-loft-window @landmark:bell-loft-stair # the highest window, top of the Bell Loft stair
    zone-2: landmark:cantor-hierarch-portrait # a dim Cloister corner behind a pillar
    zone-2: obj:cantor-hierarch-portrait @landmark:cantor-hierarch-portrait # the young Hierarch, with his shadow
    road: landmark:cantor-road-sundial # the pilgrims' sundial halfway down the Dawn Road
    road: obj:cantor-road-sundial @landmark:cantor-road-sundial
    zone-1: area:cantor-close-round @landmark:close-steps+landmark:brightwatch-house
    zone-2: area:cantor-loft-stair @landmark:celestine-cell+landmark:bell-loft-stair
    road: area:cantor-dawn-road @landmark:cantor-road-sundial+obj:radiance-gate-seal
  `),
  ...realmList('area:radiance-frontier', `
    zone-1: landmark:hall-of-broken-swords
    zone-1: obj:broken-sword-rack-1..3 @landmark:hall-of-broken-swords
    zone-1: obj:rattling-sword @landmark:hall-of-broken-swords
    zone-1: obj:hall-sword-roll @landmark:hall-of-broken-swords
    zone-1: landmark:oathkeep-yard
    zone-1: obj:hamish-porridge-bowl @landmark:oathkeep-yard
    zone-1: obj:hamish-drill-dummy @landmark:oathkeep-yard
    zone-1: obj:hamish-chapel-bell # the fortress chapel bell-rope
    zone-1: obj:beatrix-draft-1..3 # Beatrix's quarters
    zone-2: landmark:haybright
    zone-2: obj:haybright-villager-1..3 @landmark:haybright
    zone-2: obj:dobbin-lantern @landmark:haybright
    zone-2: obj:haybright-windmill-top @landmark:haybright
    zone-2: landmark:forsworn-chapel-door # the lair 2 entrance
    zone-3: landmark:lions-gate-arch # the lair 1 entrance
    zone-3: landmark:gilders-hut
    zone-3: obj:tench-bridge-carving # under Tench Bridge
    zone-4: landmark:dimming-edge
    zone-4: landmark:lampwick-green
    zone-4: obj:lampwick-campfire-1..3 @landmark:lampwick-green
    zone-4: obj:lampwick-hearth @landmark:lampwick-green
    zone-4: landmark:lisle-fold
    zone-4: obj:lisle-ewe-1..3 @landmark:lisle-fold # the fold and hillside
    lair-1: obj:lion-waymark-hoard # behind the Lion's bed
    // Oathbound Act I depth (Claude 4's helpers)
    zone-1: obj:oathbound-empty-bracket @landmark:hall-of-broken-swords # Ilsabet's empty sword-bracket by the Hall door
    way-4: landmark:oathbound-milestone # an old milestone between the Dimming's edge and Haybright
    way-4: landmark:oathbound-march-line @landmark:dimming-edge # where the Order plants its lances
    way-4: obj:oathbound-march-line @landmark:oathbound-march-line
    zone-2: obj:oathbound-escort-carts @landmark:haybright # the night-touched carts in the square
    zone-2: landmark:oathbound-watch-post @landmark:haybright # the north-field watch-post, facing the Dimming
    zone-2: obj:oathbound-dobbin-watchpost @landmark:oathbound-watch-post # Dobbin's first night-watch
    zone-4: landmark:oathbound-ilsabet-camp # a little in from the Dimming's edge
    zone-4: obj:oathbound-ilsabet-camp-1..3 @landmark:oathbound-ilsabet-camp # a saddle-roll, a whetstone, an unsent letter
    way-3: landmark:oathbound-new-waymark # out towards the Lion's Gate
    way-3: obj:oathbound-new-waymark @landmark:oathbound-new-waymark
    zone-3: landmark:oathbound-far-bank # the far bank of Tench Bridge
    zone-3: obj:oathbound-far-bank-door @landmark:oathbound-far-bank # a mossy cottage door with a note
    road: landmark:oathbound-march-end-stone # the last waymark of the March, halfway to the gate
    road: obj:oathbound-march-end-stone @landmark:oathbound-march-end-stone
    zone-2: area:oathbound-haybright-road @landmark:beatrix-holm-quarters+landmark:haybright
    way-3: area:oathbound-lion-road @landmark:gilders-hut+landmark:lions-gate-arch
    way-4: area:oathbound-milestone-walk @landmark:dimming-edge+landmark:oathbound-milestone
    zone-2: area:oathbound-chapel-path @landmark:haybright+landmark:forsworn-chapel-door
  `),
];

// ───────────── Umbral (Duskweaver, Shade) ─────────────
const UMBRAL = [
  ...realmList('area:umbral-capital', `
    zone-1: obj:dusk-shadow-jar-1..3 # windowsills near the Keepers' Lodge
    zone-1: obj:lamp-shadows-post @landmark:lamp-shadows
    zone-1: landmark:fairweather-house
    zone-1: obj:fairweather-writing-desk @landmark:fairweather-house
    zone-1: landmark:constable-box
    zone-1: landmark:old-bell-tower
    zone-2: landmark:memory-gardens-gate
    zone-2: obj:cut-memory-bed-1..3 @landmark:memory-gardens-gate
    zone-2: landmark:forgotten-temple # the lair 1 entrance
    zone-2: landmark:cobble-shop
    zone-2: obj:prince-weed @landmark:cobble-shop
    zone-2: landmark:posy-bed
    zone-2: obj:posy-moonshade-bed @landmark:posy-bed # under the yew
    zone-2: obj:rest-bed-planting @landmark:memory-gardens-rest
    zone-2: obj:nyx-quarrel-flower # the far end of the Gardens
    zone-3: landmark:obelisk-queue
    zone-3: obj:obelisk-queue-1..3 @landmark:obelisk-queue
    zone-3: obj:jasper-queue-ticket @landmark:obelisk-queue
    zone-3: landmark:hall-of-lost-names-door # the lair 2 entrance
    zone-3: obj:register-linnet-entry @landmark:obelisk-register
    zone-3: obj:register-hero-entry @landmark:obelisk-register
    zone-3: obj:vane-filing-drawer @landmark:mnemosarch-desk
    zone-4: landmark:archive-stacks
    zone-4: obj:runaway-shadow-1..4 @landmark:archive-stacks
    zone-4: obj:champions-bottle @landmark:archive-stacks
    zone-4: obj:archive-spilling-shelf @landmark:mnemosarch-model # the hidden 14th shelf
    lair-1: obj:cult-stolen-pasts
    lair-2: obj:last-name-paper
    // Duskweaver Act I depth (Claude 4's helpers)
    zone-3: obj:duskweaver-queue-ledger @landmark:mnemosarch-desk # the queue ledger
    zone-4: obj:duskweaver-spill-1..3 @landmark:archive-stacks # spilled bottled shadows into the east stacks; 3 at the thirteenth shelf
    road: landmark:duskweaver-road-lamp # the last lamp-post's shadow on the dusk road (Nyx's escort destination)
    road: obj:duskweaver-road-lamp @landmark:duskweaver-road-lamp # a paper lantern on the lamp-shadow
    way-2: landmark:duskweaver-lamp-store # the old lamp-store at the end of Ambrose's street
    way-2: obj:duskweaver-last-lamp @landmark:duskweaver-lamp-store # a lamp under a sheet
    way-4: landmark:duskweaver-archive-step # the Archive's outer step
    way-4: obj:duskweaver-cat-saucer @landmark:duskweaver-archive-step # a chipped blue saucer
    zone-1: area:duskweaver-lanternless @landmark:keepers-lodge+landmark:umbral-capital-townhouse # the chalk-doors street
    road: area:duskweaver-dusk-road @landmark:duskweaver-road-lamp+obj:umbral-gate-seal
  `),
  ...realmList('area:umbral-frontier', `
    zone-1: landmark:rope-bridges
    zone-1: obj:bridge-mark-purse @landmark:rope-bridges
    zone-1: obj:bridge-post-shadow @landmark:rope-bridges # the third bridge
    zone-1: landmark:nettle-bridge
    zone-1: obj:nettle-toll-ledger @landmark:nettle-bridge
    zone-1: obj:ludo-puppet-stage # the puppet booth
    zone-1: obj:veil-ledger @landmark:veil-ledger-hall
    zone-1: obj:mab-black-book @landmark:mab-nest
    zone-1: obj:mab-hidden-letter @landmark:mab-nest
    zone-1: landmark:tibbet-post # bounty post
    zone-2: obj:agnes-cocoon # in the low silk
    zone-2: landmark:echo-traders-stall
    zone-2: obj:echo-jar-1..3 @landmark:echo-traders-stall
    zone-3: obj:duskblade-stall # the Moonwell market
    zone-3: landmark:quince-stall
    zone-4: landmark:tallow-fold
    zone-4: obj:tallow-fold-gate @landmark:tallow-fold
    zone-4: landmark:moonrise-rock
    zone-4: obj:moonrise-rock @landmark:moonrise-rock
    zone-4: obj:unshadowed-founder-stone # at the cairn
    lair-2: obj:hushweb-eaten-whistles # the sac at the top of the Brood Spire
    lair-3: obj:veil-heart-lantern-1..3
    // Shade Act I depth (Claude 4's helpers)
    zone-1: landmark:shade-bunk @landmark:mab-nest # the hero's bunk in the Veil hall
    zone-1: obj:shade-bunk-note @landmark:shade-bunk # a note on the pillow
    zone-2: obj:shade-tear-pool-1..3 @landmark:silk-cutters-camp # black pools outside the cutters' tents
    road: landmark:shade-dusk-drop # a hollow oak halfway along the Dusk road
    road: obj:shade-shadow-parcel @landmark:shade-dusk-drop # a silk parcel inside the oak
    zone-4: landmark:shade-moor-edge # where the heather stops and the gate road starts (Mab's escort destination)
    way-2: landmark:shade-fen-bridge @landmark:nettle-bridge # Fen Doyle's rope bridge, two crossings along
    way-2: obj:shade-fen-bridge @landmark:shade-fen-bridge # the hole in the bridge
    way-3: landmark:shade-moonwell-steps # the spiral steps down into the Moonwell shaft
    way-3: obj:shade-hero-puppet @landmark:shade-moonwell-steps # a puppet bundle on the third step
    way-2: landmark:shade-whistle-post # an old iron whistle-pipe in the rock, low in the Webbed Deeps
    way-2: obj:shade-whistle-post @landmark:shade-whistle-post
    zone-3: obj:shade-quince-drawer @landmark:quince-stall # a drawer behind the counter
    zone-3: landmark:shade-twins-door # a green door at the bottom of the Moonwell shaft
    zone-3: obj:shade-twins-door @landmark:shade-twins-door
    way-4: landmark:shade-bryn-shadow-mark # a flat rock by the burn on the high moor
    way-4: obj:shade-bryn-shadow-mark @landmark:shade-bryn-shadow-mark
    way-2: area:shade-deeps-descent @landmark:mab-nest+landmark:silk-cutters-camp
    zone-4: area:shade-moor-path @landmark:tallow-fold+landmark:shade-moor-edge
  `),
];

/** Verdant Act I depth (Claude 4's helpers; the outline Verdant pieces are in setPiecesExtra VERDANT). */
const VERDANT_DEPTH = [
  ...realmList('area:verdant-capital', `
    zone-1: landmark:hedgewitch-hush-bough # the Hushing Bough, where the Bough Markets meet the trunk
    zone-1: area:hedgewitch-bough-road @landmark:yarrow-bower+landmark:hedgewitch-hush-bough
    zone-1: obj:hedgewitch-lantern-clue-1..3 @landmark:lantern-row # a lit lantern, a fox knocker, a black vein
    zone-2: landmark:hedgewitch-deep-well # the far bottom of the Sap Wells
    zone-2: area:hedgewitch-sap-stair @landmark:ostara-sap-garden+landmark:hedgewitch-deep-well
    zone-2: obj:hedgewitch-sap-junction @landmark:hedgewitch-deep-well # a new pipe on the tappers' line
    zone-1: landmark:hedgewitch-cobble-lane # Yarrow's birth street
    zone-1: obj:hedgewitch-cobble-lane @landmark:hedgewitch-cobble-lane # the dawn scene
    lair-2: obj:hedgewitch-vault-aisle-1..3 # rooms: one per vault room (overgrown aisles)
    zone-2: obj:hedgewitch-ward-clue-1..3 @landmark:ostara-sap-garden # the ward-book, the pots, the ladder hook
    zone-2: area:hedgewitch-canopy-climb @landmark:ostara-sap-garden+landmark:canopy-graft-crown
    road: landmark:hedgewitch-leaving-hazel # the Leaving Hazel, halfway down the Root Road
    road: obj:hedgewitch-leaving-hazel @landmark:hedgewitch-leaving-hazel
    road: area:hedgewitch-root-road @landmark:hedgewitch-leaving-hazel+obj:verdant-gate-seal
    zone-3: obj:hedgewitch-old-heap # the Circle's Old Heap, the bottom of the Root Cellars
    zone-1: obj:hedgewitch-peppermint-jar @obj:verdant-stall-4 # the sap-sweet stall
    way-3: landmark:hedgewitch-mudlark-tunnels # root-tunnels where the Mudlarks' back wall was
    way-3: obj:hedgewitch-mudlark-frame @landmark:hedgewitch-mudlark-tunnels # Agnes and the doorframe
    zone-3: landmark:hedgewitch-cellar-mouth # where the Root Cellars open on to the wilds
    zone-3: obj:hedgewitch-thistle-list @landmark:hedgewitch-cellar-mouth # a leaf on a thorn
    zone-4: landmark:hedgewitch-launching-ledge # the kite-race ledge
    zone-4: obj:hedgewitch-launching-ledge @landmark:hedgewitch-launching-ledge
    way-4: landmark:hedgewitch-liars-fork # a fork in the trunk halfway up the canopy
    way-4: obj:hedgewitch-liars-fork @landmark:hedgewitch-liars-fork # bark covered in initials
  `),
  ...realmList('area:verdant-frontier', `
    zone-1: landmark:ranger-map-stone # the map-stone by the camp gate
    zone-1: area:ranger-lookout-steps @landmark:holt-lookout+landmark:ranger-map-stone
    zone-2: obj:ranger-blight-clue-1..3 @obj:wayfarer-blaze-5 # dead beetles, a deer track, an upside-down blaze
    way-2: landmark:ranger-aldo-plot # Aldo's old leek plot, past the camp edge
    way-2: area:ranger-aldo-walk @landmark:wayfarer-fire+landmark:ranger-aldo-plot
    zone-3: obj:ranger-firebreak-stake-1 @landmark:thorn-greenbriar-nursery # by the Bloomkin nursery beds
    zone-3: obj:ranger-firebreak-stake-2 @landmark:fen-wedding-green
    zone-3: obj:ranger-firebreak-stake-3 @landmark:shore-ferry-house # the ferry crossing
    lair-2: obj:ranger-hollow-egg-1..3 # rooms: one per Mound room
    way-4: obj:ranger-aldo-trail-1..2 # Aldo's blazes into the Rotwood: a green oak, a grey ash
    way-4: obj:ranger-aldo-trail-3 @landmark:rotking-throne
    way-4: landmark:ranger-rotwood-edge # where the Rotwood's grey meets the green
    way-4: area:ranger-rotwood-trail @landmark:ranger-rotwood-edge+landmark:rotking-throne
    road: landmark:ranger-blaze-oak # where the road leaves the Thornwilds
    road: obj:ranger-first-blaze @landmark:ranger-blaze-oak
    road: area:ranger-gate-road @landmark:ranger-blaze-oak+obj:verdant-gate-seal
    way-2: landmark:ranger-salt-oak # a hollow oak out past the camp
    way-2: obj:ranger-salt-hoard @landmark:ranger-salt-oak
    zone-2: obj:ranger-kit-last-blaze @obj:kit-fernsby-bow # fox-marked blazes round a stretch of grey
    zone-1: landmark:ranger-cobb-pitch @landmark:ranger-map-stone # the pedlars' pitch at the camp gate
    zone-2: landmark:ranger-wandering-ford # the ford on the trail to the Bloomfen
    zone-2: obj:ranger-ford-stone @landmark:ranger-wandering-ford
    zone-3: landmark:ranger-reed-island # a reed island in the middle of the fen
    zone-3: obj:ranger-wedding-groom @landmark:ranger-reed-island # Osier in a beached punt
    zone-3: landmark:ranger-mint-stone # Old Pennyroyal's stone, the far side of the fen
    zone-3: obj:ranger-water-mint @landmark:ranger-mint-stone
    zone-2: obj:ranger-morel-test @landmark:old-rot-stump # on the Old Rot log
  `),
];

/** Blade Act I depth (Claude 4's helpers; the outline Blade pieces are in setPiecesExtra BLADE). */
const BLADE_DEPTH = [
  ...realmList('area:blade-capital', `
    zone-1: area:swordsman-back-alleys @landmark:ladder-board+landmark:ferro-salle
    zone-1: obj:swordsman-chalk-clue-1 @landmark:ladder-board # black chalk in the gutter at the board's foot
    zone-1: obj:swordsman-chalk-clue-2 @obj:swordsman-endless-duel-1 # by the duel-graves
    zone-1: obj:swordsman-chalk-clue-3 @landmark:blade-capital-the-fencing-hall # a grating in the Fencing Hall's foundations
    zone-2: obj:swordsman-autograph-book @landmark:champions-bridge # Vellacourt's dropped autograph book
    zone-1: obj:swordsman-ladder-dawn @landmark:ladder-board # dawn scene
    lair-2: obj:swordsman-salle-piste-1..3 # rooms: one per Grand Salle room (practice touch-boards)
    zone-4: obj:swordsman-unended-face-1..3 @landmark:unended-gallery # along the gallery; 3 the reserved empty space
    road: landmark:swordsman-salute-stone # halfway up the silver-grass road
    road: obj:swordsman-salute-stone @landmark:swordsman-salute-stone
    road: area:swordsman-silver-grass @landmark:swordsman-salute-stone+obj:blade-gate-seal
    zone-1: landmark:swordsman-nappi-shop @landmark:thimble-shop # Orsola Nappi's, across the square
    zone-1: obj:swordsman-rival-tailor @landmark:swordsman-nappi-shop
    way-3: landmark:swordsman-sarto-plot # the duellists' cemetery on the hill above the river
    way-3: obj:swordsman-sarto-plot @landmark:swordsman-sarto-plot
    zone-2: landmark:swordsman-foscos-bridge @landmark:rills-bridge # the next bridge downriver
    zone-2: obj:swordsman-courting-note @landmark:swordsman-foscos-bridge # Gemma Fosco, holding her bridge
    zone-3: obj:swordsman-first-lesson @landmark:grisi-salle
    zone-3: landmark:swordsman-river-shallows @landmark:varric-statue # below the far bank, facing the statue
    zone-3: obj:swordsman-second-statue @landmark:swordsman-river-shallows # Ser Odo's statue in the silt
    zone-4: landmark:swordsman-drill-yard @landmark:armoury-roll # the old Drill Yard behind the Armoury
    zone-4: obj:swordsman-drill-yard @landmark:swordsman-drill-yard
  `),
  ...realmList('area:blade-frontier', `
    zone-1: landmark:samurai-lantern-shrine # the top of the Temple Road
    zone-1: area:samurai-needle-road @landmark:kanemori-cell+landmark:samurai-lantern-shrine
    way-2: obj:samurai-novice-trail-1..3 # down the terrace steps towards the Camps
    zone-3: obj:samurai-camp-novice-1..3 # round the Ronin Camps: a tent, a camp table, the fence
    way-3: landmark:samurai-valley-lip # where the Camps end and the mountain starts
    way-3: area:samurai-camps-ride @landmark:ikeda-pavilion+landmark:samurai-valley-lip
    zone-1: obj:samurai-muster-dawn @landmark:temple-road-gate # dawn scene
    lair-2: obj:samurai-shrine-offering-1..3 # rooms: one per shrine room (wish-boards, split sheaths, the cut basin)
    zone-1: obj:samurai-hidden-pilgrim-1..3 # in the pines off the Temple Road
    road: landmark:samurai-last-milestone # where the pines end
    road: obj:samurai-last-milestone @landmark:samurai-last-milestone
    road: area:samurai-pilgrim-road @landmark:samurai-last-milestone+obj:blade-gate-seal
    zone-1: landmark:samurai-echo-stone @landmark:temple-road-shrine # a hollow above the shrine
    zone-1: obj:samurai-echo-stone @landmark:samurai-echo-stone
    way-2: landmark:samurai-resting-bend # halfway up the Temple Road
    way-2: obj:samurai-pine-bench @landmark:samurai-resting-bend
    zone-2: landmark:samurai-spring-crack @landmark:ashina-spring # where the water leaves the rock
    zone-2: obj:samurai-spring-crack @landmark:samurai-spring-crack
    zone-3: obj:samurai-kenta-brother # Ryo on sentry at a Ronin tent
    zone-3: obj:samurai-ozu-strongbox @landmark:daisuke-camp
    zone-3: obj:samurai-ikeda-sheaths @landmark:ikeda-pavilion # a screen in the pavilion corner
    zone-4: landmark:samurai-dancers-stone @landmark:natsu-landing # the end of the old channel
    zone-4: obj:samurai-dancers-stone @landmark:samurai-dancers-stone
    zone-4: landmark:samurai-moon-pool @landmark:frog-pond # a round pool in the Shallows
    zone-4: obj:samurai-frog-concert @landmark:samurai-moon-pool # night-only scene
  `),
];

/** Song Act I depth (Claude 4's helpers; the outline Song pieces are in setPiecesExtra SONG). */
const SONG_DEPTH = [
  ...realmList('area:song-capital', `
    zone-1: obj:bard-silent-fountain-1 @landmark:humming-fountain # the Humming Fountain
    zone-1: obj:bard-silent-fountain-2 @landmark:opera-box-office
    zone-1: obj:bard-silent-fountain-3 @landmark:grand-opera # behind the opera
    zone-2: obj:bard-sold-busker-1..3 @landmark:busking-steps-pitch # three buskers on the Steps
    zone-2: obj:bard-steps-night @landmark:busking-steps-pitch # the night after the vote
    zone-3: obj:bard-organ-wall-1..3 @landmark:conservatory-hall # Conservatory corridors; 3 behind the Rector's study
    zone-4: obj:bard-burned-song-1..3 @landmark:prompt-box # burned scraps through the Prompter's Cellars
    road: landmark:bard-hum-stone # a grey menhir halfway along the meadow road
    road: obj:bard-hum-stone @landmark:bard-hum-stone
    zone-3: obj:bard-lullaby-sheet @landmark:conservatory-hall # a library drawer
    zone-2: obj:bard-printers-book @landmark:busking-steps-pitch # a printer's counter
    zone-3: obj:bard-hall-echo @landmark:conservatory-hall # the empty Hall floor
    zone-3: obj:bard-belfry-fork @landmark:great-metronome # the Conservatory belfry
    zone-4: obj:bard-cellar-door @landmark:prompt-box # a locked door behind the prompt-box (night)
    zone-1: obj:bard-wig-wisp @landmark:opera-gardens # by the pond
    zone-1: area:bard-backstage @landmark:grand-opera+landmark:rosalind-dressing-room
    road: area:bard-meadow-road @landmark:lyrehaven-meadow-road+landmark:bard-hum-stone
  `),
  ...realmList('area:song-frontier', `
    zone-3: obj:skald-moot-torch @landmark:saga-stones-ring # the ring by torchlight
    way-4: obj:skald-stolen-echo-1..3 # up the Harpy Cliffs path
    zone-3: obj:skald-dusk-stones @landmark:saga-stones-ring # the ring at dusk
    road: landmark:skald-last-echo # a split boulder where the road leaves the Fells
    road: obj:skald-last-echo @landmark:skald-last-echo
    zone-1: obj:skald-bluebell-drum @landmark:sigrun-fold # the high relay drum above the steads
    way-2: obj:skald-middle-stead-drum @landmark:relay-stead+landmark:brackenhow # a stead roof between the two
    zone-2: obj:skald-torsten-ledge @landmark:scarrow-pike # halfway up the Pike
    zone-2: obj:skald-fetch-grave @landmark:whistling-tarn # a dog's grave by the tarn wall
    zone-3: obj:skald-drove-stone @landmark:saga-stones-ring # by the drove track beyond the ring
    zone-4: obj:skald-silent-egg @landmark:egg-thieves-camp # a high cliff ledge
    zone-4: obj:skald-fog-drum @landmark:fog-drum # the fog-drum (night)
    zone-1: area:skald-hall-path @landmark:ragna-hearth+landmark:saga-hall
    zone-2: area:skald-pike-climb @landmark:saga-stones-ring+landmark:scarrow-pike
    way-4: area:skald-harpy-path @landmark:saga-stones-ring+landmark:egg-thieves-camp
    road: area:skald-last-road @landmark:fells-gate-cairn+landmark:skald-last-echo
  `),
];

export const CAMPAIGN_PIECES: SetPieceDef[] = [...IRON, ...FIST, ...RIME, ...STORM, ...HUNT, ...GUILE, ...RADIANCE, ...UMBRAL, ...VERDANT_DEPTH, ...BLADE_DEPTH, ...SONG_DEPTH];

export const CAMPAIGN_CONCORDIA: ConcordiaExtra[] = concordiaList(`
  landmark:iron-embassy-gildport @landmark:gild-gilded-row 0,-4 # The Iron Embassy
  obj:knight-salvage-raft @landmark:gild-gilded-row 0,4 # A salvage raft in the gold-silt
  obj:juggernaut-fizz-machine @landmark:gild-sparkwright-works 2,1 # A fizz machine
  landmark:juggernaut-dig-camp @landmark:berenika-shrine 8,4 # The dig camp
  obj:juggernaut-dig-shoring-1..3 @landmark:berenika-shrine 6,3 | 8,3 | 10,3 # Shoring
  obj:juggernaut-dig-collapse @landmark:berenika-shrine 8,6 # A collapse
  obj:juggernaut-embassy-footings @landmark:berenika-shrine 11,5 # Old embassy footings
  obj:knight-hammer-echo-1..3 @landmark:sentinel-iron 6,6 | 4,10 | 2,14 # A hammer echo
  obj:juggernaut-ore-ruts @landmark:sentinel-iron 0,-6 # Ore ruts
  obj:juggernaut-magda-cart @ws:frost 6,-6 # Magda's cart
  obj:juggernaut-buttress-1..3 @landmark:warden-wardens-gate -3,0 | 0,1 | 3,0 # A buttress
  obj:juggernaut-ore-cart @obj:arch-iron 1,1 # An ore cart
  landmark:fist-welcome-hall @obj:sentinel-fist-door -10,-8 # The Welcome Hall
  obj:monk-slime-form-1..3 @obj:sentinel-fist-door -6,4 | -2,6 | 2,5 # A slime form in the bramble
  obj:brawler-mud-ring @obj:sentinel-fist-door 3,3 # A mud ring
  obj:monk-pool-edge @obj:sentinel-fist-door 2,-2 # The pool edge
  obj:monk-climber-cairn @landmark:cliff-wind-yard -2,2 # A climber's cairn
  obj:monk-wind-ledge @landmark:cliff-wind-yard 2,-3 # The wind ledge
  obj:monk-kestrel-bead @landmark:cliff-wind-yard 6,-6 # A kestrel bead
  obj:knight-cold-hearth @landmark:kiln-great-kiln 0,0 # A cold hearth
  obj:brawler-fight-card @landmark:kiln-cinder-mug 2,0 # A fight card
  obj:brawler-sold-pen @landmark:kiln-cinder-mug 0,-4 # The sold pen
  obj:brawler-climber-signal @landmark:kiln-ashworks 0,-2 # A climber's signal
  obj:brawler-ash-pit @landmark:kiln-ore-market 0,-3 # An ash pit
  obj:knight-plate-anvil @landmark:sentinel-ash -3,1 # The smiths' anvil
  obj:brawler-silas-ledger @landmark:sentinel-ash 3,1 # Silas's ledger
  obj:rime-arch-letter @obj:arch-rime -1,1 # A letter in the arch
  obj:rime-arch-horn @obj:arch-rime 1,1 # A horn by the arch
  obj:sparkwright-tess-telegraph @obj:arch-storm 4,3 # Tess's telegraph
  obj:rimecaller-held-traveller-1..3 @ws:frost 0,-40 | 8,-50 | 2,-56 # A traveller under the snow (the carter, a walker, a child: up the pass round the held road)
  obj:rimecaller-pass-hold-mark-1..3 @ws:frost -4,-12 | 6,-16 | -2,-20 # A frost swirl
  obj:warden-pass-cairn-1..3 @ws:frost -8,-8 | 10,-10 | -6,-16 # An old patrol cairn
  obj:warden-old-tunnel @ws:frost -10,-14 # A tunnel mouth behind the snow
  obj:stormlancer-pass-race-line @ws:frost 0,-12 # A race line of cairns
  obj:stormlancer-pass-shield-line @ws:frost 0,-15 # A shield line
  obj:rimecaller-tumble-lantern-1..3 @landmark:ford-lantern-shop 3,2 | 4,3 | 5,2 # A lantern jar
  obj:warden-torvald-gloam-table @landmark:gloam-stag-glade 8,4 # A long table
  obj:warden-hooded-glade-perch @landmark:gloam-stag-glade -6,-2 # A hooded perch
  obj:sparkwright-lightning-ladder-1..3 @landmark:cliff-storm-spire 4,-2 | 5,-5 | 6,-8 # An anchor point
  obj:sparkwright-sefu-tea-ledge-1..3 @landmark:cliff-storm-spire -4,-2 | -5,-5 | -6,-8 # A tea ledge
  obj:stormlancer-cliff-charge-flag-1..3 @landmark:cliff-wind-yard -6,0 | -8,-3 | -10,-6 # An iron flagpole
  obj:stormlancer-stormcliff-duel-ring @landmark:cliff-wind-yard 8,-8 # A turf duel ring
  obj:sparkwright-volta-tear-furnace @landmark:gild-sparkwright-works 0,1 # A furnace under the Works
  obj:sparkwright-ottoline-furnace @landmark:gild-sparkwright-works -3,0 # Ottoline's furnace
  obj:huntsman-stag-trail-1..3 @landmark:gloam-stag-glade -8,14 | -14,24 | -20,34 # A stag trail
  obj:huntsman-stag-offering @landmark:gloam-stag-glade 0,1 # An offering
  obj:huntsman-unwoven-trail-1..3 @obj:sentinel-hunt-door -3,2 | 0,3 | 3,2 # An unwoven trail
  obj:huntsman-corva-camp @obj:sentinel-umbral-door 3,2 # Corva's camp
  obj:falconer-silent-canopy-1..3 @ws:glade -12,-4 | -16,0 | -20,4 # A silent canopy
  obj:saga-verse-1..3 @ws:stag -8,-8 | 8,-10 | 0,-12 # A verse in the high trees
  obj:huntsman-wild-gives-kill @landmark:lodge-archery-yard 0,2 # The wild's gift
  obj:falconer-hooded-ledge @obj:sentinel-storm-door -2,4 # A hooded ledge
  obj:falconer-cage-machine @landmark:cliff-wind-yard 3,2 # A cage machine
  obj:guile-marsh-light-1..3 @landmark:ford-will-o-wisp 10,6 | 20,12 | 30,18 # A marsh light
  obj:guile-toll-light @obj:sentinel-guile-door 0,-2 # The toll light
  obj:jester-bell-rope @landmark:shore-fish-mill 2,1 # A bell rope
  obj:jester-oath-steps @landmark:shore-chapel -2,1 # The oath steps
  obj:jester-punchline-lantern-1..3 @landmark:ford-lantern-shop -3,2 | -4,3 | -5,2 # A punchline lantern
  obj:corsair-mother-lantern @landmark:ford-lantern-shop 0,3 # The mother lantern
  obj:corsair-pearl-barge @landmark:gild-gilded-row 3,4 # A pearl barge
  obj:corsair-dock-ledger @landmark:gild-gilded-row -3,2 # A dock ledger
  obj:corsair-dot-bottle @obj:arch-guile 0,2 # Dot's bottle
  obj:cantor-drowned-choir @landmark:shore-boat 2,2 # A drowned choir in the shallows
  obj:cantor-chapel-psalter @landmark:shore-chapel 0,-1 # A psalter
  landmark:oathbound-shorewatch-post @landmark:shore-boat -6,0 # The Shorewatch post
  obj:oathbound-shorewatch-shield-1..3 @landmark:shore-boat -8,2 | -6,3 | -4,2 # A shield in the shallows
  obj:cantor-scorched-oak-1..3 @ws:stag -14,10 | -10,6 | -6,3 # A scorched oak
  obj:cantor-willow-saplings @landmark:sentinel-verdant -3,1 # Willow saplings
  obj:shade-willow-deep-shade @landmark:sentinel-verdant 3,-2 # The Willow's deep shade
  obj:shade-thread-knot-1..2 @ws:stag 6,-4 | 9,-1 # A thread knot
  obj:oathbound-oath-grave-1..3 @landmark:brind-graveyard -1,-3 | 1,-3 | 3,-3 # An oath grave
  obj:duskweaver-sexton-register @landmark:brind-graveyard -3,0 # The sexton's register
  obj:oathbound-barrow-watch-stone @landmark:barrow-door -3,1 # A watch stone
  obj:duskweaver-record-thread-1..3 @landmark:sentinel-umbral -4,-2 | -2,-4 | 0,-5 # A record thread
  obj:duskweaver-spinner-trail-1..3 @landmark:sentinel-umbral 4,-2 | 6,-4 | 8,-5 # A spinner trail
  obj:shade-silk-shadow-1..3 @landmark:sentinel-umbral -6,2 | -8,4 | -10,5 # A silk shadow
  obj:shade-silent-thread-1..3 @landmark:sentinel-umbral 6,2 | 8,4 | 10,5 # A silent thread
  obj:duskweaver-drowned-light-1..3 @landmark:ford-ford-keeper 4,4 | 6,6 | 8,4 # A drowned light in the reeds
  obj:duskweaver-last-light @landmark:ford-ford-keeper 0,1 # The last light
  // Act III, all 24 classes (Claude 4): spread in a grid round each Heart landmark
  obj:bard-aria-stair @landmark:twelve-stairs-top -7,-1
  obj:bard-lullaby-stair @landmark:twelve-stairs-top -5,-1
  obj:cantor-compline-steps @landmark:twelve-stairs-top -3,-1
  obj:corsair-citadel-door @landmark:twelve-stairs-top -1,-1
  obj:duskweaver-crown-name @landmark:twelve-stairs-top 1,-1
  obj:falconer-citadel-cast @landmark:twelve-stairs-top 3,-1
  obj:hedgewitch-stair-acorn @landmark:twelve-stairs-top 5,-1
  obj:huntsman-hunt-stair-head @landmark:twelve-stairs-top 7,-1
  obj:huntsman-corva-cairn @landmark:twelve-stairs-top -7,-3
  obj:huntsman-stair-calf @landmark:twelve-stairs-top -5,-3
  obj:jester-citadel-step @landmark:twelve-stairs-top -3,-3
  obj:juggernaut-cold-furnace @landmark:twelve-stairs-top -1,-3
  obj:knight-iron-stair-step @landmark:twelve-stairs-top 1,-3
  obj:monk-last-move-board @landmark:twelve-stairs-top 3,-3
  obj:oathbound-radiance-stair @landmark:twelve-stairs-top 5,-3
  obj:ranger-stair-blaze @landmark:twelve-stairs-top 7,-3
  obj:rimecaller-first-entry @landmark:twelve-stairs-top -7,-5
  obj:samurai-shun-step @landmark:twelve-stairs-top -5,-5
  obj:shade-veil-banner @landmark:twelve-stairs-top -3,-5
  obj:skald-saga-drum @landmark:twelve-stairs-top -1,-5
  obj:skald-stair-stone @landmark:twelve-stairs-top 1,-5
  obj:sparkwright-patent-witness @landmark:twelve-stairs-top 3,-5
  obj:sparkwright-sixty-one-perch @landmark:twelve-stairs-top 5,-5
  obj:swordsman-blade-banner @landmark:twelve-stairs-top 7,-5
  obj:brawler-stock-pot @landmark:legion-camp -7,-1
  obj:cantor-brightwatch-recruits @landmark:legion-camp -5,-1
  obj:jester-legion-customers @landmark:legion-camp -3,-1
  obj:juggernaut-shift-crate @landmark:legion-camp -1,-1
  obj:juggernaut-hollow-shift @landmark:legion-camp 1,-1
  obj:knight-hollow-regiment @landmark:legion-camp 3,-1
  obj:oathbound-sorrow-sworn @landmark:legion-camp 5,-1
  obj:oathbound-gallant-rest @landmark:legion-camp 7,-1
  obj:rimecaller-still-one @landmark:legion-camp -7,-3
  obj:samurai-masterless @landmark:legion-camp -5,-3
  obj:shade-weeping-shades @landmark:legion-camp -3,-3
  obj:sparkwright-guild-engineers @landmark:legion-camp -1,-3
  obj:stormlancer-fast-ones @landmark:legion-camp 1,-3
  obj:swordsman-kept-opponents @landmark:legion-camp 3,-3
  obj:warden-clan-ranks @landmark:legion-camp 5,-3
  obj:warden-gubbins-banner @landmark:legion-camp 7,-3
  obj:bard-bought-song-1 @landmark:legion-camp -7,-5
  obj:bard-bought-song-2 @landmark:legion-camp -5,-5
  obj:bard-bought-song-3 @landmark:legion-camp -6,-2
  obj:brawler-sold-fighter-1 @landmark:legion-camp -1,-5
  obj:brawler-sold-fighter-2 @landmark:legion-camp 1,-5
  obj:brawler-sold-fighter-3 @landmark:legion-camp 3,-5
  obj:duskweaver-stolen-phial-1 @landmark:legion-camp 5,-5
  obj:duskweaver-stolen-phial-2 @landmark:legion-camp 7,-5
  obj:duskweaver-stolen-phial-3 @landmark:legion-camp -7,-7
  obj:falconer-hooded-steader-1 @landmark:legion-camp -5,-7
  obj:falconer-hooded-steader-2 @landmark:legion-camp -3,-7
  obj:falconer-hooded-steader-3 @landmark:legion-camp -1,-7
  obj:monk-legion-novice-1 @landmark:legion-camp 1,-7
  obj:monk-legion-novice-2 @landmark:legion-camp 3,-7
  obj:monk-legion-novice-3 @landmark:legion-camp 5,-7
  obj:skald-hollow-skald-1 @landmark:legion-camp 7,-7
  obj:skald-hollow-skald-2 @landmark:legion-camp -7,-9
  obj:skald-hollow-skald-3 @landmark:legion-camp -5,-9
  obj:bard-aria-letter @landmark:heart-camp -7,-1
  obj:corsair-white-flagship @landmark:heart-camp -5,-1
  obj:corsair-iou-bottle @landmark:heart-camp -3,-1
  obj:falconer-camp-perch @landmark:heart-camp -1,-1
  obj:falconer-grown-fledglings @landmark:heart-camp 1,-1
  obj:huntsman-calf-cover @landmark:heart-camp 3,-1
  obj:ranger-aldo-garden @landmark:heart-camp 5,-1
  obj:ranger-salt-pole @landmark:heart-camp 7,-1
  obj:samurai-heart-post @landmark:heart-camp -7,-3
  obj:shade-camp-lantern @landmark:heart-camp -5,-3
  obj:skald-camp-drum @landmark:heart-camp -3,-3
  obj:sparkwright-heart-telegraph @landmark:heart-camp -1,-3
  obj:swordsman-percy-heart-bout @landmark:heart-camp 1,-3
  obj:warden-weeping-watch @landmark:heart-camp 3,-3
  obj:shade-stray-sheep-1 @landmark:heart-camp 5,-3
  obj:shade-stray-sheep-2 @landmark:heart-camp 7,-3
  obj:shade-stray-sheep-3 @landmark:heart-camp -7,-5
`);
