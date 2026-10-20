import Phaser from 'phaser';
import { Game, SceneKeys, Services, bus } from '@/core';
import { sim } from '@/net';
import { coopRole, hostGame, hostInSafeZone, leaveCoop } from '@/net/coop';
import { C, alive, typeStyle } from '@/ui/kit/hc';
import { SaveService } from '@/firebase/SaveService';
import { firebase } from '@/firebase/app';
import { accountKind } from '@/firebase/accounts';
import { defaultOutfit, heroSprite, heroTexture } from '@/scenes/create/heroChoice';
import { classDisplay } from '@/data/classes/hc';

/**
 * Pause (handoff › Pause). Owner: Claude 1. Esc toggles. Solo freezes the sim; co-op/public never pause.
 * Menu at (380,160) 340 wide, 56px items; side card 300×408 at (752,160) with hero, stats and party.
 * "Invite friends" starts hosting (join code shown); a guest sees "Leave party".
 */
/** Where saves go. A guest (the automatic anonymous sign-in) does get cloud saves, but only on this browser's account. */
function saveWhere(): string {
  if (!SaveService.cloudEnabled) return 'This device only';
  try { return accountKind(firebase().auth.currentUser) === 'guest' ? 'This browser only (guest)' : 'Cloud + this device'; } catch { return 'This device only'; }
}

export class PauseScene extends Phaser.Scene {
  private items: { bg: Phaser.GameObjects.NineSlice; label: Phaser.GameObjects.Text; arrow: Phaser.GameObjects.Text; act: () => void }[] = [];
  private sel = 0;
  private card!: Phaser.GameObjects.Container;
  private code: string | null = null;

  constructor() { super(SceneKeys.Pause); }

  create(): void {
    const { width: W, height: H } = this.scale;
    if (Services.get('net').role === 'solo') sim.setPaused(true);
    bus.emit('ui:open', { panel: 'pause' });
    this.add.rectangle(0, 0, W, H, parseInt(C.bg.slice(1), 16), 0.8).setOrigin(0).setInteractive();
    this.add.text(W / 2, 64, 'PAUSED', { ...typeStyle('displayXL', C.text), stroke: C.ink, strokeThickness: 8, letterSpacing: 6 } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(0.5, 0);
    this.items = [];
    this.sel = 0;
    this.code = null; // a code from an earlier session (left since) must not show; a live one comes from the session
    const role = coopRole();
    const defs: [string, () => void][] = [
      ['Resume', () => this.resume()],
      [role === 'guest' ? 'Leave party' : role === 'host' ? 'Party code' : 'Invite friends', () => void this.party()],
      ['Friends', () => this.scene.launch(SceneKeys.Friends, { from: SceneKeys.Pause })],
      ['Save game', () => void SaveService.save().then(() => this.flash('Saved'))],
      ['Load game', () => this.scene.launch(SceneKeys.Load, { from: SceneKeys.Pause })],
      ['Settings', () => this.scene.launch(SceneKeys.Settings, { from: SceneKeys.Pause })],
      ['World map', () => { this.resume(); bus.emit('ui:open', { panel: 'map' }); }],
      ['Quit to title', () => this.quit()],
    ];
    const step = defs.length > 7 ? 60 : 64;
    defs.forEach(([label, act], i) => {
      const y = 152 + i * step;
      const bg = this.add.nineslice(380, y, 'ui:btn_slate', undefined, 340, 56, 8, 8, 8, 8).setOrigin(0);
      const arrow = this.add.text(392, y + 28, '▶', { fontFamily: '"Jersey 10"', fontSize: '24px', color: C.ink }).setOrigin(0, 0.5);
      const t = this.add.text(380 + 44, y + 28, label, typeStyle('h2', C.text)).setOrigin(0, 0.5);
      bg.setInteractive({ useHandCursor: true }).on('pointerover', () => { this.sel = i; this.paint(); }).on('pointerup', act);
      this.items.push({ bg, label: t, arrow, act });
    });
    this.paint();
    this.add.nineslice(752, 160, 'ui:panel', undefined, 300, 408, 8, 8, 8, 8).setOrigin(0);
    this.card = this.add.container(0, 0);
    this.drawCard();
    this.add.text(W / 2, H - 36, '↑ ↓ choose · Enter confirm · Esc resume', typeStyle('caption', C.text500)).setOrigin(0.5, 0);
    const kb = this.input.keyboard!;
    kb.on('keydown-ESC', () => { if (!this.overlayOpen()) this.resume(); });
    kb.on('keydown-UP', () => { this.sel = (this.sel + this.items.length - 1) % this.items.length; this.paint(); });
    kb.on('keydown-DOWN', () => { this.sel = (this.sel + 1) % this.items.length; this.paint(); });
    kb.on('keydown-ENTER', () => { if (!this.overlayOpen()) this.items[this.sel].act(); });
    const offMembers = Services.get('net').onMembers(() => this.drawCard());
    this.events.once('shutdown', offMembers);
  }

  /** Settings/Friends open on top: their keys, not ours. */
  private overlayOpen(): boolean { return [SceneKeys.Settings, SceneKeys.Friends, SceneKeys.Load].some((k) => this.scene.isActive(k)); }

  private paint(): void {
    this.items.forEach((it, i) => {
      const on = i === this.sel;
      it.bg.setTexture(on ? 'ui:btn_gold' : 'ui:btn_slate');
      it.label.setColor(on ? C.ink : C.text);
      it.arrow.setVisible(on);
    });
  }

  private drawCard(): void {
    this.card.removeAll(true);
    const add = <T extends Phaser.GameObjects.GameObject>(o: T) => { this.card.add(o); return o; };
    const p = Game.hasState ? Game.state.player : null;
    const hero = p?.hero;
    add(this.add.rectangle(772, 180, 64, 64, parseInt(C.panel600.slice(1), 16)).setOrigin(0));
    if (hero) {
      const tex = heroTexture(this, heroSprite(hero.classId, hero.look, hero.outfit ?? defaultOutfit()));
      if (tex) add(this.add.image(804, 182, tex).setOrigin(0.5, 0).setScale(2)).setMask(this.make.graphics({}, false).fillRect(772, 180, 64, 64).createGeometryMask());
    }
    add(this.add.text(848, 184, p?.name ?? '', typeStyle('h2', C.text)));
    const lvl = (Game.hasState ? Game.state.character?.level : undefined) ?? p?.progression.level ?? 1;
    add(this.add.text(848, 214, hero ? `Lv ${lvl} ${classDisplay(hero.classId)?.name ?? hero.classId}` : '', typeStyle('body', C.text300)));
    const secs = Game.hasState ? Game.state.meta.playtimeSec : 0;
    const rows: [string, string][] = [['Playtime', `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m`], ['Saves', saveWhere()]];
    rows.forEach(([k, v], i) => {
      add(this.add.text(772, 262 + i * 22, k, typeStyle('body', C.text500)));
      add(this.add.text(1032, 262 + i * 22, v, typeStyle('body', C.text)).setOrigin(1, 0));
    });
    add(this.add.rectangle(772, 316, 260, 2, parseInt(C.panel700.slice(1), 16)).setOrigin(0));
    const net = Services.get('net');
    const s = net.session();
    add(this.add.text(772, 328, s.kind === 'solo' ? 'PARTY' : `PARTY · ${s.members.filter((m) => m.connected).length}/${s.maxPlayers}`, typeStyle('badge', C.text500)));
    let y = 348;
    if (this.code || s.joinCode) {
      add(this.add.text(772, y, 'Party code', typeStyle('caption', C.text300)));
      add(this.add.text(1032, y - 6, this.code ?? s.joinCode ?? '', { ...typeStyle('h1', C.gold), letterSpacing: 4 } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(1, 0));
      y += 40;
      const safe = hostInSafeZone();
      const note = add(this.add.text(772, y, safe ? 'You’re in a safe zone: friends joining for the first time can come in now.' : 'Friends joining for the first time can enter once you’re in a safe zone (a town or waystone).', typeStyle('caption', safe ? C.good : C.text300, 260)));
      y += note.height + 10;
    }
    const members = s.kind === 'solo' ? [] : s.members;
    for (const m of members) {
      add(this.add.text(772, y, `${m.isHost ? '♛ ' : ''}${m.name}`, typeStyle('body', m.connected ? C.text : C.text500)));
      add(this.add.text(1032, y, m.downed ? 'DOWNED' : m.connected ? `Lv ${m.level}` : 'left', typeStyle('caption', m.downed ? C.danger : C.text300)).setOrigin(1, 0));
      y += 22;
    }
    if (!members.length) add(this.add.text(772, y, 'Playing solo. Invite friends to join your world.', typeStyle('caption', C.text300, 260)));
  }

  private async party(): Promise<void> {
    const role = coopRole();
    if (role === 'guest') { leaveCoop(); this.quit(); return; }
    if (role === 'host') { this.flash(`Party code: ${Services.get('net').session().joinCode}`); return; }
    this.flash('Opening your world…');
    try {
      // First-time joiners need the host in a safe zone (Claude 2's zoneRule, checked live at each join)
      this.code = await hostGame(hostInSafeZone);
      if (!alive(this.card)) return; // resumed while the room was opening; the next Pause shows the code
      this.flash(`Share your party code: ${this.code}`);
      this.drawCard();
    } catch (e) { this.flash(e instanceof Error ? e.message : 'Could not open your world'); }
  }

  private flash(text: string): void {
    if (!alive(this.card)) return; // a save or hosting call finished after Pause closed: don't paint the next one
    const t = this.add.text(this.scale.width / 2, 134, text, { ...typeStyle('h3', C.gold), backgroundColor: C.bg, padding: { x: 12, y: 4 } }).setOrigin(0.5);
    this.time.delayedCall(2600, () => t.destroy());
  }

  private resume(): void {
    if (Services.get('net').role === 'solo') sim.setPaused(false);
    bus.emit('ui:close', { panel: 'pause' });
    this.scene.stop();
  }

  private quit(): void {
    // the local copy is written synchronously inside save(); the cloud copy finishes on its own (offline it would
    // hold Quit to title for the whole cloud timeout)
    void SaveService.save();
    leaveCoop();
    sim.setPaused(false);
    bus.emit('ui:close', { panel: 'pause' });
    for (const k of [SceneKeys.HudV2, SceneKeys.WorldV2, SceneKeys.World]) if (this.scene.isActive(k)) this.scene.stop(k);
    this.scene.start(SceneKeys.MainMenu);
  }
}
