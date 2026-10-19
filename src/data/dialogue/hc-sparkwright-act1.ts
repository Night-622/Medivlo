/** Hollow Crown, SPARKWRIGHT Act I main dialogues (Spirehold). Owner: Claude 4. */
import type { DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const TA = 'npc:tess-ampery' as const, VS = 'npc:volta-sterne' as const;

const dialogues: DialogueDef[] = [
  // ---------- I-1 Every Workshop at Once
  {
    id: 'dialogue:sparkwright-bell-night', name: 'I-1 the Bell over Coil Street', scope: 'party',
    entries: [{ node: 'night' }],
    nodes: {
      night: { speaker: 'narrator', text: 'Night on Coil Street, where the workshops explode on the hour, politely, one at a time. Eleven o’clock: the Ohms’ chimney. Eleven fifteen: the varnish shop, as usual. Eleven thirty: you are nearly asleep at your bench.', next: 'bell' },
      bell: { speaker: 'narrator', text: 'Then, somewhere very far away, a bell rings once, and every workshop on Coil Street goes off at the same moment. It is the loudest thing that has ever happened in Spirehold, which is saying a great deal.', next: 'wake' },
      wake: { speaker: 'narrator', text: 'You wake in the rubble of your workshop with your ears ringing, a song in your chest that crackles like a kettle about to boil, and no eyebrows at all.', next: null },
    },
  },
  {
    id: 'dialogue:sparkwright-tess-bell', name: 'I-1 Tess in the rubble', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: TA, mood: 'happy', text: 'There you are! Out of the rubble, mind the glass, that’s it. Oh, look at you. No eyebrows! Welcome to the family. I’ve been waiting years to say that to someone and mean it properly.',
        choices: [
          { text: 'Something in my chest is singing.', to: 'stone' },
          { text: 'What just happened?', to: 'what' },
        ],
      },
      what: { speaker: TA, text: 'Every workshop on Coil Street, all at once! Not one of them on the hour! Somebody rang a bell, very far away, and the whole street answered. It was magnificent. Nobody’s dead, I’ve checked. Mrs Ohm has lost a hat.', next: 'stone' },
      stone: {
        speaker: TA, text: 'Singing. Crackling. Like a kettle just before the whistle. (She puts her ear to your chest without asking.) Oh, my. That’s the Storm Stone. Half of it, anyway. The Tower half, calling from the top of the Lightning Tower.',
        choices: [
          { text: 'How do you know what it sounds like?', to: 'know' },
          { text: 'What do I do?', to: 'do' },
        ],
      },
      know: { speaker: TA, mood: 'sad', text: 'I was up there the night it left. I heard it go past my ears at about the speed of a falling kettle. Long story. Short eyebrows. Another time.', next: 'do' },
      do: {
        speaker: TA, text: 'Tonight? A head count, then tea. The Ohms, the varnish shop and the bellows-mender went up hardest. Go and see everyone in them still has most of their eyebrows, and then come back, and we’ll talk about your chest.',
        choices: [
          { text: 'I’ll go.', to: 'end', trust: 1 },
          { text: 'Something is wrong.', to: 'wrong' },
        ],
      },
      wrong: { speaker: TA, text: 'Yes. Something is wrong. And we will fix it, family, the way we fix everything round here: carefully, then suddenly, then with a bucket.', next: 'end' },
      end: { speaker: TA, text: 'Kettle Twenty! Put the water on! (A small copper kettle walks across the workshop on three legs, whistling.) Don’t mind him. He’s new.', next: null },
    },
  },
  // ---------- I-2 Rod Duty
  {
    id: 'dialogue:obj-coil-rod-1', name: 'I-2 the first rod',
    entries: [{ when: stage('quest:sparkwright-rod-duty', 'rods'), node: 'rod' }, { node: 'up' }],
    nodes: {
      rod: { speaker: 'narrator', text: 'A copper lightning rod on the roof of the Ohms’ workshop, bent over like a question mark. You straighten it. A fizz runs down it into the street, and somewhere below, a kettle cheers up.', next: null },
      up: { speaker: 'narrator', text: 'A lightning rod on a Coil Street roof, straight and humming.', next: null },
    },
  },
  {
    id: 'dialogue:sparkwright-tess-rods', name: 'I-2 report on the rods', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: TA, text: 'All five! The Ohms exploded twice before lunch, it’s like old times. But you’ve got a face. That’s your something-came-down-the-rod face.',
        choices: [
          { text: 'The storm came down the rods black. The wisps riding it were hollow.', to: 'black' },
          { text: 'From the last rod I could see the storm over the Copper Gate.', to: 'gate' },
          { text: 'The Guild storm-glass says that storm isn’t stuck. Something is holding it against the wind.', to: 'held', when: { flag: 'sparkwright.storm_pinned' } },
        ],
      },
      held: { speaker: TA, mood: 'angry', text: 'Against the wind? (She stands up off the anvil.) Storms don’t sit against the wind, family. Kites do. And a kite needs somebody on the other end of the string.', next: 'gate' },
      black: { speaker: TA, mood: 'afraid', text: 'Black lightning. Hollow wisps. In Spirehold. (She sits down on an anvil.) Every child on this street keeps a wisp in a jar by the bed. If the wisps go hollow, I don’t know what we do.', next: 'gate' },
      gate: {
        speaker: TA, text: 'And the storm over the Copper Gate. A year it’s sat there. Storms move. That one hasn’t. Somebody is holding it still, and I would very much like to know how, so that I can be furious at them in detail.',
        choices: [{ text: 'Where do I start?', to: 'belfry' }],
      },
      belfry: { speaker: TA, text: 'The belfry. Every night a bell rings in an old bell-tower in the Copper Spires, and the lightning comes down on whatever’s tallest. That’s the Tempest Coven. Go and ask them to stop. Politely. Then less politely.', next: null },
    },
  },
  // ---------- I-3 The Witch's Belfry
  {
    id: 'dialogue:obj-belfry-bell', name: 'I-3 the belfry bell', scope: 'party',
    entries: [{ when: stage('quest:sparkwright-the-witchs-belfry', 'bell'), node: 'bell' }, { node: 'quiet' }],
    nodes: {
      bell: { speaker: 'narrator', text: 'The belfry bell is still swinging very slightly on its own, and it is black, as if it had been dipped in ink. Every swing calls a little thread of lightning down out of the storm towards it.', next: 'stop' },
      stop: {
        speaker: 'narrator', text: 'You could stop it.',
        choices: [
          { text: '(Wrap the clapper in your coat and tie it off.)', to: 'coat' },
          { text: '(Earth the bell to the floor with a length of copper.)', to: 'earth', school: 'storm' },
        ],
      },
      coat: { speaker: 'narrator', text: 'The bell gives one muffled clunk, and is still. Outside, for the first time in months, the Copper Spires have a night without lightning on them.', next: null },
      earth: { speaker: 'narrator', text: 'You run a copper line from the lip of the bell to the floor. The next thread of lightning runs straight down it and into the stone, harmless as a cat into a basket. The bell stops.', next: null },
      quiet: { speaker: 'narrator', text: 'A silent bell in an empty belfry.', next: null },
    },
  },
  {
    id: 'dialogue:sparkwright-tess-belfry', name: 'I-3 the Spires are quiet', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: TA, mood: 'happy', text: 'Quiet! The Spires, quiet! I sat on my roof last night and nothing hit me. It was the most boring night of my life. Thank you, family.',
        choices: [
          { text: 'The witch’s bell rang black. Like the rods.', to: 'black' },
          { text: 'Boring suits you.', to: 'card', trust: 1 },
        ],
      },
      black: { speaker: TA, text: 'Then the black is in the storm itself, and the storm is coming from the Copper Gate. I don’t like any of that. Here, this came for you. On card. Stiff card.', next: 'card' },
      card: {
        speaker: TA, text: 'An invitation, from the Chancellery. The Chancellor would like to give you a private tour of the Dynamo Halls. (Tess holds it up to the light.) No scorch-marks. Not one. That woman.',
        choices: [{ text: 'You don’t like her?', to: 'like' }, { text: 'I’ll go.', to: null }],
      },
      like: { speaker: TA, text: 'Volta? I love her. Everybody loves her. She makes the wheels go round and the trains run on time, and she has never once let a machine be silly. Go on. Mind your cuffs.', next: null },
    },
  },
  // ---------- I-4 The Chancellor's Tour
  {
    id: 'dialogue:sparkwright-volta-tour', name: 'I-4 meeting the Chancellor', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: VS, text: 'The Sparkwright from the belfry. Come in. Don’t touch the desk; it is the only thing in Spirehold that has never been on fire, and I would like to keep the record. You’ve lost your eyebrows. So has everybody else. I find it very restful, not to.',
        choices: [
          { text: 'Thank you for the invitation, Chancellor.', to: 'wheels' },
          { text: 'How have you never been burned?', to: 'burned' },
        ],
      },
      burned: { speaker: VS, mood: 'happy', text: 'Planning. And gloves. Mostly planning. A machine that surprises you is a machine you didn’t finish. Come along.', next: 'wheels' },
      wheels: {
        speaker: VS, text: 'These are the Dynamo Halls. Every light in Spirehold comes from these wheels, and I know every one of them by its squeak. That one needs oil. That one is sulking. That one is Number Three, and it is my favourite, and I will hear nothing against it.',
        choices: [
          { text: 'What do you want from me?', to: 'want' },
          { text: 'You love this place.', to: 'love' },
        ],
      },
      love: { speaker: VS, mood: 'sad', text: 'Fourteen towers have fallen down in my lifetime. Fourteen. People were standing under some of them. I would like the city I love to stop falling on the people in it. Is that so very strange?', next: 'want' },
      want: {
        speaker: VS, text: 'Tower Fifteen. The tower that will not fall. It needs a heart, and it needs a coil, and the Guild votes on the coil tomorrow. I would like you in the room. You have the Tower half singing in you; I can hear it from here.',
        choices: [{ text: 'I’ll come.', to: 'end', quest: true }, { text: 'You can hear it?', to: 'hear', quest: true }],
      },
      hear: { speaker: VS, text: 'A little. A crackle at the edge of things. I have been listening for it for thirty years. Walk the Halls with me. I want to show you Number Three.', next: 'end' },
      end: { speaker: VS, text: 'Mind the cuffs.', next: null },
    },
  },
  // ---------- I-5 Tower Fifteen (faction choice; a party vote)
  {
    id: 'dialogue:sparkwright-tower-fifteen-vote', name: 'I-5 the Guild votes on the coil', scope: 'party',
    entries: [{ when: { not: { flag: 'sparkwright.wisps' } }, node: 'tower' }, { node: 'after' }],
    nodes: {
      tower: { speaker: 'narrator', text: 'The foot of Tower Fifteen, half-built, enormous, with the whole Coil Guild gathered under it in leather aprons. Beside the Chancellor stand rows of empty cages. Up and down the street, children are holding jars with little lights in them, very tightly.', next: 'motion' },
      motion: { speaker: VS, text: 'The motion: that Tower Fifteen’s coil be charged with Spirehold’s Static Wisps, every one, so that the tower holds, and stands, and never falls on anyone again. Our young Sparkwright will speak first.', next: 'tess' },
      tess: { speaker: TA, mood: 'angry', text: '(From the crowd.) They’re not batteries, Volta! They’re wisps! Every child on Coil Street sleeps with one by the bed!', next: 'voices' },
      voices: {
        speaker: 'narrator', text: 'The Guild erupts. A master of the Spires shouts about towers falling. A master of Coil Street shouts about children crying. Somebody’s apron catches fire, which on Coil Street counts as a point of order.',
        choices: [
          { text: '(Lift Juniper up so the Guild can hear her.)', to: 'juniper', when: { flag: 'sparkwright.juniper_asked' } },
          { text: '(Let Wilf Farraday speak.)', to: 'wilf', when: { flag: 'sparkwright.wilf_asked' } },
          { text: '(Step forward and speak.)', to: 'choose' },
        ],
      },
      juniper: { speaker: 'npc:juniper-gauss', text: '(Very loud, from your shoulders, holding up a jar.) This is Bobbin’s jar. Bobbin isn’t a coil. He likes being sung to, and he’s frightened of the dark, which is silly, because he IS the light. That’s all.', next: 'choose' },
      wilf: { speaker: 'npc:wilf-farraday', mood: 'sad', text: '(He takes his cap off.) I’ve buried two apprentices under fallen towers. I want a tower that stands more than anybody here. I don’t want it standing on a jar by a little girl’s bed. That’s all I’ve got.', next: 'choose' },
      choose: {
        speaker: VS, text: 'Thank you, Guildmother. Well, Sparkwright? What is a spark for?',
        choices: [
          { text: 'Cage them. A city of lights is worth less than a tower that stays up.', to: 'caged', quest: true, trustNpc: TA, trust: -1, effects: [{ setFlag: 'sparkwright.wisps', value: 'caged' }] },
          { text: 'Free them. A tower isn’t worth the city’s lights. Let the wisps go.', to: 'freed', quest: true, effects: [{ setFlag: 'sparkwright.wisps', value: 'freed' }] },
          { text: 'Let them choose. (Open the cages and play the kettle note.) The ones that want to stay will stay.', to: 'chose', quest: true, insight: 'wisps_chose', when: { insight: 'tower_hum' }, effects: [{ setFlag: 'sparkwright.wisps', value: 'chose' }] },
        ],
      },
      caged: { speaker: VS, mood: 'happy', text: 'Carried. (The cages fill with light. Up and down Coil Street the jars by the children’s beds go dark, one by one.) Tower Fifteen will stand tonight. (Tess turns and walks away through the crowd.)', next: null },
      freed: { speaker: VS, mood: 'sad', text: 'Sentiment. The motion falls. (A cheer from the rooftops: the Tempest Coven, delighted.) Then open your cages, Sparkwright, and watch my tower come down.', next: null },
      chose: { speaker: VS, mood: 'afraid', text: '(You hum the old kettle note, and the half-stone hums it with you, and the whole street goes still.) …That note. Where did you get that note? (She has gone very white.) Open the cages, then. Let them choose.', next: null },
      after: { speaker: VS, text: 'The Guild has voted. Now we build with what it gave us.', next: null },
    },
  },
  {
    id: 'dialogue:obj-wisp-cage', name: 'I-5 the wisp-cages', scope: 'party',
    entries: [
      { when: { all: [stage('quest:sparkwright-tower-fifteen', 'cages'), { flag: 'sparkwright.wisps', value: 'chose' }] }, node: 'chose' },
      { when: stage('quest:sparkwright-tower-fifteen', 'cages'), node: 'freed' },
      { node: 'cage' },
    ],
    nodes: {
      freed: { speaker: 'narrator', text: 'You unlatch the last cage. The wisps pour out in a river of little lights and go straight up into the storm, and the storm takes them. Behind you, with a long, polite groan, Tower Fifteen leans, and leans, and lies down across the Copper Spires.', next: 'fifteen' },
      fifteen: { speaker: 'narrator', text: 'The fifteenth to fall. Nobody is under it. On the rooftops, the Tempest Coven is cheering. Down on Coil Street, a child is cheering too, with an empty jar, because her wisp went up with the others and she saw it go.', next: null },
      chose: { speaker: 'narrator', text: 'You unlatch the last cage and hum. Half the wisps go up into the storm. Half of them stay, drifting back down the street to the jars by the beds. Tower Fifteen does not fall. It does not stand, either. It hums, half-built, like a song with the middle missing.', next: null },
      cage: { speaker: 'narrator', text: 'A row of wisp-cages at the foot of Tower Fifteen.', next: null },
    },
  },
  // ---------- I-6 The Grand Patent Vault
  {
    id: 'dialogue:obj-jammed-patent-sheet', name: 'I-6 the paper in the gears', scope: 'party',
    entries: [{ when: stage('quest:sparkwright-the-grand-patent-vault', 'sheet'), node: 'sheet' }, { node: 'gear' }],
    nodes: {
      sheet: { speaker: 'narrator', text: 'The Perpetual Engine Mk. XII has stopped at last, with a long sigh of black oil, like something that has been waiting forty years for permission. Jammed in its final gear is a sheet of paper, folded very small.', next: 'read' },
      read: { speaker: 'narrator', text: 'It is a patent application, in a neat, upright, unburned hand. “For the Perpetual Tower. Applicant: V. Sterne, Chancellor.” In the margin someone has drawn a small, careful crown, with a lightning bolt for every jewel.', next: null },
      gear: { speaker: 'narrator', text: 'The Perpetual Engine Mk. XII, stopped. It looks, if a machine can, relieved.', next: null },
    },
  },
  // ---------- I-7 Patent Pending
  {
    id: 'dialogue:sparkwright-tess-patent', name: 'I-7 Tess reads the patent', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: TA, text: 'Let me see. Hm. Hmm. “The Tower half, caged in a coil-engine at the Lightning Tower’s crown.” “Fed by Skyrender’s storm.” “Pinned over the Copper Gate in perpetuity.” Oh, Volta. Oh, you clever, clever idiot.', next: 'storm' },
      storm: {
        speaker: TA, mood: 'sad', text: 'The storm over the gate. That’s her. She has been holding it there for a year, for this. The storm would never end. It would only be used, for ever. Every light in Spirehold, from one bird that never gets to fly home.',
        choices: [
          { text: 'How is she holding a storm still?', to: 'how' },
          { text: 'The anchor-rods. Ma Ohmsworth showed me. They’re what hold the storm in place.', to: 'rods', when: { insight: 'anchored_storm' } },
        ],
      },
      how: { speaker: TA, text: 'Something’s pinning it. Something big, and copper, and deep. The patent says “anchor-rods, four, in the Foundations”. Go down to the root-tuning chamber and look. And look at the crown she’s drawn in the margin, family. Look at it hard.', next: 'filed' },
      rods: { speaker: TA, text: 'Ma saw them? Of course Ma saw them. Ma sees everything that hums. Then go and count them for me, so I can be sure. And look at that little crown in the margin, family. That isn’t a doodle. That’s a plan.', next: 'filed' },
      filed: { speaker: TA, text: 'But first, the Patent Office. Every application leaves a filing date, and Mortimer Sneddon remembers every date he ever stamped. Ask him when she filed it. I want to know how long she’s been planning to cage the sky.', next: null },
    },
  },
  {
    id: 'dialogue:obj-volta-anchor-rod-1', name: 'I-7 the first anchor-rod', scope: 'party',
    entries: [{ when: stage('quest:sparkwright-patent-pending', 'rods'), node: 'rod' }, { node: 'plain' }],
    nodes: {
      rod: {
        speaker: 'narrator', text: 'A copper rod as thick as your waist, driven down through the Lightning Tower’s roots into the rock. It is humming, very low, the hum of something holding hard. Stamped on the collar: PATENT PENDING. V. S.',
        choices: [
          { text: '(Put your hand on it and listen.)', to: 'listen', insight: 'anchored_storm' },
          { text: '(Find the next one.)', to: null },
        ],
      },
      listen: { speaker: 'narrator', text: 'Through your palm you can feel the storm over the Copper Gate, miles away, pulling at the end of this rod like a kite on a line. It wants to go home. It isn’t allowed.', next: null },
      plain: { speaker: 'narrator', text: 'One of Volta’s anchor-rods, humming in the Tower Foundations.', next: null },
    },
  },
  // ---------- I-8 The Tower Crown
  {
    id: 'dialogue:sparkwright-crown-words', name: 'I-8 Volta at the Tower Crown', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: VS, text: 'You found the patent. Good. I’d have been disappointed if you hadn’t. (Behind her, a cage of copper coils the size of a house stands around the Tower half, waiting.) It won’t lift for me. I’ve tried for thirty years. It only lifts for you.',
        choices: [
          { text: 'You’ll never let the storm go home.', to: 'home' },
          { text: 'The tower used to hum. The storms came to it. You don’t need a cage.', to: 'hum', school: 'storm', when: { insight: 'tower_hum' } },
          { text: 'Stand away from the cage, Chancellor.', to: 'away' },
        ],
      },
      home: { speaker: VS, text: 'Home is where it falls on people. I would rather it stayed here, in a box, being useful, and nobody under a tower ever again. That is love too, Sparkwright. It is just tidier than Tess’s.', next: 'fight' },
      hum: { speaker: VS, mood: 'afraid', text: '(For a moment her hand shakes, and she looks at it as if it belonged to someone else.) Hum. And hope. And hope it comes. I can’t build a city on hope. I need a switch.', next: 'fight' },
      away: { speaker: VS, text: 'I have stood away from this city’s problems my whole life, filing patents and oiling wheels. I am not standing away from this one.', next: 'fight' },
      fight: { speaker: VS, mood: 'hollow', text: '(Black sparks run down her harness and leave scorch-marks on the floor, like tears.) Set the stone, or I will set you in the cage beside it. Either way, Spirehold stays up.', next: null },
    },
  },
  {
    id: 'dialogue:obj-storm-capital-halfstone', name: 'I-8 the Tower half', scope: 'party',
    entries: [{ when: stage('quest:sparkwright-the-tower-crown', 'stone'), node: 'claim' }, { node: 'cage' }],
    nodes: {
      claim: { speaker: 'narrator', text: 'Inside the copper cage, in a cradle of old lightning-glass, lies half of a crystal, cracked clean across, crackling. The cage around it is the most beautiful machine you have ever seen.', next: 'coils' },
      coils: {
        speaker: 'narrator', text: 'Four hundred coils, every one wound by hand. Behind you, at the edge of the crown, Volta is getting her breath and watching you, the way an inventor watches somebody else touch her work.',
        choices: [
          { text: '(Reach in and take the stone.)', to: 'take' },
          { text: '(Look at the cage properly first.)', to: 'look' },
          { text: '(Hum the old kettle note at it.)', to: 'hum', school: 'storm', when: { insight: 'tower_hum' } },
        ],
      },
      look: {
        speaker: 'narrator', text: 'Every coil is labelled in the same neat hand: COIL 1 OF 400, COIL 2 OF 400. On the cage door, a small brass plate: “For Spirehold, so that nothing ever falls on anybody again. V.”',
        choices: [
          { text: '(Unscrew the plate and keep it.)', to: 'take', effects: [{ setFlag: 'sparkwright.volta_plate', value: true }] },
          { text: '(Leave it where she put it.)', to: 'take' },
        ],
      },
      hum: { speaker: 'narrator', text: 'You hum. The half-stone hums back. And one by one the cage’s four hundred coils go slack, gently, with a sound like a crowd of people letting out a breath they had been holding for thirty years.', next: 'take' },
      take: { speaker: 'narrator', text: 'The half-stone leaps into your hand before you have quite reached for it. It feels like holding someone’s hand, someone who is trying very hard not to laugh.', next: 'volta' },
      volta: { speaker: VS, mood: 'hollow', text: '(At the edge of the crown, clipping her harness to a lightning-line with steady fingers.) Keep it charged for me, Sparkwright. I’ll see you at the Copper Gate. Everything goes through the gate in the end.', next: 'line' },
      line: {
        speaker: 'narrator', text: 'And she steps off the Tower Crown and rides the line down, crackling, a streak of black sparks all the way across Spirehold to the storm over the Copper Gate.',
        choices: [
          { text: '(Watch her go.)', to: 'watch' },
          { text: '(Shout after her.)', to: 'shout' },
        ],
      },
      watch: { speaker: 'narrator', text: 'You watch the black spark shrink across the city until it is lost in the storm. Even falling, she keeps perfect posture. Wilf Farraday would be proud. You will not tell him.', next: null },
      shout: { speaker: 'narrator', text: 'Your shout goes out over Spirehold and comes back off the Copper Spires: Volta! Volta! It doesn’t reach her. Down on Coil Street, though, every lamp in every window flickers, as if the whole city had heard her name and looked up.', next: null },
      cage: { speaker: 'narrator', text: 'An empty copper cage at the crown of the Lightning Tower, humming to nobody.', next: null },
    },
  },
  // ---------- I-9 The Copper Road (mentor farewell; trust check)
  {
    id: 'dialogue:sparkwright-tess-farewell', name: 'I-9 Tess’s farewell', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: TA, text: 'So you have it, and she has gone for the gate on a lightning-line, which, I must say, is very good engineering. And you have to go after her. Sit. Nothing’s on fire. I put everything out. It felt very strange.',
        choices: [
          { text: 'Come with me.', to: 'stay' },
          { text: 'Thank you, Guildmother. For the family.', to: 'volta', trust: 1 },
        ],
      },
      stay: { speaker: TA, text: 'And leave Coil Street with nobody to explode it? No, no. Somebody has to keep this city ridiculous while you’re gone.', next: 'volta' },
      volta: {
        speaker: TA, mood: 'sad', text: 'Volta was my apprentice, you know. For one week, when she was fourteen. She tidied my workshop. Labelled everything. I sacked her on the Friday for it, and she laughed, and that was the last time I ever heard her laugh.',
        choices: [
          { text: 'She loves this city as much as you do.', to: 'loves' },
          { text: 'You couldn’t have stopped her.', to: 'stopped' },
        ],
      },
      loves: { speaker: TA, text: 'More, maybe. That’s the trouble. I love it the way you love a dog that knocks things over. She loves it the way you love a vase. You don’t let a vase out of your sight. You don’t let it do anything at all.', next: 'gifts' },
      stopped: { speaker: TA, text: 'No. But I could have kept her a fortnight. Let her blow something up, just once, and see that the street was still there afterwards. One more week of mess might have done it. Oh well. Bucket.', next: 'gifts' },
      gifts: {
        speaker: TA, text: 'I have something for you. Two somethings, maybe.',
        choices: [
          { text: '(Take what she offers.)', to: 'goggles', when: { trust: TA, value: 'friendly' } },
          { text: '(Shake her hand.)', to: 'hand', when: { not: { trust: TA, value: 'friendly' } } },
        ],
      },
      goggles: {
        speaker: TA, text: 'My goggles. I’ve worn them forty years and never once had them on when it mattered. For the eyebrows you’ve got left.',
        effects: [{ giveItem: 'i_tess_goggles' }, { setFlag: 'sparkwright.tess_farewell', value: 'goggles' }],
        choices: [
          { text: 'Thank you, Tess.', to: 'kettle', when: { trust: TA, value: 'trusted' } },
          { text: 'Thank you, Tess.', to: 'end', when: { not: { trust: TA, value: 'trusted' } } },
        ],
      },
      kettle: {
        speaker: TA, mood: 'sad', text: 'And… Kettle Twenty wants to go with you. Don’t look at me like that. He whistles when danger’s near, and you’re going to be near a great deal of it. Take him. He likes you. He told me.',
        choices: [
          { text: '(Hold out your hand. Kettle Twenty walks up your arm.)', to: 'end', effects: [{ setFlag: 'sparkwright.kettle_pet', value: true }] },
          { text: 'He should stay with you.', to: 'end' },
        ],
      },
      hand: { speaker: TA, text: 'Well. Mind the road. Mind the bird. Mind your cuffs, ha. Off you go, family.', effects: [{ setFlag: 'sparkwright.tess_farewell', value: 'hand' }], next: null },
      end: { speaker: TA, text: 'Go on. Before I invent something sentimental and have to patent it.', next: null },
    },
  },
];

export default dialogues;
