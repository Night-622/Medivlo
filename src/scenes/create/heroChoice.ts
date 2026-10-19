/**
 * Character-creation state and MV helpers (handoff › Characters). Owner: Claude 1.
 * A HeroChoice is everything the player picks; heroSprite() turns it into an MV frame name.
 */
import { mv } from '@/art';

export interface HeroLookV2 {
  skin: number; hair: number; hc: number; eyes: number; brows: number; ec: number; mouth: number; mark: number; body: 0 | 1;
}
export interface HeroOutfit { dye: number; headw: number; cape: number; neck: number; face: number; extra: number }
export interface HeroChoice { classId: string; name: string; look: HeroLookV2; outfit: HeroOutfit }

interface MVLook {
  skin: string[]; hair: string[]; hc: string[]; eyes: string[]; ec: string[]; mouth: string[]; mark: string[]; brows?: string[];
  SKINS: [string, string][]; HAIRC: [string, string][]; EYEC: [string, string][];
}
interface MVGear {
  kitOf(cls: string): { cape: number[]; neck: number[]; face: number[]; extra: number[]; alt: string };
  ACC_N: Record<'cape' | 'neck' | 'face' | 'extra', string[]>;
  outfitNames(cls: string): string[];
}
interface MVHero { look?: Partial<HeroLookV2>; school?: string; name?: string; npc?: boolean }

export const LOOK = (): MVLook => mv().LOOK as unknown as MVLook;
export const GEAR = (): MVGear => mv().GEAR as unknown as MVGear;
export const HERO = (id: string): MVHero => ((mv().HERO as Record<string, MVHero>)[id] ?? {});

/** Class default look (handoff MV.HERO[id].look); male defaults to brow style 2. */
export function defaultLook(classId: string, body?: 0 | 1): HeroLookV2 {
  const d = HERO(classId).look ?? {};
  const b = (body ?? d.body ?? 0) as 0 | 1;
  return { skin: d.skin ?? 1, hair: d.hair ?? 0, hc: d.hc ?? 0, eyes: d.eyes ?? 0, ec: d.ec ?? 0, mouth: d.mouth ?? 0, mark: d.mark ?? 0, body: b, brows: d.brows ?? (b === 1 ? 2 : 0) };
}

export const defaultOutfit = (): HeroOutfit => ({ dye: 0, headw: 0, cape: 0, neck: 0, face: 0, extra: 0 });

/** MV frame name (same format as the handoff prototype's spriteFor). */
export function heroSprite(classId: string, L: HeroLookV2, O: HeroOutfit, nohat = false): string {
  return `hero:${classId}:${[L.skin, L.hair, L.hc, L.eyes, L.ec, L.mouth, L.mark].join(':')}:${nohat ? 1 : 0}:${L.body}:${L.brows}:` +
    [O.dye, O.headw, O.cape, O.neck, O.face, O.extra, 0, 0, 0, 0, 0].join(':');
}

/** Handoff rule: switching to Male turns Long/Bob/Braids into Tousled; Female drops Stubble/Beard. */
export function applyBodyRules(L: HeroLookV2): HeroLookV2 {
  const names = LOOK().hair, marks = LOOK().mark;
  const out = { ...L };
  if (L.body === 1 && ['Long', 'Bob', 'Braids'].includes(names[L.hair])) out.hair = Math.max(0, names.indexOf('Tousled'));
  if (L.body === 0 && ['Stubble', 'Beard'].includes(marks[L.mark])) out.mark = 0;
  return out;
}

/** Canvas → Phaser texture (cached by MV name). Returns the texture key, or null if MV can't draw it. */
export function heroTexture(scene: Phaser.Scene, name: string, frame = 0): string | null {
  const key = `${name}#${frame}`;
  if (scene.textures.exists(key)) return key;
  const f = mv().frames(name, 'idle')?.[frame] ?? mv().frames(name)?.[0];
  if (!f) return null;
  scene.textures.addCanvas(key, f);
  return key;
}
