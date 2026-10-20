/**
 * Hollow Crown: the SHADE campaign (docs/lore/hollow-crown/06-outlines/umbral.md). Act I in the Veilwarrens
 * (area:umbral-frontier), the Act II class thread in Concordia and the Act III class quests at the Heart. From I-1 the hero casts no shadow
 * (shade.shadowless, until the Shadow is spared at III-4): Claude 2/3 turn the hero's ground shadow off while it
 * is set, and Shadowstep only works by borrowing someone else's. Owner: Claude 4.
 */
import type { NarrativeCondition, QuestDef } from '@/core';

const SHA: NarrativeCondition = { heroClass: 'shade' };
const done = (q: `quest:${string}`): NarrativeCondition => ({ questCompleted: q });
const req = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: [SHA, ...c] });
const A1 = { act: 'act1' as const, campaign: 'shade', chapter: 'The Veilwarrens' };
const A2 = { act: 'act2' as const, campaign: 'shade', chapter: 'Concordia' };
const A3 = { act: 'act3' as const, campaign: 'shade', chapter: 'The Heart' };
const Z1 = 'zone:umbral-frontier-1' as const, Z2 = 'zone:umbral-frontier-2' as const, Z3 = 'zone:umbral-frontier-3' as const, Z4 = 'zone:umbral-frontier-4' as const;
const L1 = 'inst:umbral-frontier-lair-1' as const, L2 = 'inst:umbral-frontier-lair-2' as const, L3 = 'inst:umbral-frontier-lair-3' as const;
const GM = 'npc:grey-mab' as const, SH = 'npc:shadow-that-left' as const, BT = 'npc:bryn-tallow' as const;
const TC = 'npc:tibbet-crumb' as const, WS = 'npc:wilhelmina-spool' as const, CG = 'npc:constance-gentle' as const;
const BTH = 'npc:bryn-tallow-heart' as const;

const quests: QuestDef[] = [
  // ======================= ACT I: main (I-1 … I-10)
  {
    ...A1, id: 'quest:shade-the-bell-on-the-bridges', name: 'The Bell on the Bridges', type: 'main', region: Z1, giver: GM,
    summary: 'A night lift on the rope bridges of the Veilwarrens. Halfway across, a bell rang from very far away, every lantern in the warrens guttered, and your shadow stood up off the planks, bowed, and walked away without you.',
    requires: SHA, autoStart: true, firstStage: 'lift',
    stages: [
      {
        id: 'lift', journal: 'A fat purse on a fat merchant, halfway across the third bridge. Grey Mab, your teacher, is watching from the rail. Lift it.',
        onEnter: [{ openDialogue: 'dialogue:shade-bridges-night' }],
        objectives: [{ id: 'purse', text: 'Lift the merchant’s purse on the third bridge', interact: 'obj:bridge-mark-purse', marker: { landmark: 'landmark:rope-bridges' } }],
        onComplete: [{ setFlag: 'shade.shadowless', value: true }],
        next: 'borrow',
      },
      {
        id: 'borrow', journal: 'Your shadow is gone. The merchant is shouting. A Shade steps through her own shadow to get away; you have none to step through. Borrow one: the bridge-post’s will do.',
        objectives: [{ id: 'post', text: 'Shadowstep away through the bridge-post’s shadow', interact: 'obj:bridge-post-shadow', marker: { landmark: 'landmark:rope-bridges' } }],
        next: 'mab',
      },
      {
        id: 'mab', journal: 'You got away. You are standing in a lantern’s light with nothing behind you on the wall. Grey Mab is coming down the ladder, very fast for somebody that old.',
        objectives: [{ id: 'mab', text: 'Face Grey Mab', talk: GM, marker: { landmark: 'landmark:rope-bridges' } }],
        onComplete: [{ setFlag: 'shade.bell_heard', value: true }],
        next: 'bunk',
      },
      {
        id: 'bunk', journal: 'Mab has sent you to bed. Your bunk in the Veil hall, where Mab’s thieves sleep, is exactly as you left it, except that somebody has left a note on the pillow, and there is only one somebody it could be.',
        objectives: [{ id: 'note', text: 'Read the note on your bunk in the Veil hall', interact: 'obj:shade-bunk-note', marker: { landmark: 'landmark:shade-bunk' } }],
        onComplete: [{ startQuest: 'quest:shade-mabs-toll' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-nocturne', 'lore:hc-the-veil'] },
  },
  {
    ...A1, id: 'quest:shade-mabs-toll', name: 'Mab’s Toll', type: 'main', region: Z2, giver: GM,
    summary: 'Grey Mab has sent you down to the Webbed Deeps to collect the Veil’s toll from the silk-cutters, shadow or no shadow. “A thief without a shadow,” she says, “is a thief with one less witness.”',
    requires: req(done('quest:shade-the-bell-on-the-bridges')), firstStage: 'spool',
    stages: [
      {
        id: 'spool', journal: 'The Cutter-Mother of the silk-cutters, Wilhelmina Spool, pays the Veil’s toll. Usually. Grudgingly. In silk.',
        objectives: [{ id: 'spool', text: 'Collect the toll from the Cutter-Mother at the silk-cutters’ camp', talk: WS, marker: { landmark: 'landmark:silk-cutters-camp' } }],
        next: 'spiders',
      },
      {
        id: 'spiders', journal: 'Half the cutters have lost their shadows too, and the Night Spiders in the silk have gone hollow. Black tears are pooling wherever a shadow used to stand.',
        objectives: [{ id: 'spiders', text: 'Clear the hollow Night Spiders from the silk', kill: 'bx_umbral_1', count: 4, marker: { place: Z2 } }],
        next: 'pools',
      },
      {
        id: 'pools', journal: 'Black tears are pooling in the silk-cutters’ camp, each one exactly where somebody’s shadow used to stand. Spool says to look, if you must, and not to step in them.',
        objectives: [{ id: 'pools', text: 'Look at the black pools in the cutters’ camp', interact: 'obj:shade-tear-pool-*', count: 3, marker: { landmark: 'landmark:silk-cutters-camp' } }],
        next: 'mab',
      },
      {
        id: 'mab', journal: 'The toll is paid, in silk, and the cutters are cutting again.',
        objectives: [{ id: 'mab', text: 'Bring Mab the toll', talk: GM, marker: { landmark: 'landmark:mab-nest' } }],
        onComplete: [{ startQuest: 'quest:shade-nothing-to-hunt' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40, hcItems: [{ item: 'i_silk', qty: 3 }] },
  },
  {
    ...A1, id: 'quest:shade-nothing-to-hunt', name: 'Nothing to Hunt', type: 'main', region: Z4, giver: BT,
    summary: 'The moor shepherds’ flocks are vanishing off the Stalker Moors. The Moon Stalker hunts by shadow, so it cannot see you at all. It can, unfortunately, smell you.',
    requires: req(done('quest:shade-mabs-toll')), firstStage: 'bryn',
    stages: [
      {
        id: 'bryn', journal: 'Up the long ladder to the Stalker Moors, where Bryn Tallow keeps his sheep. He has fewer every morning.',
        objectives: [{ id: 'bryn', text: 'Find Bryn Tallow at his fold', talk: BT, marker: { landmark: 'landmark:tallow-fold' } }],
        next: 'den',
      },
      {
        id: 'den', journal: 'The Stalker’s den is a hollow on the moor, ringed with tufts of fleece.',
        objectives: [{ id: 'enter', text: 'Go down into the Stalker’s Den', reach: L1, marker: { place: Z4 } }],
        next: 'lanterns',
      },
      {
        id: 'lanterns', journal: 'It hunts by shadow. Light the decoy lanterns round the den, so it has shadows to pounce on that are not yours, because yours is not there.',
        objectives: [{ id: 'lanterns', text: 'Light the decoy lanterns', interact: 'obj:shade-decoy-lantern-*', count: 4 }],
        next: 'stalker',
      },
      {
        id: 'stalker', journal: 'It is pouncing on the lanterns’ shadows. Strike while it does.',
        objectives: [{ id: 'stalker', text: 'Defeat the Moon Stalker', kill: 'bx_umbral_3', count: 1 }],
        next: 'report',
      },
      {
        id: 'report', journal: 'The Stalker is down, and the moor is quiet.',
        objectives: [{ id: 'bryn', text: 'Tell Bryn his flock is safe', talk: BT, marker: { landmark: 'landmark:tallow-fold' } }],
        onComplete: [{ setFlag: 'shade.stalker_down', value: true }, { startQuest: 'quest:shade-a-stranger-at-the-moonwell' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 80, hcItems: [{ item: 'i_scroll_umbral', qty: 2 }], lore: ['lore:hc-stalker-moors'] },
  },
  {
    ...A1, id: 'quest:shade-a-stranger-at-the-moonwell', name: 'A Stranger at the Moonwell', type: 'main', region: Z3, giver: GM,
    summary: 'Someone at the Moonwell market is wearing your hood and telling the crowd your most embarrassing childhood stories, and the crowd loves it.',
    requires: req(done('quest:shade-nothing-to-hunt')), firstStage: 'market',
    stages: [
      {
        id: 'market', journal: 'Down the spiral to the Moonwell, the warrens’ only market, at the bottom of a shaft where the moon is seen from below.',
        objectives: [{ id: 'market', text: 'Go down to the Moonwell market', reach: 'landmark:moonwell-market', marker: { landmark: 'landmark:moonwell-market' } }],
        next: 'shadow',
      },
      {
        id: 'shadow', journal: 'It is you. Or the shape of you, filled in dark, in your hood, telling the story about the goose.',
        objectives: [{ id: 'shadow', text: 'Speak to the stranger in your hood', talk: SH, marker: { landmark: 'landmark:moonwell-market' } }],
        onComplete: [{ setFlag: 'shade.shadow_met', value: true }],
        next: 'mab',
      },
      {
        id: 'mab', journal: 'Mab was at the back of the crowd. She did not laugh at the goose story.',
        objectives: [{ id: 'mab', text: 'Find Mab at the Moonwell', talk: GM, marker: { landmark: 'landmark:moonwell-market' } }],
        onComplete: [{ startQuest: 'quest:shade-pasts-for-sale' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-moonwell'] },
  },
  {
    ...A1, id: 'quest:shade-pasts-for-sale', name: 'Pasts for Sale', type: 'main', region: Z3, giver: GM,
    summary: 'The Duskblade Cult has opened a stall at the Moonwell selling stolen pasts, and the warrens folk, who forget fastest and own least, are queueing to buy. Whatever you choose, your Shadow will take the other side, loudly.',
    requires: req(done('quest:shade-a-stranger-at-the-moonwell')), firstStage: 'canvass',
    stages: [
      {
        id: 'canvass', journal: 'Before you touch the stall, hear the two people at the Moonwell who know what a past is worth: Isidore Pale, who collects them for the Keepers, and Madam Quince, who fences them.',
        objectives: [
          { id: 'isidore', text: 'Hear Isidore Pale out', talk: 'npc:isidore-pale', marker: { landmark: 'landmark:moonwell-market' } },
          { id: 'quince', text: 'Hear Madam Quince out', talk: 'npc:madam-quince', marker: { landmark: 'landmark:quince-stall' } },
        ],
        next: 'stall',
      },
      {
        id: 'stall', journal: 'Mab wants the stall robbed. The Keepers’ collector, Isidore Pale, wants the pasts sent home. The queue just wants to be somebody.',
        objectives: [{ id: 'stall', text: 'Decide what to do about the Duskblade stall', when: { flag: 'shade.moonwell' }, marker: { landmark: 'landmark:moonwell-market' } }],
        next: 'after',
      },
      {
        id: 'after', journal: 'The decision is made. Now somebody has to do it.',
        objectives: [{ id: 'stall', text: 'Deal with the Duskblade stall', interact: 'obj:duskblade-stall', marker: { landmark: 'landmark:moonwell-market' } }],
        onComplete: [{ startQuest: 'quest:shade-the-quiet-deeps' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-duskblade-cult'] },
  },
  {
    ...A1, id: 'quest:shade-the-quiet-deeps', name: 'The Quiet Deeps', type: 'main', region: Z2, giver: GM,
    summary: 'The warrens have gone silent. Every whistle-signal in the Webbed Deeps has stopped, as if something ate them. Your Shadow has already gone in.',
    requires: req(done('quest:shade-pasts-for-sale')), firstStage: 'spire',
    stages: [
      {
        id: 'spire', journal: 'The silence is coming out of the Brood Spire, a tower of silk at the bottom of the Deeps.',
        objectives: [{ id: 'enter', text: 'Climb into the Brood Spire', reach: L2, marker: { place: Z2 } }],
        next: 'hushweb',
      },
      {
        id: 'hushweb', journal: 'Mother Hushweb eats sound. Your footsteps give you away. Throw stones at the hanging bells, and strike while she lunges to eat the ringing.',
        objectives: [{ id: 'hushweb', text: 'Defeat Mother Hushweb', kill: 'cb_mother-hushweb', count: 1 }],
        next: 'whistles',
      },
      {
        id: 'whistles', journal: 'Hanging in the silk at the top of the Spire is a fat white sac, humming very faintly.',
        objectives: [{ id: 'sac', text: 'Cut open the sac of eaten sounds', interact: 'obj:hushweb-eaten-whistles' }],
        next: 'mab',
      },
      {
        id: 'mab', journal: 'The warrens can hear again. Every whistle anyone blew this month is still echoing down the tunnels.',
        objectives: [{ id: 'mab', text: 'Report to Mab', talk: GM, marker: { landmark: 'landmark:mab-nest' } }],
        onComplete: [{ startQuest: 'quest:shade-two-of-you' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 120, lore: ['lore:hc-veil-whistles'] },
  },
  {
    ...A1, id: 'quest:shade-two-of-you', name: 'Two of You', type: 'main', region: Z1, giver: SH,
    summary: 'Somebody has signed your name in Mab’s ledger in the Veil’s hall, in your own hand. Mab says you did it this morning. You did not do it this morning.',
    requires: req(done('quest:shade-the-quiet-deeps')), firstStage: 'ledger',
    stages: [
      {
        id: 'ledger', journal: 'The Veil’s ledger lies open in the ledger-hall. Every Shade signs it for every job.',
        objectives: [{ id: 'ledger', text: 'Read the Veil’s ledger', interact: 'obj:veil-ledger', marker: { landmark: 'landmark:veil-ledger-hall' } }],
        next: 'shadow',
      },
      {
        id: 'shadow', journal: 'Your Shadow is sitting in your seat at the ledger-hall table, with its feet up, waiting for you.',
        objectives: [{ id: 'shadow', text: 'Face your Shadow in the ledger-hall', talk: SH, marker: { landmark: 'landmark:veil-ledger-hall' } }],
        next: 'parcel',
      },
      {
        id: 'parcel', journal: '“One parcel, contents private, to the Dusk road.” Your Shadow signed for it in your hand. The Veil’s drop on the Dusk road is a hollow tree halfway to the gate. It will still be there.',
        objectives: [{ id: 'parcel', text: 'Find the parcel at the Veil’s drop on the Dusk road', interact: 'obj:shade-shadow-parcel', marker: { landmark: 'landmark:shade-dusk-drop' } }],
        next: 'mab',
      },
      {
        id: 'mab', journal: 'It told Mab it loved her. You have never said that to Mab.',
        objectives: [{ id: 'mab', text: 'Talk to Mab', talk: GM, marker: { landmark: 'landmark:mab-nest' } }],
        onComplete: [{ setFlag: 'shade.shadow_turned', value: true }, { startQuest: 'quest:shade-the-veil-heart' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-shadow-that-left'] },
  },
  {
    ...A1, id: 'quest:shade-the-veil-heart', name: 'The Veil Heart', type: 'main', region: L3, giver: GM,
    summary: 'A half-stone sings for its bearer. If the Veil half sings for your Shadow, your Shadow is the real one. It has gone down to the deepest chamber of the warrens to find out.',
    requires: req(done('quest:shade-two-of-you')), firstStage: 'heart',
    stages: [
      {
        id: 'heart', journal: 'Down to the Veil Heart, the deepest chamber in the warrens, black as the inside of a pocket.',
        objectives: [{ id: 'enter', text: 'Go down into the Veil Heart', reach: L3, marker: { place: Z1 } }],
        next: 'lanterns',
      },
      {
        id: 'lanterns', journal: 'In the dark it cannot be hurt. Light makes it solid. Drag the lanterns in.',
        objectives: [{ id: 'lanterns', text: 'Light the Veil Heart’s lanterns', interact: 'obj:veil-heart-lantern-*', count: 3 }],
        next: 'shadow',
      },
      {
        id: 'shadow', journal: 'It moves when you move, a beat before you do. It is very good at being you.',
        objectives: [{ id: 'shadow', text: 'Defeat the Shadow That Left', kill: 'cb_shadow-that-left', count: 1 }],
        next: 'stone',
      },
      {
        id: 'stone', journal: 'The Shadow is beaten, and one lantern is still standing. The Veil half is lying on the floor of the Heart, singing to you, and only to you.',
        objectives: [{ id: 'stone', text: 'Take up the Veil half', interact: 'obj:umbral-frontier-halfstone' }],
        onComplete: [{ setFlag: 'shade.halfstone', value: true }, { startQuest: 'quest:shade-mabs-last-lesson' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, skillPoints: 1, lore: ['lore:hc-half-stones'] },
  },
  {
    ...A1, id: 'quest:shade-mabs-last-lesson', name: 'Mab’s Last Lesson', type: 'main', region: Z4, giver: GM,
    summary: 'Your Shadow has gone towards the Dusk Gate the way shadows go when the lantern falls. Mab is walking you across the Stalker Moors to the gate road, complaining the whole way.',
    requires: req(done('quest:shade-the-veil-heart')), firstStage: 'walk',
    stages: [
      {
        id: 'walk', journal: 'Mab is walking you across the Stalker Moors to the gate road, complaining the whole way. She is old, the moor is wide, and the hollowed things the Shadow left behind are out in the heather. Keep her safe as far as the edge.',
        onEnter: [{ escort: 'npc:grey-mab', to: 'landmark:shade-moor-edge' }],
        objectives: [{ id: 'mab', text: 'See Mab safely across the moor to its edge', when: { any: [{ flag: 'escort.grey-mab', op: '==', value: 'arrived' }, { flag: 'escort.grey-mab', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:shade-moor-edge' } }],
        next: [{ when: { flag: 'escort.grey-mab', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'farewell' }],
      },
      {
        id: 'regroup', journal: 'Mab went down in the heather, swearing, and Bryn Tallow carried her to his fold over his shoulder like a ewe. She has had a cup of tea and is ready to try again, and says so at length.',
        onEnter: [{ escort: 'npc:grey-mab', to: 'landmark:shade-moor-edge' }],
        objectives: [{ id: 'mab', text: 'Try again: see Mab across the moor', when: { any: [{ flag: 'escort.grey-mab', op: '==', value: 'arrived' }, { flag: 'escort.grey-mab', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:shade-moor-edge' } }],
        next: [{ when: { flag: 'escort.grey-mab', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'farewell' }],
      },
      {
        id: 'farewell', journal: 'The edge of the Stalker Moors, where the heather stops and the gate road starts. Mab has stopped walking, which means this is as far as she goes.',
        objectives: [{ id: 'mab', text: 'Say goodbye to Mab at the edge of the moor', talk: GM, marker: { landmark: 'landmark:shade-moor-edge' } }],
        onComplete: [{ setFlag: 'shade.mab_farewell', value: true }],
        next: 'road',
      },
      {
        id: 'road', journal: 'The gate road runs off the moors towards a sky where the moon is half gone.',
        objectives: [{ id: 'gate', text: 'Take the gate road to the Dusk Gate', reach: 'area:umbral-gate', marker: { place: 'area:umbral-gate' } }],
        onComplete: [{ startQuest: 'quest:shade-the-dusk-gate' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:shade-the-dusk-gate', name: 'The Dusk Gate (warrens side)', type: 'main', region: 'area:umbral-gate', giver: GM,
    summary: 'The Eclipse Queen’s eclipse swallows every shadow in the world. You are the one thing in Nocturne she cannot eat.',
    requires: req(done('quest:shade-mabs-last-lesson')), firstStage: 'queen',
    stages: [
      {
        id: 'queen', journal: 'Her eclipse drowns the arena in shadow and eats every borrowed one. You have none to eat. Climb the rim of her eclipse unseen, and strike the moon loose.',
        onEnter: [{ openDialogue: 'dialogue:shade-eclipse-queen' }],
        objectives: [{ id: 'queen', text: 'Strike the moon loose from the Eclipse Queen', kill: 'bx_umbral_5', count: 1 }],
        next: 'gate',
      },
      {
        id: 'gate', journal: 'The moon is back. There is light enough in Nocturne to cast a shadow, for everyone but you.',
        objectives: [{ id: 'seal', text: 'Open the Dusk Gate with the half-stone', interact: 'obj:umbral-gate-seal' }],
        onComplete: [{ setFlag: 'story.gate_open', value: true }, { setFlag: 'story.act', value: 2 }, { setFlag: 'shade.act1_done', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 200, lore: ['lore:hc-realm-gates', 'lore:hc-eclipse-queen'] },
  },

  // ======================= ACT I: side quests (2 per zone)
  {
    ...A1, id: 'quest:shade-rope-toll', name: 'Rope Toll', type: 'side', region: Z1, giver: 'npc:nettle-crook',
    summary: 'Nettle Crook, aged twelve, runs the busiest bridge in the warrens and charges a toll she writes in a ledger she cannot read. The next bridge has started undercutting her.',
    requires: req(done('quest:shade-the-bell-on-the-bridges')), firstStage: 'ledger',
    stages: [
      {
        id: 'ledger', journal: 'Look at Nettle’s toll-ledger. She says it is all perfectly clear.',
        objectives: [{ id: 'ledger', text: 'Read Nettle’s toll-ledger', interact: 'obj:nettle-toll-ledger', marker: { landmark: 'landmark:nettle-bridge' } }],
        next: 'nettle',
      },
      {
        id: 'nettle', journal: 'It is pictures. Very good pictures. Of people who owe her money.',
        objectives: [{ id: 'nettle', text: 'Settle Nettle’s toll war', when: { flag: 'shade.nettle' }, marker: { landmark: 'landmark:nettle-bridge' } }],
        next: 'fen',
      },
      {
        id: 'fen', journal: 'However it was settled, Nettle wants it seen. Fen Doyle’s bridge is two crossings along, with a hole in it the size of a goat. Go and look at what the war has come to.',
        objectives: [{ id: 'fen', text: 'Look at Fen Doyle’s bridge', interact: 'obj:shade-fen-bridge', marker: { landmark: 'landmark:shade-fen-bridge' } }],
        onComplete: [{ setFlag: 'shade.fen_seen', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 30 },
  },
  {
    ...A1, id: 'quest:shade-the-puppet-show', name: 'The Puppet Show', type: 'side', region: Z1, giver: 'npc:ludo-fingle',
    summary: 'Ludo Fingle’s shadow-puppet show of the signing of the Concord needs a hero, and his hero puppet has walked off. He has had a terrible idea, and it involves you.',
    requires: req(done('quest:shade-the-bell-on-the-bridges')), firstStage: 'show',
    stages: [
      {
        id: 'show', journal: 'Stand behind Ludo’s screen and be the hero. You cast no shadow. Ludo says this is a detail.',
        objectives: [{ id: 'show', text: 'Play the hero in Ludo’s puppet show', interact: 'obj:ludo-puppet-stage', marker: { landmark: 'landmark:ludo-puppet-booth' } }],
        next: 'ludo',
      },
      {
        id: 'ludo', journal: 'The show is over. It is possible that nobody has ever seen anything like it.',
        objectives: [{ id: 'ludo', text: 'Talk to Ludo after the show', talk: 'npc:ludo-fingle', marker: { landmark: 'landmark:ludo-puppet-booth' } }],
        next: 'puppet',
      },
      {
        id: 'puppet', journal: 'Ludo’s hero puppet walked off on the night of the Bell, shadow and all. A puppet-shaped bundle has been seen on the Moonwell steps, left very carefully where somebody would find it.',
        objectives: [{ id: 'puppet', text: 'Find Ludo’s lost hero puppet on the Moonwell steps', interact: 'obj:shade-hero-puppet', marker: { landmark: 'landmark:shade-moonwell-steps' } }],
        onComplete: [{ setFlag: 'shade.puppet_found', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40 },
  },
  {
    ...A1, id: 'quest:shade-agnes-in-the-silk', name: 'Agnes in the Silk', type: 'side', region: Z2, giver: WS,
    summary: 'Silk-cutter Agnes Threadneedle has been missing for three days in the Webbed Deeps. The Cutter-Mother is worried, and furious, which in the Deeps is the same face.',
    requires: req(done('quest:shade-mabs-toll')), firstStage: 'cocoon',
    stages: [
      {
        id: 'cocoon', journal: 'Somewhere in the lower silk there is a cocoon with Agnes in it. You hope.',
        objectives: [{ id: 'cocoon', text: 'Find Agnes in the silk', interact: 'obj:agnes-cocoon', marker: { place: Z2 } }],
        next: 'agnes',
      },
      {
        id: 'agnes', journal: 'Alive. Sulking. She has walked back to the camp without you, to complain.',
        objectives: [{ id: 'agnes', text: 'Talk to Agnes at the silk-cutters’ camp', talk: 'npc:agnes-threadneedle', marker: { landmark: 'landmark:silk-cutters-camp' } }],
        next: 'spool',
      },
      {
        id: 'spool', journal: 'Three days Agnes hung in the silk while the cutters argued whose turn it was. She will not say thank you until somebody says sorry, and the somebody is the Cutter-Mother.',
        objectives: [{ id: 'spool', text: 'Tell the Cutter-Mother what Agnes is owed', talk: 'npc:wilhelmina-spool', marker: { landmark: 'landmark:silk-cutters-camp' } }],
        onComplete: [{ setFlag: 'shade.spool_sorry', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_silk', qty: 2 }] },
  },
  {
    ...A1, id: 'quest:shade-echoes-for-sale', name: 'Echoes for Sale', type: 'side', region: Z2, giver: 'npc:silvan-hollowell',
    summary: 'The echo-traders of the Deeps bottle echoes and sell them up the warrens. Something has been eating their stock: Silvan Hollowell opens his jars and there is nothing in them, not even quiet.',
    requires: req(done('quest:shade-mabs-toll')), firstStage: 'jars',
    stages: [
      {
        id: 'jars', journal: 'Open three of Silvan’s echo-jars and listen.',
        objectives: [{ id: 'jars', text: 'Listen to the echo-jars', interact: 'obj:echo-jar-*', count: 3, marker: { landmark: 'landmark:echo-traders-stall' } }],
        next: 'silvan',
      },
      {
        id: 'silvan', journal: 'The third jar still had something in it: the end of a whistle-signal, cut off as if bitten.',
        objectives: [{ id: 'silvan', text: 'Tell Silvan what you heard', talk: 'npc:silvan-hollowell', marker: { landmark: 'landmark:echo-traders-stall' } }],
        next: 'call',
      },
      {
        id: 'call', journal: 'The bitten echo was the Veil’s long call, come quick, and somebody whistled it in the Deeps before the quiet ate it. The old whistle-post in the Deeps keeps the last call made from it, if you know how to ask.',
        objectives: [{ id: 'post', text: 'Ask the Deeps’ whistle-post who called for help', interact: 'obj:shade-whistle-post', marker: { landmark: 'landmark:shade-whistle-post' } }],
        onComplete: [{ setFlag: 'shade.call_traced', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 50 },
  },
  {
    ...A1, id: 'quest:shade-a-fair-price', name: 'A Fair Price', type: 'side', region: Z3, giver: 'npc:madam-quince',
    summary: 'Madam Quince, the oldest fence in the warrens, would like to buy your spare name. Somebody without a shadow, she reasons, obviously does not need two.',
    requires: req(done('quest:shade-a-stranger-at-the-moonwell')), firstStage: 'deal',
    stages: [
      {
        id: 'deal', journal: 'Madam Quince has named her price. Haggle, sell, or rob her blind.',
        objectives: [{ id: 'deal', text: 'Settle the deal with Madam Quince', when: { flag: 'shade.quince' }, marker: { landmark: 'landmark:quince-stall' } }],
        next: 'drawer',
      },
      {
        id: 'drawer', journal: 'Whatever you did with your kept name, Madam Quince’s drawer of names is still open on her counter, and she has gone to fetch a lamp. Have a look. Everybody does.',
        objectives: [{ id: 'drawer', text: 'Look in Madam Quince’s drawer of names', interact: 'obj:shade-quince-drawer', marker: { landmark: 'landmark:quince-stall' } }],
        onComplete: [{ setFlag: 'shade.drawer_seen', value: true }],
        next: 'mab',
      },
      {
        id: 'mab', journal: 'The oldest slip in Madam Quince’s drawer says Mabyn. Sold forty years ago, by a girl just down from Duskmere, and never sold on. There is only one person to ask about that, and she will not thank you for it.',
        objectives: [{ id: 'mab', text: 'Ask Mab about the name in Quince’s drawer', talk: GM, marker: { landmark: 'landmark:mab-nest' } }],
        onComplete: [{ setFlag: 'shade.mabyn_asked', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 60 },
  },
  {
    ...A1, id: 'quest:shade-seen-from-below', name: 'Seen from Below', type: 'side', region: Z3, giver: 'npc:twig-and-moss',
    summary: 'The twins Twig and Moss have only ever seen the moon from the bottom of the Moonwell, a coin of light at the end of a long pipe. They would like to see it properly. Once.',
    requires: req(done('quest:shade-nothing-to-hunt')), firstStage: 'moors',
    stages: [
      {
        id: 'moors', journal: 'Up the long ladder to the Stalker Moors with the twins, to the rock where the moon comes up, at night.',
        objectives: [{ id: 'moon', text: 'Show the twins the moonrise on the moors', when: { flag: 'shade.twins_moon' }, marker: { landmark: 'landmark:moonrise-rock' } }],
        next: 'twins',
      },
      {
        id: 'twins', journal: 'They saw it. They have not stopped talking since.',
        objectives: [{ id: 'twins', text: 'See the twins home to the Moonwell', talk: 'npc:twig-and-moss', marker: { landmark: 'landmark:moonwell-market' } }],
        next: 'mam',
      },
      {
        id: 'mam', journal: 'Moss brought a pebble down off the moonrise rock, for Mam, who has never been up either. Mam is out at work. Their door is the green one at the bottom of the shaft.',
        objectives: [{ id: 'door', text: 'Leave Moss’s moon-pebble at the twins’ door', interact: 'obj:shade-twins-door', marker: { landmark: 'landmark:shade-twins-door' } }],
        onComplete: [{ setFlag: 'shade.twins_pebble', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:shade-the-shepherds-shadow', name: 'The Shepherd’s Shadow', type: 'side', region: Z4, giver: BT,
    summary: 'Bryn Tallow lost his shadow last spring and is cheerful about it. He is the first other shadowless person you have met, and he has a different answer.',
    requires: req(done('quest:shade-nothing-to-hunt')), firstStage: 'fold',
    stages: [
      {
        id: 'fold', journal: 'Help Bryn shut the fold for the night. His sheep can’t see him coming either; he says they’ve grown to like it.',
        objectives: [{ id: 'gate', text: 'Shut Bryn’s fold-gate', interact: 'obj:tallow-fold-gate', marker: { landmark: 'landmark:tallow-fold' } }],
        next: 'bryn',
      },
      {
        id: 'bryn', journal: 'The sheep are in. Bryn has lit his pipe and is sitting on the wall, casting nothing on it.',
        objectives: [{ id: 'bryn', text: 'Sit on the wall with Bryn', talk: BT, marker: { landmark: 'landmark:tallow-fold' } }],
        next: 'mark',
      },
      {
        id: 'mark', journal: 'Bryn’s shadow walked off over the high moor last spring, and he knows exactly where its footprints stop. He would like a stone set there. He has views on what it should say.',
        objectives: [{ id: 'mark', text: 'Set a stone where Bryn’s shadow went', interact: 'obj:shade-bryn-shadow-mark', marker: { landmark: 'landmark:shade-bryn-shadow-mark' } }],
        onComplete: [{ setFlag: 'shade.bryn_stone', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_cheese', qty: 2 }] },
  },
  {
    ...A1, id: 'quest:shade-cairn-of-the-unshadowed', name: 'Cairn of the Unshadowed', type: 'side', region: Z4, giver: BT,
    summary: 'There is an old cairn on the moors where the Veil buried the Shades who lost their shadows. Bryn says one of the stones is older than all the rest.',
    requires: req(done('quest:shade-nothing-to-hunt')), firstStage: 'cairn',
    stages: [
      {
        id: 'cairn', journal: 'The Cairn of the Unshadowed, a long heap of stones on the high moor, each one scratched with a name and nothing else.',
        objectives: [{ id: 'stone', text: 'Read the oldest stone on the cairn', interact: 'obj:unshadowed-founder-stone', marker: { landmark: 'landmark:cairn-of-the-unshadowed' } }],
        next: 'bryn',
      },
      {
        id: 'bryn', journal: 'The Veil’s founder lost her shadow, and went on anyway.',
        objectives: [{ id: 'bryn', text: 'Tell Bryn what the stone says', talk: BT, marker: { landmark: 'landmark:tallow-fold' } }],
        next: 'mab',
      },
      {
        id: 'mab', journal: 'HERE LIES THE UNLISTED. Bryn says if anyone in the warrens knows who the Unlisted was, it is Grey Mab, and that she will deny it.',
        objectives: [{ id: 'mab', text: 'Ask Mab about the founder’s stone', talk: GM, marker: { landmark: 'landmark:mab-nest' } }],
        onComplete: [{ setFlag: 'shade.founder_told', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-unshadowed'] },
  },

  // ======================= ACT I: mentor thread (2) and bounties (2)
  {
    ...A1, id: 'quest:shade-mabs-ledger', name: 'Mab’s Ledger', type: 'side', region: Z1, giver: GM,
    summary: 'Mab keeps a black book of every shadow the Veil ever lifted, back when the Veil’s trade was hiding people from the Concord’s tax-men. She has, against all her principles, said you may read it.',
    requires: req({ trust: GM, value: 'friendly' }, done('quest:shade-mabs-toll')), firstStage: 'book',
    stages: [
      {
        id: 'book', journal: 'The black book is in Mab’s nest, under the loose board, under the other loose board.',
        objectives: [{ id: 'book', text: 'Read Mab’s black book', interact: 'obj:mab-black-book', marker: { landmark: 'landmark:mab-nest' } }],
        next: 'mab',
      },
      {
        id: 'mab', journal: 'The margins are full of Mab’s notes, in a small fierce hand.',
        objectives: [{ id: 'mab', text: 'Talk to Mab about the margins', talk: GM, marker: { landmark: 'landmark:mab-nest' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, skillPoints: 1 },
  },
  {
    ...A1, id: 'quest:shade-the-letter-mab-never-opened', name: 'The Letter Mab Never Opened', type: 'side', region: Z1, giver: GM,
    summary: 'Forty years ago Mab hid a letter from Duskmere so well that she cannot find it. She would like you to steal it from her. She will be watching, and she will not help.',
    requires: req({ trust: GM, value: 'trusted' }, done('quest:shade-a-stranger-at-the-moonwell')), firstStage: 'steal',
    stages: [
      {
        id: 'steal', journal: 'Somewhere in Mab’s nest, hidden by the best thief in the warrens, is a letter with a Duskmere seal.',
        objectives: [{ id: 'letter', text: 'Steal the hidden letter from Mab’s nest', interact: 'obj:mab-hidden-letter', marker: { landmark: 'landmark:mab-nest' } }],
        next: 'mab',
      },
      {
        id: 'mab', journal: 'You found it. Of course you found it. She taught you.',
        objectives: [{ id: 'mab', text: 'Give Mab the letter', talk: GM, marker: { landmark: 'landmark:mab-nest' } }],
        onComplete: [{ setFlag: 'shade.mab_devotable', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:shade-bounty-bridge-bats', name: 'Bounty: the Bridge Bats', type: 'bounty', region: Z1, giver: TC,
    summary: 'A swarm of Void Bats has been roosting under the rope bridges and dropping on anyone who crosses at night.',
    requires: req(done('quest:shade-the-bell-on-the-bridges')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'Six of them, says Tibbet Crumb, who has counted them by the bites.', objectives: [{ id: 'bats', text: 'Clear the Void Bats from under the bridges', kill: 'bx_umbral_2', count: 6, marker: { landmark: 'landmark:rope-bridges' } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 150 },
  },
  {
    ...A1, id: 'quest:shade-bounty-grandmother-longlegs', name: 'Bounty: Grandmother Longlegs', type: 'bounty', region: Z2, giver: TC,
    summary: 'A Night Spider the size of a cart has been living at the bottom of the Deeps for longer than anyone can remember. Since the Bell, she has started coming up.',
    requires: req(done('quest:shade-mabs-toll')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'Grandmother Longlegs. The cutters say she has eaten three ladders.', objectives: [{ id: 'spider', text: 'Defeat Grandmother Longlegs', kill: 'bx_umbral_1', count: 1, marker: { place: Z2 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 120 },
  },

  // ======================= ACT II: the class thread (C-1 … C-6) + featured bearers
  {
    ...A2, id: 'quest:shade-the-drowned-rat', name: 'The Drowned Rat', type: 'class', region: 'vil:coach', giver: CG,
    summary: 'The Veil has cousins in Concordia. They drink in the back room of the Drowned Rat at the Old Coach Inn, and their fence, Constance Gentle, knows everything that goes missing on the Morvane Road.',
    requires: req(done('quest:cc-through-the-arch')), autoStart: true, firstStage: 'rat',
    stages: [
      {
        id: 'rat', journal: 'Ysolde says the only Umbral folk on the Morvane Road drink at the Drowned Rat, and don’t like being asked why.',
        objectives: [{ id: 'constance', text: 'Find Constance Gentle at the Drowned Rat', talk: CG, marker: { landmark: 'landmark:coach-drowned-rat' } }],
        next: 'room',
      },
      {
        id: 'room', journal: 'Under the floor of the Rat’s back room is the cousins’ hiding-hole, where the Veil of the Morvane Road keeps what it is keeping for people. Constance says you should see it before you go asking about shadows.',
        objectives: [{ id: 'hole', text: 'Look in the hiding-hole under the Drowned Rat', interact: 'obj:shade-rat-hiding-hole', marker: { landmark: 'landmark:coach-drowned-rat' } }],
        next: [
          { when: { flag: 'shade.moonwell', value: 'keepers' }, to: 'after' },
          { to: 'hobb' },
        ],
      },
      {
        id: 'hobb', journal: 'Constance says the sexton at Brindlecross keeps a list of whose shadows have gone missing. He won’t show it to a thief without a reason.',
        objectives: [{ id: 'hobb', text: 'Ask Old Hobb whose shadows have gone', talk: 'npc:hobb', marker: { landmark: 'landmark:brind-graveyard' } }],
        next: 'after',
      },
      {
        id: 'after', journal: 'Every missing shadow on the list was last seen near the Gloamwood, going down, as if something under the roots were reeling them in.',
        objectives: [],
        onComplete: [{ startQuest: 'quest:shade-the-spinners-silk' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-umbral-drowned-rat'] },
  },
  {
    ...A2, id: 'quest:shade-the-spinners-silk', name: 'The Spinner’s Silk', type: 'class', region: 'region:gloam', giver: CG,
    summary: 'Under the Gloamwood, Brindlecross folk’s missing shadows are caught in a web among the Concord’s records. You are looking for one thread in particular.',
    requires: req(done('quest:shade-the-drowned-rat')), firstStage: 'escort',
    stages: [
      {
        id: 'escort', journal: 'Constance’s brother Lorcan lost his shadow on the Brindlecross road, and she means to look for it in the web herself. She is waiting at the root-cave mouth on the edge of the Gloamwood, and she knows the way under the roots. She does not know how to fight what lives there. Keep her alive.',
        onEnter: [{ escort: 'npc:constance-gentle', to: 'landmark:shade-web-edge' }],
        objectives: [{ id: 'constance', text: 'See Constance safely down to the edge of the web', when: { any: [{ flag: 'escort.constance-gentle', op: '==', value: 'arrived' }, { flag: 'escort.constance-gentle', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:shade-web-edge' } }],
        next: [{ when: { flag: 'escort.constance-gentle', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'web' }],
      },
      {
        id: 'regroup', journal: 'Constance went down among the roots, and two Drowned Rat cousins carried her back up to the root-cave mouth, complaining about the weight of her pockets. She has a bandage, a fresh deck of cards and no intention of staying put.',
        onEnter: [{ escort: 'npc:constance-gentle', to: 'landmark:shade-web-edge' }],
        objectives: [{ id: 'constance', text: 'Try again: see Constance down to the web', when: { any: [{ flag: 'escort.constance-gentle', op: '==', value: 'arrived' }, { flag: 'escort.constance-gentle', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:shade-web-edge' } }],
        next: [{ when: { flag: 'escort.constance-gentle', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'web' }],
      },
      {
        id: 'web', journal: 'Shadows hanging in the silk under the roots like washing, kicking. Cut them loose and send them home.',
        objectives: [{ id: 'web', text: 'Cut the caught shadows loose from the web', interact: 'obj:shade-silk-shadow-*', count: 3, marker: { landmark: 'landmark:sentinel-umbral' } }],
        next: 'hear',
      },
      {
        id: 'hear', journal: 'Constance has been watching the shadows run off up the root-caves, counting them under her breath.',
        objectives: [{ id: 'constance', text: 'Hear what Constance saw in the web', talk: CG, marker: { landmark: 'landmark:shade-web-edge' } }],
        next: 'down',
      },
      {
        id: 'down', journal: 'None of them was yours. The web goes down, deeper, to whatever is spinning it.',
        objectives: [{ id: 'lair', text: 'Climb down to the Spinner Below', reach: 'inst:sentinel-umbral', marker: { landmark: 'landmark:sentinel-umbral' } }],
        onComplete: [{ startQuest: 'quest:shade-the-spinner-below' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:shade-the-spinner-below', name: 'The Spinner Below', type: 'class', region: 'region:gloam', giver: CG,
    summary: 'The Spinner Below wove every shadow in the Concord’s records. If anything in Morvane knows where your shadow went, it does.',
    requires: req(done('quest:shade-the-spinners-silk')), firstStage: 'fight',
    stages: [
      {
        id: 'fight', journal: 'The Spinner Below is the Sentinel of the Umbral school. Win its mark.',
        objectives: [{ id: 'spinner', text: 'Defeat the Spinner Below', kill: 'bx_spinner', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-umbral' }],
        next: 'release',
      },
      {
        id: 'release', journal: 'The Spinner has folded its legs under it in the tatters of its web.',
        objectives: [{ id: 'mark', text: 'Hear the Spinner out', when: { flag: 'story.sentinel.umbral' } }],
        onComplete: [{ openDialogue: 'dialogue:shade-spinner-thread' }],
        next: 'tell',
      },
      {
        id: 'tell', journal: 'The web is down, and the Spinner is at rest. Constance is back at the Drowned Rat, pretending not to wait up.',
        objectives: [{ id: 'constance', text: 'Tell Constance the web is down', talk: CG, marker: { landmark: 'landmark:coach-drowned-rat' } }],
        onComplete: [{ startQuest: 'quest:shade-the-shadow-at-stags-rest' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-umbral-spinner'] },
  },
  {
    ...A2, id: 'quest:shade-the-shadow-at-stags-rest', name: 'The Shadow at Stag’s Rest', type: 'class', region: 'region:gloam', giver: CG,
    summary: 'The thread of your shadow runs through the Gloamwood to Stag’s Rest, where the Weeping Willow throws the deepest shade in Morvane. Your Shadow is sheltering there.',
    requires: req(done('quest:shade-the-spinner-below')), firstStage: 'thread',
    stages: [
      {
        id: 'thread', journal: 'The thread is knotted round two trees on the way, where the Shadow stopped to rest. Follow it.',
        objectives: [{ id: 'knots', text: 'Follow your shadow’s thread through the Gloamwood', interact: 'obj:shade-thread-knot-*', count: 2, marker: { region: 'region:gloam' } }],
        next: 'camp',
      },
      {
        id: 'camp', journal: 'Where the thread runs into Stag’s Rest, your Shadow has made a camp, the way you make one: badly, near water, with a lantern. Look it over before you go under the Willow.',
        objectives: [{ id: 'camp', text: 'Search your Shadow’s camp at Stag’s Rest', interact: 'obj:shade-shadow-camp-*', count: 3, marker: { landmark: 'landmark:shade-shadow-camp' } }],
        next: 'willow',
      },
      {
        id: 'willow', journal: 'Under the Willow, in the deepest shade in Morvane, your Shadow is standing very still while two figures made of tears pin a robe on it.',
        objectives: [{ id: 'shadow', text: 'Face your Shadow under the Willow', talk: 'npc:shadow-under-the-willow', marker: { landmark: 'landmark:sentinel-verdant' } }],
        onComplete: [{ startQuest: 'quest:shade-the-weeping-willow' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:shade-the-weeping-willow', name: 'The Weeping Willow', type: 'class', region: 'region:gloam', giver: CG,
    summary: 'The Shadow has gone into the Heart in its new robe, and the Willow it sheltered under is weeping black into the whole wood. The Verdant bearers cannot win her mark while she weeps.',
    requires: req(done('quest:shade-the-shadow-at-stags-rest')), firstStage: 'hollow',
    stages: [
      {
        id: 'hollow', journal: 'Down under the Willow’s branches. You are the one person in Morvane who casts nothing in her shade.',
        objectives: [{ id: 'lair', text: 'Go in under the Weeping Willow', reach: 'inst:sentinel-verdant', marker: { landmark: 'landmark:sentinel-verdant' } }],
        next: 'willow',
      },
      {
        id: 'willow', journal: 'The Weeping Willow is the Sentinel of the Verdant school. Free her, and the Ranger bearer can claim the mark.',
        objectives: [{ id: 'willow', text: 'Free the Weeping Willow', kill: 'bx_willow', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-verdant' }, { setFlag: 'story.bearer.ranger', value: true }],
        next: 'roots',
      },
      {
        id: 'roots', journal: 'The Willow has stopped weeping. Between her roots, where the shade was deepest, something has been left behind for you to find.',
        objectives: [{ id: 'roots', text: 'See what your Shadow left between the Willow’s roots', interact: 'obj:shade-willow-roots' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-shade-willow'] },
  },
  {
    ...A2, id: 'quest:shade-a-parcel-from-mab', name: 'A Parcel from Mab', type: 'class', region: 'vil:brind', giver: GM,
    summary: 'Mab does not write letters. Somebody has come through the Umbral arch with a parcel, and is charging you a toll to hand it over.',
    requires: req(done('quest:shade-the-weeping-willow')), autoStart: true, firstStage: 'parcel',
    stages: [
      {
        id: 'parcel', journal: 'Nettle Crook is at the Gate Circle, sitting on a parcel, with her hand out.',
        objectives: [{ id: 'nettle', text: 'Collect Mab’s parcel at the Gate Circle', talk: 'npc:nettle-crook-gate', marker: { landmark: 'landmark:gate-circle' } }],
        next: 'reply',
      },
      {
        id: 'reply', journal: 'Nettle is going home over the gate road in the morning, and she will carry an answer to Mab for one copper, or for nothing if it is a good one. Write it at the toll-free bridge, where she is sitting in protest.',
        objectives: [{ id: 'reply', text: 'Give Nettle a reply to carry home to Mab', interact: 'obj:shade-reply-to-mab', marker: { landmark: 'landmark:shade-free-bridge' } }],
        onComplete: [{ setFlag: 'story.act2_ready', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:shade-the-dark-is-kind', name: 'The Dark Is Kind', type: 'side', region: 'region:gloam', giver: 'npc:bearer-cantor',
    summary: 'The Cantor bearer has never once let the dark in. Now she has to stand in the Willow’s shade, the deepest in Morvane, and she has asked for somebody who cannot cast any to stand with her.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'shade',
    stages: [
      {
        id: 'shade', journal: 'Stand with Seraphina Dawe in the Willow’s shade until she can bear it.',
        objectives: [{ id: 'shade', text: 'Stand in the Willow’s shade with the Cantor bearer', interact: 'obj:shade-willow-deep-shade', marker: { landmark: 'landmark:sentinel-verdant' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'She came out of the shade with her halo dimmed, and did not turn it up again.',
        // co-op: if a party member plays the Cantor, they ARE this bearer (the NPC is hidden)
        objectives: [{ id: 'seraphina', text: 'Talk to the Cantor bearer', when: { any: [{ flag: 'shade.seraphina_thanked' }, { partyHasClass: 'cantor' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.cantor', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A2, id: 'quest:shade-the-silent-thread', name: 'The Silent Thread', type: 'side', region: 'region:gloam', giver: 'npc:bearer-samurai',
    summary: 'The Samurai bearer has to cross the Spinner’s web, and will not speak while there is anyone near who can hide. You cannot cast a shadow. She says that is a start.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'web',
    stages: [
      {
        id: 'web', journal: 'Three long threads across the drop under the roots. Cross them with Aiko Hoshida, in silence.',
        objectives: [{ id: 'web', text: 'Cross the Spinner’s web with the Samurai bearer', interact: 'obj:shade-silent-thread-*', count: 3, marker: { landmark: 'landmark:sentinel-umbral' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'On the far side Aiko sat down on a root and, for the first time since the web, spoke.',
        objectives: [{ id: 'aiko', text: 'Talk to the Samurai bearer', when: { any: [{ flag: 'shade.aiko_thanked' }, { partyHasClass: 'samurai' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.samurai', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  // ======================= ACT III: class quests (III-4 + 3 side)
  {
    ...A3, id: 'quest:shade-the-herald-of-shadows', name: 'The Herald of Shadows', type: 'class', region: 'region:heart', giver: 'npc:casimir',
    summary: 'At the top of the Twelve Stairs stands someone solid in the Herald’s robe, ringing a bell in your own voice. On the stone behind it lies your shadow. It is casting you.',
    requires: req(done('quest:heart-stairs')), autoStart: true, firstStage: 'herald',
    stages: [
      { id: 'herald', journal: 'Your Shadow has become the Hollow King’s Herald: the real one, in the light, with you on the floor behind it.', objectives: [{ id: 'herald', text: 'Face the Herald of Shadows', kill: 'cb_herald-of-shadows', count: 1, marker: { landmark: 'landmark:twelve-stairs-top' } }], onComplete: [{ openDialogue: 'dialogue:shade-herald-fate' }], next: 'fate' },
      { id: 'fate', journal: 'The Herald kneels on the top stair in its robe, beaten, and the bell in its hem is still saying your name.', objectives: [{ id: 'fate', text: 'Decide your Shadow’s fate', when: { flag: 'shade.nemesis_fate' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 3 },
  },
  {
    ...A3, id: 'quest:shade-send-mabs-shadow-home', name: 'Send Mab’s Shadow Home', type: 'side', region: 'region:heart', giver: GM,
    summary: 'Mab only ever had one rule about borrowing: give it back warm. At the head of the Umbral stair hangs the Veil’s old banner, and the Spinner’s thread runs home from there.',
    requires: req(done('quest:heart-stairs'), { flag: 'shade.mab_parcel' }), autoStart: true, firstStage: 'chalk',
    stages: [
      { id: 'chalk', journal: 'Somebody of the Veil came up this way long before you: there are Veil chalk-marks on the Umbral stair, a hood and a key, pointing up. Read them.', objectives: [{ id: 'chalk', text: 'Read the Veil’s chalk-marks on the Umbral stair', interact: 'obj:shade-stair-chalk', marker: { landmark: 'landmark:shade-umbral-stair' } }], next: 'banner' },
      // finishes on the scene's own flag, not on interact, so another open dialogue cannot swallow the Devoted beat
      { id: 'banner', journal: 'The Veil’s banner, rotted almost to lace, hangs at the head of the Umbral stair where the twelve stairs meet.', objectives: [{ id: 'banner', text: 'Go to the Veil’s banner on the Umbral stair', when: { any: [{ flag: 'shade.mab_shadow_home' }, { flag: 'shade.founder_note' }] }, marker: { landmark: 'landmark:twelve-stairs-top' } }], next: 'thread' },
      { id: 'thread', journal: 'The Spinner’s thread still runs home from the banner, across all of Morvane to the Veilwarrens. It will carry one more thing, if you tie it on.', objectives: [{ id: 'thread', text: 'Tie something for Mab to the Spinner’s thread', interact: 'obj:shade-thread-home', marker: { landmark: 'landmark:heart-camp' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A3, id: 'quest:shade-the-weeping-shades', name: 'The Weeping Shades', type: 'side', region: 'region:heart', giver: GM,
    summary: 'At the back of the Legion stands a rank that casts nothing on the ground: shadows that left their people, as yours left you, filled in with tears.',
    requires: req(done('quest:heart-legion')), autoStart: true, firstStage: 'legion',
    stages: [
      { id: 'legion', journal: 'The Weeping Shades stand in their own rank at the back of the Legion camp.', objectives: [{ id: 'shades', text: 'Find the Weeping Shades in the Legion camp', interact: 'obj:shade-weeping-shades', marker: { landmark: 'landmark:legion-camp' } }], next: 'light' },
      { id: 'light', journal: 'They are following you, a step behind and a little to one side, the way shadows do. A shadow finds its way home along the ground, and it needs a light to lie down in.', objectives: [{ id: 'lantern', text: 'Set a lantern for them at the Heart camp', interact: 'obj:shade-camp-lantern', marker: { landmark: 'landmark:heart-camp' } }], next: 'small' },
      { id: 'small', journal: 'One small shadow did not go home with the rest. It is sitting at the edge of the lantern-light by the supply crates, holding something round.', objectives: [{ id: 'small', text: 'See to the small shadow at the edge of the light', interact: 'obj:shade-small-shadow', marker: { landmark: 'landmark:heart-camp' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A3, id: 'quest:shade-bryns-flock', name: 'Bryn’s Flock', type: 'side', region: 'region:heart', giver: BTH,
    summary: 'Bryn Tallow’s sheep followed the Bell all the way off the Stalker Moors to the edge of the Heart. Bryn followed his sheep. Nobody can find the sheep.',
    requires: req(done('quest:heart-wall')), autoStart: true, firstStage: 'bryn',
    stages: [
      { id: 'bryn', journal: 'Bryn Tallow is at the Heart camp, with a crook, a pipe, and no sheep at all.', objectives: [{ id: 'bryn', text: 'Talk to Bryn Tallow at the Heart camp', talk: BTH, marker: { landmark: 'landmark:heart-camp' } }], next: 'sheep' },
      { id: 'sheep', journal: 'Thirty-one sheep with no shadows, loose in the dark at the edge of the Heart. They cannot see you coming. You cannot see them either.', objectives: [{ id: 'sheep', text: 'Round up Bryn’s strays', interact: 'obj:shade-stray-sheep-*', count: 3, marker: { landmark: 'landmark:heart-camp' } }], next: 'back' },
      { id: 'back', journal: 'The flock is milling round the camp fire, bumping into bearers.', objectives: [{ id: 'back', text: 'Tell Bryn his flock is home', talk: BTH, marker: { landmark: 'landmark:heart-camp' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1 },
  },
];

export default quests;
