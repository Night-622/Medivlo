import Phaser from 'phaser';
import { Services } from '@/core';
import { C, typeStyle } from '@/ui/kit/hc';
import { Social } from '@/net/social';
import { currentRealm } from '@/net/coop';
import { challenge } from './DuelUi';

const X = 16, TOP = 250, W = 300, LINES = 8, LINE_H = 22, FADE_MS = 10000;

/**
 * Text chat (co-op + public realms; docs/REBUILD.md § Chat). Owner: Claude 1. Lives in HudV2's left column.
 * Enter opens the field (a DOM input, so typing never reaches game keys), Enter sends, Esc cancels.
 * Click a name → Mute (this session) · Block (always; also stops them joining your world) · Report.
 * The authority filters text (profanity mask in public realms); blocked/muted senders are hidden here.
 */
export class ChatBox {
  private lines: { from: string; name: string; text: string; at: number; system?: boolean }[] = [];
  private layer: Phaser.GameObjects.Container;
  private field: Phaser.GameObjects.DOMElement | null = null;
  private menu: Phaser.GameObjects.Container | null = null;
  private offs: (() => void)[] = [];

  constructor(private scene: Phaser.Scene) {
    this.layer = scene.add.container(0, 0).setDepth(50);
    const net = Services.get('net');
    this.offs.push(net.on('chat', (m) => {
      if (Social.hidden(m.from)) return;
      this.push({ from: m.from, name: m.name, text: m.text, at: scene.time.now });
    }));
    scene.input.keyboard!.on('keydown-ENTER', this.onEnter);
    scene.time.addEvent({ delay: 500, loop: true, callback: () => this.render() });
    scene.events.once('shutdown', () => this.destroy());
  }

  /** Chat only exists when there's someone to talk to. */
  private get enabled(): boolean { return Services.get('net').session().kind !== 'solo'; }

  system(text: string): void { this.push({ from: '', name: '', text, at: this.scene.time.now, system: true }); }

  private push(l: ChatBox['lines'][number]): void {
    this.lines.push(l);
    if (this.lines.length > 50) this.lines.shift();
    this.render();
  }

  private onEnter = (): void => {
    if (!this.enabled || this.field) return;
    const el = this.scene.add.dom(X, TOP + LINES * LINE_H + 8, 'input',
      `width:${W}px;height:32px;box-sizing:border-box;padding:0 10px;font:500 14px "Pixelify Sans";color:${C.text};background:rgba(11,15,34,.92);border:2px solid #2e3a6e;outline:none;caret-color:${C.gold}`).setOrigin(0);
    const input = el.node as HTMLInputElement;
    input.maxLength = 240;
    input.placeholder = 'Say something… (Enter to send, Esc to close)';
    input.addEventListener('keydown', (ev) => {
      ev.stopPropagation();
      if (ev.key === 'Enter') { const t = input.value.trim(); if (t) this.send(t); this.closeField(); }
      else if (ev.key === 'Escape') this.closeField();
    });
    input.addEventListener('blur', () => this.scene.time.delayedCall(0, () => this.closeField()));
    this.field = el;
    this.scene.time.delayedCall(0, () => input.focus());
    this.render();
  };

  private send(text: string): void {
    const cmd = text.match(/^\/(mute|block|unblock|report|duel)\s+(.+)$/i);
    if (cmd) { this.command(cmd[1].toLowerCase(), cmd[2].trim()); return; }
    Services.get('net').send({ type: 'chat', text });
  }

  private command(cmd: string, name: string): void {
    const m = Services.get('net').session().members.find((x) => x.name.toLowerCase() === name.toLowerCase());
    if (!m) { this.system(`No one called ${name} here`); return; }
    if (cmd === 'mute') { Social.mute(m.playerId); this.system(`${m.name} is muted until you leave`); }
    if (cmd === 'block') { Social.block(m.playerId, m.name); this.system(`${m.name} is blocked`); }
    if (cmd === 'unblock') { Social.unblock(m.playerId); this.system(`${m.name} is unblocked`); }
    if (cmd === 'report') void this.report(m.playerId, m.name);
    if (cmd === 'duel') { if (currentRealm()?.rule === 'duels') challenge(m.playerId); else this.system('Duels only happen in a Duels realm'); }
  }

  private async report(uid: string, name: string): Promise<void> {
    const recent = this.lines.filter((l) => l.from === uid).slice(-10).map((l) => l.text);
    this.system((await Social.report(uid, name, recent)) ? `Thanks, ${name} has been reported` : 'Report could not be sent. Try again later');
  }

  private closeField(): void {
    this.field?.destroy();
    this.field = null;
    this.render();
  }

  private render(): void {
    this.layer.removeAll(true);
    if (!this.enabled) return;
    const now = this.scene.time.now;
    const open = !!this.field;
    const shown = this.lines.filter((l) => open || now - l.at < FADE_MS).slice(-LINES);
    if (open) this.layer.add(this.scene.add.rectangle(X - 4, TOP - 4, W + 8, LINES * LINE_H + 8, 0x0b0f22, 0.35).setOrigin(0));
    shown.forEach((l, i) => {
      const y = TOP + (LINES - shown.length + i) * LINE_H;
      const alpha = open ? 1 : Math.min(1, (FADE_MS - (now - l.at)) / 1500);
      // a dark backing per line keeps chat readable over bright ground and NPC nameplates
      this.layer.add(this.scene.add.rectangle(X - 4, y - 2, W + 8, LINE_H - 2, 0x0b0f22, 0.55 * alpha).setOrigin(0));
      if (l.system) { this.layer.add(this.scene.add.text(X, y, l.text, typeStyle('body', C.text300, W)).setAlpha(alpha)); return; }
      const nm = this.scene.add.text(X, y, `${l.name}:`, { ...typeStyle('body', l.from === Services.get('net').localPlayer ? C.gold300 : C.teal), stroke: C.ink, strokeThickness: 3 }).setAlpha(alpha);
      const tx = this.scene.add.text(X + nm.width + 6, y, l.text, { ...typeStyle('body', C.text), stroke: C.ink, strokeThickness: 3 }).setAlpha(alpha);
      if (tx.width > W - nm.width - 6) tx.setText(l.text.slice(0, Math.max(8, Math.floor(l.text.length * (W - nm.width - 6) / tx.width) - 1)) + '…');
      if (l.from !== Services.get('net').localPlayer) nm.setInteractive({ useHandCursor: true }).on('pointerup', () => this.openMenu(l.from, l.name, X + nm.width, y));
      this.layer.add([nm, tx]);
    });
    if (open) this.layer.add(this.scene.add.text(X, TOP - 26, 'Click a name to mute, block or report', typeStyle('caption', C.text500)));
  }

  private openMenu(uid: string, name: string, x: number, y: number): void {
    this.menu?.destroy();
    const c = this.scene.add.container(x + 8, y).setDepth(60);
    const duels = currentRealm()?.rule === 'duels';
    c.add(this.scene.add.nineslice(0, 0, 'ui:panel', undefined, 140, (duels ? 5 : 4) * 30 + 16, 8, 8, 8, 8).setOrigin(0));
    const opts: [string, () => void][] = [
      ...(duels ? [['Duel', () => challenge(uid)] as [string, () => void]] : []),
      ['Mute', () => this.command('mute', name)],
      [Social.isBlocked(uid) ? 'Unblock' : 'Block', () => this.command(Social.isBlocked(uid) ? 'unblock' : 'block', name)],
      ['Report', () => void this.report(uid, name)],
      ['Cancel', () => undefined],
    ];
    opts.forEach(([label, fn], i) => {
      const t = this.scene.add.text(14, 12 + i * 30, label, typeStyle('h3', label === 'Report' ? C.danger : C.text)).setInteractive({ useHandCursor: true });
      t.on('pointerup', () => { c.destroy(); this.menu = null; fn(); });
      c.add(t);
    });
    this.menu = c;
  }

  destroy(): void {
    this.offs.forEach((f) => f());
    this.scene.input.keyboard?.off('keydown-ENTER', this.onEnter);
    this.field?.destroy();
    this.menu?.destroy();
    this.layer.destroy();
  }
}
