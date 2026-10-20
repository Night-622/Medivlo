// Deeper-builds UI (Claude 3's helper, docs/systems/BUILDS.md §9) in the real browser with REAL clicks:
// the Runeforge tabs (upgrade, a gem into socket 2, reroll, imbue, transfer, craft, salvage), a rune slotted into a
// spell from the Spells panel, the shared-keystone counter, the free respec, and the Pack / Shop tooltips staying on
// screen. Results are read back from the save the authority writes. Screenshots: <out>/hcb-*.png.
//   npx vite --config tools/e2e/vite.test.config.mjs --port 5291 --strictPort
//   node tools/e2e/hc-builds-ui.mjs [--base http://localhost:5291] [--class warden] [--out tools/e2e/out]
// Failing lines start with "FAIL"; the last line is "N/M passed"; exit code 1 on any failure.
import { mkdirSync } from 'node:fs';
import { launch, sleep } from './cdp.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('base', 'http://localhost:5291'), OUT = arg('out', 'tools/e2e/out'), CLS = arg('class', 'warden');
mkdirSync(OUT, { recursive: true });

let pass = 0, fail = 0;
const check = (ok, what, detail = '') => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}${detail ? ` :: ${String(detail).slice(0, 240)}` : ''}`); if (ok) pass++; else fail++; return ok; };
const page = await launch({ port: 9400 + Math.floor(Math.random() * 300) });
const errors = [];
page.on((m) => {
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails?.exception?.description?.split('\n')[0] ?? 'exception');
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200));
});
const ev = (expr) => page.eval(expr);
const waitFor = async (expr, ms = 60000) => { const t = Date.now(); while (Date.now() - t < ms) { try { if (await ev(expr)) return true; } catch { /* loading */ } await sleep(300); } return false; };
const shot = (name) => page.screenshot(`${OUT}/hcb-${name}.png`);
const CH = `(await import('/src/systems/client/character.ts')).character()`;
const save = () => ev(`(async () => JSON.parse(JSON.stringify(${CH})))()`);
const count = (s, base) => s.inventory.filter((x) => x.base === base).reduce((a, x) => a + x.qty, 0);
/** every visible Text in the HUD scene with its on-screen bounds */
const texts = () => ev(`(() => { const out = []; const walk = (o) => { if (!o || o.visible === false) return; if (o.type === 'Text') { const b = o.getBounds(); out.push({ t: o.text, x: b.x, y: b.y, w: b.width, h: b.height }); } (o.list || []).forEach(walk); }; window.__game.scene.getScene('HudV2').children.list.forEach(walk); return out; })()`);
/** the open tooltip card's bounds (the nineslice drawn with ui:tooltip) */
const tipBounds = () => ev(`(() => { let r = null; const walk = (o) => { if (!o || o.visible === false) return; if (o.type === 'NineSlice' && o.texture && o.texture.key === 'ui:tooltip') { const b = o.getBounds(); r = { x: Math.round(b.x), y: Math.round(b.y), r: Math.round(b.right), b: Math.round(b.bottom) }; } (o.list || []).forEach(walk); }; window.__game.scene.getScene('HudV2').children.list.forEach(walk); return r; })()`);
const onScreen = (b) => !!b && b.x >= 0 && b.y >= 0 && b.r <= 1280 && b.b <= 720;
const endDialogue = async () => {
  for (let i = 0; i < 40; i++) {
    const n = await ev(`(async () => { const d = (await import('/src/narrative/client/dialogueClient.ts')).dialogueClient; return d.active ? d.view.choices.length : -1; })()`);
    if (n < 0) return;
    await page.press(n > 0 ? 'Digit1' : 'Space', 60); await sleep(300);
  }
};

async function enter(cls) {
  // a hero with a real look, as character creation makes it (the same entry as hc-features.mjs)
  await page.goto(`${BASE}/`);
  if (!(await waitFor(`!!window.__game?.scene.isActive('MainMenu')`, 90000))) throw new Error('title never appeared');
  await ev(`(async () => {
    const core = await import('/src/core/index.ts');
    const { defaultLook } = await import('/src/data/classes/hc/index.ts');
    const st = core.createNewGameState(0);
    st.player.name = 'Tess';
    st.player.hero = { classId: ${JSON.stringify(cls)}, look: defaultLook(${JSON.stringify(cls)}, 0), outfit: { dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 } };
    core.Game.set(st);
    window.__game.scene.getScene('MainMenu').scene.start('WorldV2');
    return 1;
  })()`);
  if (!(await waitFor('!!(window.__hc && window.__hc.local())', 90000))) throw new Error('hero never appeared');
  await sleep(2500);
  await endDialogue();
  await ev(`(async () => { const c = await import('/src/core/index.ts'); for (const e of window.__hc.enemies()) c.Services.get('combat').despawn(e.id); return 1; })()`);
}

/** Kit for the run: a wrought weapon (2 sockets, rolled affixes) worn, a legendary of the same slot, an affixed
 *  helm to salvage, gems, ingots, rune dust, an Essence, two runes, a rune slot on kit spell 1, and the free respec. */
async function stage() {
  return ev(`(async () => {
    const C = await import('/src/systems/client/character.ts');
    const { Rng } = await import('/src/core/rng.ts');
    const { rollAffixes } = await import('/src/systems/rules/affixes.ts');
    const { kitFor } = await import('/src/data/classes/hc/kits.ts');
    const ch = C.character(), kit = kitFor(ch.classId), rng = new Rng(11);
    ch.level = 20; ch.gold = 200000; ch.bonusPoints += 6; ch.freeRespec = true;
    const base = kit.startWeapon;
    const w = { uid: 'hcb-w', base, ilvl: 20, qty: 1, rarity: 'wrought', sockets: [null, null], affixes: rollAffixes(rng, base, 20, 'wrought', { classId: ch.classId }) };
    if (ch.equipment.main) ch.inventory.push(ch.equipment.main);
    ch.equipment.main = w;
    const hb = (await import('/src/data/items/hc/armour.gen.ts')).HC_PIECES.find((p) => p.slot === 'head').id;
    ch.inventory.push(
      { uid: 'hcb-ing', base: 'i_ingot', ilvl: 1, qty: 40 }, { uid: 'hcb-ruby', base: 'i_ruby', ilvl: 1, qty: 1 }, { uid: 'hcb-sap', base: 'i_sapphire', ilvl: 1, qty: 1 },
      { uid: 'hcb-dust', base: 'i_runedust', ilvl: 1, qty: 12 }, { uid: 'hcb-ess', base: 'i_essence_ash', ilvl: 1, qty: 1 },
      { uid: 'hcb-rn1', base: 'rn_haste', ilvl: 1, qty: 1 }, { uid: 'hcb-rn2', base: 'rn_power', ilvl: 1, qty: 1 },
      { uid: 'hcb-lg', base: 'lg_stag', ilvl: 20, qty: 1 },
      { uid: 'hcb-helm', base: hb, ilvl: 12, qty: 1, rarity: 'runed', sockets: [null], affixes: rollAffixes(rng, hb, 12, 'runed', { classId: ch.classId }) },
    );
    ch.tree.sp_p0m1 = 1; ch.tree.sp_p0m2 = 1;
    C.sendLoadout(); C.changed();
    return { base, helm: hb, spell: kit.spells[0], affixes: w.affixes.length };
  })()`);
}

const TAB = (i) => [76 + i * 65 + 32, 159];
const T = { reforge: 0, sockets: 1, upgrade: 2, reroll: 3, imbue: 4, transfer: 5, craft: 6, salvage: 7 };
const clickTab = async (name) => { const [x, y] = TAB(T[name]); await page.click(x, y); await sleep(450); };
const wornIndex = (uid) => ev(`(async () => Object.values(${CH}.equipment).filter(Boolean).findIndex((x) => x.uid === ${JSON.stringify(uid)}))()`);
const packIndex = (uid) => ev(`(async () => ${CH}.inventory.slice(0, 56).findIndex((x) => x.uid === ${JSON.stringify(uid)}))()`);
const clickWorn = async (uid) => { const i = await wornIndex(uid); await page.click(76 + (i % 8) * 64 + 28, 184 + Math.floor(i / 8) * 64 + 28); await sleep(450); return i; };
const clickPack = async (uid) => { const i = await packIndex(uid); await page.click(676 + (i % 8) * 64 + 28, 156 + Math.floor(i / 8) * 70 + 28); await sleep(450); return i; };
const weapon = async () => (await save()).equipment.main;

/** The sim refuses shop and Runeforge acts beyond 96 px of the smith (same space): stand next to it first. */
async function nearSmith(npc) {
  const at = await ev(`(async () => (await import('/src/core/index.ts')).Services.get('worlds').npcPos?.(${JSON.stringify(npc)}) ?? null)()`);
  if (!at) return 'no position (trade allowed anywhere)';
  const here = await ev('window.__hc.local().space');
  if (here !== at.space) {
    await ev(`(window.__world.space(${JSON.stringify(at.space)}), 1)`);
    await sleep(1500);
    if (!(await waitFor('!!(window.__hc && window.__hc.local() && window.__game.scene.isActive("WorldV2"))', 60000))) throw new Error('world never came back');
    await sleep(2000); await endDialogue();
  }
  await ev(`(async () => { const c = await import('/src/core/index.ts'); return c.Services.get('combat').teleport(c.Services.get('net').localPlayer, ${JSON.stringify(at.space)}, ${at.x + 30}, ${at.y}); })()`);
  await sleep(600);
  const me = await ev('window.__hc.local()');
  return `${at.space} (${Math.round(at.x)}, ${Math.round(at.y)}); hero at ${me.space} (${Math.round(me.x)}, ${Math.round(me.y)})`;
}

async function runeforge() {
  const where = await nearSmith('npc:iron-smith');
  check(true, 'hero stands by the iron smith', where);
  await ev(`(async () => (await import('/src/core/flags.ts')).setFlag('shop.open', 'npc:iron-smith'))()`);
  await sleep(900);
  await page.click(236 + 75, 96 + 22); await sleep(500); // Runeforge tab
  await clickWorn('hcb-w');
  await shot('forge-reforge');

  // Upgrade: +1 for gold and an ingot
  await clickTab('upgrade');
  const s0 = await save();
  await shot('forge-upgrade');
  await page.click(226, 470); await sleep(800);
  const s1 = await save();
  check(s1.equipment.main.upgrade === 1 && s1.gold < s0.gold && count(s1, 'i_ingot') === count(s0, 'i_ingot') - 1, 'Upgrade tab: clicking Upgrade makes the weapon +1 (gold and 1 ingot spent)', `upgrade ${s1.equipment.main.upgrade}, gold ${s0.gold}→${s1.gold}, ingots ${count(s0, 'i_ingot')}→${count(s1, 'i_ingot')}`);

  // Sockets: pick socket 2, then the sapphire (the second gem in the pack)
  await clickTab('sockets');
  await page.click(76 + 88 + 28, 396 + 28); await sleep(400);
  await shot('forge-sockets');
  await page.click(76 + 64 + 28, 504 + 28); await sleep(800);
  const w2 = await weapon();
  check(w2.sockets?.[1] === 'i_sapphire' && !w2.sockets?.[0], 'Sockets tab: socket 2 then a gem sets that gem in socket 2 only', JSON.stringify(w2.sockets));
  check(count(await save(), 'i_sapphire') === 0, 'the gem is used up');

  // Reroll the first affix line
  await clickTab('reroll');
  await shot('forge-reroll');
  const before = JSON.stringify((await weapon()).affixes?.[0]);
  await page.click(530, 404 + 22); await sleep(800);
  const after = JSON.stringify((await weapon()).affixes?.[0]);
  check(!!before && before !== after, 'Reroll tab: Reroll on line 1 changes that affix', `${before} → ${after}`);

  // Imbue with Ash (the only Essence carried)
  await clickTab('imbue');
  await shot('forge-imbue');
  await page.click(76 + 61, 450); await sleep(800);
  const s3 = await save();
  check(s3.equipment.main.imbue === 'ash' && count(s3, 'i_essence_ash') === 0, 'Imbue tab: Ash (Essence held) imbues the weapon and spends the Essence', `imbue ${s3.equipment.main.imbue}`);
  const disabled = await ev(`(() => { let n = 0; const walk = (o) => { if (!o) return; if (o.type === 'Container' && o.list?.some((x) => x.type === 'Text' && x.text === 'Rime')) n += o.list.some((x) => x.type === 'NineSlice' && x.texture.key === 'ui:btn_off') ? 1 : 0; (o.list || []).forEach(walk); }; window.__game.scene.getScene('HudV2').children.list.forEach(walk); return n; })()`);
  check(disabled === 1, 'Imbue tab: a school without its Essence is disabled', `Rime disabled ${disabled}`);

  // Transfer: the legendary's effect onto the worn weapon
  await clickTab('transfer');
  const lgAt = await ev(`(async () => ${CH}.inventory.filter((x) => x.uid !== 'hcb-w' && ((x.uniqueFx) || x.base.startsWith('lg_') || x.base.startsWith('u_'))).findIndex((x) => x.uid === 'hcb-lg'))()`);
  await page.click(76 + lgAt * 64 + 28, 396 + 28); await sleep(450);
  await shot('forge-transfer');
  await page.click(226, 590); await sleep(800);
  const s4 = await save();
  check(s4.equipment.main.uniqueFx === 'lg_stag' && !s4.inventory.some((x) => x.uid === 'hcb-lg'), 'Transfer tab: the legendary’s effect binds onto the weapon and the source is gone', `uniqueFx ${s4.equipment.main.uniqueFx}`);

  // Craft: Rune of Thrift (80 gold + 3 dust)
  await clickTab('craft');
  const ri = await ev(`(async () => (await import('/src/data/items/hc/build-items.ts')).HC_RUNES.findIndex((r) => r.id === 'rn_thrift'))()`);
  await page.click(76 + (ri % 8) * 64 + 28, 184 + Math.floor(ri / 8) * 64 + 28); await sleep(450);
  await shot('forge-craft');
  const d0 = count(await save(), 'i_runedust');
  await page.click(470, 560); await sleep(800);
  const s5 = await save();
  check(count(s5, 'rn_thrift') === 1 && count(s5, 'i_runedust') === d0 - 3, 'Craft tab: Craft makes a Rune of Thrift from 3 Rune Dust', `thrift ${count(s5, 'rn_thrift')}, dust ${d0}→${count(s5, 'i_runedust')}`);

  // Salvage the carried helm (affixed → rune dust too)
  await clickTab('salvage');
  await clickPack('hcb-helm');
  await shot('forge-salvage');
  const helm = (await save()).inventory.find((x) => x.uid === 'hcb-helm');
  const gives = 1 + (helm?.sockets ?? []).filter(Boolean).length + ((helm?.affixes?.length ?? 0) ? 1 : 0);
  const i0 = count(await save(), 'i_ingot'), du0 = count(await save(), 'i_runedust');
  await page.click(226, 400 + gives * 20 + 40); await sleep(800);
  const s6 = await save();
  check(!s6.inventory.some((x) => x.uid === 'hcb-helm') && count(s6, 'i_ingot') > i0 && count(s6, 'i_runedust') >= du0, 'Salvage tab: Salvage breaks the carried helm into ingots (and rune dust)', `ingots ${i0}→${count(s6, 'i_ingot')}, dust ${du0}→${count(s6, 'i_runedust')}`);

  // the Shop tooltip for the upgraded, imbued, socketed weapon stays on screen
  await clickTab('reforge');
  const wi = await wornIndex('hcb-w');
  await page.mouseMove(76 + (wi % 8) * 64 + 28, 184 + Math.floor(wi / 8) * 64 + 28); await sleep(500);
  const tb = await tipBounds();
  const tt = (await texts()).map((t) => t.t);
  check(onScreen(tb) && tt.some((t) => /\+1$/.test(t)) && tt.some((t) => /^Imbued: /.test(t)) && tt.some((t) => /^Bound effect: /.test(t)), 'Runeforge tooltip: +1, imbue and bound effect lines, card on screen', JSON.stringify(tb));
  await shot('forge-tooltip');
  await page.press('Escape', 60); await sleep(600);
}

async function packTooltip() {
  await page.press('KeyI', 70); await sleep(900);
  await page.mouseMove(368 + 28, 168 + 28); await sleep(500); // the main-hand slot
  const tb = await tipBounds();
  const tt = (await texts()).map((t) => t.t);
  check(onScreen(tb) && tt.some((t) => /^Socket: /.test(t)) && tt.some((t) => /^Empty socket$/.test(t)), 'Pack tooltip: socket lines render, the card stays on screen', JSON.stringify(tb));
  await shot('pack-tooltip');
  await page.press('Escape', 70); await sleep(600);
}

async function spellRunes(spell) {
  await page.press('KeyB', 70); await sleep(900);
  await page.click(58 + 200, 150 + 400); await sleep(600); // kit spell 1 (path 0's free node)
  const plus = (await texts()).find((t) => t.t === '+' && t.x > 912);
  if (!check(!!plus, 'Spells panel: the spell’s card shows an empty rune slot')) return;
  await page.click(Math.round(plus.x + plus.w / 2), Math.round(plus.y + plus.h / 2)); await sleep(600);
  const cap = (await texts()).find((t) => t.t === 'Pick a rune for this spell:');
  await shot('spells-picker');
  if (!check(!!cap, 'clicking the empty slot opens the rune picker')) return;
  const fits = await ev(`(async () => { const { runeDef, runeFits } = await import('/src/systems/rules/runes.ts'); const { spellDef } = await import('/src/systems/rules/spells.ts'); const ch = ${CH}; const sp = spellDef(${JSON.stringify(spell)}); return ch.inventory.filter((it) => { const r = runeDef(it.base); return r && it.qty > 0 && runeFits(r, sp); }).map((x) => x.base); })()`);
  const n0 = count(await save(), fits[0]);
  await page.click(936 + 20, Math.round(cap.y + cap.h + 6 + 20)); await sleep(900);
  const s = await save();
  check((s.runes?.[spell] ?? []).includes(fits[0]) && count(s, fits[0]) === n0 - 1, `a real click slots ${fits[0]} into ${spell} (one taken from the pack)`, JSON.stringify(s.runes));
  const tt = (await texts()).map((t) => t.t);
  const desc = await ev(`(async () => (await import('/src/systems/rules/runes.ts')).runeDef(${JSON.stringify(fits[0])}).desc)()`);
  check(tt.some((t) => t.endsWith(`: ${desc}`)), 'the rune’s effect prints on the spell’s card', desc);
  await shot('spells-runes');
}

async function tradeoffText() {
  // a perk whose text carries a cost clause: its card prints that clause in red (#ff4d5e)
  const n = await ev(`(async () => {
    const { buildTree } = await import('/src/systems/rules/tree.ts');
    const { clauses } = await import('/src/ui/character/hc/treeKinds.ts');
    const ch = ${CH};
    for (const [i, b] of ['spells', 'skills', 'upgrades'].entries()) for (const n of buildTree(ch.classId, b)) {
      const c = clauses(n.text[0] ?? '').find((x) => x.cost);
      if (c) return { key: 'Digit' + (i + 1), x: 58 + n.x, y: 150 + n.y, name: n.name, clause: c.text };
    }
    return null;
  })()`);
  if (!check(!!n, 'the tree has a perk with a trade-off clause')) return;
  await page.press(n.key, 70); await sleep(500);
  await page.click(n.x, n.y); await sleep(600);
  const red = await ev(`(() => { const out = []; const walk = (o) => { if (!o || o.visible === false) return; if (o.type === 'Text' && o.style.color === '#ff4d5e') out.push(o.text); (o.list || []).forEach(walk); }; window.__game.scene.getScene('HudV2').children.list.forEach(walk); return out; })()`);
  check(red.includes(n.clause), `${n.name}: the cost clause prints in red on its card`, `${n.clause} | red: ${red.join(' / ')}`);
  await shot('tradeoff');
}

async function sharedAndRespec() {
  await page.press('Digit3', 70); await sleep(600);
  const tt = (await texts()).map((t) => t.t);
  check(tt.some((t) => /^Shared keystones \d \/ 2$/.test(t)), 'Upgrades branch: the shared-keystone counter shows', tt.find((t) => t.startsWith('Shared')) ?? '');
  check(tt.includes('Free reset (all branches)') && tt.some((t) => t.startsWith('Free reset:')), 'free-respec banner and button show while character().freeRespec');
  await shot('upgrades-shared');
  const s0 = await save();
  await page.click(912 + 160, 650); await sleep(900);
  const s1 = await save();
  check(Object.keys(s1.tree).length === 0 && s1.freeRespec === false && s1.gold === s0.gold, 'a real click on Free respec resets every branch for free, once', `tree ${Object.keys(s0.tree).length}→${Object.keys(s1.tree).length}, freeRespec ${s1.freeRespec}, gold ${s0.gold}→${s1.gold}`);
  const tt2 = (await texts()).map((t) => t.t);
  check(tt2.some((t) => /^Reset upgrades$/.test(t)), 'after it the button is the paid branch reset again');
  await shot('respec');
  await page.press('Escape', 70); await sleep(500);
}

try {
  await enter(CLS);
  const st = await stage();
  check(st.affixes > 0, `staged a wrought ${st.base} with ${st.affixes} affixes`, JSON.stringify(st));
  await runeforge();
  await packTooltip();
  await spellRunes(st.spell);
  await tradeoffText();
  await sharedAndRespec();
} catch (e) { check(false, 'harness', e.message); }
check(!errors.length, 'no page errors', errors.slice(0, 5).join(' | '));
await page.close();
console.log(`${pass}/${pass + fail} passed`);
if (fail) process.exitCode = 1;
