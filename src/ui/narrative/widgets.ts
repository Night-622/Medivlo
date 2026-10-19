/** Small shared pixel widgets for the narrative UI. Owner: Claude 4. */
import type Phaser from 'phaser';
import { palette as P } from '@/ui/kit';

/** Small leather button body (no rivets) with an optional pixel arrow. Returns nothing; add a zone for input. */
export function smallButton(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, enabled: boolean, arrow?: 'left' | 'right'): void {
  g.fillStyle(P['ink-900'], 1).fillRect(x - 2, y - 2, w + 4, h + 4).fillRect(x + 2, y + 2, w + 4, h + 4);
  g.fillStyle(enabled ? P['leather-800'] : P['stone-800'], 1).fillRect(x, y, w, h);
  g.fillStyle(enabled ? P['leather-500'] : P['stone-700'], 1).fillRect(x, y, w, 2).fillRect(x, y, 2, h);
  g.fillStyle(P['leather-900'], 1).fillRect(x, y + h - 2, w, 2).fillRect(x + w - 2, y, 2, h);
  if (!arrow) return;
  const c = enabled ? P['gold-400'] : P['stone-600'];
  const cx = x + w / 2, cy = y + h / 2;
  for (let i = 0; i < 4; i++) {
    const col = arrow === 'right' ? cx - 4 + i * 2 : cx + 4 - i * 2;
    g.fillStyle(c, 1).fillRect(col, cy - 8 + i * 2, 2, 16 - i * 4);
  }
}

/** Shrink a single-line text to `max` px with an ellipsis. */
export function ellipsize(t: Phaser.GameObjects.Text, max: number): Phaser.GameObjects.Text {
  const full = t.text;
  if (t.width <= max) return t;
  let s = full;
  while (s.length > 1) { s = s.slice(0, -1); t.setText(`${s.trimEnd()}…`); if (t.width <= max) break; }
  return t;
}
