/**
 * Hollow Crown, OATHBOUND: Gilded March people (general talk), the eight side quests, the mentor thread and the
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
/** the Dimming has brought real night back to the March */
const NIGHT: NarrativeCondition = { hour: [21, 4] };
const BH = 'npc:beatrix-holm' as const, IL = 'npc:ilsabet' as const, CL = 'npc:cuthbert-lowe' as const;

const dialogues: DialogueDef[] = [
  // ---------- Beatrix (general + mentor thread)
  {
    id: 'dialogue:oathbound-beatrix', name: 'Beatrix (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: BH, text: 'Report. Or don’t, and go and do something useful. Either suits.',
        choices: [
          offer('quest:oathbound-the-first-oath', 'The founding oath-stone has worn blank. Does anyone know what it said?', 'stone', { all: [{ trust: BH, value: 'friendly' }, done('quest:oathbound-no-village-alone')] }),
          offer('quest:oathbound-the-marshals-promise', 'Your desk is covered in crumpled paper, Marshal.', 'letter', { all: [{ trust: BH, value: 'trusted' }, done('quest:oathbound-the-sorrow-oath')] }),
          { text: 'Why do some knights wear their rings turned inward?', to: 'rings', insight: 'oathbound_ring_custom' },
          bye,
        ],
      },
      stone: { speaker: BH, text: 'Nobody. The face wore off before my grandmother’s time. But the underside’s been buried for a thousand years. I have wanted to dig it up since I was a squire, and I have never once had a good enough reason. You’re a good enough reason.', next: null },
      letter: { speaker: BH, mood: 'sad', text: '(She puts her hand flat over the paper.) I have broken one promise in my life. I am writing a letter about it. It is thirty years late and eight drafts long. Read them, if you must. Tell me what’s wrong with them. Don’t be kind.', next: null },
      rings: {
        speaker: BH, text: 'The sun outward, for an oath to a living lord. Turned in, sun to the palm, for an oath sworn to a lord who has fallen. It means: I still keep it, though he can’t see me keep it. You see it at funerals. You shouldn’t see it anywhere else.',
        choices: [
          { text: 'Gammer Lisle says you used to lie in her field all night, counting stars.', to: 'stars', when: { trust: BH, value: 'friendly' } },
          { text: 'Thank you, Marshal.', to: 'start' },
        ],
      },
      stars: { speaker: BH, mood: 'happy', text: '(For a moment she looks fourteen.) That old witch. I did. Every night, the summer I was a squire. I got to four thousand and eleven before the Marshal found me and put me on latrines for a week.', next: 'count' },
      count: {
        speaker: BH, text: 'I meant to finish. There are only about six thousand you can see from the March, and I was going to count every one, so I could say I had. Then I was a knight, and then there was no night to count in.',
        choices: [
          { text: 'There’s a night again, out past Haybright.', to: 'again', trust: 1 },
          { text: 'Who were you counting with?', to: 'with' },
        ],
      },
      again: { speaker: BH, text: 'So there is. (She looks at the window, and then, deliberately, back at her desk.) Four thousand and eleven. I remember where I stopped. Perhaps one day. Report, Oathbound.', next: 'start' },
      with: { speaker: BH, mood: 'sad', text: 'Ilsabet. We raced each other, all summer. She was always faster. (A breath.) Report, Oathbound.', next: 'start' },
    },
  },
  {
    id: 'dialogue:obj-founding-oath-stone', name: 'Mentor: the founding oath-stone', scope: 'party',
    entries: [{ when: stage('quest:oathbound-the-first-oath', 'rubbing'), node: 'dig' }, { node: 'stone' }],
    nodes: {
      dig: { speaker: 'narrator', text: 'You dig under the founding stone while Beatrix holds the lantern and pretends not to be excited. The buried face is cold and clean. You lay the paper on it and rub with charcoal, and letters come up out of the grey like fish rising.', next: null },
      stone: { speaker: 'narrator', text: 'The founding oath-stone of Oathkeep, its face worn smooth by a thousand years of hands, and a fresh hole dug under one side.', next: null },
    },
  },
  {
    id: 'dialogue:oathbound-beatrix-first-oath', name: 'Mentor: The First Oath', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: BH, text: 'Read it. My eyes are good but my hands are shaking, and I’d rather it was you. Out loud.', next: 'read' },
      read: { speaker: 'narrator', text: '“We who keep the March swear it to the Concord, and to the crown that passes, and to no lord who will not let it pass.”', next: 'beatrix' },
      beatrix: {
        speaker: BH, mood: 'happy', text: 'To the crown that passes. Not the Hierarch. Not any lord. The crown, going on its way, from school to school. We were sworn to see it passed on, not kept. A thousand years, and nobody dug.',
        choices: [{ text: 'Then the Order has never been sworn to the Hierarch at all.', to: 'end', insight: 'first_oath', trust: 1 }],
      },
      end: { speaker: BH, text: 'Not by this stone. Keep that paper dry. If anyone in a white robe ever tells you what Oathkeep is sworn to, read it to them.', next: null },
    },
  },
  {
    id: 'dialogue:obj-beatrix-draft-1', name: 'Mentor: the first draft',
    entries: [{ node: 'draft' }],
    nodes: { draft: { speaker: 'narrator', text: '“Ilsabet. I did not come. You asked me to ride with you to the Turning and I said I would and then I did not. That is the whole of it. There is no more to say. B.” Underneath, in a different ink: “There is a great deal more to say.”', next: null } },
  },
  {
    id: 'dialogue:obj-beatrix-draft-2', name: 'Mentor: the fourth draft',
    entries: [{ node: 'draft' }],
    nodes: { draft: { speaker: 'narrator', text: '“Ilsabet. The March needed holding. That is true. I told myself it was the reason. That is also true. It was not the reason.” The rest of the page is a very detailed drawing of a horse.', next: null } },
  },
  {
    id: 'dialogue:obj-beatrix-draft-3', name: 'Mentor: the eighth draft',
    entries: [{ node: 'draft' }],
    nodes: { draft: { speaker: 'narrator', text: '“Ilsabet. I was afraid. You were going to the crown and you were going to be the best of us there too and I would have stood beside you and been the second best in front of all twelve schools. So I stayed and held a wall. I am sorry.” It is not crossed out. It is folded very small.', next: null } },
  },
  {
    id: 'dialogue:oathbound-beatrix-letter', name: 'Mentor: The Marshal’s Promise', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: BH, text: 'Well? You read them. Which one is true?',
        choices: [
          { text: 'All of them. The eighth is the one she needs.', to: 'eighth' },
          { text: 'None of them say what you want to happen next.', to: 'next' },
        ],
      },
      eighth: { speaker: BH, mood: 'sad', text: 'The eighth. Yes. I folded that one up so I wouldn’t have to see it. (She smooths it flat.) Then the ninth starts where it ends.', next: 'ninth' },
      next: { speaker: BH, text: 'What happens next. (She thinks about that for a long time.) I hadn’t thought anything would. I’d only thought about what I owed.', next: 'ninth' },
      ninth: {
        speaker: BH, text: 'How does it end? You finish it. I can’t.',
        choices: [
          { text: '“Come home, and I will ride beside you, second or first. B.”', to: 'home' },
          { text: '“I am keeping the promise now. It is late. It is still kept. B.”', to: 'late' },
        ],
      },
      home: { speaker: BH, text: '(She writes it, very slowly, and blots it, and reads it twice.) Second or first. Yes. That’s true too. Carry it for me. When you find her, give it to her. Not before you have to.', effects: [{ trust: BH, delta: 1 }], next: null },
      late: { speaker: BH, text: '(She writes it, very slowly, and blots it, and reads it twice.) Late. Still kept. Yes. That’s the whole of it, after all. Carry it for me. When you find her, give it to her. Not before you have to.', effects: [{ trust: BH, delta: 1 }], next: null },
    },
  },
  // ---------- Ilsabet (general)
  {
    id: 'dialogue:oathbound-ilsabet', name: 'Ilsabet (general)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: IL, text: 'Good evening, Oathbound. It is evening, out here. You’ll get used to it. I did.', next: null } },
  },
  // ---------- Ser Gallant (after the Chapel)
  {
    id: 'dialogue:oathbound-gallant', name: 'Ser Gallant (following)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:ser-gallant', text: '(Ser Gallant is standing a respectful distance behind you, the way a squire stands. He nods. He does not come closer. It seems to make him nervous when you look round.)', next: null } },
  },
  // ---------- Oathkeep: Hamish, Wystan, Mallard (bounties), Sterling
  {
    id: 'dialogue:oathbound-hamish', name: 'Squire Hamish (the Squire Who Swears Too Much)',
    entries: [{ when: stage('quest:oathbound-the-squire-who-swears-too-much', 'hamish'), node: 'kept' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:hamish-goodbody', text: 'I swear I’ll be with you in a moment. Oh no. That’s two hundred and thirteen.',
        choices: [
          offer('quest:oathbound-the-squire-who-swears-too-much', 'Two hundred and thirteen what?', 'oaths', done('quest:oathbound-the-vigil')),
          { text: 'Why do you swear so much?', to: 'why' },
          bye,
        ],
      },
      why: { speaker: 'npc:hamish-goodbody', text: 'Practice! A knight’s word is his armour, Ser Beatrix says, so I thought, more armour. I swore I’d polish my boots. I swore I’d polish them again. I swore I’d stop swearing. That one’s going badly.', next: null },
      oaths: { speaker: 'npc:hamish-goodbody', mood: 'afraid', text: 'Oaths! All to be kept before sunset, I swore that too, and there isn’t a sunset, so in theory I have forever, but I can feel them. Three are urgent. The porridge, the drill-dummy, and the chapel bell. Please.', next: null },
      kept: {
        speaker: 'npc:hamish-goodbody', mood: 'happy', text: 'All three? The porridge too? It was cold porridge. That’s heroism. I swear, I solemnly swear, that if you ever need anything delivered, anywhere, I will deliver it or die trying. That’s two hundred and ten. A good one.',
        choices: [{ text: 'I’ll hold you to it, Hamish.', to: 'book', trust: 1, trustNpc: BH }, { text: 'Please stop swearing.', to: 'stop' }],
      },
      stop: { speaker: 'npc:hamish-goodbody', text: 'I swear I’ll try. (He claps both hands over his mouth.) Two hundred and eleven.', next: 'book' },
      book: {
        speaker: 'npc:hamish-goodbody', mood: 'sad', text: '(He takes a little book out of his tunic, very worn.) I’ve written them all down. Every one. And I know I’ll never keep most of them. The Hall keeps broken swords, so nobody forgets they were swung. Would Ser Wystan hang up a broken book?',
        choices: [{ text: 'I’ll ask him.', to: null, quest: true }],
      },
    },
  },
  {
    id: 'dialogue:obj-hamish-porridge-bowl', name: 'Hamish’s porridge',
    entries: [{ when: stage('quest:oathbound-the-squire-who-swears-too-much', 'oaths'), node: 'eat' }, { node: 'bowl' }],
    nodes: {
      eat: { speaker: 'narrator', text: 'A bowl of porridge, sworn over at breakfast and left to set. It is now the consistency of mortar. Hamish swore he would finish it. He did not swear he would finish it alone. You take a spoon each.', next: null },
      bowl: { speaker: 'narrator', text: 'An empty porridge bowl, scraped very clean, with the spoon standing up in the last of it out of respect.', next: null },
    },
  },
  {
    id: 'dialogue:obj-hamish-drill-dummy', name: 'Hamish’s drill-dummy',
    entries: [{ when: stage('quest:oathbound-the-squire-who-swears-too-much', 'oaths'), node: 'fight' }, { node: 'dummy' }],
    nodes: {
      fight: { speaker: 'narrator', text: 'The yard’s drill-dummy, a straw knight with a bucket for a helm, which has beaten Hamish forty times. You hold its arm so it can’t swing back, and Hamish beats it, fairly, by his own very generous reading of the word.', next: null },
      dummy: { speaker: 'narrator', text: 'The drill-dummy, its bucket dented, looking defeated, which is more than it ever did before.', next: null },
    },
  },
  {
    id: 'dialogue:obj-hamish-chapel-bell', name: 'Hamish’s chapel bell',
    entries: [{ when: stage('quest:oathbound-the-squire-who-swears-too-much', 'oaths'), node: 'tie' }, { node: 'bell' }],
    nodes: {
      tie: { speaker: 'narrator', text: 'Hamish swore never to ring the chapel bell again, and then walked past it forty times a day with his hand twitching. You tie the bell-rope up out of reach with a knot that would hold a ship. The oath is safe. So is the bell.', next: null },
      bell: { speaker: 'narrator', text: 'The chapel bell-rope, tied up out of reach in an extremely serious knot.', next: null },
    },
  },
  {
    id: 'dialogue:oathbound-wystan', name: 'Ser Wystan Crake (the Sword That Rattles)',
    entries: [{ when: stage('quest:oathbound-the-sword-that-rattles', 'wystan'), node: 'gallant' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:wystan-crake', text: 'EH? Speak up. I’ve kept this Hall forty years and the swords have made me deaf in one ear and wise in the other. Which one did you want?',
        choices: [
          offer('quest:oathbound-the-sword-that-rattles', 'One of the swords is rattling.', 'rattle', done('quest:oathbound-the-vigil')),
          { text: 'Tell me about the swords.', to: 'swords' },
          bye,
        ],
      },
      swords: { speaker: 'npc:wystan-crake', text: 'Every one broke in a battle and was carried home by whoever was left. We hang them where they can hear each other. Swords get lonely. So do old men. That’s not in the Oath; I just noticed it.', next: null },
      rattle: { speaker: 'npc:wystan-crake', text: 'Since the Bell, aye. Rattling day and night like it wants to be let out. No name on the bracket, which there should be. The roll of names will say whose it is. I can’t read the roll any more. My eyes went the way of my ear.', next: null },
      gallant: {
        speaker: 'npc:wystan-crake', mood: 'sad', text: 'Gallant. Struck off the roll, and sent to the Forsworn Chapel, and his sword hung up with no name, the way we do for the forsworn. And it’s rattling. Huh. A forsworn knight’s sword doesn’t rattle unless the oath he broke is close by.',
        choices: [
          { text: 'Why is the bracket next to it empty?', to: 'empty' },
          { text: 'What happens to the forsworn?', to: 'forsworn' },
        ],
      },
      empty: { speaker: 'npc:wystan-crake', text: 'That one? That was Dame Ilsabet’s. Gallant was her squire. She took her sword with her to the Turning, and never came back, so the bracket stays empty. Ser Beatrix dusts it herself. Don’t tell her I said.', next: 'custom' },
      forsworn: { speaker: 'npc:wystan-crake', text: 'They can’t die. That’s the old curse of the Order, or the old blessing; it depends who’s telling it. A broken oath won’t let you rest.', next: 'custom' },
      custom: {
        speaker: 'npc:wystan-crake', text: 'And mind the rings, young knight. If you meet anyone from the old days, look at their hands.',
        choices: [{ text: 'Rings turned inward?', to: 'inward', insight: 'oathbound_ring_custom' }, { text: 'I will.', to: null }],
      },
      inward: { speaker: 'npc:wystan-crake', text: 'Sun to the palm. An oath sworn to a lord who has fallen, and kept anyway. I’ve only ever seen it on widows and very stubborn knights. The two are often the same.', next: null },
    },
  },
  {
    id: 'dialogue:obj-rattling-sword', name: 'The rattling sword',
    entries: [{ when: stage('quest:oathbound-the-sword-that-rattles', 'sword'), node: 'find' }, { node: 'sword' }],
    nodes: {
      find: { speaker: 'narrator', text: 'Halfway down the north wall, a broken sword is shivering in its bracket, tapping the stone like someone knocking to be let in. There is no name-ribbon on its hilt. The bracket beside it is empty, and very well dusted.', next: null },
      sword: { speaker: 'narrator', text: 'A broken sword with no name, rattling softly in its bracket.', next: null },
    },
  },
  {
    id: 'dialogue:obj-hall-sword-roll', name: 'The Hall’s roll of names',
    entries: [{ when: stage('quest:oathbound-the-sword-that-rattles', 'roll'), node: 'read' }, { node: 'roll' }],
    nodes: {
      read: { speaker: 'narrator', text: 'A long roll of vellum, every knight of Oathkeep in a thousand years. Two names are struck through in black. The more recent one, C. 1012: “Ser Gallant, squire to Dame Ilsabet. Forsworn. Sent to the Chapel.”', next: null },
      roll: { speaker: 'narrator', text: 'The roll of names of the Hall of Broken Swords, very long and very carefully kept.', next: null },
    },
  },
  {
    id: 'dialogue:oathbound-mallard', name: 'Sergeant-at-Arms Mallard (bounties)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:roderick-mallard', text: 'Bounties, Oathbound? Signed, sealed, witnessed and paid on proof. Proof means a piece. Not a large piece. Last week somebody brought me a whole gargoyle head and I had nowhere to put it.',
        choices: [
          offer('quest:oathbound-bounty-sunfield-acolytes', 'The acolytes in the Sunfields?', 'acolytes', done('quest:oathbound-no-village-alone')),
          offer('quest:oathbound-bounty-old-grizzleface', 'Who is Old Grizzleface?', 'grizzle', done('quest:oathbound-no-village-alone')),
          bye,
        ],
      },
      acolytes: { speaker: 'npc:roderick-mallard', text: 'Six Zealous Acolytes, gone hollow, preaching at the wheat with sticks. The wheat is unmoved. The farmers are less patient.', next: null },
      grizzle: { speaker: 'npc:roderick-mallard', text: 'The big Sun Gargoyle off the chapel gutter. He fell off when the Bell rang, landed on his feet, and walked into the Sunfields, and he’s been flattening wheat ever since. He held that gutter up for three hundred years. I’d be cross too.', next: null },
    },
  },
  {
    id: 'dialogue:oathbound-sterling', name: 'Captain Sterling (general)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:aurelian-sterling', text: 'Captain Sterling, Brightwatch, on the Hierarch’s business. Not my business. His. I just carry it, and I carry it very carefully, because it is extremely heavy.', next: null } },
  },
  // ---------- the Sunfields: Clover, Dobbin, Marjory
  {
    id: 'dialogue:oathbound-clover', name: 'Clover Wheatley (the First Star)',
    entries: [{ when: stage('quest:oathbound-the-first-star', 'clover'), node: 'home' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:clover-wheatley', text: 'Are you a knight? A real one? Is that a real sword? Is the star a hole in the sky? Mam says don’t be daft but she didn’t say no.',
        choices: [
          offer('quest:oathbound-the-first-star', 'Show me the star.', 'show', done('quest:oathbound-no-village-alone')),
          { text: 'Yes, it’s a real sword.', to: 'sword' },
          bye,
        ],
      },
      sword: { speaker: 'npc:clover-wheatley', text: 'Can I hold it? No? Can I hold it later? Can I hold it when I’m eight?', next: null },
      show: { speaker: 'npc:clover-wheatley', mood: 'happy', text: 'You can only see it from the top of the windmill, when it’s dark. Proper dark. Out past the north field, at the edge. Mam won’t let me go up on my own. She didn’t say anything about with a knight.', next: null },
      home: {
        speaker: 'npc:clover-wheatley', mood: 'happy', text: 'I’m going to name all the others too. There’s loads. Some of them are very small. Do they mind if they’re small?',
        choices: [{ text: 'Not at all. They’re small because they’re far away.', to: 'far' }, { text: 'You’ll have to ask them.', to: 'ask' }],
      },
      far: { speaker: 'npc:clover-wheatley', text: 'Far away. Like the March is far from Dawnspire. So they’re probably a bit cross about it. I’ll give them nice names to make up.', next: 'old' },
      ask: { speaker: 'npc:clover-wheatley', text: 'I will. Every night. Mam’s going to hate it.', next: 'old' },
      old: {
        speaker: 'npc:clover-wheatley', text: 'Only… did it have a name before? Before me? Because if it did, it might not like a new one. Mam says the old shepherd out in the dark knows all the old things. Will you ask her? I’m not allowed in the dark yet.',
        choices: [{ text: 'I’ll ask Gammer Lisle.', to: null, quest: true }],
      },
    },
  },
  {
    id: 'dialogue:obj-haybright-windmill-top', name: 'The First Star: the windmill (night)', scope: 'party',
    entries: [
      { when: { all: [stage('quest:oathbound-the-first-star', 'windmill'), NIGHT] }, node: 'night' },
      { when: stage('quest:oathbound-the-first-star', 'windmill'), node: 'day' },
      { node: 'mill' },
    ],
    nodes: {
      mill: { speaker: 'narrator', text: 'The Haybright windmill, its sails turning slowly over the wheat.', next: null },
      day: { speaker: 'narrator', text: 'From the top of the windmill the Sunfields go on gold forever, and the Dimming is a grey smudge on the north edge. No stars. Clover says come back when it’s dark. Proper dark.', next: null },
      night: {
        speaker: 'narrator', text: 'Up on the windmill cap in the dark, with Clover’s hand gripping your belt. At the edge of the Dimming, over the north field, one small white point of light, not moving. “Is it a hole?” she whispers. “What’s it called?”',
        choices: [
          { text: 'It isn’t a hole. It’s a star. You name it.', to: 'clover', effects: [{ setFlag: 'oathbound.star_named', value: 'clover' }] },
          { text: '“Haybright’s Lantern.”', to: 'lantern', effects: [{ setFlag: 'oathbound.star_named', value: 'lantern' }] },
          { text: '[Radiance] It’s one of the Concord Ring. There are twelve, round a dark place.', to: 'ring', school: 'radiance', effects: [{ setFlag: 'oathbound.star_named', value: 'concord' }] },
        ],
      },
      clover: { speaker: 'narrator', text: 'She thinks about it for a very long time, with her tongue out. “Cuthbert,” she says at last, with total confidence. Cuthbert is the star’s name now. There is nothing anyone can do about it.', next: null },
      lantern: { speaker: 'narrator', text: '“Haybright’s Lantern,” she repeats, to fix it. “Because it’s ours and it’s on.” She waves at it. You are almost sure it doesn’t wave back.', next: null },
      ring: { speaker: 'narrator', text: 'You tell her about the twelve stars, one for every school, in a ring over the crown, and the dark place in the middle. She listens to all of it, and then says she would like to find the other eleven, please, now.', next: null },
    },
  },
  {
    id: 'dialogue:oathbound-dobbin', name: 'Recruit Dobbin Fenwick (the Recruit and His Shadow)',
    entries: [{ when: stage('quest:oathbound-the-recruit-and-his-shadow', 'dobbin'), node: 'watch' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:dobbin-fenwick', text: 'Don’t look at it. Don’t look at it, it knows when you look. It’s been on me since noon. It’s got my shape and no face. It’s a curse, I know it’s a curse.',
        choices: [
          offer('quest:oathbound-the-recruit-and-his-shadow', 'It’s your shadow, Dobbin. Let me show you.', 'show', done('quest:oathbound-no-village-alone')),
          bye,
        ],
      },
      show: { speaker: 'npc:dobbin-fenwick', mood: 'afraid', text: 'Show me? With what? (He sees the lantern.) That’s a light. Lights are good. Light’s what keeps it… no, wait. Light’s what made it. Oh, no.', next: null },
      watch: {
        speaker: 'npc:dobbin-fenwick', mood: 'happy', text: 'It goes where the light isn’t. That’s all it is. It’s where the light isn’t, and I’m what’s in the way. (He moves the lantern again.) Oh, that’s quite nice really. It’s like having a friend who can’t talk.',
        choices: [{ text: 'You’d make a good night-watchman.', to: 'night' }, { text: 'Exactly that.', to: 'night' }],
      },
      night: { speaker: 'npc:dobbin-fenwick', text: 'A night-watchman? Does the Order have one? No? Then I’ll be the first. I’ll watch the dark for anyone who’s frightened of it, and tell them it’s only where the light isn’t. I can do that. I’ve practised.', next: 'first' },
      first: {
        speaker: 'npc:dobbin-fenwick', mood: 'afraid', text: 'First watch is tonight. North field post, facing the Dimming. I’m going to be very brave about it. (A pause.) Would you come? Just the first one. You don’t have to say anything. Just stand there being a knight.',
        choices: [{ text: 'I’ll be there after dark.', to: null, quest: true }],
      },
    },
  },
  {
    id: 'dialogue:obj-dobbin-lantern', name: 'The Recruit and His Shadow: the lantern', scope: 'party',
    entries: [{ when: stage('quest:oathbound-the-recruit-and-his-shadow', 'lantern'), node: 'show' }, { node: 'lantern' }],
    nodes: {
      show: {
        speaker: 'narrator', text: 'You set the lantern on the ground in front of Dobbin. His shadow leaps out behind him, long, and he yelps. You lift it over his head and the shadow shrinks to a puddle at his boots.',
        choices: [
          { text: '(Walk round him with the lantern, slowly, so his shadow swings like a clock hand.)', to: 'clock' },
          { text: '(Make a rabbit with your hands in front of the light.)', to: 'rabbit' },
        ],
      },
      clock: { speaker: 'narrator', text: 'His shadow swings round him, a slow dark hand on a clock face, always pointing away from the light. After the third time round he reaches out and takes the lantern from you and does it himself.', next: null },
      rabbit: { speaker: 'narrator', text: 'A rabbit hops across the wall behind him. Dobbin stares at it. Then, very slowly, he makes a dog, and the dog chases the rabbit, and he laughs so hard he has to sit down.', next: null },
      lantern: { speaker: 'narrator', text: 'A lantern on the step of the Haybright guard-post, lit, in broad daylight, for practice.', next: null },
    },
  },
  {
    id: 'dialogue:oathbound-marjory-general', name: 'Reeve Stook (general)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:marjory-stook', text: 'Wheat’s in. Pym’s waving at his shadow. Clover’s naming stars. If you’ve nothing useful to do, Oathbound, there’s a cart wants pushing.', next: null } },
  },
  // ---------- the Gilded March: Jessamy, Humbert
  {
    id: 'dialogue:oathbound-jessamy', name: 'Jessamy Brightpenny (the Golden Waymarks)',
    entries: [{ when: stage('quest:oathbound-the-golden-waymarks', 'jessamy'), node: 'shines' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:jessamy-brightpenny', text: 'Gilder of the March, at your service, and a very bad mood. Thirty years I’ve kept that road shining, leaf by leaf, and a cat ate it.',
        choices: [
          offer('quest:oathbound-the-golden-waymarks', 'I have the Lion’s gold. Can you re-gild the waymarks?', 'gild', done('quest:oathbound-the-lions-gate')),
          { text: 'How do you gild a waymark?', to: 'how' },
          bye,
        ],
      },
      how: { speaker: 'npc:jessamy-brightpenny', text: 'Size, leaf, breath, burnish, and never sneeze. The leaf is thinner than a promise. You breathe on it wrong and it’s gone to the next parish.', next: null },
      gild: { speaker: 'npc:jessamy-brightpenny', mood: 'happy', text: 'Chewed, but gold is gold. Six waymarks between here and the Dimming. You hold the ladder, I lay the leaf. And read the backs while you’re up there. Every traveller who ever walked this road swore something into those stones.', next: null },
      shines: {
        speaker: 'npc:jessamy-brightpenny', mood: 'happy', text: 'Look at it. All the way to the dark and shining. Did you read the backs? Most of them are “I’ll come home”. A few are rude. The oldest one is odd.',
        choices: [{ text: 'The oldest one said “to the crown that passes”.', to: 'oldest', when: { insight: 'first_oath' } }, { text: 'They were beautiful.', to: 'blank' }],
      },
      oldest: { speaker: 'npc:jessamy-brightpenny', text: 'Did it? I can’t read the old letters. My grandmother could. She used to say the road was older than the Order, and the Order only swore to keep it because the road asked nicely.', next: 'blank' },
      blank: {
        speaker: 'npc:jessamy-brightpenny', text: 'One more thing. The Lion swallowed one waymark whole, so I’ve set a new one, out towards its old gate. Gilded front, blank back. A waymark without an oath on the back is just a stone with ideas. You carve it. You gilded the rest.',
        choices: [{ text: 'I’ll carve it.', to: null, quest: true }],
      },
    },
  },
  {
    id: 'dialogue:obj-march-waymark-1', name: 'The first waymark',
    entries: [{ when: stage('quest:oathbound-the-golden-waymarks', 'gild'), node: 'gild' }, { node: 'mark' }],
    nodes: {
      gild: { speaker: 'narrator', text: 'Jessamy lays the leaf and you burnish it, and the stump shines again: HAYBRIGHT, TWO MILES. On the back, scratched by some long-gone carter: “I’ll come home, Nan. I always do.”', next: null },
      mark: { speaker: 'narrator', text: 'A golden waymark on the March road. HAYBRIGHT, TWO MILES.', next: null },
    },
  },
  {
    id: 'dialogue:obj-march-waymark-6', name: 'The oldest waymark', scope: 'party',
    entries: [{ when: stage('quest:oathbound-the-golden-waymarks', 'gild'), node: 'gild' }, { node: 'mark' }],
    nodes: {
      gild: {
        speaker: 'narrator', text: 'The last waymark before the Dimming, the oldest, its gold worn to the stone. On the back, in letters older than the Order: “Who walks this road walks it for the crown that passes. Keep it open.”',
        choices: [
          { text: '(Trace the words with your finger.) For the crown that passes.', to: 'passes', insight: 'first_oath' },
          { text: '(Burnish it, and move on.)', to: null },
        ],
      },
      passes: { speaker: 'narrator', text: 'Not for the Hierarch. Not for any lord. For a crown going on its way. Whoever cut this thought the road was sworn to something that moves.', next: null },
      mark: { speaker: 'narrator', text: 'The oldest waymark on the March, newly gilded, at the very edge of the Dimming.', next: null },
    },
  },
  {
    id: 'dialogue:oathbound-humbert', name: 'Ser Humbert Tench (the Bridge Knight)',
    entries: [{ when: stage('quest:oathbound-the-bridge-knight', 'humbert'), node: 'riddle' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:humbert-tench', text: 'HALT. None shall cross this bridge without answering my riddle! (A pause.) Which is… it’s on the tip of my tongue. Go away and come back in a moment.',
        choices: [
          offer('quest:oathbound-the-bridge-knight', 'You’ve forgotten the riddle, haven’t you?', 'forgot', done('quest:oathbound-the-lions-gate')),
          bye,
        ],
      },
      forgot: { speaker: 'npc:humbert-tench', mood: 'sad', text: 'Forty years I’ve asked it. Every traveller, every day. Then the Bell rang and it went right out of my head, and an oath is an oath, so nobody has crossed for a month. There’s a queue. The queue has a baker in it. I carved it somewhere so I’d never forget. I forget where.', next: null },
      riddle: {
        speaker: 'npc:humbert-tench', mood: 'happy', text: 'That’s it! That’s it! Ahem. HALT. “I am given and cannot be taken. I am broken and still weigh the same. Kept, I am lighter than air. What am I?”',
        choices: [
          { text: 'A promise.', to: 'right', effects: [{ setFlag: 'oathbound.riddle', value: 'promise' }] },
          { text: 'A loaf of bread.', to: 'bread', effects: [{ setFlag: 'oathbound.riddle', value: 'bread' }] },
          { text: '[Radiance] An oath. A promise is only an oath that hasn’t been heard yet.', to: 'oath', school: 'radiance', effects: [{ setFlag: 'oathbound.riddle', value: 'oath' }] },
        ],
      },
      right: { speaker: 'npc:humbert-tench', mood: 'happy', text: 'A promise! Correct! Pass, friend! Pass, everyone! (The queue cheers. The baker weeps.) Forty years, and you’re the first to get it in one.', next: 'bank' },
      bread: { speaker: 'npc:humbert-tench', text: 'A loaf of… (He thinks about it.) Given, can’t be taken, broken and still weighs the same. That’s not wrong. That’s not wrong at all. Pass! Pass, and bring the baker.', next: 'bank' },
      oath: { speaker: 'npc:humbert-tench', mood: 'happy', text: 'An oath! Hah! An Oathbound answer. I’ll allow it. I’ll more than allow it, I’ll carve it under the other one. Pass, friend!', next: 'bank' },
      bank: {
        speaker: 'npc:humbert-tench', mood: 'sad', text: '(When the queue has gone over, he looks across his own bridge for a long time.) Somebody on that bank gave me the riddle, forty years ago, and said she’d wait for me to get it. I never crossed. Would you go first? Tell me if the cottage is still there.',
        choices: [{ text: 'I’ll go and look.', to: null, quest: true }],
      },
    },
  },
  {
    id: 'dialogue:obj-tench-bridge-carving', name: 'The riddle under the bridge',
    entries: [{ when: stage('quest:oathbound-the-bridge-knight', 'carving'), node: 'read' }, { node: 'carving' }],
    nodes: {
      read: { speaker: 'narrator', text: 'Under the arch of Tench Bridge, worn almost smooth by forty years of river: “I am given and cannot be taken.” The rest is green with moss. You scrape it clean with your thumb. Underneath, much smaller: “HUMBERT. IT IS A PROMISE. DO NOT TELL THEM.”', next: null },
      carving: { speaker: 'narrator', text: 'A riddle carved under Tench Bridge, freshly scraped clean, with a second line under it.', next: null },
    },
  },
  // ---------- the Dimming: Elspeth Snuff, Gammer Lisle
  {
    id: 'dialogue:oathbound-elspeth', name: 'Elspeth Snuff (Afraid of the Dark)',
    entries: [{ when: stage('quest:oathbound-afraid-of-the-dark', 'morning'), node: 'morning' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:elspeth-snuff', text: 'Lampwick has made candles for six hundred years and not one of us has ever needed one. Now the dark’s coming in over the hill and the whole village is hiding under the tables with the stock.',
        choices: [
          offer('quest:oathbound-afraid-of-the-dark', 'I’ll stay with Lampwick through the night.', 'stay', done('quest:oathbound-the-sorrow-oath')),
          { text: 'A village of candle-makers, afraid of the dark?', to: 'irony' },
          bye,
        ],
      },
      irony: { speaker: 'npc:elspeth-snuff', mood: 'angry', text: 'Yes, thank you, we’d noticed. My grandmother dipped a candle for the Hierarch’s own altar. We know everything about wicks and nothing at all about what they’re for.', next: null },
      stay: { speaker: 'npc:elspeth-snuff', mood: 'happy', text: 'Would you? A knight? Sitting with us? We’ve wood for fires on the green. Light them before it’s dark, and then, when it comes, tell them something. Anything. Tell them what it’s for.', next: null },
      morning: {
        speaker: 'npc:elspeth-snuff', mood: 'happy', text: 'It came back. The light. Over the hill, like you said, like it was never going anywhere. Half the village slept on the green. The other half is lighting candles for fun.',
        choices: [{ text: 'And you?', to: 'you' }],
      },
      you: { speaker: 'npc:elspeth-snuff', text: 'I sat up and watched the dark the whole time, in case it did something. It didn’t. It was lovely. Don’t tell anyone I said lovely.', next: null },
    },
  },
  {
    id: 'dialogue:obj-lampwick-campfire-1', name: 'Lampwick’s first fire',
    entries: [{ when: stage('quest:oathbound-afraid-of-the-dark', 'fires'), node: 'light' }, { node: 'fire' }],
    nodes: {
      light: { speaker: 'narrator', text: 'Wood piled on Lampwick green, with a ring of candle-ends around it, very neatly trimmed, because the people of Lampwick cannot help themselves. You light it, and three children come out from under a table to look.', next: null },
      fire: { speaker: 'narrator', text: 'A good fire on Lampwick green, with candle-ends arranged around it in a pattern.', next: null },
    },
  },
  {
    id: 'dialogue:obj-lampwick-hearth', name: 'Afraid of the Dark: the night (night)', scope: 'party',
    entries: [
      { when: { all: [stage('quest:oathbound-afraid-of-the-dark', 'tell'), NIGHT] }, node: 'night' },
      { when: stage('quest:oathbound-afraid-of-the-dark', 'tell'), node: 'day' },
      { node: 'green' },
    ],
    nodes: {
      green: { speaker: 'narrator', text: 'Lampwick green, with three fires laid ready, and a great many faces at the windows.', next: null },
      day: { speaker: 'narrator', text: 'The fires burn pale in the daylight. Nobody will come out until they have to. Come back when the dark has come in over the hill.', next: null },
      night: {
        speaker: 'narrator', text: 'The dark comes over the hill and lies down on Lampwick like a cat on a bed. Forty people sit round the fires, pressed together, staring at you. Somebody has to say something.',
        choices: [
          { text: 'It’s for sleeping. That’s all. Close your eyes. Nothing will happen.', to: 'sleep', effects: [{ setFlag: 'oathbound.lampwick_told', value: 'sleep' }] },
          { text: 'Look up.', to: 'stars', effects: [{ setFlag: 'oathbound.lampwick_told', value: 'stars' }] },
          { text: 'It’s for stories. Who knows a frightening one?', to: 'story', effects: [{ setFlag: 'oathbound.lampwick_told', value: 'stories' }] },
        ],
      },
      sleep: { speaker: 'narrator', text: 'One by one they try it. A child goes first, then the child’s mother, and then, all over the green, Lampwick discovers what it has been missing for thirty years, and begins, very gently, to snore.', next: null },
      stars: { speaker: 'narrator', text: 'They look up. Over Lampwick, one by one, the stars come out. Nobody says anything at all for a long time. Then Elspeth Snuff says, quite crossly, “Well, nobody told us about that.”', next: null },
      story: { speaker: 'narrator', text: 'An old chandler tells a story about a candle that would not go out, and it is so frightening that everyone screams and then laughs at themselves for screaming. By the third story, they are fighting over who goes next.', next: null },
    },
  },
  {
    id: 'dialogue:oathbound-gammer', name: 'Gammer Lisle (the Night Shepherd)',
    entries: [{ when: stage('quest:oathbound-the-night-shepherd', 'stars'), node: 'stars' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:gammer-lisle', text: 'Evening, knight. Don’t look so startled; it’s only the evening. I’m old enough to remember it. Sit down, if you’re stopping. Mind the dog.',
        choices: [
          offer('quest:oathbound-the-night-shepherd', 'Your flock is still out on the hill.', 'flock', done('quest:oathbound-the-sorrow-oath')),
          { text: 'You’re not afraid of the dark?', to: 'afraid' },
          bye,
        ],
      },
      afraid: { speaker: 'npc:gammer-lisle', text: 'Afraid of the dark? I was born in it, love. Before C. 1012 every night was dark and nobody died of it, except of the usual things. The light’s what frightened me. Thirty years of noon. Sheep don’t sleep properly in noon either.', next: null },
      flock: { speaker: 'npc:gammer-lisle', text: 'Three ewes up the hill, the daft things, staring at the stars like they’ve never seen them. They haven’t, mind. White as washing. You’ll see them if you look.', next: null },
      stars: {
        speaker: 'npc:gammer-lisle', mood: 'happy', text: 'There. The Plough, and the Weaver, and the Hound, and that one, see, low over the March: two hands, and a crown between them, going from the one to the other. My gran called it the Passing.',
        choices: [
          { text: 'A crown passed between two hands.', to: 'passing', insight: 'passing_crown' },
          { text: 'They’re beautiful.', to: 'beautiful', trust: 1, trustNpc: BH },
        ],
      },
      passing: { speaker: 'npc:gammer-lisle', text: 'That’s it. It never stops moving, she said. Always on its way from one to the next. The sheep like it. So do I.', next: 'names' },
      beautiful: { speaker: 'npc:gammer-lisle', text: 'They are. Tell the Marshal. She’s not looked up in thirty years. I knew her when she was a squire and she used to lie in this field all night, counting.', next: 'names' },
      names: {
        speaker: 'npc:gammer-lisle', text: 'I’m eighty-one, love. When I go, the old names go with me, and the sheep can’t remember them for me, though they try. Take them. All of them. Give them to somebody who’ll have them for another eighty years.',
        choices: [{ text: 'There’s a girl at Haybright naming stars.', to: 'clover', quest: true }],
      },
      clover: { speaker: 'npc:gammer-lisle', mood: 'happy', text: 'The little Wheatley? The one who called a star Cuthbert? (She cackles.) Perfect. Tell her she can keep Cuthbert. It’s a better name than the old one, which was Bob.', next: null },
    },
  },
  {
    id: 'dialogue:obj-lisle-ewe-1', name: 'A ewe staring at the stars',
    entries: [{ when: stage('quest:oathbound-the-night-shepherd', 'flock'), node: 'ewe' }, { node: 'fold' }],
    nodes: {
      ewe: { speaker: 'narrator', text: 'A ewe standing perfectly still on the hillside with her face turned up to the sky. When you nudge her she looks at you as if you had interrupted something important, and comes, complaining.', next: null },
      fold: { speaker: 'narrator', text: 'A ewe in Gammer Lisle’s fold, chewing, still looking up.', next: null },
    },
  },

  // ======================= ACT II
  {
    id: 'dialogue:oathbound-cuthbert', name: 'C-1/C-2 Ser Cuthbert of the Shorewatch', scope: 'party',
    entries: [
      { when: stage('quest:oathbound-abbeyshore', 'shore'), node: 'halt' },
      { when: { all: [stage('quest:oathbound-the-shorewatch-oath', 'oath'), { not: { flag: 'oathbound.shorewatch' } }] }, node: 'oath' },
    ],
    nodes: {
      halt: { speaker: CL, text: 'HALT. (Three knights in the shallows, armour rusted the colour of autumn, water running out of the joints.) By the oath we swore in C. 1012, none shall reach the drowned nave while the Shorewatch stands. And the Shorewatch stands. Mostly.', next: 'who' },
      who: {
        speaker: CL, text: 'Ser Cuthbert Lowe. That is Ser Bryony Wade, who will fight you, and Ser Petronella Fane, who cannot hear you. Is that an Oathkeep surcoat? Is the March still there?',
        choices: [
          { text: 'The March is still there. I’m sworn to it.', to: 'march', quest: true },
          { text: 'I need to reach the nave, Ser.', to: 'nave', quest: true },
        ],
      },
      march: { speaker: CL, mood: 'happy', text: 'Still there. Bryony, the March is still there! (Ser Bryony says something rude, happily.) Then you know what an oath is. And you know we can’t let you pass.', next: null },
      nave: { speaker: CL, text: 'So did the last six who asked. The choir sang two of them to sleep and we pulled the other four out by their boots. No one passes. That’s the oath. I’m sorry. We’re all very sorry. We’re also very wet.', next: null },
      oath: {
        speaker: CL, text: 'You’ve come back. Bryony has her sword out. Petronella is asleep standing up, which she does. Say what you’ve come to say, Oathbound.',
        choices: [
          { text: 'I release you. Your lord has fallen, and a knight of Oathkeep may release an oath sworn to a fallen lord.', to: 'released', quest: true, effects: [{ setFlag: 'oathbound.shorewatch', value: 'released' }] },
          { text: 'Then I swear a greater oath: I will give the Abbess peace, or drown trying.', to: 'outsworn', quest: true, effects: [{ setFlag: 'oathbound.shorewatch', value: 'outsworn' }] },
          { text: 'Your oath says “until relieved by Oathkeep”. I’m from Oathkeep. You’re relieved.', to: 'clause', quest: true, insight: 'shorewatch_relieved', when: { insight: 'shorewatch_clause' }, effects: [{ setFlag: 'oathbound.shorewatch', value: 'clause' }] },
          { text: 'I carry the Hierarch’s own letters of passage.', to: 'pass', quest: true, when: { flag: 'oathbound.decree', value: 'decree' }, effects: [{ setFlag: 'oathbound.shorewatch', value: 'pass' }] },
          { text: 'Oathkeep is forsworn. We stood with the March against the Hierarch. I’m asking as one forsworn knight to three.', to: 'forsworn', quest: true, when: { not: { flag: 'oathbound.decree', value: 'decree' } }, effects: [{ setFlag: 'oathbound.shorewatch', value: 'forsworn' }] },
        ],
      },
      released: { speaker: CL, mood: 'sad', text: 'Released. (He sits down in the water.) Thirty years. Bryony, put your sword away; we’ve been released. Petronella! Wake up, love, we can go home. (Ser Bryony is crying, and pretending she isn’t.) We’ll row you out ourselves. It’s the least we can do.', next: null },
      outsworn: { speaker: CL, text: 'A greater oath. (He looks at the other two.) That is a greater oath. That beats ours, fairly. We swore to keep people from her. You’ve sworn to reach her. (Ser Bryony nods once, hard.) Then we row you out. We keep our oath by watching yours.', next: null },
      clause: { speaker: CL, mood: 'happy', text: 'Until relieved. Until… (He turns slowly to Ser Petronella, who has woken up and is nodding very hard.) She’s been saying that for thirty years. We thought she was being difficult. Relieved! Get the boat, Bryony!', next: null },
      pass: { speaker: CL, text: 'The Hierarch’s seal. Well. That covers the first oath, the one about letting no one by. (He looks at the lake.) It doesn’t cover the choir. We’ll row you out. After that it’s between you and the singing.', next: null },
      forsworn: { speaker: CL, mood: 'happy', text: 'Forsworn! For the March! Ha! (He hits his breastplate, and rust comes off it in a cloud.) A decree we might have argued with. A forsworn knight we can’t refuse; we’re all forsworn here, a little. Bryony, the boat!', next: null },
    },
  },
  {
    id: 'dialogue:oathbound-petronella', name: 'Ser Petronella Fane (the clause)',
    entries: [{ when: stage('quest:oathbound-the-shorewatch-oath', 'oath'), node: 'words' }, { node: 'start' }],
    nodes: {
      start: { speaker: 'npc:petronella-fane', text: 'WHAT? Speak up, dear. The lake’s been in my ears thirty years.', next: null },
      words: {
        speaker: 'npc:petronella-fane', text: 'The words of my oath? WHAT? Oh, the WORDS. Certainly. “None shall reach the nave while the Shorewatch stands, until relieved by Oathkeep.” I’ve said the last bit for thirty years. Cuthbert never listens past “stands”.',
        choices: [{ text: '“Until relieved by Oathkeep.”', to: 'relieved', insight: 'shorewatch_clause' }, { text: 'Thank you, Ser.', to: null }],
      },
      relieved: { speaker: 'npc:petronella-fane', mood: 'happy', text: 'That’s it, dear! Relieved! Nobody ever came to relieve us. Are you from Oathkeep? You’ve got the surcoat. WELL THEN.', next: null },
    },
  },
  {
    id: 'dialogue:oathbound-bryony', name: 'Ser Bryony Wade',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:bryony-wade', text: 'I’ll fight you. I’ll fight anyone. I haven’t been allowed to fight anyone in thirty years. (She considers.) Unless you’re here to help. Then I’ll fight whoever you like.', next: null } },
  },
  {
    id: 'dialogue:oathbound-morwen-oath', name: 'C-3 Morwen and the Oathbound', scope: 'party',
    entries: [{ node: 'ask' }],
    nodes: {
      ask: {
        speaker: 'narrator', mood: 'sad', text: 'As the marks settle on the altar step, the Abbess speaks once more, to you alone: You are Oathbound. I swore to keep the Bell until a true Turning rang it. It rang false. I have kept my oath against it for thirty years, and I am so tired. Will you release me?',
        choices: [
          { text: 'I release you, Abbess. Your oath is kept.', to: 'release', effects: [{ setFlag: 'oathbound.morwen', value: 'released' }] },
          { text: 'Keep it a little longer. The Turning is coming, a true one. Then lay it down.', to: 'keep', effects: [{ setFlag: 'oathbound.morwen', value: 'kept' }] },
        ],
      },
      release: { speaker: 'narrator', text: 'Then I am released, she says, and her hands open on nothing, and for the first time in thirty years they lie still in her lap.', next: null },
      keep: { speaker: 'narrator', text: 'A little longer, she says. Yes. I can keep it a little longer, if I know it ends. And she closes her eyes, and keeps it.', next: null },
    },
  },
  {
    id: 'dialogue:hook-oathbound-hobb', name: 'Hook: Old Hobb and the sworn graves (C-4)', scope: 'party',
    entries: [{ when: stage('quest:oathbound-the-dames-muster', 'hobb'), node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:hobb', text: 'The Hollowed walk home, I always say. These ones aren’t walking home. These ones are walking off in step. And on three of the graves there’s rings pressed into the dirt. Knights’ rings. Turned round the wrong way.',
        choices: [
          { text: 'Turned inward. An oath to a fallen lord.', to: 'inward', quest: true },
          { text: 'Show me the graves.', to: 'show', quest: true },
        ],
      },
      inward: { speaker: 'npc:hobb', mood: 'afraid', text: 'Is that what it means? Then someone’s been swearing my dead to someone fallen. Don’t tell Godric. Not yet. He goes a funny colour about the old Citadel.', next: 'show' },
      show: { speaker: 'npc:hobb', text: 'Three of them, by the yew. I left the rings where they are. You don’t move a thing off a grave until you know whose it is.', next: null },
    },
  },
  {
    id: 'dialogue:obj-oathbound-oath-grave-1', name: 'C-4 a sworn grave',
    entries: [{ when: stage('quest:oathbound-the-dames-muster', 'graves'), node: 'ring' }, { node: 'grave' }],
    nodes: {
      ring: { speaker: 'narrator', text: 'An empty grave by the yew, the soil pushed up from below. Pressed into the dirt at its head, an Oathbound ring, sun turned inward. Scratched into the earth beside it, in a neat knightly hand: “Sworn. To the crown, and to whoever wears it.”', next: null },
      grave: { speaker: 'narrator', text: 'An empty grave by the yew, a small round print in the soil where a ring lay.', next: null },
    },
  },
  {
    id: 'dialogue:oathbound-ilsabet-barrow', name: 'C-4 Ilsabet in the Barrowdowns', scope: 'party',
    entries: [{ node: 'muster' }],
    nodes: {
      muster: { speaker: 'narrator', text: 'In the long gallery of the Barrowdowns the dead of Brindlecross stand in ranks, and Dame Ilsabet walks along them with a candle, stopping at each one, laying her hand on its chest, and saying the same words, quietly, every time.', next: 'ilsabet' },
      ilsabet: {
        speaker: 'npc:ilsabet', text: '(She sees you, and finishes the oath she is on before she turns.) Oathbound. You came through. I’m swearing Varric’s muster to the crown; they were sworn to escort it once, and they’ve been waiting a thousand years to be asked again.',
        choices: [
          { text: 'They’re dead, Ilsabet. They can’t swear.', to: 'dead' },
          { text: 'I have a letter for you.', to: 'letter', when: { flag: 'oathbound.beatrix_letter' } },
        ],
      },
      dead: { speaker: 'npc:ilsabet', text: 'Neither could I, after the first ten years. It doesn’t stop you keeping it. (She goes past you, towards the dark at the end of the gallery.) Varric will hold you to the rules. Fight him well. I’ll be waiting further in.', next: null },
      letter: { speaker: 'npc:ilsabet', mood: 'sad', text: 'From Bea? (Her hand comes up, and stops.) Not yet. Not here. Keep it for me until there’s somewhere better to read it. Varric will hold you to the rules; fight him well. I’ll be waiting further in.', next: null },
    },
  },
  {
    id: 'dialogue:oathbound-varric-challenge', name: 'C-5 Varric’s rules', scope: 'party',
    entries: [{ node: 'rules' }],
    nodes: {
      rules: {
        speaker: 'narrator', text: 'Bonelord Varric rises from his throne of shields at the end of the barrow, and lifts his sword in salute, the old salute of the Schools’ War. His voice is dry as old leaves: Single combat. By the rules. As I fought for the Concord, so you will fight me. Do you accept?',
        choices: [
          { text: '(Return the salute.) By the rules.', to: 'accept' },
          { text: 'I’m Oathbound. The rules are what I’m for.', to: 'accept', school: 'radiance' },
        ],
      },
      accept: { speaker: 'narrator', text: 'His dead muster steps back to the walls to make a ring. Nobody in it moves to help him. Nobody in it ever has.', next: null },
    },
  },
  {
    id: 'dialogue:oathbound-hamish-gate', name: 'C-6 Hamish delivers', scope: 'party',
    entries: [{ when: stage('quest:oathbound-hamish-delivers', 'hamish'), node: 'start' }, { node: 'after' }],
    nodes: {
      start: { speaker: 'npc:hamish-at-the-gate', text: 'I swore I’d deliver it or die trying, and I very nearly did both. The Dawn Gate is very bright and the far side of it is very steep. I fell most of the way. Here. (He holds it up without sitting up.) From the Marshal.', next: 'msg' },
      msg: {
        speaker: BH, text: '“The March is holding. Lampwick lights its fires every night now and complains about the dark every morning. Dobbin Fenwick has made himself night-watchman and nobody has had the heart to tell him we don’t have one. Whatever you swore in my Hall, keep it. Mind her. B.”',
        choices: [
          { text: '(Fold the message away.)', to: 'end', quest: true, effects: [{ setFlag: 'oathbound.beatrix_message', value: true }] },
          { text: 'Thank you, Hamish. That’s an oath kept.', to: 'kept', quest: true, effects: [{ setFlag: 'oathbound.beatrix_message', value: true }] },
          { text: 'Is that bread in your pack, Hamish?', to: 'bread', quest: true, when: { not: { flag: 'oathbound.decree', value: 'decree' } }, effects: [{ setFlag: 'oathbound.beatrix_message', value: true }] },
        ],
      },
      bread: { speaker: 'npc:hamish-at-the-gate', mood: 'happy', text: 'Bread! From Haybright and Lampwick, for the forsworn knight who stood with the March. Reeve Stook said eat it and don’t argue. It’s a bit squashed. I fell on it. Twice. I swore I’d keep it safe and technically it’s still bread.', next: 'end' },
      kept: { speaker: 'npc:hamish-at-the-gate', mood: 'happy', text: 'Kept! (He sits up, beaming, and immediately lies back down.) That’s two hundred and nine. Only two hundred and eight to go. I swear I’ll get up in a minute.', next: 'end' },
      end: { speaker: 'npc:hamish-at-the-gate', text: 'Is there a tavern? I swore I’d find out if there was a tavern.', next: null },
      after: { speaker: 'npc:hamish-at-the-gate', text: 'I’m staying here a bit. I swore I’d see what Concordia was like, and so far it’s mostly grass and stew. The stew is winning.', next: null },
    },
  },
  // ---------- featured bearers (hooks on the bearer NPCs)
  {
    id: 'dialogue:oathbound-featured-skald', name: 'Featured: The Saga of the Shorewatch', scope: 'party',
    entries: [
      { when: stage('quest:oathbound-the-saga-of-the-shorewatch', 'back'), node: 'back' },
      { when: { all: [stage('quest:oathbound-the-saga-of-the-shorewatch', 'shields'), { not: { flag: 'oathbound.sigrid_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-skald', text: 'Three old knights standing in a lake for thirty years and nobody has made a saga of it? That’s a crime against drums. They won’t tell me. Cuthbert talks for an hour and says nothing. Read their shields for me. Shields don’t lie.',
        choices: [{ text: 'Shields are mostly dents.', to: 'dents', quest: true, effects: [{ setFlag: 'oathbound.sigrid_asked', value: true }] }],
      },
      dents: { speaker: 'npc:bearer-skald', mood: 'happy', text: 'Every dent’s a verse. Go on.', next: null },
      back: {
        speaker: 'npc:bearer-skald', mood: 'happy', text: 'The Saga of the Shorewatch, in nine fits, with a chorus about rust. They heard me drum it on the shore and Bryony punched me, which I take as a review. When we go to the Heart, you’ll be in the last verse. I’ll need you alive for it.',
        effects: [{ setFlag: 'oathbound.sigrid_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-oathbound-shorewatch-shield-1', name: 'Featured: Ser Cuthbert’s shield',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'Ser Cuthbert’s shield: ten thousand and some little scratches, one for every day on the shore, in rows of seven. In the corner, very old, the outline of a child’s hand, painted, and a name nobody has said aloud in thirty years.', next: null } },
  },
  {
    id: 'dialogue:obj-oathbound-shorewatch-shield-2', name: 'Featured: Ser Bryony’s shield',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'Ser Bryony’s shield is mostly dents, and every dent has a little note scratched beside it: “troll, C. 991”, “husband, C. 1003, an accident”, “the lake, C. 1012 onwards”. The newest dent says only: “bored”.', next: null } },
  },
  {
    id: 'dialogue:obj-oathbound-shorewatch-shield-3', name: 'Featured: Ser Petronella’s shield',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'Ser Petronella’s shield has the whole Shorewatch oath painted round the rim, every word, so she could read it when she could no longer hear it. The last four words are painted twice as large as the rest: UNTIL RELIEVED BY OATHKEEP.', next: null } },
  },
  {
    id: 'dialogue:oathbound-featured-samurai', name: 'Featured: Whom the Sword Serves', scope: 'party',
    entries: [
      { when: stage('quest:oathbound-whom-the-sword-serves', 'back'), node: 'back' },
      { when: { all: [stage('quest:oathbound-whom-the-sword-serves', 'door'), { not: { flag: 'oathbound.aiko_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-samurai', text: 'You are Oathbound. You swear your sword to someone. I have come to ask the first Concord duellist whom a sword serves. I will ask it alone. Will you keep the door for me, and not listen?',
        choices: [
          { text: 'I’ll keep it. I won’t listen.', to: null, quest: true, effects: [{ setFlag: 'oathbound.aiko_asked', value: true }] },
          { text: 'I already know the answer.', to: 'know', quest: true, effects: [{ setFlag: 'oathbound.aiko_asked', value: true }] },
        ],
      },
      know: { speaker: 'npc:bearer-samurai', text: 'Then you will find it very easy not to listen.', next: null },
      back: {
        speaker: 'npc:bearer-samurai', text: 'I asked. I will not tell you what I heard. But I will tell you this: I am going to the Heart, and when I get there, I will stand where you stand. Not because I swore it. Because I chose it, on the stair, coming up.',
        effects: [{ setFlag: 'oathbound.aiko_thanked', value: true }],
        choices: [{ text: 'That’s the best kind of oath.', to: null }, { text: 'Thank you, Aiko.', to: null }],
      },
    },
  },
  {
    id: 'dialogue:obj-oathbound-barrow-watch-stone', name: 'Featured: keeping the barrow door', scope: 'party',
    entries: [
      { when: { all: [stage('quest:oathbound-whom-the-sword-serves', 'door'), { flag: 'story.sentinel.blade' }] }, node: 'grave' },
      { when: stage('quest:oathbound-whom-the-sword-serves', 'door'), node: 'living' },
      { node: 'stone' },
    ],
    nodes: {
      living: { speaker: 'narrator', text: 'You stand at the barrow door with your back to the dark and your shield on your arm. Far below, a dry old voice and a young one are talking. You do not listen. You count the stones in the lintel instead. There are forty-one. You count them nine times.', next: null },
      grave: { speaker: 'narrator', text: 'You stand at the barrow door while Aiko goes down alone to the place where Varric lay down and slept. You hear her voice, very low, asking, and then a long silence. You do not listen to the silence either. That is harder.', next: null },
      stone: { speaker: 'narrator', text: 'A worn stone at the barrow door where a sentry would stand.', next: null },
    },
  },
  // ======================= ACT III
  {
    id: 'dialogue:oathbound-herald-fate', name: 'III-4 the Sorrow Herald: Ilsabet’s fate', scope: 'party',
    entries: [
      { when: { flag: 'oathbound.fought_foul' }, node: 'foul' },
      { when: { flag: 'oathbound.decree', value: 'decree' }, node: 'decree' },
      { node: 'kneel' },
    ],
    nodes: {
      kneel: { speaker: IL, mood: 'hollow', text: '(She goes down on one knee and lays her sword across it, as she did in the Dimming.) I yield. Formally. (The bell rings.) I vow that I yield. (Again.) I vow to keep that vow. I can’t stop, Oathbound. Every word is another one.', next: 'choose' },
      foul: { speaker: IL, mood: 'hollow', text: '(She kneels, and lays her sword across her knee.) I yield. You’ll remember the last time I did. You struck me while I knelt. (The bell rings.) I’m not angry. I only want it said, before witnesses, by the rules.', next: 'choose' },
      decree: { speaker: IL, mood: 'hollow', text: '(She kneels, and lays her sword across her knee.) I yield. You marched the night-touched to Dawnspire on a fallen lord’s decree. You kept a fallen lord’s word too. (The bell rings.) So you know why I can’t stop.', next: 'choose' },
      choose: {
        speaker: IL, mood: 'sad', text: 'I swore to the crown, and to whoever wears it. Tell me what else I could have done, and I’ll do it. I’ll vow to.',
        choices: [
          {
            text: 'Say the first oath with me: “to the crown that passes.” It was always an oath to pass it on.', to: 'passes', quest: true,
            when: { flag: 'oathbound.decree', value: 'passes' }, lockedLabel: 'You need the Order’s first oath',
            effects: [{ setFlag: 'oathbound.nemesis_fate', value: 'spared' }],
          },
          {
            text: '(Give her Beatrix’s letter.)', to: 'letter', quest: true,
            when: { flag: 'oathbound.beatrix_letter' }, lockedLabel: 'You need Beatrix’s letter, finished',
            effects: [{ setFlag: 'oathbound.nemesis_fate', value: 'spared' }],
          },
          { text: 'By the rules, then. (Strike.)', to: 'destroy', quest: true, effects: [{ setFlag: 'oathbound.nemesis_fate', value: 'destroyed' }] },
        ],
      },
      passes: { speaker: 'narrator', text: 'You say it together, kneeling on the Twelve Stairs: the words from the buried underside of Oathkeep’s first stone. To the crown that passes. She stops on the last word, and you watch her understand it.', next: 'passes2' },
      passes2: { speaker: IL, mood: 'sad', text: 'That passes. (Very quietly.) Not that is kept. I was sworn to hand it on, and I sat on the steps and held it, thirty years. (The bell does not ring.) Oh, Bea. I kept the wrong half.', next: 'release' },
      letter: { speaker: 'narrator', text: 'She knows the hand before she opens it. She reads the ninth draft, with its ending in your writing, all the way through, and the bell in her lap does not ring once.', next: 'letter2' },
      letter2: { speaker: IL, mood: 'sad', text: 'She was afraid. Bea was afraid. (She laughs, and it breaks.) So was I. That’s why I swore to the crown, you know. So I wouldn’t have to ride home and find out she hadn’t waited.', next: 'release' },
      release: { speaker: 'narrator', text: 'She turns her ring round on her finger, the sun outward, and the black samite falls from her shoulders like a cloak she has finally been allowed to take off. Then Dame Ilsabet weeps, and her tears run down her cheeks the way tears do.', next: null },
      destroy: { speaker: 'narrator', text: 'She sees it coming, and lifts her chin, and doesn’t move, because that is the rule. The bell rings once more, for the last vow. Then the Sorrow Herald lies still on the Twelve Stairs, with her sword across her knee.', next: null },
    },
  },
  {
    id: 'dialogue:obj-oathbound-radiance-stair', name: 'A Promise Kept Late: the head of the Radiance stair', scope: 'party',
    entries: [
      { when: { all: [stage('quest:oathbound-a-promise-kept-late', 'promise'), { flag: 'oathbound.nemesis_fate', value: 'spared' }, { flag: 'oathbound.beatrix_devotable' }] }, node: 'read' },
      { when: { all: [stage('quest:oathbound-a-promise-kept-late', 'promise'), { flag: 'oathbound.nemesis_fate', value: 'spared' }] }, node: 'mind' },
      { when: { all: [stage('quest:oathbound-a-promise-kept-late', 'promise'), { flag: 'oathbound.beatrix_devotable' }] }, node: 'aloud' },
      { when: stage('quest:oathbound-a-promise-kept-late', 'promise'), node: 'ring' },
      { node: 'stair' },
    ],
    nodes: {
      read: { speaker: 'narrator', text: 'Ilsabet is sitting at the head of the Radiance stair with her helm off and her ring turned outward, waiting for you, as if the two of you had arranged to meet.', effects: [{ trust: BH, set: 5 }], next: 'read2' },
      read2: { speaker: IL, text: 'You have Bea’s letter. Read it to me, aloud, before witnesses. That’s how a promise is kept, in the Order.', next: 'read3' },
      read3: { speaker: 'narrator', text: 'So you read Beatrix Holm’s ninth draft aloud on the Twelve Stairs, all of it: the fear, and the wall, and the ending in your hand. Ilsabet listens with her eyes shut.', next: 'read4' },
      read4: { speaker: IL, mood: 'happy', text: 'Thirty years late. (She stands, buckles on her sword, and offers you her arm like a knight at a Turning feast.) Tell her I’m riding home. Second or first. I find I don’t mind which.', next: null },
      mind: {
        speaker: 'narrator', text: 'Ilsabet is sitting at the head of the Radiance stair with her helm off and her ring turned outward.',
        choices: [{ text: 'Beatrix sent word. “Mind her.” That’s all.', to: 'mind2' }],
      },
      mind2: { speaker: IL, mood: 'sad', text: 'Mind her. (She laughs, very softly.) That’s Bea. Thirty years, and two words, and both of them orders. (She stands.) Then mind me home, Oathbound. I want to see her face. I want to see if she waited.', next: null },
      aloud: { speaker: 'narrator', text: 'At the head of the Radiance stair, where the Sorrow Herald fell, her ring lies on the step, the sun turned inward.', effects: [{ trust: BH, set: 5 }], next: 'aloud2' },
      aloud2: { speaker: 'narrator', text: 'Beatrix said not to give it to her before you had to. You have to now. You unfold the ninth draft and read it aloud on the Twelve Stairs, to nobody, before witnesses: the fear, and the wall, and the ending in your hand.', next: 'aloud3' },
      aloud3: { speaker: 'narrator', mood: 'sad', text: 'When you finish, you turn Ilsabet’s ring the right way round, the sun outward, and leave it on the letter on the step. Far away in Oathkeep, Beatrix Holm stops in the middle of a sentence, and puts her hand flat on the table, and says nothing for a long time.', next: null },
      ring: { speaker: 'narrator', text: 'At the head of the Radiance stair, where the Sorrow Herald fell, her ring lies on the step, the sun turned inward.', next: 'ring2' },
      ring2: { speaker: 'narrator', mood: 'sad', text: '“Mind her,” Beatrix wrote. You were too late for that. You turn the ring round, sun outward, and pocket it, to carry home to Oathkeep. Some promises are kept by whoever is left.', next: null },
      stair: { speaker: 'narrator', text: 'The head of the Radiance stair. The step is swept clean.', next: null },
    },
  },
  {
    id: 'dialogue:obj-oathbound-sorrow-sworn', name: 'The Sorrow-Sworn', scope: 'party',
    entries: [{ when: { all: [{ heroClass: 'oathbound' }, stage('quest:oathbound-the-sorrow-sworn', 'rings')] }, node: 'knights' }, { node: 'gone' }],
    nodes: {
      knights: { speaker: 'narrator', text: 'A file of Oathbound in the Legion, in March armour gone black at the joints: a dozen knights who heard what Ilsabet swore, and swore it after her. Every hand is closed in a fist, and every ring is turned inward, the sun to the palm.', next: 'fist' },
      fist: {
        speaker: 'narrator', text: 'They are holding on to a fallen lord’s last command so hard their knuckles have gone white. Nobody has told them they may let go.',
        choices: [
          { text: '(Turn your own ring outward, slowly, where they can see.)', to: 'ring', quest: true },
          { text: 'The crown passes. It was always sworn to pass. You are relieved.', to: 'relieved', quest: true, when: { flag: 'oathbound.decree', value: 'passes' } },
          { text: 'No village alone, and no knight either. Stand down.', to: 'village', quest: true, when: { flag: 'oathbound.decree', value: 'march' } },
          { text: 'I am Oathbound, and I release you.', to: 'release', quest: true, school: 'radiance' },
        ],
      },
      ring: { speaker: 'narrator', text: 'You turn your ring on your finger, the sun outward. The nearest knight watches you do it. Then, slowly, as if it hurts, she opens her fist and does the same. Down the file, one by one, the suns turn outward.', next: null },
      relieved: { speaker: 'narrator', mood: 'happy', text: '“Relieved,” says the nearest knight, as if she has waited thirty years for the word. Down the file fists open and rings turn round, and somebody begins to cry with the shameless relief of a sentry at the end of a long watch.', next: null },
      village: { speaker: 'narrator', text: 'A knight at the back lifts her head. “No village alone,” she says hoarsely, and turns her ring. The others follow her one at a time, the way the Order always used to: nobody first, nobody last.', next: null },
      release: { speaker: 'narrator', text: 'It is not your oath to release. You say it anyway, in the Order’s voice, and it is enough. One by one they open their hands and turn their rings, and the suns face outward again.', next: null },
      gone: { speaker: 'narrator', text: 'Where the Sorrow-Sworn stood, bootprints in the dust, going home in file.', next: null },
    },
  },
  {
    id: 'dialogue:obj-oathbound-gallant-rest', name: 'Ser Gallant’s Rest', scope: 'party',
    entries: [
      { when: { all: [{ heroClass: 'oathbound' }, stage('quest:oathbound-ser-gallants-rest', 'rest'), { flag: 'oathbound.gallant', value: 'held' }] }, node: 'held' },
      { when: { all: [{ heroClass: 'oathbound' }, stage('quest:oathbound-ser-gallants-rest', 'rest')] }, node: 'sword' },
      { node: 'quiet' },
    ],
    nodes: {
      held: { speaker: 'narrator', text: 'Ser Gallant has followed you all the way from the Forsworn Chapel, a respectful distance behind, the way a squire follows. At the edge of the Legion camp he stops, and sits down on a broken cart, and takes off his helm.', next: 'held2' },
      held2: {
        speaker: 'npc:ser-gallant', mood: 'sad', text: 'She’s settled, then. My lady. (He turns the helm over in his hands.) I swore to follow her anywhere. I couldn’t follow her there. But you could, and I followed you. I think that counts. I think I may be allowed to count it.',
        choices: [
          { text: 'It counts, Ser Gallant. Your oath is kept.', to: 'held3', quest: true },
          { text: 'You can stop following now. Rest.', to: 'held3', quest: true },
        ],
      },
      held3: { speaker: 'narrator', mood: 'sad', text: 'He nods once, as if a sergeant had said it. Then he lies back on the cart with his helm on his chest, and for the first time in thirty years, when he falls, he does not get up.', next: null },
      sword: { speaker: 'narrator', text: 'Propped against a broken cart at the edge of the Legion camp, a sword in a rusted scabbard is rattling, very faintly, on its own. It is Ser Gallant’s. You released him in the Chapel, and his sword came on without him.', next: 'sword2' },
      sword2: {
        speaker: 'narrator', text: 'For thirty years it has rattled with an oath that wouldn’t lie still. With Ilsabet’s fate settled, there is nothing left for it to rattle about.',
        choices: [
          { text: '(Lay it flat, and push it home in its scabbard.)', to: 'sword3', quest: true },
          { text: '(Say his name, and tell it she is settled.)', to: 'sword3', quest: true },
        ],
      },
      sword3: { speaker: 'narrator', text: 'It rattles once more, as if clearing its throat. Then it is still, and it stays still.', next: null },
      quiet: { speaker: 'narrator', text: 'A broken cart at the edge of the Legion camp. Everything on it is quiet.', next: null },
    },
  },
];

export default dialogues;
