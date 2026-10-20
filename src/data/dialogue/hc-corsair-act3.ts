/** Hollow Crown, CORSAIR Act III: the nemesis remade, the mentor’s last request and the Heart side quests. Owner: Claude 4. */
import type { DialogueDef, DialogueNode, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const DB = 'npc:dot-brine' as const, SA = 'npc:saltmarsh' as const, NB = 'npc:captain-nobody' as const;
const DEVOTABLE: NarrativeCondition = { flag: 'corsair.dot_devotable' };
const SPARED: NarrativeCondition = { flag: 'corsair.nemesis_fate', op: '==', value: 'spared' };

/** Dot’s IOU, front and back: the same paper whether Interest or a bottle brings it */
const IOU: Record<string, DialogueNode> = {
  front: { speaker: DB, text: '(On the front, in Dot’s best hand:) “I.O.U. Owed, one apology, from the Brine Fleet, to the Hollow King, for selling his tears. Payable on demand.”', next: 'back' },
  back: {
    speaker: DB, mood: 'sad', text: '(On the back:) “Sweetheart. The Fleet got rich off that poor man’s crying, thirty years of it, and so did I, when I was short. I’ve dodged every debt I ever had. Not this one. Deliver it by hand. Love, D.”',
    choices: [{ text: '(Fold the IOU away.)', to: null, quest: true, effects: [{ setFlag: 'corsair.dot_iou', value: true }] }],
  },
};

const dialogues: DialogueDef[] = [
  // ---------- III-4 Saltmarsh's Last Sale
  {
    id: 'dialogue:corsair-herald-fate', name: 'III-4 Saltmarsh’s Last Sale: the Admiral’s fate', scope: 'party',
    entries: [
      { when: { flag: 'corsair.charter', op: '==', value: 'signed' }, node: 'signed' },
      { when: { flag: 'corsair.charter', op: '==', value: 'marque' }, node: 'marque' },
      { node: 'sale' },
    ],
    nodes: {
      signed: { speaker: SA, mood: 'hollow', text: 'You signed my charter, once. For a while you were mine, you and the whole Fleet, and I was good to you. Wasn’t I good to you?', next: 'sale' },
      marque: { speaker: SA, mood: 'hollow', text: 'The King’s privateer. You raided my barges under his paper, and I never once held it against you. Business is business.', next: 'sale' },
      sale: { speaker: SA, mood: 'hollow', text: '(The figurehead’s painted mouth moves, and it is his voice, kind as ever, smelling of lavender.) Let me buy it. Your grief. Whatever you’re carrying up these stairs. Name any price. I always pay.', next: 'choose' },
      choose: {
        speaker: SA, mood: 'sad', text: '(The pearl in its ear is the size of a fist now, and weeping.) No? Nobody ever says no. Then what do you want? Everything has a price.',
        choices: [
          {
            text: '(Hold out Captain Nobody’s contract.) Give the name back, Admiral. It was never yours to buy.', to: 'name', quest: true,
            when: { any: [{ flag: 'corsair.charter', op: '==', value: 'free' }, { trust: DB, value: 'trusted' }] },
            lockedLabel: 'You need the First Article, or Dot’s trust',
            effects: [{ setFlag: 'corsair.nemesis_fate', value: 'spared' }],
          },
          { text: 'Some things aren’t for sale. You were one of them. (Finish it.)', to: 'end', quest: true, effects: [{ setFlag: 'corsair.nemesis_fate', value: 'destroyed' }] },
        ],
      },
      name: { speaker: 'narrator', text: 'A long silence. Then a thin hand comes out of the pearl-crusted hide, a boy’s hand, and takes the contract, and crosses out SALTMARSH in careful capitals. The pearl in its ear drops, and cracks on the stair.', next: 'name2' },
      name2: { speaker: 'narrator', mood: 'sad', text: 'What climbs out of the wreck is an old man in a wet shirt, with nothing in his ears. “I’m nobody,” he says, wondering. “I haven’t been nobody since I was nine.” He holds the contract out to you. “It’s so light.”', next: null },
      end: { speaker: 'narrator', text: 'One stroke, and the figurehead splits down the middle. The pearls come off the hide like hail and roll away down the stair, towards a sea that isn’t there. Underneath there is nothing. Not even a name.', next: null },
    },
  },
  // ---------- Dot's IOU (the mentor’s last request)
  {
    id: 'dialogue:corsair-interest-iou', name: 'Dot’s IOU: by parrot', scope: 'party',
    entries: [{ node: 'parrot' }],
    nodes: {
      parrot: { speaker: 'npc:interest-courier', text: '(Interest drops out of the black air over the Weeping Wall and lands on your head, soaked and furious, with a rolled IOU in his claws. “PAY UP,” he says. Then, quietly: “sorry.” It is a new word. He seems to have practised it.)', next: 'front' },
      ...IOU,
    },
  },
  {
    id: 'dialogue:obj-corsair-iou-bottle', name: 'Dot’s IOU: by bottle', scope: 'party',
    entries: [
      { when: { all: [stage('quest:corsair-dots-iou', 'iou'), { not: { flag: 'corsair.interest_pet' } }] }, node: 'bottle' },
      { node: 'plain' },
    ],
    nodes: {
      bottle: { speaker: 'narrator', text: 'A green bottle has washed up at the foot of the Weeping Wall, among the black tears, as if the Wall had wept it out. It is corked with wax and stamped with the Overdraft’s mark. Inside, rolled tight, is an IOU.', next: 'front' },
      ...IOU,
      plain: { speaker: 'narrator', text: 'An empty green bottle at the foot of the Weeping Wall.', next: null },
    },
  },
  {
    id: 'dialogue:obj-corsair-citadel-door', name: 'Dot’s IOU: the Citadel doors', scope: 'party',
    entries: [{ when: stage('quest:corsair-dots-iou', 'door'), node: 'door' }, { node: 'plain' }],
    nodes: {
      door: { speaker: 'narrator', text: 'The Citadel doors stand open on a long dark hall, and somewhere at the end of it a man is weeping. A debt is delivered by hand, Dot says, and read aloud, so nobody can say afterwards they never heard it.', next: 'read' },
      read: { speaker: 'narrator', text: 'So you read it into the dark, loud and slow: “Owed, one apology, from the Brine Fleet, for selling his tears.” Then you fold it into the great iron ring of the door, where a man coming out would find it.', next: 'heard' },
      heard: {
        speaker: 'narrator', mood: 'sad', text: 'Far down the hall the weeping falters, just for a moment, the way it does when somebody hears the word sorry and is not sure it was meant for him.',
        effects: [{ setFlag: 'corsair.iou_delivered', value: true }],
        choices: [
          { text: '(Step back from the door.)', to: 'devoted', when: DEVOTABLE },
          { text: '(Step back from the door.)', to: null, when: { not: DEVOTABLE } },
        ],
      },
      devoted: {
        speaker: 'narrator', mood: 'happy', text: 'Far away on Gallows Reef, in the middle of the Brine Market, Dot Brine stops with her hat in her hand. For the first time in her life she feels entirely paid up, and she has no idea what to do with herself.',
        effects: [{ trust: DB, set: 5 }], next: null,
      },
      plain: { speaker: 'narrator', text: 'The Citadel doors, standing open. An IOU is folded into the iron ring.', next: null },
    },
  },
  // ---------- The White Flagship
  {
    id: 'dialogue:obj-corsair-white-flagship', name: 'The White Flagship', scope: 'party',
    entries: [
      { when: { all: [stage('quest:corsair-the-white-flagship', 'board'), { flag: 'corsair.charter', op: '==', value: 'marque' }] }, node: 'marque' },
      { when: { all: [stage('quest:corsair-the-white-flagship', 'board'), { flag: 'corsair.charter', op: '==', value: 'signed' }] }, node: 'signed' },
      { when: stage('quest:corsair-the-white-flagship', 'board'), node: 'chain' },
      { node: 'plain' },
    ],
    nodes: {
      marque: { speaker: 'narrator', text: 'The white flagship comes round the Wall on the black water, close enough to touch. You hold up the King’s letter of marque, still good in law: a privateer may board any ship of the pearl trade. The hollow crew stand aside for the paper. They always did.', next: 'deck' },
      signed: { speaker: 'narrator', text: 'You go up her trailing anchor-chain hand over hand, and over the white rail. Among her crew are faces you know: free captains who signed his charter at the moot, gone as white as his sails. They carried his cargo. It carried them.', next: 'deck' },
      chain: { speaker: 'narrator', text: 'The white flagship comes round the Wall on the black water, her anchor-chain trailing past the camp. You go up it hand over hand, the way Dot taught you, and over the white rail.', next: 'deck' },
      deck: {
        speaker: 'narrator', text: 'Her crew stand at their stations, hollow, still sailing round and round for an Admiral who is not coming back. Somebody ought to tell them the voyage is over.',
        choices: [
          { text: '(Take the wheel, and bring her in to shore.)', to: 'ashore' },
          { text: '(Ring eight bells: end of the watch. Every sailor alive knows that one.)', to: 'bells', school: 'guile' },
        ],
      },
      ashore: { speaker: 'narrator', text: 'You run her gently aground below the Heart camp. One by one her crew climb down into the shallows and stand there blinking, like sailors woken at the end of a very long watch.', next: null },
      bells: { speaker: 'narrator', text: 'Eight bells, clear across the black water. One by one her crew put down their ropes and climb over the side into the shallows, blinking, as if somebody had finally come to relieve them. With no hand on the wheel, she drifts in and grounds gently below the Heart camp.', next: null },
      plain: { speaker: 'narrator', text: 'The white flagship, aground below the Heart camp, her sails hanging slack and her decks empty.', next: null },
    },
  },
  // ---------- Nobody's Name
  {
    id: 'dialogue:corsair-nobody', name: 'Nobody’s Name: Captain Nobody', scope: 'party',
    entries: [{ when: stage('quest:corsair-nobodys-name', 'nobody'), node: 'start' }, { node: 'later' }],
    nodes: {
      start: {
        speaker: NB, mood: 'hollow', text: '(A ghost captain with no face stands at the head of the Guile stair, turning his hat in his hands.) I followed it. My paper. Forty years in somebody else’s pocket. I wanted to see where it ended up.',
        choices: [
          { text: '(Somebody is coming up the stair behind you.)', to: 'boy', when: SPARED },
          { text: '(Take out the contract.)', to: 'gone', when: { not: SPARED } },
        ],
      },
      boy: { speaker: 'narrator', text: 'The man who was Saltmarsh climbs the last step, barefoot, nothing in his ears. He takes the contract from you and holds it out to the ghost in both hands, the way a boy hands back something he should never have taken.', next: 'face' },
      face: { speaker: NB, mood: 'happy', text: '(The ghost takes it, and for the first time in forty years he has a face: young, tired, astonished.) Saltmarsh. Captain Saltmarsh. (He looks at the old man.) You kept it well, boy. Better than I did.', next: 'light' },
      light: { speaker: 'narrator', text: 'The old man laughs, a wharf-boy’s laugh, and goes back down the stair with nothing at all, lighter than anyone you have ever seen. When you turn round, the captain is gone, and so is the name.', next: null },
      gone: {
        speaker: NB, mood: 'sad', text: 'He’s gone, then. The one who had it. There’s nobody left to give it back. (He holds out his hat.) Will you write it for me? I’ve forgotten the letters.',
        choices: [
          { text: '(Write SALTMARSH on the hatband in careful capitals.)', to: 'hung' },
          { text: '(Write it in your best Fleet hand, with a flourish, the way a free captain signs.)', to: 'hung', school: 'guile' },
        ],
      },
      hung: { speaker: 'narrator', mood: 'sad', text: 'You hang the hat on the Guile stair’s banner-post, the way the Fleet hangs a hat for every captain lost. The ghost looks at it a long while. Then, just for a moment, he has a face, and then he is gone, and the hat stays.', next: null },
      later: { speaker: NB, text: '(The ghost touches the brim of his hat to you.)', next: null },
    },
  },
  // ---------- First-hour delights (Claude 5): one-time lines when the player does something optional (Act I, kept here because act1 is near 400 lines)
  {
    id: 'dialogue:corsair-delight-barrel', name: 'Delight: Dot behind her barrel',
    entries: [{ node: 'barrel' }],
    nodes: {
      barrel: { speaker: DB, text: '(She is crouched behind a barrel on her own deck.) Is it a creditor? Oh. It’s you. (She stays behind the barrel.) Sweetheart, the creditors are out there. Go and renegotiate. Take a barrel. Not this one. This one’s mine.', effects: [{ setFlag: 'corsair.delight.barrel', value: true }], next: null },
    },
  },
  {
    id: 'dialogue:corsair-delight-interest', name: 'Delight: Interest compounds',
    entries: [{ node: 'again' }],
    nodes: {
      again: { speaker: 'npc:interest', text: '(Interest looks you up and down, and remembers you. “PAY UP,” it says, and then, with terrible satisfaction: “COMPOUNDED.”)', effects: [{ setFlag: 'corsair.delight.interest-again', value: true }], next: null },
    },
  },
];

export default dialogues;
