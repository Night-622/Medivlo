/**
 * Skill tree screen (Claude 3, HANDOFF › Skill tree): three branches (1 Spells · 2 Skills · 3 Upgrades), 24 nodes
 * each in the skTree layout, 4px connectors centre to centre, node frames per branch (Spells ember slot, Skills
 * runed, Upgrades fine, maxed gold, ultimates/keystones with a gold diamond). Detail card with Learn (Enter),
 * points, branch reset at a cost, and hotbar binding for learned spells.
 */
import Phaser from 'phaser';
import { Art } from '@/art';
import { C, HCButton, panel, typeStyle } from '@/ui/kit/hc';
import { spellDef } from '@/systems/rules/spells';
import { spellMeta } from '@/systems/rules/spellText';
import { buildTree, canLearn, rankOf } from '@/systems/rules/tree';
import { resetCost } from '@/systems/rules/curves';
import type { TreeBranch, TreeNode } from '@/systems/rules/types';
import { availablePoints, bindSpell, character, learn, onCharacterChanged, resetTree } from '@/systems/client/character';

const OX = 58, OY = 150;
const FRAME: Record<TreeBranch, string> = { spells: 'ui:slot_ember', skills: 'ui:slot_runed', upgrades: 'ui:slot_fine' };
const BRANCHES: [TreeBranch, string][] = [['spells', 'Spells'], ['skills', 'Skills'], ['upgrades', 'Upgrades']];

export class TreePanel {
  private c: Phaser.GameObjects.Container;
  private sel: string | null = null;
  private msg = '';
  private offs: (() => void)[] = [];

  constructor(private scene: Phaser.Scene, parent: Phaser.GameObjects.Container, private branch: TreeBranch) {
    this.c = scene.add.container(0, 0);
    parent.add(this.c);
    this.offs.push(onCharacterChanged(() => this.draw()));
    const kb = scene.input.keyboard!;
    const keys: [string, () => void][] = [
      ['keydown-ONE', () => this.setBranch('spells')], ['keydown-TWO', () => this.setBranch('skills')],
      ['keydown-THREE', () => this.setBranch('upgrades')], ['keydown-ENTER', () => this.learnSel()],
    ];
    for (const [ev, fn] of keys) { kb.on(ev, fn); this.offs.push(() => kb.off(ev, fn)); }
    this.draw();
  }

  destroy(): void { this.offs.forEach((f) => f()); this.c.destroy(); }

  private setBranch(b: TreeBranch): void { this.branch = b; this.sel = null; this.msg = ''; this.draw(); }

  private learnSel(): void {
    if (!this.sel) return;
    this.msg = learn(this.sel) ?? '';
    this.draw();
  }

  private draw(): void {
    const s = this.scene, ch = character();
    this.c.removeAll(true);
    const nodes = buildTree(ch.classId, this.branch);
    const pts = availablePoints(ch);
    this.c.add(panel(s, 48, 84, 840, 604, 'panel'));
    BRANCHES.forEach(([b, label], i) => {
      const t = s.add.text(80 + i * 150, 100, `${i + 1}  ${label}`, typeStyle('h3', b === this.branch ? C.gold : C.text300)).setInteractive({ useHandCursor: true });
      t.on('pointerup', () => this.setBranch(b));
      this.c.add(t);
    });
    this.c.add(s.add.text(860, 104, `${pts} point${pts === 1 ? '' : 's'}`, typeStyle('h3', pts > 0 ? C.gold : C.text500)).setOrigin(1, 0));
    // connectors
    const g = s.add.graphics();
    this.c.add(g);
    for (const n of nodes) for (const r of n.req) {
      const q = nodes.find((x) => x.id === r)!;
      const lit = rankOf(n, ch.tree) > 0 && rankOf(q, ch.tree) > 0;
      g.lineStyle(4, lit ? 0xffc43d : 0x2c3868, 1).lineBetween(OX + n.x, OY + n.y, OX + q.x, OY + q.y);
    }
    // nodes
    for (const n of nodes) this.node(n, ch.tree, pts);
    this.detail(nodes.find((x) => x.id === this.sel) ?? null, pts);
  }

  private node(n: TreeNode, tree: Record<string, number>, pts: number): void {
    const s = this.scene, ch = character();
    const r = rankOf(n, tree), maxed = r >= n.maxRank;
    const ok = canLearn(ch.classId, n.id, tree, pts).ok;
    const x = OX + n.x - n.size / 2, y = OY + n.y - n.size / 2;
    const tex = maxed && !n.free ? 'ui:panel_gold' : FRAME[this.branch];
    const bg = s.add.nineslice(x, y, tex, undefined, n.size, n.size, 8, 8, 8, 8).setOrigin(0);
    bg.setAlpha(r > 0 || ok ? 1 : 0.45);
    this.c.add(bg);
    const f = Art.tryFrame(n.icon);
    if (f) this.c.add(s.add.image(OX + n.x, OY + n.y, f.key, f.frame).setScale(n.icon.startsWith('school_') ? 2 : 1).setAlpha(r > 0 || ok ? 1 : 0.4));
    if (n.diamond) {
      const d = s.add.rectangle(OX + n.x, y - 2, 10, 10, 0xffd23f).setAngle(45).setStrokeStyle(2, 0x1a1230);
      this.c.add(d);
    }
    if (n.maxRank > 1 || r > 0) this.c.add(s.add.text(x + n.size - 3, y + n.size - 2, n.maxRank > 1 ? `${r}/${n.maxRank}` : '✓', typeStyle('badge', maxed ? C.gold : C.text)).setOrigin(1, 1));
    if (this.sel === n.id) this.c.add(s.add.rectangle(OX + n.x, OY + n.y, n.size + 6, n.size + 6).setStrokeStyle(2, 0xffffff));
    bg.setInteractive({ useHandCursor: true }).on('pointerup', (p: Phaser.Input.Pointer) => {
      if (this.sel === n.id && p.getDuration() < 400 && ok) { this.learnSel(); return; }
      this.sel = n.id; this.msg = ''; this.draw();
    });
  }

  private detail(n: TreeNode | null, pts: number): void {
    const s = this.scene, ch = character();
    const x = 912, w = 320;
    this.c.add(panel(s, x, 84, w, 604, 'panel'));
    if (!n) {
      this.c.add(s.add.text(x + 24, 110, 'Select a node', typeStyle('h3', C.text300)));
      this.c.add(s.add.text(x + 24, 144, 'Click a node to read it. Click it again or press Enter to learn.\n\n1 · 2 · 3 switch branches.', typeStyle('body', C.text500, w - 48)));
      this.resetButton(x, w);
      return;
    }
    const r = rankOf(n, ch.tree);
    let y = 108;
    const add = (t: string, key: Parameters<typeof typeStyle>[0], color: string) => {
      const o = s.add.text(x + 24, y, t, typeStyle(key, color, w - 48));
      this.c.add(o);
      y += o.height + 8;
    };
    add(n.name, 'h2', C.text);
    add(`${n.typeLabel}${n.maxRank > 1 ? ` · Rank ${r}/${n.maxRank}` : ''}`, 'caption', C.gold);
    add(n.text[Math.max(0, r - 1)] ?? n.text[0], 'body', C.text);
    if (r > 0 && r < n.maxRank) add(`Next: ${n.text[r]}`, 'body', C.text300);
    const sp = n.grantsSpell ? spellDef(n.grantsSpell) : undefined;
    if (sp) add(spellMeta(sp).map(([k, v]) => `${k} ${v}`).join(' · '), 'caption', C.text500);
    const chk = canLearn(ch.classId, n.id, ch.tree, pts);
    if (!n.free && r < n.maxRank) {
      const btn = new HCButton(s, x + w / 2, y + 34, r ? 'Upgrade' : 'Learn', () => this.learnSel(), { w: w - 48, disabled: !chk.ok, sub: '1 point' });
      this.c.add(btn);
      y += 76;
      if (!chk.ok) add(chk.why, 'caption', C.danger);
    }
    if (this.msg) add(this.msg, 'caption', C.danger);
    // bind learned spells to 1–4
    if (sp && r > 0) {
      add('Bind to', 'caption', C.text300);
      for (let i = 0; i < 4; i++) {
        const bound = ch.hotbar[i] === sp.id;
        const b = new HCButton(s, x + 24 + 34 + i * 70, y + 26, String(i + 1), () => bindSpell(i as 0 | 1 | 2 | 3, sp.id), { w: 60, h: 44, variant: bound ? 'primary' : 'secondary' });
        this.c.add(b);
      }
    }
    this.resetButton(x, w);
  }

  private resetButton(x: number, w: number): void {
    const ch = character(), cost = resetCost(ch.level);
    const b = new HCButton(this.scene, x + w / 2, 650, `Reset ${this.branch}`, () => { this.msg = resetTree(this.branch) ?? ''; this.sel = null; this.draw(); },
      { w: w - 48, variant: 'secondary', sub: `${cost} Embershards`, disabled: ch.gold < cost });
    this.c.add(b);
  }
}
