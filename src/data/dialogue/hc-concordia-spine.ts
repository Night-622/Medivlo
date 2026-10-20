/**
 * Hollow Crown, Act II shared spine dialogues (II-2 … II-6). [School] options carry the class beats from
 * docs/lore/hollow-crown/06-outlines (one per class, shown when that class is in the party; only its school may
 * vote for it). Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition, SchoolId } from '@/core';

const has = (cls: string): NarrativeCondition => ({ partyHasClass: cls });
const opt = (cls: string, school: SchoolId, text: string, to: string, extra: Partial<DialogueChoice> = {}): DialogueChoice =>
  ({ text, to, school, when: has(cls), ...extra, ...(extra.when ? { when: { all: [has(cls), extra.when] } } : {}) });

/** any class clue towards insight.tears_older (II-4 beats) */
const TEAR_CLUES = ['tears_unburnable', 'tears_uncut', 'tears_hallmarked', 'tears_heavy', 'tears_kept', 'tears_echoless',
  'tears_remember', 'tears_shadow', 'tears_seed', 'tears_unrotting', 'stag_old_road'];

const dialogues: DialogueDef[] = [
  // ================= II-2 The Wolves at the Gate
  {
    id: 'dialogue:cc-maren-gate', name: 'II-2 Maren at the east gate', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:maren', text: 'They pulled back the moment the sun touched the trees. Wolves don’t do that. Something called them off.',
        choices: [
          { text: 'Then something is driving them.', to: 'driven', quest: true },
          { text: 'Let me look at how they fought.', to: 'read' },
        ],
      },
      read: {
        speaker: 'npc:maren', text: 'Go on, then. The grass at the gate is trampled flat. You tell me what you see.',
        choices: [
          opt('huntsman', 'hunt', 'Read the tracks: these wolves were herded.', 'herded', { trust: 1 }),
          opt('falconer', 'hunt', 'Send the hawk up. Count them from above.', 'hawk', { trust: 1 }),
          opt('arcanist', 'ash', 'Read the scorch marks: these wolves ran through fire to get here.', 'herded', { trust: 1 }),
          opt('reaver', 'ash', 'Stand in the light. Let them come to the axe.', 'axe-truce', { trust: 1, when: { flag: 'reaver.muster', value: 'truce' } }),
          opt('reaver', 'ash', 'Stand in the light. Let them come to the axe.', 'axe', { trust: -1, when: { not: { flag: 'reaver.muster', value: 'truce' } } }),
          opt('rimecaller', 'rime', 'Look at the frost on their pelts. These wolves stood still a long time before they ran.', 'herded', { trust: 1 }),
          opt('warden', 'rime', 'Those aren’t hunting. They’re running from something.', 'running', { trust: 1 }),
          opt('sparkwright', 'storm', 'Flash the waystone: wolves hate a sudden light.', 'flash', { trustNpc: 'npc:sela', trust: 1 }),
          opt('stormlancer', 'storm', 'Let your arrows go first, then I’ll ride behind them.', 'herded', { trust: 1, when: { insight: 'ride_the_wake' } }),
          opt('stormlancer', 'storm', 'Charge them before they circle.', 'daft', { trust: -1, when: { not: { insight: 'ride_the_wake' } } }),
          opt('cantor', 'radiance', 'Dim your halo. Let them come close enough to see they’re frightened.', 'herded', { trust: 1 }),
          opt('oathbound', 'radiance', 'I swear I’ll hold this gate.', 'sworn', { trust: 1 }),
          opt('duskweaver', 'umbral', 'Look at their shadows: these wolves remember being dogs.', 'herded', { trust: 1 }),
          opt('shade', 'umbral', 'They hunt by shadow, and I haven’t got one. Let me walk in first.', 'herded', { trust: 1 }),
          opt('hedgewitch', 'verdant', 'These wolves have been eating bark. Something has starved the wood.', 'herded', { trust: 1 }),
          opt('ranger', 'verdant', 'Track them back. They aren’t hunting, they’re running from the rot.', 'running', { trust: 1 }),
          opt('swordsman', 'blade', 'Watch their feet. They circle like duellists, waiting for a gap.', 'herded', { trust: 1 }),
          opt('samurai', 'blade', '(Say nothing. Wait for the lead wolf to commit.)', 'quiet', { trust: 1 }),
          opt('knight', 'iron', 'Plant the shield. Nothing gets past to you.', 'wall', { trust: 1 }),
          opt('juggernaut', 'iron', 'Turn the cart over. Now it’s a wall.', 'wall', { trust: 1 }),
          opt('monk', 'fist', 'Stand still. Let them come past you.', 'laugh', { trust: 1 }),
          opt('brawler', 'fist', 'Square up to the alpha. Just the alpha.', 'bitten', { trust: -1 }),
          opt('jester', 'guile', 'Throw your voice: call the wolves to the wrong side of the fire.', 'cheap', { trust: 1 }),
          opt('corsair', 'guile', 'Dot’s trick: hang a false light on the hill and let them run at it.', 'cheap', { trust: 1 }),
          opt('bard', 'song', 'Sing them a lullaby. Hollow things want filling.', 'lullaby', { trust: -1 }),
          opt('skald', 'song', 'Drum the fire-watch beat. They know it from the old Turning roads.', 'herded', { trust: 1 }),
        ],
      },
      herded: { speaker: 'npc:maren', text: 'Yes. That’s it. That’s what I’ve been seeing for a month and couldn’t say. Somebody is driving them, and it isn’t a wolf.', effects: [{ insight: 'wolves_driven' }], next: 'driven' },
      hawk: { speaker: 'npc:maren', mood: 'happy', text: 'I’ve never seen that done. Forty of them, you say, in a line, like sheep? Then they’re herded.', effects: [{ insight: 'wolves_driven' }], next: 'driven' },
      running: { speaker: 'npc:maren', text: 'Running. From what, though? Nothing in the Gloamwood frightens a wolf. Nothing used to.', effects: [{ insight: 'wolves_driven' }], next: 'driven' },
      'axe-truce': { speaker: 'npc:maren', text: 'You’ve stopped wars before, I can see it on you. All right. Stand in the light. I’ll stand behind you.', next: 'driven' },
      axe: { speaker: 'npc:maren', mood: 'angry', text: 'That’s how my uncle died. Brave. Lit up like a lantern. Daft.', next: 'driven' },
      flash: { speaker: 'npc:sela', text: 'Oh, that’s clever. That’s my waystone, you know. Do it again and I’ll charge you.', next: 'driven' },
      daft: { speaker: 'npc:maren', text: 'Brave. Daft. Mostly daft.', next: 'driven' },
      sworn: { speaker: 'npc:maren', mood: 'sad', text: 'Nobody’s sworn me anything in years.', next: 'driven' },
      quiet: { speaker: 'npc:maren', mood: 'happy', text: 'First sensible thing anyone’s said all week. And you didn’t even say it.', next: 'driven' },
      wall: { speaker: 'npc:maren', text: 'A wall I can shoot over. I could get used to you.', next: 'driven' },
      laugh: { speaker: 'npc:maren', mood: 'happy', text: '(She laughs, for the first time since you met her.) They went round you like water round a stone.', next: 'driven' },
      bitten: { speaker: 'npc:maren', text: 'You’ll get bitten. You did get bitten. Was it worth it?', next: 'driven' },
      cheap: { speaker: 'npc:maren', text: 'Cheap. I like it.', next: 'driven' },
      lullaby: { speaker: 'npc:maren', mood: 'afraid', text: 'They sat down. They sat down and listened. Now they’ll follow you home, singer.', next: 'driven' },
      driven: {
        speaker: 'npc:maren', text: 'Their tracks go back into the Gloamwood, towards the glade. Come with me, or follow on. Either way, keep your fire low.',
        choices: [
          { text: 'I’ll follow the tracks.', to: null, quest: true },
          { text: 'You wear one of them.', to: 'pelt', insight: 'maren_pelt' },
        ],
      },
      pelt: { speaker: 'npc:maren', mood: 'sad', text: 'The first one that came back wrong. (She doesn’t say more, not yet.) I wear it so I don’t forget what I’m hunting.', next: null },
    },
  },
  {
    id: 'dialogue:obj-gloam-wolf-tracks', name: 'II-2 wolf tracks', scope: 'party',
    entries: [{ when: { questStage: 'quest:cc-wolves', stage: 'tracks' }, node: 'tracks' }, { node: 'old' }],
    nodes: {
      tracks: {
        speaker: 'narrator', text: 'The wolf tracks run in a line, nose to tail, as if driven. Among them, larger, are the prints of a stag. Every hoofprint is wet with black.',
        effects: [{ setFlag: 'cc.stag_tracks', value: true }], next: 'nan',
      },
      nan: { speaker: 'npc:maren', text: 'The White Stag. It’s weeping as it walks. Nan Briar will know what that means. She knows everything she shouldn’t.', next: null },
      old: { speaker: 'narrator', text: 'Old wolf tracks, and the black-stained prints of a stag, going deeper into the wood.', next: null },
    },
  },

  // ================= II-3 The Drowned Bell
  {
    id: 'dialogue:cc-godric-bell', name: 'II-3 Godric gives The Drowned Bell', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:godric', text: 'So. The arch lit, and you walked out of it, and the Abbey bells rang under the lake the same night. I am too old for coincidences, {class}.',
        choices: [
          { text: 'What do you think it means?', to: 'means' },
          opt('knight', 'iron', '(Stand to attention in the Order’s tabard.)', 'tabard'),
          opt('cantor', 'radiance', '(Sing the hour-hymn for dusk.)', 'hymn', { trust: 1 }),
          opt('oathbound', 'radiance', 'What did you swear, the night the crown was emptied?', 'oath', { trust: -1 }),
          opt('warden', 'rime', 'You stand like a man who once had a gate to guard.', 'gate', { trust: 1 }),
          opt('corsair', 'guile', 'You knew a Captain Dorothea Brine, didn’t you?', 'dot'),
        ],
      },
      tabard: {
        speaker: 'npc:godric', text: 'That tabard. I stood beside men in that tabard once, in the Citadel. A long time ago.',
        effects: [{ setFlag: 'cc.godric_seed', value: true }],
        choices: [
          { text: 'Queen Berenika’s knights.', to: 'kind', insight: 'godric_berenika', when: { insight: 'berenika_reason' } },
          { text: 'Go on.', to: 'means' },
        ],
      },
      kind: { speaker: 'npc:godric', mood: 'sad', text: 'She was kind. That was the trouble.', next: 'means' },
      hymn: { speaker: 'npc:godric', text: '(He joins in on the second line, word perfect. He knows the old Citadel hours by heart.) Hm. Nobody has sung that here in thirty years.', effects: [{ setFlag: 'cc.godric_seed', value: true }], next: 'means' },
      oath: { speaker: 'npc:godric', mood: 'angry', text: 'I swore what every guard swore. To keep the door. I did not keep it. Ask me something else.', effects: [{ setFlag: 'cc.godric_seed', value: true }, { setFlag: 'oathbound.godric_oath', value: true }], next: 'means' },
      gate: { speaker: 'npc:godric', text: '(He is quiet a long moment.) I did. I was not much good at it.', effects: [{ setFlag: 'cc.godric_seed', value: true }], next: 'means' },
      dot: {
        speaker: 'npc:godric', text: 'Dot Brine? She owes me four Embershards from the year before the Hollowing. Tell her I would like them back.',
        choices: [
          { text: 'Pay him the four shards.', to: 'means', trust: 1, effects: [{ setFlag: 'corsair.dot_debt_paid', value: true }] },
          { text: 'I’ll tell her.', to: 'means' },
        ],
      },
      means: {
        speaker: 'npc:godric', text: 'The Abbey has been under the lake for thirty years. Its bell was the Turning Bell: it rang once for every passing of the crown. It has no business ringing now. Go and ask Brother Aldous. He is the only one who swam out.',
        choices: [
          { text: 'I’ll find him.', to: null, quest: true, effects: [{ startQuest: 'quest:cc-drowned-bell' }] },
          { text: 'You know more than you’re saying.', to: 'more' },
        ],
      },
      more: { speaker: 'npc:godric', text: 'I am an old man in a small village. I know where the sheep are. Go and see Aldous.', effects: [{ startQuest: 'quest:cc-drowned-bell' }], next: null },
    },
  },
  {
    id: 'dialogue:cc-aldous-bells', name: 'II-3 Aldous on the bells', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:aldous', text: 'You heard it too. Of course you did, you have a stone singing in you. The Turning Bell rang, under the lake, once. As it does when the crown passes. But the crown has not passed. Nothing is due.',
        choices: [
          { text: 'Then who rang it?', to: 'who' },
          opt('reaver', 'ash', 'When the Bell rings, the Muster stands down. That law is older than the Muster.', 'law', { trust: 1 }),
          opt('samurai', 'blade', '(Listen. Under everything, something is humming.)', 'hum', { trust: 1 }),
          opt('monk', 'fist', '(Breathe with the count of the old bell.)', 'count', { trust: 1 }),
          opt('bard', 'song', 'Did singers come here, at the Turnings?', 'lyre', { trust: 1 }),
          opt('falconer', 'hunt', 'Let the hawk look at the lake.', 'colour', { trust: 1 }),
          opt('sparkwright', 'storm', 'Let me measure the Bell’s pitch.', 'pitch', { insight: 'thirteenth_pitch' }),
        ],
      },
      law: { speaker: 'npc:aldous', text: 'It is. It came from the Concord. Every school had one: when the Bell rings, lay down whatever you are fighting with. Most forgot.', next: 'who' },
      hum: { speaker: 'npc:aldous', mood: 'sad', text: '(He weeps, quite openly.) The choir. You can hear them. I thought I was the only one.', next: 'who' },
      count: { speaker: 'npc:aldous', text: '(You sit together in silence for the length of one full bell. When it ends, he is smiling.) Brother Anselm counted it just like that.', next: 'who' },
      lyre: { speaker: 'npc:aldous', text: 'Every Turning. The Lyrehaven singers came for the descant, and one year a girl soprano called Rosalind sang it so high the gulls stopped to listen.', next: 'who' },
      colour: { speaker: 'npc:aldous', text: 'What does it see? A colour, moving towards the Bell? That is the choir. They are going home.', next: 'who' },
      pitch: { speaker: 'narrator', text: 'Faintly, under the water, the Bell’s last ring is still sounding. It carries all twelve stones’ notes, and one more your instruments cannot name.', next: 'who' },
      who: {
        speaker: 'npc:aldous', text: 'I do not know who rang it. I know the Abbess would not let it be rung out of turn. She held the rope herself, the night the lake came up. She is still holding it.',
        choices: [
          { text: 'How do I get out to the Bell?', to: 'boat', quest: true },
          { text: 'What do you want from it?', to: 'clapper' },
        ],
      },
      clapper: { speaker: 'npc:aldous', mood: 'sad', text: 'The clapper. The choir took it down into the nave so it could never ring again. If it ever should ring, truly, I want to be the one who rings it.', next: 'boat' },
      boat: { speaker: 'npc:aldous', text: 'My old boat is tied up at Abbeyshore. Tamsin keeps it baled for me, out of pity. Row out over the bell-tower and look down. Do not row out after dark.', next: null },
    },
  },
  {
    id: 'dialogue:obj-shore-boat', name: 'II-3 out on the Abbey lake', scope: 'party',
    entries: [{ when: { questStage: 'quest:cc-drowned-bell', stage: 'abbey' }, node: 'row' }, { node: 'moored' }],
    nodes: {
      moored: { speaker: 'narrator', text: 'Aldous’s old boat, baled dry, an oar tied to each side.', next: null },
      row: { speaker: 'narrator', text: 'You row out until the water goes from green to black. Below you, the drowned bell-tower of the Abbey stands straight up from the lakebed, and in it, the Bell.', next: 'face' },
      face: {
        speaker: 'narrator', mood: 'hollow', text: 'A face rises under the water, a woman in a nun’s wimple, eyes open. Her lips move. You hear it in your half-stone rather than your ears: Not out of turn.',
        choices: [
          { text: 'Row back. Quickly.', to: 'back' },
          { text: 'Who rang it, then?', to: 'ask', insight: 'morwen_out_of_turn' },
        ],
      },
      ask: { speaker: 'narrator', mood: 'hollow', text: 'The face looks at you a long time. Then it looks towards the Heart of Morvane, and sinks.', next: 'back' },
      back: { speaker: 'narrator', text: 'The lake goes still behind you. Whatever rang the Bell, it was not the woman holding the rope.', effects: [{ setFlag: 'cc.bell_seen', value: true }], next: null },
    },
  },

  // ================= II-4 Tears of the Stag
  {
    id: 'dialogue:cc-nan-tears', name: 'II-4 Nan Briar gives Tears of the Stag', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:nanbriar', text: 'You’ve seen the Stag’s prints. Wet, were they? Black? It isn’t sick, dear. It’s grieving.',
        choices: [
          { text: 'Grieving for what?', to: 'what' },
          opt('brawler', 'fist', '(The cat is biting your red gloves.) Let him.', 'parson', { trust: 1 }),
          opt('huntsman', 'hunt', 'You can tell by the way it doesn’t eat. It’s grieving.', 'hunter', { trust: 1 }),
        ],
      },
      parson: { speaker: 'npc:nanbriar', mood: 'happy', text: 'Ha. Parson likes you. He only bites people he likes, and clergy.', next: 'what' },
      hunter: { speaker: 'npc:nanbriar', text: 'There. Somebody with eyes. You can skip my nettle lecture.', next: 'what' },
      what: {
        speaker: 'npc:nanbriar', text: 'That is the question, isn’t it. Bring me one of its tears. Still warm, mind. A cold tear tells you nothing but that it’s cold.',
        choices: [{ text: 'I’ll bring you a tear.', to: null, quest: true, effects: [{ startQuest: 'quest:cc-tears' }] }],
      },
    },
  },
  {
    id: 'dialogue:obj-gloam-stag-glade', name: 'II-4 the White Stag in the glade', scope: 'party',
    entries: [{ when: { questStage: 'quest:cc-tears', stage: 'stag' }, node: 'stag' }, { node: 'empty' }],
    nodes: {
      empty: { speaker: 'narrator', text: 'The glade is empty. The moss where the Stag stood is still dark.', next: null },
      stag: {
        speaker: 'narrator', text: 'The White Stag stands in the glade, white as frost, black tears running from both eyes into its fur. It looks at you, and your half-stone sings so loudly you flinch.',
        choices: [
          { text: '(Stay still.)', to: 'flee' },
          opt('stormlancer', 'storm', 'Ride after it. Don’t catch it, just follow.', 'follow'),
        ],
      },
      follow: {
        speaker: 'narrator', text: 'You follow at a distance. It leads you down an old paved road, the procession road of the Turnings, to the place where it first wept. The tears there are older than the road.',
        effects: [{ insight: 'stag_old_road' }], next: 'flee',
      },
      flee: {
        speaker: 'narrator', text: 'The Stag turns and goes into the trees without a sound. Where it stood, a single black tear lies on the moss. It is warm.',
        effects: [{ giveItem: 'i_tear' }, { setFlag: 'cc.stag_seen', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:cc-nan-tear', name: 'II-4 the tear, at Nan Briar’s', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:nanbriar', text: 'Give it here. Mm. Still warm. Now: you’ve all got schools. Do something to it, and tell me what it does back.',
        choices: [
          { text: 'You tell me.', to: 'tell' },
          opt('arcanist', 'ash', 'Burn it.', 'burn', { insight: 'tears_unburnable' }),
          opt('swordsman', 'blade', 'Cut it in two.', 'cut', { insight: 'tears_uncut' }),
          opt('jester', 'guile', 'Appraise it. (Out comes the jeweller’s glass.)', 'appraise', { insight: 'tears_hallmarked' }),
          opt('juggernaut', 'iron', 'Weigh it.', 'weigh', { insight: 'tears_heavy' }),
          opt('rimecaller', 'rime', 'Freeze it and read it.', 'freeze', { insight: 'tears_kept' }),
          opt('skald', 'song', 'Drum against it.', 'drum', { insight: 'tears_echoless' }),
          opt('duskweaver', 'umbral', 'Read its memory.', 'memory', { insight: 'tears_remember' }),
          opt('shade', 'umbral', 'Stand in it and look down.', 'shadow', { insight: 'tears_shadow' }),
          opt('hedgewitch', 'verdant', 'Plant a seed in it.', 'seed', { insight: 'tears_seed' }),
          opt('ranger', 'verdant', 'Let it rot.', 'rot', { insight: 'tears_unrotting' }),
        ],
      },
      burn: { speaker: 'narrator', text: 'You set it in your fire. It sits in the flame like a stone in a stream, untouched, and the fire goes cold around it.', next: 'older' },
      cut: { speaker: 'narrator', text: 'Your blade parts it cleanly. The halves roll together and join, as if the tear were older than the cut.', next: 'older' },
      appraise: { speaker: 'narrator', text: 'Under the glass, deep inside the tear, there is a hallmark: the Thieves’ Exchange stamp, of a pattern three hundred years out of use.', next: 'older' },
      weigh: { speaker: 'narrator', text: 'It weighs as much as a pick-head. Hollow iron is only iron that has carried grief.', next: 'older' },
      freeze: { speaker: 'narrator', text: 'Frozen, it clears like glass. Inside is a memory: a Turning feast, long tables, lanterns, people you have never seen. Centuries before Casimir.', next: 'older' },
      drum: { speaker: 'npc:nanbriar', text: 'No echo. None at all. It never did make one, not even in my day.', next: 'older' },
      memory: { speaker: 'narrator', text: 'It remembers a Turning: banners, a procession road, a stag walking ahead of a crown. Three hundred years ago at least.', next: 'older' },
      shadow: { speaker: 'narrator', text: 'You have no shadow. The tear does. It is longer and older than the Stag that wept it.', next: 'older' },
      seed: { speaker: 'npc:nanbriar', mood: 'happy', text: 'Nothing grows, and then something does. Oh. That’s one of mine. I planted that seed three Turnings ago, in the Citadel gardens.', next: 'older' },
      rot: { speaker: 'narrator', text: 'It won’t rot. Nothing on earth should be able to refuse that, and it does.', next: 'older' },
      older: {
        speaker: 'npc:nanbriar', text: 'There. You see it, don’t you.',
        choices: [
          { text: 'These tears are older than the Hollowing.', to: 'yes', insight: 'tears_older',
            when: { any: [...TEAR_CLUES.map((k) => ({ insight: k })), { trust: 'npc:nanbriar', value: 'friendly' }] } },
          { text: 'See what?', to: 'tell' },
        ],
      },
      tell: { speaker: 'npc:nanbriar', text: 'That it’s grief, dear. Not wickedness. Grief, gone solid, the way sap does. Whatever wept this has been weeping a long while.', next: 'end' },
      yes: {
        speaker: 'npc:nanbriar', mood: 'sad', text: 'Older than him, older than me. The crown always held the schools’ grief, dear. The Concordant sang over it and kept it quiet. Then someone stopped singing.',
        next: 'end',
      },
      end: {
        speaker: 'npc:nanbriar', text: 'I’ll keep this one. Here, wear this instead. And take my advice: whatever is weeping at the Heart, don’t you dare hate it. It’s had enough of that.',
        effects: [{ takeItem: 'i_tear' }], next: null,
      },
    },
  },

  // ================= II-5 The Stone Court
  {
    id: 'dialogue:cc-ysolde-opens', name: 'II-5 Ysolde opens the Stone Court', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ysolde', text: 'You are the third stranger with a singing chest this week. I have unlocked the Stone Court. It was the Concord’s embassy square, once. It seems right that you should all stop standing in my archive.',
        choices: [{ text: 'Show me.', to: null, quest: true, effects: [{ startQuest: 'quest:cc-stone-court' }] }],
      },
    },
  },
  {
    id: 'dialogue:cc-ysolde-court', name: 'II-5 Ysolde at the Stone Court', scope: 'party',
    entries: [{ when: { questStage: 'quest:cc-stone-court', stage: 'court' }, node: 'court' }, { node: 'later' }],
    nodes: {
      court: {
        speaker: 'npc:ysolde', text: 'The charter is plain, for once. The Citadel opens to a Turning. A Turning needs the Bell, and the Bell needs the stones carried to it, and every bearer who stands at the door must bear their school’s Sentinel mark.',
        next: 'square',
      },
      square: { speaker: 'narrator', text: 'The Stone Court is a square of twelve tall doors, one embassy for each school, every one shut since C. 1012. Bearers stand about it in ones and twos, not quite looking at each other, the way people do at a funeral for someone they only knew by name.', next: 'gap' },
      gap: {
        speaker: 'npc:ysolde', text: 'Here is what the charter does not say. It does not say what a bearer is for once the stones are home. Every Turning has a bearer list, and not one of them says what became of anyone on it afterwards. I looked. I looked for three days.',
        choices: [
          { text: 'Maybe they just went home.', to: 'home' },
          { text: 'You’re worried about us.', to: 'worried', trust: 1 },
        ],
      },
      home: { speaker: 'npc:ysolde', text: 'Perhaps. Records are kept of arrivals. Nobody writes down a departure unless something has gone wrong. I find that a comfort and a warning in about equal parts.', next: 'marks' },
      worried: { speaker: 'npc:ysolde', text: '(She straightens a stack of paper that is already straight.) I am worried about the record. You are in it now. I should like it to have a good ending, and I should like to be the one who writes it down.', next: 'marks' },
      marks: {
        speaker: 'npc:ysolde', text: 'The Sentinels of the Turning Road were the crown’s escorts, one for each school. They are hollow now, every one. Win yours. Help the others win theirs. And find whoever carries the other half of your stone. I can hear it humming from here.',
        choices: [
          { text: 'I’ll find them.', to: null, quest: true },
          { text: 'What happens if we open the Citadel?', to: 'open' },
          { text: 'Where do I find our Sentinel?', to: 'which' },
        ],
      },
      which: { speaker: 'npc:ysolde', text: 'The charter lists them in Turning order, and {school}’s is there with the rest. If you have not won its mark already, your own people in Concordia will know where it lies. They have been waiting thirty years for someone to ask.', next: null },
      open: { speaker: 'npc:ysolde', text: 'Then you meet whoever is weeping in it. I have read everything ever written in Brindlecross, and none of it tells me what happens after that.', next: null },
      later: { speaker: 'npc:ysolde', text: 'Bearers, marks, Bell. In that order. I am writing it all down.', next: null },
    },
  },

  // ================= II-6 The Eve of the Turning
  {
    id: 'dialogue:cc-aldous-eve', name: 'II-6 Aldous gives the Eve', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:aldous', text: 'The marks are won, and the bearers are gathered. Ysolde says it is a Turning, in every way that counts. Then it is time. Bring me the clapper, and I will ring the Bell.',
        choices: [{ text: 'Where is it?', to: 'where', quest: true, effects: [{ startQuest: 'quest:cc-eve' }] }],
      },
      where: { speaker: 'npc:aldous', text: 'In the drowned nave, where the choir laid it down. Go in by the north door at low water. And be gentle with them. They were my brothers.', next: null },
    },
  },
  {
    id: 'dialogue:obj-abbey-clapper', name: 'II-6 the Bell’s clapper', scope: 'party',
    entries: [{ when: { questStage: 'quest:cc-eve', stage: 'clapper' }, node: 'take' }, { node: 'gone' }],
    nodes: {
      gone: { speaker: 'narrator', text: 'The stone cradle where the clapper lay is empty now.', next: null },
      take: {
        speaker: 'narrator', text: 'The clapper lies on the altar of the drowned nave, wrapped in a choir robe. The drowned monks stand round it. As you lift it, they bow.',
        effects: [{ giveItem: 'i_clapper' }, { setFlag: 'cc.clapper', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:cc-eve', name: 'II-6 the Eve of the Turning', scope: 'party',
    entries: [{ node: 'shore' }],
    nodes: {
      shore: {
        speaker: 'npc:aldous', text: 'Look at them all. Every school on one shore. I was nineteen the last time I saw this. Help me into the boat.',
        next: 'bearers',
      },
      bearers: { speaker: 'narrator', text: 'The bearers stand along the shore in a long uneven line, every half-stone humming its own note. Somebody has brought a lantern; somebody else has brought a dog. {siblingbearer} is at your shoulder, and the two halves of your stone are singing to each other like old friends.', next: 'hand' },
      hand: {
        speaker: 'npc:aldous', text: '(He holds out his hands for the clapper.) You brought it up out of the nave. You should be the one to give it to me. It is heavier than it looks. So is everything, tonight.',
        choices: [
          { text: '(Give him the clapper, and help him into the boat.)', to: 'lake', when: { not: { flag: 'story.sentinel.radiance' } } },
          { text: '(Give him the clapper, and help him into the boat.)', to: 'lake-quiet', when: { flag: 'story.sentinel.radiance' } },
        ],
      },
      lake: {
        speaker: 'narrator', text: 'Aldous rows. The bearers stand along the shore, and every half-stone is singing. Over the bell-tower the water heaves, and the Abbess rises out of it, rope in her drowned hands.',
        next: 'morwen',
      },
      'lake-quiet': { speaker: 'narrator', text: 'Aldous rows out over the Abbey. Above the bell-tower the water lies flat and still, and nothing rises from it. The Abbess is at rest; somebody saw to that. Aldous reaches down into the lake, takes up the bell-rope himself, and his hands are shaking.', next: 'ring' },
      morwen: {
        speaker: 'narrator', mood: 'hollow', text: 'She looks along the shore at the bearers, one by one. Then she lets the rope go, and it floats to Aldous’s hand. This time it is a Turning.',
        next: 'ring',
      },
      ring: {
        speaker: 'narrator', text: 'Aldous fits the clapper and rings the Drowned Bell, once. It is heard in all twelve realms. Far off, at the Heart of Morvane, the Weeping Wall shudders and begins to part.',
        effects: [{ takeItem: 'i_clapper' }], next: 'strike',
      },
      strike: {
        speaker: 'narrator', text: 'In the noise of it, someone moves along the shore. {nemesis} is among the bearers, and then {siblingbearer} is on the ground, and the other half of your stone is no longer singing beside you. It is singing away, towards the Heart.',
        effects: [{ setFlag: 'story.sibling_robbed', value: true }],
        choices: [
          { text: '(Go to {siblingbearer}.)', to: 'tend' },
          { text: '(Run after {nemesis}.)', to: 'chase' },
        ],
      },
      tend: { speaker: 'narrator', text: '{siblingbearer} is alive, winded, one hand pressed flat to their chest where the song used to be. “It’s still singing,” they say. “Further off. But it’s still singing.”', next: 'after' },
      chase: { speaker: 'narrator', text: 'You get as far as the reeds. {nemesis} is already gone, and the song of the stolen half goes with them towards the Heart, fainter with every breath, never quite stopping.', next: 'after' },
      after: {
        speaker: 'npc:aldous', text: 'They have taken it to him. Then you must go after it. The Wall is open. God keep you, all of you. I will keep ringing.',
        choices: [{ text: 'To the Heart.', to: null, quest: true }],
      },
    },
  },
];

export default dialogues;
