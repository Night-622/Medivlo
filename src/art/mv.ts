/**
 * Bridge to the Claude Design art libraries (public/art/mv/*.js, loaded as classic scripts in index.html).
 * They draw every sprite in code onto canvases and expose `window.MV`. Owner: Claude 1.
 * Source of truth for formats: "Medieval Browser Action RPG/HANDOFF.md".
 */

/** Minimal typed surface of window.MV used by the game. Extend as needed (keep it honest). */
export interface MVLib {
  /** Frames for a sprite name. Heroes: "hero:<class>:<skin>:<hair>:<hc>:<eyes>:<ec>:<expr>:<mark>:<nohat>:<body>". */
  frames(name: string, anim?: 'idle' | 'walk' | ''): HTMLCanvasElement[] | null;
  wordmark(text: string): HTMLCanvasElement;
  nine(key: string): HTMLCanvasElement;
  flash(c: HTMLCanvasElement, color?: string): HTMLCanvasElement;
  list: { heroes: string[]; npcs: string[]; chars: string[]; icons: string[]; props: string[]; ui: string[] };
  fontsReady: Promise<unknown>;
  HERO: Record<string, unknown>;
  WORLD?: unknown;
  GEAR?: unknown;
  LEGENDARY?: unknown;
  [k: string]: unknown;
}

declare global {
  interface Window { MV?: MVLib }
}

const EXTENSIONS = ['tiles.js', 'gear.js', 'bestiary.js', 'map.js', 'realms.js', 'legendary.js'];
const seen = new Set<string>();
if (typeof window !== 'undefined') {
  window.addEventListener('mvready', (e) => { const d = (e as CustomEvent<string>).detail; if (d) seen.add(d); });
}

/** Resolves once art.js and every extension library have booted (or after `timeoutMs`, with whatever loaded). */
export function mvReady(timeoutMs = 15000): Promise<MVLib> {
  const start = performance.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const mv = window.MV;
      const allExt = EXTENSIONS.every((f) => seen.has(f)) || !!(mv && mv.LEGENDARY && mv.WORLD && mv.GEAR);
      if (mv && allExt) return resolve(mv);
      if (performance.now() - start > timeoutMs) return mv ? resolve(mv) : reject(new Error('art libraries (window.MV) failed to load'));
      setTimeout(check, 25);
    };
    check();
  });
}

export function mv(): MVLib {
  if (!window.MV) throw new Error('window.MV not ready; await mvReady() first');
  return window.MV;
}

/** Appearance indices from the handoff hero composer (atlas.heroComposer). */
export interface HeroLook {
  skin: number; hair: number; hc: number; eyes: number; ec: number; mouth: number; mark: number; body: 0 | 1;
  /** 1 hides class headgear */
  nohat?: 0 | 1;
}

/** Equipment/cosmetics shown on the hero (paperdoll). Sets & weapon are 1-based; 0 = none / class default. */
export interface HeroGear {
  brows?: number; dye?: number; headwear?: number; cape?: number; neck?: number; face?: number; extra?: number;
  helmSet?: number; chestSet?: number; handsSet?: number; feetSet?: number; weapon?: number;
}

/**
 * Name string for MV.frames, per atlas.heroComposer.nameFormat:
 * hero:<class>:skin:hair:hairColour:eyes:eyeColour:expression:mark:nohat:body[:brows:dye:headwear:cape:neck:face:extra:helmSet:chestSet:handsSet:feetSet:weapon]
 * Equip rules (handoff): chest replaces class body/back gear, helm replaces headgear, gloves/boots recolour, weapon replaces held items.
 */
export function heroName(classId: string, l: HeroLook, g?: HeroGear): string {
  const base = `hero:${classId}:${l.skin}:${l.hair}:${l.hc}:${l.eyes}:${l.ec}:${l.mouth}:${l.mark}:${l.nohat ?? 0}:${l.body}`;
  if (!g) return base;
  const ext = [g.brows, g.dye, g.headwear, g.cape, g.neck, g.face, g.extra, g.helmSet, g.chestSet, g.handsSet, g.feetSet, g.weapon].map((v) => v ?? 0);
  return `${base}:${ext.join(':')}`;
}
