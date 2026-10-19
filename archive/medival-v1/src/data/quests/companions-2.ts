/**
 * Companion personal quests, part 2 (docs/lore/13-companions.md §1): Cadoc, Grimma, Sable.
 * Dialogue in src/data/dialogue/companions-2.ts (Cadoc, Grimma) and companions-2b.ts (Sable). Owner: Claude 4.
 */
import type { QuestDef } from '@/core';

const L = (id: `landmark:${string}`) => ({ landmark: id });
const CH = 'Companions';

const verse = { flag: 'companion.cadoc-ap-ynys.verse' };
const ring = { flag: 'companion.grimma-ironsong.ring' };
const ringIs = (v: string) => ({ flag: 'companion.grimma-ironsong.ring', op: '==' as const, value: v });
const ringIron = { flag: 'npc.grimma-ironsong.ring_iron' };
const fate = { flag: 'companion.sable.fate' };
const fateIs = (v: string) => ({ flag: 'companion.sable.fate', op: '==' as const, value: v });

const quests: QuestDef[] = [
  // ----- Cadoc
  {
    id: 'quest:the-unsung-verse', name: 'The Unsung Verse', type: 'companion', act: 'act2', chapter: CH, region: 'region:ylwen-deepwood', giver: 'npc:cadoc-ap-ynys',
    summary: 'The Lullaby has a last verse. Nobody living has heard it, because it went down with Ys Aerwen. Cadoc ap Ynys has begun to hear bells in his sleep.',
    requires: {
      all: [
        { flag: 'act1.complete' }, { flag: 'act1.ylwen_pact' },
        { flag: 'companion.cadoc-ap-ynys.loyalty', op: '>=', value: 40 },
        { not: { flag: 'companion.cadoc-ap-ynys.left' } },
      ],
    },
    autoStart: true,
    firstStage: 'word',
    stages: [
      {
        id: 'word', journal: 'Cadoc has been quiet for three days, which for Cadoc is a kind of shouting. Ask him what is wrong.',
        objectives: [{ id: 'cadoc', text: 'Speak with Cadoc', talk: 'npc:cadoc-ap-ynys' }],
        onComplete: [{ companion: 'npc:cadoc-ap-ynys', following: true }, { unlockLore: 'lore:sundering-of-ys' }],
        next: 'shore',
      },
      {
        id: 'shore', journal: '“The last verse is still down there,” Cadoc said. “Somebody has to go and fetch it, and I have been told all my life that I am the one who fetches things.” Ys Aerwen lies under its own lake, deep in the Ylwen Deepwood. The Aelthi swore on its drowned never to sing to the water again.',
        objectives: [
          { id: 'reach', text: 'Go to the shore of Ys Aerwen', reach: 'landmark:ys-aerwen-shore', marker: L('landmark:ys-aerwen-shore') },
          { id: 'rhiannon', text: 'Tell the Archdruid where you are going', talk: 'npc:rhiannon-ys-caer', optional: true, marker: L('landmark:grove-of-antlers') },
          { id: 'dive', text: 'Go down the drowned stair', marker: L('landmark:ys-aerwen-shore'), when: verse },
        ],
        next: [{ when: { flag: 'companion.cadoc-ap-ynys.verse', op: '==', value: 'sung' }, to: 'sung' }, { to: 'left' }],
      },
      {
        id: 'sung', journal: 'You learned the last verse of the Lullaby from a voice at the bottom of a lake, and Cadoc sang it, and the bells of Ys Aerwen stopped ringing. He has not said a dry word since. You did not know how much you would miss them.',
        objectives: [],
        onEnter: [{ loyalty: 'npc:cadoc-ap-ynys', delta: 15 }, { unlockLore: 'lore:the-lullaby', section: 'last-verse' }],
        end: { status: 'completed', outcome: 'sung' },
      },
      {
        id: 'left', journal: 'You left the last verse where it lay, under the lake, with the bells. Cadoc did not argue. On the walk back he hummed the tune as far as it goes, and stopped where it stops, every time.',
        objectives: [],
        onEnter: [{ reputation: 'faction:thornwise', delta: 10 }],
        end: { status: 'completed', outcome: 'left' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:cadoc-ap-ynys'] },
  },
  // ----- Grimma
  {
    id: 'quest:iron-remembers', name: 'Iron Remembers', type: 'companion', act: 'act2', chapter: CH, region: 'region:ironspine-foothills', giver: 'npc:grimma-ironsong',
    summary: 'When Clan Ironsong cast Grimma out, her clan-mother cut her oath-ring through with a cold chisel. Grimma has worn the halves on a cord ever since. She has decided it is time to do something about it.',
    requires: {
      all: [
        { flag: 'act1.complete' }, { flag: 'act1.nails_exposed' },
        { flag: 'companion.grimma-ironsong.loyalty', op: '>=', value: 40 },
        { not: { flag: 'companion.grimma-ironsong.left' } },
      ],
    },
    autoStart: true,
    firstStage: 'ring',
    stages: [
      {
        id: 'ring', journal: 'Grimma has taken a cord from round her neck and laid it on the table between you without a word. On it are two halves of an iron ring.',
        objectives: [{ id: 'grimma', text: 'Speak with Grimma', talk: 'npc:grimma-ironsong' }],
        onComplete: [{ unlockLore: 'lore:the-orrun', section: 'unwritten' }],
        next: [{ when: ringIron, to: 'hearing' }, { to: 'iron' }],
      },
      {
        id: 'iron', journal: 'A ring cut by a clan-mother is welded with true-iron or not at all, and true-iron cannot be bought. Grimma knows where there is some: in the breast of the Kneeling Father, the Orrin who rusted on his knees in the foothills, whom Clan Ironsong calls its first ancestor. “We don’t take from him,” she said. “We ask.”',
        objectives: [
          { id: 'reach', text: 'Find the Kneeling Father', reach: 'landmark:kneeling-father', optional: true, marker: L('landmark:kneeling-father') },
          { id: 'wraiths', text: 'Drive off the rust-wraiths', kill: 'enemy:rust-wraith', count: 2, optional: true, marker: L('landmark:kneeling-father') },
          { id: 'iron', text: 'Get true-iron for the ring', marker: L('landmark:kneeling-father'), when: ringIron },
        ],
        onComplete: [{ unlockLore: 'lore:true-iron' }],
        next: 'hearing',
      },
      {
        id: 'hearing', journal: 'Grimma has sent word up the mountain to her clan-mother, Ulka Ironsong, that an exile asks a hearing at her forge. An exile may not enter the hold, so the hold must come to her. If it comes.',
        objectives: [
          { id: 'reach', text: 'Return to Grimma’s forge', reach: 'landmark:grimmas-forge', marker: L('landmark:grimmas-forge') },
          { id: 'ulka', text: 'Stand at the hearing before the clan-mother', marker: L('landmark:grimmas-forge'), when: ring },
        ],
        next: [{ when: ringIs('old'), to: 'old' }, { when: ringIs('new'), to: 'new' }, { to: 'none' }],
      },
      {
        id: 'old', journal: 'Ulka Ironsong struck the first blow, and Grimma the rest, and the ring came out of the fire as it was made at her naming: the old iron, the old words. Grimma wears it on her hand again. She keeps looking at it when she thinks you are not watching.',
        objectives: [],
        onEnter: [{ loyalty: 'npc:grimma-ironsong', delta: 10 }, { reputation: 'faction:iron-concord', delta: 10 }],
        end: { status: 'completed', outcome: 'old' },
      },
      {
        id: 'new', journal: 'The ring was forged new, with clan iron and true-iron and the fire out of your marked hand, and a new oath was sung into it. Ulka Ironsong said it was not an Ironsong ring. Then she struck it anyway.',
        objectives: [],
        onEnter: [{ loyalty: 'npc:grimma-ironsong', delta: 15 }, { reputation: 'faction:iron-concord', delta: 5 }, { reputation: 'faction:emberwardens', delta: 5 }],
        end: { status: 'completed', outcome: 'new' },
      },
      {
        id: 'none', journal: 'Grimma dropped the two halves of her ring into her own forge and watched them go soft. Clan Ironsong may keep its ledger. She says she is keeping her own now, and that you are in it.',
        objectives: [],
        onEnter: [{ loyalty: 'npc:grimma-ironsong', delta: 5 }, { reputation: 'faction:iron-concord', delta: -10 }],
        end: { status: 'completed', outcome: 'none' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:grimma-ironsong'] },
  },
  // ----- Sable
  {
    id: 'quest:the-quiet-hollowing', name: 'The Quiet Hollowing', type: 'companion', act: 'act2', chapter: CH, region: 'region:greywater-marsh', giver: 'npc:sable',
    summary: 'Sable has stopped bothering to wipe her eyes. Her hands are cold all the time now, and she has started humming a tune she says she does not know.',
    requires: {
      all: [
        { flag: 'act1.complete' },
        { flag: 'companion.sable.loyalty', op: '>=', value: 40 },
        { flag: 'ashmark.rank', op: '>=', value: 3 },
        { not: { flag: 'companion.sable.left' } },
      ],
    },
    autoStart: true,
    firstStage: 'signs',
    stages: [
      {
        id: 'signs', journal: 'Sable’s tears have stopped being a thing she hides. They run black down her face and she lets them. Talk to her.',
        objectives: [{ id: 'sable', text: 'Speak with Sable', talk: 'npc:sable' }],
        onComplete: [{ unlockLore: 'lore:the-hollowed' }, { unlockLore: 'lore:the-quiet-hand', section: 'sable' }],
        next: 'trail',
      },
      {
        id: 'trail', journal: 'Sable was gone in the morning. She left her good knives, wrapped in oilcloth, and a note: “Gone to see about some water. Don’t follow, love. I mean it. (Underlined.) Cobb owes me a penny. S.” A fisher on the causeway saw a red-haired girl walking barefoot into Greywater, singing.',
        onEnter: [{ companion: 'npc:sable', following: false }],
        objectives: [{ id: 'reach', text: 'Follow Sable to the reeds of Greywater', reach: 'landmark:tobins-reeds', marker: L('landmark:tobins-reeds') }],
        next: 'water',
      },
      {
        id: 'water', journal: 'She is here, among the reeds, sitting on the bank with her feet in black water that does not freeze.',
        objectives: [{ id: 'sable', text: 'Find Sable at the water', marker: L('landmark:tobins-reeds'), when: fate }],
        next: [
          { when: fateIs('saved'), to: 'saved' },
          { when: fateIs('gone'), to: 'gone' },
          { when: { flag: 'act1.ylwen_pact' }, to: 'ylwen' },
          { to: 'briar' },
        ],
      },
      {
        id: 'saved', journal: 'You burned the Mire out of Sable at the water’s edge, and it hurt her more than anything has ever hurt her, and she came back. Her eyes are grey. You had not known they were grey.',
        objectives: [],
        onEnter: [{ loyalty: 'npc:sable', delta: 20 }],
        end: { status: 'completed', outcome: 'saved' },
      },
      {
        id: 'gone', journal: 'Sable chose the water while she was still herself enough to choose. Her boots are on the bank, side by side, toes together, the way a tidy guest leaves them at the door.',
        objectives: [],
        end: { status: 'completed', outcome: 'gone' },
      },
      {
        id: 'ylwen', journal: 'Sable is bound in cord and thorn, and the singing in her is quieter for it, but it has not stopped. The Thornwise sing the Mire to sleep. If anyone in Morvane can hold her, it is the Archdruid in the Grove of Antlers.',
        objectives: [{ id: 'rhiannon', text: 'Bring Sable to Rhiannon Ys-Caer', talk: 'npc:rhiannon-ys-caer', marker: L('landmark:grove-of-antlers') }],
        onComplete: [{ companion: 'npc:sable', following: false }, { reputation: 'faction:thornwise', delta: 5 }],
        end: { status: 'completed', outcome: 'bound' },
      },
      {
        id: 'briar', journal: 'Sable is bound in cord and thorn, and the singing in her is quieter for it, but it has not stopped. Nan Briar of the Gloamwood is Thornwise, and pities the Old Sleeper, and has never once turned anyone from her door.',
        objectives: [{ id: 'nan', text: 'Bring Sable to Nan Briar', talk: 'npc:nan-briar', marker: L('landmark:briar-hut') }],
        onComplete: [{ companion: 'npc:sable', following: false }, { reputation: 'faction:thornwise', delta: 5 }],
        end: { status: 'completed', outcome: 'bound' },
      },
    ],
    reward: { xpTier: 2 },
  },
];

// Release gate (Claude 1 flips content.companions once the companion places are built in-world)
for (const q of quests) q.requires = { all: [{ flag: 'content.companions' }, ...(q.requires ? [q.requires] : [])] };

export default quests;
