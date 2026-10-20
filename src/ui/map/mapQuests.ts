/**
 * Quest marks on the map screen (Claude 2): the tracked quest's objectives as the board's gold quest gem with a
 * pulsing ring, other active quests as the same gem in teal, at every level that has a world transform (realm,
 * Morvane, lair/cave); the merchants present (an anvil for a Runeforge smith, a coin for anyone else who trades);
 * and the screen's top tab bar.
 */
import Phaser from 'phaser';
import { C, n } from '@/ui/kit/hc';
import { GAME_WIDTH, bus, keyLabel, type Action, type NpcId } from '@/core';
import { HC_SHOPS } from '@/data/items/hc/shops';
import { isPresent } from '@/narrative/engine';
import { drawGlyph } from './glyphs';
import { resolvePlace, type QuestMark } from './questMarks';

const TILE = 32;
const SCALE = 2;

/** Draw `marks` of `space` into `view` via `toScreen` (world tile → screen); returns the screen points drawn. */
export function drawQuestMarks(
  scene: Phaser.Scene, view: Phaser.GameObjects.Container, marks: QuestMark[], space: string,
  toScreen: (tx: number, ty: number) => [number, number], focus?: string,
): { mark: QuestMark; x: number; y: number }[] {
  const here = marks.filter((m) => m.space === space);
  if (!here.length) return [];
  const g = scene.add.graphics();
  const rings: Phaser.GameObjects.Arc[] = [];
  const out: { mark: QuestMark; x: number; y: number }[] = [];
  // side quests under the tracked ones
  for (const m of [...here].reverse()) {
    const [x, y] = toScreen(m.x / TILE, m.y / TILE);
    drawGlyph(g, m.tracked ? 'quest' : 'questSide', Math.round(x - 4 * SCALE), Math.round(y - 4 * SCALE), SCALE, n(C.teal));
    if (m.tracked || m.place === focus) rings.push(scene.add.circle(x, y, 9).setStrokeStyle(2, n(m.tracked ? C.gold : C.teal)).setFillStyle());
    out.unshift({ mark: m, x, y });
  }
  view.add([...rings, g]);
  if (rings.length) scene.tweens.add({ targets: rings, scale: 2, alpha: 0, duration: 1100, repeat: -1, ease: 'Sine.easeOut' });
  return out;
}

/** Merchants standing in `space` now (world px): every shop whose NPC is present there. */
export function merchantsIn(space: string): { x: number; y: number; forge: boolean }[] {
  const out: { x: number; y: number; forge: boolean }[] = [];
  for (const s of HC_SHOPS) {
    if (!s.npc.startsWith('npc:') || !isPresent(s.npc as NpcId)) continue;
    const at = resolvePlace(s.npc);
    if (at?.space === space) out.push({ x: at.x, y: at.y, forge: !!s.runeforge });
  }
  return out;
}

/** Merchant glyphs, under the quest marks: an ink-rimmed anvil (Runeforge) or gold coin. Returns screen points. */
export function drawMerchants(scene: Phaser.Scene, view: Phaser.GameObjects.Container, space: string, toScreen: (tx: number, ty: number) => [number, number]): [number, number][] {
  const g = scene.add.graphics(), out: [number, number][] = [];
  for (const m of merchantsIn(space)) {
    const [x, y] = toScreen(m.x / TILE, m.y / TILE);
    if (m.forge) {
      g.fillStyle(n(C.ink), 1).fillRect(x - 7, y - 5, 14, 5).fillRect(x - 3, y - 1, 6, 4).fillRect(x - 6, y + 2, 12, 4);
      g.fillStyle(0xb9c0d4, 1).fillRect(x - 6, y - 4, 12, 3).fillRect(x - 2, y - 1, 4, 3).fillRect(x - 5, y + 3, 10, 2);
    } else {
      g.fillStyle(n(C.ink), 1).fillCircle(x, y, 6);
      g.fillStyle(n(C.gold), 1).fillCircle(x, y, 4);
    }
    out.push([x, y]);
  }
  view.add(g);
  return out;
}

/** [label, key action (its hint follows rebinds), panel it opens (null = the map)] */
const TOP: [string, Action, 'inventory' | 'skills' | 'spells' | 'journal' | null][] = [['Pack', 'inventory', 'inventory'], ['Skills', 'skills', 'skills'], ['Spells', 'spells', 'spells'], ['Journal', 'journal', 'journal'], ['Map', 'map', null]];

/** The map screen's copy of the handoff's shared panel bar: five tabs (Map active) centred at y 20, ✕ at the right. */
export function mapTopBar(sc: Phaser.Scene, keyHints: [Phaser.GameObjects.Text, Action][], close: () => void): Phaser.GameObjects.GameObject[] {
  const out: Phaser.GameObjects.GameObject[] = [];
  const tw = 150, total = TOP.length * tw + (TOP.length - 1) * 6;
  TOP.forEach(([label, action, panel], i) => {
    const x = (GAME_WIDTH - total) / 2 + i * (tw + 6), on = panel === null;
    const bg = sc.add.nineslice(x, 20, on ? 'ui:tab_active' : 'ui:tab', undefined, tw, 44, 8, 8, 8, 8).setOrigin(0);
    const t = sc.add.text(x + tw / 2 - 8, 42, label, { fontFamily: '"Jersey 10"', fontSize: '24px', color: on ? C.text : C.text300 }).setOrigin(0.5);
    const k = sc.add.text(t.x + t.width / 2 + 8, 43, keyLabel(action), { fontFamily: '"Jersey 10"', fontSize: '15px', color: '#7884b5' }).setOrigin(0, 0.5);
    keyHints.push([k, action]);
    if (panel) bg.setInteractive({ useHandCursor: true }).on('pointerup', () => { close(); bus.emit('ui:open', { panel }); });
    out.push(bg, t, k);
  });
  const x = sc.add.nineslice(GAME_WIDTH - 92, 20, 'ui:btn_slate', undefined, 44, 44, 8, 8, 8, 8).setOrigin(0).setInteractive({ useHandCursor: true });
  x.on('pointerup', close);
  out.push(x, sc.add.text(GAME_WIDTH - 70, 42, '✕', { fontFamily: '"Jersey 10"', fontSize: '26px', color: C.text }).setOrigin(0.5));
  return out;
}
