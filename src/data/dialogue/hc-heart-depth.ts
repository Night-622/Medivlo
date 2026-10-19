/**
 * Hollow Crown, shared Act III depth pass (10-campaign-style.md §8, docs/PACING.md): the new Heart stages’ scenes.
 * Every class plays these. The five who follow the bearers (Maren, Godric, Ysolde, Pip, Sela) are at the camp. Owner: Claude 4.
 */
import type { DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const MA = 'npc:maren' as const, GO = 'npc:godric' as const, YS = 'npc:ysolde' as const, PI = 'npc:pip' as const, SE = 'npc:sela' as const;

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
  // ======================= III-1 The Weeping Wall: the night at the bearers’ fires
  {
    id: 'dialogue:obj-heart-camp-fire', name: 'III-1 the bearers’ fires', scope: 'party',
    entries: [{ when: stage('quest:heart-wall', 'fires'), node: 'fires' }, { node: 'plain' }],
    nodes: {
      fires: { speaker: 'narrator', text: 'The night before the Wall, the camp at the Heart’s edge is a ring of small fires, one for every school that has come. In the dark beyond them, the Weeping Wall makes a sound like rain that never reaches the ground.', next: 'pip' },
      pip: { speaker: PI, text: 'I’m not scared. I want that written down. Ysolde, write it down. Pip was not scared. (He is holding his wooden sword so tightly his knuckles are white.)', next: 'ysolde' },
      ysolde: { speaker: YS, text: 'I am writing everything down, Pip. That is what I am for. (She is, by lantern-light, in a book on her knee.) Somebody should remember the night before, as well as the day.', next: 'maren' },
      maren: {
        speaker: MA, text: 'My mother walked into that Wall thirty years ago. Into the Legion. I’ve hunted every wolf in the Gloamwood and I’ve never once come this close. (She looks at you.) What are you afraid of, {class}?',
        choices: [
          { text: 'That I won’t be enough.', to: 'enough' },
          { text: 'That I’ll have to hate whatever’s in there.', to: 'hate' },
          { text: 'Nothing. Not tonight.', to: 'nothing' },
        ],
      },
      enough: { speaker: GO, text: 'Nobody is ever enough on their own. That is why there are twelve schools, and a ring, and a crown that has to be passed. Sit closer to the fire. The others will need you as much as you need them.', next: 'sela' },
      hate: { speaker: GO, mood: 'sad', text: 'Ah. Yes. That is the right thing to be afraid of. Nan Briar would tell you not to. Nan Briar is usually right. It is very irritating.', next: 'sela' },
      nothing: { speaker: MA, mood: 'happy', text: '(She laughs, properly, for the first time since the Wall came into sight.) Liar. Good. Somebody should be, tonight.', next: 'sela' },
      sela: { speaker: SE, text: '(Sela holds up her compass. The needle is trembling.) It has always pointed here. My whole life. I think it was never pointing at a place. I think it was pointing at someone who was waiting.', next: 'end' },
      end: { speaker: 'narrator', text: 'One by one the fires burn down. Nobody sleeps very much. In the morning, every half-stone in the camp is singing the same note, very softly, towards the Wall.', effects: [{ setFlag: 'story.heart_eve', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The bearers’ fires, banked low.', next: null },
    },
  },

  // ======================= III-2 The Legion Camp: the muster roll
  beat('heart-legion-roll', 'III-2 the Legion’s muster roll', stage('quest:heart-legion', 'roll'),
    'Nailed to a post at the heart of the camp, a muster roll, the kind every army keeps. It is thirty years long. Name after name, from every school, every realm, each with the day they walked into the Wall. Not one of them is crossed out. The Legion never lost anyone. It only ever took them in.',
    'story.legion_roll', 'A muster roll on a post, thirty years long.', 'Near the top, in the first week, a woman’s name in a careful hand: Ottilie Hollis, of Brindlecross. Huntress.'),

  // ======================= III-5 The Citadel: its halls
  ...[
    'The Turning hall, still laid for a feast. Thirty years of dust lie on the plates. At the head of the long table there are two chairs, side by side: one for whoever brought the crown, one for whoever it was being passed to. The second chair is pushed back, as if someone stood up very suddenly.',
    'A gallery of portraits: every Concordant who ever wore the crown and passed it on, eighty-four of them, each painted on the day they gave it up, and every one of them smiling with relief. The last frame is empty. There is a nail in the wall where it should hang.',
    'A guard post outside the throne room: a stool, a halberd rack, and an empty hook where a helmet once hung. Scratched into the doorframe at a young man’s height, in a boy’s hand: G.',
  ].map((text, i): DialogueDef => beat(`heart-citadel-hall-${i + 1}`, `III-5 the Citadel halls (${i + 1})`, stage('quest:heart-citadel', 'halls'),
    text, `story.citadel_hall_${i + 1}`, 'A Citadel hall, deep in dust.')),

  // ======================= Side: Maren’s Mother (the pelt)
  {
    id: 'dialogue:obj-heart-maren-pelt', name: 'Maren’s Mother: the pelt', scope: 'party',
    entries: [{ when: stage('quest:heart-marens-mother', 'pelt'), node: 'pelt' }, { node: 'plain' }],
    nodes: {
      pelt: { speaker: 'narrator', text: 'At the camp’s edge, Maren is standing over a small fire with the wolf pelt across her shoulders, the one she has worn since the first wolf came back wrong. Her mother is asleep in the tent behind her.', next: 'maren' },
      maren: {
        speaker: MA, text: 'I wore it so I wouldn’t forget what I was hunting. I was hunting her. Every wolf, every year, I was hunting the thing that took her. (She takes it off.) I don’t need to remember any more. She’s here.',
        choices: [
          { text: '(Help her lay it on the fire.)', to: 'burn', trust: 1 },
          { text: 'Keep it. It kept you going.', to: 'keep' },
        ],
      },
      burn: { speaker: 'narrator', text: 'It burns slowly, and then all at once. Maren watches until there is nothing left but ash, and then she goes into the tent and sits down by her mother, and does not come out until morning.', effects: [{ setFlag: 'story.maren_pelt', value: 'burned' }], next: null },
      keep: { speaker: MA, text: '(She thinks about it.) No. You’re right. It did. (She folds it, carefully, and puts it under her mother’s head for a pillow.) There. Now it’s for something else.', effects: [{ setFlag: 'story.maren_pelt', value: 'pillow' }], next: null },
      plain: { speaker: 'narrator', text: 'A small fire at the camp’s edge, burned down.', next: null },
    },
  },

  // ======================= Side: What Godric Saw (the helmet)
  beat('heart-godric-helmet', 'What Godric Saw: a trophy in the Legion camp', stage('quest:heart-what-godric-saw', 'helmet'),
    'Among the Legion’s trophies, hung on a spear, a Citadel guard’s helmet, a young man’s size. Inside the rim, scratched in a boy’s hand: G. Someone took it from the throne room door thirty years ago and kept it, the way an army keeps the banner of the first enemy it ever beat.',
    'story.godric_helmet', 'A spear in the Legion camp, with nothing on it now.'),
  {
    id: 'dialogue:heart-godric-helmet', name: 'What Godric Saw: the helmet returned', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: GO, text: '(He turns it over in his hands for a long time.) I hung it on the hook. That night. When he started to scream, I took my helmet off, and I hung it up, and I walked away from the door. I have never once been able to tell anyone why.', next: 'boy' },
      boy: {
        speaker: GO, mood: 'sad', text: 'I was nineteen. I could not bear to hear it, so I left him alone with it. I have thought about it every night for thirty years. If I had gone in instead of away, would he still be screaming?',
        choices: [
          { text: 'He’d have found another night.', to: 'another' },
          { text: 'You did what a kind boy would do. Now come and finish it.', to: 'finish', trust: 1 },
        ],
      },
      another: { speaker: GO, text: 'Yes. Probably. That is what Ysolde says. It is a comfort that has never once comforted me. (He puts the helmet on. It still fits, nearly.) There.', next: null },
      finish: { speaker: GO, mood: 'happy', text: '(He puts the helmet on. It still fits, nearly.) Then I shall stand at the door this time, {class}. All the way to the end. Somebody should.', effects: [{ setFlag: 'story.godric_door', value: true }], next: null },
    },
  },

  // ======================= III-3 The Twelve Stairs: the bearers at the foot (how many you gathered shows here)
  {
    id: 'dialogue:obj-heart-stairs-foot', name: 'III-3 the foot of the Twelve Stairs', scope: 'party',
    entries: [
      { when: { all: [stage('quest:heart-stairs', 'foot'), { flag: 'story.bearers_gathered', op: '>=', value: 6 }] }, node: 'full' },
      { when: stage('quest:heart-stairs', 'foot'), node: 'thin' },
      { node: 'plain' },
    ],
    nodes: {
      full: { speaker: 'narrator', text: 'Twelve school stones stand in a row at the foot of the stairs, and there is somebody beside nearly every one: bearers you found on the road, at the Stone Court, in the Legion’s cages. They have been waiting for you without saying so.', next: 'ysolde' },
      thin: { speaker: 'narrator', text: 'Twelve school stones stand in a row at the foot of the stairs. Beside a few of them stand the bearers you found on the way. Beside the rest there is nobody, and the bearers keep glancing at the empty ones, as if somebody might only be late.', next: 'ysolde' },
      ysolde: { speaker: YS, text: 'In the Concord the order was written down: Ash first, because fire wakes first, and the rest by the calendar. (She shuts her book.) Nobody has climbed these in thirty years. I don’t think the stairs will mind who goes first.', next: 'pip' },
      pip: { speaker: PI, text: 'I’ll go first. (Nobody moves.) I said I’ll go first. Somebody hold my sword.', next: 'maren' },
      maren: {
        speaker: MA, text: 'Nobody’s holding your sword, Pip. (To you.) They’re all looking at you, {class}. You opened the road. Say something before we go up, and keep it short. My knees won’t wait.',
        choices: [
          { text: 'Every stone up there was carried here by somebody. Let’s carry them the last bit.', to: 'carried' },
          { text: '{mentor} would tell us to stop talking and climb.', to: 'mentor' },
          { text: 'Thirty years ago people climbed these and never came down. We will.', to: 'down' },
          { text: 'Pip goes first.', to: 'pipfirst' },
        ],
      },
      carried: { speaker: GO, text: 'Somebody carried the crown up these, once, and I stood at the top and watched. (He puts his hand on the nearest stone.) It was heavier than it looked. They always are.', next: 'go' },
      mentor: { speaker: SE, text: 'Then {mentor} is right, and we are all wasting the light. (She taps her compass. The needle is pointing straight up.) Even this agrees.', next: 'go' },
      down: { speaker: MA, text: 'We will. (Quietly.) I’m holding you to that. I’ve done enough waiting at the bottom of things.', next: 'go' },
      pipfirst: { speaker: PI, text: 'Really? (He looks up the stair, which is very long.) Right. Right. Yes. Somebody hold my… no. I’ll hold it.', next: 'go' },
      go: { speaker: 'narrator', text: 'One by one the bearers go to their own stones. The half-stones in their packs start up, faint and unsure, like a choir that has not sung together in thirty years and is waiting for somebody to give the note. Yours is the loudest. It knows the way.', next: null },
      plain: { speaker: 'narrator', text: 'Twelve school stones in a row at the foot of the Twelve Stairs, each worn smooth on top where a thousand years of bearers put a hand on it before they climbed.', next: null },
    },
  },
];

export default dialogues;
