/**
 * Hollow Crown, SAMURAI Act I depth pass (10-campaign-style.md §8, docs/PACING.md): the new stages' scenes,
 * investigation clues, travel banter, optional finds and the third parts of the side quests. Kanemori still speaks
 * only single words, each counted in samurai.kanemori_words. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition, NarrativeEffect } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const NIGHT: NarrativeCondition = { hour: [21, 4] };
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const offer = (q: Q, text: string, to: string): DialogueChoice => ({ text, to, quest: true, when: fresh(q), effects: [{ startQuest: q }] });
/** a stage scene that takes over an NPC's talk must still let them give their own quests */
const more = (...offers: DialogueChoice[]): DialogueChoice[] => [...offers, { text: '(Bow.)', to: null }];
const HK = 'npc:haru-kanemori' as const, IS = 'npc:ikeda-shun' as const, KT = 'npc:kenta' as const, DN = 'npc:daisuke-nine-coins' as const;
const MUSTER: Q = 'quest:samurai-the-call-to-muster';
const AC1: Q = 'quest:samurai-the-quiet-pew', AC4: Q = 'quest:samurai-the-ronin-under-the-wood', AC5: Q = 'quest:samurai-the-spinner-below';
const AC6: Q = 'quest:samurai-kanemoris-word', SAY: Q = 'quest:samurai-say-it-for-me', MASTERLESS: Q = 'quest:samurai-the-masterless', KENTA: Q = 'quest:samurai-kentas-letter';
/** Kanemori spends a word */
const WORD: NarrativeEffect = { addFlag: 'samurai.kanemori_words', amount: 1 };

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
  // ======================= I-1 The Bell in the Pines: up the Temple Road, the Lantern Shrine
  {
    id: 'dialogue:area-samurai-needle-road', name: 'I-1 banter: up the Temple Road in the needles', bark: true,
    entries: [{ when: stage('quest:samurai-the-bell-in-the-pines', 'climb'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'The needles are still coming down, ankle-deep on the steps now, and every footfall that should be silent goes crunch. Ahead of you, Kanemori walks through them without making a sound. You have no idea how.', next: null } },
  },
  {
    id: 'dialogue:samurai-kanemori-lanterns', name: 'I-1 the vigil at the Lantern Shrine', scope: 'party',
    entries: [{ node: 'shrine' }],
    nodes: {
      shrine: { speaker: 'narrator', text: 'The Lantern Shrine stands at the top of the Temple Road: a hundred stone lanterns on the steps, one for every abbot of Hushpine, kept lit for a thousand years. Tonight the Bell blew every one of them out at once. The pines round it stand bare.', next: 'taper' },
      taper: { speaker: 'narrator', text: 'Kanemori kneels at the first lantern, and lights it from a taper, and moves to the next. He does not ask you to help. He leaves a second taper on the step beside you.', next: 'help' },
      help: {
        speaker: 'narrator', text: 'Your half-stone is singing, loud as a struck bell on the silent mountain. Every time it swells, the flames he has just lit lean towards you.',
        choices: [
          { text: '(Take the taper and light lanterns with him, in silence.)', to: 'light', trust: 1, trustNpc: HK },
          { text: '(Draw your blade a finger’s width, and let the stone’s song run down it.)', to: 'draw', school: 'blade' },
          { text: 'Sensei, what is it?', to: 'ask' },
        ],
      },
      ask: { speaker: 'narrator', text: 'Your voice goes out across the dark like a dropped tray. Kanemori does not look up. He lights one more lantern. Then he holds out the taper to you, and waits until you take it.', next: 'light' },
      draw: { speaker: 'narrator', text: 'A finger of steel, out of the sheath. The song runs down the blade like water and every unlit lantern on the steps flickers, once, and goes out again. Kanemori looks at you. Then, slowly, he points at your sheath. You put the blade away.', next: 'light' },
      light: { speaker: 'narrator', text: 'You light lanterns side by side, all the way up the steps, one abbot at a time. It takes most of the night. Near the top there is one lantern that will not light at all. Kanemori stands in front of it for a long time.', next: 'last' },
      last: {
        speaker: 'narrator', text: 'Its stone is newer than the others, and has no name cut on it. A lantern for an abbot who has not yet come. Kanemori touches it, and then looks at you, and then at the half-stone glowing in your chest.',
        choices: [
          { text: '(Light it with the half-stone’s glow.)', to: 'glow' },
          { text: '(Leave it dark. It isn’t yours to light.)', to: 'dark' },
        ],
      },
      glow: { speaker: 'narrator', text: 'You hold your hand to it, and the glow in your chest runs down your arm, and the lantern lights: not orange like the others, but clear and pale, the colour of steel at dawn. Kanemori lets out a breath you did not know he was holding.', effects: [{ setFlag: 'samurai.lantern_lit', value: 'stone' }], next: 'word' },
      dark: { speaker: 'narrator', text: 'You leave it. Kanemori nods, very slightly, the way he nods when a novice does the right thing for the right reason. Then, beside it, he lays the taper down, still burning, and leaves it there for whoever it belongs to.', effects: [{ setFlag: 'samurai.lantern_lit', value: 'dark' }], next: 'word' },
      word: { speaker: HK, text: 'Listen.', effects: [WORD], next: 'dawn' },
      dawn: { speaker: 'narrator', text: 'His thirteenth word. You listen. Under the stone’s song, at last, you hear it: a single bird in the bare pines, the first of the morning. Kanemori pours two cups of tea from a pot you never saw him carry, and the sun comes up the mountain.', next: null },
    },
  },

  // ======================= I-2 Tea Before Steel: the novices’ trail
  clue('samurai-novice-trail-1', 'I-2 the novices’ trail (1)', stage('quest:samurai-tea-before-steel', 'trail'),
    'On the terrace steps, a novice’s prayer-beads, dropped and left. Not lost: laid down, on the step, in a neat circle, the way you put down something you mean to come back for.', 'samurai.trail_1',
    'A terrace step, swept.'),
  clue('samurai-novice-trail-2', 'I-2 the novices’ trail (2)', stage('quest:samurai-tea-before-steel', 'trail'),
    'Lower down, caught on a tea-bush, a strip of grey novice’s cloth, the band they tie their hair with. Torn off in a hurry, or in a temper. It is wet, and the tea-bush it hangs from has gone black at the leaf.', 'samurai.trail_2',
    'A tea-bush, curling black.'),
  clue('samurai-novice-trail-3', 'I-2 the novices’ trail (3)', stage('quest:samurai-tea-before-steel', 'trail'),
    'At the bottom of the terraces, where the road turns down towards the smoke of the Camps, a silver coin lies in the dust. Stamped on it is no lord’s face, only a bare blade with no hand on it. Ronin silver.', 'samurai.ronin_silver',
    'The bend where the terrace road turns down to the Camps.', 'Somebody paid the novices before they ever got to the Camps. Somebody came up the mountain with silver.'),

  // ======================= I-4 The Lord of No Master: the novices in the Camps, the valley’s lip
  ...[
    ['A novice from the first yard, sharpening a borrowed sword outside a Ronin tent. He sees you, and his hands stop. He signs, very small, “I am here”, and then, ashamed, “Sorry, Sensei.” He means Kanemori. He means you, a little.', 'A Ronin tent with a whetstone outside.'],
    ['Two novices from the third yard, counting silver at a camp table, paid and fed and laughing out loud, which they have not done in a year. When they see your robe they stop laughing, and you are sorry that they stop.', 'A camp table, with a few coins left on it.'],
    ['A girl from the fourth yard, the one whose cat sleeps on the mat, sitting alone by the Camps’ fence with her sword across her knees, looking up the mountain at the Terraces. She does not see you. You leave her looking.', 'The Camps’ fence, and a view of the mountain.'],
  ].map(([text, plain], i): DialogueDef => clue(`samurai-camp-novice-${i + 1}`, `I-4 a novice in the Camps (${i + 1})`, stage('quest:samurai-the-lord-of-no-master', 'camps'),
    text, `samurai.camp_novice_${i + 1}`, plain)),
  {
    id: 'dialogue:area-samurai-camps-ride', name: 'I-4 banter: riding out of the Camps', bark: true,
    entries: [{ when: stage('quest:samurai-the-lord-of-no-master', 'ride'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Ikeda’s rider goes ahead of you up the valley, whistling, very loudly and very badly, a tune you half know from the temple. All the way up, ronin stop what they are doing to wave at him.', next: null } },
  },
  {
    id: 'dialogue:samurai-ikeda-lip', name: 'I-4 Ikeda at the valley’s lip', scope: 'party',
    entries: [{ node: 'view' }],
    nodes: {
      view: { speaker: 'narrator', text: 'The valley’s lip, where the Camps end and the mountain starts. Below you, the smoke and noise of the Ronin Camps. Above, the Terraces, the dojo yards, the Temple Road, and, very high, a scrap of roof in the cloud: the High Terrace. Ikeda is sitting on a rock, looking up at it.', next: 'steps' },
      steps: { speaker: IS, text: 'I sat on those steps once, you know. Up there. Swept them. Raked the gravel. Drank the tea. A year of not speaking. Nearly killed me. (He laughs.) I talked to the pines when nobody was looking. The pines were very good about it.', next: 'why' },
      why: {
        speaker: IS, text: 'Then one day I asked my teacher whom a sword serves, and he gave me an answer with no words in it, and I went down the mountain to find a better one. Thirty years ago. I’m still looking.',
        choices: [
          { text: 'Who was your teacher?', to: 'teacher' },
          { text: 'The silver on the terrace road. That was yours. You paid them before they ever came down.', to: 'silver', when: { flag: 'samurai.ronin_silver' } },
          { text: '(Say nothing. Look up at the High Terrace with him.)', to: 'look', trust: 1, trustNpc: IS },
        ],
      },
      teacher: { speaker: IS, mood: 'happy', text: '(He looks at you sideways, and grins.) Somebody who never says anything. There are a great many of those up there. Guess.', next: 'end' },
      silver: { speaker: IS, mood: 'happy', text: 'Of course it was. Did you think they’d come down for nothing? (He shrugs.) I didn’t lie to them. I only got there before your sensei did. He never gets anywhere first. He waits. I hate waiting.', next: 'end' },
      look: { speaker: 'narrator', text: 'You look up together for a long time. The cloud moves over the High Terrace and off it again. Ikeda’s hand stays on his hilt the whole time, and at the end of it, very quietly, he says: “It’s beautiful, isn’t it. I can never stay.”', next: 'end' },
      end: { speaker: IS, text: 'There’s a muster coming, novice. The General’s called every sword in Steelvale to the Edge Gate. Your elders will march you down to it. Come and tell me what you choose. I’ll be at the gate of the Elders’ Yard, smiling.', next: null },
    },
  },

  // ======================= I-5 The Call to Muster: canvassing, and dawn at the temple gate
  {
    id: 'dialogue:samurai-kenta-canvass', name: 'I-5 Kenta on whom a sword serves', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: KT, text: '(Kenta is sweeping his yard for the second time this morning. He stops when he sees you, and thinks very hard about your question, with his whole face.) Whom does a sword serve?', next: 'think' },
      think: {
        speaker: KT, text: '(He whispers, because there is nobody about.) The elders say the marshal. Lord Ikeda says nobody. I think… I think mine serves the yard. Because if I don’t practise, nobody will, and then there won’t be a yard.',
        choices: [
          { text: 'That’s a good answer, Kenta.', to: 'good', trust: 1, trustNpc: KT },
          { text: 'What if the yard doesn’t need you?', to: 'need' },
        ],
      },
      good: { speaker: KT, mood: 'happy', text: '(He goes so red his ears glow.) Is it? I made it up just now. Don’t tell the elders. They’ll want me to say it in the yard, out loud, and I’ll die.', choices: more(offer('quest:samurai-the-novice-who-stayed', '(Point at his practice post, and raise your eyebrows.)', 'spar')) },
      need: { speaker: KT, mood: 'sad', text: '(He looks at the empty yard, at the four empty yards below it.) Then I’d keep it swept anyway. In case they come back. (He goes back to sweeping, very hard.)', choices: more(offer('quest:samurai-the-novice-who-stayed', '(Point at his practice post, and raise your eyebrows.)', 'spar')) },
      spar: { speaker: KT, mood: 'happy', text: '(He runs to his post so fast he forgets to bow, and then runs back, and bows, and runs again.)', next: null },
    },
  },
  {
    id: 'dialogue:samurai-daisuke-canvass', name: 'I-5 Daisuke on whom a sword serves', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: DN, text: 'Whom does a sword serve? Ha. Ask a hungry man what bread is for. (He spits, politely, to one side.) Mine serves whoever pays it, quiet one, and I tell them so before they pay. That’s more honesty than your elders or Ikeda will give you.', next: 'muster' },
      muster: {
        speaker: DN, text: 'The General pays nothing. He calls, and swords go, because they’re afraid of what happens if they don’t. Ikeda pays well, and says he serves nobody. Nobody, my boot. Ikeda serves Ikeda.',
        choices: [
          { text: 'And if nobody paid you?', to: 'nobody' },
          { text: 'What would you have the novices do?', to: 'novices' },
        ],
      },
      nobody: { speaker: DN, mood: 'sad', text: '(He is quiet a while.) Then I’d have to decide for myself what it was for. That’s the frightening bit, isn’t it. That’s why everybody wants a master.', choices: more(offer('quest:samurai-nine-coins', 'Your company was cheated. I could talk to Ozu.', 'ozu')) },
      novices: { speaker: DN, text: 'Go home. Eat. Sweep their yards. They’re children with very good knees. Tell them a ronin said so, and they might listen.', choices: more(offer('quest:samurai-nine-coins', 'Your company was cheated. I could talk to Ozu.', 'ozu')) },
      ozu: { speaker: DN, text: 'Talk? You’re Hushpine. You don’t talk. That’s why I’m asking you. Ozu can’t bear silence. Nobody in the Camps can.', next: null },
    },
  },
  {
    id: 'dialogue:obj-samurai-muster-dawn', name: 'I-5 dawn at the temple gate', scope: 'party',
    entries: [
      { when: { all: [stage(MUSTER, 'dawn'), { flag: 'samurai.oath', value: 'cut' }] }, node: 'cut' },
      { when: { all: [stage(MUSTER, 'dawn'), { flag: 'samurai.oath', value: 'sheathed' }] }, node: 'sheathed' },
      { when: stage(MUSTER, 'dawn'), node: 'answered' },
      { node: 'plain' },
    ],
    nodes: {
      answered: { speaker: 'narrator', text: 'Dawn at the temple gate. The novices come down the Temple Road two by two in their grey robes, swords on their backs, silent, and go out of the gate and on down the mountain towards the Edge Gate. Not one of them looks back.', next: 'answered2' },
      answered2: { speaker: 'narrator', text: 'At the end of the line comes Kenta, much too small, with his practice sword. An elder stops him, gently, and turns him round. He walks back up past you with his chin set, and does not cry until he thinks nobody can see.', effects: [{ setFlag: 'samurai.dawn_seen', value: 'answered' }], next: null },
      cut: { speaker: 'narrator', text: 'Dawn at the temple gate, and the gravel is full of topknots. The novices who cut them have gone down to the Camps in the night. The elders are raking them up, very slowly, one by one, into a small grey heap.', next: 'cut2' },
      cut2: { speaker: 'narrator', text: 'Kanemori is standing at the gate with the rake in his hands. He does not look at you. When he has finished, he puts one topknot in his sleeve, and goes back up the road.', effects: [{ setFlag: 'samurai.dawn_seen', value: 'cut' }], next: null },
      sheathed: { speaker: 'narrator', text: 'Dawn at the temple gate. All along the Temple Road, a novice to every milestone, sit the novices with their swords across their knees, sheathed. The first pilgrims of the morning walk up between them, in silence, completely safe.', next: 'sheathed2' },
      sheathed2: { speaker: 'narrator', text: 'One of the pilgrims stops in front of a novice and signs “thank you”. The novice signs it back, then signs “I am here”. Somewhere above you, at the shrine, a bell rings very softly, all by itself.', effects: [{ setFlag: 'samurai.dawn_seen', value: 'sheathed' }], next: null },
      plain: { speaker: 'narrator', text: 'The temple gate at the head of the Temple Road.', next: null },
    },
  },

  // ======================= I-6 The Sheathed Blade: the cut offerings (one per shrine room)
  clue('samurai-shrine-offering-1', 'I-6 a cut offering (1)', stage('quest:samurai-the-sheathed-blade', 'offerings'),
    'A pilgrim’s offering-board in the first side hall, a thousand little wooden plaques of wishes hung on cords. Every cord has been cut. The wishes lie in heaps on the floor. Not one plaque is marked. Only the strings.', 'samurai.offering_1',
    'Plaques of wishes, hung up again on new cords.'),
  clue('samurai-shrine-offering-2', 'I-6 a cut offering (2)', stage('quest:samurai-the-sheathed-blade', 'offerings'),
    'A rack of offered sheaths in the second hall: pilgrims used to leave a sheath here when they gave up the sword, so that it would rest. Every sheath has been split down the side, neatly, from mouth to tip, as if something wanted them never to close again.', 'samurai.offering_2',
    'A rack of split sheaths.'),
  clue('samurai-shrine-offering-3', 'I-6 a cut offering (3)', stage('quest:samurai-the-sheathed-blade', 'offerings'),
    'In the third hall, a stone basin of water for the pilgrims to wash their hands before the altar. The surface of the water has been cut. You can see it: a clean line across it that does not close, as if the water itself were holding a wound open.', 'samurai.offering_3',
    'A stone basin of still water.', 'Beyond the last door, something turns in the air, over and over, with a sound like breath through teeth.'),

  // ======================= I-7 A Blade with No Master: the hidden pilgrims, and telling Kanemori
  ...[
    'An old pilgrim crouched behind a pine with his hands over his ears. When you touch his shoulder, he jumps. You sign “I am here”, and slowly he takes his hands down and signs it back, shaking.',
    'Two pilgrim children hiding in a hollow under the roots, perfectly silent, as they were taught. One of them is holding a cake. You sign “water”, and they nod, and you lead them back to the road shrine by the hand.',
    'Goodwife Hettie Natter, of all people, flat on her back in the needles, holding a pilgrim baby to her chest and humming to it so quietly you can barely hear. She signs, very fiercely: “I am here. Be quick.”',
  ].map((text, i): DialogueDef => clue(`samurai-hidden-pilgrim-${i + 1}`, `I-7 a hidden pilgrim (${i + 1})`, stage('quest:samurai-a-blade-with-no-master', 'pilgrims'),
    text, `samurai.hidden_pilgrim_${i + 1}`, 'Bare pines, and footprints in the needles going back to the road.')),
  {
    id: 'dialogue:samurai-kanemori-ikeda', name: 'I-7 telling Kanemori about Ikeda', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'Kanemori is not sweeping. He is sitting in his cell with an empty cup in front of him, and his hands in his lap, and he has not lit the lamp. He knew before you came.', next: 'tell' },
      tell: {
        speaker: 'narrator', text: 'You kneel across from him.',
        choices: [
          { text: '(Say nothing. Let him read it in your face.)', to: 'face', trust: 1, trustNpc: HK },
          { text: 'He’s gone up to the High Terrace, Sensei. He means to set the Terrace half in himself.', to: 'speak' },
          { text: '(Lay the empty sheath from the shrine between you.)', to: 'sheath', when: { flag: 'samurai.sheath_taken' } },
        ],
      },
      face: { speaker: 'narrator', text: 'He reads it. It does not take long. He closes his eyes, and for a moment he looks very old, older than the pines, older than the shrine.', next: 'up' },
      speak: { speaker: 'narrator', text: 'Your words go into the dark of the cell and do not come back. He nods, slowly, once for each of them, as if he were counting them, and putting them away.', next: 'up' },
      sheath: { speaker: 'narrator', text: 'He looks down at it, at the old black and red lacquer, at the two names carved inside its mouth. Then he puts out one hand and touches it, the way you would touch the face of somebody asleep.', next: 'up' },
      up: { speaker: 'narrator', text: 'Then he gets up, and takes his own sword down from the wall, the plain one he has never once drawn in all your years here, and holds it out to you across the cup, sheathed, hilt first.', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'It is a gift, or a request, or both. With Kanemori it is always both.',
        choices: [
          { text: '(Take it in both hands, and bow.)', to: 'take', effects: [{ setFlag: 'samurai.kanemori_sword', value: 'taken' }] },
          { text: '(Push it gently back to him. You have your own.)', to: 'back', effects: [{ setFlag: 'samurai.kanemori_sword', value: 'returned' }] },
        ],
      },
      take: { speaker: 'narrator', text: 'You take it. It is heavier than yours, and older, and the sheath is worn smooth where a hand has rested on it for forty years without ever drawing. You understand that you are not to draw it either, if you can help it.', next: 'word' },
      back: { speaker: 'narrator', text: 'You push it back. He looks at you a long while, and then nods, and lays it across his own knees. Whatever happens on the High Terrace, it is yours to do, with your own blade. He seems glad.', next: 'word' },
      word: { speaker: HK, text: 'Go.', effects: [WORD], next: null },
    },
  },

  // ======================= I-9 The Pilgrim Road Down: the last milestone (codex find)
  {
    id: 'dialogue:obj-samurai-last-milestone', name: 'I-9 the last milestone', scope: 'party',
    entries: [{ when: stage('quest:samurai-the-pilgrim-road-down', 'milestone'), node: 'stone' }, { node: 'plain' }],
    nodes: {
      stone: { speaker: 'narrator', text: 'The last milestone of the Temple Road, where the pines end and the open road begins. There is a hand carved on it, palm flat to the chest: “I am here.” Below it, worn deep by a thousand years of fingertips, a second hand, palm out: “I was here.”', next: 'touch' },
      touch: {
        speaker: 'narrator', text: 'Pilgrims leaving Hushpine stop here and keep one breath of silence for the road behind them. Your half-stone has gone quiet in your chest, as if it were keeping the custom too.',
        choices: [
          { text: '(Press your palm to the stone. Keep the silence.)', to: 'palm', effects: [{ unlockLore: 'lore:hc-samurai-last-milestone' }] },
          { text: '(Turn, and look back up the road, all the way to the Lantern Shrine.)', to: 'look', effects: [{ unlockLore: 'lore:hc-samurai-last-milestone' }] },
        ],
      },
      palm: { speaker: 'narrator', text: 'The stone is cold, and then it is not. When you take your hand away there is a faint print on it, clear as frost, palm out. I was here. It fades as you watch, but the stone looks as if it will remember.', next: null },
      look: { speaker: 'narrator', text: 'All the way up the bare mountain, the Lantern Shrine is lit, every lantern, a hundred points of light in the morning, and at the very top one small light that is not quite like the others.', next: null },
      plain: { speaker: 'narrator', text: 'The last milestone of the Temple Road. “I am here.” “I was here.”', next: null },
    },
  },
  {
    id: 'dialogue:area-samurai-pilgrim-road', name: 'I-9 banter: the pilgrim road down', bark: true,
    entries: [{ when: stage('quest:samurai-the-pilgrim-road-down', 'road'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Below the pines the road is loud: wind, birds, a cart somewhere, and far off down the valley the sound of a thousand blades moving in ranks. After a year of silence it is almost too much. Your hand finds your sheath and rests there.', next: null } },
  },

  // ======================= Side: the Loudest Pilgrim (the Echo Stone)
  {
    id: 'dialogue:obj-samurai-echo-stone', name: 'The Loudest Pilgrim: the Echo Stone', scope: 'party',
    entries: [{ when: stage('quest:samurai-the-loudest-pilgrim', 'echo'), node: 'stone' }, { node: 'plain' }],
    nodes: {
      stone: { speaker: 'narrator', text: 'The Echo Stone stands in a hollow above the shrine, where the mountain folds back on itself. Pilgrims may speak here once, the custom says, and the one they have lost will hear it. Hettie stands in front of it with her hands knotted in her shawl, completely silent for the first time in her life.', next: 'say' },
      say: { speaker: 'npc:hettie-natter', mood: 'sad', text: '(Then, out loud, to the stone, very clearly:) Bertram. I’m sorry I talked all the way through your funeral. I was frightened that if I stopped I’d hear how quiet it was. That’s all. That’s all I came to say.', next: 'echo' },
      echo: {
        speaker: 'narrator', text: 'The hollow takes her words and gives them back, softer, once, twice, a dozen times, round the folds of the mountain, until they are only breath. Hettie listens to every one.',
        choices: [
          { text: '(Sign “I am here”, and stand beside her.)', to: 'here', effects: [{ setFlag: 'samurai.hettie_echo', value: true }] },
          { text: '(Leave her to listen, and wait at the shrine.)', to: 'wait', effects: [{ setFlag: 'samurai.hettie_echo', value: true }] },
        ],
      },
      here: { speaker: 'narrator', text: 'She takes your hand and holds it, hard, until the last echo is gone. Then she wipes her face and says, in a perfectly ordinary voice, “Well. He always said I’d never manage a quiet minute. I managed nearly two.”', next: null },
      wait: { speaker: 'narrator', text: 'When she comes back down to the shrine she is quiet, really quiet, for nearly a quarter of an hour. Then she tells you all about Bertram, from the beginning, and you find you do not mind at all.', next: null },
      plain: { speaker: 'narrator', text: 'The Echo Stone, in its hollow above the shrine.', next: null },
    },
  },

  // ======================= Side: the Pine That Fell (the bench at the Resting Bend)
  {
    id: 'dialogue:obj-samurai-pine-bench', name: 'The Pine That Fell: the bench', scope: 'party',
    entries: [{ when: stage('quest:samurai-the-pine-that-fell', 'bench'), node: 'bend' }, { node: 'plain' }],
    nodes: {
      bend: { speaker: 'narrator', text: 'The Resting Bend, halfway up the Temple Road, where the old pilgrims stop to breathe. You and Master Tsuge set the bench down between two bare pines: a single plank of the fallen tree, honey-coloured, with a dark edge where the black rings are.', next: 'sit' },
      sit: {
        speaker: 'narrator', text: 'Tsuge sits on one end of it, and pats the other end.',
        choices: [
          { text: '(Sit.)', to: 'sat', effects: [{ setFlag: 'samurai.pine_bench', value: true }] },
          { text: '(Leave it for the first pilgrim of the day.)', to: 'leave', effects: [{ setFlag: 'samurai.pine_bench', value: true }] },
        ],
      },
      sat: { speaker: 'narrator', text: 'You sit. It is a very good bench. After a while Tsuge points up, without a word, at the bare pine above you. On the end of one branch, tiny and bright green, a single new needle is coming.', next: null },
      leave: { speaker: 'narrator', text: 'You stand back. The first pilgrim of the day comes round the bend, very old, very tired, and sees the bench, and sits on it, and closes her eyes. Above her, on the end of one bare branch, a single new needle is coming.', next: null },
      plain: { speaker: 'narrator', text: 'A bench of honey-coloured pine at the Resting Bend, dark along one edge.', next: null },
    },
  },

  // ======================= Side: Tea Without Water (the crack in the rock)
  clue('samurai-spring-crack', 'Tea Without Water: the crack', stage('quest:samurai-tea-without-water', 'crack'),
    'Above the Ashina spring, where the water first comes out of the mountain, the rock is split by a thin crack, and down the crack, slow as honey, runs a thread of black. It is not rising from below. It is coming down, from somewhere high up the mountain, from above the clouds.',
    'samurai.spring_crack', 'A crack in the rock above the Ashina spring, packed with clean moss.',
    'You pack the crack with wet moss from the terrace, as tight as you can. It will not last. Whatever is weeping up on the High Terrace, the whole mountain is drinking it.'),

  // ======================= Side: the Novice Who Stayed (Ryo)
  {
    id: 'dialogue:obj-samurai-kenta-brother', name: 'The Novice Who Stayed: Ryo in the Camps', scope: 'party',
    entries: [{ when: stage('quest:samurai-the-novice-who-stayed', 'brother'), node: 'ryo' }, { node: 'plain' }],
    nodes: {
      ryo: { speaker: 'narrator', text: 'Ryo is fifteen, and too thin, and on sentry duty at a Ronin tent with a borrowed sword. When you hold out the leaf parcel he knows the fold at once. He holds it a long time without opening it.', next: 'choose' },
      choose: {
        speaker: 'narrator', text: '“Is he sweeping the yard?” he says, very quietly, so the ronin will not hear. “Both of them? Mine as well?”',
        choices: [
          { text: '(Nod. Then point up the mountain.)', to: 'point', effects: [{ setFlag: 'samurai.kenta_brother', value: 'home' }] },
          { text: '(Nod, and say nothing else. It is his to decide.)', to: 'nod', effects: [{ setFlag: 'samurai.kenta_brother', value: 'stayed' }] },
        ],
      },
      point: { speaker: 'narrator', text: 'Ryo looks up the mountain for a long time. Then he unbuckles the borrowed sword, leans it against the tent, eats the rice ball in four bites, and starts walking. He does not ask anyone’s leave. Nobody stops him.', next: null },
      nod: { speaker: 'narrator', text: 'Ryo eats the rice ball slowly, the way you eat something you want to remember. “Tell him I’m coming,” he says. “Not yet. When it’s finished. Tell him to keep sweeping.” He goes back to his post.', next: null },
      plain: { speaker: 'narrator', text: 'A Ronin tent with a borrowed sword leaning against it.', next: null },
    },
  },

  // ======================= Side: Nine Coins (the false bottom)
  {
    id: 'dialogue:obj-samurai-ozu-strongbox', name: 'Nine Coins: the false bottom', scope: 'party',
    entries: [{ when: stage('quest:samurai-nine-coins', 'strongbox'), node: 'box' }, { node: 'plain' }],
    nodes: {
      box: { speaker: 'narrator', text: 'Ozu’s strongbox, open, Ozu very carefully not watching. Under the false bottom lies a second ledger, small and greasy. Every company in the Camps is listed, and against each one, every month: “One coin in ten. To the Edge Gate.”', next: 'tithe' },
      tithe: {
        speaker: 'narrator', text: 'The General’s tithe. Every ronin purse in the Camps has been paying for his muster, a coin in ten, for years, and none of them knew. Ozu has been the General’s collector. He is sweating through his coat.',
        choices: [
          { text: '(Take the ledger to Daisuke.)', to: 'daisuke', effects: [{ setFlag: 'samurai.tithe', value: 'told' }] },
          { text: '(Burn it in Ozu’s lamp. Let the tithe stop here.)', to: 'burn', effects: [{ setFlag: 'samurai.tithe', value: 'burned' }] },
        ],
      },
      daisuke: { speaker: 'narrator', text: 'Daisuke reads it twice, and laughs, a short hard laugh. “So we’ve been serving the General all along,” he says, “and paying for the privilege. Well. Now I know who pays me. That makes it my choice.” He tucks the ledger in his coat.', next: null },
      burn: { speaker: 'narrator', text: 'The ledger goes up in Ozu’s lamp with a smell of old grease. Ozu watches it burn and, for the first time since you met him, looks relieved. “Nobody saw anything,” he whispers. “Nobody ever tells anybody anything.” This time, he means it kindly.', next: null },
      plain: { speaker: 'narrator', text: 'Ozu’s strongbox, locked a great many times.', next: null },
    },
  },

  // ======================= Side: the Whetstone Stall (Ikeda’s sheaths)
  {
    id: 'dialogue:obj-samurai-ikeda-sheaths', name: 'The Whetstone Stall: Ikeda’s sheaths', scope: 'party',
    entries: [{ when: stage('quest:samurai-the-whetstone-stall', 'sheath'), node: 'tent' }, { node: 'plain' }],
    nodes: {
      tent: { speaker: 'narrator', text: 'Ikeda’s pavilion is empty, the stolen cushions plumped, a cup of wine going warm. You set Tomoe’s plain sheath on his cushion. Then you notice the folding screen in the corner, and what is behind it.', next: 'pile' },
      pile: { speaker: 'narrator', text: 'Sheaths. Plain wooden sheaths, a hundred of them at least, stacked with great care against the back wall of the pavilion, every one Tomoe’s work. He laughs, and says a sheath is a cage, and throws them away. He has never thrown one away.', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'On top of the stack, the newest one has been oiled, recently, by somebody who knew how.',
        choices: [
          { text: '(Put Tomoe’s sheath on top of the stack.)', to: 'stack', effects: [{ setFlag: 'samurai.ikeda_sheaths', value: true }] },
          { text: '(Leave it on the cushion, where she asked.)', to: 'cushion', effects: [{ setFlag: 'samurai.ikeda_sheaths', value: true }] },
        ],
      },
      stack: { speaker: 'narrator', text: 'It sits on the top of the stack like the last stone of a cairn. You move the screen back, exactly as it was. When you tell Tomoe, much later, she says nothing for a long time, and then: “Silly boy.” She does not sound cross.', next: null },
      cushion: { speaker: 'narrator', text: 'You leave it on the cushion and move the screen back, exactly as it was. As you go out, a rider comes in, sees the sheath on the cushion, and very carefully does not touch it, the way you would not touch a lord’s sword.', next: null },
      plain: { speaker: 'narrator', text: 'Ikeda’s pavilion. There is a folding screen in the corner.', next: null },
    },
  },

  // ======================= Side: the Dancer’s Partner (the dancers’ stone)
  clue('samurai-dancers-stone', 'The Dancer’s Partner: the dancers’ stone', stage('quest:samurai-the-dancers-partner', 'stone'),
    'At the end of the old channel, where the bamboo opens on to a still pool, stands a flat stone where the Shallows’ blade-dancers used to perform for the Turning procession. Two swords lie on it, side by side, tip to hilt, at rest. Cut into the stone beneath them are two names: AOI. SEN.',
    'samurai.dancers_rest', 'The dancers’ stone. Two swords lie on it, side by side, and nobody has moved them.',
    'Nobody will ever know which of them was the sword that waited. You think perhaps it was both.'),

  // ======================= Side: the Frog Choir (the concert at the Moon Pool)
  {
    id: 'dialogue:obj-samurai-frog-concert', name: 'The Frog Choir: the concert at the Moon Pool', scope: 'party',
    entries: [
      { when: { all: [stage('quest:samurai-the-frog-choir', 'concert'), NIGHT] }, node: 'night' },
      { when: stage('quest:samurai-the-frog-choir', 'concert'), node: 'day' },
      { node: 'plain' },
    ],
    nodes: {
      day: { speaker: 'narrator', text: 'The Moon Pool, empty in the daylight but for a lot of excited frogs practising. The concert, Natsu said, is tonight.', next: null },
      night: { speaker: 'narrator', text: 'The Moon Pool at night, round and silver, and on every lily pad a frog. Old Gama on his stone at the front, throat swelling. On the bank, in a neat row, on six small mats, sit the six elders of the Hushpine Order. Elder Fumiko Sora is holding a programme.', next: 'sing' },
      sing: {
        speaker: 'narrator', text: 'Gama raises his head, and the Shallows explode into song: the loudest, worst, most glorious noise in Steelvale. The elders do not move a muscle. Elder Sora’s foot is tapping.',
        choices: [
          { text: '(Sit at the end of the row of elders.)', to: 'sit', effects: [{ setFlag: 'samurai.frog_concert', value: true }] },
          { text: '(Watch from the bamboo. This seems private.)', to: 'watch', effects: [{ setFlag: 'samurai.frog_concert', value: true }] },
        ],
      },
      sit: { speaker: 'narrator', text: 'You sit. Elder Sora passes you the programme without looking at you. It is hand-written, in a beautiful brush-hand, and lists every song in the choir’s repertoire, with notes. She has been coming for forty years. You will never tell anyone.', next: null },
      watch: { speaker: 'narrator', text: 'You watch from the bamboo. At the end, when Gama takes his bow, all six elders bow back to him, low, exactly as deep as they would bow to the abbot. Then they roll up their mats and go silently home.', next: null },
      plain: { speaker: 'narrator', text: 'The Moon Pool. Somebody has left a small mat on the bank.', next: null },
    },
  },

  // ======================= Optional areas (Claude 2): finds in the Hushpine ruin, cave and viewpoint
  find('blade-frontier-ruin-find', 'Hushpine ruin: the old dojo',
    'In the ruin, among the stumps of practice posts, a dojo’s name-board lies face down in the moss. You turn it over. Every novice who ever trained here, a name a line, and beside each a single word, the one word their teacher gave them when they left. The last word on the board is “Stay.”',
    'lore:hc-blade-frontier-ruin'),
  find('blade-frontier-cave-find', 'Hushpine cave: the hermit’s wall',
    'At the end of the cave, where a hermit of the Order once sat out a year of silence in the dark, the wall is covered in tally-marks: one for every day. Under the last of them, scratched with a fingernail: “Three hundred and sixty-five. I can hear the mountain now. I am going back up.”',
    'lore:hc-blade-frontier-cave'),
  find('blade-frontier-cave-codex', 'The Hermit’s Cave: a bowl and a note',
    'A plain wooden bowl on a ledge, and under it a note in a careful hand: “For whoever comes next. Fill it with water each morning. Drink it at night. Say nothing in between. On the hundredth day you will want to speak more than you have ever wanted anything. Don’t. On the hundred-and-first you won’t.”',
    'lore:hc-blade-frontier-tally'),
  find('blade-frontier-view-find', 'Hushpine viewpoint: above the clouds',
    'From the viewpoint you stand above the cloud, and the whole of the Hushpine mountain rises out of it like an island: the Lantern Shrine, the Terraces, the High Terrace at the very top. Somebody has carved a single word into the rail, and polished it with their thumb for years: “Listen.”',
    'lore:hc-blade-frontier-view'),
  {
    id: 'dialogue:area-blade-frontier-view', name: 'Hushpine viewpoint banter',
    bark: true, entries: [{ when: { heroClass: 'samurai' }, node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Up here the cloud makes no sound at all, and neither do you. Very far below, faint and terrible and somehow wonderful, Old Gama’s choir is practising.', next: null } },
  },
  // ======================= ACT II, C-1 The Quiet Pew: the moor road, thirty years of strips
  {
    id: 'dialogue:area-samurai-chapel-road', name: 'C-1 banter: the road to the Chapel', bark: true,
    entries: [{ when: stage(AC1, 'pew'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Concordia talks all the time. Carters talk to horses, the wind talks to the heather, a woman at a well is talking to a bucket. After a year on the Temple Road it is like walking into a waterfall.', next: null } },
  },
  {
    id: 'dialogue:obj-samurai-pilgrim-strips', name: 'C-1 the pilgrims’ strips on the Chapel rail', scope: 'party',
    entries: [{ when: stage(AC1, 'strips'), node: 'rail' }, { node: 'plain' }],
    nodes: {
      rail: { speaker: 'narrator', text: 'Along the back rail of the Chapel hangs a fringe of paper prayer-strips, thousands of them, so many the rail has bowed. One for each pilgrim for each night of thirty years. Every one of them is blank.', next: 'oldest' },
      oldest: {
        speaker: 'narrator', text: 'Hisako lifts the oldest, brown as a leaf, from the end of the rail. On this one, and only this one, there is a word, in a pilgrim’s careful brush: “Wait.” It is dated the night the arches shut.',
        choices: [
          { text: '(Tie a blank strip of your own beside theirs.)', to: 'tie', trust: 1, trustNpc: 'npc:hisako' },
          { text: 'Wait for what, Pilgrim-Mother?', to: 'ask' },
          { text: '(Sign the Temple Road sign for “I am here”.)', to: 'sign', school: 'blade' },
        ],
      },
      tie: { speaker: 'narrator', text: 'You tie a blank strip on the end of the rail. Hisako watches you do it, and her mouth goes tight, the way an old woman’s mouth goes when she has decided not to cry in church.', next: 'end' },
      ask: { speaker: 'npc:hisako', text: '(She looks at the floor, and at you, and at the floor again. Then, in a whisper, the second word she has said in a year.) This.', next: 'end' },
      sign: { speaker: 'narrator', text: 'Hisako signs it back, and the four pilgrims in the pew behind her sign it too, one after another, without being asked: I am here. I am here. I am here. I am here.', next: 'end' },
      end: { speaker: 'narrator', text: 'Thirty years of waiting over something they could hear and not see. Under the Chapel, the muster is still marching.', effects: [{ setFlag: 'samurai.strips_seen', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The back rail of the Chapel, bowed under thirty years of blank prayer-strips.', next: null },
    },
  },

  // ======================= ACT II, C-3 Bonelord Varric: telling the pilgrims
  {
    id: 'dialogue:samurai-hisako-varric', name: 'C-3 Hisako hears the muster has stood down', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'The five pilgrims are not sitting in the back pew. They are standing, for the first time anybody in Brindlecross can remember, with their palms flat on the cold flagstones, listening to nothing at all.', next: 'look' },
      look: {
        speaker: 'npc:hisako', text: '(Hisako looks up at you, and asks with her whole face.)',
        choices: [
          { text: '(Sign: “They have sheathed. They are resting.”)', to: 'sign' },
          { text: 'Varric asked if his sword could be sheathed now. I said yes.', to: 'speak' },
          { text: '(Say nothing. Kneel and put your palm on the floor beside hers.)', to: 'kneel', trust: 1, trustNpc: 'npc:hisako' },
        ],
      },
      sign: { speaker: 'narrator', text: 'Your hands are clumsy at it, a year out of practice on the Temple Road. Hisako reads every sign twice, the way the old pilgrims do, and nods.', next: 'stand' },
      speak: { speaker: 'narrator', text: 'Your voice is very loud in the Chapel. Nobody minds. Brother Aldous, lighting candles at the front, stops with the taper in his hand and does not move until you have finished.', next: 'stand' },
      kneel: { speaker: 'narrator', text: 'Under your palm the flagstone is only cold stone. No feet. No drill. For the first time in thirty years, nothing under the Chapel is keeping a silence. It is simply quiet.', next: 'stand' },
      stand: { speaker: 'npc:hisako', mood: 'sad', text: '(She stands, slowly, all the way up, and says aloud, in a cracked voice, three words.) Thank you. Home.', next: 'home' },
      home: { speaker: 'narrator', text: 'Behind her the other four pilgrims begin, very carefully, to take down their strips from the rail, one at a time. It will take them a week. They do not seem to mind.', effects: [{ setFlag: 'samurai.pilgrims_freed', value: true }], next: null },
    },
  },

  // ======================= ACT II, C-4 The Ronin Under the Wood: Ikeda at the root-caves
  {
    id: 'dialogue:area-samurai-gloam-threads', name: 'C-4 banter: under the Gloamwood', bark: true,
    entries: [{ when: stage(AC4, 'threads'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Under the Gloamwood the roots hum, very faintly, like a congregation that has forgotten the words but not the tune. Here and there a hum stops short, cut, and does not start again.', next: null } },
  },
  {
    id: 'dialogue:samurai-ikeda-roots', name: 'C-4 Ikeda at the mouth of the root-caves', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'At the mouth of the root-caves a man in a ronin’s coat stands with his back to you, cutting a silver thread as thick as a rope. It parts like a harp string. Black chains, fine as frost, are wound round his wrists, and every cut draws them a link tighter.', next: 'novice' },
      novice: { speaker: IS, text: 'Kanemori’s novice. (He does not turn round.) He sent you after me with no words and a sword, I suppose. Listen to this one. (He holds up a thread.) The Concord’s muster roll. Every name that ever served the crown.', next: 'cut' },
      cut: {
        speaker: IS, text: 'No record, no masters. When the last thread is cut, nobody will remember who was meant to serve whom. Not even the crown.',
        choices: [
          { text: '(Say nothing. Look at the chains on his wrists.)', to: 'chains' },
          { text: 'Whom does your sword serve now, Lord Ikeda?', to: 'serve' },
          { text: '(Lay your hand on your sheathed sword, and wait.)', to: 'wait', school: 'blade' },
        ],
      },
      chains: { speaker: IS, text: '(He glances down at them.) These? They tighten every time I cut. Something wants me very badly. Let it want. Wanting is not having. (Another thread parts.)', next: 'go' },
      serve: { speaker: IS, mood: 'angry', text: 'Nothing. That is the point of it. That is the one thing the old man never understood. A sword can be for nothing, and be free.', next: 'go' },
      wait: { speaker: IS, text: '(He sees your hand on the hilt and laughs, once.) His draw. He taught you the waiting. He taught me too. I got tired of waiting, novice. That is all a ronin is.', next: 'go' },
      go: { speaker: IS, text: 'The Spinner kept all of it. Every Turning, every oath, every name. I am going down to finish. Follow me if you like. Bring his silence. You will need it.', next: 'dark' },
      dark: { speaker: 'narrator', text: 'He steps backwards into the dark of the root-caves without once looking at you, and the black chains go with him, clinking softly, like something following on a lead.', effects: [{ setFlag: 'samurai.ikeda_roots', value: true }], next: null },
    },
  },

  // ======================= ACT II, C-5 The Spinner Below: the thread Ikeda never reached
  clue('samurai-spinner-record', 'C-5 the last uncut thread', stage(AC5, 'record'),
    'In the ruin of the web hangs one thread Ikeda never reached, still humming: the Hushpine novices’ roll, who swept which yard, every year for a thousand years. Near the end, in a boy’s voice, it hums: “Ikeda Shun. The fifth yard.”', 'samurai.record_found',
    'A single silver thread in the root-caves, quiet now.', 'The fifth yard. Kenta’s yard. The man cutting every record in Concordia swept the same stones, once, and the web kept it, the way a teacher keeps the name of a boy who was not listening.'),

  // ======================= ACT II, C-6 Kanemori’s Word: a strip on the Blade arch
  {
    id: 'dialogue:obj-samurai-reply-strip', name: 'C-6 a strip for home on the Blade arch', scope: 'party',
    entries: [{ when: stage(AC6, 'reply'), node: 'strip' }, { node: 'plain' }],
    nodes: {
      strip: { speaker: 'narrator', text: 'On the Blade arch hangs the old Hushpine prayer-strip, thirty years faded, so pale you can see the stone through it. Hisako has given you a new one, and a brush.', next: 'write' },
      write: {
        speaker: 'narrator', text: 'Kanemori counts his words. You may spend yours. What goes on the strip?',
        choices: [
          { text: '(Leave it blank, the pilgrims’ way.)', to: 'blank', effects: [{ setFlag: 'samurai.reply', value: 'blank' }] },
          { text: '“Protecting.”', to: 'tied', effects: [{ setFlag: 'samurai.reply', value: 'protecting' }] },
          { text: '“Protecting him.”', to: 'him', when: { flag: 'samurai.kanemori_letter', value: 'two' }, effects: [{ setFlag: 'samurai.reply', value: 'him' }] },
        ],
      },
      blank: { speaker: 'narrator', text: 'You tie it blank beside the old one. A pilgrim coming through will know exactly what it means: somebody from home was here, and waited, and went on.', next: null },
      tied: { speaker: 'narrator', text: 'One word, in your best brush-hand, which is not very good. You tie it beside the old strip. The wind through the arch turns it round, once, towards Steelvale.', next: null },
      him: { speaker: 'narrator', mood: 'sad', text: 'Two words, nearly the same two he sent you. You tie the strip beside the old one, and the wind through the arch turns it round, once, towards a mountain you cannot see.', next: null },
      plain: { speaker: 'narrator', text: 'Two Hushpine prayer-strips on the Blade arch, one faded, one new.', next: null },
    },
  },

  // ======================= ACT III, Say It for Me: the word won’t come
  {
    id: 'dialogue:obj-samurai-voice-step', name: 'Say It for Me: the foot of the Stairs', scope: 'party',
    entries: [{ when: stage(SAY, 'voice'), node: 'try' }, { node: 'plain' }],
    nodes: {
      try: {
        speaker: 'narrator', text: 'At the foot of the Twelve Stairs you try the word, quietly, to see if it will come. Nothing. A year of silence on the Temple Road has worn a groove in you, and the name will not climb out of it.',
        choices: [
          { text: '(Try again.)', to: 'again' },
          { text: '(Turn to Hettie, who has followed you from the camp without being asked.)', to: 'hettie' },
        ],
      },
      again: { speaker: 'narrator', text: 'A breath. The shape of it in your mouth. No sound. Kanemori kept this word for thirty years. You are starting to understand how.', next: 'hettie' },
      hettie: { speaker: 'npc:hettie-natter-concordia', mood: 'happy', text: 'Is it stuck? Mine used to stick, on the road! I did nothing but nod for a month. What you want is somebody to talk at you until it falls out. I can do that! I can do that all day!', next: 'talk' },
      talk: { speaker: 'narrator', mood: 'happy', text: 'She does: the road, the frogs, the loudness of Concordia, a cart-horse she met. Somewhere in the middle of the cart-horse you laugh out loud, the first time you have laughed in a year. After that, the word is only a word.', effects: [{ setFlag: 'samurai.voice_found', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The foot of the Twelve Stairs.', next: null },
    },
  },

  // ======================= ACT III, The Masterless: nobody guarding the cages
  {
    id: 'dialogue:obj-samurai-legion-cages', name: 'The Masterless: the cages', scope: 'party',
    entries: [{ when: stage(MASTERLESS, 'cages'), node: 'cages' }, { node: 'plain' }],
    nodes: {
      cages: { speaker: 'narrator', text: 'Along the edge of the Legion camp stand the cages the Legion kept its hollowed in, doors broken open now. The people inside are too tired to walk out: old soldiers, a miller, a girl in a Concord tabard, blinking at the light.', next: 'stand' },
      stand: {
        speaker: 'narrator', text: 'Nobody is watching over them. Nobody has thought to.',
        choices: [
          { text: '(Stand in front of the cages for a moment, facing out.)', to: 'right' },
          { text: '(Kneel and give the girl your water.)', to: 'water' },
        ],
      },
      right: { speaker: 'narrator', text: 'It feels right, the way a sword feels right going back into its sheath. You know what to show the ronin now.', effects: [{ setFlag: 'samurai.cages_seen', value: true }], next: null },
      water: { speaker: 'narrator', text: 'She drinks it all and gives the flask back very politely. Behind you, across the camp, one of the ronin’s blades has drifted round to point this way. You know what to show them now.', effects: [{ setFlag: 'samurai.cages_seen', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The open cages at the edge of the Legion camp.', next: null },
    },
  },

  // ======================= ACT III, Kenta’s Letter: sweeping the practice ground
  clue('samurai-heart-sweep', 'Kenta’s Letter: sweeping the practice ground', stage(KENTA, 'sweep'),
    'You borrow a broom from the cook-tent and sweep the black grit from round the hitching post, the way a novice sweeps the yard before a lesson. Out, and back. Out, and back. The bearers watch as if you had gone mad.', 'samurai.kenta_swept',
    'A swept patch of ground round the hitching post at the Heart camp.', 'Halfway through you notice that you have not thought about breathing once. The broom goes out, and the breath goes with it, all on its own. That is Kenta’s answer. Now you only have to show it to a post.'),
];

export default dialogues;
