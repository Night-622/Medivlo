/**
 * Hollow Crown, BRAWLER: Lowfold people (general talk), the eight side quests, the mentor thread and the bounties,
 * plus the Act II class-thread and featured-bearer scenes. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const offer = (q: Q, text: string, to: string, extra?: NarrativeCondition): DialogueChoice =>
  ({ text, to, quest: true, when: extra ? { all: [fresh(q), extra] } : fresh(q), effects: [{ startQuest: q }] });
const bye: DialogueChoice = { text: 'Farewell.', to: null, tag: 'leave' };
const TK = 'npc:tobiah-knuckle' as const;

const dialogues: DialogueDef[] = [
  // ---------- Pops (general + mentor thread + Names on the Wall)
  {
    id: 'dialogue:brawler-pops', name: 'Pops (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: TK, text: 'Number nine’s the beef. Number twelve’s the beef with an egg. There is no number eleven. Don’t ask about eleven.',
        choices: [
          offer('quest:brawler-the-towel', 'Pops, have you ever thrown in the towel?', 'towel', { trust: TK, value: 'friendly' }),
          offer('quest:brawler-the-last-herb', 'What’s missing from the stock?', 'herb', { trust: TK, value: 'trusted' }),
          offer('quest:brawler-names-on-the-wall', 'Is there a list of the ones Silas sold?', 'names', { questCompleted: 'quest:brawler-sold-by-the-head' }),
          { text: 'Tell me about the night you knocked down Doran Kell.', to: 'kell', when: { trust: TK, value: 'trusted' } },
          bye,
        ],
      },
      kell: { speaker: TK, mood: 'happy', text: '(He puts the ladle down, which he never does.) C. 1009. The Grand Pit. He came down off the mountain to show the valley what a master looked like, and I was the valley. Round four. Left hook. He went down like a wardrobe.', next: 'kell2' },
      kell2: {
        speaker: TK, text: 'And he got up. Course he did. Took me apart in round six. But he went down first, and four thousand people saw it, and Marta stood on her bench and screamed so loud they had to stop the bout.',
        choices: [
          { text: 'You never wore the belt again.', to: 'kell3' },
          { text: 'Marta sounds wonderful.', to: 'kell4', trust: 1 },
        ],
      },
      kell3: { speaker: TK, text: 'Didn’t need to. I’d had my night. A man only needs the one. The rest is noodles. (He picks the ladle back up.) Eat.', next: null },
      kell4: { speaker: TK, mood: 'sad', text: 'She was. She was louder than me, and I was loud. (He stirs the pot, slowly.) Every night I put the stock on, I think, she’d tell me it wants salt. It always wants salt. Eat your noodles.', next: null },
      towel: { speaker: TK, text: 'Once. Once in forty years. Come back after closing. I’ll do you a bowl and I’ll tell you. Not with the whole Pits listening.', next: null },
      herb: { speaker: TK, mood: 'sad', text: 'That stock has been on since C. 1003. It’s missing one thing. My Marta used to pick a herb on the Goat Paths, on a ledge above the third bend. Rainwort, she called it. Nobody else calls it anything. I never found the ledge without her.', next: null },
      names: { speaker: TK, mood: 'sad', text: 'There’s a cell in the Quarry Rings where he kept them before the tunnel. Big Mother Ox says they scratched their names in the wall. Copy them out for me. All of them. I want to read every one.', next: null },
    },
  },
  {
    id: 'dialogue:brawler-pops-towel', name: 'Mentor: The Towel', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: TK, text: '(After closing. Two bowls. He eats slowly.) Silas. He was sixteen, and fast, and he had a left hook like a door slamming, and I cornered him. Best kid I ever had. Final of the Lowfold Juniors.', next: 'eye' },
      eye: {
        speaker: TK, mood: 'sad', text: 'Round six, his eye’s gone, he can’t see the right side. He won’t go down. He’d have lost the eye. So I threw in the towel. Only time I ever did. Next morning his promoter sold his contract to the outlaw rings, for the loss. And Silas learned that nobody fights for you.',
        choices: [{ text: 'You threw it in to save his eye.', to: 'end', insight: 'silas_towel', trust: 1 }],
      },
      end: { speaker: TK, text: 'Saved his eye. Lost the boy. (He puts the towel over his shoulder, where it always is.) I still don’t know if it was right. I’d do it again. That’s what a corner is.', next: null },
    },
  },
  {
    id: 'dialogue:obj-marta-herb-ledge', name: 'Mentor: Marta’s ledge',
    entries: [{ node: 'h' }],
    nodes: { h: { speaker: 'narrator', text: 'Above the third bend, a narrow ledge where nobody would go unless they knew. Grey-green leaves in the cracks, smelling of rain on hot stone. Somebody once cut a small step into the rock to reach them, and worn it smooth with years of going.', next: null } },
  },
  {
    id: 'dialogue:obj-pops-stock-pot', name: 'Pops’s stock-pot',
    entries: [{ when: stage('quest:brawler-the-last-herb', 'pot'), node: 'add' }, { node: 'pot' }],
    nodes: {
      add: { speaker: 'narrator', text: 'You drop the rainwort into the stock-pot while Pops is round the back of the cart. The stock has been simmering since C. 1003. It changes colour, very slightly, like a room when somebody you love walks into it.', next: null },
      pot: { speaker: 'narrator', text: 'Pops’s stock-pot, simmering, as it has every day since C. 1003.', next: null },
    },
  },
  {
    id: 'dialogue:brawler-pops-herb', name: 'Mentor: The Last Herb', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: TK, text: '(He tastes the stock, the way he tastes it every evening. He stops. He tastes it again.) What did you do. What did you put in my… (His face goes still.) That’s hers. That’s Marta’s.', next: 'end' },
      end: { speaker: TK, mood: 'sad', text: 'Thirty-nine years I’ve been cooking this and it was never right. (He sits down on his stool.) Go away for a minute, kid. No, don’t. Stay. Have a bowl. Have the first bowl. It’s a very good bowl.', effects: [{ trust: TK, delta: 1 }], next: null },
    },
  },
  {
    id: 'dialogue:brawler-pops-names', name: 'Side: Names on the Wall', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: TK, text: '(He reads them out loud. Every one. He knows some of them, and he stops at those, and goes on.) Hal Brunt. Peg Shaw. Young Halloran. (He gets to the end.) Two hundred and twelve.',
        choices: [{ text: 'We’ll bring them home, Pops.', to: 'home', trust: 1 }, { text: '(Sit with him.)', to: 'home' }],
      },
      home: { speaker: TK, text: 'Keep the list. Keep it on you. If you ever find them, wherever he sent them, you read them their names. Every one. People come back to their names.', next: 'board' },
      board: { speaker: TK, text: 'And copy it again, on the fight-board in Knuckletown, where they chalk up the night’s bouts. Every name. In big letters. I want this town to read them on its way to the rings. Every night. Until somebody’s ashamed.', next: null },
    },
  },
  // ---------- Silas (general)
  {
    id: 'dialogue:brawler-silas', name: 'Silas Gaunt (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:silas-gaunt', mood: 'happy', text: 'My champion! Practically. Nearly. Have you thought about a nickname? You need a nickname. “The Door.” No. Something will come to me.',
        choices: [
          { text: 'What happened to your eye, Silas?', to: 'eye', when: { insight: 'silas_towel' } },
          { text: 'Do you ever fight, Mr Gaunt?', to: 'fight' },
          bye,
        ],
      },
      eye: { speaker: 'npc:silas-gaunt', text: '(He touches the scar under his right eye, lightly.) It’s fine. Somebody made sure of that, once. I never thanked him. It cost me my contract. Run along, champion.', next: null },
      fight: { speaker: 'npc:silas-gaunt', text: 'I used to. Then I learned the money is all on the outside of the ropes. Everybody in there is fighting for somebody else, in the end. I just make sure it’s me.', next: null },
    },
  },
  // ---------- Knuckletown: Abigail, the Bunting Committee, Bess
  {
    id: 'dialogue:brawler-abigail', name: 'Honest Abigail Tuck (Honest Abigail’s Book)',
    entries: [{ when: stage('quest:brawler-honest-abigails-book', 'abigail'), node: 'pay' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:abigail-tuck', text: 'Honest Abigail. Forty years with a book in the Lowfold, and I have never once taken a bet against a local fighter. It is a ridiculous way to run a book. Silas’s runners have been telling everyone so.',
        choices: [offer('quest:brawler-honest-abigails-book', 'Put me on your book.', 'book'), bye],
      },
      book: { speaker: 'npc:abigail-tuck', text: 'Three bouts, three village rings. If you win all three my book stays open, and his runners go home with empty pockets. If you lose I am going to be extremely honest about it.', next: null },
      pay: {
        speaker: 'npc:abigail-tuck', mood: 'happy', text: 'Three for three! Silas’s runners all bet against you, because they always bet against anybody I back. (She counts coins into your glove.) Your share. Exactly your share. To the copper.',
        choices: [{ text: 'Keep the book open, Abigail.', to: 'open', trust: 1 }, { text: 'Exactly to the copper?', to: 'copper' }],
      },
      open: { speaker: 'npc:abigail-tuck', text: 'Open for as long as there’s a local fighter worth backing. If you’re ever going anywhere they bet on fights, look for me. Somebody will need an honest book.', next: 'odds' },
      copper: { speaker: 'npc:abigail-tuck', text: 'To the copper. That’s the whole trick, love. It’s the only one I know.', next: 'odds' },
      odds: { speaker: 'npc:abigail-tuck', mood: 'happy', text: 'Now. One more thing, for pleasure. (She writes a card in a very large hand.) My closing odds. Pin that on his runners’ board across the square. I want them to read it every time they open up. I want them to read it twice.', next: null },
    },
  },
  {
    id: 'dialogue:obj-abigail-bout-3', name: 'Honest Abigail’s Book: the third bout',
    entries: [{ when: stage('quest:brawler-honest-abigails-book', 'bouts'), node: 'bout' }, { node: 'plain' }],
    nodes: {
      bout: { speaker: 'narrator', text: 'The third village ring, in a barn. Your opponent is a blacksmith who hits like an anvil and moves like one too. You let him swing until he is tired of swinging, then tap him on the nose. He sits down and laughs. In the corner, one of Silas’s runners tears up a betting slip.', next: null },
      plain: { speaker: 'narrator', text: 'A village ring in a barn, the ropes still swaying.', next: null },
    },
  },
  {
    id: 'dialogue:brawler-peony', name: 'Mrs Peony Crouch (the Bunting Committee)',
    entries: [{ when: stage('quest:brawler-the-bunting-committee', 'peony'), node: 'inspect' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:peony-crouch', text: 'The Bunting Committee. That is me, and my sisters, who are not here, because they are watching you from that window. The bunting has gone black at the edges. It must all come down and all go up again by the title bout.',
        choices: [offer('quest:brawler-the-bunting-committee', 'I’ll do it, Mrs Crouch.', 'do'), bye],
      },
      do: { speaker: 'npc:peony-crouch', text: 'Red, yellow, red, yellow. Never two yellows together. Never. My sister Violet will be checking. My sister Iris will be checking Violet.', next: null },
      inspect: {
        speaker: 'npc:peony-crouch', text: '(She inspects every string. A window opens across the street. A window opens next to it.) Hm. Hm. Third string. Is that two yellows?',
        choices: [
          { text: 'It’s a very orange red, Mrs Crouch.', to: 'orange' },
          { text: '(Stand very still and say nothing.)', to: 'still', trust: 1 },
        ],
      },
      orange: { speaker: 'npc:peony-crouch', text: '(A long pause. Both windows wait.) A very orange red. Yes. Violet, it is a very orange red! (A distant voice: “It is NOT.”) Pies, for your trouble. Never mind Violet.', next: 'attic' },
      still: { speaker: 'npc:peony-crouch', mood: 'happy', text: 'Hm. (Both windows close.) It will do. It will do very well. Our Arnold always fidgeted. Pies, dear. Take two.', next: 'attic' },
      attic: { speaker: 'npc:peony-crouch', text: 'But for the title bout there is only one proper string. The championship bunting, from Tobiah Knuckle’s night in C. 1009, packed in tissue in my attic. Nobody has touched it in thirty-three years. You may. Wash your hands.', next: null },
    },
  },
  {
    id: 'dialogue:obj-bunting-4', name: 'The Bunting Committee: the last string',
    entries: [{ node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'The last string of bunting goes up across the street, red, yellow, red, yellow. Across the way, two curtains twitch in perfect unison.', next: null } },
  },
  {
    id: 'dialogue:brawler-bess', name: 'League Steward Bess Plummet (bounties)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:bess-plummet', text: 'Pit Leagues. Bounties are on the League board, payable in League coin, which is dry. I check.',
        choices: [
          offer('quest:brawler-bounty-quarry-slimes', 'The Quarry Slimes.', 'slimes'),
          offer('quest:brawler-bounty-rogue-monk-gang', 'The Rogue Monk gang?', 'monks'),
          bye,
        ],
      },
      slimes: { speaker: 'npc:bess-plummet', text: 'Stone Slimes in the quarry rings. They sit in the middle of the ring and refuse to move, which is not a recognised defensive style. Six of them.', next: null },
      monks: { speaker: 'npc:bess-plummet', text: 'Rogue Monks on the Goat Paths, mugging pilgrims and then lecturing them about attachment. The pilgrims say the lecture is worse. Five of them.', next: null },
    },
  },
  // ---------- the Lowfold Pits: Doc Lint, Tilly
  {
    id: 'dialogue:brawler-doc', name: 'Doc Saffie Lint (Doc Lint’s Thread)',
    entries: [{ when: stage('quest:brawler-doc-lints-thread', 'doc'), node: 'silk' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:saffie-lint', text: 'Doc Lint. Cutwoman. I am out of stitching silk, and the only silk in the valley is in the saddlebags of a smuggler’s goat, which has gone to eat the Grand Pit’s posters.',
        choices: [offer('quest:brawler-doc-lints-thread', 'I’ll catch the goat.', 'goat'), bye],
      },
      goat: { speaker: 'npc:saffie-lint', text: 'Brown goat, saddlebags, a look in its eye. Don’t pull the bags. Ask nicely. That goat has more sense than most of my fighters.', next: null },
      silk: {
        speaker: 'npc:saffie-lint', text: 'Silk! Slightly chewed. I’ve stitched with worse. (She threads a needle without looking.) My rule, since you’re here. Nobody bleeds in my corner for longer than they have to.',
        choices: [
          { text: 'Did you ever break that rule?', to: 'rule' },
          { text: 'Did you ever stitch for Silas Gaunt?', to: 'silas' },
        ],
      },
      rule: { speaker: 'npc:saffie-lint', text: 'Never. Not once. Here. Red Draughts, for the next time you bleed in somebody else’s corner.', next: 'patient' },
      silas: {
        speaker: 'npc:saffie-lint', mood: 'sad', text: 'Once. He was sixteen. Juniors final. His eye was going and he wouldn’t go down, and Pops Knuckle threw in the towel to save it. Only time Pops ever did. I put eleven stitches in that boy’s face. Next morning his promoter sold his contract for the loss.',
        choices: [{ text: 'Pops threw it in to save his eye.', to: 'end', insight: 'silas_towel' }],
      },
      end: { speaker: 'npc:saffie-lint', text: 'Saved his eye. Pops has never forgiven himself. Silas has never forgiven anybody. Here. Red Draughts. Take them.', next: 'patient' },
      patient: { speaker: 'npc:saffie-lint', text: 'And since you’ve fetched the silk, you can use it. There’s a lad in the practice ring with a cut over his eye, and my hands shake now in the cold. I’ll talk. You stitch. Don’t faint. Fainting is for the fighter.', next: null },
    },
  },
  {
    id: 'dialogue:obj-silk-goat', name: 'Doc Lint’s Thread: the smuggler’s goat',
    entries: [{ when: stage('quest:brawler-doc-lints-thread', 'goat'), node: 'goat' }, { node: 'plain' }],
    nodes: {
      goat: { speaker: 'narrator', text: 'A brown goat with fat saddlebags, eating a poster of Big Mother Ox from the bottom up. It looks at you. You ask, nicely, for the silk. It considers this, and allows you to take one bolt, and goes back to Big Mother Ox’s knees.', next: null },
      plain: { speaker: 'narrator', text: 'A half-eaten poster of Big Mother Ox. Only the head and shoulders remain.', next: null },
    },
  },
  {
    id: 'dialogue:brawler-tilly', name: 'Tin-Can Tilly',
    entries: [{ when: stage('quest:brawler-tin-can-tilly', 'tilly'), node: 'corner' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:tilly', text: '(A girl of twelve with a tin can tied to each fist, shadow-boxing a post.) I’m going to fight in the Grand Pit. Pops says no. Pops says no to everything. I’ve got cans.',
        choices: [offer('quest:brawler-tin-can-tilly', 'Ever worked a corner, Tilly?', 'corner-q'), bye],
      },
      'corner-q': { speaker: 'npc:tilly', text: 'A corner? That’s for people who can’t fight. (She looks at you.) Is it? Pops works a corner. Pops could knock anybody down. Fine. Show me.', next: null },
      corner: {
        speaker: 'npc:tilly', mood: 'happy', text: 'Bucket, stool, towel. Sixty seconds. Water, not too much. Look at the eyes. Tell them one thing, only one, and make it true. I’m GOOD at this. I’m better at this than hitting.',
        choices: [
          { text: 'You’re the best corner in the Pits, Tilly.', to: 'best', trust: 1 },
          { text: 'One day you can fight. Not yet.', to: 'yet' },
        ],
      },
      best: { speaker: 'npc:tilly', mood: 'happy', text: 'I know! (She takes the cans off.) I’m going to corner you. Wherever you go. Don’t tell Pops.', next: 'hob' },
      yet: { speaker: 'npc:tilly', text: 'Not yet. That’s not a no. (She grins.) I’ll corner you until it’s yet. Wherever you go.', next: 'hob' },
      hob: { speaker: 'npc:tilly', mood: 'happy', text: 'And I’ve got a REAL one. Tonight. Big Hob from the tannery, village ring, three rounds. His cornerman’s got the gout. I’m doing the bucket and the stool and the towel. Come and watch. Don’t help. If you help I’ll bite you.', next: null },
    },
  },
  {
    id: 'dialogue:obj-tilly-corner-3', name: 'Tin-Can Tilly: the towel',
    entries: [{ node: 't' }],
    nodes: { t: { speaker: 'narrator', text: 'The towel lesson. Tilly learns to flick it, to fold it, to hang it on her shoulder exactly as Pops does, and finally, solemnly, never to throw it unless she means it. She practises not throwing it for some time.', next: null } },
  },
  // ---------- the Goat Paths: Old Nob, One Coat
  {
    id: 'dialogue:brawler-nob', name: 'Old Nob Furze (Old Nob’s Goats)',
    entries: [{ when: stage('quest:brawler-old-nobs-goats', 'nob'), node: 'letter' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:nob-furze', text: 'Smuggler. Retired. Mostly. My goats know every path between every valley in the Lowfold. Or they did. They’ve gone all wet about the eyes and they keep taking the wrong ones.',
        choices: [offer('quest:brawler-old-nobs-goats', 'I’ll turn them round.', 'turn'), bye],
      },
      turn: { speaker: 'npc:nob-furze', text: 'Gently. They kick. Speckle, Bramblehoof and the one with no name, who is the smartest, which is why she doesn’t need one.', next: null },
      letter: {
        speaker: 'npc:nob-furze', text: 'All three home. Bless you. (He goes through the saddlebags.) Cheese, cheese, wool, cheese. And this isn’t mine. (A sealed letter: the King’s Climbers’ mark, addressed to S. Gaunt, Quarry Rings.)',
        choices: [{ text: '(Break the seal.)', to: 'read', effects: [{ setFlag: 'brawler.climber_letter', value: true }] }, { text: 'Burn it.', to: 'burn' }],
      },
      read: { speaker: 'narrator', text: '“Payment received for forty fighters, for the King’s service. The coin you sent was wet. The King asks that you send dry coin in future. The King’s Climbers.” Silas has been selling to the Climbers too. And paying them in wet coin.', next: 'tent' },
      burn: { speaker: 'npc:nob-furze', text: 'Burn a Climber’s letter? On my path? (He thinks.) Do you know, I’ve wanted to for years. Go on, then.', next: 'tent' },
      tent: { speaker: 'npc:nob-furze', text: 'Climbers have a tent at the foot of the Goat Paths. Recruiting. Very polite. Very grey. Whoever wrote that, they’ll be in there with a pot of tea pretending to be holy. Go and ask them about it. Take Speckle. She bites monks.', next: null },
    },
  },
  {
    id: 'dialogue:obj-nob-goat-3', name: 'Old Nob’s Goats: the one with no name',
    entries: [{ node: 'g' }],
    nodes: { g: { speaker: 'narrator', text: 'The goat with no name is on a path that goes nowhere, with her eyes wet and black, carrying a letter that is not hers. You turn her round. She lets you. For a moment her eyes clear, and she looks at you as if to say: about time.', next: null } },
  },
  {
    id: 'dialogue:brawler-gert', name: 'Gert Haddow (One Coat)',
    entries: [{ when: stage('quest:brawler-one-coat', 'gert'), node: 'after' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:gert-haddow', text: '(Shouting through a stone hut door in a blizzard.) I am NOT sharing a coat with Rufus Thrush! I would rather freeze! I am actively freezing!',
        choices: [offer('quest:brawler-one-coat', '(Go into the hut.)', 'in'), bye],
      },
      in: { speaker: 'npc:gert-haddow', text: 'Oh, it’s the Brawler. Tell him. Tell him eleven years ago he fought dirty at the Harvest Ring. Tell him I’m keeping the coat. Tell him I’m not cold.', next: null },
      after: {
        speaker: 'npc:gert-haddow', text: '(The storm has passed. Gert is wearing one sleeve of a coat. Rufus Thrush is wearing the other. Neither is mentioning it.) …He didn’t fight dirty. I slipped. Eleven years. I slipped on a turnip.',
        choices: [{ text: 'Tell him.', to: 'tell', trust: 1 }, { text: 'The coat suits you both.', to: 'coat' }],
      },
      tell: { speaker: 'npc:gert-haddow', text: '(Across the hut, Rufus says, quietly, “I know. I saw the turnip.” There is a very long silence.) Rematch. Spring. Harvest Ring. No turnips.', next: 'now' },
      coat: { speaker: 'npc:gert-haddow', text: 'It does not. (It does.) Here. For getting us through. Don’t spend it on coats.', next: 'now' },
      now: { speaker: 'npc:gert-haddow', text: '(Rufus, from the other sleeve: “Spring’s a long way off.”) …It is. (A pause.) Harvest Ring. This afternoon. You referee. Neither of us trusts the other one to count.', next: null },
    },
  },
  {
    id: 'dialogue:obj-goat-path-shelter', name: 'One Coat: the shelter', scope: 'party',
    entries: [{ when: stage('quest:brawler-one-coat', 'shelter'), node: 'hut' }, { node: 'plain' }],
    nodes: {
      hut: {
        speaker: 'narrator', text: 'A stone shelter, one fire, two village champions in opposite corners, glaring, blue with cold. One coat, folded on the floor exactly between them, untouched.',
        choices: [
          { text: '(Pick up the coat and put one sleeve on each of them.)', to: 'sleeves' },
          { text: 'Square up to both of you, then. One round. Loser keeps warm.', to: 'round', school: 'fist' },
        ],
      },
      sleeves: { speaker: 'narrator', text: 'You hold them both still, which is not easy, and put a sleeve on each. Now they have to sit side by side. They sit side by side. After an hour, one of them starts telling the other about a turnip.', next: null },
      round: { speaker: 'narrator', text: 'They both come at you at once, out of sheer outrage, and in two minutes all three of you are sitting by the fire, warm, out of breath and, against all expectation, laughing. Somebody puts the coat over all three sets of knees.', next: null },
      plain: { speaker: 'narrator', text: 'A stone shelter on the high path, with a woodpile somebody has kindly restocked.', next: null },
    },
  },
  // ---------- the Quarry Rings: Mouse Mallory, the names wall
  {
    id: 'dialogue:brawler-mouse', name: 'Mouse Mallory (the Undercard)',
    entries: [{ when: stage('quest:brawler-the-undercard', 'mouse'), node: 'purse' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:mouse-mallory', text: 'Mouse. Undercard. Always the undercard. They fight us in the dark so nobody can see who won, and the house keeps the purse. Nobody’s ever taken it off them.',
        choices: [offer('quest:brawler-the-undercard', 'Put me on tonight’s undercard.', 'on'), bye],
      },
      on: { speaker: 'npc:mouse-mallory', text: 'In the dark? You’re mad. I like you. Fight by ear. Listen for the breathing. The big ones breathe like bellows.', next: null },
      purse: {
        speaker: 'npc:mouse-mallory', text: '(The undercard fighters are on the quarry steps with their hands wrapped. You hold out the purse.) That’s the house purse. You’re giving it… to us?',
        choices: [
          { text: 'You fought for it. Split it.', to: 'split', trust: 1 },
          { text: 'Every copper. The house can fight me for it.', to: 'split' },
        ],
      },
      split: { speaker: 'npc:mouse-mallory', mood: 'happy', text: '(She shares it out, carefully, one each, round the steps. There is one coin over. She gives it to you.) Your cut. Undercard rules. Everybody gets paid. First time ever.', next: null },
    },
  },
  {
    id: 'dialogue:obj-undercard-purse', name: 'The Undercard: the house purse',
    entries: [{ node: 'p' }],
    nodes: { p: { speaker: 'narrator', text: 'A leather purse on a crate in the dark, unguarded, because nobody ever wins the undercard but the house. It is dry. It is the only dry purse in the Quarry Rings.', next: null } },
  },
  {
    id: 'dialogue:obj-quarry-names-wall', name: 'Names on the Wall',
    entries: [{ when: stage('quest:brawler-names-on-the-wall', 'wall'), node: 'copy' }, { node: 'plain' }],
    nodes: {
      copy: { speaker: 'narrator', text: 'A cell under the old quarry crane. Every inch of its wall is scratched with names, some deep and careful, some barely there. Hal Brunt. Peg Shaw. Young Halloran, with a little boxing glove beside it. You copy out every one, by lamplight, until your hand aches.', next: null },
      plain: { speaker: 'narrator', text: 'A quarry cell wall, covered in names. Two hundred and twelve of them.', next: null },
    },
  },

  // ======================= ACT II
  {
    id: 'dialogue:brawler-moll', name: 'C-1 the cellar ring: Moll Treadwell', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:moll-treadwell', text: '(Under the Briar & Kettle, a cellar with a rope ring, forty Lowfold accents and a smell of liniment.) Lowfold! Proper Lowfold! Moll Treadwell. We came through for an exhibition bout in C. 1012 and the arches shut on us. We’ve been doing Saturdays ever since.',
        choices: [
          { text: 'I fought for the League before I came.', to: 'league', when: { flag: 'brawler.purse', value: 'league' }, trust: 1 },
          { text: 'Honest Abigail came through after me.', to: 'abigail', when: { flag: 'brawler.abigail_book' } },
          { text: 'I’m looking for Fist’s Sentinel.', to: 'sentinel' },
        ],
      },
      league: { speaker: 'npc:moll-treadwell', mood: 'happy', text: 'A League fighter! Then you’re one of ours, and the cellar stands with you. (Forty fighters bang the ring-posts at once.) Whatever you’re going to hit, we’ll be there to watch it fall.', effects: [{ setFlag: 'brawler.cellar_stands', value: true }], next: 'sentinel' },
      abigail: { speaker: 'npc:moll-treadwell', text: 'Abigail Tuck? Honest Abigail? She’s set up a book at the Kilnmouth ash-pits already. First honest book in Concordia. They don’t know what’s hit them.', next: 'sentinel' },
      sentinel: {
        speaker: 'npc:moll-treadwell', text: 'The Stone Abbot. Fist’s Sentinel. The Ooze Sovereign ate him, in the bog behind the village. Now it fights like a monk. Which is cheating. And the slimes are all doing forms and wanting bouts. It’s embarrassing for everyone.',
        choices: [{ text: 'I’ll spar my way to it.', to: 'go', quest: true }],
      },
      go: { speaker: 'npc:moll-treadwell', text: 'Keep your guard up. They come at you in stances. The stances are terrible. That’s what makes them dangerous.', next: null },
    },
  },
  {
    id: 'dialogue:obj-brawler-mud-ring', name: 'C-2 the slimes’ mud-ring', scope: 'party',
    entries: [{ when: stage('quest:brawler-bog-sparring', 'ring'), node: 'ring' }, { node: 'plain' }],
    nodes: {
      ring: {
        speaker: 'narrator', text: 'At the edge of the black pool, the slimes have pressed a ring into the mud, roughly round. Twenty of them sit along its edge like a crowd. A large one in the middle raises what may be a fist.',
        choices: [
          { text: '(Touch gloves with it.)', to: 'touch' },
          { text: '(Step in, bounce on your toes, and give the crowd a wave.)', to: 'wave', school: 'fist' },
        ],
      },
      touch: { speaker: 'narrator', text: 'It touches gloves with you, wetly. Then the whole ring wobbles apart, and every slime turns to point, with most of itself, into the black water.', next: null },
      wave: { speaker: 'narrator', text: 'The slime crowd ripples with what is almost certainly applause. The big one in the middle bows, falls over, gets up, and points into the black water.', next: null },
      plain: { speaker: 'narrator', text: 'A mud-ring at the edge of the black pool, already filling with water.', next: null },
    },
  },
  {
    id: 'dialogue:brawler-sovereign-bout', name: 'C-3 the Ooze Sovereign squares up', scope: 'party',
    entries: [{ when: { flag: 'brawler.cellar_stands' }, node: 'cellar' }, { node: 'rise' }],
    nodes: {
      cellar: { speaker: 'narrator', text: 'Behind you, on the bank, the whole cellar ring has turned out in its Saturday best, banging pans and chanting your name. Moll is on a crate with a bell. You have never had a crowd like it.', next: 'rise' },
      rise: { speaker: 'narrator', text: 'The pool heaves up into a vast shape of ooze and bramble and settles into a perfect monk’s stance. It bows. It fights like a monk, because it ate one. You have always thought monks were cheating. Now you know.', next: null },
    },
  },
  {
    id: 'dialogue:obj-brawler-fight-card', name: 'C-4 Silas’s fight card', scope: 'party',
    entries: [{ when: stage('quest:brawler-the-ashmaw-bout', 'card'), node: 'card' }, { node: 'plain' }],
    nodes: {
      card: { speaker: 'narrator', text: 'Pasted to the wall of the Cinder Mug: SILAS GAUNT PRESENTS. THE BEAST UNDER THE KILNS. UNBEATEN IN A THOUSAND YEARS. CHALLENGERS WELCOME. ALL LOSERS RETAINED BY THE PROMOTER. In very small print at the bottom: tickets, two shards. Your name is on it, as the challenger. He did not ask.', next: null },
      plain: { speaker: 'narrator', text: 'A torn fight card on the wall of the Cinder Mug.', next: null },
    },
  },
  {
    id: 'dialogue:obj-brawler-climber-signal', name: 'C-4 the Climbers’ signal at the Ashworks', scope: 'party',
    entries: [{ when: stage('quest:brawler-the-ashmaw-bout', 'climbers'), node: 'call' }, { node: 'plain' }],
    nodes: {
      call: { speaker: 'narrator', text: 'You light the Climbers’ signal on the Ashworks roof: three handfuls of juniper and a whistle, the way they showed you before the Grand Pit. Before the smoke has cleared there are grey robes on the Kiln Row, Climber exiles who came through after you and have been waiting for somebody to call.', next: null },
      plain: { speaker: 'narrator', text: 'Juniper ash on the Ashworks roof.', next: null },
    },
  },
  {
    id: 'dialogue:obj-brawler-silas-ledger', name: 'C-4 Silas’s ledger', scope: 'party',
    entries: [{ when: stage('quest:brawler-the-ashmaw-bout', 'contract'), node: 'ledger' }, { node: 'plain' }],
    nodes: {
      ledger: { speaker: 'narrator', text: 'Silas’s ledger, open at today. Tickets sold: four hundred. Losers retained: sixty, sold on to the Legion, by the head. And at the bottom of the page, in his neat hand, a contract with the Hollow King’s smiths.', next: 'contract' },
      contract: { speaker: 'narrator', text: '“The Promoter to be fitted to the beast as its chest and its voice, to call the rounds. In consideration of which: fifteen per cent of the gate, in perpetuity.” He has crossed out fifteen and written twenty. Somebody has initialled it.', next: null },
      plain: { speaker: 'narrator', text: 'An empty table by the kiln door, ringed with ink.', next: null },
    },
  },
  // ---------- C-6 A Menu with a Message (Tin-Can Tilly)
  {
    id: 'dialogue:brawler-tilly-menu', name: 'C-6 a menu with a message', scope: 'party',
    entries: [{ when: { flag: 'brawler.tilly_corner' }, node: 'corner' }, { node: 'start' }],
    nodes: {
      corner: { speaker: 'npc:tilly-concordia', mood: 'happy', text: '(Tin-Can Tilly, with a bucket, a stool and Pops’s second-best towel over her shoulder.) I’m your corner. I said I would be. Wherever you go. Pops doesn’t know I’m here. Pops knows I’m here. He gave me this.', next: 'menu' },
      start: { speaker: 'npc:tilly-concordia', mood: 'happy', text: '(Tin-Can Tilly, with a tin can on each fist and an expression of total innocence.) I wasn’t supposed to come. I came. Pops gave me this to give you. He also said not to come. He said both.', next: 'menu' },
      menu: { speaker: TK, text: '(On the back of a noodle menu, in pencil:) “The cart’s doing fine. The stock’s right, these days. I don’t know what you’re fighting through there but you’re not on your own. Hands up. Chin down. Get up every time. P.”', next: 'court' },
      court: {
        speaker: 'narrator', text: 'Number nine is circled. It is the beef. Later, at the Stone Court, your Pit half and the Monk’s Summit half ring together like two bowls struck at once.',
        choices: [
          { text: '(Talk to the Monk bearer.)', to: 'sefu', when: { not: { partyHasClass: 'monk' } } },
          { text: '(Grin at your Monk, whose half is ringing with yours.)', to: 'coop', when: { partyHasClass: 'monk' } },
        ],
      },
      sefu: { speaker: 'npc:bearer-monk', text: 'Brawler. I watched you come through the arch. You fight like a door slamming. (He bows.) I mean that kindly. A door that slams is a door that shuts, and somebody behind it is safe.', next: 'end' },
      coop: { speaker: 'narrator', text: 'Summit and Pit, ringing together. Your Monk says, very seriously, that you fight like a door slamming, and then has to explain for some time that this was meant kindly.', next: 'end' },
      end: {
        speaker: 'narrator', text: 'Tilly has already put the stool down beside you, as if the Stone Court were a ring and the next round about to start.',
        choices: [{ text: '(Fold Pops’s menu away.)', to: null, quest: true, effects: [{ setFlag: 'brawler.pops_menu', value: true }] }],
      },
    },
  },
  {
    id: 'dialogue:brawler-abigail-kilnmouth', name: 'Honest Abigail at Kilnmouth',
    entries: [{ node: 'book' }],
    nodes: { book: { speaker: 'npc:abigail-tuck-kilnmouth', mood: 'happy', text: 'First honest book in Concordia! They don’t know what to do with me. I’ve got you at evens against anything. I’d have you at evens against a kiln.', next: null } },
  },
  // ---------- featured bearers (hooks on the bearer NPCs)
  {
    id: 'dialogue:brawler-featured-reaver', name: 'Featured: The Reaver’s Bout', scope: 'party',
    entries: [
      { when: stage('quest:brawler-the-reavers-bout', 'back'), node: 'back' },
      { when: { all: [stage('quest:brawler-the-reavers-bout', 'pit'), { not: { flag: 'brawler.garrow_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-reaver', text: 'You’re going down to Ashmaw. So am I. Somebody goes first, and somebody goes second, and in the Muster we settle that the honest way. Ash-pits behind the Ore Market. Axes off. You’ve got gloves.',
        choices: [{ text: 'See you in the pit.', to: null, quest: true, effects: [{ setFlag: 'brawler.garrow_asked', value: true }] }],
      },
      back: {
        speaker: 'npc:bearer-reaver', mood: 'happy', text: 'Best bout I’ve had since the Fields. You get up like a war that won’t end. When we go into the Heart, you’re in my front rank, and I’m in your corner.',
        effects: [{ setFlag: 'brawler.garrow_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-brawler-ash-pit', name: 'The Reaver’s Bout: the ash-pit', scope: 'party',
    entries: [{ when: stage('quest:brawler-the-reavers-bout', 'pit'), node: 'bout' }, { node: 'plain' }],
    nodes: {
      bout: {
        speaker: 'narrator', text: 'A pit of soft ash behind the Ore Market, ringed with Kilnmouth smiths and, at the front with a chalkboard, Honest Abigail, taking bets at evens. The Reaver bearer has taken off their axe and is cracking their knuckles. First one down goes second into Ashmaw.',
        choices: [
          { text: '(Fight like the Lowfold: get hit, get up.)', to: 'up', effects: [{ setFlag: 'brawler.bout', value: 'up' }] },
          { text: '(Let them swing. Wait for the opening.)', to: 'wait', school: 'fist', effects: [{ setFlag: 'brawler.bout', value: 'wait' }] },
        ],
      },
      up: { speaker: 'narrator', text: 'They put you down four times. You get up four times. The fifth time, they sit down in the ash beside you, laughing, and say they are too tired to knock you down again. Everybody goes in together. Abigail pays out to the copper.', next: null },
      wait: { speaker: 'narrator', text: 'They swing like a Reaver: big, honest, everything behind it. You let the third one go past your ear and tap them on the chin. They sit down in the ash and laugh until they cough. Abigail pays out to the copper.', next: null },
      plain: { speaker: 'narrator', text: 'The Kilnmouth ash-pit, raked smooth, waiting for Saturday.', next: null },
    },
  },
  {
    id: 'dialogue:brawler-featured-knight', name: 'Featured: Knight Errant', scope: 'party',
    entries: [
      { when: stage('quest:brawler-knight-errant', 'back'), node: 'back' },
      { when: { all: [stage('quest:brawler-knight-errant', 'pen'), { not: { flag: 'brawler.edda_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-knight', text: 'Brawler. Silas Gaunt has fighters in a pen behind the Cinder Mug, sold to the Legion. I mean to buy them back, every one, at his price. The Order of the Anvil does not leave people in pens. I have… nearly none of his price. Will you come?',
        choices: [{ text: 'I’ll come. Leave your purse at home.', to: null, quest: true, effects: [{ setFlag: 'brawler.edda_asked', value: true }] }],
      },
      back: {
        speaker: 'npc:bearer-knight', text: 'Thirty years Ironhold has tried to pay for things. You showed me the cheaper way in one afternoon. I am going to have to write that down and think about it. When we go into the Heart, I am on your shield side, whether you carry a shield or not.',
        effects: [{ setFlag: 'brawler.edda_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-brawler-sold-pen', name: 'Knight Errant: the pen', scope: 'party',
    entries: [{ when: stage('quest:brawler-knight-errant', 'pen'), node: 'pen' }, { node: 'plain' }],
    nodes: {
      pen: {
        speaker: 'narrator', text: 'A wooden pen behind the Cinder Mug, a padlock, and a dozen quiet fighters in Lowfold wraps sitting on the straw. The Knight bearer is counting coins on top of a barrel, and keeps arriving at the same very small number.',
        choices: [
          { text: '(Break the padlock with one punch.) That’s the cheaper way.', to: 'lock', effects: [{ setFlag: 'brawler.pen', value: 'broken' }] },
          { text: '(Read the fighters their names, from Pops’s list.)', to: 'names', when: { flag: 'brawler.names_copied' }, effects: [{ setFlag: 'brawler.pen', value: 'named' }] },
          { text: '(Pay for one, and carry the rest out on your back.)', to: 'carry', effects: [{ setFlag: 'brawler.pen', value: 'carried' }] },
        ],
      },
      lock: { speaker: 'narrator', text: 'The padlock lasts exactly one punch. The Knight bearer stares at it, then at you, then at their coins, and starts to laugh, helplessly, in the way of somebody who has been trying very hard at the wrong thing for a long time.', next: null },
      names: { speaker: 'narrator', text: 'You read them out. One by one, the fighters on the straw look up at their own names, the way people look up when somebody calls them across a street. The Knight bearer unbolts the gate. Nobody pays anybody.', next: null },
      carry: { speaker: 'narrator', text: 'One copper, for one fighter, very politely, to an empty table. Then you carry out the other eleven, two at a time. The Knight bearer helps. By the end both of you are filthy and nobody has paid Silas anything at all.', next: null },
      plain: { speaker: 'narrator', text: 'An empty pen behind the Cinder Mug. Straw, and a broken padlock.', next: null },
    },
  },
];

export default dialogues;
