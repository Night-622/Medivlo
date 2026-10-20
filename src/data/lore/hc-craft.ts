/**
 * Codex: the deeper-builds systems, taught in-world (Claude 4; BUILDS.md). Each entry is a short in-world piece and ends
 * with one plain "How it works" paragraph. They open the first time the player meets the system, alongside the one-time
 * hint (src/data/tips/hc-build-hints.ts, wired in narrative/client/tutorial.ts). No tuned numbers in the text.
 */
import type { LoreEntry } from '@/core';

const how = (s: string) => `How it works: ${s}`;

const entries: LoreEntry[] = [
  {
    id: 'lore:hc-craft-runes', name: 'Runes', category: 'magic', source: 'a note pinned inside a Kilnhold runecarver’s apron',
    body: 'A spell is a habit the world has agreed to. A rune is a small, firm word in its ear: louder, longer, twice, the other way. Carve it badly and the spell sulks. Carve it well and the spell forgets it was ever any different.\n\nApprentices are told to carve their first rune on a spell they do not love. Nobody listens.\n\n' +
      how('runes sit in a spell’s rune slots, and each changes how that spell behaves. Slots open as you learn more of that spell’s path in Skills. Craft runes from Rune Dust at a Runeforge, and take them out again whenever you like.'),
  },
  {
    id: 'lore:hc-craft-tomes', name: 'Tomes', category: 'magic', source: 'Archivist-Superior Halla Vint, a lecture to first-years',
    body: 'Every school keeps its spells in its own throat. A tome is a school clearing its throat in writing, slowly, for a stranger. It never quite sounds the same in a foreign mouth, but it carries.\n\nThe Archive lends tomes to anyone who brings one back. Very few are brought back.\n\n' +
      how('reading a tome teaches you one spell from another school. You can keep one such spell at a time; reading a new tome replaces it.'),
  },
  {
    id: 'lore:hc-craft-enchantments', name: 'Enchantments and Rarity', category: 'magic', source: 'the Guild of Smiths’ grading card, as nailed to every forge door',
    body: 'Common goods are honest. Fine goods have an opinion. Ember-touched goods have been near a kiln and never got over it. Runed, Wrought and Sparkforged goods are what smiths make on the one good day of their year, and they price them accordingly.\n\nThe words around an item’s name are its enchantments. A Lamp-lit sword is not polite about it.\n\n' +
      how('the colour of an item’s name shows its rarity. Fine and finer gear rolls bonus lines, more of them the rarer it is, and each line adds a word to the item’s name. A Runeforge can reroll a line you don’t want.'),
  },
  {
    id: 'lore:hc-craft-sockets', name: 'Sockets and Gems', category: 'culture', source: 'Pell Odd, peddler of the Morvane Road, between sales',
    body: 'A gem is a feeling the ground had a very long time ago. Set one in good steel and the steel starts having it too. Prise it out roughly and it stops having anything at all.\n\nPell sells gems. Pell will tell you every one of them is lucky. Pell is not lucky.\n\n' +
      how('Ember-touched and finer gear has empty sockets. A smith at a Runeforge sets a gem in one for a fee; setting a gem over another destroys the old one. Salvaging the item gives its gems back.'),
  },
  {
    id: 'lore:hc-craft-runeforge', name: 'The Runeforge', category: 'culture', source: 'the rules of the Kilnhold Runeforge, chalked by the door',
    body: 'One: the forge is hot. Two: the smith is hotter. Three: whatever you bring, the forge can make it better, make it yours, or make it into something else. It cannot make it what it was.\n\nEvery capital keeps a Runeforge, and every smith who works one swears theirs is the original.\n\n' +
      how('at a capital’s smith you can upgrade a piece, reforge it to your level, reroll one bonus line, imbue a weapon with an Essence so that half its damage becomes that school’s, move a unique effect onto another piece, set gems, craft runes, and salvage gear for Iron Ingots and Rune Dust.'),
  },
  {
    id: 'lore:hc-craft-uniques', name: 'Uniques and Legendaries', category: 'magic', source: 'Ysolde Fenn, marginal note in a ledger of lost property',
    body: 'Some things are made. Some things happen to be made, by a beast or a battle or a very bad week, and come out of it with a trick no smith can teach. The Sentinels and the realm bosses carry these. So do a few caves that were never supposed to be found.\n\nThey are not for sale, which has never stopped anyone asking.\n\n' +
      how('a unique has an effect no other item has, written in gold on its card. At a Runeforge that effect can be moved onto a plain piece for the same slot; the unique it came from is destroyed.'),
  },
  {
    id: 'lore:hc-craft-sets', name: 'Armour Sets and Hybrids', category: 'culture', source: 'a Brindlecross tailor, to a customer who wanted everything',
    body: 'A school’s armour is cut to move the way the school moves. Wear the whole of it and you move that way too. Wear half of one and half of another and you move like somebody with two teachers who disagree, which, on a good day, is how new styles are born.\n\nTwelve of those pairings are old enough to have names. The rest are still arguing.\n\n' +
      how('two pieces of one set give its two-piece bonus, and four give its ability. Two pieces each of two schools’ sets give a two-school bonus instead; twelve pairs have a bonus of their own, and the rest combine both sets’ abilities at half strength.'),
  },
  {
    id: 'lore:hc-craft-keystones', name: 'Keystones', category: 'culture', source: 'Old Tomoe, to a pupil who asked for a shortcut',
    body: 'There are lessons that add to what you are, and lessons that change it. The second kind always costs something, and the cost is usually the thing you were proudest of. That is how you know it was a keystone.\n\nEvery school teaches a few that belong to no school at all. Nobody admits to inventing them.\n\n' +
      how('keystones are shared points in your Skills tree that change the rules of how you fight, often at a price. Your class is offered three, and you can hold two at once.'),
  },
  {
    id: 'lore:hc-craft-mastery', name: 'Weapon Mastery', category: 'culture', source: 'Sergeant-at-Arms Roderick Mallard, drilling recruits',
    body: 'A sword in a Swordsman’s hand and a sword in a Knight’s hand are two different animals. One dances. One holds the door. Neither is wrong, and both will tell you the other is.\n\nPick up a weapon your school knows and your hands remember things your head never learned.\n\n' +
      how('each class fights a little differently with each weapon it can wield. The mastery bonus works while that weapon is in your main hand.'),
  },
  {
    id: 'lore:hc-craft-unlearning', name: 'Unlearning', category: 'culture', source: 'a Stonecloister saying, painted on the lowest step of the Stair',
    body: 'To climb again, come down first. The Stair does not mind. The Stair has seen everyone come down at least once, and most of them twice.\n\n' +
      how('any branch of your Skills tree can be reset for Embershards, and every point comes back to spend again. When the tree itself changes, you are given one free reset of everything.'),
  },
];

export default entries;
