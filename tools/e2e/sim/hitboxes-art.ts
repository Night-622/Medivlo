/**
 * Body radius vs art (Claude 3 helper): sim body diameter against the visible (alpha-trimmed) width of frame 0 of
 * the sprite actually drawn. Report only: never fails. Exported sheets (public/art/atlas.json → PNG) are measured;
 * code-drawn realm creatures (MV.addBeast, no PNG) use their arch/tier frame size × the median trimmed ratio of
 * measured sheets of the same arch, marked "est".
 */
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { inflateSync } from 'zlib';
import { CLASS_SCHOOL } from '@/core/constants';
import { allCreatures, creature, type CreatureDef } from '@/systems/rules/creatures';
import { check, World } from './hitboxes-harness';

interface Sheet { file: string; frameWidth: number; frameHeight: number; tier?: string; body?: string }
interface Atlas { heroes: Record<string, Sheet>; bestiary: Record<string, Sheet> }

function root(): string {
  let d = process.cwd();
  for (let i = 0; i < 6; i++) { if (existsSync(path.join(d, 'public/art/atlas.json'))) return d; d = path.dirname(d); }
  throw new Error('public/art/atlas.json not found above the working directory');
}

/** Alpha channel of an 8-bit non-interlaced PNG (colour types 0, 2, 3, 4, 6). */
function pngAlpha(file: string): { w: number; h: number; a: (x: number, y: number) => number } {
  const buf = readFileSync(file);
  let o = 8, w = 0, h = 0, ct = 0, depth = 8, trns: Buffer | null = null;
  const idat: Buffer[] = [];
  while (o < buf.length) {
    const n = buf.readUInt32BE(o), type = buf.toString('ascii', o + 4, o + 8), data = buf.subarray(o + 8, o + 8 + n);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); depth = data[8]; ct = data[9]; if (data[12]) throw new Error(`${file}: interlaced PNG`); }
    else if (type === 'tRNS') trns = data;
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    o += 12 + n;
  }
  if (depth !== 8) throw new Error(`${file}: bit depth ${depth}`);
  const ch = ({ 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 } as Record<number, number>)[ct];
  const raw = inflateSync(Buffer.concat(idat)), stride = w * ch, px = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let i = 0; i < stride; i++) {
      const a = i >= ch ? px[y * stride + i - ch] : 0, b = y ? px[(y - 1) * stride + i] : 0, c = y && i >= ch ? px[(y - 1) * stride + i - ch] : 0;
      const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
      const pred = f === 1 ? a : f === 2 ? b : f === 3 ? (a + b) >> 1 : f === 4 ? (pa <= pb && pa <= pc ? a : pb <= pc ? b : c) : 0;
      px[y * stride + i] = (src[i] + pred) & 255;
    }
  }
  const a = (x: number, y: number): number => {
    const i = y * stride + x * ch;
    if (ct === 6) return px[i + 3];
    if (ct === 4) return px[i + 1];
    if (ct === 3) return trns && px[i] < trns.length ? trns[px[i]] : 255;
    return 255;
  };
  return { w, h, a };
}

/** Visible width (alpha > 0 bounding box) of frame 0. */
function visibleWidth(file: string, fw: number, fh: number): number {
  const img = pngAlpha(file);
  let min = Infinity, max = -1;
  for (let y = 0; y < Math.min(fh, img.h); y++) for (let x = 0; x < Math.min(fw, img.w); x++) if (img.a(x, y) > 0) { min = Math.min(min, x); max = Math.max(max, x); }
  return max < 0 ? 0 : max - min + 1;
}

interface Row { who: string; r: number; vis: number; frame: number; est: boolean; ratio: number }

export function artSection(): void {
  const base = root(), atlas = JSON.parse(readFileSync(path.join(base, 'public/art/atlas.json'), 'utf8')) as Atlas;
  const file = (s: Sheet) => path.join(base, 'public/art', s.file.replace(/^assets\//, ''));
  const rows: Row[] = [];
  // heroes: the sim body of a real hero, the exported class sheet
  const w = new World();
  for (const cls of Object.keys(CLASS_SCHOOL)) {
    const p = w.hero(`x-${cls}`, cls), s = atlas.heroes[cls];
    if (!s) { console.log(`note hero ${cls}: no atlas sheet`); continue; }
    const vis = visibleWidth(file(s), s.frameWidth, s.frameHeight);
    rows.push({ who: `hero ${cls}`, r: p.r, vis, frame: s.frameWidth, est: false, ratio: (2 * p.r) / vis });
  }
  // measured trimmed/frame ratio per arch, for code-drawn bodies
  const ratios = new Map<string, number[]>();
  for (const s of Object.values(atlas.bestiary)) {
    const vis = visibleWidth(file(s), s.frameWidth, s.frameHeight);
    const l = ratios.get(s.body ?? '') ?? []; l.push(vis / s.frameWidth); ratios.set(s.body ?? '', l);
  }
  const med = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
  const frameOf = (arch: string, tier: string) => Object.values(atlas.bestiary).find((s) => s.body === arch && s.tier === tier)?.frameWidth;
  for (const d of allCreatures()) {
    // the art drawn is the body's (campaign bosses borrow one), at the body creature's own tier scale
    const bodyDef: CreatureDef = creature(d.body) ?? d;
    const key = d.body.replace(/^bx_/, ''), s = atlas.bestiary[key];
    let vis: number, frame: number, est = false;
    if (s) { vis = visibleWidth(file(s), s.frameWidth, s.frameHeight); frame = s.frameWidth; }
    else {
      const fw = frameOf(bodyDef.arch, bodyDef.tier);
      if (!fw) { console.log(`note ${d.id}: no art frame size for ${bodyDef.arch}/${bodyDef.tier}`); continue; }
      frame = fw; vis = Math.round(fw * med(ratios.get(bodyDef.arch) ?? [0.85])); est = true;
    }
    // CombatView draws a borrowed body at the borrower's size: scale = own radius / body radius (clamped 0.5–3)
    if (d.body !== d.id && bodyDef !== d && bodyDef.radius > 0) vis = Math.round(vis * Math.max(0.5, Math.min(3, d.radius / bodyDef.radius)));
    rows.push({ who: `${d.id}${d.body !== d.id ? ` (body ${d.body})` : ''} ${d.tier}/${d.arch}`, r: d.radius, vis, frame, est, ratio: (2 * d.radius) / vis });
  }
  const bad = rows.filter((x) => x.ratio < 0.7 || x.ratio > 1.3).sort((a, b) => Math.max(b.ratio, 1 / b.ratio) - Math.max(a.ratio, 1 / a.ratio));
  console.log(`# body radius vs art: ${rows.length} bodies, ${bad.length} outside 70–130% of the visible sprite width`);
  console.log(`note ${'body'.padEnd(52)} ${'r'.padStart(3)} ${'diam'.padStart(4)} ${'visible'.padStart(8)} ${'frame'.padStart(5)} ${'diam/vis'.padStart(8)}`);
  for (const x of bad) console.log(`note ${x.who.padEnd(52)} ${String(x.r).padStart(3)} ${String(2 * x.r).padStart(4)} ${`${x.vis}${x.est ? '~' : ''}`.padStart(8)} ${String(x.frame).padStart(5)} ${`${Math.round(x.ratio * 100)}%`.padStart(8)}`);
  // the user's rule: hitboxes match what you see (an enemy you visibly hit is hit)
  check(!bad.length, 'every hero and creature body is 70–130% of its drawn sprite width', bad.slice(0, 14).map((x) => `${x.who}: r ${x.r} vs ${x.vis}${x.est ? '~' : ''} px (${Math.round(x.ratio * 100)}%)`));
  const heroes = rows.filter((x) => x.who.startsWith('hero'));
  console.log(`note heroes: body diameter ${2 * heroes[0].r} px vs visible ${Math.min(...heroes.map((x) => x.vis))}–${Math.max(...heroes.map((x) => x.vis))} px; "~" = estimated (code-drawn body, no exported sheet)`);
}

/**
 * Drawn width (alpha-trimmed, px) of every creature body's own art, for the generated radius table
 * (tools/e2e/sim/bodies-gen.ts → src/data/enemies/hc/bodies.gen.ts). Same measurement as artSection.
 */
export function bodyWidths(): Map<string, { w: number; est: boolean }> {
  const base = root(), atlas = JSON.parse(readFileSync(path.join(base, 'public/art/atlas.json'), 'utf8')) as Atlas;
  const file = (s: Sheet) => path.join(base, 'public/art', s.file.replace(/^assets\//, ''));
  const ratios = new Map<string, number[]>();
  for (const s of Object.values(atlas.bestiary)) {
    const l = ratios.get(s.body ?? '') ?? []; l.push(visibleWidth(file(s), s.frameWidth, s.frameHeight) / s.frameWidth); ratios.set(s.body ?? '', l);
  }
  const med = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
  const frameOf = (arch: string, tier: string) => Object.values(atlas.bestiary).find((s) => s.body === arch && s.tier === tier)?.frameWidth;
  const out = new Map<string, { w: number; est: boolean }>();
  for (const d of allCreatures()) {
    if (out.has(d.body)) continue;
    const bodyDef: CreatureDef = creature(d.body) ?? d, s = atlas.bestiary[d.body.replace(/^bx_/, '')];
    if (s) { out.set(d.body, { w: visibleWidth(file(s), s.frameWidth, s.frameHeight), est: false }); continue; }
    const fw = frameOf(bodyDef.arch, bodyDef.tier);
    if (fw) out.set(d.body, { w: Math.round(fw * med(ratios.get(bodyDef.arch) ?? [0.85])), est: true });
  }
  return out;
}
