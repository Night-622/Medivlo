/**
 * Hollow Crown: the Sentinels' release scenes (04-concordia.md "Story rule"). Beating a Sentinel unhollows it in
 * its last moments; the scene sets story.sentinel.<school> (Morwen sets Radiance and Song, 08 R5). Shared by every
 * campaign that fights that Sentinel (Sentinel A/B or a Sentinel hunt), with class-tagged lines. Owner: Claude 4.
 */
import type { DialogueDef } from '@/core';

const dialogues: DialogueDef[] = [
  {
    id: 'dialogue:sentinel-release-ash', name: 'Sentinel release: Ashmaw', scope: 'party',
    entries: [{ node: 'fall' }],
    nodes: {
      fall: { speaker: 'narrator', text: 'Ashmaw sinks down among its kilns. The black runs out of its breath like smoke clearing, and for a moment its fire burns the old gold colour of a Turning torch.', next: 'speak' },
      speak: {
        speaker: 'narrator', mood: 'sad', text: 'It speaks, in a voice like a kiln door opening: I lit them. Every torch on the Turning Road, a thousand years. Will there be torches again?',
        choices: [
          { text: 'Yes. I promise.', to: 'mark' },
          { text: '[Ash] Light one now. (Hold out your hand.)', to: 'torch', school: 'ash', insight: 'ashmaw_torch' },
          { text: 'I don’t know.', to: 'mark' },
        ],
      },
      torch: { speaker: 'narrator', text: 'It breathes once into your hand, and a small gold flame sits there, untroubled by anything. Then the Kiln-Beast closes its eyes.', next: 'mark' },
      mark: { speaker: 'narrator', text: 'Where it lay, the ash has settled into the Ash school’s mark. It glows faintly on your skin when you touch it: the Sentinel’s mark.', effects: [{ setFlag: 'story.sentinel.ash', value: true }], next: null },
    },
  },
  {
    id: 'dialogue:sentinel-release-iron', name: 'Sentinel release: the Gilded Engine', scope: 'party',
    entries: [{ node: 'fall' }],
    nodes: {
      fall: { speaker: 'narrator', text: 'The Gilded Engine shudders and slows. One by one its hammers stop. The gold drains off it like water, and under it is plain dark iron, very old, very tired.', next: 'speak' },
      speak: {
        speaker: 'narrator', mood: 'sad', text: 'From deep inside, a sound like a bell struck under a blanket: I made the settings. To hold the song. To hold the grief as well, so no one Concordant had to. Nobody asked me what they held after.',
        choices: [
          { text: 'They held too much.', to: 'mark', insight: 'settings_held_grief' },
          { text: '[Iron] (Lay a hand on its cold anvil.) You can rest.', to: 'rest', school: 'iron' },
          { text: 'It’s over.', to: 'mark' },
        ],
      },
      rest: { speaker: 'narrator', text: 'The anvil is warm for a moment under your palm, as if something on the other side pressed back. Then it is cold, and still.', next: 'mark' },
      mark: { speaker: 'narrator', text: 'On the Engine’s last plate, the Iron school’s mark, freshly struck: the Sentinel’s mark, for whoever carries Iron’s stone.', effects: [{ setFlag: 'story.sentinel.iron', value: true }], next: null },
    },
  },
  {
    id: 'dialogue:sentinel-release-blade', name: 'Sentinel release: Bonelord Varric', scope: 'party',
    entries: [{ node: 'fall' }],
    nodes: {
      fall: { speaker: 'narrator', text: 'Bonelord Varric goes down on one knee and lays his sword across it. Around the barrow his dead muster stops, mid-step, and one by one they lie down where they stand.', next: 'speak' },
      speak: {
        speaker: 'narrator', mood: 'sad', text: 'His voice is dry as old leaves: I ended a war with one duel. One. Then they made me escort a crown, and the crown stopped coming. So I kept fighting. Nobody told me it was over.',
        choices: [
          { text: 'It’s over, Varric. You can yield.', to: 'yield' },
          { text: '[Blade] (Salute him, and sheathe your weapon.)', to: 'salute', school: 'blade', insight: 'varric_yielded' },
          { text: 'Rest.', to: 'mark' },
        ],
      },
      yield: { speaker: 'narrator', text: '(He laughs, a small dusty sound.) Yield. I had forgotten the word. Thank you.', next: 'mark' },
      salute: { speaker: 'narrator', text: 'He returns the salute, slowly, perfectly, the way the first duellist must have saluted at the end of the Schools’ War. Then he puts his sword away.', next: 'mark' },
      mark: { speaker: 'narrator', text: 'Where he knelt, the Blade school’s mark is cut clean into the barrow floor: the Sentinel’s mark.', effects: [{ setFlag: 'story.sentinel.blade', value: true }], next: null },
    },
  },
  {
    id: 'dialogue:sentinel-release-rime', name: 'Sentinel release: the Rimeheart Colossus', scope: 'party',
    entries: [{ node: 'fall' }],
    nodes: {
      fall: { speaker: 'narrator', text: 'The Rimeheart Colossus settles onto the pass like a glacier lying down. The black ice in its chest cracks and clears, and inside, very small, a blue fire is still burning.', next: 'speak' },
      speak: {
        speaker: 'narrator', mood: 'sad', text: 'Its voice is snow sliding off a roof: I held the pass for the crown. Every twelve years it came up the road, and I held the pass open. Then it stopped coming, so I held it shut. I did not know what else to hold.',
        choices: [
          { text: 'You can let go now.', to: 'mark' },
          { text: '[Rime] (Lay your hand on the ice.) Keep it. I’ll hold it for you a while.', to: 'keep', school: 'rime', insight: 'colossus_kept' },
          { text: 'The road will be open again.', to: 'mark' },
        ],
      },
      keep: { speaker: 'narrator', text: 'For a moment the cold runs into your hand and you are holding the whole pass, every stone of it, very still. Then it is only a mountain again.', next: 'mark' },
      mark: { speaker: 'narrator', text: 'In the ice where its heart was, the Rime school’s mark, frozen clear: the Sentinel’s mark.', effects: [{ setFlag: 'story.sentinel.rime', value: true }], next: null },
    },
  },
  {
    id: 'dialogue:sentinel-release-storm', name: 'Sentinel release: the Stormcrow', scope: 'party',
    entries: [{ node: 'fall' }],
    nodes: {
      fall: { speaker: 'narrator', text: 'The Stormcrow tumbles out of its storm onto the cliff-top and lies with its great wings spread. The thunder goes quiet all at once, and you can hear the sea.', next: 'speak' },
      speak: {
        speaker: 'narrator', mood: 'sad', text: 'Its voice is a long roll of far-off thunder: I carried the news. Every Turning, to every realm, before the Bell had stopped ringing. Then there was no news, and I screamed it anyway, so they would not forget there should be.',
        choices: [
          { text: 'They didn’t forget.', to: 'mark' },
          { text: '[Storm] Then carry one more: the Turning is coming.', to: 'news', school: 'storm', insight: 'stormcrow_news' },
          { text: 'Rest your wings.', to: 'mark' },
        ],
      },
      news: { speaker: 'narrator', text: 'The Stormcrow lifts its head, and a single flash of lightning runs out from the cliff in every direction at once, towards all twelve realms. Then it lays its head down.', next: 'mark' },
      mark: { speaker: 'narrator', text: 'The lightning has scorched the Storm school’s mark into the cliff-top: the Sentinel’s mark.', effects: [{ setFlag: 'story.sentinel.storm', value: true }], next: null },
    },
  },
  {
    id: 'dialogue:sentinel-release-morwen', name: 'Sentinel release: Abbess Morwen', scope: 'party',
    entries: [{ node: 'fall' }],
    nodes: {
      fall: { speaker: 'narrator', text: 'Abbess Morwen sinks down in the drowned nave, her hands still closed on the bell-rope that is not there. Around her the drowned choir falls silent, one voice at a time.', next: 'speak' },
      speak: {
        speaker: 'narrator', mood: 'sad', text: 'Her voice comes through the water like a bell under a cloth: It rang by itself. It would not stop. A Turning with no crown is a lie, and I would not let it tell the lie, not once, not for thirty years. Was I wrong?',
        choices: [
          { text: 'No. You kept faith.', to: 'mark' },
          { text: '[Radiance] (Kneel, and say the hour-prayer with her.)', to: 'pray', school: 'radiance', insight: 'morwen_prayed' },
          { text: '[Song] (Hum the choir’s part, the one they stopped singing.)', to: 'sing', school: 'song', insight: 'morwen_sung' },
        ],
      },
      pray: { speaker: 'narrator', text: 'She says it with you, word for word, and at the amen her hands open at last.', next: 'mark' },
      sing: { speaker: 'narrator', text: 'One by one the drowned choir picks up the line. For one verse the whole nave sings again. When it ends, the Abbess is smiling.', next: 'mark' },
      mark: { speaker: 'narrator', text: 'On the altar step, two marks side by side, Radiance and Song, the Abbess and her choir: the Sentinels’ marks.', effects: [{ setFlag: 'story.sentinel.radiance', value: true }, { setFlag: 'story.sentinel.song', value: true }], next: null },
    },
  },
  {
    id: 'dialogue:sentinel-release-umbral', name: 'Sentinel release: the Spinner Below', scope: 'party',
    entries: [{ node: 'fall' }],
    nodes: {
      fall: { speaker: 'narrator', text: 'The Spinner Below folds its legs under it in the dark beneath the Gloamwood. All round you its web hangs in tatters, and in every broken strand there is a little light: a memory, coming loose.', next: 'speak' },
      speak: {
        speaker: 'narrator', mood: 'sad', text: 'Its voice is a whisper from every direction: I wove the Concord’s records into the dark, every Turning, every name. When the tears came I unwove it, thread by thread, because it was too sad to keep.',
        choices: [
          { text: 'Some of it should be kept.', to: 'mark' },
          { text: '[Umbral] (Catch one loose thread and hold it.)', to: 'thread', school: 'umbral', insight: 'spinner_thread' },
          { text: 'Rest.', to: 'mark' },
        ],
      },
      thread: { speaker: 'narrator', text: 'The thread is a memory: a young man in the Citadel, alone at a window, listening very hard to a crown that is not singing for him. It fades as you watch.', next: 'mark' },
      mark: { speaker: 'narrator', text: 'In the last of the web, the Umbral school’s mark, spun in shadow: the Sentinel’s mark.', effects: [{ setFlag: 'story.sentinel.umbral', value: true }], next: null },
    },
  },
  {
    id: 'dialogue:sentinel-release-verdant', name: 'Sentinel release: the Weeping Willow', scope: 'party',
    entries: [{ node: 'fall' }],
    nodes: {
      fall: { speaker: 'narrator', text: 'The Weeping Willow’s branches go still. The black runs out of its leaves into the ground, and the leaves underneath are the pale spring green of a tree just planted.', next: 'speak' },
      speak: {
        speaker: 'narrator', mood: 'sad', text: 'The wind in its leaves makes words: They planted me the day the Concord was sworn, a cutting from the Elder Tree, to shade the Turning Road. I wept for it so long the weeping grew into me.',
        choices: [
          { text: 'You can stop weeping now.', to: 'mark' },
          { text: '[Verdant] (Press a seed into the soil at its roots.)', to: 'seed', school: 'verdant', insight: 'willow_seed' },
          { text: 'The road will be shaded again.', to: 'mark' },
        ],
      },
      seed: { speaker: 'narrator', text: 'The seed splits and roots before your hand has left it. A green shoot, no black on it at all, leans towards the light.', next: 'mark' },
      mark: { speaker: 'narrator', text: 'Grown into its bark, the Verdant school’s mark: the Sentinel’s mark.', effects: [{ setFlag: 'story.sentinel.verdant', value: true }], next: null },
    },
  },
  {
    id: 'dialogue:sentinel-release-fist', name: 'Sentinel release: the Ooze Sovereign', scope: 'party',
    entries: [{ node: 'fall' }],
    nodes: {
      fall: { speaker: 'narrator', text: 'The Ooze Sovereign slumps and spreads across the bog-pool. As it thins, a shape rises out of it: an old man in a monk’s robe, sitting cross-legged, very calm, a little damp. The Stone Abbot.', next: 'speak' },
      speak: {
        speaker: 'narrator', mood: 'sad', text: 'The Abbot opens one eye: I was the Fist Sentinel. I walked ahead of the crown and kept the road still. The tears came, and the bog came, and I sat. I am very good at sitting. It was the wrong time to be good at it.',
        choices: [
          { text: 'Get up, Abbot. The road needs walking.', to: 'mark' },
          { text: '[Fist] (Sit down beside him for one breath, then stand.)', to: 'breath', school: 'fist', insight: 'abbot_stood' },
          { text: 'Rest.', to: 'mark' },
        ],
      },
      breath: { speaker: 'narrator', text: 'You breathe once together. When you stand, he stands too, slowly, for the first time in thirty years, and laughs at his own knees.', next: 'mark' },
      mark: { speaker: 'narrator', text: 'Where he sat, the Fist school’s mark is pressed into the bog-stone like a footprint: the Sentinel’s mark.', effects: [{ setFlag: 'story.sentinel.fist', value: true }], next: null },
    },
  },
  {
    id: 'dialogue:sentinel-release-hunt', name: 'Sentinel release: the White Stag', scope: 'party',
    entries: [{ node: 'fall' }],
    nodes: {
      fall: { speaker: 'narrator', text: 'The White Stag goes down on its knees in the deep glade. The black tears stop. Its eyes are brown, and clear, and very old.', next: 'speak' },
      speak: {
        speaker: 'narrator', mood: 'sad', text: 'It does not speak. It looks along the old procession road, the way it walked ahead of the crown every Turning for a thousand years, and then it looks at you, and you understand: it has been waiting for someone to follow.',
        choices: [
          { text: 'I’ll follow. Lead the way, when it’s time.', to: 'mark' },
          { text: '[Hunt] (Take only what it gives: one shed tine, from the moss.)', to: 'tine', school: 'hunt', insight: 'stag_tine' },
          { text: '(Stand aside and let it rest.)', to: 'mark' },
        ],
      },
      tine: { speaker: 'narrator', text: 'It lowers its head so you can reach. The tine comes away in your hand, warm, white, without a mark of black.', next: 'mark' },
      mark: { speaker: 'narrator', text: 'Where it knelt, its hooves have pressed the Hunt school’s mark into the moss: the Sentinel’s mark.', effects: [{ setFlag: 'story.sentinel.hunt', value: true }], next: null },
    },
  },
  {
    id: 'dialogue:sentinel-release-guile', name: 'Sentinel release: the Lantern Queen', scope: 'party',
    entries: [{ node: 'fall' }],
    nodes: {
      fall: { speaker: 'narrator', text: 'The Lantern Queen sinks to her knees in the black water. One by one her lanterns go out across the marsh, until only one is left, in her own hands.', next: 'speak' },
      speak: {
        speaker: 'narrator', mood: 'sad', text: 'Her voice is a match struck in the dark: I sold safe passage over the marsh to the crown, every Turning. Honest lights, honest prices. Then no one came, and an empty marsh pays nothing, so I sold the lights that lead into the water instead.',
        choices: [
          { text: 'Then sell an honest one again.', to: 'mark' },
          { text: '[Guile] What’s your last lantern worth?', to: 'bargain', school: 'guile', insight: 'queen_bargain' },
          { text: 'Rest.', to: 'mark' },
        ],
      },
      bargain: { speaker: 'narrator', text: 'She laughs, delighted. It is worth exactly one honest answer, she says, and gives it to you for nothing: the safe way across the marsh, which was always the straight one.', next: 'mark' },
      mark: { speaker: 'narrator', text: 'Her last lantern burns on the water, and in its light the Guile school’s mark floats on the surface: the Sentinel’s mark.', effects: [{ setFlag: 'story.sentinel.guile', value: true }], next: null },
    },
  },
];

export default dialogues;
