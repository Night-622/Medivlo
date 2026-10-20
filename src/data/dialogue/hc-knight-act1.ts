/** Hollow Crown, KNIGHT Act I main dialogues (Anvilgate). Owner: Claude 4. */
import type { DialogueDef } from '@/core';

const GM = 'npc:gideon-marke' as const, KB = 'npc:konrad-berenikson' as const, AV = 'npc:ansel-varley' as const;
const stage = (q: `quest:${string}`, s: string) => ({ questStage: q, stage: s });

const dialogues: DialogueDef[] = [
  // ---------- I-1 The Vigil
  {
    id: 'dialogue:knight-vigil-night', name: 'I-1 the vigil and the Bell', scope: 'party',
    entries: [{ node: 'chapel' }],
    nodes: {
      chapel: { speaker: 'narrator', text: 'The Order’s chapel, past midnight. One candle, one squire, one unpainted shield propped against the altar rail. Your knees stopped hurting around ten o’clock and started again around eleven.', next: 'bell' },
      bell: { speaker: 'narrator', text: 'Then, very far away, a bell rings once. And every anvil in Anvilgate rings back: every gate-bell, every helmet on every peg, the chapel’s own iron candlesticks, all at once, like a city clearing its throat.', next: 'colossus' },
      colossus: { speaker: 'narrator', text: 'Through the chapel window you watch the Iron Colossus walk out of the Fortress Forge. It goes through one wall, and a second, and a third, without slowing down, and is gone towards the Iron Gate.', next: 'song' },
      song: { speaker: 'narrator', text: 'Something under your breastbone has started to sing. It wants you to stand up. Leaving your vigil before dawn is, technically, a hanging offence.', next: null },
    },
  },
  {
    id: 'dialogue:obj-vigil-shield', name: 'I-1 the unpainted shield', scope: 'party',
    entries: [{ when: stage('quest:knight-the-vigil', 'vigil'), node: 'shield' }, { node: 'plain' }],
    nodes: {
      shield: {
        speaker: 'narrator', text: 'You take up the shield. It is plain grey iron, waiting for arms you have not earned yet. The song pulls at you, kindly and without stopping, towards the chapel door.',
        choices: [
          { text: '(Go to the window and watch where the Colossus went.)', to: 'window', effects: [{ setFlag: 'knight.vigil_window', value: true }] },
          { text: '(Raise the shield, the way they taught you, and walk out.)', to: 'door' },
        ],
      },
      window: { speaker: 'narrator', text: 'Three holes in three walls, still smoking. Far off, at the Iron Gate, a shape as tall as a bell tower has stopped. For a moment its great head turns, slowly, back towards the city. Towards this window. Then it looks away.', next: 'door' },
      door: { speaker: 'narrator', text: 'You open the chapel door. On the steps outside, in the cold, an old knight in a grey cloak is standing as if he has been waiting there for some time.', next: null },
      plain: { speaker: 'narrator', text: 'A plain grey shield. It still has no arms on it.', next: null },
    },
  },
  {
    id: 'dialogue:knight-gideon-vigil', name: 'I-1 Gideon on the chapel steps', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: GM, text: '(Ser Gideon Marke looks at you. He looks at the shield. He looks at the three smoking holes in the city. He says nothing at all.)',
        choices: [
          { text: 'Something is singing in my chest, ser.', to: 'sing' },
          { text: 'I know. Leaving vigil. Hanging offence.', to: 'hang' },
        ],
      },
      hang: { speaker: GM, text: '(He nods, once, as though you have said something sensible about the weather.)', next: 'sing' },
      sing: {
        speaker: GM, text: '(He puts a hand on your shoulder, turns you round, and walks you back into the chapel. He does not hurry. At the altar rail he points at the floor where your knees were.)',
        choices: [
          { text: '(Kneel again.)', to: 'kneel', trust: 1 },
          { text: 'Aren’t you going to ask me anything?', to: 'ask' },
        ],
      },
      ask: { speaker: GM, text: 'In the morning.', next: 'kneel' },
      kneel: { speaker: GM, text: '(He sits down on the back pew with his sword across his knees. When the candle gutters, he lights another. He keeps the vigil with you until dawn, and he never says a word.)', next: 'dawn' },
      dawn: { speaker: GM, text: 'Dawn. Up. Your dubbing is postponed. Walk with me. I want to see what that thing did to the walls in daylight. Then breakfast. You will eat the breakfast.', next: null },
    },
  },
  // ---------- I-2 Forty Gates
  {
    id: 'dialogue:obj-anvilgate-toll-gate-1', name: 'I-2 the first toll-gate',
    entries: [{ when: stage('quest:knight-forty-gates', 'tolls'), node: 'toll' }, { node: 'plain' }],
    nodes: {
      toll: { speaker: 'narrator', text: 'A toll-box on a chain, and a painted board: Persons, one penny. Persons with Shields, two pennies. Persons with Shields on Order Business, two pennies and a form. You pay two pennies and hope nobody asks about the form.', next: null },
      plain: { speaker: 'narrator', text: 'The first of forty gates. The box rattles hopefully.', next: null },
    },
  },
  {
    id: 'dialogue:obj-anvilgate-toll-gate-6', name: 'I-2 the inner gate',
    entries: [{ when: stage('quest:knight-forty-gates', 'tolls'), node: 'toll' }, { node: 'plain' }],
    nodes: {
      toll: { speaker: 'narrator', text: 'The Iron Sentry at the inner gate is ringing, very faintly, the wrong note. Black tears are running from its rivets. As your penny drops into the box, its pike comes down, slowly, towards the woman in front of you.', next: null },
      plain: { speaker: 'narrator', text: 'The inner gate, its Sentry silent at last.', next: null },
    },
  },
  {
    id: 'dialogue:knight-varley-letter', name: 'I-2 the Chapter-Master reads Gideon’s letter', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: AV, text: 'A letter from Ser Gideon? He has not written to the Chapterhouse in thirty years. He writes to nobody. Let me see. (He breaks the seal and reads it, and his eyebrows go up, and keep going.)',
        choices: [
          { text: 'Is it about me, Chapter-Master?', to: 'read' },
          { text: 'Am I going to be hanged?', to: 'hanged' },
        ],
      },
      hanged: { speaker: AV, text: 'Hanged? Good heavens. We have not hanged a squire since C. 980, and that was mostly a misunderstanding about a goat. No. Listen.', next: 'read' },
      read: { speaker: AV, text: '“Chapter-Master. This one left vigil. Do not hang them. Send them to the Barrow instead: it comes to the same thing these days. G. M.” That is the whole letter. That is, I believe, a joke. Ser Gideon has made a joke.', next: 'barrow' },
      barrow: {
        speaker: AV, mood: 'afraid', text: 'And it is not a joke. Squires who keep their vigils in the Barrow of Knights have been coming back up the stair with their eyes wrong. Four this month. Something down there is keeping a vigil of its own.',
        choices: [{ text: 'I’ll go down.', to: 'go', quest: true }],
      },
      go: { speaker: AV, text: 'Take your shield. The Barrow stair is under the Tilt Yard. And, squire: whatever is down there was one of ours, once. Be courteous.', next: null },
    },
  },
  // ---------- I-3 The Barrow Vigil
  {
    id: 'dialogue:knight-revenant-salute', name: 'I-3 the Iron Revenant salutes', scope: 'party',
    entries: [{ node: 'tomb' }],
    nodes: {
      tomb: { speaker: 'narrator', text: 'The Queen’s tomb stands at the end of the crypt, empty, with Berenika’s arms on its lid. In front of it a knight in black-streaked plate is kneeling, exactly as squires kneel on their vigil nights. She has been kneeling for thirty years.', next: 'rise' },
      rise: { speaker: 'narrator', text: 'She rises. Her visor is weeping black onto the tomb. She lifts her sword to her helm in a slow, perfect salute, and waits for you to answer it.', next: null },
    },
  },
  {
    id: 'dialogue:obj-berenika-tomb', name: 'I-3 the Queen’s tomb', scope: 'party',
    entries: [{ when: stage('quest:knight-the-barrow-vigil', 'tomb'), node: 'rest' }, { node: 'plain' }],
    nodes: {
      rest: {
        speaker: 'narrator', text: 'Ser Roswitha Dunne lies on the floor of the crypt with her sword crossed on her chest. The black has gone out of her visor. On the inside of her gauntlet, scratched with a knife-point, a tally of days: thirty years of them, in rows.',
        choices: [
          { text: '(Lay her sword on the Queen’s tomb.) Your watch is over, ser.', to: 'over' },
          { text: '(Kneel and keep one hour of vigil for her.)', to: 'hour', school: 'iron' },
        ],
      },
      hour: { speaker: 'narrator', text: 'You kneel. The ringing in the floor fades, stroke by stroke, until the crypt is only a crypt. When you stand up, your knees hurt, which seems right.', next: 'over' },
      over: { speaker: 'narrator', text: 'The tomb is quiet. The four squires who came down here are waiting at the top of the stair, blinking, their eyes their own again.', next: null },
      plain: { speaker: 'narrator', text: 'Berenika’s empty tomb, and Ser Roswitha’s sword laid across it.', next: null },
    },
  },
  {
    id: 'dialogue:knight-gideon-roswitha', name: 'I-3 Gideon hears about Roswitha', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: GM, text: 'Roswitha. (He sits down, slowly, on a stool that is too small for him.) She was the best of us. She swore to keep the tomb until the crown came home. Of course she kept it. She kept everything.',
        choices: [
          { text: 'She saluted before every pass. I answered every one.', to: 'salute', trust: 1 },
          { text: 'You knew she was down there.', to: 'knew' },
        ],
      },
      salute: { speaker: GM, mood: 'sad', text: 'Good. Good. She would have hated to be beaten by somebody rude.', next: 'end' },
      knew: { speaker: GM, mood: 'sad', text: 'I knew she went down. I did not go after her. I have not gone after anything in thirty years.', next: 'end' },
      end: { speaker: GM, text: 'There is a tourney at the Tilt Yard tomorrow. The Prince-Regent is riding. Go and watch. You might as well see what the rest of Ironhold is like before you decide whether to be a knight of it.', next: null },
    },
  },
  // ---------- I-4 The Prince-Regent's Purse
  {
    id: 'dialogue:knight-konrad-purse', name: 'I-4 Konrad at the lists', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: KB, mood: 'happy', text: 'You’re Gideon’s squire. The one who walked out of vigil after a song. Half the Order wants you hanged and the other half wants to buy you a drink. I’m Konrad. I’m in the second half.',
        choices: [
          { text: 'Highness. You gave away the whole purse.', to: 'purse' },
          { text: 'That armour doesn’t fit you.', to: 'armour' },
        ],
      },
      armour: { speaker: KB, text: 'It’s borrowed. I wanted to win as somebody nobody owed a bow to. It’s very restful. Nobody apologised to me once all afternoon.', next: 'purse' },
      purse: {
        speaker: KB, text: 'What would I do with it? Buy another wall? The squires need horses. Look at Wat Mudge. That boy is jousting on a donkey. Ironhold has apologised to the world for thirty years. I’d like to try something else.',
        choices: [
          { text: 'What else?', to: 'else' },
          { text: 'The Bell rang for a reason, didn’t it?', to: 'bell' },
        ],
      },
      bell: { speaker: KB, text: 'It rang, and the Colossus walked out to the gate on its own. If that isn’t the world asking Ironhold a question, I don’t know what is.', next: 'else' },
      else: {
        speaker: KB, text: 'Doing something about it, instead of saying sorry about it. Carry my colours, squire. Just for the Council. I want somebody standing behind me who’s heard the stones.',
        choices: [
          { text: 'I’ll carry them, Highness.', to: 'yes', effects: [{ setFlag: 'knight.konrad_colours', value: true }] },
          { text: 'I carry Ser Gideon’s shield. It has no colours yet.', to: 'no' },
        ],
      },
      yes: { speaker: KB, mood: 'happy', text: 'Splendid. Gold and black. You’ll look terrific. The Council of the Forge sits tomorrow, about the Colossus. Bring your opinions. Bring your loudest ones.', next: null },
      no: { speaker: KB, text: 'Loyal. I like that more than I can say. Come to the Council anyway, tomorrow, about the Colossus. Bring your opinions. Bring your loudest ones.', next: null },
    },
  },
  // ---------- I-5 The Colossus Vote (the faction choice; a party vote)
  {
    id: 'dialogue:knight-colossus-vote', name: 'I-5 the Council of the Forge', scope: 'party',
    entries: [{ when: { not: { flag: 'knight.colossus_vote' } }, node: 'hall' }, { node: 'after' }],
    nodes: {
      hall: { speaker: 'narrator', text: 'The great hall of the Fortress Forge, its far wall a hole the exact shape of the Iron Colossus. The Regency on one side in gold and black, the Order on the other in grey, the Brotherhood at the back with their arms folded. Ser Gideon stands by the door and does not sit.', next: 'konrad' },
      konrad: { speaker: KB, text: 'For thirty years this Forge has built one thing. It is standing at the Iron Gate right now, waiting for a king. I say we give it one. We march it on Concordia, take the crown back from whoever has it, and carry it to Fist ourselves. Thirty years late, with an apology the size of a mountain.', next: 'varley' },
      varley: { speaker: AV, text: 'And I say the Order’s answer stands. A thing made of hollow iron does not march on anything. We wall it in where it stands, and we wait, as we have always waited.', next: 'floor' },
      floor: {
        speaker: 'narrator', text: 'Every eye in the hall goes to the squire on the stool in the Prince-Regent’s colours. By the custom of the Forge, a speaker may first call one voice from the floor.',
        choices: [
          { text: 'Forgemistress Blum. The Brotherhood built it.', to: 'blum' },
          { text: 'Ser Gideon. You haven’t said a word.', to: 'gideon' },
          { text: '(Look up at the hole in the wall, the shape of the Colossus.)', to: 'hole' },
        ],
      },
      blum: { speaker: 'npc:marit-blum', text: '(From the back, arms folded.) We built it. Thirty years of shifts. We were told it was for the hand-over, then for the defence, then for the Regency’s pride. Nobody ever told us it would walk. Whatever you vote, don’t make us build another one.', next: 'choose' },
      gideon: { speaker: GM, text: '(By the door, after a long silence.) The last time Ironhold sent something great through that gate, it was a crown, and I carried it. Be very sure what you are sending. That is all.', next: 'choose' },
      hole: { speaker: 'narrator', text: 'Through the hole the morning light comes in, and through it, far off, you can see the Colossus standing at the gate with its back to the city. As your half-stone hums, its head turns, very slightly. The hall goes quiet. Several people look at you.', next: 'choose' },
      choose: {
        speaker: KB, text: 'Our guest has heard the stones, which is more than any of us. Squire? Do we march, or do we build another wall?',
        choices: [
          { text: 'March. Ironhold has hidden long enough.', to: 'march', quest: true, trustNpc: GM, trust: -1, effects: [{ setFlag: 'knight.colossus_vote', value: 'march' }] },
          { text: 'Wall it in. Nothing made of tears should walk.', to: 'wall', quest: true, effects: [{ setFlag: 'knight.colossus_vote', value: 'wall' }] },
          { text: 'Before anyone votes, hear the Queen’s writ. Nobody has read it aloud in thirty years.', to: 'writ', quest: true, insight: 'knight_writ_read', when: { insight: 'berenika_reason' }, trustNpc: GM, trust: 1, effects: [{ setFlag: 'knight.colossus_vote', value: 'writ' }] },
        ],
      },
      march: { speaker: KB, mood: 'happy', text: 'Carried! Captain {player.name}, you have a regiment. Double shifts in the Forge from tonight. (By the door, Ser Gideon turns and walks out of the hall.)', next: null },
      wall: { speaker: KB, text: 'Another wall. Ironhold’s answer to everything. (He smiles at you, and it is a very nice smile.) Carried. Well. I tried.', next: null },
      writ: { speaker: 'narrator', text: '“He cannot hear the stones, so he cannot want them. Let him hold it one night: he has never held anything.” The hall is entirely silent. Konrad stands, bows to you, and walks out without a word. By the door, Ser Gideon has taken off his gauntlets.', next: 'writ2' },
      writ2: { speaker: AV, mood: 'sad', text: 'It was kindness. Thirty years, and it was kindness. The motion is that the writ be entered on the roll beside her name. Does anyone object? Nobody objects.', next: null },
      after: { speaker: AV, text: 'The Council has voted. Ironhold will now spend a week arguing about what it voted for. It is tradition.', next: null },
    },
  },
  // ---------- I-6 The Blank Shield
  {
    id: 'dialogue:obj-heraldry-roll', name: 'I-6 the roll of arms', scope: 'party',
    entries: [{ when: stage('quest:knight-the-blank-shield', 'roll'), node: 'roll' }, { node: 'plain' }],
    nodes: {
      roll: { speaker: 'narrator', text: 'The empty armour of the Blank Shield picks itself up off the floor, very politely, and holds the lectern steady for you. It now wears one crest: a small plain anvil, the Order’s oldest mark. Behind it lies the roll of arms, every house in Ironhold, unblanked.', next: 'entry' },
      entry: { speaker: 'narrator', text: 'The last entry is new. The ink is barely dry, the hand bold and golden: the Iron Colossus, under the arms of Queen Berenika, and a drawing of its chest. In the chest, a round socket, exactly the size of a half-stone.', next: null },
      plain: { speaker: 'narrator', text: 'An empty lectern. The armour stands beside it, wearing its anvil, as if on guard.', next: null },
    },
  },
  // ---------- I-7 A King for the Colossus
  {
    id: 'dialogue:knight-gideon-roll', name: 'I-7 Gideon reads the roll', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: GM, text: '(He reads the last entry for a long time.) That is Konrad’s hand. He drew a socket in its heart. A socket wants something put in it.',
        choices: [
          { text: 'The Forge half. It’s under his throne.', to: 'throne' },
          { text: 'Why put a half-stone in a Colossus?', to: 'why' },
        ],
      },
      why: { speaker: GM, text: 'Hollow iron does not obey anything. It weeps and it walks. But iron with a stone in it would sing, and anything that sings in Ironhold obeys Iron blood. Or so the Regency has always told itself.', next: 'throne' },
      throne: { speaker: GM, mood: 'afraid', text: 'It has lain under the Forge Throne for thirty years and it will not come out for him. It would come out for you. He has been very kind to you, has he not? Go and ask him what for. He will be at the cradle. He goes there to think.', next: null },
    },
  },
  {
    id: 'dialogue:knight-konrad-cradle', name: 'I-7 Konrad at the Colossus cradle', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: KB, text: 'You found the roll. Good. I wanted you to. I am terrible at secrets: I keep wanting to show people. Look at the cradle. Thirty years it stood here. I used to sit on its foot when I was small.',
        choices: [
          { text: 'You want the Forge half for its heart.', to: 'plan' },
          { text: 'Its head turns towards me when my half-stone sings. It listens to the song, not to you.', to: 'listens', insight: 'colossus_listens', when: { any: [{ flag: 'knight.vigil_window' }, { flag: 'knight.fenna_saw' }] } },
          { text: 'Your purse was paid in Magda Ruhl’s coin, Highness. Hollow iron. The same as its plates.', to: 'coin', when: { flag: 'knight.purse_hollow' } },
        ],
      },
      coin: { speaker: KB, mood: 'sad', text: '(He looks at his gauntlet, where black is seeping from the seams, and then away.) It was cheap, and there was so much of it, and the squires needed horses. Everything in this city is made of something we should be sorry for. I was trying to stop being sorry.', next: 'plan' },
      listens: { speaker: KB, mood: 'angry', text: '(For one moment the smile goes.) It will listen to me when there is a stone in it. That is the whole point of stones. They make things listen.', next: 'plan' },
      plan: {
        speaker: KB, text: 'The stone goes in its heart. The hollow iron obeys Iron blood. I walk it through the gate into Concordia and take the crown off whoever is wearing it, and carry it to Fist myself. Thirty years late, with an apology the size of a mountain. Grandmother’s mistake, put right.',
        choices: [
          { text: 'And if the crown doesn’t want to come off?', to: 'off' },
          { text: 'You can’t hear the stones, Konrad. That’s why it won’t come out for you.', to: 'hear' },
        ],
      },
      off: { speaker: KB, text: 'Then I will have a very large friend to help me ask. Come with me. Bring the stone. You can carry it right up to the Citadel door. They will write songs about the squire who did.', next: 'no' },
      hear: { speaker: KB, mood: 'sad', text: 'No. I can’t. Neither could Casimir, they say. Isn’t that funny? Come with me. Bring the stone. They will write songs about the squire who did.', next: 'no' },
      no: {
        speaker: KB, text: 'No? (He sighs, and he really does look sorry.) Then I’ll have to fetch it myself. You know where. Do come and watch. I’m going to be magnificent.',
        choices: [{ text: '(Let him go.)', to: null, quest: true }],
      },
    },
  },
  // ---------- I-8 The Forge Throne
  {
    id: 'dialogue:obj-iron-capital-halfstone', name: 'I-8 the Forge half', scope: 'party',
    entries: [{ when: stage('quest:knight-the-forge-throne', 'stone'), node: 'claim' }, { node: 'empty' }],
    nodes: {
      claim: { speaker: 'narrator', text: 'Under the Forge Throne, in a hollow worn smooth by thirty years of a prince’s boots, lies half of a crystal, cracked clean across, singing. It is warm. It fits your hand the way a hand fits a hand.', next: 'hammers' },
      hammers: { speaker: 'narrator', text: 'All round you the great hammers of the Forge slow, and miss a beat, and then fall back into time with something new: the song in your hand. For the first time in thirty years the Forge is ringing true.', next: 'vision' },
      vision: { speaker: 'narrator', text: 'For a moment you are not in the Forge. You stand on a hill at night in a ring of twelve stones, each singing its own note, round a crown that nobody is wearing. Then the ring cracks, all at once, like a dropped bell, and the song breaks.', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'You are back by the empty throne with the Forge half in your hand. The throne is just a chair now, a heavy, uncomfortable, iron chair.',
        choices: [
          { text: '(Kneel by the throne for a moment, as you knelt at your vigil.)', to: 'kneel' },
          { text: '(Raise your blank shield. Let the stone’s light fall on it.)', to: 'shield' },
          { text: '“Where is your other half?”', to: 'other' },
        ],
      },
      kneel: { speaker: 'narrator', text: 'You kneel. Not to the throne: beside it. The stone hums against your chest, and you understand that this is what a vigil is for: not the waiting, but the getting up after.', next: 'konrad' },
      shield: { speaker: 'narrator', text: 'The light of the stone falls across your plain grey shield, and for a moment there is something on it, not painted, only shining: an open gate. Then it is gone, and the shield is blank again, and waiting.', next: 'konrad' },
      other: { speaker: 'narrator', text: 'It hums, deep and steady, and you know without knowing how that the other half is underneath you, far down in the rock, waiting for a miner with very big hands to dig it out.', next: 'konrad' },
      konrad: { speaker: KB, mood: 'happy', text: '(Down the forge line, in the Colossus’s empty rail-cradle, Konrad is waving his gauntlet as the cradle slides away towards the Iron Gate.) Bring it to the gate! I’ll wait! I’ve waited thirty years, what’s an afternoon?', next: 'line' },
      line: { speaker: 'narrator', text: 'The cradle rattles away down the rails and round the bend and is gone. Behind it, along the whole forge line, the hollow Sentries in their bays have stopped ringing wrong, and are only standing, waiting for someone to tell them what to do.', next: null },
      empty: { speaker: 'narrator', text: 'A smooth hollow under the Forge Throne, still warm.', next: null },
    },
  },
  // ---------- I-9 The Dubbing on the Wall (mentor farewell; trust check)
  {
    id: 'dialogue:knight-gideon-dubbing', name: 'I-9 the dubbing on the Wall', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: GM, text: 'Kneel. Here. No, the crack is fine, the Wall has been cracking for thirty years, it can manage another minute. You have the stone. You have to follow him through the gate. You cannot go through it as a squire. It would be embarrassing for everyone.',
        choices: [
          { text: '(Kneel on the Wall.)', to: 'dub' },
          { text: 'Shouldn’t this be in the chapel?', to: 'chapel' },
        ],
      },
      chapel: { speaker: GM, text: 'You walked out of the chapel. I thought you would prefer somewhere with a view. Kneel.', next: 'dub' },
      dub: {
        speaker: GM, text: '(The flat of his sword, on one shoulder, then the other.) Rise, Ser {player.name}, of the Order of the Anvil. Hold the line. Mind the gap in it. That is all there is to it, really. That is all there ever was.',
        choices: [
          { text: '(Rise.)', to: 'gifts' },
          { text: 'Thank you, ser. For keeping my vigil.', to: 'gifts', trust: 1 },
        ],
      },
      gifts: {
        speaker: GM, text: 'Now. I have something for you.',
        choices: [
          { text: '(Take what he offers.)', to: 'sword', when: { trust: GM, value: 'friendly' } },
          { text: '(Take his hand.)', to: 'hand', when: { not: { trust: GM, value: 'friendly' } } },
        ],
      },
      sword: {
        speaker: GM, text: 'My sword. It stood guard at the last Turning, in the Citadel, the night it all went wrong. It did nothing useful that night. See if it can do better with you.',
        effects: [{ giveItem: 'w_gideon_sword' }, { setFlag: 'knight.gideon_sword', value: true }],
        choices: [
          { text: '(Hold out your blank shield.)', to: 'paint', when: { trust: GM, value: 'trusted' } },
          { text: 'I’ll bring it back to you, ser.', to: 'end' },
        ],
      },
      paint: {
        speaker: GM, text: '(He takes a pot of paint and a brush out of his cloak. He has been carrying them, you realise, for some time.) A knight should not go through a gate with a blank shield. What arms will you bear?',
        choices: [
          { text: 'A plain anvil, like the Order’s oldest mark.', to: 'truth', effects: [{ setFlag: 'knight.arms', value: 'anvil' }] },
          { text: 'A grey horse, for Duty.', to: 'truth', effects: [{ setFlag: 'knight.arms', value: 'horse' }] },
          { text: 'An open gate.', to: 'truth', effects: [{ setFlag: 'knight.arms', value: 'gate' }] },
          { text: 'A candle, for the vigil.', to: 'truth', effects: [{ setFlag: 'knight.arms', value: 'candle' }] },
        ],
      },
      truth: {
        speaker: GM, mood: 'sad', text: '(He paints. He is very good at it. While the paint dries he speaks to the shield, not to you.) On the night of the Hollowing, the knight who carried the crown into the hall for Casimir was me. She asked me to, and I did, and I bowed. I have not ridden since.',
        choices: [
          { text: 'You carried it because she asked you to.', to: 'asked' },
          { text: '(Say nothing. Keep his vigil, for once.)', to: 'quiet' },
        ],
      },
      asked: { speaker: GM, text: 'Yes. That is the whole of it, and it has never once made it smaller. There. Your arms. Try not to get them scratched in the first five minutes.', next: 'end' },
      quiet: { speaker: GM, text: '(He nods. It is a long time before he speaks again.) There. Your arms. Try not to get them scratched in the first five minutes.', next: 'end' },
      hand: { speaker: GM, text: 'Mind the Colossus. Mind Konrad. Mind the gap in the line. Go on.', next: null },
      end: { speaker: GM, text: 'Go on, Ser Knight. Before I say something the Order would have to write down.', next: null },
    },
  },
  // ---------- I-10 The Iron Gate
  {
    id: 'dialogue:knight-colossus-waits', name: 'I-10 the Colossus at the gate', scope: 'party',
    entries: [{ node: 'gate' }],
    nodes: {
      gate: { speaker: 'narrator', text: 'The Iron Colossus stands before the Iron Gate, as tall as the Chapterhouse tower, weeping hollow iron from every rivet. Konrad is on its shoulder, shouting orders up at its ear. It has not looked at him once.', next: 'konrad' },
      konrad: { speaker: KB, mood: 'angry', text: 'Kneel! Kneel, you great tin bell, I am Berenika’s blood! (He sees you.) Oh, thank goodness. It likes you. Make it kneel and then give me the stone.', next: 'turn' },
      turn: { speaker: 'narrator', text: 'The Colossus turns its head, slowly, towards your song. Then it raises both its fists. Whatever it is waiting for, it has to be sure first.', next: null },
    },
  },
];

export default dialogues;
