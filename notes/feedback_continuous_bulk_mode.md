---
name: feedback_continuous_bulk_mode
description: "Once a bulk-authoring session's routine + quality are proven, turn it into a SCHEDULED ROUTINE (Claude cron) that runs one batch per firing on a self-computed interval"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 1cc3ab43-43c7-4006-b396-ba7c9e0cb8ab
---

**Superseded 2026-09-06 (Rebecca): see playbook Step 6c.** Autopilots run as cloud routines on her Max plan for every model step (planning, authoring, judging); deterministic stages (expand, render, gates, publish) run on the server as Inngest jobs or scripts; never her laptop, never per-token API calls (the maker-photo check on upload is the one exception). Cross-stitch IS cloud-runnable: the whole ECS pipeline ran four cron firings from the cloud on 6 September; the vision gate and planner move from the API into the routine (`docs/autopilot-prompts/cross-stitch.md`, candidates mode). Needlework's Blender render is the remaining open question. The paragraphs below are the older picture.

Once a bulk-authoring session (cross-stitch, needlework, future pattern crafts) has PROVEN its
routine and its quality is consistently good, Rebecca stops monitoring per-batch and it becomes a
**scheduled routine** — a Claude cron / scheduled cloud agent that runs ONE batch each firing on a
fixed interval, continuously, without her re-firing it. (Confirmed for cross-stitch + needlework
2026-06-30 — both self-adjusting well, e.g. checking whether a piece can be repaired before culling.)

**NOT a within-session loop** (that drifts as context fills) — each firing is a FRESH agent, so quality
never degrades. That part still holds and is how the live routines are built.

(The 2026-06-30 correction that used to sit here — "these routines run LOCALLY on Rebecca's machine",
"cross-stitch MIGHT be cloud-runnable, UNVERIFIED" — is dead. Both cross-stitch routines run in the
cloud on the Max plan and have fired successfully; the crochet routine exists on the same shape. Only
needlework's Blender render is still tied to a local Blender.)

**How the session sets it up (paste-in instruction):**
1. Time a batch of ~10 published gems (from recent batches or run one).
2. Pick the interval = batch time + headroom so two runs never overlap (e.g. ~25-min batch → every
   30 min; ~45 min → every hour).
3. Author a SELF-CONTAINED per-firing prompt as `docs/autopilot-prompts/<category>.md` (a cold fresh
   agent must run it): sync latest (a fresh worktree needs one
   `pnpm install --frozen-lockfile --prefer-offline` for @homemade/db) → read the routine + master list
   + quality bar → run ONE batch (generate
   → gate every render full-size, repair-before-cull → publish → mark master-list done) → one-line
   report → STOP. Bake in the hard rules (full complexity range, ruthless gate, no quality drop).
4. Create the recurring routine (schedule skill / scheduled task) on that interval with that prompt.
   If the session can't create it, it hands back the interval + the prompt and the orchestrator sets it up.
5. It runs one batch per firing until Rebecca pauses/stops it (she controls it via the schedule skill).

Ongoing build-time compute (within the [[feedback_no_api_spend]] carve-out). See [[project_cross_stitch]],
[[project_needlework_signoff]], [[feedback_pattern_complexity_range]].

(Cross-reference note, 2026-09-06: `[[project_cross_stitch]]` and `[[project_needlework_signoff]]` are not in notes/; cross-stitch state is `project/project_cross_stitch_state.md` and there is no needlework note.)
