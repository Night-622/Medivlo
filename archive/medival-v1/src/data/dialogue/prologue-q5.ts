/** Dialogue: quest:the-drowned-abbey. Owner: Claude 4. */
import type { DialogueDef } from '@/core';

const Q = 'quest:the-drowned-abbey' as const;

const dialogues: DialogueDef[] = [
  {
    id: 'dialogue:obj-wenna-bell', name: "Object: Saint Wenna's bell",
    entries: [{ node: 'n' }],
    nodes: {
      n: {
        speaker: 'narrator', effects: [{ unlockLore: 'lore:saint-wenna' }],
        text: 'A bronze hand-bell, green with age, cast with the words WENNA KEPT A LAMP. Its clapper has been bound with black reed so it cannot ring. Somewhere below you, another bell is ringing anyway.',
      },
    },
  },
  {
    id: 'dialogue:obj-bound-tobin', name: 'Tobin: The choice',
    entries: [
      { when: { flag: 'prologue.tobin_fate' }, node: 'gone' },
      { when: { questStage: Q, stage: 'tobin' }, node: 'start' },
      { node: 'gone' },
    ],
    nodes: {
      start: {
        speaker: 'narrator',
        text: 'Tobin hangs in a cradle of black reeds, eyes open, black water running down his cheeks. He is singing under his breath in a language you don’t know. Beside you, Maren makes a sound you will remember for the rest of your life.',
        next: 'maren',
      },
      maren: {
        speaker: 'npc:maren-hollis', mood: 'afraid',
        text: 'Tobin. Tobin, it’s me. …{player.name}, do something. Please.',
        choices: [
          { text: '[Briar-salve] Rub the salve on him, then burn the Mire out.', to: 'salve', when: { hasItem: 'item:briar-salve' } },
          { text: 'Burn the Mire out of him, carefully. Hold the fire to a thread.', to: 'burn-ok', check: { stat: 'will', dc: 20, failTo: 'burn-fail' } },
          { text: 'Bind him tight. We’ll carry him home and find a cure.', to: 'bind' },
          { text: '"He’s gone, Maren. Let me end it quickly."', to: 'mercy', tag: 'aggressive' },
        ],
      },
      salve: {
        speaker: 'narrator',
        text: 'The salve smokes where it touches him, and the black comes up through his skin like ink through paper. You lay your hand on his chest and the Ashmark flares. The darkness burns away and leaves the boy behind. Tobin coughs up black water and starts to cry.',
        next: 'saved',
      },
      'burn-ok': {
        speaker: 'narrator',
        text: 'You hold the fire back to a thread and draw the Mire out of him slowly, the way you would draw a splinter. It takes everything you have. Then it is done, and Tobin is choking and sobbing and himself.',
        next: 'saved',
      },
      saved: {
        speaker: 'npc:maren-hollis', mood: 'happy',
        effects: [{ setFlag: 'prologue.tobin_fate', value: 'saved' }, { loyalty: 'npc:maren-hollis', delta: 30 }],
        text: 'Tobin! Oh, you stupid, stupid boy. Come here. Come here.',
      },
      'burn-fail': {
        speaker: 'narrator',
        text: 'The fire won’t stay small. It finds the Mire in him and follows it down, and the Mire runs deeper than the boy. Tobin stops singing.',
        next: 'dead',
      },
      dead: {
        speaker: 'npc:maren-hollis', mood: 'sad',
        effects: [{ setFlag: 'prologue.tobin_fate', value: 'dead' }, { loyalty: 'npc:maren-hollis', delta: -40 }],
        text: 'No. No, no, no…',
      },
      bind: {
        speaker: 'narrator',
        text: 'You lash the reeds tight, and Maren gets his arm over her shoulder. Halfway up the crypt stairs he twists free with a strength no boy should have and runs, singing, into the dark.',
        next: 'bind2',
      },
      bind2: {
        speaker: 'npc:maren-hollis', mood: 'angry',
        effects: [{ setFlag: 'prologue.tobin_fate', value: 'hollowed' }, { loyalty: 'npc:maren-hollis', delta: 10 }],
        text: 'TOBIN! …We’ll find him. Swear it. Swear to me we’ll find him.',
      },
      mercy: { speaker: 'npc:maren-hollis', mood: 'angry', text: 'Don’t you dare. Don’t you DARE—', next: 'mercy2' },
      mercy2: {
        speaker: 'narrator',
        effects: [{ setFlag: 'prologue.tobin_fate', value: 'dead' }, { loyalty: 'npc:maren-hollis', delta: -60 }],
        text: 'But it is done, and it is quick. Maren does not speak to you again in the abbey.',
      },
      gone: { speaker: 'narrator', text: 'The cradle of black reeds hangs empty.' },
    },
  },
  {
    id: 'dialogue:morwen-death', name: 'Morwen: The last hour',
    entries: [{ node: 'fall' }],
    nodes: {
      fall: { speaker: 'narrator', text: 'Abbess Morwen sinks to her knees in the black water, and the bells stop.', next: 'ask' },
      ask: {
        speaker: 'npc:abbess-morwen', mood: 'hollow', text: 'Light… Is it Lanternmass?',
        choices: [
          { text: '"Yes, Mother. It’s Lanternmass."', to: 'yes' },
          { text: '[Say nothing]', to: 'silent' },
        ],
      },
      yes: {
        speaker: 'npc:abbess-morwen', mood: 'hollow',
        text: 'Then I may stop ringing. Good. Good. …Wenna kept a lamp for travellers. Did I keep it lit?',
        next: 'gone',
      },
      silent: { speaker: 'narrator', text: 'Her lips move, counting the hours.', next: 'gone' },
      gone: { speaker: 'narrator', text: 'She is gone before you can answer.' },
    },
  },
  {
    id: 'dialogue:obj-fallen-ember', name: 'Vision: The Pale Saint',
    entries: [
      { when: { flag: 'prologue.ember_claimed' }, node: 'after' },
      { when: { questStage: Q, stage: 'ember' }, node: 'coal' },
      { node: 'wait' },
    ],
    nodes: {
      wait: { speaker: 'narrator', text: 'Something burns white beneath the black water. Something is still guarding it.' },
      after: { speaker: 'narrator', text: 'The reliquary is empty now. Only the warmth in your hand remains.' },
      coal: {
        speaker: 'narrator',
        text: 'It lies in the reliquary where Saint Wenna’s bones should be: a coal the size of a fist, burning white under a hand’s depth of black water that cannot put it out. Your mark is so hot it hurts.',
        next: 'take',
      },
      take: {
        speaker: 'narrator',
        // claimed the moment it enters the hand, so closing the vision early can never block the quest
        effects: [
          { setFlag: 'prologue.ember_claimed', value: true },
          { setFlag: 'world.embers_held', value: 1 },
          { setFlag: 'ashmark.rank', value: 2 },
          { unlockLore: 'lore:the-seven-embers', section: 'mere' },
          { unlockLore: 'lore:the-ashmark', section: 'embersight' },
        ],
        text: 'You reach for it. It doesn’t wait for you. It leaps into your palm and goes in, like a stone into a pond, and the world goes white.',
        next: 'below',
      },
      below: {
        speaker: 'narrator',
        text: 'You are standing on black water that goes on forever. There is no sky above you, only the underside of the world, a ceiling of roots and stone. Far off through it a red glow is beating like a heart.',
        next: 'ysolde',
      },
      ysolde: {
        speaker: 'npc:ysolde', mood: 'hollow', effects: [{ unlockLore: 'lore:ysolde-the-pale-saint', section: 'pale-saint' }],
        text: 'There you are. Oh, look at you. You’re so warm, little spark. I remember being warm. It hurt.',
        choices: [
          { text: '"Who are you?"', to: 'who' },
          { text: '"Where is this?"', to: 'where' },
          { text: '"Stay away from me."', to: 'away' },
        ],
      },
      who: { speaker: 'npc:ysolde', mood: 'hollow', text: 'Once they called me a saint. I suppose they still do, in the places that haven’t heard.', next: 'embers' },
      where: { speaker: 'npc:ysolde', mood: 'hollow', text: 'Below. Where the water goes. Where everyone will go in the end, and it won’t hurt anymore.', next: 'embers' },
      away: { speaker: 'npc:ysolde', mood: 'hollow', text: 'I’m not near you. Not yet. I’m sorry, little spark. I’m sorry for all of it.', next: 'embers' },
      embers: {
        speaker: 'npc:ysolde', mood: 'hollow',
        text: 'You have one of my Embers now. Keep it safe for me. Gather the others, if you like. It will be easier, at the end, if you’re the one who brings them.',
        next: 'wake',
      },
      wake: {
        speaker: 'narrator',
        text: 'The white goes out. You are kneeling in the reliquary with mud to your elbows, and the scar on your hand is glowing through the skin like a lantern behind cloth.',
      },
    },
  },
  {
    id: 'dialogue:hesta-meeting', name: 'Hesta: The last Warden',
    entries: [{ node: 'shore' }],
    nodes: {
      shore: {
        speaker: 'narrator',
        text: 'On the shore of the drained mere an old woman stands in the snow, leaning on a staff. A sword hangs at her hip, and the snow steams where it lands on the scabbard.',
        next: 'short',
      },
      short: { speaker: 'npc:hesta-corrow', text: 'Well. You’re shorter than I hoped.', next: 'intro' },
      intro: {
        speaker: 'npc:hesta-corrow',
        text: 'Don’t gape, it’s undignified. Hesta Corrow. I’ve chased seven falling stars across the Haldmarch for a year, and you’re the first one I’ve found before someone else got to it. Let me see the hand.',
        choices: [
          { text: '[Show her]', to: 'hand' },
          { text: '"Who are you, really?"', to: 'warden' },
        ],
      },
      warden: { speaker: 'npc:hesta-corrow', text: 'An Emberwarden, child. Yes, we’re all supposed to be dead. I’m working on it. Now, the hand.', next: 'hand' },
      hand: {
        speaker: 'narrator',
        text: 'She takes your hand in her burned one and turns it to the light. For a moment the hardness goes out of her face.',
        next: 'inside',
      },
      inside: {
        speaker: 'npc:hesta-corrow',
        text: 'It’s in you. Not carried, in. Seven Sparks, I’ve never seen that. Did she speak to you? A woman all in white, with water for tears?',
        choices: [
          { text: '"She said she was a saint."', to: 'ysolde' },
          { text: '"She called me ‘little spark’."', to: 'ysolde' },
        ],
      },
      ysolde: {
        speaker: 'npc:hesta-corrow', mood: 'sad',
        text: 'Ysolde. Her name is Ysolde Maerin. She was my apprentice, and she is the one who put out the Brand.',
        choices: [
          { text: '[Riders on the causeway]', to: 'defied', when: { flag: 'prologue.hale_outcome', op: '==', value: 'defied' } },
          { text: '[The Inquisitor steps forward]', to: 'hale', when: { not: { flag: 'prologue.hale_outcome', op: '==', value: 'defied' } } },
        ],
      },
      hale: { speaker: 'npc:garrick-hale', text: 'That’s far enough, old woman. The Ashmarked is under the Wick’s eye.', next: 'hale2' },
      hale2: { speaker: 'npc:hesta-corrow', text: 'Garrick Hale. I remember you as a boy at Valcastre with a wooden sword. You’ve grown up thick.', next: 'hale3' },
      hale3: { speaker: 'npc:garrick-hale', mood: 'afraid', text: 'Corrow? You’re dead. You were burned at Valcastre.', next: 'hale4' },
      hale4: { speaker: 'npc:hesta-corrow', text: 'Sloppy work, wasn’t it? Look at the abbey, Garrick. Look at the hand. You know what that is.', next: 'hale5' },
      hale5: {
        speaker: 'npc:garrick-hale', effects: [{ setFlag: 'npc.garrick-hale.let_go', value: true }],
        text: '…Go, then. I’ll write to Solenne that I lost you in the snow. Pray the Lord-Inquisitor never reads it closely.',
        next: 'offer',
      },
      defied: {
        speaker: 'narrator',
        text: 'Riders are coming along the causeway: Hale, with a bandaged arm and fresh soldiers. "There! Take them both—" Hesta raises her sword, and the snow between you and the riders bursts into a wall of red fire. Horses scream. When the fire dies, the causeway is empty.',
        next: 'defied2',
      },
      defied2: { speaker: 'npc:hesta-corrow', text: 'He’ll be back. His sort always is.', next: 'offer' },
      offer: {
        speaker: 'npc:hesta-corrow',
        text: 'Now listen. There are six more Embers out there, and she wants every one, yours included. The north road’s blocked, so I’ll burn us a way through. There’s a ruin in the Kingsvale called Cinderhold that used to be ours. Come with me, if you’d like to live through the winter.',
        choices: [
          { text: '"I’ll come."', to: 'yes' },
          { text: '"And if I don’t?"', to: 'no' },
        ],
      },
      no: {
        speaker: 'npc:hesta-corrow',
        text: 'Then she’ll find you, and you’ll walk into the water smiling, like the miller’s wife. Your choice. I’ll be on the north road at first light.',
      },
      yes: { speaker: 'npc:hesta-corrow', mood: 'happy', text: 'Good. Say your goodbyes. I’ll be on the north road at first light.' },
    },
  },
];

export default dialogues;
