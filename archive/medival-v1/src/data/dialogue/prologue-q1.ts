/** Dialogue: quest:the-ashmark. Owner: Claude 4. */
import type { DialogueDef } from '@/core';

const dialogues: DialogueDef[] = [
  {
    id: 'dialogue:maren-wake', name: 'Maren: Remembrance morning',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:maren-hollis', mood: 'happy',
        text: 'Up! Seven keep us, are you still abed? It’s Lanternmass, the Remembrance. Half the village is on the green already, and Wat’s brewed the spiced ale too strong again.',
        choices: [
          { text: 'I’m coming. Give me a moment.', to: 'chapel' },
          { text: 'I didn’t sleep. The mark was burning again.', to: 'mark' },
          { text: 'Is Tobin with you?', to: 'tobin' },
        ],
      },
      mark: {
        speaker: 'npc:maren-hollis', mood: 'afraid',
        text: 'Again? …Show me. (She takes your hand and turns it over.) It’s warm. It’s always warm. Keep it gloved today, will you? There are Wick riders on the south road.',
        next: 'chapel',
      },
      tobin: {
        speaker: 'npc:maren-hollis', mood: 'sad',
        text: 'Tobin? Sulking in bed. He’s been having the dreams again, about Mam, under the water, singing to him. I’ll drag him out for the pyre if I have to carry him.',
        next: 'chapel',
      },
      chapel: {
        speaker: 'npc:maren-hollis',
        text: 'Brother Anselm wants you at the chapel, something about the pyre. Go on. I’ll save you a honey-cake if Wat’s boy doesn’t eat them all first.',
      },
    },
  },
  {
    id: 'dialogue:anselm-pyre', name: 'Anselm: The remembrance pyre',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:anselm-pryde', effects: [{ unlockLore: 'lore:the-seven-sparks' }],
        text: 'Ah, there you are. Lux manet, child: the light remains. Though some days I wonder where it’s hiding.',
        choices: [
          { text: 'Maren said you needed help.', to: 'help' },
          { text: 'Do you still believe that? That the light remains?', to: 'faith' },
        ],
      },
      faith: {
        speaker: 'npc:anselm-pryde',
        text: 'I believe in lanterns. You don’t stare into one; you hold it up so you can see the road. Whether the light comes from Ithren or from good oil and a trimmed wick… well. The road is still there.',
        next: 'help',
      },
      help: {
        speaker: 'npc:anselm-pryde',
        text: 'The pyre, yes. Old Hearth custom, not Church, but I’ve never seen the harm in a fire for the dead. Godric built it, but the tinder’s damp through. There’s dry stuff in the woodshed. Bring it to the green and we’ll light it at dusk.',
        next: 'glove',
      },
      glove: {
        speaker: 'npc:anselm-pryde',
        text: '(His eyes drop to your hand, then rise again.) And keep that hand gloved today. There are riders on the south road.',
        choices: [
          { text: 'You know about my hand?', to: 'knows' },
          { text: 'I’ll fetch the tinder.', to: null },
        ],
      },
      knows: {
        speaker: 'npc:anselm-pryde', effects: [{ setFlag: 'npc.anselm-pryde.knows', value: true }],
        text: 'I’ve known since the night it happened. I’ve said nothing to anyone, and I’m saying nothing now. Go on.',
      },
    },
  },
  {
    id: 'dialogue:obj-woodshed-tinder', name: 'Object: woodshed tinder',
    entries: [
      { when: { questStage: 'quest:the-ashmark', stage: 'tinder' }, node: 'take' },
      { node: 'idle' },
    ],
    nodes: {
      take: { speaker: 'narrator', text: 'Under a sack at the back of the woodshed: a bundle of dry heather and birch-bark, tied with red thread. Somebody saved it for tonight.' },
      idle: { speaker: 'narrator', text: 'Stacked peat and split alder, white with frost.' },
    },
  },
  {
    id: 'dialogue:obj-remembrance-pyre', name: 'Object: remembrance pyre',
    entries: [
      { when: { flag: 'prologue.pyre_lit' }, node: 'lit' },
      { when: { not: { questStage: 'quest:the-ashmark', stage: 'pyre' } }, node: 'unlit' },
    ],
    nodes: {
      unlit: { speaker: 'narrator', text: 'The remembrance pyre: Godric has built it high, with a straw lantern-man on top. The wood is wet with snow.' },
      lit: { speaker: 'narrator', text: 'The pyre still burns white-gold, hotter than any wood should. The snow will not settle within ten paces of it.' },
    },
  },
  {
    id: 'dialogue:pyre-ignites', name: 'Cutscene: the pyre ignites',
    entries: [{ node: 'dusk' }],
    nodes: {
      dusk: {
        speaker: 'narrator',
        text: 'Dusk. The village gathers in the snow around the pyre. Brother Anselm reads the names of the dead: Edith, the miller’s wife; the Ashby twins; eleven sisters of the abbey. Then he nods to you.',
        next: 'kneel',
      },
      kneel: { speaker: 'narrator', text: 'You kneel with the tinder. Before you can strike the flint, your hand begins to burn.', next: 'flame' },
      flame: {
        speaker: 'narrator',
        text: 'The pyre does not catch. It explodes. A column of white-gold fire roars up, ten times the height of the wood, so bright the snow turns to steam. And in it, for a heartbeat, you see something far below the earth: vast and red, beating like a heart.',
        next: 'maren',
      },
      maren: { speaker: 'npc:maren-hollis', mood: 'afraid', text: '…{player.name}? Your hand. Your HAND.', next: 'godric' },
      godric: { speaker: 'npc:godric-thatch', mood: 'afraid', text: 'Seven keep us. What did you—', next: 'shapes' },
      shapes: {
        speaker: 'narrator', effects: [{ setFlag: 'prologue.festival_attacked', value: true }],
        text: 'Out on the moor, beyond the light, shapes are moving in the snow. Pale shapes, with black water running from their eyes. They are walking toward the fire.',
        next: 'run',
      },
      run: { speaker: 'npc:maren-hollis', mood: 'angry', text: 'Hollowed! Everyone into the chapel! {player.name}, with me!' },
    },
  },
  {
    id: 'dialogue:godric-aftermath', name: 'Godric: After the attack',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:godric-thatch', mood: 'afraid',
        text: 'Is it… is it done? Four of them. Hollowed, here, on Lanternmass.',
        next: 'what',
      },
      what: {
        speaker: 'npc:godric-thatch',
        text: 'And you. I’ve known you since you were knee-high, and I don’t know what you are. That fire wasn’t Church, and it wasn’t Hearth.',
        choices: [
          { text: 'I don’t know what it is either.', to: 'honest' },
          { text: 'It saved the village, didn’t it?', to: 'saved' },
          { text: '[Devout] Ithren’s light. You all saw it.', to: 'devout', when: { dialogueTag: 'devout' }, tag: 'trait' },
        ],
      },
      honest: { speaker: 'npc:godric-thatch', text: 'No. No, I don’t suppose you do.', next: 'maren' },
      saved: { speaker: 'npc:godric-thatch', text: 'Aye. It did. I’ll remember that when the Wick come asking, and they will.', next: 'maren' },
      devout: {
        speaker: 'npc:godric-thatch', effects: [{ setFlag: 'npc.godric-thatch.awed', value: true }],
        text: '…Maybe it was. Maybe. Anselm can argue it with the Inquisition.', next: 'maren',
      },
      maren: {
        speaker: 'npc:maren-hollis', mood: 'afraid',
        text: 'Godric! Tobin’s not in the house. His bed’s soaked through with black water, like those things. His boots are gone, and the prints go into the Gloamwood.',
        next: 'go',
      },
      go: {
        speaker: 'npc:godric-thatch',
        text: 'The Gloamwood? At night, with Hollowed abroad? …Go. Both of you. You’ve a better chance than any of us now. I’ve no right to ask it, but go.',
      },
    },
  },
];

export default dialogues;
