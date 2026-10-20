#!/usr/bin/env node
/**
 * Firestore security rules, tested in the emulator (Java + firebase-tools; no extra npm package). Owner: Claude 6.
 *
 *   node tools/e2e/integrity-rules.mjs                      firestore.rules AND tools/release/firestore.rules.proposed
 *   node tools/e2e/integrity-rules.mjs --rules <file>       one rules file against the wanted behaviour
 *
 * Each case is a REST call to the emulator as some user (unsigned test tokens; seeding uses the emulator's "owner"
 * token, which bypasses rules) with the outcome we WANT. The project id starts with "demo-", which the emulator keeps
 * fully offline: nothing here can touch medivlo. Exit 0 = the rules under test give every wanted outcome.
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, resolve } from 'node:path';
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..');
const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const PROJECT = 'demo-hollowcrown';
const SYNTH = 'players.thehollowcrown.invalid';

// ───────── inner role: runs inside `firebase emulators:exec` (FIRESTORE_EMULATOR_HOST is set) ─────────
if (process.argv.includes('--inner')) {
  const base = `http://${process.env.FIRESTORE_EMULATOR_HOST}/v1/projects/${PROJECT}/databases/(default)/documents`;
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const token = (uid, email) => (uid === 'owner' ? 'owner' : `${b64({ alg: 'none', typ: 'JWT' })}.${b64({
    sub: uid, user_id: uid, aud: PROJECT, iss: `https://securetoken.google.com/${PROJECT}`, iat: now, exp: now + 3600, auth_time: now,
    ...(email ? { email, email_verified: false } : {}), firebase: { sign_in_provider: email ? 'password' : 'anonymous', identities: {} },
  })}.`);
  const enc = (v) => (v === null ? { nullValue: null } : typeof v === 'string' ? { stringValue: v } : typeof v === 'boolean' ? { booleanValue: v }
    : Number.isInteger(v) ? { integerValue: String(v) } : typeof v === 'number' ? { doubleValue: v }
      : Array.isArray(v) ? { arrayValue: { values: v.map(enc) } } : { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } });
  /** as: uid ('owner' = admin, null = signed out), { email } for password accounts */
  async function op(kind, path, as, data, email) {
    const headers = { 'Content-Type': 'application/json', ...(as ? { Authorization: `Bearer ${token(as, email)}` } : {}) };
    const parts = path.split('/'), id = parts.pop(), parent = parts.join('/');
    const body = data ? JSON.stringify({ fields: enc(data).mapValue.fields }) : undefined;
    const url = kind === 'create' ? `${base}/${parent}?documentId=${encodeURIComponent(id)}` : kind === 'update' ? `${base}/${path}?currentDocument.exists=true` : `${base}/${path}`;
    const method = { create: 'POST', update: 'PATCH', set: 'PATCH', get: 'GET', delete: 'DELETE' }[kind];
    const r = await fetch(url, { method, headers, body });
    return r.ok;
  }
  const big = (n) => 'x'.repeat(n);
  const save = (over = {}) => ({ game: 'hollowcrown', json: '{"meta":{"slot":0}}', name: 'Ada', level: 3, classId: 'warden', updatedAt: 1, rev: 1, version: 1, ...over });
  const err = (over = {}) => ({ uid: 'u1', build: '0.9.0', message: 'boom', stack: 'at x', scenes: 'MainMenu', role: 'solo', ua: 'Chrome', at: 1, ...over });
  const report = (over = {}) => ({ reporter: 'u1', target: 'u2', targetName: 'Bo', recent: ['hi', 'bye'], at: 1, ...over });
  const profile = (over = {}) => ({ name: 'Ada', friendCode: 'ABCD-EFGH', kind: 'guest', createdAt: 1, lastSeen: 1, hosting: null, ...over });

  // seed (rules bypassed)
  await op('set', 'usernames/alice', 'owner', { uid: 'alice' });
  await op('set', 'recovery/alice', 'owner', { uid: 'alice', salt: 's', iv: 'i', ct: 'c' });
  await op('set', 'rooms/ROOM01', 'owner', { host: 'hostu', open: true, createdAt: 1 });
  await op('set', 'rooms/ROOM01/peers/guestu', 'owner', { createdAt: 1, nonce: 'n' });
  await op('set', 'users/u2/saves/0', 'owner', save());
  await op('set', 'profiles/u2', 'owner', profile({ name: 'Bo' }));
  await op('set', 'friendCodes/TAKENAAA', 'owner', { uid: 'u2' });

  const cases = [
    // [name, wanted allow?, run]
    ['saves: own slot 0', true, () => op('set', 'users/u1/saves/0', 'u1', save())],
    ['saves: read someone else', false, () => op('get', 'users/u2/saves/0', 'u1')],
    ['saves: write someone else', false, () => op('set', 'users/u2/saves/0', 'u1', save())],
    ['saves: slot 999 (unbounded docs)', false, () => op('set', 'users/u1/saves/999', 'u1', save())],
    ['saves: extra field', false, () => op('set', 'users/u1/saves/1', 'u1', save({ admin: true }))],
    ['saves: signed out', false, () => op('get', 'users/u1/saves/0', null)],
    ['errors: valid report', true, () => op('create', 'clientErrors/e1', 'u1', err())],
    ['errors: as someone else', false, () => op('create', 'clientErrors/e2', 'u1', err({ uid: 'u2' }))],
    ['errors: 100 KB user agent', false, () => op('create', 'clientErrors/e3', 'u1', err({ ua: big(100_000) }))],
    ['errors: read', false, () => op('get', 'clientErrors/e1', 'u1')],
    ['reports: valid', true, () => op('create', 'reports/r1', 'u1', report())],
    ['reports: 11 lines', false, () => op('create', 'reports/r2', 'u1', report({ recent: Array(11).fill('x') }))],
    ['reports: 50 KB name', false, () => op('create', 'reports/r3', 'u1', report({ targetName: big(50_000) }))],
    ['reports: a 100 KB chat line', false, () => op('create', 'reports/r4', 'u1', report({ recent: [big(100_000)] }))],
    ['reports: read', false, () => op('get', 'reports/r1', 'u1')],
    ['profiles: own', true, () => op('set', 'profiles/u1', 'u1', profile())],
    ['profiles: presence update', true, () => op('update', 'profiles/u1', 'u1', profile({ lastSeen: 5, hosting: 'ABCDEF' }))],
    ['profiles: someone else', false, () => op('set', 'profiles/u2', 'u1', profile())],
    ['profiles: 5,000-char name', false, () => op('set', 'profiles/u1', 'u1', profile({ name: big(5000) }))],
    ['profiles: made-up field', false, () => op('set', 'profiles/u1', 'u1', profile({ admin: true }))],
    ['profiles: read when signed in', true, () => op('get', 'profiles/u2', 'u1')],
    ['profiles: read signed out', false, () => op('get', 'profiles/u2', null)],
    ['friends: own list', true, () => op('set', 'profiles/u1/friends/u2', 'u1', { name: 'Bo', addedAt: 1 })],
    ["friends: read someone's list", false, () => op('get', 'profiles/u1/friends/u2', 'u2')],
    ['friend codes: claim own', true, () => op('create', 'friendCodes/NEWCODE1', 'u1', { uid: 'u1' })],
    ['friend codes: claim for someone else', false, () => op('create', 'friendCodes/NEWCODE2', 'u1', { uid: 'u2' })],
    ['friend codes: take over an existing code', false, () => op('update', 'friendCodes/TAKENAAA', 'u1', { uid: 'u1' })],
    ['usernames: claim with the matching account', true, () => op('create', 'usernames/carol', 'carol', { uid: 'carol' }, `carol@${SYNTH}`)],
    ['usernames: a guest squats a name', false, () => op('create', 'usernames/dave', 'u1', { uid: 'u1' })],
    ["usernames: another account's name", false, () => op('create', 'usernames/erin', 'u1', { uid: 'u1' }, `frank@${SYNTH}`)],
    ['recovery: owner updates own vault', true, () => op('update', 'recovery/alice', 'alice', { uid: 'alice', salt: 's2', iv: 'i2', ct: 'c2' }, `alice@${SYNTH}`)],
    ["recovery: replace someone's vault", false, () => op('update', 'recovery/alice', 'u1', { uid: 'u1', salt: 's', iv: 'i', ct: 'c' })],
    ['recovery: 100 KB ciphertext', false, () => op('update', 'recovery/alice', 'alice', { uid: 'alice', salt: 's', iv: 'i', ct: big(100_000) }, `alice@${SYNTH}`)],
    ['rooms: host opens a room', true, () => op('create', 'rooms/ROOM02', 'u1', { host: 'u1', open: true, createdAt: 1 })],
    ["rooms: take over someone's room", false, () => op('set', 'rooms/ROOM01', 'u1', { host: 'u1', open: true, createdAt: 1 })],
    ['rooms: anyone signed in can look one up', true, () => op('get', 'rooms/ROOM01', 'u1')],
    ['peers: a guest knocks', true, () => op('create', 'rooms/ROOM01/peers/u1', 'u1', { createdAt: 1, nonce: 'abc' })],
    ['peers: knock as someone else', false, () => op('create', 'rooms/ROOM01/peers/u3', 'u1', { createdAt: 1 })],
    ["peers: read another guest's knock", false, () => op('get', 'rooms/ROOM01/peers/guestu', 'u1')],
    ['peers: the host reads a knock', true, () => op('get', 'rooms/ROOM01/peers/guestu', 'hostu')],
    ['msgs: guest sends an offer', true, () => op('create', 'rooms/ROOM01/peers/guestu/msgs/m1', 'guestu', { from: 'guest', m: '{"t":"offer"}', ts: 1 })],
    ['msgs: guest pretends to be the host', false, () => op('create', 'rooms/ROOM01/peers/guestu/msgs/m2', 'guestu', { from: 'host', m: '{}', ts: 1 })],
    ['msgs: host answers', true, () => op('create', 'rooms/ROOM01/peers/guestu/msgs/m3', 'hostu', { from: 'host', m: '{"t":"answer"}', ts: 1 })],
    ["msgs: a stranger writes into someone's knock", false, () => op('create', 'rooms/ROOM01/peers/guestu/msgs/m4', 'u1', { from: 'guest', m: '{}', ts: 1 })],
    ["msgs: 200 KB stuffed into a host's room", false, () => op('create', 'rooms/ROOM01/peers/guestu/msgs/m5', 'guestu', { from: 'guest', m: big(200_000), ts: 1 })],
    ['anything else: denied', false, () => op('set', 'admin/config', 'u1', { x: 1 })],
  ];
  const results = [];
  for (const [name, want, run] of cases) { let got; try { got = await run(); } catch (e) { got = `error ${e.message}`; } results.push({ name, want, got }); }
  writeFileSync(arg('out', join(root, 'tools/e2e/out/integrity/rules-result.json')), JSON.stringify(results));
  process.exit(0);
}

// ───────── client role: the game's real Firebase code (real SDK) against the auth + Firestore emulators ─────────
if (process.argv.includes('--client-inner')) {
  globalThis.localStorage = { s: {}, getItem(k) { return this.s[k] ?? null; }, setItem(k, v) { this.s[k] = String(v); }, removeItem(k) { delete this.s[k]; } };
  globalThis.addEventListener ??= () => {}; // friends.ts listens for pagehide
  const bundle = arg('bundle', '');
  const { run } = await import(`file:///${bundle.replace(/\\/g, '/')}`);
  const results = await run(Number(arg('auth', 0)), Number(arg('fs', 0)));
  writeFileSync(arg('out', ''), JSON.stringify(results));
  process.exit(0);
}

// ───────── outer role: start the emulator with a rules file, run the cases inside it ─────────
const outDir = join(root, 'tools/e2e/out/integrity');
mkdirSync(outDir, { recursive: true });
function runRules(rulesFile, tag) {
  const cfg = join(outDir, `firebase.rules-${tag}.json`);
  // the CLI only takes a rules file inside the config's directory: test a copy
  copyFileSync(rulesFile, join(outDir, `rules-${tag}.rules`));
  writeFileSync(cfg, JSON.stringify({ firestore: { rules: `rules-${tag}.rules` },
    emulators: { firestore: { port: 8181 + (tag === 'b' ? 1 : 0) }, hub: { port: 4410 + (tag === 'b' ? 1 : 0) }, logging: { port: 4510 + (tag === 'b' ? 1 : 0) }, ui: { enabled: false } } }));
  const resultFile = join(outDir, `rules-result-${tag}.json`);
  const inner = `node "${fileURLToPath(import.meta.url)}" --inner --out "${resultFile}"`;
  return new Promise((resolveRun) => {
    const p = spawn('firebase', ['emulators:exec', '--only', 'firestore', '--project', PROJECT, '--config', `"${cfg}"`, `"${inner.replace(/"/g, '\\"')}"`], { cwd: outDir, shell: true, stdio: ['ignore', 'pipe', 'pipe'] }); // emulator logs (firestore-debug.log…) land in out/
    let log = ''; p.stdout.on('data', (d) => (log += d)); p.stderr.on('data', (d) => (log += d));
    p.on('exit', async (code) => {
      const b = tag === 'b' ? 1 : 0;
      await freePorts([8181 + b, 4410 + b, 4510 + b]);
      try { resolveRun({ ok: code === 0, results: JSON.parse((await import('node:fs')).readFileSync(resultFile, 'utf8')) }); }
      catch { resolveRun({ ok: false, results: null, log: log.slice(-1500) }); }
    });
  });
}

/** The real client flows under one rules file (auth + Firestore emulators). */
async function runClient(rulesFile, tag) {
  const bundle = join(outDir, 'rules-client.mjs');
  const { build } = await import('esbuild');
  await build({
    entryPoints: [join(here, 'integrity', 'rules-client-entry.ts')], bundle: true, platform: 'node', format: 'esm', outfile: bundle,
    tsconfig: join(root, 'tsconfig.json'), logLevel: 'error', external: ['firebase', 'firebase/*', '@firebase/*'],
    define: { 'import.meta.env': JSON.stringify({ DEV: false, VITE_FIREBASE_API_KEY: 'demo-key', VITE_FIREBASE_PROJECT_ID: PROJECT, VITE_FIREBASE_AUTH_DOMAIN: `${PROJECT}.firebaseapp.com`, VITE_FIREBASE_APP_ID: 'demo-app' }) },
  });
  const ports = { auth: 9199 + (tag === 'b' ? 1 : 0), fs: 8183 + (tag === 'b' ? 1 : 0) };
  const cfg = join(outDir, `firebase.client-${tag}.json`);
  copyFileSync(rulesFile, join(outDir, `client-${tag}.rules`));
  writeFileSync(cfg, JSON.stringify({ firestore: { rules: `client-${tag}.rules` }, emulators: { auth: { port: ports.auth }, firestore: { port: ports.fs }, hub: { port: 4420 + (tag === 'b' ? 1 : 0) }, logging: { port: 4520 + (tag === 'b' ? 1 : 0) }, ui: { enabled: false } } }));
  const resultFile = join(outDir, `client-result-${tag}.json`);
  const inner = `node "${fileURLToPath(import.meta.url)}" --client-inner --bundle "${bundle}" --auth ${ports.auth} --fs ${ports.fs} --out "${resultFile}"`;
  return new Promise((done) => {
    const p = spawn('firebase', ['emulators:exec', '--only', 'auth,firestore', '--project', PROJECT, '--config', `"${cfg}"`, `"${inner.replace(/"/g, '\\"')}"`], { cwd: outDir, shell: true, stdio: ['ignore', 'pipe', 'pipe'] }); // emulator logs (firestore-debug.log…) land in out/
    let log = ''; p.stdout.on('data', (d) => (log += d)); p.stderr.on('data', (d) => (log += d));
    p.on('exit', async () => {
      await freePorts([ports.auth, ports.fs, 4420 + (tag === 'b' ? 1 : 0), 4520 + (tag === 'b' ? 1 : 0)]);
      try { done(JSON.parse((await import('node:fs')).readFileSync(resultFile, 'utf8'))); } catch { done({ error: log.slice(-1500) }); }
    });
  });
}

/**
 * On Windows `emulators:exec` exits but can leave its Java emulator running: stop whatever still listens on OUR
 * emulator ports (never anything else's).
 */
async function freePorts(ports) {
  const { execFileSync } = await import('node:child_process');
  for (const port of ports) {
    try {
      if (process.platform === 'win32') {
        const pids = new Set(execFileSync('netstat', ['-ano']).toString().split('\n')
          .filter((l) => /LISTENING/.test(l) && new RegExp(`:${port}\\s`).test(l)).map((l) => l.trim().split(/\s+/).pop()));
        for (const pid of pids) if (pid && pid !== '0') execFileSync('taskkill', ['/PID', pid, '/F'], { stdio: 'ignore' });
      } else {
        for (const pid of execFileSync('lsof', ['-ti', `tcp:${port}`]).toString().split('\n').filter(Boolean)) process.kill(Number(pid), 'SIGKILL');
      }
    } catch { /* nothing listening */ }
  }
}

const single = arg('rules', null);
const files = single ? [[resolve(single), 'a']] : [[join(root, 'firestore.rules'), 'a'], [join(root, 'tools/release/firestore.rules.proposed'), 'b']];
const runs = [];
for (const [f, tag] of files) {
  const r = await runRules(f, tag);
  if (!r.results) { console.log(`FAIL  emulator run for ${relative(root, f)}\n${r.log}`); process.exit(1); }
  runs.push({ file: relative(root, f).replace(/\\/g, '/'), results: r.results });
}
const yn = (v) => (v === true ? 'allow' : v === false ? 'deny ' : String(v));
console.log(`${'case'.padEnd(52)} want   ${runs.map((r) => r.file.split('/').pop().padEnd(24)).join(' ')}`);
for (let i = 0; i < runs[0].results.length; i++) {
  const { name, want } = runs[0].results[i];
  console.log(`${name.padEnd(52)} ${yn(want)}  ${runs.map((r) => `${r.results[i].got === want ? '  ' : '✗ '}${yn(r.results[i].got)}`.padEnd(24)).join(' ')}`);
}
const judged = runs.at(-1);
const wrong = judged.results.filter((x) => x.got !== x.want);
for (const r of runs.slice(0, -1)) {
  const gaps = r.results.filter((x) => x.got !== x.want);
  console.log(`\ninfo: ${r.file}: ${gaps.length} case(s) differ from the wanted rules: ${gaps.map((g) => g.name).join('; ')}`);
}
// the game's own writes must still work under the rules being judged (and, for reference, under today's)
let clientBroken = 0;
for (const [f, tag] of files) {
  const r = await runClient(f, tag);
  const name = relative(root, f).replace(/\\/g, '/');
  if (!Array.isArray(r)) { console.log(`\nFAIL  client flows under ${name}: emulator run failed\n${r.error}`); if (f === files.at(-1)[0]) clientBroken++; continue; }
  const bad = r.filter((x) => !x.ok);
  console.log(`\nclient flows under ${name}: ${r.length - bad.length}/${r.length} work${bad.length ? `; BROKEN: ${bad.map((b) => `${b.name} (${b.detail})`).join('; ')}` : ''}`);
  if (f === files.at(-1)[0]) clientBroken += bad.length;
}
if (clientBroken) wrong.push({ name: `${clientBroken} real client flow(s) broken` });
console.log(wrong.length ? `\nintegrity-rules: ${judged.file} FAILS ${wrong.length}: ${wrong.map((w) => w.name).join('; ')}` : `\nintegrity-rules: ${judged.file} ALL PASS (${judged.results.length} cases)`);
process.exit(wrong.length ? 1 : 0);
