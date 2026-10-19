/**
 * Hollow Crown, Ironhold: the Deepworks NPCs for the Juggernaut campaign (docs/lore/hollow-crown/06-outlines/iron.md),
 * plus the Juggernaut's Concordia NPCs (the Deepworks diggers at the Gilded Ruins, and Gussie's letter-bearer).
 * Zones: zone:iron-frontier-1 Rivet Town, -2 the Deepworks, -3 the Slag Rivers, -4 the Scrapfields. Owner: Claude 4.
 */
import type { NarrativeCondition, NpcDef } from '@/core';

const JG: NarrativeCondition = { heroClass: 'juggernaut' };
const at = (q: `quest:${string}`, stage: string): NarrativeCondition => ({ questStage: q, stage });
const Z1 = 'zone:iron-frontier-1' as const, Z2 = 'zone:iron-frontier-2' as const, Z3 = 'zone:iron-frontier-3' as const, Z4 = 'zone:iron-frontier-4' as const;

const npcs: NpcDef[] = [
  {
    id: 'npc:gussie-haldt', name: 'Foreman Gussie Haldt', title: 'Foreman of the Rivet Town shift', school: 'iron', origin: 'iron', trust: 3,
    services: ['Mentor', 'Trains Juggernauts'], region: Z1, home: 'landmark:gussie-whistle-house', lore: 'lore:hc-gussie-haldt',
    presentWhen: JG,
    schedule: [
      { from: 0, to: 24, at: 'landmark:rivet-shaft-head', activity: 'idle', when: at('quest:juggernaut-the-bell-in-the-rock', 'gussie') },
      { from: 0, to: 24, at: 'landmark:rivet-shaft-head', activity: 'idle', when: at('quest:juggernaut-the-whistle-vote', 'vote') },
      { from: 0, to: 24, at: 'landmark:rivet-shaft-head', activity: 'idle', when: at('quest:juggernaut-end-of-shift', 'farewell') },
      { from: 0, to: 24, at: 'landmark:rivet-tally-board', activity: 'idle', when: { any: [at('quest:juggernaut-the-bell-in-the-rock', 'board'), at('quest:juggernaut-the-bell-in-the-rock', 'tally')] } },
    ],
    dialogue: [
      { when: at('quest:juggernaut-the-bell-in-the-rock', 'tally'), dialogue: 'dialogue:juggernaut-gussie-tally' },
      { when: at('quest:juggernaut-the-bell-in-the-rock', 'gussie'), dialogue: 'dialogue:juggernaut-gussie-bell' },
      { when: at('quest:juggernaut-stopped-golems', 'gussie'), dialogue: 'dialogue:juggernaut-gussie-golems' },
      { when: at('quest:juggernaut-the-warden-foundry', 'gussie'), dialogue: 'dialogue:juggernaut-gussie-pails' },
      { when: at('quest:juggernaut-the-whistle-vote', 'vote'), dialogue: 'dialogue:juggernaut-whistle-vote' },
      { when: at('quest:juggernaut-pay-that-empties-you', 'gussie'), dialogue: 'dialogue:juggernaut-gussie-coin' },
      { when: at('quest:juggernaut-end-of-shift', 'farewell'), dialogue: 'dialogue:juggernaut-gussie-farewell' },
      { when: at('quest:juggernaut-haldts-lamp', 'gussie'), dialogue: 'dialogue:juggernaut-gussie-lamp' },
      { when: at('quest:juggernaut-the-first-whistle', 'gussie'), dialogue: 'dialogue:juggernaut-gussie-whistle' },
      { dialogue: 'dialogue:juggernaut-gussie' },
    ],
    barks: [{ lines: ['FORTY-ONE! Forty-one heads!', 'Anything for the shift. That’s the only answer down here.', 'WHAT? Sorry. Whistle-ears.'] }],
    roles: ['quest', 'trainer'], essential: true,
    look: { skin: 0xd8a888, hair: 0xb8402a, cloth: 0x4a3a2a, accent: 0xffd36a, build: 'short' },
    bio: 'Foreman of the Rivet Town shift: pocket-sized, extremely loud, and the keeper of the shift-whistle. She has run the hero’s shift since they were six and already taller than her, and stands on a crate to be seen. Her canary is called Sergeant.',
  },
  {
    id: 'npc:sergeant', name: 'Sergeant', title: 'the shift canary', school: 'iron', origin: 'iron', trust: 3,
    region: Z1, home: 'landmark:gussie-whistle-house',
    presentWhen: { all: [JG, { not: { flag: 'juggernaut.sergeant_pet' } }] },
    dialogue: [{ dialogue: 'dialogue:juggernaut-sergeant' }],
    barks: [{ lines: ['(One furious bar of song, aimed at the floor.)', '(He puffs up to twice his size and glares at you.)'] }],
    roles: ['ambient'],
    look: { skin: 0xffe14a, cloth: 0x8a6a3a, accent: 0xff9a2e, build: 'short' },
    bio: 'Gussie’s shift canary, in a brass cage on her belt. He sings for gas, for trouble and, since the Bell, at the floor.',
  },
  {
    id: 'npc:magda-ruhl', name: 'Magda Ruhl', title: 'the Smelter, mine-boss of the Hollow Lode', school: 'iron', origin: 'iron', trust: 2,
    region: Z1, home: 'landmark:rivet-company-store', lore: 'lore:hc-magda-ruhl',
    // Act I in Rivet Town; Act III, beaten on the stair top, waiting for her fate (the scene must be reopenable)
    presentWhen: { all: [JG, { any: [{ not: { flag: 'juggernaut.halfstone' } }, at('quest:juggernaut-the-furnace-heart', 'fate')] }] },
    schedule: [
      { from: 0, to: 24, at: 'landmark:twelve-stairs-top', activity: 'idle', when: at('quest:juggernaut-the-furnace-heart', 'fate') },
      { from: 0, to: 24, at: 'landmark:hollow-lode-mouth', activity: 'work', when: at('quest:juggernaut-pay-that-empties-you', 'magda') },
    ],
    dialogue: [
      { when: at('quest:juggernaut-the-furnace-heart', 'fate'), dialogue: 'dialogue:juggernaut-herald-fate' },
      { when: at('quest:juggernaut-the-smelters-wages', 'magda'), dialogue: 'dialogue:juggernaut-magda-store' },
      { when: at('quest:juggernaut-pay-that-empties-you', 'magda'), dialogue: 'dialogue:juggernaut-magda-lode' },
      { dialogue: 'dialogue:juggernaut-magda' },
    ],
    barks: [{ lines: ['Double wages, big one. In good new iron.', 'Everyone’s welcome at mine. Have a cup of tea.', 'Nobody ever paid us what the iron was worth.'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0xc89070, hair: 0x3a2a20, cloth: 0x5a3a20, accent: 0xff7a2a, build: 'broad' },
    bio: 'Mine-boss of the Hollow Lode, born four doors from the company store. Broad, warm, generous and absolutely sure of herself. She pays double in bright new coin, and her eyes are the only dry ones in the Deepworks.',
  },
  {
    id: 'npc:lotte-anvers', name: 'Big Lotte Anvers', title: 'the tallest Juggernaut in the Deepworks', school: 'iron', origin: 'iron', trust: 2,
    region: Z1, home: 'landmark:lotte-house', presentWhen: JG,
    dialogue: [{ dialogue: 'dialogue:juggernaut-lotte' }],
    barks: [{ lines: ['I’ve grown again. Mam says it’s the Bell.', 'Mind your head. Ha. Mind MY head.'] }],
    roles: ['quest'],
    look: { skin: 0xe0b898, hair: 0xe8c86a, cloth: 0x5a4a3a, accent: 0xb5481f, build: 'tall' },
    bio: 'The tallest Juggernaut in the Deepworks, who keeps growing, and whose mother keeps sending cheese.',
  },
  {
    id: 'npc:penny-grist', name: 'Penny Grist', title: 'Clerk of the company store', school: 'iron', origin: 'iron', trust: 2,
    region: Z1, home: 'landmark:rivet-company-store', presentWhen: JG,
    // Act III: she walks all the way to the Heart camp with the page from C. 1020
    schedule: [{ from: 0, to: 24, at: 'landmark:heart-camp', activity: 'idle', when: { questActive: 'quest:juggernaut-one-winter-coat' } }],
    dialogue: [
      { when: { questActive: 'quest:juggernaut-one-winter-coat' }, dialogue: 'dialogue:juggernaut-penny-heart' },
      { when: at('quest:juggernaut-the-smelters-wages', 'penny'), dialogue: 'dialogue:juggernaut-penny-step' },
      { dialogue: 'dialogue:juggernaut-penny' },
    ],
    barks: [{ lines: ['The auditors are coming. The auditors are always coming.', 'Credit? Well. I’ll write it down.'] }],
    roles: ['quest'],
    look: { skin: 0xe8c8b0, hair: 0x6a4a2a, cloth: 0x4a5a6a, accent: 0xc8c8c8, build: 'slight' },
    bio: 'The company store’s clerk for thirty years: very small, very neat, very frightened of auditors, and the quiet keeper of a second ledger of every debt she let go.',
  },
  {
    id: 'npc:ida-fettle', name: 'Tallyman Ida Fettle', title: 'of the Rivet Town tally board', school: 'iron', origin: 'iron', trust: 1,
    region: Z1, home: 'landmark:rivet-tally-board', presentWhen: JG,
    dialogue: [{ dialogue: 'dialogue:juggernaut-fettle' }],
    barks: [{ lines: ['Bounties on the left, missing pails on the right.', 'Tally it, or it didn’t happen.'] }],
    roles: ['quest'],
    look: { skin: 0xb07a5a, hair: 0x1a1a1a, cloth: 0x3a3a3a, accent: 0xffd36a, build: 'average' },
    bio: 'Keeper of Rivet Town’s tally board, where the shift’s bounties are chalked up beside its lost property.',
  },
  {
    id: 'npc:dilly-spoke', name: 'Dilly Spoke', title: 'Rail-runner of the Deepworks', school: 'iron', origin: 'iron', trust: 3,
    region: Z2, home: 'landmark:deepworks-rail-yard', presentWhen: JG,
    dialogue: [
      { when: at('quest:juggernaut-the-whistle-vote', 'canvass'), dialogue: 'dialogue:juggernaut-dilly-canvass' },
      { dialogue: 'dialogue:juggernaut-dilly' },
    ],
    barks: [{ lines: ['Race you! No? Race you anyway.', 'The Long Drop’s the best line. It’s the most likely to kill you.'] }],
    roles: ['quest'],
    look: { skin: 0xd8a888, hair: 0x2a1a14, cloth: 0x6a3a2a, accent: 0xffd36a, build: 'slight' },
    bio: 'A rail-runner who races ore-carts down the Deepworks lines for fun and has never once won against anybody heavier than her.',
  },
  {
    id: 'npc:selwyn-duckett', name: 'Old Selwyn Duckett', title: 'retired miner', school: 'iron', origin: 'iron', trust: 2,
    region: Z2, home: 'landmark:singing-seam', presentWhen: JG,
    dialogue: [
      { when: at('quest:juggernaut-the-whistle-vote', 'canvass'), dialogue: 'dialogue:juggernaut-selwyn-canvass' },
      { dialogue: 'dialogue:juggernaut-selwyn' },
    ],
    barks: [{ lines: ['They didn’t dig for iron, the first ones. They sang for it.', 'Fifty years down here. Never could carry a tune.'] }],
    roles: ['quest'],
    look: { skin: 0xc8a080, hair: 0xd0d0c8, cloth: 0x4a3a30, accent: 0x9aa4b0, build: 'short' },
    bio: 'Fifty years down the Deepworks, now retired to a bench by the oldest gallery, where he tells anybody who stops that the first miners sang to find iron.',
  },
  {
    id: 'npc:agathe-strell', name: 'Agathe Strell', title: 'Crane-driver of the Slag Rivers', school: 'iron', origin: 'iron', trust: 2,
    region: Z3, home: 'landmark:agathe-crane', presentWhen: JG,
    dialogue: [{ dialogue: 'dialogue:juggernaut-agathe' }],
    barks: [{ lines: ['I’m not coming down! Don’t ask!', 'Forty-four years I’ve driven her. She’s not done yet. Nor am I.'] }],
    roles: ['quest'],
    look: { skin: 0xd0a080, hair: 0xe8e4dc, cloth: 0x6a4a2a, accent: 0xff7a2a, build: 'average' },
    bio: 'The oldest crane-driver on the Slag Rivers, forty-four years in the same cab with the same flask of tea. She will not come down, and the slag beneath her has gone black.',
  },
  {
    id: 'npc:clem-bodkin', name: 'Clem Bodkin', title: 'shift child, aged ten', school: 'iron', origin: 'iron', trust: 3,
    region: Z3, home: 'landmark:slag-contest-yard', presentWhen: JG,
    dialogue: [{ dialogue: 'dialogue:juggernaut-clem' }],
    barks: [{ lines: ['I’m in charge of deciding. I decided.', 'I’m not crying. It’s the slag. It’s very bright.'] }],
    roles: ['quest'],
    look: { skin: 0xe8c4a8, hair: 0x8a2a1a, cloth: 0x5a4a3a, accent: 0xffd36a, build: 'slight' },
    bio: 'A shift child of ten who has appointed herself organiser of the yearly slag-sculpture contest, and who cries at everything, mostly at Gussie.',
  },
  {
    id: 'npc:nib-tinker', name: 'Nib', title: 'one of the Tinker Twins', school: 'iron', origin: 'iron', trust: 2,
    region: Z4, home: 'landmark:tinker-twins-cart', presentWhen: JG,
    dialogue: [{ dialogue: 'dialogue:juggernaut-nib' }],
    barks: [{ lines: ['Forward is THAT way.', 'A cart with no bell is just a heavy surprise.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b090, hair: 0x6a4a2a, cloth: 0x5a5a3a, accent: 0xb08a3a, build: 'short' },
    bio: 'One of the Tinker Twins of the Scrapfields, who is building a cart out of scrap and is not speaking to Nub.',
  },
  {
    id: 'npc:nub-tinker', name: 'Nub', title: 'the other Tinker Twin', school: 'iron', origin: 'iron', trust: 2,
    region: Z4, home: 'landmark:tinker-twins-cart', presentWhen: JG,
    dialogue: [{ dialogue: 'dialogue:juggernaut-nub' }],
    barks: [{ lines: ['Forward is THAT way. Nib once drove into a pond going forward.', 'I have the spanner. Therefore I am right.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b090, hair: 0x6a4a2a, cloth: 0x3a5a5a, accent: 0xb08a3a, build: 'short' },
    bio: 'The other Tinker Twin, who has the spanner, and is not speaking to Nib either.',
  },
  {
    id: 'npc:mother-teasdale', name: 'Old Mother Teasdale', title: 'widow of the C. 1031 collapse', school: 'iron', origin: 'iron', trust: 2,
    region: Z4, home: 'landmark:brotherhood-shrine', presentWhen: JG,
    dialogue: [{ dialogue: 'dialogue:juggernaut-teasdale' }],
    barks: [{ lines: ['A pick’s not just a pick.', 'Red haft. He painted it red so he could find it in the dark.'] }],
    roles: ['quest'],
    look: { skin: 0xd8b8a0, hair: 0xe8e4dc, cloth: 0x3a2a3a, accent: 0xb5481f, build: 'short' },
    bio: 'Widow of Walter Teasdale, who died in the collapse of C. 1031. She keeps the Brotherhood shrine at the edge of the Scrapfields.',
  },
  // ---------- Act II (Concordia)
  {
    id: 'npc:hobnail-jenks', name: 'Hobnail Jenks', title: 'Gaffer of the Gilded Ruins dig', school: 'iron', origin: 'iron', trust: 2,
    region: 'region:gilded', home: 'landmark:juggernaut-dig-camp', lore: 'lore:hc-iron-gilded-diggers',
    presentWhen: { flag: 'story.act', op: '>=', value: 2 },
    // Juggernaut C-1: escorted to the old bore-hole past the gold-line, where he lies listening
    schedule: [{ from: 0, to: 24, at: 'landmark:juggernaut-listening-shaft', activity: 'idle', when: at('quest:juggernaut-the-gold-diggers', 'hear') }],
    dialogue: [
      { when: at('quest:juggernaut-the-gold-diggers', 'hear'), dialogue: 'dialogue:juggernaut-jenks-shaft' },
      { when: at('quest:juggernaut-the-gilded-engine', 'tell'), dialogue: 'dialogue:juggernaut-jenks-engine' },
      { when: at('quest:juggernaut-the-gold-diggers', 'jenks'), dialogue: 'dialogue:juggernaut-jenks' },
      { dialogue: 'dialogue:iron-jenks' },
    ],
    barks: [{ lines: ['Paid in gold, searched for gold. You laugh or you cry.', 'Hear that? Hammering. Thirty years, never missed a stroke.'] }],
    roles: ['quest'],
    look: { skin: 0xc89070, hair: 0x8a8a8a, cloth: 0x4a3a2a, accent: 0xe8c87a, build: 'broad' },
    bio: 'Gaffer of the Deepworks exiles stranded in Concordia since C. 1012, who dig out the buried Sparkwright city for wages and have listened to something hammering under the gold for thirty years.',
  },
  {
    id: 'npc:dilly-spoke-gildport', name: 'Dilly Spoke', title: 'driver of the Gildport dig-carts', school: 'iron', origin: 'iron', trust: 3,
    region: 'region:gilded', home: 'landmark:juggernaut-dig-camp',
    presentWhen: { all: [JG, { flag: 'juggernaut.dilly_raced' }, { flag: 'story.act', op: '>=', value: 2 }] },
    dialogue: [{ dialogue: 'dialogue:juggernaut-dilly-gildport' }],
    barks: [{ lines: ['Gold rails! GOLD RAILS!'] }],
    roles: ['ambient'],
    look: { skin: 0xd8a888, hair: 0x2a1a14, cloth: 0x6a3a2a, accent: 0xffd36a, build: 'slight' },
    bio: 'Dilly came through the Iron Gate after you and talked her way into driving the dig-carts on the Gildport gold rails, which she says are faster.',
  },
  {
    id: 'npc:sergeant-concordia', name: 'Sergeant', title: 'the shift canary, a very long way from home', school: 'iron', origin: 'iron', trust: 3,
    region: 'region:alder', home: 'landmark:gate-circle',
    presentWhen: { all: [JG, { not: { flag: 'juggernaut.sergeant_pet' } }, { questActive: 'quest:juggernaut-three-short-blasts' }] },
    dialogue: [{ dialogue: 'dialogue:juggernaut-gussie-letter' }],
    barks: [{ lines: ['(He sings, furiously, at the whole of Concordia.)'] }],
    roles: ['quest'],
    look: { skin: 0xffe14a, cloth: 0x8a6a3a, accent: 0xff9a2e, build: 'short' },
    bio: 'Gussie’s canary, who has flown all the way through the Iron Gate with a letter tied to his leg and is extremely proud of it.',
  },
];

export default npcs;
