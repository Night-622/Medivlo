// Side-view review sheet (Claude 5): front frames next to the new side idle + walk at 4×, per class / body / hair.
//   node tools/art-side/sheet.mjs [--base http://localhost:5196] [--classes warden,arcanist,huntsman] [--hairs 2,1]
// --hairs -1 --bodies -1 keep each row's own look (NPCs). Writes tools/e2e/out/side/side-sheet.png (and side-sheet-1x.png: 1x on grass + 2x on the panel colour).
import { mkdirSync, writeFileSync } from 'node:fs';
import { launch, sleep } from '../e2e/cdp.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('base', 'http://localhost:5196'), OUT = 'tools/e2e/out/side';
const CLASSES = arg('classes', 'warden,arcanist,huntsman').split(','), HAIRS = arg('hairs', '2,1').split(',').map(Number);
const SCALE = Number(arg('scale', 4)), NAME = arg('name', 'side-sheet'), BODIES = arg('bodies', '0,1').split(',').map(Number), NOHAT = process.argv.includes('--nohat');
// paperdoll gear for every row, e.g. --gear helm=5,weapon=12,neck=1,face=2,extra=2,cape=2,headw=2 (MV.heroLook keys)
const kv = (t) => Object.fromEntries(t.split(',').filter(Boolean).map((p) => { const [k, v] = p.split('='); return [k, Number(v)]; }));
const GEAR = kv(arg('gear', ''));
// one row per gear variant on top of --gear, e.g. --gears "helm=1|helm=2|weapon=3,neck=1" (labelled on the row)
const GEARS = arg('gears', '').split('|').filter(Boolean).map((t) => ({ t, g: kv(t) }));
mkdirSync(OUT, { recursive: true });
const page = await launch({ port: 9800 + Math.floor(Math.random() * 150), width: 1280, height: 720 });
const errors = [];
page.on((m) => {
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails?.exception?.description?.split('\n').slice(0, 3).join(' | ') ?? 'exception');
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200));
});
const waitFor = async (expr, ms = 90000) => { const t = Date.now(); while (Date.now() - t < ms) { if (await page.eval(expr)) return true; await sleep(400); } return false; };
try {
  await page.goto(BASE);
  await waitFor(`!!window.__game?.scene.isActive('MainMenu') && !!window.MV?.heroFrameX`);
  const res = await page.eval(`(async () => {
    const { sideFrames } = await import('/src/art/side/index.ts');
    const MV = window.MV, S = ${SCALE}, CW = 32 * S, CH = 40 * S, GAP = 10, LABEL = 150;
    const classes = ${JSON.stringify(CLASSES)}, hairs = ${JSON.stringify(HAIRS)};
    const rows = [];
    const XK = ['brows', 'dye', 'headw', 'cape', 'neck', 'face', 'extra', 'helm', 'chest', 'hands', 'feet', 'weapon'], GEAR = ${JSON.stringify(GEAR)}, GEARS = ${JSON.stringify(GEARS.length ? GEARS : [{ t: '', g: {} }])};
    const mk = (r) => { const G = Object.assign({}, GEAR, r.gear.g), L = Object.assign(MV.heroLook(r.cls), { ...(r.body >= 0 ? { body: r.body } : {}), ...(r.hair >= 0 ? { hair: r.hair } : {}), nohat: ${NOHAT} }, G);
      const name = 'hero:' + r.cls + ':' + [L.skin, L.hair, L.hc, L.eyes, L.ec, L.mouth, L.mark].join(':') + ':${NOHAT ? 1 : 0}:' + L.body + (Object.keys(G).length ? ':' + XK.map((k) => (k === 'brows' ? (L.brows ?? '') : (L[k] ?? 0))).join(':') : '');
      return { L, name }; };
    for (const cls of classes) for (const body of ${JSON.stringify(BODIES)}) for (const hair of hairs) for (const gear of GEARS) rows.push({ cls, body, hair, gear });
    const cols = ['front', 'walk', '', '', '', 'side idle', '', 'side walk', '', '', '', 'left (flipX)'];
    const W = LABEL + cols.length * (CW + GAP), H = 40 + rows.length * (CH + GAP);
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    x.fillStyle = '#1b2140'; x.fillRect(0, 0, W, H);
    x.font = '20px "Jersey 10", monospace'; x.fillStyle = '#e8ecff';
    cols.forEach((t, i) => t && x.fillText(t, LABEL + i * (CW + GAP), 26));
    const put = (f, i, r, flip) => { const px = LABEL + i * (CW + GAP), py = 40 + r * (CH + GAP);
      x.fillStyle = (i >= 5 ? '#2a3462' : '#232b52'); x.fillRect(px, py, CW, CH);
      x.save(); if (flip) { x.translate(px + CW, py); x.scale(-1, 1); x.drawImage(f, 0, 0, CW, CH); } else x.drawImage(f, px, py, CW, CH); x.restore(); };
    rows.forEach((r, ri) => {
      const { L, name } = mk(r);
      const front = MV.frames(name, 'idle'), walk = MV.frames(name, 'walk');
      const sIdle = sideFrames(L, 'idle'), sWalk = sideFrames(L, 'walk');
      put(front[0], 0, ri); walk.forEach((f, i) => put(f, 1 + i, ri)); sIdle.forEach((f, i) => put(f, 5 + i, ri)); sWalk.forEach((f, i) => put(f, 7 + i, ri)); put(sWalk[0], 11, ri, true);
      x.fillStyle = '#e8ecff'; x.font = '20px "Jersey 10", monospace';
      const py = 40 + ri * (CH + GAP);
      x.fillText(r.cls, 8, py + 40); x.fillText(r.body < 0 ? '' : r.body ? 'male' : 'female', 8, py + 66); x.fillText(r.hair >= 0 ? MV.LOOK.hair[r.hair] : 'own look', 8, py + 92); if (r.gear.t) x.fillText(r.gear.t, 8, py + 118);
    });
    // native scales, as they read in game: per row, front idle + side idle + side walk ×4 + flipped, at 1× on grass
    // (the world) and at 2× on the panel colour (character creation preview, HUD portrait)
    const ROWW = 32 * 8 + 16, n = document.createElement('canvas'); n.width = ROWW * 3 + 24; n.height = rows.length * 84 + 8; const nx = n.getContext('2d');
    nx.imageSmoothingEnabled = false;
    nx.fillStyle = '#3f8f4f'; nx.fillRect(0, 0, ROWW + 8, n.height);
    nx.fillStyle = '#1b2140'; nx.fillRect(ROWW + 8, 0, n.width - ROWW - 8, n.height);
    rows.forEach((r, ri) => { const { L, name } = mk(r);
      const fr = [MV.frames(name, 'idle')[0], ...sideFrames(L, 'idle').slice(0, 1), ...sideFrames(L, 'walk')];
      const draw = (s, ox, oy) => { fr.forEach((f, i) => nx.drawImage(f, ox + i * (32 * s + 2 * s), oy, 32 * s, 40 * s));
        const last = fr[fr.length - 4]; nx.save(); nx.translate(ox + fr.length * (32 * s + 2 * s) + 32 * s, oy); nx.scale(-1, 1); nx.drawImage(last, 0, 0, 32 * s, 40 * s); nx.restore(); };
      draw(1, 4, 4 + ri * 84 + 20);
      draw(2, ROWW + 16, 4 + ri * 84);
    });
    return { big: c.toDataURL('image/png'), small: n.toDataURL('image/png'), rows: rows.length };
  })()`);
  writeFileSync(`${OUT}/${NAME}.png`, Buffer.from(res.big.split(',')[1], 'base64'));
  writeFileSync(`${OUT}/${NAME}-1x.png`, Buffer.from(res.small.split(',')[1], 'base64'));
  console.log(JSON.stringify({ rows: res.rows, out: `${OUT}/${NAME}.png`, errors: errors.slice(0, 5) }));
} catch (e) { console.log('ERROR', e.message, errors.slice(0, 5)); }
await page.close();
process.exit(0);
