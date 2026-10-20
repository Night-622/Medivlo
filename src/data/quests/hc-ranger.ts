/**
 * Hollow Crown: the RANGER campaign (docs/lore/hollow-crown/06-outlines/verdant.md). Act I in the Thornwilds
 * (area:verdant-frontier) and the Act II class thread in Concordia. Zones: -1 Wayfarer’s Rest, -2 the Thornwilds,
 * -3 the Bloomfen, -4 the Rotwood. Owner: Claude 4.
 */
import type { NarrativeCondition, QuestDef } from '@/core';

const RG: NarrativeCondition = { heroClass: 'ranger' };
const done = (q: `quest:${string}`): NarrativeCondition => ({ questCompleted: q });
const req = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: [RG, ...c] });
const A1 = { act: 'act1' as const, campaign: 'ranger', chapter: 'The Thornwilds' };
const A2 = { act: 'act2' as const, campaign: 'ranger', chapter: 'Concordia' };
const A3 = { act: 'act3' as const, campaign: 'ranger', chapter: 'The Heart' };
const Z1 = 'zone:verdant-frontier-1' as const, Z2 = 'zone:verdant-frontier-2' as const, Z3 = 'zone:verdant-frontier-3' as const, Z4 = 'zone:verdant-frontier-4' as const;
const L1 = 'inst:verdant-frontier-lair-1' as const, L2 = 'inst:verdant-frontier-lair-2' as const, L3 = 'inst:verdant-frontier-lair-3' as const;
const HB = 'npc:holt-barrow' as const, AM = 'npc:aldo-mire' as const;

const quests: QuestDef[] = [
  // ======================= ACT I: main (I-1 … I-10)
  {
    ...A1, id: 'quest:ranger-the-bell-in-the-thorns', name: 'The Bell in the Thorns', type: 'main', region: Z1, giver: HB,
    summary: 'Night watch at Wayfarer’s Rest. Holt had just got to the part with the Circle witch when a bell rang somewhere very far away, and every path in the Thornwilds moved at once.',
    requires: RG, autoStart: true, firstStage: 'ladders',
    stages: [
      {
        id: 'ladders', journal: 'Thorn Beetles are swarming up the camp’s rope-ladders. Something in your chest is singing, and it smells of leaf-mould.',
        onEnter: [{ openDialogue: 'dialogue:ranger-watch-night' }],
        objectives: [{ id: 'beetles', text: 'Knock the Thorn Beetles off the rope-ladders', kill: 'bx_verdant_1', count: 4, marker: { landmark: 'landmark:holt-lookout' } }],
        onComplete: [{ openDialogue: 'dialogue:ranger-bell-rings' }],
        next: 'holt',
      },
      {
        id: 'holt', journal: 'The ladders are clear. Holt is up on the lookout, staring out at a forest that has rearranged itself in the dark.',
        objectives: [{ id: 'holt', text: 'Climb up to Holt at the lookout', talk: HB, marker: { landmark: 'landmark:holt-lookout' } }],
        onComplete: [{ setFlag: 'ranger.bell_heard', value: true }],
        next: 'paths',
      },
      {
        id: 'paths', journal: 'Holt has gone down the lookout steps two at a time, to the map-stone at the camp gate, to see how far the paths have moved. He did not say follow. He did not need to.',
        objectives: [{ id: 'stone', text: 'Follow Holt down to the map-stone', reach: 'landmark:ranger-map-stone', marker: { landmark: 'landmark:ranger-map-stone' } }],
        next: 'map',
      },
      {
        id: 'map', journal: 'The Wayfarers’ map-stone, cut with every path in the Thornwilds. Holt is reading it by lantern-light, and his face is doing something unusual.',
        objectives: [{ id: 'holt', text: 'Read the map-stone with Holt', talk: HB, marker: { landmark: 'landmark:ranger-map-stone' } }],
        onComplete: [{ startQuest: 'quest:ranger-walk-the-ways' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-wildheart', 'lore:hc-wayfarers'] },
  },
  {
    ...A1, id: 'quest:ranger-walk-the-ways', name: 'Walk the Ways', type: 'main', region: Z2, giver: HB,
    summary: 'The trails moved overnight, all of them. Holt wants the five old waymarks re-blazed before anyone walks off the edge of the map.',
    requires: req(done('quest:ranger-the-bell-in-the-thorns')), firstStage: 'blazes',
    stages: [
      {
        id: 'blazes', journal: 'Five waymarks out in the Thornwilds, each one a Wayfarer blaze cut in a tree. Find them where the paths have put them now.',
        objectives: [{ id: 'blazes', text: 'Re-blaze the old waymarks', interact: 'obj:wayfarer-blaze-*', count: 5, marker: { place: Z2 } }],
        next: 'grey',
      },
      {
        id: 'grey', journal: 'Past the fifth waymark the bramble is grey and brittle, dead without having died. Holt will want more than “grey”. Walk into it and look.',
        objectives: [{ id: 'grey', text: 'Look into the grey blight past the fifth waymark', interact: 'obj:ranger-blight-clue-*', count: 3, marker: { place: Z2 } }],
        next: 'report',
      },
      {
        id: 'report', journal: 'At the fifth waymark the bramble is grey with blight, and black tears are beaded on the thorns like dew.',
        objectives: [{ id: 'holt', text: 'Tell Holt about the blight', talk: HB, marker: { landmark: 'landmark:holt-lookout' } }],
        onComplete: [{ startQuest: 'quest:ranger-the-wallow' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40, lore: ['lore:hc-thornwilds'] },
  },
  {
    ...A1, id: 'quest:ranger-the-wallow', name: 'The Wallow', type: 'main', region: Z2, giver: HB,
    summary: 'Something is tearing up the Wayfarers’ supply trail and eating whole carts, wheels and all. It is starving, and it is huge.',
    requires: req(done('quest:ranger-walk-the-ways')), firstStage: 'carts',
    stages: [
      {
        id: 'carts', journal: 'Two supply carts lie wrecked on the trail. Read the tracks.',
        objectives: [{ id: 'carts', text: 'Read the tracks at the wrecked carts', interact: 'obj:eaten-cart-*', count: 2, marker: { place: Z2 } }],
        next: 'wallow',
      },
      {
        id: 'wallow', journal: 'Tusks, hooves, and a trail of grey moss, leading down into the Mossback Wallow.',
        objectives: [{ id: 'wallow', text: 'Go down into the Mossback Wallow', reach: L1, marker: { place: Z2 } }],
        next: 'boar',
      },
      {
        id: 'boar', journal: 'The mud slows you. The moss on its back heals it. Shoot the moss off, patch by patch.',
        objectives: [{ id: 'boar', text: 'Defeat the Mossback Boar', kill: 'bx_verdant_3', count: 1 }],
        next: 'carcass',
      },
      {
        id: 'carcass', journal: 'The Mossback Boar is down, and the Wallow is quiet. It was all ribs under the moss.',
        objectives: [{ id: 'carcass', text: 'Decide what to do with the boar', interact: 'obj:mossback-carcass' }],
        next: 'report',
      },
      {
        id: 'report', journal: 'The trail is safe again.',
        objectives: [{ id: 'holt', text: 'Report to Holt', talk: HB, marker: { landmark: 'landmark:holt-lookout' } }],
        onComplete: [{ startQuest: 'quest:ranger-the-rotking-returns' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 80, hcItems: [{ item: 'i_roast', qty: 2 }] },
  },
  {
    ...A1, id: 'quest:ranger-the-rotking-returns', name: 'The Rotking Returns', type: 'main', region: Z1, giver: AM,
    summary: 'Aldo Mire, Holt’s oldest friend, lost a year ago in the Rotwood, has walked back into camp laughing, with shelf-fungus in his beard and a basket of perfect mushrooms.',
    requires: req(done('quest:ranger-the-wallow')), firstStage: 'aldo',
    stages: [
      {
        id: 'aldo', journal: 'The whole camp is round the fire. Aldo Mire is back, and he has brought supper.',
        objectives: [{ id: 'aldo', text: 'Meet Aldo Mire at the fire', talk: AM, marker: { landmark: 'landmark:wayfarer-fire' } }],
        next: 'walk',
      },
      {
        id: 'walk', journal: 'Aldo wants to see his old vegetable plot, out past the edge of camp where the bramble starts. He has taken your arm, as if you were the one who needed help walking.',
        objectives: [{ id: 'plot', text: 'Walk Aldo out to his old plot', reach: 'landmark:ranger-aldo-plot', marker: { landmark: 'landmark:ranger-aldo-plot' } }],
        next: 'plot',
      },
      {
        id: 'plot', journal: 'Aldo’s old plot, where he grew leeks in rows for thirty years. Something has happened to it.',
        objectives: [{ id: 'aldo', text: 'Talk with Aldo at his old plot', talk: AM, marker: { landmark: 'landmark:ranger-aldo-plot' } }],
        next: 'holt',
      },
      {
        id: 'holt', journal: 'Holt hugged Aldo for a very long time. Now he has gone up to the lookout on his own.',
        objectives: [{ id: 'holt', text: 'Find Holt at the lookout', talk: HB, marker: { landmark: 'landmark:holt-lookout' } }],
        onComplete: [{ setFlag: 'ranger.aldo_home', value: true }, { startQuest: 'quest:ranger-the-burning-line' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-aldo-mire'] },
  },
  {
    ...A1, id: 'quest:ranger-the-burning-line', name: 'The Burning Line', type: 'main', region: Z3, giver: HB,
    summary: 'An envoy of the Root Circle has come out from Rootholme with an order: burn a firebreak through the Bloomfen before the blight reaches the city. The Bloomkin live in the fen.',
    requires: req(done('quest:ranger-the-rotking-returns')), firstStage: 'envoy',
    stages: [
      {
        id: 'envoy', journal: 'The Circle’s envoy is waiting at the edge of the Bloomfen with a map, a torch and a great deal of patience.',
        objectives: [{ id: 'envoy', text: 'Hear the Root Circle’s envoy', talk: 'npc:primula-vetch', marker: { landmark: 'landmark:burning-line' } }],
        next: 'stakes',
      },
      {
        id: 'stakes', journal: 'The envoy has staked out where the firebreak would run, with little red flags on sticks. Walk the line before you decide anything.',
        objectives: [{ id: 'stakes', text: 'Walk the staked line of the firebreak', interact: 'obj:ranger-firebreak-stake-*', count: 3, marker: { landmark: 'landmark:burning-line' } }],
        next: 'cattail',
      },
      {
        id: 'cattail', journal: 'The line runs straight through the fen. Old Cattail, the Bloomkin counter, is at its stone, and it would like a word before anyone lights anything.',
        objectives: [{ id: 'cattail', text: 'Hear Old Cattail before the line is decided', talk: 'npc:old-cattail', marker: { landmark: 'landmark:bloomkin-census-stone' } }],
        next: 'vote',
      },
      {
        id: 'vote', journal: 'The Wayfarers, the envoy and the Bloomkin have all come to the line. Holt says the hero with the stone in their chest gets the first word.',
        objectives: [{ id: 'vote', text: 'Decide the line at the Bloomfen', when: { flag: 'ranger.line' }, marker: { landmark: 'landmark:burning-line' } }],
        onComplete: [{ startQuest: 'quest:ranger-the-beetle-mound' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-root-circle', 'lore:hc-bloomkin'] },
  },
  {
    ...A1, id: 'quest:ranger-the-beetle-mound', name: 'The Beetle Mound', type: 'main', region: Z3, giver: HB,
    summary: 'Whatever was decided at the line, the Thorn Beetles are coming, more of them than anyone has ever seen. They are eating the living wood they should only eat dead.',
    requires: req(done('quest:ranger-the-burning-line')), firstStage: 'mound',
    stages: [
      {
        id: 'mound', journal: 'The beetles all come out of one great mound at the far edge of the Bloomfen.',
        objectives: [{ id: 'enter', text: 'Go down into the Beetle Mound', reach: L2, marker: { place: Z3 } }],
        onComplete: [{ openDialogue: 'dialogue:ranger-beetle-mound' }],
        next: 'eggs',
      },
      {
        id: 'eggs', journal: 'The Mound’s chambers are full of eggs, laid in clutches, and something is wrong with all of them. Look before you go deeper.',
        objectives: [{ id: 'eggs', text: 'Look at the egg-clutches in the Mound’s chambers', interact: 'obj:ranger-hollow-egg-*', count: 3 }],
        next: 'queen',
      },
      {
        id: 'queen', journal: 'The Carapace Queen is as big as a cart. Shoot the joints between her plates, and watch the ground.',
        objectives: [{ id: 'queen', text: 'Defeat the Carapace Queen', kill: 'cb_carapace-queen', count: 1 }],
        next: 'spores',
      },
      {
        id: 'spores', journal: 'In the heart of the mound, where the eggs were, something grey is growing.',
        objectives: [{ id: 'spores', text: 'Look at what is growing in the mound', interact: 'obj:beetle-mound-spores' }],
        onComplete: [{ setFlag: 'ranger.spores_found', value: true }, { startQuest: 'quest:ranger-the-rotkings-crown' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 120 },
  },
  {
    ...A1, id: 'quest:ranger-the-rotkings-crown', name: 'The Rotking’s Crown', type: 'main', region: Z4, giver: HB,
    summary: 'The spores in the Beetle Mound were sown on purpose, in neat rows, the way Aldo always planted. He has gone back into the Rotwood.',
    requires: req(done('quest:ranger-the-beetle-mound')), firstStage: 'trail',
    stages: [
      {
        id: 'trail', journal: 'Aldo always blazed his trail. Even now, even going into the Rotwood to do whatever he is doing, he will have cut his marks. Follow them in.',
        objectives: [{ id: 'trail', text: 'Follow Aldo’s blazes into the Rotwood', interact: 'obj:ranger-aldo-trail-*', count: 3, marker: { place: Z4 } }],
        next: 'rotwood',
      },
      {
        id: 'rotwood', journal: 'Bloomkin stand in the grey Rotwood, hollow and staring. They are not Bloomkin any more. They have Aldo’s fungus on them.',
        objectives: [{ id: 'hollow', text: 'Fight through the hollowed Bloomkin of the Rotwood', kill: 'bx_verdant_0', count: 4, marker: { place: Z4 } }],
        next: 'aldo',
      },
      {
        id: 'aldo', journal: 'At the edge of the Rotting Glade, Aldo Mire sits on a throne of fallen trunks with a crown of shelf-fungus on his head.',
        objectives: [{ id: 'aldo', text: 'Face Aldo at the edge of the Rotting Glade', talk: AM, marker: { landmark: 'landmark:rotking-throne' } }],
        next: 'holt',
      },
      {
        id: 'holt', journal: 'Aldo has gone into the Rotting Glade, where the Rot half lies. Someone has to tell Holt.',
        objectives: [{ id: 'holt', text: 'Tell Holt about Aldo', talk: HB, marker: { landmark: 'landmark:holt-lookout' } }],
        onComplete: [{ setFlag: 'ranger.aldo_turned', value: true }, { startQuest: 'quest:ranger-the-rotting-glade' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-black-sap'] },
  },
  {
    ...A1, id: 'quest:ranger-the-rotting-glade', name: 'The Rotting Glade', type: 'main', region: L3, giver: HB,
    summary: 'The Rot half lies in the dead glade at the heart of the Rotwood, where the trees stand up only out of habit. Aldo is already there.',
    requires: req(done('quest:ranger-the-rotkings-crown')), firstStage: 'glade',
    stages: [
      {
        id: 'glade', journal: 'Into the Rotting Glade. Nothing moves. Nothing grows. Your half-stone is singing, low and brown, from the middle of it.',
        objectives: [{ id: 'enter', text: 'Enter the Rotting Glade', reach: L3, marker: { place: Z4 } }],
        next: 'aldo',
      },
      {
        id: 'aldo', journal: 'Trees fall on his word, spores drift, and your bow rots in your hands. Keep to the green the half-stone wakes.',
        objectives: [{ id: 'aldo', text: 'Face Aldo Mire, the Rotking', kill: 'cb_aldo-mire', count: 1 }],
        next: 'stone',
      },
      {
        id: 'stone', journal: 'Aldo sank into the leaf-mould like a man into a bath, and was gone. The Rot half is lying in the grey where he sat.',
        objectives: [{ id: 'stone', text: 'Claim the Rot half', interact: 'obj:verdant-frontier-halfstone' }],
        onComplete: [{ setFlag: 'ranger.halfstone', value: true }, { startQuest: 'quest:ranger-the-last-waymark' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, skillPoints: 1, lore: ['lore:hc-half-stones'] },
  },
  {
    ...A1, id: 'quest:ranger-the-last-waymark', name: 'The Last Waymark', type: 'main', region: Z1, giver: HB,
    summary: 'Aldo has gone under the roots, towards the Thorn Gate. The half-stone in your hand can open it. Holt is waiting at the lookout with his pack on.',
    requires: req(done('quest:ranger-the-rotting-glade')), firstStage: 'farewell',
    stages: [
      {
        id: 'farewell', journal: 'Holt is sitting on the lookout steps, sharpening something that does not need sharpening.',
        objectives: [{ id: 'holt', text: 'Speak with Holt', talk: HB, marker: { landmark: 'landmark:holt-lookout' } }],
        next: 'blaze',
      },
      {
        id: 'blaze', journal: 'Every Wayfarer cuts their first blaze of their own on the gate road, on the Blaze Oak, before they go out of the Thornwilds. Nobody has cut one there in thirty years.',
        objectives: [{ id: 'oak', text: 'Cut your first blaze on the Blaze Oak', interact: 'obj:ranger-first-blaze', marker: { landmark: 'landmark:ranger-blaze-oak' } }],
        next: 'road',
      },
      {
        id: 'road', journal: 'The last waymark on the Wayfarers’ road points one way: to the Thorn Gate.',
        objectives: [{ id: 'gate', text: 'Walk the road to the Thorn Gate', reach: 'area:verdant-gate', marker: { place: 'area:verdant-gate' } }],
        onComplete: [{ startQuest: 'quest:ranger-the-thorn-gate' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:ranger-the-thorn-gate', name: 'The Thorn Gate (wilds side)', type: 'main', region: 'area:verdant-gate', giver: HB,
    summary: 'The Elder Grove is wrapped round the Thorn Gate in walls of root: a forest that has forgotten how to let anything die.',
    requires: req(done('quest:ranger-the-last-waymark')), firstStage: 'grove',
    stages: [
      {
        id: 'grove', journal: 'Cut the hollow roots. Touch the old ones with the Rot half, and let them fall.',
        objectives: [{ id: 'grove', text: 'Let the Elder Grove fall', kill: 'bx_verdant_5', count: 1 }],
        next: 'gate',
      },
      {
        id: 'gate', journal: 'The dead roots have crumbled into leaf-mould, and the living ones have let go. The gate is weeping black sap.',
        objectives: [{ id: 'seal', text: 'Open the Thorn Gate with the half-stone', interact: 'obj:verdant-gate-seal' }],
        onComplete: [{ setFlag: 'story.gate_open', value: true }, { setFlag: 'story.act', value: 2 }, { setFlag: 'ranger.act1_done', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 200, lore: ['lore:hc-realm-gates', 'lore:hc-elder-grove'] },
  },

  // ======================= ACT I: side quests (2 per zone)
  {
    ...A1, id: 'quest:ranger-the-salt-thief', name: 'The Salt Thief', type: 'side', region: Z1, giver: 'npc:dunmore-fitch',
    summary: 'For eleven years a red squirrel has stolen the camp’s salt every single day, and Cook Dunmore Fitch has sworn revenge every single day.',
    requires: req(done('quest:ranger-the-bell-in-the-thorns')), firstStage: 'caches',
    stages: [
      {
        id: 'caches', journal: 'The squirrel hides the salt in caches round the camp. Find them and you find its route.',
        objectives: [{ id: 'caches', text: 'Find the squirrel’s salt caches', interact: 'obj:salt-cache-*', count: 3, marker: { landmark: 'landmark:wayfarer-fire' } }],
        next: 'squirrel',
      },
      {
        id: 'squirrel', journal: 'Every cache leads to one old pine, and one very fat red squirrel.',
        objectives: [{ id: 'squirrel', text: 'Deal with the salt thief', interact: 'obj:salt-squirrel', marker: { landmark: 'landmark:wayfarer-fire' } }],
        next: 'hoard',
      },
      {
        id: 'hoard', journal: 'The squirrel in your pack will not stop chattering and pointing its nose out of camp. Eleven years of salt went somewhere. It seems to want you to see.',
        objectives: [{ id: 'hoard', text: 'Let the squirrel show you its hoard', interact: 'obj:ranger-salt-hoard', marker: { landmark: 'landmark:ranger-salt-oak' } }],
        next: 'dunmore',
      },
      {
        id: 'dunmore', journal: 'The squirrel has settled the matter by climbing into your pack. It is still there.',
        objectives: [{ id: 'dunmore', text: 'Tell Dunmore the feud is over', talk: 'npc:dunmore-fitch', marker: { landmark: 'landmark:wayfarer-fire' } }],
        onComplete: [{ setFlag: 'ranger.squirrel_in_pack', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40, hcItems: [{ item: 'i_stew', qty: 2 }] },
  },
  {
    ...A1, id: 'quest:ranger-names-on-the-tree', name: 'Names on the Tree', type: 'side', region: Z1, giver: 'npc:davy-fernsby',
    summary: 'Three new names are to be carved on the camp’s memorial tree this year. One of them is Kit Fernsby’s, and her brother wants it done properly, with her bow hung beneath it.',
    requires: req(done('quest:ranger-walk-the-ways')), firstStage: 'bow',
    stages: [
      {
        id: 'bow', journal: 'Kit fell somewhere in the Thornwilds in the spring. Her bow was never found.',
        objectives: [{ id: 'bow', text: 'Find Kit Fernsby’s bow in the Thornwilds', interact: 'obj:kit-fernsby-bow', marker: { place: Z2 } }],
        next: 'way',
      },
      {
        id: 'way', journal: 'Beside the bow, a blaze, months old, pointing on into the bramble. Kit was not lost when she dropped her bow. She was marking a way.',
        objectives: [{ id: 'way', text: 'Follow Kit’s last blazes', interact: 'obj:ranger-kit-last-blaze', marker: { place: Z2 } }],
        next: 'carve',
      },
      {
        id: 'carve', journal: 'You have Kit’s bow, unstrung and silvered with dew.',
        objectives: [{ id: 'carve', text: 'Hang the bow at the memorial tree', interact: 'obj:memorial-carving', marker: { landmark: 'landmark:wayfarer-memorial-tree' } }],
        next: 'davy',
      },
      {
        id: 'davy', journal: 'Kit Fernsby’s name is on the tree, and her bow hangs under it.',
        objectives: [{ id: 'davy', text: 'Sit with Davy Fernsby', talk: 'npc:davy-fernsby', marker: { landmark: 'landmark:wayfarer-memorial-tree' } }],
        onComplete: [{ setFlag: 'ranger.kit_remembered', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:ranger-the-path-that-likes-him', name: 'The Path That Likes Him', type: 'side', region: Z2, giver: 'npc:cobb-tinsley',
    summary: 'The pedlar Cobb Tinsley has been walking in a circle in the Thornwilds for four days. Every time he turns round, the path turns with him.',
    requires: req(done('quest:ranger-walk-the-ways')), firstStage: 'path',
    stages: [
      {
        id: 'path', journal: 'Walk Cobb’s circle and see where the path bends to follow him.',
        objectives: [{ id: 'bends', text: 'Find where the path bends after Cobb', interact: 'obj:fond-path-*', count: 3, marker: { place: Z2 } }],
        next: 'cobb',
      },
      {
        id: 'cobb', journal: 'The path isn’t lost. It is following him on purpose, like a dog.',
        objectives: [{ id: 'cobb', text: 'Tell Cobb why the path won’t let him go', talk: 'npc:cobb-tinsley', marker: { place: Z2 } }],
        next: 'walk',
      },
      {
        id: 'walk', journal: 'Cobb has his pack on and is setting off for Wayfarer’s Rest at last, very slowly, looking back over his shoulder at the path the whole way.',
        objectives: [{ id: 'pitch', text: 'Walk Cobb in to the pedlars’ pitch at Wayfarer’s Rest', reach: 'landmark:ranger-cobb-pitch', marker: { landmark: 'landmark:ranger-cobb-pitch' } }],
        next: 'stall',
      },
      {
        id: 'stall', journal: 'Cobb is unpacking pins and ribbons and a very good teapot at the camp gate. Behind him, something has happened to the bramble.',
        objectives: [{ id: 'cobb', text: 'See Cobb set up his stall', talk: 'npc:cobb-tinsley', marker: { landmark: 'landmark:ranger-cobb-pitch' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 60 },
  },
  {
    ...A1, id: 'quest:ranger-the-still-tune', name: 'The Still Tune', type: 'side', region: Z2, giver: 'npc:ivo-pennick',
    summary: 'The Wayfarers once had a fiddle tune that held the paths still for one song. Old Ivo Pennick played it for fifty years and has forgotten it. The Bloomkin of the bramble haven’t.',
    requires: req(done('quest:ranger-walk-the-ways')), firstStage: 'hum',
    stages: [
      {
        id: 'hum', journal: 'Somewhere in the bramble, three thickets are humming. Listen to each.',
        objectives: [{ id: 'briars', text: 'Listen to the humming briars', interact: 'obj:humming-briar-*', count: 3, marker: { place: Z2 } }],
        next: 'ivo',
      },
      {
        id: 'ivo', journal: 'Three phrases of a tune, hummed by brambles. Ivo will know what to do with them.',
        objectives: [{ id: 'ivo', text: 'Hum the tune back to Ivo Pennick', talk: 'npc:ivo-pennick', marker: { place: Z2 } }],
        next: 'ford',
      },
      {
        id: 'ford', journal: 'Ivo wants the Still Tune played where it was made for: the Wandering Ford, where the supply carts cross to the Bloomfen, and where the path has not held still for thirty years.',
        objectives: [{ id: 'ford', text: 'Play the Still Tune at the Wandering Ford', interact: 'obj:ranger-ford-stone', marker: { landmark: 'landmark:ranger-wandering-ford' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-still-tune'] },
  },
  {
    ...A1, id: 'quest:ranger-lilies-for-a-wedding', name: 'Lilies for a Wedding', type: 'side', region: Z3, giver: 'npc:dilys-marram',
    summary: 'A fen wedding needs real lilies. Half the lilies in the Bloomfen are Bloomtraps. Dilys Marram is getting married at noon and would like to keep her guests.',
    requires: req(done('quest:ranger-the-rotking-returns')), firstStage: 'lilies',
    stages: [
      {
        id: 'lilies', journal: 'Pick four real lilies. The real ones nod in the wind. The Bloomtraps nod against it.',
        objectives: [{ id: 'lilies', text: 'Pick real lilies in the Bloomfen', interact: 'obj:fen-lily-*', count: 4, marker: { place: Z3 } }],
        next: 'groom',
      },
      {
        id: 'groom', journal: 'Ezra Sedge, still sticky, has news: the groom, his brother Osier, has rowed out to the reed island in the middle of the fen and will not come back. Something about the vows.',
        objectives: [{ id: 'groom', text: 'Fetch the groom from the reed island', interact: 'obj:ranger-wedding-groom', marker: { landmark: 'landmark:ranger-reed-island' } }],
        next: 'dilys',
      },
      {
        id: 'dilys', journal: 'Four lilies, and one very surprised best man, who is fine now, and slightly digested.',
        objectives: [{ id: 'dilys', text: 'Bring the lilies to the bride', talk: 'npc:dilys-marram', marker: { place: Z3 } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 50, hcItems: [{ item: 'i_pie', qty: 2 }] },
  },
  {
    ...A1, id: 'quest:ranger-the-bloomkin-census', name: 'The Bloomkin Census', type: 'side', region: Z3, giver: 'npc:old-cattail',
    summary: 'The Bloomkin of the fen want to count themselves before they decide whose side they are on. Their counter, a solemn bulrush called Old Cattail, keeps losing count.',
    requires: req(done('quest:ranger-the-rotking-returns')), firstStage: 'count',
    stages: [
      {
        id: 'count', journal: 'Four clumps of Bloomkin, scattered through the fen. Count them. Do not let them move while you count.',
        objectives: [{ id: 'count', text: 'Count the Bloomkin of the fen', interact: 'obj:census-bloomkin-*', count: 4, marker: { place: Z3 } }],
        next: 'cattail',
      },
      {
        id: 'cattail', journal: 'You have a number. It is quite a big number.',
        objectives: [{ id: 'cattail', text: 'Give Old Cattail the count', talk: 'npc:old-cattail', marker: { landmark: 'landmark:bloomkin-census-stone' } }],
        onComplete: [{ setFlag: 'ranger.census_counted', value: true }],
        next: 'mint',
      },
      {
        id: 'mint', journal: 'One Bloomkin will not be counted as one. Old Pennyroyal, the water-mint on its stone at the far side of the fen, insists it counts as seventy-seven, because it is seventy-seven years old. The Hollowing was thirty years ago.',
        objectives: [{ id: 'mint', text: 'Ask Old Pennyroyal how it can be seventy-seven', interact: 'obj:ranger-water-mint', marker: { landmark: 'landmark:ranger-mint-stone' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:ranger-the-house-is-just-old', name: 'The House Is Just Old', type: 'side', region: Z4, giver: 'npc:bram-hatchley',
    summary: 'Woodcutter Bram Hatchley will not leave his half-rotted cottage in the Rotwood. “It’s just getting old,” he says, “same as me.”',
    requires: req(done('quest:ranger-the-burning-line')), firstStage: 'keepsake',
    stages: [
      {
        id: 'keepsake', journal: 'Bram will go, if he can take one thing. He can’t decide what.',
        objectives: [{ id: 'keepsake', text: 'Help Bram choose what to keep', interact: 'obj:hatchley-keepsake', marker: { landmark: 'landmark:hatchley-cottage' } }],
        next: 'bram',
      },
      {
        id: 'bram', journal: 'Bram has his one thing under his arm, and he is standing outside his door.',
        objectives: [{ id: 'bram', text: 'Walk Bram out of the Rotwood', talk: 'npc:bram-hatchley', marker: { landmark: 'landmark:hatchley-cottage' } }],
        next: 'edge',
      },
      {
        id: 'edge', journal: 'Slowly, for the knees, out of the grey and towards the green. Bram wants to stop where the Rotwood ends and have a sit.',
        objectives: [{ id: 'edge', text: 'Walk Bram to the edge of the Rotwood', reach: 'landmark:ranger-rotwood-edge', marker: { landmark: 'landmark:ranger-rotwood-edge' } }],
        next: 'stump',
      },
      {
        id: 'stump', journal: 'Bram is sitting on a stump where the first green starts, with his one thing on his knees, and nowhere in particular to go.',
        objectives: [{ id: 'bram', text: 'Sit with Bram at the edge of the Rotwood', talk: 'npc:bram-hatchley', marker: { landmark: 'landmark:ranger-rotwood-edge' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 60 },
  },
  {
    ...A1, id: 'quest:ranger-mushroom-supper', name: 'Mushroom Supper', type: 'side', region: Z4, giver: 'npc:sister-morel',
    summary: 'Sister Morel, the camp’s herbalist, wants three of Aldo’s blight mushrooms from his old supper spot in the Rotwood. They taste wonderful, and she would like to know why.',
    requires: req(done('quest:ranger-the-rotking-returns')), firstStage: 'mushrooms',
    stages: [
      {
        id: 'mushrooms', journal: 'Aldo’s old supper spot is a ring of stones in the grey Rotwood.',
        objectives: [{ id: 'mushrooms', text: 'Gather Aldo’s mushrooms from his supper spot', interact: 'obj:aldo-supper-mushroom-*', count: 3, marker: { place: Z4 } }],
        next: 'morel',
      },
      {
        id: 'morel', journal: 'Three mushrooms, perfect and pale, in your hand.',
        objectives: [{ id: 'morel', text: 'Bring the mushrooms to Sister Morel', talk: 'npc:sister-morel', marker: { landmark: 'landmark:wayfarer-fire' } }],
        next: 'test',
      },
      {
        id: 'test', journal: 'Sister Morel wants one more test. Honest rot eats anything that has finished living. Take a barren mushroom to the Old Rot and see whether it will eat it.',
        objectives: [{ id: 'test', text: 'Lay a barren mushroom on the Old Rot', interact: 'obj:ranger-morel-test', marker: { landmark: 'landmark:old-rot-stump' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_herb', qty: 3 }] },
  },

  // ======================= ACT I: mentor thread (2) and bounties (2)
  {
    ...A1, id: 'quest:ranger-the-old-rot', name: 'The Old Rot', type: 'side', region: Z2, giver: HB,
    summary: 'Holt wants to show you the oldest stump in the Thornwilds: a log that has been rotting, very gently, for a thousand years.',
    requires: req({ trust: HB, value: 'friendly' }, done('quest:ranger-walk-the-ways')), firstStage: 'stump',
    stages: [
      {
        id: 'stump', journal: 'The Old Rot is deep in the Thornwilds, in a grove that should not be there.',
        objectives: [{ id: 'stump', text: 'Walk with Holt to the Old Rot', reach: 'landmark:old-rot-stump', marker: { landmark: 'landmark:old-rot-stump' } }],
        next: 'log',
      },
      {
        id: 'log', journal: 'A fallen giant, soft as cake, with a whole grove growing out of it.',
        objectives: [{ id: 'log', text: 'Kneel at the Old Rot', interact: 'obj:old-rot-log', marker: { landmark: 'landmark:old-rot-stump' } }],
        next: 'holt',
      },
      {
        id: 'holt', journal: 'Holt is sitting on the end of the log, looking pleased with it.',
        objectives: [{ id: 'holt', text: 'Talk with Holt at the Old Rot', talk: HB, marker: { landmark: 'landmark:old-rot-stump' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, skillPoints: 1, lore: ['lore:hc-old-rot'] },
  },
  {
    ...A1, id: 'quest:ranger-holt-and-aldo', name: 'Holt and Aldo', type: 'side', region: Z4, giver: HB,
    summary: 'Holt wants to show you the waymark he and Aldo carved as boys. Then he wants you to find the last one Aldo ever cut.',
    requires: req({ trust: HB, value: 'trusted' }, done('quest:ranger-the-rotkings-crown')), firstStage: 'boys',
    stages: [
      {
        id: 'boys', journal: 'Behind the lookout, low on an old pine, two boys cut their marks fifty years ago.',
        objectives: [{ id: 'boys', text: 'Find Holt and Aldo’s first waymark', interact: 'obj:holt-aldo-waymark', marker: { landmark: 'landmark:holt-lookout' } }],
        next: 'last',
      },
      {
        id: 'last', journal: 'Aldo always blazed his trail, even lost. His last blaze should be in the Rotwood, before the Glade.',
        objectives: [{ id: 'last', text: 'Find Aldo’s last blaze in the Rotwood', interact: 'obj:aldo-last-blaze', marker: { place: Z4 } }],
        next: 'holt',
      },
      {
        id: 'holt', journal: '“Sorry, Holt. It’s so quiet out here.”',
        objectives: [{ id: 'holt', text: 'Tell Holt what Aldo wrote', talk: HB, marker: { landmark: 'landmark:holt-lookout' } }],
        onComplete: [{ setFlag: 'ranger.holt_devotable', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:ranger-bounty-arrow-thieves', name: 'Bounty: the Arrow-Thief Briarlings', type: 'bounty', region: Z2, giver: 'npc:marjory-burrell',
    summary: 'A band of Briarlings has been stealing arrows out of Wayfarer quivers on the trail and using them as toothpicks.',
    requires: req(done('quest:ranger-walk-the-ways')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'They wait in the bramble by the trail and pick quivers like pockets.', objectives: [{ id: 'briarlings', text: 'Defeat the arrow-thief Briarlings', kill: 'bx_verdant_2', count: 6, marker: { place: Z2 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 150 },
  },
  {
    ...A1, id: 'quest:ranger-bounty-old-snapjaw', name: 'Bounty: Old Snapjaw', type: 'bounty', region: Z3, giver: 'npc:marjory-burrell',
    summary: 'A Bloomtrap the size of a cottage has swallowed the Bloomfen ferry punt, and the ferryman is still waiting for it to give it back.',
    requires: req(done('quest:ranger-the-rotking-returns')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'Old Snapjaw lies at the ferry crossing, looking exactly like a lily pad.', objectives: [{ id: 'snapjaw', text: 'Defeat Old Snapjaw', kill: 'bx_verdant_0', count: 1, marker: { place: Z3 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 120 },
  },

  // ======================= ACT II: the class thread (C-1 … C-6) + featured bearers
  {
    ...A2, id: 'quest:ranger-the-hedge-house', name: 'The Hedge House', type: 'class', region: 'vil:thorn', giver: 'npc:teasel-gammon',
    summary: 'The Wayfarers had a waystation in Concordia once, in the days of the Turning: the Hedge House at Thornhollow. Somebody might still be keeping it.',
    requires: req(done('quest:cc-through-the-arch')), autoStart: true, firstStage: 'hedge',
    stages: [
      {
        id: 'hedge', journal: 'The Hedge House is at Thornhollow, in Briar Hollow, if it’s still standing.',
        objectives: [{ id: 'teasel', text: 'Find the Hedge House at Thornhollow', talk: 'npc:teasel-gammon', marker: { landmark: 'landmark:thorn-hedge-house' } }],
        next: 'loft',
      },
      {
        id: 'loft', journal: 'The Wayfarers slept upstairs at the Hedge House, every Turning for a thousand years. Nobody has been up there in thirty, except the bats.',
        objectives: [{ id: 'loft', text: 'Climb up to the Wayfarers’ loft', interact: 'obj:ranger-hedge-loft', marker: { landmark: 'landmark:thorn-hedge-house' } }],
        next: 'nan',
      },
      {
        id: 'nan', journal: 'Teasel says Nan Briar knew Holt’s grandfather, and that she has been waiting more than fifty years for a Barrow to return her ladder.',
        objectives: [{ id: 'nan', text: 'Call on Nan Briar at Briar Cottage', talk: 'npc:nanbriar', marker: { landmark: 'landmark:thorn-briar-cottage' } }],
        onComplete: [{ startQuest: 'quest:ranger-stags-rest' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-verdant-thornhollow'] },
  },
  {
    ...A2, id: 'quest:ranger-stags-rest', name: 'Stag’s Rest', type: 'class', region: 'region:gloam', giver: 'npc:teasel-gammon',
    summary: 'The old Wayfarer ways into the Gloamwood are still blazed, a hundred years faded. They lead to Stag’s Rest, where the Weeping Willow has rotted the glade.',
    requires: req(done('quest:ranger-the-hedge-house')), firstStage: 'ways',
    stages: [
      {
        id: 'ways', journal: 'Old Wayfarer blazes, cut by your own people a hundred years ago, lead into the Gloamwood. Walk them.',
        objectives: [{ id: 'ways', text: 'Walk the old Wayfarer ways into the Gloamwood', interact: 'obj:ranger-old-blaze-*', count: 3, marker: { region: 'region:gloam' } }],
        next: 'log',
      },
      {
        id: 'log', journal: 'The trees round Stag’s Rest are falling and nothing is eating them. A Wayfarer reads rot the way a Circle witch reads a ledger. Read it.',
        objectives: [{ id: 'log', text: 'Read the rot in a fallen log at Stag’s Rest', interact: 'obj:ranger-willow-log', marker: { landmark: 'landmark:gloam-stags-rest' } }],
        next: 'rest',
      },
      {
        id: 'rest', journal: 'The glade at Stag’s Rest is rotten, but not honestly: nothing in it feeds anything.',
        objectives: [{ id: 'lair', text: 'Go to the Weeping Willow at Stag’s Rest', reach: 'inst:sentinel-verdant' }],
        onComplete: [{ startQuest: 'quest:ranger-the-weeping-willow' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:ranger-the-weeping-willow', name: 'The Weeping Willow', type: 'class', region: 'region:gloam', giver: 'npc:teasel-gammon',
    summary: 'The Weeping Willow was planted on the day the Concord was sworn. For thirty years it has wept, and it has not let a single leaf fall.',
    requires: req(done('quest:ranger-stags-rest')), firstStage: 'fight',
    stages: [
      {
        id: 'fight', journal: 'The Willow is the Sentinel of the Verdant school. Win its mark.',
        objectives: [{ id: 'willow', text: 'Defeat the Weeping Willow', kill: 'bx_willow', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-verdant' }],
        next: 'release',
      },
      {
        id: 'release', journal: 'The Willow has stopped weeping. It is trying to say something.',
        objectives: [{ id: 'mark', text: 'Hear the Willow out', when: { flag: 'story.sentinel.verdant' } }],
        next: 'tell',
      },
      {
        id: 'tell', journal: 'The Willow’s leaves fell, and rotted at once, honestly, the first honest rot at Stag’s Rest in thirty years. Nan Briar has known that tree longer than anyone alive.',
        objectives: [{ id: 'nan', text: 'Tell Nan Briar the Willow’s leaves have fallen', talk: 'npc:nanbriar', marker: { landmark: 'landmark:thorn-briar-cottage' } }],
        onComplete: [{ startQuest: 'quest:ranger-the-rotkings-trail' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-verdant-willow'] },
  },
  {
    ...A2, id: 'quest:ranger-the-rotkings-trail', name: 'The Rotking’s Trail', type: 'class', region: 'region:gloam', giver: 'npc:teasel-gammon',
    summary: 'There are grey spores in the Willow’s glade that grew nothing and fed nothing. Aldo’s. They lead deeper into the Gloamwood, towards the glade where the White Stag grieves.',
    requires: req(done('quest:ranger-the-weeping-willow')), firstStage: 'spores',
    stages: [
      {
        id: 'spores', journal: 'Follow Aldo’s barren spores through the Gloamwood.',
        onEnter: [{ openDialogue: 'dialogue:ranger-rotkings-trail' }],
        objectives: [{ id: 'spores', text: 'Track Aldo’s barren spores', interact: 'obj:ranger-barren-spore-*', count: 3, marker: { region: 'region:gloam' } }],
        next: 'glade',
      },
      {
        id: 'glade', journal: 'The spores end at the edge of the Stag’s glade, where the trees are weeping too.',
        objectives: [{ id: 'glade', text: 'Look into the Stag’s glade', interact: 'obj:ranger-stag-glade-edge', marker: { landmark: 'landmark:gloam-stag-glade' } }],
        next: 'teasel',
      },
      {
        id: 'teasel', journal: 'Nan Briar sent Teasel Gammon after you. He walked behind the White Stag in the last procession, and he has come out to the glade road with his oldest pot under his arm.',
        objectives: [{ id: 'teasel', text: 'Find Teasel on the glade road', talk: 'npc:teasel-gammon', marker: { landmark: 'landmark:ranger-glade-camp' } }],
        onComplete: [{ setFlag: 'ranger.trail_followed', value: true }, { startQuest: 'quest:ranger-the-white-stag' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:ranger-the-white-stag', name: 'The White Stag', type: 'class', region: 'region:gloam', giver: 'npc:teasel-gammon',
    summary: 'The White Stag that the Turning procession followed through the Gloamwood is not sick. It is grieving. Aldo is feeding on its grief to rot the whole wood.',
    requires: req(done('quest:ranger-the-rotkings-trail')), firstStage: 'escort',
    stages: [
      {
        id: 'escort', journal: 'The White Stag is waiting for the procession that never came back. Teasel is the last of it on this side of the arch. Bring him to the glade alive.',
        onEnter: [{ escort: 'npc:teasel-gammon', to: 'landmark:gloam-stag-glade' }],
        objectives: [{ id: 'teasel', text: 'Bring Teasel Gammon safely to the Stag’s glade', when: { any: [{ flag: 'escort.teasel-gammon', op: '==', value: 'arrived' }, { flag: 'escort.teasel-gammon', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:gloam-stag-glade' } }],
        next: [{ when: { flag: 'escort.teasel-gammon', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'hear' }],
      },
      {
        id: 'regroup', journal: 'Teasel went down, and two hunters from Hollis Lodge carried him back to the camp, pot and all. He has had a cup of something and says he is ready when you are.',
        onEnter: [{ escort: 'npc:teasel-gammon', to: 'landmark:gloam-stag-glade' }],
        objectives: [{ id: 'teasel', text: 'Try again: bring Teasel to the Stag’s glade', when: { any: [{ flag: 'escort.teasel-gammon', op: '==', value: 'arrived' }, { flag: 'escort.teasel-gammon', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:gloam-stag-glade' } }],
        next: [{ when: { flag: 'escort.teasel-gammon', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'hear' }],
      },
      {
        id: 'hear', journal: 'Teasel has taken off his hat at the edge of the glade. The Stag has lifted its head.',
        objectives: [{ id: 'teasel', text: 'Hear what Teasel sees in the Stag', talk: 'npc:teasel-gammon', marker: { landmark: 'landmark:gloam-stag-glade' } }],
        next: 'glade',
      },
      {
        id: 'glade', journal: 'Into the glade where the White Stag stands weeping.',
        objectives: [{ id: 'lair', text: 'Go into the White Stag’s glade', reach: 'inst:sentinel-hunt', marker: { landmark: 'landmark:gloam-stag-glade' } }],
        next: 'stag',
      },
      {
        id: 'stag', journal: 'The Stag is the Sentinel of the Hunt school. The Hunt bearers cannot win their mark while Aldo’s rot keeps it grieving.',
        objectives: [{ id: 'stag', text: 'Free the White Stag', kill: 'bx_stag', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-hunt' }, { setFlag: 'story.bearer.huntsman', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-ranger-stag-grief'] },
  },
  {
    ...A2, id: 'quest:ranger-holts-blaze', name: 'Holt’s Blaze', type: 'class', region: 'vil:brind', giver: HB,
    summary: 'Holt doesn’t write. But somebody has cut a fresh Wayfarer blaze into the stone on the Concordia side of the Verdant arch.',
    requires: req(done('quest:ranger-the-white-stag')), autoStart: true, firstStage: 'blaze',
    stages: [
      {
        id: 'blaze', journal: 'A blaze on the Verdant arch at the Gate Circle, still white where the knife went in.',
        objectives: [{ id: 'blaze', text: 'Read the blaze on the Verdant arch', interact: 'obj:ranger-holt-blaze', marker: { landmark: 'landmark:gate-circle' } }],
        next: 'court',
      },
      {
        id: 'court', journal: 'Your half-stone has been tugging towards the Stone Court all day, towards the Heartwood half and the one who carries it.',
        objectives: [{ id: 'court', text: 'Sit with the Hedgewitch bearer at the Stone Court', interact: 'obj:verdant-court-bench', marker: { landmark: 'landmark:stone-court' } }],
        next: 'reply',
      },
      {
        id: 'reply', journal: 'Holt walked all the way to the gate to say “I walked this far.” A Wayfarer answers a blaze with a blaze.',
        objectives: [{ id: 'reply', text: 'Cut your answer beside Holt’s blaze', interact: 'obj:ranger-reply-blaze', marker: { landmark: 'landmark:gate-circle' } }],
        onComplete: [{ setFlag: 'story.act2_ready', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:ranger-the-hooded-stag', name: 'The Hooded Stag', type: 'side', region: 'region:gloam', giver: 'npc:bearer-falconer',
    summary: 'The Falconer bearer wants to hood the White Stag’s grief, the way you hood a hawk, so that it can’t run. You think it ought to be let run until it is run out.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'run',
    stages: [
      {
        id: 'run', journal: 'Perrin Featherstone is in the Gloamwood with a hood the size of a bucket. First, walk the Stag’s running-path, and see where it goes.',
        objectives: [{ id: 'run', text: 'Track the White Stag’s running-path', interact: 'obj:ranger-stag-run-*', count: 3, marker: { region: 'region:gloam' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'The Stag’s path runs in a circle, round and round the place where the procession used to pass. Perrin wants a word.',
        // co-op: if a party member plays the Falconer, they ARE this bearer (the NPC is hidden)
        objectives: [{ id: 'perrin', text: 'Talk to the Falconer bearer', when: { any: [{ flag: 'ranger.perrin_thanked' }, { partyHasClass: 'falconer' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.falconer', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A2, id: 'quest:ranger-the-stags-last-saga', name: 'The Stag’s Last Saga', type: 'side', region: 'region:gloam', giver: 'npc:bearer-skald',
    summary: 'The Skald bearer is losing the White Stag’s saga, a verse a day, as if someone were stealing them. She needs a Ranger to track where the verses went.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'verses',
    stages: [
      {
        id: 'verses', journal: 'Sigrid Drumhallow says the verses go where the Stag has been. Follow its old tracks and look for words.',
        objectives: [{ id: 'verses', text: 'Track the lost verses of the Stag’s saga', interact: 'obj:ranger-saga-verse-*', count: 3, marker: { region: 'region:gloam' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Three verses, found in three strange places. Sigrid will want them back.',
        objectives: [{ id: 'sigrid', text: 'Talk to the Skald bearer', when: { any: [{ flag: 'ranger.sigrid_thanked' }, { partyHasClass: 'skald' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.skald', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  // ======================= ACT III: class quests (III-4 + 3 side)
  {
    ...A3, id: 'quest:ranger-the-herald-of-rot', name: 'The Herald of Rot', type: 'class', region: 'region:heart', giver: 'npc:casimir',
    summary: 'At the top of the Twelve Stairs stands the Hollow King’s Herald in a skirt of shelf-fungus, ringing a bell of hollow wood. It is Aldo Mire, and he has brought supper.',
    requires: req(done('quest:heart-stairs')), autoStart: true, firstStage: 'herald',
    stages: [
      { id: 'herald', journal: 'Aldo has become the Herald of Rot: a hunger that eats everything and feeds nothing.', objectives: [{ id: 'herald', text: 'Face the Herald of Rot', kill: 'cb_herald-of-rot', count: 1, marker: { landmark: 'landmark:twelve-stairs-top' } }], onComplete: [{ openDialogue: 'dialogue:ranger-herald-fate' }], next: 'fate' },
      { id: 'fate', journal: 'Aldo is sitting on the stair in his own grey leaf-mould, like a man in a bath, and he is still hungry.', objectives: [{ id: 'fate', text: 'Decide Aldo’s fate', when: { flag: 'ranger.nemesis_fate' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 3 },
  },
  {
    ...A3, id: 'quest:ranger-holts-last-blaze', name: 'Holt’s Last Blaze', type: 'side', region: 'region:heart', giver: HB,
    summary: 'A Wayfarer leaves a mark wherever they go, Holt always said, so somebody can follow. The head of the Verdant stair has never had a Wayfarer’s mark on it.',
    requires: req(done('quest:heart-stairs')), autoStart: true, firstStage: 'foot',
    stages: [
      { id: 'foot', journal: 'A Wayfarer marks the start of a road before the end of it. Cut a blaze at the foot of the Twelve Stairs first.', objectives: [{ id: 'foot', text: 'Cut a blaze at the foot of the Twelve Stairs', interact: 'obj:ranger-stair-foot', marker: { landmark: 'landmark:twelve-stairs' } }], next: 'rot' },
      { id: 'rot', journal: 'The black stone has never been alive, so nothing has ever softened it. Rot softens everything in the end. There is honest rot by your bedroll at the camp, where the Rot half sleeps.', objectives: [{ id: 'rot', text: 'Work honest rot into your knife at the Heart camp', interact: 'obj:ranger-bedroll-rot', marker: { landmark: 'landmark:heart-camp' } }], next: 'carve' },
      { id: 'carve', journal: 'Cut the Wayfarers’ blaze at the head of the Verdant stair, so whoever comes after can find the way.', objectives: [{ id: 'carve', text: 'Carve a Wayfarer blaze on the Verdant stair', when: { flag: 'ranger.stair_blazed' }, marker: { landmark: 'landmark:twelve-stairs-top' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A3, id: 'quest:ranger-aldos-garden', name: 'Aldo’s Garden', type: 'side', region: 'region:heart', giver: AM,
    summary: 'You have carried the last of Aldo’s barren mushrooms since the Thornwilds, wrapped in a dock leaf. They have never once gone off. Perhaps they only needed the right ground.',
    requires: req(done('quest:ranger-the-herald-of-rot')), autoStart: true, firstStage: 'bell',
    stages: [
      { id: 'bell', journal: 'Aldo’s hollow bell rolled all the way down the Twelve Stairs. Mushrooms grow honestly in hollow wood, if it is the right wood.', objectives: [{ id: 'bell', text: 'Find Aldo’s bell at the foot of the Stairs', interact: 'obj:ranger-aldo-bell', marker: { landmark: 'landmark:twelve-stairs' } }], next: 'plant' },
      { id: 'plant', journal: 'Where the Rot half has lain each night by your bedroll at the Heart camp, the black ground has gone soft and dark. Honest rot.', objectives: [{ id: 'plant', text: 'Plant Aldo’s mushrooms at the Heart camp', interact: 'obj:ranger-aldo-garden', marker: { landmark: 'landmark:heart-camp' } }], next: 'crack' },
      { id: 'crack', journal: 'Something has changed at the top of the Twelve Stairs, in the crack where Aldo sat as the Herald.', objectives: [{ id: 'crack', text: 'Go back to where Aldo sat on the Stairs', interact: 'obj:ranger-aldo-crack', marker: { landmark: 'landmark:twelve-stairs-top' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A3, id: 'quest:ranger-the-salt-thief-abroad', name: 'The Salt Thief Abroad', type: 'side', region: 'region:heart', giver: 'npc:dunmore-fitch',
    summary: 'Your pack has been warm, and faintly salty, ever since the Thornwilds. At the Heart camp it is suddenly neither.',
    requires: req({ flag: 'story.heart_open' }, done('quest:ranger-the-salt-thief')), autoStart: true, firstStage: 'trail',
    stages: [
      { id: 'trail', journal: 'The squirrel is out, with eleven years of the Wayfarers’ salt and the whole Heart camp to hide it in. It has left a trail. It was always going to leave a trail.', objectives: [{ id: 'trail', text: 'Follow the salt trail through the Heart camp', interact: 'obj:ranger-salt-trail-*', count: 3, marker: { landmark: 'landmark:heart-camp' } }], next: 'chase' },
      { id: 'chase', journal: 'It isn’t running away. It is packing for a journey. The trail goes up the tallest tent-pole in the camp.', objectives: [{ id: 'chase', text: 'Catch the salt thief at the Heart camp', interact: 'obj:ranger-salt-pole', marker: { landmark: 'landmark:heart-camp' } }], next: 'stair' },
      { id: 'stair', journal: 'Somebody has seen a very small, very fat squirrel heading for the Twelve Stairs, carrying a great deal of salt.', objectives: [{ id: 'stair', text: 'Follow the squirrel to the foot of the Stairs', interact: 'obj:ranger-squirrel-blaze', marker: { landmark: 'landmark:twelve-stairs' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1 },
  },
];

export default quests;
