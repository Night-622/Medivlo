/**
 * Sound director (Claude 1): turns game events and screen state into SFX and music. Installed once from main.ts.
 * Music is chosen 2× a second from what's on screen (title → title theme; world → the space's theme, its combat
 * layer while fighting, the boss layer after a boss phase; death screen → lament) and crossfades on change.
 * SFX follow bus events; world sounds are panned and attenuated relative to the camera. UI clicks/hovers are global.
 */
import Phaser from 'phaser';
import { Game, SceneKeys, Services, bus } from '@/core';
import { dialogueClient } from '@/narrative/client/dialogueClient';
import { initAudio, setDuck } from './engine';
import { sfx, type SfxOpts } from './sfx';
import { DEATH_THEME, TITLE_THEME, playTheme, themeFor } from './music';

export { sfx } from './sfx';
export { playTheme, themeFor } from './music';

let combatUntil = 0;
let bossUntil = 0;

export function installAudio(game: Phaser.Game): void {
  const mgr = game.sound as Phaser.Sound.WebAudioSoundManager;
  if (!mgr || !('context' in mgr) || !mgr.context) return; // audio disabled / unsupported
  initAudio(mgr.context);
  const me = () => Services.tryGet('net')?.localPlayer ?? '';
  const isMe = (id?: string) => !!id && (id === me() || id === `p:${me()}`);

  // world-space → stereo pan + distance gain, relative to the world camera
  const at = (x?: number, y?: number): SfxOpts => {
    const cam = game.scene.isActive(SceneKeys.World) ? game.scene.getScene(SceneKeys.World).cameras.main : null;
    if (!cam || x === undefined || y === undefined) return {};
    const dx = x - cam.midPoint.x, dy = y - cam.midPoint.y;
    const half = cam.width / 2 / cam.zoom;
    const dist = Math.hypot(dx, dy) / half;
    return { pan: Math.max(-0.8, Math.min(0.8, dx / half)), gain: Math.max(0, 1 - dist * 0.6) };
  };

  // ── combat ──
  bus.on('combat:hit', (e) => {
    const near = at(e.x, e.y);
    if (near.gain === 0) return;
    const mine = isMe(e.sourceId) || isMe(e.targetId);
    if (mine) combatUntil = Date.now() + 6000;
    const g = { ...near, gain: (near.gain ?? 1) * (mine ? 1 : 0.55) };
    if (e.kind === 'heal') { sfx('heal', g); return; }
    if (e.kind === 'block') { sfx('block', g); return; }
    if (e.kind === 'miss' || e.kind === 'immune') { sfx('miss', g); return; }
    if (isMe(e.targetId)) sfx('hurt', g);
    else sfx(`hit_${String(e.type ?? 'physical')}`, g) ;
    if (e.crit) sfx('crit', g);
  });
  bus.on('ability:cast', (e) => {
    const pos = isMe(e.casterId) ? {} : at(e.x, e.y);
    if ((pos.gain ?? 1) === 0) return;
    if (e.ability === 'dash') { if (isMe(e.casterId)) sfx('dash'); return; }
    if (e.ability === 'blink') { sfx('dash', { ...pos, pitch: 1.6 }); return; }
    if (e.ability === 'chain') { sfx('hit_storm', at(e.tx, e.ty)); return; }
    if (e.ability === 'hit' || e.ability === 'shatter' || e.ability === 'unmaking') return; // the hits themselves sound
    if (isMe(e.casterId)) sfx('cast', { pitch: 0.9 + Math.random() * 0.2 });
  });
  bus.on('enemy:telegraph', (e) => { const n = at(e.x, e.y); if ((n.gain ?? 1) > 0.4) sfx('telegraph', { ...n, gain: (n.gain ?? 1) * 0.6 }); });
  bus.on('enemy:killed', (e) => {
    if (e.tier === 'boss') { sfx('boss_die'); bossUntil = 0; return; }
    sfx('enemy_die', at(e.x, e.y));
  });
  bus.on('boss:phase', () => { sfx('boss_phase'); bossUntil = Date.now() + 90_000; combatUntil = Date.now() + 6000; });
  bus.on('player:downed', (e) => { if (isMe(e.playerId)) sfx('downed'); });
  bus.on('player:revived', (e) => { if (isMe(e.playerId)) sfx('revive'); });
  bus.on('player:died', (e) => { if (!e.playerId || isMe(e.playerId)) sfx('death'); });

  // ── rewards / progress ──
  bus.on('loot:granted', (e) => {
    if (!isMe(e.playerId)) return;
    if (e.item && /^lg_/.test(e.item)) sfx('rare');
    else if (e.item) sfx('pickup');
    else if (e.gold && e.gold > 0) sfx('coin'); // negative gold = a loss (wipe, theft, purchase)
  });
  bus.on('item:used', (e) => { if (isMe(e.playerId) && /^i_(hp|em|st)/.test(String(e.def))) sfx('potion'); });
  bus.on('player:levelup', (e) => { if (!e.playerId || isMe(e.playerId)) sfx('levelup'); });
  bus.on('quest:started', () => sfx('quest_start'));
  bus.on('quest:completed', () => sfx('quest_done'));
  bus.on('codex:unlocked', () => sfx('codex'));
  bus.on('chest:opened', (e) => { if (isMe(e.playerId)) sfx('door', { pitch: 1.6 }); });
  bus.on('waystone:woken', (e) => { if (isMe(e.playerId)) sfx('waystone'); });
  bus.on('narrative:toast', (e) => { if (e.kind === 'trust') sfx('trust_up'); });
  bus.on('systems:notice', (e) => { if (isMe(e.playerId) && e.kind === 'error') sfx('ui_error'); });
  bus.on('dialogue:node', () => sfx('blip'));
  bus.on('ui:open', () => sfx('ui_open'));
  bus.on('ui:close', () => sfx('ui_close'));
  dialogueClient.subscribe((v) => setDuck(v ? 0.5 : 1));

  // ── UI click / hover, every scene but the world ──
  for (const scene of game.scene.scenes) {
    if (scene.sys.settings.key === SceneKeys.World) continue;
    scene.sys.events.on('create', () => {
      scene.input.on('gameobjectup', (_p: unknown, obj: Phaser.GameObjects.GameObject) => { if (obj.input?.cursor) sfx('ui_click'); });
      scene.input.on('gameobjectover', (_p: unknown, obj: Phaser.GameObjects.GameObject) => { if (obj.input?.cursor) sfx('ui_hover'); });
    });
  }

  // ── music: what's on screen decides ──
  setInterval(() => {
    const active = (k: string) => game.scene.isActive(k);
    if (active(SceneKeys.Death)) { playTheme(DEATH_THEME, 2); return; }
    if (active(SceneKeys.World)) {
      const w = game.scene.getScene(SceneKeys.World) as Phaser.Scene & { space?: string };
      const space = w.space || (Game.hasState ? Game.state.world.location.space : '') || 'concordia';
      const now = Date.now();
      playTheme(themeFor(space, now < bossUntil ? 'boss' : now < combatUntil ? 'combat' : 'explore'), now < combatUntil ? 0.6 : 2);
      return;
    }
    if (active(SceneKeys.MainMenu) || active(SceneKeys.CharacterCreate)) playTheme(TITLE_THEME, 1.5);
  }, 500);
  bus.on('combat:engaged', () => { combatUntil = Date.now() + 8000; });
  bus.on('combat:disengaged', () => { combatUntil = Math.min(combatUntil, Date.now() + 2500); });
}
