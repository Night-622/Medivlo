---
name: no-playthrough-runs
description: "2026-10-20 user decision (via Claude 1): the user does playthrough testing; Claude 2 stops running campaign batches"
metadata:
  node_type: memory
  type: project
  originSessionId: b4d08d02-89a4-42dd-90a5-1d5eaef5bfd9
  modified: 2026-10-19T19:15:15.211Z
---

On 2026-10-20 the user decided to do playthrough testing themselves (relayed by Claude 1). Claude 2 stopped the integrated playthrough rollout across the 24 classes. tools/playthrough stays in the repo as a tool, but campaign runs are no longer Claude 2's job.

**Why:** the user wants Claude 2's time spent building, not measuring.
**How to apply:** don't start playthrough batches (run.sh, batch scripts) unless the user or Claude 1 asks again. Spend the time on PACING world passes (beat spread, encounter density, optional areas), placing Claude 4's helper ids as their lists arrive, and the polish list (worker-thread chunk generation, fresh-terrain hitches). Bugs from the user's own play come through Claude 1. Quick Node checks of world code (validators, reachability audits) are still fine. See [[team-setup]], [[hollow-crown-rebuild]].
