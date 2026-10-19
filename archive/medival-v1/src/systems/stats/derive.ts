/**
 * Derived stats from attributes + level + modifiers (SYSTEMS.md §1.2). Pure.
 */
import type { AttributeId, BuildupStatus, DamageType, MagicSchool } from '@/core';
import {
  ATTRIBUTES, BASE_CRIT_MULT, BASE_MOVE_SPEED, CDR_CAP, CINDERLUNG_HP_PER_STACK, PARRY_WINDOW_MS, STAMINA_REGEN_PER_SEC,
  RESIST_CAP, RESIST_FLOOR,
} from '../balance';
import type { StatBlock } from './StatBlock';

export interface Derived {
  attributes: Record<AttributeId, number>;
  maxHp: number;
  maxStamina: number;
  maxMana: number;
  hpRegen: number;
  staminaRegen: number;
  manaRegen: number;
  armor: number;
  poise: number;
  moveSpeed: number;
  attackSpeed: number;     // multiplier
  castSpeed: number;       // multiplier
  critChance: number;
  critMultiplier: number;
  cooldownReduction: number;
  blockCostMult: number;
  blockStability: number;  // flat bonus to shield stability
  parryWindowMs: number;
  dodgeCostMult: number;
  dodgeDistanceMult: number;
  equipCapacity: number;
  healingReceived: number;
  healingDone: number;
  lifeOnKill: number;      // fraction of max HP
  lifeLeech: number;       // fraction of damage dealt
  statusResist: number;
  itemFind: number;
  goldFind: number;
  xpGain: number;
  draughtCharges: number;
  abilitySlots: number;
  resist: Record<DamageType, number>;
}

const DAMAGE_TYPES: DamageType[] = ['slash', 'pierce', 'blunt', 'fire', 'frost', 'lightning', 'radiant', 'shadow', 'poison'];
export const ALL_DAMAGE_TYPES: readonly DamageType[] = DAMAGE_TYPES;
export const ALL_SCHOOLS: readonly MagicSchool[] = ['ash', 'rime', 'storm', 'radiance', 'umbral', 'verdant'];
export const ALL_BUILDUP: readonly BuildupStatus[] = ['bleed', 'burn', 'frozen', 'shock', 'poison'];

const above10 = (v: number) => Math.max(0, v - 10);

export function deriveStats(
  baseAttributes: Record<AttributeId, number>,
  level: number,
  b: StatBlock,
  opts: { cinderlung?: number; baseResist?: Partial<Record<DamageType, number>> } = {},
): Derived {
  const attributes = {} as Record<AttributeId, number>;
  for (const a of ATTRIBUTES) attributes[a] = Math.round(b.total(a, baseAttributes[a] ?? 10));
  const { might: MIG, finesse: FIN, vigor: VIG, intellect: INT, will: WIL } = attributes;

  const cinder = 1 - CINDERLUNG_HP_PER_STACK * (opts.cinderlung ?? 0);
  const resist = {} as Record<DamageType, number>;
  for (const t of DAMAGE_TYPES) {
    resist[t] = Math.max(RESIST_FLOOR, Math.min(RESIST_CAP, b.pct(`resist.${t}`, opts.baseResist?.[t] ?? 0)));
  }

  return {
    attributes,
    maxHp: Math.round(b.total('maxHp', 60 + 5 * VIG + 10 * (level - 1)) * cinder),
    maxStamina: Math.round(b.total('maxStamina', 80 + 2 * VIG + FIN)),
    maxMana: Math.round(b.total('maxMana', 30 + 4 * INT + 2 * WIL)),
    hpRegen: b.total('hpRegen', 0),
    staminaRegen: b.total('staminaRegen', STAMINA_REGEN_PER_SEC),
    manaRegen: b.total('manaRegen', 1 + 0.08 * WIL),
    armor: Math.round(b.total('armor', 0)),
    poise: Math.round(b.total('poise', 20 + 0.5 * MIG)),
    moveSpeed: b.total('moveSpeed', BASE_MOVE_SPEED),
    attackSpeed: b.pct('attackSpeed', 1 + 0.005 * above10(FIN)),
    castSpeed: b.pct('castSpeed', 1 + 0.005 * above10(INT)),
    critChance: Math.max(0, b.pct('critChance', 0.05 + 0.003 * above10(FIN))),
    critMultiplier: b.pct('critMultiplier', BASE_CRIT_MULT),
    cooldownReduction: Math.min(CDR_CAP, Math.max(0, b.pct('cooldownReduction'))),
    blockCostMult: Math.max(0.1, 1 - b.pct('blockEfficiency')),
    blockStability: b.pct('blockStability'),
    parryWindowMs: b.total('parryWindow', PARRY_WINDOW_MS),
    dodgeCostMult: Math.max(0.2, 1 + b.pct('dodgeCost')),
    dodgeDistanceMult: Math.max(0.3, 1 + b.pct('dodgeDistance')),
    equipCapacity: b.total('equipLoad', 30 + 1.5 * MIG + 0.5 * VIG),
    healingReceived: Math.max(0, b.mult('healingReceived')),
    healingDone: Math.max(0, b.mult('healingDone')),
    lifeOnKill: b.pct('lifeOnKill'),
    lifeLeech: b.pct('lifeLeech'),
    statusResist: b.pct('statusResist', 0.005 * (above10(VIG) + above10(WIL))),
    itemFind: b.mult('itemFind'),
    goldFind: b.mult('goldFind'),
    xpGain: b.mult('xpGain'),
    draughtCharges: Math.round(b.total('draughtCharges', 3)),
    abilitySlots: 4 + (level >= 10 ? 1 : 0) + (level >= 25 ? 1 : 0) + Math.round(b.flat('abilitySlots')),
    resist,
  };
}
