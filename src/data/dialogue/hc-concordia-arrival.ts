/**
 * Hollow Crown, Act II arrival (II-1 Through the Arch): the twelve arches of the Gate Circle and meeting Maren.
 * Each arch has one entry per class of its school (the class beats from docs/lore/hollow-crown/06-outlines),
 * plus a plain entry for anyone else who looks at it. Owner: Claude 4.
 */
import type { DialogueDef, NarrativeCondition, SchoolId } from '@/core';

const ARCH: NarrativeCondition = { questStage: 'quest:cc-through-the-arch', stage: 'arch' };
type Beat = [cls: string, text: string, choices?: DialogueDef['nodes'][string]['choices']];

/** something a class campaign sends through its arch later (e.g. a mentor’s letter in C-6) */
type Hook = { when: NarrativeCondition; dialogue: `dialogue:${string}` };

function arch(school: SchoolId, name: string, plain: string, beats: Beat[], hooks: Hook[] = []): DialogueDef {
  const nodes: DialogueDef['nodes'] = {
    plain: { speaker: 'narrator', text: plain, next: null },
  };
  const entries: DialogueDef['entries'] = [];
  hooks.forEach((h, i) => {
    nodes[`hook${i}`] = { speaker: 'narrator', text: 'Something has come through the arch for you.', effects: [{ openDialogue: h.dialogue }], next: null };
    entries.push({ when: h.when, node: `hook${i}` });
  });
  for (const [cls, text, choices] of beats) {
    nodes[cls] = choices ? { speaker: 'narrator', text, choices } : { speaker: 'narrator', text, next: null };
    entries.push({ when: { all: [ARCH, { heroClass: cls }] }, node: cls });
  }
  // your own school's arch, out of order (another bearer's campaign, or after II-1)
  entries.push({ node: 'plain' });
  return { id: `dialogue:obj-arch-${school}`, name: `Gate Circle: ${name} arch`, entries, nodes };
}

const dialogues: DialogueDef[] = [
  arch('ash', 'Ash', 'The Ash arch, black basalt veined with red. The Cinder Gate lies somewhere beyond it, a week’s walk and thirty years away.', [
    ['arcanist', 'The Ash arch is scorched, but from the inside, as if something burned its way out. Your half-stone is warm against your ribs.'],
    ['reaver', 'The Ash arch is hacked with old axe-marks on this side: a Muster’s tally, thirty years of nights counted by somebody who never went home.'],
  ], [
    { when: { questStage: 'quest:arcanist-a-letter-from-thrane', stage: 'letter' }, dialogue: 'dialogue:arcanist-thrane-letter' },
  ]),
  arch('rime', 'Rime', 'The Rime arch, white stone hung with icicles that have not dripped in thirty years.', [
    ['rimecaller', 'The icicles on the Rime arch stopped dripping thirty years ago. As you step clear of it, one of them lets fall a single drop, and then another.'],
    ['warden', 'The Rime arch is cracked down the middle like the Breach. On this side, pressed into the frost, are handprints. Outland hands, small and spread.'],
  ]),
  arch('storm', 'Storm', 'The Storm arch, slate and copper, humming faintly like a kettle about to sing.', [
    ['sparkwright', 'The Storm arch crackles with trapped static. A thin copper wire trails out of it and away into the grass, as if someone ran it here on purpose.'],
    ['stormlancer', 'Hoofprints are scorched into the turf just past the Storm arch, already cooling. Somebody came through behind you, and was gone before you turned round.'],
  ]),
  arch('radiance', 'Radiance', 'The Radiance arch, white stone that holds the last of the light longer than the rest.', [
    ['cantor', 'The Radiance arch is the only lit arch in the ring at dusk. The wolves at the treeline flinch from it, and so, a little, do you.'],
    ['oathbound', 'The Radiance arch is lit. Someone has scratched a line into its stone on this side, fresh: “to whoever wears it”.'],
  ]),
  arch('umbral', 'Umbral', 'The Umbral arch, violet stone. Its shadow is longer than it ought to be.', [
    ['duskweaver', 'The Umbral arch’s shadow points the wrong way, away from the setting sun and towards the Heart of Morvane.'],
    ['shade', 'Every arch in the ring casts a long dusk shadow. So does every stone, every thistle, every wolf at the treeline. You don’t.'],
  ]),
  arch('verdant', 'Verdant', 'The Verdant arch, green stone wound with old briar.', [
    ['hedgewitch', 'The Verdant arch has grown shut with briar on this side. You have to talk it open, the way Mother Yarrow taught you, one thorn at a time.'],
    ['ranger', 'The Verdant arch’s briars have rotted to black mould on this side. You stepped out through a crumble of dead leaves that smelled of the Rotwood.'],
  ]),
  arch('blade', 'Blade', 'The Blade arch, pale stone, its edges still sharp after a thousand years.', [
    ['swordsman', 'A sword is driven into the Blade arch’s keystone. You pull it free: it is a Ladder challenge, thirty years old, addressed to nobody.', [
      { text: 'Keep the challenge.', to: null, effects: [{ setFlag: 'swordsman.arch_challenge', value: true }] },
      { text: 'Leave it.', to: null },
    ]],
    ['samurai', 'A Hushpine prayer-strip hangs from the Blade arch, faded white by thirty years of weather. You stepped out so quietly the wolves didn’t turn round.'],
  ]),
  arch('iron', 'Iron', 'The Iron arch, dark iron-stone, chained shut on this side.', [
    ['knight', 'The Iron arch is chained shut from the Concordia side. The padlock bears Queen Berenika’s arms: her honour guard locked it behind themselves on the night of the Hollowing.'],
    ['juggernaut', 'The chain on the Iron arch is Deepworks chain, Rivet Town stamp. We made the lock too.', [
      { text: '[Lift it off.]', to: null, school: 'iron', effects: [{ setFlag: 'juggernaut.chain_lifted', value: true }] },
      { text: 'Leave it.', to: null },
    ]],
  ]),
  arch('fist', 'Fist', 'The Fist arch, rough orange stone, worn smooth at shoulder height.', [
    ['monk', 'A stair is carved up the side of the Fist arch, in Master Kell’s own style. It stops halfway.'],
    ['brawler', 'The Fist arch is scuffed knee-high where someone in Concordia has kicked it, every day, for thirty years.', [
      { text: '[Add one.]', to: null, school: 'fist', effects: [{ setFlag: 'brawler.arch_kicked', value: true }] },
      { text: 'Leave it.', to: null },
    ]],
  ]),
  arch('hunt', 'Hunt', 'The Hunt arch, olive stone carved with antlers.', [
    ['huntsman', 'The carved antlers on the Hunt arch have been sawn off on the Greywilds side, for somebody’s wall.'],
    ['falconer', 'Birds roost on the Hunt arch and on no other. Your hawk lands on its keystone and will not come down.'],
  ]),
  arch('guile', 'Guile', 'The Guile arch, rose stone, oddly well polished.', [
    ['jester', 'A brass pawn ticket is nailed to the Guile arch’s keystone: “Redeemable at Velvet Harbour. No refunds.”'],
    ['corsair', 'Black pearls lie like gravel in the lee of the Guile arch. Tears seeping through the shut gate harden on this side too, and somebody has been raking them up.'],
  ]),
  arch('song', 'Song', 'The Song arch, lilac stone that hums when the wind crosses it.', [
    ['bard', 'The Song arch hums one flat note, over and over.', [
      { text: '[Tune it.]', to: null, school: 'song', effects: [{ setFlag: 'bard.arch_tuned', value: true }] },
      { text: 'Leave it.', to: null },
    ]],
    ['skald', 'The Song arch answers your footsteps a beat late, like the Fells do.'],
  ]),

  // ---------- Maren at the Gate Circle (II-1, stage maren)
  {
    id: 'dialogue:cc-maren-arch', name: 'II-1 Maren at the Gate Circle', scope: 'party',
    entries: [
      { when: { questStage: 'quest:cc-through-the-arch', stage: 'maren' }, node: 'start' },
      { node: 'soon' },
    ],
    nodes: {
      soon: { speaker: 'npc:maren', text: 'Not now. Wolves first. Talk after.', next: null },
      start: {
        speaker: 'npc:maren', text: 'Thirty years that ring’s been dark, and tonight one of them lights up and a stranger walks out of it. And the wolves walk in after you.',
        choices: [
          { text: 'I came through from {realm}.', to: 'realm' },
          { text: 'You’ve no shadow. Neither have I. Put the knife away.', to: 'shade', school: 'umbral', when: { heroClass: 'shade' } },
          { text: 'Who are you?', to: 'who' },
        ],
      },
      shade: { speaker: 'npc:maren', mood: 'afraid', text: 'I noticed. I’ll keep the knife, if it’s all the same.', next: 'realm' },
      who: { speaker: 'npc:maren', text: 'Maren Hollis. I hunt the Gloamwood, or I did, before it started hunting back.', next: 'realm' },
      realm: {
        speaker: 'npc:maren', text: '{realm}. My mother used to talk about the other realms like they were just down the road. Then the arches shut. Come on. Brindlecross is over the hill, and the wolves follow the light now.',
        choices: [
          { text: 'Lead on.', to: 'end', trust: 1 },
          { text: 'Your mother?', to: 'mother', insight: 'maren-mother' },
        ],
      },
      mother: { speaker: 'npc:maren', mood: 'sad', text: 'She carried a stone, once. Walked into the Heart thirty years ago to hand it back. Lead on, I said.', next: 'end' },
      end: { speaker: 'npc:maren', text: 'Stay close and keep your fire low. Wil at the Goose will have a bed, if you’ve the shards.', next: 'ring' },
      ring: {
        speaker: 'narrator', text: 'As you turn to go, you look back at the ring. Eleven arches stand dark, black tears running from their keystones like rain off a roof. Only yours still glows, the mark of {school} warm in the stone.',
        choices: [
          { text: '(Put your hand on {school}’s arch, one last time.)', to: 'home' },
          { text: '(Touch the nearest dark arch.)', to: 'touch' },
          { text: 'Will the others open?', to: 'others' },
        ],
      },
      home: { speaker: 'narrator', text: 'The mark is warm, like a hearth-stone in the morning. Somewhere behind it is {realm}, and {mentor}, and everything you left. The glow dims under your hand, but it does not go out.', next: 'go' },
      touch: { speaker: 'narrator', text: 'The stone is cold and wet. Under your palm, very faintly, something hums back: another half-stone, far off, on the other side, waiting for its bearer to find the way through.', next: 'go' },
      others: { speaker: 'npc:maren', text: 'Mother said all twelve were lit at a Turning, every one a different colour, and you could read by them at midnight. If yours can open, I suppose the rest can. I’d like to see that before I’m old.', next: 'go' },
      go: { speaker: 'npc:maren', text: 'Come on. They’ll still be weeping tomorrow. The wolves won’t wait that long.', next: null },
    },
  },
];

export default dialogues;
