import Phaser from 'phaser';
import { SceneKeys } from '@/core';
import { C, alive, typeStyle } from '@/ui/kit/hc';
import { isFirebaseConfigured } from '@/firebase/config';
import {
  addEmail, currentAccount, friendlyAuthError, logOut, playAsGuest, recoverUsername, resetEmailPassword, signInEmail, signInUsername,
  signUpEmail, signUpUsername, type AccountInfo,
} from '@/firebase/accounts';

type View = 'signin' | 'create' | 'recover' | 'code' | 'profile' | 'addEmail';
type Via = 'username' | 'email';

const PX = 340, PY = 84, PW = 600, PH = 552;
const INPUT_CSS = `width:360px;height:40px;box-sizing:border-box;padding:0 12px;font:500 16px "Pixelify Sans";color:${C.text};`
  + `background:#0b0f22;border:2px solid #2e3a6e;border-radius:2px;outline:none;caret-color:${C.gold}`;

/**
 * Account (docs/REBUILD.md § Accounts). Owner: Claude 1. Opens over the title.
 * Sign in / create with email+password or username+password (recovery code shown once), play as guest,
 * recover a username account, add an email later, sign out. Guests who create an account keep their progress
 * (accounts.ts links the anonymous user). Inputs are real DOM fields (paste, password managers, masking).
 */
export class AccountScene extends Phaser.Scene {
  private view: View = 'signin';
  private via: Via = 'username';
  private acct: AccountInfo | null = null;
  private layer!: Phaser.GameObjects.Container;
  private doms: Phaser.GameObjects.DOMElement[] = [];
  private status!: Phaser.GameObjects.Text;
  private busy = false;
  private recoveryCode = '';
  private from: string = SceneKeys.MainMenu;

  constructor() { super(SceneKeys.Account); }

  init(data: { from?: string }): void { this.from = data?.from ?? SceneKeys.MainMenu; }

  create(): void {
    const { width: W, height: H } = this.scale;
    this.add.rectangle(0, 0, W, H, parseInt(C.bg.slice(1), 16), 0.86).setOrigin(0).setInteractive();
    this.add.nineslice(PX, PY, 'ui:panel', undefined, PW, PH, 8, 8, 8, 8).setOrigin(0);
    const x = this.add.nineslice(PX + PW - 56, PY + 12, 'ui:btn_slate', undefined, 44, 44, 8, 8, 8, 8).setOrigin(0);
    this.add.text(PX + PW - 34, PY + 34, '✕', typeStyle('button', C.text)).setOrigin(0.5);
    x.setInteractive({ useHandCursor: true }).on('pointerup', () => this.close());
    this.layer = this.add.container(0, 0);
    this.status = this.add.text(PX + PW / 2, PY + PH - 34, '', typeStyle('body', C.text300, PW - 60)).setOrigin(0.5).setAlign('center').setDepth(5);
    this.input.keyboard!.on('keydown-ESC', () => { if (!this.busy) this.close(); });
    this.events.once('shutdown', () => this.clearDom());
    if (!isFirebaseConfigured) { this.title('Your account'); this.say('Online accounts aren\'t available in this build. Progress is saved on this device.'); return; }
    this.say('…');
    void currentAccount().then((a) => { this.acct = a; this.go(a && a.kind !== 'guest' ? 'profile' : 'signin'); }).catch((e) => this.say(friendlyAuthError(e), C.danger));
  }

  // ───────── views ─────────

  private go(v: View): void {
    if (!alive(this.layer)) return;
    this.view = v;
    this.layer.removeAll(true);
    this.clearDom();
    this.say('');
    ({ signin: () => this.drawAuth(false), create: () => this.drawAuth(true), recover: () => this.drawRecover(), code: () => this.drawCode(), profile: () => this.drawProfile(), addEmail: () => this.drawAddEmail() })[v]();
  }

  private drawAuth(creating: boolean): void {
    this.title(creating ? 'Create account' : 'Sign in');
    if (this.acct?.kind === 'guest') this.note(PY + 74, 'You\'re playing as a guest. Create an account to keep your progress on any device.', C.gold300);
    this.tabs(PY + 108, [['Sign in', !creating, () => this.go('signin')], ['Create account', creating, () => this.go('create')]]);
    this.tabs(PY + 162, [['Username', this.via === 'username', () => { this.via = 'username'; this.go(this.view); }], ['Email', this.via === 'email', () => { this.via = 'email'; this.go(this.view); }]], 140);
    let y = PY + 222;
    const id = this.field(y, this.via === 'email' ? 'Email' : 'Username', this.via === 'email' ? 'email' : 'text', this.via === 'email' ? 'email' : 'username');
    y += 72;
    const display = creating && this.via === 'email' ? this.field(y, 'Hero name shown to friends', 'text', 'nickname') : null;
    if (display) y += 72;
    const pw = this.field(y, 'Password', 'password', creating ? 'new-password' : 'current-password');
    y += 76;
    const submit = async () => {
      const name = id.value.trim(), pass = pw.value;
      if (!name || !pass) { this.say('Fill in both fields', C.danger); return; }
      await this.run(async () => {
        if (!creating) await (this.via === 'email' ? signInEmail(name, pass) : signInUsername(name, pass));
        else if (this.via === 'email') await signUpEmail(name, pass, display?.value.trim() || name.split('@')[0]);
        else { this.recoveryCode = (await signUpUsername(name, pass)).recoveryCode; }
        this.acct = await currentAccount();
        this.go(creating && this.via === 'username' ? 'code' : 'profile');
      });
    };
    for (const el of [id, pw, display]) el?.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') void submit(); });
    this.button(PX + 120, y, 360, 52, creating ? 'Create account' : 'Sign in', true, () => void submit());
    y += 66;
    if (!creating && this.via === 'username') this.link(PX + PW / 2, y, 'Forgot your password? Use your recovery code', () => this.go('recover'));
    if (!creating && this.via === 'email') this.link(PX + PW / 2, y, 'Forgot your password? Email me a reset link', () => {
      if (!id.value.trim()) { this.say('Type your email above first', C.danger); return; }
      void this.run(async () => { await resetEmailPassword(id.value); this.say('Reset link sent. Check your inbox', C.good); });
    });
    if (!this.acct) this.link(PX + PW / 2, y + 28, 'Or play as a guest (this device only)', () => void this.run(async () => { await playAsGuest('Guest'); this.acct = await currentAccount(); this.say('Playing as a guest. Your saves stay on this device.', C.good); this.time.delayedCall(900, () => this.close()); }));
    id.focus();
  }

  private drawCode(): void {
    this.title('Your recovery code');
    this.note(PY + 84, 'This is the only way back into a username account if you forget your password. Write it down or save it somewhere safe. We can\'t show it again.', C.text300);
    this.layer.add(this.add.nineslice(PX + 60, PY + 170, 'ui:panel_inset', undefined, PW - 120, 80, 8, 8, 8, 8).setOrigin(0));
    this.layer.add(this.add.text(PX + PW / 2, PY + 210, this.recoveryCode, { ...typeStyle('displayL', C.gold), letterSpacing: 4 } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(0.5));
    this.button(PX + 60, PY + 280, 230, 48, 'Copy', false, () => { void navigator.clipboard?.writeText(this.recoveryCode).then(() => this.say('Copied', C.good)); });
    this.button(PX + PW - 290, PY + 280, 230, 48, 'I\'ve saved it', true, () => this.go('profile'));
  }

  private drawRecover(): void {
    this.title('Recover account');
    this.note(PY + 80, 'Enter your username, the recovery code you saved, and a new password. You\'ll get a new recovery code.', C.text300);
    const user = this.field(PY + 150, 'Username', 'text', 'username');
    const code = this.field(PY + 222, 'Recovery code (XXXX-XXXX-XXXX-XXXX)', 'text', 'off');
    const pw = this.field(PY + 294, 'New password', 'password', 'new-password');
    const submit = () => this.run(async () => {
      this.recoveryCode = await recoverUsername(user.value, code.value, pw.value);
      this.acct = await currentAccount();
      this.go('code');
    });
    this.button(PX + 120, PY + 372, 360, 52, 'Set new password', true, () => void submit());
    this.link(PX + PW / 2, PY + 440, 'Back to sign in', () => this.go('signin'));
    user.focus();
  }

  private drawProfile(): void {
    const a = this.acct;
    if (!a) { this.go('signin'); return; }
    this.title('Your account');
    const rows: [string, string][] = [
      ['Name', a.name],
      ['Signed in with', a.kind === 'email' ? `Email · ${a.email ?? ''}` : a.kind === 'username' ? 'Username + password' : 'Guest (this device)'],
      ['Saves', a.kind === 'guest' ? 'This device only' : 'Cloud and this device'],
    ];
    rows.forEach(([k, v], i) => {
      this.layer.add(this.add.text(PX + 48, PY + 96 + i * 34, k, typeStyle('body', C.text500)));
      this.layer.add(this.add.text(PX + PW - 48, PY + 96 + i * 34, v, typeStyle('body', C.text)).setOrigin(1, 0));
    });
    this.layer.add(this.add.text(PX + 48, PY + 214, 'YOUR FRIEND CODE', typeStyle('badge', C.text500)));
    this.layer.add(this.add.nineslice(PX + 48, PY + 236, 'ui:panel_inset', undefined, PW - 96, 72, 8, 8, 8, 8).setOrigin(0));
    this.layer.add(this.add.text(PX + PW / 2, PY + 272, a.friendCode ?? '…', { ...typeStyle('displayL', C.gold), letterSpacing: 6 } as Phaser.Types.GameObjects.Text.TextStyle).setOrigin(0.5));
    this.note(PY + 318, 'Friends add you with this code, and can join your world through it when you\'re hosting.', C.text300);
    let y = PY + 380;
    if (a.friendCode) this.button(PX + 48, y, 160, 48, 'Copy code', false, () => { void navigator.clipboard?.writeText(a.friendCode!).then(() => this.say('Friend code copied', C.good)); });
    if (a.kind === 'username') this.button(PX + 220, y, 160, 48, 'Add email', false, () => this.go('addEmail'));
    if (a.kind === 'guest') this.button(PX + 220, y, 160, 48, 'Keep progress', true, () => this.go('create'));
    this.button(PX + PW - 208, y, 160, 48, 'Sign out', false, () => void this.run(async () => { await logOut(); this.acct = null; this.go('signin'); this.say('Signed out', C.text300); }));
    y += 0;
  }

  private drawAddEmail(): void {
    this.title('Add an email');
    this.note(PY + 84, 'Optional. We\'ll send a link to confirm it. After that you can sign in with this email too, and reset your password by email.', C.text300);
    const email = this.field(PY + 170, 'Email', 'email', 'email');
    this.button(PX + 120, PY + 252, 360, 52, 'Send confirmation link', true, () => void this.run(async () => { await addEmail(email.value.trim()); this.say('Check your inbox for the confirmation link', C.good); }));
    this.link(PX + PW / 2, PY + 324, 'Back', () => this.go('profile'));
    email.focus();
  }

  // ───────── widgets ─────────

  private title(t: string): void { this.layer.add(this.add.text(PX + 32, PY + 22, t, typeStyle('h1', C.text))); }

  private note(y: number, t: string, color: string): void {
    this.layer.add(this.add.text(PX + PW / 2, y, t, typeStyle('body', color, PW - 96)).setOrigin(0.5, 0).setAlign('center'));
  }

  // sign-in calls and currentAccount() can finish after the screen closed: never draw into destroyed objects
  private say(t: string, color: string = C.text300): void { if (alive(this.status)) this.status.setText(t).setColor(color); }

  private tabs(y: number, defs: [string, boolean, () => void][], w = 200): void {
    const total = defs.length * w + (defs.length - 1) * 8;
    defs.forEach(([label, on, fn], i) => {
      const x = PX + (PW - total) / 2 + i * (w + 8);
      const bg = this.add.nineslice(x, y, on ? 'ui:tab_active' : 'ui:tab', undefined, w, 44, 8, 8, 8, 8).setOrigin(0);
      bg.setInteractive({ useHandCursor: true }).on('pointerup', () => { if (!this.busy && !on) fn(); });
      this.layer.add([bg, this.add.text(x + w / 2, y + 22, label, typeStyle('h3', on ? C.text : C.text300)).setOrigin(0.5)]);
    });
  }

  private field(y: number, label: string, type: string, autocomplete: string): HTMLInputElement {
    this.layer.add(this.add.text(PX + 120, y, label, typeStyle('caption', C.text300)));
    const d = this.add.dom(PX + 120, y + 18, 'input', INPUT_CSS).setOrigin(0);
    const el = d.node as HTMLInputElement;
    el.type = type;
    el.setAttribute('autocomplete', autocomplete);
    el.spellcheck = false;
    el.maxLength = 120;
    el.addEventListener('keydown', (ev) => ev.stopPropagation()); // typing "M" or "Esc" must not reach game keys
    el.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && !this.busy) this.close(); });
    this.doms.push(d);
    return el;
  }

  private button(x: number, y: number, w: number, h: number, label: string, gold: boolean, fn: () => void): void {
    const b = this.add.nineslice(x, y, gold ? 'ui:btn_gold' : 'ui:btn_slate', undefined, w, h, 8, 8, 8, 8).setOrigin(0);
    const t = this.add.text(x + w / 2, y + h / 2, label, typeStyle('button', gold ? C.ink : C.text)).setOrigin(0.5);
    if (t.width > w - 16) t.setScale((w - 16) / t.width);
    b.setInteractive({ useHandCursor: true }).on('pointerup', () => { if (!this.busy) fn(); })
      .on('pointerover', () => b.setTexture(gold ? 'ui:btn_gold_hover' : 'ui:btn_slate_hover'))
      .on('pointerout', () => b.setTexture(gold ? 'ui:btn_gold' : 'ui:btn_slate'));
    this.layer.add([b, t]);
  }

  private link(x: number, y: number, label: string, fn: () => void): void {
    const t = this.add.text(x, y, label, typeStyle('body', C.teal)).setOrigin(0.5, 0).setInteractive({ useHandCursor: true });
    t.on('pointerup', () => { if (!this.busy) fn(); }).on('pointerover', () => t.setColor(C.text)).on('pointerout', () => t.setColor(C.teal));
    this.layer.add(t);
  }

  private async run(fn: () => Promise<void>): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    this.say('Working…', C.gold);
    try { await fn(); }
    catch (e) { this.say(friendlyAuthError(e), C.danger); }
    finally { this.busy = false; }
  }

  private clearDom(): void { for (const d of this.doms) d.destroy(); this.doms = []; }

  private close(): void {
    this.scene.stop();
    this.scene.resume(this.from);
    this.scene.get(this.from).events.emit('account:changed', this.acct);
  }
}
