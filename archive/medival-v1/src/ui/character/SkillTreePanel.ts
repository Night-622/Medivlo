/**
 * Skill tree (board 8e): tiers bottom-up, shaped nodes (minor ▪, notable/ability ◆, keystone ⯃), orthogonal
 * edges coloured by state, details column on the right. Click a node to allocate.
 */
import Phaser from 'phaser';
import type { SkillNodeDef, SkillTreeDef } from '@/core';
import { drawFrame, palette as P } from '@/ui/kit';
import {
  SECOND_OATH_LEVEL, SUBCLASS_LEVEL, allocate, availableTrees, canAllocate, chooseSecondOath, chooseSubclass, pointsInTree, respecCost, respecTrees,
  secondOathOptions, treeRanks,
} from '@/systems/progression/SkillTrees';
import type { CharacterPanels, PanelView } from './CharacterPanels';
import { C, dimScreen, hotspot, icon, ironButton, txt } from './px';

const AREA = { x: 32, y: 88, w: 880, h: 600 };
const TIER_Y = [588, 488, 388, 288, 184]; // node centre per tier I..V
const CORE = { x: AREA.x + AREA.w / 2, y: 656 };
const R: Record<SkillNodeDef['type'], number> = { minor: 16, notable: 22, ability: 22, keystone: 30 };
const BRANCH_FILL = [P['iron-800'], P['blood-800'], P['stam-900']];
const BRANCH_GLOW = [P['iron-400'], P['blood-400'], P['stam-300']];
const BRANCH_GLYPH = ['shield', 'blade', 'banner'];
const ROMAN = ['I', 'II', 'III', 'IV', 'V'];

type State = 'on' | 'avail' | 'lock';

/** pixel shape rows (2px tall bands) for a node */
function rows(kind: SkillNodeDef['type'], cx: number, cy: number, r: number): [number, number, number][] {
  const out: [number, number, number][] = [];
  for (let y = -r; y < r; y += 2) {
    let half = r;
    if (kind === 'notable' || kind === 'ability') half = r - Math.floor(Math.abs(y + 1) / 2) * 2;
    else if (kind === 'keystone') { const c = Math.round(r * 0.45); const e = Math.min(y + r, r - 2 - y); half = r - Math.max(0, c - e); }
    if (half > 0) out.push([cx - half, cy + y, half * 2]);
  }
  return out;
}

function fillShape(g: Phaser.GameObjects.Graphics, kind: SkillNodeDef['type'], cx: number, cy: number, r: number, color: number): void {
  g.fillStyle(color, 1);
  for (const [x, y, w] of rows(kind, cx, cy, r)) g.fillRect(x, y, w, 2);
}

export class SkillTreePanel implements PanelView {
  readonly container: Phaser.GameObjects.Container;
  private treeIdx = 0;
  private detail?: Phaser.GameObjects.Container;
  private selected: string | null = null;
  /** vertical space taken by subclass / Second Oath choices above the detail box */
  private off = 0;

  constructor(private readonly scene: Phaser.Scene, private readonly mgr: CharacterPanels) {
    this.container = scene.add.container(0, 0);
    this.refresh();
  }

  private get gs() { return this.mgr.rt.player.gs; }

  private pos(n: SkillNodeDef): { x: number; y: number } {
    return { x: AREA.x + 150 + n.pos.col * 86, y: TIER_Y[n.tier - 1] };
  }

  refresh(): void {
    const s = this.scene, c = this.container, gs = this.gs;
    c.removeAll(true);
    this.mgr.tooltip.hide();
    const g = s.add.graphics();
    c.add(g);
    dimScreen(s, g);
    drawFrame(g, 'iron', 16, 16, 1248, 688);
    c.add(s.add.zone(0, 0, s.scale.width, s.scale.height).setOrigin(0).setInteractive());
    const trees = availableTrees(gs);
    if (!trees.length) { c.add(txt(s, 60, 80, 'No class tree.', 'bodyM')); return; }
    const tree = trees[Math.min(this.treeIdx, trees.length - 1)];
    c.add(txt(s, 40, 24, tree.name, 'titleL', C.gold));
    // branch legend / tree tabs
    const branches = [...new Set(tree.nodes.map((n) => n.branch))];
    branches.forEach((b, i) => {
      const x = 520 + i * 132, y = 34;
      g.fillStyle(P['ink-900'], 1).fillRect(x - 2, y - 2, 124, 36);
      g.fillStyle(P['ink-700'], 1).fillRect(x, y, 120, 32);
      icon(g, BRANCH_GLYPH[i] ?? 'misc', BRANCH_GLOW[i] ?? P['parch-500'], x + 8, y + 8, 2);
      c.add(txt(s, x + 30, y + 6, b[0].toUpperCase() + b.slice(1), 'bodyS', C.text2));
    });
    trees.forEach((t, i) => {
      if (trees.length < 2) return;
      ironButton(s, c, 940 + i * 104, 34, 96, 28, t.name.split(' ').pop() ?? t.name, () => { this.treeIdx = i; this.refresh(); });
    });

    // tree area + grid
    g.fillStyle(P['ink-900'], 1).fillRect(AREA.x - 2, AREA.y - 2, AREA.w + 4, AREA.h + 4);
    g.fillStyle(P['ink-800'], 1).fillRect(AREA.x, AREA.y, AREA.w, AREA.h);
    g.fillStyle(P['ink-700'], 1);
    for (let y = AREA.y + 8; y < AREA.y + AREA.h; y += 16) for (let x = AREA.x + 8; x < AREA.x + AREA.w; x += 16) g.fillRect(x, y, 2, 2);
    const spent = pointsInTree(gs, tree.id);
    for (let t = 0; t < 5; t++) {
      const ly = TIER_Y[t] - 50;
      g.fillStyle(P['ink-600'], 1).fillRect(AREA.x + 8, ly, AREA.w - 16, 2);
      g.fillStyle(P['ink-900'], 1).fillRect(AREA.x + 8, ly + 2, AREA.w - 16, 2);
      g.fillStyle(P['ink-900'], 1).fillRect(AREA.x + 10, ly + 8, 48, 32);
      g.fillStyle(P['ink-600'], 1).fillRect(AREA.x + 12, ly + 10, 44, 28);
      c.add(txt(s, AREA.x + 34, ly + 12, ROMAN[t], 'titleS', C.goldHi).setOrigin(0.5, 0));
      const req = tree.tierThresholds[t];
      const empty = !tree.nodes.some((n) => n.tier === t + 1);
      c.add(txt(s, AREA.x + 64, ly + 20, empty ? `${req} POINTS · LATER` : req === 0 ? 'OPEN' : `${req} POINTS${spent >= req ? ' ✓' : ''}`, 'micro', !empty && spent >= req ? C.good : C.muted));
    }

    // edges
    const ranks = treeRanks(gs, tree.id);
    const state = (n: SkillNodeDef): State => (ranks[n.id] ?? 0) > 0 ? 'on' : canAllocate(gs, tree, n).ok ? 'avail' : 'lock';
    const eg = s.add.graphics();
    c.add(eg);
    const edge = (ax: number, ay: number, bx: number, by: number, col: number) => {
      const mid = Math.round((ay + by) / 2 / 2) * 2;
      eg.fillStyle(P['ink-900'], 1).fillRect(ax - 3, Math.min(ay, mid) - 1, 6, Math.abs(ay - mid) + 2)
        .fillRect(Math.min(ax, bx) - 3, mid - 3, Math.abs(bx - ax) + 6, 6).fillRect(bx - 3, Math.min(by, mid) - 1, 6, Math.abs(by - mid) + 2);
      eg.fillStyle(col, 1).fillRect(ax - 2, Math.min(ay, mid), 4, Math.abs(ay - mid))
        .fillRect(Math.min(ax, bx) - 2, mid - 2, Math.abs(bx - ax) + 4, 4).fillRect(bx - 2, Math.min(by, mid), 4, Math.abs(by - mid));
    };
    const edgeCol = (a: State, b: State) => (a === 'on' && b === 'on' ? P['gold-500'] : a === 'on' && b === 'avail' ? P['stone-500'] : P['stone-700']);
    for (const n of tree.nodes) {
      const b = this.pos(n);
      const parents = [...(n.requiresAll ?? []), ...(n.requiresAny ?? [])].map((id) => tree.nodes.find((x) => x.id === id)).filter((x): x is SkillNodeDef => !!x);
      if (!parents.length && n.tier === 1) edge(CORE.x, CORE.y, b.x, b.y + R[n.type], edgeCol('on', state(n)));
      for (const par of parents) {
        const a = this.pos(par);
        edge(a.x, a.y - R[par.type], b.x, b.y + R[n.type], edgeCol(state(par), state(n)));
      }
    }
    // core
    fillShape(eg, 'keystone', CORE.x, CORE.y, 26, P['ink-900']);
    fillShape(eg, 'keystone', CORE.x, CORE.y, 24, P['gold-800']);
    fillShape(eg, 'keystone', CORE.x, CORE.y, 20, P['ink-600']);
    icon(eg, 'shield', P['iron-400'], CORE.x - 8, CORE.y - 8, 2);

    // nodes
    const ng = s.add.graphics();
    c.add(ng);
    for (const n of tree.nodes) this.drawNode(ng, tree, n, state(n), ranks[n.id] ?? 0, branches.indexOf(n.branch));

    this.drawSide(tree);
    this.mgr.footer(c, 690);
  }

  private drawNode(g: Phaser.GameObjects.Graphics, tree: SkillTreeDef, n: SkillNodeDef, st: State, rank: number, bi: number): void {
    const s = this.scene, c = this.container;
    const { x, y } = this.pos(n);
    const r = R[n.type];
    if (st === 'on') { g.fillStyle(BRANCH_GLOW[bi] ?? P['gold-400'], 1); for (const [rx, ry, w] of rows(n.type, x, y, r + 6)) for (let xx = rx + ((ry / 2) % 2 ? 0 : 2); xx < rx + w; xx += 4) g.fillRect(xx, ry, 2, 2); }
    if (st === 'avail') { g.fillStyle(P['gold-500'], 1); for (const [rx, ry, w] of rows(n.type, x, y, r + 5)) { g.fillRect(rx, ry, 2, 2); g.fillRect(rx + w - 2, ry, 2, 2); } }
    if (this.selected === n.id) fillShape(g, n.type, x, y, r + 4, P['gold-200']);
    fillShape(g, n.type, x, y, r + 2, P['ink-900']);
    fillShape(g, n.type, x, y, r, st === 'on' ? P['gold-500'] : st === 'avail' ? P['stone-600'] : P['stone-800']);
    fillShape(g, n.type, x, y, r - 4, st === 'on' ? BRANCH_FILL[bi] ?? P['ink-600'] : st === 'avail' ? P['ink-600'] : P['stone-900']);
    if (st === 'lock') for (const [rx, ry, w] of rows(n.type, x, y, r - 4)) for (let xx = rx + ((ry / 2) % 2 ? 0 : 2); xx < rx + w; xx += 4) g.fillStyle(P['ink-900'], 1).fillRect(xx, ry, 2, 2);
    const glyph = n.type === 'keystone' ? 'crown' : n.type === 'minor' ? 'plus' : n.type === 'ability' ? 'bolt' : BRANCH_GLYPH[bi] ?? 'misc';
    const gs2 = n.type === 'minor' ? 2 : n.type === 'keystone' ? 3 : 2;
    icon(g, glyph, st === 'on' ? P['gold-200'] : st === 'avail' ? P['parch-500'] : P['stone-700'], x - 4 * gs2, y - 4 * gs2, gs2);
    if (n.maxRank > 1) {
      const pw = n.maxRank * 8;
      for (let i = 0; i < n.maxRank; i++) {
        const px = x - pw / 2 + i * 8 + 1, py = y + r + 6;
        g.fillStyle(P['ink-900'], 1).fillRect(px - 2, py - 2, 8, 8);
        g.fillStyle(i < rank ? P['gold-200'] : P['ink-700'], 1).fillRect(px, py, 4, 4);
      }
    }
    if (n.type !== 'minor') c.add(txt(s, x, y + r + (n.maxRank > 1 ? 16 : 6), n.name, 'micro', st === 'lock' ? C.muted : C.text2).setOrigin(0.5, 0));
    hotspot(s, c, x - r, y - r, r * 2, r * 2, {
      over: () => { this.selected = n.id; this.showDetail(tree, n); },
      click: () => {
        const res = allocate(this.gs, tree.id, n.id);
        if (!res.ok) this.mgr.rt.ui?.toast(res.reason, C.bad);
        this.selected = n.id;
        this.refresh();
      },
    });
  }

  private drawSide(tree: SkillTreeDef): void {
    const s = this.scene, c = this.container, gs = this.gs;
    const pr = gs.player.progression;
    c.add(txt(s, 928, 92, `Skill points: ${pr.unspentSkillPoints}`, 'titleM', pr.unspentSkillPoints ? C.goldHi : C.text2));
    const cost = respecCost(gs);
    ironButton(s, c, 928, 136, 170, 32, cost ? `Respec · ${cost} g` : 'Respec · Free', () => {
      if (!respecTrees(gs)) this.mgr.rt.ui?.toast('Not enough gold', C.bad);
      this.refresh();
    }, 'red');
    c.add(txt(s, 928, 178, 'FREE UNTIL LV 10 · THEN A LANTERNATE SHRINE', 'micro', C.muted, 320));
    c.add(txt(s, 928, 204, `${pointsInTree(gs, tree.id)} points in ${tree.name}`, 'bodyS', C.text2));
    this.off = this.drawChoices(204);
    this.detail = s.add.container(0, this.off);
    c.add(this.detail);
    const sel = tree.nodes.find((n) => n.id === this.selected);
    if (sel) this.showDetail(tree, sel);
    else this.detail.add(txt(s, 940, 240, 'Hover a node to see its details.', 'bodyS', C.muted, 296));
  }

  /** subclass at 15, Second Oath at 25; returns the height used */
  private drawChoices(y0: number): number {
    const s = this.scene, c = this.container, gs = this.gs;
    const pr = gs.player.progression;
    const cls = this.mgr.rt.player.cls;
    let y = y0 + 24;
    if (cls && !pr.subclassId && pr.level >= SUBCLASS_LEVEL) {
      c.add(txt(s, 928, y, 'Choose your path', 'titleS', C.goldHi)); y += 30;
      cls.subclasses.forEach((sc, i) => {
        ironButton(s, c, 928 + i * 162, y, 154, 30, sc.name, () => { const r = chooseSubclass(gs, sc.id); if (!r.ok) this.mgr.rt.ui?.toast(r.reason, C.bad); this.treeIdx = 1; this.refresh(); }, 'gold');
        hotspot(s, c, 928 + i * 162, y, 154, 30, { over: () => this.mgr.tooltip.show({ lines: [{ text: sc.name, size: 'title' }, { text: sc.description, color: C.magic }, { text: 'Permanent. Unlocks its own tree.', color: C.muted, size: 'micro' }], accent: P['gold-500'] }), out: () => this.mgr.tooltip.hide() });
      });
      y += 42;
    }
    if (!pr.secondTree && pr.level >= SECOND_OATH_LEVEL) {
      c.add(txt(s, 928, y, 'Swear a Second Oath', 'titleS', C.goldHi)); y += 28;
      c.add(txt(s, 928, y, 'Another class tree: tiers I–III, no keystones, +1 point per rank.', 'micro', C.muted, 316)); y += 30;
      secondOathOptions(gs).slice(0, 6).forEach((t, i) => {
        ironButton(s, c, 928 + (i % 2) * 162, y + Math.floor(i / 2) * 36, 154, 30, t.name.replace(/^The /, ''), () => { const r = chooseSecondOath(gs, t.id); if (!r.ok) this.mgr.rt.ui?.toast(r.reason, C.bad); this.refresh(); });
      });
      y += Math.ceil(Math.min(6, secondOathOptions(gs).length) / 2) * 36 + 6;
    }
    return y - (y0 + 24);
  }

  private showDetail(tree: SkillTreeDef, n: SkillNodeDef): void {
    const s = this.scene, d = this.detail;
    if (!d) return;
    d.removeAll(true);
    const g = s.add.graphics();
    d.add(g);
    drawFrame(g, 'tooltip', 928, 228, 320, 440 - this.off, P['gold-500']);
    const rank = treeRanks(this.gs, tree.id)[n.id] ?? 0;
    const check = canAllocate(this.gs, tree, n);
    const typeCol = n.type === 'keystone' ? P['flame-700'] : n.type === 'ability' ? P['mana-700'] : n.type === 'notable' ? P['stam-700'] : P['ink-600'];
    d.add(txt(s, 944, 244, n.name, 'titleS', C.text, 290));
    g.fillStyle(P['ink-900'], 1).fillRect(942, 280, 94, 24);
    g.fillStyle(typeCol, 1).fillRect(944, 282, 90, 20);
    d.add(txt(s, 989, 286, n.type.toUpperCase(), 'micro', C.text).setOrigin(0.5, 0));
    g.fillStyle(P['ink-900'], 1).fillRect(1042, 280, 64, 24);
    g.fillStyle(P['ink-600'], 1).fillRect(1044, 282, 60, 20);
    d.add(txt(s, 1074, 286, `${rank} / ${n.maxRank}`, 'micro', C.text).setOrigin(0.5, 0));
    d.add(txt(s, 944, 314, `${n.branch[0].toUpperCase()}${n.branch.slice(1)} · Tier ${ROMAN[n.tier - 1]}`, 'bodyS', C.muted));
    d.add(txt(s, 944, 340, n.description, 'bodyS', C.magic, 290));
    const reqs = [...(n.requiresAll ?? []), ...(n.requiresAny ?? [])].map((id) => tree.nodes.find((x) => x.id === id)?.name ?? id);
    let y = 440;
    if (reqs.length) { d.add(txt(s, 944, y, `Requires ${n.requiresAll ? 'all' : 'one'} of: ${reqs.join(', ')}`, 'bodyS', C.text2, 290)); y += 44; }
    if (n.exclusiveGroup) { d.add(txt(s, 944, y, 'Keystone: only one per tree.', 'bodyS', C.bad, 290)); y += 24; }
    d.add(txt(s, 944, 630 - this.off, check.ok ? 'CLICK  ALLOCATE' : check.reason.toUpperCase(), 'micro', check.ok ? C.good : C.muted, 290));
  }

  destroy(): void { this.container.destroy(true); }
}
