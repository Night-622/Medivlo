/**
 * Key bindings ↔ real keyboard events (Claude 1). Bindings are stored as Phaser KeyCodes names ('W', 'SPACE', 'LEFT',
 * 'SEMICOLON', 'NUMPAD_ONE', …) because that is what Phaser's addKey/keydown-NAME understand. Use these helpers
 * instead of comparing letters, so every action follows the player's rebinds.
 */
import Phaser from 'phaser';
import { Settings, type Action } from '@/core';

let byCode: Map<number, string> | null = null;

/** The Phaser KeyCodes name of a DOM key event (from its physical key code), e.g. ArrowLeft → 'LEFT'. */
export function keyName(ev: KeyboardEvent): string | null {
  if (!byCode) {
    byCode = new Map();
    for (const [name, code] of Object.entries(Phaser.Input.Keyboard.KeyCodes)) if (!byCode.has(code)) byCode.set(code, name);
  }
  return byCode.get(ev.keyCode) ?? null;
}

/** The numeric key code an action is bound to (for addKey), or undefined if the binding is unknown. */
export function actionKeyCode(a: Action): number | undefined {
  return Phaser.Input.Keyboard.KeyCodes[Settings.key(a) as keyof typeof Phaser.Input.Keyboard.KeyCodes];
}

/** Does this keyboard event press the key bound to `a`? */
export function isAction(ev: KeyboardEvent, a: Action): boolean {
  const code = actionKeyCode(a);
  return code !== undefined && ev.keyCode === code;
}
