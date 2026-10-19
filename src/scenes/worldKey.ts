import type Phaser from 'phaser';
import { SceneKeys } from '@/core';

/** The scene that plays the game. Since the swap SceneKeys.World === SceneKeys.WorldV2; kept as one call site. */
export function worldKey(_scene?: Phaser.Scene): string {
  return SceneKeys.World;
}
