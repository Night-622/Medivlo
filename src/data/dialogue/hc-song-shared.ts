/**
 * Hollow Crown, Harmonia: scenes both Song campaigns share (the Lyre Gate seal, the drowned choir stalls after
 * Morwen's release, the Stone Court duet) and the Song exiles' general talk at Abbeyshore. Class-specific entries
 * first; the gate is one place reached from both the Lyrehaven and the Fells side. Owner: Claude 4.
 */
import type { DialogueDef, NarrativeCondition } from '@/core';

const stage = (q: `quest:${string}`, s: string): NarrativeCondition => ({ questStage: q, stage: s });

const dialogues: DialogueDef[] = [
  // ---------- I-10 the Lyre Gate
  {
    id: 'dialogue:obj-song-gate-seal', name: 'I-10 opening the Lyre Gate', scope: 'party',
    entries: [
      { when: stage('quest:bard-the-lyre-gate', 'gate'), node: 'bard' },
      { when: { all: [stage('quest:skald-the-lyre-gate', 'gate'), { not: { flag: 'skald.ulf_voice' } }] }, node: 'skald' },
      { when: stage('quest:skald-the-lyre-gate', 'gate'), node: 'skald-open' },
      { node: 'seal' },
    ],
    nodes: {
      bard: { speaker: 'narrator', text: 'The Silent Maestro’s baton lies in the grass, dripping black. All round the Lyre Gate the stolen voices lift off his choir like starlings and scatter home over the meadows, and the meadows begin, very faintly, to hum.', next: 'soprano' },
      soprano: { speaker: 'narrator', text: 'One voice does not scatter. A bright soprano, a little flat on the top note, flies straight back down the road towards Lyrehaven and the Grand Opera, as if it knew exactly whose it was.', next: 'bard-open' },
      'bard-open': { speaker: 'narrator', text: 'The Lyre Gate is a great arch of lilac stone, carved with all twelve schools’ marks, its strings of black tears hanging from the keystone. You hold up the Opera half. It sings, and the gate answers in harmony.', next: 'marchetti' },
      marchetti: { speaker: 'npc:blaise-marchetti', mood: 'happy', text: '(Out of the shadow of the arch, a lilac coat, a deep bow.) Thank you, darling. I never could get it open myself. After you. No? Then after me.', next: 'through' },
      skald: {
        speaker: 'narrator', text: 'On the Fells side the Maestro stole even the echoes. Now his baton is down, and the echoes come roaring back off every crag at once, and the stolen voices burst free. One of them is rough and plain and very quiet, and it is flying after a man with a drum on his back who is already at the arch.',
        choices: [
          { text: '(Catch it in your drum.)', to: 'caught', effects: [{ setFlag: 'skald.ulf_voice', value: 'caught' }] },
          { text: '(Let it go home to the Fells.)', to: 'free', effects: [{ setFlag: 'skald.ulf_voice', value: 'free' }] },
        ],
      },
      caught: { speaker: 'narrator', text: 'You hold up your drum and the voice goes into it like a bird into a coat, and the drum-skin trembles, warm. At the arch, Ulf turns round. He looks at your drum for a long moment. Then he goes through.', next: 'skald-open' },
      free: { speaker: 'narrator', text: 'You lower your drum. The plain voice wheels once over the Lyre Gate and flies away north, back over the Fells, towards the Saga Stones, where it learned all nine hundred sagas without ever being allowed to say them. At the arch, Ulf watches it go. Then he goes through.', next: 'skald-open' },
      'skald-open': { speaker: 'narrator', text: 'The Lyre Gate is a great arch of lilac stone, carved with all twelve schools’ marks, weeping black down its face. You hold up the Fell half, and it sings, and three times over the Fells sing it back to you.', next: 'through' },
      through: { speaker: 'narrator', text: 'Slowly, for the first time in thirty years, the Lyre Gate opens. Beyond it is a road, and the smell of cut grass, and somewhere far ahead, a bell.', next: null },
      seal: { speaker: 'narrator', text: 'The Lyre Gate stands open. Concordia lies beyond, and the meadows behind it are humming.', next: null },
    },
  },
  // ---------- C-3 the drowned choir stalls, after Morwen's release
  {
    id: 'dialogue:obj-drowned-choir-stalls', name: 'C-3 the drowned choir stalls', scope: 'party',
    entries: [
      { when: stage('quest:bard-abbess-morwen', 'stalls'), node: 'bard' },
      { when: stage('quest:skald-abbess-morwen', 'stalls'), node: 'skald' },
      { node: 'stalls' },
    ],
    nodes: {
      bard: { speaker: 'narrator', text: 'The drowned choir has gone back to its stalls, row on row of pale shapes in the green water, hymn-books open. Abbess Morwen stands at the end of them with her hands empty for the first time in thirty years.', next: 'bard-ask' },
      'bard-ask': {
        speaker: 'narrator', mood: 'sad', text: 'Her voice comes through the water like a bell under a cloth: It would not stop ringing. That was all. Could it be rung gently, do you think, singer? Just once? The way it was meant to be?',
        choices: [
          { text: 'Once, at a true Turning, with every stone there. I’ll see to it.', to: 'bard-once' },
          { text: '(Read her the Abbey hymn the Conservatory kept.)', to: 'bard-hymn', when: { flag: 'bard.hymn_scores' } },
          { text: '(Sing the longest rest in the Turning hymn, the one the Discord taught you.)', to: 'bard-rest', when: { flag: 'bard.morwen_rest' } },
          { text: '(Hum the choir’s part, gently, the way you would ring a bell.)', to: 'bard-once', school: 'song' },
        ],
      },
      'bard-hymn': { speaker: 'narrator', text: 'You read it aloud, all eleven verses, and at the fourth the choir joins in, word-perfect, as they have not been able to for thirty years. The Abbess closes her eyes. Gently, she says. Yes. Like that.', next: 'bard-once' },
      'bard-rest': { speaker: 'narrator', text: 'You hold the rest, the long silence in the middle of the Turning hymn, and the whole drowned choir holds it with you. In the quiet the Abbess smiles. That is where the Bell came in, she says. In the rest. I had forgotten.', next: 'bard-once' },
      'bard-once': { speaker: 'narrator', text: 'The Abbess bows her head. One by one the choir closes their hymn-books. The water in the nave goes clear, and still, and very quiet, like a theatre after the last bow.', next: null },
      skald: { speaker: 'narrator', text: 'The drowned choir has gone back to its stalls. There are names carved on the end of every stall, worn smooth by thirty years of water. Abbess Morwen walks along them slowly, touching each one.', next: 'skald-ask' },
      'skald-ask': {
        speaker: 'narrator', mood: 'sad', text: 'Her voice comes through the water: The drummers on the shore say my brothers’ names every night. I hear them. But three are missing, and the water has taken them off the wood. Have you brought them, drummer?',
        choices: [
          { text: '(Drum the three lost names on the end of the stalls.)', to: 'skald-names', when: { flag: 'skald.lost_names' } },
          { text: 'I’ll find them. The drummers are still looking.', to: 'skald-later', when: { not: { flag: 'skald.lost_names' } } },
          { text: '(Drum every name, all forty, with the three in their right places.)', to: 'skald-names', school: 'song', when: { flag: 'skald.lost_names' } },
        ],
      },
      'skald-names': { speaker: 'narrator', text: 'Brother Ninian. Brother Corrie Harrowby. Little Brother Tod, who was nine and sang the high part. At each name a pale shape in the stalls lifts its head, and the Abbess says the name after you, and then she is quiet.', next: 'skald-end' },
      'skald-later': { speaker: 'narrator', text: 'The Abbess nods, as if thirty years were nothing and a little longer would be nothing too. She says the names she has, all thirty-seven, and leaves three spaces where the others go.', next: 'skald-end' },
      'skald-end': { speaker: 'narrator', text: 'The water in the nave goes clear and still. On the shore, far above, the drummers at the Fish Mill miss a beat, and then go on.', next: null },
      stalls: { speaker: 'narrator', text: 'The choir stalls of the drowned nave, green and quiet. Every hymn-book on them is closed.', next: null },
    },
  },
  // ---------- C-6 the duet at the Stone Court
  {
    id: 'dialogue:obj-song-court-duet', name: 'C-6 the Song duet at the Stone Court', scope: 'party',
    entries: [
      { when: { all: [stage('quest:bard-a-letter-sung', 'duet'), { partyHasClass: 'skald' }] }, node: 'bard-coop' },
      { when: stage('quest:bard-a-letter-sung', 'duet'), node: 'bard' },
      { when: { all: [stage('quest:skald-ragnas-drum-letter', 'duet'), { partyHasClass: 'bard' }] }, node: 'skald-coop' },
      { when: stage('quest:skald-ragnas-drum-letter', 'duet'), node: 'skald' },
      { node: 'court' },
    ],
    nodes: {
      bard: { speaker: 'npc:bearer-skald', text: 'Bard. Sit down. That half of yours has been humming at mine across this court for days, and mine has started humming back, and I can’t sleep for it. You sing. I’ll drum. Let’s get it out of them.', next: 'bard-sing' },
      'bard-coop': { speaker: 'narrator', text: 'The Skald in your party sets down a drum on the old embassy steps. Both half-stones have been humming at each other across the Stone Court for days, and neither of you has said anything about it.', next: 'bard-sing' },
      'bard-sing': { speaker: 'narrator', text: 'You sing a line, any line, the first that comes. The drum answers. Then both halves of the Song Stone start up together, and it is a tune neither of you has ever heard and both of you already know, as if it had been waiting thirty years for two people to sit on the same step.', next: 'end' },
      skald: { speaker: 'npc:bearer-bard', text: 'Skald! Thank goodness. My half has been singing at yours across this court for days, and yours has been answering a beat late, like an echo with manners. Drum something. I’ll sing over it.', next: 'skald-sing' },
      'skald-coop': { speaker: 'narrator', text: 'The Bard in your party sits down beside you on the old embassy steps. Your two half-stones have been humming at each other across the Stone Court for days, one of them a beat behind the other, like the Fells.', next: 'skald-sing' },
      'skald-sing': { speaker: 'narrator', text: 'You drum the long-message beat, and a voice comes in over it, and then both halves of the Song Stone join in at once: a tune neither of you was taught and both of you know, with a rest in the middle where something ought to come in and doesn’t.', next: 'end' },
      end: { speaker: 'narrator', text: 'Across the Stone Court, the other bearers have stopped to listen. When it ends, nobody claps. They just look at each other, as if the Turning had come a little closer.', next: null },
      court: { speaker: 'narrator', text: 'The old embassy steps of the Stone Court. Someone has chalked a stave on the bottom step, with two notes on it.', next: null },
    },
  },
  // ---------- the Song exiles of Abbeyshore (general talk)
  {
    id: 'dialogue:song-eulalie', name: 'Precentor Eulalie (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:eulalie-marchbank', text: 'Dusk soon. We sing at dusk. They like company, under the lake, and so do we.',
        choices: [{ text: 'What do you sing?', to: 'sing' }, { text: 'Farewell.', to: null, tag: 'leave' }],
      },
      sing: { speaker: 'npc:eulalie-marchbank', text: 'Whatever Lyrehaven was singing in C. 1012. We have no new songs, so we sing the old ones carefully. Some nights the shapes in the reeds sing the harmony.', next: null },
    },
  },
  {
    id: 'dialogue:song-hallgerd', name: 'Hallgerd Drum-Wife (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:old-hallgerd', text: '(She does not stop drumming.) Brother Hew, Brother Piran, Brother Tamlin… Sit, if you’re sitting. We don’t stop for company.',
        choices: [{ text: 'Why drum the names?', to: 'why' }, { text: 'Farewell.', to: null, tag: 'leave' }],
      },
      why: { speaker: 'npc:old-hallgerd', text: 'Because a name nobody says is a name that’s gone. That’s Fells law. So we say them. Every night, all of them, from the mill, so the choir knows somebody up here is still counting.', next: null },
    },
  },
  // ---------- lair codexes (side-room "Old writing", Claude 2's instanceGen): obj:<lair>-codex
  {
    id: 'dialogue:obj-song-capital-lair-1-codex', name: 'The Choir Loft: the chorus register', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'On the choirmaster’s stand, the chorus register for the Opera’s last night, C. 1035: forty names, every one ticked present. At the foot, in the choirmaster’s own hand: “Self: staying behind to rehearse, until they come back.”', effects: [{ unlockLore: 'lore:hc-choir-phantom' }], next: null } },
  },
  {
    id: 'dialogue:obj-song-capital-lair-2-codex', name: 'The Organ Hall: the builder’s plate', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'A brass plate on the organ’s console, green at the edges: “Built to sing with the Conservatory, never instead of it. Feed it music, not musicians.” Under it, scratched much later with a penknife: “Somebody did not read the plate.”', effects: [{ unlockLore: 'lore:hc-grand-organ' }], next: null } },
  },
  {
    id: 'dialogue:obj-song-capital-lair-3-codex', name: 'The Opera Stage: the lucky board', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'On the underside of the centre-stage board, where the Opera half lay, singers have scratched their names for three hundred years before their first nights, for luck. The last of them is R. VELL, and beside it, very small: please.', effects: [{ unlockLore: 'lore:hc-lucky-board' }], next: null } },
  },
  {
    id: 'dialogue:obj-song-frontier-lair-1-codex', name: 'Hoddersgill Hall: the toast-board', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'Behind the high seat, a slate where the hall has chalked every toast it ever drank, a hundred years of them, to brides and ewes and the end of bad winters. The last line is in Discord grey: “No more toasts. Nobody listens to the end.”', effects: [{ unlockLore: 'lore:hc-hoddersgill-toasts' }], next: null } },
  },
  {
    id: 'dialogue:obj-song-frontier-lair-2-codex', name: 'The Harpy Roost: the undelivered messages', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'Pressed into the nest wall among the stolen echoes, a dozen strips of drum-hide, all the same message in the same knots, seven years of it, never delivered: COME HOME. COME HOME. They are not Ulf’s knots. They are Ragna’s.', effects: [{ unlockLore: 'lore:hc-ragnas-messages' }], next: null } },
  },
  {
    id: 'dialogue:obj-song-frontier-lair-3-codex', name: 'The Echo Barrow: the first Skald’s rule', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: { read: { speaker: 'narrator', text: 'Carved round the first Skald’s plinth, in runes older than the Halls: “Sing it three times: once for the living, once for the dead, once for the ones not yet born.” The barrow says it back to you three times, whether you read it aloud or not.', effects: [{ unlockLore: 'lore:hc-echo-barrow' }], next: null } },
  },
];

export default dialogues;
