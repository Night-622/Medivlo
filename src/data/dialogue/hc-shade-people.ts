/**
 * Hollow Crown, SHADE: Veilwarrens people (general talk), the eight side quests, the mentor thread and the
 * bounties, plus the Act II class-thread, Brindlecross hooks and featured-bearer scenes, and the Act III class
 * scenes at the Heart. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const done = (q: Q): NarrativeCondition => ({ questCompleted: q });
const offer = (q: Q, text: string, to: string, extra?: NarrativeCondition): DialogueChoice =>
  ({ text, to, quest: true, when: extra ? { all: [fresh(q), extra] } : fresh(q), effects: [{ startQuest: q }] });
const bye: DialogueChoice = { text: 'Farewell.', to: null, tag: 'leave' };
const MOONRISE: NarrativeCondition = { hour: [21, 4] };
const GM = 'npc:grey-mab' as const, SH = 'npc:shadow-that-left' as const, BT = 'npc:bryn-tallow' as const;
const WS = 'npc:wilhelmina-spool' as const, CG = 'npc:constance-gentle' as const, BTH = 'npc:bryn-tallow-heart' as const;

const dialogues: DialogueDef[] = [
  // ---------- Mab (general + mentor thread)
  {
    id: 'dialogue:shade-mab', name: 'Grey Mab (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: GM, text: 'What. (She does not look up from whatever she is unpicking.) If it’s money, no. If it’s advice, also no, but I’ll give it you anyway.',
        choices: [
          offer('quest:shade-mabs-ledger', 'Is it true you keep a book of every shadow the Veil ever lifted?', 'book', { all: [{ trust: GM, value: 'friendly' }, done('quest:shade-mabs-toll')] }),
          offer('quest:shade-the-letter-mab-never-opened', 'You look like someone who’s lost something, Mab.', 'letter', { all: [{ trust: GM, value: 'trusted' }, done('quest:shade-a-stranger-at-the-moonwell')] }),
          { text: 'Why do the Veil lift shadows at all?', to: 'why' },
          bye,
        ],
      },
      book: { speaker: GM, text: '(A long look.) It’s true. Under the board, under the other board. Read it, if you must. Don’t read it aloud. Some of those people are still alive and most of them owe me.', next: null },
      letter: { speaker: GM, mood: 'sad', text: 'A letter. From Duskmere. Forty years ago. I hid it so well I can’t find it, which is the first time that’s ever happened to me. Steal it off me. I won’t help. I’ll be watching, and I’ll be very disappointed if you’re clumsy.', next: null },
      why: { speaker: GM, text: 'Used to be, a family that couldn’t pay the Concord’s tax-men would come to us, and we’d lift their shadows and hide them, so the tax-men counted one fewer in the house. Nobody can count a person with no shadow. We were very popular. Then the crown went, and nobody counted anything.',
        choices: [
          { text: 'Did you ever lift your own shadow, Mab?', to: 'own', when: { trust: GM, value: 'friendly' } },
          { text: 'Right.', to: null },
        ],
      },
      own: { speaker: GM, text: '(She stops unpicking.) Once. The first winter after I came down from Duskmere, still sulking about my sister. I lifted mine and hid it under the floor of the Veil hall for a week, so I could go about the warrens and nobody would know I was there. Sulking, professionally.', next: 'week' },
      week: {
        speaker: GM, text: 'Worst week of my life. Nobody knew I was there. That was the trouble. You want to be invisible until you are, and then you want someone to trip over you.',
        choices: [
          { text: 'Who tripped over you?', to: 'trip' },
          { text: 'I’d have tripped over you, Mab.', to: 'me', trust: 1 },
        ],
      },
      trip: { speaker: GM, mood: 'happy', text: 'The old Thief-mother, Grizel Gall. Walked straight into me on the third bridge, said “There you are,” and gave me my shadow back off her own belt. She’d had it the whole time. She’d been waiting for me to want it.', next: null },
      me: { speaker: GM, mood: 'happy', text: '(A short laugh.) You would. Clumsy. (She goes back to her unpicking, and her shadow, on the wall behind her, very quietly pats the shadow of your hand.)', next: null },
    },
  },
  {
    id: 'dialogue:obj-mab-black-book', name: 'Mentor: Mab’s black book', scope: 'party',
    entries: [{ when: stage('quest:shade-mabs-ledger', 'book'), node: 'read' }, { node: 'board' }],
    nodes: {
      read: { speaker: 'narrator', text: 'A black book under the second loose board, every shadow the Veil ever lifted: a name, a date, a price, a place it was hidden. In the margins, in Mab’s small fierce hand, notes. “Came back sulking.” “Came back knowing his wife’s birthday, which he did not.” “Shadows keep what their people put down. Ask it, it remembers.”', next: null },
      board: { speaker: 'narrator', text: 'A loose board in Mab’s nest, over another loose board.', next: null },
    },
  },
  {
    id: 'dialogue:shade-mab-ledger', name: 'Mentor: Mab’s Ledger', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: GM, text: 'You read the margins. Of course you read the margins. Nobody reads the book; everyone reads the margins.',
        choices: [{ text: 'Shadows keep memories for their people.', to: 'keep', insight: 'shade_shadow_ledger', trust: 1 }],
      },
      keep: { speaker: GM, text: 'They do. Every one we lifted came back with something its person had put down and forgotten. So when the Cult sells pasts to folk with no shadows, petal, they’re selling them what they already own. Remember that. Somebody should.', next: null },
    },
  },
  {
    id: 'dialogue:obj-mab-hidden-letter', name: 'Mentor: stealing from Mab', scope: 'party',
    entries: [{ when: stage('quest:shade-the-letter-mab-never-opened', 'steal'), node: 'search' }, { node: 'nest' }],
    nodes: {
      search: {
        speaker: 'narrator', text: 'Mab sits in her chair with her arms folded, watching you search her nest. Not under the boards; that is where she puts things she wants found. Not in the mattress; too obvious. Where would she hide something from herself?',
        choices: [
          { text: '(Look inside her old Veil hood, hanging on the door.)', to: 'hood' },
          { text: '(Look under her chair. Under her, specifically.)', to: 'chair' },
        ],
      },
      hood: { speaker: 'narrator', text: 'Sewn into the lining of the hood she wore when she was young, so flat you can only feel it by its edge: a letter with a Duskmere seal, unopened. Behind you, Mab says, “Hm,” which from Mab is a standing ovation.', next: null },
      chair: { speaker: 'narrator', text: 'You ask her to stand up. She does, outraged. Taped under the seat of her chair, where she has sat on it every day for forty years: a letter with a Duskmere seal, unopened. “Hm,” says Mab, which from Mab is a standing ovation.', next: null },
      nest: { speaker: 'narrator', text: 'Mab’s nest, very slightly tidier than before, which is how she knows somebody has been through it.', next: null },
    },
  },
  {
    id: 'dialogue:shade-mab-letter', name: 'Mentor: The Letter Mab Never Opened', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: GM, mood: 'sad', text: '(She turns it over. The seal is the Moon Obelisk’s. The hand on the front is sloping and lovely.) Nyx. My sister. She wrote to me the week after I left, and I never opened it, because I knew it would say she was right.',
        choices: [
          { text: 'Maybe it says she was wrong.', to: 'wrong' },
          { text: 'You don’t have to open it.', to: 'dont' },
        ],
      },
      wrong: { speaker: GM, text: 'That would be worse. I’d have spent forty years being right for nothing.', next: 'alone' },
      dont: { speaker: GM, text: 'No. I don’t. That’s the trouble with letters. They wait.', next: 'alone' },
      alone: { speaker: GM, text: 'Go on out. Shut the door. I’ll read it on my own, like a grown woman, and if I cry you’ll never know, because I’m very good at it. (As you close the door you hear the seal crack.)', effects: [{ trust: GM, delta: 1 }], next: null },
    },
  },
  // ---------- the Shadow (general)
  {
    id: 'dialogue:shade-shadow', name: 'The Shadow That Left (general)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: SH, mood: 'happy', text: 'Hello, us. Do you remember the goose? I remember the goose. I remember everything you put down behind you. Somebody had to pick it up.', next: null } },
  },
  // ---------- the Veilwarrens: Nettle Crook, Ludo Fingle, Tibbet Crumb (bounties)
  {
    id: 'dialogue:shade-nettle', name: 'Nettle Crook (Rope Toll)',
    entries: [{ when: { all: [stage('quest:shade-rope-toll', 'nettle'), { not: { flag: 'shade.nettle' } }] }, node: 'settle' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:nettle-crook', text: 'Toll! One copper for the bridge, two for the bridge if you’ve got no shadow, because that’s bad luck and bad luck costs extra. (She checks the planks behind you, twice.) Two coppers.',
        choices: [
          offer('quest:shade-rope-toll', 'The next bridge says they’re cheaper.', 'war', done('quest:shade-the-bell-on-the-bridges')),
          { text: '(Borrow the shadow of her toll-box, and walk across in it.)', to: 'borrow', school: 'umbral', when: { flag: 'shade.shadowless' } },
          bye,
        ],
      },
      borrow: { speaker: 'npc:nettle-crook', mood: 'angry', text: 'Oi! That’s my box’s shadow! That’s TWO tolls, one for you, one for the box! (She writes it down in her ledger, which is a picture of you with a cross through it.)', next: null },
      war: { speaker: 'npc:nettle-crook', mood: 'angry', text: 'Cheaper! Fen Doyle’s bridge is cheaper because it’s worse! It’s got a hole in it the size of a goat! I’ve got a ledger and everything, look. It’s all very clear.', next: null },
      settle: {
        speaker: 'npc:nettle-crook', text: 'Well? Are you going to sort Fen Doyle out or what?',
        choices: [
          { text: 'You and Fen should split the toll and both mend Fen’s hole.', to: 'truce', effects: [{ setFlag: 'shade.nettle', value: 'truce' }] },
          { text: 'Let me teach you your letters. Then nobody can cheat your ledger.', to: 'letters', trust: 1, trustNpc: GM, effects: [{ setFlag: 'shade.nettle', value: 'letters' }] },
        ],
      },
      truce: { speaker: 'npc:nettle-crook', text: 'Split it? (She thinks about it so hard her tongue comes out.) Half of two bridges is the same as one bridge. But I get to say I own half of Fen’s. All right. Shake. Spit first. That’s the rule.', next: 'fen' },
      letters: { speaker: 'npc:nettle-crook', mood: 'happy', text: 'Letters? Real ones? (She sits down on the planks at once.) Start with N. N for Nettle. Then T for toll. Then F for Fen Doyle, so I can write him down properly.', next: 'fen' },
      fen: { speaker: 'npc:nettle-crook', text: 'Go and look at Fen’s bridge, then, two along. See what I’ve done. (She looks very pleased with herself, which is worrying.) Don’t pay him. Tell him Nettle says.', next: null },
    },
  },
  {
    id: 'dialogue:obj-nettle-toll-ledger', name: 'Rope Toll: Nettle’s ledger',
    entries: [{ when: stage('quest:shade-rope-toll', 'ledger'), node: 'read' }, { node: 'ledger' }],
    nodes: {
      read: { speaker: 'narrator', text: 'Nettle’s ledger is pictures: a very good drawing of a fat man with a cross through him, a goat with three crosses, a woman with a hat and a tick. On the last page, a bridge with a hole in it the size of a goat, and an arrow, and the word FEN, spelled with two Ns and backwards.', next: null },
      ledger: { speaker: 'narrator', text: 'Nettle Crook’s toll-ledger, open on her knee, full of drawings of debtors.', next: null },
    },
  },
  {
    id: 'dialogue:shade-ludo', name: 'Ludo Fingle (the Puppet Show)',
    entries: [{ when: stage('quest:shade-the-puppet-show', 'ludo'), node: 'after' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ludo-fingle', text: 'Roll up! The Signing of the Concord, in shadow, by Ludo Fingle, one copper! Except it isn’t, because my hero’s walked off. Hero puppet. Shadow and all. On the night of the bell. (He looks at you, and at the wall behind you.) Oh. Oh, you’re perfect.',
        choices: [
          offer('quest:shade-the-puppet-show', 'I can’t cast a shadow, Ludo. That’s rather the problem.', 'perfect', done('quest:shade-the-bell-on-the-bridges')),
          bye,
        ],
      },
      perfect: { speaker: 'npc:ludo-fingle', mood: 'happy', text: 'That’s not a problem, that’s a gimmick! The invisible hero! The audience has to imagine you! I’ve been waiting my whole career for an audience that has to work. Behind the screen, please. Arms up. Be heroic.', next: null },
      after: {
        speaker: 'npc:ludo-fingle', mood: 'happy', text: 'Well! Well. I think that was either the best show I’ve ever put on or the worst, and the takings say best. A little girl cried. A man asked for his copper back and then asked to see it again.',
        choices: [{ text: 'They clapped at nothing.', to: 'nothing' }, { text: 'Never again, Ludo.', to: 'never' }],
      },
      nothing: { speaker: 'npc:ludo-fingle', text: 'They clapped at you! The nothing was you! That’s art. I’m taking it on the road. Concordia, if the gates ever open. They’ll love it at the Gilded Goose. Everyone loves nothing, done well.', next: 'lost' },
      never: { speaker: 'npc:ludo-fingle', text: 'That’s what they all say. I’ll keep the screen up for you. Arms up. Be heroic.', next: 'lost' },
      lost: { speaker: 'npc:ludo-fingle', mood: 'sad', text: 'Mind you, I’d still like my old hero back. Somebody said there’s a puppet-shaped bundle on the Moonwell steps, left very neatly, as if whoever took it was sorry. Would you look? He’s got a chipped nose. I’d know him anywhere.', next: null },
    },
  },
  {
    id: 'dialogue:obj-ludo-puppet-stage', name: 'The Puppet Show: the performance', scope: 'party',
    entries: [{ when: stage('quest:shade-the-puppet-show', 'show'), node: 'curtain' }, { node: 'screen' }],
    nodes: {
      curtain: {
        speaker: 'narrator', text: 'Behind Ludo’s screen, with the lamp behind you and forty people in front, you raise your arms and present the Concord to the twelve schools. On the screen, nothing happens at all. Twelve puppet champions bow to an empty space. The audience goes very quiet.',
        choices: [
          { text: '(Narrate it, loudly, very heroically.)', to: 'narrate' },
          { text: '(Borrow Ludo’s shadow and play the hero with it.)', to: 'borrow', school: 'umbral' },
          { text: '(Stand perfectly still and let them imagine.)', to: 'still' },
        ],
      },
      narrate: { speaker: 'narrator', text: '“AND THE HERO TAKES THE CROWN,” you announce, while twelve puppets bow to a blank screen. Somebody laughs. Then everybody laughs. Then, somehow, by the end, everybody is cheering for the bit of screen where you are not.', next: 'wall' },
      borrow: { speaker: 'narrator', text: 'You step into Ludo’s shadow and out onto the screen in it: a tall man with a large nose, taking the crown. Ludo, beside you, now has no shadow at all, and is staring at the wall in horror. The audience thinks it is the funniest thing they have ever seen.', next: 'wall' },
      still: { speaker: 'narrator', text: 'You stand still. Twelve champions bow to nothing, and in the hush a child at the front says, quite clearly, “That’s where the crown goes, in the middle, where nobody is.” Then they clap, slowly, all of them.', next: 'wall' },
      wall: {
        speaker: 'narrator', text: 'As Ludo turns up the lamp for the bow, a shadow the shape of you is standing on the far wall of the tunnel, behind the audience, with its arms folded, watching the show. When you look again it is not there.',
        effects: [{ setFlag: 'shade.listening_pose', value: 'watch' }, { setFlag: 'shade.listening', value: 'obj:ludo-puppet-stage' }],
        choices: [
          { text: '(Stare at the wall.)', to: null, insight: 'shade_listening_shadow' },
          { text: '(Take your bow.)', to: null },
        ],
      },
      screen: { speaker: 'narrator', text: 'Ludo Fingle’s shadow-puppet screen, with twelve champions on sticks and an empty space for the hero.', next: null },
    },
  },
  {
    id: 'dialogue:shade-tibbet', name: 'Tibbet Crumb (bounties)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:tibbet-crumb', text: 'Veil bounties. Paid in coin, not silk, before you ask; Mab keeps the silk. (He peers at your feet.) No shadow. Mab said. Bad luck for you, good luck for the bounty: nothing up here hunts what it can’t see.',
        choices: [
          offer('quest:shade-bounty-bridge-bats', 'The bats under the bridges?', 'bats', done('quest:shade-the-bell-on-the-bridges')),
          offer('quest:shade-bounty-grandmother-longlegs', 'Grandmother Longlegs?', 'gran', done('quest:shade-mabs-toll')),
          bye,
        ],
      },
      bats: { speaker: 'npc:tibbet-crumb', text: 'Void Bats, roosting under the third and fourth bridges, dropping on folk at night. Six of them. I counted by the bites. I’ve got four bites.', next: null },
      gran: { speaker: 'npc:tibbet-crumb', mood: 'afraid', text: 'Biggest Night Spider in the Deeps. Been down there longer than the Veil. Never bothered anybody till the bell. Now she’s coming up the ladders, and eating them. Three ladders. I liked those ladders.', next: null },
    },
  },
  // ---------- the Webbed Deeps: Wilhelmina Spool, Agnes, Silvan Hollowell
  {
    id: 'dialogue:shade-spool', name: 'Cutter-Mother Spool (general, Agnes in the Silk)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: WS, text: 'Silk doesn’t cut itself. Well. It does now, some of it, since the bell. What do you want?',
        choices: [
          offer('quest:shade-agnes-in-the-silk', 'Somebody said Agnes is missing.', 'agnes', done('quest:shade-mabs-toll')),
          bye,
        ],
      },
      agnes: { speaker: WS, mood: 'angry', text: 'Three days. Agnes Threadneedle, best cutter I’ve got, worst temper in the Deeps. Went down to the low silk on her own because nobody would go with her, and she’ll never forgive us. Find her. Alive, ideally. She owes me a bolt.', next: null },
    },
  },
  {
    id: 'dialogue:obj-agnes-cocoon', name: 'Agnes in the Silk: the cocoon', scope: 'party',
    entries: [{ when: stage('quest:shade-agnes-in-the-silk', 'cocoon'), node: 'cut' }, { node: 'silk' }],
    nodes: {
      cut: { speaker: 'narrator', text: 'A cocoon hanging in the low silk, the right size for a short angry woman. You cut it open. Agnes Threadneedle falls out, entirely unhurt, glares at you, and says, “Three days. THREE DAYS,” and walks off up the tunnel without another word.', next: null },
      silk: { speaker: 'narrator', text: 'An empty cocoon in the low silk, cut neatly along one side.', next: null },
    },
  },
  {
    id: 'dialogue:shade-agnes', name: 'Agnes Threadneedle',
    entries: [{ when: stage('quest:shade-agnes-in-the-silk', 'agnes'), node: 'sulk' }, { node: 'start' }],
    nodes: {
      start: { speaker: 'npc:agnes-threadneedle', text: 'I’m cutting. Can’t you see I’m cutting? Go and rescue somebody else.', next: null },
      sulk: {
        speaker: 'npc:agnes-threadneedle', mood: 'angry', text: 'Three days I hung in that thing. Three days. I could hear them up here, cutting, arguing about whose turn it was to look for me. Nobody came. Then you came. You haven’t even got a shadow.',
        choices: [
          { text: 'I came as soon as I heard.', to: 'heard' },
          { text: 'You’re welcome, Agnes.', to: 'welcome' },
        ],
      },
      heard: { speaker: 'npc:agnes-threadneedle', text: '(A long sulk.) …As soon as you heard. Well. That’s something. That’s more than Spool did. (She shoves a folded bolt of silk at you without looking.) Don’t tell anyone I said thank you. I didn’t.', next: 'sorry' },
      welcome: { speaker: 'npc:agnes-threadneedle', mood: 'happy', text: 'I didn’t say thank you. (She very nearly smiles.) Here. Silk. For your trouble. And for the cheek.', next: 'sorry' },
      sorry: { speaker: 'npc:agnes-threadneedle', mood: 'angry', text: 'And I’m not cutting another yard for Spool till she comes over here and says sorry to my face. Three days. You tell her that. Tell her exactly that.', next: null },
    },
  },
  {
    id: 'dialogue:shade-silvan', name: 'Silvan Hollowell (Echoes for Sale)',
    entries: [{ when: stage('quest:shade-echoes-for-sale', 'silvan'), node: 'heard' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:silvan-hollowell', text: 'Echoes! Bottled echoes! A dropped pin, a cathedral bell, a lover calling your name: put it to your ear and there it is. Or there it was. (He shakes a jar.) Something’s been eating my stock.',
        choices: [
          offer('quest:shade-echoes-for-sale', 'Eating echoes?', 'eat', done('quest:shade-mabs-toll')),
          bye,
        ],
      },
      eat: { speaker: 'npc:silvan-hollowell', mood: 'afraid', text: 'I open them and there’s nothing. Not even quiet. Quiet has a sound, you know. These haven’t got that. Listen to a few. Tell me I’m not mad.', next: null },
      heard: {
        speaker: 'npc:silvan-hollowell', text: 'The end of a whistle-signal, bitten off? (He goes pale.) That’s the Veil’s long call, the one for “come quick”. Somebody called for help in the Deeps, and something ate the call before it got anywhere.',
        choices: [{ text: 'Teach me the whistles.', to: 'teach' }, { text: 'Then something down there eats sound.', to: 'sound' }],
      },
      teach: { speaker: 'npc:silvan-hollowell', text: 'Short-short-long, come quick. Long-long, all clear. Two shorts and a trill, Mab’s coming, look busy. That last one’s the most used.', next: 'sound' },
      sound: { speaker: 'npc:silvan-hollowell', text: 'Down past the low silk there’s a spire nobody climbs. That’s where the quiet’s coming from. I’d stop selling, but I’ve nothing else to sell.', next: 'who' },
      who: { speaker: 'npc:silvan-hollowell', text: 'And somebody whistled that call. Somebody needed help. The old whistle-post in the Deeps keeps the last call made from it. Ask it, would you? I’d like to know whether anybody came.', next: null },
    },
  },
  {
    id: 'dialogue:obj-echo-jar-3', name: 'Echoes for Sale: the bitten echo',
    entries: [{ when: stage('quest:shade-echoes-for-sale', 'jars'), node: 'listen' }, { node: 'jar' }],
    nodes: {
      listen: { speaker: 'narrator', text: 'You put the third jar to your ear. Faint and far away, a whistle: short, short, lo— and then nothing, as if a door had been shut on it. Not silence. Less than silence. A hole where a sound should end.', next: null },
      jar: { speaker: 'narrator', text: 'An echo-jar, empty in a way that makes your ear ache.', next: null },
    },
  },
  // ---------- the Moonwell: Madam Quince, Twig and Moss, Isidore Pale
  {
    id: 'dialogue:shade-quince', name: 'Madam Quince (A Fair Price)',
    entries: [{ when: { all: [stage('quest:shade-a-fair-price', 'deal'), { not: { flag: 'shade.quince' } }] }, node: 'deal' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:madam-quince', text: '(She makes the bad-luck sign at your feet, very quickly, and then pretends she was adjusting her ring.) Shadowless. Mab’s, aren’t you? Sit down, sit down. I’ve a proposition.',
        choices: [
          offer('quest:shade-a-fair-price', 'What proposition?', 'prop', done('quest:shade-a-stranger-at-the-moonwell')),
          bye,
        ],
      },
      prop: { speaker: 'npc:madam-quince', text: 'Your spare name. You’ve two, like everyone in Nocturne: a used one, a kept one. Somebody without a shadow obviously doesn’t need both. I’ll give you twenty shards for the kept one, and no questions, which is worth another ten.', next: 'deal' },
      deal: {
        speaker: 'npc:madam-quince', text: 'Well? Twenty shards. Fair price.',
        choices: [
          { text: 'Fifty, and you throw in the ring you keep touching.', to: 'haggle', effects: [{ setFlag: 'shade.quince', value: 'haggled' }] },
          { text: 'Done. Twenty. I don’t know what I’d use it for anyway.', to: 'sold', effects: [{ setFlag: 'shade.quince', value: 'sold' }] },
          { text: '(Shake her hand, and take her purse while you do it.)', to: 'robbed', school: 'umbral', effects: [{ setFlag: 'shade.quince', value: 'robbed' }] },
          { text: 'It isn’t for sale.', to: 'no', effects: [{ setFlag: 'shade.quince', value: 'refused' }] },
        ],
      },
      haggle: { speaker: 'npc:madam-quince', mood: 'happy', text: 'Fifty! And the ring! (She laughs until she coughs.) Get out, you’re worse than Mab. Here: ten shards for making me laugh, and keep your name, and never come back, and come back Tuesday.', next: 'lamp' },
      lamp: { speaker: 'narrator', text: 'She goes off into the back for a lamp, muttering, and leaves the drawer behind her counter standing open. It is full of little slips of paper. Hundreds of them.', next: null },
      sold: { speaker: 'npc:madam-quince', mood: 'sad', text: '(She writes it on a slip and puts it in a drawer full of other slips.) Twenty. There. (She doesn’t let go of the drawer.) If you ever want it back, it’ll be forty. Everybody always wants it back.', next: 'lamp' },
      robbed: { speaker: 'npc:madam-quince', text: '(You walk away with her purse and your name. Three stalls along she shouts, “OI!” and then, much louder, “Good hands!” and then, “I’ll tell Mab!” Mab, when she hears, is delighted.)', next: 'gone' },
      gone: { speaker: 'narrator', text: 'When you come back past later, her stall is empty: she has gone off up the ladders to complain to Mab in person. She has left the drawer behind her counter standing open. It is full of little slips of paper. Hundreds of them.', next: null },
      no: { speaker: 'npc:madam-quince', text: 'Not for sale. (She looks at you properly, for the first time.) No. No, I suppose it isn’t. Good. Go on, then.', next: 'lamp' },
    },
  },
  {
    id: 'dialogue:shade-twins', name: 'Twig and Moss (Seen from Below)',
    entries: [{ when: stage('quest:shade-seen-from-below', 'twins'), node: 'home' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:twig-and-moss', text: '(Two small children, as alike as two buttons, one talking, one checking behind you for your shadow.) I’m Twig. That’s Moss. Moss doesn’t talk. Moss says you’ve got no shadow. Moss says that’s the best thing she’s ever seen.',
        choices: [
          offer('quest:shade-seen-from-below', 'Have you two ever been up on the moors?', 'moors', done('quest:shade-nothing-to-hunt')),
          bye,
        ],
      },
      moors: { speaker: 'npc:twig-and-moss', text: 'Up? We’ve never been up. We’ve seen the moon, from down here, at the bottom of the shaft. It’s the size of a button. Moss says is it bigger. Is it bigger? Take us up. Mam says only with a grown-up. Moss says you count.', next: null },
      home: {
        speaker: 'npc:twig-and-moss', mood: 'happy', text: 'It’s BIGGER. It’s the size of everything. It came up over the edge like a plate! Moss talked! Moss said “oh”! That’s the first thing Moss has said since she was three!',
        choices: [{ text: 'What else did Moss say?', to: 'else' }, { text: 'Go to bed, the pair of you.', to: 'bed' }],
      },
      else: { speaker: 'npc:twig-and-moss', text: '(Moss tugs Twig’s sleeve and whispers.) Moss says when we’re big we’re going to live up there. Moss says the warrens can come and visit.', next: 'pebble' },
      bed: { speaker: 'npc:twig-and-moss', text: 'We can’t sleep. We’ve seen the moon. (They are both asleep before you reach the ladder.)', next: 'pebble' },
      pebble: { speaker: 'narrator', text: 'In Moss’s fist, held so tight her knuckles are white, a pebble from the moonrise rock. Twig says it is for Mam, who has never been up either. Mam works nights. Their door is the green one at the bottom of the shaft.', next: null },
    },
  },
  {
    id: 'dialogue:obj-moonrise-rock', name: 'Seen from Below: moonrise (night)', scope: 'party',
    entries: [
      { when: { all: [stage('quest:shade-seen-from-below', 'moors'), MOONRISE] }, node: 'moon' },
      { when: stage('quest:shade-seen-from-below', 'moors'), node: 'dusk' },
      { node: 'rock' },
    ],
    nodes: {
      rock: { speaker: 'narrator', text: 'A flat rock on the high moor, where the shepherds sit to watch the moon come up.', next: null },
      dusk: { speaker: 'narrator', text: 'Purple dusk over the Stalker Moors, and no moon yet. The twins are hopping from foot to foot. Come back when it rises.', next: null },
      moon: {
        speaker: 'narrator', text: 'You sit on the rock with a twin under each arm. Over the edge of the moor the moon comes up, enormous, gold and then silver, the size of everything. Twig cannot speak for the first time in his life. Moss, who never speaks, says “oh”.',
        effects: [{ setFlag: 'shade.twins_moon', value: true }], next: 'shadows',
      },
      shadows: { speaker: 'narrator', text: 'In the moonlight the twins cast two small shadows on the heather. Between them, where yours should be, Moss keeps looking, and patting the heather, as if she could find it for you.', next: null },
    },
  },
  {
    id: 'dialogue:shade-isidore', name: 'Isidore Pale (general)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: 'npc:isidore-pale', text: 'Isidore Pale, collector for the Obelisk Keepers. I collect what has been taken and send it home. You would be amazed how much has been taken. You would be amazed how little wants to go home.', next: null } },
  },
  // ---------- the Stalker Moors: Bryn Tallow (the Shepherd's Shadow, the Cairn)
  {
    id: 'dialogue:shade-bryn', name: 'Bryn Tallow (general, the Shepherd’s Shadow, the Cairn)',
    entries: [
      { when: stage('quest:shade-the-shepherds-shadow', 'bryn'), node: 'wall' },
      { when: stage('quest:shade-cairn-of-the-unshadowed', 'bryn'), node: 'founder' },
      { node: 'start' },
    ],
    nodes: {
      start: {
        speaker: BT, mood: 'happy', text: 'Evening, fellow lightweight! Sheep are well. Moors are purple. Moon’s on its way. What can a shadowless shepherd do for a shadowless thief?',
        choices: [
          offer('quest:shade-the-shepherds-shadow', 'You said you’d tell me if you missed yours.', 'miss', done('quest:shade-nothing-to-hunt')),
          offer('quest:shade-cairn-of-the-unshadowed', 'What’s the old cairn on the high moor?', 'cairn', done('quest:shade-nothing-to-hunt')),
          bye,
        ],
      },
      miss: { speaker: BT, text: 'So I did. Help me shut the fold first, then sit on the wall with me. It’s a wall-sitting sort of answer.', next: null },
      cairn: { speaker: BT, text: 'The Cairn of the Unshadowed. The Veil buried their own up there, the ones who lost their shadows and never got them back. One stone’s older than the rest. Go and read it. I can’t; never learned. Tell me what it says.', next: null },
      wall: { speaker: BT, text: '(He lights his pipe. On the wall behind him, nothing.) Miss him? No. He was a gloomy sort of shadow. Always behind me, always longer than me in the evenings, making me look small. When he went I felt lighter. I walk taller. I sleep better.', next: 'you' },
      you: {
        speaker: BT, text: 'You’ll want yours back. That’s all right. Different shadows, different folk. Mine was a weight. Maybe yours was a friend. Only you know which.',
        choices: [
          { text: 'I don’t know what I am without it.', to: 'know' },
          { text: 'Mine was the parts of me I never said.', to: 'said' },
        ],
      },
      know: { speaker: BT, mood: 'happy', text: 'You’re a person standing in the light. That’s all anybody is. The shadow’s just proof of it. You don’t need proof, love. You’re here. I can see you.', next: 'stone' },
      said: { speaker: BT, text: 'Then say them, and see if it comes home. If it doesn’t, you’ll still have said them. Can’t lose on that.', next: 'stone' },
      stone: { speaker: BT, mood: 'happy', text: 'One favour. Mine walked off over the high moor, and his footprints stop at a flat rock by the burn. I’d like a stone set there, so folk know. Carve it: GOOD RIDDANCE, AND GOOD LUCK. I mean both.', next: null },
      founder: {
        speaker: BT, text: 'Well? What’s the old stone say?',
        choices: [{ text: '“She lost her shadow, and went on anyway. Shadows keep what we put down; we can pick it up again.”', to: 'went', insight: 'shade_shadow_ledger' }, { text: 'That she lost her shadow and went on anyway.', to: 'went' }],
      },
      went: { speaker: BT, mood: 'happy', text: 'Went on anyway. (He puffs his pipe, very satisfied.) There you are, then. That’s the whole of it. The Veil was started by somebody like us.', next: 'unlisted' },
      unlisted: { speaker: BT, text: 'Here lies the Unlisted, though. Unlisted by who? Ask Mab. If anyone knows, it’s her, and she’ll say she doesn’t, and then she’ll tell you anyway because she can’t bear anybody else knowing a thing first.', next: null },
    },
  },
  {
    id: 'dialogue:obj-tallow-fold-gate', name: 'The Shepherd’s Shadow: the fold',
    entries: [{ when: stage('quest:shade-the-shepherds-shadow', 'fold'), node: 'fold' }, { node: 'gate' }],
    nodes: {
      fold: { speaker: 'narrator', text: 'Bryn’s sheep come down off the moor and through the gate, and not one of them notices either of you. A ewe walks straight into your knees and looks up, astonished, as if you had appeared out of the air, which for her you have.', next: null },
      gate: { speaker: 'narrator', text: 'Bryn Tallow’s fold-gate, shut, with thirty-one sheep behind it.', next: null },
    },
  },
  {
    id: 'dialogue:obj-unshadowed-founder-stone', name: 'Cairn of the Unshadowed: the founder’s stone',
    entries: [{ when: stage('quest:shade-cairn-of-the-unshadowed', 'cairn'), node: 'read' }, { node: 'stone' }],
    nodes: {
      read: { speaker: 'narrator', text: 'At the bottom of the cairn, the oldest stone, scratched in letters older than the warrens: “HERE LIES THE UNLISTED. The first of the Veil lost her shadow and went on anyway. Shadows keep what we put down. We can pick it up again.”', next: null },
      stone: { speaker: 'narrator', text: 'The founder’s stone at the foot of the Cairn of the Unshadowed: HERE LIES THE UNLISTED.', next: null },
    },
  },

  // ======================= ACT II
  {
    id: 'dialogue:shade-constance', name: 'C-1 Constance Gentle at the Drowned Rat', scope: 'party',
    entries: [{ when: stage('quest:shade-the-drowned-rat', 'rat'), node: 'start' }],
    nodes: {
      start: { speaker: CG, text: '(The back room of the Drowned Rat. Four cousins of the Veil, playing cards with marked cards, all looking at the floor behind you.) No shadow. You’re Mab’s, then. Sit down, cousin. Constance Gentle. I fence for the Morvane Road. What are you buying?', next: 'veil' },
      veil: {
        speaker: CG, text: 'We heard about the Moonwell.',
        choices: [
          { text: 'I robbed the Cult for the Veil.', to: 'veilwin', when: { flag: 'shade.moonwell', value: 'veil' } },
          { text: 'I carry the Keepers’ writ.', to: 'writ', when: { flag: 'shade.moonwell', value: 'keepers' } },
          { text: 'I called the shadows home.', to: 'home', when: { flag: 'shade.moonwell', value: 'home' } },
        ],
      },
      veilwin: { speaker: CG, mood: 'happy', text: 'Robbed the robbers and gave it away. Mab must be insufferable. Then you’re family, and the Rat hides family. Anyone comes asking on the Morvane Road, you were never here.', next: 'missing' },
      writ: { speaker: CG, text: 'The Keepers’ writ. (A cousin spits.) Never mind him. A writ opens doors, and one of them’s the sexton’s at Brindlecross; he sent me his page the minute he heard. Saves you the walk.', next: 'missing' },
      home: { speaker: CG, mood: 'sad', text: 'Called them home. (She looks at her own shadow, on the table under the lamp, for a long time.) Then you’ll want to know where the rest have gone.', next: 'missing' },
      missing: { speaker: CG, text: 'Shadows are going missing all down the road. Brindlecross folk, mostly. Last seen near the Gloamwood, going down, like something under the roots was reeling them in on a line. If yours went anywhere in Morvane, cousin, it went there.', next: null },
    },
  },
  {
    id: 'dialogue:hook-shade-hobb', name: 'Hook: Old Hobb’s list of shadows (C-1)', scope: 'party',
    entries: [{ when: stage('quest:shade-the-drowned-rat', 'hobb'), node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:hobb', text: 'A Veil thief at my lych-gate, with no shadow. (He leans on his spade.) I keep the names of the dead and the living, and I don’t show my books to thieves. Give me a reason.',
        choices: [
          { text: 'My shadow’s one of the missing.', to: 'mine', quest: true },
          { text: '(Stand in the lamplight and let him look at the wall behind you.)', to: 'wall', school: 'umbral', quest: true },
        ],
      },
      mine: { speaker: 'npc:hobb', mood: 'sad', text: 'Is it, now. (He opens the book.) Twenty-two names. Brindlecross folk who woke without a shadow, and every one of them saw theirs walk off towards the Gloamwood. You’ll be twenty-three.', next: 'end' },
      wall: { speaker: 'npc:hobb', text: '(He looks at the empty wall a long while.) Aye. That’s reason enough. (He opens the book.) Twenty-two names, and every one of them saw theirs walk off towards the Gloamwood. Twenty-three, with you.', next: 'end' },
      end: { speaker: 'npc:hobb', text: 'The Hollowed walk home, I always say. Shadows don’t. They walk to whoever’s calling them. Find out who’s calling.', next: null },
    },
  },
  {
    id: 'dialogue:obj-shade-silk-shadow-1', name: 'C-2 a caught shadow', scope: 'party',
    entries: [{ when: stage('quest:shade-the-spinners-silk', 'web'), node: 'cut' }, { node: 'web' }],
    nodes: {
      cut: { speaker: 'narrator', text: 'A shadow hanging in the web under the roots like washing on a line, kicking: a big man, by the shape, with a pipe. You cut it loose. It drops, and lands on its feet, and lifts its hat to you, and runs off up the root-caves towards Brindlecross at a great rate. It is not yours.', next: null },
      web: { speaker: 'narrator', text: 'A cut strand of web, swaying, with a scrap of shadow still caught on it.', next: null },
    },
  },
  {
    id: 'dialogue:shade-spinner-thread', name: 'C-3 the Spinner gives you your thread', scope: 'party',
    entries: [{ node: 'give' }],
    nodes: {
      give: { speaker: 'narrator', mood: 'sad', text: 'As the mark settles, the Spinner speaks once more, from everywhere: Shade. I wove every shadow in the Concord into my records. Yours came through my web on the night of the Bell. I kept a thread of it. Here.', next: 'thread' },
      thread: {
        speaker: 'narrator', text: 'A single grey thread, no thicker than a hair, comes down out of the dark and winds itself round your finger. It is warm. It pulls, very gently, south and east, towards the Gloamwood and Stag’s Rest, and then, beyond them, towards the Heart.',
        choices: [
          { text: '(Close your hand on it.)', to: 'hold', effects: [{ setFlag: 'shade.shadow_thread', value: true }] },
          { text: '(Tug it, once, the way the Veil signals “come home”.)', to: 'tug', school: 'umbral', effects: [{ setFlag: 'shade.shadow_thread', value: true }] },
        ],
      },
      hold: { speaker: 'narrator', text: 'It goes taut, and stays taut. Somewhere at the far end of it, something knows you are holding on.', next: null },
      tug: { speaker: 'narrator', text: 'Short, short, long. For a long moment, nothing. Then, very faintly, from very far away, something at the other end tugs back.', next: null },
    },
  },
  {
    id: 'dialogue:obj-shade-thread-knot-1', name: 'C-4 a knot in the thread',
    entries: [{ when: stage('quest:shade-the-shadow-at-stags-rest', 'thread'), node: 'knot' }, { node: 'tree' }],
    nodes: {
      knot: { speaker: 'narrator', text: 'The thread is knotted round an old beech, three times, the way you knot a rope when you stop to rest. In the moss at the foot of the tree there is a hollow the shape of someone sitting with their knees up, which is how you sit when you are tired. Black tears have dried on the bark.', next: null },
      tree: { speaker: 'narrator', text: 'An old beech with a knot of grey thread round it.', next: null },
    },
  },
  {
    id: 'dialogue:shade-shadow-willow', name: 'C-4 the Shadow under the Willow', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'Under the Weeping Willow, in the deepest shade in Morvane, your Shadow stands with its arms held out while two tall figures made of black tears pin a robe on it, heavy and dark, with a bell sewn into the hem. It has your face now, more or less. It is getting better at it.', next: 'shadow' },
      shadow: {
        speaker: 'npc:shadow-under-the-willow', mood: 'happy', text: 'You followed the thread! I knew you would. Do you like the robe? He’s making me his Herald. I’ll have a bell. I’ll have a voice. Everyone will look at me and nobody will look at the floor behind me ever again.',
        choices: [
          { text: 'Come home. I’ll say the things you said for me.', to: 'home' },
          { text: 'You’re wearing his tears.', to: 'tears' },
          { text: 'Mab’s shadow came with me. She’s homesick.', to: 'mab', when: { flag: 'shade.mab_shadow' } },
        ],
      },
      home: { speaker: 'npc:shadow-under-the-willow', mood: 'sad', text: '(It stops still, with its arms out, and the tailors stop too.) Would you? All of them? (Then it laughs, a little too quickly.) No. You’d say them once, and then put them down behind you again. I know. I’m where you put them.', next: 'go' },
      tears: { speaker: 'npc:shadow-under-the-willow', text: 'They fit. That’s the thing nobody tells you about tears. They fit anything. (It smooths the robe.) And they’re warm, if you wear enough of them.', next: 'go' },
      mab: { speaker: 'npc:shadow-under-the-willow', mood: 'sad', text: '(It looks down at the tiny cross silhouette at your heels, and the tiny silhouette glares back.) Hello, Mab. (Very quietly.) Tell her I meant it. What I said on the bed. Tell her it was us that meant it.', next: 'go' },
      go: { speaker: 'npc:shadow-under-the-willow', text: 'I’m going in now. Into the Heart. When I come out again I’ll be the real one. (It goes into the Willow’s shade and does not come out the other side, and the Willow shudders, and starts to weep harder.)', next: null },
    },
  },
  {
    id: 'dialogue:shade-nettle-gate', name: 'C-6 Nettle delivers Mab’s parcel', scope: 'party',
    entries: [{ when: stage('quest:shade-a-parcel-from-mab', 'parcel'), node: 'start' }, { node: 'after' }],
    nodes: {
      start: {
        speaker: 'npc:nettle-crook-gate', text: 'Toll. (She is sitting on a parcel at the foot of the Umbral arch with her hand out.) One copper for the parcel, one for the gate, one for the walk, which was very long, and one for Mab, because she said to charge you and keep it.',
        choices: [
          { text: '(Pay her four coppers.)', to: 'parcel' },
          { text: '(Lift the parcel out from under her while she counts.)', to: 'lift', school: 'umbral' },
        ],
      },
      lift: { speaker: 'npc:nettle-crook-gate', mood: 'happy', text: 'OI. (She looks at the empty space under her, and then at you, with enormous respect.) Mab said you’d do that. She said if you did, I wasn’t to charge you. She said if you didn’t, double.', next: 'parcel' },
      parcel: { speaker: 'narrator', text: 'Inside the parcel, wrapped in brown paper and string tied with a thief’s knot: your old hood, the one you wore as a child in the warrens, washed and mended. In the hood, a single lock-pick. Round the pick, a scrap of paper with three words in Mab’s small fierce hand.', next: 'words' },
      words: {
        speaker: GM, text: '“Come home, petal.”',
        choices: [
          { text: '(Put on the hood.)', to: 'hood', quest: true, effects: [{ setFlag: 'shade.mab_parcel', value: true }] },
          { text: '(Look down at Mab’s shadow, at your heels.)', to: 'fade', quest: true, when: { flag: 'shade.mab_shadow' }, effects: [{ setFlag: 'shade.mab_parcel', value: true }] },
        ],
      },
      fade: { speaker: 'narrator', text: 'Mab’s little shadow is sitting on your boot, facing the Umbral arch, and it is fainter than it was: you can see the grass through it now. It does not look at you. It looks at the arch, the way a dog looks at a door.', next: 'hood' },
      hood: { speaker: 'npc:nettle-crook-gate', text: 'Mab says the Veil’s fine and you’re to stop worrying, which means it isn’t and you should. I’m staying a bit. There’s a bridge over the river here with no toll on it at all. It’s a scandal.', next: null },
      after: { speaker: 'npc:nettle-crook-gate', text: 'Toll’s a copper. For talking to me. I’m very busy.', next: null },
    },
  },
  // ---------- featured bearers (hooks on the bearer NPCs)
  {
    id: 'dialogue:shade-featured-cantor', name: 'Featured: The Dark Is Kind', scope: 'party',
    entries: [
      { when: stage('quest:shade-the-dark-is-kind', 'back'), node: 'back' },
      { when: { all: [stage('quest:shade-the-dark-is-kind', 'shade'), { not: { flag: 'shade.seraphina_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-cantor', text: 'You’re the one with no shadow. Good. I’ve never once in my life stood in the dark. In Dawnspire it’s against the law. The Willow at Stag’s Rest throws the deepest shade in Morvane, and I have to go under it, and I can’t do it with anyone who’d see me be frightened.',
        choices: [{ text: 'I won’t cast anything. Nobody will see.', to: null, quest: true, effects: [{ setFlag: 'shade.seraphina_asked', value: true }] }],
      },
      back: {
        speaker: 'npc:bearer-cantor', text: 'I stood in it. It was cold, and then it wasn’t, and you were there, and you weren’t anything at all. It was the kindest thing I’ve ever felt. Whatever happens at the Heart, I’ll keep my halo low for you.',
        effects: [{ setFlag: 'shade.seraphina_thanked', value: true }],
        choices: [{ text: 'The dark is kind, Seraphina. It just never gets asked.', to: null }, { text: 'Thank you.', to: null }],
      },
    },
  },
  {
    id: 'dialogue:obj-shade-willow-deep-shade', name: 'Featured: under the Willow, in the dark', scope: 'party',
    entries: [
      { when: { all: [stage('quest:shade-the-dark-is-kind', 'shade'), { flag: 'story.sentinel.verdant' }] }, node: 'calm' },
      { when: stage('quest:shade-the-dark-is-kind', 'shade'), node: 'weeping' },
      { node: 'shade' },
    ],
    nodes: {
      weeping: { speaker: 'narrator', text: 'You walk under the Willow’s branches with Seraphina Dawe, into the dark. Her halo is the only light. She turns it down, one notch, then another, then out. Black tears patter on the leaves around you. She holds your sleeve so hard it tears. In the dark, neither of you casts anything at all.', next: 'breathe' },
      calm: { speaker: 'narrator', text: 'Under the Willow, now that she has stopped weeping, the shade is cool and green and very deep. Seraphina turns her halo down, one notch, then another, then out. She holds your sleeve. In the dark, neither of you casts anything at all.', next: 'breathe' },
      breathe: { speaker: 'narrator', text: 'After a long time, you hear her breathe out, the way people breathe out when they have put something heavy down. “Oh,” she says. “Oh. That’s all it is.”', next: null },
      shade: { speaker: 'narrator', text: 'The deep shade under the Weeping Willow.', next: null },
    },
  },
  {
    id: 'dialogue:shade-featured-samurai', name: 'Featured: The Silent Thread', scope: 'party',
    entries: [
      { when: stage('quest:shade-the-silent-thread', 'back'), node: 'back' },
      { when: { all: [stage('quest:shade-the-silent-thread', 'web'), { not: { flag: 'shade.aiko_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-samurai', text: '(She looks at your feet for a long time, and then at you.) You cannot hide. You have nothing to hide in. That is a start. I will cross the Spinner’s web, and I will not speak while there is anyone near who can hide. Walk with me.',
        choices: [{ text: '(Nod, and say nothing.)', to: null, quest: true, effects: [{ setFlag: 'shade.aiko_asked', value: true }] }],
      },
      back: {
        speaker: 'npc:bearer-samurai', text: 'On the Terraces we are taught that a shadow is where you keep what you will not show. You have none. So you showed me everything, all the way across, and you did not know you were doing it. When we go to the Heart, I will walk where you walk.',
        effects: [{ setFlag: 'shade.aiko_thanked', value: true }],
        choices: [{ text: '(Nod again.)', to: null }, { text: 'Thank you, Aiko.', to: null }],
      },
    },
  },
  {
    id: 'dialogue:obj-shade-silent-thread-1', name: 'Featured: the first long thread',
    entries: [{ when: stage('quest:shade-the-silent-thread', 'web'), node: 'cross' }, { node: 'thread' }],
    nodes: {
      cross: { speaker: 'narrator', text: 'A single thread of web across a drop with no bottom, the width of a hand. Aiko steps out onto it without a sound. You follow. Under your boots there is no shadow on the silk to tell you where your feet are, so you watch hers, and put yours where hers were.', next: null },
      thread: { speaker: 'narrator', text: 'A long thread of web across the drop under the roots, still trembling.', next: null },
    },
  },
  // ======================= ACT III
  {
    id: 'dialogue:shade-herald-fate', name: 'III-4 the Herald of Shadows: the Shadow’s fate', scope: 'party',
    entries: [{ node: 'kneel' }],
    nodes: {
      kneel: { speaker: SH, mood: 'hollow', text: '(It kneels on the top stair in the Herald’s robe, as solid as you are. On the stone behind it lies a shadow, long and grey and shaking: yours. It has been casting you.) Look, us. I’m the one in the light now.', next: 'bell' },
      bell: { speaker: 'narrator', text: 'The bell in its hem gives one last cracked ring, and the ring is your voice, saying your name the way you say it when you are frightened.', next: 'choose' },
      choose: {
        speaker: SH, mood: 'sad', text: 'I said all of it, you know. Every word you ever put down behind you. Somebody had to. (It looks up, with a face that is very nearly yours.) So. What do you do with a shadow that won’t lie down?',
        choices: [
          {
            text: '(Open your arms.) Come home. I’ll say them myself now. All of them.', to: 'spare', quest: true,
            when: { any: [{ flag: 'shade.moonwell', value: 'home' }, { trust: GM, value: 'trusted' }] },
            lockedLabel: 'You need to have called the warrens’ shadows home, or to have won Mab’s trust',
            effects: [{ setFlag: 'shade.nemesis_fate', value: 'spared' }, { setFlag: 'shade.shadowless', value: false }],
          },
          { text: '(Cut the bell from its hem, the way Mab taught you. Take your voice back.)', to: 'destroy', quest: true, effects: [{ setFlag: 'shade.nemesis_fate', value: 'destroyed' }] },
        ],
      },
      spare: { speaker: 'narrator', text: 'You open your arms. It hesitates, exactly the way you hesitate, and then it comes: not into your arms but down, the way water goes down, onto the stair at your feet. The robe falls empty. The bell rolls away down the Umbral stair and stops ringing.', next: 'spare2' },
      spare2: { speaker: 'narrator', text: 'And there on the stone, in the grey light of the Heart, you cast a shadow. It is a little taller than you. It stands with its chin up, which you never do. After a moment, you lift yours to match.', next: 'spare3' },
      spare3: { speaker: 'narrator', mood: 'happy', text: 'From somewhere round your heels, very faintly, in your own voice: “Hello, us.”', next: null },
      destroy: { speaker: 'narrator', text: 'You cut the bell from the hem the way Mab taught you to cut a purse, and it stops saying your name. Without your voice the Herald is only a robe full of tears, and the tears run out of it and away down the Umbral stair.', next: 'destroy2' },
      destroy2: { speaker: 'narrator', mood: 'sad', text: 'When it is over the robe lies empty on the top stair, and the shadow it was casting has gone with it. There is nothing on the stone behind you. There never will be again. The stair is very clean.', next: null },
    },
  },
  {
    id: 'dialogue:obj-shade-veil-banner', name: 'Send Mab’s Shadow Home: the Veil’s banner', scope: 'party',
    entries: [
      { when: { all: [stage('quest:shade-send-mabs-shadow-home', 'banner'), { flag: 'shade.mab_shadow' }, { flag: 'shade.mab_devotable' }] }, node: 'shadow-devoted' },
      { when: { all: [stage('quest:shade-send-mabs-shadow-home', 'banner'), { flag: 'shade.mab_shadow' }] }, node: 'shadow' },
      { when: { all: [stage('quest:shade-send-mabs-shadow-home', 'banner'), { flag: 'shade.mab_devotable' }] }, node: 'box-devoted' },
      { when: stage('quest:shade-send-mabs-shadow-home', 'banner'), node: 'box' },
      { node: 'banner' },
    ],
    nodes: {
      shadow: {
        speaker: 'narrator', text: 'Under the Veil’s old banner, rotted almost to lace, Mab’s little shadow stops. It is so faint now you can see the stone through it. It looks up at the banner, then back at you, crossly, the way Mab looks at a lock she has already opened.',
        choices: [{ text: '(Hold up the Spinner’s thread, and tug it: short, short, long.)', to: 'send', quest: true, effects: [{ setFlag: 'shade.mab_shadow_home', value: true }] }],
      },
      send: { speaker: 'narrator', text: 'The thread goes taut, all the way back across Morvane to the Veilwarrens. Mab’s shadow steps onto it like a rope-walker on the bridges, does not look down, and is gone along it, home, at a brisk and disapproving trot.', next: null },
      'shadow-devoted': {
        speaker: 'narrator', text: 'Under the Veil’s old banner, rotted almost to lace, Mab’s little shadow stops. It is so faint now you can see the stone through it. It looks up at the banner, then back at you, crossly, the way Mab looks at a lock she has already opened.',
        choices: [{ text: '(Hold up the Spinner’s thread, and tug it: short, short, long.)', to: 'send-devoted', quest: true, effects: [{ setFlag: 'shade.mab_shadow_home', value: true }] }],
      },
      'send-devoted': { speaker: 'narrator', text: 'The thread goes taut, all the way back across Morvane to the Veilwarrens. Mab’s shadow steps onto it like a rope-walker on the bridges, does not look down, and is gone along it, home, at a brisk and disapproving trot.', next: 'far' },
      far: {
        speaker: 'narrator', mood: 'happy', text: 'Far away, in a nest with two loose boards, a tiny old woman feels something sit down at her heels. She does not look. She says “Hm,” to nobody. Then, for the first time in forty years, she takes out a pen and writes to Duskmere.',
        effects: [{ trust: GM, set: 5 }], next: null,
      },
      box: {
        speaker: 'narrator', text: 'Under the Veil’s old banner, rotted almost to lace, hangs an iron box with a Veil lock, the old kind Mab taught you on. You have one lock-pick: the one she sent through the arch in your hood.',
        choices: [{ text: '(Pick it. Don’t break the pick.)', to: 'note', quest: true, effects: [{ setFlag: 'shade.founder_note', value: true }] }],
      },
      note: { speaker: 'narrator', text: 'It opens on the third try. Inside is a scrap of oilcloth, and on it the Veil founder’s hand, the same as on the stone at the Cairn: “To whoever comes after. I lost my shadow and went on anyway. It was not nothing. Go on anyway.”', next: null },
      'box-devoted': {
        speaker: 'narrator', text: 'Under the Veil’s old banner, rotted almost to lace, hangs an iron box with a Veil lock, the old kind Mab taught you on. You have one lock-pick: the one she sent through the arch in your hood.',
        choices: [{ text: '(Pick it. Don’t break the pick.)', to: 'note-devoted', quest: true, effects: [{ setFlag: 'shade.founder_note', value: true }] }],
      },
      'note-devoted': { speaker: 'narrator', text: 'It opens on the third try. Inside is a scrap of oilcloth, and on it the Veil founder’s hand, the same as on the stone at the Cairn: “To whoever comes after. I lost my shadow and went on anyway. It was not nothing. Go on anyway.”', next: 'far-box' },
      'far-box': {
        speaker: 'narrator', mood: 'happy', text: 'Far away, in a nest with two loose boards, a tiny old woman looks up from her unpicking as if somebody had said her name. She says “Hm,” to nobody. Then, for the first time in forty years, she takes out a pen and writes to Duskmere.',
        effects: [{ trust: GM, set: 5 }], next: null,
      },
      banner: { speaker: 'narrator', text: 'The Veil’s old banner on the Umbral stair: a hood and a key, embroidered in grey on black, rotted almost to lace.', next: null },
    },
  },
  {
    id: 'dialogue:obj-shade-weeping-shades', name: 'The Weeping Shades: the rank', scope: 'party',
    entries: [{ when: stage('quest:shade-the-weeping-shades', 'legion'), node: 'rank' }, { node: 'gone' }],
    nodes: {
      rank: { speaker: 'narrator', text: 'A rank at the back of the Legion, grey and wet and weeping, and not one of them casts a thing on the ground. Shadows, filled in with tears, as yours was. They turn their heads towards you all at once: the only other thing in the Heart with nobody behind it.', next: 'pipe' },
      pipe: {
        speaker: 'narrator', mood: 'sad', text: 'One of them, a big man’s shape with a pipe, lifts its hat to you. You cut it out of the Spinner’s web once, and it ran home to Brindlecross. The Bell called it here all the same.',
        choices: [
          { text: '(Tug the Spinner’s thread: short, short, long. Come home.)', to: 'come', quest: true },
          { text: '(Turn your back on them and walk away from the light, the way a person does.)', to: 'walk', school: 'umbral', quest: true },
        ],
      },
      come: { speaker: 'narrator', text: 'Short, short, long. All down the rank, heads lift. When you walk out of the Legion camp they come after you, a step behind and a little to one side, and the tears run off them as they go.', next: null },
      walk: { speaker: 'narrator', text: 'You walk away from the Legion’s fires, and behind you, one by one, they do what shadows have always done when somebody walks away from a light. They follow. The tears run off them as they go.', next: null },
      gone: { speaker: 'narrator', text: 'Where the Weeping Shades stood, the ground is wet, and nothing else.', next: null },
    },
  },
  {
    id: 'dialogue:obj-shade-camp-lantern', name: 'The Weeping Shades: a light to lie down in', scope: 'party',
    entries: [
      { when: { all: [stage('quest:shade-the-weeping-shades', 'light'), { flag: 'shade.nemesis_fate', value: 'spared' }] }, node: 'light-spared' },
      { when: stage('quest:shade-the-weeping-shades', 'light'), node: 'light' },
      { node: 'lantern' },
    ],
    nodes: {
      light: { speaker: 'narrator', text: 'You set a lantern by the camp fire and stand back. The Weeping Shades come into its light one at a time and lie down on the ground, the way shadows should, and each one stretches out long, pointing across Morvane to somebody who has been missing it.', next: 'go' },
      go: { speaker: 'narrator', mood: 'sad', text: 'Then they go, along the ground, home. The last, a small one, stops at the edge of the light and looks back at you, at the nothing round your feet. It does not go. It sits down by the crates, holding something round.', next: null },
      'light-spared': { speaker: 'narrator', text: 'You set a lantern by the camp fire and stand back. The Weeping Shades come into its light one at a time and lie down on the ground, the way shadows should, and each one stretches out long, pointing across Morvane to somebody who has been missing it.', next: 'go-spared' },
      'go-spared': { speaker: 'narrator', mood: 'happy', text: 'Then they go, along the ground, home. The last, a small one, stops at the edge of the light and looks at your shadow, lying beside you. Your shadow lifts a hand to it. It does not go. It sits down by the crates, holding something round.', next: null },
      lantern: { speaker: 'narrator', text: 'A Veil lantern by the camp fire, burning low, throwing everyone’s shadow long across the ground.', next: null },
    },
  },
  {
    id: 'dialogue:shade-bryn-heart', name: 'Bryn’s Flock: Bryn at the Heart camp', scope: 'party',
    entries: [
      { when: stage('quest:shade-bryns-flock', 'bryn'), node: 'start' },
      { when: { all: [stage('quest:shade-bryns-flock', 'back'), { flag: 'shade.nemesis_fate', value: 'spared' }] }, node: 'back-spared' },
      { when: stage('quest:shade-bryns-flock', 'back'), node: 'back' },
      { node: 'later' },
    ],
    nodes: {
      start: {
        speaker: BTH, mood: 'happy', text: 'Evening, fellow lightweight! Lovely night for the end of the world. (He waves his crook at the dark.) Don’t suppose you’ve seen thirty-one sheep? They followed the Bell. Sheep will follow anything that rings.',
        choices: [
          { text: 'You walked all the way from the Moors?', to: 'walk' },
          { text: 'Why can’t you find them?', to: 'find' },
        ],
      },
      walk: { speaker: BTH, text: 'Followed the droppings. That’s a shepherd’s whole education, that is. (He puffs his pipe.) Three realms and a gate, and not one inn would take the dog. I haven’t got a dog. They still wouldn’t.', next: 'find' },
      find: { speaker: BTH, text: 'Their shadows went when the Bell rang, same as yours did, and mine before that. Sheep don’t mind much. But a sheep with no shadow, in the dark, is a sheep you walk straight past, and I’ve walked past every one.', next: 'ask' },
      ask: {
        speaker: BTH, text: 'You, though. You’re the same as them. They won’t see you coming, so they won’t run. Round them up for an old man?',
        choices: [{ text: '(Take the crook.)', to: 'crook', quest: true }],
      },
      crook: { speaker: BTH, mood: 'happy', text: 'Mind the ram. He’s called Bishop. He thinks he’s in charge.', next: null },
      back: { speaker: BTH, mood: 'happy', text: 'Thirty-one! (He counts them twice, and then a third time, very slowly, for the pleasure of it.) Thirty-one. You walked straight into every one of them, didn’t you, and not one of them minded. Bless you.', next: 'wall' },
      wall: { speaker: BTH, text: 'There. What did I tell you on the wall? You don’t need a shadow to be found. You only need to stand still long enough for something to bump into you.', next: null },
      'back-spared': { speaker: BTH, mood: 'happy', text: 'Thirty-one! (He counts them twice, then stops, and peers at the ground behind you.) Well, look at that. You’ve got one back. Taller than you, isn’t it? Cheeky. Mine would never.', next: 'wall-spared' },
      'wall-spared': { speaker: BTH, text: 'Different shadows, different folk, like I said. Mine was a weight. Yours looks like it’s come home to stay. Keep it fed.', next: null },
      later: { speaker: BTH, text: 'Sheep are well. Heart is purple. Well. Black. Near enough.', next: null },
    },
  },
  {
    id: 'dialogue:obj-shade-stray-sheep-1', name: 'Bryn’s Flock: the first stray',
    entries: [{ when: stage('quest:shade-bryns-flock', 'sheep'), node: 'ewe' }, { node: 'prints' }],
    nodes: {
      ewe: { speaker: 'narrator', text: 'Something in the dark walks straight into your knees and says “baa”, astonished, exactly as Bryn’s ewe did on the Moors. Neither of you casts anything, so neither of you saw the other coming. You steer her back towards the fire.', next: null },
      prints: { speaker: 'narrator', text: 'Hoofprints in the dark, going back towards the camp fire.', next: null },
    },
  },
  {
    id: 'dialogue:obj-shade-stray-sheep-2', name: 'Bryn’s Flock: the heap',
    entries: [{ when: stage('quest:shade-bryns-flock', 'sheep'), node: 'heap' }, { node: 'prints' }],
    nodes: {
      heap: { speaker: 'narrator', text: 'A dozen of them, asleep in a heap against a rock, invisible but for the snoring. You count them by treading on them, one at a time. They take it in very good part.', next: null },
      prints: { speaker: 'narrator', text: 'A warm hollow against a rock, full of wool.', next: null },
    },
  },
  {
    id: 'dialogue:obj-shade-stray-sheep-3', name: 'Bryn’s Flock: Bishop',
    entries: [{ when: stage('quest:shade-bryns-flock', 'sheep'), node: 'ram' }, { node: 'prints' }],
    nodes: {
      ram: { speaker: 'narrator', text: 'The rest, and the ram, are standing at the very edge of the Heart, looking in at the black tears as if they might be grass. You put a hand on Bishop’s neck. He looks round, finds nobody there, and follows you anyway, out of pure good manners.', next: null },
      prints: { speaker: 'narrator', text: 'The very edge of the Heart, nibbled.', next: null },
    },
  },
  // ---------- Brindlecross hook: the Keepers’ record (I-5 “Hand them to the Keepers” payoff, 08 wave notes)
  {
    id: 'dialogue:hook-shade-ysolde', name: 'Hook: Ysolde and the Keepers’ record', scope: 'party',
    entries: [{
      when: {
        all: [{ flag: 'shade.moonwell', value: 'keepers' }, { not: { flag: 'shade.keepers_record' } }, { flag: 'story.act', op: '>=', value: 2 },
          { not: { questActive: 'quest:cc-stone-court' } }, { not: stage('quest:heart-last-chronicle', 'ysolde') }],
      },
      node: 'record',
    }],
    nodes: {
      record: { speaker: 'npc:ysolde', text: 'You’re the Veil thief who gave the Keepers back their pasts. (She holds up a packet with the Moon Obelisk’s seal.) Isidore Pale sent this, addressed to me, care of you. He says the Keepers owe you a year of grudges, and this is the first.', next: 'read' },
      read: {
        speaker: 'npc:ysolde', text: 'A copy from the Obelisk’s oldest shelf: a Turning at the Citadel, three hundred years ago. In the margin a Keeper has written, “The crown wept again this year, as it does every Turning. The Concordant sang it quiet.”',
        choices: [
          { text: 'The crown was weeping long before Casimir. These tears are older than the Hollowing.', to: 'older', insight: 'tears_older', effects: [{ setFlag: 'shade.keepers_record', value: true }] },
          { text: 'Keep it safe. It might matter.', to: 'keep', effects: [{ setFlag: 'shade.keepers_record', value: true }] },
        ],
      },
      older: { speaker: 'npc:ysolde', mood: 'sad', text: 'Older than the Hollowing. (She writes it down at once, in the margin of something else.) Then he didn’t make the grief. He only stopped the song that held it.', next: null },
      keep: { speaker: 'npc:ysolde', text: 'Everything matters to an archivist. That’s our curse. I’ll file it next to the Stag, and read it again when I can’t sleep.', next: null },
    },
  },
];

export default dialogues;
