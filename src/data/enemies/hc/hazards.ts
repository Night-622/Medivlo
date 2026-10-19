/**
 * Arena hazards per boss (Claude 3, docs/systems/ARENA_HAZARDS.md). Claude 2's BossWatch places `count` objects of
 * each kind evenly on a ring at ~60% of the boss arena's radius (never on the entry line), as interactables with
 * props { hazard: kind }, then calls combat.addHazard for each. `art` picks Claude 2's prop:
 * stone → f_runestone, vent → d_grate, light → d_candelabra, pillar → d_pillar, cover → d_pew / crates.
 * The boss's own rule (anchorStun, ventHeal, lightOnly, paysBack, shielded) lives in its ability lines (campaign.ts).
 * Mapping per boss: Claude 4 (outline set pieces) → this table.
 */
import type { HazardKind } from '@/core/hc';

export interface HazardPlacement { kind: HazardKind; count: number; art: 'stone' | 'vent' | 'light' | 'pillar' | 'cover'; r?: number; charges?: number }

export const HC_HAZARDS: Record<string, HazardPlacement[]> = {
  // anchors: knock / bait the boss into them (stun + Vulnerable)
  'cb_hask-the-unburnt': [{ kind: 'anchor', count: 3, art: 'stone', r: 22 }],        // cooled stone
  'cb_still-reflection': [{ kind: 'anchor', count: 3, art: 'stone', r: 22 }],        // mirrors
  'cb_torvald-wallbreaker': [{ kind: 'anchor', count: 3, art: 'stone', r: 22, charges: 1 }], // gaps in the Breach: a shove closes one
  'cb_the-unsheathed': [{ kind: 'anchor', count: 1, art: 'stone', r: 24 }],          // its empty sheath (last phase: the fight ends)
  // vents: heal the boss unless doused…
  'cb_provost-morrow': [{ kind: 'vent', count: 3, art: 'vent', r: 40 }],             // Kiln grates; F = the half-stone's song
  'cb_bramblewife-ostara': [{ kind: 'vent', count: 3, art: 'vent', r: 40 }],         // sap-grafts; F = cut a graft
  'cb_organ-that-ate-a-choir': [{ kind: 'vent', count: 4, art: 'vent', r: 36 }],     // pipes blast the party; F on the floor key shuts one
  // …or, turned by the hero, hurt the boss instead
  'cb_volta-sterne': [{ kind: 'vent', count: 3, art: 'vent', r: 40 }],               // pylons, rewired
  'cb_konrad': [{ kind: 'vent', count: 3, art: 'vent', r: 40 }],                     // the Forge's great hammers, lured
  'cb_seraphine-cold': [{ kind: 'vent', count: 3, art: 'vent', r: 44 }],             // time patches, ticked forward
  // lights: the boss is only hurt inside a lit one
  'cb_shadow-that-left': [{ kind: 'light', count: 3, art: 'light', r: 70 }],         // the Veil Heart lanterns
  // pillars: shield / pay-back / calm while they stand
  'cb_perpetual-engine': [{ kind: 'pillar', count: 3, art: 'pillar', r: 18 }],       // its gears
  'cb_the-auditor': [{ kind: 'pillar', count: 3, art: 'pillar', r: 18 }],            // abacus pillars
  'cb_the-hooded-man': [{ kind: 'pillar', count: 3, art: 'pillar', r: 18 }],         // standing stones holding the calm
  // cover: blocks shots, charges and (with charges) burns away until the next phase
  'cb_lucan-brightwater': [{ kind: 'cover', count: 3, art: 'cover', r: 24, charges: 2 }], // shadow-casters vs the lens
  'cb_the-gardener': [{ kind: 'cover', count: 3, art: 'cover', r: 26 }],             // hedge walls
  'cb_beetle-king': [{ kind: 'cover', count: 3, art: 'cover', r: 26 }],              // the junk it sheds
  'cb_corva-ashby': [{ kind: 'cover', count: 3, art: 'cover', r: 24 }],              // trophy cases
  'cb_impresario-marchetti': [{ kind: 'cover', count: 3, art: 'cover', r: 26 }],     // flying flats
};
