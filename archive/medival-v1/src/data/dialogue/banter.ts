/** Camp banter, part 1 (scenes 1–8 of docs/lore/13-companions.md §3). Each `dialogue:banter-*` plays once, on rest,
 *  when its entry passes (src/narrative/banter.ts): two companions following plus a story flag. Owner: Claude 4. */
import type { DialogueDef, NarrativeCondition, NarrativeEffect, NpcId } from '@/core';

const MAREN = 'npc:maren-hollis' as const;
const ANSELM = 'npc:anselm-pryde' as const;
const HESTA = 'npc:hesta-corrow' as const;
const CADOC = 'npc:cadoc-ap-ynys' as const;
const GRIMMA = 'npc:grimma-ironsong' as const;
const SABLE = 'npc:sable' as const;
const VESPER = 'npc:vesper-qadri' as const;

const f = (flag: string): NarrativeCondition => ({ flag });
const all = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: c });
const any = (...c: NarrativeCondition[]): NarrativeCondition => ({ any: c });
const fol = (npc: NpcId): NarrativeCondition => f(`companion.${npc.slice(4)}.following`);
const love = (npc: NpcId, delta: number): NarrativeEffect => ({ loyalty: npc, delta });

const dialogues: DialogueDef[] = [
  // ----- 1. Maren and Cadoc: hunting with a bow three hundred years older than her
  {
    id: 'dialogue:banter-maren-cadoc-bow', name: 'Banter: Maren and Cadoc (the bow)',
    entries: [{ when: all(fol(MAREN), fol(CADOC), f('act1.ylwen_pact')), node: 'open' }],
    nodes: {
      open: { speaker: 'narrator', next: 'c1', text: 'Maren is restringing her bow by the fire. Cadoc watches her with the face of a man watching someone fold his mother’s best linen the wrong way.' },
      c1: { speaker: CADOC, next: 'm1', text: 'You are putting the string on backwards.' },
      m1: { speaker: MAREN, next: 'c2', text: 'There’s no backwards on a string. It’s a string.' },
      c2: { speaker: CADOC, next: 'm2', text: 'There is a backwards on everything, if you live long enough. My thornbow was cut from a sapling my grandmother planted the spring your Charter was signed. It has opinions about strings.' },
      m2: {
        speaker: MAREN, mood: 'happy',
        text: 'Your bow has opinions. Well, mine’s yew, it’s six winters old, and it put a goose down at two hundred paces last autumn. What did yours do last autumn?',
        next: 'c3',
      },
      c3: {
        speaker: CADOC,
        text: 'Last autumn it flowered. (A pause.) Briefly. It was a difficult year for both of us.',
        choices: [
          { text: '“Show him the goose shot, Maren.”', to: 'shot', effects: [love(MAREN, 3)] },
          { text: '“Cadoc, show her how the Aelthi draw.”', to: 'draw', effects: [love(CADOC, 3)] },
          { text: '(Say nothing. Enjoy it.)', to: 'end' },
        ],
      },
      shot: { speaker: 'narrator', next: 'shot2', text: 'Maren does not even stand. She nocks, draws and looses in one breath, and a pine cone at the edge of the firelight jumps off its branch and is gone.' },
      shot2: { speaker: CADOC, next: 'shot3', text: 'Hm. Three hundred years, and I have never seen a human do that sober.' },
      shot3: { speaker: MAREN, mood: 'happy', next: 'end', text: 'Who says I’m sober?' },
      draw: { speaker: 'narrator', next: 'draw2', text: 'Cadoc rises, takes up the thornbow and draws it slowly to the ear, his eyes half closed, as if listening for something a long way off. He holds it. He holds it a good while longer. Then he lets the string down without loosing.' },
      draw2: { speaker: MAREN, next: 'draw3', text: 'That’s the same draw as mine. You just did it slower, and sadder.' },
      draw3: { speaker: CADOC, next: 'end', text: 'Yes. That is the Aelthi draw.' },
      end: {
        speaker: CADOC, mood: 'sad',
        text: '(Later, when Maren has gone to check the snares, he says it to the fire.) Do you know how many archers I have watched grow old, spark? I stopped learning their names. I may have to start again. It is very inconsiderate of her.',
      },
    },
  },

  // ----- 2. Maren and Sable: Haldren thieves and village honesty
  {
    id: 'dialogue:banter-maren-sable-honesty', name: 'Banter: Maren and Sable (honesty)',
    entries: [{ when: all(fol(MAREN), fol(SABLE), f('act1.wick_ledger_taken')), node: 'open' }],
    nodes: {
      open: { speaker: SABLE, mood: 'happy', next: 'm1', text: 'Maren, love, you’ve dropped this. (She holds out a small leather purse.)' },
      m1: { speaker: MAREN, next: 's1', text: 'I haven’t dropped anything. That’s on my belt. (She looks down.) That was on my belt.' },
      s1: { speaker: SABLE, next: 'm2', text: 'Practice. You have to keep your hand in, in winter; the fingers go stiff. I gave it back, didn’t I? That’s a kindness, in Haldren.' },
      m2: { speaker: MAREN, mood: 'angry', next: 's2', text: 'In Brindlecross nobody latches a door. You could walk into any house on the green and take the bread off the table, and nobody ever did.' },
      s2: { speaker: SABLE, mood: 'happy', next: 'm3', text: 'Nobody latches a door? Where is Brindlecross, exactly? Only asking for a friend. A very poor friend, with no bread.' },
      m3: {
        speaker: MAREN, mood: 'sad',
        text: 'Doesn’t matter now. Half the green burned at Lanternmass. There’s not much left to latch.',
        choices: [
          { text: '“Give the purse back properly, Sable, and say sorry.”', to: 'sorry', effects: [love(MAREN, 3), love(SABLE, -2)] },
          { text: '“Brindlecross folk have never been hungry enough to steal, Maren.”', to: 'hungry', effects: [love(SABLE, 3), love(MAREN, -2)] },
          { text: '(Let them sort it out.)', to: 'rule' },
        ],
      },
      sorry: { speaker: SABLE, next: 'rule', text: '(She ties it back on Maren’s belt, with a neat double knot.) Sorry. Truly. I forget, sometimes, that other folk had a hearth.' },
      hungry: { speaker: MAREN, mood: 'angry', next: 'rule', text: 'We were hungry enough. We just weren’t— (She stops.) …All right. Maybe we were lucky. Don’t tell her I said so.' },
      rule: { speaker: SABLE, next: 'end', text: 'The Hand has a rule, you know. First one they teach you. You don’t take from the hearth. A man’s last loaf, his child’s blanket, his mam’s ring. Not ever. (Brightly.) Purses, though. Purses are fair game. Purses want to travel.' },
      end: { speaker: MAREN, mood: 'happy', text: '(A long breath through the nose, which might be a laugh.) If you ever touch my bowstring, I’ll put you in the river.' },
    },
  },

  // ----- 3. Anselm and Vesper: two ex-clergy, one of whom burned an abbey
  {
    id: 'dialogue:banter-anselm-vesper-clergy', name: 'Banter: Anselm and Vesper (two habits)',
    entries: [{ when: all(fol(ANSELM), fol(VESPER), f('act2.vesper_joined')), node: 'open' }],
    nodes: {
      open: { speaker: 'narrator', next: 'v1', text: 'Anselm and Vesper are saying Compline on opposite sides of the fire, half a line apart, each pretending not to hear the other.' },
      v1: { speaker: VESPER, next: 'a1', text: 'You’re a beat behind on the response, Brother. “Et lux manet in tenebris.” It goes up at the end.' },
      a1: { speaker: ANSELM, next: 'v2', text: 'In Brindlecross it goes down at the end. We are a humble parish. Even our vowels are poor.' },
      v2: { speaker: VESPER, next: 'a2', text: 'I burned an abbey, you know.' },
      a2: { speaker: ANSELM, next: 'v3', text: 'I know. It’s on every notice from here to Solenne. They spell Aurenac wrong on most of them.' },
      v3: { speaker: VESPER, mood: 'happy', next: 'a3', text: 'On purpose. The Wick thinks if they misspell a place often enough it stops existing. It’s practically doctrine.' },
      a3: {
        speaker: ANSELM,
        text: 'Did anyone die? In the fire.',
        next: 'v4',
      },
      v4: { speaker: VESPER, next: 'a4', text: 'No one. I made sure of it. (A pause.) And the faith didn’t burn either, which is the annoying part. Twenty years a heretic and I still say Compline every night. To whom, I couldn’t tell you.' },
      a4: {
        speaker: ANSELM, mood: 'sad',
        text: 'Nor I. I keep saying it anyway. I think perhaps that’s what faith is, when the roof has come off: you go on saying the office, and wait to see who answers.',
        choices: [
          { text: '“The two of you should start a church.”', to: 'church' },
          { text: '“Anselm, could you have done what she did?”', to: 'could', effects: [love(ANSELM, 2)] },
          { text: '“You were in Valcastre, Anselm. So was she, once.”', to: 'cell', when: f('act2.anselm_freed') },
        ],
      },
      church: { speaker: VESPER, mood: 'happy', next: 'church2', text: 'Saints, no. We’d be excommunicating each other by Lanternmass.' },
      church2: { speaker: ANSELM, mood: 'happy', text: 'By the Feast of Saint Calder at the latest. I would want it done properly, with a bell.' },
      could: { speaker: ANSELM, next: 'could2', text: 'For a girl of fourteen with a candle in her finger? I would like to think so. I forged a Prior’s name on a licence once, and I was sick in the vestry afterwards. I don’t think I could have lit the match.' },
      could2: { speaker: VESPER, mood: 'sad', effects: [love(VESPER, 2)], text: 'You’d have stayed behind to put it out. That’s worse, Brother. That’s how they catch you.' },
      cell: { speaker: VESPER, next: 'cell2', text: 'The cells under the Lamp-house. Third from the stair has a drip that keeps the hours better than the bell does.' },
      cell2: { speaker: ANSELM, mood: 'happy', next: 'cell3', text: 'Matins every quarter of an hour, all night. I named him Brother Drip. He was the most devout member of the community.' },
      cell3: { speaker: VESPER, mood: 'sad', effects: [love(VESPER, 2), love(ANSELM, 2)], text: 'He was there in my time too. (She looks into the fire.) I’m glad somebody got you out, Brother. Nobody ever gets out of that one.' },
    },
  },

  // ----- 4. Anselm and Hesta: the Purge, and the Church’s guilt
  {
    id: 'dialogue:banter-anselm-hesta-purge', name: 'Banter: Anselm and Hesta (the Purge)',
    entries: [
      { when: all(fol(ANSELM), fol(HESTA), f('act1.cinderhold_restored'), f('prologue.anselm_secret')), node: 'primer' },
      { when: all(fol(ANSELM), fol(HESTA), f('act1.cinderhold_restored')), node: 'open' },
    ],
    nodes: {
      primer: { speaker: HESTA, next: 'a0', text: 'You kept the Primer, priest. A Warden’s Primer, in a Lanternate rectory. That’s a hanging matter.' },
      a0: { speaker: ANSELM, mood: 'happy', next: 'open', text: 'Only if it’s found. I kept it in the binding of a hymnal. No one has opened that hymnal in forty years. The tunes are dreadful.' },
      open: { speaker: ANSELM, next: 'h1', text: 'Mistress Corrow. I have wanted to say this since Cinderhold. On behalf of the Church, for the Night of Snuffed Candles… I am sorry.' },
      h1: { speaker: HESTA, mood: 'angry', next: 'a1', text: 'Don’t you dare. You weren’t born. Your great-grandmother’s grandmother wasn’t born. You don’t get to be sorry for 1041, it isn’t yours. Be sorry for this winter. Be sorry for the reports they buried while the leys went cold.' },
      a1: { speaker: ANSELM, mood: 'sad', next: 'h2', text: 'I am. I am sorry for all of it. I find it is rather a lot of sorry for one curate.' },
      h2: {
        speaker: HESTA, mood: 'sad',
        text: '(She coughs, long and grey.) …Well. If we’re handing out blame by the shovel, I’ll take a spade of it. I taught Ysolde. Everything she knows about the dying fire, she learned at my table. The Church burned us for being right. I made her right, and look what she did with it.',
        choices: [
          { text: '“Neither of you lit those fires.”', to: 'neither', effects: [love(HESTA, 2), love(ANSELM, 2)] },
          { text: '“The Church owes her order more than an apology.”', to: 'owes', effects: [love(HESTA, 3), love(ANSELM, -2)] },
          { text: '(Tell them what the brazier showed you: the archive chests, under the Hierophant’s seal.)', to: 'chests', when: any(f('act1.purge_vision_full'), f('act1.reports_known')) },
        ],
      },
      neither: { speaker: HESTA, next: 'end', text: 'No. But we’re the ones left holding the matches, child. That’s how guilt works. It goes to whoever’s nearest.' },
      owes: { speaker: ANSELM, next: 'end', text: 'It does. I can’t pay it. But I can stand in the pulpit, if I ever have one again, and say it aloud. That costs something too.' },
      chests: { speaker: ANSELM, mood: 'afraid', next: 'chests2', text: 'Sealed and carried to Solenne? Not burned? (He sits very still.) Then they knew. Saints and sparks, they knew, and they kept the proof.' },
      chests2: { speaker: HESTA, mood: 'happy', next: 'end', text: 'Look at that. A priest who can be shocked. I thought they’d bred it out of you.' },
      end: { speaker: ANSELM, text: 'Shall I say a prayer for the wardens, at least? The old one, for the dead of the hearth.' },
    },
  },

  // ----- 5. Grimma and Cadoc: Orrun and Aelthi grudges older than kingdoms
  {
    id: 'dialogue:banter-grimma-cadoc-grudge', name: 'Banter: Grimma and Cadoc (the ledger)',
    entries: [{ when: all(fol(GRIMMA), fol(CADOC), f('act1.nails_exposed')), node: 'open' }],
    nodes: {
      open: { speaker: GRIMMA, next: 'c1', text: 'Your lot sang a city into the sea.' },
      c1: { speaker: CADOC, next: 'g1', text: 'Your lot hammered nails into it. We were both trying to shut the same door, Ironsong. We simply disagreed about the hinges.' },
      g1: { speaker: GRIMMA, next: 'c2', text: 'Clan ledger of Ironsong, page the first. “The Aelthi of Ys Aerwen: owing, one hundred loads of charcoal, lent in the Age of Iron.” Four hundred years before your Lantern. Never paid.' },
      c2: { speaker: CADOC, next: 'g2', text: 'My great-grandmother says it was a gift.' },
      g2: { speaker: GRIMMA, next: 'c3', text: 'Ledger says debt.' },
      c3: { speaker: CADOC, next: 'g3', text: 'Then I shall pay it. In songs. One song per load, sung at your forge, every evening, for a hundred evenings.' },
      g3: {
        speaker: GRIMMA, mood: 'angry',
        text: 'Grenn take you. That’s not payment. That’s a siege.',
        choices: [
          { text: '“I’ll buy the charcoal myself, and end this.”', to: 'buy' },
          { text: '“The Mire doesn’t care whose fault it was.”', to: 'mire', effects: [love(GRIMMA, 2), love(CADOC, 2)] },
          { text: '“Cadoc, sing her one now.”', to: 'sing', effects: [love(CADOC, 2)] },
        ],
      },
      buy: { speaker: GRIMMA, next: 'buy2', text: 'Can’t. The debt’s his people’s to us. You pay it, it becomes your debt, and then he owes you, and then I’ve got a human in my ledger. No offence.' },
      buy2: { speaker: CADOC, next: 'end', text: 'None taken. I have been in her ledger since the gate, I suspect. Under “tall, insolent”.' },
      mire: { speaker: CADOC, mood: 'sad', next: 'end', text: 'No. It is very fair-minded, the Mire. It drowned my people and rusted hers, and it was perfectly polite about both.' },
      sing: { speaker: 'narrator', next: 'sing2', text: 'Cadoc sings four lines in Aelthi, low, the tune going down and down like a stair into a well. Grimma does not look up from her whetstone. When he stops, the stone has stopped too.' },
      sing2: { speaker: GRIMMA, next: 'end', text: '…That’s one load. Ninety-nine to go. Don’t think I’m not counting.' },
      end: {
        speaker: GRIMMA,
        text: '(Later, gruffly.) You sang a seep shut once, they say. On your own. That’s holding work, that is. Iron work. (She spits in the fire.) Korr nagh. Doesn’t mean I like you.',
      },
    },
  },

  // ----- 6. Sable and Vesper: fire and black tears
  {
    id: 'dialogue:banter-sable-vesper-tears', name: 'Banter: Sable and Vesper (fire and tears)',
    entries: [{ when: all(fol(SABLE), fol(VESPER), f('act2.vesper_joined')), node: 'open' }],
    nodes: {
      open: { speaker: VESPER, next: 's1', text: 'Sable. Is that my breviary?' },
      s1: { speaker: SABLE, mood: 'happy', next: 'v1', text: 'It had a gold clasp. I’m only human. (A pause, a fraction too long.) Mostly.' },
      v1: { speaker: VESPER, next: 's2', text: 'You stole a prayer book from a heretic. There must be a saint for that. Keep it. Read the Canticle of the Anvil; it’s the only part with any jokes in it.' },
      s2: { speaker: 'narrator', next: 'v2', text: 'Sable has edged so close to the fire that her boots are steaming. Vesper notices, and without a word cups her hand, and a small flame rises in her palm. She holds it out. Sable reaches for it, and a tear runs down her cheek and falls into the flame, black as pitch. The fire hisses and goes blue.' },
      v2: { speaker: VESPER, mood: 'afraid', next: 's3', text: '…Oh. Oh, child.' },
      s3: {
        speaker: SABLE, mood: 'hollow',
        text: 'Smoke in my eye. Your fire smokes, Abbess. (Brightly.) Cheap wick.',
        choices: [
          { text: '“Vesper. Leave it.”', to: 'leave', effects: [love(SABLE, 3), love(VESPER, -1)] },
          { text: '“Vesper, could Ash burn the Mire out of her?”', to: 'ash', effects: [love(SABLE, -2)] },
          { text: '(Say nothing.)', to: 'quiet' },
        ],
      },
      leave: { speaker: VESPER, next: 'end', text: 'Leaving it. It’s left. (She closes her hand, and the flame goes out.) But the offer of a warm hand stands, Sable. It always will.' },
      ash: { speaker: VESPER, mood: 'sad', next: 'ash2', text: 'Ash burns everything out. That is precisely the trouble with it. I would get the Mire, and I would get a good deal of Sable with it.' },
      ash2: { speaker: SABLE, mood: 'angry', next: 'end', text: 'Could we not talk about how much of me there is, please? Like I’m a ham.' },
      quiet: { speaker: 'narrator', next: 'end', text: 'Vesper says nothing either. She only moves so that she is between Sable and the dark, and leaves her hand open on her knee with the little fire burning in it, close enough to reach.' },
      end: { speaker: VESPER, text: 'In the Creed we have a saying. No one is lost who is still arguing. (Sable opens her mouth.) There. You see? Not lost.' },
    },
  },

  // ----- 7. Hesta and Maren: teaching her to aim with a burned hand
  {
    id: 'dialogue:banter-hesta-maren-aim', name: 'Banter: Hesta and Maren (the bow lesson)',
    entries: [{ when: all(fol(HESTA), fol(MAREN), f('act1.cinderhold_restored')), node: 'open' }],
    nodes: {
      open: { speaker: 'narrator', next: 'h1', text: 'You come back from the woodpile to find Hesta holding Maren’s spare bow as though it owes her money.' },
      h1: { speaker: HESTA, next: 'm1', text: 'When the cough takes the fire for good, I want something that kills at a distance. Something other than my temper.' },
      m1: { speaker: MAREN, mood: 'happy', next: 'h2', text: 'Your temper kills at a fair distance. All right. Feet apart. Elbow up. No, up. Have you got an elbow?' },
      h2: { speaker: HESTA, mood: 'angry', next: 'm2', text: 'I’ve two, girl, and they’re both older than your village.' },
      m2: { speaker: 'narrator', next: 'm3', text: 'Hesta’s right hand will not close on the string; the burn-scars run too deep. Maren watches her try twice. Then, without a word, she takes off her own thumb-ring and works it onto Hesta’s left hand, and turns the bow round.' },
      m3: { speaker: MAREN, next: 'h3', text: 'Other way, then. Draw with the left, sight with the right eye. Mam taught me like this, when I broke my wrist. Said a good archer has two hands and uses whichever one’s still talking to her.' },
      h3: { speaker: 'narrator', next: 'm4', text: 'Hesta draws, holds, looses. The arrow goes a yard wide of the stump and through the cooking pot.' },
      m4: {
        speaker: MAREN, mood: 'happy',
        text: 'Well. Nobody’s getting supper tonight, but the pot’s dead.',
        choices: [
          { text: '“That was a fine shot, Hesta. The pot never saw it coming.”', to: 'praise', effects: [love(HESTA, 2), love(MAREN, 2)] },
          { text: '“Maren, go easy on her.”', to: 'easy', effects: [love(HESTA, -1)] },
          { text: '(Laugh.)', to: 'teach' },
        ],
      },
      praise: { speaker: HESTA, mood: 'happy', next: 'teach', text: 'Hah. The first compliment I’ve had in forty years, and it’s about murdering cookware.' },
      easy: { speaker: HESTA, mood: 'angry', next: 'teach', text: 'Don’t you dare. If she goes easy on me I’ll put the next one through you.' },
      teach: {
        speaker: HESTA, mood: 'sad',
        text: '(She looks at the ring on her thumb.) You’re a good teacher, Maren Hollis. Patient. You don’t let them see how much you want them to get it right. I taught a girl once. I let her see. She learned too well.',
        next: 'end',
      },
      end: { speaker: MAREN, text: '(Quietly.) Keep the ring. Mam would’ve liked you. She liked anyone who swore at her.' },
    },
  },

  // ----- 8. Cadoc and Hesta: the Lullaby against the Brand
  {
    id: 'dialogue:banter-cadoc-hesta-lullaby', name: 'Banter: Cadoc and Hesta (song and flame)',
    entries: [{ when: all(fol(CADOC), fol(HESTA), f('act1.ylwen_pact')), node: 'open' }],
    nodes: {
      open: { speaker: HESTA, next: 'c1', text: 'So. You’re the one who knows the song. The one that drowned a city.' },
      c1: { speaker: CADOC, next: 'h1', text: 'And you are the last keeper of the flame. The one that went out.' },
      h1: { speaker: HESTA, next: 'c2', text: '(A short bark of a laugh, which turns into a cough.) Fair. Fair. Sing it to sleep or burn it back, that’s the whole argument, isn’t it? Twelve hundred years of it.' },
      c2: { speaker: CADOC, next: 'h2', text: 'Longer. My people sang, and the sea rose up and took Ys Aerwen in a night. Yours lit a fire in Solenne and kept it fed for twelve centuries, and now it is a black lump in a cathedral. Neither of us is in a position to give lectures.' },
      h2: { speaker: HESTA, next: 'c3', text: 'Then what’s left, Aelthi? When the song drowns and the fire dies?' },
      c3: {
        speaker: CADOC,
        text: 'The spark. (Slowly, they both turn and look at you.)',
        choices: [
          { text: '“Don’t look at me like that.”', to: 'look' },
          { text: '“Then teach me both.”', to: 'both', effects: [love(CADOC, 2), love(HESTA, 2)] },
        ],
      },
      look: { speaker: HESTA, mood: 'happy', next: 'end', text: 'Like what? Like you’re the last cart out of a burning town and we’re hoping your axle holds? That’s just how we look, child. Get used to it.' },
      both: { speaker: CADOC, next: 'both2', text: 'Both. A Warden’s fire and an Aelthi lullaby, in one human, who will live perhaps another sixty years if they are careful, which they are not.' },
      both2: { speaker: HESTA, next: 'end', text: 'I’ll take the mornings. He can have the evenings. Gods help you.' },
      end: { speaker: CADOC, mood: 'sad', text: '(Softly, to Hesta, when he thinks you are asleep.) If it comes to it, Warden, I will sing. Whatever it costs. Somebody should finish the song properly, this time.' },
    },
  },
];

export default dialogues;
