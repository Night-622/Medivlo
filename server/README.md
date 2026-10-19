# Public-realm server

Node process that hosts the public realms (up to 8 players each, PvP rules per realm type). Each realm runs the
game's own Phaser-free authority code (world, systems and narrative, via `server/realm-entry.ts` → `dist-server/realm.js`)
inside an isolated `vm` context, ticked at 30 Hz. Players connect over WebSocket with a Firebase ID token.

## Local
```bash
node server/build.mjs                               # → dist-server/ (main.mjs, realm.js, package.json, Dockerfile)
DEV_AUTH=1 node dist-server/main.mjs                # :8080; dev tokens "dev:<uid>:<name>"
node tools/e2e/realm-server.mjs                     # automated check (8 cases)
```
Profiling: `cd dist-server && DEV_AUTH=1 EXIT_AFTER=40000 node --cpu-prof main.mjs`. The server logs
`slow tick N ms` whenever a realm step exceeds 50 ms.

## Deploy
See **docs/DEPLOY.md** step 5: `gcloud run deploy hollow-crown-realms --source dist-server …`.
