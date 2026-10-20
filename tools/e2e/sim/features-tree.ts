/**
 * Features gate, part 2: the skill tree. Every learnable rank of all 72 nodes changes the compiled character, every
 * hook a node (or kit, set, legendary) relies on is read by the sim, a point spent in each branch shows in the
 * sim, school keystones work and exclude each other, and a branch reset refunds points for 10 × level Embershards.
 */
import { readdirSync, readFileSync } from 'fs';
import path from 'path';
import { CLASS_SCHOOL } from '@/core/constants';
import { HC_KITS } from '@/data/classes/hc/kits';
import { HC_LEGENDARIES } from '@/data/items/hc/legendary.gen';
import { Btn } from '@/net/types';
import { availablePoints, newCharacter } from '@/systems/rules/character';
import { resetCost } from '@/systems/rules/curves';
import { ATTUNED, legendaryPassive } from '@/systems/rules/gear';
import { playerPassives } from '@/systems/rules/playerStats';
import { compile } from '@/systems/rules/stats';
import { allNodes, buildTree, canLearn, resetBranch } from '@/systems/rules/tree';
import type { CharacterSave, Passive, TreeBranch } from '@/systems/rules/types';
import { sanitizeLoadout } from '@/systems/rules/validate';
import { spellView } from '@/systems/sim/player';
import { ULT_PATH, learnViaLoadout } from './features-casts';
import { check, DT, dummy, hero, near, world } from './features-harness';

const save = (classId: string, level: number, tree: Record<string, number> = {}): CharacterSave => ({ ...newCharacter(classId), level, tree });

/** Everything compiled from a save, as one comparable string. */
function signature(s: CharacterSave): string {
  const { passives, spells } = playerPassives(s);
  const c = compile(passives);
  const round = (t: Record<string, number>) => Object.fromEntries(Object.entries(t).sort().map(([k, v]) => [k, Math.round(v * 1e6) / 1e6]));
  return JSON.stringify([round(c.stats), round(c.more), c.conditional, c.procs, [...c.hooks].sort(), c.spellMods, [...spells].sort()]);
}

function everyNodeChangesSomething(classId: string): void {
  for (const branch of ['spells', 'skills', 'upgrades'] as TreeBranch[]) {
    const dead: string[] = [];
    let ranks = 0;
    const nodes = buildTree(classId, branch).filter((n) => !n.free);
    for (const n of nodes) {
      for (let r = 1; r <= n.maxRank; r++) {
        ranks++;
        const before = signature(save(classId, 40, r > 1 ? { [n.id]: r - 1 } : {}));
        if (signature(save(classId, 40, { [n.id]: r })) === before) dead.push(`${n.id} r${r} (${n.name})`);
      }
    }
    check(!dead.length, `${classId} ${branch}: all ${nodes.length} learnable nodes (${ranks} ranks) change the compiled character`, `no change: ${dead.join(', ')}`);
  }
}

/** A hook only matters if the sim reads it: look for its id in src/systems/sim and the rules that consume hooks. */
function hooksAreRead(): void {
  const dirs = ['src/systems/sim', 'src/systems/rules'];
  const skip = new Set(['tree.ts', 'gear.ts', 'types.ts', 'describeHc.ts', 'spellText.ts']); // where hooks are authored or only described
  const src = dirs.flatMap((d) => readdirSync(path.join(process.cwd(), d)).filter((f) => f.endsWith('.ts') && !skip.has(f)).map((f) => readFileSync(path.join(process.cwd(), d, f), 'utf8'))).join('\n');
  // the authoring files can read a hook too (tree.ts scales a keystone by keystonePower): count real reads there
  const authored = dirs.flatMap((d) => readdirSync(path.join(process.cwd(), d)).filter((f) => skip.has(f)).map((f) => readFileSync(path.join(process.cwd(), d, f), 'utf8'))).join('\n');
  const readIn = (s: string, id: string) => [`id === '${id}'`, `hooks.get('${id}')`, `, '${id}')`].some((x) => s.includes(x));
  const read = (id: string): boolean => {
    if (src.includes(`'${id}'`) || src.includes(`"${id}"`) || readIn(authored, id)) return true;
    const i = id.indexOf(':');
    return i > 0 && src.includes(`\`${id.slice(0, i + 1)}\${`) || (i > 0 && src.includes(`'${id.slice(0, i + 1)}'`));
  };
  const owners = new Map<string, Set<string>>();
  const add = (p: Passive, who: string) => { for (const h of p.hooks ?? []) (owners.get(h.id) ?? owners.set(h.id, new Set()).get(h.id)!).add(who); };
  for (const classId of Object.keys(CLASS_SCHOOL)) for (const n of allNodes(classId)) for (const e of n.effects) add(e, `${n.name} (${n.id})`);
  for (const k of HC_KITS) add(k.passive, `${k.classId} kit`);
  for (const [school, p] of Object.entries(ATTUNED)) add(p, `Attuned ${school}`);
  for (const l of HC_LEGENDARIES) add(legendaryPassive(l.id), l.id);
  for (const [id, who] of [...owners].sort()) {
    const list = [...who];
    check(read(id), `hook '${id}' is read by the sim (${list.slice(0, 3).join(', ')}${list.length > 3 ? ` +${list.length - 3}` : ''})`, 'no reader in src/systems/sim or rules: the effect does nothing');
  }
}

/** One point in each branch, learned and sent as a remote loadout, shows up in the authority's hero. */
function pointPerBranch(): void {
  const w = world();
  const p = hero(w, 'a', save('warden', 5));
  const hpStat0 = p.base.stats.hp, st0 = p.staminaMax, pts0 = availablePoints(p.save);
  const kit0 = p.spells.get(p.kit.spells[0])!;
  learnViaLoadout(w, 'a', ['sk_p1a']);
  check(p.maxHp === Math.round(hpStat0 * 1.04) && availablePoints(p.save) === pts0 - 1, `skills: Toughness rank 1 → max HP ×1.04 (${Math.round(hpStat0)} → ${p.maxHp}), one point spent`, `maxHp ${p.maxHp}, points ${availablePoints(p.save)}`);
  learnViaLoadout(w, 'a', ['up_p2a']);
  check(p.staminaMax === st0 + 10, `upgrades: Endurance rank 1 → +10 max stamina (${st0} → ${p.staminaMax})`);
  learnViaLoadout(w, 'a', ['sp_p0m1', 'sp_p0m2']);
  const v = spellView(p, kit0);
  w.tick({ a: { aim: { x: 40, y: 0 } } });
  const em0 = p.ember, regen = (p.stats.stats.emberRegen ?? 5) * DT / 1000;
  w.tick({ a: { aim: { x: 40, y: 0 }, buttons: Btn.CAST1 } });
  const paid = em0 - p.ember + regen;
  check(near(v.dmg, 1.08) && near(paid, kit0.cost * 0.92), `spells: +8% ${kit0.name} damage (×${v.dmg.toFixed(2)}) and −8% Ember (${kit0.cost} → ${paid.toFixed(2)} paid in the sim)`, `dmg ×${v.dmg}, paid ${paid}`);
}

// path 1 (defence) feeds both keystones: t0 needs a fork of path 0 or 1, t1 one of path 1 or 2
const KEY_PATH = ['sk_p1a', 'sk_p1m1', 'sk_p1m2', 'sk_p1b', 'sk_p1c1'];
function learnAll(s: CharacterSave, ids: string[]): string[] {
  const bad: string[] = [];
  for (const id of ids) { const c = canLearn(s.classId, id, s.tree, availablePoints(s)); if (c.ok) s.tree[id] = (s.tree[id] ?? 0) + 1; else bad.push(`${id}: ${c.why}`); }
  return bad;
}

function keystones(classId: string): void {
  const why: string[] = [];
  const names = ['sk_t0', 'sk_t1'].map((id) => buildTree(classId, 'skills').find((n) => n.id === id)!.name);
  for (const [mine, other] of [['sk_t0', 'sk_t1'], ['sk_t1', 'sk_t0']]) {
    const s = save(classId, 12);
    why.push(...learnAll(s, KEY_PATH));
    const before = signature(s);
    why.push(...learnAll(s, [mine]));
    if (signature(s) === before) why.push(`${mine} changes nothing`);
    const c = canLearn(classId, other, s.tree, availablePoints(s));
    if (c.ok || !/keystone/.test(c.why)) why.push(`${other} still learnable after ${mine}`);
    if (!canLearn(classId, 'sk_u', s.tree, availablePoints(s)).ok) why.push(`capstone not reachable from ${mine}`);
    // the authority replays a forged tree holding both: only one keystone survives
    const forged = sanitizeLoadout({ ...s, tree: { ...s.tree, [other]: 1 } })!;
    if ((forged.tree.sk_t0 ?? 0) + (forged.tree.sk_t1 ?? 0) !== 1) why.push('authority kept both keystones');
  }
  check(!why.length, `${classId} keystones ${names.join(' / ')}: each learnable, each changes the hero, mutually exclusive (rules and authority)`, why.join('; '));
}

function keystoneBehaviour(): void {
  const withKey = (classId: string, key: 'sk_t0' | 'sk_t1') => { const s = save(classId, 12); learnAll(s, [...KEY_PATH, key]); return s; };
  // Blood Pact (umbral): spells cost health instead of Ember
  {
    const w = world();
    const p = hero(w, 'a', withKey('shade', 'sk_t0'));
    const sp = p.spells.get(p.save.hotbar[2]!)!; // a mark: no damage, so no lifesteal muddies the HP paid
    w.tick({ a: { aim: { x: 40, y: 0 } } });
    dummy(w, 40, 0, 12);
    const em0 = p.ember, hp0 = p.hp, regen = (p.stats.stats.emberRegen ?? 5) * DT / 1000;
    const want = (spellView(p, sp).cost / p.emberMax) * p.maxHp * 0.5;
    w.tick({ a: { aim: { x: 40, y: 0 }, buttons: Btn.CAST3 } });
    const paid = hp0 - p.hp;
    check(near(p.ember, Math.min(p.emberMax, em0 + regen)) && Math.abs(paid - want) <= p.maxHp * 0.0007 + 0.5, `Blood Pact: ${sp.name} costs ${want.toFixed(1)} HP and no Ember`, `ember ${em0}→${p.ember}, hp paid ${paid.toFixed(2)}`);
  }
  // Juggernaut (iron): cannot be stunned
  {
    const w = world();
    const k = hero(w, 'k', withKey('knight', 'sk_t0')), plain = hero(w, 'n', save('knight', 12), 200, 0);
    w.sim.applyStatus(k.id, { id: 'stun', dur: 1000 });
    w.sim.applyStatus(plain.id, { id: 'stun', dur: 1000 });
    check(!k.statuses.has('stun') && plain.statuses.has('stun'), 'Juggernaut keystone: the knight shrugs off a stun (one without it is stunned)');
  }
  // Winter's Patience (rime): 10% slower, spells hit 30% harder
  {
    const w = world();
    const a = hero(w, 'a', withKey('warden', 'sk_t1')), b = hero(w, 'b', save('warden', 12), 0, 300);
    w.run(1000, { a: { move: { x: 1, y: 0 } }, b: { move: { x: 1, y: 0 } } });
    const gap = b.x - a.x;
    check(near(gap, 13, 0.6) && near(a.stats.stats.spellDmg ?? 0, 0.3), `Winter’s Patience: walks ${gap.toFixed(1)} px less per second (130 × 10%), +30% spell damage`, `gap ${gap}, spellDmg ${a.stats.stats.spellDmg}`);
  }
  // Glacial Heart (rime): frozen foes shatter on death
  for (const key of [true, false]) {
    const w = world();
    const p = hero(w, 'a', key ? withKey('warden', 'sk_t0') : save('warden', 12));
    const id = w.sim.spawn({ creature: 'bx_wolf', level: 12, space: 't', x: 40, y: 0, dormant: true });
    const by = dummy(w, 70, 0, 12);
    w.sim.applyStatus(id, { id: 'freeze', dur: 2000 });
    const n0 = w.events.length;
    w.sim.damage(id, 1e12, 'physical', p.id);
    const shatter = w.since(n0, 'ability:cast').some((e) => e.p.ability === 'shatter');
    const splash = w.since(n0, 'combat:hit').some((e) => e.p.targetId === by.id && e.p.type === 'rime' && e.p.kind === 'dmg');
    check(key ? shatter && splash : !shatter, key ? 'Glacial Heart: a frozen wolf shatters on death and hits the foe beside it' : 'no Glacial Heart: no shatter');
  }
}

function branchReset(): void {
  for (const guest of [false, true]) {
    const w = world();
    const who = guest ? 'guest' : 'host';
    if (!guest) w.sim.localPlayer = 'a';
    const s0 = { ...save('warden', 10, { sk_p1a: 3, sk_p1m1: 1, up_p0a: 1 }), gold: 500 };
    w.sim.addPlayer('a', s0, { space: 't', x: 0, y: 0 });
    const p = w.player('a');
    const pts0 = availablePoints(p.save), cost = resetCost(10);
    // the client's resetTree(): pay 10 × level, drop the branch's ranks, resend the loadout
    const s = JSON.parse(JSON.stringify(p.save)) as CharacterSave;
    s.gold -= cost;
    s.tree = resetBranch(s.tree, 'skills');
    w.sim.receive({ type: 'loadout', data: s as unknown as Record<string, unknown> }, 'a');
    const want = compile(playerPassives({ ...s0, tree: { up_p0a: 1 } }).passives).stats.hp!;
    check(cost === 100 && availablePoints(p.save) === pts0 + 4 && p.save.tree.up_p0a === 1 && !p.save.tree.sk_p1a && p.maxHp === Math.round(want),
      `${who}: skills reset refunds its 4 points, keeps the upgrades branch, max HP back to ${Math.round(want)}`, `points ${pts0}→${availablePoints(p.save)}, tree ${JSON.stringify(p.save.tree)}, maxHp ${p.maxHp}`);
    check(p.save.gold === 500 - cost, `${who}: the authority's hero paid ${cost} Embershards (10 × level 10) for the reset`, `authority gold ${p.save.gold}, client paid ${cost} (500 → ${s.gold})`);
  }
  // spells-branch reset on a remote hero: the learned ultimate leaves the hotbar and can no longer be cast
  const w = world();
  w.sim.addPlayer('a', { ...save('warden', 12), gold: 500 }, { space: 't', x: 0, y: 0 });
  const ult = buildTree('warden', 'spells').find((n) => n.id === 'sp_u')!.grantsSpell!;
  learnViaLoadout(w, 'a', ULT_PATH, ult);
  const p = w.player('a');
  const had = p.spells.has(ult) && p.save.hotbar[3] === ult;
  const s = JSON.parse(JSON.stringify(p.save)) as CharacterSave;
  s.gold -= resetCost(12); // what the client's resetTree() pays
  s.tree = resetBranch(s.tree, 'spells');
  w.sim.receive({ type: 'loadout', data: s as unknown as Record<string, unknown> }, 'a');
  const n0 = w.events.length, em0 = p.ember;
  w.press('a', Btn.CAST4);
  const cast = w.since(n0, 'ability:cast').some((e) => e.p.ability === ult);
  check(had && !p.spells.has(ult) && p.save.hotbar[3] === null && !cast && p.ember >= em0 && p.save.gold === 500 - resetCost(12), 'spells reset: the ultimate leaves the hotbar and slot 4 casts nothing (authority charged)');
  // a guest who cannot pay keeps the branch (the real client refuses the reset; a forged one changes nothing)
  const w2 = world();
  w2.sim.addPlayer('b', save('warden', 12), { space: 't', x: 0, y: 0 });
  learnViaLoadout(w2, 'b', ULT_PATH, ult);
  const p2 = w2.player('b'), s2 = JSON.parse(JSON.stringify(p2.save)) as CharacterSave, g2 = p2.save.gold;
  s2.tree = resetBranch(s2.tree, 'spells');
  w2.sim.receive({ type: 'loadout', data: s2 as unknown as Record<string, unknown> }, 'b');
  check(g2 < resetCost(12) && p2.spells.has(ult) && p2.save.gold === g2, 'an unpaid guest reset keeps the branch and costs nothing', `gold ${g2} → ${p2.save.gold}, ultimate kept ${p2.spells.has(ult)}`);
}

export function treeChecks(only?: string): void {
  for (const classId of Object.keys(CLASS_SCHOOL)) {
    if (only && only !== classId) continue;
    everyNodeChangesSomething(classId);
    keystones(classId);
  }
  hooksAreRead();
  pointPerBranch();
  keystoneBehaviour();
  branchReset();
}
