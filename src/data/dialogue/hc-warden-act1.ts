/** Hollow Crown, WARDEN Act I main dialogues (the Wardwall). Owner: Claude 4. */
import type { DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const DO = 'npc:dagny-orr' as const, TV = 'npc:torvald-wallbreaker' as const;

const dialogues: DialogueDef[] = [
  // ---------- I-1 The Horn at Midnight
  {
    id: 'dialogue:warden-horn-night', name: 'I-1 the horn at midnight', scope: 'party',
    entries: [{ node: 'watch' }],
    nodes: {
      watch: { speaker: 'narrator', text: 'Midnight on the Wardwall Gatehouse. Snow, wind, the watch-fires burning along the Rampart into the dark. Somewhere very far away, a bell rings once.', next: 'dagny' },
      dagny: { speaker: DO, mood: 'angry', text: '(From the Captain’s window, at enormous volume.) HORN! That’s a HORN! Who’s blowing a horn? EVERYBODY UP! SHIELDS! I don’t care what you’re wearing!', next: 'wolves' },
      wolves: { speaker: 'narrator', text: 'Forty Wardens tumble into the drill yard in their nightshirts, shields up, shouting. And as if the Captain had summoned them, Snow Wolves come pouring over the drifts.', next: null },
    },
  },
  {
    id: 'dialogue:warden-wall-song', name: 'I-1 the song past the Breach', scope: 'party',
    entries: [{ node: 'song' }],
    nodes: {
      song: { speaker: 'narrator', text: 'The last wolf runs. In the quiet after, under your ribs, something has started to sing: low, steady, patient, the way a wall would sing if walls did.', next: 'breach' },
      breach: { speaker: 'narrator', text: 'It is coming from the north, from out past the Breach, where the wall was broken last winter and patched with ice. Nobody else in the yard so much as turns their head.', next: null },
    },
  },
  {
    id: 'dialogue:warden-dagny-horn', name: 'I-1 Dagny after the wolves', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: DO, text: 'Held! In our nightshirts! Good. Who blew that horn? I want a name, and then I want to shake their hand, and then I want them on latrines.',
        choices: [
          { text: 'It wasn’t a horn, Captain. It was a bell.', to: 'bell' },
          { text: 'Something is singing in my chest. Out past the Breach.', to: 'sing' },
        ],
      },
      bell: { speaker: DO, text: 'A WHAT? A bell. No bells on this wall. Well, whatever it was, it got us up, and the wolves came, so it was a good horn. What’s that face?', next: 'sing' },
      sing: {
        speaker: DO, text: 'Singing. From the Breach. (She stops shouting, which is so rare that two Wardens nearby stop and stare.) There’s a story the old Wardens told, that half the Rime Stone fell into the Wall the night the crown broke. I never believed it. You’re glowing, pup.',
        choices: [
          { text: 'What do I do?', to: 'do', trust: 1 },
          { text: 'Can you hear it?', to: 'hear' },
        ],
      },
      hear: { speaker: DO, text: 'Pup, I can’t hear YOU. No. It’s yours. Keep it close.', next: 'do' },
      do: { speaker: DO, text: 'You do your job, is what you do. And the first job after a fight is a head count. I make it thirty-seven in this yard. There should be forty. Find me my three, pup, and bring the number up to my quarters. Speak UP.', next: null },
    },
  },
  // ---------- I-2 The Watch-Fires
  {
    id: 'dialogue:obj-watch-fire-1', name: 'I-2 the first drowned fire',
    entries: [{ when: stage('quest:warden-the-watch-fires', 'fires'), node: 'drowned' }, { node: 'fire' }],
    nodes: {
      drowned: { speaker: 'narrator', text: 'The first watch-fire is out. Not burned out: drowned. The brazier is brimming with black water that has come up through the stones of the wall, the way damp comes up a cellar wall, and the coals are sitting in it, sulking.', next: null },
      fire: { speaker: 'narrator', text: 'A watch-fire on the Long Rampart, burning, for now.', next: null },
    },
  },
  {
    id: 'dialogue:obj-watch-fire-6', name: 'I-2 the children at the last fire', scope: 'party',
    entries: [{ when: stage('quest:warden-the-watch-fires', 'fires'), node: 'children' }, { node: 'fire' }],
    nodes: {
      children: {
        speaker: 'narrator', text: 'At the sixth fire you look down over the parapet, and on the far side of the wall, in the snow, there are children. Five of them, in clan furs, very small. One of them waves. Another calls up: is there any bread?',
        choices: [
          { text: '(Drop them your rations.)', to: 'bread', effects: [{ setFlag: 'warden.bread_thrown', value: true }] },
          { text: '(Tell them to go home.)', to: 'home' },
        ],
      },
      bread: { speaker: 'narrator', text: 'Your bread and cheese go over the parapet in a cloth. The smallest one catches it, and they all run, shrieking, back into the dark of the Jarlsfell. Nobody on the wall saw. You think.', next: null },
      home: { speaker: 'narrator', text: 'One of them shouts that this is home, and they all wander off into the snow, not far, looking back.', next: null },
      fire: { speaker: 'narrator', text: 'The last watch-fire on this stretch of the Rampart, and beyond it, the whole dark Jarlsfell.', next: null },
    },
  },
  {
    id: 'dialogue:warden-dagny-fires', name: 'I-2 report on the fires', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: DO, text: 'Drowned? Fires don’t DROWN. (You explain. She listens with her good ear.) Black tears. Coming up through the wall. Our wall. Well. That’s not on the duty roster.',
        choices: [
          { text: 'There were children at the last fire. Clan children. On the far side.', to: 'children' },
          { text: 'I gave them my rations.', to: 'bread', when: { flag: 'warden.bread_thrown' } },
          { text: 'The seep is worst at the Breach. The whole wall is weeping outward from the patch, mile by mile.', to: 'breach', when: { flag: 'warden.seep_traced' } },
        ],
      },
      breach: { speaker: DO, mood: 'afraid', text: 'From the Breach. (She says it quietly, which is worse than loud.) Then whatever came in through that hole last winter is still in the stones, and spreading. I’ll double the watch on the patch. Go on.', next: 'children' },
      bread: { speaker: DO, text: '(A long look.) I didn’t hear that. I am half deaf. Everybody knows I am half deaf. Don’t do it again where Kettil can see.', next: 'children' },
      children: {
        speaker: DO, mood: 'sad', text: 'There are always children on the far side. There are always children on the far side and there always will be, and the wall is still the wall. (She rubs her face.) And there are raiders.',
        choices: [{ text: 'Raiders?', to: 'raiders' }],
      },
      raiders: { speaker: DO, text: 'Somebody’s been taking our supply sledges. Three this month. Somebody over there is organised, and I want to know who. You’re going over the wall, pup. First time. Through the postern, down into the Jarlsfell. Don’t make friends.', next: null },
    },
  },
  // ---------- I-3 The Jarl's Longhall
  {
    id: 'dialogue:obj-jarl-mead-cauldron', name: 'I-3 the mead-cauldron', scope: 'party',
    entries: [{ when: stage('quest:warden-the-jarls-longhall', 'cauldron'), node: 'tip' }, { node: 'empty' }],
    nodes: {
      tip: { speaker: 'narrator', text: 'The great mead-cauldron in the middle of the longhall is black to the brim. A year of the Jarl’s tears dripped into it from his icicle beard, and his hall-folk, starving, have been bringing him food and drinking from it.', next: 'over' },
      over: { speaker: 'narrator', text: 'You set your shoulder to it and tip it over. Black runs across the floor and soaks into the rushes. A thin old man by the hearth watches it go, and then says, quite clearly, that he would like some soup.', next: null },
      empty: { speaker: 'narrator', text: 'An empty cauldron on its side, and a black stain in the rushes.', next: null },
    },
  },
  {
    id: 'dialogue:warden-dagny-jarl', name: 'I-3 the Jarl is down', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: DO, text: 'The Frostbound Jarl. Frozen to his own seat, and his people feeding him. (She is quiet a moment.) I knew him. Forty years ago he came to the postern for a treaty and I was the girl who held the door.',
        choices: [
          { text: 'They’re starving over there, Captain.', to: 'starving' },
          { text: 'Who leads the clans now?', to: 'who' },
        ],
      },
      starving: { speaker: DO, mood: 'sad', text: 'I know. I KNOW. Do you think I don’t look over? Every night. (Louder, as if she can drown it out.) The wall is for keeping the winter out. That’s all.', next: 'who' },
      who: { speaker: DO, text: 'The Jarl had a nephew. You know the one. He’ll come for the clans now there’s nobody else. He’ll come down the Wolfrun with a white flag and a sad face, and he’ll ask for something, and I’ll have to say no.', next: null },
    },
  },
  // ---------- I-4 The Wallbreaker's Parley
  {
    id: 'dialogue:warden-torvald-parley', name: 'I-4 Torvald under the parley-flag', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: TV, text: 'Look at you. Look at your feet. You’re still standing like I taught you, weight forward, toes in. (He laughs, and it turns into something else.) Hello, pup. I’m sorry. I don’t know which thing I’m sorry for first.',
        choices: [
          { text: 'You broke the wall, Torvald.', to: 'broke' },
          { text: 'What are you doing here?', to: 'here' },
          { text: '(Look at the parley-flag he’s carrying.)', to: 'flag', effects: [{ setFlag: 'warden.flag_seen', value: true }] },
        ],
      },
      flag: { speaker: 'narrator', text: 'A white parley-flag on an ash pole. There is no clan’s mark on it: no bear of the Jarlsfell, no hand of the Hekla steading. Only a crown, stitched in grey thread, with nothing inside it. He is not looking at it.', next: 'here' },
      broke: { speaker: TV, mood: 'sad', text: 'I did. Last winter. They were dying on the other side, and I had a hammer, and I was a Warden, and those two things weighed the same for about a minute. And the tears came in through the hole I made.', next: 'here' },
      here: {
        speaker: TV, text: 'My uncle’s dead. You saw to that, and thank you for it, he’d gone past saving. The clans need somebody. And they need grain. One sledge, pup. One. You know me. You know what’s out here.',
        choices: [
          { text: 'I’ll ask Dagny for your sledge.', to: 'ask', effects: [{ setFlag: 'warden.grain_asked', value: true }] },
          { text: 'You know the Captain’s answer.', to: 'answer' },
        ],
      },
      ask: { speaker: TV, mood: 'happy', text: 'That’s all I want. Ask her. Shout it, she’s deaf as a post. (He grips your shoulder.) Feet, pup. Don’t forget your feet.', next: 'look' },
      answer: { speaker: TV, text: 'I know her answer. I’ve known it thirty years. Ask her anyway. Shout it. She’s deaf as a post.', next: 'look' },
      look: { speaker: TV, text: 'But don’t take my word for it. The clans are camped in the fold below this cairn. Walk through. Look at the children. Then go and tell her what you saw, not what I said.', next: null },
    },
  },
  {
    id: 'dialogue:warden-dagny-parley', name: 'I-4 Dagny hears the parley', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: DO, text: 'WHAT did he want? A sledge? ONE sledge? (She turns away to the window.) One sledge. That’s how it starts. One sledge, then a cart, then a postern left unbolted, then a hole in the wall.',
        choices: [
          { text: 'They’re starving, Captain.', to: 'starving' },
          { text: 'You taught me the wall is for keeping the winter out. They aren’t winter.', to: 'winter', trust: 1 },
          { text: 'I walked through their camp. Nobody is flying a clan banner, Captain. Only his flag.', to: 'banners', when: { flag: 'warden.banners_furled' } },
        ],
      },
      banners: { speaker: DO, text: 'No banners? (She frowns, and for a moment she isn’t shouting at all.) A clan furls its banner for a funeral, or when it has given itself to somebody else. Whose camp is that, then, if it isn’t theirs?', next: 'moot' },
      starving: { speaker: DO, text: 'And there are four hundred Wardens on this wall who will starve with them if I give our stores away. Don’t think I haven’t done that sum. I’ve done it every night for thirty years.', next: 'moot' },
      winter: { speaker: DO, mood: 'sad', text: '(Very quietly, for her.) I did teach you that. Hm. I teach a lot of things. Not all of them stick to me.', next: 'moot' },
      moot: { speaker: DO, text: 'It isn’t mine to say alone. I’ll call a moot. Every Warden in the drill yard tomorrow night, and the question put fair: do we open the postern. You’ll speak. Speak up.', next: null },
    },
  },
  // ---------- I-5 The Wall Moot (faction choice; a party vote)
  {
    id: 'dialogue:warden-wall-moot', name: 'I-5 the Wall Moot', scope: 'party',
    entries: [{ when: { not: { flag: 'warden.postern' } }, node: 'yard' }, { node: 'after' }],
    nodes: {
      yard: { speaker: 'narrator', text: 'The drill yard by torchlight, four hundred Wardens with their shields grounded. Beyond the postern, faintly, the clans are waiting too: you can hear their children coughing on the other side of the wall.', next: 'motion' },
      motion: { speaker: DO, text: 'The question is the postern! Do we open it to the clans, or do we hold the wall! Every voice is heard! (Pause.) Speak up, I mean it, every voice is heard if it speaks UP!', next: 'voices' },
      voices: {
        speaker: 'narrator', text: 'A dozen voices at once. Some for the wall, some for the clans, one about the latrines.',
        choices: [
          { text: '(Let the quartermaster speak.)', to: 'ebbe', when: { flag: 'warden.ebbe', value: 'helped' } },
          { text: '(Let the clan grandmother speak through the postern.)', to: 'hekla', when: { flag: 'warden.hekla_met' } },
          { text: '(Let Old Ingrith speak. She came down off her fire for this.)', to: 'ingrith', when: { flag: 'warden.ingrith_asked' } },
          { text: '(Step forward and speak.)', to: 'choose' },
        ],
      },
      ebbe: { speaker: 'npc:ebbe-strand', text: '(Ebbe Strand clears his throat, very red.) Captain. For a year I’ve been sending a sack of bread over the wall every night. The sums didn’t add up because I made them not add up. The wall’s still standing. Nobody starved this side. I thought you should know.', next: 'choose' },
      ingrith: { speaker: 'npc:ingrith-halfmile', text: '(Very small among the shields, and very clear.) Two hundred and eleven lights over there, every night. Forty-one on our side. I’ve counted forty years. I don’t know what the wall’s for. I only know which side has more people on it.', next: 'choose' },
      hekla: { speaker: 'npc:grandam-hekla', text: '(Through the postern grille, loud as weather.) We don’t want your wall, Wardens! We want to stand behind it when the snow comes! Same as you! Is that so much?', next: 'choose' },
      choose: {
        speaker: DO, text: 'Well, pup? You’ve been over. You’ve seen. What’s the wall for?',
        choices: [
          { text: 'Hold the wall. The tears came in through the Breach with the clans. Keep the postern shut.', to: 'hold', quest: true, trust: 1, effects: [{ setFlag: 'warden.postern', value: 'hold' }] },
          { text: 'Open the postern. Let them in out of the cold, and take the risk with them.', to: 'open', quest: true, trust: -1, effects: [{ setFlag: 'warden.postern', value: 'open' }] },
          { text: 'Read the charter. (Hold it up.) The wall was built to keep out the winter, and its gates are for anyone who comes in from the cold.', to: 'charter', quest: true, insight: 'charter_read', when: { insight: 'wall_charter' }, effects: [{ setFlag: 'warden.postern', value: 'charter' }] },
        ],
      },
      hold: { speaker: DO, text: 'The wall holds! (The yard roars. Beyond the postern, the coughing goes away into the dark.) …Good. Good. That’s the right answer. It’s always been the right answer.', next: null },
      open: { speaker: DO, mood: 'angry', text: '(A long, terrible silence.) The moot has spoken. Then you draw the bolts, pup. Not me. I won’t be the one. (She turns her back, and does not turn round.)', next: null },
      charter: { speaker: DO, mood: 'afraid', text: '(She takes the charter out of your hands and reads it, lips moving.) Say it again. Louder. (You say it again.) “For anyone who comes in from the cold.” (She hands it back.) Shields up! Line the yard! We open the postern, and we hold the line while they come through!', next: null },
      after: { speaker: DO, text: 'The moot has spoken. Now we live with it. Living with it is what Wardens are for.', next: null },
    },
  },
  // ---------- I-6 The Wraith Barrows
  {
    id: 'dialogue:obj-hundredth-warden-rest', name: 'I-6 the Hundredth Warden’s question', scope: 'party',
    entries: [{ when: stage('quest:warden-the-wraith-barrows', 'rest'), node: 'kneel' }, { node: 'barrow' }],
    nodes: {
      kneel: {
        speaker: 'narrator', text: 'The Hundredth Warden kneels in his own barrow, his shield finally fallen from his arm. The black has gone out of his eyes. He looks at you the way an old sergeant looks at a recruit, and he asks one thing, in a voice like ice cracking on a river: “Who did we build it for?”',
        choices: [
          { text: 'For the ones behind it.', to: 'behind' },
          { text: 'For anyone who comes in from the cold.', to: 'cold', when: { insight: 'wall_charter' } },
          { text: 'I don’t know.', to: 'know' },
        ],
      },
      behind: { speaker: 'narrator', text: 'He nods slowly, as if that was one of the answers, but not the one he wrote down. Then he lies down in his barrow, with his shield on his chest, and is still.', next: null },
      cold: { speaker: 'narrator', text: 'Something in his old face lets go. He nods, once, firmly, like a man hearing his own orders read back correctly. Then he lies down in his barrow with his shield on his chest, and is still.', next: null },
      know: { speaker: 'narrator', text: '“Neither did they,” he says, “by the end.” Then he lies down in his barrow, with his shield on his chest, and is still.', next: null },
      barrow: { speaker: 'narrator', text: 'The Hundredth Warden lies in his barrow with his shield on his chest, at rest.', next: null },
    },
  },
  // ---------- I-7 The Empty Banner
  {
    id: 'dialogue:warden-night-attack', name: 'I-7 the attack on the Breach', scope: 'party',
    entries: [{ node: 'night' }],
    nodes: {
      night: { speaker: 'narrator', text: 'Night on the Long Rampart. Torches below the Breach, hundreds of them, and among the clan-folk, walking without torches, the hollowed: Wardens who went out past the wall and came back wrong.', next: 'torvald' },
      torvald: { speaker: TV, mood: 'hollow', text: '(Over the wind, from below the Breach.) No more walls, pup! No more walls, ever! There’s a table for everyone who was ever kept out, and a seat at it with your name on!', next: null },
    },
  },
  {
    id: 'dialogue:warden-dagny-banner', name: 'I-7 what Torvald wants', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: DO, text: 'They’ve fallen back. He was shouting something. I couldn’t hear it. I never can. What did he say?',
        choices: [
          { text: 'No more walls. He wants the Wall half to bring the whole Wardwall down.', to: 'down' },
          { text: 'His parley-flag. It had no clan’s mark on it. Only a crown, with nothing in it.', to: 'crown', insight: 'empty_banner', when: { any: [{ flag: 'warden.flag_seen' }, { insight: 'empty_crown_letters' }, { flag: 'warden.table_letter' }] } },
        ],
      },
      crown: { speaker: DO, mood: 'afraid', text: 'An empty crown. (She sits down on the stair.) Then it isn’t the clans he’s marching for. Somebody’s promised him something, pup. Somebody with a crown to give away.', next: 'down' },
      down: {
        speaker: DO, text: 'Bring the wall down. Then walk every clan in the Jarlsfell south, through the White Gate, to whoever’s promised them a seat. (She stands up again, slowly.) And he needs the stone in the Breach to do it. Your stone.',
        choices: [{ text: 'Then I’ll get to it first.', to: 'first' }, { text: 'Is he wrong, Captain?', to: 'wrong' }],
      },
      wrong: { speaker: DO, mood: 'sad', text: 'About the hunger? No. About the wall? I don’t know any more. About whoever’s waiting at the end of that road? Yes. Yes, I think he’s very wrong.', next: 'first' },
      first: { speaker: DO, text: 'Then go and get it before he does. And if you can bring him back, bring him. He taught you your feet.', next: null },
    },
  },
  // ---------- I-8 The Breach
  {
    id: 'dialogue:obj-rime-frontier-halfstone', name: 'I-8 the Wall half', scope: 'party',
    entries: [{ when: stage('quest:warden-the-breach', 'stone'), node: 'claim' }, { node: 'hole' }],
    nodes: {
      claim: { speaker: 'narrator', text: 'Frozen into the ice that patches the Breach, half of a crystal, cracked clean across, singing low and steady. The patch is the only thing holding the Breach shut. When the stone comes out, so does the patch.', next: 'ice' },
      ice: {
        speaker: 'narrator', text: 'Behind you the wind is coming through the cracks in the patch, and Torvald is on his knees by the far wall, getting his breath, watching you.',
        choices: [
          { text: '(Cut it out now.)', to: 'cut' },
          { text: '(Look at the patch first.)', to: 'patch' },
          { text: '(Set your shield against the ice and listen.)', to: 'listen', school: 'rime' },
        ],
      },
      patch: {
        speaker: 'narrator', text: 'The patch is full of things, frozen in where they were dropped last winter as the clans came through: a mitten, a clan bead, a wooden spoon, a child’s shoe with the lace still tied.',
        choices: [
          { text: '(Leave them where they are.)', to: 'cut' },
          { text: '(Work the shoe free first.)', to: 'shoe', effects: [{ setFlag: 'warden.breach_shoe', value: true }] },
        ],
      },
      shoe: { speaker: 'narrator', text: 'It comes out with a crack and a puff of frost. It is very small. Somebody walked through this hole last winter in one shoe, and somebody carried them the rest of the way. You put it inside your coat.', next: 'cut' },
      listen: { speaker: 'narrator', text: 'Through the shield the stone sings the way a wall would sing if walls did: I hold, I hold. And under that, lower, so low you feel it in your boots rather than hear it: and I let through.', next: 'cut' },
      cut: { speaker: 'narrator', text: 'Your blade goes into the ice as if into snow. The stone comes out into your hand. It feels like holding someone’s hand.', next: 'fall' },
      fall: { speaker: 'narrator', text: 'And the patch gives way. The ice that has plugged the Breach all winter slumps and slides, and the hole in the Wardwall is suddenly twice as wide, and through it, at the head of the clans, Torvald walks out into the snow.', next: 'torvald' },
      torvald: {
        speaker: TV, mood: 'hollow', text: '(Not looking back.) Keep it warm, pup. I’ll see you at the White Gate. Everyone goes through the gate in the end. Even Wardens.',
        choices: [
          { text: 'Torvald! Come back!', to: 'call' },
          { text: '(Let him go. Plant your shield in the gap.)', to: 'hold' },
        ],
      },
      call: { speaker: TV, mood: 'sad', text: '(He stops. He does not turn round.) I am going back, pup. Back to before anybody built anything. You set your feet beautifully. You always did, in the end. (Then he walks on.)', next: null },
      hold: { speaker: 'narrator', text: 'You plant your shield in the Breach and set your feet, weight forward, toes in, the way he taught you. The wind breaks on it. Out in the snow the clans go by, and some of the children wave.', next: null },
      hole: { speaker: 'narrator', text: 'The Breach in the Wardwall, wide open now. The wind comes through it whistling.', next: null },
    },
  },
  // ---------- I-9 The Long Walk (mentor farewell; trust check)
  {
    id: 'dialogue:warden-dagny-farewell', name: 'I-9 Dagny’s farewell', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: DO, text: 'So he’s gone south, and you’re going after him, and I’m walking you to the gate. Don’t argue. I’ve walked every Warden I ever trained to their first post, and the White Gate’s yours.',
        choices: [
          { text: 'Thank you, Captain.', to: 'gifts', trust: 1 },
          { text: 'Who’s holding the wall while you’re gone?', to: 'wall' },
        ],
      },
      wall: { speaker: DO, text: 'Kettil. He’ll do. He’ll straighten everyone’s shields and nobody will dare breathe. It’ll be the best-kept wall in Frostmere for a week.', next: 'gifts' },
      gifts: {
        speaker: DO, text: 'Here. Before I get sentimental and have to have myself flogged.',
        choices: [
          { text: '(Take what she offers.)', to: 'horn', when: { trust: DO, value: 'friendly' } },
          { text: '(Grip her arm, Warden to Warden.)', to: 'arm', when: { not: { trust: DO, value: 'friendly' } } },
        ],
      },
      horn: {
        speaker: DO, text: 'My horn. I can’t hear the thing anyway. Blow it if you need us. We won’t hear it either, but you’ll feel better.',
        effects: [{ giveItem: 'i_dagny_horn' }, { setFlag: 'warden.dagny_farewell', value: 'horn' }],
        choices: [
          { text: 'I’ll bring it back.', to: 'crest', when: { trust: DO, value: 'trusted' } },
          { text: 'I’ll bring it back.', to: 'road', when: { not: { trust: DO, value: 'trusted' } } },
        ],
      },
      crest: {
        speaker: DO, mood: 'sad', text: '(She unscrews the fin crest from the top of her own shield, which nobody has seen her do in twenty-eight years.) And this. It was my captain’s before me. Put it on yours. Stand where people can see it.',
        effects: [{ giveItem: 'i_dagny_fin_crest' }, { setFlag: 'warden.dagny_crest', value: true }], next: 'road',
      },
      arm: { speaker: DO, text: 'Feet. Shield. Eyes front. Speak up.', effects: [{ setFlag: 'warden.dagny_farewell', value: 'arm' }], next: 'road' },
      road: {
        speaker: DO, text: 'Now. Who walks with you to the gate.',
        choices: [
          { text: 'The Wardens. Hold the road behind me.', to: 'wardens', when: { flag: 'warden.postern', value: 'hold' } },
          { text: 'The clans. They walk beside me.', to: 'clans', when: { not: { flag: 'warden.postern', value: 'hold' } } },
        ],
      },
      wardens: { speaker: DO, text: 'Shields! Form the road! (Forty Wardens fall in behind you, and the sound of their boots on the ice is the sound of the wall walking.)', next: null },
      clans: { speaker: DO, mood: 'happy', text: '(Behind you, out of the Gatehouse, come clan-folk in their furs, with their children on their shoulders, and Wardens with them, side by side.) Well. That’s a thing I never thought I’d see. Walk on.', next: null },
    },
  },
];

export default dialogues;
