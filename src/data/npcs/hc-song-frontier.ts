/**
 * Hollow Crown, Harmonia: the Echoing Fells NPCs for the Skald campaign (06-outlines/song.md), plus the Skald's
 * Concordia people (the Fish Mill drummers at Abbeyshore, the C-4 kennel-keeper at Hollis Lodge).
 * Zones: zone:song-frontier-1 the Drum-Steads, -2 the Echoing Fells, -3 the Saga Stones, -4 the Harpy Cliffs.
 * Owner: Claude 4.
 */
import type { NarrativeCondition, NpcDef } from '@/core';

const SK: NarrativeCondition = { heroClass: 'skald' };
const at = (q: `quest:${string}`, stage: string): NarrativeCondition => ({ questStage: q, stage });
const Z1 = 'zone:song-frontier-1' as const, Z2 = 'zone:song-frontier-2' as const, Z3 = 'zone:song-frontier-3' as const, Z4 = 'zone:song-frontier-4' as const;

const npcs: NpcDef[] = [
  {
    id: 'npc:ragna-saga-keeper', name: 'Ragna Saga-Keeper', title: 'Eldest of the Saga Halls', school: 'song', origin: 'song', trust: 3,
    services: ['Mentor', 'Trains Skalds'], region: Z1, home: 'landmark:ragna-hearth', lore: 'lore:hc-ragna-saga-keeper',
    presentWhen: SK,
    schedule: [
      { from: 0, to: 24, at: 'landmark:fells-gate-cairn', activity: 'idle', when: at('quest:skald-ragnas-last-saga', 'farewell') },
      { from: 0, to: 24, at: 'landmark:saga-hall', activity: 'idle', when: { any: [at('quest:skald-the-bell-on-the-fells', 'hall'), at('quest:skald-the-bell-on-the-fells', 'skins')] } },
    ],
    dialogue: [
      { when: at('quest:skald-the-bell-on-the-fells', 'ragna'), dialogue: 'dialogue:skald-ragna-bell' },
      { when: at('quest:skald-the-bell-on-the-fells', 'skins'), dialogue: 'dialogue:skald-ragna-skins' },
      { when: at('quest:skald-the-stone-with-no-saga', 'ragna'), dialogue: 'dialogue:skald-ragna-stone' },
      { when: at('quest:skald-the-drum-relay', 'report'), dialogue: 'dialogue:skald-ragna-relay' },
      { when: at('quest:skald-the-discordant-hall', 'report'), dialogue: 'dialogue:skald-ragna-hall' },
      { when: at('quest:skald-ulf-comes-home', 'ragna'), dialogue: 'dialogue:skald-ragna-ulf' },
      { when: at('quest:skald-the-weeping-runes', 'ragna'), dialogue: 'dialogue:skald-ragna-message' },
      { when: at('quest:skald-ragnas-last-saga', 'farewell'), dialogue: 'dialogue:skald-ragna-farewell' },
      { when: at('quest:skald-the-saga-of-nobody-much', 'ragna'), dialogue: 'dialogue:skald-ragna-nobody' },
      { when: at('quest:skald-the-first-saga-she-lost', 'ragna'), dialogue: 'dialogue:skald-ragna-first-saga' },
      { when: { all: [at('quest:skald-the-drum-relay', 'drums'), { not: { flag: 'skald.delight.twice' } }] }, dialogue: 'dialogue:skald-delight-twice' },
      { dialogue: 'dialogue:skald-ragna' },
    ],
    barks: [{ lines: ['Nine hundred sagas. Eight hundred and… well. A good many.', 'Sit. I’ll tell you one. Which one did I just say?', 'Drum it twice, little one. The Fells only believe things they hear twice.'] }],
    roles: ['quest', 'trainer'], essential: true,
    look: { skin: 0xd8b8a0, hair: 0xf0ece4, cloth: 0x5a3a6a, accent: 0xd9b45a, build: 'short' },
    bio: 'The eldest Skald of the Fells, who raised the hero in the Saga Hall and knows nine hundred sagas by heart. She is losing one a week, and she makes jokes about it, mostly.',
  },
  {
    id: 'npc:ulf-the-unsung', name: 'Ulf the Unsung', title: 'Drummer of the Saga Halls', school: 'song', origin: 'song', trust: 3,
    region: Z3, home: 'landmark:saga-stones-ring', lore: 'lore:hc-ulf-the-unsung',
    // Act I at the Saga Stones; Act III, beaten on the stair top, waiting for his fate (the scene must be reopenable)
    presentWhen: { all: [SK, { any: [{ questActive: 'quest:skald-ulf-comes-home' }, { questActive: 'quest:skald-the-blank-stones' }, at('quest:skald-the-unsung-chimera', 'fate')] }] },
    schedule: [
      { from: 0, to: 24, at: 'landmark:twelve-stairs-top', activity: 'idle', when: at('quest:skald-the-unsung-chimera', 'fate') },
      { from: 0, to: 24, at: 'landmark:scarrow-pike', activity: 'idle', when: { any: [at('quest:skald-ulf-comes-home', 'pike'), at('quest:skald-ulf-comes-home', 'drum')] } },
    ],
    dialogue: [
      { when: at('quest:skald-the-unsung-chimera', 'fate'), dialogue: 'dialogue:skald-herald-fate' },
      { when: at('quest:skald-ulf-comes-home', 'stones'), dialogue: 'dialogue:skald-ulf-home' },
      { when: at('quest:skald-ulf-comes-home', 'drum'), dialogue: 'dialogue:skald-ulf-pike' },
      { dialogue: 'dialogue:skald-ulf' },
    ],
    barks: [{ lines: ['(Drum: Little one.)', '(He is cutting a saga into the stone with a chisel, by moonlight, very carefully.)', '(Drum: Still here. Still listening.)'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0xc8a080, hair: 0x6a4a2a, cloth: 0x3a3048, accent: 0x1a1a1a, build: 'broad' },
    bio: 'The hero’s elder saga-brother, born Unsung, raised by Ragna as a drummer. He learned all nine hundred sagas by heart and drummed them, because they would not ring in his mouth. Seven years ago the Silent Maestro took even his speaking voice. Now he talks with his drum.',
  },
  {
    id: 'npc:sigrun', name: 'Sigrun of Wether Stead', title: 'Shepherd of the Drum-Steads', school: 'song', origin: 'song', trust: 2,
    region: Z1, home: 'landmark:sigrun-fold', presentWhen: SK,
    dialogue: [{ dialogue: 'dialogue:skald-sigrun' }],
    barks: [{ lines: ['She’s a ewe. She’s my ewe. She just happens to be in tune.', 'Three steads, one sheep. Somebody’s getting kicked.'] }],
    roles: ['quest'],
    look: { skin: 0xd8a888, hair: 0xd9b45a, cloth: 0x6a5a3a, accent: 0xe8e0c8, build: 'broad' },
    bio: 'A shepherd of the Drum-Steads whose ewe, Bluebell, bleats in perfect pitch. She did not ask for a musical sheep and is beginning to resent it.',
  },
  {
    id: 'npc:bluebell', name: 'Bluebell', title: 'a ewe, in tune', school: 'song', origin: 'song',
    region: Z1, home: 'landmark:sigrun-fold', presentWhen: SK,
    dialogue: [
      { when: { all: [{ flag: 'skald.delight.bluebell-met' }, { not: { flag: 'skald.delight.bluebell-e' } }] }, dialogue: 'dialogue:skald-delight-bluebell' },
      { dialogue: 'dialogue:skald-bluebell' },
    ],
    barks: [{ lines: ['(Baa. A perfect A.)', '(Bluebell bleats a fifth above the drum, and looks pleased with herself.)'] }],
    roles: ['ambient'],
    look: { skin: 0xf0ece4, cloth: 0x9a9a9a, build: 'short' },
    bio: 'A ewe of Wether Stead who bleats in perfect pitch, and is wanted by three steads for the drum-relay.',
  },
  {
    id: 'npc:eskil-ottarsson', name: 'Eskil Ottarsson', title: 'Relay-drummer of the Steads', school: 'song', origin: 'song', trust: 2,
    region: Z1, home: 'landmark:relay-stead', presentWhen: SK,
    dialogue: [
      { when: at('quest:skald-the-blank-stones', 'canvass'), dialogue: 'dialogue:skald-eskil-canvass' },
      { dialogue: 'dialogue:skald-eskil' },
    ],
    barks: [{ lines: ['News in from Brackenhow. Some of it is probably true.', 'Relay says it’ll rain. Relay said that in a drought once. Relay’s an optimist.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b090, hair: 0x8a5a2a, cloth: 0x4a3a2a, accent: 0xd9b45a, build: 'slight' },
    bio: 'The relay-drummer of the Drum-Steads, who passes every piece of news in the Fells from valley to valley and has stopped believing most of it.',
  },
  {
    id: 'npc:old-hulda', name: 'Old Hulda of Brackenhow', title: 'not dead, not married, not a cow', school: 'song', origin: 'song', trust: 1,
    region: Z2, home: 'landmark:brackenhow', presentWhen: SK,
    dialogue: [{ dialogue: 'dialogue:skald-hulda' }],
    barks: [{ lines: ['A COW?', 'Ninety-one, and they bury me twice a winter.'] }],
    roles: ['quest'],
    look: { skin: 0xd0b098, hair: 0xe8e4dc, cloth: 0x3a5a3a, accent: 0xb08a3a, build: 'short' },
    bio: 'The oldest woman in Brackenhow, who has been reported dead by the drum-relay four times and is beginning to take it personally.',
  },
  {
    id: 'npc:old-gunnvor', name: 'Old Gunnvor', title: 'Shepherd’s widow', school: 'song', origin: 'song', trust: 2,
    region: Z2, home: 'landmark:scarrow-pike', presentWhen: SK,
    dialogue: [{ dialogue: 'dialogue:skald-gunnvor' }],
    barks: [{ lines: ['Forty years he’s been halfway through that sentence. Typical.', 'The Fells keep what you say on them. Mind your language up there.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b8a0, hair: 0xd0d0c8, cloth: 0x4a3a5a, accent: 0xe8e0c8, build: 'slight' },
    bio: 'A shepherd’s widow at the foot of Scarrow Pike, whose husband started a sentence on the summit forty years ago and fell before he finished it. The Fell has been finishing it ever since.',
  },
  {
    id: 'npc:shepherd-kolbein', name: 'Shepherd Kolbein', title: 'of the High Fells', school: 'song', origin: 'song', trust: 2,
    region: Z2, home: 'landmark:whistling-tarn', presentWhen: SK,
    dialogue: [{ dialogue: 'dialogue:skald-kolbein' }],
    barks: [{ lines: ['That’s old Fetch’s whistle. Fetch has been dead nine years.', 'Sheep will follow anything. That’s the trouble with sheep.'] }],
    roles: ['quest'],
    look: { skin: 0xc8946e, hair: 0x5a3a2a, cloth: 0x6a5a3a, accent: 0x8a8a8a, build: 'tall' },
    bio: 'A shepherd of the high Fells whose flock keeps walking into the tarns after the echo of his old dog’s whistle.',
  },
  {
    id: 'npc:hall-reeve-brynja', name: 'Hall-Reeve Brynja', title: 'of the Saga Halls', school: 'song', origin: 'song', trust: 1,
    region: Z1, home: 'landmark:saga-hall', presentWhen: SK,
    schedule: [{ from: 0, to: 24, at: 'landmark:saga-stones-ring', activity: 'idle', when: at('quest:skald-the-blank-stones', 'moot') }],
    dialogue: [
      { when: at('quest:skald-the-blank-stones', 'moot'), dialogue: 'dialogue:skald-blank-stones' },
      { when: at('quest:skald-the-stone-with-no-saga', 'brynja'), dialogue: 'dialogue:skald-brynja-stone' },
      { dialogue: 'dialogue:skald-brynja' },
    ],
    barks: [{ lines: ['A saga not cut is a saga lent. A saga lent is a saga lost.', 'Chisels are on the rack. Bring your own grit.'] }],
    roles: ['quest'],
    look: { skin: 0xd0a080, hair: 0xb8743a, cloth: 0x5a3a6a, accent: 0xd9b45a, build: 'broad' },
    bio: 'Reeve of the Saga Halls, who keeps the chisels, the stone-rota and the list of which sagas matter most. She keeps the list very short.',
  },
  {
    id: 'npc:ylva-stillwater', name: 'Ylva Stillwater', title: 'of the Discord', school: 'song', origin: 'song', trust: 1,
    region: Z3, home: 'landmark:saga-stones-ring', presentWhen: SK,
    dialogue: [
      { when: at('quest:skald-the-blank-stones', 'moot'), dialogue: 'dialogue:skald-blank-stones' },
      { dialogue: 'dialogue:skald-ylva' },
    ],
    barks: [{ lines: ['Let the stones go smooth. The dead have been talked about enough.', '(She sits with her back to a saga, so as not to read it.)'] }],
    roles: ['quest'],
    look: { skin: 0xd8c8c0, hair: 0xa8a8a0, cloth: 0x3a3a3a, accent: 0xe8e4dc, build: 'slight' },
    bio: 'A speaker for the Discord on the Fells, who believes the dead deserve quiet, and that a worn-blank stone is a kindness.',
  },
  {
    id: 'npc:asta', name: 'Asta', title: 'Rubber of sagas, aged ten', school: 'song', origin: 'song', trust: 2,
    region: Z3, home: 'landmark:saga-stones-ring', presentWhen: SK,
    dialogue: [
      { when: at('quest:skald-the-blank-stones', 'canvass'), dialogue: 'dialogue:skald-asta-canvass' },
      { dialogue: 'dialogue:skald-asta' },
    ],
    barks: [{ lines: ['Hold still, stone. Nearly got you.', 'I’ve done ninety-one sagas. I’ve got charcoal up to here.'] }],
    roles: ['quest'],
    look: { skin: 0xe8c4a8, hair: 0x2a1a14, cloth: 0x5a4a6a, accent: 0x1a1a1a, build: 'short' },
    bio: 'A girl of the Saga Stones who is taking charcoal rubbings of every saga before it wears away, because she cannot cut stone yet and will not wait until she can.',
  },
  {
    id: 'npc:thora-cragfoot', name: 'Thora Cragfoot', title: 'Cliff-gatherer of the Harpy Cliffs', school: 'song', origin: 'song', trust: 2,
    region: Z4, home: 'landmark:egg-thieves-camp', presentWhen: SK,
    dialogue: [{ dialogue: 'dialogue:skald-thora' }],
    barks: [{ lines: ['A harpy egg hums the lullaby its mother sang it. Steal one and you steal the song.', 'Forty years on these cliffs. Never took an egg. Never will.'] }],
    roles: ['quest'],
    look: { skin: 0xb8886a, hair: 0x9a9a9a, cloth: 0x3a5a5a, accent: 0xd9b45a, build: 'average' },
    bio: 'A cliff-gatherer who has climbed the Harpy Cliffs for samphire and gulls’ eggs for forty years, and has never once taken a harpy’s.',
  },
  {
    id: 'npc:old-haldor', name: 'Old Haldor', title: 'the Fog-Drummer', school: 'song', origin: 'song', trust: 2,
    region: Z4, home: 'landmark:fog-drum', presentWhen: SK,
    dialogue: [{ dialogue: 'dialogue:skald-haldor' }],
    barks: [{ lines: ['(Boom.) Fog’s coming. (Boom.) Fog’s always coming.', 'Sixty years I’ve drummed ships off these cliffs. Never lost one. Nearly lost me.'] }],
    roles: ['quest'],
    look: { skin: 0xa07a5a, hair: 0xe8e4dc, cloth: 0x2a3a4a, accent: 0xd0d0c8, build: 'broad' },
    bio: 'The fog-drummer of the Harpy Cliffs, who beats a great drum on the headland whenever the fog comes in, so the ships know where the rocks are.',
  },
  {
    id: 'npc:steadreeve-arvid', name: 'Steadreeve Arvid', title: 'of the Drum-Steads', school: 'song', origin: 'song', trust: 1,
    region: Z1, home: 'landmark:steads-board', presentWhen: SK,
    dialogue: [{ dialogue: 'dialogue:skald-arvid' }],
    barks: [{ lines: ['Bounties are on the post. Drum twice if you take one.', 'Lambs I can count. Harpies I can’t. That’s your job.'] }],
    roles: ['quest'],
    look: { skin: 0xc8946e, hair: 0x6a4a2a, cloth: 0x4a3a2a, accent: 0xb08a3a, build: 'broad' },
    bio: 'Reeve of the Drum-Steads, who keeps the bounty post, the boundary stones and a running count of every lamb a harpy has ever taken.',
  },
  // ---------- Act II (Concordia)
  {
    id: 'npc:old-hallgerd', name: 'Hallgerd Drum-Wife', title: 'of the Fells exiles, Abbeyshore', school: 'song', origin: 'song', trust: 2,
    region: 'region:abbey', home: 'landmark:shore-fish-mill',
    presentWhen: { flag: 'story.act', op: '>=', value: 2 },
    dialogue: [
      { when: at('quest:skald-abbess-morwen', 'tell'), dialogue: 'dialogue:skald-hallgerd-morwen' },
      { when: at('quest:skald-abbeyshore', 'mill'), dialogue: 'dialogue:skald-hallgerd' },
      { dialogue: 'dialogue:song-hallgerd' },
    ],
    barks: [{ lines: ['(She drums without looking up.) Brother Hew. Brother Piran. Brother…', 'Thirty-seven names, every night. There ought to be forty.'] }],
    roles: ['quest'],
    look: { skin: 0xc8a080, hair: 0xf0ece4, cloth: 0x5a3a6a, accent: 0xd9b45a, build: 'broad' },
    bio: 'An old drum-wife of the Fells, stranded at Abbeyshore since C. 1012. Every night she and the other exiles drum the drowned choir’s names from the Old Fish Mill, so that someone is still saying them. They have lost three.',
  },
  {
    id: 'npc:ebba-coldrey', name: 'Ebba Coldrey', title: 'Kennel-keeper of Hollis Lodge', school: 'hunt', origin: 'concord', trust: 1,
    region: 'region:gloam', home: 'landmark:lodge-kennels',
    presentWhen: { all: [SK, { flag: 'story.act', op: '>=', value: 2 }] },
    // Skald C-4: after the escort she stays at the Gloamwood treeline with her hounds
    schedule: [{ from: 0, to: 24, at: 'landmark:skald-gloam-treeline', activity: 'idle', when: at('quest:skald-the-drum-in-the-glade', 'hound') }],
    dialogue: [
      { when: at('quest:skald-the-drum-in-the-glade', 'hound'), dialogue: 'dialogue:skald-ebba-hound' },
      { when: at('quest:skald-the-drum-in-the-glade', 'ebba'), dialogue: 'dialogue:skald-ebba' },
      { dialogue: 'dialogue:skald-ebba-general' },
    ],
    barks: [{ lines: ['Hush, girl. Hush. It’s only a drum.', 'They’ve howled at that drum for a week. Dusk, every night, regular as soup.'] }],
    roles: ['quest'],
    look: { skin: 0xd8a888, hair: 0x6a4a2a, cloth: 0x6e5a28, accent: 0xd9b45a, build: 'average' },
    bio: 'The kennel-keeper of Hollis Lodge, who knows every hound by its bark. For a week they have been howling at a drumbeat out in the Gloamwood that nobody else can find.',
  },
];

export default npcs;
