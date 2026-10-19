/** Shared coordinates for the Aldermoor prologue valley (WORLD.md §5). No default export: not a registry def. */

/** World tile of valley-local (0, 0). The valley is 256 × 256 tiles (chunks 26–33 × 28–35). */
export const VX = 832;
export const VY = 896;

/** Valley-local tile → world tile. */
export const v = (x: number, y: number): [number, number] => [VX + x, VY + y];

/** Valley-local rect → world-tile spawn area. */
export const area = (x: number, y: number, w: number, h: number) => ({ x: VX + x, y: VY + y, w, h });

/** Brindlecross crossroads (valley-local). */
export const CROSS: [number, number] = [136, 140];

/** Brindlecross overlay origin is valley-local (108, 116); VIL maps overlay-local → world tile. */
export const VIL = (x: number, y: number): [number, number] => v(108 + x, 116 + y);
/** Wennamere overlay origin is valley-local (158, 18). */
export const WEN = (x: number, y: number): [number, number] => v(158 + x, 18 + y);
