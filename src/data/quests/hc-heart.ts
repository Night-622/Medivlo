/**
 * Hollow Crown: the shared Act III, the Heart of Morvane (05-campaign-framework.md §Act III). Every campaign plays
 * III-1 … III-8 after the Eve of the Turning. III-4 (the nemesis remade) is each class's own quest: it must set
 * <class>.nemesis_fate, from which the engine derives story.nemesis_resolved. Owner: Claude 4.
 */
import type { NarrativeCondition, QuestDef } from '@/core';

const ACT3: NarrativeCondition = { flag: 'story.act', op: '>=', value: 3 };
const after = (q: `quest:${string}`, ...c: NarrativeCondition[]): NarrativeCondition => ({ all: [ACT3, { questCompleted: q }, ...c] });
const base = { act: 'act3' as const, campaign: 'shared', chapter: 'The Heart' };
const H = 'region:heart' as const;

const quests: QuestDef[] = [
  {
    ...base, id: 'quest:heart-wall', name: 'The Weeping Wall', type: 'main', region: H, giver: 'npc:sela',
    summary: 'The Bell has rung and the Weeping Wall has parted. Sela Moth says the old waystone at the Heart’s edge can take the bearers through before it closes again.',
    requires: ACT3, autoStart: true, firstStage: 'sela',
    stages: [
      { id: 'sela', journal: 'The bearers are making camp at the edge of the Heart. Sela is there with her compass, pointing in.', objectives: [{ id: 'sela', text: 'Find Sela at the Heart camp', talk: 'npc:sela', marker: { landmark: 'landmark:heart-camp' } }], next: 'fires' },
      { id: 'fires', journal: 'The Wall can wait for morning. The bearers have lit a ring of small fires at the camp, one for every school that came.', objectives: [{ id: 'fires', text: 'Spend the night at the bearers’ fires', interact: 'obj:heart-camp-fire', marker: { landmark: 'landmark:heart-camp' } }], next: 'through' },
      { id: 'through', journal: 'Sela woke the waystone. Beyond it the black tears hang in the air like a curtain somebody is holding open.', objectives: [{ id: 'in', text: 'Go through the Weeping Wall', reach: H, marker: { region: H } }], onComplete: [{ startQuest: 'quest:heart-legion' }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-heart'] },
  },
  {
    ...base, id: 'quest:heart-legion', name: 'The Legion Camp', type: 'main', region: H, giver: 'npc:maren',
    summary: 'Everyone who walked into the Heart in thirty years is still here, standing in ranks, weeping. The Hollow Legion.',
    requires: after('quest:heart-wall'), firstStage: 'camp',
    stages: [
      { id: 'camp', journal: 'The Legion camp lies across the road to the Citadel.', objectives: [{ id: 'camp', text: 'Reach the Legion camp', reach: 'landmark:legion-camp', marker: { landmark: 'landmark:legion-camp' } }], next: 'legion' },
      { id: 'legion', journal: 'The Legion turns towards your half-stone like flowers towards the sun.', objectives: [{ id: 'legion', text: 'Break through the Hollow Legion', kill: 'bx_concord_0', count: 6 }], next: 'cages' },
      { id: 'cages', journal: 'In the middle of the camp are cages of black iron, and people in them who are not quite hollow yet.', objectives: [{ id: 'cages', text: 'Open the Legion’s cages', interact: 'obj:legion-cages', marker: { landmark: 'landmark:legion-camp' } }], next: 'roll' },
      { id: 'roll', journal: 'Every army keeps a muster roll. So does this one.', objectives: [{ id: 'roll', text: 'Read the Legion’s muster roll', interact: 'obj:heart-legion-roll', marker: { landmark: 'landmark:legion-camp' } }], onComplete: [{ startQuest: 'quest:heart-stairs' }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-hollow-legion'] },
  },
  {
    ...base, id: 'quest:heart-stairs', name: 'The Twelve Stairs', type: 'main', region: H, giver: 'npc:ysolde',
    summary: 'The processional way to the Citadel: twelve stairs, one for each school, each hung with that school’s banner, rotted black.',
    requires: after('quest:heart-legion'), firstStage: 'foot',
    stages: [
      { id: 'foot', journal: 'At the foot of the Twelve Stairs stand twelve school stones in a row, and beside them the bearers you gathered, waiting to see who goes first.', objectives: [{ id: 'foot', text: 'Join the bearers at the foot of the stairs', interact: 'obj:heart-stairs-foot', marker: { landmark: 'landmark:twelve-stairs' } }], next: 'stair' },
      { id: 'stair', journal: 'Every bearer climbs their own school’s stair. Yours is waiting.', objectives: [{ id: 'own', text: 'Climb your school’s stair', when: { flag: 'story.own_stair' }, marker: { landmark: 'landmark:twelve-stairs' } }], next: 'top' },
      { id: 'top', journal: 'At the top the twelve stairs meet, and someone is waiting there for you.', objectives: [{ id: 'top', text: 'Reach the top of the Twelve Stairs', reach: 'landmark:twelve-stairs-top', marker: { landmark: 'landmark:twelve-stairs-top' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-twelve-stairs'] },
  },
  {
    ...base, id: 'quest:heart-citadel', name: 'The Citadel', type: 'main', region: H, giver: 'npc:godric',
    summary: 'The Concord Citadel. Somewhere inside is the throne room, and the crown, and the man who emptied it.',
    requires: after('quest:heart-stairs', { flag: 'story.nemesis_resolved' }), autoStart: true, firstStage: 'gates',
    stages: [
      { id: 'gates', journal: 'The Citadel doors stand open. They have been open for thirty years.', objectives: [{ id: 'in', text: 'Enter the Concord Citadel', reach: 'inst:concord-citadel', marker: { region: H } }], next: 'halls' },
      { id: 'halls', journal: 'The Citadel has been empty for thirty years, and nothing in it has been moved.', objectives: [{ id: 'halls', text: 'Walk the Citadel’s halls', interact: 'obj:heart-citadel-hall-*', count: 3 }], next: 'door' },
      { id: 'door', journal: 'The throne room door, where a young guard once stood.', objectives: [{ id: 'door', text: 'Open the throne room door', interact: 'obj:citadel-throne-door' }], onComplete: [{ startQuest: 'quest:heart-king' }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-concord-citadel'] },
  },
  {
    ...base, id: 'quest:heart-king', name: 'The Hollow King', type: 'main', region: H, giver: 'npc:casimir',
    summary: 'The empty crown hangs above the throne in a cage of its own tears. Under it sits the Hollow King, and between you and him stands the Black Concord.',
    requires: after('quest:heart-citadel'), firstStage: 'engine',
    stages: [
      { id: 'engine', journal: 'The Black Concord: the crown’s empty settings, forged into a war-engine and fed thirty years of tears.', objectives: [{ id: 'engine', text: 'Defeat the Black Concord', kill: 'bx_concord_5', count: 1 }], next: 'king' },
      { id: 'king', journal: 'The Hollow King rises from his throne.', objectives: [{ id: 'king', text: 'Face the Hollow King', kill: 'bx_hollowking', count: 1 }], next: 'casimir' },
      { id: 'casimir', journal: 'He has stopped fighting. He is sitting on the throne-room steps, weeping, and he is only a man.', objectives: [{ id: 'talk', text: 'Speak with the Hollow King', talk: 'npc:casimir' }], onComplete: [{ startQuest: 'quest:heart-choice' }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 3, skillPoints: 1, lore: ['lore:hc-black-concord'] },
  },
  {
    ...base, id: 'quest:heart-choice', name: 'The Choice', type: 'main', region: H, giver: 'npc:casimir',
    summary: 'The crown is within reach. What it becomes now is up to the bearers.',
    requires: after('quest:heart-king'), firstStage: 'crown',
    stages: [
      { id: 'crown', journal: 'Choose what the crown becomes.', objectives: [{ id: 'choose', text: 'Decide the crown’s fate', when: { flag: 'story.ending' } }], onComplete: [{ startQuest: 'quest:heart-after' }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 3 },
  },
  {
    ...base, id: 'quest:heart-after', name: 'After', type: 'main', region: 'vil:brind', giver: 'npc:wil',
    summary: 'It is over. What happened next is a song now, and Wil Crane is singing it.',
    requires: after('quest:heart-choice'), firstStage: 'after',
    stages: [
      {
        id: 'after', journal: 'What became of everyone.',
        onEnter: [{ openDialogue: 'dialogue:heart-epilogue' }, { openDialogue: 'dialogue:heart-epilogue-class' }, { openDialogue: 'dialogue:heart-ballad' }],
        objectives: [{ id: 'seen', text: 'Hear how it ends', when: { flag: 'story.epilogue_seen' } }],
        onComplete: [{ setFlag: 'story.complete', value: true }],
        end: { status: 'completed' },
      },
    ],
  },

  // ---------------- shared Act III side quests
  {
    ...base, id: 'quest:heart-marens-mother', name: 'Maren’s Mother', type: 'side', region: H, giver: 'npc:maren',
    summary: 'Maren’s mother, Ottilie Hollis, carried the Hunt stone into the Heart in C. 1012 and never came back. Maren asked you to look for a woman with her nose.',
    requires: after('quest:heart-wall', { flag: 'cc.maren_mother_asked' }), autoStart: true, firstStage: 'find',
    stages: [
      { id: 'find', journal: 'Somewhere in the Legion camp is a woman with Maren’s nose.', objectives: [{ id: 'ottilie', text: 'Find Ottilie Hollis in the Legion camp', talk: 'npc:ottilie-hollis', marker: { landmark: 'landmark:legion-camp' } }], next: 'maren' },
      { id: 'maren', journal: 'Ottilie is walking out of the camp with you, slowly, a step behind.', objectives: [{ id: 'maren', text: 'Bring Ottilie to Maren', talk: 'npc:maren', marker: { landmark: 'landmark:heart-camp' } }], next: 'pelt' },
      { id: 'pelt', journal: 'That night Maren lit a small fire at the camp’s edge, alone, with the wolf pelt still across her shoulders.', objectives: [{ id: 'pelt', text: 'Go to Maren at her fire', interact: 'obj:heart-maren-pelt', marker: { landmark: 'landmark:heart-camp' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...base, id: 'quest:heart-what-godric-saw', name: 'What Godric Saw', type: 'side', region: H, giver: 'npc:godric',
    summary: 'Elder Godric has come to the Heart with the bearers, though nobody asked him to. He stood at the throne-room door on the night of the Hollowing.',
    requires: after('quest:heart-wall', { flag: 'cc.godric_seed' }), autoStart: true, firstStage: 'talk',
    stages: [
      { id: 'talk', journal: 'Godric is sitting apart from the fires at the Heart camp, looking at the Citadel.', objectives: [{ id: 'godric', text: 'Sit with Godric', talk: 'npc:godric', marker: { landmark: 'landmark:heart-camp' } }], next: 'helmet' },
      { id: 'helmet', journal: 'Godric left his guard’s helmet on the hook by the throne-room door. The Legion keeps its trophies on spears in the camp.', objectives: [{ id: 'helmet', text: 'Find Godric’s helmet among the Legion’s trophies', interact: 'obj:heart-godric-helmet', marker: { landmark: 'landmark:legion-camp' } }], next: 'back' },
      { id: 'back', journal: 'A young man’s helmet, with a G scratched in the rim.', objectives: [{ id: 'godric', text: 'Bring Godric his helmet', talk: 'npc:godric', marker: { landmark: 'landmark:heart-camp' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-what-godric-saw'] },
  },
  {
    ...base, id: 'quest:heart-last-chronicle', name: 'The Last Chronicle', type: 'side', region: H, giver: 'npc:ysolde',
    summary: 'In the Legion camp Ysolde found the bell-ringer’s log of the Citadel chapel. She cannot read the last page. Pip says he can.',
    requires: after('quest:heart-legion'), autoStart: true, firstStage: 'log',
    stages: [
      { id: 'log', journal: 'The log lies in the ruined Citadel chapel at the edge of the camp.', objectives: [{ id: 'log', text: 'Find the bell-ringer’s log', interact: 'obj:heart-bell-log', marker: { landmark: 'landmark:legion-camp' } }], next: 'pip' },
      { id: 'pip', journal: 'The last page is written in no school’s hand. Pip wants a look.', objectives: [{ id: 'pip', text: 'Show the last page to Pip', talk: 'npc:pip', marker: { landmark: 'landmark:heart-camp' } }], next: 'ysolde' },
      { id: 'ysolde', journal: 'Pip read it. Ysolde should hear.', objectives: [{ id: 'ysolde', text: 'Tell Ysolde', talk: 'npc:ysolde', marker: { landmark: 'landmark:heart-camp' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-thirteenth-note'] },
  },
];

export default quests;
