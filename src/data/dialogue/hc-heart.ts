/**
 * Hollow Crown, Act III shared dialogues: the Heart of Morvane, the Hollow King, the four endings and the
 * epilogue (05-campaign-framework.md §Act III, §Endings). Class-dependent parts are generated from the campaign
 * table and the outlines' endings tables (src/narrative/engine/epilogues.gen.ts). Owner: Claude 4.
 */
import type { DialogueChoice, DialogueDef, DialogueNode, NarrativeCondition } from '@/core';
import { CAMPAIGNS, SCHOOL_NAME, campaign } from '@/narrative/engine/classes';
import { CLASS_EPILOGUES, type EndingId } from '@/narrative/engine/epilogues.gen';

const CA = 'npc:casimir' as const;
const stage = (q: `quest:${string}`, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const ENDING = (e: EndingId): NarrativeCondition => ({ flag: 'story.ending', value: e });

/** the 24 lines to the King (06-outlines "III-6"), one per class */
const KING_LINES: Record<string, string> = {
  arcanist: 'You put out the fire of the world to see if it would warm you.',
  reaver: 'You started a war with grief, and grief doesn’t tire.',
  rimecaller: 'You held the crown so long you forgot it was meant to be passed.',
  warden: 'A wall’s for the ones behind it. You built yours round yourself.',
  sparkwright: 'You couldn’t make it sing, so you took it apart to see why.',
  stormlancer: 'You went first, Casimir. Nobody followed. That isn’t the same as brave.',
  cantor: 'Nobody let you grieve in the dark, did they? So you wept on all of us.',
  oathbound: 'You took an oath that wasn’t yours to take. Give it back.',
  duskweaver: 'You can’t remember a song you never heard. That isn’t memory. It’s longing.',
  shade: 'You’ve no shadow either. You stood in the light so long you thought it was the same as being seen.',
  hedgewitch: 'You wept so long the world grew round you. That isn’t life. It’s a wound that won’t close.',
  ranger: 'You let a whole world rot to feed one hunger, and you’re still hungry.',
  swordsman: 'Every fight you couldn’t win, you just kept fighting. Yield, Casimir. It’s allowed.',
  samurai: 'A crown is a sheath. You drew the whole world and never put it away.',
  knight: 'She gave you the crown because she thought you couldn’t want it. You’ve spent thirty years proving her wrong.',
  juggernaut: 'You had the strength of twelve schools in your hands, and you never once asked what it was for.',
  monk: 'Nobody owed you the Chord. That’s why it would have been a gift.',
  brawler: 'Thirty years with nobody in your corner. That isn’t strength. That’s just lonely.',
  huntsman: 'The old law says take only what the hunt gives. You took the crown, and it never gave you anything.',
  falconer: 'You hooded the whole world so you wouldn’t have to hear it. It’s still singing under there.',
  jester: 'Nobody ever told you the truth to your face. Someone should have paid a fool.',
  corsair: 'Half of Tidecourt got rich off your crying. I’m sorry. I don’t say that for free.',
  bard: 'A song you hear once is enough, if you’re listening.',
  skald: 'Ulf knew every saga, and none of them had his name in. Yours neither. Stop weeping long enough and I’ll drum it.',
};
/** A campaign's earned line replaces its plain one when the condition holds (the Bard's lullaby, the Skald's spared nemesis). */
const KING_VARIANTS: Record<string, { when: NarrativeCondition; text: string }> = {
  bard: { when: { flag: 'bard.lullaby_played' }, text: 'Someone sang you to sleep once. I’ve brought the song.' },
  skald: { when: { flag: 'skald.nemesis_fate', op: '==', value: 'spared' }, text: 'Ulf got his voice back. It doesn’t ring. Yours won’t either. Use it anyway.' },
};
function kingLine(id: string, school: DialogueChoice['school']): DialogueChoice[] {
  const v = KING_VARIANTS[id];
  const plain: DialogueChoice = { text: KING_LINES[id], to: 'heard', school, when: v ? { all: [{ partyHasClass: id }, { not: v.when }] } : { partyHasClass: id } };
  return v ? [{ text: v.text, to: 'heard', school, when: { all: [{ partyHasClass: id }, v.when] } }, plain] : [plain];
}

/** III-2: the bearer each campaign frees from the Legion's cages (distinct from the sibling, featured and own school) */
function freedBearer(cls: string): string {
  const c = campaign(cls)!;
  const i = CAMPAIGNS.findIndex((x) => x.id === cls);
  for (let k = 1; k < CAMPAIGNS.length; k++) {
    const x = CAMPAIGNS[(i + k * 5) % CAMPAIGNS.length];
    if (x.id !== c.sibling && x.school !== c.school && !c.featured.includes(x.id)) return x.id;
  }
  return c.sibling;
}

const WHO_RANG_CLUES: NarrativeCondition = {
  any: ['thirteenth_pitch', 'morwen_out_of_turn', 'pip_unsung', 'thirteenth_star', 'spinner_thread', 'last_page'].map((k) => ({ insight: k })),
};

const dialogues: DialogueDef[] = [
  // ---------- III-1 The Weeping Wall
  {
    id: 'dialogue:heart-sela', name: 'III-1 Sela at the Heart camp', scope: 'party',
    entries: [{ when: { flag: 'cc.waystone_heart' }, node: 'heard' }, { node: 'start' }],
    nodes: {
      start: { speaker: 'npc:sela', text: 'Look at it. Thirty years I’ve walked round that wall, and it’s standing open like a door somebody forgot to shut. The old waystone at the edge still knows me.', next: 'stone' },
      // Claude 5's cc-waystones side (Act II): one stone answered from the Heart, where no waystone was mapped
      heard: { speaker: 'npc:sela', text: 'Look at it, standing open like a door somebody forgot to shut. And there’s the stone that answered us from the wrong side, that night in Brindlecross. It wasn’t wrong. It was waiting for somebody to ask.', next: 'stone' },
      stone: {
        speaker: 'npc:sela', text: 'I’ll wake it. It’ll hold the way open long enough for the bearers to get through, and not one minute more. My compass has finally stopped pointing. We’re here.',
        choices: [{ text: 'Wake it.', to: null, quest: true, effects: [{ setFlag: 'story.heart_waystone', value: true }] }, { text: 'Come with us.', to: 'no' }],
      },
      no: { speaker: 'npc:sela', text: 'Somebody has to hold the waystone open for you to come back through. Go on.', effects: [{ setFlag: 'story.heart_waystone', value: true }], next: null },
    },
  },
  // ---------- III-2 The Legion Camp: the cages (one freed bearer per campaign)
  {
    id: 'dialogue:obj-legion-cages', name: 'III-2 the Legion’s cages', scope: 'party',
    entries: [
      ...CAMPAIGNS.map((c) => ({ when: { all: [{ heroClass: c.id }, stage('quest:heart-legion', 'cages')] }, node: c.id })),
      { node: 'open' },
    ],
    nodes: {
      open: { speaker: 'narrator', text: 'Empty cages of black iron, their doors standing open.', next: null },
      ...Object.fromEntries(CAMPAIGNS.map((c) => {
        const freed = campaign(freedBearer(c.id))!;
        const node: DialogueNode = {
          speaker: 'narrator',
          text: `The cage doors melt at your half-stone’s touch. The people inside are thin and grey and not quite hollow. One of them sits up and stares at you: ${freed.bearer}, the ${freed.name} bearer, taken on the road from the Stone Court.`,
          effects: [{ setFlag: `story.bearer.${freed.id}`, value: true }],
          next: 'thanks',
        };
        return [c.id, node];
      })),
      thanks: { speaker: 'narrator', text: 'The freed bearers get to their feet, and fall in behind you. Nobody says anything. Nobody needs to.', next: null },
    },
  },
  // ---------- III-2 side: Maren's Mother
  {
    id: 'dialogue:heart-ottilie', name: 'Maren’s Mother: Ottilie Hollis', scope: 'party',
    entries: [{ when: stage('quest:heart-marens-mother', 'find'), node: 'find' }, { node: 'later' }],
    nodes: {
      find: {
        speaker: 'npc:ottilie-hollis', mood: 'hollow', text: 'I came to give it back. The stone. I came to give it back, and he said thank you, and then I was standing here. How long have I been standing here?',
        choices: [{ text: 'Thirty years. Maren sent me. Your daughter.', to: 'maren', trust: 1 }, { text: 'Too long. Come with me.', to: 'come' }],
      },
      maren: { speaker: 'npc:ottilie-hollis', mood: 'sad', text: 'Maren. She was nine. (Her face crumples.) She has my nose, poor thing. Take me to her.', next: null },
      come: { speaker: 'npc:ottilie-hollis', text: 'Yes. Yes. My legs have forgotten how. Go slowly.', next: null },
      later: { speaker: 'npc:ottilie-hollis', text: 'I keep wanting to stand in a line. I don’t have to, do I? No. I don’t.', next: null },
    },
  },
  {
    id: 'dialogue:heart-maren-mother', name: 'Maren’s Mother: home', scope: 'party',
    entries: [{ node: 'meet' }],
    nodes: {
      meet: { speaker: 'npc:maren', mood: 'sad', text: '(She sees the woman behind you, and her bow drops out of her hand.) Mam?', next: 'hold' },
      hold: { speaker: 'narrator', text: 'Ottilie Hollis puts her arms round her daughter, and for a long time neither of them is anything but that.', next: 'thanks' },
      thanks: { speaker: 'npc:maren', text: 'I don’t have words for this. I’m a tracker. I don’t need words. (She looks at you.) Anything. Ever. You only have to ask.', effects: [{ trust: 'npc:maren', set: 5 }], next: null },
    },
  },
  // ---------- III-2 side: What Godric Saw
  {
    id: 'dialogue:heart-godric', name: 'What Godric Saw', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:godric', text: 'Sit. I am going to tell you something I have told nobody in thirty years, and I would rather do it before I lose my nerve.', next: 'door' },
      door: { speaker: 'npc:godric', text: 'I was nineteen. I stood at the throne-room door with the Iron knights on the night of the Turning. Ser Gideon carried the crown in. The steward was to pass it to the Fist champion at dawn.', next: 'saw' },
      saw: {
        speaker: 'npc:godric', mood: 'sad', text: 'He was crying before he ever touched it. Not the black. Just tears. He held it up to his ear, like a shell, for a long time. Then he put it on. And when it was silent, he started to scream.',
        choices: [{ text: 'He only wanted to hear it.', to: 'hear', insight: 'godric_saw' }, { text: 'Why didn’t you stop him?', to: 'stop' }],
      },
      stop: { speaker: 'npc:godric', text: 'Because I was sorry for him. That is the whole of my crime, and I have carried it thirty years. He only wanted to hear it, I think.', effects: [{ insight: 'godric_saw' }], next: null },
      hear: { speaker: 'npc:godric', text: 'Yes. I think that was all he ever wanted. Remember it, when you’re standing in front of him.', next: null },
    },
  },
  // ---------- III-2 side: The Last Chronicle
  {
    id: 'dialogue:obj-heart-bell-log', name: 'The Last Chronicle: the bell-ringer’s log', scope: 'party',
    entries: [{ when: stage('quest:heart-last-chronicle', 'log'), node: 'log' }, { node: 'done' }],
    nodes: {
      log: { speaker: 'narrator', text: 'The Citadel chapel’s bell-ringer’s log, a thousand years of Turnings in a thousand hands. The last page is new. It is written in no school’s hand at all, in an ink that looks like dried tears.', next: null },
      done: { speaker: 'narrator', text: 'The empty lectern where the log lay.', next: null },
    },
  },
  {
    id: 'dialogue:heart-pip', name: 'The Last Chronicle: Pip reads', scope: 'party',
    entries: [{ node: 'read' }],
    nodes: {
      read: { speaker: 'npc:pip', text: 'Everybody else sees squiggles? I can read it fine. It’s easy if you can’t hear the stones, I think. It says…', next: 'page' },
      page: {
        speaker: 'npc:pip', mood: 'sad', text: '“I rang it. Thirty years I have tried to make them come home to me. Tonight I stopped trying, and rang the Bell, and let them choose. Let them come or not. C.”',
        choices: [{ text: 'He rang the Bell himself.', to: 'why', insight: 'who_rang', effects: [{ insight: 'last_page' }] }],
      },
      why: { speaker: 'npc:pip', text: 'He’s like me, isn’t he? He can’t hear it either. I listen harder. Maybe nobody told him you could just listen harder.', effects: [{ insight: 'pip_unsung' }], next: null },
    },
  },
  {
    id: 'dialogue:heart-ysolde', name: 'The Last Chronicle: Ysolde', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'npc:ysolde', text: 'He rang it. He let the stones choose. I have read every book in Brindlecross, and not one of them imagined the Hollow King asking.', next: 'note' },
      note: {
        speaker: 'npc:ysolde', text: 'And Pip read the page that none of us could. There have always been Unsung. Concordia never had a school. What if they were never missing a note? What if they are the rest between the notes?',
        choices: [{ text: 'The thirteenth note.', to: 'end', insight: 'thirteenth_note' }, { text: 'Write it down, Ysolde.', to: 'end' }],
      },
      end: { speaker: 'npc:ysolde', text: 'I am writing it down. I have never been so glad to be wrong about everything.', next: null },
    },
  },
  // ---------- III-3 The Twelve Stairs
  ...CAMPAIGNS.filter((c, i, all) => all.findIndex((x) => x.school === c.school) === i).map((c): DialogueDef => ({
    id: `dialogue:obj-heart-stair-${c.school}`, name: `III-3 the ${SCHOOL_NAME[c.school]} stair`, scope: 'party',
    entries: [
      { when: { all: [{ heroSchool: c.school }, stage('quest:heart-stairs', 'stair')] }, node: 'own' },
      { node: 'other' },
    ],
    nodes: {
      own: {
        speaker: 'narrator',
        text: `The ${SCHOOL_NAME[c.school]} stair, hung with your school’s banner, rotted black. As you climb, the black runs out of it step by step, and the colour underneath is the one it was a thousand years ago.`,
        next: 'climb',
      },
      climb: {
        speaker: 'narrator',
        text: `Halfway up, one step is worn hollow in the middle, where every ${SCHOOL_NAME[c.school]} bearer for a thousand years has stopped to get their breath. You stop there too. Below you the camp fires are very small.`,
        choices: [
          { text: 'Look across at the others.', to: 'others' },
          { text: 'Think of {mentor}.', to: 'mentor' },
          { text: 'Keep climbing.', to: 'top' },
        ],
      },
      others: { speaker: 'narrator', text: 'On the other stairs the other bearers are climbing, each under their own colour, each at their own pace. Nobody is racing. Somebody a long way off is singing under their breath.', next: 'top' },
      mentor: { speaker: 'narrator', text: 'You think of {mentor}, and of what they would say if they could see you on this step. The half-stone in your pack hums once, as if it remembers them too.', next: 'top' },
      top: {
        speaker: 'narrator', text: 'By the top the banner is whole. Your half-stone is singing so loudly the other bearers turn to look.',
        effects: [{ setFlag: 'story.own_stair', value: true }], next: null,
      },
      other: { speaker: 'narrator', text: `The ${SCHOOL_NAME[c.school]} stair, its banner hanging black. This one is not yours to climb.`, next: null },
    },
  })),
  // ---------- III-5 The Citadel
  {
    id: 'dialogue:obj-citadel-throne-door', name: 'III-5 the throne-room door', scope: 'party',
    entries: [{ when: { insight: 'godric_saw' }, node: 'godric' }, { node: 'door' }],
    nodes: {
      godric: { speaker: 'narrator', text: 'The throne-room door. A young guard once stood exactly here, and watched a man weep before he ever touched a crown. You push it open.', next: 'inside' },
      door: { speaker: 'narrator', text: 'The throne-room door, tall as a house, carved with all twelve schools’ marks. It opens at a touch.', next: 'inside' },
      inside: { speaker: 'narrator', text: 'Inside, the empty crown hangs above the throne in a cage of its own black tears. Under it sits a man in grey, and between you and him something vast unfolds out of the settings of the crown.', next: null },
    },
  },
  // ---------- III-6 The Hollow King (after the fight)
  {
    id: 'dialogue:heart-king', name: 'III-6 the Hollow King speaks', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: CA, mood: 'sad', text: 'You came. You all came. Twenty-four of you, with the stones singing in you, and I still cannot hear a note. I am sorry. I have been sorry for thirty years. It has not helped.',
        choices: [
          { text: 'Why did you do it?', to: 'why' },
          { text: '(Say what you came here to say.)', to: 'say' },
          { text: 'You rang the Bell.', to: 'rang', insight: 'who_rang', when: WHO_RANG_CLUES },
        ],
      },
      why: { speaker: CA, text: 'Every child in Concordia hears something. I heard nothing. They taught me every school, and I heard nothing. I thought, if I held the crown, if all twelve sang at once, close enough, I would hear it. Just once.', next: 'tears' },
      tears: {
        speaker: CA, mood: 'sad', text: 'It was silent. So I took the stones out, to make them sing to me. And the crown began to weep. The tears are mine. I cannot stop. I have tried.',
        choices: [{ text: '(Say what you came here to say.)', to: 'say' }, { text: 'What do you want now?', to: 'want' }],
      },
      want: { speaker: CA, text: 'I thought, if all twenty-four halves came home into me, I would be full at last. Every one of you is bringing me what I want. I am telling you so that you can choose not to.', next: 'say' },
      rang: { speaker: CA, mood: 'afraid', text: '(He goes very still.) Yes. Thirty years I tried to call them home and they would not come. So I stopped trying, and I rang the Bell, and I let them choose. And here you are. I did not know which answer I wanted.', next: 'say' },
      say: {
        speaker: CA, text: '(He waits.)',
        choices: CAMPAIGNS.flatMap((c) => kingLine(c.id, c.school as DialogueChoice['school'])),
      },
      heard: { speaker: CA, mood: 'sad', text: '(He flinches as if struck, and then, very slowly, he nods.) Yes. That is true. Nobody has said a true thing to me in thirty years. Say what you want done with it, then. The crown is there.', next: null },
    },
  },
  // ---------- III-7 The Choice (party vote, 60 s)
  {
    id: 'dialogue:heart-choice', name: 'III-7 the Choice', scope: 'party',
    entries: [{ when: { not: { flag: 'story.ending' } }, node: 'crown' }, { node: 'done' }],
    nodes: {
      crown: {
        speaker: 'narrator', text: 'The crown hangs in its cage of tears. The bearers stand round it, every half-stone singing. Whatever you do now, you do together.',
        choices: [
          {
            text: 'Set the stones back, and pass the crown on. Restore the Turning.', to: 'turning', quest: true,
            when: { all: [{ flag: 'story.bearers_gathered', op: '>=', value: 6 }, { flag: 'story.mentor_trust', op: '>=', value: 3 }] },
            lockedLabel: 'Needs six bearers and your mentor’s trust',
            effects: [{ setFlag: 'story.ending', value: 'turning' }],
          },
          { text: 'Break it. Let the stones go home for good.', to: 'unmaking', quest: true, effects: [{ setFlag: 'story.ending', value: 'unmaking' }] },
          { text: 'Put it on. The stones will sing for me.', to: 'crowned', quest: true, effects: [{ setFlag: 'story.ending', value: 'crowned' }] },
          {
            text: 'Give him the stones. All of us, together. Sing them to him.', to: 'first', quest: true, insight: 'first_chord',
            when: { all: [{ insight: 'godric_saw' }, { insight: 'tears_older' }, { insight: 'who_rang' }, { flag: 'story.nemesis_spared' }, { flag: 'story.mentor_trust', op: '>=', value: 5 }] },
            effects: [{ setFlag: 'story.ending', value: 'first-chord' }],
          },
        ],
      },
      turning: { speaker: 'narrator', text: 'One by one the bearers set their halves into the empty settings, and the halves find each other and become whole, and the crown begins to sing.', next: null },
      unmaking: { speaker: 'narrator', text: 'You lift the crown out of its cage and break it across the throne. It comes apart like a held breath. Twenty-four half-stones flare, and go home.', next: null },
      crowned: { speaker: 'narrator', text: 'You set the crown on your own head. The stones in your companions’ hands leap to it, and it sings, for you, as it never sang for him.', next: null },
      first: { speaker: 'narrator', text: 'You kneel in front of Casimir, and the bearers kneel with you, and you hold the stones out to him, and you sing.', next: null },
      done: { speaker: 'narrator', text: 'It is done.', next: null },
    },
  },
  // ---------- III-8 After: the shared slides
  {
    id: 'dialogue:heart-epilogue', name: 'III-8 the epilogue (shared slides)', scope: 'party',
    entries: (['turning', 'unmaking', 'crowned', 'first-chord'] as EndingId[]).map((e) => ({ when: ENDING(e), node: e })),
    nodes: {
      turning: { speaker: 'narrator', text: 'The Turning Bell rang at dawn, and was heard in all twelve realms, and every gate stood open. The crown passed, as it should have thirty years ago, to the champion of Fist.', next: 'turning-c' },
      'turning-c': { speaker: 'narrator', mood: 'sad', text: 'Casimir heard the Chord once, at the very end, all twelve notes at once. The tears stopped. He was smiling when they found him.', next: null },
      unmaking: { speaker: 'narrator', text: 'There was no crown, and so no Concordant, and the gates stood open anyway, which nobody had thought possible. The realms argued, and traded, and argued. It was uneasy, and it was free.', next: 'unmaking-c' },
      'unmaking-c': { speaker: 'narrator', text: 'Casimir lived on in Brindlecross, an old man who could hear nothing, and Pip took him out every morning to listen to the birds anyway.', next: null },
      crowned: { speaker: 'narrator', text: 'The new Concordant ruled out of turn from the Citadel, and the stones sang for them, and the realms were orderly and safe and did as they were told.', next: 'crowned-c' },
      'crowned-c': { speaker: 'narrator', mood: 'hollow', text: 'Casimir died in the night, at peace, they said. On the first morning of the new reign, on the Concordant’s cheek, there was one black tear.', next: null },
      'first-chord': { speaker: 'narrator', text: 'The bearers sang the stones to an Unsung man, and for the first time in his life he heard: not the twelve notes, but the rest between them. The thirteenth note. Concordia’s own.', next: 'first-chord-c' },
      'first-chord-c': { speaker: 'narrator', mood: 'happy', text: 'The crown was melted down and cast into a bell. Casimir keeps it. The Turning came back, with Concordia in the ring at last, and the Unsung ring the Bell.', next: null },
    },
  },
  // ---------- III-8 After: the class slides (generated from the outlines' endings tables)
  {
    id: 'dialogue:heart-epilogue-class', name: 'III-8 the epilogue (class slides)', scope: 'party',
    entries: CAMPAIGNS.flatMap((c) => (['turning', 'unmaking', 'crowned', 'first-chord'] as EndingId[]).map((e) => ({ when: { all: [{ heroClass: c.id }, ENDING(e)] }, node: `${c.id}-${e}` }))),
    nodes: Object.fromEntries(CAMPAIGNS.flatMap((c) => (['turning', 'unmaking', 'crowned', 'first-chord'] as EndingId[]).flatMap((e) => {
      const s = CLASS_EPILOGUES[c.id][e];
      const k = `${c.id}-${e}`;
      return [
        [k, { speaker: 'narrator', text: s.realm, next: `${k}-m` }],
        [`${k}-m`, { speaker: 'narrator', text: s.mentor, choices: [
          { text: '(And of the nemesis…)', to: `${k}-s`, when: { flag: 'story.nemesis_spared' } },
          { text: '(And of the nemesis…)', to: `${k}-d`, when: { not: { flag: 'story.nemesis_spared' } } },
        ] }],
        [`${k}-s`, { speaker: 'narrator', text: s.spared, next: null }],
        [`${k}-d`, { speaker: 'narrator', text: s.destroyed, next: null }],
      ] as [string, DialogueNode][];
    }))),
  },
  // ---------- III-8 After: Wil's ballad
  {
    id: 'dialogue:heart-ballad', name: 'III-8 Wil’s ballad', scope: 'party',
    entries: [{ node: 'goose' }],
    nodes: {
      goose: { speaker: 'npc:wil', text: 'Sit down, sit down, all of you. Stew’s free tonight. Everything’s free tonight. I wrote you a song, and you’re going to sit through all of it.', next: 'verse' },
      verse: { speaker: 'npc:wil', mood: 'happy', text: '“Twelve came walking out of twelve shut doors, and the {class} out of {realm} with them, and they climbed the stairs to a weeping man, and they did not hate him. That is the whole of the song. That is the good part.”', next: 'end' },
      end: { speaker: 'npc:wil', text: 'There’s more. There are forty verses. Pell owes me nine shards. Some things never change, and thank the stones for that.', effects: [{ setFlag: 'story.epilogue_seen', value: true }], next: null },
    },
  },
];

export default dialogues;
