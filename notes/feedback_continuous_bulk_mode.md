---
name: feedback_continuous_bulk_mode
description: "Once a bulk-authoring session's routine + quality are proven, turn it into a SCHEDULED ROUTINE (Claude cron) that runs one batch per firing on a self-computed interval"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 1cc3ab43-43c7-4006-b396-ba7c9e0cb8ab
---

Once a bulk-authoring session (cross-stitch, needlework, future pattern crafts) has PROVEN its
routine and its quality is consistently good, Rebecca stops monitoring per-batch and it becomes a
**scheduled routine** — a Claude cron / scheduled cloud agent that runs ONE batch each firing on a
fixed interval, continuously, without her re-firing it. (Confirmed for cross-stitch + needlework
2026-06-30 — both self-adjusting well, e.g. checking whether a piece can be repaired before culling.)

**NOT a within-session loop** (that drifts as context fills) — each firing is a FRESH agent, so quality
never degrades. **CORRECTION 2026-06-30 (orchestrator wrongly said "cloud"; Rebecca caught it from the
routine screenshot):** these routines as set up run LOCALLY on Rebecca's machine — the routine's folder
is her local checkout and needlework renders via her LOCAL Blender (the "a second concurrent Blender
crashes the PC" safety lock proves it). They need her machine ON + Claude running + internet, and they
SKIP firings whenever she's offline (she turns internet off overnight) or the machine is asleep.
Needlework can't trivially go cloud — its loom render needs Blender. Cross-stitch is lighter (pure JS/SVG
chart render, no Blender) and MIGHT be cloud-runnable — UNVERIFIED, do not assert. True-cloud feasibility
+ the machine-load of 8× Blender renders/day (needlework fires every 3h) are OPEN. Don't over-promise cloud.

**How the session sets it up (paste-in instruction):**
1. Time a batch of ~10 published gems (from recent batches or run one).
2. Pick the interval = batch time + headroom so two runs never overlap (e.g. ~25-min batch → every
   30 min; ~45 min → every hour).
3. Author a SELF-CONTAINED per-firing prompt (a cold fresh agent must run it): sync latest (fresh
   worktree needs `pnpm install --frozen-lockfile --prefer-offline` for @homemade/db, or run from the
   main checkout) → read the routine + master list + quality bar → run ONE batch of ~10 gems (generate
   → gate every render full-size, repair-before-cull → publish → mark master-list done) → one-line
   report → STOP. Bake in the hard rules (full complexity range, ruthless gate, no quality drop).
4. Create the recurring routine (schedule skill / scheduled task) on that interval with that prompt.
   If the session can't create it, it hands back the interval + the prompt and the orchestrator sets it up.
5. It runs one batch per firing until Rebecca pauses/stops it (she controls it via the schedule skill).

Ongoing build-time compute (within the [[feedback_no_api_spend]] carve-out). See [[project_cross_stitch]],
[[project_needlework_signoff]], [[feedback_pattern_complexity_range]].
