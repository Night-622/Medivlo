/**
 * Hollow Crown, CORSAIR Act I depth pass (10-campaign-style.md §8, docs/PACING.md): the new stages' scenes,
 * investigation clues, travel banter, optional finds and the third parts of the side quests. Captain Nobody's name
 * is found in the I-6 fight itself (hc-corsair-act1.ts); nothing here repeats that beat. Wave 2 (Act II class thread and
 * Act III sides) is appended at the end: the Bog Market, Peregrine, Rosie's escort to the cart-head, the pattern-book,
 * the reply to Dot, the IOU's witness, the flagship's papers and Wen's bell. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const offer = (q: Q, text: string, to: string): DialogueChoice => ({ text, to, quest: true, when: fresh(q), effects: [{ startQuest: q }] });
/** a stage scene that takes over an NPC's talk must still let them give their own quests */
const more = (...offers: DialogueChoice[]): DialogueChoice[] => [...offers, { text: 'Thank you.', to: null }];
const DB = 'npc:dot-brine' as const, MT = 'npc:merrin-tusk' as const, BQ = 'npc:barnaby-quill' as const;

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

const dialogues: DialogueDef[] = [
  // ======================= I-1 The Bell over the Water: casting off, the hold
  {
    id: 'dialogue:area-corsair-market-planks', name: 'I-1 banter: along the market planks', bark: true,
    entries: [{ when: stage('quest:corsair-the-bell-over-the-water', 'lines'), node: 'b' }],
    nodes: { b: { speaker: DB, text: '(From the wheel, in a whisper that carries across three ships.) Bow line first! Then the stern! And if the third one won’t come, cut it, I tied it in a temper and I’m not proud.', next: null } },
  },
  clue('corsair-mooring-line-1', 'I-1 the bow line', stage('quest:corsair-the-bell-over-the-water', 'lines'),
    'The bow line, made fast to the next ship along, the Pickled Herring, whose captain is standing on her deck in her nightgown staring at the sky. “Did you hear that?” she says. “Every bell in the market.” You cast off. She does not notice.', 'corsair.line_1',
    'A bollard on the Brine Market planks.'),
  clue('corsair-mooring-line-2', 'I-1 the stern line', stage('quest:corsair-the-bell-over-the-water', 'lines'),
    'The stern line, round a bollard where an old diver sits with his feet in the water, humming the same note as the pearls. He does not look up. He is still humming when the line slaps into the sea.', 'corsair.line_2',
    'A bollard, and a diver who hums.'),
  clue('corsair-mooring-line-3', 'I-1 the line tied in a temper', stage('quest:corsair-the-bell-over-the-water', 'lines'),
    'The line Dot tied in a temper, a knot nobody alive could untie, round a post with a creditor’s notice nailed to it. You cut it. The notice, you cannot help seeing, is the fourteenth one on that post.', 'corsair.lines_cast',
    'A post on the planks, thick with creditors’ notices.'),
  {
    id: 'dialogue:obj-corsair-hold-pearls', name: 'I-1 the pearls in the hold', scope: 'party',
    entries: [{ when: stage('quest:corsair-the-bell-over-the-water', 'hold'), node: 'hold' }, { node: 'plain' }],
    nodes: {
      hold: { speaker: 'narrator', text: 'The Overdraft’s hold is low and smells of tar and oranges. In a sea-chest that Dot swears is full of rope there are black pearls, dozens of them, humming one note in the dark: the same note as the thing under your ribs.', next: 'dot' },
      dot: {
        speaker: DB, text: '(Coming down the ladder backwards.) Yes, all right, they’re pearls. I didn’t buy them and I didn’t sell them. I’ve been sitting on them because nobody could tell me whose they were.',
        choices: [
          { text: 'Whose are they?', to: 'whose' },
          { text: 'Why are they humming my note?', to: 'note' },
          { text: '(Weigh one in your hand the way a fence would.)', to: 'weigh', school: 'guile' },
        ],
      },
      whose: { speaker: DB, mood: 'sad', text: 'Somebody’s tears, sweetheart. Black tears that came through the Pawned Gate and went hard in the sea. The divers bring them up and the market sells them, and whoever wept them never gets them back.', next: 'hush' },
      note: { speaker: DB, text: 'Because they’re crying about the same thing, I expect. Same as your stone. Everything in Tidecourt is crying about the same thing, and nobody will say what it is.', next: 'hush' },
      weigh: { speaker: 'narrator', text: 'Heavier than a pearl ought to be, and cold, and it fits your palm as if it were made to be held. A fence would give you a silver crown for it. You put it back.', next: 'hush' },
      hush: { speaker: 'narrator', text: 'As you watch, the humming stops, one pearl at a time, until the hold is quiet and only your chest is still singing.', next: 'plan' },
      plan: { speaker: DB, text: 'Right. Tomorrow, a small matter of renegotiation. I have creditors. I have quite a lot of creditors. Sleep under the jolly-boat, where nobody can find you, and don’t touch the oranges.', next: null },
      plain: { speaker: 'narrator', text: 'The Overdraft’s hold, smelling of tar and oranges. The sea-chest is locked.', next: null },
    },
  },

  // ======================= I-4 The Pearl Admiral: the creditors he paid
  clue('corsair-paid-creditor-1', 'I-4 a paid creditor (1)', stage('quest:corsair-the-pearl-admiral', 'paid'),
    'The sailmaker from behind the herring barrel, counting a purse of black pearls. “Paid,” he says, dazed. “Every sail, and the lie. A man in white came round, paid in pearls, smiled, and asked after my wife by name.”', 'corsair.paid_1',
    'The sailmaker’s stall, busier than it was.'),
  clue('corsair-paid-creditor-2', 'I-4 a paid creditor (2)', stage('quest:corsair-the-pearl-admiral', 'paid'),
    'A chandler shutting up early. “Paid. Thirty years of Dot’s candles.” She looks at the pearls in her hand and does not put them away. “They’re warm,” she says. “Pearls shouldn’t be warm.”', 'corsair.paid_2',
    'A chandler’s stall with its shutters down.'),
  clue('corsair-paid-creditor-3', 'I-4 a paid creditor (3)', stage('quest:corsair-the-pearl-admiral', 'paid'),
    'The creditor with the lantern from Bell night, sitting on a bollard with his six hired friends nowhere to be seen. “He paid me,” he says. “No interest, he said. I watched his earring when he said it. I could swear it got bigger.”', 'corsair.earring_seen',
    'A bollard where a creditor used to sit.'),

  // ======================= I-5 The Pearl Charter: canvassing the oldest hands
  {
    id: 'dialogue:corsair-tusk-canvass', name: 'I-5 Tusk on the charter', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: MT, text: 'The charter? (He taps his tricorne.) I’ll tell you what I think, from under a hat that’s hung on a gibbet. Every captain on this reef has been poor. Not one of us has been owned. There’s a difference, and you feel it in the mornings.',
        choices: [
          { text: 'But the charter pays.', to: 'pays' },
          { text: 'And the King’s marque?', to: 'marque' },
        ],
      },
      pays: { speaker: MT, text: 'It pays. So does a cage, if you’re a parrot. Regular meals, very fine view. (He shrugs.) I’ve a crew to feed, mind. I might sign. I’d hate myself by Tuesday.', next: 'end' },
      marque: { speaker: MT, mood: 'angry', text: 'A King’s commission. A privateer is just a pirate with a landlord. Still, at least you choose who to rob, which is more than most landlords allow.', next: 'end' },
      end: { speaker: MT, text: 'Speak your piece at the moot. They’ll listen. You hum, and I’m told it’s catching.', choices: more(offer('quest:corsair-the-hat-on-the-gibbet', 'Where is your hat, Captain?', 'hat')) },
      hat: { speaker: MT, text: 'Gone! A week to memorial night and stolen off the gibbet in broad daylight. I put it up early, to save everybody the trouble. The Thief Crows on the reef have been taking hats all month. Get it back for me.', next: null },
    },
  },
  {
    id: 'dialogue:corsair-quill-canvass', name: 'I-5 Quill on the charter', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: BQ, text: '(He doesn’t look up from his net.) Dot sent you to ask me? No. You came by yourself. Good. Dot never asks me anything. She owes me too much.',
        choices: [
          { text: 'How would you vote?', to: 'vote' },
          { text: 'What do you owe the Fleet?', to: 'owe' },
        ],
      },
      vote: { speaker: BQ, text: 'I lost a leg pulling her out of the sea, and nobody paid me for it, and I wouldn’t have taken it if they had. That’s a free captain’s vote: something you wouldn’t take money for. Find one of those and you’ll know.', next: 'end' },
      owe: { speaker: BQ, mood: 'sad', text: 'Everything. The Fleet took me in at nine, off the wharf, the same as it might have taken your Admiral. He was on the wharf when I was. A skinny boy with no name. I gave him half my bread once.', next: 'end' },
      end: { speaker: BQ, text: 'Go on. Say something they’ll remember. And tell Dot she can stop owing me. She won’t, but tell her.', next: null },
    },
  },

  // ======================= I-7 What the Admiral Sells: inside the grief-ration huts
  clue('corsair-ration-hut-1', 'I-7 a grief-ration hut (1)', stage('quest:corsair-what-the-admiral-sells', 'rations'),
    'In the first hut an old woman weeps steadily into a bowl, the way you might shell peas. A slate on the wall gives her ration: two pearls a day, one supper. “If I weep three,” she says, “I get pudding.”', 'corsair.ration_1',
    'A hut on the Crow Islands, its slate wiped clean.'),
  clue('corsair-ration-hut-2', 'I-7 a grief-ration hut (2)', stage('quest:corsair-what-the-admiral-sells', 'rations'),
    'A young man asleep across the doorway of the second hut with the bowl under his chin and a pearl in it. He has been weeping in his sleep. On his slate somebody has written: “Good weeper. Do not wake.”', 'corsair.ration_2',
    'A hut doorway on the Crow Islands.'),
  clue('corsair-ration-hut-3', 'I-7 a grief-ration hut (3)', stage('quest:corsair-what-the-admiral-sells', 'rations'),
    'In the last hut the ration ledger is nailed to the wall: names, pearls, suppers. At the top, in neat white ink: “Grief must be fresh. Do not let them heal. Keep them fed, keep them sad, keep them here. S.”', 'corsair.ration_ledger',
    'A nail in a hut wall where a ledger used to hang.'),

  // ======================= I-9 Dot’s Reckoning: the Last Bell at the channel mouth
  {
    id: 'dialogue:area-corsair-channel-mouth', name: 'I-9 banter: the channel mouth', bark: true,
    entries: [{ when: stage('quest:corsair-dots-reckoning', 'buoy'), node: 'b' }],
    nodes: { b: { speaker: DB, text: 'Steady. Steady. (She is steering with one hand and holding her hat on with the other.) That’s the Last Bell, sweetheart. My mother rang it. Nobody’s rung it since. Don’t you dare go past it quiet.', next: null } },
  },
  {
    id: 'dialogue:obj-corsair-last-bell', name: 'I-9 the Last Bell', scope: 'party',
    entries: [{ when: stage('quest:corsair-dots-reckoning', 'buoy'), node: 'buoy' }, { node: 'plain' }],
    nodes: {
      buoy: { speaker: 'narrator', text: 'At the mouth of the channel the old bell-buoy rocks on the swell: the Last Bell, which every free captain leaving Gallows Reef rings once, so the reef knows who has gone. Its rim is scratched all over with captains’ marks.', next: 'mark' },
      mark: {
        speaker: 'narrator', text: 'The newest mark is thirty years old, a little anchor with an A through it. Dot, at the wheel, is not looking at it very hard.',
        choices: [
          { text: '(Ring it once, and scratch your mark beside hers.)', to: 'ring', effects: [{ unlockLore: 'lore:hc-corsair-last-bell' }] },
          { text: '(Ring it twice: once for you, once for Dot, who never leaves.)', to: 'twice', school: 'guile', effects: [{ unlockLore: 'lore:hc-corsair-last-bell' }] },
        ],
      },
      ring: { speaker: 'narrator', text: 'One clear note goes back over the water to the reef. Behind you, very faintly, the Brine Market answers: a hundred ships’ bells, ringing once, the way they did on Bell night.', next: null },
      twice: { speaker: 'narrator', text: 'Two notes. Dot pretends not to have heard, wipes her face with her sleeve, and says the spray is very bad tonight.', next: null },
      plain: { speaker: 'narrator', text: 'The Last Bell at the channel mouth, with a new mark on its rim.', next: null },
    },
  },

  // ======================= Side: Everything Must Go (the last plank)
  {
    id: 'dialogue:obj-corsair-overdraft-patch', name: 'Everything Must Go: the last plank', scope: 'party',
    entries: [{ when: stage('quest:corsair-everything-must-go', 'plank'), node: 'fit' }, { node: 'plain' }],
    nodes: {
      fit: { speaker: 'narrator', text: 'There is a gap in the Overdraft’s starboard rail, one board wide, that has been there as long as anybody can remember. Sal’s plank goes into it as if it had been cut for it, which, it turns out, it was.', next: 'dot' },
      dot: {
        speaker: DB, text: '(She runs her thumb along the new board, and stops.) That’s off the Underpaid. My mother’s ship. Sal’s mother bought her for salvage when she came home a wreck, and I never asked what became of her.',
        choices: [
          { text: 'Sal wanted it to keep sailing.', to: 'sail' },
          { text: 'Sal’s throwing it in for nothing. Don’t tell anyone.', to: 'free', school: 'guile' },
        ],
      },
      sail: { speaker: DB, mood: 'sad', text: 'Well, it will. (She pats it, twice.) Tell Sal she can have free passage on the Overdraft whenever she likes. Tell her I’ll even pay her, one day. Probably.', next: null },
      free: { speaker: DB, mood: 'happy', text: 'For nothing? On Gallows Reef? (She laughs until Interest joins in.) That’s the most scandalous thing I’ve heard all year. I’ll take it to my grave. Now go and buy her a drink before she sells the barrel.', next: null },
      plain: { speaker: 'narrator', text: 'The Overdraft’s starboard rail, whole for the first time in thirty years.', next: null },
    },
  },

  // ======================= ACT II, C-1 The Smugglers of Lanternford: the Bog Market’s pearl scales
  {
    id: 'dialogue:obj-corsair-bog-scales', name: 'C-1 the pearl scales in the Bog Market', scope: 'party',
    entries: [{ when: stage('quest:corsair-lanternford', 'market'), node: 'scales' }, { node: 'plain' }],
    nodes: {
      scales: { speaker: 'narrator', text: 'The Bog Market is a ring of punts lashed together on the black water. In the middle of it an old Tidecourt fish-scale, brass pans and all, is weighing black pearls by the pound, and the woman working it calls them like sprats: “Tears, fresh tears, two shards the pound!”', next: 'buyer' },
      buyer: {
        speaker: 'narrator', text: 'A marsh-farmer tips in a sack of them, raked from the lee of the Guile arch. She weighs them, gives him two shards and a fish for luck, and nobody asks whose they were. It is that sort of market.',
        choices: [
          { text: 'Whose tears are these?', to: 'whose' },
          { text: '(Put your thumb on the pan, the way every fishwife on Gallows Reef does, and see if she notices.)', to: 'thumb', school: 'guile' },
        ],
      },
      whose: { speaker: 'narrator', text: '“Whose?” She laughs. “Pearls don’t have names, love. That’s what makes them money.” But she wipes her hands on her apron afterwards, twice.', next: 'hum' },
      thumb: { speaker: 'narrator', text: 'She notices at once and slaps your hand with a sprat. “Gallows Reef,” she says, delighted. “Only a Brine Fleet thumb sits that heavy.” Then, lower: “The good ones come through Pell. He gets them off a white boat.”', next: 'hum' },
      hum: { speaker: 'narrator', text: 'Under the pans, where the spilt ones roll, the pearls hum one low note, the same as the stone at your belt. Nobody in the Bog Market seems to hear it.', effects: [{ setFlag: 'corsair.bog_scales', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The Bog Market’s brass fish-scale, its pans empty for once.', next: null },
    },
  },

  // ======================= ACT II, C-3 The Lantern Queen: telling Peregrine
  {
    id: 'dialogue:corsair-peregrine-queen', name: 'C-3 Peregrine hears the Queen’s lights are out', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:peregrine-tolley', text: '(He is standing in the shop door with a lantern in each hand, staring at a marsh gone entirely dark.) Every one of them, all at once. First I thought I’d gone blind. Then I thought I’d gone bankrupt.', next: 'tell' },
      tell: {
        speaker: 'npc:peregrine-tolley', text: '(You tell him: the drowned lights, the honest centuries, the last lantern.) She asked whether anyone would need a light across the marsh again? (He looks at the lantern in his left hand, the one labelled NEARLY HOME.)',
        choices: [
          { text: 'Someone will. Hang honest ones on her posts.', to: 'honest', effects: [{ setFlag: 'corsair.honest_lights', value: 'honest' }] },
          { text: 'Her route’s going spare. A man could charge a fair toll on it.', to: 'toll', school: 'guile', effects: [{ setFlag: 'corsair.honest_lights', value: 'toll' }] },
          { text: 'She went out well. I thought you’d want to know.', to: 'well', trust: 1 },
        ],
      },
      honest: { speaker: 'npc:peregrine-tolley', text: 'Honest ones. On a marsh. (He puts down NEARLY HOME and picks up a plain tin lantern with no label at all.) I’ve only ever sold HOME to people who paid extra. I suppose I’ll have to start labelling them HONEST.', next: 'end' },
      toll: { speaker: 'npc:peregrine-tolley', text: 'A fair toll. (He thinks.) Not a memory. A story, told at the post, and the light’s yours. She’d have liked that. Hester will call it robbery.', next: 'end' },
      well: { speaker: 'npc:peregrine-tolley', mood: 'sad', text: '(He takes his cap off.) A thousand years of honest prices and thirty bad ones. I’ve known worse traders. I’ve been worse traders.', next: 'end' },
      end: { speaker: 'npc:peregrine-tolley', text: 'Go on, then. The bargemen say the Admiral’s pearls have started going up the gold-silt to Gildport instead of stopping here. Whatever he’s selling, he’s found a bigger customer.', next: null },
    },
  },

  // ======================= ACT II, C-4 The Admiral’s Cargo: Rosie at the cart-head
  {
    id: 'dialogue:corsair-rosie-chute', name: 'C-4 Rosie at the cart-head', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:rosie-mossop', text: '(She stands at the cart-head, where the full carts tip into a chute that goes down under the gold.) Listen. Hear that? That isn’t machinery. Machinery doesn’t breathe.', next: 'see' },
      see: {
        speaker: 'npc:rosie-mossop', mood: 'afraid', text: 'Every cart goes over the edge and the whole hill goes warm, like a stove when you feed it. And look: a white flag on the last cart, and two grey tailors going down beside it with a measuring-tape between them.',
        choices: [
          { text: 'He’s feeding it tears. I’m going down.', to: 'down', quest: true },
          { text: 'You came further than any docker ever has. Thank you.', to: 'thanks', trust: 1 },
          { text: 'Who signs for the cargo at the bottom?', to: 'sign', school: 'guile' },
        ],
      },
      thanks: { speaker: 'npc:rosie-mossop', text: 'Further than I meant to, and my knees will tell me so tomorrow. (She sniffs.) Don’t tell the gang I held your sleeve.', next: 'down' },
      sign: { speaker: 'npc:rosie-mossop', text: 'Nobody. That’s what I can’t stand. Every load I ever shifted, somebody signed for at the far end. This lot just goes down, and nothing comes back up but warm air.', next: 'down' },
      down: { speaker: 'npc:rosie-mossop', text: 'Then go down after it and stop it, whatever it is. I’ll be back at the Row, telling the gang to put their gloves down. Slowly. Nobody downs tools in a hurry.', next: null },
    },
  },

  // ======================= ACT II, C-5 The Gilded Engine: the tailors’ pattern-book
  clue('corsair-engine-pattern-book', 'C-5 the tailors’ pattern-book', stage('quest:corsair-the-gilded-engine', 'fitting'),
    'A tailor’s pattern-book, ruled for the Legion’s binders. The last order is in a neat grey hand: “Saltmarsh, merchant, to be fitted as the heart of the Union. Chest, forty-four. Neck, sixteen. Heart, to be taken in at the Heart.”', 'corsair.engine_pattern',
    'The Engine’s cold anvil, chalked like a tailor’s board.',
    'Under it is a line for the name to be engraved on his plate, and a note beside the blank: “Sitter declines to give one. Says the one he has was bought, and he would not want it on anything permanent.”'),

  // ======================= ACT II, C-6 A Bottle from Dot: the reply
  {
    id: 'dialogue:obj-corsair-reply-bottle', name: 'C-6 a reply to Dot', scope: 'party',
    entries: [
      { when: { all: [stage('quest:corsair-a-bottle-from-dot', 'reply'), { flag: 'corsair.interest_pet' }] }, node: 'parrot' },
      { when: stage('quest:corsair-a-bottle-from-dot', 'reply'), node: 'bottle' },
      { node: 'plain' },
    ],
    nodes: {
      parrot: { speaker: 'narrator', text: 'Interest is sitting on the Guile arch with his feathers fluffed out, waiting, the way a creditor waits. When you take out a pencil he says “PAY UP” with enormous satisfaction.', next: 'write' },
      bottle: { speaker: 'narrator', text: 'Dot’s green bottle is still lying in the lee of the Guile arch among the pearls, its cork beside it. Hester says things go home from here the way they came. Nobody knows how. Everybody uses it.', next: 'write' },
      write: {
        speaker: 'narrator', text: 'You have a stub of pencil and the last blank inch of Dot’s IOU. What do you send home?',
        choices: [
          { text: '“Paid the Queen’s toll, stopped a gold engine, owe nobody anything. Feeling unwell. Love back.”', to: 'sent', effects: [{ setFlag: 'corsair.reply', value: 'unwell' }] },
          { text: '“Tell Quill his half-loaf was the only thing the Admiral never paid for.”', to: 'sent', when: { flag: 'corsair.nobodys_name' }, effects: [{ setFlag: 'corsair.reply', value: 'quill' }] },
          { text: '(Write nothing. Fold the IOU into a paper boat the shape of the Overdraft, and send that.)', to: 'sent', school: 'guile', effects: [{ setFlag: 'corsair.reply', value: 'boat' }] },
        ],
      },
      sent: { speaker: 'narrator', text: 'Whatever carries it home goes through the stone without a sound. For a moment the pearls in the lee of the arch stop humming, as if listening, and from very far off you could swear a bell on Gallows Reef rings once.', next: null },
      plain: { speaker: 'narrator', text: 'The lee of the Guile arch, where black pearls lie like gravel.', next: null },
    },
  },

  // ======================= ACT III, Dot’s IOU: a Fleet captain’s mark
  {
    id: 'dialogue:obj-corsair-legion-captain', name: 'Dot’s IOU: a Fleet captain witnesses', scope: 'party',
    entries: [
      { when: { all: [stage('quest:corsair-dots-iou', 'witness'), { flag: 'corsair.charter', op: '==', value: 'signed' }] }, node: 'signed' },
      { when: stage('quest:corsair-dots-iou', 'witness'), node: 'find' },
      { node: 'plain' },
    ],
    nodes: {
      signed: { speaker: 'narrator', mood: 'sad', text: 'At the back of the Legion’s ranks stands a whole row of Tidecourt hats: the free captains who signed the Admiral’s charter at the moot, white as his sails, pearls crusted on their cuffs. They carried his cargo all the way here.', next: 'mark' },
      find: { speaker: 'narrator', text: 'At the back of the Legion’s ranks stands one battered Tidecourt hat with a little anchor pinned in its band: an old free captain of the Brine Fleet, hollow, who followed the pearls through the Pawned Gate and kept walking.', next: 'mark' },
      mark: {
        speaker: 'narrator', text: 'You hold out Dot’s IOU and a pencil. The captain cannot read it and cannot hold a pencil. But the hand comes up on its own, slow as a tide, the way a sailor’s hand goes to a rope.',
        choices: [
          { text: '(Wait. A free captain signs in their own time.)', to: 'wait' },
          { text: '(Steady the hand, the way Dot steadied yours on your first splice.)', to: 'steady', school: 'guile' },
        ],
      },
      wait: { speaker: 'narrator', text: 'It takes a long time. When it is done there is a little anchor beside Dot’s name, shaky and unmistakable, and the captain’s eyes are wet. Hollow people do not weep. This one is trying.', effects: [{ setFlag: 'corsair.iou_witnessed', value: true }], next: null },
      steady: { speaker: 'narrator', text: 'Together you draw the Fleet’s mark beside Dot’s name. Under your fingers the cold hand grips back once, hard, the way a captain grips the mate who has come to fetch them home.', effects: [{ setFlag: 'corsair.iou_witnessed', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The back of the Legion’s ranks, where the Tidecourt hats stand.', next: null },
    },
  },

  // ======================= ACT III, The White Flagship: the Admiral’s cabin, the crew’s papers
  {
    id: 'dialogue:obj-corsair-flagship-cabin', name: 'The White Flagship: the Admiral’s cabin', scope: 'party',
    entries: [{ when: stage('quest:corsair-the-white-flagship', 'cabin'), node: 'cabin' }, { node: 'plain' }],
    nodes: {
      cabin: { speaker: 'narrator', text: 'The Admiral’s cabin is spotless and smells so strongly of lavender that your eyes water. One wall is all pigeonholes, and in each is a bill of sale tied with white ribbon: “Bought, one deckhand, with his debts, eleven crowns. Paid promptly. S.”', next: 'case' },
      case: {
        speaker: 'narrator', text: 'On the desk, under a glass bell where another man might keep a ship in a bottle, sits half a loaf of bread gone hard as driftwood. The label is in a boy’s careful capitals: “GIVEN, NOT SOLD. B. Q.”',
        choices: [
          { text: '(Take the bills of sale. All of them.)', to: 'take' },
          { text: '(Take the bills, and the bread. Quill will want to know it was kept.)', to: 'bread', school: 'guile', effects: [{ setFlag: 'corsair.flagship_bread', value: true }] },
        ],
      },
      take: { speaker: 'narrator', text: 'Forty-one bills of sale, a stack as thick as a ship’s log. Every man on that deck had a price, and the Admiral paid each one on the day he bought him.', effects: [{ setFlag: 'corsair.flagship_papers', value: true }], next: null },
      bread: { speaker: 'narrator', text: 'You wrap the half-loaf in your scarf. It weighs almost nothing. It is the only thing in the cabin he never bought, and he kept it under glass for forty years.', effects: [{ setFlag: 'corsair.flagship_papers', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The Admiral’s cabin, its pigeonholes empty.', next: null },
    },
  },
  {
    id: 'dialogue:obj-corsair-flagship-crew', name: 'The White Flagship: the crew’s papers', scope: 'party',
    entries: [{ when: stage('quest:corsair-the-white-flagship', 'crew'), node: 'crew' }, { node: 'plain' }],
    nodes: {
      crew: {
        speaker: 'narrator', text: 'The flagship’s crew stand at the back of the Legion in a neat white row, still in step, waiting for an order. Every one of them is somebody’s bill of sale.',
        choices: [
          { text: '(Hand each man his own bill, and read his name off it.)', to: 'names' },
          { text: '(Tear the whole stack in half in front of them.)', to: 'tear' },
          { text: '(Read them Article One: no free captain may be bought, nor sold, nor sell another.)', to: 'article', school: 'guile' },
        ],
      },
      names: { speaker: 'narrator', text: 'It takes the best part of an hour, forty-one names one at a time. By the twentieth the men are turning to look at each other. By the last, a boy at the end of the row is laughing and crying at once, holding his paper as if it might blow away.', next: 'end' },
      tear: { speaker: 'narrator', text: 'The paper tears with a sound like a sail splitting. The white row flinches all together, and then, one by one, they step out of the ranks and sit down in the mud, the way men sit at the end of a very long contract.', next: 'end' },
      article: { speaker: 'narrator', text: 'You read it loud, the way Dot reads it, hat in hand. Some of them know it: their mouths move with yours on “nor sell another”, and when you finish they let their hands fall, as if a bosun had called the end of the watch.', next: 'end' },
      end: { speaker: 'narrator', text: 'Behind them the Legion closes ranks, forty-one men shorter. Nobody has ever been bought back out of the Heart before. It sets a precedent.', effects: [{ setFlag: 'corsair.crew_freed', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'A gap at the back of the Legion’s ranks where a white row used to stand.', next: null },
    },
  },

  // ======================= ACT III, Nobody’s Name: the Merry Widow, Wen’s bell
  {
    id: 'dialogue:obj-corsair-widow-heart', name: 'Nobody’s Name: the Merry Widow under the Wall', scope: 'party',
    entries: [{ when: stage('quest:corsair-nobodys-name', 'widow'), node: 'widow' }, { node: 'plain' }],
    nodes: {
      widow: { speaker: 'narrator', text: 'The Merry Widow rides the black water under the Weeping Wall with nobody at her wheel, her rigging still dripping. In the forecastle the crew list is nailed up where it always was: forty names, crossed out and written in again, over and over.', next: 'list' },
      list: {
        speaker: 'narrator', text: 'But the crossing-out has stopped. Every name stands now, written once, plainly. And below them, at the foot of the list, in the same careful hand, is a name that was never crossed out at all: “Master: Wen. Wenlock. Ours.”',
        choices: [
          { text: '(Unship the bell and carry it ashore.)', to: 'bell' },
          { text: '(Sign the crew list under his name, in your Fleet hand: “Read and witnessed.”)', to: 'sign', school: 'guile' },
        ],
      },
      sign: { speaker: 'narrator', text: 'You sign it with a flourish, the way a free captain signs a ship’s papers. It seems the proper thing to do to a document that has been argued over for forty years. Then you unship the bell.', next: 'bell' },
      bell: { speaker: 'narrator', text: 'The Widow’s bell comes away in your hands, green with the sea and light for its size. Round the rim the sailors’ scratching still reads: “Wen’s bell. Ring it twice for supper.”', effects: [{ setFlag: 'corsair.widow_bell', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The Merry Widow, riding empty under the Weeping Wall, her bell-hook bare.', next: null },
    },
  },
  {
    id: 'dialogue:obj-corsair-camp-bell', name: 'Nobody’s Name: ringing Wen’s bell', scope: 'party',
    entries: [{ when: stage('quest:corsair-nobodys-name', 'bell'), node: 'hang' }, { node: 'plain' }],
    nodes: {
      hang: {
        speaker: 'narrator', text: 'You hang the Merry Widow’s bell from the tallest tent-pole at the Heart camp, over the cook-fire, where the bearers sit eating out of their hands. Somebody asks what it’s for.',
        choices: [
          { text: '(Ring it twice, for supper.)', to: 'twice', effects: [{ setFlag: 'corsair.wenlock_rung', value: 'twice' }] },
          { text: '(Ring it twice for Wenlock, and once more for the boy who bought his name.)', to: 'thrice', school: 'guile', effects: [{ setFlag: 'corsair.wenlock_rung', value: 'thrice' }] },
        ],
      },
      twice: { speaker: 'narrator', text: 'Two clear notes over the camp. Every head turns, and the whole camp gets up and comes to the fire, the way a crew does. Somebody puts a bowl in your hands and asks whose bell it is.', next: 'end' },
      thrice: { speaker: 'narrator', text: 'Two notes for supper and one more after, for nobody in particular. The camp comes to the fire. Someone at the back takes off his hat at the third note, and does not say why.', next: 'end' },
      end: { speaker: 'narrator', mood: 'happy', text: '“Wenlock’s,” you say. Somebody repeats it, and somebody else, round the fire, the way a crew passes a name until it sticks. For forty years nobody said it aloud. Tonight a hundred people do, with their mouths full.', next: null },
      plain: { speaker: 'narrator', text: 'The Merry Widow’s bell, hanging over the Heart camp’s cook-fire.', next: null },
    },
  },

  // ======================= Optional areas (Claude 2): finds in the Gallows Reef ruin, cave and viewpoint
  {
    id: 'dialogue:obj-guile-frontier-ruin-find', name: 'Gallows Reef ruin: the keeper’s log', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'In the ruined reef lighthouse, the keeper’s last logbook lies open on the stair. Thirty years of entries in the same three words, one line a night, getting shakier: “Light kept. No ships.” The last one reads: “Light kept. One ship. Not ours.”', effects: [{ unlockLore: 'lore:hc-guile-frontier-ruin' }], next: null } },
  },
  {
    id: 'dialogue:obj-guile-frontier-cave-find', name: 'Gallows Reef cave: the ships’ names', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'The walls of the sea cave are scratched from the tideline to the roof with the names of lost ships, cut by the families who waited for them. The Merry Widow is here, scratched three times by three different hands, the newest no more than a year old.', effects: [{ unlockLore: 'lore:hc-guile-frontier-cave' }], next: null } },
  },
  {
    id: 'dialogue:obj-guile-frontier-cave-codex', name: 'The Widows’ Cave: a bottle in a crack', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'Wedged in a crack above the tideline, a bottle with a note in it, the ink brown with age. “If found, tell my daughter I did not sell it. Tell her I went to buy it back, and the price was more than the Fleet had. A. Brine, of the Underpaid.”', effects: [{ unlockLore: 'lore:hc-guile-frontier-bottle' }], next: null } },
  },
  {
    id: 'dialogue:obj-guile-frontier-view-find', name: 'Gallows Reef viewpoint: the whole reef', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'From the lookout rock the whole of Gallows Reef lies open: the Brine Market swaying, the gibbets with their hats, the coves, the Crow Islands, and far off on the horizon the Pawned Gate’s water-arch, very small, with something gilded moored in it.', effects: [{ unlockLore: 'lore:hc-guile-frontier-view' }], next: null } },
  },
];

export default dialogues;
