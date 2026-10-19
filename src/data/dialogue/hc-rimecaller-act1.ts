/** Hollow Crown, RIMECALLER Act I main dialogues (Glacierhome). Owner: Claude 4. */
import type { DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const HV = 'npc:halla-vint' as const, SC = 'npc:seraphine-cold' as const;

const dialogues: DialogueDef[] = [
  // ---------- I-1 The First Tick
  {
    id: 'dialogue:rimecaller-first-tick', name: 'I-1 the Bell rings over Glacierhome', scope: 'party',
    entries: [{ node: 'night' }],
    nodes: {
      night: { speaker: 'narrator', text: 'The same night it has been for thirty years. The same stars, the same half-moon, the same baker’s smoke standing in the air above the Spire Stair like a grey feather that never falls.', next: 'bell' },
      bell: { speaker: 'narrator', text: 'Then, somewhere very far away, a bell rings once. And every stopped clock in Glacierhome ticks. Once. Ten thousand clocks, all together, like a city clearing its throat.', next: 'chest' },
      chest: { speaker: 'narrator', text: 'Something in your chest ticks with them, and keeps going. It is cold, and clear, and it is singing. Down the Stair, somebody who has not moved since before you were born has just moved.', next: null },
    },
  },
  {
    id: 'dialogue:obj-frozen-lamplighter', name: 'I-1 the lamplighter blinks', scope: 'party',
    entries: [
      { when: stage('quest:rimecaller-the-first-tick', 'tick'), node: 'blink' },
      { when: { flag: 'rimecaller.halfstone' }, node: 'awake' },
      { node: 'still' },
    ],
    nodes: {
      blink: { speaker: 'narrator', text: 'The lamplighter on the Spire Stair has been halfway through a blink for thirty years, pole raised to a lamp he never lit. As you watch, his eyelids finish coming down, and go back up. Then he is still again.', next: 'halla' },
      halla: { speaker: HV, mood: 'happy', text: '(Behind you, in a dressing-gown and an extraordinary hat.) He’s never done that before.', next: null },
      awake: { speaker: 'narrator', text: 'The lamplighter is lighting lamps along the Stair at a furious pace, muttering that he is thirty years behind and nobody told him.', next: null },
      still: { speaker: 'narrator', text: 'The lamplighter, pole raised, mid-blink. He looks as if he has just remembered something.', next: null },
    },
  },
  {
    id: 'dialogue:rimecaller-halla-tick', name: 'I-1 Halla on the Spire Stair', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: HV, text: 'Every clock in the city. Every one. I’ve written it down, look, the time and everything. That is the first new thing I have written in thirty years. You heard it too. You’re ticking.',
        choices: [
          { text: 'Something in my chest is singing.', to: 'stone' },
          { text: 'Why are you wearing that hat?', to: 'hat' },
        ],
      },
      hat: { speaker: HV, text: 'It is a night-cap. It is regulation. Nobody has inspected it since C. 1012 and I intend to be ready. Now: the singing.', next: 'stone' },
      stone: {
        speaker: HV, text: 'That is the Spire half of the Rime Stone, calling you from the top of the Ice Spire, where it has been sulking for thirty years. Only its bearer can hear it. Congratulations. Also, my condolences.',
        choices: [
          { text: 'Why can I move, when nobody else can?', to: 'pin' },
          { text: 'What do I do?', to: 'do' },
        ],
      },
      pin: { speaker: HV, text: 'Your hour-pin. I cut it for you when you were small enough to fit in a filing drawer. The hour-walkers are the only people in Glacierhome who can move inside the hold. There are eleven of us. There were twelve.', next: 'do' },
      do: {
        speaker: HV, text: 'Tonight the whole hold shook, and so did your pin. Look at it. (There is a crack across the ice at your collar, fine as a hair.) An hour-pin cracks, and then it fails, and then you are a statue with opinions. Up to my study. Now.',
        choices: [
          { text: 'I’m right behind you.', to: 'end', trust: 1 },
          { text: 'Can’t it wait until morning?', to: 'self' },
        ],
      },
      self: { speaker: HV, text: 'In Glacierhome it has been not-quite-morning for thirty years. No. It cannot wait for something that does not come. Walk.', next: 'end' },
      end: { speaker: HV, text: 'Mind the lamplighter. If he blinks again, note the time.', next: null },
    },
  },
  // ---------- I-2 The Hold-Gauges
  {
    id: 'dialogue:obj-hold-gauge-1', name: 'I-2 the first hold-gauge',
    entries: [{ when: stage('quest:rimecaller-the-hold-gauges', 'gauges'), node: 'drip' }, { node: 'gauge' }],
    nodes: {
      drip: { speaker: 'narrator', text: 'An hourglass of clear ice taller than you are. It should be dry. A thin thread of water is running down the inside of the glass, and where it pools at the bottom it is black.', next: null },
      gauge: { speaker: 'narrator', text: 'A hold-gauge on the Spire Stair, dripping slowly.', next: null },
    },
  },
  {
    id: 'dialogue:rimecaller-halla-gauges', name: 'I-2 report on the gauges', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: HV, text: 'All five dripping. Noted. And black, you say. Noted, and underlined. What else?',
        choices: [
          { text: 'Wraiths came up out of the meltwater. They had faces.', to: 'faces' },
          { text: 'The wraiths were wearing ordinary clothes. Aprons. Boots.', to: 'boots', school: 'rime' },
          { text: 'The melt doesn’t pool. It runs all the way down to a grate by the cistern-keepers’ hut, and something drinks it.', to: 'drink', when: { flag: 'rimecaller.melt_downhill' } },
        ],
      },
      drink: { speaker: HV, mood: 'afraid', text: 'Drinks it. (She writes the word, and underlines it, and then, which you have never seen her do, crosses the underline out and underlines it again.) Noted. Go on.', next: 'faces' },
      boots: { speaker: HV, text: 'You noticed the boots. Good. A Rimecaller who notices the boots will go far, and arrive appropriately shod.', next: 'faces' },
      faces: {
        speaker: HV, mood: 'sad', text: 'Frost Wraiths are people who stepped out of the hour and into the melt. Over thirty years, some of them got tired of waiting. I signed out the last one myself. Bertil. He wanted to see his sister in the Wolfrun.',
        choices: [{ text: 'I’m sorry.', to: 'down', trust: 1 }, { text: 'Where does the melt go?', to: 'down' }],
      },
      down: { speaker: HV, text: 'Downhill. Everything in Glacierhome goes downhill eventually, except the Archive’s budget. The melt has been running into the old cisterns under the Undercrypt for a year, and the cistern-keepers went down last month to see why. Go and fetch them. Gently.', next: null },
    },
  },
  // ---------- I-3 The Melt Cisterns
  {
    id: 'dialogue:obj-cistern-keepers', name: 'I-3 the cistern-keepers', scope: 'party',
    entries: [{ when: stage('quest:rimecaller-the-melt-cisterns', 'keepers'), node: 'free' }, { node: 'empty' }],
    nodes: {
      free: {
        speaker: 'narrator', text: 'Three cistern-keepers, frozen inside a lump of the Blob that went still when it died, like flies in a pane of old glass. Black beads hang in the ice around them. You warm the ice from the outside in, very slowly, the way Halla taught you to warm a book.',
        next: 'keeper',
      },
      keeper: { speaker: 'narrator', text: 'The first one out spits out a mouthful of meltwater and says, with enormous dignity, that he would like it noted he was off duty. Then they all go up the ladder, complaining, which is how you know they are alive.', next: null },
      empty: { speaker: 'narrator', text: 'A puddle where the Blob was. It is perfectly ordinary water now.', next: null },
    },
  },
  {
    id: 'dialogue:rimecaller-halla-cisterns', name: 'I-3 the keepers home', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: HV, mood: 'happy', text: 'All three, and all three complaining. I have already had a formal grievance about the temperature of the rescue. That is the most normal thing to happen in this city in decades. Thank you.',
        choices: [
          { text: 'The Blob had black tears frozen in it, like beads.', to: 'beads' },
          { text: 'Anything for a formal grievance.', to: 'regent', trust: 1 },
        ],
      },
      beads: { speaker: HV, text: 'Then the black is in the melt, and the melt is coming from the hold. Which means the black is in the hold. Which means I have a great deal of thinking to do, and none of it pleasant.', next: 'regent' },
      regent: {
        speaker: HV, text: 'Also: the Regent has sent down a note. She heard the tick. She would like to meet the hour-walker who heard it first. The Regent does not usually like to meet anybody.',
        choices: [{ text: 'What is she like?', to: 'like' }, { text: 'I’ll go.', to: null }],
      },
      like: { speaker: HV, text: 'Gracious. Tired. She winds the clocks, or rather she doesn’t, which is her whole job. Be polite. Be accurate. Don’t touch the clocks.', next: null },
    },
  },
  // ---------- I-4 The Regent's Key
  {
    id: 'dialogue:rimecaller-regent-key', name: 'I-4 meeting the Regent', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: SC, text: 'You must be Halla’s hour-walker. Come in out of the stairwell. No, don’t bow, my knees can’t bear to watch it. You heard the tick? Every clock in my hall moved, and I did not move them.',
        choices: [
          { text: 'I heard it. I felt it, here.', to: 'chest' },
          { text: 'Something rang a bell, very far away.', to: 'bell' },
        ],
      },
      bell: { speaker: SC, text: 'A bell. Yes. I heard that too, though I have tried very hard not to. Bells are for beginnings. I have had enough of beginnings.', next: 'chest' },
      chest: {
        speaker: SC, mood: 'sad', text: 'I have held this city’s hour for thirty years. It is the most delicate thing in Frostmere, and tonight something in it ticked. I would like you to help me find what ticked, so that it never needs to again.',
        choices: [
          { text: 'Why should nothing ever tick again?', to: 'why' },
          { text: 'Who cut your hour-pin, Regent?', to: 'pin', insight: 'regent_pin', when: { questCompleted: 'quest:rimecaller-the-first-tick' } },
          { text: 'I’ll help.', to: 'help' },
        ],
      },
      pin: { speaker: SC, text: '(Her hand goes to her collar, where there is no pin at all.) Nobody. I don’t need one. I am the hold, a little. You get used to it. You will, if you stay.', next: 'help' },
      why: { speaker: SC, text: 'Because nothing in here dies, child. Nothing spoils, nobody sickens, the bread never burns. Out there it is all endings. In here we have one evening, and it is a good one, and we keep it.', next: 'help' },
      help: {
        speaker: SC, text: 'Three great clocks stand where the hold runs thinnest, on the long way down to the Frozen Market. Read them for me. Tell me how far they moved, and whether they moved back. Exactly, please. Halla will have taught you exactly.',
        choices: [{ text: 'I’ll read them.', to: 'end', quest: true }, { text: 'I’ll read them, and I’ll tell you what they say, not what you’d like.', to: 'free', quest: true }],
      },
      free: { speaker: SC, mood: 'happy', text: 'Of course you will. Halla taught you. Halla taught me, once, a very long time ago.', next: 'end' },
      end: { speaker: SC, text: 'Gently, mind. A clock that has stood still for thirty years has earned a little gentleness.', next: null },
    },
  },
  // ---------- I-5 The Conduit Vote (faction choice; a party vote)
  {
    id: 'dialogue:rimecaller-conduit-vote', name: 'I-5 the Archive votes', scope: 'party',
    entries: [{ when: { not: { flag: 'rimecaller.conduits' } }, node: 'hall' }, { node: 'after' }],
    nodes: {
      hall: { speaker: 'narrator', text: 'The Hall of Held Hours. Eleven hour-walkers on the archive benches, which seat four hundred. Halla in the front row with a pencil behind each ear. In the corner, the Wardens’ envoy, who has been waiting for an answer since C. 1012, with her shield on her knees.', next: 'motion' },
      motion: { speaker: SC, text: 'The hold is failing. The motion is that the Archive open the old Rime Conduits, and draw the cold of the Wardwall up into Glacierhome, so that the hour may be kept. Our young hour-walker will speak first.', next: 'envoy' },
      envoy: { speaker: 'npc:aud-fellmark', mood: 'angry', text: '(Standing up.) Every bit of cold you pull up here comes off the Wall. The Wall is what stands between the winter and everybody. You’ll put our watch-fires out to keep your supper warm.', next: 'voices' },
      voices: {
        speaker: 'narrator', text: 'Ten hour-walkers start talking at once, which in an archive is a riot. Somebody demands the minutes of the last vote. The last vote was in C. 1012. Somebody else has the minutes, and starts reading them aloud.',
        choices: [
          { text: '(Ask Gunnhild to say what she told you.)', to: 'gunnhild', when: { flag: 'rimecaller.gunnhild_asked' } },
          { text: '(Look at Halla.)', to: 'halla' },
          { text: '(Stand up and speak.)', to: 'choose' },
        ],
      },
      gunnhild: { speaker: 'npc:gunnhild-tapp', text: '(From the back, not loudly.) Opening the Conduits won’t stop the drips. I’ve counted them for a year. It’ll only make them come faster, and colder, and the beat stays the same. Whatever is keeping time down there doesn’t care how much cold you give it.', next: 'choose' },
      halla: { speaker: HV, text: '(She does not stand. She takes one pencil from behind her ear and sets it down on the bench, very precisely.) The Archive’s motto is Nothing Lost. It has never once been Nothing Moves. I merely mention it, for the minutes.', next: 'choose' },
      choose: {
        speaker: SC, text: 'Thank you, Envoy. Well, hour-walker? What is the cold for?',
        choices: [
          { text: 'Open the Conduits. Glacierhome is the oldest thing in Frostmere. Keep it whole.', to: 'opened', quest: true, trustNpc: HV, trust: -1, effects: [{ setFlag: 'rimecaller.conduits', value: 'opened' }] },
          { text: 'The Wall keeps its cold. It is holding back the winter for everyone, not one evening for us.', to: 'kept', quest: true, effects: [{ setFlag: 'rimecaller.conduits', value: 'kept' }] },
          { text: 'Neither. Don’t hold the Market. Keep it. Let me write it down the oldest way, and let it go.', to: 'written', quest: true, insight: 'market_kept', when: { insight: 'first_keeping' }, effects: [{ setFlag: 'rimecaller.conduits', value: 'written' }] },
        ],
      },
      opened: { speaker: SC, mood: 'happy', text: 'Wisdom. Carried. The Conduits open tonight. (Halla closes her notebook, very quietly, and does not look at you.)', next: null },
      kept: { speaker: SC, mood: 'sad', text: 'The motion falls. The hold will weaken, and some of the city will wake before it is ready. I hope you know what you have asked for. (The envoy sits down hard, and laughs, and wipes her eyes.)', next: null },
      written: { speaker: 'narrator', text: 'You walk out into the Frozen Market and write it down: every stall, every price, every held breath, the smell of the roasting chestnuts, the colour of the awnings. You write until it is kept. Then you let it go, and the Market wakes, and goes on with its evening.', next: 'written2' },
      written2: { speaker: SC, mood: 'afraid', text: '(From the top of the Hall, very pale.) …You let it go. Just like that. You wrote it down, and you let it go. The motion is withdrawn.', next: null },
      after: { speaker: SC, text: 'The Archive has spoken. The clocks will forgive us, I expect. They have forgiven worse.', next: null },
    },
  },
  {
    id: 'dialogue:rimecaller-aud-envoy', name: 'I-5 the Wardens’ envoy', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:aud-fellmark', mood: 'happy', text: 'Thirty years. Thirty years I’ve sat in that chair with my shield on my knees, waiting for somebody up here to say no. You said no. I could kiss you. I won’t. Wardens don’t.',
        choices: [{ text: 'Go home, Envoy. Tell the Wall.', to: 'home' }, { text: 'What will you tell them?', to: 'tell' }],
      },
      tell: { speaker: 'npc:aud-fellmark', text: 'That the cold stays where it’s wanted, and that one of you lot could see past the end of the glacier. They’ll not believe me. Dagny Orr will want it in writing.', next: 'home' },
      home: { speaker: 'npc:aud-fellmark', text: 'I’ll go when the hold lets me. My feet have forgotten how stairs work. Thank you, hour-walker. The Wall owes you a fire.', next: null },
    },
  },
  // ---------- I-6 The Mirror Gallery
  {
    id: 'dialogue:obj-reflection-shard', name: 'I-6 the last shard', scope: 'party',
    entries: [{ when: stage('quest:rimecaller-the-mirror-gallery', 'shard'), node: 'shard' }, { node: 'cracked' }],
    nodes: {
      shard: { speaker: 'narrator', text: 'The last shard of your frozen double lies face up on the gallery floor. It is not showing your face. It is showing what the gallery’s mirrors have looked at for thirty years, because it was the only thing in the hold worth looking at.', next: 'room' },
      room: { speaker: 'narrator', text: 'A small warm room high in the Spire. A good chair by a cold window. An old man in the chair, eyes half closed, his mouth a little open, in the middle of breathing out. A cup beside him that has not cooled. Through the wall, the Regent’s rooms.', next: 'hand' },
      hand: { speaker: 'narrator', text: 'Every few minutes, in the shard, a grey-eyed woman comes in, takes the old man’s hand, says something, and goes out again. In thirty years she has never once let go first.', next: null },
      cracked: { speaker: 'narrator', text: 'A shard of ice-mirror, cracked straight across. It shows the ceiling.', next: null },
    },
  },
  // ---------- I-7 The Next Room
  {
    id: 'dialogue:rimecaller-halla-next-room', name: 'I-7 Halla on the next room', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: HV, text: 'An old man. A chair by a cold window. A cup that hasn’t cooled. (She puts down her pencil, which she has never done in your presence.) That is Anselm Cold. The Regent’s husband. The Archive was told he died in C. 1012.',
        choices: [
          { text: 'He didn’t die. She stopped the clock before he could.', to: 'stopped' },
          { text: 'Every clock in the city stopped at eleven fifty-two. That’s the minute in the physician’s log.', to: 'minute', when: { insight: 'held_minute' } },
          { text: 'The drips in the Undercrypt. They’re his heartbeat.', to: 'heart', when: { insight: 'held_heartbeat' } },
        ],
      },
      minute: { speaker: HV, mood: 'sad', text: 'Eleven fifty-two. “The Regent’s physician called up to the Spire.” I read that line in Cornelius’s register a thousand times and never once asked who for. Thirty years of noticing everything, and I didn’t notice that.', next: 'tears' },
      heart: { speaker: HV, mood: 'sad', text: 'Slow. Stubborn. Gunnhild has been counting a dying man’s pulse for thirty years and writing it in a ledger marked “drips”. Oh, Seraphine.', next: 'tears' },
      stopped: { speaker: HV, mood: 'sad', text: 'Yes. She held the whole city so that one breath would never leave one room. I would call it monstrous if it weren’t so very like her.', next: 'tears' },
      tears: {
        speaker: HV, text: 'And now the hold is failing, and she has been shoring it up with something. I can guess with what. The black in the melt. The Wall has been seeping tears for a year, and the Regent has been drinking from it.',
        choices: [{ text: 'Then the black tears are holding the hour together.', to: 'proof' }, { text: 'What does she want with my half-stone?', to: 'stone' }],
      },
      stone: { speaker: HV, text: 'To set it into the hold, so that it never fails. So that the hour never moves again, and nobody in this city ever breathes out. Including him.', next: 'proof' },
      proof: { speaker: HV, text: 'I want proof before I accuse a Regent of anything. Her physician, Doctor Wilmot Mure, was called up to the Spire that night and never came down. His surgery on the Market Steps has not been opened since. Start there. Then the clock wall in the Hall. Read both properly.', next: null },
    },
  },
  {
    id: 'dialogue:obj-held-clock-wall', name: 'I-7 the held clock wall', scope: 'party',
    entries: [
      { when: stage('quest:rimecaller-the-next-room', 'clocks'), node: 'wall' },
      { when: { flag: 'rimecaller.halfstone' }, node: 'running' },
      { node: 'plain' },
    ],
    nodes: {
      wall: {
        speaker: 'narrator', text: 'A wall of clock faces, floor to ceiling, one for every clock in the city. Every minute hand points to the same place. Behind the wall, threaded through the works like veins through a leaf, runs a thin pipe of black ice, up towards the Spire.',
        choices: [
          { text: '(Read the minute hands.)', to: 'minute', insight: 'held_minute' },
          { text: '(Follow the black pipe with your eyes.)', to: 'pipe' },
        ],
      },
      minute: { speaker: 'narrator', text: 'Eleven fifty-two. Every one of them. Somebody has scratched the same time, very small, into the brass under the last clock, the way you might write a date you never want to forget.', next: 'pipe' },
      pipe: { speaker: 'narrator', text: 'The black ice runs from the Undercrypt, where the Wall’s seep comes up, through every clock in the hall, and on up the Spire to its crown. The hold is being fed. It is being fed tears.', next: null },
      running: { speaker: 'narrator', text: 'The clock wall is ticking, every face of it, a little out of step, like a hall full of people who have all started talking at once.', next: null },
      plain: { speaker: 'narrator', text: 'The clock wall of the Hall of Held Hours. Every hand points to eleven fifty-two.', next: null },
    },
  },
  // ---------- I-8 The Crown of the Spire
  {
    id: 'dialogue:rimecaller-crown-words', name: 'I-8 Seraphine at the Crown', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: SC, text: 'You came up. Of course you came up. The stone sings for you, and only for you, and I cannot carry it a single inch. Thirty years I’ve sat beside it, waiting for its bearer. Hello, child.',
        choices: [
          { text: 'Let him go, Regent. Let him finish breathing.', to: 'go' },
          { text: 'You’re not keeping him. You’re holding him. They aren’t the same.', to: 'keep', school: 'rime', when: { any: [{ insight: 'first_keeping' }, { insight: 'market_kept' }] } },
          { text: 'Stand aside.', to: 'aside' },
        ],
      },
      go: { speaker: SC, mood: 'sad', text: 'He is in the middle of a breath. It is not a bad breath. It doesn’t hurt. When it ends, so does he, and I will be alone in a city that has started again without him. No.', next: 'fight' },
      keep: { speaker: SC, mood: 'afraid', text: '(For a moment she looks at you exactly the way Halla does when you get a sum right.) I know. I know what the first keeping says. I haven’t the strength to write him down and let him go. I only have the strength to hold.', next: 'fight' },
      aside: { speaker: SC, text: 'I have stood aside from everything for thirty years. I won’t stand aside from this.', next: 'fight' },
      fight: { speaker: SC, mood: 'hollow', text: '(A black tear freezes on her cheek. She plucks it off like a bead, and holds it up between two fingers.) Set the stone into the hold, hour-walker. Or I will hold you too.', next: null },
    },
  },
  {
    id: 'dialogue:obj-rime-capital-halfstone', name: 'I-8 the Spire half', scope: 'party',
    entries: [{ when: stage('quest:rimecaller-the-crown-of-the-spire', 'stone'), node: 'claim' }, { node: 'cradle' }],
    nodes: {
      claim: { speaker: 'narrator', text: 'In the crown of the Ice Spire, in a cradle of clear ice, lies half of a crystal, cracked clean across, singing. Behind it a small door stands ajar, and through the gap you can see the edge of a good chair by a cold window.', next: 'door' },
      door: {
        speaker: 'narrator', text: 'The moment you lift it, the hold breaks. You know it the way you know a stair is there in the dark. Everything in this city will go on. Including the breath in the next room.',
        choices: [
          { text: '(Lift it now.)', to: 'lift' },
          { text: '(Go through the door first.)', to: 'room' },
          { text: '(Hold this moment, just one, and listen to the stone.)', to: 'listen', school: 'rime' },
        ],
      },
      room: { speaker: 'narrator', text: 'Anselm Cold, in his chair, eyes half closed, breathing out. The cup at his elbow is still warm. His book lies face down at page two hundred and six, where it has lain for thirty years, and the spine is beginning to crack.', next: 'anselm' },
      anselm: {
        speaker: 'narrator', text: 'On the windowsill, a row of thirty small black beads of ice, lined up very neatly, one for every year. Somebody has been counting.',
        choices: [
          { text: '(Close his book for him, with your finger at his page.)', to: 'book', effects: [{ setFlag: 'rimecaller.anselm_book', value: true }] },
          { text: '(Take his hand, the way she does.)', to: 'hand' },
        ],
      },
      book: { speaker: 'narrator', text: 'You slip the ribbon in at page two hundred and six and close the book on his knee. Whatever happens next, he won’t lose his place. It seems a very small thing to do. It is the only thing in the room you can do.', next: 'lift' },
      hand: { speaker: 'narrator', text: 'His hand is warm, and quite still, and very light. You understand, holding it, why she never once let go first. You let go first. Somebody has to.', next: 'lift' },
      listen: { speaker: 'narrator', text: 'You hold your breath and let the stone sing. It isn’t singing to you. It is singing to the room next door, very softly, the way you sing to someone who is going to sleep. It has been singing to him for thirty years.', next: 'lift' },
      lift: { speaker: 'narrator', text: 'You set your hands round the half-stone and lift it out of the cradle. It is cold in your hand, and then it is not. It feels like holding someone’s hand.', next: 'break' },
      break: { speaker: 'narrator', text: 'And the hold breaks. You feel it go like a held breath let out, all through the glacier, every street and stair of it. Far below, ten thousand clocks begin to strike, all together, and do not stop.', next: 'flee' },
      flee: {
        speaker: SC, mood: 'hollow', text: '(From the next room, over the striking.) Not yet. Not yet! (A sledge, a scream of runners on ice, and Ice Sentries hauling an old man’s chair away down the glacier, towards the White Gate.)',
        choices: [
          { text: '(Run to the window.)', to: 'window' },
          { text: '(Let her go. There is only one road out, and it ends at the gate.)', to: null },
        ],
      },
      window: { speaker: 'narrator', text: 'Far below, the sledge is already a dark speck on the glacier, with the Regent running beside it, one hand on the chair. She does not look back. Behind you, in the empty room, the cup on the table has begun, for the first time in thirty years, to cool.', next: null },
      cradle: { speaker: 'narrator', text: 'The empty cradle at the crown of the Spire. Without the stone in it, it is only ice, and it is beginning, very gently, to drip.', next: null },
    },
  },
  // ---------- I-9 The Thaw Road (the city wakes; mentor farewell with a trust check)
  {
    id: 'dialogue:rimecaller-the-thaw', name: 'I-9 Glacierhome wakes', scope: 'party',
    entries: [{ node: 'wake' }],
    nodes: {
      wake: {
        speaker: 'narrator', text: 'Glacierhome wakes all at once, in the middle of its evening, thirty years late. Every clock strikes thirty years. The baker’s smoke finally falls. Somewhere a dog finishes a bark it started before you were born.',
        choices: [
          { text: '(Look down at the Frozen Market.)', to: 'market' },
          { text: '(Look along the Spire Stair.)', to: 'stair', when: { flag: 'rimecaller.letter_delivered' } },
          { text: '(Go to Halla.)', to: null },
        ],
      },
      market: { speaker: 'narrator', text: 'In the Market a sugar bowl changes hands at last. Nim Larkspur’s fingers close on Widow Tern’s purse, or on nothing, depending on what you left him. A thousand people pick up their conversations exactly where they dropped them.', next: 'wake2' },
      stair: { speaker: 'narrator', text: 'Wendel Fross puts his foot down on the step at last, and looks at his empty hand, baffled. Down in the Market, Greta Lind looks at the letter in hers. She reads it twice. Then she starts to run.', next: 'wake2' },
      wake2: { speaker: 'narrator', text: 'Nobody in the city seems to notice anything is wrong, except that it has gone very suddenly dark, and that their tea is cold.', next: null },
    },
  },
  {
    id: 'dialogue:rimecaller-halla-farewell', name: 'I-9 Halla’s farewell', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: HV, text: 'Listen to it. Every clock in the city, all wrong, all at once. Cornelius is outside the window weeping into his register. And you have to go, because she has gone for the gate, and somebody has to follow. Sit. Just for a minute. A real one.',
        choices: [
          { text: 'Come with me.', to: 'stay' },
          { text: 'Thank you, Archivist. For cutting my pin.', to: 'student', trust: 1 },
        ],
      },
      stay: { speaker: HV, text: 'I am sixty-three. For the first time in thirty years that is going to change, every single day. I would like to be here to write it down.', next: 'student' },
      student: {
        speaker: HV, mood: 'sad', text: 'She was my student, you know. Seraphine. The best I ever had, before you. She could hold a snowflake in the air for an hour and tell you the temperature of every arm. I taught her how to hold. I don’t think I ever taught her how to stop.',
        choices: [
          { text: 'You couldn’t have known what she’d do with it.', to: 'known' },
          { text: 'Then write to her. When this is over, she’ll need someone who knew her before.', to: 'write' },
        ],
      },
      known: { speaker: HV, text: 'No. That is the trouble with teaching. You hand someone a thing and they walk off with it into a life you will never see. Mostly that is the point. Occasionally it is a held hour.', next: 'gifts' },
      write: { speaker: HV, text: '(A very long pause, for Halla.) I have not written a letter in thirty years. There was no one to send it to who wasn’t standing still. (She takes a pencil from behind her ear, and looks at it.) I shall have to practise.', next: 'gifts' },
      gifts: {
        speaker: HV, text: 'I have something for you.',
        choices: [
          { text: '(Take what she offers.)', to: 'pin', when: { trust: HV, value: 'friendly' } },
          { text: '(Shake her hand.)', to: 'hand', when: { not: { trust: HV, value: 'friendly' } } },
        ],
      },
      pin: {
        speaker: HV, text: 'My hour-pin. I cut it for myself the night the hold began, and I never once put it on. You won’t need it. That’s the point.',
        effects: [{ giveItem: 'i_halla_hour_pin' }, { setFlag: 'rimecaller.halla_farewell', value: 'pin' }],
        choices: [
          { text: 'Thank you, Halla.', to: 'watch', when: { trust: HV, value: 'trusted' } },
          { text: 'Thank you, Halla.', to: 'end', when: { not: { trust: HV, value: 'trusted' } } },
        ],
      },
      watch: {
        speaker: HV, mood: 'sad', text: 'And… there is one other thing. Don’t look at me like that, it is only a watch.',
        choices: [
          { text: '(Take the watch.)', to: 'wound' },
          { text: 'Keep it, Halla. You’ll want to know the time now.', to: 'end' },
        ],
      },
      wound: {
        speaker: HV, mood: 'sad', text: 'My pocket-watch. It stopped at eleven fifty-two like everything else. I wound it this morning, for the first time since C. 1012. It’s running a little fast. So are you. Bring it back when you’ve caught up.',
        effects: [{ giveItem: 'i_halla_watch' }, { setFlag: 'rimecaller.halla_watch', value: true }], next: 'end',
      },
      hand: { speaker: HV, text: 'Well. Mind the glacier. Mind the Tyrant. Write things down.', effects: [{ setFlag: 'rimecaller.halla_farewell', value: 'hand' }], next: null },
      end: { speaker: HV, text: 'Go on, then. Before I say something I would have to file.', next: null },
    },
  },
];

export default dialogues;
