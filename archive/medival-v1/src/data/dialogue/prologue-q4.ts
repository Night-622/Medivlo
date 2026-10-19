/** Dialogue: quest:the-millers-key. Owner: Claude 4. */
import type { DialogueDef } from '@/core';

const Q = 'quest:the-millers-key' as const;

const dialogues: DialogueDef[] = [
  {
    id: 'dialogue:oswin-ask', name: 'Oswin: The lost key',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:oswin', mood: 'afraid',
        text: 'The sluice-key? (He wipes floury hands on his apron, slowly.) Lost. Years ago. My father had it last, and he’s in the ground, so.',
        choices: [
          { text: 'You’re lying.', to: 'lie', tag: 'intimidate' },
          { text: '"You keep every key in this mill on a hook, and there’s an empty one."', to: 'hook', tag: 'lore', check: { stat: 'intellect', dc: 15, failTo: 'lie' } },
          { text: 'All right. Thank you.', to: 'end' },
        ],
      },
      lie: { speaker: 'npc:oswin', mood: 'afraid', text: 'I’ve work. Please. I’ve work to do.' },
      hook: { speaker: 'npc:oswin', mood: 'angry', text: 'That’s… that’s for a key I lost. Get out of my mill.' },
      end: { speaker: 'npc:oswin', text: 'Seven keep you.' },
    },
  },
  {
    id: 'dialogue:oswin-general', name: 'Oswin: General',
    entries: [{ node: 'n' }],
    nodes: { n: { speaker: 'npc:oswin', mood: 'sad', text: 'Mill’s turning slow this winter. The Brindle’s half ice. Was there something?' } },
  },
  {
    id: 'dialogue:obj-oswin-strongbox', name: "Object: Oswin's strongbox",
    entries: [
      { when: { flag: 'prologue.strongbox_opened' }, node: 'empty' },
      { when: { questStage: Q, stage: 'investigate' }, node: 'box' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'narrator', text: 'An iron-bound strongbox under the miller’s workbench. It’s none of your business.' },
      box: {
        speaker: 'narrator', text: 'An iron-bound strongbox under Oswin’s workbench, with a good lock.',
        choices: [
          { text: '[Use the mill-key]', to: 'open', when: { hasItem: 'item:mill-key' } },
          { text: '[Shade] Pick the lock.', to: 'open', when: { classIs: 'class:shade' }, tag: 'class' },
          { text: 'Force the lid.', to: 'open', check: { stat: 'might', dc: 15, failTo: 'fail' } },
          // always-available fallback so no build can soft-lock here; it costs subtlety, not progress
          { text: 'Smash it open with the miller’s own hammer. Loudly.', to: 'smash', tag: 'aggressive' },
          { text: 'Leave it.', to: null, tag: 'leave' },
        ],
      },
      fail: { speaker: 'narrator', text: 'The lid groans but holds. You’ll need a key, or more strength than you’ve got. Someone in the village might know where Oswin keeps his spares.' },
      open: {
        speaker: 'narrator',
        effects: [{ setFlag: 'prologue.strongbox_opened', value: true }, { giveItem: 'item:sluice-key' }, { giveItem: 'item:choir-hymnal' }],
        text: 'Inside, wrapped in oilcloth: a heavy iron key stamped with a giant’s sigil, and a little book of hymns copied out in a careful village hand. The first page reads: "For Edith, who is sleeping."',
      },
      smash: {
        speaker: 'narrator',
        effects: [
          { setFlag: 'prologue.strongbox_opened', value: true }, { setFlag: 'npc.oswin.warned', value: true },
          { giveItem: 'item:sluice-key' }, { giveItem: 'item:choir-hymnal' },
        ],
        text: 'Three blows with the mill-hammer and the hinges give. Half the village must have heard it. Inside, wrapped in oilcloth: a heavy iron key stamped with a giant’s sigil, and a little book of hymns in a careful village hand. “For Edith, who is sleeping.” When you turn, Oswin is standing in the doorway.',
      },
      empty: { speaker: 'narrator', text: 'The strongbox stands open and empty.' },
    },
  },
  {
    id: 'dialogue:wat-general', name: 'Wat: The Guttered Candle',
    entries: [
      { when: { all: [{ questStage: Q, stage: 'investigate' }, { not: { flag: 'npc.wat-fennick.gave_key' } }] }, node: 'oswin' },
      { node: 'hello' },
    ],
    nodes: {
      hello: {
        speaker: 'npc:wat-fennick', mood: 'happy',
        text: 'Welcome to the Guttered Candle! The fire’s lit. It hasn’t gone out in thirty years and it won’t tonight, Wick or no Wick.',
        choices: [
          { text: 'Any news?', to: 'news' },
          { text: 'Just passing.', to: null, tag: 'leave' },
        ],
      },
      news: {
        speaker: 'npc:wat-fennick',
        text: 'News? The east road’s barred, the north road’s blocked, and the south road’s crawling with witchfinders. Nobody comes in and nobody goes out except Pell the tinker, and he’d sell candles to a corpse.',
      },
      oswin: {
        speaker: 'npc:wat-fennick',
        text: 'Oswin? (He lowers his voice.) Since Edith drowned he’s been strange. Buys black candles off Pell. Goes down to the mere at midnight and sings, they say.',
        next: 'key',
      },
      key: {
        speaker: 'npc:wat-fennick',
        effects: [{ giveItem: 'item:mill-key' }, { setFlag: 'npc.wat-fennick.gave_key', value: true }],
        text: 'And he owes me for a winter’s ale. Left me his spare mill-key as surety. Maybe you ought to hold on to it. For safekeeping, like.',
      },
    },
  },
  {
    id: 'dialogue:pell-general', name: 'Pell: Wares',
    entries: [{ node: 'n' }],
    nodes: {
      n: {
        speaker: 'npc:pell-tinker', mood: 'happy',
        text: 'Pots, pins, needles, candles! Black candles too, if you like. Very popular in Greywater this year, ha!',
        choices: [
          { text: 'Who buys black candles around here?', to: 'who' },
          { text: 'Not today.', to: null, tag: 'leave' },
        ],
      },
      who: { speaker: 'npc:pell-tinker', text: 'Only the miller. Pays in flour. Pays well, too. Grief’s good for trade, friend, Seven forgive me.' },
    },
  },
  {
    id: 'dialogue:oswin-confront', name: 'Oswin: Confession',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:oswin', mood: 'sad',
        text: '…You found it. Of course you did. You found the Stag, and the boy’s trail, and you’ll find the abbey, and then she’ll be gone.',
        choices: [
          { text: 'Who will be gone?', to: 'edith' },
          { text: 'You’re Drowned Choir.', to: 'edith' },
        ],
      },
      edith: {
        speaker: 'npc:oswin', mood: 'sad',
        text: 'Edith. My wife. She walked into the mere the night the star fell, smiling. The Choir told me she’s not dead. She’s sleeping, Below, where nothing hurts. And whatever’s burning down there, if you take it, the water goes cold and she’s gone for good.',
        next: 'wick',
      },
      wick: {
        speaker: 'npc:oswin', mood: 'afraid',
        text: 'So I wrote to the Wick. Told them there was a witch in Brindlecross. I thought they’d take you away before you… I’m sorry. I’m so sorry.',
        next: 'judge',
      },
      judge: {
        speaker: 'npc:oswin', text: '(He waits, flour on his hands, for you to decide.)',
        choices: [
          { text: '"Edith isn’t sleeping, Oswin. She drowned. Let her go."', to: 'reach', once: true, tag: 'persuade', check: { stat: 'will', dc: 15, failTo: 'reach-fail' } },
          { text: 'Inquisitor Hale should hear this.', to: 'expose', when: { not: { flag: 'prologue.hale_outcome', op: '==', value: 'defied' } } },
          { text: 'Leave Brindlecross, Oswin. Tonight. Never come back.', to: 'spare' },
          { text: 'You sold me to the Inquisition. [Kill him]', to: 'kill', tag: 'aggressive' },
        ],
      },
      'reach-fail': { speaker: 'npc:oswin', mood: 'angry', text: 'No. No, you don’t know that. You can’t know that.', next: 'judge' },
      reach: { speaker: 'npc:oswin', mood: 'sad', text: '(A long silence.) …I know. I’ve always known. Seven forgive me.', next: 'repent' },
      repent: {
        speaker: 'npc:oswin',
        effects: [{ setFlag: 'prologue.oswin_fate', value: 'exposed' }, { setFlag: 'npc.oswin.repentant', value: true }, { reputation: 'faction:lanternate', delta: 5 }],
        text: 'I’ll go to the Inquisitor myself and tell him what I did. It’s the least I owe you.',
      },
      expose: {
        speaker: 'narrator',
        effects: [{ setFlag: 'prologue.oswin_fate', value: 'exposed' }, { reputation: 'faction:lanternate', delta: 10 }],
        text: 'Hale’s soldiers take Oswin from the mill. He doesn’t struggle. At the door he looks back once, toward the mere.',
      },
      spare: {
        speaker: 'npc:oswin', effects: [{ setFlag: 'prologue.oswin_fate', value: 'spared' }],
        text: '…Thank you. I’ll go east, to Greywater. There are people there who understand.',
      },
      kill: {
        speaker: 'narrator', effects: [{ setFlag: 'prologue.oswin_fate', value: 'slain' }],
        text: 'He reaches for the knife on his bench. You are faster. Oswin the Miller dies on his own floor, with flour on his hands.',
      },
    },
  },
  {
    id: 'dialogue:obj-giants-sluice-wheel', name: "Object: the Giant's Sluice",
    entries: [
      { when: { flag: 'prologue.sluice_turned' }, node: 'done' },
      { when: { all: [{ questStage: Q, stage: 'sluice' }, { hasItem: 'item:sluice-key' }] }, node: 'turn' },
      { node: 'locked' },
    ],
    nodes: {
      locked: {
        speaker: 'narrator', effects: [{ unlockLore: 'lore:the-orrin' }],
        text: 'A stone wheel twice the height of a man, carved with a giant’s sigil. An iron collar locks it in place, with a keyhole as big as your thumb.',
      },
      turn: {
        speaker: 'narrator',
        effects: [{ setFlag: 'prologue.sluice_turned', value: true }, { unlockLore: 'lore:the-orrin' }],
        text: 'The iron key turns in the collar. Then the wheel turns too, slowly and groaning, and far below there is a sound like a giant drawing breath. Wennamere begins to drain.',
      },
      done: { speaker: 'narrator', text: 'The great wheel stands still. Where Wennamere was there is only black mud, and the abbey.' },
    },
  },
];

export default dialogues;
