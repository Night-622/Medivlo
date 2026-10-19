/** Small builders for authoring spells as data (Claude 3). */
import { HC_CLASSES } from '@/data/classes/hc/classes.gen';
import type { Action, Area, DamageKind, HcSpell, Modifier, SchoolId, StatKey, StatusApply } from '@/systems/rules/types';

export const slug = (s: string): string => s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// areas
export const self = (r: number): Area => ({ shape: 'circle', at: 'self', r });
export const atT = (r: number): Area => ({ shape: 'circle', at: 'target', r });
export const atAim = (r: number): Area => ({ shape: 'circle', at: 'aim', r });
export const cone = (r: number, angle: number): Area => ({ shape: 'cone', at: 'self', r, angle });
export const line = (len: number, width: number): Area => ({ shape: 'line', at: 'self', len, width });
export const single: Area = { shape: 'single', at: 'target', r: 0 };
export const screen: Area = { shape: 'circle', at: 'self', r: 420 };

// actions
export const dmg = (coef: number, area: Area, kind?: DamageKind, status?: StatusApply[], extra: Partial<Extract<Action, { a: 'damage' }>> = {}): Action =>
  ({ a: 'damage', coef, area, kind, status, ...extra });
export const shot = (coef: number, o: Partial<Extract<Action, { a: 'projectile' }>> = {}): Action =>
  ({ a: 'projectile', coef, speed: 460, range: 380, ...o });
export const st = (id: StatusApply['id'], dur?: number, extra: Partial<StatusApply> = {}): StatusApply => ({ id, dur, ...extra });
export const status = (s: StatusApply, area: Area, maxTargets?: number): Action => ({ a: 'status', status: s, area, maxTargets });
export const mod = (stat: StatKey, value: number, op: Modifier['op'] = 'flat'): Modifier => ({ stat, op, value });

type Mech = Omit<HcSpell, 'id' | 'name' | 'desc' | 'icon' | 'school' | 'kind'> & { kind?: DamageKind };

/** A class kit spell: name/desc/icon come from the handoff (HC_CLASSES[].abilities[index]). */
export function kitSpell(classId: string, index: number, m: Mech): HcSpell {
  const c = HC_CLASSES.find((x) => x.id === classId);
  if (!c) throw new Error(`[spells] unknown class ${classId}`);
  const ab = c.abilities[index];
  return { id: `spell:${slug(ab.name)}`, name: ab.name, desc: ab.desc, icon: ab.icon, school: c.school, kind: m.kind ?? c.school, ...m };
}

/** A school spell (Spells tree tops / ultimate). */
export function schoolSpell(school: SchoolId, name: string, desc: string, m: Mech): HcSpell {
  return { id: `spell:${slug(name)}`, name, desc, icon: `school_${school}`, school, kind: m.kind ?? school, ...m };
}
