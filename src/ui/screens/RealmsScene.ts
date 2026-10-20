import Phaser from 'phaser';
import { Game, SceneKeys } from '@/core';
import { C, KeyNav, alive, randomTip, typeStyle } from '@/ui/kit/hc';
import { browseRealms, enterRealm } from '@/net/coop';
import type { RealmListing } from '@/net/realm/RealmNet';
import type { RealmRule } from '@/net/types';
import { SaveService } from '@/firebase/SaveService';
import { worldKey } from '@/scenes/worldKey';

const RULES: Record<RealmRule, { label: string; color: string; blurb: string; penalty: string }> = {
  peaceful: { label: 'PEACEFUL', color: C.good, blurb: 'Meet other heroes, trade and chat. No fighting between players.', penalty: 'Lose nothing (no fighting between players)' },
  duels: { label: 'DUELS', color: C.teal, blurb: 'Challenge another hero to a one-on-one duel. Both must agree.', penalty: 'Lose nothing' },
  arena: { label: 'ARENA', color: C.gold, blurb: 'Fight anyone inside the ring. The stands are safe.', penalty: 'Lose nothing' },
  ffa: { label: 'FREE-FOR-ALL', color: C.danger, blurb: 'Anyone can attack anyone, anywhere outside a safe zone.', penalty: 'Drop 20% of your Embershards' },
};

/**
 * Public realms browser (docs/REBUILD.md § Public realms). Owner: Claude 1.
 * Lists the fixed realm catalogue from the realm server (players / 8), refreshes every 5 s, enters one.
 * Your hero (latest save) comes with you; nothing in a public realm changes your campaign.
 */
export class RealmsScene extends Phaser.Scene {
  private list!: Phaser.GameObjects.Container;
  private status!: Phaser.GameObjects.Text;
  private realms: RealmListing[] = [];
  private nav!: KeyNav;
  private busy = false;

  constructor() { super(SceneKeys.Realms); }

  create(): void {
    const { width: W, height: H } = this.scale;
    this.busy = false;
    this.add.rectangle(0, 0, W, H, parseInt(C.bg.slice(1), 16), 0.92).setOrigin(0).setInteractive();
    this.add.text(48, 28, 'Public realms', { ...typeStyle('displayL', C.text), shadow: { offsetX: 3, offsetY: 3, color: C.ink, fill: true } });
    this.add.text(50, 90, 'Shared worlds for up to 8 heroes. Your level and gear come with you; your campaign stays as it is.', typeStyle('bodyL', C.text300));
    const x = this.add.nineslice(W - 92, 28, 'ui:btn_slate', undefined, 44, 44, 8, 8, 8, 8).setOrigin(0);
    this.add.text(W - 70, 50, '✕', typeStyle('button', C.text)).setOrigin(0.5);
    x.setInteractive({ useHandCursor: true }).on('pointerup', () => this.close());
    this.nav = new KeyNav(this); // keyboard: arrows / Tab between the realms' Enter buttons, Enter goes in
    this.list = this.add.container(0, 0);
    this.status = this.add.text(W / 2, H - 40, 'Finding realms…', typeStyle('body', C.text300)).setOrigin(0.5);
    this.input.keyboard!.on('keydown-ESC', () => { if (!this.busy) this.close(); });
    void this.refresh();
    this.time.addEvent({ delay: 5000, loop: true, callback: () => void this.refresh() });
  }

  private async refresh(): Promise<void> {
    if (this.busy) return;
    let realms: RealmListing[], error: unknown = null;
    try { realms = await browseRealms(); } catch (e) { realms = []; error = e; }
    // closed (texts destroyed) or entering a realm while the list was on its way
    if (!alive(this.list) || this.busy) return;
    this.realms = realms;
    if (error) this.status.setText(error instanceof Error && error.message.includes('launch') ? error.message : 'The realm server isn’t answering. Try again soon.').setColor(C.text300);
    else if (this.status.text === 'Finding realms…' || this.status.text.startsWith('The realm server')) this.status.setText('');
    this.render();
  }

  private render(): void {
    this.list.removeAll(true);
    const add = <T extends Phaser.GameObjects.GameObject>(o: T): T => { this.list.add(o); return o; };
    this.realms.forEach((r, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = 48 + col * 600, y = 136 + row * 248;
      const rule = RULES[r.rule];
      add(this.add.nineslice(x, y, 'ui:panel', undefined, 584, 232, 8, 8, 8, 8).setOrigin(0));
      add(this.add.text(x + 24, y + 20, rule.label, typeStyle('badge', rule.color)));
      add(this.add.text(x + 24, y + 40, r.name, typeStyle('h1', C.text)));
      add(this.add.text(x + 24, y + 86, rule.blurb, typeStyle('body', C.text300, 536)));
      add(this.add.text(x + 24, y + 128, `On death: ${rule.penalty}`, typeStyle('body', C.text500)));
      const full = r.players >= r.max;
      // player pips
      for (let p = 0; p < r.max; p++) add(this.add.rectangle(x + 24 + p * 18, y + 176, 12, 12, p < r.players ? parseInt(rule.color.slice(1), 16) : 0x232c55).setOrigin(0, 0.5));
      add(this.add.text(x + 24 + r.max * 18 + 6, y + 176, `${r.players}/${r.max}`, typeStyle('h3', C.text)).setOrigin(0, 0.5));
      const b = add(this.add.nineslice(x + 584 - 200, y + 152, full ? 'ui:btn_off' : 'ui:btn_gold', undefined, 176, 52, 8, 8, 8, 8).setOrigin(0));
      add(this.add.text(x + 584 - 112, y + 178, full ? 'Full' : 'Enter', typeStyle('button', full ? C.text500 : C.ink)).setOrigin(0.5));
      if (!full) { b.setInteractive({ useHandCursor: true }).on('pointerup', () => void this.enter(r)); this.nav.add(b, () => void this.enter(r)); }
    });
  }

  private async enter(r: RealmListing): Promise<void> {
    if (this.busy) return;
    if (!Game.hasState || !Game.state.player.hero) {
      const latest = SaveService.listLocal().filter((s) => s !== null).sort((a, b) => b!.updatedAt - a!.updatedAt)[0];
      const st = latest ? await SaveService.load(latest.slot) : null;
      if (!st?.player.hero) { this.status.setText('Create a hero first: New Game on the title screen').setColor(C.danger); return; }
      Game.set(st);
    }
    this.busy = true;
    this.status.setText(`Entering ${r.name}…   Tip · ${randomTip('realm')}`).setColor(C.gold);
    try {
      await enterRealm(r);
      this.scene.stop(SceneKeys.MainMenu);
      this.scene.start(worldKey(this), { realm: { id: r.id, space: r.space, rule: r.rule, name: r.name } });
    } catch (e) {
      this.busy = false;
      if (alive(this.status)) this.status.setText(e instanceof Error ? e.message : 'Could not enter the realm').setColor(C.danger);
    }
  }

  private close(): void {
    this.scene.stop();
    this.scene.resume(SceneKeys.MainMenu);
  }
}
