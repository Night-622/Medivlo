/**
 * Keyboard reach for the character panels and the shop / Runeforge (Claude 7's qa-a11y, Claude 6's KeyNav kit):
 * arrows / Tab move a gold focus ring over every clickable control, Enter / Space press it. The ring only shows once a
 * key is used, so mouse players never see it.
 *
 * One KeyNav per HUD scene, shared by every panel: KeyNav listens until its scene shuts down, and these panels open
 * and close many times inside the HUD scene. After each draw a panel calls navRefresh(scene, root, body). The walk
 * registers every visible interactive object that has a pointerup handler, in drawing order (the body first, so the
 * first key lands on the panel's own controls, then the rest of the root: tab bar, ✕). Enter fires that same
 * pointerup handler, so keyboard and mouse share one code path and a new control is reachable as soon as it is
 * clickable. navClear(scene) when the panel closes.
 */
import Phaser from 'phaser';
import { KeyNav } from '@/ui/kit/hc';

const NAVS = new WeakMap<Phaser.Scene, KeyNav>();

type Obj = Phaser.GameObjects.GameObject & { getBounds(): Phaser.Geom.Rectangle; visible?: boolean };

/** The shared KeyNav for a HUD scene (made on first use, forgotten when the scene shuts down). */
export function panelNav(scene: Phaser.Scene): KeyNav {
  let nav = NAVS.get(scene);
  if (!nav) {
    nav = new KeyNav(scene);
    NAVS.set(scene, nav);
    // published as scene.nav (the field every KeyNav screen uses) so tools/e2e/qa-a11y.mjs finds the panels' stops
    const host = scene as Phaser.Scene & { nav?: KeyNav };
    if (!host.nav) host.nav = nav;
    scene.events.once('shutdown', () => { NAVS.delete(scene); if (host.nav === nav) host.nav = undefined; });
  }
  return nav;
}

/** A pointer stand-in for handlers that read one (a quick press, left button). */
const KEY_POINTER = { getDuration: () => 0, leftButtonReleased: () => true, rightButtonReleased: () => false, button: 0, x: 0, y: 0 };

function collect(o: Phaser.GameObjects.GameObject, out: Obj[], skip?: Phaser.GameObjects.GameObject): void {
  if (o === skip || (o as Obj).visible === false) return;
  if (o.input?.enabled && o.listenerCount('pointerup') > 0 && 'getBounds' in o) { out.push(o as Obj); return; }
  if (o instanceof Phaser.GameObjects.Container) for (const c of o.list) collect(c, out, skip);
}

/** Re-register a panel's controls: `body` first (the panel's own container), then everything else under `root`. */
export function navRefresh(scene: Phaser.Scene, root: Phaser.GameObjects.Container, body?: Phaser.GameObjects.Container): void {
  const nav = panelNav(scene), objs: Obj[] = [];
  if (body) collect(body, objs);
  collect(root, objs, body);
  nav.clear();
  for (const o of objs) nav.add(o, () => { if (o.scene && o.input?.enabled) o.emit('pointerup', KEY_POINTER); });
}

/** The panel closed: no controls, no ring (the focus position is kept for the next panel). */
export function navClear(scene: Phaser.Scene): void { NAVS.get(scene)?.clear(); }

/** True once the player is steering by keyboard (a panel's own Enter key then leaves the press to the ring). */
export const navFocused = (scene: Phaser.Scene): boolean => NAVS.get(scene)?.focused ?? false;
