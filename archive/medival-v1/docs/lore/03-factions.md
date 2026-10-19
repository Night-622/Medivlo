# 03: Factions

Reputation goes from **-100 to +100** per faction, starting at 0 unless noted. Tiers are the same for every faction: **Hated** (-100 to -60, hostile on sight), **Hostile** (-59 to -25), **Wary** (-24 to -1), **Neutral** (0 to 24), **Friendly** (25 to 59), **Honoured** (60 to 89), **Exalted** (90+). Each joinable faction also has its own rank titles (in `FactionDef.ranks`).

Joining one faction moves the others according to the relations table at the bottom.

---

## 1. The Lanternate: `faction:lanternate`
- **What:** the Church of the Seven Lights and the spiritual authority of the Solenne Empire.
- **Leader:** **Hierophant Aurelian IV**: old, frightened, increasingly a figurehead.
- **Power behind:** **Lord-Inquisitor Castor Vellane** of the Order of the Wick.
- **Seat:** Solenne (Lantern Coast). It has a chapel in every Haldish village.
- **Goals:** restore the Brand by recovering the Seven Embers; keep control of magic; find out who is to blame. Under Vellane's influence the answer is "mages".
- **Joining (ranks: Lay Brother/Sister → Acolyte → Lightsworn → Lantern-Knight → Hand of the Hierophant):** Radiance training, holy gear, legal cover, access to Solenne. You must hand over Embers to the Church and submit mages (and maybe companions) to the Wick.
- **Opposing:** inquisitors hunt you in Lanternate lands. Vellane becomes an Act II antagonist.
- **Internal split (choice-driven):** the Hierophant's **Mercy faction** vs Vellane's **Wick faction**. The player can tip it.

## 2. The Order of the Wick: sub-faction `faction:order-of-the-wick`
- The Lanternate's inquisitors and witchfinders. They share the Lanternate's reputation unless the player splits them (Act II). The prologue's **Inquisitor Garrick Hale** is one of them.
- **Symbol:** a pair of wick-scissors over a candle.

## 3. The Crown of Haldmarch: `faction:crown-of-haldmarch`
- **What:** the Haldish kingdom, independent since the Charter of 870 YL.
- **Leaders:** **Queen Aldith** (15, clever, untested) and **Lord Protector Osric Harrow** (regent, war-hero, pragmatic; quietly negotiating with the Drowned Choir to spare his own lands).
- **Seat:** Haldren (Kingsvale).
- **Goals:** survive the winter; stop the Choir in Greywater; keep the Church from taking over the kingdom.
- **Joining (ranks: Freeman → Sworn Sword → Knight of the March → Queen's Champion):** soldiers for the Varn assault, a land grant, a title. The **Aldith vs Harrow** choice in Act I decides who rules.
- **Opposing:** outlaw status in the Haldmarch.

## 4. The Emberwardens: `faction:emberwardens`
- **What:** the remnant of the mage-knight order purged in 1041 YL. At the start that means **one old woman, Hesta Corrow**, plus whatever the player rebuilds.
- **Seat:** the ruins of **Cinderhold** (Kingsvale), which the player can restore through the campaign as a **hub base**.
- **Goals:** protect the leys; gather the Embers; find a way to *rekindle* the Heartfire, or something better.
- **Joining:** the player's "default home" faction from Act I. Ranks: **Kindling → Warden → Ember-Knight → Warden-Captain → Warden-Mother/Father**. Recruiting companions, mages and NPCs into Cinderhold is a long-running side system.
- **Opposing:** you can't really oppose them, but you can **betray Hesta** in Act I (the Lanternate path).

## 5. The Thornwise Circle: `faction:thornwise`
- **What:** druids and wardens of the forests, Aelthi and human. The keepers of the Lullaby.
- **Leader:** **Archdruid Rhiannon Ys-Caer**, an ancient Aelthi who survived the Sundering of Ys as a child.
- **Seat:** Caer Ylwen (Ylwen Deepwood). The prologue's **Nan Briar** is a Thornwise hedge-witch.
- **Goals:** neither chain the Mire nor drown the world, but sing it back to *sleep*. They think there is a third way. (They're right, at a price.)
- **Joining (ranks: Seedling → Thornsworn → Antlered → Elder of the Circle):** Verdant magic and the **Reforge** ending's key (the true Lullaby).
- **Opposing:** the deepwood closes. Ylwen's gate flag never sets, so you take the harder Act II route.

## 6. The Drowned Choir: `faction:drowned-choir`
- **What:** the cult of Nhal and the Mire, and the main villain faction.
- **Leader:** **Ysolde, the Pale Saint**. Lieutenants: **Aldwin Varn, the Drowned Lord** (Act I), **Abbess Morwen** (prologue, already Hollowed), the **Reed-Mother** (Greywater), and **Sister Ilse of the Black Water** (Act II infiltrator).
- **Seat:** Greywater Marsh and the drowned town of Varn; later the Mirelands.
- **Goals:** gather the Seven Embers and carry them to the Heartforge to quench the Heartfire. "Let everyone dream."
- **Joining:** not joinable as a faction. In Act III there is a **dark choice** to side with Ysolde.
- Reputation starts at **-60** (Hated). It can rise only through specific mercy choices, which unlock talking to Hollowed and alternative Act III options.

## 7. The Ashen Creed: `faction:ashen-creed`
- **What:** a free-mage underground opposed to the Church's licences, Ashvar-faithful.
- **Leader:** **The Red Abbess**, real name **Vesper Qadri**, a Qasiri-born pyromancer and a former Lanternate nun.
- **Seat:** hidden cells across the Haldmarch; a stronghold in the Cinder Wastes (the ruins of Qadir).
- **Goals:** break the Church's hold on magic; use the Quench as the moment to do it. Some radicals want to tap the Embers themselves.
- **Joining (ranks: Spark → Flame → Pyre → Brand-Breaker):** Ash magic and smuggled tomes. Expect Lanternate hostility.
- **Opposing:** sabotage and fire-attacks in towns.

## 8. The Iron Concord: `faction:iron-concord`
- **What:** the council of Orrun holds in the Ironspine.
- **Leader:** **High Thane Brannoch Deepforge**, old, conservative and honour-bound.
- **Seat:** Korrath-under-Stone (Ironspine); trade-gate at Dun Korrath-Gate (foothills).
- **Goals:** keep the **Nine Nails** in the Vault holding against the rising Mire; trade; stay out of human wars. Their dark secret: **two of the Nine Nails have already failed.**
- **Joining (ranks: Guest-of-Hall → Oathfriend → Hearthkin → Thane-Sworn):** Runecraft (crafting upgrades), true-iron, and passage to the Heartforge.
- **Opposing:** the passes close; very hard Act II.

## 9. The Hrothi Wolf-Moot: `faction:wolf-moot`
- **What:** the gathering of northern clans.
- **Leader:** **Jarl Sigrun Ice-Eye** of Skelvik, a widowed war-leader under pressure to raid south for food.
- **Seat:** Skelvik and the Moot-stones (Frostreach).
- **Goals:** survive a winter that is killing the north; the young want to **invade the Haldmarch**.
- **Joining (ranks: Outlander → Shield-Friend → Wolf-Sworn → Moot-Voice):** Storm magic, berserker training, and an army for Act III.
- **Opposing:** a Hrothi invasion of the Haldmarch in Act II.

## 10. The Salt League: `faction:salt-league`
- **What:** the corsair-merchant league of the western isles and coast.
- **Leader:** **Admiral Marisol Kestrel**, elected, ruthless and funny.
- **Seat:** Brackhaven (Saltreach Coast); fleets in the Saltreach Isles.
- **Goals:** profit, and freedom from Church and Crown. They have *fished an Ember out of the sea* and mean to auction it.
- **Joining (ranks: Deckhand → Mate → Captain → Commodore):** ships (needed for the isles), smuggling and contraband tomes.
- **Opposing:** no sea travel, so you must win passage another way.

## 11. The Qasiri Caravans: `faction:qasiri`
- **What:** the nomad clans of the Sunscar and the Cinder Wastes, descendants of Qadir.
- **Leader:** **The Cindermother, Ruqaya al-Nar**, the clans' shared oracle-matriarch.
- **Seat:** the oasis-city of Zahrun (Sunscar).
- **Goals:** keep the rest of the world from repeating Qadir. They know how the Ashen Kings tapped the leys, and therefore how the Heartfire can be *reached*.
- **Joining (ranks: Guest → Salt-Sharer → Caravan-Kin → Keeper of the Ash):** cinderglass gear, and the route to the Heartforge's "back door" under Qadir.

---

## Relations matrix (starting values, -100 to 100)

|  | Lant. | Crown | Emberw. | Thornw. | Choir | Ashen | Concord | Moot | Salt | Qasiri |
|---|---|---|---|---|---|---|---|---|---|---|
| **Lanternate** | – | 30 | -70 | -30 | -100 | -90 | 10 | -20 | -40 | -30 |
| **Crown** | 30 | – | 0 | 10 | -80 | -40 | 30 | -50 | -10 | 0 |
| **Emberwardens** | -70 | 0 | – | 30 | -100 | 10 | 20 | 0 | 0 | 20 |
| **Thornwise** | -30 | 10 | 30 | – | -60 | -20 | 0 | 10 | 0 | 10 |
| **Drowned Choir** | -100 | -80 | -100 | -60 | – | -50 | -80 | -70 | -30 | -70 |
| **Ashen Creed** | -90 | -40 | 10 | -20 | -50 | – | -10 | 0 | 30 | 40 |
| **Iron Concord** | 10 | 30 | 20 | 0 | -80 | -10 | – | -10 | 10 | 0 |
| **Wolf-Moot** | -20 | -50 | 0 | 10 | -70 | 0 | -10 | – | 20 | 0 |
| **Salt League** | -40 | -10 | 0 | 0 | -30 | 30 | 10 | 20 | – | 20 |
| **Qasiri** | -30 | 0 | 20 | 10 | -70 | 40 | 0 | 0 | 20 | – |

**Spillover rule** (for the reputation system): when the player gains *X* reputation with faction A, every faction B changes by `X × relation(A,B) / 200`, rounded toward zero. Example: +20 Lanternate gives -7 Emberwardens and -9 Ashen Creed.
