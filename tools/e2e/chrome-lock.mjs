// Machine-wide mutex for headless Chrome e2e runs: only one headless Chrome may run at a time across every agent,
// checkout and worktree; others wait their turn. The lock is a directory in the user's home folder holding the
// owner's pid; stale locks (dead pid or > 20 min) are broken.
//   import { acquireChrome } from './chrome-lock.mjs';
//   const release = await acquireChrome('my-test');   … run Chrome …   release();
import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

// Chrome binary for every e2e script: $CHROME, else the platform's default install path.
export const CHROME_PATH = process.env.CHROME ?? {
  win32: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
}[process.platform] ?? '/usr/bin/google-chrome';

// One lock per user, shared by every checkout and worktree (it used to live in <repo>/tools/e2e, so a deploy
// worktree and the main tree each had their own and two Chromes could run). $CHROME_LOCK_DIR overrides.
const LOCK = process.env.CHROME_LOCK_DIR ?? join(homedir(), '.hollow-crown-chrome-lock');
// The pre-deploy check reserves Chrome for its whole run: while the reservation's owner pid is alive, only processes
// started by the check (HC_PREDEPLOY=1) may take the lock, so a deploy isn't starved by other agents' browser runs.
export const RESERVE = `${LOCK}.reserve`;
function reservedByOther() {
  if (process.env.HC_PREDEPLOY === '1') return false;
  try { const pid = Number(readFileSync(RESERVE, 'utf8').split(' ')[0]); if (pid && alive(pid)) return true; rmSync(RESERVE, { force: true }); } catch { /* none */ }
  return false;
}
/** Reserve Chrome for this process (the pre-deploy check); returns the release function. */
export function reserveChrome(label = 'predeploy') {
  writeFileSync(RESERVE, `${process.pid} ${label} ${new Date().toISOString()}`);
  return () => { try { if (readFileSync(RESERVE, 'utf8').startsWith(`${process.pid} `)) rmSync(RESERVE, { force: true }); } catch { /* gone */ } };
}
const STALE_MS = 20 * 60_000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function alive(pid) { try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } }

function breakIfStale() {
  try {
    const age = Date.now() - statSync(LOCK).mtimeMs;
    const pid = Number(readFileSync(join(LOCK, 'owner'), 'utf8').split(' ')[0]);
    if (age > STALE_MS || !pid || !alive(pid)) rmSync(LOCK, { recursive: true, force: true });
  } catch { /* lock vanished or owner file not written yet */ }
}

export async function acquireChrome(label = 'e2e', maxWaitMs = 45 * 60_000) {
  if (process.env.CHROME_LOCK === '0') return () => undefined;
  const t0 = Date.now();
  let told = false;
  for (;;) {
    try {
      if (reservedByOther()) throw new Error('reserved');
      mkdirSync(LOCK);
      writeFileSync(join(LOCK, 'owner'), `${process.pid} ${label} ${new Date().toISOString()}`);
      break;
    } catch {
      breakIfStale();
      if (!told) { told = true; try { console.log(`[chrome-lock] waiting for ${readFileSync(join(LOCK, 'owner'), 'utf8').trim()}`); } catch { /* */ } }
      if (Date.now() - t0 > maxWaitMs) throw new Error('[chrome-lock] timed out waiting for another e2e run');
      await sleep(2000);
    }
  }
  let done = false;
  const release = () => { if (done) return; done = true; try { rmSync(LOCK, { recursive: true, force: true }); } catch { /* */ } };
  process.once('exit', release);
  for (const sig of ['SIGINT', 'SIGTERM']) process.once(sig, () => { release(); process.exit(130); });
  return release;
}
