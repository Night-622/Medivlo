#!/bin/bash
# Narrative gate (Claude 4): validator + per-class campaign bot, solo and co-op.
#   tools/narrative/check.sh arcanist,reaver [seeds]
# Pass = "LOGIC problems: 0", solo PASS, co-op PASS, audit clean, realm 8/8 and "tsc: clean". [world]/[systems] lines are other owners' pending placements.
set -e
here=$(cd "$(dirname "$0")" && pwd)
cd "$here/../.."
CLASSES=${1:?classes, comma-separated}; SEEDS=${2:-4}
# Team rule (Claude 1): one heavy narrative run at a time machine-wide, since each holds the whole registry and the Mac swaps.
# The lock is a directory; a lock older than 30 minutes is treated as stale.
LOCK=/tmp/medival-narrative-gate.lock
until mkdir "$LOCK" 2>/dev/null; do
  if [ -n "$(find "$LOCK" -maxdepth 0 -mmin +30 2>/dev/null)" ]; then rmdir "$LOCK" 2>/dev/null || true; continue; fi
  echo "(waiting for another narrative gate run to finish)"; sleep 10
done
trap 'rmdir "$LOCK" 2>/dev/null' EXIT
"$here/gen-registry.sh"
V=$(node "$here/build.mjs" "$here/val2.ts" full); node "$V" 2>/dev/null | grep -v '^\[codex\]' | head -40
B=$(node "$here/build.mjs" "$here/campaign-bot.ts" full)
echo "--- solo"; CLASSES=$CLASSES SEEDS=$SEEDS node "$B" 2>/dev/null | grep -v '^\[codex\]'
echo "--- co-op"; COOP=1 CLASSES=$CLASSES SEEDS=$((SEEDS + 2)) node "$B" 2>/dev/null | grep -v '^\[codex\]'
A=$(node "$here/build.mjs" "$here/audit.ts" full); echo "--- audit (style guide)"; CLASSES=$CLASSES node "$A" 2>/dev/null | grep -v '^\[codex\]' | grep -v 'names:'; rm -f "$A"
echo "--- realm server (loads all narrative data as the server does)"; node server/build.mjs >/dev/null 2>&1 && node tools/e2e/realm-server.mjs 2>&1 | tail -1
rm -f "$V" "$B"
# types: only narrative-owned files count here (other owners' work in progress is theirs to fix)
echo "--- tsc (src/data, src/narrative, src/ui/narrative)"
T=$(npx tsc --noEmit -p . 2>&1 | grep -E '^src/(data|narrative|ui/narrative)/' || true)
if [ -z "$T" ]; then echo "tsc: clean"; else echo "$T" | head -20; echo "tsc: $(echo "$T" | wc -l | tr -d ' ') error(s) in narrative files"; fi
