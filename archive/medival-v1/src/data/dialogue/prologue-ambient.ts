/** Dialogue: side quests and per-NPC general conversations (Aldermoor). Owner: Claude 4. */
import type { DialogueDef } from '@/core';

const notStarted = (q: `quest:${string}`) => ({ not: { any: [{ questActive: q }, { questCompleted: q }] } });

const dialogues: DialogueDef[] = [
  // ----- Godric + Smoke from the Barrow
  {
    id: 'dialogue:godric-general', name: 'Godric: General',
    entries: [
      { when: { questStage: 'quest:smoke-from-the-barrow', stage: 'report' }, node: 'report' },
      { when: { all: [{ questCompleted: 'quest:the-ashmark' }, notStarted('quest:smoke-from-the-barrow')] }, node: 'offer' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'npc:godric-thatch', text: 'Keep your hood up and your hand gloved. Folk are frightened, and frightened folk talk.' },
      offer: {
        speaker: 'npc:godric-thatch',
        text: 'One more thing, if you’ve the stomach for it. There’ve been lights at Edric’s Barrow out on the moor, at night. Old Edric’s men sleep there, and I’ll not have them robbed.',
        choices: [
          { text: 'I’ll look into it.', to: 'thanks', effects: [{ startQuest: 'quest:smoke-from-the-barrow' }] },
          { text: 'Not now.', to: null, tag: 'leave' },
        ],
      },
      thanks: { speaker: 'npc:godric-thatch', text: 'Seven keep you. Take a torch. Not that you need one.' },
      report: {
        speaker: 'npc:godric-thatch', mood: 'afraid',
        text: 'Reavers, and a voice behind the door? The river of the dead, frozen? …Seven keep us. Here. This was my father’s. It’s done more good on my wall than it would in a barrow. Take it.',
      },
    },
  },
  {
    id: 'dialogue:obj-barrow-inner-door', name: "Object: Edric's door",
    entries: [
      { when: { flag: 'act1.edric_door_open' }, node: 'oath-open' },
      { when: { questStage: 'quest:edrics-oath', stage: 'door' }, node: 'oath-door' },
      { when: { questStage: 'quest:smoke-from-the-barrow', stage: 'door' }, node: 'door' },
      { node: 'idle' },
    ],
    nodes: {
      'oath-door': { speaker: 'narrator', text: 'The frost on the round door is gone. The stone is wet, and somewhere behind it you hear water moving, slow, like a river finding its bed after a long winter.', next: 'oath-voice' },
      'oath-voice': {
        speaker: 'npc:cuthred', text: 'Ashmarked. The river runs. Not far, and not for long. Far enough. Will you open the King’s door?',
        choices: [
          { text: 'Set your marked hand to the stone.', to: 'oath-opening', effects: [{ setFlag: 'act1.edric_door_open', value: true }] },
          { text: '“Not yet.”', to: null, tag: 'leave' },
        ],
      },
      'oath-opening': { speaker: 'narrator', text: 'The crown carved on the door glows ember-red under your palm, and the stone rolls back with a sound like a long-held breath let go.' },
      'oath-open': { speaker: 'narrator', text: 'Edric’s door stands open. Cold air breathes out of it, smelling of old iron and snowmelt.' },
      idle: { speaker: 'narrator', text: 'A round stone door carved with a crown above a barrow. Sealed, and cold to the touch.' },
      door: { speaker: 'narrator', text: 'A round stone door carved with a crown above a barrow. Frost is growing on it from the inside.', next: 'voice' },
      voice: {
        speaker: 'narrator', text: 'A voice comes through the stone, slow and cold: "Who knocks at the King’s door?"',
        choices: [
          { text: '"Who’s there?"', to: 'cuthred' },
          { text: '"I’m from Brindlecross. Robbers were at your barrow."', to: 'cuthred' },
        ],
      },
      cuthred: {
        speaker: 'narrator',
        text: '"I am Cuthred, sworn to Edric. I have kept this door three hundred years, and I would rest now. But the water is frozen. We cannot cross. We wake, and we wait, and the cold is very long."',
        next: 'later',
      },
      later: {
        speaker: 'narrator', effects: [{ setFlag: 'side.barrow_voice_heard', value: true }],
        text: '"When the river runs again, Ashmarked, come back. The King keeps something for you." The frost on the door fades.',
      },
    },
  },
  // ----- Hild + The Cold Forge
  {
    id: 'dialogue:hild-general', name: 'Hild: The smithy',
    entries: [
      { when: { questStage: 'quest:the-cold-forge', stage: 'return' }, node: 'return' },
      { when: { all: [{ questCompleted: 'quest:the-ashmark' }, notStarted('quest:the-cold-forge')] }, node: 'offer' },
      { when: { flag: 'side.hild_forge_lit' }, node: 'lit' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'npc:hild-coalbrook', mood: 'happy', text: 'Bring me your steel and I’ll make it sing. Orrun-trained, me: three years at Dun Korrath-Gate. Don’t let the beardless face fool you.' },
      offer: {
        speaker: 'npc:hild-coalbrook',
        text: 'Ha! The pyre-lighter. Do me a favour? My forge won’t hold its heat. It’s not the coal; it’s what’s under it. The ground’s gone cold, like a hearth nobody’s fed. There’s ley-coal up in the tors. It glows a bit, if you’ve the eye. Bring me three good lumps?',
        choices: [
          { text: 'I’ll fetch it.', to: null, effects: [{ startQuest: 'quest:the-cold-forge' }] },
          { text: 'Later.', to: null, tag: 'leave' },
        ],
      },
      return: {
        speaker: 'npc:hild-coalbrook', mood: 'happy',
        text: 'That’s the stuff! Feel that, it’s warm in your hand. Warmer in yours than mine, I’d say. …There. Hear her roar? I’ll put an edge on anything you bring me, as long as she burns.',
      },
      lit: { speaker: 'npc:hild-coalbrook', mood: 'happy', text: 'She’s roaring. Best fire in the valley, and I’ve you to thank for it.' },
    },
  },
  // ----- companions & recurring
  {
    id: 'dialogue:maren-general', name: 'Maren: General',
    entries: [
      { when: { questActive: 'quest:lost-in-the-gloamwood' }, node: 'woods' },
      { when: { flag: 'prologue.tobin_fate', op: '==', value: 'saved' }, node: 'saved' },
      { when: { flag: 'prologue.tobin_fate', op: '==', value: 'hollowed' }, node: 'hollowed' },
      { when: { flag: 'prologue.tobin_fate', op: '==', value: 'dead' }, node: 'dead' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'npc:maren-hollis', text: 'I’ll be about. Shout if you need someone shot.' },
      woods: {
        speaker: 'npc:maren-hollis', mood: 'afraid',
        text: 'Keep up. And if we find Tobin, don’t… don’t hurt him. Whatever he looks like.',
        choices: [
          { text: '"We’ll find him."', to: null },
          { text: '"Maren, if he’s like those things on the green…"', to: 'burn' },
        ],
      },
      burn: { speaker: 'npc:maren-hollis', mood: 'angry', text: 'Then you’ll burn it out of him. You did something to that pyre. You can do it to him. You have to.' },
      saved: { speaker: 'npc:maren-hollis', mood: 'happy', text: 'He’s asleep. Properly asleep, no singing. I owe you more than I can carry, {player.name}.' },
      hollowed: { speaker: 'npc:maren-hollis', mood: 'sad', text: 'He went east. The prints went east, toward the marsh. You swore to me. Don’t forget it.' },
      dead: { speaker: 'npc:maren-hollis', mood: 'sad', text: '…Leave me be. Please.' },
    },
  },
  {
    id: 'dialogue:anselm-general', name: 'Anselm: General',
    entries: [{ when: { flag: 'prologue.pyre_lit' }, node: 'after' }, { node: 'before' }],
    nodes: {
      before: { speaker: 'npc:anselm-pryde', text: 'Lux manet. The light remains. Dry tinder, mind; there’s some in the woodshed.' },
      after: { speaker: 'npc:anselm-pryde', text: 'Whatever that fire was, it wasn’t nothing. I’ve been reading by candlelight all night, and I keep coming back to the same page.' },
    },
  },
  {
    id: 'dialogue:briar-general', name: 'Nan Briar: General',
    entries: [{ node: 'n' }],
    nodes: { n: { speaker: 'npc:nan-briar', text: 'Mind the Old Sleeper, lamb. It dreams lightly this winter.' } },
  },
  {
    id: 'dialogue:hale-general', name: 'Hale: General',
    entries: [{ node: 'n' }],
    nodes: { n: { speaker: 'npc:garrick-hale', text: 'Do what you said you’d do. The Wick is watching, and so am I.' } },
  },
  {
    id: 'dialogue:hesta-general', name: 'Hesta: General',
    entries: [{ node: 'n' }],
    nodes: { n: { speaker: 'npc:hesta-corrow', text: 'North road. First light. Don’t make me come and fetch you, I’m old and my knees are older.' } },
  },
  {
    id: 'dialogue:tobin-general', name: 'Tobin: Home',
    entries: [{ node: 'n' }],
    nodes: { n: { speaker: 'npc:tobin-hollis', text: 'Are you the one who…? Thank you. I still dream about the water. But it’s quieter now, and Mam isn’t in it any more.' } },
  },
];

export default dialogues;
