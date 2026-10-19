/** Hollow Crown, JUGGERNAUT Act III: the nemesis remade, the mentor’s last request and the Heart side quests. Owner: Claude 4. */
import type { DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const GH = 'npc:gussie-haldt' as const, MR = 'npc:magda-ruhl' as const, PG = 'npc:penny-grist' as const;
const WHISTLE = (value: string): NarrativeCondition => ({ flag: 'juggernaut.whistle', value });

const dialogues: DialogueDef[] = [
  // ---------- III-4 The Furnace-Heart: Magda's fate
  {
    id: 'dialogue:juggernaut-herald-fate', name: 'III-4 the Furnace-Heart: Magda’s fate', scope: 'party',
    entries: [{ when: WHISTLE('strike'), node: 'strike' }, { node: 'furnace' }],
    nodes: {
      strike: { speaker: MR, mood: 'hollow', text: 'Big one. You blew the long blast, and Rivet Town starved for your conscience. Forty days of bread and dripping. And you’ve come all this way to talk to me about what’s fair?', next: 'furnace' },
      furnace: { speaker: MR, mood: 'hollow', text: '(The Chimera’s iron belly hangs open like a firebox, and Magda is the fire. Coin pours out through its ribs, bright and wet, ringing down the stair.) Look at it all, lump. Wages for everyone. For ever.', next: 'tired' },
      tired: { speaker: MR, mood: 'sad', text: 'He promised the diggers would own the mountain. Now I am the mountain, and I’m still paying out. I can’t stop. Every coin I hand over, I’m one short. Is that what it was like for Mam?', next: 'choose' },
      choose: {
        speaker: MR, text: '(The furnace roars, and sags, and roars again. She is waiting to hear what you will do with her.)',
        choices: [
          {
            text: 'You’re done, Magda. Shift’s over. (Spare her.)', to: 'spare', quest: true,
            when: { any: [WHISTLE('slag'), { trust: GH, value: 'trusted' }] },
            lockedLabel: 'You need the Lode sealed with slag, or Gussie’s trust',
            effects: [{ setFlag: 'juggernaut.nemesis_fate', value: 'spared' }],
          },
          { text: 'Then I’ll put the fire out. (Break the furnace.)', to: 'destroy', quest: true, effects: [{ setFlag: 'juggernaut.nemesis_fate', value: 'destroyed' }] },
        ],
      },
      spare: {
        speaker: 'narrator', text: 'You climb up to the open firebox. The heat would take the eyebrows off a Rivet Golem.',
        choices: [
          { text: '(Rake the Chimera’s own slag off the stair and shovel it in, the way Rivet Town sealed the Lode.)', to: 'slag', when: WHISTLE('slag') },
          { text: '(Blow end of shift: three short blasts, the way Gussie does it.)', to: 'whistle', when: { trust: GH, value: 'trusted' } },
        ],
      },
      slag: { speaker: 'narrator', text: 'Thirty years of waste, shovel by shovel. The slag hits the fire and the fire goes grey, then dull, then cold. The coin stops pouring. In the cold firebox a broad woman in a scorched apron sits blinking at you.', next: 'done' },
      whistle: { speaker: 'narrator', text: 'Three short blasts. All well. Every coin on the stair stops rolling. “Magda Ruhl,” you say, in Gussie’s voice, which every child in Rivet Town can do. “You’re done for the day.”', next: 'whistle2' },
      whistle2: { speaker: 'narrator', text: 'The furnace gutters and goes out, like a lamp at the end of a shift. A broad woman in a scorched apron climbs down out of it, slowly, blinking.', next: 'done' },
      done: { speaker: MR, mood: 'sad', text: 'Done for the day. (She sits down on the stair, heavily, the way anybody does at the end of a shift.) Nobody’s ever said that to me. I was always the one who said it.', next: null },
      destroy: { speaker: 'narrator', text: 'You put your fist through the firebox door. The fire goes out all at once, like a lamp in a flooded shaft, and the coin stops ringing on the stair.', next: 'destroy2' },
      destroy2: { speaker: MR, mood: 'sad', text: '(From inside the cold iron, very quietly.) Fair price, big one. Fair price. Tell Gussie… no. Don’t tell Gussie anything. She’ll only shout.', next: null },
    },
  },
  // ---------- Last Shift (the mentor's last request): Gussie's crate at the foot of the stairs
  {
    id: 'dialogue:obj-juggernaut-shift-crate', name: 'Last Shift: Gussie’s crate', scope: 'party',
    entries: [
      { when: { all: [stage('quest:juggernaut-last-shift', 'whistle'), { flag: 'juggernaut.gussie_devotable' }] }, node: 'first' },
      { when: { all: [stage('quest:juggernaut-last-shift', 'whistle'), { flag: 'juggernaut.gussie_whistle' }] }, node: 'own' },
      { when: stage('quest:juggernaut-last-shift', 'whistle'), node: 'spare' },
      { node: 'crate' },
    ],
    nodes: {
      first: { speaker: 'narrator', text: 'At the foot of the Twelve Stairs, where the Legion still stands in its ranks, sits a crate in fresh Rivet Town paint: GUSSIE’S. NUMBER NINE. DO NOT SIT ON. On top is a letter, and a sock, and in the sock, the First Whistle.', next: 'first2' },
      first2: { speaker: GH, text: '“I said I’d blow it at the end of my last shift. Well, I’ve thought about it, and my last shift is the one you’re on. Get up on the crate and blow it for me. Then bring it home. I want it back. G. H.”', next: 'blowfirst' },
      blowfirst: {
        speaker: 'narrator', text: 'The crate groans under you. You blow the First Whistle, and one long note, nine hundred years old, goes out over the whole Heart. In the Legion’s ranks a thousand hollowed workers lift their heads, put down what they are holding, and turn for home.',
        effects: [{ setFlag: 'juggernaut.last_shift', value: true }, { giveItem: 'i_first_whistle' }, { trust: GH, set: 5 }], next: 'count',
      },
      count: { speaker: 'narrator', mood: 'happy', text: 'Far away, in a whistle-house with a leaking roof, a very small foreman stands on a crate in the dark and counts heads. For the first time in thirty years, the count comes out right.', next: null },
      own: { speaker: 'narrator', text: 'At the foot of the Twelve Stairs sits a crate in fresh Rivet Town paint: GUSSIE’S. NUMBER NINE. DO NOT SIT ON. On top is a letter. Round your neck, on its copper ring, is the whistle she gave you.', next: 'letter' },
      spare: { speaker: 'narrator', text: 'At the foot of the Twelve Stairs sits a crate in fresh Rivet Town paint: GUSSIE’S. NUMBER NINE. DO NOT SIT ON. On top is a letter, and a sock, and in the sock, the whistle-house spare with the dent in it.', next: 'letter' },
      letter: { speaker: GH, text: '“If you’re reading this, you got to the Heart. Course you did. Who else would? There’s folk in there been on shift thirty years with nobody to blow the end of it. Get up on this crate. G. H.”', next: 'blow' },
      blow: {
        speaker: 'narrator', text: 'The crate groans under you. You blow end of shift, one long blast, and it goes out over the whole Heart. In the Legion’s ranks a thousand hollowed workers lift their heads, put down what they are holding, and turn round, as if for home.',
        effects: [{ setFlag: 'juggernaut.last_shift', value: true }], next: null,
      },
      crate: { speaker: 'narrator', text: 'Gussie’s crate, number nine, at the foot of the Twelve Stairs. Somebody has sat on it.', next: null },
    },
  },
  // ---------- Pay Day (the Legion camp)
  {
    id: 'dialogue:obj-juggernaut-hollow-shift', name: 'Pay Day: Magda’s hollow miners', scope: 'party',
    entries: [
      { when: { all: [stage('quest:juggernaut-pay-day', 'pay'), WHISTLE('dig')] }, node: 'dig' },
      { when: stage('quest:juggernaut-pay-day', 'pay'), node: 'shift' },
      { when: stage('quest:juggernaut-pay-day', 'shift'), node: 'dark' },
      { when: stage('quest:juggernaut-pay-day', 'lamp'), node: 'waiting' },
      { node: 'paid' },
    ],
    nodes: {
      dig: { speaker: 'narrator', mood: 'sad', text: 'Rivet Town folk, a whole rank of them, in the Legion: everyone who took Magda’s pay because the shaft-head blew two short blasts. You blew first. You know half these faces. Every hand is closed round a wet, bright coin.', next: 'ewan' },
      shift: { speaker: 'narrator', text: 'A rank of miners in Deepworks leathers, the lamps on their caps gone out: Magda’s diggers, who went down the Lode on her wages and never came up. Every hand is closed round a wet, bright coin.', next: 'ewan' },
      ewan: {
        speaker: 'narrator', text: 'At the front stands old Ewan Haskins, who carried a month of her wages and went quiet. He is still very polite. He holds his coin out to you, as if you are the one who is owed.',
        choices: [
          { text: '(Take his coin, and pay him properly, in Embershards, out of your own purse.)', to: 'pay' },
          { text: '[Iron] (Take the coins one by one, and count them out loud, the way Gussie counts heads.)', to: 'tally', school: 'iron' },
        ],
      },
      dark: { speaker: 'narrator', text: 'A rank of miners in Deepworks leathers, the lamps on their caps gone out, each with a fist closed round a wet, bright coin. When you reach for the first coin, the whole rank closes its fists at once and steps back half a pace.', next: 'dark2' },
      dark2: { speaker: 'narrator', text: 'Of course. Nobody in the Deepworks is paid in the dark, by a stranger, mid-shift. Pay comes through a lit window at the end of the shift, with the tally read out. Anything else is Magda’s kind of money.', next: null },
      waiting: { speaker: 'narrator', text: 'Magda’s hollow miners, fists closed, waiting for the pay-window to open.', next: null },
      tally: { speaker: 'narrator', text: 'One. Two. Three. Somewhere round about forty, the miners start counting with you, under their breath, the way the shift always does.', next: 'pay' },
      pay: { speaker: 'narrator', text: 'One by one you take the hollow coins off them and put real money into their palms, warm from your purse. Each of them closes a hand on it, and frowns, and looks at it properly, and wakes.', next: 'wage' },
      wage: { speaker: 'narrator', mood: 'happy', text: '“That’s a fair wage, that is,” says Ewan Haskins, weighing it. “First one in thirty years.” He looks round at the Heart. “Is it still the night shift?”', next: null },
      paid: { speaker: 'narrator', text: 'A heap of bright coins on the ground of the Legion camp, drying out, going dull.', next: null },
    },
  },
  // ---------- One Winter Coat (an Act I loose end: Penny's other ledger)
  {
    id: 'dialogue:juggernaut-penny-heart', name: 'One Winter Coat: Penny at the Heart', scope: 'party',
    entries: [
      { when: { all: [stage('quest:juggernaut-one-winter-coat', 'tell'), { flag: 'juggernaut.nemesis_fate', value: 'spared' }] }, node: 'cried' },
      { when: stage('quest:juggernaut-one-winter-coat', 'tell'), node: 'left' },
      { when: stage('quest:juggernaut-one-winter-coat', 'penny'), node: 'arrive' },
      { node: 'luggage' },
    ],
    nodes: {
      arrive: { speaker: PG, mood: 'afraid', text: '(Penny Grist is sitting on her luggage at the Heart camp, very small and very neat, with a tin on her knees.) I walked. Through the gate. Through Concordia. I’ve never been past the second whistle-post in my life. Don’t tell the auditors.', next: 'day' },
      day: { speaker: PG, text: 'I said I’d show you the page from C. 1020 one day. I think it’s today. I think it has to be. (She opens the ledger and turns it round for you.)', next: 'page' },
      page: { speaker: 'narrator', text: 'In tiny, careful writing: C. 1020. M. Ruhl, aged 11, one winter coat. Forgiven.', next: 'tin' },
      tin: {
        speaker: PG, mood: 'sad', text: 'Her mam still owed it in the store’s book, so the auditors wouldn’t ask. She paid a penny a week for nine years, and I never once wrote it down. It’s all in this tin. Will you take it to her? Wherever she is now?',
        choices: [{ text: 'I’ll take it to her, Penny.', to: 'go', quest: true }],
      },
      go: { speaker: PG, text: 'Thank you. I can’t do stairs. Not twelve of them. Not those ones.', next: null },
      cried: { speaker: PG, mood: 'sad', text: 'She cried? Magda Ruhl? (Penny takes out her pencil, very slowly, and opens the ledger at C. 1020.) Then I think the account is settled. I think it was settled a long time ago, and nobody told her.', next: 'paid' },
      left: { speaker: PG, mood: 'sad', text: 'You left it where somebody will read it. Good. That’s what a ledger is for, in the end. Somebody reading it. (She takes out her pencil and opens the ledger at C. 1020.)', next: 'paid' },
      paid: {
        speaker: 'narrator', text: 'Under “one winter coat. Forgiven.”, in the same tiny, careful hand, she writes two more words, and blots them, and shows you.',
        choices: [{ text: '(Read it.)', to: 'full' }],
      },
      full: { speaker: PG, mood: 'happy', text: '“Paid in full.” (She shuts the book.) There. Now I can do stairs. Not those ones. But I can do the ones at home.', effects: [{ setFlag: 'juggernaut.coat_paid', value: true }], next: null },
      luggage: { speaker: PG, text: 'I’m going to sit right here on my luggage until somebody tells me it’s time to go home.', next: null },
    },
  },
  {
    id: 'dialogue:obj-juggernaut-cold-furnace', name: 'One Winter Coat: the cold furnace', scope: 'party',
    entries: [
      { when: { all: [stage('quest:juggernaut-one-winter-coat', 'magda'), { flag: 'juggernaut.nemesis_fate', value: 'spared' }] }, node: 'magda' },
      { when: stage('quest:juggernaut-one-winter-coat', 'magda'), node: 'cold' },
      { node: 'plain' },
    ],
    nodes: {
      magda: { speaker: 'narrator', text: 'Magda Ruhl is sitting on the top step beside the Chimera’s cold furnace, her apron off, under nobody’s guard but her own. You give her Penny’s page, and Penny’s tin.', next: 'magda2' },
      magda2: { speaker: MR, text: '(She reads it three times.) Forgiven. C. 1020. Nine years Mam paid on that coat. Nine years I watched her do it. (She opens the tin. It is full of pennies.) She never owed it. She never owed any of it.', next: 'magda3' },
      magda3: { speaker: 'narrator', mood: 'sad', text: 'And Magda Ruhl, whose coins wept and whose eyes never did, puts her face in her scorched hands and cries like an eleven-year-old in a new winter coat.', next: null },
      cold: { speaker: 'narrator', text: 'The Chimera’s furnace stands cold at the top of the stairs, its door hanging open, the last coins rusting on the grate. You lay Penny’s page inside, and the tin of pennies beside it.', next: 'cold2' },
      cold2: { speaker: 'narrator', mood: 'sad', text: 'M. Ruhl, aged 11, one winter coat. Forgiven. The furnace does not light. You did not expect it to. You leave the page there anyway, where somebody will read it.', next: null },
      plain: { speaker: 'narrator', text: 'The Chimera’s furnace, cold at the top of the Twelve Stairs.', next: null },
    },
  },
];

export default dialogues;
