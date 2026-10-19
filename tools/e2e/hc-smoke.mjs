// Hollow Crown systems smoke test (Claude 3): real browser, real keyboard/mouse.
// Spawns a pack beside the hero in WorldV2, fights it with click-target + 1–4 + dash + potions, opens the
// Pack / Skills / Spells panels, and fails on console errors.
//   node tools/e2e/hc-smoke.mjs --class warden --space realm:rime [--base http://localhost:5198] [--out tools/e2e/out]
import { mkdirSync, writeFileSync } from 'node:fs';
import { launch, sleep } from './cdp.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('base', 'http://localhost:5198');
const OUT = arg('out', 'tools/e2e/out');
const classes = arg('class', 'warden').split(',');
mkdirSync(OUT, { recursive: true });

const SCHOOL = { warden: 'rime', rimecaller: 'rime', ranger: 'verdant', hedgewitch: 'verdant', arcanist: 'ash', reaver: 'ash', stormlancer: 'storm', sparkwright: 'storm',
  oathbound: 'radiance', cantor: 'radiance', shade: 'umbral', duskweaver: 'umbral', swordsman: 'blade', samurai: 'blade', knight: 'iron', juggernaut: 'iron',
  monk: 'fist', brawler: 'fist', huntsman: 'hunt', falconer: 'hunt', corsair: 'guile', jester: 'guile', bard: 'song', skald: 'song' };

const results = [];
// the browser can be killed under memory pressure (other agents run browsers too): retry such a class once
const queue = classes.map((c) => ({ cls: c, tries: 0 }));
while (queue.length) {
  const job = queue.shift();
  const cls = job.cls;
  const school = SCHOOL[cls] ?? 'rime';
  const space = arg('space', `realm:${school}`);
  const page = await launch({ port: 9340 + results.length });
  const errors = [];
  page.on((m) => {
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails?.exception?.description?.split('\n').slice(0, 3).join(' | ') ?? 'exception');
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 300));
  });
  const r = { cls, steps: [], ok: false };
  const step = (s) => { r.steps.push(s); console.log(`[${cls}] ${s}`); };
  try {
    await page.goto(`${BASE}/?scene=WorldV2&space=${space}&hc_class=${cls}`);
    for (let i = 0; i < 120; i++) { if (await page.eval('!!(window.__hc && window.__hc.local())')) break; await sleep(500); }
    const me = await page.eval('window.__hc.local()');
    if (!me) throw new Error('hero never appeared (window.__hc.local() empty)');
    step(`hero up: hp ${Math.round(me.hp)}/${me.maxHp} in ${me.space}`);
    await page.screenshot(`${OUT}/hc-${cls}-start.png`);
    const ids = await page.eval(`window.__hc.spawn('bx_${school}_0', 3, ${me.level}, 150)`);
    step(`spawned ${ids.length} × bx_${school}_0`);
    const t0 = Date.now();
    let casts = 0;
    // fight only the spawned pack: chasing every creature in the realm walks an L1 hero into world camps
    const mine = new Set(ids);
    while (Date.now() - t0 < 90_000) {
      const foes = (await page.eval('window.__hc.enemies()')).filter((e) => mine.has(e.id));
      const hero = await page.eval('window.__hc.local()');
      if (!foes.length || hero.dead) break;
      foes.sort((a, b) => Math.hypot(a.x - hero.x, a.y - hero.y) - Math.hypot(b.x - hero.x, b.y - hero.y));
      const at = await page.eval(`window.__hc.screenOf(${JSON.stringify(foes[0].id)})`);
      if (at && hero.target !== foes[0].id) await page.click(Math.round(at.x), Math.round(at.y));
      const key = ['Digit1', 'Digit2', 'Digit3'][casts++ % 3];
      await page.press(key, 60);
      if (hero.hp < hero.maxHp * 0.4) await page.press('KeyQ', 60);
      if (casts % 7 === 0) await page.press('Space', 60);
      await sleep(350);
    }
    const counts = await page.eval('window.__hc.counts');
    const hero = await page.eval('window.__hc.local()');
    const left = (await page.eval('window.__hc.enemies()')).filter((e) => mine.has(e.id)).length;
    r.packCleared = left === 0;
    r.heroAlive = !hero.dead;
    step(`fight over in ${Math.round((Date.now() - t0) / 1000)}s: kills ${counts['enemy:killed'] ?? 0}, hits ${counts['combat:hit'] ?? 0}, casts ${counts['ability:cast'] ?? 0}, hero ${Math.round(hero.hp)}/${hero.maxHp}${hero.dead ? ' DEAD' : ''}`);
    await page.screenshot(`${OUT}/hc-${cls}-fight.png`);
    // a short realm-boss bout: boss bar, telegraphs, phases (screenshot only; no win required)
    const boss = await page.eval(`window.__hc.spawn('bx_${school}_5', 1, ${me.level}, 220)`);
    step(`boss bx_${school}_5 spawned (${boss[0]})`);
    const tb = Date.now();
    while (Date.now() - tb < 12_000) {
      const at = await page.eval(`window.__hc.screenOf(${JSON.stringify(boss[0])})`);
      if (at) await page.click(Math.round(at.x), Math.round(at.y));
      await page.press(['Digit1', 'Digit2', 'Digit3'][Math.floor((Date.now() - tb) / 700) % 3], 60);
      if ((await page.eval('window.__hc.local()')).hp < 80) await page.press('KeyQ', 60);
      await sleep(400);
    }
    await page.screenshot(`${OUT}/hc-${cls}-boss.png`);
    const bs = (await page.eval('window.__hc.enemies()')).find((e) => e.id === boss[0]);
    step(`boss after 12s: ${bs ? `${Math.round(bs.hp)}/${bs.maxHp}` : 'dead'}`);
    r.bossHurt = !bs || bs.hp < bs.maxHp;
    for (const [k, name] of [['KeyI', 'pack'], ['KeyK', 'skills'], ['KeyB', 'spells']]) {
      await page.press(k, 60); await sleep(700);
      await page.screenshot(`${OUT}/hc-${cls}-${name}.png`);
      await page.press(k, 60); await sleep(300);
    }
    step('panels opened (pack / skills / spells)');
    r.kills = counts['enemy:killed'] ?? 0;
    // the pack (3 at the hero's level) dies, the hero lives, the boss takes damage, no console errors
    r.ok = r.packCleared && r.heroAlive && r.bossHurt && !errors.length;
  } catch (e) {
    step(`ERROR ${e.message}`);
    try { await page.screenshot(`${OUT}/hc-${cls}-error.png`); } catch { /* */ }
  }
  r.errors = errors.slice(0, 20);
  await page.close();
  if (!r.ok && r.steps.some((x) => x.includes('chrome connection closed')) && job.tries++ < 1) { console.log(`[${cls}] browser died; retrying once`); queue.unshift(job); continue; }
  results.push(r);
}
writeFileSync(`${OUT}/hc-smoke.json`, JSON.stringify(results, null, 2));
const why = (r) => [!r.packCleared && 'pack alive', !r.heroAlive && 'hero died', !r.bossHurt && 'boss untouched'].filter(Boolean).join(', ');
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.cls}  kills ${r.kills ?? 0}  errors ${r.errors.length}${!r.ok && why(r) ? `  (${why(r)})` : ''}${r.errors.length ? `\n  ${r.errors.slice(0, 5).join('\n  ')}` : ''}`);
process.exit(results.every((r) => r.ok) ? 0 : 1);
