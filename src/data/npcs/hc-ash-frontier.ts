/**
 * Hollow Crown, Cinderreach: the Bleeding Fields NPCs for the Reaver campaign (06-outlines/ash.md).
 * Zones: zone:ash-frontier-1 the Red Muster, -2 the Bleeding Fields, -3 Bone Ridge, -4 the Drakeholt. Owner: Claude 4.
 */
import type { NarrativeCondition, NpcDef } from '@/core';

const REV: NarrativeCondition = { heroClass: 'reaver' };
const at = (q: `quest:${string}`, stage: string): NarrativeCondition => ({ questStage: q, stage });
const Z1 = 'zone:ash-frontier-1' as const, Z3 = 'zone:ash-frontier-3' as const, Z4 = 'zone:ash-frontier-4' as const;

const npcs: NpcDef[] = [
  {
    id: 'npc:brenna-scald-hand', name: 'Brenna Scald-Hand', title: 'War-chief of the Red Muster', school: 'ash', origin: 'ash', trust: 3,
    services: ['Mentor', 'Trains Reavers'], region: Z1, home: 'landmark:brenna-tent', lore: 'lore:hc-brenna',
    presentWhen: REV,
    schedule: [
      { from: 0, to: 24, at: 'landmark:muster-palisade', activity: 'idle', when: at('quest:reaver-the-bell-on-the-fields', 'brenna') },
      { from: 0, to: 24, at: 'landmark:reaver-watchtower', activity: 'idle', when: at('quest:reaver-the-bell-on-the-fields', 'dawn') },
      { from: 0, to: 24, at: 'landmark:muster-ring', activity: 'idle', when: at('quest:reaver-the-muster-vote', 'vote') },
    ],
    dialogue: [
      { when: at('quest:reaver-the-bell-on-the-fields', 'brenna'), dialogue: 'dialogue:reaver-brenna-bell' },
      { when: at('quest:reaver-the-bell-on-the-fields', 'dawn'), dialogue: 'dialogue:reaver-brenna-dawn' },
      { when: at('quest:reaver-count-the-fallen', 'report'), dialogue: 'dialogue:reaver-brenna-fallen' },
      { when: at('quest:reaver-the-drake-roost', 'report'), dialogue: 'dialogue:reaver-brenna-banner' },
      { when: at('quest:reaver-hask-comes-home', 'brenna'), dialogue: 'dialogue:reaver-brenna-hask' },
      { when: at('quest:reaver-the-muster-vote', 'vote'), dialogue: 'dialogue:reaver-muster-vote' },
      { when: at('quest:reaver-the-unburnt', 'brenna'), dialogue: 'dialogue:reaver-brenna-unburnt' },
      { when: at('quest:reaver-the-last-muster', 'farewell'), dialogue: 'dialogue:reaver-brenna-farewell' },
      { when: at('quest:reaver-brennas-arm', 'story'), dialogue: 'dialogue:reaver-brenna-arm' },
      { when: at('quest:reaver-the-peace-axe', 'home'), dialogue: 'dialogue:reaver-brenna-peace-axe' },
      { dialogue: 'dialogue:reaver-brenna' },
    ],
    barks: [{ lines: ['Axes up. Eyes front. Feet warm.', 'Thirty years we’ve held this line. Thirty more if we must.', 'Eat. War’s no excuse for an empty belly.'] }],
    roles: ['quest', 'trainer'], essential: true,
    look: { skin: 0xb07a5a, hair: 0xd8d8d0, cloth: 0x6a1a14, accent: 0xff7a2a, build: 'broad' },
    bio: 'The old war-chief of the Red Muster, who raised the hero in the war-camp. Her right arm is burned black to the elbow. She has held the lava front for thirty years and has never once said she was tired.',
  },
  {
    id: 'npc:hask', name: 'Hask', title: 'of the Red Muster', school: 'ash', origin: 'ash', trust: 3,
    region: Z1, home: 'landmark:muster-palisade', lore: 'lore:hc-hask',
    // Act I at the Muster; Act III, beaten on the stair top, waiting for his fate (the scene must be reopenable)
    presentWhen: { all: [REV, { any: [{ questActive: 'quest:reaver-hask-comes-home' }, { questActive: 'quest:reaver-the-muster-vote' }, at('quest:reaver-the-unburnt-herald', 'fate')] }] },
    schedule: [{ from: 0, to: 24, at: 'landmark:twelve-stairs-top', activity: 'idle', when: at('quest:reaver-the-unburnt-herald', 'fate') }],
    dialogue: [
      { when: at('quest:reaver-the-unburnt-herald', 'fate'), dialogue: 'dialogue:reaver-herald-fate' },
      { when: at('quest:reaver-hask-comes-home', 'hask'), dialogue: 'dialogue:reaver-hask-home' },
      { dialogue: 'dialogue:reaver-hask' },
    ],
    barks: [{ lines: ['We can win it now. All of it. Forever.', '(He is standing in the brazier. He doesn’t seem to notice.)', 'Shield-sib! You waited up.'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0xc8946e, hair: 0x8a2a1a, cloth: 0x3a1a14, accent: 0x1a1a1a, build: 'tall' },
    bio: 'Brenna’s son and the hero’s shield-sibling, the best axe in the Muster. He went out onto the Fields alone the night the Bell rang, and came back smiling.',
  },
  {
    id: 'npc:jory-two-coin', name: 'Two-Coin Jory', title: 'Bookie of the Muster', school: 'ash', origin: 'ash', trust: 2,
    region: Z1, home: 'landmark:muster-wager-ring', presentWhen: REV,
    dialogue: [
      { when: at('quest:reaver-hask-comes-home', 'sentry'), dialogue: 'dialogue:reaver-jory-sentry' },
      { when: at('quest:reaver-a-wager-of-axes', 'jory'), dialogue: 'dialogue:reaver-jory-book-talk' },
      { dialogue: 'dialogue:reaver-jory' },
    ],
    barks: [{ lines: ['Two coins says you miss. One coin says you hit me.', 'Every war’s a wager, sib. Only nobody pays out.'] }],
    roles: ['quest'],
    look: { skin: 0xd0a080, hair: 0x2a1a14, cloth: 0x5a4a3a, accent: 0xffd36a, build: 'slight' },
    bio: 'The Muster’s bookie, who will take a bet on anything and has never paid out in full.',
  },
  {
    id: 'npc:cookie-mallow', name: 'Cookie Mallow', title: 'Cook of the Muster', school: 'ash', origin: 'ash', trust: 2,
    region: Z1, home: 'landmark:muster-cookfire', presentWhen: REV,
    dialogue: [
      { when: at('quest:reaver-the-muster-vote', 'speak'), dialogue: 'dialogue:reaver-cookie-vote' },
      { dialogue: 'dialogue:reaver-cookie' },
    ],
    barks: [{ lines: ['Last ox. Last one. Then it’s boots.', 'You want seconds? There weren’t firsts.'] }],
    roles: ['quest'],
    look: { skin: 0xc8a080, hair: 0x6a6a6a, cloth: 0x8a7a5a, accent: 0xff8a5a, build: 'broad' },
    bio: 'The Muster’s cook, who has fed three hundred Reavers on lava-mushrooms and stubbornness for longer than anyone can remember.',
  },
  {
    id: 'npc:quartermaster-grub', name: 'Quartermaster Grub', title: 'of the Red Muster', school: 'ash', origin: 'ash', trust: 1,
    region: Z1, home: 'landmark:muster-quartermaster', presentWhen: REV,
    dialogue: [
      { when: at('quest:reaver-the-muster-vote', 'speak'), dialogue: 'dialogue:reaver-grub-vote' },
      { when: at('quest:reaver-the-hermit-of-the-holt', 'grub'), dialogue: 'dialogue:reaver-grub-letter' },
      { dialogue: 'dialogue:reaver-grub' },
    ],
    barks: [{ lines: ['Bounties on the stake. Sign for your axe.', 'Lost it? Sign for that too.'] }],
    roles: ['quest'],
    look: { skin: 0xb88a6a, hair: 0x3a2a20, cloth: 0x4a3a2a, accent: 0xb08a3a, build: 'short' },
    bio: 'Keeper of the Muster’s stores, maps and bounties, who counts everything twice and trusts nothing once.',
  },
  {
    id: 'npc:old-tam', name: 'Old Tam', title: 'Ram-rider, retired', school: 'ash', origin: 'ash', trust: 2,
    region: Z3, home: 'landmark:bone-ridge-banners', presentWhen: REV,
    dialogue: [
      { when: at('quest:reaver-the-unburnt', 'camp'), dialogue: 'dialogue:reaver-tam-raid' },
      { dialogue: 'dialogue:reaver-old-tam' },
    ],
    barks: [{ lines: ['Cinder carried me through four wars. I can carry him one hill.'] }],
    roles: ['quest'],
    look: { skin: 0xa07a5a, hair: 0xe8e4dc, cloth: 0x5a2a1a, accent: 0xd0d0c8, build: 'short' },
    bio: 'The oldest ram-rider in the Muster. His war-ram, Old Cinder, died last week, and Tam will not let anyone else dig the grave.',
  },
  {
    id: 'npc:hermit-hild', name: 'Hild Ashfoot', title: 'the Hermit of the Holt', school: 'ash', origin: 'ash', trust: 0,
    region: Z4, home: 'landmark:hermit-hut', presentWhen: REV, lore: 'lore:hc-hild',
    dialogue: [
      { when: at('quest:reaver-the-drake-roost', 'climb'), dialogue: 'dialogue:reaver-hild-climb' },
      { when: at('quest:reaver-the-hermit-of-the-holt', 'reply'), dialogue: 'dialogue:reaver-hild-reply' },
      { when: at('quest:reaver-warm-eggs', 'hild'), dialogue: 'dialogue:reaver-hild-eggs' },
      { dialogue: 'dialogue:reaver-hild' },
    ],
    barks: [{ lines: ['Put the axe down. Nobody’s fighting up here.', 'I walked away from it. You can too. Nobody tells you that.'] }],
    roles: ['quest'],
    look: { skin: 0xc0a080, hair: 0xa8a8a0, cloth: 0x4a5a3a, accent: 0x8a8a8a, build: 'slight' },
    bio: 'An old Reaver who walked off the line twenty years ago and up into the Drakeholt, and has lived there with the drakes ever since. The Muster calls her a deserter. She calls herself retired.',
  },
  // ---------- Act II
  {
    id: 'npc:brenna-runner', name: 'Dunny Ashbrook', title: 'Runner of the Red Muster', school: 'ash', origin: 'ash', trust: 2,
    region: 'region:alder', home: 'landmark:gate-circle',
    presentWhen: { all: [REV, { any: [{ questActive: 'quest:reaver-brennas-runner' }, { questActive: 'quest:reaver-bring-him-home' }] }] },
    schedule: [
      { from: 0, to: 24, at: 'landmark:heart-camp', activity: 'idle', when: { questActive: 'quest:reaver-bring-him-home' } },
      // C-6: she follows you to the Gilded Goose for supper before she runs home
      { from: 0, to: 24, at: 'landmark:brind-gilded-goose', activity: 'idle', when: at('quest:reaver-brennas-runner', 'supper') },
    ],
    dialogue: [
      { when: at('quest:reaver-bring-him-home', 'home'), dialogue: 'dialogue:reaver-runner-stick' },
      { when: at('quest:reaver-bring-him-home', 'stair'), dialogue: 'dialogue:reaver-runner-wait' },
      { when: { questActive: 'quest:reaver-bring-him-home' }, dialogue: 'dialogue:reaver-runner-heart' },
      { when: at('quest:reaver-brennas-runner', 'supper'), dialogue: 'dialogue:reaver-runner-supper' },
      { dialogue: 'dialogue:reaver-brenna-runner' },
    ],
    barks: [{ lines: ['Ran the whole Cinder Road. Don’t tell the chief I stopped for breath.'] }],
    roles: ['quest'],
    look: { skin: 0xd8a888, hair: 0x8a2a1a, cloth: 0x6a1a14, accent: 0xff7a2a, build: 'slight' },
    bio: 'The Muster’s youngest runner, sent through the Cinder Gate with a message from Brenna.',
  },
  // ---------- Act II (Concordia) and Act III (the Heart), wave 2 depth
  {
    id: 'npc:orrin-mattock', name: 'Orrin Mattock', title: 'Smith of Kilnmouth, once of the Red Muster', school: 'ash', origin: 'ash', trust: 2,
    region: 'region:ash', home: 'landmark:kiln-great-kiln',
    presentWhen: { all: [REV, { flag: 'story.act', op: '>=', value: 2 }] },
    // C-1 under his axes at the Cinder Mug; after the escort (C-2) he stays at the vent head to listen; C-3 back at the Mug
    schedule: [
      { from: 0, to: 24, at: 'landmark:kiln-cinder-mug', activity: 'idle', when: at('quest:reaver-kilnmouth', 'axes') },
      { from: 0, to: 24, at: 'landmark:arcanist-vent-head', activity: 'idle', when: at('quest:reaver-ashmaws-breath', 'read') },
      { from: 0, to: 24, at: 'landmark:kiln-cinder-mug', activity: 'idle', when: at('quest:reaver-ashmaw', 'tell') },
    ],
    dialogue: [
      { when: at('quest:reaver-ashmaws-breath', 'read'), dialogue: 'dialogue:reaver-orrin-breath' },
      { when: at('quest:reaver-ashmaw', 'tell'), dialogue: 'dialogue:reaver-orrin-ashmaw' },
      { dialogue: 'dialogue:reaver-orrin' },
    ],
    barks: [{ lines: ['Four beats and a rest. Can you hear it? No? Good.', 'Mind the anvil. It bites.', 'Edge up means gone home. Remember that.'] }],
    roles: ['quest'],
    look: { skin: 0xc0906a, hair: 0xd8d8d0, cloth: 0x4a2a20, accent: 0x8a2a1a, build: 'broad' },
    bio: 'Second rank in Brenna Scald-Hand’s shield-wall until C. 1011, when he walked down the Cinder Road to sell axe-heads at the Turning fair and was shut on the wrong side of the arch. The Muster calls him a deserter. He hammers horseshoes now, under three axes hung edge up.',
  },
  {
    id: 'npc:ginnet-heart', name: 'Ginnet', title: 'of the Red Muster, fallen', school: 'ash', origin: 'ash', trust: 3,
    region: 'region:heart', home: 'landmark:legion-camp',
    presentWhen: { all: [REV, { any: [at('quest:reaver-the-hollow-muster', 'ginnet'), at('quest:reaver-the-hollow-muster', 'count')] }] },
    dialogue: [
      { when: at('quest:reaver-the-hollow-muster', 'ginnet'), dialogue: 'dialogue:reaver-ginnet-heart' },
      { dialogue: 'dialogue:reaver-ginnet' },
    ],
    barks: [{ lines: ['(She is humming. She stops, and frowns, and doesn’t start again.)'] }],
    roles: ['quest'],
    look: { skin: 0xb8a090, hair: 0x6a2a1a, cloth: 0x5a1a14, accent: 0x1a1a1a, build: 'average' },
    bio: 'First rank on the north gap of the Red Muster’s palisade, until the night of the Bell. She put her axe down because the law said to, and the hound did not know the law.',
  },
];

export default npcs;
