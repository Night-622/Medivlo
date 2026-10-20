/**
 * Places Claude 4's landmarks and set-piece objects (src/data/regions/hc/landmarks.ts) in a school realm:
 * around their zone centre, beside their lair entrance, or by the realm gate. Deterministic: the first free
 * spot on rings around the anchor. Lair-interior pieces (half-stones, relics) are returned for the lair
 * instances instead of being placed outdoors. Pure.
 */
import { TILE_SIZE, type WorldObject } from '@/core';
import { hash32 } from './noise';
import { artSize } from './footprints';
import type { SetPieceDef } from './types';
import type { Placement } from './village';

type P2 = [number, number];

export interface SetPieceHost {
  school: string;
  /** anchor tile of `zone-N` / `lair-N` / `gate` for a side */
  anchor(side: 'capital' | 'frontier', where: string): P2 | null;
  /** can a w×h tile box with top-left (tx, ty) hold a set piece? */
  free(tx: number, ty: number, w: number, h: number, nearGate: boolean): boolean;
  put(p: Placement): void;
  obj(o: WorldObject): void;
  /** an `area:` trigger zone (travel banter, a bark on the way): a circle the region lookup returns */
  area?(id: string, at: P2, r: number): void;
  /** where an object the generator placed itself stands (village buildings, lair doors), for `near` */
  find?(id: string): P2 | null;
}

/** words a title keeps lowercase after its first word ("Hall of Held Hours") */
const SMALL = new Set(['of', 'the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'by', 'for', 'under', 'over']);
/**
 * Ids lose apostrophes: the possessives as the quest text spells them (the commoner form where both occur), keyed by
 * the word pair the id holds (Claude 2's map naming pass, scanning every quest and dialogue).
 */
const POSSESSIVE: Record<string, string> = {
  'bowyers post': 'bowyers’', 'champions bridge': 'champion’s', 'cowards cairn': 'coward’s', 'cutters camp': 'cutters’',
  'dancers stone': 'dancers’', 'elders yard': 'elders’', 'foscos bridge': 'fosco’s', 'gamekeepers lodge': 'gamekeeper’s',
  'keepers hut': 'keepers’', 'keepers lodge': 'keepers’', 'liars fork': 'liar’s', 'lions gate': 'lion’s', 'poachers camp': 'poachers’',
  'riders cairn': 'riders’', 'rills bridge': 'rill’s', 'ringers loft': 'ringers’', 'sals last': 'sal’s', 'sisters bridge': 'sisters’',
  'sorrows laughing': 'sorrow’s', 'thieves exchange': 'thieves’', 'tuttles pawn': 'tuttle’s', 'twins cart': 'twins’', 'twins door': 'twins’',
  'witchs belfry': 'witch’s',
};
const title = (id: string) => {
  const w = id.replace(/^[a-z]+:/, '').split('-').filter((x) => !/^\d+$/.test(x));
  return w.map((x, i) => {
    const word = POSSESSIVE[`${x} ${w[i + 1] ?? ''}`] ?? x;
    return i > 0 && SMALL.has(word) ? word : word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
};

/** Art for a set piece, by keyword (buildings take the realm recolour). */
export function setPieceArt(id: string, school: string): string {
  const s = id.replace(/^[a-z]+:/, '');
  const rc = (b: string) => `rc:${school}:${b}`;
  const rules: [RegExp, string][] = [
    [/halfstone|altar|throne|shrine/, 'd_altar'], [/gate-seal|crystal|lens/, 'd_crystal'], [/brazier|candle/, 'd_candelabra'],
    [/bell/, 'd_bell'], [/well/, 'v_well'], [/lamp|lantern/, 'v_lamp'], [/board|ladder|names-wall|notice/, 'v_noticeboard'],
    [/chapel|cloister|temple/, rc('b_chapel')], [/tower|observatory|spire|lighthouse|eyrie/, rc('c_tower')],
    [/keep|citadel|fort/, rc('c_keep')], [/gate$|-door$|mouth|stair|entrance|arch/, rc('f_ruin_arch')],
    [/stall|cart|kitchen|store|shop|exchange|pawn|market/, rc('b_stall')], [/tent|camp|stockade|kennels|stables|shed/, rc('b_stables')],
    [/hall|salle|dojo|theatre|archive|office|house|library|vault|foundry|forge|tannery|mews/, rc('b_training')],
    [/study|quarters|rooms|cell|hut|attic|lodge|steading|cottage|home/, rc('b_house_stone')],
    [/pine|tree|grove|oak/, 'f_gloamtree'], [/pond|spring|pool|bed|garden/, 'v_flowerbed'],
    [/cairn|stone|statue|marker|grave|tomb/, 'f_runestone'], [/wreck|ship|boat/, 'v_cart'],
  ];
  for (const [re, art] of rules) if (re.test(s)) return art;
  return id.startsWith('obj:') ? 'd_chest' : 'f_runestone';
}

/** Lair pieces that belong inside the lair instance rather than outdoors. */
export const isInterior = (p: SetPieceDef): boolean => p.where.startsWith('lair') && !/entrance|approach/.test(p.note);

/** Place every outdoor set piece of a realm; returns the interior ones keyed by lair instance id. */
export function placeSetPieces(host: SetPieceHost, pieces: SetPieceDef[]): Map<string, SetPieceDef[]> {
  const interior = new Map<string, SetPieceDef[]>();
  const placed = new Map<string, P2>();
  // anchored pieces (`near`) go after the pieces they stand beside
  const ordered = [...pieces.filter((p) => !p.near), ...pieces.filter((p) => p.near && !p.id.startsWith('area:')), ...pieces.filter((p) => p.near && p.id.startsWith('area:'))];
  for (const p of ordered) {
    const side = p.area.endsWith('-capital') ? 'capital' : 'frontier';
    if (isInterior(p)) {
      const inst = `inst:${host.school}-${side}-${p.where}`;
      if (!interior.has(inst)) interior.set(inst, []);
      interior.get(inst)!.push(p);
      continue;
    }
    // trigger zones: on the walk between two placed pieces (`near: 'a+b'`), beside one, or round the anchor
    if (p.id.startsWith('area:')) {
      const [a, b] = (p.near ?? '').split('+').map((n) => placed.get(n) ?? host.find?.(n) ?? undefined);
      const c: P2 | null = a && b ? [Math.round((a[0] + b[0]) / 2), Math.round((a[1] + b[1]) / 2)] : a ?? host.anchor(side, p.where);
      if (c) host.area?.(p.id, c, 6);
      continue;
    }
    // `near: 'a+b'`: halfway between two placed pieces (a stead roof between two steads)
    const ends = (p.near ?? '').split('+').filter(Boolean).map((n) => placed.get(n) ?? host.find?.(n) ?? null);
    const mid: P2 | null = ends.length && ends.every(Boolean) ? [Math.round(ends.reduce((n, e) => n + e![0], 0) / ends.length), Math.round(ends.reduce((n, e) => n + e![1], 0) / ends.length)] : null;
    const at = mid || host.anchor(side, p.where);
    if (!at) continue;
    const art = setPieceArt(p.id, host.school);
    const s = artSize(art);
    const w = Math.max(1, Math.ceil(s.w / TILE_SIZE)), h = Math.max(1, Math.ceil((s.h * 0.6) / TILE_SIZE));
    const spot = findSpot(host, p, at, w, h);
    if (!spot) { console.warn(`[world] no room for ${p.id} near ${p.where} of ${p.area}`); continue; }
    const [tx, ty] = spot;
    placed.set(p.id, [tx + (w >> 1), ty + h]);
    // bottom-centre of the art sits on the box's bottom edge
    const x = (tx + w / 2) * TILE_SIZE, y = (ty + h) * TILE_SIZE;
    host.put({ art, x, y, key: p.id });
    const name = title(p.id);
    const front: P2 = [Math.floor(x / TILE_SIZE), ty + h];
    if (p.id.startsWith('landmark:')) {
      host.obj({ id: p.id, kind: 'trigger', at: [tx - 1, ty - 1], size: [w + 2, h + 3], props: { name, label: name, landmark: true } });
    } else {
      host.obj({ id: p.id, kind: 'interactable', at: front, props: { name, label: 'Examine' } });
    }
  }
  return interior;
}

function findSpot(host: SetPieceHost, p: SetPieceDef, at: P2, w: number, h: number): P2 | null {
  const zone1 = p.where === 'zone-1';
  const r0 = p.near ? 2 : zone1 ? 16 : p.where === 'gate' ? 7 : p.where.startsWith('lair') ? 4 : 5;
  const turn = (hash32(at[0], at[1], p.id.length) % 360) * (Math.PI / 180);
  for (let r = r0; r < r0 + 26; r += 2) {
    const steps = Math.max(8, Math.round(r * 1.5));
    for (let i = 0; i < steps; i++) {
      const a = turn + (i / steps) * Math.PI * 2;
      const tx = Math.round(at[0] + Math.cos(a) * r - w / 2), ty = Math.round(at[1] + Math.sin(a) * r * 0.75 - h / 2);
      if (host.free(tx - 1, ty - 1, w + 2, h + 3, p.where === 'gate')) return [tx, ty];
    }
  }
  return null;
}
