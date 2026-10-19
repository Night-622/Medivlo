/**
 * Hollow Crown, WARDEN Act I depth pass (10-campaign-style.md §8, docs/PACING.md): the new stages' scenes,
 * investigation beats, travel banter, optional finds and the third parts of the side quests. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const offer = (q: Q, text: string, to: string, extra?: NarrativeCondition): DialogueChoice =>
  ({ text, to, quest: true, when: extra ? { all: [fresh(q), extra] } : fresh(q), effects: [{ startQuest: q }] });
/** a stage scene that takes over an NPC's talk must still let them give their own quests */
const more = (...offers: DialogueChoice[]): DialogueChoice[] => [...offers, { text: 'Thank you.', to: null }];
const NIGHT: NarrativeCondition = { hour: [21, 4] };
const DO = 'npc:dagny-orr' as const, KR = 'npc:kettil-rask' as const, IH = 'npc:ingrith-halfmile' as const;
const ES = 'npc:ebbe-strand' as const;
const IT = 'npc:ingeborg-tull' as const, TC = 'npc:thyri-coldbrook' as const;
const FIRES_DONE: NarrativeCondition = { questCompleted: 'quest:warden-the-watch-fires' };

/** an object beat: one scene while its stage runs (sets its flag), a plain line otherwise */
function beat(id: string, name: string, when: NarrativeCondition, text: string, flag: string, plain: string, more?: string): DialogueDef {
  return {
    id: `dialogue:obj-${id}`, name, scope: 'party',
    entries: [{ when, node: 'beat' }, { node: 'plain' }],
    nodes: {
      beat: { speaker: 'narrator', text, effects: [{ setFlag: flag, value: true }], next: more ? 'more' : null },
      ...(more ? { more: { speaker: 'narrator', text: more, next: null } } : {}),
      plain: { speaker: 'narrator', text: plain, next: null },
    },
  };
}

const dialogues: DialogueDef[] = [
  // ======================= I-1 The Horn at Midnight: the head count, Dagny’s quarters
  ...[
    'Up in the horn-loft, a Warden of fifty is asleep with the Gatehouse horn in his arms like a baby. He slept through the bell, the horn, the wolves and the Captain. He opens one eye and asks if it’s breakfast.',
    'Behind the stables, a recruit is stuck to the waist in a drift, in his nightshirt, holding his shield over his head. He has been holding the line since the wolves came. The line was somewhere else.',
    'On the Rampart steps a Warden in her nightshirt stands quite still, looking north at the Breach. “Listen,” she says. “The patch. It creaks every night, like a ship. Tonight it’s quiet. Tonight it’s listening.”',
  ].map((text, i): DialogueDef => beat(`warden-missing-warden-${i + 1}`, `I-1 a missing Warden (${i + 1})`, stage('quest:warden-the-horn-at-midnight', 'heads'),
    text, i === 2 ? 'warden.patch_quiet' : `warden.head_${i + 1}`, 'Footprints in the snow, going back to bed.')),
  {
    id: 'dialogue:warden-dagny-quarters', name: 'I-1 Dagny’s quarters, after the wolves', scope: 'party',
    entries: [{ node: 'in' }],
    nodes: {
      in: { speaker: 'narrator', text: 'Dagny’s quarters: a cot, a shield-rack, a window facing north, and on the wall an old horn as long as your arm with a crack in its bell. She is pouring two cups of something that is mostly fire.', next: 'count' },
      count: {
        speaker: DO, text: 'Forty? Forty. Good. Sit. Twenty-eight years as Captain, and I’ve never once had to count to forty twice in a night.',
        choices: [
          { text: 'The patch at the Breach has gone quiet, Captain.', to: 'quiet', when: { flag: 'warden.patch_quiet' } },
          { text: 'Why did you hear a horn?', to: 'horn' },
          { text: '(Drink it.)', to: 'drink' },
        ],
      },
      quiet: { speaker: DO, mood: 'afraid', text: 'Quiet. That patch has creaked every night since last winter like a ship in a gale. (She looks north, out of the dark window.) If it’s gone quiet, it’s listening. For you, maybe.', next: 'stone' },
      horn: { speaker: DO, text: 'Because I’m deaf, pup, and what you hear when you’re deaf is what you expect. Forty-six years on this wall, and the only thing I ever expected to hear was a horn.', next: 'stone' },
      drink: { speaker: 'narrator', text: 'It is mostly fire. Dagny watches you not cough with professional interest, and nods once. “Good. You’ll do.”', next: 'stone' },
      stone: {
        speaker: DO, text: 'That story I told you in the yard, about half the Rime Stone falling into the Wall. Torvald told it best. He told it to every batch of recruits on their first night, round the fire, with the voices.',
        choices: [
          { text: 'Torvald broke the wall.', to: 'broke' },
          { text: 'You miss him.', to: 'miss', trust: 1 },
        ],
      },
      broke: { speaker: DO, mood: 'angry', text: 'He did. With a hammer, last winter, while I slept. And when I came down there were clan children coming through the hole, and black tears coming in behind them. I branded him and put him over. I’d do it again.', next: 'patch' },
      miss: { speaker: DO, mood: 'sad', text: '(She doesn’t answer for a while.) He taught half the Gatehouse to set a shield. He taught you. Every time you set your feet I see him do it. Yes. I miss him. Don’t tell Kettil.', next: 'patch' },
      patch: { speaker: DO, text: 'And if your song is coming from the Breach, then it’s been singing in that patch all winter, and I’m the one who put the patch there. (A short, hard laugh.) I walled your stone in, pup. Well. One thing at a time.', next: 'fires' },
      fires: {
        speaker: DO, text: 'First thing. The watch-fires on the Long Rampart have been going out, one a night, and nobody can tell me why. Walk the Rampart. Find out. Report to me. Speak UP.',
        choices: [
          { text: 'Yes, Captain.', to: 'end' },
          { text: 'Get some sleep, Captain.', to: 'sleep' },
        ],
      },
      sleep: { speaker: DO, mood: 'happy', text: 'Sleep. I’ve heard of it. (She is already pulling her boots back on.) Go on.', next: null },
      end: { speaker: DO, text: 'Go on. And put some trousers on.', next: null },
    },
  },

  // ======================= I-2 The Watch-Fires: the Rampart, the seep
  {
    id: 'dialogue:area-warden-rampart-walk', name: 'I-2 banter: along the Long Rampart', bark: true,
    entries: [{ when: stage('quest:warden-the-watch-fires', 'fires'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'A mile of Rampart between every fire. The wind up here has opinions, and it shares all of them, all the way along.', next: null } },
  },
  beat('warden-seep-crack-1', 'I-2 the seep (1)', stage('quest:warden-the-watch-fires', 'seep'),
    'A crack in the inner face of the Rampart, weeping black like a cut. You put your glove to the stone beside it. It is warm, which the Wardwall has never once been.',
    'warden.seep_1', 'A crack in the Rampart, freshly mortared.'),
  beat('warden-seep-crack-2', 'I-2 the seep (2)', stage('quest:warden-the-watch-fires', 'seep'),
    'Further along the seep is wider, and somebody has chalked an arrow beside it pointing north, and the words GETTING WORSE. — K. Kettil has been walking the Rampart on his own, and not telling anyone.',
    'warden.seep_2', 'A chalk arrow on the Rampart, half rubbed away.'),
  beat('warden-seep-crack-3', 'I-2 the seep (3)', stage('quest:warden-the-watch-fires', 'seep'),
    'From the last tower you can see the Breach patch a mile off, a grey scar in the wall. The seep doesn’t run towards it. It runs away from it, both ways along the wall, like ink spreading from a dropped pen.',
    'warden.seep_traced', 'A tower on the Rampart, looking out towards the Breach.', 'Whatever came in through the Breach last winter is still in the stones. And it is travelling.'),

  // ======================= I-3 The Jarl’s Longhall: over the wall
  {
    id: 'dialogue:area-warden-jarlsfell-road', name: 'I-3 banter: over the wall', bark: true,
    entries: [{ when: stage('quest:warden-the-jarls-longhall', 'hall'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Over the wall for the first time in your life. The snow is deeper on this side, and the wind is the same wind, and nobody has ever told it which side it’s on.', next: null } },
  },

  // ======================= I-4 The Wallbreaker’s Parley: the clans’ camp
  beat('warden-clan-fire-1', 'I-4 the clans’ camp (1)', stage('quest:warden-the-wallbreakers-parley', 'camp'),
    'A clan family round a fire of dung and heather, six of them under one blanket. The mother looks at your shield, then at your face, and puts another handful on the fire so that you can warm your hands.',
    'warden.camp_1', 'A dead fire in a fold of the Wolfrun.'),
  beat('warden-clan-fire-2', 'I-4 the clans’ camp (2)', stage('quest:warden-the-wallbreakers-parley', 'camp'),
    'Children are playing Wardens and Clans in the snow with sticks. The Wardens are winning. They always win in the game, a small boy explains to you kindly. That’s how you can tell it’s a game.',
    'warden.camp_2', 'Stick-swords in a trampled snowbank.'),
  beat('warden-clan-fire-3', 'I-4 the clans’ camp (3)', stage('quest:warden-the-wallbreakers-parley', 'camp'),
    'At the last fire the clans’ own banners lie rolled and tied: the bear of the Jarlsfell, the open hand of the steadings. Nobody is flying them. Over Torvald’s tent there is only his white parley-flag, snapping in the wind.',
    'warden.banners_furled', 'A tent-pole in the snow, with nothing on it now.', 'In the Jarlsfell, an old woman tells you, you furl your banner when you are going to a funeral, or when you have stopped belonging to yourself.'),

  // ======================= I-5 The Wall Moot: the sergeant and the furthest fire
  {
    id: 'dialogue:warden-kettil-canvass', name: 'I-5 Kettil before the moot', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: KR, text: 'The moot. Right. (He straightens your shield without looking.) You want to know how I’ll vote. I’ll vote the wall. I always vote the wall. Somebody has to, or there’s no point having one.', next: 'why' },
      why: {
        speaker: KR, text: 'Four hundred Wardens on this stretch, and a postern that opens one way. You open it for the clans, you open it for whatever’s walking with the clans. I chalked the seep. I know what came in last winter.',
        choices: [
          { text: 'And if we keep it shut?', to: 'shut' },
          { text: 'You chalked it, and you told nobody.', to: 'nobody', trust: 1, trustNpc: KR },
        ],
      },
      shut: { speaker: KR, mood: 'sad', text: 'Then children cough on the other side of a wall all winter, and we listen to it. I’ve done that. It doesn’t get easier. It only gets quieter, and the quiet is worse.', choices: more(offer('quest:warden-bounty-wolfrun-pack', 'Any bounties on the board?', 'board', FIRES_DONE)) },
      nobody: { speaker: KR, text: '(He stops fiddling with your shield.) Told who? The Captain can’t hear me. And the rest would’ve panicked. A sergeant’s job is to worry quietly so the yard doesn’t have to. Now you know. Worry quietly.', choices: more(offer('quest:warden-bounty-wolfrun-pack', 'Any bounties on the board?', 'board', FIRES_DONE)) },
      board: { speaker: KR, text: 'Hollow wolves, six of them, taking sledge-ponies in the passes. Gatehouse pays by the pelt. Bring me pelts. Not ponies.', next: null },
    },
  },
  {
    id: 'dialogue:warden-ingrith-canvass', name: 'I-5 Ingrith before the moot', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: IH, text: 'A moot. They’ve not had a moot since I was a girl. (She doesn’t look away from her fire.) And you’ve walked a mile of Rampart to ask what the old woman at the end thinks. Well. Nobody else has.', effects: [{ setFlag: 'warden.ingrith_asked', value: true }], next: 'lights' },
      lights: {
        speaker: IH, text: 'I’ll tell you what I know, which is lights. Two hundred and eleven over there, every night. Forty-one this side. Forty years I’ve counted, and every winter there are a few less over there.',
        choices: [
          { text: 'Will you come down and say that at the moot?', to: 'come' },
          { text: 'Which side do you count first?', to: 'first' },
        ],
      },
      first: { speaker: IH, text: 'Theirs. Always theirs. Ours aren’t going anywhere. (She smiles, crookedly.) That’s my vote, I suppose, if you want it.', next: 'come' },
      come: { speaker: IH, mood: 'happy', text: 'Leave my fire? For one night? (She looks at it a long while.) For a moot, I will. Somebody keep it fed. Not you. You’ll be talking.', choices: more(offer('quest:warden-the-last-watch-fire', 'I could keep it for you another night. Properly.', 'bed')) },
      bed: { speaker: IH, mood: 'happy', text: 'A whole night? So I could sleep in a bed? (She stares at you.) Right. After dark, then. Keep it fed. Watch the dark. Count the lights, they like that.', next: null },
    },
  },

  // ======================= I-6 The Wraith Barrows: the road down
  {
    id: 'dialogue:area-warden-barrow-road', name: 'I-6 banter: down to the barrows', bark: true,
    entries: [{ when: stage('quest:warden-the-wraith-barrows', 'barrows'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Lights in the Wraith Barrows, cold and blue, where nobody has been buried in a hundred years. Every Warden learns the barrow-song as a recruit. Nobody ever learns the second verse. Tonight you can hear somebody singing it.', next: null } },
  },

  // ======================= I-7 The Empty Banner: the fallen below the Breach
  beat('warden-fallen-hollowed-1', 'I-7 the fallen (1)', stage('quest:warden-the-empty-banner', 'field'),
    'A Warden you sparred with two winters ago, who went out on patrol past the Breach and never came back. The black has gone out of her eyes. Her shield still has your dent in it.',
    'warden.fallen_1', 'A trampled place on the ice below the Breach.'),
  beat('warden-fallen-hollowed-2', 'I-7 the fallen (2)', stage('quest:warden-the-empty-banner', 'field'),
    'An old Warden with a cook’s burns on his hands, who used to slip you crusts when you were small. Frozen in his fist is a wooden spoon from a clan steading. He had been eating at their fires.',
    'warden.fallen_2', 'A wooden spoon in the snow, half buried.'),
  beat('warden-fallen-hollowed-3', 'I-7 the fallen (3)', stage('quest:warden-the-empty-banner', 'field'),
    'The last of them has a letter in his belt, folded small, in a fine hand that is not Torvald’s: “To all who were ever kept out. There is a seat at my table. Come south, through the White Gate. Bring nothing. You will want for nothing.”',
    'warden.table_letter', 'Ice below the Breach, scuffed by many feet going south.', 'It is not signed. At the top of the page someone has drawn a crown, very carefully, with nothing inside it.'),

  // ======================= I-9 The Long Walk: the boundary stone
  {
    id: 'dialogue:warden-dagny-boundary', name: 'I-9 Dagny at the boundary stone', scope: 'party',
    entries: [{ node: 'stone' }],
    nodes: {
      stone: { speaker: 'narrator', text: 'A grey stone at the roadside, cut with the Wardens’ fin and the words THE WALL HOLDS TO HERE. Beyond it the road runs on south to the White Gate, and the snow is trodden flat by a thousand clan feet.', effects: [{ unlockLore: 'lore:hc-rime-boundary-stone' }], next: 'dagny' },
      dagny: {
        speaker: DO, text: 'This is me, pup. No Wall-Captain has gone past this stone on duty in a thousand years. (She puts one boot up on it.) I could. I’ve thought about it all the way down.',
        choices: [
          { text: 'Then come.', to: 'come' },
          { text: 'The Wall needs you more.', to: 'need' },
          { text: 'And Hekla?', to: 'sister', when: { flag: 'warden.sisters_laughed' } },
        ],
      },
      come: { speaker: DO, mood: 'happy', text: 'And leave Kettil in charge for more than a week? There’d be no Wall. There’d be a very straight line of very frightened Wardens, and a lot of polished hedges.', next: 'order' },
      need: { speaker: DO, mood: 'sad', text: 'The Wall needs a Captain. That isn’t quite the same as needing me. I’ve always had trouble telling the two apart.', next: 'order' },
      sister: { speaker: DO, mood: 'happy', text: 'She says she’ll walk me home from the steading of a morning, now, and back of an evening. Thirty years we lost over a postern. (An enormous grin.) I’m not losing any more over a stone.', next: 'order' },
      order: {
        speaker: DO, text: 'Last order, then, and listen, because I’m saying it once. When you’ve done what you’re going to do, come home. There’s a horn-call for it. Long, two short. Come home when you’re done.',
        choices: [
          { text: 'Long, two short. I’ll hear it.', to: 'hear', trust: 1 },
          { text: 'You’ll never hear me answer.', to: 'deaf' },
        ],
      },
      hear: { speaker: DO, text: 'You will. You always have. Every word, first time, all your life. (Gruff.) Nobody else ever has. Go on.', next: 'go' },
      deaf: { speaker: DO, mood: 'happy', text: 'No. But I’ll feel it in my boots. Feet. Shield. Eyes front.', next: 'go' },
      go: { speaker: 'narrator', text: 'You walk on south. When you look back from the next rise she is still standing at the stone with one boot on it, very straight, the only thing on the road that isn’t moving.', next: null },
    },
  },

  // ======================= Side: the Misheard Orders (asking the Captain)
  {
    id: 'dialogue:warden-dagny-clemmie', name: 'The Misheard Orders: asking the Captain', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: DO, text: 'WHAT did I say to who? (You explain: Clemmie Briggs, her first day, “do well” or “do the wells”.) …She’s been cleaning the WELLS? For a YEAR?', next: 'think' },
      think: {
        speaker: DO, text: '(She thinks, scowling, which is how she remembers things.) “You’ll do well, Briggs.” I say it to every runner. I meant it more with her. She has a good pair of legs and she’s frightened of nothing but me.',
        choices: [
          { text: 'I’ll tell her.', to: 'tell' },
          { text: 'You could tell her yourself. Quietly.', to: 'quiet', trust: 1 },
        ],
      },
      tell: { speaker: DO, text: 'Tell her. And tell her the wells have never been cleaner, and she can stop now, and that’s an ORDER.', next: null },
      quiet: { speaker: DO, text: 'Quietly. Right. (She tries it.) You’ll do well, Briggs. (It comes out at about the volume of a small avalanche.) …I’ll practise.', next: null },
    },
  },

  // ======================= Side: the Ration Ledger (the bread drop)
  {
    id: 'dialogue:obj-warden-bread-drop', name: 'The Ration Ledger: the bread drop', scope: 'party',
    entries: [
      { when: { all: [stage('quest:warden-the-ration-ledger', 'drop'), NIGHT, { flag: 'warden.ebbe', op: '==', value: 'helped' }] }, node: 'sack' },
      { when: { all: [stage('quest:warden-the-ration-ledger', 'drop'), NIGHT] }, node: 'none' },
      { when: stage('quest:warden-the-ration-ledger', 'drop'), node: 'day' },
      { node: 'plain' },
    ],
    nodes: {
      sack: { speaker: 'narrator', text: 'After dark a sack comes down the rope at the foot of the Rampart, bump, bump, bump. On the far side a girl of about ten in clan furs is waiting for it. You know her. She waved at you from the snow below the sixth fire.', next: 'girl' },
      girl: {
        speaker: 'narrator', text: 'She shoulders the sack, and sees you, and is not frightened at all. “You’re not Ebby,” she says. “Tell Ebby the goat’s better.”',
        choices: [
          { text: '“What’s your name?”', to: 'name', effects: [{ setFlag: 'warden.bread_drop', value: 'runa' }] },
          { text: '(Wave.)', to: 'wave', effects: [{ setFlag: 'warden.bread_drop', value: 'waved' }] },
        ],
      },
      name: { speaker: 'narrator', text: '“Runa,” she says, “and the goat is Gubbins, and he isn’t ours, he’s everyone’s.” Then she runs, with forty loaves on her back, faster than any Warden you know.', next: null },
      wave: { speaker: 'narrator', text: 'She waves back with her whole arm, and runs, with forty loaves on her back. Somewhere out in the Jarlsfell a light comes on that wasn’t on before.', next: null },
      none: {
        speaker: 'narrator', text: 'No sack comes down tonight. The Captain has the ledger now. On the far side a girl in clan furs waits at the rope’s end, stamping her feet, looking up.',
        choices: [
          { text: '(Send your own rations down the rope.)', to: 'mine', effects: [{ setFlag: 'warden.bread_drop', value: 'rations' }] },
          { text: '(Call down that the bread has stopped.)', to: 'stopped', effects: [{ setFlag: 'warden.bread_drop', value: 'stopped' }] },
        ],
      },
      mine: { speaker: 'narrator', text: 'One loaf and a heel of cheese go down the rope. It isn’t forty. She takes it anyway, and nods up at you, very solemnly, the way you’d nod to somebody on the same watch.', next: null },
      stopped: { speaker: 'narrator', text: 'She listens, and nods, and does not cry, which is worse. Then she goes away into the dark, not fast. You stand at the rope a long time after.', next: null },
      day: { speaker: 'narrator', text: 'A rope hangs slack against the Rampart. Ebbe said after dark.', next: null },
      plain: { speaker: 'narrator', text: 'A rope at the foot of the Rampart, frayed where a sack rubs.', next: null },
    },
  },

  // ======================= Side: the Last Watch-Fire (the lamp below the wall)
  {
    id: 'dialogue:obj-warden-far-lamp', name: 'The Last Watch-Fire: the lamp below the wall', scope: 'party',
    entries: [{ when: stage('quest:warden-the-last-watch-fire', 'lamp'), node: 'lamp' }, { node: 'plain' }],
    nodes: {
      lamp: { speaker: 'narrator', text: 'Just over the wall, under an overhang where nobody would ever look, a lamp sits in a niche cut into the rock, its wick burned down to nothing. Beside it, a jar of oil and a note weighted with a stone.', next: 'note' },
      note: {
        speaker: 'narrator', text: '“For the woman on the furthest fire. So she knows somebody sees her. — H.” The note has been rewritten many times, on many pieces of paper, in the same hand, getting shakier.',
        choices: [
          { text: '(Trim the wick, fill the lamp and light it.)', to: 'lit', effects: [{ setFlag: 'warden.lamp_relit', value: true }] },
          { text: '(Fill it and light it, and add a line of your own to the note.)', to: 'line', effects: [{ setFlag: 'warden.lamp_relit', value: true }] },
        ],
      },
      lit: { speaker: 'narrator', text: 'It catches at once. High above on the Rampart, at the far end, you can see Ingrith’s fire. From down here the two lights look exactly like a pair of eyes.', next: null },
      line: { speaker: 'narrator', text: 'Under “— H.” you write: “She sees you too.” It isn’t yours to say. You are almost sure it is true.', next: 'lit' },
      plain: { speaker: 'narrator', text: 'A lamp in a niche under the wall, burning steadily.', next: null },
    },
  },

  // ======================= Side: Letters Over the Wall (the Captain’s letter)
  {
    id: 'dialogue:warden-dagny-letter', name: 'Letters Over the Wall: the Captain’s letter', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: DO, text: 'A letter. For me. From over the wall. (She turns it over twice. There is no name on it anywhere.) Who’s it from?',
        choices: [
          { text: 'It isn’t signed.', to: 'read' },
          { text: 'Tilda thinks you’ll know.', to: 'read' },
        ],
      },
      read: {
        speaker: 'narrator', text: 'She reads it. Her face does nothing at all, which on Dagny Orr is enormous. Then she reads it again.',
        choices: [
          { text: 'What does it say?', to: 'says' },
          { text: '(Say nothing.)', to: 'nothing' },
        ],
      },
      says: { speaker: DO, text: 'It says my chimney smokes too much and I should get it swept. (She folds it very small and puts it inside her coat, over her heart.) It’s about the goat.', next: null },
      nothing: { speaker: DO, text: '(She folds it very small and puts it inside her coat.) Thank you, pup. Off you go. Not a word to Tilda. Not a WORD.', next: null },
    },
  },

  // ======================= Side: the White Pack (the pup in the kitchen)
  {
    id: 'dialogue:obj-warden-stray-pup', name: 'The White Pack: the pup in the kitchen', scope: 'party',
    entries: [{ when: stage('quest:warden-the-white-pack', 'pup'), node: 'pup' }, { node: 'plain' }],
    nodes: {
      pup: {
        speaker: 'narrator', text: 'In the mess kitchen the cook is standing on a table, holding a ladle like a sword. Under the table a white wolf pup is eating what is left of the cake shaped like the cook. It has started with the head.',
        choices: [
          { text: '(Carry it back to the den yourself.)', to: 'carry', effects: [{ setFlag: 'warden.pup_returned', value: 'carried' }] },
          { text: '(Set it outside the postern at dusk, and wait on the wall.)', to: 'wait', effects: [{ setFlag: 'warden.pup_returned', value: 'postern' }] },
        ],
      },
      carry: { speaker: 'narrator', text: 'It sleeps all the way to the Wolfrun in the crook of your arm, smelling of icing. At the den the alpha takes it by the scruff without a sound, and looks at you the way a Captain looks at a Warden who has done well.', next: null },
      wait: { speaker: 'narrator', text: 'At dusk the alpha comes down out of the Wolfrun, alone, to the foot of the wall. Forty Wardens watch with bows, and not one of them draws. She takes the pup and goes. No wolf has ever come to the Wardwall and left again before.', next: null },
      plain: { speaker: 'narrator', text: 'The mess kitchen, and a cook who checks under the table now before he sits down.', next: null },
    },
  },

  // ======================= Side: Out of the Hour (Leif’s cairn)
  {
    id: 'dialogue:obj-warden-leif-cairn', name: 'Out of the Hour: Leif Frosk’s cairn', scope: 'party',
    entries: [{ when: stage('quest:warden-out-of-the-hour', 'grave'), node: 'cairn' }, { node: 'plain' }],
    nodes: {
      cairn: {
        speaker: 'narrator', text: 'In the cairn-field below the Wolfrun, among a hundred Warden cairns, one small one with a shield-boss set into the top stone: LEIF FROSK. WARDEN. WAITED.',
        choices: [
          { text: '(Tell him she came.)', to: 'tell' },
          { text: '(Set a stone on the cairn, the way Wardens do.)', to: 'stone' },
        ],
      },
      tell: { speaker: 'narrator', text: '“She came,” you tell the cairn. “She’s forty-one. She walked down out of the hour, and your girl brought her, and they argued all the way.” The wind goes round the cairn and on. It seems to be enough.', next: null },
      stone: { speaker: 'narrator', text: 'You set a stone on top. Somebody has been setting them here every winter; there are nine already, one for every year he has been gone. Their daughter’s, you think. And now one more.', next: null },
      plain: { speaker: 'narrator', text: 'A small Warden cairn below the Wolfrun, with ten stones on top.', next: null },
    },
  },

  // ======================= Side: the Steading Oven (a loan, repaid)
  {
    id: 'dialogue:warden-ebbe-loaf', name: 'The Steading Oven: a loan, repaid', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: ES, text: 'A loaf? From over the wall? For me? (He holds it as if it might go off.) Nobody has ever paid me back for anything. I’m the quartermaster. People only ever take.',
        choices: [
          { text: 'Hekla says it’s a loan, repaid.', to: 'loan' },
          { text: 'The children ate hot tonight, Ebbe.', to: 'children', trust: 1, trustNpc: ES },
        ],
      },
      loan: { speaker: ES, mood: 'happy', text: 'A loan, repaid. (He opens the ledger and writes it in the income column, which has been empty for a year.) There. The sums add up. The sums actually add up.', next: null },
      children: { speaker: ES, mood: 'sad', text: '(He sits down on a barrel.) Hot. Good. That’s good. That’s… (He blows his nose.) Don’t tell the Captain I cried on the bread.', next: null },
    },
  },

  // ======================= Side: the Goat That Crosses Walls (the smugglers’ niche)
  beat('warden-smugglers-niche', 'The Goat That Crosses Walls: the niche', stage('quest:warden-the-goat-that-crosses-walls', 'cache'),
    'A niche in the far face of the wall with a lid of slate. Inside: a pair of Wardwall socks, a round of clan cheese, and a slate in two hands. “Socks for cheese, as before. — the Wall.” “Cheese for socks. Mind the goat. — the Fell.”',
    'warden.niche_read', 'An empty niche at the foot of the goat stair, its slate lid set straight.', 'A tally-stick hangs inside, notched in two colours, a hundred years deep. The Wall and the clans have been trading through this hole longer than anyone on either side has been alive. Gubbins was only ever the postman.'),

  // ======================= Optional areas (Claude 2): finds round the Wardwall
  {
    id: 'dialogue:obj-rime-frontier-ruin-find', name: 'Wardwall ruin: the first postern', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'A gate-tower from the first Wardwall, older than the Gatehouse, its arch still standing with no wall left either side. Over the arch, in the founder’s square hand: COME IN FROM THE COLD. The hinges are on the outside, so that it could only ever be pushed open from the north.', effects: [{ unlockLore: 'lore:hc-rime-frontier-ruin' }], next: null } },
  },
  {
    id: 'dialogue:obj-rime-frontier-cave-find', name: 'Wardwall cave: the Captain’s Echo', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'Deep in the cave the wind comes through a crack and sounds exactly like a horn: long, two short. Scratched beside the crack, very old: IT’S ONLY THE WIND. Scratched under that, newer: THAT’S WHAT SHE SAYS TOO.', effects: [{ unlockLore: 'lore:hc-rime-frontier-cave' }], next: null } },
  },
  {
    id: 'dialogue:obj-rime-frontier-cave-codex', name: 'Wardwall cave: a snowed-in patrol’s board', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'A board hung in the side cave, a patrol’s log from a century ago, snowed in for a week. Every day the same: “Snow. Cheese. Morale good.” The last entry: “Clans came with a sledge and dug us out. Morale excellent. Do not tell the Captain who.”', effects: [{ unlockLore: 'lore:hc-rime-frontier-patrol' }], next: null } },
  },
  {
    id: 'dialogue:obj-rime-frontier-view-find', name: 'Wardwall viewpoint: both sides', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'From the lookout you can see the Gatehouse lights to the south and the steadings of the Jarlsfell to the north, and between them the Wardwall, a hundred miles long and, from up here, as thin as a pencil line. You could cover it with your thumb.', effects: [{ unlockLore: 'lore:hc-rime-frontier-view' }], next: null } },
  },
  // ======================= ACT II (wave 2 depth): C-1 the gate log
  {
    id: 'dialogue:obj-warden-gate-log', name: 'C-1 the gate log at the Warden’s Gate', scope: 'party',
    entries: [{ when: stage('quest:warden-wardenhold', 'log'), node: 'log' }, { node: 'plain' }],
    nodes: {
      log: { speaker: 'narrator', text: 'The Warden’s Gate stands across the road at the foot of the pass, iron-bound, facing north. Chained to the gatepost is a log-book as thick as a doorstep. Every entry, dawn and dusk, for thirty years: NOTHING CAME.', next: 'pages' },
      pages: { speaker: 'narrator', text: 'You turn the pages. NOTHING CAME. NOTHING CAME. Somebody has drawn a very small goat in one margin and been made to rub it out. NOTHING CAME, dusk, C. 1030, and underneath, in a shaky hand: but it was a lovely sunset.', next: 'ingeborg' },
      ingeborg: {
        speaker: IT, text: 'Twenty-one thousand entries and some. I signed eleven thousand of them myself. (She is at your elbow.) You’re thinking it’s daft. Drilling at a gate that faces nothing.',
        choices: [
          { text: 'A gate doesn’t know what’s coming. That’s why you keep it.', to: 'keep', trust: 1 },
          { text: 'It is a bit daft.', to: 'daft' },
        ],
      },
      keep: { speaker: IT, text: '(She looks at you sideways.) Your Captain taught you that. Or the Wall did. It comes to the same thing, in the end.', next: 'sign' },
      daft: { speaker: IT, mood: 'happy', text: '(She laughs, short.) It is. It’s daft and it’s Wardens, and I wouldn’t change a page of it.', next: 'sign' },
      sign: {
        speaker: IT, text: 'Tonight’s dusk entry isn’t written. By the old rules it’s the patrol leader’s to write, and you’re leading tomorrow. (She holds out the pencil.)',
        choices: [
          { text: '(Write: SOMETHING CAME. A WARDEN, FROM THE WALL.)', to: 'came', effects: [{ setFlag: 'warden.gate_log', value: 'came' }] },
          { text: '(Write: NOTHING CAME. And underneath: yet.)', to: 'yet', effects: [{ setFlag: 'warden.gate_log', value: 'yet' }] },
        ],
      },
      came: { speaker: IT, mood: 'happy', text: '(She reads it twice, and has to look away up the pass for a moment.) Thirty years. Right. Patrol at first light, and you’re at the front of it.', next: null },
      yet: { speaker: IT, mood: 'happy', text: 'Yet. (She snorts.) That’s the most cheerful thing anybody’s put in that book. Right. Patrol at first light, and you’re at the front of it.', next: null },
      plain: { speaker: 'narrator', text: 'The gate log, chained to the post of the Warden’s Gate. The last entry is in your hand.', next: null },
    },
  },

  // ======================= ACT II, C-2 The Shut Pass: the turn-back stone
  beat('warden-turnback-stone', 'C-2 the turn-back stone', stage('quest:warden-the-shut-pass', 'turnback'),
    'Above the last cairn, a flat stone set on end by the road, the way Wardens mark a turning point. Five names cut into it, C. 1012, and under them: TURNED BACK. IT WAS HOLDING THE LINE. The top name is INGEBORG TULL, SERGEANT.',
    'warden.turnback', 'A Warden’s turning stone by the pass road.',
    'Under the names, much later and much smaller, in the same hand: I GAVE THE ORDER. Somebody has been coming up here alone to cut that. Not a patrol. One Warden, a letter at a time.'),

  // ======================= ACT II, C-3 The Rimeheart Colossus: telling Ingeborg
  {
    id: 'dialogue:warden-ingeborg-colossus', name: 'C-3 Ingeborg hears what held the pass', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: IT, text: '(The drill yard has stopped. Every Warden in Wardenhold is facing north up the open pass, and nobody told them to.) Well? What was it? What was standing up there that I turned my patrol round for?',
        choices: [
          { text: 'The Colossus. It held the pass for the crown’s road, and when the crown stopped coming it held it shut.', to: 'held' },
          { text: 'A Warden, near enough. It was holding the line, the same as you.', to: 'line', trust: 1 },
        ],
      },
      held: { speaker: IT, text: 'Held it shut. Because it didn’t know what else to do. (She is quiet for a while.)', next: 'asked' },
      line: { speaker: IT, mood: 'sad', text: '(She shuts her eyes.) Aye. That’s what I told them on the road. It’s holding the line. You don’t charge a thing for doing its job.', next: 'asked' },
      asked: {
        speaker: IT, text: 'Did it say anything? At the end?',
        choices: [
          { text: 'It wanted to know what a pass is for, if nobody comes up it.', to: 'for' },
          { text: 'Nothing about you. You cut that last line on the turning stone yourself.', to: 'stone', when: { flag: 'warden.turnback' } },
        ],
      },
      stone: { speaker: IT, mood: 'sad', text: 'You found that. (She looks at her hands.) One letter a winter, when nobody was looking. Twenty-six years to cut four words. That’s how sorry I was.', next: 'for' },
      for: { speaker: IT, text: 'What a pass is for. (She looks up it.) For coming down. For Sigge to come home by, the daft lad.', next: 'sigge' },
      sigge: {
        speaker: IT, text: 'Sigge Brekke. Best drill I ever had. Word came up from the moor about a man in the Gloamwood gathering everybody who’d ever been kept out, and Sigge took his shield and went. Said he’d faced north for twelve years and wanted to see where things went.',
        choices: [
          { text: 'I’m going after the man in the Gloamwood. I’ll look for Sigge.', to: 'look', effects: [{ setFlag: 'warden.sigge_asked', value: true }] },
          { text: 'He made his choice.', to: 'choice' },
        ],
      },
      look: { speaker: IT, text: 'Do. Tell him the gate log’s missing his hand; he’ll know what I mean. (She turns to the yard.) Shields up! Face north! …Something might come down it now.', next: null },
      choice: { speaker: IT, text: 'He did. So did I, once, on that road. (She turns to the yard.) Shields up! Face north! …Something might come down it now.', next: null },
    },
  },

  // ======================= ACT II, C-4 The Kept-Out: Thyri on the procession road
  {
    id: 'dialogue:warden-thyri-road', name: 'C-4 Thyri where she turned round', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'The procession road runs straight through the Gloamwood, older than the trees, paved under the moss. Thyri stops on a flat stone with a notch worn in it, and doesn’t go any further.', next: 'thyri' },
      thyri: {
        speaker: TC, mood: 'sad', text: 'Here. This is where I turned round. (She puts her boot in the notch, exactly.) Eydis was holding my hand, and then she wasn’t. She let go and went on with the others, singing. She’s nine.',
        choices: [
          { text: 'And you came back here anyway.', to: 'back', trust: 1 },
          { text: 'Why did you turn round?', to: 'why' },
        ],
      },
      why: { speaker: TC, text: 'Because there wasn’t a table. Every night he said tomorrow, and every night there was walking, and bowls of rain. I’m a clanswoman. I know what a promise of supper sounds like when there isn’t one.', next: 'see' },
      back: { speaker: TC, text: '(She almost laughs.) Turning round twice. Nobody on the Jarlsfell would believe it of me.', next: 'see' },
      see: { speaker: TC, text: 'Look. (She points down the road.) See the bowls on his table, all in a row? The top ones are the grandmothers’. Then the children, then the rest. He laid it the clan way. He remembered how.', next: 'seats' },
      seats: {
        speaker: TC, text: 'And there, the eleventh place on the left. That one’s Eydis’s. She always sits eleventh, because eleven is her lucky number, because she’s nine and that’s how nine works.',
        choices: [
          { text: 'I’ll bring her back to a table. A real one.', to: 'promise' },
          { text: 'I can’t promise you anything.', to: 'honest' },
        ],
      },
      promise: { speaker: TC, text: 'Don’t promise. He promised. (She holds your sleeve for a moment.) Just go and look.', next: 'go' },
      honest: { speaker: TC, text: 'Good. That’s the first honest thing anybody’s said to me on this road.', next: 'go' },
      go: { speaker: TC, text: 'Go on. I’ll stand here. I’ve got very good at standing here.', effects: [{ setFlag: 'warden.eydis_named', value: true }], next: null },
    },
  },

  // ======================= ACT II, C-5 The White Stag: Torvald’s shield
  beat('warden-torvald-shield', 'C-5 the shield in the glade', stage('quest:warden-the-white-stag', 'shield'),
    'Against the oldest tree in the glade, where the clans’ footprints go past and on: a Wardwall tower shield with the fin crest on the boss, standing on its rim. Torvald’s. The grip is wrapped in two places, one high for a big man and one low, small, worn smooth.',
    'warden.torvald_shield', 'A tower shield standing on its rim against an old tree.',
    'The low grip is the one he put on for you, the first winter, when your hands were too small for a Warden’s shield. He kept it on all these years. Then he left the shield here, on the road into the Heart, because he means never to be a wall again.'),

  // ======================= ACT II, C-6 A Horn from the North: the answer from the Warden’s Gate
  {
    id: 'dialogue:obj-warden-gate-horn', name: 'C-6 the answer from the Warden’s Gate', scope: 'party',
    entries: [{ when: stage('quest:warden-a-horn-from-the-north', 'answer'), node: 'gate' }, { node: 'plain' }],
    nodes: {
      gate: { speaker: 'narrator', text: 'The Warden’s Gate, facing north up the open pass. Ingeborg has hung the Wardenhold horn on the gatepost, a big brass thing, very old. Beyond the pass and a hundred miles of snow there is a wall with a watch on it.', next: 'ingeborg' },
      ingeborg: {
        speaker: IT, text: 'The Wall passes a call along, watch to watch, all the way to the Captain’s door. She won’t hear it. She’ll feel the runner’s boots on her stair. (She steps back.) Your call.',
        choices: [
          { text: '(Long, two short, and one more long: coming home.)', to: 'home', effects: [{ setFlag: 'warden.answer', value: 'home' }] },
          { text: '(Long, two short, two short: holding, not done yet.)', to: 'notyet', effects: [{ setFlag: 'warden.answer', value: 'holding' }] },
          { text: '(One long note, held until your lungs give out: I heard you.)', to: 'heard', effects: [{ setFlag: 'warden.answer', value: 'heard' }] },
        ],
      },
      home: { speaker: 'narrator', mood: 'happy', text: 'The call goes up the pass and over it. Every Warden in the drill yard turns to face north, and somebody starts cheering, and Ingeborg tells them to stop, and doesn’t mean it.', next: 'echo' },
      notyet: { speaker: IT, mood: 'happy', text: 'Long, two short, two short. On the Wall that also means “send bread”. (Ingeborg laughs out loud.) She’ll send it, too. To Wardenhold, by the cartload, out of spite.', next: 'echo' },
      heard: { speaker: 'narrator', text: 'You hold the one note until the horn shakes and your ribs ache and the snow slides off the gatehouse roof. It isn’t a Wall call. It is only true.', next: 'echo' },
      echo: { speaker: 'narrator', text: 'And then, very faint, the call comes back off the mountains, long, two short, as if the pass itself had learned it.', next: null },
      plain: { speaker: 'narrator', text: 'The Wardenhold horn, hanging on the gatepost of the Warden’s Gate.', next: null },
    },
  },

  // ======================= ACT III, Dagny’s Last Watch: the Warden who answered
  {
    id: 'dialogue:obj-warden-legion-warden', name: 'Dagny’s Last Watch: the Warden who answered', scope: 'party',
    entries: [{ when: stage('quest:warden-dagnys-last-watch', 'answer'), node: 'find' }, { node: 'plain' }],
    nodes: {
      find: { speaker: 'narrator', text: 'In the Legion’s ranks one hollowed soldier has turned to face the Weeping Wall, out of step with all the rest. He carries a Wardenhold shield, the old fin crest painted over with the empty crown, badly.', next: 'name' },
      name: {
        speaker: 'narrator', text: 'On the inside of the rim, in a Warden’s neat capitals, the way every Warden marks a shield: S. BREKKE, WARDENHOLD.',
        choices: [
          { text: 'Sigge Brekke. Ingeborg says the gate log’s missing your hand.', to: 'log', when: { flag: 'warden.sigge_asked' } },
          { text: '(Blow the horn again, for him. Long, two short.)', to: 'horn' },
        ],
      },
      log: { speaker: 'narrator', mood: 'happy', text: 'His head comes round. The black runs out of his eyes like meltwater off a roof, and he looks at you with the wounded dignity of a man who has just been told off by Ingeborg Tull through a third party.', next: 'sigge' },
      horn: { speaker: 'narrator', text: 'Long, two short. His head comes round slowly, the way a Warden on a long watch turns at the call. The black runs out of his eyes like meltwater off a roof.', next: 'sigge' },
      sigge: {
        speaker: 'narrator', text: '“I wanted to see where things went,” he says, in a voice like a door that hasn’t been opened all winter. “They went here. It isn’t much of a place.”',
        choices: [
          { text: 'Shields up, Warden. Face north.', to: 'up', effects: [{ setFlag: 'warden.sigge', value: 'up' }] },
          { text: 'Put it down. You’re relieved.', to: 'down', effects: [{ setFlag: 'warden.sigge', value: 'relieved' }] },
        ],
      },
      up: { speaker: 'narrator', mood: 'happy', text: 'He sets his feet and raises the shield, the old drill, perfectly. Then he laughs, and keeps it raised all the way out of the Legion and back to the fires, facing north the whole way, which takes some doing.', effects: [{ trust: DO, delta: 1 }], next: null },
      down: { speaker: 'narrator', text: 'He lays it in the dust with the empty crown face down. “Relieved,” he says, as if the word were something to eat. Then he walks out of the Legion with empty hands, towards the fires.', effects: [{ trust: DO, delta: 1 }], next: null },
      plain: { speaker: 'narrator', text: 'A gap in the Legion’s ranks, where a Warden stood out of step.', next: null },
    },
  },

  // ======================= ACT III, The Clans in the Camp: Eydis, and the table
  {
    id: 'dialogue:warden-thyri-clans', name: 'The Clans in the Camp: Thyri finds Eydis', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'Thyri is pushing through the freed clans the wrong way, against the crowd, looking at every child’s face. She doesn’t see you. She doesn’t see anybody who isn’t nine.', next: 'thyri' },
      thyri: {
        speaker: TC, mood: 'afraid', text: 'Eydis. Eydis Coldbrook. Red hood, gap in her teeth, sits eleventh. Have you seen… (She sees you.) Warden. You came out of there. Did you see her?',
        choices: [
          { text: '(Look along the line of children.)', to: 'look' },
          { text: 'Try eleventh from the front. She’ll be counting.', to: 'eleven', when: { flag: 'warden.eydis_named' } },
        ],
      },
      look: { speaker: 'narrator', text: 'Down the line, in a red hood gone grey with dust, a girl is counting the people in front of her on her fingers, and frowning, because the number keeps changing.', next: 'found' },
      eleven: { speaker: 'narrator', text: 'You count down the line. Eleventh from the front, in a red hood gone grey with dust, a girl is counting the people in front of her on her fingers, very crossly, because they will keep moving.', next: 'found' },
      found: { speaker: 'narrator', text: 'Thyri makes a sound that isn’t a word in any clan tongue and goes through the crowd like a wolf through a fence.', next: 'after' },
      after: {
        speaker: TC, mood: 'happy', text: '(She has the girl on her hip, and the girl is complaining.) She says she lost count. She says it’s my fault for leaving. She’s right. (She is crying and laughing at once.) She’s hungry.',
        choices: [
          { text: 'Then somebody should lay a table.', to: 'table' },
          { text: 'Everybody here is hungry.', to: 'table' },
        ],
      },
      table: { speaker: TC, text: 'There’s no table. There never was. (She looks at you.) …You’re a Warden. You’re going to say something about gates.', next: 'gate' },
      gate: { speaker: TC, text: 'Go on, then. Lay one. A real one. Eydis sits eleventh, I sit next to her, and nobody walks anywhere until we’ve eaten.', effects: [{ setFlag: 'warden.eydis_found', value: true }], next: null },
    },
  },
  {
    id: 'dialogue:obj-warden-heart-table', name: 'The Clans in the Camp: the table', scope: 'party',
    entries: [{ when: stage('quest:warden-the-clans-in-the-camp', 'supper'), node: 'boards' }, { node: 'plain' }],
    nodes: {
      boards: { speaker: 'narrator', text: 'Boards off the Legion’s supply carts, trestles from the camp stores, a heap of bowls that don’t match. You lay it the clan way, the way Thyri showed you on the procession road: grandmothers at the top, then the children, then everybody else.', next: 'food' },
      food: { speaker: 'narrator', text: 'It isn’t a feast. It’s camp bread, whatever the bearers had in their packs, and a pot of something brown from the camp kettle. Nobody minds.', next: 'head' },
      head: {
        speaker: 'narrator', text: 'There is one place left, at the head of the table, where the empty-crown banner stood on the procession road.',
        choices: [
          { text: '(Seat Grandam Hekla there.)', to: 'hekla', when: { flag: 'warden.hekla_met' }, effects: [{ setFlag: 'warden.table', value: 'hekla' }] },
          { text: '(Leave it empty, with a full bowl, for the man who promised.)', to: 'empty', effects: [{ setFlag: 'warden.table', value: 'empty' }] },
          { text: '(Sit there yourself, with your shield against the bench like a gatepost.)', to: 'self', effects: [{ setFlag: 'warden.table', value: 'warden' }] },
        ],
      },
      hekla: { speaker: 'npc:grandam-hekla', mood: 'happy', text: '(She sits down at the head of the table and bangs the boards with her spoon.) Right! I run this table and I run the argument. Eat first. Argue after. Wardens at the bottom.', next: 'eat' },
      empty: { speaker: 'narrator', text: 'You set a bowl at the head and fill it and leave the bench pushed in. Nobody sits there. Halfway through supper you notice that people keep glancing at it, and that none of them look angry.', next: 'eat' },
      self: { speaker: 'narrator', mood: 'happy', text: 'You sit at the head with your shield grounded against the bench, and a clan grandmother tells you to take your elbows off the table, and you do.', next: 'eat' },
      eat: { speaker: 'narrator', mood: 'happy', text: 'Eleventh on the left, Eydis Coldbrook eats three bowls and counts the people at the table out loud, and gets the same number twice running, and is so pleased that she has to lie down.', next: 'end' },
      end: { speaker: TC, text: '(From beside her, very quietly.) He said there’d be a table at the end. He just never said somebody would have to lay it.', effects: [{ trust: TC, delta: 1 }], next: null },
      plain: { speaker: 'narrator', text: 'A long table at the Heart camp, the bowls stacked, the benches pushed in neatly.', next: null },
    },
  },

  // ======================= ACT III, The Goat Who Crosses Walls: the goat’s cairn
  {
    id: 'dialogue:obj-warden-goat-cairn', name: 'The Goat Who Crosses Walls: the cairn', scope: 'party',
    entries: [{ when: stage('quest:warden-the-goat-who-crosses-walls', 'cairn'), node: 'mouth' }, { node: 'plain' }],
    nodes: {
      mouth: { speaker: 'narrator', text: 'The mouth of Gubbins’s gully, where it comes out behind the Legion’s lines. Nobody is watching it. Nobody has ever watched it. There are plenty of loose stones.', next: 'build' },
      build: {
        speaker: 'narrator', text: 'You build it the Wardwall way: a broad base, a narrower course, and a flat stone on top facing the way the road goes. It is the first patrol cairn ever raised in the Heart.',
        choices: [
          { text: '(Cut the Warden’s fin crest on the top stone.)', to: 'mark', effects: [{ setFlag: 'warden.goat_cairn', value: 'crest' }] },
          { text: '(Cut GUBBINS’S WAY on the top stone.)', to: 'name', effects: [{ setFlag: 'warden.goat_cairn', value: 'gubbins' }] },
        ],
      },
      mark: { speaker: 'narrator', text: 'You cut the fin crest, small and neat. Anybody who was ever a Warden will know what it means: a road, watched, and safe.', next: 'goat' },
      name: { speaker: 'narrator', mood: 'happy', text: 'You cut it in capitals, with the apostrophe in the right place, because Dagny will check.', next: 'goat' },
      goat: { speaker: 'narrator', mood: 'happy', text: 'Old Gubbins watches you finish. Then he climbs the cairn, stands on the top stone with enormous dignity, and eats the corner of your journal. It is, you have to admit, the highest point for a mile.', next: null },
      plain: { speaker: 'narrator', text: 'A patrol cairn at the mouth of a gully behind the Legion, with a goat-shaped scuff on the top stone.', next: null },
    },
  },
];

export default dialogues;
