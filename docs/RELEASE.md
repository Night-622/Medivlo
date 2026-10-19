# The Hollow Crown: release checklist

The user's rule is that nothing ships until all 24 campaigns are finished, with no previews. This page defines
"finished" so every agent and the user can check it. Each line is owned by someone and verified by a command or a
screenshot. Deploy steps are in docs/DEPLOY.md.

## 1. Content complete
- [x] 24 campaigns of 60 quests each, Acts I–III and class endings. Narrative gate per school: LOGIC 0, solo + co-op bot PASS (Claude 4, `tools/narrative/check.sh <classes>`)
- [x] Every campaign object placed in the world (validator WORLD unplaced 0) (Claude 2 + Claude 4)
- [x] All creatures, bosses, items and legendaries defined. Every class beats its lair-2, nemesis and Act III boss in the fight sim (Claude 3, `tools/e2e/sim/run.mjs fight campaign`)
- [x] Onboarding (First Steps), contextual hints and 60 loading tips (Claude 4)
- [ ] **Playthrough testing: the USER plays the campaigns** (user's decision, 2026-10-20). The agents build and report; bugs from play come in through Claude 1. The bot harness `tools/playthrough` stays as a tool, with no campaign runs
- [ ] Campaign length feels like 15–20 h when the user plays. The last bot estimate (Ash/Rime Act I 2.6–4.0 est. h) is in docs/PACING.md
- [ ] Level bands hold: Act I ends at L13–14, Act II at L26–28, Act III at L38–40 (Claude 3 tunes from the playthrough XP split)

## 2. Multiplayer
- [x] Co-op in the real world: join by code, guest beside the host, input, chat, party vote (`tools/e2e/coop-world.mjs` 14/14)
- [x] Guest plays the host's story (engine inert on clients; journal mirror) (Claude 4)
- [x] Public realms: 4 realm types on the server; duels end to end (`realm-server.mjs` 8/8, `realm-duel.mjs` 6/6)
- [x] First-time joins need the host in a safe zone. Villages and waystone radii are safe (Claude 2)
- [x] Co-op party vote with two real browsers: guest sees the scene, tied vote resolves to the host (`coop-world.mjs` 14/14)
- [ ] Firebase-backed flows on the real project once the user enables auth: sign up/in (email, username + recovery, guest), friends, presence, join through a friend, Firestore signalling across two machines

## 3. Quality
- [x] Front end: title, character creation, HUD, pause, death, settings, account, friends, load, realms, people, credits, dialogue, journal, codex (`tools/e2e/ui-shots.mjs`)
- [x] New player with real input: creation → playing → autosave (`tools/e2e/new-player.mjs` 11/11)
- [x] Audio: procedural music and SFX
- [x] Autosave, play time, error reports, build stamp
- [x] Crisp small text (sharp rendering, 2× buffer, default on)
- [x] Production build boots and plays (vite preview smoke); vendor chunks cached across updates
- [x] Worker-thread chunk generation (Claude 2)
- [ ] Rare ~100 ms hitches on fresh terrain (polish list, STATUS.md)
- [ ] Browser check on a normal desktop (Chrome, Firefox, Safari, Edge) at 1080p and 1440p, outside the headless harness

## 4. Ship (user + Claude 1, docs/DEPLOY.md)
- [ ] Auth providers on (Email/Password, Anonymous); Blaze plan + $10 budget alert
- [x] `firebase deploy --only firestore:rules` (deployed to medivlo 2026-10-20; redeploy if the rules change)
- [ ] Realm server on Cloud Run; `VITE_REALM_SERVER` set
- [ ] `npm run build && HOLLOW_CROWN_RELEASE=1 firebase deploy --only hosting` (the guard in tools/release/guard.mjs blocks hosting deploys without the flag)
- [ ] Post-deploy smoke test on the live URL: title → New Game → play 5 min; Public Realms lists 4; sign up with a username (recovery code shown); invite a friend from another machine
