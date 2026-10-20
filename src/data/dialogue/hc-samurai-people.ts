/**
 * Hollow Crown, SAMURAI: Hushpine people (general talk), the eight side quests, the mentor thread and the bounties,
 * plus the Act II class-thread and featured-bearer scenes. On the Temple Road “(Say nothing.)” is usually the best
 * answer, and Hushpine folk trust it more than words. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition, NarrativeEffect } from '@/core';

type Q = `quest:${string}`;
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const offer = (q: Q, text: string, to: string, extra?: NarrativeCondition): DialogueChoice =>
  ({ text, to, quest: true, when: extra ? { all: [fresh(q), extra] } : fresh(q), effects: [{ startQuest: q }] });
const bye: DialogueChoice = { text: '(Bow, and go.)', to: null, tag: 'leave' };
const NIGHT: NarrativeCondition = { hour: [21, 4] };
const HK = 'npc:haru-kanemori' as const, IS = 'npc:ikeda-shun' as const, HN = 'npc:hettie-natter-concordia' as const;
const WORD: NarrativeEffect = { addFlag: 'samurai.kanemori_words', amount: 1 };

/** one object scene per numbered set piece: the quest-stage text, then a plain line afterwards */
const objs = (slug: string, q: Q, st: string, texts: string[], after: string): DialogueDef[] =>
  texts.map((text, i) => ({
    id: `dialogue:obj-${slug}-${i + 1}` as const, name: `${slug} ${i + 1}`,
    entries: [{ when: stage(q, st), node: 'now' }, { node: 'after' }],
    nodes: { now: { speaker: 'narrator', text, next: null }, after: { speaker: 'narrator', text: after, next: null } },
  }));

const dialogues: DialogueDef[] = [
  // ---------- Kanemori (general + mentor thread)
  {
    id: 'dialogue:samurai-kanemori', name: 'Kanemori (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'narrator', text: 'Sensei Kanemori looks up from his tea, and waits.',
        choices: [
          offer('quest:samurai-the-eleven-words', 'What were your eleven words this year, Sensei?', 'eleven', { trust: HK, value: 'friendly' }),
          offer('quest:samurai-the-word-he-saved', '(Look at the High Terrace, then at him.)', 'saved', { all: [{ trust: HK, value: 'trusted' }, { questCompleted: 'quest:samurai-the-high-terrace' }] }),
          { text: '(Sit with him. Say nothing.)', to: 'sit', trust: 1, trustNpc: HK },
          { text: '(Ask him, with a look, whether he was always this quiet.)', to: 'loud', when: { trust: HK, value: 'trusted' } },
          bye,
        ],
      },
      loud: { speaker: 'narrator', text: 'Kanemori considers the question for a long time. Then he puts down his tea, cups his hands round his mouth, throws back his head and mimes, in perfect silence, the biggest shout you have ever not heard.', next: 'loud2' },
      loud2: {
        speaker: 'narrator', text: 'He points at himself. He holds his hand at the height of a small boy. He mimes a broom, and a very cross old woman with a whetstone chasing the small boy round a yard with it. His shoulders are shaking.',
        choices: [
          { text: '(Laugh. Silently.)', to: 'laugh' },
          { text: '(Point down the mountain, towards Old Tomoe’s stall, and raise your eyebrows.)', to: 'tomoe' },
        ],
      },
      laugh: { speaker: 'narrator', text: 'You laugh without a sound, and so does he, until you both have to put your cups down. It is the loudest conversation you have ever had in Hushpine.', next: null },
      tomoe: { speaker: 'narrator', text: 'He nods, and touches his ear, which is very slightly notched, as if somebody once caught it with the flat of a blade for shouting at a whetstone. Then he pours you more tea, still smiling.', next: null },
      eleven: { speaker: 'narrator', text: 'He looks faintly amused. Then he points, one after another, to the five dojo yards on the Terraces below, and lifts his hands, palms up: ask them.', next: null },
      saved: { speaker: 'narrator', text: 'He goes very still. Then, slowly, he nods, and points up at the High Terrace, at the bell that hangs there above the clouds, and then at the eastern sky, where the dawn comes from.', next: null },
      sit: { speaker: 'narrator', text: 'You sit. He pours you tea. The pines breathe. After a long time a bird lands on the step between you and looks at you both, and leaves, satisfied.', next: null },
    },
  },
  ...objs('word-slip', 'quest:samurai-the-eleven-words', 'slips', [
    'Three slips pinned to the wall of the first dojo yard, each in a different novice’s hand, each with one word and a date: “The.” “Sheath.” “Not.” Three words, spoken on three different days.',
    'Four slips under a stone on the tea-terrace, carefully weighted against the wind: “The.” “Edge.” “Is.” “What.”',
    'Two slips folded into the crack of a practice post: “A.” “Sword.” On the back of one, in tiny writing, a novice has added: “He looked straight at me. I nearly died.”',
  ], 'An empty pin on a dojo wall.'),
  {
    id: 'dialogue:samurai-kanemori-eleven', name: 'Mentor: the Eleven Words', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'You lay the slips out in front of Kanemori in the order of their dates, one by one, eleven words. He watches the sentence grow across the floor of his cell.', next: 'read' },
      read: {
        speaker: 'narrator', text: '“The sheath, not the edge, is what a sword is for.” A year of his words, spent one at a time on eleven novices, to say one thing.',
        choices: [
          { text: 'The sheath is what the sword is for.', to: 'yes', insight: 'samurai_sheath', trust: 1, trustNpc: HK },
          { text: '(Say nothing. Bow to the sentence.)', to: 'yes', insight: 'samurai_sheath' },
        ],
      },
      yes: { speaker: HK, mood: 'happy', text: 'Yes.', effects: [WORD], next: 'end' },
      end: { speaker: 'narrator', text: 'He gathers up the slips and puts them, very carefully, in his sleeve.', next: null },
    },
  },
  {
    id: 'dialogue:obj-high-terrace-bell', name: 'The High Terrace bell',
    entries: [
      { when: { all: [stage('quest:samurai-the-word-he-saved', 'bell'), NIGHT] }, node: 'night' },
      { when: stage('quest:samurai-the-word-he-saved', 'bell'), node: 'day' },
      { node: 'bell' },
    ],
    nodes: {
      bell: { speaker: 'narrator', text: 'The High Terrace bell, bronze, green with age, hanging over the cloud. It has not been rung in thirty years.', next: null },
      day: { speaker: 'narrator', text: 'Kanemori stands by the bell in the daylight and shakes his head. Not now. He looks east. Come back at night, and wait for dawn.', next: null },
      night: { speaker: 'narrator', text: 'You sit with him beside the bell through the whole of the night, in the cold above the clouds. Neither of you sleeps. When the first grey light comes up the sky, he stands, and lays one hand on the bell, and says a word he has kept for thirty years.', next: 'word' },
      word: { speaker: HK, mood: 'sad', text: 'Shun.', effects: [WORD, { setFlag: 'samurai.word_spoken', value: true }], next: 'after' },
      after: { speaker: 'narrator', text: 'His student’s name. It rings out across the cloud, and somewhere far down the mountain, very faintly, a bell answers it, though nobody is there to ring it.', next: null },
    },
  },
  {
    id: 'dialogue:samurai-kanemori-saved', name: 'Mentor: the Word He Saved', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'narrator', text: 'Back at his cell, Kanemori sits down, takes off his sandals, and looks at his feet for a long time, the way a man does after a very long walk.',
        choices: [{ text: '(Pour him tea.)', to: 'tea' }, { text: '(Sit with him.)', to: 'tea' }],
      },
      tea: { speaker: 'narrator', text: 'He takes the cup in both hands. Then he bows to you, from where he sits, lower than you have ever seen him bow to anyone.', effects: [{ trust: HK, delta: 1 }], next: null },
    },
  },
  // ---------- Ikeda and the elders (general)
  {
    id: 'dialogue:samurai-ikeda', name: 'Ikeda (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ikeda-shun', mood: 'happy', text: 'Novice! Drink? It’s good. I stole it from a lord.',
        choices: [
          { text: 'Did you know Kanemori, before?', to: 'before' },
          { text: '(Say nothing.)', to: 'quiet' },
          bye,
        ],
      },
      before: { speaker: 'npc:ikeda-shun', text: 'Everybody on this mountain knows Kanemori. He has a way of being known without saying anything. It’s very irritating.', next: null },
      quiet: { speaker: 'npc:ikeda-shun', text: '(He laughs.) You sound like him when you do that. Go on, then. Go and sit on a step.', next: null },
    },
  },
  {
    id: 'dialogue:samurai-fumiko', name: 'Elder Fumiko Sora (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:fumiko-sora', text: '(Elder Sora looks at you, and then at the road, and then at you again. She says nothing.)',
        choices: [{ text: '(Say nothing back.)', to: 'nod', trust: 1 }, bye],
      },
      nod: { speaker: 'npc:fumiko-sora', text: '(She nods, approvingly, and returns to her raking.)', next: null },
    },
  },
  // ---------- the Temple Road: the Loudest Pilgrim, the Pine That Fell, bounties
  {
    id: 'dialogue:samurai-hettie', name: 'Goodwife Hettie Natter (the Loudest Pilgrim)',
    entries: [{ when: stage('quest:samurai-the-loudest-pilgrim', 'hettie'), node: 'burst' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:hettie-natter', text: 'Oh, I’m so sorry, I know, I KNOW, it’s a silent road, I’ve been told, a monk looked at me, I can’t help it, it just comes out, it’s been coming out since I was born, my mother said I talked before I cried. Help me?',
        choices: [offer('quest:samurai-the-loudest-pilgrim', '(Nod, and hold up one finger to your lips.)', 'nod'), bye],
      },
      nod: { speaker: 'npc:hettie-natter', text: 'Yes. Yes! Quiet. Quiet. I can do quiet. (She cannot.) There are signs, aren’t there, on the milestones, hand-signs, for “water” and “thank you” and “I need to sit down”. Teach me those and I’ll be quiet as a mouse. A quiet mouse.', next: null },
      burst: {
        speaker: 'npc:hettie-natter', mood: 'happy', text: '(She has held it in all the way to the shrine. She lets it out in one breath.) I DID IT! The whole way! Not a word! I signed “thank you” to a monk and he signed it BACK! I’ve never been so happy in my life and I can’t tell anybody, which is the worst part!',
        choices: [{ text: '(Sign “thank you”.)', to: 'sign', trust: 1 }, { text: 'You did very well.', to: 'well' }],
      },
      sign: { speaker: 'npc:hettie-natter', mood: 'happy', text: '(She signs it back, fiercely, with tears in her eyes, and then hugs you, in perfect silence, for a very long time.)', next: 'echo' },
      well: { speaker: 'npc:hettie-natter', text: 'I did, didn’t I? I did. Here, have a cake. I brought nine. For the journey. I’ve eaten six.', next: 'echo' },
      echo: { speaker: 'npc:hettie-natter', mood: 'sad', text: 'Only I didn’t come all this way to be quiet. (She twists her shawl.) There’s an Echo Stone up past the shrine, isn’t there, where you can say one thing out loud and the person you lost hears it. I’ve one thing to say to my Bertram. Will you walk me?', next: null },
    },
  },
  ...objs('pilgrim-sign-stone', 'quest:samurai-the-loudest-pilgrim', 'signs', [
    'A milestone on the Temple Road with a hand carved on it: two fingers to the lips, then out. “Thank you.” Hettie copies it. Then she says “thank you” out loud as well, and claps a hand over her mouth.',
    'A second milestone: a cupped hand, tipped. “Water.” Hettie practises it six times, and gets it right the seventh, and is so pleased she nearly says so.',
    'A third, worn almost smooth: an open palm pressed flat to the chest. “I am here.” Hettie looks at it a long time, and does it, and for a moment she is completely quiet.',
  ], 'A carved milestone on the Temple Road.'),
  {
    id: 'dialogue:obj-temple-road-shrine', name: 'The road shrine', scope: 'party',
    entries: [{ when: stage('quest:samurai-the-loudest-pilgrim', 'shrine'), node: 'walk' }, { node: 'after' }],
    nodes: {
      walk: { speaker: 'narrator', text: 'You walk the Temple Road with Hettie, step by step, a mile in silence. Twice she opens her mouth. Twice you raise a finger. Once, a monk passes the other way, and she signs “I am here” at him, and he stops, and signs it back.', next: 'shrine' },
      shrine: { speaker: 'narrator', text: 'At the road shrine she lights her incense, bows, and stands there, red in the face, holding it all in, absolutely bursting with triumph.', next: null },
      after: { speaker: 'narrator', text: 'The road shrine on the Temple Road. Somebody has left nine small cakes here. Well, three.', next: null },
    },
  },
  {
    id: 'dialogue:samurai-tsuge', name: 'Master Ren Tsuge (the Pine That Fell)',
    entries: [{ when: stage('quest:samurai-the-pine-that-fell', 'tsuge'), node: 'count' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:ren-tsuge', text: '(The Order’s carpenter, sawdust to the eyebrows, sits by the fallen pine with his saw across his knees. He taps the stump, then holds up his hands, opening and closing them: count.)',
        choices: [offer('quest:samurai-the-pine-that-fell', '(Nod.)', 'nod'), bye],
      },
      nod: { speaker: 'npc:ren-tsuge', text: '(He mimes a finger, travelling slowly from the heart of the stump to the bark. Then he lies down in the needles to wait, because he knows how long it takes.)', next: null },
      count: {
        speaker: 'npc:ren-tsuge', text: '(He sits up, and raises his eyebrows: well?)',
        choices: [
          { text: '(Hold up ten fingers, a hundred times. Then three fingers, ten times, and point at something black.)', to: 'black', trust: 1 },
          { text: 'A thousand rings. The last thirty are black.', to: 'black' },
        ],
      },
      black: { speaker: 'npc:ren-tsuge', mood: 'sad', text: '(He lays a hand on the black rings, one for every year since the crown broke. Then, very quietly, because some things must be said aloud:) A thousand years it stood. Thirty years it grieved. Then it lay down. I will make a bench of it, for the road.', next: null },
    },
  },
  {
    id: 'dialogue:obj-fallen-pine-rings', name: 'The fallen pine’s rings', scope: 'party',
    entries: [{ when: stage('quest:samurai-the-pine-that-fell', 'rings'), node: 'count' }, { node: 'after' }],
    nodes: {
      count: { speaker: 'narrator', text: 'You lay your finger on the heart of the stump and count outwards, ring by ring, year by year. Wide rings for wet summers, thin ones for hard winters. It takes the whole of an afternoon. Nine hundred and seventy rings are the colour of honey.', next: 'black' },
      black: { speaker: 'narrator', text: 'The last thirty are black. Not burnt: black all the way through, like ink soaked into paper, each one a little darker than the last. The outermost ring is so dark it looks wet.', next: null },
      after: { speaker: 'narrator', text: 'The fallen pine, its rings counted, black at the edge.', next: null },
    },
  },
  {
    id: 'dialogue:samurai-tetsuo', name: 'Road-Warden Tetsuo Ban (bounties)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:tetsuo-ban', text: '(The Road-Warden points at the notice-post, on which two bounties have been written very small, so as not to be loud.)',
        choices: [
          offer('quest:samurai-bounty-mist-dancers', '(Point at the first.)', 'dancers'),
          offer('quest:samurai-bounty-pilgrim-revenant', '(Point at the second.)', 'revenant'),
          bye,
        ],
      },
      dancers: { speaker: 'npc:tetsuo-ban', text: '(He mimes a punt-rope being cut, then six swords spinning. Then he rubs his fingers together: silver.)', next: null },
      revenant: { speaker: 'npc:tetsuo-ban', mood: 'angry', text: '(He puts his hands to his mouth and mimes, silently, a man bellowing “EN GARDE” at a passing pilgrim. Then he covers his ears, and looks at you very meaningfully.)', next: null },
    },
  },
  // ---------- the Terraces: Tea Without Water, the Novice Who Stayed, the Eleven Words
  {
    id: 'dialogue:samurai-chiyo', name: 'Tea-Mistress Chiyo Ashina (Tea Without Water)',
    entries: [{ when: stage('quest:samurai-tea-without-water', 'chiyo'), node: 'clear' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:chiyo-ashina', text: '(The Tea-Mistress holds out a cup of tea. It is black. She tips it, slowly, onto the gravel, and looks up the terrace towards her spring.)',
        choices: [offer('quest:samurai-tea-without-water', '(Bow, and go up to the spring.)', 'go'), bye],
      },
      go: { speaker: 'npc:chiyo-ashina', text: '(She bows back, and begins, very calmly, to rake the gravel over the black stain.)', next: null },
      clear: {
        speaker: 'npc:chiyo-ashina', mood: 'happy', text: '(She pours a cup from the channel. It is green and clear. She drinks, closes her eyes, and pours you one.)',
        choices: [{ text: '(Drink it in silence.)', to: 'drink', trust: 1 }, { text: 'It’s good.', to: 'good' }],
      },
      drink: { speaker: 'narrator', text: 'It is the best tea you have ever tasted. You both know it. Neither of you says so. She gives you a little packet of leaves from the top terrace to take on the road.', next: 'above' },
      good: { speaker: 'npc:chiyo-ashina', text: '(She smiles at your manners, which are terrible, and gives you a packet of leaves anyway.)', next: 'above' },
      above: { speaker: 'npc:chiyo-ashina', mood: 'afraid', text: '(Then she sets her cup down and points, past the spring, up the bare rock to where the water first comes out of the mountain. She touches the black stain on the gravel, and points up again. It is still coming from somewhere.)', next: null },
    },
  },
  {
    id: 'dialogue:obj-ashina-spring-source', name: 'The Ashina spring', scope: 'party',
    entries: [{ when: stage('quest:samurai-tea-without-water', 'source'), node: 'source' }, { node: 'after' }],
    nodes: {
      source: {
        speaker: 'narrator', text: 'The spring rises in a rock basin, cold and deep. Black tears have pooled in it, thick as oil, floating on the clear water, spreading down into the channels.',
        choices: [
          { text: '(Skim the black off with your bare hands.)', to: 'hands' },
          { text: '(Kneel, and wait for the water to settle, and lift the black off in one clean sweep of your sheathed sword.)', to: 'sheath' },
        ],
      },
      hands: { speaker: 'narrator', text: 'It is cold, and it clings, and it leaves your hands grey to the wrist for a day. But you skim it off, handful by handful, until the spring runs clear.', next: null },
      sheath: { speaker: 'narrator', text: 'You wait until the water is perfectly still. Then one slow stroke of the sheathed blade across the surface lifts the black away in a single sheet, and the spring runs clear behind it, as if it had been waiting for someone to be patient.', next: null },
      after: { speaker: 'narrator', text: 'The Ashina spring, cold and clear.', next: null },
    },
  },
  {
    id: 'dialogue:samurai-kenta', name: 'Kenta',
    entries: [
      { when: stage('quest:samurai-the-eleven-words', 'kenta'), node: 'words' },
      { when: stage('quest:samurai-the-novice-who-stayed', 'kenta'), node: 'sit' },
      { node: 'start' },
    ],
    nodes: {
      start: {
        speaker: 'npc:kenta', text: '(A ten-year-old novice with a practice sword nearly as tall as he is. He bows. Then he points at you, and at his practice post, and raises his eyebrows so high they nearly leave his face.)',
        choices: [offer('quest:samurai-the-novice-who-stayed', '(Nod.)', 'nod'), bye],
      },
      nod: { speaker: 'npc:kenta', mood: 'happy', text: '(He runs to his post so fast he forgets to bow, and then runs back, and bows, and runs again.)', next: null },
      sit: {
        speaker: 'npc:kenta', text: '(He is on the yard step with a bruise on his arm and the biggest smile on the Terraces. He whispers, because there is nobody else about:) Everyone else went down to the Camps. Sensei didn’t say I had to stay. I just did. Was that right?',
        choices: [
          { text: '(Say nothing. Put your hand on his head.)', to: 'hand', trust: 1 },
          { text: 'Somebody has to keep the yard swept.', to: 'swept' },
        ],
      },
      hand: { speaker: 'npc:kenta', mood: 'happy', text: '(He goes very pink, and very still, and then he gets up and goes back to his post, and his cuts are better.)', next: 'ryo' },
      swept: { speaker: 'npc:kenta', text: 'I sweep it every morning. Twice. Once for me and once for the others. (He thinks.) I’m going to be a sensei, and I’m going to talk to everybody, all the time.', next: 'ryo' },
      ryo: { speaker: 'npc:kenta', text: '(He comes back with something wrapped in a leaf, and holds it out, and does not look at you.) For Ryo. My brother. He went down to the Camps with the others. He always forgets to eat. Don’t say it was from me. He’ll know anyway. He knows how I fold.', next: null },
      words: {
        speaker: 'npc:kenta', text: '(Kenta goes very serious, rolls up his sleeve, and shows you two words written in ink on his forearm, which he has been very careful not to wash.) “Is.” “For.” He said them to me. Me. On two different days.',
        choices: [{ text: '(Bow to him.)', to: 'bow' }],
      },
      bow: { speaker: 'npc:kenta', mood: 'happy', text: '(He bows back, so low he nearly falls over.)', next: null },
    },
  },
  {
    id: 'dialogue:obj-kenta-practice-post', name: 'Sparring with Kenta', scope: 'party',
    entries: [{ when: stage('quest:samurai-the-novice-who-stayed', 'spar'), node: 'spar' }, { node: 'after' }],
    nodes: {
      spar: {
        speaker: 'narrator', text: 'Kenta stands at his post with his practice sword up and his chin set. He is ten. He is completely certain he can beat you.',
        choices: [
          { text: '(Spar properly. Don’t let him win.)', to: 'proper' },
          { text: '(Let him take one touch, and make him earn it.)', to: 'earn' },
          { text: '(Show him the draw: sheathe, wait, then cut.)', to: 'draw', effects: [{ setFlag: 'samurai.kenta_draw', value: true }] },
        ],
      },
      proper: { speaker: 'narrator', text: 'You knock his sword out of his hands eleven times. He picks it up eleven times. On the twelfth he very nearly touches your sleeve, and you both know it, and he is so happy he has to sit down.', next: null },
      earn: { speaker: 'narrator', text: 'It takes him an hour. When he finally gets the touch, he stares at his own sword in wonder. Then he looks at you, suspicious, and you keep your face perfectly straight.', next: null },
      draw: { speaker: 'narrator', text: 'You sheathe, and wait, and wait, and when he comes, you draw. He sits down hard in the gravel. Then he sheathes his own practice sword, and waits, and tries it, and it is terrible, and he does it again, and again.', next: null },
      after: { speaker: 'narrator', text: 'Kenta’s practice post, worn smooth.', next: null },
    },
  },
  // ---------- the Ronin Camps: Nine Coins, the Whetstone Stall
  {
    id: 'dialogue:samurai-daisuke', name: 'Daisuke Nine-Coins (Nine Coins)',
    entries: [{ when: stage('quest:samurai-nine-coins', 'daisuke'), node: 'paid' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:daisuke-nine-coins', text: 'Daisuke Nine-Coins. Nine, because I once killed a man for nine coins and I’ve never been sure it was enough. My company’s been cheated. Ozu the paymaster says the purse was light. The purse is never light. Ozu is heavy.',
        choices: [offer('quest:samurai-nine-coins', 'I’ll talk to Ozu.', 'talk'), bye],
      },
      talk: { speaker: 'npc:daisuke-nine-coins', text: 'Talk? You’re Hushpine. You don’t talk. That’s why I’m asking you. Ozu can’t bear silence. Nobody in the Camps can.', next: null },
      paid: {
        speaker: 'npc:daisuke-nine-coins', mood: 'happy', text: '(He weighs the purse in his hand, and counts it, twice.) To the coin. A sword that serves a purse, and the purse paid it. That’s an honest day. Here. Your share. Don’t argue, it’s rude.',
        choices: [{ text: 'A sword that serves a purse.', to: 'purse' }, { text: '(Take it, and bow.)', to: 'where' }],
      },
      purse: { speaker: 'npc:daisuke-nine-coins', text: 'I know what I am. I know who pays me. Can your lot say the same about whoever you serve? (He grins.) Think about it on your nice quiet road.', next: 'where' },
      where: { speaker: 'npc:daisuke-nine-coins', text: 'Only, here’s a thing. Ozu’s a thief, but he’s a frightened thief, and frightened thieves don’t keep what they steal. Somebody made him take it. His strongbox has a false bottom. Everybody’s does. Have a look, quiet one.', next: null },
    },
  },
  {
    id: 'dialogue:samurai-ozu', name: 'Paymaster Ozu',
    entries: [{ when: stage('quest:samurai-nine-coins', 'ozu'), node: 'start' }, { node: 'later' }],
    nodes: {
      start: {
        speaker: 'npc:paymaster-ozu', text: 'Daisuke’s company? Light? Never! It was a full purse. A full purse, minus expenses. Minus handling. Minus… other expenses. What do you want?',
        choices: [
          { text: '(Say nothing. Stand there.)', to: 'silence' },
          { text: 'The full purse. Now.', to: 'demand' },
        ],
      },
      silence: { speaker: 'npc:paymaster-ozu', mood: 'afraid', text: '(You stand there. You keep standing there. After a while he starts sweating. After a longer while he opens the strongbox, very fast, and counts out coins, very fast, and pushes them at you.) Take it. Take it! Just stop LOOKING at me.', next: null },
      demand: { speaker: 'npc:paymaster-ozu', text: 'Now? Fine. Fine! Here. Every coin. Tell Daisuke… tell Daisuke nothing. Nobody needs to tell anybody anything.', next: null },
      later: { speaker: 'npc:paymaster-ozu', mood: 'afraid', text: 'Oh. It’s you. I’m not doing anything. I’m counting. Honestly.', next: null },
    },
  },
  {
    id: 'dialogue:samurai-tomoe', name: 'Old Tomoe (the Whetstone Stall)',
    entries: [{ when: stage('quest:samurai-the-whetstone-stall', 'tomoe'), node: 'talk' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:old-tomoe', text: 'Anyone’s sword. No questions. Lords, ronin, novices, cooks. Sit down. Turn the wheel.',
        choices: [offer('quest:samurai-the-whetstone-stall', '(Sit, and turn the wheel.)', 'sit'), bye],
      },
      sit: { speaker: 'npc:old-tomoe', text: 'Steady. Steady. Not too fast. A sword sharpened in a hurry cuts in a hurry.', next: null },
      talk: {
        speaker: 'npc:old-tomoe', text: '(She wipes your blade down, and for once she talks.) I had a boy once, at this wheel. Sharpened his first sword for him. He wanted everyone to be safe. Everyone. All the time. That’s how it starts. Now he calls himself a General and he’s turned a thousand swords outward.',
        choices: [
          { text: 'You taught the Thousand-Edge General?', to: 'general' },
          { text: 'Do you sharpen Ikeda’s sword?', to: 'ikeda' },
        ],
      },
      general: { speaker: 'npc:old-tomoe', mood: 'sad', text: 'I taught him the edge. I forgot to teach him the rest. That’s why I give everyone a sheath now, with the sharpening. Free. Most of them throw it away.', next: 'sheath' },
      ikeda: { speaker: 'npc:old-tomoe', text: 'Every month. He never brings a sheath. Never once. I offer him one every time. He laughs and says a sheath is a cage. Silly boy.', next: 'sheath' },
      sheath: {
        speaker: 'npc:old-tomoe', text: 'A sharp sword wants to be used. Only a sheath can teach it to wait. Remember that, quiet one.',
        choices: [
          { text: 'The sheath is what the sword is for.', to: 'end', insight: 'samurai_sheath', trust: 1 },
          { text: '(Say nothing. Bow.)', to: 'end' },
        ],
      },
      end: { speaker: 'npc:old-tomoe', text: 'There. Sharper than you deserve. Off you go.', next: 'gift' },
      gift: { speaker: 'npc:old-tomoe', text: 'And take this. (A plain wooden sheath, new.) Leave it on that silly boy’s cushion, in his pavilion. I send him one every month. He laughs and throws it away. I send him another. One of us will get tired first, and it won’t be me.', next: null },
    },
  },
  {
    id: 'dialogue:obj-tomoe-whetstone-wheel', name: 'Old Tomoe’s whetstone', scope: 'party',
    entries: [{ when: stage('quest:samurai-the-whetstone-stall', 'wheel'), node: 'wheel' }, { node: 'after' }],
    nodes: {
      wheel: { speaker: 'narrator', text: 'You turn the great wheel, steady, steady, while Old Tomoe lays your blade to the stone with hands that have done this sixty thousand times. The sound is the only steady thing in the Ronin Camps. Under the stall, in a basket, are a hundred plain wooden sheaths.', next: null },
      after: { speaker: 'narrator', text: 'Old Tomoe’s whetstone, and a basket of sheaths that nobody takes.', next: null },
    },
  },
  // ---------- the Bamboo Shallows: the Dancer's Partner, the Frog Choir
  {
    id: 'dialogue:samurai-natsu', name: 'Punt-woman Natsu',
    entries: [
      { when: stage('quest:samurai-the-dancers-partner', 'natsu'), node: 'dance' },
      { when: stage('quest:samurai-the-frog-choir', 'natsu'), node: 'frogs' },
      { node: 'start' },
    ],
    nodes: {
      start: {
        speaker: 'npc:natsu', text: 'Out here we’re allowed to talk, because nobody can hear you over the frogs. Usually. Something’s wrong in my Shallows. Two somethings.',
        choices: [
          offer('quest:samurai-the-frog-choir', 'Why are the frogs so quiet?', 'quiet'),
          offer('quest:samurai-the-dancers-partner', 'There’s a Blade Dancer that doesn’t attack.', 'dancer', { questCompleted: 'quest:samurai-the-call-to-muster' }),
          bye,
        ],
      },
      quiet: { speaker: 'npc:natsu', text: 'Their conductor’s gone missing. Old Gama. Biggest frog in Steelvale, bad-tempered, a genius. Without him they all sing in different keys and then give up in embarrassment. Find him. I can’t sleep without the racket.', next: null },
      dancer: { speaker: 'npc:natsu', mood: 'sad', text: 'Every morning, by the old channel, thirty years. It dances alone and always reaches for the same place in the water. The others cut my ropes. That one only waits.', next: null },
      dance: { speaker: 'npc:natsu', mood: 'happy', text: 'I saw them go. Two swords, turning together in the mist, all the way down the channel and out of sight. Thirty years it waited. I’m going to miss it. I’m glad. They were going towards the old dancers’ stone, at the end of the channel. Go and see, if you like. I can’t bear to.', next: null },
      frogs: { speaker: 'npc:natsu', mood: 'happy', text: 'Hear that? HEAR that? That’s the worst noise in Steelvale and I’ve never loved anything more. Have a fish. Have two. Have all the fish. And come to the Moon Pool tonight. First concert in a month. You won’t believe who comes.', next: null },
    },
  },
  {
    id: 'dialogue:obj-lonely-dancer', name: 'The lonely Dancer', scope: 'party',
    entries: [{ when: stage('quest:samurai-the-dancers-partner', 'watch'), node: 'watch' }, { node: 'after' }],
    nodes: {
      watch: { speaker: 'narrator', text: 'In the mist by the old channel, a single Blade Dancer turns: a sword with nobody holding it, moving through the steps of a partnered dance. It turns, and turns, and at the end of each turn it dips towards the same place in the water, and comes up with nothing.', next: null },
      after: { speaker: 'narrator', text: 'Mist on the old channel. Nothing dances there now.', next: null },
    },
  },
  {
    id: 'dialogue:obj-dancer-partner-sword', name: 'The partner’s sword', scope: 'party',
    entries: [{ when: stage('quest:samurai-the-dancers-partner', 'sword'), node: 'find' }, { node: 'after' }],
    nodes: {
      find: {
        speaker: 'narrator', text: 'Under the water, exactly where the Dancer reaches, a second sword lies in the silt, slim and old, the twin of the first. You lift it out, dripping. The lonely Dancer stops dead in the mist.',
        choices: [
          { text: '(Hold it out, hilt first.)', to: 'give' },
          { text: '(Lay it on the water and step back.)', to: 'lay' },
        ],
      },
      give: { speaker: 'narrator', text: 'The second sword lifts out of your hand by itself. The two blades meet, tip to tip, the way partners touch hands before a dance. Then they turn together into the mist, and down the channel, and are gone.', next: null },
      lay: { speaker: 'narrator', text: 'You lay it on the water. It does not sink. The lonely Dancer comes to it, slowly, and the two blades rise together, and bow to each other, and dance away down the channel into the mist.', next: null },
      after: { speaker: 'narrator', text: 'A dip in the silt where a sword lay for thirty years.', next: null },
    },
  },
  ...objs('frog-pond-reed', 'quest:samurai-the-frog-choir', 'reeds', [
    'Frogs in the reeds, singing in eleven different keys at once, then stopping and looking at each other in shame. No Gama.',
    'A tiny frog sitting on a lily pad holding up a very small reed, like a baton, hopefully. It is not Gama. It is doing its best.',
    'A trail of large, cross, wet footprints going out across the lily pads to a stone in the very middle of the pond.',
  ], 'Reeds round the frog pond. Loud again.'),
  {
    id: 'dialogue:samurai-gama', name: 'Old Gama, conductor of the frog choir',
    entries: [{ when: stage('quest:samurai-the-frog-choir', 'gama'), node: 'sulk' }, { node: 'conduct' }],
    nodes: {
      sulk: {
        speaker: 'npc:old-gama', text: '(The largest frog you have ever seen sits on a stone in the middle of the pond with its back to the choir. It is the size of a cat. It is the shape of a grudge. It says, in a voice like a cellar door:) Brrrp.',
        choices: [
          { text: '(Say nothing. Sit on the bank and listen to the choir with a pained face.)', to: 'pained' },
          { text: 'They’re lost without you.', to: 'lost' },
          { text: '(Pick up a reed and conduct, very badly.)', to: 'badly' },
        ],
      },
      pained: { speaker: 'narrator', text: 'You listen to the choir with the face of someone in great suffering. Gama watches you. He sees that you understand. He sighs, a huge wet sigh, and hops back to his stone at the front.', next: 'back' },
      lost: { speaker: 'npc:old-gama', mood: 'angry', text: 'Brrrrp. (Clearly: they should have thought of that before they sang the third verse flat.) (But he looks at the choir, and the tiny frog with the reed, and his throat swells with something like pride.)', next: 'back' },
      badly: { speaker: 'narrator', text: 'You wave the reed. The choir tries to follow you. It is a catastrophe. Gama cannot bear it. With a roar of fury he leaps the whole pond, snatches the reed in his mouth, and takes over.', next: 'back' },
      back: { speaker: 'narrator', text: 'Old Gama takes his place at the front, swells his throat to twice its size, and the whole Bamboo Shallows bursts into song: the loudest, worst, most glorious noise on the silent frontier.', next: null },
      conduct: { speaker: 'npc:old-gama', text: '(He is conducting. Do not interrupt him.)', next: null },
    },
  },

  // ======================= ACT II
  {
    id: 'dialogue:samurai-hisako', name: 'C-1 the Quiet Pew: Pilgrim-Mother Hisako', scope: 'party',
    entries: [{ when: stage('quest:samurai-the-quiet-pew', 'pew'), node: 'start' }, { node: 'later' }],
    nodes: {
      start: {
        speaker: 'narrator', text: 'In the back pew of the Chapel of the Drowned Bell sit five pilgrims in faded Hushpine grey, hands folded, perfectly still. The eldest, a woman with a face like a walnut, looks up at your straw-coloured travelling clothes, and her eyes fill.',
        choices: [
          { text: '(Say nothing. Sit down beside them.)', to: 'sit', trust: 1, trustNpc: 'npc:hisako' },
          { text: 'I came from Hushpine. Through the gate.', to: 'speak' },
        ],
      },
      speak: { speaker: 'npc:hisako', text: '(She puts a finger to her lips, gently, and pats the pew beside her.)', next: 'sit' },
      sit: { speaker: 'narrator', text: 'You sit. For a long time nobody moves. Brother Aldous comes past with a candle, sees you, smiles, and leaves you be. At last Pilgrim-Mother Hisako leans over, and very slowly points down: at the floor under the pew.', next: 'why' },
      why: { speaker: 'npc:hisako', text: '(In a whisper, the first word she has said in a year.) Listen.', next: null },
      later: { speaker: 'npc:hisako', text: '(She nods to you, and goes back to her silence.)', next: null },
    },
  },
  {
    id: 'dialogue:obj-samurai-quiet-pew', name: 'C-1 under the quiet pew', scope: 'party',
    entries: [{ when: stage('quest:samurai-the-quiet-pew', 'floor'), node: 'listen' }, { node: 'after' }],
    nodes: {
      listen: { speaker: 'narrator', text: 'You kneel and put your ear to the cold flagstones. Far below, through stone and earth and bone, you hear it: feet, marching. Hundreds of them, in perfect step. No voices. A muster, drilling in silence, as it has every night for thirty years.', next: 'knew' },
      knew: { speaker: 'narrator', text: 'The pilgrims did not know what they were listening to. They only knew it was something keeping a silence like their own, and that it should not be left alone with it.', next: null },
      after: { speaker: 'narrator', text: 'The quiet pew. Somebody always seems to be sitting in it.', next: null },
    },
  },
  {
    id: 'dialogue:samurai-silent-muster', name: 'C-2 the silent muster', scope: 'party',
    entries: [{ when: { flag: 'samurai.oath', value: 'cut' }, node: 'ronin' }, { node: 'muster' }],
    nodes: {
      ronin: { speaker: 'narrator', text: 'At the barrow-mouth, a dozen figures with cut topknots are waiting: Ronin deserters, out of Steelvale, who heard that a Hushpine novice who cut the oath had come to Concordia. They do not speak. They fall in behind you.', next: 'muster' },
      muster: { speaker: 'narrator', text: 'In the dark of the Barrowdowns, rank on rank of the dead stand at drill: Varric’s muster, in armour a thousand years old, moving in perfect silence. They notice you. They do not attack. They wait to see if you will make a sound.', next: null },
    },
  },
  {
    id: 'dialogue:obj-samurai-muster-rank-1', name: 'C-2 the first rank', scope: 'party',
    entries: [{ when: stage('quest:samurai-the-silent-muster', 'ranks'), node: 'rank' }, { node: 'after' }],
    nodes: {
      rank: {
        speaker: 'narrator', text: 'A rank of the dead, swords at the shoulder, in step. There is a gap in it, a soldier’s width.',
        choices: [
          { text: '(Step into the gap, in time, and march with them in silence.)', to: 'march' },
          { text: '(Wait at the edge until they pass.)', to: 'wait' },
        ],
      },
      march: { speaker: 'narrator', text: 'You fall into step. Twenty paces in silence among the dead, and then the rank parts for you, politely, as if you had always been one of them and had somewhere else to be.', next: null },
      wait: { speaker: 'narrator', text: 'You wait, perfectly still, while the rank goes by. The last soldier in it turns its skull very slightly towards you as it passes, as if in approval.', next: null },
      after: { speaker: 'narrator', text: 'A rank of the dead, lying still.', next: null },
    },
  },
  {
    id: 'dialogue:obj-samurai-muster-rank-2', name: 'C-2 the second rank', scope: 'party',
    entries: [{ when: stage('quest:samurai-the-silent-muster', 'ranks'), node: 'rank' }, { node: 'after' }],
    nodes: {
      rank: { speaker: 'narrator', text: 'A dead drill-sergeant with no jaw stands before a rank, drilling them with his hands alone: up, down, turn. You find you know the signs. They are the old pilgrims’ signs of the Temple Road. You sign “I am here”, and the sergeant stops, and signs it back, and lets you through.', next: null },
      after: { speaker: 'narrator', text: 'A rank of the dead, lying still.', next: null },
    },
  },
  {
    id: 'dialogue:obj-samurai-muster-rank-3', name: 'C-2 the last rank', scope: 'party',
    entries: [{ when: stage('quest:samurai-the-silent-muster', 'ranks'), node: 'rank' }, { node: 'after' }],
    nodes: {
      rank: { speaker: 'narrator', text: 'The last rank guards a door. Behind it, something enormous is breathing. The rank turns to face you, all together, swords up. You lay your hand on your sheathed sword and wait. They wait. After a long time they step aside, one pace each, exactly together.', next: null },
      after: { speaker: 'narrator', text: 'A door in the Barrowdowns, open.', next: null },
    },
  },
  ...objs('samurai-cut-thread', 'quest:samurai-the-ronin-under-the-wood', 'threads', [
    'A thread of silver silk as thick as a rope hangs cut from the roots of the Gloamwood. Where it was cut, it is still faintly humming a list of names: the bearers of the Turning of C. 784, one after another, fading as you listen.',
    'A whole curtain of threads, cut through in one stroke at chest height. The ends are weeping a little. Round their edges, black chains are tightening on the air, like frost forming, though there is nothing for them to bind.',
    'The last cut thread, and beside it, in the root-mould, the print of a man’s sandal, and the print of a bare sword-point, where he rested it as he walked. No sheath-mark. There never is.',
  ], 'A cut thread, still and quiet.'),
  // ---------- featured bearers (hooks on the bearer NPCs)
  {
    id: 'dialogue:samurai-featured-oathbound', name: 'Featured: The Oath Unbroken', scope: 'party',
    entries: [
      { when: stage('quest:samurai-the-oath-unbroken', 'back'), node: 'back' },
      { when: { all: [stage('quest:samurai-the-oath-unbroken', 'stone'), { not: { flag: 'samurai.aldric_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-oathbound', text: 'I have sworn to destroy Bonelord Varric. I have carved the oath in stone at the barrow-mouth, as the March requires. Will you kneel with me while I read it? It steadies me to have a witness.',
        choices: [
          { text: '(Nod.)', to: null, quest: true, effects: [{ setFlag: 'samurai.aldric_asked', value: true }] },
          { text: 'Whom does your oath serve, Ser Aldric?', to: 'serve', quest: true, effects: [{ setFlag: 'samurai.aldric_asked', value: true }] },
        ],
      },
      serve: { speaker: 'npc:bearer-oathbound', text: '(He looks at you as if you had asked what colour Tuesday is.) It serves itself. An oath is an oath. Come and kneel, and you’ll see.', next: null },
      back: {
        speaker: 'npc:bearer-oathbound', text: 'I added a line. “For the ones under the turf, who never got to stand down.” An oath for somebody, not just against somebody. It is a better oath. I’ll keep it at the Heart, beside you.',
        effects: [{ setFlag: 'samurai.aldric_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-samurai-oath-stone', name: 'The oath-stone at the barrow-mouth', scope: 'party',
    entries: [
      { when: { all: [stage('quest:samurai-the-oath-unbroken', 'stone'), { partyHasClass: 'oathbound' }] }, node: 'player' },
      { when: stage('quest:samurai-the-oath-unbroken', 'stone'), node: 'stone' },
      { node: 'after' },
    ],
    nodes: {
      stone: {
        speaker: 'npc:bearer-oathbound', text: '(He kneels at the stone and reads.) “I, Aldric Vow, swear to destroy Bonelord Varric, and his muster, and all who stand with him, until it is done.” (He looks at you.) Well?',
        choices: [
          { text: '(Say nothing. Lay your hand on the stone, below the oath, where there is room for another line.)', to: 'room' },
          { text: 'An oath has to protect someone, or it’s just a sword with words on.', to: 'protect' },
        ],
      },
      room: { speaker: 'narrator', text: 'Ser Aldric looks at the empty space under the oath for a long time. Then he takes out his knife, and, slowly, carves a new line.', next: null },
      protect: { speaker: 'narrator', text: 'He opens his mouth to argue, and finds he cannot. He takes out his knife and carves a new line under the oath, slowly, getting it right.', next: null },
      player: { speaker: 'narrator', text: 'You kneel with your Oathbound companion at the stone they carved at the barrow-mouth. They read their oath aloud. Then, in silence, the two of you carve a new line under it, for the dead below who never got to stand down.', next: null },
      after: { speaker: 'narrator', text: 'An oath-stone at the barrow-mouth, with a second line carved under the first.', next: null },
    },
  },
  {
    id: 'dialogue:samurai-featured-shade', name: 'Featured: The Shadow on the Thread', scope: 'party',
    entries: [
      { when: stage('quest:samurai-the-shadow-on-the-thread', 'back'), node: 'back' },
      { when: { all: [stage('quest:samurai-the-shadow-on-the-thread', 'web'), { not: { flag: 'samurai.vesper_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-shade', text: 'The Spinner’s web hums at any sound, and it twitches at any shadow. I have no shadow. You, I hear, have no words. Between us we might cross it without waking anything. Coming?',
        choices: [{ text: '(Nod.)', to: null, quest: true, effects: [{ setFlag: 'samurai.vesper_asked', value: true }] }],
      },
      back: {
        speaker: 'npc:bearer-shade', mood: 'happy', text: 'Not one sound. Not one shadow. I have never in my life been so invisible with someone else. It was restful. At the Heart, I’ll walk where you walk.',
        effects: [{ setFlag: 'samurai.vesper_thanked', value: true }], next: null,
      },
    },
  },
  ...objs('samurai-web-crossing', 'quest:samurai-the-shadow-on-the-thread', 'web', [
    'The first strand of the web, a silver road over black nothing. Vesper goes first, and casts no shadow on it at all. You follow, without a breath. The strand does not even tremble.',
    'A knot of threads where the Spinner’s memory still hums: old voices, old Turnings. You pass through it in silence, and the voices go on talking to each other, unaware of you.',
    'The last strand, over the deepest dark. Halfway across, a thread hums at your heartbeat. You both stop. You wait. Vesper waits. The thread forgets you, and you go on.',
  ], 'A strand of the Spinner’s web, still.'),
  // ---------- C-6 Kanemori's Word
  {
    id: 'dialogue:samurai-hettie-letter', name: 'C-6 Kanemori’s word', scope: 'party',
    entries: [
      { when: stage('quest:samurai-kanemoris-word', 'letter'), node: 'start' },
      { when: { any: [stage('quest:samurai-kanemoris-word', 'court'), stage('quest:samurai-kanemoris-word', 'reply'), { questCompleted: 'quest:samurai-kanemoris-word' }] }, node: 'pew' },
      { node: 'later' },
    ],
    nodes: {
      start: { speaker: 'npc:hettie-natter-concordia', text: '(Hettie Natter, in her pilgrim’s hat, both hands clamped over her mouth, eyes enormous. She takes one hand away, holds out a letter, and claps it straight back.)', next: 'letter' },
      letter: {
        speaker: 'narrator', text: 'A sheet of Hushpine paper, folded once. In the middle of it, in Kanemori’s brush-hand, one word.',
        choices: [
          { text: '(Read it.)', to: 'one', when: { not: { trust: HK, value: 'trusted' } } },
          { text: '(Read it.)', to: 'two', when: { trust: HK, value: 'trusted' } },
        ],
      },
      one: { speaker: HK, text: '“Protect.”', effects: [WORD, { setFlag: 'samurai.kanemori_letter', value: 'one' }], next: 'hettie' },
      two: { speaker: HK, text: '“Protect him.”', effects: [{ addFlag: 'samurai.kanemori_words', amount: 2 }, { setFlag: 'samurai.kanemori_letter', value: 'two' }], next: 'him' },
      him: { speaker: 'narrator', text: 'Two words. Him. Not them. There is only one person in the world Kanemori would mean by him.', next: 'hettie' },
      hettie: {
        speaker: 'npc:hettie-natter-concordia', text: '(Hettie takes her hands off her mouth at last.) He handed it to me himself! He said nothing! He said nothing at me for a whole minute! I walked all this way and I didn’t read it, I swear, I only held it up to the sun once!',
        choices: [{ text: '(Sign “thank you”.)', to: null, quest: true, trust: 1 }, { text: 'Thank you, Hettie.', to: null, quest: true }],
      },
      pew: { speaker: 'npc:hettie-natter-concordia', mood: 'happy', text: '(Hettie sits in the quiet pew between two pilgrims, hands folded, beaming, perfectly silent. When she sees you she mouths, enormously: “I LOVE IT HERE.”)', next: null },
      later: { speaker: 'npc:hettie-natter-concordia', mood: 'happy', text: 'Concordia is so LOUD. I love it. Nobody minds anything I say!', next: null },
    },
  },
  // ---------- Act II hook: Rook and a novice who answered the muster
  {
    id: 'dialogue:hook-samurai-rook', name: 'Hook: Rook and the Samurai who answered the muster', scope: 'party',
    entries: [{ when: { all: [{ flag: 'samurai.oath', value: 'answered' }, { flag: 'story.act', op: '>=', value: 2 }, { not: { flag: 'samurai.rook_soldier' } }] }, node: 'soldier' }],
    nodes: {
      soldier: {
        speaker: 'npc:rook', text: 'Hushpine. You stand like a soldier, not a monk. Basilio says the Hushpine novices marched to their marshal’s muster without a word, every one of them. Is that true?',
        effects: [{ setFlag: 'samurai.rook_soldier', value: true }],
        choices: [
          { text: '(Nod, once.)', to: 'nod', trust: 1, trustNpc: 'npc:rook' },
          { text: '(Say nothing. Stand at ease.)', to: 'nod', trust: 1, trustNpc: 'npc:rook' },
        ],
      },
      nod: { speaker: 'npc:rook', mood: 'happy', text: 'A soldier. Good. I know what to do with a soldier. Monks, I never know where to put. There’s a bunk at the Watch House for you, and nobody will talk to you in it.', next: null },
    },
  },
  // ======================= ACT III
  {
    id: 'dialogue:samurai-herald-fate', name: 'III-4 the Chimera’s Blade: Ikeda’s fate', scope: 'party',
    entries: [
      { when: { flag: 'samurai.oath', value: 'answered' }, node: 'dog' },
      { when: { flag: 'samurai.oath', value: 'cut' }, node: 'ronin' },
      { node: 'kneel' },
    ],
    nodes: {
      dog: { speaker: IS, mood: 'angry', text: 'The General’s dog! Did he let you off the lead for this? You marched when you were called, novice. Don’t come up here and tell me about masters.', next: 'kneel' },
      ronin: { speaker: 'narrator', text: 'Round the Chimera’s feet, Ikeda’s hollow ronin lower their swords a hand’s breadth when they see you. They remember the novices who cut their topknots and refused the muster. Ikeda sees it, and laughs.', next: 'kneel' },
      kneel: {
        speaker: IS, mood: 'hollow', text: '(The Chimera has let go of him: a man kneeling on the stair, his hand still on the bare hilt.) Something finally held me, novice. I thought it would feel like a cage. It felt like rest.',
        choices: [
          { text: '(Reach for the empty sheath at your belt.)', to: 'choose', when: { flag: 'samurai.sheath_taken' } },
          { text: '(Reach into your pack.)', to: 'pack', when: { not: { flag: 'samurai.sheath_taken' } } },
        ],
      },
      pack: { speaker: 'narrator', text: 'In your pack, wrapped in a pilgrim’s cloth, is the empty sheath from the shrine. You left it on the altar. Somebody on the Temple Road did not let you.', next: 'choose' },
      choose: {
        speaker: IS, text: 'Well? You have his silence. Say something, for once. Or do what swords do.',
        choices: [
          {
            text: '(Say nothing. Hold out the empty sheath.)', to: 'spare', quest: true,
            when: { any: [{ flag: 'samurai.oath', value: 'sheathed' }, { trust: HK, value: 'trusted' }] },
            lockedLabel: 'You need to have served the sheath, or to have earned Kanemori’s trust',
            effects: [{ setFlag: 'samurai.nemesis_fate', value: 'spared' }],
          },
          { text: '(Draw.)', to: 'destroy', quest: true, effects: [{ setFlag: 'samurai.nemesis_fate', value: 'destroyed' }] },
        ],
      },
      spare: { speaker: 'narrator', text: 'He reads the names inside the mouth of the sheath. KANEMORI. SHUN. Slowly, as if it hurts, his hand opens on the hilt for the first time in thirty years, and he slides the blade home.', next: 'spare2' },
      spare2: { speaker: 'narrator', text: 'The Chimera’s binding comes off him like a dropped chain. What is left kneeling on the stair is a tired man with a sheathed sword across his knees.', next: 'spare3' },
      spare3: { speaker: IS, mood: 'sad', text: '(Very quietly, the first quiet thing you have ever heard him say.) Oh. That’s what it was for. Tell him I put it away.', next: null },
      destroy: { speaker: 'narrator', text: 'One draw, the one you were taught to wait for. Ikeda’s bare sword rings on the stair and lies there, still. Nobody holds it now. Nobody ever will.', next: null },
    },
  },
  {
    id: 'dialogue:samurai-hettie-heart', name: 'Hettie at the Heart camp (Say It for Me, Kenta’s Letter)', scope: 'party',
    entries: [
      { when: { all: [stage('quest:samurai-kentas-letter', 'letter'), stage('quest:samurai-say-it-for-me', 'hettie')] }, node: 'both' },
      { when: stage('quest:samurai-kentas-letter', 'letter'), node: 'kenta' },
      { when: stage('quest:samurai-say-it-for-me', 'hettie'), node: 'word' },
      { node: 'later' },
    ],
    nodes: {
      kenta: { speaker: HN, mood: 'happy', text: '(Hettie Natter has walked into the Heart in her pilgrim’s hat, and is talking before you reach her.) I came through! I followed the bearers! Kenta gave me this for you. I promised not to read it. I read it.', next: 'letter' },
      both: { speaker: HN, mood: 'happy', text: '(Hettie Natter has walked into the Heart in her pilgrim’s hat, and is talking before you reach her.) Two letters! I followed the bearers! This one is Kenta’s. I promised not to read it. I read it.', next: 'bletter' },
      letter: { speaker: 'narrator', text: '“Deer Bearer. When you do the draw do you breeth in or out. I have tryed both and fell over both times. Kenta. P.S. I sweep your yard as well now.”', next: 'kenta2' },
      kenta2: { speaker: HN, text: 'He wrote it eleven times. That was the best one. He wants an answer before you go up to the Citadel, he says, in case you don’t come down.', next: null },
      bletter: { speaker: 'narrator', text: '“Deer Bearer. When you do the draw do you breeth in or out. I have tryed both and fell over both times. Kenta. P.S. I sweep your yard as well now.”', next: 'bword' },
      bword: { speaker: HN, text: 'And this is from Sensei. Well. He pointed. He pointed at me, and at the road, and at the Heart, for a whole minute.', next: 'word2' },
      word: { speaker: HN, text: '(Hettie Natter, pilgrim’s hat, both hands over her mouth until she sees it is you.) Sensei sent me! Well. He pointed. He pointed at me, and at the road, and at the Heart, for a whole minute.', next: 'word2' },
      word2: { speaker: HN, mood: 'sad', text: 'Then he wrote a name in the dust and rubbed it out, and wrote it, and rubbed it out, until I knew it. Shun. He wants you to say it here, aloud, where the man can hear. He’s tried for thirty years.', next: 'slip' },
      slip: { speaker: 'narrator', text: 'She gives you a slip of Hushpine paper, folded once. In the middle of it, in Kanemori’s brush-hand, is one word.', next: 'aloud' },
      aloud: { speaker: HK, text: '“Aloud.”', effects: [WORD], next: null },
      later: { speaker: HN, mood: 'happy', text: 'Is it always this loud at the end of the world? I thought it would be quieter. I’m not complaining. I’m never complaining.', next: null },
    },
  },
  {
    id: 'dialogue:obj-samurai-shun-step', name: 'Say It for Me: the top step', scope: 'party',
    entries: [
      { when: { all: [stage('quest:samurai-say-it-for-me', 'say'), { flag: 'samurai.kanemori_devotable' }, { flag: 'samurai.nemesis_fate', value: 'spared' }] }, node: 'dev-spared' },
      { when: { all: [stage('quest:samurai-say-it-for-me', 'say'), { flag: 'samurai.kanemori_devotable' }] }, node: 'dev-fallen' },
      { when: { all: [stage('quest:samurai-say-it-for-me', 'say'), { flag: 'samurai.nemesis_fate', value: 'spared' }] }, node: 'spared' },
      { when: stage('quest:samurai-say-it-for-me', 'say'), node: 'fallen' },
      { node: 'step' },
    ],
    nodes: {
      spared: { speaker: 'narrator', text: 'Ikeda sits on the top step with his sheathed sword across his knees, as if he has forgotten how to do anything else. You stand where he can hear, and say it aloud. “Shun.”', next: 'spared2' },
      spared2: { speaker: IS, mood: 'sad', text: '(He goes very still at his own name.) Nobody has said it like that in thirty years. As if it were worth keeping. (He bows, low, towards a mountain he cannot see.)', next: null },
      fallen: { speaker: 'narrator', mood: 'sad', text: 'Ikeda’s sword lies on the top step where it fell. You stand over it and say his name aloud, the word Kanemori kept for thirty years. “Shun.” The Heart is very quiet. Perhaps it carries.', next: null },
      'dev-spared': {
        speaker: 'narrator', text: 'Ikeda sits on the top step with his sheathed sword across his knees. You stand where he can hear, and say it aloud, for both of them. “Shun.”',
        effects: [{ trust: HK, set: 5 }], next: 'dev-spared2',
      },
      'dev-spared2': { speaker: IS, mood: 'sad', text: '(He goes very still.) That was his voice. You said it in his voice. (He bows, low, towards a mountain he cannot see, and stays down a long time.)', next: 'far' },
      'dev-fallen': {
        speaker: 'narrator', mood: 'sad', text: 'Ikeda’s sword lies on the top step where it fell. You stand over it and say his name aloud, for both of them. “Shun.”',
        effects: [{ trust: HK, set: 5 }], next: 'far',
      },
      far: { speaker: 'narrator', text: 'Far away, on the High Terrace, by a bell that hangs above the clouds, an old man with his hands in his sleeves lifts his head, as if somebody had called him. He says nothing. He does not need to.', next: null },
      step: { speaker: 'narrator', text: 'The top step of the Twelve Stairs, where the Chimera knelt.', next: null },
    },
  },
  {
    id: 'dialogue:obj-samurai-masterless', name: 'The Masterless', scope: 'party',
    entries: [
      { when: stage('quest:samurai-the-masterless', 'ronin'), node: 'ronin' },
      { when: stage('quest:samurai-the-masterless', 'watch'), node: 'point' },
      { when: stage('quest:samurai-the-masterless', 'cages'), node: 'still' },
      { node: 'after' },
    ],
    nodes: {
      ronin: {
        speaker: 'narrator', text: 'In a corner of the Legion camp stand Ikeda’s hollow ronin, swords drawn, pointing at nothing. Nobody has given them an order in days, and they do not know how to stop standing.',
        choices: [
          { text: '(Say nothing. Sheathe your sword, and stand guard by the open cages.)', to: 'guard' },
          { text: 'These people need guarding. Guard them.', to: 'tell' },
        ],
      },
      point: {
        speaker: 'narrator', text: 'In a corner of the Legion camp stand Ikeda’s hollow ronin, swords drawn, pointing at nothing. When you come near, every blade swings round to point at you, and waits.',
        choices: [
          { text: 'Stand down.', to: 'order' },
          { text: '(Say nothing. Bow, and step back.)', to: 'bow' },
        ],
      },
      order: { speaker: 'narrator', text: 'Not one blade moves. A ronin who takes an order is only a soldier again. Whatever they are waiting for, it is not a master.', next: 'look' },
      bow: { speaker: 'narrator', text: 'The blades follow you back a step, and then, slowly, swing away again to point at nothing. They were not threatening you. They were asking.', next: 'look' },
      look: { speaker: 'narrator', text: 'Across the camp, by the broken cages, nobody is standing guard over anything.', next: null },
      still: { speaker: 'narrator', text: 'Ikeda’s ronin, swords drawn, pointing at nothing.', next: null },
      guard: { speaker: 'narrator', text: 'You stand by the cages, where the camp’s hollowed sit blinking in the light, with your sword sheathed and your face to the dark. After a while there is a ronin beside you. Then ten. Then all of them.', next: 'end' },
      tell: { speaker: 'narrator', text: 'They turn and look at the cages, where the camp’s hollowed sit blinking, too tired to stand. One ronin walks over and stands in front of them, facing out. Then another.', next: 'end' },
      end: { speaker: 'narrator', mood: 'sad', text: 'They will still be there when you go up the stairs: masterless, and guarding something. It is not the same as serving. It may be better.', next: null },
      after: { speaker: 'narrator', text: 'A line of ronin at the edge of the Legion camp, facing out.', next: null },
    },
  },
  {
    id: 'dialogue:obj-samurai-heart-post', name: 'Kenta’s Letter: the practice post', scope: 'party',
    entries: [
      { when: { all: [stage('quest:samurai-kentas-letter', 'answer'), { flag: 'samurai.kenta_draw' }] }, node: 'drew' },
      { when: stage('quest:samurai-kentas-letter', 'answer'), node: 'post' },
      { node: 'after' },
    ],
    nodes: {
      drew: { speaker: 'narrator', text: 'He is still practising the draw you showed him in the fifth yard: sheathe, wait, cut. Still falling over, by the sound of it. You owe him a proper answer.', next: 'post' },
      post: {
        speaker: 'narrator', text: 'At the edge of the Heart camp there is a hitching post the right height for practice. You stand before it, sheathed, with Kenta’s letter in your belt. The bearers drift over to watch.',
        choices: [
          { text: '(Breathe out, and draw on the end of it.)', to: 'out' },
          { text: '(Say nothing. Sheathe, wait, and let the breath decide.)', to: 'wait' },
        ],
      },
      out: { speaker: 'narrator', text: 'You breathe out, and on the last of it, before the next breath comes, you draw. The post rings. You write it down for him in big letters: OUT. THEN CUT. DO NOT FALL OVER.', next: 'reply' },
      wait: { speaker: 'narrator', text: 'You wait so long that a bearer coughs. Then you draw, and you could not have said whether you were breathing at all. You write it down as best you can: NEITHER. WAIT UNTIL YOU FORGET. THEN CUT.', next: 'reply' },
      reply: { speaker: 'narrator', mood: 'happy', text: 'Hettie takes your answer for the road home, promises not to read it, and reads it at once. Every bearer who watched is now practising their breathing.', next: null },
      after: { speaker: 'narrator', text: 'A hitching post at the edge of the Heart camp, with a fresh notch in it.', next: null },
    },
  },
];

export default dialogues;
