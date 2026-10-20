/**
 * Hollow Crown, ARCANIST: Kilnhold people (general talk), the eight side quests, the mentor thread and the
 * bounties, plus the Act II class-thread and featured-bearer scenes. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const offer = (q: Q, text: string, to: string, extra?: NarrativeCondition): DialogueChoice =>
  ({ text, to, quest: true, when: extra ? { all: [fresh(q), extra] } : fresh(q), effects: [{ startQuest: q }] });
const bye: DialogueChoice = { text: 'Farewell.', to: null, tag: 'leave' };
const NIGHT: NarrativeCondition = { hour: [21, 4] };
const TH = 'npc:coalby-thrane' as const;

const dialogues: DialogueDef[] = [
  // ---------- Thrane (general + mentor thread)
  {
    id: 'dialogue:arcanist-thrane', name: 'Thrane (general)',
    entries: [
      { when: { all: [{ questStage: 'quest:arcanist-a-permit-to-burn', stage: 'braziers' }, { not: { flag: 'arcanist.delight.permit' } }] }, node: 'permit' },
      { node: 'start' },
    ],
    nodes: {
      permit: { speaker: TH, text: 'Back already? Is something on fire that shouldn’t be? (He peers at the permit in your hand.) Nobody’s read it closely? Good. Good. Five braziers, then come and tell me what you saw.', effects: [{ setFlag: 'arcanist.delight.permit', value: true }], next: null },
      start: {
        speaker: TH, text: 'Have you eaten? You look like a person who forgets. Sit, if you can find a chair under the paper.',
        choices: [
          offer('quest:arcanist-thranes-equation', 'What is this sum on your desk?', 'sum', { trust: TH, value: 'friendly' }),
          offer('quest:arcanist-puddings-pedigree', 'Where did Pudding come from?', 'pedigree', { all: [{ trust: TH, value: 'trusted' }, { questCompleted: 'quest:arcanist-pudding-gets-out' }] }),
          { text: 'What is the Conclave, really?', to: 'conclave' },
          bye,
        ],
      },
      sum: { speaker: TH, text: 'Thirty years of it. How much the Great Kiln burns, against how much it ought to. The numbers have never matched. I need three readings from the Roots thermometers, if you’re going down.', next: null },
      pedigree: { speaker: TH, mood: 'sad', text: 'Found him as a hatchling in the deep Roots, forty years ago, crying on a coal. I’ve always wondered who he cried for. Follow him, if he’ll take you.', next: null },
      conclave: { speaker: TH, text: 'Forty masters who agree that fire matters and agree on nothing else. We used to argue about what fire was for. Now we only argue about what to burn.', next: 'start' },
    },
  },
  {
    id: 'dialogue:arcanist-thrane-equation', name: 'Mentor: Thrane’s Equation', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: TH, text: 'Read them out. Slowly. Mm. Mm-hm. Carry the ember… Oh. Oh, that’s it. That’s been it all along.', next: 'song' },
      song: {
        speaker: TH, mood: 'happy', text: 'The Kiln was never built to burn wood. The heat doesn’t add up, it never could. For a thousand years it burned the Ash Stone’s song. Thirty years ago the song left, and we have been feeding it furniture ever since.',
        choices: [{ text: 'Then the half-stone could feed it.', to: 'end', insight: 'kiln_song', trust: 1 }],
      },
      end: { speaker: TH, text: 'For a night, at least. Remember that, if they ever ask you what fire is for.', next: null },
    },
  },
  {
    id: 'dialogue:arcanist-thrane-pedigree', name: 'Mentor: Pudding’s Pedigree', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: TH, text: 'His mother? The size of a cottage? And she said… she said thank you for looking after him. Well. Well, I never.', next: 'end' },
      end: { speaker: TH, mood: 'sad', text: 'Forty years I thought I’d stolen him. You’ve given me something I didn’t know I was missing, and I am too old to say so properly. Thank you.', effects: [{ trust: TH, delta: 1 }], next: null },
    },
  },
  {
    id: 'dialogue:arcanist-thrane-pudding', name: 'Side: Pudding returned', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: TH, mood: 'happy', text: 'There you are, you dreadful thing. What did he eat? The permit office’s entire filing for the year? Ha! Oh, that’s the best news I’ve had in a decade.', choices: [{ text: 'Clerk Ashworth is not amused.', to: 'clerk', trust: 1 }] },
      clerk: { speaker: TH, text: 'Clerk Ashworth was born not amused. Here, for your trouble. Don’t tell him where it came from.', next: null },
    },
  },
  {
    id: 'dialogue:arcanist-pudding', name: 'Pudding',
    entries: [{ when: { all: [{ flag: 'arcanist.delight.pudding_met' }, { not: { flag: 'arcanist.delight.pudding_trade' } }] }, node: 'trade' }, { node: 'blorp' }],
    nodes: {
      blorp: { speaker: 'npc:pudding', text: '(Pudding looks up at you, and very slowly eats a corner of your sleeve.)', effects: [{ setFlag: 'arcanist.delight.pudding_met', value: true }], next: null },
      trade: { speaker: 'npc:pudding', text: '(Pudding finishes your sleeve, considers you, and then, with enormous ceremony, coughs up a damp, scorched corner of a Conclave minute and pushes it towards your boot. It seems to be a fair trade.)', effects: [{ setFlag: 'arcanist.delight.pudding_trade', value: true }], next: null },
    },
  },
  // ---------- Provost Morrow (general)
  {
    id: 'dialogue:arcanist-morrow', name: 'Morrow (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ignace-morrow', text: 'Warm today. It is always warm, near me. Did you want something, Arcanist?',
        choices: [
          { text: 'How do you keep the Kiln burning?', to: 'how' },
          { text: 'Why do your eyes look wet?', to: 'eyes', insight: 'arcanist_morrow_eyes', when: { flag: 'arcanist.ignace_met' } },
          bye,
        ],
      },
      how: { speaker: 'npc:ignace-morrow', text: 'Diligence. Sacrifice. A great deal of paperwork. Run along now.', next: null },
      eyes: { speaker: 'npc:ignace-morrow', mood: 'angry', text: 'Smoke. It is the smoke. Everyone in Kilnhold has wet eyes. Run along.', next: null },
    },
  },
  // ---------- Kiln Ward: Pudding Gets Out, the Sweeps' Strike, bounties
  {
    id: 'dialogue:arcanist-ashworth', name: 'Clerk Ashworth (Pudding Gets Out)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:clerk-ashworth', text: 'Form nine for candles. Form ninety for kilns. And there is a slime in my filing.',
        choices: [offer('quest:arcanist-pudding-gets-out', 'A slime? Orange, about so big?', 'slime'), bye],
      },
      slime: { speaker: 'npc:clerk-ashworth', mood: 'angry', text: 'It ate a year of burning permits and left by the window. It belongs to the Magister. Everything inconvenient belongs to the Magister. Retrieve it.', next: null },
    },
  },
  {
    id: 'dialogue:arcanist-dora', name: 'Dora Flue (the Sweeps’ Strike)',
    entries: [
      { when: stage('quest:arcanist-soot-pigeons', 'deliver'), node: 'pigeon' },
      { when: stage('quest:arcanist-the-sweeps-strike', 'cause'), node: 'settle' },
      { node: 'start' },
    ],
    nodes: {
      pigeon: { speaker: 'npc:dora-flue', text: 'A message? From the Conclave? (She reads it.) “Sweeps to resume work or forfeit licence.” Ha. Tell them I said no, in your own words. Politer ones.', next: null },
      start: {
        speaker: 'npc:dora-flue', text: 'Not one brush goes up a weeping chimney. Not one.',
        choices: [offer('quest:arcanist-the-sweeps-strike', 'Why are the sweeps on strike?', 'why'), bye],
      },
      why: { speaker: 'npc:dora-flue', text: 'The chimneys run black. Not soot, tears. My Danny went up one and came down quiet, and he’s stayed quiet. Show me it’s safe, or make it safe, and we go back up.', next: null },
      settle: {
        speaker: 'npc:dora-flue', text: 'Well? Safe, or not?',
        choices: [
          { text: 'Let me burn the flue clean first, top to bottom.', to: 'burn', school: 'ash', effects: [{ setFlag: 'arcanist.sweeps_settled', value: 'burned' }] },
          { text: 'The tears come down with the smoke from the Kiln. Close the dampers when the Kiln roars and they can’t get in.', to: 'proof', insight: 'arcanist_smoke', effects: [{ setFlag: 'arcanist.sweeps_settled', value: 'dampers' }] },
          { text: 'I’m still looking.', to: null },
        ],
      },
      burn: { speaker: 'npc:dora-flue', text: 'You’ll burn every chimney in the Ward clean? Ha! All right. We go back up behind you.', next: null },
      proof: { speaker: 'npc:dora-flue', mood: 'happy', text: 'From the Kiln. I knew it. I knew it wasn’t the chimneys’ fault. Dampers shut when she roars, then. Back up, lads.', next: null },
    },
  },
  {
    id: 'dialogue:arcanist-grisel', name: 'Sergeant Grisel (bounties)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:sergeant-grisel', text: 'Bounties on the board. Read them yourself, I’m busy. Permit?',
        choices: [
          offer('quest:arcanist-bounty-ward-hounds', 'The Magma Hound bounty.', 'hounds'),
          offer('quest:arcanist-bounty-runaway-golem', 'The runaway golem.', 'golem'),
          bye,
        ],
      },
      hounds: { speaker: 'npc:sergeant-grisel', text: 'They come up the Roots at night. Six of them and you get paid. Don’t set the Ward on fire. Again.', next: null },
      golem: { speaker: 'npc:sergeant-grisel', text: 'Sitting on Glassblowers’ Row, melting it. Not the friendly one. The friendly one has a shovel.', next: null },
    },
  },
  // ---------- Glassblowers' Row: the Unbreakable Vase, Apprentice Eyebrows
  {
    id: 'dialogue:arcanist-orsolya', name: 'Orsolya (general, the Unbreakable Vase)',
    entries: [
      { when: stage('quest:arcanist-soot-pigeons', 'deliver'), node: 'pigeon' },
      { when: stage('quest:arcanist-the-unbreakable-vase', 'glaze'), node: 'vase' },
      { node: 'start' },
    ],
    nodes: {
      pigeon: { speaker: 'npc:orsolya-glaze', text: 'A message for me? An order for forty panes for the Provost’s tower. Forty. He must be expecting a great deal of heat. Thank you.', next: null },
      start: {
        speaker: 'npc:orsolya-glaze', text: 'Glass remembers the fire that made it. So do I.',
        choices: [offer('quest:arcanist-the-unbreakable-vase', 'What’s that heap of broken glass?', 'heap'), bye],
      },
      heap: { speaker: 'npc:orsolya-glaze', text: 'A vase for the Velvet King of Tidecourt, ordered in C. 1011, never collected, and I am too proud to stop. It shatters at the note the Bell rang. I need singing sand. The Kiln Golems carry it in their bellies.', next: null },
      vase: {
        speaker: 'npc:orsolya-glaze', text: 'Singing sand! Now hold the note while I blow. Steady…',
        choices: [{ text: 'Hold the fire to the note.', to: 'done', school: 'ash', trust: 1 }, { text: 'Steady.', to: 'done' }],
      },
      done: { speaker: 'npc:orsolya-glaze', mood: 'happy', text: 'It held. Thirty years, and it held. If the Velvet King ever comes for it he can pay double for the wait. Here. Your share.', next: null },
    },
  },
  {
    id: 'dialogue:arcanist-wim', name: 'Prentice Wim (Apprentice Eyebrows)',
    entries: [{ when: stage('quest:arcanist-apprentice-eyebrows', 'judge'), node: 'verdict' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:prentice-wim', text: 'I had eyebrows on Tuesday. Are you entering the contest? You have to enter the contest.',
        choices: [offer('quest:arcanist-apprentice-eyebrows', 'What contest?', 'contest'), bye],
      },
      contest: { speaker: 'npc:prentice-wim', text: 'Fire safety! The bucket, the blanket and the sand. Rule one: don’t. Rule two: if you did, roll. I’m the judge, because I’ve done all the rolling.', next: null },
      verdict: { speaker: 'npc:prentice-wim', mood: 'happy', text: 'Both eyebrows. BOTH. That’s a Row record. You win the prize, which is a flask of Ashward and my undying respect. Mostly the flask.', next: 'nella' },
      nella: { speaker: 'npc:prentice-wim', mood: 'sad', text: 'Can I tell you something? One of the three you got out goes to the old chapel every night and lights a candle on the step. Nella. She won’t say who for. I’m worried. Rule two doesn’t cover it.', next: null },
    },
  },
  // ---------- Smoke Terraces: the Last Star, Soot Pigeons
  {
    id: 'dialogue:arcanist-ambrose', name: 'Ambrose Lumen (the Last Star)',
    entries: [{ when: stage('quest:arcanist-the-last-star', 'ambrose'), node: 'saw' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ambrose-lumen', text: 'Thirty years. Thirty years I haven’t seen a star.',
        choices: [offer('quest:arcanist-the-last-star', 'Can I help?', 'help'), bye],
      },
      help: { speaker: 'npc:ambrose-lumen', text: 'The lens wants cleaning, and the smoke above it wants a hole burned in it. At night, mind. Stars are shy.', next: null },
      saw: {
        speaker: 'npc:ambrose-lumen', mood: 'sad', text: 'Twelve in a ring? The Concord Ring. My master drew it for me when I was a boy: one star for every school, over the crown. And the dark place in the middle?',
        choices: [{ text: 'Nothing there. Just dark.', to: 'end' }, { text: 'Maybe it’s a star nobody can hear.', to: 'thirteen', insight: 'thirteenth_star' }],
      },
      thirteen: { speaker: 'npc:ambrose-lumen', text: 'A star you can’t hear. What a thing to say. I shall put it in my notes. Thank you, young one.', next: null },
      end: { speaker: 'npc:ambrose-lumen', text: 'Dark is something too. Thank you.', next: null },
    },
  },
  {
    id: 'dialogue:obj-observatory-lens', name: 'The observatory lens',
    entries: [
      { when: { all: [stage('quest:arcanist-the-last-star', 'lens'), NIGHT] }, node: 'night' },
      { when: stage('quest:arcanist-the-last-star', 'lens'), node: 'day' },
      { node: 'lens' },
    ],
    nodes: {
      lens: { speaker: 'narrator', text: 'The great brass telescope of the Kilnhold observatory, polished, pointing at smoke.', next: null },
      day: { speaker: 'narrator', text: 'Grey smoke and daylight. Ambrose said stars are shy. Come back at night.', next: null },
      night: {
        speaker: 'narrator', text: 'You clean the lens and send a column of fire straight up through the smoke. For a moment it parts, and there they are: twelve stars in a ring, and a dark space in the middle.',
        effects: [{ setFlag: 'arcanist.saw_star', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:arcanist-dilly', name: 'Dilly Coop (Soot Pigeons)',
    entries: [{ when: stage('quest:arcanist-soot-pigeons', 'third'), node: 'third' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:dilly-coop', text: 'Coo. Sorry. Habit. The pigeons are moulting and I have messages backing up to the rafters.',
        choices: [offer('quest:arcanist-soot-pigeons', 'I can carry some.', 'carry'), bye],
      },
      carry: { speaker: 'npc:dilly-coop', text: 'One for Captain Flue, one for Master Glaze. And one… well. Deliver the first two and come back for the third.', next: null },
      third: {
        speaker: 'npc:dilly-coop', text: 'This one has the Provost’s seal and no name on the front. Never sent. I read it, for safety. It says: “When the stone comes home, I will have a heart that never cools.”',
        choices: [{ text: 'Give me that.', to: null, effects: [{ setFlag: 'arcanist.pigeon_letter', value: true }], trust: 1 }],
      },
    },
  },
  // ---------- Kiln Roots: the Stoker's Lament, Golem Nine, Pudding's mother
  {
    id: 'dialogue:arcanist-bettany', name: 'Bettany (the Stoker’s Lament)',
    entries: [{ when: stage('quest:arcanist-the-stokers-lament', 'bettany'), node: 'answer' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:bettany', text: 'Hear that? It’s crying. Kilns don’t cry.',
        choices: [offer('quest:arcanist-the-stokers-lament', 'When does it cry?', 'when'), bye],
      },
      when: { speaker: 'npc:bettany', text: 'After midnight, at the deep grate. Fifty years I’ve fed her and she never cried before this year.', next: null },
      answer: {
        speaker: 'npc:bettany', text: 'Well? What is it?',
        choices: [
          { text: 'It isn’t the Kiln. It’s something under it, singing back to me.', to: 'stone', trust: 1 },
          { text: 'Just the fire, Bettany.', to: 'lie', trust: -1 },
        ],
      },
      stone: { speaker: 'npc:bettany', mood: 'sad', text: 'Singing. All this time, singing, and I thought she was dying. Here. Take a stoker’s torch. You’ll want light where you’re going.', next: null },
      lie: { speaker: 'npc:bettany', text: 'Fifty years. I know when someone’s lying to me about a fire. Take a torch anyway.', next: null },
    },
  },
  {
    id: 'dialogue:obj-kiln-crying-grate', name: 'The deep grate',
    entries: [
      { when: { all: [stage('quest:arcanist-the-stokers-lament', 'listen'), NIGHT] }, node: 'night' },
      { when: stage('quest:arcanist-the-stokers-lament', 'listen'), node: 'day' },
      { node: 'grate' },
    ],
    nodes: {
      grate: { speaker: 'narrator', text: 'The deepest grate of the Great Kiln, roaring.', next: null },
      day: { speaker: 'narrator', text: 'Only roaring, by day. Bettany said after midnight.', next: null },
      night: {
        speaker: 'narrator', text: 'Under the roar, a thin high sound, like a wet finger round a glass. Your chest answers it before you do.',
        effects: [{ setFlag: 'arcanist.kiln_cry_heard', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:arcanist-golem-nine', name: 'Golem Nine',
    entries: [{ when: stage('quest:arcanist-golem-nine', 'tell'), node: 'tell' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:golem-nine', text: '(The golem holds out a shovel to you, hopefully. Scratched on the handle: MARIT.)',
        choices: [offer('quest:arcanist-golem-nine', 'Who is Marit?', 'marit'), bye],
      },
      marit: { speaker: 'npc:golem-nine', text: '(It points down the Roots, to the end, where the oldest stokers’ houses are. Then it waits.)', next: null },
      tell: {
        speaker: 'npc:golem-nine', text: '(It waits for you to speak.)',
        choices: [
          { text: 'Marit died last winter. Peacefully. I’m sorry.', to: 'sad', trust: 1 },
          { text: '(Hand it the shovel, gently.)', to: 'sad' },
        ],
      },
      sad: { speaker: 'npc:golem-nine', mood: 'sad', text: '(Its eyes dim to embers. Then it shoulders the shovel, very carefully, and looks north, the way you will be going.)', next: null },
    },
  },
  {
    id: 'dialogue:obj-golem-master-grave', name: 'Marit’s grave',
    entries: [{ node: 'grave' }],
    nodes: { grave: { speaker: 'narrator', text: 'A small stone at the end of the Roots: MARIT, STOKER, FED THE KILN SIXTY YEARS. Someone has left a shovel-shaped space in the ash beside it.', next: null } },
  },
  {
    id: 'dialogue:arcanist-pudding-mother', name: 'Pudding’s mother', scope: 'party',
    entries: [{ when: stage('quest:arcanist-puddings-pedigree', 'grotto'), node: 'meet' }, { node: 'hello' }],
    nodes: {
      meet: { speaker: 'npc:pudding-mother', text: '(She is the size of a cottage. She bows, very slightly, and Pudding slides up into her and out again, glowing.) …blorp.', next: 'thanks' },
      thanks: { speaker: 'narrator', text: 'She makes it very clear, with no words at all, that she would like her thanks taken to the old man who kept her son warm.', next: null },
      hello: { speaker: 'npc:pudding-mother', text: '(She bows. You bow. It seems right.)', next: null },
    },
  },

  // ======================= ACT II
  {
    id: 'dialogue:arcanist-ada', name: 'C-1 Kilnmouth: Forgewife Ada', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:forgewife-ada', text: 'Cinderreach? You came from home? Sit. Sit down. Thirty years we’ve been stuck on this side, keeping a copy of the Great Kiln burning cold out of spite.',
        choices: [
          { text: 'I need to find Ash’s Sentinel.', to: 'ashmaw', quest: true },
          { text: 'Golem Nine came through with me.', to: 'nine', when: { flag: 'arcanist.golem_nine_helped' } },
        ],
      },
      nine: { speaker: 'npc:forgewife-ada', mood: 'happy', text: 'Is that what that is? It walked in this morning and started shovelling. Nobody asked it to. Best worker I’ve had in years.', next: 'ashmaw' },
      ashmaw: { speaker: 'npc:forgewife-ada', text: 'Ashmaw. The Kiln-Beast. It lit the Turning torches for a thousand years, and when it wouldn’t die we built our kilns round it and took its breath for the forges. Lately the breath comes up black.', next: null },
    },
  },
  {
    id: 'dialogue:arcanist-golem-nine-kilnmouth', name: 'Golem Nine in Kilnmouth',
    entries: [{ node: 'hi' }],
    nodes: { hi: { speaker: 'npc:golem-nine-kilnmouth', mood: 'happy', text: '(It has a new shovel, and a new stoker’s cap that someone has knitted for it. It shows you both.)', next: null } },
  },
  {
    id: 'dialogue:arcanist-brask', name: 'C-4 Foreman Brask', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:gildport-foreman', text: 'Black smoke over the Ruins? Aye. The Gilded Engine’s been running hot all month. Somebody’s feeding it gold, and something else that burns black. A fellow in a provost’s robe, very polite, very warm.',
        choices: [{ text: 'What’s he having made?', to: 'setting', quest: true }],
      },
      setting: { speaker: 'npc:gildport-foreman', text: 'A setting. The Engine made the crown’s twelve settings, back in the day. He wants a thirteenth. My grandad said it was built to hold song and grief both. I don’t like to think what this one’s meant to hold.', next: null },
    },
  },
  {
    id: 'dialogue:gild-brask', name: 'Foreman Brask (general)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:gildport-foreman', text: 'Mind the gears. They don’t mind you.', next: null } },
  },
  // ---------- featured bearers (hooks on the bearer NPCs)
  {
    id: 'dialogue:arcanist-featured-sparkwright', name: 'Featured: Spark and Ember', scope: 'party',
    entries: [
      { when: stage('quest:arcanist-spark-and-ember', 'back'), node: 'back' },
      { when: { all: [{ questStage: 'quest:arcanist-spark-and-ember', stage: 'coils' }, { not: { flag: 'arcanist.fizz_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-sparkwright', text: 'Fire-mage! Brilliant. I’m building a lightning tower on the Gildport clocktower to wake the Stormcrow, and the boiler won’t light. It wants a spark and an ember at once. You’re the ember.',
        choices: [{ text: 'Show me the boiler.', to: null, quest: true, effects: [{ setFlag: 'arcanist.fizz_asked', value: true }] }],
      },
      back: { speaker: 'npc:bearer-sparkwright', mood: 'happy', text: 'It HUMS. Did you hear it hum? That’s the best sound I’ve heard since Spirehold. Whatever happens at the Heart, I’m standing next to you.', effects: [{ setFlag: 'arcanist.fizz_thanked', value: true }], next: null },
    },
  },
  {
    id: 'dialogue:arcanist-featured-knight', name: 'Featured: The Knight’s Shame', scope: 'party',
    entries: [
      { when: stage('quest:arcanist-the-knights-shame', 'back'), node: 'back' },
      { when: { all: [{ questStage: 'quest:arcanist-the-knights-shame', stage: 'embassy' }, { not: { flag: 'arcanist.edda_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-knight', text: 'You’re from Cinderreach. Then you’ve thirty cold winters to blame on us. Berenika gave him the crown. My queen. I want to stand where her embassy stood and say sorry to someone. Will you come?',
        choices: [
          { text: 'I’ll come. And you don’t owe me sorry.', to: null, quest: true, effects: [{ setFlag: 'arcanist.edda_asked', value: true }] },
          { text: 'Iron didn’t freeze Cinderreach. He did.', to: null, quest: true, effects: [{ setFlag: 'arcanist.edda_asked', value: true }] },
        ],
      },
      back: {
        speaker: 'npc:bearer-knight', text: 'I’ve said it now. To the dust, mostly. To you. It helped. Strange. When we go to the Heart, I’ll be on your shield side.',
        effects: [{ setFlag: 'arcanist.edda_thanked', value: true }],
        choices: [{ text: 'Berenika trusted the wrong man. That isn’t the same as wrong.', to: null }, { text: 'Good.', to: null }],
      },
    },
  },
  {
    id: 'dialogue:obj-berenika-shrine', name: 'Berenika’s embassy',
    entries: [{ node: 'shrine' }],
    nodes: { shrine: { speaker: 'narrator', text: 'Under the gold dust, an iron door with Berenika’s arms on it. The Knight bearer kneels and speaks for a long time, very quietly. You keep watch.', next: null } },
  },
  // ---------- C-6 A Letter from Thrane
  {
    id: 'dialogue:arcanist-thrane-letter', name: 'C-6 a letter from Thrane', scope: 'party',
    entries: [{ when: { flag: 'arcanist.pudding_pet' }, node: 'pudding' }, { node: 'pigeon' }],
    nodes: {
      pudding: { speaker: 'narrator', text: 'Pudding is sitting at the foot of the Ash arch, very pleased, with a damp envelope in his mouth. You did not see him leave. You never do.', next: 'letter' },
      pigeon: { speaker: 'narrator', text: 'A Conclave soot-pigeon is perched on the Ash arch, holding a damp envelope and looking very much as if it would like to go home now.', next: 'letter' },
      letter: {
        speaker: TH, text: '“Kilnhold is cold without its tincture, and the Conclave is furious, and I have never been happier. The Kiln burns low, but it burns clean. Whatever you find at the Heart, remember what fire is for. Eat something. C. T.”',
        choices: [{ text: '(Fold the letter away.)', to: null, quest: true, effects: [{ setFlag: 'arcanist.thrane_letter', value: true }] }],
      },
    },
  },
  // ======================= ACT III
  {
    id: 'dialogue:arcanist-herald-fate', name: 'III-4 the Herald of Ash: Morrow’s fate', scope: 'party',
    entries: [{ node: 'kneel' }],
    nodes: {
      kneel: { speaker: 'npc:ignace-morrow', mood: 'hollow', text: 'I only wanted it never to go out. The Kiln. Me. Is that so much? Everything goes out. I couldn’t bear it.', next: 'choose' },
      choose: {
        speaker: 'npc:ignace-morrow', mood: 'sad', text: 'Well, Arcanist? You asked them once what fire is for. Answer it for me.',
        choices: [
          {
            text: 'Fire is for warming people. Give it to me, Ignace. (Hold out the half-stone.)', to: 'spare', quest: true,
            when: { any: [{ flag: 'arcanist.library', value: 'sung' }, { trust: 'npc:coalby-thrane', value: 'trusted' }] },
            lockedLabel: 'You need to know what the Kiln truly burned',
            effects: [{ setFlag: 'arcanist.nemesis_fate', value: 'spared' }],
          },
          { text: 'Fire is for ending things. (Put him out.)', to: 'destroy', quest: true, effects: [{ setFlag: 'arcanist.nemesis_fate', value: 'destroyed' }] },
        ],
      },
      spare: { speaker: 'narrator', text: 'The fire pours out of him into your half-stone, and the stone sings it quiet. What is left kneeling on the stair is a thin, tired man in a scorched robe, crying ordinary tears.', next: 'spare2' },
      spare2: { speaker: 'npc:ignace-morrow', text: 'Cold. I’m cold. I haven’t been cold in thirty years. (He laughs, shakily.) It’s horrible. Thank you.', next: null },
      destroy: { speaker: 'narrator', text: 'You draw the heat out of him until there is nothing left to burn. The Herald’s robes settle onto the stair, empty, and a little ash blows away towards the Citadel.', next: null },
    },
  },
  {
    id: 'dialogue:obj-crown-cage', name: 'Thrane’s Lantern: the crown’s cage', scope: 'party',
    entries: [
      { when: { all: [{ questStage: 'quest:arcanist-thranes-lantern', stage: 'light' }, { flag: 'arcanist.thrane_devotable' }] }, node: 'devoted' },
      { when: { questStage: 'quest:arcanist-thranes-lantern', stage: 'light' }, node: 'lit' },
      { node: 'cage' },
    ],
    nodes: {
      cage: { speaker: 'narrator', text: 'The cage of black tears round the empty crown, burning with a cold fire that has never gone out.', next: null },
      lit: { speaker: 'narrator', text: 'You hold Thrane’s lantern to the cage. The wick catches, and burns gold, not black. It lights in places nothing else will.', effects: [{ setFlag: 'arcanist.lantern_lit', value: true }], next: null },
      devoted: {
        speaker: 'narrator', text: 'You hold Thrane’s lantern to the cage. The wick catches gold. Far away in Kilnhold, an old man with a pencil behind each ear looks up from forty years of sums and smiles at nothing, and Pudding’s mother, wherever she is, bows.',
        effects: [{ setFlag: 'arcanist.lantern_lit', value: true }, { trust: 'npc:coalby-thrane', set: 5 }], next: null,
      },
    },
  },
  {
    id: 'dialogue:arcanist-lissa', name: 'Ignace’s Apprentice: Lissa Marl', scope: 'party',
    entries: [{ when: { questStage: 'quest:arcanist-ignaces-apprentice', stage: 'find' }, node: 'find' }, { node: 'later' }],
    nodes: {
      find: {
        speaker: 'npc:lissa-marl', mood: 'hollow', text: 'Tincture, black, forty measures. Tincture, black, sixty. I wrote it all down for him. He said it was for the Kiln. It was for the Kiln.',
        choices: [{ text: 'It’s over, Lissa. Put the ledger down.', to: 'down', trust: 1 }, { text: 'He lied to you. Come out of the line.', to: 'down' }],
      },
      down: { speaker: 'npc:lissa-marl', mood: 'sad', text: '(The ledger falls out of her hands. She looks at it as if she has never seen it.) I want to go home. I want to see a star. Do they have stars in Kilnhold now?', next: 'star' },
      star: { speaker: 'narrator', text: 'Old Ambrose Lumen will be very glad of an apprentice, you think.', next: null },
      later: { speaker: 'npc:lissa-marl', text: 'I’ve stopped counting. It’s much nicer.', next: null },
    },
  },
  {
    id: 'dialogue:arcanist-pudding-heart', name: 'Pudding Comes Home', scope: 'party',
    entries: [{ when: { questStage: 'quest:arcanist-pudding-comes-home', stage: 'camp' }, node: 'arrive' }],
    nodes: {
      arrive: { speaker: 'npc:pudding-mother', text: '(She has squeezed between two tents and is making the whole camp very warm. Every bearer is staring. She bows to you.)', next: 'pudding' },
      pudding: {
        speaker: 'narrator', text: 'She has come all this way to see off the one who brought her news of her youngest. She would also, it is clear, like a hot meal, and would not dream of asking.',
        choices: [{ text: '(Bow back, and fetch her the camp’s whole stewpot.)', to: 'stew' }],
      },
      stew: { speaker: 'narrator', mood: 'happy', text: 'The bearers laugh for the first time since the Wall. It is a good sound to take up the stairs with you.', next: null },
    },
  },
];

export default dialogues;
