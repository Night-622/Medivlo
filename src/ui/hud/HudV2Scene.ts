import Phaser from 'phaser';
import { classDisplay } from '@/data/classes/hc';
import { dialogueClient } from '@/narrative/client/dialogueClient';
import { itemName } from '@/narrative/client/itemNames';
import { ChatBox } from './ChatBox';
import { isAction } from '@/ui/kit/hc/keys';
import { DuelUi } from './DuelUi';
import { leaveCoop } from '@/net/coop';
import { Game, SceneKeys, Services, bus, Settings, type Action, formatKeys, Registry, keyLabel } from '@/core';
import type { EntityState, Snapshot } from '@/net';
import { Art } from '@/art';
import { C, HCBar, T, typeStyle } from '@/ui/kit/hc';
import { SaveService } from '@/firebase/SaveService';
import { heroSprite, heroTexture, defaultOutfit } from '@/scenes/create/heroChoice';
import { installHudProbe, type HudParts } from './hudProbe';

/**
 * The Hollow Crown HUD (handoff › In-game HUD). Owner: Claude 1. Launched by the v2 World scene.
 * Reads the LOCAL player's replicated entity (kind 'player', owner = net.localPlayer):
 *   hp, maxHp, data.em/emMax (Ember), data.st/stMax (stamina), data.lvl, data.xp/xpMax.
 * Centre safe rect {320,140,640,420} stays clear. Plug-in anchors for other owners:
 *   anchors.topRight    minimap frame, top-right corner (W-16, 16)            Claude 2
 *   anchors.rightColumn quest tracker, top-left at (W-16-260, 192), 260 wide   Claude 4
 *   anchors.topLeft     buffs/debuffs under the player frame (16, 112)        Claude 3
 *   anchors.bottom      hotbar, bottom-centre (W/2, H-40)                      Claude 3
 */
export class HudV2Scene extends Phaser.Scene {
  anchors!: Record<'topLeft' | 'topRight' | 'rightColumn' | 'bottom', Phaser.GameObjects.Container>;
  private hp!: HCBar;
  private em!: HCBar;
  private st!: HCBar;
  private xp!: HCBar;
  private hpT!: Phaser.GameObjects.Text;
  private emT!: Phaser.GameObjects.Text;
  private lvlT!: Phaser.GameObjects.Text;
  private nameT!: Phaser.GameObjects.Text;
  private toastY = 300;
  chat!: ChatBox;
  private panelOpen = false;
  private feed: Phaser.GameObjects.Container[] = [];
  private menuButtons: HudParts['buttons'] = [];

  constructor() { super(SceneKeys.HudV2); }

  create(): void {
    const { width: W, height: H } = this.scale;
    this.anchors = {
      topLeft: this.add.container(16, 112),
      topRight: this.add.container(W - 16, 16),
      rightColumn: this.add.container(W - 16 - 260, 192),
      bottom: this.add.container(W / 2, H - 40),
    };
    this.buildPlayerFrame();
    this.xp = new HCBar(this, (W - T.component.barXp.width) / 2, H - 12 - T.component.barXp.height, 'xp');
    this.buildMenuButtons();
    if (Settings.get().showHints) this.showControlsHint();

    const net = Services.get('net');
    const off = net.addConsumer({ kinds: ['player'], apply: (ents, _removed, snap) => this.applyPlayer(ents, snap) });
    this.events.once('shutdown', off);

    bus.onScene(this, 'region:entered', (e) => { if (!e.playerId || e.playerId === net.localPlayer) this.banner(e.name ?? e.regionId, e.subtitle); });
    bus.onScene(this, 'narrative:toast', ({ text, kind }) => this.toast(text, kind === 'trust' ? C.teal : kind === 'quest' ? C.gold : C.text));
    this.chat = new ChatBox(this);
    new DuelUi(this, (t, s) => this.banner(t, s));
    // People of <village> (handoff NPCs screen): rebindable key (Settings 'people', default P) or ui:open {panel:'people'}
    const openPeople = () => {
      // status, not isActive(): People emits ui:open from its own create(), while it isn't 'active' yet
      const st = this.scene.get(SceneKeys.People).sys.settings.status;
      if (st >= Phaser.Scenes.START && st <= Phaser.Scenes.PAUSED) return;
      if (!this.scene.isActive(SceneKeys.Pause)) this.scene.launch(SceneKeys.People);
    };
    this.input.keyboard!.on('keydown', (ev: KeyboardEvent) => { if (isAction(ev, 'people') && !(ev.target instanceof HTMLInputElement)) openPeople(); });
    bus.onScene(this, 'ui:open', ({ panel }) => { if (panel === 'people') openPeople(); });
    bus.onScene(this, 'net:kicked', ({ reason }) => {
      leaveCoop();
      for (const k of [SceneKeys.Pause, SceneKeys.Death, SceneKeys.WorldV2, SceneKeys.World]) if (this.scene.isActive(k) || this.scene.isPaused(k)) this.scene.stop(k);
      this.scene.start(SceneKeys.MainMenu, { notice: reason });
    });
    // escorts: tell the party when the NPC falls (revive with the interact key) or is lost
    const escortName = (npc?: string, creature?: string) => (npc ? (Registry.tryGet('npc', npc) as { name?: string } | undefined)?.name : undefined) ?? (creature ? creature.replace(/^bx_/, '').replace(/_/g, ' ') : 'Your companion');
    bus.onScene(this, 'escort:downed', ({ npc }) => this.toast(`${escortName(npc)} is down! Hold ${keyLabel('interact')} beside them to revive`, C.danger));
    bus.onScene(this, 'escort:lost', ({ npc, creature, reason }) => { if (reason === 'died') this.toast(`${escortName(npc, creature)} has fallen`, C.danger); });
    bus.onScene(this, 'escort:arrived', ({ npc, creature }) => this.toast(`${escortName(npc, creature)} is safe`, C.good));
    bus.onScene(this, 'systems:notice', ({ playerId, text, kind }) => { if (playerId === net.localPlayer) this.toast(text, kind === 'error' ? C.danger : C.text); });
    bus.onScene(this, 'loot:granted', (e) => { if (e.playerId === net.localPlayer) this.lootFeed(e); });
    // manual saves toast; autosaves show a small mark bottom-left of the minimap for a moment
    bus.onScene(this, 'game:saved', ({ cloud, auto }) => {
      if (!auto) { this.toast(cloud ? 'Saved to the cloud' : 'Saved', C.text300); return; }
      const t = this.add.text(this.scale.width - 16, 176, 'Saving…', typeStyle('caption', C.text500)).setOrigin(1, 0);
      this.time.delayedCall(1400, () => t.destroy());
    });
    this.input.keyboard!.on('keydown-F5', () => void SaveService.save());
    // The bound Pause key (and Esc, the universal back key) pauses, unless a conversation or panel owns the key.
    this.input.keyboard!.on('keydown', (ev: KeyboardEvent) => {
      if (!(ev.key === 'Escape' || isAction(ev, 'pause')) || ev.target instanceof HTMLInputElement) return;
      if (dialogueClient.active || this.panelOpen) return;
      if (!this.scene.isActive(SceneKeys.Pause) && !this.scene.isActive(SceneKeys.Death)) this.scene.launch(SceneKeys.Pause);
    });
    // Team rule: an open panel closes itself on Esc, so Esc never pauses while any panel is up.
    // FADES: panels in their own scenes, so the HUD fades under them (map + Claude 3's panels draw inside this scene).
    const SELF_ESC = new Set(['journal', 'codex', 'book', 'people', 'inventory', 'skills', 'spells', 'map', 'shop']);
    const FADES = new Set(['journal', 'codex', 'book', 'people']);
    let fading = 0;
    // Dialogue and the full-screen panels that live in other scenes are their own screens in the handoff: the HUD
    // fades out under them (the map and Claude 3's panels draw inside this scene, so they don't fade it).
    let dlgOpen = false;
    const fade = () => this.tweens.add({ targets: this.cameras.main, alpha: dlgOpen || fading > 0 ? 0 : 1, duration: 180 });
    const open = new Set<string>();
    bus.onScene(this, 'ui:open', ({ panel }) => { if (!SELF_ESC.has(panel)) return; open.add(panel); this.panelOpen = true; if (FADES.has(panel)) { fading++; fade(); } });
    bus.onScene(this, 'ui:close', ({ panel }) => {
      if (!open.delete(panel)) return;
      if (FADES.has(panel)) { fading = Math.max(0, fading - 1); fade(); }
      this.time.delayedCall(0, () => { this.panelOpen = open.size > 0; });
    });
    const offDlg = dialogueClient.subscribe((v) => { dlgOpen = !!v; fade(); });
    dlgOpen = dialogueClient.active; // a conversation may already be open when the HUD starts
    if (dlgOpen) fade();
    this.events.once('shutdown', offDlg);
    bus.onScene(this, 'player:died', (e) => { if (!e.playerId || e.playerId === net.localPlayer) this.scene.launch(SceneKeys.Death, { killer: e.killer, killerName: e.killerName }); });
    bus.onScene(this, 'party:wiped', ({ waystone }) => { if (!this.scene.isActive(SceneKeys.Death)) this.scene.launch(SceneKeys.Death, { waystone }); });
    if (import.meta.env.DEV) installHudProbe(this, () => ({
      bars: { hp: this.hp, em: this.em, st: this.st, xp: this.xp },
      texts: { name: this.nameT, lvl: this.lvlT, hp: this.hpT, em: this.emT },
      anchors: this.anchors, buttons: this.menuButtons, panelOpen: this.panelOpen, party: this.partyLayer,
    }));
  }

  update(_t: number, dt: number): void { this.hp.tick(dt); }

  private buildPlayerFrame(): void {
    this.add.nineslice(16, 16, 'ui:panel', undefined, 80, 80, 8, 8, 8, 8).setOrigin(0);
    this.add.rectangle(24, 24, 64, 64, parseInt(C.panel600.slice(1), 16)).setOrigin(0);
    const hero = Game.hasState ? Game.state.player.hero : undefined;
    if (hero) {
      const tex = heroTexture(this, heroSprite(hero.classId, hero.look, hero.outfit ?? defaultOutfit()));
      if (tex) {
        const img = this.add.image(56, 24 + 2, tex).setOrigin(0.5, 0).setScale(2);
        img.setMask(this.make.graphics({}, false).fillRect(24, 24, 64, 64).createGeometryMask());
      }
    }
    this.add.nineslice(66, 66, 'ui:btn_gold', undefined, 30, 30, 8, 8, 8, 8).setOrigin(0);
    this.lvlT = this.add.text(81, 81, '1', typeStyle('h3', C.ink)).setOrigin(0.5);
    this.nameT = this.add.text(108, 14, Game.hasState ? Game.state.player.name : '', { ...typeStyle('h2', C.text), shadow: { offsetX: 2, offsetY: 2, color: C.ink, fill: true } });
    // long names (up to 16 chars) must not run into the class label: shrink, then ellipsize, within the plate (108…370)
    const fitW = (t: Phaser.GameObjects.Text, max: number) => {
      while (t.width > max && parseInt(String(t.style.fontSize), 10) > 18) t.setFontSize(parseInt(String(t.style.fontSize), 10) - 2);
      let s = t.text;
      while (t.width > max && s.length > 3) { s = s.slice(0, -1); t.setText(`${s}…`); }
    };
    fitW(this.nameT, 170);
    if (hero) {
      const cls = this.add.text(this.nameT.x + this.nameT.width + 8, 22, classDisplay(hero.classId)?.name ?? hero.classId, typeStyle('body', C.text300));
      fitW(cls, 370 - cls.x);
    }
    this.hp = new HCBar(this, 108, 48, 'hp');
    this.hpT = this.add.text(108 + 260 - 6, 58, '', typeStyle('caption', C.text)).setOrigin(1, 0.5);
    this.em = new HCBar(this, 108, 74, 'ember');
    this.emT = this.add.text(108 + 260 - 6, 81, '', typeStyle('badge', C.text)).setOrigin(1, 0.5);
    this.st = new HCBar(this, 108, 94, 'stamina');
  }

  /**
   * Party frames (co-op only): one compact frame per teammate under the buff row: name in the class colour, level,
   * HP bar, and DOWNED with the revive progress. Public-realm strangers are not shown.
   */
  private partyLayer?: Phaser.GameObjects.Container;
  private partyKey = '';
  private drawParty(others: EntityState[]): void {
    const net = Services.get('net');
    const s = net.session();
    if (s.kind !== 'coop') { if (this.partyLayer) { this.partyLayer.destroy(); this.partyLayer = undefined; } return; }
    const members = new Map(s.members.map((m) => [m.playerId, m]));
    const mates = others.filter((e) => members.has(e.owner!)).slice(0, 3);
    const key = mates.map((e) => `${e.owner}:${Math.ceil(e.hp ?? 0)}/${e.maxHp}:${e.data?.down ?? 0}:${e.data?.rv ?? 0}`).join('|');
    if (key === this.partyKey) return;
    this.partyKey = key;
    this.partyLayer?.destroy();
    const L = (this.partyLayer = this.add.container(16, 196));
    mates.forEach((e, i) => {
      const m = members.get(e.owner!)!;
      const y = i * 44;
      const cls = classDisplay(m.classId);
      L.add(this.add.rectangle(0, y, 210, 38, 0x0d1226, 0.72).setOrigin(0).setStrokeStyle(2, 0x1a1230, 0.9));
      L.add(this.add.text(8, y + 4, m.name, { ...typeStyle('body', cls?.color ?? C.text), fontStyle: '700' }));
      L.add(this.add.text(202, y + 5, `Lv ${typeof e.data?.lvl === 'number' ? e.data.lvl : m.level}`, typeStyle('caption', C.text300)).setOrigin(1, 0));
      const frac = Math.max(0, Math.min(1, (e.hp ?? 0) / Math.max(1, e.maxHp ?? 1)));
      L.add(this.add.rectangle(8, y + 24, 194, 8, 0x0b0f22).setOrigin(0).setStrokeStyle(2, 0x1a1230));
      const down = typeof e.data?.down === 'number' && e.data.down > 0;
      L.add(this.add.rectangle(8, y + 24, 194 * frac, 8, down ? 0x7a2a3a : 0xff3d5a).setOrigin(0));
      if (down) {
        // down = ms left before they fall for good; rv = revive progress in ms of a 3 s hold (Claude 3, sim/coop.ts)
        const rv = typeof e.data?.rv === 'number' ? e.data.rv : 0;
        const left = Math.ceil((e.data!.down as number) / 1000);
        L.add(this.add.text(105, y + 4, rv ? `REVIVING ${Math.min(100, Math.round(rv / 30))}%` : `DOWNED · ${left}s`, { ...typeStyle('badge', rv ? C.good : C.danger), fontStyle: '700' }).setOrigin(0.5, 0));
      }
    });
  }

  private applyPlayer(ents: EntityState[], _snap: Snapshot): void {
    const me = Services.get('net').localPlayer;
    this.drawParty(ents.filter((e) => e.kind === 'player' && e.owner && e.owner !== me));
    const p = ents.find((e) => e.owner === me) ?? (ents.length === 1 ? ents[0] : undefined);
    if (!p) return;
    const d = p.data ?? {};
    const num = (k: string, def: number) => (typeof d[k] === 'number' ? (d[k] as number) : def);
    const hp = p.hp ?? 0, maxHp = p.maxHp ?? 1;
    this.hp.set(hp, maxHp);
    this.hpT.setText(`${Math.ceil(hp)} / ${Math.round(maxHp)}`);
    const em = num('em', 0), emMax = num('emMax', 1);
    this.em.set(em, emMax);
    this.emT.setText(`${Math.round(em)} / ${Math.round(emMax)}`);
    this.st.set(num('st', 0), num('stMax', 1));
    this.xp.set(num('xp', 0), num('xpMax', 1));
    this.lvlT.setText(String(num('lvl', 1)));
  }

  /**
   * Menu buttons, bottom-right (handoff › HUD › menu buttons): 44×44 slate buttons showing the bound key (Jersey 26),
   * label underneath (11px). Keys come from Settings, so rebinding updates them. Click → ui:open.
   */
  private buildMenuButtons(): void {
    const { width: W, height: H } = this.scale;
    const btns: [string, Action, string][] = [['inventory', 'inventory', 'Pack'], ['skills', 'skills', 'Skills'], ['spells', 'spells', 'Spells'], ['journal', 'journal', 'Journal'], ['map', 'map', 'Map']];
    const keyLabel = (a: Action) => { const k = Settings.key(a); return k.length === 1 ? k : k.slice(0, 3); };
    const layer = this.add.container(0, 0);
    const draw = () => {
      layer.removeAll(true);
      this.menuButtons = [];
      btns.forEach(([panel, action, label], i) => {
        const x = W - 16 - (btns.length - i) * 50 + 6, y = H - 24 - 16 - 44;
        const bg = this.add.nineslice(x, y, 'ui:btn_slate', undefined, 44, 44, 8, 8, 8, 8).setOrigin(0);
        const key = this.add.text(x + 22, y + 22, keyLabel(action), { fontFamily: '"Jersey 10"', fontSize: '26px', color: C.text }).setOrigin(0.5);
        const lab = this.add.text(x + 22, y + 46, label, { ...typeStyle('badge', C.text300), fontStyle: '700', stroke: C.ink, strokeThickness: 2 }).setOrigin(0.5, 0);
        bg.setInteractive({ useHandCursor: true }).on('pointerup', () => bus.emit('ui:open', { panel }))
          .on('pointerover', () => bg.setTexture('ui:btn_slate_hover')).on('pointerout', () => bg.setTexture('ui:btn_slate'));
        layer.add([bg, key, lab]);
        this.menuButtons.push({ panel, key: key.text, label, bg });
      });
    };
    draw();
    bus.onScene(this, 'settings:changed', ({ key }) => { if (key === 'keys' || key === 'all') draw(); });
  }

  private showControlsHint(): void {
    const line = formatKeys('{key:move} move · click / {key:cast1}–{key:cast4} cast · {key:dash} dash · {key:potionQ}/{key:potionE} potions · {key:inventory} pack');
    const t = this.add.text(this.scale.width / 2, 16, line, {
      ...typeStyle('caption', C.text300), backgroundColor: '#0d1226', padding: { x: 12, y: 6 },
    }).setOrigin(0.5, 0);
    this.time.delayedCall(9000, () => this.tweens.add({ targets: t, alpha: 0, duration: 600, onComplete: () => t.destroy() }));
  }

  /** Region banner, top centre (56px Jersey + gold subline), fades after the handoff banner life. */
  private bannerBusy = false;
  private bannerQueue: [string, string | undefined][] = [];
  /** Banners queue (one at a time; same title twice is dropped), so arrivals don't draw over each other. */
  banner(title: string, sub?: string): void {
    if (this.bannerBusy) {
      if (!this.bannerQueue.some(([t]) => t === title)) this.bannerQueue.push([title, sub]);
      this.bannerQueue = this.bannerQueue.slice(-2);
      return;
    }
    this.bannerBusy = true;
    const W = this.scale.width;
    const big = this.add.text(W / 2, 64, title.replace(/^[a-z]+:/, '').replace(/[-_]/g, ' ').toUpperCase(), {
      ...typeStyle('displayL', C.text), stroke: C.ink, strokeThickness: 6,
    }).setOrigin(0.5, 0);
    const parts: Phaser.GameObjects.Text[] = [big];
    if (sub) parts.push(this.add.text(W / 2, 116, sub, { ...typeStyle('h2', C.gold), shadow: { offsetX: 2, offsetY: 2, color: C.ink, fill: true } }).setOrigin(0.5, 0));
    this.time.delayedCall(T.motion.bannerLifeMs, () => this.tweens.add({ targets: parts, alpha: 0, duration: 800, onComplete: () => {
      parts.forEach((p) => p.destroy());
      this.bannerBusy = false;
      const next = this.bannerQueue.shift();
      if (next) this.banner(next[0], next[1]);
    } }));
  }

  /** Toast at the right edge (x −16, y 300+), panel_gold, stacked; lasts motion.toastLifeMs. */
  toast(text: string, color: string = C.text): void {
    const W = this.scale.width;
    const label = this.add.text(0, 0, text, typeStyle('body', color)).setOrigin(1, 0.5);
    const w = Math.max(200, Math.ceil(label.width) + 32);
    const y = this.toastY;
    const c = this.add.container(W - 16, y, [this.add.nineslice(-w, -20, 'ui:panel_gold', undefined, w, 40, 8, 8, 8, 8).setOrigin(0), label.setPosition(-16, 0)]);
    this.toastY += 48;
    this.time.delayedCall(T.motion.toastLifeMs, () => { c.destroy(); this.toastY = Math.max(300, this.toastY - 48); });
  }

  /** Loot feed, bottom-left, newest at the bottom (max 5). */
  private lootFeed(e: { item?: string; qty?: number; gold?: number; xp?: number }): void {
    const H = this.scale.height;
    // real item names; negative gold is a loss (purchase, runeforge fee, wipe) and reads "− 57" in red
    const loss = !e.item && (e.gold ?? 0) < 0;
    const name = e.item ? itemName(e.item) : e.gold ? `${Math.abs(e.gold)} Embershards` : e.xp ? `${e.xp} XP` : '';
    if (!name) return;
    const c = this.add.container(16, 0);
    c.add(this.add.rectangle(0, 0, 300, 40, parseInt(C.bg.slice(1), 16), 0.72).setOrigin(0));
    const f = e.item ? Art.tryFrame(e.item) : Art.tryFrame('icon_coin');
    c.add(this.add.nineslice(2, 2, 'ui:slot_common', undefined, 36, 36, 8, 8, 8, 8).setOrigin(0));
    if (f) c.add(this.add.image(20, 20, f.key, f.frame));
    c.add(this.add.text(46, 20, `${loss ? '−' : '+'} ${name}${e.qty && e.qty > 1 ? ` ×${e.qty}` : ''}`, typeStyle('body', loss ? C.danger : C.text)).setOrigin(0, 0.5));
    this.feed.unshift(c);
    while (this.feed.length > 5) this.feed.pop()!.destroy();
    this.feed.forEach((row, i) => row.setY(H - 24 - 40 - i * 44));
    this.time.delayedCall(6000, () => { this.feed = this.feed.filter((r) => r !== c); c.destroy(); });
  }
}
