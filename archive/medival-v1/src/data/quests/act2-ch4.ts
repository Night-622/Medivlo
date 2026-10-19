/** Act II, Chapter 4 "The Dark Cathedral" (docs/lore/11-act2-spec.md): the summons, Sister Ilse, the prisoner of Valcastre. Owner: Claude 4. */
import type { QuestDef } from '@/core';

const L = (id: `landmark:${string}`) => ({ landmark: id });
const f = (flag: string) => ({ flag });
const eq = (flag: string, value: string) => ({ flag, op: '==' as const, value });
const QS = 'quest:the-summons', QI = 'quest:sister-ilse', QP = 'quest:the-prisoner-of-valcastre';
const R = 'region:lantern-coast' as const;

const quests: QuestDef[] = [
  {
    id: QS, name: 'The Summons', type: 'main', act: 'act2', chapter: 'The Dark Cathedral', region: R, giver: 'npc:castor-vellane',
    summary: 'The Lord-Inquisitor Castor Vellane requires the presence of the Ashmarked at the Cathedral of the Brand, with all such Embers as the bearer may hold. Snow is falling on the vineyards of Solenne for the first time in living memory, and the Wick does not ask twice.',
    // content.act2 is switched on by Claude 1 once the Lantern Coast exists in-world (data-only until then)
    requires: { all: [f('act1.complete'), f('content.act2')] }, autoStart: true, firstStage: 'road',
    stages: [
      {
        id: 'road', journal: 'The Pilgrim’s Road runs south out of the Haldmarch to the Lantern Coast. The Order of the Wick keeps a tollgate on it, and every traveller shows a hand there.',
        objectives: [{ id: 'toll', text: 'Take the Pilgrim’s Road to the Wick’s tollgate', reach: 'landmark:wick-tollgate', marker: L('landmark:wick-tollgate') }],
        onComplete: [{ openDialogue: 'dialogue:ch4-tollgate' }],
        next: 'solenne',
      },
      {
        id: 'solenne', journal: 'The summons has carried you through the Wick’s gate. Beyond it the road climbs between vineyards toward the white walls of Solenne.',
        objectives: [{ id: 'gate', text: 'Go up to the gates of Solenne', reach: 'landmark:solenne-gate', marker: L('landmark:solenne-gate') }],
        onComplete: [{ openDialogue: 'dialogue:ch4-solenne-gate' }, { unlockLore: 'lore:solenne' }],
        next: 'brand',
      },
      {
        id: 'brand', journal: 'Solenne is a holy city in shock. Every road in it leads to the Cathedral of the Brand, and to the thing that no longer burns there.',
        objectives: [{ id: 'brand', text: 'Look upon the dead Brand in the cathedral', interact: 'obj:dead-brand', marker: L('landmark:cathedral-of-the-brand') }],
        next: 'hierophant',
      },
      {
        id: 'hierophant', journal: 'The Brand is a cracked black husk, and the Embers in you hummed to it like kin. The Hierophant has sent word that he will receive you in his court.',
        objectives: [{ id: 'aurelian', text: 'Attend the Hierophant in his court', talk: 'npc:hierophant-aurelian', marker: L('landmark:hierophant-court') }],
        next: 'vellane',
      },
      {
        id: 'vellane', journal: 'The Lord-Inquisitor has come into the Hierophant’s court, and he means to have an answer. He wants the Embers.',
        onEnter: [{ openDialogue: 'dialogue:vellane-summons' }],
        objectives: [{ id: 'stance', text: 'Answer the Lord-Inquisitor’s demand', when: f('act2.church_stance'), marker: L('landmark:hierophant-court') }],
        onComplete: [
          { unlockLore: 'lore:castor-vellane' },
          { startQuest: 'quest:sister-ilse' },
          { startQuest: 'quest:the-wolf-moot' },
          { startQuest: 'quest:the-ember-auction' },
          { startQuest: 'quest:the-glass-throne' },
        ],
        // startQuest ignores `requires`, so the Valcastre quest is started from a branch stage
        next: [{ when: f('prologue.anselm_betrayed'), to: 'prisoner' }, { to: 'done' }],
      },
      {
        id: 'prisoner', journal: 'The Wick’s ledger said that Brother Anselm was taken to Valcastre, and that he was to be kept alive. Valcastre is a day’s ride down the coast.',
        objectives: [],
        onEnter: [{ startQuest: QP }],
        end: { status: 'completed' },
      },
      {
        id: 'done', journal: 'You have answered the Lord-Inquisitor. Somewhere beyond the snow, four Embers are waiting, and every power in Morvane is reaching for them.',
        objectives: [],
        end: { status: 'completed' },
      },
    ],
    reward: {
      xpTier: 2,
      lore: ['lore:cathedral-of-the-brand', 'lore:the-hierophancy', 'lore:hierophant-aurelian'],
    },
  },
  {
    id: QI, name: 'Sister Ilse', type: 'main', act: 'act2', chapter: 'The Dark Cathedral', region: R, giver: 'npc:hierophant-aurelian',
    summary: 'On the Night of Falling Ash the Pale Saint walked into the Cathedral of the Brand through doors that should have been barred. Someone within opened them. Ysolde’s rooms have been kept as she left them, and somewhere among the cathedral’s keepers is a servant of the Drowned Choir.',
    firstStage: 'journal',
    stages: [
      {
        id: 'journal', journal: 'The Keeper’s quarters lie behind the cathedral, sealed since Ysolde left on pilgrimage. Her books are still there, the Hierophant says. He has not been able to bring himself to read them.',
        objectives: [{ id: 'journal', text: 'Search Ysolde’s rooms in the Keeper’s quarters', interact: 'obj:ysolde-journal', marker: L('landmark:keepers-quarters') }],
        next: 'clues',
      },
      {
        id: 'clues', journal: 'Three of the cathedral’s keepers had the keys to the Brand’s doors on Lanternmass night: Deacon Ottavia, Brother Caius and Sister Ilse. Each of them is hiding something.',
        objectives: [
          { id: 'ottavia', text: 'Search Deacon Ottavia’s writing-desk', interact: 'obj:suspect-ottavia-desk', marker: L('landmark:cathedral-of-the-brand') },
          { id: 'caius', text: 'Search Brother Caius’s cell', interact: 'obj:suspect-caius-cell', marker: L('landmark:cathedral-of-the-brand') },
          { id: 'ilse', text: 'Look into Sister Ilse’s reliquary', interact: 'obj:suspect-ilse-reliquary', marker: L('landmark:keepers-quarters') },
        ],
        next: 'accuse',
      },
      {
        id: 'accuse', journal: 'You know three secrets now, and only one of them opened the doors to the Pale Saint. The Lord-Inquisitor is waiting for a name.',
        objectives: [{ id: 'accuse', text: 'Name the traitor before the Lord-Inquisitor', when: f('act2.ilse_accused'), marker: L('landmark:hierophant-court') }],
        next: [
          { when: eq('act2.ilse_accused', 'ilse'), to: 'unmasked' },
          { when: eq('act2.ilse_accused', 'ottavia'), to: 'ottavia' },
          { to: 'caius' },
        ],
      },
      {
        id: 'unmasked', journal: 'Sister Ilse smiled, and sang in the Drowned Tongue, and walked down into the cathedral font. She did not come up again.',
        objectives: [],
        onEnter: [{ unlockLore: 'lore:the-drowned-choir' }],
        end: { status: 'completed', outcome: 'ilse' },
      },
      {
        id: 'ottavia', journal: 'Deacon Ottavia has been taken to Valcastre for her books. In the morning Sister Ilse’s bed was empty, and wet footprints led from it to the font.',
        objectives: [],
        end: { status: 'completed', outcome: 'ottavia' },
      },
      {
        id: 'caius', journal: 'Brother Caius has been taken to Valcastre, and the Ashen Creed will not forget whose word sent him. In the morning Sister Ilse’s bed was empty, and wet footprints led from it to the font.',
        objectives: [],
        end: { status: 'completed', outcome: 'caius' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:ysolde-the-pale-saint'] },
  },
  {
    id: QP, name: 'The Prisoner of Valcastre', type: 'companion', act: 'act2', chapter: 'The Dark Cathedral', region: R, giver: 'npc:anselm-pryde',
    summary: 'You told the Wick that Brother Anselm kept heretic books, and they took him south. The ledger said he was to be kept alive because he might be useful. He is in the cells of Valcastre, the Order’s fortress by the sea.',
    requires: f('prologue.anselm_betrayed'), firstStage: 'valcastre',
    stages: [
      {
        id: 'valcastre', journal: 'Valcastre stands on a rock over the sea, a day’s ride south of Solenne. The marked of half Morvane have gone in at its gate. Few have come out.',
        objectives: [{ id: 'reach', text: 'Ride to the fortress of Valcastre', reach: 'landmark:valcastre', marker: L('landmark:valcastre') }],
        onComplete: [{ openDialogue: 'dialogue:ch4-valcastre-arrival' }, { unlockLore: 'lore:valcastre' }],
        next: 'cells',
      },
      {
        id: 'cells', journal: 'Anselm is in the lowest cells, behind a door of black oak and Wick iron. There is more than one way to open a door.',
        objectives: [{ id: 'freed', text: 'Free Brother Anselm from his cell', when: f('act2.anselm_freed'), marker: L('landmark:valcastre-cells') }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:valcastre', 'lore:order-of-the-wick'] },
  },
];

export default quests;
