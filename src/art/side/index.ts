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
import { SIDE_HELM, OPEN_SIDE_HELM, SIDE_ALT } from './shared/helms';
import { SIDE_WEAPON, WEAPON_HOLD } from './shared/weapons';
import { SIDE_NECK, SIDE_FACE, SIDE_EXTRA } from './shared/accessories';

const samples = new Map<string, BodySample>();
const sampleKey = (L: Look) => [L.cls, L.skin, L.body, L.dye, L.chest, L.hands, L.feet, L.neck, L.extra].join(':');

/** One side frame. `dy` lifts the upper body (breathing / the pass bob) while the feet stay planted. */
export function sideFrame(L: Look, phase: Phase, dy: number): HTMLCanvasElement {
  const mv = M(), G = mv.G, P = palette(L), gear = SIDE[L.cls] ?? {}, GEAR = mv.GEAR;
  let S = samples.get(sampleKey(L));
  if (!S) { S = sampleBody(L); samples.set(sampleKey(L), S); }
  const C = mv.HERO[L.cls];
  // headgear, as the paperdoll picks it (gear.js heroFrameX): helm set > alt headwear (headw 2) > class hat; nohat hides all
  const helm = L.helm && GEAR ? GEAR.SETS[L.helm - 1] : null;
  let headDraw: ((g: ReturnType<typeof G>) => void) | null = null, open = false;
  if (helm && SIDE_HELM[helm.helm]) { headDraw = (g) => SIDE_HELM[helm.helm](g, helm); open = OPEN_SIDE_HELM.has(helm.helm); }
  else if (!L.nohat) {
    if (L.headw === 2 && GEAR) { const alt = SIDE_ALT[GEAR.kitOf(L.cls).alt]; if (alt) { headDraw = (g) => alt.draw(g); open = alt.open; } }
    else if (L.headw !== 1 && C?.head) {
      const sq = gear.head ? null : squeezedHead(L.cls, P);
      headDraw = (g) => { if (gear.head) gear.head(g, P); else if (sq) g.img(sq); };
      open = !!gear.open || !!C.open;
    }
  }
  const capped = !!headDraw && !open;
  // an equipped weapon replaces the class's held items (front: WHELD instead of wf/wb), the shield included
  const wp = L.weapon && GEAR ? GEAR.WEAPONS[L.weapon - 1] : null, wfn = wp ? SIDE_WEAPON[wp.type] : undefined;
  const held = wfn ? (g: ReturnType<typeof G>, hand: number) => wfn(g, P, wp!.mat, hand, phase) : gear.held ? (g: ReturnType<typeof G>, hand: number, sw: number) => gear.held!(g, P, hand, phase, sw) : null;
  const farHeld = wfn ? null : gear.farHeld ?? null;
  const hold = wfn ? WEAPON_HOLD[wp!.type] ?? 4 : gear.held ? gear.hold ?? 0 : 0;
  const layer = (draw: (g: ReturnType<typeof G>) => void) => { const g = G(32, 40); draw(g); mv.outline(g.c); return g.c; };
  // on contact the upper body leans 1 px into the step
  const lean = phase === 'a' || phase === 'b' ? 1 : 0;
  const out = G(32, 40), lift = (c: HTMLCanvasElement) => out.x.drawImage(c, lean, dy), plant = (c: HTMLCanvasElement) => out.x.drawImage(c, 0, 0);

  plant(layer((g) => drawLegs(g, S!, phase, 'far')));
  lift(layer((g) => {
    // a worn cape replaces the class back gear; a class's own `back` replaces the sampled cloak unless keepCloak
    if (L.cape) drawCape(g, L.cape, phase, 0);
    else if (!L.chest) { // a chest set replaces the class's back gear, as in front
      if (!gear.back || gear.keepCloak) drawBack(g, S!, phase, 0);
      if (gear.back) gear.back(g, P, phase);
    }
    drawHair(g, L, P, 'back', capped);
    drawArm(g, S!, armSwing(phase, 'far'), 0, true);
  }));
  // body: torso and head ride the bob, the near leg stays planted; one silhouette, one outline
  const body = G(32, 40), upper = G(32, 40);
  drawTorso(upper, S, 0);
  drawHead(upper, L, P);
  drawHair(upper, L, P, 'cap', capped);
  // worn accessories join the body's silhouette (as in the front composer)
  SIDE_NECK[L.neck ?? 0]?.(upper); SIDE_FACE[L.face ?? 0]?.(upper); SIDE_EXTRA[L.extra ?? 0]?.(upper);
  if (dy < 0) body.x.drawImage(upper.c, 0, 33, 32, 4, lean, 33, 32, 4);
  body.x.drawImage(upper.c, lean, dy);
  drawLegs(body, S, phase, 'near');
  mv.outline(body.c);
  plant(body.c);
  if (headDraw) lift(layer(headDraw));
  if (farHeld) lift(layer((g) => farHeld(g, P, armSwing(phase, 'far'), phase)));
  const swing = hold ? hold : armSwing(phase, 'near');
  lift(layer((g) => drawArm(g, S!, swing, 0, false)));
  if (held) lift(layer((g) => held(g, hold, swing)));
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
