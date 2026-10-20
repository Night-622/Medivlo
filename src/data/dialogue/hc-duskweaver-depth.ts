/**
 * Hollow Crown, DUSKWEAVER Act I depth pass (10-campaign-style.md §8, docs/PACING.md): the new stages' scenes,
 * investigation clues, travel banter, optional finds and the third parts of the side quests. Nyx calls the hero by a
 * different wrong name until Trusted, so her scenes open on two entries. Owner: Claude 4.
 */
import type { DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const NX = 'npc:nyx-aubade' as const, OV = 'npc:oriel-vane' as const, MT = 'npc:marigold-thrupp' as const;
const RH = 'npc:rosamund-hesketh' as const, PM = 'npc:peregrine-moll' as const;
const KNOWS: NarrativeCondition = { trust: NX, value: 'trusted' };

/** a clue object: one scene while its stage runs (sets its flag), a plain line otherwise */
function clue(id: string, name: string, when: NarrativeCondition, text: string, flag: string, plain: string, more?: string): DialogueDef {
  return {
    id: `dialogue:obj-${id}`, name, scope: 'party',
    entries: [{ when, node: 'clue' }, { node: 'plain' }],
    nodes: {
      clue: { speaker: 'narrator', text, effects: [{ setFlag: flag, value: true }], next: more ? 'more' : null },
      ...(more ? { more: { speaker: 'narrator', text: more, next: null } } : {}),
      plain: { speaker: 'narrator', text: plain, next: null },
    },
  };
}

const dialogues: DialogueDef[] = [
  // ======================= I-1 The Bell at Dusk: cocoa at the Keepers’ Lodge
  {
    id: 'dialogue:duskweaver-nyx-cocoa', name: 'I-1 cocoa at the Keepers’ Lodge', scope: 'party',
    entries: [{ when: KNOWS, node: 'in_t' }, { node: 'in' }],
    nodes: {
      in: { speaker: 'narrator', text: 'The Keepers’ Lodge: a kitchen full of candles nobody needs, and a wall of little drawers, every one labelled in Nyx’s round hand. SPOONS. SPOONS (OTHER). PEOPLE I HAVE MET. The last one is very full.', next: 'name' },
      in_t: { speaker: 'narrator', text: 'The Keepers’ Lodge: a kitchen full of candles nobody needs, and a wall of little drawers, every one labelled in Nyx’s round hand. SPOONS. SPOONS (OTHER). PEOPLE I HAVE MET. The last one is very full.', next: 'name_t' },
      name: { speaker: NX, text: 'Sit, Clementine. No. Cuthbert? Never mind, dear. (She pours cocoa into two cups and a saucer, and looks at the saucer, puzzled.) Now. The song in your chest. Let me hear it properly, without the whole street listening.', next: 'song' },
      name_t: { speaker: NX, text: 'Sit, {player.name}. (She pours cocoa into two cups and a saucer, and looks at the saucer, puzzled.) Now. The song in your chest. Let me hear it properly, without the whole street listening.', next: 'song' },
      song: {
        speaker: 'narrator', text: 'In the quiet of the Lodge the half-stone’s song is low and slow, like somebody humming while they look for something in a drawer. On the wall, every one of Nyx’s little drawers rattles, very slightly, in time.',
        choices: [
          { text: 'Why are the drawers moving?', to: 'drawers' },
          { text: 'What is the Obelisk half for, Loremistress?', to: 'for' },
          { text: '(Weave a thread of dusk round the song, to quiet it.)', to: 'weave', school: 'umbral' },
        ],
      },
      drawers: { speaker: NX, mood: 'happy', text: 'Because everything in them is a memory, dear, and memories always turn to listen when the stone sings. Even spoons. Especially the other spoons. They’re more sensitive.', next: 'for' },
      weave: { speaker: 'narrator', text: 'You draw the thread round the song the way Nyx taught you when you were small. The drawers go still. Nyx watches you do it with her cup halfway to her mouth, and smiles as if she has just remembered something lovely.', next: 'for' },
      for: {
        speaker: NX, text: 'The Obelisk keeps what Nocturne knows, so that we can forget it safely. The stone was its heart. Without it the Obelisk leaks, and the leaking comes out as black on the doorsteps, and people forget their own front doors.',
        choices: [
          { text: 'You forget everyone’s name. Is that the leak too?', to: 'leak' },
          { text: 'How do we stop it?', to: 'stop' },
        ],
      },
      leak: { speaker: NX, mood: 'sad', text: '(She laughs, gently.) Oh, no, dear. That’s just me. I was like this long before the Hollowing. My mother said I was born with a hole in my pocket. I find it makes me very good at meeting people. I meet everyone so often.', next: 'drawer' },
      stop: { speaker: NX, text: 'One door at a time. That’s how everything in Duskmere is done. Tomorrow evening, which is to say in a little while, you’ll go round and chalk the right names back on the right doors. I have a list. It is very nearly the right list.', next: 'drawer' },
      drawer: {
        speaker: 'narrator', text: 'She takes a slip of paper out of the drawer marked PEOPLE I HAVE MET and puts it in yours. On it, in her hand, a sketch of your face, very good, and under it four names, all crossed out, and a question mark.',
        choices: [
          { text: 'You drew me.', to: 'drew', trust: 1, trustNpc: NX },
          { text: '(Write your name under the question mark.)', to: 'write' },
        ],
      },
      drew: { speaker: NX, mood: 'happy', text: 'I draw everyone. Faces stay. Names fall out. If I keep the face I can always ask the name again, and people are very kind about telling me. You were. You always are.', next: 'end' },
      write: { speaker: NX, mood: 'happy', text: '(She reads it, and nods, and puts the slip back in the drawer, and then takes it out again and reads it again.) There. Now it’s kept. I may still get it wrong. But it’s kept.', next: 'end' },
      end: { speaker: NX, text: 'Drink your cocoa. Then sleep. In Duskmere it is always nearly night, which makes sleeping very easy and getting up very hard.', next: null },
    },
  },
  {
    id: 'dialogue:area-duskweaver-lanternless', name: 'I-2 banter: the Lanternless Streets', bark: true,
    entries: [{ when: stage('quest:duskweaver-chalk-the-doors', 'doors'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Down every street of the Lanternless Streets, people are standing politely outside front doors, waiting for somebody to tell them whose they are. One man has knocked on the same door three times, and apologised to himself each time.', next: null } },
  },

  // ======================= I-4 The Mnemosarch’s Queue: the ledger, tea
  clue('duskweaver-queue-ledger', 'I-4 the queue ledger', stage('quest:duskweaver-the-mnemosarchs-queue', 'ledger'),
    'The queue ledger: thirty years of names in a beautiful hand, one line for every memory ever handed back. Four columns: NAME. MEMORY. RETURNED. KEPT. You sign off your three. Every line above them, all the way back, is ticked in both of the last two columns.',
    'duskweaver.ledger_kept', 'The Mnemosarch’s queue ledger, closed, with a ribbon at today.', 'Returned, and kept. You read it twice. You suppose it means kept on file. It is the sort of thing a Keeper would write.'),
  {
    id: 'dialogue:duskweaver-vane-tea', name: 'I-4 tea with the Mnemosarch', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: OV, mood: 'happy', text: 'Three phials, three happy people, one of them puzzled about lilac. That is a very good morning. (He pours.) No sugar, a drop of milk, and you hold the cup by the body, not the handle. You did as a child.', next: 'child' },
      child: {
        speaker: OV, text: 'You queued here once, you know. When you were small. You came to have back the name of a dog. I gave it to you, and you cried, and then you laughed. I have it written down.',
        choices: [
          { text: 'I don’t remember that.', to: 'remember' },
          { text: 'What was the dog called?', to: 'dog' },
        ],
      },
      remember: { speaker: OV, mood: 'sad', text: 'No. You wouldn’t. That’s the thing about this city. Everything slips. (He taps the ledger.) Not here, though. Here nothing slips. That is the whole of my work, and it is not a small thing.', next: 'why' },
      dog: { speaker: OV, mood: 'happy', text: 'Button. A small brown dog called Button, who ate a bishop’s glove. (He smiles.) You see? Kept. You may forget it again on the way home, and it will still be here.', next: 'why' },
      why: {
        speaker: OV, text: 'Do you know why I became a Keeper? When I was six, I forgot my mother’s face. Just like that, one morning. I cried for a year. Then I found it, years later, in a phial in this very queue. I swore I would never let anyone lose anything again.',
        choices: [
          { text: 'That’s a kind thing to swear.', to: 'kind' },
          { text: 'And did you give the phial back?', to: 'back' },
        ],
      },
      kind: { speaker: OV, mood: 'happy', text: 'I think so. Nyx thinks it is a sad thing to swear. Nyx forgets her own oaths, which is very convenient for her. (He refills your cup, though it is full.)', next: 'help' },
      back: { speaker: OV, text: '(A tiny pause.) I keep it very safe. (He moves the teapot an inch to the left, and back.) More tea?', next: 'help' },
      help: { speaker: OV, text: 'Come back to me, {player.name}. Not for the queue. For the larger work. Duskmere is forgetting itself faster every year, and I cannot keep it all on my own. I would very much like help from someone the stone sang for.', next: 'end' },
      end: { speaker: 'narrator', text: 'Behind him, in the Plaza, a small woman in black is going down the queue with a roll of paper, collecting names. The Mnemosarch watches her with an expression of great tenderness.', next: null },
    },
  },

  // ======================= I-5 The Mourners’ Petition: Rosamund and Marigold before the petition
  {
    id: 'dialogue:duskweaver-rosamund-canvass', name: 'I-5 Rosamund before the petition', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: RH, text: 'You’ll be the Keeper the stone sang for. (She has a roll of paper as long as she is, and a pencil behind her ear.) Two hundred names. Everyone who lost someone on the night of the Hollowing, and still remembers it every single evening.', next: 'night' },
      night: {
        speaker: RH, text: 'My Alfred went out for bread at dusk and the dark came down and took him. I remember the smell of the bread he never bought. Thirty years. I don’t want to forget Alfred. I want to forget the bread.',
        choices: [
          { text: 'Only the night. Not him.', to: 'only' },
          { text: 'What if you lose him with it?', to: 'lose' },
        ],
      },
      only: { speaker: RH, mood: 'sad', text: 'Only the night. That’s what we’re asking for, all of us. We’ve kept everything else. Let us put down one thing. Just one. My arms are very tired.', next: 'end' },
      lose: { speaker: RH, mood: 'afraid', text: 'That’s what the Mnemosarch says. That it’s all one thread, and if you pull one end the rest comes too. (She grips the roll.) I don’t believe him. I don’t want to believe him.', next: 'end' },
      end: { speaker: RH, text: 'We’ll be in the Plaza at moonrise. Will you stand with us? You don’t have to agree. Just stand where we can see you.', next: null },
    },
  },
  {
    id: 'dialogue:duskweaver-marigold-canvass', name: 'I-5 Marigold before the petition', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: MT, text: 'The petition. Yes. Half my Gardens is griefs, you know. People plant them and think they’re planting something else. (She leans on her rake.) Two hundred more, all at once? I’d want to know where they’re going before anyone decides.', effects: [{ setFlag: 'duskweaver.marigold_asked', value: true }], next: 'go' },
      go: {
        speaker: MT, text: 'If the Obelisk keeps them, they stay sharp. If the Veil takes them, they go down the Moonwell, and the Moonwell gives everything back in the end. Ask any fisherman.',
        choices: [
          { text: 'Is there another way?', to: 'other' },
          { text: 'You don’t trust the Veil.', to: 'veil' },
        ],
      },
      other: { speaker: MT, text: 'There’s always another way, in a garden. You can plant a thing and not pick it. Let it grow where you can go and sit with it. That’s a sort of keeping that doesn’t hurt. Nobody’s asked me, mind. Gardeners never get asked.', next: 'end' },
      veil: { speaker: MT, mood: 'angry', text: 'I trust the Veil to take money and drown things. That’s what they’re for. It’s the things that come back up that I don’t trust.', next: 'end' },
      end: { speaker: MT, text: 'I’ll be in the Plaza at the back, with my rake, in case anybody wants a gardener’s opinion. Nobody will.', next: null },
    },
  },

  // ======================= I-7 What the Mnemosarch Kept: the spilled stacks, telling Nyx
  clue('duskweaver-spill-1', 'I-7 the spilled shadows (1)', stage('quest:duskweaver-what-the-mnemosarch-kept', 'stacks'),
    'Bottled shadows have spilled off the east stacks across the floor, and every one of them is lying the same way, pointing deeper in, like grass after a flood. One is the shadow of a little girl being lifted onto somebody’s shoulders.',
    'duskweaver.spill_1', 'The east stacks, the floor swept clean.'),
  clue('duskweaver-spill-2', 'I-7 the spilled shadows (2)', stage('quest:duskweaver-what-the-mnemosarch-kept', 'stacks'),
    'Further in, the spilled shadows are thicker, and every one has a queue ticket tied to it with string, in the Mnemosarch’s neat hand. RETURNED, says each ticket. And on the back: ORIGINAL HERE.',
    'duskweaver.spill_2', 'A heap of queue tickets on the Archive floor.'),
  clue('duskweaver-spill-3', 'I-7 the spilled shadows (3)', stage('quest:duskweaver-what-the-mnemosarch-kept', 'stacks'),
    'At the end of the east stacks, at the thirteenth shelf, the spill stops dead, as if it had run into a wall. From behind the shelf, very faintly, comes a smell of lilac.',
    'duskweaver.lilac', 'The thirteenth shelf of the east stacks.', 'You have smelled that lilac before. On a phial, in the queue, that had no smell at all.'),
  {
    id: 'dialogue:duskweaver-nyx-told', name: 'I-7 Nyx learns what the Mnemosarch kept', scope: 'party',
    entries: [{ when: KNOWS, node: 'start_t' }, { node: 'start' }],
    nodes: {
      start: { speaker: NX, text: 'Rowena! You look as if you’ve seen a ghost. Have you? We have several. Sit down, dear, and tell me, slowly, so it sticks.', next: 'tell' },
      start_t: { speaker: NX, text: '{player.name}. You look as if you’ve seen a ghost. Sit down, and tell me slowly, so it sticks.', next: 'tell' },
      tell: {
        speaker: 'narrator', text: 'You tell her about the fourteenth shelf, and the long dark room, and the city on the table, every street of it, and the tiny figures in the windows. And the phials that smell of nothing.',
        choices: [
          { text: 'The phials he hands back are copies. He keeps the originals.', to: 'copies' },
          { text: 'Old Dunstan’s daughter. On his shoulders. She’s in one of the windows.', to: 'dunstan' },
          { text: 'He wants the Obelisk half in his own head.', to: 'head' },
        ],
      },
      copies: { speaker: NX, mood: 'afraid', text: 'Copies. (She puts her cup down very carefully.) Then all those people walked home holding a picture of a thing, and the thing itself is on a shelf in the dark. Thirty years of it. Oh, Oriel.', next: 'oriel' },
      dunstan: { speaker: NX, mood: 'sad', text: 'He gave Dunstan back his daughter’s face. A good copy. A perfect copy. And Dunstan has been looking at a perfect copy of his own child every morning and wondering why she doesn’t smell of anything.', next: 'oriel' },
      head: { speaker: NX, mood: 'afraid', text: 'In his head. All of Nocturne, in one man’s head, for ever, so that nothing is ever lost. (She closes her eyes.) Nothing would ever be lost. And nothing would ever be ours again.', next: 'oriel' },
      oriel: {
        speaker: NX, text: 'I taught him, you know. He was my best pupil. He never forgot a thing I told him, and I never once remembered telling him anything. I thought we balanced. I used to say so at parties.',
        choices: [
          { text: 'He’s frightened of losing things.', to: 'afraid' },
          { text: 'He has to be stopped, Loremistress.', to: 'stop' },
        ],
      },
      afraid: { speaker: NX, mood: 'sad', text: 'Everyone is frightened of losing things, dear. Most of us just lose them anyway and get on with it. Oriel never learned the getting on. I should have taught him that. I forgot.', next: 'go' },
      stop: { speaker: NX, text: 'Yes. Yes, he does. (She stands up, and for a moment she is not a muddled old woman in a nightgown at all.) Somebody in this city has to know when to let go. It had better be us.', next: 'go' },
      go: { speaker: NX, text: 'He’ll go round to the Obelisk’s shadow, the side the moon never sees. That’s where the stone lies. Get there first. And if you can, bring him back with something left of him.', next: null },
    },
  },

  // ======================= I-9 The Long Dusk Road: the last lamp-shadow
  {
    id: 'dialogue:obj-duskweaver-road-lamp', name: 'I-9 the last lamp-shadow on the road', scope: 'party',
    entries: [{ when: stage('quest:duskweaver-the-long-dusk-road', 'lamp'), node: 'lamp' }, { node: 'plain' }],
    nodes: {
      lamp: { speaker: 'narrator', text: 'At the edge of the city, on the long dusk road, the shadow of a lamp-post stands by itself where the last post was melted down thirty years ago. Hanging from its shadow-arm, on a real nail in nothing at all, is a paper lantern, lit.', next: 'nyx' },
      nyx: {
        speaker: NX, text: '(Beside you, a little out of breath.) Oh. They still do it. When somebody leaves Duskmere, the street hangs a lantern on the last post, so they can find their way back. I had forgotten. I had completely forgotten. Somebody knew you were going.',
        choices: [
          { text: '(Take the lantern.)', to: 'take', effects: [{ unlockLore: 'lore:hc-umbral-road-lamp' }, { setFlag: 'duskweaver.road_lantern', value: true }] },
          { text: '(Leave it lit, for the way back.)', to: 'leave', effects: [{ unlockLore: 'lore:hc-umbral-road-lamp' }] },
        ],
      },
      take: { speaker: NX, mood: 'happy', text: 'Good. Carry it. When you come back, hang it on the post again, and then the street will know you’re home. (She pats your arm.) This is as far as I go. I’d forget the way back otherwise. I may anyway.', next: null },
      leave: { speaker: NX, text: 'Good. Leave it. Then there’ll be a light at the end of the road when you come back up it. (She looks at it for a long time.) This is as far as I go, dear. Go on. I’ll stand here till you’re out of sight.', next: null },
      plain: { speaker: 'narrator', text: 'The last lamp-shadow on the long dusk road, with a paper lantern hanging from it.', next: null },
    },
  },
  {
    id: 'dialogue:area-duskweaver-dusk-road', name: 'I-9 banter: the long dusk road', bark: true,
    entries: [{ when: stage('quest:duskweaver-the-long-dusk-road', 'road'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'When you look back, the last lamp-shadow is still there, with the lantern on it, and a small figure in a coat beside it, waving. Then you look again, and she is waving at somebody else, very warmly, a long way off.', next: null } },
  },

  // ======================= Side: the Sweeper’s Detours (the last lamp)
  {
    id: 'dialogue:obj-duskweaver-last-lamp', name: 'The Sweeper’s Detours: the last lamp', scope: 'party',
    entries: [{ when: stage('quest:duskweaver-the-sweepers-detours', 'lamp'), node: 'lamp' }, { node: 'plain' }],
    nodes: {
      lamp: { speaker: 'narrator', text: 'In the old lamp-store at the end of the street, under a sheet, a single street-lamp with no post: brass, curly, its glass polished, its wick trimmed and new. Somebody has been looking after it every week for thirty years, and then not looking at it.', next: 'tag' },
      tag: {
        speaker: 'narrator', text: 'A tag on the handle, in a shaky hand: “The last one. Lit for the last time by A. Hewlett, the night they came for the posts. Do not light again until there is somewhere to hang it.”',
        choices: [
          { text: '(Carry it out and hang it on the nearest lamp-shadow.)', to: 'hang', effects: [{ setFlag: 'duskweaver.lamp_hung', value: true }] },
          { text: '(Leave it under its sheet, and tell Ambrose it is safe.)', to: 'safe' },
        ],
      },
      hang: { speaker: 'narrator', text: 'You hang it on the shadow of the first post in Ambrose’s street, and it hangs there, on nothing, and you light it. Down the street a door opens, and another, and a broom stops sweeping. The street has a light in it again.', next: null },
      safe: { speaker: 'narrator', text: 'You put the sheet back, very gently. When you tell Ambrose it is safe, he nods for a long time, and goes on sweeping, round a post that isn’t there, a little slower.', next: null },
      plain: { speaker: 'narrator', text: 'The old lamp-store at the end of Ambrose’s street.', next: null },
    },
  },

  // ======================= Side: His Radiance (the prince’s owner)
  {
    id: 'dialogue:duskweaver-marigold-prince', name: 'His Radiance: whose prince it was', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: MT, text: 'The prince-weed? (She wipes her hands.) The Cult grafted it off an old bed nobody tends. A pageant memory, very old. A boy crowned King of the Lanterns at a Turning fair, before the Hollowing. Everybody cheered.', next: 'who' },
      who: {
        speaker: MT, text: 'The bed it came off has no name-stake any more. Whoever he was, he’s forgotten it, or he’s gone. It was the happiest day of somebody’s life, and it’s been growing wild in a corner for thirty years.',
        choices: [
          { text: 'Plant it in the Rest, where people can visit it.', to: 'rest', when: { flag: 'duskweaver.mourners', op: '==', value: 'rest' }, effects: [{ setFlag: 'duskweaver.prince_bed', value: 'rest' }] },
          { text: 'Put a stake by it. “Somebody’s best day.”', to: 'stake', effects: [{ setFlag: 'duskweaver.prince_bed', value: 'stake' }] },
          { text: 'Let Bartholomew keep tending it.', to: 'cobble', effects: [{ setFlag: 'duskweaver.prince_bed', value: 'cobble' }] },
        ],
      },
      rest: { speaker: MT, mood: 'happy', text: 'In the Rest, under the yew, with the griefs. That’s right, you know. A good day, next to all those bad nights. They’ll be company for each other.', next: null },
      stake: { speaker: MT, mood: 'happy', text: '“Somebody’s best day.” (She writes it on a stake in big letters and drives it in.) People will stop and look at that. People always stop for a happy thing with no name on it.', next: null },
      cobble: { speaker: MT, text: 'A cobbler tending a prince. (She snorts.) He’d do it well, mind. He’s got good hands. I’ll send him a cutting. He can keep it on the windowsill, by the paper crown.', next: null },
    },
  },

  // ======================= Side: What Jasper Queued For (keeping his place)
  {
    id: 'dialogue:duskweaver-vane-jasper', name: 'What Jasper Queued For: Jasper’s place', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: OV, text: 'Jasper Grubb wants to keep his place in my queue? For ever? (He looks down the queue to where Jasper is dealing cards to Mrs Abney.) He has eleven friends in that queue and a tea rota. Of course he does.', next: 'rule' },
      rule: {
        speaker: OV, text: 'There’s no rule for it. There has never needed to be one. People come to the front, and they take their phial, and they go.',
        choices: [
          { text: 'Then make one. You’re good at keeping things.', to: 'make', trust: 1, trustNpc: OV },
          { text: 'Let him keep the place. Not the memory.', to: 'place' },
        ],
      },
      make: { speaker: OV, mood: 'happy', text: '(He takes out a fresh card and writes, very neatly.) “J. Grubb: place held in perpetuity. May let others go in front.” (He blots it.) There. Kept. Do you know, that is the nicest thing I have filed in years.', next: 'end' },
      place: { speaker: OV, text: 'The place, and not the memory. (He hesitates over the card, as if the idea were in a foreign language.) That is a very strange thing to keep. (He writes it anyway.) There. Held.', next: 'end' },
      end: { speaker: 'narrator', text: 'Down the queue, Jasper Grubb has just let a young woman with a baby go in front of him, and is explaining to Mrs Abney, with enormous satisfaction, that he has an arrangement.', next: null },
    },
  },

  // ======================= Side: the Shadow of a Cat (the saucer, Moll)
  {
    id: 'dialogue:obj-duskweaver-cat-saucer', name: 'The Shadow of a Cat: the saucer', scope: 'party',
    entries: [{ when: stage('quest:duskweaver-the-shadow-of-a-cat', 'saucer'), node: 'saucer' }, { node: 'plain' }],
    nodes: {
      saucer: { speaker: 'narrator', text: 'On the Archive step, a chipped blue saucer, dry for years, set exactly where the evening sun would have been. Round the rim, scratched with a pin, a name: INKPOT. And under it, smaller: AND T. Q.', next: 'shadow' },
      shadow: { speaker: 'narrator', text: 'Behind you, the cat’s shadow has come to the door of the Archive and is sitting very upright on the threshold, looking at the saucer, then at you, the way cats look at someone who has nearly understood.', effects: [{ setFlag: 'duskweaver.saucer_read', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'A chipped blue saucer on the Archive step.', next: null },
    },
  },
  {
    id: 'dialogue:duskweaver-moll-cat', name: 'The Shadow of a Cat: Moll remembers Inkpot', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: PM, text: 'Inkpot. (He takes his spectacles off.) Oh, Inkpot. Thessaly Quillon’s cat. She was Under-Keeper before me, forty years, and that cat sat on the third shelf of the west stacks every evening while she worked, in the last of the sun.', next: 'went' },
      went: {
        speaker: PM, mood: 'sad', text: 'Thessaly went first. Nine years ago, in her chair. Inkpot went the next week, on the shelf, in the sun. Nobody filled the saucer after that. I couldn’t. I put it out on the step so I wouldn’t have to look at it.',
        choices: [
          { text: 'The shadow’s still waiting for her.', to: 'waiting' },
          { text: 'You kept the saucer.', to: 'kept', trust: 1, trustNpc: PM },
        ],
      },
      waiting: { speaker: PM, text: 'Of course it is. A cat waits for whoever fed it. Shadows are worse; they don’t know how to stop. Go and sit with it. It knows you now. It’ll decide.', next: null },
      kept: { speaker: PM, mood: 'happy', text: 'I did, didn’t I. (He laughs, a little damply.) A Keeper to the bone. Go and sit with it. Tell it Thessaly said it could go now. She would have.', next: null },
    },
  },

  // ======================= Optional areas (Claude 2): finds round Duskmere
  {
    id: 'dialogue:obj-umbral-capital-ruin-find', name: 'Duskmere ruin: the first Obelisk', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'A broken stump of black stone in a ring of others, older than the Moon Obelisk: the first one, cracked across. Carved round its base: WHAT WE KEEP, WE KEEP SO THAT WE MAY LET IT GO. Someone, long after, has chiselled out the last four words. Someone else has chalked them back in.', effects: [{ unlockLore: 'lore:hc-umbral-capital-ruin' }], next: null } },
  },
  {
    id: 'dialogue:obj-umbral-capital-cave-find', name: 'Duskmere cave: the echo-well', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'At the bottom of the cave, a round pool that answers. Say a word into it and it gives the word back a moment later, softer, in somebody else’s voice. Say a name and it gives you back the last person who said that name here. You say your own. It answers in Nyx’s voice, getting it wrong.', effects: [{ unlockLore: 'lore:hc-umbral-capital-cave' }], next: null } },
  },
  {
    id: 'dialogue:obj-umbral-capital-cave-codex', name: 'Duskmere cave: a list on the wall', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'Scratched on the wall above the pool, a list in a careful hand: things somebody came here to say out loud once, so they would be said. “I’m sorry about the vase.” “I loved you first.” “It was me who ate the cake.” The last line: “I am going to forget all this. Good.”', effects: [{ unlockLore: 'lore:hc-umbral-capital-list' }], next: null } },
  },
  {
    id: 'dialogue:obj-umbral-capital-view-find', name: 'Duskmere viewpoint: Moonward Steps', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'From the top of the Moonward Steps all of Duskmere lies below in its long dusk, and every bottled shadow in every window points at the Moon Obelisk like a compass needle. On the step someone has painted, small: YOU ARE HERE. Then, smaller: PROBABLY.', effects: [{ unlockLore: 'lore:hc-umbral-capital-view' }], next: null } },
  },
  // ======================= ACT II, C-1 The Sexton’s Register: the Umbral corner
  {
    id: 'dialogue:obj-duskweaver-umbral-corner', name: 'C-1 the Umbral corner of the churchyard', scope: 'party',
    entries: [{ when: stage('quest:duskweaver-the-sextons-register', 'corner'), node: 'yews' }, { node: 'plain' }],
    nodes: {
      yews: { speaker: 'narrator', text: 'Under the yews in the far corner, a row of small stones with names on both faces: the used name on the front, for Brindlecross, and on the back, small, the kept name, for Nocturne. Thirty years of Umbral folk who came over for the Turning, and could not go home, and stayed.', next: 'bell' },
      bell: { speaker: 'narrator', text: 'A little bronze bell hangs from the lowest yew branch on a cord, worn bright where a hand pulls it. Pinned to the cord, a card in Hobb’s writing: “Rung at dusk for the Umbral corner by L. Aske, bell-ringer, of Duskmere. Do not touch. He minds.”', next: 'ask' },
      ask: {
        speaker: 'npc:hobb', text: '(Behind you, leaning on his spade.) Lowen Aske. Came over in ’12 to ring the Turning bells on the Citadel road, and the arches shut behind him. Deaf as a post now. Rings that bell every dusk, and if you ask him who for, he says he’s forgotten, but somebody’s owed it.',
        choices: [
          { text: 'A bell-ringer from the old tower in Duskmere. With a laugh like a door banging.', to: 'laugh', when: { trust: NX, value: 'friendly' }, effects: [{ setFlag: 'duskweaver.bellringer', value: true }] },
          { text: 'Somebody is owed it. Somebody always is.', to: 'owed' },
        ],
      },
      laugh: { speaker: 'npc:hobb', mood: 'happy', text: '(He stares at you.) That’s him. That’s Lowen to the life. How in the world… (He shakes his head.) He’ll be along at dusk. Don’t tell him I said he laughs like a door. He knows. He’s proud of it.', next: 'end' },
      owed: { speaker: 'npc:hobb', text: 'That’s what he says. Word for word. (He pats the nearest stone.) Keepers, you lot. Even the bell-ringers. You can’t help it.', next: 'end' },
      end: { speaker: 'narrator', text: 'You read the kept names on the backs of the stones, one by one, aloud, quietly, so they have been said by a Keeper once at least. It takes a while. Hobb waits without a word, which is the most a sexton can give.', next: null },
      plain: { speaker: 'narrator', text: 'The Umbral corner under the yews, with its little bronze bell.', next: null },
    },
  },

  // ======================= ACT II, C-2 Under the Roots: the fraying thread
  {
    id: 'dialogue:obj-duskweaver-last-record', name: 'C-2 the fraying thread of the last Turning', scope: 'party',
    entries: [{ when: stage('quest:duskweaver-under-the-roots', 'fraying'), node: 'catch' }, { node: 'plain' }],
    nodes: {
      catch: { speaker: 'narrator', text: 'You catch the thread as it slides past, and you are on the Citadel road in C. 1012, the 85th Turning, at dusk. Bells. Every tower on the road is ringing, one after another, the sound running up the hill towards the Citadel like a hand along a rail.', next: 'stop' },
      stop: { speaker: 'narrator', text: 'Then, one by one, from the top of the hill down, the bells stop. Not all at once. Each ringer stops when the silence reaches them, and looks up. The last bell on the road rings on for three strokes after the rest, because its ringer cannot hear that the others have stopped, and is laughing.', next: 'pull' },
      pull: {
        speaker: 'narrator', text: 'The thread tugs in your fingers. Something far below is drawing it down, slowly, unpicking it as it goes. It is the last record of that night anywhere in the world.',
        choices: [
          { text: '(Knot a thread of dusk round it, to hold it where it is.)', to: 'knot', school: 'umbral', effects: [{ setFlag: 'duskweaver.last_record', value: 'held' }] },
          { text: '(Let it go down. Follow it.)', to: 'go', effects: [{ setFlag: 'duskweaver.last_record', value: 'followed' }] },
        ],
      },
      knot: { speaker: 'narrator', text: 'You knot the dusk round it the way Nyx taught you to tie up a song. The thread stops sliding. Below, in the dark, something very large pauses, as if a hand had been laid on its back, and then goes on spinning, more slowly.', next: null },
      go: { speaker: 'narrator', text: 'You let it slide through your fingers. It goes down into the dark like a fishing line, and somewhere at the bottom of it, something is reeling it in, and grieving as it does.', next: null },
      plain: { speaker: 'narrator', text: 'A hollow in the root-caves where a thread runs down into the dark.', next: null },
    },
  },

  // ======================= ACT II, C-4 The Mnemosarch’s Lights: out along the causeway with Tabitha
  {
    id: 'dialogue:area-duskweaver-ford-causeway', name: 'C-4 banter: Tabitha on the causeway', bark: true,
    entries: [{ when: { any: [stage('quest:duskweaver-the-mnemosarchs-lights', 'escort'), stage('quest:duskweaver-the-mnemosarchs-lights', 'regroup')] }, node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Tabitha walks the causeway with her own lantern held high and her eyes on the stones, never on the water. “Rule one,” she says. “A light that comes to you is selling something. A light you carry is yours.” Out in the reeds, green lights bob politely, waiting to be followed.', next: null } },
  },

  // ======================= ACT II, C-5 The Lantern Queen: her sales-book
  clue('duskweaver-queen-ledger', 'C-5 the Lantern Queen’s sales-book', stage('quest:duskweaver-the-lantern-queen', 'ledger'),
    'A sales-book swollen with marsh-water, in a hand like weed. Three hundred years of lights sold to travellers. The last two hundred and twelve lines are all one buyer: “O. V. Paid in silver. Did not haggle.” Then, against the very last line: “O. V. asked had I a light of a woman whose face he could not remember. I had not. He cried. Gave him one for nothing.”',
    'duskweaver.queen_ledger', 'A swollen book on a drowned stump in the marsh.', 'Even the Lantern Queen, who drowned travellers for three hundred years, gave him one for nothing.'),

  // ======================= ACT II, C-6 A Letter from Nyx: the reply
  {
    id: 'dialogue:obj-duskweaver-reply-to-nyx', name: 'C-6 a reply for Nyx', scope: 'party',
    entries: [{ when: stage('quest:duskweaver-a-letter-from-nyx', 'reply'), node: 'satchel' }, { node: 'plain' }],
    nodes: {
      satchel: { speaker: 'narrator', text: 'Tansy’s courier satchel on the post by the Umbral arch, open, a pen in the strap and a sheet of the Keepers’ paper, very thin, the kind they use for things that ought to last. Tansy herself is sitting on the step with her eyes politely shut.', next: 'write' },
      write: {
        speaker: 'narrator', text: '“Come home and tell me if I have it right.” What do you send back?',
        choices: [
          { text: '(Write your name, large and clear. Under it: “You have it right.”)', to: 'name', effects: [{ setFlag: 'duskweaver.reply', value: 'name' }] },
          { text: '“There is a bell-ringer called Lowen Aske in Brindlecross. He rings at dusk. He says somebody is owed it.”', to: 'bell', when: { flag: 'duskweaver.bellringer' }, effects: [{ setFlag: 'duskweaver.reply', value: 'bell' }] },
          { text: '“Kept. All of it. Coming home when it is done.”', to: 'kept', effects: [{ setFlag: 'duskweaver.reply', value: 'kept' }] },
        ],
      },
      name: { speaker: 'narrator', text: 'You write it as large as the paper allows, the way you would write it for a child learning their letters, and fold it once. She will pin it to the drawer marked PEOPLE I HAVE MET, and read it every morning, and get it right every morning, until the morning she doesn’t need to.', next: 'tansy' },
      bell: { speaker: 'narrator', text: 'You write it carefully, every word, and do not add anything, because there is nothing to add that is yours to say. Nyx will read it and forget it and read it again. On one of those readings, you hope, she will hear a laugh like a door banging.', next: 'tansy' },
      kept: { speaker: 'narrator', text: 'You write it in the Keepers’ way, small and square, so that it will last. It is the shortest letter you have ever written. It says everything a Keeper can say to another.', next: 'tansy' },
      tansy: { speaker: 'npc:tansy-fogg', mood: 'happy', text: '(Opening her eyes, and taking the letter without looking at it, which is the courier’s rule.) Back through the arch, then. I’ve a feeling I’ll remember the way this time. (She tucks it inside her coat, against her heart.) I’ll give it to her myself. Twice, probably.', next: null },
      plain: { speaker: 'narrator', text: 'The post by the Umbral arch, where the courier’s satchel hung.', next: null },
    },
  },

  // ======================= ACT III, Nyx’s Kept Name: the landing, the leaving-lantern
  {
    id: 'dialogue:obj-duskweaver-stair-landing', name: 'Nyx’s Kept Name: the landing on the Umbral stair', scope: 'party',
    entries: [{ when: stage('quest:duskweaver-nyxs-kept-name', 'landing'), node: 'sit' }, { node: 'plain' }],
    nodes: {
      sit: { speaker: 'narrator', text: 'A landing halfway up the Umbral stair, out of the wind, where the dusk is soft and the Heart is only a noise. You sit on the step the way you sat in the Keepers’ Lodge as a child, with cocoa, being called by somebody else’s name.', next: 'names' },
      names: {
        speaker: 'narrator', text: 'Clementine. Cuthbert. Rowena. Marguerite. Ondine. You find you remember every wrong name she ever gave you, and the voice she said them in, and that each one was said with exactly the same love.',
        choices: [
          { text: '(Say them all aloud, once, and let them go.)', to: 'go' },
          { text: '(Keep them. They were yours too.)', to: 'keep', effects: [{ setFlag: 'duskweaver.wrong_names', value: true }] },
        ],
      },
      go: { speaker: 'narrator', text: 'You say them to the stair, softly, one after another, and the dusk takes them the way the Echo-Well does, and gives nothing back but quiet. What is left is the one name you came up here to say. It is very clear now.', next: null },
      keep: { speaker: 'narrator', text: 'You keep them, every one, in the drawer at the back of your head where you keep the smell of the Lodge kitchen. A Keeper is allowed a few things that are wrong and dear. Nyx would say so. Nyx would say it to someone else, by mistake.', next: null },
      plain: { speaker: 'narrator', text: 'A sheltered landing halfway up the Umbral stair.', next: null },
    },
  },
  {
    id: 'dialogue:obj-duskweaver-heart-lantern', name: 'Nyx’s Kept Name: a leaving-lantern at the Heart', scope: 'party',
    entries: [
      { when: { all: [stage('quest:duskweaver-nyxs-kept-name', 'lantern'), { flag: 'duskweaver.road_lantern' }] }, node: 'road' },
      { when: stage('quest:duskweaver-nyxs-kept-name', 'lantern'), node: 'camp' },
      { node: 'plain' },
    ],
    nodes: {
      road: { speaker: 'narrator', text: 'You still have it: the paper lantern from the last lamp-shadow on the long dusk road, a little crushed, carried through three realms. You hang it from a tent-pole at the edge of the Heart camp, facing home, and light it.', next: 'write' },
      camp: { speaker: 'narrator', text: 'The camp quartermaster gives you a paper lantern from the stores, the kind Concordia folk use for vigils. You hang it from a tent-pole at the edge of the Heart camp, facing home, the way the street did for you on the long dusk road, and light it.', next: 'write' },
      write: {
        speaker: 'narrator', text: 'On a leaving-lantern, Duskmere folk write the name of whoever is to find their way back by it.',
        choices: [
          { text: '(Write your own name.)', to: 'own' },
          { text: '(Write Nyx’s used name, Nyx Aubade, so that the Heart has it too.)', to: 'nyx' },
        ],
      },
      own: { speaker: 'narrator', text: 'Your name, in Keeper’s capitals, in black on the paper. Bearers passing it on the way to the stair glance up at it, and one or two of them, without quite knowing why, look the way you look when you are thinking of home.', next: null },
      nyx: { speaker: 'narrator', mood: 'happy', text: 'NYX AUBADE, in black on the paper. It is a very good name to light a way home by: it has never once been remembered by its owner, and has never once been lost.', next: null },
      plain: { speaker: 'narrator', text: 'A paper leaving-lantern on a tent-pole at the edge of the Heart camp, lit.', next: null },
    },
  },

  // ======================= ACT III, The Stolen Hours: your own phial, the shelf
  {
    id: 'dialogue:obj-duskweaver-button-phial', name: 'The Stolen Hours: the phial with your name', scope: 'party',
    entries: [{ when: stage('quest:duskweaver-the-stolen-hours', 'button'), node: 'phial' }, { node: 'plain' }],
    nodes: {
      phial: { speaker: 'narrator', text: 'The last phial, alone in the dust, labelled in Vane’s tidy hand with your name, and under it: “A small brown dog called Button, who ate a bishop’s glove. Original. Kept.” He gave you the copy in the queue, when you were small. He kept this one all this time.', next: 'open' },
      open: {
        speaker: 'narrator', text: 'Through the glass you can see, very faintly, a brown blur, a tail, a glove.',
        choices: [
          { text: '(Unstopper it.)', to: 'smell', effects: [{ setFlag: 'duskweaver.button', value: 'opened' }] },
          { text: '(Leave it stoppered. The copy has done well enough.)', to: 'shut', effects: [{ setFlag: 'duskweaver.button', value: 'kept' }] },
        ],
      },
      smell: { speaker: 'narrator', mood: 'happy', text: 'Wet dog, and the inside of a bishop’s glove, and the exact weight of a small brown head on your knee. You have remembered Button all your life. You had never once smelled him, until now.', next: null },
      shut: { speaker: 'narrator', text: 'You put it in your pocket, stoppered. The copy in your head has been a good dog for years. The original can come home with you and sit on a shelf in the Lodge, and be visited, which is what a rest is for.', next: null },
      plain: { speaker: 'narrator', text: 'A little dip in the dust of the Legion camp, where a phial lay.', next: null },
    },
  },
  {
    id: 'dialogue:obj-duskweaver-phial-shelf', name: 'The Stolen Hours: the opened phials by the fire', scope: 'party',
    entries: [
      { when: { all: [stage('quest:duskweaver-the-stolen-hours', 'shelf'), { flag: 'duskweaver.nemesis_fate', value: 'spared' }] }, node: 'spared' },
      { when: stage('quest:duskweaver-the-stolen-hours', 'shelf'), node: 'shelf' },
      { node: 'plain' },
    ],
    nodes: {
      shelf: { speaker: 'narrator', text: 'You set the empty phials in a row along a supply crate by the camp fire, stoppers out, the way the Archive keeps its opened bottles by the door: so everyone can see what went home. You chalk a label on the crate: OPENED.', next: 'look' },
      spared: { speaker: 'narrator', text: 'You set the empty phials in a row along a supply crate by the camp fire, stoppers out, the way the Archive keeps them. You have hardly finished when a thin man with ink on his fingers comes out of the dark, and stops, and looks at them.', next: 'vane' },
      vane: { speaker: OV, mood: 'sad', text: '(He does not touch them.) Opened. (After a long time.) They look better empty. I did not know that. I should like to have known that sooner. (He takes out a pencil, and writes on the crate, under your label, in his tidy hand: AND RETURNED.)', next: 'look' },
      look: { speaker: 'narrator', text: 'By morning, somebody in the camp has added a phial of their own to the end of the row, stopper out, empty. Then somebody else. Nobody says what was in them. That is not the point of a shelf like this.', next: null },
      plain: { speaker: 'narrator', text: 'A row of empty phials on a supply crate by the camp fire, labelled OPENED.', next: null },
    },
  },

  // ======================= ACT III, The Cat Comes Too: the prints, the saucer
  clue('duskweaver-paw-prints', 'The Cat Comes Too: two sets of prints', stage('quest:duskweaver-the-cat-comes-too', 'prints'),
    'Two sets of paw prints through the ash of the Legion camp, side by side, at a steady disgruntled trot. One set is a big cat’s, pressed deep. The other is dark, and does not quite touch the ground, and every few yards it goes up on its hind legs to look at the first set, adoringly.',
    'duskweaver.paw_prints', 'Paw prints in the ash, heading for the Heart camp.'),
  {
    id: 'dialogue:obj-duskweaver-heart-saucer', name: 'The Cat Comes Too: a saucer for the shadow', scope: 'party',
    entries: [{ when: stage('quest:duskweaver-the-cat-comes-too', 'saucer'), node: 'saucer' }, { node: 'plain' }],
    nodes: {
      saucer: { speaker: 'narrator', text: 'A chipped saucer from the camp cook, set down by the cook-fire in the last of the warmth, the way Thessaly Quillon filled one for Inkpot every evening. You have a pin. A saucer for a cat ought to have a name round the rim.', next: 'name' },
      name: {
        speaker: 'narrator', text: 'What do you scratch on it?',
        choices: [
          { text: 'INKPOT. AND T. Q.', to: 'inkpot', when: { flag: 'duskweaver.saucer_read' }, effects: [{ setFlag: 'duskweaver.heart_saucer', value: 'inkpot' }] },
          { text: 'PARSON’S.', to: 'parson', effects: [{ setFlag: 'duskweaver.heart_saucer', value: 'parson' }] },
          { text: '(Nothing. A shadow knows its own saucer.)', to: 'none', effects: [{ setFlag: 'duskweaver.heart_saucer', value: 'none' }] },
        ],
      },
      inkpot: { speaker: 'narrator', mood: 'happy', text: 'INKPOT. AND T. Q. The shadow comes and sits in front of it at once, very upright, exactly as it sat on the Archive threshold, and looks at you the way cats look at someone who has finally understood. Parson eats out of it anyway.', next: null },
      parson: { speaker: 'narrator', text: 'PARSON’S. Parson comes over, reads it, approves, and eats out of it. The shadow sits beside him with its tail round its feet and watches him eat, which appears, for a shadow, to be very nearly as good.', next: null },
      none: { speaker: 'narrator', text: 'You leave the rim blank. The shadow comes and sits in front of it, and looks at the saucer, and then at the fire, and then, for a long time, at you. Then it settles down to wait for whoever fills it, which is what it has always done best.', next: null },
      plain: { speaker: 'narrator', text: 'A chipped saucer by the cook-fire, licked clean.', next: null },
    },
  },

];

export default dialogues;
