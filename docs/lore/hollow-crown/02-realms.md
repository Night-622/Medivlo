# 02: The thirteen realms

The twelve school realms sit in a ring around Concordia, in the handoff map's order. Each one entry below gives:
- the realm's **note** and **culture**;
- **thirty years apart**: what went wrong after the Hollowing;
- the **crisis** when the game begins;
- its **factions**;
- its **creatures** (realms.js order: 3 enemies, 2 minis, 1 boss);
- its **two class areas**, each with 4 quest zones and 3 lairs;
- its **realm gate** and the realm boss who holds it.

**World ids (Claude 2's contract, docs/world/HOLLOW-CROWN-WORLD.md):**
- Realm space: `realm:<school>`.
- Class areas: `area:<school>-capital` and `area:<school>-frontier`. Zones: `zone:<school>-<capital|frontier>-1..4`. Lairs: `inst:<school>-<capital|frontier>-lair-1..3`.
- Realm gate: `area:<school>-gate`.
- Waystones: `ws:<school>-capital`, `ws:<school>-frontier`, `ws:<school>-gate`.

**Lair roles (the same in every area; see 05-campaign-framework.md):**
- **Lair 1:** a handoff realm mini-boss. The capital class gets one mini and the frontier class gets the other.
- **Lair 2:** the class's own Act I boss.
- **Lair 3:** the first fight with the class's nemesis, where the half-stone is won.
- **The gate:** the realm boss. Both classes of a school fight it, from different sides of the gate, with class-specific framing.

---

## Cinderreach (Ash): fire and change
**Capital:** Kilnhold. **Landmark:** the Great Kiln. **Gate:** the Cinder Gate.

The Ash school believes nothing is finished until it has been through the fire. Kilnhold fires pottery, glass, iron and, according to its proverbs, people. Burning anything larger than a candle needs a permit from the Kiln Conclave, and the permit office is on fire.

**Thirty years apart:** with the Ash Stone gone, the Great Kiln's thousand-year fire began to fail. The Conclave has fed it furniture, then libraries, then the old forests, and the ash fields have spread every year.

**Crisis:** black tears have reached the Bleeding Fields, the lava flats of the old Schools' War where the rock still runs red. **Pyrelord Vulkan**, the fire-beast who sleeps coiled around the Cinder Gate, is waking hollow.

**Factions:**
- **The Kiln Conclave:** the Arcanists' masters, scholarly, bureaucratic and frightened.
- **The Red Muster:** the Reaver war-clans of the Fields.
- **The Ashen Zealots:** a cult that wants everything burned "clean", the tears included.

**Creatures:**
- Enemies: Magma Hound, Lava Slime, Kiln Golem.
- Minis: the Ashen Zealot (Arcanist lair 1), the Cinder Drake (Reaver lair 1).
- Boss: **Pyrelord Vulkan**.

**Half-stones:** the Kiln half lies under the Great Kiln; the Field half lies in the old Battle-Kiln at the centre of the Bleeding Fields.

### area:ash-capital: Kilnhold (Arcanist)
| id | Name | Theme |
|---|---|---|
| zone 1 | Kiln Ward | lower streets of soot-brick and chimney-pots; permit queues, glowing gutters |
| zone 2 | Glassblowers' Row | bright workshops, a coloured-glass market, apprentices with singed eyebrows |
| zone 3 | the Smoke Terraces | stepped rooftops wreathed in smoke; Conclave towers and the old observatories |
| zone 4 | the Kiln Roots | flues and tunnels under the city that feed the Great Kiln; Lava Slimes and Kiln Golems |
| lair 1 | the Zealots' Furnace | a chapel turned furnace, run by the Ashen Zealot |
| lair 2 | the Glass Archive | a burning library, held by the **Ledger Flame**: a fire-spirit made of thirty years of burned records |
| lair 3 | the Heart of the Kiln | the Great Kiln's core, where the Kiln half-stone glows; nemesis I |

### area:ash-frontier: the Bleeding Fields (Reaver)
| id | Name | Theme |
|---|---|---|
| zone 1 | the Red Muster | Reaver war-camp of hide tents, forge-fires and wagers |
| zone 2 | the Bleeding Fields | cracked black lava flats with red veins; Magma Hounds hunting in packs |
| zone 3 | Bone Ridge | the old Schools' War battlefield; rusted banners and hollow-touched dead |
| zone 4 | the Drakeholt | cliffs and roosts above the Fields; cinder winds |
| lair 1 | the Drake Roost | the Cinder Drake's nest on the highest crag |
| lair 2 | the Brand-Pits | Magma Hound dens around the **Brand-Mother**, a hound matriarch the size of a house |
| lair 3 | the Old Battle-Kiln | a war-kiln from the Schools' War, holding the Field half-stone; nemesis I |

---

## Frostmere (Rime): cold and stillness
**Capital:** Glacierhome. **Landmark:** the Ice Spire. **Gate:** the White Gate.

Rimecallers and Wardens have held the frozen passes for a thousand winters. The Rime school prizes patience: what stays still, lasts. Glacierhome is a city of archives cut into a glacier, where everything is kept, from treaties and recipes to the exact temperature of every day for nine hundred years.

**Thirty years apart:** when the Rime Stone fled, the Ice Spire lost its "hum" and the city began to melt. The Regent stopped it by **holding the hour**. A great working keeps the city frozen at one moment of one night in C. 1012. Inside Glacierhome nobody ages and nothing changes: the bread in the ovens has been baking for thirty years.

**Crisis:** black tears are leaking through the Wardwall, and the Winter Tyrant, the ice-king the Rimecallers built to hold back the cold, has woken hollow at the White Gate.

**Factions:**
- **The Archive of the Spire:** the Rimecallers.
- **The Wardens of the Wall:** the frontier guard.
- **The Outland Clans:** starving people beyond the Wall, led by the Frostbound Jarl.

**Creatures:**
- Enemies: Snow Wolf, Frost Wraith, Ice Sentry.
- Minis: the Frostbound Jarl (Warden lair 1), the Glacier Blob (Rimecaller lair 1).
- Boss: **the Winter Tyrant**.

**Half-stones:** the Spire half lies in the crown of the Ice Spire; the Wall half lies frozen in the Breach of the Wardwall.

### area:rime-capital: Glacierhome (Rimecaller)
| id | Name | Theme |
|---|---|---|
| zone 1 | the Spire Stair | city streets spiralling up the glacier; people frozen mid-step, a few who aren't |
| zone 2 | the Hall of Held Hours | the great archive; clocks all stopped at the same minute |
| zone 3 | the Frozen Market | a market held still mid-bargain; ice-glass stalls, a thief caught mid-snatch for thirty years |
| zone 4 | the Undercrypt | meltwater tunnels beneath the glacier, where the hold is failing; Frost Wraiths |
| lair 1 | the Melt Cisterns | the city's flooded reservoir, home of the Glacier Blob |
| lair 2 | the Mirror Gallery | a hall of ice mirrors, held by the **Still Reflection**: your own frozen double |
| lair 3 | the Crown of the Spire | the top of the Ice Spire and the source of the held hour; nemesis I |

### area:rime-frontier: the Wardwall (Warden)
| id | Name | Theme |
|---|---|---|
| zone 1 | the Wardwall Gatehouse | the Warden fortress-town on the wall; drill yards, frost forges |
| zone 2 | the Long Rampart | the top of the wall, miles long; watch-fires going out one by one |
| zone 3 | the Wolfrun Passes | narrow white passes below the wall; Snow Wolf packs |
| zone 4 | the Jarlsfell | the outlands beyond the wall: frozen steadings, starving clans |
| lair 1 | the Jarl's Longhall | the Frostbound Jarl's hall in the Jarlsfell |
| lair 2 | the Wraith Barrows | Warden burial mounds, held by the **Hundredth Warden**: the wall's founder, hollow and still on watch |
| lair 3 | the Breach | the broken section of the Wardwall, holding the Wall half-stone; nemesis I |

---

## Thunderreach (Storm): lightning and speed
**Capital:** Spirehold. **Landmark:** the Lightning Tower. **Gate:** the Copper Gate.

Slate grass and copper towers on cliffs that are always under storm. The Storm school believes in going first and apologising after. Sparkwrights in Spirehold build ever more improbable machines, and Stormlancer clans ride Storm Rams across the Heights.

**Thirty years apart:** the Lightning Tower once caught the storms and calmed them. Without the Storm Stone it catches nothing, and the storms have gone wild. Spirehold is in a frantic race to build a taller tower; fourteen have fallen down.

**Crisis:** **Skyrender**, the great storm-bird whose wings make the weather, has been hollowed, and the storm is now one endless storm over the Copper Gate.

**Factions:**
- **the Coil Guild**: the Sparkwrights, competitive and full of patents.
- **the Lance Clans**: the Stormlancers.
- **the Tempest Coven**: storm-witches who want the storm to win.

**Creatures:**
- Enemies: Thunderbird, Static Wisp, Coil Sentry.
- Minis: the Storm Ram (Stormlancer lair 1), the Tempest Witch (Sparkwright lair 1).
- Boss: **Skyrender**.

**Half-stones:** the Tower half lies in the crown of the Lightning Tower; the Eye half lies at the Eye of the Storm.

### area:storm-capital: Spirehold (Sparkwright)
| id | Name | Theme |
|---|---|---|
| zone 1 | Coil Street | workshops and sparks; explosions on the hour |
| zone 2 | the Copper Spires | the forest of failed towers, some still standing, some leaning |
| zone 3 | the Dynamo Halls | great wheel-halls that power the city; Coil Sentries gone haywire |
| zone 4 | the Tower Foundations | under the Lightning Tower: copper roots, static, Static Wisps |
| lair 1 | the Witch's Belfry | an abandoned bell-tower the Tempest Witch rings to call the storm |
| lair 2 | the Grand Patent Vault | the guild's vault of forbidden inventions, held by the **Perpetual Engine Mk. XII**, which has refused to stop |
| lair 3 | the Tower Crown | the top of the Lightning Tower, holding the Tower half-stone; nemesis I |

### area:storm-frontier: the Thunderclap Heights (Stormlancer)
| id | Name | Theme |
|---|---|---|
| zone 1 | the Ram Pastures | clan steadings and Storm Ram herds; wind-chimes everywhere |
| zone 2 | the Thunderclap Heights | open cliff-top plains under the storm; lightning strikes in patterns you can learn |
| zone 3 | Skyfall Gorge | a deep gorge of fallen rocks and fallen Thunderbirds |
| zone 4 | the Eyrie Steps | cliff stairs up to the Thunderbird nests |
| lair 1 | the Ram King's Crag | the Storm Ram's crag, where the herd-king fights for the herd |
| lair 2 | the Thunderbird Aerie | the nest of **Old Clatterwing**, a hollowed Thunderbird matriarch |
| lair 3 | the Eye of the Storm | the still, silent centre of the storm, holding the Eye half-stone; nemesis I |

---

## Solaria (Radiance): light and oath
**Capital:** Dawnspire. **Landmark:** the Sun Cathedral. **Gate:** the Dawn Gate.

Golden meadows and white stone. The Radiance school keeps light and keeps promises; to them these are the same thing. Cantors sing the hours in the Sun Cathedral, and the Oathbound hold the Gilded March.

**Thirty years apart:** "the sun never quite sets over the Sun Cathedral." Since the Hollowing it doesn't set at all. The Hierarch decreed that night must not return, and the Cathedral has burned its light without rest for thirty years. Solaria has not slept properly in a generation. Everyone is very polite and very tired.

**Crisis:** the forced light is failing. On the Gilded March "the Dimming" has begun, and real night is creeping in for the first time in thirty years. The **Fallen Hierarch** is weeping black tears behind his mask, and has shut himself in at the Dawn Gate.

**Factions:**
- **the Cathedral Choir**: the Cantors.
- **the Order of Oathkeep**: the Oathbound.
- **the Brightwatch**: the Hierarch's inquisitors, who punish anyone who mentions night.

**Creatures:**
- Enemies: Lightbearer, Zealous Acolyte, Sun Gargoyle.
- Minis: the Seraph of the Last Light (Cantor lair 1), the Gilded Lion (Oathbound lair 1).
- Boss: **the Fallen Hierarch**.

**Half-stones:** the Altar half lies on the High Altar of the Sun Cathedral; the March half lies in the Dimming Shrine.

### area:radiance-capital: Dawnspire (Cantor)
| id | Name | Theme |
|---|---|---|
| zone 1 | Cathedral Close | white stone squares, pilgrims, the Brightwatch on every corner |
| zone 2 | the Choir Cloisters | singing halls and gardens; exhausted novices nodding off mid-hymn |
| zone 3 | the Sunward Market | the market that never closes; a black trade in sleep-draughts |
| zone 4 | the Undercroft | the only dark place in Dawnspire, where the forbidden night is kept in jars |
| lair 1 | the Bell Loft | the Cathedral's great bell, guarded by the Seraph of the Last Light |
| lair 2 | the Reliquary of Hours | a vault of relics, held by the **Saint Who Wasn't**: a relic-golem built of false saints' bones |
| lair 3 | the High Altar | the heart of the Sun Cathedral, holding the Altar half-stone; nemesis I |

### area:radiance-frontier: the Gilded March (Oathbound)
| id | Name | Theme |
|---|---|---|
| zone 1 | Oathkeep | the Oathbound's border fortress; oath-stones, a training yard, a hall of broken swords |
| zone 2 | the Sunfields | golden wheat border country; villages that have never seen a star |
| zone 3 | the Gilded March | the border road with its golden waymarks, Gilded Lions roaming |
| zone 4 | the Dimming | where the light fails: the first night in thirty years, and terrified villagers |
| lair 1 | the Lion's Gate | an old gatehouse, den of the Gilded Lion |
| lair 2 | the Forsworn Chapel | a ruined Oathbound chapel, held by **Ser Gallant the Forsworn**, a knight who broke his oath and cannot die |
| lair 3 | the Dimming Shrine | the shrine at the centre of the Dimming, holding the March half-stone; nemesis I |

---

## Nocturne (Umbral): shadow and memory
**Capital:** Duskmere. **Landmark:** the Moon Obelisk. **Gate:** the Dusk Gate.

A realm of endless dusk. The Umbral school teaches that a shadow is a memory the light left behind. Duskweavers keep the realm's memories in the Moon Obelisk, and Shades work in the shadows they keep. People in Nocturne have two names: the one they use and the one they keep in the Obelisk.

**Thirty years apart:** without the Umbral Stone the Obelisk began to leak. Nocturne is forgetting. Old people forget their names, children forget their parents, and shadows wander off on their own.

**Crisis:** the **Eclipse Queen**, Nocturne's ancient ruler, means to swallow the moon so that nothing more can be forgotten. She sits at the Dusk Gate, half eclipsed.

**Factions:**
- **the Obelisk Keepers**: the Duskweavers.
- **the Veil**: the Shades' guild of the warrens.
- **the Duskblade Cult**: memory-thieves who sell stolen pasts.

**Creatures:**
- Enemies: Shade Wisp, Night Spider, Void Bat.
- Minis: the Duskblade Cult Leader (Duskweaver lair 1), the Moon Stalker (Shade lair 1).
- Boss: **the Eclipse Queen**.

**Half-stones:** the Obelisk half lies in the shadow of the Moon Obelisk; the Veil half lies at the heart of the Veilwarrens.

### area:umbral-capital: Duskmere (Duskweaver)
| id | Name | Theme |
|---|---|---|
| zone 1 | the Lanternless Streets | a city lit only by the moon; quiet, courteous, forgetful people |
| zone 2 | the Memory Gardens | gardens where memories grow as pale flowers; some wilting |
| zone 3 | Obelisk Plaza | the great square around the Moon Obelisk; queues of people waiting to remember |
| zone 4 | the Archive of Shadows | stacks of bottled shadows, now spilling; Shade Wisps |
| lair 1 | the Cult Undercroft | the Duskblade Cult's den beneath a forgotten temple |
| lair 2 | the Hall of Lost Names | a hall papered in forgotten names, held by **the Unremembered**: a creature made of everyone Nocturne forgot |
| lair 3 | the Obelisk's Shadow | the shadow-side of the Moon Obelisk, holding the Obelisk half-stone; nemesis I |

### area:umbral-frontier: the Veilwarrens (Shade)
| id | Name | Theme |
|---|---|---|
| zone 1 | the Veilwarrens | a slum-maze of tunnels and rope bridges, home of the Veil |
| zone 2 | the Webbed Deeps | lower tunnels full of Night Spiders and silk |
| zone 3 | the Moonwell | an open shaft where the moon is seen from below; the warrens' only market |
| zone 4 | the Stalker Moors | purple moorland above the warrens, where Moon Stalkers hunt |
| lair 1 | the Stalker's Den | the Moon Stalker's hollow on the moor |
| lair 2 | the Brood Spire | a silk tower, home of **Mother Hushweb**, a vast Night Spider who eats sound |
| lair 3 | the Veil Heart | the deepest chamber of the warrens, holding the Veil half-stone; nemesis I |

---

## Wildheart (Verdant): growth and rot
**Capital:** Rootholme. **Landmark:** the Elder Tree. **Gate:** the Thorn Gate.

Overgrown and loud with life. The Verdant school holds that growth and rot are one thing seen from two ends. The capital is built inside a single tree. Hedgewitches tend it, Rangers walk the wilds, and everyone argues about compost.

**Thirty years apart:** without the Verdant Stone, growth lost its brakes. The Elder Tree grows a ring every day, swallowing streets. Its rot side spreads too: blight runs along the Thornwilds where the tears touch.

**Crisis:** **the Elder Grove**, the ancient root-mind of the Elder Tree, has been hollowed, and it has wrapped the Thorn Gate in a wall of grasping roots.

**Factions:**
- **the Root Circle**: the Hedgewitches, who meet in a ring and disagree in a ring.
- **the Wayfarers**: the Rangers.
- **the Bloomkin**: plant-folk awoken by the wild growth, not yet sure whose side they're on.

**Creatures:**
- Enemies: Bloomtrap, Thorn Beetle, Briarling.
- Minis: the Ancient Puffcap (Hedgewitch lair 1), the Mossback Boar (Ranger lair 1).
- Boss: **the Elder Grove**.

**Half-stones:** the Heartwood half lies inside the Elder Tree; the Rot half lies in the Rotting Glade.

### area:verdant-capital: Rootholme (Hedgewitch)
| id | Name | Theme |
|---|---|---|
| zone 1 | the Bough Markets | markets on the great boughs; swinging bridges, lanterns, too many cats |
| zone 2 | the Sap Wells | where the tree's sap is tapped; sticky, sweet, dangerous |
| zone 3 | the Root Cellars | the city's lower hollows, being swallowed by new growth |
| zone 4 | the Canopy Hollows | the high crown of the tree, bright and windy; Briarlings |
| lair 1 | the Spore Cellar | a mushroom cellar where the Ancient Puffcap has grown enormous |
| lair 2 | the Seed Vault | the Circle's seed store, held by **the Gardener**: a topiary giant still pruning a garden no one wants |
| lair 3 | the Heartwood | the living heart of the Elder Tree, holding the Heartwood half-stone; nemesis I |

### area:verdant-frontier: the Thornwilds (Ranger)
| id | Name | Theme |
|---|---|---|
| zone 1 | Wayfarer's Rest | the Rangers' tree-camp at the edge of the wilds |
| zone 2 | the Thornwilds | dense bramble forest; trails that move overnight |
| zone 3 | the Bloomfen | a flowering marsh; Bloomtraps disguised as lilies |
| zone 4 | the Rotwood | grey, blighted forest where the tears soaked in |
| lair 1 | Mossback Wallow | the Mossback Boar's mud wallow |
| lair 2 | the Beetle Mound | a giant mound ruled by the **Carapace Queen**, a Thorn Beetle as big as a cart |
| lair 3 | the Rotting Glade | the dead glade at the Rotwood's heart, holding the Rot half-stone; nemesis I |

---

## Steelvale (Blade): the edge
**Capital:** Edgewater. **Landmark:** the Fencing Hall. **Gate:** the Edge Gate.

Silver grass and clean rivers. Every child here learns the sword before they learn to read. The Blade school believes a quarrel settled cleanly is a quarrel ended. Swordsmen duel in Edgewater's salles, and the Samurai keep silence on the Hushpine Terraces.

**Thirty years apart:** the Blade Stone made an ended duel *stay* ended. Without it, no quarrel finishes: a loser simply challenges again, and their children after them. Edgewater lives on the Ladder, an endless ranking of duels, and duellists who died mid-feud rise as Duelist Revenants to keep fighting.

**Crisis:** **the Thousand-Edge General**, Steelvale's marshal, means to turn every blade in the realm outward and march on Concordia. He is mustering at the Edge Gate.

**Factions:**
- **the Salles of Edgewater**: the Swordsmen.
- **the Hushpine Order**: the Samurai.
- **the Ronin Companies**: masterless blades for hire.

**Creatures:**
- Enemies: Duelist Revenant, Blade Dancer, Training Automaton.
- Minis: the Sword Saint (Swordsman lair 1), the Ronin Captain (Samurai lair 1).
- Boss: **the Thousand-Edge General**.

**Half-stones:** the Hall half lies under the floor of the Fencing Hall; the Terrace half lies in the High Terrace shrine.

### area:blade-capital: Edgewater (Swordsman)
| id | Name | Theme |
|---|---|---|
| zone 1 | the Fencing Quarter | bright streets of salles and challenges; the Ladder board in the square |
| zone 2 | the Duelling Bridges | river bridges where every crossing is a challenge |
| zone 3 | the Riverside Salles | grand old fencing schools on the river, some abandoned |
| zone 4 | the Old Armoury | the city's ancient armoury, crawling with Training Automatons |
| lair 1 | the Saint's Tomb | the crypt of the Sword Saint, who has not stopped duelling |
| lair 2 | the Grand Salle | the oldest salle, held by **the Perfect Parry**: a fencing automaton that has never been touched |
| lair 3 | the Fencing Hall | the realm's landmark, holding the Hall half-stone; nemesis I |

### area:blade-frontier: the Hushpine Terraces (Samurai)
| id | Name | Theme |
|---|---|---|
| zone 1 | the Hushpine Temple Road | a silent pilgrim road through pines; speaking aloud is rude |
| zone 2 | the Hushpine Terraces | stepped tea-gardens and dojo yards on the hillside |
| zone 3 | the Ronin Camps | a lawless valley of mercenary camps |
| zone 4 | the Bamboo Shallows | flooded bamboo groves; Blade Dancers in the mist |
| lair 1 | the Ronin Fort | the Ronin Captain's stockade |
| lair 2 | the Shrine of the Sheathed Blade | a sealed shrine, held by **the Unsheathed**: a cursed sword-spirit that has never been put away |
| lair 3 | the High Terrace | the top terrace and its shrine, holding the Terrace half-stone; nemesis I |

---

## Ironhold (Iron): the wall
**Capital:** Anvilgate. **Landmark:** the Fortress Forge. **Gate:** the Iron Gate.

Dusty hills full of mines and walls. Knights and Juggernauts are forged here, sometimes literally. The Iron school endures; it holds the line. It was **Iron's Concordant, Queen Berenika**, who named Casimir her steward, and Ironhold has never forgiven itself.

**Thirty years apart:** Ironhold walled itself in out of shame. Anvilgate has walls inside its walls inside its walls. The Fortress Forge has spent thirty years building one thing: **the Iron Colossus**, a giant war-construct to march on Concordia and take the crown back.

**Crisis:** the Deepworks have struck **hollow iron**, metal soaked in black tears, and the Colossus was built from it. It has woken on its own and stands at the Iron Gate, waiting for a king.

**Factions:**
- **the Order of the Anvil**: the Knights.
- **the Deepworks Brotherhood**: the Juggernauts and miners.
- **the Regency**: Berenika's heirs, who want the crown back for Iron.

**Creatures:**
- Enemies: Iron Sentry, Rivet Golem, Scrap Beetle.
- Minis: the Iron Revenant (Knight lair 1), the Forge Warden (Juggernaut lair 1).
- Boss: **the Iron Colossus**.

**Half-stones:** the Forge half lies in the Forge Throne; the Lode half lies in the Hollow Lode.

### area:iron-capital: Anvilgate (Knight)
| id | Name | Theme |
|---|---|---|
| zone 1 | the Anvilgate Wards | walls within walls; gate-tolls between every street |
| zone 2 | the Tilt Yard | jousting lists, squires, heraldry, a great deal of shouting |
| zone 3 | the Fortress Forge | the vast forge-halls building the Colossus; sparks and slag |
| zone 4 | Berenika's Wall | the "Wall of Shame" built after the Hollowing, now cracking; Iron Sentries |
| lair 1 | the Barrow of Knights | crypts of the Order, where the Iron Revenant still keeps vigil |
| lair 2 | the Heraldry Vault | the vault of the realm's arms, held by **the Blank Shield**: a living suit of armour with no heraldry and no name |
| lair 3 | the Forge Throne | the Regency's throne in the heart of the Forge, holding the Forge half-stone; nemesis I |

### area:iron-frontier: the Deepworks (Juggernaut)
| id | Name | Theme |
|---|---|---|
| zone 1 | Rivet Town | a mining town of iron shacks, steam and shift-whistles |
| zone 2 | the Deepworks | mine shafts and rail-carts; Rivet Golems at work |
| zone 3 | the Slag Rivers | glowing slag-runs and crane bridges |
| zone 4 | the Scrapfields | mountains of discarded machinery; Scrap Beetles |
| lair 1 | the Warden Foundry | an old foundry where the Forge Warden still turns out sentries |
| lair 2 | the Scrap Hive | a beetle hive in the scrap, ruled by **the Beetle King**, armoured in thirty years of junk |
| lair 3 | the Hollow Lode | the deepest seam, where hollow iron is mined, holding the Lode half-stone; nemesis I |

---

## Mountainreach (Fist): the self
**Capital:** Stonecloister. **Landmark:** the High Monastery. **Gate:** the Stair Gate.

Highland terraces and mountain monasteries. Every path here is a stair. The Fist school teaches that the self is the only weapon you can't drop. Monks train in Stonecloister; Brawlers fight for coin and glory in the Lowfold Pits.

**Thirty years apart:** the 85th Turning should have crowned **Fist**. The Mountain champion, Master Doran Kell, was on the road to Concordia when the gates shut. He climbed home, crowned himself **the Mountain King**, and has ruled the peaks from a throne carved from the summit for thirty years, bitter and unbeaten.

**Crisis:** black tears are running down the mountain. Monks are leaving the cloister to serve the Mountain King, who has sealed the Stair Gate. He says he is waiting for the crown that was owed him.

**Factions:**
- **the High Monastery**: the Monks.
- **the Pit Leagues**: the Brawlers and their promoters.
- **the King's Climbers**: the Mountain King's monk-army.

**Creatures:**
- Enemies: Rogue Monk, Mountain Goat, Stone Slime.
- Minis: the Temple Guardian (Monk lair 1), the Master of the Broken Fist (Brawler lair 1).
- Boss: **the Mountain King**.

**Half-stones:** the Summit half lies in the Summit Shrine; the Pit half lies in the Quarry Throne.

### area:fist-capital: Stonecloister (Monk)
| id | Name | Theme |
|---|---|---|
| zone 1 | the Thousand Stairs | the stair-city; prayer flags, tea stalls on every landing |
| zone 2 | the Prayer Terraces | terraced training grounds; Mountain Goats with no respect for meditation |
| zone 3 | the Bell Courts | the monastery courts and the great bell; half the cells empty |
| zone 4 | the Cloud Kitchen | the mountaintop kitchens above the clouds, overrun by Stone Slimes |
| lair 1 | the Guardian Hall | the hall of the Temple Guardian, who will let no one pass unworthy |
| lair 2 | the Silent Cell | the cell of **the Ninefold Abbot**, a monk who meditated so hard he split into nine |
| lair 3 | the Summit Shrine | the shrine at the peak, holding the Summit half-stone; nemesis I |

### area:fist-frontier: the Lowfold Pits (Brawler)
| id | Name | Theme |
|---|---|---|
| zone 1 | Knuckletown | the valley fight-town; bunting, bookies and bruises |
| zone 2 | the Lowfold Pits | the fighting pits themselves, from village rings to the grand arena |
| zone 3 | the Goat Paths | mountain trails between valleys; smugglers and goats |
| zone 4 | the Quarry Rings | abandoned quarries turned into outlaw rings |
| lair 1 | the Broken Fist Dojo | the dojo of the Master of the Broken Fist, a disgraced master |
| lair 2 | the Grand Pit | the champion's arena, held by **Big Mother Ox**, unbeaten for nineteen years |
| lair 3 | the Quarry Throne | the outlaw promoter's seat in the deepest quarry, holding the Pit half-stone; nemesis I |

---

## The Greywilds (Hunt): the chase
**Capital:** Antlerford. **Landmark:** the Great Lodge. **Gate:** the Antler Gate.

Endless olive forest and wide plains. Huntsmen and Falconers follow the herds. The Hunt school holds that the chase is a conversation between hunter and hunted, and that a hunter takes only what the hunt gives.

**Thirty years apart:** the herds have stopped following their old roads. The Great Hunt, the spirit of the chase itself, an antlered beast of light, lost its path, and the hunt became a slaughter. Trophy-hunters grew rich and the Lodge grew poor.

**Crisis:** **the Great Hunt** has been hollowed and runs at the head of a hollow herd. It circles the Antler Gate, trampling anything that moves.

**Factions:**
- **the Great Lodge**: the Huntsmen.
- **the Mews**: the Falconers.
- **the Trophy Barons**: noble poachers.

**Creatures:**
- Enemies: Great Elk, Hunting Hawk, Giant Tick.
- Minis: the Poacher Chief (Huntsman lair 1), the Alpha Bear (Falconer lair 1).
- Boss: **the Great Hunt**.

**Half-stones:** the Lodge half lies in the Trophy Hall; the Moor half lies on the Moor's Crown.

### area:hunt-capital: Antlerford (Huntsman)
| id | Name | Theme |
|---|---|---|
| zone 1 | the Lodge Yards | the town round the Great Lodge; kennels, smokehouses, bragging |
| zone 2 | the Tannery Lanes | the leather quarter, pungent, with a black market in tear-stained pelts |
| zone 3 | the Elkway | the old herd road through the forest, now empty |
| zone 4 | the Old Snares | the deep forest, strung with poachers' traps; Giant Ticks |
| lair 1 | the Poachers' Camp | the Poacher Chief's camp |
| lair 2 | the Tick Hollows | a rotten hollow, home of **the Swollen Queen**, a tick fat on hollow blood |
| lair 3 | the Trophy Hall | a baron's trophy hall, holding the Lodge half-stone; nemesis I |

### area:hunt-frontier: the Hawkmoor (Falconer)
| id | Name | Theme |
|---|---|---|
| zone 1 | the Mews Cliffs | the Falconers' cliff village of perches and jesses |
| zone 2 | the Hawkmoor | open moorland under huge skies; Hunting Hawks |
| zone 3 | the Windscour Plain | the flat plain where the herds once ran; bones and silence |
| zone 4 | the Featherfall | a valley where hollowed birds fall from the sky |
| lair 1 | the Bear Cave | the Alpha Bear's den |
| lair 2 | the Hollow Eyrie | the nest of **Grandmother Talon**, the eldest great hawk, hollowed |
| lair 3 | the Moor's Crown | a stone ring on the highest hill, holding the Moor half-stone; nemesis I |

---

## Tidecourt (Guile): the angle
**Capital:** Velvet Harbour. **Landmark:** the Thieves' Exchange. **Gate:** the Pawned Gate.

Rose heath and crooked harbours. Everything is for sale, including you. The Guile school says there is always another way round. Jesters work the courts of Velvet Harbour, and Corsairs work the sea.

**Thirty years apart:** in the year of the Hollowing the **Velvet King** pawned the realm gate to a creditor (the gate is literally hocked; its new name is official), and the realm has run on credit ever since. Black tears wash up on Tidecourt's shores as **black pearls**, and they are now the realm's most valuable trade.

**Crisis:** the black-pearl trade is hollowing the harbour, and the Velvet King has bought the Pawned Gate back. He means to sell passage through it to the Hollow King.

**Factions:**
- **the Velvet Court**: the Jesters' playground.
- **the Brine Fleet**: the Corsairs.
- **the Thieves' Exchange**: the guilds, run by Guildmaster Vex.

**Creatures:**
- Enemies: Cutpurse, Thief Crow, Mimic Slime.
- Minis: the Masked Phantom (Jester lair 1), Guildmaster Vex (Corsair lair 1).
- Boss: **the Velvet King**.

**Half-stones:** the Court half lies in the Velvet Court; the Reef half lies at the Gallows.

### area:guile-capital: Velvet Harbour (Jester)
| id | Name | Theme |
|---|---|---|
| zone 1 | the Velvet Docks | rose-pink harbour streets, pickpockets, gulls with criminal records |
| zone 2 | the Masquerade Quarter | a district permanently in carnival; everyone masked |
| zone 3 | the Exchange Floor | the Thieves' Exchange, where anything is traded, including promises |
| zone 4 | the Crooked Stairs | the twisted old town; Mimic Slimes posing as treasure |
| lair 1 | the Phantom Theatre | an abandoned theatre haunted by the Masked Phantom |
| lair 2 | the Counting House | the royal treasury, held by **the Auditor**, a ledger-golem that collects every debt, with interest |
| lair 3 | the Velvet Court | the King's court, holding the Court half-stone; nemesis I |

### area:guile-frontier: Gallows Reef (Corsair)
| id | Name | Theme |
|---|---|---|
| zone 1 | the Brine Market | a floating market of lashed-together ships |
| zone 2 | Gallows Reef | the reef islands and their gibbets, home port of the Brine Fleet |
| zone 3 | the Wreckers' Coves | sea-caves where wreckers lure ships with lanterns |
| zone 4 | the Crow Islands | rocky isles thick with Thief Crows and pirate hoards |
| lair 1 | Vex's Guildhold | Guildmaster Vex's sea-fort |
| lair 2 | the Wreck of the Merry Widow | a ghost ship held by **Captain Nobody**, who signed away his name |
| lair 3 | the Gallows | the great gibbet-rock at the reef's heart, holding the Reef half-stone; nemesis I |

---

## Harmonia (Song): the voice
**Capital:** Lyrehaven. **Landmark:** the Grand Opera. **Gate:** the Lyre Gate.

Lilac meadows that hum when the wind blows. Bards and Skalds tell its history out loud. The Song school believes nothing is true until it has been sung, and nothing is over until it has been sung about.

**Thirty years apart:** without the Song Stone, songs began to slip away. Each year Harmonia forgets more tunes. The Grand Opera fell silent when its Maestro stopped conducting and began **collecting voices**: he is the Silent Maestro.

**Crisis:** the meadows have stopped humming. The **Silent Maestro** stands at the Lyre Gate with a choir of stolen voices, conducting the silence.

**Factions:**
- **the Conservatory**: the Bards.
- **the Saga Halls**: the Skalds of the Fells.
- **the Discord**: musicians who believe silence is the purest song.

**Creatures:**
- Enemies: Siren Wisp, Songbird Harpy, Bellflower.
- Minis: the Choir Phantom (Bard lair 1), the Discord Bard (Skald lair 1).
- Boss: **the Silent Maestro**.

**Half-stones:** the Opera half lies on the stage of the Grand Opera; the Fell half lies in the Echo Barrow.

### area:song-capital: Lyrehaven (Bard)
| id | Name | Theme |
|---|---|---|
| zone 1 | the Opera Quarter | grand lilac streets around the silent Opera; buskers with no tunes left |
| zone 2 | the Busking Steps | the stair-streets where music is still allowed; a turf war over the last good songs |
| zone 3 | the Conservatory | the music school, its practice rooms going quiet |
| zone 4 | the Prompter's Cellars | the tunnels beneath the Opera; Siren Wisps |
| lair 1 | the Choir Loft | the Opera's loft, haunted by the Choir Phantom |
| lair 2 | the Grand Organ | the organ-hall, held by **the Organ That Ate a Choir** |
| lair 3 | the Opera Stage | the great stage of the Grand Opera, holding the Opera half-stone; nemesis I |

### area:song-frontier: the Echoing Fells (Skald)
| id | Name | Theme |
|---|---|---|
| zone 1 | the Drum-Steads | the Skalds' hill-farms, where news is drummed valley to valley |
| zone 2 | the Echoing Fells | lilac fells where shouted words come back changed |
| zone 3 | the Saga Stones | standing stones carved with sagas; some being worn blank |
| zone 4 | the Harpy Cliffs | sea-cliffs of Songbird Harpies |
| lair 1 | the Discordant Hall | a mead-hall taken by the Discord Bard |
| lair 2 | the Harpy Roost | the roost of **Shriek-Mother**, the eldest harpy |
| lair 3 | the Echo Barrow | the barrow of the first Skald, holding the Fell half-stone; nemesis I |

---

## Concordia (no school): the union
**Capital:** Brindlecross. **Landmark:** the Concord Citadel. In the Heart of Morvane (`region:heart`).

The union at the centre of the world. All twelve schools live here together, and so does the evil from the Heart: the Hollow King and his black tears. Every hero ends up here. Concordia contains the land of **Morvane** (the handoff's original map). See [04-concordia.md](04-concordia.md).

**Creatures:**
- Enemies: Hollow Legionnaire, Weeping Shade, Black Tear Knight.
- Minis: the Herald of the Hollow King, the Union Chimera.
- Boss: **the Black Concord**: the Hollow King's war-engine, made of the empty crown's settings. It is the first stage of the final fight.

## The realm gates
Each gate is a great arch of its realm's stone, carved with all twelve schools' marks, and has been shut since C. 1012. Since last winter black tears have seeped through every gate. **Act I ends at the gate:** the hero beats the realm boss and opens the gate with their half-stone, which unlocks Act II.
