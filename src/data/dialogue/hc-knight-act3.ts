/** Hollow Crown, KNIGHT Act III: the nemesis remade, the mentor’s last request and the Heart side quests. Owner: Claude 4. */
import type { DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const GM = 'npc:gideon-marke' as const, KB = 'npc:konrad-berenikson' as const, JA = 'npc:joss-ashlar' as const, BS = 'npc:blank-shield' as const;
const VOTE = (value: string): NarrativeCondition => ({ flag: 'knight.colossus_vote', value });

const dialogues: DialogueDef[] = [
  // ---------- III-4 The Iron Head: Konrad's fate
  {
    id: 'dialogue:knight-herald-fate', name: 'III-4 the Iron Head: Konrad’s fate', scope: 'party',
    entries: [{ when: VOTE('march'), node: 'march' }, { node: 'kneel' }],
    nodes: {
      march: { speaker: KB, mood: 'hollow', text: 'Captain! My captain. You voted to march, and look: we marched. All the way to the top of the stairs. Why on earth are you stopping now?', next: 'plate' },
      kneel: { speaker: KB, mood: 'hollow', text: 'Squire. Ser. Whichever. Have you eaten? You look dreadful. I expect I look dreadful too. There are no mirrors inside a Chimera, I’ve checked.', next: 'plate' },
      plate: {
        speaker: KB, mood: 'sad', text: '(The great iron head is his own face, grown huge, in his grandmother’s helm. Her shield has grown into his arm.) I asked to be bound. I wanted to be the apology the size of a mountain. Now I am one, and I can’t stop saying sorry.',
        next: 'choose',
      },
      choose: {
        speaker: KB, text: 'It never ends. How did she bear it? How did any of you? (Berenika’s visor grinds down over his face. Behind it, he waits for you to decide what he is.)',
        choices: [
          {
            text: 'You were four, Konrad. This was never yours to carry. (Spare him.)', to: 'spare', quest: true,
            when: { any: [VOTE('writ'), { trust: GM, value: 'trusted' }] },
            lockedLabel: 'You need the Queen’s writ read to the Council, or Ser Gideon’s trust',
            effects: [{ setFlag: 'knight.nemesis_fate', value: 'spared' }],
          },
          { text: 'Then let me end it for you. (Strike the iron head.)', to: 'destroy', quest: true, effects: [{ setFlag: 'knight.nemesis_fate', value: 'destroyed' }] },
        ],
      },
      spare: {
        speaker: 'narrator', text: 'You lower your sword. The iron head watches you do it, and does not understand.',
        choices: [
          { text: '(Read him the Queen’s writ, as you read it to the Council.)', to: 'writ', when: VOTE('writ') },
          { text: '(Stand aside. Someone is climbing the Iron stair behind you.)', to: 'gideon', when: { trust: GM, value: 'trusted' } },
        ],
      },
      writ: { speaker: 'narrator', text: '“He cannot hear the stones, so he cannot want them. Let him hold it one night: he has never held anything.” You read it slowly. On the stair, nothing moves but the black.', next: 'writ2' },
      writ2: { speaker: KB, mood: 'sad', text: '“He has never held anything.” (A long silence.) She wrote that about him. She could have written it about me. I have only ever held her armour.', next: 'fall' },
      gideon: {
        speaker: 'narrator', text: 'Hooves on the stair, impossibly, and then boots. Ser Gideon Marke, grey-cloaked, with no spurs on his heels, climbs the last step and walks straight past you, between Konrad and your sword.',
        effects: [{ setFlag: 'knight.gideon_came', value: true }], next: 'gideon2',
      },
      gideon2: { speaker: GM, text: 'Highness. On the night of the Hollowing I carried the crown in, and I bowed to the man who emptied it, and I was proud of my bow. That is mine. It was never yours. Give it back to me.', next: 'gideon3' },
      gideon3: { speaker: GM, mood: 'sad', text: 'I wrote that I would wait in Anvilgate. It turns out I am a liar as well. Put it down, boy. I have been carrying it for thirty years. I know exactly where it goes.', next: 'fall' },
      fall: { speaker: 'narrator', text: 'Plate by plate, Berenika’s armour lets go of him, and rings on the stair like dropped bells. What is left kneeling on the Iron stair is a golden-haired man in his shirt, shivering, who looks about forty and about four.', next: 'thanks' },
      thanks: { speaker: KB, mood: 'happy', text: 'I’m so sorry. (He laughs, wetly.) No. No, I am not going to say that any more. Thank you. That is much harder. Thank you.', next: null },
      destroy: { speaker: 'narrator', text: 'One stroke, on the iron brow. Berenika’s helm rings once like a struck bell, and goes quiet, and the Chimera’s head bows to the stair. Behind the visor, Konrad is smiling.', next: 'destroy2' },
      destroy2: { speaker: KB, mood: 'sad', text: 'Was I magnificent? (He does not wait for the answer.) Put my name on the roll, would you? Not blanked. Gold and black. It suits everyone.', next: null },
    },
  },
  // ---------- Spurs on the Stair (the mentor's last request): the courier at the Heart camp
  {
    id: 'dialogue:knight-courier-heart', name: 'Spurs on the Stair: the courier at the Heart', scope: 'party',
    entries: [
      { when: { all: [stage('quest:knight-spurs-on-the-stair', 'courier'), { flag: 'knight.gideon_came' }] }, node: 'came' },
      { when: stage('quest:knight-spurs-on-the-stair', 'courier'), node: 'arrive' },
      { node: 'rest' },
    ],
    nodes: {
      arrive: { speaker: JA, text: 'Courier Ashlar, Wall post. Forty gates, a Colossus, the whole of Concordia and a wall made of crying, ser, and I’ve still got one penny. One letter, from Ser Gideon. And a parcel.', next: 'letter' },
      came: { speaker: JA, mood: 'happy', text: 'Courier Ashlar, Wall post. He overtook me, ser! Ser Gideon, at the Weeping Wall, at a gallop, on a horse with no business galloping. He shouted that I was still to give you this, because it took him a month.', next: 'letter' },
      letter: { speaker: GM, text: '“Ser Knight. Leave my spurs on the top step of the Twelve Stairs, before the Citadel doors. I carried the crown up those stairs and in through those doors. I would like the spurs to finish the walk without me. G.”', next: 'spurs' },
      spurs: {
        speaker: JA, text: 'And there’s the other thing, ser. He said you’d know about the other thing.',
        choices: [
          { text: '(Show him the spurs on your belt. You have carried them since the Barrow well.)', to: 'carried', when: { flag: 'knight.gideon_devotable' } },
          { text: '(Take the parcel.)', to: 'parcel', when: { not: { flag: 'knight.gideon_devotable' } } },
        ],
      },
      carried: { speaker: JA, text: 'Oh, you’ve got them. He said you would. He said, “Ser {player.name} has had them for months and has never once asked me why.” He seemed to think that was a compliment.', effects: [{ giveItem: 'i_gideons_spurs' }], next: null },
      parcel: { speaker: JA, text: 'His spurs, ser, green as a pond. He went down the Barrow well for them himself, on a rope, at his age. Came up wet to the eyebrows and laughing. The Chapterhouse still hasn’t recovered.', effects: [{ giveItem: 'i_gideons_spurs' }], next: null },
      rest: { speaker: JA, text: 'Resting my feet, ser. Forty gates’ worth of resting. Don’t tell the Wall post.', next: null },
    },
  },
  {
    id: 'dialogue:obj-knight-iron-stair-step', name: 'Spurs on the Stair: the top step', scope: 'party',
    entries: [
      { when: { all: [stage('quest:knight-spurs-on-the-stair', 'step'), { flag: 'knight.gideon_devotable' }] }, node: 'devoted' },
      { when: stage('quest:knight-spurs-on-the-stair', 'step'), node: 'leave' },
      { node: 'step' },
    ],
    nodes: {
      leave: {
        speaker: 'narrator', text: 'You set Ser Gideon’s spurs on the top step of the Iron stair, before the Citadel doors, rowels to the stone. One of them turns, and squeaks, and stops. After thirty years, it stops.',
        effects: [{ setFlag: 'knight.spurs_left', value: true }, { takeItem: 'i_gideons_spurs' }], next: null,
      },
      devoted: { speaker: 'narrator', text: 'You set Ser Gideon’s spurs on the top step of the Iron stair, before the Citadel doors. The rowel you heard turn at the bottom of the Barrow well turns once more, and stops.', next: 'devoted2' },
      devoted2: {
        speaker: 'narrator', mood: 'happy', text: 'You do not see his face when it is done. You do not need to. Somewhere below these stairs, an old knight puts down something he has carried for thirty years, and finds that he can stand up straight.',
        effects: [{ setFlag: 'knight.spurs_left', value: true }, { takeItem: 'i_gideons_spurs' }, { trust: GM, set: 5 }], next: null,
      },
      step: { speaker: 'narrator', text: 'The top step of the Iron stair, before the Citadel doors. A pair of old spurs sits on it, green with well-water, perfectly still.', next: null },
    },
  },
  // ---------- The Regent's Regiment (the Legion camp)
  {
    id: 'dialogue:obj-knight-hollow-regiment', name: 'The Regent’s Regiment', scope: 'party',
    entries: [
      { when: { all: [stage('quest:knight-the-regents-regiment', 'roll'), VOTE('march')] }, node: 'march' },
      { when: { all: [stage('quest:knight-the-regents-regiment', 'roll'), VOTE('wall')] }, node: 'wall' },
      { when: stage('quest:knight-the-regents-regiment', 'roll'), node: 'household' },
      { when: stage('quest:knight-the-regents-regiment', 'blank'), node: 'nameless' },
      { when: stage('quest:knight-the-regents-regiment', 'case'), node: 'waiting' },
      { node: 'gone' },
    ],
    nodes: {
      march: { speaker: 'narrator', text: 'Your regiment. Konrad’s gold and black in ranks of forty, banners up, standing hollow in the Legion camp exactly as they stood on the parade ground at Anvilgate. They are waiting for their captain. You are their captain.', next: 'blank' },
      wall: { speaker: 'narrator', text: 'Grey tabards of the Order of the Anvil: the knights who voted to wall the Colossus in, and then could not bear it, and went through the gate after Konrad to bring him home. They stand hollow, at attention, guarding nothing.', next: 'blank' },
      household: { speaker: 'narrator', text: 'Konrad’s household knights, in gold and black. They followed him out of the Council hall without a word, and kept on following, all the way here. They are standing in his colours, hollow, waiting for him to come back.', next: 'blank' },
      blank: {
        speaker: 'narrator', mood: 'sad', text: 'Every shield in the rank is blank. One by one, in the Heart, they have scraped off their own arms. You have the roll of arms. It has all of them in it.',
        choices: [
          { text: '(Open the roll of arms, and read each of them home by name.)', to: 'names' },
          { text: '(Strike your shield three times, the Order’s muster. Then read the roll.)', to: 'muster', school: 'iron' },
        ],
      },
      nameless: { speaker: 'narrator', text: 'Ironhold knights, a whole rank of them, standing hollow in the Legion camp in their colours. Every shield is scraped blank to the bare metal. You walk the line and look for one face you know, one crest, one name. There is nothing to read.', next: 'nameless2' },
      nameless2: { speaker: 'narrator', mood: 'sad', text: 'You cannot call a knight home without a name. But a regiment never marches without its roll of arms in the colour-case, and none of them is carrying it.', next: null },
      waiting: { speaker: 'narrator', text: 'The rank of blank shields, at attention, guarding nothing.', next: null },
      muster: { speaker: 'narrator', text: 'Three strokes, iron on iron. Every head in the rank comes up at once, the way squires’ heads come up when the Chapter-Master walks in.', next: 'names' },
      names: { speaker: 'narrator', text: 'Ser Piers Wrenfield, of the Hammer and Pear. Dame Imelda Stour, of the Three Nails. Name after name. At each one, a crest swims up through the black on a shield, and a knight lowers it, and blinks at the Heart like someone waking in a strange inn.', next: 'ease' },
      ease: { speaker: 'narrator', mood: 'happy', text: 'When the last name is read, the whole rank does something Ironhold has not done in thirty years. It stands at ease.', next: null },
      gone: { speaker: 'narrator', text: 'Where the rank stood, a neat row of painted shields, propped against each other to dry.', next: null },
    },
  },
  // ---------- The Blank Shield's Crest (an Act I loose end)
  {
    id: 'dialogue:knight-blank-shield', name: 'The Blank Shield’s Crest', scope: 'party',
    entries: [
      { when: stage('quest:knight-the-blank-shields-crest', 'camp'), node: 'camp' },
      { when: { all: [stage('quest:knight-the-blank-shields-crest', 'stair'), VOTE('wall')] }, node: 'order' },
      { when: stage('quest:knight-the-blank-shields-crest', 'stair'), node: 'post' },
      { when: stage('quest:knight-the-blank-shields-crest', 'sword'), node: 'mime' },
      { node: 'watch' },
    ],
    nodes: {
      camp: { speaker: 'narrator', text: 'Between two tents at the Heart camp, trying very hard not to be noticed, stands an empty suit of armour with a small plain anvil on its breastplate. Its feet are worn nearly through. It has walked from Anvilgate.', next: 'ask' },
      ask: {
        speaker: BS, text: '(It salutes you. Then it points up the road, past the Legion, to where the Iron stair climbs towards the Citadel. Then at itself. Then at the stair again, more firmly.)',
        choices: [
          { text: 'You want to stand guard on the Iron stair.', to: 'yes' },
          { text: '(Hold up your shield. Your arms are its arms: a plain anvil.)', to: 'twin', when: { flag: 'knight.arms', value: 'anvil' } },
        ],
      },
      twin: { speaker: 'narrator', text: 'It looks at your anvil for a long moment. Then, very carefully, it taps its own anvil against yours. Iron on iron. It is the happiest sound you have ever heard a suit of armour make.', next: 'yes' },
      yes: { speaker: BS, mood: 'happy', text: '(It nods so hard its helm rattles. Then it sets its feet, grounds a sword it does not have, and looks down at its empty hands, puzzled, as if it had only just noticed.)', next: null },
      mime: { speaker: BS, text: '(It grounds an invisible sword, very correctly, and looks at you. Then at its empty hands. Then, meaningfully, towards the Legion camp.)', next: null },
      order: { speaker: 'narrator', text: 'The Order’s knights are holding the Iron stair, as the Council once voted to hold a wall. As the Blank Shield climbs past them, each of them salutes it. It is not sure what to do. It salutes back, all of them, twice.', next: 'post' },
      post: {
        speaker: 'narrator', text: 'At the top of the Iron stair the Blank Shield takes its place by the last step, sets its feet, grounds the plain sword you found for it, and stands.',
        choices: [
          { text: 'Stand your watch, ser.', to: 'ser' },
          { text: '(Kneel beside it, and keep the first hour of its watch.)', to: 'hour', school: 'iron' },
        ],
      },
      ser: { speaker: 'narrator', text: 'Ser. Nobody has ever called it anything before. It stands a little straighter, which you would not have thought possible.', next: null },
      hour: { speaker: 'narrator', mood: 'sad', text: 'You kneel at the top of the Iron stair until your knees hurt, which seems right. Ser Roswitha kept her watch alone for thirty years. This one will not have to.', next: null },
      watch: { speaker: BS, text: '(The Blank Shield stands at the top of the Iron stair, on watch. It does not turn its head as you pass, but its anvil catches the light.)', next: null },
    },
  },
];

export default dialogues;
