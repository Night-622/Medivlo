/** Haldren's street presence: crown watch, or Wick patrols under martial law (act1.ruler == 'wick'). Owner: Claude 4. */
import type { NpcDef } from '@/core';

const R = 'region:kingsvale' as const;
const wickRule = { flag: 'act1.ruler', op: '==' as const, value: 'wick' };
const crownRule = { not: wickRule };

const crownLook = { skin: 0xd9b8a0, hair: 0x5a4a3a, cloth: 0x2f4a7a, accent: 0xc8a046, build: 'average' as const };
const wickLook = { skin: 0xc8a07a, hair: 0x2a2018, cloth: 0x2a2320, accent: 0xe8d38a, build: 'broad' as const };

const npcs: NpcDef[] = [
  {
    id: 'npc:haldren-watch-gate', name: 'Gate Watchman', title: 'Crown Watch', people: 'haldish', faction: 'faction:crown-of-haldmarch',
    region: R, home: 'landmark:haldren-gate', presentWhen: crownRule, dialogue: [], roles: ['ambient'], look: crownLook,
    barks: [
      { when: { not: { flag: 'act1.complete' } }, lines: ['Keep moving. Refugees to the camp, traders to the market, troublemakers to the river.', 'Ser Bryce says nobody gets turned away hungry. Nobody gets fed, either.', 'Wick riders in and out all week. Mind your hands.'] },
      { when: { flag: 'act1.complete' }, lines: ['Varn’s ours again. Seven keep the Queen.', 'Heard you were at the causeway. That true, about the bells?'] },
    ],
    bio: 'Crown watchman at Haldren’s gate. Ambient.',
  },
  {
    id: 'npc:haldren-watch-market', name: 'Market Watchman', title: 'Crown Watch', people: 'haldish', faction: 'faction:crown-of-haldmarch',
    region: R, home: 'landmark:haldren-market', presentWhen: crownRule, dialogue: [], roles: ['ambient'], look: crownLook,
    barks: [{ lines: ['Bread’s rationed. Don’t ask me, ask the Protector.', 'Cutpurses about. Quiet Hand, they say, though nobody’s ever seen one.', 'If the Wick come for someone, you didn’t see it. Neither did I.'] }],
    bio: 'Crown watchman in Haldren market. Ambient.',
  },
  {
    id: 'npc:wick-patrol-gate', name: 'Wick Sergeant', title: 'Order of the Wick', people: 'solenni', faction: 'faction:order-of-the-wick',
    region: R, home: 'landmark:haldren-gate', presentWhen: wickRule, dialogue: [], roles: ['ambient'], look: wickLook,
    barks: [{ lines: ['Hands where I can see them. Both of them.', 'By order of the Lord-Inquisitor, all hedge-craft is suspended for the duration of the emergency.', 'The light remains, citizen. So do we.', 'Papers. Your Wick-writ, if you have one. If you haven’t, walk on and pray.'] }],
    bio: 'Wick sergeant at Haldren’s gate under martial law. Ambient.',
  },
  {
    id: 'npc:wick-patrol-market', name: 'Wick Patrol', title: 'Order of the Wick', people: 'solenni', faction: 'faction:order-of-the-wick',
    region: R, home: 'landmark:haldren-market', presentWhen: wickRule, dialogue: [], roles: ['ambient'], look: wickLook,
    barks: [{ lines: ['Curfew at the second bell. No exceptions.', 'We trim the wick so the flame burns true. Move along.', 'Anyone selling charms, cures or candles of colour is to be reported.', '(He watches your gloved hand for a long moment, then looks away.)'] }],
    bio: 'Wick patrol in Haldren market under martial law. Ambient.',
  },
];

export default npcs;
