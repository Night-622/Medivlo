/** Act I, Chapter 2 NPCs: allies in the cold (docs/lore/10-act1-spec.md). Owner: Claude 4. Landmarks are placed by Claude 2. */
import type { NpcDef } from '@/core';

const at = (quest: `quest:${string}`, stage: string) => ({ questStage: quest, stage });
const Q4 = 'quest:the-singing-wood', Q5 = 'quest:iron-and-oath', Q6 = 'quest:the-river-under', Q7 = 'quest:salt-and-silver', Q8 = 'quest:edrics-oath';
const following = (id: string) => ({ flag: `companion.${id}.following` });

const npcs: NpcDef[] = [
  // ----- Ylwen
  {
    id: 'npc:cadoc-ap-ynys', name: 'Cadoc ap Ynys', title: 'Keeper of the Hedge', people: 'aelthi', faction: 'faction:thornwise',
    region: 'region:kingsvale', home: 'landmark:thornwall',
    schedule: [{ from: 0, to: 24, at: 'landmark:caer-ylwen', activity: 'idle', when: { all: [{ flag: 'act1.ylwen_pact' }, { not: following('cadoc-ap-ynys') }] } }],
    dialogue: [
      { when: { questStage: 'quest:the-unsung-verse', stage: 'word' }, dialogue: 'dialogue:uv-cadoc-word' },
      { when: { all: [{ flag: 'companion.cadoc-ap-ynys.verse' }, { not: { flag: 'npc.cadoc-ap-ynys.uv_after' } }] }, dialogue: 'dialogue:uv-cadoc-after' },
      { when: { all: [{ flag: 'companion.cadoc-ap-ynys.following' }, { flag: 'companion.cadoc-ap-ynys.loyalty', op: '>=', value: 70 }, { not: { flag: 'companion.cadoc-ap-ynys.beat_70' } }] }, dialogue: 'dialogue:loyalty-cadoc-ap-ynys' },
      { when: { all: [{ flag: 'companion.cadoc-ap-ynys.following' }, { flag: 'companion.cadoc-ap-ynys.loyalty', op: '<=', value: 20 }, { not: { flag: 'companion.cadoc-ap-ynys.left' } }] }, dialogue: 'dialogue:loyalty-cadoc-ap-ynys-low' },
      { when: at(Q4, 'thornwall'), dialogue: 'dialogue:cadoc-thornwall' },
      { dialogue: 'dialogue:ch2-cadoc-general' },
    ],
    barks: [
      { when: following('cadoc-ap-ynys'), lines: ['Humans build such loud roads.', 'Hush. Something under the snow is dreaming about us.', 'My great-aunt would hate this. I am enjoying it enormously.', 'Hun, hun… No. Not here.'] },
      { when: at(Q4, 'thornwall'), lines: ['Don’t touch the hedge.'] },
    ],
    roles: ['quest', 'companion'], essential: true,
    look: { skin: 0xd8c8b0, hair: 0xb8c4a8, cloth: 0x4a5a42, accent: 0xc8d8e0, build: 'tall' },
    bio: 'Aelthi keeper of the Thornwall, 300 years old and the youngest in his family. Dry-witted and in disgrace: as a youth he sang the whole Lullaby to a Mire seep, and it closed. He knows more of the song than any living Aelthi should.',
    lore: 'lore:cadoc-ap-ynys',
  },
  {
    id: 'npc:rhiannon-ys-caer', name: 'Rhiannon Ys-Caer', title: 'Archdruid', people: 'aelthi', faction: 'faction:thornwise',
    lore: 'lore:rhiannon-ys-caer',
    region: 'region:ylwen-deepwood', home: 'landmark:grove-of-antlers',
    presentWhen: { any: [at(Q4, 'rhiannon'), { flag: 'act1.ylwen_pact' }] },
    schedule: [{ from: 0, to: 24, at: 'landmark:thornwall', activity: 'idle', when: at(Q4, 'rhiannon') }],
    dialogue: [
      { when: { questStage: 'quest:the-quiet-hollowing', stage: 'ylwen' }, dialogue: 'dialogue:qh-thornwise-keep' },
      { when: { all: [{ questStage: 'quest:the-unsung-verse', stage: 'shore' }, { not: { flag: 'companion.cadoc-ap-ynys.verse' } }] }, dialogue: 'dialogue:uv-rhiannon' },
      { when: { questStage: 'quest:the-drowned-voice', stage: 'counsel' }, dialogue: 'dialogue:ch6-rhiannon-counsel' },
      { when: at(Q4, 'rhiannon'), dialogue: 'dialogue:rhiannon-pact' },
      { dialogue: 'dialogue:ch2-rhiannon-general' },
    ],
    roles: ['quest', 'trainer'], essential: true,
    look: { skin: 0xc8b8a0, hair: 0xe0e4e8, cloth: 0x3a4a3a, accent: 0x7a9a5a, build: 'tall' },
    bio: 'Archdruid of the Thornwise Circle, ancient even for an Aelthi. She was a child in Ys Aerwen on the night it sank, and is the last who remembers the colour of its roofs. Gentle, grieving, and not to be argued with.',
  },
  // ----- Ironspine foothills
  {
    id: 'npc:grimma-ironsong', name: 'Grimma Ironsong', title: 'Runesmith', people: 'orrun', faction: 'faction:iron-concord',
    shop: 'shop:grimma-forge',
    region: 'region:ironspine-foothills', home: 'landmark:grimmas-forge',
    presentWhen: { not: { all: [{ questCompleted: Q5 }, { flag: 'act1.nails_kept' }] } },
    schedule: [{ from: 6, to: 20, at: 'landmark:grimmas-forge', activity: 'work', when: { not: following('grimma-ironsong') } }],
    dialogue: [
      { when: { questStage: 'quest:iron-remembers', stage: 'ring' }, dialogue: 'dialogue:ir-grimma-ring' },
      { when: { any: [{ questStage: 'quest:iron-remembers', stage: 'iron' }, { questStage: 'quest:iron-remembers', stage: 'hearing' }] }, dialogue: 'dialogue:ir-grimma-waiting' },
      { when: { all: [{ flag: 'companion.grimma-ironsong.ring' }, { not: { flag: 'npc.grimma-ironsong.ir_after' } }] }, dialogue: 'dialogue:ir-grimma-after' },
      { when: { all: [{ flag: 'companion.grimma-ironsong.following' }, { flag: 'companion.grimma-ironsong.loyalty', op: '>=', value: 70 }, { not: { flag: 'companion.grimma-ironsong.beat_70' } }] }, dialogue: 'dialogue:loyalty-grimma-ironsong' },
      { when: { all: [{ flag: 'companion.grimma-ironsong.following' }, { flag: 'companion.grimma-ironsong.loyalty', op: '<=', value: 20 }, { not: { flag: 'companion.grimma-ironsong.left' } }] }, dialogue: 'dialogue:loyalty-grimma-ironsong-low' },
      { when: at(Q5, 'grimma'), dialogue: 'dialogue:ch2-grimma-forge' },
      { dialogue: 'dialogue:ch2-grimma-general' },
    ],
    barks: [
      { when: following('grimma-ironsong'), lines: ['Hold still. Your buckle’s singing flat.', 'Grenn. Rust on everything this side of the mountain.', 'Seven hold. Seven. I counted.', 'Human roads. No drainage. Typical.'] },
      { when: { not: following('grimma-ironsong') }, lines: ['(The hammer rings. She does not look up.)'] },
    ],
    roles: ['quest', 'companion', 'merchant'], essential: true,
    look: { skin: 0x8a7a6a, hair: 0x3a2a22, cloth: 0x4a4038, accent: 0xb5481f, build: 'short' },
    bio: 'Orrun runesmith of Clan Ironsong, scratched from her clan’s ledger for telling the Hall that two of the Nine Nails have failed. Blunt, honest to the bone, and still right.',
    lore: 'lore:grimma-ironsong',
  },
  {
    id: 'npc:hedda-stonebrow', name: 'Hedda Stonebrow', title: 'Thane-Speaker', people: 'orrun', faction: 'faction:iron-concord',
    region: 'region:ironspine-foothills', home: 'landmark:dun-korrath-gate',
    dialogue: [
      { when: at(Q5, 'gate'), dialogue: 'dialogue:ch2-hedda-gate' },
      { when: at(Q5, 'judge'), dialogue: 'dialogue:hedda-nails' },
      { dialogue: 'dialogue:ch2-hedda-general' },
    ],
    barks: [{ when: { not: { flag: 'act1.korrath_gate_open' } }, lines: ['The gate is shut.', 'Watch the ground, not the road.', '(She rests a hand on the gate-chain, as if to steady it.)'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0x9a8a78, hair: 0xa8a8a0, cloth: 0x5a5a62, accent: 0xc0c0c8, build: 'short' },
    bio: 'Voice of High Thane Brannoch Deepforge at Dun Korrath-Gate. Proud of her office and frightened sick of what she knows: that the mountain is shifting under her boots, and the Thane will not say why.',
  },
  // ----- Witherdowns
  {
    id: 'npc:brother-ossory', name: 'Brother Ossory', title: 'Grey Monk of Morrow', people: 'haldish',
    region: 'region:witherdowns', home: 'landmark:ossuary-of-saint-calder',
    schedule: [{ from: 22, to: 4, at: 'landmark:ossuary-of-saint-calder', activity: 'pray' }],
    dialogue: [
      { when: { questStage: 'quest:the-drowned-voice', stage: 'counsel' }, dialogue: 'dialogue:ch6-ossory-counsel' },
      { when: at(Q6, 'ossuary'), dialogue: 'dialogue:ch2-ossory-ossuary' },
      { when: at(Q6, 'report'), dialogue: 'dialogue:ch2-ossory-report' },
      { dialogue: 'dialogue:ch2-ossory-general' },
    ],
    barks: [{ lines: ['Morrow keeps.', 'Mind Brother Aldo.', 'Sixty a night, and not a ferry among them.', '(He is humming to a skull.)'] }],
    roles: ['quest', 'trainer'], essential: true,
    look: { skin: 0xd8b898, hair: 0x6a5a4a, cloth: 0x7a7a78, accent: 0x3a3a40, build: 'average' },
    bio: 'Grey Monk of Morrow at the Ossuary of Saint Calder, keeper of bones and of the order’s silences. Gentle, morbidly cheerful, and far better informed than he lets on.',
  },
  // ----- Aldermoor
  {
    id: 'npc:cuthred', name: 'Cuthred', title: 'Sworn to Edric', people: 'drowned',
    shop: 'shop:barrow-keeper',
    region: 'region:aldermoor', home: 'landmark:edrics-barrow',
    presentWhen: at(Q8, 'tomb'),
    dialogue: [{ dialogue: 'dialogue:ch2-cuthred-farewell' }],
    look: { skin: 0xc8d8e0, hair: 0xe0e8ee, cloth: 0x8a9aa8, accent: 0x5a6a7a, build: 'tall' },
    bio: 'Sworn man of King Edric Barrowborn, dead three hundred years and still keeping the door of Edric’s true tomb. He cannot cross while the River Under is frozen. Mostly a voice through stone; he stands in the tomb only once the door is open.',
  },
  // ----- Saltreach
  {
    id: 'npc:wren-tallow', name: 'Wren Tallow', title: 'Factor of the Salt League', people: 'haldish', faction: 'faction:salt-league',
    shop: 'shop:salt-exchange',
    region: 'region:saltreach-coast', home: 'landmark:salt-exchange',
    dialogue: [
      { when: { questStage: 'quest:the-ember-auction', stage: 'passage' }, dialogue: 'dialogue:ch5s-wren-passage' },
      { when: at(Q7, 'wren'), dialogue: 'dialogue:wren-ember' },
      { dialogue: 'dialogue:ch2-wren-general' },
    ],
    barks: [{ lines: ['Everything has a price. Even you.', 'Herring’s up. Hope is down.', 'Favours keep, my dear. Coin rots.'] }],
    roles: ['quest', 'merchant'],
    look: { skin: 0xe0b090, hair: 0x6a3a1a, cloth: 0x2a6a5a, accent: 0xd4a646, build: 'slight' },
    bio: 'Factor of the Salt League at the Brackhaven Salt Exchange. Smiling, quick, ink to the elbows, and owed money by half the Saltreach. She deals in secrets as readily as herring.',
  },
];

export default npcs;
