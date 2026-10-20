/**
 * Builds text, school of iron (Claude 4; overlay on Claude 3 / Claude 5's mechanics, docs/systems/BUILDS.md phase 8).
 * Keyed by frozen ids: perks pk_* (perks-iron.ts) and the school's new kit spells (kit-spells-new.ts). Flavour only, no
 * numbers (they are still being tuned); `name` only where the working name is replaced. Owner: Claude 4.
 */
import type { BuildText, SpellText } from '../hc-builds-text';

export const PERKS: Record<string, BuildText> = {
  // ---------- Knight (Anvilgate)
  pk_knight_lance_charge: { flavour: 'The Tilt Yard runs from dawn to dusk, and so do the squires, mostly away from the horses.' },
  pk_knight_impact: { name: 'Shock of Arms', flavour: 'An Anvil knight hits the line like a dropped portcullis, and is about as easy to talk round.' },
  pk_knight_trample: { flavour: 'Anvilgate charges a toll between every street. No knight at the gallop has ever once paid it.' },
  pk_knight_heavy_horse: { flavour: 'Ser Gideon’s old horse Steadfast carried him in full plate, and complained every step, as horses do.' },
  pk_knight_binding_oath: { flavour: 'An Anvil knight swears on the anvil itself, so the oath is struck, not spoken, and rings for a while after.' },
  pk_knight_shield_wall: { flavour: 'Walls within walls within walls. Given time, Anvilgate’s builders would have made the knights out of stone too.' },
  pk_knight_shield_bash: { flavour: 'The kite shield is for keeping blows off. The rim is for discussing the matter afterwards.' },
  pk_knight_rallying_banner: { flavour: 'Raise the colours and the line remembers what it is for. Squires are told this, and to keep the pole upright.' },
  pk_knight_steel_resolve: { flavour: 'The Barrow of Knights is full of men who stood their ground. The Order would like you to stand yours alive.' },
  pk_knight_plate_drill: { flavour: 'Squires drill in full plate until they can run in it, swear in it and, by their third summer, sleep in it.' },
  pk_knight_iron_will: { flavour: 'Ironhold has been ashamed for thirty years and is still standing. Shame, it turns out, is excellent for posture.' },
  pk_knight_vengeance: { flavour: 'Dent an Anvil knight and the dent goes in the roll of arms, with your name beside it, for later.' },
  // ---------- Juggernaut (the Deepworks)
  pk_juggernaut_deep_quake: { flavour: 'When a Juggernaut hits the floor of the Deepworks, the miners two galleries down call it the change of shift.' },
  pk_juggernaut_crushing: { flavour: 'A stunned foe is a still foe, and a still foe is only ore with ideas. The Brotherhood swings accordingly.' },
  pk_juggernaut_aftershock: { flavour: 'Down the shafts every blow has an echo. The old miners say the mountain is answering back, and never politely.' },
  pk_juggernaut_avalanche: { name: 'Rockfall', flavour: 'Slow to start and impossible to stop. Rivet Town has one whistle for rockfall and another for Juggernauts.' },
  pk_juggernaut_battering: { flavour: 'Rivet Town has no doors worth the name. The Brotherhood keeps knocking them down on the way to work.' },
  pk_juggernaut_momentum: { flavour: 'An ore cart on the main line takes a while to get going, and longer to stop. The Juggernauts took notes.' },
  pk_juggernaut_shockwave: { flavour: 'Foreman Haldt can stop a whole gallery with one blast of the whistle. A Juggernaut does it by arriving.' },
  pk_juggernaut_iron_lungs: { flavour: 'Gussie Haldt is pocket-sized, and her whistle carries three seams down. Rivet Town lungs are trained in the dust.' },
  pk_juggernaut_long_spikes: { flavour: 'The spikes on Juggernaut pauldrons began as a way to stop people leaning on them at the bar.' },
  pk_juggernaut_thick_hide: { flavour: 'Juggernaut plate goes on over a hide already toughened by slag-spit, coal dust and the foreman’s opinions.' },
  pk_juggernaut_retribution: { flavour: 'Hit a Juggernaut and you will be hit back. This is not a threat. It is shift policy.' },
  pk_juggernaut_bloodied: { flavour: 'The Brotherhood says a Juggernaut is only warming up until somebody calls for a stretcher, and they refuse it.' },
  // ---------- Iron school
  pk_iron_tempered: { flavour: 'Heat it, quench it and hit it in between. The Fortress Forge does the same to its apprentices.' },
  pk_iron_armour_breaker: { flavour: 'Every suit of armour has a weak seam somewhere. The Forge’s riveters know where, because they put it there.' },
  pk_iron_bulwark: { flavour: 'Ironhold endures; it holds the line. It has held it so long that the line has grown a little tired.' },
  pk_iron_unshaken: { flavour: 'The Deepworks shake at every shift change. Ironhold folk sleep through rockfalls and wake for whistles.' },
  pk_iron_last_bastion: { flavour: 'Berenika’s Wall is cracking, but it is still standing. So is anyone from Ironhold worth the name.' },
  pk_iron_drilled: { flavour: 'First whistle, boots. Second whistle, breakfast. Third whistle, war. Rivet Town keeps very strict hours.' },
  pk_iron_second_wind: { flavour: 'Every blow you stop is a blow you did not take. In Rivet Town that counts as a tea break.' },
  pk_iron_forge_born: { flavour: 'Knights and Juggernauts are forged in Ironhold, sometimes literally. It is considered rude to ask which.' },
};

export const SPELLS: Record<string, SpellText> = {
  'spell:ride-down': { flavour: 'The Order of the Anvil does not ride round things. It rides through them, and pays for the hedges later.' },
  'spell:hold-the-breach': { flavour: 'Find the crack in the wall and stand in it. That is the whole of the Order’s tactics, and it has served for ages.' },
  'spell:champions-strike': { flavour: 'The Tilt Yard champion strikes once and salutes once, and leaves the squires to pick up the pieces.' },
  'spell:seismic-slam': { flavour: 'Strike the Deepworks floor right and the crack runs to the foe. Strike it wrong and it runs to the foreman.' },
  'spell:bronze-hide': { name: 'Hold the Roof', flavour: 'Big Aud Fenner held the roof for an hour and three-quarters while the shift crawled out. She never talked about it.' },
  'spell:earthbreaker': { flavour: 'The maul goes up, Rivet Town holds its breath, and the maul comes down. The town has never been disappointed.' },
};
