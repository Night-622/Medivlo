/**
 * Hollow Crown, Frostmere: Glacierhome NPCs for the Rimecaller campaign (docs/lore/hollow-crown/06-outlines/rime.md),
 * plus the Rimecaller's Concordia people (Wardenhold, Lanternford).
 * Zones: zone:rime-capital-1 the Spire Stair, -2 the Hall of Held Hours, -3 the Frozen Market, -4 the Undercrypt. Owner: Claude 4.
 */
import type { NarrativeCondition, NpcDef } from '@/core';

const RC: NarrativeCondition = { heroClass: 'rimecaller' };
const at = (q: `quest:${string}`, stage: string): NarrativeCondition => ({ questStage: q, stage });
const ACT1: NarrativeCondition = { all: [RC, { not: { flag: 'story.gate_open' } }] };
const ACT2: NarrativeCondition = { flag: 'story.act', op: '>=', value: 2 };
const Z1 = 'zone:rime-capital-1' as const, Z2 = 'zone:rime-capital-2' as const, Z3 = 'zone:rime-capital-3' as const, Z4 = 'zone:rime-capital-4' as const;
const L3 = 'inst:rime-capital-lair-3' as const;

const npcs: NpcDef[] = [
  {
    id: 'npc:halla-vint', name: 'Archivist-Superior Halla Vint', title: 'Head of the Archive of the Spire', school: 'rime', origin: 'rime', trust: 2,
    services: ['Mentor', 'Trains Rimecallers'], region: Z1, home: 'landmark:halla-vint-study', lore: 'lore:hc-halla-vint',
    presentWhen: RC,
    // I-1: she comes out to the lamplighter on the Spire Stair the night of the tick, then walks ahead to her study
    schedule: [{ from: 0, to: 24, at: 'landmark:spire-stair-lamplighter', activity: 'idle', when: at('quest:rimecaller-the-first-tick', 'halla') }],
    dialogue: [
      { when: at('quest:rimecaller-the-first-tick', 'halla'), dialogue: 'dialogue:rimecaller-halla-tick' },
      { when: at('quest:rimecaller-the-first-tick', 'pin'), dialogue: 'dialogue:rimecaller-halla-pin' },
      { when: at('quest:rimecaller-the-hold-gauges', 'report'), dialogue: 'dialogue:rimecaller-halla-gauges' },
      { when: at('quest:rimecaller-the-melt-cisterns', 'report'), dialogue: 'dialogue:rimecaller-halla-cisterns' },
      { when: at('quest:rimecaller-the-next-room', 'halla'), dialogue: 'dialogue:rimecaller-halla-next-room' },
      { when: at('quest:rimecaller-the-next-room', 'tell'), dialogue: 'dialogue:rimecaller-halla-proof' },
      { when: at('quest:rimecaller-the-thaw-road', 'farewell'), dialogue: 'dialogue:rimecaller-halla-farewell' },
      { when: at('quest:rimecaller-the-first-keeping', 'halla'), dialogue: 'dialogue:rimecaller-halla-keeping' },
      { when: at('quest:rimecaller-something-new', 'drawer'), dialogue: 'dialogue:rimecaller-halla-new' },
      { when: at('quest:rimecaller-the-weather-clerk', 'witness'), dialogue: 'dialogue:rimecaller-halla-witness' },
      { when: at('quest:rimecaller-the-wraith-who-wanted-its-hat', 'halla'), dialogue: 'dialogue:rimecaller-halla-bertil' },
      { dialogue: 'dialogue:rimecaller-halla' },
    ],
    barks: [{ lines: ['Noted.', 'Nothing new under the glacier. Nothing at all. For thirty years.', 'Mind the lamplighter. He has been mid-blink since before you were born.'] }],
    roles: ['quest', 'trainer'], essential: true,
    look: { skin: 0xe8d8cc, hair: 0xc8ccd8, cloth: 0x2a4a7a, accent: 0xbfe8ff, build: 'slight' },
    bio: 'The Archivist-Superior of Glacierhome: precise, dry, sixty-odd, and the only person in the city who has noticed that nothing has happened for thirty years. She cuts the hour-pins that let the hour-walkers move inside the hold. She keeps a drawer marked NEW, and it is empty.',
  },
  {
    id: 'npc:seraphine-cold', name: 'Regent Seraphine Cold', title: 'Regent of Glacierhome, Keeper of the Clocks', school: 'rime', origin: 'rime', trust: 2,
    region: Z2, home: 'landmark:hall-of-held-hours', lore: 'lore:hc-seraphine-cold',
    // Act I in Glacierhome; Act III, beaten on the stair top, waiting for her fate (the scene must be reopenable)
    presentWhen: { all: [RC, { any: [{ not: { flag: 'rimecaller.halfstone' } }, at('quest:rimecaller-the-herald-of-the-held-hour', 'fate')] }] },
    schedule: [{ from: 0, to: 24, at: 'landmark:twelve-stairs-top', activity: 'idle', when: at('quest:rimecaller-the-herald-of-the-held-hour', 'fate') }],
    dialogue: [
      { when: at('quest:rimecaller-the-herald-of-the-held-hour', 'fate'), dialogue: 'dialogue:rimecaller-herald-fate' },
      { when: at('quest:rimecaller-the-regents-key', 'regent'), dialogue: 'dialogue:rimecaller-regent-key' },
      { when: at('quest:rimecaller-the-regents-key', 'report'), dialogue: 'dialogue:rimecaller-regent-report' },
      { when: at('quest:rimecaller-the-conduit-vote', 'vote'), dialogue: 'dialogue:rimecaller-conduit-vote' },
      { when: at('quest:rimecaller-the-longest-loaf', 'order'), dialogue: 'dialogue:rimecaller-regent-rye' },
      { dialogue: 'dialogue:rimecaller-seraphine' },
    ],
    barks: [{ lines: ['Every clock in this hall is mine to wind. I have not wound one in thirty years.', 'Forgive me. I am a little tired.', 'Still. Please. Just a little longer.'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0xf0e4dc, hair: 0x9aa4b4, cloth: 0xdce8f4, accent: 0x6a8ab0, build: 'tall' },
    bio: 'The Regent of Glacierhome, the only person permitted to wind the held clocks. Gracious, grey-eyed, a little older than she ought to be, and very tired. She walks the hold as easily as any hour-walker, and she has never said who cut her pin.',
  },
  {
    id: 'npc:anselm-cold', name: 'Anselm Cold', title: 'in the next room', school: 'rime', origin: 'rime',
    region: L3, home: 'landmark:regents-next-room', lore: 'lore:hc-anselm-cold',
    presentWhen: { all: [RC, { not: { flag: 'rimecaller.halfstone' } }] },
    dialogue: [{ dialogue: 'dialogue:rimecaller-anselm' }],
    barks: [{ lines: ['(He is breathing out. He has been breathing out for thirty years.)'] }],
    roles: ['ambient'],
    look: { skin: 0xd8ccc4, hair: 0xe8e8e8, cloth: 0x4a4a6a, accent: 0xbfe8ff, build: 'slight' },
    bio: 'An old man in a good chair by a cold window, his eyes half closed, a cup of something on the table beside him that will never cool.',
  },
  {
    id: 'npc:anselm-cold-heart', name: 'Anselm Cold', title: 'in the Legion camp', school: 'rime', origin: 'rime',
    region: 'region:heart', home: 'landmark:legion-camp',
    presentWhen: { all: [RC, { questActive: 'quest:rimecaller-anselm' }] },
    dialogue: [
      { when: at('quest:rimecaller-anselm', 'ring'), dialogue: 'dialogue:rimecaller-anselm-ringed' },
      { dialogue: 'dialogue:rimecaller-anselm-heart' },
    ],
    barks: [{ lines: ['(He is breathing out. The hollowed stand round his chair, very quietly, as if not to wake him.)'] }],
    roles: ['quest'],
    look: { skin: 0xd8ccc4, hair: 0xe8e8e8, cloth: 0x4a4a6a, accent: 0xbfe8ff, build: 'slight' },
    bio: 'Anselm Cold, still in his good chair, one breath from the end. Seraphine brought the chair all the way to the Heart; the Hollow King set it down in the middle of the Legion and kept it there, and the last of Glacierhome’s held hour came with it.',
  },
  {
    id: 'npc:aud-fellmark', name: 'Warden-Envoy Aud Fellmark', title: 'of the Wardens of the Wall', school: 'rime', origin: 'rime', trust: 1,
    region: Z2, home: 'landmark:hall-of-held-hours', presentWhen: ACT1,
    dialogue: [
      { when: at('quest:rimecaller-the-conduit-vote', 'canvass'), dialogue: 'dialogue:rimecaller-aud-canvass' },
      { when: at('quest:rimecaller-the-conduit-vote', 'envoy'), dialogue: 'dialogue:rimecaller-aud-envoy' },
      { when: at('quest:rimecaller-something-new', 'new'), dialogue: 'dialogue:rimecaller-aud-curse' },
      { dialogue: 'dialogue:rimecaller-aud' },
    ],
    barks: [{ lines: ['Thirty years I’ve been waiting for an answer. They’ve given me a chair.', 'It’s warmer on the Wall. And I mean that.'] }],
    roles: ['quest'],
    look: { skin: 0xc8a890, hair: 0x8a5a3a, cloth: 0x4a5a6a, accent: 0xe8f0ff, build: 'broad' },
    bio: 'A Warden from the Wardwall, sent up to Glacierhome as envoy in C. 1012 with a request for more cold. She walked into the hold and has been waiting for an answer ever since, in a chair, with her shield on her knees.',
  },
  // ---------- the Spire Stair
  {
    id: 'npc:pomfrey-dunn', name: 'Mistress Pomfrey Dunn', title: 'Baker of the Spire Stair', school: 'rime', origin: 'rime', trust: 2,
    region: Z1, home: 'landmark:pomfrey-bakery', presentWhen: ACT1,
    dialogue: [{ dialogue: 'dialogue:rimecaller-pomfrey' }],
    barks: [{ lines: ['Thirty years. It’s risen, I’ll give it that.', 'Don’t open the door. You’ll let the time in.'] }],
    roles: ['quest'],
    look: { skin: 0xe8c8b0, hair: 0xd8b070, cloth: 0xe8e0d0, accent: 0xc87a3a, build: 'broad' },
    bio: 'A baker whose oven sat right at the edge of the hold, so that she can move, very slowly, and her bread cannot. She has watched the same loaf rise for thirty years and has opinions about it.',
  },
  {
    id: 'npc:wendel-fross', name: 'Wendel Fross', title: 'Courier, mid-stride', school: 'rime', origin: 'rime',
    region: Z1, home: 'landmark:pomfrey-bakery', presentWhen: ACT1,
    dialogue: [
      { when: at('quest:rimecaller-mid-step', 'wendel'), dialogue: 'dialogue:rimecaller-wendel-crossed' },
      { dialogue: 'dialogue:rimecaller-wendel' },
    ],
    barks: [{ lines: ['(He is frozen with one foot off the step and a letter held out in front of him, as if someone has just called his name.)'] }],
    roles: ['quest'],
    look: { skin: 0xe0c0a8, hair: 0x4a3020, cloth: 0x3a5a8a, accent: 0xe8e8e8, build: 'slight' },
    bio: 'A courier caught mid-stride on the Spire Stair outside Pomfrey’s window, a letter in his outstretched hand. The ink has frozen too. You can read it backwards through the frost.',
  },
  {
    id: 'npc:osgar-rusk', name: 'Porter Osgar Rusk', title: 'of the Archive, and its notice-board', school: 'rime', origin: 'rime', trust: 1,
    region: Z1, home: 'landmark:spire-stair-board', presentWhen: ACT1,
    dialogue: [
      { when: at('quest:rimecaller-the-thief-who-never-got-away', 'osgar'), dialogue: 'dialogue:rimecaller-osgar-tin' },
      { dialogue: 'dialogue:rimecaller-osgar' },
    ],
    barks: [{ lines: ['Bounties on the board. Pinned with ice. Don’t breathe on them.', 'I walk the hold for the Archive. Mostly I walk it for the board.'] }],
    roles: ['quest'],
    look: { skin: 0xc8b098, hair: 0x6a6a6a, cloth: 0x5a6a7a, accent: 0xbfe8ff, build: 'short' },
    bio: 'The Archive’s porter and one of its oldest hour-walkers, who keeps the bounty board on the Spire Stair. He has posted the same three notices for thirty years, and recently, to his delight, a fourth.',
  },
  // ---------- the Hall of Held Hours
  {
    id: 'npc:cornelius-teal', name: 'Clerk Cornelius Teal', title: 'Keeper of the Weather Register', school: 'rime', origin: 'rime', trust: 2,
    region: Z2, home: 'landmark:hall-of-held-hours', presentWhen: ACT1,
    dialogue: [{ dialogue: 'dialogue:rimecaller-cornelius' }],
    barks: [{ lines: ['Cold; still. Cold; still. Cold; still.', 'Ten thousand nine hundred and fifty days. I have not missed one.'] }],
    roles: ['quest'],
    look: { skin: 0xe8d0c0, hair: 0x9a8a7a, cloth: 0x2a3a5a, accent: 0x9ad0ff, build: 'slight' },
    bio: 'The Archive’s weather clerk, an hour-walker who has written “cold; still” in the temperature register for ten thousand nine hundred and fifty days running. He has never once complained, and he would like, very much, to write something else.',
  },
  {
    id: 'npc:mabyn-frane', name: 'Under-Archivist Maudlin Frane', title: 'of the Treaty Stacks', school: 'rime', origin: 'rime', trust: 2,
    region: Z2, home: 'landmark:hall-of-held-hours', presentWhen: ACT1,
    dialogue: [{ dialogue: 'dialogue:rimecaller-mabyn' }],
    barks: [{ lines: ['Gloves. Gloves! It’s eight hundred years old.', 'Everything here is in order. The order is just very cold.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b8a0, hair: 0x2a2a3a, cloth: 0x3a4a6a, accent: 0xe8f0ff, build: 'average' },
    bio: 'An under-archivist and hour-walker who keeps the treaty stacks, and who has re-catalogued them four times in thirty years because there was nothing else to do.',
  },
  // ---------- the Frozen Market
  {
    id: 'npc:nim-larkspur', name: 'Nim Larkspur', title: 'Thief, mid-snatch', school: 'rime', origin: 'rime', trust: 1,
    region: Z3, home: 'landmark:frozen-market-stalls', presentWhen: ACT1,
    dialogue: [{ dialogue: 'dialogue:rimecaller-nim' }],
    barks: [{ lines: ['(His eyes follow you. Only his eyes.)', '(He looks, very hard, at the purse in his own hand, then at you.)'] }],
    roles: ['quest'],
    look: { skin: 0xd8b090, hair: 0x6a3a1a, cloth: 0x3a3a3a, accent: 0x9a8a5a, build: 'slight' },
    bio: 'A pickpocket caught mid-snatch in the Frozen Market for thirty years, with his hand in Widow Tern’s purse. The hold froze his body and not his mind. He has been awake the whole time, regretting it.',
  },
  {
    id: 'npc:brannoc-hulle', name: 'Brannoc Hulle', title: 'Ice-glass merchant, mid-haggle', school: 'rime', origin: 'rime',
    region: Z3, home: 'landmark:frozen-market-stalls', presentWhen: ACT1,
    dialogue: [{ dialogue: 'dialogue:rimecaller-brannoc' }],
    barks: [{ lines: ['(He is frozen with three fingers raised, which is either a price or an insult.)'] }],
    roles: ['quest'],
    look: { skin: 0xd0a880, hair: 0x3a2a1a, cloth: 0x6a3a5a, accent: 0xbfe8ff, build: 'broad' },
    bio: 'An ice-glass merchant of the Frozen Market, held mid-haggle over a sugar bowl for thirty years. He is holding up three fingers. Nobody knows three what.',
  },
  {
    id: 'npc:saffi-tern', name: 'Widow Saffi Tern', title: 'Customer, mid-haggle', school: 'rime', origin: 'rime',
    region: Z3, home: 'landmark:frozen-market-stalls', presentWhen: ACT1,
    dialogue: [{ dialogue: 'dialogue:rimecaller-saffi' }],
    barks: [{ lines: ['(She is frozen with one eyebrow raised at the sugar bowl. It has been raised for thirty years. It has not come down.)'] }],
    roles: ['quest'],
    look: { skin: 0xe0c8b8, hair: 0xd8d8d8, cloth: 0x2a4a3a, accent: 0xe8c86a, build: 'short' },
    bio: 'A widow of the Spire Stair, held mid-haggle with Brannoc Hulle over a sugar bowl, and mid-robbery by Nim Larkspur, and not remotely aware of either.',
  },
  {
    id: 'npc:greta-lind', name: 'Greta Lind', title: 'Glass-seller, mid-bargain', school: 'rime', origin: 'rime',
    region: Z3, home: 'landmark:frozen-market-stalls', presentWhen: RC,
    dialogue: [{ dialogue: 'dialogue:rimecaller-greta' }],
    barks: [{ lines: ['(She is frozen mid-laugh at something a customer said, thirty years ago, with a glass bird in her hand.)'] }],
    roles: ['quest'],
    look: { skin: 0xe8d0b8, hair: 0xc89a5a, cloth: 0x8a3a3a, accent: 0xe8f0ff, build: 'average' },
    bio: 'A seller of glass birds at the Frozen Market, caught mid-laugh. Wendel Fross was on his way to her with a letter when the hour stopped.',
  },
  // ---------- the Undercrypt
  {
    id: 'npc:gunnhild-tapp', name: 'Gunnhild Tapp', title: 'Keeper of the Drip-Counters', school: 'rime', origin: 'rime', trust: 2,
    region: Z4, home: 'landmark:rime-conduits', presentWhen: ACT1,
    dialogue: [
      { when: at('quest:rimecaller-the-conduit-vote', 'canvass'), dialogue: 'dialogue:rimecaller-gunnhild-canvass' },
      { dialogue: 'dialogue:rimecaller-gunnhild' },
    ],
    barks: [{ lines: ['Drip. Drip. Hush. You’ll make me lose count.', 'Four thousand and nine since breakfast. That’s high. That’s very high.'] }],
    roles: ['quest'],
    look: { skin: 0xc8a8a0, hair: 0x3a3a4a, cloth: 0x2a3a4a, accent: 0x6ac8e8, build: 'short' },
    bio: 'An hour-walker who keeps the drip-counters of the Undercrypt, measuring the hold’s failure drop by drop. She counts in her sleep, when she sleeps, which is not often.',
  },
  {
    id: 'npc:hatless-wraith', name: 'A Frost Wraith', title: 'without its hat', school: 'rime', origin: 'rime',
    region: Z4, home: 'landmark:rime-conduits',
    presentWhen: { all: [ACT1, { not: { questCompleted: 'quest:rimecaller-the-wraith-who-wanted-its-hat' } }] },
    dialogue: [{ dialogue: 'dialogue:rimecaller-wraith' }],
    barks: [{ lines: ['(It drifts to the tunnel wall, looks at something in the ice, and drifts back.)', '(It touches the top of its head, where nothing is.)'] }],
    roles: ['quest'],
    look: { skin: 0xd8f0ff, cloth: 0xa8c8e8, accent: 0xffffff, build: 'tall' },
    bio: 'A Frost Wraith of the Undercrypt that does not attack anyone. It keeps drifting back to one place in the tunnel wall, where a hat is frozen into the ice.',
  },
  // ---------- Act II (Concordia)
  {
    id: 'npc:mina-snell', name: 'Rememberer Wilhelmina Snell', title: 'of the Wardenhold Rime-folk', school: 'rime', origin: 'rime', trust: 2,
    region: 'region:frost', home: 'landmark:warden-wardenhold-keep', presentWhen: ACT2,
    // C-2: escorted up to the held road, where she waits with her brother's cart until the Colossus falls (C-3)
    schedule: [{
      from: 0, to: 24, at: 'landmark:rimecaller-held-road', activity: 'idle',
      when: { any: [at('quest:rimecaller-the-held-pass', 'read'), at('quest:rimecaller-the-held-pass', 'travellers'), at('quest:rimecaller-the-held-pass', 'up'), { questActive: 'quest:rimecaller-rimeheart-colossus' }] },
    }],
    dialogue: [
      { when: at('quest:rimecaller-wardenhold', 'snell'), dialogue: 'dialogue:rimecaller-mina' },
      { when: at('quest:rimecaller-the-held-pass', 'read'), dialogue: 'dialogue:rimecaller-mina-road' },
      { when: at('quest:rimecaller-rimeheart-colossus', 'tell'), dialogue: 'dialogue:rimecaller-mina-colossus' },
      { dialogue: 'dialogue:rime-mina' },
    ],
    barks: [{ lines: ['I remember it exactly. Everyone else remembers it wrong.', 'We kept no archive. We kept each other, which is louder.'] }],
    roles: ['quest'],
    look: { skin: 0xe0c8b8, hair: 0xe8e8f0, cloth: 0x3a5a8a, accent: 0xbfe8ff, build: 'short' },
    bio: 'The eldest Rimecaller of Wardenhold, stranded in Concordia since C. 1012. With no archive to keep, the Wardenhold Rime-folk have remembered everything aloud for thirty years, and Mina remembers it loudest.',
  },
  {
    id: 'npc:pomfrey-dunn-wardenhold', name: 'Mistress Pomfrey Dunn', title: 'Baker, newly arrived', school: 'rime', origin: 'rime', trust: 3,
    region: 'region:frost', home: 'landmark:warden-frost-forge',
    presentWhen: { all: [RC, ACT2, { flag: 'rimecaller.pomfrey_helped' }] },
    dialogue: [{ dialogue: 'dialogue:rimecaller-pomfrey-wardenhold' }],
    barks: [{ lines: ['Thirty years in the oven and it came out perfect. Don’t tell me it didn’t.', 'Have a slice. Have two. It’s been waiting.'] }],
    roles: ['ambient'],
    look: { skin: 0xe8c8b0, hair: 0xd8b070, cloth: 0xe8e0d0, accent: 0xc87a3a, build: 'broad' },
    bio: 'Pomfrey Dunn walked down off the glacier and through the White Gate with a loaf thirty years in the baking, and she is selling it by the slice at the Frost Forge, which has never smelled so good.',
  },
  {
    id: 'npc:cornelius-teal-wardenhold', name: 'Clerk Cornelius Teal', title: 'Keeper of the Wardenhold Register', school: 'rime', origin: 'rime', trust: 3,
    region: 'region:frost', home: 'landmark:warden-watchtower',
    presentWhen: { all: [RC, ACT2, { flag: 'rimecaller.teal_helped' }] },
    dialogue: [{ dialogue: 'dialogue:rimecaller-cornelius-wardenhold' }],
    barks: [{ lines: ['Drizzle! Actual drizzle!', 'Wind from the south-south-west, and a smell of goat. Marvellous.'] }],
    roles: ['ambient'],
    look: { skin: 0xe8d0c0, hair: 0x9a8a7a, cloth: 0x2a3a5a, accent: 0x9ad0ff, build: 'slight' },
    bio: 'Cornelius Teal has taken over the Wardenhold watchtower and keeps its weather register with an enthusiasm the Wardens find alarming. He has recorded eleven kinds of drizzle so far.',
  },
  {
    id: 'npc:hepsie-fenny', name: 'Lantern-Wife Hepsie Fenny', title: 'of the Lanternford Lantern Shop', school: 'rime', origin: 'concord', trust: 1,
    region: 'region:marsh', home: 'landmark:ford-lantern-shop', presentWhen: ACT2,
    dialogue: [
      { when: at('quest:rimecaller-the-regents-lanterns', 'fenny'), dialogue: 'dialogue:rimecaller-hepsie' },
      { dialogue: 'dialogue:rime-hepsie' },
    ],
    barks: [{ lines: ['Lanterns for the marsh. Honest ones. They only lead you where you’re going.', 'Don’t buy a light off the water. Not ever.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b8a0, hair: 0x5a4a3a, cloth: 0x2a5a5a, accent: 0xffe08a, build: 'average' },
    bio: 'Keeper of the Lantern Shop at Lanternford, half Rime-folk on her mother’s side, which she says is why she can tell a held light from an honest one at forty paces.',
  },
  {
    id: 'npc:nim-larkspur-ford', name: 'Nim Larkspur', title: 'Reformed, mostly', school: 'rime', origin: 'rime', trust: 3,
    region: 'region:marsh', home: 'landmark:ford-lantern-shop',
    presentWhen: { all: [RC, ACT2, { flag: 'rimecaller.nim_reformed' }] },
    dialogue: [{ dialogue: 'dialogue:rimecaller-nim-ford' }],
    barks: [{ lines: ['Thirty years standing still. I’m never standing still again.', 'I know every safe tussock in this marsh. I had a lot of time to plan.'] }],
    roles: ['ambient'],
    look: { skin: 0xd8b090, hair: 0x6a3a1a, cloth: 0x3a3a3a, accent: 0x9a8a5a, build: 'slight' },
    bio: 'Nim Larkspur walked out of the Frozen Market with empty hands and kept walking, all the way to Lanternford, where he guides travellers across the marsh for honest money and talks the whole way.',
  },
];

export default npcs;
