/** Hollow Crown, BARD Act III: the nemesis remade, the mentor’s last request and the Heart side quests. Owner: Claude 4. */
import type { DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const RV = 'npc:rosalind-vell' as const, BM = 'npc:blaise-marchetti' as const, TB = 'npc:old-tobble' as const;
const SONGBOOK = (v: string): NarrativeCondition => ({ flag: 'bard.songbook', op: '==', value: v });
/** Rosalind's Aria, read in the surgeons' tent (hc-bard-depth.ts): Clemency's changed last line */
const CLEMENCY: NarrativeCondition = { flag: 'bard.aria_words', op: '==', value: 'clemency' };

/** I-2's overture style: one hollow busker in the Legion, one bought song given back */
const bought = (n: number, find: string, back: string, plain: string): DialogueDef => ({
  id: `dialogue:obj-bard-bought-song-${n}`, name: `The Bought Songs: busker ${n}`, scope: 'party',
  entries: [{ when: stage('quest:bard-the-bought-songs', 'buskers'), node: 'find' }, { node: 'plain' }],
  nodes: {
    find: { speaker: 'narrator', text: find, next: 'back' },
    back: { speaker: 'narrator', text: back, next: null },
    plain: { speaker: 'narrator', text: plain, next: null },
  },
});

const ARIA = 'At the head of the Song stair, under the banner the colour of lilac again, you unfold Clemency’s pages. The aria the Daughter sings in the dark, when the light goes out, to bring the ship home. All twelve stairs go quiet to hear it.';

const dialogues: DialogueDef[] = [
  // ---------- III-4 The Last Performance: Marchetti's fate
  {
    id: 'dialogue:bard-herald-fate', name: 'III-4 the Last Performance: Marchetti’s fate', scope: 'party',
    entries: [
      { when: SONGBOOK('lastnight'), node: 'kneel-lastnight' },
      { when: SONGBOOK('taught'), node: 'kneel-taught' },
      { node: 'kneel' },
    ],
    nodes: {
      kneel: { speaker: BM, mood: 'hollow', text: 'Brava. You have beaten the orchestra, darling. But listen: the song is still playing. It cannot stop. I wrote it so that it cannot. (The baton-tail beats time on the stair.) Your Conservatory locked its songs in a box. I only did it beautifully.', next: 'choose' },
      'kneel-lastnight': { speaker: BM, mood: 'hollow', text: 'Brava. And you of all people understand. You sang every song in Lyrehaven once and let it go. Once, forever. That is all this is. (The baton-tail beats time on the stair.) We want the same thing, you and I. Sit with me and listen to it not end.', next: 'choose' },
      'kneel-taught': { speaker: BM, mood: 'hollow', text: 'Brava. Do you hear it? There is a crack in my song now, a little one, where you gave every tune away and I could not buy them back. (The baton-tail stumbles, and finds the beat again.) It has bothered me all the way here.', next: 'choose' },
      choose: {
        speaker: BM, mood: 'sad', text: '(Behind him the Chimera’s great stitched body plays on, every song he ever bought at once, with no double bar.) Well, darling? It is your cue. I never could bear an ending. Show me one.',
        choices: [
          {
            text: '(Take up the baton, and write a rest into his song: one bar of silence, so that it can end.)', to: 'spare', quest: true,
            when: { any: [SONGBOOK('taught'), { trust: RV, value: 'trusted' }] },
            lockedLabel: 'You need a song that everybody has, or Rosalind’s trust',
            effects: [{ setFlag: 'bard.nemesis_fate', value: 'spared' }],
          },
          { text: '(Break the baton across your knee.)', to: 'destroy', quest: true, effects: [{ setFlag: 'bard.nemesis_fate', value: 'destroyed' }] },
        ],
      },
      spare: { speaker: 'narrator', text: 'You beat time with him for one bar, and then you leave the next one empty. For a whole bar there is nothing on the Twelve Stairs. The song finds the rest, and ends in it. Stitch by stitch the Chimera comes apart, and the lilac coat slides off its back with a man still in it.', next: 'spare2' },
      spare2: { speaker: BM, mood: 'happy', text: '(He lies on the stair, listening to the quiet, astonished.) Oh. Oh, that is the best part. Nobody ever told me. The best part of a song is the bit just after it ends.', next: null },
      destroy: { speaker: 'narrator', text: 'The baton snaps. The perfect song stops dead in the middle of a bar, and the Chimera falls apart into black tears round a tall man in a lilac coat, who looks up at you, surprised, as if somebody had coughed during the aria.', next: 'destroy2' },
      destroy2: { speaker: BM, mood: 'sad', text: 'Mid-bar. How very rude. (He smiles, and closes his eyes.) Still. You were listening. That is all I ever wanted from anybody: once. (And then there is only the coat, folded on the stair.)', next: null },
    },
  },
  // ---------- Rosalind's Aria (mentor's last request)
  {
    id: 'dialogue:obj-bard-aria-letter', name: 'Rosalind’s Aria: the parcel at the Heart camp', scope: 'party',
    entries: [
      { when: { all: [stage('quest:bard-rosalinds-aria', 'parcel'), { flag: 'bard.encore_pet' }] }, node: 'encore' },
      { when: stage('quest:bard-rosalinds-aria', 'parcel'), node: 'bird' },
      { node: 'plain' },
    ],
    nodes: {
      encore: { speaker: 'narrator', text: 'Encore trots into the Heart camp with a parcel in his mouth, sits down by the fire and sneezes, exactly on the beat. He has been home and back again. You begin to suspect he does it whenever he likes.', next: 'letter' },
      bird: { speaker: 'narrator', text: 'A Conservatory songbird lands on a tent-pole at the Heart camp, a parcel tied to its leg, and sings your name at you in Rosalind’s exact tone of voice until you come and get it.', next: 'letter' },
      letter: { speaker: RV, text: '“Darling. Clemency has written it out again, so here it is: her hand, my notes. Sing it once, at the top of the Song stair, and never again. Then it is yours, and I shall have given it away properly.”', next: 'ps' },
      ps: {
        speaker: RV, text: '“P.S. Learn it in silence first, darling: once means once. I have sung it again myself, to the pug, and the pug says that counts. Be magnificent. R.”',
        choices: [{ text: '(Fold the pages into your coat, next to your heart.)', to: null, quest: true, effects: [{ setFlag: 'bard.aria_letter', value: true }] }],
      },
      plain: { speaker: 'narrator', text: 'A tent-pole at the Heart camp, with a scrap of purple ribbon still tied round it.', next: null },
    },
  },
  {
    id: 'dialogue:obj-bard-aria-stair', name: 'Rosalind’s Aria: the head of the Song stair', scope: 'party',
    entries: [
      { when: { all: [stage('quest:bard-rosalinds-aria', 'sing'), { flag: 'bard.rosalind_devotable' }] }, node: 'sing-devoted' },
      { when: stage('quest:bard-rosalinds-aria', 'sing'), node: 'sing' },
      { node: 'plain' },
    ],
    nodes: {
      sing: {
        speaker: 'narrator', text: ARIA,
        choices: [
          { text: '(Sing it through once, to the end, and let it go.)', to: 'gone' },
          { text: '(Sing it with Clemency’s last line: “and bring her home”.)', to: 'gone', when: CLEMENCY },
          { text: '(Sing it the way she would: gloriously flat on the top note, and then not.)', to: 'gone', school: 'song' },
        ],
      },
      gone: { speaker: 'narrator', mood: 'sad', text: 'It goes out over the Heart and does not come back. You will never sing it again. You find you do not need to: you heard it, all of it, once.', effects: [{ setFlag: 'bard.aria_sung', value: true }], next: null },
      'sing-devoted': {
        speaker: 'narrator', text: ARIA,
        choices: [
          { text: '(Sing it through once, to the end, and let it go.)', to: 'gone-devoted' },
          { text: '(Sing it with Clemency’s last line: “and bring her home”.)', to: 'gone-devoted', when: CLEMENCY },
          { text: '(Sing it the way she would: gloriously flat on the top note, and then not.)', to: 'gone-devoted', school: 'song' },
        ],
      },
      'gone-devoted': {
        speaker: 'narrator', mood: 'happy', text: 'It goes out over the Heart and does not come back. Far away in Lyrehaven, in a dressing room full of honey jars, a woman stops halfway up a scale with her hand on her heart. Was that…? says Perdita. Yes, says Rosalind. Hush.',
        effects: [{ setFlag: 'bard.aria_sung', value: true }, { trust: RV, set: 5 }], next: null,
      },
      plain: { speaker: 'narrator', text: 'The head of the Song stair. The air here still has the shape of a song in it, the way a room does after the last bow.', next: null },
    },
  },
  // ---------- The Bought Songs (the Legion camp)
  bought(1,
    'Crumley the squeezebox man, off the Busking Steps, stands in the Legion’s ranks, weeping, humming a tune with no words in it. You know it at once: his drinking song, the one with forty verses, each ruder than the last. He sold it to Marchetti for a silver.',
    'You sing it back to him with all the words in, all forty. Halfway through the ninth his eyes clear, and by the twelfth he is singing the rude bits louder than you. He followed the coat, he says, because a song you have sold still itches.',
    'Where the squeezebox man stood, a bootprint, and a beer-ring on a stone.'),
  bought(2,
    'Two sisters in matching Busking Steps scarves stand side by side in the Legion, humming half a tune each: a skipping song that needs two to turn the rope. The Ambry twins sold it as one song and were paid as one person. They have never forgiven him.',
    'You sing the whole of it between them, turning an invisible rope with both hands, and on the last line they both jump in at once. They wake up arguing about whose turn it was. It is the best sound in the Legion camp.',
    'Two scarves knotted together on a Legion stake, like a skipping rope.'),
  {
    id: 'dialogue:obj-bard-bought-song-3', name: 'The Bought Songs: busker 3', scope: 'party',
    entries: [{ when: stage('quest:bard-the-bought-songs', 'buskers'), node: 'find' }, { node: 'plain' }],
    nodes: {
      find: {
        speaker: 'narrator', mood: 'sad', text: 'Old Corrigan the ballad-seller stands at the end of the rank, humming very softly. It is the song he wrote for his own wedding. He sold it to the lilac gentleman the winter his wife died, because he could not bear to sing it, and then he could not bear not to.',
        choices: [
          { text: '(Sing it back to him, slowly, every verse.)', to: 'back' },
          { text: '(Sing it back to him, and then teach it to the bearer beside you, so nobody can ever buy it again.)', to: 'taught' },
        ],
      },
      back: { speaker: 'narrator', mood: 'sad', text: 'He weeps through the last verse, and his tears come out clear. Thank you, he says. I wanted to hear it once more. I thought I had to buy it back. I did not know you could simply be given a thing.', effects: [{ setFlag: 'bard.bought_songs', value: true }], next: null },
      taught: { speaker: 'narrator', mood: 'happy', text: 'He weeps through the last verse, clear tears, and then the bearer beside you hums the tune back, badly, and Corrigan laughs out loud. Now two people have it, he says. That is twice as hard to burn.', effects: [{ setFlag: 'bard.bought_songs', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'Where Corrigan stood, a ballad-sheet weighted with a stone. The ink on it is ordinary ink.', next: null },
    },
  },
  // ---------- Tobble's Lullaby (the One-Note Busker comes to the Heart)
  {
    id: 'dialogue:bard-tobble-heart', name: 'Tobble’s Lullaby: Old Tobble at the Heart camp', scope: 'party',
    entries: [{ when: stage('quest:bard-tobbles-lullaby', 'tobble'), node: 'start' }, { node: 'wait' }],
    nodes: {
      start: { speaker: TB, mood: 'happy', text: '(Parp.) There you are. Walked it. Out through the Lyre Gate and along the old Turning roads, with a crumhorn and my second-best knees. A carter gave me a lift as far as the Wall. Nobody told me there would be quite so much weeping.', next: 'king' },
      king: {
        speaker: TB, text: 'They say the King in there was born in the Citadel. Unsung, and never heard a note in his life. (He looks at his crumhorn for a long time.) It’s his, isn’t it. The lullaby. Somebody wrote it for him.',
        choices: [
          { text: 'His Bard parent wrote it for him, when he was a baby.', to: 'parent' },
          { text: 'You said it yourself, Tobble. You sing to them anyway.', to: 'anyway', when: { insight: 'lullaby_unsung' }, trust: 1 },
        ],
      },
      parent: { speaker: TB, mood: 'sad', text: 'His mother or his father, singing to a cot that couldn’t hear them. And they wrote it all down, every note, in case one day he could. (Parp.) Well. One day is today, or it isn’t.', next: 'stairs' },
      anyway: { speaker: TB, mood: 'sad', text: 'I did, didn’t I. That’s the bit I always liked. You sing to them anyway, and you don’t ask whether it went in. (Parp.)', next: 'stairs' },
      stairs: { speaker: TB, text: 'Try it on the Legion first, mind. Hollow things want filling, and nobody ever sang to that lot either. (Parp.)', next: 'stairs2' },
      stairs2: { speaker: TB, text: 'Then take it up the stairs and play it at his door. I can’t do one stair, let alone twelve of them. I’ll play the last note from down here; it always knows where to come back to.', next: null },
      wait: { speaker: TB, text: '(Parp.) Go on up. I’m saving the last note. It’s the only one I’ve never once forgotten.', next: null },
    },
  },
  {
    id: 'dialogue:obj-bard-lullaby-stair', name: 'Tobble’s Lullaby: towards the throne hall', scope: 'party',
    entries: [{ when: stage('quest:bard-tobbles-lullaby', 'play'), node: 'play' }, { node: 'plain' }],
    nodes: {
      play: { speaker: 'narrator', text: 'From the top of the Twelve Stairs you can see the Citadel doors, and the black tears running down its steps. You play the lullaby towards them: seven notes going down like someone settling into bed, a little rocking phrase, four notes rising like a question.', next: 'parp' },
      parp: {
        speaker: 'narrator', mood: 'sad', text: 'Far below at the camp, small and cracked and exactly on time, one note on a crumhorn. Down the Citadel steps, for as long as a lullaby lasts, the black tears stop running, as if someone inside remembered being rocked.',
        effects: [{ setFlag: 'bard.lullaby_played', value: true }],
        choices: [
          { text: '(Look back down at the Legion camp.)', to: 'legion', when: { flag: 'bard.lullaby_legion' } },
          { text: '(Listen to the quiet.)', to: null },
        ],
      },
      legion: { speaker: 'narrator', text: 'Down in the Legion camp, the ones who sat down when you played to them are still sitting, rows of them, heads tipped back, listening towards the stair like children who have heard the door go and are waiting to see who it is.', next: null },
      plain: { speaker: 'narrator', text: 'The top of the Twelve Stairs, looking across at the Citadel. Somewhere below, every so often, a crumhorn plays one note.', next: null },
    },
  },
];

export default dialogues;
