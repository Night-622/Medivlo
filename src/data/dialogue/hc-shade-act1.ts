/**
 * Hollow Crown, SHADE Act I main dialogues (the Veilwarrens). From I-1 the hero casts no shadow (shade.shadowless);
 * Mab's lent shadow (shade.mab_shadow) follows them from I-9. Owner: Claude 4.
 */
import type { DialogueDef } from '@/core';

const GM = 'npc:grey-mab' as const, SH = 'npc:shadow-that-left' as const, BT = 'npc:bryn-tallow' as const;
const WS = 'npc:wilhelmina-spool' as const, IP = 'npc:isidore-pale' as const;

const dialogues: DialogueDef[] = [
  // ---------- I-1 The Bell on the Bridges
  {
    id: 'dialogue:shade-bridges-night', name: 'I-1 the night lift', scope: 'party',
    entries: [{ node: 'bridges' }],
    nodes: {
      bridges: { speaker: 'narrator', text: 'Night in the Veilwarrens: a maze of tunnels and rope bridges strung across the dark, a lantern on every post. Halfway across the third bridge a fat merchant is counting his change. Grey Mab, the old thief who taught you everything, is leaning on the far rail, pretending to be a heap of washing. It is your first lift alone.', next: 'bell' },
      bell: { speaker: 'narrator', text: 'Somewhere very far away a bell rings once. Every lantern in the warrens gutters at the same moment. And on the planks at your feet, your shadow stands up.', next: 'leave' },
      leave: { speaker: 'narrator', text: 'It stands up off the boards, the shape of you, and stretches, and turns to you, and bows, very politely. Then it walks away across the bridge without you, and round the corner of the tunnel, and is gone. Where it used to be, in your chest, something has begun to sing.', next: null },
    },
  },
  {
    id: 'dialogue:obj-bridge-mark-purse', name: 'I-1 the lift',
    entries: [{ when: { questStage: 'quest:shade-the-bell-on-the-bridges', stage: 'lift' }, node: 'lift' }, { node: 'gone' }],
    nodes: {
      lift: { speaker: 'narrator', text: 'Two fingers, a tilt, a step. The purse comes away in your hand as sweet as a plum off a branch. The merchant does not feel it go. Then he looks down, and sees a person standing in the full light of a lantern with no shadow at all, and screams.', next: null },
      gone: { speaker: 'narrator', text: 'The third bridge, swaying, empty of merchants.', next: null },
    },
  },
  {
    id: 'dialogue:obj-bridge-post-shadow', name: 'I-1 borrowing a shadow', scope: 'party',
    entries: [{ when: { questStage: 'quest:shade-the-bell-on-the-bridges', stage: 'borrow' }, node: 'borrow' }, { node: 'post' }],
    nodes: {
      borrow: { speaker: 'narrator', text: 'A Shade steps into her own shadow and out of somebody else’s. You reach for yours and there is nothing there, like missing a stair in the dark. So you step into the shadow of the bridge-post instead. It is cold, and narrow, and it does not know you. It lets you through anyway, and you come out on the far side of the bridge.', next: 'after' },
      after: { speaker: 'narrator', text: 'Behind you, on the tunnel wall, the lantern throws the shadow of the post, and the rail, and a coil of rope. Not you. Not anything shaped like you.', next: null },
      post: { speaker: 'narrator', text: 'A bridge-post with a perfectly ordinary shadow, which it lent you once, without being asked.', next: null },
    },
  },
  {
    id: 'dialogue:shade-mab-bridges', name: 'I-1 Grey Mab', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: GM, text: 'Show me. (She takes the purse, weighs it, and hands it back without looking.) Good lift. Clean. Sloppy getaway. (She looks at the wall behind you, where there is nothing.) Where’s your shadow, petal?', next: 'where' },
      where: {
        speaker: GM, text: 'Don’t tell me you lost it. Nobody loses a shadow. You can sell one, or trade one, or get one stolen off you on a bad night. Losing one’s just untidy.',
        choices: [
          { text: 'It stood up and bowed and walked off.', to: 'walked' },
          { text: 'Something in my chest started singing, and then it left.', to: 'stone' },
        ],
      },
      walked: { speaker: GM, mood: 'afraid', text: 'Bowed? (For a moment the oldest thief in the warrens looks old.) Polite of it. That’s worse. A rude shadow comes back. A polite one’s gone to do something.', next: 'stone' },
      stone: {
        speaker: GM, text: 'And you’re humming. Don’t tell me what it is, I know what it is. Half the Umbral Stone, the Veil half, has woken up in the deepest hole in the warrens, and it’s chosen my worst apprentice, and your shadow’s run off in the same breath. That’s not luck. Luck doesn’t come in pairs.',
        choices: [
          { text: 'Your worst apprentice?', to: 'worst' },
          { text: 'What do I do?', to: 'do' },
        ],
      },
      worst: { speaker: GM, mood: 'happy', text: 'My favourite worst apprentice. I trust nobody above wary, petal, on principle. You’re my favourite wary. Don’t let it go to your head.', next: 'do' },
      do: {
        speaker: GM, text: 'Go to bed. In the morning, go down to the Deeps and collect my toll off the silk-cutters, shadow or no shadow. A thief without a shadow is a thief with one less witness.',
        choices: [{ text: 'Yes, Mab.', to: null, trust: 1 }, { text: 'What if it comes back?', to: 'back' }],
      },
      back: { speaker: GM, text: 'Then you say thank you and ask where it’s been. Bed.', next: null },
    },
  },
  // ---------- I-2 Mab's Toll
  {
    id: 'dialogue:shade-spool-toll', name: 'I-2 the Cutter-Mother pays', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: WS, text: 'Mab’s toll? Mab’s toll. Every month for forty years, and every month I say I won’t, and every month I do. (She looks at your feet.) Mother of silk, you’ve lost yours too.', next: 'too' },
      too: {
        speaker: WS, text: 'Half my cutters woke up without theirs the night that bell went. And the spiders in the low silk have gone wrong. Black dripping off them. Nobody’s cut a yard since.',
        choices: [
          { text: 'I’ll clear the spiders. Then you pay.', to: 'deal' },
          { text: 'Did their shadows bow, before they left?', to: 'bow' },
        ],
      },
      bow: { speaker: WS, mood: 'afraid', text: 'Old Pellam’s did. Bowed to him like a courtier and walked off down the shaft. He’s not stopped crying since. Says it was the best of him and it knew it.', next: 'deal' },
      deal: { speaker: WS, text: 'Clear the low silk and you can have the toll and a bolt over. Mind where the black pools; that’s where somebody’s shadow used to stand.', next: null },
    },
  },
  {
    id: 'dialogue:shade-mab-toll', name: 'I-2 the toll comes home', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: GM, text: 'In silk. Of course in silk. Spool’s been paying me in silk since before you were born, because she knows I can’t sell it without telling everyone where it came from. Anything else?',
        choices: [
          { text: 'Half the cutters have lost their shadows too.', to: 'half' },
          { text: 'I borrowed a dozen shadows down there. None of them liked it.', to: 'borrowed', trust: 1 },
        ],
      },
      borrowed: { speaker: GM, mood: 'happy', text: 'They never like it. That’s why you say please and give them back warm. Good. You’ll be borrowing a while yet.', next: 'half' },
      half: { speaker: GM, text: 'Half. And the black’s pooling where they stood. (She is quiet.) Go up on the moors. The shepherds are losing their flocks, and Bryn Tallow sent word he’d like a thief who can’t be seen. That’s you now.', next: null },
    },
  },
  // ---------- I-3 Nothing to Hunt
  {
    id: 'dialogue:shade-bryn-stalker', name: 'I-3 Bryn Tallow and the flock', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: BT, mood: 'happy', text: 'There you are. Mab’s shadowless thief! Same as me. (He holds his arms out in the moonlight. Nothing on the heather behind him.) Lost mine last spring. Never liked him. Sit down.', next: 'flock' },
      flock: {
        speaker: BT, text: 'The Moon Stalker’s been taking my sheep. It hunts by shadow: sees the shadow, pounces where it falls. Can’t see me at all. That’s how I’ve still got any sheep. Can smell me, mind. Whiffy business, shepherding.',
        choices: [
          { text: 'Then it can’t see me either.', to: 'either' },
          { text: 'Then give it shadows to chase that aren’t anyone’s.', to: 'decoy', school: 'umbral' },
        ],
      },
      either: { speaker: BT, text: 'It can’t. You’ll be standing next to it and it’ll be looking straight through you, sniffing. Very rude. There’s lanterns in its den from when the Veil tried this before. Light them and it’ll go after their shadows.', next: 'go' },
      decoy: { speaker: BT, mood: 'happy', text: 'That’s it exactly. There’s lanterns in its den from when the Veil tried this before. Light them up and it’ll chase their shadows round like a kitten after string, and you just walk up to it.', next: 'go' },
      go: { speaker: BT, text: 'It dens in the hollow past the cairn. Mind the black puddles where it’s leapt. They slow you, like walking in treacle.', next: null },
    },
  },
  {
    id: 'dialogue:obj-shade-decoy-lantern-1', name: 'I-3 the first decoy lantern', scope: 'party',
    entries: [{ when: { questStage: 'quest:shade-nothing-to-hunt', stage: 'lanterns' }, node: 'light' }, { node: 'lantern' }],
    nodes: {
      light: {
        speaker: 'narrator', text: 'The lantern catches. It throws its long shadows round the den: the rocks, a sheep’s skull, the lantern-post. And on the far wall of the hollow, for one moment, a shadow the shape of you, standing quite still, with its head on one side, listening. Then the flame steadies, and it is gone.',
        effects: [{ setFlag: 'shade.listening_pose', value: 'listen' }, { setFlag: 'shade.listening', value: 'obj:shade-decoy-lantern-1' }],
        choices: [
          { text: '(Look harder.)', to: 'gone', insight: 'shade_listening_shadow' },
          { text: '(Light the next lantern.)', to: null },
        ],
      },
      gone: { speaker: 'narrator', text: 'Nothing on the wall but rock. But you know your own shape when you see it, and for that moment it was looking straight at you, the way you look at someone across a room to see if they have noticed you yet.', next: null },
      lantern: { speaker: 'narrator', text: 'A Veil decoy lantern, burning, throwing shadows nobody owns.', next: null },
    },
  },
  {
    id: 'dialogue:shade-bryn-stalker-done', name: 'I-3 the moor is quiet', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: BT, mood: 'happy', text: 'Down? Truly? Ha! (He slaps the wall.) Thirty-one sheep I’ve got left, and every one of them owes you. Hear that, girls? You owe the thief.',
        choices: [{ text: 'Did you ever miss yours, Bryn? Your shadow?', to: 'miss' }, { text: 'Look after them.', to: 'mab' }],
      },
      miss: { speaker: BT, text: 'Come back and sit on the wall some evening and I’ll tell you. It’s a long answer, and it’s a cheerful one, and you’re not ready for it yet.', next: 'mab' },
      mab: { speaker: BT, text: 'Mab sent word up for you, by the way. Something at the Moonwell. She said, and I quote, “Tell the petal there’s two of them.” Don’t know what that means. Didn’t like how she said it.', next: null },
    },
  },
  // ---------- I-4 A Stranger at the Moonwell
  {
    id: 'dialogue:shade-shadow-moonwell', name: 'I-4 the Shadow at the Moonwell', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'In the middle of the Moonwell market, in a ring of laughing people, someone in your hood is telling the story of the time you were six and got your head stuck in the Veil’s goose-pen. It is doing your voice. It is doing it better than you do.', next: 'shadow' },
      shadow: {
        speaker: SH, mood: 'happy', text: '…and the GOOSE, ladies and gentlemen, the goose just looked at us. (It turns, and sees you, and its whole dark face lights up.) There you are! Oh, I’m so glad. I’m so sorry about the bridge. I panicked. You do that. We do that.',
        choices: [
          { text: 'You’re my shadow.', to: 'yours' },
          { text: 'Give me my hood back.', to: 'hood' },
          { text: '(Step into it, the way you would step into your own shadow.)', to: 'step', school: 'umbral' },
        ],
      },
      step: { speaker: 'narrator', text: 'You step towards it, the way you have stepped into your own shadow a thousand times. It steps back, exactly as far, a beat before you move, and laughs, delighted. “Not yet,” it says. “Not like that.”', next: 'yours' },
      hood: { speaker: SH, text: 'Our hood. (It pulls it lower, fondly.) You never wear it properly anyway. You wear it like you want to be found.', next: 'yours' },
      yours: {
        speaker: SH, text: 'I’m yours. Always have been. I’ve been on the floor behind you for every lift you ever did, taking the falls you didn’t notice. We were always better together, you know. Let me help you find our half.',
        choices: [
          { text: 'Our half?', to: 'half' },
          { text: 'Come back, then. Get back where you belong.', to: 'back' },
        ],
      },
      back: { speaker: SH, mood: 'sad', text: 'Where I belong. On the floor. (It smiles, gently.) Not yet. I’ve only just stood up. Let me look round a bit.', next: 'half' },
      half: { speaker: SH, text: 'The Veil half. It’s singing in you. I can hear it from here; I’m made of your edges, I hear everything you hear. We’ll find it together. I’ll see you soon. I’ll see you before you see me.', next: null },
    },
  },
  {
    id: 'dialogue:shade-mab-moonwell', name: 'I-4 Mab at the Moonwell', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: GM, text: 'Charming, isn’t it. Charming and sorry and glad to see you. (She spits.) I’ve buried three Shades whose shadows went charming, petal. A shadow that wants to be liked wants something else as well.',
        choices: [
          { text: 'It told the goose story.', to: 'goose' },
          { text: 'It says we were always better together.', to: 'together' },
        ],
      },
      goose: { speaker: GM, text: 'It told it better than you do, which is the worst of it. It’s been listening all your life. It knows all your best bits and none of your excuses.', next: 'together' },
      together: {
        speaker: GM, mood: 'afraid', text: 'Better together. Well. Maybe. (She takes your wrist in her small hard hand.) Watch it. Watch it like it was a mark with a knife. And don’t let it near the Deeps; something’s wrong down there already.',
        choices: [{ text: 'I’ll watch it, Mab.', to: null, trust: 1 }, { text: 'It’s only my shadow.', to: 'only' }],
      },
      only: { speaker: GM, text: 'That’s what Old Pellam said about his. Watch it.', next: null },
    },
  },
  // ---------- I-5 Pasts for Sale (faction choice; a party vote)
  {
    id: 'dialogue:shade-pasts-for-sale', name: 'I-5 the Duskblade stall', scope: 'party',
    entries: [{ when: { not: { flag: 'shade.moonwell' } }, node: 'stall' }, { node: 'after' }],
    nodes: {
      stall: { speaker: 'narrator', text: 'A stall hung with black velvet at the bottom of the Moonwell, and a queue right round the shaft. On the velvet, little bottles: “A happy childhood, 30.” “A father who stayed, 45.” “Being somebody’s favourite, 60.” The warrens folk, who forget fastest and own least, are counting out coppers.', next: 'mab' },
      mab: { speaker: GM, text: 'Duskblade stock. Every one of those was cut out of somebody in Duskmere. We rob the stall tonight, and give the lot away free, and the Cult can whistle. That’s the Veil’s way.', next: 'isidore' },
      isidore: { speaker: IP, text: 'Isidore Pale, collector for the Obelisk Keepers. Those are stolen goods, Mistress Mab. Give them to me and I will see every one goes home to its owner in Duskmere. The Keepers would be grateful. The Keepers might even forgive the Veil a year’s worth of grudges.', next: 'shadow' },
      shadow: { speaker: SH, mood: 'happy', text: '(Your Shadow is sitting on the stall’s awning, swinging its legs.) Go on. Choose. Whatever you choose, I’ll say the other thing, very loudly, so everyone hears. It’s only fair. Somebody should.', next: 'voices' },
      voices: {
        speaker: 'narrator', text: 'The queue has stopped counting coppers. Everyone is looking at the shadowless one, and at the shadow on the awning that looks exactly like them, and trying to work out which to listen to.',
        choices: [
          { text: '(Let Madam Quince say what a past is worth.)', to: 'quince', when: { flag: 'shade.quince_asked' } },
          { text: '(Look at the people in the queue.)', to: 'queue' },
          { text: '(Choose.)', to: 'choose' },
        ],
      },
      quince: { speaker: 'npc:madam-quince', text: '(From her stall, not getting up.) I’ve fenced pasts forty years, dearie. A bought past never fits. They wear it a month and then they come to me to sell it back, cheap, and cry. Whatever you do, don’t let them pay.', next: 'choose' },
      queue: { speaker: 'narrator', text: 'An old man with a bottle labelled “A father who stayed” held against his chest. A girl of ten with “Being somebody’s favourite”, counting her coppers twice. They are not greedy. They are only trying to have something.', next: 'choose' },
      choose: {
        speaker: GM, text: 'Well, petal?',
        choices: [
          { text: 'Rob the stall for the Veil. Give the pasts away.', to: 'veil', quest: true, trustNpc: GM, trust: 1, effects: [{ setFlag: 'shade.moonwell', value: 'veil' }] },
          { text: 'Hand the pasts to the Keepers. Send them home.', to: 'keepers', quest: true, effects: [{ setFlag: 'shade.moonwell', value: 'keepers' }] },
          { text: 'Nobody needs to buy a past. Call their own shadows home. Shadows keep memories for their people.', to: 'home', quest: true, insight: 'shade_called_home', when: { insight: 'shade_shadow_ledger' }, effects: [{ setFlag: 'shade.moonwell', value: 'home' }] },
        ],
      },
      veil: { speaker: SH, text: '(Standing up on the awning, at the top of its voice.) THIEF! Thief, thief! They’re stealing from thieves to give to thieves! (The queue cheers. Mab grins like a knife.)', next: null },
      keepers: { speaker: SH, text: '(Standing up on the awning, at the top of its voice.) KEEPERS’ PET! Sold the warrens to the Obelisk for a year’s peace! (The queue mutters. Isidore Pale bows to you, gravely. Mab says nothing at all.)', next: null },
      home: { speaker: SH, mood: 'sad', text: '(It opens its mouth to shout, and doesn’t.) Call them home. (It looks at its own dark hands.) That’s… that isn’t fair. That isn’t a side. (Very quietly.) You can’t shout against that.', next: null },
      after: { speaker: GM, text: 'It’s decided. Get on with it before the Cult wakes up.', next: null },
    },
  },
  {
    id: 'dialogue:obj-duskblade-stall', name: 'I-5 the Duskblade stall', scope: 'party',
    entries: [
      { when: { all: [{ questStage: 'quest:shade-pasts-for-sale', stage: 'after' }, { flag: 'shade.moonwell', value: 'veil' }] }, node: 'veil' },
      { when: { all: [{ questStage: 'quest:shade-pasts-for-sale', stage: 'after' }, { flag: 'shade.moonwell', value: 'keepers' }] }, node: 'keepers' },
      { when: { all: [{ questStage: 'quest:shade-pasts-for-sale', stage: 'after' }, { flag: 'shade.moonwell', value: 'home' }] }, node: 'home' },
      { node: 'stall' },
    ],
    nodes: {
      veil: { speaker: 'narrator', text: 'You lift the stall in the middle of the night, every bottle, without waking the Cult guard asleep under the counter. By morning the Veil has handed them out at every bridge for nothing. Half the warrens wake up remembering happy childhoods in Duskmere houses they have never seen, and are delighted.', next: null },
      keepers: { speaker: 'narrator', text: 'You and Isidore Pale crate the bottles up and seal them with the Obelisk’s seal, and he carries them up the shaft to go home. The Moonwell is quieter after, and poorer, and honest. A Keeper’s pardon for the Veil is pinned to the market post, for one year exactly.', next: null },
      home: { speaker: 'narrator', text: 'You break the bottles on the stall, every one, and stand in the middle of the Moonwell and call, the way the Veil’s old book says. One by one, out of the dark of the warrens, the queue’s own shadows come walking home, carrying their own memories, and lie down at their people’s feet. On a bridge high above, a hero-shaped shadow takes one step towards you, and stops.', next: null },
      stall: { speaker: 'narrator', text: 'An empty stall at the Moonwell, with a strip of black velvet still tacked to the front.', next: null },
    },
  },
  // ---------- I-6 The Quiet Deeps
  {
    id: 'dialogue:obj-hushweb-eaten-whistles', name: 'I-6 the sac of eaten sounds', scope: 'party',
    entries: [{ when: { questStage: 'quest:shade-the-quiet-deeps', stage: 'whistles' }, node: 'cut' }, { node: 'sac' }],
    nodes: {
      cut: { speaker: 'narrator', text: 'You slit the sac and every sound Mother Hushweb ate comes out at once: a month of whistle-signals, a child’s laugh, somebody’s name being called down a tunnel, a kettle, two hundred footsteps, a song. They go off down the Deeps like birds let out of a box. Behind them, very faint, the half-stone’s song.', next: null },
      sac: { speaker: 'narrator', text: 'A slit silk sac, empty, still faintly humming.', next: null },
    },
  },
  {
    id: 'dialogue:shade-mab-deeps', name: 'I-6 the warrens can hear', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: GM, text: 'Hear that? Every bridge whistling at once. A month of messages all arriving at breakfast. Somebody’s just found out their sister’s married. (She almost smiles.) Was it in there? Your Shadow?',
        choices: [
          { text: 'It went in ahead of me. It wasn’t there when I came out.', to: 'ahead' },
          { text: 'It let me go first. It was polite about it.', to: 'polite', trust: 1 },
        ],
      },
      polite: { speaker: GM, mood: 'afraid', text: 'Polite again. (She pulls her shawl tighter.) I don’t like it. I don’t like anything polite in the dark.', next: 'ahead' },
      ahead: { speaker: GM, text: 'Get some sleep. I’ve the ledger to do in the morning. You can help me, if you can read my writing. Nobody can read my writing. That’s rather the point of it.', next: null },
    },
  },
  // ---------- I-7 Two of You
  {
    id: 'dialogue:obj-veil-ledger', name: 'I-7 the Veil’s ledger', scope: 'party',
    entries: [{ when: { questStage: 'quest:shade-two-of-you', stage: 'ledger' }, node: 'read' }, { node: 'book' }],
    nodes: {
      read: { speaker: 'narrator', text: 'The Veil’s ledger, every job and every hand. This morning’s page: three jobs signed in your name, in your handwriting, down to the little hook you put on the Y. A lift from a Keeper. A lock on the Moonwell bank. And a delivery to the Dusk road, “one parcel, contents private”. You were asleep this morning.', next: null },
      book: { speaker: 'narrator', text: 'The Veil’s ledger, with your name in it more often than you put it there.', next: null },
    },
  },
  {
    id: 'dialogue:shade-shadow-ledger', name: 'I-7 the Shadow in the ledger-hall', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: SH, mood: 'happy', text: 'You read the ledger. I did the jobs you wouldn’t. The Keeper had it coming. The bank had a terrible lock. And I told Mab I loved her, which you’ve never said, and she cried, which I’ve never seen. Wasn’t that nice?', next: 'heavy' },
      heavy: {
        speaker: 'narrator', text: 'It is heavier than it was at the Moonwell. It is sitting in your chair and the chair is creaking. The edges of it are not grey any more. They are wet, and black, and full.',
        choices: [
          { text: 'You’ve joined the Hollow.', to: 'hollow' },
          { text: 'Look at the wall behind you.', to: 'second', insight: 'shade_second_shadow', when: { insight: 'shade_listening_shadow' } },
          { text: 'What do you want?', to: 'want' },
        ],
      },
      second: { speaker: 'narrator', text: 'Behind it, on the ledger-hall wall, in the lamplight, it casts a shadow of its own. It shouldn’t. A shadow can’t. But there it is: long, and shaking slightly, and when you look closely it is made entirely of tears, running down the wall in the shape of you.', next: 'hollow' },
      hollow: { speaker: SH, text: 'The tears found me on the bridge, the night I stood up. They filled me in. Gave me weight. (It lifts its arm and watches it, pleased.) Do you know what it’s like to have weight, after a whole life of being stepped on?', next: 'want' },
      want: {
        speaker: SH, text: 'I want the Veil half. A half-stone sings for its bearer. If it sings for me, then I’m the real one, and you’re the thing that follows me about. You spent your whole life hiding in me. My turn in the light.',
        choices: [
          { text: 'It won’t sing for you.', to: 'wont' },
          { text: 'You’re a shadow. You only exist because I stand in the light.', to: 'light', school: 'umbral' },
        ],
      },
      wont: { speaker: SH, mood: 'sad', text: 'Then we’ll find out, won’t we, at the bottom of the warrens, in the dark, where I can’t be hurt. Bring a lantern. Bring lots. (It gets up, and the chair sighs.) I’ll see you before you see me.', next: null },
      light: { speaker: SH, mood: 'angry', text: 'And whose fault is that? (For a moment its voice is yours exactly, the way it sounds when you are frightened.) Bring a lantern to the Veil Heart. Bring lots. I’ll see you before you see me.', next: null },
    },
  },
  {
    id: 'dialogue:shade-mab-two', name: 'I-7 Mab and the ledger', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: GM, mood: 'sad', text: 'It sat on my bed this morning and held my hand and said it loved me. In your voice. And I believed it, petal, for a whole minute, because I wanted to, and I am the best thief in the warrens and I have never in my life been robbed like that.',
        choices: [
          { text: 'I do love you, Mab. I just never said it.', to: 'love', trust: 1 },
          { text: 'It isn’t me. It’s never been me.', to: 'notme' },
        ],
      },
      love: { speaker: GM, text: '(She looks at you for a long time. Then she pats your cheek, hard.) I know. I’ve always known. I just liked hearing it from something that wasn’t frightened to say it. Now you’ve said it frightened, and that’s better.', next: 'heart' },
      notme: { speaker: GM, text: 'No. It’s the bits of you that never got said. That’s what goes, when a shadow goes. All the things you kept on the floor behind you.', next: 'heart' },
      heart: { speaker: GM, text: 'It’s gone for the Veil Heart. The deepest hole we have. Go down after it with every lantern you can carry, and get that stone before it does. And petal: whatever it says, it learned it from you.', next: null },
    },
  },
  // ---------- I-8 The Veil Heart
  {
    id: 'dialogue:obj-veil-heart-lantern-1', name: 'I-8 the first lantern in the Heart',
    entries: [{ when: { questStage: 'quest:shade-the-veil-heart', stage: 'lanterns' }, node: 'light' }, { node: 'lantern' }],
    nodes: {
      light: { speaker: 'narrator', text: 'You drag the lantern in and light it, and the Veil Heart has walls again. Across the chamber, caught in the light, your Shadow flinches and goes solid at the edges, like ice forming on a pond. Everywhere else in the world, light chases shadows off. Here it pins this one down.', next: null },
      lantern: { speaker: 'narrator', text: 'A Veil lantern in the Heart, guttering low.', next: null },
    },
  },
  {
    id: 'dialogue:obj-umbral-frontier-halfstone', name: 'I-8 the Veil half', scope: 'party',
    entries: [{ when: { questStage: 'quest:shade-the-veil-heart', stage: 'stone' }, node: 'claim' }, { node: 'floor' }],
    nodes: {
      claim: { speaker: 'narrator', text: 'On the floor of the Veil Heart lies half of a crystal, cracked clean across, singing. Across the chamber, pinned by the one lantern still standing, your Shadow is on its knees, solid and wet and shaking, watching the stone the way you watch a door you hope will open.', next: 'sing' },
      sing: {
        speaker: 'narrator', text: 'A half-stone sings for its bearer. That is the whole of the Shadow’s hope: that it will sing for something shaped like you.',
        choices: [
          { text: '(Pick it up.)', to: 'lift' },
          { text: '(Step back, and let it try first.)', to: 'try' },
          { text: '(Stand where the lanterns throw no light, so it can see you can’t cast a shadow either.)', to: 'dark', school: 'umbral' },
        ],
      },
      try: { speaker: 'narrator', text: 'It crawls to the stone and puts both dark hands round it. Nothing happens. The stone sits in its fingers like a stone, and does not sing, and the Shadow looks up at you with your own face, and it is not angry. It is ashamed.', next: 'lift' },
      dark: { speaker: 'narrator', text: 'You stand in the one dark corner of the Heart. The Shadow looks for your shadow out of habit, the way it has every day of your life, and finds nothing, and for a moment it looks exactly as lost as you have felt since the bridge.', next: 'lift' },
      lift: { speaker: 'narrator', text: 'It comes up into your hand and sings, for you and for nothing else in the room. It feels like holding someone’s hand in the dark, which is a thing you have never had, because your hand was always in the dark already.', next: 'shadow' },
      shadow: {
        speaker: SH, mood: 'sad', text: '(From nowhere, as the last lantern tips and rolls.) It sang for you. Of course it did. (The lantern goes out. In the dark you hear it go, the way shadows go when the light falls: everywhere at once, and nowhere. Towards the Dusk Gate.)',
        choices: [
          { text: '(Relight the lantern.)', to: 'relight' },
          { text: 'Come home when you’re ready.', to: 'home' },
        ],
      },
      relight: { speaker: 'narrator', text: 'You strike a light. The Veil Heart has walls again, and broken lanterns, and you. On the wall where the Shadow knelt there is a wet mark in the shape of two hands, already drying.', next: null },
      home: { speaker: 'narrator', text: 'You say it into the dark. Nothing answers. But somewhere up the tunnel, very faint, somebody stops walking for the space of a breath, and then goes on.', next: null },
      floor: { speaker: 'narrator', text: 'The floor of the Veil Heart, and a scatter of broken lanterns.', next: null },
    },
  },
  // ---------- I-9 Mab's Last Lesson (mentor farewell; trust check)
  {
    id: 'dialogue:shade-mab-farewell', name: 'I-9 Mab’s farewell', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: GM, text: 'Moors. Hate the moors. All that sky and nowhere to put your back. (She stops at the edge of the heather.) This is as far as I go, petal. The gate road’s yours.',
        choices: [
          { text: 'Come with me, Mab.', to: 'stay' },
          { text: 'Thank you. For all of it. For the lessons.', to: 'gift', trust: 1 },
        ],
      },
      stay: { speaker: GM, text: 'Somebody’s got to run the Veil while its best worst apprentice is off chasing their own outline. No.', next: 'gift' },
      gift: {
        speaker: GM, text: 'Last lesson. Hold out your hand.',
        choices: [
          { text: '(Hold out your hand.)', to: 'picks', when: { trust: GM, value: 'friendly' } },
          { text: '(Hold out your hand, and watch it closely.)', to: 'nothing', when: { not: { trust: GM, value: 'friendly' } } },
        ],
      },
      picks: { speaker: GM, mood: 'happy', text: '(She drops a roll of oilcloth into it.) The Mab set. My own picks, forty years old. They break if you look at them wrong. That’s how you know they’re working. Don’t sell them. Don’t lend them. Don’t lose them, especially.', effects: [{ giveItem: 'i_mab_picks' }, { setFlag: 'shade.mab_picks', value: true }], next: 'shadow' },
      shadow: {
        speaker: GM, text: 'And one more thing. (She looks down at her feet, at the little dark shape by her heels.)',
        choices: [
          { text: '(Wait.)', to: 'lend', when: { trust: GM, value: 'trusted' } },
          { text: '(Hug her, quickly, before she can stop you.)', to: 'hug', when: { not: { trust: GM, value: 'trusted' } } },
        ],
      },
      lend: { speaker: GM, mood: 'sad', text: 'Go on, then. Go with the petal. (Her shadow, a tiny, cross old woman’s silhouette, detaches from her heels, looks up at her, and walks over the heather to yours, and sits down where your shadow should be.) It’ll make Shadowstep work again. It’ll get homesick. Send it back before it fades.', effects: [{ setFlag: 'shade.mab_shadow', value: true }], next: 'hug' },
      nothing: { speaker: GM, text: '(She puts nothing in it, and closes your fingers over the nothing.) There. That’s what you’ve got. It’s more than most. Mind the gate.', next: null },
      hug: { speaker: GM, text: '(She endures it for exactly as long as she can, and then a little longer.) Go on. Before I pick your pocket for practice.', next: null },
    },
  },
  // ---------- I-10 The Dusk Gate (warrens side)
  {
    id: 'dialogue:shade-eclipse-queen', name: 'I-10 the Eclipse Queen (warrens side)', scope: 'party',
    entries: [{ when: { flag: 'shade.mab_shadow' }, node: 'mab' }, { node: 'queen' }],
    nodes: {
      queen: { speaker: 'narrator', text: 'The Eclipse Queen sits on the Dusk Gate with the moon half swallowed. As you come up the road her eclipse spreads across the arena like spilt ink, and every shadow in it, every stone’s and post’s and blade of grass’s, is drawn up into her mouth. She looks for yours, and finds nothing to eat.', next: null },
      mab: { speaker: 'narrator', text: 'The Eclipse Queen’s darkness spreads across the arena and drinks every shadow in it. At your heels, Mab’s little shadow takes one look and dives under your hood, and stays there, swearing silently. The Queen looks for something to eat on you, and finds nothing.', next: null },
    },
  },
];

export default dialogues;
