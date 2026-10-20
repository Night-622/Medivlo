/**
 * Hollow Crown: the DUSKWEAVER campaign (docs/lore/hollow-crown/06-outlines/umbral.md). Act I in Duskmere
 * (area:umbral-capital) and the Act II class thread in Concordia. Nocturne is a realm of endless dusk; its night
 * beats are moonrise, by the clock. Act III class quests land with the Heart. Owner: Claude 4.
 */
import type { NarrativeCondition, QuestDef } from '@/core';

const DUS: NarrativeCondition = { heroClass: 'duskweaver' };
const done = (q: `quest:${string}`): NarrativeCondition => ({ questCompleted: q });
const req = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: [DUS, ...c] });
const A1 = { act: 'act1' as const, campaign: 'duskweaver', chapter: 'Duskmere' };
const A2 = { act: 'act2' as const, campaign: 'duskweaver', chapter: 'Concordia' };
const A3 = { act: 'act3' as const, campaign: 'duskweaver', chapter: 'The Heart' };
const Z1 = 'zone:umbral-capital-1' as const, Z2 = 'zone:umbral-capital-2' as const, Z3 = 'zone:umbral-capital-3' as const, Z4 = 'zone:umbral-capital-4' as const;
const L1 = 'inst:umbral-capital-lair-1' as const, L2 = 'inst:umbral-capital-lair-2' as const, L3 = 'inst:umbral-capital-lair-3' as const;
const NX = 'npc:nyx-aubade' as const, OV = 'npc:oriel-vane' as const, TM = 'npc:tybalt-murk' as const, MT = 'npc:marigold-thrupp' as const;

const quests: QuestDef[] = [
  // ======================= ACT I: main (I-1 … I-10)
  {
    ...A1, id: 'quest:duskweaver-the-bell-at-dusk', name: 'The Bell at Dusk', type: 'main', region: Z1, giver: NX,
    summary: 'A bell rang over Duskmere from very far away, and the moon rippled like a pond someone had dropped a stone in. Every bottled shadow in the city turned to face the Moon Obelisk. So did something in your chest.',
    requires: DUS, autoStart: true, firstStage: 'street',
    stages: [
      {
        id: 'street', journal: 'You woke with a song in your chest and the moon wobbling overhead. The song is pulling you up the street, towards the Keepers’ Lodge.',
        onEnter: [{ openDialogue: 'dialogue:duskweaver-bell-at-dusk' }],
        objectives: [{ id: 'lodge', text: 'Follow the song up the street to the Keepers’ Lodge', reach: 'landmark:keepers-lodge', marker: { landmark: 'landmark:keepers-lodge' } }],
        next: 'jars',
      },
      {
        id: 'jars', journal: 'The bottled shadows in the windows have all turned round to stare at the Obelisk, pressing against the glass. Weave them back to face the room before they crack the jars.',
        objectives: [{ id: 'jars', text: 'Weave the bottled shadows in the windows by the Lodge back round', interact: 'obj:dusk-shadow-jar-*', count: 3, marker: { landmark: 'landmark:keepers-lodge' } }],
        next: 'nyx',
      },
      {
        id: 'nyx', journal: 'There is an old woman in a nightgown in the middle of the street, holding a candle, calling a name that isn’t yours.',
        objectives: [{ id: 'nyx', text: 'Speak to the woman outside the Keepers’ Lodge', talk: NX, marker: { landmark: 'landmark:keepers-lodge' } }],
        onComplete: [{ setFlag: 'duskweaver.bell_heard', value: true }],
        next: 'cocoa',
      },
      {
        id: 'cocoa', journal: 'Nyx has asked you in for cocoa. The Keepers’ Lodge is full of candles she doesn’t need, and of drawers, every one labelled, none of them in any order you can follow.',
        objectives: [{ id: 'nyx', text: 'Have cocoa with Nyx at the Keepers’ Lodge', talk: NX, marker: { landmark: 'landmark:keepers-lodge' } }],
        onComplete: [{ startQuest: 'quest:duskweaver-chalk-the-doors' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-nocturne', 'lore:hc-kept-names'] },
  },
  {
    ...A1, id: 'quest:duskweaver-chalk-the-doors', name: 'Chalk the Doors', type: 'main', region: Z1, giver: NX,
    summary: 'The Lanternless Streets have forgotten which door is whose. Loremistress Nyx has given you a stick of chalk and a list of names, and is fairly sure the list is the right list.',
    requires: req(done('quest:duskweaver-the-bell-at-dusk')), firstStage: 'doors',
    stages: [
      {
        id: 'doors', journal: 'Five households have woken up outside the wrong doors. Chalk their own names back where they belong.',
        objectives: [{ id: 'doors', text: 'Chalk the names back on the doors of the Lanternless Streets', interact: 'obj:umbral-door-*', count: 5, marker: { place: Z1 } }],
        next: 'wisps',
      },
      {
        id: 'wisps', journal: 'Every doorstep had a puddle of black tears on it, the colour of moonless water. The doors’ own shadows have wandered off down the street as Shade Wisps.',
        objectives: [{ id: 'wisps', text: 'Gather up the wandering door-shadows', kill: 'bx_umbral_0', count: 4, marker: { place: Z1 } }],
        next: 'report',
      },
      {
        id: 'report', journal: 'Five doors, five names, five shadows home. Nyx will want to hear it, and then forget, and then want to hear it again.',
        objectives: [{ id: 'nyx', text: 'Report to Loremistress Nyx', talk: NX, marker: { landmark: 'landmark:keepers-lodge' } }],
        onComplete: [{ startQuest: 'quest:duskweaver-the-flower-thieves' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40, lore: ['lore:hc-obelisk-keepers'] },
  },
  {
    ...A1, id: 'quest:duskweaver-the-flower-thieves', name: 'The Flower Thieves', type: 'main', region: Z2, giver: MT,
    summary: 'Somebody is cutting memory-flowers in the Gardens by night, and the people they grew from are waking up not knowing their own children.',
    requires: req(done('quest:duskweaver-chalk-the-doors')), firstStage: 'marigold',
    stages: [
      {
        id: 'marigold', journal: 'Nyx says the Gardens’ head gardener, Marigold Thrupp, has been sitting up every night with a rake across her knees.',
        objectives: [{ id: 'marigold', text: 'Speak to Marigold Thrupp at the Gardens gate', talk: MT, marker: { landmark: 'landmark:memory-gardens-gate' } }],
        next: 'beds',
      },
      {
        id: 'beds', journal: 'Cut stems, clean as a sickle, in bed after bed. Follow the cuttings.',
        objectives: [{ id: 'beds', text: 'Follow the trail of cut memory-flowers', interact: 'obj:cut-memory-bed-*', count: 3, marker: { place: Z2 } }],
        next: 'undercroft',
      },
      {
        id: 'undercroft', journal: 'The trail goes down under a temple nobody remembers building, and nobody remembers to visit.',
        objectives: [{ id: 'enter', text: 'Go down into the Cult Undercroft', reach: L1, marker: { landmark: 'landmark:forgotten-temple' } }],
        next: 'leader',
      },
      {
        id: 'leader', journal: 'A smiling florist with a sickle, who will sell you back your last ten seconds. Don’t stand still.',
        objectives: [{ id: 'leader', text: 'Defeat the Duskblade Cult Leader', kill: 'bx_umbral_4', count: 1 }],
        next: 'pasts',
      },
      {
        id: 'pasts', journal: 'Crates and crates of cut memories, each one wrapped in tissue and priced.',
        objectives: [{ id: 'pasts', text: 'Gather up the stolen pasts', interact: 'obj:cult-stolen-pasts' }],
        next: 'report',
      },
      {
        id: 'report', journal: 'The pasts are going back to their people. Marigold will know how to plant them.',
        objectives: [{ id: 'marigold', text: 'Bring the pasts back to Marigold', talk: MT, marker: { landmark: 'landmark:memory-gardens-gate' } }],
        onComplete: [{ setFlag: 'duskweaver.cult_down', value: true }, { startQuest: 'quest:duskweaver-the-mnemosarchs-queue' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 80, hcItems: [{ item: 'i_scroll_umbral', qty: 2 }], lore: ['lore:hc-memory-gardens', 'lore:hc-duskblade-cult'] },
  },
  {
    ...A1, id: 'quest:duskweaver-the-mnemosarchs-queue', name: 'The Mnemosarch’s Queue', type: 'main', region: Z3, giver: OV,
    summary: 'The Mnemosarch of the Obelisk has heard what you did in the Gardens, and would like to pour you a cup of tea. He is the only person in Duskmere who gets your name right first time.',
    requires: req(done('quest:duskweaver-the-flower-thieves')), firstStage: 'desk',
    stages: [
      {
        id: 'desk', journal: 'The Mnemosarch’s desk stands at the head of the queue in Obelisk Plaza, where people wait, sometimes for years, to be given back what they have forgotten.',
        objectives: [{ id: 'vane', text: 'Meet the Mnemosarch at his desk', talk: OV, marker: { landmark: 'landmark:mnemosarch-desk' } }],
        onComplete: [{ setFlag: 'duskweaver.vane_met', value: true }],
        next: 'phials',
      },
      {
        id: 'phials', journal: 'Help him hand back the morning’s memories, one little glass phial at a time, to the front of the queue.',
        objectives: [{ id: 'phials', text: 'Hand back memories to the queue', interact: 'obj:obelisk-queue-*', count: 3, marker: { landmark: 'landmark:obelisk-queue' } }],
        next: 'ledger',
      },
      {
        id: 'ledger', journal: 'Every phial you handed back is signed for in the queue ledger on the Mnemosarch’s desk. He asked you to sign them off. He keeps the most beautiful ledger you have ever seen.',
        objectives: [{ id: 'ledger', text: 'Sign the phials off in the queue ledger', interact: 'obj:duskweaver-queue-ledger', marker: { landmark: 'landmark:mnemosarch-desk' } }],
        next: 'tea',
      },
      {
        id: 'tea', journal: 'The queue is quiet. The Mnemosarch has poured two cups and pushed one across the desk to you without asking how you take it. He knows.',
        objectives: [{ id: 'vane', text: 'Take tea with the Mnemosarch', talk: OV, marker: { landmark: 'landmark:mnemosarch-desk' } }],
        onComplete: [{ startQuest: 'quest:duskweaver-the-mourners-petition' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-moon-obelisk'] },
  },
  {
    ...A1, id: 'quest:duskweaver-the-mourners-petition', name: 'The Mourners’ Petition', type: 'main', region: Z3, giver: 'npc:rosamund-hesketh',
    summary: 'A crowd of the bereaved has come to Obelisk Plaza to petition the Keepers: let us forget the night of the Hollowing. The Keepers’ oldest law is that nothing kept may be unkept.',
    requires: req(done('quest:duskweaver-the-mnemosarchs-queue')), firstStage: 'canvass',
    stages: [
      {
        id: 'canvass', journal: 'The mourners will put their petition at the Obelisk. Before they do, hear the two people who will have to live with the answer: Rosamund Hesketh, who wrote it, and Marigold Thrupp, whose Gardens grow whatever Duskmere lets go of.',
        objectives: [
          { id: 'rosamund', text: 'Hear Rosamund Hesketh out', talk: 'npc:rosamund-hesketh', marker: { landmark: 'landmark:obelisk-queue' } },
          { id: 'marigold', text: 'Hear Marigold Thrupp out', talk: 'npc:marigold-thrupp', marker: { landmark: 'landmark:memory-gardens-gate' } },
        ],
        next: 'petition',
      },
      {
        id: 'petition', journal: 'Rosamund Hesketh has the petition, two hundred names long. Nyx is there, and the Mnemosarch, and somebody from the Veil standing very carefully in a shadow.',
        objectives: [{ id: 'petition', text: 'Answer the mourners’ petition', when: { flag: 'duskweaver.mourners' }, marker: { landmark: 'landmark:obelisk-queue' } }],
        next: [
          { when: { flag: 'duskweaver.mourners', value: 'rest' }, to: 'rest' },
          { to: 'after' },
        ],
      },
      {
        id: 'rest', journal: 'Carry the griefs down to the Memory Gardens, and plant them in a bed of their own.',
        objectives: [{ id: 'plant', text: 'Plant the griefs in the Rest', interact: 'obj:rest-bed-planting', marker: { landmark: 'landmark:memory-gardens-rest' } }],
        next: 'after',
      },
      {
        id: 'after', journal: 'Whatever was done with them, the griefs of the Hollowing are somewhere new tonight, and something in the Archive has noticed.',
        objectives: [],
        onComplete: [{ startQuest: 'quest:duskweaver-the-hall-of-lost-names' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-the-rest'] },
  },
  {
    ...A1, id: 'quest:duskweaver-the-hall-of-lost-names', name: 'The Hall of Lost Names', type: 'main', region: Z3, giver: NX,
    summary: 'The forgotten have come to collect. In the Hall of Lost Names, papered floor to ceiling with names nobody says any more, something made of all of them has woken up.',
    requires: req(done('quest:duskweaver-the-mourners-petition')), firstStage: 'nyx',
    stages: [
      {
        id: 'nyx', journal: 'Nyx sent a Keeper running for you. She is standing outside the Hall of Lost Names, and for once she remembers exactly why.',
        objectives: [{ id: 'nyx', text: 'Find Nyx at the Hall of Lost Names', talk: NX, marker: { landmark: 'landmark:hall-of-lost-names-door' } }],
        next: 'hall',
      },
      {
        id: 'hall', journal: 'Every wall of the Hall is papered with names. Some of the paper is going blank as you watch.',
        objectives: [{ id: 'enter', text: 'Go into the Hall of Lost Names', reach: L2, marker: { landmark: 'landmark:hall-of-lost-names-door' } }],
        next: 'unremembered',
      },
      {
        id: 'unremembered', journal: 'A shape with a thousand faces. When it forgets you, read the names off the walls aloud until it turns and looks.',
        objectives: [{ id: 'unremembered', text: 'Defeat the Unremembered', kill: 'cb_the-unremembered', count: 1 }],
        next: 'paper',
      },
      {
        id: 'paper', journal: 'One last name-paper is still fluttering where the creature fell.',
        objectives: [{ id: 'paper', text: 'Read the last name-paper', interact: 'obj:last-name-paper' }],
        onComplete: [{ setFlag: 'duskweaver.catalogue_mark', value: true }, { startQuest: 'quest:duskweaver-what-the-mnemosarch-kept' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 120 },
  },
  {
    ...A1, id: 'quest:duskweaver-what-the-mnemosarch-kept', name: 'What the Mnemosarch Kept', type: 'main', region: Z4, giver: OV,
    summary: 'The last name-paper had a catalogue mark on it, in the Mnemosarch’s own neat hand. It belongs to a shelf in the Archive of Shadows that is not on any plan.',
    requires: req(done('quest:duskweaver-the-hall-of-lost-names')), firstStage: 'stacks',
    stages: [
      {
        id: 'stacks', journal: 'The bottled shadows in the east stacks have spilled off their shelves and are all lying the same way, like grass after a flood. Follow where they point.',
        objectives: [{ id: 'spill', text: 'Follow the spilled shadows through the east stacks', interact: 'obj:duskweaver-spill-*', count: 3, marker: { landmark: 'landmark:archive-stacks' } }],
        next: 'shelves',
      },
      {
        id: 'shelves', journal: 'Deep in the Archive, where the bottled shadows are spilling off the stacks, find the shelf with that mark.',
        objectives: [{ id: 'shelf', text: 'Find the shelf behind the spilling stacks', interact: 'obj:archive-spilling-shelf', marker: { place: Z4 } }],
        next: 'model',
      },
      {
        id: 'model', journal: 'Behind the shelf is a room, and in the room is Duskmere. All of it. In shadow, street by street. And the Mnemosarch, with a little brush, painting a window.',
        objectives: [{ id: 'vane', text: 'Speak to the Mnemosarch in his shadow city', talk: OV, marker: { landmark: 'landmark:mnemosarch-model' } }],
        onComplete: [{ setFlag: 'duskweaver.vane_known', value: true }],
        next: 'nyx',
      },
      {
        id: 'nyx', journal: 'Every phial Vane ever handed back was a copy. The originals are on a table forty feet long. Nyx has to hear it from you, and she will want to hear it slowly.',
        objectives: [{ id: 'nyx', text: 'Tell Nyx what the Mnemosarch kept', talk: NX, marker: { landmark: 'landmark:keepers-lodge' } }],
        onComplete: [{ startQuest: 'quest:duskweaver-the-obelisks-shadow' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-mnemosarchs-city'] },
  },
  {
    ...A1, id: 'quest:duskweaver-the-obelisks-shadow', name: 'The Obelisk’s Shadow', type: 'main', region: L3, giver: NX,
    summary: 'Vane means to set the Obelisk half in his own head, so that nothing anyone has ever known will be lost again. It lies on the side of the Moon Obelisk that the moon never sees.',
    requires: req(done('quest:duskweaver-what-the-mnemosarch-kept')), firstStage: 'shadow',
    stages: [
      {
        id: 'shadow', journal: 'Round to the far side of the Moon Obelisk, into the one shadow in Duskmere the moon has never looked at.',
        objectives: [{ id: 'enter', text: 'Go round into the Obelisk’s Shadow', reach: L3, marker: { place: Z3 } }],
        next: 'vane',
      },
      {
        id: 'vane', journal: 'He remembers every fight you have ever had, and he will dodge whatever you do most. Vary it.',
        objectives: [{ id: 'vane', text: 'Stop Oriel Vane', kill: 'cb_oriel-vane', count: 1 }],
        next: 'stone',
      },
      {
        id: 'stone', journal: 'Vane has backed away into the dark. The Obelisk half is lying in the shadow at the Obelisk’s foot, singing to you.',
        objectives: [{ id: 'stone', text: 'Take up the Obelisk half', interact: 'obj:umbral-capital-halfstone' }],
        onComplete: [{ setFlag: 'duskweaver.halfstone', value: true }, { startQuest: 'quest:duskweaver-the-long-dusk-road' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, skillPoints: 1, lore: ['lore:hc-half-stones', 'lore:hc-oriel-vane'] },
  },
  {
    ...A1, id: 'quest:duskweaver-the-long-dusk-road', name: 'The Long Dusk Road', type: 'main', region: Z1, giver: NX,
    summary: 'Vane is walking to the Dusk Gate with Duskmere under his arm. The Obelisk half can open the gate. Nyx would like to walk you to the edge of the city, if she can remember the way.',
    requires: req(done('quest:duskweaver-the-obelisks-shadow')), firstStage: 'farewell',
    stages: [
      {
        id: 'farewell', journal: 'Nyx is waiting at the door of the Keepers’ Lodge, in her coat, holding a candle she does not need.',
        objectives: [{ id: 'nyx', text: 'Walk with Nyx to the edge of the city', talk: NX, marker: { landmark: 'landmark:keepers-lodge' } }],
        onComplete: [{ setFlag: 'duskweaver.nyx_farewell', value: true }],
        next: 'walk',
      },
      {
        id: 'walk', journal: 'Nyx is walking you to the edge of the city, as far as the last lamp-shadow on the long dusk road. She keeps stopping to say hello to people she has never met, and the road is full of Shade Wisps. Keep her with you.',
        onEnter: [{ escort: 'npc:nyx-aubade', to: 'landmark:duskweaver-road-lamp' }],
        objectives: [{ id: 'nyx', text: 'Walk Nyx safely to the last lamp-shadow', when: { any: [{ flag: 'escort.nyx-aubade', op: '==', value: 'arrived' }, { flag: 'escort.nyx-aubade', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:duskweaver-road-lamp' } }],
        next: [{ when: { flag: 'escort.nyx-aubade', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'lamp' }],
      },
      {
        id: 'regroup', journal: 'Nyx was knocked flat by the wisps, and two Keepers have carried her back to the Lodge, where she has already forgotten it happened and is putting her coat on again.',
        onEnter: [{ escort: 'npc:nyx-aubade', to: 'landmark:duskweaver-road-lamp' }],
        objectives: [{ id: 'nyx', text: 'Try again: walk Nyx to the last lamp-shadow', when: { any: [{ flag: 'escort.nyx-aubade', op: '==', value: 'arrived' }, { flag: 'escort.nyx-aubade', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:duskweaver-road-lamp' } }],
        next: [{ when: { flag: 'escort.nyx-aubade', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'lamp' }],
      },
      {
        id: 'lamp', journal: 'The last lamp-shadow on the long dusk road, where the city ends. Something is hanging from it, and Nyx is looking at it very hard.',
        objectives: [{ id: 'lamp', text: 'Stop at the last lamp-shadow on the road', interact: 'obj:duskweaver-road-lamp', marker: { landmark: 'landmark:duskweaver-road-lamp' } }],
        next: 'road',
      },
      {
        id: 'road', journal: 'The long dusk road runs out of Duskmere towards a gate where the moon is going out.',
        objectives: [{ id: 'gate', text: 'Take the long dusk road to the gate', reach: 'area:umbral-gate', marker: { place: 'area:umbral-gate' } }],
        onComplete: [{ startQuest: 'quest:duskweaver-the-dusk-gate' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:duskweaver-the-dusk-gate', name: 'The Dusk Gate', type: 'main', region: 'area:umbral-gate', giver: NX,
    summary: 'The Eclipse Queen sits half eclipsed on the Dusk Gate. She means to swallow the moon so that nothing more can be forgotten. She is Vane’s argument, the size of a sky.',
    requires: req(done('quest:duskweaver-the-long-dusk-road')), firstStage: 'queen',
    stages: [
      {
        id: 'queen', journal: 'At new moon you will not see her at all. Weave Nocturne’s memories of the moon at her until she opens her mouth.',
        onEnter: [{ openDialogue: 'dialogue:duskweaver-eclipse-queen' }],
        objectives: [{ id: 'queen', text: 'Un-swallow the Eclipse Queen', kill: 'bx_umbral_5', count: 1 }],
        next: 'gate',
      },
      {
        id: 'gate', journal: 'The moon is back in the sky. The Queen is asleep on the gate-step. The gate itself is weeping black tears down its violet face.',
        objectives: [{ id: 'seal', text: 'Open the Dusk Gate with the half-stone', interact: 'obj:umbral-gate-seal' }],
        onComplete: [{ setFlag: 'story.gate_open', value: true }, { setFlag: 'story.act', value: 2 }, { setFlag: 'duskweaver.act1_done', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 200, lore: ['lore:hc-realm-gates', 'lore:hc-eclipse-queen'] },
  },

  // ======================= ACT I: side quests (2 per zone)
  {
    ...A1, id: 'quest:duskweaver-the-sweepers-detours', name: 'The Sweeper’s Detours', type: 'side', region: Z1, giver: 'npc:ambrose-hewlett',
    summary: 'Old Ambrose Hewlett sweeps the Lanternless Streets in long detours round things that aren’t there, and everybody humours him. He would like, just once, not to be humoured.',
    requires: req(done('quest:duskweaver-the-bell-at-dusk')), firstStage: 'posts',
    stages: [
      {
        id: 'posts', journal: 'Ambrose says the things he sweeps round only show when the moon is up. Look at the street he never sweeps straight, at moonrise.',
        objectives: [{ id: 'posts', text: 'Look down Ambrose’s street at moonrise', when: { flag: 'duskweaver.lamp_shadows' }, marker: { landmark: 'landmark:lamp-shadows' } }],
        next: 'ambrose',
      },
      {
        id: 'ambrose', journal: 'Lamp-posts. The shadows of lamp-posts, still standing in a row, thirty years after the posts were melted down.',
        objectives: [{ id: 'ambrose', text: 'Tell Ambrose he was right', talk: 'npc:ambrose-hewlett', marker: { landmark: 'landmark:lamp-shadows' } }],
        next: 'lamp',
      },
      {
        id: 'lamp', journal: 'Ambrose lit those lamps, every night, for forty years, before the Keepers took the posts. He kept one lamp back, the last one. It is in the old lamp-store at the end of the street, and he has never dared look at it.',
        objectives: [{ id: 'lamp', text: 'Find Ambrose’s last lamp in the old lamp-store', interact: 'obj:duskweaver-last-lamp', marker: { landmark: 'landmark:duskweaver-lamp-store' } }],
        onComplete: [{ setFlag: 'duskweaver.last_lamp', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-lamp-shadows'] },
  },
  {
    ...A1, id: 'quest:duskweaver-courtesy-calls', name: 'Courtesy Calls', type: 'side', region: Z1, giver: 'npc:ottoline-fairweather',
    summary: 'Every morning Ottoline Fairweather introduces herself to her husband Horace, and every morning he pretends to be charmed. They are both forgetting, and each of them thinks the other doesn’t know.',
    requires: req(done('quest:duskweaver-the-bell-at-dusk')), firstStage: 'horace',
    stages: [
      {
        id: 'horace', journal: 'Ottoline wants a card about how they met, to read each night. She remembers half of it. Horace might remember the other half.',
        objectives: [{ id: 'horace', text: 'Ask Horace how they met', talk: 'npc:horace-fairweather', marker: { landmark: 'landmark:fairweather-house' } }],
        next: 'card',
      },
      {
        id: 'card', journal: 'Two halves of one story. Write them down together.',
        objectives: [{ id: 'card', text: 'Write the Fairweathers’ card', interact: 'obj:fairweather-writing-desk', marker: { landmark: 'landmark:fairweather-house' } }],
        next: 'ottoline',
      },
      {
        id: 'ottoline', journal: 'The card is written, and propped on the mantel where both of them will see it.',
        objectives: [{ id: 'ottoline', text: 'Give Ottoline the card', talk: 'npc:ottoline-fairweather', marker: { landmark: 'landmark:fairweather-house' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_cake' }] },
  },
  {
    ...A1, id: 'quest:duskweaver-his-radiance', name: 'His Radiance', type: 'side', region: Z2, giver: 'npc:bartholomew-cobble',
    summary: 'A weed the Cult planted in the Gardens has made Bartholomew Cobble the cobbler remember being a prince. He is much happier. His customers are not.',
    requires: req(done('quest:duskweaver-the-flower-thieves')), firstStage: 'weed',
    stages: [
      {
        id: 'weed', journal: 'The weed is growing in the bed where Bartholomew’s memories grow, gold and spiky, with a crown-shaped flower.',
        objectives: [{ id: 'weed', text: 'Deal with the prince-weed', interact: 'obj:prince-weed', marker: { place: Z2 } }],
        next: 'cobble',
      },
      {
        id: 'cobble', journal: 'Whatever you did, Bartholomew will want to tell you about it.',
        objectives: [{ id: 'cobble', text: 'Call on Bartholomew Cobble', talk: 'npc:bartholomew-cobble', marker: { landmark: 'landmark:cobble-shop' } }],
        next: 'flower',
      },
      {
        id: 'flower', journal: 'The prince-weed’s memory belonged to somebody once: a real boy who was really crowned, in a pageant, long ago. Marigold Thrupp keeps a bed for memories nobody owns any more.',
        objectives: [{ id: 'marigold', text: 'Ask Marigold about the prince-weed’s memory', talk: 'npc:marigold-thrupp', marker: { landmark: 'landmark:memory-gardens-gate' } }],
        onComplete: [{ setFlag: 'duskweaver.prince_owner', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 50 },
  },
  {
    ...A1, id: 'quest:duskweaver-the-bed-of-small-things', name: 'The Bed of Small Things', type: 'side', region: Z2, giver: 'npc:posy',
    summary: 'Every day, Posy plants a flower of her grandmother, and every day it wilts. She is eight, and she is not going to stop.',
    requires: req(done('quest:duskweaver-the-flower-thieves')), firstStage: 'marigold',
    stages: [
      {
        id: 'marigold', journal: 'Marigold Thrupp knows why things wilt in the Gardens. Ask her.',
        objectives: [{ id: 'marigold', text: 'Ask Marigold why Posy’s flowers wilt', talk: MT, marker: { landmark: 'landmark:memory-gardens-gate' } }],
        next: 'plant',
      },
      {
        id: 'plant', journal: 'Moonshade, Marigold says. Not moonlight, not dark. The shade the moon throws.',
        objectives: [{ id: 'plant', text: 'Plant Posy’s flower in moonshade', interact: 'obj:posy-moonshade-bed', marker: { landmark: 'landmark:posy-bed' } }],
        next: 'posy',
      },
      {
        id: 'posy', journal: 'It is standing up. It is still standing up.',
        objectives: [{ id: 'posy', text: 'Show Posy', talk: 'npc:posy', marker: { landmark: 'landmark:posy-bed' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:duskweaver-what-jasper-queued-for', name: 'What Jasper Queued For', type: 'side', region: Z3, giver: 'npc:jasper-grubb',
    summary: 'Jasper Grubb has been in the Obelisk queue so long he has forgotten what he came to remember. He has made eleven friends in it, and does not want to reach the front.',
    requires: req(done('quest:duskweaver-the-mnemosarchs-queue')), firstStage: 'ticket',
    stages: [
      {
        id: 'ticket', journal: 'Every queuer has a ticket that says what they came for. Jasper uses his as a bookmark.',
        objectives: [{ id: 'ticket', text: 'Read Jasper’s queue ticket', interact: 'obj:jasper-queue-ticket', marker: { landmark: 'landmark:obelisk-queue' } }],
        next: 'jasper',
      },
      {
        id: 'jasper', journal: 'You know what he queued for, now. You are not sure he wants to.',
        objectives: [{ id: 'jasper', text: 'Talk to Jasper', talk: 'npc:jasper-grubb', marker: { landmark: 'landmark:obelisk-queue' } }],
        next: 'place',
      },
      {
        id: 'place', journal: 'Jasper doesn’t want to reach the front any more. Somebody has to ask the Mnemosarch whether a man can keep his place in a queue for ever.',
        objectives: [{ id: 'vane', text: 'Ask the Mnemosarch to keep Jasper’s place', talk: OV, marker: { landmark: 'landmark:mnemosarch-desk' } }],
        onComplete: [{ setFlag: 'duskweaver.jasper_place', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 30 },
  },
  {
    ...A1, id: 'quest:duskweaver-two-names', name: 'Two Names', type: 'side', region: Z3, giver: 'npc:linnet-dray',
    summary: 'Linnet Dray and Edmund Fosse cannot marry: a Nocturne wedding is the swapping of kept names, and Linnet’s has gone missing from the Obelisk register.',
    requires: req(done('quest:duskweaver-the-mnemosarchs-queue')), firstStage: 'register',
    stages: [
      {
        id: 'register', journal: 'Check the lower register for Linnet’s kept name.',
        objectives: [{ id: 'register', text: 'Look for Linnet’s name in the register', interact: 'obj:register-linnet-entry', marker: { landmark: 'landmark:obelisk-register' } }],
        next: 'drawer',
      },
      {
        id: 'drawer', journal: 'Her line is blank, the ink lifted clean. Somebody took it out carefully. Somebody tidy.',
        objectives: [{ id: 'drawer', text: 'Search the Mnemosarch’s filing', interact: 'obj:vane-filing-drawer', marker: { landmark: 'landmark:mnemosarch-desk' } }],
        next: 'linnet',
      },
      {
        id: 'linnet', journal: 'Found, filed and labelled in the Mnemosarch’s own handwriting. You have it back.',
        objectives: [{ id: 'linnet', text: 'Bring Linnet her name', talk: 'npc:linnet-dray', marker: { landmark: 'landmark:obelisk-register' } }],
        onComplete: [{ setFlag: 'duskweaver.linnet_found', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_moonstone' }] },
  },
  {
    ...A1, id: 'quest:duskweaver-bottled-shadows', name: 'Bottled Shadows', type: 'side', region: Z4, giver: 'npc:peregrine-moll',
    summary: 'The Archive of Shadows keeps every shadow Nocturne ever bottled, and since the Bell the shelves have been spilling. Under-Keeper Moll has four runaways loose and a butterfly net.',
    requires: req(done('quest:duskweaver-the-mnemosarchs-queue')), firstStage: 'catch',
    stages: [
      {
        id: 'catch', journal: 'Four runaway shadows in the stacks. Weave them back into their bottles.',
        objectives: [{ id: 'catch', text: 'Recapture the runaway shadows', interact: 'obj:runaway-shadow-*', count: 4, marker: { landmark: 'landmark:archive-stacks' } }],
        next: 'champions',
      },
      {
        id: 'champions', journal: 'One bottle was never opened. Its label is so old it is mostly a smudge, and a date: C. 0.',
        objectives: [{ id: 'bottle', text: 'Look into the oldest bottle', interact: 'obj:champions-bottle', marker: { landmark: 'landmark:archive-stacks' } }],
        next: 'moll',
      },
      {
        id: 'moll', journal: 'Twelve shadows in one bottle, standing in a ring.',
        objectives: [{ id: 'moll', text: 'Tell Under-Keeper Moll', talk: 'npc:peregrine-moll', marker: { landmark: 'landmark:archive-stacks' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-twelve-champions'] },
  },
  {
    ...A1, id: 'quest:duskweaver-the-shadow-of-a-cat', name: 'The Shadow of a Cat', type: 'side', region: Z4, giver: 'npc:cat-shadow',
    summary: 'There is a cat-shaped shadow in the Archive with no cat. It sits on the same shelf every evening and waits. Under-Keeper Moll says the cat died years ago.',
    requires: req(done('quest:duskweaver-the-mnemosarchs-queue')), firstStage: 'saucer',
    stages: [
      {
        id: 'saucer', journal: 'The cat’s shadow won’t let you near. It keeps looking at the Archive door, where there is a chipped saucer on the step that nobody has filled in nine years.',
        objectives: [{ id: 'saucer', text: 'Look at the saucer on the Archive step', interact: 'obj:duskweaver-cat-saucer', marker: { landmark: 'landmark:duskweaver-archive-step' } }],
        next: 'moll',
      },
      {
        id: 'moll', journal: 'A name is scratched round the saucer’s rim. Under-Keeper Moll has worked in the Archive for forty years. He will know whose cat it was.',
        objectives: [{ id: 'moll', text: 'Ask Under-Keeper Moll whose cat it was', talk: 'npc:peregrine-moll', marker: { landmark: 'landmark:archive-stacks' } }],
        next: 'cat',
      },
      {
        id: 'cat', journal: 'Sit with the cat’s shadow on its shelf, and see what it wants.',
        objectives: [{ id: 'cat', text: 'Decide what to do with the cat’s shadow', when: { flag: 'duskweaver.cat' }, marker: { landmark: 'landmark:archive-stacks' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },

  // ======================= ACT I: mentor thread (2) and bounties (2)
  {
    ...A1, id: 'quest:duskweaver-the-heros-name', name: 'The Hero’s Name', type: 'side', region: Z3, giver: NX,
    summary: 'Nyx would like to pin your kept name to her sleeve, so that she will stop calling you Marguerite. Your kept name is in the Obelisk’s lower register, if you can find it.',
    requires: req({ trust: NX, value: 'friendly' }, done('quest:duskweaver-chalk-the-doors')), firstStage: 'register',
    stages: [
      {
        id: 'register', journal: 'The lower register of the Obelisk, a book the size of a door, every kept name in Duskmere.',
        objectives: [{ id: 'register', text: 'Find your kept name in the register', interact: 'obj:register-hero-entry', marker: { landmark: 'landmark:obelisk-register' } }],
        next: 'nyx',
      },
      {
        id: 'nyx', journal: 'You have your name, copied on a slip. And the register’s first page, which is blank, on purpose.',
        objectives: [{ id: 'nyx', text: 'Bring Nyx your name', talk: NX, marker: { landmark: 'landmark:keepers-lodge' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, skillPoints: 1 },
  },
  {
    ...A1, id: 'quest:duskweaver-what-nyx-gave-away', name: 'What Nyx Gave Away', type: 'side', region: Z2, giver: NX,
    summary: 'Nyx says there is one memory she gave to the Gardens on purpose, forty years ago, and she has never once regretted it. She says it twice, which is how you know.',
    requires: req({ trust: NX, value: 'trusted' }, done('quest:duskweaver-the-flower-thieves')), firstStage: 'confess',
    stages: [
      {
        id: 'confess', journal: 'Sit with Nyx in the Lodge, and ask her what she gave away.',
        objectives: [{ id: 'nyx', text: 'Ask Nyx about the memory she gave away', talk: NX, marker: { landmark: 'landmark:keepers-lodge' } }],
        next: 'flower',
      },
      {
        id: 'flower', journal: 'A quarrel with her younger sister, who ran away to the warrens. It has been growing in the Gardens for forty years.',
        objectives: [{ id: 'flower', text: 'Find the flower of Nyx’s quarrel', interact: 'obj:nyx-quarrel-flower', marker: { place: Z2 } }],
        next: 'nyx',
      },
      {
        id: 'nyx', journal: 'A grey flower, very tall, with its face turned away from the Obelisk, towards the warrens.',
        objectives: [{ id: 'nyx', text: 'Tell Nyx you found it', talk: NX, marker: { landmark: 'landmark:keepers-lodge' } }],
        onComplete: [{ setFlag: 'duskweaver.nyx_devotable', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:duskweaver-bounty-belfry-bats', name: 'Bounty: the Belfry Bats', type: 'bounty', region: Z1, giver: TM,
    summary: 'A swarm of Void Bats has moved into the old bell tower and is coming down at moonrise to eat the shadows off people’s hats.',
    requires: req(done('quest:duskweaver-chalk-the-doors')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'Six of them, Constable Murk reckons, though he lost count.', objectives: [{ id: 'bats', text: 'Clear the Void Bats out of the bell tower', kill: 'bx_umbral_2', count: 6, marker: { landmark: 'landmark:old-bell-tower' } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 150 },
  },
  {
    ...A1, id: 'quest:duskweaver-bounty-old-ninefingers', name: 'Bounty: Old Ninefingers', type: 'bounty', region: Z2, giver: TM,
    summary: 'A Night Spider with one leg too many has been spinning webs across the Garden paths, and catching gardeners.',
    requires: req(done('quest:duskweaver-the-flower-thieves')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'Nine legs. Everyone has counted. Nobody likes the answer.', objectives: [{ id: 'spider', text: 'Defeat Old Ninefingers', kill: 'bx_umbral_1', count: 1, marker: { place: Z2 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 120 },
  },

  // ======================= ACT II: the class thread (C-1 … C-6) + featured bearers
  {
    ...A2, id: 'quest:duskweaver-the-sextons-register', name: 'The Sexton’s Register', type: 'class', region: 'vil:brind', giver: 'npc:hobb',
    summary: 'Concordia’s Umbral folk are few, and Old Hobb keeps their names in his sexton’s register, out in the Brindlecross churchyard. He says Brindlecross is forgetting the Concord itself.',
    requires: req(done('quest:cc-through-the-arch')), autoStart: true, firstStage: 'hobb',
    stages: [
      {
        id: 'hobb', journal: 'Ysolde says the nearest thing Concordia has to an Obelisk is Old Hobb, the sexton, who keeps everyone’s names.',
        objectives: [{ id: 'hobb', text: 'Find Old Hobb in the churchyard', talk: 'npc:hobb', marker: { landmark: 'landmark:brind-graveyard' } }],
        next: [
          { when: { flag: 'duskweaver.mourners', value: 'kept' }, to: 'corner' },
          { to: 'register' },
        ],
      },
      {
        id: 'register', journal: 'Hobb’s register is in the lych-gate box. He wants you to read the last page yourself, because he does not believe it.',
        objectives: [{ id: 'register', text: 'Read the last page of Hobb’s register', interact: 'obj:duskweaver-sexton-register', marker: { landmark: 'landmark:brind-graveyard' } }],
        next: 'corner',
      },
      {
        id: 'corner', journal: 'In the far corner of the churchyard, under the yews, Hobb keeps the graves of the Umbral folk who were stranded this side when the arches shut. Nobody else visits them. A Keeper should.',
        objectives: [{ id: 'corner', text: 'Visit the Umbral corner of the churchyard', interact: 'obj:duskweaver-umbral-corner', marker: { landmark: 'landmark:duskweaver-umbral-corner' } }],
        next: 'sealed',
      },
      {
        id: 'sealed', journal: 'The Concord’s own records were woven into the dark under the Gloamwood, and they are coming loose.',
        objectives: [],
        onComplete: [{ startQuest: 'quest:duskweaver-under-the-roots' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-duskweaver-sextons-register'] },
  },
  {
    ...A2, id: 'quest:duskweaver-under-the-roots', name: 'Under the Roots', type: 'class', region: 'region:gloam', giver: 'npc:hobb',
    summary: 'Under the Gloamwood the Concord’s records hang in the dark in loose threads. Each one you touch plays a memory of a Turning. They are coming unwoven.',
    requires: req(done('quest:duskweaver-the-sextons-register')), firstStage: 'threads',
    stages: [
      {
        id: 'threads', journal: 'Down in the root-caves, pale threads hanging from the roots like cobweb, every one of them humming.',
        objectives: [{ id: 'threads', text: 'Touch the loose threads of the Concord’s records', interact: 'obj:duskweaver-record-thread-*', count: 3, marker: { landmark: 'landmark:sentinel-umbral' } }],
        next: 'fraying',
      },
      {
        id: 'fraying', journal: 'One thread is not hanging loose. It is being pulled, very slowly, down into the dark, and it is fraying as it goes: the record of the 85th Turning, the night the crown broke.',
        objectives: [{ id: 'fraying', text: 'Catch the fraying thread of the last Turning', interact: 'obj:duskweaver-last-record', marker: { landmark: 'landmark:duskweaver-root-hollow' } }],
        next: 'down',
      },
      {
        id: 'down', journal: 'The threads all lead down, deeper, to something that is still spinning.',
        objectives: [{ id: 'lair', text: 'Go down to the Spinner Below', reach: 'inst:sentinel-umbral', marker: { landmark: 'landmark:sentinel-umbral' } }],
        onComplete: [{ startQuest: 'quest:duskweaver-the-spinner-below' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:duskweaver-the-spinner-below', name: 'The Spinner Below', type: 'class', region: 'region:gloam', giver: 'npc:hobb',
    summary: 'The Spinner Below wove every Turning into its web. When the tears came it began to unweave them, thread by thread, because they were too sad to keep.',
    requires: req(done('quest:duskweaver-under-the-roots')), firstStage: 'fight',
    stages: [
      {
        id: 'fight', journal: 'The Spinner Below is the Sentinel of the Umbral school. Win its mark.',
        objectives: [{ id: 'spinner', text: 'Defeat the Spinner Below', kill: 'bx_spinner', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-umbral' }],
        next: 'release',
      },
      {
        id: 'release', journal: 'The Spinner has folded its legs under it in the dark. It wants to say something.',
        objectives: [{ id: 'mark', text: 'Hear the Spinner out', when: { flag: 'story.sentinel.umbral' } }],
        onComplete: [{ openDialogue: 'dialogue:duskweaver-spinner-remember' }],
        next: 'write',
      },
      {
        id: 'write', journal: 'The Spinner is at rest, and the Concord’s records with it. Somebody should write that down where it will be kept. Hobb’s register is in the lych-gate box.',
        objectives: [{ id: 'write', text: 'Write the Spinner’s rest in Hobb’s register', interact: 'obj:duskweaver-sexton-register', marker: { landmark: 'landmark:brind-graveyard' } }],
        onComplete: [{ startQuest: 'quest:duskweaver-the-mnemosarchs-lights' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-umbral-spinner'] },
  },
  {
    ...A2, id: 'quest:duskweaver-the-mnemosarchs-lights', name: 'The Mnemosarch’s Lights', type: 'class', region: 'vil:ford', giver: 'npc:hester-marchbank',
    summary: 'A very polite man in a Keeper’s coat has been buying the Lantern Queen’s drowned lights at Lanternford. Every one of them holds a traveller’s last memory.',
    requires: req(done('quest:duskweaver-the-spinner-below')), firstStage: 'shop',
    stages: [
      {
        id: 'shop', journal: 'Word has come up the marsh road: the lampwright at Lanternford has had a strange customer.',
        objectives: [{ id: 'hester', text: 'Ask at the Lantern Shop in Lanternford', talk: 'npc:hester-marchbank', marker: { landmark: 'landmark:ford-lantern-shop' } }],
        next: 'escort',
      },
      {
        id: 'escort', journal: 'Tabitha will take you out along the causeway to the ford with a true lantern, so you do not follow the wrong lights. She is a lampwright, not a fighter, and the marsh is full of things that came up hollow. Keep her alive.',
        onEnter: [{ escort: 'npc:hester-marchbank', to: 'landmark:duskweaver-ford-edge' }],
        objectives: [{ id: 'hester', text: 'See Tabitha safely out to the ford’s edge', when: { any: [{ flag: 'escort.hester-marchbank', op: '==', value: 'arrived' }, { flag: 'escort.hester-marchbank', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:duskweaver-ford-edge' } }],
        next: [{ when: { flag: 'escort.hester-marchbank', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'lights' }],
      },
      {
        id: 'regroup', journal: 'Tabitha went into the reeds, and a ferryman fished her out and rowed her home to the Lantern Shop, wrapped in a sail. She has dried her lantern and lit it again and is waiting at the door.',
        onEnter: [{ escort: 'npc:hester-marchbank', to: 'landmark:duskweaver-ford-edge' }],
        objectives: [{ id: 'hester', text: 'Try again: see Tabitha out to the ford', when: { any: [{ flag: 'escort.hester-marchbank', op: '==', value: 'arrived' }, { flag: 'escort.hester-marchbank', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:duskweaver-ford-edge' } }],
        next: [{ when: { flag: 'escort.hester-marchbank', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'lights' }],
      },
      {
        id: 'lights', journal: 'There are still drowned lights bobbing in the ford that he has not bought yet. Look into them before he does.',
        objectives: [{ id: 'lights', text: 'Look into the drowned lights', interact: 'obj:duskweaver-drowned-light-*', count: 3, marker: { region: 'region:marsh' } }],
        next: 'vane',
      },
      {
        id: 'vane', journal: 'At the Bog Market, a man with a dolls’ house under his arm is haggling over a jar of light.',
        objectives: [{ id: 'vane', text: 'Confront Vane at the Bog Market', talk: 'npc:oriel-vane-lanternford', marker: { landmark: 'landmark:ford-bog-market' } }],
        onComplete: [{ startQuest: 'quest:duskweaver-the-lantern-queen' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-duskweaver-lights'] },
  },
  {
    ...A2, id: 'quest:duskweaver-the-lantern-queen', name: 'The Lantern Queen', type: 'class', region: 'region:marsh', giver: 'npc:hester-marchbank',
    summary: 'Out over Morvane Marsh the Lantern Queen sells lights that lead into the water. Vane has been her best customer. The Guile bearers cannot win her mark while she sells.',
    requires: req(done('quest:duskweaver-the-mnemosarchs-lights')), firstStage: 'marsh',
    stages: [
      {
        id: 'marsh', journal: 'Follow the lanterns out over the black water, and don’t follow them too far.',
        objectives: [{ id: 'lair', text: 'Go out to the Drowned Lights', reach: 'inst:sentinel-guile', marker: { landmark: 'landmark:sentinel-guile' } }],
        next: 'queen',
      },
      {
        id: 'queen', journal: 'The Lantern Queen is the Sentinel of the Guile school. Free her, and the Jester bearer can claim the mark.',
        objectives: [{ id: 'queen', text: 'Free the Lantern Queen', kill: 'bx_lanternqueen', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-guile' }, { setFlag: 'story.bearer.jester', value: true }],
        next: 'ledger',
      },
      {
        id: 'ledger', journal: 'The Queen is free, and her lights have gone out. On the drowned stump where she kept her stall there is a book, and it has his handwriting in it.',
        objectives: [{ id: 'ledger', text: 'Read the Lantern Queen’s sales-book', interact: 'obj:duskweaver-queen-ledger' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300 },
  },
  {
    ...A2, id: 'quest:duskweaver-a-letter-from-nyx', name: 'A Letter from Nyx', type: 'class', region: 'vil:brind', giver: NX,
    summary: 'A Keeper’s courier has come through the Umbral arch with a letter for you. It is addressed to somebody else entirely.',
    requires: req(done('quest:duskweaver-the-lantern-queen')), autoStart: true, firstStage: 'letter',
    stages: [
      {
        id: 'letter', journal: 'Tansy Fogg, Keeper-courier, is waiting at the Gate Circle with a letter and an apologetic face.',
        objectives: [{ id: 'tansy', text: 'Meet the Keeper-courier at the Gate Circle', talk: 'npc:tansy-fogg', marker: { landmark: 'landmark:gate-circle' } }],
        next: 'reply',
      },
      {
        id: 'reply', journal: 'Tansy will carry back anything you say, even nothing. Her courier’s satchel is hung on the post by the Umbral arch, open, with pen and paper in it.',
        objectives: [{ id: 'reply', text: 'Write Nyx a reply for Tansy to carry home', interact: 'obj:duskweaver-reply-to-nyx', marker: { landmark: 'landmark:gate-circle' } }],
        onComplete: [{ setFlag: 'story.act2_ready', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:duskweaver-the-frozen-hour', name: 'The Frozen Hour', type: 'side', region: 'vil:ford', giver: 'npc:bearer-rimecaller',
    summary: 'The Rimecaller bearer wants to freeze one of the Lantern Queen’s lights, so that its memory is kept for ever. You are a Duskweaver. You have opinions about keeping things for ever.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'light',
    stages: [
      {
        id: 'light', journal: 'The last drowned light in the ford, bobbing by the Ford Keeper’s steps. Ilse Winterbourne has her hand out over it, and frost on her fingers.',
        objectives: [{ id: 'light', text: 'Decide the last light’s fate with the Rimecaller bearer', interact: 'obj:duskweaver-last-light', marker: { landmark: 'landmark:ford-ford-keeper' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Ilse has not said what she thinks. Rimecallers think slowly, and all the way through.',
        // co-op: if a party member plays the Rimecaller, they ARE this bearer (the NPC is hidden)
        objectives: [{ id: 'ilse', text: 'Talk to the Rimecaller bearer', when: { any: [{ flag: 'duskweaver.ilse_thanked' }, { partyHasClass: 'rimecaller' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.rimecaller', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A2, id: 'quest:duskweaver-threads-under-the-wood', name: 'Threads Under the Wood', type: 'side', region: 'region:gloam', giver: 'npc:bearer-huntsman',
    summary: 'The Huntsman bearer is tracking the Spinner Below through the root-caves and has run out of tracks. Spiders leave threads, not prints. She needs a Duskweaver to read them.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'web',
    stages: [
      {
        id: 'web', journal: 'Three trail-threads in the root-caves, each one humming with whatever passed along it last.',
        objectives: [{ id: 'web', text: 'Read the Spinner’s trail-threads for the Huntsman bearer', interact: 'obj:duskweaver-spinner-trail-*', count: 3, marker: { landmark: 'landmark:sentinel-umbral' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Ulla Fenwright has what she needs, and a look on her face like a hound with a scent.',
        objectives: [{ id: 'ulla', text: 'Talk to the Huntsman bearer', when: { any: [{ flag: 'duskweaver.ulla_thanked' }, { partyHasClass: 'huntsman' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.huntsman', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  // ======================= ACT III: class quests (III-4 + 3 side)
  {
    ...A3, id: 'quest:duskweaver-the-herald-of-memory', name: 'The Herald of Memory', type: 'class', region: 'region:heart', giver: 'npc:casimir',
    summary: 'At the top of the Twelve Stairs stands the Hollow King’s Herald, his robe embroidered with every memory he ever took, ringing a bell that plays your own old fights back around you. It is Oriel Vane, and he remembers your name.',
    requires: req(done('quest:heart-stairs')), autoStart: true, firstStage: 'herald',
    stages: [
      { id: 'herald', journal: 'Vane has become the Herald of Memory: a shelf that never ends, with nothing on it ever let go.', objectives: [{ id: 'herald', text: 'Face the Herald of Memory', kill: 'cb_herald-of-memory', count: 1, marker: { landmark: 'landmark:twelve-stairs-top' } }], onComplete: [{ openDialogue: 'dialogue:duskweaver-herald-fate' }], next: 'fate' },
      { id: 'fate', journal: 'Vane is kneeling on the stair while his robe comes unstitched, holding on to every thread.', objectives: [{ id: 'fate', text: 'Decide Vane’s fate', when: { flag: 'duskweaver.nemesis_fate' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 3 },
  },
  {
    ...A3, id: 'quest:duskweaver-nyxs-kept-name', name: 'Nyx’s Kept Name', type: 'side', region: 'region:heart', giver: NX,
    summary: 'Nyx is afraid of forgetting the one name she ought to keep. She would like it kept somewhere she can’t lose it: spoken once, aloud, to the crown.',
    requires: req({ flag: 'duskweaver.nyx_letter_read' }, done('quest:heart-citadel')), autoStart: true, firstStage: 'landing',
    stages: [
      { id: 'landing', journal: 'Before you say a name to the crown, you had better have it straight. Halfway up the Umbral stair there is a landing where it is quiet enough to remember properly.', objectives: [{ id: 'landing', text: 'Sit a moment on the Umbral stair landing, and remember Nyx', interact: 'obj:duskweaver-stair-landing', marker: { landmark: 'landmark:duskweaver-stair-landing' } }], next: 'name' },
      { id: 'name', journal: 'The throne-room door is open now. From the top of the Twelve Stairs you can see straight through the Citadel to the crown.', objectives: [{ id: 'name', text: 'Speak Nyx’s name to the crown', interact: 'obj:duskweaver-crown-name', marker: { landmark: 'landmark:twelve-stairs-top' } }], next: 'lantern' },
      { id: 'lantern', journal: 'It is said, and it is kept. In Duskmere, when somebody leaves, the street hangs a lantern so they can find the way back. Somebody should do the same here, at the edge of the Heart, for the way home.', objectives: [{ id: 'lantern', text: 'Hang a leaving-lantern at the Heart camp', interact: 'obj:duskweaver-heart-lantern', marker: { landmark: 'landmark:heart-camp' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A3, id: 'quest:duskweaver-the-stolen-hours', name: 'The Stolen Hours', type: 'side', region: 'region:heart', giver: NX,
    summary: 'Vane’s phials are scattered all through the Legion camp, each one a memory with a label. The hollowed there have nothing left to remember. Give them back.',
    requires: req(done('quest:heart-legion')), autoStart: true, firstStage: 'phials',
    stages: [
      { id: 'phials', journal: 'Glass phials in the dust, labelled in Vane’s tidy hand. Beside each one, somebody who has forgotten it.', objectives: [{ id: 'phials', text: 'Give back the stolen memories', interact: 'obj:duskweaver-stolen-phial-*', count: 3, marker: { landmark: 'landmark:legion-camp' } }], next: 'button' },
      { id: 'button', journal: 'One phial is left in the dust, and there is nobody standing beside it. The label has your name on it.', objectives: [{ id: 'button', text: 'Pick up the phial with your name on it', interact: 'obj:duskweaver-button-phial', marker: { landmark: 'landmark:legion-camp' } }], next: 'shelf' },
      { id: 'shelf', journal: 'The Archive of Shadows keeps its opened bottles on a shelf by the door, so everyone can see what went home. The Heart camp has a supply crate. It will do.', objectives: [{ id: 'shelf', text: 'Set the empty phials out by the Heart camp fire', interact: 'obj:duskweaver-phial-shelf', marker: { landmark: 'landmark:heart-camp' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A3, id: 'quest:duskweaver-the-cat-comes-too', name: 'The Cat Comes Too', type: 'side', region: 'region:heart', giver: 'npc:cat-shadow-heart',
    summary: 'The cat’s shadow from the Archive has followed you to the Heart. It has also adopted a cat: Nan Briar’s Parson, who has opinions about it.',
    requires: req(done('quest:heart-wall'), done('quest:duskweaver-the-shadow-of-a-cat')), autoStart: true, firstStage: 'prints',
    stages: [
      { id: 'prints', journal: 'Two sets of paw prints in the ash of the Legion camp, side by side, one of them dark and not quite touching the ground. Something has walked a very long way to get here.', objectives: [{ id: 'prints', text: 'Follow the two sets of paw prints', interact: 'obj:duskweaver-paw-prints', marker: { landmark: 'landmark:legion-camp' } }], next: 'cat' },
      { id: 'cat', journal: 'There is a large black cat on the Heart camp’s supply crates, with one shadow too many.', objectives: [{ id: 'cat', text: 'See to Parson and his second shadow', talk: 'npc:cat-shadow-heart', marker: { landmark: 'landmark:heart-camp' } }], next: 'saucer' },
      { id: 'saucer', journal: 'A cat with two shadows needs two saucers. The camp cook has a chipped one going spare, and a pin to scratch a name on it.', objectives: [{ id: 'saucer', text: 'Set out a saucer for the shadow by the cook-fire', interact: 'obj:duskweaver-heart-saucer', marker: { landmark: 'landmark:duskweaver-cook-fire' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1 },
  },
];

export default quests;
