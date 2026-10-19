/**
 * Pixelify Sans renders the "fi"/"fl" ligatures as a broken glyph at small sizes ("Outfit" → "OutAt").
 * Canvas text can't disable ligatures via CSS, so we insert a zero-width non-joiner between f and i/l
 * in every Phaser Text. Installed once from main.ts.
 */
import Phaser from 'phaser';

const ZWNJ = '‌';
let installed = false;

export function breakLigatures(s: string): string {
  return s.replace(/f(?=[il])/g, `f${ZWNJ}`);
}

export function installLigatureFix(): void {
  if (installed) return;
  installed = true;
  const proto = Phaser.GameObjects.Text.prototype as unknown as { setText(v: string | string[]): Phaser.GameObjects.Text; updateText(): Phaser.GameObjects.Text };
  const orig = proto.setText;
  proto.setText = function (this: Phaser.GameObjects.Text, value: string | string[]) {
    const v = Array.isArray(value) ? value.map((x) => breakLigatures(String(x))) : breakLigatures(String(value ?? ''));
    return orig.call(this, v);
  };
  // Every updateText re-uploads the canvas with the game's NEAREST filter, so the small-text fix runs after each one.
  const origUpdate = proto.updateText;
  proto.updateText = function (this: Phaser.GameObjects.Text) {
    const small = isSmall(this);
    if (small && this.style.resolution < 2) this.style.resolution = 2;
    const out = origUpdate.call(this);
    if (small) this.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    return out;
  };
}

/**
 * Small Pixelify text (< 20px) sits between the font's pixel-grid sizes, so nearest-neighbour sampling closes
 * gaps ("Caster" reads "Oaster"). Render it at 2× and sample it linearly, like the browser mock does.
 * Display-size text stays crisp (nearest).
 */
function isSmall(t: Phaser.GameObjects.Text): boolean {
  const size = parseInt(String(t.style.fontSize), 10);
  return Number.isFinite(size) && size < 20;
}
