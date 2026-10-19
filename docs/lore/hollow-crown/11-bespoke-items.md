# 11: Bespoke story items: hand-off to Claude 3

Every mentor and story gift in the 24 campaigns currently gives an **existing stand-in item**. The dialogue describes the real object; the stand-in is only what lands in the pack.

This file lists them all, from `tools/narrative/gifts.ts`, which scans the data and can be regenerated. Each row gives:
- the proposed bespoke id;
- the stand-in it would replace;
- the flag set beside it (Claude 3 can hook passives on it);
- the giver;
- a suggested type.

**Suggested types:**
- **trinket:** neck, ring or charm slot, small passive.
- **gear:** a real weapon or armour piece in the class's family.
- **relic:** quest-only, no stats, kept in the pack.

**When an id is added:** tell Claude 4. Claude 4 swaps `giveItem` to it; no other data changes. Rows without a bespoke id stay on their stand-ins, which is fine to ship.

## Mentor farewell gifts (I-9; Friendly or Trusted)
| Proposed id | Stand-in | Flag | Giver | Object | Type |
|---|---|---|---|---|---|
| `i_thrane_lantern` | `i_lantern` | `arcanist.thrane_lantern` | Coalby Thrane | hat-lantern that lights where nothing else will | trinket |
| `i_brenna_axe_ring` | `i_emberring` | `reaver.brenna_ring` | Brenna Scald-Hand | axe-ring | trinket (ring) |
| `i_halla_hour_pin` | `i_moonpend` | — | Halla Vint | hour-pin, never worn | trinket |
| `i_halla_watch` | `i_locket` | `rimecaller.halla_watch` | Halla Vint | pocket-watch stopped at 11.52, wound again | trinket |
| `i_dagny_horn` | `i_bonecharm` | — | Dagny Orr | watch horn | trinket |
| `i_dagny_fin_crest` | `i_signet` | `warden.dagny_crest` | Dagny Orr | the fin crest off her shield | trinket |
| `i_tess_goggles` | `i_copper` | — | Tess Ampery | forty-year goggles | trinket (face) |
| `i_odran_pennant` | `i_silk` | — | Odran Gale | lance-pennant | trinket |
| `i_celestine_sun` | `i_sunpend` | `cantor.celestine_censer` | Celestine Hale | the little sun off her censer lid | trinket |
| `i_beatrix_oath_ring` | `i_signet` | `oathbound.beatrix_ring` | Beatrix Holm | oath-ring, sun outward | trinket (ring) |
| `i_nyx_kept_name` | `i_locket` | `duskweaver.nyx_name` | Nyx Aubade | her kept name, whispered (a locket) | relic |
| `i_nyx_spectacles` | `i_moonpend` | `duskweaver.nyx_spectacles` | Nyx Aubade | her spectacles | trinket |
| `i_mab_picks` | `i_picks` | `shade.mab_picks` | Grey Mab | the Mab set of picks | trinket / tool |
| `i_yarrow_acorn` | `i_sunpend` | `hedgewitch.yarrow_acorn` | Mother Yarrow | acorn from the tree’s last winter (used again in Act III) | relic |
| `w_holt_waymark_knife` | `w_dagger_steel` | `ranger.holt_knife` | Holt Barrow | waymark knife | gear (dagger) |
| `w_ferro_blade` | `w_sword_steel` | `swordsman.ferro_sword` | Lucia Ferro | the blade she beat him with | gear (sword) |
| `i_ferro_signet` | `i_signet` | `swordsman.ferro_ribbon` | Lucia Ferro | the Ladder’s gold signet | trinket (ring) |
| `a_kanemori_hat` | `a_blade_mail_helm` | `samurai.kanemori_hat` | Haru Kanemori | his hat (“Yours.”) | gear (head) |
| `w_gideon_sword` | `w_sword_steel` | `knight.gideon_sword` | Gideon Marke | the sword from the last Turning | gear (sword) |
| `i_gussie_whistle` | `i_copper` | `juggernaut.gussie_whistle` | Gussie Haldt | shift-whistle on a copper ring | trinket (neck) |
| `i_shirin_stones_bowl` | `i_onyx` | `monk.stones_bowl` | Shirin Tal | stones bowl with the loaded black stone | trinket |
| `i_pops_towel` | `i_st` | `brawler.pops_towel` | Tobiah “Pops” Knuckle | corner towel | trinket |
| `i_bannock_horn` | `i_bonecharm` | `huntsman.bannock_horn` | Ulric Bannock | elk-bone Lodge horn | trinket |
| `a_wren_glove` | `a_hunt_leather_hands` | `falconer.wren_glove` | Old Wren | fifty-year falconry glove | gear (hands) |
| `w_little_fennick` | `w_wand_wood` | `jester.little_fennick` | Fennick Pantaloon | birch marotte that heckles | gear (wand) |
| `i_dot_compass` | `i_copper` | `corsair.dot_compass` | Dot Brine | compass that points at what you owe most | trinket |
| `i_rosalind_opera_glasses` | `i_bonecharm` | `bard.opera_glasses` | Rosalind Vell | mother-of-pearl opera glasses | trinket (face) |
| `w_ragna_saga_staff` | `w_staff_iron` | `skald.saga_staff` | Ragna Saga-Keeper | staff notched for every lost saga | gear (staff) |

(`i_clapper` and `i_tear` from the shared Concordia act are already specific; no change.)

## Pets and a mount (flag only; no item is given today)
These need a pet/mount definition if pets exist. Until then the flag just records the gift.

| Flag | Giver scene | What |
|---|---|---|
| `arcanist.pudding_pet` | `dialogue:arcanist-thrane-farewell#pudding` | Pudding |
| `sparkwright.kettle_pet` | `dialogue:sparkwright-tess-farewell#kettle` | Kettle |
| `stormlancer.biddy_mount` | `dialogue:stormlancer-odran-farewell#biddy` | Biddy, a mount |
| `monk.vespers_pet` | `dialogue:monk-shirin-farewell#goat` | Vespers the goat |
| `juggernaut.sergeant_pet` | `dialogue:juggernaut-gussie-farewell#sergeant` | Sergeant |
| `huntsman.biscuit_pet` | `dialogue:huntsman-bannock-farewell#biscuit` | Biscuit |
| `falconer.pibb_pet` | `dialogue:falconer-wren-farewell#pibb` | Pibb |
| `corsair.interest_pet` | `dialogue:corsair-dot-farewell#interest` | Interest |
| `bard.encore_pet` | `dialogue:bard-rosalind-farewell#encore` | Encore the dog |

## Optional Act III keepsakes (not given yet; add only if wanted)
`i_gideons_spurs` (Knight), `i_first_whistle` (Juggernaut), `i_holts_punchline` (Ranger) and `i_black_tear_plume`. If Claude 3 adds them, Claude 4 wires them into the Act III scenes that already narrate them.
