/** Side-quest NPCs (Act II): Lantern Coast, Ironspine, Frostreach. docs/lore/15-side-content.md. Owner: Claude 4. New landmarks are placed by Claude 2. */
import type { NpcDef } from '@/core';

const side = { flag: 'content.side' };
const done = (q: `quest:${string}`) => ({ questCompleted: q });
const VINES = 'quest:side-lc-snow-on-the-vines', CANDLE = 'quest:side-lc-pilgrims-candle', SAGA = 'quest:side-fr-skalds-last-saga';

const npcs: NpcDef[] = [
  // ===== Lantern Coast
  {
    id: 'npc:brother-fulvio', name: 'Brother Fulvio', title: 'Examiner of Miracles', people: 'solenni', faction: 'faction:lanternate',
    region: 'region:lantern-coast', home: 'landmark:lc-vaudrac', presentWhen: side,
    schedule: [{ from: 21, to: 6, at: 'landmark:lc-vaudrac', activity: 'sleep' }, { from: 6, to: 21, at: 'landmark:lc-vaudrac', activity: 'work' }],
    dialogue: [{ dialogue: 'dialogue:side-lc-vines-fulvio' }],
    barks: [
      { when: done(VINES), lines: ['Cause not determined. A beautiful phrase. I may have it carved on my tomb.', 'Back to Solenne. Back to the Curia. Back to the fire, if they have one.'] },
      { lines: ['Forty-one miracles examined. Forty-one frauds. I am praying very hard for forty-two.', 'Do not kneel in the row, please. It confuses the evidence.', '(He is copying a page of canon law, and has spelled “miracle” wrong twice.)'] },
    ],
    roles: ['quest'],
    look: { skin: 0xb07a52, hair: 0x3a3028, cloth: 0x8a7a5a, accent: 0xd4a646, build: 'average' },
    bio: 'An advocate of the Curia’s Office of Miracles, 40s, plump, kindly and nervous, sent from Solenne to examine the green row at Vaudrac. In fifteen years he has never once found a miracle. He very much wants this one to be real, and is very much afraid of what the Wick will do if it is not.',
  },
  {
    id: 'npc:livia-marrou', name: 'Livia Marrou', title: 'Vintner of Vaudrac', people: 'solenni',
    region: 'region:lantern-coast', home: 'landmark:lc-vaudrac', presentWhen: side,
    schedule: [{ from: 7, to: 18, at: 'landmark:lc-saints-row', activity: 'work' }, { from: 18, to: 7, at: 'landmark:lc-vaudrac', activity: 'sleep' }],
    dialogue: [{ dialogue: 'dialogue:side-lc-vines-livia' }],
    barks: [
      { lines: ['A leaf for a copper. A cutting for a silver. Blessed by the saint, every one.', 'Mind the snow on the young wood.', 'The saint provides. The saint has always provided.'] },
    ],
    roles: ['quest'],
    look: { skin: 0xa8704a, hair: 0x2a2220, cloth: 0x5a2a3a, accent: 0xc8b48a, build: 'slight' },
    bio: 'A widowed vintner of Vaudrac, 50s, sharp, proud and worn thin. Her family has worked the row below the Saint’s Rest for eleven generations. When the vines went black after the Quench and the village began to starve, one row stayed green, and she has been selling its leaves to pilgrims ever since. She knows exactly why it is green.',
  },
  {
    id: 'npc:iacopo-marrou', name: 'Iacopo Marrou', people: 'solenni',
    region: 'region:lantern-coast', home: 'landmark:lc-vaudrac',
    presentWhen: { all: [side, { not: { flag: 'side.lc.vines.iacopo_taken' } }, { not: { flag: 'side.lc.vines.iacopo_licensed' } }] },
    schedule: [{ from: 21, to: 5, at: 'landmark:lc-saints-row', activity: 'work' }, { from: 5, to: 21, at: 'landmark:lc-vaudrac', activity: 'sleep' }],
    dialogue: [{ dialogue: 'dialogue:obj-lc-vine-row' }],
    barks: [{ lines: ['(He coughs into his sleeve, and looks at it, and wipes it on his breeches.)', 'I am only tired.', 'Don’t tell my mother you saw me.'] }],
    roles: ['quest'],
    look: { skin: 0xa8704a, hair: 0x1a1614, cloth: 0x6a5a40, accent: 0xb5481f, build: 'slight' },
    bio: 'Livia Marrou’s youngest son, sixteen, untaught and unlicensed, who found out on the night the vines went black that he could make things warm. He has been kneeling in the Saint’s Row every night since, pressing ember into the roots with his bare hands. He has the first grey cough of cinderlung, and has told no one.',
  },
  {
    id: 'npc:eydis-long-road', name: 'Eydis Long-Road', title: 'Pilgrim of the North', people: 'hrothi',
    region: 'region:lantern-coast', home: 'landmark:pilgrim-camp', presentWhen: side,
    // once her lantern is lit she walks home to her son's cairn at the Northern Pass
    schedule: [{ from: 0, to: 24, at: 'landmark:north-pass-camp', activity: 'pray', when: done(CANDLE) }],
    dialogue: [{ dialogue: 'dialogue:side-lc-candle-eydis' }],
    barks: [
      { when: done(CANDLE), lines: ['It still burns. Look.', 'Thrain. I brought it. I said I would.'] },
      { lines: ['(She is holding a cold lantern of Hrothi bronze in her lap, very carefully, as if it were asleep.)', 'Eighteen months, I walked. Eighteen months.', 'Lux manet, they said. Lux manet.'] },
    ],
    roles: ['quest'],
    look: { skin: 0xe8d8cc, hair: 0xd8d4cc, cloth: 0x5a5a62, accent: 0xb08a3a, build: 'tall' },
    bio: 'An old Hrothi widow of the Frostreach, one of the very few of her people to keep the Lantern. Her son Thrain fell at the Northern Pass with Hrolf Frostbeard, and a Haldish chaplain buried him under a lamp. Years later, widowed, she set out to walk to Solenne and carry a flame from the Brand back to his cairn. She arrived a year after it went dark.',
  },
  // ===== Ironspine
  {
    id: 'npc:ulka-coalheart', name: 'Ulka Coalheart', title: 'Hearth-Keeper of Clan Coalheart', people: 'orrun', faction: 'faction:iron-concord',
    region: 'region:ironspine', home: 'landmark:korrath-under-stone', presentWhen: side,
    dialogue: [{ dialogue: 'dialogue:side-is-ledger-ulka' }],
    barks: [
      { when: { flag: 'act2.korrath_flooded' }, lines: ['Under the water. All of it. Under the water.', '(She is writing names on her own forearm in charcoal, so as not to forget them.)'] },
      { lines: ['Walk soft. The Long Hall is full of the sleeping.', 'Coalheart remembers. That is what Coalheart is for.', '(She mutters a list of names under her breath, and starts again when she loses her place.)'] },
    ],
    roles: ['quest'],
    look: { skin: 0x7a7670, hair: 0xb8b4ac, cloth: 0x3a3a34, accent: 0x9a4a2a, build: 'short' },
    bio: 'The hearth-keeper of Clan Coalheart, one of the clans of the lower holds of Korrath, now sleeping on borrowed pallets in the Long Hall. It is her office to keep the clan’s hearth-ledger and speak its names on the longest night. She left the ledger below when the stair was barred, and has not forgiven herself.',
  },
  {
    id: 'npc:dhurm-stonebrow', name: 'Dhurm Stonebrow', title: 'Road-Warden of the High Road', people: 'orrun', faction: 'faction:iron-concord',
    region: 'region:ironspine', home: 'landmark:is-sentinel-road', presentWhen: side,
    dialogue: [{ dialogue: 'dialogue:side-is-patrol-dhurm' }],
    barks: [{ lines: ['Mind the ruts. They are not ours.', 'Three thousand years it walked and never troubled a soul. Three thousand.', 'Grenn. The cold gets into the hammer-hand.'] }],
    roles: ['quest'],
    look: { skin: 0x8a8278, hair: 0x5a4a3a, cloth: 0x4a4038, accent: 0x7a8a9a, build: 'broad' },
    bio: 'A road-warden of the Iron Concord, cousin to Hedda Stonebrow, who keeps the high ore-road over the ridges between Korrath and the eastern holds. He is practical, short-tempered and fond of the old sentinel that walks his road, though he would sooner swallow his hammer than say so.',
  },
  // ===== Frostreach
  {
    id: 'npc:bjorna-long-memory', name: 'Bjorna Long-Memory', title: 'Skald of Skelvik', people: 'hrothi', faction: 'faction:wolf-moot',
    region: 'region:frostreach', home: 'landmark:skelvik-hall',
    presentWhen: { all: [side, { not: done(SAGA) }] },
    dialogue: [{ dialogue: 'dialogue:side-fr-saga-bjorna' }],
    barks: [{ lines: ['Morrow’s doorstep is cold, and I am sitting on it.', 'Hear now. No. Not yet. Not that one.', '(She is counting kennings on her fingers, and runs out of fingers.)'] }],
    roles: ['quest'],
    look: { skin: 0xe8dcd4, hair: 0xe8e4dc, cloth: 0x4a3a4a, accent: 0x7a5a9a, build: 'slight' },
    bio: 'The eldest skald of Skelvik, past eighty, who sang at Sigrun Ice-Eye’s naming and at Hrolf Frostbeard’s homecoming, and has never once forgotten an oath. She is dying of the cold in her chest, slowly, on a bench by the long hearth, and has refused to go to Morrow until she has made one more saga worth remembering her by.',
  },
  {
    id: 'npc:ingrid-oar-breaker', name: 'Ingrid Oar-Breaker', title: 'of the Glacier Steading', people: 'hrothi', faction: 'faction:wolf-moot',
    region: 'region:frostreach', home: 'landmark:fr-glacier-steading', presentWhen: side,
    dialogue: [{ dialogue: 'dialogue:side-fr-longship-ingrid' }],
    barks: [
      { when: { flag: 'act2.hrothi_invasion' }, lines: ['My sons went south with the war-horns. Calun keep them. Nobody else will.'] },
      { lines: ['The ice talks at night. Don’t answer it.', 'Seal-leather again. Eat slow; it lasts longer.', '(She is mending a net there are no fish to fill.)'] },
    ],
    roles: ['quest'],
    look: { skin: 0xe4d4c8, hair: 0xc8a060, cloth: 0x5a4a3a, accent: 0x3a5a7a, build: 'broad' },
    bio: 'The headwoman of a fishing steading at the foot of a glacier east of Skelvik, broad, blunt and forty, who broke an oar over a raider’s head when she was fifteen and has been named for it ever since. Her boats are frozen in, her storehouse is empty, and her grandmother has started talking to the glacier.',
  },
  {
    id: 'npc:hrafn-the-seeker', name: 'Hrafn the Seeker', title: 'Steersman of the Wind-Hound', people: 'drowned',
    region: 'region:frostreach', home: 'landmark:fr-calving-glacier',
    presentWhen: { flag: 'never' }, // speaker only, in dialogue:obj-fr-ice-longship
    dialogue: [],
    look: { skin: 0xc8d4dc, hair: 0x8a9aa8, cloth: 0x3a4a5a, accent: 0xa8c8dc, build: 'tall' },
    bio: 'A Hrothi steersman of the old sagas who sailed north out of Skelvikfjord some four hundred years ago to find the place the wind goes looking, and never came home. He is Restless, held in the ice with his crew at their oars, and since Saela’s river froze he has had nowhere else to go.',
  },
];

export default npcs;
