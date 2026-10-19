# 13: Companion depth: data spec

Companions: Maren (`npc:maren-hollis`), Anselm (`npc:anselm-pryde`), Hesta (`npc:hesta-corrow`, a mentor; dies in Act I unless `act1.hesta_alive`), Cadoc (`npc:cadoc-ap-ynys`), Grimma (`npc:grimma-ironsong`), Sable (`npc:sable`), and in Act II Vesper (`npc:vesper-qadri`).
Engine facts:
- Following state is `companion.<slug>.following` (bool).
- Loyalty is `companion.<slug>.loyalty` (0–100; default 50 when first changed), changed with `{ loyalty: npcId, delta }`.
- Banter is any `dialogue:banter-*`. One unseen scene whose entry conditions pass plays when the player rests (`world:rest`), once each.
Same hard rule as the Act II spec: quest-critical flags are set at the moment of decision, and every quest-critical scene can be reopened from an NPC route or an `obj:`.

## 1. Personal quests (one per Act I companion; `type: 'companion'`, xpTier 2)
All require `act1.complete` unless noted, plus `companion.<slug>.loyalty >= 40` (core op `>=`), and `autoStart: true`. Each ends with a meaningful choice that sets a flag Act III can read.

| Quest | Companion | Hook | Choice → flag |
|---|---|---|---|
| `quest:the-hunters-oath` | Maren | A Choir reed-priest, Brother Sallow, who lured Tobin, has been seen at `landmark:fenwick-stilts`. Maren wants him dead. | kill him / hand him to Agna Fenn's justice / let Maren decide → `companion.maren-hollis.oath` = `blood` / `justice` / `hers`. If Tobin was saved, Tobin's letter softens her. |
| `quest:a-lantern-for-the-road` | Anselm | Requires Anselm present and not betrayed (or `act2.anselm_freed`; this one may run in Act II). He wants to reconsecrate the drained Abbey of Saint Wenna (`landmark:abbey-nave`). Wenna's ghost asks what he believes now. | the Church can be mended / it must be remade / faith without a church → `companion.anselm-pryde.path` = `reform` / `inquisitor` / `heretic`. The inquisitor path means he joins the Wick in his heart. |
| `quest:the-snuffed-candles` | Hesta | Requires `act1.hesta_alive` and `content.act2`. The Emberwarden archive chests are under Solenne cathedral's undercroft (`landmark:cathedral-of-the-brand`). Hesta wants them, and so does Vellane. | take the chests to Cinderhold / give them to Aurelian to publish / burn them → `act2.warden_archive` = `cinderhold` / `published` / `burned`. Publishing splits the Church (Act III). |
| `quest:the-unsung-verse` | Cadoc | Requires `act1.ylwen_pact`. The last verse of the Lullaby was drowned with Ys Aerwen; Cadoc wants to dive the sunken court (`landmark:ys-aerwen-shore`, new). | learn the verse (`lore:the-lullaby` section `last-verse`) / leave it drowned → `companion.cadoc-ap-ynys.verse` = `sung` / `left`. `sung` is required for the Reforge ending. |
| `quest:iron-remembers` | Grimma | Requires `act1.nails_exposed`. Her clan's oath-ring was broken when she was exiled; reforging it needs true-iron and a hearing before her clan-mother at `landmark:grimmas-forge`. | reforge it as it was / forge it new with the Ashmark's fire / refuse the clan → `companion.grimma-ironsong.ring` = `old` / `new` / `none`. |
| `quest:the-quiet-hollowing` | Sable | Sable's Hollowing worsens: black tears, cold hands, she hears singing. Needs `ashmark.rank >= 3`. Track her to `landmark:tobins-reeds`, where she has gone to the water. | Purge her (painful; [Will 15], or `item:briar-salve`) / let her choose the water with dignity / bind her and seek the Thornwise → `companion.sable.fate` = `saved` / `gone` / `bound`. `saved` is the proof that Ysolde can be redeemed. |

## 2. Loyalty beats
For each Act I companion, write a `dialogue:loyalty-<slug>` reached from a NEW first route on that NPC: `{ when: { all: [following, loyalty >= 70, not seen-flag] } }`. It's a one-time heart-to-heart that sets `companion.<slug>.beat_70` and gives +5 loyalty. Also add a `dialogue:loyalty-<slug>-low` for loyalty <= 20 (they consider leaving; [Will 15] to keep them; failing sets `companion.<slug>.following = false` and `companion.<slug>.left = true`).

## 3. Banter (`src/data/dialogue/banter.ts`, 16 scenes)
Each is gated on two companions following plus a story flag, and runs 4–8 nodes with 0–2 choices (loyalty shifts). Pairs and topics:
1. Maren and Cadoc: hunting with a bow 300 years older than her.
2. Maren and Sable: Haldren thieves and village honesty.
3. Anselm and Vesper: two ex-clergy, one burned an abbey.
4. Anselm and Hesta: the Purge; the Church's guilt.
5. Grimma and Cadoc: Orrun and Aelthi grudges older than kingdoms.
6. Sable and Vesper: fire and black tears.
7. Hesta and Maren: teaching her to aim with a burned hand.
8. Cadoc and Hesta: the Lullaby versus the Brand.
9. Grimma and Anselm: oaths and vows.
10. Maren alone: Tobin (branches on his fate).
11. Sable and Grimma: locks.
12. Vesper and Hesta: free fire versus wardened fire.
13. After `act1.complete`: everyone at the Cinderhold hearth, Hesta's toast (or a memorial toast if she's dead).
14. After `act2.korrath_flooded` or `act2.new_nail`: Grimma.
15. After `act2.nhal_revealed`: whoever is following, on the keeper's price.
16. After `act2.complete`: the night before the Mirelands.
