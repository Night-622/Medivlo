/**
 * Campaign bosses (Claude 3) from Claude 4's class outlines (docs/lore/hollow-crown/06-outlines/*.md):
 * per class the lair-2 boss, the nemesis (lair 3) and the nemesis remade for Act III (the Herald for magic
 * schools, bound into the Union Chimera for martial schools). Lair 1 = the realm mini, the gate = the realm boss,
 * Act II = two Morvane Sentinels, finale = Black Concord → Hollow King: those are handoff bestiary creatures.
 *
 * Abilities are written as handoff-style lines; src/data/enemies/hc/abilities.ts turns them into mechanics.
 * `body` is the bestiary art used until bespoke art exists. `mechanic` is the outline's set-piece for scripting.
 */
import type { BodyArch, HcCreatureBase } from '@/systems/rules/types';

export interface CampaignBoss extends HcCreatureBase {
  classId: string;
  slot: 'lair2' | 'nemesis' | 'herald' | 'chimera';
  body: string;
  mechanic: string;
  /** health trim after the shape clamp (rules/creatures.ts) */
  hpMult?: number;
}

const B = (classId: string, slot: CampaignBoss['slot'], id: string, name: string, arch: BodyArch, body: string, element: string, hp: number,
  abilities: string[], mechanic: string, lore: string): CampaignBoss =>
  ({ id: `cb_${id}`, name, tier: 'boss', arch, scale: 1, region: 'campaign', element, hp, abilities, drops: [], lore, classId, slot, body, mechanic });

const HERALD = (classId: string, id: string, name: string, body: string, el: string, bell: string, mechanic: string) =>
  B(classId, 'herald', id, name, 'humanoid', body, el, 17000, [
    `Phase 1: ${bell} Rings the bell to stun everyone.`,
    'Phase 2: Rains black tears on the ground.',
    'Phase 3: The whole arena turns to lava.',
    'Calls Hollowed villagers from the fields.',
    'Yields when beaten: spare or destroy.',
  ], mechanic, 'Remade by the Hollow King as his Herald.');
const CHIMERA = (classId: string, id: string, name: string, part: string, mechanic: string) =>
  B(classId, 'chimera', id, name, 'quad', 'bx_concord_4', 'All schools', 18000, [
    `Phase 1: ${part} Charges in a straight line.`,
    'Phase 2: Swings in a wide arc.',
    'Phase 3: The storm hits everything at once.',
    'Rains black tears on the ground.',
    'Yields when beaten: spare or destroy.',
  ], mechanic, 'A patchwork beast of every school, bound together by the Hollow King.');

const RAW: CampaignBoss[] = [
  // ── Ash ──
  B('arcanist', 'lair2', 'ledger-flame', 'The Ledger Flame', 'spirit', 'bx_lanternghost', 'Ash', 13000,
    ['Phase 1: Fires volleys from range.', 'Phase 2: Throws a fan of knives.', 'Phase 3: Leaves pools of fire.', 'Rains black tears on the ground.'],
    'Phase 2 reads the hero’s future aloud as attack telegraphs.', 'The burning records of the Last Library, risen as one creature.'),
  B('arcanist', 'nemesis', 'provost-morrow', 'Provost Morrow', 'humanoid', 'bx_ash_3', 'Ash', 14000,
    ['Phase 1: Erupts the kiln floor.', 'Phase 2: Chants to heal other drowned.', 'Phase 3: Sets the ground on fire around it.', 'Curses you: less healing for 6s.'],
    'Grate vents erupt in patterns; he heals from the fire unless the vents are doused with the half-stone’s song.', 'Provost of the Ember Conclave. His eyes weep black when he is hurt.'),
  HERALD('arcanist', 'herald-of-ash', 'The Herald of Ash', 'bx_ash_3', 'Ash', 'A living kiln in the Herald’s robes.', 'Spare: pour his fire into the half-stone (arcanist.nemesis_fate).'),
  B('reaver', 'lair2', 'brand-mother', 'The Brand-Mother', 'quad', 'bx_packlord', 'Ash', 13500,
    ['Phase 1: Leaps and summons its pack.', 'Phase 2: Calls Ash Hounds from the kiln.', 'Phase 3: Leaves burning pawprints.', 'Marks you for its allies.'],
    'Brand the whelping pits shut to stop the whelps.', 'A hound matriarch of the Brand-Pits, hollowed.'),
  B('reaver', 'nemesis', 'hask-the-unburnt', 'Hask the Unburnt', 'humanoid', 'bx_ash_3', 'Ash', 14500,
    ['Phase 1: Swings in a wide arc.', 'Phase 2: Charges three times in a row.', 'Phase 3: A slam that knocks you down.', 'Rains black tears on the ground.', 'Stunned when knocked into stone.', 'Immune to burning.'],
    'He mirrors the Reaver’s axe moves and cannot burn; push him into cooled stone.', 'Tears run from his smile, never his eyes.'),
  HERALD('reaver', 'unburnt-herald', 'The Unburnt Herald', 'bx_ash_3', 'Ash', 'Hask rings a bell of slag.', 'Spare: Brenna’s peace-axe breaks the hollow (reaver.nemesis_fate).'),
  // ── Rime ──
  B('rimecaller', 'lair2', 'still-reflection', 'The Still Reflection', 'spirit', 'bx_rime_1', 'Rime', 13000,
    ['Phase 1: Hurls ice boulders.', 'Phase 2: Blinks between snowdrifts.', 'Phase 3: Freezes foes solid for 2s.', 'Rains black tears on the ground.'],
    'It only moves while the hero stands still; bait it into the mirrors.', 'The hero’s frozen double. Its face weeps black where theirs does not.'),
  B('rimecaller', 'nemesis', 'seraphine-cold', 'Regent Seraphine Cold', 'humanoid', 'bx_rime_3', 'Rime', 14000,
    ['Phase 1: Freezes the floor.', 'Phase 2: Hurls ice boulders.', 'Phase 3: A blizzard covers the arena.', 'Curses you: less healing for 6s.'],
    'She holds time in patches; the half-stone’s song ticks a patch forward and sends its contents back at her.', 'Regent of Glacierhome. She plucks her frozen black tears and throws them.'),
  HERALD('rimecaller', 'herald-of-the-held-hour', 'The Herald of the Held Hour', 'bx_rime_3', 'Rime', 'A bell of clear ice tolls one note.', 'Spare: keep Anselm for her, written the Archive’s oldest way.'),
  B('warden', 'lair2', 'hundredth-warden', 'The Hundredth Warden', 'humanoid', 'bx_skelknight', 'Rime', 13500,
    ['Phase 1: Blocks attacks from the front.', 'Phase 2: Charges in a straight line.', 'Phase 3: Ground slam freezes the arena.', 'Rains black tears on the ground.'],
    'He plants a line the hero cannot cross; block his charges until his shield arm drops.', 'The founder of the Wardwall. His shield is frozen to his arm.'),
  B('warden', 'nemesis', 'torvald-wallbreaker', 'Torvald Wallbreaker', 'humanoid', 'bx_rime_3', 'Rime', 14500,
    ['Phase 1: A slam that knocks you down.', 'Phase 2: Howls to call two wolves.', 'Phase 3: Shakes the mountain with every blow.', 'Blocks attacks from the front.'],
    'He tears blocks out of the Breach to let hollow wolves in; shove him into the gaps.', 'Tears run down his shield like meltwater and never freeze.'),
  HERALD('warden', 'herald-of-the-wall', 'The Herald of the Wall', 'bx_rime_3', 'Rime', 'A bell cut from the Wardwall’s own ice.', 'Spare: read him the charter.'),
  // ── Storm ──
  B('sparkwright', 'lair2', 'perpetual-engine', 'The Perpetual Engine Mk. XII', 'construct', 'bx_sentry', 'Storm', 15000,
    ['Phase 1: Fires gear blades in spirals.', 'Phase 2: Strikes with chain lightning.', 'Phase 3: Overcharge: everything is electrified.', 'Rebuilds itself once unless shattered.'],
    'Jam its gears in the right order; it upgrades itself each phase and announces it.', 'It cannot be destroyed, only stopped. Its oil runs black.'),
  B('sparkwright', 'nemesis', 'volta-sterne', 'Chancellor Volta Sterne', 'humanoid', 'bx_storm_4', 'Storm', 14000,
    ['Phase 1: Calls bolts from the sky.', 'Phase 2: Strikes with chain lightning.', 'Phase 3: Sweeps the room with a beam.', 'Leaves pools of fire.'],
    'Rewire the pylons to turn her lines back at her; the half-stone’s song shorts her harness.', 'Chancellor of Spirehold. Her sparks leave scorch-tears.'),
  HERALD('sparkwright', 'copper-herald', 'The Copper Herald', 'bx_storm_4', 'Storm', 'A dynamo bell that never stops turning.', 'Spare: play the kettle note or bring Tess’s notebook.'),
  B('stormlancer', 'lair2', 'old-clatterwing', 'Old Clatterwing', 'flyer', 'bx_storm_0', 'Storm', 13000,
    ['Phase 1: Dives from the roof.', 'Phase 2: Hurls ice boulders.', 'Phase 3: Calls lightning on the clifftop.', 'Her murder of crows dives at you.'],
    'Catch the fledglings so she dives low enough to hit.', 'A Thunderbird matriarch. Her feathers moult black.'),
  B('stormlancer', 'nemesis', 'cass-vantor', 'Cass Vantor', 'humanoid', 'bx_storm_4', 'Storm', 14000,
    ['Phase 1: Charges three times in a row.', 'Phase 2: Strikes with chain lightning.', 'Phase 3: Vanishes and strikes from behind.', 'Leaves pools of fire.'],
    'Too fast to chase: stop, brace the lance and let her come.', 'The tears streak behind her like a lightning trail.'),
  HERALD('stormlancer', 'swift-herald', 'The Swift Herald', 'bx_storm_4', 'Storm', 'A bell that sounds a moment before she arrives.', 'Spare: ride behind her until she tires.'),
  // ── Radiance ──
  B('cantor', 'lair2', 'saint-who-wasnt', 'The Saint Who Wasn’t', 'construct', 'bx_gargoyle', 'Radiance', 15000,
    ['Phase 1: Fires volleys from range.', 'Phase 2: Blinds with holy light.', 'Phase 3: Turns to stone and reflects attacks.', 'Rains black tears on the ground.'],
    'As it is hurt the fake relics fall off until only the true one is left.', 'A relic-golem of false saints’ bones.'),
  B('cantor', 'nemesis', 'lucan-brightwater', 'Inquisitor Lucan Brightwater', 'humanoid', 'bx_abbot', 'Radiance', 14000,
    ['Phase 1: Sweeps the room with a beam.', 'Phase 2: Blinds with holy light.', 'Phase 3: A flash of light heals its whole side.', 'Curses you: less healing for 6s.'],
    'He focuses the great lens; the only safe ground is shadow, and the half-stone’s song makes new shadows.', 'Black tears run from under his smoked spectacles.'),
  HERALD('cantor', 'herald-of-noon', 'The Herald of Noon', 'bx_abbot', 'Radiance', 'A bell that rings noon and never stops.', 'Spare: sing him to sleep in the Heart’s dark.'),
  B('oathbound', 'lair2', 'ser-gallant', 'Ser Gallant the Forsworn', 'humanoid', 'bx_skelknight', 'Radiance', 14000,
    ['Phase 1: A combo that ends in a stun.', 'Phase 2: A flurry of fast cuts.', 'Phase 3: Charges three times in a row.', 'Parries, then strikes back.', 'When his crown is struck off, he rebuilds his body.', 'Rains black tears on the ground.'],
    'He cannot die; hold your guard through his combos until his oath-curse gives out and he yields.', 'Tears run from the crack where his oath-stone used to sit.'),
  B('oathbound', 'nemesis', 'dame-ilsabet', 'Dame Ilsabet', 'humanoid', 'bx_radiance_5', 'Radiance', 14500,
    ['Phase 1: Charges in a straight line.', 'Phase 2: Swings in a wide arc.', 'Phase 3: Blinds with holy light.', 'Blocks attacks from the front.'],
    'She announces every attack aloud; breaking the rules yourself gives a buff she remembers at III-4.', 'Her tears fall straight down like a plumb-line.'),
  HERALD('oathbound', 'sorrow-herald', 'The Sorrow Herald', 'bx_radiance_5', 'Radiance', 'A bell rung once for every vow she makes.', 'Spare: the first oath, or Beatrix’s letter.'),
  // ── Umbral ──
  B('duskweaver', 'lair2', 'the-unremembered', 'The Unremembered', 'spirit', 'bx_umbral_0', 'Umbral', 13500,
    ['Phase 1: Her scream fills the room.', 'Phase 2: Throws smoke and disappears.', 'Phase 3: Drains your life.', 'Rains black tears on the ground.'],
    'Phase 2 it forgets the hero and turns invisible until names are read aloud off the walls.', 'A shape made of everyone Nocturne forgot.'),
  B('duskweaver', 'nemesis', 'oriel-vane', 'Oriel Vane', 'humanoid', 'bx_umbral_4', 'Umbral', 14000,
    ['Phase 1: Teleports between cultists.', 'Phase 2: Raises fallen skeletons.', 'Phase 3: Steals your buffs.', 'Curses you: less healing for 6s.'],
    'He raises echoes of earlier bosses and dodges the attack the hero has used most.', 'He remembers everything. His phials crack one by one.'),
  HERALD('duskweaver', 'herald-of-memory', 'The Herald of Memory', 'bx_umbral_4', 'Umbral', 'A bell that replays the hero’s Act I fights.', 'Spare: offer him the Rest.'),
  B('shade', 'lair2', 'mother-hushweb', 'Mother Hushweb', 'bug', 'bx_spinner', 'Umbral', 13500,
    ['Phase 1: Drops from the ceiling.', 'Phase 2: Webs the room into a maze.', 'Phase 3: Lays eggs that hatch Bog Spiders.', 'Puts out the torches in the room.'],
    'She eats sound: throw stones at the bells and strike while she lunges at the ringing.', 'A vast Night Spider. Her silk drips black.'),
  B('shade', 'nemesis', 'shadow-that-left', 'The Shadow That Left', 'spirit', 'bx_banshee', 'Umbral', 14000,
    ['Phase 1: Vanishes and strikes from behind.', 'Phase 2: Swaps places with you.', 'Phase 3: Becomes immune to damage for 5s.', 'Drains your life.'],
    'It mirrors the hero a beat early and cannot be hurt in darkness: drag the lanterns in.', 'The hero’s own shadow, filled in with black tears.'),
  HERALD('shade', 'herald-of-shadows', 'The Herald of Shadows', 'bx_banshee', 'Umbral', 'A bell in the hero’s own voice.', 'Spare: open your arms and let it back to your heels.'),
  // ── Verdant ──
  B('hedgewitch', 'lair2', 'the-gardener', 'The Gardener', 'plant', 'bx_eldervine', 'Verdant', 14000,
    ['Phase 1: Its vines lash across the arena.', 'Phase 2: Sprouts smaller plants.', 'Phase 3: Roots erupt under your feet.', 'Rains black tears on the ground.'],
    'Its shears cut long lines and prune the hero’s plants first; phase 2 grows the vault into a hedge maze.', 'A topiary giant still pruning a garden nobody wants.'),
  B('hedgewitch', 'nemesis', 'bramblewife-ostara', 'Bramblewife Ostara', 'plant', 'bx_grandmother', 'Verdant', 14000,
    ['Phase 1: Roots erupt under your feet.', 'Phase 2: Spores put you to sleep.', 'Phase 3: Chants to heal other drowned.', 'Black sap floods the roots.'],
    'She heals from the Heartwood unless the hero cuts her sap-grafts with the half-stone’s song.', 'Her sap runs black; her flowers bloom black when she is hurt.'),
  HERALD('hedgewitch', 'herald-of-bloom', 'The Herald of Bloom', 'bx_grandmother', 'Verdant', 'A seed-pod bell that makes everything grow.', 'Spare: sing her a winter.'),
  B('ranger', 'lair2', 'carapace-queen', 'The Carapace Queen', 'bug', 'bx_brood', 'Verdant', 14000,
    ['Phase 1: Rolls at you. Thorns stay in.', 'Phase 2: Lays eggs that hatch Bog Spiders.', 'Phase 3: Erupts the kiln floor.', 'Rains black tears on the ground.'],
    'Shoot the joints between her plates; she burrows and surfaces under the hero.', 'A Thorn Beetle as big as a cart. Her eggs hatch hollow.'),
  B('ranger', 'nemesis', 'aldo-mire', 'Aldo Mire', 'humanoid', 'bx_prophet', 'Verdant', 14000,
    ['Phase 1: Fills the room with sleeping spores.', 'Phase 2: Sprouts Puffcaps around her.', 'Phase 3: The forest itself attacks.', 'Curses you: less healing for 6s.'],
    'The hero’s bow slowly rots (weapon-decay meter); green patches woken by the half-stone mend it.', 'His fungus weeps black; the blight he spreads is the tears.'),
  HERALD('ranger', 'herald-of-rot', 'The Herald of Rot', 'bx_prophet', 'Verdant', 'A bell of hollow wood.', 'Spare: press the Old Rot’s living mould into his hands.'),
  // ── Blade ──
  B('swordsman', 'lair2', 'perfect-parry', 'The Perfect Parry', 'construct', 'bx_blade_2', 'Blade', 14000,
    ['Phase 1: Parries, then strikes back.', 'Phase 2: A flurry of fast cuts.', 'Phase 3: Strikes everyone in a single instant.', 'Rains black tears on the ground.'],
    'It parries everything: feint, throw things, use the room. Phase 2 it learns the hero’s patterns.', 'A fencing automaton. Its joint-oil runs black.'),
  B('swordsman', 'nemesis', 'auguste-vellacourt', 'Ser Auguste Vellacourt', 'humanoid', 'bx_blade_4', 'Blade', 14500,
    ['Phase 1: A flurry of fast cuts.', 'Phase 2: Charges in a straight line.', 'Phase 3: Strikes everyone in a single instant.', 'Parries, then strikes back.', 'When his crown is struck off, he rebuilds his body.', 'Curses you: less healing for 6s.'],
    'Each time he is beaten he says “Again” and resets with a new style; on the third, lower your sword.', 'Champion of the Ladder. His blade weeps black from the tip.'),
  CHIMERA('swordsman', 'chimeras-champion', 'The Chimera’s Champion', 'Vellacourt, its sword-arm, calls “Again”.', 'Spare: yield mid-fight (swordsman.nemesis_fate).'),
  B('samurai', 'lair2', 'the-unsheathed', 'The Unsheathed', 'spirit', 'bx_blade_0', 'Blade', 13500,
    ['Phase 1: A flurry of fast cuts.', 'Phase 2: Reaps in a wide circle.', 'Phase 3: Strikes everyone in a single instant.', 'Curses you: less healing for 6s.'],
    'It cannot be blocked; dodge until it overreaches, then drive it back into its empty sheath.', 'A sword-spirit that has never been put away.'),
  B('samurai', 'nemesis', 'ikeda-shun', 'Lord Ikeda Shun', 'humanoid', 'bx_blade_5', 'Blade', 14500,
    ['Phase 1: Charges three times in a row.', 'Phase 2: A flurry of fast cuts.', 'Phase 3: Strikes everyone in a single instant.', 'Rains black tears on the ground.'],
    'He never sheathes, so he never stops: win by stillness, sheathe and counter-draw when he commits.', 'Warlord of the Ronin Companies. His shadow has too many arms.'),
  CHIMERA('samurai', 'chimeras-blade', 'The Chimera’s Blade', 'Ikeda, its bare sword-arm, finally has a master.', 'Spare: offer him the empty sheath.'),
  // ── Iron ──
  B('knight', 'lair2', 'blank-shield', 'The Blank Shield', 'humanoid', 'bx_iron_3', 'Iron', 14500,
    ['Phase 1: Blocks attacks from the front.', 'Phase 2: Throws a fan of knives.', 'Phase 3: Turns to stone and reflects attacks.', 'Rains black tears on the ground.'],
    'It copies the hero’s arms; phase 2 the scraped-off crests fly as spinning shields.', 'It paints itself blank with black tears.'),
  B('knight', 'nemesis', 'konrad', 'Konrad', 'humanoid', 'bx_iron_4', 'Iron', 15000,
    ['Phase 1: Shakes the mountain with every blow.', 'Phase 2: Orders skeletons to form a shield wall.', 'Phase 3: A slam that knocks you down.', 'Blocks attacks from the front.'],
    'He conducts the Forge hammers in rhythm; lure them onto his own shield-wall. Calls Iron Sentries.', 'Tears run from the seams of Berenika’s armour, never from him.'),
  CHIMERA('knight', 'iron-head', 'The Iron Head', 'Konrad, its iron head and shield-arm.', 'Spare: read him the writ, or Gideon owns his shame.'),
  B('juggernaut', 'lair2', 'beetle-king', 'The Beetle King', 'bug', 'bx_iron_2', 'Iron', 15500,
    ['Phase 1: Bounces to crush you.', 'Phase 2: Charges in a straight line.', 'Phase 3: Shakes off thorns in a ring.', 'Rebuilds itself once unless shattered.'],
    'Each phase knocks off a layer of junk that stays as cover; the last layer is the strike banner.', 'Under the junk its shell is black glass.'),
  B('juggernaut', 'nemesis', 'magda', 'Magda', 'humanoid', 'bx_iron_3', 'Iron', 14500,
    ['Phase 1: Leaves pools of fire.', 'Phase 2: Calls Hollowed villagers from the fields.', 'Phase 3: The whole arena turns to lava.', 'Steals your Embershards.'],
    'She pours molten hollow iron in lines and pays her hollowed miners to fight; knock her purse into the seam.', 'Her coins weep, never her eyes.'),
  CHIMERA('juggernaut', 'furnace-heart', 'The Furnace-Heart', 'Magda, its furnace, coin pouring through its ribs.', 'Spare: seal the furnace, or blow the shift-whistle three times.'),
  // ── Fist ──
  B('monk', 'lair2', 'ninefold-abbot', 'The Ninefold Abbot', 'humanoid', 'bx_fist_3', 'Fist', 14000,
    ['Phase 1: A combo that ends in a stun.', 'Phase 2: Calls the choir. Each drowned monk heals her.', 'Phase 3: Its song confuses you.', 'Rains black tears on the ground.'],
    'Nine monks, each one temper; agree with one and it vanishes. The ninth is grief, and it weeps black.', 'An abbot split into nine tempers.'),
  B('monk', 'nemesis', 'kestrel', 'Kestrel', 'humanoid', 'bx_fist_0', 'Fist', 14000,
    ['Phase 1: A flurry of fast cuts.', 'Phase 2: Leaps across the arena.', 'Phase 3: A combo that ends in a stun.', 'Curses you: less healing for 6s.'],
    'A mirror fight of staff forms; counter from stillness. He grows angrier when the hero won’t strike first.', 'His prayer beads weep black; one breaks each phase.'),
  CHIMERA('monk', 'arms-of-the-chimera', 'The Arms of the Chimera', 'Kestrel, its arms, strikes with the stolen Pit half.', 'Spare: sit down in the middle of the fight.'),
  B('brawler', 'lair2', 'big-mother-ox', 'Big Mother Ox', 'humanoid', 'bx_fist_5', 'Fist', 15000,
    ['Phase 1: Grabs and holds you in place.', 'Phase 2: A slam that knocks you down.', 'Phase 3: Shakes the mountain with every blow.', 'When his crown is struck off, he rebuilds his body.', 'Rains black tears on the ground.'],
    'Knock her down and she gets up; in the last phase stop hitting, catch her and hold her up.', 'The tears pool under her feet like roots.'),
  B('brawler', 'nemesis', 'silas-gaunt', 'Silas Gaunt', 'humanoid', 'bx_guile_3', 'Fist', 14000,
    ['Phase 1: Calls Hollowed villagers from the fields.', 'Phase 2: Throws smoke and disappears.', 'Phase 3: Spits coins that sting.', 'Steals your Embershards.'],
    'A tag-team fight: push the hollowed fighters out of the ring, don’t knock them out.', 'Dry as dust. The tears are in his money.'),
  CHIMERA('brawler', 'promoters-corner', 'The Promoter’s Corner', 'Silas, its chest and voice, calls the rounds.', 'Spare: throw in Pops’s towel.'),
  // ── Hunt ──
  B('huntsman', 'lair2', 'swollen-queen', 'The Swollen Queen', 'bug', 'bx_brood', 'Hunt', 15000,
    ['Phase 1: Grabs and holds you in place.', 'Phase 2: Releases a swarm that drains health.', 'Phase 3: Lays eggs that hatch Bog Spiders.', 'Rains black tears on the ground.'],
    'Shoot the swollen sacs on her back; she deflates with a long, rude noise.', 'A tick the size of a hill, swollen with tears.'),
  B('huntsman', 'nemesis', 'corva-ashby', 'Corva Ashby', 'humanoid', 'bx_hunt_4', 'Hunt', 14000,
    ['Phase 1: Fires a bolt when it sees you.', 'Phase 2: Lays traps around the arena.', 'Phase 3: Fires volleys from range.', 'Marks you for its allies.'],
    'A crossbow duel among the trophy cases; shoot out the hooks so the mounted heads fall on her side.', 'Tears run from the glass eyes of her trophies.'),
  CHIMERA('huntsman', 'antlered-chimera', 'The Antlered Chimera', 'Corva, its antlers and its aim.', 'Spare: offer her the Great Hunt’s tine.'),
  B('falconer', 'lair2', 'grandmother-talon', 'Grandmother Talon', 'flyer', 'bx_hunt_1', 'Hunt', 13500,
    ['Phase 1: Dives from the roof.', 'Phase 2: Her murder of crows dives at you.', 'Phase 3: Gusts of wind push you toward the edge.', 'Blinds with holy light.'],
    'A duel in the air with the hero’s hawk; when the hawk tears her tear-hood away, she stops.', 'A hood of tears covers her eyes, so she dives at sound.'),
  B('falconer', 'nemesis', 'the-hooded-man', 'The Hooded Man', 'humanoid', 'bx_hunt_4', 'Hunt', 14000,
    ['Phase 1: Her murder of crows dives at you.', 'Phase 2: Its touch slows you.', 'Phase 3: Throws smoke and disappears.', 'Curses you: less healing for 6s.'],
    'He hoods the hero’s hawk and drapes the ring in calm; break the hood on each standing stone.', 'His hood is wet on the inside.'),
  CHIMERA('falconer', 'eyes-of-the-chimera', 'The Eyes of the Chimera', 'Teodor, its hooded eyes.', 'Spare: take the hood off and let him be frightened.'),
  // ── Guile ──
  B('jester', 'lair2', 'the-auditor', 'The Auditor', 'construct', 'bx_engine', 'Guile', 14500,
    ['Phase 1: Spits coins that sting.', 'Phase 2: Steals your Embershards.', 'Phase 3: Overheats. Hit its back while it vents.', 'Rains black tears on the ground.'],
    'Every hit is “charged” and paid back with interest at the end of a phase unless the abacus pillars are smashed.', 'A ledger-golem. Its coins are black pearls.'),
  B('jester', 'nemesis', 'harlequin-sorrow', 'Harlequin Sorrow', 'humanoid', 'bx_guile_5', 'Guile', 14000,
    ['Phase 1: Throws knives. Steals Embershards.', 'Phase 2: Chants to heal other drowned.', 'Phase 3: Its song confuses you.', 'Swaps places with you.'],
    'The claque laughs on cue and every laugh heals him; make them laugh off his cue.', 'He never weeps; black pearls drop from his sleeves.'),
  CHIMERA('jester', 'the-last-laugh', 'The Last Laugh', 'Sorrow’s white mask is its face.', 'Spare: break the jar labelled “H. Sorrow, aged seven”.'),
  B('corsair', 'lair2', 'captain-nobody', 'Captain Nobody', 'spirit', 'bx_guile_4', 'Guile', 13500,
    ['Phase 1: Throws smoke and disappears.', 'Phase 2: Lights a ring of lanterns. Stay inside the light.', 'Phase 3: Vanishes in smoke and strikes from behind.', 'Lures you toward deep water.'],
    'He cannot be targeted until called by name; read it off the wreck’s clues between phases.', 'A ghost captain with no name and no face.'),
  B('corsair', 'nemesis', 'admiral-saltmarsh', 'Admiral Saltmarsh', 'humanoid', 'bx_guile_3', 'Guile', 14500,
    ['Phase 1: Floods the arena with ooze.', 'Phase 2: Spits seeds that grow Snapvines.', 'Phase 3: Spits coins that sting.', 'Splits into four slimes when hit hard.', 'Steals your Embershards.'],
    'The tide rises a tier each phase; he throws pearls that hatch into hollow Mimic Slimes.', 'The pearl in his ear swells as he fights.'),
  CHIMERA('corsair', 'saltmarshs-last-sale', 'Saltmarsh’s Last Sale', 'His flagship’s figurehead is its face.', 'Spare: give the name back to the wharf-boy underneath.'),
  // ── Song ──
  B('bard', 'lair2', 'organ-that-ate-a-choir', 'The Organ That Ate a Choir', 'construct', 'bx_song_2', 'Song', 15000,
    ['Phase 1: Her scream fills the room.', 'Phase 2: Fires volleys from range.', 'Phase 3: A crescendo that stuns everyone.', 'Rains black tears on the ground.'],
    'The floor is its keyboard; the right chord shuts its pipes before they blast.', 'Black tears clog its bellows.'),
  B('bard', 'nemesis', 'impresario-marchetti', 'Impresario Marchetti', 'humanoid', 'bx_song_3', 'Song', 14000,
    ['Phase 1: Buffs its allies with music.', 'Phase 2: Drops from the ceiling.', 'Phase 3: Its song confuses you.', 'Buys a song: steals your buffs.'],
    'He conducts the stage: trapdoors, flying flats, a falling chandelier. Improvise off the beat.', 'His black-tear ink runs off the score.'),
  CHIMERA('bard', 'the-last-performance', 'The Last Performance', 'Marchetti’s baton is its tail.', 'Spare: write a rest into his song.'),
  B('skald', 'lair2', 'shriek-mother', 'Shriek-Mother', 'flyer', 'bx_song_1', 'Song', 13500,
    ['Phase 1: Dives from the roof.', 'Phase 2: Screams to stun anyone nearby.', 'Phase 3: Screeches to scramble your controls.', 'Rains black tears on the ground.'],
    'She shrieks the hero’s last attack back as an echo; a drum-beat breaks it.', 'The eldest harpy. Her shrieks scatter tear-droplets that mute.'),
  B('skald', 'nemesis', 'ulf-the-unsung', 'Ulf the Unsung', 'humanoid', 'bx_song_3', 'Song', 14500,
    ['Phase 1: Shakes the mountain with every blow.', 'Phase 2: A crescendo that stuns everyone.', 'Phase 3: Calls Hollowed villagers from the fields.', 'Curses you: less healing for 6s.'],
    'Every drumbeat comes back three times as a shockwave; a war-cry cancels an echo.', 'He never weeps; his drum does.'),
  CHIMERA('skald', 'the-unsung-chimera', 'The Unsung Chimera', 'A war-drum for a chest.', 'Spare: give him back his voice.'),
];

/** Nemeses yield in Act I (they escape) and in Act III (spare or destroy): the story decides, not the killing blow. */
/**
 * Set-piece rules from Claude 4's mapping (docs/systems/ARENA_HAZARDS.md §5). Each line becomes a boss hook; the room
 * objects that go with them are in hazards.ts (HC_HAZARDS). Hask's lines are written into his entry above.
 */
const SET_PIECE_LINES: Record<string, string[]> = {
  'cb_provost-morrow': ['Heals from the vents.'],
  'cb_still-reflection': ['Stunned when knocked into stone.'],
  'cb_hundredth-warden': ['Charges come back at it.'],
  'cb_torvald-wallbreaker': ['Stunned when knocked into stone.'],
  'cb_seraphine-cold': ['Hurt by turned vents.'],
  'cb_perpetual-engine': ['Shielded while the pillars stand.'],
  'cb_volta-sterne': ['Hurt by turned vents.'],
  'cb_cass-vantor': ['Charges come back at it.'],
  'cb_shadow-that-left': ['Can only be hurt in the light.'],
  'cb_bramblewife-ostara': ['Heals from the vents.'],
  'cb_auguste-vellacourt': ['Yields on flag swordsman.sword_lowered.'],
  'cb_the-unsheathed': ['Stunned when knocked into stone.', 'Yields when stunned by stone in its last phase.'],
  'cb_ikeda-shun': ['Charges come back at it.'],
  'cb_konrad': ['Hurt by turned vents.'],
  'cb_the-hooded-man': ['Calms the room while the stones stand.'],
  'cb_the-auditor': ['Pays back every hit unless the pillars fall.'],
  'cb_the-unremembered': ['From phase 2, cannot be targeted until flag duskweaver.names_read.'],
  'cb_captain-nobody': ['Cannot be targeted until flag corsair.nobody_named.'],
};

/** Slogs at typical gear (Claude 5's boss check: 240–400 s against a ~100 s median): −30% health. */
const HP_TRIM: Record<string, number> = { 'cb_torvald-wallbreaker': 0.7, 'cb_dame-ilsabet': 0.7, 'cb_admiral-saltmarsh': 0.7, cb_konrad: 0.7, 'cb_ser-gallant': 0.8 };

export const HC_CAMPAIGN_BOSSES: CampaignBoss[] = RAW
  .map((b) => (b.slot === 'nemesis' && !b.abilities.some((a) => /yields/i.test(a)) ? { ...b, abilities: [...b.abilities, 'Yields when beaten: escapes.'] } : b))
  .map((b) => (SET_PIECE_LINES[b.id] ? { ...b, abilities: [...b.abilities, ...SET_PIECE_LINES[b.id]] } : b))
  .map((b) => (HP_TRIM[b.id] ? { ...b, hpMult: HP_TRIM[b.id] } : b));

/** Lair 1 per class: the realm mini named for it in docs/lore/hollow-crown/02-realms.md ("Minis:" lines). */
export const HC_LAIR1: Record<string, string> = {
  arcanist: 'bx_ash_3', reaver: 'bx_ash_4', warden: 'bx_rime_3', rimecaller: 'bx_rime_4',
  stormlancer: 'bx_storm_3', sparkwright: 'bx_storm_4', oathbound: 'bx_radiance_3', cantor: 'bx_radiance_4',
  shade: 'bx_umbral_3', duskweaver: 'bx_umbral_4', ranger: 'bx_verdant_3', hedgewitch: 'bx_verdant_4',
  swordsman: 'bx_blade_3', samurai: 'bx_blade_4', knight: 'bx_iron_3', juggernaut: 'bx_iron_4',
  brawler: 'bx_fist_3', monk: 'bx_fist_4', falconer: 'bx_hunt_3', huntsman: 'bx_hunt_4',
  corsair: 'bx_guile_3', jester: 'bx_guile_4', skald: 'bx_song_3', bard: 'bx_song_4',
};

