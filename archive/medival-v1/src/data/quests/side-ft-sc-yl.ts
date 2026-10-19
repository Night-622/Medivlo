/**
 * Regional side quests: Ironspine Foothills (ft), Saltreach Coast (sc), Ylwen Deepwood (yl).
 * Spec: docs/lore/15-side-content.md. Owner: Claude 4. Gated on content.side (Ylwen also act1.ylwen_pact).
 * Every decision flag is set on the choice node itself and every deciding scene is an NPC route or an obj: dialogue.
 */
import type { QuestDef } from '@/core';

const SIDE = { flag: 'content.side' };
const PACT = { flag: 'act1.ylwen_pact' };
const L = (id: `landmark:${string}`) => ({ landmark: id });
const is = (flag: string, value: string) => ({ flag, op: '==' as const, value });

const quests: QuestDef[] = [
  // ===================== IRONSPINE FOOTHILLS =====================
  {
    id: 'quest:side-ft-mine-nine', name: 'Mine Nine', type: 'side', act: 'act1', region: 'region:ironspine-foothills', giver: 'npc:edwy-delver',
    summary: 'In the mining town of Slagwick the ninth working has flooded with black water that climbs instead of falling. The reeve’s son is down there, on the wrong side of it.',
    requires: SIDE,
    firstStage: 'pithead',
    stages: [
      {
        id: 'pithead', journal: 'Reeve Edwy Delver says the water in Mine Nine is climbing the ladders a rung at a time, and things are crawling up ahead of it. His son Hob and two hewers are cut off below.',
        objectives: [
          { id: 'reach', text: 'Go to the pithead of Mine Nine', reach: 'landmark:ft-mine-nine', marker: L('landmark:ft-mine-nine') },
          { id: 'kill', text: 'Clear the things crawling out of the shaft', kill: 'enemy:mireling', count: 4, marker: L('landmark:ft-mine-nine') },
        ],
        next: 'gallery',
      },
      {
        id: 'gallery', journal: 'The pithead is clear, for now. Go down the ladders and see the water for yourself.',
        objectives: [{ id: 'look', text: 'Climb down into the gallery', when: { flag: 'side.ft.mine-nine.seen' }, marker: L('landmark:ft-mine-nine') }],
        next: 'choice',
      },
      {
        id: 'choice', journal: 'Hob and the hewers are alive on a ledge in an old Orrin cut, and the hewers are singing with the water. Edwy’s blasting-powder is packed at the gallery mouth. Burn the water back with the Ashmark, or bring the roof down on it.',
        objectives: [{ id: 'decide', text: 'Decide what is done with Mine Nine', when: { flag: 'side.ft.mine-nine.choice' }, marker: L('landmark:ft-mine-nine') }],
        next: 'return',
      },
      {
        id: 'return', journal: 'It is done, one way or the other. Go back up to Slagwick and tell Edwy.',
        objectives: [{ id: 'edwy', text: 'Speak to Reeve Edwy Delver', talk: 'npc:edwy-delver', marker: L('landmark:ft-slagwick') }],
        onComplete: [{ unlockLore: 'lore:ironspine-foothills' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, items: [{ item: 'item:glyph-cinders', qty: 1 }] },
  },
  {
    id: 'quest:side-ft-rust-pilgrim', name: 'The Rust Pilgrim', type: 'side', act: 'act1', region: 'region:ironspine-foothills', giver: 'npc:orrik-coalheart',
    summary: 'Orrik Coalheart, an old ledger-clerk of the Orrun with his knees already gone to stone, means to climb to the Father on Watch Ridge and ask its forgiveness. The Orrun do not climb up to the Fathers. He would like company.',
    requires: SIDE,
    firstStage: 'stair',
    stages: [
      {
        id: 'stair', journal: 'Orrik has set off up the Pilgrims’ Stair, the old cut path to Watch Ridge. He is slow, and the ridge path is haunted by rust.',
        objectives: [
          { id: 'reach', text: 'Climb the Pilgrims’ Stair', reach: 'landmark:ft-pilgrims-stair', marker: L('landmark:ft-pilgrims-stair') },
          { id: 'wraiths', text: 'Drive off the rust-wraiths on the stair', kill: 'enemy:rust-wraith', count: 2, marker: L('landmark:ft-pilgrims-stair') },
        ],
        next: 'father',
      },
      {
        id: 'father', journal: 'At the top of the stair the Father on Watch Ridge stands with its face to the south. Orrik is sitting at its feet. Hear what he came to say, and decide what becomes of him.',
        objectives: [
          { id: 'reach', text: 'Reach the Father on Watch Ridge', reach: 'landmark:ft-watchridge-father', marker: L('landmark:ft-watchridge-father') },
          { id: 'orrik', text: 'Hear Orrik’s confession', when: { flag: 'side.ft.rust-pilgrim.choice' }, marker: L('landmark:ft-watchridge-father') },
        ],
        next: [{ when: is('side.ft.rust-pilgrim.choice', 'returned'), to: 'gate' }, { to: 'stone' }],
      },
      {
        id: 'gate', journal: 'Orrik has agreed to come down and say it again where the living can hear: at the gate of Dun Korrath, in front of anyone who cares to listen.',
        objectives: [{ id: 'speak', text: 'Stand with Orrik at Dun Korrath-Gate', when: { flag: 'side.ft.rust-pilgrim.spoke' }, marker: L('landmark:dun-korrath-gate') }],
        end: { status: 'completed', outcome: 'returned' },
      },
      {
        id: 'stone', journal: 'Orrik stayed at the Father’s feet, with his ledger shut on his knees. By spring he will be stone.',
        objectives: [],
        end: { status: 'completed', outcome: 'stayed' },
      },
    ],
    reward: { xpTier: 2, gold: 80, lore: ['lore:the-rusting'] },
  },

  // ===================== SALTREACH COAST =====================
  {
    id: 'quest:side-sc-wreckers-lantern', name: 'The Wreckers’ Lantern', type: 'side', act: 'act1', region: 'region:saltreach-coast', giver: 'npc:leofric-pike',
    summary: 'Ships keep breaking on the Gull Rocks on clear nights. Captain Leofric Pike lost his cog there, and swears he was steering by Saela’s own light on the headland.',
    requires: SIDE,
    firstStage: 'headland',
    stages: [
      {
        id: 'headland', journal: 'Pike says the shrine-light on Wrecker’s Point stood a cable’s length lower than it should have. Find the light, and whoever has been moving it.',
        objectives: [
          { id: 'reach', text: 'Go to Wrecker’s Point', reach: 'landmark:sc-wreckers-point', marker: L('landmark:sc-wreckers-point') },
          { id: 'lantern', text: 'Find the false light', when: { flag: 'side.sc.wreckers-lantern.found' }, marker: L('landmark:sc-wreckers-point') },
          { id: 'dead', text: 'Lay the drowned on the shingle', kill: 'enemy:drowned-dead', count: 2, optional: true, marker: L('landmark:sc-wreckers-point') },
        ],
        next: 'skerrow',
      },
      {
        id: 'skerrow', journal: 'The lantern’s wick-tin is stamped with a mark from Skerrow, the iced-in hamlet below the point. Someone there has been lighting ships onto the rocks.',
        objectives: [{ id: 'edith', text: 'Confront the wreckers of Skerrow', when: { flag: 'side.sc.wreckers-lantern.choice' }, marker: L('landmark:sc-skerrow') }],
        next: 'pike',
      },
      {
        id: 'pike', journal: 'Skerrow’s fate is settled. Tell Captain Pike on the Brackhaven quay.',
        objectives: [{ id: 'pike', text: 'Speak to Captain Pike', talk: 'npc:leofric-pike', marker: L('landmark:brackhaven-docks') }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, items: [{ item: 'item:glyph-homing', qty: 1 }] },
  },
  {
    id: 'quest:side-sc-saelas-tithe', name: 'Saela’s Tithe', type: 'side', act: 'act1', region: 'region:saltreach-coast', giver: 'npc:elswyth',
    summary: 'The tide-priests of Brackhaven have doubled their tithe, and still the harbour freezes every night. The captains call Mother Elswyth a thief. She asks you to go down to the ice after dark and listen.',
    requires: SIDE,
    firstStage: 'ice',
    stages: [
      {
        id: 'ice', journal: 'Mother Elswyth says that if you lie on the harbour ice after dark, you will hear what the tithe is for.',
        objectives: [
          { id: 'listen', text: 'Listen at the harbour ice after dark', when: { flag: 'side.sc.saelas-tithe.seen' }, marker: L('landmark:brackhaven-docks') },
          { id: 'dead', text: 'Put down the drowned who climb out', kill: 'enemy:drowned-dead', count: 3, optional: true, marker: L('landmark:brackhaven-docks') },
        ],
        next: 'counsel',
      },
      {
        id: 'counsel', journal: 'There are dead under the harbour ice: this winter’s drowned, knocking. Go back up Saela’s Steps and ask Elswyth what she means to do about them.',
        objectives: [{ id: 'elswyth', text: 'Hear Mother Elswyth out', when: { flag: 'side.sc.saelas-tithe.choice' }, marker: L('landmark:sc-saelas-steps') }],
        next: 'deed',
      },
      {
        id: 'deed', journal: 'Either the harbour boom comes down at the ebb and the dead go out with the tide, or the Ashmark burns them where they lie.',
        objectives: [{ id: 'done', text: 'Free the drowned under the ice', when: { flag: 'side.sc.saelas-tithe.done' }, marker: L('landmark:brackhaven-docks') }],
        next: 'farewell',
      },
      {
        id: 'farewell', journal: 'The harbour is quiet tonight. Go back up the Steps to Elswyth.',
        objectives: [{ id: 'elswyth', text: 'Return to Mother Elswyth', talk: 'npc:elswyth', marker: L('landmark:sc-saelas-steps') }],
        onComplete: [{ unlockLore: 'lore:saela-and-the-river-under' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, items: [{ item: 'item:glyph-frost', qty: 1 }] },
  },

  // ===================== YLWEN DEEPWOOD =====================
  {
    id: 'quest:side-yl-wardwood-sapling', name: 'The Wardwood Sapling', type: 'side', act: 'act1', region: 'region:ylwen-deepwood', giver: 'npc:gwyneira-ferch-bryn',
    summary: 'The heart-tree of Caer Hiraeth, the oldest hall of Caer Ylwen, is dying from the roots up. Gwyneira has sung one green shoot out of it and wants it planted where it can live.',
    requires: { all: [SIDE, PACT] },
    firstStage: 'roots',
    stages: [
      {
        id: 'roots', journal: 'Something black is drinking at the roots of the willow that holds up Caer Hiraeth. Go down to the roots and take the living shoot Gwyneira has sung out of it.',
        objectives: [
          { id: 'reach', text: 'Go down to the roots of Caer Hiraeth', reach: 'landmark:yl-caer-hiraeth', marker: L('landmark:yl-caer-hiraeth') },
          { id: 'kill', text: 'Clear the roots', kill: 'enemy:mireling', count: 3, marker: L('landmark:yl-caer-hiraeth') },
          { id: 'shoot', text: 'Take the living shoot', when: { flag: 'side.yl.wardwood-sapling.cutting' }, marker: L('landmark:yl-caer-hiraeth') },
        ],
        next: 'where',
      },
      {
        id: 'where', journal: 'The shoot is wrapped in moss in your pack, warm from your hand. Gwyneira must decide where it goes in the ground, and she has asked you to decide with her.',
        objectives: [{ id: 'decide', text: 'Choose with Gwyneira where to plant it', when: { flag: 'side.yl.wardwood-sapling.choice' }, marker: L('landmark:caer-ylwen') }],
        next: 'plant',
      },
      {
        id: 'plant', journal: 'Take the sapling to the place you chose and put it in the ground. Gwyneira will sing it in.',
        objectives: [{ id: 'plant', text: 'Plant the wardwood sapling', when: { flag: 'side.yl.wardwood-sapling.planted' } }],
        next: 'return',
      },
      {
        id: 'return', journal: 'The sapling is in the ground. Go back to Caer Hiraeth and sit with Gwyneira while the old tree dies.',
        objectives: [{ id: 'gwyneira', text: 'Return to Gwyneira', talk: 'npc:gwyneira-ferch-bryn', marker: L('landmark:yl-caer-hiraeth') }],
        onComplete: [{ unlockLore: 'lore:kethra-the-thorn', section: 'rot' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, items: [{ item: 'item:glyph-lingering', qty: 1 }] },
  },
  {
    id: 'quest:side-yl-songless', name: 'Songless', type: 'side', act: 'act1', region: 'region:ylwen-deepwood', giver: 'npc:aeronwy-ferch-gwyl',
    summary: 'Aeronwy’s daughter Cerys has not sung a note since the Night of Falling Ash. Among the Aelthi that is like a child who has stopped breathing. At night, Cerys goes missing.',
    requires: { all: [SIDE, PACT] },
    firstStage: 'cerys',
    stages: [
      {
        id: 'cerys', journal: 'Aeronwy asks you to speak to Cerys. The girl will not sing for her mother. She might, Aeronwy says, for a stranger.',
        objectives: [{ id: 'cerys', text: 'Speak to Cerys', talk: 'npc:cerys-ferch-aeronwy', marker: L('landmark:caer-ylwen') }],
        next: 'pool',
      },
      {
        id: 'pool', journal: 'Cerys drew you a picture in the moss: a pool, a girl beside it, and lines coming up out of the water like music. Follow her to the Still Pool.',
        objectives: [
          { id: 'reach', text: 'Go to the Still Pool', reach: 'landmark:yl-still-pool', marker: L('landmark:yl-still-pool') },
          { id: 'wolves', text: 'Drive off what prowls the pool', kill: 'enemy:hollowed-wolf', count: 2, optional: true, marker: L('landmark:yl-still-pool') },
          { id: 'listen', text: 'Listen at the pool', when: { flag: 'side.yl.songless.heard' }, marker: L('landmark:yl-still-pool') },
        ],
        next: 'choice',
      },
      {
        id: 'choice', journal: 'Cerys’s voice is in the pool. When she sings, her lips move, and the water sings for her. Decide what is to be done, before her mother has to.',
        objectives: [{ id: 'decide', text: 'Decide what becomes of Cerys’s song', when: { flag: 'side.yl.songless.choice' }, marker: L('landmark:yl-still-pool') }],
        next: 'home',
      },
      {
        id: 'home', journal: 'Take Cerys home to her mother, and tell Aeronwy what you did.',
        objectives: [{ id: 'aeronwy', text: 'Speak to Aeronwy', talk: 'npc:aeronwy-ferch-gwyl', marker: L('landmark:caer-ylwen') }],
        onComplete: [{ unlockLore: 'lore:the-lullaby' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, items: [{ item: 'item:glyph-echo', qty: 1 }] },
  },
];

export default quests;
