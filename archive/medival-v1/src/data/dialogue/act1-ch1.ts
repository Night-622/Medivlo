/** Dialogue: Act I Ch1, quest:the-last-warden and quest:a-queen-in-winter. Owner: Claude 4. */
import type { DialogueDef } from '@/core';

const Q1 = 'quest:the-last-warden' as const;
const at = (quest: `quest:${string}`, stage: string) => ({ questStage: quest, stage });
const H = 'npc:hesta-corrow' as const, A = 'npc:queen-aldith' as const, O = 'npc:osric-harrow' as const;
const B = 'npc:bryce-aldmere' as const, C = 'npc:corin-vale' as const;
const gate = (method: string) => [{ setFlag: 'act1.gate_method', value: method }];

const dialogues: DialogueDef[] = [
  {
    id: 'dialogue:ch1-hesta-road', name: 'Hesta: The road to Cinderhold',
    entries: [
      { when: at(Q1, 'crag'), node: 'crag' },
      { when: at(Q1, 'shades'), node: 'shades' },
      { when: at(Q1, 'brazier'), node: 'brazier' },
      { node: 'road' },
    ],
    nodes: {
      road: {
        speaker: H,
        text: 'Kingsvale. Barley country, once. You could stand on the King’s Way at harvest and see gold all the way to the river. Look at it now. Snow on the stubble, and no one to cut it.',
        choices: [
          { text: 'Tell me about Cinderhold.', to: 'cinder' },
          { text: 'That cough of yours is getting worse.', to: 'cough', once: true },
          { text: 'Let’s keep moving.', to: null, tag: 'leave' },
        ],
      },
      cinder: { speaker: H, text: 'Our hall. Founded in the year 112, when the Church still thought it needed us. Nine hundred and twenty-nine years we kept the leys from that crag. It took the Wick one night to end it.', next: 'road' },
      cough: {
        speaker: H, effects: [{ unlockLore: 'lore:cinderlung' }],
        text: 'Cinderlung. Draw more ember than the body can carry and the body pays it back in ash. (She spits grey into the snow.) Every Warden coughs, child. The ones that lived long enough to.',
        next: 'road',
      },
      crag: {
        speaker: H,
        text: 'There, on the crag. My teacher brought me up here once, in the dark, to show me where we came from. We weren’t allowed so much as a pipe lit. She wept the whole way down, and I didn’t understand why. I do now.',
      },
      shades: {
        speaker: H, mood: 'sad',
        text: 'Wardens. Servants. The cook’s boy, likely. They burned here in 1041 and nobody sang them across Saela’s river, so here they still are. Put them down gently if you can. Put them down regardless.',
      },
      brazier: { speaker: H, text: 'The brazier sits on a ley, the oldest one in the Kingsvale. My hand’s too old to wake it. Yours isn’t. Go on.' },
    },
  },
  {
    id: 'dialogue:obj-cinderhold-brazier', name: 'Object: the ley-brazier of Cinderhold',
    entries: [
      { when: { flag: 'act1.cinderhold_restored' }, node: 'lit' },
      { when: at(Q1, 'brazier'), node: 'cold' },
      { node: 'dead' },
    ],
    nodes: {
      dead: { speaker: 'narrator', text: 'A great iron brazier stands cold in the ruined hall. Shapes of smoke drift between the pillars. You had better deal with them first.' },
      lit: { speaker: 'narrator', text: 'The ley-brazier of Cinderhold burns red and steady, and its warmth reaches every wall of the hall.' },
      cold: {
        speaker: 'narrator',
        text: 'The ley-brazier stands at the heart of the burned hall: a bowl of black iron as wide as a cartwheel, on three legs cast as kneeling wardens. The ash in it is cold, but the flagstones hum faintly under your boots, and the Ashmark begins to ache.',
        next: 'cold2',
      },
      cold2: {
        speaker: H, text: 'Gently, now. It’s been asleep a long while.',
        choices: [
          { text: '[Press the Ashmark into the cold ash]', to: 'kindle' },
          { text: '[Arcanist] Draw the ley up through the iron first, as a ley-scholar would.', to: 'arcanist', when: { classIs: 'class:arcanist' }, tag: 'class' },
          { text: '[Warden] Kneel as the iron wardens kneel, and offer the fire your sword-hand.', to: 'warden', when: { classIs: 'class:warden' }, tag: 'class' },
          { text: '[Devout] Speak the Lanternmass words over it: "Lux manet."', to: 'devout', when: { dialogueTag: 'devout' }, tag: 'trait' },
        ],
      },
      arcanist: {
        speaker: 'narrator',
        text: 'You do not push. You listen for the ley beneath the flagstones and coax it up into the iron, as you would draw water up a reed. It comes thin and slow, far thinner than it ought. Then the Ashmark catches it.',
        next: 'kindle',
      },
      warden: { speaker: H, mood: 'happy', text: '(Hesta makes a small sound, almost a laugh.) That’s the old oath-posture. Where in the Seven did you learn that?', next: 'kindle' },
      devout: { speaker: H, text: 'The Church’s words, in our hall. (A pause.) Well. They were ours before they were theirs.', next: 'kindle' },
      kindle: {
        speaker: 'narrator',
        text: 'You lay your palm in the ash. Nothing; then heat, rising from very far down, slow as a tide, into the scar and up your arm. The brazier answers with a sound like a bell struck under water. Red fire climbs the iron, and the hall goes away.',
        next: 'v1',
      },
      v1: {
        speaker: 'narrator',
        text: 'Lanternmass, 1041. The hall is whole and bright with candles, one burning before every warden’s chair, more than a hundred of them. Snow beyond the windows. Someone is hammering at the gate, and it is not a guest.',
        next: 'v2',
      },
      v2: {
        speaker: 'narrator',
        text: 'Soldiers in Lanternate white come in with the snow, and behind them walk brothers of the Wick carrying long iron scissors. A grey-haired woman with an ember brooch, the Warden-Mother, stands before the brazier and does not draw her sword.',
        next: 'v3',
      },
      v3: {
        speaker: 'narrator',
        text: '"By order of the Hierophant, this order is heretic and dissolved." One by one the brothers walk the rows of chairs and snip the candles out, and for each candle a warden is led into the yard. The smoke goes up white. Then it goes up black.',
        choices: [
          { text: '[Will 15] Hold on to the vision, through the heat.', to: 'v4', once: true, check: { stat: 'will', dc: 15, failTo: 'wake' } },
          { text: '[Let go]', to: 'wake' },
        ],
      },
      v4: {
        speaker: 'narrator', effects: [{ setFlag: 'act1.purge_vision_full', value: true }],
        text: 'In the vestry behind the hall a young scribe is feeding papers to a lamp: tables of figures, ley-draws year on year, each column shorter than the last. A Wick brother drags her away and gathers what has not burned into a satchel. "Sealed for Solenne," he says. "No one reads these. No one."',
        next: 'wake',
      },
      wake: {
        speaker: 'narrator',
        effects: [
          { setFlag: 'act1.cinderhold_restored', value: true },
          { unlockLore: 'lore:purge-of-the-emberwardens' },
          { unlockLore: 'lore:cinderhold' },
        ],
        text: 'You are on your knees. The brazier is burning, red and steady, and for the first time in a hundred and forty-six years its warmth reaches the walls. Somewhere up in the broken roof a bird begins to sing.',
        next: 'hesta',
      },
      hesta: { speaker: H, mood: 'sad', text: '(She stands a long while with her hands held to the fire.) …There. Now it’s a hall again, and not a grave. Come and sit by me. There are things I should have told you on the shore.' },
    },
  },
  {
    id: 'dialogue:hesta-embers', name: 'Hesta: The Seven Embers',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: H, text: 'Sit. No, closer. You’ve earned the warm side.', next: 'embers' },
      embers: {
        speaker: H, effects: [{ unlockLore: 'lore:the-seven-embers' }],
        text: 'The Brand was a coal of the Heartfire, Orr’s own heart, carried up out of the deep by Saint Solenne. When Ysolde drowned it, it broke into seven, and they fell where they fell. One in Wennamere. That one’s in you, which I still don’t like. Six more.',
        next: 'hub',
      },
      hub: {
        speaker: H, text: '(She feeds a splinter of old beam to the brazier.) Ask, then. I’ve a cough, not all night.',
        choices: [
          { text: 'Where are the other six?', to: 'where', once: true },
          { text: 'Tell me about Ysolde.', to: 'ysolde', once: true },
          { text: 'Why did the Church really burn your order?', to: 'purge', once: true },
          { text: '[Warden] "Will you make me a Warden, then?"', to: 'oath', when: { classIs: 'class:warden' }, tag: 'class', once: true },
          { text: 'What do we do about the Church now?', to: 'church' },
        ],
      },
      where: {
        speaker: H,
        text: 'One fell in Greywater, the night Varn drowned, and the Choir sits on it like a hen on an egg. One went into the sea off Saltreach, if the fishermen can be believed. The rest I feel the way you feel weather in a bad knee: north, south, under the mountains. She’s looking too.',
        next: 'hub',
      },
      ysolde: {
        speaker: H, mood: 'sad',
        text: 'She came to me at sixteen with Radiance in her hands she couldn’t master. I taught her what the Church wouldn’t: that the fire comes from somewhere, and the somewhere is dying. I thought it would make her careful. It made her merciful. Seven Sparks help us, that’s worse.',
        next: 'hub',
      },
      oath: { speaker: H, text: 'Warden. Hm. Shield-sworn of the Marches, that means, a militia word. Ours meant something else. (She looks at you over the fire.) We’ll see if you earn the rest of it.', next: 'hub' },
      purge: { speaker: H, text: 'Because we were armed, and we weren’t theirs. That’s what the histories say, and it’s true as far as it goes. It doesn’t go very far.', next: 'purge2' },
      purge2: {
        speaker: H, effects: [{ unlockLore: 'lore:the-emberwardens', section: 'purge-truth' }],
        text: 'In the years before 1041 the Wardens measured the ley-draws at every hall from here to the Ironspine, and sent the figures to Solenne. Every year the draws were weaker. The leys were cooling. We begged the Hierophant to tell the world. He sent soldiers instead.',
        choices: [
          { text: '"I saw it. A Wick brother took the reports. ‘Sealed for Solenne.’"', to: 'saw', when: { flag: 'act1.purge_vision_full' } },
          { text: '[Intellect 15] "Two hundred years of cooling. That’s why every hedge-mage complains of weak draws."', to: 'scholar', tag: 'lore', check: { stat: 'intellect', dc: 15, failTo: 'hub' } },
          { text: '[Scholar] "Then the Church has known since 1041. Everything since has been a lie of omission."', to: 'scholar', when: { dialogueTag: 'scholar' }, tag: 'trait' },
          { text: 'Go on.', to: 'hub' },
        ],
      },
      saw: {
        speaker: H, effects: [{ setFlag: 'act1.reports_known', value: true }, { loyalty: H, delta: 5 }],
        text: '(She looks at you sharply.) The brazier showed you that? …Then they may be in Solenne still, under the cathedral, if no one has burned them. Remember it. One day it will matter more than any sword.',
        next: 'hub',
      },
      scholar: {
        speaker: H,
        text: 'Clever. Yes. Every apprentice in the Haldmarch thinks they’re failing their lessons. They aren’t. The fire is. And the Church tells them it’s sin, and they believe it, because who else would they believe?',
        next: 'hub',
      },
      church: {
        speaker: H,
        text: 'That’s the question. The Wick keeps a table on every gate in Haldren and lists of the marked. Solenne wants the Embers back to make a new Brand, and they’d put you in a lantern to do it. And yet they’re the only power in the south with an army. So. What would you do?',
        choices: [
          { text: '"Go to the Church and tell them everything. They have to know what Ysolde means to do."', to: 'trust', effects: [{ setFlag: 'act1.church_view', value: 'trust' }, { loyalty: H, delta: -5 }] },
          { text: '"They buried the truth once. They’ll bury us with it."', to: 'defy', effects: [{ setFlag: 'act1.church_view', value: 'defy' }, { loyalty: H, delta: 5 }] },
          { text: '[Devout] "The Lights aren’t the men who carry them. There are good priests. I’ve known one."', to: 'doubt', when: { dialogueTag: 'devout' }, tag: 'trait', effects: [{ setFlag: 'act1.church_view', value: 'doubt' }] },
          { text: '"Some of them are decent. I’ll judge them one at a time."', to: 'doubt', effects: [{ setFlag: 'act1.church_view', value: 'doubt' }] },
          { text: '[Will 15] "Neither. We use them. Let Solenne think we’re theirs until we don’t need them."', to: 'use', once: true, tag: 'persuade', check: { stat: 'will', dc: 15, failTo: 'use-fail' } },
        ],
      },
      trust: { speaker: H, mood: 'angry', text: '…Spoken like someone who has never been in a Wick cellar. Well, it’s your hand. But you’ll tell them nothing of Cinderhold, or I’ll leave you to them myself.', next: 'haldren' },
      defy: { speaker: H, text: 'Good. Bitter, but good. Bitterness keeps. Hope goes off in the cold.', next: 'haldren' },
      doubt: { speaker: H, text: 'There are good ones. I’ve buried two. Keep your faith, then, but keep it with your eyes open.', next: 'haldren' },
      'use-fail': { speaker: H, text: 'You haven’t the face for it, child. They’d see through you before the second cup of wine. Choose something you can actually do.', next: 'church' },
      use: {
        speaker: H, mood: 'happy', effects: [{ setFlag: 'act1.church_view', value: 'use' }, { loyalty: H, delta: 3 }],
        text: 'Hah. Now there’s a Warden’s answer. Dangerous, mind. The Wick has been playing that game for eleven hundred years, and it’s better at it than you.',
        next: 'haldren',
      },
      haldren: {
        speaker: H,
        text: 'Whatever you choose, the next road’s the same. Haldren. The Queen is fifteen and frightened, her Lord Protector is neither, and Greywater is emptying onto their doorstep. If we’re to take the Fen Ember back we need the Crown’s soldiers. Go to court. Keep your glove on.',
        next: 'stay',
      },
      stay: { speaker: H, text: 'I’ll stay and keep this fire in. It’s been out long enough.' },
    },
  },
  {
    id: 'dialogue:bryce-gate', name: 'Bryce: The Wick at the gate',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'narrator',
        text: 'Haldren’s north gate is choked with carts and people: refugees from Greywater, carrying their lives on their backs, waiting in the snow. Under a Lanternate awning a clerk of the Wick sits at a trestle table and inspects hands. Every hand. A knight in a dented Crown surcoat watches him as if he would like to kick the table over.',
        next: 'bryce',
      },
      bryce: {
        speaker: B,
        text: 'Next. Name, village, business. Both hands on the table, gloves off. (He jerks his chin at the clerk.) Not my rule. His.',
        choices: [
          { text: 'Why does the Church keep a table on the Queen’s gate?', to: 'why', once: true },
          { text: '(Keep your glove on.)', to: 'options' },
        ],
      },
      why: {
        speaker: B, mood: 'angry',
        text: 'Because the Lord Protector signed a paper. They’re looking for the marked: scars, burns, black in the eyes. Three went south to Valcastre this week in a cart. One was a girl who’d burned her hand on a skillet.',
        next: 'options',
      },
      options: {
        speaker: B, text: 'Well? Gloves.',
        choices: [
          { text: '[Hale’s report] "Have your clerk read his list. The margin, under Brindlecross."', to: 'hale', when: { flag: 'npc.garrick-hale.let_go' } },
          { text: '[Show the forged Wick-licence]', to: 'licence', when: { flag: 'prologue.forged_licence' }, tag: 'deceive' },
          { text: '[Will 15] "Frostbite. Two fingers gone on the moor road. I’ll not show them to a clerk."', to: 'bluff', once: true, tag: 'deceive', check: { stat: 'will', dc: 15, failTo: 'bluff-fail' } },
          { text: '[Noble-born] "Do you know whose blood you are asking to strip in the snow?"', to: 'noble', when: { dialogueTag: 'noble-born' }, tag: 'trait' },
          { text: '[Shade] (Make the Quiet Hand’s sign against your coat: two fingers folded, thumb across.)', to: 'shade', when: { classIs: 'class:shade' }, tag: 'class' },
          { text: '"No. The glove stays on."', to: 'waved' },
        ],
      },
      hale: {
        speaker: 'narrator', effects: gate('hale'),
        text: 'The clerk runs a finger down his list. Brindlecross. A description that might be you, down to the hand. Across it, in a heavy soldier’s script: "Lost in the snow at Wennamere. Presumed dead. G. Hale, Inq." The clerk looks at you, then at the signature, and decides he would rather not argue with an Inquisitor.',
        next: 'through',
      },
      licence: {
        speaker: 'narrator', effects: [...gate('licence'), { setFlag: 'npc.prior-benedek.licence_questioned', value: true }],
        text: 'The clerk reads the licence twice. "Signed by Prior Benedek of Haldren," he says slowly. "The Prior is at the cathedral. He can confirm it in person." He waves you on all the same, and writes something in his book.',
        next: 'through',
      },
      bluff: {
        speaker: B, effects: gate('bluff'),
        text: '(Bryce looks at your glove, then at your face, and something like a smile moves under his beard.) Frostbite. Aye, it’s bad on the moor road. Clerk, you’ll not make a cripple undress in the snow. Through.',
        next: 'through',
      },
      'bluff-fail': { speaker: 'narrator', effects: [{ setFlag: 'act1.wick_noticed', value: true }], text: 'The clerk squints. "Frostbite doesn’t keep a glove that warm, friend. Off with it." He reaches for your wrist.', next: 'waved' },
      noble: {
        speaker: B, effects: gate('noble'),
        text: '(The clerk goes pale. Bryce snorts.) There’s more blue blood than barley in this queue, the way folk tell it. But he believes you, and that’s his lookout. Through.',
        next: 'through',
      },
      shade: {
        speaker: 'narrator', effects: [...gate('shade'), { setFlag: 'npc.sable.heard', value: true }],
        text: 'A boy leaning on the gatepost, cracking chestnuts, sees your hand move. He drifts to the table and knocks the clerk’s inkpot into his lap. In the swearing and blotting that follows you are somehow already through the gate.',
        next: 'through',
      },
      waved: {
        speaker: B, effects: [...gate('waved'), { setFlag: 'npc.bryce-aldmere.favour', value: true }],
        text: '(The clerk opens his mouth. Bryce leans on the table until he shuts it.) This one’s with the Crown. I don’t take orders from Solenne on my own gate. (Quieter, to you.) Through you go, and keep that hand in your pocket.',
        next: 'through',
      },
      through: {
        speaker: B, effects: [{ setFlag: 'act1.gate_passed', value: true }, { unlockLore: 'lore:haldren' }],
        text: 'Market’s straight on, Keep’s up the hill, cathedral’s the big ugly one with the gold. And mind the market. The Wick’s been busy there this morning.',
      },
    },
  },
  {
    id: 'dialogue:corin-arrest', name: 'Corin: Arrest in the market',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'narrator',
        text: 'In the middle of Haldren market, where turnips sell at a silver the sack, two soldiers of the Wick have a thin young man pinned against the well-head. His tray of charms is everywhere, little knots of hair and red thread and ember-glass trodden into the slush. A crowd watches and does nothing.',
        next: 'sergeant',
      },
      sergeant: { speaker: 'narrator', text: '"Corin Vale," the sergeant reads from a slate, "hedge-mage, of Haldren. Selling ember-charms without the Wick’s licence. You’ll go south to Valcastre to be examined."', next: 'corin' },
      corin: {
        speaker: C, mood: 'afraid',
        text: 'They’re hearth-knots! A bit of warmth in a bit of string, that’s all. My gran sold them at this very well and nobody burned her for it. Please. I’ve a mother.',
        choices: [
          { text: '[Will 15] "He sells string, sergeant. Will you tell Valcastre you filled a cart-seat with string?"', to: 'freed', once: true, tag: 'persuade', check: { stat: 'will', dc: 15, failTo: 'persuade-fail' } },
          { text: '[Intellect 15] "Under the Charter, a Haldish subject charged in the Haldmarch is heard by his Prior first. Not carted south."', to: 'charter', once: true, tag: 'lore', check: { stat: 'intellect', dc: 15, failTo: 'charter-fail' } },
          { text: '[Oathbound] "Brother, I am Lightsworn. I’ll take this one into my own custody."', to: 'oath', when: { classIs: 'class:oathbound' }, tag: 'class' },
          { text: '"Is there no one to speak for him? Send for the Prior."', to: 'prior' },
          { text: '(Draw steel.) "Let him go."', to: 'fight', tag: 'aggressive' },
          { text: '(Walk on. It isn’t your affair.)', to: 'ignored', tag: 'leave' },
        ],
      },
      'persuade-fail': { speaker: 'narrator', text: '"String or no string, it’s ember, and ember wants a licence. Stand aside."', next: 'corin' },
      'charter-fail': { speaker: 'narrator', text: 'The sergeant laughs. "Quoting law at the Wick? Which clause, then? No? Stand aside."', next: 'corin' },
      freed: {
        speaker: 'narrator',
        text: 'The sergeant looks at the crowd, which has grown, and at the turnip-sellers, who are listening, and decides Valcastre need not hear about string. "Get out of my sight, Vale. And no more charms."',
        next: 'free',
      },
      charter: {
        speaker: 'narrator', effects: [{ unlockLore: 'lore:charter-of-haldren' }],
        text: '"The Charter," the sergeant says, as though it were a curse. But the crowd has heard you, and half of Haldren can recite the clauses of 870 in its sleep. A murmur goes round the well. He lets Corin go.',
        next: 'free',
      },
      oath: { speaker: 'narrator', text: 'The sergeant hesitates, then bows his head to the Lightsworn sign. "Brother. On your conscience, then." He lets Corin go into your keeping.', next: 'free' },
      free: {
        speaker: C, mood: 'happy', effects: [{ setFlag: 'act1.market_mage', value: 'freed' }, { reputation: 'faction:crown-of-haldmarch', delta: 3 }],
        text: 'Seven keep you. I mean it. …Listen. The leys under Haldren are weaker every month. Gran’s knots held a whole night’s warmth. Mine barely last till supper. It isn’t me, and it isn’t sin, whatever the priests say. Something down there is going out.',
      },
      prior: { speaker: 'narrator', text: 'A boy is sent running. Presently Prior Benedek arrives from the cathedral steps, out of breath, his white-and-gold vestments hitched up out of the slush.', next: 'benedek' },
      benedek: {
        speaker: 'npc:prior-benedek', mood: 'afraid',
        text: 'What, what is this? Sergeant, in the open market, before the whole of— Ithren’s mercy. (He peers at the trodden charms.) Hearth-knots. My own housekeeper hangs these over the kitchen fire.',
        next: 'benedek2',
      },
      benedek2: {
        speaker: 'npc:prior-benedek',
        text: 'Under the Charter, which I need hardly remind the Order binds it as it binds us all, a minor working unlicensed is a matter for a fine, not for Valcastre. Two crowns, which I shall pay from the poor-box, and which young Vale shall repay by sweeping my nave until Lanternmass. There. Settled. Settled.',
        next: 'fined',
      },
      fined: {
        speaker: 'narrator', effects: [{ setFlag: 'act1.market_mage', value: 'fined' }, { setFlag: 'npc.prior-benedek.met', value: true }],
        text: 'The sergeant does not like it, but a Prior is a Prior. Corin goes free with a fine and a broom. As the soldiers leave, Benedek dabs his brow and murmurs, to no one, "If the Lord-Inquisitor hears of this I am a dead man." Then he sees you, and smiles a great deal too brightly.',
      },
      fight: {
        speaker: 'narrator', effects: [{ setFlag: 'act1.market_mage', value: 'fought' }, { reputation: 'faction:lanternate', delta: -15 }],
        text: 'Steel comes out. The crowd scatters, shrieking. Corin Vale bolts between the stalls like a hare, and the two soldiers of the Wick turn their backs on him to face you.',
      },
      ignored: {
        speaker: 'narrator', effects: [{ setFlag: 'act1.market_mage', value: 'ignored' }],
        text: 'You walk on. Behind you Corin Vale is still pleading as they lift him into the cart. Nobody in the crowd will meet your eye, and you find you cannot meet theirs.',
      },
    },
  },
  {
    id: 'dialogue:aldith-audience', name: 'Aldith: The audience',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'narrator',
        text: 'The throne room of Haldren Keep is cold enough to see your breath. Half the braziers stand unlit to save fuel, and the tapestries of Edric Barrowborn’s wars hang dark with damp. On the Charter Throne, which is too large for her, sits a girl of fifteen in mourning grey and a circlet of plain iron.',
        next: 'aldith',
      },
      aldith: {
        speaker: A,
        text: 'You are the one the Emberwarden sent. We have had her letter. It was very short, and very rude, and it asked us to receive you. So. We receive you.',
        choices: [
          { text: '(Bow.) "Majesty."', to: 'state' },
          { text: '[Noble-born] (Make the old court obeisance, knee and hand, as it was done before the Charter.)', to: 'noble', when: { dialogueTag: 'noble-born' }, tag: 'trait' },
          { text: '"You’re younger than I expected."', to: 'young' },
        ],
      },
      noble: { speaker: A, effects: [{ setFlag: 'npc.queen-aldith.trust', value: true }], text: '…That obeisance has not been made in this hall since our father’s crowning. Someone taught you well. Rise.', next: 'state' },
      young: { speaker: A, mood: 'angry', text: 'We are fifteen. Edric Barrowborn was sixteen when he sealed the Charter. You may find that in this hall we are exactly as old as we need to be.', next: 'state' },
      state: {
        speaker: A,
        text: 'Let us be plain, since you walked through our city and saw it. Haldren is starving. The granaries were meant to last until spring, and spring has not come. Every week another thousand come up the Varn road from Greywater with nothing, and we have nowhere to put them but the snow beneath our walls.',
        next: 'choir',
      },
      choir: {
        speaker: A, mood: 'afraid', effects: [{ unlockLore: 'lore:greywater-marsh' }],
        text: 'Behind them comes the Drowned Choir. They hold Varn and the causeway. Lord Aldwin opened his floodgates to them on the night the stars fell, and now they sing in his drowned streets, and every village in the fen pays them tithe to be left dry.',
        next: 'ask',
      },
      ask: {
        speaker: A,
        text: 'Our council says Varn cannot be retaken. Too much water, too few soldiers, too many dead who will not stay down. The Emberwarden asks us to believe otherwise. So we ask you. Can it be done?',
        choices: [
          { text: '"Yes. With allies: the Thornwise, the Orrun, perhaps even the dead, if they can be made to listen."', to: 'allies' },
          { text: '"I don’t know. But there is an Ember in that water, and I can feel it from here."', to: 'ember' },
          { text: '[Take off the glove]', to: 'mark' },
          { text: '[Will 15] "Your council is afraid, Majesty. You needn’t be."', to: 'brave', once: true, tag: 'persuade', check: { stat: 'will', dc: 15, failTo: 'brave-fail' } },
        ],
      },
      ember: { speaker: A, text: 'An Ember. A piece of the Brand? (She leans forward, and for a moment looks her age.) Then that is why the Choir will not leave.', next: 'allies' },
      mark: {
        speaker: 'narrator', effects: [{ setFlag: 'act1.aldith_saw_mark', value: true }],
        text: 'You pull off the glove. In the cold hall the scar glows like a coal under ash, and the nearest brazier, unlit, crackles into flame by itself. A guard takes a step back. The Queen does not.',
        next: 'mark2',
      },
      mark2: {
        speaker: A, mood: 'afraid',
        text: '…So it is true. The Wick keeps a table on our gate for people like you, and our Lord Protector let them put it there. We shall not mention this to him. Or to anyone. Put your glove back on.',
        next: 'allies',
      },
      brave: {
        speaker: A, mood: 'sad', effects: [{ setFlag: 'npc.queen-aldith.trust', value: true }],
        text: '…No one has said that to us since the funeral. (Her hand tightens on the arm of the throne.) We are afraid. Queens may be afraid, we think, so long as they do it in private. Thank you.',
        next: 'allies',
      },
      'brave-fail': { speaker: A, mood: 'angry', text: 'Do not presume to manage us. Our Lord Protector does quite enough of that.', next: 'allies' },
      allies: {
        speaker: A,
        text: 'Then bring us proof, and bring us allies. The Thornwise have shut their wood. The Orrun have shut their gate. The Grey Monks of the Witherdowns speak to no one living. Open any of those doors, and we will believe Varn can be taken, and we will give you soldiers to take it. That is our word, and our word is the Crown’s.',
        choices: [
          { text: '(Kneel.) "Then you have my sword, Majesty."', to: 'sworn', effects: [{ setFlag: 'act1.sworn_to_aldith', value: true }, { reputation: 'faction:crown-of-haldmarch', delta: 5 }] },
          { text: '"I’ll do it for Haldren. Not for a crown."', to: 'plain' },
        ],
      },
      sworn: { speaker: A, mood: 'happy', text: 'We accept it. (Very quietly, not as a queen.) Thank you.', next: 'harrow' },
      plain: { speaker: A, text: 'That is the right answer, though our tutors would tell you otherwise.', next: 'harrow' },
      harrow: {
        speaker: 'narrator',
        text: 'The doors at the far end open without a herald. A tall man in a black-furred cloak walks in with snow on his shoulders, and the guards straighten as they did not for their Queen.',
        next: 'harrow2',
      },
      harrow2: {
        speaker: O,
        text: 'Forgive me, Majesty. I was told we had a guest, and that I had not been told. (He bows to her exactly as deeply as courtesy requires.) Osric Harrow, Lord Protector. I should very much like a word with our guest, when you are done.',
        next: 'end',
      },
      end: { speaker: A, text: 'We are done. (She is not, quite. She looks at you a moment longer.) Go with the Lord Protector. Remember what we said.' },
    },
  },
];

export default dialogues;
