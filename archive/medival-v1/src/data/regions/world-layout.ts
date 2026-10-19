/** Morvane at region-cell resolution (WORLD.md §1.2): each character = 4×4 chunks. '~' = sea. */
import type { WorldLayoutDef } from '@/world/types';

const layout: WorldLayoutDef = {
  id: 'layout:morvane',
  cellChunks: 4,
  cells: [
    '~~~FFFFFFFFFF~~~',
    '~~FFFFFFFFFFFF~~',
    '~~SIIIIIIIIIII~~',
    'P~SIIIIIIIIIIC~~',
    'P~SYYOOOOOOOCCC~',
    '~~SYYKKKKOOMMCC~',
    'P~SYYKKKKGGMMCC~',
    'P~SWWWAAAGGMMCC~',
    '~~~WWWAAAGGGCCC~',
    '~~LLLLLUUUUCCC~~',
    '~~~LLLLUUUUCC~~~',
    '~~~~~~~~~~~~~~~~',
  ],
};

export default layout;
