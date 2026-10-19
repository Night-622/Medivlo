/** Dialogue: Act I Chapter 3, quests Q9–Q11 (the-reed-mother, the-boy-in-the-reeds, harrows-bargain). Q12 is in act1-ch3b.ts. Owner: Claude 4. */
import type { DialogueDef } from '@/core';

const Q9 = 'quest:the-reed-mother', Q10 = 'quest:the-boy-in-the-reeds', Q11 = 'quest:harrows-bargain';
const defied = { flag: 'prologue.hale_outcome', op: '==', value: 'defied' } as const;

const dialogues: DialogueDef[] = [
  {
    id: 'dialogue:ch3-hesta-word', name: 'Hesta: Word from Cinderhold',
    entries: [{ node: 'letter' }],
    nodes: {
      letter: { speaker: 'narrator', text: 'A refugee boy finds you with a letter folded very small. It smells of woodsmoke, and the hand is cramped and burned at the edges, as if the writer coughed on it.', next: 'read' },
      read: { speaker: 'npc:hesta-corrow', text: '"Enough allies to call it an army, if nobody counts too closely. But Varn sits in a ring of reed temples, and the Choir’s been fed all winter by someone. Go into Greywater and find out who. Start with the eel-folk at Fenwick; they’re still alive, which means they’ve paid for it. Don’t drown. H.C."' },
    },
  },
  {
    id: 'dialogue:ch3-agna-fenwick', name: 'Agna Fenn: The tithe',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'Fenwick stands on stilts above the black water: a dozen huts, eel-traps, smoke. Every window that faces the reeds has a black candle in it. A broad woman with a gutting-knife does not stop working as you climb the ladder.', next: 'agna' },
      agna: {
        speaker: 'npc:agna-fenn',
        text: 'If you’ve come from the Queen, you’re a year late. If you’ve come from the Choir, the tithe’s not due till the dark of the moon. Which is it?',
        choices: [
          { text: '"Neither. I’ve come for the Choir."', to: 'choir' },
          { text: '[Noble-born] "I come in the Crown’s name."', to: 'lords', when: { dialogueTag: 'noble-born' }, tag: 'trait' },
          { text: '[Show her the Ashmark]', to: 'mark' },
        ],
      },
      mark: { speaker: 'narrator', text: 'She looks at the light in your hand for a long moment, then wipes the knife and touches two fingers to the ash smeared on her doorpost.', next: 'mark2' },
      mark2: { speaker: 'npc:agna-fenn', text: 'Hearth and kin. So it’s true. They sing about a hand like that, over in the temple. They don’t sing it kindly.', next: 'choir' },
      lords: { speaker: 'npc:agna-fenn', mood: 'angry', text: 'The Crown’s name. I’ll tell you what the Crown’s name buys in Fenwick. Nothing. Not an arrow, not a sack of meal. Worse than nothing.', next: 'hint' },
      choir: {
        speaker: 'npc:agna-fenn',
        effects: [{ unlockLore: 'lore:fenwick', section: 'tithe' }],
        text: 'Every new moon a punt goes out to the reed temple with eels and peat and salt, and comes back empty. And when the Reed-Mother sings at the edge of the stilts, somebody always hears her and goes down the ladder into the water. Three this winter. The last was my sister’s girl. She was nine.',
        choices: [
          { text: '"Why not fight them?"', to: 'fight' },
          { text: '"I’m sorry."', to: 'sorry' },
        ],
      },
      sorry: { speaker: 'npc:agna-fenn', text: 'So am I. Sorry doesn’t mend nets.', next: 'fight' },
      fight: { speaker: 'npc:agna-fenn', text: 'With what? Gaff-hooks? I’ve buried two husbands and a son, and I’ll not bury Fenwick. We pay, and we live. And the Crown sent nobody. Worse than nobody.', next: 'hint' },
      hint: {
        speaker: 'npc:agna-fenn',
        effects: [{ setFlag: 'npc.agna-fenn.harrow_hint', value: true }],
        text: 'In the autumn, riders came down the causeway under the Lord Protector’s badge. We ran out on the stilts to cheer them. They met a reed-priest at the causeway end, talked the length of a pipe, and rode back the way they came. Not one of them looked at us.',
        next: 'offer',
      },
      offer: {
        speaker: 'npc:agna-fenn',
        text: 'You’ll be wanting into the reed temple, then. Nobody walks in there who isn’t wet. I pulled a drowned acolyte out of my eel-trap at Lanternmass. Kept his robes. Don’t ask me why.',
        choices: [
          { text: '"What happened at Varn?"', to: 'varn', once: true },
          { text: '"Give me the robes, and Fenwick pays no more tithe. I swear it."', to: 'swear', tag: 'persuade', check: { stat: 'will', dc: 15, failTo: 'doubt' } },
          { text: '"Hand them over. Now."', to: 'threat', tag: 'intimidate' },
          { text: '"Keep them. I’ll find my own way in."', to: 'own' },
        ],
      },
      varn: { speaker: 'npc:agna-fenn', mood: 'sad', effects: [{ unlockLore: 'lore:varn' }], text: 'The night the stars fell, Lord Aldwin opened the floodgates himself. We saw the town lights go under one street at a time. You can still hear the bells, on a still night. He’s in there yet, they say, with his wife and his little girl. And they’re both a year dead.', next: 'offer' },
      swear: { speaker: 'npc:agna-fenn', effects: [{ giveItem: 'item:choir-robes' }, { setFlag: 'npc.agna-fenn.trust', value: true }], text: '(She looks at you the way she would look at weather.) …Then swear it on something that floats. Here. They stink of the deep water. Good. So will you.' },
      doubt: { speaker: 'npc:agna-fenn', effects: [{ giveItem: 'item:choir-robes' }], text: 'Swearing’s cheap in the marsh. The Lord Protector’s riders swore things too. Take them anyway. You can’t do worse than nothing.' },
      threat: { speaker: 'npc:agna-fenn', mood: 'angry', effects: [{ giveItem: 'item:choir-robes' }, { setFlag: 'npc.agna-fenn.scorned', value: true }], text: 'I’ve been threatened by the Reed-Mother, child, and she can drown a girl by singing at her. (She throws the robes at your feet.) Take them and get off my stilts.' },
      own: { speaker: 'npc:agna-fenn', text: 'Your funeral. Mind the deep channels. The reeds lie about where the bottom is.' },
    },
  },
  {
    id: 'dialogue:ch3-agna-general', name: 'Agna Fenn: General',
    entries: [
      { when: { flag: 'act1.complete' }, node: 'free' },
      { when: { questCompleted: Q9 }, node: 'temple' },
      { node: 'idle' },
    ],
    nodes: {
      idle: { speaker: 'npc:agna-fenn', text: 'Eels don’t gut themselves. Was there something?' },
      temple: { speaker: 'npc:agna-fenn', text: 'The reed temple’s burning. We watched it from the stilts all night and nobody said a word. Then old Cob started to laugh, and then we all did.' },
      free: { speaker: 'npc:agna-fenn', mood: 'happy', text: 'Dark of the moon came and went, and nobody walked into the water. First time in a year. We’ve taken the black candles out of the windows. Fenwick won’t forget you. Fenwick never forgets anything; ask my husbands.' },
    },
  },
  {
    id: 'dialogue:oswin-reeds', name: 'Oswin: Among the reeds',
    entries: [
      { when: { any: [{ flag: 'npc.oswin.helped' }, { flag: 'npc.oswin.betrayed' }, { flag: 'npc.oswin.left' }] }, node: 'after' },
      { node: 'start' },
    ],
    nodes: {
      start: { speaker: 'narrator', text: 'Among the acolytes kneeling in the shallows is a face you know. Oswin the Miller, in robes of woven reed. The flour is long gone from his hands, and the corners of his eyes have begun to run black.', next: 'oswin' },
      oswin: {
        speaker: 'npc:oswin', mood: 'hollow',
        text: 'You. You came all the way to Greywater. She said you would. The Reed-Mother says Edith is close here, closer than she ever was in the mere. I hear her in the reeds at night. She’s nearly finished her sleeping.',
        choices: [
          { text: '"Edith is dead, Oswin. You knew it in the mill. Help me."', to: 'help', tag: 'persuade', check: { stat: 'will', dc: 15, failTo: 'betray' } },
          { text: '[Hollow-touched] "I hear them too. That isn’t Edith. It’s the water, wearing her voice."', to: 'help', when: { dialogueTag: 'hollow-touched' }, tag: 'trait' },
          { text: '"Show me where the Reed-Mother keeps her secrets, or I tell them what you did in Brindlecross."', to: 'betray', tag: 'intimidate' },
          { text: '"Go home, Oswin."', to: 'left' },
        ],
      },
      help: {
        speaker: 'npc:oswin', mood: 'sad',
        effects: [{ setFlag: 'npc.oswin.helped', value: true }],
        text: '(A long silence. Then he wipes his eyes, and looks at the black on his fingers.) …Seven forgive me. Behind the reed-screen there’s a box sealed with black wax. Letters, from a lord. She reads them aloud to us at the night-hymn, and laughs.',
        next: 'help2',
      },
      help2: {
        speaker: 'npc:oswin', mood: 'sad', text: 'When it’s done… will you tell me the truth? Is she Below?',
        choices: [
          { text: '"No. She’s at rest, wherever the dead go."', to: 'rest' },
          { text: '"I don’t know."', to: 'know' },
        ],
      },
      rest: { speaker: 'npc:oswin', mood: 'sad', text: 'Then I’ve been singing to nobody. (He almost smiles.) Edith always said I couldn’t carry a tune.' },
      know: { speaker: 'npc:oswin', mood: 'sad', text: 'No. Nobody does. That’s the trouble, isn’t it. That’s the whole trouble.' },
      betray: { speaker: 'npc:oswin', mood: 'hollow', text: '(He smiles, much too calmly.) You’re right. Of course you’re right. Come, I’ll show you the way.', next: 'bell' },
      bell: { speaker: 'narrator', effects: [{ setFlag: 'npc.oswin.betrayed', value: true }], text: 'He leads you three steps into the reeds. Then he takes a little reed-bell from his sleeve and rings it, and goes on ringing it, weeping, as the reeds all around you begin to move. "I’m sorry. She’s so close now. I can’t lose her twice."' },
      left: { speaker: 'npc:oswin', mood: 'sad', effects: [{ setFlag: 'npc.oswin.left', value: true }], text: 'Home. There’s no mill in Greywater, and no flour, and nobody wants bread. I don’t think I have a home. Go on, before the priests see you talking to me.' },
      after: { speaker: 'npc:oswin', mood: 'hollow', text: '(He is singing to the water, under his breath, and does not look up.)' },
    },
  },
  {
    id: 'dialogue:obj-harrow-letters', name: 'Object: The Reed-Mother’s letters',
    entries: [
      { when: { flag: 'act1.harrow_letters' }, node: 'empty' },
      { when: { questStage: Q9, stage: 'letters' }, node: 'sanctum' },
      { node: 'shut' },
    ],
    nodes: {
      shut: { speaker: 'narrator', text: 'A screen of reeds woven tight as cloth, smelling of standing water. Acolytes kneel before it in the shallows, and none of them will look at you.' },
      empty: { speaker: 'narrator', text: 'The black-wax box stands open in the shell-basin. There is nothing in it now but water.' },
      sanctum: {
        speaker: 'narrator',
        text: 'Behind the reed-screen: a basin of black water rimmed with shells, a cot of rushes, and on a stone at its heart a box sealed with black wax. The acolyte at the screen is singing with his eyes shut.',
        choices: [
          { text: '[Choir robes] Bow your head and walk past him, as one of them.', to: 'quiet', when: { hasItem: 'item:choir-robes' } },
          { text: '[Shade] Slip through the screen where the weave is thin.', to: 'quiet', when: { classIs: 'class:shade' }, tag: 'class' },
          { text: 'Work the wax open without breaking it.', to: 'quiet', check: { stat: 'finesse', dc: 15, failTo: 'crack' } },
          { text: 'Break the box open.', to: 'crack', tag: 'aggressive' },
        ],
      },
      crack: { speaker: 'narrator', text: 'The wax splits with a crack like ice. The acolyte’s song falters, then goes on, a little louder. Somewhere across the water, another voice takes it up.', next: 'box' },
      quiet: { speaker: 'narrator', text: 'Nobody stirs. The singing goes on, soft and even, like rain on a roof.', next: 'box' },
      box: {
        speaker: 'narrator',
        // the find itself grants the letters and starts Q11, so closing the scene early can't strand the story
        effects: [
          { giveItem: 'item:harrow-letters' }, { setFlag: 'act1.harrow_letters', value: true },
          { startQuest: Q11 }, { unlockLore: 'lore:osric-harrow' },
        ],
        text: 'Inside lie a dozen letters in a soldier’s square hand, sealed with a signet you saw on the banners at Haldren: a harrow over a crown.', next: 'read' },
      read: {
        speaker: 'narrator',
        text: '"To the Mother of the Reeds. The Kingsvale holds. My riders will not pass the causeway end. You will keep your Hollowed from the Kingsvale fords until the thaw, and Varn is yours to sing to. I do not ask what you do there. O. H., Lord Protector."',
        choices: [
          { text: 'Look at the dates.', to: 'dates', tag: 'lore', check: { stat: 'intellect', dc: 15, failTo: 'take' } },
          { text: 'Take them.', to: 'take' },
        ],
      },
      dates: { speaker: 'narrator', effects: [{ setFlag: 'npc.osric-harrow.dates_known', value: true }], text: 'The first letter is dated nine days before King Aldred died. Osric Harrow was bargaining with the Drowned Choir while his king still lived.', next: 'take' },
      take: {
        speaker: 'narrator',
        text: 'You fold the letters inside your coat. Behind you, very softly, a woman has begun to sing.',
      },
    },
  },
  {
    id: 'dialogue:ch3-reed-mother-sermon', name: 'The Reed-Mother: Baptism',
    entries: [{ node: 'come' }],
    nodes: {
      come: { speaker: 'narrator', text: 'She comes through the reed-screen without parting it; the reeds bend round her as water bends round a swimmer. She is very tall, robed in woven rushes, and her face is calm as a pond. Black water runs from her eyes and does not fall.', next: 'hush' },
      hush: {
        speaker: 'npc:reed-mother',
        text: 'Hush, now. Suun, waa’el. You’ve read them. I don’t mind. Lords write to me the way children write to the sea, as if it could be bargained with.',
        choices: [
          { text: '"Harrow trusted you."', to: 'harrow' },
          { text: '"This temple stands on a seep. You built it on the Mire’s own mouth."', to: 'seep', tag: 'lore', check: { stat: 'intellect', dc: 15, failTo: 'harrow' } },
          { text: '[Scholar] "Ooluun ae Nhal, maa’reh suun. Below is Nhal; there, sleep. Your own hymn."', to: 'seep', when: { dialogueTag: 'scholar' }, tag: 'trait' },
          { text: '[Reaver] "You burn your own warmth for power. So do I."', to: 'reaver', when: { classIs: 'class:reaver' }, tag: 'class' },
          { text: '[Devout] "The Seven will judge you."', to: 'devout', when: { dialogueTag: 'devout' }, tag: 'trait' },
        ],
      },
      harrow: { speaker: 'npc:reed-mother', text: 'He trusted that the water would wait. And it does wait. It is very patient. It waited for the world to be made, and it can wait for the world to be finished.', next: 'bless' },
      seep: { speaker: 'npc:reed-mother', effects: [{ unlockLore: 'lore:the-black-seep' }], text: 'On her breath, child. We call it the Black Seep. Below breathes there, slow, like a sleeper. One night soon she will breathe out, and the whole marsh will be the sea again, and nobody will be cold.', next: 'bless' },
      reaver: { speaker: 'npc:reed-mother', text: 'I know. I can smell it on you, the warmth you spend. Why spend it on the cold ones up above? Give it to the water. It’s what your blood has wanted all along.', next: 'bless' },
      devout: { speaker: 'npc:reed-mother', text: 'The Seven are sparks off a hammer, little warmth. Sparks go out. Only the water stays.', next: 'bless' },
      bless: { speaker: 'npc:reed-mother', text: 'Come, then. Let me baptise you. It doesn’t hurt for long, and afterwards nothing ever hurts again.' },
    },
  },
  {
    id: 'dialogue:reed-mother-death', name: 'The Reed-Mother: Last words',
    entries: [{ node: 'fall' }],
    nodes: {
      fall: { speaker: 'narrator', text: 'The Reed-Mother sinks to her knees in the shallows. All around the temple the reeds are turning black and folding over, like a field after frost.', next: 'cold' },
      cold: {
        speaker: 'npc:reed-mother', mood: 'hollow',
        effects: [{ unlockLore: 'lore:the-drowned-tongue', section: 'reed-mother' }],
        text: 'Oh. It’s cold. They told me it wouldn’t be cold. (She is not speaking to you, but to the water.) Nhal neh suun. Nhal aa’mhuun. …You think this is an ending. It is only a tide going out. She is coming, little warmth. The Pale Saint herself, to Varn, to sit by the drowned lord’s fire and wait for you.',
        choices: [
          { text: '"Ysolde."', to: 'name' },
          { text: '"Let her come."', to: 'come' },
          { text: '[Say nothing]', to: 'gone' },
        ],
      },
      name: { speaker: 'npc:reed-mother', mood: 'hollow', text: 'You know her name. She said you would. She weeps for you, you know. She weeps for all of us.', next: 'gone' },
      come: { speaker: 'npc:reed-mother', mood: 'hollow', text: 'Oh, she will. She will. And you’ll be so glad to see her.', next: 'gone' },
      gone: { speaker: 'narrator', effects: [{ setFlag: 'act1.ysolde_at_varn', value: true }], text: 'She sighs once and is still, and the black water takes her very gently, as though it were sorry.' },
    },
  },
  {
    id: 'dialogue:tobin-reeds', name: 'Tobin: The boy in the reeds',
    entries: [
      { when: { any: [{ flag: 'act1.tobin_saved' }, { flag: 'act1.tobin_lost' }] }, node: 'gone' },
      { when: { questStage: Q10, stage: 'reeds' }, node: 'start' },
      { node: 'gone' },
    ],
    nodes: {
      start: { speaker: 'narrator', text: 'Maren stops so suddenly you walk into her. Tobin is standing waist-deep among the reeds, a year taller, his red hair dark with water. The black from his eyes has run all the way down to his collar. He is singing a cradle-song, and the voice coming out of him is a woman’s.', next: 'mam' },
      mam: { speaker: 'npc:tobin-hollis', mood: 'hollow', text: 'Maren. My lamb. You’ve grown so thin. Come into the water, it’s warm here. Mam’s here. Mam’s been here all along.', next: 'maren' },
      maren: {
        speaker: 'npc:maren-hollis', mood: 'afraid',
        text: 'That’s not her. That’s not her voice, Tobin, it’s in you, it’s wearing you. …{player.name}. You’ve more of the fire now. I’ve seen it. Please.',
        choices: [
          { text: '[Briar-salve] Rub the salve on him, then burn the Mire out.', to: 'salve', when: { hasItem: 'item:briar-salve' } },
          { text: 'Burn the Mire out of him, slowly. The mark is stronger now; hold it to a thread.', to: 'burn-ok', when: { flag: 'ashmark.rank', op: '>=', value: 2 }, check: { stat: 'will', dc: 15, failTo: 'burn-fail' } },
          { text: 'Burn the Mire out of him.', to: 'burn-ok', when: { not: { flag: 'ashmark.rank', op: '>=', value: 2 } }, check: { stat: 'will', dc: 20, failTo: 'burn-fail' } },
          { text: '"Maren, sing to him. Your voice, not hers."', to: 'sing', once: true },
          { text: '"Let him go, Maren. The water has him."', to: 'let-go', tag: 'aggressive' },
        ],
      },
      sing: {
        speaker: 'narrator',
        text: 'Maren’s voice cracks on the first line, then steadies. It is the same cradle-song, sung flat and rough, the way a girl of twelve sang it to her brother when there was nobody left to sing it to either of them. The woman’s voice falters. For a moment Tobin’s mouth moves with his sister’s.',
        choices: [
          { text: 'Now. Burn it out while he’s listening to her.', to: 'burn-ok', check: { stat: 'will', dc: 10, failTo: 'burn-fail' } },
          { text: '[Briar-salve] Rub the salve on him while she sings.', to: 'salve', when: { hasItem: 'item:briar-salve' } },
        ],
      },
      salve: { speaker: 'narrator', effects: [{ takeItem: 'item:briar-salve' }], text: 'The salve smokes on his skin, and the black rises through him like ink through paper. You lay your hand on his chest and the Ashmark answers.', next: 'burn-ok' },
      'burn-ok': { speaker: 'narrator', text: 'You draw the Mire out of him the way a tide draws back from the shore: slowly, slowly, and then all at once. The black runs out of his eyes and into the marsh, and the water hisses where it falls. The woman’s voice stops in the middle of a word.', next: 'saved' },
      saved: {
        speaker: 'npc:tobin-hollis', mood: 'afraid',
        effects: [{ setFlag: 'act1.tobin_saved', value: true }, { loyalty: 'npc:maren-hollis', delta: 40 }],
        text: 'Maren? I was… Mam was singing. Only it wasn’t Mam. It had too many voices. It was so cold, Maren, it was so cold the whole time…',
        next: 'saved2',
      },
      saved2: { speaker: 'npc:maren-hollis', mood: 'happy', text: 'Hush. Hush, I’ve got you. I’ve got you, you great stupid lump. (Over his shoulder her eyes find yours, and she cannot say anything at all.)' },
      'burn-fail': { speaker: 'narrator', text: 'The fire catches and holds, and then the water closes over it. Tobin looks at you with his own eyes, just once, very surprised. Then he steps backwards into the reeds, and the reeds close, and the singing goes on without him.', next: 'lost' },
      'let-go': { speaker: 'narrator', text: 'Maren goes in after him up to her chest before you can drag her back. By then there is nothing to drag her back from. The reeds are swaying, and the song is very far away.', next: 'lost' },
      lost: { speaker: 'npc:maren-hollis', mood: 'angry', effects: [{ setFlag: 'act1.tobin_lost', value: true }, { loyalty: 'npc:maren-hollis', delta: -20 }], text: '…They did this. The Choir, with their hymns and their black water. I’ll find every one of them, {player.name}. Every last singing one. Don’t you dare try to stop me.' },
      gone: { speaker: 'narrator', text: 'The reeds hiss in the wind. Nothing is singing here now.' },
    },
  },
  {
    id: 'dialogue:harrow-confront', name: 'Harrow: The bargain',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'The Lord Protector is alone in the throne room after the court has gone, bent over a map of the Kingsvale fords weighted with daggers. He looks at the letters in your hand and does not trouble to pretend.', next: 'ah' },
      ah: {
        speaker: 'npc:osric-harrow',
        text: 'Ah. I wondered who would bring those back to me. I had hoped it would be the Reed-Mother, asking for more.',
        choices: [
          { text: '"You sold Varn to the Choir."', to: 'sold' },
          { text: '"Why?"', to: 'why' },
        ],
      },
      sold: { speaker: 'npc:osric-harrow', text: 'Varn was sold the night Aldwin opened his own gates. I did not sell it. I declined to buy it back with men I do not have.', next: 'why' },
      why: { speaker: 'npc:osric-harrow', effects: [{ unlockLore: 'lore:osric-harrow', section: 'bargain' }], text: 'Do you know how many spears the Haldmarch had left, after the Grey Lung and the first winter? I do. I have counted them. I had the choice of a war I would lose in a month, or a letter. I wrote the letter. The Hollowed stayed out of the fords. Haldren ate. I bought my people a winter.', next: 'offer' },
      offer: {
        speaker: 'npc:osric-harrow',
        text: 'So. You may take those to a frightened girl of fifteen and watch her choose between her regent and her pride, in a hall full of the Wick’s ears. Or you may give them to me, and I will give you every spear I have for Varn. The bargain was only ever for a winter.',
        choices: [
          { text: '"The first letter is dated before King Aldred died."', to: 'dates', once: true, when: { flag: 'npc.osric-harrow.dates_known' }, tag: 'lore' },
          { text: '[Noble-born] "You swore an oath to her father."', to: 'oath', once: true, when: { dialogueTag: 'noble-born' }, tag: 'trait' },
          { text: '[Oathbound] "You bargained with the Drowned. The Lantern has a word for that."', to: 'lantern', once: true, when: { classIs: 'class:oathbound' }, tag: 'class' },
          { text: '"Then tell her yourself. A soldier doesn’t hide behind a stranger."', to: 'confess', tag: 'persuade', check: { stat: 'will', dc: 15, failTo: 'refuse' } },
          { text: '"I’ll think on it."', to: 'noon' },
        ],
      },
      dates: { speaker: 'npc:osric-harrow', mood: 'afraid', text: '(For the first time, he looks away.) Aldred was dying. Everyone knew it but the priests. Somebody had to think past the funeral.', next: 'offer' },
      oath: { speaker: 'npc:osric-harrow', mood: 'angry', text: 'I swore to keep his kingdom. I never swore to keep it pretty.', next: 'offer' },
      lantern: { speaker: 'npc:osric-harrow', mood: 'angry', text: 'Spare me. Your Church barred its doors on Varn the same week I did, and it had no army to lose. Solenne writes letters to the dark too. It simply prays over them first.', next: 'offer' },
      confess: { speaker: 'npc:osric-harrow', effects: [{ setFlag: 'npc.osric-harrow.confessed', value: true }], text: '(He is quiet a long while.) …Very well. If she must hear it, she will hear it from me. I will not have it said that Osric Harrow hid behind anyone.', next: 'noon' },
      refuse: { speaker: 'npc:osric-harrow', text: 'No. You will do what you will do, and so shall I. That is how it has always been done in this hall.', next: 'noon' },
      noon: { speaker: 'npc:osric-harrow', text: 'The Queen holds court at noon. Whatever you decide, decide it before then.' },
    },
  },
  {
    id: 'dialogue:aldith-judgement', name: 'Aldith: The judgement',
    entries: [{ when: { questStage: Q11, stage: 'choice' }, node: 'start' }, { node: 'done' }],
    nodes: {
      done: { speaker: 'npc:queen-aldith', text: 'It is decided. I would rather not speak of it again today.' },
      start: {
        speaker: 'narrator',
        text: 'The throne room is cold enough to see your breath. Queen Aldith sits very straight on a throne made for a grown man. Osric Harrow stands at her right hand. At her left stands the Church.',
        choices: [
          { text: '[The Inquisitor]', to: 'hale', when: { not: defied } },
          { text: '[The Prior]', to: 'benedek', when: defied },
        ],
      },
      hale: { speaker: 'narrator', text: 'Inquisitor Garrick Hale, in his black coat. At his belt the Last Wick leans toward your hand like a dog toward its master.', next: 'hale2' },
      hale2: { speaker: 'npc:garrick-hale', text: 'Ashmarked. The Lord-Inquisitor sends his regards. And his interest.', next: 'aldith' },
      benedek: { speaker: 'narrator', text: 'Hale is not here; Hale is said to be hunting you. Prior Benedek of Haldren stands in his place, twisting the cord of his habit.', next: 'benedek2' },
      benedek2: { speaker: 'npc:prior-benedek', mood: 'afraid', text: 'The Lord-Inquisitor bids me speak for the Lantern in this hall. I would very much rather not. Please. Do go on.', next: 'aldith' },
      aldith: {
        speaker: 'npc:queen-aldith',
        text: 'The Lord Protector says you have brought me something from the reeds. Give it plainly. I am tired of being handled.',
        choices: [
          { text: '[Harrow steps forward]', to: 'confess', when: { flag: 'npc.osric-harrow.confessed' } },
          { text: '"Majesty, your Lord Protector has been treating with the Drowned Choir. Read them yourself."', to: 'expose', when: { not: { flag: 'npc.osric-harrow.confessed' } } },
          { text: '"Nothing worth your time, Majesty. The Lord Protector is ready to march on Varn."', to: 'keep', when: { not: { flag: 'npc.osric-harrow.confessed' } } },
          { text: 'Turn from the throne and give the letters to the Church.', to: 'wick' },
        ],
      },
      confess: {
        speaker: 'npc:osric-harrow',
        text: 'Majesty. These are my letters, to the Reed-Mother of the Drowned Choir. I wrote them to keep your city fed, and I would write them again. I ask no pardon. I ask only that you read them through before you judge.',
        choices: [
          { text: '"Read them, Majesty."', to: 'expose' },
          { text: 'Give the letters to the Church instead.', to: 'wick' },
        ],
      },
      expose: { speaker: 'narrator', text: 'She reads them all, one after another, while the hall holds its breath. Her hands do not shake. At the third letter her mouth goes thin; at the last she folds them very neatly and sets them on her knee.', next: 'expose2' },
      expose2: { speaker: 'npc:queen-aldith', text: 'Lord Protector. Is this your hand?', next: 'expose3' },
      expose3: { speaker: 'npc:osric-harrow', text: 'It is, Majesty. And it bought you this winter. Every loaf in Haldren.', next: 'expose4' },
      expose4: {
        speaker: 'npc:queen-aldith',
        text: 'It bought my winter with Varn’s children. (Her voice wavers once, and does not again.) I will not begin my reign with an axe, my lord. You will leave Haldren by nightfall, and you will not come back.',
        choices: [
          { text: '"That is just, Majesty."', to: 'expose-end' },
          { text: '"He did keep Haldren fed."', to: 'fed' },
        ],
      },
      fed: { speaker: 'npc:queen-aldith', mood: 'sad', text: 'Yes. That is the worst of it.', next: 'expose-end' },
      'expose-end': { speaker: 'npc:osric-harrow', effects: [{ setFlag: 'act1.ruler', value: 'aldith' }, { reputation: 'faction:crown-of-haldmarch', delta: 15 }, { takeItem: 'item:harrow-letters' }], text: '(He bows, exactly as low as courtesy requires.) Majesty. When the Choir comes up the fords next winter, remember that I warned you.' },
      keep: { speaker: 'narrator', text: 'Harrow’s eyes meet yours across the hall, and nothing at all moves in his face.', next: 'keep2' },
      keep2: { speaker: 'npc:queen-aldith', text: '(She looks from you to him, and back.) …Is that all? Very well. Lord Protector, you shall have your march.', next: 'keep3' },
      keep3: {
        speaker: 'npc:osric-harrow',
        effects: [
          { setFlag: 'act1.ruler', value: 'harrow' }, { reputation: 'faction:crown-of-haldmarch', delta: -5 },
          { takeItem: 'item:harrow-letters' }, { setFlag: 'npc.osric-harrow.owes_player', value: true },
        ],
        text: '(Later, in the corridor, he holds out his hand for the letters and feeds them to a brazier one by one.) I shan’t forget this. You may take that however you like.',
      },
      wick: {
        speaker: 'narrator', text: 'You turn your back on the throne and put the letters into the Church’s hands.',
        choices: [
          { text: '[Hale reads]', to: 'wick-hale', when: { not: defied } },
          { text: '[Benedek reads]', to: 'wick-benedek', when: defied },
        ],
      },
      'wick-hale': { speaker: 'npc:garrick-hale', text: 'Treating with the Drowned. In a Lantern kingdom. (He looks up, and he is almost sorry.) By the authority of the Order of the Wick, I declare this Crown unfit to keep its own walls. The Order will keep them until the Lord-Inquisitor says otherwise.', next: 'wick-end' },
      'wick-benedek': { speaker: 'npc:prior-benedek', mood: 'afraid', text: 'Oh. Oh, Seven. I shall have to send these to the Lord-Inquisitor. I shall have to, do you understand? He reads everything. He will read this, and then he will come.', next: 'wick-end' },
      'wick-end': { speaker: 'npc:queen-aldith', mood: 'angry', text: 'You have given my kingdom to Solenne. I hope the Lord-Inquisitor thanks you for it. I never shall.', next: 'wick-law' },
      'wick-law': {
        speaker: 'narrator',
        effects: [
          { setFlag: 'act1.ruler', value: 'wick' }, { takeItem: 'item:harrow-letters' },
          { reputation: 'faction:lanternate', delta: 20 }, { reputation: 'faction:crown-of-haldmarch', delta: -20 },
        ],
        text: 'Within the week the wick-scissors hang over every gate in Haldren. Harrow keeps his title and none of what it meant. The Order’s soldiers will march on Varn, and the Order will decide who is marked.',
      },
    },
  },
];

export default dialogues;
