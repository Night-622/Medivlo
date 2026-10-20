/**
 * rules-props: shared keystones and weapon mastery (Claude 5, docs/systems/BUILDS.md §3). Keystones: 20, ks_ ids,
 * rank 1, each doing something and passing the content guard; every class offered exactly 3 distinct real keystones;
 * every keystone offered to at least 2 classes; Pack Leader only to classes with a summon spell. Mastery: exactly one
 * entry per class × kit weapon type, each doing something, no broken text, guard clean.
 */
import { HC_CLASSES } from '@/data/classes/hc/classes.gen';
import { kitFor } from '@/data/classes/hc/kits';
import { HC_KIT_SPELLS } from '@/data/spells/hc/kit-spells';
import { HC_SHARED_KEYSTONES, KEYSTONE_OFFERS } from '@/data/skilltrees/hc/keystones';
import { HC_MASTERY } from '@/data/skilltrees/hc/mastery';
import type { Passive } from '@/systems/rules/types';
import { check } from './features-harness';

const SCALED = ['hp', 'ember', 'stamina', 'armor', 'sp', 'emberRegen', 'hpRegen', 'staminaRegen'];
const empty = (p: Passive): boolean => !(p.mods?.length || p.procs?.length || p.hooks?.length || p.spellMods?.length || p.convert?.length || p.aura?.length || p.spellLevels?.length);
const guard = (p: Passive): boolean => !(p.mods ?? []).some((m) => m.when && SCALED.includes(m.stat) && m.op !== 'flat');
const brokenText = (t: string): boolean => !t || /undefined|NaN|…/.test(t);

export function keystoneProps(): void {
  const K = HC_SHARED_KEYSTONES, ids = new Set(K.map((k) => k.id));
  const kBad = K.filter((k) => !k.id.startsWith('ks_') || k.ranks !== 1 || k.text.length !== 1 || k.effects.length !== 1 || brokenText(k.text[0]) || empty(k.effects[0]) || !guard(k.effects[0])).map((k) => k.id);
  check(K.length === 20 && ids.size === K.length && !kBad.length, `keystones: ${K.length} shared keystones, ks_ ids unique, rank 1, each does something, guard clean`, kBad.join(', '));

  const offerBad: string[] = [];
  for (const c of HC_CLASSES) {
    const o = KEYSTONE_OFFERS[c.id];
    if (!o || new Set(o).size !== 3 || o.some((id) => !ids.has(id))) offerBad.push(c.id);
  }
  const count = new Map<string, number>([...ids].map((id) => [id, 0]));
  for (const o of Object.values(KEYSTONE_OFFERS)) for (const id of o) count.set(id, (count.get(id) ?? 0) + 1);
  const lonely = [...count].filter(([, n]) => n < 2).map(([id]) => id);
  check(!offerBad.length && !lonely.length && Object.keys(KEYSTONE_OFFERS).length === HC_CLASSES.length,
    'keystones: every class is offered 3 distinct real keystones, and every keystone is offered to at least 2 classes', [...offerBad, ...lonely.map((x) => `${x} offered <2`)].join(', '));

  const summoners = new Set(HC_CLASSES.filter((c) => kitFor(c.id).spells.some((id) => HC_KIT_SPELLS.find((s) => s.id === id)?.tags.includes('summon'))).map((c) => c.id));
  const packBad = Object.entries(KEYSTONE_OFFERS).filter(([cls, o]) => o.includes('ks_pack_leader') && !summoners.has(cls)).map(([cls]) => cls);
  check(!packBad.length, `keystones: Pack Leader offered only to classes with a summon spell (${[...summoners].join(', ')})`, packBad.join(', '));

  // mastery: exactly one per class × kit weapon
  const want = HC_CLASSES.flatMap((c) => kitFor(c.id).weapons.map((w) => `${c.id}/${w}`)).sort();
  const got = HC_MASTERY.map((x) => `${x.classId}/${x.weapon}`).sort();
  const missing = want.filter((k) => !got.includes(k)), extra = got.filter((k, i) => !want.includes(k) || got.indexOf(k) !== i);
  check(!missing.length && !extra.length, `mastery: exactly one entry for each of ${want.length} class × kit weapon pairs`, [...missing.map((x) => `missing ${x}`), ...extra.map((x) => `extra ${x}`)].slice(0, 6).join(', '));
  const mBad = HC_MASTERY.filter((x) => brokenText(x.text) || !x.name || empty(x.passive) || !guard(x.passive)).map((x) => `${x.classId}/${x.weapon}`);
  check(!mBad.length, 'mastery: every entry has a name and text and does something, guard clean', mBad.join(', '));
}
