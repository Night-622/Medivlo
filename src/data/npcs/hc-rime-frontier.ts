/**
 * Hollow Crown, Frostmere: the Wardwall NPCs for the Warden campaign (06-outlines/rime.md), plus the Warden's
 * Concordia people and the head of Wardenhold (shared by both Rime campaigns).
 * Zones: zone:rime-frontier-1 the Wardwall Gatehouse, -2 the Long Rampart, -3 the Wolfrun Passes, -4 the Jarlsfell. Owner: Claude 4.
 */
import type { NarrativeCondition, NpcDef } from '@/core';

const WD: NarrativeCondition = { heroClass: 'warden' };
const at = (q: `quest:${string}`, stage: string): NarrativeCondition => ({ questStage: q, stage });
const ACT1: NarrativeCondition = { all: [WD, { not: { flag: 'story.gate_open' } }] };
const ACT2: NarrativeCondition = { flag: 'story.act', op: '>=', value: 2 };
const Z1 = 'zone:rime-frontier-1' as const, Z2 = 'zone:rime-frontier-2' as const, Z3 = 'zone:rime-frontier-3' as const, Z4 = 'zone:rime-frontier-4' as const;

const npcs: NpcDef[] = [
  {
    id: 'npc:dagny-orr', name: 'Wall-Captain Dagny Orr', title: 'Captain of the Wardwall', school: 'rime', origin: 'rime', trust: 3,
    services: ['Mentor', 'Trains Wardens'], region: Z1, home: 'landmark:dagny-orr-quarters', lore: 'lore:hc-dagny-orr',
    presentWhen: WD,
    schedule: [
      { from: 0, to: 24, at: 'landmark:wardwall-drill-yard', activity: 'idle', when: { any: [at('quest:warden-the-horn-at-midnight', 'dagny'), at('quest:warden-the-wall-moot', 'moot')] } },
      { from: 0, to: 24, at: 'landmark:jarlsfell-steading-oven', activity: 'idle', when: { any: [at('quest:warden-a-captains-sister', 'steading'), at('quest:warden-a-captains-sister', 'laugh')] } },
      // I-9: she walks the hero down the gate road as far as the Wardens' boundary stone
      { from: 0, to: 24, at: 'landmark:warden-boundary-stone', activity: 'idle', when: { any: [at('quest:warden-the-long-walk', 'walk'), at('quest:warden-the-long-walk', 'stone')] } },
      // Act III: with the charter read at the Moot, Dagny comes to the Heart's edge herself (rime.md I-5)
      { from: 0, to: 24, at: 'landmark:heart-camp', activity: 'idle', when: { all: [{ questActive: 'quest:warden-dagnys-last-watch' }, { flag: 'warden.postern', value: 'charter' }] } },
    ],
    dialogue: [
      { when: { all: [{ questActive: 'quest:warden-dagnys-last-watch' }, { flag: 'warden.postern', value: 'charter' }] }, dialogue: 'dialogue:warden-dagny-heart' },
      { when: at('quest:warden-the-horn-at-midnight', 'dagny'), dialogue: 'dialogue:warden-dagny-horn' },
      { when: at('quest:warden-the-horn-at-midnight', 'quarters'), dialogue: 'dialogue:warden-dagny-quarters' },
      { when: at('quest:warden-the-long-walk', 'stone'), dialogue: 'dialogue:warden-dagny-boundary' },
      { when: at('quest:warden-the-watch-fires', 'report'), dialogue: 'dialogue:warden-dagny-fires' },
      { when: at('quest:warden-the-jarls-longhall', 'report'), dialogue: 'dialogue:warden-dagny-jarl' },
      { when: at('quest:warden-the-wallbreakers-parley', 'dagny'), dialogue: 'dialogue:warden-dagny-parley' },
      { when: at('quest:warden-the-wall-moot', 'moot'), dialogue: 'dialogue:warden-wall-moot' },
      { when: at('quest:warden-the-empty-banner', 'dagny'), dialogue: 'dialogue:warden-dagny-banner' },
      { when: at('quest:warden-the-long-walk', 'farewell'), dialogue: 'dialogue:warden-dagny-farewell' },
      { when: at('quest:warden-the-long-horn', 'story'), dialogue: 'dialogue:warden-dagny-long-horn' },
      { when: at('quest:warden-the-long-horn', 'dagny'), dialogue: 'dialogue:warden-dagny-charter' },
      { when: at('quest:warden-a-captains-sister', 'laugh'), dialogue: 'dialogue:warden-sisters' },
      { when: at('quest:warden-the-misheard-orders', 'again'), dialogue: 'dialogue:warden-dagny-clemmie' },
      { when: at('quest:warden-letters-over-the-wall', 'captain'), dialogue: 'dialogue:warden-dagny-letter' },
      { dialogue: 'dialogue:warden-dagny' },
    ],
    barks: [{ lines: ['WHAT?', 'Shields up! No, UP. That’s down.', 'I heard you. I always hear you. Say it again.'] }],
    roles: ['quest', 'trainer'], essential: true,
    look: { skin: 0xd0a888, hair: 0xb8b8b0, cloth: 0x3a4a5a, accent: 0xe8f0ff, build: 'broad' },
    bio: 'Captain of the Wardwall for twenty-eight years, gruff, fair and half deaf from horn-calls. She has been the hero’s captain since they could lift a shield. She speaks at one volume, which is loud, and her runners have been too frightened to ask her to repeat herself for twenty years.',
  },
  {
    id: 'npc:torvald-wallbreaker', name: 'Torvald Wallbreaker', title: 'once a Warden', school: 'rime', origin: 'rime', trust: 3,
    region: Z3, home: 'landmark:wolfrun-parley-cairn', lore: 'lore:hc-torvald',
    // Act I at the parley; Act III, beaten on the stair top, waiting for his fate (the scene must be reopenable)
    presentWhen: { all: [WD, { any: [{ questActive: 'quest:warden-the-wallbreakers-parley' }, at('quest:warden-the-herald-of-the-wall', 'fate')] }] },
    schedule: [{ from: 0, to: 24, at: 'landmark:twelve-stairs-top', activity: 'idle', when: at('quest:warden-the-herald-of-the-wall', 'fate') }],
    dialogue: [
      { when: at('quest:warden-the-herald-of-the-wall', 'fate'), dialogue: 'dialogue:warden-herald-fate' },
      { when: at('quest:warden-the-wallbreakers-parley', 'parley'), dialogue: 'dialogue:warden-torvald-parley' },
      { dialogue: 'dialogue:warden-torvald' },
    ],
    barks: [{ lines: ['Set your feet. You always forgot your feet.', 'One sledge. That’s all. One.', '(He is holding a parley-flag. He is not looking at it.)'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0xc8a080, hair: 0xc8783a, cloth: 0x5a5a6a, accent: 0x1a1a1a, build: 'tall' },
    bio: 'A big, gentle Warden who taught the hero to set a shield. Last winter he broke the Wardwall at the Breach to let his starving Outland kin through, and the black tears came in with them. Dagny branded him Wallbreaker and put him over the wall.',
  },
  // ---------- the Wardwall Gatehouse
  {
    id: 'npc:clemmie-briggs', name: 'Runner Clemmie Briggs', title: 'of the Captain’s runners', school: 'rime', origin: 'rime', trust: 2,
    region: Z1, home: 'landmark:wardwall-drill-yard', presentWhen: ACT1,
    dialogue: [{ dialogue: 'dialogue:warden-clemmie' }],
    barks: [{ lines: ['She said boat. I’m nearly sure she said boat.', 'You ask her. No, you ask her.'] }],
    roles: ['quest'],
    look: { skin: 0xe0c0a0, hair: 0xd8a050, cloth: 0x4a5a6a, accent: 0xe8f0ff, build: 'slight' },
    bio: 'The youngest of the Wall-Captain’s runners, who carries her orders round the Gatehouse and is terrified of getting them wrong, which she does, because everyone does.',
  },
  {
    id: 'npc:clemmie-briggs-heart', name: 'Runner Clemmie Briggs', title: 'a long way from the Gatehouse', school: 'rime', origin: 'rime', trust: 2,
    region: 'region:heart', home: 'landmark:heart-camp',
    presentWhen: { all: [WD, { questActive: 'quest:warden-dagnys-last-watch' }, { not: { flag: 'warden.postern', value: 'charter' } }] },
    dialogue: [{ dialogue: 'dialogue:warden-clemmie-heart' }],
    barks: [{ lines: ['Long, two short. Long, two short. I’ve got it right this time.', 'The Captain said not to hurry. I’m going to hurry.'] }],
    roles: ['quest'],
    look: { skin: 0xe0c0a0, hair: 0xd8a050, cloth: 0x4a5a6a, accent: 0xe8f0ff, build: 'slight' },
    bio: 'Dagny’s youngest runner, who carried the Wall-Captain’s last order all the way from the Wardwall to the edge of the Heart, saying it over every mile so as not to get it wrong.',
  },
  {
    id: 'npc:ebbe-strand', name: 'Quartermaster Ebbe Strand', title: 'of the Wardwall stores', school: 'rime', origin: 'rime', trust: 2,
    region: Z1, home: 'landmark:wardwall-stores', presentWhen: ACT1,
    dialogue: [
      { when: at('quest:warden-the-steading-oven', 'repaid'), dialogue: 'dialogue:warden-ebbe-loaf' },
      { dialogue: 'dialogue:warden-ebbe' },
    ],
    barks: [{ lines: ['Sums are fine. Sums are always fine.', 'Don’t look in that barrel. Or that one.'] }],
    roles: ['quest'],
    look: { skin: 0xc8a890, hair: 0x6a5a4a, cloth: 0x5a4a3a, accent: 0xb08a3a, build: 'short' },
    bio: 'The Wardwall’s quartermaster, whose sums have not added up for a year. He has a kind face and a nervous habit of counting barrels twice when anyone is watching.',
  },
  {
    id: 'npc:kettil-rask', name: 'Sergeant Kettil Rask', title: 'of the Gatehouse watch', school: 'rime', origin: 'rime', trust: 1,
    region: Z1, home: 'landmark:wardwall-drill-yard', presentWhen: ACT1,
    dialogue: [
      { when: at('quest:warden-the-wall-moot', 'canvass'), dialogue: 'dialogue:warden-kettil-canvass' },
      { dialogue: 'dialogue:warden-kettil' },
    ],
    barks: [{ lines: ['Bounties on the board. Read them. I’m not reading them to you.', 'Shield’s crooked. No, your other crooked.'] }],
    roles: ['quest'],
    look: { skin: 0xb88a6a, hair: 0x3a2a20, cloth: 0x3a4a5a, accent: 0xb08a3a, build: 'broad' },
    bio: 'The Gatehouse sergeant, who keeps the bounty board, the duty roster and a running list of everyone whose shield he has had to straighten.',
  },
  // ---------- the Long Rampart
  {
    id: 'npc:ingrith-halfmile', name: 'Old Ingrith Halfmile', title: 'Keeper of the Last Watch-Fire', school: 'rime', origin: 'rime', trust: 2,
    region: Z2, home: 'landmark:last-watch-fire', presentWhen: ACT1,
    dialogue: [
      { when: at('quest:warden-the-wall-moot', 'canvass'), dialogue: 'dialogue:warden-ingrith-canvass' },
      { dialogue: 'dialogue:warden-ingrith' },
    ],
    barks: [{ lines: ['Forty years. Never once relieved. Not that I’m counting.', 'Every light out there is somebody’s supper.'] }],
    roles: ['quest'],
    look: { skin: 0xc0a088, hair: 0xe8e8e0, cloth: 0x4a3a3a, accent: 0xff9a3a, build: 'short' },
    bio: 'The Warden who keeps the furthest watch-fire on the Long Rampart, alone, and has done for forty years. Nobody has ever relieved her. She suspects they have forgotten she is up there, and she has not reminded them.',
  },
  {
    id: 'npc:tilda-quarrel', name: 'Archer Tilda Quarrel', title: 'of the Rampart bowyers', school: 'rime', origin: 'rime', trust: 2,
    region: Z2, home: 'landmark:rampart-bowyers-post', presentWhen: ACT1,
    dialogue: [{ dialogue: 'dialogue:warden-tilda' }],
    barks: [{ lines: ['We don’t shoot letters. Officially.', 'Lovely day for a long shot. Over a wall. Hypothetically.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b8a0, hair: 0x2a1a14, cloth: 0x3a5a4a, accent: 0xe8f0ff, build: 'slight' },
    bio: 'An archer of the Long Rampart who, officially, has never shot a letter over the wall to her cousin in the Jarlsfell, and who has, unofficially, done it every week for a year.',
  },
  // ---------- the Wolfrun Passes
  {
    id: 'npc:white-pack-alpha', name: 'The White Alpha', title: 'a Snow Wolf, not hollow', school: 'rime', origin: 'rime',
    region: Z3, home: 'landmark:white-pack-den', presentWhen: ACT1,
    dialogue: [{ dialogue: 'dialogue:warden-white-alpha' }],
    barks: [{ lines: ['(A low growl, aimed past you, not at you.)', '(Behind her, in the den, something small yips.)'] }],
    roles: ['quest'],
    look: { skin: 0xf4f8ff, cloth: 0xd8e4f0, accent: 0x8ac8e8, build: 'average' },
    bio: 'A Snow Wolf alpha of the Wolfrun, white to the eyes and not hollow at all, standing between her pups and the wolves that are.',
  },
  {
    id: 'npc:signy-frosk', name: 'Signy Frosk', title: 'out of the hour', school: 'rime', origin: 'rime', trust: 1,
    region: Z3, home: 'landmark:wolfrun-snowed-hut', presentWhen: ACT1,
    schedule: [{ from: 0, to: 24, at: 'landmark:wardwall-drill-yard', activity: 'idle', when: at('quest:warden-out-of-the-hour', 'home') }],
    dialogue: [{ dialogue: 'dialogue:warden-signy' }],
    barks: [{ lines: ['My daughter is older than me. Don’t make a fuss about it, she hates that.', 'We walked out of Glacierhome. We should have walked faster.'] }],
    roles: ['quest'],
    look: { skin: 0xe8d0c0, hair: 0x8a6a4a, cloth: 0x5a4a6a, accent: 0xbfe8ff, build: 'slight' },
    bio: 'A grandmother who stayed in Glacierhome’s held hour for twenty years before she walked out of it, and is therefore younger than her own daughter. The family is snowed in in the Wolfrun Passes.',
  },
  // ---------- the Jarlsfell
  {
    id: 'npc:grandam-hekla', name: 'Grandam Hekla', title: 'of the Outland Clans', school: 'rime', origin: 'rime', trust: 1,
    region: Z4, home: 'landmark:jarlsfell-steading-oven', presentWhen: ACT1,
    dialogue: [
      { when: at('quest:warden-a-captains-sister', 'laugh'), dialogue: 'dialogue:warden-sisters' },
      { when: at('quest:warden-the-steading-oven', 'hekla'), dialogue: 'dialogue:warden-hekla-oven' },
      { dialogue: 'dialogue:warden-hekla' },
    ],
    barks: [{ lines: ['Wardens. Hmph. Come in, then, you’re letting the weather out.', 'I run this steading and I run the argument. Pick one to lose.'] }],
    roles: ['quest'],
    look: { skin: 0xc8a080, hair: 0xd8d8d0, cloth: 0x6a4a3a, accent: 0xe8f0ff, build: 'broad' },
    bio: 'The grandmother who runs the biggest steading in the Jarlsfell, and the argument in it. She is louder than the wind and has a laugh you can hear from the Wardwall, which is why nobody on the Wardwall mentions her.',
  },
  {
    id: 'npc:old-gubbins', name: 'Old Gubbins', title: 'a goat', school: 'rime', origin: 'rime', trust: 2,
    region: Z4, home: 'landmark:wall-postern', presentWhen: ACT1,
    schedule: [{ from: 0, to: 24, at: 'landmark:goat-stair', activity: 'idle', when: at('quest:warden-the-goat-that-crosses-walls', 'gubbins') }],
    dialogue: [{ dialogue: 'dialogue:warden-gubbins' }],
    barks: [{ lines: ['(Old Gubbins is eating a duty roster.)', '(He looks at you with the flat contempt of a goat who has crossed more walls than you.)'] }],
    roles: ['quest'],
    look: { skin: 0xd8d0c0, hair: 0x8a7a6a, cloth: 0x6a5a4a, accent: 0x3a2a1a, build: 'short' },
    bio: 'A clan goat who has climbed the Wardwall twice a day for years, morning and evening, in both directions. He is the only thing that crosses the wall freely, and he knows it.',
  },
  {
    id: 'npc:old-gubbins-heart', name: 'Old Gubbins', title: 'a goat, at the end of the world', school: 'rime', origin: 'rime', trust: 2,
    region: 'region:heart', home: 'landmark:heart-camp',
    presentWhen: { all: [WD, { questActive: 'quest:warden-the-goat-who-crosses-walls' }] },
    schedule: [{ from: 0, to: 24, at: 'landmark:legion-camp', activity: 'idle', when: { any: [at('quest:warden-the-goat-who-crosses-walls', 'path'), at('quest:warden-the-goat-who-crosses-walls', 'cairn')] } }],
    dialogue: [{ dialogue: 'dialogue:warden-gubbins-heart' }],
    barks: [{ lines: ['(Old Gubbins is eating a map.)', '(He has crossed one more wall than you, and he knows it.)'] }],
    roles: ['quest'],
    look: { skin: 0xd8d0c0, hair: 0x8a7a6a, cloth: 0x6a5a4a, accent: 0x3a2a1a, build: 'short' },
    bio: 'Old Gubbins followed the hero through the White Gate, the Gate Circle and the Weeping Wall, and nobody saw him do any of it.',
  },
  // ---------- Act II (Concordia)
  {
    id: 'npc:ingeborg-tull', name: 'Wardenmother Ingeborg Tull', title: 'of Wardenhold', school: 'rime', origin: 'rime', trust: 2,
    region: 'region:frost', home: 'landmark:warden-drill-yard', presentWhen: ACT2,
    dialogue: [
      { when: at('quest:warden-wardenhold', 'tull'), dialogue: 'dialogue:warden-ingeborg' },
      { when: at('quest:warden-rimeheart-colossus', 'tell'), dialogue: 'dialogue:warden-ingeborg-colossus' },
      { dialogue: 'dialogue:rime-ingeborg' },
    ],
    barks: [{ lines: ['Drill at dawn. Drill at dusk. Thirty years. The gate’s never once been attacked.', 'Shields up. Face north. Nothing’s coming. Face north anyway.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b8a0, hair: 0xe8e8e8, cloth: 0x3a4a5a, accent: 0xe8f0ff, build: 'broad' },
    bio: 'Head of Wardenhold, the Rime-folk village at the foot of Frostmere Pass. For thirty years she has drilled her Wardens at dawn and dusk, at a gate that faces nothing, because one day it might.',
  },
  {
    id: 'npc:ebbe-strand-wardenhold', name: 'Quartermaster Ebbe Strand', title: 'of the Wardenhold stores', school: 'rime', origin: 'rime', trust: 3,
    region: 'region:frost', home: 'landmark:warden-wardenhold-keep',
    presentWhen: { all: [WD, ACT2, { flag: 'warden.ebbe', value: 'helped' }] },
    dialogue: [{ dialogue: 'dialogue:warden-ebbe-wardenhold' }],
    barks: [{ lines: ['The sums add up here. It’s unsettling.', 'Bread for the clans? Ask. Just ask. You don’t have to cook anything.'] }],
    roles: ['ambient'],
    look: { skin: 0xc8a890, hair: 0x6a5a4a, cloth: 0x5a4a3a, accent: 0xb08a3a, build: 'short' },
    bio: 'Ebbe Strand came through the White Gate with the hero’s company and was made quartermaster of Wardenhold within a week, on the strength of being able to feed three hundred people out of a ledger that said there was nothing.',
  },
  {
    id: 'npc:thyri-coldbrook', name: 'Thyri Coldbrook', title: 'of the Outland Clans, far from home', school: 'rime', origin: 'rime', trust: 1,
    region: 'region:gloam', home: 'landmark:lodge-hunters-lodge',
    presentWhen: { all: [WD, ACT2] },
    schedule: [
      // C-4: escorted to the procession road, where she turned round; she waits there while you find the table
      { from: 0, to: 24, at: 'landmark:warden-procession-road', activity: 'idle', when: { any: [at('quest:warden-the-kept-out', 'read'), at('quest:warden-the-kept-out', 'camp')] } },
      // Act III: she comes up to the Heart behind the bearers, looking for her daughter among the clans
      { from: 0, to: 24, at: 'landmark:legion-camp', activity: 'idle', when: at('quest:warden-the-clans-in-the-camp', 'thyri') },
      { from: 0, to: 24, at: 'landmark:heart-camp', activity: 'idle', when: at('quest:warden-the-clans-in-the-camp', 'supper') },
    ],
    dialogue: [
      { when: at('quest:warden-the-kept-out', 'thyri'), dialogue: 'dialogue:warden-thyri' },
      { when: at('quest:warden-the-kept-out', 'read'), dialogue: 'dialogue:warden-thyri-road' },
      { when: at('quest:warden-the-clans-in-the-camp', 'thyri'), dialogue: 'dialogue:warden-thyri-clans' },
      { dialogue: 'dialogue:warden-thyri-general' },
    ],
    barks: [{ lines: ['He promised us a table. There’s no table. There’s only walking.', 'I left. I’m the only one who left.'] }],
    roles: ['quest'],
    look: { skin: 0xc8a080, hair: 0x2a2a2a, cloth: 0x6a4a3a, accent: 0xe8f0ff, build: 'slight' },
    bio: 'A clanswoman of the Jarlsfell who followed Torvald Wallbreaker through the White Gate and into the Gloamwood, and was the first to turn round. She is sheltering at Hollis Lodge, and she has not stopped shaking.',
  },
];

export default npcs;
