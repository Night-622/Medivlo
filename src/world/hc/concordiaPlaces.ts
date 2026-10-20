/**
 * Concordia places for Claude 4's Act II (docs/lore/hollow-crown/09-concordia-spec.md "Places and objects for
 * Claude 2"): village place landmarks at their buildings, Brindlecross's extra places, the barrow, the
 * Gloamwood/Abbeyshore/road set pieces. Positions are searched near an anchor for free ground. Pure.
 */
import { MAGIC_SCHOOLS, MARTIAL_SCHOOLS, TILE_SIZE, type WorldObject } from '@/core';
import { Corner } from './autotile';
import { artSize } from './footprints';
import { SENTINELS } from '@/data/regions/hc/sentinels';
import { CONCORDIA_EXTRA, type ConcordiaExtra } from '@/data/regions/hc/setPiecesExtra';
import type { Polyline, VillageDef, WaystoneDef } from './types';
import { type Placement, slug, villageOrigin, villagePlacements } from './village';

type P2 = [number, number];
type Rect = [number, number, number, number];

export interface PlacesHost {
  villages: VillageDef[];
  waystones: WaystoneDef[];
  river: Polyline;
  lake: { cx: number; cy: number; rx: number; ry: number };
  regionAt(tx: number, ty: number): string;
  cornerAt(tx: number, ty: number): number;
  /** free ground for a w×h box at top-left (tx, ty): no water/cliff, village, road, lake or taken tiles */
  free(tx: number, ty: number, w: number, h: number, inHeart?: boolean): boolean;
  /** keep a rect clear of scatter (and optionally pave it) */
  keep(r: Rect, pave?: boolean): void;
  put(p: Placement): void;
  obj(o: WorldObject): void;
  /** where an object placed elsewhere (by the generator itself) stands */
  find(id: string): P2 | null;
  /** an `area:` trigger zone (travel banter on a walk): a circle the region lookup returns */
  area?(id: string, at: P2, r: number): void;
}

/** Place-label slugs Claude 4 shortened. */
const ALIAS: Record<string, string> = { 'chapel-of-the-drowned-bell': 'chapel', 'cinderwick-mill': 'mill', 'shore-chapel': 'chapel', 'old-fish-mill': 'fish-mill' };
export const placeSlug = (label: string): string => {
  const s = slug(label).replace(/^the-/, '');
  return ALIAS[s] ?? s;
};

const tile = (px: number) => Math.floor(px / TILE_SIZE);

export function placeConcordiaPlaces(host: PlacesHost): void {
  // remember where everything lands (landmark rects, object tiles) so campaign extras can anchor to it
  const at = new Map<string, P2>();
  const h: PlacesHost = {
    ...host,
    obj: (o) => {
      const [w, hh] = o.size ?? [1, 1];
      at.set(o.id, o.id.startsWith('landmark:') ? [o.at[0] + (w >> 1), o.at[1] + hh] : o.at);
      host.obj(o);
    },
  };
  for (const w of h.waystones) at.set(w.id, [w.at[0], w.at[1] + 1]);
  for (const v of h.villages) villagePlaces(h, v);
  brindlecross(h);
  elsewhere(h);
  sentinels(h);
  heart(h);
  const used = new Map<string, number>();
  // extras may anchor on other extras later in the list: place what can be placed, then retry the rest until
  // nothing more resolves (list order doesn't matter)
  let pending = [...CONCORDIA_EXTRA];
  const triggers: P2[] = [];
  for (let pass = 0; pending.length && pass < 8; pass++) {
    const later: typeof pending = [];
    for (const x of pending) if (!placeExtra(x)) later.push(x);
    if (later.length === pending.length) break;
    pending = later;
  }
  for (const x of pending) console.warn(`[world] ${x.id}: no ${x.near}`);

  function placeExtra(x: ConcordiaExtra): boolean {
    // trigger zones: halfway between two places (`near: 'a+b'`) or round one
    if (x.id.startsWith('area:')) {
      const ends = x.near.split('+').map((n) => at.get(n) ?? h.find(n));
      if (ends.some((e) => !e)) return false;
      // (dx, dy) shifts the centre, e.g. to where a walk first crosses into a region
      let c: P2 = [Math.round(ends.reduce((a, e) => a + e![0], 0) / ends.length) + (x.dx ?? 0), Math.round(ends.reduce((a, e) => a + e![1], 0) / ends.length) + (x.dy ?? 0)];
      // two classes' banter on the same road: slide along it so walking the road crosses both
      const dir = ends.length > 1 ? norm(ends[1]![0] - ends[0]![0], ends[1]![1] - ends[0]![1]) : [1, 0];
      for (let k = 1; triggers.some((t) => Math.hypot(t[0] - c[0], t[1] - c[1]) < 6) && k < 6; k++) {
        const step = (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 9;
        c = [Math.round(c[0] + dir[0] * step), Math.round(c[1] + dir[1] * step)];
      }
      triggers.push(c);
      h.area?.(x.id, c, 8);
      return true;
    }
    const a0 = at.get(x.near) ?? h.find(x.near);
    if (!a0) return false;
    // without an explicit offset, extras on the same anchor fan out left and right
    const k = used.get(x.near) ?? 0;
    used.set(x.near, k + 1);
    const fan = x.dx === undefined && x.dy === undefined ? (k % 2 ? -((k + 1) >> 1) : k >> 1) : 0;
    const p: P2 = [a0[0] + (x.dx ?? 0) + fan, a0[1] + (x.dy ?? 0)];
    if (x.id.startsWith('landmark:')) h.obj({ id: x.id, kind: 'trigger', at: [p[0] - 2, p[1] - 1], size: [4, 3], props: { name: x.name, label: x.name, landmark: true } });
    else h.obj({ id: x.id, kind: 'interactable', at: p, props: { name: x.name, label: x.label ?? 'Examine' }, ...(x.when ? { when: x.when } : {}) });
    return true;
  }
}

function norm(x: number, y: number): [number, number] { const d = Math.hypot(x, y) || 1; return [x / d, y / d]; }

/** One landmark per village building (door-front rect) and the NPC anchor at its door. */
function villagePlaces(h: PlacesHost, v: VillageDef): void {
  const pl = villagePlacements(v);
  v.places.forEach((p, i) => {
    const b = pl.find((x) => x.key === `${v.id}#${i}`);
    if (!b) return;
    const s = artSize(b.art);
    const id = `landmark:${v.id.slice(4)}-${placeSlug(p[1])}`;
    const door: P2 = [tile(b.x), tile(b.y - 1) + 1];
    h.obj({ id, kind: 'trigger', at: [tile(b.x - s.w / 2), door[1] - 2], size: [Math.ceil(s.w / TILE_SIZE), 4], props: { name: p[1], label: p[1], landmark: true } });
    if (p[3]) h.obj({ id: `npc-anchor:${p[3]}`, kind: 'npc-anchor', at: [door[0] + 1, door[1]], props: { npc: `npc:${p[3]}`, landmark: id } });
  });
}

/** Find a free w×h box on rings around (x, y); returns its top-left. */
function near(h: PlacesHost, at: P2, w: number, hh: number, r0 = 0, inHeart = false): P2 | null {
  for (let r = r0; r < r0 + 40; r++) {
    const n = Math.max(1, Math.round(r * 6));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const tx = Math.round(at[0] + Math.cos(a) * r - w / 2), ty = Math.round(at[1] + Math.sin(a) * r - hh / 2);
      if (h.free(tx, ty, w, hh, inHeart)) return [tx, ty];
    }
  }
  return null;
}

/** A landmark rect with optional props scattered in it and an object at its centre. */
/** Set-piece names as the quests call them (the id-derived names read "Camp", "Court", "Stairs Top") */
const PIECE_NAMES: Record<string, string> = {
  'landmark:stone-court': 'The Stone Court', 'landmark:barrow-door': 'The Barrow Door', 'landmark:berenika-shrine': 'Berenika’s Shrine',
  'landmark:heart-camp': 'The Heart Camp', 'landmark:legion-camp': 'The Legion Camp', 'landmark:twelve-stairs': 'The Twelve Stairs',
  'landmark:twelve-stairs-top': 'The Top of the Twelve Stairs', 'landmark:shore-boat': 'Aldous’s Boat', 'landmark:abbey-north-door': 'The Abbey’s North Door',
  'landmark:brind-graveyard': 'Brindlecross Graveyard', 'landmark:road-bandit-camp': 'The Bandit Camp', 'landmark:brind-pip-home': 'Pip’s Home',
};

function setPiece(h: PlacesHost, id: string, at: P2, w: number, hh: number, props: [string, number, number][], obj?: { id: string; kind?: WorldObject['kind']; label: string; extra?: WorldObject['props'] }, pave = false, inHeart = false): P2 | null {
  const tl = near(h, at, w, hh, 0, inHeart);
  if (!tl) { console.warn(`[world] no room for ${id}`); return null; }
  const [x, y] = tl;
  h.keep([x, y, w, hh], pave);
  const name = PIECE_NAMES[id] ?? id.replace(/^landmark:[a-z]+-/, '').split('-').map((s) => s[0].toUpperCase() + s.slice(1)).join(' ');
  h.obj({ id, kind: 'trigger', at: [x, y], size: [w, hh], props: { name, label: name, landmark: true } });
  for (const [art, dx, dy] of props) h.put({ art, x: (x + dx) * TILE_SIZE + 16, y: (y + dy) * TILE_SIZE + 28, key: `${id}:${art}:${dx},${dy}` });
  if (obj) h.obj({ id: obj.id, kind: obj.kind ?? 'interactable', at: [x + Math.floor(w / 2), y + hh - 1], props: { name, label: obj.label, ...obj.extra } });
  return tl;
}

function brindlecross(h: PlacesHost): void {
  const v = h.villages.find((x) => x.id === 'vil:brind');
  if (!v) return;
  const [ox, oy] = villageOrigin(v);
  const ws = h.waystones.find((w) => w.id === 'ws:brind');
  // inside the village: the well, the green, the east gate, the waystone, the Goose's bed
  h.obj({ id: 'landmark:brind-well', kind: 'trigger', at: [ox + 10, oy + 6], size: [4, 4], props: { name: 'The Well', landmark: true } });
  h.obj({ id: 'obj:brind-well', kind: 'interactable', at: [ox + 11, oy + 9], props: { name: 'The Well', label: 'Draw water' } });
  h.obj({ id: 'landmark:brind-green', kind: 'trigger', at: [ox + 5, oy + 8], size: [5, 4], props: { name: 'The Green', landmark: true } });
  h.obj({ id: 'landmark:brind-east-gate', kind: 'trigger', at: [ox + 21, oy + 5], size: [3, 4], props: { name: 'The East Gate', landmark: true } });
  if (ws) h.obj({ id: 'landmark:brind-waystone', kind: 'trigger', at: [ws.at[0] - 1, ws.at[1] - 1], size: [3, 3], props: { name: 'The Waystone', landmark: true } });
  const goose = villagePlacements(v).find((p) => p.key === 'vil:brind#0');
  if (goose) h.obj({ id: 'obj:brind-goose-bed', kind: 'interactable', at: [tile(goose.x) - 1, tile(goose.y - 1) + 1], props: { name: 'A warm bed at the Goose', label: 'Rest', rest: true } });
  // outside: the graveyard by the chapel (south-east), Pip's home (west), the Stone Court (south)
  const graves: [string, number, number][] = [[`f_runestone`, 0, 0], ['f_runestone', 2, 0], ['f_runestone', 4, 1], ['f_runestone', 1, 2], ['f_runestone', 3, 3], ['d_bones', 5, 3]];
  setPiece(h, 'landmark:brind-graveyard', [ox + 28, oy + 11], 6, 5, graves, { id: 'obj:brind-empty-grave', label: 'Look into the grave' });
  setPiece(h, 'landmark:brind-pip-home', [ox - 5, oy + 10], 4, 4, [['b_house_tall', 1, 3]]);
  const court = setPiece(h, 'landmark:stone-court', [ox + 12, oy + 19], 9, 6,
    [['f_runestone', 0, 0], ['f_runestone', 8, 0], ['f_runestone', 0, 5], ['f_runestone', 8, 5], ['d_altar', 4, 2]], undefined, true);
  if (!court) h.obj({ id: 'landmark:stone-court', kind: 'trigger', at: [ox + 10, oy + 6], size: [4, 2], props: { name: 'The Stone Court', landmark: true } });
}

/** First tile along a→b (from a) that satisfies pred. */
function along(a: P2, b: P2, pred: (x: number, y: number) => boolean): P2 {
  const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]));
  for (let i = 0; i <= n; i++) {
    const x = Math.round(a[0] + ((b[0] - a[0]) * i) / n), y = Math.round(a[1] + ((b[1] - a[1]) * i) / n);
    if (pred(x, y)) return [x, y];
  }
  return b;
}

function elsewhere(h: PlacesHost): void {
  const vil = (id: string) => h.villages.find((v) => v.id === id)?.at;
  const ws = (id: string) => h.waystones.find((w) => w.id === id)?.at;
  const brind = vil('vil:brind'), lodge = vil('vil:lodge'), shore = vil('vil:shore'), coach = vil('vil:coach');
  // Aldermoor: Bonelord Varric's barrow on the moor west of Brindlecross
  if (brind) {
    setPiece(h, 'landmark:barrow-door', [brind[0] - 64, brind[1] - 24], 5, 4, [['rc:umbral:f_ruin_arch', 2, 2], ['f_runestone', 0, 3], ['f_runestone', 4, 3]],
      { id: 'obj:barrow-door', kind: 'door', label: 'Enter the barrow', extra: { target: 'inst:varric-barrow', entrance: 'main' } });
  }
  // Gloamwood: wolf tracks where the path from Brindlecross enters the wood; the White Stag's glade by ws:glade
  if (brind && lodge) {
    // 10 tiles past the wood's edge, beside the path
    const edge = along(brind, lodge, (x, y) => h.regionAt(x, y) === 'region:gloam');
    const d = Math.hypot(lodge[0] - brind[0], lodge[1] - brind[1]);
    const inWood: P2 = [Math.round(edge[0] + ((lodge[0] - brind[0]) / d) * 10), Math.round(edge[1] + ((lodge[1] - brind[1]) / d) * 10)];
    setPiece(h, 'landmark:gloam-wolf-tracks', inWood, 4, 3, [['d_bones', 1, 1], ['f_fern', 3, 2]], { id: 'obj:gloam-wolf-tracks', label: 'Study the tracks' });
  }
  const glade = ws('ws:glade');
  if (glade) setPiece(h, 'landmark:gloam-stag-glade', [glade[0] + 6, glade[1] - 4], 6, 5, [['f_toadstool', 0, 1], ['f_fern', 5, 0], ['f_runestone', 3, 2]], { id: 'obj:gloam-stag-glade', label: 'Kneel' });
  // Abbeyshore: the ferry rail at the Ferry House, Aldous's boat on the lake shore
  if (shore) {
    const [ox, oy] = villageOrigin(h.villages.find((v) => v.id === 'vil:shore')!);
    h.obj({ id: 'obj:shore-ferry-rail', kind: 'interactable', at: [ox + 22, oy + 7], props: { name: 'Ferry rail', label: 'Ring for the ferry' } });
    const water = along([ox + 12, oy + 7], [ox + 60, oy - 20], (x, y) => h.cornerAt(x, y) === Corner.WATER);
    setPiece(h, 'landmark:shore-boat', [water[0] - 3, water[1] + 2], 3, 2, [['v_cart', 1, 1]], { id: 'obj:shore-boat', label: 'Board the boat' });
  }
  // the mouth of the Wend: reeds where the river meets the lake
  const mouth = h.river[h.river.length - 1] as P2;
  if (mouth) setPiece(h, 'landmark:shore-reed-bed', [mouth[0] - 6, mouth[1] + 6], 4, 3, [['f_fern', 0, 0], ['f_fern', 2, 1], ['f_fern', 3, 0], ['f_fern', 1, 2]], { id: 'obj:shore-reed-bed', label: 'Search the reeds' });
  // Gildport: three coils at the top of the Clocktower; Berenika's shrine (the old Iron embassy) in the Ruins
  const gildV = h.villages.find((v) => v.id === 'vil:gild');
  if (gildV) {
    const i = gildV.places.findIndex((p) => p[1] === 'Clocktower');
    const tower = villagePlacements(gildV).find((p) => p.key === `vil:gild#${i}`);
    if (tower) {
      const tx = tile(tower.x), ty = tile(tower.y - 1);
      [-1, 0, 1].forEach((dx, k) => h.obj({ id: `obj:gild-tower-coil-${k + 1}`, kind: 'interactable', at: [tx + dx, ty + 1], props: { name: 'Clockwork coil', label: 'Wind the coil' } }));
    }
    setPiece(h, 'landmark:berenika-shrine', [gildV.at[0] + 26, gildV.at[1] + 26], 4, 3, [['rc:iron:d_altar', 2, 2], ['d_candelabra', 0, 2], ['d_candelabra', 3, 2]],
      { id: 'obj:berenika-shrine', label: 'Kneel at the shrine' });
  }
  // Morvane Road: a bandit camp past the Old Coach Inn
  if (coach) setPiece(h, 'landmark:road-bandit-camp', [coach[0] + 56, coach[1] + 18], 7, 5, [['v_cart', 1, 1], ['v_barrels', 4, 0], ['v_crates', 5, 3], ['f_log', 2, 4], ['v_haystack', 0, 3]]);
}

/** Sentinel lair entrances, Ashmaw's breath-vents round Kilnmouth, and the Drowned Abbey's north door. */
function sentinels(h: PlacesHost): void {
  for (const s of SENTINELS) {
    setPiece(h, `landmark:sentinel-${s.school}`, s.near, 5, 4, [[`rc:${s.palette}:f_ruin_arch`, 2, 3], ['f_runestone', 0, 3], ['f_runestone', 4, 3]],
      { id: `obj:sentinel-${s.school}-door`, kind: 'door', label: 'Enter', extra: { target: s.inst, name: s.name } });
  }
  const kiln = h.villages.find((v) => v.id === 'vil:kiln')?.at;
  if (kiln) {
    ([[-22, -6], [18, -12], [4, 16]] as P2[]).forEach(([dx, dy], i) => {
      setPiece(h, `landmark:ashmaw-vent-${i + 1}`, [kiln[0] + dx, kiln[1] + dy], 2, 2, [['rc:ash:d_crystal', 1, 1]], { id: `obj:ashmaw-vent-${i + 1}`, label: 'Listen at the vent' });
    });
  }
  // "the north door at low water": the drowned nave's door on the lake's north shore
  const L = h.lake;
  setPiece(h, 'landmark:abbey-north-door', [L.cx, L.cy - L.ry - 5], 5, 4, [['d_arch', 2, 3], ['d_kelp', 0, 3], ['d_kelp', 4, 2]],
    { id: 'obj:abbey-north-door', kind: 'door', label: 'Wade in', extra: { target: 'inst:drowned-abbey', name: 'The north door' } });
}

/** Act III, the Heart of Morvane (Claude 4): the bearers' camp outside the Weeping Wall, then up the processional way. */
function heart(h: PlacesHost): void {
  // the gate in the Weeping Wall, where the processional way enters the Heart (shut until story.heart_open)
  const gate = along([806, 300], [840, 222], (x, y) => h.regionAt(x, y) === 'region:heart');
  h.put({ art: 'rc:umbral:c_gate', x: gate[0] * TILE_SIZE + 16, y: (gate[1] + 1) * TILE_SIZE, key: 'weeping-wall-gate' });
  h.obj({ id: 'landmark:weeping-wall', kind: 'trigger', at: [gate[0] - 4, gate[1] - 1], size: [9, 4], props: { name: 'The Weeping Wall', landmark: true } });
  h.obj({ id: 'obj:weeping-wall-gate', kind: 'interactable', at: [gate[0], gate[1] + 2], props: { name: 'The Weeping Wall', label: 'Touch the wall' } });
  setPiece(h, 'landmark:heart-camp', [798, 270], 8, 5, [['rc:umbral:b_stables', 2, 4], ['v_cart', 6, 1], ['v_barrels', 0, 1], ['f_log', 5, 4]]);
  const legion = setPiece(h, 'landmark:legion-camp', [830, 232], 9, 6, [['rc:umbral:b_stables', 1, 3], ['rc:umbral:b_stables', 7, 3], ['v_weapon_rack', 4, 0]],
    { id: 'obj:legion-cages', label: 'Open the cages' }, false, true);
  if (legion) {
    const [x, y] = legion;
    h.obj({ id: 'obj:legion-reavers', kind: 'interactable', at: [x + 1, y + 1], props: { name: 'A rank of hollowed Reavers', label: 'Look' } });
    h.put({ art: 'd_pew', x: (x + 8) * 32 + 16, y: (y + 5) * 32 + 28, key: 'heart-bell-log' });
    h.obj({ id: 'obj:heart-bell-log', kind: 'interactable', at: [x + 8, y + 6], props: { name: 'A ruined lectern', label: 'Read the log' } });
  }
  // the Twelve Stairs: twelve school stones side by side at the foot, the nemesis waits at the top
  const foot = setPiece(h, 'landmark:twelve-stairs', [852, 212], 14, 3, [], undefined, true, true);
  if (foot) {
    [...MAGIC_SCHOOLS, ...MARTIAL_SCHOOLS].forEach((s, i) => {
      const x = foot[0] + 1 + i, y = foot[1] + 1;
      h.put({ art: `rc:${s}:f_runestone`, x: x * 32 + 16, y: y * 32 + 28, key: `heart-stair-${s}` });
      h.obj({ id: `obj:heart-stair-${s}`, kind: 'interactable', at: [x, y + 1], props: { name: `The ${s[0].toUpperCase()}${s.slice(1)} stair`, label: 'Climb', school: s } });
    });
  }
  const top = setPiece(h, 'landmark:twelve-stairs-top', [862, 198], 8, 5, [['f_runestone', 0, 0], ['f_runestone', 7, 0]],
    { id: 'obj:heart-peace-axe-stone', label: 'Kneel at the crack' }, true, true);
  // each hero's nemesis (Act III form, by the hero's class) waits at the top of the stairs
  if (top) h.obj({ id: 'boss:heart-nemesis', kind: 'trigger', at: top, size: [8, 5], when: { flag: 'story.heart_open' }, props: { boss: 'class:act3', level: 32, x: top[0] + 4, y: top[1] + 1 } });
}
