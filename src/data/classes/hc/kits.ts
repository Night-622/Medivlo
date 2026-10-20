/**
 * The 24 class kits (Claude 3): weapons, starting weapon, basic-attack overrides, the three kit spells and the
 * class mechanic as a Passive. Identity text lives in classes.gen.ts (handoff).
 */
import { HC_KIT_SPELLS } from '@/data/spells/hc/kit-spells';
import type { HcKit, Modifier, Passive, Proc, WeaponType } from '@/systems/rules/types';
import { HC_CLASSES } from './classes.gen';

const f = (stat: Modifier['stat'], value: number, when?: Modifier['when']): Modifier => ({ stat, op: 'flat', value, when });
const onHit = (every: number, d: Proc['do']): Proc => ({ on: 'hit', every, do: d });
const momentum: Proc = onHit(3, [{ a: 'resource', momentum: 1 }]);

/**
 * Damage tuning per class (pacing pass, measured in tools/e2e/sim fight at L14 vs realm bosses): pulls every class
 * toward its role's output (damage 160, tank 125, support 115 boss DPS) by a partial correction, so they stay distinct.
 */
const DMG_SCALE: Record<string, number> = {
  warden: 1.25, rimecaller: 0.92, ranger: 1.12, hedgewitch: 1.22, arcanist: 0.9, reaver: 0.81, stormlancer: 1.05, sparkwright: 0.7,
  oathbound: 1.12, cantor: 1.3, shade: 0.9, duskweaver: 1.07, swordsman: 1.02, samurai: 0.84, knight: 1.46, juggernaut: 1.65,
  monk: 1.28, brawler: 0.78, huntsman: 0.75, falconer: 1.06, corsair: 1.4, jester: 1.07, bard: 1.13, skald: 1.28,
};

const TANKS = new Set(['warden', 'knight', 'juggernaut', 'oathbound']);

function kit(classId: string, weapons: WeaponType[], passive: Passive, extra: Partial<HcKit> = {}): HcKit {
  const c = HC_CLASSES.find((x) => x.id === classId)!;
  const scale = DMG_SCALE[classId] ?? 1;
  if (scale !== 1) passive = { ...passive, mods: [...(passive.mods ?? []), { stat: 'dmg', op: 'more', value: scale - 1 }] };
  // tanks draw the boss in a party (threat ×1.5; sim/enemy.ts)
  if (TANKS.has(classId)) passive = { ...passive, hooks: [...(passive.hooks ?? []), { id: 'threatPower', value: 0.5 }] };
  const spells = c.abilities.map((a) => HC_KIT_SPELLS.find((s) => s.name === a.name)!.id) as [string, string, string];
  return { classId, weapons, startWeapon: `w_${weapons[0]}_wood`, spells, passive, ...extra };
}

export const HC_KITS: HcKit[] = [
  // Rime
  kit('warden', ['sword', 'mace', 'spear'], {
    mods: [f('block', 0.1), f('resist.rime', 0.25)],
    procs: [{ on: 'hit', chance: 0.3, do: [{ a: 'status', status: { id: 'chill', dur: 1500 }, area: { shape: 'single', at: 'target' } }] }],
  }, { canBlock: true }),
  kit('rimecaller', ['staff', 'wand'], { mods: [f('dmg', 0.12, { c: 'targetHas', status: 'chill' }), f('slowPower', 0.1)], hooks: [{ id: 'chillToFreeze' }] }),
  // Verdant
  kit('ranger', ['bow'], { mods: [f('dmg', 0.1, { c: 'targetFar', px: 200 }), f('moveSpeed', 0.05)] }, { basic: { visual: 'arrow' } }),
  kit('hedgewitch', ['staff', 'wand'], { mods: [f('healing', 0.15), f('potionHeal', 0.3), f('rootDur', 0.25)] }),
  // Ash
  kit('arcanist', ['staff', 'wand'], { mods: [f('dmg.ash', 0.1)], procs: [{ on: 'kill', do: [{ a: 'resource', ember: 5 }] }] }, { basic: { kind: 'ash', visual: 'ember-spark' } }),
  kit('reaver', ['axe', 'sword', 'mace'], { mods: [f('dmg', 0.2, { c: 'hpBelow', pct: 0.5 }), f('lifesteal', 0.07)] }),
  // Storm
  kit('stormlancer', ['spear'], { mods: [f('resist.storm', 0.25)], procs: [onHit(4, [{ a: 'chain', coef: 0.4, kind: 'storm', jumps: 2, range: 120 }])] }),
  kit('sparkwright', ['wand', 'staff', 'mace'], { mods: [f('cdr', 0.1), f('resist.storm', 0.25)], hooks: [{ id: 'zoneDur', value: 0.25 }] }, { basic: { kind: 'storm', visual: 'spark' } }),
  // Radiance
  kit('oathbound', ['mace', 'sword'], { mods: [f('healingTaken', 0.15), f('block', 0.1), { stat: 'armor', op: 'pct', value: 0.1 }] }, { canBlock: true }),
  kit('cantor', ['mace', 'wand', 'staff'], { mods: [f('healing', 0.2), f('buffDur', 0.2)] }, { basic: { kind: 'radiance', visual: 'censer' } }),
  // Umbral
  kit('shade', ['dagger', 'sword'], { mods: [f('dmg', 0.25, { c: 'behind' }), f('lifesteal', 0.06)], hooks: [{ id: 'stealthOutOfCombat', value: 3000 }, { id: 'behindUmbral' }] }, { basic: { hits: 2 } }),
  kit('duskweaver', ['wand', 'staff', 'dagger'], { mods: [f('dmg', 0.15, { c: 'targetHas', status: 'linked' }), f('lifesteal', 0.03)] }, { basic: { kind: 'umbral', visual: 'crescent' } }),
  // Blade
  kit('swordsman', ['sword'], { mods: [f('crit', 0.05), f('atkSpeed', 0.1), f('lifesteal', 0.04)], procs: [{ on: 'parry', do: [{ a: 'resource', stamina: 25 }] }] }),
  kit('samurai', ['sword'], { mods: [f('critd', 0.4), f('lifesteal', 0.04), f('crit', 0.1, { c: 'targetHpAbove', pct: 0.8 })] }),
  // Iron
  kit('knight', ['sword', 'mace', 'spear'], { mods: [f('block', 0.15), { stat: 'armor', op: 'pct', value: 0.15 }] }, { canBlock: true }),
  kit('juggernaut', ['mace', 'axe'], { mods: [{ stat: 'hp', op: 'pct', value: 0.15 }, f('stunTaken', -0.5), f('moveSpeed', -0.05)] }),
  // Fist
  kit('monk', ['staff', 'spear'], { mods: [f('dashCharges', 1)], procs: [momentum] }),
  kit('brawler', ['mace', 'dagger'], { mods: [{ stat: 'hp', op: 'pct', value: 0.1 }], procs: [momentum] }, { basic: { form: 'melee', range: 52, interval: 500, visual: 'fist' } }),
  // Hunt
  kit('huntsman', ['bow'], { mods: [f('dmg', 0.1, { c: 'targetHas', status: 'mark' })], hooks: [{ id: 'trapPower', value: 0.25 }] }, { basic: { interval: 900, coef: 1.3, visual: 'bolt' } }),
  kit('falconer', ['bow', 'dagger'], { hooks: [{ id: 'hawk' }] }),
  // Guile
  kit('corsair', ['sword', 'dagger'], { mods: [f('gold', 0.25), f('lifesteal', 0.04)], procs: [{ on: 'hit', chance: 0.1, do: [{ a: 'status', status: { id: 'blind', dur: 1000 }, area: { shape: 'single', at: 'target' } }] }] }),
  kit('jester', ['dagger', 'wand'], { procs: [{ on: 'attack', every: 5, do: [{ a: 'buff', id: 'punchline-crit', dur: 3000, to: 'self', charges: 1, flags: ['nextHitsCrit'] }] }] }),
  // Song
  kit('bard', ['wand', 'dagger'], { mods: [f('buffDur', 0.25)], hooks: [{ id: 'aura:dmg', value: 0.05 }] }, { basic: { form: 'ranged', kind: 'song', visual: 'note' } }),
  kit('skald', ['axe', 'mace'], { mods: [f('buffDur', 0.2)], procs: [onHit(4, [{ a: 'buff', id: 'rhythm', dur: 4000, to: 'self', mods: [f('dmg', 0.05)] }])], hooks: [{ id: 'aura:armor', value: 0.1 }] }),
];

export const kitFor = (classId: string): HcKit => {
  const k = HC_KITS.find((x) => x.classId === classId);
  if (!k) throw new Error(`[kits] unknown class ${classId}`);
  return k;
};

/** Spells scale with weapon power when Might outranks Arcana, otherwise with spell power. */
export const spellScaling = (classId: string): 'weapon' | 'spell' => {
  const c = HC_CLASSES.find((x) => x.id === classId)!;
  return c.rating.might > c.rating.arcana ? 'weapon' : 'spell';
};
