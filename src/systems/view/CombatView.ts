/**
 * Renders the systems' replicated entities (Claude 3): players (baked paperdoll heroes), creatures and pets
 * (bakeBeast), projectiles, ground zones and loot. A SnapshotConsumer, so solo and co-op draw the same way.
 * Positions are smoothed toward the latest snapshot; world art stays at 1× (HANDOFF rule 1).
 */
import Phaser from 'phaser';
import { Depth } from '@/core/constants';
import { Settings } from '@/core/settings';
import { Art, bakeBeast, bakeHero, hasSideView } from '@/art';
import type { EntityId, EntityKind, EntityState, Snapshot, SnapshotConsumer } from '@/net/types';
import { kindColor } from './fx';
import { creature } from '@/systems/rules/creatures';
import { Services } from '@/core/services';
import { classDisplay } from '@/data/classes/hc';
import { eliteAffix } from '@/data/enemies/hc/elites';
import { Registry } from '@/core/Registry';
import type { NpcDef } from '@/core';
import { npcTexture } from '@/art/npcArt';
import { getFlag } from '@/core/flags';

/** The NpcDef behind an escort (name, face); a bare id when the narrative registry doesn't know it. */
const escortNpc = (id: string): Pick<NpcDef, 'id' | 'classLook'> & { name?: string } =>
  (id ? (Registry.tryGet('npc', id) as NpcDef | undefined) : undefined) ?? { id: (id || 'npc:traveller') as NpcDef['id'] };

type Data = Record<string, string | number | boolean>;
interface Rec {
  id: string; kind: EntityKind; def: string; space: string; data: Data;
  obj: Phaser.GameObjects.Sprite | Phaser.GameObjects.Arc | Phaser.GameObjects.Graphics | Phaser.GameObjects.Image;
  bar?: Phaser.GameObjects.Graphics;
  /** other players: nameplate (party name, class colour) and the downed ▼ marker */
  plate?: Phaser.GameObjects.Text;
  downMark?: Phaser.GameObjects.Text;
  /** soft ground shadow at the feet (actors only) */
  shadow?: Phaser.GameObjects.Ellipse;
  owner?: string;
  tx: number; ty: number; x: number; y: number;
  hp: number; maxHp: number; tex?: string; anim: string; facing: string;
  /** CombatFx hit flash: status tints wait until this scene time */
  flashUntil?: number;
}

/**
 * Ground shadows (shared with Claude 2's NpcView so NPCs match): ink ellipse, 55% of the sprite's width (14–96 px),
 * a third as tall, 30% alpha, on the ground layer under telegraphs. Flyers cast a smaller, fainter one.
 */
export const SHADOW = { color: 0x0d1226, alpha: 0.3, widthOfSprite: 0.55, min: 14, max: 96, aspect: 0.33, depth: Depth.GroundDecor + 30, flyerScale: 0.7, flyerAlpha: 0.18 } as const;

/** Claude 4's Shade campaign: the hero casts no shadow while shade.shadowless is set, until the nemesis is spared. */
const shadowless = (r: { def: string }): boolean =>
  r.def === 'class:shade' && !!getFlag('shade.shadowless') && getFlag('shade.nemesis_fate') !== 'spared';

const PET_BODY: Record<string, string> = { 'pet:hawk': 'bx_crow', 'pet:treant': 'bx_verdant_0' };

export class CombatView implements SnapshotConsumer {
  readonly kinds: EntityKind[] = ['player', 'enemy', 'pet', 'projectile', 'object', 'loot'];
  private recs = new Map<string, Rec>();
  /** the local hero's sprite exists before the first snapshot so the camera can follow it */
  readonly local: Phaser.GameObjects.Sprite;

  constructor(private scene: Phaser.Scene, private localId: string, private space: () => string, x: number, y: number, classId: string) {
    this.local = scene.add.sprite(x, y, Art.tryFrame(`char_${classId}`)?.key ?? `heroes:${classId}`).setOrigin(0.5, 0.95);
    this.local.setDepth(Depth.Actors + y);
    scene.events.on('update', this.tick, this);
    scene.events.once('shutdown', () => this.destroy());
  }

  apply(entities: EntityState[], removed: EntityId[], _snap: Snapshot): void {
    const here = this.space();
    for (const id of removed) this.drop(id);
    const seen = new Set<string>();
    for (const e of entities) {
      if (e.space !== here) { if (this.recs.has(e.id)) this.drop(e.id); continue; }
      seen.add(e.id);
      const r = this.recs.get(e.id) ?? this.create(e);
      if (!r) continue;
      r.tx = e.x; r.ty = e.y; r.data = e.data ?? {}; r.hp = e.hp ?? 0; r.maxHp = e.maxHp ?? 0; r.owner = e.owner;
      // a facing change can swap front ↔ side anims (side-view sheets), so it re-picks the anim too
      if (r.def !== e.def || r.anim !== e.anim || r.facing !== e.facing) { r.def = e.def; r.facing = e.facing; this.animate(r, e.anim); r.anim = e.anim; }
      if (e.kind === 'player') this.updateHeroTexture(r);
    }
    // full snapshots list everything in view; anything missing left our area of interest
    for (const id of [...this.recs.keys()]) if (!seen.has(id)) this.drop(id);
  }

  /** Click picking: the creature or player under a world point. */
  /** Where the local hero is drawn (world px): HeroInput aims a facing slash from here. */
  heroAt(): { x: number; y: number } | null { return this.local.visible ? { x: this.local.x, y: this.local.y } : null; }

  pick(x: number, y: number): string | null {
    let best: string | null = null, bd = 28 * 28;
    for (const r of this.recs.values()) {
      if (r.kind !== 'enemy' && r.kind !== 'player') continue;
      if (r.id === this.localId) continue;
      const big = r.data.tier === 'boss' ? 3 : r.data.tier === 'mini' ? 2 : 1;
      const d = (r.x - x) ** 2 + (r.y - 12 * big - y) ** 2;
      if (d < bd * big * big) { bd = d / (big * big); best = r.id; }
    }
    return best;
  }

  entity(id: string): Rec | undefined { return this.recs.get(id); }
  /** DEV: everything drawn, plus the local sprite. */
  dump(): { id: string; kind: string; def: string; x: number; y: number; local: boolean }[] {
    return [...this.recs.values()].map((r) => ({ id: r.id, kind: r.kind, def: r.def, x: Math.round(r.x), y: Math.round(r.y), local: r.obj === this.local, shadow: !!r.shadow?.visible }));
  }
  visible(x: number, y: number): boolean { return this.scene.cameras.main.worldView.contains(x, y) || true; }

  private create(e: EntityState): Rec | undefined {
    const base = { id: e.id, kind: e.kind, def: e.def, space: e.space, data: e.data ?? {}, tx: e.x, ty: e.y, x: e.x, y: e.y, hp: e.hp ?? 0, maxHp: e.maxHp ?? 0, anim: '', facing: e.facing };
    let obj: Rec['obj'];
    switch (e.kind) {
      case 'player': obj = e.id === this.localId ? this.local : this.scene.add.sprite(e.x, e.y, `heroes:${e.def.replace('class:', '')}`).setOrigin(0.5, 0.95); break;
      case 'enemy': case 'pet': {
        const body = e.def.startsWith('class:') ? null : PET_BODY[e.def] ?? creature(e.def)?.body ?? e.def;
        let key = `heroes:${e.def.replace('class:', '')}`;
        const npcKey = e.data?.esc && e.data.npc ? npcTexture(this.scene, escortNpc(String(e.data.npc))) : null;
        if (npcKey) key = npcKey; // escorted NPC: its own face, not the neutral body
        else if (body) { try { key = bakeBeast(this.scene, body); } catch { key = 'bestiary:wolf'; } }
        obj = npcKey ? this.scene.add.sprite(e.x, e.y, key, 0).setOrigin(0.5, 38 / 40) : this.scene.add.sprite(e.x, e.y, key).setOrigin(0.5, 0.95);
        if (this.scene.anims.exists(`${key}:idle`)) (obj as Phaser.GameObjects.Sprite).play(`${key}:idle`);
        // a creature on a borrowed body (campaign bosses, regional rank-and-file) is drawn at its own size
        const own = creature(e.def), lent = body && body !== e.def ? creature(body) : undefined;
        if (!npcKey && own && lent && lent.radius > 0) obj.setScale(Math.max(0.5, Math.min(3, own.radius / lent.radius)));
        if (e.def.startsWith('class:')) obj.setAlpha(0.6);
        break;
      }
      case 'projectile': {
        const c = kindColor(String(e.data?.k ?? 'physical'));
        obj = this.scene.add.circle(e.x, e.y - 12, Math.max(3, Number(e.data?.r ?? 5) * 0.7), c).setBlendMode(Phaser.BlendModes.ADD);
        break;
      }
      case 'object': obj = this.scene.add.graphics(); break;
      case 'loot': {
        const f = Art.tryFrame(e.def === 'gold' ? 'icon_coin' : e.def);
        obj = f ? this.scene.add.image(e.x, e.y, f.key, f.frame) : this.scene.add.circle(e.x, e.y, 5, 0xffd23f);
        obj.setDepth(Depth.Actors + e.y - 8);
        if (!Settings.get().reduceMotion) this.scene.tweens.add({ targets: obj, y: e.y - 4, yoyo: true, repeat: -1, duration: 700, ease: 'Sine.inOut' });
        break;
      }
      default: return undefined;
    }
    const r: Rec = { ...base, obj, owner: e.owner };
    if (e.kind === 'enemy' && e.data?.elite) {
      // elite: champion name in gold + one coloured glyph per affix, so players see why this fight is hard
      r.plate = this.scene.add.text(e.x, e.y, String(e.data.ename ?? ''), { fontFamily: '"Pixelify Sans", monospace', fontSize: '11px', fontStyle: 'bold', color: '#ffd23f', stroke: '#1a1230', strokeThickness: 3 })
        .setOrigin(0.5, 1).setDepth(Depth.WorldUi - 5);
      const glyphs = String(e.data.elite).split(',').map((a) => eliteAffix(a)).filter(Boolean);
      r.downMark = this.scene.add.text(e.x, e.y, glyphs.map((a) => a!.glyph).join(' '), { fontFamily: '"Pixelify Sans", monospace', fontSize: '12px', color: glyphs[0]?.color ?? '#ffd23f', stroke: '#1a1230', strokeThickness: 3 })
        .setOrigin(0.5, 1).setDepth(Depth.WorldUi - 4);
    }
    if (e.kind === 'enemy' && e.data?.esc) {
      // escort: a friendly green plate with its name, the downed ▼ and revive progress like a party member
      r.plate = this.scene.add.text(e.x, e.y, '', { fontFamily: '"Pixelify Sans", monospace', fontSize: '11px', fontStyle: 'bold', color: '#7bd88f', stroke: '#1a1230', strokeThickness: 3 })
        .setOrigin(0.5, 1).setDepth(Depth.WorldUi - 5);
      r.downMark = this.scene.add.text(e.x, e.y, '▼', { fontFamily: '"Jersey 10"', fontSize: '20px', color: '#ff4d5e', stroke: '#1a1230', strokeThickness: 3 })
        .setOrigin(0.5, 1).setDepth(Depth.WorldUi - 4).setVisible(false);
    }
    if (e.kind === 'player' && e.id !== this.localId) {
      const cls = classDisplay(e.def.replace('class:', ''));
      r.plate = this.scene.add.text(e.x, e.y, '', { fontFamily: '"Pixelify Sans", monospace', fontSize: '11px', fontStyle: 'bold', color: cls?.color ?? '#fbf6e9', stroke: '#1a1230', strokeThickness: 3 })
        .setOrigin(0.5, 1).setDepth(Depth.WorldUi - 5);
      r.downMark = this.scene.add.text(e.x, e.y, '▼', { fontFamily: '"Jersey 10"', fontSize: '20px', color: '#ff4d5e', stroke: '#1a1230', strokeThickness: 3 })
        .setOrigin(0.5, 1).setDepth(Depth.WorldUi - 4).setVisible(false);
    }
    if (e.kind === 'enemy' || (e.kind === 'player' && e.id !== this.localId) || e.kind === 'pet') r.bar = this.scene.add.graphics().setDepth(Depth.WorldUi - 10);
    this.recs.set(e.id, r);
    this.animate(r, e.anim);
    if (e.kind === 'player') this.updateHeroTexture(r);
    return r;
  }

  private updateHeroTexture(r: Rec): void {
    const lk = String(r.data.lk ?? '');
    if (!lk || r.tex === lk) return;
    r.tex = lk;
    const v = lk.split('.');
    const classId = v[0];
    const key = `hero:${lk}`;
    try {
      if (!this.scene.textures.exists(key)) {
        const look = v[1] === 'd' ? undefined : { skin: +v[1], hair: +v[2], hc: +v[3], eyes: +v[4], ec: +v[5], mouth: +v[6], mark: +v[7], body: (+v[8] as 0 | 1) };
        const g = v.slice(look ? 9 : 2).map(Number);
        const gear = { brows: g[0], dye: g[1], headwear: g[2], cape: g[3], neck: g[4], face: g[5], extra: g[6], helmSet: g[7], chestSet: g[8], handsSet: g[9], feetSet: g[10], weapon: g[11] };
        if (look) bakeHero(this.scene, key, classId, look, gear);
        else return;
      }
      (r.obj as Phaser.GameObjects.Sprite).setTexture(key);
      this.animate(r, r.anim || 'idle', true);
    } catch (err) {
      console.warn('[systems] hero bake failed', lk, err);
    }
  }

  private animate(r: Rec, anim: string, force = false): void {
    if (!(r.obj instanceof Phaser.GameObjects.Sprite)) return;
    const key = r.obj.texture.key;
    const walk = anim === 'walk' || anim === 'dash' || anim === 'leap';
    // heroes with side-view frames (bakeHero 6–11, facing right) use them facing east / west; others keep the front sheet.
    // Anim names come from the sprite's texture key, so side frames must live in the SAME texture as the front ones
    // (bakeHero and npcBake both do this)
    const side = (r.facing === 'e' || r.facing === 'w') && hasSideView(this.scene, key) ? '-side' : '';
    const pick = `${key}:${walk ? 'walk' : 'idle'}${side}`;
    const want = this.scene.anims.exists(pick) ? pick : this.scene.anims.exists(`${key}:${walk ? 'walk' : 'idle'}`) ? `${key}:${walk ? 'walk' : 'idle'}` : `${key}:idle`;
    if (this.scene.anims.exists(want) && (force || r.obj.anims.currentAnim?.key !== want)) r.obj.play(want, true);
    if ((anim === 'attack' || anim === 'cast') && !Settings.get().reduceMotion) this.scene.tweens.add({ targets: r.obj, scaleY: 0.9, duration: 70, yoyo: true });
  }

  private tick(_t: number, dtMs: number): void {
    const k = 1 - Math.exp(-dtMs / 45);
    for (const r of this.recs.values()) {
      r.x += (r.tx - r.x) * k; r.y += (r.ty - r.y) * k;
      if (Math.abs(r.tx - r.x) > 160 || Math.abs(r.ty - r.y) > 160) { r.x = r.tx; r.y = r.ty; } // teleports
      switch (r.kind) {
        case 'projectile': (r.obj as Phaser.GameObjects.Arc).setPosition(r.x, r.y - 12).setDepth(Depth.Effects - 100); break;
        case 'object': this.drawZone(r); break;
        case 'loot': (r.obj as Phaser.GameObjects.Image).x = r.x; break;
        default: this.drawActor(r);
      }
    }
  }

  private drawActor(r: Rec): void {
    const o = r.obj as Phaser.GameObjects.Sprite;
    o.setPosition(Math.round(r.x), Math.round(r.y) + (r.anim === 'yield' ? 4 : 0)).setDepth(Depth.Actors + r.y);
    this.drawShadow(r, o);
    // side-view frames face right: mirror only facing west, for every kind (heroes, escorts). Front atlas sheets keep
    // their own convention (creatures face left, heroes right)
    const sideAnim = !!o.anims.currentAnim?.key.endsWith('-side');
    if (r.facing === 'e') o.setFlipX(sideAnim ? false : r.kind !== 'player');
    else if (r.facing === 'w') o.setFlipX(sideAnim ? true : r.kind === 'player');
    const st = String(r.data.s ?? '');
    const down = r.anim === 'down' || r.anim === 'dead' || r.anim === 'die';
    o.setAngle(down ? 90 : 0);
    const flashing = (r.flashUntil ?? 0) > this.scene.time.now;
    o.setAlpha(r.data.stealth ? (r.id === this.localId ? 0.45 : 0.12) : r.def.startsWith('class:') && r.kind !== 'player' ? 0.6 : r.anim === 'die' ? 0.5 : 1);
    if (flashing) { /* CombatFx owns the tint for a moment */ }
    else if (st.includes('freeze')) o.setTint(0x9fe6ff);
    else if (st.includes('burn')) o.setTint(0xffb27a);
    else if (st.includes('chill') || st.includes('slow')) o.setTint(0xc8f0ff);
    else if (st.includes('stun') || st.includes('sleep')) o.setTint(0xfff1a8);
    else if (down) o.setTint(0xff8a8a);
    else if (r.anim === 'yield') o.setTint(0x9aa3c7);
    else o.clearTint();
    if (r.plate && r.kind === 'enemy' && !r.data.esc) this.drawElitePlate(r, o);
    else if (r.plate) this.drawPlate(r, o);
    if (!r.bar) return;
    r.bar.clear();
    if (r.data.cos) return; // cosmetic story pets show no health bar
    const tier = String(r.data.tier ?? '');
    const w = tier === 'mini' ? 40 : 28, y = r.y - o.displayHeight - 6, x = r.x - w / 2;
    if (tier !== 'boss' && !down) this.drawStatusMark(r.bar, st, x - 6, y + 2);
    if (r.maxHp <= 0 || (r.hp >= r.maxHp && tier !== 'mini' && !r.data.elite && !r.data.esc && r.kind !== 'player') || tier === 'boss' || r.anim === 'die') return;
    r.bar.fillStyle(0x1a1230, 1).fillRect(x - 1, y - 1, w + 2, 6);
    // colour-blind safe (Claude 6's audit): allies cyan-blue rather than green, and enemy bars carry a dark notch every
    // 25% so hostile vs friendly reads by shape as well as colour
    r.bar.fillStyle(r.kind === 'enemy' ? 0xff4d5e : 0x4fb6ff, 1).fillRect(x, y, Math.max(0, (w * r.hp) / r.maxHp), 4);
    if (r.kind === 'enemy') { r.bar.fillStyle(0x1a1230, 1); for (let k = 1; k < 4; k++) r.bar.fillRect(Math.round(x + (w * k) / 4), y, 1, 4); }
  }

  /** A shape per status beside the bar (the sprite tint alone is invisible to colour-blind players and in bright scenes). */
  private drawStatusMark(g: Phaser.GameObjects.Graphics, st: string, cx: number, cy: number): void {
    const mark = st.includes('freeze') ? 'diamond' : st.includes('burn') ? 'up' : st.includes('stun') || st.includes('sleep') ? 'dot' : st.includes('chill') || st.includes('slow') ? 'down' : '';
    if (!mark) return;
    const fill = { diamond: 0x9fe6ff, up: 0xff9a3c, dot: 0xffe066, down: 0xc8f0ff }[mark];
    g.lineStyle(1, 0x1a1230, 1).fillStyle(fill, 1);
    if (mark === 'dot') { g.fillCircle(cx, cy, 3).strokeCircle(cx, cy, 3); return; }
    const pts = mark === 'diamond' ? [cx, cy - 4, cx + 3, cy, cx, cy + 4, cx - 3, cy] : mark === 'up' ? [cx, cy - 4, cx + 3.5, cy + 3, cx - 3.5, cy + 3] : [cx - 3.5, cy - 3, cx + 3.5, cy - 3, cx, cy + 4];
    const poly = Array.from({ length: pts.length / 2 }, (_, i) => new Phaser.Math.Vector2(pts[2 * i], pts[2 * i + 1]));
    g.fillPoints(poly, true).strokePoints(poly, true);
  }

  /** Elite plate above the bar; glyphs above the name. Bars always show for elites. */
  private drawElitePlate(r: Rec, o: Phaser.GameObjects.Sprite): void {
    const top = r.y - o.displayHeight - 10;
    const dying = r.anim === 'die';
    r.plate!.setPosition(Math.round(r.x), Math.round(top)).setVisible(!dying);
    r.downMark?.setPosition(Math.round(r.x), Math.round(top - 13)).setVisible(!dying);
  }

/** Party name from the session (falls back to the class name) and a pulsing ▼ while downed, with revive progress. */
  private drawPlate(r: Rec, o: Phaser.GameObjects.Sprite): void {
    const member = Services.tryGet('net')?.session().members.find((m) => m.playerId === r.owner);
    const name = r.data.esc ? escortNpc(String(r.data.npc ?? '')).name ?? String(r.data.name ?? '') : member?.name || classDisplay(r.def.replace('class:', ''))?.name || '';
    const down = Number(r.data.down ?? 0) > 0 || r.anim === 'down';
    const rv = Number(r.data.rv ?? 0);
    const label = down ? (rv > 0 ? `${name} · reviving ${Math.min(100, Math.round(rv / 30))}%` : `${name} · downed ${Math.ceil(Number(r.data.down ?? 0) / 1000)}s`) : name;
    if (r.plate!.text !== label) r.plate!.setText(label);
    const top = r.y - o.displayHeight - (r.bar ? 10 : 4);
    r.plate!.setPosition(Math.round(r.x), Math.round(top)).setVisible(r.anim !== 'dead');
    r.downMark!.setVisible(down);
    if (down) r.downMark!.setPosition(Math.round(r.x), Math.round(top - 14 - (Settings.get().reduceMotion ? 0 : 3 * Math.abs(Math.sin(this.scene.time.now / 220)))));
  }

  private drawZone(r: Rec): void {
    const g = r.obj as Phaser.GameObjects.Graphics, d = r.data;
    g.clear().setDepth(String(d.team) === 'enemies' ? Depth.GroundDecor + 50 : Depth.GroundDecor + 40);
    const c = kindColor(String(d.k ?? 'physical'));
    const anim = r.anim;
    const alpha = anim === 'wall' ? 0.75 : anim === 'trap' ? 0.5 : 0.22;
    g.fillStyle(c, alpha).lineStyle(2, c, 0.8);
    const shape = String(d.shape), ang = Phaser.Math.DegToRad(Number(d.ang ?? 0));
    if (anim === 'wall' || shape === 'line') {
      const len = Number(d.len || 120), w = Number(d.w || 16);
      const along = anim === 'wall' ? ang + Math.PI / 2 : ang;
      const cx = anim === 'wall' ? r.x : r.x + (Math.cos(ang) * len) / 2, cy = anim === 'wall' ? r.y : r.y + (Math.sin(ang) * len) / 2;
      const dx = Math.cos(along) * (len / 2), dy = Math.sin(along) * (len / 2), px = -Math.sin(along) * (w / 2), py = Math.cos(along) * (w / 2);
      g.fillPoints([{ x: cx - dx + px, y: cy - dy + py }, { x: cx + dx + px, y: cy + dy + py }, { x: cx + dx - px, y: cy + dy - py }, { x: cx - dx - px, y: cy - dy - py }] as Phaser.Types.Math.Vector2Like[], true);
    } else {
      const rad = Math.max(10, Number(d.r ?? 40));
      g.fillCircle(r.x, r.y, rad).strokeCircle(r.x, r.y, rad);
    }
  }

  private drawShadow(r: Rec, o: Phaser.GameObjects.Sprite): void {
    const gone = r.anim === 'dead' || r.anim === 'die' || !o.visible || (r.kind === 'player' && shadowless(r));
    if (gone) { r.shadow?.setVisible(false); return; }
    const flyer = r.kind !== 'player' && !!creature(r.def)?.ai.flying;
    const w = Math.max(SHADOW.min, Math.min(SHADOW.max, (o.displayWidth || 32) * SHADOW.widthOfSprite)) * (flyer ? SHADOW.flyerScale : 1);
    r.shadow ??= this.scene.add.ellipse(0, 0, w, w * SHADOW.aspect, SHADOW.color, flyer ? SHADOW.flyerAlpha : SHADOW.alpha).setDepth(SHADOW.depth);
    if (Math.abs(r.shadow.width - w) > 1) r.shadow.setSize(w, w * SHADOW.aspect);
    r.shadow.setPosition(Math.round(r.x), Math.round(r.y) - 1).setVisible(true).setAlpha(o.alpha < 1 ? o.alpha * 0.6 : 1);
  }

  private drop(id: string): void {
    const r = this.recs.get(id);
    if (!r) return;
    this.recs.delete(id);
    r.bar?.destroy();
    r.plate?.destroy();
    r.downMark?.destroy();
    r.shadow?.destroy();
    if (r.obj !== this.local) r.obj.destroy();
  }

  destroy(): void {
    this.scene.events.off('update', this.tick, this);
    for (const id of [...this.recs.keys()]) this.drop(id);
  }
}

