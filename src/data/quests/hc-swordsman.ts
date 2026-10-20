/**
 * Hollow Crown: the SWORDSMAN campaign (docs/lore/hollow-crown/06-outlines/blade.md). Act I in Edgewater
 * (area:blade-capital) and the Act II class thread in Concordia. Zones: -1 the Fencing Quarter, -2 the Duelling
 * Bridges, -3 the Riverside Salles, -4 the Old Armoury. Owner: Claude 4.
 */
import type { NarrativeCondition, QuestDef } from '@/core';

const SW: NarrativeCondition = { heroClass: 'swordsman' };
const done = (q: `quest:${string}`): NarrativeCondition => ({ questCompleted: q });
const req = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: [SW, ...c] });
const A1 = { act: 'act1' as const, campaign: 'swordsman', chapter: 'Edgewater' };
const A2 = { act: 'act2' as const, campaign: 'swordsman', chapter: 'Concordia' };
const A3 = { act: 'act3' as const, campaign: 'swordsman', chapter: 'The Heart' };
const Z1 = 'zone:blade-capital-1' as const, Z2 = 'zone:blade-capital-2' as const, Z3 = 'zone:blade-capital-3' as const, Z4 = 'zone:blade-capital-4' as const;
const L1 = 'inst:blade-capital-lair-1' as const, L2 = 'inst:blade-capital-lair-2' as const, L3 = 'inst:blade-capital-lair-3' as const;
const LF = 'npc:lucia-ferro' as const, AV = 'npc:auguste-vellacourt' as const;

const quests: QuestDef[] = [
  // ======================= ACT I: main (I-1 … I-10)
  {
    ...A1, id: 'quest:swordsman-the-bell-on-the-ladder', name: 'The Bell on the Ladder', type: 'main', region: Z1, giver: LF,
    summary: 'A midnight challenge for rung 212, under the Ladder board. A bell rang somewhere very far away, every blade in Edgewater hummed the same note, and your sword stopped dead in the air.',
    requires: SW, autoStart: true, firstStage: 'graves',
    stages: [
      {
        id: 'graves', journal: 'The duel-graves of the Fencing Quarter have opened, and the Revenants are climbing out with their swords already drawn.',
        onEnter: [{ openDialogue: 'dialogue:swordsman-bell-night' }],
        objectives: [{ id: 'revenants', text: 'Fight off the Duelist Revenants round the Ladder board', kill: 'bx_blade_0', count: 3, marker: { landmark: 'landmark:ladder-board' } }],
        next: 'ferro',
      },
      {
        id: 'ferro', journal: 'Someone has you by the collar and is hauling you backwards out of the square.',
        objectives: [{ id: 'ferro', text: 'Talk to the woman who hauled you out', talk: LF, marker: { landmark: 'landmark:ladder-board' } }],
        onComplete: [{ setFlag: 'swordsman.bell_heard', value: true }],
        next: 'alleys',
      },
      {
        id: 'alleys', journal: 'Ferro is striding off through the back alleys of the Quarter with her coat-tails flying, away from the graves. She has not let go of your sleeve, so you are going too.',
        objectives: [{ id: 'salle', text: 'Follow Ferro through the alleys to her salle', reach: 'landmark:ferro-salle', marker: { landmark: 'landmark:ferro-salle' } }],
        next: 'salle',
      },
      {
        id: 'salle', journal: 'Ferro’s salle: a long, cold room of bare boards and dust, with one lamp. She has bolted the door and put a sword in your hands.',
        objectives: [{ id: 'ferro', text: 'Hear Maestra Ferro out in her salle', talk: LF, marker: { landmark: 'landmark:ferro-salle' } }],
        onComplete: [{ startQuest: 'quest:swordsman-strike-them-off' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-steelvale', 'lore:hc-the-ladder'] },
  },
  {
    ...A1, id: 'quest:swordsman-strike-them-off', name: 'Strike Them Off', type: 'main', region: Z1, giver: LF,
    summary: 'Maestra Ferro wants the five oldest challenges on the Ladder board settled, by talking or by fighting. Some of them are older than the people fighting them.',
    requires: req(done('quest:swordsman-the-bell-on-the-ladder')), firstStage: 'challenges',
    stages: [
      {
        id: 'challenges', journal: 'Five old challenges, chalked on the Ladder board. Settle them, any way you can.',
        objectives: [{ id: 'challenges', text: 'Settle the oldest challenges on the Ladder', interact: 'obj:ladder-challenge-*', count: 5, marker: { landmark: 'landmark:ladder-board' } }],
        next: 'chalk',
      },
      {
        id: 'chalk', journal: 'The black from the oldest challenge is running down the board, into the gutter, and away across the square. Follow it before it dries.',
        objectives: [{ id: 'chalk', text: 'Follow the black chalk across the Fencing Quarter', interact: 'obj:swordsman-chalk-clue-*', count: 3, marker: { place: Z1 } }],
        next: 'report',
      },
      {
        id: 'report', journal: 'Five challenges struck off. And under your hand, the chalk on the board is running black.',
        objectives: [{ id: 'ferro', text: 'Report to Maestra Ferro', talk: LF, marker: { landmark: 'landmark:ferro-salle' } }],
        onComplete: [{ startQuest: 'quest:swordsman-the-saints-tomb' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40 },
  },
  {
    ...A1, id: 'quest:swordsman-the-saints-tomb', name: 'The Saint’s Tomb', type: 'main', region: Z2, giver: LF,
    summary: 'Duellists keep going down under the oldest bridge to challenge the Sword Saint, and they do not come back up, except as Revenants.',
    requires: req(done('quest:swordsman-strike-them-off')), firstStage: 'tomb',
    stages: [
      {
        id: 'tomb', journal: 'The Saint’s Tomb is under the oldest of the Duelling Bridges, down a stair worn hollow by challengers.',
        objectives: [{ id: 'enter', text: 'Go down into the Saint’s Tomb', reach: L1, marker: { place: Z2 } }],
        next: 'saint',
      },
      {
        id: 'saint', journal: 'An ancient master in perfect forms. He bows between bouts. Bow back.',
        objectives: [{ id: 'saint', text: 'Defeat the Sword Saint', kill: 'bx_blade_3', count: 1 }],
        next: 'rest',
      },
      {
        id: 'rest', journal: 'The Saint is down on one knee, and he will not fall. He is waiting for something.',
        objectives: [{ id: 'rest', text: 'End the Sword Saint’s last duel', interact: 'obj:sword-saint-rest' }],
        next: 'report',
      },
      {
        id: 'report', journal: 'The Saint lay down at last. Nobody else will go down those stairs and come back wrong.',
        objectives: [{ id: 'ferro', text: 'Tell Maestra Ferro', talk: LF, marker: { landmark: 'landmark:ferro-salle' } }],
        onComplete: [{ setFlag: 'swordsman.saint_down', value: true }, { startQuest: 'quest:swordsman-the-champions-salute' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 80, hcItems: [{ item: 'i_hp_s', qty: 3 }] },
  },
  {
    ...A1, id: 'quest:swordsman-the-champions-salute', name: 'The Champion’s Salute', type: 'main', region: Z2, giver: AV,
    summary: 'Ser Auguste Vellacourt, champion of the Ladder, undefeated in thirty years, is crossing the Duelling Bridges signing autographs. He has heard about the Saint.',
    requires: req(done('quest:swordsman-the-saints-tomb')), firstStage: 'bridge',
    stages: [
      {
        id: 'bridge', journal: 'There is a crowd on the Champion’s Bridge, and a man in white in the middle of it, laughing.',
        objectives: [{ id: 'auguste', text: 'Challenge Ser Auguste Vellacourt', talk: AV, marker: { landmark: 'landmark:champions-bridge' } }],
        next: 'book',
      },
      {
        id: 'book', journal: 'In the crush after the bout, Vellacourt dropped his autograph book on the Champion’s Bridge, and went on without it, waving.',
        objectives: [{ id: 'book', text: 'Pick up Vellacourt’s autograph book', interact: 'obj:swordsman-autograph-book', marker: { landmark: 'landmark:champions-bridge' } }],
        next: 'sallow',
      },
      {
        id: 'sallow', journal: 'Every page of the book has an insult pinned into it, bought from the same booth. Madame Sallow, the insult broker, has some explaining to do.',
        objectives: [{ id: 'sallow', text: 'Ask Madame Sallow about her best customer', talk: 'npc:celandine-sallow', marker: { landmark: 'landmark:sallow-booth' } }],
        next: 'ferro',
      },
      {
        id: 'ferro', journal: 'He let you take a touch. He beamed. He said “Again.” He called Maestra Ferro his only loss.',
        objectives: [{ id: 'ferro', text: 'Ask Ferro about Vellacourt', talk: LF, marker: { landmark: 'landmark:ferro-salle' } }],
        onComplete: [{ setFlag: 'swordsman.vellacourt_met', value: true }, { startQuest: 'quest:swordsman-the-ladder-vote' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-auguste-vellacourt'] },
  },
  {
    ...A1, id: 'quest:swordsman-the-ladder-vote', name: 'The Ladder Vote', type: 'main', region: Z1, giver: 'npc:cosimo-bracca',
    summary: 'The Salles’ Council sits tonight under the Ladder board to vote on whether to close the Ladder for good. Every duellist on it has a voice, even the one on rung 212.',
    requires: req(done('quest:swordsman-the-champions-salute')), firstStage: 'canvass',
    stages: [
      {
        id: 'canvass', journal: 'Before you speak, Ferro says, find out what the Ladder means to the people at the two ends of it: the bottom rung, and the bridge that has been closed for thirty years.',
        objectives: [
          { id: 'percy', text: 'Ask Percy Thimble what the Ladder means to rung 4,012', talk: 'npc:percy-thimble', marker: { landmark: 'landmark:thimble-shop' } },
          { id: 'bettina', text: 'Ask Bettina Sarto what the Ladder has cost her', talk: 'npc:bettina-sarto', marker: { landmark: 'landmark:sisters-bridge' } },
        ],
        next: 'vote',
      },
      {
        id: 'vote', journal: 'The Council benches are out in the square, under the board. The whole Quarter has come to watch.',
        objectives: [{ id: 'vote', text: 'Speak before the Salles’ Council', when: { flag: 'swordsman.ladder' }, marker: { landmark: 'landmark:ladder-board' } }],
        next: 'dawn',
      },
      {
        id: 'dawn', journal: 'Whatever the Council decided happens at dawn, under the board. You should be there to see it.',
        objectives: [{ id: 'board', text: 'Go back to the Ladder board at dawn', interact: 'obj:swordsman-ladder-dawn', marker: { landmark: 'landmark:ladder-board' } }],
        onComplete: [{ startQuest: 'quest:swordsman-the-grand-salle' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-salles'] },
  },
  {
    ...A1, id: 'quest:swordsman-the-grand-salle', name: 'The Grand Salle', type: 'main', region: Z3, giver: LF,
    summary: 'Whatever the Council decided, everyone wants the Ladder’s original roll, kept in the oldest salle on the river. Its guardian has never been touched.',
    requires: req(done('quest:swordsman-the-ladder-vote')), firstStage: 'salle',
    stages: [
      {
        id: 'salle', journal: 'The Grand Salle stands on the river, its doors shut for thirty years. Inside, something is fencing with nobody.',
        objectives: [{ id: 'enter', text: 'Enter the Grand Salle', reach: L2, marker: { place: Z3 } }],
        onComplete: [{ openDialogue: 'dialogue:swordsman-grand-salle' }],
        next: 'pistes',
      },
      {
        id: 'pistes', journal: 'The Grand Salle is a warren of practice rooms, each with its own piste and its own touch-board. Somewhere at the heart of it, the guardian is waiting. Look round as you go.',
        objectives: [{ id: 'pistes', text: 'Search the Grand Salle’s practice rooms', interact: 'obj:swordsman-salle-piste-*', count: 3 }],
        next: 'parry',
      },
      {
        id: 'parry', journal: 'The Perfect Parry parries everything. Feint, throw things, use the room.',
        objectives: [{ id: 'parry', text: 'Touch the Perfect Parry', kill: 'cb_perfect-parry', count: 1 }],
        next: 'roll',
      },
      {
        id: 'roll', journal: 'Behind the automaton’s stand, under glass, the Ladder’s original roll.',
        objectives: [{ id: 'roll', text: 'Read the Ladder’s original roll', interact: 'obj:ladder-original-roll' }],
        onComplete: [{ setFlag: 'swordsman.ladder_roll', value: true }, { startQuest: 'quest:swordsman-the-unended' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 120 },
  },
  {
    ...A1, id: 'quest:swordsman-the-unended', name: 'The Unended', type: 'main', region: Z4, giver: LF,
    summary: 'Thirty years of wins on the Ladder roll, and not one of Vellacourt’s duels marked “ended”. Where do his opponents go? The Old Armoury, the Quarter whispers.',
    requires: req(done('quest:swordsman-the-grand-salle')), firstStage: 'armoury',
    stages: [
      {
        id: 'armoury', journal: 'The Old Armoury is full of Training Automatons, and they are all awake.',
        objectives: [{ id: 'automatons', text: 'Fight through the Old Armoury', kill: 'bx_blade_2', count: 4, marker: { place: Z4 } }],
        next: 'gallery',
      },
      {
        id: 'gallery', journal: 'At the back of the Armoury, behind ranks of racks, a long gallery. You can hear steel. A great deal of steel.',
        objectives: [{ id: 'gallery', text: 'Find what is behind the Armoury', reach: 'landmark:unended-gallery', marker: { landmark: 'landmark:unended-gallery' } }],
        next: 'faces',
      },
      {
        id: 'faces', journal: 'The Revenants in the gallery are fencing in pairs, against nobody, all along a hall that goes on and on. Some of them you know. Walk the gallery before you find him.',
        objectives: [{ id: 'faces', text: 'Walk the Unended Gallery', interact: 'obj:swordsman-unended-face-*', count: 3, marker: { landmark: 'landmark:unended-gallery' } }],
        next: 'auguste',
      },
      {
        id: 'auguste', journal: 'Everyone Vellacourt has ever beaten is here, as a Revenant, still fencing. He is walking among them like a gardener.',
        objectives: [{ id: 'auguste', text: 'Confront Vellacourt in the Unended Gallery', talk: AV, marker: { landmark: 'landmark:unended-gallery' } }],
        onComplete: [{ setFlag: 'swordsman.unended_seen', value: true }, { startQuest: 'quest:swordsman-the-fencing-hall' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-unended-gallery'] },
  },
  {
    ...A1, id: 'quest:swordsman-the-fencing-hall', name: 'The Fencing Hall', type: 'main', region: L3, giver: LF,
    summary: 'Vellacourt has gone to the Fencing Hall. The Hall half lies under its floor, and he means to set it in his sword so that every duel he wins stays won.',
    requires: req(done('quest:swordsman-the-unended')), firstStage: 'hall',
    stages: [
      {
        id: 'hall', journal: 'The great Fencing Hall, empty, every lamp lit. Your half-stone is singing up through the floorboards.',
        objectives: [{ id: 'enter', text: 'Enter the Fencing Hall', reach: L3, marker: { place: Z1 } }],
        next: 'auguste',
      },
      {
        id: 'auguste', journal: 'A proper duel on the Hall floor. Every time he is beaten he says “Again.” On the third, lower your sword.',
        objectives: [{ id: 'auguste', text: 'Duel Ser Auguste Vellacourt', kill: 'cb_auguste-vellacourt', count: 1 }],
        next: 'stone',
      },
      {
        id: 'stone', journal: 'The floor cracked where you stood. Vellacourt is gone through the river-gate. Under the boards, something is singing.',
        objectives: [{ id: 'stone', text: 'Break the Hall floor and claim the Hall half', interact: 'obj:blade-capital-halfstone' }],
        onComplete: [{ setFlag: 'swordsman.halfstone', value: true }, { startQuest: 'quest:swordsman-the-last-lesson' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, skillPoints: 1, lore: ['lore:hc-half-stones'] },
  },
  {
    ...A1, id: 'quest:swordsman-the-last-lesson', name: 'The Last Lesson', type: 'main', region: Z1, giver: LF,
    summary: 'Vellacourt has gone to join the Thousand-Edge General’s muster at the Edge Gate. Maestra Ferro is waiting at the start of the silver-grass road, and she has something to tell you.',
    requires: req(done('quest:swordsman-the-fencing-hall')), firstStage: 'lesson',
    stages: [
      {
        id: 'lesson', journal: 'Ferro is at her salle door with her coat on, which she never wears.',
        objectives: [{ id: 'ferro', text: 'Walk with Maestra Ferro', talk: LF, marker: { landmark: 'landmark:ferro-salle' } }],
        next: 'stone',
      },
      {
        id: 'stone', journal: 'Halfway up the silver-grass road stands the Salute Stone, where every duellist who left Edgewater used to stop and give the closing salute to the city. Nobody has given it in thirty years.',
        objectives: [{ id: 'stone', text: 'Salute the city from the Salute Stone', interact: 'obj:swordsman-salute-stone', marker: { landmark: 'landmark:swordsman-salute-stone' } }],
        next: 'road',
      },
      {
        id: 'road', journal: 'The silver-grass road runs up out of Edgewater to the Edge Gate, where a thousand swords are pointing the wrong way.',
        objectives: [{ id: 'gate', text: 'Take the silver-grass road to the Edge Gate', reach: 'area:blade-gate', marker: { place: 'area:blade-gate' } }],
        onComplete: [{ startQuest: 'quest:swordsman-the-edge-gate' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:swordsman-the-edge-gate', name: 'The Edge Gate', type: 'main', region: 'area:blade-gate', giver: LF,
    summary: 'The Thousand-Edge General stands before the Edge Gate with every blade in his muster turned outward. It is a duel against a thousand swords, one at a time.',
    requires: req(done('quest:swordsman-the-last-lesson')), firstStage: 'general',
    stages: [
      {
        id: 'general', journal: 'His blades orbit him in rings. Disarm them one by one. Each one dropped stays dropped.',
        objectives: [{ id: 'general', text: 'Disarm the Thousand-Edge General', kill: 'bx_blade_5', count: 1 }],
        next: 'gate',
      },
      {
        id: 'gate', journal: 'He laid the last of his blades across the road. Behind him, the gate weeps black down its edges.',
        objectives: [{ id: 'seal', text: 'Open the Edge Gate with the half-stone', interact: 'obj:blade-gate-seal' }],
        onComplete: [{ setFlag: 'story.gate_open', value: true }, { setFlag: 'story.act', value: 2 }, { setFlag: 'swordsman.act1_done', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 200, lore: ['lore:hc-realm-gates', 'lore:hc-thousand-edge-general'] },
  },

  // ======================= ACT I: side quests (2 per zone)
  {
    ...A1, id: 'quest:swordsman-rung-4012', name: 'Rung 4,012', type: 'side', region: Z1, giver: 'npc:percy-thimble',
    summary: 'Percy Thimble, a cheerful tailor, is the lowest-ranked duellist on the Ladder and has lost nine hundred and ninety-nine bouts. He would like to win one before he turns a thousand.',
    requires: req(done('quest:swordsman-the-bell-on-the-ladder')), firstStage: 'drill',
    stages: [
      {
        id: 'drill', journal: 'Percy needs a lesson. He needs several. He needs one, very quickly, before his bout.',
        objectives: [{ id: 'dummy', text: 'Drill Percy at his practice dummy', interact: 'obj:percy-practice-dummy', marker: { landmark: 'landmark:thimble-shop' } }],
        next: 'bout',
      },
      {
        id: 'bout', journal: 'Percy’s thousandth bout is against a duellist of rung 4,011, who is also a tailor.',
        objectives: [{ id: 'bout', text: 'Second Percy in his bout', interact: 'obj:percy-bout-ring', marker: { landmark: 'landmark:ladder-board' } }],
        next: 'percy',
      },
      {
        id: 'percy', journal: 'He won. By a pin. Literally, a pin.',
        objectives: [{ id: 'percy', text: 'Congratulate Percy Thimble', talk: 'npc:percy-thimble', marker: { landmark: 'landmark:thimble-shop' } }],
        onComplete: [{ setFlag: 'swordsman.percy_won', value: true }],
        next: 'rematch',
      },
      {
        id: 'rematch', journal: 'Rung 4,011, who is also a tailor, has chalked a rematch on the board within the hour, as Edgewater law allows. Percy has gone across to her shop to answer it. He has his best waistcoat on.',
        objectives: [{ id: 'shop', text: 'Go with Percy to answer the rematch', interact: 'obj:swordsman-rival-tailor', marker: { landmark: 'landmark:swordsman-nappi-shop' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40, hcItems: [{ item: 'a_blade_cloth_hands' }] },
  },
  {
    ...A1, id: 'quest:swordsman-the-insult-broker', name: 'The Insult Broker', type: 'side', region: Z1, giver: 'npc:celandine-sallow',
    summary: 'Madame Celandine Sallow sells pre-written insults to start duels with, and business is terrible. Everyone in Edgewater is too tired to be offended.',
    requires: req(done('quest:swordsman-the-bell-on-the-ladder')), firstStage: 'test',
    stages: [
      {
        id: 'test', journal: 'Try three fresh insults on three tired duellists, and see if anyone bites.',
        objectives: [{ id: 'test', text: 'Test new insults on the duellists of the Quarter', interact: 'obj:insult-test-*', count: 3, marker: { place: Z1 } }],
        next: 'sallow',
      },
      {
        id: 'sallow', journal: 'Nobody drew a sword. One of them laughed. That may be worse.',
        objectives: [{ id: 'sallow', text: 'Report back to Madame Sallow', talk: 'npc:celandine-sallow', marker: { landmark: 'landmark:sallow-booth' } }],
        next: 'cosimo',
      },
      {
        id: 'cosimo', journal: 'Forty years ago Celandine Sallow wrote her first insult, about Maestro Cosimo Bracca’s hat. It started the longest feud in the Quarter. She has written him her first apology, and is too proud to take it herself.',
        objectives: [{ id: 'cosimo', text: 'Deliver Madame Sallow’s apology to Maestro Bracca', talk: 'npc:cosimo-bracca', marker: { landmark: 'landmark:ladder-board' } }],
        onComplete: [{ setFlag: 'swordsman.sallow_sorry', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-insult-trade'] },
  },
  {
    ...A1, id: 'quest:swordsman-the-sisters-bridge', name: 'The Sisters’ Bridge', type: 'side', region: Z2, giver: 'npc:bettina-sarto',
    summary: 'One of the Duelling Bridges has been closed for thirty years. Rosa Sarto died on it mid-duel, and her Revenant still waits there. Her sister Bettina, eighty-one, waits on the far bank.',
    requires: req(done('quest:swordsman-the-saints-tomb')), firstStage: 'rosa',
    stages: [
      {
        id: 'rosa', journal: 'Rosa’s Revenant stands in the middle of the Sisters’ Bridge, blade raised, waiting for an opponent who died the same night she did.',
        objectives: [{ id: 'rosa', text: 'Go out to Rosa Sarto on the bridge', interact: 'obj:rosa-sarto-revenant', marker: { landmark: 'landmark:sisters-bridge' } }],
        next: 'bettina',
      },
      {
        id: 'bettina', journal: 'Rosa’s duel is over. Bettina is still on the far bank, with her hands folded.',
        objectives: [{ id: 'bettina', text: 'Go back to Bettina', talk: 'npc:bettina-sarto', marker: { landmark: 'landmark:sisters-bridge' } }],
        onComplete: [{ setFlag: 'swordsman.rosa_ended', value: true }],
        next: 'plot',
      },
      {
        id: 'plot', journal: 'Bettina is taking Rosa home to the Sarto plot, in the old duellists’ cemetery above the river, where there has been a place waiting for thirty years.',
        objectives: [{ id: 'plot', text: 'See Rosa laid to rest in the Sarto plot', interact: 'obj:swordsman-sarto-plot', marker: { landmark: 'landmark:swordsman-sarto-plot' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:swordsman-lunch-is-a-challenge', name: 'Lunch Is a Challenge', type: 'side', region: Z2, giver: 'npc:assunta-rill',
    summary: 'Young Tommaso Rill holds his bridge against all comers, by law. All comers include his mother, who would like to give him his lunch.',
    requires: req(done('quest:swordsman-the-saints-tomb')), firstStage: 'tommaso',
    stages: [
      {
        id: 'tommaso', journal: 'Tommaso is on the middle of Rill’s Bridge with a sword and a very stern face. His stomach is rumbling.',
        objectives: [{ id: 'tommaso', text: 'Get past Tommaso Rill', talk: 'npc:tommaso-rill', marker: { landmark: 'landmark:rills-bridge' } }],
        next: 'basket',
      },
      {
        id: 'basket', journal: 'You are across. Now get the basket across.',
        objectives: [{ id: 'basket', text: 'Deliver Tommaso’s lunch', interact: 'obj:rill-lunch-basket', marker: { landmark: 'landmark:rills-bridge' } }],
        next: 'assunta',
      },
      {
        id: 'assunta', journal: 'Tommaso is eating. The bridge is held. The law is satisfied.',
        objectives: [{ id: 'assunta', text: 'Tell Signora Rill', talk: 'npc:assunta-rill', marker: { landmark: 'landmark:rills-bridge' } }],
        next: 'note',
      },
      {
        id: 'note', journal: 'Tommaso is courting Gemma Fosco, who holds the next bridge downriver, by law, against all comers. Neither may leave their bridge. They have been courting for a year by shouting. He has written her a note.',
        objectives: [{ id: 'note', text: 'Carry Tommaso’s note to Fosco’s Bridge', interact: 'obj:swordsman-courting-note', marker: { landmark: 'landmark:swordsman-foscos-bridge' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 30, hcItems: [{ item: 'i_bread', qty: 3 }] },
  },
  {
    ...A1, id: 'quest:swordsman-the-empty-salle', name: 'The Empty Salle', type: 'side', region: Z3, giver: 'npc:ottavio-grisi',
    summary: 'Master Ottavio Grisi still teaches every morning, at eight sharp, to an empty room. He would like one student. Just one.',
    requires: req(done('quest:swordsman-rung-4012')), firstStage: 'student',
    stages: [
      {
        id: 'student', journal: 'Who in Edgewater wants to learn the sword from the beginning, slowly, properly? You know exactly who.',
        objectives: [{ id: 'percy', text: 'Find Master Grisi a student', talk: 'npc:percy-thimble', marker: { landmark: 'landmark:thimble-shop' } }],
        next: 'grisi',
      },
      {
        id: 'grisi', journal: 'Percy is coming at eight sharp, with a packed lunch and a pincushion.',
        objectives: [{ id: 'grisi', text: 'Tell Master Grisi he has a student', talk: 'npc:ottavio-grisi', marker: { landmark: 'landmark:grisi-salle' } }],
        onComplete: [{ setFlag: 'swordsman.grisi_student', value: true }],
        next: 'lesson',
      },
      {
        id: 'lesson', journal: 'Eight sharp, the next morning. Percy’s first proper lesson. Grisi has asked you to stand at the back and watch, in case either of them faints.',
        objectives: [{ id: 'lesson', text: 'Watch Percy’s first lesson in the Salle Grisi', interact: 'obj:swordsman-first-lesson', marker: { landmark: 'landmark:grisi-salle' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, skillPoints: 1 },
  },
  {
    ...A1, id: 'quest:swordsman-varrics-statue', name: 'Varric’s Statue', type: 'side', region: Z3, giver: 'npc:ottavio-grisi',
    summary: 'The riverside statue of Varric, the first Concord duellist, has started to weep black. Master Grisi has scrubbed it every morning for a week, and it weeps again by noon.',
    requires: req(done('quest:swordsman-the-champions-salute')), firstStage: 'statue',
    stages: [
      {
        id: 'statue', journal: 'Clean the statue, and read what it says under the tears.',
        objectives: [{ id: 'statue', text: 'Clean Varric’s statue', interact: 'obj:varric-statue', marker: { landmark: 'landmark:varric-statue' } }],
        next: 'grisi',
      },
      {
        id: 'grisi', journal: '“The fight is over when both swords are down.”',
        objectives: [{ id: 'grisi', text: 'Tell Master Grisi what the statue says', talk: 'npc:ottavio-grisi', marker: { landmark: 'landmark:grisi-salle' } }],
        next: 'second',
      },
      {
        id: 'second', journal: 'Both swords, the statue says. Grisi remembers a second statue across the river once, Varric’s last opponent, and the flood of C. 1013 that took it. It went into the river shallows.',
        objectives: [{ id: 'second', text: 'Find the lost statue in the river shallows', interact: 'obj:swordsman-second-statue', marker: { landmark: 'landmark:swordsman-river-shallows' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-varric-statue'] },
  },
  {
    ...A1, id: 'quest:swordsman-a-sheath-for-once', name: 'A Sheath for Once', type: 'side', region: Z4, giver: 'npc:dulcie-bellows',
    summary: 'Armourer Dulcie Bellows’s family has sharpened swords for three generations and has never made a scabbard, because no sword in Edgewater is ever put away.',
    requires: req(done('quest:swordsman-the-grand-salle')), firstStage: 'pattern',
    stages: [
      {
        id: 'pattern', journal: 'There used to be a scabbard pattern in the Old Armoury, from before the Hollowing. The automatons are guarding it, as they guard everything.',
        objectives: [{ id: 'automatons', text: 'Clear the automatons from the pattern-loft', kill: 'bx_blade_2', count: 3, marker: { place: Z4 } }],
        next: 'find',
      },
      {
        id: 'find', journal: 'The pattern-loft is quiet now, and very dusty.',
        objectives: [{ id: 'find', text: 'Find the old scabbard pattern', interact: 'obj:scabbard-pattern', marker: { place: Z4 } }],
        next: 'dulcie',
      },
      {
        id: 'dulcie', journal: 'A scabbard pattern on oiled linen, dated C. 1009.',
        objectives: [{ id: 'dulcie', text: 'Bring the pattern to Dulcie Bellows', talk: 'npc:dulcie-bellows', marker: { landmark: 'landmark:bellows-forge' } }],
        next: 'gift',
      },
      {
        id: 'gift', journal: 'Dulcie worked all night. The first scabbard made in Edgewater for thirty years is in your hands, and she says it is for the sword that most needs putting away. You can think of only one.',
        objectives: [{ id: 'ferro', text: 'Take the new scabbard to Maestra Ferro', talk: LF, marker: { landmark: 'landmark:ferro-salle' } }],
        onComplete: [{ setFlag: 'swordsman.ferro_sheath', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 60 },
  },
  {
    ...A1, id: 'quest:swordsman-the-armoury-roll', name: 'The Armoury Roll', type: 'side', region: Z4, giver: 'npc:benedict-strop',
    summary: 'Clerk Benedict Strop has been asked to count the Old Armoury’s swords, and the automatons keep moving them. He would like a second pair of hands, and a second pair of eyes.',
    requires: req(done('quest:swordsman-the-grand-salle')), firstStage: 'racks',
    stages: [
      {
        id: 'racks', journal: 'Three long racks of swords. Count them before the automatons rearrange them again.',
        objectives: [{ id: 'racks', text: 'Count the Armoury’s sword-racks', interact: 'obj:armoury-rack-*', count: 3, marker: { landmark: 'landmark:armoury-roll' } }],
        next: 'slot',
      },
      {
        id: 'slot', journal: 'One slot in the champions’ rack is empty, and it has a label.',
        objectives: [{ id: 'slot', text: 'Read the label on the empty slot', interact: 'obj:ferro-empty-slot', marker: { landmark: 'landmark:armoury-roll' } }],
        next: 'strop',
      },
      {
        id: 'strop', journal: '“Ferro: withdrawn, C. 1012.”',
        objectives: [{ id: 'strop', text: 'Give Clerk Strop the count', talk: 'npc:benedict-strop', marker: { landmark: 'landmark:armoury-roll' } }],
        next: 'yard',
      },
      {
        id: 'yard', journal: 'Strop wants to know where the automatons take the swords at night. The scrape-marks on the floor lead out of the back of the Armoury to the old Drill Yard.',
        objectives: [{ id: 'yard', text: 'See where the automatons take the swords', interact: 'obj:swordsman-drill-yard', marker: { landmark: 'landmark:swordsman-drill-yard' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-armoury-roll'] },
  },

  // ======================= ACT I: mentor thread (2) and bounties (2)
  {
    ...A1, id: 'quest:swordsman-ferros-last-bout', name: 'Ferro’s Last Bout', type: 'side', region: Z1, giver: LF,
    summary: 'Maestra Ferro keeps the record of her last duel in a drawer she never opens. Tonight, she says, she might.',
    requires: req({ trust: LF, value: 'friendly' }, done('quest:swordsman-the-champions-salute')), firstStage: 'record',
    stages: [
      {
        id: 'record', journal: 'The record is in the bottom drawer of the desk in Ferro’s salle, under a great many unpaid bills.',
        objectives: [{ id: 'record', text: 'Find the record of Ferro’s last bout', interact: 'obj:ferro-bout-record', marker: { landmark: 'landmark:ferro-salle' } }],
        next: 'ferro',
      },
      {
        id: 'ferro', journal: 'A bout-sheet, C. 1012, the night of the Hollowing. Ferro versus Vellacourt. And then a second line, under it.',
        objectives: [{ id: 'ferro', text: 'Ask Ferro about the second line', talk: LF, marker: { landmark: 'landmark:ferro-salle' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, skillPoints: 1 },
  },
  {
    ...A1, id: 'quest:swordsman-the-hand-that-quit', name: 'The Hand That Quit', type: 'side', region: Z3, giver: LF,
    summary: 'Ferro’s sword-hand shakes, and she has not held a blade in thirty years. She would like to fence one bout in the empty Grand Salle, to the first touch, and have it end.',
    requires: req({ trust: LF, value: 'trusted' }, done('quest:swordsman-the-grand-salle')), firstStage: 'piste',
    stages: [
      {
        id: 'piste', journal: 'The Grand Salle is empty and quiet now. Ferro is already on the piste, in her shirtsleeves.',
        objectives: [{ id: 'piste', text: 'Fence Ferro one bout in the Grand Salle', interact: 'obj:grand-salle-piste', marker: { place: Z3 } }],
        next: 'ferro',
      },
      {
        id: 'ferro', journal: 'One touch. One bow. Ended.',
        objectives: [{ id: 'ferro', text: 'Sit with Ferro on the salle steps', talk: LF, marker: { place: Z3 } }],
        onComplete: [{ setFlag: 'swordsman.ferro_devotable', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:swordsman-bounty-midnight-revenants', name: 'Bounty: the Midnight Revenants', type: 'bounty', region: Z1, giver: 'npc:ugo-fiore',
    summary: 'Duelist Revenants climb out of the Quarter’s duel-graves every midnight and challenge whoever is passing. The Watch pays by the Revenant.',
    requires: req(done('quest:swordsman-strike-them-off')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'They salute before they lunge. Use it.', objectives: [{ id: 'revenants', text: 'Defeat the Midnight Revenants', kill: 'bx_blade_0', count: 6, marker: { place: Z1 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 150 },
  },
  {
    ...A1, id: 'quest:swordsman-bounty-drill-sergeant', name: 'Bounty: the Rusted Drill-Sergeant', type: 'bounty', region: Z2, giver: 'npc:ugo-fiore',
    summary: 'A Training Automaton has walked out of the Old Armoury onto the Duelling Bridges and is drilling everybody who crosses, whether they like it or not.',
    requires: req(done('quest:swordsman-the-saints-tomb')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'It shouts “Lunge! Recover! Lunge!” and it does not take no for an answer.', objectives: [{ id: 'sergeant', text: 'Defeat the Rusted Drill-Sergeant', kill: 'bx_blade_2', count: 1, marker: { place: Z2 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 120 },
  },

  // ======================= ACT II: the class thread (C-1 … C-6) + featured bearers
  {
    ...A2, id: 'quest:swordsman-the-watch-house-ladder', name: 'The Watch House Ladder', type: 'class', region: 'vil:brind', giver: 'npc:rook',
    summary: 'The Brindlecross militia captain, they say, runs her eleven farmers like a salle and keeps a Ladder chalked on the Watch House wall. The old Blade folk of the village gather there.',
    requires: req(done('quest:cc-through-the-arch')), autoStart: true, firstStage: 'watch',
    stages: [
      {
        id: 'watch', journal: 'You came through the Edge Gate with the Hall half ringing in your chest and Vellacourt’s “Again!” still in your ears. The Watch House is on the Brindlecross green. Listen for the sound of chalk and arguing.',
        objectives: [{ id: 'basilio', text: 'Find the Blade folk at the Watch House', talk: 'npc:basilio-trento', marker: { landmark: 'landmark:brind-watch-house' } }],
        next: 'rook',
      },
      {
        id: 'rook', journal: 'Old Ser Basilio says the captain knows where Blade’s Sentinel lies. She is the one with the eyepatch and the halberd.',
        objectives: [{ id: 'rook', text: 'Speak to Captain Rook Harrow at the Watch House', talk: 'npc:rook', marker: { landmark: 'landmark:brind-watch-house' } }],
        next: 'ladder',
      },
      {
        id: 'ladder', journal: 'Rook wants your name on the Watch House Ladder before you go anywhere near her graveyard. The chalk is on a string by the door.',
        objectives: [{ id: 'ladder', text: 'Chalk your name on the Watch House Ladder', interact: 'obj:swordsman-watch-ladder', marker: { landmark: 'landmark:brind-watch-house' } }],
        onComplete: [{ startQuest: 'quest:swordsman-the-barrowdowns' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-blade-watch-house'] },
  },
  {
    ...A2, id: 'quest:swordsman-the-barrowdowns', name: 'The Barrowdowns', type: 'class', region: 'region:alder', giver: 'npc:rook',
    summary: 'The empty graves of Brindlecross lead down to Bonelord Varric’s barrow, under the old graveyard, where the dead of his muster fence duels in the dark that never end.',
    requires: req(done('quest:swordsman-the-watch-house-ladder')), firstStage: 'lantern',
    stages: [
      {
        id: 'lantern', journal: 'Rook says you will want Old Hobb’s lantern. The sexton has the only one that stays lit down there.',
        objectives: [{ id: 'hobb', text: 'Borrow Old Hobb’s lantern', talk: 'npc:hobb', marker: { landmark: 'landmark:brind-graveyard' } }],
        next: 'barrow',
      },
      {
        id: 'barrow', journal: 'Down through the empty graves, into the Barrowdowns.',
        objectives: [{ id: 'barrow', text: 'Go down into Varric’s barrow', reach: 'inst:varric-barrow', marker: { landmark: 'landmark:brind-graveyard' } }],
        next: 'duels',
      },
      {
        id: 'duels', journal: 'In the dark, the dead are fencing. They have been fencing for a very long time. Nobody has ever told them to stop.',
        objectives: [{ id: 'duels', text: 'End the duels in the dark', interact: 'obj:swordsman-endless-duel-*', count: 3, marker: { landmark: 'landmark:brind-graveyard' } }],
        onComplete: [{ startQuest: 'quest:swordsman-bonelord-varric' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-varric'] },
  },
  {
    ...A2, id: 'quest:swordsman-bonelord-varric', name: 'Bonelord Varric', type: 'class', region: 'region:alder', giver: 'npc:rook',
    summary: 'Bonelord Varric ended the Schools’ War in a single duel. The statue in Edgewater says the fight is over when both swords are down. His has been up for thirty years.',
    requires: req(done('quest:swordsman-the-barrowdowns')), firstStage: 'fight',
    stages: [
      {
        id: 'fight', journal: 'Varric is the Sentinel of the Blade school. Win its mark.',
        objectives: [{ id: 'varric', text: 'Duel Bonelord Varric', kill: 'bx_varric', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-blade' }],
        next: 'release',
      },
      {
        id: 'release', journal: 'Varric has gone down on one knee. He is trying to say something.',
        objectives: [{ id: 'mark', text: 'Hear Varric out', when: { flag: 'story.sentinel.blade' } }],
        next: 'tell',
      },
      {
        id: 'tell', journal: 'The duels under the churchyard have stopped. Old Hobb has listened to them through the turf for thirty years, and you still have his lantern.',
        objectives: [{ id: 'hobb', text: 'Take Old Hobb his lantern back', talk: 'npc:hobb', marker: { landmark: 'landmark:brind-graveyard' } }],
        onComplete: [{ startQuest: 'quest:swordsman-the-champions-climb' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-sentinel-varric'] },
  },
  {
    ...A2, id: 'quest:swordsman-the-champions-climb', name: 'The Champion’s Climb', type: 'class', region: 'region:storm', giver: 'npc:rook',
    summary: 'Word comes down from the Stormcliffs: a man in white is climbing the Storm Spire, chalking challenges on every step, to duel the Stormcrow so that its scream will carry his name across the ring.',
    requires: req(done('quest:swordsman-bonelord-varric')), firstStage: 'jar',
    stages: [
      {
        id: 'jar', journal: 'A man in white came through Cliffstair a week ago. If anybody knows what he did there, it will be the Lightning Jar.',
        objectives: [{ id: 'jar', text: 'Ask after the man in white at the Lightning Jar', interact: 'obj:swordsman-jar-slate', marker: { landmark: 'landmark:cliff-lightning-jar' } }],
        next: 'stair',
      },
      {
        id: 'stair', journal: 'Vellacourt’s challenges are chalked up the Storm Spire stair at Cliffstair. Follow them up.',
        onEnter: [{ openDialogue: 'dialogue:swordsman-champions-climb' }],
        objectives: [{ id: 'chalk', text: 'Follow Vellacourt’s challenges up the Storm Spire', interact: 'obj:swordsman-spire-challenge-*', count: 3, marker: { region: 'region:storm' } }],
        onComplete: [{ startQuest: 'quest:swordsman-the-stormcrow' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:swordsman-the-stormcrow', name: 'The Stormcrow', type: 'class', region: 'region:storm', giver: 'npc:rook',
    summary: 'The Stormcrow screams the news of a Turning that never came from the top of the Storm Spire. Vellacourt has challenged it, and it has accepted, in its way.',
    requires: req(done('quest:swordsman-the-champions-climb')), firstStage: 'spire',
    stages: [
      {
        id: 'spire', journal: 'The top of the Storm Spire, in the lightning. Vellacourt has left the Stormcrow raging and gone over the edge, laughing.',
        objectives: [{ id: 'lair', text: 'Climb to the top of the Storm Spire', reach: 'inst:sentinel-storm', marker: { region: 'region:storm' } }],
        next: 'crow',
      },
      {
        id: 'crow', journal: 'The Stormcrow is the Sentinel of the Storm school. The Storm bearers cannot win their mark while it rages.',
        objectives: [{ id: 'crow', text: 'Defeat the Stormcrow', kill: 'bx_stormcrow', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-storm' }, { setFlag: 'story.bearer.stormlancer', value: true }],
        next: 'glove',
      },
      {
        id: 'glove', journal: 'The lightning has stopped. On the iron rail at the edge of the Spire top, where Vellacourt went over, something white is flapping.',
        objectives: [{ id: 'glove', text: 'See what Vellacourt left on the Spire rail', interact: 'obj:swordsman-spire-glove' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-swordsman-climb'] },
  },
  {
    ...A2, id: 'quest:swordsman-a-letter-from-ferro', name: 'A Letter from Ferro', type: 'class', region: 'vil:brind', giver: LF,
    summary: 'Somebody has come through the Blade arch from Edgewater with a letter for you, and a great many questions about Concordian tailoring.',
    requires: req(done('quest:swordsman-the-stormcrow')), autoStart: true, firstStage: 'letter',
    stages: [
      {
        id: 'letter', journal: 'Percy Thimble is at the Gate Circle, in his best coat, holding a letter very carefully by one corner.',
        objectives: [{ id: 'percy', text: 'Meet Percy Thimble at the Gate Circle', talk: 'npc:percy-thimble-concordia', marker: { landmark: 'landmark:gate-circle' } }],
        next: 'escort',
      },
      {
        id: 'escort', journal: 'Percy has never set foot outside Edgewater, and the moor has wolves on it. He would like to meet the Blade folk at the Watch House. He would like to arrive alive.',
        onEnter: [{ escort: 'npc:percy-thimble-concordia', to: 'landmark:brind-watch-house' }],
        objectives: [{ id: 'percy', text: 'Bring Percy Thimble safely to the Watch House', when: { any: [{ flag: 'escort.percy-thimble-concordia', op: '==', value: 'arrived' }, { flag: 'escort.percy-thimble-concordia', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:brind-watch-house' } }],
        next: [{ when: { flag: 'escort.percy-thimble-concordia', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'court' }],
      },
      {
        id: 'regroup', journal: 'Percy went down in the heather with a shriek, and one of Rook’s farmers carried him back to the Gate Circle over one shoulder. He has re-pinned his hem and is ready to try again.',
        onEnter: [{ escort: 'npc:percy-thimble-concordia', to: 'landmark:brind-watch-house' }],
        objectives: [{ id: 'percy', text: 'Try again: bring Percy to the Watch House', when: { any: [{ flag: 'escort.percy-thimble-concordia', op: '==', value: 'arrived' }, { flag: 'escort.percy-thimble-concordia', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:brind-watch-house' } }],
        next: [{ when: { flag: 'escort.percy-thimble-concordia', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'court' }],
      },
      {
        id: 'court', journal: 'Your half-stone has been tugging towards the Stone Court all day, towards the Terrace half and the one who carries it.',
        objectives: [{ id: 'court', text: 'Sit with the Samurai bearer at the Stone Court', interact: 'obj:blade-court-bench', marker: { landmark: 'landmark:stone-court' } }],
        next: 'reply',
      },
      {
        id: 'reply', journal: 'Ferro wrote you two words. She will expect no more than two back. There is a slot in the Blade arch’s keystone where a Ladder challenge used to go.',
        objectives: [{ id: 'reply', text: 'Leave Ferro your answer in the Blade arch', interact: 'obj:swordsman-reply-arch', marker: { landmark: 'landmark:gate-circle' } }],
        onComplete: [{ setFlag: 'story.act2_ready', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:swordsman-no-quarter', name: 'No Quarter', type: 'side', region: 'region:alder', giver: 'npc:bearer-reaver',
    summary: 'The Reaver bearer has come to the Barrowdowns to fight Varric’s dead muster, every last one of them, and does not mean to stop at Varric. Someone has to teach an axe to yield.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'stand',
    stages: [
      {
        id: 'stand', journal: 'Garrow Redaxe has planted a red war-banner at the barrow-mouth in the graveyard and is waiting for the dead to come up.',
        objectives: [{ id: 'stand', text: 'Meet the Reaver bearer at the barrow-mouth', interact: 'obj:swordsman-reaver-stand', marker: { landmark: 'landmark:brind-graveyard' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'The axe is down. Garrow wants a word at the Stone Court.',
        // co-op: if a party member plays the Reaver, they ARE this bearer (the NPC is hidden)
        objectives: [{ id: 'garrow', text: 'Talk to the Reaver bearer', when: { any: [{ flag: 'swordsman.garrow_thanked' }, { partyHasClass: 'reaver' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.reaver', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A2, id: 'quest:swordsman-the-falcon-and-the-crow', name: 'The Falcon and the Crow', type: 'side', region: 'region:storm', giver: 'npc:bearer-falconer',
    summary: 'The Falconer bearer is at Cliffstair with a hood the size of a barrel. He wants to hood the Stormcrow. You want to beat it. You are both going up the same cliff.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'perch',
    stages: [
      {
        id: 'perch', journal: 'Perrin Featherstone has built a falconer’s perch halfway up the Stormcliffs, and wants a second pair of hands on the line.',
        objectives: [{ id: 'perch', text: 'Climb to the Falconer’s perch on the Stormcliffs', interact: 'obj:swordsman-falcon-perch', marker: { landmark: 'landmark:cliff-storm-spire' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Whoever was right about the Stormcrow, you both came down the cliff. Perrin wants a word.',
        objectives: [{ id: 'perrin', text: 'Talk to the Falconer bearer', when: { any: [{ flag: 'swordsman.perrin_thanked' }, { partyHasClass: 'falconer' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.falconer', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  // ======================= ACT III: class quests (III-4 + 3 side)
  {
    ...A3, id: 'quest:swordsman-the-chimeras-champion', name: 'The Chimera’s Champion', type: 'class', region: 'region:heart', giver: 'npc:casimir',
    summary: 'At the top of the Twelve Stairs the Union Chimera waits, and its sword-arm is a man in white and gold who is still smiling. It is Vellacourt, and he is calling “Again.”',
    requires: req(done('quest:heart-stairs')), autoStart: true, firstStage: 'herald',
    stages: [
      { id: 'herald', journal: 'Ser Auguste Vellacourt, champion of the Ladder, who took the other half of your stone at the Eve, has been bound into the Union Chimera as its champion: a duel that will never end, with a whole beast behind it.', objectives: [{ id: 'herald', text: 'Face the Chimera’s Champion', kill: 'cb_chimeras-champion', count: 1, marker: { landmark: 'landmark:twelve-stairs-top' } }], onComplete: [{ openDialogue: 'dialogue:swordsman-herald-fate' }], next: 'fate' },
      { id: 'fate', journal: 'The Chimera is down on the stair. Vellacourt hangs from its shoulder, bound to the elbow, and his sword is coming up into guard again.', objectives: [{ id: 'fate', text: 'Decide Vellacourt’s fate', when: { flag: 'swordsman.nemesis_fate' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 3 },
  },
  {
    // the ribbon reaches every hero: in Ferro's C-6 letter (swordsman.ferro_ribbon_letter), or from Percy on the stair in the III-4 aftermath
    ...A3, id: 'quest:swordsman-ferros-ribbon', name: 'Ferro’s Ribbon', type: 'side', region: 'region:heart', giver: LF,
    summary: 'A champion’s ribbon belongs on the Ladder’s banner. Ferro took hers down thirty years ago. The old Blade banner still hangs at the head of its stair, and you have her ribbon.',
    requires: req(done('quest:swordsman-the-chimeras-champion')), autoStart: true, firstStage: 'look',
    stages: [
      { id: 'look', journal: 'The Blade banner hangs at the head of the Blade stair, where the twelve stairs meet. Go and look at it before you tie anything to it.', objectives: [{ id: 'banner', text: 'Look at the old Blade banner', interact: 'obj:swordsman-blade-banner', marker: { landmark: 'landmark:twelve-stairs-top' } }], next: 'percy' },
      { id: 'percy', journal: 'The banner would not hold a ribbon through one gust. It needs a needle. You know exactly one tailor in the Heart.', objectives: [{ id: 'percy', text: 'Ask Percy Thimble to mend the banner', talk: 'npc:percy-thimble-concordia', marker: { landmark: 'landmark:heart-camp' } }], next: 'tie' },
      { id: 'tie', journal: 'The Blade banner hangs at the head of the Blade stair, where the twelve stairs meet, rotted almost to thread.', objectives: [{ id: 'banner', text: 'Tie Ferro’s ribbon to the Blade banner', interact: 'obj:swordsman-blade-banner', marker: { landmark: 'landmark:twelve-stairs-top' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A3, id: 'quest:swordsman-the-kept-opponents', name: 'The Kept Opponents', type: 'side', region: 'region:heart', giver: LF,
    summary: 'Everyone Ser Auguste Vellacourt ever beat on the Ladder walked out of the Old Armoury behind him. They have been marched all the way to the Legion camp, still fencing.',
    requires: req(done('quest:heart-legion')), autoStart: true, firstStage: 'rank',
    stages: [
      { id: 'rank', journal: 'The Revenants from Vellacourt’s gallery stand in their own rank in the Legion camp, still in guard.', objectives: [{ id: 'rank', text: 'Find Vellacourt’s kept opponents in the Legion camp', interact: 'obj:swordsman-kept-opponents', marker: { landmark: 'landmark:legion-camp' } }], next: 'boy' },
      { id: 'boy', journal: 'There is a gap in the rank the width of a boy, and small boot-prints going towards the Twelve Stairs. In Vellacourt’s gallery nobody ever left the line.', objectives: [{ id: 'boy', text: 'Follow the boot-prints to the foot of the Stairs', interact: 'obj:swordsman-kept-boy', marker: { landmark: 'landmark:twelve-stairs' } }], next: 'kept' },
      { id: 'kept', journal: 'The boy from rung 400 is back in his place. The whole rank is waiting for somebody to tell it the bout is over.', objectives: [{ id: 'kept', text: 'Let Vellacourt’s kept opponents yield', interact: 'obj:swordsman-kept-opponents', marker: { landmark: 'landmark:legion-camp' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A3, id: 'quest:swordsman-percys-thousandth', name: 'Percy’s Thousandth', type: 'side', region: 'region:heart', giver: 'npc:percy-thimble-concordia',
    summary: 'Percy Thimble, the Ladder’s cheerful tailor and its lowest rung, has followed you all the way to the Heart in his good coat. He would like one more bout, at the edge of the world, against the most frightening thing he can find.',
    requires: req(done('quest:heart-legion')), autoStart: true, firstStage: 'percy',
    stages: [
      { id: 'percy', journal: 'Percy is at the Heart camp, pinning up his sleeves.', objectives: [{ id: 'percy', text: 'Talk to Percy Thimble at the Heart camp', talk: 'npc:percy-thimble-concordia', marker: { landmark: 'landmark:heart-camp' } }], next: 'bout' },
      { id: 'bout', journal: 'A Hollow Legionnaire has stood in guard at the edge of the camp all week. Nobody has challenged him. Percy thinks that is rude.', objectives: [{ id: 'bout', text: 'Second Percy against the Hollow Legionnaire', interact: 'obj:swordsman-percy-heart-bout', marker: { landmark: 'landmark:heart-camp' } }], next: 'chalk' },
      { id: 'chalk', journal: 'A touch is a touch, and a touch goes on a Ladder. Percy has run off to the foot of the Twelve Stairs with a stick of chalk.', objectives: [{ id: 'chalk', text: 'See what Percy has chalked at the foot of the Stairs', interact: 'obj:swordsman-percy-chalk', marker: { landmark: 'landmark:twelve-stairs' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1 },
  },
];

export default quests;
