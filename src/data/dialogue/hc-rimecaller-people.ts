/**
 * Hollow Crown, RIMECALLER: Glacierhome people (general talk), the eight side quests, the mentor thread and the
 * bounties, plus the Act II class-thread, featured-bearer and hook scenes. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const offer = (q: Q, text: string, to: string, extra?: NarrativeCondition): DialogueChoice =>
  ({ text, to, quest: true, when: extra ? { all: [fresh(q), extra] } : fresh(q), effects: [{ startQuest: q }] });
const bye: DialogueChoice = { text: 'Farewell.', to: null, tag: 'leave' };
const NIGHT: NarrativeCondition = { hour: [21, 4] };
const HV = 'npc:halla-vint' as const;

const dialogues: DialogueDef[] = [
  // ---------- Halla (general + mentor thread)
  {
    id: 'dialogue:rimecaller-halla', name: 'Halla (general)',
    entries: [
      { when: { all: [stage('quest:rimecaller-the-hold-gauges', 'gauges'), { not: { flag: 'rimecaller.delight.tea' } }] }, node: 'tea' },
      { node: 'start' },
    ],
    nodes: {
      tea: { speaker: HV, text: 'Back already? I have been looking at the tea, as promised. (She has. It has not moved.) Five gauges, please. Then we can both look at it.', effects: [{ setFlag: 'rimecaller.delight.tea', value: true }], next: null },
      start: {
        speaker: HV, text: 'Yes? Be accurate. I have very little to do and I would like to do it properly.',
        choices: [
          offer('quest:rimecaller-the-first-keeping', 'What is behind the oldest vault door?', 'vault', { trust: HV, value: 'friendly' }),
          offer('quest:rimecaller-something-new', 'What is that empty drawer marked NEW?', 'drawer', { all: [{ trust: HV, value: 'trusted' }, { questCompleted: 'quest:rimecaller-the-melt-cisterns' }] }),
          { text: 'What is the Archive for, really?', to: 'archive' },
          { text: 'What were you going to do, Halla, before the hold?', to: 'before', when: { trust: HV, value: 'friendly' } },
          bye,
        ],
      },
      before: { speaker: HV, text: 'Retire. I was due to retire on the Tuesday. The hold began on the Monday night. I had cleared my desk, labelled my pencils for my successor, and bought a ticket on the Tidecourt coach to look at the sea. I have never seen the sea.', next: 'ticket' },
      ticket: {
        speaker: HV, text: '(She opens a drawer, not the one marked NEW, and there it is: a coach ticket, punched once, a little foxed.) Outside, one seat, facing forwards. I always wanted to face forwards. You can’t, in an archive. Everything in here faces back.',
        choices: [
          { text: 'The sea will still be there.', to: 'sea' },
          { text: 'Why didn’t you go anyway, and leave the hold to someone else?', to: 'why' },
        ],
      },
      sea: { speaker: HV, mood: 'happy', text: 'So I am told. It is apparently very large, and wet, and does not stay still for anybody. I find I am looking forward to being disapproved of by it.', next: 'start' },
      why: { speaker: HV, mood: 'sad', text: 'Because eleven people could move in this city, and I had cut all their pins, and one of them was you. One doesn’t cut a child a key to the clock and then go and look at the sea. (She puts the ticket away.) It was a very good seat, though.', next: 'start' },
      vault: { speaker: HV, text: 'The first thing the Archive ever kept. I have had the key for forty years and never gone in, because nobody asked me what was there, and I was afraid of the answer. Go and look. Tell me what it says.', next: null },
      drawer: { speaker: HV, mood: 'sad', text: 'It is for new things. I labelled it the day the hold began, to be ready. It has been empty for thirty years. (Drily.) I would like, before I die, which I now apparently can, to put something in it.', next: null },
      archive: { speaker: HV, text: 'Keeping. Not hoarding, not holding. Writing a thing down so well that the world can afford to lose it. We have been very bad at it lately.', next: 'start' },
    },
  },
  {
    id: 'dialogue:rimecaller-halla-keeping', name: 'Mentor: the First Keeping', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: HV, text: 'Read it to me. Slowly. (You read her the sunrise of C. 3: every colour, the temperature, the name of the dog.) …There is something written at the bottom, in a different hand.', next: 'kept' },
      kept: {
        speaker: HV, mood: 'happy', text: '“Kept. Not held.” Oh. Oh, there it is. The first Rimecallers wrote that morning down so completely that they could let it go. That is what the Archive was built for. Not to stop the world. To remember it well enough to let it walk away.',
        choices: [{ text: 'Then a thing can be kept without being held.', to: 'end', insight: 'first_keeping', trust: 1 }],
      },
      end: { speaker: HV, text: 'It can. Remember that, if anybody ever asks you to vote on the cold.', next: null },
    },
  },
  {
    id: 'dialogue:rimecaller-halla-new', name: 'Mentor: Something New', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: HV, text: 'A snowflake that formed this week, in the thaw. Six arms, one of them a little bent. Nobody has ever seen this one before. (She puts it in the drawer.) And a curse-word.', next: 'curse' },
      curse: { speaker: HV, mood: 'happy', text: '“Oh, Regent.” When they drop something on their foot. That’s appalling. That is the best thing I have heard in thirty years. (It goes in the drawer.) And now the third.', next: 'spell' },
      spell: {
        speaker: HV, text: 'A spell nobody has ever cast. Make one up. Now, in front of me. I will know if you’ve read it somewhere.',
        choices: [
          { text: '(Freeze a single raindrop in the air, then let it fall.)', to: 'drop', school: 'rime' },
          { text: '(Breathe on the window and write NEW in the frost.)', to: 'frost' },
          { text: '(Make a very small snowman on her desk.)', to: 'snowman' },
        ],
      },
      drop: { speaker: HV, text: 'Held, and let go. In one breath. (A long pause.) Nobody taught you that. I certainly didn’t.', next: 'end' },
      frost: { speaker: HV, text: 'That is barely a spell. It is also, I notice, exactly what I asked for. Very well.', next: 'end' },
      snowman: { speaker: HV, text: 'It has a hat. Where did you get a hat that small? No, don’t tell me. I don’t want to know. It goes in the drawer.', next: 'end' },
      end: { speaker: HV, mood: 'sad', text: '(She shuts the drawer marked NEW. It is not empty.) Thank you. I have no idea how to say the rest of it, so I shan’t.', effects: [{ trust: HV, delta: 1 }], next: null },
    },
  },
  {
    id: 'dialogue:obj-first-keeping', name: 'Mentor: the first keeping', scope: 'party',
    entries: [{ when: stage('quest:rimecaller-the-first-keeping', 'keeping'), node: 'page' }, { node: 'shelf' }],
    nodes: {
      page: { speaker: 'narrator', text: 'One shelf, one book, one page, written in C. 3. A sunrise over the glacier, set down so completely that as you read it you feel the warmth come up on your face, and smell woodsmoke, and hear a dog called Brisket barking at nothing.', next: null },
      shelf: { speaker: 'narrator', text: 'The oldest shelf in the Archive. One book on it, and plenty of room.', next: null },
    },
  },
  {
    id: 'dialogue:obj-thaw-snowflake', name: 'Mentor: a new snowflake',
    entries: [{ when: stage('quest:rimecaller-something-new', 'new'), node: 'flake' }, { node: 'drip' }],
    nodes: {
      flake: { speaker: 'narrator', text: 'Where the Undercrypt ceiling drips and the drips freeze again, a single new snowflake is forming in the air. You catch it on a cold glass slide before it lands. One of its arms is slightly bent. It is the newest thing in Glacierhome.', next: null },
      drip: { speaker: 'narrator', text: 'Meltwater dripping, and freezing, and dripping again.', next: null },
    },
  },
  // ---------- Seraphine and Anselm (general)
  {
    id: 'dialogue:rimecaller-seraphine', name: 'Seraphine (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:seraphine-cold', text: 'Hour-walker. Did you want something? I am a little tired, and the clocks want minding.',
        choices: [
          { text: 'Why don’t you ever wind them?', to: 'wind' },
          { text: 'Your eyes are wet, Regent.', to: 'eyes', when: { flag: 'rimecaller.regent_met' } },
          bye,
        ],
      },
      wind: { speaker: 'npc:seraphine-cold', text: 'Because a wound clock goes forward. Run along, now. Gently.', next: null },
      eyes: { speaker: 'npc:seraphine-cold', mood: 'sad', text: 'The cold. It is only the cold. Everyone in Glacierhome has wet eyes. Run along.', next: null },
    },
  },
  {
    id: 'dialogue:rimecaller-anselm', name: 'Anselm Cold',
    entries: [{ node: 'still' }],
    nodes: { still: { speaker: 'narrator', text: '(An old man in a good chair, breathing out. On the table by his hand is a book, open, face down, at page two hundred and six. He has been meaning to finish it.)', next: null } },
  },
  // ---------- the Wardens' envoy
  {
    id: 'dialogue:rimecaller-aud', name: 'Aud Fellmark (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:aud-fellmark', text: 'Envoy of the Wardens of the Wall. Thirty years, still waiting. They’ve given me a chair. It is a very nice chair.',
        choices: [{ text: 'What did the Wall ask for?', to: 'ask' }, bye],
      },
      ask: { speaker: 'npc:aud-fellmark', text: 'More cold for the Wall in a hard winter. The Regent said she would think about it. That was C. 1012. She is still thinking. I respect the commitment.', next: null },
    },
  },
  {
    id: 'dialogue:rimecaller-aud-curse', name: 'Mentor: a new curse-word',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:aud-fellmark', text: 'A new curse-word? For the Archivist-Superior? (She brightens enormously.) Right. Last winter the lads on the Long Rampart started saying “Oh, Regent” when they drop something on their foot.',
        choices: [{ text: 'That isn’t very polite.', to: 'polite' }, { text: 'Perfect. Thank you.', to: 'end' }],
      },
      polite: { speaker: 'npc:aud-fellmark', text: 'It isn’t meant to be. That’s the beauty of it. Write it down properly. Spell Regent with a capital.', next: 'end' },
      end: { speaker: 'npc:aud-fellmark', mood: 'happy', text: 'Tell her the Wall says hello. Tell her the Wall says it with feeling.', next: null },
    },
  },
  // ---------- the Spire Stair: Pomfrey, Wendel, Osgar
  {
    id: 'dialogue:rimecaller-pomfrey', name: 'Pomfrey Dunn (the Longest Loaf)',
    entries: [
      { when: stage('quest:rimecaller-the-longest-loaf', 'bake'), node: 'bake' },
      { when: { flag: 'rimecaller.halfstone' }, node: 'baked' },
      { node: 'start' },
    ],
    nodes: {
      start: {
        speaker: 'npc:pomfrey-dunn', text: 'Don’t open the door. You’ll let the time in. (She is moving, very slowly, like someone wading.) My oven’s right on the edge of the hold. I can move. The loaf can’t.',
        choices: [offer('quest:rimecaller-the-longest-loaf', 'How long has it been in there?', 'loaf'), { text: 'Is it a good loaf?', to: 'good' }, bye],
      },
      good: { speaker: 'npc:pomfrey-dunn', text: 'It’s risen. I’ll give it that. Thirty years of rising. It has ambitions.', next: 'start' },
      loaf: { speaker: 'npc:pomfrey-dunn', text: 'Since eleven fifty-two, C. 1012. When it finally bakes, and it will, I want a proper fire under it, not this frozen kindling. There’s dry wood down in the Undercrypt where the hold’s thin. Fetch me some?', next: null },
      bake: {
        speaker: 'npc:pomfrey-dunn', mood: 'happy', text: 'Real wood! It smells of wood! (She lays the fire, slowly, lovingly.) There. When the hour moves, my loaf will finish on a fire worth finishing on. Here, take two of yesterday’s. Thirty years of yesterday’s.',
        choices: [{ text: 'They’re still warm.', to: 'warm', trust: 1 }, { text: 'Thank you, Mistress Dunn.', to: 'rye' }],
      },
      warm: { speaker: 'npc:pomfrey-dunn', text: 'Course they are. Nothing in this city has had the chance to go cold.', next: 'rye' },
      rye: {
        speaker: 'npc:pomfrey-dunn', text: 'Mind, the loaf’s not mine. Black rye, ordered at half past eleven by a footman from the Spire, running. “For the Lord’s supper. He’ll want it warm.” Thirty years I’ve kept it rising for a customer who never came back. Would you tell the Spire it’s nearly ready? The Regent will know whose it is.',
        choices: [{ text: 'I’ll tell her.', to: null, quest: true }, { text: 'Which lord?', to: 'lord' }],
      },
      lord: { speaker: 'npc:pomfrey-dunn', text: 'He didn’t say, and I didn’t ask, because I’m a baker and not a nosy parker. (She is plainly a nosy parker.) There’s only one lord up the Spire, though. Has been for years.', next: null },
      baked: { speaker: 'npc:pomfrey-dunn', mood: 'happy', text: 'It baked! Thirty years and two minutes! I’m taking it to someone. I don’t know who yet. Somebody who deserves a loaf like that.', next: null },
    },
  },
  {
    id: 'dialogue:rimecaller-wendel', name: 'Wendel Fross (Mid-Step)',
    entries: [{ when: { questCompleted: 'quest:rimecaller-mid-step' }, node: 'sent' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:wendel-fross', text: '(A courier, frozen mid-stride on the Spire Stair, one foot off the step, a letter held out at arm’s length. The ink has frozen too. Through the frost you can read it backwards: “Greta, I have asked the Archive and it says yes, people do, so: will you?”)',
        choices: [offer('quest:rimecaller-mid-step', '(Ease the letter out of his fingers.)', 'take'), bye],
      },
      take: { speaker: 'narrator', text: 'It comes free with a sound like a twig. On the front, in a hand that shook: Greta Lind, Glass Birds, the Frozen Market. He was nearly there.', next: null },
      sent: { speaker: 'npc:wendel-fross', text: '(Wendel Fross, mid-stride, holding Greta’s letter out in front of him. You could swear he looks a little lighter.)', next: null },
    },
  },
  {
    id: 'dialogue:rimecaller-osgar', name: 'Osgar Rusk (bounties)',
    entries: [
      { when: { all: [{ questCompleted: 'quest:rimecaller-the-first-tick' }, { not: { flag: 'rimecaller.delight.tray' } }] }, node: 'tray' },
      { node: 'start' },
    ],
    nodes: {
      tray: { speaker: 'npc:osgar-rusk', text: 'You heard it too? I dropped a tray. First thing I’ve dropped in thirty years. (He looks fondly at a spot on the floor.) I’ve left it there. It’s the most interesting thing on the Stair.', effects: [{ setFlag: 'rimecaller.delight.tray', value: true }], next: 'start' },
      start: {
        speaker: 'npc:osgar-rusk', text: 'Bounties on the board. Pinned with ice. Don’t breathe on them, they curl.',
        choices: [
          offer('quest:rimecaller-bounty-sentry-seventeen', 'Sentry Seventeen?', 'sentry'),
          offer('quest:rimecaller-bounty-cistern-wraiths', 'The cistern wraiths.', 'wraiths', { questCompleted: 'quest:rimecaller-the-hold-gauges' }),
          bye,
        ],
      },
      sentry: { speaker: 'npc:osgar-rusk', text: 'Arresting everyone on the Stair for loitering. Everyone on the Stair has been loitering for thirty years. It has arrested the lamplighter four times and me twice.', next: null },
      wraiths: { speaker: 'npc:osgar-rusk', text: 'Come up out of the cisterns since the melt went black. Six of them. The Archive pays in silver, after an inquiry. The inquiry is me.', next: null },
    },
  },
  // ---------- the Hall of Held Hours: Cornelius, Maudlin
  {
    id: 'dialogue:rimecaller-cornelius', name: 'Cornelius Teal (the Weather Clerk)',
    entries: [{ when: stage('quest:rimecaller-the-weather-clerk', 'teal'), node: 'reading' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:cornelius-teal', text: 'Cold; still. (He writes it, very neatly, and blots it.) Ten thousand nine hundred and fifty days. I have not missed one. I would like it known I have not missed one.',
        choices: [offer('quest:rimecaller-the-weather-clerk', 'Would you like a different reading?', 'reading-q'), bye],
      },
      'reading-q': { speaker: 'npc:cornelius-teal', mood: 'afraid', text: 'A different… Is that allowed? The Undercrypt. They say it is warm in the Undercrypt now. There is an old thermometer on the north wall. If you could. If it isn’t any trouble. It is a great deal of trouble. Please.', next: null },
      reading: {
        speaker: 'npc:cornelius-teal', mood: 'happy', text: 'Two degrees above freezing. Two degrees! And rising! (He weeps, quite openly, into the register, and then blots that too.) The first new weather in thirty years. I shall have to start a new page.',
        choices: [
          { text: 'What was the last real entry?', to: 'last' },
          { text: 'Congratulations, Clerk.', to: 'witness', trust: 1 },
        ],
      },
      witness: {
        speaker: 'npc:cornelius-teal', mood: 'afraid', text: 'Oh. Oh no. Regulation forty-one: a new kind of weather must be witnessed by the Archivist-Superior. I have never had a new kind of weather. (He tears the page out, which visibly costs him a year of his life.) Would you take it to her? Don’t fold it. Don’t breathe on it. It’s two degrees.',
        choices: [{ text: 'I’ll carry it like an egg.', to: null, quest: true }],
      },
      last: {
        speaker: 'npc:cornelius-teal', text: 'Here. “Eleven fifty-two. Mild for the season. The Regent’s physician called up to the Spire.” Then nothing but cold; still.',
        choices: [{ text: 'Eleven fifty-two. Every clock in the city stopped at that minute.', to: 'minute', insight: 'held_minute' }, { text: 'Thank you.', to: 'witness' }],
      },
      minute: { speaker: 'npc:cornelius-teal', text: 'Did they? I never looked at the clocks. I only ever looked at the sky. Well. I shall note it.', next: 'witness' },
    },
  },
  {
    id: 'dialogue:obj-undercrypt-thermometer', name: 'The Weather Clerk: the thermometer',
    entries: [{ when: stage('quest:rimecaller-the-weather-clerk', 'reading'), node: 'read' }, { node: 'plain' }],
    nodes: {
      read: { speaker: 'narrator', text: 'A brass thermometer on the Undercrypt wall, furred with frost on the outside. The mercury inside has moved. Two degrees above freezing, and as you watch, it creeps a hair higher.', next: null },
      plain: { speaker: 'narrator', text: 'An old brass thermometer, reading a little warmer than it ought to.', next: null },
    },
  },
  {
    id: 'dialogue:rimecaller-mabyn', name: 'Maudlin Frane (the Thirteenth Line)',
    entries: [{ when: stage('quest:rimecaller-the-thirteenth-line', 'mabyn'), node: 'line' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:mabyn-frane', text: 'Gloves. Gloves! Everything here is in order. I have put it in order four times. There is one thing I can’t file, and it’s driving me to distraction.',
        choices: [offer('quest:rimecaller-the-thirteenth-line', 'What can’t you file?', 'what'), bye],
      },
      what: { speaker: 'npc:mabyn-frane', text: 'The founding treaty. The Rime copy, deepest stack, under glass. The last page has a line on it that belongs to nobody. Go and look, would you? With gloves. I can’t bear it any more.', next: null },
      line: {
        speaker: 'npc:mabyn-frane', text: 'Twelve signatures, one for each school. And a thirteenth line, ruled, and left blank. Ruled! Somebody took a ruler to it! You don’t rule a line for nobody.',
        choices: [
          { text: 'Maybe it was left for someone who hadn’t arrived yet.', to: 'arrived', insight: 'thirteenth_line' },
          { text: 'File it under “pending”.', to: 'pending' },
        ],
      },
      arrived: { speaker: 'npc:mabyn-frane', text: 'For someone who hadn’t… (She sits down.) A thousand years, and nobody ever came to sign it. That’s the saddest thing I’ve ever catalogued.', next: 'minutes' },
      pending: { speaker: 'npc:mabyn-frane', mood: 'happy', text: 'Pending. Pending! Oh, that’s good. That’s very good. Pending since C. 0. I can sleep tonight.', next: 'minutes' },
      minutes: { speaker: 'npc:mabyn-frane', text: 'But nobody rules a line in an archive without minuting it first. The founders’ minute-book is chained to a lectern in the old Reading Room, halfway up the Spire Stair. I have never been allowed to read it. You are an hour-walker. Nobody has ever thought to stop you.', next: 'oldest' },
      oldest: {
        speaker: 'npc:mabyn-frane', text: 'Do you know, it’s only the second-oldest thing I can’t explain. The oldest is catalogue card number one.',
        choices: [{ text: 'What does card number one say?', to: 'card' }, { text: 'Another time, Under-Archivist.', to: null }],
      },
      card: {
        speaker: 'npc:mabyn-frane', text: '“Item one. A sunrise, C. 3. Oldest vault.” And underneath, in the founders’ hand: “Kept. Not held.” I’ve filed it four times. I still don’t know what it means.',
        choices: [{ text: 'It means they wrote it down well enough to let it go.', to: 'means', insight: 'first_keeping' }, { text: 'Neither do I.', to: null }],
      },
      means: { speaker: 'npc:mabyn-frane', text: 'Let it… go? Out of the Archive? (She looks around at the stacks, rather wildly.) I am going to need to sit down for a week.', next: null },
    },
  },
  {
    id: 'dialogue:obj-rime-treaty-copy', name: 'The Thirteenth Line: the treaty', scope: 'party',
    entries: [{ node: 'page' }],
    nodes: { page: { speaker: 'narrator', text: 'Under glass, the last page of the Concord’s founding treaty. Twelve signatures in twelve hands, ash-grey to sea-green. Below them, a thirteenth line, carefully ruled, and nothing on it at all.', next: null } },
  },
  // ---------- the Frozen Market: Nim, Brannoc, Saffi, Greta
  {
    id: 'dialogue:rimecaller-nim', name: 'Nim Larkspur (the Thief Who Never Got Away)',
    entries: [
      { when: stage('quest:rimecaller-the-thief-who-never-got-away', 'nim'), node: 'talk' },
      { when: { questCompleted: 'quest:rimecaller-the-thief-who-never-got-away' }, node: 'after' },
      { node: 'frozen' },
    ],
    nodes: {
      frozen: {
        speaker: 'npc:nim-larkspur', text: '(A young man, frozen mid-snatch, his hand in a widow’s purse. His body is ice. His eyes are not. They follow you, and then they look, very hard, at the purse, and then back at you.)',
        choices: [offer('quest:rimecaller-the-thief-who-never-got-away', '(Lean close. He is trying to say something.)', 'lean'), bye],
      },
      lean: { speaker: 'narrator', text: 'He blinks: once, twice, once. His lips are frozen shut. If you thawed his face, only his face, carefully, he could talk.', next: null },
      talk: {
        speaker: 'npc:nim-larkspur', mood: 'sad', text: 'Thank you. Thank you. Thirty years with my hand in Widow Tern’s purse. Thirty years! I was awake for every minute. I have had a very long time to think about my choices, and I don’t like any of them.',
        choices: [
          { text: '(Slip the purse back into her bag before the hour moves.)', to: 'back', trust: 1, effects: [{ setFlag: 'rimecaller.nim_reformed', value: true }] },
          { text: 'You did it. You live with it.', to: 'live' },
        ],
      },
      back: { speaker: 'npc:nim-larkspur', mood: 'happy', text: 'There. Empty-handed. When the hour moves I’ll just be a lad standing very close to a widow, which is embarrassing but legal. I’m going to walk, after. I’m going to walk and walk and never stand still again.', next: 'tin' },
      live: { speaker: 'npc:nim-larkspur', text: 'I have been. For thirty years. (He looks at his hand.) All right. All right.', next: 'tin' },
      tin: {
        speaker: 'npc:nim-larkspur', mood: 'afraid', text: 'There’s one more thing. Under the ninth step down to the Undercrypt there’s a tin. Everything I ever lifted, that I couldn’t bring myself to sell. Thirty years I’ve thought about the people it belongs to. Would you get it out of there before the hour moves? I can’t look at it. I can’t look at anything but this purse.',
        choices: [{ text: 'I’ll find it.', to: null, quest: true }],
      },
      after: { speaker: 'npc:nim-larkspur', text: 'Can’t move my legs. Can talk, though. I’m making up for lost time. Did you know the stall behind you sells eleven kinds of mustard? I’ve read the board nine thousand times.', next: null },
    },
  },
  {
    id: 'dialogue:obj-frozen-thief', name: 'The Thief: thawing his face', scope: 'party',
    entries: [{ when: stage('quest:rimecaller-the-thief-who-never-got-away', 'thaw'), node: 'thaw' }, { node: 'purse' }],
    nodes: {
      thaw: { speaker: 'narrator', text: 'You lay your palm an inch from his face and warm the air between, the way you would warm a page stuck to its neighbour. The frost on his lips goes soft. He takes the first breath he has taken in thirty years, and coughs, and says, hoarsely, “Oh, thank the Spire.”', next: null },
      purse: { speaker: 'narrator', text: 'A thief’s hand in a widow’s purse, held still by thirty years of ice.', next: null },
    },
  },
  {
    id: 'dialogue:rimecaller-brannoc', name: 'Brannoc Hulle (the Thirty-Year Haggle)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:brannoc-hulle', text: '(An ice-glass merchant, frozen with three fingers raised over a sugar bowl. Across the stall, a widow is frozen with one eyebrow raised back. They have been at it for thirty years. The bowl is very nice.)',
        choices: [offer('quest:rimecaller-the-thirty-year-haggle', 'Somebody ought to settle this before they wake.', 'settle'), bye],
      },
      settle: { speaker: 'narrator', text: 'Three fingers. Three what? The Archive records the price of everything. If you knew the fair price of a sugar bowl on this exact evening, you could chalk it on the stall, and the first thing they did when they woke would be to shake hands.', next: null },
    },
  },
  {
    id: 'dialogue:obj-market-price-ledger', name: 'The Haggle: the price ledger',
    entries: [{ when: stage('quest:rimecaller-the-thirty-year-haggle', 'price'), node: 'price' }, { node: 'ledger' }],
    nodes: {
      price: { speaker: 'narrator', text: '“Sugar bowl, ice-glass, good, with lid: two shillings and a farthing.” Underneath, in a later hand: “Lid optional, but expected.”', next: null },
      ledger: { speaker: 'narrator', text: 'The Archive’s market ledger: nine hundred years of what everything cost.', next: null },
    },
  },
  {
    id: 'dialogue:rimecaller-saffi', name: 'Widow Tern (the Thirty-Year Haggle)',
    entries: [{ when: stage('quest:rimecaller-the-thirty-year-haggle', 'saffi'), node: 'chalk' }, { node: 'still' }],
    nodes: {
      chalk: {
        speaker: 'narrator', text: 'You chalk it on the stall between them, big enough for both of them to see: 2s. ¼d., WITH LID.',
        choices: [
          { text: '(Underline “with lid”.)', to: 'lid' },
          { text: '(Add, smaller: “Shake hands.”)', to: 'shake' },
        ],
      },
      lid: { speaker: 'narrator', text: 'Brannoc’s eyes, which are frozen, somehow manage to look outraged. The widow’s eyebrow, somehow, goes up a further hair.', next: 'nolid' },
      shake: { speaker: 'narrator', text: 'Nothing moves. But it seems to you that both of them are looking at the chalk now, and not at each other, and that is the first step.', next: 'nolid' },
      nolid: { speaker: 'narrator', text: 'Then you look at the bowl, properly, the way Halla taught you. It has no lid. There is a clean ring in the frost where a lid once sat, and a faint track in the snow on the stall, running towards the edge, and off it, and away down the Market Steps.', next: null },
      still: { speaker: 'npc:saffi-tern', text: '(One eyebrow, raised at a sugar bowl, for thirty years.)', next: null },
    },
  },
  {
    id: 'dialogue:rimecaller-greta', name: 'Greta Lind (Mid-Step)',
    entries: [
      { when: stage('quest:rimecaller-mid-step', 'greta'), node: 'give' },
      { when: { all: [{ flag: 'rimecaller.halfstone' }, { flag: 'rimecaller.letter_delivered' }] }, node: 'yes' },
      { node: 'still' },
    ],
    nodes: {
      give: {
        speaker: 'narrator', text: 'Greta Lind, frozen mid-laugh at her glass-bird stall, one bird held up to the light. You tuck the letter between her fingers and the bird, where she will feel it the moment she can feel anything.',
        choices: [{ text: '(Fold her fingers round it, gently.)', to: 'hers' }, { text: '(Leave the glass bird where it is.)', to: 'hers' }],
      },
      hers: {
        speaker: 'narrator', text: 'Her other hand, half hidden in her apron pocket, is already holding a letter of its own, folded small and addressed in a round hand: Wendel Fross, the Couriers’ Hall. Through the frost on the fold you can just read the first line. “Wendel, I have asked the Archive, and it says people do.”',
        choices: [{ text: '(Ease her letter out. It is going the wrong way.)', to: null, quest: true }],
      },
      yes: { speaker: 'npc:greta-lind', mood: 'happy', text: 'He asked the Archive. He asked the Archive whether people do! (She is laughing and crying.) Of course they do. Of course I will. Where is he? Which way did he go?', next: null },
      still: { speaker: 'npc:greta-lind', text: '(Frozen mid-laugh, a glass bird held up to the light.)', next: null },
    },
  },
  // ---------- the Undercrypt: Gunnhild, the wraith, the firewood
  {
    id: 'dialogue:rimecaller-gunnhild', name: 'Gunnhild Tapp (the Drip-Counters)',
    entries: [{ when: stage('quest:rimecaller-the-drip-counters', 'gunnhild'), node: 'heard' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:gunnhild-tapp', text: 'Four thousand and nine since breakfast. Hush. Drips have a rhythm, you know. These ones have a very particular rhythm. I won’t tell you what. You have to hear it.',
        choices: [offer('quest:rimecaller-the-drip-counters', 'Where do I listen?', 'where'), bye],
      },
      where: { speaker: 'npc:gunnhild-tapp', text: 'At the counter station. At night, when the city’s quietest, which in a frozen city is saying something. Put your ear to the brass and count. Not out loud.', next: null },
      heard: {
        speaker: 'npc:gunnhild-tapp', text: 'Well? What does it sound like?',
        choices: [
          { text: 'A heartbeat. Slow, and stubborn.', to: 'heart', insight: 'held_heartbeat', trust: 1 },
          { text: 'Water, Gunnhild.', to: 'water' },
        ],
      },
      heart: { speaker: 'npc:gunnhild-tapp', mood: 'sad', text: 'Yes. I’ve heard it for a year. I didn’t dare say. Who has a heartbeat that slow, I thought. Somebody very old. Somebody very nearly finished. Somebody being kept from finishing.', next: 'up' },
      water: { speaker: 'npc:gunnhild-tapp', text: 'Hmph. Then you weren’t listening. Here, have a tonic for your trouble. Go and listen again some night.', next: 'up' },
      up: { speaker: 'npc:gunnhild-tapp', text: 'One thing’s bothered me. I always thought it came up from below, like the damp. But the old ice-pipe on the climb to the Hall runs the other way, from up there to down here. If the beat is in that pipe too, it isn’t coming up. It’s coming down. Go and put your ear to it.', next: null },
    },
  },
  {
    id: 'dialogue:obj-drip-counter-station', name: 'The drip-counter station',
    entries: [
      { when: { all: [stage('quest:rimecaller-the-drip-counters', 'listen'), NIGHT] }, node: 'night' },
      { when: stage('quest:rimecaller-the-drip-counters', 'listen'), node: 'day' },
      { node: 'station' },
    ],
    nodes: {
      station: { speaker: 'narrator', text: 'A brass drip-counter, clicking under a dripping stalactite. Gunnhild has chalked the day’s total on the wall beside it.', next: null },
      day: { speaker: 'narrator', text: 'Drip. Click. Drip. Click. Too many feet, too much noise. Gunnhild said at night.', next: null },
      night: {
        speaker: 'narrator', text: 'In the dark, with your ear to the brass, the drips come in pairs. A long one, a short one, a long rest. A long one, a short one. Slow, and very faint, and stubborn. It is not water keeping that time.',
        effects: [{ setFlag: 'rimecaller.drips_heard', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:rimecaller-wraith', name: 'The hatless wraith',
    entries: [{ when: stage('quest:rimecaller-the-wraith-who-wanted-its-hat', 'give'), node: 'give' }, { node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:hatless-wraith', text: '(A Frost Wraith, pale as breath. It does not attack. It drifts to the tunnel wall, looks at something in the ice at head height, touches the top of its own head, and drifts back. Then it does it again.)',
        choices: [offer('quest:rimecaller-the-wraith-who-wanted-its-hat', '(Look where it’s looking.)', 'look'), bye],
      },
      look: { speaker: 'narrator', text: 'Frozen in the tunnel wall, about where a tall man would hang it, is a hat. A good felt hat, with a feather. Someone stepped out of the hour down here and into the melt, and left their hat on a peg that turned to ice.', next: null },
      give: {
        speaker: 'npc:hatless-wraith', text: '(You hold out the hat. The wraith goes very still.)',
        choices: [{ text: '(Put it on its head.)', to: 'on' }, { text: '(Let it take the hat.)', to: 'on' }],
      },
      on: { speaker: 'npc:hatless-wraith', mood: 'happy', text: '(It settles the hat on its head and tilts it, just so. It sighs, a long cold sigh that smells faintly of pipe tobacco. Then, very politely, it is gone.)', next: 'band' },
      band: { speaker: 'narrator', text: 'Where it stood there is only a little frost on the tunnel floor, and the ink from the hat-band still on your fingers: B. Hollin. Halla once told you the name of the last hour-walker she signed out of the hold. Bertil. He was going to see his sister in the Wolfrun.', next: null },
    },
  },
  {
    id: 'dialogue:obj-frozen-hat', name: 'The wraith’s hat',
    entries: [{ when: stage('quest:rimecaller-the-wraith-who-wanted-its-hat', 'hat'), node: 'cut' }, { node: 'peg' }],
    nodes: {
      cut: { speaker: 'narrator', text: 'You thaw a ring around the hat and ease it out of the wall. It is squashed on one side and the feather is bent, but it is a good hat, and on the band inside, in ink: B. Hollin, Glacierhome. If found, please return.', next: null },
      peg: { speaker: 'narrator', text: 'A hat-shaped hollow in the tunnel ice.', next: null },
    },
  },
  {
    id: 'dialogue:obj-dry-firewood-1', name: 'The Longest Loaf: dry wood',
    entries: [{ node: 'wood' }],
    nodes: { wood: { speaker: 'narrator', text: 'A stack of old pit-props in a warm corner of the Undercrypt, where the hold is thinnest. The wood is dry. It smells of wood. You had forgotten wood smelled of anything.', next: null } },
  },

  // ======================= ACT II
  {
    id: 'dialogue:rimecaller-mina', name: 'C-1 Wardenhold: Rememberer Mina Snell', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:mina-snell', text: 'A Rimecaller! From Glacierhome! Sit down. No, there, that’s Old Tor’s chair, he remembers it as his. Thirty years we’ve been stuck this side of the arches, and we kept no archive, so we remember everything out loud. Mostly wrong. Loudly.',
        choices: [
          { text: 'I need to find Rime’s Sentinel.', to: 'colossus', quest: true },
          { text: 'There’s a baker at the forge selling slices of a thirty-year loaf.', to: 'loaf', when: { flag: 'rimecaller.pomfrey_helped' } },
          { text: 'Someone in your watchtower is shouting about drizzle.', to: 'teal', when: { flag: 'rimecaller.teal_helped' } },
        ],
      },
      loaf: { speaker: 'npc:mina-snell', mood: 'happy', text: 'Pomfrey Dunn! I remember Pomfrey Dunn! I remember her as taller. The bread is perfect. Thirty years in the oven and not a burnt edge. Everyone is weeping into it.', next: 'colossus' },
      teal: { speaker: 'npc:mina-snell', mood: 'happy', text: 'He got here two days ago and went straight up the watchtower with a register under his arm. He’s recorded eleven kinds of drizzle. The Wardens are frightened of him.', next: 'colossus' },
      colossus: {
        speaker: 'npc:mina-snell', text: 'The Rimeheart Colossus. It held the pass for the crown’s road, every Turning, for a thousand years. I remember it as kind. Ingeborg, who runs the Wardens’ drill yard, remembers it as rude. Nobody’s gone up in thirty years. The road’s gone strange. People on it, standing still, under the snow.',
        choices: [{ text: 'Standing still. Held.', to: 'held', school: 'rime' }, { text: 'I’ll go up.', to: null }],
      },
      held: { speaker: 'npc:mina-snell', mood: 'afraid', text: 'Held. Yes. Like home. I remember thinking that, and I remember not saying it, because I didn’t want it to be true. Go carefully.', next: null },
    },
  },
  {
    id: 'dialogue:rimecaller-pomfrey-wardenhold', name: 'Pomfrey at Wardenhold',
    entries: [{ node: 'hi' }],
    nodes: { hi: { speaker: 'npc:pomfrey-dunn-wardenhold', mood: 'happy', text: 'There you are! It baked! On your wood! Here, have the heel, the heel’s the best bit and I’ve been saving it for thirty years and a fortnight.', next: null } },
  },
  {
    id: 'dialogue:rimecaller-cornelius-wardenhold', name: 'Cornelius at Wardenhold',
    entries: [{ node: 'hi' }],
    nodes: { hi: { speaker: 'npc:cornelius-teal-wardenhold', mood: 'happy', text: 'Wind from the south-south-west! A smell of goat! A cloud shaped very much like a teapot! I have filled four pages since breakfast. The Wardens keep asking me to stop. I shan’t.', next: null } },
  },
  {
    id: 'dialogue:obj-rimecaller-held-traveller-1', name: 'C-2 the first held traveller', scope: 'party',
    entries: [{ when: { all: [{ heroClass: 'rimecaller' }, stage('quest:rimecaller-the-held-pass', 'travellers')] }, node: 'read' }, { node: 'still' }],
    nodes: {
      read: { speaker: 'narrator', text: 'A pedlar under the snow on the pass road, one foot raised, his pack on his back, his breath frozen in a little cloud in front of his mouth. Thirty years, the same as home.', next: 'frost' },
      frost: {
        speaker: 'narrator', text: 'But the frost on him is wrong. Glacierhome’s hold was a minute, grabbed and squeezed. This one is a road, laid long and patient, the whole length of the pass. It is not the Regent’s working. It is far older, and it comes from the top.',
        choices: [{ text: '(Lay a hand on his shoulder.) Not long now.', to: null }, { text: '(Read the next one.)', to: null }],
      },
      still: { speaker: 'narrator', text: 'A traveller on the pass road, held mid-step under thirty years of snow.', next: null },
    },
  },
  {
    id: 'dialogue:rimecaller-travellers-walk', name: 'C-3 the held travellers walk on', scope: 'party',
    entries: [{ node: 'walk' }],
    nodes: {
      walk: { speaker: 'narrator', text: 'All down the pass, under the snow, people begin to move. A pedlar puts his foot down. A carter clicks to a mule that has been waiting since C. 1012. A girl finishes a snowball and throws it, and it hits nobody, because everybody she was aiming at went home thirty years ago.', next: 'on' },
      on: { speaker: 'narrator', text: 'They walk on, up and over the pass, the way the crown’s road always went. None of them look back. You find you do not mind that at all.', next: null },
    },
  },
  {
    id: 'dialogue:rimecaller-hepsie', name: 'C-4 the Lanternford lantern-wife', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'npc:hepsie-fenny', text: 'Rime, are you? I can tell. You’ve got the look of someone who counts. She had it too, the grey-eyed one. Came in with a chair on a sledge and a tarpaulin over the chair, and asked for a lantern that never goes out.',
        choices: [
          { text: 'What did you sell her?', to: 'sold' },
          { text: 'Was there someone in the chair?', to: 'chair' },
        ],
      },
      chair: { speaker: 'npc:hepsie-fenny', mood: 'sad', text: 'An old man, breathing out. I didn’t look long. You don’t, at a thing like that.', next: 'sold' },
      sold: {
        speaker: 'npc:hepsie-fenny', text: 'An honest one. Oil and wick. It goes out when it’s done, I told her. She thanked me and paid and walked straight out onto the marsh to buy from the Queen instead. Every light off the water is a held moment. She’s building a lantern out of them, round him.',
        choices: [{ text: 'Where is the Queen?', to: 'queen', quest: true }],
      },
      queen: { speaker: 'npc:hepsie-fenny', text: 'Out past the last tussock, where the drowned lights are thickest. Take one of mine. It only leads you where you’re going.', next: null },
    },
  },
  {
    id: 'dialogue:rimecaller-nim-ford', name: 'Nim Larkspur at Lanternford',
    entries: [{ when: { questActive: 'quest:rimecaller-the-regents-lanterns' }, node: 'route' }, { node: 'hi' }],
    nodes: {
      route: {
        speaker: 'npc:nim-larkspur-ford', mood: 'happy', text: 'You! You thawed my face! I’ve walked every inch of this marsh since. Thirty years standing still and now I can’t stop. The safe way to the Queen is left, left, the rotten jetty, and then never step on anything that glows.',
        choices: [{ text: 'Never step on anything that glows. Got it.', to: null, quest: true, effects: [{ setFlag: 'rimecaller.nim_route', value: true }] }],
      },
      hi: { speaker: 'npc:nim-larkspur-ford', text: 'Empty hands. See? Still empty. I check every morning.', next: null },
    },
  },
  // ---------- C-6 Halla's Footnotes
  {
    id: 'dialogue:obj-rime-arch-letter', name: 'C-6 Halla’s letter', scope: 'party',
    entries: [{ when: { all: [{ heroClass: 'rimecaller' }, stage('quest:rimecaller-halla-writes', 'letter')] }, node: 'env' }, { node: 'ice' }],
    nodes: {
      env: { speaker: 'narrator', text: 'Wedged into the ice at the foot of the Rime arch: a fat envelope, fourteen pages, in Halla’s smallest hand. Most of it is footnotes.', next: 'letter' },
      letter: {
        speaker: HV, text: '“The Archive has recorded four hundred and twelve new things since you left¹. Cornelius has started a new register². The Regent’s rooms are empty, and I have not filed them³. The bread is excellent⁴.”',
        choices: [{ text: '(Read the footnotes.)', to: 'notes' }, { text: '(Skip to the end.)', to: 'end' }],
      },
      notes: { speaker: HV, text: '“¹ Itemised overleaf. ² He wept on the first page; it is still drying. ³ I do not know how. ⁴ Pomfrey’s loaf came out of the oven at last. She left me a slice. I did not write it down. I ate it.”', next: 'end' },
      end: {
        speaker: HV, mood: 'sad', text: '(The last line has no footnote. It is written larger than the rest, and not very neatly.) “I am so proud of you that I have run out of ways to be accurate about it. Come home when it is done. H.”',
        choices: [{ text: '(Fold the letter away.)', to: null, quest: true, effects: [{ setFlag: 'rimecaller.halla_letter', value: true }] }],
      },
      ice: { speaker: 'narrator', text: 'Icicles on the Rime arch, dripping steadily for the first time in thirty years.', next: null },
    },
  },
  {
    id: 'dialogue:rimecaller-held-chord', name: 'C-6 the held chord', scope: 'party',
    entries: [{ node: 'chord' }],
    nodes: {
      chord: { speaker: 'narrator', text: 'In the Stone Court the Spire half and the Wall half sing together again, and this time you hold the note: you keep it ringing, perfectly still, exactly as it is, for as long as you can bear.', next: 'go' },
      go: { speaker: 'narrator', text: 'Then you let it go, and it does not stop. It walks off into the evening on its own, the way the travellers did on the pass, and somewhere far off, very faintly, the Drowned Bell answers.', next: null },
    },
  },
  // ---------- featured bearers (hooks on the bearer NPCs)
  {
    id: 'dialogue:rimecaller-featured-stormlancer', name: 'Featured: The Charge on the Pass', scope: 'party',
    entries: [
      { when: stage('quest:rimecaller-the-charge-on-the-pass', 'back'), node: 'back' },
      { when: { all: [stage('quest:rimecaller-the-charge-on-the-pass', 'marks'), { not: { flag: 'rimecaller.kit_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-stormlancer', text: 'Rime! Brilliant, you’ll know. Something big is holding Frostmere Pass shut, and I’m going to charge it. I’ve borrowed a goat. The goat has opinions. You coming?',
        choices: [
          { text: 'You can’t charge a holding, Kit. Let me show you.', to: null, quest: true, effects: [{ setFlag: 'rimecaller.kit_asked', value: true }] },
          { text: 'At least let me read the road first.', to: null, quest: true, effects: [{ setFlag: 'rimecaller.kit_asked', value: true }] },
        ],
      },
      back: {
        speaker: 'npc:bearer-stormlancer', mood: 'happy', text: 'A holding, not a wall. You don’t break it, you let it go. I’d have charged straight into it and been stood on that road for thirty years with a goat. Whatever happens at the Heart, I’ll ride at your shoulder. Second, if you like.',
        effects: [{ setFlag: 'rimecaller.kit_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-rimecaller-pass-hold-mark-1', name: 'The Charge on the Pass: a hold-mark', scope: 'party',
    entries: [{ when: { all: [{ heroClass: 'rimecaller' }, stage('quest:rimecaller-the-charge-on-the-pass', 'marks')] }, node: 'mark' }, { node: 'frost' }],
    nodes: {
      mark: { speaker: 'narrator', text: 'A swirl of frost on a boulder by the pass road, too regular to be weather. You show the Stormlancer bearer how it runs: not across the road like a wall, but along it, like a hand laid flat to keep something from moving.', next: 'kit' },
      kit: { speaker: 'npc:bearer-stormlancer', text: 'So if I charged it… it’d just hold me too. Huh. (Kit looks at the goat. The goat looks at Kit.) Show me the next one.', next: null },
      frost: { speaker: 'narrator', text: 'Old frost on a boulder by the pass road, in a pattern too regular to be weather.', next: null },
    },
  },
  {
    id: 'dialogue:rimecaller-featured-jester', name: 'Featured: A Fool in the Marsh', scope: 'party',
    entries: [
      { when: stage('quest:rimecaller-a-fool-in-the-marsh', 'back'), node: 'back' },
      { when: { all: [stage('quest:rimecaller-a-fool-in-the-marsh', 'lanterns'), { not: { flag: 'rimecaller.tumble_asked' } }] }, node: 'ask' },
    ],
    nodes: {
      ask: {
        speaker: 'npc:bearer-jester', text: 'Ah! A customer! No, wait, you’re a bearer. Even better. I am out-bargaining the Lantern Queen. I have bought three of her lights so far, at a ruinous price, which is part of the plan. I think. Will you look at them?',
        choices: [
          { text: 'Show me the lanterns.', to: null, quest: true, effects: [{ setFlag: 'rimecaller.tumble_asked', value: true }] },
          { text: 'How is losing part of the plan?', to: null, quest: true, effects: [{ setFlag: 'rimecaller.tumble_asked', value: true }] },
        ],
      },
      back: {
        speaker: 'npc:bearer-jester', mood: 'sad', text: 'Somebody’s held moments. I’ve been buying people’s held moments to win an argument. That’s not a bargain, that’s pickpocketing with extra steps. (Tumble puts the last lantern down, very gently.) When we go to the Heart, I’m with you. Honestly. No angle.',
        effects: [{ setFlag: 'rimecaller.tumble_thanked', value: true }], next: null,
      },
    },
  },
  {
    id: 'dialogue:obj-rimecaller-tumble-lantern-1', name: 'A Fool in the Marsh: a held light', scope: 'party',
    entries: [{ when: { all: [{ heroClass: 'rimecaller' }, stage('quest:rimecaller-a-fool-in-the-marsh', 'lanterns')] }, node: 'held' }, { node: 'lamp' }],
    nodes: {
      held: { speaker: 'narrator', text: 'A marsh-light in a jar. You read it the way you would read a frozen face. Inside, held, is one moment from a stranger’s life: a woman on a jetty, waving someone off, the second before she knows they are not coming back. She has been waving for a hundred years.', next: 'let' },
      let: {
        speaker: 'narrator', text: 'You could keep this. Write it down, every detail, and let it go.',
        choices: [{ text: '(Keep it, and open the jar.)', to: 'open', school: 'rime' }, { text: '(Put it down.)', to: null }],
      },
      open: { speaker: 'narrator', text: 'You write her down. Then you open the jar, and the light goes up and out over the marsh, and does not come down.', next: null },
      lamp: { speaker: 'narrator', text: 'A marsh-light in a jar, glowing very faintly.', next: null },
    },
  },
  // ---------- class hooks on the Brindlecross people
  {
    id: 'dialogue:hook-rimecaller-ysolde', name: 'Hook: Ysolde and the thirteenth line', scope: 'party',
    entries: [{
      when: { all: [{ flag: 'rimecaller.treaty_seen' }, { not: { flag: 'rimecaller.treaty_shown' } }, { not: { questActive: 'quest:cc-stone-court' } }] },
      node: 'ask',
    }],
    nodes: {
      ask: {
        speaker: 'npc:ysolde', text: 'You’re from the Archive of the Spire. Then you’ve seen the Rime copy of the founding treaty. Please tell me you’ve seen the last page. Mine was eaten by a goat in C. 600.',
        effects: [{ setFlag: 'rimecaller.treaty_shown', value: true }],
        choices: [{ text: 'Twelve signatures, and a thirteenth line, ruled and left blank.', to: 'line', insight: 'thirteenth_line' }, { text: 'Another time.', to: null }],
      },
      line: { speaker: 'npc:ysolde', mood: 'afraid', text: 'Ruled. Left. For someone. (She writes it down three times, in three different books.) Thank you. I think that may be the most important thing anyone has said to me in this village.', next: null },
    },
  },
  // ======================= ACT III
  {
    id: 'dialogue:rimecaller-herald-fate', name: 'III-4 the Herald of the Held Hour: Seraphine’s fate', scope: 'party',
    entries: [{ when: { flag: 'rimecaller.conduits', value: 'opened' }, node: 'held' }, { node: 'kneel' }],
    nodes: {
      kneel: { speaker: 'npc:seraphine-cold', mood: 'hollow', text: 'Listen. It’s stopped. The note’s stopped. (She is kneeling on the stair, holding the ice bell against her as if it were cold.) Something will come next now. I can’t bear what comes next.', next: 'choose' },
      held: { speaker: 'npc:seraphine-cold', mood: 'hollow', text: '(She is kneeling on the stair, holding the dead bell against her.) You opened the Conduits. You put out the Wall’s fires to keep one evening whole. You held it too, hour-walker. Don’t pretend you don’t understand me.', next: 'choose' },
      choose: {
        speaker: 'npc:seraphine-cold', mood: 'sad', text: 'He is in the camp below, one breath from the end. If I let the hour go, he finishes it. Tell me what an Archive is for, Halla’s child. Tell me why I shouldn’t hold.',
        choices: [
          {
            text: 'Let me keep him for you, written the oldest way. Then you can let him go.', to: 'keep', quest: true,
            when: { any: [{ flag: 'rimecaller.conduits', value: 'written' }, { trust: HV, value: 'trusted' }] },
            lockedLabel: 'You need the Archive’s oldest way of keeping',
            effects: [{ setFlag: 'rimecaller.nemesis_fate', value: 'spared' }],
          },
          { text: 'Nothing should be held for ever. Not him. Not you. (Break the bell.)', to: 'destroy', quest: true, effects: [{ setFlag: 'rimecaller.nemesis_fate', value: 'destroyed' }] },
        ],
      },
      keep: { speaker: 'narrator', text: 'You sit down beside her on the stair and take out your Archive pencil, and she tells you about Anselm: his grey cardigan, the chipped cup, the way he hums when he reads. You write it all down. It takes a long time. The Heart does not hurry you.', next: 'keep2' },
      keep2: { speaker: 'npc:seraphine-cold', mood: 'sad', text: '(She reads it twice. The hoarfrost runs off her robe as water.) It’s him. It’s all of him. (She folds it very small.) Then I don’t have to hold him. I can keep him. Oh, Anselm. I can let you go.', next: null },
      destroy: { speaker: 'narrator', text: 'You strike the ice bell, and at last it rings a second note. Then it breaks, and the Herald breaks with it, into frost that lifts off the stair and blows away into a sky with no hours in it.', next: null },
    },
  },
  {
    id: 'dialogue:obj-rimecaller-first-entry', name: 'Halla’s First New Entry: the Citadel steps', scope: 'party',
    entries: [
      { when: { all: [{ heroClass: 'rimecaller' }, stage('quest:rimecaller-hallas-first-new-entry', 'entry'), { flag: 'rimecaller.halla_devotable' }] }, node: 'devoted' },
      { when: { all: [{ heroClass: 'rimecaller' }, stage('quest:rimecaller-hallas-first-new-entry', 'entry')] }, node: 'entry' },
      { node: 'page' },
    ],
    nodes: {
      entry: { speaker: 'narrator', text: 'On the top step of the Twelve Stairs, with the Citadel doors open in front of you, you rule a fresh page in the Archive’s hand. Date: C. 1042, after the Bell. Temperature in the Heart: cold, and moving.', next: 'new' },
      new: {
        speaker: 'narrator', text: 'One new thing. Halla underlined that part twice.',
        choices: [
          { text: '(Write: “The Legion sat down.”)', to: 'end' },
          { text: '(Write: “I was afraid, and I went on anyway.”)', to: 'end' },
          { text: '(Write: “A snowdrop, in the Heart.”)', to: 'end', when: { flag: 'rimecaller.snowdrop' } },
          { text: '(Write down a spell you have only just made up.)', to: 'end', school: 'rime' },
        ],
      },
      end: { speaker: 'narrator', text: 'You blot it and sign it. It is the first entry in the Archive of the Spire for thirty years, and it is already out of date. Halla will be thrilled.', next: null },
      devoted: {
        speaker: 'narrator', text: 'On the top step of the Twelve Stairs, with the Citadel doors open in front of you, you rule a fresh page in the Archive’s hand. Date: C. 1042, after the Bell. Temperature in the Heart: cold, and moving.',
        effects: [{ trust: HV, set: 5 }], next: 'new-d',
      },
      'new-d': {
        speaker: 'narrator', text: 'One new thing. Halla underlined that part twice.',
        choices: [
          { text: '(Write: “The Legion sat down.”)', to: 'end-d' },
          { text: '(Write: “I was afraid, and I went on anyway.”)', to: 'end-d' },
          { text: '(Write: “A snowdrop, in the Heart.”)', to: 'end-d', when: { flag: 'rimecaller.snowdrop' } },
          { text: '(Write down a spell you have only just made up.)', to: 'end-d', school: 'rime' },
        ],
      },
      'end-d': { speaker: 'narrator', mood: 'happy', text: 'You blot it and sign it. Far away in Glacierhome, in a study full of running clocks, Halla Vint looks up from her drawer marked NEW as if someone had said her name. She writes one word in the margin, “Noted”, then crosses it out and writes “Loved”.', next: null },
      page: { speaker: 'narrator', text: 'The Citadel steps, where the Archive’s first new entry in thirty years was written. The ink is dry. The day is not over.', next: null },
    },
  },
  {
    id: 'dialogue:rimecaller-anselm-heart', name: 'Anselm: the last of the hour', scope: 'party',
    entries: [
      { when: { all: [stage('quest:rimecaller-anselm', 'chair'), { flag: 'rimecaller.nemesis_fate', value: 'spared' }] }, node: 'together' },
      { when: stage('quest:rimecaller-anselm', 'chair'), node: 'chair' },
      { node: 'gone' },
    ],
    nodes: {
      chair: { speaker: 'narrator', text: 'Anselm Cold’s good chair, in the middle of the Legion camp, with the hollowed standing round it in a ring, very quietly, as if not to wake him. He is breathing out. He has been breathing out since C. 1012.', next: 'let' },
      let: {
        speaker: 'narrator', text: 'Round him is the last of the hold: a patch of held hour the size of a room, and a cup on the table beside him that will never cool.',
        choices: [
          { text: '(Let the hour go.)', to: 'tick', quest: true },
          { text: '(Write him down first, the oldest way. Then let it go.)', to: 'kept', quest: true, school: 'rime' },
        ],
      },
      kept: { speaker: 'narrator', text: 'You write him down: the grey cardigan, the chip in the cup, the way his left hand lies open on the arm of the chair as if someone has only just let go of it. Then you let the hour go.', next: 'tick' },
      tick: { speaker: 'narrator', text: 'Somewhere a clock ticks once. Anselm Cold breathes in.', next: 'wake' },
      wake: {
        speaker: 'npc:anselm-cold-heart', text: 'Oh. Hello. (He blinks at the Legion, and the black sky, and you, quite unalarmed.) I seem to have nodded off. What year is it?',
        choices: [{ text: 'C. 1042.', to: 'year' }, { text: 'You’ve been asleep thirty years.', to: 'year' }],
      },
      year: {
        speaker: 'npc:anselm-cold-heart', mood: 'happy', text: '(He laughs, a proper laugh, delighted.) Thirty years! I only shut my eyes for a minute. Seraphine will be furious. Where is she? She was in the next room.',
        choices: [{ text: 'She waited for you as long as she could.', to: 'waited' }, { text: 'She’s gone, Anselm. I’m sorry.', to: 'sorry' }],
      },
      waited: { speaker: 'npc:anselm-cold-heart', mood: 'sad', text: 'Thirty years. She would. She never could bear the end of anything, my girl, not even a book. Tell her it was a good evening. Tell her one was enough.', next: 'go' },
      sorry: { speaker: 'npc:anselm-cold-heart', text: 'Then I shan’t keep her waiting. (He settles back in the chair.) That was always the trouble with Seraphine. She thought the end of a thing was the opposite of the thing.', next: 'go' },
      go: { speaker: 'narrator', mood: 'sad', text: 'He breathes out the rest of the way, and does not breathe in. Round the chair, one by one, the hollowed sit down in the dust, as if somebody has finally said they may.', next: null },
      together: { speaker: 'narrator', text: 'Anselm Cold’s chair, in the middle of the Legion camp. Seraphine is kneeling beside it with her hand on his, and your Archive pages on her knee, every one of them him.', next: 'ask' },
      ask: {
        speaker: 'npc:seraphine-cold', mood: 'sad', text: 'I’ve read it nine times. It’s all there. The cardigan. The chip in the cup. (She doesn’t look up.) Let it go, hour-walker. Please. I can’t do it by myself, and I don’t want to do it alone.',
        choices: [{ text: '(Let the hour go, together.)', to: 'tick2', quest: true }],
      },
      tick2: { speaker: 'narrator', text: 'Somewhere a clock ticks once. Anselm Cold breathes in, and opens his eyes, and finds his wife there.', next: 'wake2' },
      wake2: { speaker: 'npc:anselm-cold-heart', text: 'Seraphine. You look tired, love. What year is it?', next: 'year2' },
      year2: { speaker: 'npc:seraphine-cold', mood: 'sad', text: 'Ten forty-two. I held it, Anselm. I held it thirty years.', next: 'laugh2' },
      laugh2: { speaker: 'npc:anselm-cold-heart', mood: 'happy', text: '(He laughs, a proper laugh, and takes her face in both his hands.) Thirty years! You never could bear the end of a book. Was it a good evening, at least?', next: 'end2' },
      end2: { speaker: 'npc:seraphine-cold', text: 'It was a very good evening.', next: 'go2' },
      go2: { speaker: 'narrator', mood: 'sad', text: 'He breathes out the rest of the way, and does not breathe in, and she lets him. Round the chair, one by one, the hollowed sit down in the dust, as if somebody has finally said they may.', next: null },
      gone: { speaker: 'narrator', text: 'An empty chair in the Legion camp, and a cup of something on the table beside it, gone cold.', next: null },
    },
  },
  {
    id: 'dialogue:obj-rimecaller-still-one', name: 'The Still One', scope: 'party',
    entries: [{ when: { all: [{ heroClass: 'rimecaller' }, stage('quest:rimecaller-the-still-one', 'shard')] }, node: 'shard' }, { node: 'gone' }],
    nodes: {
      shard: { speaker: 'narrator', text: 'A sliver of the Still Reflection, taller than you, standing on its point in the dust. Your face is in it, perfectly still. The hollowed stand round it and gaze at it, the way Glacierhome used to gaze at the clocks.', next: 'face' },
      face: {
        speaker: 'narrator', text: 'Your reflection does not blink. It wants you to stand still with it, here, for ever. It is the only thing in the Heart that is not weeping.',
        choices: [
          { text: '(Shatter it.)', to: 'shatter', quest: true, effects: [{ setFlag: 'rimecaller.still_one', value: 'shattered' }] },
          { text: '(Keep it properly: write it down, and let it go.)', to: 'keep', quest: true, school: 'rime', effects: [{ setFlag: 'rimecaller.still_one', value: 'kept' }] },
        ],
      },
      shatter: { speaker: 'narrator', text: 'One blow, and it is ten thousand bright pieces on the ground, every one of them moving. The hollowed blink, and look round, and wander off as if they have forgotten what they came for.', next: null },
      keep: { speaker: 'narrator', text: 'You write it down: your own face, held, in every detail. Then you let it go. The ice clouds over and is only ice, and the hollowed drift away from it.', next: 'drawer' },
      drawer: { speaker: 'narrator', mood: 'happy', text: 'You break off one splinter no bigger than a fingernail and wrap it in your handkerchief. Halla has a drawer marked NEW. This isn’t new, but she will want it anyway, filed under OLD, and FINISHED.', next: null },
      gone: { speaker: 'narrator', text: 'Where the shard stood, a ring of footprints in the dust, all facing inward, all walking away.', next: null },
    },
  },
];

export default dialogues;
