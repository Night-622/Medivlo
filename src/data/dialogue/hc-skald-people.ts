/**
 * Hollow Crown, SKALD: Fells people (general talk), the eight side quests, the mentor thread and the bounties,
 * plus the Act II class-thread scenes, Brindlecross hooks and featured-bearer scenes. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const offer = (q: Q, text: string, to: string, extra?: NarrativeCondition): DialogueChoice =>
  ({ text, to, quest: true, when: extra ? { all: [fresh(q), extra] } : fresh(q), effects: [{ startQuest: q }] });
const bye: DialogueChoice = { text: 'Farewell.', to: null, tag: 'leave' };
const NIGHT: NarrativeCondition = { hour: [21, 4] };
const RG = 'npc:ragna-saga-keeper' as const, AR = 'npc:steadreeve-arvid' as const;

/** an object scene with one quest stage (found things on the Fells and the shore) */
const found = (id: string, name: string, q: Q, s: string, text: string, plain: string): DialogueDef => ({
  id: `dialogue:obj-${id}`, name,
  entries: [{ when: stage(q, s), node: 'find' }, { node: 'plain' }],
  nodes: { find: { speaker: 'narrator', text, next: null }, plain: { speaker: 'narrator', text: plain, next: null } },
});

const dialogues: DialogueDef[] = [
  // ---------- Ragna (general + mentor thread)
  {
    id: 'dialogue:skald-ragna', name: 'Ragna (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: RG, text: 'Sit. I’ll tell you one. Which one did I just say I’d tell you? Never mind, it’ll come.',
        choices: [
          offer('quest:skald-the-saga-of-nobody-much', 'Which is your oldest saga?', 'oldest', { trust: RG, value: 'friendly' }),
          offer('quest:skald-the-first-saga-she-lost', 'What was the first saga you lost?', 'first', { all: [{ trust: RG, value: 'trusted' }, { questCompleted: 'quest:skald-ulf-comes-home' }] }),
          { text: 'How many sagas do you have left?', to: 'count' },
          { text: 'How did you come to be Saga-Keeper?', to: 'keeper', when: { all: [{ questCompleted: 'quest:skald-the-first-saga-she-lost' }, { questCompleted: 'quest:skald-the-saga-of-nobody-much' }] } },
          bye,
        ],
      },
      keeper: { speaker: RG, text: 'Badly. I was the worst novice the Halls ever had. I could remember everything and sing none of it in tune. So they made me keep the sagas instead of singing them, to keep me quiet.', next: 'tune' },
      tune: {
        speaker: RG, mood: 'happy', text: 'Sixty years I kept them. I knew every one, and I sang every one flat, and nobody in the Hall ever once complained to my face. That is what being feared is for.',
        choices: [
          { text: 'Do you miss them? The ones you’ve lost.', to: 'miss' },
          { text: 'Sing me one. Flat.', to: 'flat' },
        ],
      },
      miss: { speaker: RG, mood: 'sad', text: 'Every day. And then I don’t, because I can’t remember what I am missing. That is the mercy in it, little one. Don’t let anyone tell you there isn’t one.', next: 'start' },
      flat: { speaker: RG, mood: 'happy', text: '(She sings two lines of Hrolf Two-Hats, magnificently flat, and laughs until she has to sit down.) There. That one I still have. It must be very stubborn.', next: 'start' },
      oldest: { speaker: RG, text: 'Not a hero’s. A shepherd’s, who did nothing great his whole life. His cairn is on the lower Fells, by a wall he built. Go and put a stone on it, and then I will tell you about him.', next: null },
      first: { speaker: RG, mood: 'sad', text: 'Last spring. The first one I ever learned, at my grandmother’s knee. Gone in a night. But the Fells keep what is said on them, little one, and I said it on the tarns a thousand times. Go and listen at the four high tarns.', next: null },
      count: { speaker: RG, text: 'Eight hundred and… some. I lose one a week. I have started losing the ones I didn’t like first, which is a mercy, and then the ones I did, which is not.', next: 'start' },
    },
  },
  {
    id: 'dialogue:skald-ragna-nobody', name: 'Mentor: the Saga of Nobody Much', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: RG, text: 'You put a stone on Hjalti’s cairn? Good. Then sit, and I will tell you the Saga of Nobody Much. It is my oldest, and it is very short, because nothing happens in it.', next: 'saga' },
      saga: { speaker: RG, text: 'Hjalti Wallson was born on the lower Fells and kept sheep there sixty years. He built one wall. It is still standing. He was kind to his wife, and fair to his neighbours, and he never fought anyone or went anywhere. The end.', next: 'why' },
      why: {
        speaker: RG, mood: 'sad', text: 'I keep it because nobody else would. If I lost a king’s saga, there are fifty Skalds who know it. If I lost Hjalti’s, he would be gone, all sixty years. I would sooner lose a king.',
        choices: [
          { text: 'Then the small sagas need us most. The unsung ones.', to: 'unsung', insight: 'unsung_sagas', trust: 1 },
          { text: 'It’s a good wall.', to: 'wall' },
        ],
      },
      unsung: { speaker: RG, mood: 'happy', text: 'There. You heard it. Most of them never do. Remember that when the Halls start telling you whose sagas matter.', next: null },
      wall: { speaker: RG, mood: 'happy', text: 'It is a very good wall. That is the whole point.', next: null },
    },
  },
  {
    id: 'dialogue:skald-ragna-first-saga', name: 'Mentor: the First Saga She Lost', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'You drum it for her by the hearth, all four verses, in the old slow beat. Halfway through the second verse her lips start to move. By the fourth she is saying it with you, word for word, the way she said it when she was seven.', next: 'end' },
      end: { speaker: RG, mood: 'happy', text: 'The Saga of the Seven Ravens. I had it. I had it at my grandmother’s knee, and I lost it, and you found it on the water. I am too old to cry about it properly, so you will have to imagine.', effects: [{ trust: RG, delta: 1 }], next: null },
    },
  },
  found('nobody-much-cairn', 'Mentor: Hjalti’s cairn', 'quest:skald-the-saga-of-nobody-much', 'cairn',
    'A cairn no taller than your knee beside a dry-stone wall, three hundred years old and not a stone out of place. Someone has left a stone on it recently. You leave another.', 'Hjalti Wallson’s cairn, and his very good wall.'),
  found('saga-tarn-1', 'Mentor: the first tarn', 'quest:skald-the-first-saga-she-lost', 'tarns',
    'You stand at the edge of the tarn and listen. Out of the water, very faint, in a child’s voice: “Seven ravens on the stead roof, and the first one said…” The first verse. You keep it.', 'A high tarn. It is only saying what you say to it.'),
  found('saga-tarn-2', 'Mentor: the second tarn', 'quest:skald-the-first-saga-she-lost', 'tarns',
    'The second tarn gives back the second verse, the raven who stole the cheese, in the same small voice, laughing in the middle of it.', 'A high tarn, quiet.'),
  found('saga-tarn-3', 'Mentor: the third tarn', 'quest:skald-the-first-saga-she-lost', 'tarns',
    'The third verse, the sad one, the raven who flew too far. The voice on the water is older now, a girl of twelve, saying it carefully.', 'A high tarn, quiet.'),
  found('saga-tarn-4', 'Mentor: the fourth tarn', 'quest:skald-the-first-saga-she-lost', 'tarns',
    'The last verse, where all seven come home. The voice on the water is an old woman’s, and it is Ragna’s, saying it to the tarn on a spring evening, for the last time, without knowing it was the last time.', 'A high tarn, quiet.'),
  // ---------- the Drum-Steads: Sigrun and Bluebell, Eskil, Arvid
  {
    id: 'dialogue:skald-sigrun', name: 'Sigrun (the Ewe Who Sang)',
    entries: [{ when: stage('quest:skald-the-ewe-who-sang', 'sigrun'), node: 'back' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:sigrun', text: 'She’s a ewe. She’s my ewe. She just happens to bleat a perfect A, and now three steads want her for the relay. They’re at my fold now, rolling their sleeves up.',
        choices: [offer('quest:skald-the-ewe-who-sang', 'I’ll settle it.', 'settle'), bye],
      },
      settle: { speaker: 'npc:sigrun', text: 'Settle it before they come to blows. (She looks at the fold.) Settle it quickly.', next: null },
      back: {
        speaker: 'npc:sigrun', text: 'Well? I heard shouting. And a splash. Was there a splash?',
        choices: [
          { text: 'There was a splash. Everyone’s fine. Bluebell’s yours.', to: 'home', when: { flag: 'skald.bluebell', value: 'home' } },
          { text: 'There were blows. Bluebell drums the relay, a week at each stead.', to: 'relay', when: { not: { flag: 'skald.bluebell', value: 'home' } } },
        ],
      },
      home: { speaker: 'npc:sigrun', mood: 'happy', text: 'Mine. Good. She’d have hated the relay. She only sings when she wants her supper, same as the rest of us.', next: 'try' },
      relay: { speaker: 'npc:sigrun', text: 'A week at each. Fair. She’ll come back fatter and full of herself. Here, for your trouble, and for the black eye.', next: 'try' },
      try: { speaker: 'npc:sigrun', text: 'Mind you, I’d like to hear her try the relay once. Just the once, so I know. Take her up to the high drum above the steads, would you? She likes you. She doesn’t like anyone.', next: null },
    },
  },
  {
    id: 'dialogue:obj-sigrun-fold', name: 'The Ewe Who Sang: the fold', scope: 'party',
    entries: [{ when: { all: [stage('quest:skald-the-ewe-who-sang', 'fold'), { not: { flag: 'skald.bluebell' } }] }, node: 'fold' }, { node: 'plain' }],
    nodes: {
      plain: { speaker: 'narrator', text: 'Sigrun’s fold. Bluebell is in it, bleating an A at the wall.', next: null },
      fold: { speaker: 'narrator', text: 'Three stead-wives at Sigrun’s fold, each with a halter, each with a reason. Bluebell stands in the middle and bleats a perfect A at all three of them.', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'Everyone is looking at you.',
        choices: [
          { text: 'She’s Sigrun’s ewe. She stays.', to: 'stay', effects: [{ setFlag: 'skald.bluebell', value: 'home' }] },
          { text: 'A week at each stead, turn and turn about.', to: 'turns', effects: [{ setFlag: 'skald.bluebell', value: 'relay' }] },
          { text: '(Drum the relay-beat and let Bluebell choose which stead she follows.)', to: 'choose2', school: 'song', effects: [{ setFlag: 'skald.bluebell', value: 'relay' }] },
        ],
      },
      stay: { speaker: 'narrator', text: 'It comes to blows anyway. Nobody is sure who threw the first halter. Somebody ends up in the trough. Bluebell watches the whole thing and bleats in a minor key.', next: null },
      turns: { speaker: 'narrator', text: 'Everyone agrees this is fair, and then they argue about who goes first, and it comes to blows. Somebody ends up in the trough. Bluebell eats a hat.', next: null },
      choose2: { speaker: 'narrator', text: 'Bluebell follows the drum to the nearest stead-wife, then back, then to the next, perfectly in time. It is beautiful. Then two of them say she chose them, and it comes to blows.', next: null },
    },
  },
  {
    id: 'dialogue:skald-bluebell', name: 'Bluebell',
    entries: [{ node: 'baa' }],
    nodes: { baa: { speaker: 'npc:bluebell', text: '(Baa. A perfect A. She waits to see if you will give her an E.)', effects: [{ setFlag: 'skald.delight.bluebell-met', value: true }], next: null } },
  },
  {
    id: 'dialogue:skald-eskil', name: 'Eskil Ottarsson (News from Two Valleys Over)',
    entries: [{ when: stage('quest:skald-news-from-two-valleys', 'eskil'), node: 'back' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:eskil-ottarsson', text: 'News in from Brackenhow. Old Hulda has died. Then she got married. Then she was turned into a cow. In that order. I’d like to drum it on, but I have my doubts about the cow.',
        choices: [offer('quest:skald-news-from-two-valleys', 'I’ll walk over and see.', 'walk'), { text: 'How does news get that wrong?', to: 'wrong' }, bye],
      },
      walk: { speaker: 'npc:eskil-ottarsson', text: 'Would you? Take her something. If she’s dead, it’s for the wake. If she’s married, it’s a present. If she’s a cow, I suppose it’s lunch.', next: null },
      wrong: { speaker: 'npc:eskil-ottarsson', text: 'Mittens, mostly. And the Fells. Everything you drum on them comes back changed. My father said the Fells don’t lie, they just prefer a better story.', next: 'start' },
      back: {
        speaker: 'npc:eskil-ottarsson', text: 'Not dead? Not married? Not a cow? What did she say?',
        choices: [
          { text: 'She said to drum that she’s alive and to mind your own business.', to: 'alive' },
          { text: '(Drum her actual message, in full.)', to: 'full', school: 'song' },
        ],
      },
      alive: { speaker: 'npc:eskil-ottarsson', mood: 'happy', text: 'Alive and to mind our own business. That’s the most Hulda message there’s ever been. I’ll drum it on. Here, for the walk.', next: 'middle' },
      full: { speaker: 'npc:eskil-ottarsson', mood: 'afraid', text: '(He listens, and goes red, and then redder.) I can’t drum that. Not on the relay. There are children in the next valley. Here, for the walk, and please never drum that again.', next: 'middle' },
      middle: { speaker: 'npc:eskil-ottarsson', text: 'But I would like to know how “having a nap” turned into “dead”. The news goes through the middle stead between here and Brackenhow. Go and watch their drummer, would you?', next: null },
    },
  },
  {
    id: 'dialogue:skald-hulda', name: 'Old Hulda of Brackenhow',
    entries: [{ when: stage('quest:skald-news-from-two-valleys', 'hulda'), node: 'news' }, { node: 'start' }],
    nodes: {
      start: { speaker: 'npc:old-hulda', text: 'Ninety-one, and they bury me twice a winter. What do you want?', next: null },
      news: {
        speaker: 'npc:old-hulda', mood: 'angry', text: 'Dead? DEAD? I was having a nap. And married? I went to my niece’s wedding. And a COW? I lent Gudmund my good cow-blanket because it was cold. Who drummed that? I want names.',
        choices: [
          { text: 'It was the Fells. They prefer a better story.', to: 'fells' },
          { text: 'I brought you something for the wake. It can be for the nap instead.', to: 'gift', trust: 1 },
        ],
      },
      fells: { speaker: 'npc:old-hulda', text: 'The Fells. Well, the Fells can mind their own business, and so can that relay. Tell them that. Tell them exactly that, and some other things I’m about to say.', next: null },
      gift: { speaker: 'npc:old-hulda', mood: 'happy', text: 'For the nap. Ha! That’s the first sensible thing anyone’s said to me this year. Now take this message back, and don’t soften it.', next: null },
    },
  },
  {
    id: 'dialogue:skald-arvid', name: 'Steadreeve Arvid (bounties)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: AR, text: 'Bounties on the post. Drum twice if you take one, so I know.',
        choices: [
          offer('quest:skald-bounty-tarn-wisps', 'The Tarn Wisps.', 'wisps', { questCompleted: 'quest:skald-the-drum-relay' }),
          offer('quest:skald-bounty-old-screel', 'Old Screel.', 'screel', { questCompleted: 'quest:skald-the-blank-stones' }),
          bye,
        ],
      },
      wisps: { speaker: AR, text: 'They rise off the tarns at dusk and sing the shepherds to sleep where they stand. Kolbein woke up in a bog last week. Six of them. Paid by the wisp.', next: null },
      screel: { speaker: AR, text: 'A harpy the size of a barn door. Takes a lamb a week off the high steads and sings about it after, and it’s always the same song, and it’s always about the lamb. Bring her down.', next: null },
    },
  },
  // ---------- the Echoing Fells: Gunnvor, Kolbein
  {
    id: 'dialogue:skald-gunnvor', name: 'Old Gunnvor (What the Fell Said)',
    entries: [{ when: stage('quest:skald-what-the-fell-said', 'gunnvor'), node: 'back' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:old-gunnvor', text: 'Forty years ago my Torsten went up Scarrow Pike to shout something at me down the valley. Halfway through he slipped. They say if you shout his name from the cairn, the Fell finishes it for him. I’ve never had the knees for it.',
        choices: [offer('quest:skald-what-the-fell-said', 'I’ll go up and listen for you.', 'go'), bye],
      },
      go: { speaker: 'npc:old-gunnvor', text: 'Would you? Shout “Torsten” from the cairn. Loud, mind. He was always deaf in the left ear.', next: null },
      back: {
        speaker: 'npc:old-gunnvor', text: 'Well? What did he say? Don’t make it nicer than it was.',
        choices: [
          { text: '“Gunnvor, you daft article, put the kettle on, I’m coming down, and I’ve never loved anyone else.”', to: 'love', trust: 1 },
          { text: 'The Fells keep what is said on them. It was all still there.', to: 'keep', insight: 'fells_keep' },
        ],
      },
      love: { speaker: 'npc:old-gunnvor', mood: 'sad', text: '(She laughs, and then she doesn’t.) Daft article. He always called me that. Forty years. The kettle’s been on forty years, Torsten. Thank you, young Skald.', next: 'answer' },
      keep: { speaker: 'npc:old-gunnvor', mood: 'sad', text: 'All still there. Forty years, waiting on a mountain for someone to ask. Then nothing said on the Fells is ever really gone, is it? Only waiting.', next: 'answer' },
      answer: { speaker: 'npc:old-gunnvor', text: '(She wipes her eyes on her sleeve, crossly.) Well, he’s not having the last word. Not after forty years. Go back up to the ledge where he slipped, halfway, and give the Fell my answer. Learn it first. Don’t make it nicer.', next: null },
    },
  },
  {
    id: 'dialogue:obj-scarrow-pike-cairn', name: 'What the Fell Said: the cairn on Scarrow Pike', scope: 'party',
    entries: [{ when: stage('quest:skald-what-the-fell-said', 'shout'), node: 'shout' }, { node: 'cairn' }],
    nodes: {
      cairn: { speaker: 'narrator', text: 'The summit cairn of Scarrow Pike. The whole of the Fells below you, lilac and grey, listening.', next: null },
      shout: { speaker: 'narrator', text: 'You shout “Torsten!” off the summit, as loud as you can. The Fells take it, and pass it round, and give it back in a man’s voice you have never heard, cheerful and out of breath and forty years old.', next: 'end' },
      end: { speaker: 'narrator', text: '“…Gunnvor, you daft article, put the kettle on, I’m coming down, and I’ve never loved anyone else.” Then the Fell is quiet, as if it had been holding that for a long time and is glad to put it down.', next: null },
    },
  },
  {
    id: 'dialogue:skald-kolbein', name: 'Shepherd Kolbein (the Lost Flock)',
    entries: [{ when: stage('quest:skald-the-lost-flock', 'kolbein'), node: 'back' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:shepherd-kolbein', text: 'Hear that? That’s old Fetch’s whistle, the one I used to call him in with. Fetch has been dead nine years, and my sheep are walking into the tarn after it.',
        choices: [offer('quest:skald-the-lost-flock', 'I’ll find what’s whistling.', 'find'), bye],
      },
      find: { speaker: 'npc:shepherd-kolbein', text: 'The Whistling Tarn. Go careful. If you hear the whistle and you want to walk into the water, don’t.', next: null },
      back: {
        speaker: 'npc:shepherd-kolbein', text: 'A wisp? Whistling Fetch’s whistle off the water? It’s gone quiet. The sheep are just standing about looking stupid, which is normal.',
        choices: [
          { text: '(Whistle Fetch’s whistle for him, once, from the bank.)', to: 'whistle', trust: 1 },
          { text: 'They’re safe now.', to: 'safe' },
        ],
      },
      whistle: { speaker: 'npc:shepherd-kolbein', mood: 'sad', text: '(Every sheep on the hill turns round at once and trots towards you.) Ha. They remember him. So do I. Here, for your trouble.', next: 'fetch' },
      safe: { speaker: 'npc:shepherd-kolbein', text: 'Safe as sheep ever are, which isn’t very. Here, for your trouble.', next: 'fetch' },
      fetch: { speaker: 'npc:shepherd-kolbein', mood: 'sad', text: 'Fetch is buried up by the tarn wall. Nine years, and I’ve never once put a stone on him. I couldn’t. (He holds out a worn leather collar.) Would you? Take this up with you.', next: null },
    },
  },
  // ---------- the Saga Stones: Brynja, Ylva, Asta, the Stone with No Saga
  {
    id: 'dialogue:skald-brynja', name: 'Hall-Reeve Brynja (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:hall-reeve-brynja', text: 'A saga not cut is a saga lent. A saga lent is a saga lost. Did you want a chisel?',
        choices: [
          offer('quest:skald-the-stone-with-no-saga', 'Why is one of the Saga Stones uncarved?', 'stone', { questCompleted: 'quest:skald-ulf-comes-home' }),
          { text: 'What do the Saga Halls do?', to: 'halls' },
          bye,
        ],
      },
      stone: { speaker: 'npc:hall-reeve-brynja', text: 'The Stone with No Saga. It waits for a saga not yet sung, the Halls say. Nobody cuts it. Lately your Ulf sits by it after dark, tapping at it. Go and see what he taps, at night. I would rather not.', next: null },
      halls: { speaker: 'npc:hall-reeve-brynja', text: 'We keep the sagas. Cut them, drum them, argue about them. Mostly argue. A Skald who agrees with another Skald has stopped listening.', next: 'start' },
    },
  },
  {
    id: 'dialogue:obj-stone-with-no-saga', name: 'The Stone with No Saga',
    entries: [
      { when: { all: [stage('quest:skald-the-stone-with-no-saga', 'stone'), NIGHT] }, node: 'night' },
      { when: stage('quest:skald-the-stone-with-no-saga', 'stone'), node: 'day' },
      { node: 'stone' },
    ],
    nodes: {
      stone: { speaker: 'narrator', text: 'The one uncarved stone in the ring of the Saga Stones, smooth and grey, waiting.', next: null },
      day: { speaker: 'narrator', text: 'Smooth grey stone in the daylight, and a place in the grass beside it worn flat by somebody sitting. Brynja said to look after dark.', next: null },
      night: {
        speaker: 'narrator', text: 'By moonlight the uncarved stone is not smooth. All down one side, low, where a man sitting beside it could reach, there are drum-marks tapped into the grey with a knuckle. They are black, and they are wet, and they are weeping.',
        effects: [{ setFlag: 'skald.black_marks', value: true }, { insight: 'weeping_runes' }], next: null,
      },
    },
  },
  {
    id: 'dialogue:skald-brynja-stone', name: 'The Stone with No Saga: Brynja',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:hall-reeve-brynja', mood: 'afraid', text: 'Black marks. Wet. On the one stone nobody cuts. (She puts her chisel down.) That stone was for a saga not yet sung. Whatever Ulf is tapping into it, it is not a saga.',
        choices: [
          { text: 'He means it for himself. The only saga nobody ever cut.', to: 'his' },
          { text: 'Leave it. It’s his to tap.', to: 'leave', trust: 1 },
        ],
      },
      his: { speaker: 'npc:hall-reeve-brynja', mood: 'sad', text: 'His own. Gods. Nine hundred sagas in that man’s head and not one with his name in. No wonder he sits there. Here, for your trouble. I am going to go and think about my lists.', next: 'tell' },
      leave: { speaker: 'npc:hall-reeve-brynja', text: 'His to tap. Yes. Maybe. Here, for your trouble. Tell me if it starts to weep any faster.', next: 'tell' },
      tell: { speaker: 'npc:hall-reeve-brynja', text: 'And tell Ragna. She raised him. She ought to hear it from you, before she hears it from the Halls in the wrong order.', next: null },
    },
  },
  {
    id: 'dialogue:skald-ylva', name: 'Ylva Stillwater (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ylva-stillwater', text: '(She is sitting with her back to a saga, so as not to read it.) The dead have been talked about enough.',
        choices: [{ text: 'Don’t the dead want remembering?', to: 'remember' }, bye],
      },
      remember: { speaker: 'npc:ylva-stillwater', text: 'Remembered, yes. Recited, every feast, for a thousand years, by people who get the names wrong? Ask them. I think some of them would like a rest.', next: null },
    },
  },
  {
    id: 'dialogue:skald-asta', name: 'Asta (Rubbings)',
    entries: [{ when: stage('quest:skald-rubbings', 'asta'), node: 'back' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:asta', text: 'Hold still, stone. Nearly got you. (She looks up.) I’m doing rubbings. Before they go. I’ve done ninety-one and I’ve run out of paper and I’ve got twenty to do and I’m not allowed to cut yet.',
        choices: [offer('quest:skald-rubbings', 'I’ll find you some paper.', 'paper'), bye],
      },
      paper: { speaker: 'npc:asta', mood: 'happy', text: 'Real paper, not bark. Bark smudges. Try the Saga Hall, and the drum-maker, and anyone who wraps things. Everyone wraps things.', next: null },
      back: {
        speaker: 'npc:asta', mood: 'happy', text: 'That’s loads! That’s twenty stones if I write small! (She is already rubbing.) Which one should I do first? Everyone says do the heroes.',
        choices: [
          { text: 'Do your granny’s. The cook’s. Nobody else will.', to: 'granny', insight: 'unsung_sagas' },
          { text: 'Do the founding of the Halls. It’s the oldest.', to: 'halls' },
        ],
      },
      granny: { speaker: 'npc:asta', text: 'My granny hasn’t got a saga. She was a cook. (She stops.) She was the best cook on the Fells, though. Everyone says. Somebody should cut that. I’ll rub it in my head till they do.', next: 'last' },
      halls: { speaker: 'npc:asta', text: 'The founding. All right. It’s very long and everybody in it is called Thorgils. Thank you for the paper.', next: 'last' },
      last: { speaker: 'npc:asta', text: 'There’s one more I want. The oldest, out by the old drove track past the ring. It’s so worn I can hardly feel the letters. Will you hold the paper flat? The wind always gets it.', next: null },
    },
  },
  found('rubbing-paper-1', 'Rubbings: paper in the Saga Hall', 'quest:skald-rubbings', 'paper',
    'In the Saga Hall’s chest of practice sheets, under thirty years of dust, a stack of clean paper the novices were never let near. Nobody will miss it. Brynja will miss it.', 'The Saga Hall’s practice chest. It is emptier than it was.'),
  found('rubbing-paper-2', 'Rubbings: paper at the drum-maker’s', 'quest:skald-rubbings', 'paper',
    'The drum-maker wraps his drum-heads in paper to keep the damp off. He has a great roll of it, and he gives you half for a promise to drum something nice at his daughter’s wedding.', 'The drum-maker’s bench, and a great roll of paper.'),
  found('rubbing-paper-3', 'Rubbings: paper at Wether Stead', 'quest:skald-rubbings', 'paper',
    'Sigrun has been keeping the lambing tally on the backs of old relay messages for years. She gives you the lot. Most of them say THE BELL HAS NOT RUNG, over and over, going back thirty years.', 'Sigrun’s tally-shelf, empty now.'),
  // ---------- the Harpy Cliffs: Thora, Haldor
  {
    id: 'dialogue:skald-thora', name: 'Thora Cragfoot (Egg-Song)',
    entries: [{ when: stage('quest:skald-egg-song', 'thora'), node: 'back' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:thora-cragfoot', text: 'A harpy egg hums the lullaby its mother sang over it. In Lyrehaven they pay a fortune for one, to put by a cradle. Somebody has taken a whole clutch off the cliffs.',
        choices: [offer('quest:skald-egg-song', 'I’ll find the eggs.', 'find'), bye],
      },
      find: { speaker: 'npc:thora-cragfoot', text: 'The thieves camp in the gully under the cliffs. You’ll hear the crates before you see them. Bring them back to the ledge, if you’ve any sense.', next: null },
      back: {
        speaker: 'npc:thora-cragfoot', text: 'Well?',
        choices: [
          { text: 'They’re back on the ledge. The mothers came down for them.', to: 'ledge', when: { flag: 'skald.eggs', value: 'returned' } },
          { text: 'They’re on their way to Lyrehaven. Somebody will sleep well.', to: 'sold', when: { flag: 'skald.eggs', value: 'sold' } },
        ],
      },
      ledge: { speaker: 'npc:thora-cragfoot', mood: 'happy', text: 'Good. A harpy that hatches to its own mother’s song grows up only half as nasty. Here. Gulls’-egg money. It’s honest.', next: 'tenth' },
      sold: { speaker: 'npc:thora-cragfoot', mood: 'sad', text: 'To Lyrehaven. Well. Somebody’s baby gets a lullaby, and somebody’s chick grows up with nobody singing. That’s the Fells for you. Here. You did the work.', next: 'tenth' },
      tenth: { speaker: 'npc:thora-cragfoot', text: '(She takes something wrapped in a shawl out of her basket.) There were ten. I kept one back. It doesn’t hum. No mother ever sang over it, I reckon. Take it up to a ledge, would you, and do something Skaldish.', next: null },
    },
  },
  {
    id: 'dialogue:obj-egg-thief-crates', name: 'Egg-Song: the crates', scope: 'party',
    entries: [{ when: { all: [stage('quest:skald-egg-song', 'crates'), { not: { flag: 'skald.eggs' } }] }, node: 'crates' }, { node: 'empty' }],
    nodes: {
      empty: { speaker: 'narrator', text: 'Empty crates in a gully, and straw, and nobody.', next: null },
      crates: { speaker: 'narrator', text: 'Three straw-lined crates in the gully, and the thieves long gone at the sight of you. Inside, nine harpy eggs, speckled lilac, each one humming a different lullaby, very quietly, all at once.', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'Up on the cliff, a harpy is circling, and not shrieking.',
        choices: [
          { text: '(Carry them back up to the ledge.)', to: 'ledge', effects: [{ setFlag: 'skald.eggs', value: 'returned' }] },
          { text: '(Let them go to the Lyrehaven market.)', to: 'market', effects: [{ setFlag: 'skald.eggs', value: 'sold' }] },
        ],
      },
      ledge: { speaker: 'narrator', text: 'You climb with the eggs in your shirt, all nine humming against your chest in nine keys, and leave them on the ledge. The circling harpy comes down and sits on them, and for once it sings instead of shrieks.', next: null },
      market: { speaker: 'narrator', text: 'You leave the crates on the Lyrehaven road for the carter. By the time he comes, the eggs have all started humming the same lullaby, as if they were trying to remember who sang it.', next: null },
    },
  },
  {
    id: 'dialogue:skald-haldor', name: 'Old Haldor (the Fog-Drummer)',
    entries: [{ when: stage('quest:skald-the-fog-drummer', 'haldor'), node: 'back' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:old-haldor', text: '(Boom.) Fog’s coming. (Boom.) Fog’s always coming. And my skin is splitting, young Skald, the drum’s, I mean, though mine isn’t much better. If she goes in a fog, a ship goes with her.',
        choices: [offer('quest:skald-the-fog-drummer', 'I’ll find you a new hide.', 'hide'), bye],
      },
      hide: { speaker: 'npc:old-haldor', text: 'Seal-hide, cured. There’s a roll in the old boathouse at the cliff-foot. Nothing else carries through fog. Cow sounds like a cow. Seal sounds like the sea, and the sea listens.', next: null },
      back: {
        speaker: 'npc:old-haldor', mood: 'happy', text: '(He stretches the hide, and tightens it, and strikes it once. The boom goes out over the water and keeps going.) There she is. Now. A fog-drum carries a saga, did you know? The coast-saga. Every rock from here to Tidecourt, in rhythm. Listen.',
        choices: [
          { text: '(Learn the coast-saga.)', to: 'learn', insight: 'coast_saga', trust: 1 },
          { text: 'I’ll leave that one to you.', to: 'leave' },
        ],
      },
      learn: { speaker: 'npc:old-haldor', text: '(He drums it through twice, rock by rock. By the end you could steer a boat blind from the Fells to Tidecourt.) Now there’s two of us. That’s twice as safe. Here, for the hide.', next: 'fog' },
      leave: { speaker: 'npc:old-haldor', text: 'Fair. It’s a long one, and it’s mostly rocks. Here, for the hide.', next: 'fog' },
      fog: { speaker: 'npc:old-haldor', text: 'Mind, a skin’s only proved in a real fog, after dark, with something out on the water. Fog’s due tonight. Come back and drum her yourself. I’ll stand by and pretend I’m not worried.', next: null },
    },
  },
  found('boathouse-seal-hide', 'The Fog-Drummer: the seal-hide', 'quest:skald-the-fog-drummer', 'hide',
    'The old boathouse at the cliff-foot, full of nets and the smell of forty winters. On a peg at the back, a roll of seal-hide, cured stiff with salt, with HALDOR’S, DON’T burned into the wooden peg.', 'The old boathouse, with an empty peg marked HALDOR’S, DON’T.'),

  // ======================= ACT II
  {
    id: 'dialogue:skald-hallgerd', name: 'C-1 the drummers at the Fish Mill', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:old-hallgerd', text: '(She does not stop drumming.) From the Fells, are you? I can tell by how you stand, like you expect the ground to answer. Sit. We drum the drowned choir’s names, every night. Forty brothers. We’ve only got thirty-seven.', next: 'names' },
      names: {
        speaker: 'npc:old-hallgerd', mood: 'sad', text: 'Three went. One winter, three of us died, and they took a name each with them, and nobody else had learned it. A name nobody says is a name that’s gone.',
        choices: [
          { text: 'Then I’ll find the three. The lake gives things back.', to: 'find', quest: true },
          { text: 'The Halls cut the great sagas. Are there Saga Hall folk here?', to: 'halls', when: { flag: 'skald.stones', op: '==', value: 'great' } },
          { text: 'At home we let the stones go blank. The dead are resting.', to: 'weather', when: { flag: 'skald.stones', op: '==', value: 'weather' } },
          { text: 'At home we cut sagas for people nobody sang. Shepherds. Cooks.', to: 'unsung', when: { flag: 'skald.stones', op: '==', value: 'unsung' } },
        ],
      },
      halls: { speaker: 'npc:old-hallgerd', text: 'Half of us were Hall drummers. The great sagas, eh? Then the old Hall drummers will take you down to the nave themselves, from the boats, the old way. Find me my three names first.', effects: [{ setFlag: 'skald.hall_drummers', value: true }], next: 'find' },
      weather: { speaker: 'npc:old-hallgerd', mood: 'sad', text: 'Let them go blank. Hm. Well, the Abbess down there would agree with you. She wants nothing but quiet. Maybe she’ll hear you out for it. Find me my three names all the same.', next: 'find' },
      unsung: { speaker: 'npc:old-hallgerd', mood: 'happy', text: '(For the first time she misses a beat.) For cooks? Ha! My mother was a cook. Well, then you’ll understand why three names matter as much as forty. Find them.', next: 'find' },
      find: { speaker: 'npc:old-hallgerd', text: 'The lake gives back wood, mostly. Pew-ends, floats, bits of stall. If any of it has a name on it, it’s one of ours. Then go down and tell the Abbess. She’ll want all forty.', next: null },
    },
  },
  found('lost-name-1', 'C-2 a lost name: the pew-end', 'quest:skald-under-the-lake', 'names',
    'Washed up among the reeds below the Fish Mill: the carved end of a choir pew, black with thirty years of lake. Cut into it, in a novice’s careful letters: BR. NINIAN. HIS PLACE.', 'Reeds, and lake-wrack, and nothing with a name on it.'),
  found('lost-name-2', 'C-2 a lost name: the net-float', 'quest:skald-under-the-lake', 'names',
    'Tied into the Fish Mill’s oldest net, a wooden float that did not come from any fishing boat: a hymn-book clasp, burned with a name to say whose it was. CORRIE HARROWBY. He must have been a fisherman’s son.', 'The Fish Mill nets, drying.'),
  found('lost-name-3', 'C-2 a lost name: the whistle', 'quest:skald-under-the-lake', 'names',
    'Tamsin keeps a jar of things the river brings her. In it, among the buttons, a child’s tin whistle, and scratched on it, very small: TOD. Little Brother Tod, who was nine, and sang the high part.', 'Tamsin’s jar of river things. She counts them every morning.'),
  {
    id: 'dialogue:hook-skald-wil', name: 'Hook: Wil and the Skald (C-1 the Goose’s book)', scope: 'party',
    entries: [{ when: stage('quest:skald-abbeyshore', 'goose'), node: 'book' }],
    nodes: {
      book: {
        speaker: 'npc:wil', mood: 'happy', text: 'A drum! A Fells drum, in my Goose! The Goose was the Song school’s inn in the Concord’s day, you know. Every singer who came for a Turning signed this book, and every Skald drummed their name on the bar instead. Look at the dents.',
        choices: [
          { text: 'Where are the Fells-folk who were stranded here?', to: 'mill', quest: true },
          { text: '(Drum your name on the bar, in the old place.)', to: 'dent', trust: 1 },
        ],
      },
      dent: { speaker: 'npc:wil', mood: 'happy', text: 'There. A new dent. First in thirty years. I’ll polish round it.', next: 'mill' },
      mill: { speaker: 'npc:wil', text: 'Down at Abbeyshore, in the Old Fish Mill. You can hear them at night from the ferry, drumming names over the lake. Hallgerd Drum-Wife runs them. She won’t stop drumming to talk, so don’t expect her to.', next: null },
    },
  },
  {
    id: 'dialogue:hook-skald-tamsin', name: 'Hook: Tamsin ferries the Skald',
    entries: [{ when: stage('quest:skald-under-the-lake', 'tamsin'), node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:tamsin', text: 'Over the nave? One copper and a story. And you lot from the Fells always tell the same story about a man with two hats.',
        choices: [
          { text: 'An old woman under Scarrow Pike waited forty years for the end of a sentence.', to: 'gunnvor' },
          { text: '(Drum her the Saga of Nobody Much.)', to: 'nobody', school: 'song', trust: 1 },
        ],
      },
      gunnvor: { speaker: 'npc:tamsin', mood: 'sad', text: 'Forty years for a sentence. And was it worth it? Don’t tell me. I can see it was. Get in.', next: 'over' },
      nobody: { speaker: 'npc:tamsin', mood: 'happy', text: 'A shepherd who built a wall. That’s the best story anyone’s told on this boat in a year. Keep your copper. Get in.', next: 'over' },
      over: { speaker: 'narrator', text: 'Out over the drowned nave the pale shapes rise in the reeds, and the boat drifts to a stop over a bell-tower standing in green water. Tamsin ships her pole. This is where you drum, she says.', next: null },
    },
  },
  {
    id: 'dialogue:obj-nave-name-drum', name: 'C-2 drumming the names on the water', scope: 'party',
    entries: [{ when: stage('quest:skald-under-the-lake', 'drum'), node: 'drum' }, { node: 'water' }],
    nodes: {
      water: { speaker: 'narrator', text: 'From the end of the boat landing, green water runs out to the drowned bell-tower, and the reeds move with no wind.', next: null },
      drum: { speaker: 'narrator', text: 'You lay your drum flat on the water and drum the choir’s names into it, all forty, the three in their right places. The water takes each beat down. At the fortieth name the reeds part, and far below, the north door of the nave swings open.', next: null },
    },
  },
  {
    id: 'dialogue:skald-into-the-nave', name: 'C-2 into the drowned nave', scope: 'party',
    entries: [
      { when: { flag: 'skald.stones', op: '==', value: 'weather' }, node: 'weather' },
      { when: { flag: 'skald.stones', op: '==', value: 'great' }, node: 'halls' },
      { node: 'nave' },
    ],
    nodes: {
      halls: { speaker: 'narrator', text: 'The old Hall drummers take you out in three boats, drumming the long-message beat on the gunwales, and the lake opens under you like a door. You go down through the flooded cloister in the sound of it.', next: 'nave' },
      weather: { speaker: 'narrator', text: 'In the drowned nave the Abbess rises from the water with the bell-rope in her hands. She looks at you for a long time. Then her voice comes through the water: You let your stones go quiet. You know what rest is. Say what you came to say, drummer. Then I will fight you.', next: 'nave' },
      nave: { speaker: 'narrator', text: 'The drowned nave of the Abbey: green light through the high windows, the choir in their stalls, and at the far end the Abbess, holding a rope that is not there.', next: null },
    },
  },
  {
    id: 'dialogue:skald-ebba', name: 'C-4 the kennels at Hollis Lodge', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ebba-coldrey', text: 'Hush, girl. Hush. (The hounds are all on their feet, howling at the trees.) There. That. Hear it? A drum, out in the Gloamwood, every dusk, a week now. Nobody else can find it. You look like you know it.',
        choices: [{ text: 'It’s my saga-brother. Ulf.', to: 'ulf' }, { text: 'What does it sound like to you?', to: 'sound' }],
      },
      sound: { speaker: 'npc:ebba-coldrey', text: 'Like asking. Over and over. The hounds think somebody’s calling them, and it isn’t them it wants.', next: 'ulf' },
      ulf: {
        speaker: 'npc:ebba-coldrey', mood: 'afraid', text: 'Maren’s seen him. A big man with no voice, standing in the White Stag’s glade at dusk, drumming at it. And the Stag isn’t running. It’s following him. Deeper in, every night.',
        choices: [{ text: 'He’s asking it to lead him to the King.', to: 'king', insight: 'ulf_stag' }, { text: 'I’ll go to the glade.', to: 'come' }],
      },
      king: { speaker: 'npc:ebba-coldrey', mood: 'afraid', text: 'The King? The one in the Heart? (She puts her hand on the nearest hound.) Then go quick. That Stag led the Turning, in the old days. If it knows the way, it’ll take him.', next: 'come' },
      come: { speaker: 'npc:ebba-coldrey', text: 'Not without me, you won’t. Grimble went after that drum three nights back and never came home: best nose in the Lodge, and no sense to go with it. (She couples two hounds and takes up her stick.) As far as the treeline, then. Mind the wolves. They walk towards fires now.', next: null },
    },
  },
  {
    id: 'dialogue:skald-ebba-general', name: 'Ebba Coldrey (general)',
    // only once the drum in the glade has stopped; before that her barks carry the howling
    entries: [{ when: { questCompleted: 'quest:skald-the-drum-in-the-glade' }, node: 'start' }],
    nodes: { start: { speaker: 'npc:ebba-coldrey', text: 'They’ve gone quiet at dusk now. Nobody drumming. I miss it, a bit, which is silly.', next: null } },
  },
  {
    id: 'dialogue:obj-ulf-glade-drum', name: 'C-4 the drum in the glade', scope: 'party',
    entries: [{ when: stage('quest:skald-the-drum-in-the-glade', 'glade'), node: 'drum' }, { node: 'stand' }],
    nodes: {
      stand: { speaker: 'narrator', text: 'A drum-stand of woven antler in the Stag’s glade, empty.', next: null },
      drum: { speaker: 'narrator', text: 'In the middle of the White Stag’s glade, a drum-stand made of shed antlers, woven together. On it, a spare drum of Ulf’s, the one with the patched skin. Tied to the stand in his knots: Gone ahead. It follows me. It remembers the road.', next: 'tracks' },
      tracks: { speaker: 'narrator', text: 'Two sets of tracks go out of the glade, side by side: a man’s boots, and the cloven prints of something very large, walking slowly, as if in a procession.', next: null },
    },
  },
  {
    id: 'dialogue:obj-stag-glade-drumstone', name: 'C-5 drumming the White Stag its saga', scope: 'party',
    entries: [{ when: stage('quest:skald-the-white-stag', 'saga'), node: 'saga' }, { node: 'stone' }],
    nodes: {
      stone: { speaker: 'narrator', text: 'A flat stone in the Deep Glade, worn smooth on top, where the Stag lay down.', next: null },
      saga: {
        speaker: 'narrator', text: 'The White Stag lies on the moss, released, its tears dried grey on its face. Nobody has told it its own saga in thirty years.',
        choices: [
          { text: '(Drum it the Saga of the Turning Road: how it led the crown through the Gloamwood, every twelve years, for a thousand years.)', to: 'road' },
          { text: '(Drum it the saga of the last procession, the one that never came.)', to: 'last', school: 'song' },
        ],
      },
      road: { speaker: 'narrator', text: 'You drum, and the Stag lifts its head and listens to the whole of it, every Turning, every school, the lanterns on the antlers and the singing behind. At the end it lays its head down on your drum, very gently, as a horse does on a friend’s shoulder.', next: null },
      last: { speaker: 'narrator', text: 'You drum the procession that waited in the Gloamwood in C. 1012 for a crown that never came. The Stag listens. Then it gets up, and walks once round the glade, slowly, as it would have walked that night, and lies down again at peace.', next: null },
    },
  },
  {
    id: 'dialogue:obj-song-arch-drum', name: 'C-6 the drum beyond the Song arch', scope: 'party',
    entries: [{ when: stage('quest:skald-ragnas-drum-letter', 'arch'), node: 'listen' }, { node: 'arch' }],
    nodes: {
      arch: { speaker: 'narrator', text: 'The Song arch. It answers your footsteps a beat late, like the Fells.', next: null },
      listen: { speaker: 'narrator', text: 'Faint, from the far side of the Song arch, a drum in the long-message beat. Ragna’s hands: you would know them anywhere, the little hitch she puts before every name. It goes on for a long time.', next: 'pip' },
      pip: { speaker: 'narrator', text: 'Somewhere behind you, down on the village green, Pip will be writing it all on his slate, chalk on his nose: he has sat there every dawn since the drumming started, and he never misses a beat.', next: null },
    },
  },
  {
    id: 'dialogue:hook-skald-pip', name: 'Hook: Pip and Ragna’s drum-letter', scope: 'party',
    entries: [{ when: stage('quest:skald-ragnas-drum-letter', 'pip'), node: 'start' }],
    nodes: {
      start: { speaker: 'npc:pip', mood: 'happy', text: 'I got it! All of it! I listen to everything, so I just listened to the drum till it made sense. It’s from a lady called Ragna. She says you’ll know. Shall I read it? I’m going to read it.', next: 'letter' },
      letter: { speaker: RG, text: '“Little one. The stones are wearing slower since the gate opened. Asta has rubbed ninety more. I have forgotten the Saga of Hrolf Two-Hats entirely and I do not miss him. If you find Ulf, tell him the uncarved stone is still waiting. It always was. R.”', next: 'ask' },
      ask: {
        speaker: 'npc:pip', text: 'Can I ask you something? Ysolde says I’m Unsung. No school. I can’t hear the stones at all. Can Unsung people be in sagas? Or do you have to sing to get one?',
        choices: [
          { text: 'Ulf was Unsung, and he knew every saga there is. You can be in mine.', to: 'mine', effects: [{ setFlag: 'skald.pip_saga', value: true }] },
          { text: 'A saga is just people remembering you properly. You don’t have to sing for that.', to: 'remember', insight: 'unsung_remembered' },
        ],
      },
      mine: { speaker: 'npc:pip', mood: 'happy', text: 'In yours? With my name? Spelled right? (He writes PIP on his slate, very large.) Right. I’m going to do something saga-ish, then. Not yet. Soon. Your other half’s humming at the Stone Court, by the way. I can’t hear it, but everyone keeps looking.', next: null },
      remember: { speaker: 'npc:pip', text: 'Remembering properly. I’m good at that. I remember everything. (He thinks.) Then I’m going to remember you properly. Your other half’s humming at the Stone Court, by the way. Everyone keeps looking.', next: null },
    },
  },
  // ---------- featured bearers (hooks on the bearer NPCs)
  {
    id: 'dialogue:skald-featured-cantor', name: 'Featured: The Cantor’s Dirge', scope: 'party',
    entries: [
      { when: stage('quest:skald-the-cantors-dirge', 'back'), node: 'back' },
      { when: { all: [stage('quest:skald-the-cantors-dirge', 'dirge'), { not: { flag: 'skald.seraphina_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-cantor', text: 'You’re a drummer. Good. The drowned choir’s dirge has eleven verses, and four of them are dark: the water rising, the doors, the rope, the last hymn. I can’t sing those. I’ve tried. My voice just stops. Could you drum them, while I sing the light ones?',
        choices: [
          { text: 'I’ll drum the dark ones. You sing the rest.', to: null, quest: true, effects: [{ setFlag: 'skald.seraphina_asked', value: true }] },
          { text: 'Why can’t you sing them?', to: 'why' },
        ],
      },
      why: { speaker: 'npc:bearer-cantor', mood: 'sad', text: 'In Dawnspire we sing light. That’s the whole of it. Nobody ever taught us what to do when the song goes dark. You lot on the Fells sing everything, Mother Celestine says. Even the sad bits. Especially the sad bits.', effects: [{ setFlag: 'skald.seraphina_asked', value: true }], next: null },
      back: {
        speaker: 'npc:bearer-cantor', mood: 'happy', text: 'All eleven verses, and the lake went still for the whole of it. I’ve never heard a dirge finished before. When we go to the Heart, I want you drumming behind me. I can sing anything with that behind me.',
        effects: [{ setFlag: 'skald.seraphina_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-shore-dirge-stone', name: 'The Cantor’s Dirge: the dirge-stone', scope: 'party',
    entries: [{ when: stage('quest:skald-the-cantors-dirge', 'dirge'), node: 'dirge' }, { node: 'stone' }],
    nodes: {
      stone: { speaker: 'narrator', text: 'A grey stone on the shore below the Shore Chapel, facing the lake, carved with eleven lines of a dirge.', next: null },
      dirge: { speaker: 'narrator', text: 'The Cantor’s voice takes the first verse, bright as a lamp on the water. At the fifth, the first of the dark ones, it stops, and you come in on the drum: the water rising, beat by beat, the doors, the rope. Then the light comes back over the top of it, and you go on together to the end.', next: 'end' },
      end: { speaker: 'narrator', text: 'Out on the lake, under the reeds, the drowned choir has been singing along. For the last verse they are louder than the two of you put together.', next: null },
    },
  },
  {
    id: 'dialogue:skald-featured-ranger', name: 'Featured: The Ranger’s Mercy', scope: 'party',
    entries: [
      { when: stage('quest:skald-the-rangers-mercy', 'back'), node: 'back' },
      { when: { all: [stage('quest:skald-the-rangers-mercy', 'hide'), { not: { flag: 'skald.rowan_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-ranger', text: 'The Stag’s my Sentinel too, the second one. I’ve watched it weep for three days from a hide over the glade. One arrow. That’s all it needs. Come up and tell me I’m wrong, if you’re going to.',
        choices: [
          { text: 'I’ll come up.', to: null, quest: true, effects: [{ setFlag: 'skald.rowan_asked', value: true }] },
          { text: 'One arrow won’t end a grief that old.', to: 'grief' },
        ],
      },
      grief: { speaker: 'npc:bearer-ranger', mood: 'sad', text: 'Maybe not. But it’ll end the weeping. Come up to the hide anyway. I’d rather not decide on my own.', effects: [{ setFlag: 'skald.rowan_asked', value: true }], next: null },
      back: {
        speaker: 'npc:bearer-ranger', text: 'I keep thinking about the hide. I keep thinking I’d have done it, if you hadn’t been there. Whatever it was, I’m glad I didn’t decide it alone. I’ll be at your back in the Heart.',
        effects: [{ setFlag: 'skald.rowan_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-ranger-hide', name: 'The Ranger’s Mercy: the hide', scope: 'party',
    entries: [
      { when: { all: [stage('quest:skald-the-rangers-mercy', 'hide'), { questCompleted: 'quest:skald-the-white-stag' }] }, node: 'freed' },
      { when: { all: [stage('quest:skald-the-rangers-mercy', 'hide'), { not: { flag: 'skald.ranger_mercy' } }] }, node: 'hide' },
      { node: 'empty' },
    ],
    nodes: {
      empty: { speaker: 'narrator', text: 'A hide of woven branches over the White Stag’s glade, empty, the bracken inside pressed flat.', next: null },
      freed: { speaker: 'narrator', text: 'Rowan Thornbury is in the hide with the bow across their knees, looking down at an empty glade. The Stag is free; you freed it. After a while Rowan unstrings the bow, and laughs, and cries a bit, and you sit with them until it is done.', effects: [{ setFlag: 'skald.ranger_mercy', value: 'freed' }], next: null },
      hide: { speaker: 'narrator', text: 'Below the hide, the White Stag stands in its glade, weeping black onto the moss. Rowan Thornbury has an arrow on the string. Their hands are shaking.', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'Rowan looks at you.',
        choices: [
          { text: '(Put your hand on the bow.) Not like this. Let me drum to it first.', to: 'stay', effects: [{ setFlag: 'skald.ranger_mercy', value: 'stayed' }] },
          { text: 'It’s your Sentinel. Your choice. I’ll stay with you either way.', to: 'loose', effects: [{ setFlag: 'skald.ranger_mercy', value: 'loosed' }] },
        ],
      },
      stay: { speaker: 'narrator', text: 'Rowan lowers the bow. You drum, very softly, from the hide, and down in the glade the Stag lifts its head and listens, and for a little while it stops weeping. Rowan breathes out for what sounds like the first time in three days.', next: null },
      loose: { speaker: 'narrator', text: 'The arrow goes true, into the Stag’s shoulder. It does not fall. It turns and looks up at the hide, for a long time, without anger. Then it walks slowly into the Deep Glade, still weeping, and Rowan drops the bow.', next: null },
    },
  },
];

export default dialogues;
