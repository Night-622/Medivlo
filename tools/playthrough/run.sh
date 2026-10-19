#!/bin/bash
# Integrated campaign playthrough (Claude 2): one class at a time, under the shared heavy-run lock.
#   tools/playthrough/run.sh warden,arcanist [act=2] [hours=12]      DEBUG=1 for a trace every 5 game minutes
set -e
here=$(cd "$(dirname "$0")" && pwd)
cd "$here/../.."
CLASSES=${1:?classes, comma-separated}; ACT=${2:-2}; HOURS=${3:-12}
# Team rule (Claude 1): one heavy run at a time machine-wide (same lock as the narrative gate).
LOCK=/tmp/medival-narrative-gate.lock
until mkdir "$LOCK" 2>/dev/null; do
  if [ -n "$(find "$LOCK" -maxdepth 0 -mmin +30 2>/dev/null)" ]; then rmdir "$LOCK" 2>/dev/null || true; continue; fi
  echo "(waiting for another heavy run to finish)"; sleep 10
done
trap 'rmdir "$LOCK" 2>/dev/null; rm -f "$B"' EXIT
B=$(node "$here/build.mjs")
for c in ${CLASSES//,/ }; do
  CLASS=$c ACT=$ACT HOURS=$HOURS node "$B" 2>&1 | grep -v '^\[codex\]\|^\[registry\]'
done
