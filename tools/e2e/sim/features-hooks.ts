/**
 * Behaviour of the keystone / kit / upgrade hooks the sim reads on a clock or a trigger (Claude 3): Eye of the Storm,
 * Halo, Avatar capstones (keystonePower), Pyromaniac's singe, Sure Footed, Lucky, the Bard / Skald auras.
 * The static "hook is read" scan lives in features-tree.ts; this proves each one does what its node says.
 */
import type { CharacterSave } from '@/systems/rules/types';
import { newCharacter } from '@/systems/rules/character';
import { compileStats } from '@/systems/rules/playerStats';
import { applyStatus, dealDamage } from '@/systems/sim/combat';
import { openChest } from '@/systems/sim/loot';
import { Btn } from '@/net/types';
import { check, dummy, hero, world } from './features-harness';

const save = (classId: string, tree: Record<string, number>, level = 20): CharacterSave => ({ ...newCharacter(classId), level, tree });

function stormCharge(): void {
  const w = world(), p = hero(w, 'a', save('stormlancer', { sk_t1: 1 }));
  w.run(3600);
  const built = p.stormCharge ?? 0;
  w.run(4000);
  const capped = p.stormCharge ?? 0;
  p.stormCharge = 0;
  w.run(1500, { a: { move: { x: 1, y: 0 } } });
  const moving = p.stormCharge ?? 0;
  check(built === 3 && capped === 5 && moving === 0, 'Eye of the Storm: standing still builds a charge a second (max 5); moving builds none', `3.6 s → ${built}, +4 s → ${capped}, 1.5 s moving → ${moving}`);
  // the next real hit spends them: 3 charges → +75%, crits switched off so the comparison is exact
  const d = dummy(w, 40, 0);
  p.stats = { ...p.stats, stats: { ...p.stats.stats, crit: -10 } };
  const plain = dealDamage(w.sim.w, p, d, 100, 'storm');
  p.stormCharge = 3;
  const charged = dealDamage(w.sim.w, p, d, 100, 'storm');
  check(Math.abs(charged / plain - 1.75) < 0.01 && (p.stormCharge ?? 0) === 0, 'Eye of the Storm: the next hit spends 3 charges for +75% damage', `${plain.toFixed(1)} → ${charged.toFixed(1)}, charges left ${p.stormCharge}`);
}

function halo(): void {
  const w = world(), p = hero(w, 'a', save('cantor', { sk_t1: 1 }));
  const shade = dummy(w, 60, 0, 10, 'bx_umbral_0'), wolf = dummy(w, -60, 0, 10, 'bx_wolf');
  const n0 = w.events.length;
  w.run(2500);
  const hits = (id: string) => w.since(n0, 'combat:hit').filter((e) => e.p.sourceId === p.id && e.p.targetId === id).length;
  check(hits(shade.id) >= 2 && hits(wolf.id) === 0, 'Halo: the ring of light burns Umbral foes near you, nothing else', `umbral hit ${hits(shade.id)}×, wolf ${hits(wolf.id)}×`);
}

function auras(): void {
  for (const [cls, stat] of [['bard', 'dmg'], ['skald', 'armor']] as const) {
    const w = world({ party: 3 });
    const p = hero(w, 'a', save(cls, {})), near = hero(w, 'b', save('warden', {}), 150, 0), far = hero(w, 'c', save('warden', {}), 900, 0);
    w.run(1300);
    const has = (q: typeof p) => q.buffs.some((b) => b.id === `aura:${p.id}` && b.mods.some((m) => m.stat === stat));
    check(has(p) && has(near) && !has(far), `${cls} aura: you and allies within 300 px get +${stat}, a far ally does not`, `self ${has(p)}, near ${has(near)}, far ${has(far)}`);
  }
}

function keystonePower(): void {
  // Winter's Patience (rime sk_t1): +30% spell damage; with Avatar of Rime (sk_u) it is 50% stronger
  const base = compileStats(save('rimecaller', { sk_t1: 1 })).stats.spellDmg ?? 0;
  const avatar = compileStats(save('rimecaller', { sk_t1: 1, sk_u: 1 })).stats.spellDmg ?? 0;
  check(Math.abs(base - 0.3) < 1e-6 && Math.abs(avatar - 0.45) < 1e-6, 'Avatar capstone: the learned keystone is 50% stronger', `spell damage ${base} → ${avatar}`);
}

function selfSinge(): void {
  const w = world(), p = hero(w, 'a', save('arcanist', { sk_t0: 1 })), d = dummy(w, 40, 0);
  const hp0 = p.hp;
  applyStatus(w.sim.w, p, d, { id: 'burn', dur: 2000 });
  const once = hp0 - p.hp;
  applyStatus(w.sim.w, p, d, { id: 'burn', dur: 2000 });
  const twice = hp0 - p.hp;
  const w2 = world(), q = hero(w2, 'a', save('arcanist', {})), d2 = dummy(w2, 40, 0);
  const q0 = q.hp;
  applyStatus(w2.sim.w, q, d2, { id: 'burn', dur: 2000 });
  check(once > 0 && once <= p.maxHp * 0.01 + 1e-6 && Math.abs(twice - once) < 0.01 && q.hp === q0, 'Pyromaniac: setting a burn singes you for up to 1% max HP after mitigation (at most every 0.5 s); without it, nothing', `singe ${once.toFixed(1)}, second burn within 0.5 s +${(twice - once).toFixed(1)}, no keystone −${q0 - q.hp}`);
}

function sureFooted(): void {
  const slowedMidDash = (tree: Record<string, number>): boolean => {
    const w = world(), p = hero(w, 'a', save('warden', tree));
    w.run(500);
    w.press('a', Btn.DASH, { move: { x: 1, y: 0 } });
    applyStatus(w.sim.w, null, p, { id: 'slow', dur: 2000, power: 0.4 });
    return p.statuses.has('slow');
  };
  const withNode = slowedMidDash({ up_p0c2: 1 }), without = slowedMidDash({});
  check(!withNode && without, 'Sure Footed: a slow cannot land while you dash (and does without the node)', `with ${withNode}, without ${without}`);
}

function lucky(): void {
  const gear = (tree: Record<string, number>): number => {
    const w = world({ seed: 11 }), p = hero(w, 'a', save('warden', tree));
    for (let i = 0; i < 300; i++) openChest(w.sim.w, p, `obj:chest-${i}`, { level: 10 });
    return [...w.sim.w.loot.values()].filter((l) => l.item && !/^i_/.test(l.item.base)).length;
  };
  const plain = gear({}), luck = gear({ up_t1: 1 });
  check(luck - plain >= 15, 'Lucky: chests hold an extra item about 10% of the time', `gear from 300 chests: ${plain} → ${luck}`);
}

export function hookChecks(): void {
  stormCharge();
  halo();
  auras();
  keystonePower();
  selfSinge();
  sureFooted();
  lucky();
}
