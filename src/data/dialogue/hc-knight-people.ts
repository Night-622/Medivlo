/**
 * Hollow Crown, KNIGHT: Anvilgate people (general talk), the eight side quests, the mentor thread and the bounties,
 * plus the Act II class-thread and featured-bearer scenes. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const offer = (q: Q, text: string, to: string, extra?: NarrativeCondition): DialogueChoice =>
  ({ text, to, quest: true, when: extra ? { all: [fresh(q), extra] } : fresh(q), effects: [{ startQuest: q }] });
const bye: DialogueChoice = { text: 'Farewell.', to: null, tag: 'leave' };
const GM = 'npc:gideon-marke' as const;

const dialogues: DialogueDef[] = [
  // ---------- Gideon (general + mentor thread + the replica crown)
  {
    id: 'dialogue:knight-gideon', name: 'Gideon (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: GM, text: 'Squire. Sit, if you want. Do not touch the pot of paint, if you want to keep your fingers.',
        choices: [
          offer('quest:knight-the-stewards-writ', 'Ser, what did the Queen’s writ actually say?', 'writ', { trust: GM, value: 'friendly' }),
          offer('quest:knight-gideons-spurs', 'Why don’t you ride any more?', 'spurs', { trust: GM, value: 'trusted' }),
          { text: 'Why do you keep a pot of paint, ser?', to: 'paint' },
          { text: 'Did you have a horse of your own once, ser?', to: 'horse', when: { trust: GM, value: 'trusted' } },
          bye,
        ],
      },
      horse: { speaker: GM, text: '(He is quiet so long you think he will not answer.) Steadfast. A brown gelding with one white sock and no sense of direction whatsoever. He got lost in the Tilt Yard twice. The Tilt Yard is a rectangle.', next: 'horse2' },
      horse2: {
        speaker: GM, mood: 'sad', text: 'He carried me to the Citadel for the Turning, and he carried me home after. I put him out to grass that spring, because I had decided I did not get to ride. He lived another eleven years. I visited him every Sunday. He never once forgave me.',
        choices: [
          { text: 'Maybe he just wanted you to ride him.', to: 'horse3' },
          { text: '(Say nothing. Let him have it.)', to: 'horse4', trust: 1 },
        ],
      },
      horse3: { speaker: GM, text: 'Yes. Horses are very simple about that sort of thing. It is one of the many ways in which they are wiser than knights. Go on. I have paint to stir.', next: null },
      horse4: { speaker: GM, text: '(He nods, and stirs the paint pot, which does not need stirring, for some time.) Thank you. Go on, squire.', next: null },
      writ: { speaker: GM, text: 'I have never read it. Thirty years, and I never once read it. It is in the Order’s archive, filed behind the apologies, where nobody will ever have to look at it. Fetch it. I think I am old enough now.', next: null },
      spurs: { speaker: GM, mood: 'sad', text: 'On the night of the Hollowing I came home and threw my spurs down the Barrow well. A knight who has done what I did does not get to ride. If you are going down there anyway, they are at the bottom. I would like to see them. I do not know why.', next: null },
      paint: { speaker: GM, text: 'Every squire I have ever had, I meant to paint their arms on the day they were dubbed. I have not had a squire in thirty years. The paint has gone a bit thick.', next: 'start' },
    },
  },
  {
    id: 'dialogue:obj-berenika-writ', name: 'Mentor: the writ in the archive', scope: 'party',
    entries: [{ when: stage('quest:knight-the-stewards-writ', 'archive'), node: 'find' }, { node: 'plain' }],
    nodes: {
      find: { speaker: 'narrator', text: 'Behind a wall of boxed apologies, each one labelled in the same careful clerk’s hand, a single folded sheet with a broken royal seal. You unfold it.', next: 'read' },
      read: { speaker: 'narrator', text: '“To my knights. I name Casimir of Brindlecross steward of the crown, for this one night, until it passes to Fist at dawn. He cannot hear the stones, so he cannot want them. Let him hold it one night: he has never held anything. Berenika.”', next: null },
      plain: { speaker: 'narrator', text: 'An empty space behind the apologies, the shape of one folded sheet.', next: null },
    },
  },
  {
    id: 'dialogue:knight-gideon-writ', name: 'Mentor: the Steward’s Writ', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: GM, text: 'Read it to me. I can read. Read it to me anyway.', next: 'read' },
      read: {
        speaker: GM, mood: 'sad', text: '(You read it. He is quiet a long time.) “He has never held anything.” She was not giving away the crown. She was giving a lonely man one night of being trusted. Ironhold has called that treason for thirty years.',
        choices: [{ text: 'It wasn’t treason. It was kindness.', to: 'end', insight: 'berenika_reason', trust: 1 }],
      },
      end: { speaker: GM, text: 'Kindness. Yes. That is a much harder thing to wall in. Keep it. If anyone in this city ever needs to hear it, you will know.', next: null },
    },
  },
  {
    id: 'dialogue:obj-barrow-well', name: 'Mentor: the Barrow well', scope: 'party',
    entries: [{ when: stage('quest:knight-gideons-spurs', 'well'), node: 'down' }, { node: 'plain' }],
    nodes: {
      down: { speaker: 'narrator', text: 'You tie off a rope and go down the Barrow well, hand over hand, into the cold. At the bottom the crypts are flooded to the knee, and somewhere in the dark something made of iron is still walking its rounds.', next: null },
      plain: { speaker: 'narrator', text: 'The Barrow well. A long way down, the water glints.', next: null },
    },
  },
  {
    id: 'dialogue:obj-gideon-spurs', name: 'Mentor: the spurs', entries: [{ node: 's' }],
    nodes: { s: { speaker: 'narrator', text: 'A pair of knight’s spurs, green with thirty years of water. When you lift them, one rowel turns, squeaks, and keeps turning.', next: null } },
  },
  {
    id: 'dialogue:knight-gideon-spurs', name: 'Mentor: Gideon’s Spurs', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: GM, text: '(He does not take them. He looks at them in your hands for a long time.) They still turn. Thirty years in a well, and the fool things still turn.', next: 'end' },
      end: { speaker: GM, mood: 'sad', text: 'Keep them for me. Not yet. One day there is a place I ought to leave them, and I would like someone who knows the way to carry them there. Thank you, Ser. Squire. Whichever.', effects: [{ trust: GM, delta: 1 }], next: null },
    },
  },
  {
    id: 'dialogue:knight-gideon-crown', name: 'Side: the replica crown', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: GM, text: '(He puts his hands behind his back as soon as he sees it.) The practice crown. We rehearsed with that for a month. Berenika would hand it to me, and I would carry it to the Fist envoy, and bow. I was very good at the bow.',
        choices: [
          { text: 'Hold it, ser.', to: 'hold' },
          { text: 'I’ll keep it safe.', to: 'keep', trust: 1 },
        ],
      },
      hold: { speaker: GM, mood: 'sad', text: '(He reaches out. His hand stops an inch from it and will not go any further.) No. No, I find I cannot. Keep it safe for me. Somebody should carry it to Fist one day, even if it is only iron.', next: 'rail' },
      keep: { speaker: GM, text: 'Do. Somebody should carry it to Fist one day, even if it is only iron and paint. It would be a start.', next: 'rail' },
      rail: { speaker: GM, text: 'Until then, it should not sit in a cupboard like a thing we are ashamed of. Put it on the altar rail in the chapel, where you kept your vigil. Somewhere it can wait with some dignity. I will not come. I will know it is there.', next: null },
    },
  },
  // ---------- Konrad and the Chapter-Master (general)
  {
    id: 'dialogue:knight-konrad', name: 'Konrad (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:konrad-berenikson', mood: 'happy', text: 'Squire! Have you eaten? You look like you have been apologising to someone. Stop it at once.',
        choices: [
          { text: 'What was your grandmother like?', to: 'gran' },
          { text: 'Why is your armour weeping, Highness?', to: 'weep', when: { flag: 'knight.konrad_met' } },
          bye,
        ],
      },
      gran: { speaker: 'npc:konrad-berenikson', text: 'Kind. Everyone says so, the way you would say somebody had a limp. I was four when she left for the Citadel and never came back. I have her armour. It fits me now.', next: null },
      weep: { speaker: 'npc:konrad-berenikson', text: 'Is it? Oh, that. It is very old armour. It does that in the damp. (He does not look down.)', next: null },
    },
  },
  {
    id: 'dialogue:knight-varley', name: 'Chapter-Master Varley (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ansel-varley', text: 'Squire. The Chapterhouse is open from dawn until the second bell, except on feast days, fast days and days of contrition, which is most of them.',
        choices: [{ text: 'What does the Order actually do, Chapter-Master?', to: 'order' }, bye],
      },
      order: { speaker: 'npc:ansel-varley', text: 'We hold the line. For thirty years the line has mostly been walls, and we have held those very well. Some of us would like there to be something on the other side of them again.', next: null },
    },
  },
  // ---------- the Anvilgate Wards: Hilde, Bray, Hock
  {
    id: 'dialogue:knight-hilde', name: 'Hilde Ninelocks (Hilde’s Tenth Key)',
    entries: [{ when: stage('quest:knight-hildes-tenth-key', 'hilde'), node: 'tenth' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:hilde-ninelocks', text: 'Nine keys. Ten gates. Nine keys, ten gates. I count them every night and it never comes out right.',
        choices: [offer('quest:knight-hildes-tenth-key', 'Let me try the keys for you.', 'keys'), bye],
      },
      keys: { speaker: 'npc:hilde-ninelocks', text: 'Would you? Here, all nine, mind the bent one. One of my gates should not exist. I have walked Lantern Street every day for twenty years and I cannot tell you which.', next: null },
      tenth: {
        speaker: 'npc:hilde-ninelocks', text: 'The bakery gate? The one by Corisande Brack’s? She has paid me a penny every morning since C. 1031 to get to her own oven. She never complained. Why did she never complain?',
        choices: [
          { text: 'Take the gate down, Hilde.', to: 'down' },
          { text: 'Give Corisande a key of her own.', to: 'key', trust: 1 },
        ],
      },
      down: { speaker: 'npc:hilde-ninelocks', text: 'Take it down? A gate? In Anvilgate? (She thinks about it.) Do you know, I believe I will. Nine keys, nine gates. I shall sleep tonight. Here. Bread. Corisande sends it.', next: 'why' },
      key: { speaker: 'npc:hilde-ninelocks', mood: 'happy', text: 'A tenth key! For the tenth gate! Oh, that is tidy. That is very tidy. Ten keys, ten gates. Corisande has sent you bread. She sends everyone bread. That is probably why she never complained.', next: 'why' },
      why: { speaker: 'npc:hilde-ninelocks', text: 'Only I should like to know why. Eleven years, a penny a morning, and never a word. Would you ask her? Go round the front. I cannot. I have been taking her pennies. It would be like asking a creditor to tea.', next: null },
    },
  },
  {
    id: 'dialogue:obj-bakery-gate', name: 'Hilde’s tenth gate',
    entries: [{ when: stage('quest:knight-hildes-tenth-key', 'tenth'), node: 'look' }, { node: 'plain' }],
    nodes: {
      look: { speaker: 'narrator', text: 'Through the bars: a bakery, entirely enclosed by the gate on all four sides. A floury woman inside waves at you, posts a penny through the bars into the toll-box, and goes back to her loaves. A brass plate on the gate reads: Erected C. 1031. For Public Safety.', next: null },
      plain: { speaker: 'narrator', text: 'The bakery gate. It smells wonderful.', next: null },
    },
  },
  {
    id: 'dialogue:knight-bray', name: 'Clerk Absalom Bray (the Office of Public Contrition)',
    entries: [{ when: stage('quest:knight-the-office-of-public-contrition', 'bray'), node: 'letter' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:absalom-bray', text: 'The Office of Public Contrition. Do come in. Mind the shelves. Mind the other shelves.',
        choices: [offer('quest:knight-the-office-of-public-contrition', 'What does the office do?', 'office'), bye],
      },
      office: { speaker: 'npc:absalom-bray', text: 'I apologise. On behalf of Ironhold, to Concordia, formally, once a day since the Hollowing. Ten thousand, nine hundred and fifty letters. Do have a look. I am rather proud of the spring of C. 1027.', next: null },
      letter: {
        speaker: 'npc:absalom-bray', text: 'Well? Too much? The spring of C. 1027 is too much, I know. I was going through a semicolon phase.',
        choices: [
          { text: 'Why have you never sent one?', to: 'why' },
          { text: 'They’re beautiful, Clerk Bray.', to: 'why', trust: 1 },
        ],
      },
      why: { speaker: 'npc:absalom-bray', mood: 'sad', text: 'Sent? Where? The gate has been shut thirty years. And an apology you send might be answered, and then what would I do? (He takes a fresh sheet off the top of the pile.) This is number ten thousand, nine hundred and fifty-one. If you are going through the gate, would you take it?', next: 'take' },
      take: {
        speaker: 'npc:absalom-bray', text: 'Only if it is no trouble. And only if you think it is good enough.',
        choices: [
          { text: 'I’ll carry it, and I’ll see it read.', to: 'carry', effects: [{ setFlag: 'knight.bray_letter', value: true }] },
          { text: 'Keep writing them, Bray. Someone should.', to: 'keep' },
        ],
      },
      carry: { speaker: 'npc:absalom-bray', mood: 'happy', text: 'Read! Oh dear. Oh, my goodness. I shall need to sit down. Mind the shelves on your way out.', next: 'first' },
      keep: { speaker: 'npc:absalom-bray', text: 'Someone should. Yes. Thank you. That is exactly what I tell myself.', next: 'first' },
      first: { speaker: 'npc:absalom-bray', mood: 'sad', text: '(He looks at the first shelf, where there is a gap.) Number one is not here. I wrote it the morning after, and put it in the Chapterhouse post-basket, and ran. It is probably still there. I have never dared look. Would you?', next: null },
    },
  },
  {
    id: 'dialogue:obj-contrition-shelves', name: 'The shelves of apologies',
    entries: [{ when: stage('quest:knight-the-office-of-public-contrition', 'shelves'), node: 'read' }, { node: 'plain' }],
    nodes: {
      read: { speaker: 'narrator', text: '“Dear Concordia, we are so sorry.” “Dear Concordia, we remain sorry.” “Dear Concordia, regarding our sorrow, see previous.” A whole shelf from C. 1027 is in verse. One letter, from a bad winter, says only: “Still here. Still sorry. Are you warm?”', next: null },
      plain: { speaker: 'narrator', text: 'Shelves of apologies, floor to ceiling, filed by date.', next: null },
    },
  },
  {
    id: 'dialogue:knight-hock', name: 'Toll-Sergeant Hock (bounties)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:barnabas-hock', text: 'Bounties on the board. Toll first. Joke. Mostly.',
        choices: [
          offer('quest:knight-bounty-toll-gate-sentries', 'The Coppergate Sentries.', 'sentries'),
          offer('quest:knight-bounty-lance-eaters', 'The Lance-Eaters?', 'beetles'),
          bye,
        ],
      },
      sentries: { speaker: 'npc:barnabas-hock', text: 'Six hollow Sentries holding the Coppergate toll. They charged my sergeant a penny to get past them. Then they charged him again on the way back. Paid by the Sentry.', next: null },
      beetles: { speaker: 'npc:barnabas-hock', text: 'Scrap Beetles in the Tilt Yard racks. They have eaten half the lances. The squires are jousting with broom handles. It is not dignified.', next: null },
    },
  },
  // ---------- the Tilt Yard: Wat Mudge, Duty
  {
    id: 'dialogue:knight-wat', name: 'Squire Wat Mudge (the Dented Lance)',
    entries: [{ when: stage('quest:knight-the-dented-lance', 'wat'), node: 'tilt' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:wat-mudge', mood: 'happy', text: 'Oh, hello! Don’t mind the dent, that’s from Tuesday. Or that one. That one’s from me falling off a stationary horse.',
        choices: [offer('quest:knight-the-dented-lance', 'Wat, is your father coming to watch?', 'father'), bye],
      },
      father: { speaker: 'npc:wat-mudge', text: 'At noon. He’s never seen me tilt. He’s seen me fall off things, which is different. Just one clean pass. Would you coach me? You never fall off anything.', next: null },
      tilt: {
        speaker: 'npc:wat-mudge', text: 'Right. Right. He’s in the stands. He’s got his arms folded. Last advice?',
        choices: [
          { text: 'Lance low. Eyes open. Breathe out as you hit.', to: 'clean', effects: [{ setFlag: 'knight.wat_tilt', value: 'clean' }] },
          { text: 'Don’t look at your father. Look at the quintain.', to: 'clean', trust: 1, effects: [{ setFlag: 'knight.wat_tilt', value: 'clean' }] },
          { text: '[Iron] (Lend him your shield.) Hold the line, Wat.', to: 'shield', school: 'iron', effects: [{ setFlag: 'knight.wat_tilt', value: 'shield' }] },
        ],
      },
      clean: { speaker: 'npc:wat-mudge', mood: 'happy', text: '(Thunder of hooves; a crack; the quintain spins three times.) I HIT IT! I hit it with the right end! Father’s standing up! Father is clapping! He never claps! Oh, I’ve dropped the lance. Doesn’t matter!', next: 'after' },
      shield: { speaker: 'npc:wat-mudge', mood: 'happy', text: '(He comes off at the end of the run, as always, but he hits it first, and he lands on your shield, and he gets up.) Did you see? Did HE see? He saw. He’s laughing. The good kind!', next: 'after' },
      after: { speaker: 'npc:wat-mudge', text: 'He’s still up there. He’s got something wrapped in sacking. (Wat goes pale.) Will you go up first? I’ll see to the horse. The horse needs seeing to. Very urgently. For some time.', next: null },
    },
  },
  {
    id: 'dialogue:obj-tilt-quintain-3', name: 'The quintain',
    entries: [{ when: stage('quest:knight-the-dented-lance', 'quintain'), node: 'pass' }, { node: 'plain' }],
    nodes: {
      pass: { speaker: 'narrator', text: 'Third pass. Wat hits the quintain squarely with the lance, which spins round and hits Wat squarely with the sandbag. He gets up grinning. Progress.', next: null },
      plain: { speaker: 'narrator', text: 'A battered quintain, still spinning slightly.', next: null },
    },
  },
  {
    id: 'dialogue:knight-duty', name: 'Duty (A Horse Called Duty)',
    entries: [{ when: stage('quest:knight-a-horse-called-duty', 'home'), node: 'home' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:duty', text: '(A tall grey destrier, white about the muzzle, regards you over his stall door. He has the air of a horse who has been waiting for someone to understand something.)',
        choices: [offer('quest:knight-a-horse-called-duty', '(Open the stall door.)', 'open'), bye],
      },
      open: { speaker: 'npc:duty', text: '(He walks out past you without being led, stops in the yard, and looks back to see whether you are coming. It is the Queen’s evening ride, the grooms say. He has not asked for it in thirty years.)', next: null },
      home: { speaker: 'npc:duty', mood: 'happy', text: '(Back in his stall he eats an entire bucket of oats without stopping, then puts his long nose against your shoulder and leaves it there.)', next: null },
    },
  },
  {
    id: 'dialogue:obj-queens-route-1', name: 'The Queen’s route: the Lantern Arch',
    entries: [{ node: 'r' }],
    nodes: { r: { speaker: 'narrator', text: 'At the Lantern Arch Duty stops, without being asked, and waits exactly long enough for a rider to wave to someone in a window. Nobody is in the window. He walks on.', next: null } },
  },
  {
    id: 'dialogue:obj-duty-saddle', name: 'The Queen’s route: the saddle-pocket', scope: 'party',
    entries: [{ when: stage('quest:knight-a-horse-called-duty', 'wall'), node: 'pocket' }, { node: 'plain' }],
    nodes: {
      pocket: {
        speaker: 'narrator', text: 'At the foot of the Wall, where the Queen’s road once ran on to the Iron Gate, Duty stops and stamps. His old saddle hangs on a hook by the arch. In its pocket is a draft of a letter in Berenika’s hand, crossed out and rewritten many times.',
        choices: [
          { text: '(Read the last line she kept.)', to: 'line', insight: 'berenika_reason' },
          { text: '(Leave it. It was hers.)', to: 'leave' },
        ],
      },
      line: { speaker: 'narrator', text: '“He cannot hear the stones, so he cannot want them.” Under it, crossed out: “Gideon will say I am being soft.” Under that, not crossed out: “Gideon is usually right. Not tonight.”', next: null },
      leave: { speaker: 'narrator', text: 'You fold it back into the saddle-pocket. Duty breathes out, long and slow, and turns for home.', next: null },
      plain: { speaker: 'narrator', text: 'An old saddle on a hook by the Wall arch, the leather cracked.', next: null },
    },
  },
  // ---------- the Fortress Forge: Marit Blum
  {
    id: 'dialogue:knight-blum', name: 'Forgemistress Blum (Hollow Rivets, the Replica Crown)',
    entries: [{ when: stage('quest:knight-hollow-rivets', 'blum'), node: 'tags' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:marit-blum', text: 'Mind the sparks, mind the slag, mind my riveters, who are going quiet on me one after another like candles.',
        choices: [
          offer('quest:knight-hollow-rivets', 'Quiet how?', 'quiet'),
          offer('quest:knight-the-replica-crown', 'Is there anything old in the Forge, Forgemistress?', 'crown'),
          bye,
        ],
      },
      quiet: { speaker: 'npc:marit-blum', text: 'They stop singing at the bench. Then they stop talking. Then they just rivet, very neatly, and look at the wall. It is always the benches nearest the new crates.', next: null },
      crown: { speaker: 'npc:marit-blum', text: 'Everything in here is old, young knight, including me. But there is one thing in the oldest hall. A practice crown, for the hand-over in C. 1012. It belongs with Ser Gideon. He will not come and get it.', next: null },
      tags: {
        speaker: 'npc:marit-blum', mood: 'angry', text: '“Hollow Lode. M. Ruhl.” Magda Ruhl, the mine-boss down the Deepworks. Half the price of honest iron and twice as shiny. The Regency signed for it. I signed for it. I am going to have words.',
        choices: [{ text: 'The miners will be carrying it too.', to: 'miners' }, { text: 'Throw the crates out, Forgemistress.', to: 'out', trust: 1 }],
      },
      miners: { speaker: 'npc:marit-blum', mood: 'sad', text: 'The miners dug it. Gods help them. I will send word down the shaft, for what that is worth. Here: for your trouble, and your eyes.', next: 'lift' },
      out: { speaker: 'npc:marit-blum', text: 'Out. Into the slag-run, where it can weep at the slag. Here: for your trouble, and your eyes.', next: 'lift' },
      lift: { speaker: 'npc:marit-blum', text: 'And while you have them open: the crates come up from the Deepworks in the big cage-lift. It keeps a loading ledger. I want to know where else that iron went. I have a nasty feeling it went everywhere.', next: null },
    },
  },
  {
    id: 'dialogue:obj-rivet-crate-3', name: 'Hollow Rivets: the third crate',
    entries: [{ when: stage('quest:knight-hollow-rivets', 'crates'), node: 'tag' }, { node: 'plain' }],
    nodes: {
      tag: { speaker: 'narrator', text: 'The rivets in this crate are wet. Not with oil. A shipping tag is wired to the lid: Hollow Lode. M. Ruhl. Paid in full.', next: null },
      plain: { speaker: 'narrator', text: 'A crate of rivets, nailed shut again.', next: null },
    },
  },
  {
    id: 'dialogue:obj-replica-crown', name: 'The replica crown',
    entries: [{ when: stage('quest:knight-the-replica-crown', 'crown'), node: 'crown' }, { node: 'plain' }],
    nodes: {
      crown: { speaker: 'narrator', text: 'Under a dust-sheet, on a velvet cushion gone grey: a crown of painted iron, twelve settings, all empty. Someone has written on the underside of the cushion in chalk: PRACTICE. DO NOT BOW TO.', next: null },
      plain: { speaker: 'narrator', text: 'An empty velvet cushion, and a dust-sheet folded neatly beside it.', next: null },
    },
  },
  // ---------- Berenika's Wall: Old Jarek, Fenna Tock
  {
    id: 'dialogue:knight-jarek', name: 'Old Jarek (the Masons’ Marks)',
    entries: [{ when: stage('quest:knight-the-masons-marks', 'jarek'), node: 'name' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:old-jarek', text: 'Built this Wall. Me and four hundred others. Every one of us cut a little sorry into our stone, the Regency’s orders. I would like to read mine again before she falls down.',
        choices: [offer('quest:knight-the-masons-marks', 'I’ll find it for you.', 'find'), bye],
      },
      find: { speaker: 'npc:old-jarek', text: 'A hook and a star. That’s me. Somewhere on the cracked stretch. My eyes won’t do the soot any more.', next: null },
      name: {
        speaker: 'npc:old-jarek', text: 'What does it say? Read it to me.',
        choices: [{ text: 'It says “Ilka”.', to: 'ilka' }],
      },
      ilka: { speaker: 'npc:old-jarek', mood: 'sad', text: 'Ilka. (He laughs, and wipes his eyes.) My daughter. Born the week I cut that stone. I wasn’t sorry about anything that week. Couldn’t make myself. So I cut her name instead and told the foreman it was Old Haldish for “regret”.', next: 'end' },
      end: { speaker: 'npc:old-jarek', text: 'He believed me. She’s got children of her own now. Here. That’s for reading it. Best apology on the whole Wall, that is.', next: 'rub' },
      rub: { speaker: 'npc:old-jarek', text: '(He takes a sheet of paper and a stick of charcoal out of his apron, and rubs the stone, carefully, all four letters.) She’s never known. I never told her. Would you take it round? Lamp Lane, the green door. I’d only stand on the step and say something stupid.', next: null },
    },
  },
  {
    id: 'dialogue:obj-mason-mark-3', name: 'The Masons’ Marks: a hook and a star',
    entries: [{ node: 'm' }],
    nodes: { m: { speaker: 'narrator', text: 'Under the soot, cut small and neat: a hook, a star, and four letters. ILKA.', next: null } },
  },
  {
    id: 'dialogue:knight-fenna', name: 'Fenna Tock (the Wall-Walker)',
    entries: [{ when: stage('quest:knight-the-wall-walker', 'fenna'), node: 'saw' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:fenna-tock', text: 'Are you a knight? You’re not. You’re a squire. You’ve got no picture on your shield. I’m going up to the top tower. You can come if you like.',
        choices: [offer('quest:knight-the-wall-walker', 'There are hollow Sentries up there, Fenna.', 'sentries'), bye],
      },
      sentries: { speaker: 'npc:fenna-tock', text: 'I know. I go round them. They go clank, so you always know where they are. Come on, then. You can go clank at them.', next: null },
      saw: { speaker: 'npc:fenna-tock', mood: 'happy', text: 'I SAW it. I saw it! A glint, right out past the gate! That’s Concordia! I’m going to tell everyone at school and nobody will believe me and I don’t care!', next: 'end' },
      end: { speaker: 'npc:fenna-tock', text: 'When the gate opens I’m going to be first through. Before the knights. Before anyone. You can be second.', next: null },
    },
  },
  {
    id: 'dialogue:obj-wall-high-tower', name: 'The highest tower of the Wall', scope: 'party',
    entries: [{ when: stage('quest:knight-the-wall-walker', 'tower'), node: 'look' }, { node: 'plain' }],
    nodes: {
      look: {
        speaker: 'narrator', text: 'The whole of Ironhold below you, walls inside walls. Beyond the Iron Gate, very far off, a glint of evening light on old stone arches. Fenna grips the parapet with both hands.',
        choices: [
          { text: '(Look at the Colossus, standing at the gate.)', to: 'colossus', effects: [{ setFlag: 'knight.fenna_saw', value: true }] },
          { text: '(Look where Fenna is looking.)', to: 'arches' },
        ],
      },
      colossus: { speaker: 'narrator', text: 'The Colossus stands with its back to the gate. As your half-stone hums, its huge head turns, very slowly, until it is looking straight up at this tower. At you. Fenna does not notice. She is looking at the arches.', next: 'arches' },
      arches: { speaker: 'narrator', text: '“That’s it,” says Fenna. “That’s the whole world.”', next: null },
      plain: { speaker: 'narrator', text: 'The top of the highest tower. On a clear evening, they say, you can see the Gate Circle.', next: null },
    },
  },

  // ======================= ACT II
  {
    id: 'dialogue:knight-perpetua', name: 'C-1 the Iron Embassy: Envoy Stannard', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:perpetua-stannard', text: 'That tabard. That is the Order’s tabard. Come in, come in, mind the shutters, they have not opened since C. 1012. Envoy Perpetua Stannard, Ironhold embassy to Concordia, still accredited, nobody ever told me otherwise.',
        choices: [
          { text: 'I carry a letter from Clerk Bray, of the Office of Public Contrition.', to: 'bray', when: { flag: 'knight.bray_letter' } },
          { text: 'You kept the embassy open for thirty years?', to: 'kept' },
          { text: 'The Order voted to wall in the Colossus.', to: 'wall', when: { flag: 'knight.colossus_vote', value: 'wall' }, trust: 1 },
        ],
      },
      bray: {
        speaker: 'npc:perpetua-stannard', mood: 'sad', text: '(She reads it twice. Then she goes to a drawer and takes out a letter of her own, and another, and another.) I have written to Anvilgate every week for thirty years. “You are forgiven. Come home.” Not one got through. Shall we read them together?',
        choices: [{ text: '(Read both letters aloud, his and hers.)', to: 'both', effects: [{ setFlag: 'knight.letters_read', value: true }] }],
      },
      both: { speaker: 'npc:perpetua-stannard', mood: 'happy', text: '“We are so sorry.” “You are forgiven.” Thirty years of that, passing each other in the dark. Oh, that silly man. Tell him I said his semicolons were excellent.', next: 'warden' },
      wall: { speaker: 'npc:perpetua-stannard', text: 'Another wall. Of course they did. (She laughs, and it is fond.) Then you are a real Order knight, and I know exactly how to talk to you. Sit down.', next: 'warden' },
      kept: { speaker: 'npc:perpetua-stannard', text: 'Someone had to. An embassy with its lamp out is a declaration of war, in the old protocols. I did not want Ironhold at war with anyone by accident. It has enough to be sorry about on purpose.', next: 'warden' },
      warden: {
        speaker: 'npc:perpetua-stannard', text: 'You will be wanting Iron’s Sentinel. Under the gold of the Gilded city there is something that has been hammering every night since the Hollowing. The Sparkwrights call it the Gilded Engine. In the embassy papers, it is the Crown-Smith.',
        choices: [{ text: 'Then I’ll go down to it.', to: 'go', quest: true }],
      },
      go: { speaker: 'npc:perpetua-stannard', text: 'Follow the hammering. It never misses a stroke. And Ser Knight: come back up. I have only just started having visitors.', next: null },
    },
  },
  {
    id: 'dialogue:obj-knight-hammer-echo-3', name: 'C-2 the hammering under the gold', scope: 'party',
    entries: [{ when: stage('quest:knight-the-buried-forge', 'hammer'), node: 'door' }, { node: 'plain' }],
    nodes: {
      door: { speaker: 'narrator', text: 'Down a gold-drowned stair, a door of plain dark iron in a street of gold. The hammering is behind it. You count the strokes without meaning to, and your half-stone counts with you, and you realise it is keeping time with a Turning that has not come for thirty years.', next: null },
      plain: { speaker: 'narrator', text: 'Gold dust, and somewhere below it, a hammer that never stops.', next: null },
    },
  },
  {
    id: 'dialogue:obj-knight-plate-anvil', name: 'C-4 Berenika’s plate on the smiths’ anvil', scope: 'party',
    entries: [{ when: stage('quest:knight-the-princes-plate', 'plate'), node: 'plate' }, { node: 'plain' }],
    nodes: {
      plate: { speaker: 'narrator', text: 'Berenika’s armour, laid out on the smiths’ anvil like a body at a wake, each plate fixed to a frame of black iron that runs off into the dark, huge, unfinished. A note is pinned to the breastplate in a bold, golden hand.', next: 'note' },
      note: {
        speaker: 'npc:konrad-berenikson', text: '“For the head and the shield-arm, as agreed. She would have wanted it to be useful. Tell my squire, if they come, that I asked to be bound and nobody made me. I am finally going to be magnificent. K.”',
        choices: [
          { text: 'He gave them his grandmother’s armour.', to: 'down' },
          { text: '[Iron] (Lay your shield on the anvil beside it, for a moment.)', to: 'shield', school: 'iron' },
        ],
      },
      shield: { speaker: 'narrator', text: 'Your painted shield, or your blank one, beside the Queen’s plate. The black frame trembles very slightly, as if it has noticed. Then it is still.', next: 'down' },
      down: { speaker: 'narrator', text: 'Below the forge, under the oldest kiln, something enormous takes a breath, and the whole Ashfall shakes.', next: null },
      plain: { speaker: 'narrator', text: 'An empty anvil, and the marks of a frame that was dragged away.', next: null },
    },
  },
  // ---------- C-6 Gideon's Letter (Duty, or a Wall courier)
  {
    id: 'dialogue:knight-gideon-letter', name: 'C-6 Gideon’s letter', scope: 'party',
    entries: [{ when: { flag: 'knight.duty_walked' }, node: 'duty' }, { node: 'courier' }],
    nodes: {
      duty: { speaker: 'narrator', text: 'Duty is standing in the Gate Circle under the Iron arch, saddled, very pleased with himself, with a letter tucked under the girth. Nobody led him. The grooms will be furious.', next: 'letter' },
      courier: { speaker: 'npc:joss-ashlar', text: 'Courier Ashlar, Wall post. Thirty-nine gates and a Colossus, ser, and I’ve still got two pennies. One letter, for you, from Ser Gideon. He gave it me himself. I nearly fell over.', next: 'letter' },
      letter: { speaker: GM, text: '“The Wall still stands. I do not know why that used to comfort me. I have started riding again, badly. Come home whenever you like, Ser Knight, and bring the line with you. G.”', next: 'court' },
      court: {
        speaker: 'narrator', text: 'Three lines. You can see where he crossed out a fourth. Later, at the Stone Court, your Forge half and the Juggernaut’s Lode half ring together so loudly that a man selling pies drops all of them.',
        choices: [
          { text: '(Talk to the Juggernaut bearer.)', to: 'hamm', when: { not: { partyHasClass: 'juggernaut' } } },
          { text: '(Grin at your Juggernaut, whose half is ringing with yours.)', to: 'coop', when: { partyHasClass: 'juggernaut' } },
        ],
      },
      hamm: { speaker: 'npc:bearer-juggernaut', mood: 'happy', text: 'Well, listen to that. Forge and Lode. I’ll tell you a secret, Ser Knight. Down the Deepworks we always called your Order “the tin-hats”. Affectionately. Mostly affectionately.', next: 'end' },
      coop: { speaker: 'narrator', text: 'Forge and Lode, ringing together. Somewhere in the crowd a miner mutters “tin-hat”, affectionately, and is elbowed.', next: 'end' },
      end: {
        speaker: 'narrator', text: 'The two halves of the Iron stone sing on, one note from the Forge and one from under the mountain.',
        choices: [{ text: '(Fold Gideon’s letter away.)', to: null, quest: true, effects: [{ setFlag: 'knight.gideon_letter', value: true }] }],
      },
    },
  },
  // ---------- featured bearers (hooks on the bearer NPCs)
  {
    id: 'dialogue:knight-featured-arcanist', name: 'Featured: Whose Fault', scope: 'party',
    entries: [
      { when: stage('quest:knight-whose-fault', 'back'), node: 'back' },
      { when: { all: [stage('quest:knight-whose-fault', 'hearth'), { not: { flag: 'knight.ottoline_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-arcanist', mood: 'angry', text: 'An Iron knight. Of course. Thirty years the Great Kiln has been failing, and every Arcanist in Kilnhold knows whose queen handed the crown to Casimir. Meet me at the cold hearth in Kilnmouth. I want to ask you why, to your face.',
        choices: [{ text: 'I’ll be there.', to: null, quest: true, effects: [{ setFlag: 'knight.ottoline_asked', value: true }] }],
      },
      back: {
        speaker: 'npc:bearer-arcanist', text: 'I came to Concordia wanting somebody to blame. You let me. That was either very brave or very Iron, and I am starting to suspect those are the same thing. When we go down to the Heart, I’ll burn whatever comes at your shield.',
        effects: [{ setFlag: 'knight.ottoline_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-knight-cold-hearth', name: 'Whose Fault: the cold hearth', scope: 'party',
    entries: [{ when: stage('quest:knight-whose-fault', 'hearth'), node: 'ask' }, { node: 'plain' }],
    nodes: {
      ask: {
        speaker: 'narrator', text: 'By the Kilnmouth copy of the Great Kiln, burning cold out of spite, the Arcanist bearer waits with folded arms. Why did your queen trust him, they ask. Why did Iron hand the crown to a man with no school at all?',
        choices: [
          { text: 'Because he couldn’t hear the stones, so she thought he couldn’t want them. It was kindness.', to: 'writ', when: { insight: 'berenika_reason' } },
          { text: 'I don’t know. But it was Iron’s mistake, and I’ll carry it.', to: 'blame' },
        ],
      },
      writ: { speaker: 'narrator', text: 'You tell them the writ, word for word. The Arcanist is quiet for a long time. Kindness, they say at last, is the one thing nobody in Kilnhold ever thought to blame. Then they ask whether you are going down to Ashmaw, and whether you would mind company.', next: null },
      blame: { speaker: 'narrator', text: 'They look at you as though you have handed them something heavy they did not expect to be given. Fine, they say. Then carry it down to Ashmaw with me, and we will see what it weighs at the bottom.', next: null },
      plain: { speaker: 'narrator', text: 'The cold hearth of Kilnmouth’s Great Kiln, burning stubbornly at nothing.', next: null },
    },
  },
  {
    id: 'dialogue:knight-featured-corsair', name: 'Featured: Pawned Steel', scope: 'party',
    entries: [
      { when: stage('quest:knight-pawned-steel', 'back'), node: 'back' },
      { when: { all: [stage('quest:knight-pawned-steel', 'salvage'), { not: { flag: 'knight.nell_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-corsair', mood: 'happy', text: 'A knight! Just what my salvage raft needs: somebody large, honest and bad at saying no. The Gilded city is drowning in gold, and Tidecourt’s gate is pawned. You see where I am going with this. Meet me at the raft.',
        choices: [{ text: 'I see exactly where you’re going with it.', to: null, quest: true, effects: [{ setFlag: 'knight.nell_asked', value: true }] }],
      },
      back: {
        speaker: 'npc:bearer-corsair', text: 'I worked it out, you know. What can’t be bought? Forgiveness, apparently. You lot have been trying for thirty years. When we go to the Heart, I’m stealing your shield-side for myself. It’s the safest place in Morvane.',
        effects: [{ setFlag: 'knight.nell_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-knight-salvage-raft', name: 'Pawned Steel: the salvage raft', scope: 'party',
    entries: [{ when: stage('quest:knight-pawned-steel', 'salvage'), node: 'raft' }, { node: 'plain' }],
    nodes: {
      raft: {
        speaker: 'narrator', text: 'A raft of empty barrels in the gold-silt below Gildport, rigged with hooks and nets. The Corsair bearer explains that the gold belongs to nobody, technically, and that technically is her favourite word. Does a knight help a pirate?',
        choices: [
          { text: '(Haul the nets.) The gold’s no use down there to anyone.', to: 'haul', effects: [{ setFlag: 'knight.pawned', value: 'hauled' }] },
          { text: 'Not this gold. The Engine made it while it wept. Leave it.', to: 'leave', effects: [{ setFlag: 'knight.pawned', value: 'left' }] },
        ],
      },
      haul: { speaker: 'narrator', text: 'Three nets of gold, heavy as wet sand. The Corsair counts it, laughs, and stops laughing. It is a lot, she says. It is nowhere near enough. Then she asks how much Ironhold paid for thirty years of being sorry, and you have no answer at all.', next: null },
      leave: { speaker: 'narrator', text: 'She looks at you, and at the gold, and lets the net sink. Fine, she says. I came here to buy back a gate. Turns out you can’t buy back everything. Who knew? Every knight in Ironhold, apparently.', next: null },
      plain: { speaker: 'narrator', text: 'An empty salvage raft, bobbing in the gold-silt.', next: null },
    },
  },
];

export default dialogues;
