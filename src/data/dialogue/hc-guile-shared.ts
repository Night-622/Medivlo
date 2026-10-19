/**
 * Hollow Crown, Tidecourt: scenes both Guile campaigns share (the Pawned Gate seal and deed at the gate, the Queen's
 * lights and toll in Morvane Marsh, and the Lanternford folk's general talk). Class-specific entries first; the gate
 * is one place, reached from the toll road (Jester) and the water-arch (Corsair). Owner: Claude 4.
 */
import type { DialogueDef, NarrativeCondition } from '@/core';

const stage = (q: `quest:${string}`, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const LIGHTS: NarrativeCondition = { any: [stage('quest:jester-the-queens-toll', 'lights'), stage('quest:corsair-the-queens-toll', 'lights')] };

const light = (n: number, text: string): DialogueDef => ({
  id: `dialogue:obj-guile-marsh-light-${n}`, name: `C-2 the Queen’s light ${n}`, scope: 'party',
  entries: [{ when: LIGHTS, node: 'light' }, { node: 'plain' }],
  nodes: {
    light: { speaker: 'narrator', text, next: null },
    plain: { speaker: 'narrator', text: 'A small light on a reed-stalk over the black water. It does not flicker. It is waiting for the next traveller.', next: null },
  },
});

const dialogues: DialogueDef[] = [
  {
    id: 'dialogue:obj-guile-gate-seal', name: 'I-10 opening the Pawned Gate', scope: 'party',
    entries: [
      { when: stage('quest:jester-the-pawned-gate', 'gate'), node: 'je' },
      { when: stage('quest:corsair-the-pawned-gate', 'gate'), node: 'cs' },
      { node: 'seal' },
    ],
    nodes: {
      je: {
        speaker: 'narrator', text: 'The Velvet King sits on his throne of IOUs at the foot of the Pawned Gate, beaten, the black pearls cracked off his crown and rolling away to the sea. He looks up at you with wet eyes. Nobody has made him laugh honestly in thirty years. You have one joke left.',
        choices: [
          { text: '“Majesty, you pawned the gate to pay your debts. Now the gate’s back, and so are the debts. That’s called a round trip.”', to: 'laugh', effects: [{ setFlag: 'jester.king_laughed', value: 'debts' }] },
          { text: '(Fall over. Flat. The way Fennick did, in front of this same throne, in C. 1012.)', to: 'fall', effects: [{ setFlag: 'jester.king_laughed', value: 'fennick' }] },
          { text: '[Guile] (Hold up the old pawn ticket from the throne cushion.) “Redeemable at Velvet Harbour. No refunds.”', to: 'ticket', school: 'guile', effects: [{ setFlag: 'jester.king_laughed', value: 'ticket' }] },
        ],
      },
      laugh: { speaker: 'narrator', text: 'For a moment nothing. Then the King laughs, an old man’s honest laugh, and the last of the pearl-crust breaks off his crown, and he weeps, and his tears are clear. “Go on,” he says. “Open it. It was never mine.” You hold up the Court half, and the gate answers.', next: 'through' },
      fall: { speaker: 'narrator', text: 'He stares at you. Then his face crumples, and he laughs until he cannot breathe, because he remembers that too, and the last of the pearl-crust breaks off his crown. “Pantaloon,” he says, weeping clear tears. “Pantaloon’s apprentice.” You hold up the Court half, and the gate answers.', next: 'through' },
      ticket: { speaker: 'narrator', text: 'The King looks at the ticket, and at the gate, and laughs so suddenly that he falls off his throne of IOUs into the paper. The last of the pearl-crust breaks off his crown, and he weeps, and his tears are clear. You hold up the Court half, and the gate answers.', next: 'through' },
      cs: { speaker: 'narrator', text: 'The Pawned Gate rises out of the sea on its water-arch, rose stone carved with all twelve schools’ marks, weeping black. The Velvet King’s barge floats high and light beside it, free of its pearls. You hold up the Reef half from the Overdraft’s bow. It sings, and the gate answers.', next: 'dot' },
      dot: { speaker: 'npc:dot-brine', text: '(From the wheel, behind you, as the water-arch opens.) There’s the Admiral’s wake, going in ahead of you. Go on, sweetheart. Bring me back something I can’t afford.', next: 'through' },
      through: { speaker: 'narrator', text: 'Slowly, for the first time in thirty years, the Pawned Gate opens. Beyond it is a road, and a green moor at dusk, and somewhere far ahead, a bell.', next: null },
      seal: { speaker: 'narrator', text: 'The Pawned Gate stands open. Concordia lies beyond.', next: null },
    },
  },
  {
    id: 'dialogue:obj-pawned-gate-deed', name: 'I-10 the deed to the Pawned Gate', scope: 'party',
    entries: [
      { when: { all: [stage('quest:corsair-the-pawned-gate', 'deed'), { not: { flag: 'corsair.gate_deed' } }] }, node: 'deed' },
      { node: 'plain' },
    ],
    nodes: {
      deed: {
        speaker: 'narrator', text: 'You fish it out of the water with a boathook: the deed to the Pawned Gate, vellum and wax and three royal seals, still legal, still binding. Whoever holds it owns a realm’s gate. Dot is leaning over the rail, watching you, saying nothing at all, which is very unlike her.',
        choices: [
          { text: '[Keep it.] Somebody’s going to own this gate. Better a free captain than a king.', to: 'keep', effects: [{ setFlag: 'corsair.gate_deed', value: 'kept' }] },
          { text: '[Tear it up.] Nobody owns a gate.', to: 'tear', effects: [{ setFlag: 'corsair.gate_deed', value: 'torn' }] },
        ],
      },
      keep: { speaker: 'npc:dot-brine', text: '(A long pause.) Well. You’re a landlord now. Don’t let it go to your head. Fold it small, keep it dry, and never, ever sell it.', next: null },
      tear: { speaker: 'npc:dot-brine', mood: 'happy', text: '(The pieces go down on the tide like gulls settling.) Ha! There goes the most valuable thing in Tidecourt. Article One, sweetheart. Article One. My mother would have cried.', next: null },
      plain: { speaker: 'narrator', text: 'Where the gate’s deed floated, only sea.', next: null },
    },
  },
  // ---------- C-2 the Queen's toll (both Guile campaigns)
  light(1, 'The first of the Queen’s lights stands on a reed-stalk over the black water, and the path to it is the only firm ground. It is a pretty light. As you reach it, it goes out, and the next one lights, a little further on and a little to the left.'),
  light(2, 'The second light. The firm ground has narrowed to a plank’s width, and every lantern-seller’s warning from Lanternford comes back to you at once. Under the water, very faintly, other lights are glowing, the drowned ones, where travellers followed the wrong light.'),
  light(3, 'The third light hangs over open water, and there is a post beside it with a lantern burning on it, and a little painted board: PASSAGE, ONE MEMORY. HONEST PRICES. BY ORDER OF THE QUEEN.'),
  {
    id: 'dialogue:obj-guile-toll-light', name: 'C-2 paying the Queen’s toll', scope: 'party',
    entries: [
      { when: { all: [stage('quest:jester-the-queens-toll', 'toll'), { not: { flag: 'jester.toll_paid' } }] }, node: 'je' },
      { when: { all: [stage('quest:corsair-the-queens-toll', 'toll'), { not: { flag: 'corsair.toll_paid' } }] }, node: 'cs' },
      { node: 'plain' },
    ],
    nodes: {
      je: {
        speaker: 'narrator', text: 'The toll-lantern burns on its post over the water. PASSAGE, ONE MEMORY. Something in the flame leans towards you, politely, the way a shopkeeper leans over a counter.',
        choices: [
          { text: '(Pay. Let it take a memory, whichever it likes.)', to: 'pay', effects: [{ setFlag: 'jester.toll_paid', value: 'memory' }] },
          { text: '(Pay her in a joke she hasn’t heard in thirty years: the one about the Turning that came late.)', to: 'joke', effects: [{ setFlag: 'jester.toll_paid', value: 'joke' }] },
          { text: '[Guile] Ask for a receipt.', to: 'receipt', school: 'guile', effects: [{ setFlag: 'jester.toll_paid', value: 'receipt' }] },
        ],
      },
      cs: {
        speaker: 'narrator', text: 'The toll-lantern burns on its post over the water. PASSAGE, ONE MEMORY. You can hear Dot as clearly as if she were standing behind you: “Never pay the first price, sweetheart. Nobody means the first price.”',
        choices: [
          { text: '(Pay. Let it take a memory, whichever it likes.)', to: 'pay', effects: [{ setFlag: 'corsair.toll_paid', value: 'memory' }] },
          { text: '[Guile] Haggle. One memory for two crossings, or no deal.', to: 'haggle', school: 'guile', effects: [{ setFlag: 'corsair.toll_paid', value: 'haggled' }] },
          { text: 'Offer her a memory of Dot Brine. She’ll like it. Everybody does, eventually.', to: 'dot', effects: [{ setFlag: 'corsair.toll_paid', value: 'dot' }] },
        ],
      },
      pay: { speaker: 'narrator', text: 'The flame leans out and takes something, gently, the way you would take a coin from a child’s hand. You do not know what it was. You feel a little lighter, and a little sadder about being lighter. The water ahead goes still and clear.', next: null },
      joke: { speaker: 'narrator', text: 'The flame flickers, and flickers again, and then the lantern shakes on its post with a sound like a match-girl giggling. Every light across the marsh blinks at once. The water ahead goes still and clear, and nothing has been taken from you at all.', next: null },
      receipt: { speaker: 'narrator', text: 'A long pause. Then a slip of light flutters down from the lantern into your hand: PAID, ONE JOKE, WITH THANKS. It fades as you read it. The water ahead goes still and clear. You are fairly sure she has been out-foxed for the first time in a thousand years, and enjoyed it.', next: null },
      haggle: { speaker: 'narrator', text: 'The flame goes very tall with outrage, then very small with interest, and then it takes half of one memory, the dull half, and gives you the change in light. The water ahead goes still and clear. Dot would be proud. You remember that bit.', next: null },
      dot: { speaker: 'narrator', text: 'The flame takes a memory of Dot singing on the capstan, flat, at dawn. The whole marsh lights up for a moment as if it were laughing. The water ahead goes still and clear. Somewhere in the drowned lights below, the Queen is humming the tune, flat.', next: null },
      plain: { speaker: 'narrator', text: 'The toll-lantern on its post. The board says PAID.', next: null },
    },
  },
  // ---------- Lanternford folk (general talk, any campaign)
  {
    id: 'dialogue:guile-hester', name: 'Hester Glimmer (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:hester-glimmer', text: 'Safe lanterns! Only slightly into the water! What’ll it be?',
        choices: [
          { text: 'Tell me about the Lantern Queen.', to: 'queen' },
          { text: 'How did Tidecourt folk end up in a marsh?', to: 'how' },
          { text: 'Farewell.', to: null, tag: 'leave' },
        ],
      },
      queen: { speaker: 'npc:hester-glimmer', text: 'Business rival. Terrible woman. Lovely lamps. Honest prices for a thousand years, and then nobody came to buy, and she went into lights that lead into the water. I don’t blame her, exactly. A marsh is hard on a shop.', next: 'start' },
      how: { speaker: 'npc:hester-glimmer', text: 'Came to sell lanterns at the Turning fair in C. 1011. No Turning, no fair, no way home. So we sold lanterns to a marsh. The marsh has bought every one. It’s a very good customer. It never pays.', next: 'start' },
    },
  },
  {
    id: 'dialogue:guile-peregrine', name: 'Peregrine Tolley (general)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:peregrine-tolley', text: 'This one leads you home. This one leads you nearly home. This one’s for people you don’t like. I label them very clearly. It’s the only honest shop in the marsh.', next: null } },
  },
  // ---------- lair codexes (side-room "Old writing", Claude 2's instanceGen): obj:<lair>-codex
  {
    id: 'dialogue:obj-guile-capital-lair-1-codex', name: 'The Phantom Theatre: the prompt book', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'On the prompter’s stand, open where it was left, the prompt book of the theatre’s last play, C. 1012: The Fool and the King. The final cue is underlined twice: “King laughs. Gate is saved. Curtain.” Beside it, in pencil, the manager’s note: “Cut. Too unlikely.”', effects: [{ unlockLore: 'lore:hc-phantom-theatre' }], next: null } },
  },
  {
    id: 'dialogue:obj-guile-capital-lair-2-codex', name: 'The Counting House: the Auditor’s first page', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'The first page of the Auditor’s great ledger, chained to a desk. “Opened: one account, the Crown of Tidecourt. Pledged: one Gate. Balance: owing.” Every page after it, thirty years of them, is interest.', effects: [{ unlockLore: 'lore:hc-the-auditor' }], next: null } },
  },
  {
    id: 'dialogue:obj-guile-capital-lair-3-codex', name: 'The Velvet Court: a page’s tally', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'Behind the throne, at a child’s height, scratched into the gilt with a pin: a row of tally marks, hundreds of them, and over them, “Times the King laughed. H., page.” The marks stop in C. 1012. After that there is only one more, cut very hard.', effects: [{ unlockLore: 'lore:hc-pages-tally' }], next: null } },
  },
  {
    id: 'dialogue:obj-guile-frontier-lair-1-codex', name: 'Vex’s Guildhold: two frames', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'In Vex’s strongroom, an empty frame where the Fleet’s First Article used to hang, and beside it another, still full: a boy’s indenture to the Thieves’ Exchange, sold by his father for eleven shillings. On the glass, in pearl-ink, Vex has written one word: CHEAP.', effects: [{ unlockLore: 'lore:hc-guildmaster-vex' }], next: null } },
  },
  {
    id: 'dialogue:obj-guile-frontier-lair-2-codex', name: 'The Merry Widow: the crew list', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'Nailed up in the forecastle, the Merry Widow’s crew list: forty names, every one of them crossed out and written in again beside itself in the same careful hand, over and over, as if somebody aboard kept trying to remember them.', effects: [{ unlockLore: 'lore:hc-merry-widow' }], next: null } },
  },
  {
    id: 'dialogue:obj-guile-frontier-lair-3-codex', name: 'The Gallows: the last warrant', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'Nailed to the lowest cage, a hanging warrant gone green: the last one the Fleet ever carried out, in C. 1012. The crime is written in one line: “Sold a free captain.” Under it, in another hand: “After this, hats.”', effects: [{ unlockLore: 'lore:hc-the-gallows' }], next: null } },
  },
];

export default dialogues;
