/**
 * Hollow Crown: the KNIGHT campaign (docs/lore/hollow-crown/06-outlines/iron.md). Act I in Anvilgate
 * (area:iron-capital) and the Act II class thread in Concordia. Act III class quests land with the Heart.
 * Built on the Ash reference (10-campaign-style.md). Owner: Claude 4.
 */
import type { NarrativeCondition, QuestDef } from '@/core';

const KN: NarrativeCondition = { heroClass: 'knight' };
const done = (q: `quest:${string}`): NarrativeCondition => ({ questCompleted: q });
const req = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: [KN, ...c] });
const A1 = { act: 'act1' as const, campaign: 'knight', chapter: 'Anvilgate' };
const A2 = { act: 'act2' as const, campaign: 'knight', chapter: 'Concordia' };
const A3 = { act: 'act3' as const, campaign: 'knight', chapter: 'The Heart' };
const Z1 = 'zone:iron-capital-1' as const, Z2 = 'zone:iron-capital-2' as const, Z3 = 'zone:iron-capital-3' as const, Z4 = 'zone:iron-capital-4' as const;
const L1 = 'inst:iron-capital-lair-1' as const, L2 = 'inst:iron-capital-lair-2' as const, L3 = 'inst:iron-capital-lair-3' as const;
const GM = 'npc:gideon-marke' as const, KB = 'npc:konrad-berenikson' as const, AV = 'npc:ansel-varley' as const;

const quests: QuestDef[] = [
  // ======================= ACT I: main (I-1 … I-10)
  {
    ...A1, id: 'quest:knight-the-vigil', name: 'The Vigil', type: 'main', region: Z1, giver: GM,
    summary: 'The night before your dubbing, alone in the Order’s chapel with an unpainted shield. Then a bell rang, and every anvil in Anvilgate rang back.',
    requires: KN, autoStart: true, firstStage: 'vigil',
    stages: [
      {
        id: 'vigil', journal: 'A squire keeps vigil all night before the dubbing, on their knees, beside their blank shield. Leaving the chapel before dawn is, technically, a hanging offence.',
        onEnter: [{ openDialogue: 'dialogue:knight-vigil-night' }],
        objectives: [{ id: 'shield', text: 'Take up your unpainted shield', interact: 'obj:vigil-shield', marker: { landmark: 'landmark:order-chapel' } }],
        next: 'gideon',
      },
      {
        id: 'gideon', journal: 'You walked out of your vigil after a song nobody else could hear. Somebody in an old grey cloak has noticed.',
        objectives: [{ id: 'gideon', text: 'Face the old knight on the chapel steps', talk: GM, marker: { landmark: 'landmark:order-chapel' } }],
        onComplete: [{ setFlag: 'knight.bell_heard', value: true }],
        next: 'breach',
      },
      {
        id: 'breach', journal: 'Dawn. Gideon wants to see the walls in daylight before he says anything. He has walked off towards the first of the three holes the Colossus made, and he walks fast for an old man.',
        objectives: [{ id: 'breach', text: 'Walk with Gideon to the Colossus’s breach', reach: 'landmark:knight-colossus-breach', marker: { landmark: 'landmark:knight-colossus-breach' } }],
        next: 'quarters',
      },
      {
        id: 'quarters', journal: 'Ser Gideon’s quarters: a bare room, a cold hearth, a pot of paint, and a kettle. He is putting the kettle on, which seems to be the first thing anybody in Ironhold does in a crisis.',
        objectives: [{ id: 'gideon', text: 'Hear Ser Gideon out in his quarters', talk: GM, marker: { landmark: 'landmark:gideon-quarters' } }],
        onComplete: [{ startQuest: 'quest:knight-forty-gates' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-ironhold', 'lore:hc-iron-colossus'] },
  },
  {
    ...A1, id: 'quest:knight-forty-gates', name: 'Forty Gates', type: 'main', region: Z1, giver: GM,
    summary: 'Ser Gideon has given you a sealed letter for the Chapterhouse and a purse of toll-pennies. Between his door and theirs stand forty gates.',
    requires: req(done('quest:knight-the-vigil')), firstStage: 'tolls',
    stages: [
      {
        id: 'tolls', journal: 'Anvilgate has walls inside its walls inside its walls, and a toll at every gate. Pay your way across the Wards.',
        objectives: [{ id: 'tolls', text: 'Pay the toll at the inner gates', interact: 'obj:anvilgate-toll-gate-*', count: 6, marker: { place: Z1 } }],
        next: 'sentries',
      },
      {
        id: 'sentries', journal: 'The Iron Sentries at the inner gates are ringing wrong. Black tears weep from their rivets, and they have turned their pikes on the people paying.',
        objectives: [{ id: 'sentries', text: 'Stop the weeping Iron Sentries', kill: 'bx_iron_0', count: 4, marker: { place: Z1 } }],
        next: 'chapter',
      },
      {
        id: 'chapter', journal: 'Through the fortieth gate, with three pennies left, a dented shield and the letter still sealed.',
        objectives: [{ id: 'varley', text: 'Deliver Gideon’s letter to the Chapter-Master', talk: AV, marker: { landmark: 'landmark:order-chapterhouse' } }],
        onComplete: [{ startQuest: 'quest:knight-the-barrow-vigil' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40 },
  },
  {
    ...A1, id: 'quest:knight-the-barrow-vigil', name: 'The Barrow Vigil', type: 'main', region: Z2, giver: AV,
    summary: 'Squires who keep their vigils in the Barrow of Knights are coming back up hollow-eyed. Something down there is still keeping a vigil of its own.',
    requires: req(done('quest:knight-forty-gates')), firstStage: 'stair',
    stages: [
      {
        id: 'stair', journal: 'The Barrow of Knights lies under the Tilt Yard: the Order’s crypts, and the tomb of Queen Berenika, who has no body in it.',
        objectives: [{ id: 'enter', text: 'Go down the Barrow stair', reach: L1, marker: { landmark: 'landmark:barrow-stair' } }],
        onComplete: [{ openDialogue: 'dialogue:knight-revenant-salute' }],
        next: 'revenant',
      },
      {
        id: 'revenant', journal: 'Ser Roswitha Dunne, Berenika’s champion, swore to guard the tomb until the crown came home. She salutes before every pass. Honour the salute.',
        objectives: [{ id: 'revenant', text: 'Duel the Iron Revenant', kill: 'bx_iron_3', count: 1 }],
        next: 'tomb',
      },
      {
        id: 'tomb', journal: 'She lowered her sword at last. The tomb is wet with black tears, and the floor around it still rings like a struck bell.',
        objectives: [{ id: 'tomb', text: 'Lay Ser Roswitha down at the Queen’s tomb', interact: 'obj:berenika-tomb' }],
        onComplete: [{ setFlag: 'knight.revenant_rest', value: true }],
        next: 'report',
      },
      {
        id: 'report', journal: 'The Barrow is quiet. Ser Gideon knew her. Someone should tell him.',
        objectives: [{ id: 'gideon', text: 'Tell Ser Gideon that Roswitha is at rest', talk: GM, marker: { landmark: 'landmark:gideon-quarters' } }],
        onComplete: [{ startQuest: 'quest:knight-the-prince-regents-purse' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 80, hcItems: [{ item: 'a_iron_plate_helm' }], lore: ['lore:hc-barrow-of-knights'] },
  },
  {
    ...A1, id: 'quest:knight-the-prince-regents-purse', name: 'The Prince-Regent’s Purse', type: 'main', region: Z2, giver: KB,
    summary: 'The Tilt Yard is holding its first tourney since the Bell. The Prince-Regent himself is riding, in borrowed armour, and nobody can work out why.',
    requires: req(done('quest:knight-the-barrow-vigil')), firstStage: 'lists',
    stages: [
      {
        id: 'lists', journal: 'The whole Order has turned out for the tilt. There is bunting, which the Order disapproves of, and a great deal of shouting, which it does not.',
        objectives: [{ id: 'lists', text: 'Go to the tilt at the lists', reach: 'landmark:tilt-yard-lists', marker: { landmark: 'landmark:tilt-yard-lists' } }],
        next: 'konrad',
      },
      {
        id: 'konrad', journal: 'The Prince-Regent won, gave the entire purse to the squires, and is now walking towards you with his helm under his arm.',
        objectives: [{ id: 'konrad', text: 'Speak with Prince-Regent Konrad', talk: KB, marker: { landmark: 'landmark:tilt-yard-lists' } }],
        onComplete: [{ setFlag: 'knight.konrad_met', value: true }],
        next: 'stables',
      },
      {
        id: 'stables', journal: 'The purse has already been spent: the squires have new horses, delivered to the Order’s stables within the hour. Wat Mudge has dragged you off to see them.',
        objectives: [{ id: 'horses', text: 'Look at the squires’ new horses in the stables', interact: 'obj:knight-new-horse-*', count: 3, marker: { landmark: 'landmark:knight-order-stables' } }],
        onComplete: [{ startQuest: 'quest:knight-the-colossus-vote' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 60, lore: ['lore:hc-regency'] },
  },
  {
    ...A1, id: 'quest:knight-the-colossus-vote', name: 'The Colossus Vote', type: 'main', region: Z3, giver: KB,
    summary: 'The Iron Colossus is standing at the Iron Gate, waiting for a king. The Council of the Forge meets to decide what to do with thirty years of work.',
    requires: req(done('quest:knight-the-prince-regents-purse')), firstStage: 'canvass',
    stages: [
      {
        id: 'canvass', journal: 'Gideon says a knight should know what a vote costs before casting it. The people who made the Colossus are in the Forge. The people who made the Wall are on it.',
        objectives: [
          { id: 'blum', text: 'Ask Forgemistress Blum what the Forge made', talk: 'npc:marit-blum', marker: { landmark: 'landmark:forge-rivet-benches' } },
          { id: 'jarek', text: 'Ask Old Jarek what the Wall cost', talk: 'npc:old-jarek', marker: { landmark: 'landmark:wall-masons-stair' } },
        ],
        next: 'vote',
      },
      {
        id: 'vote', journal: 'The Council of the Forge sits in the great hall of the Fortress Forge. The Regency, the Order and the Brotherhood all have seats. You have a squire’s stool, and the Prince-Regent’s colours.',
        objectives: [{ id: 'vote', text: 'Attend the Council of the Forge', when: { flag: 'knight.colossus_vote' }, marker: { landmark: 'landmark:council-of-the-forge' } }],
        next: 'dawn',
      },
      {
        id: 'dawn', journal: 'Whatever the Council decided, it begins at dawn at the Iron Gate. From the wall-walk you can see the whole road down to it.',
        objectives: [{ id: 'walk', text: 'Watch the dawn from the wall-walk', interact: 'obj:knight-council-dawn', marker: { landmark: 'landmark:wall-walk-steps' } }],
        onComplete: [{ startQuest: 'quest:knight-the-blank-shield' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-order-of-the-anvil'] },
  },
  {
    ...A1, id: 'quest:knight-the-blank-shield', name: 'The Blank Shield', type: 'main', region: Z1, giver: GM,
    summary: 'Whatever the Council decided, it needs the realm’s roll of arms, and the Heraldry Vault has gone blank.',
    requires: req(done('quest:knight-the-colossus-vote')), firstStage: 'why',
    stages: [
      {
        id: 'why', journal: 'The Council has voted.', objectives: [],
        next: [
          { when: { flag: 'knight.colossus_vote', value: 'march' }, to: 'march' },
          { when: { flag: 'knight.colossus_vote', value: 'writ' }, to: 'writ' },
          { to: 'wall' },
        ],
      },
      {
        id: 'march', journal: 'The Regency wants its banners painted for the march, every house in its own colours, and the colours are all on the roll of arms in the Heraldry Vault.',
        objectives: [{ id: 'door', text: 'Go to the Heraldry Vault', reach: 'landmark:heraldry-vault-door', marker: { landmark: 'landmark:heraldry-vault-door' } }],
        next: 'vault',
      },
      {
        id: 'wall', journal: 'The Order has voted to strike Berenika from the roll of arms at last, as if thirty years of walls were not enough. The roll is in the Heraldry Vault.',
        objectives: [{ id: 'door', text: 'Go to the Heraldry Vault', reach: 'landmark:heraldry-vault-door', marker: { landmark: 'landmark:heraldry-vault-door' } }],
        next: 'vault',
      },
      {
        id: 'writ', journal: 'The Council wants the Queen’s writ entered on the roll of arms beside her name, where it should have been all along. The roll is in the Heraldry Vault.',
        objectives: [{ id: 'door', text: 'Go to the Heraldry Vault', reach: 'landmark:heraldry-vault-door', marker: { landmark: 'landmark:heraldry-vault-door' } }],
        next: 'vault',
      },
      {
        id: 'vault', journal: 'The heralds came out of the Vault white-faced. Every shield on its walls has been scraped bare.',
        objectives: [{ id: 'enter', text: 'Enter the Heraldry Vault', reach: L2, marker: { landmark: 'landmark:heraldry-vault-door' } }],
        next: 'shield',
      },
      {
        id: 'shield', journal: 'Thirty years of crests, scraped off Ironhold’s shields in shame, have gathered into one nameless suit of armour. It is wearing your blank shield’s face.',
        objectives: [{ id: 'shield', text: 'Defeat the Blank Shield', kill: 'cb_blank-shield', count: 1 }],
        next: 'roll',
      },
      {
        id: 'roll', journal: 'One crest surfaced on the empty armour as it fell: a small anvil. Behind it, on its lectern, the roll of arms.',
        objectives: [{ id: 'roll', text: 'Take up the roll of arms', interact: 'obj:heraldry-roll' }],
        onComplete: [{ setFlag: 'knight.roll_of_arms', value: true }, { startQuest: 'quest:knight-a-king-for-the-colossus' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 120, lore: ['lore:hc-roll-of-arms'] },
  },
  {
    ...A1, id: 'quest:knight-a-king-for-the-colossus', name: 'A King for the Colossus', type: 'main', region: Z3, giver: GM,
    summary: 'The newest entry on the roll of arms is in the Prince-Regent’s own hand: the Iron Colossus, under Berenika’s arms, with a heart-socket the size of a half-stone.',
    requires: req(done('quest:knight-the-blank-shield')), firstStage: 'gideon',
    stages: [
      {
        id: 'gideon', journal: 'Gideon can read heraldry the way other people read faces.',
        objectives: [{ id: 'gideon', text: 'Show Ser Gideon the roll of arms', talk: GM, marker: { landmark: 'landmark:gideon-quarters' } }],
        next: 'forge',
      },
      {
        id: 'forge', journal: 'Before you face Konrad, look at what he has been building. The Colossus’s old bay in the Forge is full of his work: plans, tags, a mould the size of a cart.',
        objectives: [{ id: 'clues', text: 'Search the Colossus’s bay in the Forge', interact: 'obj:knight-cradle-clue-*', count: 3, marker: { landmark: 'landmark:colossus-cradle' } }],
        next: 'cradle',
      },
      {
        id: 'cradle', journal: 'Konrad is at the Colossus’s empty cradle in the Forge, where it stood for thirty years before it walked out through three walls.',
        objectives: [{ id: 'konrad', text: 'Confront Konrad at the Colossus cradle', talk: KB, marker: { landmark: 'landmark:colossus-cradle' } }],
        onComplete: [{ setFlag: 'knight.konrad_turned', value: true }, { startQuest: 'quest:knight-the-forge-throne' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-fortress-forge'] },
  },
  {
    ...A1, id: 'quest:knight-the-forge-throne', name: 'The Forge Throne', type: 'main', region: L3, giver: GM,
    summary: 'The Forge half of the Iron stone has lain under the Regency’s throne for thirty years and would not come out for Konrad. It will come out for you, and he knows it.',
    requires: req(done('quest:knight-a-king-for-the-colossus')), firstStage: 'descend',
    stages: [
      {
        id: 'descend', journal: 'Into the heart of the Fortress Forge, where the great hammers fall in time. Your half-stone is ringing with them.',
        objectives: [{ id: 'enter', text: 'Go down to the Forge Throne', reach: L3, marker: { place: Z3 } }],
        next: 'konrad',
      },
      {
        id: 'konrad', journal: 'Konrad stands before the throne in his grandmother’s armour, conducting the hammers. Lure them onto his own shield-wall.',
        objectives: [{ id: 'konrad', text: 'Defeat Prince-Regent Konrad', kill: 'cb_konrad', count: 1 }],
        next: 'stone',
      },
      {
        id: 'stone', journal: 'Konrad fell back towards the forge rails. Under the throne, something is singing your name.',
        objectives: [{ id: 'stone', text: 'Lift the Forge half from under the throne', interact: 'obj:iron-capital-halfstone' }],
        onComplete: [{ setFlag: 'knight.halfstone', value: true }, { startQuest: 'quest:knight-the-dubbing-on-the-wall' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, skillPoints: 1, lore: ['lore:hc-half-stones'] },
  },
  {
    ...A1, id: 'quest:knight-the-dubbing-on-the-wall', name: 'The Dubbing on the Wall', type: 'main', region: Z4, giver: GM,
    summary: 'Konrad rode the forge line out towards the Iron Gate. You have the Forge half, and no spurs, and no arms on your shield. Ser Gideon has sent for you to come up onto Berenika’s Wall.',
    requires: req(done('quest:knight-the-forge-throne')), firstStage: 'wall',
    stages: [
      {
        id: 'wall', journal: 'Gideon is waiting on the highest tower of the Wall of Shame, where it is cracking worst.',
        objectives: [{ id: 'gideon', text: 'Climb to Ser Gideon on the Wall', talk: GM, marker: { landmark: 'landmark:wall-dubbing-tower' } }],
        onComplete: [{ setFlag: 'knight.gideon_farewell', value: true }],
        next: 'toll',
      },
      {
        id: 'toll', journal: 'Halfway down the gate road stands the Last Toll, the forty-first gate, where every knight who rode out of Ironhold paid a single penny for the road home. Nobody has paid it in thirty years.',
        objectives: [{ id: 'toll', text: 'Pay the Last Toll on the gate road', interact: 'obj:knight-last-toll', marker: { landmark: 'landmark:knight-last-toll' } }],
        next: 'road',
      },
      {
        id: 'road', journal: 'The gate road runs down from the Wall to the Iron Gate, where the Colossus stands waiting for a king.',
        objectives: [{ id: 'gate', text: 'Take the gate road to the Iron Gate', reach: 'area:iron-gate', marker: { place: 'area:iron-gate' } }],
        onComplete: [{ startQuest: 'quest:knight-the-iron-gate' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:knight-the-iron-gate', name: 'The Iron Gate', type: 'main', region: 'area:iron-gate', giver: GM,
    summary: 'The Iron Colossus stands before the Iron Gate, weeping hollow iron from every rivet. It has not looked at Konrad once.',
    requires: req(done('quest:knight-the-dubbing-on-the-wall')), firstStage: 'colossus',
    stages: [
      {
        id: 'colossus', journal: 'Hold the line against its fists, then climb its arm to the heart-socket and clear the hollow iron out of it.',
        onEnter: [{ openDialogue: 'dialogue:knight-colossus-waits' }],
        objectives: [{ id: 'colossus', text: 'Stand against the Iron Colossus', kill: 'bx_iron_5', count: 1 }],
        next: 'gate',
      },
      {
        id: 'gate', journal: 'The Colossus has knelt facing Concordia, like a knight waiting to be told to rise. Behind it, the Iron Gate weeps.',
        objectives: [{ id: 'seal', text: 'Open the Iron Gate with the Forge half', interact: 'obj:iron-gate-seal' }],
        onComplete: [{ setFlag: 'story.gate_open', value: true }, { setFlag: 'story.act', value: 2 }, { setFlag: 'knight.act1_done', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 200, lore: ['lore:hc-realm-gates'] },
  },

  // ======================= ACT I: side quests (2 per zone)
  {
    ...A1, id: 'quest:knight-hildes-tenth-key', name: 'Hilde’s Tenth Key', type: 'side', region: Z1, giver: 'npc:hilde-ninelocks',
    summary: 'Toll-keeper Hilde Ninelocks has nine keys and ten gates on her street, and it is keeping her up at night.',
    requires: req(done('quest:knight-the-vigil')), firstStage: 'gates',
    stages: [
      {
        id: 'gates', journal: 'Try Hilde’s keys in the gates of Lantern Street, one by one, and find the gate that should not exist.',
        objectives: [{ id: 'gates', text: 'Try Hilde’s keys in her gates', interact: 'obj:hilde-gate-*', count: 3, marker: { landmark: 'landmark:hilde-toll-house' } }],
        next: 'tenth',
      },
      {
        id: 'tenth', journal: 'None of the nine keys fits the gate by the bakery. There is a smell of bread coming through it.',
        objectives: [{ id: 'bakery', text: 'Look through the tenth gate', interact: 'obj:bakery-gate' }],
        next: 'hilde',
      },
      {
        id: 'hilde', journal: 'The tenth gate was built round a bakery by mistake in C. 1031. Corisande Brack has paid a toll to reach her own oven every morning since.',
        objectives: [{ id: 'hilde', text: 'Tell Hilde about the tenth gate', talk: 'npc:hilde-ninelocks', marker: { landmark: 'landmark:hilde-toll-house' } }],
        next: 'bakery',
      },
      {
        id: 'bakery', journal: 'Hilde wants to know why Corisande Brack never once complained. Go round to the bakery, by the front, and ask her.',
        objectives: [{ id: 'bakery', text: 'Ask Corisande Brack about the penny', interact: 'obj:knight-brack-oven', marker: { landmark: 'landmark:knight-brack-bakery' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 50, hcItems: [{ item: 'i_bread', qty: 3 }] },
  },
  {
    ...A1, id: 'quest:knight-the-office-of-public-contrition', name: 'The Office of Public Contrition', type: 'side', region: Z1, giver: 'npc:absalom-bray',
    summary: 'Clerk Absalom Bray has written Concordia one formal apology a day for thirty years. He has never sent one.',
    requires: req(done('quest:knight-forty-gates')), firstStage: 'shelves',
    stages: [
      {
        id: 'shelves', journal: 'Ten thousand, nine hundred and fifty letters, filed by date. Bray would like a second opinion on the prose.',
        objectives: [{ id: 'shelves', text: 'Read the apologies on Bray’s shelves', interact: 'obj:contrition-shelves', marker: { landmark: 'landmark:office-of-contrition' } }],
        next: 'bray',
      },
      {
        id: 'bray', journal: 'They are very good apologies. Some of them are beautiful. None of them has ever left the room.',
        objectives: [{ id: 'bray', text: 'Talk to Clerk Bray about the newest letter', talk: 'npc:absalom-bray', marker: { landmark: 'landmark:office-of-contrition' } }],
        next: 'first',
      },
      {
        id: 'first', journal: 'Letter number one is missing from Bray’s shelves. He wrote it the morning after the Hollowing and left it in the Chapterhouse post-basket, and never had the courage to go back for it.',
        objectives: [{ id: 'first', text: 'Find letter number one in the Chapterhouse post-basket', interact: 'obj:knight-bray-first-letter', marker: { landmark: 'landmark:order-chapterhouse' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 30, lore: ['lore:hc-office-of-contrition'] },
  },
  {
    ...A1, id: 'quest:knight-the-dented-lance', name: 'The Dented Lance', type: 'side', region: Z2, giver: 'npc:wat-mudge',
    summary: 'Squire Wat Mudge is cheerful, brave and the worst jouster in the Order. His father arrives at noon to watch him tilt.',
    requires: req(done('quest:knight-the-barrow-vigil')), firstStage: 'quintain',
    stages: [
      {
        id: 'quintain', journal: 'Three passes at the quintain. Wat needs to hit it with the lance, rather than the lance with his face.',
        objectives: [{ id: 'passes', text: 'Coach Wat through three passes at the quintain', interact: 'obj:tilt-quintain-*', count: 3, marker: { landmark: 'landmark:tilt-yard-lists' } }],
        next: 'wat',
      },
      {
        id: 'wat', journal: 'His father is in the stands, with a face like a closed gate.',
        objectives: [{ id: 'wat', text: 'See Wat through his tilt', talk: 'npc:wat-mudge', marker: { landmark: 'landmark:tilt-yard-lists' } }],
        next: 'father',
      },
      {
        id: 'father', journal: 'Wat’s father is still in the stands, after everyone else has gone, holding something long wrapped in sacking. Wat has gone to see to his horse and asked you to go first.',
        objectives: [{ id: 'father', text: 'Go up into the stands to Wat’s father', interact: 'obj:knight-mudge-father', marker: { landmark: 'landmark:knight-tilt-stands' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 60 },
  },
  {
    ...A1, id: 'quest:knight-a-horse-called-duty', name: 'A Horse Called Duty', type: 'side', region: Z2, giver: 'npc:duty',
    summary: 'Duty, Queen Berenika’s last destrier, is thirty-eight years old and has refused to leave his stall since the Bell. He keeps looking at you.',
    requires: req(done('quest:knight-the-barrow-vigil')), firstStage: 'route',
    stages: [
      {
        id: 'route', journal: 'The grooms say Berenika rode the same way every evening: the Tilt Yard, the Lantern Arch, the old chapel, the Wall. Duty knows the way better than you do.',
        objectives: [{ id: 'route', text: 'Walk Duty along the Queen’s old route', interact: 'obj:queens-route-*', count: 3, marker: { landmark: 'landmark:duty-stall' } }],
        next: 'wall',
      },
      {
        id: 'wall', journal: 'Duty has stopped at the foot of the Wall and will not move another step.',
        objectives: [{ id: 'stop', text: 'See why Duty stopped', interact: 'obj:duty-saddle' }],
        next: 'home',
      },
      {
        id: 'home', journal: 'He has walked the Queen’s last ride for her. He seems lighter for it.',
        objectives: [{ id: 'duty', text: 'Walk Duty home to his stall', talk: 'npc:duty', marker: { landmark: 'landmark:duty-stall' } }],
        onComplete: [{ setFlag: 'knight.duty_walked', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-queens-last-ride'] },
  },
  {
    ...A1, id: 'quest:knight-hollow-rivets', name: 'Hollow Rivets', type: 'side', region: Z3, giver: 'npc:marit-blum',
    summary: 'Forgemistress Marit Blum’s riveters are going quiet at their benches, one by one, and she would like to know why before she runs out of riveters.',
    requires: req(done('quest:knight-the-prince-regents-purse')), firstStage: 'crates',
    stages: [
      {
        id: 'crates', journal: 'The quiet benches are the ones nearest the new rivet crates.',
        objectives: [{ id: 'crates', text: 'Search the rivet crates', interact: 'obj:rivet-crate-*', count: 3, marker: { landmark: 'landmark:forge-rivet-benches' } }],
        next: 'blum',
      },
      {
        id: 'blum', journal: 'Every crate is tagged the same way, in the same square hand: “Hollow Lode. M. Ruhl.”',
        objectives: [{ id: 'blum', text: 'Show Forgemistress Blum the tags', talk: 'npc:marit-blum', marker: { landmark: 'landmark:forge-rivet-benches' } }],
        next: 'lift',
      },
      {
        id: 'lift', journal: 'The crates come up from the Deepworks in the great cage-lift at the edge of the Forge. Its loading ledger will say where else the Hollow Lode iron went.',
        objectives: [{ id: 'ledger', text: 'Read the cage-lift’s loading ledger', interact: 'obj:knight-lift-ledger', marker: { landmark: 'landmark:knight-deepworks-lift' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 70 },
  },
  {
    ...A1, id: 'quest:knight-the-replica-crown', name: 'The Replica Crown', type: 'side', region: Z3, giver: 'npc:marit-blum',
    summary: 'In the oldest hall of the Forge is a practice crown, made in C. 1012 so that the Iron Concordant could rehearse handing the real one to Fist.',
    requires: req(done('quest:knight-the-prince-regents-purse')), firstStage: 'crown',
    stages: [
      {
        id: 'crown', journal: 'Blum says it is under a dust-sheet in the oldest hall, behind the first anvil Ironhold ever made.',
        objectives: [{ id: 'crown', text: 'Find the replica crown', interact: 'obj:replica-crown', marker: { place: Z3 } }],
        next: 'gideon',
      },
      {
        id: 'gideon', journal: 'It is iron, painted gold, and lighter than it looks. Blum says Ser Gideon should have it.',
        objectives: [{ id: 'gideon', text: 'Bring the replica crown to Ser Gideon', talk: GM, marker: { landmark: 'landmark:gideon-quarters' } }],
        onComplete: [{ setFlag: 'knight.replica_crown', value: true }],
        next: 'altar',
      },
      {
        id: 'altar', journal: 'Gideon cannot hold it, so he has asked you to lay it somewhere it can wait: on the altar rail in the Order’s chapel, where you kept your vigil.',
        objectives: [{ id: 'altar', text: 'Lay the replica crown on the chapel altar rail', interact: 'obj:knight-chapel-altar', marker: { landmark: 'landmark:order-chapel' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:knight-the-masons-marks', name: 'The Masons’ Marks', type: 'side', region: Z4, giver: 'npc:old-jarek',
    summary: 'Every mason who built the Wall of Shame cut a small apology into their stone. Old Jarek would like to find his before the Wall falls down.',
    requires: req(done('quest:knight-the-colossus-vote')), firstStage: 'marks',
    stages: [
      {
        id: 'marks', journal: 'Jarek’s mark is a hook and a star. It is somewhere along the cracked stretch, under thirty years of soot.',
        objectives: [{ id: 'marks', text: 'Read the masons’ marks along the Wall', interact: 'obj:mason-mark-*', count: 3, marker: { landmark: 'landmark:wall-masons-stair' } }],
        next: 'jarek',
      },
      {
        id: 'jarek', journal: 'The third stone has a hook and a star, and a word cut under them. It is not an apology.',
        objectives: [{ id: 'jarek', text: 'Tell Old Jarek what his stone says', talk: 'npc:old-jarek', marker: { landmark: 'landmark:wall-masons-stair' } }],
        next: 'ilka',
      },
      {
        id: 'ilka', journal: 'Jarek has taken a charcoal rubbing of his stone, ILKA and all, and would like it taken to his daughter in the Wards. He has never told her. He is too shy, at eighty, to tell her now.',
        objectives: [{ id: 'ilka', text: 'Take Jarek’s rubbing to Ilka’s door', interact: 'obj:knight-ilka-door', marker: { landmark: 'landmark:knight-ilka-house' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40, lore: ['lore:hc-berenikas-wall'] },
  },
  {
    ...A1, id: 'quest:knight-the-wall-walker', name: 'The Wall-Walker', type: 'side', region: Z4, giver: 'npc:fenna-tock',
    summary: 'Fenna Tock, aged nine, walks the top of the Wall every evening hoping to see Concordia. Tonight there are hollow Sentries on the wall-walk, and she is going anyway.',
    requires: req(done('quest:knight-the-colossus-vote')), firstStage: 'escort',
    stages: [
      {
        id: 'escort', journal: 'Keep the hollow Sentries off Fenna as far as the highest tower.',
        objectives: [{ id: 'sentries', text: 'Clear the hollow Sentries from the wall-walk', kill: 'bx_iron_0', count: 3, marker: { landmark: 'landmark:wall-walk-steps' } }],
        next: 'tower',
      },
      {
        id: 'tower', journal: 'The highest tower. From here, Fenna says, if you squint, you can see the whole world.',
        objectives: [{ id: 'tower', text: 'Look out from the highest tower with Fenna', interact: 'obj:wall-high-tower' }],
        next: 'fenna',
      },
      {
        id: 'fenna', journal: 'Fenna saw it: a glint, far beyond the Iron Gate. She will not stop talking about it.',
        objectives: [{ id: 'fenna', text: 'Walk Fenna home', talk: 'npc:fenna-tock', marker: { landmark: 'landmark:wall-walk-steps' } }],
        onComplete: [{ setFlag: 'knight.fenna_saw', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_cake' }] },
  },

  // ======================= ACT I: mentor thread (2) and bounties (2)
  {
    ...A1, id: 'quest:knight-the-stewards-writ', name: 'The Steward’s Writ', type: 'side', region: Z1, giver: GM,
    summary: 'In C. 1012 Queen Berenika signed a writ naming Casimir her steward for one night. Ironhold has called it treason ever since. Nobody has read it in thirty years.',
    requires: req({ trust: GM, value: 'friendly' }, done('quest:knight-the-barrow-vigil')), firstStage: 'archive',
    stages: [
      {
        id: 'archive', journal: 'Gideon says the writ is in the Order’s archive, filed behind thirty years of apologies, where nobody would ever have to look at it.',
        objectives: [{ id: 'writ', text: 'Find Berenika’s writ in the archive', interact: 'obj:berenika-writ', marker: { landmark: 'landmark:order-chapterhouse' } }],
        next: 'gideon',
      },
      {
        id: 'gideon', journal: 'Three lines in the Queen’s hand. You have read them twice.',
        objectives: [{ id: 'gideon', text: 'Bring the writ to Ser Gideon', talk: GM, marker: { landmark: 'landmark:gideon-quarters' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, skillPoints: 1, lore: ['lore:hc-berenikas-writ'] },
  },
  {
    ...A1, id: 'quest:knight-gideons-spurs', name: 'Gideon’s Spurs', type: 'side', region: Z2, giver: GM,
    summary: 'On the night of the Hollowing Ser Gideon threw his spurs down the Barrow’s well. He has not ridden since.',
    requires: req({ trust: GM, value: 'trusted' }, done('quest:knight-the-barrow-vigil')), firstStage: 'well',
    stages: [
      {
        id: 'well', journal: 'The Barrow well drops straight down into the drowned crypts. Bring a rope.',
        objectives: [{ id: 'well', text: 'Climb down the Barrow well', interact: 'obj:barrow-well', marker: { landmark: 'landmark:barrow-stair' } }],
        next: 'crypts',
      },
      {
        id: 'crypts', journal: 'The drowned crypts are guarded by Sentries nobody has wound in thirty years. They are still on duty.',
        objectives: [{ id: 'sentries', text: 'Get past the drowned crypt Sentries', kill: 'bx_iron_0', count: 3 }],
        next: 'spurs',
      },
      {
        id: 'spurs', journal: 'Something silver in the black water, at the bottom of the well.',
        objectives: [{ id: 'spurs', text: 'Fish out Gideon’s spurs', interact: 'obj:gideon-spurs' }],
        next: 'gideon',
      },
      {
        id: 'gideon', journal: 'A pair of knight’s spurs, green with thirty years of water, one rowel still turning.',
        objectives: [{ id: 'gideon', text: 'Bring the spurs to Ser Gideon', talk: GM, marker: { landmark: 'landmark:gideon-quarters' } }],
        onComplete: [{ setFlag: 'knight.gideon_devotable', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:knight-bounty-toll-gate-sentries', name: 'Bounty: the Toll-Gate Sentries', type: 'bounty', region: Z1, giver: 'npc:barnabas-hock',
    summary: 'A squad of hollow Iron Sentries has taken over the Coppergate toll and is charging everyone, including the Watch.',
    requires: req(done('quest:knight-forty-gates')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'Six of them, all ringing wrong. The Watch pays by the Sentry.', objectives: [{ id: 'sentries', text: 'Defeat the hollow toll-gate Sentries', kill: 'bx_iron_0', count: 6, marker: { place: Z1 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 150 },
  },
  {
    ...A1, id: 'quest:knight-bounty-lance-eaters', name: 'Bounty: the Lance-Eaters', type: 'bounty', region: Z2, giver: 'npc:barnabas-hock',
    summary: 'Scrap Beetles have eaten half the Tilt Yard’s lances, and the tourney season is not over.',
    requires: req(done('quest:knight-the-barrow-vigil')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'They nest in the lance racks and come out at the sound of splintering.', objectives: [{ id: 'beetles', text: 'Defeat the Lance-Eaters', kill: 'bx_iron_2', count: 5, marker: { landmark: 'landmark:tilt-yard-lists' } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 120 },
  },

  // ======================= ACT II: the class thread (C-1 … C-6) + featured bearers
  {
    ...A2, id: 'quest:knight-the-iron-embassy', name: 'The Iron Embassy', type: 'class', region: 'vil:gild', giver: 'npc:perpetua-stannard',
    summary: 'Somewhere in Concordia there is still an Ironhold embassy. If anyone knows where Iron’s Sentinel lies, it will be whoever kept the door.',
    requires: req(done('quest:cc-through-the-arch')), autoStart: true, firstStage: 'envoy',
    stages: [
      {
        id: 'envoy', journal: 'Ysolde says the old Ironhold embassy at Gildport is shuttered, but someone still lights a lamp in its window every evening.',
        objectives: [{ id: 'envoy', text: 'Find the Ironhold embassy at Gildport', talk: 'npc:perpetua-stannard', marker: { landmark: 'landmark:iron-embassy-gildport' } }],
        next: 'escort',
      },
      {
        id: 'escort', journal: 'For thirty years Envoy Stannard has heard the hammering from her window and never once gone down to the gold. The streets are patrolled by hollow iron. She would like an Order escort.',
        onEnter: [{ escort: 'npc:perpetua-stannard', to: 'landmark:knight-gold-stair' }],
        objectives: [{ id: 'envoy', text: 'Escort Envoy Stannard to the gold stair', when: { any: [{ flag: 'escort.perpetua-stannard', op: '==', value: 'arrived' }, { flag: 'escort.perpetua-stannard', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:knight-gold-stair' } }],
        next: [{ when: { flag: 'escort.perpetua-stannard', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'hear' }],
      },
      {
        id: 'regroup', journal: 'The Envoy went down among the patrols, and the Gildport watch carried her home to the embassy. She has put on a sturdier hat and wishes to try again, at once, as protocol requires.',
        onEnter: [{ escort: 'npc:perpetua-stannard', to: 'landmark:knight-gold-stair' }],
        objectives: [{ id: 'envoy', text: 'Try again: escort the Envoy to the gold stair', when: { any: [{ flag: 'escort.perpetua-stannard', op: '==', value: 'arrived' }, { flag: 'escort.perpetua-stannard', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:knight-gold-stair' } }],
        next: [{ when: { flag: 'escort.perpetua-stannard', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'hear' }],
      },
      {
        id: 'hear', journal: 'At the head of a stair that goes down into the gold, the Envoy has stopped, with her hand flat on the wall, listening.',
        objectives: [{ id: 'envoy', text: 'Hear what the Envoy hears', talk: 'npc:perpetua-stannard', marker: { landmark: 'landmark:knight-gold-stair' } }],
        onComplete: [{ startQuest: 'quest:knight-the-buried-forge' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-iron-embassy'] },
  },
  {
    ...A2, id: 'quest:knight-the-buried-forge', name: 'The Buried Forge', type: 'class', region: 'region:gilded', giver: 'npc:perpetua-stannard',
    summary: 'Under the gold of the Gilded city, Envoy Stannard says, something has been hammering for thirty years. The Crown-Smith, she calls it. Everyone else calls it the Gilded Engine.',
    requires: req(done('quest:knight-the-iron-embassy')), firstStage: 'streets',
    stages: [
      {
        id: 'streets', journal: 'The drowned streets of the Gilded city are still patrolled by hollow-iron sentries, walking rounds nobody has called off.',
        objectives: [{ id: 'sentries', text: 'Get past the gilded street patrols', kill: 'bx_sentry', count: 4, marker: { region: 'region:gilded' } }],
        next: 'hammer',
      },
      {
        id: 'hammer', journal: 'Follow the hammering down through the gold. It never misses a stroke.',
        objectives: [{ id: 'echo', text: 'Follow the hammering under the gold', interact: 'obj:knight-hammer-echo-*', count: 3, marker: { landmark: 'landmark:sentinel-iron' } }],
        next: 'down',
      },
      {
        id: 'down', journal: 'The hammering comes from behind a door of plain dark iron, in a street of gold.',
        objectives: [{ id: 'lair', text: 'Go down to the Buried Engine', reach: 'inst:sentinel-iron', marker: { landmark: 'landmark:sentinel-iron' } }],
        onComplete: [{ startQuest: 'quest:knight-the-gilded-engine' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 120 },
  },
  {
    ...A2, id: 'quest:knight-the-gilded-engine', name: 'The Gilded Engine', type: 'class', region: 'region:gilded', giver: 'npc:perpetua-stannard',
    summary: 'The Gilded Engine made the crown’s settings. It is Iron’s Sentinel, and it has not stopped working since the night the crown was emptied.',
    requires: req(done('quest:knight-the-buried-forge')), firstStage: 'fight',
    stages: [
      {
        id: 'fight', journal: 'The Gilded Engine is the Sentinel of the Iron school. Win its mark, and Iron’s bearers can stand at the Citadel.',
        objectives: [{ id: 'engine', text: 'Defeat the Gilded Engine', kill: 'bx_engine', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-iron' }],
        next: 'release',
      },
      {
        id: 'release', journal: 'The gold ran off it like water. Underneath, it was only old iron, very tired.',
        objectives: [{ id: 'mark', text: 'Hear the Engine out', when: { flag: 'story.sentinel.iron' } }],
        next: 'anvil',
      },
      {
        id: 'anvil', journal: 'Its last anvil is still warm. Something on the other side of the iron seems to be waiting for you to ask.',
        objectives: [{ id: 'anvil', text: 'Lay your hand on the Engine’s anvil', interact: 'obj:iron-engine-anvil' }],
        next: 'tell',
      },
      {
        id: 'tell', journal: 'The hammering under the gold has stopped. Envoy Stannard has listened to it from her window every night for thirty years.',
        objectives: [{ id: 'envoy', text: 'Tell Envoy Stannard the Engine is at rest', talk: 'npc:perpetua-stannard', marker: { landmark: 'landmark:iron-embassy-gildport' } }],
        onComplete: [{ startQuest: 'quest:knight-the-princes-plate' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-sentinel-engine'] },
  },
  {
    ...A2, id: 'quest:knight-the-princes-plate', name: 'The Prince’s Plate', type: 'class', region: 'region:ash', giver: 'npc:perpetua-stannard',
    summary: 'Konrad came through the Iron Gate behind you. Envoy Stannard has had word from Kilnmouth of a golden-haired man in old royal plate, walking into the kilns of his own accord.',
    requires: req(done('quest:knight-the-gilded-engine')), firstStage: 'trail',
    stages: [
      {
        id: 'trail', journal: 'The Kilnmouth smiths have seen him. They pointed you to the smoke that does not come from any of their kilns.',
        objectives: [{ id: 'trail', text: 'Follow Konrad’s trail into the Ashfall Kiln', reach: 'region:ash', marker: { region: 'region:ash' } }],
        next: [
          { when: { flag: 'knight.colossus_vote', value: 'march' }, to: 'regiment' },
          { to: 'smiths' },
        ],
      },
      {
        id: 'regiment', journal: 'Konrad’s regiment followed him through the gate, banners and all. They have gone hollow in their colours, and they are standing guard on his forge.',
        objectives: [{ id: 'regiment', text: 'Break through Konrad’s hollow regiment', kill: 'bx_concord_2', count: 5, marker: { region: 'region:ash' } }],
        next: 'smiths',
      },
      {
        id: 'smiths', journal: 'The Hollow King’s smiths work in Ashmaw’s breath, forging something huge out of every school’s iron at once.',
        objectives: [{ id: 'smiths', text: 'Drive off the Hollow King’s smiths', kill: 'bx_concord_0', count: 4, marker: { region: 'region:ash' } }],
        next: 'plate',
      },
      {
        id: 'plate', journal: 'On the smiths’ anvil, laid out like a body: Berenika’s armour. The first plate of something that will be very large.',
        objectives: [{ id: 'plate', text: 'Look at what lies on the smiths’ anvil', interact: 'obj:knight-plate-anvil' }],
        next: 'down',
      },
      {
        id: 'down', journal: 'The smiths fled down into the oldest kiln, where Ashmaw breathes. Konrad went with them, singing.',
        objectives: [{ id: 'lair', text: 'Go down under the kilns', reach: 'inst:sentinel-ash', marker: { landmark: 'landmark:sentinel-ash' } }],
        onComplete: [{ startQuest: 'quest:knight-ashmaw' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 150 },
  },
  {
    ...A2, id: 'quest:knight-ashmaw', name: 'Ashmaw', type: 'class', region: 'region:ash', giver: 'npc:perpetua-stannard',
    summary: 'Ashmaw, the Kiln-Beast, lit the Turning torches for a thousand years. The Hollow King’s smiths have been forging in its breath.',
    requires: req(done('quest:knight-the-princes-plate')), firstStage: 'fight',
    stages: [
      {
        id: 'fight', journal: 'Ashmaw is the Sentinel of the Ash school. The Ash bearers cannot win their mark while the tears keep it burning black.',
        objectives: [{ id: 'ashmaw', text: 'Defeat Ashmaw', kill: 'bx_ashmaw', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-ash' }, { setFlag: 'story.bearer.reaver', value: true }],
        next: 'signet',
      },
      {
        id: 'signet', journal: 'Konrad went down here singing, with the smiths. On the forge-stone where they worked, something small and gold has been left behind on purpose.',
        objectives: [{ id: 'signet', text: 'See what Konrad left on the forge-stone', interact: 'obj:knight-konrad-signet' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-sentinel-ashmaw'] },
  },
  {
    ...A2, id: 'quest:knight-gideons-letter', name: 'Gideon’s Letter', type: 'class', region: 'vil:brind', giver: GM,
    summary: 'Something has come through the Iron arch from Anvilgate with a letter for you. It took the writer a month.',
    requires: req(done('quest:knight-ashmaw')), autoStart: true, firstStage: 'letter',
    stages: [
      {
        id: 'letter', journal: 'A letter from Ser Gideon is waiting for you at the Gate Circle.',
        objectives: [{ id: 'letter', text: 'Collect Gideon’s letter at the Gate Circle', when: { flag: 'knight.gideon_letter' }, marker: { landmark: 'landmark:gate-circle' } }],
        next: 'reply',
      },
      {
        id: 'reply', journal: 'Gideon took a month over three lines. Whoever brought them is waiting under the Iron arch to carry an answer home.',
        objectives: [{ id: 'reply', text: 'Send Gideon an answer through the Iron arch', interact: 'obj:knight-reply-letter', marker: { landmark: 'landmark:gate-circle' } }],
        onComplete: [{ setFlag: 'story.act2_ready', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:knight-whose-fault', name: 'Whose Fault', type: 'side', region: 'vil:kiln', giver: 'npc:bearer-arcanist',
    summary: 'The Arcanist bearer blames Iron for thirty years of a failing Kiln, and wants to know, to a knight’s face, why Berenika ever trusted Casimir.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'hearth',
    stages: [
      {
        id: 'hearth', journal: 'Ottoline Pyre will be at the cold hearth in Kilnmouth, where the Ash-folk keep their copy of the Great Kiln.',
        objectives: [{ id: 'hearth', text: 'Answer the Arcanist bearer at the cold hearth', interact: 'obj:knight-cold-hearth', marker: { landmark: 'landmark:kiln-great-kiln' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Whatever you said at the hearth, Ottoline has more to say, back at the Stone Court.',
        objectives: [{ id: 'ottoline', text: 'Talk to the Arcanist bearer', when: { any: [{ flag: 'knight.ottoline_thanked' }, { partyHasClass: 'arcanist' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.arcanist', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A2, id: 'quest:knight-pawned-steel', name: 'Pawned Steel', type: 'side', region: 'vil:gild', giver: 'npc:bearer-corsair',
    summary: 'The Corsair bearer means to salvage the Gilded city’s gold and pay off Tidecourt’s Pawned Gate with it. She would like a knight to carry the heavy end.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'salvage',
    stages: [
      {
        id: 'salvage', journal: 'Captain Nell Quay has a salvage raft tied up in the gold-silt below Gildport, and a plan she describes as “nearly legal”.',
        objectives: [{ id: 'raft', text: 'Meet the Corsair bearer at her salvage raft', interact: 'obj:knight-salvage-raft', marker: { landmark: 'landmark:gild-gilded-row' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Nell is counting something at the Stone Court. It might be gold. It might be favours.',
        objectives: [{ id: 'nell', text: 'Talk to the Corsair bearer', when: { any: [{ flag: 'knight.nell_thanked' }, { partyHasClass: 'corsair' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.corsair', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  // ======================= ACT III: class quests (III-4 + 3 side)
  {
    ...A3, id: 'quest:knight-the-iron-head', name: 'The Iron Head', type: 'class', region: 'region:heart', giver: 'npc:casimir',
    summary: 'At the top of the Twelve Stairs waits the Union Chimera. Its iron head wears Queen Berenika’s helm, and under the helm is Konrad’s face.',
    requires: req(done('quest:heart-stairs')), autoStart: true, firstStage: 'herald',
    stages: [
      { id: 'herald', journal: 'Konrad asked to be bound, and nobody made him. He is the Chimera’s iron head and shield-arm now, his grandmother’s plate grown into his own.', objectives: [{ id: 'herald', text: 'Face the Iron Head', kill: 'cb_iron-head', count: 1, marker: { landmark: 'landmark:twelve-stairs-top' } }], onComplete: [{ openDialogue: 'dialogue:knight-herald-fate' }], next: 'fate' },
      { id: 'fate', journal: 'The Chimera’s iron head is bowed on the stair, beaten. Konrad is still apologising.', objectives: [{ id: 'fate', text: 'Decide Konrad’s fate', when: { flag: 'knight.nemesis_fate' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 3 },
  },
  {
    ...A3, id: 'quest:knight-spurs-on-the-stair', name: 'Spurs on the Stair', type: 'side', region: 'region:heart', giver: GM,
    summary: '“One day there is a place I ought to leave them.” Courier Ashlar of the Wall post has come all the way to the Heart camp with a letter from Ser Gideon.',
    requires: req(done('quest:knight-the-iron-head')), autoStart: true, firstStage: 'courier',
    stages: [
      { id: 'courier', journal: 'Joss Ashlar is waiting at the Heart camp with a letter, and a parcel.', objectives: [{ id: 'joss', text: 'Meet Gideon’s courier at the Heart camp', talk: 'npc:joss-ashlar', marker: { landmark: 'landmark:heart-camp' } }], next: 'vigil' },
      { id: 'vigil', journal: 'A knight of the Order keeps vigil before a long walk. Wrapped with the spurs is Gideon’s old vigil-card. Keep the vigil at the foot of the Stairs first.', objectives: [{ id: 'vigil', text: 'Keep a vigil at the foot of the Twelve Stairs', interact: 'obj:knight-stair-vigil', marker: { landmark: 'landmark:twelve-stairs' } }], next: 'step' },
      { id: 'step', journal: 'Ser Gideon wants his spurs left on the top step of the Twelve Stairs, before the Citadel doors, where he carried the crown in.', objectives: [{ id: 'step', text: 'Leave Gideon’s spurs at the top of the Twelve Stairs', interact: 'obj:knight-iron-stair-step', marker: { landmark: 'landmark:twelve-stairs-top' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A3, id: 'quest:knight-the-regents-regiment', name: 'The Regent’s Regiment', type: 'side', region: 'region:heart', giver: KB,
    summary: 'Ironhold knights went through the Iron Gate after Konrad. They are standing in the Legion camp in their colours, with their shields scraped blank.',
    requires: req(done('quest:heart-legion')), autoStart: true, firstStage: 'blank',
    stages: [
      { id: 'blank', journal: 'Find the Ironhold knights in the Legion camp.', objectives: [{ id: 'blank', text: 'Find the hollow Ironhold knights in the Legion camp', interact: 'obj:knight-hollow-regiment', marker: { landmark: 'landmark:legion-camp' } }], next: 'case' },
      { id: 'case', journal: 'Their shields are scraped blank, and nobody remembers their names. A regiment always carries its roll of arms in the colour-case. Theirs was dropped at the foot of the Stairs.', objectives: [{ id: 'case', text: 'Find the regiment’s colour-case at the foot of the Stairs', interact: 'obj:knight-regiment-case', marker: { landmark: 'landmark:twelve-stairs' } }], next: 'roll' },
      { id: 'roll', journal: 'You have the roll of arms. Call the knights home by name.', objectives: [{ id: 'roll', text: 'Call the hollow knights home from the roll of arms', interact: 'obj:knight-hollow-regiment', marker: { landmark: 'landmark:legion-camp' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A3, id: 'quest:knight-the-blank-shields-crest', name: 'The Blank Shield’s Crest', type: 'side', region: 'region:heart', giver: 'npc:blank-shield',
    summary: 'Something has followed you all the way from Anvilgate, three polite paces behind: an empty suit of armour, wearing one small anvil.',
    requires: req(done('quest:heart-stairs')), autoStart: true, firstStage: 'camp',
    stages: [
      { id: 'camp', journal: 'The Blank Shield is standing between two tents at the Heart camp, trying very hard not to be noticed.', objectives: [{ id: 'camp', text: 'Speak to the Blank Shield at the Heart camp', talk: 'npc:blank-shield', marker: { landmark: 'landmark:heart-camp' } }], next: 'sword' },
      { id: 'sword', journal: 'It keeps miming a sword it does not have. A knight on watch grounds a blade. In the Legion camp the freed have laid down a great many.', objectives: [{ id: 'sword', text: 'Find the Blank Shield a sword in the Legion camp', interact: 'obj:knight-shield-sword', marker: { landmark: 'landmark:legion-camp' } }], next: 'stair' },
      { id: 'stair', journal: 'The Blank Shield wants to stand guard at the top of the Iron stair. Take it there.', objectives: [{ id: 'stair', text: 'Post the Blank Shield on the Iron stair', talk: 'npc:blank-shield', marker: { landmark: 'landmark:twelve-stairs-top' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1 },
  },
];

export default quests;
