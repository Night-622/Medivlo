/** Hollow Crown, SKALD Act I main dialogues (the Echoing Fells). Owner: Claude 4. */
import type { DialogueDef } from '@/core';

const RG = 'npc:ragna-saga-keeper' as const, UL = 'npc:ulf-the-unsung' as const;
const BR = 'npc:hall-reeve-brynja' as const, YS = 'npc:ylva-stillwater' as const;

/** I-2: the three relay drums between the Drum-Steads and the high Fells */
const relay = (n: number, drum: string, back: string, plain: string): DialogueDef => ({
  id: `dialogue:obj-relay-drum-${n}`, name: `I-2 relay drum ${n}`,
  entries: [{ when: { questStage: 'quest:skald-the-drum-relay', stage: 'drums' }, node: 'drum' }, { node: 'plain' }],
  nodes: {
    drum: { speaker: 'narrator', text: drum, next: 'back' },
    back: { speaker: 'narrator', text: back, next: null },
    plain: { speaker: 'narrator', text: plain, next: null },
  },
});

const dialogues: DialogueDef[] = [
  // ---------- I-1 The Bell on the Fells
  {
    id: 'dialogue:skald-drum-watch', name: 'I-1 drum-watch at the Drum-Steads', scope: 'party',
    entries: [{ node: 'watch' }],
    nodes: {
      watch: { speaker: 'narrator', text: 'Night on drum-watch at the Drum-Steads: a fire, a drum, a cold backside and three hundred sheep who do not care. You have been drumming the watch-beat since dusk so the next valley knows the steads are still here.', next: 'bell' },
      bell: { speaker: 'narrator', text: 'Then, very far away, a bell rings once. The Fells take it and throw it back changed, crag to crag, valley to valley, and by the time the echo reaches you it is not a bell any more. It is your own name: {player.name}, {player.name}, {player.name}.', next: 'answer' },
      answer: {
        speaker: 'narrator', text: 'Your name comes back again and again from every crag, until the whole dark is saying it. The sheep look at you. They have never known your name before.',
        choices: [
          { text: '(Drum back the old question-beat: who calls?)', to: 'who' },
          { text: '(Stop drumming, and listen.)', to: 'listen' },
          { text: '(Shout your name back at the Fells three times, the old way.)', to: 'shout', school: 'song' },
        ],
      },
      who: { speaker: 'narrator', text: 'You drum the question. The Fells answer with the only thing they have, your name, and under it, very faint, a note, like something singing under the ground.', next: 'drums' },
      listen: { speaker: 'narrator', text: 'You stop. The Fells do not. Your name comes back twice more, softer each time, and then a note follows it, high and clear, from somewhere under the Saga Stones.', next: 'drums' },
      shout: { speaker: 'narrator', text: 'You shout it back three times, the way Skalds answer an echo so it knows it has been heard. The Fells go quiet, satisfied. Then, from under the Saga Stones, something sings.', next: 'drums' },
      drums: { speaker: 'narrator', text: 'Every drum on every stead beats once, by itself, all at the same moment. Out of the dark above the sheepfolds comes a shrieking, and the harpies drop.', next: null },
    },
  },
  {
    id: 'dialogue:skald-fell-half', name: 'I-1 the Fell half wakes', scope: 'party',
    entries: [{ node: 'sing' }],
    nodes: {
      sing: { speaker: 'narrator', text: 'The harpies are gone, back to the cliffs. In the quiet, something under your ribs has started to sing. Far off, under the Saga Stones, something answers it, and the Fells carry the answer back to you three times over.', next: 'steads' },
      steads: { speaker: 'narrator', text: 'All along the Drum-Steads lamps are being lit, and stead-wives are shouting across the folds to ask whose drum beat by itself. Every drum did. Nobody’s did.', next: 'lamp' },
      lamp: { speaker: 'narrator', text: 'Down at the end of the steads, in Ragna’s window, a lamp comes on.', next: null },
    },
  },
  {
    id: 'dialogue:skald-ragna-bell', name: 'I-1 Ragna at her hearth', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: RG, text: 'Was that a bell? It was a bell. I had the whole Saga of Hrolf Two-Hats in my head when I lay down, little one, and I sat up for the bell and now I have got nothing, and one slipper. Which hat was the second hat?',
        choices: [
          { text: 'The Fells threw my name back at me.', to: 'name' },
          { text: 'I’ll find your other slipper.', to: 'slipper', trust: 1 },
        ],
      },
      slipper: { speaker: RG, mood: 'happy', text: 'Under the dog. It is always under the dog. Thank you. Now. The bell.', next: 'name' },
      name: {
        speaker: RG, text: 'Your name? The Fells keep what is said on them, and they give it back when it matters. Something under the Saga Stones has been waiting thirty years to say your name. And now it is singing in you, isn’t it? I can hear it from here.',
        choices: [
          { text: 'Something is singing in my chest.', to: 'stone', insight: 'skald_stone_named' },
          { text: 'What rang?', to: 'rang' },
        ],
      },
      rang: { speaker: RG, text: 'The Turning Bell, under its lake, in Concordia. Thirty years since. Last time it rang the crown came round to us and the whole of Harmonia sang for a week. I remember that one. I will remember that one longest.', next: 'stone' },
      stone: { speaker: RG, text: 'Half the Song Stone fell on the Fells when the crown broke. The Saga Halls have a saga about it, which I have forgotten. But there is a drum-skin in the Hall that remembers it for me. Come up to the Hall with me now, while I still remember why.', next: null },
    },
  },
  // ---------- I-2 The Drum-Relay
  relay(1, 'The first relay drum stands on the hill above the Drum-Steads, its skin black with forty years of thumbs. You drum the news in the long-message beat: The Bell rang. The Bell rang. The Bell rang.',
    'Far off, faint, the next valley drums it on. Good. That is how it is supposed to go.', 'The first relay drum, on the hill above the steads.'),
  relay(2, 'Halfway up the Fells, the second relay drum, with a stone seat beside it worn into the shape of a great many drummers. You drum the news on.',
    'It comes back a little wrong, the way news does: The Bell rang. The Bell sang. Somebody two valleys over is drumming with their mittens on.', 'The second relay drum. Someone has left a mitten on it.'),
  relay(3, 'The high relay drum on the edge of the Fells. You drum the news out across the valleys and wait for the answer.',
    'It comes back from three valleys at once, in the same beat, all wrong: The Bell drowned. The Bell drowned. The Bell drowned. Under the drum, the tarn below is perfectly still, and black.', 'The high relay drum, looking out over the Fells.'),
  {
    id: 'dialogue:obj-hollow-echo-tarn', name: 'I-2 the hollow tarn',
    entries: [{ when: { questStage: 'quest:skald-the-drum-relay', stage: 'tarn' }, node: 'shout' }, { node: 'tarn' }],
    nodes: {
      shout: { speaker: 'narrator', text: 'Black tears stand on the surface of the tarn like oil. You shout across it, and the echo comes back. It has your words in it, every one, and no voice at all, like a coat with nobody inside.', next: null },
      tarn: { speaker: 'narrator', text: 'A high tarn, dark and still. You decide not to shout at it again.', next: null },
    },
  },
  {
    id: 'dialogue:skald-ragna-relay', name: 'I-2 the relay came back wrong', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: RG, text: 'The Bell drowned. Well, it did, once. Thirty years ago, with its Abbess holding on. The Fells always did like the sad version best. But three valleys at once? Something is wrong with the relay.',
        choices: [
          { text: 'The tarn echoes came back hollow. No voice in them.', to: 'hollow' },
          { text: 'Nobody has drummed from Hoddersgill for a week.', to: 'hall' },
        ],
      },
      hollow: { speaker: RG, mood: 'afraid', text: 'No voice. On the Fells. Where every word comes back louder than you said it. Then something is taking the voices out of the echoes, and I would like to know what, before it starts on the sagas.', next: 'hall' },
      hall: { speaker: RG, mood: 'angry', text: 'Hoddersgill. The relay runs through their hall, and the Discord has been sniffing round it all winter. If they have shut that hall up, every message on the Fells will come out the other end in pieces. Go and open it, little one. Loudly.', next: null },
    },
  },
  // ---------- I-3 The Discordant Hall
  {
    id: 'dialogue:skald-silent-hall', name: 'I-3 the silent feast', scope: 'party',
    entries: [{ node: 'hall' }],
    nodes: {
      hall: { speaker: 'narrator', text: 'Hoddersgill Hall is full. Forty Skalds at the long tables, the fires lit, the mead poured, and nobody making a sound. Their mouths move. Their drums sit in their laps. The mead in their cups is black, and the ones who drank it are staring at nothing.', next: 'bard' },
      bard: { speaker: 'narrator', text: 'In the high seat a long, lanky man in grey is playing a lute with no strings. Every silent chord blooms out of it in a ring, and where the ring passes, the drums on the tables stop trembling.', next: null },
    },
  },
  {
    id: 'dialogue:obj-hoddersgill-feast-drum', name: 'I-3 the feast-drum', scope: 'party',
    entries: [{ when: { questStage: 'quest:skald-the-discordant-hall', stage: 'feast' }, node: 'beat' }, { node: 'drum' }],
    nodes: {
      beat: {
        speaker: 'narrator', text: 'The feast-drum stands by the high seat, as big as a cart-wheel, untouched for a week.',
        choices: [
          { text: '(Beat the feast-beat, loud enough to shake the rafters.)', to: 'feast' },
          { text: '(Beat the toast-beat, the one that means somebody owes everyone a drink.)', to: 'toast', school: 'song' },
        ],
      },
      feast: { speaker: 'narrator', text: 'At the first beat forty Skalds sit up at once and carry on the argument they were having a week ago, mid-sentence, at the top of their voices. It is about whether a goose counts as livestock. Hoddersgill is itself again.', next: null },
      toast: { speaker: 'narrator', text: 'At the toast-beat forty Skalds sit up, cheer, and turn as one to look at the Thane of Hoddersgill, who sighs and reaches for his purse. Hoddersgill is itself again.', next: null },
      drum: { speaker: 'narrator', text: 'The feast-drum of Hoddersgill. Somebody is beating it badly, with great enthusiasm.', next: null },
    },
  },
  {
    id: 'dialogue:skald-ragna-hall', name: 'I-3 the hall is retaken', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: RG, mood: 'happy', text: 'Hoddersgill is drumming again? I heard it from here. They are arguing about geese. Good. A hall that argues is a hall that is alive.',
        choices: [{ text: 'The Discord Bard drank the hall’s voice.', to: 'voice' }, { text: 'It was a good fight.', to: 'news', trust: 1 }],
      },
      voice: { speaker: RG, text: 'And now it has gone back where it lives, in forty loud mouths. You did well. Sit down, there is something else on the relay.', next: 'news' },
      news: { speaker: RG, mood: 'afraid', text: 'The Saga Stones are drumming. A man walked out of the mist there last night with a drum on his back, after seven years away. He has been re-cutting the worn sagas by moonlight. (Her cup is shaking.) Go and look, little one. I can’t. Not yet.', next: null },
    },
  },
  // ---------- I-4 Ulf Comes Home
  {
    id: 'dialogue:skald-ulf-home', name: 'I-4 Ulf at the Saga Stones', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'A broad man in a travel-worn cloak is sitting on the one uncarved stone in the ring, a chisel in one hand and a drum on his knee. He looks up. He has not changed at all, and he has changed completely. It is Ulf.', next: 'drum' },
      drum: {
        speaker: UL, mood: 'happy', text: '(He drums, in the old hand-beat Ragna taught you both: Little one. You got tall.)',
        choices: [
          { text: 'Ulf! Where have you been? Say something.', to: 'say' },
          { text: '(Drum it back: You got old.)', to: 'old', trust: 1 },
        ],
      },
      old: { speaker: UL, mood: 'happy', text: '(His shoulders shake. It is a laugh, with no sound in it.)', next: 'say' },
      say: { speaker: UL, mood: 'sad', text: '(He touches his throat, and drums: Can’t. Lyre Gate. The Maestro took it. Seven years ago. Took the little voice I had.)', next: 'stones' },
      stones: {
        speaker: UL, text: '(He nods at the stones around you, half of them worn smooth. Drums: They are going. All of them. I am cutting them deeper. So they last.)',
        choices: [
          { text: 'Ragna will want to see you.', to: 'ragna' },
          { text: 'Why at night?', to: 'night' },
        ],
      },
      night: { speaker: UL, text: '(Drum: Quieter. Nobody singing at me.) (He goes back to his chisel.)', next: 'ragna' },
      ragna: { speaker: UL, mood: 'sad', text: '(He is still for a long time. Then he drums, very softly: Tell her. I can’t. And then, after a while: Come up the Pike with me first. Like before.)', next: null },
    },
  },
  {
    id: 'dialogue:skald-ulf', name: 'Ulf (general)',
    entries: [{ node: 'u' }],
    nodes: { u: { speaker: UL, text: '(He keeps cutting. Drums, without looking up: Still here. Still listening.)', next: null } },
  },
  {
    id: 'dialogue:skald-ragna-ulf', name: 'I-4 Ragna hears Ulf is home', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: RG, mood: 'sad', text: 'Ulf. My Ulf. The one child I could never teach to sing. He was born Unsung, little one, no spark of any school in him at all, and he learned all nine hundred sagas anyway, by heart, by ear, by sitting under my table.', next: 'drum' },
      drum: {
        speaker: RG, text: 'They would not ring in his mouth, so he drummed them. Every one. Better than anyone. And now the Maestro has taken even the bit of voice he had for asking for the salt.',
        choices: [
          { text: 'He’s re-cutting the worn sagas, to make them last.', to: 'cut' },
          { text: 'He couldn’t face you.', to: 'face', trust: 1 },
        ],
      },
      face: { speaker: RG, mood: 'sad', text: 'No. He never could, when he was sad. He used to drum it at me from the byre instead. I will go to him when I can stand up straight about it.', next: 'cut' },
      cut: { speaker: RG, text: 'And the Halls have called a moot at the stones. They are wearing blank faster than anyone can cut them, and there is not stone or time to save them all. They want the stone-singer there. That is you.', next: null },
    },
  },
  // ---------- I-5 The Blank Stones (faction choice; a party vote)
  {
    id: 'dialogue:skald-blank-stones', name: 'I-5 the moot of the Saga Stones', scope: 'party',
    entries: [{ when: { not: { flag: 'skald.stones' } }, node: 'ring' }, { node: 'after' }],
    nodes: {
      ring: { speaker: 'narrator', text: 'The moot sits in the ring of the Saga Stones under a grey sky: the Halls on one side with their chisels, the Discord on the other in grey, and the whole of the Fells round the edge. Ulf sits on the uncarved stone with his drum in his lap.', next: 'brynja' },
      brynja: { speaker: BR, text: 'We have chisels and grit for one stone in three. So we cut the great sagas deep: the war-chiefs, the heroes, the founding of the Halls. The rest, we let go. It is hard. It is the Halls’ word.', next: 'ylva' },
      ylva: { speaker: YS, text: 'Or you let them all go smooth, and the dead rest at last. They have been talked about for a thousand years. They are tired. Let the Fells be quiet.', next: 'ask' },
      ask: {
        speaker: BR, text: '(Ulf sits on the uncarved stone, drumming nothing at all.) Before you speak, Skald, ask what you must. The moot allows it, once.',
        choices: [
          { text: 'Brynja, who decides what makes a saga great?', to: 'whogreat' },
          { text: 'Ylva, do the dead really want to rest?', to: 'rest' },
          { text: '(Drum a question at Ulf: what would you keep?)', to: 'ulfq', school: 'song' },
        ],
      },
      whogreat: { speaker: BR, text: 'The Halls do. We always have. (A pause.) I have never been asked that before, and I find I do not care for the question.', next: 'choose' },
      rest: { speaker: YS, text: 'I do not know what the dead want. Nobody does. I know what the living want, and the living are tired of carrying them.', next: 'choose' },
      ulfq: { speaker: UL, text: '(He looks up, surprised to be asked. He drums one word: Everyone. And then, after a moment: I can’t.)', next: 'choose' },
      choose: {
        speaker: BR, text: 'The stone is singing in you, Skald. The Fells will hear you. Which sagas do we keep?',
        choices: [
          { text: 'Cut the great sagas. The heroes and the chiefs.', to: 'great', quest: true, effects: [{ setFlag: 'skald.stones', value: 'great' }] },
          { text: 'Let them weather. Let the dead rest.', to: 'weather', quest: true, trustNpc: RG, trust: -1, effects: [{ setFlag: 'skald.stones', value: 'weather' }] },
          { text: 'Cut the unsung. The shepherds, the cooks, the people nobody ever made a saga for. Ulf’s mother first.', to: 'unsung', quest: true, insight: 'skald_cut_unsung', when: { insight: 'unsung_sagas' }, effects: [{ setFlag: 'skald.stones', value: 'unsung' }] },
        ],
      },
      great: { speaker: 'narrator', text: 'The Halls cheer and pick up their chisels. Ulf drums once, a single flat beat that the Fells throw back three times, and gets up off the uncarved stone and walks away into the mist.', next: null },
      weather: { speaker: YS, mood: 'happy', text: '(She bows to you, very low.) Thank you. (Behind her, the Halls put their chisels down one by one. Across the ring, Ulf is staring at you.)', next: 'weather2' },
      weather2: { speaker: 'narrator', text: 'When Ragna hears, she says nothing at all for a whole evening, which in thirty years she has never once managed.', next: null },
      unsung: { speaker: 'narrator', text: 'The moot goes very quiet. Then Asta, at the back, puts her hand up and says her granny was a cook. Somebody else says their uncle mended walls. By noon there are twenty names, and Brynja is cutting the first of them herself.', next: 'unsung2' },
      unsung2: { speaker: UL, mood: 'sad', text: '(Ulf is weeping. Clear tears, the ordinary kind, running into his beard. He looks at you as if you had hit him. Then he grabs his drum and runs.)', next: null },
      after: { speaker: BR, text: 'The moot has spoken. Pick up a chisel or get out of the light.', next: null },
    },
  },
  // ---------- I-6 The Harpy Roost
  {
    id: 'dialogue:skald-roost', name: 'I-6 the roost of stolen echoes', scope: 'party',
    entries: [
      { when: { flag: 'skald.stones', value: 'great' }, node: 'great' },
      { when: { flag: 'skald.stones', value: 'weather' }, node: 'weather' },
      { node: 'unsung' },
    ],
    nodes: {
      great: { speaker: 'narrator', text: 'The roost is lined with stolen echoes, and every one is a hero’s saga shrieked back wrong: the founding of the Halls with the names swapped round, the Jarl of Scarrow dying of a cold instead of a dragon.', next: 'mother' },
      weather: { speaker: 'narrator', text: 'The roost is lined with stolen echoes. The harpies have been flying over the blank stones, filling the silence there with anything they could steal: lambs, wind, half a lullaby, your own voice drumming the relay.', next: 'mother' },
      unsung: { speaker: 'narrator', text: 'The roost is lined with stolen echoes, and the newest are the names cut at the moot: a cook, a waller, a midwife, shrieked back over and over until they are hardly names at all.', next: 'mother' },
      mother: { speaker: 'narrator', text: 'In the middle of it, Shriek-Mother lifts her head. Her feathers are tipped black, and when she opens her beak what comes out is the last thing you said, in your own voice.', next: null },
    },
  },
  {
    id: 'dialogue:obj-ulf-drum-message', name: 'I-6 Ulf’s drum-message', scope: 'party',
    entries: [{ when: { questStage: 'quest:skald-the-harpy-roost', stage: 'message' }, node: 'take' }, { node: 'nest' }],
    nodes: {
      take: { speaker: 'narrator', text: 'A strip of drum-hide, rolled and knotted with gut in the long-message knots Ragna taught you both. Ulf’s knots: he always doubles the last one. It was given to a harpy to carry, and the harpy never delivered it.', next: 'to' },
      to: { speaker: 'narrator', text: 'You can read the first knot. It is the address, and it is not anyone in Harmonia.', next: null },
      nest: { speaker: 'narrator', text: 'Shriek-Mother’s empty nest, still faintly shrieking.', next: null },
    },
  },
  // ---------- I-7 The Weeping Runes
  {
    id: 'dialogue:skald-ragna-message', name: 'I-7 Ragna reads Ulf’s knots', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: RG, text: 'Give it here. I taught him these. (She runs the knots through her fingers like beads.) “To the King in the Heart. From one Unsung to another.”', next: 'read' },
      read: {
        speaker: RG, mood: 'afraid', text: '“I have cut them in tears. They will never wear. Nobody will ever have to sing them again, so nobody can be left out of the singing. Bring me the Fell half and I will fix every saga in stone forever.”',
        choices: [
          { text: 'He means to make the Skalds unneeded.', to: 'unneeded' },
          { text: 'He’s been cutting the sagas in black tears. That’s why they’re black at night.', to: 'tears', insight: 'weeping_runes', when: { any: [{ flag: 'skald.black_marks' }, { flag: 'skald.echo_drum' }, { insight: 'weeping_runes' }] } },
        ],
      },
      unneeded: { speaker: RG, mood: 'sad', text: 'Unneeded. Yes. And nobody singing means nobody left out. Oh, my poor boy. He has thought it right the way through, the way he did as a child, and come out the wrong end. Go and look at what he has cut.', next: null },
      tears: { speaker: RG, mood: 'sad', text: 'Black tears in the cut. A saga that weeps and never wears. (She puts the message down very carefully.) He is not wrong that it would last. He is wrong about everything else. Go and look, little one, and then go after him.', next: null },
    },
  },
  {
    id: 'dialogue:obj-weeping-rune', name: 'I-7 the weeping runes', scope: 'party',
    entries: [{ when: { questStage: 'quest:skald-the-weeping-runes', stage: 'runes' }, node: 'look' }, { node: 'rune' }],
    nodes: {
      look: {
        speaker: 'narrator', text: 'Ulf’s new carvings, cut deep and perfect, every rune of every saga he re-cut. Close to, the grooves are not dark with shadow. They are wet, and black, and very slowly they are weeping down the face of the stone.',
        choices: [
          { text: 'He cut them in black tears, so they’ll never wear.', to: 'tears', insight: 'weeping_runes' },
          { text: '(Touch the stone.)', to: 'touch' },
        ],
      },
      tears: { speaker: 'narrator', text: 'Every saga he cut will last forever now. Not one of them will ever need a voice again. Under the ring, deep down, your half-stone’s other self is singing in the Echo Barrow, and someone is walking towards it.', next: null },
      touch: { speaker: 'narrator', text: 'It is cold, and it does not wear under your thumb the way stone should. Under the ring, deep down, the Fell half is singing in the Echo Barrow, and someone is walking towards it.', next: null },
      rune: { speaker: 'narrator', text: 'A saga, cut deep in weeping black. It will outlast the stone it is cut in.', next: null },
    },
  },
  // ---------- I-8 The Echo Barrow
  {
    id: 'dialogue:skald-echo-barrow', name: 'I-8 into the Echo Barrow', scope: 'party',
    entries: [{ node: 'down' }],
    nodes: {
      down: { speaker: 'narrator', text: 'The barrow of the first Skald, where every word comes back three times: your footsteps, your breath, your heartbeat, all of it, three times, until the dark is full of you.', next: 'ulf' },
      ulf: { speaker: UL, mood: 'hollow', text: '(At the far end, beside the stone Skald with the Fell half in its hands, Ulf lifts his drum. The beat comes back three times: Fixed. Forever. Nobody left out.)', next: null },
    },
  },
  {
    id: 'dialogue:obj-song-frontier-halfstone', name: 'I-8 the Fell half', scope: 'party',
    entries: [{ when: { questStage: 'quest:skald-the-echo-barrow', stage: 'stone' }, node: 'claim' }, { node: 'hands' }],
    nodes: {
      claim: { speaker: 'narrator', text: 'The first Skald is carved sitting, with a drum across its knees and its stone hands held out. In them lies half a crystal, cracked clean across, singing. When you lift it, the barrow sings it back three times, and then, for the first time, falls silent.', next: 'three' },
      three: {
        speaker: 'narrator', text: 'In the silence after the third echo you hear, for one moment, a voice: rough, plain, singing, nobody’s you know. Then it is gone.',
        choices: [
          { text: '(Call out to it.)', to: 'call' },
          { text: '(Drum the first saga’s opening beat on the first Skald’s stone drum.)', to: 'drum', school: 'song' },
        ],
      },
      call: { speaker: 'narrator', text: 'You call out. The barrow gives you back your own voice, three times, and then nothing. Whatever that voice was, it was not yours to call.', next: 'ulf' },
      drum: { speaker: 'narrator', text: 'You drum it on the stone drum, and the barrow answers with nine hundred beats at once, every saga’s first beat, crowding the dark like a hall full of people standing up.', next: 'ulf' },
      ulf: {
        speaker: UL, text: '(From the barrow’s back door, open now onto a grey road going south, one last drumbeat: Lyre Gate. Come and see.)',
        choices: [
          { text: 'Ulf! I know about the stone with no saga.', to: 'stone', when: { flag: 'skald.black_marks' } },
          { text: 'Ulf, come home.', to: 'home' },
          { text: '(Let him go.)', to: null },
        ],
      },
      stone: { speaker: UL, mood: 'sad', text: '(A long silence. Then, so softly the barrow echoes it only once: I know you know. It was going to be mine. Nobody else would cut it.)', next: null },
      home: { speaker: UL, text: '(Drum: Home is where they sing. I can’t. Lyre Gate. Come and see.)', next: null },
      hands: { speaker: 'narrator', text: 'The first Skald’s stone hands, empty, still held out.', next: null },
    },
  },
  // ---------- I-9 Ragna's Last Saga (mentor farewell; trust check)
  {
    id: 'dialogue:skald-ragna-farewell', name: 'I-9 Ragna’s farewell', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: RG, text: 'Sit. I am going to tell you your saga so far, little one, and you are going to sit still for it, which you never could. It begins with a baby left in a drum-case on the Saga Hall steps…', next: 'saga' },
      saga: {
        speaker: RG, mood: 'sad', text: '…and then the harpies, and the hall at Hoddersgill, and then… and then there was a moot. Wasn’t there? There was a moot. I have lost that verse already. You will have to tell it to someone else.',
        choices: [
          { text: 'I’ll tell it for you. Every verse.', to: 'verse', trust: 1 },
          { text: 'Come with me.', to: 'stay' },
        ],
      },
      verse: {
        speaker: RG, text: 'Will you? Then tell me the moot. I want to hear how it went, before I lose the rest of it.',
        choices: [
          { text: 'We cut the great sagas.', to: 'great', when: { flag: 'skald.stones', value: 'great' } },
          { text: 'We let them weather.', to: 'weather', when: { flag: 'skald.stones', value: 'weather' } },
          { text: 'We cut the unsung.', to: 'unsung', when: { flag: 'skald.stones', value: 'unsung' } },
        ],
      },
      great: { speaker: RG, text: 'The great ones. Yes. They will last, and they will be lonely, the way great things are. You did what the Halls asked of you. That is not nothing.', next: 'gift' },
      weather: { speaker: RG, mood: 'sad', text: 'We let them go. (She is quiet.) I said nothing for a whole evening, didn’t I? I remember that much. I am still saying nothing, a little.', next: 'gift' },
      unsung: { speaker: RG, mood: 'happy', text: 'The cooks and the wallers and Ulf’s mother. (She laughs, wetly.) Oh, that is a verse I shall not lose. I shall hold on to that one with both hands.', next: 'gift' },
      stay: { speaker: RG, text: 'At my age? I would forget where I was going halfway through Concordia. No. The Fells need someone to forget at.', next: 'gift' },
      gift: {
        speaker: RG, text: 'Here. Hold out your hands.',
        choices: [
          { text: '(Take what she gives you.)', to: 'staff', when: { trust: RG, value: 'friendly' } },
          { text: '(Take her hands.)', to: 'hands', when: { not: { trust: RG, value: 'friendly' } } },
        ],
      },
      staff: {
        speaker: RG, text: 'My saga-staff. A notch for every saga I have lost. Count them, if you like. I have stopped. It will hold you up on the road, and it will remind you that losing things is not the same as never having had them.',
        effects: [{ giveItem: 'w_ragna_saga_staff' }, { setFlag: 'skald.saga_staff', value: true }], next: 'nine',
      },
      nine: {
        speaker: RG, mood: 'sad', text: 'And there is one more. The one I kept back. I never drummed it in the Hall. It is the Nine-Hundredth Saga, and it is about a boy drumming alone on Scarrow Pike.',
        choices: [
          { text: 'Tell it to me.', to: 'told', when: { trust: RG, value: 'trusted' }, effects: [{ setFlag: 'skald.ninehundredth', value: true }, { unlockLore: 'lore:hc-nine-hundredth-saga' }] },
          { text: 'Keep it. It’s yours.', to: 'end' },
        ],
      },
      told: { speaker: RG, mood: 'sad', text: 'He was nine. He could not sing a note, so he climbed the Pike every night and drummed every saga he knew at the sky, so the Fells would sing them back to him in a voice. Take that to him, wherever he has gone.', next: 'end' },
      hands: { speaker: RG, text: 'Go careful. Drum twice at every crossroads. The Fells only believe things they hear twice.', next: null },
      end: { speaker: RG, text: 'Go on, then. Before I forget you are going. That is a joke. Mostly.', next: null },
    },
  },
];

export default dialogues;
