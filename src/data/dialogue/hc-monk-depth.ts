/**
 * Hollow Crown, MONK Act I depth pass (10-campaign-style.md §8, docs/PACING.md): the new stages' scenes,
 * investigation clues, travel banter, optional finds and the third parts of the side quests. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const NIGHT: NarrativeCondition = { hour: [21, 4] };
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const offer = (q: Q, text: string, to: string): DialogueChoice => ({ text, to, quest: true, when: fresh(q), effects: [{ startQuest: q }] });
/** a stage scene that takes over an NPC's talk must still let them give their own quests */
const more = (...offers: DialogueChoice[]): DialogueChoice[] => [...offers, { text: 'Thank you.', to: null }];
const ST = 'npc:shirin-tal' as const, KS = 'npc:kestrel' as const, AH = 'npc:agnetha-hume' as const, BK = 'npc:bodhan-kreel' as const;
const CELLS: Q = 'quest:monk-the-empty-cells';
const FS = 'npc:faraj-stillwater' as const;
const MC1: Q = 'quest:monk-the-welcome-hall', MC5: Q = 'quest:monk-the-stormcrow', MC6: Q = 'quest:monk-a-move-by-post';
const LAST: Q = 'quest:monk-the-last-move', SOPQ: Q = 'quest:monk-sop-on-the-stair';

/** a clue object: one scene while its stage runs (sets its flag), a plain line otherwise */
function clue(id: string, name: string, when: NarrativeCondition, text: string, flag: string, plain: string, more?: string): DialogueDef {
  return {
    id: `dialogue:obj-${id}`, name, scope: 'party',
    entries: [{ when, node: 'clue' }, { node: 'plain' }],
    nodes: {
      clue: { speaker: 'narrator', text, effects: [{ setFlag: flag, value: true }], next: more ? 'more' : null },
      ...(more ? { more: { speaker: 'narrator', text: more, next: null } } : {}),
      plain: { speaker: 'narrator', text: plain, next: null },
    },
  };
}
/** a one-node find (optional areas) that unlocks a codex entry */
const find = (id: string, name: string, text: string, lore: `lore:${string}`): DialogueDef => ({
  id: `dialogue:obj-${id}`, name, scope: 'party',
  entries: [{ node: 'find' }],
  nodes: { find: { speaker: 'narrator', text, effects: [{ unlockLore: lore }], next: null } },
});

const dialogues: DialogueDef[] = [
  // ======================= I-1 The Bell on the Stair: up to the Bell Courts at midnight
  {
    id: 'dialogue:area-monk-midnight-stairs', name: 'I-1 banter: up the Stairs at midnight', bark: true,
    entries: [{ when: stage('quest:monk-the-bell-on-the-stair', 'climb'), node: 'b' }],
    nodes: { b: { speaker: ST, text: '(Ahead of you, lantern swinging, not out of breath at all.) Seven hundred. Seven hundred and one. I counted these when I was your age, too. There were fewer then. I am almost sure.', next: null } },
  },
  {
    id: 'dialogue:monk-shirin-midnight', name: 'I-1 under the great bell at midnight', scope: 'party',
    entries: [{ node: 'courts' }],
    nodes: {
      courts: { speaker: 'narrator', text: 'The Bell Courts at midnight: a great square of flagstones open to the stars, and in the middle, on its beam, the great bell of Stonecloister, as big as a cottage. It is still humming. You can feel it through your sandals. Nobody is on the rope.', next: 'hand' },
      hand: { speaker: ST, text: '(She puts her palm flat on the bronze and closes her eyes.) Forty years Agnetha has rung this, every dawn and dusk, and before her old Sister Calloway, and before her a long line of people with bad shoulders. It has never once rung itself. Put your hand here.', next: 'touch' },
      touch: {
        speaker: 'narrator', text: 'The bronze is warm. Under your palm the hum climbs into your arm and meets the singing in your chest, and for a moment they are the same note.',
        choices: [
          { text: 'It’s answering the stone, Mother.', to: 'answer' },
          { text: '(Take the stillness stance, under the bell, and let the hum settle.)', to: 'still', school: 'fist' },
          { text: 'Are you frightened?', to: 'afraid' },
        ],
      },
      afraid: { speaker: ST, mood: 'afraid', text: 'Yes. A little. I have been waiting thirty years for something on this mountain to change, and now it has, and I find I liked waiting. Waiting is very restful. You know where you are with it.', next: 'answer' },
      still: { speaker: 'narrator', text: 'You sink into the stance. The hum in the bronze slows, as if it were listening to your breathing, and steadies, and holds. Shirin opens her eyes and looks at you for a long moment with an expression you have never seen on her before.', next: 'answer' },
      answer: { speaker: ST, text: 'The Fist stone fled the crown thirty years ago and cracked in two as it fell, and half of it came home to the summit. The bell remembers it. Bells remember everything they have been rung for. That is why we keep them.', next: 'summit' },
      summit: {
        speaker: ST, text: 'It is at the very top, past the Mountain King’s empty throne. You will have to climb to it. Not tonight. The Stairs are not kind to people who climb them at midnight with their heads full of singing.',
        choices: [
          { text: 'Will you come with me?', to: 'come' },
          { text: 'What happens when I reach it?', to: 'reach' },
        ],
      },
      come: { speaker: ST, mood: 'happy', text: 'Up a thousand stairs? At my age? I will be at the bottom with the tea, which is where I am most useful. Somebody has to be at the bottom. That is the secret of mountains.', next: 'tea' },
      reach: { speaker: ST, text: 'I do not know. Nobody knows. That is what makes it worth climbing. (She takes her hand off the bell.) But you will not go up empty-handed, and you will not go up before the tea.', next: 'tea' },
      tea: { speaker: ST, text: 'Tomorrow you carry my urn up the Stairs and pour a cup on every landing, as novices always have. It is a good way to climb a mountain: one cup at a time, with something to give at every step.', next: 'bow' },
      bow: {
        speaker: 'narrator', text: 'Above you the bell gives one last long breath of sound and is still.',
        choices: [
          { text: '(Bow to the bell.)', to: 'end', trust: 1, trustNpc: ST },
          { text: '(Bow to the Abbess.)', to: 'end2' },
        ],
      },
      end: { speaker: ST, mood: 'happy', text: 'Good. Always thank the thing that woke you. Bed, now. Mind the step. You know the one.', next: null },
      end2: { speaker: ST, mood: 'happy', text: 'Flatterer. You get that from Kestrel. (She does not say anything else for a moment.) Bed, now. Mind the step.', next: null },
    },
  },

  // ======================= I-2 Tea on Every Landing: following the black trickle
  clue('monk-tear-trail-1', 'I-2 the black trickle (1)', stage('quest:monk-tea-on-every-landing', 'trickle'),
    'The black runs down the edge of each step, along the worn groove where a thousand years of rain have run. It does not soak in. It does not dry. It comes down very slowly, one stair at a time, from somewhere above.', 'monk.trickle_1',
    'A groove worn into the stair-edge by rain.'),
  clue('monk-tear-trail-2', 'I-2 the black trickle (2)', stage('quest:monk-tea-on-every-landing', 'trickle'),
    'On a landing higher up, a staff lies across the stair where the black runs over it: plain ash, its grip wrapped in red thread the way Brother Tamsk wraps his. He dropped it on the way down, and did not stop for it.', 'monk.trickle_2',
    'A landing on the Thousand Stairs.'),
  clue('monk-tear-trail-3', 'I-2 the black trickle (3)', stage('quest:monk-tea-on-every-landing', 'trickle'),
    'The trickle comes from under the great door of the Guardian Hall, out through the gap at the bottom, as if the hall itself were weeping. From inside, very faint, comes the grinding of a stone head turning, and turning, and turning.', 'monk.tears_guardian',
    'The foot of the Guardian Hall’s great door.', 'Whatever is wrong with the mountain, the Guardian is in the way of it.'),

  // ======================= I-4 Kestrel Comes Down: the Foundling Stair
  {
    id: 'dialogue:area-monk-foundling-path', name: 'I-4 banter: down to the Foundling Stair', bark: true,
    entries: [{ when: stage('quest:monk-kestrel-comes-down', 'foundling'), node: 'b' }],
    nodes: { b: { speaker: KS, text: '(Walking backwards in front of you, grinning.) Do you remember the time we hid Mother’s stones bowl in the bell? And it rang at dawn? And she knew it was us before it had finished ringing?', next: null } },
  },
  {
    id: 'dialogue:monk-kestrel-basket', name: 'I-4 the Foundling Stair with Kestrel', scope: 'party',
    entries: [{ node: 'step' }],
    nodes: {
      step: { speaker: 'narrator', text: 'The Foundling Stair is a single broad step on the old pilgrim path below the cloister, worn hollow in the middle. Kestrel sits down in the hollow, knees up, and pats the stone beside him. It is exactly wide enough for a basket.', next: 'here' },
      here: { speaker: KS, text: 'Here. Right here. Mother found us on this step the winter of the long frost, in one basket, with one blanket. I had your foot. She says I wouldn’t let go of it for two days. I don’t remember. I like to think I was making sure you didn’t wander off.', next: 'who' },
      who: {
        speaker: KS, text: 'I used to come down here and wait for whoever left us to come back. Every winter. For years. Did you know that?',
        choices: [
          { text: 'No. You never told me.', to: 'told' },
          { text: 'I used to come down too. I didn’t want you to know.', to: 'too', trust: 1, trustNpc: KS },
        ],
      },
      told: { speaker: KS, mood: 'sad', text: 'No. You were too little, and then you were too sensible. You just stood still and let the cloister happen to you. I wanted somebody to come back and say it had been a mistake.', next: 'owed' },
      too: { speaker: KS, mood: 'sad', text: '(He stares at you.) You did? All those winters? (He laughs, and wipes his eyes on his grey sleeve.) We could have waited together. We could have been cold together. Isn’t that just like us.', next: 'owed' },
      owed: {
        speaker: KS, text: 'Nobody came back. Nobody ever does. That’s the thing I learned on this step, little one. If you want what you’re owed, you have to go up the mountain and take it. Nobody carries it down to you.',
        choices: [
          { text: 'Mother came down. She carried us up.', to: 'mother' },
          { text: 'What do you think you’re owed, Kestrel?', to: 'what' },
        ],
      },
      mother: { speaker: KS, mood: 'sad', text: '(He is quiet for a long time.) Yes. She did. She always does. It’s very annoying of her. It makes it harder to be angry with the rest of the world.', next: 'up' },
      what: { speaker: KS, text: 'A crown, for a start. For Fist. Thirty years late. And then something for us, the two in the basket. A name nobody chose for us out of pity. A place nobody gave us because it was snowing.', next: 'up' },
      up: { speaker: KS, text: '(He gets up and dusts off the step, very carefully, as if somebody might need it.) Go and tell Mother I’m home. Tell her about the goat first. It’ll soften her up.', next: null },
    },
  },

  // ======================= I-5 The Empty Cells: the bell-ringer and the porter, and dusk in the Bell Courts
  {
    id: 'dialogue:monk-agnetha-canvass', name: 'I-5 Agnetha on what the cloister is for', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: AH, text: 'What is the cloister for? (She is greasing the bell’s great hinge, from a ladder, with arms that shake.) It is for ringing the bell at dawn and dusk, so that everyone on this mountain knows the day has begun and the day is done. That is all. That is plenty.', next: 'climbers' },
      climbers: {
        speaker: AH, text: 'The Climbers say we are owed a crown. Perhaps we are. I have never been owed anything in my life, and I have rung this bell every day of it. If they take the cloister up the mountain, who rings it?',
        choices: [
          { text: 'You could teach someone.', to: 'teach' },
          { text: 'Do you think Fist was robbed?', to: 'robbed' },
        ],
      },
      teach: { speaker: AH, mood: 'angry', text: 'Teach someone? With these arms? (She stops, and looks at them, which she never does.) Perhaps. If anyone stayed long enough to learn.', choices: more(offer('quest:monk-the-ringers-arms', 'Let me try ringing it for you.', 'try')) },
      robbed: { speaker: AH, text: 'I think a great many things were taken from a great many people thirty years ago, and the ones who shout loudest about it are not usually the ones who lost most. Now get off my ladder.', choices: more(offer('quest:monk-the-ringers-arms', 'Let me try ringing it for you.', 'try')) },
      try: { speaker: AH, mood: 'angry', text: 'You? (A long, scornful look.) Be in the Bell Courts before dawn tomorrow if you want to learn how it is done properly. Not that you will.', next: null },
    },
  },
  {
    id: 'dialogue:monk-bodhan-canvass', name: 'I-5 Bodhan on what the Climbers are for', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: BK, text: 'What are the Climbers for? (He sits on a rice-sack, which sighs.) Carrying things up. Same as me. Only I carried rice, and they carry a grudge, and a grudge is heavier, and it doesn’t feed anyone at the top.', next: 'king' },
      king: {
        speaker: BK, text: 'He’s sat on that stair a week, the King. I took him his supper. He didn’t eat it. He asked me if I remembered the road. I said I did. He said, “Don’t.”',
        choices: [
          { text: 'What happened on the road, Bodhan?', to: 'road' },
          { text: 'Will you go up with the Climbers?', to: 'go' },
        ],
      },
      road: { speaker: BK, mood: 'sad', text: 'Ask me again when the cloister’s done voting. Some things a man shouldn’t say the day before other people decide something. It’s not fair on them.', next: 'end' },
      go: { speaker: BK, text: 'I’m too old to carry a grudge up a mountain. I’ll carry rice to whoever’s hungry. That’s the only side I’ve ever been on.', next: 'end' },
      end: { speaker: BK, text: 'Go and stand where you mean to stand, young one. That’s all the old Abbess ever asked of anybody. It’s more than most manage.', next: null },
    },
  },
  {
    id: 'dialogue:obj-monk-cells-dusk', name: 'I-5 dusk in the Bell Courts', scope: 'party',
    entries: [
      { when: { all: [stage(CELLS, 'dusk'), { flag: 'monk.cells', value: 'climb' }] }, node: 'climb' },
      { when: { all: [stage(CELLS, 'dusk'), { flag: 'monk.cells', value: 'turned' }] }, node: 'turned' },
      { when: stage(CELLS, 'dusk'), node: 'stay' },
      { node: 'plain' },
    ],
    nodes: {
      stay: { speaker: 'narrator', text: 'Dusk in the Bell Courts. The cloister gate is barred, and on the east side of the courts the summit road is empty. Half the cells are dark. Agnetha climbs into the bell-frame with her shaking arms and rings for dusk, and the sound goes up the empty road after them.', next: 'stay2' },
      stay2: { speaker: 'narrator', text: 'In the half of the cloister that stayed, the lamps come on one by one. Shirin is standing at her window. She lifts her teacup to you across the courts, and then to the summit road, and then she draws the shutter.', effects: [{ setFlag: 'monk.dusk_seen', value: 'stay' }], next: null },
      climb: { speaker: 'narrator', text: 'Dusk in the Bell Courts, and you are wearing the grey. Above you on the summit road the Climbers’ lanterns are going up the mountain in a long line. Below you, the cloister gate is shut, and behind it Agnetha is ringing for dusk.', next: 'climb2' },
      climb2: { speaker: 'narrator', text: 'She rings it badly, for the first time in forty years, as if her arms had finally given up. Or as if she wanted somebody on the summit road to hear the difference.', effects: [{ setFlag: 'monk.dusk_seen', value: 'climb' }], next: null },
      turned: { speaker: 'narrator', text: 'Dusk in the Bell Courts. The Climbers have not gone up the mountain. They are sitting on the flagstones in their grey, in twos and threes, talking very quietly, and some of them are crying. Two have gone back through the cloister gate without anyone stopping them.', next: 'turned2' },
      turned2: { speaker: 'narrator', text: 'When Agnetha rings for dusk, the Climbers all look up at the bell together, the way novices do. Up the summit road, one lantern is going on alone, very fast.', effects: [{ setFlag: 'monk.dusk_seen', value: 'turned' }], next: null },
      plain: { speaker: 'narrator', text: 'The Bell Courts, and the great bell on its beam.', next: null },
    },
  },

  // ======================= I-7 What Is Owed: the Climbers’ camp, and telling the Abbess
  clue('monk-climber-camp-1', 'I-7 the Climbers’ camp (1)', stage('quest:monk-what-is-owed', 'camp'),
    'The Climbers’ camp on the cloud-side: forty bedrolls in rows, very neat, the way they were taught. On each bedroll, folded, a novice’s old robe, the cloister’s grey, kept and not worn. Nobody has thrown theirs away.', 'monk.camp_1',
    'An empty camp on the cloud-side.'),
  clue('monk-climber-camp-2', 'I-7 the Climbers’ camp (2)', stage('quest:monk-what-is-owed', 'camp'),
    'A cook-pot, empty, and beside it a tally-stick of days with three notches since the last meal. Somebody has scratched under the notches, very small: “Kestrel says the King will feed us at the top.”', 'monk.camp_2',
    'An empty cook-pot on the cloud-side.'),
  clue('monk-climber-camp-3', 'I-7 the Climbers’ camp (3)', stage('quest:monk-what-is-owed', 'camp'),
    'Kestrel’s bedroll, at the end of the row, set apart. Under the pillow, a letter in a hand you do not know, written in black that is still wet: “Bring me the stone, and the crown passes to Fist. To whoever carries it.” It is not signed. It does not need to be.', 'monk.climber_letter',
    'Kestrel’s bedroll, rolled up and gone.', 'Somebody has been writing to Kestrel down the tears.'),
  {
    id: 'dialogue:monk-shirin-kestrel-turned', name: 'I-7 telling the Abbess about Kestrel', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: ST, text: '(The board is set up for stones, and nobody is playing. Two cups are poured. She has known you were coming since you set foot on the Stairs.) Sit. Tell me. You have his name on your face.', next: 'tell' },
      tell: {
        speaker: 'narrator', text: 'You tell her: the Cloud Kitchen, the rice, the voice in the tears, the crown passing to whoever carries the stone. She listens with her hands round her cup.',
        choices: [
          { text: 'He means to carry it to the Hollow King himself.', to: 'king' },
          { text: 'There was a letter under his pillow. Written in wet black.', to: 'letter', when: { flag: 'monk.climber_letter' } },
        ],
      },
      letter: { speaker: ST, mood: 'afraid', text: 'Written to him. In the tears. (She sets her cup down very carefully.) Then something out there knows exactly which child to write to. The one who waited on the Foundling Stair every winter for somebody to come.', next: 'king' },
      king: {
        speaker: ST, mood: 'sad', text: 'He always wanted to be given something, and he never believed a gift was a gift. He thought it had to be owed, or it would be taken back. I gave him everything I had, and he kept the receipts.',
        choices: [
          { text: 'You did everything you could, Mother.', to: 'could' },
          { text: 'He’s still your son. He still counts the beads.', to: 'son', trust: 1 },
        ],
      },
      could: { speaker: ST, text: 'No. Nobody ever does everything they could. They do everything they thought of. (She smiles, a little.) That is a different and much shorter list.', next: 'go' },
      son: { speaker: ST, mood: 'sad', text: '(She closes her eyes.) Yes. He does. With his thumb, without looking. He did it as a boy whenever he was frightened. Then he is still frightened. Then he is still mine.', next: 'go' },
      go: { speaker: ST, text: 'Go up. Take the stone before he does, if you can. And if you meet him at the top, little one, do not strike first. He never could bear it when somebody would not fight him. It was the only way I ever won an argument.', next: null },
    },
  },

  // ======================= I-9 The Long Descent: the stone where Kell turned back (codex find)
  {
    id: 'dialogue:obj-monk-kell-stone', name: 'I-9 the stone where Kell turned back', scope: 'party',
    entries: [{ when: stage('quest:monk-the-long-descent', 'stone'), node: 'stone' }, { node: 'plain' }],
    nodes: {
      stone: { speaker: 'narrator', text: 'A plain grey boulder at a bend in the gate road, waist high, with a flat top. Nothing marks it. But the ground round it is worn in a ring, as if somebody has walked round and round it, many times, over many years, at night.', next: 'marks' },
      marks: { speaker: 'narrator', text: 'On the flat top, scratched with a stone, are tally-marks: one for every year since C. 1012. Thirty of them. Beside the very first, cut deeper than all the rest: a single word. LISTENED.', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'Here, on the road to the crowning, Doran Kell heard the gates closing ahead, and stood still, and turned round, and ran home. He has been coming back to this stone ever since.',
        choices: [
          { text: '(Stand still beside the stone, and listen to the road, as he did.)', to: 'listen', effects: [{ unlockLore: 'lore:hc-monk-kell-stone' }] },
          { text: '(Add a mark of your own: an arrow, pointing on down the road.)', to: 'arrow', effects: [{ unlockLore: 'lore:hc-monk-kell-stone' }] },
        ],
      },
      listen: { speaker: 'narrator', text: 'You stand still. You listen. Far down the road, at the gate, something very large is breathing. Further away, much further, past the gate, a bell is ringing that has nothing to do with closing. You walk on.', next: null },
      arrow: { speaker: 'narrator', text: 'You scratch it beside his thirty marks, deep and plain: an arrow, pointing down the road, towards the gate. Whoever comes back to walk round this stone tonight will find it. You hope they read it the right way.', next: null },
      plain: { speaker: 'narrator', text: 'A grey boulder at a bend in the gate road, with thirty tally-marks and a word.', next: null },
    },
  },
  {
    id: 'dialogue:area-monk-gate-road', name: 'I-9 banter: the gate road', bark: true,
    entries: [{ when: stage('quest:monk-the-long-descent', 'road'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Behind you, very far up the mountain, Agnetha rings for dusk, badly, and then again, properly. You do not look back. Shirin always said that a look back is only a way of standing still while you walk.', next: null } },
  },

  // ======================= Side: Auntie Yuen’s Last Pot (the tea bush)
  {
    id: 'dialogue:obj-monk-yuen-tea-bush', name: 'Auntie Yuen’s Last Pot: the old tea bush', scope: 'party',
    entries: [{ when: stage('quest:monk-auntie-yuens-last-pot', 'bush'), node: 'bush' }, { node: 'plain' }],
    nodes: {
      bush: { speaker: 'narrator', text: 'At the very foot of the Thousand Stairs, wedged between the first step and the cliff, an old tea bush, gnarled as a hand, sixty years grown. Somebody has kept it pruned. The leaves at its tips are new and bright, as if it had not heard about the end of the world.', next: 'pick' },
      pick: {
        speaker: 'narrator', text: 'Tied to its oldest branch with faded thread is a little wooden tag, carved: FOR THE POT. FOR WHOEVER COMES.',
        choices: [
          { text: '(Pick only the new leaves at the tips, the way Auntie Yuen would.)', to: 'tips', effects: [{ setFlag: 'monk.yuen_leaves', value: true }] },
          { text: '(Pick a handful, and leave one of your own tea-cakes under the bush.)', to: 'cake', effects: [{ setFlag: 'monk.yuen_leaves', value: true }] },
        ],
      },
      tips: { speaker: 'narrator', text: 'A double handful, folded in a cloth. When you bring them up to landing four hundred, Auntie Yuen smells them, and closes her eyes, and says nothing at all for long enough that her customers grow worried. Then she puts them in the pot.', next: null },
      cake: { speaker: 'narrator', text: 'When you bring the leaves up, Auntie Yuen sniffs them, and then sniffs you. “You left something under my mother’s bush,” she says. “Good. She would have eaten it.” She puts the leaves in the pot, and the pot sings.', next: null },
      plain: { speaker: 'narrator', text: 'An old tea bush at the foot of the Thousand Stairs. FOR WHOEVER COMES.', next: null },
    },
  },

  // ======================= Side: Misprayers (the reading at dusk)
  {
    id: 'dialogue:obj-monk-flag-reading', name: 'Misprayers: the reading at dusk', scope: 'party',
    entries: [{ when: stage('quest:monk-misprayers', 'dusk'), node: 'dusk' }, { node: 'plain' }],
    nodes: {
      dusk: { speaker: 'narrator', text: 'Dusk at the prayer-pole on the Terraces. The whole cloister has come out to hear the Abbess read the flags, as it does every evening. She reads them slowly, one by one, in her best voice. “May my teachers know peace.” “May the stairs be kind to the old.”', next: 'pies' },
      pies: {
        speaker: 'narrator', text: 'Then she reaches the last flag, which Pema has sewn back up exactly as it was. Shirin reads it. She stops. She reads it again. “May my enemies have very pleasant weather.”',
        choices: [
          { text: '(Watch Shirin.)', to: 'watch', effects: [{ setFlag: 'monk.flag_reading', value: true }] },
          { text: '(Watch Pema, hiding behind the goat pens.)', to: 'pema', effects: [{ setFlag: 'monk.flag_reading', value: true }] },
        ],
      },
      watch: { speaker: 'narrator', text: 'For a moment the Abbess of the High Monastery does not move. Then her shoulders shake, and she laughs, out loud, at dusk, for the first time anyone can remember. “Leave that one up,” she says. “Leave it up for the King.”', next: null },
      pema: { speaker: 'narrator', text: 'Pema has her hands over her face. When the Abbess laughs, she takes them away, slowly, and her face does something complicated, and then she is laughing too, and so is everyone, and the goats object.', next: null },
      plain: { speaker: 'narrator', text: 'The prayer-pole on the Terraces. One flag reads: MAY MY ENEMIES HAVE VERY PLEASANT WEATHER.', next: null },
    },
  },

  // ======================= Side: Little Brother Sop (step six hundred and eleven)
  {
    id: 'dialogue:obj-monk-sop-step', name: 'Little Brother Sop: step six hundred and eleven', scope: 'party',
    entries: [
      { when: { all: [stage('quest:monk-little-brother-sop', 'step'), NIGHT] }, node: 'night' },
      { when: stage('quest:monk-little-brother-sop', 'step'), node: 'day' },
      { node: 'plain' },
    ],
    nodes: {
      day: { speaker: 'narrator', text: 'Step six hundred and eleven, by daylight: a crack across it that every novice is told to mind. Sop only comes here asleep. Come back at night.', next: null },
      night: { speaker: 'narrator', text: 'Midnight, and down the Stairs comes Little Brother Sop, eyes shut, robe trailing, walking very carefully round every crack but one. He sits down on step six hundred and eleven, right on the crack, and puts his ear to it.', next: 'crack' },
      crack: {
        speaker: 'narrator', text: 'You kneel and put your ear to the crack beside his. Through the stone, very faint, the Summit half is singing: straight down the mountain, through the rock, out of this one crack, as if the step were a mouth.',
        choices: [
          { text: '(Hum it back to him, softly, so he can sleep.)', to: 'hum', effects: [{ setFlag: 'monk.sop_step', value: 'hum' }] },
          { text: '(Carry him back up to the dormitory yourself.)', to: 'carry', effects: [{ setFlag: 'monk.sop_step', value: 'carry' }] },
        ],
      },
      hum: { speaker: 'narrator', text: 'You hum the song, very low. Sop’s face smooths out. He curls up on the step like a cat, and sleeps properly for the first time since the Bell. Gelek the night porter, coming down with his lantern, sees you both and sits down to wait, without a word.', next: null },
      carry: { speaker: 'narrator', text: 'He weighs nothing. Halfway up he says, without opening his eyes, “It’s you, isn’t it. It’s singing for you.” You say yes. “Good,” he says. “Then I can sleep,” and does, all the way up.', next: null },
      plain: { speaker: 'narrator', text: 'Step six hundred and eleven, with a crack across it. Mind it.', next: null },
    },
  },

  // ======================= Side: the Ringer’s Arms (the new rope)
  {
    id: 'dialogue:obj-monk-bell-rope', name: 'The Ringer’s Arms: the new bell-rope', scope: 'party',
    entries: [{ when: stage('quest:monk-the-ringers-arms', 'rope'), node: 'chest' }, { node: 'plain' }],
    nodes: {
      chest: { speaker: 'narrator', text: 'In the ringers’ loft, under forty years of dust and a moulted owl, a chest. In the chest, coiled like a sleeping snake, a bell-rope, plaited in red and white, soft as a scarf. A tag on it in an old woman’s hand: “For my Agnetha, for when hers wears out. Don’t wait too long.”', next: 'hang' },
      hang: {
        speaker: 'narrator', text: 'You carry it down to the Bell Courts. Agnetha looks at it for a long time without taking it.',
        choices: [
          { text: '(Hang it yourself, while she watches.)', to: 'hang2', effects: [{ setFlag: 'monk.new_rope', value: true }] },
          { text: '(Hand it to her.)', to: 'hand', effects: [{ setFlag: 'monk.new_rope', value: true }] },
        ],
      },
      hang2: { speaker: 'narrator', text: 'You climb the frame and hang it, badly. Agnetha corrects you three times, sharply. When it is done she takes hold of it, and pulls, once, gently, and the great bell answers, and it is the best note you have ever heard it ring.', next: null },
      hand: { speaker: 'narrator', text: 'She takes it in both hands and holds it against her face, just for a moment, the way you would hold something of your mother’s. Then she climbs the frame herself, bad arms and all, and hangs it, and will not let you help.', next: null },
      plain: { speaker: 'narrator', text: 'The great bell’s rope, red and white, plaited soft as a scarf.', next: null },
    },
  },

  // ======================= Side: Half the Cells (an answer for Kestrel)
  {
    id: 'dialogue:obj-monk-kestrel-cell', name: 'Half the Cells: an answer in Kestrel’s cell', scope: 'party',
    entries: [{ when: stage('quest:monk-half-the-cells', 'reply'), node: 'cell' }, { node: 'plain' }],
    nodes: {
      cell: { speaker: 'narrator', text: 'Kestrel’s old cell, at the end of the north cloister. A mat, a shelf, a window looking up the mountain. On the shelf, a row of small things he could not take with him: a frog carved out of pine, a goat’s bell, a stone from the stones bowl, black.', next: 'write' },
      write: {
        speaker: 'narrator', text: 'You sit on his mat with a sheet of paper and a stub of charcoal. A note left on a mat waits for an answer.',
        choices: [
          { text: '(Write: “I found it. I’m still here. Come home when you’re ready.”)', to: 'home', effects: [{ setFlag: 'monk.kestrel_reply', value: 'home' }] },
          { text: '(Write: “You don’t owe anybody anything. Neither do I.”)', to: 'owe', effects: [{ setFlag: 'monk.kestrel_reply', value: 'owe' }] },
          { text: '(Leave the paper blank, folded, with your own prayer bead on top.)', to: 'bead', effects: [{ setFlag: 'monk.kestrel_reply', value: 'bead' }] },
        ],
      },
      home: { speaker: 'narrator', text: 'You fold it and leave it in the middle of his mat, where he left his. It looks very small. It is, you think, exactly the right size.', next: null },
      owe: { speaker: 'narrator', text: 'You fold it and leave it on the mat. Then you take it back, and read it again, and leave it again. It is true. It will be hard for him to read. You leave it.', next: null },
      bead: { speaker: 'narrator', text: 'A blank page and one bead from your own string, the beads Shirin gave you both on the same morning. He will know whose it is. He will know what it means. He always could read you better than you could read yourself.', next: null },
      plain: { speaker: 'narrator', text: 'Kestrel’s old cell. There is a note on the mat, waiting.', next: null },
    },
  },

  // ======================= Side: the King’s Rice (the Climbers’ cook-pot)
  {
    id: 'dialogue:obj-monk-climbers-pot', name: 'The King’s Rice: the Climbers’ cook-pot', scope: 'party',
    entries: [{ when: stage('quest:monk-the-kings-rice', 'pot'), node: 'pot' }, { node: 'plain' }],
    nodes: {
      pot: { speaker: 'narrator', text: 'The Climbers’ camp on the cloud-side, and their cook-pot, empty and scoured clean, because there has been nothing to put in it. Six Climbers in grey sit round it, very upright. Two of them were in your year. They do not look at the rice-sack on your shoulder.', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'They are too proud to ask. You are on the other side. Everyone round the pot knows both of these things.',
        choices: [
          { text: '(Put the rice down by the pot and walk away without a word.)', to: 'leave', effects: [{ setFlag: 'monk.climbers_fed', value: 'left' }] },
          { text: '(Sit down and start cooking it.)', to: 'cook', effects: [{ setFlag: 'monk.climbers_fed', value: 'cooked' }] },
        ],
      },
      leave: { speaker: 'narrator', text: 'You set it down and go. Halfway down the path you hear the pot clang, and somebody laugh, and the first smell of rice comes down the mountain after you. Nobody calls out. They do not need to.', next: null },
      cook: { speaker: 'narrator', text: 'You sit down and cook. After a while one of the Climbers gets up and fetches water. Then another fetches salt. Nobody says anything about sides. When it is done you all eat out of the same pot, the way novices do, and for an hour nobody is owed anything.', next: null },
      plain: { speaker: 'narrator', text: 'The Climbers’ cook-pot on the cloud-side, smelling of rice.', next: null },
    },
  },

  // ======================= Optional areas (Claude 2): finds in Stonecloister’s ruin, cave and viewpoint
  find('fist-capital-ruin-find', 'Stonecloister ruin: the first cloister',
    'In the ruin, under a fallen roof, a single meditation cell cut into the rock, and on its wall the first rule of the Fist school, carved in letters older than the Concord: “The self is the only weapon you cannot drop. Learn to put it down.” Somebody has cut under it, much later, small: “How?”',
    'lore:hc-fist-capital-ruin'),
  find('fist-capital-cave-find', 'Stonecloister cave: the stillness pool',
    'At the end of the cave a pool lies perfectly flat in the dark, so still it might be glass. The rule of the cave, carved at its edge: whoever sits here until the pool forgets they are there may go. Ripples are worn into the rock around it, where a thousand novices fidgeted.',
    'lore:hc-fist-capital-cave'),
  find('fist-capital-cave-codex', 'The Stillness Pool: a novice’s pebble',
    'On a ledge above the pool, a row of pebbles, each with a name and a number scratched on it: how many days it took. Most say three or four. One says forty-one. Beside it, a pebble with no name, and one word: “Gave up.” And beside that, in a child’s hand: “Came back.”',
    'lore:hc-fist-capital-tally'),
  find('fist-capital-view-find', 'Stonecloister viewpoint: the Thousand Stairs',
    'From the viewpoint you can see the whole of the Thousand Stairs at once, a white thread up the mountain, landing after landing, every tea stall shuttered. At the very top, the King’s throne stands empty against the sky. At the very bottom, on the last stair, something huge and grey is sitting very still.',
    'lore:hc-fist-capital-view'),
  {
    id: 'dialogue:area-fist-capital-view', name: 'Stonecloister viewpoint banter',
    bark: true, entries: [{ when: { heroClass: 'monk' }, node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Up here the wind takes your breath and does not give it back. Very far below, a small white goat is standing on the roof of the meditation hall, eating something important.', next: null } },
  },
  // ======================= ACT II, C-1 The Welcome Hall: the road in, the broom
  {
    id: 'dialogue:area-monk-briar-road', name: 'C-1 banter: the road into Briar Hollow', bark: true,
    entries: [{ when: stage(MC1, 'hall'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'The road into Briar Hollow is flat. Completely flat, for miles. Not one stair. Your legs keep reaching for the next step and finding road, and it is like missing a stair in the dark, over and over.', next: null } },
  },
  {
    id: 'dialogue:obj-monk-welcome-broom', name: 'C-1 sweeping the Welcome Hall', scope: 'party',
    entries: [{ when: stage(MC1, 'sweep'), node: 'hall' }, { node: 'plain' }],
    nodes: {
      hall: { speaker: 'narrator', text: 'The Welcome Hall is half sunk in the bog, so the far end slopes down into green water, and the monks sweep it anyway, right to the waterline. At the dry end a cushion is laid for Doran Kell, with a cup beside it, upside down.', next: 'sweep' },
      sweep: {
        speaker: 'narrator', text: 'Six brooms, and yours makes seven. Nobody speaks. The brooms go out and back, out and back, in a rhythm you know from the Thousand Stairs.',
        choices: [
          { text: '(Sweep to the waterline with them.)', to: 'line' },
          { text: '(Sweep round Kell’s cushion, very carefully.)', to: 'cushion' },
          { text: '(Match your breath to the brooms.)', to: 'breath', school: 'fist', trustNpc: FS, trust: 1 },
        ],
      },
      line: { speaker: 'narrator', text: 'At the waterline the bog laps at your broom like a cat at a saucer. Under the green, a step goes down, and another. The cloister has been sinking a finger’s width a year. The monks sweep the next step when it goes under.', next: 'end' },
      cushion: { speaker: 'narrator', text: 'The cushion has been beaten and turned every morning for thirty years. The cup has never been filled. Brother Faraj watches you go round it and gives a very small nod, as if you have passed something.', next: 'end' },
      breath: { speaker: 'narrator', text: 'In on the out-stroke, out on the back. After a while the seven brooms are one broom. Brother Faraj stops, and leans on his, and looks at you the way the old monks look at a novice who has finally understood something boring.', next: 'end' },
      end: { speaker: FS, text: 'Thirty years, and you are the first guest. (He takes your broom back.) The Abbot is in the pool. The slimes do his forms now. Very badly. Follow them, and you will find him.', effects: [{ setFlag: 'monk.hall_swept', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The Welcome Hall, swept to the waterline.', next: null },
    },
  },

  // ======================= ACT II, C-3 The Ooze Sovereign: telling the six monks
  {
    id: 'dialogue:monk-faraj-abbot', name: 'C-3 Brother Faraj hears the Abbot is free', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'The six monks are not sweeping. They are standing in a row at the waterline of the Welcome Hall, brooms grounded like staves, looking out at the bog, where something has gone very quiet.', next: 'tell' },
      tell: {
        speaker: FS, text: 'The pool has stopped humming. We felt it in the floor. (He does not look round.) Tell me plainly.',
        choices: [
          { text: 'He’s out. He walked out covered in slime and said he had been very patient.', to: 'patient' },
          { text: '(Bow to the six of them, the full bow, the one for an Abbot.)', to: 'bow', school: 'fist', trustNpc: FS, trust: 1 },
        ],
      },
      patient: { speaker: FS, mood: 'happy', text: '(A sound comes out of Brother Faraj that the others have clearly never heard. It takes them a moment to recognise it as laughing.) Patient. Thirty years in a slime. Yes. That is him exactly.', next: 'cushion' },
      bow: { speaker: 'narrator', text: 'Six old monks look at you, and at each other, and then, one by one, they bow back, very low, the way they were taught to bow to the man they were sent ahead to welcome.', next: 'cushion' },
      cushion: { speaker: FS, mood: 'sad', text: 'We came ahead to welcome a crowning. We swept for thirty years. And the one we should have been looking for was twelve steps away, in the pool, all along. (He turns over Kell’s cup, at last.) Well. Somebody can use the cushion.', next: 'kestrel' },
      kestrel: { speaker: FS, text: 'One more thing. A monk in grey came past the hall a week ago, walking towards the thunder. He would not stop for tea. He said he had news to give the Stormcrow. Your brother, I think.', next: null },
    },
  },

  // ======================= ACT II, C-5 The Stormcrow: Kestrel’s carving on the nest
  clue('monk-nest-carving', 'C-5 Kestrel’s letters on the rim of the nest', stage(MC5, 'carving'),
    'Cut into the black rock at the rim of the nest, where the Stormcrow stood to scream, in letters a hand high, punched rather than carved: FIST IS CROWNED. Over and over, a dozen times, as if somebody had been trying to teach a bird new words.', 'monk.nest_carving',
    'The rim of the Stormcrow’s nest, quiet now.', 'Beside the last one, smaller, worn in by a thumb going round and round like a bead: “Forty-one.” The count of his beads. The count he says when he cannot sleep. He sat up here and counted while the crow screamed the wrong news.'),

  // ======================= ACT II, C-6 A Move by Post: the answer
  {
    id: 'dialogue:obj-monk-reply-stone', name: 'C-6 a move back to the Abbess', scope: 'party',
    entries: [{ when: stage(MC6, 'reply'), node: 'stair' }, { node: 'plain' }],
    nodes: {
      stair: { speaker: 'narrator', text: 'Up the side of the Fist arch climbs a stair carved in Kell’s own style, and halfway up it simply stops, as if he had put down his chisel to answer the door. On the last step there is room for exactly one stone.', next: 'move' },
      move: {
        speaker: 'narrator', text: 'She sent you a cheating move. What do you send back?',
        choices: [
          { text: '(A black stone, played honestly, where it ought to go.)', to: 'honest', effects: [{ setFlag: 'monk.reply', value: 'honest' }] },
          { text: '(A black stone, on a point that does not exist. Two can cheat.)', to: 'cheat', effects: [{ setFlag: 'monk.reply', value: 'cheat' }] },
          { text: '(No stone. Leave the step empty. Let her move twice.)', to: 'pass', when: { flag: 'monk.shirin_devotable' }, effects: [{ setFlag: 'monk.reply', value: 'pass' }] },
        ],
      },
      honest: { speaker: 'narrator', text: 'You set it on the last step of Kell’s stair. It sits there, honest and slightly smug. She will hate it. She will spend a week finding a way to cheat round it, and enjoy every minute.', next: 'gone' },
      cheat: { speaker: 'narrator', mood: 'happy', text: 'You set it on the last step of Kell’s stair, on a point that has never existed on any board in Mountainreach. Somewhere very far off, you are almost sure, an abbess laughs into her tea.', next: 'gone' },
      pass: { speaker: 'narrator', text: 'You leave the step bare and bow to it. A pass, in stones, is the most polite thing you can do. It means: I trust you to move for both of us.', next: 'gone' },
      gone: { speaker: 'narrator', text: 'When you look again, the step is bare, and the stone is gone home the way the letter came.', next: null },
      plain: { speaker: 'narrator', text: 'Kell’s stair up the side of the Fist arch, stopping halfway.', next: null },
    },
  },

  // ======================= ACT III, The Last Move: black beads, white pebbles
  {
    id: 'dialogue:obj-monk-stair-bead-1', name: 'The Last Move: a bead on the stair (1)', scope: 'party',
    entries: [
      { when: { all: [stage(LAST, 'beads'), { flag: 'monk.nemesis_fate', op: '==', value: 'spared' }] }, node: 'spared' },
      { when: stage(LAST, 'beads'), node: 'bead' },
      { node: 'plain' },
    ],
    nodes: {
      spared: { speaker: KS, mood: 'sad', text: '(Kestrel is sitting on the Fist stair with his string of beads in his lap, only wood now.) You’re playing her move? Then you’ll want black. (He bites the string and pours half of them into your hand.) Take the lot. I have stopped counting.', effects: [{ setFlag: 'monk.stair_bead_1', value: true }], next: null },
      bead: { speaker: 'narrator', text: 'One of Kestrel’s beads, black wood, on the third step of the Fist stair, where it rolled. It is warm, the way a thing is warm that has been held for a long time.', effects: [{ setFlag: 'monk.stair_bead_1', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The Fist stair of the Twelve Stairs.', next: null },
    },
  },
  ...[
    'Another bead, halfway down, caught in a crack in the black stone. Somebody counted on this one every night of his life. There is a thumb-shaped dip worn in it.',
    'The last bead at the foot of the Fist stair, against the bottom step, as if it had decided it had come far enough. Forty-one, he used to say. You have enough for a game.',
  ].map((text, i): DialogueDef => clue(`monk-stair-bead-${i + 2}`, `The Last Move: a bead on the stair (${i + 2})`, stage(LAST, 'beads'), text, `monk.stair_bead_${i + 2}`, 'The Fist stair of the Twelve Stairs.')),
  {
    id: 'dialogue:obj-monk-camp-pebbles', name: 'The Last Move: white stones from the fire-ring', scope: 'party',
    entries: [{ when: stage(LAST, 'pebbles'), node: 'ring' }, { node: 'plain' }],
    nodes: {
      ring: {
        speaker: 'narrator', text: 'The bearers have ringed their fires with whatever pale stones they could find in the black. Most are only grey. A few, washed by rain, are almost white.',
        choices: [
          { text: '(Pick the whitest, and wash them in Auntie Yuen’s tea.)', to: 'tea' },
          { text: '(Choose them by weight, the way the Abbess chooses hers: heavy for an honest move, light for a cheat.)', to: 'weight', school: 'fist' },
        ],
      },
      tea: { speaker: 'narrator', mood: 'happy', text: 'Auntie Yuen watches you rinse pebbles in her pot and says nothing at all, which is worse than anything she could say. They come out the colour of old ivory, and smell of smoke and tea.', effects: [{ setFlag: 'monk.white_stones', value: true }], next: null },
      weight: { speaker: 'narrator', text: 'You weigh them on your palm, one by one, and keep the lightest for last: the fourth point from the corner, where it is not allowed to be.', effects: [{ setFlag: 'monk.white_stones', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The ring of stones round the bearers’ fire, a few short.', next: null },
    },
  },

  // ======================= ACT III, Sop on the Stair: a cloak
  {
    id: 'dialogue:obj-monk-stair-cloak', name: 'Sop on the Stair: a cloak on the stair', scope: 'party',
    entries: [{ when: stage(SOPQ, 'cloak'), node: 'cloak' }, { node: 'plain' }],
    nodes: {
      cloak: { speaker: 'narrator', text: 'On the Fist stair, folded neatly on a step as if somebody meant to come back for it: a Stonecloister travelling cloak, grey, with a novice’s knot at the collar. One of the forty, who climbed up behind Kestrel and took it off to fight.', next: 'wrap' },
      wrap: {
        speaker: 'narrator', text: 'It is four sizes too big for Sop.',
        choices: [
          { text: '(Wrap him in it, goat and all.)', to: 'warm' },
          { text: '(Tie the novice’s knot at his collar properly, the way the dormitory master taught you.)', to: 'knot', school: 'fist' },
        ],
      },
      warm: { speaker: 'narrator', text: 'He stops shivering at once. One small hand comes out of the folds, finds your collar again, and holds on.', effects: [{ setFlag: 'monk.sop_cloak', value: true }], next: null },
      knot: { speaker: 'narrator', mood: 'happy', text: 'You tie it right. Sop, asleep, puts a hand up and checks it, the way every novice does, and goes back to sleep satisfied.', effects: [{ setFlag: 'monk.sop_cloak', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'A bare step on the Fist stair.', next: null },
    },
  },
];

export default dialogues;
