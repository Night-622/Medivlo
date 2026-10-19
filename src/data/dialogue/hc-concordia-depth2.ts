/**
 * Hollow Crown, shared Act II depth pass, part 2 (10-campaign-style.md §8): the Brindlecross fourteen’s
 * TRUST branches (about them, not the plot; opened from their general talk), travel banter on the spine,
 * and the new stages of A Warm Bed and Wake the Waystones. Every class plays these. Owner: Claude 4 (written by Claude 5).
 */
import type { DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const NIGHT: NarrativeCondition = { hour: [20, 5] };

/** a travel bark: one narrator line while the stage runs */
function bark(id: string, name: string, when: NarrativeCondition, text: string): DialogueDef {
  return { id: `dialogue:area-${id}`, name, bark: true, entries: [{ when, node: 'b' }], nodes: { b: { speaker: 'narrator', text, next: null } } };
}

const dialogues: DialogueDef[] = [
  // ======================= TRUST branches (Friendly or Trusted), one per Brindlecross NPC
  {
    id: 'dialogue:cc-maren-confide', name: 'Maren (Friendly): the pelt',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:maren', text: '(She sees you looking at the pelt on her shoulders.) Go on. Everyone asks eventually. Most of them ask Wil instead, which is worse.', next: 'burr' },
      burr: { speaker: 'npc:maren', text: 'Her name was Burr. I found her under a fallen ash eight winters ago, all ears and no mother. The Lodge said you can’t tame a Gloamwood wolf. I didn’t. We came to an arrangement.', next: 'door' },
      door: {
        speaker: 'npc:maren', mood: 'sad', text: 'Last winter she came to the Lodge door at dusk with black in her eyes, and stood in the lamplight, and didn’t know me. She was the first one that came back wrong.',
        choices: [
          { text: 'You had to put her down.', to: 'down' },
          { text: 'So you wear her. She’s still out hunting with you.', to: 'wear', trust: 1 },
        ],
      },
      down: { speaker: 'npc:maren', text: 'I did. Quick, and clean, and I talked to her the whole time. Then I went and found out the hard way that she wasn’t the last.', next: 'end' },
      wear: { speaker: 'npc:maren', mood: 'happy', text: '(Something in her face lets go a little.) That’s what I tell myself. She was always better in the trees than I was. Somebody ought to be.', next: 'end' },
      end: { speaker: 'npc:maren', text: 'Whatever’s doing this to them, I mean to look it in the eye. For her. Don’t tell Wil I told you. She’ll want to make it a song.', next: null },
    },
  },
  {
    id: 'dialogue:cc-godric-confide', name: 'Godric (Friendly): the vespers hour',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:godric', text: 'You will have noticed I stop at dusk. In the middle of the road, in the middle of a sentence. The village pretends I am thinking.', next: 'bells' },
      bells: {
        speaker: 'npc:godric', text: 'Dusk was vespers at the Abbey. For most of my life, wherever I was posted, the bells came over the hill at that hour. You could set your bread by them.',
        choices: [
          { text: 'What do you hear, when you stop?', to: 'hear', trust: 1 },
          { text: 'You miss them.', to: 'miss' },
        ],
      },
      hear: { speaker: 'npc:godric', mood: 'sad', text: 'Nothing. That is the point. I stand there so that one person in Brindlecross notices, every evening, that they are gone. Somebody ought to keep the silence properly.', next: 'end' },
      miss: { speaker: 'npc:godric', text: 'I am an old soldier. I miss the things I was told to guard. The bells were the only ones that never asked me to.', next: 'end' },
      end: { speaker: 'npc:godric', text: 'There. That is more than I have told the council in forty winters. Go on with you. And do not stop in the road at dusk. Folk will think you are thinking.', next: null },
    },
  },
  {
    id: 'dialogue:cc-nan-confide', name: 'Nan Briar (Friendly): Parson',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:nanbriar', text: 'You want to know why he’s called Parson. Everyone does, about the third visit. Sit down. Not there. That’s his.', next: 'name' },
      name: { speaker: 'npc:nanbriar', mood: 'happy', text: 'I christen all my cats. Proper, with water and a parson. This one bit the parson. Straight through the thumb, before the man had got to “Amen”. So I named him after his first and favourite meal.', next: 'twelve' },
      twelve: {
        speaker: 'npc:nanbriar', text: 'He’s my twelfth. I didn’t plan it, one for every school. Cats come when they come. But I’ve buried eleven, dear, and I’ve stopped pretending I’ll be here for the thirteenth.',
        choices: [
          { text: 'He’ll outlive us all, out of spite.', to: 'spite', trust: 1 },
          { text: 'Who’d look after him?', to: 'after' },
        ],
      },
      spite: { speaker: 'npc:nanbriar', mood: 'happy', text: '(She cackles until she has to sit down.) Out of spite! Oh, he would. He would, the old devil. That’s the nicest thing anyone’s said about him in years.', next: null },
      after: { speaker: 'npc:nanbriar', text: 'Nobody. He looks after himself, and he’ll bite whoever tries. (She scratches his ears. He allows it.) That’s the thing about being bitten. It means you were close enough.', next: null },
    },
  },
  {
    id: 'dialogue:cc-odo-confide', name: 'Odo (Friendly): the second bell',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:odo', text: 'Swords. Thirty years of swords. I never wanted to make swords, you know. A sword only says one thing.', next: 'mother' },
      mother: { speaker: 'npc:odo', text: 'My mother was the Abbey’s bell-founder. She had the mould dug and the bronze bought for a second Turning Bell, a spare, and the pour set for the week after the Turning. Then the lake came up.', next: 'never' },
      never: {
        speaker: 'npc:odo', mood: 'sad', text: 'She never poured anything again. Said a bell is a promise, and she’d lost the knack of making them. She taught me swords instead. Swords are easy. Nobody expects a sword to be kept.',
        choices: [
          { text: 'You could pour it, one day.', to: 'pour', trust: 1 },
          { text: 'Your swords keep this village alive.', to: 'swords' },
        ],
      },
      pour: { speaker: 'npc:odo', text: 'Me? (He looks at his hands for a long time.) Maybe. If there’s ever a Turning to ring it for. Ask me again then. I’ll want somebody to hold the tongs.', next: null },
      swords: { speaker: 'npc:odo', text: 'Aye, they do. And I’m proud of every one. But you don’t hum a sword to sleep, do you. (He goes back to the anvil.)', next: null },
    },
  },
  {
    id: 'dialogue:cc-wil-confide', name: 'Wil (Trusted): the door song',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:wil', text: 'Everyone thinks I talk. I listen, mostly, and then I talk. The talking’s just where the listening comes out.', next: 'door' },
      door: { speaker: 'npc:wil', text: 'There’s a song the Goose’s keeper sings on the eve of every Turning, to open the door to the road. My mother sang it, and her father before. I sang it once, the last time anyone came down that road.', next: 'since' },
      since: {
        speaker: 'npc:wil', mood: 'sad', text: 'Not since. Who would I be singing the door open for? The road’s been empty thirty years. I keep the hinges oiled. That’s as far as I go.',
        choices: [
          { text: 'Sing it now. Just for me.', to: 'now' },
          { text: 'The road isn’t empty any more.', to: 'road', trust: 1 },
        ],
      },
      now: { speaker: 'npc:wil', text: '(She hums one bar, low and warm, and stops.) No. It isn’t a song for a Tuesday. You’ll hear it when it counts, I promise. You’ll be sick of it.', next: null },
      road: { speaker: 'npc:wil', mood: 'happy', text: '(She looks at you, and then at the door, for a while.) No. It isn’t, is it. Well. I’d best start practising. I’ve gone rusty, and I won’t have the bearers laughing.', next: null },
    },
  },
  {
    id: 'dialogue:cc-pell-confide', name: 'Pell (Friendly): the nine shards',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:pell', text: 'You want the truth about the nine shards. Everyone thinks it’s a joke. It is a joke. It’s also the only honest debt I’ve got.', next: 'night' },
      night: { speaker: 'npc:pell', text: 'The night of the last Turning I walked into the Goose with empty pockets and a pack full of things nobody wanted. Wil gave me a room anyway. Nine shards. She wrote it on the slate and said, “Pay me when the road opens.”', next: 'never' },
      never: {
        speaker: 'npc:pell', text: 'I’ve had nine shards a thousand times since. More. I’ve had nine hundred.',
        choices: [
          { text: 'Then why not pay her?', to: 'why' },
          { text: 'If you paid, you’d have no reason to go back.', to: 'reason', trust: 1 },
        ],
      },
      why: { speaker: 'npc:pell', text: 'Because she said when the road opens. A deal’s a deal. I’m a crook, not a cheat. There’s a difference, and it’s mostly paperwork.', next: null },
      reason: { speaker: 'npc:pell', mood: 'sad', text: '(For once he doesn’t sell you anything.) Don’t tell her. She knows. But don’t tell her.', next: null },
    },
  },
  {
    id: 'dialogue:cc-aldous-confide', name: 'Aldous (Friendly): the worst voice in the choir',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:aldous', text: 'People think the Abbey took me because I could sing. I was an Abbeyshore fisher’s boy, and I had the worst voice in the choir. The precentor said I sang like a gate.', next: 'back' },
      back: { speaker: 'npc:aldous', mood: 'happy', text: 'They put me at the very back, by the window, and gave me the hymn books to hold, so that my hands were busy and my mouth was quiet. I loved it. Forty voices, and I was inside them.', next: 'window' },
      window: {
        speaker: 'npc:aldous', mood: 'sad', text: 'By the window. You see? That is why I was the one nearest the way out. Not holiness. Not courage. A bad voice, and where they stood me because of it.',
        choices: [
          { text: 'Then they kept you safe, the only way they could.', to: 'safe', trust: 1 },
          { text: 'It wasn’t your fault.', to: 'fault' },
        ],
      },
      safe: { speaker: 'npc:aldous', text: '(He is quiet a long time.) I have never once thought of it like that. Thirty years, and not once. Thank you, child. I shall have to think about it a good deal more.', next: null },
      fault: { speaker: 'npc:aldous', text: 'No. I know it was not. Knowing is easy. It is the believing I am still working on. Pray for me, if your school does that. If not, just think of me kindly.', next: null },
    },
  },
  {
    id: 'dialogue:cc-rook-confide', name: 'Rook (Friendly): the pitchfork',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:rook', text: 'You’re looking at the eye. Everybody does. I tell them it was a Hollowed, which is true, and that the scar improved my looks, which is true and modest.', next: 'fork' },
      fork: { speaker: 'npc:rook', text: 'What I don’t say is that the Hollowed was Abner Ditchling from the top farm, and the pitchfork was mine. I’d lent it him the week before, for his hay.', next: 'cheese' },
      cheese: {
        speaker: 'npc:rook', text: 'I was never a soldier. I made cheese. The night the wolves first came I was the one who shouted loudest, and in the morning they were calling me Captain.',
        choices: [
          { text: 'Shouting loudest is most of command.', to: 'loud', trust: 1 },
          { text: 'Do you miss the cheese?', to: 'miss' },
        ],
      },
      loud: { speaker: 'npc:rook', mood: 'happy', text: '(A bark of a laugh.) That’s what I tell the eleven. The other part is not running when you very much want to. I’ve got good at that, too.', next: null },
      miss: { speaker: 'npc:rook', mood: 'sad', text: 'Every day. There’s a wheel of it still in my cellar, from before. I’m saving it for when this is over. It’ll be the best cheese anybody in Morvane has ever eaten, or the worst.', next: null },
    },
  },
  {
    id: 'dialogue:cc-tamsin-confide', name: 'Tamsin (Friendly): the copper jar',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:tamsin', text: 'You’ve given me a fair few stories. I suppose you’re owed one back. Don’t look so pleased. It isn’t a long one.', next: 'jar' },
      jar: { speaker: 'npc:tamsin', text: 'Every copper I’ve ever taken for a crossing is in a jar in the ferry house. Thirty years. One copper, one story. I’ve never spent a single one.', next: 'why' },
      why: {
        speaker: 'npc:tamsin', text: 'Folk ask what I’m saving for.',
        choices: [
          { text: 'What are you saving for?', to: 'saving' },
          { text: 'You’re not saving. You’re counting.', to: 'counting', trust: 1 },
        ],
      },
      saving: { speaker: 'npc:tamsin', text: 'Nothing. A boat, maybe, someday. That’s what I tell them. It’s a good enough answer for people who don’t pay attention.', next: 'counting' },
      counting: { speaker: 'npc:tamsin', mood: 'happy', text: 'Counting. Aye. Every one of them is somebody who sat in my boat and trusted me with something. On a bad night I tip the jar out and count them. I’ve never got to the bottom of it before I felt better.', next: null },
    },
  },
  {
    id: 'dialogue:cc-hobb-confide', name: 'Hobb (Friendly): his own grave',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:hobb', text: 'Want to see something nobody else has? Over by the yew. Mind the step. That one’s mine.', next: 'grave' },
      grave: { speaker: 'narrator', text: 'A grave, neatly dug and edged, with a little bench beside it and a jam jar of moor flowers. There is no stone. The turf has been trimmed with scissors.', next: 'hobb' },
      hobb: {
        speaker: 'npc:hobb', text: 'Dug it the year I took the spade over. You should always dig your own first; it keeps you honest about the others. Thing is, I’ve never settled on the words for the stone.',
        choices: [
          { text: '“Dug that one twice.”', to: 'twice', trust: 1 },
          { text: '“Here lies Hobb. He walked home.”', to: 'home' },
        ],
      },
      twice: { speaker: 'npc:hobb', mood: 'happy', text: '(He laughs so hard he has to sit on his own bench.) Twice! Oh, that’s good. That’s very good. Nobody will know what it means but me and you, and that’s the best kind of stone.', next: null },
      home: { speaker: 'npc:hobb', text: 'He walked home. Aye. (He looks out at the moor for a while.) That’s kind. Not funny, mind. I wanted funny. But kind will do, if I don’t think of better.', next: null },
    },
  },
  {
    id: 'dialogue:cc-ysolde-confide', name: 'Ysolde (Friendly): the index',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:ysolde', text: 'You have stopped asking me about the archive and started asking me about myself. It is very irregular. Sit. Mind the cold; I keep the room cold for the paper, and for me.', next: 'sister' },
      sister: { speaker: 'npc:ysolde', text: 'In C. 1012 my sister went home to Frostmere for the Turning. I stayed behind to finish an index of the Moot Hall rolls. It would only take a week, I said. She would be back in a fortnight.', next: 'done' },
      done: {
        speaker: 'npc:ysolde', mood: 'sad', text: 'The index was finished twenty-nine years ago. It is very good. It is the best index in Concordia. I have read it more often than anyone should read an index.',
        choices: [
          { text: 'Do you know if she’s alive?', to: 'alive' },
          { text: 'When the gates open, you could go to her.', to: 'go', trust: 1 },
        ],
      },
      alive: { speaker: 'npc:ysolde', text: 'No. That is the whole of it. I have every record in Brindlecross and not one line about her. I have checked. I have checked the index.', next: null },
      go: { speaker: 'npc:ysolde', text: '(She looks at the door as if it had just been built.) I could. I would have to leave the archive. (A pause.) I would take the index. Of course I would take the index.', next: null },
    },
  },
  {
    id: 'dialogue:cc-pip-confide', name: 'Pip (Trusted): the list',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:pip', text: 'Do you want to see my list? Of places I’m not allowed? I keep it in my boot. It’s quite long now.', next: 'list' },
      list: { speaker: 'narrator', text: 'The list is on a scrap of sacking, in three different hands, two of them grown-up. The well. The mill race. Hobb’s yew. The Goose cellar. The moor after dark. Abbeyshore. At the bottom, in Pip’s own careful letters: AWAY.', next: 'away' },
      away: {
        speaker: 'npc:pip', text: 'Mum wrote that one. Then I copied it so it would be in my writing too. That’s fair.',
        choices: [
          { text: 'Is that why you want to be a squire?', to: 'squire', trust: 1 },
          { text: 'You’re still here, though.', to: 'here' },
        ],
      },
      squire: { speaker: 'npc:pip', mood: 'happy', text: 'Squires go with people. That’s the whole job. You can’t be not allowed to go somewhere if you’re with someone who’s going. I worked it out. I’ve got a very good brain.', next: null },
      here: { speaker: 'npc:pip', text: 'I know. I’m good at being here. Everybody says. (He puts the list back in his boot.) But I’m going to be good at away, too. You’ll see.', next: null },
    },
  },
  {
    id: 'dialogue:cc-corwin-confide', name: 'Corwin (Friendly): the letters from Solaria',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:corwin', text: 'Did you know the Hales came from Solaria? Four generations back. Radiance folk, all candles and early mornings. My great-grandmother took one look at the Concordia mills and never went back.', next: 'letters' },
      letters: { speaker: 'npc:corwin', text: 'The family wrote, though. Every Turning, a letter each way, Solaria to Brindlecross. The last one from them came in C. 1012. There’s a cousin over there I’ve never met who prays for a living, apparently.', next: 'burned' },
      burned: {
        speaker: 'npc:corwin', mood: 'sad', text: 'All the letters were in the mill. Every one, back to my great-grandmother’s. They went up with the rest the night the wolves came. I didn’t cry for the mill. I cried for those.',
        choices: [
          { text: 'You could start a new bundle.', to: 'new', trust: 1 },
          { text: 'When the arches open, write to your cousin.', to: 'cousin' },
        ],
      },
      new: { speaker: 'npc:corwin', mood: 'happy', text: 'A new bundle. Aye. The first one can be about the wheel going up. (He laughs.) That’ll show the candle-folk what a proper Hale does with his mornings.', next: null },
      cousin: { speaker: 'npc:corwin', text: 'I will. I’ll tell them the mill burned and I built it again. Radiance folk like a story about getting back up. I’ll lay it on thick.', next: null },
    },
  },
  {
    id: 'dialogue:cc-sela-confide', name: 'Sela (Friendly): the thunder',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:sela', text: 'Can I tell you something embarrassing? You’ve woken enough stones with me. You’ve earned something embarrassing.', next: 'thunder' },
      thunder: { speaker: 'npc:sela', mood: 'afraid', text: 'I’m Storm school, born and bred, and I am terrified of thunder. Always have been. My mother used to take me up the Stormcliffs to watch the lightning, for a treat. I screamed the whole way down.', next: 'walk' },
      walk: {
        speaker: 'npc:sela', text: 'That’s why I walk the roads. When the stones start humming, a storm’s coming, and I’d rather be moving than sitting still waiting for it.',
        choices: [
          { text: 'A Storm mage who runs from storms.', to: 'runs' },
          { text: 'Then the stones are warning you. They look after you.', to: 'warn', trust: 1 },
        ],
      },
      runs: { speaker: 'npc:sela', text: 'I prefer “walks briskly ahead of”. (She checks her compass. It points where it always points.) Anyway. You didn’t hear it from me.', next: null },
      warn: { speaker: 'npc:sela', mood: 'happy', text: 'They do, don’t they. (She pats the nearest stone like a dog.) I never thought of it that way. Thirty years of company, and I thought I was just nervous.', next: null },
    },
  },

  // ======================= Travel banter on the spine (one per travel stage)
  bark('cc-gloam-edge', 'II-2 banter: the edge of the Gloamwood', stage('quest:cc-wolves', 'tracks'),
    'Where the moor meets the Gloamwood the grass gives up all at once, as if it had been told not to go further. The wolf tracks don’t hesitate. Between the first trees someone has tied a strip of red cloth to a branch, the old forester’s sign for “turn back”. It is very faded.'),
  bark('cc-shore-road', 'II-3 banter: the road to Abbeyshore', stage('quest:cc-drowned-bell', 'abbey'),
    'The road to Abbeyshore runs downhill all the way, and halfway down you can smell the lake: weed, cold water, wet stone. A milestone says ABBEY ½ in letters worn soft. Somebody has scratched out ABBEY and written SHORE.'),
  bark('cc-briar-path', 'II-4 banter: the Briar path into the Gloamwood', stage('quest:cc-tears', 'signs'),
    'On the Briar path the brambles lean in from both sides. They draw back to let you pass, slowly, one stem at a time, the way a cat moves its tail out from under a chair. Nan said they would. You did not quite believe her.'),
  bark('cc-low-water', 'II-6 banter: low water at the Abbey lake', stage('quest:cc-eve', 'clapper'),
    'At low water the top of the Abbey’s north door shows above the lake, its arch hung with weed. Under the surface, very faintly, the drowned choir is singing the same three notes over and over, the way people hum when they are waiting for something.'),
  bark('cc-shore-dusk', 'II-6 banter: dusk on the shore road', stage('quest:cc-eve', 'gather'),
    'All down the shore road, bearers are walking towards the water in ones and twos, half-stones humming in their chests. Nobody speaks. Every doorway in Abbeyshore has a lamp in it, and someone standing in the light, watching them go by.'),

  // ======================= A Warm Bed: Wil’s letters (stages 'letters' and 'wil-again')
  {
    id: 'dialogue:obj-cc-goose-letters', name: 'A Warm Bed: the drawer in your room', scope: 'party',
    entries: [{ when: stage('quest:cc-warm-bed', 'letters'), node: 'drawer' }, { node: 'plain' }],
    nodes: {
      drawer: { speaker: 'narrator', text: 'The drawer of the washstand sticks, like the window. When it gives, it is full of letters: dozens of them, tied in bundles of twelve, every one addressed in the same round hand to “Whoever Comes Through the Arches”. None of them has been opened.', next: 'read' },
      read: {
        speaker: 'narrator', text: 'The top one is dated this spring. “Welcome. The stew is free tonight. The bed is good and the window sticks. Wil Crane, the Gilded Goose.” Under it, last spring’s says exactly the same.',
        choices: [
          { text: '(Take this year’s letter down to Wil.)', to: null, effects: [{ setFlag: 'cc.wil_letters', value: true }] },
          { text: '(Read one from near the bottom.)', to: 'old' },
        ],
      },
      old: { speaker: 'narrator', text: 'Twenty-nine years ago, in a younger, shakier hand: “Welcome. I am sorry about the weeping. We did not expect it. We did not expect anyone to take this long. Wil.” You take the newest letter downstairs.', effects: [{ setFlag: 'cc.wil_letters', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The washstand drawer. It sticks.', next: null },
    },
  },
  {
    id: 'dialogue:cc-wil-letters', name: 'A Warm Bed: Wil and the letters', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:wil', text: '(She sees the envelope in your hand and puts down the ladle.) Ah. You found the drawer. Nobody opens that drawer. It sticks on purpose.', next: 'why' },
      why: {
        speaker: 'npc:wil', text: 'The first spring after the arches shut, I wrote one, for whoever came through first. So they’d know someone here was expecting them. Then nobody came, so I wrote another. It got to be a habit.',
        choices: [
          { text: 'Thirty years of welcomes.', to: 'thirty' },
          { text: 'I’m the first to read one.', to: 'first', trust: 1 },
        ],
      },
      thirty: { speaker: 'npc:wil', mood: 'sad', text: 'Thirty, near enough. Some years I nearly didn’t. Then I thought, what if this is the year, and they come in cold, and nobody’s said hello?', next: 'keep' },
      first: { speaker: 'npc:wil', mood: 'happy', text: '(She laughs, and wipes her eyes with the cloth, and pretends it’s the onions.) The first. Well. It was worth the ink, then. Every drop.', next: 'keep' },
      keep: { speaker: 'npc:wil', text: 'Keep that one. It’s yours; it always was. And you’re right, the window sticks. I’ve been meaning to fix it for thirty years.', next: null },
    },
  },

  // ======================= Wake the Waystones: the stone that answers from the Heart ('report' and 'listen')
  {
    id: 'dialogue:cc-sela-report', name: 'Wake the Waystones: the wrong answer', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:sela', text: 'Four stones awake. Listen to them. (She holds up her hand, and you hear it: four notes, humming back and forth along the roads, like people calling across a valley.)', next: 'fifth' },
      fifth: {
        speaker: 'npc:sela', mood: 'afraid', text: 'And there. Do you hear it? A fifth one, answering. There isn’t a fifth stone on any map I own. And it’s answering from the Heart.',
        choices: [
          { text: 'There must be an old stone nobody mapped.', to: 'old' },
          { text: 'Something in the Heart wants to be found.', to: 'found' },
        ],
      },
      old: { speaker: 'npc:sela', text: 'There was. There must have been, once, on the Turning road into the Citadel. Bearers walked it. Nobody has woken it since.', next: 'listen' },
      found: { speaker: 'npc:sela', text: 'Or someone. I don’t like that, and I don’t like that I’m curious.', next: 'listen' },
      listen: { speaker: 'npc:sela', text: 'The stones carry further at night. Go to the circle here after dark and put your ear to it. Tell me what it says. I would, but my nerve is in the Gloamwood somewhere and I haven’t gone back for it.', next: null },
    },
  },
  {
    id: 'dialogue:obj-cc-waystone-listen', name: 'Wake the Waystones: listening at night', scope: 'party',
    entries: [
      { when: { all: [stage('quest:cc-waystones', 'listen'), NIGHT] }, node: 'night' },
      { when: stage('quest:cc-waystones', 'listen'), node: 'day' },
      { node: 'plain' },
    ],
    nodes: {
      night: { speaker: 'narrator', text: 'You put your ear to the cold stone. The four waking stones hum back and forth along the roads. Then, under them, from very far off, the fifth: one long note, rising and falling, rising and falling. It is not a signal. It is the sound of someone breathing, very slowly, in their sleep.', next: 'sela' },
      sela: { speaker: 'npc:sela', text: '(She has come out with a lantern after all.) Breathing. A stone doesn’t breathe. (She marks something on her map, out where the roads stop at the Heart, and draws a careful circle round it.) Well. Now it’s on a map.', effects: [{ setFlag: 'cc.waystone_heart', value: true }], next: null },
      day: { speaker: 'narrator', text: 'In daylight the waystone hums only with the four you woke. Sela said to listen at night.', next: null },
      plain: { speaker: 'narrator', text: 'The Brindlecross waystone, humming.', next: null },
    },
  },
];

export default dialogues;
