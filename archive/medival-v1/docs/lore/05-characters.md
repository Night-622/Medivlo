# 05: Major Characters

## Villains

### Ysolde Maerin, the Pale Saint (main antagonist), `npc:ysolde`
- **Who:** a Solenni Lightsworn healer, canonised in 1170 YL for ending the Grey Lung, and secretly the last apprentice of the hidden Emberwarden Hesta Corrow. As Keeper of the Brand she looked into it, and through it into the Dreaming. She learned the Heartfire was dying and believes a deliberate, gentle quench is the only mercy left (see 02-history).
- **Look:** tall, white-robed, with skin gone translucent. Water runs constantly from her eyes and hair and never pools. She speaks softly. Her halo is a ring of black water.
- **Wants:** the Seven Embers, including the one fused into the player, carried to the Heartforge so the world can dream.
- **Arc:** she appears in the prologue as an **Ember-vision**, and the visions grow with every Ember the player carries; they are intimate, almost tender conversations. Act I: her hand behind Varn. Act II: she races the player for the Embers and sometimes **saves the player's life**, because she needs you. Act III: she learns, or refuses to learn, that **Nhal lied**. A gentle unforging is impossible; the world would be *eaten* while awake. She can be **redeemed, defeated or joined**.
- **Voice:** *"You are so warm, little spark. I remember being warm. It hurt."*

### Nhal, the Drowned Spark (the hidden power)
- The Eighth god, who drowned with the Mire out of pity. Over the ages Nhal has become something the Mire *uses*: a single hunger dressed in pity. Nhal speaks through Ysolde's visions in Act II, then directly in Act III.
- **Twist:** Nhal doesn't want the world to dream. Nhal wants to **become the new Heartfire**, a god-heart of the Mire beating at the world's core. Nhal would remake Morvane in its own image, with everyone Hollowed and "happy".

### Lord-Inquisitor Castor Vellane (rival / grey antagonist), `npc:castor-vellane`
- **Who:** head of the Order of the Wick: sincere, brilliant, terrifying. He believes mages caused the Quench and that only absolute order can survive the Long Winter.
- **Arc:** in Act I he hunts the Ashmarked. In Act II he controls the Lanternate and may become the main enemy if the player sides with the Ashen Creed, or a **cold ally** if the player sides with the Church. In Act III he wants to **use the Embers to forge a new Brand that only the Church controls**. That is the "Rekindle (tyranny)" ending.
- **Voice:** *"I do not hate magic, child. I hate fire left unattended."*

### Aldwin Varn, the Drowned Lord (Act I boss), `npc:aldwin-varn`
- The Lord of Varn. His wife and daughter died of the Grey Lung that Ysolde ended too late for them, and the Choir promised he'd see them again in the Dreaming. He opened the floodgates on the Night of Falling Ash. He is now half-Drowned, ruling the flooded ruin of Varn with his ghostly family (they're Mire-illusions).
- **Choice:** kill him, or show him through Purge that his family isn't there. He then dies at peace, with a reputation shift.

### Abbess Morwen, the Drowned (prologue boss), `npc:abbess-morwen`
- The abbess of Saint Wenna's Abbey. When an Ember fell into the Abbey's mere, the black water rose with it, and Morwen chose to drown in it rather than flee. The Hollowed version still keeps the hours, ringing bells underwater.
- She guards the Ember not for the Choir but out of a broken sense of duty. Her last words if cleansed: *"Light… Is it Lanternmass?"*

## Mentors and companions

Companions are recruitable and have loyalty (`companion.<id>.loyalty`, 0–100) and personal quests. Phase 1 has **Maren** only (she joins temporarily in the prologue).

| Companion | Id | Who | Class-feel | Joins | Personal arc |
|---|---|---|---|---|---|
| **Maren Hollis** | `npc:maren-hollis` | Brindlecross huntress, the player's childhood friend; quick to anger, quicker to laugh | Ranger (bow) | Prologue | Her brother Tobin's fate. If he was Hollowed, Act I is *"The Boy in the Reeds"*: hunt or save him in Greywater. |
| **Brother Anselm Pryde** | `npc:anselm-pryde` | Brindlecross's priest; a gentle scholar, secretly doubts the Church | Oathbound / Radiance support | Act I | His faith collapses or transforms. He can become a **Wick inquisitor** (if the player sides with the Church), a **heretic reformer**, or die protecting a mage. |
| **Hesta Corrow** | `npc:hesta-corrow` | the last Emberwarden, 70-ish, with cinderlung; caustic, brave, guilt-ridden over Ysolde | Arcanist / Warden mentor | end of Prologue | Mentor through Act I. **Can die at Varn** (Act I climax) unless certain choices were made. If she lives she runs Cinderhold; if she dies the player inherits *Lastlight*. |
| **Cadoc ap Ynys** | `npc:cadoc-ap-ynys` | an Aelthi exile who still knows part of the Lullaby; dry humour; 300 years old and still the youngest in his family | Ranger / Verdant | Act I (Ylwen) | Teaching the player the true Lullaby means defying his people's oath; this is the key to the Reforge ending. |
| **Grimma Ironsong** | `npc:grimma-ironsong` | an Orrun runesmith, exiled for revealing that two of the Nine Nails failed | Warden / Runecraft | Act I (foothills) | Restore her honour by exposing the Concord's lie, or keep their secret for an alliance. |
| **Vesper Qadri, the Red Abbess** | `npc:vesper-qadri` | leader of the Ashen Creed; ex-nun, Qasiri-born; fire-eyed idealist | Arcanist (Ash) | Act II (optional) | Freedom against burning the world down; she may try to steal an Ember. |
| **Sable** | `npc:sable` | a Quiet Hand thief from Haldren who is slowly, cheerfully becoming Hollowed (and hides it) | Shade | Act I (Haldren) | Can the Ashmark save someone who's half gone? The test case for redeeming Ysolde. |

## Recurring NPCs

| Name | Id | Role |
|---|---|---|
| **Queen Aldith** | `npc:queen-aldith` | 15-year-old queen of Haldmarch; the player can be her champion |
| **Lord Protector Osric Harrow** | `npc:osric-harrow` | regent; secretly dealing with the Choir to spare his lands |
| **Inquisitor Garrick Hale** | `npc:garrick-hale` | prologue witchfinder; recurs in Act I and II as the Wick's hand, and his attitude depends on the prologue |
| **Hierophant Aurelian IV** | `npc:hierophant-aurelian` | head of the Church; can be swayed to mercy |
| **Archdruid Rhiannon Ys-Caer** | `npc:rhiannon-ys-caer` | Thornwise leader; remembers Ys Aerwen sinking |
| **High Thane Brannoch Deepforge** | `npc:brannoch-deepforge` | Orrun high thane; keeps the Nine Nails secret |
| **Jarl Sigrun Ice-Eye** | `npc:sigrun-ice-eye` | Hrothi war-leader |
| **Admiral Marisol Kestrel** | `npc:marisol-kestrel` | Salt League admiral; auctioning an Ember |
| **The Cindermother, Ruqaya al-Nar** | `npc:ruqaya-al-nar` | Qasiri oracle; knows the way into the Heartforge |
| **Sister Ilse** | `npc:sister-ilse` | Choir infiltrator in the Lanternate; Act II betrayal |
| **The Reed-Mother** | `npc:reed-mother` | Choir high priestess of Greywater; Act I mini-boss |
| **Nan Briar** | `npc:nan-briar` | Gloamwood hedge-witch (Thornwise); prologue, recurs in Act I |
