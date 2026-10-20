/**
 * Hollow Crown, DUSKWEAVER Act I main dialogues (Duskmere). Nyx calls the hero by a different wrong name in
 * every scene until she trusts them (Trusted), so her scenes open on two entries. Owner: Claude 4.
 */
import type { DialogueDef, NarrativeCondition } from '@/core';

const NX = 'npc:nyx-aubade' as const, OV = 'npc:oriel-vane' as const, MT = 'npc:marigold-thrupp' as const;
const RH = 'npc:rosamund-hesketh' as const;
const KNOWS: NarrativeCondition = { trust: NX, value: 'trusted' };

const dialogues: DialogueDef[] = [
  // ---------- I-1 The Bell at Dusk
  {
    id: 'dialogue:duskweaver-bell-at-dusk', name: 'I-1 the Bell over Duskmere', scope: 'party',
    entries: [{ node: 'moon' }],
    nodes: {
      moon: { speaker: 'narrator', text: 'Duskmere, in the long dusk that never quite becomes night. Somewhere very far away a bell rings once, and the moon over the city ripples, as if someone had dropped a stone into a pond.', next: 'jars' },
      jars: { speaker: 'narrator', text: 'In every window in the street, in every bottle on every sill, the bottled shadows turn round all at once to face the Moon Obelisk. And in your chest, something you did not know was there turns with them, and begins to sing.', next: null },
    },
  },
  {
    id: 'dialogue:obj-dusk-shadow-jar-1', name: 'I-1 a bottled shadow',
    entries: [{ when: { questStage: 'quest:duskweaver-the-bell-at-dusk', stage: 'jars' }, node: 'weave' }, { node: 'jar' }],
    nodes: {
      weave: { speaker: 'narrator', text: 'A shadow in a green bottle on a sill: somebody’s grandmother, by the shape of the shawl, pressed flat against the glass towards the Obelisk. You draw a thread of dusk round the bottle the way you were taught, gently, and she turns back to face her own kitchen.', next: null },
      jar: { speaker: 'narrator', text: 'A bottled shadow on a windowsill, facing the room, the way a shadow should.', next: null },
    },
  },
  {
    id: 'dialogue:duskweaver-nyx-bell', name: 'I-1 Nyx in the street', scope: 'party',
    entries: [{ when: KNOWS, node: 'start_t' }, { node: 'start' }],
    nodes: {
      start: { speaker: NX, text: 'Marguerite! No. Tobias? No, no, Tobias was taller. Oh, forgive me, dear, I’ve come out in my nightgown and I’ve brought the wrong candle and I can’t for the life of me remember your name. But I know your face. You’re one of mine.', next: 'glow' },
      start_t: { speaker: NX, text: '{player.name}! There you are. I’ve come out in my nightgown and I’ve brought the wrong candle. But I knew your face before I knew anything else.', next: 'glow' },
      glow: {
        speaker: NX, text: 'And you’re glowing, which is new. Is that the song? I can hear it from here. The whole street can hear it. The shadows certainly can.',
        choices: [
          { text: 'Something in my chest is singing, Loremistress.', to: 'stone' },
          { text: 'Do I know you?', to: 'know' },
        ],
      },
      know: { speaker: NX, mood: 'happy', text: 'Of course you do, dear! I taught you your letters. Loremistress Nyx Aubade, Keeper of the Moon Obelisk, forgetter of everyone’s name. You’ll get used to it. Everyone does, eventually, and then I forget that they have.', next: 'stone' },
      stone: {
        speaker: NX, text: 'That song is half of the Umbral Stone. The Obelisk half. It has lain in the Obelisk’s shadow for thirty years, and the Obelisk has been leaking ever since, like a bucket with no bottom, and now it has woken up for you. Of all people. Well! Not of all people. I’m sure you’re lovely.',
        choices: [
          { text: 'What do I do?', to: 'do' },
          { text: 'The shadows are all facing the Obelisk. Is it calling them?', to: 'calling', school: 'umbral', trust: 1 },
        ],
      },
      calling: { speaker: NX, text: 'Calling them home, I think. Shadows are memories the light left behind, and the Obelisk is where memories go. If it calls loudly enough they’ll all go, and then we shan’t know who anyone is. Even less than now.', next: 'do' },
      do: { speaker: NX, text: 'Tonight, come in and have some cocoa. In the morning, which here means rather later this evening, I’ll give you a stick of chalk and a list. It will be the right list. I’m nearly certain.', next: null },
    },
  },
  // ---------- I-2 Chalk the Doors
  {
    id: 'dialogue:obj-umbral-door-1', name: 'I-2 the first door',
    entries: [{ when: { questStage: 'quest:duskweaver-chalk-the-doors', stage: 'doors' }, node: 'chalk' }, { node: 'door' }],
    nodes: {
      chalk: { speaker: 'narrator', text: 'A green door with a puddle of black tears on its step, round and still as a little moon. A family of four is standing on the pavement looking at it politely, as if it might be someone else’s. You chalk their used name over the knocker: PARTRIDGE. The father says, “Oh! Of course,” and goes in.', next: null },
      door: { speaker: 'narrator', text: 'A green door with PARTRIDGE chalked over the knocker, a little smudged where somebody has checked it with a thumb.', next: null },
    },
  },
  {
    id: 'dialogue:duskweaver-nyx-doors', name: 'I-2 report on the doors', scope: 'party',
    entries: [{ when: KNOWS, node: 'start_t' }, { node: 'start' }],
    nodes: {
      start: { speaker: NX, text: 'Philippa! You’re back. No, don’t tell me, it isn’t Philippa. It’s on the tip of my tongue, and the tip of my tongue is a very crowded place. All five doors?', next: 'doors' },
      start_t: { speaker: NX, text: '{player.name}, you’re back. All five doors?', next: 'doors' },
      doors: {
        speaker: NX, text: 'And the black on the doorsteps. You saw it?',
        choices: [
          { text: 'Black tears, on every step. And the doors’ shadows had walked off.', to: 'tears' },
          { text: 'They looked like little moons.', to: 'moons', trust: 1 },
        ],
      },
      moons: { speaker: NX, mood: 'sad', text: 'Little moons. Yes. That’s exactly what they look like. You have a Keeper’s eye. I shall write that down, and then I shall know it.', next: 'tears' },
      tears: { speaker: NX, text: 'The tears are coming out of the Obelisk, I think. Out of all the memories it can’t hold any more. And now somebody is cutting flowers in the Memory Gardens, and people are waking up not knowing their own children. Marigold Thrupp sent word. Will you go?', next: null },
    },
  },
  // ---------- I-3 The Flower Thieves
  {
    id: 'dialogue:duskweaver-marigold-thieves', name: 'I-3 Marigold at the Gardens gate', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: MT, text: 'Nyx sent you? Good. I’ve been up every night for a week with a rake across my knees. Somebody’s cutting the memory-flowers. Clean cuts, sickle cuts, right at the root.', next: 'what' },
      what: {
        speaker: MT, text: 'And every flower they take, somebody in the city wakes up without it. Old Dunstan woke up this morning and asked his daughter who she was. She’s forty. She cried all the way here.',
        choices: [
          { text: 'Who would steal memories?', to: 'who' },
          { text: 'Show me the beds.', to: 'beds', quest: true },
        ],
      },
      who: { speaker: MT, mood: 'angry', text: 'The Duskblade Cult. Sells stolen pasts to people who’d rather have someone else’s. I’ve seen their mark on the wall by the old temple, the one nobody remembers building. Follow the cuttings.', next: 'beds' },
      beds: { speaker: MT, text: 'Mind where you put your feet. Every one of those flowers is somebody.', next: null },
    },
  },
  {
    id: 'dialogue:obj-cut-memory-bed-1', name: 'I-3 a cut bed',
    entries: [{ when: { questStage: 'quest:duskweaver-the-flower-thieves', stage: 'beds' }, node: 'cut' }, { node: 'bed' }],
    nodes: {
      cut: { speaker: 'narrator', text: 'A bed of pale memory-flowers with a row of clean stumps along the front, each still weeping a bead of black. On the gravel, a dropped petal: when you touch it you see, for one second, a little girl being lifted onto someone’s shoulders. Then it is only a petal.', next: null },
      bed: { speaker: 'narrator', text: 'A bed of memory-flowers, the cut stumps putting out new leaves.', next: null },
    },
  },
  {
    id: 'dialogue:obj-cult-stolen-pasts', name: 'I-3 the stolen pasts', scope: 'party',
    entries: [{ when: { questStage: 'quest:duskweaver-the-flower-thieves', stage: 'pasts' }, node: 'crates' }, { node: 'empty' }],
    nodes: {
      crates: { speaker: 'narrator', text: 'Crates of cut flowers, each wrapped in tissue and priced in a florist’s round hand: “First kiss, very good, 40 shards.” “Mother’s voice, slightly worn, 12.” “Being brave once, 90.” You gather every one of them up.', next: null },
      empty: { speaker: 'narrator', text: 'Empty crates, with price tags still tied to nothing.', next: null },
    },
  },
  {
    id: 'dialogue:duskweaver-marigold-return', name: 'I-3 the pasts come home', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: MT, mood: 'happy', text: 'All of them? Oh, you lovely thing. They’ll take, if I get them in tonight. Old Dunstan’s daughter is going to get her father back by breakfast. (She is already kneeling, already digging.)',
        choices: [{ text: 'Can I help?', to: 'help', trust: 1 }, { text: 'I’ll leave you to it.', to: 'vane' }],
      },
      help: { speaker: MT, text: 'You can hold the lantern. That’s helping. Gardeners don’t need help, mostly. They need someone to talk at.', next: 'vane' },
      vane: { speaker: MT, text: 'And there’s a Keeper’s pigeon been round for you twice. The Mnemosarch wants to meet you. Gave me a cup of tea once, when I lost my husband. Very kind man. Very tidy.', next: null },
    },
  },
  // ---------- I-4 The Mnemosarch's Queue
  {
    id: 'dialogue:duskweaver-vane-queue', name: 'I-4 meeting Oriel Vane', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'At the head of the long queue in Obelisk Plaza, a desk with a teapot on it, and behind the desk a slim man in a Keeper’s coat with ink on his fingers, pouring. The queue goes back across the Plaza and out of sight. Nobody in it is impatient.', next: 'vane' },
      vane: {
        speaker: OV, mood: 'happy', text: '{player.name}. Sit down, please. Milk? You cleared the Cult out of the Gardens. I wanted to thank you myself. Every flower you brought back is a person who would otherwise be standing in my queue.',
        choices: [
          { text: 'You know my name.', to: 'name' },
          { text: 'What is the queue for?', to: 'queue' },
        ],
      },
      name: { speaker: OV, text: 'Of course I do. I know everyone’s. Somebody in Duskmere has to. (He smiles.) Nyx still calls you something else, I expect. She’s a dear. She’s also the reason I have so much work.', next: 'queue' },
      queue: { speaker: OV, text: 'These are the people who have forgotten something, and come to have it back. I find it in the Obelisk, and copy it out, and hand it to them in a little glass phial. Some of them have waited years. None of them mind. It’s a very nice queue.', next: 'keep' },
      keep: {
        speaker: OV, text: 'Help me this morning? Hand back the first few phials. And if you would help me with the bigger work, later, I would be grateful. I want to keep everything, {player.name}. Every single thing. Nothing should be lost that anyone ever loved.',
        choices: [
          { text: 'I’ll help with the queue.', to: 'end', quest: true },
          { text: 'Some things want losing.', to: 'losing', quest: true },
        ],
      },
      losing: { speaker: OV, mood: 'sad', text: 'Do they? I’ve never met one. Everything I have ever kept has been glad of it. (He hands you a tray of phials, each one labelled.) The first three in line. Thank you.', next: null },
      end: { speaker: OV, text: 'Thank you. The first three in line. Mind the labels.', next: null },
    },
  },
  {
    id: 'dialogue:obj-obelisk-queue-1', name: 'I-4 the first in the queue', scope: 'party',
    entries: [{ when: { questStage: 'quest:duskweaver-the-mnemosarchs-queue', stage: 'phials' }, node: 'phial' }, { node: 'queue' }],
    nodes: {
      phial: {
        speaker: 'narrator', text: 'An old man at the front of the queue, who has waited four years for his wedding day. He uncorks the phial and breathes it in and smiles all over his face. “It’s exactly right. Every bit of it.” Then, puzzled: “It smelled of lilac. Why doesn’t it smell of lilac?”',
        choices: [
          { text: '(Breathe in over the phial yourself.)', to: 'smell', insight: 'duskweaver_no_smell' },
          { text: 'Perhaps you’ve forgotten the smell.', to: 'forgot' },
        ],
      },
      smell: { speaker: 'narrator', text: 'Nothing. Not lilac, not glass, not even the dusty smell of the Obelisk. The memory is all there, bright and whole, and it smells of nothing at all, like a picture of a flower.', next: null },
      forgot: { speaker: 'narrator', text: '“Perhaps,” he says, and smiles again, and walks away holding the phial against his chest, sniffing at it every few steps.', next: null },
      queue: { speaker: 'narrator', text: 'The queue in Obelisk Plaza, very long and very patient.', next: null },
    },
  },
  // ---------- I-5 The Mourners' Petition (faction choice; a party vote)
  {
    id: 'dialogue:duskweaver-mourners-petition', name: 'I-5 the mourners’ petition', scope: 'party',
    entries: [{ when: { not: { flag: 'duskweaver.mourners' } }, node: 'plaza' }, { node: 'after' }],
    nodes: {
      plaza: { speaker: 'narrator', text: 'Two hundred people in black in Obelisk Plaza, and at their head a small woman holding a roll of paper as long as she is. Nyx is on the Obelisk steps in her best coat. Vane stands beside her with his teapot. In a shadow by the wall, very still, a Veil smuggler is listening.', next: 'rosamund' },
      rosamund: { speaker: RH, text: 'Loremistress. Mnemosarch. We lost our people on the night of the Hollowing, every one of us. We have remembered it every day for thirty years. We are asking you to let us forget that night. Only that night. We’ll keep the rest.', next: 'vane' },
      vane: { speaker: OV, mood: 'sad', text: 'Nothing kept may be unkept. That is the Keepers’ oldest law. I am so sorry for your loss, Mistress Hesketh. I am keeping it for you. That is the kindest thing I know how to do.', next: 'nyx' },
      nyx: { speaker: NX, text: 'And I can’t remember what the law is for, which is a terrible thing to say on the Obelisk steps. (She looks at you.) You decide, dear. You’re the one the stone sang for.', next: 'voices' },
      voices: {
        speaker: 'narrator', text: 'Two hundred faces turn to you. In the shadow by the wall the Veil smuggler has not moved. At the back of the crowd Marigold Thrupp is standing with her rake, as if she had come straight from a bed.',
        choices: [
          { text: '(Ask Marigold what the Gardens would do with them.)', to: 'marigold', when: { flag: 'duskweaver.marigold_asked' } },
          { text: '(Look at the Veil smuggler.)', to: 'veil' },
          { text: '(Answer.)', to: 'choose' },
        ],
      },
      marigold: { speaker: MT, text: '(Loud enough for the Plaza.) I’ll say what I told you. Griefs grow, if you plant them. They don’t go away. They just stop being heavy. I’ve a bed under the yew that wants filling. That’s all.', next: 'choose' },
      veil: { speaker: 'narrator', text: 'The Veil smuggler lifts an empty sack very slightly, the way a ferryman lifts an oar to show he is for hire. Then lowers it again, and waits, as patient as water.', next: 'choose' },
      choose: {
        speaker: RH, text: 'Well, Keeper?',
        choices: [
          { text: 'Keep them. Nothing kept may be unkept. Grief is how you remember who you loved.', to: 'kept', quest: true, effects: [{ setFlag: 'duskweaver.mourners', value: 'kept' }] },
          { text: 'Let them go. Give the griefs to the Veil, and let the Moonwell drown them.', to: 'released', quest: true, trustNpc: NX, trust: -1, effects: [{ setFlag: 'duskweaver.mourners', value: 'released' }] },
          { text: 'Give them a rest. Plant the griefs in the Gardens, where they can be visited but not carried.', to: 'rest', quest: true, insight: 'duskweaver_planted_rest', when: { insight: 'duskweaver_rest_page' }, effects: [{ setFlag: 'duskweaver.mourners', value: 'rest' }] },
        ],
      },
      kept: { speaker: OV, mood: 'happy', text: 'Kept. Thank you. (Above him the Obelisk brightens a shade, as if it had taken a breath.) Come to the desk, all of you, any time, and I’ll pour you some tea. (In the Plaza, two hundred people weep, and do not go home.)', next: null },
      released: { speaker: 'narrator', text: 'The Veil smuggler steps out of the shadow and holds out a sack. One by one the mourners give their grief to it, and walk home lighter, and do not look back. Three streets over, by morning, nobody can remember your name either. Nyx looks at you for a long time.', next: null },
      rest: { speaker: NX, mood: 'happy', text: 'A rest! The first page! Oh, I remember! The first Keepers left a rest in the record. A bed in the Gardens for what you let go, where you can visit it and not have to carry it home. (Beside her, Vane has gone very still, with the teapot in mid-air.)', next: null },
      after: { speaker: RH, text: 'It’s decided. Thank you for deciding. That was the hardest part. It always is.', next: null },
    },
  },
  {
    id: 'dialogue:obj-rest-bed-planting', name: 'I-5 planting the Rest', scope: 'party',
    entries: [{ when: { questStage: 'quest:duskweaver-the-mourners-petition', stage: 'rest' }, node: 'plant' }, { node: 'bed' }],
    nodes: {
      plant: { speaker: 'narrator', text: 'A new bed in the Memory Gardens, under the yew, edged with white stones. Two hundred griefs go into it, each one a grey seed in a mourner’s hand. When the last is in, the mourners stand round it for a while. Then they go home, and some of them stop on the way to look back.', next: null },
      bed: { speaker: 'narrator', text: 'The Rest: a bed under the yew in the Memory Gardens, grey-flowered and quiet. There is always somebody sitting on the bench beside it.', next: null },
    },
  },
  // ---------- I-6 The Hall of Lost Names
  {
    id: 'dialogue:duskweaver-nyx-hall', name: 'I-6 Nyx at the Hall of Lost Names', scope: 'party',
    entries: [{ when: KNOWS, node: 'start_t' }, { node: 'start' }],
    nodes: {
      start: { speaker: NX, text: 'Rupert! Here! No, not Rupert. I sent the Keeper running for whoever you are, and here you are, so it worked. Listen.', next: 'why' },
      start_t: { speaker: NX, text: '{player.name}, here. Listen.', next: 'why' },
      why: {
        speaker: NX, text: 'The forgotten have come to collect.',
        choices: [
          { text: 'Collect what?', to: 'what' },
        ],
      },
      what: {
        speaker: NX, mood: 'afraid', text: 'The Hall of Lost Names is where we paper up the names nobody says any more, so they’re somewhere. Something in there has woken up. Something made of all of them.',
        choices: [
          { text: 'Why now?', to: 'kept', when: { flag: 'duskweaver.mourners', value: 'kept' } },
          { text: 'Why now?', to: 'released', when: { flag: 'duskweaver.mourners', value: 'released' } },
          { text: 'Why now?', to: 'rest', when: { flag: 'duskweaver.mourners', value: 'rest' } },
        ],
      },
      kept: { speaker: NX, text: 'Because the Obelisk is full. We kept two hundred more griefs in it, and it has nowhere to put them, so it is spilling the oldest things out of the bottom. The forgotten are the bottom.', next: 'go' },
      released: { speaker: NX, text: 'Because the Moonwell would not drown them. The griefs we gave the Veil have come washing back up the warrens and into the Hall, and they have woken everything in it.', next: 'go' },
      rest: { speaker: NX, text: 'Because it heard about the Rest. The forgotten want to be let in. They’re asking. Very loudly. With all their mouths at once.', next: 'go' },
      go: { speaker: NX, text: 'When it forgets you, and it will, read the names off the walls aloud. Every name. It turns to look when it hears one of its own.', next: null },
    },
  },
  {
    id: 'dialogue:obj-last-name-paper', name: 'I-6 the last name-paper', scope: 'party',
    entries: [{ when: { questStage: 'quest:duskweaver-the-hall-of-lost-names', stage: 'paper' }, node: 'paper' }, { node: 'wall' }],
    nodes: {
      paper: { speaker: 'narrator', text: 'One name-paper, still fluttering on the floor where the creature fell. The name on it has gone blank. But in the corner, very small, in neat Keeper’s ink, there is a catalogue mark: Archive, east stacks, shelf the fourteenth. O. V.', next: 'mark' },
      mark: { speaker: 'narrator', text: 'There is no fourteenth shelf in the east stacks. Everybody knows that. You have been in the Archive a hundred times.', next: null },
      wall: { speaker: 'narrator', text: 'Walls papered with names, some of them blank now, some of them still being read by somebody.', next: null },
    },
  },
  // ---------- I-7 What the Mnemosarch Kept
  {
    id: 'dialogue:obj-archive-spilling-shelf', name: 'I-7 the fourteenth shelf', scope: 'party',
    entries: [{ when: { questStage: 'quest:duskweaver-what-the-mnemosarch-kept', stage: 'shelves' }, node: 'shelf' }, { node: 'door' }],
    nodes: {
      shelf: { speaker: 'narrator', text: 'Behind the thirteenth shelf of the east stacks, where the bottled shadows have spilled across the floor like spilt ink, there is a fourteenth. It swings when you lean on it. Beyond it is a long, dark room, and in the room, lit by a single lamp, is Duskmere.', next: null },
      door: { speaker: 'narrator', text: 'The fourteenth shelf, standing open on its hinge.', next: null },
    },
  },
  {
    id: 'dialogue:duskweaver-vane-model', name: 'I-7 the shadow city', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'The whole city, in shadow, on a table forty feet long: every street of the Lanternless Streets, every bed in the Gardens, the Obelisk in the middle, a little taller than you. In the windows there are tiny moving figures. In one window, very small, Old Dunstan is lifting his daughter onto his shoulders.', next: 'vane' },
      vane: {
        speaker: OV, text: '{player.name}. Mind the Plaza; the paint’s wet. (He puts his brush down.) I hoped you’d find it. I couldn’t show you. Showing it would have been like boasting, and it isn’t mine to boast about. It’s everyone’s.',
        choices: [
          { text: 'These are the queue’s memories.', to: 'queue' },
          { text: 'The memories you hand back have no smell.', to: 'copies', insight: 'duskweaver_copies', when: { any: [{ insight: 'duskweaver_no_smell' }, { flag: 'duskweaver.linnet_found' }] } },
        ],
      },
      copies: { speaker: OV, mood: 'sad', text: 'You noticed. Nobody notices. They’re perfect copies, every line of them, but you can’t copy a smell. (He touches a tiny lilac bush in a tiny garden.) The originals are here. Safe. Where nothing can leak them away.', next: 'queue' },
      queue: { speaker: OV, text: 'Every memory anyone ever brought me. Every name, every wedding, every first step. Duskmere is forgetting itself, {player.name}. So I am remembering it for it. All of it. In one place, where it can’t be lost.', next: 'stone' },
      stone: {
        speaker: OV, text: 'And the Obelisk half has woken. Set it in my head, and I can hold the whole of Nocturne for ever. Nothing anyone has ever known will be lost again. Isn’t that the kindest thing in the world?',
        choices: [
          { text: 'They’re not yours to keep.', to: 'theirs' },
          { text: 'A memory you can’t lose isn’t a memory. It’s a cage.', to: 'cage', school: 'umbral' },
          { text: 'You gave Linnet Dray’s name a shelf.', to: 'linnet', when: { flag: 'duskweaver.linnet_found' } },
        ],
      },
      theirs: { speaker: OV, text: 'Nobody else is keeping them. That’s the point. (He picks up his brush again.) I’m going round to the Obelisk’s shadow now, to fetch the stone. I’d rather you brought it. I won’t mind if you don’t.', next: null },
      cage: { speaker: OV, mood: 'sad', text: 'Then it is a very kind cage, and everybody is in it together, and nobody is ever left outside. I’m going round to the Obelisk’s shadow now, to fetch the stone. I’d rather you brought it.', next: null },
      linnet: { speaker: OV, text: 'I was keeping it safe. She’d have lost it in a week. (He doesn’t look up.) I’m going round to the Obelisk’s shadow now, to fetch the stone. I’d rather you brought it.', next: null },
    },
  },
  // ---------- I-8 The Obelisk's Shadow
  {
    id: 'dialogue:obj-umbral-capital-halfstone', name: 'I-8 the Obelisk half', scope: 'party',
    entries: [{ when: { questStage: 'quest:duskweaver-the-obelisks-shadow', stage: 'stone' }, node: 'claim' }, { node: 'shadow' }],
    nodes: {
      claim: { speaker: 'narrator', text: 'At the Obelisk’s foot, in the one shadow the moon has never seen, lies half of a crystal, cracked clean across, singing. Vane is on one knee at the edge of the shadow, his coat cracked and dripping, his shadow city in his arms, watching you.', next: 'reach' },
      reach: {
        speaker: 'narrator', text: 'The moment you touch it, you will remember. That is what the Obelisk half does. Everything. You can feel it waiting, like a held breath.',
        choices: [
          { text: '(Take it.)', to: 'take' },
          { text: '(Weave a thread of dusk round your hand first, to let some of it go.)', to: 'weave', school: 'umbral' },
          { text: '(Ask Vane what he would have kept.)', to: 'ask' },
        ],
      },
      ask: { speaker: OV, mood: 'sad', text: 'Everything. Every face. My mother’s, which I lost when I was six, and found years later in a phial in the queue, and kept the original, because I could not bear to give it back. (He holds the model closer.) Everything, {player.name}.', next: 'take' },
      weave: { speaker: 'narrator', text: 'You wind a thread of dusk round your fingers the way Nyx taught you, a little loose, so things can slip through. Then you take the stone.', next: 'take' },
      take: { speaker: 'narrator', text: 'It comes up into your hand cool and light, and for a moment you remember everything you ever forgot, all at once: a song, a smell of rain, a room you lived in when you were two. Then you let most of it go again. It feels like holding someone’s hand.', next: 'keep' },
      keep: {
        speaker: 'narrator', text: 'One memory stays. You can choose which.',
        choices: [
          { text: '(The song.)', to: 'song', effects: [{ setFlag: 'duskweaver.kept_memory', value: 'song' }] },
          { text: '(The room.)', to: 'room', effects: [{ setFlag: 'duskweaver.kept_memory', value: 'room' }] },
          { text: '(None of them. Let them all go.)', to: 'none', effects: [{ setFlag: 'duskweaver.kept_memory', value: 'none' }] },
        ],
      },
      song: { speaker: 'narrator', text: 'A lullaby, in a voice you will not hear again. You keep it. You find you have been humming it under your breath for years without knowing where it came from.', next: 'vane' },
      room: { speaker: 'narrator', text: 'A small room with a blue door and a window the moon came in at. You keep it. It is the first room you ever knew, and now you know it again.', next: 'vane' },
      none: { speaker: 'narrator', text: 'You let them all go, gently, like opening your hand under water. It does not hurt. It is the lightest you have ever felt. Vane watches you do it with an expression you will remember for a long time.', next: 'vane' },
      vane: { speaker: OV, mood: 'sad', text: '(From the dark, quite calm.) Keep it for me, then. I’ll keep the rest. (He comes out of the shadow with his whole shadow city tucked under one arm, like a dolls’ house, and walks away into the dark towards the Dusk Gate without hurrying.)', next: null },
      shadow: { speaker: 'narrator', text: 'The Obelisk’s far side, in a shadow the moon has never looked at, with a small clean patch on the ground where something lay.', next: null },
    },
  },
  // ---------- I-9 The Long Dusk Road (mentor farewell; trust check)
  {
    id: 'dialogue:duskweaver-nyx-farewell', name: 'I-9 Nyx’s farewell', scope: 'party',
    entries: [{ when: KNOWS, node: 'start_t' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: NX, text: 'Hortensia, I’ve brought you a candle. You don’t need a candle. I don’t know why I brought it. I think I wanted something to hold.',
        choices: [
          { text: 'Come with me, Loremistress.', to: 'stay' },
          { text: 'Thank you. For everything you remember of me.', to: 'gifts', trust: 1 },
        ],
      },
      start_t: {
        speaker: NX, text: '{player.name}. I’ve brought you a candle. You don’t need a candle. I think I wanted something to hold.',
        choices: [
          { text: 'Come with me, Loremistress.', to: 'stay' },
          { text: 'Thank you. For everything you remember of me.', to: 'gifts' },
        ],
      },
      stay: { speaker: NX, text: 'I’d forget where we were going by the gate. No. Somebody has to keep the Obelisk from leaking, and I am, despite everything, very good at it. I just can’t remember how.', next: 'gifts' },
      gifts: {
        speaker: NX, text: 'Wait. Wait. Let me look at you properly.',
        choices: [
          { text: '(Stand still and let her look.)', to: 'right', when: { trust: NX, value: 'friendly' } },
          { text: '(Take her hand.)', to: 'hand', when: { not: { trust: NX, value: 'friendly' } } },
        ],
      },
      right: { speaker: NX, mood: 'happy', text: '{player.name}. (She says it slowly, like someone setting down something full to the brim.) There. I got it right. Once, at least, I got it right, and you heard me. Take these. My moon-spectacles, on their pendant. They show you what a thing was. I don’t need them; I never know what anything is.', effects: [{ giveItem: 'i_nyx_spectacles' }, { setFlag: 'duskweaver.nyx_spectacles', value: true }], next: 'kept' },
      kept: {
        speaker: NX, text: 'And one more thing, if you’ll carry it.',
        choices: [
          { text: '(Wait.)', to: 'name', when: { trust: NX, value: 'trusted' } },
          { text: '(Kiss her cheek, and go.)', to: 'end', when: { not: { trust: NX, value: 'trusted' } } },
        ],
      },
      name: { speaker: NX, mood: 'sad', text: '(She leans close and whispers, so that not even the shadows hear.) Halcyon. That’s my kept name. Nobody has heard it since my mother died. Carry it for me. If I forget it, you’ll still have it, and that will be almost as good. (She folds a slip into a silver locket and closes your hand on it.)', effects: [{ setFlag: 'duskweaver.nyx_name', value: true }, { giveItem: 'i_nyx_kept_name' }], next: 'end' },
      hand: { speaker: NX, text: 'Mind the gate, dear. Mind the Queen. Mind that you come back and tell me who you are.', next: null },
      end: { speaker: NX, text: 'Go on, before I forget why I’m crying. It’ll come back to me. Everything does, in the end, except the things that don’t.', next: null },
    },
  },
  // ---------- I-10 The Dusk Gate
  {
    id: 'dialogue:duskweaver-eclipse-queen', name: 'I-10 the Eclipse Queen', scope: 'party',
    entries: [{ node: 'queen' }],
    nodes: {
      queen: { speaker: 'narrator', text: 'The Eclipse Queen sits on the Dusk Gate with the moon half swallowed in her mouth, a vast dark disc rimmed with silver. Black tears pour from the rim like a waterfall made of night.', next: 'speak' },
      speak: {
        speaker: 'narrator', text: 'Her voice comes from the whole sky: Every night it shines, Duskweaver, the moon shows them something else they’ve lost. If I swallow it, there will be nothing left to forget. Isn’t that the kindest thing in the world?',
        choices: [
          { text: 'I’ve heard that before. From Vane.', to: 'vane' },
          { text: '(Weave her a memory of the moon.)', to: 'weave', school: 'umbral' },
        ],
      },
      vane: { speaker: 'narrator', text: 'Then he was right, she says, and the moon goes further into the dark.', next: null },
      weave: { speaker: 'narrator', text: 'You pull a thread of dusk out of the air and spin into it the first moonrise anyone in Nocturne remembers. The Queen flinches, as if you had shone it in her eyes. A sliver of silver slips back out between her teeth.', next: null },
    },
  },
  // ---------- I-6 the fight's set piece (ARENA_HAZARDS §5): from phase 2 the Unremembered forgets the hero and can't be
  // struck until duskweaver.names_read: read any wall of names aloud and it turns, and looks, and is there again
  ...([
    ['Ines Drabble, who kept bees. Tomas Breck, ferryman, forty years. Little Merrit, who was always late.', 'Little Merrit'],
    ['Mistress Ottery, who sang flat and did not care. Quennel, who carved the Hall’s doors. Bet, who carved his initials in them.', 'Bet'],
    ['The lamplighter of the Ninth Street, name unknown, who never missed a lamp. A girl in a red hood, who waved at everyone. A dog called Captain.', 'Captain'],
  ] as const).map(([names, last], i): DialogueDef => ({
    id: `dialogue:obj-duskweaver-name-wall-${i + 1}`, name: `I-6 the Hall of Lost Names: wall ${i + 1}`, scope: 'party',
    entries: [{ when: { questStage: 'quest:duskweaver-the-hall-of-lost-names', stage: 'unremembered' }, node: 'read' }, { node: 'plain' }],
    nodes: {
      read: { speaker: 'narrator', text: `You read them aloud, as loud as you can, over the creature’s thousand whispering faces. ${names}`, next: 'turn' },
      turn: {
        speaker: 'narrator', text: `At “${last}” the Unremembered stops. Slowly, all its faces turn towards you, as if it had dropped something and only now heard it land. It knows you are here.`,
        effects: [{ setFlag: 'duskweaver.names_read', value: true }], next: null,
      },
      plain: { speaker: 'narrator', text: `A wall papered with names. Some of them are still legible. ${names}`, next: null },
    },
  })),
];

export default dialogues;
