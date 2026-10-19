/**
 * Bus wiring for the combat runtime: spawns (Claude 2), rests, chests, time of day, quest rewards (Claude 4).
 */
import { Registry, bus } from '@/core';
import type { DangerTier } from '@/core';
import { giveItem, removeItem } from '../items/Inventory';
import { createItem } from '../items/ItemRoller';
import { rollLoot } from '../items/Loot';
import { learnSpell } from '../progression/Character';
import { grantXp, questXp } from '../progression/Leveling';
import type { CombatRuntime } from './CombatRuntime';
import { grantTrait } from './outcomes';

export function installListeners(rt: CombatRuntime): () => void {
  const p = rt.player;
  const offs = [
    bus.on('enemy:spawn-request', ({ enemyId, level, x, y, zoneId, tier }) => {
      rt.setTier(tier as DangerTier);
      rt.spawnEnemy(enemyId, x, y, { level, tier: tier as DangerTier, zoneId });
    }),
    bus.on('enemy:despawn', ({ zoneId }) => rt.despawnZone(zoneId)),
    bus.on('world:rest', () => {
      p.fullRestore();
      p.spawnX = p.x;
      p.spawnY = p.y;
      rt.ui?.toast('You rest by the fire. Keep it lit.', '#e8d9b5');
    }),
    bus.on('time:phase-changed', ({ phase }) => { p.timePhase = phase; p.markDirty(); }),
    bus.on('interact', ({ kind, props }) => {
      if (kind !== 'chest' || typeof props.lootTable !== 'string') return;
      const level = typeof props.level === 'number' ? props.level : p.level;
      const drop = rollLoot(props.lootTable, {
        level, rarityBoost: p.stats.derived.itemFind * (typeof props.rarityBoost === 'number' ? props.rarityBoost : 1),
        goldFind: p.stats.derived.goldFind, proficient: p.stats.collected.proficientWeapons,
      });
      for (const it of drop.items) rt.pickups.spawnItem(it, p.x, p.y + 10, rt.now);
      if (drop.gold) rt.pickups.spawnGold(drop.gold, p.x, p.y + 10, rt.now);
    }),
    bus.on('quest:take-item', ({ item, qty }) => {
      if (!removeItem(p.gs, item, qty)) console.warn(`[quest] take-item: player lacks ${qty}× ${item}`);
      p.markDirty();
    }),
    bus.on('quest:reward', (r) => {
      const gs = p.gs;
      const parts: string[] = [];
      if (r.xpTier) {
        const xp = Math.round(questXp(gs.player.progression.level, r.xpTier) * p.stats.derived.xpGain);
        grantXp(gs, xp, `quest:${r.questId}`);
        parts.push(`+${xp} XP`);
      }
      for (const it of r.items ?? []) {
        const def = Registry.tryGet('item', it.item);
        if (!def) { console.warn(`[reward] unknown item ${it.item}`); continue; }
        if (!giveItem(gs, it.item, it.qty ?? 1)) rt.pickups.spawnItem(createItem(def, { qty: it.qty ?? 1 }), p.x, p.y, rt.now);
        rt.onItemPicked({ def: it.item });
        parts.push(`${def.name}${(it.qty ?? 1) > 1 ? ` ×${it.qty}` : ''}`);
      }
      for (const t of r.traits ?? []) grantTrait(rt, t);
      if (r.skillPoints) {
        gs.player.progression.unspentSkillPoints += r.skillPoints;
        gs.player.progression.bonusSkillPoints += r.skillPoints;
        parts.push(`+${r.skillPoints} skill point${r.skillPoints > 1 ? 's' : ''}`);
      }
      if (r.gold) { gs.player.inventory.gold += r.gold; parts.push(`+${r.gold} gold`); }
      if (r.tome && Registry.tryGet('spell', r.tome)) {
        learnSpell(gs, r.tome);
        parts.push(`Learned ${Registry.get('spell', r.tome).name}`);
      }
      p.markDirty();
      bus.emit('stats:changed', {});
      if (parts.length) rt.ui?.toast(`Reward: ${parts.join(', ')}`, '#d4a646');
    }),
  ];
  return () => offs.forEach((o) => o());
}
