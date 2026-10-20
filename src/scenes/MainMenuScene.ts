import Phaser from 'phaser';
import { worldKey } from '@/scenes/worldKey';
import { Game, SceneKeys, bus } from '@/core';
import { Art, wordmarkTexture } from '@/art';
import { C, CodeEntry, T, typeStyle } from '@/ui/kit/hc';
import { joinGame } from '@/net/coop';
import { SaveService } from '@/firebase/SaveService';
import { isFirebaseConfigured } from '@/firebase/config';
import { currentAccount, type AccountInfo } from '@/firebase/accounts';
import { startPresence } from '@/firebase/friends';

/**
 * Title / main menu: The Hollow Crown (handoff "Medival Screens" › Title). Owner: Claude 1.
 * Wordmark at integer scale centred at y 44, tagline 30px Jersey with 6px tracking, menu 340 wide at (80, 320),
 * items 52 tall (64 with a subline), 6px gap; selected item is gold with ▶, others slate. ↑↓ + Enter or mouse.
 */
export class MainMenuScene extends Phaser.Scene {
  private items: { bg: Phaser.GameObjects.NineSlice; label: Phaser.GameObjects.Text; sub?: Phaser.GameObjects.Text; arrow: Phaser.GameObjects.Text; act: () => void; enabled: boolean }[] = [];
  private sel = 0;

  constructor() { super(SceneKeys.MainMenu); }

  private notice: string | null = null;

  /** `notice`: why we came back (e.g. "Disconnected from the host"), shown once. */
  init(data: { notice?: string }): void { this.notice = data?.notice ?? null; }

  create(): void {
    this.items = [];
    this.sel = 0;
    // the scene instance is reused: a successful join leaves without CodeEntry's cancel, which is what cleared this
    this.joinOpen = false;
    this.drawBackdrop();
    this.drawLogo();
    this.buildMenu();
    this.drawFooter();
    this.drawAccountChip();
    if (this.notice) {
      const t = this.add.text(this.scale.width / 2, 286, this.notice, { ...typeStyle('h3', C.gold), backgroundColor: C.bg, padding: { x: 14, y: 6 } }).setOrigin(0.5).setDepth(30);
      this.time.delayedCall(5000, () => t.destroy());
    }
    const kb = this.input.keyboard!;
    kb.on('keydown-UP', () => { if (!this.joinOpen) this.move(-1); });
    kb.on('keydown-DOWN', () => { if (!this.joinOpen) this.move(1); });
    kb.on('keydown-W', () => { if (!this.joinOpen) this.move(-1); });
    kb.on('keydown-S', () => { if (!this.joinOpen) this.move(1); });
    kb.on('keydown-ENTER', () => { if (!this.joinOpen) this.activate(this.sel); });
    kb.on('keydown-SPACE', () => { if (!this.joinOpen) this.activate(this.sel); });
  }

  /** A small Brindlecross diorama from the handoff tiles and buildings, dimmed by the title gradient. */
  private drawBackdrop(): void {
    const { width: W, height: H } = this.scale;
    const put = (name: string, x: number, y: number, ox = 0, oy = 0) => {
      const f = Art.tryFrame(name);
      if (!f) return undefined;
      return this.add.image(x, y, f.key, f.frame).setOrigin(ox, oy);
    };
    for (let ty = 0; ty < H; ty += 32) for (let tx = 0; tx < W; tx += 32) {
      const h = ((tx * 73856093) ^ (ty * 19349663)) >>> 0;
      put(h % 11 === 0 ? 'v_flowers_0' : `v_grass_${h % 3}`, tx, ty);
    }
    for (let tx = 0; tx < W; tx += 32) { put('v_cobble_0', tx, 544); put('v_cobble_1', tx, 576); }
    const buildings: [string, number][] = [['b_house_tall', 180], ['b_inn', 420], ['b_smithy', 700], ['b_teahouse', 930], ['b_house_stone', 1150]];
    for (const [b, x] of buildings) put(b, x, 540, 0.5, 1)?.setDepth(1);
    const props: [string, number, number][] = [['v_well', 560, 610], ['v_lamp', 320, 600], ['v_lamp', 1040, 600], ['v_cart', 820, 640]];
    for (const [p, x, y] of props) put(p, x, y, 0.5, 1)?.setDepth(2);
    // handoff gradient: rgba(13,18,38) .86 → .35 (34%) → 0 (55%) → .55 (100%)
    const g = this.add.graphics().setDepth(10);
    const bg = parseInt(C.bg.slice(1), 16);
    const stops: [number, number][] = [[0, 0.86], [0.34, 0.35], [0.55, 0], [1, 0.55]];
    for (let y = 0; y < H; y += 4) {
      const p = y / H;
      const i = stops.findIndex((s) => s[0] >= p);
      const [p1, a1] = stops[Math.max(0, i - 1)], [p2, a2] = stops[Math.max(0, i)];
      const a = p2 === p1 ? a2 : a1 + ((p - p1) / (p2 - p1)) * (a2 - a1);
      g.fillStyle(bg, a).fillRect(0, y, W, 4);
    }
  }

  private drawLogo(): void {
    const key = wordmarkTexture(this, 'wordmark', 'THE HOLLOW CROWN');
    const src = this.textures.get(key).getSourceImage() as HTMLCanvasElement;
    const scale = src.width * 4 <= 1200 ? 4 : src.width * 3 <= 1200 ? 3 : 2;
    const logo = this.add.image(this.scale.width / 2, 44, key).setOrigin(0.5, 0).setScale(scale).setDepth(20);
    this.add.text(this.scale.width / 2, logo.y + src.height * scale + 2, 'CHRONICLES OF MORVANE', {
      fontFamily: '"Jersey 10"', fontSize: '30px', color: C.text300, letterSpacing: 6,
    } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(0.5, 0).setDepth(20);
  }

  private buildMenu(): void {
    const saves = SaveService.listLocal();
    const latest = saves.filter((s) => s !== null).sort((a, b) => b!.updatedAt - a!.updatedAt)[0] ?? null;
    const def: [string, string | null, () => void, boolean][] = [
      ['Continue', latest ? `${latest.name} · Lv ${latest.level}` : null, () => latest && this.loadSlot(latest.slot), !!latest],
      ['New Game', null, () => void this.newGame(), true],
      ['Join Game', 'Game code or a friend\'s friend code', () => this.openJoin(), true],
      ['Public Realms', null, () => { this.scene.launch(SceneKeys.Realms); this.scene.pause(); }, true],
      ['Load Game', null, () => { this.scene.launch(SceneKeys.Load, { from: SceneKeys.MainMenu }); this.scene.pause(); }, saves.some((x) => x !== null) || SaveService.cloudEnabled],
      ['Settings', null, () => { this.scene.launch(SceneKeys.Settings, { from: SceneKeys.MainMenu }); this.scene.pause(); }, true],
    ];
    const { width: w, gap } = T.component.menuItem;
    let y = 320;
    def.forEach(([title, sub, act, enabled], i) => {
      const h = sub ? T.component.menuItem.heightWithSub : T.component.menuItem.height;
      const bg = this.add.nineslice(80, y, 'ui:btn_slate', undefined, w, h, 8, 8, 8, 8).setOrigin(0).setDepth(20);
      const arrow = this.add.text(84, y + h / 2, '▶', { fontFamily: '"Jersey 10"', fontSize: '24px', color: C.ink }).setOrigin(0, 0.5).setDepth(21);
      const labelY = sub ? y + 8 : y + h / 2;
      const label = this.add.text(80 + 40, labelY, title, typeStyle('h2', C.text)).setOrigin(0, sub ? 0 : 0.5).setDepth(21);
      const subT = sub ? this.add.text(80 + 40, y + 38, sub, typeStyle('caption', C.text300)).setDepth(21) : undefined;
      bg.setInteractive({ useHandCursor: enabled })
        .on('pointerover', () => { this.sel = i; this.paint(); })
        .on('pointerup', () => this.activate(i));
      this.items.push({ bg, label, sub: subT, arrow, act, enabled });
      y += h + gap;
    });
    this.sel = latest ? 0 : 1;
    this.paint();
  }

  private drawFooter(): void {
    const H = this.scale.height;
    const ver = this.add.text(24, H - 30, `${__BUILD__} · The Hollow Crown ·`, typeStyle('caption', C.text500)).setDepth(20);
    const credits = this.add.text(ver.x + ver.width + 6, H - 30, 'Credits', typeStyle('caption', C.teal)).setDepth(20).setInteractive({ useHandCursor: true });
    credits.on('pointerup', () => { this.scene.launch(SceneKeys.Credits); this.scene.pause(); });
    const chip = (x: number, key: string, label: string) => {
      const t = this.add.text(x, H - 34, key, { fontFamily: '"Jersey 10"', fontSize: '18px', color: C.text, backgroundColor: C.panel600, padding: { x: 6, y: 2 } }).setDepth(20);
      this.add.text(t.x + t.width + 6, H - 31, label, typeStyle('body', C.text300)).setDepth(20);
    };
    chip(this.scale.width - 230, '↑↓', 'Choose');
    chip(this.scale.width - 130, 'Enter', 'Confirm');
  }

  /** Top-right account chip: "Sign in" or the signed-in name + friend code. Opens AccountScene. */
  private drawAccountChip(): void {
    if (!isFirebaseConfigured) return;
    const W = this.scale.width;
    const bg = this.add.nineslice(W - 24, 24, 'ui:btn_slate', undefined, 240, 52, 8, 8, 8, 8).setOrigin(1, 0).setDepth(20);
    const name = this.add.text(W - 40, 32, 'Account', typeStyle('h3', C.text)).setOrigin(1, 0).setDepth(21);
    const sub = this.add.text(W - 40, 56, '…', typeStyle('caption', C.text300)).setOrigin(1, 0).setDepth(21);
    // Friends sits left of the account chip on the same row (the wordmark owns the band below).
    const fr = this.add.nineslice(W - 24 - 240 - 8, 24, 'ui:btn_slate', undefined, 120, 52, 8, 8, 8, 8).setOrigin(1, 0).setDepth(20);
    const frT = this.add.text(fr.x - 60, 50, 'Friends', typeStyle('h3', C.text)).setOrigin(0.5).setDepth(21);
    fr.setInteractive({ useHandCursor: true }).on('pointerup', () => { this.scene.launch(SceneKeys.Friends, { from: SceneKeys.MainMenu }); this.scene.pause(); });
    const paint = (a: AccountInfo | null) => {
      if (!name.scene) return; // the account lookup can resolve after the title has already closed
      name.setText(a ? a.name : 'Sign in');
      sub.setText(!a ? 'Play online, keep saves in the cloud' : a.kind === 'guest' ? 'Guest: tap to keep progress' : `Friend code ${a.friendCode ?? '…'}`);
      bg.setSize(Math.max(name.width, sub.width) + 36, 52);
      fr.setX(W - 24 - bg.width - 8);
      frT.setX(fr.x - 60);
    };
    bg.setInteractive({ useHandCursor: true }).on('pointerup', () => { this.scene.launch(SceneKeys.Account, { from: SceneKeys.MainMenu }); this.scene.pause(); });
    this.events.on('account:changed', paint);
    this.events.once('shutdown', () => this.events.off('account:changed', paint));
    void currentAccount().then((a) => { paint(a); if (a) startPresence(); }).catch(() => paint(null));
  }

  private joinOpen = false;
  /** Code entry → GuestNet → the host's world. Character must exist first (guests bring their own hero). */
  private openJoin(): void {
    if (this.joinOpen) return;
    if (!Game.hasState || !Game.state.player.hero) {
      const saves = SaveService.listLocal().filter((s) => s !== null);
      if (!saves.length) { void this.newGame(); return; } // slot 0 may hold a cloud-only hero
    }
    this.joinOpen = true;
    const entry = new CodeEntry(this, 'Join a friend', [6, 8], async (code) => {
      if (!Game.hasState) {
        const latest = SaveService.listLocal().filter((s) => s !== null).sort((a, b) => b!.updatedAt - a!.updatedAt)[0];
        const st = latest ? await SaveService.load(latest.slot) : null;
        if (st) Game.set(st);
      }
      await joinGame(code);
      entry.setStatus('Joined! Entering their world…', C.good);
      const world = worldKey(this);
      this.time.delayedCall(400, () => this.scene.start(world, { guest: true }));
    }, () => { this.joinOpen = false; });
  }

  private move(d: number): void {
    const n = this.items.length;
    let i = this.sel;
    for (let k = 0; k < n; k++) { i = (i + d + n) % n; if (this.items[i].enabled) break; }
    this.sel = i;
    this.paint();
  }

  private paint(): void {
    this.items.forEach((it, i) => {
      const on = i === this.sel;
      it.bg.setTexture(!it.enabled ? 'ui:btn_off' : on ? 'ui:btn_gold' : 'ui:btn_slate');
      it.label.setColor(!it.enabled ? C.text500 : on ? C.ink : C.text);
      it.sub?.setColor(on ? '#6a3d0c' : C.text300);
      it.arrow.setVisible(on && it.enabled);
    });
  }

  private activate(i: number): void {
    const it = this.items[i];
    if (it?.enabled) it.act();
  }

  private choosing = false;
  /**
   * A free slot for the new hero. Signed-in players may have heroes only in the cloud (another device, cleared site
   * data): picking from the local list alone overwrote them, so ask the cloud first.
   */
  private async newGame(): Promise<void> {
    if (this.choosing) return;
    this.choosing = true;
    try {
      const saves = SaveService.cloudEnabled ? await SaveService.list() : SaveService.listLocal();
      if (!this.scene.isActive()) return;
      // never overwrite a hero silently: with every slot taken, send the player to Load to free one
      if (saves.every((x) => x !== null)) { this.scene.launch(SceneKeys.Load, { from: SceneKeys.MainMenu, notice: 'All three slots hold a hero. Delete one to start a new one.' }); this.scene.pause(); return; }
      this.scene.start(SceneKeys.CharacterCreate, { slot: this.firstFreeSlot(saves) });
    } finally { this.choosing = false; }
  }

  private firstFreeSlot(saves: ReturnType<typeof SaveService.listLocal>): number {
    const free = saves.findIndex((s) => s === null);
    return free === -1 ? 0 : free;
  }

  private async loadSlot(slot: number): Promise<void> {
    const state = await SaveService.load(slot);
    if (!state) {
      // unreadable, or another account's hero: say so (Continue used to do nothing at all)
      if (!this.scene.isActive()) return;
      const t = this.add.text(this.scale.width / 2, 286, 'That save could not be read. Try Load Game.', { ...typeStyle('h3', C.danger), backgroundColor: C.bg, padding: { x: 14, y: 6 } }).setOrigin(0.5).setDepth(30);
      this.time.delayedCall(4000, () => t.destroy());
      return;
    }
    Game.set(state);
    bus.emit('game:loaded', { slot });
    this.scene.start(worldKey(this));
  }
}
