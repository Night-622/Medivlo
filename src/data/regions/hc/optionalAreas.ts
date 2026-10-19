/**
 * Optional areas (Claude 2, docs/PACING.md pass 2): off the roads in every realm half, three each.
 *   ruin — a fallen watch with an elite pack, a cache and a find
 *   cave — a small instance `inst:<school>-<side>-cave` (ambush in its heart, a rare cache and a find at the end)
 *   view — a lookout; using it marks the half's ruin and cave on the map
 * Morvane (Concordia) has the same three per region (not the Heart): `area:<region>-<kind>`, e.g. area:gloam-cave.
 * Ids: `area:<school>-<side>-<kind>`; the find `obj:<school>-<side>-<kind>-find` (opens dialogue:obj-… if it
 * exists), the cache `obj:<school>-<side>-<kind>-cache`; entering fires dialogue:area-<school>-<side>-<kind>.
 * Names: Claude 4 may fill OPTIONAL_NAMES (only the name/subtitle fields); unnamed ones use the kind default.
 */

export type OptKind = 'ruin' | 'cave' | 'view';
export const OPT_KINDS: OptKind[] = ['ruin', 'cave', 'view'];

/** area id → display name (and optional subline under the banner) */
export const OPTIONAL_NAMES: Record<string, { name: string; subtitle?: string }> = {
  // Cinderreach, Kilnhold side (Claude 4, depth pass)
  'area:ash-capital-ruin': { name: 'The First Kiln', subtitle: 'Ruin' },
  'area:ash-capital-cave': { name: 'The Stokers’ Deep', subtitle: 'Cave' },
  'area:ash-capital-view': { name: 'Clear Day Point', subtitle: 'Viewpoint' },
  // Cinderreach, Bleeding Fields side
  'area:ash-frontier-ruin': { name: 'The First Palisade', subtitle: 'Ruin' },
  'area:ash-frontier-cave': { name: 'The Hound Den', subtitle: 'Cave' },
  'area:ash-frontier-view': { name: 'Watchers’ Crag', subtitle: 'Viewpoint' },
  // Hunt (Claude 4's helper, depth pass)
  'area:hunt-capital-ruin': { name: 'The First Lodge', subtitle: 'Ruin' },
  'area:hunt-capital-cave': { name: 'The Shedding Cave', subtitle: 'Cave' },
  'area:hunt-capital-view': { name: 'Breath Hill', subtitle: 'Viewpoint' },
  'area:hunt-frontier-ruin': { name: 'Kestrel Keep', subtitle: 'Ruin' },
  'area:hunt-frontier-cave': { name: 'The Calling Cave', subtitle: 'Cave' },
  'area:hunt-frontier-view': { name: 'The Hawk’s Seat', subtitle: 'Viewpoint' },
  // Verdant
  'area:verdant-capital-ruin': { name: 'The Winter House', subtitle: 'Ruin' },
  'area:verdant-capital-cave': { name: 'The Taproot Hollow', subtitle: 'Cave' },
  'area:verdant-capital-view': { name: 'The Hanging Gallery', subtitle: 'Viewpoint' },
  'area:verdant-frontier-ruin': { name: 'The First Rest', subtitle: 'Ruin' },
  'area:verdant-frontier-cave': { name: 'The Blaze Cellar', subtitle: 'Cave' },
  'area:verdant-frontier-view': { name: 'Nine Ways Lookout', subtitle: 'Viewpoint' },
  // Guile
  'area:guile-capital-ruin': { name: 'The Drowned Exchange', subtitle: 'Ruin' },
  'area:guile-capital-cave': { name: 'The Pawn Cave', subtitle: 'Cave' },
  'area:guile-capital-view': { name: 'The Fool’s Leap', subtitle: 'Viewpoint' },
  'area:guile-frontier-ruin': { name: 'The Reef Light', subtitle: 'Ruin' },
  'area:guile-frontier-cave': { name: 'The Widows’ Cave', subtitle: 'Cave' },
  'area:guile-frontier-view': { name: 'Lookout Rock', subtitle: 'Viewpoint' },
  // Rime
  'area:rime-capital-ruin': { name: 'The Stone Reading Room', subtitle: 'Ruin' },
  'area:rime-capital-cave': { name: 'The Year-Ice', subtitle: 'Cave' },
  'area:rime-capital-view': { name: 'The Lamplight Bench', subtitle: 'Viewpoint' },
  'area:rime-frontier-ruin': { name: 'The First Postern', subtitle: 'Ruin' },
  'area:rime-frontier-cave': { name: 'The Captain’s Echo', subtitle: 'Cave' },
  'area:rime-frontier-view': { name: 'Both Sides', subtitle: 'Viewpoint' },
  // Storm
  'area:storm-capital-ruin': { name: 'The First Workshop', subtitle: 'Ruin' },
  'area:storm-capital-cave': { name: 'The Copper Grotto', subtitle: 'Cave' },
  'area:storm-capital-view': { name: 'The Weathervane Walk', subtitle: 'Viewpoint' },
  'area:storm-frontier-ruin': { name: 'The Old Charge-Yard', subtitle: 'Ruin' },
  'area:storm-frontier-cave': { name: 'The Thunder Hollow', subtitle: 'Cave' },
  'area:storm-frontier-view': { name: 'Stormwatch Rock', subtitle: 'Viewpoint' },
  // Blade
  'area:blade-capital-ruin': { name: 'The Old Lists', subtitle: 'Ruin' },
  'area:blade-capital-cave': { name: 'The Duel Cellars', subtitle: 'Cave' },
  'area:blade-capital-view': { name: 'Nineteen Bridges Lookout', subtitle: 'Viewpoint' },
  'area:blade-frontier-ruin': { name: 'The Dojo of One Word', subtitle: 'Ruin' },
  'area:blade-frontier-cave': { name: 'The Hermit’s Cave', subtitle: 'Cave' },
  'area:blade-frontier-view': { name: 'Cloud Step', subtitle: 'Viewpoint' },
  // Song
  'area:song-capital-ruin': { name: 'The Rotunda', subtitle: 'Ruin' },
  'area:song-capital-cave': { name: 'The Grotto of Lost Songs', subtitle: 'Cave' },
  'area:song-capital-view': { name: 'The Dome Walk', subtitle: 'Viewpoint' },
  'area:song-frontier-ruin': { name: 'The Burned Drum-Tower', subtitle: 'Ruin' },
  'area:song-frontier-cave': { name: 'The Answering Cave', subtitle: 'Cave' },
  'area:song-frontier-view': { name: 'The Long Look', subtitle: 'Viewpoint' },
  // Iron
  'area:iron-capital-ruin': { name: 'The First Forge', subtitle: 'Ruin' },
  'area:iron-capital-cave': { name: 'The Drowned Crypt', subtitle: 'Cave' },
  'area:iron-capital-view': { name: 'Nineteen Walls Point', subtitle: 'Viewpoint' },
  'area:iron-frontier-ruin': { name: 'The First Whistle-House', subtitle: 'Ruin' },
  'area:iron-frontier-cave': { name: 'The Prop Gallery', subtitle: 'Cave' },
  'area:iron-frontier-view': { name: 'Black Run Lookout', subtitle: 'Viewpoint' },
  // Radiance
  'area:radiance-capital-ruin': { name: 'The Compline Belfry', subtitle: 'Ruin' },
  'area:radiance-capital-cave': { name: 'The Cool Dark', subtitle: 'Cave' },
  'area:radiance-capital-view': { name: 'The Glare Steps', subtitle: 'Viewpoint' },
  'area:radiance-frontier-ruin': { name: 'The First Watch-Tower', subtitle: 'Ruin' },
  'area:radiance-frontier-cave': { name: 'The Oath-Cave', subtitle: 'Cave' },
  'area:radiance-frontier-view': { name: 'Sunset Rise', subtitle: 'Viewpoint' },
  // Fist
  'area:fist-capital-ruin': { name: 'The First Cloister', subtitle: 'Ruin' },
  'area:fist-capital-cave': { name: 'The Stillness Pool', subtitle: 'Cave' },
  'area:fist-capital-view': { name: 'Thousand Stairs Lookout', subtitle: 'Viewpoint' },
  'area:fist-frontier-ruin': { name: 'The First Ring', subtitle: 'Ruin' },
  'area:fist-frontier-cave': { name: 'The Corner Cave', subtitle: 'Cave' },
  'area:fist-frontier-view': { name: 'Ringside Lookout', subtitle: 'Viewpoint' },
  // Umbral
  'area:umbral-capital-ruin': { name: 'The First Obelisk', subtitle: 'Ruin' },
  'area:umbral-capital-cave': { name: 'The Echo-Well', subtitle: 'Cave' },
  'area:umbral-capital-view': { name: 'The Moonward Steps', subtitle: 'Viewpoint' },
  'area:umbral-frontier-ruin': { name: 'The Counting-House', subtitle: 'Ruin' },
  'area:umbral-frontier-cave': { name: 'The Hiding-Hole', subtitle: 'Cave' },
  'area:umbral-frontier-view': { name: 'The Top Rung', subtitle: 'Viewpoint' },
  // Morvane (Concordia), three per region
  'area:alder-ruin': { name: 'The Old Toll House', subtitle: 'Ruin' },
  'area:alder-cave': { name: 'The Shepherd’s Hole', subtitle: 'Cave' },
  'area:alder-view': { name: 'Bellwether Rise', subtitle: 'Viewpoint' },
  'area:gloam-ruin': { name: 'The Stag Chapel', subtitle: 'Ruin' },
  'area:gloam-cave': { name: 'The Wolfden', subtitle: 'Cave' },
  'area:gloam-view': { name: 'Owl Crown', subtitle: 'Viewpoint' },
  'area:briar-ruin': { name: 'The Old Nursery', subtitle: 'Ruin' },
  'area:briar-cave': { name: 'The Rootcellar', subtitle: 'Cave' },
  'area:briar-view': { name: 'Bramble Top', subtitle: 'Viewpoint' },
  'area:abbey-ruin': { name: 'The Bell Foundry', subtitle: 'Ruin' },
  'area:abbey-cave': { name: 'The Choir Steps', subtitle: 'Cave' },
  'area:abbey-view': { name: 'Bellringer’s Point', subtitle: 'Viewpoint' },
  'area:road-ruin': { name: 'The Waymark Arch', subtitle: 'Ruin' },
  'area:road-cave': { name: 'The Smugglers’ Cut', subtitle: 'Cave' },
  'area:road-view': { name: 'Milestone Hill', subtitle: 'Viewpoint' },
  'area:marsh-ruin': { name: 'The Drowned Lighthouse', subtitle: 'Ruin' },
  'area:marsh-cave': { name: 'The Will-o’-Warren', subtitle: 'Cave' },
  'area:marsh-view': { name: 'Heron Stand', subtitle: 'Viewpoint' },
  'area:frost-ruin': { name: 'The Frozen Waystation', subtitle: 'Ruin' },
  'area:frost-cave': { name: 'The Glass Grotto', subtitle: 'Cave' },
  'area:frost-view': { name: 'Ice Saddle', subtitle: 'Viewpoint' },
  'area:gilded-ruin': { name: 'The Mint', subtitle: 'Ruin' },
  'area:gilded-cave': { name: 'The Gear Pit', subtitle: 'Cave' },
  'area:gilded-view': { name: 'Brass Lookout', subtitle: 'Viewpoint' },
  'area:storm-ruin': { name: 'The Lightning Chapel', subtitle: 'Ruin' },
  'area:storm-cave': { name: 'The Echo Gallery', subtitle: 'Cave' },
  'area:storm-view': { name: 'Crow’s Perch', subtitle: 'Viewpoint' },
  'area:ash-ruin': { name: 'The Cold Forge', subtitle: 'Ruin' },
  'area:ash-cave': { name: 'The Cinder Vault', subtitle: 'Cave' },
  'area:ash-view': { name: 'Ember Ridge', subtitle: 'Viewpoint' },
};

const DEFAULT_NAME: Record<OptKind, string> = { ruin: 'The Fallen Watch', cave: 'The Low Cave', view: 'The Lookout' };
const DEFAULT_SUB: Record<OptKind, string> = { ruin: 'Ruin', cave: 'Cave', view: 'Viewpoint' };

export const optionalId = (school: string, side: 'capital' | 'frontier', kind: OptKind): string => `area:${school}-${side}-${kind}`;

/** Realm halves (`area:<school>-<side>-<kind>`) and Morvane regions (`area:<region>-<kind>`, e.g. area:gloam-ruin). */
export function optionalName(id: string): { name: string; subtitle: string } | null {
  const m = /^area:[a-z]+(?:-capital|-frontier)?-(ruin|cave|view)$/.exec(id);
  if (!m) return null;
  const k = m[1] as OptKind;
  return { name: OPTIONAL_NAMES[id]?.name ?? DEFAULT_NAME[k], subtitle: OPTIONAL_NAMES[id]?.subtitle ?? DEFAULT_SUB[k] };
}
