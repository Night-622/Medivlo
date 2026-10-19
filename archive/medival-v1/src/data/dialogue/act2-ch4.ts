/** Dialogue: Act II Ch4, quest:the-summons (docs/lore/11-act2-spec.md). Valcastre and Sister Ilse are in act2-ch4b.ts. Owner: Claude 4. */
import type { DialogueDef } from '@/core';

const f = (flag: string) => ({ flag });
const eq = (flag: string, value: string) => ({ flag, op: '==' as const, value });
const AU = 'npc:hierophant-aurelian' as const, V = 'npc:castor-vellane' as const;
const SA = 'npc:sable' as const;
const LANT = 'faction:lanternate' as const;

const stance = (value: 'pledged' | 'neutral' | 'defiant') => ({ setFlag: 'act2.church_stance', value });

const dialogues: DialogueDef[] = [
  // ---------------------------------------------------------------- the Wick's tollgate
  {
    id: 'dialogue:ch4-tollgate', name: 'Tollgate: The Pilgrim’s Road',
    entries: [{ when: f('act2.tollgate_passed'), node: 'again' }, { node: 'start' }],
    nodes: {
      again: { speaker: 'narrator', text: 'The Brother-Sergeant at the tollgate sees your face, and waves you through without looking up from his book.' },
      start: {
        speaker: 'narrator',
        text: 'Where the Pilgrim’s Road crosses into the Lantern Coast, the Order of the Wick has built a gate of white stone across it, and hung the wick-scissors over the arch. Pilgrims kneel in the slush before a trestle table, holding out their bare hands to be looked at. Beside it a brazier burns tallow, and the smoke smells of mutton.',
        next: 'sergeant',
      },
      sergeant: {
        speaker: 'narrator',
        text: 'The Brother-Sergeant is a heavy Solenni with chilblains on his knuckles. He takes the letter in its white wax, reads the seal before he reads the words, and then reads the words twice. His lips move. Then he looks up at you very differently.',
        choices: [
          { text: '[Wait while he reads]', to: 'r-wick', when: eq('act1.ruler', 'wick') },
          { text: '[Wait while he reads]', to: 'r-aldith', when: eq('act1.ruler', 'aldith') },
          { text: '[Wait while he reads]', to: 'r-harrow', when: { all: [{ not: eq('act1.ruler', 'wick') }, { not: eq('act1.ruler', 'aldith') }] } },
        ],
      },
      'r-wick': {
        speaker: 'narrator',
        text: '"The Ashmarked," he says. "Who gave the Haldmarch into the Order’s keeping." He stands and bows, and one of the kneeling pilgrims, a Haldish woman with a child on her hip, turns her head and spits in the snow. The sergeant does not see it, or chooses not to.',
        next: 'hale',
      },
      'r-aldith': {
        speaker: 'narrator',
        text: '"The Queen’s champion." He does not quite sneer. "Your little queen sent the Order’s clerks home from Haldren in a hay-cart, with their tables tied on top. The Lord-Inquisitor laughed when he heard. I have never heard him laugh before. I did not like it."',
        next: 'hale',
      },
      'r-harrow': {
        speaker: 'narrator',
        text: '"There was a letter before you. Lord Harrow’s seal. He commends the Ashmarked to the Lord-Inquisitor’s care." The sergeant taps the word. "Commends. That is a northern word, I think, for something else."',
        next: 'hale',
      },
      hale: {
        speaker: 'narrator',
        text: 'He opens a ledger as thick as a kneeling-stool and finds your page without searching for it. It has been looked at often. The corner is soft.',
        choices: [
          { text: '[Let him read]', to: 'h-defied', when: eq('prologue.hale_outcome', 'defied') },
          { text: '[Let him read]', to: 'h-deceived', when: eq('prologue.hale_outcome', 'deceived') },
          { text: '[Let him read]', to: 'h-persuaded', when: eq('prologue.hale_outcome', 'persuaded') },
          {
            text: '[Let him read]', to: 'h-submitted',
            when: { all: [{ not: eq('prologue.hale_outcome', 'defied') }, { not: eq('prologue.hale_outcome', 'deceived') }, { not: eq('prologue.hale_outcome', 'persuaded') }] },
          },
        ],
      },
      'h-defied': {
        speaker: 'narrator', mood: 'angry',
        text: '"Brindlecross. Drew steel upon an Inquisitor of the Order in the lawful discharge of his office." The words are written in red. "If it were my choosing you would go down to Valcastre in irons, summons or no. It is not my choosing." He says it as though it were a wound.',
        next: 'hand',
      },
      'h-deceived': {
        speaker: 'narrator',
        text: '"Brindlecross. Produced a Wick-licence under the name of Prior Benedek of Haldren." He turns the page. Pinned to it is a letter in a trembling hand, three pages long. "The Prior has written to deny it. At length. With apologies. He seems a frightened man."',
        next: 'hand',
      },
      'h-persuaded': {
        speaker: 'narrator',
        text: '"Brindlecross. Tested, and found marked, but not Drowned." Beneath it, in a heavy soldier’s hand: "Talks well. Trust nothing it says and watch everything it does. G. Hale." The sergeant grunts. "Good advice, that."',
        next: 'hand',
      },
      'h-submitted': {
        speaker: 'narrator',
        text: '"Brindlecross. Submitted to the test of the Last Wick, and was found marked." Beneath, in a tidier and colder hand that you have seen before: "Not to be harmed. To be brought to me. C.V."',
        next: 'hand',
      },
      hand: {
        speaker: 'narrator',
        text: '"The summons covers you," he says. "But it is the rule of this gate that every hand is seen, and I will not break the rule for you, Ashmarked, nor for the Hierophant himself. Glove."',
        choices: [
          { text: '(Take off the glove and lay your hand on the table.)', to: 'bare', effects: [{ setFlag: 'act2.tollgate_method', value: 'shown' }] },
          { text: '[Oathbound] (Lay the Lightsworn sign over the scar.) "Brother. We serve the same Light."', to: 'oath', when: { classIs: 'class:oathbound' }, tag: 'class', effects: [{ setFlag: 'act2.tollgate_method', value: 'oath' }] },
          { text: '[Noble-born] "You will not make a guest of the Lord-Inquisitor undress in the road."', to: 'noble', when: { dialogueTag: 'noble-born' }, tag: 'trait', effects: [{ setFlag: 'act2.tollgate_method', value: 'noble' }] },
          { text: '[Will 15] "Read the summons again. ‘With all such Embers as the bearer may hold.’ Do you want to be the man who delayed them?"', to: 'cow', once: true, tag: 'intimidate', check: { stat: 'will', dc: 15, failTo: 'cow-fail' } },
        ],
      },
      bare: {
        speaker: 'narrator',
        text: 'The scar is warm in the cold air, and the snow on the table steams away from it in a ring. The pilgrims nearest you make the sign of the Lantern. The sergeant looks at it a long time, and when he looks up his face has changed again: not fear. Something nearer hunger. "So that is what it looks like," he says. "Ithren keep us."',
        next: 'companions',
      },
      oath: {
        speaker: 'narrator',
        text: 'He looks at the sign, and at you, and something in his shoulders loosens. "Brother," he says, and touches his own breast. "It is a hard year to be Lightsworn. Go up to the city. Pray at the Brand, if you can bear to."',
        next: 'companions',
      },
      noble: { speaker: 'narrator', text: 'He opens his mouth, and closes it, and calculates the distance between a tollgate sergeant and the Lord-Inquisitor’s displeasure. "Pass," he says. "Pass, my lord."', next: 'companions' },
      cow: {
        speaker: 'narrator', effects: [{ setFlag: 'act2.tollgate_method', value: 'cowed' }],
        text: 'He reads it again. You watch him reach the word Embers, and stop. He closes the ledger very gently, as though something in it might wake. "Pass," he says. "And may the Light go with you, since I will not."',
        next: 'companions',
      },
      'cow-fail': {
        speaker: 'narrator', effects: [{ setFlag: 'act2.tollgate_method', value: 'shown' }],
        text: '"I can read, friend. That is why they gave me this gate." He waits, perfectly patient, until you take off the glove. He studies the scar for a long time, writes a line in his book, and blots it.',
        next: 'companions',
      },
      companions: {
        speaker: 'narrator',
        text: 'He turns his eyes to whoever is travelling with you.',
        choices: [
          { text: '[Sable stands very still beside you]', to: 'sable', when: f('companion.sable.following') },
          { text: '[Walk on]', to: 'through', when: { not: f('companion.sable.following') } },
        ],
      },
      sable: {
        speaker: 'narrator',
        text: 'The sergeant leans close to Sable and peers into her face. She smiles at him brightly. Something dark is gathering at the corner of her left eye, and she has not noticed it yet.',
        choices: [
          { text: '[Will 15] "She travels under my summons, brother. Do you mean to explain to the Lord-Inquisitor why his guest was kept waiting?"', to: 'sable-saved', once: true, tag: 'persuade', check: { stat: 'will', dc: 15, failTo: 'sable-sneeze' } },
          { text: '[Shade] (Make the Quiet Hand’s sign at your hip: two fingers folded, thumb across.)', to: 'sable-sneeze', when: { classIs: 'class:shade' }, tag: 'class' },
          { text: '(Step between them.)', to: 'sable-sneeze' },
        ],
      },
      'sable-saved': {
        speaker: SA, effects: [{ loyalty: SA, delta: 5 }],
        text: '(The sergeant straightens and waves you both on. A hundred yards up the road Sable wipes her eye with the back of her glove, quickly, and laughs too loudly.) Oof. He had breath like a tannery. Thank you. I mean it. Don’t look at me.',
        next: 'through',
      },
      'sable-sneeze': {
        speaker: 'narrator',
        text: 'Sable sneezes, tremendously, all over the sergeant’s ledger. In the apologising and the mopping and the swearing that follows she somehow ends up on the far side of the gate, waving. When you catch her up, her eyes are dry and her sleeve is not.',
        next: 'through',
      },
      through: {
        speaker: 'narrator', effects: [{ setFlag: 'act2.tollgate_passed', value: true }, { unlockLore: 'lore:the-wick-edict' }],
        text: 'Beyond the tollgate the Pilgrim’s Road climbs south between terraced hills. It should be green here even in winter. It is white. Far off, on its headland above the sea, a city of white stone stands under a sky the colour of ash, and none of its towers is lit.',
      },
    },
  },
  // ---------------------------------------------------------------- the gate of Solenne
  {
    id: 'dialogue:ch4-solenne-gate', name: 'Solenne: The Holy City in Snow',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'narrator',
        text: 'Snow lies on the vineyards of Solenne. It lies on the vines in their rows, on the pruned black stocks and the wires between them, on the roofs of the presses, and the vintners stand in it as men stand at a graveside. No one living has seen snow on the Lantern Coast. The old ones say their grandmothers never did.',
        next: 'gate',
      },
      gate: {
        speaker: 'narrator',
        text: 'Under the great gate of Solenne a thousand pilgrims are on their knees. They have come from every corner of the Empire to see the Brand, and the Brand is dead, and they have come anyway. Some are praying. Some are only kneeling, as if they have forgotten the words. The bells of the city are silent. Someone has tied black ribbon to the gilded lanterns over the arch.',
        choices: [
          { text: '(Speak to a woman kneeling with a lantern in her lap.)', to: 'mother', once: true },
          { text: '(Watch the procession coming down from the cathedral.)', to: 'flagellants', once: true },
          { text: '(Speak to a vintner brushing snow from his vines.)', to: 'vintner', once: true },
          { text: '[Devout] (Kneel with the pilgrims and say the evening office.)', to: 'devout', when: { dialogueTag: 'devout' }, tag: 'trait', once: true },
          { text: '(Go up into the city.)', to: 'up' },
        ],
      },
      mother: {
        speaker: 'narrator', mood: 'sad',
        text: '"I carried it from Aurevine," she says. The lantern in her lap is the kind every parish sends to Solenne to be lit from the Brand, and it is cold. "Forty leagues. My husband said there was no point. I said there must be." She looks at you, and her eyes are very bright. "Will it come back? The light? You have the look of someone who would know."',
        next: 'gate',
      },
      flagellants: {
        speaker: 'narrator',
        text: 'Down the white steps of the Via Lucis comes a procession of penitents, bare-backed in the snow, scourging one another with knotted cords and chanting the Confiteor of the Seventh Light. Their blood is very red on the white. A Wick brother walks beside them, counting the strokes on his fingers, and a crowd parts to let them by in perfect silence.',
        next: 'gate',
      },
      vintner: {
        speaker: 'narrator',
        text: '"Three hundred years these vines have been in my family," says the vintner, without looking up. "There was frost once, in my grandfather’s time, and he wrote it in the cellar-book like a death. Now look." He brushes a stock clean, and the snow falls back on it. "The priests say it is our sin. I have tried to think what we did. I cannot think of anything big enough."',
        next: 'gate',
      },
      devout: {
        speaker: 'narrator', effects: [{ unlockLore: 'lore:ithren-the-lantern' }],
        text: 'You kneel, and the words come up out of you as they did when you were a child: Lux manet. Ignis Ithreni, tenebra cedit. One by one the pilgrims around you take them up, until a hundred voices are saying the office in the snow. It does not warm anything. It is not meant to.',
        next: 'gate',
      },
      up: {
        speaker: 'narrator',
        text: 'You climb into Solenne. Every street in the holy city runs uphill to the same place, as the spokes of a wheel run to the hub: the Cathedral of the Brand, vast and white and gold, and dark in every window.',
      },
    },
  },
  // ---------------------------------------------------------------- the dead Brand (obj:dead-brand)
  {
    id: 'dialogue:obj-dead-brand', name: 'Object: the dead Brand',
    entries: [{ when: f('act2.brand_seen'), node: 'again' }, { node: 'start' }],
    nodes: {
      again: {
        speaker: 'narrator',
        text: 'The husk of the Brand hangs in the cracked crystal of the Great Lantern above the altar. Candles burn round it in their hundreds, and none of their light goes in. The Ashmark aches when you look at it, the way a tooth aches in the cold.',
      },
      start: {
        speaker: 'narrator',
        effects: [{ setFlag: 'act2.brand_seen', value: true }, { unlockLore: 'lore:cathedral-of-the-brand' }, { unlockLore: 'lore:saint-solenne' }],
        text: 'The nave of the Cathedral of the Brand is so long that the far end is lost in candle-smoke. At its heart, above the high altar, the Great Lantern hangs from a chain of gold: a vessel of crystal as tall as a man. For eleven hundred and eighty-six years the Brand burned in it, and the whole of the Lantern Coast was lit from that one coal.',
        next: 'husk',
      },
      husk: {
        speaker: 'narrator', effects: [{ unlockLore: 'lore:cathedral-of-the-brand', section: 'husk' }],
        text: 'It is there still, behind crystal cracked from top to bottom: a black husk the size of a fist, split down the middle and crusted with a pale rime that is not frost and not salt. Pilgrims have heaped candles round the foot of the Lantern until the altar is a hill of wax. A Wick sentry stands beside it, very still. It looks like what it is: something that was alive, and has been left lying in state.',
        next: 'ache',
      },
      ache: {
        speaker: 'narrator',
        text: 'Then the Ashmark aches, sudden and deep, and in your hand and in your pack the two Embers you carry begin to hum. It is not a sound. It is the feeling of a voice in the next room, saying a name you almost know. They know the husk. They were part of it once, and they are calling to the place where they were broken off.',
        choices: [
          { text: '(Reach up and lay your marked hand against the crystal.)', to: 'touch' },
          { text: '[Arcanist] (Close your eyes and feel for the ley beneath the cathedral floor.)', to: 'arcanist', when: { classIs: 'class:arcanist' }, tag: 'class' },
          { text: '[Oathbound] (Kneel in the Lightsworn’s vigil before the altar.)', to: 'oathbound', when: { classIs: 'class:oathbound' }, tag: 'class' },
          { text: '[Reaver] (Let the old hunger in your blood answer the husk.)', to: 'reaver', when: { classIs: 'class:reaver' }, tag: 'class' },
          { text: '[Hollow-touched] (Listen. There is something under the hum.)', to: 'hollow', when: { dialogueTag: 'hollow-touched' }, tag: 'trait' },
          { text: '(Step back from it.)', to: 'leave', tag: 'leave' },
        ],
      },
      arcanist: {
        speaker: 'narrator',
        text: 'The cathedral stands on a ley-knot, seven veins meeting under the altar like the spokes of a wheel. Every apprentice is taught it. You reach for it and find almost nothing: a warmth no greater than a hand on a cold window. The Brand did not only light the Lantern Coast. It hid how cold the ground beneath it had become.',
        next: 'touch',
      },
      oathbound: {
        speaker: 'narrator', effects: [{ unlockLore: 'lore:ithren-the-lantern', section: 'silence' }],
        text: 'You kneel where every Lightsworn has knelt on the night before their oath, and say the words you said then. For the first time in your life they go up into nothing. There is no warmth on your face, no answer. Only the husk, and the candle-smoke, and the cold. You find your hands are shaking. You finish the vigil anyway.',
        next: 'touch',
      },
      reaver: {
        speaker: 'narrator', mood: 'hollow',
        text: 'Your blood answers before you ask it to. Warmth goes out of you toward the Lantern in a thin, eager thread, the way warmth goes out of a body into a cold stone, and the husk drinks it. For one moment the crack glows dull red. Then you tear yourself away, dizzy, and the red is gone. It was hungry. It is still hungry.',
        next: 'touch',
      },
      hollow: {
        speaker: 'narrator', mood: 'hollow',
        text: 'Under the hum, so faint you could believe you imagined it: water. A slow drip, inside the stone, as though the black water that killed it has never quite drained out. Drip. Drip. It is keeping time. You do not want to know what it is counting toward.',
        next: 'touch',
      },
      touch: {
        speaker: 'narrator',
        text: 'Your palm meets the crystal, and the crystal is cold, and then it isn’t. Deep in the crack of the husk, for one heartbeat, something glows, and the sentry draws in his breath. The Embers in you pull toward the husk like iron toward a lodestone, and the cathedral goes away.',
        next: 'v1',
      },
      v1: {
        speaker: 'narrator',
        text: 'Lanternmass, a year ago. The nave is full of light, all of it from the Brand, red-gold and steady. The cathedral is empty but for one figure in Lightsworn white, walking barefoot up the nave with a silver ewer held in both hands. The ewer is full of something black, and it is not spilling, though her hands are shaking.',
        next: 'v2',
      },
      v2: {
        speaker: 'npc:ysolde', mood: 'sad',
        text: 'Forgive me. Oh, forgive me. You have been so tired, for so long, and they would not let you rest. (She lifts the ewer.) I will make it gentle. I promise. I will make it gentle for everyone.',
        choices: [
          { text: '[Will 15] Hold on to the vision. Look past her, at the doors.', to: 'v3', once: true, check: { stat: 'will', dc: 15, failTo: 'wake' } },
          { text: '[Let go]', to: 'wake' },
        ],
      },
      v3: {
        speaker: 'narrator', effects: [{ setFlag: 'act2.brand_vision_full', value: true }],
        text: 'Behind her, at the far end of the nave, the great doors stand a hand’s breadth open, and snow is blowing in. Someone is holding one of them. You see only a grey sleeve, and a hand on the bronze: a slender hand, wet to the wrist, dripping on the threshold as though it had just come up out of water.',
        next: 'wake',
      },
      wake: {
        speaker: 'narrator',
        effects: [{ unlockLore: 'lore:the-brand' }],
        text: 'The black water pours over the Brand, and the light screams, and breaks into seven, and you are standing in the nave with your hand on cold crystal, and the sentry is staring at you. The Embers have gone quiet. The Ashmark has not. Somewhere above, a brother of the cathedral says your name, and that the Hierophant will see you now.',
      },
      leave: { speaker: 'narrator', text: 'You step back. The hum fades, slowly, the way a bell fades. A brother of the cathedral has been waiting at a respectful distance, and now he coughs, and tells you that the Hierophant will see you in his court.' },
    },
  },
  // ---------------------------------------------------------------- Hierophant Aurelian
  {
    id: 'dialogue:aurelian-audience', name: 'Aurelian: The Hierophant’s court',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'narrator',
        text: 'The Hierophant’s court is a hall of white marble and old gold, and it is very cold. Snow has drifted against the high windows. The braziers burn wood now, and smoke. On a throne carved for a larger man sits a very old one, wrapped in furs to the chin, and when you enter he gets up, slowly, and comes down the steps to meet you himself. No Hierophant does that. The clerks at the walls pretend not to see it.',
        next: 'greet',
      },
      greet: {
        speaker: AU, mood: 'afraid',
        text: 'You have seen it. Yes. I can see that you have. (He takes your hand in both of his, gloved and gloved. His are trembling.) I go down and look at it every night, after Compline. As one goes in to look at a sick child. To be sure. It is always still dead. I am always surprised.',
        next: 'hub',
      },
      hub: {
        speaker: AU,
        text: 'Forgive me. Castor will be here presently, and he will want what he wants, and I will let him have it. I always do. But for a little while it is only us, and an old man may ask a guest to sit by the fire.',
        choices: [
          { text: '"You knew Ysolde."', to: 'ysolde', once: true },
          { text: '"What does the Lord-Inquisitor want with me?"', to: 'vellane', once: true },
          { text: '"The Emberwardens sent reports to Solenne before 1041. The leys were cooling."', to: 'reports', once: true, when: f('act1.reports_known') },
          { text: '"Your Order holds every gate in the Haldmarch now."', to: 'wick', once: true, when: eq('act1.ruler', 'wick') },
          { text: '"Queen Aldith sends her greeting, Holiness."', to: 'aldith', once: true, when: eq('act1.ruler', 'aldith') },
          { text: '"Lord Harrow rules the Haldmarch now, in all but name."', to: 'harrow', once: true, when: eq('act1.ruler', 'harrow') },
          { text: '"Hesta Corrow is dead. The last Emberwarden. She fell at Varn."', to: 'hesta-dead', once: true, when: { not: f('act1.hesta_alive') } },
          { text: '"Hesta Corrow is alive. The Emberwarden your Order burned at Valcastre."', to: 'hesta-alive', once: true, when: f('act1.hesta_alive') },
          { text: '"There are people in the cells at Valcastre who have done nothing but be marked."', to: 'mercy', once: true },
          { text: '"I’m ready to face the Lord-Inquisitor."', to: 'end' },
        ],
      },
      ysolde: {
        speaker: AU, mood: 'sad',
        text: 'Knew her. I made her. I canonised her in her own lifetime, against all custom, because the Grey Lung was over and the people wanted a saint and I wanted to give them one. Then I gave her the Brand to keep. I thought: who better? A healer. A girl with warm hands. (Quietly.) I was in the cathedral that night. I had come down to pray. I saw her at the altar, and I did not cry out. I have never told Castor that.',
        next: 'ysolde2',
      },
      ysolde2: {
        speaker: AU, mood: 'afraid',
        text: 'She came to me, you know, the winter before she went away. She said the Brand was cooling. She said it was not sin, that it was only old, and I told her to pray, and to say nothing to anyone. I told her to say nothing. (His hands tighten on the fur.) Every night I wonder whether she would have stayed, if I had only listened.',
        choices: [
          { text: '"It isn’t your fault, Holiness."', to: 'comfort', effects: [{ setFlag: 'npc.hierophant-aurelian.comforted', value: true }] },
          { text: '"No. You should have listened."', to: 'blame' },
        ],
      },
      comfort: { speaker: AU, mood: 'sad', text: 'You are kind. You are kind and you are wrong, and I am very grateful for both. (He pats your hand.) Old men are rarely told either.', next: 'hub' },
      blame: { speaker: AU, mood: 'sad', text: 'Yes. (He does not argue.) Yes. Thank you. Everyone else in this palace tells me otherwise, and I have stopped believing any of them.', next: 'hub' },
      vellane: {
        speaker: AU, mood: 'afraid',
        text: 'The Embers. Castor wants them all, and your hand with them if it can be got, and he will tell you so with perfect courtesy. He means to forge a new Brand that only the Order can tend, and put a counted lamp in every house in Morvane. He is the cleverest man I have ever known. He is not cruel. I wish he were. One can hate a cruel man in comfort.',
        next: 'hub',
      },
      reports: {
        speaker: AU,
        text: '(He goes very still.) …Who told you that? No, do not say. (He speaks quickly, as a man speaks who has decided to before he can decide not to.) There are chests beneath this cathedral that have been sealed for a century and a half, with the same red wax the Wick carried down from Cinderhold. I broke the seal last winter, by night, and had it made again before morning. I read what is in them. I wish I had not.',
        next: 'reports2',
      },
      reports2: {
        speaker: AU, mood: 'sad', effects: [{ setFlag: 'act2.aurelian_reports_admitted', value: true }, { unlockLore: 'lore:hierophant-aurelian', section: 'undercroft' }],
        text: 'Two hundred years of figures, from every hall the Wardens kept. Every year a little colder. And the Church burned the men who wrote them, so that no one would have to read them aloud. I wish my predecessors had read them. I wish I had been born in some other century. I have the key still. I have never been brave enough to give it to anyone.',
        next: 'hub',
      },
      wick: {
        speaker: AU, mood: 'sad',
        text: 'Yes. I signed it. Castor brought me the paper and I signed it, because the Haldish were starving and drowning and he said order would feed them. Perhaps it will. (He looks at the snow.) I have had letters from Haldish priests since. I have not answered them. I do not know what I would say.',
        next: 'hub',
      },
      aldith: {
        speaker: AU, mood: 'happy',
        text: 'Does she! She wrote to me in her own hand, you know, when she was crowned. A child’s hand, very careful. She wrote that the Lord-Inquisitor’s clerks were no longer welcome at her gates, and asked my blessing for it. I wrote back that I agreed with every word. (A pause.) I did not send it. But I agreed.',
        next: 'hub',
      },
      harrow: {
        speaker: AU,
        text: 'Lord Harrow writes to Castor every week. Castor reads the letters aloud to me, and smiles. I think Lord Harrow believes he is the cleverest man in the north. I think Castor believes it too, and is simply waiting to see where it gets him.',
        next: 'hub',
      },
      'hesta-dead': {
        speaker: AU, mood: 'sad',
        text: 'Corrow. (He closes his eyes.) The Order told me she burned at Valcastre, before ever I wore this ring. I said a mass for her. I suppose I must say another, and mean it this time. She taught Ysolde, did she not? Two women I failed, then. I keep a list.',
        next: 'hub',
      },
      'hesta-alive': {
        speaker: AU,
        text: 'Alive. (He laughs, a small dry startled sound.) The Order told me she burned at Valcastre, before ever I wore this ring. They tell me a great many things. I said a mass for her. I shall have to ask for it back. …Tell her, if you see her, that I am sorry. She will not care. Tell her anyway.',
        next: 'hub',
      },
      mercy: {
        speaker: AU, mood: 'afraid',
        text: 'Valcastre is the Order’s. Castor would say: a man with a fever is not punished for the fever, but he is kept from the well. (He twists his ring.) I am the Hierophant. I could write a mercy. I have written three. I have not sealed any of them.',
        choices: [
          { text: '[Will 15] "Then seal one. You are the Lantern’s voice, not his. Let them hear it once before the end."', to: 'mercy-yes', once: true, tag: 'persuade', check: { stat: 'will', dc: 15, failTo: 'mercy-fail' } },
          { text: '[Devout] "Saela’s mercy is older than Ithren’s law, Holiness. Even the Canticle says so."', to: 'mercy-yes', when: { dialogueTag: 'devout' }, tag: 'trait' },
          { text: '[Oathbound] "I swore to keep the flock, Holiness. Not to cage it."', to: 'mercy-yes', when: { classIs: 'class:oathbound' }, tag: 'class' },
          { text: '"You’ve read the Wardens’ figures. You know the marked didn’t cause this."', to: 'mercy-yes', when: f('act2.aurelian_reports_admitted') },
          { text: '"Forget I asked."', to: 'hub' },
        ],
      },
      'mercy-yes': {
        speaker: AU, mood: 'sad', effects: [{ setFlag: 'act2.aurelian_mercy', value: true }, { reputation: LANT, delta: 5 }, { unlockLore: 'lore:the-hierophancy', section: 'split' }],
        text: '(For a long time he says nothing. Then he takes off his ring, the great seal of the Lantern, and looks at it as if he had never seen it before.) …One. I will seal one. Castor will be very gentle with me about it. That is how I shall know it mattered.',
        next: 'hub',
      },
      'mercy-fail': { speaker: AU, mood: 'afraid', text: 'I cannot. You do not understand, he would only, he is so… (He stops.) I am sorry. I am an old man and I am frightened, and I have been frightened for so long that I have forgotten how to be anything else.', next: 'hub' },
      end: {
        speaker: 'narrator',
        text: 'The doors at the end of the hall open without a herald. A man in Wick white walks in out of the snow, and the clerks at the walls bow lower than they bowed for the Hierophant. The old man lets go of your hand. “Castor,” he says, and his voice is quite steady, and his hands are not.',
      },
    },
  },
  // ---------------------------------------------------------------- the Lord-Inquisitor's demand
  {
    id: 'dialogue:vellane-summons', name: 'Vellane: The summons',
    entries: [{ when: f('act2.church_stance'), node: 'after' }, { node: 'start' }],
    nodes: {
      after: { speaker: V, text: 'You have given me your answer, and I have written it down. Go and find the Embers. I shall know where you are.' },
      start: {
        speaker: V,
        text: 'You came. (He sounds genuinely pleased.) Most people in your position run. It is a great comfort to me when they do not. Castor Vellane. I serve the Order of the Wick, which serves the Hierophant, which serves the Light. Sit, please. Holiness, you will forgive us.',
        next: 'file',
      },
      file: {
        speaker: 'narrator',
        text: 'He has a slim leather file under his arm. He does not open it. He does not need to.',
        choices: [
          { text: '[Let him speak]', to: 'f-defied', when: eq('prologue.hale_outcome', 'defied') },
          { text: '[Let him speak]', to: 'f-letgo', when: { all: [f('npc.garrick-hale.let_go'), { not: eq('prologue.hale_outcome', 'defied') }] } },
          { text: '[Let him speak]', to: 'f-plain', when: { all: [{ not: f('npc.garrick-hale.let_go') }, { not: eq('prologue.hale_outcome', 'defied') }] } },
        ],
      },
      'f-defied': {
        speaker: V,
        text: 'You put steel to one of my inquisitors at Brindlecross. Garrick Hale. He has a scar he is not proud of, and a report he rewrote four times. I have read it more often than that. I admire economy, and you were very economical with him.',
        next: 'ruler',
      },
      'f-letgo': {
        speaker: V,
        text: 'Garrick Hale wrote to me that you were lost in the snow at Wennamere and presumed dead. He is a good man and a very poor liar. I wrote “no” in the margin. I have not punished him; I have given him the lower cells at Valcastre, which he believes is a punishment. It is a kindness. He was a boy there. And I wanted to see what you would do with the time he bought you. You did a great deal.',
        next: 'ruler',
      },
      'f-plain': {
        speaker: V,
        text: 'Brindlecross. A pyre that lit itself. A drowned abbey. An Ember fused into a living hand, which none of my scholars believed possible until I made them write it down. You have been the most interesting page in my file for a year.',
        next: 'ruler',
      },
      ruler: {
        speaker: V,
        text: '(He sets the file down.) And then the Haldmarch.',
        choices: [
          { text: '[Listen]', to: 'r-wick', when: eq('act1.ruler', 'wick') },
          { text: '[Listen]', to: 'r-aldith', when: eq('act1.ruler', 'aldith') },
          { text: '[Listen]', to: 'r-harrow', when: { all: [{ not: eq('act1.ruler', 'wick') }, { not: eq('act1.ruler', 'aldith') }] } },
        ],
      },
      'r-wick': {
        speaker: V, mood: 'happy',
        text: 'You gave it to me. I want you to know that I understand what that cost you, and that it was the right choice, and that I am grateful. The Haldish hate me for it. Their children will be alive to hate me. I find I can bear that.',
        next: 'demand',
      },
      'r-aldith': {
        speaker: V,
        text: 'You gave it to a child. A clever, honest child who sent my clerks home in a hay-cart. I laughed when I heard; the Holiness will tell you I laughed. It was well done. It was also a mistake, and the Haldish will pay for it, and I shall try very hard to see that they do not pay too much.',
        next: 'demand',
      },
      'r-harrow': {
        speaker: V,
        text: 'You gave it to Osric Harrow, who has written to me every week since to explain how useful he is. He treats with the Drowned Choir and he treats with me, and he thinks we do not know about each other. I keep his letters. One day I shall give them back to him, all at once.',
        next: 'demand',
      },
      demand: {
        speaker: V,
        text: 'So. To the matter. You carry two Embers: the Mere, fused into that hand, and the Fen, which I can hear humming from here if I am quiet. There are four more loose in the world and a seventh in the hands of the woman who broke them. I want them. All of them. I want them in this cathedral, in the Church’s keeping, before the next Lanternmass.',
        next: 'hub',
      },
      hub: {
        speaker: V,
        text: 'You have questions. Ask them. I would rather you chose with your eyes open; it makes the choice mean something.',
        choices: [
          { text: '"What would you do with them?"', to: 'brand', once: true },
          { text: '"Why do you blame the mages?"', to: 'blame', once: true },
          { text: '"The leys have been cooling for two hundred years. The Wardens told the Church in 1041."', to: 'cooling', once: true, when: f('act1.reports_known') },
          { text: '"Brother Anselm."', to: 'anselm', once: true, when: f('prologue.anselm_betrayed') },
          { text: '"You’ve heard about Haldren market, then."', to: 'market', once: true, when: eq('act1.market_mage', 'fought') },
          { text: '[Intellect 15] "You don’t want the Embers to save the world. You want them so that no one else can."', to: 'read', once: true, tag: 'lore', check: { stat: 'intellect', dc: 15, failTo: 'read-fail' } },
          { text: '"You’ll have my answer."', to: 'answer' },
        ],
      },
      brand: {
        speaker: V,
        text: 'Forge a new Brand. Every Ember returned to Solenne, bound together again under the Church’s hand, and a lamp lit from it in every parish in Morvane: counted, licensed, tended. No more hedge-witches drawing on leys they do not understand. No more saints with warm hands and no one watching them. (He says it gently, as a physician speaks of a cure.) A world with one fire in it, kept properly.',
        next: 'hub',
      },
      blame: {
        speaker: V,
        text: 'I do not blame mages, child. I blame unattended fire. Ysolde Maerin was a healer with more Radiance in her than any Lightsworn in a century, and she was taught in secret, by an Emberwarden, to reach for things no licence would have let her touch. Then she was given the Brand, and no one watched her. Fire left unattended. That is not a theology. It is a fact about fire.',
        next: 'hub',
      },
      cooling: {
        speaker: V,
        text: '(He looks at you with real interest, and for a moment you think he will deny it.) Of course I know. Why do you imagine I am so frightened of waste? The fire is dying. It has been dying for two centuries. If there is to be any fire left for our grandchildren, every coal of it must be counted. The Wardens wanted to tell the world. I would rather the world kept its lamps trimmed.',
        next: 'cooling2',
      },
      cooling2: { speaker: V, effects: [{ setFlag: 'act2.vellane_cooling_admitted', value: true }], text: 'You see? I have not lied to you once. I never lie when the truth will serve. It almost always serves.', next: 'hub' },
      anselm: {
        speaker: V,
        text: 'Alive, as I wrote. At Valcastre. He has been very useful; he knows more about the Emberwardens’ primer than anyone living, and he is too honest to pretend otherwise. He prays for you, did you know? Every night, I am told. For the one who gave him to us. I find it very moving.',
        next: 'hub',
      },
      market: {
        speaker: V,
        text: 'You drew steel on two of my brothers over a boy who sold string. They are recovered. The boy is not found. (He smiles.) I mention it only so that you know I know. I do not hold grudges. I hold files.',
        next: 'hub',
      },
      read: {
        speaker: V,
        text: '(For the first time he is silent for a moment.) …Yes. That is very nearly right, and I am glad someone has said it to my face. If one fire is all the world can have, then I would rather it was in one pair of hands that will not let it go out, than in a hundred pairs that will each spend a little. You think that is tyranny. I think it is housekeeping.',
        next: 'hub',
      },
      'read-fail': { speaker: V, text: 'You are trying to see the shape of me. Good. Keep trying. Most people stop at the white coat.', next: 'hub' },
      answer: {
        speaker: V,
        text: 'Then choose. I will not threaten you; it would be beneath both of us. I will only tell you that whatever you choose, I shall write it down, and remember it, and act upon it.',
        choices: [
          {
            text: '"The Church shall have them when the hunt is done. You have my word."', to: 'pledged',
            effects: [stance('pledged'), { reputation: LANT, delta: 20 }, { giveItem: 'item:wick-writ' }],
          },
          {
            text: '[Oathbound] (Kneel.) "By the Seventh Light. I am the Lantern’s sword, Lord-Inquisitor. Point me."', to: 'pledged-oath', when: { classIs: 'class:oathbound' }, tag: 'class',
            effects: [stance('pledged'), { reputation: LANT, delta: 20 }, { giveItem: 'item:wick-writ' }],
          },
          { text: '"I’ll carry them myself for now. When the hunt is done, we can talk."', to: 'neutral', effects: [stance('neutral')] },
          { text: '[Will 20] "Not pledged and not refused. Give me your papers, and watch what I do with them."', to: 'neutral-writ', once: true, tag: 'persuade', check: { stat: 'will', dc: 20, failTo: 'neutral-fail' } },
          { text: '"If you want them, Lord-Inquisitor, you will have to take them."', to: 'defiant', tag: 'aggressive', effects: [stance('defiant'), { reputation: LANT, delta: -25 }, { setFlag: 'act2.wick_hostile', value: true }] },
          { text: '(Pull off the glove, and let the Ashmark burn in his face.)', to: 'defiant-flare', tag: 'aggressive', effects: [stance('defiant'), { reputation: LANT, delta: -25 }, { setFlag: 'act2.wick_hostile', value: true }] },
        ],
      },
      pledged: {
        speaker: V, mood: 'happy',
        text: 'Thank you. (He takes a folded paper from the file, sealed with the wick-scissors, and puts it in your hand.) Wick papers. Any brother of the Order will open any door for you on the strength of that seal, and ask no questions he would regret. Bring them home to me. Welcome to the Lantern, Ashmarked.',
        next: 'close',
      },
      'pledged-oath': {
        speaker: V, mood: 'happy',
        text: 'Rise, sword. (He puts a sealed paper into your hand.) Wick papers. Any brother of the Order will open any door for you on the strength of that seal. It has been a long time since anyone knelt to me who meant it. I had forgotten it was a pleasant thing.',
        next: 'close',
      },
      neutral: {
        speaker: V,
        text: 'A polite refusal. I prefer them to the other kind. (He writes one line in the file.) You will be watched, of course. Please do not take it personally. I watch the Hierophant.',
        next: 'close',
      },
      'neutral-writ': {
        speaker: V, effects: [stance('neutral'), { giveItem: 'item:wick-writ' }],
        text: '(He considers you for a long moment, and then, to the Hierophant’s visible astonishment, laughs.) Very well. Papers, and no promise. You are gambling that I am curious, and you are right. (He hands you a sealed paper.) Do not make me regret my curiosity. I so rarely indulge it.',
        next: 'close',
      },
      'neutral-fail': {
        speaker: V, effects: [stance('neutral')],
        text: 'No. Papers are for those who have chosen. You have chosen not to choose, which is a choice, and I shall write it down as one. You will be watched. Please do not take it personally.',
        next: 'close',
      },
      defiant: {
        speaker: V,
        text: '(He does not move. Neither do the brothers at the walls, though their hands have gone to their belts.) Then we understand one another, which is more than most people manage. You may leave Solenne freely. No one will touch you under the Hierophant’s roof. Elsewhere, I make no promises, and you will find that I keep the ones I make.',
        next: 'close',
      },
      'defiant-flare': {
        speaker: 'narrator',
        text: 'The scar blazes. Every candle in the Hierophant’s court leans toward you at once, and the cold braziers along the walls catch with a sound like a gasp. The clerks scramble back. The Hierophant cries out. Castor Vellane does not even blink. He only watches the flames, as a man watches a fire he means to put out, and calculates.',
        next: 'defiant',
      },
      close: {
        speaker: V,
        text: 'One more thing, before you go. On Lanternmass night someone opened the doors of this cathedral to the Pale Saint. Three of the keepers had keys: an archivist, a lamplighter and a sister of the font. I could put all three to the question. I would rather not; the question is very bad for the innocent. Find the one I want, Ashmarked. Whatever you think of me, you want that door shut too.',
        next: 'aurelian',
      },
      aurelian: {
        speaker: AU,
        text: 'The Keeper’s rooms. Her rooms. Begin there, if you would. They are as she left them. Sister Ilse keeps them; she will let you in. I have never been able to go up the stair.',
      },
    },
  },
  // ---------------------------------------------------------------- Ch4 general talk
  {
    id: 'dialogue:ch4-aurelian-general', name: 'Aurelian: General (Act II)',
    entries: [
      { when: f('act2.ilse_unmasked'), node: 'ilse' },
      { when: f('act2.wrong_accused'), node: 'wrong' },
      { when: f('act2.aurelian_mercy'), node: 'mercy' },
      { node: 'start' },
    ],
    nodes: {
      start: { speaker: AU, text: 'Is it still snowing? Ah. Of course it is. Sit a moment, if you can spare it. No one else does.', next: 'hub' },
      mercy: { speaker: AU, text: 'I sealed it. One mercy, for one cart. Castor thanked me for my compassion in front of the whole court, very warmly, and I have not slept since. I think that means it was right.', next: 'hub' },
      ilse: {
        speaker: AU, mood: 'sad',
        text: 'Ilse brought me my tea every morning for eleven years. Honey in it, because my throat is bad. I keep waiting for the knock. (He looks toward the cathedral.) They have drained the font. There was nothing at the bottom but stone.',
        next: 'hub',
      },
      wrong: {
        speaker: AU, mood: 'sad',
        text: 'Ilse is gone. Into the font, they say, and never came up. And the one you named is in Valcastre. (He does not look at you.) We all make the wrong choice, child. The Church has made it for eleven hundred years. I only wish it were not so easy.',
        next: 'hub',
      },
      hub: {
        speaker: AU,
        text: 'What can an old man do for you?',
        choices: [
          { text: '"Pray for me, Holiness."', to: 'pray', once: true },
          { text: '"What will you do, if the Embers come back?"', to: 'embers', once: true },
          { text: '"Rest, Holiness. I’ll go."', to: null, tag: 'leave' },
        ],
      },
      pray: { speaker: AU, mood: 'happy', text: 'I already do. Every night, at the Lantern, after the others. I pray for you and for her, both, in the same breath. I am not sure the Light can tell you apart any more. I am not sure I can.', next: 'hub' },
      embers: { speaker: AU, mood: 'afraid', text: 'Whatever Castor tells me to. (A pause.) No. That is unworthy. I shall try to do what is right, and I shall fail, and Castor will be kind about it. Ask me again when they are here. Perhaps by then I shall have found my spine. It must be somewhere.', next: 'hub' },
    },
  },
  {
    id: 'dialogue:ch4-vellane-general', name: 'Vellane: General (Act II)',
    entries: [
      { when: eq('act2.church_stance', 'defiant'), node: 'defiant' },
      { when: eq('act2.church_stance', 'pledged'), node: 'pledged' },
      { node: 'neutral' },
    ],
    nodes: {
      defiant: { speaker: V, text: 'You are still in my city. How trusting of you. I meant what I said: no one will touch you under this roof. Mind the candles on your way out.', next: 'hub' },
      pledged: { speaker: V, text: 'Ashmarked. How goes the hunt? You need not tell me; I have letters. But I like to hear it from you. It is good for a man to hear the truth from the people who owe it him.', next: 'hub' },
      neutral: { speaker: V, text: 'My watcher tells me you breakfast very early. I approve. Was there something?', next: 'hub' },
      hub: {
        speaker: V,
        text: 'Well?',
        choices: [
          { text: '"Sister Ilse walked into the font."', to: 'ilse', once: true, when: f('act2.ilse_unmasked') },
          { text: '"The one I named was innocent."', to: 'wrong', once: true, when: f('act2.wrong_accused') },
          { text: '"About Anselm. I know there will be a price."', to: 'owed', once: true, when: f('act2.owes_vellane') },
          { text: '"Do you ever doubt, Lord-Inquisitor?"', to: 'doubt', once: true },
          { text: '"Nothing. Good day."', to: null, tag: 'leave' },
        ],
      },
      ilse: {
        speaker: V,
        text: 'A font one hand deep, and she walked into it and did not come up. I have had it drained, and every font in Solenne after it, and I have had the stones lifted. Nothing. (He is quiet a moment.) I was wrong about her, and I have read my file on her nine times since, looking for the line where I should have known. It is not there. That frightens me more than she does.',
        next: 'hub',
      },
      wrong: {
        speaker: V,
        text: 'Of the Quench, yes. Of everything else? I doubt it. Nobody is innocent of everything, Ashmarked; it is the first thing they teach us. (He makes a note.) Still. You named, and the sister ran. That tells me what I need. I am obliged to you, after a fashion.',
        next: 'hub',
      },
      owed: { speaker: V, text: 'There will. Not today. When I ask, it will be something you can do, and something you would rather not. That is what makes it a price. Go with the Light.', next: 'hub' },
      doubt: {
        speaker: V,
        text: 'Every hour. Doubt is a lamp; one carries it into every room, to see what is there. What I do not do is set it down and walk away from it. (He smiles.) That is the whole of my creed, if you want it. It fits on a scrap of paper. Fire must be watched.',
        next: 'hub',
      },
    },
  },
];

export default dialogues;
