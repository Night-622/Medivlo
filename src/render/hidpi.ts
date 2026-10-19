/**
 * Hi-DPI rendering (Claude 1). On by default (Settings › Video › Sharp rendering; ?hidpi=0/1 force it). Phaser 3.90 has no `resolution` option, so the game draws
 * into a 1280×720 buffer and the browser upscales it; small Pixelify text (< 16px) loses its counters ("Oombat").
 * This keeps every logical size at 1280×720 (layout, cameras, pointer input are untouched) but gives the canvas an
 * R× backing buffer: GL viewport/scissor calls on the default framebuffer are scaled by R, render targets are not,
 * and text textures render at R× so glyphs have real pixels to land on. Pixel art stays nearest-sampled.
 */
import Phaser from 'phaser';

export function installHiDpi(game: Phaser.Game, R = 2): boolean {
  const r = game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
  if (!(r instanceof Phaser.Renderer.WebGL.WebGLRenderer) || R <= 1) return false;
  const gl = r.gl;
  const W = game.scale.width, H = game.scale.height;
  let onCanvas = true;
  const bind = gl.bindFramebuffer.bind(gl);
  gl.bindFramebuffer = (target: number, fb: WebGLFramebuffer | null) => { if (target === gl.FRAMEBUFFER) onCanvas = !fb; bind(target, fb); };
  const viewport = gl.viewport.bind(gl);
  gl.viewport = (x: number, y: number, w: number, h: number) => (onCanvas ? viewport(x * R, y * R, w * R, h * R) : viewport(x, y, w, h));
  const scissor = gl.scissor.bind(gl);
  gl.scissor = (x: number, y: number, w: number, h: number) => (onCanvas ? scissor(x * R, y * R, w * R, h * R) : scissor(x, y, w, h));
  // Phaser flips scissor rects with the context's drawingBufferHeight (in several places): make the context report
  // LOGICAL buffer size, so every computation stays in 1280×720 and the wrappers above scale exactly once.
  Object.defineProperty(gl, 'drawingBufferWidth', { configurable: true, get: () => game.scale.width });
  Object.defineProperty(gl, 'drawingBufferHeight', { configurable: true, get: () => game.scale.height });
  game.canvas.width = W * R;
  game.canvas.height = H * R;
  r.resize(W, H);
  // text: render every Text at R× (pixel art needs nothing: nearest sampling of the same textures)
  const proto = Phaser.GameObjects.Text.prototype as unknown as { updateText(): Phaser.GameObjects.Text };
  const update = proto.updateText;
  proto.updateText = function (this: Phaser.GameObjects.Text) {
    if (this.style.resolution < R) this.style.resolution = R;
    return update.call(this);
  };
  return true;
}
