/** Hollow Crown, JUGGERNAUT Act I main dialogues (the Deepworks). Owner: Claude 4. */
import type { DialogueDef } from '@/core';

const GH = 'npc:gussie-haldt' as const, MR = 'npc:magda-ruhl' as const;
const stage = (q: `quest:${string}`, s: string) => ({ questStage: q, stage: s });

const dialogues: DialogueDef[] = [
  // ---------- I-1 The Bell in the Rock
  {
    id: 'dialogue:juggernaut-bell-night', name: 'I-1 the Bell in the rock', scope: 'party',
    entries: [{ node: 'shift' }],
    nodes: {
      shift: { speaker: 'narrator', text: 'The last hour of the night shift, at the shaft-head of Rivet Town. Steam, lamp-smoke, somebody singing badly in the cage-lift. Your back aches in the good way.', next: 'bell' },
      bell: { speaker: 'narrator', text: 'Then a bell rings, somewhere very far away, and you hear it through the rock rather than the air. Every shift-whistle in Rivet Town blows at once, by itself. Far above, something enormous takes a step, and the whole of the Deepworks shakes.', next: 'roof' },
      roof: { speaker: 'narrator', text: 'The shaft-head roof groans. A beam splits. Three miners are still crawling out of the cage-lift underneath it.', next: null },
    },
  },
  {
    id: 'dialogue:obj-shaft-head-prop', name: 'I-1 holding up the roof', scope: 'party',
    entries: [{ when: stage('quest:juggernaut-the-bell-in-the-rock', 'roof'), node: 'hold' }, { node: 'plain' }],
    nodes: {
      hold: {
        speaker: 'narrator', text: 'You get your shoulders under the split beam and stand up. The roof stops. It is very heavy. It is exactly as heavy as you are strong, and not a hair more.',
        choices: [
          { text: '(Hold it.) Out. All of you. Now.', to: 'out' },
          { text: '(Hold it, and count them out loud.) One. Two. Three.', to: 'count' },
        ],
      },
      count: { speaker: 'narrator', text: 'One. Two. Three. The last one is old Ewan Haskins’s lad, who stops to say thank you, and is told where to put his thank you by eleven people at once.', next: 'out' },
      out: { speaker: 'narrator', text: 'The last boot clears the cage. You let the roof down gently, the way you would put down a sleeping child, and it comes to rest on the cage-frame with a sigh of dust. Under your ribs, something has started to sing.', next: null },
      plain: { speaker: 'narrator', text: 'The split beam over the shaft-head, propped on the cage-frame where you set it down.', next: null },
    },
  },
  {
    id: 'dialogue:juggernaut-gussie-bell', name: 'I-1 Gussie counts heads', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: GH, text: '(Foreman Gussie Haldt is standing on a crate so the shift can see her. She comes up to roughly your belt buckle, crate included.) FORTY-ONE! Forty-one heads down, forty-one heads up! And you held the roof! Course you did! Who else would?',
        choices: [
          { text: 'All out, Foreman?', to: 'count' },
          { text: 'Something’s singing under my ribs.', to: 'sing' },
        ],
      },
      count: { speaker: GH, text: 'All out. Forty-one. Only I keep counting forty-two. Every time. Forty-one heads, and one sound too many. And Sergeant, my canary, has been singing at the floor for ten minutes.', next: 'sergeant' },
      sing: { speaker: GH, mood: 'afraid', text: 'Singing. Under your ribs. (She looks at the floor of the shaft-head. So does her canary.) Forty-one heads, and one sound too many. I knew it.', next: 'sergeant' },
      sergeant: {
        speaker: GH, text: '(In his cage on her belt, Sergeant the canary is singing, loud and furious, straight down at the rock.) He only does that for gas or trouble. That’s not gas. That’s coming from below. Way below. Below the bottom.',
        choices: [
          { text: 'Then it’s calling me.', to: 'call', trust: 1 },
          { text: 'What do we do, Foreman?', to: 'do' },
        ],
      },
      call: { speaker: GH, text: 'Then it can call in the morning. In this town we don’t go towards a noise in the rock at the end of a shift. We go to bed.', next: 'do' },
      do: { speaker: GH, text: 'First things first. I’m counting the tallies. Ears can lie at the end of a shift. Brass can’t. (She tucks her crate under her arm.) Tally-board. Come on. Bring your big ears.', next: null },
    },
  },
  // ---------- I-2 Stopped Golems
  {
    id: 'dialogue:obj-rivet-golem-1', name: 'I-2 the first stopped golem',
    entries: [{ when: stage('quest:juggernaut-stopped-golems', 'golems'), node: 'kick' }, { node: 'plain' }],
    nodes: {
      kick: { speaker: 'narrator', text: 'A Rivet Golem, frozen mid-step with an ore-cart’s handle in its fist. You kick its boiler in the approved place. It coughs, and starts, and its eyes come up the colour of a fire that has been told bad news.', next: null },
      plain: { speaker: 'narrator', text: 'A Rivet Golem, quiet now, with a dent the shape of your boot in its boiler.', next: null },
    },
  },
  {
    id: 'dialogue:obj-rivet-golem-4', name: 'I-2 the last stopped golem',
    entries: [{ when: stage('quest:juggernaut-stopped-golems', 'golems'), node: 'kick' }, { node: 'plain' }],
    nodes: {
      kick: { speaker: 'narrator', text: 'The fourth golem starts with a shudder. Through the grille of its firebox you can see black tears bubbling in the boiler. It lets go of its cart, turns round, and lifts both fists at the miners behind you.', next: null },
      plain: { speaker: 'narrator', text: 'A Rivet Golem, gone cold. Its boiler is dry at last.', next: null },
    },
  },
  {
    id: 'dialogue:juggernaut-gussie-golems', name: 'I-2 Gussie hears about the golems', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: GH, text: 'Tears. In the BOILERS. (She stamps on her crate.) I have run golems on this line for twenty-two years and the worst I ever found in a boiler was Lotte’s lunch.',
        choices: [
          { text: 'The quota won’t make itself.', to: 'quota' },
          { text: 'Something else is wrong. I can feel it in the rock.', to: 'rock' },
        ],
      },
      quota: { speaker: GH, text: 'No, and I told the Regency’s man so, at a volume. He wrote it down. They always write it down. Then they never read it.', next: 'foundry' },
      rock: { speaker: GH, text: 'You and Sergeant both. He hasn’t stopped singing since the Bell.', next: 'foundry' },
      foundry: { speaker: GH, mood: 'angry', text: 'And now the old foundry on the Slag Rivers is smoking. Nobody’s worked that foundry in twenty years. Half the shift’s lost their picks and the other half’s lost their dinner-pails, and the cage-lift door went missing this morning. Go and see. Take a pail. Take a big pail.', next: null },
    },
  },
  // ---------- I-3 The Warden Foundry
  {
    id: 'dialogue:obj-foundry-pail-heap', name: 'I-3 the heap of stolen tools', scope: 'party',
    entries: [{ when: stage('quest:juggernaut-the-warden-foundry', 'pails'), node: 'heap' }, { node: 'plain' }],
    nodes: {
      heap: {
        speaker: 'narrator', text: 'A heap as tall as you: picks, lamps, kettles, a child’s tin horse, a cage-lift door and two hundred dinner-pails. Every pail has a name scratched on the lid. The Warden was going to melt them down for sentries, for a Colossus that has already walked away.',
        choices: [
          { text: '(Load it all into a cart for Rivet Town.)', to: 'cart' },
          { text: '(Lift the cage-lift door onto your back and carry it home first.)', to: 'door', school: 'iron' },
        ],
      },
      door: { speaker: 'narrator', text: 'The cage-lift door is the heaviest thing in the foundry. You carry it out on your back, then go back in for the pails. It seems only right that the door goes home first.', next: 'cart' },
      cart: { speaker: 'narrator', text: 'Two hundred dinner-pails, rattling in an ore-cart behind you all the way back to Rivet Town. Somebody is going to be very pleased about the tin horse.', next: null },
      plain: { speaker: 'narrator', text: 'A cold foundry floor, swept clean.', next: null },
    },
  },
  {
    id: 'dialogue:juggernaut-gussie-pails', name: 'I-3 the pails come home', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: GH, mood: 'happy', text: 'MY PAIL! Look, look, that’s my dad’s pail, look at the dent, he did that on a Rivet Golem’s head in C. 1019. (She hugs it.) You’re a good lump. You’re the best lump on this shift. Don’t tell the others.',
        choices: [
          { text: 'The tin horse is somebody’s.', to: 'horse' },
          { text: 'Anything for the shift, Foreman.', to: 'shift', trust: 1 },
        ],
      },
      horse: { speaker: GH, text: 'That’s Clem Bodkin’s. She’ll cry. She cries at everything, that child. Mostly at me.', next: 'end' },
      shift: { speaker: GH, text: 'Anything for the shift. That’s the right answer. That’s the only answer, down here.', next: 'end' },
      end: { speaker: GH, text: 'Now. There’s noise up at the company store. Cheering. Nobody has ever cheered at the company store. Go and see who died.', next: null },
    },
  },
  // ---------- I-4 The Smelter's Wages
  {
    id: 'dialogue:juggernaut-magda-store', name: 'I-4 Magda buys the company store', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: MR, mood: 'happy', text: '(A broad woman in a smelter’s leather apron is feeding the company store’s debt-ledgers into a brazier on the step, one page at a time, while the whole street cheers.) There’s the one who held up the roof! Come here. Shake my hand. Mind, it’s hot.',
        choices: [
          { text: 'You’re burning the ledgers.', to: 'ledgers' },
          { text: 'Who are you?', to: 'who' },
        ],
      },
      who: { speaker: MR, text: 'Magda Ruhl. I run the Hollow Lode, down the deep end. Grew up four streets that way. My mam owed this store a winter coat for nine years. Now I own it. Isn’t life funny?', next: 'ledgers' },
      ledgers: {
        speaker: MR, text: 'Every debt in Rivet Town, gone. Like that. (A page curls up and blackens.) And I’m paying double, in good new coin, to anybody who’ll dig my seam. The Regency pays you in promises. I pay you in iron.',
        choices: [
          { text: 'Double? For what kind of iron?', to: 'iron' },
          { text: '(Look at the coins in her strongbox.) They’re very shiny.', to: 'shiny' },
        ],
      },
      shiny: { speaker: MR, text: 'Fresh from my own press. They’re supposed to be shiny. That’s the whole point of a coin.', next: 'iron' },
      iron: {
        speaker: MR, text: 'The best iron in the Deepworks. Sings when you strike it. The Forge can’t get enough of it. Think about it, big one. The Brotherhood will want to vote. The Brotherhood always wants to vote.',
        choices: [{ text: 'I’ll think about it.', to: null, quest: true }],
      },
    },
  },
  // ---------- I-5 The Whistle Vote (the faction choice; a party vote)
  {
    id: 'dialogue:juggernaut-whistle-vote', name: 'I-5 the Brotherhood votes', scope: 'party',
    entries: [{ when: { not: { flag: 'juggernaut.whistle' } }, node: 'yard' }, { node: 'after' }],
    nodes: {
      yard: { speaker: 'narrator', text: 'Four hundred miners at the shaft-head, lamps lit, the Brotherhood’s old benches dragged out of the shed. Gussie is on her crate. Magda leans on the company store’s doorframe, arms folded, smiling, with her strongbox at her feet.', next: 'gussie' },
      gussie: { speaker: GH, text: 'Right. Here it is. Magda Ruhl pays double to dig the Hollow Lode. I don’t like that seam and I never have, and I don’t like Sergeant’s face when he’s near it. But I don’t eat Sergeant’s face, and nor do your kids.', next: 'floor' },
      floor: {
        speaker: 'narrator', text: 'Four hundred lamps turn towards you. By Brotherhood custom, whoever blows first may call one voice up on to the crate before they blow.',
        choices: [
          { text: 'Old Selwyn. You’ve been down longest.', to: 'selwyn' },
          { text: 'Magda. Say it to their faces.', to: 'magda' },
          { text: 'Penny Grist. You kept the store’s books.', to: 'penny' },
        ],
      },
      selwyn: { speaker: 'npc:selwyn-duckett', text: '(He climbs up on to the crate beside Gussie, very slowly, and the yard waits.) Fifty years I’ve dug. I’ve never once been paid what the iron was worth. And I’ve never once been paid in iron that cried. That’s all. Help me down.', next: 'choose' },
      magda: { speaker: MR, mood: 'happy', text: '(She does not climb on the crate. She stays in the doorway.) Double wages. Debts gone. Your kids in boots. That’s my case. I don’t need a crate to make it. (Half the yard cheers. The other half looks at its feet.)', next: 'choose' },
      penny: { speaker: 'npc:penny-grist', mood: 'afraid', text: '(Very small on the big crate.) I kept the books thirty years. Every debt in Rivet Town. And I’ll tell you what I never once wrote in them: a coin that came back wet. Not until this week. (She gets down, fast.)', next: 'choose' },
      choose: {
        speaker: GH, text: 'Long blast to down tools, two short to dig. You held the roof, so you blow first. Go on.',
        choices: [
          { text: '(One long blast.) Strike. Not one pick goes into that seam.', to: 'strike', quest: true, effects: [{ setFlag: 'juggernaut.whistle', value: 'strike' }] },
          { text: '(Two short blasts.) Dig. Rivet Town has been hungry long enough.', to: 'dig', quest: true, trustNpc: GH, trust: -1, effects: [{ setFlag: 'juggernaut.whistle', value: 'dig' }] },
          { text: 'Neither. Slag seals the tears. We pour the waste into the Lode’s upper galleries and shut it.', to: 'slag', quest: true, insight: 'juggernaut_sealed_lode', when: { insight: 'slag_seals' }, effects: [{ setFlag: 'juggernaut.whistle', value: 'slag' }] },
        ],
      },
      strike: { speaker: GH, mood: 'happy', text: 'STRIKE! Tools down! (Four hundred picks hit the yard at once. Magda picks up her strongbox and goes back inside, still smiling.) Right. Now we’re poor. We’re very good at poor.', next: null },
      dig: { speaker: GH, mood: 'sad', text: '(The yard roars. Coin starts passing hand to hand.) Two short. The shift has spoken. (She gets down off the crate without looking at you.) Spend it on something warm.', next: null },
      slag: { speaker: 'narrator', text: 'Silence. Then old Selwyn Duckett starts to laugh, and then the whole shaft-head is laughing, and four hundred miners go to fetch thirty years of slag. Across the street, Magda Ruhl has stopped smiling.', next: 'slag2' },
      slag2: { speaker: GH, mood: 'happy', text: 'Thirty years we’ve been throwing that muck away. Turns out we were saving it. Pour it in, lads! Seal her up!', next: null },
      after: { speaker: GH, text: 'The whistle’s blown. In this town, once the whistle’s blown, you get on with it.', next: null },
    },
  },
  // ---------- I-6 The Scrap Hive
  {
    id: 'dialogue:obj-strike-banner', name: 'I-6 the lost strike banner', scope: 'party',
    entries: [{ when: stage('quest:juggernaut-the-scrap-hive', 'banner'), node: 'banner' }, { node: 'plain' }],
    nodes: {
      banner: { speaker: 'narrator', text: 'The Brotherhood’s strike banner, lost since C. 1031: a pick and a whistle crossed on red, the motto half eaten by beetles. NOBODY WORKS ALONE. It is wrapped tight round an iron strongbox stamped with the mark of the Hollow Lode. Somebody hid it here, in the one place nobody would dig.', next: null },
      plain: { speaker: 'narrator', text: 'The hollow in the scrap where the banner was.', next: null },
    },
  },
  // ---------- I-7 Pay That Empties You
  {
    id: 'dialogue:obj-magda-strongbox', name: 'I-7 Magda’s strongbox', scope: 'party',
    entries: [{ when: stage('quest:juggernaut-pay-that-empties-you', 'strongbox'), node: 'open' }, { node: 'plain' }],
    nodes: {
      open: {
        speaker: 'narrator', text: 'You break the lock with your thumb. Inside: Magda’s bright new coin, hundreds of them, every one stamped with a smiling sun. They are wet. You wipe one dry on your sleeve, and it is wet again.',
        choices: [
          { text: '(Weigh a coin in your palm.)', to: 'weigh', school: 'iron', effects: [{ setFlag: 'juggernaut.coin_weighed', value: true }] },
          { text: '(Shut the box.)', to: 'shut' },
        ],
      },
      weigh: { speaker: 'narrator', text: 'It is too heavy for its size, the way a sorry is heavier than the word. Iron that has carried something. You have carried enough ore in your life to know when iron is lying to you.', next: 'shut' },
      shut: { speaker: 'narrator', text: 'Somebody wrapped the strike banner round this box and buried it under the hive. Somebody who had carried Magda’s wages, and been frightened of them.', next: null },
      plain: { speaker: 'narrator', text: 'An empty strongbox with a broken lock. The inside is still wet.', next: null },
    },
  },
  {
    id: 'dialogue:juggernaut-gussie-coin', name: 'I-7 Gussie and the coin', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: GH, text: '(She will not touch it. Sergeant goes and sits at the very far end of his cage, with his back to it.) Put that down. On the table. No. On the floor. No. Outside.', next: 'quiet' },
      quiet: {
        speaker: GH, mood: 'afraid', text: 'Old Ewan Haskins carried a month of her wages and went quiet. Then he went very polite. Then he went down the Lode for the night shift and nobody’s seen him since. Twelve of them, now. All Magda’s diggers. All paid in that.',
        choices: [
          { text: 'I’m going to find her.', to: 'find' },
          { text: 'The Colossus. It was built of her iron, wasn’t it?', to: 'colossus' },
        ],
      },
      colossus: { speaker: GH, text: 'Every plate. The Forge bought Lode iron for years, half price, never asked why it was wet. Now it’s walked off to the Iron Gate on its own. Who paid for it to walk?', next: 'find' },
      find: { speaker: GH, text: 'She’s at the Lode mouth, paying the next shift. Go and ask her. Don’t take her coin. Don’t take her hand. Don’t take a cup of tea off her.', next: null },
    },
  },
  {
    id: 'dialogue:juggernaut-magda-lode', name: 'I-7 Magda at the Lode mouth', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: MR, text: 'You found my strongbox. Good. I was wondering who’d hidden it. (She is paying a line of miners, one coin each, and every one of them is very quiet.) Ask, then. You’ve got the face.',
        choices: [
          { text: 'Your coin empties people.', to: 'empties' },
          { text: 'Sergeant won’t go near it. That coin is hollow iron.', to: 'hollow', insight: 'scrip_hollows', when: { any: [{ flag: 'juggernaut.coin_weighed' }, { insight: 'slag_seals' }] } },
        ],
      },
      hollow: { speaker: MR, text: 'Clever lump. Gussie’s bird always was too clever for its own good. Yes. Hollow iron, struck into coin. It carries the tears straight into your hand. A month of wages and you stop minding anything.', next: 'empties' },
      empties: {
        speaker: MR, text: 'It empties people of their troubles. Tell me that isn’t a mercy, in this town. And the Colossus is my iron, every plate, walking itself to the Hollow King on its own legs. The biggest delivery in history, and the customer paid for the carriage.',
        choices: [
          { text: 'Why would you sell to him?', to: 'why' },
          { text: 'You’re selling Rivet Town to him.', to: 'sell' },
        ],
      },
      sell: { speaker: MR, mood: 'angry', text: 'I’m selling Rivet Town a future. You know what the Regency pays for a ton of ore? I do. I was eleven when I found out.', next: 'why' },
      why: {
        speaker: MR, text: 'The tears whisper, down the Lode. He’s promised: in his new world, the diggers own the mountain. The Lode half is my last shipment. Nobody ever paid us what the iron was worth. He will.',
        choices: [{ text: 'Not with that stone.', to: 'end', quest: true }],
      },
      end: { speaker: MR, mood: 'happy', text: 'We’ll see. It’s down the deep end, singing for you. Come and get it, if you like. I’ll be waiting. I’ve got a crane.', next: null },
    },
  },
  // ---------- I-8 The Hollow Lode
  {
    id: 'dialogue:obj-iron-frontier-halfstone', name: 'I-8 the Lode half', scope: 'party',
    entries: [{ when: stage('quest:juggernaut-the-hollow-lode', 'stone'), node: 'claim' }, { node: 'empty' }],
    nodes: {
      claim: { speaker: 'narrator', text: 'Half of a crystal, cracked clean across, set in the rock at the very bottom of the seam like a seed in fruit. No pick will touch it. You put both hands to the rock and pull, and the rock lets go, as if it had been waiting for someone to ask properly.', next: 'seam' },
      seam: { speaker: 'narrator', text: 'All round you the Hollow Lode stops weeping. The black in the rock goes still, then dull, then grey, like a fire that has been told it can go out. Far up the seam, the quiet miners are sitting down where they stand, blinking.', next: 'vision' },
      vision: { speaker: 'narrator', text: 'For a moment you are not under the mountain. You stand on a hill at night in a ring of twelve stones, each singing its own note, round a crown nobody is wearing. Then the ring cracks, all at once, like a pit-prop going, and the song breaks.', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'You are back at the bottom of the seam with the Lode half in your hands. It is the first thing you have ever dug that sings.',
        choices: [
          { text: '(Hold it up for the quiet miners to see.)', to: 'show' },
          { text: '(Put it inside your shirt, against your heart, and keep it warm.)', to: 'warm' },
          { text: '“Where is your other half?”', to: 'other' },
        ],
      },
      show: { speaker: 'narrator', text: 'You hold it up. Its light runs up the seam, and one by one the quiet miners lift their heads. Old Ewan Haskins says, in his own voice for the first time in a month, “Is that the end of shift?” Somebody laughs. It is you.', next: 'magda' },
      warm: { speaker: 'narrator', text: 'It sits against your chest like a hot pie wrapped in a cloth, and hums, and your whole body hums with it. You understand, suddenly, what Gussie means when she says a shift is a family.', next: 'magda' },
      other: { speaker: 'narrator', text: 'It hums, deep and steady, and you know without knowing how that the other half is above you, under a throne in a city of walls, waiting for a knight with a blank shield to lift it out.', next: 'magda' },
      magda: { speaker: MR, mood: 'happy', text: '(From the main line, high above, the rattle of the last ore-cart going up.) Keep it warm, big one! Bring it to the gate! Everything goes through the gate in the end. That’s just freight!', next: 'gone' },
      gone: { speaker: 'narrator', text: 'The rattle goes up and up and away. Down here it is quiet, the honest quiet of a seam at the end of a shift, with nothing left in it but rock.', next: null },
      empty: { speaker: 'narrator', text: 'A hand-shaped hollow in the rock at the bottom of the seam, still warm.', next: null },
    },
  },
  // ---------- I-9 End of Shift (mentor farewell; trust check)
  {
    id: 'dialogue:juggernaut-gussie-farewell', name: 'I-9 Gussie’s farewell', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: GH, text: '(Rivet Town is lining the rails, every lamp lit. Gussie is on her crate, which somebody has painted for the occasion.) So. You’ve got it. And she’s gone up the line with her coin, and you’ve got to go after her. Course you have. Who else would?',
        choices: [
          { text: 'Come with me, Foreman.', to: 'come' },
          { text: 'You ran my shift since I was six.', to: 'six', trust: 1 },
        ],
      },
      come: { speaker: GH, text: 'Me? Who’d count the heads? No. Somebody’s got to stay and blow the whistle. That’s the job. The job is the whistle.', next: 'gift' },
      six: { speaker: GH, mood: 'sad', text: 'Since you were six and already taller than me. You fell asleep in a coal-tub on your first day. I carried you home. Well. I pushed the tub.', next: 'gift' },
      gift: {
        speaker: GH, text: 'Come here. Bend down. Further. FURTHER.',
        choices: [
          { text: '(Bend down.)', to: 'whistle', when: { trust: GH, value: 'friendly' } },
          { text: '(Shake her hand.)', to: 'hand', when: { not: { trust: GH, value: 'friendly' } } },
        ],
      },
      whistle: {
        speaker: GH, text: '(She hangs her own shift-whistle round your neck, on its copper ring.) Blow it and somebody comes. That’s what it’s for. That’s all it’s ever been for. Don’t blow it for nothing, mind. Blow it for anything.',
        effects: [{ giveItem: 'i_gussie_whistle' }, { setFlag: 'juggernaut.gussie_whistle', value: true }],
        next: 'sergeant',
      },
      sergeant: {
        speaker: GH, mood: 'sad', text: '(Sergeant is singing at you from his cage. He has never once sung at you before.) He wants to go. Don’t look at me like that. He told me. He sings when there’s tears about, and you’re going where the tears come from.',
        choices: [
          { text: 'I’ll keep him safe.', to: 'end', when: { trust: GH, value: 'trusted' }, effects: [{ setFlag: 'juggernaut.sergeant_pet', value: true }] },
          { text: 'He’s yours, Gussie. Keep him.', to: 'end' },
        ],
      },
      hand: { speaker: GH, text: 'Mind the Colossus. Mind your head. Mind Magda. Off you go.', next: null },
      end: { speaker: GH, text: 'Right. Off you go, before I do something soft in front of the whole shift. END OF SHIFT!', next: null },
    },
  },
  // ---------- I-10 The Iron Gate (Deepworks side)
  {
    id: 'dialogue:juggernaut-colossus-stamps', name: 'I-10 the shift-marks on the Colossus', scope: 'party',
    entries: [{ when: { flag: 'juggernaut.agathe_helped' }, node: 'agathe' }, { node: 'stamps' }],
    nodes: {
      agathe: { speaker: 'narrator', text: 'From the gate road behind you comes a grinding of gears, and Agathe Strell’s crane comes rolling up on the main line rails, Agathe in the cab with her flask, its jib already swinging round towards the Colossus’s knees.', next: 'stamps' },
      stamps: { speaker: 'narrator', text: 'The Iron Colossus stands at the Iron Gate, sweating hollow iron at every joint. Up close you can read its plates. Every one is stamped with a Brotherhood shift-mark: Haldt’s shift, Duckett’s shift, Teasdale’s shift. Your own shift-mark, on the plate above its ankle.', next: 'built' },
      built: { speaker: 'narrator', text: 'Rivet Town dug every ounce of it. Rivet Town built it. And now it is turning round, slowly, to look at the one who held up the roof.', next: null },
    },
  },
];

export default dialogues;
