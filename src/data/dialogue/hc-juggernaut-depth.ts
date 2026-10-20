/**
 * Hollow Crown, JUGGERNAUT Act I depth pass (10-campaign-style.md §8, docs/PACING.md): the new stages' scenes,
 * investigation clues, travel banter, optional finds and the third parts of the side quests. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const offer = (q: Q, text: string, to: string): DialogueChoice => ({ text, to, quest: true, when: fresh(q), effects: [{ startQuest: q }] });
/** a stage scene that takes over an NPC's talk must still let them give their own quests */
const more = (...offers: DialogueChoice[]): DialogueChoice[] => [...offers, { text: 'Thanks.', to: null }];
const GH = 'npc:gussie-haldt' as const, PG = 'npc:penny-grist' as const, SD = 'npc:selwyn-duckett' as const, DS = 'npc:dilly-spoke' as const;
const VOTE: Q = 'quest:juggernaut-the-whistle-vote';
const JK = 'npc:hobnail-jenks' as const;
const JC1: Q = 'quest:juggernaut-the-gold-diggers', JC5: Q = 'quest:juggernaut-rimeheart-colossus', JC6: Q = 'quest:juggernaut-three-short-blasts';
const LAST: Q = 'quest:juggernaut-last-shift', PAY: Q = 'quest:juggernaut-pay-day';

/** a clue object: one scene while its stage runs (sets its flag), a plain line otherwise */
function clue(id: string, name: string, when: NarrativeCondition, text: string, flag: string, plain: string, more?: string): DialogueDef {
  return {
    id: `dialogue:obj-${id}`, name, scope: 'party',
    entries: [{ when, node: 'clue' }, { node: 'plain' }],
    nodes: {
      clue: { speaker: 'narrator', text, effects: [{ setFlag: flag, value: true }], next: more ? 'more' : null },
      ...(more ? { more: { speaker: 'narrator', text: more, next: null } } : {}),
      plain: { speaker: 'narrator', text: plain, next: null },
    },
  };
}
/** a one-node find (optional areas) that unlocks a codex entry */
const find = (id: string, name: string, text: string, lore: `lore:${string}`): DialogueDef => ({
  id: `dialogue:obj-${id}`, name, scope: 'party',
  entries: [{ node: 'find' }],
  nodes: { find: { speaker: 'narrator', text, effects: [{ unlockLore: lore }], next: null } },
});

const dialogues: DialogueDef[] = [
  // ======================= I-1 The Bell in the Rock: the tally-board
  {
    id: 'dialogue:area-juggernaut-rivet-street', name: 'I-1 banter: up Rivet Street', bark: true,
    entries: [{ when: stage('quest:juggernaut-the-bell-in-the-rock', 'board'), node: 'b' }],
    nodes: { b: { speaker: GH, text: '(Marching ahead with her crate, not looking back.) Every whistle in town went off by itself. Every one. Mine went off in my POCKET. I’ve been deaf since I was nineteen and that still made me jump.', next: null } },
  },
  {
    id: 'dialogue:juggernaut-gussie-tally', name: 'I-1 counting the tallies', scope: 'party',
    entries: [{ node: 'board' }],
    nodes: {
      board: { speaker: 'narrator', text: 'The tally-board by the shaft-head: a great black plank studded with brass hooks, one for every miner on the shift. Going down, you take your tally off. Coming up, you hang it back. A full board means everybody is home. It is the most important thing in Rivet Town.', next: 'count' },
      count: { speaker: GH, text: '(On her crate, finger out.) Thirty-nine. Forty. Forty-one. Forty-one tallies, forty-one hooks, forty-one miners up. Good. Good. (Sergeant, on her belt, is still singing straight down at the ground.) Then WHAT is he singing at?', next: 'hum' },
      hum: {
        speaker: 'narrator', text: 'Your tally, on its hook, is humming. You can hear it. So can she. A little brass disc with your shift-mark on it, ringing faintly, in time with the thing under your ribs.',
        choices: [
          { text: '(Take your tally off the hook and hold it.)', to: 'take' },
          { text: 'Foreman, it’s my tally. It’s me.', to: 'me' },
          { text: '(Put your palm flat on the board and feel where the song comes from.)', to: 'palm', school: 'iron' },
        ],
      },
      take: { speaker: 'narrator', text: 'It is warm in your palm, and the hum goes up your arm and into your chest and meets the singing there like two hands meeting. Gussie watches with her mouth open. She has never in her life seen a tally do anything but hang.', next: 'below' },
      me: { speaker: GH, mood: 'afraid', text: 'You. (She looks up at you, which takes a while.) Course it’s you. Biggest lump on the shift, quietest lump on the shift, and the rock picks you to sing at. I should have known when you held that roof.', next: 'below' },
      palm: { speaker: 'narrator', text: 'Through the plank, through the wall, through the rock under Rivet Town, the song runs down and down like a seam, past the galleries, past the Slag Rivers, past the bottom of every shaft anybody ever dug. It is coming from below the bottom.', next: 'below' },
      below: {
        speaker: GH, text: 'Below the bottom. That’s the Lode end. The deep end. (She chews her lip.) Nobody goes down the deep end on a night like this. Not even you. Specially not you.',
        choices: [
          { text: 'It wants me to come.', to: 'want' },
          { text: 'Then I’ll wait for the morning shift, Foreman.', to: 'wait', trust: 1 },
        ],
      },
      want: { speaker: GH, text: 'Lots of things want you to come. The Lode, the tavern, my sister Hilda. You don’t go to any of them in the dark. That’s the first rule and the last rule. Nobody works alone.', next: 'golems' },
      wait: { speaker: GH, mood: 'happy', text: 'Good lump. Good, sensible lump. (She reaches up and pats your elbow, which is as far as she can reach.) That’s the first rule and the last rule. Nobody works alone.', next: 'golems' },
      golems: { speaker: GH, text: 'And in the morning, every golem on the main line, kicked. They stopped dead when that bell rang, and the Regency wants its ore in three days, bell or no bell. Hang your tally back up. Then bed.', next: 'hang' },
      hang: {
        speaker: 'narrator', text: 'Forty-one tallies on forty-one hooks. One of them humming.',
        choices: [
          { text: '(Hang it back up.)', to: 'up' },
          { text: '(Keep it in your pocket tonight.)', to: 'pocket', effects: [{ setFlag: 'juggernaut.tally_kept', value: true }] },
        ],
      },
      up: { speaker: 'narrator', text: 'You hang it back. The board is full. Gussie counts it one more time, out of habit, and gets forty-one, and then, under her breath, forty-two.', next: null },
      pocket: { speaker: 'narrator', text: 'Gussie looks at the empty hook a long time. Then she hangs her own spare tally on it, so the board looks full, and says nothing, which for Gussie is a great deal.', next: null },
    },
  },

  // ======================= I-2 Stopped Golems: following the water back
  clue('juggernaut-boiler-clue-1', 'I-2 the golems’ water (1)', stage('quest:juggernaut-stopped-golems', 'boilers'),
    'The water-tank at the end of the main line, where the golems drink. A scum of black lies on the surface, and the pipe that fills it is wet on the outside, where it should be dry. It comes down through the rock from somewhere deeper.', 'juggernaut.boiler_1',
    'A golems’ water-tank, skimmed clean.'),
  clue('juggernaut-boiler-clue-2', 'I-2 the golems’ water (2)', stage('quest:juggernaut-stopped-golems', 'boilers'),
    'Further down, the pipe joins a newer one, bright iron, still warm from the press. Stamped on the joint: HOLLOW LODE. M. RUHL. WATER BY ARRANGEMENT. Somebody has been selling the Deepworks its own water.', 'juggernaut.boiler_2',
    'A pipe-joint in the gallery wall.'),
  clue('juggernaut-boiler-clue-3', 'I-2 the golems’ water (3)', stage('quest:juggernaut-stopped-golems', 'boilers'),
    'At the end of the bright pipe, a grating over a drain from the Hollow Lode’s deep end. What runs out of it is not water. It is black, and slow, and it smells of nothing at all, and it has been feeding the golems for a year.', 'juggernaut.lode_water',
    'A grating over a drain from the deep end.', 'Sergeant would hate this place. You hate it on his behalf.'),

  // ======================= I-4 The Smelter’s Wages: payday, and Penny on the step
  ...[
    'The baker’s, crowded for the first time in years. A miner with a fistful of Magda’s coin is buying a whole cake, just because. He pays, and the baker drops the coins into her apron, and wipes her hand on it, and frowns at the damp patch.',
    'The cobbler’s, where Ewan Haskins is buying his lad boots. New boots. The lad is crying. Ewan is very quiet about it, quieter than you have ever seen him, and he pays with a coin from the bottom of his purse that is still wet from the morning.',
    'The tavern, where half the shift is buying the other half drinks and singing the old strike song, the one about nobody working alone. They have forgotten the last verse. Nobody seems to mind.',
  ].map((text, i): DialogueDef => clue(`juggernaut-payday-${i + 1}`, `I-4 payday in Rivet Town (${i + 1})`, stage('quest:juggernaut-the-smelters-wages', 'payday'),
    text, `juggernaut.payday_${i + 1}`, 'Rivet Town, the morning after payday.')),
  {
    id: 'dialogue:juggernaut-penny-step', name: 'I-4 Penny on the store step', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: PG, text: '(Penny Grist is sitting on the company store’s step beside the cold brazier, very small and very neat, holding a single charred page by the corner.) Thirty years of ledgers. Every debt in Rivet Town, in my writing. She burned them in an afternoon.', next: 'page' },
      page: {
        speaker: PG, text: 'Everybody cheered. I cheered too. Isn’t that funny? I cheered while they burned my handwriting.',
        choices: [
          { text: 'The debts are gone, Penny. That’s good, isn’t it?', to: 'good' },
          { text: 'You’re allowed to mind.', to: 'mind', trust: 1, trustNpc: PG },
        ],
      },
      good: { speaker: PG, text: 'Is it? A debt you forgive is a gift. A debt somebody burns is a purchase. She bought every family in Rivet Town this afternoon, and they cheered while she paid.', next: 'coin' },
      mind: { speaker: PG, mood: 'sad', text: '(She folds the charred page very small.) Thank you. I’ve been wanting somebody to say that since three o’clock. Nobody in this town minds anything out loud. It’s the whistles. You can’t hear yourself mind.', next: 'coin' },
      coin: { speaker: PG, mood: 'afraid', text: 'She paid me too. For my trouble, she said. (She holds out her palm: one bright new coin, sitting in a little pool of black.) It won’t dry. I’ve wiped it eleven times.', next: 'end' },
      end: { speaker: PG, text: 'The Brotherhood will want to vote. Gussie’s gone to drag the benches out. Go and listen to what everyone says, and then vote however you like. Just don’t let anybody pay you first.', next: null },
    },
  },

  // ======================= I-5 The Whistle Vote: the oldest and the youngest, and dawn at the shaft-head
  {
    id: 'dialogue:juggernaut-selwyn-canvass', name: 'I-5 Selwyn on the Lode', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: SD, text: 'The Hollow Lode? I dug it, once. Forty years back, before it had that name. Good iron, then. It sang when you struck it. (He taps the rock beside him.) Now it sings like a man crying in the next room.', next: 'cost' },
      cost: {
        speaker: SD, text: 'What would it cost? It’d cost us the habit of listening to the rock. Gussie’s bird knows. Any old miner knows. You don’t dig towards a sound like that. You dig away from it.',
        choices: [
          { text: 'And if we don’t dig, Rivet Town goes hungry.', to: 'hungry' },
          { text: 'You’ve heard it too.', to: 'heard' },
        ],
      },
      hungry: { speaker: SD, mood: 'sad', text: 'It does. It has before. Hungry’s a thing you get over. I’m not sure the other thing is. (He looks at his hands.) But I’m old, and I’ve eaten. Ask somebody young.', choices: more(offer('quest:juggernaut-the-singing-seam', 'You said the first miners sang for iron.', 'sang')) },
      heard: { speaker: SD, text: 'Every night since the Bell. Can’t sleep for it. (He laughs, short.) Fifty years down here and the rock’s never kept me up before. Vote how you like. But vote awake.', choices: more(offer('quest:juggernaut-the-singing-seam', 'You said the first miners sang for iron.', 'sang')) },
      sang: { speaker: SD, text: 'In the oldest gallery. They’d sing, and the rock would sing back where the iron was. Go and try. You look like you might.', next: null },
    },
  },
  {
    id: 'dialogue:juggernaut-dilly-canvass', name: 'I-5 Dilly on the Lode', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: DS, mood: 'happy', text: 'The vote? Dig! Obviously dig! Double wages! I could buy a cart with brakes! I don’t want brakes, but I could BUY them. (She stops.) Why are you making that face. That’s a Gussie face.', next: 'face' },
      face: {
        speaker: DS, text: '(She kicks the rail.) Fine. I know. The Lode line’s the only line I won’t race. It’s not scary. It’s sad. The carts come up from it slower than they went down, every time, and nobody’s pushing.',
        choices: [
          { text: 'Then don’t dig it.', to: 'dont' },
          { text: 'What would you do with double wages?', to: 'wages', trust: 1, trustNpc: DS },
        ],
      },
      dont: { speaker: DS, text: 'Easy for you, you’re enormous, you can eat rocks. (She grins, then doesn’t.) No. You’re right. I just wanted somebody to say it so I didn’t have to.', choices: more(offer('quest:juggernaut-dillys-rails', 'Is the Long Drop clear?', 'drop')) },
      wages: { speaker: DS, mood: 'sad', text: 'Get my mam’s teeth seen to. (She says it fast, so it does not count.) Don’t tell anyone. Everyone thinks I want a faster cart. I do. I want Mam’s teeth more.', choices: more(offer('quest:juggernaut-dillys-rails', 'Is the Long Drop clear?', 'drop')) },
      drop: { speaker: DS, text: 'Blocked. Hollow golems standing on it like they own it. Clear it and we race. Loser buys pies.', next: null },
    },
  },
  {
    id: 'dialogue:obj-juggernaut-whistle-dawn', name: 'I-5 dawn at the shaft-head', scope: 'party',
    entries: [
      { when: { all: [stage(VOTE, 'dawn'), { flag: 'juggernaut.whistle', value: 'dig' }] }, node: 'dig' },
      { when: { all: [stage(VOTE, 'dawn'), { flag: 'juggernaut.whistle', value: 'slag' }] }, node: 'slag' },
      { when: stage(VOTE, 'dawn'), node: 'strike' },
      { node: 'plain' },
    ],
    nodes: {
      strike: { speaker: 'narrator', text: 'Dawn at the shaft-head, and nobody goes down. The cage-lift hangs empty. The miners sit on the benches with their picks across their knees, and the women bring out bread, and somebody has started a pot of soup that will have to feed four hundred.', next: 'strike2' },
      strike2: { speaker: 'narrator', text: 'Across the street, the company store is shut, with Magda’s new sign in the window: BACK WHEN YOU’RE HUNGRY. Under it, in chalk, somebody from the shift has written: WE’RE ALWAYS HUNGRY. WE’RE ALSO STILL HERE.', effects: [{ setFlag: 'juggernaut.dawn_seen', value: 'strike' }], next: null },
      dig: { speaker: 'narrator', text: 'Dawn at the shaft-head, and the first shift for the Hollow Lode is going down, paid in advance. They are very cheerful. They are quieter than they were yesterday. Gussie stands by the cage-lift counting them on to it, and does not shout once.', next: 'dig2' },
      dig2: { speaker: 'narrator', text: 'When the cage has gone, she looks at the tally-board for a long time. Then she climbs down off her crate and goes into the whistle-house and shuts the door. Sergeant, inside, is singing.', effects: [{ setFlag: 'juggernaut.dawn_seen', value: 'dig' }], next: null },
      slag: { speaker: 'narrator', text: 'Dawn at the shaft-head, and every slag-cart in the Deepworks is lined up on the main line, full to the brim with thirty years of grey waste, heading for the Lode. The whole shift is pushing. They are singing the strike song, all of it, last verse too.', next: 'slag2' },
      slag2: { speaker: 'narrator', text: 'Somewhere far down, the first carts tip, and the Lode’s weeping goes muffled, like a sob into a pillow. Sergeant, on Gussie’s belt, stops singing for the first time since the Bell, and looks around, astonished.', effects: [{ setFlag: 'juggernaut.dawn_seen', value: 'slag' }], next: null },
      plain: { speaker: 'narrator', text: 'The shaft-head of Rivet Town, and the tally-board, full.', next: null },
    },
  },

  // ======================= I-7 Pay That Empties You: the quiet miners
  clue('juggernaut-quiet-miner-1', 'I-7 a quiet miner (1)', stage('quest:juggernaut-pay-that-empties-you', 'quiet'),
    'Ewan Haskins, sitting on a crate by the Lode road with his hands on his knees. His lad’s new boots are on his own feet, laced very neatly. He smiles at you very politely. He does not know your name. He has known your name since you were six.', 'juggernaut.quiet_1',
    'An empty crate by the Lode road.'),
  clue('juggernaut-quiet-miner-2', 'I-7 a quiet miner (2)', stage('quest:juggernaut-pay-that-empties-you', 'quiet'),
    'Rosalie Steen, the loudest singer on the night shift, sweeping the same yard over and over, in silence. When you say her name she stops, and listens, as if to a whistle very far away, and then goes on sweeping.', 'juggernaut.quiet_2',
    'A yard swept very, very clean.'),
  clue('juggernaut-quiet-miner-3', 'I-7 a quiet miner (3)', stage('quest:juggernaut-pay-that-empties-you', 'quiet'),
    'At the Lode mouth itself, a line of miners waiting to be paid, perfectly still, perfectly quiet. In each of their hands, held out flat, a single wet coin. They are not waiting for wages. They are waiting to be told where to go.', 'juggernaut.quiet_3',
    'The Lode mouth.', 'At the head of the line, with a strongbox and a ledger, Magda Ruhl is humming to herself and counting.'),

  // ======================= I-9 End of Shift: the Lamp Post (codex find)
  {
    id: 'dialogue:obj-juggernaut-lamp-post', name: 'I-9 the Lamp Post', scope: 'party',
    entries: [{ when: stage('quest:juggernaut-end-of-shift', 'post'), node: 'post' }, { node: 'plain' }],
    nodes: {
      post: { speaker: 'narrator', text: 'At the top of the main line, where the Deepworks end and the gate road begins, stands the Lamp Post: an iron pole hung with hooks, and on the hooks, miners’ lamps. One for every Juggernaut who ever went up and out, so the shift would know to keep a place for them.', next: 'lamps' },
      lamps: { speaker: 'narrator', text: 'Most of the lamps are cold and red with rust. A few, very old, have been kept polished by somebody. The newest is thirty years old and has a little brass tag: ABEL WHITLOW. GONE UP FOR THE TURNING. KEEP HIS PLACE.', next: 'hang' },
      hang: {
        speaker: 'narrator', text: 'Your lamp is in your hand, still lit from the Lode.',
        choices: [
          { text: '(Hang it on the post, lit.)', to: 'lit', effects: [{ unlockLore: 'lore:hc-juggernaut-lamp-post' }] },
          { text: '(Hang it, and blow it out. They’ll light it when you’re home.)', to: 'out', effects: [{ unlockLore: 'lore:hc-juggernaut-lamp-post' }] },
        ],
      },
      lit: { speaker: 'narrator', text: 'It swings on its hook, the only lit lamp on the post. Far below, down the main line, someone at the shaft-head sees it and blows a whistle: one long, two short, one long. You don’t know that signal. Later you find out it means: we see you.', next: null },
      out: { speaker: 'narrator', text: 'You blow it out and hang it, cold, among the others. That is the custom. A lamp left lit is a lamp somebody has to watch. A cold one is a promise: I will come back and light it myself.', next: null },
      plain: { speaker: 'narrator', text: 'The Lamp Post at the top of the main line, hung with lamps. Yours is the newest.', next: null },
    },
  },
  {
    id: 'dialogue:area-juggernaut-main-line', name: 'I-9 banter: up the main line', bark: true,
    entries: [{ when: stage('quest:juggernaut-end-of-shift', 'road'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Up the main line, out of the dark, into a daylight you have not seen properly in years. It is enormous. Everything up here is enormous, and nothing is holding up the roof.', next: null } },
  },

  // ======================= Side: Too Tall for the Door (the invitation)
  {
    id: 'dialogue:obj-juggernaut-lotte-invite', name: 'Too Tall for the Door: the invitation', scope: 'party',
    entries: [{ when: stage('quest:juggernaut-too-tall-for-the-door', 'invite'), node: 'pin' }, { node: 'plain' }],
    nodes: {
      pin: { speaker: 'narrator', text: 'You pin Lotte’s invitation to the shaft-head board, among the shift-notices and the strike-notices. It is written very large, because Lotte writes the way she does everything: “PARTY. MY HOUSE. TONIGHT. YOU CAN ALL FIT. I CHECKED.”', next: 'party' },
      party: {
        speaker: 'narrator', text: 'By the evening, the whole shift has read it. By nightfall half of them are at Lotte’s, ducking in under a door they do not need to duck under, out of habit.',
        choices: [
          { text: '(Go to the party.)', to: 'go', effects: [{ setFlag: 'juggernaut.lotte_party', value: true }] },
          { text: '(Watch from the street. It’s her night.)', to: 'watch', effects: [{ setFlag: 'juggernaut.lotte_party', value: true }] },
        ],
      },
      go: { speaker: 'narrator', text: 'Lotte’s house is full to the rafters, which in Lotte’s house is a long way up. Her mam has sent eleven cheeses. Lotte stands in the middle of her own front room with a hat on, indoors, beaming down at everyone, and nobody has to duck at all.', next: null },
      watch: { speaker: 'narrator', text: 'From the street you can see Lotte through her new, tall window, standing in the middle of her own house with a hat on, laughing, with her whole shift round her. She waves. She can wave indoors now.', next: null },
      plain: { speaker: 'narrator', text: 'The shaft-head board. Lotte’s invitation has been pinned over three times, and is still the biggest notice on it.', next: null },
    },
  },

  // ======================= Side: Penny’s Other Ledger (the auditor)
  {
    id: 'dialogue:obj-juggernaut-auditor-desk', name: 'Penny’s Other Ledger: the auditor', scope: 'party',
    entries: [{ when: stage('quest:juggernaut-pennys-other-ledger', 'auditor'), node: 'office' }, { node: 'plain' }],
    nodes: {
      office: { speaker: 'narrator', text: 'The Regency’s auditor sits behind an empty desk in the pay office, a thin grey man with a thin grey pen. There are no ledgers. Magda burned them. He has been sent down a mine to audit a bonfire, and he knows it.', next: 'name' },
      name: { speaker: 'narrator', text: '“Grist,” he says, reading from a list. “Company store. The clerk’s name is Grist?” He looks up. “I grew up here, you know. C. 1020. My mother owed that store a winter coat. One day the debt was simply gone. Nobody ever told us why.”', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'Penny’s other ledger has a page for C. 1020 that she would not let you read.',
        choices: [
          { text: '“The clerk let it go. She let a lot of them go.”', to: 'tell', effects: [{ setFlag: 'juggernaut.auditor', value: 'told' }] },
          { text: '“There’s nothing here to audit, sir. It all burned.”', to: 'burned', effects: [{ setFlag: 'juggernaut.auditor', value: 'burned' }] },
        ],
      },
      tell: { speaker: 'narrator', text: 'The auditor is quiet a long time. Then he writes, in his thin grey hand, across the top of his empty form: “Nothing owing.” He signs it. On his way out he stops at the store, and buys a very small, very neat bunch of flowers, and leaves it on the counter.', next: null },
      burned: { speaker: 'narrator', text: '“So it did,” says the auditor, and closes his empty book, and looks out of the window at the company store for longer than he needs to. “Nothing owing, then.” He signs his form. On his way out he raises his hat to the store’s front window. He does not know why.', next: null },
      plain: { speaker: 'narrator', text: 'The pay office. An empty desk, and a form signed “Nothing owing”.', next: null },
    },
  },

  // ======================= Side: the Singing Seam (the song-board)
  {
    id: 'dialogue:obj-juggernaut-song-board', name: 'The Singing Seam: the song-board', scope: 'party',
    entries: [{ when: stage('quest:juggernaut-the-singing-seam', 'board'), node: 'board' }, { node: 'plain' }],
    nodes: {
      board: { speaker: 'narrator', text: 'Past the Singing Seam, in a gallery so old its props are stone, a board is bolted to the rock: the first miners’ song, every verse cut in square careful letters. You read it by lamplight. It is not a song about iron. It is directions.', next: 'verses' },
      verses: { speaker: 'narrator', text: '“Down by the singing, left at the red, under the water and on to the bed. Where the rock answers, there you will stay: dig where it sings and it gives you its way.” And the last verse, cut deeper than the rest: “And when it goes quiet, put down your pick. Something has stopped. Go up and be quick.”', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'Thirty years ago the rock went quiet, and the Deepworks did not put down its picks.',
        choices: [
          { text: '(Copy the last verse for Selwyn.)', to: 'copy', effects: [{ unlockLore: 'lore:hc-juggernaut-first-song' }] },
          { text: '(Sing it, there in the gallery, to see what answers.)', to: 'sing', effects: [{ unlockLore: 'lore:hc-juggernaut-first-song' }] },
        ],
      },
      copy: { speaker: 'narrator', text: 'You copy it on the back of a shift-ticket, every word. When you read it to Selwyn he sits down on his stool and says nothing for a long while. Then: “Go up and be quick. Fifty years, and nobody ever read us the end of the song.”', next: null },
      sing: { speaker: 'narrator', text: 'You sing it, badly, in the dark. The gallery takes the tune and passes it down, down, into the rock, verse by verse, and from very deep under you, from the Lode end, something sings the last verse back. It sounds like it has been waiting to be asked.', next: null },
      plain: { speaker: 'narrator', text: 'The first miners’ song-board, bolted to the rock.', next: null },
    },
  },

  // ======================= Side: Crane-Mother (the slag dam)
  clue('juggernaut-slag-dam', 'Crane-Mother: what the crane holds back', stage('quest:juggernaut-crane-mother', 'bridge'),
    'Under the old slag-bridge, the black slag has backed up behind a fallen beam into a lake, warm and glossy and very still. Agathe’s crane-chain runs down to the beam and holds it, taut as a harp string. If the crane moved, the whole lake would go down the run, straight into the shift houses.', 'juggernaut.slag_dam',
    'The old slag-bridge, its fallen beam propped with new timber.',
    'You go and fetch the Brotherhood. It takes six of them and you to prop the beam properly. Agathe watches from her cab with her flask, and when it is done, she climbs down ninety rungs for the first time in a month.'),

  // ======================= Side: Slag Sculptures (Clem’s canary)
  {
    id: 'dialogue:obj-juggernaut-slag-canary', name: 'Slag Sculptures: Clem’s canary', scope: 'party',
    entries: [{ when: stage('quest:juggernaut-slag-sculptures', 'canary'), node: 'canary' }, { node: 'plain' }],
    nodes: {
      canary: { speaker: 'narrator', text: 'A canary in grey slag, about the size of your fist, cast with enormous care and rather too much beak. Under its feet, scratched into the slag with a nail: SERJENT. You set it on the whistle-house step and knock.', next: 'gussie' },
      gussie: {
        speaker: GH, text: '(Gussie opens the door, looks down at it, and goes absolutely silent. In his cage on her belt, the real Sergeant looks at the slag one and puffs up to twice his size.) Who did this. Who did this. Was it Clem Bodkin.',
        choices: [
          { text: 'I couldn’t possibly say.', to: 'say', effects: [{ setFlag: 'juggernaut.slag_canary', value: true }] },
          { text: 'It won, in my opinion.', to: 'won', effects: [{ setFlag: 'juggernaut.slag_canary', value: true }] },
        ],
      },
      say: { speaker: GH, mood: 'happy', text: 'It was Clem Bodkin. She spelt it wrong. She always spells it wrong. (She picks it up in both hands.) It’s going on the windowsill. Next to the other one. Don’t tell her there’s another one. Don’t tell her it’s my favourite.', next: null },
      won: { speaker: GH, mood: 'happy', text: 'It did. It won. (She holds it up to Sergeant, who is still offended.) Look. You’ve got a statue. Nobody else on this shift has a statue. Don’t get above yourself.', next: null },
      plain: { speaker: 'narrator', text: 'The whistle-house windowsill. A slag canary sits on it, spelt wrong, next to a slag whistle-house with a tiny Gussie on top.', next: null },
    },
  },

  // ======================= Side: Nib and Nub (the test drive)
  {
    id: 'dialogue:obj-juggernaut-twins-cart', name: 'Nib and Nub: the test drive', scope: 'party',
    entries: [{ when: stage('quest:juggernaut-nib-and-nub', 'test'), node: 'top' }, { node: 'plain' }],
    nodes: {
      top: { speaker: 'narrator', text: 'The top of the scrap hill. The twins’ cart: a boiler, one wheel at each end, a bell in the middle and no brakes. Nib is at one end saying “Forward!” Nub is at the other end saying “Forward!” They push off in opposite directions.', next: 'go' },
      go: {
        speaker: 'narrator', text: 'It goes. Nobody is quite sure which way. The bell is ringing constantly, which by the rules means it is going the wrong way in both directions at once.',
        choices: [
          { text: '(Lean left.)', to: 'left', effects: [{ setFlag: 'juggernaut.cart_test', value: 'left' }] },
          { text: '(Lean right.)', to: 'right', effects: [{ setFlag: 'juggernaut.cart_test', value: 'right' }] },
          { text: '(Plant both feet and stop it with your body.)', to: 'stop', school: 'iron', effects: [{ setFlag: 'juggernaut.cart_test', value: 'stop' }] },
        ],
      },
      left: { speaker: 'narrator', text: 'You lean left. The cart goes right, down the whole scrap hill, over a boiler, through a bedstead and into a pond. Nib, from the top: “That was forward!” Nub: “That was MY forward!” They hug, very hard, for the first time in years.', next: null },
      right: { speaker: 'narrator', text: 'You lean right. The cart goes left, in a long beautiful curve all the way round the scrap hill and back to exactly where it started, where it stops, rings once, and falls apart. The twins look at each other. “Circle,” they say together. “Both forwards.”', next: null },
      stop: { speaker: 'narrator', text: 'You put your boots down. The cart stops. You do not, quite, for about ten yards. When the dust clears the twins are staring at you. “Brakes,” says Nib. “It needs a Juggernaut,” says Nub. They start drawing a bigger cart.', next: null },
      plain: { speaker: 'narrator', text: 'The scrap hill. There are wheel tracks going in every direction at once.', next: null },
    },
  },

  // ======================= Optional areas (Claude 2): finds in the Deepworks’ ruin, cave and viewpoint
  find('iron-frontier-ruin-find', 'Deepworks ruin: the first whistle-house',
    'In the ruin, a roofless stone hut at a dead shaft-head, and inside it a rack of old whistles on nails, one for every foreman, the oldest worn to a sliver. Cut over the door, in the square letters of the first miners: “BLOW FOR THE SHIFT. NEVER FOR THE OWNER.”',
    'lore:hc-iron-frontier-ruin'),
  find('iron-frontier-cave-find', 'Deepworks cave: the props',
    'At the end of the cave the old pit-props are not timber. They are people: statues of miners, carved from the living rock where the rock was cut away, each holding up the roof with both hands. Their faces are worn smooth. One of them is very tall, and very young, and looks a little like you.',
    'lore:hc-iron-frontier-cave'),
  find('iron-frontier-cave-codex', 'The Prop Gallery: a shift-ticket',
    'A shift-ticket, centuries old, wedged between a stone prop’s fingers: “Collapse at the third face. Forty-one down, forty-one up. Prop held by Big Aud Fenner, for an hour and three-quarters. Aud says she is fine. Aud is not fine. Aud is getting a statue.”',
    'lore:hc-iron-frontier-tally'),
  find('iron-frontier-view-find', 'Deepworks viewpoint: the slag lights',
    'From the viewpoint high on the Scrapfields you can see the whole of the Deepworks laid open: the shaft-heads smoking, the Slag Rivers glowing red, the rail-lines like silver threads. And far off, at the deep end, one patch of the slag is not red but black, and spreading.',
    'lore:hc-iron-frontier-view'),
  {
    id: 'dialogue:area-iron-frontier-view', name: 'Deepworks viewpoint banter',
    bark: true, entries: [{ when: { heroClass: 'juggernaut' }, node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'From up here Rivet Town is a handful of lamps in a bowl of smoke. You can hear a whistle, very faintly. It is almost certainly Gussie, shouting at somebody.', next: null } },
  },
  // ======================= ACT II, C-1 The Gold Diggers: the road in, the old bore-hole
  {
    id: 'dialogue:area-juggernaut-gold-road', name: 'C-1 banter: into the Gilded Ruins', bark: true,
    entries: [{ when: stage(JC1, 'jenks'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Underfoot the road turns from mud to gold dust, and the gold dust turns to gold. Somewhere ahead, faint, under everything, you can hear somebody working a pick. The sound of home, in a place made of money.', next: null } },
  },
  {
    id: 'dialogue:juggernaut-jenks-shaft', name: 'C-1 Jenks at the old bore-hole', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: JK, text: '(He is lying flat on the gold with his ear to an old bore-hole, and he waves you down beside him without looking.) Shh. Listen. Thirty years I’ve heard this through ten fathom of gold. I’ve never been this close.', next: 'listen' },
      listen: {
        speaker: 'narrator', text: 'Up the bore-hole, faint and steady: a hammer. Three strokes and a rest. Three strokes and a rest. And behind it, so faint you could be imagining it, the grind of a shift that has not stopped.',
        choices: [
          { text: 'That’s a forge.', to: 'forge' },
          { text: '(Count the strokes the way the shift counts: by the breath.)', to: 'breath', school: 'iron' },
          { text: 'Why have you never come out here before?', to: 'why' },
        ],
      },
      forge: { speaker: JK, text: 'It’s not a forge, lad. It’s a shift. Listen to it. No dinner break. No whistle. That’s a double shift, and it’s been a double shift for thirty years. Something down there is working itself to death.', next: 'shift' },
      breath: { speaker: 'narrator', text: 'Three in, a breath out. It is the old Rivet Town rhythm, the one every child learns on the shaft-head before they learn their letters. Jenks watches you count it and goes quiet, the way a man goes quiet in church.', next: 'shift' },
      why: { speaker: JK, mood: 'sad', text: 'Sentries. Hollow iron walking rounds. And because if I came and listened properly I’d have to know. You can’t un-hear a double shift.', next: 'shift' },
      shift: {
        speaker: JK, text: 'Nobody’s blown its whistle. That’s all it is. Nobody’s been down there to tell it the shift’s over. (He sits up, gold dust all down one cheek.) Well. We’ve got a Juggernaut now.',
        choices: [{ text: 'Then let’s go and blow it.', to: 'go', quest: true }, { text: 'Get the night shift ready.', to: 'go', quest: true }],
      },
      go: { speaker: JK, mood: 'happy', text: 'Night shift! On your feet! We’re shoring a gallery. Back to the dig camp, and mind the sentries.', next: null },
    },
  },

  // ======================= ACT II, C-3 The Gilded Engine: telling Jenks
  {
    id: 'dialogue:juggernaut-jenks-engine', name: 'C-3 Jenks hears the Engine has knocked off', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: JK, text: '(The whole dig camp is standing about with its picks down, listening to nothing.) It stopped. Mid-stroke. Forty diggers stopped with it, like somebody had blown a whistle. What did you do?', next: 'tell' },
      tell: {
        speaker: 'narrator', text: 'You tell him: the gold running off it like water, the old iron underneath, worked half to death, and the question it asked at the end, the one a worker asks.',
        choices: [
          { text: 'It asked if its work was good. I said it was.', to: 'good', trustNpc: JK, trust: 1 },
          { text: 'It knocked off. First time in thirty years.', to: 'off' },
        ],
      },
      good: { speaker: JK, mood: 'sad', text: '(He takes his cap off.) That’s all any of us want to hear, end of shift. Nobody ever says it. Thirty years of gold, and not one foreman said it to us neither.', next: 'ruts' },
      off: { speaker: JK, mood: 'happy', text: 'Knocked off! (He turns and bellows.) LADS! The Engine’s knocked off! (Forty miners cheer a machine they have never seen.) That’s the first sensible thing that’s happened in Gildport since C. 640.', next: 'ruts' },
      ruts: { speaker: JK, text: 'Now. Something you’ll want to see. Cart ruts on the north road out of the Ruins, deep ones, heavy-laden, wet with black. Rivet Town cart, by the axle-width. Going north, to the high pass.', next: 'magda' },
      magda: { speaker: JK, text: 'There’s only one person this side of the arch hauling hollow iron by the cartload, and she pays in coins that cry. Go careful, Juggernaut.', next: null },
    },
  },

  // ======================= ACT II, C-5 Rimeheart Colossus: Magda’s pay-packet in the ice
  clue('juggernaut-colossus-pay', 'C-5 a pay-packet in the Colossus’s ice', stage(JC5, 'packet'),
    'Frozen into the ice where the Colossus stood, at the height of a giant’s knee: a brown Rivet Town pay-packet, the kind the company store hands out on a Friday, addressed in a square hand: “To whoever holds the pass. One week’s wage, to step aside.”', 'juggernaut.colossus_pay',
    'The empty pass, where a colossus stood.', 'Inside, one coin, wet and bright, smiling sun upwards. Magda tried to pay the Colossus. It held the pass anyway. Some things, it turns out, cannot be bought, and it took a giant made of ice to show her.'),

  // ======================= ACT II, C-6 Three Short Blasts: the answer
  {
    id: 'dialogue:obj-juggernaut-reply-whistle', name: 'C-6 an answer for Gussie through the Iron arch', scope: 'party',
    entries: [{ when: stage(JC6, 'reply'), node: 'arch' }, { node: 'plain' }],
    nodes: {
      arch: { speaker: 'narrator', text: 'You stand under the Iron arch with a whistle at your lips. On the far side of the stone, a very long way off, a small foreman is standing on a crate in a leaking whistle-house, listening.', next: 'blow' },
      blow: {
        speaker: 'narrator', text: 'What do you send?',
        choices: [
          { text: '(Three short blasts. All well.)', to: 'well', effects: [{ setFlag: 'juggernaut.reply', value: 'well' }] },
          { text: '(Put the whistle down and shout “ALL WELL, GUSSIE!” the way everybody in Rivet Town shouts.)', to: 'shout', effects: [{ setFlag: 'juggernaut.reply', value: 'shout' }] },
          { text: '(Three short. Then, very softly, the first note of end of shift, and stop. Not yet.)', to: 'notyet', when: { flag: 'juggernaut.gussie_devotable' }, effects: [{ setFlag: 'juggernaut.reply', value: 'notyet' }] },
        ],
      },
      well: { speaker: 'narrator', text: 'Three short blasts, hard as you can. The arch takes them, and the stone hums with them for a long moment after, like a pipe carrying water a long way down.', next: 'end' },
      shout: { speaker: 'narrator', mood: 'happy', text: 'Every pigeon at the Gate Circle leaves at once. A carter drops a sack. Somewhere on the far side of the stone, you are almost certain, somebody shouts back “WHAT?”', next: 'end' },
      notyet: { speaker: 'narrator', mood: 'sad', text: 'Three short, and one breath of the long note. She will know it. Not done. Not yet. Keep the light on.', next: 'end' },
      end: { speaker: 'narrator', text: 'One head short, she said, every night at six. Tonight, perhaps, the count will feel a little closer.', next: null },
      plain: { speaker: 'narrator', text: 'The Iron arch, humming very faintly.', next: null },
    },
  },

  // ======================= ACT III, Last Shift: counting heads, and the tally
  {
    id: 'dialogue:obj-juggernaut-legion-count', name: 'Last Shift: counting heads', scope: 'party',
    entries: [{ when: stage(LAST, 'count'), node: 'count' }, { node: 'plain' }],
    nodes: {
      count: { speaker: 'narrator', text: 'In the Legion camp the Deepworks folk stand in their own ranks, hollow, in leathers and lamp-caps, picks at the shoulder like pikes. You go down the line the way Gussie does, touching each cap. One. Two. Three.', next: 'turn' },
      turn: {
        speaker: 'narrator', text: 'Somewhere past four hundred, you understand. They are not soldiers. They never were. They are a shift that nobody ever called off.',
        choices: [
          { text: '(Keep counting, out loud, to the end.)', to: 'end' },
          { text: '(Count the way the shift counts: every tenth head, a tap on the cap with your knuckle.)', to: 'tap', school: 'iron' },
        ],
      },
      tap: { speaker: 'narrator', text: 'Tap. Tap. By the third hundred, the hollow miners are bowing their heads for it before you reach them, as if they remember.', next: 'end' },
      end: { speaker: 'narrator', text: 'Eleven hundred and four. You will want a crate, and a whistle, and a very big breath.', effects: [{ setFlag: 'juggernaut.heads_counted', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The Deepworks ranks in the Legion camp.', next: null },
    },
  },
  {
    id: 'dialogue:obj-juggernaut-shift-tally', name: 'Last Shift: the count, chalked', scope: 'party',
    entries: [{ when: stage(LAST, 'tally'), node: 'board' }, { node: 'plain' }],
    nodes: {
      board: {
        speaker: 'narrator', text: 'By the cook-tent at the Heart camp is a plank somebody uses for chalking the supper rota. You rub the rota out. It is an emergency.',
        choices: [
          { text: '(Chalk: “NIGHT SHIFT, THE HEART. 1,104 IN. 1,104 OUT.”)', to: 'out' },
          { text: '(Chalk the count, and under it: “G. H.’s count. Correct.”)', to: 'correct' },
        ],
      },
      out: { speaker: 'narrator', text: 'In, and out, and the same number both times. It is the whole of a foreman’s job, and it is the hardest thing in the world.', effects: [{ setFlag: 'juggernaut.shift_tallied', value: true }], next: 'cook' },
      correct: { speaker: 'narrator', mood: 'happy', text: 'Correct. You underline it twice, very hard, nearly through the plank, the way she underlines things.', effects: [{ setFlag: 'juggernaut.shift_tallied', value: true }], next: 'cook' },
      cook: { speaker: 'narrator', text: 'The cook comes out, reads it, and does not ask where the supper rota went. She has had a long war too.', next: null },
      plain: { speaker: 'narrator', text: 'A plank by the cook-tent with a shift count chalked on it, underlined.', next: null },
    },
  },

  // ======================= ACT III, Pay Day: a lit pay-window
  {
    id: 'dialogue:obj-juggernaut-pay-lamp', name: 'Pay Day: a lit pay-window', scope: 'party',
    entries: [{ when: stage(PAY, 'lamp'), node: 'lamp' }, { node: 'plain' }],
    nodes: {
      lamp: {
        speaker: 'narrator', text: 'An upturned crate, a borrowed lamp, and the lid of a cashbox propped up for a shutter. It is the worst pay-window in the history of the Deepworks.',
        choices: [
          { text: '(Light the lamp, and chalk PAY on the crate.)', to: 'lit' },
          { text: '(Light it, and chalk the company store’s old motto on it, crossed out: “Credit Is Kindness”.)', to: 'motto', school: 'iron' },
        ],
      },
      lit: { speaker: 'narrator', text: 'The lamp catches. Across the camp, at the Legion’s edge, a whole rank of hollow miners turns its head towards the light, the way a shift does at six o’clock.', effects: [{ setFlag: 'juggernaut.pay_lamp', value: true }], next: null },
      motto: { speaker: 'narrator', mood: 'happy', text: 'You cross it out with one hard stroke. Somebody in the Legion’s ranks, very faintly, laughs. Then the lamp catches, and the whole rank turns towards the light.', effects: [{ setFlag: 'juggernaut.pay_lamp', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'A makeshift pay-window at the Heart camp, its lamp still lit.', next: null },
    },
  },
];

export default dialogues;
