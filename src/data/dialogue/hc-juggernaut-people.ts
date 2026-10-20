/**
 * Hollow Crown, JUGGERNAUT: Deepworks people (general talk), the eight side quests, the mentor thread and the
 * bounties, plus the Act II class-thread and featured-bearer scenes. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, DialogueNode, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const offer = (q: Q, text: string, to: string, extra?: NarrativeCondition): DialogueChoice =>
  ({ text, to, quest: true, when: extra ? { all: [fresh(q), extra] } : fresh(q), effects: [{ startQuest: q }] });
const bye: DialogueChoice = { text: 'Farewell.', to: null, tag: 'leave' };
const GH = 'npc:gussie-haldt' as const;

/** C-6: Gussie's letter and the Stone Court, shared by the Sergeant (no pet) and the ore-cart (pet) versions. */
const LETTER: Record<string, DialogueNode> = {
  letter: { speaker: GH, text: '“Rivet Town is fine. Lotte has grown again. The whistle-house roof leaks. I have blown the end-of-shift every night at six and every night I count one head short. Come home when you are done. Not before. Three short blasts means all well. G. H.”', next: 'court' },
  court: {
    speaker: 'narrator', text: 'Underneath, three short lines, drawn very hard, nearly through the paper. Later, at the Stone Court, your Lode half and the Knight’s Forge half ring together so loudly that the pigeons leave.',
    choices: [
      { text: '(Talk to the Knight bearer.)', to: 'edda', when: { not: { partyHasClass: 'knight' } } },
      { text: '(Nod to your Knight, whose half is ringing with yours.)', to: 'coop', when: { partyHasClass: 'knight' } },
    ],
  },
  edda: { speaker: 'npc:bearer-knight', mood: 'sad', text: 'Juggernaut. I wanted to say… on behalf of the Order. For the Forge buying the Lode’s iron, and the quotas, and the walls, and… I am sorry.', next: 'what' },
  coop: { speaker: 'narrator', text: 'Forge and Lode, ringing together. Your Knight opens their mouth, visibly preparing an apology on behalf of the entire Order of the Anvil.', next: 'what' },
  what: {
    speaker: 'narrator', text: 'You wait. The Knight waits. Neither of you is sure what for.',
    choices: [{ text: 'Sorry for what, tin-hat?', to: 'end', quest: true, effects: [{ setFlag: 'juggernaut.gussie_letter', value: true }] }],
  },
  end: { speaker: 'narrator', text: 'The Knight laughs, startled, for what looks like the first time in some years. The two halves of the Iron stone go on singing, one note from the Forge and one from under the mountain.', next: null },
};

const dialogues: DialogueDef[] = [
  // ---------- Gussie (general + mentor thread) and Sergeant
  {
    id: 'dialogue:juggernaut-gussie', name: 'Gussie (general)',
    entries: [{ when: { all: [stage('quest:juggernaut-stopped-golems', 'golems'), { not: { flag: 'juggernaut.delight.kick' } }] }, node: 'kick' }, { node: 'start' }],
    nodes: {
      kick: { speaker: GH, text: 'WHAT? Oh, it’s you. (She looks at your boot, then up at you, which takes a while.) The golems are on the main line. This is my whistle-house. I have never once needed kicking. Go on. Kick them nicely.', effects: [{ setFlag: 'juggernaut.delight.kick', value: true }], next: null },
      start: {
        speaker: GH, text: 'WHAT? Oh, it’s you. Sorry. Whistle-ears. Everybody in this town shouts. It’s not personal. It’s the whistles.',
        choices: [
          offer('quest:juggernaut-haldts-lamp', 'What happened to your father, Foreman?', 'dad', { trust: GH, value: 'friendly' }),
          offer('quest:juggernaut-the-first-whistle', 'Is the First Whistle real?', 'first', { all: [{ trust: GH, value: 'trusted' }, { questCompleted: 'quest:juggernaut-the-hollow-lode' }] }),
          { text: 'Why do you stand on a crate?', to: 'crate' },
          { text: 'Where did your first crate come from, Foreman?', to: 'first-crate', when: { trust: GH, value: 'trusted' } },
          bye,
        ],
      },
      'first-crate': { speaker: GH, text: '(She looks at the crate under her feet, the oldest one, black with years.) My dad’s. He was big. Bigger than you, nearly. When I took the shift he said, “They’ll never hear you, Gus, you’re the size of a lamp.” And he built me this.', next: 'crate2' },
      crate2: {
        speaker: GH, mood: 'sad', text: 'He used to stand behind me at the vote with his arms folded so nobody laughed. First vote after he went down the slag-run, I got up on this and nobody laughed anyway. That’s when I knew they’d listen. Not because of him. Because of the crate.',
        choices: [
          { text: 'Because of you, Gussie.', to: 'crate3', trust: 1 },
          { text: 'It’s a very good crate.', to: 'crate4' },
        ],
      },
      crate3: { speaker: GH, mood: 'happy', text: '(She goes red to the ears and shouts at a passing miner for no reason at all.) Get on with you. Big soft lump. Go and lift something.', next: null },
      crate4: { speaker: GH, mood: 'happy', text: 'It’s the best crate in the Deepworks. Oak. Brass corners. He put a drawer in it for my sandwiches. (She shows you. There is a sandwich in it.) Go on. Shift’s waiting.', next: null },
      dad: { speaker: GH, mood: 'sad', text: 'Foreman Haldt. Big man. Bigger than you, nearly. Went down the third slag-run in C. 1029 to fetch a lad back and never came up. The run cooled over him years ago. His lamp’s in there somewhere. I’ve never had the nerve.', next: null },
      first: { speaker: GH, text: 'Real as you. Blown once, at the first strike, nine hundred years back, then hung on a nail in the oldest gallery so nobody would blow it for nothing. That gallery’s in the Lode now. I’d like to blow it once. At the end of my last shift. Fetch it?', next: null },
      crate: { speaker: GH, text: 'So the back row can see me. The back row’s always Juggernauts. You lot are why I own nine crates.', next: 'start' },
    },
  },
  {
    id: 'dialogue:juggernaut-sergeant', name: 'Sergeant',
    entries: [{ when: { all: [{ questCompleted: 'quest:juggernaut-the-bell-in-the-rock' }, { not: { flag: 'juggernaut.delight.sergeant' } }] }, node: 'chest' }, { node: 'chirp' }],
    nodes: {
      chirp: { speaker: 'npc:sergeant', text: '(Sergeant the canary eyes you from his cage, puffs up to twice his size, and sings one furious bar at the floor.)', next: null },
      chest: { speaker: 'npc:sergeant', text: '(Sergeant eyes you. He does not puff up. He hops to the side of his cage nearest you and sings one small, puzzled bar at your chest instead of the floor. Then he goes back to glaring at the floor, as if it never happened.)', effects: [{ setFlag: 'juggernaut.delight.sergeant', value: true }], next: null },
    },
  },
  {
    id: 'dialogue:obj-haldt-lamp', name: 'Mentor: Haldt’s lamp', scope: 'party',
    entries: [{ when: stage('quest:juggernaut-haldts-lamp', 'lamp'), node: 'lamp' }, { node: 'plain' }],
    nodes: {
      lamp: { speaker: 'narrator', text: 'In the cooled third slag-run, under a skin of clear grey glass: a miner’s lamp, hooked over a hand that is not there any more. You break it free. The lamp is bone dry. All around it the old slag is spotless. Not one black tear has got into it in thirteen years.', next: null },
      plain: { speaker: 'narrator', text: 'A lamp-shaped hollow in the cooled slag.', next: null },
    },
  },
  {
    id: 'dialogue:juggernaut-gussie-lamp', name: 'Mentor: Haldt’s Lamp', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: GH, mood: 'sad', text: '(She holds it in both hands for a long time.) He always kept it so clean. Dad. You daft great lump. (She sniffs, enormously.) Look at it. Thirteen years in the slag and not a tear on it.', next: 'slag' },
      slag: {
        speaker: GH, text: 'Not a tear. Everything in this town weeps now. Golems, rivets, the Colossus. But not the slag. Thirty years we’ve been throwing that muck away.',
        choices: [{ text: 'Slag seals the tears.', to: 'end', insight: 'slag_seals', trust: 1 }],
      },
      end: { speaker: GH, text: 'Slag seals the tears. The Deepworks’ own rubbish. (She laughs, wet.) Dad would’ve liked that. He always said the waste was the best bit, if you knew what to do with it.', next: null },
    },
  },
  {
    id: 'dialogue:obj-first-whistle', name: 'Mentor: the First Whistle', entries: [{ node: 'w' }],
    nodes: { w: { speaker: 'narrator', text: 'A whistle of black horn bound in brass, on a nail in the oldest gallery of the Lode, nine hundred years old. The hollow iron weeps all round it and has never touched it. You put it in your shirt without blowing it.', next: null } },
  },
  {
    id: 'dialogue:juggernaut-gussie-whistle', name: 'Mentor: the First Whistle', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: GH, text: '(She does not blow it. She turns it over and over.) Nine hundred years. They blew this once and then they put it away for good, so it would mean something. You didn’t blow it. Course you didn’t.', next: 'end' },
      end: { speaker: GH, mood: 'happy', text: 'At the end of my last shift. Whenever that is. You’ll be there. That’s not a question, that’s a shift order.', effects: [{ trust: GH, delta: 1 }], next: null },
    },
  },
  // ---------- Magda (general)
  {
    id: 'dialogue:juggernaut-magda', name: 'Magda Ruhl (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:magda-ruhl', mood: 'happy', text: 'Big one! Come for your double wages? No? Come for a cup of tea, then. Everyone’s welcome at mine.',
        choices: [
          { text: 'Where did you grow up, Magda?', to: 'grew' },
          { text: 'Your eyes are dry. Everyone else’s are wet.', to: 'dry', when: { flag: 'juggernaut.magda_met' } },
          bye,
        ],
      },
      grew: { speaker: 'npc:magda-ruhl', text: 'Copper Lane. Four doors from the store. Mam worked the sorting tables till her hands went. I was eleven when I first saw what the Regency paid for a ton. I have not been surprised by anything since.', next: null },
      dry: { speaker: 'npc:magda-ruhl', text: 'I’ve nothing to cry about. That’s what money’s for, lump. Drink your tea.', next: null },
    },
  },
  // ---------- Rivet Town: Lotte, Penny, Fettle
  {
    id: 'dialogue:juggernaut-lotte', name: 'Big Lotte Anvers (Too Tall for the Door)',
    entries: [{ when: stage('quest:juggernaut-too-tall-for-the-door', 'lotte'), node: 'door' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:lotte-anvers', text: '(Lotte is sitting on her own doorstep, which comes up to her shins.) I’ve grown again. Third time since spring. Mam says it’s the Bell. I say it’s Mam’s pies.',
        choices: [offer('quest:juggernaut-too-tall-for-the-door', 'Let’s fix the house.', 'fix'), bye],
      },
      fix: { speaker: 'npc:lotte-anvers', mood: 'happy', text: 'Not me? The house? Nobody ever said fix the house before. Everyone says duck. Lintel, door-frame, roof-beam. Mind your head. Ha. Mind MY head.', next: null },
      door: {
        speaker: 'npc:lotte-anvers', mood: 'happy', text: '(She walks in through her own front door without stooping for the first time in a year, and walks out again, and in again.) Look at that! I can wear a hat indoors!',
        choices: [{ text: 'What if you grow again?', to: 'grow' }, { text: 'Welcome home, Lotte.', to: 'home', trust: 1 }],
      },
      grow: { speaker: 'npc:lotte-anvers', text: 'Then you’ll fix it again, won’t you. That’s what neighbours are for. Here. Cheese. It’s Mam’s. It’s also probably why.', next: 'party' },
      home: { speaker: 'npc:lotte-anvers', text: 'Welcome home, me. Here. Cheese. Mam sent it. Mam sends cheese at everything.', next: 'party' },
      party: { speaker: 'npc:lotte-anvers', mood: 'happy', text: 'Do you know, I’ve never once had anybody round. I couldn’t get in myself, so it seemed rude. (She pulls a folded paper out of her apron, much rehearsed.) I wrote an invitation. For the whole shift. Pin it up at the shaft-head? I’d go red.', next: null },
    },
  },
  {
    id: 'dialogue:juggernaut-penny', name: 'Penny Grist (Penny’s Other Ledger)',
    entries: [{ when: stage('quest:juggernaut-pennys-other-ledger', 'penny'), node: 'ledger' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:penny-grist', text: '(The company store clerk is very small, very neat and very frightened.) She burned the ledgers. All of them. Except one. The auditors are coming at the second whistle and if they find it, they will know.',
        choices: [offer('quest:juggernaut-pennys-other-ledger', 'Know what, Penny?', 'know'), bye],
      },
      know: { speaker: 'npc:penny-grist', mood: 'afraid', text: 'That I never collected half of it. Thirty years of debts I wrote down and then quietly let go. It’s behind the flour sacks. Please. Before the second whistle.', next: null },
      ledger: {
        speaker: 'npc:penny-grist', mood: 'happy', text: 'You found it. Oh, you found it. (She hugs it to her chest.) Every winter coat, every doctor, every funeral. Thirty years. I never told a soul.',
        choices: [
          { text: 'Can I read it?', to: 'read' },
          { text: 'Your secret’s safe, Penny.', to: 'safe', trust: 1 },
        ],
      },
      read: { speaker: 'npc:penny-grist', text: 'Some of it. Not all. There’s one page I don’t think you should read yet. (She turns it face down.) It’s about somebody you know. One day. Not today.', next: 'whistle' },
      safe: { speaker: 'npc:penny-grist', text: 'I know. You’ve got a face that keeps things. One day I’ll show you the page from C. 1020. Not today. Today I’m going to have a little sit down.', next: 'whistle' },
      whistle: { speaker: 'npc:penny-grist', mood: 'afraid', text: '(The second whistle blows. She goes white.) That’s him. The auditor. He’ll be in the pay office, with nothing on his desk, and he’ll want to know why. I can’t go in there. I’ll cry on his inkwell.', next: null },
    },
  },
  {
    id: 'dialogue:obj-pennys-ledger', name: 'Penny’s other ledger',
    entries: [{ when: stage('quest:juggernaut-pennys-other-ledger', 'ledger'), node: 'find' }, { node: 'plain' }],
    nodes: {
      find: { speaker: 'narrator', text: 'Behind the third flour sack, wrapped in oilcloth: a small, fat ledger in tiny writing. The first entry reads: C. 1012. Widow Pargiter, coal. Forgiven. The last reads: Last week. Everybody. Forgiven.', next: null },
      plain: { speaker: 'narrator', text: 'Flour sacks, and a ledger-shaped gap behind them.', next: null },
    },
  },
  {
    id: 'dialogue:juggernaut-fettle', name: 'Tallyman Ida Fettle (bounties)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ida-fettle', text: 'Tally board. Bounties on the left, missing pails on the right. Mostly pails.',
        choices: [
          offer('quest:juggernaut-bounty-cart-line-golems', 'The cart-line golems.', 'golems'),
          offer('quest:juggernaut-bounty-old-mandible', 'Old Mandible?', 'mandible'),
          bye,
        ],
      },
      golems: { speaker: 'npc:ida-fettle', text: 'Two hollow golems on the number four line, back to back. Paid on the tally, by the golem.', next: null },
      mandible: { speaker: 'npc:ida-fettle', text: 'Biggest Scrap Beetle in the fields. Wears a boiler for a hat. It’s eaten six lunches this week, and one of them was mine.', next: null },
    },
  },
  // ---------- the Deepworks: Dilly, Selwyn
  {
    id: 'dialogue:juggernaut-dilly', name: 'Dilly Spoke (Dilly’s Rails)',
    entries: [{ when: stage('quest:juggernaut-dillys-rails', 'dilly'), node: 'result' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:dilly-spoke', mood: 'happy', text: 'Race you! No? Race you anyway. Oh, the Long Drop’s blocked. Hollow golems standing on it like they own it. They don’t own it. I own it. In my heart.',
        choices: [offer('quest:juggernaut-dillys-rails', 'I’ll clear the line.', 'clear'), bye],
      },
      clear: { speaker: 'npc:dilly-spoke', text: 'Then we race. Proper race. Ore-carts, the Long Drop, bottom of the Deepworks, first one to the buffers. Loser buys pies. Loser always buys pies.', next: null },
      result: {
        speaker: 'npc:dilly-spoke', mood: 'angry', text: 'You weigh three of me! You had GRAVITY on your side! That’s cheating! That’s physics and it’s cheating!',
        choices: [{ text: 'I’ll buy the pies.', to: 'pies', trust: 1 }, { text: 'Rematch?', to: 'rematch' }],
      },
      pies: { speaker: 'npc:dilly-spoke', mood: 'happy', text: 'You won and you’re buying? I take it back. You’re lovely. You’re heavy and lovely.', next: null },
      rematch: { speaker: 'npc:dilly-spoke', mood: 'happy', text: 'Every day until I win. Then once more, so you feel bad.', next: null },
    },
  },
  {
    id: 'dialogue:obj-dilly-race-cart', name: 'Dilly’s Rails: the race', scope: 'party',
    entries: [{ when: stage('quest:juggernaut-dillys-rails', 'race'), node: 'race' }, { node: 'plain' }],
    nodes: {
      race: { speaker: 'narrator', text: 'Two ore-carts at the top of the Long Drop. Dilly counts down from three and goes on two. Then it is all wind and sparks and Dilly screaming with joy, and you hit the buffers at the bottom a cart-length ahead, mostly because you weigh as much as the cart.', next: null },
      plain: { speaker: 'narrator', text: 'An ore-cart with DILLY painted on it, and a smaller one painted NOT DILLY.', next: null },
    },
  },
  {
    id: 'dialogue:juggernaut-selwyn', name: 'Old Selwyn Duckett (the Singing Seam)',
    entries: [{ when: stage('quest:juggernaut-the-singing-seam', 'selwyn'), node: 'sang' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:selwyn-duckett', text: 'Fifty years down the Deepworks. I’ll tell you something they don’t teach. The first miners didn’t dig for iron. They sang for it.',
        choices: [offer('quest:juggernaut-the-singing-seam', 'Sang for it?', 'sang-q'), bye],
      },
      'sang-q': { speaker: 'npc:selwyn-duckett', text: 'In the oldest gallery. They’d sing, and the rock would sing back where the iron was. My granddad showed me. I never could carry a tune. Go and try. You look like you might.', next: null },
      sang: {
        speaker: 'npc:selwyn-duckett', text: 'Well? Did she sing back?',
        choices: [{ text: 'The rock sang. Then something in my chest sang back at the rock.', to: 'stone', insight: 'deepworks_song' }],
      },
      stone: { speaker: 'npc:selwyn-duckett', mood: 'sad', text: 'Then it’s true. It wasn’t the iron they were following. It was the song in it. Something sang through all this rock once, and we dug towards it for nine hundred years, and then thirty years ago it went quiet and we just kept digging.', next: 'verses' },
      verses: { speaker: 'npc:selwyn-duckett', text: 'Granddad said there were more verses. The first miners cut them on a board in the old gallery past here, so they’d not be forgotten. Then they were forgotten anyway. Go and read me the rest, would you? My eyes won’t do the dark.', next: null },
    },
  },
  {
    id: 'dialogue:obj-singing-seam-echo', name: 'The Singing Seam', scope: 'party',
    entries: [{ when: stage('quest:juggernaut-the-singing-seam', 'seam'), node: 'sing' }, { node: 'plain' }],
    nodes: {
      sing: {
        speaker: 'narrator', text: 'The oldest gallery, its walls worn smooth by nine hundred years of hands.',
        choices: [
          { text: '(Sing.)', to: 'back' },
          { text: '(Hum. Juggernauts hum.)', to: 'back' },
        ],
      },
      back: { speaker: 'narrator', text: 'For a moment, nothing. Then the rock answers: a low note, far off, coming up from somewhere much deeper than any gallery. Under your ribs, your half-stone answers it, loud and sure.', next: null },
      plain: { speaker: 'narrator', text: 'The Singing Seam. If you stand very still, the rock hums.', next: null },
    },
  },
  // ---------- the Slag Rivers: Agathe, Clem
  {
    id: 'dialogue:juggernaut-agathe', name: 'Agathe Strell (Crane-Mother)',
    entries: [{ when: stage('quest:juggernaut-crane-mother', 'agathe'), node: 'cab' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:agathe-strell', text: '(Her voice comes down from a crane cab ninety rungs up.) I’m not coming down! Don’t ask! The slag’s gone black and I’m not getting my boots in it!',
        choices: [offer('quest:juggernaut-crane-mother', '(Start climbing.)', 'climb'), bye],
      },
      climb: { speaker: 'npc:agathe-strell', text: 'Oh, you’re climbing. Lovely. Mind rungs forty to fifty. They’re more of a suggestion.', next: null },
      cab: {
        speaker: 'npc:agathe-strell', text: '(She pours you tea from a flask into its own lid.) Forty-four years I’ve driven this crane. I’ve swung slag over the Rivers since before your mam was born. I’m not leaving her now because the muck’s gone a funny colour.',
        choices: [
          { text: 'The slag under you is weeping, Agathe. Come down.', to: 'down', effects: [{ setFlag: 'juggernaut.agathe', value: 'down' }] },
          { text: 'Then let’s swing her over the bridge together.', to: 'ride', trust: 1, effects: [{ setFlag: 'juggernaut.agathe', value: 'ride' }] },
        ],
      },
      down: { speaker: 'npc:agathe-strell', mood: 'sad', text: '(A long sip.) All right. All right, lovey. But she comes with me. I’ll drive her down the rails to the yard. She’s not staying out here on her own.', next: 'end' },
      ride: { speaker: 'npc:agathe-strell', mood: 'happy', text: '(She throws the levers. The whole crane groans and swings out over the black slag, and the jib comes round, and for one long minute the Slag Rivers are below you, glowing, beautiful.) THAT’S my girl!', next: 'end' },
      end: { speaker: 'npc:agathe-strell', text: 'If you ever need anything big lifted, lovey, anything at all, you whistle. Me and her’ll come.', next: 'dam' },
      dam: { speaker: 'npc:agathe-strell', text: 'Only, lovey, it wasn’t the boots. (She nods down at the old slag-bridge, where her jib’s chain runs taut into the black.) She’s been holding that bridge up a month. Go and look under it. Then you’ll see why I wouldn’t come down.', next: null },
    },
  },
  {
    id: 'dialogue:obj-agathe-crane-ladder', name: 'Crane-Mother: the ladder',
    entries: [{ node: 'l' }],
    nodes: { l: { speaker: 'narrator', text: 'Ninety rungs. Rungs forty to fifty are, as promised, more of a suggestion. Below you the slag-run glows black-red, and something in it is weeping.', next: null } },
  },
  {
    id: 'dialogue:juggernaut-clem', name: 'Clem Bodkin (Slag Sculptures)',
    entries: [{ when: stage('quest:juggernaut-slag-sculptures', 'clem'), node: 'winner' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:clem-bodkin', text: 'The judge has gone all quiet and starey, so YOU’RE the judge. I decided. I’m in charge of deciding. Also I’ve got my tin horse back and I’m not crying about it.',
        choices: [offer('quest:juggernaut-slag-sculptures', 'All right. I’ll judge.', 'judge'), bye],
      },
      judge: { speaker: 'npc:clem-bodkin', text: 'Three finalists. Mine’s not one of them. Mine fell over. Don’t look at the parents. They can smell fear.', next: null },
      winner: {
        speaker: 'npc:clem-bodkin', text: 'So who won? Say it loud. The parents are listening. The parents are ALWAYS listening.',
        choices: [
          { text: 'The pit-pony. It’s got a face.', to: 'pony', effects: [{ setFlag: 'juggernaut.slag_winner', value: 'pony' }] },
          { text: 'The whistle-house, with the little Gussie on top.', to: 'house', effects: [{ setFlag: 'juggernaut.slag_winner', value: 'house' }] },
          { text: 'Everyone wins. Everyone gets a pie.', to: 'all', trust: 1, effects: [{ setFlag: 'juggernaut.slag_winner', value: 'all' }] },
        ],
      },
      pony: { speaker: 'npc:clem-bodkin', text: 'The pony! (Somewhere behind you, two sets of parents start shouting, and one set starts cheering.) Run. I’d run. Here, this is the judge’s cake. You earned it.', next: 'mine' },
      house: { speaker: 'npc:clem-bodkin', mood: 'happy', text: 'The whistle-house! With the tiny Gussie! She’ll pretend to be cross and keep it on her windowsill forever. Here, judge’s cake.', next: 'mine' },
      all: { speaker: 'npc:clem-bodkin', text: 'That’s CHEATING. (She thinks about it.) That’s good cheating. Here. Judge’s cake. You have to share it, though. Everybody won.', next: 'mine' },
      mine: { speaker: 'npc:clem-bodkin', text: '(Very quietly, behind her hand.) Mine didn’t fall over. I lied. It’s behind the judge’s chair. It’s for somebody. Take it to the whistle-house and don’t say it was me. Don’t say it wasn’t me either.', next: null },
    },
  },
  {
    id: 'dialogue:obj-slag-sculpture-3', name: 'Slag Sculptures: the third finalist', scope: 'party',
    entries: [{ when: stage('quest:juggernaut-slag-sculptures', 'judge'), node: 'look' }, { node: 'plain' }],
    nodes: {
      look: {
        speaker: 'narrator', text: 'The third finalist: a little slag whistle-house with a tiny Gussie on the roof. The child who made it mixed the slag with gutter-water to make it pour, and the gutters in Rivet Town have run black for a year. The slag has set clean and grey. Not a drop of black in it anywhere.',
        choices: [
          { text: '(Look closer at the slag.)', to: 'closer', insight: 'slag_seals' },
          { text: '(Admire the tiny Gussie.)', to: null },
        ],
      },
      closer: { speaker: 'narrator', text: 'You scrape it with a thumbnail. Grey all the way through. The tears went into the slag and stopped there, sealed in, like flies in amber. It is the most important thing anyone has ever made for a children’s contest.', next: null },
      plain: { speaker: 'narrator', text: 'A slag whistle-house with a tiny Gussie on the roof.', next: null },
    },
  },
  // ---------- the Scrapfields: the Tinker Twins, Mother Teasdale
  {
    id: 'dialogue:juggernaut-nib', name: 'Nib (Nib and Nub)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:nib-tinker', text: 'It goes THAT way. Forward is that way. Nub says forward is the other way but Nub is wrong, which is Nub’s favourite thing to be.',
        choices: [offer('quest:juggernaut-nib-and-nub', 'What does the cart need?', 'needs'), bye],
      },
      needs: { speaker: 'npc:nib-tinker', text: 'A boiler, a wheel and a bell. Nub says no bell. A cart with no bell is just a heavy surprise. They’re out in the scrap under the beetles. Bring all three to Nub. Nub has the spanner. I’m not speaking to Nub.', next: null },
    },
  },
  {
    id: 'dialogue:juggernaut-nub', name: 'Nub (Nib and Nub)',
    entries: [{ when: stage('quest:juggernaut-nib-and-nub', 'twins'), node: 'cart' }, { node: 'start' }],
    nodes: {
      start: { speaker: 'npc:nub-tinker', text: 'Forward is THAT way. Nib says the other way, but Nib once drove a cart into a pond going forward, so.', next: null },
      cart: {
        speaker: 'npc:nub-tinker', text: 'A boiler, a wheel and… a bell. You brought a bell. (Nib, from behind the scrap heap: “HA!”) Fine. Fine. We’ll put the bell on the back, then, so it rings when we go the wrong way.',
        choices: [{ text: 'Which way is forward?', to: 'forward' }, { text: 'Put the bell in the middle.', to: 'middle', trust: 1 }],
      },
      forward: { speaker: 'npc:nub-tinker', text: 'Whichever way the bell isn’t. That’s the deal. Nib’s agreed. Nib doesn’t know Nib’s agreed yet.', next: 'test' },
      middle: { speaker: 'npc:nub-tinker', mood: 'happy', text: 'In the MIDDLE. (Nib, from behind the heap: “…oh, that’s good.”) Then both ways are forward. You should be on the Council of the Forge.', next: 'test' },
      test: { speaker: 'npc:nub-tinker', text: 'Now it needs testing. On the scrap hill. By somebody heavy, for science. (Nib: “And brave.”) And brave. Sit in the front. (Nib: “Which front?”) Both fronts. That’s why you’re heavy.', next: null },
    },
  },
  {
    id: 'dialogue:juggernaut-teasdale', name: 'Mother Teasdale (the Widow’s Pick)',
    entries: [{ when: stage('quest:juggernaut-the-widows-pick', 'teasdale'), node: 'up' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:mother-teasdale', text: 'Walter’s pick went out with the scrap, after the collapse. They took a cartload of picks off the men who didn’t come up and dumped them all together. As if a pick’s just a pick.',
        choices: [offer('quest:juggernaut-the-widows-pick', 'I’ll find it.', 'find'), bye],
      },
      find: { speaker: 'npc:mother-teasdale', text: 'Red haft. W. T. burned in by the head. He painted it red so he could find it in the dark. Bring it to the shrine, if you would. He belongs on the shrine.', next: null },
      up: {
        speaker: 'npc:mother-teasdale', mood: 'sad', text: '(She looks up at it for a while, between his brother’s shovel and his father’s lamp.) There he is. Red as anything. Couldn’t miss him in the dark if you tried.',
        choices: [{ text: '(Stand with her a while.)', to: 'stand', trust: 1 }, { text: 'He’s home.', to: 'home' }],
      },
      stand: { speaker: 'npc:mother-teasdale', text: 'Thank you, love. He’d have liked you. He liked anybody who didn’t talk at a shrine.', next: null },
      home: { speaker: 'npc:mother-teasdale', text: 'He’s home. Eleven years in the scrap and he’s home. Thank you, love.', next: null },
    },
  },
  {
    id: 'dialogue:obj-teasdale-pick', name: 'The Widow’s Pick: the red haft', entries: [{ node: 'p' }],
    nodes: { p: { speaker: 'narrator', text: 'A mountain of picks, rusting together. One haft is red, the paint worn to the wood where a hand held it for twenty years. W. T., burned in by the head.', next: null } },
  },
  {
    id: 'dialogue:obj-brotherhood-shrine', name: 'The Brotherhood shrine',
    entries: [{ when: stage('quest:juggernaut-the-widows-pick', 'shrine'), node: 'hang' }, { node: 'plain' }],
    nodes: {
      hang: { speaker: 'narrator', text: 'You hang Walter Teasdale’s pick on its own nail, between a shovel and a lamp. It is the only red thing on the shrine. It looks right there.', next: null },
      plain: { speaker: 'narrator', text: 'The Brotherhood shrine: the tools of every miner the Deepworks kept, each on its own nail, each with a name.', next: null },
    },
  },

  // ======================= ACT II
  {
    id: 'dialogue:juggernaut-jenks', name: 'C-1 the Gold Diggers: Hobnail Jenks', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:hobnail-jenks', text: 'Rivet Town! Look at the size of you! Hobnail Jenks, gaffer, Gilded Ruins dig. Thirty years we’ve been stuck this side of the arch, digging out the Sparkwright city for wages. Paid in gold, searched for gold at the end of every shift. You laugh or you cry.',
        choices: [
          { text: 'Rivet Town went on strike before I left.', to: 'strike', when: { flag: 'juggernaut.whistle', value: 'strike' } },
          { text: 'Dilly Spoke came through after me. And a cart.', to: 'dilly', when: { any: [{ flag: 'juggernaut.dilly_raced' }, { flag: 'juggernaut.twins_cart' }] } },
          { text: 'What do you dig for?', to: 'dig' },
        ],
      },
      strike: {
        speaker: 'npc:hobnail-jenks', mood: 'happy', text: 'On STRIKE? Gussie Haldt’s shift? (He turns round and bellows.) DOWN TOOLS, LADS! Rivet Town’s out! (Forty picks hit the gold.) The Sparkwrights can dig their own city. We’ll dig for you instead.',
        effects: [{ setFlag: 'juggernaut.diggers_struck', value: true }], next: 'hammer',
      },
      dilly: { speaker: 'npc:hobnail-jenks', text: 'That’s who that is! Turned up this morning driving my dig-carts like the Colossus was after her. And there’s a cart with a bell in the middle that two little tinkers keep arguing over. Rivet Town, all of it. Never changes.', next: 'dig' },
      dig: { speaker: 'npc:hobnail-jenks', text: 'Gold, officially. The whole buried city of C. 640 is down there under it, streets and all. Unofficially, I listen. Thirty years I’ve heard something hammering under the gold, every night, never missing a stroke.', next: 'hammer' },
      hammer: {
        speaker: 'npc:hobnail-jenks', text: 'Takes a Juggernaut to go and knock on its door. Lead the night shift down, would you? We’re short of anybody who can hold a roof up.',
        choices: [{ text: 'Get the lamps lit.', to: null, quest: true }],
      },
    },
  },
  {
    id: 'dialogue:juggernaut-dilly-gildport', name: 'Dilly Spoke at Gildport',
    entries: [{ node: 'race' }],
    nodes: { race: { speaker: 'npc:dilly-spoke-gildport', mood: 'happy', text: 'Gold rails! They’ve got GOLD RAILS here! Race you to the Clocktower. No gravity this time. I checked. I asked a Sparkwright.', next: null } },
  },
  {
    id: 'dialogue:obj-juggernaut-dig-collapse', name: 'C-2 the collapse', scope: 'party',
    entries: [{ when: stage('quest:juggernaut-under-the-gold', 'collapse'), node: 'hold' }, { node: 'plain' }],
    nodes: {
      hold: {
        speaker: 'narrator', text: 'The gold gallery comes down in a slow golden slide, and the night shift is under it. You get your back to the roof. It is exactly as heavy as you are strong.',
        choices: [
          { text: '(Hold it, and shout for the diggers.)', to: 'diggers', when: { flag: 'juggernaut.diggers_struck' } },
          { text: '(Hold it.) Out. All of you. Now.', to: 'out' },
        ],
      },
      diggers: { speaker: 'narrator', text: 'Forty miners who downed tools for you come running with props and planks, and in a minute there are forty-one backs under the gold instead of one. Jenks is laughing. It is the old shaft-head all over again.', next: 'out' },
      out: { speaker: 'narrator', text: 'The last digger crawls clear. You set the roof down gently on its props. Under where it fell, something older than Gildport shows through the gold.', next: null },
      plain: { speaker: 'narrator', text: 'A collapsed gold gallery, propped and safe.', next: null },
    },
  },
  {
    id: 'dialogue:obj-juggernaut-embassy-footings', name: 'C-2 the old Iron embassy', scope: 'party',
    entries: [{ when: stage('quest:juggernaut-under-the-gold', 'footings'), node: 'stones' }, { node: 'plain' }],
    nodes: {
      stones: { speaker: 'narrator', text: 'Great dressed blocks of grey Ironhold stone, under the gold of the buried city: the footings of the first Iron embassy. On every block, a mason’s mark. One of them is a Brotherhood shift-mark, nine hundred years old, still crisp. Rivet Town built this too.', next: null },
      plain: { speaker: 'narrator', text: 'The old Iron embassy’s footings, cleaned of gold.', next: null },
    },
  },
  {
    id: 'dialogue:obj-juggernaut-ore-ruts', name: 'C-4 Magda’s ore-cart ruts', scope: 'party',
    entries: [{ when: stage('quest:juggernaut-the-ore-road', 'tracks'), node: 'ruts' }, { node: 'plain' }],
    nodes: {
      ruts: { speaker: 'narrator', text: 'Deep ore-cart ruts in the north road out of the Ruins, heavy-laden, wet with black. In the mud beside them, a single bright coin stamped with a smiling sun, still wet. The ruts run north, towards the white of Frostmere Pass.', next: null },
      plain: { speaker: 'narrator', text: 'Old ruts in the north road, dried at last.', next: null },
    },
  },
  {
    id: 'dialogue:obj-juggernaut-magda-cart', name: 'C-4 Magda’s abandoned cart', scope: 'party',
    entries: [{ when: stage('quest:juggernaut-the-ore-road', 'cart'), node: 'cart' }, { node: 'plain' }],
    nodes: {
      cart: { speaker: 'narrator', text: 'Magda’s ore-cart, one wheel off in the snow, still loaded with hollow iron. On top, held down by a pick, a delivery note in a square hand: “One furnace’s worth. For the King’s smiths, the Heart. The fitting will be at my convenience. M. R.”', next: 'fit' },
      fit: { speaker: 'narrator', text: 'On the back of the note, in a different hand, someone has drawn a great iron belly with a firebox in it, and written in the margin: Measurements, M. Ruhl. Chest forty-six. Willing.', next: null },
      plain: { speaker: 'narrator', text: 'An abandoned ore-cart, drifting over with snow.', next: null },
    },
  },
  {
    id: 'dialogue:juggernaut-another-colossus', name: 'C-5 another colossus', scope: 'party',
    entries: [{ node: 'see' }],
    nodes: {
      see: { speaker: 'narrator', text: 'In the high pass, holding the road shut with its whole body, stands a giant of blue ice, tears frozen in black ropes down its face. Magda’s miners have been breaking at its feet with picks. It has not moved.', next: 'line' },
      line: {
        speaker: 'narrator', text: 'You look up at it for a long moment.',
        choices: [{ text: 'Another colossus.', to: null }, { text: '(Crack your knuckles.) Right. I’ve done one of these.', to: null, school: 'iron' }],
      },
    },
  },
  // ---------- C-6 Three Short Blasts (Sergeant, or the ore-cart if Sergeant is already with you)
  {
    id: 'dialogue:juggernaut-gussie-letter', name: 'C-6 Gussie’s letter (Sergeant)', scope: 'party',
    entries: [{ node: 'sergeant' }],
    nodes: {
      sergeant: { speaker: 'npc:sergeant-concordia', text: '(Sergeant the canary is sitting on top of the Iron arch, singing furiously at the whole of Concordia. A letter is tied to his leg with shift-whistle cord. He has flown a very long way, and he wants everyone to know it.)', next: 'letter' },
      ...LETTER,
    },
  },
  {
    id: 'dialogue:obj-juggernaut-ore-cart', name: 'C-6 Gussie’s letter (the ore-cart)', scope: 'party',
    entries: [{ when: { all: [{ flag: 'juggernaut.sergeant_pet' }, stage('quest:juggernaut-three-short-blasts', 'letter')] }, node: 'cart' }, { node: 'plain' }],
    nodes: {
      cart: { speaker: 'narrator', text: 'An ore-cart has rolled out of the Iron arch on its own and come to rest in the middle of the Gate Circle. Rivet Town stamp, fresh paint. Inside, a sack of pies, a sock, and a letter. Sergeant, on your shoulder, sings at it in recognition.', next: 'letter' },
      ...LETTER,
      plain: { speaker: 'narrator', text: 'A Rivet Town ore-cart, parked in the Gate Circle with great dignity.', next: null },
    },
  },
  // ---------- featured bearers (hooks on the bearer NPCs)
  {
    id: 'dialogue:juggernaut-featured-warden', name: 'Featured: Who Holds the Pass', scope: 'party',
    entries: [
      { when: stage('quest:juggernaut-who-holds-the-pass', 'back'), node: 'back' },
      { when: { all: [stage('quest:juggernaut-who-holds-the-pass', 'shore'), { not: { flag: 'juggernaut.bram_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-warden', text: 'Juggernaut. The Wardenhold wall is cracking at the gate, and my lot are spearmen, not masons. Walls are for keeping people out. That is what they are for. You build walls. Come and help me keep them out.',
        choices: [
          { text: 'Walls are for keeping people in, mostly. I’ll come anyway.', to: null, quest: true, effects: [{ setFlag: 'juggernaut.bram_asked', value: true }] },
          { text: 'I’ll bring my shoulders.', to: null, quest: true, effects: [{ setFlag: 'juggernaut.bram_asked', value: true }] },
        ],
      },
      back: {
        speaker: 'npc:bearer-warden', text: 'You were right, and I hate it. The wall stands up because the people behind it lean on it, not because of who it keeps out. I’ve been leaning on the wrong side of mine for years. When we go to the Heart, you hold the gate and I’ll hold the wall.',
        effects: [{ setFlag: 'juggernaut.bram_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-juggernaut-buttress-3', name: 'Who Holds the Pass: the last buttress', scope: 'party',
    entries: [{ when: stage('quest:juggernaut-who-holds-the-pass', 'shore'), node: 'shore' }, { node: 'plain' }],
    nodes: {
      shore: {
        speaker: 'narrator', text: 'The last cracked buttress of Wardenhold’s gate wall. You set your shoulder to it while the Warden bearer’s spearmen wedge the stones. Walls are for keeping people out, the Warden says, through gritted teeth.',
        choices: [
          { text: 'Walls are for the people leaning on them.', to: 'lean' },
          { text: '(Push. The wall goes straight.)', to: 'push', school: 'iron' },
        ],
      },
      lean: { speaker: 'narrator', text: 'Twenty spearmen look at the wall they are all leaning on, and then at each other. The Warden bearer opens their mouth to argue, and finds they are leaning on it too.', next: null },
      push: { speaker: 'narrator', text: 'The buttress grinds back into true with a sound like a bear sitting down. The spearmen cheer. The Warden bearer says that is not an argument. It is, you point out, a wall.', next: null },
      plain: { speaker: 'narrator', text: 'A buttress of Wardenhold’s gate wall, straight and wedged.', next: null },
    },
  },
  {
    id: 'dialogue:juggernaut-featured-sparkwright', name: 'Featured: The Machine Age', scope: 'party',
    entries: [
      { when: stage('quest:juggernaut-the-machine-age', 'back'), node: 'back' },
      { when: { all: [stage('quest:juggernaut-the-machine-age', 'machine'), { not: { flag: 'juggernaut.fizz_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-sparkwright', mood: 'happy', text: 'A Juggernaut! Brilliant! You’re exactly who I need! I’m building a machine from the Gilded Engine’s old drawings that can dig a whole seam in an hour. No more miners! Nobody ever has to go down a hole again! Come and look!',
        choices: [{ text: 'No more miners?', to: null, quest: true, effects: [{ setFlag: 'juggernaut.fizz_asked', value: true }] }],
      },
      back: {
        speaker: 'npc:bearer-sparkwright', text: 'I’ve been thinking about your question all week, and I’ve got an answer. It isn’t a very good one yet. But machines are for the work, and people are for the people. When we go to the Heart, you’re in my calculations. Right at the top. Underlined.',
        effects: [{ setFlag: 'juggernaut.fizz_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-juggernaut-fizz-machine', name: 'The Machine Age: the machine', scope: 'party',
    entries: [{ when: stage('quest:juggernaut-the-machine-age', 'machine'), node: 'machine' }, { node: 'plain' }],
    nodes: {
      machine: {
        speaker: 'narrator', text: 'In the yard of the Sparkwright Works: twelve iron arms, a boiler, a great many dials and a drill the size of a cart. It will do the work of forty miners, the Sparkwright bearer says, glowing. Every miner. Forever.',
        choices: [
          { text: 'Then what are we for?', to: 'for', effects: [{ setFlag: 'juggernaut.machine', value: 'asked' }] },
          { text: '(Help them tighten the drill.) Make it dig the bad seams. The ones that kill people.', to: 'help', effects: [{ setFlag: 'juggernaut.machine', value: 'helped' }] },
        ],
      },
      for: { speaker: 'narrator', text: 'The Sparkwright bearer opens their mouth, and shuts it, and looks at the machine, and at you. They had not, it turns out, thought about that part. They write the question on the boiler in chalk, so they will not forget it.', next: null },
      help: { speaker: 'narrator', text: 'You hold the drill-head while the Sparkwright bearer tightens it. The bad seams, you tell them. The flooded ones, the gassy ones, the Lode. Let the machine have those. Let the miners have the rest, and their dinner. They write it on the boiler in chalk.', next: null },
      plain: { speaker: 'narrator', text: 'A twelve-armed digging machine, with a question chalked on its boiler.', next: null },
    },
  },
];

export default dialogues;
