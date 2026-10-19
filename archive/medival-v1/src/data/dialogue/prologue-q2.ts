/** Dialogue: quest:lost-in-the-gloamwood. Owner: Claude 4. */
import type { DialogueDef } from '@/core';

const dialogues: DialogueDef[] = [
  {
    id: 'dialogue:obj-tobins-lantern', name: "Object: Tobin's lantern",
    entries: [{ node: 'look' }],
    nodes: {
      look: {
        speaker: 'narrator',
        text: 'Tobin’s shepherd-lantern lies in the snow, still lit, its glass cracked. Beside it the footprints of a bare-footed boy go west, and they are full of black water that has not frozen. Beside his prints run the tracks of a great stag.',
      },
    },
  },
  {
    id: 'dialogue:briar-first', name: 'Nan Briar: First meeting',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:nan-briar', effects: [{ unlockLore: 'lore:the-thornwise' }],
        text: 'Well now. Two lost lambs in my wood, and one of them glowing like a coal. Come in out of the snow, before the Old Sleeper smells you.',
        next: 'hub',
      },
      hub: {
        speaker: 'npc:nan-briar', text: 'Well? Ask, then. My pot won’t stir itself.',
        choices: [
          { text: 'We’re looking for a boy. Tobin Hollis.', to: 'tobin' },
          { text: 'The Old Sleeper?', to: 'sleeper', once: true, tag: 'lore' },
          { text: 'Who are you?', to: 'who', once: true },
        ],
      },
      who: {
        speaker: 'npc:nan-briar',
        text: 'Nan Briar. I keep the wood, and the wood keeps me. The priests call it witchery. The Thornwise call it listening. Your gran called it "fetch Nan, the baby’s coughing".',
        next: 'hub',
      },
      sleeper: {
        speaker: 'npc:nan-briar', effects: [{ unlockLore: 'lore:the-mire', section: 'old-sleeper' }],
        text: 'You’ll hear priests call it evil. Is the sea evil? Is sleep? It was here first, love. It was dreaming, and Orr woke it with a hammer, and it’s been tossing in its bed ever since. Everything that’s hungry was something else first.',
        next: 'hub',
      },
      tobin: {
        speaker: 'npc:nan-briar', mood: 'sad', effects: [{ unlockLore: 'lore:the-white-stag' }],
        text: 'Shepherd’s boy? Aye, he passed in the night. Walking in his sleep, eyes running black, singing. And he wasn’t alone. The White Stag was walking beside him, herding him like a lost lamb, and the Stag’s gone Hollow too.',
        next: 'stag',
      },
      stag: {
        speaker: 'npc:nan-briar',
        text: 'It’s guarded the Weeping Stones since before your grandmothers’ grandmothers. If it’s taken, it’s taking others east, toward the mere. It must be stopped.',
        choices: [
          { text: 'Then we’ll kill it.', to: 'kill', tag: 'aggressive' },
          { text: 'Can it be saved?', to: 'save' },
        ],
      },
      kill: {
        speaker: 'npc:nan-briar',
        text: 'You could. Plenty would. But harm the White Stag and the winter never ends, so they say, and I’d not test that this year of all years.',
        next: 'save',
      },
      save: {
        speaker: 'npc:nan-briar',
        text: 'That mark of yours burns the Mire. I can smell it from here. Bring the Stag low, until it kneels. Then put your hand to it and burn the dark out. It’ll hurt you both. Bring me what it weeps after, and I’ll make something for the boy.',
      },
    },
  },
  {
    id: 'dialogue:briar-return', name: 'Nan Briar: The trail to the mere',
    entries: [
      { when: { flag: 'prologue.stag_fate', op: '==', value: 'cleansed' }, node: 'clean' },
      { node: 'slain' },
    ],
    nodes: {
      clean: {
        speaker: 'npc:nan-briar', mood: 'happy',
        text: 'I felt it. The stones are singing again, can you hear? You’ve a kind hand, for a burning one. Give me those tears.',
        next: 'salve',
      },
      salve: {
        speaker: 'npc:nan-briar', effects: [{ giveItem: 'item:briar-salve' }],
        text: 'Briar-salve. Rub it on the boy before you burn him, and it’ll draw the Mire up to the skin. Then the fire takes the dark and leaves the child. Without it… well. Fire’s fire.',
        next: 'trail',
      },
      slain: {
        speaker: 'npc:nan-briar', mood: 'sad',
        text: 'The stones have stopped weeping. I felt it go. …No. I’ll not shout at you. You did what the winter made you do.',
        next: 'hard',
      },
      hard: {
        speaker: 'npc:nan-briar',
        text: 'Here’s a hard truth for you, then. If the boy’s half-taken, burning him clean may burn him dead. I’d have made you something to help, from what the Stag wept. Too late for that now.',
        next: 'trail',
      },
      trail: {
        speaker: 'npc:nan-briar',
        text: 'The trail goes east, to Wennamere, to the abbey under the water. The black water’s been calling them there all winter. Something’s lying at the bottom of that mere, burning, and the Mire wants it.',
        next: 'gift',
      },
      gift: {
        speaker: 'npc:nan-briar',
        text: 'Take this too: old cold-craft, Saela’s tint. It keeps the hungry things slow. And lambs, riders came down the south road this morning, wearing wick-scissors. Go home first. They’ll be waiting.',
      },
    },
  },
  {
    id: 'dialogue:white-stag', name: 'White Stag bark', bark: true,
    entries: [{ node: 'n' }],
    nodes: { n: { speaker: 'narrator', text: 'The White Stag watches you from among the stones, then lowers its great head.' } },
  },
];

export default dialogues;
