# 08: Canon rulings (v1)

These rulings answer the questions the 06-outline pass raised. They are binding on every file, and the bible files have been edited to match where needed. Add new rulings at the bottom.

## World and calendar
- **R1. Turning dates.** The Concord was sworn in C. 0. The first Concordant was crowned in **C. 4**, once the Citadel was finished, and a Turning falls every twelve years after that (C. 4 + 12n). The 85th Turning was **C. 1012**. The next ones would have been 1024, 1036 and 1048. The Bell rang in **C. 1042, out of turn**, when no Turning was due. That is itself a clue: Casimir rang it (`insight.who_rang`).
- **R2. The half-stone rule.** A half-stone will not leave its resting place, or sing, for anyone but its bearer. That is why nobody could use them in thirty years, why nemeses who sat on one never made it work, and why the Hollow King needs bearers to bring them to him.
- **R3. Unsung** means *born* without a spark. Ulf the Unsung was born Unsung and raised by Skalds as a drummer. The Silent Maestro took the ordinary voice he did have.
- **R4. Morvane bosses are "Sentinels"** (the Sentinels of the Turning Road; Sentinel A and B; flag `story.sentinel.<school>`). "Warden" is now used only for the Rime class, the Wardens of the Wall and the Forge Warden mini.
- **R5. Abbess Morwen is the Sentinel of two schools:** Radiance (the Abbess) and Song (her drowned choir). Beating her sets **both** `story.sentinel.radiance` and `story.sentinel.song`. That makes twelve marks from eleven Sentinels.
- **R6. The Bell and Morwen.** Morwen will not let the Bell be rung **out of turn**, and she is furious that it rang in C. 1042. At the Eve of the Turning (II-6) the gathered bearers carry the stones, so this is a true Turning, and she yields. In campaigns that fought her earlier (Radiance, Song, Jester), Aldous rings it unopposed. Nobody has to fight her to finish Act II.
- **R7. Every nemesis escapes to the gate and waits there.** When the hero opens it at I-10, the nemesis slips through behind them.
- **R8. Herald and Union Chimera are made per campaign.** In each campaign the Hollow King makes *that* campaign's nemesis his Herald (magic schools), or binds them into the Union Chimera (martial schools) as its heart. The bestiary's base Herald and Chimera are the template; the outlines' body-part and costume flavour is canon for each campaign.
- **R9. Who wears the crown in the Turning ending.**
  - **Non-Fist campaigns:** the crown passes to Fist and the **Fist bearer** is crowned. That is the Monk bearer, or the Brawler bearer if they were featured.
  - **Fist campaigns:** the outline's choice stands (the Monk crowns Abbess Shirin; the Brawler sees Big Mother Ox win it in the Grand Pit).

## Bearers
- **R10. The sibling bearer is first met at II-5**, the Stone Court, as an NPC in your story. C-6 is a later personal scene where the two halves sing together. In co-op, the two players can simply be both bearers.
- **R11. How bearers are gathered.**
  - Each bearer helped sets `story.bearer.<class> = true`. `story.bearers_gathered` is the **number of distinct bearer flags set**; the engine derives it, so a bearer can't be counted twice.
  - Sources:
    - II-5 sibling: +1
    - C-5 Sentinel B: +1
    - two featured threads: +2
    - III-2 Legion camp, a freed bearer: +1
    - each optional **Sentinel hunt**: +1, for the bearer of that Sentinel's school
  - The Turning ending needs **6**. The main path gives 4–5, so players earn the rest with Sentinel hunts or the Legion camp.
- **R12. "Helps the X bearer claim their mark".** In *your* campaign, that school's bearer is an NPC who can't beat their own Sentinel. Your win gives them their mark. This is true even when the Sentinel is another class's Sentinel A in that class's own campaign (for example, the Reaver beating Varric for Blade).

## Realms
- **R13. Glacierhome's held hour.** Bearers and a few hour-pin wearers ("hour-walkers") can move inside the hold. The hold breaks when the Spire half is lifted (Rimecaller I-8).
- **R14. The Outland Clans.** The Frostbound Jarl, Torvald's uncle, leads them at the start and falls at Warden I-3. Torvald leads after that.
- **R15. The Coil Guild.** Chancellor Volta Sterne is its head. "Guildmother" is Tess Ampery's honorific as the eldest master.
- **R16. Guildmaster Vex** runs the Thieves' Exchange from his sea-fort at Gallows Reef. He appears in the Jester's Exchange scenes but is fought only by the Corsair.
- **R17. Black pearls.** Tears seeping through the Pawned Gate harden into black pearls, on both sides. That's how Pell Odd smuggles them in Concordia. The Velvet King has bought the gate back and waits at it for a bearer to open it.
- **R18. The Iron Colossus** wakes on Bell night and walks out of the Fortress Forge through three walls, leaving an empty cradle in zone 3. **The Mountain King** comes down to the Stair Gate on Bell night; his summit throne stands empty.
- **R19. Dawnspire has no night.** Its "night" scenes take place in the **Hour of Lamps**, the one hour when the Cathedral's light is turned down for the lamp-trimming.

## Concordia: school embassies (Act II C-1 places, for Claude 2)
| School | Place | Notes |
|---|---|---|
| Ash | Kilnmouth (vil:kiln) | Golem Nine |
| Rime | Wardenhold (vil:warden) | |
| Storm | Cliffstair (vil:cliff) | |
| Radiance | Abbeyshore (vil:shore) | with Godric, Aldous and Morwen nearby |
| Umbral | Old Hobb's register, the Brindlecross churchyard (Duskweaver); the Drowned Rat, Old Coach Inn (Shade) | |
| Verdant | Thornhollow (vil:thorn) | |
| Blade | Rook's Watch House (Swordsman); the Chapel of the Drowned Bell (Samurai) | |
| Iron | the Ironhold embassy at Gildport (Knight); Deepworks diggers at the Gilded Ruins (Juggernaut) | |
| Fist | the Welcome Hall, a half-sunk embassy-cloister in Briar Hollow (Monk); the cellar ring under the Briar & Kettle (Brawler) | |
| Hunt | Hollis Lodge (vil:lodge); cormorant fishers under Tamsin's ferry at Abbeyshore (Falconer) | |
| Guile | Lanternford (vil:ford) | |
| Song | the Gilded Goose (Wil Crane's inn), then the Song exiles at Abbeyshore: the Shore Chapel (Bard) and the Fish Mill drummers (Skald) | |

## Flags
- **R20.** There are no `npc.*` flags in Hollow Crown content. Use `<class>.<npc>_met` and similar. (ash.md is fixed: `arcanist.ignace_met`, `reaver.hask_home`.)
- **R21.** Every I-10 sets both `story.gate_open` and `story.act = 2`.

## New canon accepted from the outline pass
- **Ash and Song:**
  - Rosalind Vell's voice was taken by the Silent Maestro seven years ago.
  - Casimir visited the Velvet Court as a boy.
  - His Bard parent wrote him a lullaby. The parents' genders are left unstated.
- **Umbral, Verdant and Blade:**
  - Nyx Aubade and Grey Mab are estranged sisters.
  - The Weeping Willow is a cutting of the Elder Tree.
  - Lucia Ferro beat Ser Auguste Vellacourt on the night of the Hollowing; it is his only loss, and the reason he never lets a duel end.
  - Ikeda Shun was Kanemori's student, and Ikeda's name is the word Kanemori has saved for thirty years.
  - Old Tomoe taught the Thousand-Edge General.
- **Iron, Fist and Hunt:**
  - Berenika's writ: "He cannot hear the stones, so he cannot want them."
  - Ser Gideon Marke carried the crown into the hall for Casimir; Godric stood guard at the door. Both memories are true.
  - Doran Kell turned back before the gates shut.
  - The Hooded Man is **Teodor Tanager**, Old Wren's apprentice.
- **Rime, Storm and Radiance:** Mother Celestine Hale and Corwin Hale are cousins. Corwin's family left Solaria for Concordia four generations ago.
- **Mentor starting trust** (from the outline headers):

| Mentor | Trust | Mentor | Trust | Mentor | Trust |
|---|---|---|---|---|---|
| Thrane | 2 | Brenna | 3 | Halla | 2 |
| Dagny | 3 | Tess | 3 | Odran | 2 |
| Celestine | 2 | Beatrix | 2 | Gideon | 2 |
| Gussie | 3 | Shirin | 3 | Pops | 2 |
| Bannock | 2 | Wren | 3 | Fennick | 3 |
| Dot | 2 | Rosalind | 2 | Ragna | 3 |

  The remaining four (Nyx, Mab, Yarrow, Holt, Ferro and Kanemori) are given in their outline headers.

## Requests to other owners
- **Claude 2 or 3:** a hero ground-shadow toggle, driven by `shade.shadowless` (true from Shade I-1 until `shade.nemesis_fate = spared`).
- **Claude 4 (self):** a journal word-counter widget for Kanemori (Samurai).

## Rulings from the campaign-data pass
- **R22. Unique first names for major characters.** Song's understudy is **Perdita Brisk**. "Ottilie" belongs to Ottilie Hollis, Maren's mother.
- **R23. Song C-1** opens with Wil at the Gilded Goose (the Song school's inn) and moves on to the Song exiles at Abbeyshore.
- **R24. Accepted from the Song data:**
  - The drowned choir is forty brothers, three of whose names were lost: Brother Ninian, Brother Corrie Harrowby and Little Brother Tod, aged nine.
  - Rosalind Vell signed the Gilded Goose's book aged eleven at the C. 1000 Turning, so she is about 53.
  - Her dresser is Clemency.
  - The Ranger bearer's arrow wounds the White Stag but cannot kill it; the Sentinel fight still happens.
- **R25. Accepted from the Verdant and Blade data:**
  - Shun's empty sheath is carved "KANEMORI. SHUN."
  - Nan Briar lent her ladder to Tobin Barrow, Holt's grandfather, at the Turning of C. 988.
  - Nan once sang the Elder Tree to sleep in Rootholme.
  - Kanemori's eleven words are "The sheath, not the edge, is what a sword is for." His C-6 letter is "Protect.", or "Protect him." at Trusted. The flag `samurai.kanemori_words` counts his words.
- **R26. Ash renames** (to keep major first names unique):
  - Kilnhold's sweep captain is **Dora Flue**.
  - The Drakeholt hermit is **Hild Ashfoot**.
  - The Warden bearer is **Aled Holloway**.
  - "Hettie" now belongs to Hettie Natter (Samurai), "Wenna" to Wenna Sloe (Hedgewitch) and "Bram" to Bram Hatchley (Ranger).
- **Act III wave notes:**
  - Ferro's Ribbon (Swordsman Act III) needs a ribbon source below Trusted. Give the ribbon at III-4 via Percy.
  - The Samurai's "answered the muster → Rook trust +1" should use `dialogue:hook-samurai-rook`.
- **R27. Sentinel B bearers follow R11, not the outlines.** Where an outline named a featured bearer for C-5, the data sets a distinct third bearer instead:
  - Knight → Reaver; Brawler → Arcanist; Juggernaut → Rimecaller; Monk → Sparkwright;
  - Rimecaller → Corsair; Warden → Huntsman; Stormlancer → Rimecaller; Sparkwright → Juggernaut;
  - Hedgewitch → Brawler; Ranger → Huntsman; Swordsman → Stormlancer; Samurai → Duskweaver;
  - Bard → Ranger; Skald → Falconer.

  The data is authoritative.
- **R28. Accepted from the Iron/Fist and Rime/Storm data:**
  - Shirin walked the C. 1012 road as Doran Kell's second. Bodhan Kreel carried Kell's pack, and the Stone Abbot walked ahead of the party.
  - Doc Lint stitched Silas's eye. Berenika drafted the writ in Duty's saddle. Pops's late wife was Marta.
  - The Iron Colossus's plates carry Brotherhood shift-marks. Konrad chose to be bound into the Chimera.
  - Tess's grandmother Winifred Ampery filed Patent No. 1 in C. 961. Dagny's old captain was Haldor Brisk.
  - Wardenhold's only Storm Ram is Old Thunder. Glacierhome's held minute is 11.52.
- **R29. From the Hunt/Guile data.**
  - The Velvet King is the same king who pawned the gate in C. 1012.
  - The Sentinel B bearers are Huntsman → Shade and Falconer → Stormlancer (both per R27), Jester → Cantor and Corsair → Knight.
  - `obj:fledgling-nest` is retired: the Falconer and Stormlancer each have their own prefixed nest.
- **R30. From the Radiance/Umbral data.**
  - Nyx Aubade's kept name is Halcyon; Grey Mab's Duskmere name is Mabyn.
  - Turning dates follow R1: the 44th Turning was C. 520, the 84th C. 1000.
  - The "boy in a blue coat, listening" (`insight.blue_coat_boy`) is young Casimir. Accepted as a hint.
  - The Shorewatch oath ends "until relieved by Oathkeep".
  - Oathbound C-5 (Varric) counts the Swordsman bearer (R27).
  - Only Dawnspire uses the Hour of Lamps (R19). The Gilded March and Nocturne keep the ordinary night `[21, 4]`.
- **Act III wave notes, continued.** The Shade's "Hand them to the Keepers" payoff becomes `dialogue:hook-shade-ysolde`, offering the INSIGHT `tears_older`.
- **R31. Accepted from the Act III data (all 24 classes, 2026-10-20).** The data is authoritative.
  - **Rime, Storm, Radiance, Umbral:**
    - Ser Gallant, held to his word, finally dies at rest on a cart at the Legion camp.
    - Wynn Tarry is new.
    - Seraphine brought Anselm’s chair to the Heart.
    - Clemmie Briggs and Sentry Sixty-One reach the Heart.
  - **Verdant, Blade, Iron:**
    - Percy’s Act III bout is his thousand-and-first.
    - Ferro gave Percy the ribbon, which reaches the hero at III-4 (Act III wave notes).
    - The Samurai’s sheath scene is canon.
    - The Knight leaves Gideon’s spurs on the top stair.
    - Gideon and Hettie stand at the Heart camp.
    - The Shade can hand the Legion’s record to the Keepers.
  - **Fist, Hunt, Guile, Song:**
    - Sorrow’s painted boat is canon.
    - Captain Nobody’s real name is Saltmarsh.
    - Casimir stood at the back of the Velvet Court at nine years old.
    - Rosalind’s aria is *The Lighthouse Keeper’s Daughter*.
    - Ulf’s harpy letter never reached the King.
    - Corva laughs at the end.
    - Bannock writes “Five”.
    - A spared Fist nemesis returns the stolen half.
  - **New Act III NPCs** (names checked unique): anselm-cold-heart, clemmie-briggs-heart, old-gubbins-heart, sentry-sixty-one-heart, thistle-heart, wynn-tarry, tobit-lark-heart, cat-shadow-heart, bryn-tallow-heart, blank-shield, big-mother-ox, captain-nobody.
  - **King lines:**
    - The Bard’s line becomes “Someone sang you to sleep once. I’ve brought the song.” after `bard.lullaby_played`.
    - The Skald’s line becomes “Ulf got his voice back…” when Ulf is spared.
  - **Surname clash:** “Hobday” stays with Kezia Hobday (Brawler). The Bard’s squeezebox busker is **Crumley**.
  - **`{ flag, value }` without `op` means equality** (core fixed by Claude 1). Write `op: '=='` anyway in new data, for clarity.
- **R32. Accepted from the Act I depth pass (Hunt, Guile, Song; 2026-10-20).** The data is authoritative.
  - **Hunt:**
    - Bannock stammered as a boy. Reading the autumn count aloud is his only speech in the hall.
    - Twelve Lodge hunters went up the gate road to the C. 1012 Turning, and the gate shut behind them: the Counting Post.
    - Osric Fallow’s tally stick names three Baron crests behind the cairn-pulling: raven over skull (Ashby), a boar’s head, a silver horseshoe.
    - Corva’s first trophy was a hare she shot aged seven.
    - The Tick Hollows were once “the Lying-Down Place”, where the old elk went to die and the Lodge did not hunt.
    - Wren lost her left eye at twelve to a goshawk she unhooded too fast.
    - Teodor’s childhood list of fears ends with “NOT FRIGHTENED OF: Wren”.
    - The falcon that died with the Cliffstair ring was Merrow, a Mews bird lent to the C. 1011 Turning fair.
  - **Guile:**
    - Sorrow was a page at court as a boy, and kept a pin tally behind the throne of every time the King laughed.
    - Mother Gudgeon’s tab was bait to bring her to the red door.
    - Fennick’s mother walked the high rope over the Docks.
    - Dot’s mother was Captain Annis Brine of the *Underpaid*, the *Overdraft*’s sister ship. She sailed out the night the gate was pawned “to buy it back” and did not return. Dot stole the articles the next morning.
    - Barnaby Quill knew the nameless wharf-boy who became Saltmarsh.
    - The Fleet’s last hanging was in C. 1012, for selling a free captain.
    - Vex was sold to the Exchange by his father for eleven shillings.
    - Minor names: Tolliver Bindle (Rosamund’s groom) and the ship *Saltlark*.
  - **Song:**
    - Rosalind’s last night as the Moon Queen was in C. 1035, conducted by the Maestro. Her first night was as a page, aged eleven.
    - The lullaby sheet “For a Quiet Child” was printed for an unnamed singer of the Citadel. It hints at Casimir’s lullaby without naming him.
    - Ragna sent seven years of “COME HOME” drum-messages to Ulf by harpy. None were delivered; they line Shriek-Mother’s nest.
    - As a boy, Ulf tapped all nine hundred sagas into the Answering Cave wall, signed “ALL OF THEM. U.”
    - The Drove Stone lists the Fells folk who drove the herds to the Turning.
  - **Captain Nobody’s given name is Wenlock** (the Merry Widow fight, Claude 4). His crew and his mother kept it; the name he sold was Saltmarsh.
- **R33. Accepted from the Act I depth pass (Verdant, Blade, Iron, Fist; 2026-10-20).** The data is authoritative.
  - **Verdant:**
    - Yarrow sang Ostara’s mother into the compost when Ostara was nine.
    - Nan Briar planted and quickened the Gardener before leaving for the Concordant’s garden.
    - Old Pennyroyal is the last Bloomkin from before the Hollowing.
    - Bram Hatchley’s daughter Peg married a Marram, so Dilys Marram is his granddaughter.
    - Nell Rennet, a Wayfarer, was Kit Fernsby’s grandmother.
    - Holt’s lookout ladder is Tobin Barrow’s, borrowed from Nan Briar.
    - New Bloomkin: Campion (npc:campion).
  - **Blade:**
    - Ser Odo of the School of Ash was Varric’s last opponent; his statue lies in the river shallows.
    - Celandine Sallow’s first insult was about Cosimo Bracca’s hat.
    - Ferro learned the sword from her grandmother, who sold eels.
    - Kanemori spends a thirteenth word, “Listen”, at I-1, and the word “Go” at I-7.
    - Ikeda keeps every sheath Tomoe sends him.
    - Elder Fumiko Sora is a frog-choir enthusiast.
    - Kenta’s brother is Ryo.
  - **Iron:**
    - Konrad’s purse and the squires’ horses were paid for in Magda Ruhl’s coin.
    - Gideon’s old horse was Steadfast, and his vigil-card is dated C. 990.
    - Gussie’s crate was her father’s.
    - Big Aud Fenner was the Juggernaut who held the roof in C. 610.
    - The Rivet tally-board doubles as Ida Fettle’s bounty board.
  - **Fist:**
    - Doran Kell turned back at the Listening Stone, a boulder on the gate road.
    - Shirin won the abbacy at stones against Halvard.
    - Kestrel’s prayer beads number forty-one.
    - Pops’s championship bunting dates from C. 1009.
    - The Broken Fist final was thrown in C. 1022.
  - **Minor names** (checked unique):
    - Verdant: Dimity Rennet.
    - Blade: Orsola Nappi, Gemma Fosco, Osier Sedge.
    - Iron: Gilbert Mudge, Rosalie Steen, Abel Whitlow.
    - Fist: Hob (a minor character, distinct from Old Hobb of Brindlecross).
- **R34. Accepted from the Act I depth pass (Umbral; 2026-10-20).** The data is authoritative.
  - Grey Mab sold her kept name, Mabyn (R30), to Madam Quince the night she came down from Duskmere. Quince has never sold it on; her drawer marks it KEPT.
  - Grizel Gall was Thief-mother before Mab.
  - The Veil’s founder was struck off the Concord’s shadow-census, and took the name **the Unlisted**. Their cairn reads HERE LIES THE UNLISTED. This is never “Nobody”, which is Captain Nobody’s name (R31).
  - The Veil’s oath: WHAT WE LIFT, WE KEEP SAFE. WHAT WE KEEP, WE GIVE BACK WARM.
  - Escorts in Act I: Nyx Aubade to the road lamp (Duskweaver I-9), and Grey Mab to the moor edge (Shade I-9).
- **R35. Accepted from the wave 2 depth pass (Act II and III class quests; 2026-10-20).** The data is authoritative. Further schools are added here as they gate.
  - **Escorts in Act II:**
    - Ada (Arcanist C-2) and Orrin Mattock (Reaver C-2), each to the Ashfall vent head.
    - Jennet Wadeley to the bog edge (Hedgewitch C-4).
    - Teasel Gammon to the Stag’s glade (Ranger C-5).
    - Tabitha Cresset to the ford edge (Duskweaver C-4). She was “Hester Marchbank” until 2026-10-20: renamed because Hester Glimmer also lives in Lanternford and Marchbank is Precentor Eulalie Marchbank’s surname (Song). The id stays `npc:hester-marchbank`.
    - Constance to the edge of the Spinner’s web (Shade C-2).
  - **Umbral:**
    - Lowen Aske, the Duskmere bell-ringer who came for the C. 1012 Turning, is Nyx’s sweetheart from her TRUST branch. He is alive in Brindlecross, and rings a bell at dusk for the Umbral corner of the churchyard (“somebody’s owed it”).
    - The pipe-smoking shadow cut from the Spinner’s web is Lorcan’s, Constance’s brother.
    - Grizel Gall taught the Rat the Veil oath in the last year the gates were open.
    - The Lantern Queen’s ledger records 212 lights sold to “O. V.” (Oriel Vane).
    - The small shadow at the Heart is Moss’s (when shade.twins_pebble is set).
  - **Wave 2 escorts, continued:**
    - Percy Thimble to the Brindlecross watch-house (Swordsman C-6).
    - Hettie Natter to the chapel (Samurai C-6).
    - Mina Snell up the held pass road (Rimecaller C-2).
    - Thyri Coldbrook to the procession road (Warden C-4).
    - Thaddeus to the Stag’s trail-head (Huntsman C-2).
    - Bartle up the cliff path to the supper ledge (Falconer C-4).
  - **Hunt:**
    - Thaddeus is 71. His father brought him from the Greywilds for a Turning as a boy. He courted a Brindlecross girl, who lies in Hobb’s churchyard.
    - The Lodge’s old law has seven lines, of which three are remembered. The middle lines recovered are “Name what you kill” and “Leave the cairns standing”, and the law ends “AND NEVER TOUCH THE CALF”.
    - Corva missed the Spinner because the smiths were measuring her.
    - The Lightning Jar carried the Stormcrow a fish supper every Turning night.
    - Teodor’s hoods are lined with the words “So you won’t be frightened. T.”
    - Prudence Gannet’s cormorant Sooty was ringed for Ledge Nine, the Spurling eyrie.
  - **Storm** (gated on the PC, 2026-10-20):
    - Hamlin Crake invented the Wind Yard dare-board the night the arches shut, so the young lancers would want to go up. He only ever reached the third flag ("the wind turned"; it didn’t). His goat is Mutton.
    - The Wind Yard board’s top line has been blank since C. 1012.
    - The Cliffstair Storm Spire was designed by the Guildmother (Tess Ampery, R15) and sent in eleven parts. Part six never came because the Spirehold post stopped that week. Part six is a kettle.
    - The Stormcrow’s endless scream is the last Turning news: “The Spire at Cliffstair is lit!” It never was.
    - The Legion’s “fast ones” are walked out with the Lance Clans’ colt drill (“No hurry”).
    - Escorts: Prudence Spindle up the lightning-ladder (Sparkwright C-2); Wynn Tarry to the top of the Twelve Stairs (Stormlancer, Act III).
    - Minor names (Act I depth): Bunty Pyle, Clement Inchley, Gwenna Fold, Tamar Mallory, Gudrun Hailstone, Lob Ferris.
    - Note: three minor NPCs are named Prudence (Gannet, Hunt; Coddle, Verdant; Spindle, Storm). They’re allowed because none is major (R22), but don’t add a fourth. Likewise Hester Glimmer (Guile, Lanternford) and Hester Mudlark (Verdant): no third Hester.
  - **Guile** (Jester and Corsair gated on the PC, 2026-10-20):
    - Escorts: Winnifred Sprat, 80, keeper of the Old Fish Mill, to the old lake steps at Abbeyshore (Jester C-2); Rosie Mossop to the Gildport cart-head (Corsair C-4).
    - The Bog Market weighs black pearls on an old Tidecourt fish-scale, at two shards the pound.
    - Saltmarsh’s tailors measured him to be fitted as the heart of the Union (“Chest, forty-four. Neck, sixteen.”). He gave no name for his plate, because the one he has was bought.
    - The white flagship’s crew are forty-one men, each with a bill of sale. Saltmarsh kept Barnaby Quill’s half-loaf under glass in his cabin, labelled GIVEN, NOT SOLD. B. Q. in a boy’s capitals.
    - The Merry Widow follows Captain Nobody to the Weeping Wall. Her crew list ends “Master: Wen. Wenlock. Ours.”, and her bell is rung at the Heart camp.
  - **Radiance** (gated on the PC, 2026-10-20):
    - Escorts: Mother Ysmay Penhallow to the end of the Abbey causeway (Cantor C-1); Hamish Goodbody to the Gilded Goose (Oathbound C-6). Hamish’s oath count reaches 211, and he stays at the Goose.
    - The drowned choir kept an empty treble part for thirty years: Brother Aldous’s novice part, left “in case”. (Distinct from the guest descant kept empty for Eulalie Marchbank; see Song.) Ysmay, a contralto, tried it the first winter, and the choir stayed silent for a week. After Morwen sleeps, the lake no longer answers the hours.
    - Lucan’s list at Stag’s Rest begins THINGS THAT WEEP. He chose his Brightwatch recruits for being tired: Bede Gorringe, Edony Wickham (her father died in C. 1039) and Oswy Marrable.
    - Tobit Lark followed the hero to the Heart on his own, to sing the amen. Celestine didn’t send him.
    - The Shorewatch stood day watch for thirty years, and nobody ever took night. Petronella has been deaf since C. 1015 and fetched back seven swimmers.
    - Ilsabet’s roll of Varric’s muster has 312 names. Beatrix’s is unticked: “Not her. Not ever. Wait for her at the stair.”
    - Ilsabet’s grey horse, unnamed, still carries a saddle-roll packed for two, with two cups. The youngest of the Sorrow-Sworn is Avice Rudd of Haybright, sworn in C. 1040 aged sixteen.
    - Name change: the Storm Works-Clerk is **Clement Inchley** (was Penhallow; that surname is Ysmay’s). Id unchanged.
  - **Song** (gated on the PC, 2026-10-20). With this, every school’s wave 2 is in.
    - Escorts: Precentor Eulalie Marchbank to the old Abbey landing (Bard C-2); Ebba Coldrey to the Gloamwood birch treeline (Skald C-4).
    - Eulalie was Lyrehaven’s guest descant singer for the C. 1012 Turning. She was in the ferry, halfway over, when the Bell began, and the ferryman turned back. For thirty years the drowned choir left four bars of the fourth verse empty for her. When they let her descant in, the nave’s north door opens. (The guest descants go back to C. 772; Rosalind sang the C. 1000 one aged eleven.)
    - The Song exiles at Abbeyshore are eleven singers, including Pellow, the terrible tenor, and nine Fish Mill drummers, including the brothers Ketil and Sweyn, who never agree on a tempo. The mill loft has forty name-pegs.
    - Marchetti three times wrote a rest into his last movement’s final bar, and three times crossed it out. His Legion fitting-slip ends “heart, to be fitted last.” His last playbill reads “No interval. No ending. Admission: everything.” He bought 41 songs, each receipt with a clause that the seller forget it.
    - Clemency sang Rosalind’s aria to the dressing-room door the night Rosalind’s voice went, ending “and bring her home”. She never told Rosalind.
    - Ebba’s hound is Grimble. Ulf fed her and sewed her a drum-hide collar on his way through the Gloamwood. At his Deep Glade camp he left the Turning Road knotted on a drum-hide strip, and birch-bark carved ULF a dozen times.
    - Every Fells child gets a name-beat at their first singing in the Saga Hall. Ulf never sang, so on the relay he was only “the drummer”, until the hero beats his name on the Legion’s great drum. Hallgerd and the other Fish Mill drummers (nine in all) relay from the Song arch to the Heart, Hallgerd the last post. Since the thaw, Asta drums Ragna’s letters, copying Ragna’s hitch.
    - Name change: the Song copyist is **Wystan Nibworth** (was Penhallow). Id unchanged.
- **R36. Accepted from the shared-acts depth pass (Concordia: Claude 5; Heart: Claude 4; 2026-10-20).** The data is authoritative.
  - **Godric** was nineteen at the C. 1012 Hollowing (What Godric Saw), so he has been Elder of Brindlecross for **twenty winters**, not forty. The codex and NPC bio are fixed.
  - **R6 in data:** the Eve (II-6) shows Morwen only when `story.sentinel.radiance` is unset. In campaigns that freed her, the lake is flat and Aldous takes the rope himself.
  - **The Brindlecross 14’s confidences** (Friendly; Trusted for Wil and Pip):
    - Maren’s wolf is Burr, found eight winters ago, the first that came back wrong.
    - Odo’s mother was the Abbey’s bell-founder, due to pour the second Turning Bell.
    - Rook made cheese before the wolves. She lost her eye to Abner Ditchling of the top farm, with her own lent pitchfork.
    - Ysolde’s sister went home to Frostmere for the C. 1012 Turning.
    - Nan has outlived eleven cats; Parson is her twelfth.
    - Aldous was an Abbeyshore fisher’s boy with the worst voice in the choir, so he stood by the window. (This fits his empty treble part, R35 Radiance.)
    - Sela, a Storm mage, is afraid of thunder.
    - Corwin’s family letters from Solaria, one per Turning, burned with the mill.
    - Wil writes a welcome letter every year “to whoever comes through the arches”, and the Goose keeper sings a door song every Turning eve. Wil is a woman.
    - Hobb has dug his own grave, with no words on the stone. Pip’s list in his boot ends AWAY.
  - **Waystones:** a fifth stone answers from the Heart, where none was mapped (`cc.waystone_heart`). Sela recognises it at the Weeping Wall.
  - **Heart, III-3:** the bearers gather at the twelve school stones at the foot of the Twelve Stairs before climbing. Each school’s stair has one step worn hollow halfway up.
