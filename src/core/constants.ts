/** Shared engine constants. Owner: Claude 1. */
export const TILE_SIZE = 32;
export const CHUNK_TILES = 32;

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const SAVE_VERSION = 1;

export const SceneKeys = {
  Boot: 'Boot',
  MainMenu: 'MainMenu',
  CharacterCreate: 'CharacterCreate',
  /** The game world. Since the swap (2026-10-20) this IS the Hollow Crown WorldV2 scene (same key). */
  World: 'WorldV2',
  /** Alias of World (the swap is done); Claude 2's WorldV2Scene registers under this key. */
  WorldV2: 'WorldV2',
  /** Hollow Crown HUD (launched by WorldV2) */
  HudV2: 'HudV2',
  Pause: 'Pause',
  Death: 'Death',
  Settings: 'Settings',
  Account: 'Account',
  Load: 'Load',
  Realms: 'Realms',
  Friends: 'Friends',
  People: 'People',
  Credits: 'Credits',
} as const;

/** Render depth bands. Systems pick a value inside their band. */
export const Depth = {
  Ground: 0,
  GroundDecor: 100,
  Actors: 1000, // actors add their y position for sorting
  Overhead: 100_000, // world y reaches ~49k px, so actors (1000 + y) must stay below this
  Effects: 110_000,
  WorldUi: 120_000,
} as const;

export const Palette = {
  ink: 0x0e0b08,
  parchment: 0xe8d9b5,
  parchmentDark: 0xb9a57c,
  gold: 0xd4a646,
  blood: 0x9b2c2c,
  mana: 0x3b6fd1,
  stamina: 0x4f9d4a,
  stone: 0x5a554d,
} as const;

/** Single fixed world seed shared by all saves (agreed with Claude 2). */
export const WORLD_SEED = 0x4d6f7276; // "Morv"

/** Per-tile collision bitmask (WORLD.md §4.2). */
export const Collision = {
  SOLID: 1,
  WATER: 2,
  BLOCK_PROJECTILE: 4,
  BLOCK_SIGHT: 8,
  SLOW: 16,
  HAZARD: 32,
  NO_SPAWN: 64,
} as const;

/** The 12 schools (handoff). Magic: ash rime storm radiance umbral verdant. Martial: blade iron fist hunt guile song. */
export type SchoolId = 'ash' | 'rime' | 'storm' | 'radiance' | 'umbral' | 'verdant' | 'blade' | 'iron' | 'fist' | 'hunt' | 'guile' | 'song';
export const MAGIC_SCHOOLS: readonly SchoolId[] = ['ash', 'rime', 'storm', 'radiance', 'umbral', 'verdant'];
export const MARTIAL_SCHOOLS: readonly SchoolId[] = ['blade', 'iron', 'fist', 'hunt', 'guile', 'song'];
/** classId → school (stable canon from the handoff; class defs themselves are Claude 3's). */
export const CLASS_SCHOOL: Readonly<Record<string, SchoolId>> = {
  warden: 'rime', rimecaller: 'rime', ranger: 'verdant', hedgewitch: 'verdant', reaver: 'ash', arcanist: 'ash',
  stormlancer: 'storm', sparkwright: 'storm', oathbound: 'radiance', cantor: 'radiance', shade: 'umbral', duskweaver: 'umbral',
  swordsman: 'blade', samurai: 'blade', knight: 'iron', juggernaut: 'iron', monk: 'fist', brawler: 'fist',
  huntsman: 'hunt', falconer: 'hunt', corsair: 'guile', jester: 'guile', bard: 'song', skald: 'song',
};
export const classSchool = (classId: string): SchoolId | undefined => CLASS_SCHOOL[classId.replace(/^class:/, '')];
