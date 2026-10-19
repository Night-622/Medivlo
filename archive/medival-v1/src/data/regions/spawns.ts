/** Prologue spawn tables (WORLD.md §4.5, §5.6). Enemy ids are Claude 3's; compositions per Claude 4's prologue spec. */
import type { SpawnTable } from '@/core';

const tables: SpawnTable[] = [
  { id: 'spawn:aldermoor-moor', entries: [{ enemy: 'enemy:gloamwood-wolf', weight: 1, level: [1, 2], group: [1, 1] }] },
  { id: 'spawn:gloamwood-edge', entries: [{ enemy: 'enemy:gloamwood-wolf', weight: 1, level: [1, 2], group: [1, 2] }] },
  {
    id: 'spawn:gloamwood-deep',
    entries: [
      { enemy: 'enemy:gloamwood-wolf', weight: 3, level: [2, 3], group: [2, 3] },
      { enemy: 'enemy:ashfoot-cutthroat', weight: 1, level: [2, 3], group: [1, 1] },
    ],
  },
  { id: 'spawn:wolf-hollow', entries: [{ enemy: 'enemy:gloamwood-wolf', weight: 1, level: [2, 2], group: [3, 3] }] },
  { id: 'spawn:ley-tors', entries: [{ enemy: 'enemy:gloamwood-wolf', weight: 1, level: [3, 3], group: [2, 2] }] },
  { id: 'spawn:festival', entries: [{ enemy: 'enemy:hollowed-thrall', weight: 1, level: [1, 1], group: [4, 4] }] },
  { id: 'spawn:green-inquisition', entries: [{ enemy: 'enemy:wick-soldier', weight: 1, level: [3, 4], group: [3, 3] }] },
  { id: 'spawn:weeping-stones-boss', entries: [{ enemy: 'enemy:hollowed-white-stag', weight: 1, level: [3, 3], group: [1, 1] }] },
  { id: 'spawn:giants-sluice', entries: [{ enemy: 'enemy:mireling', weight: 1, level: [3, 3], group: [5, 5] }] },
  { id: 'spawn:wennamere-seep', entries: [{ enemy: 'enemy:mireling', weight: 1, level: [2, 3], group: [1, 2], time: 'night' }] },
  { id: 'spawn:abbey-nave-thralls', entries: [{ enemy: 'enemy:hollowed-thrall', weight: 1, level: [4, 4], group: [4, 4] }] },
  { id: 'spawn:abbey-nave-dead', entries: [{ enemy: 'enemy:drowned-dead', weight: 1, level: [4, 4], group: [3, 3] }] },
  {
    id: 'spawn:abbey-crypt',
    entries: [
      { enemy: 'enemy:hollowed-thrall', weight: 1, level: [4, 5], group: [2, 3] },
      { enemy: 'enemy:drowned-dead', weight: 1, level: [4, 5], group: [2, 3] },
    ],
  },
  { id: 'spawn:abbey-reliquary', entries: [{ enemy: 'enemy:abbess-morwen', weight: 1, level: [5, 5], group: [1, 1] }] },
  { id: 'spawn:edrics-cutthroats', entries: [{ enemy: 'enemy:ashfoot-cutthroat', weight: 1, level: [3, 4], group: [2, 2] }] },
  { id: 'spawn:edrics-archers', entries: [{ enemy: 'enemy:ashfoot-archer', weight: 1, level: [3, 4], group: [2, 2] }] },
  // ---- Act I: Kingsvale (Claude 3's ids; T2 = levels 6–12)
  { id: 'spawn:market-brawl', entries: [{ enemy: 'enemy:wick-soldier', weight: 1, level: [8, 8], group: [2, 2] }] },
  { id: 'spawn:cinderhold-crag', entries: [{ enemy: 'enemy:cinder-shade', weight: 1, level: [8, 10], group: [1, 2] }] },
  { id: 'spawn:cinderhold-shades', entries: [{ enemy: 'enemy:cinder-shade', weight: 1, level: [9, 10], group: [3, 3] }] },
  { id: 'spawn:kingsvale-fields', entries: [{ enemy: 'enemy:gloamwood-wolf', weight: 1, level: [6, 8], group: [1, 3] }] },
  {
    id: 'spawn:kingsway-bandits',
    entries: [
      { enemy: 'enemy:ashfoot-cutthroat', weight: 2, level: [7, 9], group: [1, 2] },
      { enemy: 'enemy:ashfoot-archer', weight: 1, level: [7, 9], group: [1, 1] },
    ],
  },
  { id: 'spawn:kingsvale-seep', entries: [{ enemy: 'enemy:mireling', weight: 1, level: [6, 8], group: [1, 2], time: 'night' }] },
  // ---- Act I: Greywater
  { id: 'spawn:black-seep', entries: [{ enemy: 'enemy:mireling', weight: 1, level: [7, 9], group: [1, 2] }] },
  { id: 'spawn:varn-causeway', entries: [{ enemy: 'enemy:drowned-knight', weight: 1, level: [10, 11], group: [1, 1] }, { enemy: 'enemy:choir-acolyte', weight: 2, level: [8, 10], group: [1, 2] }] },
  { id: 'spawn:reed-isles', entries: [{ enemy: 'enemy:choir-acolyte', weight: 2, level: [8, 10], group: [1, 2] }, { enemy: 'enemy:reed-priest', weight: 1, level: [9, 10], group: [1, 1] }] },
  { id: 'spawn:greywater-fens', entries: [{ enemy: 'enemy:mireling', weight: 2, level: [7, 9], group: [1, 3] }, { enemy: 'enemy:hollowed-thrall', weight: 1, level: [7, 9], group: [1, 2] }] },
  { id: 'spawn:varn-knights', entries: [{ enemy: 'enemy:drowned-knight', weight: 1, level: [11, 12], group: [3, 3] }] },
  { id: 'spawn:varn-choir', entries: [{ enemy: 'enemy:choir-acolyte', weight: 2, level: [10, 11], group: [2, 2] }, { enemy: 'enemy:reed-priest', weight: 1, level: [11, 11], group: [1, 1] }] },
  { id: 'spawn:aldwin-varn', entries: [{ enemy: 'enemy:aldwin-varn', weight: 1, level: [12, 12], group: [1, 1] }] },
  { id: 'spawn:reed-temple-choir', entries: [{ enemy: 'enemy:choir-acolyte', weight: 2, level: [9, 10], group: [2, 2] }, { enemy: 'enemy:reed-priest', weight: 1, level: [10, 10], group: [1, 1] }] },
  { id: 'spawn:reed-mother', entries: [{ enemy: 'enemy:reed-mother', weight: 1, level: [11, 11], group: [1, 1] }] },
  // ---- Act I Chapter 2
  { id: 'spawn:barrow-downs', entries: [{ enemy: 'enemy:barrow-wight', weight: 1, level: [7, 9], group: [1, 2], time: 'night' }, { enemy: 'enemy:gloamwood-wolf', weight: 1, level: [7, 8], group: [2, 2] }] },
  { id: 'spawn:barrow-wights', entries: [{ enemy: 'enemy:barrow-wight', weight: 1, level: [8, 10], group: [2, 2] }] },
  { id: 'spawn:nail-slopes', entries: [{ enemy: 'enemy:rust-wraith', weight: 1, level: [8, 10], group: [1, 1] }, { enemy: 'enemy:gloamwood-wolf', weight: 1, level: [7, 9], group: [2, 2] }] },
  { id: 'spawn:rust-wraiths', entries: [{ enemy: 'enemy:rust-wraith', weight: 1, level: [9, 11], group: [2, 2] }] },
  { id: 'spawn:deepwood', entries: [{ enemy: 'enemy:gloamwood-wolf', weight: 2, level: [12, 14], group: [2, 3] }, { enemy: 'enemy:mireling', weight: 1, level: [12, 13], group: [1, 2] }] },
  // ---- Act II (T3 12–20, T4 20–30; Claude 3's ids)
  { id: 'spawn:lantern-roads', entries: [{ enemy: 'enemy:wick-soldier', weight: 1, level: [13, 15], group: [1, 2] }, { enemy: 'enemy:ashfoot-cutthroat', weight: 1, level: [12, 14], group: [2, 2] }] },
  { id: 'spawn:ironspine-heights', entries: [{ enemy: 'enemy:wrought-sentinel', weight: 1, level: [15, 18], group: [1, 1] }, { enemy: 'enemy:rime-wolf', weight: 2, level: [14, 17], group: [2, 3] }] },
  { id: 'spawn:north-pass', entries: [{ enemy: 'enemy:rime-wolf', weight: 1, level: [16, 19], group: [2, 3] }] },
  { id: 'spawn:frostreach-wilds', entries: [{ enemy: 'enemy:rime-wolf', weight: 2, level: [20, 24], group: [2, 3] }, { enemy: 'enemy:hrothi-raider', weight: 1, level: [21, 24], group: [2, 2] }] },
  { id: 'spawn:hrothi-raiders', entries: [{ enemy: 'enemy:hrothi-raider', weight: 1, level: [12, 14], group: [2, 3] }] },
  { id: 'spawn:tide-temple', entries: [{ enemy: 'enemy:drowned-dead', weight: 1, level: [14, 16], group: [2, 2] }, { enemy: 'enemy:mireling', weight: 1, level: [14, 15], group: [2, 2] }] },
  { id: 'spawn:sunscar-dunes', entries: [{ enemy: 'enemy:cinder-shade', weight: 1, level: [13, 16], group: [1, 2] }, { enemy: 'enemy:ashfoot-archer', weight: 1, level: [13, 15], group: [2, 2] }] },
  { id: 'spawn:cinder-flats', entries: [{ enemy: 'enemy:cinder-shade', weight: 2, level: [22, 26], group: [2, 3] }, { enemy: 'enemy:mirebeast', weight: 1, level: [23, 26], group: [1, 1] }] },
  { id: 'spawn:korrath-deeps', entries: [{ enemy: 'enemy:rust-wraith', weight: 2, level: [16, 18], group: [2, 2] }, { enemy: 'enemy:wrought-sentinel', weight: 1, level: [17, 18], group: [1, 1] }] },
  { id: 'spawn:vault-guardian', entries: [{ enemy: 'enemy:wrought-sentinel', weight: 1, level: [19, 19], group: [1, 1] }] },
  { id: 'spawn:ashwyrm', entries: [{ enemy: 'enemy:ashwyrm', weight: 1, level: [26, 26], group: [1, 1] }] },
  // ---- Act III (T5 30–40)
  { id: 'spawn:siege-host', entries: [{ enemy: 'enemy:hollowed-thrall', weight: 3, level: [30, 32], group: [2, 3] }, { enemy: 'enemy:drowned-knight', weight: 2, level: [31, 33], group: [1, 2] }, { enemy: 'enemy:mirebeast', weight: 1, level: [32, 34], group: [1, 1] }] },
  { id: 'spawn:unmade-road', entries: [{ enemy: 'enemy:drowned-thing', weight: 2, level: [33, 36], group: [2, 3] }, { enemy: 'enemy:mirebeast', weight: 1, level: [34, 36], group: [1, 1] }] },
  { id: 'spawn:anvil-of-ribs-sentinels', entries: [{ enemy: 'enemy:wrought-sentinel', weight: 1, level: [37, 38], group: [2, 2] }] },
  { id: 'spawn:anvil-of-ribs-drowned', entries: [{ enemy: 'enemy:drowned-thing', weight: 1, level: [37, 38], group: [3, 3] }] },
  { id: 'spawn:nhal-risen', entries: [{ enemy: 'enemy:nhal-risen', weight: 1, level: [40, 40], group: [1, 1] }] },
];

export default tables;
