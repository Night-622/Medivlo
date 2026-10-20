/**
 * Hollow Crown, ARCANIST Act I depth pass (10-campaign-style.md §8, docs/PACING.md): the new stages' scenes,
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
const TH = 'npc:coalby-thrane' as const, MO = 'npc:ignace-morrow' as const, OG = 'npc:orsolya-glaze' as const;
const AW = 'npc:clerk-ashworth' as const, AL = 'npc:ambrose-lumen' as const, BT = 'npc:bettany' as const;
const DN = 'npc:danny-flue' as const;

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

const dialogues: DialogueDef[] = [
  // ======================= I-1 The Bell in the Kiln
  {
    id: 'dialogue:area-arcanist-kiln-lanes', name: 'I-1 banter: the back lanes', bark: true,
    entries: [{ when: stage('quest:arcanist-the-bell', 'lanes'), node: 'b' }],
    nodes: { b: { speaker: TH, text: 'Left at the cracked window. Left again. Mind the third step, it’s been on fire since spring.', next: null } },
  },
  {
    id: 'dialogue:arcanist-thrane-study', name: 'I-1 Thrane’s study', scope: 'party',
    entries: [{ node: 'in' }],
    nodes: {
      in: { speaker: 'narrator', text: 'Magister Thrane’s study is three rooms of paper with a fire in the middle of them. A Lava Slime the size of a cat is asleep on a stack of Conclave minutes, gently scorching them.', next: 'pudding' },
      pudding: { speaker: TH, text: 'That is Pudding. Pudding, this is a bearer of the Ash stone. Don’t eat their permit. Sit, sit. Move the treatise. No, the other treatise.', next: 'tea' },
      tea: {
        speaker: TH, text: '(He pours two cups of something black and fragrant, and his hands are shaking.) Forty years I’ve studied the Concord Stones. Forty years and never a whisper. And tonight one of them sings, and walks up to my gate in its nightclothes.',
        choices: [
          { text: 'Why me?', to: 'why' },
          { text: 'You’re frightened.', to: 'afraid' },
          { text: '(Hold out your hand. Let it glow.)', to: 'glow', school: 'ash' },
        ],
      },
      why: { speaker: TH, text: 'Nobody knows why a stone chooses. Not the Conclave, not the old books. It chose you. I suspect the stone has better judgement than the Conclave, which is not a high bar.', next: 'conclave' },
      afraid: { speaker: TH, mood: 'afraid', text: 'Terrified. Delighted. Both, mostly. Fear and delight are very close together in a scholar. It’s how you know you’re near something true.', next: 'conclave' },
      glow: { speaker: TH, mood: 'happy', text: '(The light from your palm turns every page in the room gold. Pudding wakes, and purrs, which slimes are not supposed to do.) Oh. Oh, look at that. Put it away, put it away, before the neighbours see.', next: 'conclave' },
      conclave: { speaker: TH, text: 'Listen. The Conclave measures everything that burns, and you are burning. If they find you, they will want to know how. They will want to know very badly. So for now you are my apprentice, and my apprentice is dull.', next: 'favour' },
      favour: {
        speaker: TH, text: 'And my dull apprentice is going to do me a small favour in the morning. Five braziers in the Kiln Ward have gone out, and in Kilnhold a cold brazier is a crime. You have a permit. You have my permit.',
        choices: [
          { text: 'Why have they gone out?', to: 'out' },
          { text: 'I’ll do it.', to: 'end', trust: 1 },
        ],
      },
      out: { speaker: TH, mood: 'sad', text: 'Because something is wrong with the fire in this city, and has been since before you were born. The braziers are just where it shows. Go on. Light them. Then come and tell me what you saw.', next: 'end' },
      end: { speaker: TH, text: 'There’s a cot behind the star charts. Pudding will sleep on your feet. It’s a great honour, apparently.', next: null },
    },
  },

  // ======================= I-2 A Permit to Burn: the black tears in the gutters
  clue('arcanist-gutter-tear-1', 'I-2 the gutter tears (1)', stage('quest:arcanist-a-permit-to-burn', 'gutters'),
    'Black tears in the gutter under the first brazier. You watch them for a while before you understand what is wrong. They are running uphill.', 'arcanist.gutter_1',
    'A clean gutter, for Kilnhold.'),
  clue('arcanist-gutter-tear-2', 'I-2 the gutter tears (2)', stage('quest:arcanist-a-permit-to-burn', 'gutters'),
    'Three gutters meet in a drain, and every one of them is carrying tears the same way: north, towards the Great Kiln, like water running to a sink.', 'arcanist.gutter_2',
    'A drain where three gutters meet.'),
  clue('arcanist-gutter-tear-3', 'I-2 the gutter tears (3)', stage('quest:arcanist-a-permit-to-burn', 'gutters'),
    'The tears end at an iron grate by the Kiln wall. The grate is new, and oiled, and stamped with a seal you have seen on every permit in the Ward: the Provost’s.', 'arcanist.gutter_seal',
    'An oiled iron grate by the Kiln wall.', 'Somebody wanted these tears to reach the Kiln, and made a door for them.'),

  // ======================= I-3 The Zealots’ Furnace: the apprentices’ benches
  clue('arcanist-apprentice-bench-1', 'I-3 an apprentice’s bench (1)', stage('quest:arcanist-the-zealots-furnace', 'benches'),
    'Under a half-blown bottle, a hymn sheet in a careful hand. “Clean fire, clean fire, burn the tears away. Burn the weeping out of us and leave us bright as day.”', 'arcanist.bench_1',
    'An apprentice’s bench, tidy for once.'),
  clue('arcanist-apprentice-bench-2', 'I-3 an apprentice’s bench (2)', stage('quest:arcanist-the-zealots-furnace', 'benches'),
    'A cellar key, wrapped in a sock, wedged into the bench leg. The key has a chapel’s dove stamped on its bow, and the dove has been painted black.', 'arcanist.bench_2',
    'An apprentice’s bench, with a sock on the leg.'),
  clue('arcanist-apprentice-bench-3', 'I-3 an apprentice’s bench (3)', stage('quest:arcanist-the-zealots-furnace', 'benches'),
    'A glass tear, half-blown, tinted black on purpose. Under it, a scrap of paper: “For the Preacher, who is my father. So he can see I am trying. — N.”', 'arcanist.zealot_daughter',
    'An apprentice’s bench. Someone has left a tear of black glass on it.'),

  // ======================= I-4 The Provost’s Favour: the Smoke Terraces
  {
    id: 'dialogue:arcanist-morrow-terrace', name: 'I-4 the Smoke Terraces with the Provost', scope: 'party',
    entries: [{ node: 'view' }],
    nodes: {
      view: { speaker: 'narrator', text: 'From the top of the Smoke Terraces you can see all of Kilnhold at once: the Row glittering, the Ward glowing, the Roots breathing red through their grates, and over it all the Great Kiln, coughing like an old man in a cold room.', next: 'city' },
      city: { speaker: MO, mood: 'happy', text: 'There. Isn’t she beautiful? Every window on the Row was made in that fire. Every pot, every pipe, every bell. Two hundred thousand people, and every one of them is warm tonight because of her.', next: 'fail' },
      fail: {
        speaker: MO, mood: 'sad', text: 'And she is dying. Thirty years ago something went out of her and nobody knows what. The old masters gave up. I didn’t. I have kept her alive with my own two hands, one bad winter at a time.',
        choices: [
          { text: 'How?', to: 'how' },
          { text: 'You love this city.', to: 'love' },
          { text: 'There was a grate by the Kiln wall with your seal on it. The gutter tears run into it.', to: 'grate', when: { flag: 'arcanist.gutter_seal' }, insight: 'arcanist_morrow_grate' },
        ],
      },
      how: { speaker: MO, text: 'Ingenuity. Sacrifice. Long nights and short tempers. You will understand when you have something you cannot let go of. You will, one day. Everybody does.', next: 'hands' },
      love: { speaker: MO, mood: 'happy', text: 'More than my own life. That is not a figure of speech, Arcanist. I am a very literal man.', next: 'hands' },
      grate: { speaker: MO, text: '(For a moment his smile stays exactly where it is, and nothing else in his face moves at all.) Drainage. The Kiln’s apron floods. You have sharp eyes. Sharp eyes are a gift; mind they don’t become a habit.', next: 'hands' },
      hands: { speaker: 'narrator', text: 'He leans on the parapet. His gloves are new, and the leather over his palms has been scorched through, and he has not noticed, or he has stopped noticing.', next: 'ask' },
      ask: {
        speaker: MO, text: 'Tonight the Conclave votes on what to feed her next. I would like one voice in the hall that isn’t thinking of its own furniture. Will you sit with us?',
        choices: [
          { text: 'I’ll be there.', to: 'end', trust: 1, trustNpc: MO },
          { text: 'I’ll decide when I’ve heard the arguments.', to: 'wise' },
        ],
      },
      wise: { speaker: MO, mood: 'happy', text: 'Good. Better. Thrane would never have said that at your age. Thrane still wouldn’t.', next: 'end' },
      end: { speaker: MO, text: 'Go and talk to people first, if you like. The clerks, the old men with telescopes. Find out what they have to lose. Then come and vote.', next: null },
    },
  },

  // ======================= I-5 The Last Library: canvassing
  {
    id: 'dialogue:arcanist-ashworth-canvass', name: 'I-5 Ashworth on the Archive', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: AW, text: 'The Glass Archive? Every permit this office has issued for six hundred years is filed there, in triplicate. If they burn it, nothing in Kilnhold will ever have been allowed.', next: 'mean' },
      mean: {
        speaker: AW, text: 'Do you understand what that means? Every chimney, every kiln, every bakery oven in the city, retrospectively unlicensed. I would have to re-issue all of them. By hand.',
        choices: [
          { text: 'So you’ll vote to save it.', to: 'vote' },
          { text: 'Is that really the worst of it?', to: 'worst' },
        ],
      },
      vote: { speaker: AW, text: 'I don’t have a vote. I have a stamp. But the Magisters all owe me paperwork, and every one of them knows it.', choices: more(offer('quest:arcanist-pudding-gets-out', 'Is that a slime in your filing?', 'slime')) },
      worst: { speaker: AW, mood: 'sad', text: '(He takes his spectacles off.) No. The worst of it is my mother’s birth record is in there. Everybody’s is. A city that burns its own names to stay warm. I’d rather be cold, I think. Don’t tell anyone I said so.', choices: more(offer('quest:arcanist-pudding-gets-out', 'Is that a slime in your filing?', 'slime')) },
      slime: { speaker: AW, mood: 'angry', text: 'It ate a year of burning permits and left by the window. It belongs to the Magister. Everything inconvenient belongs to the Magister. Retrieve it.', next: null },
    },
  },
  {
    id: 'dialogue:arcanist-ambrose-canvass', name: 'I-5 Ambrose on the Archive', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: AL, text: 'The vote. Yes. My charts are in the Archive, you know. Six hundred years of the night sky over Cinderreach, drawn by men who could still see it.', next: 'charts' },
      charts: {
        speaker: AL, text: 'If they burn, the stars go with them. Nobody alive has seen them. Nobody will remember where they were. I suppose the Provost would say a city can live without stars.',
        choices: [
          { text: 'Can it?', to: 'can' },
          { text: 'He also says it can’t live without fire.', to: 'fire' },
        ],
      },
      can: { speaker: AL, mood: 'sad', text: 'It can live. It cannot look up. I have watched it stop looking up, one year at a time, for thirty years.', choices: more(offer('quest:arcanist-the-last-star', 'Could I help you look up, just once?', 'help')) },
      help: { speaker: AL, text: 'The lens wants cleaning, and the smoke above it wants a hole burned in it. At night, mind. Stars are shy.', next: null },
      fire: { speaker: AL, text: 'He is right about that. He is usually right. That is what frightens me about him, young one. A man who is always right never has to stop and check.', choices: more(offer('quest:arcanist-the-last-star', 'Could I help you look up, just once?', 'help')) },
    },
  },

  // ======================= I-6 The Ledger Flame: the trapped archivists
  ...[
    'An archivist under a fallen shelf, still clutching a box of letters, refusing to let go of it. You lift the shelf. She keeps the box, and runs.',
    'Two archivists in a reading alcove with the fire on three sides, arguing about which of them should carry the other. You carry both.',
    'An old archivist sitting very calmly in the middle of the floor, reading. “I wanted to finish it,” he says, and lets you lead him out by the sleeve, still reading.',
  ].map((text, i): DialogueDef => clue(`arcanist-trapped-archivist-${i + 1}`, `I-6 a trapped archivist (${i + 1})`,
    stage('quest:arcanist-the-ledger-flame', 'archivists'), text, `arcanist.archivist_${i + 1}`, 'Scorched shelves, and nobody left among them.')),

  // ======================= I-7 What the Provost Burned: the night stokers, the evidence, Thrane
  {
    id: 'dialogue:arcanist-bettany-carts', name: 'I-7 Bettany on the night carts', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: BT, text: 'The Provost’s fuel? Comes down at night, in covered carts, and the stokers aren’t allowed to touch it. Conclave men tip it in themselves, and they wear gloves to the elbow.', next: 'smell' },
      smell: {
        speaker: BT, text: 'Smells of salt. Fifty years I’ve fed her, and I never knew a fuel that smelt of salt. And the carts come back up wet.',
        choices: [
          { text: 'Where do they tip it?', to: 'where', quest: true },
          { text: 'Why did nobody ask?', to: 'ask' },
        ],
      },
      ask: { speaker: BT, mood: 'sad', text: 'Because she was dying, and then she wasn’t. You don’t ask the doctor what’s in the medicine when your mother sits up in bed. You just thank him.', next: 'where' },
      where: { speaker: BT, text: 'The old flue at the bottom of the Roots. Mind the steps; they’re wet too. They shouldn’t be wet. Nothing down there should be wet.', next: null },
    },
  },
  clue('arcanist-fuel-cart', 'I-7 a Conclave fuel cart', stage('quest:arcanist-what-the-provost-burned', 'evidence'),
    'A covered cart, emptied, still dripping. You lift the cover. The planks inside are stained black, and in the corners, where it pooled, the black is still moving.', 'arcanist.fuel_cart',
    'An empty cart by the old flue.'),
  clue('arcanist-conclave-glove', 'I-7 a dropped glove', stage('quest:arcanist-what-the-provost-burned', 'evidence'),
    'A long glove, Conclave issue, dropped in the wet by the flue. The palm is scorched through, exactly as the Provost’s were on the Terraces. Inside the cuff, embroidered small: I. M.', 'arcanist.conclave_glove',
    'Wet stone by the old flue.'),
  {
    id: 'dialogue:arcanist-thrane-horror', name: 'I-7 Thrane learns what feeds the Kiln', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: TH, text: 'Well? What was in the Roots? (He looks at your face, and sits down without looking for a chair, and finds one anyway.) Tell me.', next: 'tell' },
      tell: {
        speaker: 'narrator', text: 'You tell him: the night carts, the salt, the black still moving in the planks, the glove with his initials. Thrane listens to all of it with his eyes shut.',
        choices: [
          { text: 'He’s feeding the Kiln black tears.', to: 'tears' },
          { text: 'And the smoke carries them over the whole city.', to: 'smoke', when: { flag: 'arcanist.sweeps_settled', op: '==', value: 'dampers' } },
        ],
      },
      tears: { speaker: TH, mood: 'afraid', text: 'And the Kiln burns them, and the smoke carries them, and they come down in every gutter in Kilnhold. Thirty years I’ve been doing the sum. I never thought to ask what he was adding.', next: 'why' },
      smoke: { speaker: TH, mood: 'afraid', text: 'The sweeps knew. Dora Flue knew, and I told her it was soot. Oh, Kilnhold. Every chimney in the city has been weeping his fuel.', next: 'why' },
      why: {
        speaker: TH, mood: 'sad', text: 'I taught him, you know. Ignace. A brilliant boy. Kinder than me. He used to bring me apples. When did he decide the city was worth more than the people in it?',
        choices: [
          { text: 'Maybe he doesn’t see a difference any more.', to: 'see', trust: 1 },
          { text: 'It doesn’t matter why. He has to be stopped.', to: 'stop' },
        ],
      },
      see: { speaker: TH, text: 'No. No, I don’t suppose he does. That is the trouble with loving a city. Cities can’t tell you when you’re hurting them.', next: 'down' },
      stop: { speaker: TH, text: 'Yes. Yes, of course. You’re right, and I am an old man who would rather be sad than be useful. Let me be useful.', next: 'down' },
      down: { speaker: TH, text: 'There is only one reason to feed a dying kiln for a year: to keep it warm enough to reach the thing at the bottom of it. Your half-stone is down there. So is he, by now. Go.', next: null },
    },
  },

  // ======================= I-9 The Cinder Road: the roadside shrine (codex find)
  {
    id: 'dialogue:obj-arcanist-cinder-shrine', name: 'I-9 the shrine on the Cinder Road', scope: 'party',
    entries: [{ when: stage('quest:arcanist-the-cinder-road', 'shrine'), node: 'shrine' }, { node: 'plain' }],
    nodes: {
      shrine: { speaker: 'narrator', text: 'A wayside shrine on the Cinder Road, a stone bowl on a post, where Ash travellers leave a coal before the gate. The bowl is full: thirty years of coals, every one gone cold, from people who set out for Concordia and found the gate shut.', next: 'coal' },
      coal: {
        speaker: 'narrator', text: 'Your half-stone hums. One by one, the coals in the bowl begin to glow again.',
        choices: [{ text: '(Leave one of your own.)', to: 'leave', effects: [{ unlockLore: 'lore:hc-cinder-road-shrine' }] }],
      },
      leave: { speaker: 'narrator', text: 'It catches at once, and burns brighter than the rest, and you walk on north with the warmth of it on your back.', next: null },
      plain: { speaker: 'narrator', text: 'A wayside shrine: a bowl of glowing coals on a post.', next: null },
    },
  },

  // ======================= Side: Pudding Gets Out (the office fires, Ashworth’s form)
  ...[
    'A wastepaper basket, burning merrily. Pudding’s trail goes straight through it. You stamp it out.',
    'The “Pending” tray, on fire. Nothing in it was ever going to be dealt with anyway. You put it out.',
    'A filing cabinet marked FIRES, REPORTED, smouldering from the inside. There is a terrible symmetry to it. You douse it.',
  ].map((text, i): DialogueDef => clue(`arcanist-office-fire-${i + 1}`, `Pudding Gets Out: an office fire (${i + 1})`,
    stage('quest:arcanist-pudding-gets-out', 'fires'), text, `arcanist.office_fire_${i + 1}`, 'Scorch marks. The office has seen worse.')),
  {
    id: 'dialogue:arcanist-ashworth-form', name: 'Pudding Gets Out: Form Four', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: AW, text: 'Out? All of it? Then there remains only the matter of the paperwork. (He produces a form.) Form Four. Report of an Unpermitted Fire on Permit Office Premises.', next: 'cause' },
      cause: {
        speaker: AW, text: 'Cause of fire?',
        choices: [
          { text: 'A Lava Slime.', to: 'slime' },
          { text: 'Act of Magister.', to: 'magister' },
        ],
      },
      slime: { speaker: AW, text: '“Lava Slime.” Owner? Don’t answer that, I know the owner. Everybody knows the owner. (He writes, very hard.) Sign here. And here. And initial the scorch.', next: 'end' },
      magister: { speaker: AW, mood: 'happy', text: '(He stops writing. Something happens to his mouth that might, on another man, be a smile.) “Act of Magister.” Do you know, there’s a box for that. Nobody has ever ticked it. Thank you.', next: 'end' },
      end: { speaker: AW, text: 'The slime is yours to return, and the fine is the Magister’s to pay. Tell him the office has stopped burning, for the fourth time this month.', next: null },
    },
  },

  // ======================= Side: the Sweeps’ Strike (the weeping chimneys, Danny)
  ...[
    'The first chimney, on the Ward’s roofline. Black runs down the inside of the pot like rain down a window, and it is warm.',
    'The second. Dora’s sweeps have chalked a face on this one, a crying face, as a warning. The tears are coming down with the smoke.',
    'The third, Danny’s chimney. Halfway down the flue somebody has scratched with a brush handle, over and over: SHE’S CRYING. SHE’S CRYING.',
  ].map((text, i): DialogueDef => clue(`arcanist-weeping-chimney-${i + 1}`, `The Sweeps’ Strike: a weeping chimney (${i + 1})`,
    stage('quest:arcanist-the-sweeps-strike', 'chimneys'), text, `arcanist.chimney_${i + 1}`, 'A chimney pot, black to the lip.')),
  {
    id: 'dialogue:arcanist-danny', name: 'The Sweeps’ Strike: Danny Flue', scope: 'party',
    entries: [{ when: stage('quest:arcanist-the-sweeps-strike', 'danny'), node: 'start' }, { node: 'quiet' }],
    nodes: {
      start: { speaker: DN, text: '(A boy of about twelve, sitting on an upturned bucket, holding a brush across his knees. He does not look up.)', next: 'ask' },
      ask: {
        speaker: DN, text: 'Mum sent you. I’m not going back up.',
        choices: [
          { text: 'I saw what you scratched in the flue. Who’s crying?', to: 'who' },
          { text: 'You don’t have to. I just want to know what you saw.', to: 'who', trust: 1 },
        ],
      },
      who: { speaker: DN, text: 'The Kiln. You can hear her up there, where the smoke comes in. Like somebody crying in the next room, who doesn’t want you to know. And the black comes in with it.', next: 'more' },
      more: {
        speaker: DN, text: 'Nobody believes me. Mum believes me. Nobody else. Do you believe me?',
        choices: [
          { text: 'I believe you. I’ve heard her too.', to: 'heard', when: { flag: 'arcanist.kiln_cry_heard' } },
          { text: 'I believe you.', to: 'believe' },
        ],
      },
      heard: { speaker: DN, mood: 'happy', text: '(He looks up, finally.) You heard her? Then I’m not mad. I’m not mad. (He stands up, and holds the brush like it belongs to him again.) Tell Mum I’ll go up again when it’s safe. Not before.', next: null },
      believe: { speaker: DN, text: '(He nods, very slowly.) Then make it safe. Mum says you’re clever. Make it safe and I’ll go up.', next: null },
      quiet: { speaker: DN, text: '(Danny is whistling, very quietly, and cleaning a brush that is already clean.)', next: null },
    },
  },

  // ======================= Side: the Unbreakable Vase (the night it sings)
  {
    id: 'dialogue:obj-arcanist-singing-vase', name: 'The Unbreakable Vase: it sings', scope: 'party',
    entries: [
      { when: { all: [stage('quest:arcanist-the-unbreakable-vase', 'sing'), NIGHT] }, node: 'night' },
      { when: stage('quest:arcanist-the-unbreakable-vase', 'sing'), node: 'day' },
      { node: 'vase' },
    ],
    nodes: {
      vase: { speaker: 'narrator', text: 'A tall vase of singing glass, the colour of a struck coal, in a cradle of straw. Waiting, as it has been waiting for thirty years.', next: null },
      day: { speaker: 'narrator', text: 'The workshop is loud by day. Orsolya said the vase only sings when the Row is quiet. Come back after dark.', next: null },
      night: { speaker: 'narrator', text: 'At midnight the Row goes quiet, and the vase begins to sing the note the Bell rang: low, warm, a little sad. You listen, and under it, very faint, there is a second note that the Bell did not ring. Nobody ever tuned it.', next: 'second' },
      second: {
        speaker: 'narrator', text: 'Your half-stone hums the first note. It does not know the second.',
        choices: [
          { text: '(Listen until you can hold the second note in your head.)', to: 'hold', insight: 'thirteenth_pitch', effects: [{ setFlag: 'arcanist.vase_sang', value: true }] },
          { text: '(Let it sing.)', to: 'let', effects: [{ setFlag: 'arcanist.vase_sang', value: true }] },
        ],
      },
      hold: { speaker: 'narrator', text: 'A thirteenth pitch, under the twelve. It is the loneliest sound you have ever heard. You will know it again.', next: null },
      let: { speaker: 'narrator', text: 'It sings until the first glassblowers come in at dawn, and then it stops, as if embarrassed.', next: null },
    },
  },

  // ======================= Side: Apprentice Eyebrows (the chapel candle)
  {
    id: 'dialogue:obj-arcanist-chapel-candle', name: 'Apprentice Eyebrows: a candle at the chapel', scope: 'party',
    entries: [
      { when: { all: [stage('quest:arcanist-apprentice-eyebrows', 'candle'), NIGHT] }, node: 'night' },
      { when: stage('quest:arcanist-apprentice-eyebrows', 'candle'), node: 'day' },
      { node: 'door' },
    ],
    nodes: {
      door: { speaker: 'narrator', text: 'The old chapel door on the Row, boarded up since the Zealots. Someone keeps a candle stub on the step.', next: null },
      day: { speaker: 'narrator', text: 'A cold candle stub on the boarded chapel step. Wim said whoever lights it comes at night.', next: null },
      night: { speaker: 'narrator', text: 'A girl in an apprentice’s apron is kneeling on the chapel step, lighting a candle with her bare fingers. One of the three you freed. She doesn’t run when she sees you. She only looks tired.', next: 'nella' },
      nella: {
        speaker: 'narrator', text: '“I’m Nella,” she says. “The Preacher was my father. He thought the tears were dirt. He thought I was dirt, a bit, because I cried. I still light him a candle. Is that stupid?”',
        choices: [
          { text: 'No. You can grieve for someone who hurt you.', to: 'grieve', effects: [{ setFlag: 'arcanist.nella', value: 'comforted' }], trust: 1, trustNpc: OG },
          { text: 'Does Master Glaze know you come here?', to: 'glaze', effects: [{ setFlag: 'arcanist.nella', value: 'told' }] },
          { text: 'I found your glass tear. You were trying.', to: 'tear', when: { flag: 'arcanist.zealot_daughter' }, effects: [{ setFlag: 'arcanist.nella', value: 'comforted' }], trust: 1, trustNpc: OG },
        ],
      },
      grieve: { speaker: 'narrator', text: 'She nods, and wipes her eyes, and lets them be wet. “Rule one: don’t,” she says. “Rule two: if you did, roll.” She laughs, a little. “Wim’s rules. They work for most things.”', next: null },
      glaze: { speaker: 'narrator', text: '“She knows,” says Nella. “She walks me home after. She’s just round the corner now, pretending to look at a window.” And she is.', next: null },
      tear: { speaker: 'narrator', text: 'Her face crumples, and then uncrumples. “I was going to give it him,” she says. “I’ll finish it. I’ll put it on the step. He can see it from wherever he is.”', next: null },
    },
  },

  // ======================= Side: the Last Star (the old chart)
  {
    id: 'dialogue:obj-arcanist-star-chart', name: 'The Last Star: the old chart', scope: 'party',
    entries: [{ when: stage('quest:arcanist-the-last-star', 'chart'), node: 'chart' }, { node: 'plain' }],
    nodes: {
      chart: { speaker: 'narrator', text: 'Ambrose’s master’s chart of the Concord Ring, drawn sixty years ago: twelve stars round a dark centre, each labelled with its school in a beautiful hand. You copy tonight’s sky onto it, as Ambrose asked.', next: 'pencil' },
      pencil: { speaker: 'narrator', text: 'In the dark centre, very faint, in pencil, someone once drew a thirteenth star and then rubbed it out. You can still see the shape of it. Beside it, in the same hand: “Heard, not seen.”', effects: [{ setFlag: 'arcanist.chart_copied', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'An old star chart of the Concord Ring, carefully dusted.', next: null },
    },
  },

  // ======================= Side: Soot Pigeons (showing Thrane the unsent letter)
  {
    id: 'dialogue:arcanist-thrane-unsent', name: 'Soot Pigeons: Thrane reads the unsent letter', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: TH, text: 'A letter for me? I don’t get letters. I get summonses, fines and the occasional threat. (He reads it. He reads it again.) Where did you get this?', next: 'hand' },
      hand: {
        speaker: TH, mood: 'afraid', text: 'That is Ignace’s hand. I taught him to write it. “When the stone comes home, I will have a heart that never cools.” He never sent it. Who was it for?',
        choices: [
          { text: 'There was no name on it.', to: 'noname' },
          { text: 'I think it was for you. I think he wanted you to stop him.', to: 'you', trust: 1 },
        ],
      },
      noname: { speaker: TH, text: 'No. No, there wouldn’t be. He never knew who to tell anything to. Not even when he was a boy.', next: 'stone' },
      you: { speaker: TH, mood: 'sad', text: '(He folds the letter very small and puts it in his breast pocket.) That is a kind thing to think. I shall try to believe it.', next: 'stone' },
      stone: { speaker: TH, text: '“When the stone comes home.” Your stone. Whatever he means to do, he means to do it with your half-stone. Keep it close. Keep it singing. And keep away from his tower after dark.', effects: [{ setFlag: 'arcanist.thrane_warned', value: true }], next: null },
    },
  },

  // ======================= Side: the Stoker’s Lament (the stoking ledger)
  clue('arcanist-stoking-ledger', 'The Stoker’s Lament: the stoking ledger', stage('quest:arcanist-the-stokers-lament', 'ledger'),
    'The Permit Office’s stoking ledger, fifty years of Bettany’s permits in Ashworth’s neat hand. Every entry is “wood, coal, slag”, until a year ago. Then a new line, in the Provost’s own hand, every week: “special fuel, Conclave use”.', 'arcanist.stoking_ledger',
    'The Permit Office’s stoking ledger, back on its shelf.', 'The week the special fuel began is the week Bettany first heard the Kiln cry.'),
  {
    id: 'dialogue:arcanist-bettany-ledger', name: 'The Stoker’s Lament: what the ledger says', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: BT, text: 'You found something. I can see it on you. Go on.', next: 'tell' },
      tell: {
        speaker: BT, text: '(You tell her about the special fuel, and the week it began.) A year. She started crying the week they started feeding her that. And I stood at her grate every night and told her to hush.',
        choices: [
          { text: 'You couldn’t have known.', to: 'known' },
          { text: 'Then she was telling you, the only way she could.', to: 'telling', trust: 1 },
        ],
      },
      known: { speaker: BT, text: 'No. But I’m a stoker. Knowing what the fire wants is the whole of the job. Fifty years, and I missed the one thing that mattered.', next: 'end' },
      telling: { speaker: BT, mood: 'sad', text: '(She puts her hand flat on the warm wall of the gallery, the way you’d put a hand on a horse.) I hear you, old girl. I hear you. Somebody’s coming.', next: 'end' },
      end: { speaker: BT, text: 'Whatever you’re going to do about it, do it soon. She hasn’t got many more winters of this in her.', next: null },
    },
  },

  // ======================= Side: Golem Nine (a new shift)
  {
    id: 'dialogue:arcanist-bettany-golem', name: 'Golem Nine: a new shift', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: BT, text: 'Marit’s golem? Poor great lump. He’s been coming down every morning with that shovel and standing at her grate till noon.', next: 'take' },
      take: {
        speaker: BT, text: 'I could put him on my shift. I’m short a pair of hands, and his are the size of coal-scuttles.',
        choices: [
          { text: 'He’d like that.', to: 'north' },
          { text: 'He keeps looking north. Towards the gate.', to: 'north', trust: 1 },
        ],
      },
      north: { speaker: BT, mood: 'happy', text: '(She watches the golem for a while.) Ah. No. He’s not looking for a shift. He’s looking at you. Marit was his stoker. I think you’re his next one, whether you like it or not.', next: 'end' },
      end: { speaker: BT, text: 'Take him when you go. A golem with a shovel is useful anywhere they’ve got a fire. And everywhere’s got a fire, somewhere.', next: null },
    },
  },

  // ======================= Optional areas (Claude 2): finds in the Kilnhold ruin, cave and viewpoint
  {
    id: 'dialogue:obj-ash-capital-ruin-find', name: 'Kilnhold ruin: the first kiln', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'In the ruin, half buried in ash, a kiln no bigger than a bread oven, with a stone over its mouth carved in a language older than the Concord. The fire inside has been out for a thousand years. Your half-stone hums as if it remembers lighting it.', effects: [{ unlockLore: 'lore:hc-ash-capital-ruin' }], next: null } },
  },
  {
    id: 'dialogue:obj-ash-capital-cave-find', name: 'Kilnhold cave: the stokers’ names', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'Deep in the cave the walls are covered in names, scratched with shovel blades: every stoker who ever fed the Great Kiln, six hundred years of them, a new name above the old. The newest, near the top, is MARIT. Just below it, someone has already scratched BETTANY, and then, very carefully, NOT YET.', effects: [{ unlockLore: 'lore:hc-ash-capital-cave' }], next: null } },
  },
  {
    id: 'dialogue:obj-ash-capital-cave-codex', name: 'The Stokers’ Deep: a stoker’s tally-board', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'A stoker’s tally-board hung on a nail in the dark: one chalk mark for every shovel fed into the Great Kiln, column after column, by somebody who never missed a day. The last column stops halfway down. Under it, in the same chalk: “Gone up for a breath of air. Back soon.”', effects: [{ unlockLore: 'lore:hc-ash-capital-tally' }], next: null } },
  },
  {
    id: 'dialogue:obj-ash-capital-view-find', name: 'Kilnhold viewpoint: the city’s smoke', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'From the viewpoint the smoke of Kilnhold lies below you like a grey sea, and the Great Kiln’s chimney stands up out of it like a lighthouse. Somebody has left a brass plate on the rail: “On a clear day you can see the Cinder Gate. There has not been a clear day since C. 1012.”', effects: [{ unlockLore: 'lore:hc-ash-capital-view' }], next: null } },
  },
  // ======================= ACT II, C-1 Kilnmouth: the cold kiln, the road in
  {
    id: 'dialogue:area-arcanist-kilnmouth-road', name: 'C-1 banter: the road to Kilnmouth', bark: true,
    entries: [{ when: stage('quest:arcanist-kilnmouth', 'ada'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'The road down into the Ashfall smells of home: hot stone, coal-smoke, something burning that should not be. Your half-stone hums the first bar of a Kilnhold work-song.', next: null } },
  },
  {
    id: 'dialogue:obj-arcanist-kilnmouth-kiln', name: 'C-1 the cold kiln of Kilnmouth', scope: 'party',
    entries: [{ when: stage('quest:arcanist-kilnmouth', 'kiln'), node: 'kiln' }, { node: 'plain' }],
    nodes: {
      kiln: { speaker: 'narrator', text: 'A copy of the Great Kiln, a third of the size, built brick for brick by people who could only remember it. It has never been lit. Every Ash-folk child in Kilnmouth has climbed inside it at least once, to see what home was like.', next: 'warm' },
      warm: {
        speaker: 'narrator', text: 'You put your hand on the cold brick. Your half-stone sings, and for a moment the whole kiln glows from inside, gold, and somewhere behind you a woman makes a sound like she has been punched.',
        choices: [
          { text: '(Hold it as long as you can.)', to: 'hold', effects: [{ setFlag: 'arcanist.kilnmouth_lit', value: true }] },
          { text: '(Let it go. It isn’t yours to light.)', to: 'let' },
        ],
      },
      hold: { speaker: 'npc:forgewife-ada', mood: 'happy', text: '(Ada, behind you, very quietly.) Thirty years. Thirty years, and it looked like that for the length of a breath. Don’t you dare say sorry when it goes out. It was enough.', next: null },
      let: { speaker: 'npc:forgewife-ada', text: '(Ada, behind you.) No. You’re right. When we light it, we’ll light it ourselves, at home, the real one. But thank you for showing the children what it looks like.', next: null },
      plain: { speaker: 'narrator', text: 'The cold copy of the Great Kiln, in the middle of Kilnmouth.', next: null },
    },
  },

  // ======================= ACT II, C-2 Ashmaw’s Breath: escorting Ada to the vent head
  {
    id: 'dialogue:arcanist-ada-vents', name: 'C-2 Ada reads the breath at the vent head', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:forgewife-ada', text: '(She kneels at the vent head, where the three breath-vents come up out of the ash, and holds her palm over each one in turn, the way a smith reads a forge.) Hot. Hotter. And this one is weeping.', next: 'read' },
      read: {
        speaker: 'npc:forgewife-ada', mood: 'afraid', text: 'Ashmaw’s breath was clean for a thousand years. We cooked on it, we tempered on it, we warmed our babies on it. Now it comes up black, and it comes up in time, like breathing. Like it’s waking up.',
        choices: [
          { text: 'Then I’ll go down and see.', to: 'down', quest: true },
          { text: 'Thank you for coming this far.', to: 'thanks', trust: 1 },
        ],
      },
      thanks: { speaker: 'npc:forgewife-ada', text: 'Thirty years I’ve wanted to see what’s at the bottom of this. I’m too old to go the rest of the way. That’s what you’re for.', next: 'down' },
      down: { speaker: 'npc:forgewife-ada', text: 'Follow the three vents to where they meet. Mind its tail. It doesn’t know it’s dying.', next: null },
    },
  },

  // ======================= ACT II, C-3 Ashmaw: telling Ada
  {
    id: 'dialogue:arcanist-ada-ashmaw', name: 'C-3 Ada hears Ashmaw is at rest', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:forgewife-ada', text: 'The breath stopped an hour ago. Every forge in Kilnmouth went out at once. (She is holding a cold poker like a sword.) Tell me.', next: 'tell' },
      tell: {
        speaker: 'npc:forgewife-ada', mood: 'sad', text: '(You tell her: the beast, the black, the last breath, the mark.) A thousand years of lighting torches for a crown, and it ended under our kilns with a stranger sitting by it. Well. Better a stranger from home.',
        choices: [
          { text: 'It wasn’t alone at the end.', to: 'alone', trust: 1 },
          { text: 'The forges will need new fire.', to: 'fire' },
        ],
      },
      alone: { speaker: 'npc:forgewife-ada', text: 'No. No, it wasn’t. I’ll tell the children that. Ash-folk don’t die alone; it’s the one rule we’ve kept.', next: 'fire' },
      fire: { speaker: 'npc:forgewife-ada', text: 'We’ll burn coal like everybody else. It’ll be cold for a while. (She looks at the cold copy of the Great Kiln.) We’ve had practice.', next: null },
    },
  },

  // ======================= ACT II, C-4 The Provost’s Smoke: the chimneys of Gildport
  ...[
    'The first chimney of the Gilded Ruins, breathing a smoke so black it is nearly purple. It smells of salt and wet brick, exactly like the old flue at the bottom of the Kiln Roots.',
    'A Sparkwright pressure gauge bolted to the second chimney, its needle pinned past the red. Someone has scratched a tally beside it in a neat clerk’s hand: one mark a day, for forty days.',
    'At the foot of the third chimney, a fuel barrel, half buried in gold dust and stamped with a seal you know from every permit in the Kiln Ward. The Provost’s. It is empty, and still warm.',
  ].map((text, i): DialogueDef => clue(`arcanist-gild-smoke-${i + 1}`, `C-4 the Provost’s smoke (${i + 1})`, stage('quest:arcanist-the-provosts-smoke', 'smoke'),
    text, `arcanist.gild_smoke_${i + 1}`, 'A chimney of the Gilded Ruins, smoking.')),

  // ======================= ACT II, C-5 The Gilded Engine: the half-made setting
  clue('arcanist-engine-setting', 'C-5 the half-made setting', stage('quest:arcanist-the-gilded-engine', 'setting'),
    'In the Engine’s cooling forge-bed lies a setting, half made: a ring of gold claws, sized not for a stone but for a human heart. Pinned beside it, measurements, in a neat and loving hand you have seen on a ledger page and an unsent letter. Width of a chest. Width of a man.', 'arcanist.engine_setting',
    'The Engine’s forge-bed, cold.', 'He means to wear it. He means to set the Kiln half in his own chest and never be cold again.'),

  // ======================= ACT II, C-6 A Letter from Thrane: the reply
  {
    id: 'dialogue:obj-arcanist-pigeon-post', name: 'C-6 the soot-pigeon waiting for a reply', scope: 'party',
    entries: [{ when: stage('quest:arcanist-a-letter-from-thrane', 'reply'), node: 'bird' }, { node: 'plain' }],
    nodes: {
      bird: { speaker: 'narrator', text: 'On the Ash arch sits one of Dilly Coop’s soot-pigeons, grey with Kilnhold, very tired and very determined. It has a little empty tube on its leg and it is looking at you pointedly.', next: 'write' },
      write: {
        speaker: 'narrator', text: 'You have a stub of pencil and the back of Thrane’s letter. What do you send home?',
        choices: [
          { text: '“Ashmaw is at rest. I’m coming for Ignace. Keep the kettle on.”', to: 'sent', effects: [{ setFlag: 'arcanist.reply', value: 'kettle' }] },
          { text: '“I found him. I still don’t know if I can stop him. Tell me what fire is for.”', to: 'sent', effects: [{ setFlag: 'arcanist.reply', value: 'question' }] },
          { text: '(Draw Pudding, badly, and nothing else.)', to: 'sent', when: { flag: 'arcanist.pudding_pet' }, effects: [{ setFlag: 'arcanist.reply', value: 'pudding' }] },
        ],
      },
      sent: { speaker: 'narrator', text: 'The pigeon takes the tube, looks at the arch, looks at you, and goes, straight up into the dusk and over the stone, home. You watch until you can’t see it.', next: null },
      plain: { speaker: 'narrator', text: 'The Ash arch, shut again, with a little grey feather caught in the carving.', next: null },
    },
  },

  // ======================= ACT III, Ignace’s Apprentice: the ledger’s last page
  clue('arcanist-lissa-ledger', 'Ignace’s Apprentice: the ledger’s last page', stage('quest:arcanist-ignaces-apprentice', 'ledger'),
    'Lissa’s ledger, where it fell. Forty pages of “tincture, black” in her careful hand. The last page is not hers. It is his, written small at the foot, the night before he walked into the Heart: “If I do not come back, Lissa is to be sent home to Kilnhold. None of this is hers. — I. M.”', 'arcanist.lissa_ledger',
    'A dropped ledger in the Legion camp.'),
  {
    id: 'dialogue:arcanist-lissa-page', name: 'Ignace’s Apprentice: Lissa reads the last page', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:lissa-marl', text: '(She reads it twice, the way Ashworth taught all the clerks to.) He wrote that. He wrote that the night before. He knew he wasn’t coming back, and he thought of me.', next: 'cry' },
      cry: {
        speaker: 'npc:lissa-marl', mood: 'sad', text: 'I don’t know whether to hate him. I wrote down everything he did. Every measure. I knew what it was. I told myself it was for the Kiln.',
        choices: [
          { text: 'You can hate him and still be glad he wrote it.', to: 'both', trust: 1 },
          { text: 'You were his apprentice. He was the one who should have known better.', to: 'better' },
        ],
      },
      both: { speaker: 'npc:lissa-marl', text: '(She almost laughs.) Both. Yes. That’s very Kilnhold of you. (She folds the page and keeps it.) I’m going home. I’m going to ask Old Ambrose if he needs anyone to count stars.', next: null },
      better: { speaker: 'npc:lissa-marl', text: 'He was. He did. He wrote it down, at the end. (She folds the page and keeps it.) I’m going home. I think I’ll count something nicer, next time.', next: null },
    },
  },
];

export default dialogues;
