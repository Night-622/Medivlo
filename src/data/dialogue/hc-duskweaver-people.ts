/**
 * Hollow Crown, DUSKWEAVER: Duskmere people (general talk), the eight side quests, the mentor thread and the
 * bounties, plus the Act II class-thread, Brindlecross hooks and featured-bearer scenes. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const done = (q: Q): NarrativeCondition => ({ questCompleted: q });
const offer = (q: Q, text: string, to: string, extra?: NarrativeCondition): DialogueChoice =>
  ({ text, to, quest: true, when: extra ? { all: [fresh(q), extra] } : fresh(q), effects: [{ startQuest: q }] });
const bye: DialogueChoice = { text: 'Farewell.', to: null, tag: 'leave' };
/** Nocturne’s dusk never ends, but the moon still rises at night */
const MOONRISE: NarrativeCondition = { hour: [21, 4] };
const NX = 'npc:nyx-aubade' as const, OV = 'npc:oriel-vane' as const, MT = 'npc:marigold-thrupp' as const;
const KNOWS: NarrativeCondition = { trust: NX, value: 'trusted' };

const dialogues: DialogueDef[] = [
  // ---------- Nyx (general + mentor thread)
  {
    id: 'dialogue:duskweaver-nyx', name: 'Nyx (general)',
    entries: [{ when: KNOWS, node: 'start_t' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: NX, text: 'Imogen! Or Sebastian. One of the two, I’m nearly sure. Come in, dear, mind the cat, there isn’t a cat, I keep thinking there’s a cat.',
        choices: [
          offer('quest:duskweaver-the-heros-name', 'You could write my name down somewhere.', 'name', { all: [{ trust: NX, value: 'friendly' }, done('quest:duskweaver-chalk-the-doors')] }),
          offer('quest:duskweaver-what-nyx-gave-away', 'Is there anything you’ve forgotten on purpose, Loremistress?', 'gave', { all: [{ trust: NX, value: 'trusted' }, done('quest:duskweaver-the-flower-thieves')] }),
          { text: 'What are kept names?', to: 'kept' },
          bye,
        ],
      },
      start_t: {
        speaker: NX, text: '{player.name}! Come in, mind the cat, there isn’t a cat, I keep thinking there’s a cat.',
        choices: [
          offer('quest:duskweaver-the-heros-name', 'You could pin my kept name to your sleeve, just in case.', 'name', done('quest:duskweaver-chalk-the-doors')),
          offer('quest:duskweaver-what-nyx-gave-away', 'Is there anything you’ve forgotten on purpose, Loremistress?', 'gave', done('quest:duskweaver-the-flower-thieves')),
          { text: 'What are kept names?', to: 'kept' },
          bye,
        ],
      },
      name: { speaker: NX, mood: 'happy', text: 'Your kept name! In the lower register! Why didn’t I think of that? I’ll pin it to my sleeve. Then whenever I look at my sleeve I’ll know who you are, and I look at my sleeve a great deal. Fetch it, dear, would you? It’s by the first page.', next: null },
      gave: { speaker: NX, mood: 'sad', text: '(She is quiet for a long moment.) One thing. Forty years ago. I gave it to the Gardens with my own hands and I have never once regretted it. Never once. (A pause.) Sit down. Shut the door.', next: null },
      kept: {
        speaker: NX, text: 'Everyone in Nocturne has two names: the one they use, and the one they keep in the Obelisk. The used one is for the world. The kept one is for the people who will remember you after you’ve forgotten yourself. A wedding is two people swapping kept names, so each has the other’s.',
        choices: [
          { text: 'Did you ever swap yours, Loremistress?', to: 'swap', when: { trust: NX, value: 'friendly' } },
          { text: 'Thank you.', to: null },
        ],
      },
      swap: { speaker: NX, mood: 'happy', text: 'Swap it? Oh, I came very close. A bell-ringer from the old tower. He had a laugh like a door banging and he could never remember which hour he’d rung. We were going to be dreadful together. (She laughs.) I forget his face. I remember the laugh.', next: 'why' },
      why: {
        speaker: NX, text: 'He went over to Concordia for the Turning, in C. 1012, to ring the Turning bells on the Citadel road. The arches shut behind him. I kept my name. It seemed silly to give it to somebody who wasn’t there to carry it.',
        choices: [
          { text: 'Do you wish you had?', to: 'wish' },
          { text: 'Perhaps he rings one for you, over there.', to: 'lamp', trust: 1 },
        ],
      },
      wish: { speaker: NX, mood: 'sad', text: 'Every evening at about this time, dear, and then I forget, and then it’s pleasant again. That is the one mercy in my sort of head. (She pats your hand.) Cocoa?', next: null },
      lamp: { speaker: NX, mood: 'happy', text: 'Every evening, on the Citadel road. Oh, that’s a lovely thought. I shall forget you said it, and then I shall think it myself, later, and be very pleased with myself. Thank you.', next: null },
    },
  },
  {
    id: 'dialogue:obj-register-hero-entry', name: 'Mentor: your kept name', scope: 'party',
    entries: [{ when: stage('quest:duskweaver-the-heros-name', 'register'), node: 'find' }, { node: 'book' }],
    nodes: {
      find: { speaker: 'narrator', text: 'The lower register of the Obelisk, a book the size of a door. Your kept name is on the second page, written in your mother’s careful hand, the ink still dark. You copy it onto a slip. Then you notice the first page.', next: 'blank' },
      blank: { speaker: 'narrator', text: 'The first page of the register is blank. Not erased: never written on. In the margin, in ink so old it has gone brown, the first Keepers wrote one line: “A rest, for what should be let go.”', next: null },
      book: { speaker: 'narrator', text: 'The lower register, open at its blank first page.', next: null },
    },
  },
  {
    id: 'dialogue:duskweaver-nyx-name', name: 'Mentor: The Hero’s Name', scope: 'party',
    entries: [{ when: KNOWS, node: 'start_t' }, { node: 'start' }],
    nodes: {
      start_t: { speaker: NX, mood: 'happy', text: 'There it is. (She pins the slip to her left sleeve with a jet brooch and pats it.) I know it already, {player.name}. But now it’s on my sleeve as well, and a sleeve never forgets.', next: 'page' },
      start: { speaker: NX, mood: 'happy', text: 'There it is. (She pins the slip to her left sleeve with a jet brooch and pats it.) Now I shall never get you wrong again. (She looks at her right sleeve.) Dorcas. No! Wrong sleeve. Give me a week.', next: 'page' },
      page: {
        speaker: NX, text: 'And the first page? Did you see it? I’ve forgotten what it says. I always forget what it says.',
        choices: [{ text: '“A rest, for what should be let go.”', to: 'rest', insight: 'duskweaver_rest_page', trust: 1 }],
      },
      rest: { speaker: NX, mood: 'sad', text: 'A rest. Like in music. A space where nothing is played, so you can hear what came before. The first Keepers kept a rest, and we filled it. Remember that for me, dear, would you? You’re so much better at it than I am.', next: null },
    },
  },
  {
    id: 'dialogue:duskweaver-nyx-confess', name: 'Mentor: What Nyx Gave Away (confession)', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: NX, mood: 'sad', text: 'I had a sister. Younger. Grey-eyed, sharp as a pin, frightfully rude. Forty years ago we had a quarrel, a terrible one, about the Veil and the Keepers and which of us was right, and she ran off to the warrens and never came back.', next: 'gave' },
      gave: {
        speaker: NX, text: 'And I couldn’t bear to remember what I’d said. So I went to the Gardens and gave it away. The quarrel. All of it. I don’t remember a word. I only remember that I did it.',
        choices: [
          { text: 'Do you want it back?', to: 'back' },
          { text: 'What was her name?', to: 'sister' },
        ],
      },
      sister: { speaker: NX, text: 'Mab. Mabyn, properly, but she’d bite you. Grey Mab, they call her now, in the warrens, I hear. She’s a thief. Of course she is. She always took the last biscuit.', next: 'back' },
      back: { speaker: NX, text: 'I don’t know. Find the flower for me. It’ll be grey, and tall, and facing away from the Obelisk. Everything of Mab’s faces away from the Obelisk.', next: null },
    },
  },
  {
    id: 'dialogue:obj-nyx-quarrel-flower', name: 'Mentor: the flower of the quarrel', scope: 'party',
    entries: [{ when: stage('quest:duskweaver-what-nyx-gave-away', 'flower'), node: 'flower' }, { node: 'bed' }],
    nodes: {
      flower: { speaker: 'narrator', text: 'At the far end of the Gardens, past the last bed anybody tends, a grey flower taller than you, with its face turned away from the Obelisk, towards the warrens. When you brush it you hear two young women shouting, and one of them is crying, and then you take your hand away.', next: null },
      bed: { speaker: 'narrator', text: 'A tall grey flower at the end of the Gardens, facing the warrens.', next: null },
    },
  },
  {
    id: 'dialogue:duskweaver-nyx-letter', name: 'Mentor: What Nyx Gave Away (the letter)', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: NX, text: 'Still there? Still growing? Forty years. (She sits with her hands in her lap.) No. No, leave it. I don’t want to remember what I said. I want to say something else.',
        choices: [
          { text: 'Then write to her.', to: 'write' },
          { text: 'You could go to the warrens.', to: 'go' },
        ],
      },
      go: { speaker: NX, text: 'I would get lost on the third bridge and someone would steal my shoes and it would be her. No. I’ll write. A letter can’t forget its way.', next: 'write' },
      write: { speaker: 'narrator', text: 'She writes it at the Lodge table while you watch, slowly, crossing nothing out. When it is done she folds it, and addresses it to “Mabyn, the Veilwarrens, the third bridge, please ask anyone”, and puts it in her pocket.', effects: [{ setFlag: 'duskweaver.nyx_letter', value: true }, { trust: NX, delta: 1 }], next: 'end' },
      end: { speaker: NX, mood: 'happy', text: 'There. I may not send it. But it exists, and I know what it says, and that’s more than I’ve had for forty years. Thank you, {player.name}.', next: null },
    },
  },
  // ---------- Vane (general)
  {
    id: 'dialogue:duskweaver-vane', name: 'Vane (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: OV, text: '{player.name}. Tea? I always have the pot on. Somebody in this queue always needs a cup.',
        choices: [
          { text: 'How do you keep track of everyone?', to: 'track' },
          { text: 'Do you ever forget anything?', to: 'forget' },
          bye,
        ],
      },
      track: { speaker: OV, text: 'I write it down. Then I write down where I wrote it down. It isn’t magic, mostly. It’s filing. Filing is a kind of love, if you do it properly.', next: null },
      forget: { speaker: OV, mood: 'sad', text: 'No. Never. Not since I was a boy. (He refills your cup, though it is full.) I find I can’t bear the idea.', next: null },
    },
  },
  // ---------- the Lanternless Streets: Ambrose, the Fairweathers, Murk (bounties)
  {
    id: 'dialogue:duskweaver-ambrose', name: 'Old Ambrose Hewlett (the Sweeper’s Detours)',
    entries: [{ when: stage('quest:duskweaver-the-sweepers-detours', 'ambrose'), node: 'right' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ambrose-hewlett', text: 'Mind the post. (There is no post.) Everyone says, “Of course, Ambrose,” and steps round it with me, very kind, and thinks I’m losing my wits. I’d rather they stepped through it and told me I was wrong.',
        choices: [
          offer('quest:duskweaver-the-sweepers-detours', 'What post, Ambrose?', 'post', done('quest:duskweaver-the-bell-at-dusk')),
          bye,
        ],
      },
      post: { speaker: 'npc:ambrose-hewlett', text: 'The lamp-posts. Duskmere had lamp-posts once, all down this street, before the Keepers melted them down for the Obelisk’s new bands. I sweep round where they stood. Come and look when the moon’s up. You’ll see. Or you won’t, and I’ll stop.', next: null },
      right: {
        speaker: 'npc:ambrose-hewlett', mood: 'happy', text: 'You saw them? The shadows? Standing in a row, like the posts never left? (He leans on his broom and laughs until he has to wipe his eyes.) Thirty years. Thirty years of “Of course, Ambrose.”',
        choices: [{ text: 'You were right all along.', to: 'end', trust: 1 }, { text: 'Shall I tell the others?', to: 'tell' }],
      },
      tell: { speaker: 'npc:ambrose-hewlett', text: 'No. Let them keep stepping round them. It’s good manners, stepping round a thing that was there. I only wanted somebody to know it was.', next: 'lamp' },
      end: { speaker: 'npc:ambrose-hewlett', text: 'I was. I was right. I shall sweep round them prouder now.', next: 'lamp' },
      lamp: {
        speaker: 'npc:ambrose-hewlett', mood: 'sad', text: 'I lit them, you know. Forty years, every dusk, with a pole and a flame on the end. When the Keepers took the posts I kept one lamp back. Just the lamp. It’s in the old lamp-store at the end of the street. I’ve never been able to look at it.',
        choices: [{ text: 'I’ll look at it for you.', to: null, quest: true }],
      },
    },
  },
  {
    id: 'dialogue:obj-lamp-shadows-post', name: 'The Sweeper’s Detours: the street at moonrise', scope: 'party',
    entries: [
      { when: { all: [stage('quest:duskweaver-the-sweepers-detours', 'posts'), MOONRISE] }, node: 'moon' },
      { when: stage('quest:duskweaver-the-sweepers-detours', 'posts'), node: 'dusk' },
      { node: 'street' },
    ],
    nodes: {
      street: { speaker: 'narrator', text: 'Ambrose’s street, swept in long careful curves round nothing.', next: null },
      dusk: { speaker: 'narrator', text: 'A dusky street with nothing in it but the curves of Ambrose’s broom. The moon is not up yet. Ambrose said to come back when it is.', next: null },
      moon: {
        speaker: 'narrator', text: 'The moon comes up over the roofs, and down the whole length of the street, in a perfect row, stand the shadows of lamp-posts. Tall, iron, curly at the top, each throwing the shadow of a little lamp. There are no posts. There have been no posts for thirty years. Their shadows stayed.',
        effects: [{ setFlag: 'duskweaver.lamp_shadows', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:duskweaver-ottoline', name: 'Ottoline Fairweather (Courtesy Calls)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ottoline-fairweather', text: 'How do you do. Ottoline Fairweather. I’m about to introduce myself to my husband; I do it every morning, and he’s always charmed. (Quietly.) He’s forgetting me, dear. He doesn’t know I know.',
        choices: [
          offer('quest:duskweaver-courtesy-calls', 'Could you write something down, for him to read?', 'card', done('quest:duskweaver-the-bell-at-dusk')),
          bye,
        ],
      },
      card: { speaker: 'npc:ottoline-fairweather', text: 'A card! About how we met! On the mantel, for every night. I only remember half of it: it was raining, and he had a blue umbrella. Ask Horace for the other half. Don’t tell him why.', next: null },
    },
  },
  {
    id: 'dialogue:duskweaver-ottoline-card', name: 'Courtesy Calls: the card on the mantel', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: {
      read: { speaker: 'npc:ottoline-fairweather', mood: 'happy', text: '(She reads it twice, and then a third time, holding it at arm’s length.) He was carrying the umbrella for somebody else. And he gave it to me. I didn’t know that. Or I did, and I’d forgotten. Either way I know it now.', next: 'end' },
      end: { speaker: 'npc:ottoline-fairweather', text: 'He’s forgetting me, and I’m forgetting him, and neither of us said. Now there’s a card. That’s better than saying. Thank you, dear. How do you do. I’m Ottoline.', next: null },
    },
  },
  {
    id: 'dialogue:duskweaver-horace', name: 'Horace Fairweather',
    entries: [{ when: stage('quest:duskweaver-courtesy-calls', 'horace'), node: 'how' }, { node: 'start' }],
    nodes: {
      start: { speaker: 'npc:horace-fairweather', text: 'Have you met my wife? Charming woman. I meet her every morning. Every morning I can’t believe my luck.', next: null },
      how: {
        speaker: 'npc:horace-fairweather', text: 'How we met? (He brightens.) Rain. Pouring. I had my sister’s blue umbrella and a girl in a yellow coat was standing under a lamp-post getting soaked, so I gave it her and walked home wet. My sister never forgave me. (Quietly.) Is this for a card? She’s forgetting me, you know. She doesn’t know I know.',
        choices: [
          { text: 'She knows you know. Neither of you has said.', to: 'both' },
          { text: 'It’s for a card.', to: 'card' },
        ],
      },
      both: { speaker: 'npc:horace-fairweather', mood: 'sad', text: 'Oh. Oh, the silly woman. Oh, the pair of us. (He takes out a handkerchief and doesn’t use it.) Write it down, then. Both halves.', next: null },
      card: { speaker: 'npc:horace-fairweather', text: 'Then write it down. A yellow coat, a blue umbrella. Get the colours right. She always liked the colours right.', next: null },
    },
  },
  {
    id: 'dialogue:obj-fairweather-writing-desk', name: 'Courtesy Calls: writing the card', scope: 'party',
    entries: [{ when: stage('quest:duskweaver-courtesy-calls', 'card'), node: 'write' }, { node: 'desk' }],
    nodes: {
      write: {
        speaker: 'narrator', text: 'A little writing desk by the window, a card, and two halves of one story. How do you begin it?',
        choices: [
          { text: '“It was raining, and you had a yellow coat.”', to: 'rain', effects: [{ setFlag: 'duskweaver.card', value: 'rain' }] },
          { text: '“You were each other’s luck, and you still are.”', to: 'luck', effects: [{ setFlag: 'duskweaver.card', value: 'luck' }] },
        ],
      },
      rain: { speaker: 'narrator', text: 'You write it plainly, both halves, the yellow coat and the blue umbrella and the walk home wet. At the bottom, in your best hand: “Read this every night. You are both remembering it together.”', next: null },
      luck: { speaker: 'narrator', text: 'You write the luck first, and then the rain, and the umbrella, and the coat. At the bottom, in your best hand: “Read this every night. You are both remembering it together.”', next: null },
      desk: { speaker: 'narrator', text: 'The Fairweathers’ writing desk, and on the mantel above it a card, propped where both of them can see it.', next: null },
    },
  },
  {
    id: 'dialogue:duskweaver-murk', name: 'Constable Tybalt Murk (bounties)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:tybalt-murk', text: 'Constable Murk. Night constable. It’s always night-ish here, so it’s always me. Bounties, if you want them. Everybody forgets to collect. I keep the money in a sock.',
        choices: [
          offer('quest:duskweaver-bounty-belfry-bats', 'The bats in the bell tower?', 'bats', done('quest:duskweaver-chalk-the-doors')),
          offer('quest:duskweaver-bounty-old-ninefingers', 'Old Ninefingers?', 'nine', done('quest:duskweaver-the-flower-thieves')),
          bye,
        ],
      },
      bats: { speaker: 'npc:tybalt-murk', text: 'Void Bats. They come down at moonrise and eat the shadows off people’s hats. You don’t notice till you take your hat off and it’s just a hat. Six of them. Or seven. I lost count, which is the trouble with bats.', next: null },
      nine: { speaker: 'npc:tybalt-murk', mood: 'afraid', text: 'A Night Spider in the Gardens with nine legs. Everyone’s counted. Twice. Nobody likes the answer. It keeps webbing the paths and catching gardeners, and Marigold Thrupp is threatening to deal with it herself, with a rake.', next: null },
    },
  },
  // ---------- the Memory Gardens: Marigold, Bartholomew Cobble, Posy
  {
    id: 'dialogue:duskweaver-marigold', name: 'Marigold Thrupp (general, the Bed of Small Things)',
    entries: [{ when: stage('quest:duskweaver-the-bed-of-small-things', 'marigold'), node: 'wilt' }, { node: 'start' }],
    nodes: {
      start: { speaker: MT, text: 'Mind the beds. Every one of those is somebody. Weeds are somebody too, mind, they’re just somebody you’d rather not be.', next: null },
      wilt: {
        speaker: MT, text: 'Posy’s nan? It wilts because she plants it in moonlight. Moonlight’s for remembering hard; it burns them. You want moonshade: the shade the moon throws. Things keep in moonshade. You can visit them there without wearing them out.',
        choices: [{ text: 'Like a rest.', to: 'rest', insight: 'duskweaver_rest_page' }, { text: 'I’ll show her.', to: null }],
      },
      rest: { speaker: MT, text: 'Just like a rest. The first Keepers kept a bed for exactly that, they say, where things went that ought to be let go. And left the first page of the register blank for the same reason. We filled the bed with roses. Very pretty. Wrong.', next: null },
    },
  },
  {
    id: 'dialogue:duskweaver-cobble', name: 'Bartholomew Cobble (His Radiance)',
    entries: [{ when: stage('quest:duskweaver-his-radiance', 'cobble'), node: 'after' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:bartholomew-cobble', text: 'We are pleased to receive you. You may kneel. Mind the lasts. (He is wearing a paper crown and resoling a boot with great dignity.) We remember being a prince. It is a very great comfort.',
        choices: [
          offer('quest:duskweaver-his-radiance', 'Your Highness, the Cult planted something in your bed.', 'weed', done('quest:duskweaver-the-flower-thieves')),
          bye,
        ],
      },
      weed: { speaker: 'npc:bartholomew-cobble', text: 'A weed? In the royal bed? (He considers this.) We have never been so happy, subject. Our customers say our prices have gone up. They have. Princes do not cobble cheaply. Do what you think right. We shall abide by it, regally.', next: null },
      after: {
        speaker: 'npc:bartholomew-cobble', text: '(He looks up from his last.)',
        choices: [
          { text: 'How are you feeling, Bartholomew?', to: 'pulled', when: { flag: 'duskweaver.cobble', value: 'pulled' } },
          { text: 'How are you feeling, Your Highness?', to: 'crowned', when: { flag: 'duskweaver.cobble', value: 'crowned' } },
        ],
      },
      pulled: { speaker: 'npc:bartholomew-cobble', mood: 'sad', text: 'Bartholomew. Yes. Cobbler. I had a crown on, didn’t I? Paper. (He takes it off and looks at it.) I was very happy. I don’t think I was a very good cobbler. I’ll keep the crown on the shelf. It was a nice week.', next: 'boy' },
      crowned: { speaker: 'npc:bartholomew-cobble', mood: 'happy', text: 'Our gratitude is boundless. We have decided to lower our prices, as an act of royal clemency. You may have your boots soled free, for ever. Kneel. No, the other knee.', next: 'boy' },
      boy: { speaker: 'npc:bartholomew-cobble', text: 'One thing, though. In the prince-memory I was a boy, with a pageant crown, and everyone cheering. A real boy. Somebody remembered being him, once. Somebody ought to find out who, and tell the Gardens. Marigold will know.', next: null },
    },
  },
  {
    id: 'dialogue:obj-prince-weed', name: 'His Radiance: the prince-weed', scope: 'party',
    entries: [{ when: stage('quest:duskweaver-his-radiance', 'weed'), node: 'weed' }, { node: 'bed' }],
    nodes: {
      weed: {
        speaker: 'narrator', text: 'In Bartholomew Cobble’s bed, among small brown flowers of boots and lasts and a dog he had as a boy, a tall gold weed with a crown-shaped bloom, humming a march.',
        choices: [
          { text: '(Pull it up by the root.)', to: 'pulled', effects: [{ setFlag: 'duskweaver.cobble', value: 'pulled' }] },
          { text: '(Leave it. Let him keep his crown.)', to: 'crowned', effects: [{ setFlag: 'duskweaver.cobble', value: 'crowned' }] },
        ],
      },
      pulled: { speaker: 'narrator', text: 'It comes up with a sound like a trumpet being sat on. The little brown flowers straighten up at once, relieved.', next: null },
      crowned: { speaker: 'narrator', text: 'You leave it. It hums a little louder, as if it knows. The little brown flowers lean away from it, but not very far.', next: null },
      bed: { speaker: 'narrator', text: 'Bartholomew Cobble’s memory-bed: boots, lasts, a dog, and whatever you left.', next: null },
    },
  },
  {
    id: 'dialogue:duskweaver-posy', name: 'Posy (the Bed of Small Things)',
    entries: [{ when: stage('quest:duskweaver-the-bed-of-small-things', 'posy'), node: 'kept' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:posy', text: 'I’m planting my nan. She’s a flower. She keeps wilting. I’m going to plant her again tomorrow. I’ve planted her forty times.',
        choices: [
          offer('quest:duskweaver-the-bed-of-small-things', 'Let me find out why it wilts.', 'why', done('quest:duskweaver-the-flower-thieves')),
          bye,
        ],
      },
      why: { speaker: 'npc:posy', text: 'It’s not a why. It’s a nan. But you can find out if you want. I’ll wait. I’m very good at waiting. I’m better at planting.', next: null },
      kept: {
        speaker: 'npc:posy', mood: 'happy', text: 'She’s standing up! She’s still standing up! (She crouches down nose to petal.) Hello, Nan. It’s Posy. I brought you here so you can stay.',
        choices: [{ text: 'You can visit her every day now.', to: 'visit', trust: 1 }, { text: 'Well done, Posy.', to: null }],
      },
      visit: { speaker: 'npc:posy', text: 'Every day. And I won’t have to plant her again. I can just come and say things. She liked it when I said things.', next: null },
    },
  },
  {
    id: 'dialogue:obj-posy-moonshade-bed', name: 'The Bed of Small Things: moonshade', scope: 'party',
    entries: [{ when: stage('quest:duskweaver-the-bed-of-small-things', 'plant'), node: 'plant' }, { node: 'bed' }],
    nodes: {
      plant: { speaker: 'narrator', text: 'You find the place where the yew’s shadow falls when the moon is behind it, and plant Posy’s small white flower there. It droops, the way all of them droop. Then, slowly, it lifts its head, and stays lifted.', next: null },
      bed: { speaker: 'narrator', text: 'A small white flower in the moonshade under the yew, standing up straight.', next: null },
    },
  },
  // ---------- Obelisk Plaza: Jasper Grubb, Linnet Dray, Rosamund Hesketh
  {
    id: 'dialogue:duskweaver-jasper', name: 'Jasper Grubb (What Jasper Queued For)',
    entries: [{ when: stage('quest:duskweaver-what-jasper-queued-for', 'jasper'), node: 'ticket' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:jasper-grubb', text: 'Morning! Eleven years in this queue and I couldn’t tell you what for. Lovely queue, though. That’s Mrs Abney, we play cards. That’s young Fennel, he does the tea run. I’ve never been so popular.',
        choices: [
          offer('quest:duskweaver-what-jasper-queued-for', 'Don’t you want to know what you came for?', 'know', done('quest:duskweaver-the-mnemosarchs-queue')),
          bye,
        ],
      },
      know: { speaker: 'npc:jasper-grubb', text: 'It’ll be on my ticket. I use it as a bookmark. Have a look if you like. I’m in no hurry. That’s rather the point of me.', next: null },
      ticket: {
        speaker: 'npc:jasper-grubb', text: 'Well? What does it say?',
        choices: [
          { text: '“To remember: whether I was lonely.”', to: 'lonely', effects: [{ setFlag: 'duskweaver.jasper', value: 'told' }] },
          { text: '(Fold the ticket back into his book.) Nothing worth leaving the queue for.', to: 'stay', effects: [{ setFlag: 'duskweaver.jasper', value: 'stays' }] },
        ],
      },
      lonely: { speaker: 'npc:jasper-grubb', mood: 'sad', text: 'Whether I was lonely. (He looks down the queue at Mrs Abney, and young Fennel, and the others.) Well. I was, then. I must have been. (He laughs.) I’m not now. I think I’ll stay in the queue anyway. I’ll let people go in front of me.', next: 'front' },
      stay: { speaker: 'npc:jasper-grubb', mood: 'happy', text: 'Nothing worth leaving for! I knew it. Back to the cards, then. Mrs Abney owes me a biscuit.', next: 'front' },
      front: { speaker: 'npc:jasper-grubb', mood: 'afraid', text: 'Only… I’m nearly at the front. Six more. When I get there they’ll hand me a phial and I’ll have to go home. Could you ask the Mnemosarch if a man can keep his place? He’s very kind about rules. He makes them.', next: null },
    },
  },
  {
    id: 'dialogue:obj-jasper-queue-ticket', name: 'What Jasper Queued For: the ticket',
    entries: [{ when: stage('quest:duskweaver-what-jasper-queued-for', 'ticket'), node: 'read' }, { node: 'book' }],
    nodes: {
      read: { speaker: 'narrator', text: 'A queue ticket, eleven years old, soft as cloth, marking page two hundred of a book about pigeons. In faded Keeper’s ink: “J. Grubb. To remember: whether I was lonely.”', next: null },
      book: { speaker: 'narrator', text: 'A book about pigeons with a queue ticket in it for a bookmark.', next: null },
    },
  },
  {
    id: 'dialogue:duskweaver-linnet', name: 'Linnet Dray (Two Names)',
    entries: [{ when: stage('quest:duskweaver-two-names', 'linnet'), node: 'found' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:linnet-dray', text: 'We were meant to be married on Thursday. Edmund has his kept name all ready to give me. And mine’s gone. Out of the register, clean. I can’t give him nothing. You can’t marry with nothing.',
        choices: [
          offer('quest:duskweaver-two-names', 'I’ll look in the register for you.', 'look', done('quest:duskweaver-the-mnemosarchs-queue')),
          bye,
        ],
      },
      look: { speaker: 'npc:linnet-dray', text: 'Would you? The lower register, fourth book. Edmund’s gone to sit with his mother; she cries at everything, she’ll cry at this. Please find it before Thursday.', next: null },
      found: {
        speaker: 'npc:linnet-dray', mood: 'happy', text: 'That’s it. That’s my name. (She holds the slip in both hands.) Where was it?',
        choices: [
          { text: 'Filed. In the Mnemosarch’s own drawer, in his own hand.', to: 'vane' },
          { text: 'Somewhere safe. It doesn’t matter now.', to: 'safe' },
        ],
      },
      vane: { speaker: 'npc:linnet-dray', mood: 'afraid', text: 'The Mnemosarch? He gave my mother tea when my father died. Why would he… (She folds the slip very small and holds it tight.) Thursday. Come to the wedding. I want someone there who knows where it’s been.', next: null },
      safe: { speaker: 'npc:linnet-dray', text: 'Then it can stay safe with Edmund now. Thursday. Come to the wedding. Bring nothing. Everybody brings something.', next: null },
    },
  },
  {
    id: 'dialogue:obj-register-linnet-entry', name: 'Two Names: Linnet’s line',
    entries: [{ when: stage('quest:duskweaver-two-names', 'register'), node: 'blank' }, { node: 'line' }],
    nodes: {
      blank: { speaker: 'narrator', text: 'The fourth book of the lower register. DRAY, LINNET, used name, and beside it, where her kept name should be, a clean pale space. Not smudged. Not faded. Lifted, very neatly, with a Keeper’s knife.', next: null },
      line: { speaker: 'narrator', text: 'Linnet Dray’s line in the register, with her kept name written back in, in your hand.', next: null },
    },
  },
  {
    id: 'dialogue:obj-vane-filing-drawer', name: 'Two Names: the Mnemosarch’s drawer',
    entries: [{ when: stage('quest:duskweaver-two-names', 'drawer'), node: 'found' }, { node: 'drawer' }],
    nodes: {
      found: { speaker: 'narrator', text: 'In the bottom drawer of the Mnemosarch’s desk, among a thousand neat slips, one labelled in his tidy hand: “DRAY, L. Kept name. Removed for safe keeping. She would lose it.” The name is folded inside.', next: null },
      drawer: { speaker: 'narrator', text: 'The Mnemosarch’s filing drawer, every slip in perfect order.', next: null },
    },
  },
  {
    id: 'dialogue:duskweaver-rosamund', name: 'Rosamund Hesketh (general)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:rosamund-hesketh', text: 'I lost my husband and both my boys on the night of the Hollowing. People say it gets easier. It doesn’t get easier. It gets heavier, and you get stronger. Good evening.', next: null } },
  },
  // ---------- the Archive of Shadows: Peregrine Moll, the cat's shadow
  {
    id: 'dialogue:duskweaver-moll', name: 'Under-Keeper Moll (Bottled Shadows)',
    entries: [{ when: stage('quest:duskweaver-bottled-shadows', 'moll'), node: 'ring' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:peregrine-moll', text: 'Mind the floor! That’s a shadow. That’s a shadow too. Under-Keeper Moll. I have four runaways loose in the stacks and a butterfly net, and I am losing.',
        choices: [
          offer('quest:duskweaver-bottled-shadows', 'I can weave them back into their bottles.', 'help', done('quest:duskweaver-the-mnemosarchs-queue')),
          bye,
        ],
      },
      help: { speaker: 'npc:peregrine-moll', mood: 'happy', text: 'Can you? A Duskweaver, in my Archive, being useful. Four of them: a hatstand, a goose, an alderman, and something I’m not sure about. And while you’re in the east stacks, there’s a very old bottle I’ve never dared open.', next: null },
      ring: {
        speaker: 'npc:peregrine-moll', mood: 'sad', text: 'Twelve? In a ring? From C. 0? Those would be the champions at the signing of the Concord, then. One for each school. (He takes his spectacles off.) And one of them holding the others’ hands? Which one?',
        choices: [
          { text: 'I couldn’t tell. A shadow doesn’t wear a school.', to: 'tell' },
          { text: 'One on the far side, reaching across. There was a space in the middle.', to: 'middle', insight: 'champions_middle' },
        ],
      },
      tell: { speaker: 'npc:peregrine-moll', text: 'No. No, it doesn’t, does it. That’s the nicest thing about shadows. I’ll put it back very carefully, and put a new label on it.', next: null },
      middle: { speaker: 'npc:peregrine-moll', mood: 'afraid', text: 'A space in the middle of twelve. (He writes that down, with a shaking hand.) I don’t know what that means. I’ll file it under things I don’t know. It’s a large file.', next: null },
    },
  },
  {
    id: 'dialogue:obj-runaway-shadow-1', name: 'Bottled Shadows: the goose',
    entries: [{ when: stage('quest:duskweaver-bottled-shadows', 'catch'), node: 'goose' }, { node: 'bottle' }],
    nodes: {
      goose: { speaker: 'narrator', text: 'The shadow of a goose, very cross, hissing silently along the bottom of the east stacks. You draw a thread of dusk across its path and it walks into its own bottle out of sheer bad temper.', next: null },
      bottle: { speaker: 'narrator', text: 'A bottled goose-shadow, glaring through the glass.', next: null },
    },
  },
  {
    id: 'dialogue:obj-champions-bottle', name: 'Bottled Shadows: the oldest bottle', scope: 'party',
    entries: [{ when: stage('quest:duskweaver-bottled-shadows', 'champions'), node: 'open' }, { node: 'bottle' }],
    nodes: {
      open: { speaker: 'narrator', text: 'You hold the oldest bottle up to the moon. Inside, twelve shadows stand in a ring, each with a hand on the shoulder of the next, as if they had just finished swearing something. One of them, on the far side, has reached across the middle of the ring, where there is nobody, as if to hold the hand of someone who is not there.', next: null },
      bottle: { speaker: 'narrator', text: 'A very old bottle, relabelled in Moll’s hand: THE TWELVE, C. 0. HANDLE AS IF IT WERE YOUR OWN.', next: null },
    },
  },
  {
    id: 'dialogue:duskweaver-cat-shadow', name: 'The Shadow of a Cat',
    entries: [
      { when: { all: [stage('quest:duskweaver-the-shadow-of-a-cat', 'cat'), { not: { flag: 'duskweaver.cat' } }] }, node: 'sit' },
      { when: { flag: 'duskweaver.cat', value: 'following' }, node: 'follows' },
      { node: 'start' },
    ],
    nodes: {
      start: {
        speaker: 'npc:cat-shadow', text: '(On the third shelf of the west stacks, the shadow of a cat is sitting with its tail curled round its feet. There is no cat. It looks at you, the way cats look at people, as if you were late.)',
        choices: [
          offer('quest:duskweaver-the-shadow-of-a-cat', '(Sit down beside it.)', 'wait', done('quest:duskweaver-the-mnemosarchs-queue')),
          bye,
        ],
      },
      sit: {
        speaker: 'npc:cat-shadow', text: '(It lets you sit. After a while it leans, very slightly, against your shadow, the way a cat leans against a leg. Moll says its cat died nine years ago, on this shelf, in the sun. The shadow has not left.)',
        choices: [
          { text: '(Open your hands.) You can go now. It’s all right to go.', to: 'freed', school: 'umbral', effects: [{ setFlag: 'duskweaver.cat', value: 'freed' }] },
          { text: '(Stand up, and see if it follows.)', to: 'follows', effects: [{ setFlag: 'duskweaver.cat', value: 'following' }] },
          { text: 'You can go now, puss. It’s all right.', to: 'freed', effects: [{ setFlag: 'duskweaver.cat', value: 'freed' }] },
        ],
      },
      wait: { speaker: 'npc:cat-shadow', text: '(It moves along the shelf, exactly one cat’s length away from you, and looks past you at the Archive door. There is a chipped saucer on the step out there. It looks at the saucer, and then at you, as if you were being very slow.)', next: null },
      freed: { speaker: 'npc:cat-shadow', text: '(It stretches, long and slow, the way only a cat can, and jumps down off the shelf, and is gone between the stacks. A moment later, on the far wall, you are almost sure you see it again, sitting at your heels.)', next: null },
      follows: { speaker: 'npc:cat-shadow', text: '(It jumps down off the shelf and walks along beside your shadow, tail up, as if this had been the plan all along. It does not look back at the shelf. Cats never do.)', next: null },
    },
  },
  {
    id: 'dialogue:duskweaver-cat-brindlecross', name: 'The cat’s shadow, in Brindlecross',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:cat-shadow-brindlecross', text: '(The cat’s shadow from the Archive is sitting on the Brindlecross green in the last of the light, washing a shadow-paw. It came through the Dusk Gate behind you. It has been seen at Nan Briar’s window, having words with Parson.)', next: null } },
  },

  // ======================= ACT II
  {
    id: 'dialogue:hook-duskweaver-hobb', name: 'Hook: Old Hobb and the register (C-1)', scope: 'party',
    entries: [{ when: stage('quest:duskweaver-the-sextons-register', 'hobb'), node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:hobb', text: 'A Keeper. From Nocturne. (He leans on his spade.) We don’t get many Umbral folk this side, and I know where every one of them is buried and where every one of them sleeps. I keep the names. Somebody has to.',
        choices: [
          { text: 'I carry the Keepers’ seal.', to: 'seal', quest: true, when: { flag: 'duskweaver.mourners', value: 'kept' } },
          { text: 'What’s happening to Brindlecross?', to: 'forget', quest: true },
        ],
      },
      seal: { speaker: 'npc:hobb', mood: 'happy', text: 'The Obelisk’s seal! Then you’re family, near enough. I’ll not make you read it; I’ll tell you. Brindlecross is forgetting the Concord. And the Concord’s records were woven into the dark under the Gloamwood, long ago, by something with too many legs. They’re coming loose.', next: null },
      forget: { speaker: 'npc:hobb', text: 'Forgetting. Not people. The Concord. Folk who’ve sung the Turning songs all their lives can’t remember the second verse. There’s a page in my register I want you to read with your own eyes, because I don’t believe it. It’s in the lych-gate box.', next: null },
    },
  },
  {
    id: 'dialogue:obj-duskweaver-sexton-register', name: 'C-1 Hobb’s register', scope: 'party',
    entries: [{ when: stage('quest:duskweaver-the-sextons-register', 'register'), node: 'read' }, { when: stage('quest:duskweaver-the-spinner-below', 'write'), node: 'write' }, { node: 'box' }],
    nodes: {
      read: { speaker: 'narrator', text: 'Old Hobb’s register: every Umbral name in Concordia, and every grave. On the last page, in his crabbed hand, a list of Turning songs, and beside each one the date somebody in Brindlecross last remembered its second verse. The dates are getting closer together.', next: 'note' },
      note: { speaker: 'narrator', text: 'At the bottom, underlined: “Records kept in the dark under the Gloamwood, my gran said. Woven. Ask the spider.”', next: null },
      box: { speaker: 'narrator', text: 'The lych-gate box, with Hobb’s register inside, wrapped in oilcloth.', next: null },
      write: { speaker: 'narrator', text: 'Hobb’s register, open at the last page, where the Turning songs are listed and the dates of their second verses run closer and closer together. Under the last line, in your Keeper’s hand, small and square, you write the date, and: The Spinner Below is at rest. The records are no longer coming loose. They are only very old.', next: 'write2' },
      write2: {
        speaker: 'npc:hobb', text: '(Reading over your shoulder, lips moving.) Only very old. (He closes the book, gently.) That’s all right, then. So am I.',
        choices: [
          { text: 'Sing me the second verse, Hobb.', to: 'verse', trust: 1, trustNpc: 'npc:hobb' },
          { text: '(Put the register back in its box.)', to: null },
        ],
      },
      verse: { speaker: 'npc:hobb', mood: 'happy', text: '(He clears his throat, looks round the churchyard to be sure nobody living is listening, and sings it: the second verse of the Turning song, all of it, cracked and slow and right. Then he looks astonished.) Well. There it was. All along.', next: null },
    },
  },
  {
    id: 'dialogue:obj-duskweaver-record-thread-1', name: 'C-2 a thread: the first Turning',
    entries: [{ when: stage('quest:duskweaver-under-the-roots', 'threads'), node: 'play' }, { node: 'thread' }],
    nodes: {
      play: { speaker: 'narrator', text: 'You touch the thread and you are on a hill in C. 4, in a crowd. Twelve people in a ring are passing a crown from hand to hand, very carefully, as if it were hot. When it reaches the last of them, she laughs out loud with relief, and everyone on the hill laughs with her. Then the thread goes slack.', effects: [{ setFlag: 'duskweaver.thread_first', value: true }], next: null },
      thread: { speaker: 'narrator', text: 'A slack grey thread hanging from the roots, quiet now.', next: null },
    },
  },
  {
    id: 'dialogue:obj-duskweaver-record-thread-2', name: 'C-2 a thread: the Turning in the rain',
    entries: [{ when: stage('quest:duskweaver-under-the-roots', 'threads'), node: 'play' }, { node: 'thread' }],
    nodes: {
      play: { speaker: 'narrator', text: 'C. 520, the 44th Turning, in pouring rain. The Radiance Concordant hands the crown to the Umbral bearer. They have been quarrelling for a week, the whole Concord knows it. At the handover they both burst into tears, and the crowd pretends not to see. Then the thread goes slack.', effects: [{ setFlag: 'duskweaver.thread_rain', value: true }], next: null },
      thread: { speaker: 'narrator', text: 'A slack grey thread, still faintly damp.', next: null },
    },
  },
  {
    id: 'dialogue:obj-duskweaver-record-thread-3', name: 'C-2 a thread: the last good Turning',
    entries: [{ when: stage('quest:duskweaver-under-the-roots', 'threads'), node: 'play' }, { node: 'thread' }],
    nodes: {
      play: { speaker: 'narrator', text: 'C. 1000, the 84th Turning, at the hill chapel over the lake. An Abbess with her hands on a bell-rope, ringing, and all the bearers singing at once. A small boy in a blue coat in the front row is not singing; he is listening, so hard that his face is wet. Then the thread goes slack.', effects: [{ setFlag: 'duskweaver.thread_last', value: true }], next: null },
      thread: { speaker: 'narrator', text: 'A slack grey thread, humming very faintly, as if it had not quite finished.', next: null },
    },
  },
  {
    id: 'dialogue:duskweaver-spinner-remember', name: 'C-3 remember one for the Spinner', scope: 'party',
    entries: [{ node: 'ask' }],
    nodes: {
      ask: {
        speaker: 'narrator', mood: 'sad', text: 'As the mark settles in the last of the web, the Spinner speaks once more, from everywhere: Keeper. I cannot hold them any more. Remember one for me. Just one. So that it is somewhere.',
        choices: [
          { text: 'The first Turning. The one that ended with a laugh.', to: 'first', effects: [{ setFlag: 'duskweaver.spinner_turning', value: 'first' }] },
          { text: 'The Turning in the rain, when they both cried.', to: 'rain', effects: [{ setFlag: 'duskweaver.spinner_turning', value: 'rain' }] },
          { text: 'The last good one. The boy in the blue coat, listening.', to: 'last', insight: 'blue_coat_boy', effects: [{ setFlag: 'duskweaver.spinner_turning', value: 'last' }] },
        ],
      },
      first: { speaker: 'narrator', text: 'Yes, the Spinner says. That one. They were so frightened of dropping it. And it settles into the dark, and is quiet.', next: null },
      rain: { speaker: 'narrator', text: 'Yes, the Spinner says. That one. They made it up afterwards, you know. I wove that too. And it settles into the dark, and is quiet.', next: null },
      last: { speaker: 'narrator', text: 'Yes, the Spinner says, very low. That one. He was the only one listening. I always wondered what he heard. And it settles into the dark, and is quiet.', next: null },
    },
  },
  {
    id: 'dialogue:duskweaver-hester', name: 'C-4 Tabitha Cresset at the Lantern Shop', scope: 'party',
    entries: [{ when: stage('quest:duskweaver-the-mnemosarchs-lights', 'shop'), node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:hester-marchbank', text: 'A strange customer? I’ve had one every night this week. Lovely manners. Keeper’s coat, ink on his fingers, little dolls’ house under his arm. Buys drowned lights out of the ford, the ones the Queen sends out to lead folk under. Pays in silver, and doesn’t haggle.',
        choices: [
          { text: 'What does he want them for?', to: 'want', quest: true },
          { text: 'What’s in a drowned light?', to: 'light', quest: true },
        ],
      },
      light: { speaker: 'npc:hester-marchbank', text: 'The last thing a traveller saw before the water closed over them. That’s why they shine. You don’t want to look in one, love. I’ve looked in one. I keep a candle lit by the bed now.', next: 'want' },
      want: { speaker: 'npc:hester-marchbank', mood: 'afraid', text: 'He said he was keeping them. He said every one of them was somebody, and somebody ought to keep them. He said it so kindly I sold him three before I thought about it. There’s more out in the ford. He’ll be back for them.', next: null },
    },
  },
  {
    id: 'dialogue:obj-duskweaver-drowned-light-1', name: 'C-4 a drowned light', scope: 'party',
    entries: [{ when: stage('quest:duskweaver-the-mnemosarchs-lights', 'lights'), node: 'look' }, { node: 'light' }],
    nodes: {
      look: { speaker: 'narrator', text: 'A light bobbing in the reeds, cold and green. You look into it and see a farmer’s cart on a causeway at dusk, a lantern swinging ahead, a woman’s voice calling “Not that way, Tom, not that—”. Then the cart tips, and the light flickers, and you look away.', next: 'weave' },
      weave: {
        speaker: 'narrator', text: 'It is somebody. Vane is right about that.',
        choices: [
          { text: '(Weave a shadow round it, so it can be let go gently.)', to: 'gentle', school: 'umbral' },
          { text: '(Leave it bobbing in the reeds.)', to: null },
        ],
      },
      gentle: { speaker: 'narrator', text: 'You draw the dusk round it like a shawl. The light dims, slowly, and goes out the way a lamp goes out when somebody you love has turned it down for the night.', next: null },
      light: { speaker: 'narrator', text: 'A drowned light, bobbing cold and green in the reeds of the ford.', next: null },
    },
  },
  {
    id: 'dialogue:duskweaver-vane-ford', name: 'C-4 Vane at the Bog Market', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:oriel-vane-lanternford', text: '{player.name}. You came through. Of course you did. (He has his shadow city open on a market trestle. Down one side of it is a new street of tiny cottages, lit in every window by a drowned light.) Look. Brindlecross. I’m doing Concordia next.', next: 'why' },
      why: {
        speaker: 'npc:oriel-vane-lanternford', text: 'Every one of these lights is a traveller’s last memory. The Queen drowns them and throws the memories away. I’m keeping them. Nobody else is. Everybody deserves to be kept.',
        choices: [
          { text: 'They deserve to be let go.', to: 'go' },
          { text: 'You could give them a rest, Vane. Like the mourners.', to: 'rest', when: { flag: 'duskweaver.mourners', value: 'rest' } },
          { text: 'You can’t keep a person in a lamp.', to: 'lamp', school: 'umbral' },
        ],
      },
      go: { speaker: 'npc:oriel-vane-lanternford', mood: 'sad', text: 'Let go where? Into the water? That’s where they’ve been. (He closes the dolls’ house, carefully, the way you close a book on a pressed flower.) The Queen has the rest. I’ll buy them from her if I have to buy them one by one.', next: 'leave' },
      rest: { speaker: 'npc:oriel-vane-lanternford', mood: 'afraid', text: '(He goes very still, the way he went still on the Obelisk steps.) A rest. A space with nothing in it. (He shakes his head, quickly.) No. No, I’ve seen what nothing does. The Queen has the rest of the lights. I’ll buy them from her.', next: 'leave' },
      lamp: { speaker: 'npc:oriel-vane-lanternford', text: 'I can keep the bit of them that’s left. That’s more than the marsh does. The Queen has the rest. I’ll buy them from her if I have to.', next: 'leave' },
      leave: { speaker: 'npc:oriel-vane-lanternford', text: 'Somebody in the Heart has offered me a shelf that never ends. I’ll be going there soon. Mind the water, {player.name}. It keeps things too. Just not kindly.', next: null },
    },
  },
  {
    id: 'dialogue:duskweaver-tansy', name: 'C-6 the Keeper-courier', scope: 'party',
    entries: [{ when: stage('quest:duskweaver-a-letter-from-nyx', 'letter'), node: 'start' }, { node: 'after' }],
    nodes: {
      start: { speaker: 'npc:tansy-fogg', text: 'Tansy Fogg, Keeper-courier. I’m so sorry. The Loremistress addressed it to “Ondine”, then ran after me to the Lodge gate and wrote over it, and I’ve still been asking for an Ondine all down the long dusk road. Here.', next: 'envelope' },
      envelope: { speaker: 'narrator', text: 'The envelope says ONDINE in Nyx’s lovely sloping hand, crossed out, and under it, in a shakier hand, pressing hard, your own name, spelled right.', next: 'letter' },
      letter: {
        speaker: NX, text: '“My dear. The Obelisk has stopped leaking quite so much, and Marigold says the beds the Cult cut are flowering again, and people sit by them. I am writing your name on everything. I wrote it on the cat. There is no cat. Come home and tell me if I have it right.”',
        choices: [
          { text: '(Read the signature.)', to: 'kept', when: KNOWS },
          { text: '(Fold the letter away.)', to: 'end', quest: true, when: { not: KNOWS }, effects: [{ setFlag: 'duskweaver.nyx_letter_read', value: true }] },
        ],
      },
      kept: { speaker: 'narrator', text: 'She has signed it Halcyon. Her kept name, in ink, where anyone might read it, so that it is somewhere. Under it, very small: “P.S. I have written to my sister. I have not sent it. I have written to her again.”', next: 'fold' },
      fold: {
        speaker: 'narrator', text: 'It is the greatest trust there is, in Nocturne.',
        choices: [{ text: '(Fold the letter away, very carefully.)', to: 'end', quest: true, effects: [{ setFlag: 'duskweaver.nyx_letter_read', value: true }] }],
      },
      end: { speaker: 'npc:tansy-fogg', text: 'I’m to wait for an answer, she said, and then she said not to, and then she said to bring back whatever you say, even if it’s nothing. So. Anything you say. Even nothing.', next: null },
      after: { speaker: 'npc:tansy-fogg', text: 'I’m not going back until I’ve seen the Stone Court. The Loremistress said I might as well, since I’d forget the way anyway.', next: null },
    },
  },
  // ---------- featured bearers (hooks on the bearer NPCs)
  {
    id: 'dialogue:duskweaver-featured-rimecaller', name: 'Featured: The Frozen Hour', scope: 'party',
    entries: [
      { when: stage('quest:duskweaver-the-frozen-hour', 'back'), node: 'back' },
      { when: { all: [stage('quest:duskweaver-the-frozen-hour', 'light'), { not: { flag: 'duskweaver.ilse_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-rimecaller', text: 'You’re the memory-mage. Good. There’s one drowned light left in the ford at Lanternford that nobody has bought. I want to freeze it. If it’s frozen, the memory in it stays exactly as it is, for ever. Nothing lost. Tell me that isn’t right.',
        choices: [{ text: 'I’ve met someone who wanted that. Come and show me.', to: null, quest: true, effects: [{ setFlag: 'duskweaver.ilse_asked', value: true }] }],
      },
      back: {
        speaker: 'npc:bearer-rimecaller', text: 'I’ve been thinking about the light. I still think some things should be kept still. I just don’t think I get to be the one who decides which, any more than he does. That’s uncomfortable. When we go to the Heart, I’d like you to keep the memory of it, and I’ll keep it cold.',
        effects: [{ setFlag: 'duskweaver.ilse_thanked', value: true }],
        choices: [{ text: 'Between us, then.', to: null }, { text: 'Thank you, Ilse.', to: null }],
      },
    },
  },
  {
    id: 'dialogue:obj-duskweaver-last-light', name: 'Featured: the last light in the ford', scope: 'party',
    entries: [{ when: { all: [stage('quest:duskweaver-the-frozen-hour', 'light'), { not: { flag: 'duskweaver.frozen_hour' } }] }, node: 'light' }, { node: 'done' }],
    nodes: {
      light: {
        speaker: 'narrator', text: 'The last drowned light in the ford: a child’s memory, a bright kitchen, somebody singing while they cut bread. Ilse Winterbourne holds her hand over it, and frost is already feathering the water around it. She looks at you.',
        choices: [
          { text: 'Freeze it. Let it be kept, exactly as it is.', to: 'freeze', effects: [{ setFlag: 'duskweaver.frozen_hour', value: 'frozen' }] },
          { text: 'Let it go out. It’s been waiting to.', to: 'out', effects: [{ setFlag: 'duskweaver.frozen_hour', value: 'out' }] },
          { text: 'Weave it into a shadow. Somewhere it can be visited.', to: 'shadow', school: 'umbral', effects: [{ setFlag: 'duskweaver.frozen_hour', value: 'shadow' }] },
        ],
      },
      freeze: { speaker: 'narrator', text: 'The light stops bobbing. The kitchen stops. The singer stops mid-word, the knife halfway through the loaf, for ever. It is perfectly kept. Ilse looks at it for a long time, and does not seem as glad as she thought she would be.', next: null },
      out: { speaker: 'narrator', text: 'Ilse takes her hand away. The light bobs once, twice, and goes out, like a candle at bedtime. In the dark where it was, for a moment, you could swear you heard the end of the song.', next: null },
      shadow: { speaker: 'narrator', text: 'You draw the dusk round the light and it goes out into a little shadow on the Ford Keeper’s step: a kitchen, a loaf, someone singing. It will be there every evening when the sun goes down. Ilse sits on the step beside it and says nothing at all.', next: null },
      done: { speaker: 'narrator', text: 'The ford, dark and still, where the last light was.', next: null },
    },
  },
  {
    id: 'dialogue:duskweaver-featured-huntsman', name: 'Featured: Threads Under the Wood', scope: 'party',
    entries: [
      { when: stage('quest:duskweaver-threads-under-the-wood', 'back'), node: 'back' },
      { when: { all: [stage('quest:duskweaver-threads-under-the-wood', 'web'), { not: { flag: 'duskweaver.ulla_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-huntsman', text: 'Spiders don’t leave prints. I’ve been on this one’s trail under the Gloamwood for three days and all I’ve got is cobweb in my hair. You read threads, don’t you? Read these for me.',
        choices: [{ text: 'Show me the trail.', to: null, quest: true, effects: [{ setFlag: 'duskweaver.ulla_asked', value: true }] }],
      },
      back: {
        speaker: 'npc:bearer-huntsman', mood: 'happy', text: 'Every thread told you where it went and what it was carrying. That’s better than prints. That’s better than a hound. I’ve hunted forty years and I’ve never had a trail talk back. When we go to the Heart, you read, I’ll shoot.',
        effects: [{ setFlag: 'duskweaver.ulla_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-duskweaver-spinner-trail-1', name: 'Featured: a trail-thread',
    entries: [{ when: stage('quest:duskweaver-threads-under-the-wood', 'web'), node: 'read' }, { node: 'thread' }],
    nodes: {
      read: { speaker: 'narrator', text: 'You pinch the thread and it hums against your fingers: something very large passed this way, slowly, carrying a bundle of memories wrapped tight, going down. Ulla is already kneeling in the direction it points, like a hound.', next: null },
      thread: { speaker: 'narrator', text: 'A trail-thread in the root-caves, tagged with a twist of Huntsman’s twine.', next: null },
    },
  },
  // ======================= ACT III
  {
    id: 'dialogue:duskweaver-herald-fate', name: 'III-4 the Herald of Memory: Vane’s fate', scope: 'party',
    entries: [{ when: { flag: 'duskweaver.mourners', value: 'kept' }, node: 'kept' }, { node: 'kneel' }],
    nodes: {
      kneel: { speaker: OV, mood: 'hollow', text: '{player.name}. (He kneels on the stair, holding his robe together. Every stitch is a memory, and they are coming loose.) I remember every one. I remember your first fight in the Gardens. Please don’t make me lose them.', next: 'choose' },
      kept: { speaker: OV, mood: 'hollow', text: '{player.name}. You kept the mourners’ griefs, under lock, for me. I wore them all the way up the stairs, you know. (His robe is unravelling.) You kept them too. You understand.', next: 'choose' },
      choose: {
        speaker: OV, mood: 'sad', text: 'If I let go of one, I’ll lose them all. Nothing should be lost that anyone ever loved. That’s right, isn’t it? Tell me that’s right.',
        choices: [
          {
            text: 'There’s a place for them, Oriel. The Rest: they can be visited there, not carried. Put them down.', to: 'rest', quest: true,
            when: { flag: 'duskweaver.mourners', value: 'rest' }, lockedLabel: 'You need to know what a rest is for',
            effects: [{ setFlag: 'duskweaver.nemesis_fate', value: 'spared' }],
          },
          {
            text: '(Tell him Nyx’s kept name, and that she gave it away to keep it safe.)', to: 'name', quest: true,
            when: KNOWS, lockedLabel: 'You need Nyx’s kept name',
            effects: [{ setFlag: 'duskweaver.nemesis_fate', value: 'spared' }],
          },
          { text: 'Some things are meant to be forgotten. You first. (Unpick the robe.)', to: 'destroy', quest: true, effects: [{ setFlag: 'duskweaver.nemesis_fate', value: 'destroyed' }] },
        ],
      },
      rest: { speaker: 'narrator', text: 'You tell him about the Rest in the Memory Gardens: a bed of grey flowers, where Duskmere’s griefs are planted, and visited, and not carried home. He listens the way he listened on the Obelisk steps, very still.', next: 'let' },
      name: { speaker: 'narrator', text: 'You lean close and tell him, so the shadows won’t hear: Halcyon. Nyx gave it to you so that it would be kept somewhere if she forgot it. Not held. Kept. He goes very still.', next: 'let' },
      let: { speaker: OV, mood: 'sad', text: 'Somewhere. Not in me. (He looks down at the robe. Then, slowly, he lets go of the hem.) Oh. They’re still there. They’re still there when I’m not holding them.', next: 'let2' },
      let2: { speaker: 'narrator', text: 'The memories lift off him thread by thread, like moths off a lamp, and drift away down the Twelve Stairs towards the Legion. What is left on the step is a thin man with ink on his fingers, who has forgotten for a moment what he came for, and is smiling.', next: null },
      destroy: { speaker: 'narrator', text: 'You catch a loose thread and pull. The Herald of Memory comes apart stitch by stitch, every memory he took going free at once in a long, whispering cloud. When it clears, there is nothing on the stair but a cracked glass phial with no label.', next: null },
    },
  },
  {
    id: 'dialogue:obj-duskweaver-crown-name', name: 'Nyx’s Kept Name: the crown', scope: 'party',
    entries: [
      { when: { all: [{ heroClass: 'duskweaver' }, stage('quest:duskweaver-nyxs-kept-name', 'name'), { flag: 'duskweaver.nyx_devotable' }] }, node: 'devoted' },
      { when: { all: [{ heroClass: 'duskweaver' }, stage('quest:duskweaver-nyxs-kept-name', 'name'), { any: [{ flag: 'duskweaver.nyx_name' }, KNOWS] }] }, node: 'kept' },
      { when: { all: [{ heroClass: 'duskweaver' }, stage('quest:duskweaver-nyxs-kept-name', 'name')] }, node: 'known' },
      { node: 'step' },
    ],
    nodes: {
      kept: { speaker: 'narrator', text: 'From the top of the Twelve Stairs you can see straight through the Citadel to the throne room, where the crown hangs in its cage of tears. You open the silver locket Nyx gave you, take out the slip, and say it aloud to the crown: Halcyon.', next: 'kept2' },
      kept2: { speaker: 'narrator', text: 'The cage hums, very faintly, as if something inside it has written the name down. Now it is kept in two places, the crown and you, and neither of you is going to forget.', next: null },
      devoted: {
        speaker: 'narrator', text: 'From the top of the Twelve Stairs you can see straight through the Citadel to the throne room, where the crown hangs in its cage of tears. You open the silver locket Nyx gave you, take out the slip, and say it aloud to the crown: Halcyon.',
        effects: [{ trust: NX, set: 5 }], next: 'devoted2',
      },
      devoted2: { speaker: 'narrator', mood: 'happy', text: 'The cage hums faintly, as if something inside it has written the name down. Far away in Duskmere, at her desk under the Obelisk, Nyx Aubade looks up, says your name aloud to an empty room, perfectly, and smiles.', next: null },
      known: { speaker: 'narrator', text: 'From the top of the Twelve Stairs you can see straight through the Citadel to the crown in its cage of tears. You don’t know Nyx’s kept name; she never told you. But you know the name she gives everybody, and you can keep that.', next: 'known2' },
      known2: { speaker: 'narrator', text: 'So you say it aloud to the crown, clearly, the way she says yours on a good day: Nyx Aubade, Loremistress of the Moon Obelisk, who wrote your name on the cat. The cage hums faintly, as if it has written that down too.', next: null },
      step: { speaker: 'narrator', text: 'The top of the Twelve Stairs. A name was spoken here, and it is still here.', next: null },
    },
  },
  {
    id: 'dialogue:obj-duskweaver-stolen-phial-1', name: 'The Stolen Hours: the first phial', scope: 'party',
    entries: [{ when: { all: [{ heroClass: 'duskweaver' }, stage('quest:duskweaver-the-stolen-hours', 'phials')] }, node: 'phial' }, { node: 'empty' }],
    nodes: {
      phial: { speaker: 'narrator', text: 'A phial in the dust, labelled in Vane’s tidy hand: “Osmund Thursby. The smell of his father’s pipe. Kept.” A hollowed man in a carter’s coat stands beside it, weeping, looking at nothing.', next: 'give' },
      give: { speaker: 'narrator', mood: 'happy', text: 'You unstopper it under his nose. He breathes in. Then he sits down very suddenly on the ground and says, “Dad,” and laughs, and goes on laughing.', next: null },
      empty: { speaker: 'narrator', text: 'An empty phial in the dust of the Legion camp, unstoppered.', next: null },
    },
  },
  {
    id: 'dialogue:obj-duskweaver-stolen-phial-2', name: 'The Stolen Hours: the second phial', scope: 'party',
    entries: [{ when: { all: [{ heroClass: 'duskweaver' }, stage('quest:duskweaver-the-stolen-hours', 'phials')] }, node: 'phial' }, { node: 'empty' }],
    nodes: {
      phial: { speaker: 'narrator', text: '“Hesper Corliss. Her wedding: the second dance, not the first. Kept.” The woman beside it is very old, and very upright, and has been holding her hands out in front of her for a long time, as if for a partner.', next: 'give' },
      give: { speaker: 'narrator', mood: 'happy', text: 'You put the phial in her hands. She closes them round it, and begins, very slowly, to dance: three steps, a turn, three steps. She is smiling at someone you can’t see.', next: null },
      empty: { speaker: 'narrator', text: 'An empty phial in the dust of the Legion camp, and the marks of small dancing feet round it.', next: null },
    },
  },
  {
    id: 'dialogue:obj-duskweaver-stolen-phial-3', name: 'The Stolen Hours: the third phial', scope: 'party',
    entries: [
      { when: { all: [{ heroClass: 'duskweaver' }, stage('quest:duskweaver-the-stolen-hours', 'phials'), { flag: 'duskweaver.mourners', value: 'released' }] }, node: 'drowned' },
      { when: { all: [{ heroClass: 'duskweaver' }, stage('quest:duskweaver-the-stolen-hours', 'phials')] }, node: 'phial' },
      { node: 'empty' },
    ],
    nodes: {
      phial: { speaker: 'narrator', text: '“Lettice Quilliam. Being nine, and not afraid of anything. Kept.” The woman beside it is eighty if she is a day, grey and hollow and stooped under the weight of a Legion pike.', next: 'give' },
      give: { speaker: 'narrator', mood: 'happy', text: 'She sniffs it. She straightens up. She looks round at the Hollow Legion with a nine-year-old’s total contempt, says “Well, this is stupid,” drops the pike, and walks out.', next: null },
      drowned: { speaker: 'narrator', text: 'This phial has no label. It isn’t Vane’s. It went down the Moonwell with the griefs the Veil drowned, and drifted, the way drowned things do, all the way to the Heart. A woman in Duskmere mourning is kneeling beside it.', next: 'drowned2' },
      drowned2: { speaker: 'narrator', mood: 'sad', text: 'It’s hers. She let it go in Duskmere and walked home lighter, and it followed her anyway. She picks it up and holds it to her chest, and doesn’t open it. “I thought it would be heavier,” she says. “It isn’t. It’s only mine.”', next: null },
      empty: { speaker: 'narrator', text: 'A little dip in the dust of the Legion camp, where a phial lay.', next: null },
    },
  },
  {
    id: 'dialogue:duskweaver-cat-heart', name: 'The Cat Comes Too', scope: 'party',
    entries: [{ when: stage('quest:duskweaver-the-cat-comes-too', 'cat'), node: 'start' }, { node: 'after' }],
    nodes: {
      start: { speaker: 'narrator', text: 'On top of the bearers’ supply crates sits Parson: Nan Briar’s cat, large, black and extremely put out. He has two shadows. One is his. The other is the cat’s shadow from the Archive, curled up against his own, purring without a sound.', next: 'parson' },
      parson: {
        speaker: 'narrator', text: 'Parson looks at the second shadow. He looks at you. He has walked from Brindlecross to the edge of the world to get away from it, and it came too. He would like this dealt with.',
        choices: [
          { text: '(Scratch Parson behind the ears, and the shadow too.)', to: 'scratch', quest: true },
          { text: 'It’s chosen you, Parson. That’s how cats work. You should know.', to: 'chosen', quest: true },
          { text: '(Ask the shadow, quietly, if it would rather come home with you.)', to: 'ask', quest: true, school: 'umbral' },
        ],
      },
      scratch: { speaker: 'narrator', text: 'Parson endures it. The shadow leans into it, blissfully. After a while Parson begins, very much against his will, to purr, and the shadow purrs with him, and you can only hear one of them.', next: 'end' },
      chosen: { speaker: 'narrator', text: 'Parson gives you the look of a cat who has been told something he already knew and resented. Then he lies down and tucks his paws in, and lets the shadow tuck its paws in too.', next: 'end' },
      ask: { speaker: 'narrator', text: 'The shadow lifts its head and looks at you as if you were late. Then it puts its chin back down on Parson’s shadow and shuts its eyes. That is a no. Parson sighs, enormously.', next: 'end' },
      end: { speaker: 'narrator', mood: 'happy', text: 'So, before the end of the world: a cat with two shadows, asleep on a crate. Elder Godric steps round them very carefully, and Parson bites him anyway. He only bites people he likes.', next: null },
      after: { speaker: 'npc:cat-shadow-heart', text: '(Parson is asleep on the crates with two shadows curled round him. He does not want to talk about it.)', next: null },
    },
  },
];

export default dialogues;
