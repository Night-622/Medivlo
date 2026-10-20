/**
 * Hollow Crown: the ARCANIST campaign (docs/lore/hollow-crown/06-outlines/ash.md). Act I in Kilnhold
 * (area:ash-capital) and the Act II class thread in Concordia. Act III class quests land with the Heart.
 * This file is the reference implementation for every class campaign (see 10-campaign-style.md). Owner: Claude 4.
 */
import type { NarrativeCondition, QuestDef } from '@/core';

const ARC: NarrativeCondition = { heroClass: 'arcanist' };
const done = (q: `quest:${string}`): NarrativeCondition => ({ questCompleted: q });
const req = (...c: NarrativeCondition[]): NarrativeCondition => ({ all: [ARC, ...c] });
const A1 = { act: 'act1' as const, campaign: 'arcanist', chapter: 'Kilnhold' };
const A2 = { act: 'act2' as const, campaign: 'arcanist', chapter: 'Concordia' };
const A3 = { act: 'act3' as const, campaign: 'arcanist', chapter: 'The Heart' };
const Z1 = 'zone:ash-capital-1' as const, Z2 = 'zone:ash-capital-2' as const, Z3 = 'zone:ash-capital-3' as const, Z4 = 'zone:ash-capital-4' as const;
const L1 = 'inst:ash-capital-lair-1' as const, L2 = 'inst:ash-capital-lair-2' as const, L3 = 'inst:ash-capital-lair-3' as const;

const quests: QuestDef[] = [
  // ======================= ACT I: main (I-1 … I-10)
  {
    ...A1, id: 'quest:arcanist-the-bell', name: 'The Bell in the Kiln', type: 'main', region: Z1, giver: 'npc:coalby-thrane',
    summary: 'In the middle of the night a bell rang over Kilnhold, and every pane in the Kiln Ward cracked at once. Something in your chest started to sing.',
    requires: ARC, autoStart: true, firstStage: 'wake',
    stages: [
      {
        id: 'wake', journal: 'You woke in the dark with a song in your chest and your feet already walking. It is pulling you towards the Great Kiln.',
        onEnter: [{ openDialogue: 'dialogue:arcanist-bell-night' }],
        objectives: [{ id: 'kiln', text: 'Follow the song to the Great Kiln', reach: 'landmark:great-kiln-gate', marker: { landmark: 'landmark:great-kiln-gate' } }],
        next: 'thrane',
      },
      {
        id: 'thrane', journal: 'Someone in a soot-black robe is waving at you from the shadow of the Kiln gate, very urgently.',
        objectives: [{ id: 'thrane', text: 'Talk to the man by the Kiln gate', talk: 'npc:coalby-thrane', marker: { landmark: 'landmark:great-kiln-gate' } }],
        onComplete: [{ setFlag: 'arcanist.bell_heard', value: true }],
        next: 'lanes',
      },
      {
        id: 'lanes', journal: 'Magister Thrane is hurrying you through the back lanes of the Kiln Ward to his study, away from the Watch.',
        objectives: [{ id: 'study', text: 'Follow Thrane through the back lanes to his study', reach: 'landmark:thrane-study', marker: { landmark: 'landmark:thrane-study' } }],
        next: 'study',
      },
      {
        id: 'study', journal: 'Three rooms of paper with a fire in the middle. Thrane has put the kettle on, and his hands are shaking.',
        objectives: [{ id: 'thrane', text: 'Hear Thrane out', talk: 'npc:coalby-thrane', marker: { landmark: 'landmark:thrane-study' } }],
        onComplete: [{ startQuest: 'quest:arcanist-a-permit-to-burn' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-cinderreach', 'lore:hc-great-kiln'] },
  },
  {
    ...A1, id: 'quest:arcanist-a-permit-to-burn', name: 'A Permit to Burn', type: 'main', region: Z1, giver: 'npc:coalby-thrane',
    summary: 'Magister Thrane forged you a burning permit and sent you to relight the Kiln Ward’s five guttering braziers before the Watch notices they are out.',
    requires: req(done('quest:arcanist-the-bell')), firstStage: 'braziers',
    stages: [
      {
        id: 'braziers', journal: 'Five braziers in the Kiln Ward have gone out. Burning one without a permit is a crime. You have a permit. Probably.',
        objectives: [{ id: 'light', text: 'Relight the Kiln Ward braziers', interact: 'obj:kiln-brazier-*', count: 5, marker: { place: Z1 } }],
        next: 'slimes',
      },
      {
        id: 'slimes', journal: 'Black tears are running in the gutters under the braziers, and Lava Slimes are crawling out of them.',
        objectives: [{ id: 'slimes', text: 'Deal with the Lava Slimes', kill: 'bx_ash_1', count: 4 }],
        next: 'gutters',
      },
      {
        id: 'gutters', journal: 'The tears in the gutters aren’t lying still. They are going somewhere.',
        objectives: [{ id: 'tears', text: 'Follow the black tears along the gutters', interact: 'obj:arcanist-gutter-tear-*', count: 3, marker: { place: Z1 } }],
        next: 'report',
      },
      {
        id: 'report', journal: 'The braziers burn again, but something is very wrong with the gutters of Kilnhold.',
        objectives: [{ id: 'thrane', text: 'Report to Magister Thrane', talk: 'npc:coalby-thrane', marker: { landmark: 'landmark:thrane-study' } }],
        onComplete: [{ startQuest: 'quest:arcanist-the-zealots-furnace' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40 },
  },
  {
    ...A1, id: 'quest:arcanist-the-zealots-furnace', name: 'The Zealots’ Furnace', type: 'main', region: Z2, giver: 'npc:orsolya-glaze',
    summary: 'Glassblowers are vanishing from the Row. Master Orsolya Glaze has lost three apprentices this month, and someone has painted black tears on her door.',
    requires: req(done('quest:arcanist-a-permit-to-burn')), firstStage: 'orsolya',
    stages: [
      {
        id: 'orsolya', journal: 'Thrane says Master Orsolya Glaze, on Glassblowers’ Row, has a problem that smells of black fire.',
        objectives: [{ id: 'orsolya', text: 'Speak to Master Orsolya Glaze', talk: 'npc:orsolya-glaze', marker: { landmark: 'landmark:glaze-workshop' } }],
        next: 'benches',
      },
      {
        id: 'benches', journal: 'The missing apprentices’ benches are just as they left them. Orsolya says all three had been hiding something lately.',
        objectives: [{ id: 'benches', text: 'Search the missing apprentices’ benches', interact: 'obj:arcanist-apprentice-bench-*', count: 3, marker: { landmark: 'landmark:glaze-workshop' } }],
        next: 'furnace',
      },
      {
        id: 'furnace', journal: 'The Ashen Zealots are stoking a furnace that burns black, in a chapel under the Row. The missing apprentices are inside.',
        objectives: [{ id: 'enter', text: 'Find the Zealots’ Furnace', reach: L1, marker: { place: Z2 } }],
        next: 'zealot',
      },
      {
        id: 'zealot', journal: 'Their preacher has a burning scythe and a congregation of three frightened apprentices.',
        objectives: [{ id: 'zealot', text: 'Defeat the Ashen Zealot', kill: 'bx_ash_3', count: 1 }],
        next: 'cages',
      },
      {
        id: 'cages', journal: 'The apprentices are locked in cages by the furnace.',
        objectives: [{ id: 'cages', text: 'Free the apprentices', interact: 'obj:zealot-cages' }],
        next: 'report',
      },
      {
        id: 'report', journal: 'The apprentices are free and running home.',
        objectives: [{ id: 'orsolya', text: 'Return to Master Glaze', talk: 'npc:orsolya-glaze', marker: { landmark: 'landmark:glaze-workshop' } }],
        onComplete: [{ setFlag: 'arcanist.zealot_down', value: true }, { startQuest: 'quest:arcanist-the-provosts-favour' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 80, hcItems: [{ item: 'i_ashward', qty: 2 }] },
  },
  {
    ...A1, id: 'quest:arcanist-the-provosts-favour', name: 'The Provost’s Favour', type: 'main', region: Z3, giver: 'npc:ignace-morrow',
    summary: 'Word of the Zealots’ Furnace has reached the Conclave. The Provost himself would like to meet the young Arcanist with the “unusual warmth”.',
    requires: req(done('quest:arcanist-the-zealots-furnace')), firstStage: 'conclave',
    stages: [
      {
        id: 'conclave', journal: 'A Conclave pigeon brought a summons: Provost Ignace Morrow, at the Conclave Hall on the Smoke Terraces.',
        objectives: [{ id: 'morrow', text: 'Meet the Provost at the Conclave Hall', talk: 'npc:ignace-morrow', marker: { landmark: 'landmark:conclave-hall' } }],
        onComplete: [{ setFlag: 'arcanist.ignace_met', value: true }],
        next: 'terraces',
      },
      {
        id: 'terraces', journal: 'The Provost wants to show you what the Great Kiln is for. He has gone ahead, up to the top of the Smoke Terraces.',
        objectives: [{ id: 'view', text: 'Climb the Smoke Terraces after the Provost', reach: 'landmark:arcanist-terrace-view', marker: { landmark: 'landmark:arcanist-terrace-view' } }],
        next: 'view',
      },
      {
        id: 'view', journal: 'All of Kilnhold at once, glittering and coughing, and the Provost leaning on the parapet as if he owned it.',
        objectives: [{ id: 'morrow', text: 'Walk the Terraces with the Provost', talk: 'npc:ignace-morrow', marker: { landmark: 'landmark:arcanist-terrace-view' } }],
        onComplete: [{ startQuest: 'quest:arcanist-the-last-library' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-kiln-conclave'] },
  },
  {
    ...A1, id: 'quest:arcanist-the-last-library', name: 'The Last Library', type: 'main', region: Z3, giver: 'npc:ignace-morrow',
    summary: 'The Great Kiln is failing. The Conclave meets tonight to vote on feeding it the Glass Archive: six hundred years of Kilnhold’s records.',
    requires: req(done('quest:arcanist-the-provosts-favour')), firstStage: 'canvass',
    stages: [
      {
        id: 'canvass', journal: 'The Provost said: find out what people have to lose before you vote. The Permit Office files everything in the Archive. So does the old astronomer.',
        objectives: [
          { id: 'ashworth', text: 'Ask Clerk Ashworth what the Archive means to him', talk: 'npc:clerk-ashworth', marker: { landmark: 'landmark:kiln-permit-office' } },
          { id: 'ambrose', text: 'Ask Old Ambrose what the Archive means to him', talk: 'npc:ambrose-lumen', marker: { landmark: 'landmark:kiln-observatory' } },
        ],
        next: 'vote',
      },
      {
        id: 'vote', journal: 'The Conclave sits tonight. You have a seat, thanks to the Provost, and a vote, thanks to nobody.',
        objectives: [{ id: 'vote', text: 'Attend the Conclave vote', when: { flag: 'arcanist.library' }, marker: { landmark: 'landmark:conclave-hall' } }],
        next: [
          { when: { flag: 'arcanist.library', value: 'saved' }, to: 'smuggle' },
          { to: 'after' },
        ],
      },
      {
        id: 'smuggle', journal: 'Thrane is smuggling the oldest books out of the Archive in fish crates before the Conclave can burn them.',
        objectives: [{ id: 'crates', text: 'Carry the book crates to Thrane’s study', interact: 'obj:archive-crate-*', count: 3, marker: { landmark: 'landmark:glass-archive' } }],
        next: 'after',
      },
      {
        id: 'after', journal: 'Whatever the Conclave decided, the Glass Archive is on fire tonight.',
        objectives: [],
        onComplete: [{ startQuest: 'quest:arcanist-the-ledger-flame' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A1, id: 'quest:arcanist-the-ledger-flame', name: 'The Ledger Flame', type: 'main', region: Z2, giver: 'npc:coalby-thrane',
    summary: 'The Glass Archive is burning, and the burning records have risen out of the fire as one creature.',
    requires: req(done('quest:arcanist-the-last-library')), firstStage: 'archive',
    stages: [
      {
        id: 'archive', journal: 'Six hundred years of burned records have become something that walks. It is in the Glass Archive.',
        objectives: [{ id: 'enter', text: 'Enter the burning Glass Archive', reach: L2, marker: { landmark: 'landmark:glass-archive' } }],
        next: 'archivists',
      },
      {
        id: 'archivists', journal: 'The archivists didn’t all get out. Some of them didn’t want to.',
        objectives: [{ id: 'archivists', text: 'Get the trapped archivists out', interact: 'obj:arcanist-trapped-archivist-*', count: 3 }],
        next: 'flame',
      },
      {
        id: 'flame', journal: 'The Ledger Flame throws pages that spell your name.',
        objectives: [{ id: 'flame', text: 'Defeat the Ledger Flame', kill: 'cb_ledger-flame', count: 1 }],
        next: 'page',
      },
      {
        id: 'page', journal: 'One page did not burn. It is lying in the ash, face down.',
        objectives: [{ id: 'page', text: 'Pick up the unburned page', interact: 'obj:ledger-page' }],
        onComplete: [{ setFlag: 'arcanist.ledger_page', value: true }, { startQuest: 'quest:arcanist-what-the-provost-burned' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, gold: 120 },
  },
  {
    ...A1, id: 'quest:arcanist-what-the-provost-burned', name: 'What the Provost Burned', type: 'main', region: Z4, giver: 'npc:coalby-thrane',
    summary: 'The page that would not burn is a fuel ledger in the Provost’s own hand. Whatever he has been feeding the Great Kiln, it was not wood.',
    requires: req(done('quest:arcanist-the-ledger-flame')), firstStage: 'thrane',
    stages: [
      {
        id: 'thrane', journal: 'Thrane will know how to read a Conclave fuel ledger.',
        objectives: [{ id: 'thrane', text: 'Show Thrane the page', talk: 'npc:coalby-thrane', marker: { landmark: 'landmark:thrane-study' } }],
        next: 'stokers',
      },
      {
        id: 'stokers', journal: 'If the ledger is true, the fuel goes in at night. The night stokers will have seen it.',
        objectives: [{ id: 'bettany', text: 'Ask Old Stoker Bettany about the night carts', talk: 'npc:bettany', marker: { landmark: 'landmark:stokers-gallery' } }],
        next: 'roots',
      },
      {
        id: 'roots', journal: 'Bettany says the Conclave tips its fuel down the old flue at the bottom of the Roots, and the steps are wet.',
        objectives: [{ id: 'flue', text: 'Find the Provost’s fuel in the Kiln Roots', interact: 'obj:kiln-flue-tears', marker: { place: Z4 } }],
        next: 'evidence',
      },
      {
        id: 'evidence', journal: 'Thrane will need more than your word against the Provost’s. There is a cart by the flue, and something dropped in the wet.',
        objectives: [
          { id: 'cart', text: 'Search the emptied fuel cart', interact: 'obj:arcanist-fuel-cart' },
          { id: 'glove', text: 'Pick up what was dropped by the flue', interact: 'obj:arcanist-conclave-glove' },
        ],
        next: 'tell',
      },
      {
        id: 'tell', journal: 'You know what feeds the Great Kiln. Thrane has to hear it from you.',
        objectives: [{ id: 'thrane', text: 'Tell Thrane what the Provost burns', talk: 'npc:coalby-thrane', marker: { landmark: 'landmark:thrane-study' } }],
        onComplete: [{ setFlag: 'arcanist.provost_known', value: true }, { startQuest: 'quest:arcanist-the-heart-of-the-kiln' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2, lore: ['lore:hc-morrows-ledger'] },
  },
  {
    ...A1, id: 'quest:arcanist-the-heart-of-the-kiln', name: 'The Heart of the Kiln', type: 'main', region: L3, giver: 'npc:coalby-thrane',
    summary: 'Morrow means to set the Kiln half of the Ash Stone in his own chest and become a living kiln. He has gone down to the Heart of the Kiln to take it.',
    requires: req(done('quest:arcanist-what-the-provost-burned')), firstStage: 'descend',
    stages: [
      {
        id: 'descend', journal: 'Down through the Kiln Roots to the Great Kiln’s core. Your half-stone is singing so loudly it hurts.',
        objectives: [{ id: 'enter', text: 'Descend to the Heart of the Kiln', reach: L3, marker: { place: Z4 } }],
        next: 'morrow',
      },
      {
        id: 'morrow', journal: 'Provost Morrow stands on the Kiln’s grate with the fire in his hands.',
        objectives: [{ id: 'morrow', text: 'Stop Provost Morrow', kill: 'cb_provost-morrow', count: 1 }],
        next: 'stone',
      },
      {
        id: 'stone', journal: 'Morrow fled up the flue. The Kiln half is still in its cradle of fire, singing to you.',
        objectives: [{ id: 'stone', text: 'Claim the Kiln half', interact: 'obj:ash-capital-halfstone' }],
        onComplete: [{ setFlag: 'arcanist.halfstone', value: true }, { startQuest: 'quest:arcanist-the-cinder-road' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, skillPoints: 1, lore: ['lore:hc-half-stones'] },
  },
  {
    ...A1, id: 'quest:arcanist-the-cinder-road', name: 'The Cinder Road', type: 'main', region: Z1, giver: 'npc:coalby-thrane',
    summary: 'Morrow is running for the Cinder Gate. The half-stone in your hand can open it. Thrane wants to see you before you go.',
    requires: req(done('quest:arcanist-the-heart-of-the-kiln')), firstStage: 'farewell',
    stages: [
      {
        id: 'farewell', journal: 'Thrane is waiting in his study with something wrapped in an old robe.',
        objectives: [{ id: 'thrane', text: 'Say goodbye to Magister Thrane', talk: 'npc:coalby-thrane', marker: { landmark: 'landmark:thrane-study' } }],
        next: 'shrine',
      },
      {
        id: 'shrine', journal: 'Halfway up the Cinder Road there is a wayside shrine where Ash travellers leave a coal before the gate. Nobody has passed it in thirty years.',
        objectives: [{ id: 'shrine', text: 'Stop at the shrine on the Cinder Road', interact: 'obj:arcanist-cinder-shrine', marker: { landmark: 'landmark:arcanist-cinder-shrine' } }],
        next: 'road',
      },
      {
        id: 'road', journal: 'The Cinder Road runs north to the gate. The Pyrelord sleeps coiled around it, and lately it has not been sleeping well.',
        objectives: [{ id: 'gate', text: 'Take the Cinder Road to the gate', reach: 'area:ash-gate', marker: { place: 'area:ash-gate' } }],
        onComplete: [{ startQuest: 'quest:arcanist-the-cinder-gate' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:arcanist-the-cinder-gate', name: 'The Cinder Gate', type: 'main', region: 'area:ash-gate', giver: 'npc:coalby-thrane',
    summary: 'Pyrelord Vulkan lies coiled round the Cinder Gate, its mane burning black. Beyond the gate is Concordia, and Morrow, and whatever rang the Bell.',
    requires: req(done('quest:arcanist-the-cinder-road')), firstStage: 'vulkan',
    stages: [
      {
        id: 'vulkan', journal: 'Sing the half-stone between its fires. Douse the black flame in its mane.',
        objectives: [{ id: 'vulkan', text: 'Calm Pyrelord Vulkan', kill: 'bx_ash_5', count: 1 }],
        next: 'gate',
      },
      {
        id: 'gate', journal: 'The Pyrelord lay down across the road and slept. The gate is weeping black tears down its face.',
        objectives: [{ id: 'seal', text: 'Open the Cinder Gate with the half-stone', interact: 'obj:ash-gate-seal' }],
        onComplete: [{ setFlag: 'story.gate_open', value: true }, { setFlag: 'story.act', value: 2 }, { setFlag: 'arcanist.act1_done', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 200, lore: ['lore:hc-realm-gates'] },
  },

  // ======================= ACT I: side quests (2 per zone)
  {
    ...A1, id: 'quest:arcanist-pudding-gets-out', name: 'Pudding Gets Out', type: 'side', region: Z1, giver: 'npc:clerk-ashworth',
    summary: 'Magister Thrane’s Lava Slime has escaped into the Burning Permit Office and is eating the filing.',
    requires: req(done('quest:arcanist-the-bell')), firstStage: 'chase',
    stages: [
      {
        id: 'chase', journal: 'Pudding has left a trail of half-digested forms through the Kiln Ward.',
        objectives: [{ id: 'trail', text: 'Follow Pudding’s trail', interact: 'obj:pudding-trail-*', count: 3, marker: { landmark: 'landmark:kiln-permit-office' } }],
        next: 'fires',
      },
      {
        id: 'fires', journal: 'Pudding is found, warm and smug. The Permit Office, behind it, is on fire in three places.',
        objectives: [{ id: 'fires', text: 'Put out the fires Pudding started', interact: 'obj:arcanist-office-fire-*', count: 3, marker: { landmark: 'landmark:kiln-permit-office' } }],
        next: 'form',
      },
      {
        id: 'form', journal: 'The fires are out. Clerk Ashworth has a form for this. Of course he does.',
        objectives: [{ id: 'ashworth', text: 'Fill in Clerk Ashworth’s Form Four', talk: 'npc:clerk-ashworth', marker: { landmark: 'landmark:kiln-permit-office' } }],
        next: 'return',
      },
      {
        id: 'return', journal: 'You have Pudding, a little singed, very pleased with itself.',
        objectives: [{ id: 'thrane', text: 'Bring Pudding home to Thrane', talk: 'npc:coalby-thrane', marker: { landmark: 'landmark:thrane-study' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 30 },
  },
  {
    ...A1, id: 'quest:arcanist-the-sweeps-strike', name: 'The Sweeps’ Strike', type: 'side', region: Z1, giver: 'npc:dora-flue',
    summary: 'The chimney sweeps of Kilnhold will not climb chimneys that weep black. Captain Dora Flue wants a reason to go back up, or a reason not to.',
    requires: req(done('quest:arcanist-a-permit-to-burn')), firstStage: 'chimneys',
    stages: [
      {
        id: 'chimneys', journal: 'Dora will let you up on the Ward’s roofs, with a sweep’s rope, to see the weeping chimneys for yourself.',
        objectives: [{ id: 'chimneys', text: 'Look down the weeping chimneys', interact: 'obj:arcanist-weeping-chimney-*', count: 3, marker: { landmark: 'landmark:sweeps-yard' } }],
        next: 'danny',
      },
      {
        id: 'danny', journal: 'Someone scratched SHE’S CRYING down the inside of a flue. Dora’s boy Danny swept that chimney last.',
        objectives: [{ id: 'danny', text: 'Talk to Danny Flue', talk: 'npc:danny-flue', marker: { landmark: 'landmark:sweeps-yard' } }],
        next: 'cause',
      },
      {
        id: 'cause', journal: 'Dora wants proof the chimneys are safe, or masks that make them so.',
        objectives: [{ id: 'masks', text: 'Settle the sweeps’ strike', when: { flag: 'arcanist.sweeps_settled' }, marker: { landmark: 'landmark:sweeps-yard' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 50 },
  },
  {
    ...A1, id: 'quest:arcanist-the-unbreakable-vase', name: 'The Unbreakable Vase', type: 'side', region: Z2, giver: 'npc:orsolya-glaze',
    summary: 'Master Glaze has a commission from the Velvet King of Tidecourt, ordered thirty years ago and never collected. The vase keeps shattering at the note the Bell rang.',
    requires: req(done('quest:arcanist-the-zealots-furnace')), firstStage: 'sand',
    stages: [
      {
        id: 'sand', journal: 'Only singing sand will hold the note. The Kiln Golems carry it in their bellies, from the Roots.',
        objectives: [{ id: 'sand', text: 'Take singing sand from Kiln Golems', kill: 'bx_ash_2', count: 3 }],
        next: 'glaze',
      },
      {
        id: 'glaze', journal: 'You have a pocketful of sand that hums.',
        objectives: [{ id: 'orsolya', text: 'Bring the sand to Master Glaze', talk: 'npc:orsolya-glaze', marker: { landmark: 'landmark:glaze-workshop' } }],
        next: 'sing',
      },
      {
        id: 'sing', journal: 'The vase held. Orsolya says it sings at midnight, when the Row goes quiet, and that you should hear it once.',
        objectives: [{ id: 'sing', text: 'Hear the vase sing, at night', when: { flag: 'arcanist.vase_sang' }, marker: { landmark: 'landmark:glaze-workshop' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 120 },
  },
  {
    ...A1, id: 'quest:arcanist-apprentice-eyebrows', name: 'Apprentice Eyebrows', type: 'side', region: Z2, giver: 'npc:prentice-wim',
    summary: 'The apprentices of Glassblowers’ Row are holding a fire-safety contest. Prentice Wim, who has no eyebrows, insists that you enter.',
    requires: req(done('quest:arcanist-the-zealots-furnace')), firstStage: 'contest',
    stages: [
      {
        id: 'contest', journal: 'Three tests: the bucket, the blanket and the sand. Wim will judge. Wim has no eyebrows to raise.',
        objectives: [
          { id: 'bucket', text: 'Pass the bucket test', interact: 'obj:contest-bucket' },
          { id: 'blanket', text: 'Pass the blanket test', interact: 'obj:contest-blanket' },
          { id: 'sand', text: 'Pass the sand test', interact: 'obj:contest-sand' },
        ],
        next: 'judge',
      },
      {
        id: 'judge', journal: 'You still have both your eyebrows. That is apparently a record.',
        objectives: [{ id: 'wim', text: 'Hear Wim’s verdict', talk: 'npc:prentice-wim', marker: { landmark: 'landmark:prentice-yard' } }],
        next: 'candle',
      },
      {
        id: 'candle', journal: 'Wim, worried, says one of the apprentices you freed slips out every night to the boarded-up chapel and lights a candle on the step.',
        objectives: [{ id: 'candle', text: 'Go to the chapel step at night', when: { flag: 'arcanist.nella' }, marker: { landmark: 'landmark:arcanist-chapel-door' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_ashward' }] },
  },
  {
    ...A1, id: 'quest:arcanist-the-last-star', name: 'The Last Star', type: 'side', region: Z3, giver: 'npc:ambrose-lumen',
    summary: 'Old Ambrose Lumen has not seen a star in thirty years. The Kiln smoke lies on Kilnhold like a lid.',
    requires: req(done('quest:arcanist-the-provosts-favour')), firstStage: 'lens',
    stages: [
      {
        id: 'lens', journal: 'Clear the observatory lens at night, and burn a hole in the smoke above it.',
        objectives: [{ id: 'lens', text: 'Clear the lens and look up, at night', when: { flag: 'arcanist.saw_star' }, marker: { landmark: 'landmark:kiln-observatory' } }],
        next: 'ambrose',
      },
      {
        id: 'ambrose', journal: 'Twelve stars in a ring, and a dark place in the middle where a thirteenth should be.',
        objectives: [{ id: 'ambrose', text: 'Tell Ambrose what you saw', talk: 'npc:ambrose-lumen', marker: { landmark: 'landmark:kiln-observatory' } }],
        next: 'chart',
      },
      {
        id: 'chart', journal: 'Ambrose wants tonight’s sky copied onto his old master’s chart of the Concord Ring, before the smoke closes again.',
        objectives: [{ id: 'chart', text: 'Copy the Ring onto the old chart', interact: 'obj:arcanist-star-chart', marker: { landmark: 'landmark:kiln-observatory' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-concord-ring'] },
  },
  {
    ...A1, id: 'quest:arcanist-soot-pigeons', name: 'Soot Pigeons', type: 'side', region: Z3, giver: 'npc:dilly-coop',
    summary: 'Dilly Coop’s soot-pigeons are moulting and grounded. Three messages need delivering by hand, and Dilly has read all of them.',
    requires: req(done('quest:arcanist-the-provosts-favour')), firstStage: 'deliver',
    stages: [
      {
        id: 'deliver', journal: 'One for Captain Flue, one for Master Glaze, and one with no name on it at all.',
        objectives: [
          { id: 'dora', text: 'Deliver a message to Captain Flue', talk: 'npc:dora-flue', marker: { landmark: 'landmark:sweeps-yard' } },
          { id: 'orsolya', text: 'Deliver a message to Master Glaze', talk: 'npc:orsolya-glaze', marker: { landmark: 'landmark:glaze-workshop' } },
        ],
        next: 'third',
      },
      {
        id: 'third', journal: 'The third message is sealed with the Provost’s seal, and was never sent.',
        objectives: [{ id: 'dilly', text: 'Ask Dilly about the unsent message', talk: 'npc:dilly-coop', marker: { landmark: 'landmark:pigeon-loft' } }],
        next: 'show',
      },
      {
        id: 'show', journal: '“When the stone comes home, I will have a heart that never cools.” Thrane taught the Provost to write. He will know the hand.',
        objectives: [{ id: 'thrane', text: 'Show Thrane the unsent letter', talk: 'npc:coalby-thrane', marker: { landmark: 'landmark:thrane-study' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, gold: 40 },
  },
  {
    ...A1, id: 'quest:arcanist-the-stokers-lament', name: 'The Stoker’s Lament', type: 'side', region: Z4, giver: 'npc:bettany',
    summary: 'Old Stoker Bettany says the Great Kiln has started crying at night. Kilns, she says, do not cry.',
    requires: req(done('quest:arcanist-a-permit-to-burn')), firstStage: 'listen',
    stages: [
      {
        id: 'listen', journal: 'Bettany hears it at the deepest grate, after midnight.',
        objectives: [{ id: 'grate', text: 'Listen at the deep grate, at night', when: { flag: 'arcanist.kiln_cry_heard' }, marker: { landmark: 'landmark:stokers-gallery' } }],
        next: 'bettany',
      },
      {
        id: 'bettany', journal: 'It isn’t the Kiln crying. It is your half-stone, somewhere below, answering it.',
        objectives: [{ id: 'bettany', text: 'Tell Bettany what you heard', talk: 'npc:bettany', marker: { landmark: 'landmark:stokers-gallery' } }],
        next: 'ledger',
      },
      {
        id: 'ledger', journal: 'Bettany wants to know when it started. Every stoking permit for fifty years is in the Permit Office’s ledger, up in the Ward.',
        objectives: [{ id: 'ledger', text: 'Read the stoking ledger at the Permit Office', interact: 'obj:arcanist-stoking-ledger', marker: { landmark: 'landmark:kiln-permit-office' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'The crying began the week the Provost’s “special fuel” did.',
        objectives: [{ id: 'bettany', text: 'Tell Bettany what the ledger says', talk: 'npc:bettany', marker: { landmark: 'landmark:stokers-gallery' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, hcItems: [{ item: 'i_torch' }] },
  },
  {
    ...A1, id: 'quest:arcanist-golem-nine', name: 'Golem Nine', type: 'side', region: Z4, giver: 'npc:golem-nine',
    summary: 'A friendly Kiln Golem comes to the stokers’ gallery every morning with a shovel, looking for its master. Nobody has told it.',
    requires: req(done('quest:arcanist-a-permit-to-burn')), firstStage: 'master',
    stages: [
      {
        id: 'master', journal: 'Golem Nine’s master was a stoker called Marit, who lived at the end of the Roots.',
        objectives: [{ id: 'house', text: 'Find Golem Nine’s master', interact: 'obj:golem-master-grave', marker: { landmark: 'landmark:golem-masters-house' } }],
        next: 'tell',
      },
      {
        id: 'tell', journal: 'Marit died of old age, peacefully, last winter. Someone has to tell Golem Nine.',
        objectives: [{ id: 'nine', text: 'Tell Golem Nine', talk: 'npc:golem-nine', marker: { landmark: 'landmark:stokers-gallery' } }],
        next: 'shift',
      },
      {
        id: 'shift', journal: 'Golem Nine shouldered its shovel and looked north. It needs a stoker. Bettany will know what to do with it.',
        objectives: [{ id: 'bettany', text: 'Ask Bettany to take Golem Nine on', talk: 'npc:bettany', marker: { landmark: 'landmark:stokers-gallery' } }],
        onComplete: [{ setFlag: 'arcanist.golem_nine_helped', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },

  // ======================= ACT I: mentor thread (2) and bounties (2)
  {
    ...A1, id: 'quest:arcanist-thranes-equation', name: 'Thrane’s Equation', type: 'side', region: Z4, giver: 'npc:coalby-thrane',
    summary: 'For thirty years Magister Thrane has been working on one sum: how much the Great Kiln burns, and how much it should. He needs three readings from the Roots.',
    requires: req({ trust: 'npc:coalby-thrane', value: 'friendly' }, done('quest:arcanist-a-permit-to-burn')), firstStage: 'readings',
    stages: [
      {
        id: 'readings', journal: 'Three old thermometers in the Kiln Roots, untouched since the Hollowing.',
        objectives: [{ id: 'temp', text: 'Read the Kiln Roots thermometers', interact: 'obj:kiln-thermometer-*', count: 3, marker: { place: Z4 } }],
        next: 'sum',
      },
      {
        id: 'sum', journal: 'You have the readings. Thrane has a pencil behind each ear.',
        objectives: [{ id: 'thrane', text: 'Bring the readings to Thrane', talk: 'npc:coalby-thrane', marker: { landmark: 'landmark:thrane-study' } }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, skillPoints: 1 },
  },
  {
    ...A1, id: 'quest:arcanist-puddings-pedigree', name: 'Pudding’s Pedigree', type: 'side', region: Z4, giver: 'npc:coalby-thrane',
    summary: 'Thrane found Pudding as a hatchling in the Roots, forty years ago. He would very much like to know where it came from before he goes.',
    requires: req({ trust: 'npc:coalby-thrane', value: 'trusted' }, done('quest:arcanist-pudding-gets-out')), firstStage: 'grotto',
    stages: [
      {
        id: 'grotto', journal: 'Pudding keeps sliding towards a crack in the deepest Root. Follow it.',
        objectives: [{ id: 'mother', text: 'Follow Pudding to the slime grotto', talk: 'npc:pudding-mother', marker: { landmark: 'landmark:slime-grotto' } }],
        next: 'home',
      },
      {
        id: 'home', journal: 'Pudding’s mother is the size of a cottage and extremely polite. She would like a word with Magister Thrane.',
        objectives: [{ id: 'thrane', text: 'Tell Thrane', talk: 'npc:coalby-thrane', marker: { landmark: 'landmark:thrane-study' } }],
        onComplete: [{ setFlag: 'arcanist.thrane_devotable', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A1, id: 'quest:arcanist-bounty-ward-hounds', name: 'Bounty: the Ward Hounds', type: 'bounty', region: Z1, giver: 'npc:sergeant-grisel',
    summary: 'Magma Hounds are coming up the Kiln Roots into the Ward at night. The Watch pays by the hound.',
    requires: req(done('quest:arcanist-a-permit-to-burn')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'They hunt in packs and leave burning pawprints.', objectives: [{ id: 'hounds', text: 'Defeat Magma Hounds', kill: 'bx_ash_0', count: 6 }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 150 },
  },
  {
    ...A1, id: 'quest:arcanist-bounty-runaway-golem', name: 'Bounty: the Runaway Kiln Golem', type: 'bounty', region: Z2, giver: 'npc:sergeant-grisel',
    summary: 'A Kiln Golem has walked out of the Roots and is sitting on Glassblowers’ Row, melting it.',
    requires: req(done('quest:arcanist-the-zealots-furnace')), firstStage: 'hunt',
    stages: [{ id: 'hunt', journal: 'It is enormous, and it is not Golem Nine.', objectives: [{ id: 'golem', text: 'Defeat the runaway Kiln Golem', kill: 'bx_ash_2', count: 1, marker: { place: Z2 } }], end: { status: 'completed' } }],
    reward: { xpTier: 1, gold: 120 },
  },

  // ======================= ACT II: the class thread (C-1 … C-6) + featured bearers
  {
    ...A2, id: 'quest:arcanist-kilnmouth', name: 'Kilnmouth', type: 'class', region: 'vil:kiln', giver: 'npc:forgewife-ada',
    summary: 'Somewhere in Concordia there are Ash-folk who were stranded here when the arches shut. They will know where Ash’s Sentinel lies.',
    requires: req(done('quest:cc-through-the-arch')), autoStart: true, firstStage: 'ada',
    stages: [
      {
        id: 'ada', journal: 'Ysolde says the Ash-folk of Concordia keep a cold kiln at Kilnmouth, in the Ashfall Kiln.',
        objectives: [{ id: 'ada', text: 'Find the Ash-folk of Kilnmouth', talk: 'npc:forgewife-ada', marker: { landmark: 'landmark:kiln-great-kiln' } }],
        next: 'kiln',
      },
      {
        id: 'kiln', journal: 'In the middle of Kilnmouth stands a copy of the Great Kiln, built from memory, never lit. Ada wants you to see it.',
        objectives: [{ id: 'kiln', text: 'Look at Kilnmouth’s cold kiln', interact: 'obj:arcanist-kilnmouth-kiln', marker: { landmark: 'landmark:kiln-great-kiln' } }],
        onComplete: [{ startQuest: 'quest:arcanist-ashmaws-breath' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1, lore: ['lore:hc-kilnmouth'] },
  },
  {
    ...A2, id: 'quest:arcanist-ashmaws-breath', name: 'Ashmaw’s Breath', type: 'class', region: 'region:ash', giver: 'npc:forgewife-ada',
    summary: 'The kilns of the Ashfall are built around a beast that would not die. The Kilnmouth smiths draw its breath for their forges, and lately the breath has turned black.',
    requires: req(done('quest:arcanist-kilnmouth')), firstStage: 'escort',
    stages: [
      {
        id: 'escort', journal: 'Ada wants to read the breath at the vent head with her own hands. She is old, and the Ashfall is full of things that have gone hollow. Keep her alive.',
        onEnter: [{ escort: 'npc:forgewife-ada', to: 'landmark:arcanist-vent-head' }],
        objectives: [{ id: 'ada', text: 'Bring Forgewife Ada safely to the vent head', when: { any: [{ flag: 'escort.forgewife-ada', op: '==', value: 'arrived' }, { flag: 'escort.forgewife-ada', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:arcanist-vent-head' } }],
        next: [{ when: { flag: 'escort.forgewife-ada', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'read' }],
      },
      {
        id: 'regroup', journal: 'Ada fell, and the Kilnmouth smiths carried her home, swearing. She is already lacing her boots to try again.',
        onEnter: [{ escort: 'npc:forgewife-ada', to: 'landmark:arcanist-vent-head' }],
        objectives: [{ id: 'ada', text: 'Try again: bring Ada to the vent head', when: { any: [{ flag: 'escort.forgewife-ada', op: '==', value: 'arrived' }, { flag: 'escort.forgewife-ada', op: '==', value: 'lost' }] }, marker: { landmark: 'landmark:arcanist-vent-head' } }],
        next: [{ when: { flag: 'escort.forgewife-ada', op: '==', value: 'lost' }, to: 'regroup' }, { to: 'read' }],
      },
      {
        id: 'read', journal: 'Ada is kneeling at the vent head with her palm over the breath.',
        objectives: [{ id: 'ada', text: 'Hear what Ada reads in the breath', talk: 'npc:forgewife-ada', marker: { landmark: 'landmark:arcanist-vent-head' } }],
        next: 'vents',
      },
      {
        id: 'vents', journal: 'Three breath-vents feed the Kilnmouth forges. Follow them down.',
        objectives: [{ id: 'vents', text: 'Follow Ashmaw’s breath-vents', interact: 'obj:ashmaw-vent-*', count: 3, marker: { region: 'region:ash' } }],
        next: 'down',
      },
      {
        id: 'down', journal: 'The vents all lead to one place, under the oldest kiln.',
        objectives: [{ id: 'lair', text: 'Go down to Ashmaw', reach: 'inst:sentinel-ash' }],
        onComplete: [{ startQuest: 'quest:arcanist-ashmaw' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:arcanist-ashmaw', name: 'Ashmaw', type: 'class', region: 'region:ash', giver: 'npc:forgewife-ada',
    summary: 'Ashmaw, the Kiln-Beast, lit the Turning torches for a thousand years. The tears found it first.',
    requires: req(done('quest:arcanist-ashmaws-breath')), firstStage: 'fight',
    stages: [
      {
        id: 'fight', journal: 'Ashmaw is the Sentinel of the Ash school. Win its mark.',
        objectives: [{ id: 'ashmaw', text: 'Defeat Ashmaw', kill: 'bx_ashmaw', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-ash' }],
        next: 'release',
      },
      {
        id: 'release', journal: 'In its last breath Ashmaw spoke to you.',
        objectives: [{ id: 'mark', text: 'Hear Ashmaw out', when: { flag: 'story.sentinel.ash' } }],
        next: 'tell',
      },
      {
        id: 'tell', journal: 'Every forge in Kilnmouth went out at once when Ashmaw breathed its last. Ada will want to hear it from you.',
        objectives: [{ id: 'ada', text: 'Tell Ada that Ashmaw is at rest', talk: 'npc:forgewife-ada', marker: { landmark: 'landmark:kiln-great-kiln' } }],
        onComplete: [{ startQuest: 'quest:arcanist-the-provosts-smoke' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-sentinel-ashmaw'] },
  },
  {
    ...A2, id: 'quest:arcanist-the-provosts-smoke', name: 'The Provost’s Smoke', type: 'class', region: 'vil:gild', giver: 'npc:forgewife-ada',
    summary: 'The Kilnmouth smiths have seen black smoke over the Gilded Ruins, the kind that only a Kiln burning tears makes. Morrow is in Concordia.',
    requires: req(done('quest:arcanist-ashmaw')), firstStage: 'smoke',
    stages: [
      {
        id: 'smoke', journal: 'Black smoke over the Gilded Ruins, the kind only a kiln burning tears makes. Find where it comes from before you go asking.',
        objectives: [{ id: 'smoke', text: 'Trace the black smoke through the Gilded Ruins', interact: 'obj:arcanist-gild-smoke-*', count: 3, marker: { region: 'region:gilded' } }],
        next: 'brask',
      },
      {
        id: 'brask', journal: 'The foreman of the Sparkwright Works at Gildport listens to the Gilded Engine every night.',
        objectives: [{ id: 'brask', text: 'Ask at the Sparkwright Works in Gildport', talk: 'npc:gildport-foreman', marker: { landmark: 'landmark:gild-sparkwright-works' } }],
        onComplete: [{ startQuest: 'quest:arcanist-the-gilded-engine' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:arcanist-the-gilded-engine', name: 'The Gilded Engine', type: 'class', region: 'region:gilded', giver: 'npc:gildport-foreman',
    summary: 'Morrow is paying the Gilded Engine, the forge that made the crown’s settings, to forge one more: a setting that fits a human heart.',
    requires: req(done('quest:arcanist-the-provosts-smoke')), firstStage: 'ruins',
    stages: [
      {
        id: 'ruins', journal: 'The Engine still runs, buried in the gold of the Sparkwright city.',
        objectives: [{ id: 'lair', text: 'Go down into the Gilded Ruins', reach: 'inst:sentinel-iron', marker: { region: 'region:gilded' } }],
        next: 'engine',
      },
      {
        id: 'engine', journal: 'The Gilded Engine is the Sentinel of the Iron school. The Iron bearers cannot win its mark while Morrow’s gold keeps it burning.',
        objectives: [{ id: 'engine', text: 'Stop the Gilded Engine', kill: 'bx_engine', count: 1 }],
        onComplete: [{ openDialogue: 'dialogue:sentinel-release-iron' }, { setFlag: 'story.bearer.juggernaut', value: true }],
        next: 'setting',
      },
      {
        id: 'setting', journal: 'The Engine is still. In its cooling forge-bed lies whatever Morrow was paying it to make.',
        objectives: [{ id: 'setting', text: 'See what the Engine was forging for Morrow', interact: 'obj:arcanist-engine-setting' }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 3, gold: 300, lore: ['lore:hc-sentinel-engine'] },
  },
  {
    ...A2, id: 'quest:arcanist-a-letter-from-thrane', name: 'A Letter from Thrane', type: 'class', region: 'vil:brind', giver: 'npc:coalby-thrane',
    summary: 'A letter has come through the Ash arch from Kilnhold, carried by something small and determined.',
    requires: req(done('quest:arcanist-the-gilded-engine')), autoStart: true, firstStage: 'letter',
    stages: [
      {
        id: 'letter', journal: 'A letter from Kilnhold has arrived at the Gate Circle, a little damp.',
        objectives: [{ id: 'letter', text: 'Collect your letter at the Gate Circle', interact: 'obj:arch-ash', marker: { landmark: 'landmark:gate-circle' } }],
        next: 'reply',
      },
      {
        id: 'reply', journal: 'One of Dilly Coop’s soot-pigeons is waiting on the Ash arch, and it is not leaving without an answer.',
        objectives: [{ id: 'reply', text: 'Send a reply home by soot-pigeon', interact: 'obj:arcanist-pigeon-post', marker: { landmark: 'landmark:gate-circle' } }],
        onComplete: [{ setFlag: 'story.act2_ready', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A2, id: 'quest:arcanist-spark-and-ember', name: 'Spark and Ember', type: 'side', region: 'vil:gild', giver: 'npc:bearer-sparkwright',
    summary: 'The Sparkwright bearer is building a lightning tower at Gildport to wake the Stormcrow. It needs a fire-mage to start the boiler.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'coils',
    stages: [
      {
        id: 'coils', journal: 'Three copper coils at the top of Gildport’s clocktower need firing in order: low, high, low.',
        objectives: [{ id: 'coils', text: 'Fire the clocktower coils', interact: 'obj:gild-tower-coil-*', count: 3, marker: { landmark: 'landmark:gild-clocktower' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'The tower hums. Fizz Copperpot is laughing like a kettle.',
        // co-op: if a party member plays the Sparkwright, they ARE this bearer (the NPC is hidden)
        objectives: [{ id: 'fizz', text: 'Tell the Sparkwright bearer', when: { any: [{ flag: 'arcanist.fizz_thanked' }, { partyHasClass: 'sparkwright' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.sparkwright', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A2, id: 'quest:arcanist-the-knights-shame', name: 'The Knight’s Shame', type: 'side', region: 'region:gilded', giver: 'npc:bearer-knight',
    summary: 'The Knight bearer blames Iron for everything: the crown, the gates, the failing Kiln of Cinderreach. They want to stand where Berenika’s embassy stood, and they want company.',
    requires: req(done('quest:cc-stone-court')), autoStart: true, firstStage: 'embassy',
    stages: [
      {
        id: 'embassy', journal: 'The Iron embassy lies in the Gilded Ruins, under thirty years of gold dust.',
        objectives: [{ id: 'shrine', text: 'Visit Berenika’s embassy with the Knight bearer', interact: 'obj:berenika-shrine', marker: { landmark: 'landmark:berenika-shrine' } }],
        next: 'back',
      },
      {
        id: 'back', journal: 'Ser Edda Brand has something to say to you, back at the Stone Court.',
        objectives: [{ id: 'edda', text: 'Talk to the Knight bearer', when: { any: [{ flag: 'arcanist.edda_thanked' }, { partyHasClass: 'knight' }] }, marker: { landmark: 'landmark:stone-court' } }],
        onComplete: [{ setFlag: 'story.bearer.knight', value: true }],
        end: { status: 'completed' },
      },
    ],
    reward: { xpTier: 2 },
  },
  // ======================= ACT III: class quests (III-4 + 3 side)
  {
    ...A3, id: 'quest:arcanist-the-herald-of-ash', name: 'The Herald of Ash', type: 'class', region: 'region:heart', giver: 'npc:casimir',
    summary: 'At the top of the Twelve Stairs stands a living kiln in the Herald’s robes, ringing a bell of fire. It has Ignace Morrow’s face.',
    requires: req(done('quest:heart-stairs')), autoStart: true, firstStage: 'herald',
    stages: [
      { id: 'herald', journal: 'Morrow has become the Hollow King’s Herald: a kiln that will never go out.', objectives: [{ id: 'herald', text: 'Face the Herald of Ash', kill: 'cb_herald-of-ash', count: 1, marker: { landmark: 'landmark:twelve-stairs-top' } }], onComplete: [{ openDialogue: 'dialogue:arcanist-herald-fate' }], next: 'fate' },
      { id: 'fate', journal: 'The Herald kneels in its own fire, beaten, still burning.', objectives: [{ id: 'fate', text: 'Decide Morrow’s fate', when: { flag: 'arcanist.nemesis_fate' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 3 },
  },
  {
    ...A3, id: 'quest:arcanist-thranes-lantern', name: 'Thrane’s Lantern', type: 'side', region: 'region:heart', giver: 'npc:coalby-thrane',
    summary: '“Bring it back to me one day, lit.” Thrane’s lantern has hung on your belt all the way to the Heart.',
    requires: req({ flag: 'arcanist.thrane_lantern' }, done('quest:heart-citadel')), autoStart: true, firstStage: 'light',
    stages: [
      { id: 'light', journal: 'The crown’s cage burns with a fire that has never gone out. Light Thrane’s lantern from it.', objectives: [{ id: 'cage', text: 'Light Thrane’s lantern at the crown’s cage', when: { flag: 'arcanist.lantern_lit' }, marker: { region: 'region:heart' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 2 },
  },
  {
    ...A3, id: 'quest:arcanist-ignaces-apprentice', name: 'Ignace’s Apprentice', type: 'side', region: 'region:heart', giver: 'npc:lissa-marl',
    summary: 'Morrow’s young apprentice followed him into Concordia and walked into the Heart after him. She is standing in the Legion.',
    requires: req(done('quest:heart-legion')), autoStart: true, firstStage: 'find',
    stages: [
      { id: 'find', journal: 'A girl in a Conclave apprentice’s smock, standing in the Legion’s ranks, holding a ledger.', objectives: [{ id: 'lissa', text: 'Find Morrow’s apprentice in the Legion camp', talk: 'npc:lissa-marl', marker: { landmark: 'landmark:legion-camp' } }], next: 'ledger' },
      { id: 'ledger', journal: 'The ledger fell out of Lissa’s hands. Somebody should read the last page before it is trodden into the mud.', objectives: [{ id: 'ledger', text: 'Pick up Lissa’s ledger', interact: 'obj:arcanist-lissa-ledger', marker: { landmark: 'landmark:legion-camp' } }], next: 'page' },
      { id: 'page', journal: 'The last page is in Morrow’s hand, and it is about her.', objectives: [{ id: 'lissa', text: 'Show Lissa the last page', talk: 'npc:lissa-marl', marker: { landmark: 'landmark:legion-camp' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1 },
  },
  {
    ...A3, id: 'quest:arcanist-pudding-comes-home', name: 'Pudding Comes Home', type: 'side', region: 'region:heart', giver: 'npc:pudding-mother',
    summary: 'Something the size of a cottage, orange and extremely polite, has arrived at the camp on the edge of the Heart.',
    requires: req({ flag: 'story.heart_open' }, done('quest:arcanist-puddings-pedigree')), autoStart: true, firstStage: 'camp',
    stages: [
      { id: 'camp', journal: 'Pudding’s mother has come all the way from the Kiln Roots. Nobody at the camp knows what to do.', objectives: [{ id: 'mother', text: 'Greet Pudding’s mother at the Heart camp', talk: 'npc:pudding-mother', marker: { landmark: 'landmark:heart-camp' } }], end: { status: 'completed' } },
    ],
    reward: { xpTier: 1 },
  },
];

export default quests;
