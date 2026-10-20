/**
 * Skill tree screen (Claude 3, HANDOFF › Skill tree): three branches (1 Spells · 2 Skills · 3 Upgrades), 24 nodes
 * each in the skTree layout, 4px connectors centre to centre, node frames per branch (Spells ember slot, Skills
 * runed, Upgrades fine, maxed gold, ultimates/keystones with a gold diamond). Detail card with Learn (Enter),
 * points, branch reset at a cost, and hotbar binding for learned spells.
 * Deeper builds (BUILDS.md §9): an inner frame colour per perk kind (legend at the foot), trade-off clauses in red,
 * the shared-keystone counter on Upgrades, the one-time free respec, and rune slots on the Spells branch (pips on
 * the tree, the slots on the spell's card; a tome spell sits bottom-left).
 */
import { playerText } from '@/systems/rules/describeHc';
import Phaser from 'phaser';
import { Art } from '@/art';
import { C, HCButton, panel, typeStyle } from '@/ui/kit/hc';
import { spellDef } from '@/systems/rules/spells';
import { spellMeta } from '@/systems/rules/spellText';
import { allNodes, buildTree, canLearn, MAX_SHARED_KEYSTONES, rankOf } from '@/systems/rules/tree';
import { resetCost } from '@/systems/rules/curves';
import { keyLabel } from '@/core/settings';
import { flavourOf } from '@/systems/rules/buildText';
import type { ShownLine } from './tooltip';
import type { TreeBranch, TreeNode } from '@/systems/rules/types';
import { availablePoints, bindSpell, branchHasRanks, character, learn, onCharacterChanged, resetTree } from '@/systems/client/character';
import { clauses, kindFrame, kindLegend } from './treeKinds';
import { runePips, runeSection, type RuneUi } from './RunePanel';
import { showTooltip } from './tooltip';
import { navFocused, navRefresh } from './panelNav';

const OX = 58, OY = 150;
const FRAME: Record<TreeBranch, string> = { spells: 'ui:slot_ember', skills: 'ui:slot_runed', upgrades: 'ui:slot_fine' };
const BRANCHES: [TreeBranch, string][] = [['spells', 'Spells'], ['skills', 'Skills'], ['upgrades', 'Upgrades']];
const TOME_ID = 'tome';

export class TreePanel {
  private c: Phaser.GameObjects.Container;
  private sel: string | null = null;
  private msg = '';
  private offs: (() => void)[] = [];
  private tip: Phaser.GameObjects.Container | null = null;
  private runeUi: RuneUi = { picking: false };

  constructor(private scene: Phaser.Scene, private parent: Phaser.GameObjects.Container, private branch: TreeBranch) {
    this.c = scene.add.container(0, 0);
    parent.add(this.c);
    this.offs.push(onCharacterChanged(() => this.draw()));
    const kb = scene.input.keyboard!;
    const keys: [string, () => void][] = [
      ['keydown-ONE', () => this.setBranch('spells')], ['keydown-TWO', () => this.setBranch('skills')],
      ['keydown-THREE', () => this.setBranch('upgrades')], ['keydown-ENTER', () => this.learnSel(true)],
    ];
    for (const [ev, fn] of keys) { kb.on(ev, fn); this.offs.push(() => kb.off(ev, fn)); }
    this.draw();
  }

  destroy(): void { this.offs.forEach((f) => f()); this.c.destroy(); }

  private setBranch(b: TreeBranch): void { this.branch = b; this.sel = null; this.msg = ''; this.runeUi.picking = false; this.draw(); }

  private learnSel(fromKey = false): void {
    if (fromKey && navFocused(this.scene)) return; // the ring presses the focused control instead
    if (!this.sel || this.sel === TOME_ID) return;
    this.msg = learn(this.sel) ?? '';
    this.draw();
  }

  /** The off-school spell a tome taught, as a node of its own bottom-left on the Spells branch. */
  private tomeNode(): TreeNode | null {
    const ch = character(), sp = this.branch === 'spells' && ch.tomeSpell ? spellDef(ch.tomeSpell) : undefined;
    if (!sp) return null;
    return { id: TOME_ID, branch: 'spells', kind: 'major', name: sp.name, icon: sp.icon, x: 40, y: 450, size: 52, maxRank: 1, text: [sp.desc], effects: [{}],
      grantsSpell: sp.id, req: [], free: true, typeLabel: 'Tome spell · your one off-school spell' };
  }

  private draw(): void {
    const s = this.scene, ch = character();
    this.c.removeAll(true);
    this.tip = null;
    const nodes = buildTree(ch.classId, this.branch);
    const pts = availablePoints(ch);
    this.c.add(panel(s, 48, 84, 840, 604, 'panel'));
    BRANCHES.forEach(([b, label], i) => {
      const t = s.add.text(80 + i * 150, 100, `${i + 1}  ${label}`, typeStyle('h3', b === this.branch ? C.gold : C.text300)).setInteractive({ useHandCursor: true });
      t.on('pointerup', () => this.setBranch(b));
      this.c.add(t);
    });
    this.c.add(s.add.text(860, 104, `${pts} point${pts === 1 ? '' : 's'}`, typeStyle('h3', pts > 0 ? C.gold : C.text500)).setOrigin(1, 0));
    if (this.branch === 'upgrades') {
      const held = allNodes(ch.classId).filter((x) => x.shared && rankOf(x, ch.tree) > 0).length;
      this.c.add(s.add.text(860, 130, `Shared keystones ${held} / ${MAX_SHARED_KEYSTONES}`, typeStyle('caption', held >= MAX_SHARED_KEYSTONES ? C.text300 : C.gold)).setOrigin(1, 0));
    }
    if (ch.freeRespec) this.c.add(s.add.text(80, 130, 'Free reset: the tree changed, so one reset of every branch costs nothing.', typeStyle('caption', C.gold, 340)));
    // connectors
    const g = s.add.graphics();
    this.c.add(g);
    for (const n of nodes) for (const r of n.req) {
      const q = nodes.find((x) => x.id === r)!;
      const lit = rankOf(n, ch.tree) > 0 && rankOf(q, ch.tree) > 0;
      g.lineStyle(4, lit ? 0xffc43d : 0x2c3868, 1).lineBetween(OX + n.x, OY + n.y, OX + q.x, OY + q.y);
    }
    // nodes
    // nodes in reading order (the keyboard ring walks them in drawing order)
    for (const n of [...nodes].sort((a, b) => a.y - b.y || a.x - b.x)) this.node(n, ch.tree, pts);
    const tome = this.tomeNode();
    if (tome) {
      this.node(tome, ch.tree, pts);
      this.c.add(s.add.text(OX + tome.x, OY + tome.y + 30, 'Tome', typeStyle('badge', C.text300)).setOrigin(0.5, 0));
    }
    kindLegend(s, this.c, 72, 668, 872);
    this.detail(this.sel === TOME_ID ? tome : nodes.find((x) => x.id === this.sel) ?? null, pts);
    navRefresh(s, this.parent, this.c);
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
    kindFrame(s, this.c, n, x, y, r > 0 || ok ? 1 : 0.5);
    const f = Art.tryFrame(n.icon);
    if (f) this.c.add(s.add.image(OX + n.x, OY + n.y, f.key, f.frame).setScale(n.icon.startsWith('school_') ? 2 : 1).setAlpha(r > 0 || ok ? 1 : 0.4));
    if (n.diamond) {
      const d = s.add.rectangle(OX + n.x, y - 2, 10, 10, 0xffd23f).setAngle(45).setStrokeStyle(2, 0x1a1230);
      this.c.add(d);
    }
    if (n.maxRank > 1 || r > 0) this.c.add(s.add.text(x + n.size - 3, y + n.size - 2, n.maxRank > 1 ? `${r}/${n.maxRank}` : '✓', typeStyle('badge', maxed ? C.gold : C.text)).setOrigin(1, 1));
    if (this.branch === 'spells') runePips(s, this.c, n, ch, OX, OY);
    if (this.sel === n.id) this.c.add(s.add.rectangle(OX + n.x, OY + n.y, n.size + 6, n.size + 6).setStrokeStyle(2, 0xffffff));
    // hover: a teal outline (the selected node keeps its white one)
    const hover = s.add.rectangle(OX + n.x, OY + n.y, n.size + 4, n.size + 4).setStrokeStyle(2, 0x5ad1c8).setVisible(false);
    this.c.add(hover);
    bg.on('pointerover', () => hover.setVisible(this.sel !== n.id)).on('pointerout', () => hover.setVisible(false));
    bg.setInteractive({ useHandCursor: true }).on('pointerup', (p: Phaser.Input.Pointer) => {
      if (this.sel === n.id && p.getDuration() < 400 && ok) { this.learnSel(); return; }
      if (this.sel !== n.id) this.runeUi.picking = false;
      this.sel = n.id; this.msg = ''; this.draw();
    });
  }

  private detail(n: TreeNode | null, pts: number): void {
    const s = this.scene, ch = character();
    const x = 912, w = 320;
    this.c.add(panel(s, x, 84, w, 604, 'panel'));
    if (!n) {
      this.c.add(s.add.text(x + 24, 110, 'Select a node', typeStyle('h3', C.text300)));
      this.c.add(s.add.text(x + 24, 144, 'Click a node to read it. Click it again or press Enter to learn.\n\nKeyboard: arrows or Tab move, Enter picks, Enter again learns.\n\n1 · 2 · 3 switch branches.', typeStyle('body', C.text500, w - 48)));
      this.resetButton(x, w);
      return;
    }
    const r = rankOf(n, ch.tree);
    let y = 108;
    const add = (t: string, key: Parameters<typeof typeStyle>[0], color: string, gap = 8) => {
      const o = s.add.text(x + 24, y, t, typeStyle(key, color, w - 48));
      this.c.add(o);
      y += o.height + gap;
    };
    /** perk text, with its cost clauses in red */
    const perkText = (t: string, color: string) => {
      const parts = clauses(playerText(t));
      parts.forEach((p, i) => add(p.text, 'body', p.cost ? C.danger : color, i === parts.length - 1 ? 8 : 2));
    };
    add(n.name, 'h2', C.text);
    add(`${n.typeLabel}${n.maxRank > 1 ? ` · Rank ${r}/${n.maxRank}` : ''}`, 'caption', C.gold);
    perkText(n.text[Math.max(0, r - 1)] ?? n.text[0], C.text);
    if (r > 0 && r < n.maxRank) perkText(`Next: ${n.text[r]}`, C.text300);
    const sp = n.grantsSpell ? spellDef(n.grantsSpell) : undefined;
    if (sp) add(spellMeta(sp).map(([k, v]) => `${k} ${v}`).join(' · '), 'caption', C.text500);
    const chk = n.id === TOME_ID ? { ok: false as const, why: '' } : canLearn(ch.classId, n.id, ch.tree, pts);
    if (!n.free && r < n.maxRank) {
      const btn = new HCButton(s, x + w / 2, y + 30, r ? 'Upgrade' : 'Learn', () => this.learnSel(), { w: w - 48, disabled: !chk.ok, sub: '1 point' });
      this.c.add(btn);
      y += 66;
      if (!chk.ok) add(chk.why, 'caption', C.danger);
    }
    if (this.msg) add(this.msg, 'caption', C.danger);
    // bind learned spells to 1–4, then the spell's rune slots
    if (sp && r > 0) {
      add('Bind to', 'caption', C.text300, 4);
      for (let i = 0; i < 4; i++) {
        const bound = ch.hotbar[i] === sp.id;
        const b = new HCButton(s, x + 24 + 30 + i * 66, y + 20, keyLabel((['cast1', 'cast2', 'cast3', 'cast4'] as const)[i]), () => bindSpell(i as 0 | 1 | 2 | 3, sp.id), { w: 56, h: 40, variant: bound ? 'primary' : 'secondary' });
        this.c.add(b);
      }
      y += 50;
      y = runeSection(s, this.c, ch, sp.id, x + 24, y, w - 48, this.runeUi, {
        redraw: () => this.draw(), tip: (lines, at, rarity) => this.showTip(lines, at, rarity), hideTip: () => this.hideTip(),
      });
    }
    // in-world flavour (Claude 4's overlay) in italics at the card's foot, under the mechanics, above the reset button
    const flavour = n.flavour ?? (sp ? flavourOf('spell', sp.id) : undefined);
    if (flavour) {
      const t = s.add.text(x + 24, Math.max(y + 4, 0), flavour, { ...typeStyle('body', C.text500, w - 48), fontStyle: 'italic' });
      if (t.y + t.height > 616) t.setY(Math.max(y, 616 - t.height));
      this.c.add(t);
    }
    this.resetButton(x, w);
  }

  private showTip(lines: ShownLine[], at: { x: number; y: number; w: number }, rarity?: string): void {
    this.hideTip();
    this.tip = showTooltip(this.scene, this.c, lines, at, rarity);
  }
  private hideTip(): void { this.tip?.destroy(); this.tip = null; }

  private resetButton(x: number, w: number): void {
    const ch = character(), cost = resetCost(ch.level);
    const done = () => { this.sel = null; this.runeUi.picking = false; this.draw(); };
    if (ch.freeRespec) {
      const any = Object.keys(ch.tree).length > 0;
      this.c.add(new HCButton(this.scene, x + w / 2, 650, 'Free reset (all branches)', () => { this.msg = resetTree(this.branch) ?? ''; done(); },
        { w: w - 48, sub: any ? 'Once, no charge: every point comes back' : 'Nothing learned yet', disabled: !any }));
      return;
    }
    const b = new HCButton(this.scene, x + w / 2, 650, `Reset ${this.branch}`, () => { this.msg = resetTree(this.branch) ?? ''; done(); },
      { w: w - 48, variant: 'secondary', sub: branchHasRanks(this.branch) ? `${cost} Embershards` : 'Nothing learned yet', disabled: ch.gold < cost || !branchHasRanks(this.branch) });
    this.c.add(b);
  }
}
