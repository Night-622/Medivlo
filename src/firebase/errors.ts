/**
 * Client error reports (Claude 1): uncaught errors and unhandled rejections go to Firestore `clientErrors`
 * (create-only by the rules; read in the console) so we can see crashes after launch. No personal data: message,
 * top of the stack, build, active scenes, net role. At most 5 per session, duplicates dropped. Off in DEV.
 */
import type Phaser from 'phaser';
import { addDoc, collection } from 'firebase/firestore';
import { Services } from '@/core';
import { isFirebaseConfigured } from './config';
import { ensureUser, firebase } from './app';

const MAX = 5;

export function installErrorReports(game: Phaser.Game): void {
  if (import.meta.env.DEV || !isFirebaseConfigured) return;
  const seen = new Set<string>();
  const report = (message: string, stack: string) => {
    const key = message.slice(0, 120);
    if (seen.size >= MAX || seen.has(key)) return;
    seen.add(key);
    const scenes = game.scene.getScenes(true).map((s) => s.scene.key).join(',');
    void ensureUser().then((u) => addDoc(collection(firebase().db, 'clientErrors'), {
      uid: u.uid, build: __BUILD__, message: message.slice(0, 500), stack: stack.split('\n').slice(0, 8).join('\n').slice(0, 1500),
      scenes, role: Services.tryGet('net')?.role ?? '', ua: navigator.userAgent.slice(0, 160), at: Date.now(),
    })).catch(() => undefined);
  };
  addEventListener('error', (e) => report(String(e.message ?? e.error ?? 'error'), String((e.error as Error | undefined)?.stack ?? '')));
  addEventListener('unhandledrejection', (e) => report(String((e.reason as Error | undefined)?.message ?? e.reason), String((e.reason as Error | undefined)?.stack ?? '')));
}
