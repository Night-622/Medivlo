/**
 * Hollow Crown, Mountainreach: scenes both Fist campaigns share (the Stair Gate seal, the Stone Abbot on his seat after
 * the Ooze Sovereign's release, and the general talk of the Fist diaspora in Concordia). Class-specific entries
 * first; the gate is one place, reached from Stonecloister and from the Lowfold side. Owner: Claude 4.
 */
import type { DialogueDef } from '@/core';

const KELL = 'narrator' as const;

const dialogues: DialogueDef[] = [
  {
    id: 'dialogue:obj-fist-gate-seal', name: 'I-10 opening the Stair Gate', scope: 'party',
    entries: [
      { when: { all: [{ questStage: 'quest:monk-the-stair-gate', stage: 'gate' }, { questCompleted: 'quest:monk-the-kings-rice' }] }, node: 'bodhan' },
      { when: { questStage: 'quest:monk-the-stair-gate', stage: 'gate' }, node: 'mk' },
      { when: { questStage: 'quest:brawler-the-stair-gate', stage: 'gate' }, node: 'bw' },
      { node: 'seal' },
    ],
    nodes: {
      bodhan: { speaker: 'npc:bodhan-kreel', text: '(Old Bodhan Kreel has come down the gate road behind you, and stands at the King’s shoulder with the King’s pack, as he did on another road thirty years ago.) I remember you. The one who chose. Go on. Ask him. He’ll answer you.', next: 'mk' },
      mk: {
        speaker: KELL, text: 'The black crown of icicles in the Mountain King’s beard is melting, drip by drip, onto the last stair. He sits down on the step, very slowly, like an old man after a long climb, and looks at you. Was I owed it, he asks.',
        choices: [
          { text: 'No. Nobody was owed it. It was only ever going to be given.', to: 'given', effects: [{ setFlag: 'monk.kell_answer', value: 'given' }] },
          { text: 'Yes. You were owed it, and you were robbed.', to: 'owed', effects: [{ setFlag: 'monk.kell_answer', value: 'owed' }] },
          { text: 'You turned back. You weren’t robbed, Master Kell. You were frightened. That’s allowed.', to: 'turned', when: { insight: 'kell_turned_back' }, effects: [{ setFlag: 'monk.kell_answer', value: 'turned' }] },
        ],
      },
      given: { speaker: KELL, text: 'He is quiet for a long time. Given, he says. Then I could still have been given it. I could still be given something. He looks down the road behind you, towards Stonecloister, as if somebody might be coming up it.', next: 'mk-open' },
      owed: { speaker: KELL, mood: 'sad', text: 'He nods, heavily. Thank you, he says, and it is the saddest thing you have ever heard anyone say. Thirty years, and that is the answer I wanted. It does not help at all.', next: 'mk-open' },
      turned: { speaker: KELL, mood: 'sad', text: 'He puts his face in his huge hands. When he takes them away he is weeping, and it is only water. I heard the gates, he says. I was so frightened. Shirin knew. She never said. Thirty moves, and she never once said it.', next: 'mk-open' },
      'mk-open': { speaker: 'narrator', text: 'He moves aside on the step to let you pass. The Stair Gate is a great arch of rough orange stone, carved with all twelve schools’ marks and weeping black down every one. You hold up the Summit half. It is very still in your hand. The gate answers it.', next: 'through' },
      bw: { speaker: 'narrator', text: 'The black gloves on the Mountain King’s fists have cracked right off and lie in pieces on the landing. He sits down on the step, breathing hard, and looks at you, and looks past you at a small old man by a noodle cart. And then he laughs. Big and helpless and real, for the first time in thirty years.', next: 'bw2' },
      bw2: { speaker: 'npc:tobiah-knuckle', text: '(From the crowd.) Still can’t stay down, can you, Doran? Never could. Neither can my fighter. Let them through, you great lump. Then come and have some noodles.', next: 'bw-open' },
      'bw-open': { speaker: 'narrator', text: 'Knuckletown cheers. The Stair Gate is a great arch of rough orange stone, carved with all twelve schools’ marks and weeping black down every one. You hold up the Pit half, in your fist. The gate answers it.', next: 'through' },
      through: { speaker: 'narrator', text: 'Slowly, for the first time in thirty years, the Stair Gate opens. Beyond it is a road going down, and the smell of green grass, and somewhere far ahead, a bell. Behind you, in all the noise, somebody you know slips through the gap at your back.', next: null },
      seal: { speaker: 'narrator', text: 'The Stair Gate stands open. Concordia lies below.', next: null },
    },
  },
  {
    id: 'dialogue:obj-fist-abbot-seat', name: 'C-3 the Stone Abbot on his seat', scope: 'party',
    entries: [
      { when: { questStage: 'quest:monk-the-ooze-sovereign', stage: 'seat' }, node: 'mk' },
      { when: { questStage: 'quest:brawler-the-ooze-sovereign', stage: 'seat' }, node: 'bw' },
      { node: 'plain' },
    ],
    nodes: {
      mk: {
        speaker: 'narrator', effects: [{ setFlag: 'story.sentinel.fist', value: true }], text: 'The Stone Abbot sits cross-legged on the bog-stone, dripping, very calm. I have been very patient, he says. He looks at you for a long time. You sit like Shirin, he says. She sat badly too, at first.',
        choices: [
          { text: 'You know the Abbess?', to: 'shirin' },
          { text: '(Sit with him a moment, then stand.)', to: 'stand', school: 'fist' },
        ],
      },
      shirin: { speaker: 'narrator', text: 'I walked ahead of her once, on the road, in C. 1012, he says. Ahead of Doran too. I kept the road still for them. Then they turned round, and I did not know what to keep still any more, so I sat down. Your brother walked past this bog a while ago, going towards the thunder.', next: null },
      stand: { speaker: 'narrator', text: 'You sit. You stand. He stands with you, creakily, and laughs at his own knees. Your brother walked past this bog a while ago, he says, going towards the thunder. He was counting something.', next: null },
      bw: {
        speaker: 'narrator', effects: [{ setFlag: 'story.sentinel.fist', value: true }], text: 'The Stone Abbot sits cross-legged on the bog-stone, dripping, very calm. He takes one look at your gloves, and his eyes light up like a novice’s. How do those go on, he asks. Show me.',
        choices: [
          { text: '(Lace a pair of gloves onto the Stone Abbot.)', to: 'gloves' },
          { text: 'Monks don’t wear gloves, Father.', to: 'monks' },
        ],
      },
      gloves: { speaker: 'narrator', text: 'You lace them on. He holds up his gloved fists and regards them with enormous delight, then throws one very slow, very correct punch at the air. In nine hundred years, he says, nobody ever offered. The man in the silk scarf went that way, towards the kilns.', next: null },
      monks: { speaker: 'narrator', text: 'Nobody ever offered, he says, sadly, so I never asked. You sigh and lace a pair onto him anyway. He is thrilled. The man in the silk scarf went that way, he says, pointing a glove towards the kilns.', next: null },
      plain: { speaker: 'narrator', text: 'A flat bog-stone where the Stone Abbot sat, with the Fist mark pressed into it like a footprint.', next: null },
    },
  },
  // ---------- the Fist diaspora in Concordia (general talk)
  // ---------- lair codexes (side-room "Old writing", Claude 2's instanceGen): obj:<lair>-codex
  {
    id: 'dialogue:obj-fist-capital-lair-1-codex', name: 'The Guardian Hall: the plinth', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'Cut into the Guardian’s plinth, at the height of a kneeling pilgrim’s eyes: “I let up the mountain only those who can stand still before me. Not the strong. Not the clever. The still.” Somebody has scratched beneath it, recently and shakily: “It won’t let anyone up.”', effects: [{ unlockLore: 'lore:hc-fist-guardian-hall' }], next: null } },
  },
  {
    id: 'dialogue:obj-fist-capital-lair-2-codex', name: 'The Silent Cell: the cell-roll', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'The Silent Cell’s roll, hanging on a nail: six hundred years of meditations, each with a topic and a length. “Patience, nine days.” “Bread, two hours.” The last entry has no length: “What was owed, C. 1012.” Under it, thirty years of notes in nine different hands. All of them his.', effects: [{ unlockLore: 'lore:hc-fist-silent-cell' }], next: null } },
  },
  {
    id: 'dialogue:obj-fist-capital-lair-3-codex', name: 'The Summit Shrine: the oldest teaching', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'Cut over the summit niche, worn almost smooth by the wind: “THERE IS NOTHING AT THE TOP THAT YOU DID NOT CARRY UP.” Below it, in grey chalk, in a hand you know very well: “Then I will carry it down again. K.”', effects: [{ unlockLore: 'lore:hc-fist-summit-shrine' }], next: null } },
  },
  {
    id: 'dialogue:obj-fist-frontier-lair-1-codex', name: 'The Broken Fist Dojo: the thrown bout-sheet', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A bout-sheet in a cracked frame on the dojo wall: the Lowfold final of C. 1022. The result has been crossed out by a left hand, badly, and written again beneath it: “Lost. Paid. Sorry.” The glass over it is clean. Somebody polishes it every day.', effects: [{ unlockLore: 'lore:hc-fist-broken-fist-dojo' }], next: null } },
  },
  {
    id: 'dialogue:obj-fist-frontier-lair-2-codex', name: 'The Grand Pit: the roll of champions', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'The roll of champions, painted on the Grand Pit wall in a hundred years of different paints. Against C. 1009 there are two names, the only year with two: “D. KELL. And T. KNUCKLE, who put him down first.” The second name has been repainted many times. Never the first.', effects: [{ unlockLore: 'lore:hc-fist-grand-pit' }], next: null } },
  },
  {
    id: 'dialogue:obj-fist-frontier-lair-3-codex', name: 'The Quarry Throne: the price-list', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A price-list on a board beside the Quarry Throne, in Silas’s neat hand: “Standing in the dry ring: one hour, one silver. Sitting: two. The night: ask.” At the very bottom, crossed out so hard the board is scored: “Corner: not for sale.”', effects: [{ unlockLore: 'lore:hc-fist-quarry-throne' }], next: null } },
  },
  {
    id: 'dialogue:fist-faraj', name: 'Brother Faraj Stillwater (general)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:faraj-stillwater', text: 'Welcome. Mind the step; it is half in the bog. We sweep it anyway. Somebody may yet come up it.', next: null } },
  },
  {
    id: 'dialogue:fist-moll', name: 'Moll Treadwell (general)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:moll-treadwell', text: 'Saturdays, under the Kettle. Gloves on, grudges off. Nan Briar comes to watch. She bets on the small ones.', next: null } },
  },
];

export default dialogues;
