import Phaser from 'phaser';
import { Game, SceneKeys } from '@/core';
import { C, CodeEntry, typeStyle } from '@/ui/kit/hc';
import { isFirebaseConfigured } from '@/firebase/config';
import { currentAccount, friendlyAuthError, type AccountInfo } from '@/firebase/accounts';
import { addFriend, listFriends, removeFriend, startPresence, type Friend } from '@/firebase/friends';
import { joinGame } from '@/net/coop';
import { Social } from '@/net/social';
import { SaveService } from '@/firebase/SaveService';
import { worldKey } from '@/scenes/worldKey';

/**
 * Friends (docs/REBUILD.md § Multiplayer: friend codes, join through a friend). Owner: Claude 1.
 * Left: your friend code + Add friend. Right: friends with presence (Hosting / Online / last seen), Join (from the
 * title only), Remove (press twice); blocked players with Unblock underneath.
 */
export class FriendsScene extends Phaser.Scene {
  private from: string = SceneKeys.MainMenu;
  private list!: Phaser.GameObjects.Container;
  private status!: Phaser.GameObjects.Text;
  private acct: AccountInfo | null = null;
  private friends: Friend[] = [];
  private armed: string | null = null;
  private busy = false;
  private entryOpen = false;

  constructor() { super(SceneKeys.Friends); }

  init(data: { from?: string }): void { this.from = data?.from ?? SceneKeys.MainMenu; this.armed = null; this.busy = false; this.entryOpen = false; }

  create(): void {
    const { width: W, height: H } = this.scale;
    this.add.rectangle(0, 0, W, H, parseInt(C.bg.slice(1), 16), 0.92).setOrigin(0).setInteractive();
    this.add.text(48, 28, 'Friends', { ...typeStyle('displayL', C.text), shadow: { offsetX: 3, offsetY: 3, color: C.ink, fill: true } });
    const x = this.add.nineslice(W - 92, 28, 'ui:btn_slate', undefined, 44, 44, 8, 8, 8, 8).setOrigin(0);
    this.add.text(W - 70, 50, '✕', typeStyle('button', C.text)).setOrigin(0.5);
    x.setInteractive({ useHandCursor: true }).on('pointerup', () => this.close());
    this.list = this.add.container(0, 0);
    this.status = this.add.text(W / 2, H - 34, '', typeStyle('body', C.text300)).setOrigin(0.5);
    this.input.keyboard!.on('keydown-ESC', () => { if (!this.entryOpen) this.close(); });
    if (!isFirebaseConfigured) { this.status.setText('Friends need online accounts, which aren\'t available in this build.'); return; }
    void currentAccount().then((a) => {
      this.acct = a;
      if (!a) { this.signedOut(); return; }
      startPresence();
      this.drawMine();
      void this.refresh();
      this.time.addEvent({ delay: 15000, loop: true, callback: () => void this.refresh() });
    }).catch((e) => this.status.setText(friendlyAuthError(e)).setColor(C.danger));
  }

  private signedOut(): void {
    const { width: W } = this.scale;
    this.add.text(W / 2, 280, 'Sign in (or play as a guest) to get a friend code and add friends.', typeStyle('bodyL', C.text300)).setOrigin(0.5);
    this.button(W / 2 - 120, 320, 240, 'Sign in', true, () => { this.scene.stop(); this.scene.launch(SceneKeys.Account, { from: this.from }); });
  }

  private drawMine(): void {
    const a = this.acct!;
    this.add.nineslice(48, 112, 'ui:panel', undefined, 360, 300, 8, 8, 8, 8).setOrigin(0);
    this.add.text(72, 132, 'YOUR FRIEND CODE', typeStyle('badge', C.text500));
    this.add.nineslice(72, 154, 'ui:panel_inset', undefined, 312, 72, 8, 8, 8, 8).setOrigin(0);
    this.add.text(228, 190, a.friendCode ?? '…', { ...typeStyle('displayL', C.gold), letterSpacing: 6 } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(0.5);
    this.add.text(228, 240, 'Share it so friends can add you and join your world while you host.', typeStyle('body', C.text300, 300)).setOrigin(0.5, 0).setAlign('center');
    this.button(72, 300, 148, 'Copy', false, () => { void navigator.clipboard?.writeText(a.friendCode ?? '').then(() => this.say('Friend code copied', C.good)); });
    this.button(236, 300, 148, 'Add friend', true, () => this.openAdd());
    if (a.kind === 'guest') this.add.text(228, 368, 'Guest account: friends stay on this device only.', typeStyle('caption', C.gold300)).setOrigin(0.5, 0);
  }

  private async refresh(): Promise<void> {
    if (this.busy) return;
    try { this.friends = await listFriends(); }
    catch (e) { this.say(friendlyAuthError(e), C.danger); }
    this.render();
  }

  private render(): void {
    this.list.removeAll(true);
    const add = <T extends Phaser.GameObjects.GameObject>(o: T): T => { this.list.add(o); return o; };
    const X = 432, Wd = 800;
    add(this.add.nineslice(X, 112, 'ui:panel', undefined, Wd, 528, 8, 8, 8, 8).setOrigin(0));
    add(this.add.text(X + 24, 132, `FRIENDS · ${this.friends.filter((f) => f.online).length} ONLINE`, typeStyle('badge', C.text500)));
    if (!this.friends.length) add(this.add.text(X + Wd / 2, 260, 'No friends yet. Add one with their 8-character friend code.', typeStyle('bodyL', C.text300)).setOrigin(0.5));
    const fromTitle = this.from === SceneKeys.MainMenu;
    this.friends.slice(0, 7).forEach((f, i) => {
      const y = 156 + i * 56;
      add(this.add.rectangle(X + 16, y, Wd - 32, 50, parseInt((i % 2 ? C.panel700 : C.panel).slice(1), 16)).setOrigin(0));
      add(this.add.circle(X + 36, y + 25, 6, f.hosting ? parseInt(C.gold.slice(1), 16) : f.online ? parseInt(C.good.slice(1), 16) : 0x3a4370));
      add(this.add.text(X + 54, y + 8, f.name, typeStyle('h3', C.text)));
      add(this.add.text(X + 54, y + 31, f.hosting ? 'Hosting a game' : f.online ? 'Online' : f.lastSeen ? `Last seen ${ago(f.lastSeen)}` : 'Offline', typeStyle('caption', f.hosting ? C.gold300 : C.text300)));
      if (f.hosting && fromTitle) this.button(X + Wd - 320, y + 5, 140, 'Join', true, () => void this.join(f), add, 40);
      this.button(X + Wd - 168, y + 5, 140, this.armed === f.uid ? 'Sure?' : 'Remove', false, () => void this.remove(f), add, 40, this.armed === f.uid);
    });
    const blocked = Social.blockedList();
    if (blocked.length) {
      add(this.add.text(X + 24, 560, 'BLOCKED', typeStyle('badge', C.text500)));
      blocked.slice(0, 4).forEach((b, i) => {
        const t = add(this.add.text(X + 24 + i * 190, 582, `${b.name} · Unblock`, typeStyle('body', C.teal)).setInteractive({ useHandCursor: true }));
        t.on('pointerup', () => { Social.unblock(b.uid); this.render(); });
      });
    }
  }

  private openAdd(): void {
    if (this.entryOpen) return;
    this.entryOpen = true;
    const entry = new CodeEntry(this, 'Add a friend', 8, async (code) => {
      const f = await addFriend(code);
      entry.setStatus(`${f.name} added`, C.good);
      void this.refresh();
      this.time.delayedCall(700, () => entry.close());
    }, () => { this.entryOpen = false; });
    entry.setStatus('Type their 8-character friend code');
  }

  private async join(f: Friend): Promise<void> {
    if (this.busy || !f.hosting) return;
    this.busy = true;
    this.say(`Joining ${f.name}…`, C.gold);
    try {
      if (!Game.hasState || !Game.state.player.hero) {
        const latest = SaveService.listLocal().filter((s) => s !== null).sort((a, b) => b!.updatedAt - a!.updatedAt)[0];
        const st = latest ? await SaveService.load(latest.slot) : null;
        if (!st?.player.hero) throw new Error('Create a hero first: New Game on the title screen');
        Game.set(st);
      }
      await joinGame(f.hosting);
      this.scene.stop(SceneKeys.MainMenu);
      this.scene.start(worldKey(this), { guest: true });
    } catch (e) {
      this.busy = false;
      this.say(e instanceof Error ? e.message : 'Could not join', C.danger);
    }
  }

  private async remove(f: Friend): Promise<void> {
    if (this.armed !== f.uid) { this.armed = f.uid; this.render(); return; }
    this.armed = null;
    try { await removeFriend(f.uid); this.friends = this.friends.filter((x) => x.uid !== f.uid); this.say(`${f.name} removed`); }
    catch (e) { this.say(friendlyAuthError(e), C.danger); }
    this.render();
  }

  private button(x: number, y: number, w: number, label: string, gold: boolean, fn: () => void,
    add: <T extends Phaser.GameObjects.GameObject>(o: T) => T = (o) => o, h = 48, danger = false): void {
    const b = add(this.add.nineslice(x, y, gold ? 'ui:btn_gold' : 'ui:btn_slate', undefined, w, h, 8, 8, 8, 8).setOrigin(0));
    add(this.add.text(x + w / 2, y + h / 2, label, typeStyle(h < 48 ? 'h3' : 'button', gold ? C.ink : danger ? C.danger : C.text)).setOrigin(0.5));
    b.setInteractive({ useHandCursor: true }).on('pointerup', () => { if (!this.busy) fn(); })
      .on('pointerover', () => b.setTexture(gold ? 'ui:btn_gold_hover' : 'ui:btn_slate_hover'))
      .on('pointerout', () => b.setTexture(gold ? 'ui:btn_gold' : 'ui:btn_slate'));
  }

  private say(t: string, color: string = C.text300): void { this.status.setText(t).setColor(color); }

  private close(): void {
    this.scene.stop();
    this.scene.resume(this.from);
  }
}

function ago(t: number): string {
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} d ago`;
}
