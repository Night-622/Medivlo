/** Dialogue: Act II Ch5 (north, part 1), quest:the-ninth-nail. Frostreach is in act2-ch5-northb.ts. Owner: Claude 4. */
import type { DialogueDef, NarrativeEffect } from '@/core';

const Q = 'quest:the-ninth-nail';
const grimma = { flag: 'companion.grimma-ironsong.following' };
const noGrimma = { not: grimma };
const deep = (v: string) => ({ flag: 'act2.deep_choice', op: '==' as const, value: v });
const vein = (n: 1 | 2 | 3) => ({ flag: `act2.true_iron_vein_${n}` });
const veinsDone = { all: [vein(1), vein(2), vein(3)] };

/** The Ember moment. Only ever reached through entries/paths guarded by `not act2.ember_deep_claimed`. */
const claimDeep: NarrativeEffect[] = [
  { setFlag: 'act2.ember_deep_claimed', value: true },
  { addFlag: 'world.embers_held', amount: 1 },
  { setFlag: 'ashmark.rank', value: 4 },
  { unlockLore: 'lore:the-seven-embers', section: 'deep' },
];
const INTO_HAND = 'it goes into your marked hand like a coal sinking into snow';

/** obj:true-iron-vein-N: a short bark when the vein is cut during the forge stage. */
const ironVein = (n: 1 | 2 | 3, cut: string): DialogueDef => ({
  id: `dialogue:obj-true-iron-vein-${n}`, name: `Object: True-iron vein ${n}`, bark: true,
  entries: [
    { when: vein(n), node: 'cut' },
    { when: { questStage: Q, stage: 'forge' }, node: 'mine' },
    { node: 'idle' },
  ],
  nodes: {
    idle: { speaker: 'narrator', text: 'A seam of black metal runs through the rock, cold and unrusted, older than any hand that might cut it.' },
    mine: { speaker: 'narrator', effects: [{ setFlag: `act2.true_iron_vein_${n}`, value: true }, { giveItem: 'item:true-iron' }], text: cut },
    cut: { speaker: 'narrator', text: 'Only a raw notch in the rock where the true-iron was. Around it the seam has already begun, very slowly, to close.' },
  },
});

const dialogues: DialogueDef[] = [
  ironVein(1, 'True-iron does not cut. You lay your marked hand on the seam and it softens under the heat, sullen and slow, and comes away into your hands like cold dough. It is as heavy as a sin and as black as a well.'),
  ironVein(2, 'The second vein fights you. It is cold the way the bottom of the sea is cold, and it drinks the heat out of your hand until your fingers ache to the bone. Then it gives, all at once, with a sound like a bell struck under water.'),
  ironVein(3, 'The last vein comes away clean. In the rock behind it you see, for an instant, the print of a giant’s thumb pressed into the stone when the stone was soft: some Orrin, a hundred lifetimes gone, testing the seam the same way you have.'),
  // ----- Brannoch: the Vault-key
  {
    id: 'dialogue:ch5n-brannoch-hall', name: 'Brannoch: The High Thane',
    entries: [
      { when: { flag: 'act2.vault_granted' }, node: 'again' },
      { when: { flag: 'act1.nails_kept' }, node: 'kept' },
      { node: 'exposed' },
    ],
    nodes: {
      again: { speaker: 'npc:brannoch-deepforge', text: 'The Vault-door stands open for you. It has not stood open for a human since the Concord was cut. Go down, and walk soft. The dead are listening, and so am I.' },
      // --- he trusts you
      kept: { speaker: 'narrator', text: 'The Thane’s hall of Korrath-under-Stone is cut from the inside of a fallen Orrin: you walk in between its ribs, each as tall as a mast, and the roof is the curve of its iron spine. At the far end, before the ancestor-forge where the clan-ledgers lie in iron covers, sits an Orrun so old that his skin has gone the grey of weathered granite. His beard is white to the belt and braided through with iron rings, and his eyes are two coals banked for the night.', next: 'kept2' },
      kept2: { speaker: 'npc:brannoch-deepforge', text: 'The Queen’s envoy. The one who closed a hand at my gate. Hedda told me how it went: the shard, the crowd, your silence. Sit. In Korrath a guest who kept faith sits nearer the fire.', next: 'kept3' },
      kept3: { speaker: 'npc:brannoch-deepforge', mood: 'sad', text: 'You know what I did not say. Two Nails are grenn to the root, and I let the holds believe in nine. I would do it again. A hold that panics is a hold that dies; I have watched one die. But I never lied to you, because you already knew. That is a kind of honesty between us. Korr nagh.', next: 'hub' },
      hub: {
        speaker: 'npc:brannoch-deepforge', text: 'Ask. A Thane who will not be asked is only a stone with a beard.',
        choices: [
          { text: '“What happened here on the Night of Falling Ash?”', to: 'fell', once: true },
          { text: '“Tell me about the Iron Concord.”', to: 'concord', once: true, tag: 'lore' },
          { text: '[Warden] “A gate that holds is one that is kept, not one that is shut.”', to: 'warden', when: { classIs: 'class:warden' }, tag: 'class', once: true },
          { text: '[Arcanist] “Have your runesmiths tried to sing the failed Nails whole again?”', to: 'arcanist', when: { classIs: 'class:arcanist' }, tag: 'class', once: true },
          { text: '[Devout] “Vor the Hammer keeps your halls. Does he keep the Vault?”', to: 'devout', when: { dialogueTag: 'devout' }, tag: 'trait', once: true },
          { text: '“Let me go down into the Vault.”', to: 'key', effects: [{ setFlag: 'act2.vault_granted', value: true }] },
        ],
      },
      fell: { speaker: 'npc:brannoch-deepforge', mood: 'afraid', text: 'Something came down through the mountain. We felt it go through the stone, hold by hold, the way you would feel a nail driven through the board you sleep on. It did not stop until it reached the Vault. Since that night the Vault has been warm. Warm, Ember-hand. Nothing in the Vault has been warm since the Rusting.', next: 'fell2' },
      fell2: { speaker: 'npc:brannoch-deepforge', text: 'And the Wrought have woken. The Orrin’s iron sentinels, that stood along the Vault walls for three thousand years with dust on their shoulders. They walk now. Two of my wardens went down to look. One came back.', next: 'hub' },
      concord: { speaker: 'npc:brannoch-deepforge', effects: [{ unlockLore: 'lore:the-iron-concord-treaty' }], text: 'Trade, not fealty. Nine hundred years ago the Empire came up our roads with lanterns and wanted us to kneel to their light. We said: we will sell you iron, and we will not kneel, and we will keep the deep places, because nobody else can. They signed. They had no choice. Nobody else can.', next: 'hub' },
      warden: { speaker: 'npc:brannoch-deepforge', text: '…Hm. That is an Orrun saying, near enough. Who taught it you? No matter. Kept, aye. I kept it. I am not yet sure I kept it well.', next: 'hub' },
      arcanist: { speaker: 'npc:brannoch-deepforge', mood: 'sad', text: 'Sing to what? A rune needs iron to sit in. The Eighth and the Ninth are holes now, all the way down. You cannot sing to a hole. (A pause.) The Ironsong woman said that to me once, in this hall. She was not wrong about everything.', next: 'hub' },
      devout: { speaker: 'npc:brannoch-deepforge', effects: [{ unlockLore: 'lore:vor-the-hammer' }], text: 'Vor keeps what is kept with effort. That is his whole law. The Nails were driven by Orr’s children with Vor’s strength in their arms, and they have held three thousand years because nobody ever stopped keeping them. Not until my time.', next: 'hub' },
      // --- he is cold
      exposed: { speaker: 'narrator', text: 'The Thane’s hall of Korrath-under-Stone is cut from the inside of a fallen Orrin: you walk in between its ribs, each as tall as a mast. Wardens with long hammers stand between every rib, and not one of them looks at you. At the far end, before the ancestor-forge, an Orrun so old that his skin has gone the grey of granite watches you come the whole length of the hall, and does not rise.', next: 'cold' },
      cold: {
        speaker: 'npc:brannoch-deepforge', mood: 'angry',
        text: 'The crier. You stood at my gate and shouted the shame of the Concord to carters and refugees. Now every child in the Ironspine sleeps with a hammer, and three holds have stopped sending their tithe to this hall. And you come into my hall with your hand out.',
        choices: [
          { text: '[Grimma] “Grimma Ironsong will speak for me.”', to: 'vouch', when: grimma, effects: [{ setFlag: 'act2.vault_granted', value: true }] },
          { text: '“You were never ashamed of me, Thane. You were ashamed of the truth, and the truth is still down there.”', to: 'will-ok', tag: 'persuade', check: { stat: 'will', dc: 15, failTo: 'will-fail' } },
          { text: '[Devout] “Vor keeps the oaths that cost something. Let me pay for this one.”', to: 'devout-cold', when: { dialogueTag: 'devout' }, tag: 'trait', effects: [{ setFlag: 'act2.vault_granted', value: true }] },
          { text: '[Oathbreaker] “I have broken an oath, Thane. I know what it weighs. I would not break one to you.”', to: 'oathbreaker', when: { dialogueTag: 'oathbreaker' }, tag: 'trait', effects: [{ setFlag: 'act2.vault_granted', value: true }] },
          { text: '“Hedda Stonebrow spoke the truth herself. Has she kept her voice?”', to: 'hedda', when: { flag: 'act1.hedda_spoke' }, once: true },
          { text: '“Then take my oath. Korr nagh: whatever I do in your Vault, I will answer for it in this hall, before your ledger.”', to: 'oath', effects: [{ setFlag: 'act2.vault_granted', value: true }, { setFlag: 'act2.brannoch_oath', value: true }] },
          { text: '“I’ll come back when you’ve cooled.”', to: null, tag: 'leave' },
        ],
      },
      'will-fail': { speaker: 'npc:brannoch-deepforge', text: 'You talk like a human: quick and sure. Truth is slower than that, and heavier. Come back when you have something with weight in it to lay on the scale.', next: 'cold' },
      'will-ok': { speaker: 'npc:brannoch-deepforge', mood: 'sad', effects: [{ setFlag: 'act2.vault_granted', value: true }], text: '(He is quiet so long that one of the wardens shifts his feet.) …Aye. It is still down there. And I am an old fool who would sooner be angry at the messenger than afraid of the message.', next: 'key' },
      'devout-cold': { speaker: 'npc:brannoch-deepforge', text: 'Spoken like a hall-priest. Vor hears; and since he does, so must I.', next: 'key' },
      oathbreaker: { speaker: 'npc:brannoch-deepforge', text: '(He leans forward, and the iron rings in his beard chime together.) An oathbreaker who says so in a Thane’s hall. Most hide it like a rotten tooth. Very well. One who knows the weight of a broken oath may be trusted to carry a kept one.', next: 'key' },
      hedda: { speaker: 'npc:brannoch-deepforge', mood: 'sad', text: 'Hedda Stonebrow is my voice. She used it without me, once, before the whole gate. I have not yet decided whether a voice may do that and still be a voice. (A long silence.) She tells me she sleeps now. I do not.', next: 'cold' },
      oath: { speaker: 'npc:brannoch-deepforge', text: 'Korr nagh. Do you know what that is, from a human mouth? Either nothing, or everything. (He opens the great ledger on its iron stand and writes, slowly, with a stylus of black iron.) There. It is in the ledger. Now it is everything.', next: 'key' },
      vouch: { speaker: 'npc:grimma-ironsong', text: 'Brannoch Deepforge. You scratched my name out of the Ironsong ledger with your own stylus. I watched you do it. I’m not here to ask for it back.', next: 'vouch2' },
      vouch2: { speaker: 'npc:brannoch-deepforge', mood: 'angry', text: 'Then why are you here, Ironsong?', next: 'vouch3' },
      vouch3: { speaker: 'npc:grimma-ironsong', text: 'Because this one counted with me. Stood at your gate and said seven when nine would have been easier. And because if something’s burning in the Vault, there’s no smith in your hall who’s been down there since I sang the runes. Send us. Or go down yourself, old man, and take your pride for a lamp.', next: 'vouch4' },
      vouch4: { speaker: 'npc:brannoch-deepforge', text: '…Grenn take you, Ironsong. You always did count too loud. (Something in his face gives, the way old stone gives, all at once after a thousand years.) Go down. The both of you.', next: 'key' },
      // --- both
      key: { speaker: 'narrator', text: 'He lifts from about his neck a key of black true-iron as long as your forearm, warm from his skin, and lays it across your palms. It is heavier than it has any right to be. Behind him, in the ancestor-forge, the coals shift and settle.', next: 'charge' },
      charge: { speaker: 'npc:brannoch-deepforge', text: 'The Vault-door is under the ninth stair. The Wrought will not know you. Neither will the rust-wraiths, and they have no wish to. Whatever burns at the bottom of my mountain, Ember-hand, bring me word of it before you bring it up. The Vault is ours. The Mire under it belongs to everyone.' },
    },
  },
  // ----- Brannoch: the First Nail (forge path)
  {
    id: 'dialogue:ch5n-brannoch-first-nail', name: 'Brannoch: The First Nail',
    entries: [{ when: { flag: 'act2.first_nail_given' }, node: 'given' }, { node: 'start' }],
    nodes: {
      given: { speaker: 'npc:brannoch-deepforge', text: 'Carry it well. It has never been carried by anyone who was not Deepforge. It will take some getting used to, for both of you.' },
      start: {
        speaker: 'narrator', effects: [{ setFlag: 'act2.first_nail_given', value: true }, { giveItem: 'item:the-first-nail' }],
        text: 'The whole hall is standing when you come in: wardens, thanes of the lesser holds, smiths with their aprons still on. Brannoch Deepforge stands too, and in his two hands he holds out to you a warhammer whose head is a single spike of black true-iron, worn smooth with handling, its haft bound in iron rings like a thane’s beard.',
        next: 'speech',
      },
      speech: { speaker: 'npc:brannoch-deepforge', text: 'I went down. I put my hand on the Ninth. It was warm, the way new iron is warm. Seven old Nails, and one new, and one hole yet; but the Deep has gone down from the floor of the Vault for the first time since my grandfather’s grandfather. Korr nagh, Ember-hand. The Concord does not forget a debt, and this one it cannot pay.', next: 'hammer' },
      hammer: {
        speaker: 'npc:brannoch-deepforge',
        text: 'This is the First Nail. The Orrin forged it before any of the Nine, a test-piece, too small for the Vault, and they gave it to Clan Deepforge to keep when the Rusting took them. It has hung over my forge for three thousand years. A nail is meant to be driven. Take it.',
        choices: [
          { text: '[Grimma] “Thane. There’s a name missing from the Ironsong ledger.”', to: 'ledger', when: grimma, once: true },
          { text: '“I’ll carry it with honour.”', to: 'honour' },
          { text: '“Keep it for your own. Korrath needs every weapon it has.”', to: 'refuse' },
        ],
      },
      ledger: { speaker: 'narrator', effects: [{ setFlag: 'act2.grimma_restored', value: true }, { loyalty: 'npc:grimma-ironsong', delta: 15 }], text: 'The hall goes very quiet. Brannoch looks at Grimma for a long moment. Then he turns to the great ledger on its iron stand, takes up the black stylus, and in the place where a name was scratched out he writes it in again, slowly, in iron-pointed letters, so that the whole hall can hear the stylus bite: Grimma, of Clan Ironsong. Runesmith. Who counted true.', next: 'ledger2' },
      ledger2: { speaker: 'npc:grimma-ironsong', mood: 'sad', text: '(She opens her mouth, and shuts it, and opens it again.) …Well. Stone me. (She turns away so the hall cannot see her face, and says to the wall:) Grenn take the lot of you. Grenn take you, Brannoch Deepforge, you stubborn old anvil.', next: 'honour' },
      honour: { speaker: 'npc:brannoch-deepforge', text: 'Honour is a thing done, not a thing carried. But carry it anyway. Go well. And when the last fire is lit, wherever it is lit, send to Korrath. We will come up out of the dark for you.' },
      refuse: { speaker: 'npc:brannoch-deepforge', text: '(He does not lower his hands.) In Korrath, Ember-hand, a gift refused is a debt refused, and a debt refused is an insult. I am too old to be insulted. Take it.', next: 'honour' },
    },
  },
  // ----- Brannoch: general
  {
    id: 'dialogue:ch5n-brannoch-general', name: 'Brannoch: General',
    entries: [
      { when: { flag: 'act2.new_nail' }, node: 'forged' },
      { when: { flag: 'act2.korrath_flooded' }, node: 'flooded' },
      { when: { flag: 'act2.vault_granted' }, node: 'below' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'npc:brannoch-deepforge', text: 'Korrath-under-Stone keeps its own counsel, human. So do I.' },
      below: { speaker: 'npc:brannoch-deepforge', text: 'You have the key. The Vault is under the ninth stair. I will hear what you find when you have found it, and not before.' },
      forged: { speaker: 'npc:brannoch-deepforge', text: 'The Ninth stands. I go down every night now to put my hand on it. Old fools need their comforts. Korr nagh, Ember-hand.' },
      flooded: {
        speaker: 'npc:brannoch-deepforge', mood: 'sad',
        text: 'The lower holds are under black water. Coalheart Deep, the Tinwards, the old ledger-halls of the first clans. Four hundred came up the stairs with what they could carry. Some did not come up. The water stands at the ninth stair and does not go down.',
        choices: [
          { text: '“I swore to answer for what I did below. I answer for it.”', to: 'answer', when: { flag: 'act2.brannoch_oath' }, once: true },
          { text: '“The world needed that Ember, Thane.”', to: 'world', once: true },
          { text: '“I’m sorry.”', to: 'sorry', once: true },
          { text: '[Leave]', to: null, tag: 'leave' },
        ],
      },
      answer: { speaker: 'npc:brannoch-deepforge', text: '(He opens the ledger, and writes under your oath, slowly.) The Ember-hand took the fire of the Deep, and the Deep came up after it. Answered, in this hall. (He closes the book.) You are not welcome here, and you are not forsworn. That is the most an Orrun can give you.', next: 'flooded' },
      world: { speaker: 'npc:brannoch-deepforge', text: 'The world. Aye. The world is very large, and Korrath is very small, and that is always how the sum comes out. I was a fool to think it would come out differently for us.', next: 'flooded' },
      sorry: { speaker: 'npc:brannoch-deepforge', text: 'Sorry is a human word. We have none like it. We have grenn, which is rust, and we have nagh, which is an oath. One of them is what you did. I have not decided which.', next: 'flooded' },
    },
  },
  // ----- The Vault: first sight (opened once, when the Wrought fall)
  {
    id: 'dialogue:ch5n-vault-nails', name: 'The Vault of the Nine Nails',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'When the last sentinel falls, its iron ringing out across the stone like a dropped bell, the Vault is quiet enough at last to be seen. You stand on a ledge above a cavern so wide that its far wall is only a rumour of ley-light, and so high that the roof is lost in its own dark.', next: 'nails' },
      nails: { speaker: 'narrator', effects: [{ unlockLore: 'lore:the-orrin' }], text: 'Out of the floor rise the Nails. Seven spikes of black true-iron, each as thick as a castle keep and as tall as a cathedral spire, driven into the living rock up to the marks of hands. Giants’ hands: the fingers of a single print would make a doorway. Runes climb the Nails in bands, still faintly lit, the colour of a forge three days cold.', next: 'ring' },
      ring: { speaker: 'narrator', text: 'They stand in a ring, and the ring is broken. Where the Eighth and the Ninth should stand there is nothing: two round black wells in the floor, each as wide as a village green, rimmed with red flakes that were once iron. Between them, down in the dark, something is burning. It is the only warm light in the mountain.', next: 'hum' },
      hum: {
        speaker: 'narrator', mood: 'afraid',
        text: 'The Embers in you know it. The mark draws tight across your hand like a bowstring. And under your boots, very far down, something vast shifts its weight, slowly, the way a sleeper turns over toward a fire.',
        choices: [
          { text: '[Grimma] Look at Grimma.', to: 'grimma', when: grimma },
          { text: 'Look with the mark.', to: 'sight' },
          { text: 'Go down toward the light.', to: 'down' },
        ],
      },
      grimma: { speaker: 'npc:grimma-ironsong', mood: 'sad', text: 'Seven. (Her voice is very small, for her.) I counted them on my knees with a lamp, last time. Seven. I was right, and I’d give my name and my hammer and both my hands to have been wrong.', next: 'grimma2' },
      grimma2: { speaker: 'npc:grimma-ironsong', text: 'Look at the size of them. Our fathers made those. Our fathers, with their own hands, and it still wasn’t enough. (She wipes her face with a sooty glove and makes it worse.) Come on. Something down there wants looking at.', next: 'down' },
      sight: { speaker: 'narrator', mood: 'afraid', effects: [{ unlockLore: 'lore:the-nine-nails' }], text: 'You let the mark open your eyes, and the ley-light drains out of the walls. Beneath the floor of the Vault, everywhere, the black water is pressed up against the rock like a sea against the underside of ice, and only where the Nails stand is it held down. Around the two empty wells it bulges upward, patient, swollen. Except where the light burns between them: there the black draws back, hissing, the way skin draws back from a hot iron.', next: 'down' },
      down: { speaker: 'narrator', text: 'A stair the width of a road winds down the inside of the ring, past the feet of the Nails. Their runes hum as you pass, one low note, all seven together. It sounds less like a song than like a held breath.' },
    },
  },
  // ----- obj:empty-socket
  {
    id: 'dialogue:obj-empty-socket', name: 'Object: The empty socket',
    entries: [
      { when: { flag: 'act2.new_nail' }, node: 'nailed' },
      { when: { flag: 'act2.korrath_flooded' }, node: 'flooded' },
      { when: { flag: 'act2.socket_seen' }, node: 'seen' },
      { when: { questStage: Q, stage: 'socket' }, node: 'start' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'narrator', text: 'A well of dark in the floor of the Vault, rimmed with rust. Something far below it is breathing. The Wrought are still walking between you and it.' },
      nailed: { speaker: 'narrator', text: 'A new Nail stands in the Ninth socket, its runes burning the colour of a fresh forge. The Eighth socket beside it is still an open well, but the black water has gone down out of sight, and the stone round its rim is dry.' },
      flooded: { speaker: 'narrator', mood: 'afraid', text: 'Black water fills the socket to the brim and stands there, perfectly still, reflecting nothing. The seven Nails around it hum one low note, as if straining.' },
      seen: { speaker: 'narrator', text: 'The socket is a well of black, rimmed with rust. Beside it the Ember of the Deep burns in the crack in the stone, and the Mire under it leans up toward the light and is held.' },
      start: { speaker: 'narrator', effects: [{ setFlag: 'act2.socket_seen', value: true }], text: 'The Ninth socket is a hole in the floor of the Vault, round as a well and sheer as one, and as wide as a village green. Its rim is a crust of red flakes, soft as old bark, and in the middle of the crust stands a stump of something that was once a Nail, rotted down to a black tooth.', next: 'below' },
      below: { speaker: 'narrator', mood: 'afraid', text: 'Your lamp shows nothing beneath the rim. Your mark shows more: a hundred feet down, perhaps more, black water standing still. It is not still. It is rising and falling, very slowly, the way a chest rises and falls in sleep.', next: 'ember' },
      ember: {
        speaker: 'narrator',
        text: 'Between the Eighth socket and the Ninth the stone has cracked into one long wound, and in the wound the Ember of the Deep is lodged, blazing white at its heart and gold at its edges, wedged like a coal dropped between floorboards. The black water presses up against it from below and hisses back, and presses again. It is not lying there. It is holding.',
        choices: [
          { text: '[Grimma] “Grimma. What am I looking at?”', to: 'grimma', when: grimma },
          { text: '[Arcanist] Study the way the Ember burns.', to: 'arcanist', when: { classIs: 'class:arcanist' }, tag: 'class' },
          { text: 'Lay your hand on the stone beside the wound.', to: 'touch' },
          { text: 'Step back.', to: 'leave' },
        ],
      },
      grimma: { speaker: 'npc:grimma-ironsong', text: 'A cork in a cask. (She is not joking.) The two Nails rusted through, and the Mire came up the holes like water up a reed. Then a star fell through the mountain and stuck in the gap. It’s been holding the Deep shut on its own since Lanternmass. That’s why the Vault’s warm. That’s why the Wrought woke. They know something’s doing their work.', next: 'grimma2' },
      grimma2: { speaker: 'npc:grimma-ironsong', text: 'Pull it, and the cask’s open. Leave it, and it isn’t yours. Or… (She looks up at the seven Nails, a long time.) Or we give the hole something else to hold it.', next: 'leave' },
      arcanist: { speaker: 'narrator', text: 'It is burning down. Slowly, the way a candle burns, but down: the Mire is drinking its heat through the crack, a little at a time. Not this year. Not in ten. But a cork of fire in a cask of water is not a cork for ever.', next: 'leave' },
      touch: { speaker: 'narrator', text: 'The stone is warm as a hearthstone, and it hums under your palm. For a moment, under the hum, you hear a voice a long way down: not words, only longing, like a child calling in another room. Then the Ember flares, and the voice is gone.', next: 'leave' },
      leave: { speaker: 'narrator', text: 'Behind you, in the dark, the seven Nails hum their one low note, and hold.' },
    },
  },
  // ----- obj:ember-of-the-deep: the choice
  {
    id: 'dialogue:obj-ember-of-the-deep', name: 'Object: The Ember of the Deep',
    entries: [
      { when: { all: [{ flag: 'act2.ember_deep_claimed' }, { flag: 'act2.new_nail' }] }, node: 'after-nail' },
      { when: { flag: 'act2.ember_deep_claimed' }, node: 'after-flood' },
      { when: deep('take'), node: 'take-resume' },
      { when: { flag: 'act2.new_nail' }, node: 'freed' },
      { when: deep('forge'), node: 'forge-wait' },
      { when: { questStage: Q, stage: 'choice' }, node: 'start' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'narrator', text: 'Something burns white and gold in the dark between the two empty sockets. You should look at the socket before you lay a hand on it.' },
      'after-nail': { speaker: 'narrator', text: 'The crack where the Ember lay is dry and cold. Beside it the Ninth Nail stands new among the old, and the seven old Nails seem to lean toward it, very slightly, the way old men lean toward a newborn.' },
      'after-flood': { speaker: 'narrator', mood: 'afraid', text: 'Where the Ember lay there is only black water, brimming in the crack, perfectly still.' },
      'forge-wait': { speaker: 'narrator', text: 'The Ember of the Deep burns in the wound, holding the black water down. It will hold a little longer. True-iron, from the seam behind the eastern wall; then the Orrin anvil.' },
      start: { speaker: 'narrator', text: 'You go to the lip of the wound. The Ember of the Deep lies wedged a hand’s breadth below the edge of the stone, burning white at the heart and gold at the rim. Its heat is on your face like summer. Beneath it the black water presses up and shrinks back, presses up and shrinks back, the way a tongue keeps going to a sore tooth.', next: 'choose' },
      choose: {
        speaker: 'narrator',
        text: 'Your marked hand is already reaching for it. It would come to you. You know that the way you know your own name.',
        choices: [
          { text: 'Take it.', to: 'take', when: grimma, tag: 'aggressive', effects: [{ setFlag: 'act2.deep_choice', value: 'take' }, { setFlag: 'act2.korrath_flooded', value: true }, { loyalty: 'npc:grimma-ironsong', delta: -15 }] },
          { text: 'Take it.', to: 'take', when: noGrimma, tag: 'aggressive', effects: [{ setFlag: 'act2.deep_choice', value: 'take' }, { setFlag: 'act2.korrath_flooded', value: true }] },
          { text: '[Grimma] “Grimma. The anvil, the seam. Can we make a new Nail?”', to: 'forge-grimma', when: grimma, effects: [{ setFlag: 'act2.deep_choice', value: 'forge' }, { loyalty: 'npc:grimma-ironsong', delta: 10 }] },
          { text: 'Read the giants’ runes on the nearest Nail. They were forged here. They could be again.', to: 'forge-runes', tag: 'lore', check: { stat: 'intellect', dc: 20, failTo: 'forge-fail' } },
          { text: 'Not yet.', to: null, tag: 'leave' },
        ],
      },
      'forge-fail': { speaker: 'narrator', text: 'The runes are giant-script, each letter the height of a man, and they run up the Nail out of the lamplight. You can tell the Nails were made, and made here, where they stand. Beyond that the iron will not speak to you. Not without a smith who can read it.', next: 'choose' },
      // --- take
      take: {
        speaker: 'narrator', effects: claimDeep,
        text: `You close your hand on the Ember, and ${INTO_HAND}: up out of the crack, into your palm, into the mark, as if it had been waiting for you all along. For one heartbeat there is nothing in the world but warmth. Then the wound behind it opens.`,
        next: 'flood',
      },
      'take-resume': {
        speaker: 'narrator', effects: claimDeep,
        text: `The black water is already welling up round the Ember, lapping at the lip of the crack. You take it, and ${INTO_HAND}, and the wound behind it opens.`,
        next: 'flood',
      },
      flood: {
        speaker: 'narrator', mood: 'afraid',
        text: 'The black water comes up the crack. Not fast; it does not need to be fast. It wells over the lip of the stone and spreads across the floor of the Vault, and the seven Nails ring together, one long note like a struck bell, and the runes on their flanks flare and gutter. Far above, through a mile of rock, the alarm-gongs of Korrath begin to beat, one hold after another, down and down, toward the lower holds, where the water is going.',
        choices: [
          { text: '[Grimma] Look at Grimma.', to: 'flood-grimma', when: grimma },
          { text: 'Run.', to: 'flood2' },
        ],
      },
      'flood-grimma': { speaker: 'npc:grimma-ironsong', mood: 'angry', text: '(She does not look at you.) Run. We run, and you don’t speak to me till we’re above the water. Grenn, human. Grenn on you.', next: 'flood2' },
      flood2: { speaker: 'narrator', text: 'You run. Behind you the Mire comes up the great stair one step at a time, patient as a tide, and at the Vault-door the Orrun wardens are already hammering the iron shut, with their own kin still below it, weeping as they swing.', next: 'ysolde-take' },
      'ysolde-take': { speaker: 'npc:ysolde', mood: 'hollow', text: '(A voice inside the warmth, close as your own breath.) Oh, little spark. You see? Even the iron gives way in the end. They will hate you for this. I don’t. Bring it home.' },
      // --- forge
      'forge-grimma': { speaker: 'npc:grimma-ironsong', text: '(She is already looking past you, to the far wall, where an anvil the size of a cottage stands under the dark.) Aye. Aye, we can. That’s the Orrin anvil: they forged the Nails here, where they’d stand. The seam runs behind the eastern wall. True-iron, living, three good veins. Nobody’s cut it since the Rusting, because nobody’s had a fire hot enough.', next: 'forge-grimma2' },
      'forge-grimma2': { speaker: 'npc:grimma-ironsong', text: '(She looks at your hand.) Nobody had.', next: 'forge-end' },
      'forge-runes': { speaker: 'narrator', effects: [{ setFlag: 'act2.deep_choice', value: 'forge' }], text: 'You make yourself read slowly, rune by giant rune, and they are not prayers. They are instructions. Seam. Vein, vein, vein. Anvil. Fire of the Father. Drive. The Orrin forged each Nail here, where it would stand, from iron cut out of the living rock behind the eastern wall. All they needed was a fire as hot as the one their maker carried in his chest.', next: 'forge-runes2' },
      'forge-runes2': { speaker: 'narrator', text: 'You look down at your hand. It is burning.', next: 'forge-end' },
      'forge-end': { speaker: 'narrator', text: 'You leave the Ember where it lies. For now, it will hold. Three veins of true-iron from the seam, and the anvil, and your fire.' },
      // --- forge done, Ember loose (safety route; normally claimed at the anvil)
      freed: {
        speaker: 'narrator', effects: claimDeep,
        text: `The new Nail stands in the Ninth socket, ringing faintly. In the crack beside it the black water has drawn down out of sight, and the Ember of the Deep lies loose on dry stone, doing nothing at all but burn. You pick it up, and ${INTO_HAND}.`,
        next: 'ysolde-forge',
      },
      'ysolde-forge': { speaker: 'npc:ysolde', mood: 'hollow', text: '(A voice inside the warmth.) A new nail. How very like them. Hammer the world down a little tighter and call it mercy. It is only a longer night, little spark. Bring it home.' },
    },
  },
  // ----- obj:new-nail-anvil: the forging
  {
    id: 'dialogue:obj-new-nail-anvil', name: 'Object: The Orrin anvil',
    entries: [
      { when: { flag: 'act2.ember_deep_claimed' }, node: 'after' },
      { when: { flag: 'act2.new_nail' }, node: 'drive-resume' },
      { when: { all: [{ questStage: Q, stage: 'forge' }, veinsDone, grimma] }, node: 'grimma' },
      { when: { all: [{ questStage: Q, stage: 'forge' }, veinsDone] }, node: 'alone' },
      { when: { questStage: Q, stage: 'forge' }, node: 'need' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'narrator', text: 'An anvil the size of a cottage, cold as the mountain, its face worn hollow by hammers the size of men. The Orrin forged the Nails on it, where they would stand.' },
      after: { speaker: 'narrator', text: 'The great anvil is warm to the touch for the first time since the Rusting. It will be cold again in a hundred years.' },
      need: { speaker: 'narrator', text: 'The Orrin anvil waits, cold. It wants true-iron: three veins of it, cut from the seam behind the eastern wall.' },
      grimma: { speaker: 'narrator', text: 'Grimma climbs up onto the anvil and stands on it like a smith on a hearthstone, and you lay the true-iron across its face: three black bars, heavy as sin. She takes off her gloves. She has never once, in all the time you have known her, taken off her gloves.', next: 'grimma2' },
      grimma2: { speaker: 'npc:grimma-ironsong', text: 'Right. I sing, you burn. Don’t stop when it hurts. It’ll hurt. A fire hot enough for true-iron is hot enough for you. (She draws a breath that goes on and on.) Korr. Korr nagh. Korr orr nagh…', next: 'strike' },
      alone: { speaker: 'narrator', text: 'You lay the true-iron across the face of the Orrin anvil: three black bars, heavy as sin. Along the anvil’s rim the giants’ runes say it as plainly as a recipe: lay the iron; give it the Father’s fire; drive. There is no one to sing the runes for you. You will have to be the fire and the smith both.', next: 'strike' },
      strike: {
        speaker: 'narrator',
        text: 'You lay your marked hand flat on the true-iron.',
        choices: [
          { text: '[Give it all the fire you have]', to: 'fire', effects: [{ setFlag: 'act2.new_nail', value: true }] },
          { text: 'Hold the fire to a thread. Feed it slowly, so the iron takes the shape and not the hurt.', to: 'careful', check: { stat: 'will', dc: 15, failTo: 'fire' }, effects: [{ setFlag: 'act2.new_nail', value: true }] },
          { text: 'Not yet.', to: null, tag: 'leave' },
        ],
      },
      fire: { speaker: 'narrator', mood: 'afraid', text: 'The Embers in you answer all at once. Heat goes out of your hand and into the iron like a river into a sluice, and the iron takes it, and takes it, and does not stop taking. Your arm is white to the shoulder. The three bars run together; the black goes red, the red goes white, and you are on your knees on the anvil with your hand still pressed to it, and you do not let go.', next: 'grow' },
      careful: { speaker: 'narrator', text: 'You feed it the way you would feed a winter fire, a little and a little, never more than the iron can drink. It is slow. It is the slowest thing you have ever done, and the hardest. The three bars run together; the black goes red, the red goes white, and your hand on it stays your own.', next: 'grow' },
      grow: { speaker: 'narrator', text: 'And the iron grows. True-iron remembers what it was meant to be, the old songs say; you had thought that a figure of speech. It lengthens under your hand, thickening, a spike as long as a mast, as long as a tower, until you are standing on the anvil beside it and it is still growing, its runes writing themselves up its flanks in lines of light.', next: 'wrought' },
      wrought: { speaker: 'narrator', text: 'Along the walls of the Vault the Wrought that did not wake to fight you wake now. Six of them, ten, a dozen: iron sentinels as tall as houses, their joints shrieking with rust. They do not attack. They walk to the anvil in a slow procession, the way mourners walk, and they take up the new Nail between them, and they carry it to the Ninth socket.', next: 'drive' },
      drive: { speaker: 'narrator', text: 'They raise it. They drive it. The sound is the loudest thing you have ever heard: one stroke, then a second, then a third, and with each the whole mountain rings like a bell, and on the third the black water under the Vault goes down, and down, and away, like a tide going out for the first time in three thousand years.', next: 'freed' },
      freed: {
        speaker: 'narrator', effects: claimDeep,
        text: `In the crack beside the new Nail the Ember of the Deep lies loose on dry stone. Nothing is pressing on it now. You pick it up, and ${INTO_HAND}.`,
        choices: [
          { text: '[Grimma] Look at Grimma.', to: 'grimma-done', when: grimma },
          { text: 'Look at the Wrought.', to: 'wrought-done' },
        ],
      },
      'drive-resume': {
        speaker: 'narrator', effects: claimDeep,
        text: `The new Nail stands in the Ninth socket, still ringing. Beside it the Ember of the Deep lies loose on dry stone. You take it up, and ${INTO_HAND}.`,
        next: 'ysolde',
      },
      'grimma-done': { speaker: 'npc:grimma-ironsong', mood: 'happy', text: '(She is crying, and furious about it.) Ninth Nail. New-forged. First in three thousand years, and an exile and a human did it with a song and a sore hand. Korr nagh, Ember-hand. …Say nothing. I mean it. Say nothing at all.', next: 'ysolde' },
      'wrought-done': { speaker: 'narrator', text: 'The Wrought stand about the new Nail in a ring, and one by one they go still, and the rust-red light goes out of their eyes. They are not dead. They are resting. Their work is being done.', next: 'ysolde' },
      ysolde: { speaker: 'npc:ysolde', mood: 'hollow', text: '(A voice inside the warmth.) A new nail. How very like them. Hammer the world down a little tighter and call it mercy. It is only a longer night, little spark. Bring it home.' },
    },
  },
];

export default dialogues;
