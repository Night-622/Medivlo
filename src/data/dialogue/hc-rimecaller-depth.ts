/**
 * Hollow Crown, RIMECALLER Act I depth pass (10-campaign-style.md §8, docs/PACING.md): the new stages' scenes,
 * investigation clues, travel banter, optional finds and the third parts of the side quests. Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const fresh = (q: Q): NarrativeCondition => ({ all: [{ not: { questActive: q } }, { not: { questCompleted: q } }] });
const offer = (q: Q, text: string, to: string, extra?: NarrativeCondition): DialogueChoice =>
  ({ text, to, quest: true, when: extra ? { all: [fresh(q), extra] } : fresh(q), effects: [{ startQuest: q }] });
/** a stage scene that takes over an NPC's talk must still let them give their own quests */
const more = (...offers: DialogueChoice[]): DialogueChoice[] => [...offers, { text: 'Thank you.', to: null }];
const HV = 'npc:halla-vint' as const, SC = 'npc:seraphine-cold' as const, AF = 'npc:aud-fellmark' as const;
const GT = 'npc:gunnhild-tapp' as const, OR = 'npc:osgar-rusk' as const, WF = 'npc:wendel-fross' as const;
const MS = 'npc:mina-snell' as const;

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
  // ======================= I-1 The First Tick: up the Stair, a new pin
  {
    id: 'dialogue:area-rimecaller-spire-stair', name: 'I-1 banter: up the Spire Stair', bark: true,
    entries: [{ when: stage('quest:rimecaller-the-first-tick', 'stair'), node: 'b' }],
    nodes: { b: { speaker: HV, text: 'Don’t touch the lamplighter. Don’t touch anything. If the hold flinches again while you’re halfway through a step, I am not carrying you.', next: null } },
  },
  {
    id: 'dialogue:rimecaller-halla-pin', name: 'I-1 Halla cuts a new pin', scope: 'party',
    entries: [{ node: 'in' }],
    nodes: {
      in: { speaker: 'narrator', text: 'Halla’s study: one desk, one lathe for cutting ice, and a wall of labelled drawers. TEA. PENCILS (SPARE). PENCILS (SPARE, SPARE). REGRETS, which is empty. And NEW, which is open an inch.', next: 'lathe' },
      lathe: {
        speaker: HV, text: 'Sit. Collar. (She unpins the cracked ice from your collar and holds it to the lamp.) Clean through the hour. An hour-pin is a little piece of the hold that has agreed to let you pass. Tonight the hold flinched, and so did your pin.',
        choices: [
          { text: 'What happens if it fails?', to: 'fail' },
          { text: 'Who else heard the tick?', to: 'who' },
          { text: '(Breathe on the crack and hold it still while she works.)', to: 'hold', school: 'rime' },
        ],
      },
      fail: { speaker: HV, text: 'You stop. Mid-step, like everyone else, wide awake inside and very bored, until somebody cuts you a new one. Which would be me. I would be extremely cross about it, and you would not be able to argue.', next: 'cut' },
      who: { speaker: HV, text: 'Every hour-walker. Osgar dropped a tray. Gunnhild lost count for the first time in her life, and is furious. The Regent has not sent down at all, which for her is the loudest thing she has ever done.', next: 'cut' },
      hold: { speaker: HV, mood: 'happy', text: '(The crack goes still under your breath. She looks at you over her spectacles.) Show-off. Useful show-off. Keep doing that.', next: 'cut' },
      cut: {
        speaker: HV, text: '(She sets a block of old blue ice on the lathe and cuts, quickly, without looking.) Every pin is cut to the minute. Eleven fifty-two. It is the key to the hold, and everybody’s key is the same. In thirty years not one of you has ever asked me why that minute.',
        choices: [
          { text: 'Why that minute?', to: 'why' },
          { text: '(Say nothing. Watch her hands.)', to: 'hands' },
        ],
      },
      why: { speaker: HV, mood: 'sad', text: 'Because that is the minute the hold began, and the Regent began it. And because I have never asked her either, and I am the Archivist-Superior, and asking things is my entire job. Tonight I find that rather embarrassing.', next: 'pinned' },
      hands: { speaker: 'narrator', text: 'Her hands are perfectly steady. They shake exactly once, as she cuts the last figure of the minute, and then they are steady again, and she does not mention it, so neither do you.', next: 'pinned' },
      pinned: { speaker: HV, text: '(She fastens the new pin at your collar. It is colder than the old one, and clearer.) There. Good for another thirty years, or until something else rings. I suspect something else will ring.', next: 'drawer' },
      drawer: {
        speaker: 'narrator', text: 'Inside the drawer marked NEW, alone, lies a single sheet of paper. On it, in Halla’s smallest hand: “Tick. All clocks. 11.52 and a half. Witnessed.” She sees you looking, and shuts the drawer with her hip.',
        choices: [
          { text: 'That’s the first new thing in thirty years.', to: 'first', trust: 1, trustNpc: HV },
          { text: '(Pretend you didn’t see.)', to: 'gauges' },
        ],
      },
      first: { speaker: HV, text: 'It is the first new thing in thirty years, and I have filed it, and we will not speak of it again. (She very nearly smiles.) Perhaps once more. Later.', next: 'gauges' },
      gauges: {
        speaker: HV, text: 'Now. The whole hold shook, and I want to know how badly. Five hold-gauges on the Spire Stair. Read them, come back, and I will make tea, which is to say I will look at the tea.',
        choices: [
          { text: 'I’ll read them.', to: 'end' },
          { text: 'You could read them yourself.', to: 'self' },
        ],
      },
      self: { speaker: HV, text: 'I could. But I am sixty-three and in my night-cap, and you are the one who is ticking. Off you go.', next: 'end' },
      end: { speaker: HV, text: 'Mind the lamplighter. If he blinks again, note the time.', next: null },
    },
  },

  // ======================= I-2 The Hold-Gauges: the other gauges, the melt running down
  ...[
    'The second gauge. The drip is faster here. Somebody has tied a label round its neck: DO NOT TAP. Somebody has tapped it.',
    'The third gauge is cracked from the bottom up, a fine white line like a hair in ice. The black at its foot has frozen into a bead, and the bead sits there exactly like a tear on a cheek.',
    'The fourth stands by the Archive porter’s board. Osgar has pinned a notice to it, very neatly: GAUGE DRIPPING. NOT MY DEPARTMENT.',
    'The last gauge, at the top of the Stair under the Spire. It drips in pairs: a long drop, a short one, a rest. Then again. Water does not usually keep time.',
  ].map((text, i): DialogueDef => ({
    id: `dialogue:obj-hold-gauge-${i + 2}`, name: `I-2 a hold-gauge (${i + 2})`,
    entries: [{ when: stage('quest:rimecaller-the-hold-gauges', 'gauges'), node: 'drip' }, { node: 'gauge' }],
    nodes: {
      drip: { speaker: 'narrator', text, next: null },
      gauge: { speaker: 'narrator', text: 'A hold-gauge on the Spire Stair, dripping slowly.', next: null },
    },
  })),
  clue('rimecaller-melt-run-1', 'I-2 the black melt (1)', stage('quest:rimecaller-the-hold-gauges', 'melt'),
    'The black melt from the first gauge runs down the Stair in a thin bright thread, step to step, never pooling, as if the Stair had been cut as a gutter for it.', 'rimecaller.melt_1',
    'A clean step, for Glacierhome.'),
  clue('rimecaller-melt-run-2', 'I-2 the black melt (2)', stage('quest:rimecaller-the-hold-gauges', 'melt'),
    'It runs past the lamplighter’s boots and on down. Caught in the thread, frozen flat, is a canvas apron with CISTERN KEEPERS’ GUILD stitched across the bib. One of the wraiths was wearing it.', 'rimecaller.melt_2',
    'A wet patch on the stair where something lay for a long time.'),
  clue('rimecaller-melt-run-3', 'I-2 the black melt (3)', stage('quest:rimecaller-the-hold-gauges', 'melt'),
    'Halfway down to the Undercrypt the thread runs into an iron grate beside a keepers’ hut with a cold chimney. It doesn’t trickle in. It is drawn in, steadily, the way a drink goes down a throat.', 'rimecaller.melt_downhill',
    'An iron grate at the head of the Undercrypt steps.', 'From below, very faintly, something swallows.'),

  // ======================= I-3 The Melt Cisterns: the keepers’ log
  {
    id: 'dialogue:obj-rimecaller-keepers-log', name: 'I-3 the cistern-keepers’ log', scope: 'party',
    entries: [{ when: stage('quest:rimecaller-the-melt-cisterns', 'hut'), node: 'log' }, { node: 'plain' }],
    nodes: {
      log: { speaker: 'narrator', text: 'The cistern-keepers’ log, in four hands. “Water level high. Morale low.” “Water level higher. Morale wet.” “Water black. Have written to the Archive. Archive replies that it is noted.”', effects: [{ setFlag: 'rimecaller.keepers_log', value: true }], next: 'last' },
      last: { speaker: 'narrator', text: 'The last entry, a month old: “Gone down to see. Back for supper. If not back for supper, somebody eat the supper, it is a good stew and should not be wasted.” On the stove the stew has been held at a perfect simmer for thirty years.', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'Four bowls on the table, set out and waiting.',
        choices: [
          { text: '(Take the pot off the heat. They’ll want it when they’re back.)', to: 'pot' },
          { text: '(Eat a spoonful. It said somebody should.)', to: 'spoon' },
        ],
      },
      pot: { speaker: 'narrator', text: 'You lift the pot onto the hob’s cold edge. It is the first thing in the hut to change in thirty years. Down the steps, the black water goes on draining away below.', next: null },
      spoon: { speaker: 'narrator', text: 'It is a very good stew: barley, onion, a great deal of pepper. It is also, technically, thirty years old. You feel braver at once, and only slightly unwell.', next: null },
      plain: { speaker: 'narrator', text: 'The cistern-keepers’ hut, its log open on the table.', next: null },
    },
  },

  // ======================= I-4 The Regent’s Key: the clocks that ticked, the report
  clue('rimecaller-ticked-clock-1', 'I-4 a clock that ticked (1)', stage('quest:rimecaller-the-regents-key', 'ticked'),
    'The Couriers’ Clock at the turn of the Stair. Beside its minute hand there is a scratch in the frost on the glass, one minute wide: it moved. And beside that, the other way, a second scratch. It moved back.', 'rimecaller.ticked_1',
    'The Couriers’ Clock, pointing at eleven fifty-two.'),
  clue('rimecaller-ticked-clock-2', 'I-4 a clock that ticked (2)', stage('quest:rimecaller-the-regents-key', 'ticked'),
    'The Weighing Clock at the head of the Market Steps. The same two scratches, forward and back. On the brass of its case is a fingerprint in the frost, small and neat, exactly where you would push a hand home.', 'rimecaller.ticked_2',
    'The Weighing Clock, with a fingerprint on its case.'),
  clue('rimecaller-ticked-clock-3', 'I-4 a clock that ticked (3)', stage('quest:rimecaller-the-regents-key', 'ticked'),
    'The great Market Clock. You open its case. Wedged in the escapement, where it stops the works from ticking twice, is a bead of black ice no bigger than a pea. Somebody put it there within the minute.', 'rimecaller.clocks_reset',
    'The great Market Clock, its case shut.', 'The bead is very cold, and slightly salty, and still, faintly, wet.'),
  {
    id: 'dialogue:rimecaller-regent-report', name: 'I-4 the Regent hears about the clocks', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: SC, text: 'Well? How far did they move?',
        choices: [
          { text: 'One minute forward. Then back again.', to: 'back' },
          { text: 'Somebody set them back by hand. There was black ice in the works.', to: 'ice', when: { flag: 'rimecaller.clocks_reset' } },
        ],
      },
      back: { speaker: SC, text: 'One minute, and back. Good. Then the hold is only bruised. Bruises mend, even in here.', next: 'wind' },
      ice: {
        speaker: SC, text: '(Her hand closes, very slightly, at her side.) Black ice. In my clocks. The hold mends itself, hour-walker, the way a held breath goes on holding. That is all you saw.',
        choices: [
          { text: 'Is it?', to: 'isit' },
          { text: 'Then the hold is very tidy. It even leaves fingerprints.', to: 'prints', when: { flag: 'rimecaller.ticked_2' } },
        ],
      },
      isit: { speaker: SC, mood: 'sad', text: 'It must be. The other thing it might be is that something in this city wants very badly to move, and I cannot bear that tonight. Forgive me.', next: 'wind' },
      prints: { speaker: SC, text: '(A long look, grey and level.) Halla has taught you to notice. She never could teach anyone when to stop. Leave the clocks to me, child. They are the only thing in Glacierhome that is mine.', next: 'wind' },
      wind: { speaker: SC, text: 'Do you know what a Regent of Glacierhome does? She winds the clocks. Every morning for three hundred years, a Regent has gone round this city with a key. I have not wound one in thirty years. My key has never been so clean.', next: 'ask' },
      ask: {
        speaker: SC, text: 'The hold is failing all the same. The Archive sits tomorrow. I have a motion to put to it, and I would like a young voice in the room that heard the tick. Will you come?',
        choices: [{ text: 'I’ll come.', to: 'end' }, { text: 'I’ll come, and I’ll vote how I like.', to: 'free' }],
      },
      free: { speaker: SC, mood: 'happy', text: 'Of course you will. Halla taught you to. She taught me to, once. I was very bad at it.', next: 'end' },
      end: { speaker: SC, text: 'Until tomorrow, then. Whatever tomorrow means, in here.', next: null },
    },
  },

  // ======================= I-5 The Conduit Vote: the envoy and the drip-counter before the vote
  {
    id: 'dialogue:rimecaller-aud-canvass', name: 'I-5 the envoy before the vote', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: AF, mood: 'happy', text: 'Asked? You’re asking me? (She sets her shield down off her knees, which she has not done since C. 1012, and looks at it on the floor as if it might wander off.) Thirty years. They gave me a chair. Nobody gave me a question.', next: 'cold' },
      cold: {
        speaker: AF, text: 'Here’s the thing. The cold isn’t yours. It’s the Wall’s. Every bit of it is a watch-fire that stays lit on a bad night, a Warden who doesn’t freeze at her post. You pull it up here, it comes off them.',
        choices: [
          { text: 'What happens to the Wall if the Conduits open?', to: 'wall' },
          { text: 'Why did you come up here in the first place?', to: 'why' },
        ],
      },
      wall: { speaker: AF, mood: 'sad', text: 'Six fires go out on the Long Rampart. I know which six. My sister keeps one of them, or she did. I’ve not had a letter in thirty years, so I hope she still does.', next: 'end' },
      why: { speaker: AF, mood: 'happy', text: 'To ask for more cold, for a hard winter. Funny, isn’t it. I came up here begging for the very thing you lot are voting to take. I’d vote against my own request now, if they let me vote.', next: 'end' },
      end: { speaker: AF, text: 'Say what you think tomorrow. Say it loud. Wardens like loud. The Archive likes it in triplicate, but you can’t have everything.', next: null },
    },
  },
  {
    id: 'dialogue:rimecaller-gunnhild-canvass', name: 'I-5 Gunnhild before the vote', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: GT, text: 'The Conduits? They run right under my counters. Old pipes, cold enough to take your skin off. (She goes on counting under her breath, and doesn’t lose her place.) Opening them won’t stop the drips. You can tell them that from me.', effects: [{ setFlag: 'rimecaller.gunnhild_asked', value: true }], next: 'ask' },
      ask: {
        speaker: GT, text: 'Go on. Ask me how I know. Nobody ever asks me how I know.',
        choices: [
          { text: 'How do you know?', to: 'know' },
          { text: 'Then what will opening them do?', to: 'do' },
        ],
      },
      know: { speaker: GT, mood: 'happy', text: 'Because I count. Four thousand and nine since breakfast, and the gaps between them always the same. You can’t fool a counter. You can only make her count faster.', next: 'do' },
      do: { speaker: GT, text: 'Make them colder, and quicker, and the beat underneath stays exactly where it is. Whatever’s keeping time down here doesn’t care how much cold you give it. Say so, if anybody asks. Nobody will.', choices: more(offer('quest:rimecaller-the-drip-counters', 'What beat?', 'beat')) },
      beat: { speaker: GT, text: 'I won’t tell you. You have to hear it. At the counter station, at night, with your ear to the brass. Not out loud.', next: null },
    },
  },

  // ======================= I-6 The Mirror Gallery: through the Market
  {
    id: 'dialogue:area-rimecaller-market-walk', name: 'I-6 banter: through the Frozen Market', bark: true,
    entries: [{ when: stage('quest:rimecaller-the-mirror-gallery', 'gallery'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Through the Frozen Market, past a thousand people holding their breath. A girl holds a toffee apple an inch from her open mouth. She has been about to bite it for thirty years, and she still looks thrilled.', next: null } },
  },

  // ======================= I-7 The Next Room: the physician’s surgery, Halla hears it
  {
    id: 'dialogue:obj-rimecaller-physician-daybook', name: 'I-7 Doctor Mure’s surgery', scope: 'party',
    entries: [{ when: stage('quest:rimecaller-the-next-room', 'physician'), node: 'desk' }, { node: 'plain' }],
    nodes: {
      desk: { speaker: 'narrator', text: 'Doctor Wilmot Mure’s surgery, small and tidy. An empty coat-hook. A cup of cocoa with a skin on it. The day-book open on the desk: “11.40. Runner from the Spire: the Lord Anselm. Took the bag.”', effects: [{ setFlag: 'rimecaller.physician_read', value: true }], next: 'letter' },
      letter: {
        speaker: 'narrator', text: 'Under the day-book, a note in a tall grey hand, dated a week before the hold: “Doctor. Is there nothing? Not even time? — S.” Pinned to it, his reply, never sent: “Madam, I can give him an easy night. I cannot give him time. Nobody can.”',
        choices: [
          { text: '(Read the reply again.)', to: 'again' },
          { text: '(Look at the surgery clock.)', to: 'clock' },
        ],
      },
      again: { speaker: 'narrator', text: 'He has crossed out “Nobody can”, and written above it, very small, in a different ink: “Nobody should.” Then he never sent it at all.', next: null },
      clock: { speaker: 'narrator', text: 'The surgery clock has stopped at eleven fifty-two, like all of them. Twelve minutes after the runner came. Long enough to climb the Spire with a bag, and reach a bedside, and see.', effects: [{ insight: 'held_minute' }], next: null },
      plain: { speaker: 'narrator', text: 'A doctor’s surgery on the Market Steps, very tidy and very cold.', next: null },
    },
  },
  {
    id: 'dialogue:rimecaller-halla-proof', name: 'I-7 Halla learns what holds the hour', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: HV, text: 'Well? (She sees your face.) Sit. No, not that one, that is the regret chair, nobody sits in it. There.', next: 'tell' },
      tell: {
        speaker: 'narrator', text: 'You tell her about the clock wall: every hand at eleven fifty-two, and the pipe of black ice threaded through every clock in the city, up and up, to the crown of the Spire. Halla listens with her pencil held above the page, and writes nothing.',
        choices: [
          { text: 'The hold is being fed tears.', to: 'fed' },
          { text: 'Doctor Mure told her he couldn’t give Anselm time. So she took it.', to: 'mure', when: { flag: 'rimecaller.physician_read' } },
          { text: 'Gunnhild’s drips come down that pipe. It’s his heartbeat, carried through the whole city.', to: 'pipe', when: { flag: 'rimecaller.pipe_heard' } },
          { text: 'The black rye at Pomfrey’s. It was ordered for his supper.', to: 'rye', when: { flag: 'rimecaller.rye_told' } },
        ],
      },
      fed: { speaker: HV, mood: 'afraid', text: 'Fed. The melt on the Stair, the Blob in the cisterns, the wraiths with their aprons on. All of it is what spills over when you pour the Wall’s tears into a held hour, one cup a day, for a year.', next: 'why' },
      mure: { speaker: HV, mood: 'sad', text: '“Nobody can.” Wilmot always did know how to put a thing. She asked a doctor for time, and he said no, so she asked the glacier instead. The glacier has never once said no to anybody.', next: 'why' },
      pipe: { speaker: HV, mood: 'sad', text: 'Down the pipe. Not up. One dying man’s pulse, sent down through every clock in Glacierhome, so that the whole city keeps his time and never once notices. That is very nearly beautiful. I would like it to stop.', next: 'why' },
      rye: { speaker: HV, mood: 'sad', text: 'His black rye. With the crust burned, I expect; he always had it burned. Thirty years Pomfrey has kept that loaf rising for a man who is never going to be hungry. Oh, Seraphine.', next: 'why' },
      why: {
        speaker: HV, text: 'I taught her to hold a snowflake in the air for an hour. She held a city for thirty years. I keep trying to be angry, and I keep arriving somewhere else.',
        choices: [
          { text: 'Where?', to: 'where' },
          { text: 'Be angry. She’s putting out the Wall’s fires to do it.', to: 'angry', trust: 1 },
        ],
      },
      where: { speaker: HV, text: 'At the door of that little room, I think. With her. That is the trouble with understanding people. It makes them so much harder to stop.', next: 'spire' },
      angry: { speaker: HV, text: 'Yes. Yes. Six fires on the Rampart, Wardens freezing at their posts, so that one breath stays in one room. Thank you. I needed somebody to say that out loud in this study, and it could not be me.', next: 'spire' },
      spire: { speaker: HV, text: 'She will be at the crown of the Spire, beside the stone, waiting for the one person who can lift it. She has known it was you since the tick. Go up. Don’t let her talk you into holding still. She is very good at it.', next: 'end' },
      end: {
        speaker: HV, text: 'Well? Go on.',
        choices: [
          { text: 'And Anselm?', to: 'anselm' },
          { text: 'I’ll bring her down.', to: null },
        ],
      },
      anselm: { speaker: HV, text: 'Let him finish his breath. It is the one thing nobody in this city has ever been allowed to do. That, and see the sea. Go.', next: null },
    },
  },

  // ======================= I-9 The Thaw Road: the mile-clock, and the road
  {
    id: 'dialogue:obj-rimecaller-mile-clock', name: 'I-9 the mile-clock on the Thaw Road', scope: 'party',
    entries: [{ when: stage('quest:rimecaller-the-thaw-road', 'milestone'), node: 'clock' }, { node: 'plain' }],
    nodes: {
      clock: { speaker: 'narrator', text: 'A mile-clock on a post, Archive brass: GLACIERHOME, FOUR MILES. YOU HAVE BEEN WALKING FOR … and a little window where the hours turn. It has just begun to run again, catching up on thirty years with a sound like a cat purring.', next: 'book' },
      book: {
        speaker: 'narrator', text: 'In the snow at its foot, fallen from the Regent’s sledge, lies a book, splayed open on its spine at page two hundred and six.',
        choices: [
          { text: '(Pick it up. Find the ribbon you left at his page.)', to: 'ribbon', when: { flag: 'rimecaller.anselm_book' }, effects: [{ setFlag: 'rimecaller.anselm_book_kept', value: true }, { unlockLore: 'lore:hc-rime-mile-clock' }] },
          { text: '(Pick it up. He’ll want his place.)', to: 'take', when: { not: { flag: 'rimecaller.anselm_book' } }, effects: [{ setFlag: 'rimecaller.anselm_book_kept', value: true }, { unlockLore: 'lore:hc-rime-mile-clock' }] },
          { text: '(Set it on top of the mile-clock, where she’ll see it if she ever comes back this way.)', to: 'leave', effects: [{ unlockLore: 'lore:hc-rime-mile-clock' }] },
        ],
      },
      ribbon: { speaker: 'narrator', text: 'The ribbon you slipped in at the crown of the Spire is still there, a little damp. She didn’t take it out. She must have seen it, carrying him down. She left his place kept.', next: 'on' },
      take: { speaker: 'narrator', text: 'You close it on your finger and tuck a twist of paper in at page two hundred and six. It is a dull book about drainage. He was obviously enjoying it.', next: 'on' },
      leave: { speaker: 'narrator', text: 'You set it on the brass cap of the mile-clock, open at his page, and weigh it down with a stone. The little window turns over another hour beneath it.', next: 'on' },
      on: { speaker: 'narrator', text: 'Below you the sledge-tracks run on down the glacier, straight and deep, towards the White Gate. She has not stopped once.', next: null },
      plain: { speaker: 'narrator', text: 'A mile-clock on the Thaw Road, running a little fast.', next: null },
    },
  },
  {
    id: 'dialogue:area-rimecaller-thaw-road', name: 'I-9 banter: down the Thaw Road', bark: true,
    entries: [{ when: stage('quest:rimecaller-the-thaw-road', 'road'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Behind you, up on the glacier, every clock in Glacierhome is still striking. It is going to take them a while to strike thirty years.', next: null } },
  },

  // ======================= Side: the Longest Loaf (the Regent’s order)
  {
    id: 'dialogue:rimecaller-regent-rye', name: 'The Longest Loaf: the Regent’s order', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: SC, text: 'A loaf? From Mistress Dunn on the Stair? (She goes very still, the way the city is still.) Black rye.', next: 'rye' },
      rye: {
        speaker: SC, mood: 'sad', text: 'He likes it with the crust burned. He says it tastes of winter. I sent the footman down for it at half past eleven, because the doctor said he might take a little something, and…',
        choices: [
          { text: 'Who is it for, Regent?', to: 'who' },
          { text: 'Pomfrey says it’s nearly ready.', to: 'ready' },
        ],
      },
      who: { speaker: SC, text: 'For someone who isn’t hungry yet. Thank Mistress Dunn for me. Tell her to keep it rising. There is no hurry. There is never any hurry, in here.', next: 'end' },
      ready: { speaker: SC, mood: 'afraid', text: 'Nearly. No. Tell her not yet. Tell her to bank her fire. (A breath.) Forgive me. I find I don’t like things to be nearly.', next: 'end' },
      end: { speaker: SC, text: 'Run along, hour-walker. Gently.', effects: [{ setFlag: 'rimecaller.rye_told', value: true }], next: null },
    },
  },

  // ======================= Side: Mid-Step (the Enquiries Book, Greta’s letter to Wendel)
  {
    id: 'dialogue:obj-rimecaller-enquiries-book', name: 'Mid-Step: the Enquiries Book', scope: 'party',
    entries: [{ when: stage('quest:rimecaller-mid-step', 'enquiry'), node: 'book' }, { node: 'plain' }],
    nodes: {
      book: { speaker: 'narrator', text: 'The Archive’s Enquiries Book, where any citizen may ask the Archive anything and be answered, eventually. Enquiry 4,117, at 11.31, in a courier’s scrawl: “Do people marry glass-sellers?” Answer: “Yes. Frequently. See: most people.”', next: 'next' },
      next: { speaker: 'narrator', text: 'Enquiry 4,118, at 11.32, in a round hand: “Do people marry couriers?” Answer: “Yes, though couriers are seldom in.” In the margin between them the clerk has drawn a very small heart, and then, being an archivist, labelled it: HEART.', effects: [{ setFlag: 'rimecaller.enquiry_read', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The Enquiries Book, open on its lectern. Nine hundred years of people asking.', next: null },
    },
  },
  {
    id: 'dialogue:rimecaller-wendel-crossed', name: 'Mid-Step: Greta’s letter for Wendel', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: 'narrator', text: 'Wendel Fross, mid-stride on the Spire Stair, one foot in the air and his hand held out, empty now. You fold Greta’s letter into his fingers.',
        choices: [
          { text: '(Turn it so her writing faces him.)', to: 'face' },
          { text: '(Lean close and tell him what the Enquiries Book said.)', to: 'whisper' },
        ],
      },
      face: { speaker: 'narrator', text: 'The frost on his knuckles creaks. It might be the cold. It might be thirty years of a man trying very hard to close his hand.', next: 'end' },
      whisper: { speaker: 'narrator', text: '“She asked too. A minute after you.” Nothing moves. But on the step beneath his raised foot, very slowly, a crack runs through the ice, as if the step had decided to let him put it down.', next: 'end' },
      end: { speaker: WF, text: '(Wendel Fross, mid-stride, holding a letter out in front of him again. When the hour moves, the first thing he will feel is paper.)', next: null },
    },
  },

  // ======================= Side: the Weather Clerk (Halla witnesses the reading)
  {
    id: 'dialogue:rimecaller-halla-witness', name: 'The Weather Clerk: Halla witnesses the reading', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: HV, text: 'A page from the weather register. Torn out. Cornelius tore a page out of the register? (She sits down.) Is he ill? Has someone died?', next: 'read' },
      read: {
        speaker: 'narrator', text: 'You lay it on her desk: two degrees above freezing, and rising, in Cornelius’s very best hand, with the blot still drying.',
        choices: [
          { text: 'He needs a witness. Regulation forty-one.', to: 'reg' },
          { text: 'It’s the first new weather in thirty years.', to: 'new', trust: 1, trustNpc: HV },
        ],
      },
      reg: { speaker: HV, mood: 'happy', text: 'Regulation forty-one. I wrote regulation forty-one. I was twenty-six, and I thought nothing new should be allowed to happen without my say-so. I was insufferable. I am very pleased with her.', next: 'sign' },
      new: { speaker: HV, text: 'So it is. So it is. (She holds the page up to the window, as if it might be warm.) Two degrees. Do you know, I had forgotten that weather goes up.', next: 'sign' },
      sign: { speaker: 'narrator', text: 'She signs it, Witnessed, H. Vint. Then a footnote: “About time.” Then a footnote to the footnote: “Literally.” She blots all three with enormous care.', next: 'end' },
      end: { speaker: HV, text: 'Take it back to him before he faints. And tell him the Archivist-Superior says well done. No. Don’t. I’ll write it down, and he can read it. He’ll prefer that.', next: null },
    },
  },

  // ======================= Side: the Thirteenth Line (the founders’ minute)
  {
    id: 'dialogue:obj-rimecaller-founders-minute', name: 'The Thirteenth Line: the founders’ minute', scope: 'party',
    entries: [{ when: stage('quest:rimecaller-the-thirteenth-line', 'minute'), node: 'book' }, { node: 'plain' }],
    nodes: {
      book: { speaker: 'narrator', text: 'The founders’ minute-book, chained to a lectern so old the chain has worn a groove in it. The first meeting of the Archive of the Spire, C. 0. Eleven present. Apologies, one.', next: 'items' },
      items: {
        speaker: 'narrator', text: '“Item: that the Archive keep a copy of the Concord’s treaty. Carried. Item: that a line be ruled beneath the twelve, for the one who is not here. Carried. Item: that nobody ask who. Carried, with feeling.”',
        choices: [
          { text: '(Read the apologies.)', to: 'apologies' },
          { text: '(Close the book.)', to: 'close' },
        ],
      },
      apologies: { speaker: 'narrator', text: '“Apologies: from the twelfth member, who has gone to Concordia to sign, and sends word: Rule it straight. Leave room. Somebody may yet come.”', next: 'close' },
      close: { speaker: 'narrator', text: 'You close the minute-book. Mabyn will want every word of it, and then she will want to lie down.', effects: [{ setFlag: 'rimecaller.minute_read', value: true }, { unlockLore: 'lore:hc-rime-founders-minute' }], next: null },
      plain: { speaker: 'narrator', text: 'The founders’ minute-book, on its chain.', next: null },
    },
  },

  // ======================= Side: the Thief Who Never Got Away (Nim’s tin, the lost-property shelf)
  {
    id: 'dialogue:obj-rimecaller-nim-tin', name: 'The Thief: Nim’s tin', scope: 'party',
    entries: [{ when: stage('quest:rimecaller-the-thief-who-never-got-away', 'tin'), node: 'tin' }, { node: 'plain' }],
    nodes: {
      tin: {
        speaker: 'narrator', text: 'Under the ninth step, behind a loose stone, a toffee tin. Inside: a horn button, a blue ribbon, a door key labelled MUM’S, a tin soldier with no gun, an unopened love letter, and forty other small things nobody would give a farthing for.',
        choices: [
          { text: '(Read the love letter.)', to: 'letter' },
          { text: '(Close the tin.)', to: 'close' },
        ],
      },
      letter: { speaker: 'narrator', text: 'You get as far as “My dearest” and put it back. It isn’t yours. It isn’t Nim’s either. That, you suspect, is the whole point of the tin.', next: 'close' },
      close: { speaker: 'narrator', text: 'Not one thing in it was ever sold. He kept every one. Thirty years of other people’s keepsakes, and not one of his own.', effects: [{ setFlag: 'rimecaller.tin_found', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'A loose stone under the ninth step, with nothing behind it now.', next: null },
    },
  },
  {
    id: 'dialogue:rimecaller-osgar-tin', name: 'The Thief: the lost-property shelf', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: OR, mood: 'happy', text: 'Lost property? You’re handing in lost property? (He brightens like a lamp.) Nobody has handed anything in since C. 1012. I have a shelf. I have had an empty shelf for thirty years. Give it here.', next: 'look' },
      look: {
        speaker: 'narrator', text: 'He goes through the tin item by item, writing a ticket for each in a beautiful hand. “Button, horn, one. Ribbon, blue, one. Key, Mum’s, one.” He holds the tin soldier up to the light, and gives it a ticket of its own, and a salute.',
        choices: [
          { text: 'They’re Nim Larkspur’s. He stole them.', to: 'nim' },
          { text: 'Somebody found them.', to: 'found', trust: 1, trustNpc: OR },
        ],
      },
      nim: { speaker: OR, text: 'The Larkspur boy. Well, he’s handed them in, hasn’t he? Through you. That’s the rule of the shelf. Finders are keepers, unless they work for the Archive, in which case finders are filers.', next: 'end' },
      found: { speaker: OR, text: 'Then somebody found them, and that’s all the ticket needs to say. When the hour moves, folk will come looking. Folk always come looking, in the end.', next: 'end' },
      end: { speaker: OR, text: '(He sets the last ticket down and looks at his shelf for a long moment.) Not empty. Well. Bounties are still on the board, if you’re after work.', choices: more(offer('quest:rimecaller-bounty-sentry-seventeen', 'Sentry Seventeen?', 'sentry'), offer('quest:rimecaller-bounty-cistern-wraiths', 'The cistern wraiths.', 'wraiths', { questCompleted: 'quest:rimecaller-the-hold-gauges' })) },
      sentry: { speaker: OR, text: 'Arresting everyone on the Stair for loitering. Everyone on the Stair has been loitering for thirty years. It has arrested the lamplighter four times and me twice.', next: null },
      wraiths: { speaker: OR, text: 'Come up out of the cisterns since the melt went black. Six of them. The Archive pays in silver, after an inquiry. The inquiry is me.', next: null },
    },
  },

  // ======================= Side: the Thirty-Year Haggle (the lid)
  {
    id: 'dialogue:obj-rimecaller-sugar-lid', name: 'The Haggle: the sugar bowl’s lid', scope: 'party',
    entries: [{ when: stage('quest:rimecaller-the-thirty-year-haggle', 'lid'), node: 'boy' }, { node: 'plain' }],
    nodes: {
      boy: {
        speaker: 'narrator', text: 'Halfway down the Market Steps a small boy is frozen in the act of looking at the sky through something round and glass. It is the lid of a sugar bowl. He has been seeing the world through it, slightly blue, for thirty years.',
        choices: [
          { text: '(Swap it for a toffee from your pocket.)', to: 'swap' },
          { text: '(Ease it out of his fingers, gently.)', to: 'take' },
        ],
      },
      swap: { speaker: 'narrator', text: 'You tuck a toffee into his fist where the lid was. When the hour moves he will have lost a telescope and found a toffee, which at his age is a fair trade.', next: 'back' },
      take: { speaker: 'narrator', text: 'You ease the lid out of his fingers. His eye goes on looking at the sky, blue for a moment longer, and then just sky.', next: 'back' },
      back: { speaker: 'narrator', text: 'Back at the stall you set the lid on the bowl. It fits with a small, satisfied click. Two shillings and a farthing, with lid. Brannoc’s three fingers suddenly look a great deal more reasonable.', next: null },
      plain: { speaker: 'narrator', text: 'The Market Steps. A small boy, frozen, looking at the sky.', next: null },
    },
  },

  // ======================= Side: the Drip-Counters (the ice-pipe)
  {
    id: 'dialogue:obj-rimecaller-drip-pipe', name: 'The Drip-Counters: the old ice-pipe', scope: 'party',
    entries: [{ when: stage('quest:rimecaller-the-drip-counters', 'pipe'), node: 'pipe' }, { node: 'plain' }],
    nodes: {
      pipe: { speaker: 'narrator', text: 'The old ice-pipe climbs the stairwell wall from the Undercrypt towards the Hall, furred white. You put your ear to it. Inside, very faint, something drips: a long one, a short one, a long rest.', next: 'down' },
      down: {
        speaker: 'narrator', text: 'And it is coming down. From above, from the Hall and past the Hall, from somewhere high in the Spire. Not water finding its level. Something being sent.',
        effects: [{ setFlag: 'rimecaller.pipe_heard', value: true }],
        choices: [
          { text: '(Count, the way Gunnhild would.)', to: 'count' },
          { text: '(Take your ear away.)', to: null },
        ],
      },
      count: { speaker: 'narrator', text: 'Twelve a minute. Gunnhild once told you a sleeping man’s heart beats sixty. This one is barely beating at all, and it will not stop.', next: null },
      plain: { speaker: 'narrator', text: 'An old ice-pipe, furred white, running down the stairwell wall.', next: null },
    },
  },

  // ======================= Side: the Wraith Who Wanted Its Hat (telling Halla)
  {
    id: 'dialogue:rimecaller-halla-bertil', name: 'The Wraith’s Hat: telling Halla', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: HV, text: 'B. Hollin. (She takes your inky fingers and turns them to the lamp, as if the ink might say more.) Bertil. He had a laugh like a dropped tray. We used to hear it three floors down.', next: 'signed' },
      signed: {
        speaker: HV, mood: 'sad', text: 'I signed him out in the spring of the twentieth year. He was going to see his sister in the Wolfrun. I took his pin myself. He stepped out of the hour at the foot of the Undercrypt stairs, and I wrote “Departed, well” in the book.',
        choices: [
          { text: 'He came back for his hat.', to: 'hat' },
          { text: 'He didn’t suffer, Halla. He only wanted his hat.', to: 'suffer', trust: 1 },
        ],
      },
      hat: { speaker: HV, text: 'Of course he did. He never left the house without it. I used to tell him he would go back into a fire for that hat. (A breath.) He went back into a flood instead.', next: 'end' },
      suffer: { speaker: HV, text: 'No. No, I don’t suppose he did. (She opens her register, finds the line, crosses out “well”, and writes above it, very small: “with his hat”.) There. Accurate.', next: 'end' },
      end: { speaker: HV, text: 'Thank you. I should like to know, one day, whether his sister ever knew to stop waiting. That is not a thing the Archive can find out. It is the kind of thing people find out.', next: null },
    },
  },

  // ======================= Optional areas (Claude 2): finds round Glacierhome
  {
    id: 'dialogue:obj-rime-capital-ruin-find', name: 'Glacierhome ruin: the stone reading room', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'Among fallen pillars stands a lectern of black stone, with an empty chain hanging from it, the links rubbed bright. Carved across the front: NOTHING LOST. Scratched underneath, by somebody with a knife and a grievance: EXCEPT THE BOOK.', effects: [{ unlockLore: 'lore:hc-rime-capital-ruin' }], next: null } },
  },
  {
    id: 'dialogue:obj-rime-capital-cave-find', name: 'Glacierhome cave: the year-ice', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'At the back of the cave the glacier wall is banded like a felled tree, one pale stripe for every winter, back and back for a thousand years. The stripes stop at C. 1012. Above them lies a single band thirty years thick, perfectly clear, with nothing in it at all.', effects: [{ unlockLore: 'lore:hc-rime-capital-cave' }], next: null } },
  },
  {
    id: 'dialogue:obj-rime-capital-cave-codex', name: 'Glacierhome cave: a surveyor’s tin', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'A brass survey stake in the ice, and below it in the snow a tin that has fallen off its hook. Notes, years apart: “Glacier has not moved. Will measure again.” “Has not moved. Nor, I find, have I.” The last: “Leaving the stake. If it ever moves, it will knock this tin off. Hello.”', effects: [{ unlockLore: 'lore:hc-rime-capital-survey' }], next: null } },
  },
  {
    id: 'dialogue:obj-rime-capital-view-find', name: 'Glacierhome viewpoint: the lamplight bench', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'A bench on the lookout, where you can see every lamp on the Spire Stair at once. A brass plate on its back: “Given by S. and A. Cold, who sat here every evening of C. 1011 to watch the lamps lit. Please sit on the right. The left is his.”', effects: [{ unlockLore: 'lore:hc-rime-capital-view' }], next: null } },
  },
  // ======================= ACT II (wave 2 depth): C-1 the Remembering Slate
  {
    id: 'dialogue:obj-rimecaller-remembering-slate', name: 'C-1 the Remembering Slate', scope: 'party',
    entries: [{ when: stage('quest:rimecaller-wardenhold', 'slate'), node: 'slate' }, { node: 'plain' }],
    nodes: {
      slate: { speaker: 'narrator', text: 'A wall of black slate by the keep door, chalked from top to bottom in thirty years of hands. THE COLOSSUS WAS KIND. Under it, in different chalk: RUDE. Under that: KIND TO SOME. The Turning of C. 1000 had three bands, two bands, and “no band, it rained”.', next: 'mina' },
      mina: {
        speaker: MS, text: 'That’s ours. No archive, so we write it up, and then somebody rubs it out and writes it properly. Wrongly. (She sniffs.) I’ve rubbed out more of that wall than anyone alive.',
        choices: [
          { text: 'Who’s right about the Colossus?', to: 'right' },
          { text: 'Can I copy it? All of it, rubbings and all?', to: 'copy', trust: 1, effects: [{ setFlag: 'rimecaller.slate_copied', value: true }] },
        ],
      },
      right: { speaker: MS, text: 'All of us. None of us. Ingeborg was six when she saw it and I was nine. It was very large and it said something. That’s the part we agree on.', next: 'bendik' },
      copy: { speaker: MS, mood: 'happy', text: 'The rubbings too? Nobody ever wants the rubbings. (She looks at you a long while.) Go on, then. It’ll be the first time anybody’s kept us without correcting us.', next: 'bendik' },
      bendik: { speaker: 'narrator', text: 'In the bottom corner, in chalk that has been gone over every week for thirty years so that it never fades: BENDIK SNELL WENT UP WITH THE CART. BACK TUESDAY.', next: 'tuesday' },
      tuesday: {
        speaker: MS, mood: 'sad', text: 'My brother. He took the cart up over the pass on the morning of the Turning, apples for the Frostmere side, and the arches shut behind him. He said Tuesday. It’s been a great many Tuesdays.',
        choices: [
          { text: 'The people held on the pass road. You think he’s one of them.', to: 'held' },
          { text: 'And you’ve never gone up to look.', to: 'never' },
        ],
      },
      held: { speaker: MS, text: 'I know he is. I know it the way you know a tooth’s gone bad. (She chalks over TUESDAY again without looking at it.)', next: 'go' },
      never: { speaker: MS, text: 'Thirty years. I told myself I was waiting for him to come down. I was waiting for somebody to go up with me who could stand in a held hour and not be frightened of it.', next: 'go' },
      go: { speaker: MS, text: 'You can. You’re an hour-walker; I can see the pin. Take me up the pass road, Rimecaller. I’d like to see his face while I still remember it right.', effects: [{ setFlag: 'rimecaller.mina_asked', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The Remembering Slate by the keep door, chalked, rubbed out and chalked again.', next: null },
    },
  },

  // ======================= ACT II, C-2 The Held Pass: Mina on the held road
  {
    id: 'dialogue:rimecaller-mina-road', name: 'C-2 Mina finds her brother on the held road', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'On the held road, under thirty years of snow: a cart, a mule with one hoof lifted, and a broad young man in a red scarf with his hand up in a wave. He is waving down the pass, at Wardenhold. At whoever was watching him go.', next: 'mina' },
      mina: {
        speaker: MS, text: 'That’s him. That’s Bendik. (Her voice is quite steady.) He’s younger than my grandson. I remembered him older. I’ve been remembering him getting older all this time, and he didn’t.',
        choices: [
          { text: 'He’s waving at you.', to: 'wave', trust: 1 },
          { text: '(Read the frost on him.)', to: 'frost', school: 'rime' },
        ],
      },
      wave: { speaker: MS, text: 'Is he? (She turns and looks down the road at Wardenhold, small and far below.) I was on the keep wall. I waved back. I’d forgotten that. I’d remembered that I didn’t.', next: 'scarf' },
      frost: { speaker: 'narrator', text: 'The frost on him is laid like a road, not squeezed like a minute. The pass itself is holding him, patiently, the way a hand holds a door for somebody who is late. Whatever holds this road is waiting for something to come up it.', next: 'scarf' },
      scarf: { speaker: MS, mood: 'happy', text: 'The scarf. I knitted that. I dropped a stitch in the third row and he said nobody would ever notice. (She leans close.) There. Third row. I was right.', next: 'ask' },
      ask: {
        speaker: MS, text: 'Will he wake? If you go up there and stop whatever’s holding the road. Will he finish waving, and come down?',
        choices: [
          { text: 'He’ll finish the wave. I can’t promise he’ll come down.', to: 'honest' },
          { text: 'I don’t know.', to: 'honest' },
        ],
      },
      honest: { speaker: MS, text: 'No. No, he’ll go on over. He always finished what he started; it was the most annoying thing about him. Apples for the Frostmere side.', next: 'stay' },
      stay: { speaker: MS, text: 'I’ll stay here with him. I waited thirty years at the bottom; I can wait a few days at the top. Go and read the others. And hour-walker? Mind the girl with the snowball. She has a good arm.', next: null },
    },
  },

  // ======================= ACT II, C-3 The Rimeheart Colossus: telling Mina
  {
    id: 'dialogue:rimecaller-mina-colossus', name: 'C-3 Mina hears what held the pass', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'Mina is sitting on the held road where the cart was. There is no cart. There are wheel-ruts in fresh snow going up and over the pass, and a mule’s hoofprints, and one set of boots.', next: 'mina' },
      mina: {
        speaker: MS, mood: 'happy', text: 'He finished the wave. Then he looked at his hand as if he didn’t know why he’d been waving, clicked to the mule, and went on. He didn’t look back. (She is smiling.) Tell me why. What was holding him?',
        choices: [
          { text: 'The Colossus. It held the pass open for the crown’s road, and when the crown stopped coming it held it shut.', to: 'held' },
          { text: 'Something that didn’t know what else to hold.', to: 'held', trust: 1 },
        ],
      },
      held: {
        speaker: MS, text: 'Didn’t know what else to hold. (She laughs, and it cracks in the middle.) That’s Wardenhold all over. That’s the slate.',
        choices: [
          { text: 'You could let the slate go now. Write one thing on it, and leave it.', to: 'let', effects: [{ setFlag: 'rimecaller.mina_slate', value: 'let' }] },
          { text: 'Keep the slate. Only stop rubbing things out.', to: 'keep', effects: [{ setFlag: 'rimecaller.mina_slate', value: 'keep' }] },
        ],
      },
      let: { speaker: MS, text: 'One thing. (She thinks about it for a long time.) BENDIK WENT OVER THE PASS. No Tuesday. Just that.', next: 'end' },
      keep: { speaker: MS, text: 'Stop rubbing out? (She looks horrified, then thoughtful.) Ingeborg will have to live with “rude”, then. Well. She’s lived with worse.', next: 'end' },
      end: { speaker: MS, text: 'Go on. There’s a Regent somewhere still holding her own hour, isn’t there? I can see it on you. Go and tell her how this one ended.', next: null },
    },
  },

  // ======================= ACT II, C-4 The Regent’s Lanterns: the trail through Lanternford
  ...[
    'Sledge-runners in the mud of the Lanternford road, and frost along both of them, a finger wide, in a marsh where nothing has frozen in living memory. Rime frost. Held frost. It hasn’t melted because it isn’t allowed to.',
    'At the Bog Market, a chandler’s chit pinned to the post where the stallholders keep their oddest sales: lamp-oil, forty measures, paid in Glacierhome silver. Under “Name” a neat hand has written only: For Anselm. Not to be put out.',
    'A held light dropped back on the jetty, with a paper tied to it in the same careful hand: “Too warm. Wrong evening. Return.” Inside it, very small, a stranger’s birthday, held mid-candle, everyone laughing.',
  ].map((text, i): DialogueDef => clue(`rimecaller-sledge-trail-${i + 1}`, `C-4 the Regent’s trail (${i + 1})`, stage('quest:rimecaller-the-regents-lanterns', 'trail'),
    text, `rimecaller.sledge_${i + 1}`, 'Mud, reeds, and the smell of the marsh.', i === 2 ? 'She is choosing them. She is buying other people’s held moments for how well they keep still, and sending back the ones that are too happy.' : undefined)),

  // ======================= ACT II, C-5 The Lantern Queen: the half-built lantern
  clue('rimecaller-regent-lantern', 'C-5 the Regent’s lantern', stage('quest:rimecaller-the-lantern-queen', 'lantern'),
    'In the middle of the Queen’s hoard: a lantern-frame of Glacierhome silver, taller than you, with forty held lights wired into it in rings. The middle is empty, and the empty space is exactly the shape of a man in a good chair.', 'rimecaller.regent_lantern',
    'A silver lantern-frame, its lights all gone out.', 'On the frame, engraved small, in the Regent’s hand: “So that it never has to be the next minute.” She had nearly finished.'),

  // ======================= ACT II, C-6 Halla’s Footnotes: the reply
  {
    id: 'dialogue:obj-rimecaller-arch-reply', name: 'C-6 a footnote for Halla', scope: 'party',
    entries: [{ when: stage('quest:rimecaller-halla-writes', 'reply'), node: 'ice' }, { node: 'plain' }],
    nodes: {
      ice: { speaker: 'narrator', text: 'The foot of the Rime arch, where Halla’s envelope was wedged in the ice. There is a crack in it the width of a letter. Whatever you leave here, somebody north of the arch will find.', next: 'write' },
      write: {
        speaker: 'narrator', text: 'You have the back of page fourteen and an Archive pencil. The Archive answers in footnotes. What is yours?',
        choices: [
          { text: '“¹ The held pass is walking again. Mina Snell’s brother went over it, waving. Noted.”', to: 'sent', effects: [{ setFlag: 'rimecaller.reply', value: 'pass' }] },
          { text: '“¹ I am proud of you too. I have also run out of accurate ways to say so.”', to: 'sent', effects: [{ setFlag: 'rimecaller.reply', value: 'proud' }, { trust: HV, delta: 1 }] },
          { text: '“¹ Itemised overleaf: one (1) new thing. Coming home when it is done.”', to: 'sent', effects: [{ setFlag: 'rimecaller.reply', value: 'home' }] },
          { text: '“¹ The Regent built a lantern so it would never be the next minute. I don’t think it works.”', to: 'sent', when: { flag: 'rimecaller.regent_lantern' }, effects: [{ setFlag: 'rimecaller.reply', value: 'lantern' }] },
        ],
      },
      sent: { speaker: 'narrator', text: 'You fold it small and push it into the crack. The ice takes it, the way it took thirty years of nothing, and somewhere far beyond the arch, very faintly, a drawer marked NEW is pulled open.', next: null },
      plain: { speaker: 'narrator', text: 'The foot of the Rime arch, and a crack in the ice the width of a letter.', next: null },
    },
  },

  // ======================= ACT III, Halla’s First New Entry: the reading, the new thing
  {
    id: 'dialogue:obj-rimecaller-heart-reading', name: 'Halla’s First New Entry: the temperature in the Heart', scope: 'party',
    entries: [{ when: stage('quest:rimecaller-hallas-first-new-entry', 'reading'), node: 'hang' }, { node: 'plain' }],
    nodes: {
      hang: { speaker: 'narrator', text: 'You find a lee behind a supply cart, out of the wind, and hang Archive Thermometer No. 3 from a nail, the regulation way. The mercury goes down, and up, and down, never settling, like something breathing.', next: 'note' },
      note: {
        speaker: 'narrator', text: 'Halla will want it to the tenth of a degree. The mercury will not give you a tenth of anything.',
        choices: [
          { text: '(Record it precisely: “Cold. Variable. Mercury will not settle.”)', to: 'done', effects: [{ setFlag: 'rimecaller.heart_reading', value: 'precise' }] },
          { text: '(Record it honestly: “Cold, and moving.”)', to: 'done', effects: [{ setFlag: 'rimecaller.heart_reading', value: 'honest' }] },
        ],
      },
      done: { speaker: 'narrator', mood: 'happy', text: 'Halla’s slip has a footnote for this, of course. “If the mercury will not settle, record that it will not settle. That is also a temperature.”', next: null },
      plain: { speaker: 'narrator', text: 'A lee behind a supply cart, and a nail in the boards at thermometer height.', next: null },
    },
  },
  {
    id: 'dialogue:obj-rimecaller-heart-snowdrop', name: 'Halla’s First New Entry: one new thing', scope: 'party',
    entries: [{ when: stage('quest:rimecaller-hallas-first-new-entry', 'find'), node: 'find' }, { node: 'plain' }],
    nodes: {
      find: { speaker: 'narrator', text: 'In the trodden dust behind the Legion camp, where nothing has grown in thirty years: a snowdrop. One. Its seed must have come all the way from Frostmere on somebody’s boot. You look at your boots.', next: 'flower' },
      flower: {
        speaker: 'narrator', text: 'It is new. It is the first new thing in the Heart since the Hollowing, and it is very small, and that seems right.',
        choices: [
          { text: '(Leave it where it is.)', to: 'leave', effects: [{ setFlag: 'rimecaller.snowdrop', value: 'left' }] },
          { text: '(Press one petal for Halla’s drawer.)', to: 'press', effects: [{ setFlag: 'rimecaller.snowdrop', value: 'pressed' }] },
        ],
      },
      leave: { speaker: 'narrator', text: 'You step round it. Two hollowed soldiers, passing, step round it too, without seeming to know why.', next: null },
      press: { speaker: 'narrator', text: 'You take one petal, the outside one, and press it flat in the Archive book. The snowdrop doesn’t seem to mind. It has others.', next: null },
      plain: { speaker: 'narrator', text: 'A snowdrop in the dust behind the Legion camp.', next: null },
    },
  },

  // ======================= ACT III, Anselm: the ring of listeners, the cup
  {
    id: 'dialogue:rimecaller-anselm-ringed', name: 'Anselm: beyond the ring',
    entries: [{ node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: '(Anselm is breathing out, somewhere beyond the ring of hollowed. You can’t get near him yet.)', next: null } },
  },
  {
    id: 'dialogue:obj-rimecaller-anselm-ring', name: 'Anselm: what the hollowed are listening to', scope: 'party',
    entries: [{ when: stage('quest:rimecaller-anselm', 'ring'), node: 'ring' }, { node: 'plain' }],
    nodes: {
      ring: { speaker: 'narrator', text: 'The hollowed stand shoulder to shoulder round Anselm’s chair, so close that you would have to push. Nobody is pushing. They have their heads on one side, all of them, the way people listen to music through a wall.', next: 'hum' },
      hum: {
        speaker: 'narrator', text: 'You listen too. Inside the held hour, very faint, Anselm is humming. One note. He must have been humming when the hour was held, the way he always hummed when he read, and the note has been held with him for thirty years.',
        choices: [{ text: '(Listen longer.)', to: 'bell' }, { text: '(Read the hold.)', to: 'bell', school: 'rime' }],
      },
      bell: { speaker: 'narrator', mood: 'sad', text: 'It is the note of the Herald’s ice bell: the one note Seraphine rang and would not let end. She was never ringing a bell at all. She was holding him, humming.', effects: [{ setFlag: 'rimecaller.anselm_hum', value: true }], next: 'part' },
      part: { speaker: 'narrator', text: 'One by one, as if you had asked them, the hollowed step back and leave a gap just wide enough for you.', next: null },
      plain: { speaker: 'narrator', text: 'The ring of hollowed round Anselm’s chair, with a gap in it just wide enough for one.', next: null },
    },
  },
  {
    id: 'dialogue:obj-rimecaller-anselm-cup', name: 'Anselm: the cup', scope: 'party',
    entries: [
      { when: { all: [stage('quest:rimecaller-anselm', 'cup'), { flag: 'rimecaller.nemesis_fate', op: '==', value: 'spared' }] }, node: 'seraphine' },
      { when: stage('quest:rimecaller-anselm', 'cup'), node: 'cup' },
      { node: 'plain' },
    ],
    nodes: {
      cup: {
        speaker: 'narrator', text: 'Anselm’s cup, on the table by the empty chair. Thirty years hot. Now it is lukewarm, with a skin on the tea, and it is the most ordinary thing in the Heart.',
        choices: [
          { text: '(Drink it. Somebody should.)', to: 'drink', effects: [{ setFlag: 'rimecaller.anselm_cup', value: 'drunk' }] },
          { text: '(Pour it out on the ground, the way you finish a toast.)', to: 'pour', effects: [{ setFlag: 'rimecaller.anselm_cup', value: 'poured' }] },
          { text: '(Wrap the cup for Halla’s drawer: OLD, and FINISHED.)', to: 'wrap', effects: [{ setFlag: 'rimecaller.anselm_cup', value: 'kept' }] },
        ],
      },
      drink: { speaker: 'narrator', mood: 'happy', text: 'It is stewed and cold and far too sweet. He took three sugars. Nobody in the Archive will ever know that unless you write it down, so you do.', next: null },
      pour: { speaker: 'narrator', text: 'The tea goes into the dust, and the dust drinks it, and for a moment the ground of the Heart smells of a sitting room in Glacierhome on a winter evening.', next: null },
      wrap: { speaker: 'narrator', text: 'You wrap the chipped cup in your scarf. Halla will want to know where the chip came from. You will tell her you don’t know, and she will write that down as well.', next: null },
      seraphine: { speaker: 'narrator', text: 'Anselm’s cup, on the table by the empty chair, going cold. Seraphine is looking at it as if it might bite.', next: 'ser' },
      ser: {
        speaker: SC, mood: 'sad', text: 'Thirty years I kept that cup hot. I can’t touch it now. If I touch it and it’s cold, then it’s true.',
        choices: [
          { text: '(Hand it to her.)', to: 'hand', effects: [{ setFlag: 'rimecaller.anselm_cup', value: 'given' }] },
          { text: '(Drink it with her, half each.)', to: 'half', effects: [{ setFlag: 'rimecaller.anselm_cup', value: 'shared' }] },
        ],
      },
      hand: { speaker: SC, mood: 'sad', text: '(She takes it in both hands. It is cold. She holds it anyway, the way you hold a thing, not the way you hold an hour.) Cold. Well. So it is.', next: null },
      half: { speaker: SC, text: '(She drinks her half and makes a face.) Three sugars. He always took three. It was disgusting. (She laughs, and puts the cup down, and leaves it there.)', next: null },
      plain: { speaker: 'narrator', text: 'An empty chair, and a cold cup on the table beside it.', next: null },
    },
  },

  // ======================= ACT III, The Still One: the gazers
  {
    id: 'dialogue:obj-rimecaller-still-gazers', name: 'The Still One: the gazers', scope: 'party',
    entries: [
      { when: stage('quest:rimecaller-the-still-one', 'gazers'), node: 'gaze' },
      { when: { all: [stage('quest:rimecaller-the-still-one', 'faces'), { flag: 'rimecaller.still_one', op: '==', value: 'kept' }] }, node: 'kept' },
      { when: stage('quest:rimecaller-the-still-one', 'faces'), node: 'shattered' },
      { node: 'plain' },
    ],
    nodes: {
      gaze: { speaker: 'narrator', text: 'You look over the shoulder of a hollowed pikeman at the shard. Your face isn’t in it, for him. His is: young, sunburnt, laughing at something, on the last morning before the Bell.', next: 'all' },
      all: {
        speaker: 'narrator', text: 'Every one of them sees their own face in it as it was before the tears. That is why they stand so still. It is the only place left where they can see it.', effects: [{ setFlag: 'rimecaller.gazers_seen', value: true }],
        choices: [{ text: '(Push through to the shard.)', to: null }, { text: '(Read the shard’s hold.)', to: 'read', school: 'rime' }],
      },
      read: { speaker: 'narrator', mood: 'sad', text: 'It isn’t holding them. It is holding their faces, one each, as they were, and letting them look. It is the kindest held thing you have ever seen, and you know already that it has to go.', next: null },
      shattered: { speaker: 'narrator', text: 'The hollowed are still standing where the shard stood, looking down at ten thousand pieces. The pikeman bends, picks one up and looks into it. His face, now: grey, wet, old. He looks at it for a long time.', next: 'pike' },
      pike: { speaker: 'narrator', mood: 'happy', text: 'Then he laughs, a cracked, surprised sound, and wipes his eyes with the back of his hand, and what comes away is only water.', effects: [{ setFlag: 'rimecaller.gazers', value: 'woke' }], next: null },
      kept: { speaker: 'narrator', text: 'The hollowed are still standing where the shard stood, looking at nothing. You open the Archive book and read them what you wrote, slowly: a face, held, in every detail. They listen the way Glacierhome children listen to stories.', next: 'kept2' },
      kept2: { speaker: 'narrator', text: 'At the end the pikeman nods, as if you had described someone he used to know, and sits down in the dust. The others sit down round him.', effects: [{ setFlag: 'rimecaller.gazers', value: 'listened' }], next: null },
      plain: { speaker: 'narrator', text: 'A patch of trodden dust in the Legion camp, where a crowd stood looking at something.', next: null },
    },
  },
];

export default dialogues;
