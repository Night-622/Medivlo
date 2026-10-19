/** NPCs of Solenne and the Lantern Coast, Act II Ch4 (docs/lore/11-act2-spec.md). Owner: Claude 4. Landmarks are placed by Claude 2. */
import type { NpcDef } from '@/core';

const at = (quest: `quest:${string}`, stage: string) => ({ questStage: quest, stage });
const eq = (flag: string, value: string) => ({ flag, op: '==' as const, value });
const QS = 'quest:the-summons', QI = 'quest:sister-ilse';
const R = 'region:lantern-coast' as const, LANT = 'faction:lanternate' as const;

const npcs: NpcDef[] = [
  {
    id: 'npc:hierophant-aurelian', name: 'Aurelian IV', title: 'Hierophant', people: 'solenni', faction: LANT, region: R, home: 'landmark:hierophant-court',
    // once the summons is answered he keeps a vigil at the dead Brand through the small hours
    schedule: [{ from: 23, to: 4, at: 'landmark:cathedral-of-the-brand', activity: 'pray', when: { questCompleted: QS } }],
    dialogue: [
      { when: { questStage: 'quest:the-snuffed-candles', stage: 'door' }, dialogue: 'dialogue:candles-aurelian' },
      { when: { questStage: 'quest:the-snuffed-candles', stage: 'presses' }, dialogue: 'dialogue:candles-presses' },
      { when: at(QS, 'hierophant'), dialogue: 'dialogue:aurelian-audience' },
      { when: at(QI, 'accuse'), dialogue: 'dialogue:ch4-accusation' },
      { dialogue: 'dialogue:ch4-aurelian-general' },
    ],
    barks: [{ lines: ['Lux manet. Lux manet. It must.', 'Is it still snowing? Ah. Of course it is.', 'Forgive me. My hands are cold. They are always cold now.'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0xb88a64, hair: 0xe8e4dc, cloth: 0xf0e8d0, accent: 0xd4a646, build: 'slight' },
    bio: 'Hierophant of the Lanternate, 80s, gentle, scholarly and very frightened. He canonised Ysolde and gave her the Brand to keep, and he believes the Quench is his sin. Lord-Inquisitor Vellane rules the Church in his name, and Aurelian lets him, because he no longer trusts himself to.',
    lore: 'lore:hierophant-aurelian',
  },
  {
    id: 'npc:castor-vellane', name: 'Castor Vellane', title: 'Lord-Inquisitor', people: 'solenni', faction: 'faction:order-of-the-wick', region: R, home: 'landmark:hierophant-court',
    schedule: [{ from: 0, to: 24, at: 'landmark:lower-city', activity: 'idle', when: { questStage: 'quest:the-last-lanternmass', stage: 'fire' } }],
    dialogue: [
      { when: { questStage: 'quest:the-last-lanternmass', stage: 'fire' }, dialogue: 'dialogue:ch7-vellane-fire' },
      { when: at(QS, 'vellane'), dialogue: 'dialogue:vellane-summons' },
      { when: at(QI, 'accuse'), dialogue: 'dialogue:ch4-accusation' },
      { dialogue: 'dialogue:ch4-vellane-general' },
    ],
    barks: [
      { when: eq('act2.church_stance', 'defiant'), lines: ['You are still in my city. How trusting of you.', 'Mind the candles, Ashmarked.'] },
      { lines: ['I do not hate magic. I hate fire left unattended.', 'Trim the wick, and the flame burns true.', 'Every lamp in this city is counted. Every one.'] },
    ],
    roles: ['quest'], essential: true,
    look: { skin: 0xa8784e, hair: 0x1a1614, cloth: 0xece4d4, accent: 0x2a2320, build: 'tall' },
    bio: 'Lord-Inquisitor of the Order of the Wick, 40s, lean, courteous and quietly brilliant. He believes, with perfect sincerity, that unlicensed fire caused the Quench and that only absolute order will carry the world through the Long Winter. He has never raised his voice. He has never needed to.',
    lore: 'lore:castor-vellane',
  },
  {
    id: 'npc:sister-ilse', name: 'Sister Ilse', title: 'Keeper of the Font', people: 'solenni',
    lore: 'lore:sister-ilse',
    // her cover; she is the Drowned Choir's infiltrator (faction drowned-choir in the spec). The dialogue crest would give her away.
    faction: LANT, region: R, home: 'landmark:keepers-quarters',
    presentWhen: { not: { flag: 'act2.ilse_accused' } },
    schedule: [{ from: 5, to: 9, at: 'landmark:cathedral-of-the-brand', activity: 'pray' }],
    dialogue: [{ dialogue: 'dialogue:ch4-ilse-general' }],
    barks: [{ lines: ['The water in the font is fresh this morning. I see to it.', 'Hush. Listen. Can you hear the rain under the snow?', 'She used to sit just there. She liked the sound of the font.'] }],
    roles: ['quest'], essential: true,
    look: { skin: 0xc8a888, hair: 0x2a2a30, cloth: 0xe0dcd0, accent: 0x1c2a33, build: 'slight' },
    bio: 'A sister of the cathedral, 30s, serene and soft-spoken, who served Saint Ysolde as her attendant and now tends the Keeper’s rooms and the great font. Her hands are always cool and a little damp. She is the Drowned Choir’s eyes in Solenne, and she opened the doors on Lanternmass night.',
  },
  {
    id: 'npc:deacon-ottavia', name: 'Ottavia', title: 'Deacon of the Archive', people: 'solenni', faction: LANT, region: R, home: 'landmark:cathedral-of-the-brand',
    schedule: [{ from: 0, to: 24, at: 'landmark:valcastre-cells', activity: 'idle', when: eq('act2.wrong_accused', 'ottavia') }],
    dialogue: [{ dialogue: 'dialogue:ch4-ottavia-general' }],
    barks: [{ lines: ['Mind the shelves. Mind your sleeves. Mind everything.', 'Ink is a kind of faith, you know. It assumes someone will read it.'] }],
    roles: ['quest'],
    look: { skin: 0x9a6a48, hair: 0x7a7a7a, cloth: 0x4a3a5a, accent: 0xd4a646, build: 'short' },
    bio: 'Deacon of the cathedral archive, 50s, sharp-tongued and ink-stained. She has spent thirty years quietly rescuing books the Wick ordered burned, and keeps them in a false-bottomed desk. She had nothing to do with the Quench, and is terrified that no one will believe it.',
  },
  {
    id: 'npc:brother-caius', name: 'Brother Caius', title: 'Lamplighter of the Nave', people: 'solenni',
    // his cover; he is secretly of the Ashen Creed
    faction: LANT, region: R, home: 'landmark:cathedral-of-the-brand',
    schedule: [{ from: 0, to: 24, at: 'landmark:valcastre-cells', activity: 'idle', when: eq('act2.wrong_accused', 'caius') }],
    dialogue: [{ dialogue: 'dialogue:ch4-caius-general' }],
    barks: [{ lines: ['Seven hundred lamps in this nave, and every one of them lit from tallow now.', 'Fire is fire. It does not ask whose hand holds the taper.'] }],
    roles: ['quest'],
    look: { skin: 0x8a5a3a, hair: 0x2a1a10, cloth: 0xd8cfb8, accent: 0xb5481f, build: 'average' },
    bio: 'Lamplighter of the cathedral nave, 20s, quiet, quick and burn-scarred along both forearms. He was the last brother to light a lamp from the Brand. He is a secret member of the Ashen Creed, and passes the Wick’s lists to the Red Abbess so that the marked can be warned before the carts come.',
  },
];

export default npcs;
