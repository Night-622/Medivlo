/** Side-quest givers and speakers: Kingsvale, Greywater, Witherdowns (docs/lore/15-side-content.md). Owner: Claude 4. Landmarks are placed by Claude 2. */
import type { NpcDef } from '@/core';

const SIDE = { flag: 'content.side' };
const at = (quest: `quest:${string}`, stage: string) => ({ questStage: quest, stage });
const is = (flag: string, value: string) => ({ flag, op: '==' as const, value });
const KV = 'region:kingsvale' as const, GW = 'region:greywater-marsh' as const, WD = 'region:witherdowns' as const;

const npcs: NpcDef[] = [
  // ----- Kingsvale
  {
    id: 'npc:martin-lowe', name: 'Martin Lowe', title: 'Master Lamplighter of Haldren', people: 'haldish', region: KV, home: 'landmark:kv-lantern-row',
    presentWhen: SIDE,
    schedule: [{ from: 16, to: 23, at: 'landmark:kv-lantern-row', activity: 'work', when: is('side.kv.lamplighters.outcome', 'church') }],
    dialogue: [{ dialogue: 'dialogue:side-kv-lamplighters-lowe' }],
    barks: [
      { when: { not: { flag: 'side.kv.lamplighters.outcome' } }, lines: ['Forty-one lamps, and not one of them honest.', 'No ladders. Not tonight. Not for the Wick, not for the Prior, not for the Seven.', 'Bertil was a good lad. Mind you don’t look too long at the light.'] },
      { when: is('side.kv.lamplighters.outcome', 'ember'), lines: ['Look at that. Red as a forge. Wardens’ light, my gran would have said, and crossed herself.', 'The Wick have been round twice to stare at my lamps. I let them.'] },
      { when: is('side.kv.lamplighters.outcome', 'camp'), lines: ['Dark Row, warm camp. I sleep easier.', 'The Prior says we’re apostates. The children at the camp say we’re heroes. I know who I’d rather believe.'] },
    ],
    roles: ['quest'],
    look: { skin: 0xd2a684, hair: 0x8a8a84, cloth: 0x3a3226, accent: 0xc8902e, build: 'tall' },
    bio: 'Master of the Lamplighters’ Guild of Haldren, 60s, long-armed and soot-fingered. He has lit the Lantern Row for forty years and has never once let a lamp go out before dawn. Since the Quench the lamps burn wrong, and since one of his lads walked into the Hald, he has called the guild out.',
  },
  {
    id: 'npc:osyth-reed', name: 'Osyth Reed', title: 'of Varn', people: 'haldish', region: KV, home: 'landmark:kv-wheatcombe',
    presentWhen: SIDE,
    dialogue: [{ dialogue: 'dialogue:side-kv-seed-corn-osyth' }],
    barks: [{ when: { not: { questCompleted: 'quest:side-kv-seed-corn' } }, lines: ['Forty of us. Thirty-eight. Count again tomorrow.', 'They can smell the bread from in there. Nobody’s baking it for us.', 'I dyed cloth in Varn. Blue, mostly. Funny what you miss.'] }],
    roles: ['quest'],
    look: { skin: 0xc89a78, hair: 0x3a2a20, cloth: 0x2a4a6a, accent: 0x5a5a4a, build: 'slight' },
    bio: 'A dyer from Varn, 30s, blue to the wrists still. She got out across the Causeway on the Night of Falling Ash with a neighbour’s two children and her own one, and has been walking the Kingsvale since, speaking for whoever is too tired to speak for themselves.',
  },
  {
    id: 'npc:wulfric-hay', name: 'Wulfric Hay', title: 'Reeve of Wheatcombe', people: 'haldish', faction: 'faction:crown-of-haldmarch', region: KV, home: 'landmark:kv-wheatcombe',
    presentWhen: SIDE,
    dialogue: [{ dialogue: 'dialogue:side-kv-seed-corn-wulfric' }],
    barks: [{ lines: ['Seed’s next year. Next year’s all we’ve got.', 'Don’t look at me like that. Somebody has to be the one who says no.', 'Gate stays barred.'] }],
    roles: ['quest'],
    look: { skin: 0xdab090, hair: 0xb89a6a, cloth: 0x5a4a2a, accent: 0x2f4a7a, build: 'broad' },
    bio: 'Reeve of the farm-village of Wheatcombe, 40s, a decent man with a ledger for a conscience. He has barred his gate against the refugees and the tithe-barn against his own village, and he has not told either of them what the Lord Protector’s levy took.',
  },

  // ----- Greywater
  {
    id: 'npc:old-cob', name: 'Old Cob', title: 'Eel-fisher of Fenwick', people: 'haldish', region: GW, home: 'landmark:fenwick-stilts',
    presentWhen: SIDE,
    schedule: [{ from: 6, to: 18, at: 'landmark:fenwick-stilts', activity: 'work' }],
    dialogue: [{ dialogue: 'dialogue:side-gw-eel-wives-cob' }],
    barks: [
      { when: { not: { questCompleted: 'quest:side-gw-eel-wives' } }, lines: ['Ninestake’s a good weir. Too good.', 'You don’t answer it. Whatever it sounds like. You don’t answer.', 'My Maud set those stakes, God rest her. Saela rest her. Somebody rest her.'] },
      { when: { questCompleted: 'quest:side-gw-eel-wives' }, lines: ['Eels are thin this year. Better thin eels than fat ones, I say now.', 'Hah. I laughed the night the temple burned. Laughed till I wept. You’ll forgive an old man.'] },
    ],
    roles: ['quest'],
    look: { skin: 0xb88a64, hair: 0xd8d8d0, cloth: 0x4a4a3a, accent: 0x6a4a2a, build: 'short' },
    bio: 'The oldest eel-fisher in Fenwick, 70s, toothless, salt-cured and much given to laughing at the wrong moment. His daughter Maud drowned setting the stakes at Ninestake Weir two winters before the Quench. He has raised her boy Jory since.',
  },
  {
    id: 'npc:jory', name: 'Jory', title: 'Cob’s grandson', people: 'haldish', region: GW, home: 'landmark:fenwick-stilts',
    presentWhen: { any: [is('side.gw.eel-wives.jory', 'saved'), is('side.gw.eel-wives.jory', 'scarred')] },
    dialogue: [{ dialogue: 'dialogue:side-gw-eel-wives-jory' }],
    barks: [{ lines: ['I’m mending the nets. Grandad says it keeps the hands busy.', 'I don’t go out past the first stake now.'] }],
    roles: ['ambient'],
    look: { skin: 0xc49a74, hair: 0x6a4a2e, cloth: 0x3a4a3a, accent: 0x6a6a5a, build: 'slight' },
    bio: 'Old Cob’s grandson, 17, a good fisher and a poor sleeper. He went out to Ninestake Weir after dark because he heard his mother singing there.',
  },
  {
    id: 'npc:ebba-gale', name: 'Ebba Gale', title: 'Sluice-keeper of the Ninth Sluice', people: 'haldish', region: GW, home: 'landmark:varn-causeway-end',
    presentWhen: SIDE,
    dialogue: [{ dialogue: 'dialogue:side-gw-bell-of-varn-ebba' }],
    barks: [
      { when: { not: { questCompleted: 'quest:side-gw-bell-of-varn' } }, lines: ['Water’s up a thumb since yesterday. It’s always up a thumb.', 'Lord Aldwin knew my name. Thirty years, every new moon. “Good evening, Ebba.” Every one.', 'The poor lads. Look at them. Still standing.'] },
      { when: is('side.gw.bell-of-varn.fate', 'rung'), lines: ['They lay down when it rang. Some of them. Lay down like it was bedtime.'] },
    ],
    roles: ['quest'],
    look: { skin: 0xc8a080, hair: 0x9a9a92, cloth: 0x4a5a5a, accent: 0x8a7a4a, build: 'broad' },
    bio: 'Keeper of the Ninth Sluice of Varn, 60s, the last of the sluice-keepers the charter told the lords of Varn to know by name. She lives in a turf hut at the end of the Causeway, keeps her daybook of the water out of habit, and watches the drowned knights on the Causeway as a mother watches sleeping sons.',
  },

  // ----- Witherdowns
  {
    id: 'npc:brother-wystan', name: 'Brother Wystan', title: 'Grey Monk of Morrow', people: 'haldish', region: WD, home: 'landmark:ossuary-of-saint-calder',
    presentWhen: SIDE,
    schedule: [{ from: 22, to: 4, at: 'landmark:ossuary-of-saint-calder', activity: 'pray' }],
    dialogue: [{ dialogue: 'dialogue:side-wd-unburied-wystan' }],
    barks: [{ lines: ['Knock. Knock. Knock. Every night, an hour past the lamp.', 'Brother Ossory says I am too young to be this tired. Brother Ossory is wrong about very little, which is tiresome.', 'Morrow keeps. Morrow keeps. I keep forgetting.'] }],
    roles: ['quest'],
    look: { skin: 0xe2c0a2, hair: 0xa07a4a, cloth: 0x7a7a78, accent: 0x3a3a40, build: 'slight' },
    bio: 'A young Grey Monk of the Ossuary of Saint Calder, 20s, earnest, ink-stained and badly short of sleep. He keeps the barrow watch on the nights no one else will, and has written down every knock.',
  },
  {
    id: 'npc:wulfstan-unsworn', name: 'Wulfstan', title: 'the Unsworn', people: 'drowned', region: WD, home: 'landmark:wd-nithing-barrow',
    presentWhen: { any: [at('quest:side-wd-unburied', 'wight'), at('quest:side-wd-unburied', 'door')] },
    schedule: [{ from: 0, to: 24, at: 'landmark:king-barrows', activity: 'idle', when: at('quest:side-wd-unburied', 'door') }],
    dialogue: [{ dialogue: 'dialogue:side-wd-unburied-wulfstan' }],
    barks: [{ lines: ['Hold, and be held. Hold, and be held.', 'Is it the ford? I can hear water.'] }],
    look: { skin: 0xb8c4c8, hair: 0x8a7a5a, cloth: 0x4a4a50, accent: 0x6a6a70, build: 'slight' },
    bio: 'A shield-boy of King Eadmer of the Downs, sixteen winters old when his king died, around 600 YL. He ran from the sealing of the king’s barrow, was caught at the ford, and was buried outside it face-down. Since the River Under froze he has walked every night to knock at his king’s door.',
  },
  {
    id: 'npc:hob-merriman', name: 'Hob Merriman', title: 'Scour-reeve of Morrowcombe', people: 'haldish', region: WD, home: 'landmark:wd-morrowcombe',
    presentWhen: SIDE,
    dialogue: [{ dialogue: 'dialogue:side-wd-chalk-giant-hob' }],
    barks: [
      { when: { not: { questCompleted: 'quest:side-wd-chalk-giant' } }, lines: ['When the Long Man greys, the dead walk. Well. He’s grey.', 'Eye, hammer, nail. That’s the order.', 'Dad would’ve had him white by now. Dad’s up there. That’s the trouble.'] },
      { when: { questCompleted: 'quest:side-wd-chalk-giant' }, lines: ['You can see him from the Ossuary now, white as milk.', 'Morrowcombe’ll scour him next year. Whatever year it is.'] },
    ],
    roles: ['quest'],
    look: { skin: 0xd4aa86, hair: 0x7a5a3a, cloth: 0x5a5a3a, accent: 0xe8e4d8, build: 'broad' },
    bio: 'Scour-reeve of the downs village of Morrowcombe, 40s, chalk to the elbows. His father Tolley was scour-master of the Long Man for twenty-nine years and died this autumn, in the weeks when there should have been a harvest. Tolley has not stopped working.',
  },
  {
    id: 'npc:tolley-merriman', name: 'Tolley Merriman', title: 'Scour-master, deceased', people: 'drowned', region: WD, home: 'landmark:wd-chalk-giant',
    presentWhen: { any: [at('quest:side-wd-chalk-giant', 'tolley'), is('side.wd.chalk-giant.fate', 'lantern')] },
    dialogue: [{ dialogue: 'dialogue:side-wd-chalk-giant-tolley' }],
    barks: [{ lines: ['Mind the lines. Mind the lines.', 'Eye, hammer, nail.', 'Never seen him so grey. Never.'] }],
    look: { skin: 0xc0c8c8, hair: 0xd8d8d0, cloth: 0x5a5a4a, accent: 0xe8e4d8, build: 'short' },
    bio: 'Scour-master of the Long Man of Morrowcombe from 1158 YL until his death in the autumn of 1187, the better part of a year after the River Under froze. He is still on the hill with his spade, because nobody has finished the scouring, and a scour-master does not leave a job half done.',
  },
];

export default npcs;
