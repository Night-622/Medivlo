/** Regional side quests (docs/lore/15-side-content.md): Saltreach Isles (si), Sunscar (ss), Cinder Wastes (cw). Act II.
 *  Gated on content.side AND content.act2. Every decision flag is set on the choice (or the first node after it),
 *  and every deciding scene is an NPC route or an obj: dialogue, so it can always be reopened. Owner: Claude 4. */
import type { NarrativeCondition, QuestDef, QuestStageDef } from '@/core';

const L = (id: `landmark:${string}`) => ({ landmark: id });
const f = (flag: string) => ({ flag });
const is = (flag: string, value: string): NarrativeCondition => ({ flag, op: '==', value });
const GATE: NarrativeCondition = { all: [f('content.side'), f('content.act2')] };
const end = (id: string, journal: string): QuestStageDef => ({ id, journal, objectives: [], end: { status: 'completed', outcome: id.replace(/^end-/, '') } });

const QT = 'quest:side-si-drowned-tide-temple', QS = 'quest:side-si-smugglers-glyph';
const QD = 'quest:side-ss-debt-of-salt', QG = 'quest:side-ss-glass-garden';
const QK = 'quest:side-cw-drakeling', QF = 'quest:side-cw-defector';
const T = 'side.si.drowned-tide-temple', S = 'side.si.smugglers-glyph', D = 'side.ss.debt-of-salt';
const G = 'side.ss.glass-garden', K = 'side.cw.drakeling', F = 'side.cw.defector';

const quests: QuestDef[] = [
  // ================================================================ Saltreach Isles
  {
    id: QT, name: 'The Drowned Tide-Temple', type: 'side', act: 'act2', region: 'region:saltreach-isles', giver: 'npc:edith-wrack',
    summary: 'On the outermost rock of the Saltreach Isles stands Saela’s oldest house, half under the sea. On Lanternmass night its priests walked down the sea-stair into the water and did not come back. At low tide, the isle-folk say, someone is still ringing the tide-bell. Edith Wrack, the only priest who stayed ashore, wants to know who.',
    requires: GATE,
    firstStage: 'temple',
    stages: [
      {
        id: 'temple', journal: 'Edith Wrack’s boat knows the way to the Last Rock. Not everything that stands in the water there is still a priest of Saela.',
        objectives: [
          { id: 'reach', text: 'Take the boat to the drowned tide-temple', reach: 'landmark:drowned-tide-temple', marker: L('landmark:drowned-tide-temple') },
          { id: 'dead', text: 'Lay the drowned on the steps to rest', kill: 'enemy:drowned-dead', count: 3, marker: L('landmark:drowned-tide-temple') },
        ],
        next: 'bell',
      },
      {
        id: 'bell', journal: 'The tide-bell hangs from a whalebone frame on the temple’s seaward terrace. Edith said: if it rings, answer it. Three strokes and a long one is the call to the night office.',
        objectives: [{ id: 'bell', text: 'Ring the tide-bell', interact: 'obj:si-tide-bell', marker: L('landmark:drowned-tide-temple') }],
        next: 'ebb',
      },
      {
        id: 'ebb', journal: 'Something under the sea answered the bell, and lamps were lit down the drowned stair. The priests called the foot of it the Ebb-Door. Go down to it.',
        objectives: [{ id: 'door', text: 'Go down the sea-stair to the Ebb-Door', marker: L('landmark:drowned-tide-temple'), when: f(`${T}.choice`) }],
        next: 'edith',
      },
      {
        id: 'edith', journal: 'Whatever you decided on the drowned stair, Edith Wrack is waiting on Gull Rock to hear it.',
        objectives: [{ id: 'edith', text: 'Tell Edith Wrack what you found', talk: 'npc:edith-wrack', marker: L('landmark:gull-rock') }],
        next: [{ when: is(`${T}.choice`, 'released'), to: 'end-released' }, { when: is(`${T}.choice`, 'kept'), to: 'end-kept' }, { to: 'end-bell' }],
      },
      end('end-released', 'You burned the black water out of the drowned stair, and the priests of the Last Rock let go of Saela’s door and went down to rest. The sea froze over the third step behind them.'),
      end('end-kept', 'The priests of the Last Rock still stand on the drowned stair, holding Saela’s door open for the dead of the isles, a little more of the black water in them every month. Edith takes them bread.'),
      end('end-bell', 'The door was always the bell. Edith Wrack rings the ebb from the terrace every night now, too fast, and the priests have gone down to rest with their lamps still burning.'),
    ],
    reward: { xpTier: 2, gold: 150, rep: [{ faction: 'faction:salt-league', delta: 5 }], lore: ['lore:the-drowned-tide-temple'] },
  },
  {
    id: QS, name: 'The Smuggler’s Glyph', type: 'side', act: 'act2', region: 'region:saltreach-isles', giver: 'npc:oswin-tarr',
    summary: 'A body has washed into the Saltcutters’ Cave on the lee of Gull Rock: a girl with a courier’s satchel lashed to her wrist and a red thread round its strap. The satchel is full of spell-glyphs cut without a Wick-licence, and half of them are missing. Oswin Tarr, the League’s tally-man, would like to know whose cargo is lying on his rock, and who left it there.',
    requires: GATE,
    firstStage: 'cave',
    stages: [
      {
        id: 'cave', journal: 'The Saltcutters’ Cave is round the lee of Gull Rock. Mind the tide; it comes in faster than you would credit.',
        objectives: [
          { id: 'reach', text: 'Go to the Saltcutters’ Cave', reach: 'landmark:si-saltcutters-cave', marker: L('landmark:si-saltcutters-cave') },
          { id: 'body', text: 'Examine the dead courier', interact: 'obj:si-dead-courier', marker: L('landmark:si-saltcutters-cave') },
        ],
        next: 'trail',
      },
      {
        id: 'trail', journal: 'The courier was knifed, not drowned, and someone tore three glyphs out of her satchel before the sea gave her up. The trail leads to the corsairs’ bunk-loft above the landing, where every deckhand on the rock keeps a sea-chest.',
        objectives: [{ id: 'chest', text: 'Search the corsairs’ sea-chests', marker: L('landmark:gull-rock'), when: f(`${S}.killer_known`) }],
        next: 'pike',
      },
      {
        id: 'pike', journal: 'Jory Pike killed the courier, and meant to sell her glyphs, and the name of the cellar they were cut in, to the gentleman in grey gloves. Pike drinks on the landing most evenings, with his back to the sea.',
        objectives: [{ id: 'pike', text: 'Confront Jory Pike', talk: 'npc:jory-pike', marker: L('landmark:gull-rock') }, { id: 'done', text: 'Settle the matter of the knife', hidden: true, when: f(`${S}.pike`) }],
        next: 'satchel',
      },
      {
        id: 'satchel', journal: 'Pike is dealt with, one way or another. The courier’s satchel is still on Oswin Tarr’s table, and by the custom of the rock the one who found her has the say over it.',
        objectives: [{ id: 'oswin', text: 'Decide the courier’s satchel with Oswin Tarr', marker: L('landmark:gull-rock'), when: f(`${S}.glyphs`) }],
        next: [
          { when: is(`${S}.glyphs`, 'league'), to: 'end-league' }, { when: is(`${S}.glyphs`, 'creed'), to: 'end-creed' },
          { when: is(`${S}.glyphs`, 'sea'), to: 'end-sea' }, { to: 'end-kept' },
        ],
      },
      end('end-league', 'Ebba Hollin’s glyphs went into Oswin Tarr’s book as salvage, by the Articles of the League, with Jory Pike’s name in the margin.'),
      end('end-creed', 'You took Ebba Hollin’s satchel east, to finish the run she died on. The League keeps no creed and asks no questions.'),
      end('end-sea', 'Ebba Hollin was given to the sea at the ebb, with a stone at her feet and her glyphs in her hands. Nobody will sell them now.'),
      end('end-kept', 'You kept the dead courier’s glyphs. On Gull Rock, that makes you a smuggler too.'),
    ],
    reward: { xpTier: 2, gold: 100 },
  },
  // ================================================================ Sunscar
  {
    id: QD, name: 'A Debt of Salt', type: 'side', act: 'act2', region: 'region:sunscar', giver: 'npc:zahra-bint-idris',
    summary: 'Zahra bint Idris sells copper bowls at Zahrun, and no one will say her father’s name. Two winters ago he broke the salt-law and was poured out of the forty clans. The Cindermother has agreed to hear the matter once more, if a stranger, bound to no clan, will go to the Dry Well and bring back the truth.',
    requires: GATE,
    firstStage: 'well',
    stages: [
      {
        id: 'well', journal: 'The Dry Well is a day west of Zahrun, where the drovers’ road forks by the red stones. A man lives there whose name may not be spoken. Take water; he has none to give, and he will try to give it to you anyway.',
        objectives: [
          { id: 'reach', text: 'Go to the Dry Well', reach: 'landmark:ss-dry-well', marker: L('landmark:ss-dry-well') },
          { id: 'idris', text: 'Hear the poured-out man', talk: 'npc:idris-the-poured', marker: L('landmark:ss-dry-well') },
        ],
        next: 'tablet',
      },
      {
        id: 'tablet', journal: 'Idris broke salt to take back a Qadiri tablet from his guest, a young magister of Solenne, and the magister fell down the well. The tablet went down with him. Idris has never had the courage to look at it.',
        objectives: [{ id: 'tablet', text: 'Climb down the Dry Well', interact: 'obj:ss-well-tablet', marker: L('landmark:ss-dry-well') }],
        next: 'judgement',
      },
      {
        id: 'judgement', journal: 'You will be heard once, at the Cindermother’s salt-bowl in her tent at Zahrun. Speak well.',
        objectives: [{ id: 'bowl', text: 'Speak at the Cindermother’s salt-bowl', marker: L('landmark:cindermother-tent'), when: f(`${D}.verdict`) }],
        next: 'zahra',
      },
      {
        id: 'zahra', journal: 'The Cindermother has spoken. Zahra bint Idris will hear it from her runner; she would rather hear it from you.',
        objectives: [{ id: 'zahra', text: 'Return to Zahra at Zahrun', talk: 'npc:zahra-bint-idris', marker: L('landmark:zahrun') }],
        next: [
          { when: is(`${D}.verdict`, 'restored'), to: 'end-restored' }, { when: is(`${D}.verdict`, 'lie'), to: 'end-lie' },
          { when: is(`${D}.verdict`, 'caught'), to: 'end-caught' }, { to: 'end-truth' },
        ],
      },
      end('end-truth', 'You told it as Idris told it. He is poured out still, by the law, but the magister will be raised from the well at the clans’ charge, and Zahra may call him father in her own tent.'),
      end('end-restored', 'The Cindermother said Idris’s name aloud at her bowl, and it may be said again in every tent of the forty clans.'),
      end('end-lie', 'You lied at the Cindermother’s bowl, and she let the lie stand. Idris is restored. He knows what she did not say, and he will not come home.'),
      end('end-caught', 'The Cindermother would not hear a salt-breaker speak for a salt-breaker. The matter is closed, and Zahra bint Idris will not look at you.'),
    ],
    reward: { xpTier: 2, gold: 80, items: [{ item: 'item:glyph-siphon' }], rep: [{ faction: 'faction:qasiri', delta: 5 }], lore: ['lore:qasiri-salt-law'] },
  },
  {
    id: QG, name: 'The Glass Garden', type: 'side', act: 'act2', region: 'region:sunscar', giver: 'npc:laleh-glass-widow',
    summary: 'In a red canyon near Zahrun, a glassblower’s widow named Laleh grows flowers in cinderglass: roses, lilies and desert stars, alive and warm in the frost. The children of the oasis sleep among them at night. The grandmothers say she is doing what the Kings did.',
    requires: GATE,
    firstStage: 'garden',
    stages: [
      {
        id: 'garden', journal: 'The burned dead come to the mouth of Laleh’s canyon at night and stand looking at the warmth. Sometimes they come in.',
        objectives: [
          { id: 'reach', text: 'Go to the glass garden', reach: 'landmark:ss-glass-garden', marker: L('landmark:ss-glass-garden') },
          { id: 'shades', text: 'Drive the cinder shades from the garden', kill: 'enemy:cinder-shade', count: 2, marker: L('landmark:ss-glass-garden') },
        ],
        next: 'blooms',
      },
      {
        id: 'blooms', journal: 'The warmth has to come from somewhere. Lay the Ashmark on the glass and find out where.',
        objectives: [{ id: 'blooms', text: 'Examine the glass blooms', interact: 'obj:ss-glass-bloom-*', count: 3, marker: L('landmark:ss-glass-garden') }],
        next: 'spring',
      },
      {
        id: 'spring', journal: 'A thread of ley runs under the garden toward Zahrun, and the garden is drinking from it. At the warm spring of the oasis stands a stone the Cindermothers have notched every midwinter for longer than anyone remembers.',
        objectives: [{ id: 'stone', text: 'Read the spring-stone at Zahrun', interact: 'obj:ss-spring-stone', marker: L('landmark:zahrun') }],
        next: 'choice',
      },
      {
        id: 'choice', journal: 'The spring of Zahrun is cooling, and it has cooled faster since last winter. Since the Quench, or since Laleh sank her first bowl? The stone does not say. Laleh is waiting for you among her flowers.',
        objectives: [{ id: 'laleh', text: 'Tell Laleh what the spring-stone says', marker: L('landmark:ss-glass-garden'), when: f(`${G}.choice`) }],
        next: [{ when: is(`${G}.choice`, 'grow'), to: 'end-grow' }, { when: is(`${G}.choice`, 'broken'), to: 'end-broken' }, { to: 'end-returned' }],
      },
      end('end-grow', 'The glass garden grows on, and the children of Zahrun sleep warm in it. Later is later, Laleh says.'),
      end('end-broken', 'Laleh broke her husband’s glass with his own hammer, row by row, and sent the children home to the tents. The spring is everyone’s.'),
      end('end-returned', 'The glass garden has been carried to the spring and sunk round it, to give its warmth back to the water instead of drawing it away. The children sleep by the spring now.'),
    ],
    reward: { xpTier: 1, gold: 60 },
  },
  // ================================================================ Cinder Wastes
  {
    id: QK, name: 'Drakeling', type: 'side', act: 'act2', region: 'region:cinder-wastes', giver: 'npc:hamid-drake-warden',
    summary: 'Hamid is the last drake-warden who still walks the Ash Road, and his oath is one line long: no egg of the Kings’ drakes is to be left whole. A brooding cinderdrake has frozen to death in the glass flats, and her clutch is hatching wild into the frost. Hamid is old, and would like company.',
    requires: GATE,
    firstStage: 'hollow',
    stages: [
      {
        id: 'hollow', journal: 'The brood-hollow is north of the King’s Cold Oven, where the glass flats crack. The whelps that hatched without their mother eat anything warm.',
        objectives: [
          { id: 'reach', text: 'Find the drake hollow', reach: 'landmark:cw-drake-hollow', marker: L('landmark:cw-drake-hollow') },
          { id: 'whelps', text: 'Kill the feral whelps', kill: 'enemy:cinderdrake-whelp', count: 3, marker: L('landmark:cw-drake-hollow') },
        ],
        next: 'egg',
      },
      {
        id: 'egg', journal: 'There is always one egg that does not hatch. It will be under the brood-mother, where she could keep it warmest.',
        objectives: [{ id: 'egg', text: 'Find the last egg', marker: L('landmark:cw-drake-hollow'), when: { any: [f(`${K}.egg_warmed`), f(`${K}.choice`)] } }],
        next: 'hamid',
      },
      {
        id: 'hamid', journal: 'Take word of the egg back to Hamid at the King’s Cold Oven.',
        objectives: [
          { id: 'hamid', text: 'Return to Hamid', talk: 'npc:hamid-drake-warden', marker: L('landmark:cw-kings-oven') },
          { id: 'decide', text: 'Decide the egg’s fate', hidden: true, when: f(`${K}.choice`) },
        ],
        next: [
          { when: is(`${K}.choice`, 'cold'), to: 'end-cold' }, { when: is(`${K}.choice`, 'broken'), to: 'end-broken' },
          { when: is(`${K}.choice`, 'wild'), to: 'end-wild' }, { when: is(`${K}.choice`, 'creed'), to: 'end-creed' }, { to: 'end-warden' },
        ],
      },
      end('end-cold', 'You left the last egg to the cold, and the warden’s oath kept itself.'),
      end('end-broken', 'Hamid kept his oath. In fifty years it was the first egg he had broken that was warm.'),
      end('end-wild', 'The drakeling ran east into the dunes, sneezing sparks. It will remember your hand all its life.'),
      end('end-creed', 'The last egg went to the Ashen Creed, to be raised in the Kings’ own city. A warden of the Bani Hamra will be watching.'),
      end('end-warden', 'A drake-warden is raising a drake. Hamid will teach it the Ash Road, all seven stations, and not to sleep on Three.'),
    ],
    reward: { xpTier: 2, gold: 120, items: [{ item: 'item:glyph-cinders' }], lore: ['lore:cinderdrakes-and-ashwyrms'] },
  },
  {
    id: QF, name: 'The Defector', type: 'side', act: 'act2', region: 'region:cinder-wastes', giver: 'npc:benedek-of-aurenac',
    summary: 'At the end of the Ash Road a Creed mage sits on his pack with his back to Qadir, coughing black. Benedek went over the wall at Aurenac after the Red Abbess when he was fourteen. Now his lungs are full of cinders and he wants to go home: to the Lantern Coast, and the Wick, and every name he knows.',
    requires: GATE,
    firstStage: 'cache',
    stages: [
      {
        id: 'cache', journal: 'Benedek hid a bundle behind the fallen listening-stone at the Bent Tower, Four on the children’s rhyme: his breviary, his novice’s ring, and a list of thirty Creed cells, written once in anger to buy his life.',
        objectives: [
          { id: 'reach', text: 'Go to the Bent Tower', reach: 'landmark:cw-bent-tower', marker: L('landmark:cw-bent-tower') },
          { id: 'cache', text: 'Recover Benedek’s cache', marker: L('landmark:cw-bent-tower'), when: f(`${F}.list`) },
          { id: 'shades', text: 'Watch for the shades round the tower', kill: 'enemy:cinder-shade', count: 2, optional: true },
        ],
        next: 'road',
      },
      {
        id: 'road', journal: 'Take Benedek his breviary and his ring at the end of the Ash Road, and decide with him where he goes from here.',
        objectives: [{ id: 'benedek', text: 'Decide Benedek’s road', marker: L('landmark:ash-road-end'), when: f(`${F}.fate`) }],
        next: [
          { when: is(`${F}.fate`, 'safe'), to: 'end-safe' }, { when: is(`${F}.fate`, 'stayed'), to: 'end-stayed' },
          { when: is(`${F}.fate`, 'handed'), to: 'end-handed' }, { when: is(`${F}.fate`, 'abbess'), to: 'end-abbess' }, { to: 'end-home' },
        ],
      },
      end('end-home', 'Benedek walked west along the Ash Road toward the Lantern Coast and the Wick’s tollgates, carrying what he carried.'),
      end('end-safe', 'Benedek went home to the Lantern Coast under your protection, where no tollgate will examine him.'),
      end('end-stayed', 'Benedek stayed with the Creed, to let its physicians numb his lungs with Rime. If he dies in a tent, he says, he will haunt you.'),
      end('end-handed', 'You walked Benedek back to the Creed’s camp. They will be kind to him, and watch him, and he will never again be alone with a pen.'),
      end('end-abbess', 'The Red Abbess sent Benedek home with her blessing. A Creed that keeps people, she says, is only a Church with worse singing.'),
    ],
    reward: { xpTier: 2, gold: 100, items: [{ item: 'item:glyph-homing' }] },
  },
];

export default quests;
