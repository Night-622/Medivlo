/**
 * Hollow Crown, Harmonia: Lyrehaven NPCs for the Bard campaign (docs/lore/hollow-crown/06-outlines/song.md),
 * plus the Bard's Concordia people (the Song exiles of Abbeyshore, the C-4 copyist).
 * Zones: zone:song-capital-1 the Opera Quarter, -2 the Busking Steps, -3 the Conservatory, -4 the Prompter's Cellars.
 * Owner: Claude 4.
 */
import type { NarrativeCondition, NpcDef } from '@/core';

const BARD: NarrativeCondition = { heroClass: 'bard' };
const at = (q: `quest:${string}`, stage: string): NarrativeCondition => ({ questStage: q, stage });
const Z1 = 'zone:song-capital-1' as const, Z2 = 'zone:song-capital-2' as const, Z3 = 'zone:song-capital-3' as const, Z4 = 'zone:song-capital-4' as const;

const npcs: NpcDef[] = [
  {
    id: 'npc:rosalind-vell', name: 'Signora Rosalind Vell', title: 'Prima donna of the Grand Opera', school: 'song', origin: 'song', trust: 2,
    services: ['Mentor', 'Trains Bards'], region: Z1, home: 'landmark:rosalind-dressing-room', lore: 'lore:hc-rosalind-vell',
    presentWhen: BARD,
    schedule: [
      { from: 0, to: 24, at: 'landmark:grand-opera', activity: 'idle', when: at('quest:bard-the-bell-in-the-opera', 'rosalind') },
      { from: 0, to: 24, at: 'landmark:lyrehaven-meadow-road', activity: 'idle', when: at('quest:bard-curtain-call', 'farewell') },
    ],
    dialogue: [
      { when: at('quest:bard-the-bell-in-the-opera', 'rosalind'), dialogue: 'dialogue:bard-rosalind-bell' },
      { when: at('quest:bard-the-bell-in-the-opera', 'room'), dialogue: 'dialogue:bard-rosalind-room' },
      { when: at('quest:bard-the-five-bars', 'report'), dialogue: 'dialogue:bard-rosalind-overture' },
      { when: at('quest:bard-the-choir-loft', 'report'), dialogue: 'dialogue:bard-rosalind-loft' },
      { when: at('quest:bard-the-impresario', 'rosalind'), dialogue: 'dialogue:bard-rosalind-gala' },
      { when: at('quest:bard-marchettis-masterpiece', 'rosalind'), dialogue: 'dialogue:bard-rosalind-choristers' },
      { when: at('quest:bard-marchettis-masterpiece', 'back'), dialogue: 'dialogue:bard-rosalind-score' },
      { when: at('quest:bard-curtain-call', 'farewell'), dialogue: 'dialogue:bard-rosalind-farewell' },
      { when: at('quest:bard-resting-the-voice', 'rosalind'), dialogue: 'dialogue:bard-rosalind-resting' },
      { when: at('quest:bard-the-understudy', 'rosalind'), dialogue: 'dialogue:bard-rosalind-understudy' },
      { dialogue: 'dialogue:bard-rosalind' },
    ],
    barks: [{ lines: ['Darling. Darling. Stand up straight, the gods can see you.', 'I am resting the voice. I have been resting it for seven years. It is very well rested.', 'Encore, no. That is a wig. Put it down.'] }],
    roles: ['quest', 'trainer'], essential: true,
    look: { skin: 0xe8c4a8, hair: 0x2a1a20, cloth: 0x7a3aa8, accent: 0xf0a0ff, build: 'average' },
    bio: 'The greatest soprano Lyrehaven ever booed, cheered and threw roses at, all in one night. She has not sung in seven years, sleeps in her old dressing room at the silent Opera, and talks about her voice constantly, as if it had only stepped out.',
  },
  {
    id: 'npc:encore', name: 'Encore', title: 'a pug of discerning ear', school: 'song', origin: 'song',
    region: Z1, home: 'landmark:rosalind-dressing-room', presentWhen: { all: [BARD, { not: { flag: 'bard.encore_pet' } }] },
    dialogue: [{ dialogue: 'dialogue:bard-encore' }],
    barks: [{ lines: ['(Encore sneezes, on the beat.)', '(He howls along to a note only he can hear. It is a B flat.)', '(Encore is wearing a ruff. He does not seem to mind.)'] }],
    roles: ['ambient'],
    look: { skin: 0xc8a070, cloth: 0xf0a0ff, build: 'short' },
    bio: 'Rosalind’s pug, named for the only word he reliably responds to. He has sat through more operas than any critic in Lyrehaven and has a better ear than most of them.',
  },
  {
    id: 'npc:blaise-marchetti', name: 'Impresario Blaise Marchetti', title: 'Impresario, lately of everywhere', school: 'song', origin: 'song', trust: 2,
    region: Z2, home: 'landmark:busking-steps-pitch', lore: 'lore:hc-blaise-marchetti',
    // Act I on the Steps; Act III, beaten on the stair top, waiting for his fate (the scene must be reopenable)
    presentWhen: {
      all: [BARD, {
        any: [
          { all: [{ not: { flag: 'bard.halfstone' } }, { any: [{ questActive: 'quest:bard-the-impresario' }, { questActive: 'quest:bard-the-songbook-act' }, { questActive: 'quest:bard-the-grand-organ' }] }] },
          at('quest:bard-the-last-performance', 'fate'),
        ],
      }],
    },
    schedule: [{ from: 0, to: 24, at: 'landmark:twelve-stairs-top', activity: 'idle', when: at('quest:bard-the-last-performance', 'fate') }],
    dialogue: [
      { when: at('quest:bard-the-last-performance', 'fate'), dialogue: 'dialogue:bard-herald-fate' },
      { when: at('quest:bard-the-impresario', 'steps'), dialogue: 'dialogue:bard-marchetti-steps' },
      { dialogue: 'dialogue:bard-marchetti' },
    ],
    barks: [{ lines: ['A song for a silver! A song for two, if it makes me cry!', 'Everyone has one good song in them. I simply collect.', 'Tobble, my dear fellow, still the one note? Magnificent restraint.'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0xe0b898, hair: 0x1a1a1a, cloth: 0xb48ad8, accent: 0xffd96b, build: 'tall' },
    bio: 'A gracious, funny, immaculately dressed impresario in a lilac coat, who arrived in Lyrehaven a month ago and already knows every busker’s name. He pays fortunes for songs, and he never once asks to hear them twice.',
  },
  {
    id: 'npc:old-tobble', name: 'Old Tobble', title: 'the One-Note Busker', school: 'song', origin: 'song', trust: 2,
    region: Z1, home: 'landmark:humming-fountain', presentWhen: BARD,
    // Act III: walks to the Heart camp with the lullaby (Tobble's Lullaby)
    schedule: [{ from: 0, to: 24, at: 'landmark:heart-camp', activity: 'idle', when: { questActive: 'quest:bard-tobbles-lullaby' } }],
    dialogue: [
      { when: { questActive: 'quest:bard-tobbles-lullaby' }, dialogue: 'dialogue:bard-tobble-heart' },
      { dialogue: 'dialogue:bard-tobble' },
    ],
    barks: [{ lines: ['(Parp.)', '(He plays one note on his crumhorn, and waits, and plays it again.)', 'It goes somewhere after this one. I know it does.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b090, hair: 0xe8e4dc, cloth: 0x5a4a6a, accent: 0xd9b45a, build: 'slight' },
    bio: 'The oldest busker in the Opera Quarter, who once knew four hundred tunes and now plays one note all day: the last note of a lullaby he is forgetting.',
  },
  {
    id: 'npc:lem-spragg', name: 'Lem Spragg', title: 'Ticket tout', school: 'song', origin: 'song', trust: 1,
    region: Z1, home: 'landmark:opera-box-office', presentWhen: BARD,
    dialogue: [{ dialogue: 'dialogue:bard-lem-spragg' }],
    barks: [{ lines: ['Gala tickets! Best seats! Seats! Tickets!', 'Lonnie, run. No, not you. Not yet.'] }],
    roles: ['quest'],
    look: { skin: 0xd0a080, hair: 0x6a4a2a, cloth: 0x4a3a2a, accent: 0xb08a3a, build: 'slight' },
    bio: 'The talking half of the Spragg brothers, ticket touts of the Opera Quarter. His brother Lonnie is the running half.',
  },
  {
    id: 'npc:beadle-fothergill', name: 'Beadle Fothergill', title: 'of the Opera Quarter Watch', school: 'song', origin: 'song', trust: 1,
    region: Z1, home: 'landmark:opera-quarter-board', presentWhen: BARD,
    dialogue: [{ dialogue: 'dialogue:bard-fothergill' }],
    barks: [{ lines: ['Bounties on the board. No busking within ten feet of it.', 'I have had eleven complaints about the Bellflowers. In verse.'] }],
    roles: ['quest'],
    look: { skin: 0xc8946e, hair: 0x8a8a8a, cloth: 0x3a2a5a, accent: 0xd9b45a, build: 'broad' },
    bio: 'The Beadle of the Opera Quarter, who keeps the peace, the bounty board and a list of every busker who owes him a song.',
  },
  {
    id: 'npc:rosin-kate', name: 'Rosin Kate', title: 'Captain of the Fiddlers', school: 'song', origin: 'song', trust: 2,
    region: Z2, home: 'landmark:busking-steps-pitch', presentWhen: BARD,
    dialogue: [
      { when: at('quest:bard-the-songbook-act', 'canvass'), dialogue: 'dialogue:bard-kate-canvass' },
      { when: at('quest:bard-fiddlers-versus-pipers', 'kate'), dialogue: 'dialogue:bard-kate-duet' },
      { dialogue: 'dialogue:bard-rosin-kate' },
    ],
    barks: [{ lines: ['That jig is ours. My nan fiddled it at her own wedding.', 'Pipers. Honestly. Blowing into a sheep and calling it music.'] }],
    roles: ['quest'],
    look: { skin: 0xd8a888, hair: 0xb8402a, cloth: 0x6a2a4a, accent: 0xf0a0ff, build: 'average' },
    bio: 'Captain of the Fiddlers of the Busking Steps, who hold the left-hand stair and the opinion that pipes are a mistake.',
  },
  {
    id: 'npc:long-calloway', name: 'Long Calloway', title: 'Captain of the Pipers', school: 'song', origin: 'song', trust: 2,
    region: Z2, home: 'landmark:busking-steps-pitch', presentWhen: BARD,
    dialogue: [{ dialogue: 'dialogue:bard-calloway' }],
    barks: [{ lines: ['Fiddlers. Scraping a cat’s insides with a horse’s tail.', 'That jig wants a drone under it. Always did.'] }],
    roles: ['quest'],
    look: { skin: 0xb8886a, hair: 0x3a2a20, cloth: 0x2a4a3a, accent: 0xd9b45a, build: 'tall' },
    bio: 'Captain of the Pipers of the Busking Steps, very tall, very proud, and the owner of the loudest set of pipes in Harmonia.',
  },
  {
    id: 'npc:hatty-penwhistle', name: 'Hatty Penwhistle', title: 'Hat-busker', school: 'song', origin: 'song', trust: 2,
    region: Z2, home: 'landmark:busking-steps-pitch', presentWhen: BARD,
    dialogue: [{ dialogue: 'dialogue:bard-hatty' }],
    barks: [{ lines: ['Turnips, turnips, round and red… it’s all I’ve got left.', 'Something took my tunes clean out of my hat. Clean out!'] }],
    roles: ['quest'],
    look: { skin: 0xe8c4a8, hair: 0xd9b45a, cloth: 0x5a3a7a, accent: 0xffd96b, build: 'short' },
    bio: 'A busker on the Steps who keeps her tunes in her hat, the old way, and has lost three of them this week to something with feathers.',
  },
  {
    id: 'npc:perdita-brisk', name: 'Perdita Brisk', title: 'Chestnut-seller, and understudy', school: 'song', origin: 'song', trust: 1,
    region: Z2, home: 'landmark:chestnut-brazier', presentWhen: BARD,
    dialogue: [{ dialogue: 'dialogue:bard-perdita' }],
    barks: [{ lines: ['Hot chestnuts! Hot— (she sings the next bit, and it is lovely).', 'Eleven years in the wings. I know every note of that role. Every one.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b090, hair: 0x6a3a2a, cloth: 0x7a5a3a, accent: 0xf0a0ff, build: 'average' },
    bio: 'Rosalind Vell’s understudy for eleven years, who was never once let on stage. She sells hot chestnuts on the Busking Steps now and sings while she does it, better than she lets anyone notice.',
  },
  {
    id: 'npc:isadora-quaver', name: 'Rector Isadora Quaver', title: 'Rector of the Conservatory', school: 'song', origin: 'song', trust: 1,
    region: Z3, home: 'landmark:conservatory-hall', presentWhen: BARD,
    dialogue: [
      { when: at('quest:bard-the-songbook-act', 'vote'), dialogue: 'dialogue:bard-songbook-act' },
      { dialogue: 'dialogue:bard-quaver' },
    ],
    barks: [{ lines: ['A song that is not written down is a rumour.', 'Mind the practice rooms. Some of them have stopped echoing.'] }],
    roles: ['quest'],
    look: { skin: 0xe0c0a8, hair: 0x8a8a8a, cloth: 0x2a3470, accent: 0xe8e0c8, build: 'tall' },
    bio: 'Rector of the Lyrehaven Conservatory, who has catalogued four thousand songs in thirty years and lost count of how many she could not save.',
  },
  {
    id: 'npc:verity-hush', name: 'Verity Hush', title: 'of the Discord', school: 'song', origin: 'song', trust: 1,
    region: Z3, home: 'landmark:conservatory-hall', presentWhen: BARD,
    dialogue: [
      { when: at('quest:bard-the-songbook-act', 'vote'), dialogue: 'dialogue:bard-songbook-act' },
      { dialogue: 'dialogue:bard-verity' },
    ],
    barks: [{ lines: ['Listen. No, listen. That. That is the purest song there is.', 'Every song ends. We only want to be there when it does.'] }],
    roles: ['quest'],
    look: { skin: 0xd8c8c0, hair: 0x1a1a1a, cloth: 0x3a3a3a, accent: 0xe8e4dc, build: 'slight' },
    bio: 'A speaker for the Discord, who believe silence is the purest song. She carries a lute with no strings and plays it, beautifully, in total silence.',
  },
  {
    id: 'npc:florian-treble', name: 'Student Florian Treble', title: 'of Practice Room Nine', school: 'song', origin: 'song', trust: 2,
    region: Z3, home: 'landmark:practice-room-nine', presentWhen: BARD,
    dialogue: [
      { when: at('quest:bard-the-songbook-act', 'canvass'), dialogue: 'dialogue:bard-florian-canvass' },
      { dialogue: 'dialogue:bard-florian' },
    ],
    barks: [{ lines: ['C, D, E, F… three years. Three years, and the room has never once said it back.', 'I’m not stuck. I’m thorough.'] }],
    roles: ['quest'],
    look: { skin: 0xe8c4a8, hair: 0xb8743a, cloth: 0x2a3470, accent: 0xe8e0c8, build: 'slight' },
    bio: 'A Conservatory student who has practised the same scale in Practice Room Nine for three years, waiting for the room to answer.',
  },
  {
    id: 'npc:porter-crotchet', name: 'Porter Crotchet', title: 'Keeper of the Great Metronome', school: 'song', origin: 'song', trust: 2,
    region: Z3, home: 'landmark:great-metronome', presentWhen: BARD,
    dialogue: [{ dialogue: 'dialogue:bard-crotchet' }],
    barks: [{ lines: ['Wound her every morning for thirty years. Not one tick.', 'Time keeps itself. Tempo needs a porter.'] }],
    roles: ['quest'],
    look: { skin: 0xc8a080, hair: 0xd0d0c8, cloth: 0x4a3a2a, accent: 0xd9b45a, build: 'short' },
    bio: 'The Conservatory porter, who winds the stopped great metronome every morning with a key the size of his arm, because nobody has told him to stop.',
  },
  {
    id: 'npc:mister-murmur', name: 'Old Mister Murmur', title: 'Prompter of the Grand Opera', school: 'song', origin: 'song', trust: 2,
    region: Z4, home: 'landmark:prompt-box', presentWhen: BARD,
    dialogue: [{ dialogue: 'dialogue:bard-murmur' }],
    barks: [{ lines: ['(Whispering.) “…and the lighthouse keeper turns, and sees her…”', '(Whispering.) Line? Line. Somebody always wants the line.'] }],
    roles: ['quest'],
    look: { skin: 0xd8c8b0, hair: 0xe8e4dc, cloth: 0x2a2a2a, accent: 0x8a8a8a, build: 'slight' },
    bio: 'The Opera’s prompter for fifty years. The stage has been empty for seven, and he still whispers every line of every opera to it from his box, in case somebody forgets.',
  },
  {
    id: 'npc:dame-gusset', name: 'Dame Gusset', title: 'Mistress of the Wardrobe', school: 'song', origin: 'song', trust: 2,
    region: Z4, home: 'landmark:costume-store', presentWhen: BARD,
    dialogue: [{ dialogue: 'dialogue:bard-gusset' }],
    barks: [{ lines: ['Not in the Moon Queen. Anything but the Moon Queen.', 'Pins. Pins! Who has had my pins?'] }],
    roles: ['quest'],
    look: { skin: 0xc8946e, hair: 0x9a3a2a, cloth: 0x6a2a4a, accent: 0xffd96b, build: 'broad' },
    bio: 'Mistress of the Grand Opera’s Wardrobe, with forty pins in her mouth and a memory for every hem she has ever let down.',
  },
  // ---------- Act II (Concordia)
  {
    id: 'npc:eulalie-marchbank', name: 'Precentor Eulalie Marchbank', title: 'of the Song exiles, Abbeyshore', school: 'song', origin: 'song', trust: 2,
    region: 'region:abbey', home: 'landmark:shore-chapel',
    presentWhen: { flag: 'story.act', op: '>=', value: 2 },
    // Bard C-2: after the escort she stays on the old Abbey landing to sing to the choir
    schedule: [{ from: 0, to: 24, at: 'landmark:bard-abbey-landing', activity: 'idle', when: at('quest:bard-under-the-lake', 'hear') }],
    dialogue: [
      { when: at('quest:bard-under-the-lake', 'hear'), dialogue: 'dialogue:bard-eulalie-landing' },
      { when: at('quest:bard-abbess-morwen', 'tell'), dialogue: 'dialogue:bard-eulalie-morwen' },
      { when: at('quest:bard-abbeyshore', 'chapel'), dialogue: 'dialogue:bard-eulalie' },
      { dialogue: 'dialogue:song-eulalie' },
    ],
    barks: [{ lines: ['Dusk soon. We sing at dusk. They like company.', 'Lyrehaven? You came from Lyrehaven? Is the Opera still standing?'] }],
    roles: ['quest'],
    look: { skin: 0xe0c0a8, hair: 0xd8d8d0, cloth: 0x7a3aa8, accent: 0xe8e0c8, build: 'slight' },
    bio: 'Precentor of the Song-folk stranded at Abbeyshore since C. 1012. Every dusk she leads them in singing to the drowned choir from the Shore Chapel, in songs thirty years out of date and still perfectly in tune.',
  },
  {
    id: 'npc:wystan-penhallow', name: 'Wystan Nibworth', title: 'Copyist, formerly of the Impresario', school: 'song', origin: 'song', trust: 1,
    region: 'region:gloam', home: 'landmark:lodge-kennels',
    presentWhen: { all: [BARD, { flag: 'story.act', op: '>=', value: 2 }] },
    dialogue: [
      { when: at('quest:bard-the-last-movement', 'wystan'), dialogue: 'dialogue:bard-wystan' },
      { dialogue: 'dialogue:bard-wystan-general' },
    ],
    barks: [{ lines: ['Ink to the elbows. It doesn’t come off. His ink never comes off.', 'The dogs here are very kind. Kinder than composers.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b8a0, hair: 0x4a3a2a, cloth: 0x3a3048, accent: 0x1a1a1a, build: 'slight' },
    bio: 'A Lyrehaven copyist who came through the Lyre Gate behind the Impresario to copy his score, and ran away three weeks later with black ink to the elbows.',
  },
];

export default npcs;
