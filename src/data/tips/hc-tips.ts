/**
 * Loading-screen tips (Claude 1 shows them during boot and space transitions). One line each, final copy.
 * `{key:<action>}` tokens are the player's own bindings: pass the text through formatKeys from
 * '@/narrative/client/keys' before showing it ({key:move} is the four movement keys).
 * Lore tips tease; they never spoil an ending or a twist. Owner: Claude 4.
 */
export type TipTag = 'controls' | 'combat' | 'story' | 'systems' | 'coop' | 'realm' | 'lore';
export interface Tip { text: string; tag?: TipTag }

export const TIPS: Tip[] = [
  // ---------- controls
  { tag: 'controls', text: 'Move with {key:move}. Dash with {key:dash}; it’s quicker than running and safer than standing still.' },
  { tag: 'controls', text: 'Talk, open, read and wake things with {key:interact}.' },
  { tag: 'controls', text: 'Your spells sit on {key:cast1} to {key:cast4}. A click casts the first.' },
  { tag: 'controls', text: 'Draughts are on {key:potionQ} and {key:potionE}. Drink before you need to, not after.' },
  { tag: 'controls', text: 'Your Pack is on {key:inventory}, Skills on {key:skills}, Spells on {key:spells}.' },
  { tag: 'controls', text: 'Open the Journal with {key:journal}, pick a quest, and press {key:track} to track it.' },
  { tag: 'controls', text: 'The Map is on {key:map}. The People of a village are on {key:people}.' },
  { tag: 'controls', text: 'Every key can be rebound in Settings.' },
  { tag: 'controls', text: 'Hints can be switched off in Settings if you’d rather find things out the hard way.' },

  // ---------- combat
  { tag: 'combat', text: 'Red on the ground means something is about to land there. Don’t be there.' },
  { tag: 'combat', text: 'A dash through a telegraphed attack is better than a draught after it.' },
  { tag: 'combat', text: 'Hollowed creatures weep black tears. They hit harder and remember less.' },
  { tag: 'combat', text: 'Some bosses yield instead of dying. What happens to them next is up to you.' },
  { tag: 'combat', text: 'Lairs get harder the deeper they go. The third lair of each realm keeps its worst for last.' },
  { tag: 'combat', text: 'A realm’s gate has a guardian. Beat it, and the way to Concordia opens.' },
  { tag: 'combat', text: 'You rise again at the last waystone you woke. Wake every one you pass.' },
  { tag: 'combat', text: 'Bounties pay for the same work as quests, with less conversation and more teeth.' },

  // ---------- story
  { tag: 'story', text: 'Your class has its own campaign: its own mentor, its own nemesis, its own half of a stone.' },
  { tag: 'story', text: 'Twenty-four classes, twenty-four roads. They all end at the same door.' },
  { tag: 'story', text: 'Choices marked QUEST start or move a quest. They’re worth reading twice.' },
  { tag: 'story', text: 'INSIGHT choices only appear once you’ve learned something. Some only appear once you’ve learned three things.' },
  { tag: 'story', text: 'Choices marked TRUST change how much someone trusts you. Trust is paid once, and remembered.' },
  { tag: 'story', text: 'The diamonds by a name are trust. Five is Devoted, and only one kind of moment earns it.' },
  { tag: 'story', text: 'A mentor who trusts you gives you something to remember them by. A mentor who doesn’t, says goodbye.' },
  { tag: 'story', text: 'Every critical scene can be found again. If you walked away mid-conversation, go back.' },
  { tag: 'story', text: 'Some side quests are the only way to learn what the main road won’t tell you.' },
  { tag: 'story', text: 'Your nemesis is not finished with you when you think they are.' },
  { tag: 'story', text: 'There are four ways for the story to end. One of them is hidden, and asks a great deal.' },
  { tag: 'story', text: 'Bearers gather in Concordia. The more you find, the more the ending allows.' },

  // ---------- systems
  { tag: 'systems', text: 'Level up and spend your points in Skills ({key:skills}). Nothing is spent for you.' },
  { tag: 'systems', text: 'A spell scroll casts once, for free. Save one for a bad day.' },
  { tag: 'systems', text: 'A mentor’s gift is worth wearing. Each one carries something of whoever gave it.' },
  { tag: 'systems', text: 'The People screen shows who has work for you, and who you’ve already met.' },
  { tag: 'systems', text: 'The quest tracker can be clicked. It opens the Journal at the quest.' },
  { tag: 'systems', text: 'Codex entries unlock as you meet people and find places. Some come in parts.' },
  { tag: 'systems', text: 'Night changes things. Some scenes only happen after dark.' },
  { tag: 'systems', text: 'Merchants who like you charge less. Merchants who love you charge less and tell you things.' },

  // ---------- co-op
  { tag: 'coop', text: 'In co-op, guests play the host’s story. Your own codex and portable quests still come home with you.' },
  { tag: 'coop', text: 'Story choices in a party are votes. The majority decides, and the host breaks a tie.' },
  { tag: 'coop', text: 'A party vote has a timer. Pick, or the party picks for you.' },
  { tag: 'coop', text: '[School] options only appear if someone in the party belongs to that school. Bring a mixed party.' },
  { tag: 'coop', text: 'When a party member plays a bearer’s class, they are that bearer. Nobody else stands in for them.' },
  { tag: 'coop', text: 'Small talk is personal. Only story scenes are shared with the whole party.' },
  { tag: 'coop', text: 'Up to four can share a story. The Hollow King has seen worse odds, but not many.' },

  // ---------- public realm etiquette
  { tag: 'realm', text: 'In a public realm, the person who woke the boss may not be the one who finishes it. Share.' },
  { tag: 'realm', text: 'Help a stranger up when they’re down. They might be the bearer you were looking for.' },
  { tag: 'realm', text: 'Chat is read by real people. Be the kind of traveller Brindlecross would let through the gate.' },
  { tag: 'realm', text: 'Standing on a quest-giver doesn’t make the quest yours. Let others talk too.' },
  { tag: 'realm', text: 'If someone’s fighting a thing, ask before you join in. Most will say yes.' },

  // ---------- lore
  { tag: 'lore', text: 'At every Turning the crown was passed on, and the stones of the twelve schools sang. The last Turning went wrong.' },
  { tag: 'lore', text: 'Casimir, the Hollow King, has worn the crown for thirty years. Nobody has said a true thing to him in all that time.' },
  { tag: 'lore', text: 'The black tears came after the crown. Nobody agrees on which way round it should have been.' },
  { tag: 'lore', text: 'The Bell rang at midnight in every realm at once. Nobody admits to ringing it.' },
  { tag: 'lore', text: 'Every half-stone has its other half somewhere. Usually somewhere unpleasant.' },
  { tag: 'lore', text: 'The Sentinels guard what the schools forgot. Some of them would like to be relieved.' },
  { tag: 'lore', text: 'Concordia is where the twelve schools meet. Brindlecross is where they argue about it.' },
  { tag: 'lore', text: 'Twelve stairs climb to the Heart, one for each school. Each one remembers who walked it last.' },
  { tag: 'lore', text: 'The Legion at the Heart was once people. Some of them still are, a little.' },
  { tag: 'lore', text: 'Every realm is funny before it is sad. Most of them are still funny after.' },
  { tag: 'lore', text: 'Old songs say the crown was meant to be passed, not worn. Old songs say a lot of things.' },
];
