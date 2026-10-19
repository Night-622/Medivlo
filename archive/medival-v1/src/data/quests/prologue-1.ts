/** Prologue quests 1–2 (docs/lore/07-prologue.md). Owner: Claude 4. */
import type { QuestDef } from '@/core';

const L = (id: `landmark:${string}`) => ({ landmark: id });

const quests: QuestDef[] = [
  {
    id: 'quest:the-ashmark', name: 'The Ashmark', type: 'main', act: 'prologue', region: 'region:aldermoor',
    summary: 'A year to the night since the stars fell. Brindlecross gathers on the green to remember, and the scar on your hand will not stop burning.',
    autoStart: true, firstStage: 'wake',
    stages: [
      {
        id: 'wake', journal: 'Someone is hammering on the door. It is Lanternmass, the Remembrance.',
        onEnter: [{ unlockLore: 'lore:lanternmass' }, { unlockLore: 'lore:night-of-falling-ash' }],
        objectives: [{ id: 'maren', text: 'Answer the door to Maren', talk: 'npc:maren-hollis', marker: L('landmark:hollis-cottage') }],
        next: 'chapel',
      },
      {
        id: 'chapel', journal: 'Brother Anselm wants help with the remembrance pyre. He will be at the chapel.',
        objectives: [{ id: 'anselm', text: 'Speak with Brother Anselm', talk: 'npc:anselm-pryde', marker: L('landmark:brindlecross-chapel') }],
        next: 'tinder',
      },
      {
        id: 'tinder', journal: 'The pyre needs dry tinder, and there is some in the village woodshed.',
        objectives: [{ id: 'tinder', text: 'Fetch dry tinder from the woodshed', interact: 'obj:woodshed-tinder', marker: L('landmark:brindlecross-woodshed') }],
        onComplete: [{ giveItem: 'item:pyre-tinder' }],
        next: 'pyre',
      },
      {
        id: 'pyre', journal: 'Bring the tinder to the remembrance pyre on the green.',
        objectives: [{ id: 'pyre', text: 'Light the remembrance pyre', interact: 'obj:remembrance-pyre', marker: L('landmark:brindlecross-green') }],
        onComplete: [
          { setFlag: 'prologue.pyre_lit', value: true },
          { setFlag: 'ashmark.rank', value: 1 },
          { unlockLore: 'lore:the-ashmark', section: 'kindle' },
          { unlockLore: 'lore:the-ashmark', section: 'purge' },
          { openDialogue: 'dialogue:pyre-ignites' },
        ],
        next: 'attack',
      },
      {
        id: 'attack', journal: 'Hollowed are coming out of the snow, drawn by the fire.',
        objectives: [{ id: 'thralls', text: 'Drive off the Hollowed', kill: 'enemy:hollowed-thrall', count: 4, marker: L('landmark:brindlecross-green') }],
        next: 'aftermath',
      },
      {
        id: 'aftermath', journal: 'The green is quiet. The village is staring at you. Elder Godric wants a word.',
        objectives: [{ id: 'godric', text: 'Speak with Elder Godric', talk: 'npc:godric-thatch', marker: L('landmark:brindlecross-green') }],
        onComplete: [{ startQuest: 'quest:lost-in-the-gloamwood' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    id: 'quest:lost-in-the-gloamwood', name: 'Lost in the Gloamwood', type: 'main', act: 'prologue', region: 'region:aldermoor', giver: 'npc:godric-thatch',
    summary: 'Tobin Hollis is missing, and his bed is soaked with black water. Maren is going after him into the Gloamwood, with or without you.',
    firstStage: 'enter',
    stages: [
      {
        id: 'enter', journal: 'Maren has her bow and is already at the forest edge. Tobin went into the Gloamwood.',
        onEnter: [{ companion: 'npc:maren-hollis', following: true }],
        objectives: [{ id: 'path', text: 'Follow Maren into the Gloamwood', reach: 'landmark:gloamwood-path', marker: L('landmark:gloamwood-path') }],
        next: 'camp',
      },
      {
        id: 'camp', journal: "Tobin's trail leads deeper into the wood.",
        objectives: [
          { id: 'camp', text: "Find Tobin's camp", reach: 'landmark:tobins-camp', marker: L('landmark:tobins-camp') },
          { id: 'lantern', text: 'Search the camp', interact: 'obj:tobins-lantern', marker: L('landmark:tobins-camp') },
        ],
        next: 'wolves',
      },
      {
        id: 'wolves', journal: 'Wet black footprints lead toward the wolf hollow, and something has the wolves riled.',
        objectives: [{ id: 'wolves', text: 'Deal with the wolves', kill: 'enemy:gloamwood-wolf', count: 3, marker: L('landmark:wolf-hollow') }],
        next: 'briar',
      },
      {
        id: 'briar', journal: 'There is woodsmoke beyond the hollow. Someone lives out here.',
        objectives: [{ id: 'briar', text: 'Find whoever lives in the woods', talk: 'npc:nan-briar', marker: L('landmark:briar-hut') }],
        next: 'stag',
      },
      {
        id: 'stag', journal: '"The White Stag has gone Hollow," Nan Briar said. "Bring it low, then burn the dark out of it, if you’ve the heart."',
        objectives: [{
          id: 'stag', text: 'Face the White Stag at the Weeping Stones', marker: L('landmark:weeping-stones'),
          when: { flag: 'prologue.stag_fate' },
        }],
        next: [{ when: { flag: 'prologue.stag_fate', op: '==', value: 'cleansed' }, to: 'stag-cleansed' }, { to: 'stag-slain' }],
      },
      {
        id: 'stag-cleansed', journal: 'The White Stag is free of the Mire. It left something behind on the stones.', objectives: [],
        onEnter: [
          { setFlag: 'prologue.stag_fate', value: 'cleansed' },
          { giveItem: 'item:stag-tears' },
          { reputation: 'faction:thornwise', delta: 10 },
          { unlockLore: 'lore:the-white-stag', section: 'cleansed' },
          { loyalty: 'npc:maren-hollis', delta: 5 },
        ],
        next: 'return',
      },
      {
        id: 'stag-slain', journal: 'The White Stag is dead. The Weeping Stones have stopped weeping.', objectives: [],
        onEnter: [
          { setFlag: 'prologue.stag_fate', value: 'slain' },
          { giveItem: 'item:white-stag-antler' },
          { reputation: 'faction:thornwise', delta: -10 },
          { unlockLore: 'lore:the-white-stag', section: 'slain' },
        ],
        next: 'return',
      },
      {
        id: 'return', journal: 'Return to Nan Briar. She will know where the trail leads.',
        onEnter: [{ unlockLore: 'lore:the-weeping-stones' }, { unlockLore: 'lore:the-aelthi' }],
        objectives: [{ id: 'briar2', text: 'Return to Nan Briar', talk: 'npc:nan-briar', marker: L('landmark:briar-hut') }],
        onComplete: [{ startQuest: 'quest:the-witchfinder' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, tome: 'spell:frostbite' },
  },
];

export default quests;
