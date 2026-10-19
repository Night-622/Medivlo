/** Dialogue: Act I Chapter 3, quest:ashes-of-varn (Q12, the Act I climax). Owner: Claude 4. */
import type { DialogueDef, NarrativeCondition } from '@/core';

const Q12 = 'quest:ashes-of-varn';
const ruler = (value: string) => ({ flag: 'act1.ruler', op: '==', value }) as const;
/** The Hesta fate rule (10-act1-spec.md): she lives iff the Ylwen pact was sworn and Anselm was never betrayed. */
const hestaLives: NarrativeCondition = { all: [{ flag: 'act1.ylwen_pact' }, { not: { flag: 'prologue.anselm_betrayed' } }] };
const SUMMONS = '"The Lord-Inquisitor Castor Vellane, by grace of the Lantern, requires the presence of the one called the Ashmarked at the Cathedral of the Brand in Solenne, with all such Embers as the bearer may hold. Lux manet."';

const dialogues: DialogueDef[] = [
  // ----- Q12: ashes-of-varn
  {
    id: 'dialogue:hesta-muster', name: 'Hesta: The muster',
    entries: [{ when: { questStage: Q12, stage: 'muster' }, node: 'start' }, { node: 'later' }],
    nodes: {
      later: { speaker: 'npc:hesta-corrow', text: 'Varn. Water. Her. Go on, I’m right behind you, wheezing.' },
      start: { speaker: 'narrator', text: 'The brazier of Cinderhold burns red under the broken roof, and the hall is full of strangers sleeping in their cloaks. Hesta sits by the fire with Lastlight across her knees, running a whetstone down the blade. She coughs, and spits ash into the coals.', next: 'look' },
      look: { speaker: 'npc:hesta-corrow', text: 'There you are. Come and look at what you’ve dragged together. I’ve seen worse armies. Not many, and they’re mostly dead.', next: 'hub' },
      hub: {
        speaker: 'npc:hesta-corrow', text: 'Well? Ask. You’ll want to know who’s at your back before you walk into the water.',
        choices: [
          { text: '"The Thornwise?"', to: 'thorn', once: true, when: { flag: 'act1.ylwen_pact' } },
          { text: '"Did Ylwen send anyone?"', to: 'nothorn', once: true, when: { not: { flag: 'act1.ylwen_pact' } } },
          { text: '"The Orrun?"', to: 'orrun', once: true, when: { flag: 'act1.nails_kept' } },
          { text: '"Grimma?"', to: 'grimma', once: true, when: { flag: 'act1.nails_exposed' } },
          { text: '"The Grey Monks?"', to: 'monks', once: true, when: { flag: 'act1.river_truth' } },
          { text: '"The Queen’s soldiers?"', to: 'crown-aldith', once: true, when: ruler('aldith') },
          { text: '"Harrow’s army?"', to: 'crown-harrow', once: true, when: ruler('harrow') },
          { text: '"The Wick?"', to: 'crown-wick', once: true, when: ruler('wick') },
          { text: '"Sable?"', to: 'sable', once: true, when: { questCompleted: 'quest:the-quiet-hand' } },
          { text: '"Maren?"', to: 'maren-glad', once: true, when: { any: [{ flag: 'act1.tobin_saved' }, { flag: 'prologue.tobin_fate', op: '==', value: 'saved' }] } },
          { text: '"Maren?"', to: 'maren-lost', once: true, when: { flag: 'act1.tobin_lost' } },
          { text: '"Maren?"', to: 'maren-dead', once: true, when: { flag: 'prologue.tobin_fate', op: '==', value: 'dead' } },
          { text: '"Brother Anselm?"', to: 'anselm', once: true, when: { not: { flag: 'prologue.anselm_betrayed' } } },
          { text: '"Brother Anselm?"', to: 'anselm-gone', once: true, when: { flag: 'prologue.anselm_betrayed' } },
          { text: '[Edric’s Oath] Lay the Barrow-King’s sword by the fire.', to: 'edric', once: true, when: { hasItem: 'item:edrics-oath' } },
          { text: '"And you?"', to: 'you' },
        ],
      },
      thorn: { speaker: 'npc:hesta-corrow', text: 'Cadoc’s here, eating my bread and criticising my roof. The Archdruid sent forty bows and a dozen singers. Singers, to a war. The Aelthi have never been quite sure which is which.', next: 'hub' },
      nothorn: { speaker: 'npc:hesta-corrow', mood: 'sad', text: 'No. Ylwen keeps its gates shut and its songs to itself. We’ll have no singing at Varn. Pray we don’t need any.', next: 'hub' },
      orrun: { speaker: 'npc:hesta-corrow', text: 'A company of Korrath hammers in true-iron to the eyebrows. The Thane-Speaker paid well for your silence. I’d count those Nails again, if I were you.', next: 'hub' },
      grimma: { speaker: 'npc:hesta-corrow', text: 'Grimma Ironsong, and nobody else from under the mountain. The Concord won’t lend a spoon to the woman who shamed them. She says she’s worth a company. Having watched her eat, I believe her.', next: 'hub' },
      monks: { speaker: 'npc:hesta-corrow', text: 'Brother Ossory sent six Grey Monks with lanterns and shrouds. They’ll walk behind the line and sing Varn’s dead down the River Under, if it’s thawed enough to take them. Morbid lot. I like them.', next: 'hub' },
      'crown-aldith': { speaker: 'npc:hesta-corrow', text: 'The Queen’s household and every man who’d rather follow her than Harrow. Three hundred. Not many. Honest. I’ll take honest.', next: 'hub' },
      'crown-harrow': { speaker: 'npc:hesta-corrow', text: 'Harrow’s whole muster: two thousand spears, horse, a siege-train. It’s a real army. Watch your back in it. A man who bargains with the water once will do it again.', next: 'hub' },
      'crown-wick': { speaker: 'npc:hesta-corrow', mood: 'angry', text: 'Five hundred of the Order in black, and every one of them carrying orders about you. I’ll be marching beside the men who burned my order. Don’t expect me to sing.', next: 'hub' },
      sable: { speaker: 'npc:hesta-corrow', text: 'Cheerful as a sparrow, and wiping her eyes when she thinks I can’t see. Watch that one. Not for the reason you think.', next: 'hub' },
      'maren-glad': { speaker: 'npc:hesta-corrow', mood: 'happy', text: 'In the yard, fletching arrows. She was singing. I didn’t know she could. You did that.', next: 'hub' },
      'maren-lost': { speaker: 'npc:hesta-corrow', mood: 'sad', text: 'She hasn’t slept. She’s asked for the front rank. She wants every Choir throat in the marsh. I gave her a bow and told her to aim; I can’t tell her not to hate.', next: 'hub' },
      'maren-dead': { speaker: 'npc:hesta-corrow', mood: 'sad', text: 'She came. She won’t stand anywhere near you, but she came. Make of that what you can.', next: 'hub' },
      anselm: { speaker: 'npc:hesta-corrow', text: 'Praying in the corner by the well, very quietly in case the Wick hears. There’s more Radiance in that soft old priest than in half of Solenne. Don’t tell him. It’ll go to his head.', next: 'hub' },
      'anselm-gone': { speaker: 'npc:hesta-corrow', mood: 'sad', text: 'In a cell at Valcastre, because you told Hale about a book. I’d have liked a priest at Varn. A real one.', next: 'hub' },
      edric: { speaker: 'npc:hesta-corrow', text: 'A Barrow-King’s blade. Show-off. (But she looks at it a long while, and her mouth softens.) Edric would have liked this war. He liked hopeless ones.', next: 'hub' },
      you: {
        speaker: 'npc:hesta-corrow', text: 'Me? I’m seventy years old and I cough cinders. I’ll do.',
        choices: [
          { text: '"The Reed-Mother said Ysolde would be at Varn."', to: 'ysolde', when: { flag: 'act1.ysolde_at_varn' } },
          { text: '"Stay here. Hold Cinderhold."', to: 'stay' },
          { text: '[Arcanist] "Your cinderlung is worse. One more hard draw could burn you out."', to: 'lung', when: { classIs: 'class:arcanist' }, tag: 'class' },
          { text: '[Devout] "Will you pray with me?"', to: 'pray', when: { dialogueTag: 'devout' }, tag: 'trait' },
          { text: '"Promise me you won’t do anything foolish."', to: 'promise', tag: 'persuade', check: { stat: 'will', dc: 15, failTo: 'no-promise' } },
        ],
      },
      ysolde: { speaker: 'npc:hesta-corrow', mood: 'sad', text: 'Of course she will. She was always early to lessons. If she comes, she comes for me as much as for you. I taught her to hold a flame. Somebody has to finish the lesson.', next: 'march' },
      stay: { speaker: 'npc:hesta-corrow', mood: 'angry', text: 'And send you to meet her alone? I taught her. Her mistakes are mine, child, every one, and I’ll not have you paying for them.', next: 'march' },
      lung: { speaker: 'npc:hesta-corrow', text: '(She gives you a sharp look.) Clever. Yes. One more great draw and I go up like a hayrick at harvest. So I’ll make it count, if it comes to that. Don’t look at me like that.', next: 'march' },
      pray: { speaker: 'npc:hesta-corrow', text: 'To whom? The Seven haven’t answered an Emberwarden since 1041. (But she bows her head beside you, and her lips move, and for once she doesn’t cough.)', next: 'march' },
      promise: { speaker: 'npc:hesta-corrow', effects: [{ setFlag: 'npc.hesta-corrow.promised', value: true }], text: '…Fine. I promise to do nothing foolish. Only what’s necessary. (She touches the back of your hand, once.) You’re a good child. Tell anyone I said so and I’ll deny it.', next: 'march' },
      'no-promise': { speaker: 'npc:hesta-corrow', text: 'No. I don’t make promises I may have to break. I made one to her once.', next: 'march' },
      march: { speaker: 'npc:hesta-corrow', text: 'We march at first light. Get some sleep. If you can’t sleep, sharpen something.' },
    },
  },
  {
    id: 'dialogue:obj-varn-floodgate-wheel', name: 'Object: The floodgate wheel of Varn',
    entries: [
      { when: { flag: 'act1.varn_assault' }, node: 'done' },
      { when: { questStage: Q12, stage: 'causeway' }, node: 'wheel' },
      { node: 'locked' },
    ],
    nodes: {
      locked: { speaker: 'narrator', text: 'A great wheel of black oak and Orrin iron, turned all the way open. Water pours through the gates beneath it with a sound like breathing.' },
      done: { speaker: 'narrator', text: 'The floodgate wheel stands closed. The water is going out of Varn.' },
      wheel: {
        speaker: 'narrator',
        text: 'Aldwin Varn turned this wheel with his own hands on the Night of Falling Ash, and it has rusted where it stood. Beneath you the whole marsh pours into the town.',
        choices: [
          { text: '[Orrun hammers] Let the Korrath company break the rust.', to: 'orrun', when: { flag: 'act1.nails_kept' } },
          { text: '[Warden] Brace yourself under the spokes and drive it round.', to: 'turn', when: { classIs: 'class:warden' }, tag: 'class' },
          { text: 'Put your shoulder to it.', to: 'turn', check: { stat: 'might', dc: 15, failTo: 'strain' } },
          { text: 'Kindle the rust out of the collar with the mark.', to: 'turn', check: { stat: 'will', dc: 15, failTo: 'strain' } },
        ],
      },
      orrun: { speaker: 'narrator', text: 'Six Orrun set their hammers to the collar and strike in time, chanting "Korr nagh, korr nagh". The rust bursts off the iron like bark off a burning log.', next: 'turn' },
      strain: { speaker: 'narrator', text: 'It will not move. Then a burned hand closes over yours. "Out of the way," says Hesta, and the iron glows red under her palm until it gives. She coughs ash for a long while afterwards and will not let you see her face.', next: 'turn' },
      turn: { speaker: 'narrator', effects: [{ setFlag: 'act1.varn_assault', value: true }], text: 'Far below, the floodgates of Varn grind shut for the first time in a year. The roar of water slows to a trickle and stops. Street by street the drowned town comes up out of the flood, black and dripping, and in the hall on the hill the bells are still ringing.' },
    },
  },
  {
    id: 'dialogue:ch3-aldwin-hall', name: 'Aldwin Varn: The drowned hall',
    entries: [{ node: 'hall' }],
    nodes: {
      hall: { speaker: 'narrator', effects: [{ unlockLore: 'lore:aldwin-varn', section: 'drowned-lord' }], text: 'The hall of Varn stands knee-deep in black water, and lanterns burn under the surface. At the high table sits a man in rotted finery with an eel-hook as long as a spear across his knees. Beside him sit a woman in grey and a girl of seven with a ribbon in her hair, pale and smiling. They are made of water. Neither casts a reflection, and neither speaks.', next: 'guests' },
      guests: { speaker: 'npc:aldwin-varn', mood: 'hollow', text: 'Merewyn, love, we have guests. Elfreda, sit up straight. …You’ve come about the Ember. Everyone comes about the Ember. Nobody ever comes about us.', next: 'girl' },
      girl: {
        speaker: 'npc:aldwin-varn', mood: 'hollow', text: '(The girl turns her head toward you and smiles, and says nothing.) Elfreda asks if you are the warm one the white lady promised us. She doesn’t speak, you understand. Not since… But I always know what she means.',
        choices: [
          { text: '"Lord Varn, your wife and daughter died of the Grey Lung."', to: 'lung' },
          { text: 'Look at them through the mark.', to: 'sight' },
          { text: '"Lay down the hook, my lord. Let them go."', to: 'falter', tag: 'persuade', check: { stat: 'will', dc: 20, failTo: 'rage' } },
        ],
      },
      lung: { speaker: 'npc:aldwin-varn', mood: 'angry', effects: [{ unlockLore: 'lore:the-grey-lung', section: 'too-late' }], text: 'They died. And then the Choir sang to me, and they came back. Look at them. LOOK at them. Saint Ysolde came to my gate a fortnight after we buried them. A fortnight. I thanked her. I thanked her. The world owes me this. Below owes me this.', next: 'rage' },
      sight: { speaker: 'narrator', text: 'Through the mark the woman and the girl are not there at all. There is only black water standing up in the shape of what he wants, and threads of it running from them into his chest. They are drinking him.', next: 'rage' },
      falter: { speaker: 'npc:aldwin-varn', mood: 'afraid', effects: [{ setFlag: 'npc.aldwin-varn.wavered', value: true }], text: '(The hook dips. For a moment his eyes are a man’s eyes.) If I let go they… no. No. Merewyn, tell them. Tell them you’re real.', next: 'rage' },
      rage: { speaker: 'npc:aldwin-varn', mood: 'hollow', text: 'You will not take them from me again. Not you, not the Lantern, not the Seven themselves. I drowned a town to keep them. What is one more?' },
    },
  },
  {
    id: 'dialogue:aldwin-death', name: 'Aldwin Varn: The end of the Drowned Lord',
    entries: [{ when: { flag: 'act1.varn_fate' }, node: 'over' }, { node: 'fall' }],
    nodes: {
      over: { speaker: 'narrator', text: 'Aldwin Varn lies still in the shallows of his hall.' },
      fall: { speaker: 'narrator', text: 'The Drowned Lord falls to his knees, and the hook slips from his hands. At once the woman and the girl are kneeling beside him, holding him, and he is weeping like a child.', next: 'plead' },
      plead: {
        speaker: 'npc:aldwin-varn', mood: 'hollow', text: 'Don’t let them take you. Merewyn, hold on to me. Elfreda, hold on.',
        choices: [
          { text: 'Purge him, gently. Show him what they are.', to: 'peace', when: { flag: 'npc.aldwin-varn.wavered' } },
          { text: 'Purge him, gently. Show him what they are.', to: 'peace', when: { not: { flag: 'npc.aldwin-varn.wavered' } }, check: { stat: 'will', dc: 15, failTo: 'flicker' } },
          { text: 'End it.', to: 'slain', tag: 'aggressive' },
        ],
      },
      flicker: {
        speaker: 'narrator', text: 'The fire gutters against the black water and goes out. The ghosts cling closer, and he will not look.',
        choices: [
          { text: 'Again. Slower.', to: 'peace', check: { stat: 'will', dc: 10, failTo: 'slain' } },
          { text: 'End it.', to: 'slain', tag: 'aggressive' },
        ],
      },
      peace: { speaker: 'narrator', text: 'You lay your hand on his chest and let the fire go into him. The ghosts do not scream. They only lose their shape: a woman, then a column of water, then rain. The ribbon falls last. Aldwin Varn watches it sink, and behind where they sat there is nothing but reeds.', next: 'peace2' },
      peace2: { speaker: 'npc:aldwin-varn', mood: 'sad', text: 'Ah. Yes. I think I knew. They were never… It was only the water. It was only ever me, talking to the water. I drowned my town to keep two ghosts. Merewyn would have boxed my ears.', next: 'peace3' },
      peace3: { speaker: 'npc:aldwin-varn', mood: 'sad', effects: [{ setFlag: 'act1.varn_fate', value: 'peace' }, { reputation: 'faction:crown-of-haldmarch', delta: 5 }, { reputation: 'faction:drowned-choir', delta: 5 }, { unlockLore: 'lore:aldwin-varn', section: 'peace' }], text: 'Have the bells stopped, would you? Their real graves are under the yew on Varn hill. Bury me there, if there’s any dry left. (He closes his eyes. When he dies, the black has gone out of them.)' },
      slain: { speaker: 'narrator', effects: [{ setFlag: 'act1.varn_fate', value: 'slain' }, { reputation: 'faction:crown-of-haldmarch', delta: 5 }, { unlockLore: 'lore:aldwin-varn', section: 'slain' }], text: 'One stroke. He dies calling their names, and the two pale shapes beside him do not turn their heads. When he is gone they stay a moment, smiling at nothing, then sink into the black water without a sound.' },
    },
  },
  {
    id: 'dialogue:obj-ember-of-the-fen', name: 'Ysolde: The Ember of the Fen',
    entries: [
      { when: { flag: 'act1.ember_fen_claimed' }, node: 'after' },
      { when: { questStage: Q12, stage: 'ember' }, node: 'pool' },
      { node: 'wait' },
    ],
    nodes: {
      wait: { speaker: 'narrator', text: 'Something burns green-gold beneath the black water at the end of the hall. Something is still guarding it.' },
      after: { speaker: 'narrator', text: 'The pool is black and still and empty. The bells of Varn do not ring.' },
      pool: { speaker: 'narrator', text: 'Behind the high table, where the hearth should be, the floor has fallen into a pool. At the bottom something burns green-gold, like marsh-fire: the second Ember. Your mark aches like a bad tooth.', next: 'still' },
      still: { speaker: 'narrator', text: 'Then the water in the hall goes still, all of it at once: every ripple, every drip from the rafters. The bells stop. Beside you Hesta says, very quietly, "Oh, no. No, girl. Not here."', next: 'rise' },
      rise: { speaker: 'narrator', text: 'The pool stands up. It rises the way a woman rises from a bath, slow and unashamed: tall, robed in white that is always wet, with skin you can almost see through. Water runs from her eyes and her hair and never reaches the floor. About her head a ring of black water turns like a halo.', next: 'spark' },
      spark: {
        speaker: 'npc:ysolde', mood: 'hollow',
        text: 'Little spark. You came all this way through the cold. Look at you, burning brighter. Does it hurt yet? It will. I’m sorry. It will.',
        choices: [
          { text: '"Ysolde."', to: 'name' },
          { text: '"Stay back."', to: 'back' },
        ],
      },
      name: { speaker: 'npc:ysolde', mood: 'hollow', text: 'You say it the way she taught you to. (She turns her head.) Hello, Mistress.', next: 'hesta1' },
      back: { speaker: 'npc:ysolde', mood: 'hollow', text: 'I’m not here for you. Not yet. (She turns her head.) Hello, Mistress.', next: 'hesta1' },
      hesta1: { speaker: 'npc:hesta-corrow', mood: 'angry', text: 'Don’t you call me that. Don’t you dare. You gave up that word the night you put out the Brand.', next: 'ysolde2' },
      ysolde2: { speaker: 'npc:ysolde', mood: 'sad', text: 'You taught me everything. You read me the reports by candlelight, the ones the Church buried: the leys cooling, decade on decade. You wept over them. Then you put them back in the box and went on pretending. I didn’t pretend. That’s all I did.', next: 'hesta2' },
      hesta2: { speaker: 'npc:hesta-corrow', mood: 'angry', text: 'You put out every hearth in the world to win an argument with me.', next: 'offer' },
      offer: { speaker: 'npc:ysolde', mood: 'sad', text: 'I came to give you a choice, Mistress, because I love you. Lay down your sword. Put your hand in the water. It will stop hurting: your lungs, your hands, all those years. You’ll sleep. Or stand between me and the Ember, and I will take it anyway, and it will hurt you very much.', next: 'tide' },
      tide: {
        speaker: 'narrator',
        text: 'Hesta does not move. Neither does Ysolde. Between them the Ember burns under the water, and the black has begun to creep out of the pool toward your hand, gently, the way the tide comes in round a child’s castle of sand.',
        choices: [
          { text: '"Why do you need them? The Embers."', to: 'why', once: true },
          { text: '"Hesta, don’t listen to her."', to: 'hold' },
          { text: '[Reach for the Ember]', to: 'hold' },
        ],
      },
      why: { speaker: 'npc:ysolde', mood: 'sad', text: 'Because it is dying, little spark. The Heartfire has been dying for two hundred years. When it goes out by itself the world will tear, slowly, for a hundred years of famine. If I carry the Embers home and give them gently, everyone simply falls asleep. No more winters. No more Grey Lung. No more little girls drowned for a lord’s ghosts. Isn’t that kind?', next: 'tide' },
      hold: {
        speaker: 'narrator',
        text: 'You reach for the Ember, and the black water reaches for you. It wraps your wrist, cool and soft, and the Ashmark begins to drain out of you like warmth from a hand held in a stream. "I’m not taking it from you," Ysolde murmurs. "I’m taking you with it. Gently. You’ll hardly feel it."',
        choices: [
          { text: '[Behind you, a song begins]', to: 'song', when: hestaLives },
          { text: '[Hesta steps forward]', to: 'sacrifice', when: { not: hestaLives } },
        ],
      },
      // --- Hesta lives: Cadoc’s song and Anselm’s Radiance
      song: { speaker: 'narrator', effects: [{ unlockLore: 'lore:the-lullaby' }, { unlockLore: 'lore:the-lullaby', section: 'verse' }], text: 'Behind you Cadoc ap Ynys begins to sing. It is not loud. It is the oldest sound you have ever heard, a cradle-song in a tongue made of leaves: Hun, Ae’Hun, ys hun. Gwyn aer, gwyn aer, ys hun. And this time he does not stop where the verse ends. The black water about your wrist slows, as if it were listening.', next: 'cadoc' },
      cadoc: { speaker: 'npc:cadoc-ap-ynys', text: '(Between verses, dryly.) I should mention I have never sung this to anything larger than a pond.', next: 'radiance' },
      radiance: { speaker: 'narrator', text: 'Then Brother Anselm is at your other side, the Warden’s Primer clutched in one fist and the other hand raised, and white light pours from his palm.', next: 'anselm' },
      anselm: { speaker: 'npc:anselm-pryde', text: 'Ignis Ithreni, tenebra cedit! By Ithren’s fire, darkness yields! (His voice shakes. His light does not.)', next: 'cut' },
      cut: { speaker: 'narrator', text: 'The water loosens. Hesta steps forward with Lastlight blazing red and cuts the black tide from your wrist in a single stroke. The Ember leaps out of the pool to your hand and goes in, like a stone into a pond.', next: 'hurt' },
      hurt: { speaker: 'npc:ysolde', mood: 'sad', text: '(She draws back, and for a moment she looks very young.) A lullaby, and a priest who reads forbidden books. You’ve found good friends, little spark. Mistress always could find the stubborn ones.', next: 'plea' },
      plea: { speaker: 'npc:hesta-corrow', mood: 'sad', text: 'Come home, girl. There’s a fire at Cinderhold. I kept it lit for you.', next: 'home' },
      home: { speaker: 'npc:ysolde', mood: 'sad', effects: [{ setFlag: 'act1.hesta_alive', value: true }], text: 'I am home, Mistress. You just can’t see it yet.', next: 'parting' },
      // --- Hesta dies
      sacrifice: { speaker: 'narrator', text: 'Hesta steps past you into the pool. The water comes to her knees, her waist. She does not draw her sword. She takes hold of the black tide where it wraps your wrist, with her bare burned hand, and she begins to draw.', next: 'sac-y' },
      'sac-y': { speaker: 'npc:ysolde', mood: 'afraid', text: 'Mistress, no. No, you’ll burn out. Your lungs. Mistress, it will hurt…', next: 'sac-h' },
      'sac-h': {
        speaker: 'npc:hesta-corrow',
        text: 'Everything worth doing hurts. You used to know that. (Her hand glows through the skin now, like a lantern behind cloth.) I taught you to hold a flame, girl. I never taught you to let one go. That was my mistake. This is the lesson I missed.',
        choices: [
          { text: '"Hesta, stop!"', to: 'sac-stop' },
          { text: '[Take her hand]', to: 'sac-hand' },
          { text: '[Say nothing]', to: 'sac-silent' },
        ],
      },
      'sac-stop': { speaker: 'npc:hesta-corrow', text: 'Don’t gape, child. It’s undignified.', next: 'sac-burn' },
      'sac-hand': { speaker: 'narrator', text: 'Her hand is so hot it blisters yours. She lets you hold it anyway. "Don’t gape," she says. "It’s undignified."', next: 'sac-burn' },
      'sac-silent': { speaker: 'narrator', text: 'She glances back at you once, as if to be sure you are paying attention. "Good," she says. "Watch properly. I’m only doing this once."', next: 'sac-burn' },
      'sac-burn': { speaker: 'narrator', text: 'Then she lets go of everything she has. Every ember she ever drew and never spent, seventy years of it, rises through her at once. The black water boils off your wrist. The pool flashes white to the rafters, and Ysolde screams, a real scream, a girl’s, and is flung back into the dark like spray.', next: 'sac-last' },
      'sac-last': {
        speaker: 'npc:hesta-corrow', mood: 'sad',
        text: '(She kneels in the steam. Her hair has gone to ash, and her hands are coals.) There. That’s the Ember loose. Take it before she comes back. And take the sword. Don’t drop it; it’s older than your whole village. And for pity’s sake, stand up straight.',
        choices: [
          { text: '"I can’t do this without you."', to: 'sac-cant' },
          { text: '"Thank you, Hesta."', to: 'sac-thanks' },
        ],
      },
      'sac-cant': { speaker: 'npc:hesta-corrow', mood: 'sad', text: 'Rubbish. You’ve been doing it without me for months; I only came along to criticise. Light the brazier at Cinderhold. Keep it lit. And tell her…', next: 'sac-end' },
      'sac-thanks': { speaker: 'npc:hesta-corrow', mood: 'sad', text: 'Hmph. Don’t go soft on me now, I haven’t the time. Light the brazier at Cinderhold. Keep it lit. And tell her…', next: 'sac-end' },
      'sac-end': {
        speaker: 'narrator',
        effects: [
          { setFlag: 'act1.hesta_alive', value: false }, { giveItem: 'item:lastlight' },
          { companion: 'npc:hesta-corrow', following: false }, { unlockLore: 'lore:hesta-corrow' },
        ],
        text: 'But she never says what you are to tell her. The coals of her hands go grey. When the steam clears there is only ash on the black water, drifting, and a sword lying in it that hisses where the water touches the blade. Lastlight. The Ember rises out of the pool to meet your hand, and goes in.',
        next: 'sac-ysolde',
      },
      'sac-ysolde': { speaker: 'npc:ysolde', mood: 'sad', text: '(From the dark at the edge of the hall, so softly.) She was always braver than me. Always. I only wanted it to stop hurting, Mistress. I only ever wanted it to stop hurting.', next: 'parting' },
      // --- both
      parting: { speaker: 'npc:ysolde', mood: 'hollow', text: 'Listen to me. Two Embers now, in one small hand. They will try to kill you: the Wick, the cold, the fools in my own Choir who don’t understand. Don’t let them. Don’t let yourself. Stay alive, little spark. I need you. I need you to carry them all, every one, and bring them home to me.', next: 'claim' },
      claim: {
        speaker: 'narrator',
        effects: [
          { setFlag: 'act1.ember_fen_claimed', value: true }, { setFlag: 'world.embers_held', value: 2 },
          { setFlag: 'ashmark.rank', value: 3 }, { setFlag: 'world.mire_level', value: 2 },
          { unlockLore: 'lore:the-seven-embers', section: 'fen' }, { unlockLore: 'lore:ysolde-the-pale-saint' },
        ],
        text: 'Then she is water, and the water is only water, and it falls. The bells of Varn do not ring again. In your hand two Embers burn where one did, and the mark has spread past your wrist in fine bright lines, like frost on a window, but warm.',
      },
    },
  },
  {
    id: 'dialogue:ch3-aftermath-aldith', name: 'Aldith: After Varn',
    entries: [
      { when: { not: { questStage: Q12, stage: 'aftermath' } }, node: 'idle' },
      { when: ruler('harrow'), node: 'harrow' },
      { when: ruler('wick'), node: 'wick' },
      { node: 'queen' },
    ],
    nodes: {
      idle: { speaker: 'npc:queen-aldith', text: 'The Haldmarch remembers Varn. So do I.' },
      queen: { speaker: 'npc:queen-aldith', mood: 'happy', text: 'Varn is ours again: half-drowned and stinking, but ours. I have never been so glad of anything in my life, and I am not permitted to show it.', next: 'qletter' },
      qletter: { speaker: 'npc:queen-aldith', effects: [{ setFlag: 'act1.aldith_letter', value: true }], text: '(She presses a folded letter into your hand, sealed with the crossroads.) If the north ever comes south hungry, give them this. It says what a queen may not say in a hall full of lords: that we are all starving together, and that I would rather share bread than graves.', next: 'warden' },
      harrow: { speaker: 'npc:queen-aldith', text: '(Harrow stands at her shoulder.) The Lord Protector tells me Varn is taken. He tells me a great many things. I would rather hear it from you.', next: 'warden' },
      wick: { speaker: 'npc:queen-aldith', text: '(The Order’s soldiers stand at every door.) The Order says Varn was taken in the Lantern’s name. I wanted to hear it from someone who was there.', next: 'warden' },
      warden: {
        speaker: 'npc:queen-aldith', text: 'And the old woman? The Warden?',
        choices: [
          { text: '"She lives."', to: 'alive', when: { flag: 'act1.hesta_alive' } },
          { text: '"She fell at Varn."', to: 'fell', when: { not: { flag: 'act1.hesta_alive' } } },
        ],
      },
      alive: { speaker: 'npc:queen-aldith', text: 'Good. She frightens me. I should like to keep someone about who frightens me.', next: 'letter' },
      fell: { speaker: 'npc:queen-aldith', mood: 'sad', text: '…I am sorry. I met her only once. She told me my crown was crooked. It was.', next: 'letter' },
      letter: { speaker: 'narrator', text: `A herald brings a letter sealed in white wax and pressed with the wick-scissors. It is addressed not to the Queen but to you. ${SUMMONS}`, next: 'go' },
      go: { speaker: 'npc:queen-aldith', text: 'The Lantern Coast road is open, and the Lord-Inquisitor does not ask twice. Go, if you must. But come back. The Haldmarch has very few friends, and it cannot spare one.' },
    },
  },
  {
    id: 'dialogue:ch3-aftermath-hesta', name: 'Hesta: After Varn',
    entries: [{ when: { questStage: Q12, stage: 'aftermath' }, node: 'start' }, { node: 'idle' }],
    nodes: {
      idle: { speaker: 'npc:hesta-corrow', text: 'The brazier’s lit. Solenne’s waiting. Stop loitering in my hall.' },
      start: {
        speaker: 'npc:hesta-corrow',
        text: 'Two Embers, and I’m still here, which nobody expected, least of all my knees. …She cried, at the end. I saw it. Water out of water, and she still cries.',
        choices: [
          { text: '"She could still come home."', to: 'hope' },
          { text: '"She’ll drown us all."', to: 'hard' },
        ],
      },
      hope: { speaker: 'npc:hesta-corrow', mood: 'sad', text: 'Could she? …Keep that thought somewhere safe, child. Somewhere I can’t trample it.', next: 'letter' },
      hard: { speaker: 'npc:hesta-corrow', mood: 'sad', text: 'She might. And she’d weep the whole time she did it.', next: 'letter' },
      letter: { speaker: 'narrator', text: `A rider of the Wick waits at the gate of Cinderhold, as if he were afraid to come in. He hands you a letter sealed in white wax. ${SUMMONS}`, next: 'go' },
      go: { speaker: 'npc:hesta-corrow', text: 'Vellane. Of course. Go to Solenne, then. Look at the dead Brand, smile at the Lord-Inquisitor, and don’t hand him anything that burns. I’ll keep the fire lit.' },
    },
  },
];

export default dialogues;
