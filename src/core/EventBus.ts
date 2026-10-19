/** Global typed event bus. Use `bus.on` in scenes and remember to `off` on shutdown (or use `onScene`). */
import type Phaser from 'phaser';
import type { GameEventName, GameEvents } from './events';

type Handler<K extends GameEventName> = (payload: GameEvents[K]) => void;

class TypedBus {
  private handlers = new Map<GameEventName, Set<Handler<GameEventName>>>();

  on<K extends GameEventName>(event: K, fn: Handler<K>): () => void {
    let set = this.handlers.get(event);
    if (!set) this.handlers.set(event, (set = new Set()));
    set.add(fn as Handler<GameEventName>);
    return () => this.off(event, fn);
  }

  once<K extends GameEventName>(event: K, fn: Handler<K>): () => void {
    const off = this.on(event, (p) => { off(); fn(p); });
    return off;
  }

  off<K extends GameEventName>(event: K, fn: Handler<K>): void {
    this.handlers.get(event)?.delete(fn as Handler<GameEventName>);
  }

  emit<K extends GameEventName>(event: K, payload: GameEvents[K]): void {
    const set = this.handlers.get(event);
    if (!set) return;
    for (const fn of [...set]) {
      try { (fn as Handler<K>)(payload); }
      catch (err) { console.error(`[bus] handler for "${event}" threw`, err); }
    }
  }

  /** Subscribe for the lifetime of a scene; auto-unsubscribes on shutdown. */
  onScene<K extends GameEventName>(scene: Phaser.Scene, event: K, fn: Handler<K>): void {
    const off = this.on(event, fn);
    scene.events.once('shutdown', off);
    scene.events.once('destroy', off);
  }
}

export const bus = new TypedBus();
