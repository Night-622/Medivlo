# The Hollow Crown: setup and launch runbook

Everything the game needs that only the project owner can do (billing, console switches, CLI logins).
Steps 1–5 can happen any time; they don't change the live site. **Step 6 is the launch**, which per the
release rule happens only once all 24 campaigns are finished. Until then medival-game-mk.web.app keeps
serving the old game.

Firebase project for The Hollow Crown: **`medivlo`** (`.firebaserc` default; site medivlo.web.app). The old Medival game stays on `medival-game-mk` (alias `old`). Region for the realm server: `australia-southeast1`.

---

## 1. Turn on sign-in methods (Firebase console, 2 min). DONE 2026-10-20 (Email/Password + Anonymous verified)
Console → **Authentication → Sign-in method**:
- **Email/Password**: Enable. Leave "Email link" off. Used by both email accounts and username accounts.
- **Anonymous**: Enable. Used for guest play, co-op signalling and saves for players who haven't signed up.

Then go to **Authentication → Settings → Authorized domains** and check that `medivlo.web.app` and `localhost` are listed.

## 2. Blaze plan + $10 budget alert (5 min)
Console → ⚙ **Usage and billing → Details & settings → Modify plan → Blaze**, and attach a billing account.
Then **Google Cloud console → Billing → Budgets & alerts → Create budget**:
- Scope: project `medivlo`.
- Amount: **$10** per month.
- Alerts at 50%, 90% and 100% (email to you).

The realm server scales to zero when nobody plays. Firestore and Hosting stay inside the free tier at our size.

## 3. Deploy the Firestore rules (1 command). DONE 2026-10-20 by Claude 1
They're backward compatible with the old live game (its `users/{uid}/saves` access is unchanged).
```bash
cd ~/Desktop/Medival
firebase deploy --only firestore:rules
```
What's new in the rules:
- Accounts: `usernames`, `recovery` (owner-only writes), `profiles` + `friends`, `friendCodes`.
- Co-op signalling: `rooms`.
- Chat `reports` (create-only).

## 4. Install the Google Cloud CLI (once). DONE 2026-10-20 on the home PC
On Windows (cmd), the CLI is already installed and logged in; its default project is another one, so every
command names `--project medivlo` instead of changing the default:
```
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com --project medivlo
```
New projects need the build service account to be allowed to build (the first deploy fails with PERMISSION_DENIED
on `…-compute@developer.gserviceaccount.com` otherwise):
```
gcloud projects add-iam-policy-binding medivlo --member=serviceAccount:265149536784-compute@developer.gserviceaccount.com --role=roles/cloudbuild.builds.builder
```
Mac (original):
```bash
brew install --cask google-cloud-sdk
gcloud auth login
gcloud config set project medivlo
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

## 5. Deploy the public-realm server (Cloud Run). DONE 2026-10-20
Live: **https://hollow-crown-realms-265149536784.australia-southeast1.run.app** (/health ok, /realms lists 4; a real
anonymous Firebase token joins and gets snapshots). The URL is in `.env.production` (committed; production builds
only, so dev servers and tests keep the local realm server on :8080).
Redeploy after server changes (Windows cmd, from the project folder):
```
node server\build.mjs
gcloud run deploy hollow-crown-realms --source dist-server --region australia-southeast1 --project medivlo --set-env-vars FIREBASE_PROJECT_ID=medivlo --min-instances 0 --max-instances 2 --concurrency 64 --memory 1Gi --cpu 1 --timeout 3600 --session-affinity --allow-unauthenticated
```
Mac (original):
```bash
cd ~/Desktop/Medival
node server/build.mjs                    # writes a self-contained dist-server/ (bundle + Dockerfile + package.json)
gcloud run deploy hollow-crown-realms --source dist-server --region australia-southeast1 \
  --set-env-vars FIREBASE_PROJECT_ID=medivlo \
  --min-instances 0 --max-instances 2 --concurrency 64 --memory 1Gi --cpu 1 \
  --timeout 3600 --session-affinity --allow-unauthenticated
```
The service URL goes in `.env.production` (not `.env.local`, which dev servers read too):
```
VITE_REALM_SERVER=https://hollow-crown-realms-xxxx-ts.a.run.app
```
Check it: `curl https://…/health` should return `ok`, and `curl https://…/realms` should list 4 realms.

Notes:
- `--timeout 3600` keeps a WebSocket open for up to 1 h. The client returns to the title with "Disconnected from the realm" if it drops.
- `--max-instances 2` caps cost. Each instance hosts all 4 realms (8 players each).
- Never set `DEV_AUTH` in production. Players authenticate with their Firebase ID token.

## 6. LAUNCH (only when all 24 campaigns are done)
```bash
cd <path>/Medival
node tools/release/predeploy-check.mjs                  # required before EVERY hosting deploy, test or launch (below)
npm run build
HOLLOW_CROWN_RELEASE=1 firebase deploy --only hosting   # the flag is required: a predeploy guard blocks hosting deploys before launch
mkdir -p ../hc-maps/$(git rev-parse --short HEAD) && cp dist/assets/*.map ../hc-maps/$(git rev-parse --short HEAD)/   # keep this build's source maps (never deployed) for error triage
```
- **Every deploy is tested first (the user's rule, 2026-10-20).** `predeploy-check.mjs` runs 51 suites, about 30–40 min:
  the HUD, enemy and player hitboxes, every feature (spells, dash, potions, skill tree, gear and sets, legendaries,
  shops, Runeforge, story, co-op, public realms) and the production build. The hosting guard refuses the deploy unless
  that run passed for the exact code being deployed: any later edit means running it again. `--list` shows the suites.
- Old saves are wiped automatically: the new game deletes old local Medival saves (`medival.save.N`) on boot, ignores old cloud saves (they have no `game: 'hollowcrown'` tag), and overwrites them with the first new save in that slot. Nothing to run.
- After launch, open the site in a private window: title → New Game → play; Public Realms lists 4 realms; Account → create a username account (the recovery code is shown once).

---

### Local development
```bash
npm run dev                                           # game on http://localhost:5173
node server/build.mjs && DEV_AUTH=1 node dist-server/main.mjs   # realms on :8080 (dev tokens accepted)
```
Tests: see `tools/e2e/README.md`. Headless Chrome runs are serialised machine-wide by `tools/e2e/chrome-lock.mjs`.
