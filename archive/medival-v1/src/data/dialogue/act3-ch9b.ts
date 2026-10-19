/** Dialogue: Act III Chapter 9 "The Heart of Orr": dialogue:obj-heartfire, THE ENDING CHOICE (docs/lore/14-act3-spec.md). Owner: Claude 4.
 *  - act3.ending is set on the ending choice itself, with act3.complete and lore:ending-<x>. Rekindle becomes
 *    'iron-lantern' automatically (a twin gated choice) when the Church holds power and the lower city was not saved.
 *  - Reforge sets act3.ending first, then asks for the keeper; act3.keeper and act3.complete are set on that choice.
 *    If the scene is closed in between, obj:heartfire reopens at the keeper question.
 *  - Before the ending this object is also the backup for Nhal’s offer (shared nodes from act3-ch9.ts);
 *    after act3.complete it replays the epilogue sequence.
 *  - act3.usurp_name ('kept' | 'lost') is an extra flavour flag for the Usurp epilogue. */
import type { DialogueChoice, DialogueDef, NarrativeCondition, NarrativeEffect } from '@/core';
import { NHAL_NODES } from './act3-ch9';
import { OPEN_EPILOGUE } from '../quests/act3-ch9';

const QH = 'quest:the-heart-of-orr';
const MAREN = 'npc:maren-hollis' as const;
const ANSELM = 'npc:anselm-pryde' as const;
const HESTA = 'npc:hesta-corrow' as const;
const CADOC = 'npc:cadoc-ap-ynys' as const;
const GRIMMA = 'npc:grimma-ironsong' as const;
const SABLE = 'npc:sable' as const;
const VESPER = 'npc:vesper-qadri' as const;
const YSOLDE = 'npc:ysolde' as const;
const VELLANE = 'npc:castor-vellane' as const;
const NHAL = 'npc:nhal-risen' as const;

const f = (flag: string): NarrativeCondition => ({ flag });
const is = (flag: string, value: string): NarrativeCondition => ({ flag, op: '==', value });
const all = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: c });
const any = (...c: NarrativeCondition[]): NarrativeCondition => ({ any: c });
const not = (c: NarrativeCondition): NarrativeCondition => ({ not: c });
const following = (slug: string): NarrativeCondition => f(`companion.${slug}.following`);
const stage = (s: string): NarrativeCondition => ({ questStage: QH, stage: s });

// ----- who is here
const maren = following('maren-hollis'), anselm = following('anselm-pryde'), cadoc = following('cadoc-ap-ynys');
const grimma = following('grimma-ironsong'), sable = following('sable'), vesper = following('vesper-qadri');
/** Hesta, if she lives, follows you to the end, whether or not she was in the party. */
const hestaAlive = f('act1.hesta_alive');
const ysoldeHere = any(is('act3.ysolde_fate', 'turned'), is('act3.ysolde_fate', 'spared'));
const tobinHome = any(is('prologue.tobin_fate', 'saved'), f('act1.tobin_saved'));
const tobinGone = any(is('prologue.tobin_fate', 'dead'), f('act1.tobin_lost'));
const sung = is('companion.cadoc-ap-ynys.verse', 'sung');

// ----- the endings’ gates (spec)
const iron = all(any(is('act2.church_stance', 'pledged'), is('act1.ruler', 'wick')), not(is('act3.lower_city', 'saved')));
const canReforge = all(f('act2.third_way_known'), any(sung, all(f('act1.ylwen_pact'), cadoc)));
const canQuench = any(ysoldeHere, not({ flag: 'act2.ysolde_doubt', op: '>=', value: 2 }));
const canUsurp = any(is('act3.nhal_offer', 'accepted'), { dialogueTag: 'hollow-touched' }, { classIs: 'class:reaver' });
const accepted = is('act3.nhal_offer', 'accepted');
const done = f('act3.complete');
const ended = (x: string) => all(done, is('act3.ending', x));

type Ending = 'rekindle' | 'iron-lantern' | 'quench' | 'usurp';
const END = (x: Ending): NarrativeEffect[] => [
  { setFlag: 'act3.ending', value: x },
  { setFlag: 'act3.complete', value: true },
  { unlockLore: `lore:ending-${x}` },
];
/** Reforge: the ending is chosen now, the keeper next. */
const REFORGE: NarrativeEffect[] = [
  { setFlag: 'act3.ending', value: 'reforge' },
  { unlockLore: 'lore:ending-reforge' },
  { unlockLore: 'lore:the-third-way', section: 'kept' },
];
const KEEP = (k: 'player' | 'ysolde' | 'hesta'): NarrativeEffect[] => [
  { setFlag: 'act3.keeper', value: k },
  { setFlag: 'act3.complete', value: true },
  { unlockLore: 'lore:the-keeper' },
];
const REPLAY: DialogueChoice[] = [
  { text: 'Close your eyes, and remember how it ended.', to: null, effects: OPEN_EPILOGUE },
  { text: 'Take your hand away.', to: null, tag: 'leave' },
];

const dialogues: DialogueDef[] = [
  {
    id: 'dialogue:obj-heartfire', name: 'Object: The Heartfire (the ending)',
    entries: [
      // after the end: the heart as it is now, and the epilogue again
      { when: ended('rekindle'), node: 'a-rekindle' },
      { when: ended('iron-lantern'), node: 'a-iron' },
      { when: all(ended('reforge'), is('act3.keeper', 'player')), node: 'a-keeper-player' },
      { when: ended('reforge'), node: 'a-reforge' },
      { when: ended('quench'), node: 'a-quench' },
      { when: ended('usurp'), node: 'a-usurp' },
      { when: done, node: 'a-generic' },
      // Reforge chosen, keeper not yet
      { when: is('act3.ending', 'reforge'), node: 'r-keeper' },
      // the Usurp, with Nhal
      { when: accepted, node: 'u-joined' },
      // the choice
      { when: stage('choice'), node: 'h-start' },
      // before the choice: Nhal guards the heart, or its offer has not yet been heard
      { when: all(stage('nhal'), f('act3.nhal_offer')), node: 'h-guarded' },
      { when: stage('nhal'), node: 'n-heart-obj' },
      { node: 'h-idle' },
    ],
    nodes: {
      'h-idle': { speaker: 'narrator', text: 'The Heart of Orr beats below you, dim and slow. You count to forty between the beats. It is not yet time.' },
      'h-guarded': { speaker: 'narrator', mood: 'afraid', text: 'Nhal is coiled about the foot of the heart like smoke about a dying fire, and every one of its faces turns toward you as you come near. Nothing will lay a hand on the Heartfire while the Drowned One stands.' },
      'n-heart-obj': {
        speaker: 'narrator',
        text: 'You come down at last to the foot of the Heart of Orr. It is a coal the size of a hill, black-crusted and cracked like a loaf, and through the cracks a red light swells and fades, dim as a hearth at four in the morning. You count between the beats. You reach forty. Round its foot the black water has come up like a tide against a harbour wall, and where it touches the heart it steams, and the light goes out a little. The Embers in your hand know where they are. They are home.',
        next: 'n-rise',
      },
      ...NHAL_NODES,

      // ================= the choice =================
      'h-start': {
        speaker: 'narrator',
        text: 'Nhal comes apart the way a wave comes apart on shingle: all at once, and then for a long time. The thousand faces sink back into the water without a sound. The water goes flat. It is only water now: the Dreaming, with no thought in it, for the first time since a god leapt in. It does not seem to know that it has lost anything.',
        next: 'h-start2',
      },
      'h-start2': {
        speaker: 'narrator',
        text: 'And over it, close now, the Heart of Orr. Its heat is on your face like an opened oven, and yet it is not enough heat; you can feel exactly how not enough it is. The crust is black. The light in the cracks is the red of a cooling horseshoe. The beat comes, and you count to forty, and to forty-one. In your hand seven Embers lean toward it the way a sick man leans toward a fire.',
        choices: [
          { text: '[Footsteps on the stair behind you]', to: 'v-arrive', when: iron },
          { text: '[Turn to those who came down with you]', to: 'h-hub', when: not(iron) },
        ],
      },
      'v-arrive': {
        speaker: 'narrator',
        text: 'Lanterns. A long line of them, coming down the stair from the Anvil of Ribs: the Brand-lit lanterns of every cathedral of the Lanternate, dark as blind eyes since the Night of Falling Ash, carried by Lightsworn in grey cloaks rimed white. At their head walks Lord-Inquisitor Castor Vellane, bareheaded, carrying nothing at all. Behind him, very far up, the smoke of the lower city of Haldren is still on his cloak.',
        next: 'v-arrive2',
      },
      'v-arrive2': {
        speaker: VELLANE,
        text: 'Ashmarked. You have done what the Church could not, and I will say so in Solenne, before the Hierophant and the whole of the Lanternate, on my knees if need be. (He looks up at the heart, and something crosses his face that might be awe.) Now finish it. Give the fire back to the fire, and let my lanterns carry it home. There will be a Brand again. It will never again be left unattended.',
        next: 'h-hub',
      },
      'h-hub': {
        speaker: 'narrator',
        text: 'The heart beats. Around you, at the foot of a dead god, stand those who came all this way down with you, and they are waiting to see what you will do.',
        choices: [
          { text: '[Maren] Look to Maren.', to: 'c-maren-home', once: true, when: all(maren, tobinHome) },
          { text: '[Maren] Look to Maren.', to: 'c-maren-gone', once: true, when: all(maren, tobinGone) },
          { text: '[Maren] Look to Maren.', to: 'c-maren', once: true, when: all(maren, not(tobinHome), not(tobinGone)) },
          { text: '[Anselm] Look to Anselm.', to: 'c-anselm-wick', once: true, when: all(anselm, is('companion.anselm-pryde.path', 'inquisitor')) },
          { text: '[Anselm] Look to Anselm.', to: 'c-anselm', once: true, when: all(anselm, not(is('companion.anselm-pryde.path', 'inquisitor'))) },
          { text: '[Hesta] Look to Hesta.', to: 'c-hesta', once: true, when: hestaAlive },
          { text: '[Cadoc] Look to Cadoc.', to: 'c-cadoc-sung', once: true, when: all(cadoc, sung) },
          { text: '[Cadoc] Look to Cadoc.', to: 'c-cadoc', once: true, when: all(cadoc, not(sung)) },
          { text: '[Grimma] Look to Grimma.', to: 'c-grimma', once: true, when: grimma },
          { text: '[Sable] Look to Sable.', to: 'c-sable-saved', once: true, when: all(sable, is('companion.sable.fate', 'saved')) },
          { text: '[Sable] Look to Sable.', to: 'c-sable', once: true, when: all(sable, not(is('companion.sable.fate', 'saved'))) },
          { text: '[Vesper] Look to Vesper.', to: 'c-vesper-iron', once: true, when: all(vesper, iron) },
          { text: '[Vesper] Look to Vesper.', to: 'c-vesper', once: true, when: all(vesper, not(iron)) },
          { text: '[Ysolde] Look to Ysolde.', to: 'c-ysolde-turned', once: true, when: is('act3.ysolde_fate', 'turned') },
          { text: '[Ysolde] Look to Ysolde.', to: 'c-ysolde-spared', once: true, when: is('act3.ysolde_fate', 'spared') },
          { text: '[Vellane] Look to the Lord-Inquisitor.', to: 'c-vellane', once: true, when: iron },
          { text: 'Go to the heart.', to: 'h-choose' },
        ],
      },
      'c-maren-home': { speaker: MAREN, text: 'Tobin’s at Cinderhold, sulking because I wouldn’t let him come. (She doesn’t take her eyes off the heart.) Whatever you do with that, make it a world he gets to grow up in. A real one. With mud in it, and bad weather, and girls who laugh at him. I don’t care about the rest.', next: 'h-hub' },
      'c-maren-gone': { speaker: MAREN, mood: 'sad', text: 'If it all went to sleep. If it all just… went into the water. Would he be in there? Would I find him? (Before you can answer:) Don’t. Don’t tell me. I don’t want to know which answer I’d want.', next: 'h-hub' },
      'c-maren': { speaker: MAREN, text: 'I’ve shot a lot of things since Brindlecross. Never a god. Never thought I’d stand at the bottom of the world with one in front of me and no arrow that’d do any good. (She slings her bow across her back.) Your choice. I’ll stand behind it. Hearth and kin.', next: 'h-hub' },
      'c-anselm-wick': { speaker: ANSELM, text: 'The Church would tell you to give it back to the fire, and let the fire be kept. I find I still believe that. Not because the Church says it, but because I have seen what unkept fire does, and what unkept dark does. (Quietly.) Choose as though Wenna were watching. I rather think she is.', next: 'h-hub' },
      'c-anselm': { speaker: ANSELM, mood: 'sad', text: 'All my life I prayed to a light that was carried up out of this place in a shepherd-girl’s hands. I thought it was a gift. It was a loan. (He smiles, very tired.) Whatever you do, my friend, do it knowing that no god is going to come down and tell you that you were right. That is what faith is, I think. I only learned it this year.', next: 'h-hub' },
      'c-hesta': { speaker: HESTA, text: '(She has come all the way down after you, coughing at every step, though she swore at Cinderhold she would stay and keep the fire.) Don’t look at me like that. I lied. I’m old; I’m allowed. (She looks up at the heart a long while.) Two hundred years the Wardens wrote reports about this, and not one of us ever stood here. Go on, child. You know what each road costs. I taught you to count.', next: 'h-hub' },
      'c-cadoc-sung': { speaker: CADOC, text: 'I have the whole of it in my mouth now. The last verse too, the one that drowned with Ys; it tastes of lake water. (He turns a leaf over in his long fingers.) Say the word and I will sing it with you. And then someone will have to stay in the room. I have not forgotten. I only want you to know that I have not.', next: 'h-hub' },
      'c-cadoc': { speaker: CADOC, text: 'I know enough of the song to try, and you know the rest of it from me, which is either reassuring or not, depending on what you think of my teaching. (A small, dry smile.) My people swore never to sing it again. I am about to be very forsworn indeed. I find I am looking forward to it.', next: 'h-hub' },
      'c-grimma': { speaker: GRIMMA, text: 'Look at it. Biggest forge I’ll ever stand at, and the fire’s nearly out, and no bellows in the world big enough. (She lays her hand flat on the warm stone.) My folk dug for this and rusted where they stood. Whatever you do, human, strike once, and strike true. A botched blow’s worse than none. That’s all the advice a smith has.', next: 'h-hub' },
      'c-sable-saved': { speaker: SABLE, text: 'It’s singing ever so loud down here, love. Not to me, not any more. I came back up out of the water, remember? (She wipes her eyes; the tears are clear.) So I know what it sounds like when it says it’ll all be nice. And I know it’s lying. Mostly. That’s the bit that frightens me. Mostly.', next: 'h-hub' },
      'c-sable': { speaker: SABLE, mood: 'hollow', text: 'It’s singing ever so loud down here. (Her hand is cold in yours, and the black has come up to the rims of her eyes.) Hold on to me while you choose, would you? Only I keep wanting to go and lie down in it, and it’d be ever so rude to do that in front of a god.', next: 'h-hub' },
      'c-vesper-iron': { speaker: VESPER, mood: 'angry', text: '(She is watching the Lightsworn and their dark lanterns the way a cat watches dogs.) There it is. The Church, come all the way to the bottom of the world to put a licence on the fire. (Low and fierce.) Give it to him, bearer, and every hearth in Morvane burns by his leave for a thousand years. I burned an abbey to say no to that. I would burn the stair.', next: 'h-hub' },
      'c-vesper': { speaker: VESPER, text: 'Fire belongs to everyone. I have said so in forty market squares and been arrested in thirty. (She looks at the heart, and for once the fire in her eyes is only a reflection.) I never thought about whose it was before it was ours. His. Whatever you do, bearer, don’t you dare give it back to a church.', next: 'h-hub' },
      'c-ysolde-turned': { speaker: YSOLDE, text: 'Whatever you choose, I will not stop you. Not this time. I chose for the whole world once, little spark: alone, in the dark, because I thought no one else could bear to. (She folds her wet hands.) I was wrong about the bearing. I was wrong about the dark. Choose. I will stand wherever you put me.', next: 'h-hub' },
      'c-ysolde-spared': { speaker: 'narrator', mood: 'sad', text: 'Ysolde has come down after you, the way a ghost follows a lantern. She stands at the edge of the flat water with her arms wrapped round herself, very thin, very white. When you look at her she says, without looking up, “Don’t ask me. I don’t know any more. I used to know.” And then, smaller: “It isn’t gentle, is it. It was never going to be gentle.”', next: 'h-hub' },
      'c-vellane': { speaker: VELLANE, text: 'You are wondering whether I will try to take them from you. I will not. I am not a thief, Ashmarked. I am a steward. (He folds his hands behind his back.) Give the fire back to the fire, and let it be kept. Order is not a cruel word. It is only the word for what keeps children warm.', next: 'h-hub' },
      'h-choose': {
        speaker: 'narrator',
        text: 'You walk the last steps to the foot of the heart. Seven Embers lean out of your hand toward it. Every way the world could go is in that hand: an age of fire bought on credit; a song and a keeper; a long, kind sleep; a new god. There is no one left to choose for you. There never was.',
        choices: [
          { text: '“Take them back.” Give the Embers to the Heartfire, and rekindle it.', to: 'rk-1', when: not(iron), effects: END('rekindle') },
          { text: '“Take them back.” Give the Embers to the Heartfire, and rekindle it. (Vellane’s lanterns are waiting.)', to: 'il-1', when: iron, effects: END('iron-lantern') },
          { text: 'Sing the Lullaby. Reforge the heart into something new.', to: 'rf-1', when: canReforge, lockedLabel: '[The whole Lullaby, and the third way]', effects: REFORGE },
          { text: 'Give the Embers to the water. “Let it dream.”', to: 'q-1', when: canQuench, lockedLabel: '[The Pale Saint’s mercy is not yours]', effects: END('quench') },
          { text: 'Take the heart for yourself.', to: 'us-1', when: canUsurp, effects: END('usurp') },
          { text: '“Not yet.”', to: 'h-hub' },
        ],
      },

      // ================= REKINDLE =================
      'rk-1': {
        speaker: 'narrator',
        text: 'You open your hand. They have been in it so long you had forgotten they could leave: the Ember of the Mere, that came up black out of Wennamere; the Fen, from Aldwin Varn’s drowned hall; the Deep, the Wolf, the Tide, the Glass; and the seventh, the Lantern, the last coal of the Brand. You hold them out to the heart of the god who struck the world, and you give them back.',
        next: 'rk-2',
      },
      'rk-2': {
        speaker: 'narrator',
        text: 'The heart takes them as a drowning man takes a breath. The beat comes, and you begin to count, and you have barely reached ten when it comes again; and again at five; and then it is beating, beating, like a heart that has broken a fever and remembered it is young. The cracks in its crust go red, then gold, then a white you cannot look at. The black water hisses back from its foot and runs away down into the deep places, crying.',
        next: 'rk-3',
      },
      'rk-3': {
        speaker: 'narrator', mood: 'happy',
        text: 'Through the mark you see it go up. The leys flare one after another through the rock of the world, like a city lighting its lanterns at dusk: under Korrath, under Haldren, under the frozen River Under, where the dead standing on the ice feel it begin to soften beneath their feet. In Cinderhold the brazier roars up to the rafters. On the moors above Brindlecross the snow goes grey, and then to water, and something green pushes up through it, astonished.',
        next: 'rk-4',
      },
      'rk-4': {
        speaker: 'narrator', mood: 'sad',
        text: 'And then the thread goes. The Ashmark has carried seven Embers across the world, and now it has nothing left to carry. It burns down out of your hand the way a wick burns down into the wax: first the light, then the warmth, and what is left is a scar. Only a scar. You will make a fist with that hand again. You will never again feel the heart of the world beating at the other end of it.',
        next: 'rk-5',
      },
      'rk-5': {
        speaker: 'narrator', mood: 'sad',
        text: 'Below, the water has gone down into the dark, chained again, dreaming again. With the last of the mark you can still just hear it: not Nhal, for Nhal is gone, but the old sea itself, robbed of its world a second time and mourning in its sleep. It will wait. It is good at waiting. Every fire burns down. Three hundred years, perhaps four, and the cooling will begin again, and someone will stand where you are standing with a hand full of fire, and have to choose.',
        next: 'rk-6',
      },
      'rk-6': {
        speaker: 'narrator',
        text: 'At your feet a coal has broken from the heart and rolled to rest on the stone: small enough to carry, bright enough to read by, and it does not go out. You know what it is. Twelve hundred years ago a shepherd-girl picked one up in this place and carried it up into the cold, and they built a city round it and called it the Brand. You stoop and lift it. It is warm. It is only warm. You turn, and begin the long climb up toward the spring.',
      },

      // ================= THE IRON LANTERN =================
      'il-1': {
        speaker: 'narrator',
        text: 'You open your hand. Behind you the Lightsworn spread out along the rim of the dark, lifting their dead lanterns like offerings. The Mere, the Fen, the Deep, the Wolf, the Tide, the Glass, and the Lantern last, the final coal of the Brand: you hold them out to the heart of the god who struck the world, and you give them back.',
        next: 'il-2',
      },
      'il-2': {
        speaker: 'narrator',
        text: 'The heart takes them as a drowning man takes a breath. The beat comes at ten, then at five, then it is beating like a heart that has broken a fever. The cracks go red, gold, white. The black water hisses back from the heart’s foot and runs away down into the dark, crying, and through the mark you feel the leys flare up through the world like a city lighting its lanterns at dusk.',
        next: 'il-3',
      },
      'il-3': {
        speaker: 'narrator',
        text: '“Now,” says Vellane. One by one the Lightsworn step forward and lower their lanterns into the light pouring from the heart, and one by one the wicks catch, white-gold, Brand-fire, until the lanterns of every cathedral in the Lanternate are burning at the bottom of the world. Then the Lord-Inquisitor himself kneels at the heart with tongs of black Wick-iron, and draws from it a coal the size of a fist, and shuts it in a cage of lantern-iron. It is a Brand. It is his.',
        next: 'il-4',
      },
      'il-4': {
        speaker: VELLANE,
        text: '(He holds it up. Its light fills his face, and he is weeping, and does not seem to know it.) I do not hate magic, child. I have never hated magic. I hate fire left unattended. (He closes the cage, very gently.) From tonight, it will never be unattended again.',
        choices: [
          { text: '“It isn’t yours, Vellane.”', to: 'il-5a' },
          { text: '“Then attend it well.”', to: 'il-5b' },
          { text: '[Say nothing]', to: 'il-5c' },
        ],
      },
      'il-5a': { speaker: VELLANE, text: 'No. It is everyone’s. That is precisely why someone must keep it. (Almost kindly.) You will understand when you are older. Or you will not, and you will be watched. Either way, you will be warm.', next: 'il-6' },
      'il-5b': { speaker: VELLANE, text: 'I will. With every lantern of the Lanternate and every inquisitor of the Wick, I will attend it as no fire has ever been attended. (He inclines his head to you, briefly, as to an equal.) Thank you, Ashmarked.', next: 'il-6' },
      'il-5c': { speaker: 'narrator', text: 'You say nothing. He nods, as though nothing were the answer he had expected from you, and turns toward the stair.', next: 'il-6' },
      'il-6': {
        speaker: 'narrator', mood: 'sad',
        text: 'The lanterns go up the stair in a long gold line, like the procession at Lanternmass. The heart is strong. The leys are lit. Spring will come. And in the age that follows, every fire in Morvane will burn by licence. Every hearth will be tallied and every hedge-witch named. The Wick will walk every road with a lantern lit from the new Brand, trimming. The children of the Haldmarch will grow up warm and fed and watched, and they will be taught to thank the Church for the sun.',
        next: 'il-7',
      },
      'il-7': {
        speaker: VELLANE,
        text: '(At the foot of the stair he stops, and turns, and looks at your marked hand. The mark is already going dark. He looks at it all the same, the way a careful man looks at a door he means to lock.) And that, Ashmarked, we will discuss in Solenne.',
      },

      // ================= REFORGE =================
      'rf-1': {
        speaker: 'narrator',
        text: 'You do not give the Embers to the fire. You do not give them to the water. You hold them, all seven, in your marked hand, and step down to the place where the heart of the world meets the edge of the black sea, one foot in the light and one in the dark. The song is in your throat already. It has been there since Ylwen, waiting to be asked.',
        choices: [
          { text: '[Cadoc] Nod to Cadoc.', to: 'rf-cadoc-sung', when: all(cadoc, sung) },
          { text: '[Cadoc] Nod to Cadoc.', to: 'rf-cadoc', when: all(cadoc, not(sung)) },
          { text: 'Sing.', to: 'rf-alone', when: not(cadoc) },
        ],
      },
      'rf-cadoc-sung': {
        speaker: CADOC,
        text: '(He comes down beside you and takes your free hand in his long, cold fingers.) Hun-Aerwen. The whole of it, at last. (And he sings: the first verse, that every Thornwise child knows; the middle, that only the Archdruid knows; and then the last, the verse that drowned with Ys Aerwen eleven hundred years ago. His voice cracks on it. He does not stop. You sing it with him.)',
        next: 'rf-2',
      },
      'rf-cadoc': {
        speaker: CADOC,
        text: '(He comes down beside you and takes your free hand in his long, cold fingers.) Badly, then, and together. That is how most good things are done. (He sings, and where his memory falters the song comes up out of you instead, as though it had been waiting there; and where yours falters, he is there. Between you, it is whole.)',
        next: 'rf-2',
      },
      'rf-alone': {
        speaker: 'narrator',
        text: 'You sing. Your voice was not made for it; no human voice was. But you learned the last verse in the drowned court of Ys, among the bones of the people who sang it too well, and you know now what they did wrong. They sang to the Mire as to a beast to be lulled. You sing to it as to someone asleep in the next room.',
        next: 'rf-2',
      },
      'rf-2': {
        speaker: 'narrator',
        text: 'The Mire hears. The black water, which has been heaving at the foot of the heart since Nhal came apart in it, goes still and listens, the way a sleeper goes still when someone says their name. Then it begins to breathe more slowly. Not chained. Not drowned. Asleep: truly asleep, for the first time since a god came up out of it with a coal in his fist and took its world away.',
        next: 'rf-3',
      },
      'rf-3': {
        speaker: 'narrator',
        text: 'Then you put your marked hand into the heart. All seven Embers go out of you into it at once, and the Ashmark goes with them like a thread drawn through a needle, and you feel the heart of the world come apart under your hand and go back together. Not the way he made it. Fire and water, braided as a rope is braided: the warm and the dark wound round each other, each holding the other up. Not Orr’s chain. Not Nhal’s mouth. A pact.',
        next: 'rf-4',
      },
      'rf-4': {
        speaker: 'narrator', mood: 'happy',
        text: 'The heart beats. You count, and reach seven, and it beats again: slow and steady and strong, and different, a sound with a hush inside it like a tide. Through what is left of the mark you feel the leys warm all through the world, and beneath them, for the first time since the Forging, the Mire is not straining at the Nails. It is dreaming, gently, beside the world, of the world. Very far above, on every frozen hill of Morvane, the snow has begun to sigh and sink. Spring is coming. Real spring. Not for a season. For good.',
        next: 'rf-5',
      },
      'rf-5': {
        speaker: 'narrator', mood: 'sad',
        text: 'And the song does not stop when you stop singing. It goes on in the heart, thin as a thread, and the thread wants a voice. You knew it would. Rhiannon told you, or Brother Ossory’s book; Cadoc told you, turning a leaf. A heart must be kept. Someone must stay down here with it and sing it to sleep each night until the end of the world. They do not come back up.',
        next: 'r-keeper',
      },
      'r-keeper': {
        speaker: 'narrator',
        text: 'Between one beat and the next the song thins, and wavers, and waits. Someone must stay.',
        choices: [
          { text: '“I will stay.”', to: 'k-p1', effects: KEEP('player') },
          { text: '[Ysolde] Ysolde has stepped forward, into the edge of the light. Let her stay.', to: 'k-ysolde', when: ysoldeHere, effects: KEEP('ysolde') },
          { text: '[Hesta] Hesta is already walking past you toward the heart. Let her stay.', to: 'k-hesta', when: hestaAlive, effects: KEEP('hesta') },
        ],
      },
      // --- the Ashmarked stays
      'k-p1': {
        speaker: 'narrator',
        text: 'You knew it would be you. Perhaps you knew at Cinderhold, the first night, with your hand in the brazier. You step into the light of the heart, and the song comes into your mouth as easily as breath, and you understand, the way the Embers understood where they were, that you will never climb the stair again.',
        next: 'k-fare',
      },
      'k-fare': {
        speaker: 'narrator',
        text: 'Those who came down with you are standing at the edge of the light. They cannot come any nearer. You find that you can still speak, between verses.',
        choices: [
          { text: '[Maren] Say goodbye to Maren.', to: 'f-maren', once: true, when: maren },
          { text: '[Anselm] Say goodbye to Anselm.', to: 'f-anselm', once: true, when: anselm },
          { text: '[Hesta] Say goodbye to Hesta.', to: 'f-hesta', once: true, when: hestaAlive },
          { text: '[Cadoc] Say goodbye to Cadoc.', to: 'f-cadoc', once: true, when: cadoc },
          { text: '[Grimma] Say goodbye to Grimma.', to: 'f-grimma', once: true, when: grimma },
          { text: '[Sable] Say goodbye to Sable.', to: 'f-sable', once: true, when: sable },
          { text: '[Vesper] Say goodbye to Vesper.', to: 'f-vesper', once: true, when: vesper },
          { text: '[Ysolde] Say goodbye to Ysolde.', to: 'f-ysolde', once: true, when: ysoldeHere },
          { text: 'Turn back to the heart.', to: 'k-p2' },
        ],
      },
      'f-maren': { speaker: MAREN, mood: 'sad', text: 'No. No, you don’t get to. (Her voice breaks. She takes your collar in both fists as if to drag you out, and then she only holds on.) …Hearth and kin. I’ll tell them. I’ll tell them so loud they hear it down here. You listen for it.', next: 'k-fare' },
      'f-anselm': { speaker: ANSELM, mood: 'sad', text: 'I will say the office for you every night. Not because you will need it. Because I will. (He makes the sign of the Seven over you, and then, after a moment, a small eighth circle.) Go with every god, my friend. Even the one who is gone.', next: 'k-fare' },
      'f-hesta': { speaker: HESTA, mood: 'sad', text: 'That was supposed to be me. I had it all planned, you stubborn— (She coughs, and coughs, and wipes her mouth with the back of a burned hand.) You’re a better warden than I ever was, child. Keep it lit.', next: 'k-fare' },
      'f-cadoc': { speaker: CADOC, text: 'I said I had wondered what it would be like to stay in that room. (He sits down cross-legged at the very edge of the light.) I think I shall sit here a while and find out from the doorway. A year or two. We Aelthi are not in a hurry. Sing; I will correct your vowels.', next: 'k-fare' },
      'f-grimma': { speaker: GRIMMA, mood: 'sad', text: 'I’ll put you in the ledger. Owed: everything. (Her jaw works.) Korr nagh, human. You struck true.', next: 'k-fare' },
      'f-sable': { speaker: SABLE, mood: 'sad', text: 'Don’t you go getting cold down here, love. (She leans into the edge of the light and kisses your cheek; her lips are warm, the warmest you have ever felt them.) I’ll nick you something nice and throw it down the stair.', next: 'k-fare' },
      'f-vesper': { speaker: VESPER, mood: 'sad', text: 'Free fire, kept by no church, owned by no one, sung to sleep by a friend. (She laughs, and it comes out wrong.) It is the most beautiful thing I have ever seen, and I hate it. Goodbye, bearer.', next: 'k-fare' },
      'f-ysolde': { speaker: YSOLDE, mood: 'sad', text: '(She kneels at the edge of the light, as she once knelt on the black water.) It should be me. You know it should be me. (When you shake your head, she bows hers.) Then I will go up, and be cold, and be hated, and live. That is the harder penance. You have chosen it for me. Thank you, little spark.', next: 'k-fare' },
      'k-p2': {
        speaker: 'narrator', mood: 'sad',
        text: 'They go up. You watch their lanterns climb past the Anvil of Ribs, smaller and smaller, until they are a line of sparks, and then one spark, and then the dark. You go on singing. You find that you cannot stop, and that you do not want to.',
        next: 'k-p3',
      },
      'k-p3': {
        speaker: 'narrator', mood: 'sad',
        text: 'Above you, very far above, it will be spring. You will not see it. You will not feel the sun again, or rain, or anyone’s hand. Years will go over you like weather over a hill. The people who loved you will grow old and die and be carried down the River Under, and some nights you will feel them pass, close by in the dark, and sing a little louder. You are the keeper of the heart of the world. You will be here when the last of them is dust, and the last of their children’s children. You will be here at the end.',
        next: 'k-p4',
      },
      'k-p4': {
        speaker: 'narrator',
        text: 'And it is not nothing, down here. The Mire sleeps against your back like some great warm animal, dreaming of the world. The heart beats against your palms, slow and steady and strong. Every hearth in Morvane is lit from it, and you can feel every one: a shepherd’s fire in the Witherdowns, a ship’s lamp off the Saltreach, a child’s candle in Brindlecross. You sing them all to sleep. You sing them all awake.',
      },
      // --- Ysolde stays
      'k-ysolde': {
        speaker: YSOLDE,
        text: 'Let me. (She is already in the edge of the light.) Please. I put out every hearth in the world, little spark. Let me keep one. Let me keep all of them. (Her voice shakes.) I know how to keep a fire. It was the only thing I was ever good at, before.',
        next: 'k-ysolde2',
      },
      'k-ysolde2': {
        speaker: 'narrator',
        text: 'She walks into the heart. Where the light touches her the black water runs off her hair and robe and does not come back; her halo of dark water boils away to steam and is gone; and for the first time in ten years Ysolde Maerin is warm. She kneels in the light and lays her hands on the heart of the world as she once laid them on the Brand, and she begins to sing. She does not know the song. The heart teaches it to her.',
        choices: [
          { text: '[Hesta] Hesta has come to the edge of the light.', to: 'k-ys-hesta', when: hestaAlive },
          { text: 'Climb the stair.', to: 'k-ysolde3', when: not(hestaAlive) },
        ],
      },
      'k-ys-hesta': { speaker: HESTA, text: 'Girl.', next: 'k-ys-hesta2' },
      'k-ys-hesta2': { speaker: YSOLDE, mood: 'happy', text: '(She does not turn round. She does not stop singing for longer than a breath.) Mistress. I’ll keep it lit.', next: 'k-ys-hesta3' },
      'k-ys-hesta3': { speaker: HESTA, mood: 'sad', text: '(For a long moment Hesta cannot speak at all. Then:) See that you do. (And she turns and starts up the stair first, ahead of everyone, so that no one will see her face.)', next: 'k-ysolde3' },
      'k-ysolde3': {
        speaker: 'narrator', mood: 'sad',
        text: 'You climb. Behind you the song goes on, thin and sweet and a little out of tune, and it does not stop. Up above, no one will ever thank her. The Lanternate will write her name in its book of heretics; the Haldish will spit when they say it; mothers will frighten their children with the Pale Saint for a thousand years. And every one of those children will be warm because of her, and none of them will ever know. She asked for that too. Spring comes in at your heels.',
      },
      // --- Hesta stays
      'k-hesta': {
        speaker: HESTA,
        text: '(She is already walking past you toward the light, coughing.) No. Not you, child. You’re young, and you’ve a face people would miss. I’ve been living on borrowed time since Varn; I felt it go past me like a cart in a lane. Let me spend it on something.',
        next: 'k-hesta2',
      },
      'k-hesta2': {
        speaker: HESTA,
        text: '(She stops at the very edge of the light and looks into the heart, and her face, for once, is not caustic at all.) My whole life I’ve kept a fire hidden. In cellars, in ruins, in my own chest. Wardens’ fire, that the Church would have burned me for. I should like, just once, to sit by one I don’t have to hide.',
        choices: [
          { text: '[Ysolde] Ysolde is standing at the water’s edge, watching her.', to: 'k-hesta-ys', when: ysoldeHere },
          { text: 'Let her go.', to: 'k-hesta3', when: not(ysoldeHere) },
        ],
      },
      'k-hesta-ys': { speaker: HESTA, text: '(She does not turn round.) Go up, girl. Go up and be cold and hated and alive with the rest of them. That’s your penance. This is mine. (A pause.) I kept your letter. It’s in my coat. I’m taking it with me.', next: 'k-hesta3' },
      'k-hesta3': {
        speaker: 'narrator', mood: 'sad',
        text: 'She walks into the heart of the world and sits down in it, carefully, the way an old woman sits down at her own hearth at the end of a long day. She begins to sing in a cracked voice, badly and defiantly, the song she heard you humming on the road. Halfway through the first verse her cough stops. You climb. Behind you the song goes on, and on. Above, spring is coming in over the moors, and the brazier at Cinderhold burns with no one left to tend it, and it does not go out.',
      },

      // ================= QUENCH =================
      'q-1': {
        speaker: 'narrator',
        text: 'You turn your back on the heart. At its foot the black water lies flat and quiet, with no one in it. Nhal is gone. What is left is only the Dreaming: vast, slow, bottomless and harmless, the sea that was here before there was a here. It does not want anything. It only dreams. You kneel at its edge.',
        choices: [
          { text: '[Ysolde] Ysolde kneels beside you.', to: 'q-ys', when: ysoldeHere },
          { text: 'Open your hand.', to: 'q-2', when: not(ysoldeHere) },
        ],
      },
      'q-ys': {
        speaker: YSOLDE, mood: 'sad',
        text: '(She kneels at your side and puts her wet hand under yours, to help you hold them.) It will be gentle now. He is gone, and it will be gentle, the way I saw it in the Brand. The way I promised. (She is weeping.) I am so sorry, little spark. I am so glad. I cannot tell which.',
        next: 'q-2',
      },
      'q-2': {
        speaker: 'narrator',
        text: 'You open your hand into the water. The Embers go down one by one, the Mere and the Fen and the Deep, the Wolf and the Tide and the Glass, and the Lantern last of all, turning slowly as they sink, like coins dropped into a well. The water takes them without a sound. For a long while you can see them glowing, far down. Then you cannot.',
        next: 'q-3',
      },
      'q-3': {
        speaker: 'narrator',
        text: 'The heart does not go out all at once. It sighs. The beat comes, and comes again, more slowly; you count to forty, to sixty, to a hundred, and lose count. Then the next beat does not come. The red goes out of the cracks the way colour goes out of a cheek, and the Heart of Orr is a black stone in the dark, and the dark is very, very quiet.',
        next: 'q-4',
      },
      'q-4': {
        speaker: 'narrator', mood: 'hollow',
        text: 'With the very last of the mark you watch it go up through the world, gently, the way frost goes off a window when the sun comes round. On the walls of Haldren the soldiers put down their spears and sit, and then lie down, smiling, and the Hollowed in the snow below lie down among them, and no one is afraid. In Brindlecross a mother puts her child to bed and lies down beside it, and neither of them wakes. The sea comes up over the Saltreach, and the land does not mind. The stones of Solenne forget that they were stones. Nobody screams. Nobody is hurt.',
        next: 'q-5',
      },
      'q-5': {
        speaker: 'narrator', mood: 'hollow',
        text: 'No one is cold. No one is hungry. No one grieves; there is nothing left to grieve, and no one left to do it. The Grey Lung children and the old women coughing cinders, the Thane at his ledger and the Queen on her throne, the Choir in their white: all of them sinking softly into the Dreaming, where every possible thing floats unmade and unhurt. There are a thousand Marens in it, and a thousand Tobins, and none of them is the one you knew. It is the gentlest thing that has ever happened to the world. It is the end of everyone in it.',
        next: 'q-6',
      },
      'q-6': {
        speaker: 'narrator', mood: 'hollow',
        text: 'Those who came down with you lie down around you on the warm stone, one by one, like children at the end of a long day. Someone takes your hand. You are not sure any more whose hand it is, or whose it is holding. You are not cold. You have not been so warm since you were very small. That is the worst of it, and you cannot remember why it should be the worst of anything.',
        next: 'q-7',
      },
      'q-7': {
        speaker: 'narrator', mood: 'hollow',
        text: 'You have time for one more thought, and you are not sure it is yours: it is so quiet. Then even that goes down into the water, turning, like a coin. And the Dreaming dreams on, slow and vast and kind, with no one in it at all.',
      },

      // ================= USURP (alone, Nhal destroyed) =================
      'us-1': {
        speaker: 'narrator', effects: [{ setFlag: 'act3.usurp_name', value: 'kept' }],
        text: 'Nhal’s water lies dark and empty round the foot of the heart, waiting for a thought to wake it. You know what it is. You have always known: you heard it under the bells, under the roots, in the red hunger of your own blood when you burned it for strength. A god’s worth of Mire with no god in it. And over it, a god’s heart with no god either.',
        next: 'us-2',
      },
      'us-2': { speaker: 'narrator', text: 'You put one hand into the fire, and the other into the water.', next: 'us-3' },
      'us-3': {
        speaker: 'narrator',
        text: 'It comes into you from both sides at once: the heat of the dying heart, the cold of the sea that has no bottom. It should burn you to ash. It should drown you. It does neither, because you are the thread, and both ends of the thread are tied to you. The Embers go into your blood. The Mire goes into your dreams. Somewhere in the middle of it the Ashmark stops being a mark on your hand and becomes the whole of you.',
        next: 'us-4',
      },
      'us-4': {
        speaker: 'narrator', mood: 'hollow',
        text: 'You grow. Not in size: in reach. You feel the leys run through the world like your own veins, and the Mire lie under it like your own sleep. You feel every hearth in Morvane, every candle, every heartbeat, the way you once felt the warmth of a single Ember in your palm. The heart of the world beats, and it is your heart. You could slow any one of those small heartbeats. You could stop it. You will not. You are almost sure that you will not.',
        next: 'us-5',
      },
      'us-5': {
        speaker: 'narrator',
        text: 'Those who came down with you are staring up at you the way the Orrun stare at the iron giants on the ridges. They are very small. You remember their names; you hold the names carefully, like coals, so they will not go out. The heart beats, fire and dark, and spring comes up out of the ground of the world because you wish it to. What else you will wish, in a hundred years, in a thousand, you do not yet know. No one does. That is what it means to have a god.',
      },

      // ================= USURP (with Nhal) =================
      'u-joined': {
        speaker: 'narrator', mood: 'hollow',
        text: 'You stand at the foot of the Heart of Orr, and Nhal is wrapped about you like a cloak of warm water, its thousand faces humming at your ear. The heart rises over you like a black hill, dim and slow. Up on the Anvil of Ribs, at the edge of the dark, those who came down with you are calling your name. It sounds very far away. It sounds like the name of someone you used to know.',
        choices: [
          { text: '[Maren] Look up at Maren.', to: 'u-maren', once: true, when: maren },
          { text: '[Anselm] Look up at Anselm.', to: 'u-anselm', once: true, when: anselm },
          { text: '[Hesta] Look up at Hesta.', to: 'u-hesta', once: true, when: hestaAlive },
          { text: '[Cadoc] Look up at Cadoc.', to: 'u-cadoc', once: true, when: cadoc },
          { text: '[Grimma] Look up at Grimma.', to: 'u-grimma', once: true, when: grimma },
          { text: '[Sable] Look up at Sable.', to: 'u-sable', once: true, when: sable },
          { text: '[Vesper] Look up at Vesper.', to: 'u-vesper', once: true, when: vesper },
          { text: '[Ysolde] Look up at Ysolde.', to: 'u-ysolde', once: true, when: ysoldeHere },
          { text: 'Put your hand into the heart.', to: 'u-1' },
        ],
      },
      'u-maren': { speaker: MAREN, mood: 'angry', text: 'Look at me. Look at me! Don’t you dare. You hear me? Don’t you dare go where I can’t follow!', next: 'u-joined' },
      'u-anselm': { speaker: ANSELM, mood: 'afraid', text: 'My friend. Whatever it has promised you, it promised Ysolde first, and her Choir, and every soul in the reeds. Please. Come back up the stair. Please.', next: 'u-joined' },
      'u-hesta': { speaker: HESTA, mood: 'afraid', text: 'Child. (Her voice is very steady, which is how you know how frightened she is.) I’ve watched this once before. I lost her to it. I am not losing you. Come here.', next: 'u-joined' },
      'u-cadoc': { speaker: CADOC, mood: 'afraid', text: 'That is not the song. That has never been the song. That is the thing the song was written to keep asleep. Come away from it.', next: 'u-joined' },
      'u-grimma': { speaker: GRIMMA, mood: 'angry', text: 'Human! That’s no forge, that’s a mouth! Get your hand out of it!', next: 'u-joined' },
      'u-sable': { speaker: SABLE, mood: 'sad', text: 'Oh, love. Oh, no. It’s nice, isn’t it. I know. I know it’s nice. Come back anyway. Come back for me.', next: 'u-joined' },
      'u-vesper': { speaker: VESPER, mood: 'angry', text: 'I have wanted to burn the world down for twenty years, and even I would not do this. Do you hear me? Even I.', next: 'u-joined' },
      'u-ysolde': { speaker: YSOLDE, mood: 'afraid', text: 'Not you too. Not you too. It held me for nine years and called me its saint. Little spark, please, it is lying, it is always lying—', next: 'u-joined' },
      'u-1': {
        speaker: NHAL, mood: 'happy',
        text: '(It answers them for you, in your own voice, gently, so that they will not be frightened.) Hush. Hush. We are all right. We are only going home. (And to you, inside, where no one else can hear:) Together, little cup. Put your hand in him.',
        choices: [
          { text: '[Will 25] Hold on to your own name.', to: 'u-kept', tag: 'persuade', check: { stat: 'will', dc: 25, failTo: 'u-lost' }, effects: END('usurp') },
          { text: 'Let go.', to: 'u-lost', effects: END('usurp') },
        ],
      },
      'u-kept': {
        speaker: 'narrator', effects: [{ setFlag: 'act3.usurp_name', value: 'kept' }],
        text: 'You put your hand into the heart of the world, and the water closes over it, and the fire and the dark come into you together. And in the middle of the we, the vast, warm, thousand-voiced we, there is one small hard grain that will not dissolve. Your name. You hold it in your teeth like a coal, and you do not let go, and you will not let go, not ever.',
        next: 'u-kept2',
      },
      'u-kept2': {
        speaker: 'narrator', mood: 'hollow',
        text: 'The heart of the world beats with two pulses now, a little out of step: one warm, one dark, one yours. Spring comes, of a kind. The leys run warm again, and with them, in every river and every well, a fine black thread. People dream more than they used to, and wake smiling, and cannot always remember why. And at the bottom of the world a god of fire and Mire argues with itself, very quietly, for ever, and so far you are winning. You think you are winning. You are almost sure which of you is you.',
      },
      'u-lost': {
        speaker: 'narrator', mood: 'hollow', effects: [{ setFlag: 'act3.usurp_name', value: 'lost' }],
        text: 'You let go. It is so easy. You had no idea how heavy your name was until you set it down. The water closes over your hand, and the fire and the dark come into you together, and there is no you left for them to come into: only we, warm and vast and glad.',
        next: 'u-lost2',
      },
      'u-lost2': {
        speaker: NHAL, mood: 'happy',
        text: 'We are so warm. (No one knows any more who says it. There is no one left to know.) We are so warm. We will never be cold again. And no one, no one, no one will ever leave.',
        next: 'u-lost3',
      },
      'u-lost3': {
        speaker: 'narrator', mood: 'hollow',
        text: 'The heart of the world begins to beat again, strongly, gladly, with a pulse that is black at the edges. Up on the Anvil of Ribs, those who came down with you have stopped calling. They are smiling. They are all smiling the same smile.',
      },

      // ================= after the end: replay =================
      'a-rekindle': { speaker: 'narrator', text: 'The Heart of Orr burns gold under your hand, beating strong and quick, and the black water lies far down in the deep places, dreaming. It will be a long time before anyone needs to stand here again. Not for ever. A long time.', choices: REPLAY },
      'a-iron': { speaker: 'narrator', text: 'The Heart of Orr burns gold. A ring of Wick-iron has been driven into the stone about it, hung with lanterns, and a Lightsworn stands watch at the foot of the stair by day and night, as the Lord-Inquisitor ordered. The fire is attended. It will always be attended.', choices: REPLAY },
      'a-keeper-player': { speaker: 'narrator', text: 'You are still here. You will always be here. The heart beats under your hands, slow and steady and strong, and the Mire sleeps against your back, and you sing. Sometimes, when you close your eyes, you can see it all again: how it ended, and what came after.', choices: REPLAY },
      'a-reforge': { speaker: 'narrator', text: 'The heart beats slow and steady and strong, with a hush inside it like a tide, and in its light someone is singing, as they will sing until the end of the world. They do not look up. They smile a little at the sound of your step.', choices: REPLAY },
      'a-quench': { speaker: 'narrator', mood: 'hollow', text: 'There is no heart. There is only the water, flat and warm and endless, and it is dreaming of you; and in the dream, for a moment, you remember.', choices: REPLAY },
      'a-usurp': { speaker: 'narrator', mood: 'hollow', text: 'The heart beats, and it is your heart. When you lay your hand on it you are laying your hand on yourself. Fire and Mire turn over slowly inside it, like two sleepers in one bed.', choices: REPLAY },
      'a-generic': { speaker: 'narrator', text: 'The Heart of Orr beats under your hand. It is done, and it cannot be undone.', choices: REPLAY },
    },
  },
];

export default dialogues;
