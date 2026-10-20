import Phaser from 'phaser';
import type { HCBar } from '@/ui/kit/hc';

/** What the HUD exposes to its DEV probe (read-only views of private HUD parts). */
export interface HudParts {
  bars: Record<'hp' | 'em' | 'st' | 'xp', HCBar>;
  texts: Record<'name' | 'lvl' | 'hp' | 'em', Phaser.GameObjects.Text>;
  anchors: Record<'topLeft' | 'topRight' | 'rightColumn' | 'bottom', Phaser.GameObjects.Container>;
  buttons: { panel: string; key: string; label: string; bg: Phaser.GameObjects.NineSlice }[];
  panelOpen: boolean;
  party?: Phaser.GameObjects.Container;
}

type Box = { x: number; y: number; w: number; h: number };
const box = (r: Phaser.Geom.Rectangle): Box => ({ x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) });

/** Every visible Text in the scene (inside containers too), with its bounds in HUD (1280×720) coordinates. */
function visibleTexts(scene: Phaser.Scene): { text: string; alpha: number; b: Box }[] {
  const out: { text: string; alpha: number; b: Box }[] = [];
  const walk = (list: Phaser.GameObjects.GameObject[], alpha: number) => {
    for (const o of list) {
      const v = o as Phaser.GameObjects.GameObject & { visible?: boolean; alpha?: number };
      if (v.visible === false) continue;
      const a = alpha * (v.alpha ?? 1);
      if (o instanceof Phaser.GameObjects.Container) walk(o.list, a);
      else if (o instanceof Phaser.GameObjects.Text && o.text) out.push({ text: o.text, alpha: +a.toFixed(2), b: box(o.getBounds()) });
    }
  };
  walk(scene.children.list, scene.cameras.main.alpha);
  return out;
}

/**
 * DEV / e2e: window.__hud() returns what the HUD shows right now: bar fills, frame texts, anchor contents and
 * bounds (minimap, buffs, tracker, hotbar), menu buttons with their bound keys and page coordinates, every visible
 * text, and the canvas rect so tests can click HUD-space points. Used by tools/e2e/hud.mjs.
 */
export function installHudProbe(scene: Phaser.Scene, parts: () => HudParts): void {
  const w = window as unknown as { __hud?: () => unknown };
  w.__hud = () => {
    if (!scene.sys.isActive()) return { active: false };
    const p = parts();
    const c = scene.game.canvas.getBoundingClientRect();
    const sx = c.width / scene.scale.width, sy = c.height / scene.scale.height;
    const page = (x: number, y: number) => ({ x: Math.round(c.left + x * sx), y: Math.round(c.top + y * sy) });
    const anchors = Object.fromEntries(Object.entries(p.anchors).map(([k, a]) => [k, { n: a.list.length, b: a.list.length ? box(a.getBounds()) : null }]));
    return {
      active: true,
      alpha: scene.cameras.main.alpha,
      size: { w: scene.scale.width, h: scene.scale.height },
      bars: Object.fromEntries(Object.entries(p.bars).map(([k, b]) => [k, +b.fraction.toFixed(3)])),
      text: Object.fromEntries(Object.entries(p.texts).map(([k, t]) => [k, t.text])),
      anchors,
      buttons: p.buttons.map((b) => {
        const r = b.bg.getBounds();
        return { panel: b.panel, key: b.key, label: b.label, b: box(r), click: page(r.centerX, r.centerY) };
      }),
      panelOpen: p.panelOpen,
      partyFrames: p.party ? p.party.list.filter((o) => o instanceof Phaser.GameObjects.Rectangle && (o as Phaser.GameObjects.Rectangle).width === 210).length : 0,
      texts: visibleTexts(scene),
    };
  };
  scene.events.once('shutdown', () => { if (w.__hud) delete w.__hud; });
}
