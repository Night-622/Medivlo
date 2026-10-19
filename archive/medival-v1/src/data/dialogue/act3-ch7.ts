/**
 * Dialogue: Act III Ch7, quest:the-last-lanternmass, the Siege of Haldren (docs/lore/14-act3-spec.md). Owner: Claude 4.
 * This file: the muster at Cinderhold and the night on the walls. The river gate, the lower city and the dawn are in act3-ch7b.ts.
 *
 * The muster is a chain of nodes joined by single “Continue.” choices, each gated by `when`, with a fallback for every
 * ally who does not come. Each ally’s arrival node sets act3.ally.<x> and adds 1 to act3.ally_count on entry.
 * The first node resets act3.ally_count to 0, so an interrupted roll simply starts over and counts true.
 */
import type { DialogueChoice, DialogueDef, DialogueNode, NarrativeCondition, NarrativeEffect } from '@/core';

const f = (flag: string) => ({ flag });
const not = (c: NarrativeCondition): NarrativeCondition => ({ not: c });
const all = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: c });
const any = (...c: NarrativeCondition[]): NarrativeCondition => ({ any: c });
const eq = (flag: string, value: string) => ({ flag, op: '==' as const, value });
const atLeast = (flag: string, value: number) => ({ flag, op: '>=' as const, value });

const HESTA = 'npc:hesta-corrow' as const, ANSELM = 'npc:anselm-pryde' as const, MAREN = 'npc:maren-hollis' as const;

type Branch = { to: string; when: NarrativeCondition };
/** one visible “Continue.” per step: the branches of a step are exhaustive and mutually exclusive */
const go = (branches: Branch[]): DialogueChoice[] => branches.map((b) => ({ text: 'Continue.', to: b.to, when: b.when }));
const ally = (x: string): NarrativeEffect[] => [{ setFlag: `act3.ally.${x}`, value: true }, { addFlag: 'act3.ally_count', amount: 1 }];

// ---------- who answers the call (14-act3-spec.md, Ch7 muster)
const thornwise = f('act1.ylwen_pact');
const orrun = all(any(f('act2.new_nail'), f('act1.nails_kept')), not(f('act2.korrath_flooded')));
const hrothi = eq('act2.moot_outcome', 'allied');
const salt = any(eq('act2.auction_outcome', 'bid'), eq('act2.auction_outcome', 'duel'));
const qasiri = all(f('act2.samir_promise'), not(f('act2.samir_promise_broken')));
const creed = all(f('act2.vesper_joined'), not(f('act2.vesper_betrayed')));
const church = any(eq('act2.church_stance', 'pledged'), eq('act1.ruler', 'wick'));

// ---------- who calls the roll: Hesta if she lives, else Anselm if he is with you, else Maren
const hestaHost = f('act1.hesta_alive');
const anselmHost = all(not(hestaHost), any(not(f('prologue.anselm_betrayed')), f('act2.anselm_freed')));
const marenHost = all(not(hestaHost), not(anselmHost));

const THORN: Branch[] = [{ to: 'thornwise', when: thornwise }, { to: 'thornwise-no', when: not(thornwise) }];
const ORRUN: Branch[] = [
  { to: 'orrun-nail', when: all(orrun, f('act2.new_nail')) },
  { to: 'orrun-kept', when: all(orrun, not(f('act2.new_nail'))) },
  { to: 'orrun-flooded', when: f('act2.korrath_flooded') },
  { to: 'orrun-no', when: all(not(orrun), not(f('act2.korrath_flooded'))) },
];
const HROTHI: Branch[] = [
  { to: 'hrothi', when: hrothi },
  { to: 'hrothi-war', when: all(not(hrothi), f('act2.hrothi_invasion')) },
  { to: 'hrothi-no', when: all(not(hrothi), not(f('act2.hrothi_invasion'))) },
];
const SALT: Branch[] = [{ to: 'salt', when: salt }, { to: 'salt-no', when: not(salt) }];
const QASIRI: Branch[] = [
  { to: 'qasiri', when: qasiri },
  { to: 'qasiri-broken', when: f('act2.samir_promise_broken') },
  { to: 'qasiri-no', when: all(not(qasiri), not(f('act2.samir_promise_broken'))) },
];
const CREED: Branch[] = [
  { to: 'creed', when: creed },
  { to: 'creed-betrayed', when: f('act2.vesper_betrayed') },
  { to: 'creed-no', when: all(not(creed), not(f('act2.vesper_betrayed'))) },
];
const CHURCH: Branch[] = [
  { to: 'church-pledged', when: eq('act2.church_stance', 'pledged') },
  { to: 'church-wick', when: all(not(eq('act2.church_stance', 'pledged')), eq('act1.ruler', 'wick')) },
  { to: 'church-no', when: not(church) },
];
const TALLY: Branch[] = [
  { to: 'tally-many', when: atLeast('act3.ally_count', 5) },
  { to: 'tally-enough', when: all(atLeast('act3.ally_count', 3), not(atLeast('act3.ally_count', 5))) },
  { to: 'tally-few', when: not(atLeast('act3.ally_count', 3)) },
];
const HOST: Branch[] = [{ to: 'close-hesta', when: hestaHost }, { to: 'close-anselm', when: anselmHost }, { to: 'close-maren', when: marenHost }];

const RESET: NarrativeEffect[] = [{ setFlag: 'act3.ally_count', value: 0 }];
const DONE: NarrativeEffect[] = [{ setFlag: 'act3.muster_done', value: true }];

const musterNodes: Record<string, DialogueNode> = {
  after: { speaker: 'narrator', text: 'The roll has been called. The fires in Cinderhold’s yard burn for every banner that came, and the dark places between them are very plain. There is nothing more to be said here. The tide is coming up the Hald.' },

  // ----- the three hosts
  hesta: {
    speaker: 'narrator', effects: RESET, next: 'hesta-2',
    text: 'Cinderhold, on the eve of Lanternmass. The brazier roars under the broken roof, and the hall smells of wet wool and horses and hot iron. Hesta stands at the map-table with the muster roll pinned flat under Lastlight’s pommel. She has been coughing for an hour. She has not sat down.',
  },
  'hesta-2': {
    speaker: HESTA, next: 'call',
    text: 'Two years tonight since that girl of mine put out the Brand. I’ve called in every debt you ever ran up, child, from the Thornwall to the Sunscar. Let’s hear which of them you paid.',
  },
  anselm: {
    speaker: 'narrator', effects: RESET, next: 'anselm-2',
    text: 'Cinderhold, on the eve of Lanternmass. The brazier roars under the broken roof. Brother Anselm sits on a powder-keg at Hesta’s old map-table with ink to the wrists and the muster roll across his knees, and her empty chair beside him. He has written every name in a fair clerk’s hand, as if neatness could make them come.',
  },
  'anselm-2': {
    speaker: ANSELM, next: 'call',
    text: 'I have written down everyone who ever promised you anything. It is a strange sort of litany. (He smooths the page.) Let us find out which of them meant it.',
  },
  maren: {
    speaker: 'narrator', effects: RESET, next: 'maren-2',
    text: 'Cinderhold, on the eve of Lanternmass. Maren sits on the wall above the gate with her bow across her back, a hazel tally-stick in one hand and her knife in the other. There is a notch cut for every rider who went out. She has not cut any for the ones who have come back.',
  },
  'maren-2': {
    speaker: MAREN, next: 'call',
    text: 'Somebody has to count, and Hesta isn’t here to do it. (She turns the stick over.) Lanternmass. Do you remember the pyre at Brindlecross? I keep thinking about the pyre. Go on, then. Let’s see who came.',
  },
  call: {
    speaker: 'narrator', choices: go(THORN),
    text: 'From the crag you can see the beacons burning on every hill of the Kingsvale, from the Thornwall to the Ironspine road. The riders went out three days ago. Now, one by one, the answers come in out of the dark.',
  },

  // ----- Thornwise
  thornwise: {
    speaker: 'narrator', effects: ally('thornwise'), choices: go(ORRUN),
    text: 'From the west, where the Thornwall stands black against the snow, the hedge opens like a door. The Thornwise come out of it without torches: two hundred thornbows of living wardwood, still putting out pale leaves in the frost, and behind them a dozen singers with their hoods up. The girl who carries the Archdruid’s word has antlers of growing wood. “Rhiannon Ys-Caer says: Ys Aerwen drowned with no one coming. Haldren will not.”',
  },
  'thornwise-no': {
    speaker: 'narrator', mood: 'sad', choices: go(ORRUN),
    text: 'The rider you sent to Caer Ylwen comes back at dusk on a lame horse, with your letter still sealed in his glove. The Thornwall did not open for him. Nothing sang. There will be no wardwood on the walls tonight, and no one to sing the dead down.',
  },

  // ----- Orrun
  'orrun-nail': {
    speaker: 'narrator', effects: ally('orrun'), choices: go(HROTHI),
    text: 'Up the Kings’ Way from the Ironspine comes a sound like a mine at work: three hundred Orrun of the Iron Concord in true-iron to the eyebrows, hammers on their shoulders, chanting “Korr nagh, korr nagh” to keep the step. Their captain bows to you as to a thane. “The Ninth Nail stands. Brannoch Deepforge says the Concord pays what it owes, and it owes you the mountain.”',
  },
  'orrun-kept': {
    speaker: 'narrator', effects: ally('orrun'), choices: go(HROTHI),
    text: 'Up the Kings’ Way from the Ironspine comes a sound like a mine at work: three hundred Orrun of the Iron Concord in true-iron to the eyebrows, hammers on their shoulders, chanting “Korr nagh, korr nagh” to keep the step. Their captain does not bow. “The High Thane bought your silence once. He is paying for it again. Count us, Ashmarked, and do not count the Nails.”',
  },
  'orrun-flooded': {
    speaker: 'narrator', mood: 'sad', choices: go(HROTHI),
    text: 'No one comes down the Ironspine road. The word from Korrath is one slate, scratched in Orrun runes and carried by a frostbitten boy who will not meet your eyes. The lower holds are under the black water. Every hammer under the mountain is holding back the flood. You took the Ember out of the Deep, and this is the bill for it.',
  },
  'orrun-no': {
    speaker: 'narrator', mood: 'sad', choices: go(HROTHI),
    text: 'The Iron Concord sends a slate, very correct, regretting that the halls of Korrath cannot spare a single hammer for a quarrel on the surface. It does not mention the Nails, or Grimma, or the shame of the hall. It does not need to.',
  },

  // ----- Hrothi
  hrothi: {
    speaker: 'narrator', effects: ally('hrothi'), choices: go(SALT),
    text: 'Then the river. Out of the north, up the River Hald against the ice, come the longships of Skelvik: eleven hulls with their oars white with frost and the wolf-banners stiff as boards. Jarl Sigrun Ice-Eye stands in the prow of the first with an axe across her shoulders, and her voice carries over the water like a thrown spear. “The Moot remembers. Calun sees. Show us where they are.”',
  },
  'hrothi-war': {
    speaker: 'narrator', mood: 'angry', choices: go(SALT),
    text: 'The river brings no friends. Last autumn Hrothi longships burned Haldford to the waterline under the banner of the stolen Ember, and the north and the Haldmarch have been at war since. If any wolves come down the Hald tonight, they will come to see what is left to take.',
  },
  'hrothi-no': {
    speaker: 'narrator', mood: 'sad', choices: go(SALT),
    text: 'Nothing comes down from the north. The Moot is broken, clan against clan in the snow, and no jarl will row south while her neighbour sits at her hearth. The Hald runs past Haldren empty and black.',
  },

  // ----- Salt League
  salt: {
    speaker: 'narrator', effects: ally('salt'), choices: go(QASIRI),
    text: 'At Haldford the Salt League drops anchor: Admiral Kestrel’s galleys, and behind them on tow-ropes a string of old hulks packed to the gunwales with pitch and tow and lamp-oil. Fire-ships. Her letter comes up the crag in the hand of a boy in a red cap. “A bargain is a bargain. I have brought twelve fires and I shall want every one of them back as a favour. Yours in commerce, M. Kestrel.”',
  },
  'salt-no': {
    speaker: 'narrator', choices: go(QASIRI),
    text: 'From Brackhaven comes a letter on good paper in a clerk’s hand. The Salt League regrets. The Salt League has accounts outstanding with the bearer, and does not lend its ships to debtors. There is a bill enclosed.',
  },

  // ----- Qasiri
  qasiri: {
    speaker: 'narrator', effects: ally('qasiri'), choices: go(CREED),
    text: 'Down the south road, out of the snow and into it, comes something no Haldish eye has seen in a hundred years: the riders of the Sunscar, their scale of fused black glass ringing like bells, their long curved glass-blades wrapped in felt against the cold. Samir ibn Ruqaya rides at their head with frost in his beard. “You ate my salt. My mother says a promise kept across half the world is still a promise kept. I have come to keep mine.”',
  },
  'qasiri-broken': {
    speaker: 'narrator', mood: 'sad', choices: go(CREED),
    text: 'The Qasiri do not come. One rider arrives at dusk. He sets a bowl of salt on the threshold of the hall, pours it out on the stones without a word, and turns his horse back to the south. No one in Cinderhold needs it explained.',
  },
  'qasiri-no': {
    speaker: 'narrator', choices: go(CREED),
    text: 'The Sunscar is half a world away and owes the Haldmarch nothing. No riders come. The snow on the south road lies unbroken.',
  },

  // ----- Ashen Creed
  creed: {
    speaker: 'narrator', effects: ally('creed'), choices: go(CHURCH),
    text: 'Near midnight a band of men and women in red walks in out of the snow with no lanterns, because they do not need them: the Ashen Creed, fire-mages without a licence among them, sparks crawling in their sleeves. Vesper Qadri is at their head. “We are here for the city, not for the Lantern,” she says. “If any Brother of the Wick lays a hand on one of mine tonight, I will burn him where he stands. Tell them so.”',
  },
  'creed-betrayed': {
    speaker: 'narrator', mood: 'angry', choices: go(CHURCH),
    text: 'From the Ashen Creed comes one thing only: a burned feather in a fold of paper, left on the gate of Cinderhold where the sentries swear no one passed. You sold Vesper Qadri at Gull Rock. The Creed has not forgotten, and tonight its fire will be somewhere else.',
  },
  'creed-no': {
    speaker: 'narrator', choices: go(CHURCH),
    text: 'The Ashen Creed sends nothing. Why would it? The fire-mages have no love for a city full of Lantern priests, and no one ever asked them as a friend.',
  },

  // ----- the Lantern
  'church-pledged': {
    speaker: 'narrator', effects: ally('church'), choices: go(TALLY),
    text: 'Last of all, the Lantern. Down the Pilgrim’s Road comes a column in white and gold: four hundred Lightsworn of the Lanternate, with the old Brand-lanterns on their poles, cold and dark and carried anyway. Behind them ride the Order of the Wick in black, and at the head of the Order rides Castor Vellane, who looks at Cinderhold’s brazier as though he were adding it up. “You pledged,” he says. “So did we. The Lantern keeps its word, Ashmarked. Remember that, when the time comes to keep yours.”',
  },
  'church-wick': {
    speaker: 'narrator', effects: ally('church'), choices: go(TALLY),
    text: 'The Lantern is already here. Haldren has been the Order’s since you gave it to them, and by the Lord-Inquisitor’s decree every Lightsworn in the Haldmarch stands on the walls tonight. Castor Vellane rides up the crag to Cinderhold to tell you so himself. “The Haldmarch is mine to keep,” he says. “I keep what is mine.”',
  },
  'church-no': {
    speaker: 'narrator', choices: go(TALLY),
    text: 'Last of all, from Solenne, comes a prayer, very beautifully lettered, promising that the whole Lanternate will be on its knees for Haldren tonight. On its knees, and nowhere else. No Lightsworn will stand on the walls.',
  },

  // ----- the tally (sets act3.muster_done)
  'tally-many': {
    speaker: 'narrator', mood: 'happy', effects: DONE, choices: go(HOST),
    text: 'The roll is called. Fires burn in the yard of Cinderhold for every banner that came, more than the yard can hold, and strangers sit at them shoulder to shoulder: peoples who were killing one another a hundred years ago, passing the same loaf. It is the greatest host the Haldmarch has seen since the Charter. It may even be enough.',
  },
  'tally-enough': {
    speaker: 'narrator', effects: DONE, choices: go(HOST),
    text: 'The roll is called. Not every hall answered, and the gaps in the yard where their fires should be are very plain. But there are enough. Perhaps. If nothing goes wrong tonight.',
  },
  'tally-few': {
    speaker: 'narrator', mood: 'sad', effects: DONE, choices: go(HOST),
    text: 'The roll is called, and it does not take long. The yard of Cinderhold is mostly empty snow, and the few fires burning in it look very small. Whatever is coming up the Hald tonight is coming to a city that will have to stand mostly alone.',
  },

  // ----- the hosts’ last word
  'close-hesta': {
    speaker: HESTA,
    text: 'Well. That’s what you’ve made. (She rolls up the list and taps it once against your chest.) It’s yours: every name on it, and every name that isn’t. Up to the walls with you. I’ll be the one wheezing behind.',
  },
  'close-anselm': {
    speaker: ANSELM,
    text: 'When I was a boy we lit the lamps at dawn on Lanternmass and sang that the dark was only the long breath before the light. I should very much like to sing that again tomorrow. (He caps the ink.) Let us go and earn it.',
  },
  'close-maren': {
    speaker: MAREN,
    text: '(She cuts the last notch and pushes the stick into her belt.) Hesta should be here. She’d have something rude to say. I haven’t got anything rude. Only: don’t die. Come on.',
  },
};

// ---------- the night on the walls (flavour; opened on entering stage `walls`, reopenable from Ser Bryce)
const step = (x: string): Branch[] => [{ to: x, when: f(`act3.ally.${x}`) }, { to: `${x}-no`, when: not(f(`act3.ally.${x}`)) }];

const dialogues: DialogueDef[] = [
  {
    id: 'dialogue:ch7-muster', name: 'Siege of Haldren: The muster at Cinderhold',
    entries: [
      { when: f('act3.muster_done'), node: 'after' },
      { when: hestaHost, node: 'hesta' },
      { when: anselmHost, node: 'anselm' },
      { node: 'maren' },
    ],
    nodes: musterNodes,
  },
  {
    id: 'dialogue:ch7-walls', name: 'Siege of Haldren: The night on the walls',
    entries: [{ node: 'open' }],
    nodes: {
      open: {
        speaker: 'narrator', choices: go(step('thornwise')),
        text: 'Night on the walls of Haldren. Below the South Gate the plain is white, and moving: the Hollowed in their thousands, walking in silence over the frozen fields with black water running from their eyes, and before them the drowned knights of Varn on horses that do not breathe. Somewhere out in the dark the Choir is singing. The city has hung a lantern on every merlon, unlit. Nobody has had the heart to light them.',
      },
      thornwise: {
        speaker: 'narrator', choices: go(step('orrun')),
        text: 'The thornbows sing first. From the towers the Thornwise loose in long, unhurried volleys, and where the wardwood arrows fall the black water steams out of the Hollowed and they lie down in the snow like tired children. Under the bowstrings the singers keep up a low, old tune that makes the drowned knights’ horses balk.',
      },
      'thornwise-no': {
        speaker: 'narrator', mood: 'afraid', choices: go(step('orrun')),
        text: 'The archers on the towers are bakers and tanners with fowling bows, and they are frightened. Their arrows go into the tide and are gone. Where the Thornwise should be, there is only the wind.',
      },
      orrun: {
        speaker: 'narrator', choices: go(step('hrothi')),
        text: 'At the gate the Orrun lock their shields across the breach where the old masonry has cracked, and when the first mirebeast hits that wall of true-iron it simply stops. “Korr nagh.” The hammers rise and fall like a forge at work.',
      },
      'orrun-no': {
        speaker: 'narrator', mood: 'afraid', choices: go(step('hrothi')),
        text: 'The cracked masonry at the gate is shored up with cartwheels and church pews. There is no wall of true-iron behind it. When the mirebeast strikes, the whole gatehouse shudders, and men fall from the walk into the dark.',
      },
      hrothi: {
        speaker: 'narrator', choices: go(step('salt')),
        text: 'Down on the Hald the longships come out of the night with their oars beating. The Hrothi go over the sides onto the Hollowed rafts with axes, roaring for Calun, and the black barges that were drifting toward the river wall go spinning off down the current.',
      },
      'hrothi-no': {
        speaker: 'narrator', mood: 'afraid', choices: go(step('salt')),
        text: 'Out on the Hald, black barges crowded with Hollowed drift down toward the river wall, and nothing on the water moves to stop them.',
      },
      salt: {
        speaker: 'narrator', choices: go(step('qasiri')),
        text: 'Then the fire-ships. Kestrel’s galleys cut the tow-ropes upstream, and the pitch-hulks come down the Hald one after another, each a moving hill of flame. Where they strike the barges the river itself seems to burn. On the plain, the Hollowed turn their faces toward the light like flowers.',
      },
      'salt-no': {
        speaker: 'narrator', choices: go(step('qasiri')),
        text: 'No fire comes down the river. The Hald is dark from bank to bank, and the dark is crowded.',
      },
      qasiri: {
        speaker: 'narrator', choices: go(step('creed')),
        text: 'From the postern the Qasiri ride out. Their glass-blades come out of the felt with a sound like breaking bells, and they go into the flank of the tide at the gallop: cutting, wheeling, cutting again, the black glass of their scale red in the light of the burning river.',
      },
      'qasiri-no': {
        speaker: 'narrator', choices: go(step('creed')),
        text: 'There is no one to ride out of the postern. The flank of the tide rolls up against the walls unbroken.',
      },
      creed: {
        speaker: 'narrator', choices: go(step('church')),
        text: 'On the east wall the Ashen Creed stand in a line with their hands open, and the air in front of them catches fire: unlicensed flame, forbidden flame, rolling down on the drowned knights in a red sheet. Three paces off a Brother of the Wick watches it and does not move to stop it. Then, very slowly, he hands the nearest of them his water-skin.',
      },
      'creed-no': {
        speaker: 'narrator', choices: go(step('church')),
        text: 'On the east wall there is no fire but the braziers. The drowned knights ride right up to the stones.',
      },
      church: {
        speaker: 'narrator', next: 'close',
        text: 'And all along the walls the Lightsworn stand in white with their Radiance burning, a thin gold line in the dark from the river to the South Gate. Where the Hollowed climb, the light finds them. Where the light finds them, they let go.',
      },
      'church-no': {
        speaker: 'narrator', mood: 'sad', next: 'close',
        text: 'There are no Lightsworn on the walls. The priests of Haldren are on their knees in the cathedral, and the light they are praying for does not come.',
      },
      close: {
        speaker: 'narrator',
        text: 'It is going to be a long night. The gate is still yours, for now. Below the walls a drowned knight lowers his lance, and comes on.',
      },
    },
  },
];

export default dialogues;
