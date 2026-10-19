/** which bounties carry effects beyond their reward (they would re-fire if a bounty repeats) */
import { Registry } from '@/core';
import type { QuestDef } from '@/core';
const b = (Registry.all('quest') as QuestDef[]).filter((q) => q.type === 'bounty');
const fx = b.filter((q) => q.stages.some((s) => (s.onComplete?.length || s.onEnter?.length)) || JSON.stringify(q.reward ?? {}).includes('lore'));
console.log('bounties', b.length, 'with stage effects or lore rewards', fx.length);
for (const q of fx.slice(0, 12)) console.log(q.id, JSON.stringify(q.stages.map((s) => [s.onEnter, s.onComplete]).flat().filter(Boolean)).slice(0, 160), JSON.stringify(q.reward?.lore ?? ''));
