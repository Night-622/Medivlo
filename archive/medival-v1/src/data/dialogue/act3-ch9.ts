/** Dialogue: Act III Chapter 9 "The Heart of Orr": the three ways down, and Nhal’s offer (docs/lore/14-act3-spec.md). Owner: Claude 4.
 *  - act3.heartforge_unsealed is set on the first node of every opening (Brannoch’s word, the Cindermother’s blessing)
 *    and on the choice that burns obj:heartforge-seal. act3.way_down records which: 'vault' | 'stair' | 'burned'.
 *  - act3.nhal_offer is set on the choice itself. The Nhal nodes are exported and shared with dialogue:obj-heartfire
 *    (act3-ch9b.ts), so the offer can always be heard again at the heart. */
import type { DialogueDef, DialogueNode, NarrativeCondition, NarrativeEffect } from '@/core';

const QH = 'quest:the-heart-of-orr';
const BRANNOCH = 'npc:brannoch-deepforge' as const;
const RUQAYA = 'npc:ruqaya-al-nar' as const;
const NHAL = 'npc:nhal-risen' as const;

const f = (flag: string): NarrativeCondition => ({ flag });
const is = (flag: string, value: string): NarrativeCondition => ({ flag, op: '==', value });
const all = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: c });
const following = (slug: string): NarrativeCondition => f(`companion.${slug}.following`);
const active: NarrativeCondition = { questActive: QH };
const unsealed = f('act3.heartforge_unsealed');

const UNSEAL = (way: 'vault' | 'stair' | 'burned'): NarrativeEffect[] => [
  { setFlag: 'act3.heartforge_unsealed', value: true },
  { setFlag: 'act3.way_down', value: way },
  { unlockLore: 'lore:the-heartforge' },
];
const OFFER = (answer: 'refused' | 'accepted'): NarrativeEffect => ({ setFlag: 'act3.nhal_offer', value: answer });

/** Nhal, risen. Shared with dialogue:obj-heartfire. Every refusal and the acceptance set act3.nhal_offer on the choice. */
export const NHAL_NODES: Record<string, DialogueNode> = {
  'n-rise': {
    speaker: 'narrator', mood: 'afraid',
    effects: [{ unlockLore: 'lore:nhal-risen' }, { unlockLore: 'lore:nhal-the-drowned', section: 'risen' }],
    text: 'The water rises. Not a wave: the whole black sea at the foot of the heart lifts, as a sheet lifts when someone sits up beneath it, and goes on lifting, and takes a shape. It is the shape of grief. A mourner, veiled and kneeling, taller than the ribs of a god, with water running off it for ever and never pooling. Its arms are held open. Its veil is pressed from beneath by faces, thousands upon thousands of them, the way faces press against the underside of river-ice: Hollowed faces, every one of them weeping, every one of them smiling.',
    next: 'n-speak',
  },
  'n-speak': {
    speaker: NHAL, mood: 'hollow',
    text: '(It speaks with all its mouths at once, very softly, so as not to frighten you.) Little cup. Little warm one. You came all the way down. And you brought them, all seven. (The faces turn toward your hand as flowers turn toward a window.) Oh, we have waited so long. We have waited since before your sun was lit to see a hand like yours.',
    next: 'n-hub',
  },
  'n-hub': {
    speaker: NHAL, mood: 'hollow',
    text: 'Ask, if you like. We are not in a hurry. We have never once been in a hurry. Only he was, with his hammer.',
    choices: [
      { text: '“What are you now?”', to: 'n-what', once: true },
      { text: '“You lied to Ysolde. There was never going to be a gentle sleep.”', to: 'n-lied', once: true },
      { text: '[Ysolde] Look to the woman in white beside you.', to: 'n-ys-turned', once: true, when: is('act3.ysolde_fate', 'turned') },
      { text: '[Ysolde] Look back at the woman huddled on the Anvil.', to: 'n-ys-spared', once: true, when: is('act3.ysolde_fate', 'spared') },
      { text: 'Look at it through the mark.', to: 'n-sight', once: true },
      { text: '[Hollow-touched] “I can hear you singing. Inside me. I always could.”', to: 'n-hollow', once: true, when: { dialogueTag: 'hollow-touched' }, tag: 'trait' },
      { text: '[Reaver] “You live on stolen warmth. So do I.”', to: 'n-reaver', once: true, when: { classIs: 'class:reaver' }, tag: 'class' },
      { text: '“What do you want?”', to: 'n-offer' },
    ],
  },
  'n-what': {
    speaker: NHAL, mood: 'hollow',
    text: 'We are pity. Only that. Of all his children we were the only one who looked down at the sea he had robbed of a world and wept for it, and we leapt in after it so that it would not be alone. And it was not alone, then. We were. (The faces in the veil weep harder, smiling.) We have been weeping ever since, little cup, every age there has been. We have grown so large with weeping that we fill the whole of the dark.',
    next: 'n-hub',
  },
  'n-lied': {
    speaker: NHAL, mood: 'hollow',
    text: 'Lied. (The thousand faces look hurt, all at once, in the same way.) We told her what she needed to hear, so that she could carry. Is that lying? Your mothers say it every night, at every bedside: hush, it will be all right. And it would have been all right, little cup. It would have been all right for us.',
    next: 'n-hub',
  },
  'n-ys-turned': {
    speaker: 'npc:ysolde', mood: 'angry',
    text: '(She steps up beside you, white robe, wet hair, and lifts her face to the thing that held her for nine years. Her halo has stopped turning.) You told me it would be gentle. You told me I was the first to see, and the only one. You held me when I could not stop seeing, and I thanked you for it, every night, on my knees. (Her voice does not shake.) I am not yours. I was never yours. I was only cold.',
    next: 'n-ys-turned2',
  },
  'n-ys-turned2': {
    speaker: NHAL, mood: 'hollow',
    text: 'Little saint. Our little saint. You are so tired. Come down where it is quiet, and we will forgive you everything. We always forgive you. (Ysolde shuts her eyes, and the water runs from them, and she does not move.) …She is still ours, warm one. She only does not know it tonight.',
    next: 'n-hub',
  },
  'n-ys-spared': {
    speaker: 'narrator', mood: 'sad',
    text: 'Ysolde followed you down. You did not ask her to. She has sat down on the black iron of the Anvil with her knees drawn up and her hands over her ears, like a child in a storm, and she is saying something over and over. When you bend close you hear it: “It’s using the name Mistress gave me. It’s using the name Mistress gave me.” The mourner turns its veiled head and calls her, very gently, little saint. She shakes her head. She does not get up, and she does not go. It is all she can do. It is a very great deal.',
    next: 'n-hub',
  },
  'n-sight': {
    speaker: 'narrator', mood: 'afraid',
    text: 'Through the mark the mourner is not a mourner. The veil is a skin, and the faces are not pressed against it from behind: they are inside it, held, the way a pond holds what has drowned in it. The open arms are not arms. They are lips. And in the middle of it, where a heart would be in anything that had one, there is a hollow the exact size and shape of the coal below, and the hollow is beating. Slowly. Carefully. Practising. It has been practising for a very long time.',
    next: 'n-hub',
  },
  'n-hollow': {
    speaker: NHAL, mood: 'happy',
    text: 'Yes. Oh, yes. You were always a little ours. You have heard us at the bottom of every quiet, have you not? Under the bells. Under the roots. Under your own heartbeat, when you lie awake. (The water leans toward you like a mother over a cot.) You know how peaceful it is in here. You are the only one of them who knows.',
    next: 'n-hub',
  },
  'n-reaver': {
    speaker: NHAL, mood: 'happy',
    text: 'Kin. Oh, kin. You burn your own soft body to be strong, and the priests hang you for it. We burned a god to be large, and they made us a crime to say. (The faces smile, every one, with real fondness.) You see? You understand. You are the first who has ever come down here and understood.',
    next: 'n-hub',
  },
  'n-offer': {
    speaker: NHAL, mood: 'hollow',
    text: 'Feel him. (Below, the heart beats. You count to forty before it beats again.) Forty. And soon it will be forty-one, and then a hundred, and one day it will not come at all, and your world will fall into us screaming. We do not want you to scream. So listen. Water cannot burn. We have tried, for ages, and we cannot be a heart alone; we have no fire. But you are a fire, little cup, with a thread that runs straight down into the old one. Come down into us. Bring the Seven. Put your hand where his heart is and let us close around it, and we will beat together, fire and water, warm and dark, for ever.',
    next: 'n-offer2',
  },
  'n-offer2': {
    speaker: NHAL, mood: 'hollow',
    text: 'You will be a god. More than he ever was. And no one will be cold any more, not ever, and no one will be hungry, and no one will be alone, because everyone, everyone will be inside: with us, with you, all the same warm thought. Isn’t that what you wanted? Isn’t it what all of you have always wanted?',
    choices: [
      { text: '“Show me what it would be.”', to: 'n-show', once: true },
      { text: '“No.”', to: 'n-refuse', effects: [OFFER('refused')] },
      { text: '“You aren’t pity. You’re hunger, wearing pity like a stolen cloak.”', to: 'n-refuse-hunger', effects: [OFFER('refused')] },
      { text: 'Kindle the mark. Answer with all seven Embers at once.', to: 'n-refuse-fire', tag: 'aggressive', effects: [OFFER('refused')] },
      { text: 'Reach out, and take its hand.', to: 'n-accept' },
    ],
  },
  'n-show': {
    speaker: 'narrator', mood: 'hollow',
    text: 'It shows you. Brindlecross on a spring morning, the first spring in years: green on the moor, smoke from every chimney, children shrieking in the ford. And then, all at once, everyone stops. The ploughman, the children, the priest on the step, the dog. They turn their faces up to the sky together, and they smile the same smile, and their eyes are black to the rims, and the whole village breathes in at the same moment, and out. No one speaks. There is no one left to speak to. It is the happiest place you have ever seen.',
    next: 'n-offer2',
  },
  'n-accept': {
    speaker: 'narrator', mood: 'hollow',
    text: 'You lift your marked hand toward it. The faces in the veil go still with hope. A hand of black water comes down out of the dark to meet yours, slowly, so as not to startle you, and stops a finger’s breadth away. It is exactly as warm as you are. If you take it you will not be one thing any more. You will be we, and the heart of the world will beat with your pulse and with its own, and you will never, ever be able to tell them apart.',
    choices: [
      { text: '“Yes. Together.”', to: 'n-yes', effects: [OFFER('accepted')] },
      { text: '“No.” Pull your hand back.', to: 'n-refuse', effects: [OFFER('refused')] },
    ],
  },
  'n-yes': {
    speaker: 'narrator', mood: 'hollow', effects: [OFFER('accepted')],
    text: 'You take its hand. There is no cold. There is no shock at all; that is how you know it is real. The arms that are not arms close round you, and the faces press close and kiss you with a thousand mouths, and somewhere far behind you someone is screaming your name. You are carried down off the Anvil through the warm dark like a child carried up to bed, down and down, to the foot of the Heart of Orr.',
    next: 'n-yes2',
  },
  'n-yes2': {
    speaker: NHAL, mood: 'happy',
    text: 'Oh. Oh, you are so warm. (Its voice is inside your ears now, and a little of it is in your own throat.) Now, little cup. Now. Put your hand in him.',
  },
  'n-refuse': {
    speaker: NHAL, mood: 'hollow', effects: [OFFER('refused')],
    text: '(It is quiet for a long while.) No. Everyone says no the first time. (And then the pity goes out of its thousand faces at once, as a lamp goes out when a door is opened on a winter night, and what is left behind is not grief. It never was.)',
    next: 'n-fight',
  },
  'n-refuse-hunger': {
    speaker: NHAL, mood: 'hollow', effects: [OFFER('refused')],
    text: 'And what is pity, little cup, but a hunger for someone else’s pain? We have been hungry for yours since you were born. (The faces stop weeping. They go on smiling.) Very well. Let us be hungry, then, and not pretend.',
    next: 'n-fight',
  },
  'n-refuse-fire': {
    speaker: 'narrator', effects: [OFFER('refused')],
    text: 'You open your hand and all seven Embers answer at once. White fire pours off the Anvil of Ribs and down through the dark like a fall of molten iron, and for one breath the Heartforge is as bright as the day the world was struck. The faces in the veil flinch from it. Every one of them. Then the dark draws the light into itself the way a sponge draws water, and sighs.',
    next: 'n-fight',
  },
  'n-fight': {
    speaker: NHAL, mood: 'angry', effects: [OFFER('refused')],
    text: 'Then we will take them from your cold hands, and we will hold you anyway, afterwards, when you are quiet. We are so patient. And you are so small. And you are so very far from the sun.',
    next: 'n-fight2',
  },
  'n-fight2': {
    speaker: 'narrator', mood: 'afraid',
    text: 'It draws back down around the heart of the world, coiling about the black coal as smoke coils about a dying fire, and the sea at the foot of the heart begins to heave. When the mourner rises out of it again it is not kneeling, and its arms are not open, and every one of its faces is turned toward you. Go down. End it.',
  },
};

const dialogues: DialogueDef[] = [
  // ----- the way down: Brannoch and the Vault gate (Concord rep >= 0, or Grimma’s ring)
  {
    id: 'dialogue:ch9-brannoch-gate', name: 'Brannoch: The gate below the Nails',
    entries: [
      { when: all(unsealed, is('act3.way_down', 'vault')), node: 'again' },
      { when: all(unsealed, is('act3.way_down', 'burned')), node: 'burned' },
      { when: unsealed, node: 'other' },
      { when: all(active, is('companion.grimma-ironsong.ring', 'old')), node: 'ring-old' },
      { when: all(active, is('companion.grimma-ironsong.ring', 'new')), node: 'ring-new' },
      { when: all(active, { rep: 'faction:iron-concord', min: 0 }), node: 'kin' },
      { when: active, node: 'shut-in' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: BRANNOCH, text: 'Walk soft, Ember-hand. The dead are listening.' },
      'ring-old': {
        speaker: 'narrator',
        text: 'Brannoch Deepforge has been waiting for you. He has put on the old iron of his office, the Thane’s mail that is worn only at buryings and crownings, and he looks at your marked hand before he looks at your face.',
        next: 'ring-old2',
      },
      'ring-old2': {
        speaker: BRANNOCH,
        text: 'The Ironsong clan-mother wrote to me. In iron, not ink: that is how we write what cannot be taken back. Grimma Ironsong’s ring is whole again, reforged as it was, and the clan has sung her name in the hold. And she has given her word for you. (He breathes out slowly through his beard.) An Ironsong vouches. In Korrath that has always been enough. It will be enough today.',
        next: 'open',
      },
      'ring-new': {
        speaker: 'narrator',
        text: 'Brannoch Deepforge has been waiting for you. He has put on the old iron of his office, the Thane’s mail that is worn only at buryings and crownings, and he looks at your marked hand before he looks at your face.',
        next: 'ring-new2',
      },
      'ring-new2': {
        speaker: BRANNOCH,
        text: 'The Ironsong clan-mother wrote to me. In iron, not ink. Grimma Ironsong’s ring is forged anew, and not with Orrun fire: with yours. The clan-mother says it rings like no ring she has heard, and she has heard all of them. (A long pause.) She did not like it. She sang her name in the hold anyway. And Grimma has given her word for you. An Ironsong vouches, Ember-hand. In Korrath that has always been enough.',
        next: 'open',
      },
      kin: {
        speaker: 'narrator',
        text: 'Brannoch Deepforge has been waiting for you. He has put on the old iron of his office, the Thane’s mail that is worn only at buryings and crownings, and when you come before him he does a thing no Thane of the Concord has done for a human in nine hundred years. He bows.',
        next: 'kin2',
      },
      kin2: {
        speaker: BRANNOCH,
        text: 'You have kept faith with the Concord, or near enough that the ledger forgives the difference. The holds remember who came when we called, and who did not. So. You will ask me for the last gate, and I will open it. Do not thank me. Thanks are for gifts, and this is a debt.',
        next: 'open',
      },
      open: {
        speaker: BRANNOCH, effects: UNSEAL('vault'),
        text: 'Below the ninth stair, below the last Nail, there is a door that no Orrun has opened since the Rusting. The Orrin shut it with Orr’s own iron when they understood what they had been digging toward. It opens to a Thane’s word, and only for the old one’s kin. (He lays his hand over your marked one. It is cold and heavy as an anvil.) You are carrying his heart home. That is kin enough. Hear the word, and never say it twice.',
        next: 'word',
      },
      word: {
        speaker: 'narrator',
        text: 'He says it. It is not a word so much as a note, very low, the note the Nails make in the deep when the mountain settles: you feel it in your back teeth more than you hear it. Far below your feet, so far that it takes a long breath to arrive, something enormous turns over in the stone, like a key in a lock that has rusted for three thousand years.',
        next: 'hub',
      },
      hub: {
        speaker: BRANNOCH, text: 'It is open. Ask, if you must. Then go.',
        choices: [
          { text: '“What is down there?”', to: 'below', once: true },
          { text: '“The lower holds are drowned, Thane.”', to: 'flooded', once: true, when: f('act2.korrath_flooded') },
          { text: '“The new Nail. Does it hold?”', to: 'nail', once: true, when: f('act2.new_nail') },
          { text: '“Your hammers stood on the walls of Haldren.”', to: 'walls', once: true, when: f('act3.ally.orrun') },
          { text: '[Grimma] Stand aside for Grimma.', to: 'grimma', once: true, when: following('grimma-ironsong') },
          { text: '“Korr nagh, Thane.”', to: 'go' },
        ],
      },
      below: { speaker: BRANNOCH, mood: 'afraid', text: 'The Wrought, still at their posts, for masters who rusted before your kind had fire. Then the Anvil of Ribs, where he struck the world: you will know it, there is nothing else like it. And below that, him. What is left of him. (He looks at the floor as if he could see through it.) The Orrin dug toward that heart to rekindle their maker, and the heat came up and rusted them where they stood. Walk soft. The dead are listening, and some of them are still on duty.', next: 'hub' },
      flooded: { speaker: BRANNOCH, mood: 'sad', text: 'Grenn. I know. The way down goes through them. (He does not look at you.) If you pass the ninth stair, there is a warden-post with a hammer still in the rack. Grenn stood there. Say his name as you go by. I have written it in the ledger, but the ledger cannot say it to him.', next: 'hub' },
      nail: { speaker: BRANNOCH, mood: 'happy', text: 'Eight old, and one new with an Ironsong mark on its head. It holds. It sings, a little higher than the others; the old wardens complain of it, as old wardens complain of everything young. I have never been so glad to be complained at.', next: 'hub' },
      walls: { speaker: BRANNOCH, text: 'Stood, aye. And some of them lie there still, under the human stones. We do not leave our dead in other folk’s ground, as a rule. For Haldren I have made an exception in the ledger. Do not make me regret the ink.', next: 'hub' },
      grimma: { speaker: 'npc:grimma-ironsong', text: 'Don’t make a speech, Thane. I know what you want to say, and you know I know, and we’ll both be dead of old age before you get to the end of it.', next: 'grimma2' },
      grimma2: { speaker: BRANNOCH, text: '(The Thane looks at her for a long moment. Then he inclines his head, exactly as far as one clan-head inclines to another, and no further.) Ironsong.', next: 'grimma3' },
      grimma3: { speaker: 'npc:grimma-ironsong', mood: 'happy', text: '(She returns it, to the inch.) Thane. (And to you, out of the side of her mouth:) That’s the most he’s said to me in thirty years. I may weep. Don’t look.', next: 'hub' },
      go: { speaker: BRANNOCH, text: 'Korr nagh, Ember-hand. Carry the old one’s heart home, and if it is still beating when you get there, tell it the Orrun kept the door.' },
      // --- he will not
      'shut-in': {
        speaker: 'narrator',
        text: 'The High Thane receives you seated, with his hammer across his knees. The wardens behind him do not move. When he speaks, the iron rings in his beard do not so much as chime.',
        next: 'shut',
      },
      shut: {
        speaker: BRANNOCH, mood: 'angry',
        text: 'I know what you have come for. The last gate. The door below the Nails, that the Orrin shut with Orr’s own iron and that the Concord has kept for three thousand years. It opens to a Thane’s word, for the old one’s kin. You are not kin. You are not even a friend.',
        choices: [
          { text: '“The world is ending, Thane.”', to: 'shut-world', once: true },
          { text: '“Then I’ll burn the seal open.”', to: 'shut-burn' },
          { text: '“Then I’ll find another way down.”', to: 'shut-go' },
        ],
      },
      'shut-world': { speaker: BRANNOCH, text: 'The world has been ending since the Rusting. The Concord has outlived every ending so far by keeping its oaths when it was not convenient. I will not stop keeping them on the last day. That is precisely the day they are for.', next: 'shut' },
      'shut-burn': { speaker: BRANNOCH, mood: 'sad', text: 'You can. That hand burns anything. (He does not raise his voice.) But the seal is the Orrin’s work, Orr’s own iron, and when it goes every forge in the Ironspine will feel it go. We will remember who did it. Stone remembers. That is all stone does.' },
      'shut-go': { speaker: BRANNOCH, text: 'There is talk, among the caravans that come up the Ash Road, of a stair the kings of Qadir cut for themselves under the glass. Go and ask their smoke-witch. She will tell you more riddles than I would, and fewer refusals.' },
      // --- after
      again: { speaker: BRANNOCH, text: 'The door stands open. It will stand open until you come back up, or until we know you will not. Walk soft.' },
      burned: { speaker: BRANNOCH, mood: 'angry', text: 'Every forge in Korrath went out at once, for the space of a breath. Every one, Ember-hand, in every hold, the old and the new. The children thought the mountain had died. (He turns a page in the ledger, and does not write in it.) Go down, since you have made the way. Do not ask me to wish you well.' },
      other: { speaker: BRANNOCH, text: 'You found another road down. Good. (He does not say whether he means it.) Then the door below the Nails can stay shut a while longer, and I can go on keeping it, which is the only thing I was ever any good at.' },
    },
  },
  // ----- the way down: the Kings’ Stair and the Cindermother’s blessing (act2.ozrah_truth)
  {
    id: 'dialogue:ch9-kings-stair', name: 'Ruqaya: The Kings’ Stair',
    entries: [
      { when: all(unsealed, is('act3.way_down', 'stair')), node: 'again' },
      { when: unsealed, node: 'other' },
      { when: all(active, f('act2.ozrah_truth')), node: 'start' },
      { when: active, node: 'closed' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: RUQAYA, text: 'Sit, child of the coal. The smoke is quiet today.' },
      start: {
        speaker: 'narrator',
        text: 'The Cindermother sits in a haze of sweet smoke with her hands folded on her knees. She turns her blind face toward you before you have said a word, and the scars on it move as she smiles. The Embers in your hand flare as if someone had blown on them.',
        next: 'start2',
      },
      start2: {
        speaker: RUQAYA,
        text: 'Seven. I can feel them on my face, child of the coal, like standing too near a kiln. The smoke has been full of you for a month: a stair, and a dark, and a heart that has forgotten how to hurry. You want the kings’ road down. (She holds up one ash-scarred finger.) But you owe me a story first. I told you: come back to my tent and tell me what the king said.',
        choices: [
          { text: '“He said the Heartfire was always dying. He was trying to save it. They all were.”', to: 'told' },
          { text: '“He said he was sorry. He said he had tried to keep the world warm, and he burned it instead.”', to: 'told' },
        ],
      },
      told: {
        speaker: RUQAYA, mood: 'sad', effects: [{ unlockLore: 'lore:the-kings-stair' }],
        text: '(For a long time she does not move. Then the tears come out of her blind eyes and run down into the scars, and she lets them.) Ten thousand times I have told that story. We teach our children his name before their own, so that they will never give it to a son. We spit when we say it. And he was only trying to keep the world warm. (She laughs, wetly.) Forty years blind, and I never saw it. I have been telling it wrong all my life.',
        next: 'stair',
      },
      stair: {
        speaker: RUQAYA,
        text: 'Hear the right story, then. Under the glass of Qadir the Ashen Kings cut a stair down to the heart of the world: seven thousand steps, to carry fire down to it, not to steal it away. When Qadir burned, Ozrah sealed it with his own blood, so that no one would follow his mistake. It opens to the blood of the kings, or to a blessing from their daughters’ daughters. (She touches the scars on her face.) I am the last of his line who still reads the smoke.',
        choices: [
          { text: '“What does the stair cost?”', to: 'cost', once: true },
          { text: '“Bless me, Cindermother.”', to: 'bless', effects: UNSEAL('stair') },
        ],
      },
      cost: { speaker: RUQAYA, mood: 'sad', text: 'Seven thousand steps, and on every one of them a king tried and failed. They are still there, child. The ones who burned. They sit on the steps in their glass crowns and wait. Do not speak to them as you pass. They will want to know if it worked, and you will not be able to tell them yet.', next: 'stair' },
      bless: {
        speaker: 'narrator', effects: UNSEAL('stair'),
        text: 'She takes salt from the dish at her knee and puts it on your tongue. She takes ash from the brazier and draws a line down your brow with her thumb. Then she lifts your marked hand to her mouth and breathes smoke into the palm, slow and steady, as one breathes on a coal to wake it. Around the tent the Qasiri begin to sing, low, in a tongue nobody speaks any more. Far to the east, under the black glass of the Cinder Wastes, something answers: a long sigh in the stone, like a door that has been waiting four hundred years to be asked.',
        next: 'bless2',
      },
      bless2: {
        speaker: RUQAYA,
        text: 'There. The kings know you now. Go with water, child of the coal. And when you reach the bottom of the stair, tell the heart something for me. (Her voice goes very soft.) Tell it the Qasiri remember why. Only that. It has waited a long time to be thanked.',
      },
      closed: {
        speaker: RUQAYA, mood: 'sad',
        text: 'There is a stair, child of the coal. The kings cut it under the glass, and the last of them sealed it with his own blood. It opens to one who has stood before the Glass Throne and heard the king, and carried his words home. You have not. (She shakes her head.) The smoke shows me another door: under the Orrun’s mountain, at the foot of their Nails. Or your own hand. That hand opens everything. It is only the price that changes.',
      },
      again: { speaker: RUQAYA, text: 'The stair is open. The kings are sitting up on their steps, waiting for you. Go with water.' },
      other: { speaker: RUQAYA, text: 'You went down another way. The smoke says the stair is quiet, and the kings are disappointed. They are used to it. Go with water, child of the coal.' },
    },
  },
  // ----- the way down: the seal itself (the Ashmark burns it open; always available)
  {
    id: 'dialogue:obj-heartforge-seal', name: 'Object: The Heartforge seal',
    entries: [
      { when: all(unsealed, is('act3.way_down', 'burned')), node: 'scar' },
      { when: unsealed, node: 'open' },
      { when: active, node: 'seal' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'narrator', text: 'A round door of black iron, wider than a hall, set flat into the rock like the lid of a well. It is cold, and shut, and you have no reason yet to open it.' },
      seal: {
        speaker: 'narrator',
        text: 'At the foot of the ninth stair, where the Vault of the Nine Nails ends, the floor becomes a door: a round lid of black true-iron wider than a feasting hall, set flat into the rock like the lid of a well. Rings of runes run round it, inward, smaller and smaller, older than any Orrun hand. The iron is warm. When you lay your palm on it you feel it, faint and very slow, through the metal: a beat.',
        choices: [
          { text: '[Embersight] Read the runes through the mark.', to: 'runes', once: true },
          { text: '[Grimma] “Grimma. What is this?”', to: 'grimma', once: true, when: following('grimma-ironsong') },
          { text: 'Burn it open with the Ashmark.', to: 'burn', tag: 'aggressive', effects: [...UNSEAL('burned'), { reputation: 'faction:iron-concord', delta: -10 }] },
          { text: 'Leave it.', to: null, tag: 'leave' },
        ],
      },
      runes: {
        speaker: 'narrator',
        text: 'Through the mark the runes glow dull red, one ring at a time, outward to inward. They are Orrin script, and you should not be able to read it, but the Embers can. THIS IS THE LAST DOOR. WHAT IS BELOW IS NOT OURS. WE DUG FOR HIM AND THE HEAT CAME UP AND WE ARE RUST. LET NO HAND OPEN THIS THAT IS NOT HIS KIN. WE KEEP IT FOR HIM. WE KEEP IT FOR HIM. WE KEEP IT FOR HIM. The last ring is that line, over and over, smaller and smaller, until it is too small to see.',
        next: 'seal',
      },
      grimma: { speaker: 'npc:grimma-ironsong', mood: 'afraid', text: 'That’s Orrin work. Older than the Nails. Older than anything with my blood in it. (She takes her hand off it as if it were hot, and it is.) Burn it and every forge in the Ironspine will feel it go out from under the hammer. They’ll know it was you. They’ll know it was me stood by. (A breath.) Do it if you must, human. I’ll not stop you. I’ll not watch, either.', next: 'seal' },
      burn: {
        speaker: 'narrator', mood: 'afraid',
        text: 'You kneel and lay your marked hand flat on the iron and draw. All seven Embers answer. The runes under your palm go red, then white, then they run, and the true-iron runs with them like wax under a candle. Orrun runes are made to sing; these die singing, ring by ring, inward, a sound like a choir of anvils going out one by one. The mark takes its price as it goes. The skin of your hand turns black to the wrist, and the pain is so complete that it is almost quiet.',
        next: 'burn2',
      },
      burn2: {
        speaker: 'narrator',
        text: 'Then the door is gone, and a stair goes down into warm red dark, and the breath that comes up it smells of hot iron and of the sea. And far above you, in every hold of the Ironspine, every forge goes out at once for the space of a breath, and comes back, and the Orrun at the anvils look at one another across the sudden dark and know.',
      },
      open: { speaker: 'narrator', text: 'The great round door stands open. A stair goes down from it into warm dark, and the breath that comes up the stair beats, very slowly, like something asleep.' },
      scar: { speaker: 'narrator', text: 'Where the door was there is only a ring of slag, cooled into the shapes of runes that died singing. A stair goes down from it into warm dark. The iron at the rim is still warm. It will be warm for a hundred years.' },
    },
  },
  // ----- Nhal’s offer (opened by quest:the-heart-of-orr#nhal; also from obj:heartfire)
  {
    id: 'dialogue:ch9-nhal', name: 'Nhal: The offer at the Anvil of Ribs',
    entries: [
      { when: is('act3.nhal_offer', 'accepted'), node: 'n-after-yes' },
      { when: f('act3.nhal_offer'), node: 'n-after-no' },
      { node: 'n-anvil' },
    ],
    nodes: {
      'n-anvil': {
        speaker: 'narrator',
        text: 'The Anvil of Ribs is a floor of black iron as wide as a market square, scarred white at its centre where something struck it, once, very hard. Over it the ribs of Orr curve up into the dark like the vault of a cathedral built by giants for the god they buried inside it. Each rib is iron gone the red-brown of old blood, and each one is warm to the touch. You are standing where the world was made.',
        next: 'n-heart',
      },
      'n-heart': {
        speaker: 'narrator',
        text: 'Beyond the last rib the floor ends, and below it, so far down that the drop has its own weather, lies the Heart of Orr. It is a coal the size of a hill. Its crust is black and cracked like a loaf, and through the cracks a red light swells and fades, swells and fades: dim, so dim, the colour of a hearth at four in the morning when the house is cold and no one has got up yet. You count between the beats. You reach forty. Then it beats.',
        next: 'n-heart2',
      },
      'n-heart2': {
        speaker: 'narrator',
        text: 'Round the foot of the heart the black water has come up, as a tide comes up a harbour wall. It laps at the heart’s lowest curve, and where it touches it steams, and where it steams the light goes out a little. The Embers in your hand are burning so hot that you can hear them. They know where they are. They are home.',
        next: 'n-rise',
      },
      'n-after-no': { speaker: 'narrator', mood: 'afraid', text: 'Below the Anvil of Ribs the black water heaves about the foot of the heart. The mourner is waiting for you there, its faces turned up toward the light like faces turned up to rain. It said no one ever leaves. Go down and prove it wrong.' },
      'n-after-yes': { speaker: 'narrator', mood: 'hollow', text: 'It is in you now, a little: a warm, patient weight behind the breastbone, and a second heartbeat a little out of step with your own. Below, at the foot of the heart, it is waiting for you to put your hand in. It is in no hurry. It has never been in a hurry.' },
      ...NHAL_NODES,
    },
  },
];

export default dialogues;
