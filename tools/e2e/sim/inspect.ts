/** Print a creature's resolved combat def. Run: node tools/e2e/sim/run.mjs inspect bx_ash_5 [level] */
import { creature, creatureStats } from '@/systems/rules/creatures';
const [id, lvl] = process.argv.slice(3);
const d = creature(id)!;
const L = Number(lvl ?? 10);
console.log(d.name, d.tier, d.arch, d.kind, 'ai', JSON.stringify(d.ai), 'stats@' + L, JSON.stringify(creatureStats(d, L, 1)));
const show = (a: (typeof d.abilities)[number]) => `  [${a.use} cd ${a.cd} r ${a.range} wind ${a.windup}] ${a.text} → ${JSON.stringify(a.actions).slice(0, 220)}`;
d.abilities.forEach((a) => console.log(show(a)));
d.phases.forEach((p, i) => p.forEach((a) => console.log(`P${i + 1}` + show(a))));
d.onDeath.forEach((a) => console.log('death' + show(a)));
console.log('hooks', JSON.stringify(d.hooks), 'drops', JSON.stringify(d.drops));
