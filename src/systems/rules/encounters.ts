/**
 * Encounter helpers (Claude 3, docs/PACING.md B + C): pure builders the world (Claude 2) turns into SpawnRequests.
 * They pick creatures, levels, elites and wave sizes; the world picks the positions and when each wave starts.
 * Party size is applied here (spawnCountMult), so callers must not scale the counts again.
 */
import { Rng } from '@/core/rng';
import type { CreatureTier } from '@/core/hc';
import { bestiaryFor } from './creatures';
import { spawnCountMult } from './curves';

export interface EncounterSpawn {
  creature: string;
  level: number;
  /** set only for promoted creatures (a mini used as a lair's last guard) */
  tier?: CreatureTier;
  /** pass straight through to SpawnRequest.elite */
  elite?: boolean;
}

export interface LairRoom {
  room: number;
  /** waves in order: start the next when the previous is dead (or after ~25 s, for pressure) */
  waves: EncounterSpawn[][];
}

const pools = (realm: string) => {
  const all = bestiaryFor(realm);
  return { enemy: all.filter((c) => c.tier === 'enemy').map((c) => c.id), mini: all.filter((c) => c.tier === 'mini').map((c) => c.id) };
};

/**
 * Elite pack (PACING B): one champion plus 2–3 of its kin from the realm's bestiary (more in a party). A pack is
 * worth roughly a mini-boss: ~60–90 s at the intended level. Empty if the realm is unknown.
 */
export function elitePack(realm: string, level: number, partySize = 1, seed = 1): EncounterSpawn[] {
  const { enemy } = pools(realm);
  if (!enemy.length) return [];
  const r = new Rng(seed);
  const lead = r.pick(enemy);
  const kin = Math.round(r.int(2, 3) * spawnCountMult(partySize));
  return [{ creature: lead, level, elite: true }, ...Array.from({ length: kin }, () => ({ creature: r.chance(0.5) ? lead : r.pick(enemy), level }))];
}

/**
 * Lair waves (PACING C): rooms grow from one wave of 3 to three waves of 5–6; every second room ends on an elite and
 * the last room's last wave brings a mini-boss (or an elite pair when the realm has none). Levels creep +1 toward the
 * back. Measured (sim bot, L14 solo, 5 rooms = 9 waves): 2.5–4 min of pure fighting; with pulls, walking and loot
 * a real lair runs ~3× that. Elite packs: 15–20 s for the bot.
 */
export function lairWaves(realm: string, level: number, rooms: number, partySize = 1, seed = 1): LairRoom[] {
  const { enemy, mini } = pools(realm);
  if (!enemy.length || rooms <= 0) return [];
  const r = new Rng(seed);
  const mult = spawnCountMult(partySize);
  const out: LairRoom[] = [];
  for (let i = 0; i < rooms; i++) {
    const last = i === rooms - 1;
    const L = level + (i >= Math.ceil(rooms / 2) ? 1 : 0);
    const nWaves = Math.min(3, 1 + Math.floor(i / 2) + (last ? 1 : 0));
    const theme = [r.pick(enemy), r.pick(enemy)]; // each room leans on two kinds so it reads as a place
    const waves: EncounterSpawn[][] = [];
    for (let v = 0; v < nWaves; v++) {
      const size = Math.round(Math.min(6, 3 + Math.floor(i / 2) + v) * mult);
      const wave: EncounterSpawn[] = Array.from({ length: size }, () => ({ creature: r.chance(0.8) ? r.pick(theme) : r.pick(enemy), level: L }));
      const finalWave = v === nWaves - 1;
      if (finalWave && last) {
        if (mini.length) wave.push({ creature: r.pick(mini), level: L + 1 });
        else wave.push({ creature: theme[0], level: L, elite: true }, { creature: theme[1], level: L, elite: true });
      } else if (finalWave && i % 2 === 1) wave[0] = { ...wave[0], elite: true };
      waves.push(wave);
    }
    out.push({ room: i, waves });
  }
  return out;
}
