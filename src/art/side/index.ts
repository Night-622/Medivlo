/**
 * Side-view hero frames (Claude 5, Phase 1 prototype): profile frames facing RIGHT for a hero look, 32×40 with the
 * front frames' pivot (bottom centre, origin (0.5, 38/40)); left is flipX. idle = 2 frames (breath), walk = 4
 * (contact, pass, contact, pass). Layer order, back to front: far leg, cloak/cape + back hair + far arm, body
 * (torso, near leg, head, hair), headgear, far-arm item (shield), near arm, held item. Each layer gets the ink
 * outline, as art.js does for the front.
 */
import { M, palette, type Look } from './mvApi';
import { drawHead, drawHair } from './head';
import { sampleBody, drawTorso, drawLegs, drawArm, armSwing, drawBack, drawCape, type BodySample, type Phase } from './body';
import { SIDE, squeezedHead } from './gear';

const samples = new Map<string, BodySample>();
const sampleKey = (L: Look) => [L.cls, L.skin, L.body, L.dye, L.chest, L.hands, L.feet, L.neck, L.extra].join(':');

/** One side frame. `dy` lifts the upper body (breathing / the pass bob) while the feet stay planted. */
export function sideFrame(L: Look, phase: Phase, dy: number): HTMLCanvasElement {
  const mv = M(), G = mv.G, P = palette(L), gear = SIDE[L.cls] ?? {};
  let S = samples.get(sampleKey(L));
  if (!S) { S = sampleBody(L); samples.set(sampleKey(L), S); }
  const C = mv.HERO[L.cls], hatOn = !L.nohat && L.headw !== 1 && !!C?.head;
  const capped = hatOn && !gear.open && !C?.open;
  const hold = gear.held ? gear.hold ?? 0 : 0;
  const layer = (draw: (g: ReturnType<typeof G>) => void) => { const g = G(32, 40); draw(g); mv.outline(g.c); return g.c; };
  // on contact the upper body leans 1 px into the step
  const lean = phase === 'a' || phase === 'b' ? 1 : 0;
  const out = G(32, 40), lift = (c: HTMLCanvasElement) => out.x.drawImage(c, lean, dy), plant = (c: HTMLCanvasElement) => out.x.drawImage(c, 0, 0);

  plant(layer((g) => drawLegs(g, S!, phase, 'far')));
  lift(layer((g) => {
    if (L.cape) drawCape(g, L.cape, phase, 0); else drawBack(g, S!, phase, 0);
    drawHair(g, L, P, 'back', capped);
    drawArm(g, S!, armSwing(phase, 'far'), 0, true);
  }));
  // body: torso and head ride the bob, the near leg stays planted; one silhouette, one outline
  const body = G(32, 40), upper = G(32, 40);
  drawTorso(upper, S, 0);
  drawHead(upper, L, P);
  drawHair(upper, L, P, 'cap', capped);
  if (dy < 0) body.x.drawImage(upper.c, 0, 33, 32, 4, lean, 33, 32, 4);
  body.x.drawImage(upper.c, lean, dy);
  drawLegs(body, S, phase, 'near');
  mv.outline(body.c);
  plant(body.c);
  if (hatOn) {
    if (gear.head) lift(layer((g) => gear.head!(g, P)));
    else { const sq = squeezedHead(L.cls, P); if (sq) lift(layer((g) => g.img(sq))); }
  }
  if (gear.farHeld) lift(layer((g) => gear.farHeld!(g, P, armSwing(phase, 'far'), phase)));
  const swing = hold ? hold : armSwing(phase, 'near');
  lift(layer((g) => drawArm(g, S!, swing, 0, false)));
  if (gear.held) lift(layer((g) => gear.held!(g, P, hold, phase)));
  return out.c;
}

/** Side frames for a hero name or look: 'idle' (2) or 'walk' (4). */
export function sideFrames(look: string | Look, anim: 'idle' | 'walk'): HTMLCanvasElement[] {
  const L = typeof look === 'string' ? M().heroLook(look) : look;
  if (!L) return [];
  return anim === 'walk'
    ? [sideFrame(L, 'a', 0), sideFrame(L, 'pass', -1), sideFrame(L, 'b', 0), sideFrame(L, 'pass2', -1)]
    : [sideFrame(L, 'idle', 0), sideFrame(L, 'idle', -1)];
}
