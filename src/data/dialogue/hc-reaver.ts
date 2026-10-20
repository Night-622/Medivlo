/** Hollow Crown, REAVER dialogues: Act I on the Bleeding Fields and the Act II class thread. Owner: Claude 4. */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const offer = (q: Q, text: string, to: string, extra?: NarrativeCondition): DialogueChoice =>
  ({ text, to, quest: true, when: extra ? { all: [fresh(q), extra] } : fresh(q), effects: [{ startQuest: q }] });
const bye: DialogueChoice = { text: 'Farewell.', to: null, tag: 'leave' };
const BR = 'npc:brenna-scald-hand' as const, HK = 'npc:hask' as const, GR = 'npc:quartermaster-grub' as const;

const dialogues: DialogueDef[] = [
  // ---------- I-1 The Bell on the Fields
  {
    id: 'dialogue:reaver-palisade-night', name: 'I-1 the night attack', scope: 'party',
    entries: [{ node: 'night' }],
    nodes: {
      night: { speaker: 'narrator', text: 'Midnight on the Bleeding Fields. You are on the palisade with your shield-sibs, the way you have been on a thousand nights, half asleep on your axe. The lava glows red through the cracks in the black.', next: 'move' },
      move: { speaker: 'narrator', text: 'Then the glow moves. It is not lava. It is a hundred Magma Hounds, coming over the crust in a long low wave, and they are not howling. They have never come at the wall without howling.', next: 'line' },
      line: {
        speaker: 'narrator', text: 'Up and down the line, Reavers are waking and grabbing for shields. There is a gap on your left where Hask should be standing. There is always Hask on your left.',
        choices: [
          { text: '(Step into Hask’s place and close the gap.)', to: 'gap' },
          { text: '“Where’s Hask?”', to: 'where' },
        ],
      },
      gap: { speaker: 'narrator', text: 'You step left, shield to shield with old Gorse Ironside, who grunts at you, which is how Gorse says thank you. The wave reaches the ditch.', next: 'brenna' },
      where: { speaker: 'narrator', text: 'Nobody answers. Nobody knows. Old Gorse Ironside shoves you left into the gap with his shoulder, which is how Gorse says shut up. The wave reaches the ditch.', next: 'brenna' },
      brenna: { speaker: BR, mood: 'angry', text: 'AXES! On the line! Where’s Hask? Never mind, hold, HOLD!', next: null },
    },
  },
  {
    id: 'dialogue:reaver-bell-rings', name: 'I-1 the Bell rings', scope: 'party',
    entries: [{ node: 'bell' }],
    nodes: {
      bell: { speaker: 'narrator', text: 'Somewhere very far away a bell rings once. Up and down the palisade every Reaver lowers their axe at the same moment, without thinking, the way their grandmothers taught them. When the Bell rings, the Muster stands down.', next: 'hounds' },
      hounds: { speaker: 'narrator', text: 'The hounds do not stand down. And under your ribs, something has started to sing.', next: null },
    },
  },
  {
    id: 'dialogue:reaver-brenna-bell', name: 'I-1 Brenna after the attack', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: BR, text: 'We held. We held, and we dropped our axes in the middle of it like fools, because of a bell nobody’s heard in thirty years. Did you hear it? Course you did. You’re glowing.',
        choices: [
          { text: 'Something is singing in my chest.', to: 'sing' },
          { text: 'Where’s Hask?', to: 'hask' },
        ],
      },
      sing: { speaker: BR, text: 'Then it’s the stone. Granny Thorn always said half of the Ash Stone fell on the Fields when the crown broke. Said one day it would call someone. Didn’t think it’d be my own pup.', next: 'hask' },
      hask: { speaker: BR, mood: 'afraid', text: 'He went out past the line before the attack. Alone. He does that. He always comes back. Three of ours didn’t, tonight. See to the wounded, then come up the tower with me at dawn. The Muster buries its own, and we go out for them together.', next: null },
    },
  },
  // ---------- I-2 Count the Fallen
  {
    id: 'dialogue:obj-fallen-reaver-1', name: 'I-2 the first of the fallen', scope: 'party',
    entries: [{ when: stage('quest:reaver-count-the-fallen', 'field'), node: 'gone' }, { node: 'empty' }],
    nodes: {
      gone: { speaker: 'narrator', text: 'Ginnet’s axe lies where she fell, and her shield. There is no Ginnet. There are black tears pooled in the lava, and her footprints, walking away towards the centre of the Fields.', next: null },
      empty: { speaker: 'narrator', text: 'Ginnet’s axe, marked with a stone.', next: null },
    },
  },
  {
    id: 'dialogue:reaver-brenna-fallen', name: 'I-2 report', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: BR, mood: 'afraid', text: 'Walked away? The dead don’t walk away. Not on my Fields.', next: 'banner' },
      banner: { speaker: BR, mood: 'angry', text: 'And while we were busy dying last night, the Cinder Drake took the war-banner off the pole. A Muster without its banner is a camp with axes. Get it back.', next: null },
    },
  },
  // ---------- I-3 The Drake Roost
  {
    id: 'dialogue:obj-muster-war-banner', name: 'I-3 the war-banner', entries: [{ node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'The Red Muster’s banner, torn and scorched and whole: a red axe on black, and under it the old motto, Until It Is Over.', next: null } },
  },
  {
    id: 'dialogue:reaver-brenna-banner', name: 'I-3 banner home', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: BR, mood: 'happy', text: 'There it is. Until It Is Over. My great-grandmother sewed that motto. I used to think it was a promise.', next: 'hask' },
      hask: { speaker: BR, text: '…The sentries are shouting. Something at the palisade. Go. Go and see.', next: null },
    },
  },
  // ---------- I-4 Hask Comes Home
  {
    id: 'dialogue:reaver-hask-home', name: 'I-4 Hask comes home', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: HK, mood: 'happy', text: 'Shield-sib! You waited up. You won’t believe where I’ve been. Right into the middle of the Fields, where the lava’s white. And look. Not a mark on me.',
        choices: [
          { text: 'Hask, you’re standing in the brazier.', to: 'brazier', insight: 'hask_unburnt' },
          { text: 'Where are Ginnet and the others?', to: 'others' },
        ],
      },
      brazier: { speaker: HK, text: '(He looks down at his feet in the coals and laughs.) So I am. Doesn’t hurt. Nothing hurts any more. Isn’t that wonderful?', next: 'win' },
      others: { speaker: HK, text: 'Out there. They’re fine. Better than fine. They don’t get tired now. None of us do.', next: 'win' },
      win: { speaker: HK, text: 'We can win it, sib. The whole war. All of it, forever. Tell Mother. She’ll want to hear it from you.', next: null },
    },
  },
  {
    id: 'dialogue:reaver-hask', name: 'Hask (general)',
    entries: [{ node: 'h' }],
    nodes: { h: { speaker: HK, mood: 'happy', text: 'Forever, sib. Think of it. A war that never has to end, because nobody has to die in it.', next: null } },
  },
  {
    id: 'dialogue:reaver-brenna-hask', name: 'I-4 Brenna on her son', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: BR, text: 'He’s home. He’s home and he’s talking nonsense and he’s home. What did he say to you?',
        choices: [
          { text: 'That we can win the war forever.', to: 'forever' },
          { text: 'He was standing in the fire, Brenna. It didn’t touch him.', to: 'fire', when: { insight: 'hask_unburnt' } },
        ],
      },
      forever: { speaker: BR, text: 'Forever. Well. He always did dream big. The Muster’s calling a vote at the ring. Half of them say the Bell means the war’s over. I say the Brand-Pits. Come and speak.', next: null },
      fire: { speaker: BR, mood: 'afraid', text: '(She is very still.) He didn’t burn when he was seven, either. I’ve never told anyone that. Come to the ring. The Muster votes tonight.', next: null },
    },
  },
  // ---------- I-5 The Muster's Vote (faction choice)
  {
    id: 'dialogue:reaver-muster-vote', name: 'I-5 the Muster votes', scope: 'party',
    entries: [{ when: { not: { flag: 'reaver.muster' } }, node: 'ring' }, { node: 'after' }],
    nodes: {
      ring: { speaker: 'narrator', text: 'The Muster ring, three hundred Reavers on the old stone benches, the banner on its pole again. Hask is at the back, smiling, standing a little too close to a torch.', next: 'motion' },
      motion: { speaker: BR, text: 'The Brand-Pits breed every hound that ever came at our wall. We march at dawn and end them. That’s my word. Now yours.', next: 'law' },
      law: { speaker: 'narrator', text: 'An old woman stands up on the benches: Granny Thorn, who keeps the Muster’s laws in her head because nobody ever wrote them down. “When the Bell rings, the Muster stands down,” she says. “I heard it. You all heard it. Your hands heard it, on the line.”', next: 'grub' },
      grub: { speaker: GR, text: '(Not standing, not loudly.) Two hundred and ninety-one axes. Forty days of food. Whatever we do, we do it with that. I’ve counted.', next: 'hask' },
      hask: { speaker: HK, mood: 'happy', text: '(From the back, cheerfully, into a silence.) Why stop? We’re winning. We’ve always been winning. We just never finished. Let’s finish.', next: 'choose' },
      choose: {
        speaker: BR, text: 'Well? You’re the one with the stone singing in you. What do we do?',
        choices: [
          { text: 'March. End the hounds at the source.', to: 'war', quest: true, effects: [{ setFlag: 'reaver.muster', value: 'war' }] },
          { text: 'The Bell rang. By the old law, the Muster stands down. We go to the Pits to talk, not to kill.', to: 'truce', quest: true, effects: [{ setFlag: 'reaver.muster', value: 'truce' }] },
          { text: 'Before anything, look at Hask. He’s standing in the torch. He isn’t burning.', to: 'reveal', quest: true, insight: 'hask_revealed', when: { insight: 'hask_unburnt' }, trustNpc: BR, trust: -1, effects: [{ setFlag: 'reaver.muster', value: 'revealed' }] },
        ],
      },
      war: { speaker: BR, mood: 'happy', text: 'Axes up! We march at dawn! (The ring roars. Hask roars loudest.)', next: null },
      truce: { speaker: BR, mood: 'sad', text: '(A long silence.) The old law. My grandmother kept it. All right. We go down to the Pits with our axes on our backs. Gods help us.', next: null },
      reveal: {
        speaker: 'narrator', text: 'Three hundred heads turn. Hask is standing in the torch-bracket up to his knees, smiling, not burning. Somebody screams. Hask laughs, and walks out of the ring, and nobody stops him.',
        next: 'reveal2',
      },
      reveal2: { speaker: BR, mood: 'afraid', text: '(Very quietly.) Thank you. I think. We go to the Pits anyway. Carefully.', next: null },
      after: { speaker: BR, text: 'The Muster has spoken. Now we live with it.', next: null },
    },
  },
  // ---------- I-6 The Brand-Pits
  {
    id: 'dialogue:reaver-brand-mother', name: 'I-6 the Brand-Mother', scope: 'party',
    entries: [
      { when: { flag: 'reaver.muster', value: 'truce' }, node: 'truce' },
      { node: 'war' },
    ],
    nodes: {
      war: { speaker: 'narrator', text: 'At the bottom of the Brand-Pits, in a nest of cooling slag, the Brand-Mother lifts her head. She is the size of a house, and her brands are burning black.', next: null },
      truce: {
        speaker: 'narrator', text: 'You walk down with your axe on your back and your hands open. The Brand-Mother lifts her head, and for a moment she looks at you like any old dog at a stranger. Then the black runs into her eyes, and she comes.',
        next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-brand-pit-seal', name: 'I-6 branding the pits', entries: [{ node: 's' }],
    nodes: { s: { speaker: 'narrator', text: 'You lay your axe-head in the fire and brand the pit-mouths shut, one by one. Below, something whimpers, and goes quiet.', next: null } },
  },
  // ---------- I-7 The Unburnt
  {
    id: 'dialogue:reaver-brenna-unburnt', name: 'I-7 Brenna on Hask’s raid', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: BR, mood: 'sad', text: 'Ginnet was with them. I saw her face. I’ve known that face since she was born. They were singing his name.',
        choices: [{ text: 'He’s going for the Battle-Kiln. The half-stone is there.', to: 'kiln' }, { text: 'I’m sorry, Brenna.', to: 'sorry', trust: 1 }],
      },
      sorry: { speaker: BR, text: 'Don’t be sorry. Be quick.', next: 'kiln' },
      kiln: { speaker: BR, mood: 'angry', text: 'Then go and take it before he does. And if you can bring him back, bring him back. And if you can’t…', next: 'end' },
      end: { speaker: BR, text: '…come back anyway.', next: null },
    },
  },
  // ---------- I-8 The Old Battle-Kiln
  {
    id: 'dialogue:obj-ash-frontier-halfstone', name: 'I-8 the Field half', scope: 'party',
    entries: [{ when: stage('quest:reaver-the-old-battle-kiln', 'stone'), node: 'claim' }, { node: 'cradle' }],
    nodes: {
      claim: { speaker: 'narrator', text: 'In the war-kiln’s heart, in a cradle of red iron, lies half of a crystal, cracked clean across, singing. It is warm in your hand, the way a hand is warm.', next: 'vision' },
      vision: { speaker: 'narrator', text: 'For a moment you are not in the Battle-Kiln. You are standing on the Fields a thousand years ago, and the Reavers and the hounds are side by side, facing the same way, towards a ring of twelve stones on a far hill. Nobody is fighting. Everybody is listening.', next: 'gone' },
      gone: { speaker: 'narrator', text: 'Then it is gone, and there is only heat, and the stone, and somewhere in the lava, laughter.', next: 'hask' },
      hask: { speaker: HK, mood: 'happy', text: '(From the lava, walking out of it, dripping fire.) Keep it safe for me, sib! I’ll see you at the gate. Everyone goes through the gate.', next: null },
      cradle: { speaker: 'narrator', text: 'The empty cradle in the Old Battle-Kiln.', next: null },
    },
  },
  // ---------- I-9 The Last Muster (mentor farewell; trust check)
  {
    id: 'dialogue:reaver-brenna-farewell', name: 'I-9 Brenna’s farewell', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: BR, text: 'So you have it, and he has gone for the gate, and you must follow him through it. I always thought I’d be the one leaving.',
        choices: [{ text: 'Come with me.', to: 'stay' }, { text: 'Thank you. For raising me.', to: 'boy', trust: 1 }],
      },
      stay: { speaker: BR, text: 'Somebody has to keep this camp from eating itself. No. You go.', next: 'boy' },
      boy: { speaker: BR, mood: 'sad', text: 'When you were both pups, you and him, he used to sleep across the door of my tent, so nothing could get in. Seven years old, with a stick for an axe. He never slept. He said he didn’t need to. I should have listened to that.', next: 'ask' },
      ask: {
        speaker: BR, text: 'Bring him home if you can. If you can’t, bring me what’s left of him. Either way, don’t let him do whatever he’s going to do to the rest of the world.',
        choices: [
          { text: 'I’ll bring him home.', to: 'gift', trust: 1 },
          { text: 'I’ll do what has to be done.', to: 'gift' },
        ],
      },
      gift: {
        speaker: BR, text: 'Here.',
        choices: [
          { text: '(Take the ring from her burned hand.)', to: 'ring', when: { trust: BR, value: 'friendly' } },
          { text: '(Take her good hand.)', to: 'hand', when: { not: { trust: BR, value: 'friendly' } } },
        ],
      },
      ring: { speaker: BR, mood: 'sad', text: 'My axe-ring. I wore it when I pulled him out of the lava. Wear it when you bring him home.', effects: [{ giveItem: 'i_brenna_axe_ring' }, { setFlag: 'reaver.brenna_ring', value: true }], next: 'muster' },
      hand: { speaker: BR, text: 'Go careful. Go quick.', next: 'muster' },
      muster: {
        speaker: BR, text: 'The Muster will see you to the gate.',
        choices: [
          { text: 'March with me, then.', to: 'march', when: { flag: 'reaver.muster', value: 'war' } },
          { text: 'Stay. Hold the Fields.', to: 'hold', when: { not: { flag: 'reaver.muster', value: 'war' } } },
        ],
      },
      march: { speaker: BR, mood: 'happy', text: 'Axes up! The Muster marches to the gate!', next: null },
      hold: { speaker: BR, text: 'We’ll hold the Fields. Somebody has to keep the quiet you won us.', next: null },
    },
  },
  // ---------- Brenna (general) and the mentor thread
  {
    id: 'dialogue:reaver-brenna', name: 'Brenna (general)',
    entries: [
      { when: { all: [stage('quest:reaver-count-the-fallen', 'field'), { not: { flag: 'reaver.delight.gorse' } }] }, node: 'gorse' },
      { node: 'start' },
    ],
    nodes: {
      gorse: { speaker: BR, text: 'Back already, pup? (She hands you a heel of bread without looking up.) Gorse Ironside grunted about you this morning. Twice. From Gorse, that’s a speech.', effects: [{ setFlag: 'reaver.delight.gorse', value: true }], next: 'start' },
      start: {
        speaker: BR, text: 'Eat. War’s no excuse for an empty belly.',
        choices: [
          offer('quest:reaver-brennas-arm', 'How did you burn your arm?', 'arm', { trust: BR, value: 'friendly' }),
          offer('quest:reaver-the-peace-axe', 'Is there really a peace-axe?', 'axe', { trust: BR, value: 'trusted' }),
          { text: 'How long has the war gone on?', to: 'war' },
          bye,
        ],
      },
      arm: { speaker: BR, text: 'Tonight. By the fire. Not with the whole camp listening.', next: null },
      axe: { speaker: BR, text: 'My grandmother hid it under the oldest banner on the Bone Ridge, the day she gave up on ever using it. Go and see if she was right to.', next: null },
      war: { speaker: BR, text: 'Since before the Concord. The Concord stopped it. Then thirty years ago it started again, and we never asked why.', next: 'start' },
    },
  },
  {
    id: 'dialogue:reaver-brenna-arm', name: 'Mentor: Brenna’s Arm', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: BR, mood: 'sad', text: 'He was seven. He fell into a lava vein on the Fields, right in, up to his neck. I went in after him. This is what the lava did to me.', next: 'him' },
      him: {
        speaker: BR, text: 'And when I pulled him out, he was laughing. Not a mark on him. Not one. I told myself it was luck. For thirty years I told myself it was luck.',
        choices: [{ text: 'It wasn’t luck.', to: 'end', insight: 'hask_unburnt', trust: 1 }],
      },
      end: { speaker: BR, text: 'No. It wasn’t. Thank you for not pretending.', next: null },
    },
  },
  {
    id: 'dialogue:reaver-brenna-peace-axe', name: 'Mentor: the Peace-Axe', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: BR, mood: 'happy', text: 'Pale wood. Never sharpened. A thousand years old and nobody ever swung it. (She holds it like a baby.) My grandmother was right to hide it. And you were right to bring it back.', effects: [{ trust: BR, delta: 1 }], next: 'end' },
      end: { speaker: BR, text: 'Keep it for now. When this is over, I want to plant it somewhere a war was won.', next: null },
    },
  },
  // ---------- the Red Muster: Jory, Cookie, Grub
  {
    id: 'dialogue:reaver-jory', name: 'Two-Coin Jory (A Wager of Axes)',
    entries: [{ when: stage('quest:reaver-a-wager-of-axes', 'collect'), node: 'pay' }, { node: 'start' }],
    nodes: {
      start: { speaker: 'npc:jory-two-coin', text: 'Two coins says you can’t split three targets at forty paces.', choices: [offer('quest:reaver-a-wager-of-axes', 'You’re on.', 'on'), bye] },
      on: { speaker: 'npc:jory-two-coin', text: 'Lovely. Lovely. I’ll hold the stakes.', next: null },
      pay: {
        speaker: 'npc:jory-two-coin', text: 'Three for three. Unbelievable. Here’s your… ah. Here’s most of your…',
        choices: [{ text: 'All of it, Jory.', to: 'all' }, { text: 'Keep the change.', to: 'keep', trust: 1 }],
      },
      all: { speaker: 'npc:jory-two-coin', mood: 'sad', text: 'All of it. First time in twenty years. Don’t tell anyone.', next: null },
      keep: { speaker: 'npc:jory-two-coin', mood: 'happy', text: 'A Reaver with a heart. I’ll put you on the board as a long shot.', next: null },
    },
  },
  {
    id: 'dialogue:reaver-cookie', name: 'Cookie Mallow (the Cook’s Last Ox)',
    entries: [
      { when: stage('quest:reaver-the-cooks-last-ox', 'cook'), node: 'soup' },
      { when: { all: [{ questCompleted: 'quest:reaver-the-bell-on-the-fields' }, { flag: 'reaver.wounded_3' }, { not: { flag: 'reaver.delight.broth' } }] }, node: 'broth' },
      { node: 'start' },
    ],
    nodes: {
      broth: { speaker: 'npc:cookie-mallow', text: 'You. You were by the wounded last night, looking at my broth like it might bite. (She ladles you a bowl anyway.) It doesn’t bite. It’s the only thing on the Fields that doesn’t.', effects: [{ setFlag: 'reaver.delight.broth', value: true }], next: 'start' },
      start: {
        speaker: 'npc:cookie-mallow', text: 'Last ox. Last one. Then it’s boots. And there’s talk of a raid on the truce villages for grain, which there’ll be no coming back from.',
        choices: [offer('quest:reaver-the-cooks-last-ox', 'I’ll find food that isn’t stolen.', 'caps'), bye],
      },
      caps: { speaker: 'npc:cookie-mallow', text: 'Fire-caps. Grow on the cooled lava. Sweet as chestnuts if you don’t eat the gills. Bring me a sack.', next: null },
      soup: { speaker: 'npc:cookie-mallow', mood: 'happy', text: 'A whole sack! Soup for a week, and no raid. You’ve saved the ox, and possibly a village. The ox is more grateful.', next: null },
    },
  },
  {
    id: 'dialogue:reaver-grub', name: 'Quartermaster Grub (bounties, the well, Red Veins)',
    entries: [{ when: stage('quest:reaver-red-veins', 'grub'), node: 'map' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:quartermaster-grub', text: 'Bounties on the stake. Sign for your axe.',
        choices: [
          offer('quest:reaver-hounds-at-the-well', 'The well?', 'well'),
          offer('quest:reaver-red-veins', 'You need the veins mapped?', 'veins'),
          offer('quest:reaver-bounty-prowlers', 'The Bone Ridge prowlers.', 'prowl'),
          offer('quest:reaver-bounty-slag-belly', 'Slag-Belly?', 'slag'),
        ],
      },
      well: { speaker: 'npc:quartermaster-grub', text: 'One well. Five hounds sitting on it. Do the arithmetic.', next: null },
      veins: { speaker: 'npc:quartermaster-grub', text: 'Three survey stones from the Schools’ War. Read them, bring me the bearings.', next: null },
      prowl: { speaker: 'npc:quartermaster-grub', text: 'Picking off sentries on the Ridge. Six, I reckon. Paid by the head.', next: null },
      slag: { speaker: 'npc:quartermaster-grub', text: 'A Lava Slime the size of a supply wagon. Eats supply wagons. I am short of supply wagons.', next: null },
      map: { speaker: 'npc:quartermaster-grub', text: 'North. Every vein runs north, to the gate. Like the Fields are bleeding towards it. I’ll file that under things I don’t like.', next: null },
    },
  },
  // ---------- Bone Ridge: Old Tam
  {
    id: 'dialogue:reaver-old-tam', name: 'Old Tam (banners, Old Cinder)',
    entries: [
      { when: stage('quest:reaver-banners-of-the-schools-war', 'tam'), node: 'banners' },
      { when: stage('quest:reaver-a-grave-for-old-cinder', 'tam'), node: 'cairn' },
      { node: 'start' },
    ],
    nodes: {
      start: {
        speaker: 'npc:old-tam', text: 'Cinder carried me through four wars. I can carry him one hill.',
        choices: [
          offer('quest:reaver-a-grave-for-old-cinder', 'Let me build his cairn.', 'help'),
          offer('quest:reaver-banners-of-the-schools-war', 'What are the old banners?', 'banners-q'),
          bye,
        ],
      },
      help: { speaker: 'npc:old-tam', mood: 'sad', text: 'Up top, where he can see the Fields. He liked a view.', next: null },
      'banners-q': { speaker: 'npc:old-tam', text: 'From the Schools’ War, before the Concord. Nobody remembers how that one ended. Read them. Tell me.', next: null },
      banners: {
        speaker: 'npc:old-tam', text: 'The last one’s not a war-banner? Twelve marks in a ring?',
        choices: [{ text: 'The Concord’s banner. That war ended with a peace.', to: 'peace', insight: 'schools_war_ended' }],
      },
      peace: { speaker: 'npc:old-tam', text: 'With a peace. Huh. Ninety years old, and I never knew a war could end any other way than somebody running out of people.', next: null },
      cairn: { speaker: 'npc:old-tam', mood: 'sad', text: '(He sits by the cairn a long while.) Good. Good view. Thank you, young one.', next: null },
    },
  },
  {
    id: 'dialogue:obj-war-banner-4', name: 'The Concord banner', entries: [{ node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'The fourth banner is not a war-banner. Twelve marks in a ring, and a crown in the middle: the banner of the Concord, planted on the Bone Ridge the day the Schools’ War ended.', next: null } },
  },
  // ---------- the Drakeholt: Hild, the eggs
  {
    id: 'dialogue:reaver-hild', name: 'Hild Ashfoot (the Hermit of the Holt, Warm Eggs)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:hermit-hild', text: 'Put the axe down. Nobody’s fighting up here.',
        choices: [
          offer('quest:reaver-the-hermit-of-the-holt', '(Put the axe down.) They call you a deserter.', 'desert'),
          offer('quest:reaver-warm-eggs', 'Are those drake eggs?', 'eggs'),
          { text: 'Tell me about Hask, as a boy.', to: 'boy', when: { questCompleted: 'quest:reaver-the-hermit-of-the-holt' } },
          bye,
        ],
      },
      desert: { speaker: 'npc:hermit-hild', text: 'I walked away from it. Twenty years ago. I woke up one morning and couldn’t think of a single reason, so I didn’t go to the line. Nobody tells you you can do that.', next: 'can' },
      can: {
        speaker: 'npc:hermit-hild', text: 'A war that never ends isn’t a war. It’s a habit.',
        choices: [{ text: 'Then how does it end?', to: 'end', insight: 'war_is_a_habit', trust: 1 }, { text: 'Some of us have to hold the line.', to: 'line' }],
      },
      end: { speaker: 'npc:hermit-hild', text: 'Somebody stops. First. And everybody calls them a coward. Then, years later, they call it the peace.', next: null },
      line: { speaker: 'npc:hermit-hild', text: 'Do you? Ask yourself who’s on the other side of it. Then ask them.', next: null },
      eggs: { speaker: 'npc:hermit-hild', text: 'Knocked out of the Roost in the fighting. Warm, and clean, not a drop of black in them. What you do with them is up to you.', next: null },
      boy: { speaker: 'npc:hermit-hild', mood: 'sad', text: 'I saw him fall in the vein, the day his mother burned her arm. I saw him laughing in the lava before she ever reached him. Whatever’s in that boy, it was there before the tears.', effects: [{ insight: 'hask_unburnt' }], next: null },
    },
  },
  {
    id: 'dialogue:obj-drake-egg-nest', name: 'Warm Eggs: the nest', scope: 'party',
    entries: [{ when: stage('quest:reaver-warm-eggs', 'eggs'), node: 'eggs' }, { node: 'empty' }],
    nodes: {
      eggs: {
        speaker: 'narrator', text: 'Four drake eggs in the scree, warm as bread, glowing faintly gold. Not a speck of black on any of them.',
        choices: [
          { text: 'Carry them back up to the Roost.', to: 'roost', effects: [{ setFlag: 'reaver.eggs', value: 'returned' }] },
          { text: 'Take them to Jory. Drake eggs fetch a price.', to: 'sell', effects: [{ setFlag: 'reaver.eggs', value: 'sold' }] },
        ],
      },
      roost: { speaker: 'narrator', text: 'You climb the crag again with the eggs in your shirt and leave them in the empty nest. Something on a far peak screams, and it does not sound angry.', next: null },
      sell: { speaker: 'narrator', text: 'Jory pays well and asks no questions. The eggs are warm in his hands. He looks at them a long time.', next: null },
      empty: { speaker: 'narrator', text: 'Empty scree.', next: null },
    },
  },

  // ======================= ACT II
  {
    id: 'dialogue:reaver-ada', name: 'C-1 the deserters of Kilnmouth', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:forgewife-ada', text: 'An axe like that, out of Cinderreach. Muster, are you? (Behind her, three old smiths put their hammers down and lower their eyes.) They were Reavers, once. They walked away from the line in C. 1011 and were on this side when the arches shut.',
        choices: [
          { text: 'The Muster calls them deserters.', to: 'deserters' },
          { text: 'The war’s different now. Nobody here owes it anything.', to: 'free', when: { any: [{ flag: 'reaver.muster', value: 'truce' }, { insight: 'war_is_a_habit' }] } },
        ],
      },
      deserters: { speaker: 'npc:forgewife-ada', text: 'Aye. They know. They’ve had thirty years to hear it in their heads. Now. You’ll be after Ashmaw.', next: 'ashmaw' },
      free: { speaker: 'npc:forgewife-ada', mood: 'happy', text: '(One of the old smiths looks up, then another. One of them is crying.) …Well. Thank you. Now. You’ll be after Ashmaw.', effects: [{ setFlag: 'reaver.deserters_freed', value: true }], next: 'ashmaw' },
      ashmaw: { speaker: 'npc:forgewife-ada', text: 'The Kiln-Beast. Lit the Turning torches for a thousand years, and when it wouldn’t die we built our kilns round it. A beast that wouldn’t die. You’ll know the type.', next: 'mug' },
      mug: { speaker: 'npc:forgewife-ada', text: 'Before you go after it, look in at the Cinder Mug. There’s an old fool in there who’s waited thirty years for somebody off the Fields to see his axe.', next: null },
    },
  },
  {
    id: 'dialogue:reaver-brenna-runner', name: 'C-6 Brenna’s runner', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:brenna-runner', text: 'Ran the whole Cinder Road. Don’t tell the chief I stopped for breath. She said to say it in her words, so: (she clears her throat)', next: 'msg' },
      msg: {
        speaker: BR, text: '“The Fields are quiet. Quieter than I’ve ever heard them. I don’t know what to do with my hands. If you find my son, bring him home, whatever he is now. If you can’t, then end it kindly. Eat something. B.”',
        choices: [{ text: '(Fold the message away.)', to: 'hungry', quest: true, effects: [{ setFlag: 'reaver.brenna_message', value: true }] }],
      },
      hungry: { speaker: 'npc:brenna-runner', text: '(Her stomach makes a noise like a hound under a floor.) …Is there anywhere round here that does stew? I’m not to go back without an answer, and I’m not taking one down on an empty belly. Chief’s orders.', next: null },
    },
  },
  {
    id: 'dialogue:reaver-featured-swordsman', name: 'Featured: Duel at the Barrow (back)', scope: 'party',
    entries: [{ when: stage('quest:reaver-duel-at-the-barrow', 'back'), node: 'back' }],
    nodes: {
      back: {
        speaker: 'npc:bearer-swordsman', text: 'I came up out of that barrow alive, which I didn’t entirely expect. Whatever happens at the Heart, I fight on your side. That is a promise, and on the Ladder promises are rare.',
        effects: [{ setFlag: 'reaver.gaspard_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:reaver-featured-brawler', name: 'Featured: the Brawler’s Bout (back)', scope: 'party',
    entries: [{ when: stage('quest:reaver-the-brawlers-bout', 'back'), node: 'back' }],
    nodes: {
      back: {
        speaker: 'npc:bearer-brawler', mood: 'happy', text: 'Best bout I’ve had since the Lowfold. You hit like a falling kiln. When we go to the Heart, you’re in my corner and I’m in yours.',
        effects: [{ setFlag: 'reaver.kat_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-kiln-ash-ring', name: 'The Kilnmouth ash-ring', scope: 'party',
    entries: [{ when: stage('quest:reaver-the-brawlers-bout', 'ring'), node: 'bout' }, { node: 'ring' }],
    nodes: {
      ring: { speaker: 'narrator', text: 'A ring of ash behind the Cinder Mug, scuffed by thirty years of Saturday nights.', next: null },
      bout: {
        speaker: 'npc:bearer-brawler', text: 'Gloves on, axes off. First one on their back goes second into Ashmaw. Ready?',
        choices: [
          { text: '(Fight fair.)', to: 'fair', effects: [{ setFlag: 'reaver.bout', value: 'fair' }] },
          { text: '(Fight like the Muster: dirty and fast.)', to: 'dirty', effects: [{ setFlag: 'reaver.bout', value: 'dirty' }] },
        ],
      },
      fair: { speaker: 'narrator', text: 'Five hard minutes, and you are both on your backs at once, laughing. Nobody goes first. Everybody goes together.', next: null },
      dirty: { speaker: 'narrator', text: 'She sees the elbow coming and laughs while she ducks it. You win. She doesn’t mind. She says it’s the most honest thing anyone’s done to her all week.', next: null },
    },
  },
  // ======================= ACT III
  {
    id: 'dialogue:reaver-herald-fate', name: 'III-4 the Unburnt Herald: Hask’s fate', scope: 'party',
    entries: [{ node: 'kneel' }],
    nodes: {
      kneel: { speaker: HK, mood: 'hollow', text: 'Sib. You came all this way to lose. We could keep going. Forever. You and me on the line, and nobody ever has to die. Isn’t that what Mother wanted?', next: 'choose' },
      choose: {
        speaker: HK, text: '(He holds out his hand. The lava runs off it like water.)',
        choices: [
          {
            text: '(Take out the peace-axe, and lay it across his open hand.)', to: 'axe', quest: true,
            when: { any: [{ flag: 'reaver.brenna_devotable' }, { flag: 'reaver.muster', value: 'revealed' }] },
            lockedLabel: 'You need the Muster’s peace, or the truth told at the ring',
            effects: [{ setFlag: 'reaver.nemesis_fate', value: 'spared' }],
          },
          { text: 'No, Hask. The war ends. (Finish it.)', to: 'end', quest: true, effects: [{ setFlag: 'reaver.nemesis_fate', value: 'destroyed' }] },
        ],
      },
      axe: { speaker: 'narrator', text: 'The pale wood touches his palm, and for the first time in his life Hask burns. He screams. The black boils off him like steam. When it is gone he is kneeling on the stair, blistered, weeping, alive.', next: 'axe2' },
      axe2: { speaker: HK, mood: 'sad', text: 'It hurts. It hurts, sib. (He is laughing and crying at once.) Tell Mother it hurts.', next: null },
      end: { speaker: 'narrator', text: 'One stroke. The war that never had to end ends on the Twelve Stairs. You close his eyes, and they are only his eyes.', next: null },
    },
  },
  {
    id: 'dialogue:reaver-runner-heart', name: 'Bring Him Home: the runner at the Heart', scope: 'party',
    entries: [
      { when: { all: [{ flag: 'reaver.nemesis_fate', value: 'spared' }, { flag: 'reaver.brenna_devotable' }] }, node: 'alive-devoted' },
      { when: { flag: 'reaver.nemesis_fate', value: 'spared' }, node: 'alive' },
      { node: 'dead' },
    ],
    nodes: {
      'alive-devoted': { speaker: 'npc:brenna-runner', mood: 'happy', text: 'He’s alive? He’s alive, and he burns now? (She is already running.) I’ll tell the chief. I’ll tell her he hurts. She’ll understand.', effects: [{ trust: BR, set: 5 }], next: null },
      alive: { speaker: 'npc:brenna-runner', mood: 'happy', text: 'Alive! I’ll run it all the way to the Fields. The chief will want to hear it twice.', next: null },
      dead: { speaker: 'npc:brenna-runner', mood: 'sad', text: '(She takes Hask’s axe from you in both hands.) I’ll carry it home. The chief said, if it had to end, end it kindly. Did you?', next: null },
    },
  },
  {
    id: 'dialogue:obj-legion-reavers', name: 'The Hollow Muster', scope: 'party',
    entries: [{ when: { questStage: 'quest:reaver-the-hollow-muster', stage: 'free' }, node: 'muster' }, { node: 'gone' }],
    nodes: {
      muster: { speaker: 'narrator', text: 'Ginnet and the others stand in their own rank in the Legion, axes on their shoulders. You lower yours. By the old law, when the Bell rings, the Muster stands down. One by one, they lower theirs.', next: 'ginnet' },
      ginnet: { speaker: 'narrator', mood: 'sad', text: 'Ginnet blinks, and looks at her axe as if she has never seen it. Is it over? she says. You tell her yes.', next: null },
      gone: { speaker: 'narrator', text: 'Where the Muster stood, a neat row of axes laid on the ground.', next: null },
    },
  },
  {
    id: 'dialogue:obj-heart-peace-axe-stone', name: 'The Peace-Axe’s Edge', scope: 'party',
    entries: [
      { when: { questStage: 'quest:reaver-the-peace-axes-edge', stage: 'plant' }, node: 'plant' },
      { when: { questStage: 'quest:reaver-the-peace-axes-edge', stage: 'watch' }, node: 'watch' },
      { node: 'axe' },
    ],
    nodes: {
      plant: { speaker: 'narrator', text: 'You set the pale haft in the crack at the top of the Twelve Stairs. It stands there, unsharpened, a thousand years old, the only weapon in the Heart that was never swung.', next: null },
      axe: { speaker: 'narrator', text: 'The peace-axe, standing at the top of the stairs.', next: null },
      // the first watch (wave 2 depth): Hask comes up the stairs if he was spared; otherwise, nobody comes
      watch: {
        speaker: 'narrator', text: 'Night comes down over the Heart. The Legion’s fires burn below the stairs, and the peace-axe stands in its socket, pale, the only thing up here that isn’t black. You sit down beside it with your back to the stone.',
        choices: [
          { text: '(Wait.)', to: 'hask', when: { flag: 'reaver.nemesis_fate', op: '==', value: 'spared' } },
          { text: '(Wait.)', to: 'alone', when: { not: { flag: 'reaver.nemesis_fate', op: '==', value: 'spared' } } },
        ],
      },
      hask: {
        speaker: HK, text: '(Hask comes up the stairs on his hands and knees, bandaged to the eyes, and sits down on the other side of the axe without asking.) It’s warm. The stone. Everything’s warm now. I hate it. (A long pause.) Can I stay?',
        choices: [{ text: 'Stay.', to: 'stay' }, { text: 'Mother would say you should be in bed.', to: 'bed' }],
      },
      stay: { speaker: 'narrator', text: 'He doesn’t say anything else all night. Every hour or so he reaches out and touches the haft, and snatches his hand back, and laughs at himself.', next: 'dawn' },
      bed: { speaker: HK, mood: 'happy', text: 'She would. She’d say it twice. (He stays anyway, and falls asleep sitting up, across the top of the stairs, like a boy across a door.)', next: 'dawn' },
      alone: { speaker: 'narrator', text: 'Nobody comes. No hounds, no drums, no four beats and a rest. For the first time since the Bell you hear nothing at all, and you don’t know what to do with your hands. Brenna wrote that. Now you know what she meant.', next: 'dawn' },
      dawn: {
        speaker: 'narrator', text: 'At dawn the light finds the axe first. Beside the old rally-mark there is room on the stone. You take out your knife.',
        choices: [
          { text: '(Cut Brenna’s name.)', to: 'cut', effects: [{ setFlag: 'reaver.axe_mark', value: 'brenna' }] },
          { text: '(Cut Hask’s name.)', to: 'cut', effects: [{ setFlag: 'reaver.axe_mark', value: 'hask' }] },
          { text: '(Cut nothing. Leave the room.)', to: 'room', effects: [{ setFlag: 'reaver.axe_mark', value: 'room' }] },
        ],
      },
      cut: { speaker: 'narrator', text: 'You cut it small and deep under the old mark, axe first, the right way round. Somebody, in another thousand years, will find it and wonder who that was.', effects: [{ setFlag: 'reaver.axe_watch', value: true }], next: null },
      room: { speaker: 'narrator', text: 'You leave the stone bare under the old mark. There is room for a great many names up here, and none of them have to be the dead’s.', effects: [{ setFlag: 'reaver.axe_watch', value: true }], next: null },
    },
  },
];

export default dialogues;
