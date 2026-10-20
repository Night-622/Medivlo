import Phaser from 'phaser';
import { Services, bus, keyLabel } from '@/core';
import { C, isAction, typeStyle } from '@/ui/kit/hc';

/**
 * Duels realm UI (Claude 1). Incoming challenge → a prompt under the banner area with Accept / Decline and a 20 s
 * countdown (wall clock; it also closes on death, a space change or leaving the realm);
 * duel start / end → a short banner line. Challenges are sent with `challenge(playerId)` (chat name menu, Pause list).
 * Protocol (Claude 3): ClientMsg { type:'duel', target, accept? }; events duel:asked / duel:started / duel:ended.
 */
export function challenge(target: string): void {
  Services.get('net').send({ type: 'duel', target });
}

export class DuelUi {
  /** a challenge is on screen: the HUD's Esc answers it (Decline) instead of opening Pause */
  static promptOpen = false;
  private prompt: Phaser.GameObjects.Container | null = null;
  private offKeys: (() => void) | null = null;

  constructor(private scene: Phaser.Scene, private banner: (title: string, sub?: string) => void) {
    const name = (id: string, given?: string) => given ?? Services.get('net').session().members.find((m) => m.playerId === id)?.name ?? 'A challenger';
    const me = () => Services.get('net').localPlayer;
    bus.onScene(scene, 'duel:asked', ({ from, to, fromName, toName }) => {
      if (to === me()) this.ask(from, name(from, fromName));
      else if (from === me()) this.toast(`Challenge sent to ${name(to, toName)}`);
    });
    // an open challenge never outlives the moment it was made in
    bus.onScene(scene, 'player:died', (e) => { if (!e.playerId || e.playerId === me()) this.close(); });
    bus.onScene(scene, 'space:changed', (e) => { if (e.playerId === me()) this.close(); });
    bus.onScene(scene, 'net:changed', () => this.close());
    bus.onScene(scene, 'duel:started', ({ a, b }) => { if (a === me() || b === me()) this.banner('Duel!', `${name(a)} vs ${name(b)}`); this.close(); });
    bus.onScene(scene, 'duel:ended', ({ winner, loser }) => {
      if (winner === me()) this.banner('Victory', `${name(loser)} yields`);
      else if (loser === me()) this.banner('Defeated', `${name(winner)} wins the duel`);
    });
    scene.events.once('shutdown', () => this.close());
  }

  private ask(from: string, who: string): void {
    this.close();
    const sc = this.scene;
    const x = sc.scale.width / 2, y = 168; // below the region banner band
    const c = sc.add.container(0, 0).setDepth(60);
    c.add(sc.add.nineslice(x - 220, y, 'ui:panel_gold', undefined, 440, 96, 8, 8, 8, 8).setOrigin(0));
    c.add(sc.add.text(x, y + 22, `${who} challenges you to a duel`, typeStyle('h3', C.text)).setOrigin(0.5));
    const left = sc.add.text(x + 206, y + 10, '20', typeStyle('caption', C.text500)).setOrigin(1, 0);
    c.add(left);
    const answer = (accept: boolean) => {
      if (accept) Services.get('net').send({ type: 'duel', target: from, accept: true });
      this.close();
    };
    const btn = (bx: number, label: string, gold: boolean, accept: boolean) => {
      const b = sc.add.nineslice(bx, y + 46, gold ? 'ui:btn_gold' : 'ui:btn_slate', undefined, 150, 40, 8, 8, 8, 8).setOrigin(0);
      const t = sc.add.text(bx + 75, y + 66, label, typeStyle('h3', gold ? C.ink : C.text)).setOrigin(0.5);
      b.setInteractive({ useHandCursor: true }).on('pointerup', () => answer(accept));
      c.add([b, t]);
    };
    // keyboard (accessibility): the bound Interact key accepts, Esc declines
    const onKey = (ev: KeyboardEvent) => {
      if (ev.target instanceof HTMLInputElement) return;
      if (isAction(ev, 'interact')) answer(true); else if (ev.key === 'Escape') answer(false);
    };
    sc.input.keyboard?.on('keydown', onKey);
    this.offKeys = () => sc.input.keyboard?.off('keydown', onKey);
    DuelUi.promptOpen = true;
    c.add(sc.add.text(x - 206, y + 10, `${keyLabel('interact')} accept · Esc decline`, typeStyle('caption', C.text500)).setOrigin(0, 0));
    btn(x - 160, 'Accept', true, true);
    btn(x + 10, 'Decline', false, false);
    this.prompt = c;
    // wall-clock deadline: a scene timer can stall (a busy or paused HUD clock kept the prompt up indefinitely)
    const until = Date.now() + 20_000;
    this.timer = window.setInterval(() => {
      const s = Math.ceil((until - Date.now()) / 1000);
      if (s <= 0 || this.prompt !== c) { this.close(); return; }
      if (left.active) left.setText(String(s));
    }, 250);
  }

  private toast(text: string): void {
    const t = this.scene.add.text(this.scene.scale.width / 2, 150, text, { ...typeStyle('body', C.text300), backgroundColor: '#0d1226', padding: { x: 10, y: 4 } }).setOrigin(0.5).setDepth(60);
    this.scene.time.delayedCall(2500, () => t.destroy());
  }

  private timer = 0;
  private close(): void { window.clearInterval(this.timer); this.prompt?.destroy(); this.prompt = null; this.offKeys?.(); this.offKeys = null; DuelUi.promptOpen = false; }
}
