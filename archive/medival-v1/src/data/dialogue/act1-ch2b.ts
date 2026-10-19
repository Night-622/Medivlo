/** Dialogue: Act I Ch2, quest:the-river-under, quest:salt-and-silver and quest:edrics-oath. Owner: Claude 4. */
import type { DialogueDef } from '@/core';

const Q6 = 'quest:the-river-under';

const dialogues: DialogueDef[] = [
  // ----- Brother Ossory: the restless dead
  {
    id: 'dialogue:ch2-ossory-ossuary', name: 'Ossory: The frozen river',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'The Ossuary of Saint Calder is a long chalk hall lined floor to vault with bones, stacked as neatly as firewood. A Grey Monk with a closed eye stitched on his hood is sorting skulls into rows, humming.', next: 'hello' },
      hello: { speaker: 'npc:brother-ossory', mood: 'happy', text: 'Mind the step. And the femur. That is Brother Aldo; he doesn’t mind being trodden on, but I do on his behalf. Ossory, of Morrow’s Grey. You have the look of someone who’s come about the dead. Everybody does, this winter.', next: 'dead' },
      dead: {
        speaker: 'npc:brother-ossory',
        text: 'Restless? Oh, they are well past restless. They are queuing. Saela’s river has frozen, and nobody is crossing. Sixty souls a night come down the downs looking for the ferry and find only ice. They take it badly. I would.',
        choices: [
          { text: '“How do you know the river is freezing?”', to: 'how', once: true },
          { text: '“What lies under the King-Barrows?”', to: 'barrows', once: true },
          { text: '[Scholar] “Your library holds the oldest human records of the Mire.”', to: 'scholar', when: { dialogueTag: 'scholar' }, tag: 'trait', once: true },
          { text: '[Reaver] “They’re calling to my blood. I can feel it.”', to: 'reaver', when: { classIs: 'class:reaver' }, tag: 'class', once: true },
          { text: '“Then I’ll go down and see.”', to: 'go' },
        ],
      },
      how: { speaker: 'npc:brother-ossory', text: 'We are Morrow’s. We keep the memories of the dead; they come to us as they cross, the way a ferryman’s ledger fills. Since the Quench the ledger has stayed empty. Grim business, an empty ledger. Far worse than a full one.', next: 'dead' },
      barrows: { speaker: 'npc:brother-ossory', effects: [{ unlockLore: 'lore:barrow-kings' }], text: 'Kings, mostly. The old Barrow-Kings, before the Charter, some still wearing their crowns, which is vanity: you can’t take it with you, and if you do, it falls off. Below the oldest of them is a shrine to Saela. Our order raised it, a long while ago. The river runs closest to the world there.', next: 'edric' },
      edric: { speaker: 'npc:brother-ossory', text: 'Edric Barrowborn’s great tomb is down there too, and it is empty. We know. We looked. Professional curiosity.', next: 'dead' },
      scholar: { speaker: 'narrator', text: 'He smiles without looking up. “Libraries hold all manner of things. Dust, chiefly. And silence, which is a sort of dust.”', next: 'dead' },
      reaver: { speaker: 'npc:brother-ossory', mood: 'afraid', text: 'Then don’t answer them. Blood is warm, and the cold ones love warmth the way moths love a candle. They have nothing to give you but company, and it is cold company.', next: 'dead' },
      go: { speaker: 'npc:brother-ossory', text: 'Go down, then. Light the shrine if it will be lit, and see what Saela has left us. Take this candle. No, you don’t need it. It’s for them. The dead like to see a face.' },
    },
  },
  {
    id: 'dialogue:obj-river-under-shrine', name: 'Object: The shrine of the River Under',
    entries: [
      { when: { flag: 'act1.river_truth' }, node: 'after' },
      { when: { questStage: Q6, stage: 'shrine' }, node: 'descend' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'narrator', text: 'A cupped stone hand on the bank of a frozen river, brimming with ice. Something under the ice is waiting.' },
      after: { speaker: 'narrator', text: 'A thread of open black water still runs down the middle of the frozen river. Now and then a small blue lamp drifts by on it, going somewhere you cannot follow.' },
      descend: { speaker: 'narrator', text: 'The deepest floor of the King-Barrows is not a floor. The chalk ends, and below it is black stone, and below the black stone is a river. It runs through the dark from nowhere to nowhere, as wide as the King’s Way, and it makes no sound at all. It is frozen.', next: 'ice' },
      ice: { speaker: 'narrator', mood: 'afraid', text: 'Under the ice are faces. Hundreds of them: the dead of a whole year, pressed against the underside with their eyes open and their hands flat on the ice, like children at a winter window. Their little reed boats are frozen in beside them, each with a lamp gone out at the prow.', next: 'shrine' },
      shrine: {
        speaker: 'narrator',
        text: 'On the bank stands Saela’s shrine: a cupped stone hand as tall as you are, brimming with ice. Words are carved around its wrist in a dozen tongues.',
        choices: [
          { text: 'Read the carvings.', to: 'carvings', once: true, tag: 'lore', check: { stat: 'intellect', dc: 15, failTo: 'carvings-fail' } },
          { text: '[Devout] Pray to Saela the Tide-Mother.', to: 'pray', when: { dialogueTag: 'devout' }, tag: 'trait', once: true },
          { text: '[Hollow-touched] Kneel and listen to the water under the ice.', to: 'listen', when: { dialogueTag: 'hollow-touched' }, tag: 'trait', once: true },
          { text: '[Reaver] Open your palm and let your blood fall on the ice.', to: 'reaver', when: { classIs: 'class:reaver' }, tag: 'class', once: true },
          { text: 'Lay your marked hand in the stone palm.', to: 'kindle' },
        ],
      },
      carvings: { speaker: 'narrator', text: 'Haldish, High Solenni, the looping Aelthi script, hard Orrun runes, and older marks that are only waves. Every one of them says the same thing: Saela carries; Morrow keeps. Beneath them all, cut so deep the chisel must have broken, is a plain black circle.', next: 'shrine' },
      'carvings-fail': { speaker: 'narrator', text: 'The words are worn smooth by a thousand years of hands. You can make out only the Haldish: Saela carries.', next: 'shrine' },
      pray: { speaker: 'narrator', effects: [{ unlockLore: 'lore:saela-and-the-river-under' }], text: 'You pray as your gran prayed at the hearth: Tide-Mother, carry them. The ice does not move. But for a moment you feel a hand cupped under your own, very cold and very patient, waiting for something to be put in it.', next: 'shrine' },
      listen: { speaker: 'narrator', mood: 'hollow', effects: [{ setFlag: 'act1.river_heard_waking', value: true }], text: 'Beneath the faces, beneath the river, there is a sound like the sea in a shell: vast and slow, the breathing of something with no edges. Many voices murmur in it, like a crowded hall heard through a wall, all of them asleep. All but one. That one stops when you begin to listen. It is listening back.', next: 'shrine' },
      reaver: { speaker: 'narrator', mood: 'hollow', text: 'Your blood steams on the ice and the ice softens at once, eagerly, too eagerly, and under it every face turns toward the warmth. Then a voice, from very far down: “Not that warmth, child. That is the warmth it answers to.” The ice closes again.', next: 'shrine' },
      kindle: { speaker: 'narrator', text: 'You lay your marked hand in the stone palm. The Ashmark flares; the ice in Saela’s hand runs to water, and the water runs down the stone into the river, and where it touches, the river groans and opens in a ring of black water no wider than a well.', next: 'singer' },
      singer: { speaker: 'narrator', text: 'Someone rises through it like breath through cold air. An Aelthi woman, or the memory of one: robed in river-weed, her hair drifting as though the river still ran, a harp of bone in the crook of her arm with no strings left on it. Her lips move. The voice arrives a moment after, as if from very far down.', next: 's1' },
      s1: { speaker: 'narrator', text: '“You are warm. Forgive me. It has been so long since anything here was warm.”', next: 's2' },
      s2: {
        speaker: 'narrator', mood: 'sad',
        text: '“I was a singer of Ys Aerwen. I sang on the lake on the night of the Lullaby. When the city went down we did not go down Saela’s river; we went into the lake, and the lake went into the sea beneath it, and her boat could not find us. So I stayed. I have sung under this river eleven hundred years, so that the dead pass over me gently.”',
        choices: [
          { text: '“What sea?”', to: 'sea' },
          { text: '“Why is the river frozen?”', to: 'frozen' },
          { text: '“Rhiannon Ys-Caer remembers Ys. She was a child there.”', to: 'rhiannon', when: { flag: 'act1.ylwen_pact' }, once: true },
        ],
      },
      rhiannon: { speaker: 'narrator', effects: [{ setFlag: 'act1.ys_roofs_message', value: true }], text: '“Little Rhiannon, on her mother’s shoulders, with a red ribbon in her hair.” For a moment the drowned face is almost glad. “Tell her the roofs were the colour of the inside of a shell at dawn. She will know. She has been trying to remember it for a thousand years.”', next: 'sea' },
      sea: { speaker: 'narrator', text: '“Do you not know what runs beneath your world, little ember? The priests will tell you: the Mire, the dark, the enemy below. We sang it otherwise. It is a sea. It is the sea that was here before there was a here: every child never born, every city never built, every shape that never had to choose one shape.”', next: 'sea2' },
      sea2: { speaker: 'narrator', mood: 'hollow', effects: [{ unlockLore: 'lore:the-mire', section: 'dreaming' }], text: '“It was dreaming. Listen to me, warm one, because no one in your world will tell you this. It was dreaming before it was chained.”', next: 'sea3' },
      sea3: {
        speaker: 'narrator',
        text: '“Then the hammer came down, and the dream was beaten flat into stone and sky, and a nail of fire was driven through its heart to hold it there. It does not hate you. It does not know you. It is turning in its sleep because the nail is cooling, and when a sleeper turns, those who lie upon it fall.”',
        choices: [
          { text: '“Who chained it?”', to: 'who', once: true },
          { text: '“Was it wrong, to chain it?”', to: 'wrong', once: true },
          { text: '“Why is the river frozen?”', to: 'frozen' },
        ],
      },
      who: { speaker: 'narrator', text: '“You know his name. You carry a splinter of his heart in your hand. Do not hate him either. He wanted to be one thing. So did we all, once we had begun.”', next: 'sea3' },
      wrong: { speaker: 'narrator', mood: 'sad', text: '“I do not know. I was a song, and songs do not judge. But I remember the moment after I drowned, before I found the river. It was like being held. It was like being every one of my sisters at once.” Her empty fingers move on the harp. “And there was no one there to be held. Only the holding.”', next: 'sea3' },
      frozen: { speaker: 'narrator', text: '“Saela’s river runs on the sea’s back, as a boat rides a swell. Now the sea tosses, and the cold of its turning comes up through the water, and the water stops. The dead cannot cross. They wait beneath the ice and grow angry, as you would. As I did, for a while.”', next: 'free' },
      free: { speaker: 'narrator', text: '“Not by you, if you mean to ask it. Not yet. But you have warmed it here, a little, for a while. Those who lie near enough may cross while your warmth lasts.” She looks up through the earth as if she can see the sky. “There is an old soldier keeping a door, far from here, under a hill on a moor. Tell him the river runs.”', next: 'boats' },
      boats: { speaker: 'narrator', text: 'Beneath the ice the faces begin to move. One by one the reed boats loosen. The lamps at their prows catch, blue and small, and drift away down a thread of black water toward somewhere you cannot see.', next: 'farewell' },
      farewell: { speaker: 'narrator', mood: 'hollow', text: '“Hun, hun, little ember. Sleep, when you can. And when you come to the bottom of the world, do not be afraid of the sea.” She is sinking. “Be afraid of what in it is awake.”', next: 'gone' },
      gone: {
        speaker: 'narrator',
        effects: [{ setFlag: 'act1.river_truth', value: true }, { unlockLore: 'lore:saela-and-the-river-under' }, { unlockLore: 'lore:the-mire', section: 'dreaming' }],
        text: 'Then she is gone, and the ring closes, and the river is ice again: all but a narrow road of open water down its middle, where the small lights go.',
      },
    },
  },
  {
    id: 'dialogue:ch2-ossory-report', name: 'Ossory: What the Grey Monks know',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:brother-ossory', text: 'You saw it. I can tell. Everyone comes up from that shrine with the same face. We keep a mirror at the top of the stairs so they can see it for themselves.', next: 'tell' },
      tell: { speaker: 'player', text: 'A drowned singer of Ys told me the sea under the river was dreaming before it was chained.', next: 'quiet' },
      quiet: { speaker: 'npc:brother-ossory', mood: 'sad', text: 'Did she. …The Grey Monks have known for, let us say, a long time. Since before Solenne. Morrow is the god of dreams, and that is the largest dream there is. We write it down, and we do not say it. The last time someone said it loudly a city sank, and the time before that, I suspect, a god leapt.', next: 'hub' },
      hub: {
        speaker: 'npc:brother-ossory', text: 'Ask, if you must. I may even answer.',
        choices: [
          { text: '“Why keep it secret?”', to: 'secret', once: true },
          { text: '“Then tell me what else your order knows.”', to: 'more', once: true, tag: 'persuade', check: { stat: 'will', dc: 15, failTo: 'more-fail' } },
          { text: '[Devout] “Saela carries; Morrow keeps.”', to: 'devout', when: { dialogueTag: 'devout' }, tag: 'trait', once: true },
          { text: '“The river is moving, near the shrine.”', to: 'river' },
        ],
      },
      secret: { speaker: 'npc:brother-ossory', text: 'Because the Lanternate burns people for less, and because it is no comfort. “The world is a nail driven into a sleeping thing” is not a hymn anyone wants sung at a funeral. I have tried. The widows complain.', next: 'hub' },
      more: { speaker: 'narrator', mood: 'afraid', effects: [{ setFlag: 'act1.ossory_ysolde_hint', value: true }], text: 'He sets down the skull he is holding. “One thing, then, and you never had it from me. Seven years ago a Lightsworn healer came to us and read in our library for a month. Pale, kind, very tired. She asked for the same books you are about to ask for. We gave them to her. She was a saint, after all.”', next: 'hub' },
      'more-fail': { speaker: 'npc:brother-ossory', text: 'A good try. I have been sworn to silence by far better liars than you, and they are all downstairs.', next: 'hub' },
      devout: { speaker: 'npc:brother-ossory', mood: 'happy', text: 'And Morrow remembers. Well said. You may have a skull, if you like. No? Most people say no.', next: 'hub' },
      river: { speaker: 'npc:brother-ossory', effects: [{ unlockLore: 'lore:morrow-the-veiled' }], text: 'Then some will cross tonight. Good. That is a few fewer for the queue. And if the river is moving, even a little, there are others it may reach. The old dead are patient. Go and tell them, wherever they are waiting.' },
    },
  },
  // ----- Wren Tallow: the star in the sea
  {
    id: 'dialogue:wren-ember', name: 'Wren: The star in the net',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'The Salt Exchange is a hall of tallow-light and shouting, its walls chalked with prices for herring, wool, cinderglass and men. At a high desk a woman in a sea-green coat is writing in three ledgers at once. She smiles before she looks up.', next: 'hello' },
      hello: { speaker: 'npc:wren-tallow', mood: 'happy', text: 'A new face! And a gloved hand in midwinter, which is either fashion or a secret. I deal in both. Wren Tallow, factor of the Salt League. What are you buying?', next: 'ask' },
      ask: {
        speaker: 'npc:wren-tallow', text: 'Or selling. I am not proud.',
        choices: [
          { text: '“I hear the League fished something out of the sea.”', to: 'star' },
          { text: '[Shade] “The Quiet Hand sends its regards.”', to: 'shade', when: { classIs: 'class:shade' }, tag: 'class', once: true },
        ],
      },
      shade: { speaker: 'npc:wren-tallow', text: 'Does it! Then you know what a favour is worth, and we shall get on famously. Sit. Don’t touch the ink.', next: 'star' },
      star: { speaker: 'npc:wren-tallow', text: 'You hear a great many things for someone an hour off the King’s Way. …Very well. A star. It fell into the Saltreach on Lanternmass and boiled the sea for a mile. The Admiral’s own crew hauled it up in a net of wet chain. Three of them are still coughing ash.', next: 'auction' },
      auction: {
        speaker: 'npc:wren-tallow', effects: [{ setFlag: 'act1.auction_known', value: true }, { unlockLore: 'lore:brackhaven' }],
        text: 'The Admiral means to sell it, in the isles, next spring, if spring comes. Solenne will bid. Haldren will bid, if it has anything left. The Choir would rather not bid at all, I suspect. Invitations cost a favour. Not coin. Coin is cheap this winter. Favours keep.',
        choices: [
          { text: '“Name the favour.”', to: 'favour' },
          { text: '[Silver Tongue] “An unnamed favour can’t be priced. Name it now, or halve it.”', to: 'haggle', when: { dialogueTag: 'silver-tongue' }, tag: 'trait', once: true },
          { text: '“If it’s an Ember, it will pull at my hand. I could find it without you.”', to: 'threat', tag: 'intimidate', once: true, check: { stat: 'will', dc: 15, failTo: 'threat-fail' } },
          { text: '[Noble-born] “My family’s name should be worth an invitation.”', to: 'noble', when: { dialogueTag: 'noble-born' }, tag: 'trait', once: true },
          { text: '“Not today.”', to: 'later', tag: 'leave' },
        ],
      },
      favour: {
        speaker: 'npc:wren-tallow', text: 'I don’t know it yet. That is what makes it valuable. One day someone will bring you a tallow candle stamped with a wren, and you will do what they ask. Within reason. Mostly within reason.',
        choices: [
          { text: '“Agreed.”', to: 'sealed', effects: [{ setFlag: 'act1.wren_favour', value: 'whole' }, { reputation: 'faction:salt-league', delta: 5 }] },
          { text: '“No. Not blind.”', to: 'later' },
        ],
      },
      haggle: { speaker: 'npc:wren-tallow', mood: 'happy', effects: [{ setFlag: 'act1.wren_favour', value: 'half' }, { reputation: 'faction:salt-league', delta: 5 }], text: 'Oh, I like you. Half a favour, then. I shall ask for something small. Probably. Shake on it; the League is very old-fashioned about hands.', next: 'sealed' },
      threat: { speaker: 'narrator', text: 'Her smile thins by exactly one tooth. “Could you. Then you will want my goodwill all the more. The isles are full of people who drown thieves, and they all owe me money.”', next: 'auction' },
      'threat-fail': { speaker: 'npc:wren-tallow', mood: 'happy', text: 'Of course you could, my dear. And I could fly to the isles on a herring. Shall we talk like merchants?', next: 'auction' },
      noble: { speaker: 'npc:wren-tallow', text: 'Names are lovely. Brackhaven has a great many of them, mostly carved on drowned men’s stones. Try again.', next: 'auction' },
      sealed: { speaker: 'narrator', text: 'Wren writes something in the third ledger, blots it, and slides a card of salt-stiff paper across the desk: a wren printed in tallow, and nothing else. “The auction will find you,” she says. “Things do, when they owe you.”' },
      later: { speaker: 'npc:wren-tallow', text: 'Then come back when you are hungrier. Everybody does.' },
    },
  },
  // ----- Cuthred: Edric’s oath
  {
    id: 'dialogue:ch2-cuthred-farewell', name: 'Cuthred: The King’s door',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'Beyond the round door is a low chamber of old stone. A king lies on the bier in rusted mail, a sword upon his breast. At his feet kneels a man made of frost: a soldier in the gear of three centuries gone, his face worn thin as ice on a puddle.', next: 'hello' },
      hello: { speaker: 'npc:cuthred', text: 'Ashmarked. You warmed the river. I felt it under the moor, like the first thaw. Like spring, that I had forgot.', next: 'oath' },
      oath: {
        speaker: 'npc:cuthred',
        text: 'Three hundred years ago my king lay down here and bade me keep the door. Not in his great tomb in the Witherdowns. That was for the lords’ pride. Here, on the moor, among his own folk, where he was born in a barrow under siege. I swore. And when I died, I went on swearing.',
        choices: [
          { text: '“Why would a dead king need a guard?”', to: 'why', once: true },
          { text: '[Oathbound] “You kept your oath, Cuthred. Let me keep it now.”', to: 'sworn', when: { classIs: 'class:oathbound' }, tag: 'class', once: true },
          { text: '[Warden] “You held your door. That’s all a shield-man can do.”', to: 'sworn', when: { classIs: 'class:warden' }, tag: 'class', once: true },
          { text: '“What did the King keep for me?”', to: 'sword' },
        ],
      },
      why: { speaker: 'npc:cuthred', text: 'He did not. The oath did. Haldish oaths are plain things, but they are long.', next: 'oath' },
      sworn: { speaker: 'narrator', effects: [{ reputation: 'faction:crown-of-haldmarch', delta: 5 }], text: 'He bows his head to you, slowly, as if every inch costs him a winter. Frost falls from his shoulders like snow from a branch.', next: 'oath' },
      sword: { speaker: 'npc:cuthred', text: 'His sword. Edric’s Oath. He bade me: give it to the one who wakes the river, for they will need it more than I. I thought it a riddle. Kings are fond of riddles. It was a prophecy, or a guess, and I have had three hundred years to stop caring which.', next: 'give' },
      give: { speaker: 'narrator', text: 'Cuthred lifts the sword from the king’s breast with hands that leave no mark on the dust. It is heavier than it looks, and warm in your grip. “Swear nothing on it lightly,” he says. “It remembers.”', next: 'ferry' },
      ferry: {
        speaker: 'npc:cuthred', mood: 'sad',
        text: 'Hark. Oars. The ferry is coming. I am cold, and soon I will not be.',
        choices: [
          { text: '[Devout] “Saela carry you, Cuthred.”', to: 'blessed', when: { dialogueTag: 'devout' }, tag: 'trait' },
          { text: '“Go on. You’ve kept the door long enough.”', to: 'last' },
        ],
      },
      blessed: { speaker: 'npc:cuthred', text: 'And Morrow keep me. Aye. That is the old way of it.', next: 'last' },
      last: { speaker: 'npc:cuthred', effects: [{ setFlag: 'act1.cuthred_crossed', value: true }], text: 'Tell Brindlecross that Cuthred kept the door.', next: 'gone' },
      gone: { speaker: 'narrator', text: 'The frost goes out of him all at once, like breath on a cold morning. Where he knelt there is only a little water on the stone, already running away downhill, toward the river.' },
    },
  },
  // ----- general
  {
    id: 'dialogue:ch2-ossory-general', name: 'Ossory: General',
    entries: [{ when: { questStage: Q6, stage: 'barrows' }, node: 'barrows' }, { when: { questStage: Q6, stage: 'shrine' }, node: 'barrows' }, { node: 'idle' }],
    nodes: {
      idle: { speaker: 'npc:brother-ossory', mood: 'happy', text: 'Back again? Most visitors only come the once, and then they stay. Downstairs, mostly.' },
      barrows: { speaker: 'npc:brother-ossory', text: 'The King-Barrows are south along the ridge. Go all the way down. Further than you think. Then a little further.' },
    },
  },
  {
    id: 'dialogue:ch2-wren-general', name: 'Wren: General',
    entries: [{ when: { flag: 'act1.wren_favour' }, node: 'owed' }, { node: 'idle' }],
    nodes: {
      idle: { speaker: 'npc:wren-tallow', mood: 'happy', text: 'Buying, selling, or simply admiring the ink? All three are welcome; only two are free.' },
      owed: { speaker: 'npc:wren-tallow', mood: 'happy', text: 'My favourite debtor! No candle yet. Sleep well. Not too well.' },
    },
  },
];

export default dialogues;
