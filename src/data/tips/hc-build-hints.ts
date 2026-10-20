/**
 * First-time hints for the deeper-builds systems (Claude 4). One sentence each, shown once per save as an info toast
 * when the player first meets the system; each also opens its Codex entry (src/data/lore/hc-craft.ts). Triggers live in
 * narrative/client/tutorial.ts. `{key:<action>}` tokens show the player's bindings. No tuned numbers.
 */
export type BuildHintId = 'rune' | 'tome' | 'enchanted' | 'socket' | 'unique' | 'runeforge' | 'hybrid' | 'keystone' | 'mastery' | 'respec' | 'upgrade';

export interface BuildHint { text: string; lore: `lore:${string}` }

export const BUILD_HINTS: Record<BuildHintId, BuildHint> = {
  rune: { lore: 'lore:hc-craft-runes',
    text: 'A rune. Set it in one of a spell’s rune slots in Spells ({key:spells}) to change how that spell behaves.' },
  tome: { lore: 'lore:hc-craft-tomes',
    text: 'A tome. Use it from your Pack ({key:inventory}) to learn one spell from another school; you can keep one at a time.' },
  enchanted: { lore: 'lore:hc-craft-enchantments',
    text: 'Enchanted gear. The colour of its name is its rarity, and each word around the name is a bonus line.' },
  socket: { lore: 'lore:hc-craft-sockets',
    text: 'This piece has a socket. A smith at any capital’s Runeforge can set a gem in it.' },
  unique: { lore: 'lore:hc-craft-uniques',
    text: 'A unique. Its gold line is an effect no other item has, and a Runeforge can move it onto another piece.' },
  runeforge: { lore: 'lore:hc-craft-runeforge',
    text: 'A Runeforge. Upgrade, reforge, reroll, imbue, socket and salvage your gear here: pick a piece to begin.' },
  hybrid: { lore: 'lore:hc-craft-sets',
    text: 'Two pieces each of two schools’ sets: a hybrid bonus. Read it at the foot of any of those pieces.' },
  keystone: { lore: 'lore:hc-craft-keystones',
    text: 'A keystone. It changes the rules of how you fight, often at a price, and you can hold only two.' },
  mastery: { lore: 'lore:hc-craft-mastery',
    text: 'Weapon mastery: your class fights a little differently with this weapon while it is in your main hand.' },
  // the Embershards nudge (Claude 3 / Claude 5's gear-curve audit): gold sits idle until a player finds the Runeforge
  upgrade: { lore: 'lore:hc-craft-runeforge',
    text: 'Embershards piling up? A smith at any capital’s Runeforge can make a piece you like stronger.' },
  respec: { lore: 'lore:hc-craft-unlearning',
    text: 'Your Skills tree has changed, so one reset of every branch is free. Find it in Skills ({key:skills}).' },
};
