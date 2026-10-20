/**
 * Map screen (handoff "Map zoom levels: Realms › Morvane › Village"): 864×544 map at (48, 84), 304-wide side
 * panel, breadcrumb tabs top-left. Opens on ui:open { panel: 'map' } (M, HUD map button), Esc steps back.
 * Art comes from the handoff libraries (mvrealm, mvmap + mvfog, mvvil); school realms use the generator's
 * overview. Travel goes to the authority as act { domain: 'world', action: 'travel' }.
 */
import Phaser from 'phaser';
import { Depth, GAME_HEIGHT, GAME_WIDTH, bus, getFlag, keyLabel, type Action } from '@/core';
import { mv } from '@/art';
import { MORVANE_REGIONS, MORVANE_VILLAGES } from '@/data/regions/hc/morvane';
import { C, HCButton, n, panel, tab, text } from '@/ui/kit/hc';
import { isAction } from '@/ui/kit/hc/keys';
import { REALM_OVERVIEW_STEP, mapMarkers, morvaneRegionAt, realmOverview, zoneInfo, type MapMarker } from '@/world/hc/overview';
import { REALMS, instanceDef, placeName, realmOf } from '@/world/hc/spaces';
import { regionBandNow } from '@/world/hc/spawns';
import { MapLabels, capFirst } from './labels';
import { drawMerchants, drawQuestMarks, mapTopBar, villageView } from './mapQuests';
import { drawMarkerGlyph, drawOptionalGlyph } from './markerGlyphs';
import { resolvePlace, type QuestMark } from './questMarks';

export interface MapScreenSource {
  /** the local player's space and position (world px) */
  space(): string;
  player(): { x: number; y: number };
  /** found region/area/zone ids and woken waystone ids */
  found(): string[];
  woken(): string[];
  /** the player's own school realm (always known) */
  homeSpace(): string;
  travel(waystoneId: string): void;
  /** the open quest objectives, resolved (src/ui/map/questMarks.ts) */
  quests?(): QuestMark[];
}

type Level = { kind: 'realms' } | { kind: 'space'; space: string } | { kind: 'village'; space: string; id: string };
interface MvRealm { id: string; name: string; sub: string; x: number; y: number; desc: string; school: string | null }
interface MvVillage { id: string; name: string; b: [string, string, string, string | null][] }
interface MvWorld { REALMS: MvRealm[]; VIL: MvVillage[]; vilLayout(v: MvVillage): { id: string; label: string; svc: string; npc: string | null; x: number; y: number; w: number; h: number }[] }

// the shared top bar (Pack · Skills · Spells · Journal · Map) sits at y 20; breadcrumbs are a second row at y 84
const MX = 48, MY = 136, MW = 864, MH = 544;
const PX = MX + MW + 16, PW = GAME_WIDTH - PX - 48;
const TILE = 32;
const world = (): MvWorld => mv().WORLD as MvWorld;
const bare = (id: string) => id.replace(/^[a-z]+:/, '');

export class MapScreen {
  private root: Phaser.GameObjects.Container;
  private view: Phaser.GameObjects.Container;
  private side: Phaser.GameObjects.Container;
  private crumbs: Phaser.GameObjects.Container;
  private level: Level = { kind: 'realms' };
  /** current level's map transform: world tile → screen */
  private toScreen: ((tx: number, ty: number) => [number, number]) | null = null;
  private markers: MapMarker[] = [];
  /** the realm or instance overview on screen (label placement keeps names off its roads) */
  private ov: { ox: number; oy: number; scale: number; w: number; h: number; road: Uint8Array } | null = null;
  open = false;
  /** the place the map was opened on (the Journal's "Show on map"): its level opens and its mark pulses */
  private focus: string | undefined;
  /** bus and HUD-keyboard listeners: the HUD outlives each World scene that builds a map, so destroy() drops them */
  private offs: (() => void)[] = [];
  private keyHints: [Phaser.GameObjects.Text, Action][] = [];

  constructor(private scene: Phaser.Scene, private src: MapScreenSource) {
    const dim = scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, n(C.bg), 0.8).setOrigin(0).setInteractive();
    const frame = panel(scene, MX - 8, MY - 8, MW + 16, MH + 16, 'panel_gold');
    const side = panel(scene, PX, MY - 8, PW, MH + 16, 'panel');
    this.view = scene.add.container(0, 0);
    this.side = scene.add.container(PX + 16, MY + 8);
    this.crumbs = scene.add.container(MX, 84);
    const hit = scene.add.zone(MX, MY, MW, MH).setOrigin(0).setInteractive({ useHandCursor: true });
    hit.on('pointerup', (p: Phaser.Input.Pointer) => this.click(p.x - MX, p.y - MY));
    this.root = scene.add.container(0, 0, [dim, frame, side, this.view, hit, this.side, this.crumbs, ...mapTopBar(scene, this.keyHints, () => this.close())])
      .setDepth(Depth.WorldUi + 1000).setVisible(false);
    this.offs.push(bus.on('ui:open', ({ panel: p, focus }) => { if (p !== 'map') return; if (focus) this.show(focus); else this.toggle(); }));
    // closed from elsewhere (travel): hide without announcing it again
    this.offs.push(bus.on('ui:close', ({ panel: p }) => { if (p === 'map' && this.open) { this.open = false; this.root.setVisible(false); } }));
    // back out with the (rebindable) pause key; Esc always backs out of an open overlay too
    const key = (ev: KeyboardEvent) => { if (this.open && (isAction(ev, 'pause') || ev.key === 'Escape')) this.back(); };
    scene.input.keyboard!.on('keydown', key);
    this.offs.push(() => scene.input.keyboard?.off('keydown', key));
  }

  toggle(): void { if (this.open) this.close(); else this.show(); }

  /** Open on the player's level, or on the level holding `focus` (a quest place id) with its mark pulsing. */
  show(focus?: string): void {
    this.open = true;
    this.focus = focus;
    for (const [k, a] of this.keyHints) k.setText(keyLabel(a)); // rebinds since the bar was built
    this.root.setVisible(true);
    const mark = focus ? this.src.quests?.().find((m) => m.place === focus) : undefined;
    const at = mark ?? (focus ? resolvePlace(focus, undefined, this.src.space()) : null);
    const here = at?.space ?? this.src.space();
    this.go(here === 'concordia' || realmOf(here) || instanceDef(here) ? { kind: 'space', space: here } : { kind: 'realms' });
  }

  close(): void {
    if (!this.open) return;
    this.open = false;
    this.root.setVisible(false);
    bus.emit('ui:close', { panel: 'map' });
  }

  private back(): void {
    if (this.level.kind === 'village') this.go({ kind: 'space', space: this.level.space });
    else this.close();
  }

  private go(level: Level): void {
    this.level = level;
    this.scene.tweens.killTweensOf(this.view.list);
    this.view.removeAll(true);
    this.side.removeAll(true);
    this.toScreen = null;
    this.ov = null;
    this.markers = [];
    this.drawCrumbs();
    if (level.kind === 'realms') this.drawRealms();
    else if (level.kind === 'village') this.drawVillage(level.space, level.id);
    else if (level.space === 'concordia') this.drawMorvane();
    else if (level.space.startsWith('inst:')) this.drawInstance(level.space);
    else this.drawRealm(level.space);
  }

  private drawCrumbs(): void {
    this.crumbs.removeAll(true);
    const L = this.level;
    const items: [string, Level][] = [['Realms', { kind: 'realms' }]];
    // inside a lair or cave: Realms › its realm (or Morvane) › the instance
    const parent = L.kind !== 'realms' && L.space.startsWith('inst:') ? instanceDef(L.space)?.exit?.space : undefined;
    if (parent) items.push([parent === 'concordia' ? 'Morvane' : realmOf(parent)?.name ?? parent, { kind: 'space', space: parent }]);
    if (L.kind !== 'realms') items.push([L.space === 'concordia' ? 'Morvane' : L.space.startsWith('inst:') ? placeName(L.space, L.space).name : realmOf(L.space)?.name ?? L.space, { kind: 'space', space: L.space }]);
    if (L.kind === 'village') items.push([this.villageName(L.space, L.id), L]);
    items.forEach(([label, lv], i) => this.crumbs.add(tab(this.scene, i * 158, 0, capFirst(label), i === items.length - 1, () => this.go(lv))));
  }

  // ───────────── textures ─────────────

  private mvTexture(key: string, name: string): string | null {
    if (this.scene.textures.exists(key)) return key;
    const c = mv().frames(name)?.[0];
    if (!c) return null;
    this.scene.textures.addCanvas(key, c);
    return key;
  }

  private image(key: string | null, x: number, y: number, scale: number): void {
    if (key) this.view.add(this.scene.add.image(x, y, key).setOrigin(0).setScale(scale));
  }

  // ───────────── levels ─────────────

  private realmKnown(space: string): boolean {
    if (space === this.src.space() || space === this.src.homeSpace()) return true;
    if (space === 'concordia') return Number(getFlag('story.act') ?? 1) >= 2;
    const school = realmOf(space)?.school;
    return !!school && this.src.found().some((id) => id.includes(`:${school}-`));
  }

  private drawRealms(): void {
    this.image(this.mvTexture('hc-map:realms', 'mvrealm'), MX, MY, 2);
    const here = this.src.space();
    const labels = new MapLabels(this.scene, this.view, { bounds: [MX, MY, MW, MH] });
    const names: (() => void)[] = [];
    for (const r of world().REALMS) {
      const space = r.id === 'concord' ? 'concordia' : `realm:${r.id}`;
      const known = this.realmKnown(space);
      const x = MX + r.x * 2, y = MY + r.y * 2;
      names.push(() => labels.add(x, y + (r.id === 'concord' ? 0 : 26), known ? r.name : '???', known ? C.text : C.text300));
      if (space === here) { this.view.add(this.scene.add.rectangle(x, y - 14, 10, 10, n(C.gold)).setStrokeStyle(2, n(C.ink))); labels.block(x, y - 14, 8); }
    }
    for (const place of names) place();
    const mine = REALMS.find((r) => r.space === here) ?? REALMS.find((r) => r.space === this.src.homeSpace());
    if (mine) this.selectRealm(mine.space);
  }

  private selectRealm(space: string): void {
    this.side.removeAll(true);
    const r = world().REALMS.find((x) => (x.id === 'concord' ? 'concordia' : `realm:${x.id}`) === space);
    if (!r) return;
    const known = this.realmKnown(space);
    this.title(known ? r.name : 'Undiscovered', known ? r.sub : 'Rumours only');
    this.para(known ? r.desc : 'No one you trust has been there. Find its gate to learn more.', 72);
    if (known) this.button(space === 'concordia' ? 'Open Morvane' : 'Open realm map', () => this.go({ kind: 'space', space }), MH - 72);
  }

  private drawMorvane(): void {
    this.image(this.mvTexture('hc-map:morvane', 'mvmap'), MX, MY, 2);
    const found = this.src.found().filter((id) => id.startsWith('region:')).map(bare);
    this.image(this.mvTexture(`hc-map:fog:${[...found].sort().join(',')}`, `mvfog:${found.join(',')}`), MX, MY, 2);
    // Morvane map px = tile / 4, shown at 2×
    this.toScreen = (tx, ty) => [MX + (tx / 4) * 2, MY + (ty / 4) * 2];
    this.drawMarkers('concordia');
    const here = this.src.space() === 'concordia' ? morvaneRegionAt(this.src.player().x / TILE / 4, this.src.player().y / TILE / 4) : null;
    this.selectRegion(here?.id ?? 'region:alder');
  }

  private selectRegion(id: string): void {
    this.side.removeAll(true);
    const r = MORVANE_REGIONS.find((x) => x.id === id);
    if (!r) return;
    const known = this.src.found().includes(id) || (this.src.space() === 'concordia' && id === 'region:alder');
    // the band this hero will really meet there now (campaign-order bands), else the handoff's
    const band = regionBandNow(id);
    this.title(known ? r.name : 'Unexplored', band ? `Levels ${band[0]}–${band[1]}` : `Levels ${r.levels}`);
    this.para(known ? r.desc : 'Fog lies over this land. Walk it to fill the map.', 72);
    let y = 200;
    if (known) {
      for (const v of MORVANE_VILLAGES.filter((x) => x.region === id)) { this.button(`View ${v.name}`, () => this.go({ kind: 'village', space: 'concordia', id: v.id }), y, 'secondary'); y += 48; }
    }
    y = this.waystoneButtons('concordia', (w) => w.id.startsWith('ws:') && this.regionOfWaystone(w) === id, y);
  }

  private regionOfWaystone(w: MapMarker): string | undefined {
    return morvaneRegionAt(w.at[0] / 4, w.at[1] / 4)?.id;
  }

  /** A realm's or instance's generated overview, fitted to the map frame (nearest-filtered for floor plans). */
  private overview(space: string, nearest: boolean): { ox: number; oy: number; scale: number } {
    const ov = realmOverview(space);
    const key = `hc-map:ov:${space}`;
    if (!this.scene.textures.exists(key)) {
      const c = document.createElement('canvas');
      c.width = ov.w; c.height = ov.h;
      c.getContext('2d')!.putImageData(new ImageData(ov.rgba.slice(), ov.w, ov.h), 0, 0);
      this.scene.textures.addCanvas(key, c);
      if (nearest) this.scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    const scale = Math.min(MW / ov.w, MH / ov.h);
    const ox = MX + (MW - ov.w * scale) / 2, oy = MY + (MH - ov.h * scale) / 2;
    this.image(key, ox, oy, scale);
    this.ov = { ox, oy, scale, w: ov.w, h: ov.h, road: ov.road };
    return { ox, oy, scale };
  }

  private drawRealm(space: string): void {
    const { ox, oy, scale } = this.overview(space, false);
    this.toScreen = (tx, ty) => [ox + (tx / REALM_OVERVIEW_STEP) * scale, oy + (ty / REALM_OVERVIEW_STEP) * scale];
    this.drawMarkers(space);
    const r = realmOf(space)!;
    this.side.removeAll(true);
    this.title(r.name, `Capital: ${r.capital}`);
    this.para(r.desc, 72);
    this.waystoneButtons(space, () => true, 220);
  }

  /** A lair or cave: its floor plan, the way out, the boss arena, chests and finds, and you. */
  private drawInstance(space: string): void {
    const { ox, oy, scale } = this.overview(space, true);
    this.toScreen = (tx, ty) => [ox + (tx + 0.5) * scale, oy + (ty + 0.5) * scale];
    this.drawMarkers(space);
    const d = instanceDef(space);
    const ms = mapMarkers(space);
    this.side.removeAll(true);
    this.title(capFirst(placeName(space, space).name), placeName(space, space).subtitle);
    let y = 72;
    if (d?.theme) { this.para(d.theme[0].toUpperCase() + d.theme.slice(1) + '.', y); y += 56; }
    const n = (k: MapMarker['kind']) => ms.filter((m) => m.kind === k).length;
    this.para(`${d?.boss ? 'A guarded arena at the far end. ' : ''}${n('chest')} chests · ${n('find')} things to read or search.`, y);
  }

  private drawVillage(space: string, id: string): void {
    const mvId = space === 'concordia' ? bare(id) : `cap_${bare(space)}`;
    const v = world().VIL.find((x) => x.id === mvId);
    const key = v ? this.mvTexture(`hc-map:vil:${mvId}`, `mvvil:${mvId}`) : null;
    const ox = MX + (MW - 768) / 2, oy = MY + (MH - 448) / 2;
    this.image(key, ox, oy, 1);
    this.side.removeAll(true);
    this.title(this.villageName(space, id), space === 'concordia' ? 'Village' : 'Capital');
    if (!v || !key) { this.para('The mapmakers never came this far in.', 72); return; }
    let y = 64;
    for (const p of world().vilLayout(v)) {
      const pill = text(this.scene, ox + p.x + p.w / 2, oy + p.y + p.h + 4, `${p.npc ? '◆ ' : ''}${capFirst(p.label)}`, 'caption', p.npc ? C.gold : C.text).setOrigin(0.5, 0);
      this.view.add([this.scene.add.rectangle(pill.x, pill.y + pill.height / 2, pill.width + 12, pill.height + 4, n(C.bg), 0.85), pill]);
      if (y < MH - 40) { this.side.add(text(this.scene, 0, y, `${capFirst(p.label)} · ${p.svc}`, 'caption', p.npc ? C.gold : C.text300, PW - 32)); y += 26; }
    }
    // the merchants and quest marks standing in this village, where they stand in the world
    const vv = villageView(space, id, ox, oy);
    if (vv) { drawMerchants(this.scene, this.view, space, vv.toScreen, vv.inside); drawQuestMarks(this.scene, this.view, (this.src.quests?.() ?? []).filter((m) => vv.inside(m.x / TILE, m.y / TILE)), space, vv.toScreen, this.focus); }
  }

  private villageName(space: string, id: string): string {
    if (space === 'concordia') return MORVANE_VILLAGES.find((v) => v.id === id)?.name ?? id;
    return realmOf(space)?.capital ?? id;
  }

  // ───────────── markers, panel helpers ─────────────

  private drawMarkers(space: string): void {
    if (!this.toScreen) return;
    this.markers = mapMarkers(space);
    const woken = new Set(this.src.woken());
    const g = this.scene.add.graphics();
    this.view.add(g);
    const found = new Set(this.src.found());
    // Morvane: nothing shows through the fog except waystones you have woken
    const hidden = (m: MapMarker) => space === 'concordia' && !woken.has(m.id)
      && !found.has(morvaneRegionAt(m.at[0] / 4, m.at[1] / 4)?.id ?? '');
    this.markers = this.markers.filter((m) => !hidden(m));
    const ov = this.ov;
    const labels = new MapLabels(this.scene, this.view, {
      bounds: [MX, MY, MW, MH],
      road: ov ? (x, y) => { const px = Math.floor((x - ov.ox) / ov.scale), py = Math.floor((y - ov.oy) / ov.scale); return px >= 0 && py >= 0 && px < ov.w && py < ov.h && ov.road[py * ov.w + px] === 1; } : undefined,
    });
    const names: (() => void)[] = [];
    for (const m of this.markers) {
      const [x, y] = this.toScreen(m.at[0], m.at[1]);
      if (m.kind !== 'zone') labels.block(x, y);
      if (drawMarkerGlyph(g, m.kind, x, y, woken.has(m.id) || !!m.startsLit)) continue;
      if (m.kind === 'zone' && space !== 'concordia') names.push(() => labels.add(x, y, m.name));
      else if (m.kind === 'optional') {
        // optional areas: named once walked into, a question mark once a lookout has shown them, else nothing
        const seen = found.has(m.id);
        if (!seen && !found.has(`hint:${m.id}`)) continue;
        drawOptionalGlyph(g, x, y, seen);
        names.push(() => labels.add(x, y, seen ? m.name : '?', seen ? C.text : C.text500, true));
      }
    }
    // merchants, then quest objectives on this level (labels keep off both); the player's dot stays on top
    for (const [x, y] of drawMerchants(this.scene, this.view, space, this.toScreen)) labels.block(x, y, 8);
    for (const q of drawQuestMarks(this.scene, this.view, this.src.quests?.() ?? [], space, this.toScreen, this.focus)) labels.block(q.x, q.y, 9);
    if (this.src.space() === space) {
      const p = this.src.player();
      const [x, y] = this.toScreen(p.x / TILE, p.y / TILE);
      g.fillStyle(n(C.ink), 1).fillCircle(x, y, 7);
      g.fillStyle(n(C.gold), 1).fillCircle(x, y, 5);
      labels.block(x, y, 10);
    }
    for (const place of names) place();
  }

  private waystoneButtons(space: string, filter: (w: MapMarker) => boolean, y: number): number {
    const woken = new Set(this.src.woken());
    for (const w of mapMarkers(space).filter((m) => m.kind === 'waystone' && filter(m))) {
      if (y > MH - 40) break;
      const lit = woken.has(w.id) || !!w.startsLit;
      this.button(lit ? `Travel · ${capFirst(w.name)}` : `${capFirst(w.name)} (asleep)`, () => { this.src.travel(w.id); }, y, 'primary', !lit);
      y += 48;
    }
    return y;
  }

  private title(name: string, sub: string): void {
    this.side.add(text(this.scene, 0, 0, capFirst(name), 'h2', C.text, PW - 32));
    this.side.add(text(this.scene, 0, 36, capFirst(sub), 'caption', C.gold, PW - 32));
  }

  private para(s: string, y: number): void {
    this.side.add(text(this.scene, 0, y, s, 'body', C.text300, PW - 32));
  }

  private button(label: string, onClick: () => void, y: number, variant: 'primary' | 'secondary' = 'primary', disabled = false): void {
    const b = new HCButton(this.scene, (PW - 32) / 2, y + 20, label, onClick, { w: PW - 32, h: 40, variant, disabled });
    this.side.add(b);
  }

  // ───────────── input ─────────────

  private click(x: number, y: number): void {
    const L = this.level;
    if (L.kind === 'realms') {
      let best: MvRealm | null = null, bd = 48;
      for (const r of world().REALMS) { const d = Math.hypot(r.x * 2 - x, r.y * 2 - y); if (d < bd) { bd = d; best = r; } }
      if (best) this.selectRealm(best.id === 'concord' ? 'concordia' : `realm:${best.id}`);
      return;
    }
    if (L.kind !== 'space' || !this.toScreen) return;
    const near = this.markers.find((m) => { const [sx, sy] = this.toScreen!(m.at[0], m.at[1]); return Math.hypot(sx - MX - x, sy - MY - y) < 12; });
    if (near?.kind === 'village') { this.go({ kind: 'village', space: L.space, id: near.id }); return; }
    if (L.space === 'concordia') {
      const r = morvaneRegionAt(x / 2, y / 2);
      if (r) this.selectRegion(r.id);
    } else if (near?.kind === 'zone') {
      const z = zoneInfo(L.space, near.id);
      if (!z) return;
      this.side.removeAll(true);
      this.title(z.name, z.area);
      this.para(z.theme, 72);
    }
  }

  destroy(): void { for (const off of this.offs.splice(0)) off(); this.scene.tweens.killTweensOf(this.view.list); this.root.destroy(); }
}
