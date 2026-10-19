/**
 * Dialogue: companion quests part 1b (docs/lore/13-companions.md §1): quest:the-snuffed-candles (Hesta).
 * The undercroft heist under the Cathedral of the Brand. Owner: Claude 4.
 * The decision (act2.warden_archive) is reopenable from Hesta’s route and from any of the three chests.
 */
import type { DialogueDef, DialogueNode, NarrativeCondition } from '@/core';

const QH = 'quest:the-snuffed-candles' as const;
const at = (quest: `quest:${string}`, stage: string) => ({ questStage: quest, stage });
const f = (flag: string) => ({ flag });
const eq = (flag: string, value: string) => ({ flag, op: '==' as const, value });
const H = 'npc:hesta-corrow' as const, AU = 'npc:hierophant-aurelian' as const, V = 'npc:castor-vellane' as const, Y = 'npc:ysolde' as const;
const ARCHIVE = 'act2.warden_archive', OPEN = 'act2.undercroft_open';
const archive = (value: 'cinderhold' | 'published' | 'burned') => ({ setFlag: ARCHIVE, value });
const opened = (route: 'key' | 'quiet' | 'writ' | 'forced') => ({ setFlag: OPEN, value: route });

const following: NarrativeCondition = f('companion.hesta-corrow.following');
const alarm: NarrativeCondition = f('act2.undercroft_alarm');

/**
 * The decision, shared by dialogue:candles-choice (opened when the stage begins, and Hesta’s route) and the
 * three chests, so it can be reopened if the scene is closed early. Enters at 'c-start'.
 */
const choiceNodes: Record<string, DialogueNode> = {
  'c-start': {
    speaker: 'narrator',
    text: 'A voice at the top of the stair, pleasant and clear and in no hurry at all: “Brother Archivist. Who has gone down?” Then boots on the stone, unhurried, coming down.',
    choices: [
      { text: '[Listen]', to: 'c-alarm', when: alarm },
      { text: '[Listen]', to: 'c-hesta', when: { not: alarm } },
    ],
  },
  'c-alarm': {
    speaker: 'narrator',
    text: 'He is already here. Castor Vellane stands on the bottom step with a lantern in one hand and four Wick soldiers on the stair behind him, and he does not come any further. “Please,” he says. “Go on. I should like to see what you decide. It will tell me a great deal about you both.”',
    next: 'c-hesta',
  },
  'c-hesta': {
    speaker: H,
    text: 'Three choices and about a minute. (She coughs into her sleeve, hard.) I want them home. They were ours; they’re all that’s left of us. But I’m old and I’m biased and I’m wanted for heresy in four provinces, so you choose. You’re the one who’ll be carrying it after I’m gone.',
    choices: [
      { text: '“They go home to Cinderhold, where they belong.”', to: 'c-home', effects: [archive('cinderhold'), { loyalty: H, delta: 10 }] },
      { text: '“Give them to the Hierophant. Let him print every page.”', to: 'c-print', effects: [archive('published'), { loyalty: H, delta: 5 }] },
      { text: '“Burn them. Nobody gets to use these. Not Vellane, not anyone.”', to: 'c-burn', effects: [archive('burned'), { loyalty: H, delta: -10 }] },
    ],
  },
  'c-home': {
    speaker: H, mood: 'happy',
    text: 'Home. (Fierce, and very nearly glad.) Lids on, then. There’s a pilgrims’ cart at the north postern with a blanket over it and a great many turnips, and the carter owes me his life twice over. Move.',
  },
  'c-print': {
    speaker: H,
    text: '(She stares at you.) Print them. Every column. And every slip of paper in that third chest, I suppose, with Ysolde’s hand on it, and my name in hers. (A breath, and another.) …Good. Let them see. Let them see the whole lot of us, the Church and the Wardens both, sitting on the truth like hens on a cold egg. Up the stair, then. To the old man.',
  },
  'c-burn': {
    speaker: H, mood: 'angry',
    text: 'Burn. (Her voice goes high and cracks.) These are the last of my order. Nine hundred years of keeping, and you want them lit like kindling. (Then, lower, worse:) …And you’re right. If Vellane has these, he has proof the fire’s dying, and a reason for every cage he means to build. Damn you. Damn you for being right.',
    next: 'c-burn2',
  },
  'c-burn2': {
    speaker: 'narrator',
    text: 'She takes one folded slip of paper out of the third chest and puts it inside her coat, against her chest. “Not that one,” she says. “The rest. Go on. Use your hand. I can’t.” The Ashmark wakes, and the old calfskin catches, and nine centuries of careful figures curl and go up the stairwell as sparks.',
  },
  'c-done': { speaker: H, text: 'It’s decided. Stop dithering and move.' },
};

const chestEntries = () => [
  { when: f(ARCHIVE), node: 'c-done' },
  { when: at(QH, 'choice'), node: 'c-start' },
  { when: at(QH, 'archive'), node: 'start' },
  { node: 'idle' },
];

const dialogues: DialogueDef[] = [
  // ---------------------------------------------------------------- the word
  {
    id: 'dialogue:candles-word', name: 'Hesta: The chests under Solenne',
    entries: [
      { when: f('companion.hesta-corrow.candles_word'), node: 'again' },
      { when: following, node: 'here' },
      { node: 'letter' },
    ],
    nodes: {
      again: { speaker: H, text: 'The pilgrims’ camp, outside the walls. I’ll be the one in the hood, coughing. Don’t wave.' },
      letter: {
        speaker: 'narrator', effects: [{ setFlag: 'companion.hesta-corrow.candles_word', value: true }],
        text: 'A pilgrim’s boy presses a letter into your hand and runs. The paper smells of woodsmoke. The hand is cramped and northern, and burned through at one corner where the writer coughed on it.',
        next: 'letter2',
      },
      letter2: {
        speaker: H,
        text: '“I went back to the brazier. Watched the Night of Snuffed Candles again, being a glutton for punishment. Wick soldiers carrying our chests down the crag under the Hierophant’s red wax. Not to the pyres. To a wagon. To Solenne. They’re under that cathedral, and I’m going to have them back, and you’re going to help, because I am seventy and I cough. I’m at the pilgrims’ camp outside the walls, in a hood. Do not laugh. H.C.”',
        next: 'letter3',
      },
      letter3: { speaker: 'narrator', text: 'Underneath, underlined twice: “Vellane wants them too. Be quick.”' },
      here: {
        speaker: H, effects: [{ setFlag: 'companion.hesta-corrow.candles_word', value: true }],
        text: 'Stop a moment. (She has stopped walking. She is looking at the ground, at the paving of Solenne, as if she could see through it.) I dreamt of the brazier last night. The Night of Snuffed Candles, again. Wick soldiers carrying our chests down the crag, under the Hierophant’s wax. Not to the pyres. Here. They’re under our feet, somewhere under that cathedral.',
        choices: [
          { text: '“The Hierophant told me. Chests under the cathedral. He still has the key.”', to: 'key', when: f('act2.aurelian_reports_admitted') },
          { text: '“Then let’s get them.”', to: 'plan' },
        ],
      },
      key: { speaker: H, mood: 'angry', text: 'He has the key. Of course he has the key. He’s had it in his pocket while we froze. (She breathes out through her nose.) Well. Old men can be asked for things. I’ve been an old woman long enough to know how.', next: 'plan' },
      plan: { speaker: H, text: 'Not today. I want to see the pilgrims’ camp first, and get a hood, and a cough nobody will remember. I’ve got the cough already. Meet me there.' },
    },
  },
  {
    id: 'dialogue:candles-pilgrim', name: 'Hesta: Among the pilgrims',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'narrator', effects: [{ companion: H, following: true }],
        text: 'Among the pilgrims kneeling in the snow outside the walls of Solenne there is a very tall old woman in a borrowed grey hood, with her burned hands hidden in her sleeves. She is not praying. She is counting the Wick sentries on the gate.',
        next: 'hood',
      },
      hood: {
        speaker: H,
        text: 'Don’t. Not a word. (She tugs the hood lower.) Eleven on the gate, four at the cathedral doors, and the Lord-Inquisitor’s own men at every stair. The verger at the north door says Vellane has asked for the undercroft key three times this month. He’ll have it by Lanternmass. So we go in sooner.',
        choices: [
          { text: '[Listen]', to: 'pledged', when: eq('act2.church_stance', 'pledged') },
          { text: '[Listen]', to: 'defiant', when: eq('act2.church_stance', 'defiant') },
          { text: '[Listen]', to: 'neutral', when: { all: [{ not: eq('act2.church_stance', 'pledged') }, { not: eq('act2.church_stance', 'defiant') }] } },
        ],
      },
      pledged: { speaker: H, text: 'You signed his paper. I know. I’m not going to shout about it; I’m too tired and there are soldiers. Make the paper earn its keep, that’s all. A writ opens doors a sword can’t.', next: 'ysolde' },
      defiant: { speaker: H, mood: 'happy', text: 'You told Vellane to his face where he could put his demands, I hear. Good. That means he’s watching you, so nobody will be watching me. An old woman with a cough. Nobody looks at old women. It’s the only advantage we get.', next: 'ysolde' },
      neutral: { speaker: H, text: 'You turned Vellane down politely, I hear. He’ll have written that down. He writes everything down. That’s what I’m counting on: a man who trusts his paper doesn’t check the cellar.', next: 'ysolde' },
      ysolde: {
        speaker: H, mood: 'sad',
        text: 'One more thing. (She does not look at you.) Ysolde was Keeper of the Brand. She had the run of that cathedral, cellars and all, for three years. If those chests are where I think they are, she’ll have found them. She always did find things. That was what I liked best about her, and what I was most afraid of.',
        choices: [
          { text: '[Ysolde’s daybooks] “She measured the Brand every Lanternmass. Your way.”', to: 'journals', when: f('act2.journals_read'), once: true },
          { text: '“You promised me at Varn you’d do nothing foolish.”', to: 'promise', when: f('npc.hesta-corrow.promised'), once: true },
          { text: '“Let’s go.”', to: 'go' },
        ],
      },
      journals: {
        speaker: H, mood: 'sad',
        text: '(A long silence.) My way. Of course my way. I taught her that on the kitchen table at Cinderhold with a borrowed thermometer and a poker, when she was sixteen and thought I hung the moon. (She coughs.) She never was any good at leaving a thing alone. I taught her that too.',
        next: 'ysolde',
      },
      promise: { speaker: H, mood: 'happy', text: 'I did. And this isn’t foolish. Foolish would be letting Castor Vellane read my order’s books before I do. This is merely dangerous, illegal and very probably fatal. Entirely different.', next: 'ysolde' },
      go: { speaker: H, text: 'Into the cathedral, then. Keep your glove on. And if anyone asks, I’m your grandmother and I’m deaf.' },
    },
  },
  // ---------------------------------------------------------------- the key (Aurelian’s route at stage `door`)
  {
    id: 'dialogue:candles-aurelian', name: 'Aurelian: The undercroft key',
    entries: [
      { when: f('companion.hesta-corrow.aurelian_key'), node: 'given' },
      { when: following, node: 'hesta' },
      { node: 'start' },
    ],
    nodes: {
      given: { speaker: AU, mood: 'afraid', text: 'Go, go. Compline. Before I think better of it. I am very good at thinking better of things.' },
      start: {
        speaker: AU,
        text: 'You again. (He glances at the doors, at the clerks.) Castor said you might come back to see me. He says it the way other men say it might rain.',
        choices: [
          { text: '“The chests beneath the cathedral, Holiness. I need your key.”', to: 'ask-adm', when: f('act2.aurelian_reports_admitted') },
          { text: '“There are Warden chests under your cathedral. I think you have the key.”', to: 'ask', when: { not: f('act2.aurelian_reports_admitted') } },
          { text: '“Nothing, Holiness. Forgive me.”', to: null, tag: 'leave' },
        ],
      },
      ask: {
        speaker: AU, mood: 'afraid',
        text: '(He goes very white.) Who told you that? No, do not say. I… there are chests. Sealed. I have not… (His hand goes to his breast, where something hangs under the robe, and stops.)',
        choices: [
          { text: '“You told me once you were frightened. Be frightened, and give it to me anyway.”', to: 'give', when: f('npc.hierophant-aurelian.comforted') },
          { text: '[Will 15] “You’ve carried that key long enough, Holiness. Put it down.”', to: 'give', tag: 'persuade', once: true, check: { stat: 'will', dc: 15, failTo: 'refuse' } },
          { text: '[Devout] “Saela keeps the dead, Holiness. Let them be read.”', to: 'give', tag: 'trait', when: { dialogueTag: 'devout' } },
          { text: '“Forgive me. I’ll find another way.”', to: 'refuse' },
        ],
      },
      'ask-adm': {
        speaker: AU,
        text: 'I told you I had never been brave enough to give it to anyone. (He draws a cord from inside his robe. On it hangs an iron key, black with age.) I have been carrying it against my chest for a year. It is lighter than it feels.',
        next: 'give',
      },
      hesta: {
        speaker: 'narrator',
        text: 'The tall old pilgrim at your shoulder pushes back her hood. Two of the clerks look up. The Hierophant looks at her burned hands, and then at her face, and then he sits down, quite suddenly, as if his knees had made the decision for him.',
        next: 'hesta2',
      },
      hesta2: { speaker: H, text: 'Hello, Aurelian. You’ve got old.', next: 'hesta3' },
      hesta3: { speaker: AU, mood: 'afraid', text: 'Warden Corrow. (Faintly.) They told me you burned at Valcastre. I said a mass for you.', next: 'hesta4' },
      hesta4: { speaker: H, text: 'So I heard. Was it a good one?', next: 'hesta5' },
      hesta5: { speaker: AU, mood: 'sad', text: 'Not very. I did not know you.', next: 'hesta6' },
      hesta6: {
        speaker: H,
        text: 'Well, you know me now. You’ve got my order’s books under your floor and I’d like them back. (Then, quieter, and not unkindly:) She came to you, didn’t she? With her figures. And you told her to pray and say nothing. Don’t look like that. I told her to put them back in the box. We both did it, Holiness. Give me the key.',
        next: 'hesta7',
      },
      hesta7: { speaker: AU, mood: 'sad', text: '(He draws a cord from inside his robe. On it hangs an iron key, black with age, and his hand shakes so that it rings against his ring.) …Yes. Yes. Here.', next: 'give' },
      give: {
        speaker: AU, effects: [{ setFlag: 'companion.hesta-corrow.aurelian_key', value: true }, { setFlag: 'act2.aurelian_reports_admitted', value: true }, { unlockLore: 'lore:hierophant-aurelian', section: 'undercroft' }],
        text: 'Go at Compline. I shall be at prayer in the nave above you. I shall pray loudly. (A wan, astonished smile.) Castor has asked me for this key three times this month. I told him I had lost it. It is the first lie I have told him in eleven years. I find I rather enjoyed it.',
      },
      refuse: { speaker: AU, mood: 'afraid', text: 'I cannot. If Castor learned I had given it… you do not know how gentle he would be with me. (He folds his hands to stop them shaking.) Find another way. I shall not ask what it is.' },
    },
  },
  // ---------------------------------------------------------------- the door (obj:undercroft-door)
  {
    id: 'dialogue:obj-undercroft-door', name: 'Object: The undercroft door',
    entries: [
      { when: f(OPEN), node: 'open' },
      { when: at(QH, 'door'), node: 'start' },
      { node: 'sealed' },
    ],
    nodes: {
      sealed: { speaker: 'narrator', effects: [{ unlockLore: 'lore:cathedral-of-the-brand', section: 'undercroft' }], text: 'A low door under the nave, oak bound with iron, sealed across the lock with a fat disc of red wax stamped with the Lantern.' },
      open: { speaker: 'narrator', text: 'The undercroft door stands open a hand’s breadth. Cold air comes up the stair, smelling of dust and old ink.' },
      start: {
        speaker: 'narrator',
        text: 'The undercroft door is oak bound with iron, so low you must stoop to it. Across the lock lies a fat seal of red wax stamped with a lantern, the same red, Hesta says under her breath, as the seals on the chests in her vision. Above you the Compline bell is ringing, and the nave is emptying of the faithful.',
        choices: [
          { text: '[The Hierophant’s key] (Turn it in the lock.)', to: 'key', when: f('companion.hesta-corrow.aurelian_key') },
          { text: '[Shade] (Lift the seal with a warmed knife, and the lock with a bent pin.)', to: 'quiet', when: { classIs: 'class:shade' }, tag: 'class' },
          { text: '[Finesse 15] (Lift the seal whole and pick the lock.)', to: 'quiet', once: true, check: { stat: 'finesse', dc: 15, failTo: 'pick-fail' } },
          { text: '[Wick papers] (Show the Lord-Inquisitor’s writ to the archivist-brother.)', to: 'writ', when: { hasItem: 'item:wick-writ' } },
          { text: '[Hesta] “Can you open it?”', to: 'forced', when: following },
          { text: '(Leave it for now.)', to: null, tag: 'leave' },
        ],
      },
      'pick-fail': {
        speaker: 'narrator',
        text: 'The pin snaps off in the wards with a click like a dropped coin. Somewhere above, a verger stops sweeping, then starts again.',
        next: 'pick-fail2',
      },
      'pick-fail2': { speaker: H, text: '(Through her teeth.) Well, that way’s gone. Try another before he comes down to see what dropped.', next: 'start' },
      key: {
        speaker: 'narrator', effects: [opened('key')],
        text: 'The key turns as if the lock had been waiting for it a long time. Hesta peels the seal off whole with her thumbnail and slips it in her sleeve. “I’ll put it back after,” she murmurs. “He can tell Castor it was the damp.”',
      },
      quiet: {
        speaker: 'narrator', effects: [opened('quiet')],
        text: 'The wax comes away whole under a warmed blade. The lock is old and simple and it gives with a sigh. Hesta watches with a professional’s disapproval. “Where did you learn that?” she whispers. “No. Don’t tell me. I’ll only have to pretend I didn’t hear.”',
      },
      writ: {
        speaker: 'narrator', effects: [opened('writ')],
        text: 'A sleepy archivist-brother reads the Lord-Inquisitor’s writ twice by his candle, bows very low, breaks the seal himself and writes your name in the undercroft book in a careful round hand, with the hour.',
        next: 'writ2',
      },
      writ2: { speaker: H, text: '(When he has gone.) He wrote it down. Vellane reads everything that’s written down in this city, usually before the ink’s dry. We’d best be quick.' },
      forced: {
        speaker: 'narrator', effects: [opened('forced'), { setFlag: 'act2.undercroft_alarm', value: true }],
        text: 'Hesta lays her bare palm flat on the lock. For a moment nothing happens. Then the iron goes red, and then orange, and the red wax runs down the oak like blood. The lock sags in its housing with a sound like a sigh. Up in the nave a verger shouts.',
        next: 'forced2',
      },
      forced2: { speaker: H, mood: 'happy', text: 'There. The fourth way. (She shakes out her hand and coughs.) Now we’re in a hurry.' },
    },
  },
  // ---------------------------------------------------------------- the chests (obj:warden-archive-chest-1..3)
  {
    id: 'dialogue:obj-warden-archive-chest-1', name: 'Object: Wardens’ chest, the ledgers',
    entries: chestEntries(),
    nodes: {
      ...choiceNodes,
      idle: { speaker: 'narrator', text: 'A long chest of black oak, sealed in red wax with the Lantern’s stamp.' },
      start: {
        speaker: 'narrator', effects: [{ unlockLore: 'lore:the-emberwardens', section: 'purge-truth' }],
        text: 'The first chest is packed with ledgers bound in red calfskin, each stamped with the Wardens’ flame and the name of a hall: Cinderhold, and a dozen others whose names are on no map now. Hesta lifts one out the way you would lift a sleeping child.',
        next: 'read',
      },
      read: {
        speaker: H,
        text: 'Draws at the Cinderhold seep, every Lanternmass since 812. (She runs a burned finger down the columns.) Look at them. Look. Every year a little less. Two hundred years of the same small sum getting smaller, in a dozen different hands, and every one of them careful.',
        choices: [
          { text: '“You’ve seen these before.”', to: 'before' },
          { text: '[Arcanist] (Read the figures beside what the Ashmark tells you.)', to: 'arcanist', when: { classIs: 'class:arcanist' }, tag: 'class', once: true },
        ],
      },
      arcanist: { speaker: 'narrator', text: 'You know these numbers. You have felt them: the ache in the leys under every town you have walked through, the faint red threads guttering. The ledgers are only your Embersight written down by people who did not have it, and worked it out anyway, with mercury and iron and patience.', next: 'before' },
      before: {
        speaker: H, mood: 'sad',
        text: 'Copies of copies. The ones my master’s master carried out of the postern that night. I read them to Ysolde when she was sixteen, by a candle, like ghost stories. Then I put them back in the box and told her the Church would see to it. (She laughs, and it turns into a cough.) She remembered. I wish to every god she hadn’t.',
        next: 'cue',
      },
      cue: { speaker: 'narrator', text: 'Above you, faintly, the Compline hymn. It sounds a long way off.' },
    },
  },
  {
    id: 'dialogue:obj-warden-archive-chest-2', name: 'Object: Wardens’ chest, the Edict',
    entries: chestEntries(),
    nodes: {
      ...choiceNodes,
      idle: { speaker: 'narrator', text: 'A long chest of black oak, sealed in red wax with the Lantern’s stamp.' },
      start: {
        speaker: 'narrator', effects: [{ unlockLore: 'lore:book-proclamation-of-the-snuffing' }, { unlockLore: 'lore:purge-of-the-emberwardens' }],
        text: 'The second chest holds no ledgers. It holds the Church’s side: three reports from the Warden-Mother of Cinderhold, dated 1038, 1039 and 1040, each with a reply pinned to it in a clerk’s hand. The reply is the same each time. “Not to be answered.” Beneath them lies a draft of the Proclamation of the Snuffing, much corrected, in the hand of Caius the Third.',
        next: 'note',
      },
      note: {
        speaker: 'narrator',
        text: 'At the foot of the last page, below the Hierophant’s seal, someone has added a single line in a small neat hand: “Item. The Wardens’ chests to be kept, not burned. If the Wardens are right, we shall want their figures. If they are wrong, no one need ever know.”',
        next: 'hesta',
      },
      hesta: {
        speaker: H, mood: 'angry',
        text: 'They knew. (Very quietly.) They believed every word. They kept the proof in case they needed it, and they burned every red cloak at Cinderhold so nobody else would have it. “Not to be answered.” (She puts the page down very carefully, as if it might go off.) I should like, just once, to meet the clerk who wrote that. I should like it very much.',
        next: 'cue',
      },
      cue: { speaker: 'narrator', text: 'Footsteps cross the nave overhead: the even, unhurried tread of someone who has never in his life needed to hurry.' },
    },
  },
  {
    id: 'dialogue:obj-warden-archive-chest-3', name: 'Object: Wardens’ chest, Ysolde’s slips',
    entries: chestEntries(),
    nodes: {
      ...choiceNodes,
      idle: { speaker: 'narrator', text: 'A long chest of black oak, its seal broken long ago and pressed back into place.' },
      start: {
        speaker: 'narrator',
        text: 'The third chest’s seal has been broken before and pressed back by a careful thumb. Inside are more ledgers, and among their pages, marking places, a hundred slips of paper in a healer’s quick slanting hand. Hesta knows the hand before you do. You can tell by the way she stops breathing.',
        next: 'slips',
      },
      slips: {
        speaker: Y, mood: 'sad',
        text: '(On the first slip:) “Mistress’s figures agree with these to the third place. She was right. She was always right, and she put them back in the box.” (On another:) “If the fire is dying, it should not die alone.”',
        next: 'last',
      },
      last: {
        speaker: 'narrator',
        text: 'The last slip is folded twice, and on the outside it says, “For H., if she ever comes looking. She will. She always comes looking, too late, with her sword out.” Hesta unfolds it. Her hands are perfectly steady.',
        next: 'last2',
      },
      last2: { speaker: Y, mood: 'sad', text: '“I am sorry I did not wait for you. I could not bear to watch you be sorry. You taught me to hold a flame. I am going to find out whether anyone can hold this one. Eat something. Y.”', next: 'hesta' },
      hesta: {
        speaker: H,
        text: '“Eat something.” (A sound that is almost a laugh.) That’s mine. I used to sign every letter that way. She’s thrown it back at me. (She folds the slip and does not put it down.) Don’t. Don’t say anything kind, or I’ll fall over, and you’ll have to carry me up the stair.',
        choices: [
          { text: '(Say nothing. Stand beside her.)', to: 'stand', effects: [{ loyalty: H, delta: 3 }] },
          { text: '“She wanted you to find it. She wanted you to come.”', to: 'come' },
          { text: '[Listen]', to: 'parley', when: f('act2.parley_hesta') },
        ],
      },
      stand: { speaker: 'narrator', text: 'You stand beside her. After a while she leans, very slightly, on your shoulder, and you both pretend she has not.', next: 'cue' },
      come: { speaker: H, mood: 'sad', text: 'Yes. Too late, with my sword out. She always did know me best. (She tucks the slip inside her coat.) Well. I came. Somebody ought to tell her.', next: 'cue' },
      parley: { speaker: H, mood: 'sad', text: 'I told her, through the brazier, that I’d keep a fire lit for her. And here she’d already written back. Years ago. Before I’d said it. (She tucks the slip inside her coat.) That girl never once let me have the last word.', next: 'cue' },
      cue: { speaker: 'narrator', text: 'Somewhere above, a door opens and closes, and a voice asks a question you cannot hear.' },
    },
  },
  // ---------------------------------------------------------------- the decision (opened at stage `choice`; Hesta’s route)
  {
    id: 'dialogue:candles-choice', name: 'Hesta: The Wardens’ archive',
    entries: [{ when: f(ARCHIVE), node: 'c-done' }, { node: 'c-start' }],
    nodes: { ...choiceNodes },
  },
  // ---------------------------------------------------------------- Vellane closes in (opened at stage `presses` / `away`; flavour, nothing waits on it)
  {
    id: 'dialogue:candles-vellane', name: 'Vellane: The undercroft stair',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'narrator', effects: [{ setFlag: 'act2.vellane_knows_hesta', value: true }],
        text: 'Castor Vellane is on the stair. He holds his lantern a little to one side, courteously, so that it does not shine in your eyes. He looks at the chests, and at you, and longest at the tall old woman with the burned hands.',
        next: 'name',
      },
      name: {
        speaker: V,
        text: 'Warden Corrow. The Order’s records say you burned at Valcastre before the present Hierophant took his ring. I have always had my doubts about the Order’s records. It is a comfort to have them confirmed.',
        choices: [
          { text: '[Listen]', to: 'home', when: eq(ARCHIVE, 'cinderhold') },
          { text: '[Listen]', to: 'print', when: eq(ARCHIVE, 'published') },
          { text: '[Listen]', to: 'burn', when: eq(ARCHIVE, 'burned') },
          { text: '[Listen]', to: 'stance', when: { not: f(ARCHIVE) } },
        ],
      },
      home: {
        speaker: V,
        text: 'You mean to carry them out of my city on a cart, I suppose. Under a blanket. (A faint smile.) I could stop you. I have the men on the stair to do it. I am deciding whether it would be useful. A warden with an archive is a warden with an address, and I have always preferred to know where things are kept.',
        next: 'h-home',
      },
      'h-home': { speaker: H, text: 'Come to Cinderhold and ask for them, then, Castor. Bring a coat. It’s cold up there, and the welcome’s colder.', next: 'stance' },
      print: {
        speaker: V, mood: 'sad',
        text: 'Ah. Up the stair, not out of the city. To Aurelian. (Quietly.) You understand what you are doing. Half the Church will say the Lantern lied, and half will say the figures were forged by heretics, and there will be no third half left over to see to the leys. You have split us down the middle in the last winter of the world.',
        next: 'h-print',
      },
      'h-print': { speaker: H, mood: 'angry', text: 'You split yourselves in 1041. We’re only showing you the crack.', next: 'stance' },
      burn: {
        speaker: V,
        text: '(He stands in the smoke for a long moment, looking at what is left.) You have burned the only honest books in Solenne. I came down to read them. I would have used them better than you can imagine.',
        next: 'h-burn',
      },
      'h-burn': { speaker: H, mood: 'angry', text: 'That’s rather why.', next: 'stance' },
      stance: {
        speaker: V,
        text: '(He turns to you.)',
        choices: [
          { text: '[Listen]', to: 's-pledged', when: eq('act2.church_stance', 'pledged') },
          { text: '[Listen]', to: 's-defiant', when: eq('act2.church_stance', 'defiant') },
          { text: '[Listen]', to: 's-neutral', when: { all: [{ not: eq('act2.church_stance', 'pledged') }, { not: eq('act2.church_stance', 'defiant') }] } },
        ],
      },
      's-pledged': { speaker: V, text: 'You carry my writ, and you have robbed my archive with it, or near enough. I am not angry. I am taking notes. I should very much like to know which of us you think you are working for.', next: 'end' },
      's-defiant': { speaker: V, text: 'Of course it was you. I should have been disappointed if it were anyone else. You have a gift for the inconvenient door.', next: 'end' },
      's-neutral': { speaker: V, text: 'You declined me very politely, as I recall. I see now what you were being polite about.', next: 'end' },
      end: {
        speaker: V,
        text: 'Go. (He stands aside on the stair, and the soldiers behind him stand aside too, because he has.) I shall know where you are. I always do. Mind the candles, Warden. They are not all lit for you.',
        next: 'after',
      },
      after: { speaker: H, text: '(When he has gone up, and only then.) He’s frightened. Did you see it? Not of us. Of what’s in those books. (She coughs.) Good. Somebody in this city ought to be.' },
    },
  },
  // ---------------------------------------------------------------- the presses (Aurelian’s route at stage `presses`)
  {
    id: 'dialogue:candles-presses', name: 'Aurelian: To the printers',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'narrator', effects: [{ unlockLore: 'lore:the-hierophancy', section: 'split' }],
        text: 'The Hierophant receives the chests in his private chapel at the second hour of the morning, in his nightshirt, with a fur over it. He reads the clerk’s line at the foot of the Proclamation, “If the Wardens are right, we shall want their figures,” and reads it again, and sits down.',
        next: 'aurelian',
      },
      aurelian: {
        speaker: AU, mood: 'sad',
        text: 'Print them. All of it, every column, every slip. (His voice is quite steady.) And put my name at the front, so that the faithful know whom to blame. Caius the Third is beyond their reach. I am not. Somebody in this ring ought to be.',
        choices: [
          { text: '“That’s a brave thing, Holiness.”', to: 'brave' },
          { text: '[Listen]', to: 'hesta', when: following },
        ],
      },
      brave: { speaker: AU, text: 'No. A brave thing would have been last winter, by night, when I first read them. This is only a late thing. (He smiles a little.) But late is not never. I have decided to take comfort in that.' },
      hesta: { speaker: H, text: 'You’ve found your spine, then. Took you long enough. (Then, grudgingly:) Put Ysolde’s slips in too. All of them. Let them read what she knew, and when. Let them read me.', next: 'hesta2' },
      hesta2: { speaker: AU, mood: 'sad', text: 'Yes, Warden. (He bows his head to her, which no Hierophant has done to a Warden in a hundred and fifty years.) I am sorry. You will not care. I am sorry anyway.' },
    },
  },
  // ---------------------------------------------------------------- afterwards (Hesta’s route at stage `hearth`)
  {
    id: 'dialogue:candles-after', name: 'Hesta: After the undercroft',
    entries: [
      { when: eq(ARCHIVE, 'cinderhold'), node: 'home' },
      { when: eq(ARCHIVE, 'published'), node: 'print' },
      { node: 'burn' },
    ],
    nodes: {
      home: {
        speaker: H,
        text: 'I’ll put them on the shelves at Cinderhold, where they were. Somebody ought to dust them. Somebody ought to finish the columns, too; the last entry’s 1040, and there’s a hundred and forty-seven years owing. (She coughs.) I’ll start tonight. I’ve the figures in my head. I’ve always had them in my head.',
        next: 'ysolde',
      },
      print: {
        speaker: H,
        text: 'Every parish in Morvane is going to read my terrible handwriting. And hers, which is worse, because I taught it her. (She is very quiet for a moment.) I kept those figures in a box for forty years because I was afraid of what people would do when they knew. Now they’ll know. I find I’m still afraid. I’m also lighter. Isn’t that a thing.',
        next: 'ysolde',
      },
      burn: {
        speaker: H, mood: 'angry',
        text: 'I’m not speaking to you. (A pause.) That’s a lie. I’m too old to sulk; I haven’t the time left. (She looks at her hands.) Nine hundred years of the most careful people who ever lived, and I watched it go up the stairwell like chaff. You were right, and I’ll never forgive you, and both of those will be true until I die.',
        next: 'ysolde',
      },
      ysolde: {
        speaker: H,
        text: '(Her hand goes to her coat, where the folded slip is.) She wrote “For H.” Nobody’s called me anything else since I was nine years old and my master couldn’t be bothered with the rest. She used to say it like a whole name.',
        choices: [
          { text: '“Ysolde could still come home.”', to: 'hope' },
          { text: '“You kept the fire lit for her. That isn’t nothing.”', to: 'fire', effects: [{ loyalty: H, delta: 3 }] },
          { text: '“Eat something, Hesta.”', to: 'eat', effects: [{ loyalty: H, delta: 5 }] },
        ],
      },
      hope: { speaker: H, mood: 'sad', text: 'Don’t. Don’t give me hope; I haven’t the lungs for it. (A long breath.) …But if she does, I’ll have the kettle on. Tell her that, if I’m not about to tell her myself.' },
      fire: { speaker: H, text: 'No. It isn’t nothing. It isn’t enough, either. (She squeezes your arm, once, hard.) Come on. We’ve Embers to find and a saint to argue with, and I’m not getting any younger. Contrary to rumour.' },
      eat: { speaker: H, mood: 'happy', text: '(She stares at you. Then she laughs: a real one, which turns, inevitably, into a cough that goes on for some time.) Impudent child. Fine. Fine. You’re buying.' },
    },
  },
];

export default dialogues;
