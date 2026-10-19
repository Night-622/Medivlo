import Phaser from 'phaser';
import { Services, bus } from '@/core';
import { C, typeStyle } from '@/ui/kit/hc';

/**
 * Duels realm UI (Claude 1). Incoming challenge → a prompt under the banner area with Accept / Decline (20 s);
 * duel start / end → a short banner line. Challenges are sent with `challenge(playerId)` (chat name menu, Pause list).
 * Protocol (Claude 3): ClientMsg { type:'duel', target, accept? }; events duel:asked / duel:started / duel:ended.
 */
export function challenge(target: string): void {
  Services.get('net').send({ type: 'duel', target });
}

export class DuelUi {
  private prompt: Phaser.GameObjects.Container | null = null;

  constructor(private scene: Phaser.Scene, private banner: (title: string, sub?: string) => void) {
    const name = (id: string) => Services.get('net').session().members.find((m) => m.playerId === id)?.name ?? 'Someone';
    const me = () => Services.get('net').localPlayer;
    bus.onScene(scene, 'duel:asked', ({ from, to }) => {
      if (to === me()) this.ask(from, name(from));
      else if (from === me()) this.toast(`Challenge sent to ${name(to)}`);
    });
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
    const btn = (bx: number, label: string, gold: boolean, accept: boolean) => {
      const b = sc.add.nineslice(bx, y + 46, gold ? 'ui:btn_gold' : 'ui:btn_slate', undefined, 150, 40, 8, 8, 8, 8).setOrigin(0);
      const t = sc.add.text(bx + 75, y + 66, label, typeStyle('h3', gold ? C.ink : C.text)).setOrigin(0.5);
      b.setInteractive({ useHandCursor: true }).on('pointerup', () => {
        if (accept) Services.get('net').send({ type: 'duel', target: from, accept: true });
        this.close();
      });
      c.add([b, t]);
    };
    btn(x - 160, 'Accept', true, true);
    btn(x + 10, 'Decline', false, false);
    this.prompt = c;
    sc.time.delayedCall(20_000, () => { if (this.prompt === c) this.close(); });
  }

  private toast(text: string): void {
    const t = this.scene.add.text(this.scene.scale.width / 2, 150, text, { ...typeStyle('body', C.text300), backgroundColor: '#0d1226', padding: { x: 10, y: 4 } }).setOrigin(0.5).setDepth(60);
    this.scene.time.delayedCall(2500, () => t.destroy());
  }

  private close(): void { this.prompt?.destroy(); this.prompt = null; }
}
