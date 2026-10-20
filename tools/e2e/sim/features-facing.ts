/**
 * Facing hysteresis for the side-view walk (Claude 3): the 4-way view sent for heroes (facing4Sticky) keeps side vs
 * front steady on diagonals and switches only once the other axis clearly leads; a reversal within an axis is instant.
 * The snapshot path is checked too: a hero walking a wobbling diagonal sends one view, not a flicker.
 */
import { newCharacter } from '@/systems/rules/character';
import { facing4Sticky } from '@/systems/sim/world';
import { check, hero, world } from './features-harness';

export function facingChecks(): void {
  type F = 'n' | 'e' | 's' | 'w';
  const run = (start: F, vs: [number, number][]): F[] => { let f: F = start; return vs.map(([x, y]) => (f = facing4Sticky({ x, y }, f))); };
  const wobble = run('e', [[1, 0.95], [0.95, 1], [1, 1.1], [1.1, 1], [1, 1.2]]);
  check(wobble.every((f) => f === 'e'), 'facing: a diagonal wobbling around 45° keeps the side view', wobble.join(' '));
  const turn = run('e', [[1, 1.3], [1.1, 1], [1, 0.9], [1.3, 1]]);
  check(turn.join('') === 'ssse', 'facing: the other axis must lead by 25% to switch side ↔ front', turn.join(' '));
  const flip = run('e', [[-1, 0.2], [1, -0.1], [0.2, -1], [-0.1, 1]]);
  check(flip.join('') === 'wens', 'facing: reversing within an axis switches at once', flip.join(' '));
  // through the sim: walk a wobbling diagonal (the move vector alternates around 45°) and read the snapshot
  const w = world(), p = hero(w, 'a', newCharacter('swordsman'));
  w.run(300, { a: { move: { x: 1, y: 0 } } });
  const seen = new Set<string>();
  for (let i = 0; i < 40; i++) {
    const m = i % 2 ? { x: 0.72, y: 0.69 } : { x: 0.69, y: 0.72 };
    w.tick({ a: { move: m, aim: { x: p.x + m.x * 100, y: p.y + m.y * 100 } } });
    seen.add(String(w.sim.collect('a').find((e) => e.id === p.id)?.facing));
  }
  check(seen.size === 1, 'facing: a hero on a wobbling diagonal sends one view, no flicker', [...seen].join(','));
  // escorts walk with side-view anims too: the same sticky facing in their snapshot
  const id = w.sim.spawn({ creature: 'bx_escort', level: 5, space: 't', x: 0, y: 40, follow: 'a', escort: {} });
  const esc = w.sim.w.enemies.get(id)!;
  esc.face = { x: 1, y: 0 };
  w.tick();
  const seenE = new Set<string>();
  for (let i = 0; i < 20; i++) {
    esc.face = i % 2 ? { x: 0.72, y: 0.69 } : { x: 0.69, y: 0.72 };
    seenE.add(String(w.sim.collect('a').find((e) => e.id === id)?.facing));
  }
  check(seenE.size === 1, 'facing: an escort on a wobbling diagonal sends one view, no flicker', [...seenE].join(','));
}
