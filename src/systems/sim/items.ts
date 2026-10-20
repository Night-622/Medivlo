/**
 * Using items from the pack (Claude 3): potions, food (out of combat), tonics, scrolls (free school casts),
 * the Old Abbey Tome (+1 skill point), powder bombs. Authority-validated `act useItem`.
 */
import { readTome } from './runes';
import { P } from '@/systems/rules/curves';
import { scrollSpell } from '@/systems/rules/spells';
import type { Action, Modifier } from '@/systems/rules/types';
import { runActions } from './actions';
import { addBuff, basicCast, heal } from './combat';
import { cast, consumeItem, potion } from './player';
import type { PlayerEnt } from './state';
import type { SimWorld } from './world';

const m = (stat: Modifier['stat'], value: number): Modifier => ({ stat, op: 'flat', value });
const FOOD: Record<string, { hp: number; ember?: number; over?: number; party?: boolean; buff?: Modifier[] }> = {
  i_bread: { hp: 30 }, i_cheese: { hp: 40 }, i_apple: { hp: 20 }, i_fish: { hp: 35 },
  i_roast: { hp: 80, buff: [m('dmg', 0.1)] }, i_pie: { hp: 60, party: true }, i_stew: { hp: 50, ember: 30 }, i_cake: { hp: 100, over: 10_000 },
};
const TONIC: Record<string, Action[]> = {
  i_st: [{ a: 'resource', stamina: 999 }, { a: 'buff', id: 'second-wind', dur: 5000, to: 'self', flags: ['freeDash'] }],
  i_anti: [{ a: 'cleanse', to: 'self' }],
  i_ashward: [{ a: 'buff', id: 'ashward', dur: 60_000, to: 'self', mods: [m('resist.ash', 0.4)] }],
  i_moon: [{ a: 'buff', id: 'moonless', dur: 8000, to: 'self', flags: ['stealth'] }],
  i_bomb: [{ a: 'damage', coef: 2.5, kind: 'ash', area: { shape: 'circle', at: 'aim', r: 70 }, status: [{ id: 'burn', dur: 3000 }], flags: ['knockback'] }],
};

/** Returns true if the item was used (and consumed). */
export function useItem(w: SimWorld, p: PlayerEnt, uid: string): boolean {
  const it = p.save.inventory.find((x) => x.uid === uid);
  if (!it || p.dead || p.downed) return false;
  const id = it.base;
  if (readTome(w, p, uid)) return true;
  if (id === 'i_hp_s' || id === 'i_hp_l') return potion(w, p, 'q');
  if (id === 'i_em_s' || id === 'i_em_l') return potion(w, p, 'e');
  const food = FOOD[id];
  if (food) {
    if (w.t < p.inCombatUntil) return false;
    const amt = food.hp * P(p.level);
    const who = food.party ? [...w.players.values()].filter((o) => !o.dead && o.space === p.space && Math.hypot(o.x - p.x, o.y - p.y) < 200) : [p];
    for (const o of who) {
      if (food.over) { const n = food.over / 500; for (let i = 1; i <= n; i++) w.later(i * 500, () => heal(w, p, o, amt / n, i < n)); }
      else heal(w, p, o, amt);
    }
    if (food.ember) p.ember = Math.min(p.emberMax, p.ember + food.ember);
    if (food.buff) addBuff(w, p, p, { a: 'buff', id: `food:${id}`, dur: 60_000, to: 'self', mods: food.buff });
    consumeItem(w, p, uid);
    return true;
  }
  if (TONIC[id]) {
    runActions(w, TONIC[id], { ...basicCast(w, p, null, true), aim: p.aim, power: (p.stats.stats.sp ?? 10) + 10 * P(p.level) });
    consumeItem(w, p, uid);
    return true;
  }
  const sp = scrollSpell(id);
  if (sp) {
    if (!cast(w, p, -1, sp)) return false;
    consumeItem(w, p, uid);
    return true;
  }
  if (id === 'i_tome') {
    p.save.bonusPoints++;
    consumeItem(w, p, uid);
    return true;
  }
  return false;
}
