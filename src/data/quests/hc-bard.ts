/**
 * Hollow Crown: the BARD campaign (docs/lore/hollow-crown/06-outlines/song.md). Act I in Lyrehaven
 * (area:song-capital) and the Act II class thread in Concordia. Act III class quests land with the Heart.
 * Built on the Ash reference (10-campaign-style.md). Owner: Claude 4.
 */
import type { NarrativeCondition, QuestDef } from '@/core';

const BARD: NarrativeCondition = { heroClass: 'bard' };
const done = (q: `quest:${string}`): NarrativeCondition => ({ questCompleted: q });
const req = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: [BARD, ...c] });
const A1 = { act: 'act1' as const, campaign: 'bard', chapter: 'Lyrehaven' };
const A2 = { act: 'act2' as const, campaign: 'bard', chapter: 'Concordia' };
const A3 = { act: 'act3' as const, campaign: 'bard', chapter: 'The Heart' };
const Z1 = 'zone:song-capital-1' as const, Z2 = 'zone:song-capital-2' as const, Z3 = 'zone:song-capital-3' as const, Z4 = 'zone:song-capital-4' as const;
const L1 = 'inst:song-capital-lair-1' as const, L2 = 'inst:song-capital-lair-2' as const, L3 = 'inst:song-capital-lair-3' as const;
const RV = 'npc:rosalind-vell' as const, BM = 'npc:blaise-marchetti' as const, FG = 'npc:beadle-fothergill' as const;
const ROOM = { landmark: 'landmark:rosalind-dressing-room' } as const;

const quests: QuestDef[] = [
  // ======================= ACT I: main (I-1 … I-10)
  {
    ...A1, id: 'quest:bard-the-bell-in-the-opera', name: 'The Bell in the Opera', type: 'main', region: Z1, giver: RV,
    summary: 'You broke into the silent Grand Opera at midnight to practise where the echo is best. Then a bell rang somewhere far away, and the great chandelier sang back.',
    requires: BARD, autoStart: true, firstStage: 'stalls',
    stages: [
      {
        id: 'stalls', journal: 'The chandelier is humming its first note in seven years, and something under the stage is humming with it. Siren Wisps are rising out of the empty stalls.',
        onEnter: [{ openDialogue: 'dialogue:bard-bell-night' }],
        objectives: [{ id: 'wisps', text: 'Clear the Siren Wisps from the stalls', kill: 'bx_song_0', count: 3, marker: { landmark: 'landmark:grand-opera' } }],
        next: 'rosalind',
      },
      {
        id: 'rosalind', journal: 'A woman in a quilted dressing-gown and full stage make-up is standing in the royal box with a candle and a pug, applauding.',
        objectives: [{ id: 'rosalind', text: 'Talk to the woman in the royal box', talk: RV, marker: { landmark: 'landmark:grand-opera' } }],
        onComplete: [{ setFlag: 'bard.bell_heard', value: true }],
        next: 'corridor',
      },
      {
        id: 'corridor', journal: 'Signora Vell has swept off down the backstage corridor with her candle and her pug, and told you to follow her to her dressing room. At once, darling.',
        objectives: [{ id: 'room', text: 'Follow Rosalind backstage to her dressing room', reach: 'landmark:rosalind-dressing-room', marker: ROOM }],
        next: 'room',
      },
      {
        id: 'room', journal: 'A dressing room with a hundred honey jars, a chaise longue and seven years of dust on every mirror but one.',
        objectives: [{ id: 'rosalind', text: 'Sit with Rosalind in her dressing room', talk: RV, marker: ROOM }],
        onComplete: [{ startQuest: 'quest:bard-the-five-bars' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-harmonia', 'lore:hc-grand-opera'] },
  },
  {
    ...A1, id: 'quest:bard-the-five-bars', name: 'The Five Bars', type: 'main', region: Z1, giver: RV,
    summary: 'Signora Vell wants the Opera’s overture back. Five buskers in the Opera Quarter each remember one bar of it, and the hollow Siren Wisps drink every note the moment it is played.',
    requires: req(done('quest:bard-the-bell-in-the-opera')), firstStage: 'bars',
    stages: [
      {
        id: 'bars', journal: 'Five buskers, five bars. Hear each one play, and keep the notes in your head before the wisps can get at them.',
        objectives: [{ id: 'bars', text: 'Learn the five bars from the buskers in the Opera Quarter', interact: 'obj:busker-bar-*', count: 5, marker: { place: Z1 } }],
        next: 'wisps',
      },
      {
        id: 'wisps', journal: 'The wisps followed the music down from the fountains. They are fat with stolen notes.',
        objectives: [{ id: 'wisps', text: 'Drive off the note-drinking wisps', kill: 'bx_song_0', count: 4, marker: { landmark: 'landmark:humming-fountain' } }],
        next: 'fountains',
      },
      {
        id: 'fountains', journal: 'The wisps came out of the fountains. Every fountain in the Opera Quarter used to hum a bar of something. Find out what has happened to them.',
        objectives: [{ id: 'fountains', text: 'Look into the Quarter’s silent fountains', interact: 'obj:bard-silent-fountain-*', count: 3, marker: { place: Z1 } }],
        next: 'report',
      },
      {
        id: 'report', journal: 'You have all five bars. The fountains that used to hum are full of black tears.',
        objectives: [{ id: 'rosalind', text: 'Play the overture for Signora Vell', talk: RV, marker: ROOM }],
        onComplete: [{ startQuest: 'quest:bard-the-choir-loft' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40 },
  },
  {
    ...A1, id: 'quest:bard-the-choir-loft', name: 'The Choir Loft', type: 'main', region: Z1, giver: RV,
    summary: 'Something sings in the Opera’s choir loft at night, and every busker who stops to listen forgets their only tune.',
    requires: req(done('quest:bard-the-five-bars')), firstStage: 'listen',
    stages: [
      {
        id: 'listen', journal: 'Rosalind says the singing starts when the lamps on the Opera Quarter go out. Listen at the loft stair after dark.',
        objectives: [{ id: 'listen', text: 'Listen at the choir-loft stair, at night', when: { flag: 'bard.loft_heard' }, marker: { landmark: 'landmark:choir-loft-stair' } }],
        next: 'loft',
      },
      {
        id: 'loft', journal: 'A hymn, sung slightly flat, by a choir that is not there. Go up.',
        objectives: [{ id: 'enter', text: 'Climb into the choir loft', reach: L1, marker: { landmark: 'landmark:choir-loft-stair' } }],
        next: 'phantom',
      },
      {
        id: 'phantom', journal: 'The Choir Phantom conducts the dark. Sing harmony in its rests.',
        objectives: [{ id: 'phantom', text: 'Defeat the Choir Phantom', kill: 'bx_song_4', count: 1 }],
        next: 'book',
      },
      {
        id: 'book', journal: 'The phantom left its hymn-book on the lectern, dripping black.',
        objectives: [{ id: 'book', text: 'Close the Phantom’s hymn-book', interact: 'obj:phantom-hymn-book' }],
        next: 'report',
      },
      {
        id: 'report', journal: 'The loft is quiet. The buskers’ tunes have come back to them, mostly.',
        objectives: [{ id: 'rosalind', text: 'Tell Rosalind the loft is quiet', talk: RV, marker: ROOM }],
        onComplete: [{ setFlag: 'bard.phantom_rests', value: true }, { startQuest: 'quest:bard-the-impresario' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 80, hcItems: [{ item: 'a_song_cloth_helm' }] },
  },
  {
    ...A1, id: 'quest:bard-the-impresario', name: 'The Impresario', type: 'main', region: Z2, giver: BM,
    summary: 'A man in a lilac coat has swept onto the Busking Steps and is paying fortunes for the last good songs in Lyrehaven. He has asked for you by name.',
    requires: req(done('quest:bard-the-choir-loft')), firstStage: 'steps',
    stages: [
      {
        id: 'steps', journal: 'Impresario Blaise Marchetti holds court on the Busking Steps, buying songs out of hats.',
        objectives: [{ id: 'marchetti', text: 'Meet the Impresario on the Busking Steps', talk: BM, marker: { landmark: 'landmark:busking-steps-pitch' } }],
        next: 'hats',
      },
      {
        id: 'hats', journal: 'He paid three buskers a fortune each for their songs this morning. Before you tell Rosalind, find out what they sold.',
        objectives: [{ id: 'hats', text: 'Talk to the buskers who sold their songs', interact: 'obj:bard-sold-busker-*', count: 3, marker: { landmark: 'landmark:busking-steps-pitch' } }],
        next: 'rosalind',
      },
      {
        id: 'rosalind', journal: 'He wants to reopen the Grand Opera for one gala night, and he wants you to sing Rosalind’s old role. Someone should tell Rosalind.',
        objectives: [{ id: 'rosalind', text: 'Tell Rosalind about the gala', talk: RV, marker: ROOM }],
        onComplete: [{ setFlag: 'bard.marchetti_met', value: true }, { startQuest: 'quest:bard-the-songbook-act' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-blaise-marchetti'] },
  },
  {
    ...A1, id: 'quest:bard-the-songbook-act', name: 'The Songbook Act', type: 'main', region: Z3, giver: 'npc:isadora-quaver',
    summary: 'The Conservatory moves to write down every song left in Lyrehaven and lock the scores away. The Discord moves to sing every song a last time and let it go. You have been asked to speak.',
    requires: req(done('quest:bard-the-impresario')), firstStage: 'canvass',
    stages: [
      {
        id: 'canvass', journal: 'Rosalind said: before you speak, ask a busker and a student what the Act would cost them. Rosin Kate leads the Fiddlers on the Steps. Florian Treble practises in Room Nine.',
        objectives: [
          { id: 'kate', text: 'Ask Rosin Kate what the Act means to the Steps', talk: 'npc:rosin-kate', marker: { landmark: 'landmark:busking-steps-pitch' } },
          { id: 'florian', text: 'Ask Florian Treble what the Act means to the Conservatory', talk: 'npc:florian-treble', marker: { landmark: 'landmark:practice-room-nine' } },
        ],
        next: 'vote',
      },
      {
        id: 'vote', journal: 'The Conservatory Hall sits tonight. Rector Quaver has the Act; Verity Hush has the Discord; you have the floor.',
        objectives: [{ id: 'vote', text: 'Speak at the Conservatory Hall', when: { flag: 'bard.songbook' }, marker: { landmark: 'landmark:conservatory-hall' } }],
        next: 'steps',
      },
      {
        id: 'steps', journal: 'The Hall has decided. Go down to the Busking Steps tonight and hear what Lyrehaven sounds like now.',
        objectives: [{ id: 'steps', text: 'Walk the Busking Steps that night', interact: 'obj:bard-steps-night', marker: { landmark: 'landmark:busking-steps-pitch' } }],
        onComplete: [{ startQuest: 'quest:bard-the-grand-organ' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-conservatory', 'lore:hc-discord'] },
  },
  {
    ...A1, id: 'quest:bard-the-grand-organ', name: 'The Grand Organ', type: 'main', region: Z3, giver: 'npc:isadora-quaver',
    summary: 'Whatever the Hall decided, every song in Lyrehaven is ending up in the Grand Organ, whose pipes run up behind the Conservatory’s walls. It ate a choir seven years ago, and it is hungry again.',
    requires: req(done('quest:bard-the-songbook-act')), firstStage: 'walls',
    stages: [
      {
        id: 'walls', journal: 'The Grand Organ’s pipes run up behind the Conservatory’s walls. Rector Quaver says the walls have started breathing. Listen to them before you open the organ-hall.',
        objectives: [{ id: 'walls', text: 'Listen at the Conservatory walls', interact: 'obj:bard-organ-wall-*', count: 3, marker: { place: Z3 } }],
        next: 'door',
      },
      {
        id: 'door', journal: 'The organ-hall door has been locked for seven years. It is standing open.',
        objectives: [{ id: 'enter', text: 'Enter the organ-hall', reach: L2, marker: { landmark: 'landmark:organ-hall-door' } }],
        onComplete: [{ openDialogue: 'dialogue:bard-organ-hall' }],
        next: 'organ',
      },
      {
        id: 'organ', journal: 'The floor is its keyboard. Find the chord that shuts its pipes before they blast.',
        objectives: [{ id: 'organ', text: 'Defeat the Organ That Ate a Choir', kill: 'cb_organ-that-ate-a-choir', count: 1 }],
        next: 'pipes',
      },
      {
        id: 'pipes', journal: 'Something is knocking inside the biggest pipes. Several somethings, politely.',
        objectives: [{ id: 'pipes', text: 'Open the organ’s pipes', interact: 'obj:organ-chorister-pipes' }],
        onComplete: [{ setFlag: 'bard.choir_freed', value: true }, { startQuest: 'quest:bard-marchettis-masterpiece' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 120 },
  },
  {
    ...A1, id: 'quest:bard-marchettis-masterpiece', name: 'Marchetti’s Masterpiece', type: 'main', region: Z4, giver: RV,
    summary: 'Twelve choristers came out of the organ, and every one of them says the Impresario showed them in. His workshop is somewhere in the Prompter’s Cellars.',
    requires: req(done('quest:bard-the-grand-organ')), firstStage: 'rosalind',
    stages: [
      {
        id: 'rosalind', journal: 'Rosalind will want to hear it from you, before she hears it from the choristers.',
        objectives: [{ id: 'rosalind', text: 'Tell Rosalind what the choristers said', talk: RV, marker: ROOM }],
        next: 'cellars',
      },
      {
        id: 'cellars', journal: 'The Prompter’s Cellars run under the whole of the Opera Quarter. Something has been burning paper down there, a little at a time, for a month.',
        objectives: [{ id: 'ash', text: 'Follow the scraps of burned paper through the cellars', interact: 'obj:bard-burned-song-*', count: 3, marker: { place: Z4 } }],
        next: 'workshop',
      },
      {
        id: 'workshop', journal: 'Under the stage, past the prompt-box, a light is burning where nobody should be.',
        objectives: [{ id: 'score', text: 'Find Marchetti’s workshop in the Prompter’s Cellars', interact: 'obj:marchetti-score', marker: { landmark: 'landmark:prompt-box' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'One score, written in black-tear ink, made of every song he bought. He means the Opera half to play it forever.',
        objectives: [{ id: 'rosalind', text: 'Take the news to Rosalind', talk: RV, marker: ROOM }],
        onComplete: [{ startQuest: 'quest:bard-the-opera-stage' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-marchettis-score'] },
  },
  {
    ...A1, id: 'quest:bard-the-opera-stage', name: 'The Opera Stage', type: 'main', region: L3, giver: RV,
    summary: 'Gala night at the Grand Opera, and every seat is sold. The Impresario is conducting the stage itself, and the Opera half is singing under the boards.',
    requires: req(done('quest:bard-marchettis-masterpiece')), firstStage: 'gala',
    stages: [
      {
        id: 'gala', journal: 'The house lights are going down. Your half-stone is singing so loudly the front row can hear it.',
        objectives: [{ id: 'enter', text: 'Take the stage on gala night', reach: L3, marker: { landmark: 'landmark:grand-opera' } }],
        onComplete: [{ openDialogue: 'dialogue:bard-gala-night' }],
        next: 'marchetti',
      },
      {
        id: 'marchetti', journal: 'Trapdoors, flying flats and a chandelier, all keeping his score. Improvise off the beat.',
        objectives: [{ id: 'marchetti', text: 'Stop Impresario Marchetti', kill: 'cb_impresario-marchetti', count: 1 }],
        next: 'stone',
      },
      {
        id: 'stone', journal: 'Marchetti took his bow and flew out on the scenery ropes. The Opera half is still singing in the boards.',
        objectives: [{ id: 'stone', text: 'Claim the Opera half', interact: 'obj:song-capital-halfstone' }],
        onComplete: [{ setFlag: 'bard.halfstone', value: true }, { startQuest: 'quest:bard-curtain-call' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, skillPoints: 1, lore: ['lore:hc-half-stones'] },
  },
  {
    ...A1, id: 'quest:bard-curtain-call', name: 'Curtain Call', type: 'main', region: Z1, giver: RV,
    summary: 'Marchetti is flying for the Lyre Gate, and the half-stone in your hand can open it. Rosalind has put on her travelling hat to see you as far as the meadows.',
    requires: req(done('quest:bard-the-opera-stage')), firstStage: 'farewell',
    stages: [
      {
        id: 'farewell', journal: 'Rosalind is waiting on the meadow road with Encore under one arm.',
        objectives: [{ id: 'rosalind', text: 'Say goodbye to Rosalind on the meadow road', talk: RV, marker: { landmark: 'landmark:lyrehaven-meadow-road' } }],
        onComplete: [{ setFlag: 'bard.rosalind_farewell', value: true }],
        next: 'stone',
      },
      {
        id: 'stone', journal: 'Halfway to the gate stands the Hum Stone, which travellers used to sing a note to for luck, and which used to sing it back.',
        objectives: [{ id: 'stone', text: 'Sing to the Hum Stone on the meadow road', interact: 'obj:bard-hum-stone', marker: { landmark: 'landmark:bard-hum-stone' } }],
        next: 'road',
      },
      {
        id: 'road', journal: 'The meadows used to hum when the wind crossed them. They are silent all the way to the gate.',
        objectives: [{ id: 'gate', text: 'Take the meadow road to the Lyre Gate', reach: 'area:song-gate', marker: { place: 'area:song-gate' } }],
        onComplete: [{ startQuest: 'quest:bard-the-lyre-gate' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:bard-the-lyre-gate', name: 'The Lyre Gate', type: 'main', region: 'area:song-gate', giver: RV,
    summary: 'The Silent Maestro stands at the Lyre Gate, conducting a choir of stolen voices, and the silence spreads from his baton in rings.',
    requires: req(done('quest:bard-curtain-call')), firstStage: 'maestro',
    stages: [
      {
        id: 'maestro', journal: 'He conducts silence. Play counter-melody to shrink it, and sing the Opera half between the movements.',
        objectives: [{ id: 'maestro', text: 'Defeat the Silent Maestro', kill: 'bx_song_5', count: 1 }],
        next: 'gate',
      },
      {
        id: 'gate', journal: 'The baton has fallen. The stolen voices are lifting off the choir like starlings. The gate is weeping black down its lilac stone.',
        objectives: [{ id: 'seal', text: 'Open the Lyre Gate with the Opera half', interact: 'obj:song-gate-seal' }],
        onComplete: [{ setFlag: 'story.gate_open', value: true }, { setFlag: 'story.act', value: 2 }, { setFlag: 'bard.act1_done', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 200, lore: ['lore:hc-realm-gates', 'lore:hc-silent-maestro'] },
  },

  // ======================= ACT I: side quests (2 per zone)
  {
    ...A1, id: 'quest:bard-the-one-note-busker', name: 'The One-Note Busker', type: 'side', region: Z1, giver: 'npc:old-tobble',
    summary: 'Old Tobble plays one note on his crumhorn all day by the fountain. It is the last note of a lullaby he is forgetting, and he would like the rest of it back.',
    requires: req(done('quest:bard-the-bell-in-the-opera')), firstStage: 'notes',
    stages: [
      {
        id: 'notes', journal: 'Tobble says the lullaby is still around the Quarter somewhere: people hum things without knowing where they had them.',
        objectives: [{ id: 'notes', text: 'Find the lost phrases of Tobble’s lullaby', interact: 'obj:lullaby-note-*', count: 3, marker: { place: Z1 } }],
        next: 'tobble',
      },
      {
        id: 'tobble', journal: 'Three phrases and his one note make a whole lullaby. A very old one.',
        objectives: [{ id: 'tobble', text: 'Play the lullaby for Old Tobble', talk: 'npc:old-tobble', marker: { landmark: 'landmark:humming-fountain' } }],
        onComplete: [{ setFlag: 'bard.tobble_lullaby', value: true }],
        next: 'score',
      },
      {
        id: 'score', journal: 'Tobble learned the lullaby from a printed sheet in the Conservatory library, long ago. He would like to know who wrote it before he forgets that too.',
        objectives: [{ id: 'score', text: 'Find the lullaby’s sheet in the Conservatory library', interact: 'obj:bard-lullaby-sheet', marker: { landmark: 'landmark:conservatory-hall' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 30, lore: ['lore:hc-tobbles-lullaby'] },
  },
  {
    ...A1, id: 'quest:bard-ticket-touts', name: 'Ticket Touts', type: 'side', region: Z1, giver: FG,
    summary: 'Two touts outside the Opera box office are selling tickets to a gala the Opera has not announced. Beadle Fothergill would like to know whose gala.',
    requires: req(done('quest:bard-the-impresario')), firstStage: 'touts',
    stages: [
      {
        id: 'touts', journal: 'The Spragg brothers work the box office steps. Lem does the talking. Lonnie does the running.',
        objectives: [{ id: 'lem', text: 'Get to the bottom of the gala tickets', when: { flag: 'bard.touts' }, marker: { landmark: 'landmark:opera-box-office' } }],
        next: 'beadle',
      },
      {
        id: 'beadle', journal: 'You know where the tickets came from.',
        objectives: [{ id: 'beadle', text: 'Report to Beadle Fothergill', talk: FG, marker: { landmark: 'landmark:opera-quarter-board' } }],
        next: 'printer',
      },
      {
        id: 'printer', journal: 'Fothergill wants the tickets traced to the press that printed them. There is only one press on the Busking Steps that does gold edges.',
        objectives: [{ id: 'printer', text: 'Look at the printer’s order book', interact: 'obj:bard-printers-book', marker: { landmark: 'landmark:busking-steps-pitch' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 50 },
  },
  {
    ...A1, id: 'quest:bard-fiddlers-versus-pipers', name: 'Fiddlers versus Pipers', type: 'side', region: Z2, giver: 'npc:rosin-kate',
    summary: 'The Busking Steps’ two gangs are at war over the last good jig in Lyrehaven. Rosin Kate of the Fiddlers wants it settled by a play-off, and she wants you to judge.',
    requires: req(done('quest:bard-the-impresario')), firstStage: 'pitch',
    stages: [
      {
        id: 'pitch', journal: 'Fiddlers on the left stair, Pipers on the right, and the jig in the middle. Somebody has brought a bucket of rotten turnips, just in case.',
        objectives: [{ id: 'playoff', text: 'Judge the play-off on the Steps', interact: 'obj:playoff-pitch', marker: { landmark: 'landmark:busking-steps-pitch' } }],
        next: 'calloway',
      },
      {
        id: 'calloway', journal: 'Halfway through, the jig turned out to be a duet. Long Calloway of the Pipers has something to say about that.',
        objectives: [{ id: 'calloway', text: 'Hear out Long Calloway', talk: 'npc:long-calloway', marker: { landmark: 'landmark:busking-steps-pitch' } }],
        next: 'kate',
      },
      {
        id: 'kate', journal: 'A duet needs two. Calloway will play the pipe half, if Rosin Kate will play the fiddle half, and Rosin Kate has not spoken to a Piper in eleven years.',
        objectives: [{ id: 'kate', text: 'Ask Rosin Kate to play the duet', talk: 'npc:rosin-kate', marker: { landmark: 'landmark:busking-steps-pitch' } }],
        onComplete: [{ setFlag: 'bard.duet', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 60 },
  },
  {
    ...A1, id: 'quest:bard-the-tune-thief', name: 'The Tune Thief', type: 'side', region: Z2, giver: 'npc:hatty-penwhistle',
    summary: 'Something is stealing tunes straight out of the buskers’ hats on the Steps. Hatty Penwhistle has lost three this week and is down to a song about turnips.',
    requires: req(done('quest:bard-the-impresario')), firstStage: 'trail',
    stages: [
      {
        id: 'trail', journal: 'Wherever the thief has been, a dropped tune is still hanging in the air, a bar or two at a time.',
        objectives: [{ id: 'tunes', text: 'Follow the trail of dropped tunes', interact: 'obj:stolen-tune-*', count: 3, marker: { place: Z2 } }],
        next: 'nest',
      },
      {
        id: 'nest', journal: 'The trail goes up the Opera’s drainpipe to the roof. Something up there is practising.',
        objectives: [{ id: 'nest', text: 'Catch the tune thief, gently', interact: 'obj:opera-roof-nest', marker: { landmark: 'landmark:grand-opera' } }],
        next: 'hatty',
      },
      {
        id: 'hatty', journal: 'A Songbird Harpy fledgling, blown in from the Fells, with Hatty’s tunes in its beak.',
        objectives: [{ id: 'hatty', text: 'Tell Hatty who took her tunes', talk: 'npc:hatty-penwhistle', marker: { landmark: 'landmark:busking-steps-pitch' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40 },
  },
  {
    ...A1, id: 'quest:bard-practice-room-nine', name: 'Practice Room Nine', type: 'side', region: Z3, giver: 'npc:florian-treble',
    summary: 'Student Florian Treble has practised the same scale in Practice Room Nine for three years, and the room has gone so quiet it no longer echoes.',
    requires: req(done('quest:bard-the-impresario')), firstStage: 'room',
    stages: [
      {
        id: 'room', journal: 'Florian plays. Nothing comes back. Not off the walls, not off the ceiling, not off the very hard chair.',
        objectives: [{ id: 'pipe', text: 'Find where the sound is going', interact: 'obj:practice-room-pipe', marker: { landmark: 'landmark:practice-room-nine' } }],
        next: 'florian',
      },
      {
        id: 'florian', journal: 'Behind the panelling, one of the Grand Organ’s pipes, drinking every note he plays.',
        objectives: [{ id: 'florian', text: 'Tell Florian about the pipe', talk: 'npc:florian-treble', marker: { landmark: 'landmark:practice-room-nine' } }],
        onComplete: [{ setFlag: 'bard.pipe_clue', value: true }],
        next: 'hall',
      },
      {
        id: 'hall', journal: 'Florian has never once heard himself play. The Conservatory Hall is empty tonight, and its echo is the best in Lyrehaven after the Opera’s.',
        objectives: [{ id: 'hall', text: 'Take Florian to play in the empty Conservatory Hall', interact: 'obj:bard-hall-echo', marker: { landmark: 'landmark:conservatory-hall' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40 },
  },
  {
    ...A1, id: 'quest:bard-the-great-metronome', name: 'The Great Metronome', type: 'side', region: Z3, giver: 'npc:porter-crotchet',
    summary: 'The Conservatory’s great metronome stopped on the night of the Hollowing and has not ticked since. Porter Crotchet has wound it every morning for thirty years anyway.',
    requires: req(done('quest:bard-the-impresario')), firstStage: 'wind',
    stages: [
      {
        id: 'wind', journal: 'A brass pendulum taller than a house, and a dial marked from Grave to Prestissimo. Something is missing from the middle.',
        objectives: [{ id: 'metronome', text: 'Restart the great metronome', interact: 'obj:great-metronome', marker: { landmark: 'landmark:great-metronome' } }],
        next: 'porter',
      },
      {
        id: 'porter', journal: 'It ticked, once, while the Opera half sang. Then it stopped again.',
        objectives: [{ id: 'porter', text: 'Tell Porter Crotchet', talk: 'npc:porter-crotchet', marker: { landmark: 'landmark:great-metronome' } }],
        next: 'fork',
      },
      {
        id: 'fork', journal: 'Crotchet says the metronome was set every year from a tuning fork kept in the Conservatory belfry, struck once from the Song Stone at every Turning.',
        objectives: [{ id: 'fork', text: 'Find the old tuning fork in the belfry', interact: 'obj:bard-belfry-fork', marker: { place: Z3 } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-great-metronome'] },
  },
  {
    ...A1, id: 'quest:bard-old-mister-murmur', name: 'Old Mister Murmur', type: 'side', region: Z4, giver: 'npc:mister-murmur',
    summary: 'The Opera’s prompter still whispers every line of every opera to an empty stage. He has lost the last page of the last act, and he cannot stop until he finds it.',
    requires: req(done('quest:bard-the-songbook-act')), firstStage: 'page',
    stages: [
      {
        id: 'page', journal: 'The last page of The Lighthouse Keeper’s Daughter, somewhere in the cellars.',
        objectives: [{ id: 'page', text: 'Find Mister Murmur’s lost page', interact: 'obj:murmur-lost-page', marker: { place: Z4 } }],
        next: 'murmur',
      },
      {
        id: 'murmur', journal: 'Water-stained and chewed by something with very small teeth, but every word is there.',
        objectives: [{ id: 'murmur', text: 'Give Mister Murmur his page', talk: 'npc:mister-murmur', marker: { landmark: 'landmark:prompt-box' } }],
        onComplete: [{ setFlag: 'bard.murmur_clue', value: true }],
        next: 'door',
      },
      {
        id: 'door', journal: 'Murmur says the lilac gentleman goes down past the prompt-box after midnight with a basket, and comes up without it. Watch the cellar door at night.',
        objectives: [{ id: 'door', text: 'Watch the cellar door past the prompt-box, at night', when: { flag: 'bard.cellar_watched' }, marker: { landmark: 'landmark:prompt-box' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40 },
  },
  {
    ...A1, id: 'quest:bard-wisps-in-the-wings', name: 'Wisps in the Wings', type: 'side', region: Z4, giver: 'npc:dame-gusset',
    summary: 'Siren Wisps are nesting in the Opera’s old costume store, and they have started wearing the dresses. Dame Gusset of the Wardrobe will not have it.',
    requires: req(done('quest:bard-the-songbook-act')), firstStage: 'wisps',
    stages: [
      {
        id: 'wisps', journal: 'Four wisps in the costume store, one of them in the Moon Queen’s second-best gown.',
        objectives: [{ id: 'wisps', text: 'Evict the wisps from the costume store', kill: 'bx_song_0', count: 4, marker: { landmark: 'landmark:costume-store' } }],
        next: 'gusset',
      },
      {
        id: 'gusset', journal: 'The gowns are on their hangers. One of them is slightly singed.',
        objectives: [{ id: 'gusset', text: 'Report to Dame Gusset', talk: 'npc:dame-gusset', marker: { landmark: 'landmark:costume-store' } }],
        next: 'wig',
      },
      {
        id: 'wig', journal: 'Four wisps out, but a fifth got away wearing the Drowned Queen’s wig, and Dame Gusset wants the wig back first and the wisp second. It was last seen in the Opera gardens.',
        objectives: [{ id: 'wig', text: 'Get the Drowned Queen’s wig back from the last wisp', interact: 'obj:bard-wig-wisp', marker: { landmark: 'landmark:opera-gardens' } }],
        onComplete: [{ setFlag: 'bard.wig_back', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'a_song_cloth_hands' }] },
  },

  // ======================= ACT I: mentor thread (2) and bounties (2)
  {
    ...A1, id: 'quest:bard-resting-the-voice', name: 'Resting the Voice', type: 'side', region: Z1, giver: RV,
    summary: 'Rosalind says she stopped singing seven years ago to rest her voice. Seven years is a long rest. She has asked you to tidy her dressing room, which is not what she has asked at all.',
    requires: req({ trust: RV, value: 'friendly' }, done('quest:bard-the-five-bars')), firstStage: 'room',
    stages: [
      {
        id: 'room', journal: 'Honey jars, a hundred of them, all full. A bundle of letters tied with a ribbon, all opened.',
        objectives: [{ id: 'letters', text: 'Tidy Rosalind’s dressing room', interact: 'obj:rosalind-letters', marker: ROOM }],
        next: 'rosalind',
      },
      {
        id: 'rosalind', journal: 'The letters are from her old dresser. One of them is an aria, written out from memory.',
        objectives: [{ id: 'rosalind', text: 'Ask Rosalind about the letters', talk: RV, marker: ROOM }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, skillPoints: 1 },
  },
  {
    ...A1, id: 'quest:bard-the-understudy', name: 'The Understudy', type: 'side', region: Z2, giver: RV,
    summary: 'Rosalind had an understudy for eleven years who was never once let on stage. Perdita Brisk sells hot chestnuts on the Busking Steps now, and Rosalind has not spoken to her since.',
    requires: req({ trust: RV, value: 'trusted' }, done('quest:bard-the-impresario')), firstStage: 'perdita',
    stages: [
      {
        id: 'perdita', journal: 'A chestnut brazier on the Steps, and a woman beside it singing under her breath, very well.',
        objectives: [{ id: 'perdita', text: 'Find Perdita Brisk on the Busking Steps', talk: 'npc:perdita-brisk', marker: { landmark: 'landmark:chestnut-brazier' } }],
        next: 'rosalind',
      },
      {
        id: 'rosalind', journal: 'Perdita will come to the Opera, if Rosalind asks her herself.',
        objectives: [{ id: 'rosalind', text: 'Bring Rosalind and Perdita together', talk: RV, marker: ROOM }],
        onComplete: [{ setFlag: 'bard.rosalind_devotable', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:bard-bounty-cellar-wisps', name: 'Bounty: the Cellar Wisps', type: 'bounty', region: Z4, giver: FG,
    summary: 'Siren Wisps are coming up out of the Prompter’s Cellars and singing the Opera Quarter to sleep in the middle of the afternoon.',
    requires: req(done('quest:bard-the-songbook-act')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'They hum, and you forget what you were doing. Do not let them hum.', objectives: [{ id: 'wisps', text: 'Defeat the Cellar Wisps', kill: 'bx_song_0', count: 6, marker: { place: Z4 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 150 },
  },
  {
    ...A1, id: 'quest:bard-bounty-bellflower-beds', name: 'Bounty: the Bellflower Beds', type: 'bounty', region: Z1, giver: FG,
    summary: 'The Bellflowers in the Opera gardens have started ringing all night, and the whole Quarter is complaining in writing.',
    requires: req(done('quest:bard-the-bell-in-the-opera')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'Five beds, five ringleaders. Mind the crescendo.', objectives: [{ id: 'flowers', text: 'Silence the ringing Bellflowers', kill: 'bx_song_2', count: 5, marker: { landmark: 'landmark:opera-gardens' } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 120 },
  },

  // ======================= ACT II: the class thread (C-1 … C-6) + featured bearers
  // depth pass (wave 2): dusk at the Shore Chapel, Eulalie to the old Abbey landing, telling her, Marchetti’s desk,
  // the playbill in the Willow’s Hollow, and an answer sung home
  {
    ...A2, id: 'quest:bard-abbeyshore', name: 'Abbeyshore', type: 'class', region: 'vil:shore', giver: 'npc:wil',
    summary: 'Somewhere in Concordia there are Song-folk who were stranded here when the arches shut. The Gilded Goose was the Song school’s inn in the Concord’s day, and Wil Crane keeps its book.',
    requires: req(done('quest:cc-through-the-arch')), autoStart: true, firstStage: 'goose',
    stages: [
      {
        id: 'goose', journal: 'Every Song-folk traveller in Concordia used to sign the book at the Gilded Goose. Wil Crane will know where the rest of them went.',
        objectives: [{ id: 'wil', text: 'Ask Wil Crane about the Song-folk', talk: 'npc:wil', marker: { landmark: 'landmark:brind-gilded-goose' } }],
        next: 'chapel',
      },
      {
        id: 'chapel', journal: 'The Song exiles sing to the drowned choir every dusk, so it will not be lonely. Find them at the Shore Chapel.',
        objectives: [{ id: 'eulalie', text: 'Find the Song exiles at the Shore Chapel', talk: 'npc:eulalie-marchbank', marker: { landmark: 'landmark:shore-chapel' } }],
        next: 'dusk',
      },
      {
        id: 'dusk', journal: 'The exiles gather on the Shore Chapel steps to sing to the lake. Eulalie has kept you a place, and a hymn-book with half its pages stuck together.',
        objectives: [{ id: 'dusk', text: 'Sing with the exiles on the Shore Chapel steps', interact: 'obj:bard-chapel-steps', marker: { landmark: 'landmark:shore-chapel' } }],
        onComplete: [{ startQuest: 'quest:bard-under-the-lake' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-song-exiles'] },
  },
  {
    ...A2, id: 'quest:bard-under-the-lake', name: 'Under the Lake', type: 'class', region: 'region:abbey', giver: 'npc:eulalie-marchbank',
    summary: 'The Song school’s Sentinel is the drowned choir under the Abbey lake, and the Abbess who holds them there. Tamsin the ferrywoman knows the way over the nave.',
    requires: req(done('quest:bard-abbeyshore')), firstStage: 'escort',
    stages: [
      {
        id: 'escort', journal: 'Eulalie wants to sing from the old Abbey landing, down among the reeds, close enough for the choir to hear her properly. She has not been to the water’s edge in thirty years, and the reeds are full of things gone hollow. Keep her alive.',
        onEnter: [{ escort: 'npc:eulalie-marchbank', to: 'landmark:bard-abbey-landing' }],
        objectives: [{ id: 'eulalie', text: 'Bring Precentor Eulalie safely to the old Abbey landing', when: { any: [{ flag: 'escort.eulalie-marchbank', op: '==', value: 'arrived' }, { flag: 'escort.eulalie-marchbank', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:bard-abbey-landing' } }],
        next: [{ when: { flag: 'escort.eulalie-marchbank', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'hear' }],
      },
      {
        id: 'regroup', journal: 'Eulalie went down in the reeds, and the exiles carried her back up to the Chapel, scolding. She has put on her second-best shawl and is ready to try again.',
        onEnter: [{ escort: 'npc:eulalie-marchbank', to: 'landmark:bard-abbey-landing' }],
        objectives: [{ id: 'eulalie', text: 'Try again: bring Eulalie to the old Abbey landing', when: { any: [{ flag: 'escort.eulalie-marchbank', op: '==', value: 'arrived' }, { flag: 'escort.eulalie-marchbank', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:bard-abbey-landing' } }],
        next: [{ when: { flag: 'escort.eulalie-marchbank', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'hear' }],
      },
      {
        id: 'hear', journal: 'Eulalie is standing on the last dry board of the old Abbey landing, with the reeds singing round her ankles.',
        objectives: [{ id: 'eulalie', text: 'Hear what Eulalie sings to the choir', talk: 'npc:eulalie-marchbank', marker: { landmark: 'landmark:bard-abbey-landing' } }],
        next: 'tamsin',
      },
      {
        id: 'tamsin', journal: 'Tamsin poles across the drowned nave for a copper and a story. You will need a good one.',
        objectives: [{ id: 'tamsin', text: 'Ask Tamsin to ferry you over the nave', talk: 'npc:tamsin', marker: { landmark: 'landmark:shore-ferry-house' } }],
        next: 'down',
      },
      {
        id: 'down', journal: 'The pale shapes in the reeds are singing back. Down through the flooded cloister to the Abbess.',
        objectives: [{ id: 'abbey', text: 'Go down into the Drowned Abbey', reach: 'inst:drowned-abbey', marker: { region: 'region:abbey' } }],
        onComplete: [{ startQuest: 'quest:bard-abbess-morwen' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-drowned-choir'] },
  },
  {
    ...A2, id: 'quest:bard-abbess-morwen', name: 'Abbess Morwen', type: 'class', region: 'region:abbey', giver: 'npc:eulalie-marchbank',
    summary: 'Abbess Morwen drowned holding the Turning Bell’s rope, and her choir drowned singing round her. They are the Sentinel of the Song school, and they have not stopped.',
    requires: req(done('quest:bard-under-the-lake')), firstStage: 'fight',
    stages: [
      {
        id: 'fight', journal: 'The Abbess and her drowned choir are the Song school’s Sentinel. Win their mark.',
        objectives: [{ id: 'morwen', text: 'Defeat Abbess Morwen', kill: 'bx_morwen', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-morwen' }],
        next: 'release',
      },
      {
        id: 'release', journal: 'The water in the nave went still, and the Abbess spoke to you.',
        objectives: [{ id: 'mark', text: 'Hear Abbess Morwen out', when: { flag: 'story.sentinel.song' } }],
        next: 'stalls',
      },
      {
        id: 'stalls', journal: 'The drowned choir has gone back to its stalls. Somebody should say goodbye properly.',
        objectives: [{ id: 'stalls', text: 'Go to the drowned choir stalls', interact: 'obj:drowned-choir-stalls', marker: { region: 'region:abbey' } }],
        next: 'tell',
      },
      {
        id: 'tell', journal: 'The reeds stopped singing at dusk, for the first time in thirty years. Up at the Shore Chapel the exiles stood on the steps with their mouths open and nothing to answer. Eulalie should hear why from you.',
        objectives: [{ id: 'eulalie', text: 'Tell Eulalie the choir has closed its hymn-books', talk: 'npc:eulalie-marchbank', marker: { landmark: 'landmark:shore-chapel' } }],
        onComplete: [{ startQuest: 'quest:bard-the-last-movement' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-song-sentinel'] },
  },
  {
    ...A2, id: 'quest:bard-the-last-movement', name: 'The Last Movement', type: 'class', region: 'region:gloam', giver: 'npc:wystan-penhallow',
    summary: 'A copyist has turned up at Hollis Lodge with ink to the elbows and a story about a man in a lilac coat. Marchetti is in Concordia, and he is composing.',
    requires: req(done('quest:bard-abbess-morwen')), firstStage: 'wystan',
    stages: [
      {
        id: 'wystan', journal: 'Wystan Nibworth copied scores for the Impresario until last week. He is hiding in the kennels at Hollis Lodge.',
        objectives: [{ id: 'wystan', text: 'Find the copyist at Hollis Lodge', talk: 'npc:wystan-penhallow', marker: { landmark: 'landmark:lodge-kennels' } }],
        next: 'horns',
      },
      {
        id: 'horns', journal: 'Brass listening-horns, set in a ring round Stag’s Rest, recording the Weeping Willow for the last movement of his perfect song.',
        objectives: [{ id: 'horns', text: 'Find Marchetti’s listening-horns at Stag’s Rest', interact: 'obj:marchetti-horn-*', count: 3, marker: { landmark: 'landmark:gloam-stags-rest' } }],
        next: 'desk',
      },
      {
        id: 'desk', journal: 'Speaking-tubes run from the three horns off into the trees, all to one place, where somebody sits and listens. Follow them.',
        objectives: [{ id: 'desk', text: 'Follow the speaking-tubes to where Marchetti listens', interact: 'obj:bard-marchetti-desk', marker: { landmark: 'landmark:gloam-stags-rest' } }],
        onComplete: [{ setFlag: 'bard.marchetti_trail', value: true }, { startQuest: 'quest:bard-the-weeping-willow' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:bard-the-weeping-willow', name: 'The Weeping Willow', type: 'class', region: 'region:gloam', giver: 'npc:wystan-penhallow',
    summary: 'The Weeping Willow was planted at the founding of the Concord, and Marchetti has been feeding its weeping into his score. The Verdant bearers cannot win its mark while it weeps.',
    requires: req(done('quest:bard-the-last-movement')), firstStage: 'hollow',
    stages: [
      {
        id: 'hollow', journal: 'The Willow’s Hollow, under the oldest branches at Stag’s Rest.',
        objectives: [{ id: 'lair', text: 'Go down into the Willow’s Hollow', reach: 'inst:sentinel-verdant', marker: { landmark: 'landmark:gloam-stags-rest' } }],
        next: 'willow',
      },
      {
        id: 'willow', journal: 'The Weeping Willow is the Sentinel of the Verdant school. Free it, and the Ranger bearer can claim Verdant’s mark.',
        objectives: [{ id: 'willow', text: 'Free the Weeping Willow', kill: 'bx_willow', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-verdant' }, { setFlag: 'story.bearer.ranger', value: true }],
        next: 'playbill',
      },
      {
        id: 'playbill', journal: 'The Willow is quiet. Under its roots, where Marchetti’s last horn stood, something printed is nailed to the bark.',
        objectives: [{ id: 'playbill', text: 'See what Marchetti left nailed to the Willow', interact: 'obj:bard-willow-playbill' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-bard-willow'] },
  },
  {
    ...A2, id: 'quest:bard-a-letter-sung', name: 'A Letter, Sung', type: 'class', region: 'vil:brind', giver: RV,
    summary: 'Something has come through the Song arch with a letter for you, and Wil Crane says a letter from Lyrehaven ought to be sung, not read.',
    requires: req(done('quest:bard-the-weeping-willow'), done('quest:cc-stone-court')), autoStart: true, firstStage: 'arch',
    stages: [
      {
        id: 'arch', journal: 'A letter from Lyrehaven is waiting at the foot of the Song arch in the Gate Circle.',
        objectives: [{ id: 'letter', text: 'Collect your letter at the Song arch', interact: 'obj:song-arch-letter', marker: { landmark: 'landmark:gate-circle' } }],
        next: 'wil',
      },
      {
        id: 'wil', journal: 'Rosalind’s handwriting, with stage directions in the margins. Wil Crane has offered to sing it.',
        objectives: [{ id: 'wil', text: 'Have Wil sing the letter at the Gilded Goose', talk: 'npc:wil', marker: { landmark: 'landmark:brind-gilded-goose' } }],
        next: 'duet',
      },
      {
        id: 'duet', journal: 'The Skald bearer’s half and yours have been humming at each other across the Stone Court for days. Try a duet.',
        objectives: [{ id: 'duet', text: 'Sing with the Skald bearer at the Stone Court', interact: 'obj:song-court-duet', marker: { landmark: 'landmark:stone-court' } }],
        next: 'reply',
      },
      {
        id: 'reply', journal: 'Whatever brought Rosalind’s letter is still sitting on the Song arch, and it is not going home without an answer. A letter from Lyrehaven is answered in kind.',
        objectives: [{ id: 'reply', text: 'Send Rosalind an answer from the Song arch', interact: 'obj:bard-arch-reply', marker: { landmark: 'landmark:gate-circle' } }],
        onComplete: [{ setFlag: 'story.act2_ready', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:bard-root-and-refrain', name: 'Root and Refrain', type: 'side', region: 'region:gloam', giver: 'npc:bearer-hedgewitch',
    summary: 'The Hedgewitch bearer wants the Weeping Willow to go on growing even while it weeps. She says a tree that old needs a song slow enough to hear.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'stone',
    stages: [
      {
        id: 'stone', journal: 'There is a singing-stone among the Willow’s roots at Stag’s Rest. A song for a tree has to be slow. Very slow.',
        objectives: [{ id: 'stone', text: 'Sing a song slow enough for a tree at Stag’s Rest', interact: 'obj:willow-refrain-stone', marker: { landmark: 'landmark:gloam-stags-rest' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Bryony Fernwick is waiting at the Stone Court to hear how it went.',
        // co-op: if a party member plays the Hedgewitch, they ARE this bearer (the NPC is hidden)
        objectives: [{ id: 'bryony', text: 'Tell the Hedgewitch bearer', when: { any: [{ flag: 'bard.bryony_thanked' }, { partyHasClass: 'hedgewitch' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.hedgewitch', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A2, id: 'quest:bard-song-for-a-missing-shadow', name: 'Song for a Missing Shadow', type: 'side', region: 'region:gloam', giver: 'npc:bearer-shade',
    summary: 'The Shade bearer’s shadow walked off into the Gloamwood on the night of the Bell. Shadows follow light, they say. Nobody has ever tried a tune.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'patch',
    stages: [
      {
        id: 'patch', journal: 'An empty patch of ground in the Gloamwood where nothing casts a shadow, not even the trees. Sing to it.',
        objectives: [{ id: 'patch', text: 'Sing to the empty patch in the Gloamwood', interact: 'obj:gloam-empty-patch', marker: { landmark: 'landmark:gloam-empty-patch' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Something dark and shy followed your tune out of the trees. Vesper wants a word at the Stone Court.',
        objectives: [{ id: 'vesper', text: 'Talk to the Shade bearer', when: { any: [{ flag: 'bard.vesper_thanked' }, { partyHasClass: 'shade' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.shade', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  // ======================= ACT III: class quests (III-4 + 3 side)
  {
    ...A3, id: 'quest:bard-the-last-performance', name: 'The Last Performance', type: 'class', region: 'region:heart', giver: 'npc:casimir',
    summary: 'At the top of the Twelve Stairs a beast stitched from every school is playing a perfect song with no ending. It wears a lilac coat across its back, and its tail is a baton.',
    requires: req(done('quest:heart-stairs')), autoStart: true, firstStage: 'herald',
    stages: [
      { id: 'herald', journal: 'Marchetti has been bound into the Union Chimera as its heart, and he is conducting from inside it. The song has no last bar.', objectives: [{ id: 'herald', text: 'Face the Last Performance', kill: 'cb_the-last-performance', count: 1, marker: { landmark: 'landmark:twelve-stairs-top' } }], onComplete: [{ openDialogue: 'dialogue:bard-herald-fate' }], next: 'fate' },
      { id: 'fate', journal: 'The Chimera has yielded on the stair, and still the song plays on. Marchetti is waiting for his cue.', objectives: [{ id: 'fate', text: 'Decide Marchetti’s fate', when: { flag: 'bard.nemesis_fate' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 3 },
  },
  {
    ...A3, id: 'quest:bard-rosalinds-aria', name: 'Rosalind’s Aria', type: 'side', region: 'region:heart', giver: RV,
    summary: 'Something small has come all the way across Morvane to the Heart camp with a parcel from Lyrehaven, addressed in purple ink.',
    requires: req(done('quest:heart-legion')), autoStart: true, firstStage: 'parcel',
    stages: [
      { id: 'parcel', journal: 'A parcel from Rosalind is waiting at the Heart camp. It is the size and shape of a sheaf of music.', objectives: [{ id: 'parcel', text: 'Collect Rosalind’s parcel at the Heart camp', interact: 'obj:bard-aria-letter', marker: { landmark: 'landmark:heart-camp' } }], next: 'read' },
      {
        id: 'read', journal: 'A song you may sing only once has to be learned in silence. Find somewhere in the Heart quiet enough to read Clemency’s pages through without humming.',
        objectives: [{ id: 'read', text: 'Read the aria through in the quiet of the surgeons’ tent', interact: 'obj:bard-aria-quiet', marker: { landmark: 'landmark:heart-camp' } }],
        next: 'sing',
      },
      { id: 'sing', journal: 'Her last aria, in Clemency’s hand. Sing it once, at the head of the Song stair, and never again.', objectives: [{ id: 'sing', text: 'Sing Rosalind’s aria at the head of the Song stair', interact: 'obj:bard-aria-stair', marker: { landmark: 'landmark:twelve-stairs-top' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A3, id: 'quest:bard-the-bought-songs', name: 'The Bought Songs', type: 'side', region: 'region:heart', giver: RV,
    summary: 'Marchetti burned the original of every song he bought. Some of the buskers who sold them followed his lilac coat all the way into the Heart, and they are standing in the Legion, humming.',
    requires: req(done('quest:heart-legion')), autoStart: true, firstStage: 'buskers',
    stages: [
      { id: 'buskers', journal: 'Three Lyrehaven buskers in the Legion’s ranks, each humming one song with no words in it: the last copy of a song that was sold and burned.', objectives: [{ id: 'songs', text: 'Give the hollow buskers their songs back', interact: 'obj:bard-bought-song-*', count: 3, marker: { landmark: 'landmark:legion-camp' } }], next: 'receipts' },
      {
        id: 'receipts', journal: 'The buskers have their songs again, and will not sing them. Marchetti gave a receipt for every song he bought, and a receipt, Crumley says, is a receipt. His receipt-book is somewhere in the Legion’s baggage.',
        objectives: [{ id: 'book', text: 'Find Marchetti’s receipt-book in the Legion’s baggage', interact: 'obj:bard-receipt-book', marker: { landmark: 'landmark:legion-camp' } }],
        next: 'fire',
      },
      {
        id: 'fire', journal: 'The buskers have walked over to the Heart camp fire, where it is warm, and are standing round it with their instruments, waiting for somebody to start.',
        objectives: [{ id: 'fire', text: 'Strike up with the buskers at the Heart camp fire', interact: 'obj:bard-buskers-fire', marker: { landmark: 'landmark:heart-camp' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A3, id: 'quest:bard-tobbles-lullaby', name: 'Tobble’s Lullaby', type: 'side', region: 'region:heart', giver: 'npc:old-tobble',
    summary: 'Old Tobble has walked from Lyrehaven to the edge of the Heart with his crumhorn, and he says he has worked out whose lullaby it was.',
    requires: req(done('quest:heart-legion'), done('quest:bard-the-one-note-busker')), autoStart: true, firstStage: 'tobble',
    stages: [
      { id: 'tobble', journal: 'Old Tobble is at the Heart camp, resting his knees and playing his one note at the Citadel.', objectives: [{ id: 'tobble', text: 'Talk to Old Tobble at the Heart camp', talk: 'npc:old-tobble', marker: { landmark: 'landmark:heart-camp' } }], next: 'legion' },
      {
        id: 'legion', journal: 'Tobble wants it tried first on the Legion: “Hollow things want filling, and nobody ever sang to that lot either.” Play the lullaby along their ranks.',
        objectives: [{ id: 'legion', text: 'Play the lullaby along the Legion’s ranks', interact: 'obj:bard-lullaby-legion', marker: { landmark: 'landmark:legion-camp' } }],
        next: 'play',
      },
      { id: 'play', journal: 'The lullaby was written for an Unsung baby in the Citadel. From the top of the Twelve Stairs you can see its doors.', objectives: [{ id: 'play', text: 'Play the lullaby towards the throne hall', interact: 'obj:bard-lullaby-stair', marker: { landmark: 'landmark:twelve-stairs-top' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2 },
  },
];

export default quests;
