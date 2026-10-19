/**
 * Dialogue: Act III Ch7, quest:the-last-lanternmass, part two (docs/lore/14-act3-spec.md). Owner: Claude 4.
 * Harrow at the river gate, Vellane’s fire in the lower city, and the Lanternmass dawn.
 * Every decision flag is set on the first node after the choice. Each scene is reopenable from its NPC
 * (osric-harrow / castor-vellane) and from a backup object that shares the same nodes; the dawn from obj:haldren-great-lantern.
 */
import type { DialogueChoice, DialogueDef, DialogueNode, NarrativeCondition, NarrativeEffect } from '@/core';

const f = (flag: string) => ({ flag });
const not = (c: NarrativeCondition): NarrativeCondition => ({ not: c });
const all = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: c });
const eq = (flag: string, value: string) => ({ flag, op: '==' as const, value });
const set = (flag: string, value: string | boolean): NarrativeEffect => ({ setFlag: flag, value });

const Q = 'quest:the-last-lanternmass';
const at = (stage: string) => ({ questStage: Q, stage });
const HARROW = 'npc:osric-harrow' as const, VELLANE = 'npc:castor-vellane' as const, HALE = 'npc:garrick-hale' as const;
const BRYCE = 'npc:bryce-aldmere' as const;
const CROWN = 'faction:crown-of-haldmarch' as const, WICK = 'faction:order-of-the-wick' as const;

type Branch = { to: string; when: NarrativeCondition };
const go = (branches: Branch[]): DialogueChoice[] => branches.map((b) => ({ text: 'Continue.', to: b.to, when: b.when }));

const FATE = 'act3.harrow_fate', LOWER = 'act3.lower_city', OUTCOME = 'act3.siege_outcome';
const dawnReady = { flag: 'act3.ally_count', op: '>=' as const, value: 3 };

// ================================================================ Harrow at the river gate
const harrowEntries = [
  { when: eq(FATE, 'slain'), node: 'done-slain' },
  { when: eq(FATE, 'arrested'), node: 'done-arrested' },
  { when: eq(FATE, 'fled'), node: 'done-fled' },
];

const forceChoice: DialogueChoice = { text: 'Draw steel and stop him.', to: 'force', tag: 'aggressive' };
const datesChoice: DialogueChoice = {
  text: '[His letters] Read his men the date on the first letter.', to: 'dates', tag: 'lore', when: f('npc.osric-harrow.dates_known'),
};
const runChoice: DialogueChoice = { text: '“Go, then. Run, if you’re going.”', to: 'run' };

const harrowNodes: Record<string, DialogueNode> = {
  idle: {
    speaker: 'narrator',
    text: 'The river gate of Haldren: a low arch where the Hald runs in under the city wall, closed by an iron grating on two great chains. The winch is greased, and the chains are taut. Black water slides under the bars without a sound.',
  },
  start: {
    speaker: 'narrator', next: 'harrow',
    text: 'The chains are moving. A dozen men in the Lord Protector’s grey lean on the winch-bars, and the grating is already a third of the way out of the river, dripping. Beyond it, in the reeds of the water-meadow, the Hollowed are waiting. They do not push. They do not need to. Osric Harrow stands on the water-stair with his hands clasped behind his back and watches them, as though he were reviewing troops.',
  },
  harrow: {
    speaker: HARROW,
    text: 'Ashmarked. I did wonder whether it would be you. (He does not turn round.) The Choir has made me an offer. The Keep, the upper city and every soul inside the inner wall: the Queen, the Charter, five hundred children asleep in the cathedral crypt. Spared, every one, untouched. For this gate, opened at the dawn bell.',
    choices: [
      { text: '“And everyone outside the inner wall?”', to: 'sum' },
      { text: '“You made this bargain once before.”', to: 'before' },
      { text: '“Step away from the winch.”', to: 'choose' },
    ],
  },
  sum: {
    speaker: HARROW, next: 'choose',
    text: 'Is dead already. I have counted your allies as carefully as you have, Ashmarked, and more honestly. The walls will not hold. I am selling what is lost to keep what is not. I did the same sum at Ashby Ford with fewer souls in it, and they made me a hero for it.',
  },
  before: {
    speaker: HARROW, next: 'choose',
    text: 'And it bought the Haldmarch a winter. Don’t look at me like that. You kept my secret. You knew what I was, and you put the kingdom into my hands because I was useful to you. We are partners in this, you and I. We always were.',
  },
  choose: {
    speaker: HARROW,
    text: '(Now he turns. He looks tired, and very sure.) So. What will you do about it?',
    choices: [
      forceChoice,
      { text: '[Will 20] “It’s over, my lord. Lower the gate.”', to: 'yield', tag: 'persuade', check: { stat: 'will', dc: 20, failTo: 'will-fail' } },
      datesChoice,
      runChoice,
    ],
  },
  'will-fail': {
    speaker: HARROW,
    text: '(Almost kindly.) Better men than you have tried to talk me out of arithmetic. The bell is in an hour.',
    choices: [forceChoice, datesChoice, runChoice],
  },
  force: {
    speaker: 'narrator', mood: 'sad', effects: [set(FATE, 'slain'), { reputation: CROWN, delta: -5 }], next: 'shut',
    text: 'He is the hero of Ashby Ford, and he is fifty-six years old. He draws, and for three passes on the wet stair he is as good as the songs. Then he is not. He goes down against the winch with your steel in him, and his men let go of the bars. “Five hundred,” he says, quite clearly. “I could have saved five hundred.” Then nothing.',
  },
  yield: {
    speaker: 'narrator', effects: [set(FATE, 'arrested'), { reputation: CROWN, delta: 5 }], next: 'shut',
    text: 'For a long moment he watches the water. Then he unbuckles his sword and holds it out to you hilt first, the way a man surrenders to an equal. “Lower it,” he tells his men, without raising his voice. “Lower it, damn you. The Ashmarked has the city.”',
  },
  dates: {
    speaker: 'narrator', effects: [set(FATE, 'arrested'), { reputation: CROWN, delta: 5 }], next: 'shut',
    text: 'You hold up the letter and read out the date, and then you tell them what it means: nine days before King Aldred died. His sergeant, a grey Haldish veteran who carried the old king’s banner at Ashby Ford, takes the letter out of your hand and reads it twice. Then he takes the Lord Protector by the arm. One by one the others leave the winch. Nobody says a word. They loved the old king.',
  },
  run: {
    speaker: 'narrator', mood: 'hollow',
    effects: [set(FATE, 'fled'), set('act3.river_gate_open', true), { addFlag: 'act3.ally_count', amount: -1 }],
    text: 'He looks at you for a moment as though he had expected better of you, or worse, and cannot decide which. Then he walks up the water-stair into the city and does not look back, and his men run after him. With no one on the bars the winch spins free, the chain screams through its collar, and the grating jams at the top of its slot, open. The Hollowed come in under the arch in silence, wading, the black water to their chests. They have the faces of the people of Greywater. Some of them are smiling.',
  },
  shut: {
    speaker: 'narrator',
    text: 'You throw your weight on the brake. The grating comes down into the Hald with a crash that you feel in your teeth, and the river gate is shut. In the reeds beyond it the Hollowed watch it fall. Then, without a sound, they turn and wade away into the dark, toward the South Gate.',
  },
  'done-slain': { speaker: 'narrator', mood: 'sad', text: 'The river gate is shut. Someone has laid Osric Harrow on the water-stair under his own grey cloak. Nobody has decided yet what to call him.' },
  'done-arrested': { speaker: 'narrator', text: 'The river gate is shut, and guarded now by men who loved King Aldred. The Lord Protector has been taken up to the Keep in irons.' },
  'done-fled': { speaker: 'narrator', mood: 'hollow', text: 'The grating hangs jammed at the top of its slot, and the black water runs in under it into the city. Of Osric Harrow there is no sign.' },
};

// ================================================================ Vellane’s fire in the lower city
const lowerEntries = [
  { when: eq(LOWER, 'saved'), node: 'done-saved' },
  { when: eq(LOWER, 'burned'), node: 'done-burned' },
];
const archiveChoice: DialogueChoice = {
  text: '[The Warden archive] “Half the Church has read what the Lanternate did to the Emberwardens. Your writ isn’t worth the wax.”', to: 'archive', tag: 'lore',
  when: eq('act2.warden_archive', 'published'),
};
const haleChoice: DialogueChoice = {
  text: '[Garrick Hale] “Inquisitor Hale. You let a marked one go at Brindlecross. Do it again.”', to: 'hale', tag: 'persuade',
  when: f('npc.garrick-hale.let_go'),
};
const SAVED: NarrativeEffect[] = [set(LOWER, 'saved'), { reputation: WICK, delta: -10 }, { reputation: CROWN, delta: 5 }];

const fireNodes: Record<string, DialogueNode> = {
  idle: {
    speaker: 'narrator',
    text: 'Pitch-barrels stand against the doorposts of the Narrows, two and three to a house, each one chalked with the wick-scissors of the Order. Behind the shutters somebody is singing a Lanternmass carol, very quietly, to a child.',
  },
  start: {
    speaker: 'narrator',
    text: 'The lower city of Haldren is called the Narrows, and it is: a warren of timber houses leaning together between the river wall and the market steps, where the refugees of Greywater have slept twelve to a room since the winter the Brand went dark. Tonight the Order of the Wick is rolling pitch-barrels down its lanes. Brothers in black knock out the bungs and tip them against the doorposts, and the smell of it is everywhere. Behind the shutters people are praying. At the foot of the Tanners’ Steps stands Castor Vellane with a lit torch in his hand.',
    choices: go([{ to: 'vellane-gate', when: f('act3.river_gate_open') }, { to: 'vellane', when: not(f('act3.river_gate_open')) }]),
  },
  vellane: {
    speaker: VELLANE, next: 'ask',
    text: 'Ashmarked. Good. Someone ought to witness this who will remember it accurately. The tide is coming up from the water-meadows. When it reaches the Narrows it reaches the market, and when it reaches the market it reaches the Keep. Fire is the one thing the Mire respects. I am going to burn the lower city from the river wall to these steps, and the tide will stop at the ashes.',
  },
  'vellane-gate': {
    speaker: VELLANE, next: 'ask',
    text: 'Ashmarked. Good. Someone ought to witness this who will remember it accurately. Lord Harrow has left the river gate open behind him, and the tide is already in the bottom lanes. When it reaches the market it reaches the Keep. Fire is the one thing the Mire respects. I am going to burn the lower city from the river wall to these steps, and the tide will stop at the ashes.',
  },
  ask: {
    speaker: VELLANE, text: '(He says it the way another man might say it looks like snow.)',
    choices: [
      { text: '“There are people in those houses.”', to: 'people' },
      { text: '“Burn the lanes, then, not the people. Give them time to get out.”', to: 'time' },
      { text: '“I won’t let you do this.”', to: 'stand' },
    ],
  },
  people: {
    speaker: VELLANE, next: 'stand',
    text: 'Eleven thousand, by the almoners’ last count. Some will get out. Most of the rest are Greywater folk, and half of those have the black tears already; they would be walking into the tide by spring. I have done the sum, Ashmarked. I did it twice. I do not enjoy arithmetic.',
  },
  time: {
    speaker: VELLANE, next: 'stand',
    text: 'There is no time. That is what the word “tide” means. Open the lanes, and the Hollowed come up them inside the crowd, and the crowd carries them to the Keep. (He looks at the torch.) I do not hate these people, child. I hate fire left unattended. Tonight I am attending to it.',
  },
  stand: {
    speaker: VELLANE, text: 'So. You disagree. Disagree quickly.',
    choices: [
      { text: '[Will 20] Step between the torch and the pitch. “Then you’ll have to burn me first.”', to: 'will', tag: 'persuade', check: { stat: 'will', dc: 20, failTo: 'will-fail' } },
      archiveChoice,
      haleChoice,
      { text: '“…Do it.”', to: 'burn' },
    ],
  },
  'will-fail': {
    speaker: VELLANE,
    text: '(He looks at you the way a smith looks at a good blade with a crack in it.) Admirable. Insufficient. Stand aside, Ashmarked, or stand in it.',
    choices: [archiveChoice, haleChoice, { text: 'Stand aside.', to: 'burn' }],
  },
  will: {
    speaker: 'narrator', effects: SAVED, next: 'will-2',
    text: 'You put yourself between the torch and the barrels, and you let the Ashmark burn: so bright through your glove that the pitch at your feet begins to smoke. Light it, you tell him, and it lights you, and every Ember in you with it, and then the Lantern will have burned its last hope along with the Narrows. For a long moment the only sound is the praying behind the shutters.',
  },
  'will-2': {
    speaker: VELLANE, next: 'saved',
    text: '(He lowers the torch.) Very well. If the Narrows fall, the blood is yours, and I shall see that it is written so. (To his Brothers, without turning:) Buckets.',
  },
  archive: {
    speaker: 'narrator', effects: SAVED, next: 'archive-2',
    text: 'The Brother nearest Vellane stops with his bung-mallet raised. A Lightsworn captain pushes through the smoke, the white of her surcoat gone grey. “My lord. The Hierophant’s own seal is on the Warden archive, and half the chapter-houses of the Haldmarch have read it. If the Order burns a city tonight, the Order burns it alone.” One by one the Lightsworn put their torches out in the snow. Vellane watches every one of them do it.',
  },
  'archive-2': {
    speaker: VELLANE, next: 'saved',
    text: '(Very quietly.) So. The Church is split, and I am holding a torch in a city that no longer believes me. (He drops it into the slush, and it goes out.) Remember that it was you who taught them to doubt. I shall.',
  },
  hale: {
    speaker: 'narrator', effects: SAVED, next: 'hale-2',
    text: 'Garrick Hale comes out of the smoke with soot in his beard and a wet cloak over his shoulders. He takes the torch from the nearest Brother the way you would take a knife from a child, and pushes it into a water-butt. It goes out with a hiss.',
  },
  'hale-2': {
    speaker: HALE, next: 'hale-3',
    text: 'I’ve burned enough for you, my lord. I let a marked one go once, at Brindlecross. Turned out to be the only thing I ever did right. (He looks along the lane at the Brothers.) Put them out, lads.',
  },
  'hale-3': {
    speaker: VELLANE, next: 'saved',
    text: '(The Brothers look at Hale, and then at Vellane, and then, one after another, they put their torches out.) Garrick. You too. (It is the only time you will ever hear him sound surprised.)',
  },
  saved: {
    speaker: 'narrator',
    text: 'So the Narrows do not burn. Instead the Lightsworn and the Wick and the people of the lower city hold them lane by lane through the worst of the night: barricades of doors and bedsteads, buckets passed hand to hand, the old and the children carried up the Tanners’ Steps to the market. It costs. You will hear the cost read out at dawn, name by name. But in the morning there will be someone left to hear it.',
  },
  burn: {
    speaker: VELLANE, effects: [set(LOWER, 'burned'), { reputation: CROWN, delta: -10 }], next: 'burn-2',
    text: '(He nods once, as though you had passed a test he had hoped you would fail.) Fiat flamma.',
  },
  'burn-2': {
    speaker: 'narrator', mood: 'hollow', next: 'burn-3',
    text: 'The torch goes into the pitch. The Narrows burn the way old timber burns in a dry winter, all at once, from the river wall to the steps, and the worst of the noise is not the fire. Shutters open on burning rooms. A woman comes out of a doorway with her hair alight and a child held up over her head, and the Brothers push her back with their staves, gently, because the line must hold. Down at the river wall the Hollowed walk into the flames without a sound and go out like candles. Not every shape that walks into the fire was Hollowed.',
  },
  'burn-3': {
    speaker: VELLANE,
    text: '(He does not look away, not once. You will remember that.) The Order will be blamed for this. That is correct. Write it down, Ashmarked, so that it is written down accurately: I did this. And the tide stopped at the ashes.',
  },
  'done-saved': { speaker: 'narrator', text: 'The Narrows still stand, barricaded with doors and bedsteads. The pitch-barrels have been rolled into the river. Vellane’s torch lies in the slush where it went out.' },
  'done-burned': { speaker: 'narrator', mood: 'hollow', text: 'Where the Narrows stood there is a long black field of ash, steaming in the snow, from the river wall to the Tanners’ Steps. Nobody can look at it for long.' },
};

// ================================================================ the Lanternmass dawn
const HELD = eq(OUTCOME, 'held');
const END: Branch[] = [{ to: 'held-end', when: HELD }, { to: 'fallen-end', when: not(HELD) }];
const HARROW_BEAT: Branch[] = [
  { to: 'harrow-fled', when: eq(FATE, 'fled') },
  { to: 'harrow-slain', when: eq(FATE, 'slain') },
  { to: 'harrow-arrested', when: eq(FATE, 'arrested') },
  ...END.map((b) => ({ to: b.to, when: all(not(f(FATE)), b.when) })),
];
const LOWER_BEAT: Branch[] = [
  { to: 'lower-burned', when: eq(LOWER, 'burned') },
  { to: 'lower-saved', when: eq(LOWER, 'saved') },
  ...HARROW_BEAT.map((b) => ({ to: b.to, when: all(not(f(LOWER)), b.when) })),
];
const LORE: NarrativeEffect[] = [{ unlockLore: 'lore:the-last-lanternmass' }, { unlockLore: 'lore:the-siege-of-haldren' }];

const dawnEntries = [
  { when: HELD, node: 'held' },
  { when: eq(OUTCOME, 'fallen'), node: 'fallen' },
];

const dawnNodes: Record<string, DialogueNode> = {
  held: {
    speaker: 'narrator', effects: [set(OUTCOME, 'held'), ...LORE], choices: go(LOWER_BEAT),
    text: 'Dawn. It comes up grey over the Kingsvale on Lanternmass morning, the second since the Brand went dark, and the tide breaks. Not all at once: the Hollowed on the plain below the South Gate simply stop, and stand swaying in the snow with their faces turned to the east, where the sky is paling. Then, one by one, they turn and walk away toward the river, toward Greywater, toward the Mire. The drowned knights go last. The walls are still standing. Haldren has held.',
  },
  fallen: {
    speaker: 'narrator', mood: 'sad', effects: [set(OUTCOME, 'fallen'), ...LORE], choices: go(LOWER_BEAT),
    text: 'Dawn, and the South Gate is gone. The tide came through it an hour before first light and is in the market now, black water standing knee-deep among the stalls, and somewhere a bell is still ringing the Lanternmass hours as though nothing had happened. And the people of Haldren, going out by the north road with their children and their cookpots, are carrying lanterns: every lantern in the city, lit. Nobody ordered it. Nobody can say who began it. Haldren falls on Lanternmass morning with every lantern in it burning.',
  },
  'lower-burned': {
    speaker: 'narrator', mood: 'hollow', choices: go(HARROW_BEAT),
    text: 'Where the Narrows stood there is a long black field of ash, steaming in the snow from the river wall to the Tanners’ Steps. Nobody can look at it for long. Nobody will ever be able to say for certain how many are under it.',
  },
  'lower-saved': {
    speaker: 'narrator', choices: go(HARROW_BEAT),
    text: 'The Narrows are still standing: scorched, barricaded, stripped of half their doors, but standing. Out of the cellars and the attics come the people of Greywater, blinking at the light, and every one of them is carrying a lamp.',
  },
  'harrow-fled': {
    speaker: 'narrator', mood: 'angry', choices: go(END),
    text: 'Of Osric Harrow there is no sign. The river gate still hangs open, jammed at the top of its slot, and the black water runs in under it. Someone has chalked a single word on the arch. It is not a kind one.',
  },
  'harrow-slain': {
    speaker: 'narrator', mood: 'sad', choices: go(END),
    text: 'They have laid Osric Harrow on the water-stair under his own cloak, and nobody knows what to call him: the hero of Ashby Ford, or the other thing. In the end someone sets a lantern by his head, because it is Lanternmass, and leaves it at that.',
  },
  'harrow-arrested': {
    speaker: 'narrator', choices: go(END),
    text: 'Osric Harrow lives, in irons, guarded by his own men. When they tell him how the night has ended he only nods, and asks for nothing.',
  },
  'held-end': {
    speaker: 'narrator', mood: 'happy',
    text: 'In the market the great lantern of Haldren hangs from its iron gallows, cold for two years. Prior Benedek has climbed the ladder with a taper, and his hands are shaking too badly to use it. He looks down at you. “Would you?” You put your marked hand to the wick, and it takes. Then, all across Haldren, on every merlon and windowsill and gatepost, the lanterns are lit. It is not the Brand. It is not Ithren’s fire, or anyone’s. It is only a city that lived through the night, lighting its lamps. Lux manet. Far to the east, where Greywater used to be, the Mire is drawing back into the dark, and at the bottom of it the Pale Saint is waiting.',
  },
  'fallen-end': {
    speaker: 'narrator', mood: 'sad',
    text: 'By noon the survivors are strung out along the crag road to Cinderhold, a long line of lights in the snow, and Cinderhold’s yard fills with them until there is no room to lie down. The great lantern of Haldren was too heavy to carry. Someone lit it anyway before they left, and from the crag you can see it still burning, alone, in the middle of the drowned city. There is nowhere left to fall back to. There is only forward, into the Mire, where the Pale Saint is waiting.',
  },
};

const dialogues: DialogueDef[] = [
  // ----- alarms (flavour, opened on entering each stage; reopenable from Ser Bryce)
  {
    id: 'dialogue:ch7-river-alarm', name: 'Siege of Haldren: The river gate',
    entries: [{ node: 'bryce' }],
    nodes: {
      bryce: {
        speaker: BRYCE, mood: 'afraid', next: 'look',
        text: 'Ashmarked! The river gate! Someone’s raising the river gate, and that’s the Lord Protector’s banner on the water-stair. My men won’t go near it. They’re his men, half of them.',
      },
      look: {
        speaker: 'narrator',
        text: 'Down where the Hald runs in under the wall you can hear it over the battle: the slow clank of a winch, and chains taking the weight.',
      },
    },
  },
  {
    id: 'dialogue:ch7-fire-alarm', name: 'Siege of Haldren: Smoke from the Narrows',
    entries: [{ node: 'bryce' }],
    nodes: {
      bryce: {
        speaker: BRYCE, mood: 'angry', next: 'look',
        text: 'The Narrows! The Order is rolling pitch into the lower city, on the Lord-Inquisitor’s orders. There are eleven thousand souls down there, Ashmarked, and the Brothers are nailing the doors.',
      },
      look: {
        speaker: 'narrator',
        text: 'Below the market steps the lanes of the lower city are full of men in black carrying torches, and the wind off the river smells of pitch.',
      },
    },
  },
  // ----- Harrow (route on osric-harrow; backup obj:haldren-river-gate-winch)
  {
    id: 'dialogue:ch7-harrow-gate', name: 'Siege of Haldren: Harrow at the river gate',
    entries: [...harrowEntries, { node: 'start' }],
    nodes: harrowNodes,
  },
  {
    id: 'dialogue:obj-haldren-river-gate-winch', name: 'Object: The river gate winch',
    entries: [...harrowEntries, { when: at('betrayal'), node: 'start' }, { node: 'idle' }],
    nodes: harrowNodes,
  },
  // ----- Vellane (route on castor-vellane; backup obj:lower-city-firebreak)
  {
    id: 'dialogue:ch7-vellane-fire', name: 'Siege of Haldren: Vellane’s fire',
    entries: [...lowerEntries, { node: 'start' }],
    nodes: fireNodes,
  },
  {
    id: 'dialogue:obj-lower-city-firebreak', name: 'Object: The pitch-barrels in the Narrows',
    entries: [...lowerEntries, { when: at('fire'), node: 'start' }, { node: 'idle' }],
    nodes: fireNodes,
  },
  {
    id: 'dialogue:ch7-hale-lower-city', name: 'Garrick Hale: The Narrows',
    entries: [
      { when: eq(LOWER, 'saved'), node: 'after-saved' },
      { when: eq(LOWER, 'burned'), node: 'after-burned' },
      { when: f('npc.garrick-hale.let_go'), node: 'debt' },
      { node: 'orders' },
    ],
    nodes: {
      debt: {
        speaker: HALE,
        text: '(He is passing buckets in a chain of Brothers and washerwomen, and does not stop.) He’s going to burn it. You know he is. When you face him, say my name. I owe a debt from Brindlecross, and I should like to pay it somewhere it counts.',
      },
      orders: {
        speaker: HALE, mood: 'angry',
        text: 'Orders are orders, Ashmarked. I’ve never once liked them. I like these less than most. (He looks down the lane at the pitch-barrels, and then away.) Go and argue with him, if you’ve the stomach. I haven’t.',
      },
      'after-saved': { speaker: HALE, text: 'Still standing. I didn’t think I’d live to see the Order put a torch out. (He scrubs soot out of his beard.) Don’t tell anyone it was me.' },
      'after-burned': { speaker: HALE, mood: 'sad', text: '(He is sitting on the Tanners’ Steps, looking at the ash.) I’ve watched the Order burn books, and barns, and once a woman. Never a city. Leave me be a while.' },
    },
  },
  // ----- Ser Bryce Aldmere, captain of the South Gate (general siege lines)
  {
    id: 'dialogue:ch7-bryce', name: 'Ser Bryce: The siege',
    entries: [{ when: HELD, node: 'held' }, { when: eq(OUTCOME, 'fallen'), node: 'fallen' }, { node: 'night' }],
    nodes: {
      night: { speaker: BRYCE, text: 'Hold, they tell me. Hold what? (He spits over the wall.) The gate. That’s what I’ve got. I’ll hold the gate.' },
      held: { speaker: BRYCE, mood: 'happy', text: 'Two winters I stood at that gate looking at people’s hands. This morning I watched the sun come up over every lantern in Haldren. I’ll stand there another twenty, if they’ll have me.' },
      fallen: { speaker: BRYCE, mood: 'sad', text: 'I kept the gate till there wasn’t a gate to keep. Got four hundred out by the north road behind me. Four hundred. (He looks at his hands.) It ought to have been more.' },
    },
  },
  // ----- the dawn (opened on entering stage `dawn`; reopenable from obj:haldren-great-lantern)
  {
    id: 'dialogue:ch7-dawn', name: 'Siege of Haldren: The Lanternmass dawn',
    entries: [...dawnEntries, { when: dawnReady, node: 'held' }, { node: 'fallen' }],
    nodes: dawnNodes,
  },
  {
    id: 'dialogue:obj-haldren-great-lantern', name: 'Object: The great lantern of Haldren',
    entries: [
      { when: HELD, node: 'lit-held' },
      { when: eq(OUTCOME, 'fallen'), node: 'lit-fallen' },
      { when: all(at('dawn'), dawnReady), node: 'held' },
      { when: at('dawn'), node: 'fallen' },
      { node: 'cold' },
    ],
    nodes: {
      ...dawnNodes,
      cold: {
        speaker: 'narrator',
        text: 'The great lantern of Haldren hangs from its iron gallows in the middle of the market, as tall as a man, its glass sooted and its wick cold. It was lit from the Brand three hundred years ago and did not go out until the Night of Falling Ash. Pigeons nest in it now.',
      },
      'lit-held': { speaker: 'narrator', mood: 'happy', text: 'The great lantern of Haldren is burning, lit by a marked hand on Lanternmass morning. Children come to stand under it and warm their faces. Nobody has told them to.' },
      'lit-fallen': { speaker: 'narrator', mood: 'sad', text: 'The great lantern of Haldren is still burning in the drowned market, with the black water standing round the foot of its gallows. Nobody knows who lit it. Nobody has the heart to put it out.' },
    },
  },
];

export default dialogues;
