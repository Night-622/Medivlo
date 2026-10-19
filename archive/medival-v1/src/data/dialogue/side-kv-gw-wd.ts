/** Dialogue: regional side quests, Kingsvale and Greywater (docs/lore/15-side-content.md). Witherdowns in side-kv-gw-wdb.ts. Owner: Claude 4. */
import type { DialogueDef } from '@/core';

const notStarted = (q: `quest:${string}`) => ({ not: { any: [{ questActive: q }, { questCompleted: q }] } });
const at = (quest: `quest:${string}`, stage: string) => ({ questStage: quest, stage });
const is = (flag: string, value: string) => ({ flag, op: '==' as const, value });
const SIDE = { flag: 'content.side' };
const PRO = { flag: 'prologue.complete' };

const QL = 'quest:side-kv-lamplighters', QS = 'quest:side-kv-seed-corn';
const QE = 'quest:side-gw-eel-wives', QB = 'quest:side-gw-bell-of-varn';
const LAMP = 'side.kv.lamplighters', SEED = 'side.kv.seed-corn', EEL = 'side.gw.eel-wives', BELL = 'side.gw.bell-of-varn';
const LOWE = 'npc:martin-lowe', OSYTH = 'npc:osyth-reed', WULF = 'npc:wulfric-hay';
const COB = 'npc:old-cob', JORY = 'npc:jory', EBBA = 'npc:ebba-gale';

const dialogues: DialogueDef[] = [
  // =================== The Lamplighters’ Strike ===================
  {
    id: 'dialogue:side-kv-lamplighters-lowe', name: 'Martin Lowe: The Lantern Row',
    entries: [
      { when: is(`${LAMP}.outcome`, 'ember'), node: 'after-ember' },
      { when: is(`${LAMP}.outcome`, 'church'), node: 'after-church' },
      { when: is(`${LAMP}.outcome`, 'camp'), node: 'after-camp' },
      { when: at(QL, 'light'), node: 'light' },
      { when: at(QL, 'cellar'), node: 'cellar' },
      { when: at(QL, 'lamp'), node: 'lamp' },
      { when: { all: [SIDE, { flag: 'act1.gate_passed' }, notStarted(QL)] }, node: 'start' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: LOWE, text: 'No ladders tonight, friend. Nor any night, till I know what I’m lighting.' },
      start: {
        speaker: 'narrator',
        text: 'The Lantern Row runs from the cathedral steps to the gate of the Keep: forty-one lamps on black iron posts, each in its glass house. They are lit. They burn a thin, cold blue, like marsh-fire, and in their light the people hurrying beneath them look grey and wet about the mouth. Under the last lamp a tall old man sits on an upturned ladder, with a long brass lighting-pole across his knees.',
        next: 'offer',
      },
      offer: {
        speaker: LOWE,
        text: 'Martin Lowe, Master of the Lamplighters. Forty years I’ve lit this Row. They were Brand-wicks, these, every one: lit each Lanternmass from the cathedral’s altar flame, and the altar flame from the Brand itself, carried up from Solenne by a pilgrim on foot. Then the Brand went out, and the altar flame with it. We light them off a common taper now, and look what they give us. Two of my lads have been dreaming of water. Bertil walked into the Hald a week gone with his pole still on his shoulder. So I’ve called the guild out. The Wick says light them by Kethday or hang. The Prior says it’s a holy charge. I say: you go and look at one, and tell me it’s holy.',
        choices: [
          { text: '“I’ll look at your lamps.”', to: 'thanks', effects: [{ startQuest: QL }] },
          { text: '[Wick-licensed] “I hold a Wick-licence. If something is wrong with a holy flame, it is my business as much as theirs.”', to: 'licence', when: { dialogueTag: 'wick-licensed' }, tag: 'trait', effects: [{ startQuest: QL }] },
          { text: '“Why not just put them out?”', to: 'out', once: true },
          { text: '“Not now.”', to: null, tag: 'leave' },
        ],
      },
      out: { speaker: LOWE, mood: 'angry', text: 'Put out a Brand-wick on the Lantern Row? In Haldren? The Wick would have me on a gibbet by the second bell, and the Prior would weep at the foot of it. No. We’ve not lit them. We’ve not put them out. That’s the strike: we don’t touch them. Nobody does.', next: 'offer' },
      thanks: { speaker: LOWE, text: 'Good. Go up close. Don’t look into the flame too long; Bertil did. Then come and tell me what you saw.' },
      licence: { speaker: LOWE, mood: 'afraid', text: '(He looks at you sideways.) A licensed one. Well. I suppose even the Wick can send a body who’ll look before they hang. Go on, then. Mind your eyes.' },
      lamp: { speaker: LOWE, text: 'Any of them will do. They’re all the same. That’s the trouble.' },
      cellar: { speaker: LOWE, mood: 'afraid', text: 'From under the street? Our oil-cellar’s under the Row. The guild stair goes down behind the chandler’s, into the old town that burned in the war. I’ve not been down since the Quench. Smelled the fen on the stair, and came back up.' },
      light: {
        speaker: LOWE,
        text: 'Clean? The oil’s clean? …Seven keep you. Then there’s only the one question left, and it’s the one I can’t answer. How do I light them? The Prior wants it done from his altar taper, with prayers, as it’s always been, though his altar flame’s only a candle lit off a candle now. The Wick wants it done by Kethday and doesn’t care how. And there’s three thousand at the camp outside the walls cooking on dung and turf, and forty barrels of good oil under my feet.',
        choices: [
          {
            text: '(Raise the Ashmark.) “Let me light them.”', to: 'ember', when: { not: { dialogueTag: 'wick-licensed' } },
            effects: [{ setFlag: `${LAMP}.outcome`, value: 'ember' }, { reputation: 'faction:emberwardens', delta: 5 }, { reputation: 'faction:order-of-the-wick', delta: -10 }],
          },
          {
            text: '[Wick-licensed] (Raise the Ashmark.) “Let me light them. Lawfully, under licence. Let the Wick read my papers.”', to: 'ember', when: { dialogueTag: 'wick-licensed' }, tag: 'trait',
            effects: [{ setFlag: `${LAMP}.outcome`, value: 'ember' }, { reputation: 'faction:emberwardens', delta: 5 }, { reputation: 'faction:order-of-the-wick', delta: -3 }],
          },
          {
            text: '“Let the Prior light them from his altar. Give the Church its lamps back.”', to: 'church',
            effects: [{ setFlag: `${LAMP}.outcome`, value: 'church' }, { reputation: 'faction:lanternate', delta: 10 }],
          },
          {
            text: '[Devout] “Let the Prior light them, Master, and pray as he does it. The flame was never the holy part. The praying was.”', to: 'church-devout', when: { dialogueTag: 'devout' }, tag: 'trait',
            effects: [{ setFlag: `${LAMP}.outcome`, value: 'church' }, { reputation: 'faction:lanternate', delta: 10 }, { setFlag: `${LAMP}.devout`, value: true }],
          },
          {
            text: '“Leave the Row dark. Take the oil to the camp, where it will keep children alive.”', to: 'camp',
            effects: [{ setFlag: `${LAMP}.outcome`, value: 'camp' }, { reputation: 'faction:crown-of-haldmarch', delta: 5 }, { reputation: 'faction:lanternate', delta: -5 }],
          },
        ],
      },
      ember: {
        speaker: 'narrator',
        text: 'You walk the Row from the cathedral steps to the Keep with the lighting-pole in one hand and the other bare. At each lamp you open the little glass door, and the blue flame shrinks from your palm, and goes out, and then the wick catches again, red-gold and warm, the colour of a forge at evening. By the twentieth lamp there is a crowd behind you. By the fortieth, nobody is speaking at all.',
        next: 'ember2',
      },
      ember2: { speaker: LOWE, mood: 'happy', text: 'Look at that. Look at it. My gran used to talk about the Wardens’ light up on the crag, red over the whole vale. I thought she was making it up. (He wipes his eyes on a sooty sleeve.) The guild goes back up the ladders tomorrow. And when the Wick come asking who lit my lamps, I’ll tell them the truth: a customer.' },
      church: { speaker: LOWE, text: 'The Prior, then. He’ll be glad; he cried when I told him we’d stopped. (He sighs.) It’s only a candle off a candle, but it’s clean oil, and the man means every word he says over it. Maybe that counts. The guild goes back up the ladders tomorrow.' },
      'church-devout': { speaker: LOWE, mood: 'happy', text: 'The praying was the holy part. (He turns the words over.) My mother said something like that, about grace before meat: it’s not the bread that’s blessed, it’s the being grateful. All right. The Prior can have his lamps, and I’ll stand at the foot of every ladder and pray along. Badly. But I’ll pray.' },
      camp: { speaker: LOWE, mood: 'happy', text: 'Dark Row, warm camp. (He starts to laugh.) The Prior will call it apostasy and the Wick will call it treason, and do you know, for the first time since the Quench I don’t much mind what anyone calls anything. Forty barrels. We’ll take them out on handcarts. I’ll light the cook-fires myself. Lighting’s lighting.' },
      'after-ember': { speaker: LOWE, mood: 'happy', text: 'Red as a forge, every night, and no lad dreaming of water. The Wick’s been round twice to stare at my lamps. I sold one of them a taper.' },
      'after-church': { speaker: LOWE, text: 'They burn yellow and steady, and the Prior walks the Row with us at dusk. Odd sort of company. Good sort, I think.' },
      'after-camp': { speaker: LOWE, mood: 'happy', text: 'The guild lights cook-fires now. Best lamplighters in the Haldmarch, lighting turf for soup. My father would be ashamed. My mother would be proud. I’ve decided to listen to her.' },
    },
  },
  {
    id: 'dialogue:obj-kv-cold-lamp', name: 'Object: a Brand-wick',
    entries: [
      { when: is(`${LAMP}.outcome`, 'ember'), node: 'red' },
      { when: is(`${LAMP}.outcome`, 'church'), node: 'yellow' },
      { when: is(`${LAMP}.outcome`, 'camp'), node: 'dark' },
      { when: at(QL, 'lamp'), node: 'look' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'narrator', text: 'A street-lamp in a glass house on a black iron post. The flame inside burns small and blue, and gives no warmth at all.' },
      red: { speaker: 'narrator', text: 'The lamp burns red-gold behind its glass. Children have been warming their hands at the post.' },
      yellow: { speaker: 'narrator', text: 'The lamp burns a plain, steady yellow. Someone has tied a twist of straw round the post, the old Haldish way, for luck.' },
      dark: { speaker: 'narrator', text: 'The lamp is dark, its glass house empty. Someone has chalked on the post: GONE TO THE CAMP.' },
      look: {
        speaker: 'narrator',
        text: 'Up close the flame is wrong in a way that is hard to say. It does not flicker. It sways, slowly, as weed sways in a current, and the light it gives is wet. Your gloved hand, held up to the glass, looks like the hand of someone pulled out of a river.',
        choices: [
          { text: '(Look through the Ashmark.)', to: 'sight' },
          { text: '[Arcanist] (Read the flame as you would read a spell.)', to: 'arcanist', when: { classIs: 'class:arcanist' }, tag: 'class' },
          { text: '[Devout] (Say the Lantern prayer to it.)', to: 'devout', when: { dialogueTag: 'devout' }, tag: 'trait' },
          { text: '[Intellect 15] (Open the reservoir and study the oil.)', to: 'oil', check: { stat: 'intellect', dc: 15, failTo: 'dull' }, once: true },
        ],
      },
      sight: { speaker: 'narrator', text: 'Through the Ashmark the street goes dark and the lamps go out, all but one thing. A thread of black, thin as a hair, climbs the lamp-post from the cobbles, winds up the iron and into the oil, and the flame drinks it. The thread comes up from under the street. Every post on the Row has one.', next: 'done' },
      arcanist: { speaker: 'narrator', text: 'A flame is a simple spell: fuel, air, heat, and the will to burn. This one has no will. It is burning because something underneath it is dreaming of burning, the way a sleeper’s hand closes on nothing. The fuel is not oil, or not only. It is coming up from below.', next: 'done' },
      devout: { speaker: 'narrator', text: '“Lux manet.” The flame leans away from the words, as a sleeper turns from a voice, and gutters, and recovers. It does not seem to have heard of the Lantern. It seems to be listening for something else, a long way down.', next: 'done' },
      oil: { speaker: 'narrator', text: 'The reservoir is full, but the oil in it is the wrong colour: clear at the top, black at the bottom, in two layers that will not mix. The black layer is cold, and smells of the fen. Lamp-oil does not separate like that. Water does.', next: 'done' },
      dull: { speaker: 'narrator', text: 'The reservoir lid is soldered shut against thieves, and the oil you can see through the glass looks like oil. Whatever is wrong is not obvious from here.', next: 'look' },
      done: { speaker: 'narrator', text: 'Whatever is wrong with the Brand-wicks is coming up from under the Lantern Row. Master Lowe will know what lies beneath it.' },
    },
  },
  {
    id: 'dialogue:obj-kv-oil-seep', name: 'Object: the seep in the oil-cellar',
    entries: [
      { when: { flag: `${LAMP}.seep_purged` }, node: 'clean' },
      { when: at(QL, 'cellar'), node: 'seep' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'narrator', text: 'A cellar of old brick under the Lantern Row, full of oil-vats. It smells of the fen.' },
      clean: { speaker: 'narrator', text: 'The cellar smells of oil and old brick, and nothing else. A crack in the floor is scorched black, and dry.' },
      seep: {
        speaker: 'narrator',
        text: 'The guild’s vats stand in rows on the floor of a house that burned two hundred years ago. The flags beneath them have split, and up through the split black water is beading, slow as sweat, and running in threads into the vats. The oil in the nearest has a skin on it, and the skin moves, gently, like the lid of a sleeping eye.',
        choices: [
          { text: '(Purge it. All of it, now.)', to: 'purge', effects: [{ setFlag: `${LAMP}.seep_purged`, value: true }] },
          { text: '[Will 15] (Purge it slowly, thread by thread, and spare the oil.)', to: 'careful', check: { stat: 'will', dc: 15, failTo: 'hard' }, once: true },
          { text: '[Warden] (Burn it as the old wardens did a seep in a cellar: from the edges in, so the fire has nowhere to go.)', to: 'careful', when: { classIs: 'class:warden' }, tag: 'class' },
          { text: 'Leave it for now.', to: null, tag: 'leave' },
        ],
      },
      purge: { speaker: 'narrator', text: 'You lay your marked hand flat on the split flags. The fire goes down into the crack like water into sand, and the black water boils, and the vats go up with it in sheets of yellow flame. When the smoke clears, the seep is a dry scorch on the floor, and half the guild’s oil is gone.', next: 'end' },
      hard: { speaker: 'narrator', effects: [{ setFlag: `${LAMP}.seep_purged`, value: true }], text: 'You try to go gently. The Mire does not care for gentleness. It pulls at the fire, and the fire leaps, and two vats go up before you can close your hand. But the seep is burned out, and the rest of the oil is safe.', next: 'end' },
      careful: { speaker: 'narrator', effects: [{ setFlag: `${LAMP}.seep_purged`, value: true }, { setFlag: `${LAMP}.oil_saved`, value: true }], text: 'You work round the edge of the crack with your fingertips, a little fire at a time, as one would cauterise a wound. It takes a long while. The black threads curl back from the vats and down into the floor, and at the last there is only a dry crack in the flags, warm to the touch, and forty barrels of good clean oil.', next: 'end' },
      end: { speaker: 'narrator', text: 'Far above you, through the floor of the street, you think you hear someone in the Row say: “Oh. Look. It’s gone out.”' },
    },
  },

  // =================== Seed Corn ===================
  {
    id: 'dialogue:side-kv-seed-corn-osyth', name: 'Osyth Reed: At Wheatcombe gate',
    entries: [
      { when: { all: [at(QS, 'tell'), { flag: `${SEED}.forced` }] }, node: 'tell-forced' },
      { when: { all: [at(QS, 'tell'), is(`${SEED}.outcome`, 'opened')] }, node: 'tell-opened' },
      { when: { all: [at(QS, 'tell'), is(`${SEED}.outcome`, 'shared')] }, node: 'tell-shared' },
      { when: at(QS, 'tell'), node: 'tell-kept' },
      { when: { questCompleted: QS }, node: 'after' },
      { when: { questActive: QS }, node: 'waiting' },
      { when: { all: [SIDE, PRO, notStarted(QS)] }, node: 'start' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: OSYTH, text: 'Mind where you tread. Some of them are sleeping. Some of them aren’t.' },
      start: {
        speaker: 'narrator',
        text: 'The road into Wheatcombe ends at a gate of hurdles lashed together and stuffed with thorn. On this side of it, in the snow, forty people are sitting round three small fires. On the other side, a long tithe-barn stands with its doors barred and two boys with flails beside it. A woman with blue-stained hands gets up from the nearest fire.',
        next: 'offer',
      },
      offer: {
        speaker: OSYTH,
        text: 'Osyth Reed. Of Varn, once. We came over the Causeway on the Night, and we’ve been walking since. Haldren’s camp is full; they turned us at the gate. So we came here, because there’s corn here. That barn is full of seed-wheat, and the reeve won’t open it, and won’t open the gate, and we buried a little lad this morning under the hedge because the ground was too hard anywhere else. Will you talk to him? He won’t talk to me. I think he can’t look at me.',
        choices: [
          { text: '“I’ll talk to him.”', to: 'thanks', effects: [{ startQuest: QS }] },
          { text: '“Seed-corn is next year’s bread. He isn’t wrong to keep it.”', to: 'wrong', once: true },
          { text: '“Not now.”', to: null, tag: 'leave' },
        ],
      },
      wrong: { speaker: OSYTH, mood: 'angry', text: 'No. He isn’t wrong. That’s the cruelty of it. If it were a bad man keeping it I’d know what to do. (She looks at the barn.) Next year’s bread. Next year’s a long way off when you’re six.', next: 'offer' },
      thanks: { speaker: OSYTH, text: 'His name’s Wulfric Hay. He’s the one standing by the barn pretending not to watch us.' },
      waiting: { speaker: OSYTH, text: 'Thirty-eight now. Go on. I’ll be here. Where else would I be?' },
      'tell-opened': { speaker: OSYTH, mood: 'happy', text: 'They’re baking. In there. They opened the gate and brought out loaves and nobody said anything at all, they just handed them out, and the children ate them so fast they were sick, and then ate again. (She is laughing and crying at once.) I don’t know what you said to him. Don’t tell me.' },
      'tell-forced': { speaker: OSYTH, mood: 'sad', text: 'We ate. Thank you. (She does not quite look at you.) They watched us eat with their flails in their hands. We’ll go on to the coast when we’ve the strength. We’ll not be welcome here again, whatever spring brings.' },
      'tell-shared': { speaker: OSYTH, mood: 'happy', text: 'A third of the seed for bread, and the rest kept, and us to plough and sow it for them when the thaw comes. If the thaw comes. (She holds up her blue hands.) I’ve never ploughed in my life. I’ll learn. We’re to sleep in their barn. All of us, round the one fire, like the hearthwardens do now. Hold, and be held, that reeve said. I didn’t know he had it in him.' },
      'tell-kept': { speaker: OSYTH, mood: 'sad', text: 'Kept. (She nods slowly.) Then we’ll go on. There’s talk of soup at Haldford. There’s always talk of soup somewhere. (She bends to wake a child.) You did what you thought was right. I hope spring comes for them. I hope it’s worth it.' },
      after: { speaker: OSYTH, text: 'Still breathing. That’s the most you can say for anyone, this winter.' },
    },
  },
  {
    id: 'dialogue:side-kv-seed-corn-wulfric', name: 'Wulfric Hay: The tithe-barn',
    entries: [
      { when: at(QS, 'judge'), node: 'judge' },
      { when: at(QS, 'barn'), node: 'barred' },
      { when: at(QS, 'reeve'), node: 'reeve' },
      { when: is(`${SEED}.outcome`, 'shared'), node: 'after-shared' },
      { when: is(`${SEED}.outcome`, 'opened'), node: 'after-opened' },
      { when: is(`${SEED}.outcome`, 'kept'), node: 'after-kept' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: WULF, text: 'Gate stays barred. Barn stays barred. Good day.' },
      reeve: {
        speaker: WULF,
        text: 'She sent you. Of course she did. Look: I’m reeve of Wheatcombe. Ninety souls. That barn is two hundred bushel of seed-wheat, and it’s every grain we’ve got to put in the ground when the thaw comes. Eat it, and when the thaw comes we’ve nothing to plant, and then it’s Wheatcombe sitting in the snow at somebody else’s gate. I’m not cruel. I can count.',
        choices: [
          { text: '“Let me see the barn.”', to: 'no' },
          { text: '[Noble-born] “The Crown will hear how Wheatcombe kept its gate. Shall I tell them myself?”', to: 'noble', when: { dialogueTag: 'noble-born' }, tag: 'trait', once: true },
          { text: '“They’re dying out there, Wulfric.”', to: 'dying', once: true },
          { text: '“I’ll think on it.”', to: null, tag: 'leave' },
        ],
      },
      no: { speaker: WULF, mood: 'angry', text: 'Nobody goes in that barn. Not you, not my own wife. Once one sack walks out, they all do. (Something in his face shuts, very quickly.) Good day.' },
      noble: { speaker: WULF, mood: 'afraid', text: 'The Crown. (He laughs, without much in it.) The Crown has already had its say in Wheatcombe, my lord. I don’t think it’ll want to hear any more. Good day.' },
      dying: { speaker: WULF, mood: 'sad', text: 'I know they are. I can hear them at night. I counted the fires this morning and there were three, and yesterday there were four. Don’t you think I know? (He turns his back.) Good day.' },
      barred: { speaker: WULF, text: 'I said no. The barn stays barred.' },
      judge: {
        speaker: WULF,
        text: '(He has seen you come out of the barn. He does not shout. He sits down on the mounting-block by the gate, all at once, like a man whose legs have decided for him.) So. You’ve seen it.',
        choices: [
          {
            text: '“Thirty bushel to the Lord Protector’s levy. You sold their bread to pay for Harrow’s war, and you would let them starve to hide it.”', to: 'opened', tag: 'intimidate', when: { flag: `${SEED}.tally_found` },
            effects: [{ setFlag: `${SEED}.outcome`, value: 'opened' }, { reputation: 'faction:crown-of-haldmarch', delta: -5 }],
          },
          {
            text: '[Will 15] “Feed them a third. In return they plough your fields and sow the rest. If spring comes you’ll want the hands.”', to: 'shared', tag: 'persuade', once: true,
            check: { stat: 'will', dc: 15, failTo: 'fail' }, effects: [{ setFlag: `${SEED}.outcome`, value: 'shared' }],
          },
          {
            text: '[Silver-tongue] “A third for bread, the rest for sowing, and forty pairs of hands come the thaw. Wheatcombe never got a better bargain from the Crown.”', to: 'shared', tag: 'trait', when: { dialogueTag: 'silver-tongue' },
            effects: [{ setFlag: `${SEED}.outcome`, value: 'shared' }],
          },
          {
            text: '[Oathbound] “Hold, and be held. You hold your gate against them. When your own turn comes, who will hold you?”', to: 'shared', tag: 'class', when: { classIs: 'class:oathbound' },
            effects: [{ setFlag: `${SEED}.outcome`, value: 'shared' }],
          },
          {
            text: '[Noble-born] “The Charter says a man is tried by his neighbours. They’re your neighbours now. Let them sow with you, and judge you at harvest.”', to: 'shared', tag: 'trait', when: { dialogueTag: 'noble-born' },
            effects: [{ setFlag: `${SEED}.outcome`, value: 'shared' }],
          },
          {
            text: '[Brute] “Open the barn, or I open it, and the gate, and you.”', to: 'forced', tag: 'aggressive', when: { any: [{ dialogueTag: 'brute' }, { classIs: 'class:reaver' }] },
            effects: [{ setFlag: `${SEED}.outcome`, value: 'opened' }, { setFlag: `${SEED}.forced`, value: true }, { reputation: 'faction:crown-of-haldmarch', delta: -5 }],
          },
          {
            text: '“Keep it. Spring has to come for somebody.”', to: 'kept',
            effects: [{ setFlag: `${SEED}.outcome`, value: 'kept' }],
          },
        ],
      },
      fail: { speaker: WULF, mood: 'sad', text: 'Pretty words. They don’t sow. (He shakes his head.) You don’t know these people. You don’t know mine, either.', next: 'judge' },
      opened: {
        speaker: WULF, mood: 'sad',
        text: 'Harrow’s reeve came in the autumn with a writ and six men. There was no coin, so he took seed. I wrote it down because I write everything down. Seven forgive me, I was going to tell them. Next week. Every week, next week. (He gets up.) Open the gate, lads. And the barn. It was never as full as I let them think.',
      },
      forced: { speaker: WULF, mood: 'afraid', text: '(He looks at you for a long moment, and then at his two boys with their flails, and then he takes the bar down from the barn door himself.) Take it, then. Take it, and when we’re at their gate next winter, you can come and stand between us again.' },
      shared: { speaker: WULF, text: '(He is quiet a long time.) A third. A third, and they sow, and they sleep in the barn with us round the one fire, and if anyone eats from the sowing-sacks I’ll know. (He stands.) Open the gate, lads. Hold, and be held. My father used to say that. I’d forgotten what it was for.' },
      kept: { speaker: WULF, mood: 'sad', text: 'Thank you. (He doesn’t sound thankful.) Somebody has to be the one who says no. I wish it wasn’t me. I wish it had never been me.' },
      'after-shared': { speaker: WULF, text: 'Thirty-eight of them, round our fire. The barn smells of people. Odd. I like it better.' },
      'after-opened': { speaker: WULF, mood: 'sad', text: 'What spring we get, we’ll get. Leave me be.' },
      'after-kept': { speaker: WULF, mood: 'sad', text: 'They went on, this morning. I counted them going. I count everything.' },
    },
  },
  {
    id: 'dialogue:obj-kv-tithe-barn', name: 'Object: Wheatcombe tithe-barn',
    entries: [
      { when: { flag: `${SEED}.barn_seen` }, node: 'seen' },
      { when: at(QS, 'barn'), node: 'barn' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'narrator', text: 'A long tithe-barn of grey stone, its great doors barred with an oak beam.' },
      seen: { speaker: 'narrator', text: 'The tithe-barn of Wheatcombe. You know now how much is in it, and how much is not.' },
      barn: {
        speaker: 'narrator',
        text: 'The barn doors are barred with a beam as thick as a man. Two farm-boys sit on upturned buckets beside them with flails across their knees, sharing one blanket and trying to look like soldiers. Above the doors there is an owl-hole in the gable, and a great deal of old thatch.',
        choices: [
          { text: '[Shade] (Go up the thatch and in at the owl-hole.)', to: 'inside', when: { classIs: 'class:shade' }, tag: 'class' },
          { text: '[Ranger] (Read the old sledge-tracks at the back of the barn first.)', to: 'tracks', when: { classIs: 'class:ranger' }, tag: 'class' },
          { text: '[Finesse 15] (Wait for them to go and warm their hands, then lift the beam quietly.)', to: 'inside', check: { stat: 'finesse', dc: 15, failTo: 'spotted' }, once: true },
          { text: '[Might 15] (Lift the beam off its hooks while they watch.)', to: 'lift', check: { stat: 'might', dc: 15, failTo: 'spotted' }, once: true },
          { text: '“Hungry, lads?” (Talk to the guards.)', to: 'lads' },
        ],
      },
      tracks: { speaker: 'narrator', text: 'Under the new snow at the back of the barn, the ruts of a heavy sledge run out through the hedge and away north, toward the Haldren road. Two months old, perhaps. Somebody took a great deal out of this barn, all at once, and did not bring it back. The back door has a lock and no beam. You have a knife.', next: 'inside' },
      lift: { speaker: 'narrator', text: 'The boys watch you lift the beam off its hooks and set it down in the snow as if it were a broom-handle. Neither of them gets up. One of them says, faintly, “Dad’ll kill us,” and the other says, “He’ll have to get in the queue.”', next: 'inside' },
      spotted: { speaker: 'narrator', text: 'One of the boys sees you and jumps up with his flail, and then stops, and looks at the other one, and they both sit down again. “Go on, then,” says the bigger one. “Look. Everybody knows anyhow, except them at the gate.”', next: 'inside' },
      lads: { speaker: 'narrator', text: '“Hungry?” says the smaller boy. “We’re always hungry. Dad gives the gate-folk our crusts, did you know that? Over the hedge, at night, so nobody sees.” The bigger boy elbows him. Then, after a while, he gets up and takes the beam down himself. “Have a look,” he says. “Somebody ought to.”', next: 'inside' },
      inside: {
        speaker: 'narrator', effects: [{ setFlag: `${SEED}.barn_seen`, value: true }, { setFlag: `${SEED}.tally_found`, value: true }],
        text: 'The barn is dark and smells of dust and mice. The seed-sacks are stacked along one wall, tied and tallied. There are not two hundred bushel. There are perhaps a hundred and seventy. On a post by the door hangs the reeve’s tally-board, every sack notched and every notch dated, and below the notches, cut deep and recent:',
        next: 'tally',
      },
      tally: { speaker: 'narrator', text: '“To the Lord Protector’s reeve, for the winter levy, there being no coin in Wheatcombe: thirty bushel of seed-wheat. W. H. Seven forgive me.”' },
    },
  },

  // =================== The Eel-Wives ===================
  {
    id: 'dialogue:side-gw-eel-wives-cob', name: 'Old Cob: Ninestake Weir',
    entries: [
      { when: { all: [at(QE, 'cob'), is(`${EEL}.jory`, 'gone')] }, node: 'report-gone' },
      { when: { all: [at(QE, 'cob'), is(`${EEL}.jory`, 'scarred')] }, node: 'report-scarred' },
      { when: at(QE, 'cob'), node: 'report-saved' },
      { when: { questActive: QE }, node: 'waiting' },
      { when: is(`${EEL}.weir`, 'pulled'), node: 'after-pulled' },
      { when: is(`${EEL}.weir`, 'kept'), node: 'after-kept' },
      { when: { all: [SIDE, PRO, notStarted(QE)] }, node: 'start' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: COB, text: 'Heh. You’re standing on my net. No, stay there, it’s keeping it from blowing away.' },
      start: {
        speaker: 'narrator',
        text: 'On the end of the furthest plank-walk in Fenwick an old man is sitting with his feet over the black water, mending an eel-trap. He has no teeth, and he is laughing quietly at something, and when you come close you see that his face is wet.',
        next: 'offer',
      },
      offer: {
        speaker: COB,
        text: 'Cob. Old Cob, they call me, as if there was a young one. Heh. Sit. Ninestake Weir, out south of here. Best eel-weir in the fen; my Maud set the stakes. Since Lanternmass three men have poled out there after dark and not come back: Dunny Pike and the two Tasker lads. And last night my grandson Jory. Maud’s boy. I raised him. (He laughs again, and wipes his face.) The old folk say the eel-wives have them. Will you go and look? I can’t pole that far any more. And I don’t want to see.',
        choices: [
          { text: '“I’ll find him.”', to: 'thanks', effects: [{ startQuest: QE }] },
          { text: '“What are the eel-wives?”', to: 'wives', once: true },
          { text: '“Not now.”', to: null, tag: 'leave' },
        ],
      },
      wives: { speaker: COB, text: 'Drowned brides. A fen tale. They say the girls who drown before their wedding live in the weirs and sing to the fishers, and if you answer, they take you for a husband. My mam used to tell it to keep us home after dark. (He is not laughing now.) Maud drowned at that weir. Two winters before the stars fell. Setting the stakes. She was a widow, not a bride. I don’t know why I’m telling you.', next: 'offer' },
      thanks: { speaker: COB, text: 'Go before dark. And whatever you hear out there, don’t answer it. Don’t you answer it.' },
      waiting: { speaker: COB, text: 'South. Past the dead willows. You’ll see the stakes. Nine of them. Don’t answer.' },
      'report-saved': { speaker: COB, mood: 'happy', text: 'He’s home. He’s home and he’s asleep in my bed with his boots on, and I don’t care. (He laughs, and this time it is only laughing.) He says Maud was singing to him. Says it was her voice. I believe him. I heard it myself, once, last winter, and stopped my ears. Now. The weir.', next: 'weir' },
      'report-scarred': { speaker: COB, mood: 'sad', text: 'He’s home. He’s burned down one side, and he cries out in his sleep, and he won’t tell me what he saw. But he’s home. (He takes your marked hand and holds it a moment, without fear.) Better burned than drowned. Better anything than drowned. Now. The weir.', next: 'weir' },
      'report-gone': { speaker: COB, mood: 'sad', text: '(He listens to all of it without a word. Then he nods, slowly, many times.) He wanted to go. He always was her boy more than mine. (He looks out across the water to the south.) I’ll put a light in the window for him. Not that he’ll need it. Now. The weir.', next: 'weir' },
      weir: {
        speaker: COB,
        text: 'Ninestake feeds half of Fenwick, and Maud set it, and it’s killed four of ours and nearly five. Agna will say keep it. Agna’s got children to feed. So have I. Had. (He looks at you.) You’ve stood in it. You say.',
        choices: [
          {
            text: '“Pull the stakes, and stop up the giant-drain under them with stone. No one fishes Ninestake again.”', to: 'pulled',
            effects: [{ setFlag: `${EEL}.weir`, value: 'pulled' }],
          },
          {
            text: '“Fish it by daylight. Never after dusk, never alone, and with your ears stopped.”', to: 'kept',
            effects: [{ setFlag: `${EEL}.weir`, value: 'kept' }],
          },
          {
            text: '[Hollow-touched] “It answered me in its own tongue, Cob. It will remember. Fish it by daylight, and it will let you.”', to: 'kept-spoke', when: { all: [{ dialogueTag: 'hollow-touched' }, { flag: `${EEL}.spoke` }] }, tag: 'trait',
            effects: [{ setFlag: `${EEL}.weir`, value: 'kept' }],
          },
        ],
      },
      pulled: { speaker: COB, text: 'Pull them. (He nods.) Aye. We’ll go out tomorrow, all of us, in daylight, with ropes. I’ll take the first stake out myself. Maud would want it done properly. She hated a job half done.' },
      kept: { speaker: COB, text: 'Daylight, then, and wax in our ears like the old sailors in the tales. Agna will be glad of the eels. I’ll not go. I’ll sit here and mend the traps. Somebody has to.' },
      'kept-spoke': { speaker: COB, mood: 'afraid', text: '(He stares at you.) You talked to it. In that tongue. (A long breath.) All right. Daylight. And if it ever sings to me, I’ll tell it you said so.' },
      'after-pulled': { speaker: COB, text: 'Stakes are out. Water’s just water there now. I go and look at it some mornings. It’s very quiet.' },
      'after-kept': { speaker: COB, text: 'They fish it by day. Nobody’s heard a thing. Nobody’s listening, mind.' },
    },
  },
  {
    id: 'dialogue:obj-gw-weir-stakes', name: 'Object: Ninestake Weir',
    entries: [
      { when: is(`${EEL}.jory`, 'gone'), node: 'after-gone' },
      { when: { flag: `${EEL}.jory` }, node: 'after' },
      { when: at(QE, 'jory'), node: 'stakes' },
      { when: at(QE, 'weir'), node: 'early' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'narrator', text: 'Nine tarred stakes set in a V in the open water, with wicker eel-traps lashed between them. The water inside the V is very still.' },
      early: { speaker: 'narrator', text: 'Nine tarred stakes stand in a V in the black water. Shapes are standing among them, up to their waists, very still, in fishermen’s ganseys. They are facing the mouth of the weir, as if listening to something.' },
      after: { speaker: 'narrator', text: 'Ninestake Weir. The water is only water now, cold and brown and full of reed-roots, and nobody is singing.' },
      'after-gone': { speaker: 'narrator', text: 'Ninestake Weir. The water is very still. Once, very faintly, you think you hear two voices singing together, a woman’s and a young man’s, and then only the wind in the reeds.' },
      stakes: {
        speaker: 'narrator',
        text: 'Jory is standing at the mouth of the weir, in water to his chest, with his arms held out a little from his sides as though he were wading into a warm sea. He is singing, softly, a fen lullaby. And the water is singing back. Women’s voices, many of them, rising from under the stakes, sweet and patient, and one of them a little louder than the others: “Jory, my love. Come down. It isn’t cold. Come down to Mam.”',
        choices: [
          { text: '(Look through the Ashmark.)', to: 'sight', once: true },
          { text: '[Might 15] (Wade in and drag him out bodily.)', to: 'saved', check: { stat: 'might', dc: 15, failTo: 'slip' }, once: true, effects: [{ setFlag: `${EEL}.jory`, value: 'saved' }] },
          { text: '[Ranger] (Cast a line over his shoulders from the stake-top, and haul.)', to: 'saved', when: { classIs: 'class:ranger' }, tag: 'class', effects: [{ setFlag: `${EEL}.jory`, value: 'saved' }] },
          { text: '[Will 15] (Purge the water around him, and only the water.)', to: 'purge', check: { stat: 'will', dc: 15, failTo: 'burned' }, once: true, effects: [{ setFlag: `${EEL}.jory`, value: 'saved' }] },
          { text: '[Hollow-touched] (Answer the voices, in their own tongue.) “Neh. Waa’el neh.”', to: 'spoke', when: { dialogueTag: 'hollow-touched' }, tag: 'trait', effects: [{ setFlag: `${EEL}.jory`, value: 'saved' }, { setFlag: `${EEL}.spoke`, value: true }] },
          { text: '(Do nothing. It is his mother’s voice, and he wants to go.)', to: 'gone', effects: [{ setFlag: `${EEL}.jory`, value: 'gone' }] },
        ],
      },
      sight: { speaker: 'narrator', effects: [{ unlockLore: 'lore:the-orrin' }], text: 'Through the Ashmark the weir’s mouth is not mud. It is a square of dressed stone, each block the size of a cart, sunk in the fen-bed: giant-work, older than Varn, the mouth of one of the old drains. It goes down a long way. Up out of it, slow as breath, comes the black, and the voices come with it. They are not eel-wives. They are the water, wearing whoever it last swallowed.', next: 'stakes' },
      slip: { speaker: 'narrator', text: 'The bottom drops away under your boots. You have him by the gansey, and the water has him by everything else, and it is stronger. He is slipping. His face, turned up to you, is perfectly calm.', next: 'slip2' },
      slip2: {
        speaker: 'narrator', text: '“Let go,” he says. “It’s Mam.”',
        choices: [
          { text: '(Burn the water. Now. Whatever it costs him.)', to: 'burned', effects: [{ setFlag: `${EEL}.jory`, value: 'scarred' }] },
          { text: '(Let go.)', to: 'gone', effects: [{ setFlag: `${EEL}.jory`, value: 'gone' }] },
        ],
      },
      saved: { speaker: 'narrator', text: 'You get him by the collar and the belt and you heave, and he comes up out of the water like a root out of mud, kicking and weeping and calling for his mother. The voices rise to a wail and then fall, all at once, as a crowd falls quiet. You carry him to the punt. He stops struggling halfway there.', next: 'hush' },
      purge: { speaker: 'narrator', text: 'You put your marked hand into the black water beside him and let the fire go, a little at a time, in a ring around him and not through him. The water hisses and steams. The voices cry out, very far away, like gulls. Jory blinks, and looks down at himself, up to his chest in a winter fen, and starts to shiver.', next: 'hush' },
      spoke: { speaker: 'narrator', text: 'The words come out of you softly, without teeth, as if they had been waiting. Not this one, little warm one. No. The singing stops. In the silence the water around Jory draws back from him, a hand’s breadth, as politely as a host. Then it lets him go, and he falls forward into your arms, and is very cold, and is alive.', next: 'hush' },
      burned: { speaker: 'narrator', effects: [{ setFlag: `${EEL}.jory`, value: 'scarred' }], text: 'The fire goes into the water and through it and through him. He screams, the first sound he has made that is wholly his own, and the black runs out of his veins and the voices shriek and are gone. You drag him out. All down his left side, where the fire went, the skin is burned white and shining. He is breathing.', next: 'hush' },
      hush: { speaker: 'narrator', text: 'Behind you, out among the stakes, the water closes over the weir-mouth with a sound like someone settling into bed. “Suun,” it says, quite clearly. Sleep. And then it is only water.' },
      gone: { speaker: 'narrator', text: 'Jory smiles at something you cannot see, and takes one more step, off the edge of the stone, and the water closes over his head without a ripple. For a moment the singing is louder, and gladder, and there is a new voice in it. “Haa’ruun,” the water says. Close over. Then it is very quiet.' },
    },
  },
  {
    id: 'dialogue:side-gw-eel-wives-jory', name: 'Jory: Home',
    entries: [{ when: is(`${EEL}.jory`, 'scarred'), node: 'scarred' }, { node: 'saved' }],
    nodes: {
      saved: { speaker: JORY, text: 'I know it wasn’t her. Grandad says it wasn’t her. (He keeps mending the net.) It knew all her songs, though. Every one.' },
      scarred: { speaker: JORY, mood: 'sad', text: 'Doesn’t hurt much now. (He touches the white skin on his neck.) When I sleep I dream of it, the fire. Better than dreaming of the water. Grandad says so, and he’s mostly right.' },
    },
  },

  // =================== The Bell of Varn ===================
  {
    id: 'dialogue:side-gw-bell-of-varn-ebba', name: 'Ebba Gale: Godwin’s Bell',
    entries: [
      { when: { all: [at(QB, 'ebba'), is(`${BELL}.fate`, 'rung')] }, node: 'tell-rung' },
      { when: { all: [at(QB, 'ebba'), is(`${BELL}.fate`, 'cracked')] }, node: 'tell-cracked' },
      { when: at(QB, 'ebba'), node: 'tell-fenwick' },
      { when: { questActive: QB }, node: 'waiting' },
      { when: { questCompleted: QB }, node: 'after' },
      { when: { all: [SIDE, PRO, notStarted(QB)] }, node: 'start' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: EBBA, text: 'Water’s up a thumb. Always up a thumb.' },
      start: {
        speaker: 'narrator',
        text: 'Where the Causeway runs out into the fen there is a turf hut with a tide-board nailed to its door, and an old woman on the step writing in a book with a goose-quill. Out along the Causeway, at intervals, the drowned knights of Varn stand at their posts in the dusk, water running from the joints of their mail.',
        next: 'offer',
      },
      offer: {
        speaker: EBBA,
        text: 'Ebba Gale, keeper of the Ninth Sluice. There’s no sluice now, but I keep the book. You’ll want to know about the bell. Everybody comes about the bell. Godwin’s Bell hung in the gatehouse at this end of the Causeway since the first lord. When the water rose, they rang it, and every knight in Varn came to stand on the Causeway till it fell. That was the oath. The water shall not pass us. On the Night, the gatehouse went into the fen and the bell with it, into what we call the Bell-Hole now. And for three nights the Choir has been out there with reed ropes and a windlass.',
        next: 'offer2',
      },
      offer2: {
        speaker: EBBA, mood: 'afraid',
        text: 'If they hang Godwin’s Bell in a reed temple and ring it, every one of those poor lads on the Causeway will come to it. They always came. And not only them. Every soul in Varn knew that bell. Every soul in Varn is under that water. Who knows what gets up and stands, when it rings?',
        choices: [
          { text: '“I’ll stop them.”', to: 'thanks', effects: [{ startQuest: QB }] },
          { text: '“And if I bring it up, what would you have me do with it?”', to: 'what', once: true },
          { text: '“Not now.”', to: null, tag: 'leave' },
        ],
      },
      what: { speaker: EBBA, text: 'Ring it right. Three strokes, slow, with a long space between: that’s the stand-down. The water’s fallen, go home. Nobody’s rung the stand-down since my grandfather’s day, because the water never fell enough. (She looks out at the knights.) It might be it’s fallen now. Far enough for them.', next: 'offer2' },
      thanks: { speaker: EBBA, text: 'Bell-Hole’s north of the Causeway end, where the gatehouse stones stick up. Mind the acolytes. They sing while they work. It’s horrible.' },
      waiting: { speaker: EBBA, text: 'Bell-Hole. North. Where the stones stick up.' },
      'tell-rung': { speaker: EBBA, mood: 'sad', text: 'I heard it. Three strokes. (Her quill is still in her hand.) I watched them. Out along the Causeway, the ones nearest. They turned round, toward the sound, and they knelt down, and then they lay down in the water as if it were a bed. Not all of them. The ones at the gates didn’t hear, or wouldn’t. But some of them. Some of the lads. (She writes something in the book.) “Stand-down rung. Water fallen.” First time in sixty years.' },
      'tell-cracked': { speaker: EBBA, text: 'Cracked. (She sighs.) Well. It can’t call anybody now, and that’s that. I’ll miss the sound of it. I heard it in my sleep my whole life, even after. (She writes in the book.) “Godwin’s Bell: broken. No more calling.” There. It’s official.' },
      'tell-fenwick': { speaker: EBBA, mood: 'happy', text: 'Fenwick! Agna Fenn with a bell. Seven help the Choir. (She laughs.) It’ll call the living now, I suppose, which is more use than it’s been in a year. When it rings for dark of the moon, I’ll hear it from here. I’ll know someone’s counting the children.' },
      after: { speaker: EBBA, text: 'Water’s up a thumb. I keep the book. Somebody ought to.' },
    },
  },
  {
    id: 'dialogue:obj-gw-bell-windlass', name: 'Object: the Choir’s windlass',
    entries: [
      { when: { flag: `${BELL}.raised` }, node: 'raised' },
      { when: at(QB, 'raise'), node: 'windlass' },
      { when: at(QB, 'hole'), node: 'busy' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'narrator', text: 'A windlass of lashed reed and drift-timber stands over a black pool among fallen gatehouse stones.' },
      busy: { speaker: 'narrator', text: 'Acolytes in reed robes lean on the windlass bars, singing softly, as a rope of plaited reed creaks down into the black pool. They have not seen you yet.' },
      raised: { speaker: 'narrator', text: 'The windlass creaks under the weight of the bell. The reed rope is holding. For now.' },
      windlass: {
        speaker: 'narrator',
        text: 'The Choir built well. The windlass is reed and drift-timber lashed with wet rope, and the rope runs down taut into the black water of the Bell-Hole. Just under the surface you can see a curve of green bronze, the crown of the bell, and the mud sucking at it.',
        choices: [
          { text: '[Might 15] (Put your back into the bars and haul.)', to: 'up', check: { stat: 'might', dc: 15, failTo: 'slip' } },
          { text: '[Intellect 15] (Rig a second purchase from the gatehouse beams, and let the timber do the work.)', to: 'up', check: { stat: 'intellect', dc: 15, failTo: 'slip' } },
          { text: '[Warden] (Set your shoulder to it as a knight of Varn would have: the water shall not pass us.)', to: 'up', when: { classIs: 'class:warden' }, tag: 'class' },
          { text: '[Oathbound] (Swear it aloud to the drowned knights on the Causeway: you will bring their bell home.)', to: 'up', when: { classIs: 'class:oathbound' }, tag: 'class' },
          { text: '(Kindle the mud around the bell with the Ashmark, and break its grip.)', to: 'kindle' },
          { text: 'Leave it.', to: null, tag: 'leave' },
        ],
      },
      slip: { speaker: 'narrator', text: 'The bell comes up a hand’s breadth, and the mud takes it back with a long wet sound, and the bars spin out of your grip. Out on the Causeway, a drowned knight turns its head toward you, slowly, and then away.', next: 'windlass' },
      kindle: { speaker: 'narrator', text: 'You kneel and put your marked hand into the water. The fire runs down the rope and into the mud, and the black pool boils and stinks, and the fen lets go of the bell all at once, like a fist opening. The windlass spins. You barely catch the bars.', next: 'up' },
      up: {
        speaker: 'narrator', effects: [{ setFlag: `${BELL}.raised`, value: true }],
        text: 'Godwin’s Bell comes up out of the Bell-Hole streaming black water, green as a pond, taller than you are. As it clears the surface the clapper swings of its own weight and strikes, once. The sound goes out across the whole fen. Along the Causeway, every drowned knight turns its head toward it, all at once. They wait. Nothing else comes. One by one they turn back to the water they are guarding.',
      },
    },
  },
  {
    id: 'dialogue:obj-gw-varn-bell', name: 'Object: Godwin’s Bell',
    entries: [
      { when: is(`${BELL}.fate`, 'rung'), node: 'after-rung' },
      { when: is(`${BELL}.fate`, 'cracked'), node: 'after-cracked' },
      { when: is(`${BELL}.fate`, 'fenwick'), node: 'after-fenwick' },
      { when: at(QB, 'bell'), node: 'bell' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'narrator', text: 'A great bronze bell, green with the fen.' },
      'after-rung': { speaker: 'narrator', text: 'Godwin’s Bell hangs silent from the windlass. Along the Causeway, a few of the drowned knights are lying in the shallows, quite still, with their hands folded on their swords.' },
      'after-cracked': { speaker: 'narrator', text: 'Godwin’s Bell hangs from the windlass with a crack from lip to shoulder. When the wind strikes it, it gives back only a dull clack, like a shutter.' },
      'after-fenwick': { speaker: 'narrator', text: 'The windlass stands empty. Deep grooves in the mud show where Fenwick’s punts took the bell away.' },
      bell: {
        speaker: 'narrator',
        text: 'Round its shoulder, under the green, letters are cast in the bronze: GODWIN MADE ME TO CALL THEM · THE WATER SHALL NOT PASS US · 702. The clapper is as long as your arm. Water still runs out of the bell’s mouth, and it does not stop running, though the bell has been out of the pool some while.',
        choices: [
          { text: '[Hollow-touched] (Lay your ear to the bronze.)', to: 'listen', when: { dialogueTag: 'hollow-touched' }, tag: 'trait', once: true },
          { text: '(Ring the stand-down: three strokes, slow, with a long space between.)', to: 'rung', effects: [{ setFlag: `${BELL}.fate`, value: 'rung' }, { unlockLore: 'lore:drowned-knights' }] },
          { text: '(Heat the bronze with the Ashmark until it glows, and let the snow crack it.)', to: 'cracked', effects: [{ setFlag: `${BELL}.fate`, value: 'cracked' }] },
          { text: '(Send for Fenwick’s punts. A village on stilts needs a bell that calls the living.)', to: 'fenwick', effects: [{ setFlag: `${BELL}.fate`, value: 'fenwick' }, { reputation: 'faction:drowned-choir', delta: -10 }] },
          { text: 'Not yet.', to: null, tag: 'leave' },
        ],
      },
      listen: { speaker: 'narrator', text: 'The bronze is cold as the bottom of the fen. Inside it, very faint, are voices: everyone in Varn who ever stopped what they were doing at the sound of this bell, looked up, and went to the Causeway. Hundreds of them, over five hundred years. And among them, quite near, a little girl’s voice, asking someone to open the window so that she can hear the water.', next: 'bell' },
      rung: { speaker: 'narrator', text: 'One. The sound goes out over the fen and does not come back. You wait, as Ebba said, a long space. Two. Out on the Causeway the nearest drowned knights have turned to face the bell. A long space. Three. One of them goes down on one knee, and then another, and then they are lying down in the shallow water along the Causeway, one after another, slowly, like men who have been given leave at last.' },
      cracked: { speaker: 'narrator', text: 'The bronze goes dull red under your hand, and then cherry, and the green flakes away like old paint. Snow falls on it, and hisses, and the bell gives a sound you feel in your teeth, and a crack runs from its lip to its shoulder. It will never call anyone again.' },
      fenwick: { speaker: 'narrator', text: 'Agna Fenn comes herself, with six punts and every rope in Fenwick. It takes until dark to float Godwin’s Bell out on a raft of eel-boats, and all the way back to the stilts the Fenwick folk are laughing and swearing at it. Somewhere in the reeds, faint and far off, the Choir is singing. Nobody in the punts sings back.' },
    },
  },
  // ----- optional route: Agna Fenn, after the Greywater side quests (see report)
  {
    id: 'dialogue:side-gw-agna-after', name: 'Agna Fenn: The bell and the weir',
    entries: [
      { when: is(`${BELL}.fate`, 'fenwick'), node: 'bell' },
      { node: 'weir' },
    ],
    nodes: {
      bell: { speaker: 'npc:agna-fenn', effects: [{ setFlag: 'npc.agna-fenn.side_after', value: true }], text: 'We hung your bell on the long walk. It wakes the babies and the Choir hates it, so that’s two good reasons to keep it. We ring it at dark of the moon now, and everybody comes out on the walks and counts heads. It’s a better tithe than eels.' },
      weir: { speaker: 'npc:agna-fenn', effects: [{ setFlag: 'npc.agna-fenn.side_after', value: true }], text: 'Cob told me about Ninestake. (She looks at you the way she looks at weather.) He’s laughed every day since. Not the bad laugh. Thank you.' },
    },
  },
];

export default dialogues;
