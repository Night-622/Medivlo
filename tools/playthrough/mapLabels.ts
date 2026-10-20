/**
 * Map label layout check (Claude 2, Claude 1's player's-eye map pass): replays MapScreen's label placement for every
 * school realm and Morvane in Node, with every optional area found (the most labels a map can carry), and reports
 * labels that land on a marker or on another label (MapLabels places them anyway when every spot is taken).
 * Text width is estimated (the caption font is ~6.2 px a character); the browser screenshots confirm.
 *   ENTRY=tools/playthrough/checks.ts OUT=<file> node tools/playthrough/build.mjs && node <file> labels
 */
import { Game, Registry, createNewGameState } from '@/core';
import { REALM_OVERVIEW_STEP, mapMarkers, realmOverview } from '@/world/hc/overview';
import { REALMS } from '@/world/hc/spaces';
import { capFirst, pickLabelSpot, type Box, type LabelArea } from '@/ui/map/labelSpot';
import { merchantsIn } from '@/ui/map/questMarks';

const MX = 48, MY = 136, MW = 864, MH = 544, TILE = 32;
const CHAR_W = 6.2, PILL_H = 20;
const size = (name: string): [number, number] => [Math.ceil(capFirst(name).length * CHAR_W) + 10, PILL_H];

Game.set(createNewGameState());
Registry.load();

let bad = 0, total = 0;
for (const space of [...REALMS.filter((r) => r.school).map((r) => r.space), 'concordia']) {
  let toScreen: (tx: number, ty: number) => [number, number];
  let area: LabelArea = { bounds: [MX, MY, MW, MH] };
  if (space === 'concordia') toScreen = (tx, ty) => [MX + (tx / 4) * 2, MY + (ty / 4) * 2];
  else {
    const ov = realmOverview(space), scale = Math.min(MW / ov.w, MH / ov.h);
    const ox = MX + (MW - ov.w * scale) / 2, oy = MY + (MH - ov.h * scale) / 2;
    toScreen = (tx, ty) => [ox + (tx / REALM_OVERVIEW_STEP) * scale, oy + (ty / REALM_OVERVIEW_STEP) * scale];
    area = { ...area, road: (x, y) => { const px = Math.floor((x - ox) / scale), py = Math.floor((y - oy) / scale); return px >= 0 && py >= 0 && px < ov.w && py < ov.h && ov.road[py * ov.w + px] === 1; } };
  }
  const taken: Box[] = [];
  const block = (x: number, y: number, r = 9) => taken.push([x - r, y - r, r * 2, r * 2]);
  const names: { x: number; y: number; name: string; below: boolean }[] = [];
  for (const m of mapMarkers(space)) {
    const [x, y] = toScreen(m.at[0], m.at[1]);
    if (m.kind !== 'zone') block(x, y);
    if (m.kind === 'zone' && space !== 'concordia') names.push({ x, y, name: m.name, below: false });
    else if (m.kind === 'optional') names.push({ x, y, name: m.name, below: true });
  }
  for (const mc of merchantsIn(space)) { const [x, y] = toScreen(mc.x / TILE, mc.y / TILE); block(x, y, 8); }
  const hits: string[] = [];
  for (const n of names) {
    total++;
    const [w, h] = size(n.name);
    const { box, overlap } = pickLabelSpot(taken, area, n.x, n.y, w, h, n.below);
    if (overlap) hits.push(`"${capFirst(n.name)}" at ${Math.round(n.x)},${Math.round(n.y)}`);
    taken.push(box);
  }
  bad += hits.length;
  console.log(`${hits.length ? 'OVERLAP' : 'ok     '} ${space.padEnd(15)} ${names.length} labels${hits.length ? `: ${hits.join(' · ')}` : ''}`);
}
console.log(bad ? `labels: ${bad}/${total} map labels overlap a marker or another label` : `labels: all ${total} map labels clear of markers and each other`);
if (bad) process.exitCode = 1;
