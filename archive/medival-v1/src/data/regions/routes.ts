/** Roads, rivers and ley-veins (WORLD.md §2.2). Points are world tiles. Names are Claude 4's canon. */
import type { RouteDef } from '@/world/types';
import { v } from './_valley';
import { UNMADE_ROAD } from './act3';

const routes: RouteDef[] = [
  // ---- rivers (rasterised first; roads crossing them become bridges)
  { id: 'route:river-hald', kind: 'river', width: 5, points: [[832, 330], [860, 520], [886, 650], [886, 740], [780, 792], [620, 820], [520, 830], [330, 860], [250, 870]] },
  { id: 'route:the-brindle', kind: 'stream', width: 2, points: [v(40, 252), v(70, 214), v(100, 186), v(124, 160), v(134, 146), v(152, 132), v(172, 116), v(182, 104)] },
  { id: 'route:river-grey', kind: 'river', width: 4, points: [v(236, 112), v(262, 122), [1150, 1030], [1250, 1060], [1330, 1088], [1420, 1060]] },

  // ---- roads
  // King's Way: Brackhaven → Witherdowns (skirting sealed Ylwen) → Haldren west gate → north gate → Dun Korrath-Gate.
  { id: 'route:kings-way', kind: 'road', width: 3, points: [[330, 832], [360, 900], [480, 940], [660, 900], [740, 790], [790, 704], [832, 704], [832, 660], [900, 610], [960, 560]] },
  // Pilgrim's Road: Haldren south gate → Aldermoor (north gap) → Brindlecross → south gap → Solenne.
  { id: 'route:pilgrims-road', kind: 'road', width: 3, points: [[832, 704], [832, 744], [880, 800], [968, 860], v(136, 0), v(136, 140), v(136, 255), [930, 1190], [760, 1210], [576, 1216]] },
  { id: 'route:varn-causeway', kind: 'road', width: 3, points: [v(136, 140), v(200, 146), v(255, 150), [1130, 1010], [1160, 990]] },
  { id: 'route:fen-track', kind: 'track', width: 2, points: [[1140, 1004], [1190, 1040], [1236, 1074]] },
  { id: 'route:ash-road', kind: 'old-road', width: 3, points: [[1160, 1000], [1120, 1200], [1088, 1344], [1400, 1250], [1728, 1088]], when: { flag: 'act2.ashroad_known' } },

  // ---- valley tracks
  { id: 'route:gloamwood-path', kind: 'track', width: 2, points: [v(134, 142), v(106, 152), v(88, 140), v(66, 100), v(44, 72), v(30, 44)] },
  { id: 'route:briar-track', kind: 'track', width: 2, points: [v(66, 100), v(46, 112)] },
  { id: 'route:moor-track', kind: 'track', width: 2, points: [v(160, 146), v(190, 176), v(210, 200)] },
  { id: 'route:shore-track', kind: 'track', width: 2, points: [v(150, 138), v(178, 122), v(196, 120)] },
  { id: 'route:ylwen-path', kind: 'track', width: 2, points: [[648, 760], [600, 772], [560, 790], [500, 760], [470, 730], [448, 722]], when: { flag: 'act1.ylwen_pact' } },
  // ---- Act II
  { id: 'route:korrath-road', kind: 'road', width: 3, points: [[960, 560], [956, 500], [940, 440], [960, 330]], when: { flag: 'act1.korrath_gate_open' } },
  { id: 'route:nails-track', kind: 'track', width: 2, points: [[968, 330], [1060, 360], [1152, 386], [1260, 360], [1344, 332]], when: { flag: 'act1.korrath_gate_open' } },
  { id: 'route:north-pass', kind: 'track', width: 2, points: [[950, 330], [840, 300], [704, 286]], when: { flag: 'act1.korrath_gate_open' } },
  { id: 'route:skelvik-road', kind: 'track', width: 2, points: [[704, 268], [690, 220], [520, 196], [346, 194]], when: { flag: 'act2.northpass_open' } },
  { id: 'route:valcastre-road', kind: 'road', width: 3, points: [[760, 1210], [800, 1250], [832, 1300]], when: { flag: 'act1.complete' } },
  // ---- Act III: from the Black Seep across the Breach to the Drowned Cathedral.
  { id: 'route:unmade-road', kind: 'old-road', width: 3, points: [[1350, 1092], ...UNMADE_ROAD], when: { flag: 'act3.breach_open' } },

  // ---- ley-veins (Edric's moor tors)
  { id: 'route:ley-edric', kind: 'ley', width: 3, points: [v(214, 168), v(230, 180), v(246, 194)] },
];

export default routes;
