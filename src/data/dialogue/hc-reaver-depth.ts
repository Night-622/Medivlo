/**
 * Hollow Crown, REAVER Act I depth pass (10-campaign-style.md §8, docs/PACING.md): the new stages' scenes,
 * investigation beats, travel banter, optional finds and the third parts of the side quests. Owner: Claude 4.
 */
import type { DialogueDef, NarrativeCondition } from '@/core';

type Q = `quest:${string}`;
const stage = (q: Q, s: string): NarrativeCondition => ({ questStage: q, stage: s });
const BR = 'npc:brenna-scald-hand' as const, HK = 'npc:hask' as const, JY = 'npc:jory-two-coin' as const;
const CK = 'npc:cookie-mallow' as const, GR = 'npc:quartermaster-grub' as const, TM = 'npc:old-tam' as const;
const HD = 'npc:hermit-hild' as const;
const OM = 'npc:orrin-mattock' as const, DY = 'npc:brenna-runner' as const, GN = 'npc:ginnet-heart' as const;

/** an object beat: one scene while its stage runs (sets its flag), a plain line otherwise */
function beat(id: string, name: string, when: NarrativeCondition, text: string, flag: string, plain: string, more?: string): DialogueDef {
  return {
    id: `dialogue:obj-${id}`, name, scope: 'party',
    entries: [{ when, node: 'beat' }, { node: 'plain' }],
    nodes: {
      beat: { speaker: 'narrator', text, effects: [{ setFlag: flag, value: true }], next: more ? 'more' : null },
      ...(more ? { more: { speaker: 'narrator', text: more, next: null } } : {}),
      plain: { speaker: 'narrator', text: plain, next: null },
    },
  };
}

const dialogues: DialogueDef[] = [
  // ======================= I-1 The Bell on the Fields: the wounded, the dawn watch
  ...[
    'Gorse Ironside, a shield-wall veteran with a hound bite to the bone, refusing a stretcher. “Did you see? Every axe on the line went down at once, like we’d been told. Who told us?”',
    'A young Reaver called Rook, white as ash, holding his own arm. “I dropped my axe with a hound on me. I didn’t decide to. My hands just did it. My nan’s hands would have done the same.”',
    'Cookie Mallow, ladling broth into the wounded whether they want it or not. “Hask went out past the line before the attack. I gave him a heel of bread. He didn’t eat it. He never doesn’t eat it.”',
  ].map((text, i): DialogueDef => beat(`reaver-wounded-${i + 1}`, `I-1 the wounded (${i + 1})`, stage('quest:reaver-the-bell-on-the-fields', 'wounded'),
    text, `reaver.wounded_${i + 1}`, 'A bloodied blanket by the cookfire, folded now.')),
  {
    id: 'dialogue:reaver-brenna-dawn', name: 'I-1 the dawn watch with Brenna', scope: 'party',
    entries: [{ node: 'dawn' }],
    nodes: {
      dawn: { speaker: 'narrator', text: 'Dawn on the watchtower. The Fields steam below you, black and red, and the palisade is a line of scorched stakes with three gaps in it where Reavers used to stand.', next: 'brenna' },
      brenna: { speaker: BR, text: 'My grandmother kept this watch, and hers before her. A thousand years of Reavers standing on this tower waiting for the hounds. You know what the old law says, about the Bell?', next: 'law' },
      law: {
        speaker: BR, text: '“When the Bell rings, the Muster stands down, and the war is over, and the Reavers go home.” Every child learns it. Nobody ever believed it. There isn’t a home. There’s just the line.',
        choices: [
          { text: 'Maybe there could be.', to: 'home', trust: 1 },
          { text: 'The hounds didn’t stand down.', to: 'hounds' },
          { text: '[Ash] The stone in me is still singing. It wants something.', to: 'stone', school: 'ash' },
        ],
      },
      home: { speaker: BR, mood: 'sad', text: 'Maybe. I’m too old to start wanting things, pup. You’re not. Don’t let me talk you out of it.', next: 'hask' },
      hounds: { speaker: BR, mood: 'angry', text: 'No. They never do. Which is why I’ll keep my axe, law or no law, until somebody shows me a reason to put it down that the hounds agree with.', next: 'hask' },
      stone: { speaker: BR, text: 'Then listen to it. My grandmother said the stone would know what the Muster had forgotten. That was the only thing she ever said about it that made me afraid.', next: 'hask' },
      hask: {
        speaker: BR, mood: 'afraid', text: '(She looks out over the Fields, and you know she is looking for one figure.) He always comes back. He always comes back. Go and bring the other three home, and when you’re out there, look for him.',
        choices: [{ text: 'I will.', to: null }, { text: 'He’ll come back, Brenna.', to: null, trust: 1 }],
      },
    },
  },

  // ======================= I-2 Count the Fallen: the footprints into the Fields
  {
    id: 'dialogue:area-reaver-fields-track', name: 'I-2 banter: on the footprints', bark: true,
    entries: [{ when: stage('quest:reaver-count-the-fallen', 'tracks'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'Three sets of footprints, side by side, walking in step. Nobody walks in step on the Fields unless somebody is calling the time.', next: null } },
  },
  beat('reaver-footprints-end', 'I-2 where the footprints end', stage('quest:reaver-count-the-fallen', 'tracks'),
    'The footprints walk straight into the white lava, where nothing can live, and they do not stop and they do not burn. On the crust, at the edge, someone has set Ginnet’s shield-badge face up, the way you leave a thing for someone to find.',
    'reaver.tracks_end', 'White lava, and nothing else.', 'Your half-stone goes very quiet, the way a dog goes quiet when it hears something you can’t.'),

  // ======================= I-3 The Drake Roost: Hild shows the way up
  {
    id: 'dialogue:reaver-hild-climb', name: 'I-3 Hild and the goat path', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: HD, text: 'A Reaver, at my door, with the axe still on their back. You’ll be after the Roost. Everybody’s always after the Roost. Put the axe down and I’ll tell you how to get up there without dying.', next: 'axe' },
      axe: {
        speaker: HD, text: 'Well?',
        choices: [
          { text: '(Put the axe down.)', to: 'down', trust: 1, trustNpc: HD },
          { text: 'I can climb on my own.', to: 'own' },
        ],
      },
      down: { speaker: HD, mood: 'happy', text: 'There. Was that so hard? Goat path behind my hut, past the second cairn, and don’t look down at the third, because that’s where the drake throws the bones. Your banner’s in the nest. She likes red things.', next: 'deserter' },
      own: { speaker: HD, text: 'Then you’ll climb the face and the drake will knock you off it, and the Muster will say a song about you. Goat path’s behind my hut. Take it or don’t.', next: 'deserter' },
      deserter: { speaker: HD, text: 'And when you get back to the Muster, they’ll ask who showed you the way. Tell them the coward did. It’ll make their day.', next: null },
    },
  },

  // ======================= I-4 Hask Comes Home: the sentry, the vein
  {
    id: 'dialogue:reaver-jory-sentry', name: 'I-4 Jory on the midnight watch', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: JY, text: 'Midnight watch, me. I had odds on him coming back, mind. Evens. I lost a lot of money on evens, over the years, betting on Hask. He always comes back.', next: 'how' },
      how: {
        speaker: JY, mood: 'afraid', text: 'But I’ve never seen him come back like that. Straight out of the Fields, walking on the crust where it’s white. It should have taken his feet off. He was whistling.',
        choices: [
          { text: 'Did anyone come with him?', to: 'with' },
          { text: 'What are the odds now, Jory?', to: 'odds' },
        ],
      },
      with: { speaker: JY, text: 'Not that I saw. But the hounds stopped howling the moment he came over. All of them, at once. Like a dog when its master whistles.', next: null },
      odds: { speaker: JY, mood: 'sad', text: '(He doesn’t answer for a long time.) I’ve stopped taking bets on Hask. First time in twenty years. You can make of that what you like.', next: null },
    },
  },
  {
    id: 'dialogue:obj-reaver-hask-vein', name: 'I-4 Hask at the vein where he fell', scope: 'party',
    entries: [{ when: stage('quest:reaver-hask-comes-home', 'vein'), node: 'see' }, { node: 'plain' }],
    nodes: {
      see: { speaker: 'narrator', text: 'Hask is sitting on the lip of an old lava vein in the dark, with his feet in it, the way a boy sits on a riverbank. The black tears are coming up out of the vein around his ankles, and he is talking to them.', next: 'talk' },
      talk: { speaker: HK, mood: 'happy', text: '(Not to you. To the tears.) Shh. Shh, I know. I know. Soon. When the stone comes, and the gate opens, I’ll take you all through. Nobody will ever be put down again. Not ever.', next: 'turn' },
      turn: {
        speaker: HK, text: '(He sees you. He isn’t surprised.) Sib! This is where I fell in, did Mother tell you? She burned her arm off pulling me out. I didn’t burn. I never told her I could hear them, even then.',
        choices: [
          { text: 'Hear who, Hask?', to: 'who' },
          { text: 'Come back to the camp.', to: 'back' },
        ],
      },
      who: { speaker: HK, mood: 'sad', text: 'Everyone the war ever took. They’re all still in here, crying. And I’m going to make it so nobody ever has to cry again. You’ll see. Go on back. I’ll be along.', effects: [{ setFlag: 'reaver.hask_vein', value: 'heard' }], next: null },
      back: { speaker: HK, mood: 'happy', text: 'In a bit. In a bit. Tell Mother I’m fine. I’m better than fine.', effects: [{ setFlag: 'reaver.hask_vein', value: 'seen' }], next: null },
      plain: { speaker: 'narrator', text: 'An old lava vein, crusted over. The rock round its lip is scorched in the shape of a hand.', next: null },
    },
  },

  // ======================= I-5 The Muster’s Vote: Cookie and Grub before the ring
  {
    id: 'dialogue:reaver-cookie-vote', name: 'I-5 Cookie before the vote', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: CK, text: 'The vote? I’ll tell you what a march means, from where I stand. It means three hundred Reavers on the Fields for a month and no ox. And the truce villages are an hour’s walk from the Pits.', next: 'fear' },
      fear: {
        speaker: CK, mood: 'sad', text: 'Hungry Reavers and grain an hour away. I’ve seen how that goes. Last time, Brenna’s mother hanged four of our own for it. I fed them their last breakfast.',
        choices: [
          { text: 'Then you’d vote to stand down.', to: 'down' },
          { text: 'What would you want, if you could have anything?', to: 'want', trust: 1, trustNpc: CK },
        ],
      },
      down: { speaker: CK, text: 'I’d vote for whatever means I cook for three hundred and bury none. If you find one of those, let me know.', next: null },
      want: { speaker: CK, mood: 'happy', text: '(She laughs, surprised.) To cook for somebody who isn’t going out to fight after. Just once. A long, slow supper where nobody looks at the door.', next: null },
    },
  },
  {
    id: 'dialogue:reaver-grub-vote', name: 'I-5 Grub before the vote', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: GR, text: 'You want my vote? I’m the quartermaster. I don’t vote. I count. And I’ll tell you what I’ve counted.', next: 'count' },
      count: {
        speaker: GR, text: 'Two hundred and ninety-one axes. Forty days of rations if Cookie stretches them. Three wells, one with hounds on it. And a shield-wall that dropped its axes last night because a bell said so.',
        choices: [
          { text: 'So we can’t win a march.', to: 'win' },
          { text: 'The axes dropping worries you most.', to: 'axes' },
        ],
      },
      win: { speaker: GR, text: 'We can win a march. We always win marches. It’s the thousand years after the march I can’t make add up.', next: null },
      axes: { speaker: GR, mood: 'afraid', text: '(He puts his pencil down.) A thousand years of drill, and every hand on the line opened at once. If a bell can do that, what else is in us that we don’t know about? I count things. I don’t like things I can’t count.', next: null },
    },
  },

  // ======================= I-6 The Brand-Pits: the last whelp
  {
    id: 'dialogue:obj-reaver-brand-whelp', name: 'I-6 the last whelp', scope: 'party',
    entries: [{ when: stage('quest:reaver-the-brand-pits', 'whelp'), node: 'whelp' }, { node: 'plain' }],
    nodes: {
      whelp: { speaker: 'narrator', text: 'Behind the last branded pit-mouth, something is whining. A Magma Hound whelp, no bigger than a cat, with no black in it at all. Its eyes are the colour of a banked fire, and it is trying very hard to growl.', next: 'choose' },
      choose: {
        speaker: 'narrator', text: 'Every hound that ever came at the wall started like this.',
        choices: [
          { text: '(Carry it out of the pits and let it go on the open Fields.)', to: 'free', effects: [{ setFlag: 'reaver.whelp', value: 'freed' }] },
          { text: '(Take it back to the Muster. Hounds can be trained.)', to: 'keep', effects: [{ setFlag: 'reaver.whelp', value: 'kept' }] },
          { text: '(End it quickly. It is kinder than what the tears would do.)', to: 'end', effects: [{ setFlag: 'reaver.whelp', value: 'ended' }] },
        ],
      },
      free: { speaker: 'narrator', text: 'You set it down on the black crust under the stars. It sniffs the air, and looks back at you once, and trots off towards the hills, where there are no walls at all.', next: null },
      keep: { speaker: 'narrator', text: 'It rides home inside your shirt, warm as a coal. At the palisade, the sentries stare. Nobody has ever brought a hound inside the line. Cookie gives it the end of the broth.', next: null },
      end: { speaker: 'narrator', text: 'It is quick, and it does not understand, and afterwards the pits are very quiet. You stay with it a moment longer than you need to.', next: null },
      plain: { speaker: 'narrator', text: 'A branded pit-mouth, cold.', next: null },
    },
  },

  // ======================= I-7 The Unburnt: Ginnet’s axe, Old Tam
  beat('reaver-ginnet-axe', 'I-7 Ginnet’s axe', stage('quest:reaver-the-unburnt', 'ginnet'),
    'Among the raiders’ trail, an axe dropped point-down in the ash: Ginnet’s, with her shield-badge burned off the haft. She left it standing, the way the Muster marks a grave. As if some part of her knew.',
    'reaver.ginnet_axe', 'An axe standing point-down in the ash, marked with a stone.'),
  {
    id: 'dialogue:reaver-tam-raid', name: 'I-7 Old Tam after the raid', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: TM, text: 'I watched them go past the camp. I knew every face. Taught half of them to ride. Ginnet was singing. She never could hold a tune, and she was singing in tune.', next: 'song' },
      song: {
        speaker: TM, mood: 'sad', text: 'Ninety years on this Ridge and I never saw the dead march. Not in four wars. And they marched past me like I wasn’t there, towards the Battle-Kiln, singing the boy’s name.',
        choices: [
          { text: 'I’ll stop him, Tam.', to: 'stop' },
          { text: 'Did Ginnet look at you?', to: 'look' },
        ],
      },
      stop: { speaker: TM, text: 'Stop him, or bring him back. Brenna’ll want the second. Pick the first if you must. Go on. Tell her.', next: null },
      look: { speaker: TM, text: '(He is quiet for a while.) Once. Just as she passed. Like she was trying to remember my name, and couldn’t, and was sorry about it. Go and tell Brenna.', next: null },
    },
  },

  // ======================= I-9 The Last Muster: the last campfire on the road
  {
    id: 'dialogue:obj-reaver-last-campfire', name: 'I-9 the last campfire on the road', scope: 'party',
    entries: [
      { when: { all: [stage('quest:reaver-the-last-muster', 'camp'), { flag: 'reaver.muster', value: 'war' }] }, node: 'muster' },
      { when: stage('quest:reaver-the-last-muster', 'camp'), node: 'alone' },
      { node: 'plain' },
    ],
    nodes: {
      muster: { speaker: 'narrator', text: 'Halfway to the gate the Muster makes camp on the road, three hundred fires in a long red line. Jory is taking bets on the gate. Cookie is cooking for everyone. Old Tam is asleep sitting up.', next: 'talk' },
      alone: { speaker: 'narrator', text: 'Halfway to the gate you make camp alone on the road, with the Fields at your back. You light a fire. Out of the dark, one by one, three figures come to share it: Jory, with a bottle; Cookie, with a pot; Old Tam, with nothing but himself.', next: 'talk' },
      talk: {
        speaker: JY, text: 'Odds on the gate are poor, I’ll be honest. Odds on you are better. Odds on you coming back, I’m not quoting. I’ve stopped quoting odds on people coming back.',
        choices: [
          { text: 'Then don’t. Just wait for me.', to: 'wait' },
          { text: 'What would you bet on, Jory?', to: 'bet' },
        ],
      },
      wait: { speaker: CK, mood: 'happy', text: 'He’ll wait. We’ll all wait. I’ll keep a pot on. When you bring him home I want you both at my fire, and I want you to eat until you can’t stand.', next: 'tam' },
      bet: { speaker: JY, mood: 'sad', text: 'A long, slow supper where nobody looks at the door. Cookie says you asked her that. Two coins says you get it for her.', next: 'tam' },
      tam: { speaker: TM, text: '(Awake after all.) The gate’s older than the war. Older than the Muster. Whatever’s on the other side, it was there before we started fighting. Remember that, when you get there.', effects: [{ setFlag: 'reaver.last_camp', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'A cold fire-ring on the Cinder Road.', next: null },
    },
  },

  // ======================= Side: A Wager of Axes (Jory’s book)
  beat('reaver-jory-book', 'A Wager of Axes: Jory’s book', stage('quest:reaver-a-wager-of-axes', 'book'),
    'Jory’s betting book, twenty years thick. Every page is the same kind of bet: will this Reaver come home? Beside every name that didn’t, in tiny writing, a sum, and a word: PAID. He has been paying the families of the dead out of his own winnings, for twenty years, and calling it a wager.',
    'reaver.jory_book', 'Jory’s betting book, under the stakes board.'),
  {
    id: 'dialogue:reaver-jory-book-talk', name: 'A Wager of Axes: what the book says', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: JY, mood: 'afraid', text: 'You read it. Course you read it. It was under the board. Everyone knows not to look under the board.', next: 'why' },
      why: {
        speaker: JY, text: 'Look. Nobody takes charity in the Muster. They’d spit on it. But a debt’s a debt. If I lose a bet, I pay. So I bet against every one of them, every time, and when they don’t come home, I’ve lost.',
        choices: [
          { text: 'Your secret’s safe with me.', to: 'safe', trust: 1, trustNpc: JY },
          { text: 'You should tell them. They’d understand.', to: 'tell' },
        ],
      },
      safe: { speaker: JY, mood: 'happy', text: 'Good. Because I’ve got a reputation to lose, and it’s a very bad reputation, and I worked hard for it. Here. A coin for the long shot.', next: null },
      tell: { speaker: JY, text: 'They wouldn’t. They’d stop losing to me on purpose, and then where would the widows be? No. Some things only work if nobody looks under the board.', next: null },
    },
  },

  // ======================= Side: the Cook’s Last Ox (soup for the truce village)
  {
    id: 'dialogue:obj-reaver-truce-pot', name: 'The Cook’s Last Ox: soup for the truce village', scope: 'party',
    entries: [{ when: stage('quest:reaver-the-cooks-last-ox', 'village'), node: 'village' }, { node: 'plain' }],
    nodes: {
      village: { speaker: 'narrator', text: 'The truce village at the edge of the Fields bars its gate when it sees a Reaver. You set Cookie’s pot down outside the gate and step back, a long way back, with your axe on the ground.', next: 'gate' },
      gate: {
        speaker: 'narrator', text: 'After a long while the gate opens a crack. An old woman comes out, sniffs the pot, and looks at you. “Fire-caps,” she says. “Nobody’s brought us anything but trouble from the Muster since my mother was a girl.”',
        choices: [
          { text: '“There’ll be more. Cookie says so.”', to: 'more', effects: [{ setFlag: 'reaver.truce_soup', value: true }] },
          { text: '(Say nothing. Leave the pot.)', to: 'leave', effects: [{ setFlag: 'reaver.truce_soup', value: true }] },
        ],
      },
      more: { speaker: 'narrator', text: '“Then tell your cook,” says the old woman, “that if the Muster ever comes this way with soup instead of axes, we’ll open the gate all the way.” She takes the pot in.', next: null },
      leave: { speaker: 'narrator', text: 'She takes the pot in. When you look back from the ridge, someone has hung a lantern on the gate, which in the truce villages means: we saw you.', next: null },
      plain: { speaker: 'narrator', text: 'A truce village gate, with a lantern hung on it.', next: null },
    },
  },

  // ======================= Side: Hounds at the Well (what was in the cistern)
  beat('reaver-well-cistern', 'Hounds at the Well: the cistern', stage('quest:reaver-hounds-at-the-well', 'source'),
    'The well is fed from an old Schools’ War cistern under the rocks. In the inlet, choking it, is a drowned hound pup, and around it the water has gone black and salty, and the hounds on the well were not guarding it. They were waiting for it.',
    'reaver.well_cistern', 'An old cistern under the rocks, clean water running.', 'You lift the pup out and bury it in the ash. The water runs clear by morning.'),

  // ======================= Side: Red Veins (where the veins meet)
  beat('reaver-vein-confluence', 'Red Veins: where the veins meet', stage('quest:reaver-red-veins', 'confluence'),
    'North of the Muster every lava vein you mapped runs into one, a single red river under the crust, flowing uphill towards the Cinder Gate. Where they meet, the rock has been worn smooth, as if something very heavy has been dragged this way, over and over, for a very long time.',
    'reaver.vein_confluence', 'A red river under the crust, flowing north.'),

  // ======================= Side: Banners of the Schools’ War (raising the Concord banner)
  beat('reaver-ring-pole', 'Banners of the Schools’ War: the ring pole', stage('quest:reaver-banners-of-the-schools-war', 'plant'),
    'You run the Concord banner up the Muster ring’s pole, under the red axe. Twelve marks in a ring, and a crown. A few Reavers stop to look. One of them, a girl of about ten, asks what it is. Nobody can tell her. You can.',
    'reaver.concord_banner', 'The Muster ring pole, flying two banners now.'),

  // ======================= Side: A Grave for Old Cinder (stones from his battles)
  ...[
    'A stone from the ford where Cinder carried Tam across the flood in the second war, and would not stop, though the water was over his horns.',
    'A stone from the hill where Cinder stood over Tam, wounded, for a whole night, and the hounds would not come near.',
    'A stone from the gate of the old ram-pens, where Cinder was born, which Tam says he never once tried to go back to.',
  ].map((text, i): DialogueDef => beat(`reaver-cinder-stone-${i + 1}`, `A Grave for Old Cinder: a stone (${i + 1})`, stage('quest:reaver-a-grave-for-old-cinder', 'stones'),
    text, `reaver.cinder_stone_${i + 1}`, 'A gap in the ground where a stone was taken, kindly.')),

  // ======================= Side: the Hermit of the Holt (Hild’s letter to her brother)
  {
    id: 'dialogue:reaver-grub-letter', name: 'The Hermit of the Holt: a letter for Grub', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: GR, text: 'A letter? For me? From the Holt? (He doesn’t take it.) I don’t know anyone in the Holt. Nobody in the Muster knows anyone in the Holt.', next: 'sister' },
      sister: {
        speaker: GR, mood: 'angry', text: '(He takes it. He reads it twice. He reads everything twice.) Twenty years. She walked off the line and left me holding her shield. I counted the days. I stopped at seven thousand.',
        choices: [
          { text: 'She wants to see you.', to: 'see' },
          { text: 'You kept counting. You never stopped wanting her back.', to: 'want', trust: 1, trustNpc: GR },
        ],
      },
      see: { speaker: GR, text: 'Then she can come down here and see me. I’m not going up there. I’ve got a war to count. (He folds the letter very small.) Tell her that. Tell her exactly that.', effects: [{ setFlag: 'reaver.grub_answer', value: 'no' }], next: null },
      want: { speaker: GR, mood: 'sad', text: '(For a long moment he says nothing.) Tell her… tell her I still have her shield. I’ve oiled it every winter. Tell her the strap’s new.', effects: [{ setFlag: 'reaver.grub_answer', value: 'shield' }], next: null },
    },
  },
  {
    id: 'dialogue:reaver-hild-reply', name: 'The Hermit of the Holt: Grub’s answer', scope: 'party',
    entries: [
      { when: { flag: 'reaver.grub_answer', value: 'shield' }, node: 'shield' },
      { node: 'no' },
    ],
    nodes: {
      shield: { speaker: HD, mood: 'happy', text: 'He oiled it. Every winter. (She sits down, hard.) That great stubborn lump. Then he’s not finished with me. That’s more than I hoped for. That’s much more than I hoped for.', next: 'end' },
      no: { speaker: HD, mood: 'sad', text: '“I’ve got a war to count.” Yes. That’s Grub. He’ll be counting it when there’s nothing left to count but himself. Thank you for taking it. He read it twice, didn’t he? He reads everything twice.', next: 'end' },
      end: { speaker: HD, text: 'When this is over, and it will be, somebody will have to teach that Muster how to stop. You might ask him to help. He’s good at counting things down, as well as up.', next: null },
    },
  },

  // ======================= Side: Warm Eggs (telling Hild)
  {
    id: 'dialogue:reaver-hild-eggs', name: 'Warm Eggs: telling Hild', scope: 'party',
    entries: [{ when: { flag: 'reaver.eggs', value: 'sold' }, node: 'sold' }, { node: 'returned' }],
    nodes: {
      returned: { speaker: HD, mood: 'happy', text: 'You took them back up? The whole crag, twice, with eggs in your shirt? (She laughs.) There’s a drake on the far peak that has been screaming at the sky since you did it. That’s a mother’s scream, that is. The happy kind.', next: 'end' },
      sold: { speaker: HD, mood: 'sad', text: 'To Jory. Well. Jory’s soft, under all that. He’ll not sell them on. He’ll sit up with them by the fire and talk to them about odds. They might even hatch, if they can stand the conversation.', next: 'end' },
      end: { speaker: HD, text: 'Clean eggs, with no black in them, from a drake that went hollow. That means the black isn’t in the blood. It comes from somewhere else. Remember that.', effects: [{ insight: 'tears_not_blood' }], next: null },
    },
  },
  // ======================= Mentor: Brenna’s Arm (the handprint)
  beat('reaver-brenna-handprint', 'Brenna’s Arm: the handprint', stage('quest:reaver-brennas-arm', 'vein'),
    'At the lip of the old vein, burned into the rock, is a handprint: a woman’s hand, reaching in. The rock around it has run like wax and set again. Thirty years, and the mark is as clear as if she reached in this morning.',
    'reaver.handprint', 'A handprint burned into the rock at the lip of an old vein.', 'There is no second handprint. A boy pulled out of lava would have grabbed at the edge. He didn’t need to.'),

  // ======================= Optional areas (Claude 2): the Fields’ ruin, cave and viewpoint
  {
    id: 'dialogue:obj-ash-frontier-ruin-find', name: 'Fields ruin: the first palisade', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'A ring of stumps in the ash, old as the hills: the first palisade the Muster ever built, a thousand years back. Carved into the biggest stump, in letters worn almost flat: UNTIL IT IS OVER. Under it, newer, in a child’s hand: WHEN IS THAT?', effects: [{ unlockLore: 'lore:hc-ash-frontier-ruin' }], next: null } },
  },
  {
    id: 'dialogue:obj-ash-frontier-cave-find', name: 'Fields cave: the hound den', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'The end of the cave is a hound den, abandoned, warm. Scratched on the wall at a hound’s height, over and over, the same mark: the red axe of the Muster. Somebody taught the hounds to fear it. Or somebody taught them to hunt it.', effects: [{ unlockLore: 'lore:hc-ash-frontier-cave' }], next: null } },
  },
  {
    id: 'dialogue:obj-ash-frontier-cave-codex', name: 'Fields cave: a Reaver’s last letter', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'A letter in a tin, left on a ledge in the side cave. “If this is found, I got lost chasing a hound into the dark, and it was worth it, it was the biggest one I ever saw. Tell my sister she can have my axe. Tell her not to come looking. — Corrie Ash, of the Red Muster.”', effects: [{ unlockLore: 'lore:hc-ash-frontier-letter' }], next: null } },
  },
  {
    id: 'dialogue:obj-ash-frontier-view-find', name: 'Fields viewpoint: the whole war at once', scope: 'party',
    entries: [{ node: 'find' }],
    nodes: { find: { speaker: 'narrator', text: 'From the viewpoint the whole of the Bleeding Fields lies open below you, and you can see what nobody on the line can: the hound packs and the Muster’s patrols, all moving in circles, round and round, the same circles, like a dance that nobody remembers starting.', effects: [{ unlockLore: 'lore:hc-ash-frontier-view' }], next: null } },
  },
  // ======================= ACT II (wave 2 depth): C-1 the axes over the Cinder Mug
  {
    id: 'dialogue:area-reaver-kilnmouth-road', name: 'C-1 banter: the road to Kilnmouth', bark: true,
    entries: [{ when: stage('quest:reaver-kilnmouth', 'ada'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'The road down into the Ashfall smells like the Fields on a still day: hot stone, sulphur, somebody’s cookfire. For the first time since the gate your hand goes to your axe, and finds nothing to do.', next: null } },
  },
  {
    id: 'dialogue:obj-reaver-kilnmouth-axes', name: 'C-1 the three axes over the Cinder Mug', scope: 'party',
    entries: [{ when: stage('quest:reaver-kilnmouth', 'axes'), node: 'axes' }, { node: 'plain' }],
    nodes: {
      axes: { speaker: 'narrator', text: 'Three Reaver axes hang over the Cinder Mug’s hearth, edge up, on iron pegs. On the Fields an axe hung edge up means its owner has gone home. Nobody on the Fields has hung one in your lifetime. These are furred with thirty years of soot.', next: 'orrin' },
      orrin: {
        speaker: OM, text: 'Mine’s the middle one. The ugly one. (An old man with forge-burns up both arms and a Reaver’s shoulders gone soft.) Orrin Mattock, second rank, Brenna Scald-Hand’s shield-wall. Was. You’ll have heard what they call us.',
        choices: [
          { text: 'Deserters.', to: 'deserters' },
          { text: 'I’ve heard. I’d rather hear it from you.', to: 'story', trust: 1 },
        ],
      },
      deserters: { speaker: OM, text: 'Aye. Funny word, for us. (He laughs, and it turns into a cough, and the cough goes on longer than the laugh.)', next: 'story' },
      story: { speaker: OM, text: 'Autumn of C. 1011. The Fields were quiet that year, quiet as they’d been in a hundred. Three of us walked down the Cinder Road to sell axe-heads at the Turning fair, and stayed the winter for the beer.', next: 'shut' },
      shut: {
        speaker: OM, mood: 'sad', text: 'Then the gates shut, and over there the war started again without us. We were deserters from a war that hadn’t begun when we left. Thirty-one years of being a deserter from that.',
        choices: [
          { text: 'Then you never deserted anything.', to: 'never', trust: 1, effects: [{ setFlag: 'reaver.orrin_absolved', value: true }] },
          { text: 'The Muster still lost three axes.', to: 'lost' },
        ],
      },
      never: { speaker: OM, text: 'That’s what Ada says. It’s different, hearing it in a Fields voice. (He looks up at the axes.) Still. I’ve had thirty years of the other thing in my own head, and it talks louder than you.', next: 'brenna' },
      lost: { speaker: OM, text: 'It did. Brenna lost her second rank and I lost the line. (He nods, slowly.) Fair. A Reaver ought to say it to my face once. Thank you for being the one.', next: 'brenna' },
      brenna: {
        speaker: OM, text: 'Is she well? Brenna? Her boy’ll be grown. Little Hask. He used to sleep across her tent door with a stick, so the hounds couldn’t get in. (He sees your face.) …Ah.',
        choices: [
          { text: 'Hask came through the gate behind me. He’s hollow.', to: 'hask' },
          { text: 'She’s keeping the peace. The Fields are quiet.', to: 'peace', when: { flag: 'reaver.muster', op: '==', value: 'truce' } },
          { text: 'She’s marching. The whole Muster is.', to: 'march', when: { flag: 'reaver.muster', op: '==', value: 'war' } },
        ],
      },
      peace: { speaker: OM, mood: 'happy', text: 'Quiet. The Fields. (He sits down on the hearth as if his knees have gone.) I’d have paid money to hear that. And the boy?', next: 'hask' },
      march: { speaker: OM, text: 'Course she is. She never could stand still with a war going. (A pause.) And the boy?', next: 'hask' },
      hask: { speaker: OM, mood: 'afraid', text: '(When you have told him, he is quiet a long time.) Ada says Ashmaw’s breath has gone black, same as you say the Fields have. Thirty years I’ve heard it under my anvil, steady as a sleeper. This month it breathes in step.', next: 'go' },
      go: { speaker: OM, text: 'I’m seventy-eight, and I’ve never once looked at the thing I ran from. Not the war, not the beast. Take me to the vent head, Reaver. I’d like to look one of them in the face before I die.', effects: [{ setFlag: 'reaver.orrin_met', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'Three Reaver axes over the Cinder Mug’s hearth, black with soot.', next: null },
    },
  },
  {
    id: 'dialogue:reaver-orrin', name: 'Orrin Mattock (general)',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: OM, text: 'Mind the anvil, it bites. What can an old deserter do for a Reaver?',
        choices: [
          { text: 'What do you make, these days?', to: 'make' },
          { text: 'Why did you really stay, that winter?', to: 'why', when: { trust: OM, value: 'friendly' } },
          { text: 'Farewell.', to: null, tag: 'leave' },
        ],
      },
      make: { speaker: OM, text: 'Horseshoes, hinges, and once a very good axe-head that nobody ever came to buy. (He knocks it against the wall. It rings.) That one. Thirty years, and it still rings.', next: 'start' },
      why: { speaker: OM, text: '(He is quiet for a while.) There was a girl at the Turning fair selling candles. Tabby Candler. I told the others I was staying for the beer. I stayed for her.', next: 'tabby' },
      tabby: { speaker: OM, mood: 'sad', text: 'The coughing sickness took her the winter of ’29. Eighteen years, and she never once called me a deserter. She called me “the Fields”, like it was my name.', next: 'end' },
      end: { speaker: OM, mood: 'happy', text: 'Don’t tell Brenna. She’d never let me forget I went soft over a candle-seller. Go on, now. You’ve better things to do than an old man’s courting.', next: null },
    },
  },

  // ======================= ACT II, C-2 Ashmaw’s Breath: escorting Orrin to the vent head
  {
    id: 'dialogue:reaver-orrin-breath', name: 'C-2 Orrin listens at the vent head', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'Orrin lies on his belly at the vent head with one ear to the hot stone, the way the old Reavers listened for hounds moving under the crust. He holds up a hand for quiet. You give it to him.', next: 'hear' },
      hear: {
        speaker: OM, mood: 'afraid', text: 'Four beats and a rest. Four and a rest. (He looks up at you, grey.) That’s the muster-drum. That’s the march the Red Muster has walked to the line for a thousand years. It’s breathing our march.',
        choices: [
          { text: 'How can a beast know the march?', to: 'know' },
          { text: 'It’s the tears. They make things keep going.', to: 'tears' },
        ],
      },
      know: { speaker: OM, text: 'It doesn’t. That’s the thing. Nobody knows it. Nobody on the Fields could tell you who wrote it. You walk to it because everybody walks to it, because it’s the time the world keeps.', next: 'beast' },
      tears: { speaker: OM, text: 'Keep going. Aye. That’s what the Fields does to you, tears or no tears. (He spits on the stone, and it hisses.)', next: 'beast' },
      beast: {
        speaker: OM, text: 'Ada says it lit the Turning torches. A thousand years of fire for a crown, and when the crown stopped coming it kept the fire lit, because nobody told it to stop. Reaver, that’s not a beast. That’s one of us.',
        choices: [
          { text: 'Then somebody should tell it to stop.', to: 'tell', trust: 1 },
          { text: 'Or somebody should end it.', to: 'end' },
        ],
      },
      tell: { speaker: OM, text: 'Somebody should. Somebody should have told us. (He looks at you a long time.) Go on, then. Tell it. You’ve the voice for it.', next: 'stay' },
      end: { speaker: OM, text: 'Maybe that’s the same thing, at the bottom. I never got close enough to find out.', next: 'stay' },
      stay: { speaker: OM, text: 'I’ll sit here. My knees won’t walk me back yet, and I want to feel it go quiet. (He puts his ear back to the stone.) Follow the three vents to where they meet.', next: 'tail' },
      tail: { speaker: OM, mood: 'happy', text: 'And pup? Mind its tail. Brenna always said it: mind the tail, the head’s only for show.', next: null },
    },
  },

  // ======================= ACT II, C-3 Ashmaw: telling Orrin
  {
    id: 'dialogue:reaver-orrin-ashmaw', name: 'C-3 Orrin hears that Ashmaw is at rest', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'The Cinder Mug is full and nobody is drinking. The fire under the three axes is the only one lit in Kilnmouth. Orrin sits beneath it with his hands round a cold mug.', next: 'orrin' },
      orrin: {
        speaker: OM, text: 'It went quiet. I was still at the vent head when it went. Four beats, and a rest, and then only the rest. (He doesn’t look up.) Tell me how.',
        choices: [
          { text: 'I told it the war was over. It believed me.', to: 'told', trust: 1 },
          { text: 'It fought to the end. Then it was tired.', to: 'tired' },
        ],
      },
      told: { speaker: OM, text: '(He makes a small noise.) Just like that? Thirty years I could have walked down there and said it.', next: 'idea' },
      tired: { speaker: OM, text: 'Aye. They get tired. You don’t think they will, and then they do, all at once.', next: 'idea' },
      idea: { speaker: OM, text: 'The other two want to light the forges with coal and pretend none of it happened. (He looks up at the axes.) I’ve a better idea.', next: 'axe' },
      axe: {
        speaker: 'narrator', text: 'He climbs on the bench, takes down the middle axe, the ugly one, and blows thirty years of soot off it. Then he hangs it back on its peg edge down: the Muster’s sign for “still on the line”.',
        choices: [
          { text: 'You’re going back?', to: 'back' },
          { text: 'You don’t owe the Muster anything.', to: 'owe' },
        ],
      },
      back: { speaker: OM, mood: 'happy', text: 'Not to that line. To yours. Whatever you’re walking to, pup, I’ll be on it, in my head, where it counts. My knees can stay here.', next: 'word' },
      owe: { speaker: OM, text: 'No. That’s why it counts. (He climbs down, wheezing, very pleased with himself.)', next: 'word' },
      word: { speaker: OM, text: 'If you’ve a way of sending word home, tell Brenna that Orrin Mattock’s axe is hung edge down. She’ll know what it means. She’ll probably throw something.', effects: [{ setFlag: 'reaver.orrin_word', value: true }], next: null },
    },
  },

  // ======================= ACT II, C-4 The Muster of the Dead: the axe-dead’s trail
  ...[
    'In the soft ground under the Ash arch, bootprints: dozens of them, hobnailed Fields boots, walking out of the arch in step. Four and a rest. They came through behind you, the night you opened the gate.',
    'At the Brindlecross lychgate the hobnailed prints meet bare feet coming up out of the graves, and the bare feet fall in beside them. Somebody has taught the Brindlecross dead to march. They haven’t got the rest right yet. They come in a beat early.',
    'A standing stone on the moor, with the Muster’s rally-mark cut into it fresh: an axe over a line. The line was cut first. That’s the wrong way round, the way a child cuts it, and there was only ever one child on the Fields who would never be told.',
  ].map((text, i): DialogueDef => beat(`reaver-muster-sign-${i + 1}`, `C-4 the axe-dead’s trail (${i + 1})`, stage('quest:reaver-the-muster-of-the-dead', 'signs'),
    text, `reaver.sign_${i + 1}`, 'Old footprints, washed half away.', i === 2 ? 'The trail goes on over the moor towards Brindlecross. Somebody is mustering the dead, Muster fashion, and you know the hand.' : undefined)),
  {
    id: 'dialogue:area-reaver-barrow-moor', name: 'C-4 banter: over the moor to the barrow', bark: true,
    entries: [{ when: stage('quest:reaver-the-muster-of-the-dead', 'barrow'), node: 'b' }],
    nodes: { b: { speaker: 'narrator', text: 'The moor is quiet the way the Fields never were. Then, under your boots, faint, from somewhere below: four beats, and a rest.', next: null } },
  },

  // ======================= ACT II, C-5 Bonelord Varric: the muster-roll
  beat('reaver-varric-roll', 'C-5 Varric’s muster-roll', stage('quest:reaver-bonelord-varric', 'roll'),
    'Varric’s muster-roll, a thousand years of names in a duellist’s tight hand: the Schools’ War dead first, then the Brindlecross dead, newest last. The final page is in a different hand, big and cheerful, the rally-mark drawn line first at the top. Ginnet. Dace Tuller. Morag Baines. Forty more off the Fields, the dead and the living on one page.',
    'reaver.varric_roll', 'A muster-roll on a stone table, closed.',
    'Beside every Fields name, the same hand has written “gone on ahead with H.” And at the very bottom, on its own line: your name, and next to it, “when sib comes round.”'),

  // ======================= ACT II, C-6 Brenna’s Runner: supper at the Gilded Goose
  {
    id: 'dialogue:reaver-runner-supper', name: 'C-6 supper with Dunny at the Gilded Goose', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'The Gilded Goose does a stew. Dunny eats two bowls of it without a word, very fast, the way the Muster eats when the hounds might come, and then looks at the third bowl with real grief.', next: 'dunny' },
      dunny: {
        speaker: DY, text: 'Don’t tell the chief I had three. (She licks the spoon.) Right. Answer. She said not to come back without one, and to get it word for word, so go slow. I’m a runner, not a clerk.',
        choices: [
          { text: '“Hask is alive, and he’s hollow, and I’m going after him.”', to: 'truth', effects: [{ setFlag: 'reaver.reply', value: 'truth' }] },
          { text: '“I’m bringing him home.”', to: 'home', effects: [{ setFlag: 'reaver.reply', value: 'home' }] },
          { text: '“If he can’t come home, I’ll end it kindly, like you asked.”', to: 'kind', effects: [{ setFlag: 'reaver.reply', value: 'kindly' }] },
        ],
      },
      truth: { speaker: DY, mood: 'sad', text: '(She says it twice under her breath, and her face goes still.) She’ll sit down when I tell her that. She never sits down.', next: 'more' },
      home: { speaker: DY, mood: 'happy', text: '(She grins all over.) She’ll pretend she didn’t want to hear it. She’ll make me say it three times, and then she’ll go and shout at a hound.', next: 'more' },
      kind: { speaker: DY, text: '(Dunny nods, slowly.) Her own word back. She’ll know you were listening. That matters to her more than she lets on.', next: 'more' },
      more: {
        speaker: DY, text: 'Anything else? I can carry two things. Three if one of them’s short.',
        choices: [
          { text: 'Tell her Orrin Mattock’s axe is hung edge down.', to: 'orrin', when: { flag: 'reaver.orrin_word' } },
          { text: 'Tell her to eat something herself.', to: 'eat' },
          { text: 'That’s all.', to: 'go' },
        ],
      },
      orrin: { speaker: DY, text: 'Orrin Mattock? The deserter? The chief keeps a stone with his name on it out past the palisade, where we put the ones who aren’t coming back. She talks to it. (She swallows.) Edge down. I’ll tell her.', effects: [{ setFlag: 'reaver.orrin_sent', value: true }], next: 'go' },
      eat: { speaker: DY, mood: 'happy', text: '(Dunny laughs so hard the next table looks round.) Oh, she’ll hate that. I’ll say it in your voice.', next: 'go' },
      go: { speaker: DY, text: '(She stands, pockets the heel of the loaf for the road, and is out of the door at a run.) Back by the Cinder Road! Don’t die before I’m back!', next: null },
    },
  },

  // ======================= ACT III, Bring Him Home: the axe, the stick, the runner
  {
    id: 'dialogue:reaver-runner-wait', name: 'Bring Him Home: Dunny waits', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: DY, text: 'I’ve carried messages all my life. I’ve never carried a person. Bring me something of his I can put in the chief’s hands. She’ll want to hold something.', next: null } },
  },
  {
    id: 'dialogue:obj-reaver-hask-axe', name: 'Bring Him Home: Hask’s axe', scope: 'party',
    entries: [
      { when: { all: [stage('quest:reaver-bring-him-home', 'stair'), { flag: 'reaver.nemesis_fate', op: '==', value: 'spared' }] }, node: 'spared' },
      { when: stage('quest:reaver-bring-him-home', 'stair'), node: 'fallen' },
      { node: 'plain' },
    ],
    nodes: {
      spared: { speaker: 'narrator', text: 'Hask’s axe lies on the top stair where he dropped it. They have carried him down to the camp, blistered and swearing. When somebody tried to hand it back to him, he flinched: it was warm.', next: 'haft' },
      fallen: { speaker: 'narrator', text: 'Hask’s axe lies on the top stair beside the place where he fell. Nobody has wanted to touch it. The stone around it is still a little warm.', next: 'haft' },
      haft: { speaker: 'narrator', text: 'You pick it up. The haft is bound in old Muster leather, and under the binding, where the hand goes, there is something that isn’t axe-wood at all: a child’s stick, grey with age, bound in so that it can never be taken out.', next: 'stick' },
      stick: { speaker: 'narrator', mood: 'sad', text: 'The stick he slept across Brenna’s tent door with, so that nothing could get in. Thirty years of war, and he never once put it down.', effects: [{ setFlag: 'reaver.hask_stick', value: true }], next: null },
      plain: { speaker: 'narrator', text: 'The top stair, swept clean.', next: null },
    },
  },
  {
    id: 'dialogue:reaver-runner-stick', name: 'Bring Him Home: Dunny sees the stick', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: {
        speaker: DY, text: '(She takes the axe in both arms, the way the Muster carries a fallen Reaver’s, and then she sees the haft.) What’s that? That’s not wood. That’s a stick.',
        choices: [
          { text: 'It’s the stick he guarded her tent with, when he was seven.', to: 'stick' },
          { text: 'Ask Brenna. She’ll know it.', to: 'ask' },
        ],
      },
      stick: { speaker: DY, mood: 'sad', text: 'The tent-door stick. (Dunny sits down very suddenly on a crate.) The chief tells that one every midwinter. We all know it by heart. We thought he lost it in the lava.', next: 'carry' },
      ask: { speaker: DY, text: '(She turns it over in her hands.) Oh. Oh, I know what this is. The chief tells that one every midwinter. The tent-door stick. We thought he lost it in the lava.', next: 'carry' },
      carry: {
        speaker: DY, text: 'So what do I tell her, when I put this in her hands? Word for word.',
        choices: [
          { text: '“He kept guard. All this time, he kept guard.”', to: 'guard' },
          { text: '“He’s coming home behind me, slowly, and it hurts.”', to: 'slow', when: { flag: 'reaver.nemesis_fate', op: '==', value: 'spared' } },
          { text: '“I ended it kindly.”', to: 'kind', when: { flag: 'reaver.nemesis_fate', op: '==', value: 'destroyed' } },
        ],
      },
      guard: { speaker: DY, text: 'He kept guard. (She says it twice, to get it right.) Yes. That’s the one. She’ll be able to carry that.', next: 'go' },
      slow: { speaker: DY, mood: 'happy', text: 'Slowly, and it hurts. (She laughs and wipes her nose on her sleeve.) She’ll like that better than anything I’ve ever brought her.', next: 'go' },
      kind: { speaker: DY, mood: 'sad', text: 'Kindly. (Dunny holds the axe tighter.) She asked for that. She’ll hate that she got it. Both at once, probably.', next: 'go' },
      go: { speaker: 'narrator', text: 'Dunny ties the axe across her back with the haft up, where the stick shows, and runs. You watch her down the camp road until she is a red dot, and then nothing.', effects: [{ setFlag: 'reaver.stick_home', value: true }, { trust: BR, delta: 1 }], next: null },
    },
  },

  // ======================= ACT III, The Hollow Muster: Ginnet, and the count
  {
    id: 'dialogue:reaver-ginnet-heart', name: 'The Hollow Muster: Ginnet asks to be counted', scope: 'party',
    entries: [{ node: 'start' }],
    nodes: {
      start: { speaker: 'narrator', text: 'Ginnet sits on her shield at the edge of the Legion camp, turning her hands over as if they belong to somebody else. Up close you can see the hound bite in her neck. It hasn’t bled. It never will.', next: 'ginnet' },
      ginnet: {
        speaker: GN, text: 'Sib. (She says it the way Hask said it, and frowns.) No. That was his word. I’ve got his words in my mouth. I’ve had his songs in my mouth for months, and I can’t get them out.',
        choices: [
          { text: 'You were singing his name. Old Tam heard you.', to: 'tam' },
          { text: 'Do you remember the night on the line?', to: 'line' },
        ],
      },
      tam: { speaker: GN, mood: 'sad', text: 'Tam? Was he there? (Her face crumples.) I sang in tune. I never sang in tune in my life. That’s how I knew it wasn’t me.', next: 'know' },
      line: { speaker: GN, text: 'The hound. The Bell. I put my axe down because the law said to, and the hound didn’t know the law. (She touches her neck.) It was quick. I’ll give it that.', next: 'know' },
      know: {
        speaker: GN, text: 'The living ones are already arguing over the Cinder Road and who carries what. I’m not going home. I know what I am. So do Dace and Morag. We’ve been standing since the Bell.',
        choices: [
          { text: 'What do you need?', to: 'need' },
          { text: 'Brenna would want you home, whatever you are.', to: 'home' },
        ],
      },
      home: { speaker: GN, text: 'She would. She’d set me a stool by the cookfire and pretend I was eating. (She almost smiles.) No. Let her have my axe and a stone. That’s the law.', next: 'need' },
      need: { speaker: GN, text: 'Nobody counted us. The morning after we fell, you went out to count the fallen and we’d already walked off. A Reaver who isn’t counted keeps standing. That’s why we couldn’t lie down, even when he let us.', next: 'ask' },
      ask: {
        speaker: GN, text: 'So count us. Out loud, the old way, with the axes in a row. Then we can stop.',
        choices: [
          { text: 'I’ll count you.', to: 'count' },
          { text: 'I know your names already. I read them in Hask’s hand, in Varric’s barrow.', to: 'roll', when: { flag: 'reaver.varric_roll' } },
        ],
      },
      roll: { speaker: GN, mood: 'happy', text: 'In his hand? (She laughs, a real one.) He always drew the rally-mark line first. Then you’ve got the list. Good. Don’t miss anybody.', next: 'count' },
      count: { speaker: GN, text: 'We’ll lay them out. Give us a moment. Some of us are slow, now.', effects: [{ setFlag: 'reaver.ginnet_spoke', value: true }], next: null },
    },
  },
  {
    id: 'dialogue:reaver-ginnet', name: 'Ginnet (general)',
    entries: [{ node: 'start' }],
    nodes: { start: { speaker: GN, text: 'The axes are laid out. Take your time. Time’s the one thing we’ve got.', next: null } },
  },
  {
    id: 'dialogue:obj-reaver-legion-axe-row', name: 'The Hollow Muster: counting the fallen', scope: 'party',
    entries: [{ when: stage('quest:reaver-the-hollow-muster', 'count'), node: 'row' }, { node: 'plain' }],
    nodes: {
      row: { speaker: 'narrator', text: 'Nineteen axes laid in a row on the Legion’s trampled ground, heads all one way, the way the Muster lays them out on the morning after. Behind each axe, a Reaver, standing.', next: 'begin' },
      begin: { speaker: 'narrator', text: 'You start at the left, the old way: name, rank, and the line they held. “Ginnet, first rank, the north gap.” She stays standing. She means to be last.', next: 'names' },
      names: {
        speaker: 'narrator', text: '“Dace Tuller, first rank, the north gap. Morag Baines, shield-bearer.” On and on. At every name, a Reaver sits down beside their axe, and lies down, and is still. It is the gentlest thing you have ever seen the Heart do.',
        choices: [
          { text: '(Count them all, to the last.)', to: 'last' },
          { text: '(Count Hask too, though he isn’t here.)', to: 'hask', when: { flag: 'reaver.nemesis_fate', op: '==', value: 'destroyed' } },
        ],
      },
      hask: { speaker: 'narrator', mood: 'sad', text: '“Hask, son of Brenna, shield-sibling. The line he held was his mother’s door.” Nobody lies down for that one. But Ginnet nods, as if it was the name she had been waiting for.', next: 'last' },
      last: { speaker: GN, text: '(Ginnet lies down beside her axe with her shield on her chest, the way the Muster buries.) Counted. Good. Go on, sib. Go home, after.', effects: [{ setFlag: 'reaver.muster_counted', value: true }, { trust: BR, delta: 1 }], next: null },
      plain: { speaker: 'narrator', text: 'Nineteen axes in a row, and nineteen Reavers lying beside them, at rest.', next: null },
    },
  },

  // ======================= ACT III, The Peace-Axe’s Edge: the old mark at the top of the stairs
  beat('reaver-stair-mark', 'The Peace-Axe’s Edge: the old mark', stage('quest:reaver-the-peace-axes-edge', 'socket'),
    'Beside a crack in the top stair, worn almost smooth, someone has cut the Muster’s rally-mark: an axe over a line, the axe cut first, the right way round. Under it, older and fainter still, the seal of the Concord.',
    'reaver.socket_found', 'An old mark on the top stair.',
    'The crack isn’t a crack. It is a socket, cut square, exactly as wide as a haft that was never sharpened. Somebody from the Muster stood here a thousand years ago and made a place for the peace-axe. And then nobody brought it.'),
];

export default dialogues;
