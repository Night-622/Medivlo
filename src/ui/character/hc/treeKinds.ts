/**
 * Perk kinds on the skill tree (Claude 3, BUILDS.md §3, §9): read from TreeNode.typeLabel (and .shared), each kind
 * gets a frame colour, a legend entry, and trade-off clauses (a cost: "you take 50% more damage", "−15% move speed")
 * print in red on the detail card.
 */
import Phaser from 'phaser';
import { C, typeStyle } from '@/ui/kit/hc';
import type { TreeNode } from '@/systems/rules/types';

export type PerkKind = 'conversion' | 'trigger' | 'resource' | 'aura' | 'tradeoff' | 'pick' | 'school' | 'shared' | 'spell';

export const KIND_COLOR: Record<PerkKind, number> = {
  conversion: 0xff9a2e, trigger: 0xb766ff, resource: 0x2fd9c4, aura: 0x5fe06a, tradeoff: 0xff4d5e,
  pick: 0xe6e9f5, school: 0xff8ad8, shared: 0xffd23f, spell: 0x3fa9ff,
};
const LEGEND: [PerkKind, string][] = [
  ['spell', 'spell'], ['conversion', 'conversion'], ['trigger', 'trigger'], ['resource', 'resource'], ['aura', 'aura'],
  ['tradeoff', 'trade-off'], ['pick', 'pick one'], ['school', 'school perk'], ['shared', 'shared keystone'],
];

export function kindOf(n: TreeNode): PerkKind | null {
  const l = n.typeLabel.toLowerCase();
  if (n.shared || l.startsWith('shared keystone')) return 'shared';
  if (l.includes('trade-off')) return 'tradeoff';
  if (l.includes('conversion')) return 'conversion';
  if (l.includes('trigger')) return 'trigger';
  if (l.includes('resource')) return 'resource';
  if (l.includes('aura')) return 'aura';
  if (l.startsWith('school perk')) return l.includes('pick one') ? 'pick' : 'school';
  if (l.includes('pick one')) return 'pick';
  if (l.includes('new spell') || l.includes('school spell') || l.includes('ultimate spell')) return 'spell';
  return null;
}

/** A coloured inner frame on a node (x, y: its top-left). */
export function kindFrame(scene: Phaser.Scene, parent: Phaser.GameObjects.Container, n: TreeNode, x: number, y: number, alpha: number): void {
  const k = kindOf(n);
  if (!k) return;
  const g = scene.add.graphics();
  g.lineStyle(k === 'shared' ? 3 : 2, KIND_COLOR[k], alpha).strokeRect(x + 2, y + 2, n.size - 4, n.size - 4);
  parent.add(g);
}

/** The legend row along the tree panel's foot. */
export function kindLegend(scene: Phaser.Scene, parent: Phaser.GameObjects.Container, x: number, y: number, maxX: number): void {
  let cx = x;
  for (const [k, label] of LEGEND) {
    const t = scene.add.text(cx + 14, y, label, typeStyle('badge', C.text500));
    if (cx + 14 + t.width > maxX) { t.destroy(); break; }
    parent.add(scene.add.rectangle(cx, y + 2, 10, 10).setOrigin(0).setStrokeStyle(2, KIND_COLOR[k]));
    parent.add(t);
    cx += 14 + t.width + 12;
  }
}

/** Is this clause a cost (red)? Lower cooldowns, costs and damage taken are gains, not costs. */
export function isTradeoff(clause: string): boolean {
  const c = clause.toLowerCase();
  if (/more damage taken|you take [^;.]*more damage|damage taken[^;.]*\+/.test(c)) return true;
  if (/cooldown|cost|damage taken|recharge|cast time|takes? \d+% less/.test(c)) return false;
  return /−|\bless\b|\bfewer\b/.test(c);
}

/** Split perk text into clauses (at "; " and ". ") when one of them is a cost, so the cost can print in red. */
export function clauses(text: string): { text: string; cost: boolean }[] {
  const parts = text.split(/(?<=[;.])\s+/).filter(Boolean);
  const out = parts.map((p) => ({ text: p, cost: isTradeoff(p) }));
  return out.some((p) => p.cost) ? out : [{ text, cost: false }];
}
