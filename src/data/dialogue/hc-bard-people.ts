/**
 * Hollow Crown, BARD: Lyrehaven people (general talk), the eight side quests, the mentor thread and the
 * bounties, plus the Act II class-thread scenes, Brindlecross hooks and featured-bearer scenes. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const offer = (q: Q, text: string, to: string, extra?: NarrativeCondition): DialogueChoice =>
  ({ text, to, quest: true, when: extra ? { all: [fresh(q), extra] } : fresh(q), effects: [{ startQuest: q }] });
const bye: DialogueChoice = { text: 'Farewell.', to: null, tag: 'leave' };
const RV = 'npc:rosalind-vell' as const, FG = 'npc:beadle-fothergill' as const;

/** a dropped phrase or tune somewhere in Lyrehaven (object scenes with one quest stage) */
const found = (id: string, name: string, q: Q, s: string, text: string, plain: string): DialogueDef => ({
  id: `dialogue:obj-${id}`, name,
  entries: [{ when: stage(q, s), node: 'find' }, { node: 'plain' }],
  nodes: { find: { speaker: 'narrator', text, next: null }, plain: { speaker: 'narrator', text: plain, next: null } },
});

const dialogues: DialogueDef[] = [
  // ---------- Rosalind (general + mentor thread)
  {
    id: 'dialogue:bard-rosalind', name: 'Rosalind (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: RV, text: 'Darling. Sit. Not there, that is Encore’s chair. Not there either, that is where I keep the reviews.',
        choices: [
          offer('quest:bard-resting-the-voice', 'Could I help you tidy up in here?', 'tidy', { trust: RV, value: 'friendly' }),
          offer('quest:bard-the-understudy', 'Who is the woman in the old programmes, beside your name?', 'understudy', { all: [{ trust: RV, value: 'trusted' }, { questCompleted: 'quest:bard-the-impresario' }] }),
          { text: 'What was the Opera like, before?', to: 'before' },
          { text: 'What was your very first night like, Signora?', to: 'first', when: { all: [{ questCompleted: 'quest:bard-the-understudy' }, { questCompleted: 'quest:bard-resting-the-voice' }] } },
          bye,
        ],
      },
      first: { speaker: RV, text: 'My first night? I was eleven, darling, a page in the Moon Queen’s train, and in the first act I trod on her hem and she fell into the orchestra pit.', next: 'pit' },
      pit: {
        speaker: RV, mood: 'happy', text: 'She came up out of the pit covered in second violin and sang the whole aria at me, standing over me. I decided on the spot that I would be her one day, purely out of spite.',
        choices: [
          { text: 'And were you?', to: 'were' },
          { text: 'What became of her?', to: 'her' },
        ],
      },
      were: { speaker: RV, text: 'For twenty-two years. I never once fell in the pit. I pushed three tenors in. It is not the same.', next: 'start' },
      her: { speaker: RV, mood: 'sad', text: 'She taught me every note I know, and she never forgave me for the hem. When she died she left me her crown, the paste one. I wore it on my last night. I could not tell you where it is now.', next: 'start' },
      tidy: { speaker: RV, text: 'Tidy? In here? Oh, very well. Mind the honey jars, there are rather a lot of them. And the letters. Do not read the letters. Well. You may read the letters.', next: null },
      understudy: { speaker: RV, mood: 'sad', text: 'Perdita Brisk. My understudy. Eleven years in the wings and I never once fell ill, not even on purpose. She sells chestnuts on the Steps now. I have not had the courage to buy one.', next: null },
      before: { speaker: RV, text: 'Loud, darling. Gloriously loud. Four thousand people hissing the villain and weeping at the tenor and throwing oranges at the critics. The silence is the hardest part. I was never any good at silence.', next: 'start' },
    },
  },
  {
    id: 'dialogue:obj-rosalind-letters', name: 'Mentor: Rosalind’s letters', scope: 'party',
    entries: [{ when: stage('quest:bard-resting-the-voice', 'room'), node: 'letters' }, { node: 'jars' }],
    nodes: {
      letters: { speaker: 'narrator', text: 'A hundred jars of honey, every one of them full and labelled FOR THE VOICE. A bundle of letters tied with a ribbon, all from someone called Clemency, her old dresser. The top letter is not a letter. It is an aria, written out note by note from memory.', next: null },
      jars: { speaker: 'narrator', text: 'Honey jars, dusted and in rows. Rosalind’s dressing room has never looked so tidy, or so unlike itself.', next: null },
    },
  },
  {
    id: 'dialogue:bard-rosalind-resting', name: 'Mentor: Resting the Voice', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: RV, text: 'You read them. Of course you did, I told you not to. Very well. Sit down. No, there. Encore, move.',
        choices: [{ text: 'You didn’t stop singing, did you?', to: 'truth' }, { text: 'Who is Clemency?', to: 'marjory' }],
      },
      marjory: { speaker: RV, text: 'My dresser, for twenty years. She sewed me into every costume and out again. She has a voice like a gate in the wind and a memory like a vault. She lives in the Fells now, with her sister.', next: 'truth' },
      truth: { speaker: RV, mood: 'sad', text: 'Seven years ago the Maestro conducted his last night here, and at the final bar he turned his baton on the stage and took my voice. Just took it, like a coat from a hook. I have been too proud to say so. Resting the voice. Ha.', next: 'aria' },
      aria: {
        speaker: RV, mood: 'sad', text: 'My last aria. I taught it to Clemency the week before, for a joke, so she could sing it at me in the corridor. It is the only reason it still exists. She writes it out for me every winter, so I will not forget how it went.',
        choices: [
          { text: 'Then songs aren’t lost by being sung. They’re lost when nobody new learns them.', to: 'learn', insight: 'songs_passed_on', trust: 1 },
          { text: 'I’m sorry, Signora.', to: 'sorry' },
        ],
      },
      learn: { speaker: RV, mood: 'happy', text: '(She looks at you for a long moment.) Well. That is the cleverest thing anyone has said in this room since 1019, and I said most of it. Remember it, darling. Say it somewhere loud.', next: null },
      sorry: { speaker: RV, text: 'Do not be sorry. Be magnificent. It is far more useful.', next: null },
    },
  },
  {
    id: 'dialogue:bard-rosalind-understudy', name: 'Mentor: The Understudy', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'Perdita Brisk stands in the dressing-room doorway with a paper bag of chestnuts, still warm, and does not come in. Rosalind stands up so fast that Encore falls off the chair.', next: 'rosa' },
      rosa: { speaker: RV, mood: 'sad', text: 'Perdita. Eleven years. I never once let you on. I told myself it was for the company. It was not. It was because you were better than me on a Tuesday, and I knew it.', next: 'perd' },
      perd: { speaker: 'npc:perdita-brisk', text: 'Only on a Tuesday. (She holds out the bag.) I brought chestnuts. I didn’t know what else you bring.', next: 'end' },
      end: { speaker: RV, mood: 'happy', text: 'You bring chestnuts. Sit down, sit down. When the Opera opens again, darling, you are going on, and I am going to watch from the wings, and I am going to hate every glorious minute of it.', effects: [{ trust: RV, delta: 1 }], next: null },
    },
  },
  {
    id: 'dialogue:bard-encore', name: 'Encore',
    entries: [{ node: 'snuff' }],
    nodes: { snuff: { speaker: 'npc:encore', text: '(Encore smells your shoes with great seriousness, then sneezes, exactly on the beat.)', next: null } },
  },
  // ---------- the Opera Quarter: Tobble, Fothergill, the Spragg brothers
  {
    id: 'dialogue:bard-tobble', name: 'Old Tobble (the One-Note Busker)',
    entries: [{ when: stage('quest:bard-the-one-note-busker', 'tobble'), node: 'play' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:old-tobble', text: '(Parp.) That’s the last note. Of a lullaby. The rest of it went somewhere this winter and I can’t think where. I play the last note so it knows where to come back to.',
        choices: [offer('quest:bard-the-one-note-busker', 'I’ll find the rest of it for you.', 'find'), bye],
      },
      find: { speaker: 'npc:old-tobble', mood: 'happy', text: 'Would you? It’s still about. People hum things, you know, without knowing where they got them. Listen at the washing, and the watch, and anything that sleeps.', next: null },
      play: { speaker: 'narrator', text: 'You play him the three phrases, and he plays his one note at the end, and the whole lullaby sits there between you in the air by the dry fountain. Tobble’s eyes are shut.', next: 'who' },
      who: {
        speaker: 'npc:old-tobble', mood: 'sad', text: 'That’s it. That’s the one. My master had it from a singer who’d been to the Citadel, years and years back. Written for a baby there, they said. A baby who couldn’t hear a note of it.',
        choices: [
          { text: 'An Unsung baby. Somebody wrote it a lullaby anyway.', to: 'unsung', insight: 'lullaby_unsung' },
          { text: 'It’s beautiful, Tobble.', to: 'end', trust: 1 },
        ],
      },
      unsung: { speaker: 'npc:old-tobble', text: 'Anyway. Yes. That’s the bit I always liked. You sing to them anyway. Here, keep a copy in your head. I’d hate it to go missing twice.', next: 'sheet' },
      end: { speaker: 'npc:old-tobble', mood: 'happy', text: 'It is, isn’t it. (Parp.) Two notes, now. I’m going up in the world.', next: 'sheet' },
      sheet: { speaker: 'npc:old-tobble', text: 'I first learned it off a printed sheet, you know, as a boy, in the Conservatory library. The cradle songs drawer. I’d give a good deal to know whose it was, before I forget there was a sheet at all.', next: null },
    },
  },
  found('lullaby-note-1', 'One-Note Busker: the washerwoman', 'quest:bard-the-one-note-busker', 'notes',
    'A washerwoman at the Opera Quarter pump is humming as she wrings out a sheet. Seven notes, going down like someone settling into bed. She did not know she knew it. She learned it from her gran, who learned it from nobody she can remember.', 'The washerwoman is singing something about a lighthouse, very loudly.'),
  found('lullaby-note-2', 'One-Note Busker: the watchman', 'quest:bard-the-one-note-busker', 'notes',
    'The night-watchman on the Opera corner whistles the hours, and between the third hour and the fourth, without fail, he whistles a little rocking phrase. He thought it was the watch tune. It is the middle of Tobble’s lullaby.', 'The watchman whistles the hour at you, though it is not the hour.'),
  found('lullaby-note-3', 'One-Note Busker: something asleep', 'quest:bard-the-one-note-busker', 'notes',
    'Encore is asleep in a hatbox in Rosalind’s dressing room, snoring. He is snoring in tune. Four notes, over and over, rising at the end like a question. Rosalind must have sung it to him once, and he kept it.', 'Encore is asleep. He snores in B flat.'),
  {
    id: 'dialogue:bard-fothergill', name: 'Beadle Fothergill (bounties, Ticket Touts)',
    entries: [{ when: stage('quest:bard-ticket-touts', 'beadle'), node: 'report' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: FG, text: 'Bounties on the board. No busking within ten feet of the board. I don’t care how good it is.',
        choices: [
          offer('quest:bard-ticket-touts', 'Anything that needs looking into?', 'touts', { questCompleted: 'quest:bard-the-impresario' }),
          offer('quest:bard-bounty-bellflower-beds', 'The Bellflower bounty.', 'bells'),
          offer('quest:bard-bounty-cellar-wisps', 'The Cellar Wisps.', 'wisps', { questCompleted: 'quest:bard-the-songbook-act' }),
          bye,
        ],
      },
      touts: { speaker: FG, text: 'The Spragg brothers are selling gala tickets on the box office steps. There is no gala. The Opera has been shut seven years. Either they are swindlers or they know something I don’t, and I don’t care for either.', next: null },
      bells: { speaker: FG, text: 'The Bellflowers in the Opera gardens ring all night. I have had eleven complaints, two of them in verse and one set to music. Five beds. Get the loud ones.', next: null },
      wisps: { speaker: FG, text: 'Wisps out of the cellars, humming people to sleep in the street. Mrs Abernathy nodded off in the middle of a sentence and finished it on Thursday. Six of them, and you get paid.', next: null },
      report: {
        speaker: FG, text: 'Well? Swindlers or seers?',
        choices: [
          { text: 'Swindlers. They’ve gone to ground.', to: 'swindle', when: { flag: 'bard.touts', value: 'exposed' } },
          { text: 'Neither. Marchetti had the tickets printed a month before he ever came to Lyrehaven.', to: 'printed', when: { flag: 'bard.touts', value: 'printed' } },
        ],
      },
      swindle: { speaker: FG, text: 'Good. Two fewer Spraggs on my steps. There’s always another Spragg, mind. They come up through the cobbles.', next: 'press' },
      printed: { speaker: FG, mood: 'afraid', text: 'A month before he arrived. Then he knew he was going to open that Opera before he ever saw it. I don’t like a man who plans that far ahead for a party. I shall keep an eye on him. Both eyes.', next: 'press' },
      press: { speaker: FG, text: 'Either way, I want the press that printed them. There is only one press on the Busking Steps that does gold edges. Go and read its order book before somebody thinks to burn it.', next: null },
    },
  },
  {
    id: 'dialogue:bard-lem-spragg', name: 'Lem Spragg (Ticket Touts)',
    entries: [{ when: { all: [stage('quest:bard-ticket-touts', 'touts'), { not: { flag: 'bard.touts' } }] }, node: 'pitch' }, { node: 'start' }],
    nodes: {
      start: { speaker: 'npc:lem-spragg', text: 'Tickets! Seats! Seats for— oh. It’s you. Lonnie! No, Lonnie, stay. It’s fine. It’s probably fine.', next: null },
      pitch: {
        speaker: 'npc:lem-spragg', text: 'Gala tickets, best seats in the house, stalls, boxes, standing in the gods. Genuine. Look at the printing. Lovely printing. Very official.',
        choices: [
          { text: 'There is no gala. I’m fetching the Beadle.', to: 'expose', effects: [{ setFlag: 'bard.touts', value: 'exposed' }] },
          { text: 'This printer’s mark is dated a month before Marchetti came to Lyrehaven. Where did you get these?', to: 'printed', insight: 'touts_printed', when: { insight: 'marchetti_arrival' }, effects: [{ setFlag: 'bard.touts', value: 'printed' }] },
          { text: '[Song] (Sing the ticket back to him, slowly, in the style of a funeral march.)', to: 'sing', school: 'song', effects: [{ setFlag: 'bard.touts', value: 'exposed' }] },
          { text: 'I’ll think about it.', to: null },
        ],
      },
      expose: { speaker: 'npc:lem-spragg', mood: 'afraid', text: 'The Beadle? Now, there’s no call for— LONNIE, RUN. (Lonnie runs. Lem runs after him, shedding tickets.)', next: null },
      sing: { speaker: 'npc:lem-spragg', mood: 'afraid', text: '(By the second verse a small crowd has gathered and is humming along. Lem gathers his tickets, very red in the face, and leaves with what dignity a tout has.)', next: null },
      printed: { speaker: 'npc:lem-spragg', text: 'Dated? Oh. Oh, that’s… A gentleman in a lilac coat paid us in advance, through a letter. Said there’d be a gala by the end of the month and we were to sell it out. We didn’t ask. You don’t ask, with gold that good.', next: null },
    },
  },
  // ---------- the Busking Steps: Fiddlers versus Pipers, the Tune Thief, Perdita
  {
    id: 'dialogue:bard-rosin-kate', name: 'Rosin Kate (Fiddlers versus Pipers)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:rosin-kate', text: 'You’re a Bard. Good. You can judge. The Pipers say the last good jig in Lyrehaven is theirs. It’s ours. My nan fiddled it at her own wedding and then at her second one.',
        choices: [offer('quest:bard-fiddlers-versus-pipers', 'I’ll judge your play-off.', 'judge'), { text: 'Why not share it?', to: 'share' }, bye],
      },
      judge: { speaker: 'npc:rosin-kate', mood: 'happy', text: 'Middle of the Steps, noon. Bring ears. Calloway’s lot will try to win by volume. They always do.', next: null },
      share: { speaker: 'npc:rosin-kate', mood: 'angry', text: 'Share it? With people who play a sheep? Wash your mouth out with rosin.', next: 'start' },
    },
  },
  {
    id: 'dialogue:obj-playoff-pitch', name: 'Fiddlers versus Pipers: the play-off', scope: 'party',
    entries: [{ when: { all: [stage('quest:bard-fiddlers-versus-pipers', 'pitch'), { not: { flag: 'bard.jig' } }] }, node: 'play' }, { node: 'pitch' }],
    nodes: {
      pitch: { speaker: 'narrator', text: 'The middle of the Busking Steps, swept clean, with chalk lines down the middle so nobody can say whose stair is whose.', next: null },
      play: { speaker: 'narrator', text: 'The Fiddlers play the jig. The Pipers play the jig. The crowd shouts. Then, halfway through the third round, both gangs play at once by accident, and the jig turns into something else: two tunes, one under the other, fitting like hands. It was written as a duet.', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'Everyone on the Steps has stopped. Both captains are staring at you.',
        choices: [
          { text: 'The Fiddlers win.', to: 'fiddle', effects: [{ setFlag: 'bard.jig', value: 'fiddlers' }] },
          { text: 'The Pipers win.', to: 'pipe', effects: [{ setFlag: 'bard.jig', value: 'pipers' }] },
          { text: 'Nobody wins. It’s a duet. Teach each gang the other half, and it lives twice.', to: 'duet', insight: 'songs_passed_on', effects: [{ setFlag: 'bard.jig', value: 'duet' }] },
        ],
      },
      fiddle: { speaker: 'narrator', text: 'The Fiddlers carry Rosin Kate down the Steps on their shoulders. The Pipers play a lament so loud it rattles the windows of the Conservatory.', next: null },
      pipe: { speaker: 'narrator', text: 'The Pipers carry Long Calloway up the Steps, which takes some time, because he is very long. The Fiddlers retune in silence, which is how a fiddler sulks.', next: null },
      duet: { speaker: 'narrator', text: 'It takes all afternoon and two fights, but by sunset every Fiddler on the Steps can pipe the low part, badly, and every Piper can scrape the high part, worse. They play it together, and it is the best thing anyone has heard in Lyrehaven for years.', next: null },
    },
  },
  {
    id: 'dialogue:bard-calloway', name: 'Long Calloway',
    entries: [
      { when: { all: [stage('quest:bard-fiddlers-versus-pipers', 'calloway'), { flag: 'bard.jig', value: 'duet' }] }, node: 'duet' },
      { when: stage('quest:bard-fiddlers-versus-pipers', 'calloway'), node: 'won' },
      { node: 'start' },
    ],
    nodes: {
      start: { speaker: 'npc:long-calloway', text: 'Mind the drones. They bite.', next: null },
      won: { speaker: 'npc:long-calloway', text: 'A duet. A duet! My father knew. He must have known. And he let us fight over half of it for twenty years. Well, you judged it, and judged is judged. There’s a coin for your trouble.', next: 'kate' },
      duet: { speaker: 'npc:long-calloway', mood: 'happy', text: 'I have never in my life been so annoyed to be so happy. Kate plays the drone like a strangled goose. I love it. Don’t tell her. Here, for your trouble.', next: 'kate' },
      kate: { speaker: 'npc:long-calloway', text: 'Now somebody has to ask Rosin Kate to play the other half with me, properly, in public. Not me. She threw a turnip at me in C. 1031, and I have never forgiven the turnip.', next: null },
    },
  },
  {
    id: 'dialogue:bard-hatty', name: 'Hatty Penwhistle (the Tune Thief)',
    entries: [{ when: stage('quest:bard-the-tune-thief', 'hatty'), node: 'back' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:hatty-penwhistle', text: '(Singing.) Turnips, turnips, round and red… It’s all I’ve got left. Something took my three best tunes clean out of my hat. Clean out! I keep them in the band.',
        choices: [offer('quest:bard-the-tune-thief', 'I’ll find your tunes.', 'find'), bye],
      },
      find: { speaker: 'npc:hatty-penwhistle', text: 'Whatever it is, it drops bits. You can hear them hanging about the Steps, a bar here and a bar there. Follow the bits.', next: null },
      back: {
        speaker: 'npc:hatty-penwhistle', text: 'A harpy chick? Off the Fells? Singing my tunes on the Opera roof? Well, I never. Is it any good?',
        choices: [
          { text: 'It’s dreadful. It sings them all wrong.', to: 'wrong' },
          { text: 'It’s learning. It sings them better every day.', to: 'better', trust: 1 },
        ],
      },
      wrong: { speaker: 'npc:hatty-penwhistle', mood: 'happy', text: 'Wrong! Ha! Then it is my tunes. I always sang them wrong. Here, for your trouble. I’ve got two of them back in my head already, just from the telling.', next: null },
      better: { speaker: 'npc:hatty-penwhistle', mood: 'happy', text: 'Better than me? Cheek. I’ll go up and give it lessons. Here, for your trouble.', next: null },
    },
  },
  found('stolen-tune-1', 'Tune Thief: a dropped tune', 'quest:bard-the-tune-thief', 'trail',
    'Hanging in the air by a lamp-post, a bar and a half of a reel, going round and round like a moth. You catch it and keep it. There is a small grey feather on the cobbles under it.', 'A lamp-post on the Busking Steps.'),
  found('stolen-tune-2', 'Tune Thief: a dropped tune', 'quest:bard-the-tune-thief', 'trail',
    'In a window box, tangled in the geraniums: the chorus of a drinking song, a little chewed. Someone has been pecking at it.', 'A window box of geraniums, humming faintly.'),
  found('stolen-tune-3', 'Tune Thief: a dropped tune', 'quest:bard-the-tune-thief', 'trail',
    'Halfway up the Opera’s drainpipe, a love song, stuck. Above it, from the roof, the same love song, coming out of something with a beak, very loudly and slightly wrong.', 'The Opera drainpipe. It looks climbable, if you don’t look down.'),
  {
    id: 'dialogue:obj-opera-roof-nest', name: 'Tune Thief: the nest on the Opera roof', scope: 'party',
    entries: [{ when: stage('quest:bard-the-tune-thief', 'nest'), node: 'nest' }, { node: 'roof' }],
    nodes: {
      roof: { speaker: 'narrator', text: 'The Opera roof, under the dome. A nest of sheet music and stolen ribbon.', next: null },
      nest: { speaker: 'narrator', text: 'Under the great dome, in a nest woven out of programmes and hat-bands, a Songbird Harpy fledgling the size of a goose is singing Hatty’s tunes to the rooftops. It sees you, and stops, and holds out a tune to you in its beak, as if you might want it.', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'It has no black in it at all. It is only young, and a long way from the Fells.',
        choices: [
          { text: '(Take the tunes back gently, and leave it the nest.)', to: 'stay', effects: [{ setFlag: 'bard.fledgling', value: 'nested' }] },
          { text: '(Take the tunes, and shoo it home towards the Fells.)', to: 'home', effects: [{ setFlag: 'bard.fledgling', value: 'home' }] },
          { text: '[Song] (Sing it one of your own, so it has something to keep.)', to: 'stay', school: 'song', effects: [{ setFlag: 'bard.fledgling', value: 'nested' }] },
        ],
      },
      stay: { speaker: 'narrator', text: 'It gives up the tunes without a fuss and settles down in the nest, humming. The Opera has a lodger.', next: null },
      home: { speaker: 'narrator', text: 'It gives up the tunes, looks at you reproachfully, and flaps off north over the silent meadows towards the Fells, singing the turnip song.', next: null },
    },
  },
  {
    id: 'dialogue:bard-perdita', name: 'Perdita Brisk (the Understudy)',
    entries: [{ when: stage('quest:bard-the-understudy', 'perdita'), node: 'ask' }, { node: 'start' }],
    nodes: {
      start: { speaker: 'npc:perdita-brisk', text: 'Hot chestnuts! Hot— (she sings the rest of the call, and three people turn round to look). Sorry. Habit. Two for a copper.', next: null },
      ask: {
        speaker: 'npc:perdita-brisk', text: 'Rosalind sent you? Rosalind Vell? Sent you to me? (She puts the tongs down.) I was her understudy for eleven years. I knew every note of the Daughter. She never had so much as a cold.',
        choices: [
          { text: 'She wants to see you. She hasn’t had the nerve to ask.', to: 'nerve' },
          { text: '[Song] (Hum the Daughter’s first aria. See if she joins in.)', to: 'hum', school: 'song' },
        ],
      },
      hum: { speaker: 'npc:perdita-brisk', mood: 'happy', text: '(She joins in on the second bar, without meaning to, and does not stop until the end. People on the Steps applaud. She goes pink.) Oh, all right.', next: 'nerve' },
      nerve: { speaker: 'npc:perdita-brisk', text: 'Rosalind Vell, without nerve. I’d like to see that. I’ll come. But she has to ask me herself. I’ll bring chestnuts. I don’t know what else you bring.', next: null },
    },
  },
  // ---------- the Conservatory: Quaver, Hush, Practice Room Nine, the Great Metronome
  {
    id: 'dialogue:bard-quaver', name: 'Rector Quaver (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:isadora-quaver', text: 'A song that is not written down is a rumour. Can I help you? Quickly, please. I have four thousand rumours to catalogue.',
        choices: [{ text: 'How many songs has Lyrehaven lost?', to: 'lost' }, bye],
      },
      lost: { speaker: 'npc:isadora-quaver', mood: 'sad', text: 'Since the Hollowing? Some eleven hundred that we know of. The ones we do not know of are the ones that worry me. You cannot catalogue a hole.', next: null },
    },
  },
  {
    id: 'dialogue:bard-verity', name: 'Verity Hush (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:verity-hush', text: '(She plays you a chord on her stringless lute. It is very beautiful. There is nothing to hear.)',
        choices: [{ text: 'Why play a lute with no strings?', to: 'why' }, bye],
      },
      why: { speaker: 'npc:verity-hush', text: 'So that it never plays a wrong note. And so that you have to listen harder than you ever have. Most people find they have been talking the whole time.', next: null },
    },
  },
  {
    id: 'dialogue:bard-florian', name: 'Florian Treble (Practice Room Nine)',
    entries: [{ when: stage('quest:bard-practice-room-nine', 'florian'), node: 'tell' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:florian-treble', text: 'C, D, E, F… three years. Three years I have practised this scale in this room, and the room has never once said it back. Rooms are meant to say it back.',
        choices: [offer('quest:bard-practice-room-nine', 'Let me listen.', 'listen'), bye],
      },
      listen: { speaker: 'npc:florian-treble', text: 'Go on. Clap. Nothing. Not off the walls, not off the ceiling, not off the very hard chair. I am not stuck. I am thorough. But I would like to know.', next: null },
      tell: {
        speaker: 'npc:florian-treble', mood: 'afraid', text: 'A pipe? Behind the panelling? One of the Grand Organ’s? It has been drinking my scale for three years? I gave that organ three years of C major and it never even said thank you.',
        choices: [{ text: 'You can stop practising now.', to: 'stop', trust: 1 }, { text: 'Change key. Give it indigestion.', to: 'key' }],
      },
      stop: { speaker: 'npc:florian-treble', mood: 'happy', text: 'Stop? I could… stop. I could learn a second scale. Here, take this, it’s all the shards I had for strings.', next: 'echo' },
      key: { speaker: 'npc:florian-treble', mood: 'happy', text: 'F sharp minor. All day. Let it choke. Here, take this, it’s all the shards I had for strings.', next: 'echo' },
      echo: { speaker: 'npc:florian-treble', mood: 'sad', text: 'Only… I have never actually heard myself play. Not once, in three years, in this building. Is there anywhere here that answers? Would you take me?', next: null },
    },
  },
  {
    id: 'dialogue:obj-practice-room-pipe', name: 'Practice Room Nine: the pipe',
    entries: [{ when: stage('quest:bard-practice-room-nine', 'room'), node: 'find' }, { node: 'pipe' }],
    nodes: {
      find: { speaker: 'narrator', text: 'You tap along the panelling until one panel answers hollow. Behind it, a pipe as thick as a tree, cold to the touch, and when Florian plays a note in the room the pipe trembles and the note simply goes into it, like water down a drain.', next: null },
      pipe: { speaker: 'narrator', text: 'The panel is back in place. Behind it the pipe is still drinking, but now it has to drink F sharp minor.', next: null },
    },
  },
  {
    id: 'dialogue:bard-crotchet', name: 'Porter Crotchet (the Great Metronome)',
    entries: [{ when: stage('quest:bard-the-great-metronome', 'porter'), node: 'tick' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:porter-crotchet', text: 'Thirty years I’ve wound her. Every morning, the key and the crank and the sixty turns, and not one tick. Time keeps itself, young one. Tempo needs a porter.',
        choices: [offer('quest:bard-the-great-metronome', 'Let me try to start it.', 'try'), bye],
      },
      try: { speaker: 'npc:porter-crotchet', text: 'Be my guest. She stopped the night the crown broke, dead on the downbeat. Every metronome in Lyrehaven takes its time from her, and none of them have been right since.', next: null },
      tick: {
        speaker: 'npc:porter-crotchet', text: 'She ticked? She ticked! Once? When the thing in your chest sang? Well, bless me. Then it was never the spring.',
        choices: [{ text: 'She was kept in time by the Song Stone.', to: 'stone', insight: 'metronome_stone' }],
      },
      stone: { speaker: 'npc:porter-crotchet', mood: 'happy', text: 'By the stone itself. Of course. Thirty years I’ve been winding the wrong thing. I shan’t stop, mind. A porter winds. But I’ll wind her cheerful now.', next: 'fork' },
      fork: { speaker: 'npc:porter-crotchet', text: 'There’s a fork, you know. A great brass tuning fork up in the belfry. They struck it from the stone every Turning and set her by it. Nobody’s climbed up there since. My knees certainly haven’t.', next: null },
    },
  },
  {
    id: 'dialogue:obj-great-metronome', name: 'The Great Metronome', scope: 'party',
    entries: [{ when: stage('quest:bard-the-great-metronome', 'wind'), node: 'wind' }, { node: 'still' }],
    nodes: {
      still: { speaker: 'narrator', text: 'The great metronome of the Conservatory, its brass pendulum taller than a house, standing dead still on the downbeat.', next: null },
      wind: { speaker: 'narrator', text: 'You set the weight in the middle of the dial and push the pendulum. It does not move. Then the half-stone’s note rises in your chest without being asked, and the pendulum swings, once, and ticks, and the sound of it runs through every room in the Conservatory.', next: 'stop' },
      stop: { speaker: 'narrator', text: 'Then the note fades, and the pendulum stops again, dead on the downbeat, as if it were waiting for the rest of something.', next: null },
    },
  },
  // ---------- the Prompter's Cellars: Murmur, the costume store, bounties
  {
    id: 'dialogue:bard-murmur', name: 'Old Mister Murmur',
    entries: [{ when: stage('quest:bard-old-mister-murmur', 'murmur'), node: 'page' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:mister-murmur', text: '(Whispering.) “…and the keeper turns, and sees her standing in the light…” and then, and then… I have lost the last page. Fifty years I have prompted that opera and I have lost the last page.',
        choices: [offer('quest:bard-old-mister-murmur', '(Whispering.) I’ll find it for you.', 'find'), bye],
      },
      find: { speaker: 'npc:mister-murmur', text: '(Whispering.) Bless you. Somewhere in the cellars. The rats like paper. The rats like opera, very much. They have no taste.', next: null },
      page: {
        speaker: 'npc:mister-murmur', mood: 'happy', text: '(Whispering.) “…and the light goes out, and she sings in the dark, and the ship comes home.” Oh. Oh, that’s it. Thank you. I can stop now. I can stop for a little while.',
        choices: [
          { text: 'Has anyone else been down here?', to: 'night' },
          { text: '(Whispering.) Rest, Mister Murmur.', to: 'rest', trust: 1 },
        ],
      },
      rest: { speaker: 'npc:mister-murmur', text: '(Whispering.) One more thing, since you ask nothing. The lilac gentleman. He comes past my box at night.', next: 'night' },
      night: {
        speaker: 'npc:mister-murmur', text: '(Whispering.) Every night, the lilac gentleman, with a candle and a great fat score, down under the stage. He hums a song once, very carefully. Then I smell burning paper, and he never hums it again.',
        choices: [
          { text: 'He learns each song once, then burns it.', to: 'ash', insight: 'marchetti_ash' },
          { text: 'Thank you.', to: 'watch' },
        ],
      },
      ash: { speaker: 'npc:mister-murmur', mood: 'afraid', text: '(Whispering.) There is ash in my box. I thought it was the old ash. It is new ash. A great deal of new ash.', next: 'watch' },
      watch: { speaker: 'npc:mister-murmur', text: '(Whispering.) Watch the cellar door behind my box, after midnight. Keep very still. Then you will know where the songs go.', next: null },
    },
  },
  found('murmur-lost-page', 'Old Mister Murmur: the lost page', 'quest:bard-old-mister-murmur', 'page',
    'In a nest of shredded programmes behind a flat painted to look like the sea, the last page of The Lighthouse Keeper’s Daughter. A family of rats has been living on the overture. They have left the ending.', 'A rats’ nest of old programmes. The rats are watching you, with opinions.'),
  {
    id: 'dialogue:bard-gusset', name: 'Dame Gusset (Wisps in the Wings)',
    entries: [{ when: stage('quest:bard-wisps-in-the-wings', 'gusset'), node: 'done' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:dame-gusset', text: '(Through forty pins.) Wisps. In my Wardrobe. In my gowns. One of them is in the Moon Queen. Do you know how long it took to bead the Moon Queen?',
        choices: [offer('quest:bard-wisps-in-the-wings', 'I’ll get them out.', 'out'), bye],
      },
      out: { speaker: 'npc:dame-gusset', mood: 'angry', text: 'Gently with the silk. Firmly with the wisps. If any of them is wearing the Drowned Queen’s wig, I want the wig back first and the wisp second.', next: null },
      done: {
        speaker: 'npc:dame-gusset', text: 'Out? All four? And the Moon Queen is only singed at the hem? (She spits out the pins, all at once, into a cushion.) I could kiss you. I shan’t. Have a pair of gloves. They were the tenor’s.',
        choices: [{ text: 'Thank you, Dame Gusset.', to: 'wig', trust: 1 }, { text: 'Did the tenor need them back?', to: 'tenor' }],
      },
      tenor: { speaker: 'npc:dame-gusset', text: 'The tenor ran off to Tidecourt with a juggler in C. 1029. He can whistle for them.', next: 'wig' },
      wig: { speaker: 'npc:dame-gusset', mood: 'afraid', text: '(She counts the hangers again, and goes pale.) And the Drowned Queen’s wig is gone. There was a fifth one. Somebody saw a wig floating through the Opera gardens last night. Wig first. Wisp second.', next: null },
    },
  },

  // ======================= ACT II
  {
    id: 'dialogue:bard-eulalie', name: 'C-1 the Song exiles at the Shore Chapel', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:eulalie-marchbank', mood: 'happy', text: 'Lyrehaven? You came from Lyrehaven? Is the Opera still standing? Is the tenor still terrible? Sit, sit. We sing at dusk. We have sung at dusk every day for thirty years, so the choir under the lake will not be lonely.', next: 'songs' },
      songs: {
        speaker: 'npc:eulalie-marchbank', text: 'Our songs are thirty years out of date, of course. Still in tune, though. A song keeps, if you keep singing it.',
        choices: [
          { text: 'I’ve brought the Abbey hymns. The Conservatory kept the scores.', to: 'scores', when: { flag: 'bard.songbook', value: 'sealed' }, effects: [{ setFlag: 'bard.hymn_scores', value: true }] },
          { text: 'Lyrehaven sang every song once and let them go.', to: 'discord', when: { flag: 'bard.songbook', value: 'lastnight' } },
          { text: 'I’ve brought new songs. Lyrehaven gives them away now.', to: 'new', when: { flag: 'bard.songbook', value: 'taught' }, effects: [{ setFlag: 'bard.new_songs', value: true }] },
          { text: 'Where is the Song school’s Sentinel?', to: 'sentinel', quest: true },
        ],
      },
      scores: { speaker: 'npc:eulalie-marchbank', mood: 'happy', text: 'The Abbey hymns! The real ones, with all the verses! We have been singing the drowned choir half their own hymns for thirty years, and they have been too polite to say. Oh, read them to her. The Abbess will know every word.', next: 'sentinel' },
      discord: { speaker: 'npc:eulalie-marchbank', text: 'Did it, now. (From the back pew, three old Discord exiles in grey look up and nod at you, very slowly.) They will want to teach you something, then. A rest. The longest rest in any hymn. It stops a choir in its tracks.', effects: [{ setFlag: 'bard.morwen_rest', value: true }], next: 'sentinel' },
      new: { speaker: 'npc:eulalie-marchbank', mood: 'happy', text: 'New songs. Thirty years and nothing new, and now you walk in with your pockets full. Teach us one. Teach us two. We will sing them to the lake tonight and see if the choir likes them.', next: 'sentinel' },
      sentinel: { speaker: 'npc:eulalie-marchbank', text: 'Our Sentinel is the choir itself, and the Abbess who holds them. When the Bell would not stop ringing she held the rope, and the lake came up, and they sang till the water closed. Stay for dusk and sing with us on the steps. Then we will talk about the lake.', next: null },
    },
  },
  {
    id: 'dialogue:hook-bard-tamsin', name: 'Hook: Tamsin ferries the Bard',
    entries: [{ when: stage('quest:bard-under-the-lake', 'tamsin'), node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:tamsin', text: 'Over the nave? At night, with the shapes singing? One copper and a story, and the story had better be very good.',
        choices: [
          { text: 'An impresario tried to play one song forever, and I improvised him off the stage.', to: 'gala' },
          { text: '[Song] (Sing her the Lighthouse Keeper’s Daughter, all four acts, abridged.)', to: 'sung', school: 'song', trust: 1 },
        ],
      },
      gala: { speaker: 'npc:tamsin', text: 'Improvised him off. Ha. That’s a copper’s worth. Get in. Sit in the middle. Don’t trail your hand.', next: 'over' },
      sung: { speaker: 'npc:tamsin', mood: 'happy', text: 'All four acts on one breath. The fish came up to listen. Keep your copper. Get in.', next: 'over' },
      over: { speaker: 'narrator', text: 'Out over the drowned nave, the pale shapes rise in the reeds and sing back to you, a hymn you nearly know. Under the boat, far down, a bell-tower stands in green water, and a door at its foot is open.', next: null },
    },
  },
  {
    id: 'dialogue:bard-wystan', name: 'C-4 the copyist at Hollis Lodge', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:wystan-penhallow', mood: 'afraid', text: 'You know him. I can see it on you. Blaise Marchetti. I copied for him for three weeks. Look at my hands. It doesn’t come off. His ink never comes off.',
        choices: [{ text: 'Where is he?', to: 'where' }, { text: 'What is he writing?', to: 'what' }],
      },
      what: { speaker: 'npc:wystan-penhallow', text: 'The last movement. Of a song that never ends, he says, which is a contradiction, and I told him so, and he laughed and paid me double. He wants the end to be weeping. Adagio. No double bar.', next: 'where' },
      where: { speaker: 'npc:wystan-penhallow', mood: 'afraid', text: 'Stag’s Rest, under the old willow, recording it weep with brass horns. And there are men in black armour with him now, from the Heart. They measure him. Arms, legs, the width of his back. Like a tailor would.', next: 'end' },
      end: { speaker: 'npc:wystan-penhallow', text: 'He is so kind to them. He thanks them for every measurement. Go and see. I am staying here with the dogs.', next: null },
    },
  },
  {
    id: 'dialogue:bard-wystan-general', name: 'Wystan Nibworth (general)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:wystan-penhallow', text: 'The dogs here are very kind. Kinder than composers. They do not mind the ink.', next: null } },
  },
  found('marchetti-horn-1', 'C-4 a listening-horn', 'quest:bard-the-last-movement', 'horns',
    'A great brass horn on a tripod, its bell turned towards the Weeping Willow. Inside it, faintly, the sound of weeping goes round and round, caught.', 'A brass listening-horn, pointed at the willow.'),
  found('marchetti-horn-2', 'C-4 a listening-horn', 'quest:bard-the-last-movement', 'horns',
    'A second horn, and tied to its stand with lilac ribbon, a note: Last movement. Weeping, adagio, no ending. Thank the gentlemen from the Legion for their patience.', 'A brass listening-horn. The lilac ribbon has gone grey.'),
  found('marchetti-horn-3', 'C-4 a listening-horn', 'quest:bard-the-last-movement', 'horns',
    'The third horn is still warm, as if someone was listening at it a moment ago. On the moss beside it, a tailor’s chalk outline the shape of a man, and something much larger drawn round it.', 'A brass listening-horn on a tripod, cold now.'),
  {
    id: 'dialogue:obj-song-arch-letter', name: 'C-6 the letter at the Song arch', scope: 'party',
    entries: [
      { when: { all: [stage('quest:bard-a-letter-sung', 'arch'), { flag: 'bard.encore_pet' }] }, node: 'encore' },
      { when: stage('quest:bard-a-letter-sung', 'arch'), node: 'bird' },
      { node: 'arch' },
    ],
    nodes: {
      encore: { speaker: 'narrator', text: 'Encore is sitting at the foot of the Song arch with an envelope in his mouth, looking smug. You did not see him go back through. He smells of the dressing room, honey and greasepaint.', next: 'take' },
      bird: { speaker: 'narrator', text: 'A Conservatory songbird is perched on the Song arch with an envelope tied to its leg, singing the address at you, over and over, in Rosalind’s exact tone of voice.', next: 'take' },
      take: {
        speaker: 'narrator', text: 'The envelope says, in purple ink: TO BE SUNG, NOT READ.',
        choices: [{ text: '(Take it to Wil Crane.)', to: null, quest: true, effects: [{ setFlag: 'bard.rosalind_letter', value: true }] }],
      },
      arch: { speaker: 'narrator', text: 'The Song arch, lilac stone, humming when the wind crosses it.', next: null },
    },
  },
  {
    id: 'dialogue:hook-bard-wil', name: 'Hook: Wil and the Bard (C-1 the Goose’s book, C-6 Rosalind’s letter)', scope: 'party',
    entries: [
      { when: stage('quest:bard-abbeyshore', 'goose'), node: 'book' },
      { when: stage('quest:bard-a-letter-sung', 'wil'), node: 'start' },
    ],
    nodes: {
      book: {
        speaker: 'npc:wil', mood: 'happy', text: 'A Bard! Out of Lyrehaven! Sit down, sit down. The Goose was the Song school’s inn, you know, in the Concord’s day. Every singer who came for a Turning signed this book. (She thumps a book the size of a gravestone onto the bar.)',
        choices: [
          { text: 'Where are they now, the Song-folk who were stranded here?', to: 'shore', quest: true },
          { text: 'Is Rosalind Vell in it?', to: 'rosa' },
        ],
      },
      rosa: { speaker: 'npc:wil', text: 'Rosalind Vell, aged eleven, C. 1000, in very large letters, with a drawing of herself. Aldous says she sang the Bell’s descant so high the gulls stopped. I believe it. Look at the size of that signature.', next: 'shore' },
      shore: { speaker: 'npc:wil', text: 'The ones who were here when the arches shut went down to Abbeyshore, to be near the Abbey. Precentor Marchbank sings them all to the lake every dusk from the Shore Chapel. Go and sing with them. Tell her Wil says the Goose still keeps their room.', next: null },
      start: { speaker: 'npc:wil', mood: 'happy', text: 'To be sung, not read? Oh, I like her. Give it here. Quiet, all of you, there’s a letter from Lyrehaven. (The whole Goose goes quiet. Wil clears her throat, and sings.)', next: 'letter' },
      letter: { speaker: RV, text: '“Darling. The Opera is open. Not for a gala, for rehearsals, which is better. Perdita is impossible. The meadows hum again, a little, when the wind is right. Do not let them make you sing anything you do not mean.”', next: 'end' },
      end: {
        speaker: 'npc:wil', text: 'And there’s a bit at the bottom, underlined twice. “I sang it to the pug first. My voice came home.” (She puts the letter down.) Well. I’ll need a minute before I do the stew.',
        choices: [
          { text: 'Her voice came home when the Maestro fell.', to: 'voice' },
          { text: 'Thank you, Wil.', to: null, quest: true },
        ],
      },
      voice: { speaker: 'npc:wil', mood: 'sad', text: 'One bright voice, straight over the meadows to the Opera. You saw it go. Then she’s singing, and you did that. Go and find your Skald. Something’s humming at the Stone Court and it isn’t me.', next: null },
    },
  },
  // ---------- featured bearers (hooks on the bearer NPCs)
  {
    id: 'dialogue:bard-featured-hedgewitch', name: 'Featured: Root and Refrain', scope: 'party',
    entries: [
      { when: stage('quest:bard-root-and-refrain', 'back'), node: 'back' },
      { when: { all: [stage('quest:bard-root-and-refrain', 'stone'), { not: { flag: 'bard.bryony_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-hedgewitch', text: 'You’re the singer. The Willow at Stag’s Rest is my Sentinel, and it’s weeping, and everyone wants to fight it. I want it to keep growing while it weeps. Trees grow slowly. Have you got a song slow enough for a tree?',
        choices: [
          { text: 'I can write one.', to: null, quest: true, effects: [{ setFlag: 'bard.bryony_asked', value: true }] },
          { text: 'How slow is a tree?', to: 'slow' },
        ],
      },
      slow: { speaker: 'npc:bearer-hedgewitch', mood: 'happy', text: 'One note a season, Mother Yarrow says, if you want it to listen. We haven’t got that long. Try one note a breath, and breathe very deeply.', effects: [{ setFlag: 'bard.bryony_asked', value: true }], next: null },
      back: {
        speaker: 'npc:bearer-hedgewitch', mood: 'happy', text: 'There’s a green shoot on the oldest branch. A new one. The Willow heard you. When we go to the Heart, I want you beside me, and I want you to sing that again.',
        effects: [{ setFlag: 'bard.bryony_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-willow-refrain-stone', name: 'Root and Refrain: the singing-stone', scope: 'party',
    entries: [
      { when: { all: [stage('quest:bard-root-and-refrain', 'stone'), { questCompleted: 'quest:bard-the-weeping-willow' }] }, node: 'freed' },
      { when: stage('quest:bard-root-and-refrain', 'stone'), node: 'weeping' },
      { node: 'stone' },
    ],
    nodes: {
      stone: { speaker: 'narrator', text: 'A flat grey stone among the Willow’s roots, worn smooth in the middle where someone used to sit and sing.', next: null },
      weeping: { speaker: 'narrator', text: 'You sit on the stone among the weeping roots and sing one note a breath, slower than you have ever sung anything. Black tears go on falling round you. But under them, very slowly, the oldest branch lifts a little towards the sound.', next: null },
      freed: { speaker: 'narrator', text: 'The Willow is quiet now, released, its tears dried to grey streaks on the bark. You sit on the stone and sing it one note a breath, and a bud on the oldest branch opens while you watch, as if it had been waiting for permission.', next: null },
    },
  },
  {
    id: 'dialogue:bard-featured-shade', name: 'Featured: Song for a Missing Shadow', scope: 'party',
    entries: [
      { when: stage('quest:bard-song-for-a-missing-shadow', 'back'), node: 'back' },
      { when: { all: [stage('quest:bard-song-for-a-missing-shadow', 'patch'), { not: { flag: 'bard.vesper_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-shade', text: 'Don’t look at my feet. Everyone looks at my feet. My shadow walked off the night the Bell rang, into the Gloamwood, and it won’t come when I call. It never liked my voice. Maybe it would like yours.',
        choices: [
          { text: 'I’ll sing it home.', to: null, quest: true, effects: [{ setFlag: 'bard.vesper_asked', value: true }] },
          { text: 'What kind of tune does a shadow like?', to: 'tune' },
        ],
      },
      tune: { speaker: 'npc:bearer-shade', text: 'Something low. Something that sounds like evening. Grey Mab used to say shadows follow light, but they stay for a good tune.', effects: [{ setFlag: 'bard.vesper_asked', value: true }], next: null },
      back: {
        speaker: 'npc:bearer-shade', mood: 'happy', text: 'Look. No, look at my feet. It’s there. It’s sulking, a bit, but it’s there. It followed your tune all the way out of the trees. Whatever is in the Heart, I’ll be standing next to you, both of us.',
        effects: [{ setFlag: 'bard.vesper_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-gloam-empty-patch', name: 'Song for a Missing Shadow: the empty patch', scope: 'party',
    entries: [{ when: stage('quest:bard-song-for-a-missing-shadow', 'patch'), node: 'sing' }, { node: 'patch' }],
    nodes: {
      patch: { speaker: 'narrator', text: 'A patch of Gloamwood moss where the trees cast shadows again, as they should.', next: null },
      sing: {
        speaker: 'narrator', text: 'A circle of moss where nothing casts a shadow, not the trees, not the ferns, not you. You stand at the edge and sing.',
        choices: [
          { text: '(Sing something low, like evening.)', to: 'low' },
          { text: '[Song] (Sing the shadow its own name, the way a lullaby does.)', to: 'name', school: 'song' },
        ],
      },
      low: { speaker: 'narrator', text: 'Halfway through the second verse, something dark and shy creeps out from under a fern and lies down along the ground towards you, listening. When you walk away, singing, it follows.', next: null },
      name: { speaker: 'narrator', text: 'You sing it the name of the bearer it belongs to, over and over, softly. At the edge of the circle a shadow stands up off the moss, all at once, like someone called in from play. When you walk away, it follows.', next: null },
    },
  },
];

export default dialogues;
