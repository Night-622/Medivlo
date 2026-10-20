/**
 * The +72 kit spells (Claude 5 for Claude 3, docs/systems/BUILDS.md §4): 3 more per class, learned on the Spells
 * branch (spell i+3 at sp_p{i}m1). Per class: spell 3 extends the class mechanic (path 0), spell 4 is utility / control
 * (path 1), spell 5 is the payoff that combos with that path's signature perks (path 2). Budgets as the original kit
 * spells (HOLLOW_CROWN.md §2.1): cost 8–30 (or hpCost), cd 2–20 s, castMs ≤ 600, coefficients in the band of today's
 * spells of the same shape. Working names and texts; Claude 4 restyles them. NEW_KIT lists each class's 3 ids.
 */
import { HC_CLASSES } from '@/data/classes/hc/classes.gen';
import type { DamageKind, HcSpell } from '@/systems/rules/types';
import { atAim, atT, cone, dmg, line, mod, self, shot, single, slug, st, status } from './build';

type Mech = Omit<HcSpell, 'id' | 'name' | 'desc' | 'icon' | 'school' | 'kind'> & { kind?: DamageKind };
/** spell id → class, filled as the spells are built (for NEW_KIT) */
const CLASS_OF = new Map<string, string>();
/** A new kit spell: like kitSpell (build.ts), but named here since the handoff has only 3 abilities per class. */
function k(classId: string, name: string, desc: string, m: Mech): HcSpell {
  const c = HC_CLASSES.find((x) => x.id === classId);
  if (!c) throw new Error(`[spells] unknown class ${classId}`);
  const id = `spell:${slug(name)}`;
  CLASS_OF.set(id, classId);
  return { id, name, desc, icon: `school_${c.school}`, school: c.school, kind: m.kind ?? c.school, ...m };
}
const wall = (len: number, width: number) => ({ shape: 'line' as const, at: 'aim' as const, len, width });

export const HC_KIT_SPELLS_NEW: HcSpell[] = [
  // ── Rime ──
  k('warden', 'Frost Rampart', 'Slam the shield down: 90% power to foes in front and freezes them for 1.2 s.', { cost: 16, cd: 9, range: 90, aim: 'direction', tags: ['area', 'control'], actions: [dmg(0.9, cone(90, 110), undefined, [st('freeze', 1200)])] }),
  k('warden', 'Guardian’s Step', 'Leap up to 220 px toward an ally; you and allies beside you gain a shield of 12% max health for 5 s.', { cost: 14, cd: 12, range: 220, aim: 'ally', tags: ['move', 'buff'], actions: [{ a: 'move', mode: 'leap', dist: 220, iframes: 200 }, { a: 'shield', pctMax: 0.12, dur: 5000, to: 'allies', r: 90 }] }),
  k('warden', 'Glacial Reckoning', 'Shatter the cold around you: 220% power to foes within 110 px, chilling them for 3 s.', { cost: 24, cd: 14, range: 0, aim: 'self', tags: ['area', 'control'], actions: [dmg(2.2, self(110), undefined, [st('chill', 3000)])] }),
  k('rimecaller', 'Frozen Lance', 'A spear of ice that pierces every foe in a 400 px line: 130% power and chill for 2.5 s.', { cost: 12, cd: 4, range: 400, aim: 'direction', tags: ['projectile', 'control'], actions: [shot(1.3, { speed: 560, range: 400, pierce: true, status: [st('chill', 2500)], visual: 'shard' })] }),
  k('rimecaller', 'Cold Snap', '60% power to every foe within 160 px, freezing them for 1.5 s.', { cost: 16, cd: 12, range: 0, aim: 'self', tags: ['area', 'control'], actions: [dmg(0.6, self(160), undefined, [st('freeze', 1500)])] }),
  k('rimecaller', 'Whiteout', 'Ice falls on a 110 px circle for 4 s: 45% power every 0.5 s and chill.', { cost: 28, cd: 18, range: 320, aim: 'ground', castMs: 300, tags: ['area', 'control'], actions: [{ a: 'zone', kind: 'field', area: atAim(110), dur: 4000, tick: 500, each: [dmg(0.45, atAim(110), undefined, [st('chill', 1000)])], visual: 'hoarfrost' }] }),
  // ── Verdant ──
  k('ranger', 'Piercing Arrow', 'A drawn shot through every foe in a 460 px line: 180% power.', { cost: 12, cd: 4, range: 460, aim: 'direction', castMs: 300, tags: ['projectile'], actions: [shot(1.8, { speed: 680, range: 460, pierce: true, visual: 'arrow' })] }),
  k('ranger', 'Vault', 'Leave a snare that roots for 2 s, then dash 140 px.', { cost: 14, cd: 9, range: 140, aim: 'direction', tags: ['move', 'control', 'summon'], actions: [{ a: 'zone', kind: 'trap', area: self(28), dur: 8000, trigger: [status(st('root', 2000), self(28))], visual: 'thorn' }, { a: 'move', mode: 'dash', dist: 140, iframes: 250 }] }),
  k('ranger', 'Rain of Arrows', 'Arrows fall on a 100 px circle for 3 s: 40% power every 0.4 s.', { cost: 26, cd: 16, range: 400, aim: 'ground', tags: ['area'], actions: [{ a: 'zone', kind: 'field', area: atAim(100), dur: 3000, tick: 400, each: [dmg(0.4, atAim(100))], visual: 'arrow' }] }),
  k('hedgewitch', 'Strangling Vines', 'Vines on an 80 px circle: 60% power, root for 2 s and poison for 4 s.', { cost: 16, cd: 10, range: 300, aim: 'ground', tags: ['area', 'control'], actions: [dmg(0.6, atAim(80), undefined, [st('root', 2000), st('poison', 4000)])] }),
  k('hedgewitch', 'Bottled Sunlight', 'Heal an ally for 25% of their max health and cleanse them.', { cost: 14, cd: 10, range: 260, aim: 'ally', tags: ['heal'], actions: [{ a: 'heal', pctMax: 0.25, to: 'target' }, { a: 'cleanse', to: 'target' }] }),
  k('hedgewitch', 'Moth Swarm', 'Moths gnaw a 90 px circle round the target for 5 s: 30% power every 0.5 s and a short blind.', { cost: 24, cd: 14, range: 320, aim: 'enemy', tags: ['area', 'control'], actions: [{ a: 'zone', kind: 'field', area: atT(90), dur: 5000, tick: 500, each: [dmg(0.3, atT(90), undefined, [st('blind', 600)])], visual: 'moth' }] }),
  // ── Ash ──
  k('arcanist', 'Ember Comet', 'A slow ball of fire: 120% power to the target, then 80% power and burn for 3 s within 72 px.', { cost: 16, cd: 4, range: 380, aim: 'enemy', castMs: 300, tags: ['projectile', 'area'], actions: [shot(1.2, { speed: 360, visual: 'ash-bolt', onHit: [dmg(0.8, atT(72), undefined, [st('burn', 3000)])] })] }),
  k('arcanist', 'Cinder Wall', 'A 140 px wall of fire for 5 s: 30% power every 0.5 s and burn to anything crossing it.', { cost: 18, cd: 12, range: 260, aim: 'ground', tags: ['area'], actions: [{ a: 'zone', kind: 'field', area: wall(140, 24), dur: 5000, tick: 500, each: [dmg(0.3, wall(140, 24), undefined, [st('burn', 2000)])], visual: 'rime-ring' }] }),
  k('arcanist', 'Hearth’s Embrace', 'Heal allies within 140 px for 20% of max health; foes there take 100% power and burn for 3 s.', { cost: 22, cd: 14, range: 0, aim: 'self', tags: ['heal', 'area'], actions: [{ a: 'heal', pctMax: 0.2, to: 'allies', r: 140 }, dmg(1.0, self(140), undefined, [st('burn', 3000)])] }),
  k('reaver', 'Searing Rend', 'Pay 6% health: two burning strikes of 100% power on one foe.', { cost: 0, hpCost: 0.06, cd: 5, range: 80, aim: 'enemy', tags: [], actions: [{ a: 'repeat', n: 2, every: 200, then: [dmg(1.0, single, undefined, [st('burn', 2000)])] }] }),
  k('reaver', 'Battle Roar', 'Taunt foes within 130 px for 3 s and gain 25% armour for 4 s.', { cost: 14, cd: 12, range: 0, aim: 'self', tags: ['control', 'buff'], actions: [status(st('taunt', 3000), self(130)), { a: 'buff', id: 'battle-roar', dur: 4000, to: 'self', mods: [mod('armor', 0.25, 'pct')] }] }),
  k('reaver', 'Inferno', 'Pay 10% health: erupt for 240% power within 110 px and burn foes for 4 s.', { cost: 0, hpCost: 0.1, cd: 14, range: 0, aim: 'self', tags: ['area'], actions: [dmg(2.4, self(110), undefined, [st('burn', 4000)])] }),
  // ── Storm ──
  k('stormlancer', 'Thunder Charge', 'Charge 180 px: 120% power to the first foe hit and stun it for 0.8 s.', { cost: 16, cd: 8, range: 180, aim: 'direction', tags: ['move', 'control'], actions: [{ a: 'move', mode: 'charge', dist: 180, path: [dmg(1.2, line(180, 30), undefined, [st('stun', 800)], { maxTargets: 1 })] }] }),
  k('stormlancer', 'Static Guard', 'For 6 s, foes that hit you are struck by lightning for 40% power.', { cost: 14, cd: 12, range: 0, aim: 'self', tags: ['buff'], actions: [{ a: 'buff', id: 'static-guard', dur: 6000, to: 'self', procs: [{ on: 'hurt', icd: 500, do: [{ a: 'chain', coef: 0.4, jumps: 1, range: 100 }] }] }] }),
  k('stormlancer', 'Storm Spear', 'Hurl the lance: 140% power chaining to 4 foes, shocking each for 2 s.', { cost: 24, cd: 12, range: 360, aim: 'enemy', tags: ['projectile'], actions: [{ a: 'chain', coef: 1.4, jumps: 4, range: 150, status: [st('shock', 2000)] }] }),
  k('sparkwright', 'Arc Mine', 'A mine that bursts when a foe steps near: 140% power within 80 px and shock.', { cost: 12, cd: 6, range: 220, aim: 'ground', tags: ['summon', 'area'], actions: [{ a: 'zone', kind: 'trap', area: atAim(40), dur: 15000, trigger: [dmg(1.4, atAim(80), undefined, [st('shock', 2000)])], visual: 'tesla' }] }),
  k('sparkwright', 'Magnet Coil', 'Pull foes within 120 px of the point 80 px inward and slow them 30% for 2 s.', { cost: 14, cd: 10, range: 280, aim: 'ground', tags: ['control'], actions: [{ a: 'pull', dist: 80, area: atAim(120) }, status(st('slow', 2000, { power: 0.3 }), atAim(120))] }),
  k('sparkwright', 'Static Nova', 'A lightning nova: 160% power within 130 px and shock for 2 s.', { cost: 24, cd: 16, range: 0, aim: 'self', tags: ['area'], actions: [dmg(1.6, self(130), undefined, [st('shock', 2000)])] }),
  // ── Radiance ──
  k('oathbound', 'Hammer of Dawn', 'Leap 160 px and land for 140% power within 84 px, blinding foes for 1.5 s.', { cost: 16, cd: 9, range: 160, aim: 'ground', tags: ['move', 'area'], actions: [{ a: 'move', mode: 'leap', dist: 160, iframes: 250, land: [dmg(1.4, self(84), undefined, [st('blind', 1500)])] }] }),
  k('oathbound', 'Sanctuary Ground', 'Hallow 100 px around you for 5 s: allies on it heal 4% of max health each second.', { cost: 18, cd: 14, range: 0, aim: 'self', tags: ['heal', 'area'], actions: [{ a: 'zone', kind: 'field', area: self(100), dur: 5000, tick: 1000, each: [{ a: 'heal', pctMax: 0.04, to: 'area', r: 100 }], visual: 'rime-ring' }] }),
  k('oathbound', 'Judgement Day', 'After 0.4 s a pillar of light strikes 64 px round the target for 220% power, healing you for part of it.', { cost: 24, cd: 14, range: 300, aim: 'enemy', castMs: 400, tags: ['area'], actions: [{ a: 'delay', ms: 400, then: [dmg(2.2, atT(64), undefined, undefined, { flags: ['lifesteal'] })] }] }),
  k('cantor', 'Choral Burst', 'A ringing note: heal allies within 150 px (80% power) and strike foes there for 80% power.', { cost: 16, cd: 6, range: 0, aim: 'self', tags: ['heal', 'area'], actions: [{ a: 'heal', coef: 0.8, to: 'allies', r: 150 }, dmg(0.8, self(150))] }),
  k('cantor', 'Silence', 'A hushing chord: foes within 90 px of the point are stunned for 1 s.', { cost: 14, cd: 12, range: 300, aim: 'ground', tags: ['control'], actions: [status(st('stun', 1000), atAim(90))] }),
  k('cantor', 'Benediction', 'Shield every ally within 170 px for 18% of their max health for 6 s.', { cost: 24, cd: 16, range: 0, aim: 'self', tags: ['buff'], actions: [{ a: 'shield', pctMax: 0.18, dur: 6000, to: 'allies', r: 170 }] }),
  // ── Umbral ──
  k('shade', 'Shadowstrike', 'A strike of 180% power on one foe that makes it bleed for 3 s.', { cost: 14, cd: 6, range: 70, aim: 'enemy', tags: [], actions: [dmg(1.8, single, undefined, [st('bleed', 3000)])] }),
  k('shade', 'Smoke Veil', 'Vanish for 2 s; your next hit is a critical hit.', { cost: 16, cd: 14, range: 0, aim: 'self', tags: ['buff'], actions: [{ a: 'buff', id: 'smoke-veil', dur: 2000, to: 'self', charges: 1, flags: ['untargetable', 'nextHitsCrit'] }] }),
  k('shade', 'Death Blossom', 'Spin four times: 50% power to foes within 80 px each spin.', { cost: 22, cd: 12, range: 0, aim: 'self', tags: ['area'], actions: [{ a: 'repeat', n: 4, every: 150, then: [dmg(0.5, self(80))] }] }),
  k('duskweaver', 'Soul Link', '60% power to the target, then link up to 4 foes within 160 px for 6 s.', { cost: 16, cd: 9, range: 320, aim: 'enemy', tags: ['control'], actions: [dmg(0.6, single), status(st('linked', 6000), atT(160), 4)] }),
  k('duskweaver', 'Shadow Ward', 'For 6 s, the next 2 hits you take deal nothing.', { cost: 14, cd: 12, range: 0, aim: 'self', tags: ['buff'], actions: [{ a: 'buff', id: 'shadow-ward', dur: 6000, to: 'self', charges: 2, flags: ['invulnerable'] }] }),
  k('duskweaver', 'Unravelling', '80% power within 100 px of the point and doom on every foe there for 6 s.', { cost: 24, cd: 14, range: 300, aim: 'ground', tags: ['area', 'control'], actions: [dmg(0.8, atAim(100)), status(st('doom', 6000, { power: 1.2 }), atAim(100))] }),
  // ── Blade ──
  k('swordsman', 'Counter Stance', 'For 3 s, parry the next 2 hits.', { cost: 14, cd: 10, range: 0, aim: 'self', tags: ['buff'], actions: [{ a: 'buff', id: 'counter-stance', dur: 3000, to: 'self', charges: 2, flags: ['parry'] }] }),
  k('swordsman', 'Disarm', 'A twisting cut of 100% power that weakens the foe for 4 s.', { cost: 12, cd: 8, range: 80, aim: 'enemy', tags: ['control'], actions: [dmg(1.0, single, undefined, [st('weaken', 4000)])] }),
  k('swordsman', 'Dancing Steel', 'Dash 150 px through foes: 220% power to each one crossed.', { cost: 18, cd: 8, range: 150, aim: 'direction', tags: ['move', 'area'], actions: [{ a: 'move', mode: 'dash', dist: 150, iframes: 300, path: [dmg(2.2, line(150, 30))] }] }),
  k('samurai', 'Crescent Cut', 'A wide drawn cut: 200% power in a 100 px arc in front.', { cost: 14, cd: 6, range: 100, aim: 'direction', castMs: 400, tags: ['area'], actions: [dmg(2.0, cone(100, 160))] }),
  k('samurai', 'Mountain Stance', 'For 4 s: take 30% less damage and +20% critical chance, but move 50% slower.', { cost: 14, cd: 12, range: 0, aim: 'self', tags: ['buff'], actions: [{ a: 'buff', id: 'mountain-stance', dur: 4000, to: 'self', mods: [mod('dmgTaken', -0.3), mod('crit', 0.2), mod('moveSpeed', -0.5)] }] }),
  k('samurai', 'Falling Petals', 'Eight quick cuts of 35% power on one foe.', { cost: 24, cd: 14, range: 80, aim: 'enemy', tags: [], actions: [{ a: 'repeat', n: 8, every: 90, then: [dmg(0.35, single)] }] }),
  // ── Iron ──
  k('knight', 'Ride Down', 'Charge 200 px: 100% power to every foe in the path and knock them down for 1 s.', { cost: 16, cd: 10, range: 200, aim: 'direction', tags: ['move', 'control'], actions: [{ a: 'move', mode: 'charge', dist: 200, path: [dmg(1.0, line(200, 34), undefined, [st('knockdown', 1000)])] }] }),
  k('knight', 'Hold the Breach', 'For 4 s, you and allies within 120 px take 20% less damage.', { cost: 14, cd: 14, range: 0, aim: 'self', tags: ['buff'], actions: [{ a: 'buff', id: 'hold-the-breach', dur: 4000, to: 'allies', r: 120, mods: [mod('dmgTaken', -0.2)] }] }),
  k('knight', 'Champion’s Strike', 'A heavy strike of 280% power that makes the foe vulnerable for 4 s.', { cost: 22, cd: 10, range: 80, aim: 'enemy', castMs: 300, tags: ['control'], actions: [dmg(2.8, single, undefined, [st('vulnerable', 4000)])] }),
  k('juggernaut', 'Seismic Slam', 'A shockwave along a 160 px line: 140% power and stun for 0.7 s.', { cost: 16, cd: 8, range: 160, aim: 'direction', tags: ['area', 'control'], actions: [dmg(1.4, line(160, 40), undefined, [st('stun', 700)])] }),
  k('juggernaut', 'Bronze Hide', 'For 5 s: immune to control and take 20% less damage.', { cost: 14, cd: 14, range: 0, aim: 'self', tags: ['buff'], actions: [{ a: 'buff', id: 'bronze-hide', dur: 5000, to: 'self', flags: ['unstoppable'], mods: [mod('dmgTaken', -0.2)] }] }),
  k('juggernaut', 'Earthbreaker', 'After 0.5 s the maul lands: 260% power within 110 px and stun for 0.8 s.', { cost: 24, cd: 14, range: 0, aim: 'self', castMs: 500, tags: ['area', 'control'], actions: [{ a: 'delay', ms: 500, then: [dmg(2.6, self(110), undefined, [st('stun', 800)])] }] }),
  // ── Fist ──
  k('monk', 'Flowing Palm', 'Three quick strikes of 50% power on one foe, then +1 Momentum.', { cost: 12, cd: 5, range: 70, aim: 'enemy', tags: [], actions: [{ a: 'repeat', n: 3, every: 120, then: [dmg(0.5, single)] }, { a: 'resource', momentum: 1 }] }),
  k('monk', 'Wind Walk', 'For 4 s: +30% move speed and +1 dash charge.', { cost: 12, cd: 10, range: 0, aim: 'self', tags: ['buff'], actions: [{ a: 'buff', id: 'wind-walk', dur: 4000, to: 'self', mods: [mod('moveSpeed', 0.3), mod('dashCharges', 1)] }] }),
  k('monk', 'Crane Kick', 'A flying kick 140 px forward: 180% power to each foe crossed, knocking them back.', { cost: 22, cd: 12, range: 140, aim: 'direction', tags: ['move', 'area'], actions: [{ a: 'move', mode: 'dash', dist: 140, iframes: 200, path: [dmg(1.8, line(140, 32), undefined, undefined, { flags: ['knockback'] })] }] }),
  k('brawler', 'Uppercut', 'Launch one foe: 160% power, stun for 0.9 s, then +1 Momentum.', { cost: 12, cd: 6, range: 70, aim: 'enemy', tags: ['control'], actions: [dmg(1.6, single, undefined, [st('stun', 900)], { flags: ['launch'] }), { a: 'resource', momentum: 1 }] }),
  k('brawler', 'Bob and Weave', 'For 4 s, parry the next 2 hits.', { cost: 12, cd: 10, range: 0, aim: 'self', tags: ['buff'], actions: [{ a: 'buff', id: 'bob-and-weave', dur: 4000, to: 'self', charges: 2, flags: ['parry'] }] }),
  k('brawler', 'Knockout Blow', 'A charged punch of 320% power that stuns for 1.2 s and knocks the foe back.', { cost: 22, cd: 12, range: 70, aim: 'enemy', castMs: 400, tags: ['control'], actions: [dmg(3.2, single, undefined, [st('stun', 1200)], { flags: ['knockback'] })] }),
  // ── Hunt ──
  k('huntsman', 'Spike Trap', 'A trap that bursts when stepped on: 120% power within 70 px and bleed for 4 s.', { cost: 8, cd: 8, range: 200, aim: 'ground', tags: ['summon', 'area'], actions: [{ a: 'zone', kind: 'trap', area: atAim(30), dur: 20000, trigger: [dmg(1.2, atAim(70), 'physical', [st('bleed', 4000)])], visual: 'bear-trap' }] }),
  k('huntsman', 'Net Shot', 'A net of 140% power that roots the foe for 2.5 s; you gain 30% move speed for 2 s.', { cost: 8, cd: 10, range: 320, aim: 'enemy', tags: ['projectile', 'control', 'buff'], actions: [shot(1.4, { speed: 520, range: 320, status: [st('root', 2500)], visual: 'bolt' }), { a: 'buff', id: 'net-shot', dur: 2000, to: 'self', mods: [mod('moveSpeed', 0.3)] }] }),
  k('huntsman', 'Kill Shot', 'A long-drawn bolt of 320% power.', { cost: 16, cd: 12, range: 480, aim: 'enemy', castMs: 400, kind: 'physical', tags: ['projectile'], actions: [shot(3.2, { speed: 720, range: 480, visual: 'bolt' })] }),
  k('falconer', 'Talon Rake', 'The falcon rakes a 300 px line: 110% power and bleed for 3 s.', { cost: 12, cd: 5, range: 300, aim: 'direction', tags: ['summon', 'area'], actions: [{ a: 'delay', ms: 200, then: [dmg(1.1, line(300, 36), undefined, [st('bleed', 3000)])] }] }),
  k('falconer', 'Hawk’s Cry', 'The falcon screeches: foes within 100 px of the point are blinded for 2.5 s.', { cost: 14, cd: 12, range: 340, aim: 'ground', tags: ['control', 'summon'], actions: [status(st('blind', 2500), atAim(100))] }),
  k('falconer', 'Sky Hunt', 'The falcon dives five times on one foe: 70% power each.', { cost: 22, cd: 9, range: 380, aim: 'enemy', tags: ['summon'], actions: [{ a: 'repeat', n: 5, every: 300, then: [dmg(0.7, single)] }] }),
  // ── Guile ──
  k('corsair', 'Pistol Shot', 'A loud shot of 220% power that staggers the foe for 0.5 s.', { cost: 12, cd: 5, range: 300, aim: 'enemy', kind: 'physical', tags: ['projectile', 'control'], actions: [shot(2.2, { speed: 700, range: 300, status: [st('stun', 500)], visual: 'knife' })] }),
  k('corsair', 'Grappling Hook', 'Swing in behind a foe up to 260 px away: 140% power and stun for 0.6 s.', { cost: 14, cd: 10, range: 260, aim: 'enemy', tags: ['move', 'control'], actions: [{ a: 'move', mode: 'behind', dist: 260, iframes: 200, land: [dmg(1.4, single, 'physical', [st('stun', 600)])] }] }),
  k('corsair', 'Broadside', 'Three volleys of 80% power in a 120 px cone in front.', { cost: 24, cd: 14, range: 120, aim: 'direction', kind: 'physical', tags: ['area'], actions: [{ a: 'repeat', n: 3, every: 200, then: [dmg(0.8, cone(120, 80))] }] }),
  k('jester', 'Knife Fan', 'Eight knives fly out in a ring: 60% power each, bouncing once.', { cost: 14, cd: 6, range: 220, aim: 'direction', kind: 'physical', tags: ['projectile', 'area'], actions: [shot(0.6, { count: 8, spread: 360, bounce: 1, speed: 420, range: 220, visual: 'spin-dagger' })] }),
  k('jester', 'Jack-in-the-Box', 'A box that springs when a foe comes near: 90% power to foes within 90 px, confusing them for 2.5 s.', { cost: 14, cd: 10, range: 200, aim: 'ground', tags: ['summon', 'control'], actions: [{ a: 'zone', kind: 'trap', area: atAim(40), dur: 12000, trigger: [dmg(0.9, atAim(90), 'physical', [st('confuse', 2500)])], visual: 'jester-decoy' }] }),
  k('jester', 'Grand Finale', 'Seven knives in a fan: 70% power each, bouncing twice.', { cost: 26, cd: 16, range: 320, aim: 'direction', kind: 'physical', tags: ['projectile'], actions: [shot(0.7, { count: 7, spread: 50, bounce: 2, speed: 520, range: 320, visual: 'spin-dagger' })] }),
  // ── Song ──
  k('bard', 'Ballad of Swiftness', 'For 6 s, you and allies within 190 px gain 15% move and attack speed.', { cost: 14, cd: 10, range: 0, aim: 'self', tags: ['buff'], actions: [{ a: 'buff', id: 'ballad-of-swiftness', dur: 6000, to: 'allies', r: 190, mods: [mod('moveSpeed', 0.15), mod('atkSpeed', 0.15)] }] }),
  k('bard', 'Discordant Wave', 'A wave of noise: 80% power in a 140 px cone, knocking foes back and confusing them for 2 s.', { cost: 14, cd: 8, range: 140, aim: 'direction', tags: ['area', 'control'], actions: [dmg(0.8, cone(140, 90), undefined, [st('confuse', 2000)], { flags: ['knockback'] })] }),
  k('bard', 'Showstopper', 'A crashing chord: 180% power within 80 px of the target.', { cost: 24, cd: 14, range: 320, aim: 'enemy', tags: ['area'], actions: [dmg(1.8, atT(80))] }),
  k('skald', 'Chant of Fury', 'For 6 s, you and allies within 190 px deal 12% more damage and heal 4% of damage dealt.', { cost: 14, cd: 12, range: 0, aim: 'self', tags: ['buff'], actions: [{ a: 'buff', id: 'chant-of-fury', dur: 6000, to: 'allies', r: 190, mods: [mod('dmg', 0.12), mod('lifesteal', 0.04)] }] }),
  k('skald', 'Shield Song', 'Shield you and allies within 170 px for 14% of max health for 6 s.', { cost: 16, cd: 14, range: 0, aim: 'self', tags: ['buff'], actions: [{ a: 'shield', pctMax: 0.14, dur: 6000, to: 'allies', r: 170 }] }),
  k('skald', 'Saga Strike', 'A great blow of 220% power in a 90 px arc; you deal 10% more damage for 4 s.', { cost: 22, cd: 10, range: 90, aim: 'direction', kind: 'physical', tags: ['area', 'buff'], actions: [dmg(2.2, cone(90, 120)), { a: 'buff', id: 'saga-strike', dur: 4000, to: 'self', mods: [mod('dmg', 0.1)] }] }),
];

/** Each class's 3 new kit spell ids, in path order (spell i+3 is granted at sp_p{i}m1). */
export const NEW_KIT: Record<string, [string, string, string]> = Object.fromEntries(
  HC_CLASSES.map((c) => {
    const ids = HC_KIT_SPELLS_NEW.filter((s) => CLASS_OF.get(s.id) === c.id).map((s) => s.id);
    return [c.id, ids as unknown as [string, string, string]];
  }),
);
