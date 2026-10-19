/**
 * Companion personal quests, part 1 (docs/lore/13-companions.md §1): Maren, Anselm, Hesta.
 * quest:the-hunters-oath, quest:a-lantern-for-the-road, quest:the-snuffed-candles. Owner: Claude 4.
 * Dialogue in src/data/dialogue/companions-1.ts (Maren, Anselm) and companions-1b.ts (Hesta).
 */
import type { QuestDef } from '@/core';

const L = (id: `landmark:${string}`) => ({ landmark: id });
const f = (flag: string) => ({ flag });
const eq = (flag: string, value: string) => ({ flag, op: '==' as const, value });
/** loyalty >= 40; an unset loyalty counts as the engine’s default of 50 (some players never shift Anselm’s or Hesta’s) */
const loyal = (slug: string) => ({
  any: [
    { flag: `companion.${slug}.loyalty`, op: '>=' as const, value: 40 },
    { not: { flag: `companion.${slug}.loyalty`, op: '>=' as const, value: 0 } },
  ],
});
const notLeft = (slug: string) => ({ not: { flag: `companion.${slug}.left` } });

const QM = 'quest:the-hunters-oath', QA = 'quest:a-lantern-for-the-road', QH = 'quest:the-snuffed-candles';
const OATH = 'companion.maren-hollis.oath', PATH = 'companion.anselm-pryde.path', ARCHIVE = 'act2.warden_archive';

const quests: QuestDef[] = [
  // ------------------------------------------------------------------ Maren
  {
    id: QM, name: 'The Hunter’s Oath', type: 'companion', act: 'act1', chapter: 'Companions', region: 'region:greywater-marsh', giver: 'npc:maren-hollis',
    summary: 'The reed-priest who sang Tobin Hollis down to the water has been seen at Fenwick. His name is Brother Sallow. Maren has not said what she means to do when she finds him. She has not needed to.',
    requires: { all: [f('act1.complete'), loyal('maren-hollis'), notLeft('maren-hollis')] },
    autoStart: true,
    firstStage: 'word',
    stages: [
      {
        id: 'word', journal: 'Maren has heard something in a tavern, and she has gone very quiet. Hear her out.',
        onEnter: [{ openDialogue: 'dialogue:oath-word' }],
        objectives: [{ id: 'maren', text: 'Hear what Maren has learned', when: f('companion.maren-hollis.sallow_word') }],
        onComplete: [{ companion: 'npc:maren-hollis', following: true }],
        next: 'fenwick',
      },
      {
        id: 'fenwick', journal: 'Brother Sallow of the Drowned Choir, the man who stood on the shore of Wennamere and sang Tobin into the dark, has been seen among the eel-fishers of Fenwick. Agna Fenn will know where he has gone to ground.',
        objectives: [
          { id: 'reach', text: 'Go to Fenwick with Maren', reach: 'landmark:fenwick-stilts', marker: L('landmark:fenwick-stilts') },
          { id: 'agna', text: 'Ask Agna Fenn about Brother Sallow', when: f('companion.maren-hollis.sallow_found'), marker: L('landmark:fenwick-stilts') },
        ],
        onComplete: [{ unlockLore: 'lore:fenwick', section: 'tithe' }],
        next: 'track',
      },
      {
        id: 'track', journal: 'Agna says Sallow hides somewhere under the stilts, and that Fenwick feeds him because it is afraid not to. Maren has her bow strung. Let her read the signs.',
        objectives: [
          { id: 'candle', text: 'Search the stilt-posts', interact: 'obj:sallow-trail-1', marker: L('landmark:fenwick-stilts') },
          { id: 'pipe', text: 'Search the eel-traps', interact: 'obj:sallow-trail-2', marker: L('landmark:fenwick-stilts') },
          { id: 'punt', text: 'Search the old smokehouse landing', interact: 'obj:sallow-trail-3', marker: L('landmark:fenwick-stilts') },
        ],
        next: 'sallow',
      },
      {
        id: 'sallow', journal: 'Under the old smokehouse, where the water is black and still, someone is singing very softly. Maren has stopped breathing to listen.',
        onEnter: [{ unlockLore: 'lore:the-drowned-choir' }],
        objectives: [{ id: 'sallow', text: 'Face Brother Sallow', when: f(OATH), marker: L('landmark:fenwick-stilts') }],
        next: [
          { when: eq(OATH, 'blood'), to: 'blood' },
          { when: eq(OATH, 'justice'), to: 'justice' },
          { to: 'hers' },
        ],
      },
      {
        id: 'blood', journal: 'Brother Sallow will sing to no one again. Maren has not unstrung her bow, and she has not looked at the water since.',
        objectives: [{ id: 'maren', text: 'Speak with Maren', talk: 'npc:maren-hollis' }],
        end: { status: 'completed', outcome: 'blood' },
      },
      {
        id: 'justice', journal: 'Brother Sallow sits bound in Agna Fenn’s eel-house, waiting on the judgement of the mothers of Fenwick. Maren watched them take him, and said nothing at all.',
        objectives: [{ id: 'maren', text: 'Speak with Maren', talk: 'npc:maren-hollis' }],
        end: { status: 'completed', outcome: 'justice' },
      },
      {
        id: 'hers', journal: 'You gave the choice to Maren, because it was hers. She made it. Whatever she feels about it, she is feeling it now, alone on the landing.',
        objectives: [{ id: 'maren', text: 'Speak with Maren', talk: 'npc:maren-hollis' }],
        end: { status: 'completed', outcome: 'hers' },
      },
    ],
    reward: { xpTier: 2, rep: [{ faction: 'faction:drowned-choir', delta: -5 }], lore: ['lore:the-drowned-choir'] },
  },

  // ------------------------------------------------------------------ Anselm
  {
    id: QA, name: 'A Lantern for the Road', type: 'companion', act: 'act1', chapter: 'Companions', region: 'region:aldermoor', giver: 'npc:anselm-pryde',
    summary: 'Saint Wenna’s Abbey lies drained and silent in the mud of Wennamere, its sisters unburied and its lamp unlit. Brother Anselm wants to go back and reconsecrate it. He has not said what he hopes to find there. Perhaps he does not know.',
    // runs from Act I's end, or in Act II once Anselm is out of Valcastre
    requires: {
      all: [
        loyal('anselm-pryde'), notLeft('anselm-pryde'),
        { any: [{ all: [f('act1.complete'), { not: f('prologue.anselm_betrayed') }] }, f('act2.anselm_freed')] },
      ],
    },
    autoStart: true,
    firstStage: 'ask',
    stages: [
      {
        id: 'ask', journal: 'Brother Anselm has something to ask of you, and he has been working up to it for days.',
        onEnter: [{ openDialogue: 'dialogue:lantern-ask' }],
        objectives: [{ id: 'anselm', text: 'Hear Brother Anselm out', when: f('companion.anselm-pryde.lantern_asked') }],
        onComplete: [{ companion: 'npc:anselm-pryde', following: true }],
        next: 'abbey',
      },
      {
        id: 'abbey', journal: 'Anselm means to reconsecrate the Abbey of Saint Wenna, where the Ember was found. Take him back to Wennamere, and down into the drained nave.',
        objectives: [{ id: 'nave', text: 'Bring Anselm to the nave of Saint Wenna’s', reach: 'landmark:abbey-nave', marker: L('landmark:abbey-nave') }],
        onComplete: [{ unlockLore: 'lore:saint-wenna' }],
        next: 'rites',
      },
      {
        id: 'rites', journal: 'A house of the Lantern is hallowed with three old things: clean water, the names of its dead, and a light by the door. Anselm cannot do the first or the last without you.',
        objectives: [
          { id: 'font', text: 'Cleanse the font', interact: 'obj:abbey-rite-font', marker: L('landmark:abbey-nave') },
          { id: 'roll', text: 'Read the sisters’ names', interact: 'obj:abbey-rite-roll', marker: L('landmark:abbey-nave') },
          { id: 'lamp', text: 'Light Saint Wenna’s lamp', interact: 'obj:abbey-rite-lamp', marker: L('landmark:abbey-nave') },
        ],
        next: 'vigil',
      },
      {
        id: 'vigil', journal: 'The rites are done. Now Anselm must keep vigil at the altar until dawn, as the old books say, and you have said you will keep it with him.',
        objectives: [{ id: 'vigil', text: 'Keep vigil at the altar with Anselm', when: f(PATH), marker: L('landmark:abbey-nave') }],
        onComplete: [{ unlockLore: 'lore:ithren-the-lantern', section: 'hearth' }],
        next: 'dawn',
      },
      {
        id: 'dawn', journal: 'Saint Wenna asked Brother Anselm what he believes, and he answered her. The lamp by the door is still burning. Speak with him before you leave.',
        objectives: [{ id: 'anselm', text: 'Speak with Anselm at dawn', talk: 'npc:anselm-pryde', marker: L('landmark:abbey-nave') }],
        next: [
          { when: eq(PATH, 'reform'), to: 'reform' },
          { when: eq(PATH, 'inquisitor'), to: 'inquisitor' },
          { to: 'heretic' },
        ],
      },
      {
        id: 'reform', journal: 'Anselm believes the Church can be mended, the way a net is mended: knot by knot, by people who mean to go on fishing.',
        objectives: [], end: { status: 'completed', outcome: 'reform' },
      },
      {
        id: 'inquisitor', journal: 'Anselm believes the Church must be remade, and that someone with clean hands must hold the knife. He has not yet said the word Wick aloud. He will.',
        objectives: [], end: { status: 'completed', outcome: 'inquisitor' },
      },
      {
        id: 'heretic', journal: 'Anselm believes in the Lantern still. He no longer believes it needs a cathedral, or a Hierophant, or him in a cassock, to burn.',
        objectives: [], end: { status: 'completed', outcome: 'heretic' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:saint-wenna', 'lore:ithren-the-lantern'] },
  },

  // ------------------------------------------------------------------ Hesta
  {
    id: QH, name: 'The Snuffed Candles', type: 'companion', act: 'act2', chapter: 'Companions', region: 'region:lantern-coast', giver: 'npc:hesta-corrow',
    summary: 'In 1041 the Wick carried the Emberwardens’ archive down from Cinderhold in chests sealed with the Hierophant’s wax, and never burned them. Hesta Corrow believes they are under the Cathedral of the Brand. She wants them back. So, she suspects, does Castor Vellane.',
    requires: {
      all: [
        f('act1.complete'), f('content.act2'), f('act1.hesta_alive'), loyal('hesta-corrow'), notLeft('hesta-corrow'),
        { questCompleted: 'quest:the-summons' },
      ],
    },
    autoStart: true,
    firstStage: 'word',
    stages: [
      {
        id: 'word', journal: 'Word from Hesta. It is short, and rude, and underlined twice.',
        onEnter: [{ openDialogue: 'dialogue:candles-word' }],
        objectives: [{ id: 'word', text: 'Read Hesta’s letter', when: f('companion.hesta-corrow.candles_word') }],
        next: 'pilgrim',
      },
      {
        id: 'pilgrim', journal: 'Hesta has come south to Solenne dressed as a pilgrim, which she will hate. Find her among the faithful outside the walls.',
        objectives: [{ id: 'hesta', text: 'Find Hesta at the pilgrims’ camp', talk: 'npc:hesta-corrow', marker: L('landmark:pilgrim-camp') }],
        onComplete: [{ companion: 'npc:hesta-corrow', following: true }],
        next: 'cathedral',
      },
      {
        id: 'cathedral', journal: 'The Wardens’ chests lie somewhere beneath the Cathedral of the Brand, behind the Hierophant’s own seal. Take Hesta into the cathedral, and keep her coughing to a minimum.',
        objectives: [{ id: 'reach', text: 'Enter the Cathedral of the Brand with Hesta', reach: 'landmark:cathedral-of-the-brand', marker: L('landmark:cathedral-of-the-brand') }],
        onComplete: [{ unlockLore: 'lore:cathedral-of-the-brand', section: 'undercroft' }],
        next: 'door',
      },
      {
        id: 'door', journal: 'The undercroft door is sealed with red wax and the Lantern’s stamp. There are three ways through a sealed door: a key, a knife, or a lie. Hesta would like it noted that there is also a fourth.',
        objectives: [
          { id: 'door', text: 'Open the undercroft door', when: f('act2.undercroft_open'), marker: L('landmark:cathedral-of-the-brand') },
          { id: 'key', text: 'Ask the Hierophant for his key', talk: 'npc:hierophant-aurelian', optional: true, marker: L('landmark:hierophant-court') },
        ],
        next: 'archive',
      },
      {
        id: 'archive', journal: 'The Wardens’ chests are here, under a century and a half of dust. Above you the Compline bell is ringing, and the Hierophant is at his prayers. Read fast.',
        objectives: [
          { id: 'ledgers', text: 'Open the first chest', interact: 'obj:warden-archive-chest-1', marker: L('landmark:cathedral-of-the-brand') },
          { id: 'edict', text: 'Open the second chest', interact: 'obj:warden-archive-chest-2', marker: L('landmark:cathedral-of-the-brand') },
          { id: 'slips', text: 'Open the third chest', interact: 'obj:warden-archive-chest-3', marker: L('landmark:cathedral-of-the-brand') },
        ],
        onComplete: [{ unlockLore: 'lore:the-emberwardens', section: 'purge-truth' }, { unlockLore: 'lore:purge-of-the-emberwardens' }],
        next: 'choice',
      },
      {
        id: 'choice', journal: 'Boots on the stair. The Lord-Inquisitor is coming down to see who has been in his archive. Decide what becomes of the Wardens’ chests, now.',
        onEnter: [{ openDialogue: 'dialogue:candles-choice' }],
        objectives: [{ id: 'choose', text: 'Decide the fate of the Wardens’ archive', when: f(ARCHIVE), marker: L('landmark:cathedral-of-the-brand') }],
        next: [{ when: eq(ARCHIVE, 'published'), to: 'presses' }, { to: 'away' }],
      },
      {
        id: 'presses', journal: 'The chests are going up the stair, not out of the city. Bring them to the Hierophant, and hold him to his courage.',
        onEnter: [{ openDialogue: 'dialogue:candles-vellane' }],
        objectives: [{ id: 'aurelian', text: 'Bring the archive to the Hierophant', talk: 'npc:hierophant-aurelian', marker: L('landmark:hierophant-court') }],
        next: 'hearth',
      },
      {
        id: 'away', journal: 'Vellane has seen your face, and Hesta’s. Get out of Solenne before he decides what to do about either.',
        onEnter: [{ openDialogue: 'dialogue:candles-vellane' }],
        objectives: [{ id: 'gate', text: 'Leave Solenne', reach: 'landmark:solenne-gate', marker: L('landmark:solenne-gate') }],
        next: 'hearth',
      },
      {
        id: 'hearth', journal: 'It is done, one way or another. Hesta has been very quiet since the undercroft. Ask her how she is. She will lie, but ask.',
        objectives: [{ id: 'hesta', text: 'Speak with Hesta', talk: 'npc:hesta-corrow' }],
        next: [
          { when: eq(ARCHIVE, 'cinderhold'), to: 'to-cinderhold' },
          { when: eq(ARCHIVE, 'published'), to: 'to-presses' },
          { to: 'to-fire' },
        ],
      },
      {
        id: 'to-cinderhold', journal: 'The Wardens’ archive is going home to Cinderhold on a pilgrim’s cart, under a blanket and a great many turnips.',
        objectives: [],
        onComplete: [{ reputation: 'faction:emberwardens', delta: 15 }, { reputation: 'faction:order-of-the-wick', delta: -10 }],
        end: { status: 'completed', outcome: 'cinderhold' },
      },
      {
        id: 'to-presses', journal: 'The Hierophant has given the Wardens’ figures to the printers of Solenne. By spring every parish in Morvane will know what the Church knew in 1041, and what it did about it.',
        objectives: [],
        onComplete: [
          { reputation: 'faction:emberwardens', delta: 10 }, { reputation: 'faction:order-of-the-wick', delta: -20 },
          { unlockLore: 'lore:the-hierophancy', section: 'split' },
        ],
        end: { status: 'completed', outcome: 'published' },
      },
      {
        id: 'to-fire', journal: 'The Wardens’ archive is ash in the undercroft of Solenne. Neither the Wick nor anyone else will ever read it now.',
        objectives: [],
        onComplete: [{ reputation: 'faction:order-of-the-wick', delta: -5 }],
        end: { status: 'completed', outcome: 'burned' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:purge-of-the-emberwardens', 'lore:cathedral-of-the-brand'] },
  },
];

// Release gate (Claude 1 flips content.companions once the companion places are built in-world)
for (const q of quests) q.requires = { all: [{ flag: 'content.companions' }, ...(q.requires ? [q.requires] : [])] };

export default quests;
