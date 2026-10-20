/** Hollow Crown, BARD Act I main dialogues (Lyrehaven). Owner: Claude 4. */
import type { DialogueDef } from '@/core';

const RV = 'npc:rosalind-vell' as const, BM = 'npc:blaise-marchetti' as const;
const IQ = 'npc:isadora-quaver' as const, VH = 'npc:verity-hush' as const;

/** I-2: the five buskers who each remember one bar of the overture */
const bar = (n: number, who: string, played: string, after: string, plain: string): DialogueDef => ({
  id: `dialogue:obj-busker-bar-${n}`, name: `I-2 the overture, bar ${n}`,
  entries: [{ when: { questStage: 'quest:bard-the-five-bars', stage: 'bars' }, node: 'play' }, { node: 'plain' }],
  nodes: {
    play: { speaker: 'narrator', text: `${who} ${played}`, next: 'after' },
    after: { speaker: 'narrator', text: after, next: null },
    plain: { speaker: 'narrator', text: plain, next: null },
  },
});

const dialogues: DialogueDef[] = [
  // ---------- I-1 The Bell in the Opera
  {
    id: 'dialogue:bard-bell-night', name: 'I-1 the Bell rings in the Grand Opera', scope: 'party',
    entries: [{ node: 'dark' }],
    nodes: {
      dark: { speaker: 'narrator', text: 'Midnight in the Grand Opera, seven years silent. You came in through the scenery dock with a stolen key, because the echo here is the best in Harmonia and nobody has used it since the Maestro put down his baton.', next: 'scale' },
      scale: { speaker: 'narrator', text: 'You sing a scale to the empty stalls. Somewhere very far away, a bell rings once, and the great chandelier over your head hums back a note it has not sung in seven years.', next: 'hush' },
      hush: {
        speaker: 'narrator', text: 'The note goes on and on, filling the empty house from the pit to the gods. You could stop singing. You do not.',
        choices: [
          { text: '(Sing it back to the chandelier.)', to: 'back' },
          { text: '(Stop, and listen.)', to: 'listen' },
          { text: '(Find the harmony underneath it.)', to: 'harmony', school: 'song' },
        ],
      },
      back: { speaker: 'narrator', text: 'You hold the note and the chandelier holds it with you, crystal by crystal, until the whole Opera is ringing like a glass with a wet finger round its rim.', next: 'stone' },
      listen: { speaker: 'narrator', text: 'You stop. The chandelier does not. It goes on singing without you, as if it had only been waiting for somebody to start it.', next: 'stone' },
      harmony: { speaker: 'narrator', text: 'There is a harmony under it, low and patient, coming up through your boots from somewhere beneath the stage. You find it, and the two notes lock together like hands.', next: 'stone' },
      stone: { speaker: 'narrator', text: 'Under the stage boards something answers, high and clear, and the same note starts up in your chest. Out in the dark stalls, pale lights rise from the seats and turn towards the sound.', next: 'box' },
      box: { speaker: 'narrator', text: 'And high in the royal box a candle flares, and somebody says “Bravo!” in the voice of a woman who has waited seven years to say it.', next: null },
    },
  },
  {
    id: 'dialogue:bard-rosalind-bell', name: 'I-1 Rosalind in the royal box', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: RV, mood: 'happy', text: 'Bravo! Bravissimo! Oh, do not stop on my account, darling, I have not had an audience in seven years and I have not been one in longer. You were flat on the top note. Gloriously flat.',
        choices: [
          { text: 'I’m sorry. I broke in.', to: 'broke' },
          { text: 'Something is singing under the stage.', to: 'stone' },
        ],
      },
      broke: { speaker: RV, text: 'Everyone breaks in. I broke in for my first audition. I live here now, in my old dressing room, which is breaking in very slowly. Rosalind Vell. You will have heard of me. Say you have.', next: 'stone' },
      stone: {
        speaker: RV, text: 'When the crown broke, half of the Song Stone fell through the roof of this Opera during an overture. The conductor kept going. Thirty years it has slept under those boards, and tonight it sang. And so, darling, did you.',
        choices: [
          { text: 'It’s in my chest too. The same note.', to: 'chest', insight: 'bard_stone_named' },
          { text: 'You were the soprano. The one on the posters.', to: 'posters', trust: 1 },
        ],
      },
      posters: { speaker: RV, mood: 'happy', text: 'The one on the posters, the one on the tea-towels, the one on a regrettable series of commemorative plates. Yes. I am resting the voice. I have been resting it for some time.', next: 'chest' },
      chest: { speaker: RV, text: 'Then the stone has chosen its singer, and it has chosen someone who breaks into opera houses at midnight. I approve. Follow me to my dressing room, at once, before the wisps come back. Encore, my pug, wants to smell your shoes.', next: null },
    },
  },
  // ---------- I-2 The Five Bars
  bar(1, 'At the Humming Fountain, a hurdy-gurdy man with no teeth', 'cranks out one bar of the overture and stops dead, astonished, as if he had found a coin in his own pocket.',
    'You keep the bar in your head. Behind him the fountain is not humming. It is full to the brim with black tears, and a Siren Wisp is drinking from it.', 'The hurdy-gurdy man is playing a waltz, badly, with great joy.'),
  bar(2, 'Two sisters who share one flute', 'play the second bar between them, a note each, glaring at one another the whole time.',
    'They have argued about that bar for thirty years. They are both right. You keep it.', 'The flute sisters are arguing about whose turn it is to breathe.'),
  bar(3, 'A boy with a drum made out of a hatbox', 'beats out the third bar and then sings it, very loudly, in a voice that has not broken yet.',
    'His grandmother taught him. She was a timpanist at the Opera. He has never been inside.', 'The hatbox boy is drumming on his hatbox. It used to hold a hat.'),
  bar(4, 'The lamplighter of the Opera Quarter', 'whistles the fourth bar as he lights the lamps, one note to each lamp, the way he has every evening for forty years.',
    'He did not know it was the overture. He thought it was just the lamp tune. A wisp follows him down the street, drinking the notes as they fade.', 'The lamplighter whistles you good evening.'),
  bar(5, 'An old woman with a pair of silver spoons', 'clatters out the fifth and last bar on her knee, then on the step, then on your shin.',
    'Five bars. You have the whole overture, in the wrong order, in your head.', 'The spoon woman is playing your shin again. You had better move.'),
  {
    id: 'dialogue:bard-rosalind-overture', name: 'I-2 the overture for Rosalind', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'You play all five bars for her in the dressing room, among the honey jars, with Encore howling along on the beat.', next: 'rosa' },
      rosa: {
        speaker: RV, mood: 'sad', text: 'It is in the wrong order. Of course it is. It is perfect. Oh, give me a moment. I have mascara older than you and I am not losing it now.',
        choices: [
          { text: 'Take all the moments you need.', to: 'loft', trust: 1 },
          { text: 'The fountains are full of black tears.', to: 'tears' },
        ],
      },
      tears: { speaker: RV, mood: 'afraid', text: 'The fountains that used to hum? Black? In the Opera Quarter? Then something is wrong in the house itself, and I think I know where.', next: 'loft' },
      loft: { speaker: RV, text: 'Something sings in the choir loft at night. A hymn, a little flat. Three buskers have stopped to listen this week, and every one of them forgot their only tune. Go and listen, darling, after the lamps are out. Do not hum along.', next: null },
    },
  },
  // ---------- I-3 The Choir Loft
  {
    id: 'dialogue:obj-choir-loft-stair', name: 'I-3 the choir-loft stair',
    entries: [
      { when: { all: [{ questStage: 'quest:bard-the-choir-loft', stage: 'listen' }, { hour: [21, 4] }] }, node: 'night' },
      { when: { questStage: 'quest:bard-the-choir-loft', stage: 'listen' }, node: 'day' },
      { node: 'stair' },
    ],
    nodes: {
      stair: { speaker: 'narrator', text: 'A narrow stair behind the dress circle, up to the choir loft. The banister is worn smooth by a thousand choristers who were always late.', next: null },
      day: { speaker: 'narrator', text: 'Dust, and daylight through a hole in the dome. Nothing is singing. Rosalind said after the lamps are out.', next: null },
      night: {
        speaker: 'narrator', text: 'In the dark at the top of the stair, a choir that is not there sings a hymn, slightly flat. You feel a tune you have known all your life start to slip, and you hold on to it with both hands.',
        effects: [{ setFlag: 'bard.loft_heard', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-phantom-hymn-book', name: 'I-3 the Phantom’s hymn-book', scope: 'party',
    entries: [{ when: { questStage: 'quest:bard-the-choir-loft', stage: 'book' }, node: 'book' }, { node: 'shut' }],
    nodes: {
      book: { speaker: 'narrator', text: 'A choirmaster’s hymn-book on the lectern, its pages running black. The last hymn in it is marked, in a careful hand, FOR THE TURNING. Every hymn after that page is blank.', next: 'close' },
      close: {
        speaker: 'narrator', text: 'The loft is very quiet.',
        choices: [
          { text: '(Close the book gently.)', to: 'gentle' },
          { text: '(Hum the Turning hymn once, in tune, then close it.)', to: 'hum', school: 'song', insight: 'bard_turning_hymn' },
        ],
      },
      gentle: { speaker: 'narrator', text: 'You close it. Somewhere below, three buskers on the Opera steps all remember their tunes at once and start playing them at each other.', next: null },
      hum: { speaker: 'narrator', text: 'You hum it, and for a moment a whole choir hums it with you, in tune for the first time in thirty years. Then you close the book, and they are gone, and the loft is only a loft.', next: null },
      shut: { speaker: 'narrator', text: 'The hymn-book lies closed on the lectern.', next: null },
    },
  },
  {
    id: 'dialogue:bard-rosalind-loft', name: 'I-3 the loft is quiet', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: RV, text: 'The old choirmaster. It would be. He loved that loft more than he loved any of us, and he loved us a great deal. He conducted the Turning hymn when I was a girl. Is he at rest?',
        choices: [{ text: 'He is now.', to: 'rest', trust: 1 }, { text: 'His book was full of black tears.', to: 'tears' }],
      },
      tears: { speaker: RV, mood: 'sad', text: 'Even here. Even him. Well. You closed it, and that is what matters.', next: 'rest' },
      rest: { speaker: RV, text: 'Now. There is a man on the Busking Steps in a lilac coat, buying songs out of hats and paying in gold. He has asked after you by name. I do not like men in lilac. I was married to one.', next: null },
    },
  },
  // ---------- I-4 The Impresario
  {
    id: 'dialogue:bard-marchetti-steps', name: 'I-4 meeting the Impresario', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: BM, mood: 'happy', text: 'There! The singer who walked into the Choir Loft and walked out humming. Blaise Marchetti, impresario, at your service and very much at your feet. Hatty, my dear, keep the change. Kate, your nan’s jig is worth twice that.',
        choices: [
          { text: 'You know everyone’s name.', to: 'names' },
          { text: 'When did you come to Lyrehaven?', to: 'when', insight: 'marchetti_arrival' },
        ],
      },
      names: { speaker: BM, text: 'Everyone has a name and everyone has a song. I collect both. It is the only vice I have kept up with any discipline.', next: 'gala' },
      when: { speaker: BM, text: 'A month ago, on the Tuesday coach from the Fells road, with two trunks and a head cold. I fell in love with the city before the cold had cleared.', next: 'gala' },
      gala: {
        speaker: BM, text: 'Here is my dream. One night. The Grand Opera, open again, every seat full, every chandelier lit. The Lighthouse Keeper’s Daughter, with you in the title role. Rosalind’s role. Think of it.',
        choices: [
          { text: 'Why buy all these songs?', to: 'buy' },
          { text: 'That role belongs to Rosalind.', to: 'role' },
        ],
      },
      buy: { speaker: BM, text: 'Because they are being lost, a few a week, and somebody ought to hold on to them. I never need to hear a song twice, you know. Once, and I have it for good.', next: 'end' },
      role: { speaker: BM, mood: 'sad', text: 'And she has not sung it in seven years. I adore her. I would never ask her to suffer through it. Ask her, if you like. Tell her Blaise sends his love and a box of crystallised violets.', next: 'end' },
      end: { speaker: BM, text: 'Think about it. Everyone has one great song in them. I would like very much to hear yours, once.', next: null },
    },
  },
  {
    id: 'dialogue:bard-marchetti', name: 'Marchetti (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: BM, text: 'My favourite singer. Have you thought about the gala? Of course you have. Everybody thinks about the gala.',
        choices: [
          { text: 'What do you do with the songs you buy?', to: 'do' },
          { text: 'Why do you never ask to hear them twice?', to: 'twice', when: { flag: 'bard.marchetti_met' } },
          { text: 'Farewell.', to: null, tag: 'leave' },
        ],
      },
      do: { speaker: BM, text: 'I keep them. Very safely. Somewhere nobody will ever lose them again. Run along, I have a fiddler to overpay.', next: null },
      twice: { speaker: BM, mood: 'happy', text: 'Because a thing heard twice is a thing you have started to lose. Once, darling. Once is forever, if it is done properly.', next: null },
    },
  },
  {
    id: 'dialogue:bard-rosalind-gala', name: 'I-4 Rosalind hears about the gala', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: RV, mood: 'angry', text: 'My Daughter? He has offered you my Daughter? The Lighthouse Keeper’s Daughter, in which I was carried off a cliff by a stagehand called Bernard ninety-one times? Crystallised violets. The cheek of the man.', next: 'calm' },
      calm: {
        speaker: RV, text: 'No, no. You should sing it. Somebody should. It is only that I… Well. I am resting the voice.',
        choices: [
          { text: 'You could sing it yourself.', to: 'self' },
          { text: 'I won’t, unless you want me to.', to: 'wont', trust: 1 },
        ],
      },
      self: { speaker: RV, mood: 'sad', text: 'I could not, darling. Not even for him. Not even to spite him, which is the strongest reason I have ever had for anything.', next: 'act' },
      wont: { speaker: RV, mood: 'happy', text: 'Oh, you dear thing. Let us see what he does next before anyone sings anything.', next: 'act' },
      act: { speaker: RV, text: 'In any case there is a Hall at the Conservatory tonight. Rector Quaver means to lock every song in Lyrehaven in a box, and the Discord means to sing them all to death first. They have asked for you. Go and be eloquent.', next: null },
    },
  },
  // ---------- I-5 The Songbook Act (the faction choice; a party vote)
  {
    id: 'dialogue:bard-songbook-act', name: 'I-5 the Songbook Act', scope: 'party',
    entries: [{ when: { not: { flag: 'bard.songbook' } }, node: 'hall' }, { node: 'after' }],
    nodes: {
      hall: { speaker: 'narrator', text: 'The Conservatory Hall, packed to the organ pipes. Professors in the front rows, students in the gallery, the Discord along the back wall in grey with their mouths shut. In a box above them all, in lilac, the Impresario is eating a crystallised violet.', next: 'quaver' },
      quaver: { speaker: IQ, text: 'The Act is simple. Every song still sung in Lyrehaven is to be written down, every bar, and the scores locked in the Conservatory vaults, where nothing can ever be forgotten again.', next: 'hush' },
      hush: { speaker: VH, text: '(She stands, and says nothing for a long time, and the Hall goes quiet to hear it.) Every song ends. Let us sing each one a last time, all together, and let it go home. Silence is not the death of a song. It is where it goes to rest.', next: 'box' },
      box: { speaker: BM, mood: 'happy', text: '(From his box, licking sugar off his glove.) Oh, don’t mind me. I only buy them. Whatever you decide, darlings, I shall still be buying.', next: 'ask' },
      ask: {
        speaker: IQ, text: 'Our guest may question the Hall before speaking. It is customary. It is also very tiresome. Go on.',
        choices: [
          { text: 'Rector, who holds the key to the vaults?', to: 'key' },
          { text: 'Verity, where do songs go, when they rest?', to: 'rest' },
          { text: '(Hum a bar of the overture, and see who in the Hall knows it.)', to: 'hum', school: 'song' },
        ],
      },
      key: { speaker: IQ, text: 'The Conservatory. Which is to say, me. (A beat.) And the vaults back onto the organ loft, where it is very dry. Excellent for paper.', next: 'choose' },
      rest: { speaker: VH, text: 'Into the people who heard them. Into the walls. Into the quiet after. (She looks up at the lilac box.) Not into anybody’s pocket.', next: 'choose' },
      hum: { speaker: 'narrator', text: 'Half the gallery hums the next bar without thinking. The professors do not. In his box the Impresario mouths every note, and then, very carefully, stops.', next: 'choose' },
      choose: {
        speaker: IQ, text: 'The Hall will hear our guest. The stone sings in you, they tell me. What should we do with our songs?',
        choices: [
          { text: 'Seal them. Write down every bar and lock it away.', to: 'sealed', quest: true, trustNpc: RV, trust: -1, effects: [{ setFlag: 'bard.songbook', value: 'sealed' }] },
          { text: 'Sing them all, one last night, and let them go.', to: 'lastnight', quest: true, effects: [{ setFlag: 'bard.songbook', value: 'lastnight' }] },
          { text: 'Neither. A song lives as long as someone new learns it. Give every song to one stranger.', to: 'taught', quest: true, insight: 'bard_taught', when: { insight: 'songs_passed_on' }, effects: [{ setFlag: 'bard.songbook', value: 'taught' }] },
        ],
      },
      sealed: { speaker: IQ, mood: 'happy', text: 'Carried. The copyists begin at dawn. (In the box above, the Impresario applauds, slowly.) We have kept the old Abbey hymns too, you know. When you go, take a copy. Somebody somewhere may want them.', next: 'sealed2' },
      sealed2: { speaker: 'narrator', text: 'By morning the Busking Steps are quiet, and the sealed scores go up to the vaults behind the Conservatory walls. Rosalind, when she hears, says a song in a box is a pressed flower.', next: null },
      lastnight: { speaker: VH, mood: 'happy', text: '(For the first time, she smiles.) Then tonight, all of us. Every song in Lyrehaven, once, and then the rest.', next: 'lastnight2' },
      lastnight2: { speaker: 'narrator', text: 'The whole city sings until dawn: every song, once, in every street. In the morning the practice rooms are silent. Above the Hall, in his box, the Impresario is weeping with joy.', next: null },
      taught: { speaker: 'narrator', text: 'The Hall argues until midnight, and then every singer in Lyrehaven goes out into the street and teaches their song to the first stranger they meet. By morning the turf war on the Steps is over, because there is nothing left to fight over: everybody has everything.', next: 'taught2' },
      taught2: { speaker: BM, mood: 'angry', text: '(From his box, very quietly, to nobody.) Oh, that is clever. That is very clever. You cannot buy a song that everybody has.', next: null },
      after: { speaker: IQ, text: 'The Hall has spoken. Lyrehaven will live with it, or sing about it, which is the same thing here.', next: null },
    },
  },
  // ---------- I-6 The Grand Organ
  {
    id: 'dialogue:bard-organ-hall', name: 'I-6 inside the organ-hall', scope: 'party',
    entries: [
      { when: { flag: 'bard.songbook', value: 'sealed' }, node: 'sealed' },
      { when: { flag: 'bard.songbook', value: 'lastnight' }, node: 'lastnight' },
      { node: 'taught' },
    ],
    nodes: {
      sealed: { speaker: 'narrator', text: 'The sealed scores are stacked in the organ loft, crate on crate, and the great pipes are breathing them in. Sheet by sheet the songs are lifting off the paper and going up the pipes like smoke.', next: 'floor' },
      lastnight: { speaker: 'narrator', text: 'The let-go songs did not go home. They have drifted into the organ’s pipes like smoke into a chimney, and the pipes are full and humming and hungry for more.', next: 'floor' },
      taught: { speaker: 'narrator', text: 'Someone has been feeding the organ by hand: the few songs that were bought before the Hall, fed in at the keyboard one by one. A pair of lilac gloves lies on the music stand.', next: 'floor' },
      floor: {
        speaker: 'narrator', text: 'The floor of the hall is its keyboard, black and white flagstones the length of a ballroom. The pipes turn towards you all at once.',
        choices: [
          { text: '(Step onto the keys.)', to: null },
          { text: 'It drinks through the walls. That pipe in Practice Room Nine was one of its throats.', to: 'clue', when: { flag: 'bard.pipe_clue' } },
        ],
      },
      clue: { speaker: 'narrator', text: 'Then it has been drinking the Conservatory for years, a scale at a time. You know which pipe is the throat. You know which chord will shut it.', next: null },
    },
  },
  {
    id: 'dialogue:obj-organ-chorister-pipes', name: 'I-6 the choristers in the pipes', scope: 'party',
    entries: [{ when: { questStage: 'quest:bard-the-grand-organ', stage: 'pipes' }, node: 'out' }, { node: 'pipes' }],
    nodes: {
      out: { speaker: 'narrator', text: 'You prise open the biggest pipes, and out tumble twelve choristers in the Conservatory’s old blue robes, thin and blinking and seven years late for rehearsal.', next: 'who' },
      who: { speaker: 'narrator', text: 'One after another they tell you the same thing. A kind man in a lilac coat showed them in. He said he had a part for them. He said it would only be for one night.', next: null },
      pipes: { speaker: 'narrator', text: 'The organ pipes stand open and silent. Somebody has tied a blue chorister’s ribbon round the biggest one.', next: null },
    },
  },
  // ---------- I-7 Marchetti's Masterpiece
  {
    id: 'dialogue:bard-rosalind-choristers', name: 'I-7 the choristers named him', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: RV, mood: 'afraid', text: 'The Conservatory choir? They went missing the same week the Maestro put down his baton. We thought they had walked to the Fells. Seven years. And they say Blaise showed them in? Blaise only came a month ago.',
        choices: [
          { text: 'Then he has been here before.', to: 'before' },
          { text: 'Mister Murmur says he goes under the stage at night.', to: 'murmur', when: { flag: 'bard.murmur_clue' } },
        ],
      },
      before: { speaker: RV, text: 'Before the Hollowing, even, as a boy. Every impresario starts as a boy at the back of the gods. Under the stage is where he would hide anything, darling. It is where everyone in this house hides everything.', next: null },
      murmur: { speaker: RV, text: 'Murmur notices everything and says it all at a whisper. If he says under the stage, it is under the stage. Go down past the prompt-box. Take a candle and do not lean on anything that looks like a trapdoor.', next: null },
    },
  },
  {
    id: 'dialogue:obj-marchetti-score', name: 'I-7 the score', scope: 'party',
    entries: [{ when: { questStage: 'quest:bard-marchettis-masterpiece', stage: 'workshop' }, node: 'room' }, { node: 'empty' }],
    nodes: {
      room: {
        speaker: 'narrator', text: 'A workshop under the stage, lit by one candle. On the desk is a single enormous score, its pages folded into one another like a fan. Every song he bought is in it, bar after bar, written in black-tear ink that will never fade.',
        effects: [{ setFlag: 'bard.marchetti_turned', value: true }],
        choices: [
          { text: '(Read the last page.)', to: 'last' },
          { text: 'The prompt-box is full of ash. He learned each song once and burned the original.', to: 'ash', insight: 'marchetti_ash', when: { any: [{ insight: 'touts_printed' }, { flag: 'bard.murmur_clue' }, { flag: 'bard.receipt_seen' }, { flag: 'bard.ash_seen' }, { flag: 'bard.cellar_watched' }] } },
        ],
      },
      ash: { speaker: 'narrator', text: 'Behind you, the prompt-box is heaped with grey: the ash of a hundred songs, each one heard once, written into his score, and burned so that no other copy would exist. Nobody will ever sing them again except his score.', next: 'last' },
      last: { speaker: 'narrator', text: 'The last page has no last bar. Across the bottom, in his elegant hand: For the Opera half. To be played once, and forever, so that nobody will ever need another song.', next: null },
      empty: { speaker: 'narrator', text: 'The workshop under the stage. The candle has burned down. The score is gone.', next: null },
    },
  },
  {
    id: 'dialogue:bard-rosalind-score', name: 'I-7 Rosalind hears about the score', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: RV, mood: 'angry', text: 'A song that never ends. So that nobody will ever need another. That is not a song, darling, that is a prison with a tune in it.',
        choices: [
          { text: 'He’s sold every seat for the gala.', to: 'gala' },
          { text: 'He thinks he’s saving them.', to: 'saving' },
        ],
      },
      saving: { speaker: RV, mood: 'sad', text: 'They all think that. The Maestro thought that, when he started taking voices. Keep a thing safe enough for long enough and you have killed it, very tidily.', next: 'gala' },
      gala: { speaker: RV, text: 'Then the gala is the night he plays it, with the Opera half under the boards and every seat full to hear it. So you will go on stage, darling, and you will improvise. He cannot bear anything that is not in the score.', next: null },
    },
  },
  // ---------- I-8 The Opera Stage
  {
    id: 'dialogue:bard-gala-night', name: 'I-8 gala night', scope: 'party',
    entries: [{ when: { flag: 'bard.fledgling', value: 'nested' }, node: 'harpy' }, { node: 'house' }],
    nodes: {
      harpy: { speaker: 'narrator', text: 'Up on the Opera roof, under the dome, a young harpy is singing Hatty Penwhistle’s best tune to the whole of Lyrehaven, very loudly, slightly wrong.', next: 'house' },
      house: { speaker: 'narrator', text: 'Every seat in the Grand Opera is full, and every chandelier is lit. The curtain rises on a bare stage, and the Impresario stands in the prompter’s place with a baton made of black glass.', next: 'speech' },
      speech: { speaker: BM, mood: 'happy', text: 'Ladies and gentlemen. Tonight you will hear every song this city ever sang, all at once, and then you will never have to hear another. I am so glad you could come. Please, do not clap until the end. There will not be one.', next: null },
    },
  },
  {
    id: 'dialogue:obj-song-capital-halfstone', name: 'I-8 the Opera half', scope: 'party',
    entries: [{ when: { questStage: 'quest:bard-the-opera-stage', stage: 'stone' }, node: 'claim' }, { node: 'boards' }],
    nodes: {
      claim: { speaker: 'narrator', text: 'Under the centre of the stage, where every great singer has ever stood, the boards come up in your hands. Half a crystal lies in the dust, cracked clean across, singing. It is warm, like a hand held out to you from the wings.', next: 'house' },
      house: {
        speaker: 'narrator', text: 'Out in the dark auditorium four thousand people are sitting very still, the way an audience sits when it is not sure whether the show is over. Somebody up in the gods begins to clap, alone.',
        choices: [
          { text: '(Take a bow.)', to: 'bowd' },
          { text: '(Sing the last bar, the one he left out of his score.)', to: 'lastbar', school: 'song' },
        ],
      },
      bowd: { speaker: 'narrator', text: 'You bow, deeply, to four thousand people, and they roar. Somewhere up in the flies, a rope creaks.', next: 'bow' },
      lastbar: { speaker: 'narrator', text: 'You sing the bar that is not in his score, the one that ends it. The whole house holds its breath, and then breathes out together, like a crowd let out into the air.', next: 'bow' },
      bow: {
        speaker: BM, mood: 'happy', text: '(From high in the flies, swinging on a scenery rope, a deep bow.) Brava. Keep it warm for me, darling. I will be waiting at the Lyre Gate. The last song always needs an audience.',
        choices: [
          { text: 'Your receipts said “destroyed”, Blaise.', to: 'receipts', when: { flag: 'bard.receipt_seen' } },
          { text: 'Where are you going?', to: 'where' },
          { text: '(Let him go.)', to: null },
        ],
      },
      receipts: { speaker: BM, mood: 'sad', text: '(The rope stops swinging.) Destroyed, darling, not lost. Nothing I bought is lost. It is all in here. (He taps his chest.) It is getting very crowded in here.', next: null },
      where: { speaker: BM, text: 'To the stage door, like every star. The Lyre Gate is only a larger one. (The rope swings out over the stalls, and he is gone.)', next: null },
      boards: { speaker: 'narrator', text: 'A hole in the stage boards, centre stage. Somebody has already chalked a mark beside it, the way they mark a star’s position.', next: null },
    },
  },
  // ---------- I-9 Curtain Call (mentor farewell; trust check)
  {
    id: 'dialogue:bard-rosalind-farewell', name: 'I-9 Rosalind’s farewell', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: RV, text: 'The meadows used to hum when the wind crossed them. All the way to the gate, like a choir warming up. Listen to them now. So. You have it, and he has gone, and you must follow. Every good tour ends on the road.',
        choices: [
          { text: 'Come with me.', to: 'stay' },
          { text: 'Thank you, Signora. For everything.', to: 'sing', trust: 1 },
        ],
      },
      stay: { speaker: RV, text: 'And leave the Opera with nobody to sleep in it? No. Somebody must keep the dressing room aired for when you come back famous.', next: 'sing' },
      sing: {
        speaker: RV, text: 'Before you go. Sing me something, darling. Not for the road. For me.',
        choices: [
          { text: '(Sing the first bar of the overture.)', to: 'bar' },
          { text: '(Sing the aria Clemency wrote out for her.)', to: 'aria', school: 'song', when: { questCompleted: 'quest:bard-resting-the-voice' } },
          { text: 'I can’t sing it the way you did.', to: 'cant' },
        ],
      },
      bar: { speaker: RV, mood: 'happy', text: '(She conducts it with one finger, very small, the way the Maestro never did.) There. That is how the house woke up. Remember that it was you who woke it.', next: 'gift' },
      aria: { speaker: RV, mood: 'sad', text: '(She listens with her eyes shut, and when it ends she does not open them for a while.) Clemency taught it to you. Of course she did. Then it is not lost. Then neither am I.', next: 'gift' },
      cant: { speaker: RV, text: 'Nobody can sing it the way I did, darling. That was never the point. Sing it the way you do, and see who listens.', next: 'gift' },
      gift: {
        speaker: RV, text: 'Now hold still. I have something for you.',
        choices: [
          { text: '(Take what she offers.)', to: 'glasses', when: { trust: RV, value: 'friendly' } },
          { text: '(Kiss her hand, as they do at curtain calls.)', to: 'hand', when: { not: { trust: RV, value: 'friendly' } } },
        ],
      },
      glasses: {
        speaker: RV, text: 'My opera glasses. Mother-of-pearl. Through them a Siren Wisp looks exactly like what it is, which is a bad note with ideas. I watched every rival I ever had through these.',
        effects: [{ giveItem: 'i_rosalind_opera_glasses' }, { setFlag: 'bard.opera_glasses', value: true }], next: 'encore',
      },
      encore: {
        speaker: RV, mood: 'sad', text: 'And… Encore. Take Encore. Do not argue. He has a better ear than the whole Conservatory, and he has been looking at the gate road all week.',
        choices: [
          { text: 'I’ll bring him back to you.', to: 'end', when: { trust: RV, value: 'trusted' }, effects: [{ setFlag: 'bard.encore_pet', value: true }] },
          { text: 'He belongs with you.', to: 'end' },
        ],
      },
      hand: { speaker: RV, text: 'Charming. Mind the Maestro. Mind the Impresario. Mind your top notes.', next: null },
      end: { speaker: RV, text: 'Go on, then. Exit stage left. Never look back at the audience, darling, it only encourages them.', next: null },
    },
  },
];

export default dialogues;
