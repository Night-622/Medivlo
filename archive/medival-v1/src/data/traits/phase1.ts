/** Phase 1 creation traits, ancestries, and story/earned traits (SYSTEMS.md §4). Owner: Claude 3. */
import type { TraitDef } from '@/core';

const creation: TraitDef[] = [
  {
    id: 'trait:ironhide', name: 'Ironhide', description: 'Thick-skinned and slow to tire of blows, if a little slow on your feet.',
    source: 'creation', phase: 1,
    boons: [{ kind: 'modifier', mod: { stat: 'armor', op: 'increased', value: 0.15 } }, { kind: 'modifier', mod: { stat: 'poise', op: 'flat', value: 10 } }],
    drawbacks: [{ kind: 'modifier', mod: { stat: 'moveSpeed', op: 'increased', value: -0.08 } }],
  },
  {
    id: 'trait:quickfoot', name: 'Quickfoot', description: 'Light on your feet, but light in the frame too.',
    source: 'creation', phase: 1,
    boons: [{ kind: 'modifier', mod: { stat: 'moveSpeed', op: 'increased', value: 0.1 } }, { kind: 'modifier', mod: { stat: 'dodgeCost', op: 'increased', value: -0.2 } }],
    drawbacks: [{ kind: 'modifier', mod: { stat: 'maxHp', op: 'increased', value: -0.1 } }],
  },
  {
    id: 'trait:reckless', name: 'Reckless', description: 'You fight like there is no tomorrow, and there might not be.',
    source: 'creation', phase: 1,
    boons: [{ kind: 'modifier', mod: { stat: 'damageDealt', op: 'increased', value: 0.2 } }],
    drawbacks: [{ kind: 'modifier', mod: { stat: 'damageTaken', op: 'increased', value: 0.2 } }],
  },
  {
    id: 'trait:scholar', name: 'Scholar', description: 'Hedge-school learning, codex hunger, soft hands.',
    source: 'creation', phase: 1,
    boons: [
      { kind: 'modifier', mod: { stat: 'maxMana', op: 'increased', value: 0.15 } },
      { kind: 'dialogueTag', tag: 'scholar' },
    ],
    drawbacks: [{ kind: 'modifier', mod: { stat: 'meleeDamage', op: 'increased', value: -0.1 } }],
  },
  {
    id: 'trait:silver-tongue', name: 'Silver Tongue', description: 'Words open more doors than swords. Merchants like you.',
    source: 'creation', phase: 1,
    boons: [{ kind: 'dialogueTag', tag: 'silver-tongue' }, { kind: 'hook', hook: 'shopDiscount', params: { pct: 0.15 } }],
    drawbacks: [{ kind: 'modifier', mod: { stat: 'might', op: 'flat', value: -1 } }],
  },
  {
    id: 'trait:devout', name: 'Devout', description: 'The Lantern burns in you. The darker crafts sit ill with your soul.',
    source: 'creation', phase: 1,
    boons: [
      { kind: 'modifier', mod: { stat: 'school.radiance', op: 'increased', value: 0.2 } },
      { kind: 'modifier', mod: { stat: 'healingDone', op: 'increased', value: 0.2 } },
      { kind: 'dialogueTag', tag: 'devout' },
    ],
    drawbacks: [{ kind: 'hook', hook: 'darkCraftCost', params: { pct: 0.5 } }],
  },
];

const ancestry: TraitDef[] = [
  {
    id: 'trait:haldish', name: 'Haldish', description: 'Common folk of Haldren: stubborn, practical, everywhere.', source: 'ancestry', phase: 1,
    boons: [
      { kind: 'modifier', mod: { stat: 'might', op: 'flat', value: 1 } }, { kind: 'modifier', mod: { stat: 'vigor', op: 'flat', value: 1 } },
      { kind: 'modifier', mod: { stat: 'xpGain', op: 'increased', value: 0.05 } },
    ],
    drawbacks: [],
  },
  {
    id: 'trait:solenni', name: 'Solenni', description: 'Southern imperial blood: lettered, devout, shrewd in trade.', source: 'ancestry', phase: 1,
    boons: [
      { kind: 'modifier', mod: { stat: 'intellect', op: 'flat', value: 1 } }, { kind: 'modifier', mod: { stat: 'will', op: 'flat', value: 1 } },
      { kind: 'hook', hook: 'shopDiscount', params: { pct: 0.1 } },
    ],
    drawbacks: [],
  },
  {
    id: 'trait:hrothi', name: 'Hrothi', description: 'Northern raiders and wolf-sworn, born to the cold.', source: 'ancestry', phase: 1,
    boons: [
      { kind: 'modifier', mod: { stat: 'might', op: 'flat', value: 1 } }, { kind: 'modifier', mod: { stat: 'vigor', op: 'flat', value: 1 } },
      { kind: 'modifier', mod: { stat: 'resist.frost', op: 'flat', value: 0.15 } },
    ],
    drawbacks: [],
  },
  {
    id: 'trait:aelthi', name: 'Aelthi', description: 'Long-lived forest folk who bend wardwood bows.', source: 'ancestry', phase: 1,
    boons: [
      { kind: 'modifier', mod: { stat: 'finesse', op: 'flat', value: 1 } }, { kind: 'modifier', mod: { stat: 'intellect', op: 'flat', value: 1 } },
      { kind: 'modifier', mod: { stat: 'rangedDamage', op: 'increased', value: 0.1, condition: { kind: 'weaponFamily', family: 'bow' } } },
    ],
    drawbacks: [],
  },
  {
    id: 'trait:orrun', name: 'Orrun', description: 'Stout stone-folk, descended from the giants of Orr.', source: 'ancestry', phase: 1,
    boons: [
      { kind: 'modifier', mod: { stat: 'might', op: 'flat', value: 1 } }, { kind: 'modifier', mod: { stat: 'vigor', op: 'flat', value: 1 } },
      { kind: 'modifier', mod: { stat: 'poise', op: 'increased', value: 0.1 } }, { kind: 'modifier', mod: { stat: 'equipLoad', op: 'increased', value: 0.2 } },
    ],
    drawbacks: [],
  },
  {
    id: 'trait:qasiri', name: 'Qasiri', description: 'Ash-scarred desert folk, touched by fire.', source: 'ancestry', phase: 1,
    boons: [
      { kind: 'modifier', mod: { stat: 'finesse', op: 'flat', value: 1 } }, { kind: 'modifier', mod: { stat: 'will', op: 'flat', value: 1 } },
      { kind: 'modifier', mod: { stat: 'resist.fire', op: 'flat', value: 0.15 } },
    ],
    drawbacks: [],
  },
];

const story: TraitDef[] = [
  {
    id: 'trait:duelist', name: 'Duelist', description: 'Fifty parries have taught your hands to listen.', source: 'earned', phase: 1, hidden: true,
    requirement: { kind: 'counter', counter: 'parries', atLeast: 50 },
    boons: [{ kind: 'modifier', mod: { stat: 'parryWindow', op: 'flat', value: 40 } }], drawbacks: [],
  },
  {
    id: 'trait:hollowbane', name: 'Hollowbane', description: 'A hundred Hollowed purged or put down.', source: 'earned', phase: 1, hidden: true,
    requirement: { kind: 'counter', counter: 'kills.variant.hollowed', atLeast: 100 },
    boons: [{ kind: 'modifier', mod: { stat: 'damageDealt', op: 'increased', value: 0.1, condition: { kind: 'targetVariant', variant: 'hollowed' } } }], drawbacks: [],
  },
  {
    id: 'trait:wolf-friend', name: 'Wolf-Friend', description: 'The wolves of the Gloamwood remember a kindness.', source: 'story', phase: 1, hidden: true,
    boons: [{ kind: 'hook', hook: 'wolfFriend' }], drawbacks: [],
  },
  {
    id: 'trait:oathbreaker', name: 'Oathbreaker', description: 'You broke a sworn word. It made you harder.', source: 'story', phase: 1, hidden: true,
    boons: [{ kind: 'modifier', mod: { stat: 'damageDealt', op: 'increased', value: 0.1 } }, { kind: 'dialogueTag', tag: 'oathbreaker' }],
    drawbacks: [{ kind: 'modifier', mod: { stat: 'healingReceived', op: 'increased', value: -0.2 } }],
  },
];

export default [...creation, ...ancestry, ...story];
