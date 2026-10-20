/**
 * Hollow Crown, BARD Act I depth pass (10-campaign-style.md §8, docs/PACING.md): the new stages' scenes,
 * investigation clues, travel banter, optional finds and the third parts of the side quests. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const NIGHT: NarrativeCondition = { hour: [21, 4] };
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const offer = (q: Q, text: string, to: string): DialogueChoice => ({ text, to, quest: true, when: fresh(q), effects: [{ startQuest: q }] });
/** a stage scene that takes over an NPC's talk must still let them give their own quests */
const more = (...offers: DialogueChoice[]): DialogueChoice[] => [...offers, { text: 'Thank you.', to: null }];
const RV = 'npc:rosalind-vell' as const, RK = 'npc:rosin-kate' as const, FT = 'npc:florian-treble' as const;
const EU = 'npc:eulalie-marchbank' as const;

/** a clue object: one scene while its stage runs (sets its flag), a plain line otherwise */
function clue(id: string, name: string, when: NarrativeCondition, text: string, flag: string, plain: string, more?: string): DialogueDef {
  return {
    id: `dialogue:obj-${id}`, name, scope: 'party',
    entries: [{ when, node: 'clue' }, { node: 'plain' }],
    nodes: {
      clue: { speaker: 'narrator', text, effects: [{ setFlag: flag, value: true }], next: more ? 'more' : null },
      ...(more ? { more: { speaker: 'narrator', text: more, next: null } } : {}),
      plain: { speaker: 'narrator', text: plain, next: null },
    },
  };
}

const dialogues: DialogueDef[] = [
  // ======================= I-1 The Bell in the Opera: backstage, the dressing room
  {
    id: 'dialogue:area-bard-backstage', name: 'I-1 banter: backstage', bark: true,
    entries: [{ when: stage('quest:bard-the-bell-in-the-opera', 'corridor'), node: 'b' }],
    nodes: { b: { speaker: RV, text: 'Left at the Moon Queen’s throne. Mind the trapdoor. Mind the other trapdoor. Encore, stop eating the scenery, it is older than you.', next: null } },
  },
  {
    id: 'dialogue:bard-rosalind-room', name: 'I-1 Rosalind’s dressing room', scope: 'party',
    entries: [{ node: 'in' }],
    nodes: {
      in: { speaker: 'narrator', text: 'Rosalind’s dressing room is a cave of costume rails and honey jars, with a chaise longue in the middle and seven years of dust on every mirror but one. That one is polished to a shine, and turned to face the wall.', next: 'sit' },
      sit: { speaker: RV, text: 'Sit, darling. Not on the pug. (Encore removes himself, offended.) Tea? There is no tea. There is honey. There is always honey. Honey is for the voice.', next: 'ask' },
      ask: {
        speaker: RV, text: 'Now. You broke into my Opera at midnight and sang a scale, and the chandelier answered you. Tell me everything, and make it dramatic.',
        choices: [
          { text: 'The note came from under the stage.', to: 'under' },
          { text: 'I only wanted to hear the echo.', to: 'echo' },
          { text: '(Sing her the note.)', to: 'sing', school: 'song' },
        ],
      },
      under: { speaker: RV, text: 'Of course it did. Everything important in this house happens under the stage: the trapdoors, the ghosts, the love affairs. Mostly the love affairs.', next: 'mirror' },
      echo: { speaker: RV, mood: 'happy', text: 'The best echo in Harmonia. I sang my first Moon Queen to it, and it sang her back so well that I was jealous of a wall.', next: 'mirror' },
      sing: { speaker: RV, text: '(You sing it. She closes her eyes, and her lips move with it, and no sound comes out at all.) Yes. Yes, that is the one. I had quite forgotten how it went.', next: 'mirror' },
      mirror: {
        speaker: 'narrator', text: 'She reaches over without looking and turns the polished mirror round. Behind it is a poster: ROSALIND VELL, THE MOON QUEEN, LAST NIGHT, C. 1035. Somebody has drawn a small, sad moon in the corner.',
        choices: [
          { text: 'Why was it the last night?', to: 'last' },
          { text: 'You still keep it polished.', to: 'polish' },
        ],
      },
      last: { speaker: RV, mood: 'sad', text: 'The Maestro conducted it. It was his last night with the baton, and mine with the… with the house. We need not speak of it, darling. Not tonight.', next: 'task' },
      polish: { speaker: RV, text: 'One must keep something polished, or one becomes a ruin with a pug.', next: 'task' },
      task: { speaker: RV, text: 'Tomorrow, a task. The Opera’s overture has been lost to the buskers of the Quarter, a bar at a time. Five of them remember a bar each. Bring me all five, and we shall hear this house wake up.', next: 'end' },
      end: { speaker: 'narrator', text: 'She gives you the chaise longue and a blanket embroidered with somebody else’s initials. Encore sleeps on your feet, snoring in B flat.', next: null },
    },
  },

  // ======================= I-2 The Five Bars: the silent fountains
  clue('bard-silent-fountain-1', 'I-2 a silent fountain (1)', stage('quest:bard-the-five-bars', 'fountains'),
    'The Humming Fountain has given up humming. Its basin is black and still, and when you lean over it your reflection opens its mouth a moment after you do, and nothing comes out.', 'bard.fountain_1',
    'A fountain basin, black and still.'),
  clue('bard-silent-fountain-2', 'I-2 a silent fountain (2)', stage('quest:bard-the-five-bars', 'fountains'),
    'A little fountain by the box office, its spout carved as a singing child. Black tears are dripping from the child’s mouth instead of water. Somebody has tied a ribbon round its neck, the way you might for a sick dog.', 'bard.fountain_2',
    'A carved fountain with a ribbon round its neck.'),
  clue('bard-silent-fountain-3', 'I-2 a silent fountain (3)', stage('quest:bard-the-five-bars', 'fountains'),
    'The oldest fountain in the Quarter, behind the Opera. Round its rim, worn almost smooth, the first five bars of the overture are carved, so the water would play them as it fell. It has not played them in seven years.', 'bard.fountain_bars',
    'The old fountain behind the Opera, its rim carved with music.', 'Somebody built the overture into the city itself, so it could never be lost. The city went quiet anyway.'),

  // ======================= I-4 The Impresario: the buskers who sold
  clue('bard-sold-busker-1', 'I-4 a busker who sold (1)', stage('quest:bard-the-impresario', 'hats'),
    'A fiddler on the Steps with a purse of gold in his lap and his fiddle across his knees. He lifts the bow, and stops. “I sold it,” he says, puzzled. “The one I always play. I can’t remember how it starts.”', 'bard.sold_1',
    'A fiddler on the Steps, playing somebody else’s tune.'),
  clue('bard-sold-busker-2', 'I-4 a busker who sold (2)', stage('quest:bard-the-impresario', 'hats'),
    'A girl with a tin whistle, crying and laughing at once. She sold her mother’s lullaby for enough rent to last a year. She is already trying to hum it, and it keeps coming out as somebody else’s.', 'bard.sold_2',
    'A girl with a tin whistle, practising something new.'),
  clue('bard-sold-busker-3', 'I-4 a busker who sold (3)', stage('quest:bard-the-impresario', 'hats'),
    'An old piper with a receipt pinned to his hat, in an elegant lilac hand: “One song, bought outright. The original to be destroyed. With gratitude, B. M.” He cannot read. He thinks it says thank you.', 'bard.receipt_seen',
    'An old piper, asleep, with a receipt in his hat.', 'Not kept: destroyed. Nobody buys a song to destroy it, unless they mean to be the only one who has it.'),

  // ======================= I-5 The Songbook Act: canvassing the Steps and the Conservatory, the night after
  {
    id: 'dialogue:bard-kate-canvass', name: 'I-5 Rosin Kate on the Act', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: RK, text: 'The Songbook Act? Write every song down and lock it in a vault? (She tightens a peg until it squeaks.) A jig in a vault is a dead jig. You can’t dance to paper.',
        choices: [
          { text: 'But it would never be lost.', to: 'lost' },
          { text: 'And the Discord’s way?', to: 'discord' },
        ],
      },
      lost: { speaker: RK, text: 'Lost? A song’s never lost while somebody’s fiddling it badly on a step. It’s lost when they stop. Locking it up is just stopping, with a key.', next: 'end' },
      discord: { speaker: RK, mood: 'sad', text: 'Sing everything once and let it go? I’ve been to wakes like that. Lovely nights. Terrible mornings.', next: 'end' },
      end: { speaker: RK, text: 'Say something loud in that Hall. They never listen to anything quiet up there.', choices: more(offer('quest:bard-fiddlers-versus-pipers', 'Why are the Fiddlers and the Pipers at war?', 'war')) },
      war: { speaker: RK, mood: 'angry', text: 'The Pipers say the last good jig in Lyrehaven is theirs. It’s ours. Judge the play-off, middle of the Steps, noon, and bring ears.', next: null },
    },
  },
  {
    id: 'dialogue:bard-florian-canvass', name: 'I-5 Florian on the Act', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: FT, text: 'The Act? (He does not stop playing his scale.) The Rector says if every song is written down, nothing can ever be lost again. I’d like that. I’d like one thing in this building to stay where I put it.',
        choices: [
          { text: 'You’d lock them all away?', to: 'lock' },
          { text: 'What would you lose?', to: 'lose' },
        ],
      },
      lock: { speaker: FT, text: 'Well. When you put it like that it sounds like a cupboard. (A pause on F.) I have spent three years in a room that never answers me. I am not sure a cupboard is worse.', next: 'end' },
      lose: { speaker: FT, mood: 'sad', text: 'Nothing. I only know one scale. (He stops.) Oh. That is rather sad, isn’t it. I hadn’t noticed until now.', next: 'end' },
      end: { speaker: FT, text: 'Speak well, please. I can’t; I go red. I shall be in the gallery, going red on your behalf.', choices: more(offer('quest:bard-practice-room-nine', 'Why does your room never answer?', 'listen')) },
      listen: { speaker: FT, text: 'Three years and the room has never once said my scale back. Rooms are meant to say it back. I am not stuck. I am thorough. But I would like to know.', next: null },
    },
  },
  {
    id: 'dialogue:obj-bard-steps-night', name: 'I-5 the Busking Steps that night', scope: 'party',
    entries: [
      { when: { all: [stage('quest:bard-the-songbook-act', 'steps'), { flag: 'bard.songbook', value: 'sealed' }] }, node: 'sealed' },
      { when: { all: [stage('quest:bard-the-songbook-act', 'steps'), { flag: 'bard.songbook', value: 'lastnight' }] }, node: 'lastnight' },
      { when: stage('quest:bard-the-songbook-act', 'steps'), node: 'taught' },
      { node: 'plain' },
    ],
    nodes: {
      sealed: { speaker: 'narrator', text: 'The Busking Steps are quiet tonight. Copyists sit on every landing with lanterns and ink, writing each tune down as the last busker plays it, and when it is written the busker stops, and packs up, and goes home.', effects: [{ setFlag: 'bard.steps_night', value: true }], next: null },
      lastnight: { speaker: 'narrator', text: 'The whole city is on the Steps tonight, singing every song once at the top of its voice, and then letting it go. By midnight the singing is thinning out. By dawn there will be nothing left to sing.', effects: [{ setFlag: 'bard.steps_night', value: true }], next: null },
      taught: { speaker: 'narrator', text: 'On every landing a busker is teaching a stranger a song, slowly, note by note: a cobbler learning a love song, a constable learning a jig. Nobody owns anything. It is the loudest night on the Steps in seven years.', effects: [{ setFlag: 'bard.steps_night', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The Busking Steps, with chalk marks where the pitches used to be.', next: null },
    },
  },

  // ======================= I-6 The Grand Organ: the breathing walls
  clue('bard-organ-wall-1', 'I-6 a breathing wall (1)', stage('quest:bard-the-grand-organ', 'walls'),
    'A cold patch on a corridor wall, the plaster cracked in a long line. Put your ear to it and you can hear the organ breathing, in and out, like something very large asleep behind the house.', 'bard.organ_wall_1',
    'A cracked corridor wall in the Conservatory.'),
  clue('bard-organ-wall-2', 'I-6 a breathing wall (2)', stage('quest:bard-the-grand-organ', 'walls'),
    'In the empty lecture theatre, a lecturer’s chalk notes still on the board from seven years ago, and from behind the panelling the faint sound of a choir, very far away, singing the same bar over and over.', 'bard.organ_wall_2',
    'An empty lecture theatre, chalk on the board.'),
  clue('bard-organ-wall-3', 'I-6 a breathing wall (3)', stage('quest:bard-the-grand-organ', 'walls'),
    'Behind the Rector’s own study the wall is warm, and when you knock on it, something knocks back: four slow raps, and four, and four, as if somebody were counting a choir in.', 'bard.organ_knock',
    'A warm wall behind the Rector’s study.', 'Somebody inside the organ is still keeping time.'),

  // ======================= I-7 Marchetti’s Masterpiece: the ash in the cellars
  clue('bard-burned-song-1', 'I-7 a burned song (1)', stage('quest:bard-marchettis-masterpiece', 'cellars'),
    'A scrap of scorched manuscript caught in a cellar grating: the first line of the fiddler’s tune from the Steps, the one he sold. The rest of it is ash.', 'bard.ash_1',
    'A cellar grating under the Opera Quarter.'),
  clue('bard-burned-song-2', 'I-7 a burned song (2)', stage('quest:bard-marchettis-masterpiece', 'cellars'),
    'A heap of fine grey ash by a candle-stub, still warm. In it, unburned, one corner of a page in a child’s hand: “Mam’s lullaby, for when I can’t sleep.”', 'bard.ash_2',
    'A candle-stub in the cellars, burned out.'),
  clue('bard-burned-song-3', 'I-7 a burned song (3)', stage('quest:bard-marchettis-masterpiece', 'cellars'),
    'A wastepaper basket by the cellar stair, stuffed with lilac ribbon. Every ribbon once tied a rolled-up song, and every one carries a neat little label: “Learned. Burned. B. M.”', 'bard.ash_seen',
    'An empty basket by the cellar stair.'),

  // ======================= I-9 Curtain Call: the Hum Stone on the meadow road
  {
    id: 'dialogue:area-bard-meadow-road', name: 'I-9 banter: the silent meadows', bark: true,
    entries: [{ when: stage('quest:bard-curtain-call', 'stone'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'The wind crosses the meadows in silence now, and the grass bends without a sound, like an audience leaning forward.', next: null } },
  },
  {
    id: 'dialogue:obj-bard-hum-stone', name: 'I-9 the Hum Stone', scope: 'party',
    entries: [{ when: stage('quest:bard-curtain-call', 'stone'), node: 'stone' }, { node: 'plain' }],
    nodes: {
      stone: {
        speaker: 'narrator', text: 'Halfway along the meadow road stands the Hum Stone, a grey menhir with a hollow worn through it at the height of a singer’s mouth. Travellers to the Turning sang one note into it for luck, and the meadows sang it back all the way to the gate.',
        choices: [
          { text: '(Sing your note into the hollow.)', to: 'sing', effects: [{ unlockLore: 'lore:hc-bard-hum-stone' }] },
          { text: '(Sing Rosalind’s note, the one she cannot.)', to: 'hers', school: 'song', effects: [{ unlockLore: 'lore:hc-bard-hum-stone' }] },
        ],
      },
      sing: { speaker: 'narrator', text: 'Your note goes into the stone and comes out of the other side changed, warmer, and for a moment the whole meadow hums it back to you, faintly, like a choir clearing its throat.', next: null },
      hers: { speaker: 'narrator', text: 'You sing the high note of the Moon Queen’s last aria. The stone takes it and carries it back down the road towards Lyrehaven, and somewhere far behind you a pug barks once, exactly on the beat.', next: null },
      plain: { speaker: 'narrator', text: 'The Hum Stone on the meadow road. If you stand very close, it hums.', next: null },
    },
  },

  // ======================= Side: the One-Note Busker (the printed sheet)
  {
    id: 'dialogue:obj-bard-lullaby-sheet', name: 'The One-Note Busker: the printed sheet', scope: 'party',
    entries: [{ when: stage('quest:bard-the-one-note-busker', 'score'), node: 'sheet' }, { node: 'plain' }],
    nodes: {
      sheet: { speaker: 'narrator', text: 'In a library drawer marked CRADLE SONGS, MISCELLANEOUS, a single printed sheet: Tobble’s lullaby, every note of it, under a title in old type: “For a Quiet Child.”', next: 'foot' },
      foot: {
        speaker: 'narrator', text: 'At the foot, the printer’s line: “Printed at Lyrehaven at the request of a singer of the Citadel, who would not give a name.” Under it, in faded ink, somebody has added by hand: “Sing it anyway.”',
        choices: [
          { text: '(Copy it out for Tobble.)', to: 'copy', effects: [{ setFlag: 'bard.lullaby_sheet', value: true }, { unlockLore: 'lore:hc-bard-quiet-child' }] },
          { text: '(Hum it once through, to fix it in your head.)', to: 'hum', school: 'song', effects: [{ setFlag: 'bard.lullaby_sheet', value: true }, { unlockLore: 'lore:hc-bard-quiet-child' }] },
        ],
      },
      copy: { speaker: 'narrator', text: 'You copy it out in your best hand. Tobble will not be able to read it, but he will be able to hold it, which for a busker is nearly the same thing.', next: null },
      hum: { speaker: 'narrator', text: 'You hum it through once, under your breath, among the shelves. A librarian three rooms away looks up, and smiles, and does not know why.', next: null },
      plain: { speaker: 'narrator', text: 'A library drawer marked CRADLE SONGS, MISCELLANEOUS.', next: null },
    },
  },

  // ======================= Side: Ticket Touts (the printer’s order book)
  {
    id: 'dialogue:obj-bard-printers-book', name: 'Ticket Touts: the printer’s order book', scope: 'party',
    entries: [{ when: stage('quest:bard-ticket-touts', 'printer'), node: 'book' }, { node: 'plain' }],
    nodes: {
      book: {
        speaker: 'narrator', text: 'The printer’s order book lies open on his counter, with the press thumping behind. Gala tickets, gold-edged, four thousand, ordered by letter, paid in advance, signed in lilac ink: B. Marchetti. The date is a full month before he ever set foot in Lyrehaven.',
        choices: [{ text: '(Copy the date down for the Beadle.)', to: 'copy', insight: 'touts_printed', effects: [{ setFlag: 'bard.tickets_traced', value: true }] }],
      },
      copy: { speaker: 'narrator', text: 'The printer, wiping his hands, says the gentleman also ordered a programme with no songs listed in it at all. Just one line, in gold: “Everything. Once.”', next: null },
      plain: { speaker: 'narrator', text: 'A printer’s shop on the Busking Steps, thumping away.', next: null },
    },
  },

  // ======================= Side: Fiddlers versus Pipers (Rosin Kate and the other half)
  {
    id: 'dialogue:bard-kate-duet', name: 'Fiddlers versus Pipers: the other half', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: RK, mood: 'angry', text: 'A duet. With Calloway. (She looks at her fiddle as if it had betrayed her.) My nan fiddled that jig at her own wedding. Who did she think was playing the other half?',
        choices: [
          { text: 'Your grandfather, maybe? Was he a Piper?', to: 'nan' },
          { text: '(Play her the low part yourself, on her own fiddle.)', to: 'play', school: 'song' },
          { text: 'It needs both of you, or it’s only half a jig.', to: 'half' },
        ],
      },
      nan: { speaker: RK, text: '(A very long pause.) …He was. He was a Piper. She never once said. Oh, the old devil.', next: 'yes' },
      play: { speaker: 'narrator', text: 'You play the low part on her fiddle, badly. She snatches it back and plays it properly, scowling, and halfway through she stops scowling.', next: 'yes' },
      half: { speaker: RK, text: 'Half a jig. (She tries the phrase on the open string.) Half a jig is a walk. Fine. Fine!', next: 'yes' },
      yes: { speaker: RK, mood: 'happy', text: 'Tell Calloway noon tomorrow, middle of the Steps, and if he makes one single sheep-noise I’ll put my bow through his bag.', next: null },
    },
  },

  // ======================= Side: Practice Room Nine (the Hall that answers)
  {
    id: 'dialogue:obj-bard-hall-echo', name: 'Practice Room Nine: the Hall that answers', scope: 'party',
    entries: [{ when: stage('quest:bard-practice-room-nine', 'hall'), node: 'hall' }, { node: 'plain' }],
    nodes: {
      hall: { speaker: 'narrator', text: 'The Conservatory Hall at night, empty, every seat folded up. Florian stands in the middle of the floor with his violin and does not move for a long time.', next: 'play' },
      play: {
        speaker: 'narrator', text: 'Then he plays his scale, C, D, E, F, all the way up, and the Hall says it back to him, every note, a heartbeat late. Florian stops and puts his hand over his mouth.',
        choices: [
          { text: 'Play it again.', to: 'again', effects: [{ setFlag: 'bard.florian_echo', value: 'scale' }] },
          { text: 'Play something else.', to: 'else', effects: [{ setFlag: 'bard.florian_echo', value: 'jig' }] },
        ],
      },
      again: { speaker: 'narrator', text: 'He plays it again, and again, laughing, and the Hall plays it back every time. He says he had forgotten that scales were music. He says it four times.', next: null },
      else: { speaker: 'narrator', text: 'He does not know anything else. So you teach him four bars of the jig from the Steps, there and then, and the Hall plays those back too, and Florian Treble is, for the first time in three years, late for bed.', next: null },
      plain: { speaker: 'narrator', text: 'The Conservatory Hall, empty, with one chair left out in the middle.', next: null },
    },
  },

  // ======================= Side: the Great Metronome (the belfry fork)
  {
    id: 'dialogue:obj-bard-belfry-fork', name: 'The Great Metronome: the belfry fork', scope: 'party',
    entries: [{ when: stage('quest:bard-the-great-metronome', 'fork'), node: 'fork' }, { node: 'plain' }],
    nodes: {
      fork: { speaker: 'narrator', text: 'In the Conservatory belfry, among the pigeons, a tuning fork as long as your arm hangs from a nail, tarnished black. The label on the nail reads: “Strike once from the Song Stone at each Turning. Set the metronome by it. Do not drop.”', next: 'strike' },
      strike: {
        speaker: 'narrator', text: 'Somebody has dropped it, twice, by the dents. When you strike it on the beam the half-stone in your chest answers, and far below the great metronome gives one slow tick, and then another, and keeps going, very slowly, like a heart.',
        choices: [
          { text: '(Leave it ticking slow.)', to: 'slow', effects: [{ setFlag: 'bard.metronome_ticking', value: 'grave' }, { unlockLore: 'lore:hc-bard-great-metronome' }] },
          { text: '(Strike it again, harder, to wind it up to tempo.)', to: 'fast', school: 'song', effects: [{ setFlag: 'bard.metronome_ticking', value: 'andante' }, { unlockLore: 'lore:hc-bard-great-metronome' }] },
        ],
      },
      slow: { speaker: 'narrator', text: 'Grave, says the dial: the slowest mark of all. It will have to do until there is a Turning to set it by.', next: null },
      fast: { speaker: 'narrator', text: 'It climbs to Andante and stops there, as if that were as fast as it is willing to go without the rest of the stone. Porter Crotchet, far below, is cheering.', next: null },
      plain: { speaker: 'narrator', text: 'A nail in the belfry, and a lot of pigeons.', next: null },
    },
  },

  // ======================= Side: Old Mister Murmur (the cellar door at night)
  {
    id: 'dialogue:obj-bard-cellar-door', name: 'Old Mister Murmur: the cellar door', scope: 'party',
    entries: [
      { when: { all: [stage('quest:bard-old-mister-murmur', 'door'), NIGHT] }, node: 'night' },
      { when: stage('quest:bard-old-mister-murmur', 'door'), node: 'day' },
      { node: 'plain' },
    ],
    nodes: {
      day: { speaker: 'narrator', text: 'The cellar door behind the prompt-box is locked. Murmur said the lilac gentleman comes after midnight.', next: null },
      night: { speaker: 'narrator', text: 'After midnight the lilac gentleman comes down the cellar stair with a candle and a basket of rolled songs tied in ribbon. He does not see you. He unlocks the door behind the prompt-box, goes through, and locks it behind him.', next: 'wait' },
      wait: {
        speaker: 'narrator', text: 'A long while later he comes back up without the basket, humming something you have never heard before and will never hear again. There is grey ash on his cuffs.',
        choices: [
          { text: '(Keep still, and let him pass.)', to: 'pass', effects: [{ setFlag: 'bard.cellar_watched', value: 'hidden' }] },
          { text: '(Hum his tune back at him from the dark, very softly.)', to: 'hum', school: 'song', effects: [{ setFlag: 'bard.cellar_watched', value: 'hummed' }] },
        ],
      },
      pass: { speaker: 'narrator', text: 'He passes within an arm’s length of you, smelling of violets and smoke, and goes up to bed.', next: null },
      hum: { speaker: 'narrator', text: 'He stops dead on the stair. For a moment he does not breathe. Then he says to the dark, very gently, “No, darling. That one is mine now,” and goes on up.', next: null },
      plain: { speaker: 'narrator', text: 'A locked door behind the prompt-box.', next: null },
    },
  },

  // ======================= Side: Wisps in the Wings (the Drowned Queen’s wig)
  {
    id: 'dialogue:obj-bard-wig-wisp', name: 'Wisps in the Wings: the Drowned Queen’s wig', scope: 'party',
    entries: [{ when: stage('quest:bard-wisps-in-the-wings', 'wig'), node: 'wig' }, { node: 'plain' }],
    nodes: {
      wig: {
        speaker: 'narrator', text: 'In the Opera gardens, among the Bellflowers, a Siren Wisp is drifting in slow circles wearing the Drowned Queen’s wig: three feet of green silk ringlets and a coronet of shells. It is admiring itself in the pond.',
        choices: [
          { text: '(Sing it the Drowned Queen’s entrance, so it curtseys.)', to: 'bow', school: 'song' },
          { text: '(Creep through the flower beds and snatch the wig.)', to: 'snatch' },
          { text: '(Tell it the wig is last season.)', to: 'season' },
        ],
      },
      bow: { speaker: 'narrator', text: 'At the first bar it sweeps into a deep, wobbling curtsey, the way the Drowned Queen does, and the wig slides off into your hands. The wisp drifts away looking enormously pleased with itself.', next: null },
      snatch: { speaker: 'narrator', text: 'You creep through the beds and grab. Every Bellflower in the garden rings the alarm at once, and the wisp shrieks and flees, leaving behind the wig and most of its dignity.', next: null },
      season: { speaker: 'narrator', text: 'The wisp stops. It looks at its reflection. It looks at you. Very slowly it takes the wig off, drops it on the grass, and drifts away in a sulk.', next: null },
      plain: { speaker: 'narrator', text: 'The Opera gardens, where the Bellflowers are ringing for no reason at all.', next: null },
    },
  },

  // ======================= Optional areas (Claude 2): finds in the Lyrehaven ruin, cave and viewpoint
  {
    id: 'dialogue:obj-song-capital-ruin-find', name: 'Lyrehaven ruin: the black ring', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'In the ruined rotunda the bandstand’s floor is still marked with chalk circles where each section of the band sat. In the conductor’s circle, burned into the boards as if by a dropped baton, is a perfect black ring, and inside it no moss will grow.', effects: [{ unlockLore: 'lore:hc-song-capital-ruin' }], next: null } },
  },
  {
    id: 'dialogue:obj-song-capital-cave-find', name: 'Lyrehaven cave: the lost songs', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'The walls of the grotto under the gardens are scratched from floor to roof with titles: every song that buskers have lost since the Hollowing, written up by the ones who still remembered the names. Some have a tune scratched under them. Most only have a name.', effects: [{ unlockLore: 'lore:hc-song-capital-cave' }], next: null } },
  },
  {
    id: 'dialogue:obj-song-capital-cave-codex', name: 'The Grotto: the last busker’s song', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'At the very back of the grotto, low down, one song has been scratched out in full, words and tune, by a careful hand, and underneath it, three times over, in letters as big as the busker could reach: LEARN THIS.', effects: [{ unlockLore: 'lore:hc-song-capital-learn' }], next: null } },
  },
  {
    id: 'dialogue:obj-song-capital-view-find', name: 'Lyrehaven viewpoint: the Dome Walk', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'From the walk round the Opera’s dome you can see the whole of Lyrehaven: the Quarter, the Steps, the Conservatory, the cellars’ chimneys, and the silent meadows beyond. A plaque on the rail reads: “From here Rosalind Vell’s top C was heard on the Fells. C. 1019. (Disputed.)”', effects: [{ unlockLore: 'lore:hc-song-capital-view' }], next: null } },
  },

  // ======================= ACT II, C-1 Abbeyshore: the road down, dusk on the Shore Chapel steps
  {
    id: 'dialogue:area-bard-shore-road', name: 'C-1 banter: the road down to Abbeyshore', bark: true,
    entries: [{ when: stage('quest:bard-abbeyshore', 'chapel'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'The road down to Abbeyshore smells of lake-weed and woodsmoke. Somewhere ahead, a little out of tune and perfectly in time, old voices are warming up.', next: null } },
  },
  {
    id: 'dialogue:obj-bard-chapel-steps', name: 'C-1 dusk on the Shore Chapel steps', scope: 'party',
    entries: [{ when: stage('quest:bard-abbeyshore', 'dusk'), node: 'steps' }, { node: 'plain' }],
    nodes: {
      steps: { speaker: 'narrator', text: 'At dusk the Song exiles come out onto the Shore Chapel steps: eleven old singers in shawls and mufflers, a hymn-book each, among them a tenor called Pellow who is, Eulalie whispers, still terrible. They face the lake, and Eulalie lifts one finger.', next: 'sing' },
      sing: { speaker: 'narrator', text: 'They sing the Turning hymn the Lyrehaven way, thirty years out of date. Out on the water the pale shapes rise in the reeds and sing the harmony back, word-perfect, and Pellow comes in a bar early, as he has every night since C. 1012.', next: 'gap' },
      gap: {
        speaker: 'narrator', text: 'Then, in the fourth verse, everyone stops for four bars. Nobody sings. The reeds wait too. Then the hymn goes on as if nothing had happened.',
        choices: [
          { text: '(Sing into the gap: the descant, the high line over the top.)', to: 'descant', effects: [{ setFlag: 'bard.chapel_descant', value: true }] },
          { text: '(Hold the silence with them.)', to: 'hold' },
          { text: '(Hum Pellow back into time, very quietly, from beside him.)', to: 'pellow', school: 'song' },
        ],
      },
      descant: { speaker: EU, mood: 'afraid', text: '(Her hand closes on your sleeve, hard, and the whole choir in the reeds falls silent at once.) Not that. Not from up here. (She lets go.) I am sorry, singer. That part is spoken for.', next: 'after' },
      hold: { speaker: 'narrator', text: 'You hold the four bars with them. Eulalie looks at you sideways and nods once, as if you had passed something she was not going to tell you about.', next: 'after' },
      pellow: { speaker: 'narrator', mood: 'happy', text: 'You hum beside Pellow, and for the first time in thirty years he comes in on the right bar, and is so astonished that he stops singing altogether. The exiles agree it is the best verse they have ever done.', next: 'after' },
      after: {
        speaker: EU, text: 'There. That is what we do, every dusk, so the choir will not be lonely. (She shuts her hymn-book.) Tomorrow I want to go down to the water. I have not been in thirty years. Will you walk with me?',
        choices: [
          { text: 'Of course I will.', to: 'end', quest: true },
          { text: 'Why now, after thirty years?', to: 'why' },
        ],
      },
      why: { speaker: EU, text: 'Because a singer from Lyrehaven walked up my steps today, and I have run out of reasons. And because the reeds are full of hollow things, and I would rather not be eaten on my own.', next: 'end' },
      end: { speaker: EU, text: 'In the morning, then, or whenever you are ready. I shall wear my good shawl. If I am to be eaten, I shall be eaten respectably.', next: null },
      plain: { speaker: 'narrator', text: 'The Shore Chapel steps, worn into dips by thirty years of the same eleven pairs of feet.', next: null },
    },
  },

  // ======================= ACT II, C-2 Under the Lake: Eulalie on the old Abbey landing (after the escort)
  {
    id: 'dialogue:bard-eulalie-landing', name: 'C-2 Eulalie sings from the old Abbey landing', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'The old Abbey landing is six boards and a mooring-post; the rest went under. Eulalie stands on the last dry board with the lake round her ankles, gets her breath back, and laughs at herself for having lost it.', next: 'cat' },
      cat: { speaker: EU, text: 'Thirty years I have sung at them from the top of the steps, like a woman calling in the cat. They deserve better than that. Stand by me. If I fall in, you are to say it was graceful.', next: 'sing' },
      sing: { speaker: 'narrator', text: 'She sings the Turning hymn alone, thin and true. All round the landing the pale shapes rise out of the reeds and join in, and at the fourth verse they stop for four bars, and wait.', next: 'gap' },
      gap: { speaker: 'narrator', text: 'Eulalie does not stop. She sings the four bars: a descant, high over nothing, cracked at the top and clear everywhere else. The reeds bend towards her like an audience leaning in.', next: 'mine' },
      mine: {
        speaker: EU, mood: 'sad', text: 'That was mine. In C. 1012 the Abbey asked Lyrehaven for a descant, as it did every Turning, and Lyrehaven sent me. I was in the ferry, halfway over, when the Bell began and would not stop.',
        choices: [
          { text: 'You never reached the Abbey.', to: 'boat' },
          { text: 'They’ve kept your place for thirty years.', to: 'place', trust: 1 },
          { text: 'That’s why you stopped me on the steps.', to: 'steps', when: { flag: 'bard.chapel_descant' } },
        ],
      },
      boat: { speaker: EU, text: 'The ferryman turned us round. I hit him with my hymn-book. He was right and I was wrong, and the water came up over the nave behind us like a curtain coming down.', next: 'kept' },
      place: { speaker: EU, text: 'Every night. Four bars of nothing, in a hymn they have sung ten thousand times. Choirs are terribly loyal, singer. It is their worst quality.', next: 'kept' },
      steps: { speaker: EU, text: 'Forgive me. It is the only part I have left that is mine, and I had not the courage to sing it from where they could hear. And you looked so very like I did.', next: 'kept' },
      kept: {
        speaker: EU, text: 'Now listen. When I sang it, the north door moved; I felt it in the boards. The choir lets the descant in. It always did. Take it down with you.',
        effects: [{ unlockLore: 'lore:hc-bard-marchbank-descant' }],
        choices: [
          { text: 'I’ll sing it at the door, if I need to.', to: 'tamsin', quest: true, effects: [{ setFlag: 'bard.descant_key', value: true }] },
          { text: '(Learn it from her now, every note, so it is not only hers.)', to: 'learn', school: 'song', effects: [{ setFlag: 'bard.descant_key', value: true }] },
        ],
      },
      learn: { speaker: 'narrator', text: 'She sings it to you three times, slowly, and you sing it back until she stops wincing. Now two of us have it, she says. That is how songs survive. It is also how they get sung wrong.', next: 'tamsin' },
      tamsin: { speaker: EU, text: 'Go to Tamsin, and give her a good story; you have one now. I shall stay here a while and finish the hymn properly. It has been waiting long enough.', next: null },
    },
  },

  // ======================= ACT II, C-3 Abbess Morwen: telling Eulalie
  {
    id: 'dialogue:bard-eulalie-morwen', name: 'C-3 Eulalie hears the choir is at rest', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: EU, text: '(She is on the Chapel steps with her hymn-book shut on one finger, and the other ten behind her in a row.) They did not answer tonight. Thirty years, and tonight the reeds were empty. Tell me plainly, singer.', next: 'tell' },
      tell: {
        speaker: EU, mood: 'sad', text: '(You tell her: the Abbess, the rope, the choir closing their hymn-books one by one.) So it is over. They have stopped waiting.',
        choices: [
          { text: 'They’re resting. You kept them company until they could.', to: 'rest', trust: 1 },
          { text: 'Your descant opened the door. They let it in, at the end.', to: 'door', when: { flag: 'bard.descant_key' } },
          { text: 'The Abbess asked if the Bell could be rung gently, once.', to: 'bell' },
        ],
      },
      rest: { speaker: EU, text: 'Company. Yes. That is all we were for, and it was enough.', next: 'after' },
      door: { speaker: EU, mood: 'happy', text: 'Did they. (She sits down on the step, rather suddenly.) Then I did sing it at the Abbey after all, thirty years late and by proxy. Lyrehaven will say that counts. Lyrehaven says anything counts.', next: 'after' },
      bell: { speaker: EU, text: 'Gently, once. Of course she did. She always said Lyrehaven rang it like a fire-bell.', next: 'after' },
      after: {
        speaker: EU, text: 'But what do we do at dusk now? (Behind her, Pellow clears his throat.) No, Pellow. Not a solo.',
        choices: [
          { text: 'Keep singing. Sing for the living, for a change.', to: 'living', effects: [{ setFlag: 'bard.exiles', value: 'stay' }] },
          { text: 'Go home. The Lyre Gate is open.', to: 'home', effects: [{ setFlag: 'bard.exiles', value: 'home' }] },
        ],
      },
      living: { speaker: EU, text: 'For the living. How strange. Abbeyshore has been very patient with us; perhaps it deserves a song it can join in with.', next: 'end' },
      home: { speaker: EU, mood: 'happy', text: 'Home. (The eleven look at each other.) The Opera, and the Steps, and somebody to tell us our songs are thirty years out of date. Oh, I should like that very much.', next: 'end' },
      end: { speaker: EU, text: 'Now, before I forget: there is a copyist hiding at Hollis Lodge with ink to the elbows, asking after a Lyrehaven singer. He seemed very frightened of something lilac.', next: null },
    },
  },

  // ======================= ACT II, C-4 The Last Movement: Marchetti’s writing-desk
  {
    id: 'dialogue:obj-bard-marchetti-desk', name: 'C-4 Marchetti’s writing-desk above Stag’s Rest', scope: 'party',
    entries: [{ when: stage('quest:bard-the-last-movement', 'desk'), node: 'desk' }, { node: 'plain' }],
    nodes: {
      desk: { speaker: 'narrator', text: 'The speaking-tubes end at a writing-desk under a lilac awning, set where all three horns can be heard at once. A cushion, a decanter, a silver pen, and over the chair a coat far too large for any man.', next: 'score' },
      score: { speaker: 'narrator', text: 'On the desk lies the last movement: weeping, adagio, page after page with no double bar. Three times on the last page he has written a rest into the final bar, and three times crossed it out, harder each time.', effects: [{ unlockLore: 'lore:hc-bard-last-movement' }], next: 'fitting' },
      fitting: {
        speaker: 'narrator', text: 'Under the score, a Legion fitting-slip in a square grey hand: Width of back, to take the coat. Length of tail, to take the baton. Heart, to be fitted last. Below it, in lilac ink: Thank you, gentlemen. Do take a biscuit.',
        choices: [
          { text: '(Take the last page.)', to: 'take', effects: [{ setFlag: 'bard.last_page', value: true }] },
          { text: '(Uncross one of the rests.)', to: 'rest', effects: [{ setFlag: 'bard.rest_restored', value: true }] },
          { text: '(Hum the last bar as he wrote it.)', to: 'hum', school: 'song' },
        ],
      },
      take: { speaker: 'narrator', text: 'You fold it into your coat. Somewhere off in the trees, a long way past the Willow, a man laughs as if he has just been told something delightful.', next: null },
      rest: { speaker: 'narrator', text: 'You draw a careful line through his crossing-out, so that the rest stands again. It looks very small on the page. It looks as if it could hold a great deal.', next: null },
      hum: { speaker: 'narrator', text: 'You hum the last bar. It does not end; it leans, like a man on a doorstep who cannot bring himself to knock. You find you have stopped humming on purpose, in the gap.', next: null },
      plain: { speaker: 'narrator', text: 'A writing-desk under a lilac awning in the trees above Stag’s Rest, with nobody at it.', next: null },
    },
  },

  // ======================= ACT II, C-5 The Weeping Willow: the playbill
  {
    id: 'dialogue:obj-bard-willow-playbill', name: 'C-5 the playbill nailed to the Willow', scope: 'party',
    entries: [{ when: stage('quest:bard-the-weeping-willow', 'playbill'), node: 'bill' }, { node: 'plain' }],
    nodes: {
      bill: { speaker: 'narrator', text: 'Nailed to the Willow’s root, where the last horn stood, a playbill, beautifully printed. THE LAST PERFORMANCE. The Twelve Stairs, the Heart of Morvane. Conducted by B. Marchetti. No interval. No ending. Admission: everything.', next: 'ticket' },
      ticket: {
        speaker: 'narrator', text: 'Pinned to the corner is a single ticket, front row, centre, made out to you by name and stamped COMPLIMENTARY. On the back, in lilac ink: “Darling, do come. You will be the only one listening.”',
        choices: [
          { text: '(Keep the ticket.)', to: 'keep', effects: [{ setFlag: 'bard.marchetti_ticket', value: 'kept' }, { unlockLore: 'lore:hc-bard-playbill' }] },
          { text: '(Tear it in half, the way an usher does, and keep the stub.)', to: 'tear', effects: [{ setFlag: 'bard.marchetti_ticket', value: 'torn' }, { unlockLore: 'lore:hc-bard-playbill' }] },
        ],
      },
      keep: { speaker: 'narrator', text: 'You put it in your coat with everything else of his. By the date on it, it was printed before you ever lifted the Opera half. He always did know the cast before the audition.', next: null },
      tear: { speaker: 'narrator', text: 'You tear it neatly, the way the ushers at the Grand Opera did. Admitted. Whatever he has written for the Twelve Stairs, it has an audience of one, and the audience has its stub.', next: null },
      plain: { speaker: 'narrator', text: 'The Willow’s roots, with a nail-hole in the bark where something was posted.', next: null },
    },
  },

  // ======================= ACT II, C-6 A Letter, Sung: the answer
  {
    id: 'dialogue:obj-bard-arch-reply', name: 'C-6 a sung answer through the Song arch', scope: 'party',
    entries: [
      { when: { all: [stage('quest:bard-a-letter-sung', 'reply'), { flag: 'bard.encore_pet' }] }, node: 'encore' },
      { when: stage('quest:bard-a-letter-sung', 'reply'), node: 'bird' },
      { node: 'plain' },
    ],
    nodes: {
      encore: { speaker: 'narrator', text: 'Encore is lying across the foot of the Song arch with his chin on his paws, with the air of a pug who has been kept waiting by better people than you. He lifts one ear.', next: 'write' },
      bird: { speaker: 'narrator', text: 'The Conservatory songbird is still on the Song arch. When you come near it sings your name at you again, in Rosalind’s voice, with a distinct note of impatience.', next: 'write' },
      write: {
        speaker: 'narrator', text: 'A letter from Lyrehaven is answered in kind: sung, not written, and carried home by ear. What do you send?',
        choices: [
          { text: '“The Willow is free and the choir is resting. Nobody has made me sing anything I don’t mean.”', to: 'sent', effects: [{ setFlag: 'bard.reply', value: 'meant' }] },
          { text: '“Tell Perdita she’s flat in the second act. She’ll know why I’m telling her.”', to: 'sent', when: { questCompleted: 'quest:bard-the-understudy' }, effects: [{ setFlag: 'bard.reply', value: 'perdita' }] },
          { text: '(Sing her the first bar of the duet from the Stone Court, and nothing else.)', to: 'sent', effects: [{ setFlag: 'bard.reply', value: 'duet' }] },
          { text: '(Sing her the overture’s five bars, all of them, in order.)', to: 'sent', school: 'song', effects: [{ setFlag: 'bard.reply', value: 'overture' }] },
        ],
      },
      sent: { speaker: 'narrator', text: 'It goes back through the Song arch the way the letter came. Somewhere on the far side, very faintly, the meadows hum it back.', next: null },
      plain: { speaker: 'narrator', text: 'The Song arch, lilac stone. Somebody has left a dish of water at the foot of it.', next: null },
    },
  },

  // ======================= ACT III, Rosalind’s Aria: reading it in silence
  {
    id: 'dialogue:obj-bard-aria-quiet', name: 'Rosalind’s Aria: the surgeons’ tent', scope: 'party',
    entries: [{ when: stage('quest:bard-rosalinds-aria', 'read'), node: 'tent' }, { node: 'plain' }],
    nodes: {
      tent: { speaker: 'narrator', text: 'The only quiet place in the Heart camp is the surgeons’ tent, where the bearers freed from the Legion lie sleeping it off. A surgeon looks at your sheaf of music and says, Not one note. You promise, and sit down on a bucket.', next: 'read' },
      read: { speaker: 'narrator', text: 'You read it through in silence: the Daughter in the dark, the lamp gone out, the ship on the rocks, her voice going out over the water. You can hear Rosalind in every bar. Then the last line.', next: 'line' },
      line: {
        speaker: 'narrator', text: 'Rosalind sang “and bring the ship home”; all Lyrehaven knows it. Clemency has written “and bring her home”. Beside it, very small: The night her voice went, I sang it this way to the dressing-room door. I never told her. C.',
        choices: [
          { text: '(Keep Rosalind’s line. It is her aria.)', to: 'rosa', effects: [{ setFlag: 'bard.aria_words', value: 'rosalind' }] },
          { text: '(Keep Clemency’s line. It was sung for Rosalind.)', to: 'clem', effects: [{ setFlag: 'bard.aria_words', value: 'clemency' }] },
        ],
      },
      rosa: { speaker: 'narrator', text: 'You pencil the line back the way it was, lightly. A ship that has been coming home for two hundred years comes home again, and that is right too.', next: 'after' },
      clem: { speaker: 'narrator', mood: 'sad', text: 'You leave it as Clemency wrote it. Seven years ago a dresser sang to a locked door until the woman behind it came out for her tea. That is what this aria has been for, all this time.', next: 'after' },
      after: { speaker: 'narrator', text: 'The surgeon looks in, sees you have not hummed a note, and nods. Up on the Twelve Stairs the Song banner is moving in a wind you cannot feel.', next: null },
      plain: { speaker: 'narrator', text: 'The surgeons’ tent at the Heart camp. Someone has chalked QUIET on the flap, and underlined it twice.', next: null },
    },
  },

  // ======================= ACT III, The Bought Songs: the receipt-book, the fire
  {
    id: 'dialogue:obj-bard-receipt-book', name: 'The Bought Songs: Marchetti’s receipt-book', scope: 'party',
    entries: [{ when: stage('quest:bard-the-bought-songs', 'receipts'), node: 'book' }, { node: 'plain' }],
    nodes: {
      book: { speaker: 'narrator', text: 'In the Legion’s baggage, between a crate of black candles and a drum of hollow iron, lies a receipt-book bound in lilac calf. Every song Marchetti bought is in it, in his lovely hand, with the price, the date and the seller’s mark.', next: 'clause' },
      clause: {
        speaker: 'narrator', text: 'At the foot of every receipt, the same small print: The seller agrees to forget the said song entirely, and hum it no more. Crumley’s mark is an X with a pint-pot drawn beside it.',
        choices: [
          { text: '(Tear out every receipt.)', to: 'tear', effects: [{ setFlag: 'bard.receipts', value: 'torn' }] },
          { text: '(Write “RETURNED, WITH THANKS” across each one, and sign it.)', to: 'returned', effects: [{ setFlag: 'bard.receipts', value: 'returned' }] },
          { text: '(Sing the small print aloud to the tune of Crumley’s drinking song.)', to: 'silly', school: 'song', effects: [{ setFlag: 'bard.receipts', value: 'sung' }] },
        ],
      },
      tear: { speaker: 'narrator', text: 'They come out cleanly, forty-one of them. You stuff them in your coat to burn at the fire, where for once they will do somebody some good.', next: 'end' },
      returned: { speaker: 'narrator', text: 'It takes a while. By the twentieth you have a lovely signature. A receipt, Crumley says, is a receipt, and one marked returned is the song’s own business again.', next: 'end' },
      silly: { speaker: 'narrator', mood: 'happy', text: 'By the third verse three Legion sentries are trying not to laugh. Small print, it turns out, does not survive being sung to a drinking tune. Nothing does.', next: 'end' },
      end: { speaker: 'narrator', text: 'The buskers have seen. They go off towards the Heart camp fire with their instruments, looking at each other, the way performers do when they have decided something.', next: null },
      plain: { speaker: 'narrator', text: 'The Legion’s baggage. A lilac ribbon marks where a receipt-book used to lie.', next: null },
    },
  },
  {
    id: 'dialogue:obj-bard-buskers-fire', name: 'The Bought Songs: the buskers at the fire', scope: 'party',
    entries: [{ when: stage('quest:bard-the-bought-songs', 'fire'), node: 'fire' }, { node: 'plain' }],
    nodes: {
      fire: {
        speaker: 'narrator', text: 'Crumley, the Ambry twins and Old Corrigan stand round the Heart camp fire with a squeezebox, a skipping rope and a ballad-sheet, waiting for somebody to give a note. Everyone in the camp is pretending not to watch.',
        choices: [
          { text: '(Give them a note, and step back.)', to: 'play' },
          { text: '(Start Crumley’s drinking song, all forty verses.)', to: 'crumley' },
          { text: '(Start the skipping song, and turn one end of the rope yourself.)', to: 'skip', school: 'song' },
        ],
      },
      play: { speaker: 'narrator', text: 'You hum an A and step back. They all start at once, three songs in three keys, and it is dreadful, and then they find each other.', next: 'corrigan' },
      crumley: { speaker: 'narrator', mood: 'happy', text: 'By the ninth verse the whole camp is singing the chorus. By the fourteenth somebody’s grandmother has been asked to leave. By the twenty-second Crumley is crying with laughter, and his tears are clear.', next: 'corrigan' },
      skip: { speaker: 'narrator', mood: 'happy', text: 'You turn one end and a Legion sentry, to everyone’s astonishment, turns the other. The Ambry twins jump in together and do not miss once, and argue afterwards about who would have.', next: 'corrigan' },
      corrigan: { speaker: 'narrator', mood: 'sad', text: 'Last of all, when the fire is low, Old Corrigan sings his wedding song once through, quietly. Nobody joins in. It is the only song in the Heart tonight that does not need anyone else.', next: 'end' },
      end: { speaker: 'narrator', text: 'In the morning the buskers are gone, up the road towards home. On the hearthstones they have left a song written out in full, words and tune, and under it, in four hands: LEARN THIS.', effects: [{ setFlag: 'bard.buskers_played', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The Heart camp fire, burned down to coals. Somebody has scratched a stave on a hearthstone.', next: null },
    },
  },

  // ======================= ACT III, Tobble’s Lullaby: the Legion first
  {
    id: 'dialogue:obj-bard-lullaby-legion', name: 'Tobble’s Lullaby: along the Legion’s ranks', scope: 'party',
    entries: [{ when: stage('quest:bard-tobbles-lullaby', 'legion'), node: 'ranks' }, { node: 'plain' }],
    nodes: {
      ranks: { speaker: 'narrator', text: 'The Legion stands in its ranks, hollow and patient, looking at nothing. You walk along the front of them playing Tobble’s lullaby: seven notes going down, the rocking phrase, four notes rising like a question.', next: 'sit' },
      sit: {
        speaker: 'narrator', text: 'Halfway along, a hollowed soldier in somebody’s old Watch coat sits down where he stands, like a tired child. Then the one beside him. By the end of the rank a whole row is sitting on the ground, heads tipped, waiting for the next verse.',
        choices: [
          { text: '(Play it again, for the ones still standing.)', to: 'again' },
          { text: '(Let them sit, and walk on.)', to: 'on' },
        ],
      },
      again: { speaker: 'narrator', mood: 'sad', text: 'You play it again, down the next rank and the next. Not all of them sit. Enough do. Nobody ever sang to any of them, you think, and they came to the King because he seemed to understand.', next: 'end' },
      on: { speaker: 'narrator', text: 'You walk on. Behind you nobody stands up again. One of them is humming the question, the four notes rising, over and over, as if he were asking it of someone.', next: 'end' },
      end: { speaker: 'narrator', text: 'Far behind you, at the camp, a crumhorn plays one note: Tobble, telling you he heard. Now the stairs.', effects: [{ setFlag: 'bard.lullaby_legion', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The Legion’s ranks. Here and there along the front, a soldier is sitting on the ground.', next: null },
    },
  },
];

export default dialogues;
