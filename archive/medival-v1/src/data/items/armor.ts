/** Phase 1 armour and accessories. Owner: Claude 3. */
import type { ItemDef } from '@/core';

const armor: ItemDef[] = [
  {
    id: 'item:padded-gambeson', name: 'Padded Gambeson', description: 'Quilted linen, many layers thick.',
    itemKind: 'armor', rarity: 'common', itemLevel: 1, slot: 'chest', value: 20, upgradeable: true,
    icon: { shape: 'armor', color: '#9c8a6a' }, armor: { weight: 'medium', armor: 14, poise: 6, equipWeight: 6 },
  },
  {
    id: 'item:leather-jerkin', name: 'Leather Jerkin', description: 'Boiled leather, cut for drawing a bow.',
    itemKind: 'armor', rarity: 'common', itemLevel: 1, slot: 'chest', value: 18, upgradeable: true,
    icon: { shape: 'armor', color: '#7a5634' }, armor: { weight: 'light', armor: 9, poise: 3, equipWeight: 3.5 },
  },
  {
    id: 'item:apprentice-robes', name: 'Apprentice Robes', description: 'Ash-grey wool with scorch marks at the cuffs.',
    itemKind: 'armor', rarity: 'common', itemLevel: 1, slot: 'chest', value: 18, upgradeable: true,
    icon: { shape: 'armor', color: '#6e6a78' }, armor: { weight: 'light', armor: 4, poise: 1, equipWeight: 2 },
    implicit: [{ stat: 'maxMana', op: 'flat', value: 10 }],
  },
  {
    id: 'item:chain-hauberk', name: 'Chain Hauberk', description: 'Riveted iron rings to the knee.',
    itemKind: 'armor', rarity: 'common', itemLevel: 3, slot: 'chest', value: 80, upgradeable: true, requirements: { might: 12 },
    icon: { shape: 'armor', color: '#a3a7ab' }, armor: { weight: 'heavy', armor: 24, poise: 12, equipWeight: 11 },
  },
  {
    id: 'item:iron-helm', name: 'Iron Helm', description: 'A nasal helm, dented by someone else’s bad day.',
    itemKind: 'armor', rarity: 'common', itemLevel: 2, slot: 'head', value: 30, upgradeable: true,
    icon: { shape: 'armor', color: '#8d9196' }, armor: { weight: 'heavy', armor: 8, poise: 4, equipWeight: 4 },
  },
  {
    id: 'item:barrow-king-helm', name: 'Barrow-King’s Helm', description: 'A crowned war-helm from Edric’s inner vault. Cold to the touch, even in summer.',
    flavor: '“The crown is lighter than the oath.”',
    itemKind: 'armor', rarity: 'uncommon', itemLevel: 8, slot: 'head', value: 220, upgradeable: true, requirements: { might: 12 },
    icon: { shape: 'armor', color: '#9fb1a0' }, armor: { weight: 'heavy', armor: 12, poise: 6, equipWeight: 5, resist: { shadow: 0.1 } },
    implicit: [{ stat: 'maxHp', op: 'flat', value: 12 }, { stat: 'statusResist', op: 'flat', value: 0.05 }],
  },
  {
    id: 'item:leather-hood', name: 'Leather Hood', description: 'Keeps the rain off and the face in shadow.',
    itemKind: 'armor', rarity: 'common', itemLevel: 1, slot: 'head', value: 12, upgradeable: true,
    icon: { shape: 'armor', color: '#5e4430' }, armor: { weight: 'light', armor: 3, poise: 1, equipWeight: 1 },
  },
  {
    id: 'item:leather-gloves', name: 'Leather Gloves', description: 'Supple and well worn.',
    itemKind: 'armor', rarity: 'common', itemLevel: 1, slot: 'hands', value: 10, upgradeable: true,
    icon: { shape: 'armor', color: '#6b4a2f' }, armor: { weight: 'light', armor: 2, poise: 1, equipWeight: 0.8 },
  },
  {
    id: 'item:leather-boots', name: 'Leather Boots', description: 'Hobnailed for the Marches’ mud.',
    itemKind: 'armor', rarity: 'common', itemLevel: 1, slot: 'feet', value: 10, upgradeable: true,
    icon: { shape: 'armor', color: '#5a3d26' }, armor: { weight: 'light', armor: 3, poise: 1, equipWeight: 1.5 },
  },
  {
    id: 'item:soft-boots', name: 'Soft Boots', description: 'Felt-soled, quiet on library floors.',
    itemKind: 'armor', rarity: 'common', itemLevel: 1, slot: 'feet', value: 10, upgradeable: true,
    icon: { shape: 'armor', color: '#4f4a5a' }, armor: { weight: 'light', armor: 2, poise: 0, equipWeight: 1 },
    implicit: [{ stat: 'moveSpeed', op: 'increased', value: 0.03 }],
  },
  {
    id: 'item:wool-cloak', name: 'Wool Cloak', description: 'Thick undyed wool against the mere-wind.',
    itemKind: 'armor', rarity: 'common', itemLevel: 1, slot: 'cloak', value: 14, upgradeable: true,
    icon: { shape: 'armor', color: '#6f6656' }, armor: { weight: 'light', armor: 2, poise: 0, equipWeight: 1, resist: { frost: 0.05 } },
  },
  {
    id: 'item:copper-ring', name: 'Copper Ring', description: 'A plain band. It turns your finger green.',
    itemKind: 'accessory', rarity: 'common', itemLevel: 1, slot: 'ring', value: 15,
    icon: { shape: 'ring', color: '#c47a3f' }, implicit: [{ stat: 'maxHp', op: 'flat', value: 5 }],
  },
  {
    id: 'item:ley-glass-amulet', name: 'Ley-Glass Amulet', description: 'A bead of fused glass that is always warm.',
    itemKind: 'accessory', rarity: 'common', itemLevel: 3, slot: 'amulet', value: 40,
    icon: { shape: 'gem', color: '#7fc4d9' }, implicit: [{ stat: 'maxMana', op: 'flat', value: 8 }],
  },
  {
    id: 'item:hempen-belt', name: 'Hempen Belt', description: 'Loops for pouches and a flask.',
    itemKind: 'accessory', rarity: 'common', itemLevel: 1, slot: 'belt', value: 8,
    icon: { shape: 'misc', color: '#9b8455' }, implicit: [{ stat: 'maxStamina', op: 'flat', value: 5 }],
  },
];

export default armor;
