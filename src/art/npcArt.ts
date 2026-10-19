import type Phaser from 'phaser';
import type { NpcDef } from '@/core';

/** Atlas stand-ins for NPCs without their own sheet (same list as Claude 2's NpcView, so a face is stable everywhere). */
const STAND_INS = ['pell', 'odo', 'wil', 'pip', 'corwin', 'hobb'];

/**
 * Texture key for an NPC: its own `npcs:<id>` sheet, a bearer's class look (`heroes:<class>`), else a stable
 * stand-in picked by id hash. Null only if the atlas isn't loaded. Owner: Claude 1 (used by People, Dialogue, Journal).
 */
export function npcTexture(scene: Phaser.Scene, n: Pick<NpcDef, 'id' | 'classLook'>): string | null {
  const bare = n.id.replace(/^npc:/, '');
  if (scene.textures.exists(`npcs:${bare}`)) return `npcs:${bare}`;
  const cls = n.classLook?.replace(/^class:/, '');
  if (cls && scene.textures.exists(`heroes:${cls}`)) return `heroes:${cls}`;
  let h = 0;
  for (const ch of bare) h = (h * 31 + ch.charCodeAt(0)) | 0;
  const k = `npcs:${STAND_INS[Math.abs(h) % STAND_INS.length]}`;
  return scene.textures.exists(k) ? k : null;
}
