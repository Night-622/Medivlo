/** Glyphs (SYSTEMS.md §6.2): support-gem items socketed into spells. Owner: Claude 3. */
import type { GlyphDef, ItemDef } from '@/core';

const glyph = (id: string, name: string, description: string, color: string, g: GlyphDef, itemLevel = 3, value = 160): ItemDef => ({
  id: `item:glyph-${id}`, name: `Glyph of ${name}`, description, itemKind: 'glyph', rarity: 'rare', itemLevel, value,
  icon: { shape: 'gem', color }, glyph: g,
});

const glyphs: ItemDef[] = [
  glyph('splitting', 'Splitting', 'Projectiles split: +2 projectiles, ×0.7 damage.', '#8db6f2', { appliesTo: ['projectile'], mods: [{ kind: 'extraProjectiles', value: 2, spreadDeg: 25 }, { kind: 'damageMult', value: 0.7 }] }),
  glyph('lingering', 'Lingering', 'Areas last twice as long, ×0.8 damage.', '#a3d68f', { appliesTo: ['area'], mods: [{ kind: 'durationMult', value: 2 }, { kind: 'damageMult', value: 0.8 }] }),
  glyph('echo', 'Echo', 'The spell recasts itself after 1 s at ×0.4 damage.', '#c9a2f0', { appliesTo: ['projectile', 'area', 'melee'], mods: [{ kind: 'echo', delayMs: 1000, damageMult: 0.4 }] }, 6, 260),
  glyph('haste', 'Haste', '×0.75 cooldown, ×1.3 cost.', '#f4ff9a', { appliesTo: ['projectile', 'area', 'melee', 'buff', 'movement'], mods: [{ kind: 'cooldownMult', value: 0.75 }, { kind: 'costMult', value: 1.3 }] }),
  glyph('cinders', 'Cinders', '50% of the spell’s damage becomes fire, +20 Burn buildup.', '#ffb04a', { appliesTo: ['projectile', 'area', 'melee'], mods: [{ kind: 'convert', from: 'all', to: 'fire', pct: 0.5 }, { kind: 'addBuildup', status: 'burn', value: 20 }] }),
  glyph('frost', 'Frost', '50% of the spell’s damage becomes frost, +20 Frozen buildup.', '#bdf0f7', { appliesTo: ['projectile', 'area', 'melee'], mods: [{ kind: 'convert', from: 'all', to: 'frost', pct: 0.5 }, { kind: 'addBuildup', status: 'frozen', value: 20 }] }),
  glyph('storms', 'Storms', '50% of the spell’s damage becomes lightning, +20 Shock buildup.', '#f4ff9a', { appliesTo: ['projectile', 'area', 'melee'], mods: [{ kind: 'convert', from: 'all', to: 'lightning', pct: 0.5 }, { kind: 'addBuildup', status: 'shock', value: 20 }] }),
  glyph('piercing', 'Piercing', 'Projectiles pierce 2 more targets.', '#e8d9b5', { appliesTo: ['projectile'], mods: [{ kind: 'pierce', value: 2 }] }),
  glyph('siphon', 'Siphon', '5% of damage dealt returns as Ember.', '#3b6fd1', { appliesTo: ['projectile', 'area', 'melee'], mods: [{ kind: 'effect', effect: { kind: 'hook', hook: 'siphon', params: { pct: 0.05 } } }] }),
  glyph('detonation', 'Detonation', 'Projectiles explode on impact (80 px) for 50% damage.', '#e0661c', { appliesTo: ['projectile'], mods: [{ kind: 'effect', effect: { kind: 'hook', hook: 'detonate', params: { radius: 80, pct: 0.5 } } }] }, 6, 260),
  glyph('homing', 'Homing', 'Projectiles seek their target.', '#c9a2f0', { appliesTo: ['projectile'], mods: [{ kind: 'effect', effect: { kind: 'hook', hook: 'homing', params: { deg: 180 } } }] }),
  glyph('widening', 'Widening', '+40% area.', '#a3d68f', { appliesTo: ['area'], mods: [{ kind: 'areaMult', value: 1.4 }] }),
];

export default glyphs;
