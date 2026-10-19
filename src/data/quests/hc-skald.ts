/**
 * Hollow Crown: the SKALD campaign (docs/lore/hollow-crown/06-outlines/song.md). Act I on the Echoing Fells
 * (area:song-frontier) and the Act II class thread in Concordia. Act III class quests land with the Heart.
 * Built on the Ash reference (10-campaign-style.md). Owner: Claude 4.
 */
import type { NarrativeCondition, QuestDef } from '@/core';

const SK: NarrativeCondition = { heroClass: 'skald' };
const done = (q: `quest:${string}`): NarrativeCondition => ({ questCompleted: q });
const req = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: [SK, ...c] });
const A1 = { act: 'act1' as const, campaign: 'skald', chapter: 'The Echoing Fells' };
const A2 = { act: 'act2' as const, campaign: 'skald', chapter: 'Concordia' };
const A3 = { act: 'act3' as const, campaign: 'skald', chapter: 'The Heart' };
const Z1 = 'zone:song-frontier-1' as const, Z2 = 'zone:song-frontier-2' as const, Z3 = 'zone:song-frontier-3' as const, Z4 = 'zone:song-frontier-4' as const;
const L1 = 'inst:song-frontier-lair-1' as const, L2 = 'inst:song-frontier-lair-2' as const, L3 = 'inst:song-frontier-lair-3' as const;
const RG = 'npc:ragna-saga-keeper' as const, UL = 'npc:ulf-the-unsung' as const, AR = 'npc:steadreeve-arvid' as const;
const HEARTH = { landmark: 'landmark:ragna-hearth' } as const;
const RING = { landmark: 'landmark:saga-stones-ring' } as const;

const quests: QuestDef[] = [
  // ======================= ACT I: main (I-1 … I-10)
  {
    ...A1, id: 'quest:skald-the-bell-on-the-fells', name: 'The Bell on the Fells', type: 'main', region: Z1, giver: RG,
    summary: 'You were on drum-watch at the Drum-Steads when a bell rang somewhere far away, and the Fells threw it back with your own name in it.',
    requires: SK, autoStart: true, firstStage: 'watch',
    stages: [
      {
        id: 'watch', journal: 'Every drum on every stead beat once by itself. Now Songbird Harpies are dropping on the sheepfolds out of the dark.',
        onEnter: [{ openDialogue: 'dialogue:skald-drum-watch' }],
        objectives: [{ id: 'harpies', text: 'Drive the harpies off the sheepfolds', kill: 'bx_song_1', count: 3, marker: { place: Z1 } }],
        onComplete: [{ openDialogue: 'dialogue:skald-fell-half' }],
        next: 'ragna',
      },
      {
        id: 'ragna', journal: 'The harpies are gone. Something under your ribs is still singing, and in the Saga Hall a lamp has been lit.',
        objectives: [{ id: 'ragna', text: 'Go to Ragna at her hearth', talk: RG, marker: HEARTH }],
        onComplete: [{ setFlag: 'skald.bell_heard', value: true }],
        next: 'hall',
      },
      {
        id: 'hall', journal: 'Ragna has wrapped a shawl over her nightgown and set off up the hill to the Saga Hall with a lamp, while she still remembers why.',
        objectives: [{ id: 'hall', text: 'Go up to the Saga Hall with Ragna', reach: 'landmark:saga-hall', marker: { landmark: 'landmark:saga-hall' } }],
        next: 'skins',
      },
      {
        id: 'skins', journal: 'Nine hundred drum-skins on the walls of the Saga Hall, one for every saga, and Ragna holding up a lamp to the oldest.',
        objectives: [{ id: 'ragna', text: 'Look at the drum-skins with Ragna', talk: RG, marker: { landmark: 'landmark:saga-hall' } }],
        onComplete: [{ startQuest: 'quest:skald-the-drum-relay' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-harmonia', 'lore:hc-saga-halls'] },
  },
  {
    ...A1, id: 'quest:skald-the-drum-relay', name: 'The Drum-Relay', type: 'main', region: Z1, giver: RG,
    summary: 'Ragna wants the news of the Bell drummed from valley to valley, the old way. Somewhere down the relay, the news is coming back wrong.',
    requires: req(done('quest:skald-the-bell-on-the-fells')), firstStage: 'drums',
    stages: [
      {
        id: 'drums', journal: 'Three relay drums between the Drum-Steads and the high Fells. Drum the news at each, and listen for it to come back.',
        objectives: [{ id: 'drums', text: 'Drum the news at the relay drums', interact: 'obj:relay-drum-*', count: 3, marker: { place: Z1 } }],
        next: 'tarn',
      },
      {
        id: 'tarn', journal: '“The Bell rang” went out. “The Bell drowned” came back. Up on the Fells, a tarn is throwing back echoes that sound wrong.',
        objectives: [{ id: 'tarn', text: 'Listen at the hollow tarn', interact: 'obj:hollow-echo-tarn', marker: { place: Z2 } }],
        next: 'report',
      },
      {
        id: 'report', journal: 'Black tears stand in the tarn, and the echoes come back hollow. And the relay goes through Hoddersgill, where nobody has drummed for a week.',
        objectives: [{ id: 'ragna', text: 'Tell Ragna what the Fells said', talk: RG, marker: HEARTH }],
        onComplete: [{ startQuest: 'quest:skald-the-discordant-hall' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40 },
  },
  {
    ...A1, id: 'quest:skald-the-discordant-hall', name: 'The Discordant Hall', type: 'main', region: Z2, giver: RG,
    summary: 'The Discord have taken Hoddersgill’s mead-hall and silenced its feast: no drums, no sagas, no toasts. Their leader plays a lute with no strings.',
    requires: req(done('quest:skald-the-drum-relay')), firstStage: 'hall',
    stages: [
      {
        id: 'hall', journal: 'Hoddersgill Hall stands in the second valley. Its doors are open, its fires are lit, and it is perfectly silent.',
        objectives: [{ id: 'enter', text: 'Go into Hoddersgill Hall', reach: L1, marker: { landmark: 'landmark:hoddersgill-hall' } }],
        onComplete: [{ openDialogue: 'dialogue:skald-silent-hall' }],
        next: 'bard',
      },
      {
        id: 'bard', journal: 'His silent chords bloom in rings that cancel your drumming. Drum from outside them.',
        objectives: [{ id: 'bard', text: 'Defeat the Discord Bard', kill: 'bx_song_3', count: 1 }],
        next: 'feast',
      },
      {
        id: 'feast', journal: 'The Discord are gone. The feast-drum by the high seat has not been beaten in a week.',
        objectives: [{ id: 'drum', text: 'Beat the feast-drum', interact: 'obj:hoddersgill-feast-drum' }],
        next: 'report',
      },
      {
        id: 'report', journal: 'Hoddersgill is drumming again, and singing, and arguing about the mead. The relay will run true.',
        objectives: [{ id: 'ragna', text: 'Tell Ragna the hall is retaken', talk: RG, marker: HEARTH }],
        onComplete: [{ setFlag: 'skald.hall_retaken', value: true }, { startQuest: 'quest:skald-ulf-comes-home' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 80, hcItems: [{ item: 'a_song_fur_helm' }], lore: ['lore:hc-discord'] },
  },
  {
    ...A1, id: 'quest:skald-ulf-comes-home', name: 'Ulf Comes Home', type: 'main', region: Z3, giver: RG,
    summary: 'The relay has carried a strange piece of news down from the Saga Stones: a man with a drum walked out of the mist there last night, after seven years away.',
    requires: req(done('quest:skald-the-discordant-hall')), firstStage: 'stones',
    stages: [
      {
        id: 'stones', journal: 'Someone has been re-cutting the worn sagas on the Saga Stones by night. The relay says he has a drum, and no voice.',
        objectives: [{ id: 'ulf', text: 'Find the drummer at the Saga Stones', talk: UL, marker: RING }],
        next: 'pike',
      },
      {
        id: 'pike', journal: 'Before you go to Ragna, Ulf wants to climb Scarrow Pike with you, the way you both did as children.',
        objectives: [{ id: 'pike', text: 'Climb Scarrow Pike with Ulf', reach: 'landmark:scarrow-pike', marker: { landmark: 'landmark:scarrow-pike' } }],
        next: 'drum',
      },
      {
        id: 'drum', journal: 'Ulf is sitting on the summit cairn of Scarrow Pike with his drum on his knee, looking at the sky.',
        objectives: [{ id: 'ulf', text: 'Sit with Ulf on Scarrow Pike', talk: UL, marker: { landmark: 'landmark:scarrow-pike' } }],
        next: 'ragna',
      },
      {
        id: 'ragna', journal: 'Ulf. Your saga-brother, home after seven years, talking with his drum because he has nothing else to talk with.',
        objectives: [{ id: 'ragna', text: 'Tell Ragna that Ulf is home', talk: RG, marker: HEARTH }],
        onComplete: [{ setFlag: 'skald.ulf_home', value: true }, { startQuest: 'quest:skald-the-blank-stones' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-ulf-the-unsung'] },
  },
  {
    ...A1, id: 'quest:skald-the-blank-stones', name: 'The Blank Stones', type: 'main', region: Z3, giver: 'npc:hall-reeve-brynja',
    summary: 'The Saga Stones are wearing blank faster than anyone can cut them, and there is stone and time enough to save only some of the sagas. The Saga Halls have called a moot at the stones.',
    requires: req(done('quest:skald-ulf-comes-home')), firstStage: 'canvass',
    stages: [
      {
        id: 'canvass', journal: 'Ragna said: before the moot, ask the people who keep the sagas without a Hall to do it for them. Asta rubs the stones. Eskil drums the relay.',
        objectives: [
          { id: 'asta', text: 'Ask Asta what the stones mean to her', talk: 'npc:asta', marker: RING },
          { id: 'eskil', text: 'Ask Eskil Ottarsson what the stones mean to the relay', talk: 'npc:eskil-ottarsson', marker: { landmark: 'landmark:relay-stead' } },
        ],
        next: 'moot',
      },
      {
        id: 'moot', journal: 'The moot meets in the ring of the Saga Stones. Hall-Reeve Brynja speaks for the Halls; Ylva Stillwater speaks for the Discord; Ulf sits on the uncarved stone and says nothing, because he cannot.',
        objectives: [{ id: 'moot', text: 'Speak at the moot of the Saga Stones', when: { flag: 'skald.stones' }, marker: RING }],
        next: 'torches',
      },
      {
        id: 'torches', journal: 'The moot has spoken. Tonight, by torchlight, the ring of the Saga Stones does what it decided.',
        objectives: [{ id: 'torch', text: 'Stand in the ring by torchlight', interact: 'obj:skald-moot-torch', marker: RING }],
        onComplete: [{ startQuest: 'quest:skald-the-harpy-roost' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-saga-stones'] },
  },
  {
    ...A1, id: 'quest:skald-the-harpy-roost', name: 'The Harpy Roost', type: 'main', region: Z4, giver: RG,
    summary: 'Whatever the moot decided, the Songbird Harpies have come down on the carvers, shrieking the sagas back wrong. Their roost is on the sea-cliffs, and it is lined with stolen echoes.',
    requires: req(done('quest:skald-the-blank-stones')), firstStage: 'cliffs',
    stages: [
      {
        id: 'cliffs', journal: 'The harpies came for the carvers in the night and flew back to the cliffs with what they stole. They drop stolen echoes as they go. Follow them up.',
        objectives: [{ id: 'echoes', text: 'Follow the dropped echoes up the Harpy Cliffs', interact: 'obj:skald-stolen-echo-*', count: 3, marker: { place: Z4 } }],
        next: 'roost',
      },
      {
        id: 'roost', journal: 'Up the Harpy Cliffs to the roost of Shriek-Mother, the eldest harpy.',
        objectives: [{ id: 'enter', text: 'Climb to the Harpy Roost', reach: L2, marker: { place: Z4 } }],
        onComplete: [{ openDialogue: 'dialogue:skald-roost' }],
        next: 'mother',
      },
      {
        id: 'mother', journal: 'She shrieks your last blow back at you as an echo. A drum-beat breaks it before it lands.',
        objectives: [{ id: 'mother', text: 'Defeat Shriek-Mother', kill: 'cb_shriek-mother', count: 1 }],
        next: 'message',
      },
      {
        id: 'message', journal: 'In the nest, among the stolen echoes, there is a drum-message on a strip of hide, rolled and tied with gut. Ulf’s knot.',
        objectives: [{ id: 'message', text: 'Take the drum-message from the nest', interact: 'obj:ulf-drum-message' }],
        onComplete: [{ setFlag: 'skald.ulf_message', value: true }, { startQuest: 'quest:skald-the-weeping-runes' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 120 },
  },
  {
    ...A1, id: 'quest:skald-the-weeping-runes', name: 'The Weeping Runes', type: 'main', region: Z3, giver: RG,
    summary: 'Ulf sent a message by harpy, and it was not addressed to anyone in Harmonia. Ragna can read his knots. She will not like what they say.',
    requires: req(done('quest:skald-the-harpy-roost')), firstStage: 'ragna',
    stages: [
      {
        id: 'ragna', journal: 'Ragna taught Ulf his knots. She can read the message.',
        objectives: [{ id: 'ragna', text: 'Bring the message to Ragna', talk: RG, marker: HEARTH }],
        next: 'runes',
      },
      {
        id: 'runes', journal: '“To the King in the Heart, from one Unsung to another.” Go and look at what Ulf has been cutting on the stones.',
        objectives: [{ id: 'runes', text: 'Look closely at Ulf’s new carvings', interact: 'obj:weeping-rune', marker: { landmark: 'landmark:stone-with-no-saga' } }],
        onComplete: [{ setFlag: 'skald.ulf_turned', value: true }],
        next: 'dusk',
      },
      {
        id: 'dusk', journal: 'Ragna says Ulf’s carvings weep at dusk, all of them at once. Stand in the ring at sundown and see it for yourself before you go down after him.',
        objectives: [{ id: 'dusk', text: 'Watch the Saga Stones at dusk', when: { flag: 'skald.dusk_watched' }, marker: RING }],
        onComplete: [{ startQuest: 'quest:skald-the-echo-barrow' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-weeping-runes'] },
  },
  {
    ...A1, id: 'quest:skald-the-echo-barrow', name: 'The Echo Barrow', type: 'main', region: L3, giver: RG,
    summary: 'The Fell half of the Song Stone lies in the barrow of the first Skald, where every word comes back three times. Ulf has gone in ahead of you with his drum.',
    requires: req(done('quest:skald-the-weeping-runes')), firstStage: 'barrow',
    stages: [
      {
        id: 'barrow', journal: 'The Echo Barrow, under the Saga Stones. Your half-stone is singing, and the barrow is singing it back, three times.',
        objectives: [{ id: 'enter', text: 'Go down into the Echo Barrow', reach: L3, marker: { place: Z3 } }],
        onComplete: [{ openDialogue: 'dialogue:skald-echo-barrow' }],
        next: 'ulf',
      },
      {
        id: 'ulf', journal: 'Every beat of his drum comes back three times as a shockwave. Shout a war-cry to cancel the echo before it hits.',
        objectives: [{ id: 'ulf', text: 'Face Ulf the Unsung', kill: 'cb_ulf-the-unsung', count: 1 }],
        next: 'stone',
      },
      {
        id: 'stone', journal: 'Ulf drummed one last beat, and the barrow’s back door opened onto the road to the Lyre Gate. The Fell half is still in the first Skald’s stone hands.',
        objectives: [{ id: 'stone', text: 'Claim the Fell half', interact: 'obj:song-frontier-halfstone' }],
        onComplete: [{ setFlag: 'skald.halfstone', value: true }, { startQuest: 'quest:skald-ragnas-last-saga' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, skillPoints: 1, lore: ['lore:hc-half-stones', 'lore:hc-first-skald'] },
  },
  {
    ...A1, id: 'quest:skald-ragnas-last-saga', name: 'Ragna’s Last Saga', type: 'main', region: Z1, giver: RG,
    summary: 'Ulf is walking to the Lyre Gate, and the half-stone in your hand can open it. Ragna has walked up to the gate cairn to tell you your own saga before you go.',
    requires: req(done('quest:skald-the-echo-barrow')), firstStage: 'farewell',
    stages: [
      {
        id: 'farewell', journal: 'Ragna is sitting on the gate cairn with her saga-staff across her knees.',
        objectives: [{ id: 'ragna', text: 'Sit with Ragna at the gate cairn', talk: RG, marker: { landmark: 'landmark:fells-gate-cairn' } }],
        onComplete: [{ setFlag: 'skald.ragna_farewell', value: true }],
        next: 'echo',
      },
      {
        id: 'echo', journal: 'Where the road leaves the Fells stands the Last Echo, the last place on the way to the gate where the Fells will answer you.',
        objectives: [{ id: 'echo', text: 'Leave your name at the Last Echo', interact: 'obj:skald-last-echo', marker: { landmark: 'landmark:skald-last-echo' } }],
        next: 'road',
      },
      {
        id: 'road', journal: 'Down off the Fells to the Lyre Gate. Behind you, the relay drums are passing your name from valley to valley.',
        objectives: [{ id: 'gate', text: 'Take the road to the Lyre Gate', reach: 'area:song-gate', marker: { place: 'area:song-gate' } }],
        onComplete: [{ startQuest: 'quest:skald-the-lyre-gate' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:skald-the-lyre-gate', name: 'The Lyre Gate (Fells side)', type: 'main', region: 'area:song-gate', giver: RG,
    summary: 'On the Fells side of the Lyre Gate, the Silent Maestro has stolen even the echoes. The arena is dead quiet, and his choir of stolen voices is waiting.',
    requires: req(done('quest:skald-ragnas-last-saga')), firstStage: 'maestro',
    stages: [
      {
        id: 'maestro', journal: 'Drum the Fells awake to win the echoes back, then turn them on his choir.',
        objectives: [{ id: 'maestro', text: 'Defeat the Silent Maestro', kill: 'bx_song_5', count: 1 }],
        next: 'gate',
      },
      {
        id: 'gate', journal: 'The baton is down, the echoes are roaring back, and the stolen voices are tearing free. One of them is flying after Ulf.',
        objectives: [{ id: 'seal', text: 'Decide, and open the Lyre Gate', interact: 'obj:song-gate-seal' }],
        onComplete: [{ setFlag: 'story.gate_open', value: true }, { setFlag: 'story.act', value: 2 }, { setFlag: 'skald.act1_done', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 200, lore: ['lore:hc-realm-gates', 'lore:hc-silent-maestro'] },
  },

  // ======================= ACT I: side quests (2 per zone)
  {
    ...A1, id: 'quest:skald-the-ewe-who-sang', name: 'The Ewe Who Sang', type: 'side', region: Z1, giver: 'npc:sigrun',
    summary: 'Sigrun’s ewe Bluebell bleats in perfect pitch, and three steads want her for the drum-relay. Sigrun would like it settled before anyone comes to blows.',
    requires: req(done('quest:skald-the-bell-on-the-fells')), firstStage: 'fold',
    stages: [
      {
        id: 'fold', journal: 'Three stead-wives at Sigrun’s fold, a ewe in the middle, and a great deal of rolling up of sleeves.',
        objectives: [{ id: 'fold', text: 'Settle the matter of Bluebell', interact: 'obj:sigrun-fold', marker: { landmark: 'landmark:sigrun-fold' } }],
        next: 'sigrun',
      },
      {
        id: 'sigrun', journal: 'It came to blows. It was always going to come to blows.',
        objectives: [{ id: 'sigrun', text: 'Tell Sigrun how it went', talk: 'npc:sigrun', marker: { landmark: 'landmark:sigrun-fold' } }],
        next: 'drum',
      },
      {
        id: 'drum', journal: 'Sigrun would like to hear Bluebell try the relay once, just to know. The high relay drum is on the hill above the steads.',
        objectives: [{ id: 'drum', text: 'Take Bluebell up to the high relay drum', interact: 'obj:skald-bluebell-drum', marker: { place: Z1 } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 30 },
  },
  {
    ...A1, id: 'quest:skald-news-from-two-valleys', name: 'News from Two Valleys Over', type: 'side', region: Z1, giver: 'npc:eskil-ottarsson',
    summary: 'The relay says that Old Hulda of Brackenhow has died, married and been turned into a cow, in that order. Eskil would like someone to walk over and check.',
    requires: req(done('quest:skald-the-drum-relay')), firstStage: 'hulda',
    stages: [
      {
        id: 'hulda', journal: 'Brackenhow is two valleys over. Bring something for the funeral, or the wedding, or the cow.',
        objectives: [{ id: 'hulda', text: 'Call on Old Hulda at Brackenhow', talk: 'npc:old-hulda', marker: { landmark: 'landmark:brackenhow' } }],
        next: 'eskil',
      },
      {
        id: 'eskil', journal: 'She is fine. She is furious. She has a message for the relay, and most of it cannot be drummed in company.',
        objectives: [{ id: 'eskil', text: 'Bring Hulda’s message back to Eskil', talk: 'npc:eskil-ottarsson', marker: { landmark: 'landmark:relay-stead' } }],
        next: 'middle',
      },
      {
        id: 'middle', journal: 'Eskil wants to know where the news went wrong. Halfway between here and Brackenhow, the middle stead drums everything on.',
        objectives: [{ id: 'middle', text: 'Find out what is wrong at the middle stead', interact: 'obj:skald-middle-stead-drum', marker: { place: Z2 } }],
        onComplete: [{ setFlag: 'skald.relay_mended', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40 },
  },
  {
    ...A1, id: 'quest:skald-what-the-fell-said', name: 'What the Fell Said', type: 'side', region: Z2, giver: 'npc:old-gunnvor',
    summary: 'Shout from the top of Scarrow Pike, says Old Gunnvor, and the echo comes back in her husband’s voice, finishing a sentence he started forty years ago. She has never been able to climb up and hear the end.',
    requires: req(done('quest:skald-the-drum-relay')), firstStage: 'shout',
    stages: [
      {
        id: 'shout', journal: 'The cairn on top of Scarrow Pike. Shout his name, Gunnvor says, and wait.',
        objectives: [{ id: 'cairn', text: 'Shout from the cairn on Scarrow Pike', interact: 'obj:scarrow-pike-cairn', marker: { landmark: 'landmark:scarrow-pike' } }],
        next: 'gunnvor',
      },
      {
        id: 'gunnvor', journal: 'You heard the end of the sentence.',
        objectives: [{ id: 'gunnvor', text: 'Tell Gunnvor what the Fell said', talk: 'npc:old-gunnvor', marker: { landmark: 'landmark:scarrow-pike' } }],
        next: 'ledge',
      },
      {
        id: 'ledge', journal: 'Gunnvor has an answer for Torsten, forty years late. She wants it said where he slipped, on the ledge halfway up the Pike, so the Fell will keep it for him.',
        objectives: [{ id: 'ledge', text: 'Give Gunnvor’s answer to the Fell, at Torsten’s ledge', interact: 'obj:skald-torsten-ledge', marker: { landmark: 'landmark:scarrow-pike' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-echoing-fells'] },
  },
  {
    ...A1, id: 'quest:skald-the-lost-flock', name: 'The Lost Flock', type: 'side', region: Z2, giver: 'npc:shepherd-kolbein',
    summary: 'The echo of a dog-whistle is calling Kolbein’s sheep into the tarns, and Kolbein’s dog has been dead nine years.',
    requires: req(done('quest:skald-the-drum-relay')), firstStage: 'wisp',
    stages: [
      {
        id: 'wisp', journal: 'Something at the Whistling Tarn is whistling. It is not a dog.',
        objectives: [{ id: 'wisp', text: 'Find what is whistling at the tarn', kill: 'bx_song_0', count: 1, marker: { landmark: 'landmark:whistling-tarn' } }],
        next: 'kolbein',
      },
      {
        id: 'kolbein', journal: 'A hollow Siren Wisp, whistling an old dog’s whistle off the water. It is quiet now.',
        objectives: [{ id: 'kolbein', text: 'Tell Kolbein his flock is safe', talk: 'npc:shepherd-kolbein', marker: { landmark: 'landmark:whistling-tarn' } }],
        next: 'cairn',
      },
      {
        id: 'cairn', journal: 'Old Fetch is buried by the tarn wall, and Kolbein has never once put a stone on him. He has given you Fetch’s collar.',
        objectives: [{ id: 'cairn', text: 'Put a stone on Fetch’s grave by the tarn wall', interact: 'obj:skald-fetch-grave', marker: { place: Z2 } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 50 },
  },
  {
    ...A1, id: 'quest:skald-the-stone-with-no-saga', name: 'The Stone with No Saga', type: 'side', region: Z3, giver: 'npc:hall-reeve-brynja',
    summary: 'One standing stone among the Saga Stones has never been carved. The Halls say it waits for a saga not yet sung. Lately Ulf has been sitting beside it after dark.',
    requires: req(done('quest:skald-ulf-comes-home')), firstStage: 'stone',
    stages: [
      {
        id: 'stone', journal: 'Look at the uncarved stone after dark, when Ulf has been at it.',
        objectives: [{ id: 'stone', text: 'Look at the Stone with No Saga, at night', when: { flag: 'skald.black_marks' }, marker: { landmark: 'landmark:stone-with-no-saga' } }],
        next: 'brynja',
      },
      {
        id: 'brynja', journal: 'Drum-marks on the uncarved stone, tapped in with a knuckle. Black ones. They are wet.',
        objectives: [{ id: 'brynja', text: 'Tell Hall-Reeve Brynja what you saw', talk: 'npc:hall-reeve-brynja', marker: { landmark: 'landmark:saga-hall' } }],
        next: 'ragna',
      },
      {
        id: 'ragna', journal: 'Brynja says Ragna raised him, and ought to hear it before the Halls do.',
        objectives: [{ id: 'ragna', text: 'Tell Ragna about the marks on the stone', talk: RG, marker: HEARTH }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40 },
  },
  {
    ...A1, id: 'quest:skald-rubbings', name: 'Rubbings', type: 'side', region: Z3, giver: 'npc:asta',
    summary: 'A girl called Asta is taking charcoal rubbings of the sagas before they wear away. She has run out of paper, and she has twenty stones to go.',
    requires: req(done('quest:skald-ulf-comes-home')), firstStage: 'paper',
    stages: [
      {
        id: 'paper', journal: 'Paper is scarce on the Fells. Look in the Saga Hall, the drum-maker’s and anywhere somebody wraps things.',
        objectives: [{ id: 'paper', text: 'Find paper for Asta', interact: 'obj:rubbing-paper-*', count: 3, marker: { place: Z1 } }],
        next: 'asta',
      },
      {
        id: 'asta', journal: 'A good thick bundle. Enough for twenty stones, if she writes small.',
        objectives: [{ id: 'asta', text: 'Bring the paper to Asta', talk: 'npc:asta', marker: RING }],
        onComplete: [{ setFlag: 'skald.asta_rubbings', value: true }],
        next: 'last',
      },
      {
        id: 'last', journal: 'There is one more stone Asta wants: the oldest, out by the old drove track beyond the ring, so worn that she can hardly feel the letters any more.',
        objectives: [{ id: 'last', text: 'Help Asta rub the last legible stone', interact: 'obj:skald-drove-stone', marker: { place: Z3 } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 30 },
  },
  {
    ...A1, id: 'quest:skald-egg-song', name: 'Egg-Song', type: 'side', region: Z4, giver: 'npc:thora-cragfoot',
    summary: 'Harpy eggs that hum lullabies fetch a fortune in the Lyrehaven market. Egg-thieves have taken a clutch off the Harpy Cliffs, and Thora Cragfoot wants them back where they came from.',
    requires: req(done('quest:skald-the-blank-stones')), firstStage: 'crates',
    stages: [
      {
        id: 'crates', journal: 'The egg-thieves have a camp in a gully under the cliffs. The crates are humming.',
        objectives: [{ id: 'crates', text: 'Find the egg-thieves’ crates', interact: 'obj:egg-thief-crates', marker: { landmark: 'landmark:egg-thieves-camp' } }],
        next: 'thora',
      },
      {
        id: 'thora', journal: 'Whatever you did with the eggs, Thora will want to hear it.',
        objectives: [{ id: 'thora', text: 'Go back to Thora Cragfoot', talk: 'npc:thora-cragfoot', marker: { landmark: 'landmark:egg-thieves-camp' } }],
        next: 'tenth',
      },
      {
        id: 'tenth', journal: 'There were ten eggs, not nine. Thora kept the tenth back because it was not humming anything at all. Nobody ever sang over it.',
        objectives: [{ id: 'tenth', text: 'Take the silent egg up to a cliff ledge', interact: 'obj:skald-silent-egg', marker: { place: Z4 } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 60 },
  },
  {
    ...A1, id: 'quest:skald-the-fog-drummer', name: 'The Fog-Drummer', type: 'side', region: Z4, giver: 'npc:old-haldor',
    summary: 'Old Haldor drums ships off the Harpy Cliffs when the fog comes in, and his drum-skin is splitting. If it goes in a fog, a ship goes with it.',
    requires: req(done('quest:skald-the-blank-stones')), firstStage: 'hide',
    stages: [
      {
        id: 'hide', journal: 'Haldor wants a seal-hide, cured, from the old boathouse at the cliff-foot. Nothing else carries in fog.',
        objectives: [{ id: 'hide', text: 'Fetch a seal-hide from the old boathouse', interact: 'obj:boathouse-seal-hide', marker: { place: Z4 } }],
        next: 'haldor',
      },
      {
        id: 'haldor', journal: 'A good hide, stiff with salt. Haldor will want to hear it before he trusts it.',
        objectives: [{ id: 'haldor', text: 'Bring the hide to the fog-drum', talk: 'npc:old-haldor', marker: { landmark: 'landmark:fog-drum' } }],
        next: 'fog',
      },
      {
        id: 'fog', journal: 'Haldor says a new skin is only proved in a real fog, after dark, with something out on the water. Fog is due tonight. Drum her yourself.',
        objectives: [{ id: 'fog', text: 'Drum the fog-drum in the night fog', when: { flag: 'skald.fog_drummed' }, marker: { landmark: 'landmark:fog-drum' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'a_song_fur_hands' }] },
  },

  // ======================= ACT I: mentor thread (2) and bounties (2)
  {
    ...A1, id: 'quest:skald-the-saga-of-nobody-much', name: 'The Saga of Nobody Much', type: 'side', region: Z2, giver: RG,
    summary: 'Ragna’s oldest saga is not about a hero. It is about a shepherd who did nothing great his whole life. She would sooner lose a king’s.',
    requires: req({ trust: RG, value: 'friendly' }, done('quest:skald-the-drum-relay')), firstStage: 'cairn',
    stages: [
      {
        id: 'cairn', journal: 'He has a cairn, Ragna says, on the lower Fells, by a wall he built. Go and put a stone on it.',
        objectives: [{ id: 'cairn', text: 'Put a stone on the shepherd’s cairn', interact: 'obj:nobody-much-cairn', marker: { place: Z2 } }],
        next: 'ragna',
      },
      {
        id: 'ragna', journal: 'A cairn no taller than your knee, and a dry-stone wall still standing after three hundred years.',
        objectives: [{ id: 'ragna', text: 'Ask Ragna to tell his saga', talk: RG, marker: HEARTH }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, skillPoints: 1 },
  },
  {
    ...A1, id: 'quest:skald-the-first-saga-she-lost', name: 'The First Saga She Lost', type: 'side', region: Z2, giver: RG,
    summary: 'Last spring Ragna lost her first saga, the one she learned at her own grandmother’s knee. It survives only as an echo, scattered across four tarns on the Fells.',
    requires: req({ trust: RG, value: 'trusted' }, done('quest:skald-ulf-comes-home')), firstStage: 'tarns',
    stages: [
      {
        id: 'tarns', journal: 'Four tarns, four verses. Stand at the edge of each and listen for an old woman’s voice saying it the way she said it at seven.',
        objectives: [{ id: 'tarns', text: 'Gather the verses from the four tarns', interact: 'obj:saga-tarn-*', count: 4, marker: { place: Z2 } }],
        next: 'ragna',
      },
      {
        id: 'ragna', journal: 'You have all four verses. You have to drum them back to her.',
        objectives: [{ id: 'ragna', text: 'Drum Ragna her first saga', talk: RG, marker: HEARTH }],
        onComplete: [{ setFlag: 'skald.ragna_devotable', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:skald-bounty-old-screel', name: 'Bounty: Old Screel', type: 'bounty', region: Z4, giver: AR,
    summary: 'A Songbird Harpy the size of a barn door has been taking lambs off the high steads and singing about it afterwards.',
    requires: req(done('quest:skald-the-blank-stones')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'Old Screel hunts the cliff-tops at noon. You will hear her before you see her. You will hear her for days afterwards.', objectives: [{ id: 'screel', text: 'Bring down Old Screel', kill: 'bx_song_1', count: 1, marker: { place: Z4 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 150 },
  },
  {
    ...A1, id: 'quest:skald-bounty-tarn-wisps', name: 'Bounty: the Tarn Wisps', type: 'bounty', region: Z2, giver: AR,
    summary: 'Siren Wisps are rising off the tarns at dusk and singing the shepherds to sleep where they stand.',
    requires: req(done('quest:skald-the-drum-relay')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'Six of them, Arvid reckons, and paid by the wisp. Keep drumming so you stay awake.', objectives: [{ id: 'wisps', text: 'Defeat the Tarn Wisps', kill: 'bx_song_0', count: 6, marker: { place: Z2 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 120 },
  },

  // ======================= ACT II: the class thread (C-1 … C-6) + featured bearers
  // depth pass (wave 2): the Fish Mill’s drum-loft, telling Hallgerd, Ebba and her hounds to the Gloamwood treeline,
  // Ulf’s camp in the Deep Glade, and an answer drummed home
  {
    ...A2, id: 'quest:skald-abbeyshore', name: 'The Drummers at the Fish Mill', type: 'class', region: 'vil:shore', giver: 'npc:wil',
    summary: 'There are Fells-folk in Concordia, stranded since the arches shut. The Gilded Goose was the Song school’s inn in the Concord’s day, and Wil Crane keeps its book.',
    requires: req(done('quest:cc-through-the-arch')), autoStart: true, firstStage: 'goose',
    stages: [
      {
        id: 'goose', journal: 'Every Song-folk traveller in Concordia used to sign the book at the Gilded Goose, drummers too. Wil Crane will know where the Fells-folk went.',
        objectives: [{ id: 'wil', text: 'Ask Wil Crane about the Fells-folk', talk: 'npc:wil', marker: { landmark: 'landmark:brind-gilded-goose' } }],
        next: 'mill',
      },
      {
        id: 'mill', journal: 'The Fells exiles drum the drowned choir’s names from the Old Fish Mill every night, so someone is still saying them.',
        objectives: [{ id: 'hallgerd', text: 'Find the drummers at the Old Fish Mill', talk: 'npc:old-hallgerd', marker: { landmark: 'landmark:shore-fish-mill' } }],
        next: 'loft',
      },
      {
        id: 'loft', journal: 'The exiles drum from the Fish Mill’s old loft, over the wheel. Hallgerd says if you’re sitting, you’re drumming, and there is a spare drum.',
        objectives: [{ id: 'loft', text: 'Drum the night’s names in the Fish Mill loft', interact: 'obj:skald-mill-loft', marker: { landmark: 'landmark:shore-fish-mill' } }],
        onComplete: [{ startQuest: 'quest:skald-under-the-lake' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-song-exiles'] },
  },
  {
    ...A2, id: 'quest:skald-under-the-lake', name: 'Under the Lake', type: 'class', region: 'region:abbey', giver: 'npc:old-hallgerd',
    summary: 'The drowned choir under the Abbey lake is the Song school’s Sentinel, with its Abbess. The Fish Mill drummers have lost three of their names, and the Abbess will want all forty.',
    requires: req(done('quest:skald-abbeyshore')), firstStage: 'names',
    stages: [
      {
        id: 'names', journal: 'Three names lost. Hallgerd thinks the shore still has them, if anyone looks: on the wood the lake gives back.',
        objectives: [{ id: 'names', text: 'Find the three lost names on the shore', interact: 'obj:lost-name-*', count: 3, marker: { landmark: 'landmark:shore-fish-mill' } }],
        onComplete: [{ setFlag: 'skald.lost_names', value: true }],
        next: [{ when: { flag: 'skald.stones', value: 'great' }, to: 'down' }, { to: 'tamsin' }],
      },
      {
        id: 'tamsin', journal: 'Tamsin the ferrywoman can take you out over the nave, for a copper and a story.',
        objectives: [{ id: 'tamsin', text: 'Ask Tamsin to row you over the nave', talk: 'npc:tamsin', marker: { landmark: 'landmark:shore-ferry-house' } }],
        next: 'drum',
      },
      {
        id: 'drum', journal: 'Drum the choir’s names on the water, all forty, and the nave will open for you.',
        objectives: [{ id: 'drum', text: 'Drum the choir’s names on the water', interact: 'obj:nave-name-drum', marker: { region: 'region:abbey' } }],
        next: 'down',
      },
      {
        id: 'down', journal: 'Down through the flooded cloister to the Abbess.',
        objectives: [{ id: 'abbey', text: 'Go down into the Drowned Abbey', reach: 'inst:drowned-abbey', marker: { region: 'region:abbey' } }],
        onComplete: [{ openDialogue: 'dialogue:skald-into-the-nave' }, { startQuest: 'quest:skald-abbess-morwen' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-drowned-choir'] },
  },
  {
    ...A2, id: 'quest:skald-abbess-morwen', name: 'Abbess Morwen', type: 'class', region: 'region:abbey', giver: 'npc:old-hallgerd',
    summary: 'Abbess Morwen drowned holding the Turning Bell’s rope, and her choir drowned singing round her. They are the Sentinel of the Song school, and they want silence.',
    requires: req(done('quest:skald-under-the-lake')), firstStage: 'fight',
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
        id: 'stalls', journal: 'The choir has gone back to its stalls. The Abbess is reading the names on them, and three are missing.',
        objectives: [{ id: 'stalls', text: 'Give the Abbess the three lost names', interact: 'obj:drowned-choir-stalls', marker: { region: 'region:abbey' } }],
        next: 'tell',
      },
      {
        id: 'tell', journal: 'Up at the Fish Mill the drummers missed a beat tonight, for the first time in thirty years. Hallgerd will want to know why from you.',
        objectives: [{ id: 'hallgerd', text: 'Tell Hallgerd the Abbess has all forty names', talk: 'npc:old-hallgerd', marker: { landmark: 'landmark:shore-fish-mill' } }],
        onComplete: [{ startQuest: 'quest:skald-the-drum-in-the-glade' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-song-sentinel'] },
  },
  {
    ...A2, id: 'quest:skald-the-drum-in-the-glade', name: 'The Drum in the Glade', type: 'class', region: 'region:gloam', giver: 'npc:ebba-coldrey',
    summary: 'The hounds at Hollis Lodge will not stop howling at a drumbeat out in the Gloamwood that nobody else can find. You know that beat.',
    requires: req(done('quest:skald-abbess-morwen')), firstStage: 'ebba',
    stages: [
      {
        id: 'ebba', journal: 'Ebba Coldrey keeps the kennels at Hollis Lodge. Her hounds have been howling at a drum for a week.',
        objectives: [{ id: 'ebba', text: 'Ask at the Hollis Lodge kennels', talk: 'npc:ebba-coldrey', marker: { landmark: 'landmark:lodge-kennels' } }],
        next: 'escort',
      },
      {
        id: 'escort', journal: 'Ebba is coming with you, with two hounds on a couple, to find the one that ran off after the drum three nights ago. The Gloamwood is full of wolves that walk into firelight. Get her to the treeline above the Stag’s glade alive.',
        onEnter: [{ escort: 'npc:ebba-coldrey', to: 'landmark:skald-gloam-treeline' }],
        objectives: [{ id: 'ebba', text: 'Bring Ebba Coldrey safely to the treeline above the glade', when: { any: [{ flag: 'escort.ebba-coldrey', op: '==', value: 'arrived' }, { flag: 'escort.ebba-coldrey', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:skald-gloam-treeline' } }],
        next: [{ when: { flag: 'escort.ebba-coldrey', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'hound' }],
      },
      {
        id: 'regroup', journal: 'Ebba went down, and her hounds dragged her home to the kennels by the coat, which she says is what they are for. She has bound her arm and is whistling them up to try again.',
        onEnter: [{ escort: 'npc:ebba-coldrey', to: 'landmark:skald-gloam-treeline' }],
        objectives: [{ id: 'ebba', text: 'Try again: bring Ebba to the treeline above the glade', when: { any: [{ flag: 'escort.ebba-coldrey', op: '==', value: 'arrived' }, { flag: 'escort.ebba-coldrey', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:skald-gloam-treeline' } }],
        next: [{ when: { flag: 'escort.ebba-coldrey', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'hound' }],
      },
      {
        id: 'hound', journal: 'At the treeline Ebba has stopped dead, and both her hounds are wagging. Something is lying across the path ahead.',
        objectives: [{ id: 'ebba', text: 'See what Ebba has found at the treeline', talk: 'npc:ebba-coldrey', marker: { landmark: 'landmark:skald-gloam-treeline' } }],
        next: 'glade',
      },
      {
        id: 'glade', journal: 'The drumming comes from the White Stag’s glade, at dusk, when the Stag walks.',
        objectives: [{ id: 'drum', text: 'Find the drum in the Stag’s glade', interact: 'obj:ulf-glade-drum', marker: { landmark: 'landmark:gloam-stag-glade' } }],
        onComplete: [{ setFlag: 'skald.ulf_trail', value: true }, { startQuest: 'quest:skald-the-white-stag' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:skald-the-white-stag', name: 'The White Stag', type: 'class', region: 'region:gloam', giver: 'npc:ebba-coldrey',
    summary: 'Ulf has been drumming for the White Stag that once led the Turning procession, asking it to lead him to the King. The Stag has been following him into the deep glade. The Hunt bearers cannot win its mark while it grieves.',
    requires: req(done('quest:skald-the-drum-in-the-glade')), firstStage: 'deep',
    stages: [
      {
        id: 'deep', journal: 'Into the Deep Glade, where the Stag has gone to ground.',
        objectives: [{ id: 'lair', text: 'Follow the Stag into the Deep Glade', reach: 'inst:sentinel-hunt', marker: { landmark: 'landmark:gloam-stag-glade' } }],
        next: 'stag',
      },
      {
        id: 'stag', journal: 'The White Stag is the Sentinel of the Hunt school. Free it, and the Falconer bearer can claim Hunt’s mark.',
        objectives: [{ id: 'stag', text: 'Free the White Stag', kill: 'bx_stag', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-hunt' }, { setFlag: 'story.bearer.falconer', value: true }],
        next: 'saga',
      },
      {
        id: 'saga', journal: 'It isn’t sick. It’s grieving. Nobody has drummed it its own saga in thirty years.',
        objectives: [{ id: 'saga', text: 'Drum the White Stag its saga', interact: 'obj:stag-glade-drumstone' }],
        next: 'camp',
      },
      {
        id: 'camp', journal: 'Where the Stag lay down, a hollow under the roots has a fire-ring in it, cold, and a drum-case you know. Ulf slept here.',
        objectives: [{ id: 'camp', text: 'Search Ulf’s camp in the Deep Glade', interact: 'obj:skald-ulf-camp' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-skald-stag'] },
  },
  {
    ...A2, id: 'quest:skald-ragnas-drum-letter', name: 'Ragna’s Drum-Letter', type: 'class', region: 'vil:brind', giver: RG,
    summary: 'Someone is drumming on the far side of the Song arch in the Fells’ long-message beat, and Pip, who listens to everything, has been writing it down.',
    requires: req(done('quest:skald-the-white-stag'), done('quest:cc-stone-court')), autoStart: true, firstStage: 'arch',
    stages: [
      {
        id: 'arch', journal: 'A drum, very faint, on the far side of the Song arch in the Gate Circle. Go and listen.',
        objectives: [{ id: 'arch', text: 'Listen at the Song arch', interact: 'obj:song-arch-drum', marker: { landmark: 'landmark:gate-circle' } }],
        next: 'pip',
      },
      {
        id: 'pip', journal: 'Ragna, in the long-message beat. Pip has been sitting under the arch since dawn with a slate, writing it all down.',
        objectives: [{ id: 'pip', text: 'Ask Pip what the drum said', talk: 'npc:pip', marker: { landmark: 'landmark:brind-green' } }],
        next: 'duet',
      },
      {
        id: 'duet', journal: 'The Bard bearer’s half and yours have been humming at each other across the Stone Court. One of them is a beat behind. Try a duet.',
        objectives: [{ id: 'duet', text: 'Drum with the Bard bearer at the Stone Court', interact: 'obj:song-court-duet', marker: { landmark: 'landmark:stone-court' } }],
        next: 'reply',
      },
      {
        id: 'reply', journal: 'Ragna is still drumming beyond the Song arch, a little slower each time, the way she does when she is waiting for an answer. On the Fells you drum back, or it is rude.',
        objectives: [{ id: 'reply', text: 'Drum Ragna an answer through the Song arch', interact: 'obj:skald-arch-reply', marker: { landmark: 'landmark:gate-circle' } }],
        onComplete: [{ setFlag: 'story.act2_ready', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:skald-the-cantors-dirge', name: 'The Cantor’s Dirge', type: 'side', region: 'vil:shore', giver: 'npc:bearer-cantor',
    summary: 'The Cantor bearer has come to Abbeyshore to sing the drowned choir’s dirge, and will not sing the dark verses. Somebody has to, or the dirge has a hole in it.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'dirge',
    stages: [
      {
        id: 'dirge', journal: 'The dirge-stone stands on the shore below the Shore Chapel, facing the lake. The Cantor sings the light verses; you drum the dark ones.',
        objectives: [{ id: 'dirge', text: 'Drum the dark verses of the dirge', interact: 'obj:shore-dirge-stone', marker: { landmark: 'landmark:shore-chapel' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Seraphina Dawe wants a word at the Stone Court.',
        // co-op: if a party member plays the Cantor, they ARE this bearer (the NPC is hidden)
        objectives: [{ id: 'seraphina', text: 'Talk to the Cantor bearer', when: { any: [{ flag: 'skald.seraphina_thanked' }, { partyHasClass: 'cantor' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.cantor', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A2, id: 'quest:skald-the-rangers-mercy', name: 'The Ranger’s Mercy', type: 'side', region: 'region:gloam', giver: 'npc:bearer-ranger',
    summary: 'The Ranger bearer has been sitting in a hide above the White Stag’s glade for three days with one arrow on the string. They mean to end the Stag’s grief with it.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'hide',
    stages: [
      {
        id: 'hide', journal: 'A hide of woven branches above the glade. Rowan Thornbury has not slept.',
        objectives: [{ id: 'hide', text: 'Climb up to the Ranger’s hide', interact: 'obj:ranger-hide', marker: { landmark: 'landmark:gloam-stag-glade' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Whatever was decided in the hide, Rowan wants to talk it over at the Stone Court.',
        objectives: [{ id: 'rowan', text: 'Talk to the Ranger bearer', when: { any: [{ flag: 'skald.rowan_thanked' }, { partyHasClass: 'ranger' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.ranger', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  // ======================= ACT III: class quests (III-4 + 3 side)
  {
    ...A3, id: 'quest:skald-the-unsung-chimera', name: 'The Unsung Chimera', type: 'class', region: 'region:heart', giver: 'npc:casimir',
    summary: 'At the top of the Twelve Stairs waits a beast stitched from every school, with a war-drum for a chest and black-tear sagas cut into its hide. The drum is beating in the old hand-beat. It is Ulf.',
    requires: req(done('quest:heart-stairs')), autoStart: true, firstStage: 'herald',
    stages: [
      { id: 'herald', journal: 'Ulf has been bound into the Union Chimera as its heart. Every saga he ever drummed is cut into its hide in black, and not one of them has his name in.', objectives: [{ id: 'herald', text: 'Face the Unsung Chimera', kill: 'cb_the-unsung-chimera', count: 1, marker: { landmark: 'landmark:twelve-stairs-top' } }], onComplete: [{ openDialogue: 'dialogue:skald-herald-fate' }], next: 'fate' },
      { id: 'fate', journal: 'The Chimera has yielded on the stair. The war-drum in its chest is still beating, slower now, waiting for you.', objectives: [{ id: 'fate', text: 'Decide Ulf’s fate', when: { flag: 'skald.nemesis_fate' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 3 },
  },
  {
    ...A3, id: 'quest:skald-the-nine-hundred-and-first', name: 'The Nine-Hundred-and-First', type: 'side', region: 'region:heart', giver: RG,
    summary: 'A drum is beating in the Fells’ long-message beat at the Heart camp, relayed valley to valley all the way from the Song arch. Pip is sitting beside it with his slate.',
    requires: req(done('quest:heart-legion')), autoStart: true, firstStage: 'relay',
    stages: [
      { id: 'relay', journal: 'Ragna is drumming again, from very far away. Pip is writing it down at the Heart camp.', objectives: [{ id: 'relay', text: 'Hear Ragna’s drum-letter at the Heart camp', interact: 'obj:skald-camp-drum', marker: { landmark: 'landmark:heart-camp' } }], next: 'post' },
      {
        id: 'post', journal: 'The relay that carried Ragna’s letter ends at a drum on a post where the camp meets the road. Whoever sits at it will carry your saga the first mile home. Go and see who it is.',
        objectives: [{ id: 'post', text: 'Find the last relay post at the edge of the Heart camp', interact: 'obj:skald-relay-post', marker: { landmark: 'landmark:heart-camp' } }],
        next: 'drum',
      },
      { id: 'drum', journal: 'Ragna wants one new saga before she forgets the rest: yours. Drum it from the head of the Song stair, and the relay will carry it home.', objectives: [{ id: 'drum', text: 'Drum your saga at the head of the Song stair', interact: 'obj:skald-saga-drum', marker: { landmark: 'landmark:twelve-stairs-top' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A3, id: 'quest:skald-the-hollow-skalds', name: 'The Hollow Skalds', type: 'side', region: 'region:heart', giver: RG,
    summary: 'When the Maestro took the Fells’ voices, some Skalds followed his choir to the Lyre Gate and on into the Heart. Three of them are standing in the Legion with their drums slack.',
    requires: req(done('quest:heart-legion')), autoStart: true, firstStage: 'names',
    stages: [
      { id: 'names', journal: 'Three Skalds from the Fells, hollow, in the Legion’s ranks. A name nobody says is a name that’s gone. Drum them theirs.', objectives: [{ id: 'skalds', text: 'Drum the hollow Skalds their names', interact: 'obj:skald-hollow-skald-*', count: 3, marker: { landmark: 'landmark:legion-camp' } }], next: 'roll' },
      {
        id: 'roll', journal: 'The three Skalds will not walk home while their marks are still on the Legion’s muster-board. A Skald does not leave owing a muster. Strike them off.',
        objectives: [{ id: 'roll', text: 'Strike the Skalds off the Legion’s muster-board', interact: 'obj:skald-legion-muster', marker: { landmark: 'landmark:legion-camp' } }],
        next: 'cask',
      },
      {
        id: 'cask', journal: 'Bersi says somebody owes everyone a drink, and he is looking at you. There is a cask on the supply cart at the Heart camp.',
        objectives: [{ id: 'cask', text: 'Stand the Skalds a drink at the Heart camp', interact: 'obj:skald-camp-cask', marker: { landmark: 'landmark:heart-camp' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A3, id: 'quest:skald-a-stone-for-ulf', name: 'A Stone for Ulf', type: 'side', region: 'region:heart', giver: 'npc:hall-reeve-brynja',
    summary: 'The Stone with No Saga was the one Ulf meant for himself. Nobody ever cut his saga, in tears or in anything else. There is a loose stair-stone at the head of the Song stair.',
    requires: req(done('quest:skald-the-unsung-chimera'), done('quest:skald-the-stone-with-no-saga')), autoStart: true, firstStage: 'cut',
    stages: [
      { id: 'cut', journal: 'Cut Ulf’s saga on a stair-stone in the Heart, in plain stone, with no black in it.', objectives: [{ id: 'cut', text: 'Cut Ulf’s saga at the head of the Song stair', interact: 'obj:skald-stair-stone', marker: { landmark: 'landmark:twelve-stairs-top' } }], next: 'relay' },
      {
        id: 'relay', journal: 'A stone in the Heart is a long way from the Fells. The relay could carry Ulf’s saga home to the Stone with No Saga, beat by beat, if the last post at the Heart camp will take it.',
        objectives: [{ id: 'relay', text: 'Give Ulf’s saga to the relay post at the Heart camp', interact: 'obj:skald-relay-post', marker: { landmark: 'landmark:heart-camp' } }],
        next: 'beat',
      },
      {
        id: 'beat', journal: 'The relay drums every name in its own name-beat, given to a child at its first singing in the Saga Hall. Ulf never sang, so on the relay he has only ever been “the drummer”. Make him a name-beat on the Legion’s great drum, where the King’s summons was drummed.',
        objectives: [{ id: 'beat', text: 'Drum Ulf a name-beat on the Legion’s great drum', interact: 'obj:skald-legion-drum', marker: { landmark: 'landmark:legion-camp' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
];

export default quests;
