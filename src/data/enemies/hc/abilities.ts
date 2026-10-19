/**
 * Creature abilities (Claude 3): turns the handoff's ability lines into mechanics with an ordered keyword table.
 * Coefficients are multiples of the creature's damage stat (TIER_DMG × D(level)). Unmatched lines fall back to a
 * body-type default and are reported by `unmappedAbilities()`.
 */
import type { Action, Area, BodyArch, CreatureTier, DamageKind, Hook, StatusApply } from '@/systems/rules/types';

export type AbilityUse = 'attack' | 'self' | 'onDeath' | 'passive' | 'lowHp';
export interface CreatureAbility {
  text: string;
  use: AbilityUse;
  /** ms */
  cd: number;
  range: number;
  /** telegraph ms before the actions resolve */
  windup: number;
  actions: Action[];
  hooks?: Hook[];
  matched: boolean;
}
export interface AbilityCtx { kind: DamageKind; tier: CreatureTier; arch: BodyArch; region: string }

const self = (r: number): Area => ({ shape: 'circle', at: 'self', r });
const atT = (r: number): Area => ({ shape: 'circle', at: 'target', r });
const cone = (r: number, angle: number): Area => ({ shape: 'cone', at: 'self', r, angle });
const line = (len: number, width: number): Area => ({ shape: 'line', at: 'self', len, width });
const single: Area = { shape: 'single', at: 'target', r: 0 };
const st = (id: StatusApply['id'], dur: number, power?: number): StatusApply => ({ id, dur, power });
const big = (x: AbilityCtx) => (x.tier === 'boss' ? 1.4 : x.tier === 'mini' ? 1.2 : 1);

/** Which creature a summon line brings. Ids are bestiary ids (bx_*). */
const SUMMON_WHO: [RegExp, string][] = [
  [/ash hound/i, 'bx_ashhound'], [/wolves|pack/i, 'bx_wolf'], [/hollowed villagers/i, 'bx_hollowed'], [/skeleton knights/i, 'bx_skelknight'],
  [/skeleton/i, 'bx_skel'], [/thornlings/i, 'bx_thornling'], [/snapvines|seeds/i, 'bx_snapvine'], [/spiders|broods|eggs/i, 'bx_spider'],
  [/puffcaps|spores/i, 'bx_puffcap'], [/ghost/i, 'bx_lanternghost'], [/choir|drowned monk/i, 'bx_drownedmonk'], [/crows/i, 'bx_crow'],
  [/slimes/i, 'bx_slime'], [/plants/i, 'bx_thornling'], [/gloamwood|forest/i, 'bx_snapvine'], [/lanterns/i, 'bx_lanternghost'], [/cultists/i, 'bx_cultist'],
];
const summonWho = (t: string): string => SUMMON_WHO.find(([re]) => re.test(t))?.[1] ?? 'same-region';

type Rule = [RegExp, (x: AbilityCtx, t: string) => Omit<CreatureAbility, 'text' | 'matched'>];
const A = (use: AbilityUse, cd: number, range: number, windup: number, actions: Action[], hooks?: Hook[]) => ({ use, cd, range, windup, actions, hooks });
const dmg = (coef: number, area: Area, kind: DamageKind, status?: StatusApply[], flags?: ('knockback' | 'lifesteal' | 'pull')[]): Action =>
  ({ a: 'damage', coef, area, kind, status, flags });

/** Ordered: the first rule that matches wins. */
const RULES: Rule[] = [
  // arena set pieces (docs/systems/ARENA_HAZARDS.md): checked first, their words overlap the generic rules
  [/yields on flag ([\w.:-]+)/i, (_x, t) => A('passive', 0, 0, 0, [], [{ id: `yieldOnFlag:${/yields on flag ([\w.:-]+)/i.exec(t)![1].replace(/\.$/, '')}` }])],
  [/(?:from phase (\d+), )?cannot be targeted until flag ([\w.:-]+)/i, (_x, t) => {
    const m = /(?:from phase (\d+), )?cannot be targeted until flag ([\w.:-]+)/i.exec(t)!;
    return A('passive', 0, 0, 0, [], [{ id: `targetableOnFlag:${m[2].replace(/\.$/, '')}`, value: Number(m[1] ?? 1) }]);
  }],
  [/hurt by turned vents/i, () => A('passive', 0, 0, 0, [], [{ id: 'ventHurt' }])],
  [/calms the room while the stones stand/i, () => A('passive', 0, 0, 0, [], [{ id: 'calmAura' }])],
  [/yields when stunned by stone in its last phase/i, () => A('passive', 0, 0, 0, [], [{ id: 'anchorYield' }])],
  [/stunned when knocked into stone/i, () => A('passive', 0, 0, 0, [], [{ id: 'anchorStun' }])],
  [/heals from the vents/i, () => A('passive', 0, 0, 0, [], [{ id: 'ventHeal' }])],
  [/only be hurt in the light/i, () => A('passive', 0, 0, 0, [], [{ id: 'lightOnly' }])],
  [/pays back every hit/i, () => A('passive', 0, 0, 0, [], [{ id: 'paysBack' }])],
  [/shielded while the pillars stand/i, () => A('passive', 0, 0, 0, [], [{ id: 'shielded' }])],
  [/immune to (burning|freezing|frost|poison|stuns?|bleeding|shock)/i, (_x, t) => {
    const m = /immune to (burning|freezing|frost|poison|stuns?|bleeding|shock)/i.exec(t)![1].toLowerCase();
    const id = ({ burning: 'burn', freezing: 'freeze', frost: 'chill', poison: 'poison', stun: 'stun', stuns: 'stun', bleeding: 'bleed', shock: 'shock' } as Record<string, string>)[m];
    return A('passive', 0, 0, 0, [], [{ id: `immune:${id}` }]);
  }],
  [/charges come back at it/i, () => A('passive', 0, 0, 0, [], [{ id: 'anchorStun' }, { id: 'reflectCharge' }])],
  // on death
  [/when (it|he|she) dies|when killed|explodes/i, (x, t) => A('onDeath', 0, 0, 500, [dmg(1.5 * big(x), self(64), /shards/i.test(t) ? 'rime' : x.kind, /flame|burst/i.test(t) ? [st('burn', 3000)] : undefined)])],
  [/splits into (two|four)|splits into the four/i, (_x, t) => A('onDeath', 0, 0, 0, [{ a: 'summon', what: /four elemental/i.test(t) ? 'elemental-slimes' : 'split', count: /four/i.test(t) ? 4 : 2, dur: 0, power: 0.4 }])],
  [/rebuilds|rebuild/i, () => A('passive', 0, 0, 0, [], [{ id: 'reviveOnce', value: 0.5 }])],
  [/yields when beaten/i, () => A('passive', 0, 0, 0, [], [{ id: 'yields' }])],
  // passives
  [/blocks attacks from the front/i, () => A('passive', 0, 0, 0, [], [{ id: 'frontBlock', value: 0.5 }])],
  [/parries/i, () => A('passive', 0, 0, 0, [], [{ id: 'parryChance', value: 0.25 }])],
  [/swallows your projectiles/i, () => A('passive', 0, 0, 0, [], [{ id: 'absorbShots' }])],
  [/cannot move/i, (x) => A('attack', 1400, 40, 350, [dmg(1.6 * big(x), single, x.kind)], [{ id: 'immobile' }])],
  [/flees|runs away/i, () => A('passive', 0, 0, 0, [], [{ id: 'flee' }, { id: 'coinsOnHit', value: 2 }])],
  [/its bite slows|its touch slows|webs slow/i, (x) => A('attack', 1100, 34, 250, [dmg(1, single, x.kind, [st('slow', 2000, 0.3)])])],
  [/enrages at low health/i, () => A('lowHp', 0, 0, 0, [{ a: 'buff', id: 'enrage', dur: 600000, to: 'self', mods: [{ stat: 'atkSpeed', op: 'flat', value: 0.5 }, { stat: 'dmg', op: 'flat', value: 0.3 }] }])],
  [/grows|absorbs slimes/i, () => A('self', 12000, 0, 600, [{ a: 'buff', id: 'grow', dur: 600000, to: 'self', mods: [{ stat: 'dmg', op: 'flat', value: 0.15 }, { stat: 'hp', op: 'pct', value: 0.1 }] }])],
  [/final phase|wears the white stag/i, () => A('self', 0, 0, 1200, [{ a: 'buff', id: 'crowned', dur: 600000, to: 'self', mods: [{ stat: 'dmg', op: 'flat', value: 0.4 }] }])],
  // self buffs
  [/immune|turns to stone|crystal heart/i, (_x, t) => A('self', 16000, 0, 600, [{ a: 'buff', id: 'stone', dur: /5s|heart/i.test(t) ? 5000 : 3000, to: 'self', flags: /reflect/i.test(t) ? ['invulnerable', 'reflect'] : ['invulnerable'] }])],
  [/overheats/i, () => A('self', 14000, 0, 800, [{ a: 'buff', id: 'venting', dur: 4000, to: 'self', mods: [{ stat: 'dmgTaken', op: 'flat', value: 0.5 }] }])],
  // summons
  [/calls (ash|the whole|hollowed|the choir)|howls to call|raises|hatch|sends|sprouts|lays eggs|brings a ghost|summons|rises to defend|forest itself|murder of crows|splits (her light|into a flock)|spits seeds/i,
    (x, t) => A('self', x.tier === 'boss' ? 16000 : 14000, 0, 900, [{ a: 'summon', what: summonWho(t), count: /two|pair/i.test(t) ? 2 : /three|whole|waves|flock|every/i.test(t) ? 3 : 2, dur: 0, power: 1 }])],
  // allies
  [/heals|chants to heal|flash of light heals/i, (x) => A('self', 9000, 0, 900, [{ a: 'heal', pctMax: x.tier === 'enemy' ? 0.15 : x.tier === 'mini' ? 0.04 : 0.008, to: 'allies', r: 200 }])],
  // shields scale down with the caster's tier (a boss shielding itself for 20% every 12 s outlasts any long fight)
  [/shields its allies|shield wall/i, (x) => A('self', 12000, 0, 700, [{ a: 'shield', pctMax: x.tier === 'enemy' ? 0.2 : x.tier === 'mini' ? 0.05 : 0.015, dur: 6000, to: 'allies', r: 200 }])],
  [/buffs its allies with music/i, () => A('self', 10000, 0, 600, [{ a: 'buff', id: 'battle-song', dur: 6000, to: 'allies', r: 200, mods: [{ stat: 'dmg', op: 'flat', value: 0.2 }] }])],
  // movement attacks
  [/charges three times/i, (x) => A('attack', 9000, 220, 700, [{ a: 'repeat', n: 3, every: 900, then: [{ a: 'move', mode: 'charge', dist: 200, path: [dmg(1.4 * big(x), line(200, 36), x.kind, [st('knockdown', 700)])] }] }])],
  [/charge|rolls (at|across)|bounces to crush/i, (x, t) => A('attack', 7000, 220, 700, [{ a: 'move', mode: 'charge', dist: 200, path: [dmg(1.4 * big(x), line(200, 36), x.kind, /thorns/i.test(t) ? [st('bleed', 3000)] : [st('knockdown', 700)])] }])],
  [/lunges|leaps|dives|drops from|pounce/i, (x, t) => A('attack', 5000, 160, 500, [{ a: 'move', mode: 'leap', dist: 150, land: [dmg(1.3 * big(x), self(40), x.kind)] }, ...(/summons/i.test(t) ? [{ a: 'summon' as const, what: 'bx_wolf', count: 2, dur: 0, power: 1 }] : [])])],
  [/vanishes|disappears|teleports|blinks|swaps places/i, (x, t) => A('attack', 8000, 260, 500, [{ a: 'move', mode: /swaps/i.test(t) ? 'blink' : 'behind', dist: 260, land: [dmg(1.5 * big(x), single, x.kind)] }])],
  [/grabs|pulls you|lures you/i, (x) => A('attack', 9000, 200, 600, [{ a: 'pull', dist: 120, area: single }, dmg(0.8, single, x.kind, [st('root', 1500)])])],
  [/gusts of wind/i, () => A('attack', 9000, 260, 700, [{ a: 'knock', dist: 140, area: cone(260, 70) }])],
  // area attacks
  [/breathes|breath/i, (x, t) => A('attack', 6000, 140, 800, [dmg(1.6 * big(x), cone(140, 60), x.kind, /freez/i.test(t) ? [st('freeze', 2000)] : [st('burn', 3000)])])],
  [/freezes foes solid|freezes the floor|ground slam freezes/i, (x) => A('attack', 9000, 120, 900, [dmg(1.0 * big(x), self(120), 'rime', [st('freeze', 2000)])])],
  [/slam|shakes the mountain|erupts|knocks you down|bounces/i, (x) => A('attack', 6000, 90, 800, [dmg(1.6 * big(x), self(90 * big(x)), x.kind, [st('knockdown', 800)])])],
  [/wide arc|wide circle|reaps|bone storm|shakes off thorns|spinning/i, (x) => A('attack', 5000, 80, 600, [dmg(1.3 * big(x), self(80 * big(x)), x.kind)])],
  [/combo that ends in a stun|flurry of fast cuts/i, (x, t) => A('attack', 6000, 50, 400, [{ a: 'repeat', n: 3, every: 220, then: [dmg(0.7 * big(x), cone(56, 90), x.kind)] }, ...(/stun/i.test(t) ? [dmg(0.5, single, x.kind, [st('stun', 1000)])] : [])])],
  [/stun everyone|screams? |crescendo|bell|howl/i, (x) => A('attack', 12000, 160, 1000, [dmg(0.6 * big(x), self(160), x.kind, [st('stun', 1200)])])],
  [/strikes everyone in a single instant|storm hits everything|whole arena|final light|blizzard covers|overcharge: everything/i, // arena-wide only for bosses and minis; an ordinary creature (often an interlude add) makes it a local burst
    (x) => (x.tier === 'enemy' ? A('attack', 14000, 160, 1400, [dmg(1.1, self(150), x.kind)]) : A('attack', 20000, 400, 1600, [dmg(1.8 * big(x), self(400), x.kind)]))],
  [/beam|vines lash|sweeping fire stream/i, (x) => A('attack', 8000, 260, 900, [dmg(1.5 * big(x), line(260, 28), x.kind)])],
  [/chain lightning/i, (x) => A('attack', 6000, 240, 500, [{ a: 'chain', coef: 1.0 * big(x), kind: 'storm', jumps: 3, range: 140 }])],
  [/calls (bolts|lightning)/i, (x) => A('attack', 7000, 300, 900, [dmg(1.4 * big(x), atT(48), 'storm', [st('shock', 1500)])])],
  // hazards
  [/pools|leaves|sets the ground|floods|lava|tears|rain|ice behind|webs (the room|the whole)|lays traps|sap/i, (x, t) => A('attack', 9000, 260, 700, [{
    a: 'zone', kind: 'field', area: atT(/whole|floods|lava|room/i.test(t) ? 120 : 56), dur: 6000, tick: 500,
    each: [dmg(0.25 * big(x), atT(56), x.kind, /web|ice/i.test(t) ? [st('slow', 800, 0.4)] : /fire|burning|lava/i.test(t) ? [st('burn', 2000)] : undefined)],
  }])],
  [/ring of lanterns/i, (x) => A('attack', 18000, 0, 1500, [dmg(1.2 * big(x), { shape: 'ring', at: 'self', r: 140 }, x.kind)])],
  // statuses
  [/spores|sleeping|sleep/i, () => A('attack', 10000, 140, 800, [{ a: 'status', status: st('sleep', 2500), area: self(110) }])],
  [/confuse|scramble|turns your allies hollowed/i, () => A('attack', 12000, 160, 800, [{ a: 'status', status: st('confuse', 3000), area: self(160) }])],
  [/blind|darkness|puts out the torches/i, () => A('attack', 10000, 200, 700, [{ a: 'status', status: st('blind', 2500), area: self(200) }])],
  [/roots|webs/i, () => A('attack', 8000, 220, 700, [{ a: 'status', status: st('root', 2000), area: atT(40) }])],
  [/marks you/i, () => A('attack', 10000, 300, 400, [{ a: 'status', status: st('mark', 6000, 0.25), area: single }])],
  [/curses you/i, () => A('attack', 9000, 260, 500, [{ a: 'buff', id: 'curse', dur: 6000, to: 'target', mods: [{ stat: 'healingTaken', op: 'flat', value: -0.5 }] }])],
  [/drains|swarm/i, (x) => A('attack', 6000, 200, 500, [dmg(1.0 * big(x), single, x.kind, undefined, ['lifesteal'])])],
  [/steals/i, (_x, t) => A('attack', 9000, 40, 300, [{ a: 'steal', gold: /embershards|coins/i.test(t) ? 10 : 0, buffs: /buff/i.test(t), area: single }])],
  // ranged
  [/fires|volley|bolt|hurls|spits|throws|knives|gear blades|antler/i, (x, t) => A('attack', 3500, 300, 500, [{
    a: 'projectile', coef: 1.0 * big(x), kind: x.kind, speed: 300, range: 320,
    count: /fan|volley|spiral|knives/i.test(t) ? 3 : 1, spread: 30, status: /ice/i.test(t) ? [st('chill', 2000)] : undefined,
  }])],
];

/** Body-type default when a line matches nothing. */
const DEFAULT: Record<BodyArch, (x: AbilityCtx) => Omit<CreatureAbility, 'text' | 'matched'>> = {
  quad: (x) => A('attack', 5000, 150, 500, [{ a: 'move', mode: 'leap', dist: 140, land: [dmg(1.3 * big(x), self(40), x.kind)] }]),
  slime: (x) => A('attack', 5000, 80, 600, [dmg(1.3 * big(x), self(60), x.kind)]),
  skeleton: (x) => A('attack', 5000, 60, 500, [dmg(1.3 * big(x), cone(60, 100), x.kind)]),
  humanoid: (x) => A('attack', 5000, 60, 500, [dmg(1.3 * big(x), cone(60, 100), x.kind)]),
  spirit: (x) => A('attack', 4000, 280, 500, [{ a: 'projectile', coef: 1.0 * big(x), kind: x.kind, speed: 260, range: 300 }]),
  flyer: (x) => A('attack', 5000, 180, 400, [{ a: 'move', mode: 'leap', dist: 160, land: [dmg(1.2 * big(x), self(36), x.kind)] }]),
  plant: (x) => A('attack', 4000, 240, 500, [{ a: 'projectile', coef: 1.0 * big(x), kind: x.kind, speed: 260, range: 260 }]),
  construct: (x) => A('attack', 7000, 90, 900, [dmg(1.7 * big(x), self(90), x.kind, [st('knockdown', 700)])]),
  bug: (x) => A('attack', 5000, 60, 400, [dmg(1.2 * big(x), single, x.kind, [st('poison', 3000)])]),
};

export function abilityFor(text: string, x: AbilityCtx): CreatureAbility {
  const body = text.replace(/^Phase \d+:\s*/i, '');
  for (const [re, make] of RULES) if (re.test(body)) return { text: body, matched: true, ...make(x, body) };
  return { text: body, matched: false, ...DEFAULT[x.arch](x) };
}
