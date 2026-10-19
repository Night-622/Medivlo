# Umbral: Nocturne (Duskweaver and Shade)

Realm: [02-realms.md § Nocturne](../02-realms.md). Gate boss: **the Eclipse Queen** at the Dusk Gate. Morvane Sentinel A: **the Spinner Below**.

---

# DUSKWEAVER: *Is forgetting a mercy?*
| | |
|---|---|
| Start | `area:umbral-capital`, Duskmere |
| Mentor | **Loremistress Nyx Aubade** (`npc:nyx-aubade`, trust starts at 2: she likes everyone, she just can't remember them). She calls the hero by a different wrong name in every scene until Trusted. |
| Nemesis | **Oriel Vane, the Mnemosarch** (`npc:oriel-vane`), Act III Herald |
| Half-stone | the Obelisk half, in the shadow of the Moon Obelisk (lair 3) |
| Sentinels | A the Spinner Below, B the Lantern Queen |

## Act I: Duskmere (22 quests)
### Main
| # | Quest (`quest:duskweaver-…`) | Where | Beat | Flags |
|---|---|---|---|---|
| I-1 | `the-bell-at-dusk`, **The Bell at Dusk** | zone 1 | The Drowned Bell rings and the moon over Duskmere ripples like a pond someone has dropped a stone in. Every bottled shadow in the city turns to face the Obelisk. The hero wakes with the Obelisk half's song in their chest and finds Nyx in the street in her nightgown, calling them "Marguerite, no, Tobias, no, oh, forgive me, dear". Tutorial: move, weave and talk. | `duskweaver.bell_heard` |
| I-2 | `chalk-the-doors`, **Chalk the Doors** | zone 1 | The Lanternless Streets have forgotten which door is whose. Nyx sends the hero to chalk five households' used names back on their doors. Each doorstep has a moon-puddle of black tears, and the doors' own shadows have wandered off as Shade Wisps. | |
| I-3 | `the-flower-thieves`, **The Flower Thieves** | zone 2 to lair 1 | Someone is cutting memory-flowers in the Gardens at night, and the people they grew from wake not knowing their children. The Duskblade Cult is selling the cut pasts under a forgotten temple. **Boss 1: the Duskblade Cult Leader.** | `duskweaver.cult_down` |
| I-4 | `the-mnemosarchs-queue`, **The Mnemosarch's Queue** | zone 3 | Oriel Vane, the Obelisk's Mnemosarch, runs the queue of people waiting to remember. He pours them tea, hands back their memories in little glass phials, and is the only person in Duskmere who gets the hero's name right first time. He asks the hero to help him "keep everything". | `duskweaver.vane_met` |
| I-5 | `the-mourners-petition`, **The Mourners' Petition** | zone 3 | A crowd of the bereaved petitions the Obelisk to let them forget the night of the Hollowing. The Keepers' oldest law is that nothing kept may be unkept. **Faction choice** (see below). | `duskweaver.mourners` |
| I-6 | `the-hall-of-lost-names`, **The Hall of Lost Names** | zone 3 to lair 2 | Whatever was chosen, the forgotten come to collect: the overflow from a kept Obelisk, the drowned griefs washing back, or the Unremembered asking to be let into the Rest. **Boss 2: the Unremembered.** In its last name-paper is a catalogue mark in Vane's hand. | `duskweaver.catalogue_mark` |
| I-7 | `what-the-mnemosarch-kept`, **What the Mnemosarch Kept** | zone 4 | Behind the Archive's spilling shelves, Vane has built a perfect Duskmere in shadow, street by street, out of every memory he has taken from the queue. The phials he hands back are copies; the originals are his. He wants the Obelisk half set in his own head, so that nothing anyone has ever known will be lost again. INSIGHT options let the hero work it out early: the returned memories have no smell. | `insight.duskweaver_copies` |
| I-8 | `the-obelisks-shadow`, **The Obelisk's Shadow** | lair 3 | Round to the side of the Moon Obelisk the moon never sees. **Boss 3: Vane (nemesis I).** He fights with the hero's own remembered battles. The hero takes the Obelisk half; Vane tucks his model city under his arm like a dolls' house and walks into the dark towards the Dusk Gate. | `duskweaver.halfstone` |
| I-9 | `the-long-dusk-road`, **The Long Dusk Road** | gate road | Nyx walks the hero to the edge of the city. Trust check: at Friendly she gets their name right, once, and gives them her moon-spectacles; at Trusted she tells them her own kept name to carry, which in Nocturne is the greatest trust there is. | `duskweaver.nyx_farewell` |
| I-10 | `the-dusk-gate`, **The Dusk Gate** | `area:umbral-gate` | **Boss 4: the Eclipse Queen**, who means to swallow the moon so nothing more can be forgotten. She is Vane's argument the size of a sky. The hero opens the gate with the Obelisk half and steps through. | `story.gate_open`, `story.act = 2` |

### Side quests (8)
| Zone | Quest | Beat |
|---|---|---|
| 1 Lanternless Streets | **The Sweeper's Detours** | Old Ambrose Hewlett sweeps the streets in long detours round things that aren't there, and everyone humours him. Prove him right: the shadows of Duskmere's lamp-posts still stand in the streets, thirty years after the posts were melted down. Codex. |
| 1 Lanternless Streets | **Courtesy Calls** | Ottoline Fairweather reintroduces herself to her husband Horace every morning, and he pretends to be charmed. They are both forgetting. Help them write a card about how they met, to read each night. Epilogue slide. |
| 2 Memory Gardens | **His Radiance** | A Cult-planted weed has made the cobbler Bartholomew Cobble remember being a prince. He is much happier. Pull it, or let him keep his crown of paper. |
| 2 Memory Gardens | **The Bed of Small Things** | Eight-year-old Posy plants a flower of her grandmother every day, and every day it wilts. Gardener Marigold Thrupp shows the hero how to plant it in moonshade so it keeps. |
| 3 Obelisk Plaza | **What Jasper Queued For** | Jasper Grubb has been in the queue so long he's forgotten what he came to remember. He has made eleven friends in the queue and doesn't want to reach the front. |
| 3 Obelisk Plaza | **Two Names** | Linnet Dray and Edmund Fosse can't marry: a Nocturne wedding is the swapping of kept names, and Linnet's has leaked from the register. It turns up filed in Vane's handwriting. A clue for I-7. |
| 4 Archive of Shadows | **Bottled Shadows** | Recapture the shelves' runaway shadows. One bottle holds the shadows of the twelve champions at the Concord's signing, and one of them is holding the others' hands. Codex. |
| 4 Archive of Shadows | **The Shadow of a Cat** | A cat-shaped shadow with no cat. The cat died years ago and the shadow won't leave. Let it go, or let it follow you. It follows you to Concordia either way. |

### Mentor thread (2) and bounties (2)
- **The Hero's Name** (needs Friendly): Nyx asks the hero to find their kept name in the Obelisk's lower register so she can pin it to her sleeve. Beside it, the register's first page is blank on purpose: the first Keepers left a rest in the record, for what should be let go. Sets `insight.duskweaver_rest_page` (opens the I-5 INSIGHT option if it's done first).
- **What Nyx Gave Away** (needs Trusted): Nyx confesses she gave one memory to the Gardens forty years ago: a quarrel with her younger sister, who ran off to the warrens. Find the flower. Nyx chooses not to take it back, and writes her sister a letter instead. Sets `duskweaver.nyx_devotable`.
- **Bounty: the Belfry Bats** (a Void Bat swarm in the old bell tower). **Bounty: Old Ninefingers** (a Night Spider with one leg too many, in the Gardens).

### Bosses
| Boss | Fight | Black tears |
|---|---|---|
| **The Duskblade Cult Leader** (lair 1) | A smiling florist with a sickle who "sells you back your last ten seconds": she rewinds the arena to where the hero stood, so standing still is death | stolen memories fall from her as black petals; each one the hero touches locks a skill for a few seconds (forgetting) |
| **The Unremembered** (lair 2) | A shape made of everyone Nocturne forgot, with a thousand faces. Phase 2 it forgets the hero and turns invisible, until the hero reads names off the walls aloud to make it turn and look | it weeps black through every mouth, and wherever the tears land the name-paper goes blank and the arena shrinks |
| **Oriel Vane** (lair 3) | He remembers everything, including how the hero fights: he raises echoes of the Cult Leader and the Unremembered, and dodges whatever attack the hero has used most. Vary or lose | his ink-stained fingers drip black, and the phials in his coat crack one by one; first sign of the Herald |
| **The Eclipse Queen** (the gate) | She sits half eclipsed on the gate. The arena wheels through the moon's phases, and at new moon only woven memory-light lets the hero see her. For the Duskweaver it's an "un-swallowing" fight: weave Nocturne's memories of the moon at her until she opens her mouth | her eclipse is a disc of black tears. When she falls it drains, the moon slides back up into the sky, and she remembers her own name and sleeps |

### I-5: The Mourners' Petition
| Choice | Immediate | Later |
|---|---|---|
| **Keep them** (with the Obelisk Keepers) | the griefs go back under lock; the Obelisk brightens; the mourners weep in the Plaza; Vane is delighted | Act II: Old Hobb's register gains the Keepers' seal, which makes C-1 skip a step; Act III: the Herald wears the mourners' griefs as armour (one extra phase) |
| **Let them go** (with the Veil) | Veil smugglers carry the griefs down to drown in the Moonwell; the mourners walk home lighter; three streets forget the hero's name; Nyx trust −1 | Act II: the Veil's cousins at the Drowned Rat owe you, and open a shortcut under the Gloamwood; Act III: the drowned griefs have drifted into the Legion camp, and one mourner finds hers there |
| **[INSIGHT] Give them a rest** (needs `insight.duskweaver_rest_page`) | plant the griefs in a new bed in the Gardens, the Rest, where they can be visited but not carried; Vane watches and goes very still | Act III: the Herald can be spared by offering him the Rest (no Nyx trust needed); `insight.tears_older` is one clue easier |

## Act II: the class thread (Concordia)
| # | Quest | Beat |
|---|---|---|
| C-1 | `the-sextons-register`, **The Sexton's Register** | Concordia's Umbral folk are few, and Old Hobb keeps their names in a sexton's register in Brindlecross churchyard. He says Brindlecross is forgetting the Concord itself, and that the records were woven into the dark under the Gloamwood. |
| C-2 | `under-the-roots`, **Under the Roots** | Down into the Gloamwood's root-caves, where the Concord's records hang in loose threads. Each one the hero touches plays a memory of a Turning, and they're coming unwoven. |
| C-3 | `the-spinner-below`, **The Spinner Below** | **Boss 5: Sentinel A.** Release: the Spinner wove every Turning into its web. It asks the hero to remember one for it, because it can't hold them any more. Sets `story.sentinel.umbral`. |
| C-4 | `the-mnemosarchs-lights`, **The Mnemosarch's Lights** | Vane is in Lanternford, buying the Lantern Queen's drowned lights. Each one holds a traveller's last memory, and he is filling Concordia's streets in his model city. |
| C-5 | `the-lantern-queen`, **The Lantern Queen** | **Boss 6: Sentinel B**, over Morvane Marsh. Freeing her lets the Guile bearer claim their mark (+1 bearers). |
| C-6 | `a-letter-from-nyx`, **A Letter from Nyx** | Nyx's letter comes through the Gate Circle addressed to the wrong name, with the right one written over it in a shakier hand. At Trusted she has signed it with her kept name. Then the Stone Court: the Duskweaver meets the Shade bearer, who casts no shadow, and the Duskweaver's own shadow leans towards them like a cat. |

**Featured bearers:** **The Frozen Hour**, with the Rimecaller bearer at Lanternford, who wants to freeze one of the Queen's lights so its memory is kept forever (both of you have the Lantern Queen as Sentinel B, and you're asking the same question from opposite ends), and **Threads Under the Wood**, with the Huntsman bearer in the Gloamwood root-caves, who is tracking the Spinner Below and needs a Duskweaver to read the web. Each gives +1 `story.bearers_gathered`.

## Act III: class quests
- **III-4 The Herald of Memory** (boss 7): Vane remade as the Herald, his robe embroidered with every memory he took, ringing a bell that replays the hero's Act I fights around them. **Spare** him by offering him the Rest (the I-5 INSIGHT, or Nyx Trusted, whose kept name teaches him what letting go sounds like), or **destroy** him. Sets `duskweaver.nemesis_fate`.
- **Nyx's Kept Name** (mentor's last request): carry Nyx's kept name to the Citadel and speak it to the crown, so it's kept somewhere even if she forgets it. If `duskweaver.nyx_devotable` is set, Nyx goes to Devoted (5).
- **The Stolen Hours**: Vane's phials are scattered through the Legion camp. The hollowed there have no memories left, so give each one back.
- **The Cat Comes Too**: an Act I loose end. The cat's shadow from the Archive has adopted Nan Briar's cat Parson, who has opinions about it (comic relief before the end).

## Class beats in shared quests
- **II-1:** the Umbral arch's shadow points the wrong way: towards the Heart.
- **II-2:** [Umbral] "Look at their shadows: these wolves remember being dogs." Maren trust +1.
- **II-4:** [Umbral] "Read a tear's memory." It remembers a Turning from three hundred years ago. Sets `insight.tears_remember`, which supports `insight.tears_older`.
- **II-6:** Vane is the nemesis who strikes at the Eve, stealing the **Shade bearer's** Veil half.
- **III-6:** Duskweaver line to the King: "You can't remember a song you never heard. That isn't memory. It's longing."

## Endings
| Ending | Realm | Mentor | Nemesis spared / destroyed |
|---|---|---|---|
| Turning | The Obelisk stops leaking. Nocturne remembers, and every garden keeps a bed for what's let go | Nyx gets the hero's name right in public, every time, and is insufferable about it | Vane runs the queue again, handing back the originals one by one / his name is kept in the Obelisk with a note: "remembered, not forgiven" |
| Unmaking | The Umbral Stone holds the Obelisk alone. Nocturne forgets a little every year and learns to write things down | Nyx writes the hero's name on her hand every morning | Vane weeds the Memory Gardens / forgotten, as he feared |
| Hollow Crown | Under the hero's crown Nocturne remembers everything forever, and nobody in Duskmere sleeps well again | Nyx forgets the hero on purpose | the crown's archivist / a blank page in the Obelisk |
| First Chord | Duskmere keeps the first Rest of the new Turning: a silence in the Obelisk where the forgotten are sung | Nyx (Devoted) speaks her kept name aloud for the first time | Vane keeps the Rest / his phials are opened, one at every Turning |

## Landmarks and set pieces (for Claude 2)
- `landmark:keepers-lodge` (zone 1, mentor house)
- `obj:umbral-door-1..5` (zone 1, I-2 chalk marks)
- `landmark:lamp-shadows` (zone 1)
- `landmark:memory-gardens-rest` (zone 2; the Rest bed, I-5 INSIGHT)
- `landmark:obelisk-register` and `landmark:mnemosarch-desk` (zone 3)
- `landmark:mnemosarch-model` (zone 4, Vane's shadow city)
- `obj:umbral-capital-halfstone` (lair 3)
- `obj:umbral-gate-seal` (gate)

---

# SHADE: *Who are you without your shadow?*
| | |
|---|---|
| Start | `area:umbral-frontier`, the Veilwarrens |
| Mentor | **Grey Mab** (`npc:grey-mab`, trust starts at 1: she trusts nobody above Wary on principle, and the hero is her favourite Wary) |
| Nemesis | **The Shadow That Left** (`npc:shadow-that-left`), the hero's own shadow. Act III Herald |
| Half-stone | the Veil half, at the heart of the Veilwarrens (lair 3) |
| Sentinels | A the Spinner Below, B the Weeping Willow |

**The missing shadow (Act I and Act II):** from I-1 the hero casts no shadow. Their sprite has no ground shadow, lanterns throw nothing on the wall behind them, and Shadowstep has nothing to step out of, so it works only by borrowing: the shadow of a post, a crate, a friendly NPC. Warren folk make the bad-luck sign and children follow the hero round to check. Creatures that hunt by shadow can't see the hero at all. And sometimes, when a lantern is lit, a hero-shaped shadow appears on a wall across the room, listening. The shadow comes back only if it's spared at III-4.

## Act I: the Veilwarrens (22 quests)
### Main
| # | Quest (`quest:shade-…`) | Where | Beat | Flags |
|---|---|---|---|---|
| I-1 | `the-bell-on-the-bridges`, **The Bell on the Bridges** | zone 1 | A night lift on the rope bridges. The Drowned Bell rings, every lantern in the warrens gutters, and the hero's shadow stands up off the planks, bows, and walks away across the bridge without them. The Veil half's song wakes in the space it left. Tutorial: move, lift and borrow a shadow. | `shade.bell_heard`, `shade.shadowless` |
| I-2 | `mabs-toll`, **Mab's Toll** | zone 2 | Grey Mab sends the hero down to collect the Veil's toll from the silk-cutters of the Webbed Deeps. Half the cutters have lost their shadows too, and the Night Spiders in the silk have gone hollow. Black tears pool wherever a shadow used to stand. | |
| I-3 | `nothing-to-hunt`, **Nothing to Hunt** | zone 4 to lair 1 | The moor shepherds' flocks are vanishing. The Moon Stalker hunts by shadow, so it can't see the hero, but it can smell them. **Boss 1: the Moon Stalker.** | `shade.stalker_down` |
| I-4 | `a-stranger-at-the-moonwell`, **A Stranger at the Moonwell** | zone 3 | The Shadow is at the Moonwell market, wearing the hero's hood and telling the crowd the hero's most embarrassing childhood stories, and everyone loves it. It's charming, sorry and glad to see you. "We were always better together. Let me help you find our half." | `shade.shadow_met` |
| I-5 | `pasts-for-sale`, **Pasts for Sale** | zone 3 | The Duskblade Cult has opened a Moonwell stall selling stolen pasts, and the warrens folk, who forget fastest and own least, are queueing to buy them. Whatever the hero chooses, the Shadow takes the other side, loudly. **Faction choice** (see below). | `shade.moonwell` |
| I-6 | `the-quiet-deeps`, **The Quiet Deeps** | zone 2 to lair 2 | The warrens go silent. Mother Hushweb has eaten every whistle-signal in the Deeps, and the Shadow has gone in ahead of you. **Boss 2: Mother Hushweb.** | |
| I-7 | `two-of-you`, **Two of You** | zone 1 | The Shadow walks into the Veil's hall and signs the hero's name in Mab's ledger. It has been doing the jobs the hero wouldn't, and telling Mab it loves her, which the hero has never said. It has joined the Hollow: the tears have filled it in and given it weight. It wants the Veil half because a half-stone sings for its bearer, and if it sings for the Shadow, the Shadow is the real one. "You spent your whole life hiding in me. My turn in the light." INSIGHT: it casts a shadow of its own, and that one is made of tears. | `shade.shadow_turned`, `insight.shade_second_shadow` |
| I-8 | `the-veil-heart`, **The Veil Heart** | lair 3 | The deepest chamber of the warrens, black as the inside of a pocket. **Boss 3: the Shadow (nemesis I).** The hero takes the Veil half. The Shadow goes the way shadows go when the lantern falls, and is gone towards the Dusk Gate. | `shade.halfstone` |
| I-9 | `mabs-last-lesson`, **Mab's Last Lesson** | gate road | Across the Stalker Moors to the gate. Mab's farewell, with a trust check: at Friendly she gives the hero her own lock-picks, the Mab set; at Trusted she lends them her own shadow, a tiny, cross old woman's silhouette that follows at the hero's heels and makes Shadowstep work again until III-4. | `shade.mab_farewell`, `shade.mab_shadow` |
| I-10 | `the-dusk-gate`, **The Dusk Gate (warrens side)** | `area:umbral-gate` | **Boss 4: the Eclipse Queen.** Her eclipse swallows every shadow in the arena, but a hero without one is the only thing she can't eat. When she falls, the moon slides out of her and there's light enough in Nocturne to cast a shadow, for everyone but you. Open the gate. | `story.gate_open`, `story.act = 2` |

### Side quests (8)
| Zone | Quest | Beat |
|---|---|---|
| 1 Veilwarrens | **Rope Toll** | Nettle Crook, aged twelve, runs the warrens' busiest bridge and charges a toll she writes in a ledger she can't read. Settle her toll war with the next bridge, or teach her her letters. |
| 1 Veilwarrens | **The Puppet Show** | Ludo Fingle's shadow-puppet show of the Concord needs a hero puppet, and his has walked off. Use the shadowless hero as the puppet, very badly. Ludo turns up at the Gilded Goose in Act II. |
| 2 Webbed Deeps | **Agnes in the Silk** | Silk-cutter Agnes Threadneedle is missing. Find her cocooned, alive and sulking because nobody came sooner. |
| 2 Webbed Deeps | **Echoes for Sale** | The Deeps' echo-traders bottle echoes, and something has been eating their stock. Codex: the Veil's whistle-language. Sets up I-6. |
| 3 Moonwell | **A Fair Price** | Madam Quince, the warrens' oldest fence, offers to buy the hero's "spare name", since someone without a shadow obviously doesn't need two. Haggle, sell, or rob her blind. |
| 3 Moonwell | **Seen from Below** | The twins Twig and Moss have only ever seen the moon from the bottom of the well. Take them up onto the Stalker Moors at night to see it properly. Epilogue slide. |
| 4 Stalker Moors | **The Shepherd's Shadow** | Shepherd Bryn Tallow lost his shadow last spring and is cheerful about it: "Never liked him." The first other shadowless person the hero meets, and a different answer to the question. |
| 4 Stalker Moors | **Cairn of the Unshadowed** | An old cairn where the Veil buried Shades who lost their shadows. One stone records the Veil's founder, who lost hers and went on anyway. Codex. |

### Mentor thread (2) and bounties (2)
- **Mab's Ledger** (needs Friendly): Mab's black book of every shadow the Veil ever lifted, back when the Veil's trade was hiding people from the Concord's tax-men. The margins say shadows keep memories for their people. Sets `insight.shade_shadow_ledger` (opens the I-5 INSIGHT option if it's done first).
- **The Letter Mab Never Opened** (needs Trusted): Mab hid a letter from Duskmere forty years ago so well she can't find it, and asks the hero to steal it from her. It's from her sister, Nyx Aubade. She reads it alone. Sets `shade.mab_devotable`.
- **Bounty: the Bridge Bats** (a Void Bat swarm on the rope bridges). **Bounty: Grandmother Longlegs** (a giant Night Spider in the Deeps).

### Bosses
| Boss | Fight | Black tears |
|---|---|---|
| **The Moon Stalker** (lair 1) | A long, pale moor-cat that hunts by shadow. It can't see the hero, so it follows their footprints in the heather; light lanterns to throw decoy shadows and strike while it pounces on them | its own shadow has gone liquid and black, and where it leaps, puddles of it slow the hero |
| **Mother Hushweb** (lair 2) | A vast Night Spider who eats sound. The hero's footsteps give them away; throw stones at the hanging bells and strike while she lunges to eat the ringing | her silk drips black, and in phase 2 the music drops out of the fight entirely. The only sound left is the half-stone's song: follow it |
| **The Shadow That Left** (lair 3) | It mirrors every move the hero makes, a beat early. In darkness it can't be hurt, so the hero must drag lanterns into the chamber; light makes it solid, the reverse of every other Shade fight | the tears are what fill it in. It weeps where the hero's eyes would be, and splashes black when struck |
| **The Eclipse Queen** (the gate) | From the warrens side: her eclipse drowns the arena in shadow, and every borrowed shadow is eaten. The shadowless hero climbs the rim of her eclipse unseen to strike the moon loose | the eclipse is black tears. When she falls it drains, and she sleeps with the moon back in the sky |

### I-5: Pasts for Sale
| Choice | Immediate | Later |
|---|---|---|
| **Rob the stall for the Veil** (with Mab) | the Veil hands the pasts out free; half the warrens remember happy childhoods that belonged to someone in Duskmere; Mab trust +1 | Act II: the Drowned Rat's Veil cousins hide the hero on the Morvane Road; Act III: hollowed Veil folk in the Legion camp wake for a borrowed memory and fight beside you in III-2 |
| **Hand them to the Keepers** (with the Obelisk's collector, Isidore Pale) | the pasts go home to their owners; the warrens are quieter, poorer and honest; the Keepers pardon the Veil for a year | Act II: the Keepers' writ opens Old Hobb's register (C-1 skips a step), and an Umbral record reaches Ysolde, making `insight.tears_older` one clue easier |
| **[INSIGHT] Call the shadows home** (needs `insight.shade_shadow_ledger`) | the warrens folk's own wandered shadows come back to them, carrying their own memories; nobody needs to buy a past. The Shadow watches from a bridge and very nearly comes home too | Act III: sparing the Shadow is possible without Mab Trusted |

## Act II: the class thread
| # | Quest | Beat |
|---|---|---|
| C-1 | `the-drowned-rat`, **The Drowned Rat** | The Veil's Concordia cousins drink in the back room of the Drowned Rat at the Old Coach Inn, run by a fence called Constance Gentle. They say shadows go missing near the Gloamwood, and something under its roots is spinning them in. |
| C-2 | `the-spinners-silk`, **The Spinner's Silk** | Brindlecross folk's missing shadows are caught in the Spinner's web among the Concord's records. The Shade climbs it looking for one particular thread. |
| C-3 | `the-spinner-below`, **The Spinner Below** | **Boss 5.** Release: the Spinner wove every shadow in the Concord's records. It gives the hero the thread of their own shadow, and the thread runs into the Heart. Sets `story.sentinel.umbral`. |
| C-4 | `the-shadow-at-stags-rest`, **The Shadow at Stag's Rest** | The Shadow is sheltering under the Weeping Willow, whose branches throw the deepest shade in Morvane, while the Hollow King's Heralds fit it for a robe. |
| C-5 | `the-weeping-willow`, **The Weeping Willow** | **Boss 6: Sentinel B** at Stag's Rest. Freeing the Willow lets the Verdant bearer claim their mark (+1 bearers). |
| C-6 | `a-parcel-from-mab`, **A Parcel from Mab** | Mab doesn't write letters. A parcel comes through the Gate Circle holding the hero's childhood hood, and in the hood a lock-pick and three words: "Come home, petal." If Mab's shadow came along, it's started to fade, homesick. At the Stone Court, the Duskweaver bearer, whose shadow keeps leaning towards you. |

**Featured bearers:** **The Dark Is Kind**, with the Cantor bearer at Stag's Rest, who has never let the dark in and has to stand in the Willow's shade beside someone who can't cast any (the Willow is the Cantor's Sentinel B too), and **The Silent Thread**, with the Samurai bearer in the Spinner's web, who won't speak while you can't hide: you cross the web together (the Spinner is the Samurai's Sentinel B). +1 each.

## Act III: class quests
- **III-4 The Herald of Shadows** (boss 7): the Shadow remade as the Herald, a solid person in the Herald's robe who now casts *the hero's* shadow, and rings a bell in the hero's own voice. **Spare** it by opening your arms and letting it back to its place at your heels (needs the I-5 INSIGHT or Mab Trusted): the hero casts a shadow again, and it's a little braver than before. Or **destroy** it, and the hero never casts a shadow again. Sets `shade.nemesis_fate`.
- **Send Mab's Shadow Home** (mentor's last request): Mab's borrowed shadow is fading. Carry it to the Umbral stair, where the Veil's old banner hangs, and send it home along the Spinner's thread. If Mab never lent it, her lock-pick opens the banner box instead, and inside is the Veil founder's last note. If `shade.mab_devotable` is set, Mab goes to Devoted (5).
- **The Weeping Shades**: the Weeping Shades in the Legion camp are shadows that left their people, as yours did. Lead them home.
- **Bryn's Flock**: an Act I loose end. The shepherd's shadowless sheep have wandered all the way to the Heart's edge, and the Shade has to round them up in the dark (comic relief before the end).

## Class beats in shared quests
- **II-1:** at the Gate Circle, Maren's first line is "You've no shadow." She keeps her knife out for the whole scene.
- **II-2:** [Umbral] "They hunt by shadow, and I haven't got one. Let me walk in first." Maren trust +1.
- **II-4:** [Umbral] "Stand in the Stag's tears and look down." The tears cast a shadow of their own, older than the Stag. Sets `insight.tears_shadow`, which supports `insight.tears_older`.
- **II-6:** the Shadow strikes at the Eve, stealing the **Duskweaver bearer's** Obelisk half. It walks into the Duskweaver's shadow and out again with the stone.
- **III-6:** Shade line to the King: "You've no shadow either. You stood in the light so long you thought it was the same as being seen."

## Endings
| Ending | Realm | Mentor | Nemesis spared / destroyed |
|---|---|---|---|
| Turning | The warrens' shadows come home, and the Moonwell's children see the moon from above | Mab retires, and the Veil elects Nettle Crook, who charges a toll for it | the Shadow walks at the hero's heels, a little taller than them / the hero is the only person in Nocturne with no shadow, and the warrens' children think it's the best trick in the world |
| Unmaking | The Veil goes on picking the pockets of a free, uneasy realm | Mab opens a shop for second-hand shadows | the Shadow stays, and sulks / nothing follows the hero home |
| Hollow Crown | Under the hero's crown every shadow in Nocturne is registered, and none may ever leave its person again | Mab is gone from the warrens the night of the coronation | the Shadow is the crown's spymaster / a shadow-shaped gap in the throne room where no light falls |
| First Chord | The Veil teaches the first lesson of the new Turning: how to stand in the light and still be yourself | Mab (Devoted) and Nyx meet at the Moonwell and argue for a whole night | the Shadow sings the low part / the gap where it stood hums the low part instead |

## Landmarks and set pieces (for Claude 2)
- `landmark:mab-nest` and `landmark:veil-ledger-hall` (zone 1, mentor)
- `landmark:ludo-puppet-booth` (zone 1)
- `landmark:silk-cutters-camp` (zone 2)
- `landmark:moonwell-market` (zone 3)
- `obj:shade-decoy-lantern-1..4` (lair 1, Moon Stalker fight)
- `landmark:cairn-of-the-unshadowed` (zone 4)
- `obj:umbral-frontier-halfstone` (lair 3)
- the shared `obj:umbral-gate-seal`, warrens-side approach
- not a world object but a need for Claude 2 and 3: a hero ground-shadow toggle, off while `shade.shadowless` is set, back on if `shade.nemesis_fate = spared`, plus the "listening shadow" wall decal for lit-lantern scenes
