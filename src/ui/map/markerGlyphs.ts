/**
 * The map screen's simple marker shapes (Claude 2, out of MapScreen): ink-rimmed diamonds, squares and dots for
 * waystones, villages, ways out, boss arenas, chests and finds. `lit`: a woken waystone (teal) or a sleeping one.
 */
import type Phaser from 'phaser';
import { C, n } from '@/ui/kit/hc';
import type { MapMarker } from '@/world/hc/overview';

const ASLEEP = 0x6b7494;
const BOSS = 0xb8402e;

const diamond = (g: Phaser.GameObjects.Graphics, x: number, y: number, fill: number) => {
  g.fillStyle(n(C.ink), 1).fillTriangle(x, y - 8, x + 7, y, x, y + 8).fillTriangle(x, y - 8, x - 7, y, x, y + 8);
  g.fillStyle(fill, 1).fillTriangle(x, y - 6, x + 5, y, x, y + 6).fillTriangle(x, y - 6, x - 5, y, x, y + 6);
};

/** Draw one marker of a simple kind; false for kinds MapScreen draws itself (zones, optional areas). */
export function drawMarkerGlyph(g: Phaser.GameObjects.Graphics, kind: MapMarker['kind'], x: number, y: number, lit = false): boolean {
  switch (kind) {
    case 'waystone': diamond(g, x, y, lit ? n(C.teal) : ASLEEP); return true;
    case 'exit': diamond(g, x, y, n(C.teal)); return true;
    case 'village':
      g.fillStyle(n(C.ink), 1).fillRect(x - 6, y - 6, 12, 12);
      g.fillStyle(n(C.gold), 1).fillRect(x - 4, y - 4, 8, 8);
      return true;
    case 'boss':
      g.fillStyle(n(C.ink), 1).fillCircle(x, y, 9);
      g.fillStyle(BOSS, 1).fillCircle(x, y, 7);
      return true;
    case 'chest':
      g.fillStyle(n(C.ink), 1).fillRect(x - 5, y - 4, 10, 8);
      g.fillStyle(n(C.gold), 1).fillRect(x - 3, y - 2, 6, 4);
      return true;
    case 'find':
      g.fillStyle(n(C.ink), 1).fillCircle(x, y, 4);
      g.fillStyle(n(C.text), 1).fillCircle(x, y, 2.5);
      return true;
    default: return false;
  }
}

/** An optional area's dot: gold once walked into, grey once a lookout has hinted it. */
export function drawOptionalGlyph(g: Phaser.GameObjects.Graphics, x: number, y: number, seen: boolean): void {
  g.fillStyle(n(C.ink), 1).fillCircle(x, y, 6);
  g.fillStyle(seen ? n(C.gold) : ASLEEP, 1).fillCircle(x, y, 4);
}
