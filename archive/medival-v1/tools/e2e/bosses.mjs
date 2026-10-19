#!/usr/bin/env node
// Boss gauntlet: for each boss, a level-appropriate character of each class fights it with REAL input.
//   node tools/e2e/bosses.mjs [--class warden,ranger,arcanist] [--boss enemy:nhal-risen,...] [--minutes 6]
// Setup (level, points, gear ilvl/upgrades) is scripted in-page; the fight itself is keyboard/mouse only.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, sleep } from './cdp.mjs';
import { Bot } from './bot.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('base', 'http://localhost:5198');
const CLASSES = arg('class', 'warden,ranger,arcanist').split(',');
const MINUTES = Number(arg('minutes', '6'));
const OUT = arg('out', join(HERE, 'out'));
const PORT = Number(arg('port', '9345'));
mkdirSync(OUT, { recursive: true });
const HELPERS = readFileSync(join(HERE, 'page-helpers.js'), 'utf8');

/** boss id → [player level, danger tier, gear upgrade] (the level a player should be when they get there) */
const BOSSES = {
  'enemy:hollowed-white-stag': [3, 1, 0],
  'enemy:abbess-morwen': [5, 1, 1],
  'enemy:reed-mother': [11, 3, 3],
  'enemy:aldwin-varn': [12, 3, 3],
  'enemy:ashwyrm': [26, 4, 5],
  'enemy:drowned-thing': [33, 5, 6],
  'enemy:ysolde-pale-saint': [36, 5, 6],
  'enemy:nhal-risen': [40, 5, 6],
};
const ONLY = arg('boss', '') ? arg('boss').split(',') : Object.keys(BOSSES);

async function setup(b, cls, level, tier, upgrade) {
  return b.eval(`(async () => {
    const core = await import('/src/core/index.ts');
    const sys = await import('/src/systems/index.ts');
    const trees = await import('/src/systems/progression/SkillTrees.ts');
    const gs = core.Game.state;
    const pr = gs.player.progression;
    while (pr.level < ${level}) sys.grantXp(gs, sys.xpToNext(pr.level), 'e2e');
    const cls = core.Registry.get('class', pr.classId);
    // attributes: 2/3 into the first primary, 1/3 into the second
    const prim = cls.primaryAttributes;
    let n = pr.unspentAttributePoints; pr.unspentAttributePoints = 0;
    for (let i = 0; i < n; i++) pr.attributes[prim[i % 3 === 2 && prim[1] ? 1 : 0]]++;
    // skill points: greedy, cheapest available node first, avoiding keystones until last
    for (let guard = 0; guard < 200 && pr.unspentSkillPoints > 0; guard++) {
      const t = trees.availableTrees(gs)[0];
      const node = t.nodes.filter((nd) => nd.type !== 'keystone').find((nd) => trees.canAllocate(gs, t, nd).ok) ?? t.nodes.find((nd) => trees.canAllocate(gs, t, nd).ok);
      if (!node) break;
      trees.allocate(gs, t.id, node.id);
    }
    // gear: re-level everything to the player's level and upgrade it, like a player who kept up
    for (const it of gs.player.inventory.items) { const d = core.Registry.tryGet('item', it.def); if (d && ['weapon', 'armor', 'offhand'].includes(d.itemKind)) { it.itemLevel = ${level}; it.upgrade = ${upgrade}; } }
    gs.player.inventory.draught = { charges: 5, maxCharges: 5, potency: 1 };
    core.bus.emit('stats:changed', {});
    const p = window.__combat.player;
    p.recalc(window.__combat.rt.now);
    p.fullRestore();
    return { level: pr.level, hp: p.maxHp, attrs: p.stats.derived.attributes, armor: p.stats.derived.armor };
  })()`);
}

async function fightBoss(cls, bossId) {
  const [level, tier, upgrade] = BOSSES[bossId];
  const b = await launch({ port: PORT });
  const r = { cls, boss: bossId, level, won: false, deaths: 0, seconds: 0, bossHpLeft: null, bossHpMin: 100, notes: [] };
  const errors = [];
  b.on((m) => { if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails?.exception?.description?.split('\n')[0]); });
  try {
    await b.goto(`${BASE}/?scene=World&class=${cls}`);
    for (let i = 0; i < 120; i++) { await sleep(500); if (await b.eval('!!window.__combat && !!window.__world').catch(() => false)) break; }
    await b.eval(HELPERS);
    await b.eval('new Promise(r => { const t = setInterval(() => { if (window.__e2e?.ready) { clearInterval(t); r(true); } }, 50); })');
    // quiet spot: remove ambient enemies near the player, close any dialogue
    await b.press('Escape');
    r.player = await setup(b, cls, level, tier, upgrade);
    await b.eval(`(() => { const { rt, player } = window.__combat; for (const e of rt.enemies) if (Math.hypot(e.x - player.x, e.y - player.y) < 1400) { e.alive = false; e.destroy(); } rt.enemies = rt.enemies.filter((e) => e.alive);
      const e = rt.spawnEnemy(${JSON.stringify(bossId)}, player.x + 220, player.y, { level: ${level}, tier: ${tier}, zoneId: 'e2e-boss' }); e.engage(rt); return true; })()`);
    const bot = new Bot(b, cls, { bugs: [], steps: [], deaths: 0, t0Ms: Date.now() }, () => {});
    const t0 = Date.now();
    let lastAlive = true;
    while (Date.now() - t0 < MINUTES * 60_000) {
      const s = await bot.snap().catch(() => null);
      if (!s?.player) { await sleep(300); continue; }
      const boss = s.enemies.find((e) => e.id === bossId);
      const flags = s.flags ?? {};
      if (!boss || flags['act3.ysolde_defeated'] === 'yielded') { r.won = true; break; }
      r.bossHpLeft = Math.round((boss.hp / boss.max) * 100);
      r.bossHpMin = Math.min(r.bossHpMin, r.bossHpLeft);
      if (!s.player.alive) { if (lastAlive) r.deaths++; lastAlive = false; await sleep(600); continue; }
      if (!lastAlive) { // respawned: the boss reset; walk back to it
        lastAlive = true;
        if (r.deaths >= 3) break;
        await b.eval(`window.__world.tp(${Math.floor(boss.x / 32)}, ${Math.floor(boss.y / 32) + 5})`);
      }
      const foe = boss.state === 'engage' || boss.subdued ? boss : s.enemies.find((e) => e.state === 'engage' && e.d < 520) ?? boss;
      if (foe.d > 520) { await bot.moveToward(s, foe.x, foe.y, 300); continue; }
      await bot.fight(s, foe);
    }
    r.seconds = Math.round((Date.now() - t0) / 1000);
    await b.screenshot(join(OUT, `boss-${cls}-${bossId.slice(6)}.png`));
  } catch (e) { r.notes.push(`harness: ${e.message}`); }
  finally { r.errors = [...new Set(errors)].slice(0, 10); await b.close(); }
  return r;
}

const results = [];
for (const bossId of ONLY) for (const cls of CLASSES) {
  const r = await fightBoss(cls, bossId);
  results.push(r);
  console.log(`${r.won ? 'WIN ' : 'LOSS'} ${bossId.padEnd(26)} ${cls.padEnd(9)} L${r.level} · ${r.seconds}s · deaths ${r.deaths}${r.won ? '' : ` · boss lowest ${r.bossHpMin}%`}${r.notes.length ? ` · ${r.notes.join('; ')}` : ''}${r.errors.length ? ` · errors: ${r.errors.join(' | ')}` : ''}`);
}
writeFileSync(join(OUT, 'bosses.json'), JSON.stringify(results, null, 2));
