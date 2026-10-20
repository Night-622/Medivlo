import '@fontsource/jersey-10/400.css';
import '@fontsource/jacquard-24/400.css';
import '@fontsource/jacquard-12/400.css';
import '@fontsource/pixelify-sans/400.css';
import '@fontsource/pixelify-sans/500.css';
import '@fontsource/pixelify-sans/600.css';
import '@fontsource/pixelify-sans/700.css';
import '@fontsource/silkscreen/400.css';
import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, Palette, Settings, bus } from '@/core';
import { BootScene } from '@/scenes/BootScene';
import { MainMenuScene } from '@/scenes/MainMenuScene';
import { CharacterCreateScene } from '@/scenes/CharacterCreateScene';
import { HudV2Scene } from '@/ui/hud/HudV2Scene';
import { PauseScene } from '@/ui/screens/PauseScene';
import { DeathScene } from '@/ui/screens/DeathScene';
import { SettingsScene } from '@/ui/screens/SettingsScene';
import { AccountScene } from '@/ui/screens/AccountScene';
import { installAudio } from '@/audio';
import { installHiDpi } from '@/render/hidpi';
import { installAutosave } from '@/firebase/autosave';
import { installErrorReports } from '@/firebase/errors';
import { LoadScene } from '@/ui/screens/LoadScene';
import { RealmsScene } from '@/ui/screens/RealmsScene';
import { FriendsScene } from '@/ui/screens/FriendsScene';
import { PeopleScene } from '@/ui/screens/PeopleScene';
import { CreditsScene } from '@/ui/screens/CreditsScene';
import { sim } from '@/net';
import { installLigatureFix } from '@/ui/kit/hc';

installLigatureFix();

// Claude 2's v2 world scene is registered automatically once src/scenes/WorldV2Scene.ts exists.
const v2Modules = import.meta.glob<{ WorldV2Scene?: typeof Phaser.Scene }>('./scenes/WorldV2Scene.ts', { eager: true });
const v2Scenes = Object.values(v2Modules).map((mod) => mod.WorldV2Scene).filter((s): s is typeof Phaser.Scene => !!s);

// Pixel fonts are self-hosted (no external URLs). Wait for them so Phaser never caches a fallback font.
await Promise.all(
  ['40px "Jersey 10"', '400 16px "Pixelify Sans"', '500 16px "Pixelify Sans"', '600 16px "Pixelify Sans"', '700 16px "Pixelify Sans"', '24px "Jacquard 12"', '48px "Jacquard 24"', '12px "Silkscreen"'].map((f) => document.fonts.load(f)),
).catch(() => undefined);

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  dom: { createContainer: true }, // real <input>s for account forms (AccountScene)
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: Palette.ink,
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { debug: false } },
  callbacks: { postBoot: () => document.getElementById('boot')?.remove() },
  scene: [BootScene, MainMenuScene, CharacterCreateScene, HudV2Scene, PauseScene, DeathScene, SettingsScene, AccountScene, LoadScene, RealmsScene, FriendsScene, PeopleScene, CreditsScene, ...v2Scenes],
});

// Video › Pixel-perfect: integer zoom (crisp pixels, borders), falling back to FIT when the window is smaller than 1×.
function applyPixelPerfect(): void {
  const on = Settings.get().pixelPerfect;
  const z = Math.floor(Math.min(window.innerWidth / GAME_WIDTH, window.innerHeight / GAME_HEIGHT));
  const integer = on && z >= 1;
  game.scale.scaleMode = integer ? Phaser.Scale.NONE : Phaser.Scale.FIT;
  game.scale.setZoom(integer ? z : 1);
  game.scale.refresh();
}
bus.on('settings:changed', ({ key }) => { if (key === 'pixelPerfect' || key === 'all') applyPixelPerfect(); });
window.addEventListener('resize', () => { if (Settings.get().pixelPerfect) applyPixelPerfect(); });
game.events.once('ready', applyPixelPerfect);
// Video › Fullscreen follows the real state (Esc or the browser can leave fullscreen without the Settings screen)
game.scale.on(Phaser.Scale.Events.ENTER_FULLSCREEN, () => { if (!Settings.get().fullscreen) Settings.set('fullscreen', true); });
game.scale.on(Phaser.Scale.Events.LEAVE_FULLSCREEN, () => { if (Settings.get().fullscreen) Settings.set('fullscreen', false); });

// Procedural music + SFX (src/audio); Phaser's context unlocks on the first click/key.
// Video › Sharp rendering (default on): draw into a 2× buffer for crisp small text (src/render/hidpi.ts).
// ?hidpi=1 / ?hidpi=0 force it for tests.
game.events.once('ready', () => {
  const q = new URLSearchParams(location.search).get('hidpi');
  if (q ? q.startsWith('1') : Settings.get().sharpRendering) installHiDpi(game, 2);
});
game.events.once('ready', () => { installAudio(game); installAutosave(game); installErrorReports(game); });

// Dev handle for headless tests and debugging: window.__game (scene list, input, etc.).
if (import.meta.env.DEV) (window as unknown as { __game: Phaser.Game }).__game = game;

// The fixed-step simulation (src/net/SimLoop.ts) is driven by Phaser's global step, independent of any scene.
game.events.on('step', (_time: number, delta: number) => sim.advance(delta));
