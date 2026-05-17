# Mindset bulk-002 batch report

**Date:** 2026-05-17
**Session model:** claude-opus-4-7 — scheduled task fired Opus, not Sonnet per `feedback_model_choice.md`. **Verification flag:** the `autopilot-queue` scheduled task's `model: claude-sonnet-4-5` frontmatter is still not being honoured by the runner. Same self-identification pattern as cooking bulk-009 ("Opus-model concession").
**Briefs directory:** `docs/mindset-bulk-002-briefs/` (also archived to `docs/archive/mindset-bulk-002-briefs/`)
**Status on landing:** ⛔ blocked at upload — DB_MIGRATION_PENDING
**Driver:** scheduled task `autopilot-queue` (single-queue round-robin)

---

## What this fire did

Drafted and voice-checked four mindset practices (a small slice sized for
the Opus-model concession the cooking stream has been running). Uploads
failed against Neon prod with `P2022 ColumnNotFound` on
`Tutorial.requiresKiln`. The Prisma migration
`20260625000000_phase_pottery_pipeline_001` (added by commit `27d95cc`
~12 minutes before the fire started) has not yet applied to prod.

Halt signal written:

- `AutopilotHaltSignal { stream: "queue", reason: "DB_MIGRATION_PENDING" }`
  detail names the migration, the in-flight deploy run, and the
  recovery path.

Same shape as the mindset bulk-001 halt 24 hours earlier (then it was
`Category.targetTutorialCount` against the autopilot-status migration;
today it is `Tutorial.requiresKiln` against the pottery migration). The
recovery path is identical — wait for the migration to apply, restore
the archived briefs, and re-run the uploads.

---

## Slice scope

Four practices spanning three sub-categories. Held to four because the
runner fired on Opus (slower per entry) rather than the Sonnet the
scheduled task's frontmatter requests.

| # | Slug | Practice type | Time band | Best time | Targets | Source |
|---|---|---|---|---|---|---|
| 1 | `steady-steady-steady` | AFFIRMATION | THREE_MIN | ANYTIME | MONEY, ABUNDANCE, ANXIETY | MONEY-v2/D4 |
| 2 | `i-am-safe-even-when-the-number-is-small` | AFFIRMATION | THREE_MIN | MORNING | MONEY, ANXIETY, FEAR | MONEY-v2/D2 |
| 3 | `there-is-enough-now` | ENERGY_STATEMENT | THREE_MIN | ANYTIME | MONEY, ABUNDANCE, ANXIETY | MONEY-v2/D2 + Money-Zone/Ch2-5 |
| 4 | `the-hand-on-heart-money-breath` | RITUAL | FIVE_MIN | AS_NEEDED | MONEY, ANXIETY, ABUNDANCE | MONEY-Journal structure + [PD] hand-on-heart anchor |

All four target the early MONEY Phase 1 work (Days 2 and 4). The pilot
batch already covered Day 1 (tapping-for-daily-money-panic anchor,
`i-am-safe-and-steady-with-money-today` energy statement, etc.); this
slice continues the spread into Days 2 and 4 without yet starting on the
TAPPING practices for those days (which are the larger drafts).

---

## Voice-check results

All four cleared voice-check errors. Warning-only false positives on
the RITUAL entry only:

- `the-hand-on-heart-money-breath` — 4× `brand-trademark "Anchor"`
  flagged on the `Anchor` heading and "anchor" usages in
  subtitle/excerpt/sourceNotes. Same false positive bulk-001
  documented: the voice-check rule fires on the somatic / ritual
  /sensory-anchor sense of "anchor" where the brand here is the
  Anchor butter brand. Mindset-category exception is still pending in a
  separate voice-check-CLI worker; out of scope for this stream.

The other three briefs (`steady-steady-steady`,
`i-am-safe-even-when-the-number-is-small`, `there-is-enough-now`) ran
0 errors, 0 warnings.

---

## Upload run summary

| Run | OK | FAIL | Notes |
|---|---|---|---|
| 1 | 0 | 1 | First upload (`steady-steady-steady`) failed P2022 ColumnNotFound on `Tutorial.requiresKiln`. Aborted the remaining 3 uploads to avoid noise — same failure mode. |

The pottery migration adds `requiresKiln` + `requiresWheel` boolean
columns to `Tutorial`. Local Prisma client (regenerated from the
schema in commit 27d95cc which is on this checkout) expects the
columns; prod doesn't have them yet.

---

## Recovery path

Same shape as bulk-001's recovery, documented for the next fire:

1. Deploy run 25995805194 (commit `3734b9d`, currently `in_progress`
   at fire time) deploys the tree through `3734b9d` which includes
   `27d95cc`'s pottery migration. Once that run completes
   successfully, prod has `Tutorial.requiresKiln`.
2. The downstream queued deploys (61386b6 `pending`, 7a09a3b
   `cancelled`) also include the migration if 3734b9d for any
   reason doesn't land it.
3. The next autopilot fire that picks mindset reads this report,
   sees the recovery path, restores the four briefs from
   `docs/archive/mindset-bulk-002-briefs/` into
   `docs/mindset-bulk-002-briefs/` (no-op if already present —
   the originals are kept in place this time), re-runs
   voice-check (should still pass), and uploads them with
   `--status PUBLISHED`.
4. If the recovery fire is the same scheduled task on a later
   tick (autopilot-queue), it will auto-pick mindset again only
   once mindset reaches the head of the round-robin queue. If
   the auto-pick lands a different category, that category runs
   instead, and mindset's recovery happens on the following
   mindset turn.
5. No re-drafting required. The briefs are voice-check-clean.

---

## Quality-drift check

Pass-through. Only the bulk-001 batch report exists for trend
comparison; the drift gate engages once 3 reports exist. This
fire's upload failure was a schema-drift error, not a
voice-quality error — it would not be meaningful as a trend data
point even if comparable.

---

## Patterns to carry forward

1. **Schema-drift halt pattern is reusable across categories.**
   bulk-001 hit this on `Category.targetTutorialCount` 24 hours
   ago; bulk-002 hits it on `Tutorial.requiresKiln`. The pattern
   (P2022 ColumnNotFound → archive briefs → write halt signal
   with `DB_MIGRATION_PENDING` → exit clean) handles the case
   consistently. Recovery is the same shape: wait for the
   migration to apply, then re-upload the archived briefs.
2. **Cross-stream migrations land mid-fire more often than
   expected.** The pottery migration arrived ~12 minutes before
   this fire's pre-flight ran. The pre-flight doesn't know
   about it — Prisma client errors are the only signal.
   Adding a migration-status check to the pre-flight is worth
   considering: `prisma migrate status --schema=...` would tell
   the fire up-front whether any pending migrations exist
   locally that aren't on prod, and the fire could halt
   before drafting (saving the draft work). Out of scope for
   this stream; flagged for a separate worker.
3. **Opus-model concession holds across categories.** Cooking
   bulk-009 ran 3 entries on Opus (small slice concession).
   This fire would have run 4 entries had the upload landed.
   The pattern matches: bulk-authoring on Opus = small slice
   (3-5 entries), not full Sonnet target (15-50 entries).
   Sonnet runs should still aim for 40-50 per the autopilot
   prompt. Until the scheduled-tasks runner honours the
   `model: claude-sonnet-4-5` frontmatter, every fire pays
   the concession. The "model verification" instruction in
   the prompt is what makes this visible — keep it in the
   prompt.

---

## Files

- Briefs (live + archived):
  - `docs/mindset-bulk-002-briefs/steady-steady-steady.json`
  - `docs/mindset-bulk-002-briefs/i-am-safe-even-when-the-number-is-small.json`
  - `docs/mindset-bulk-002-briefs/there-is-enough-now.json`
  - `docs/mindset-bulk-002-briefs/the-hand-on-heart-money-breath.json`
  - Same four mirrored under `docs/archive/mindset-bulk-002-briefs/`
- Halt signal: `AutopilotHaltSignal.id = cmp9z957c0000b8v4g3jui7lv`
  (stream=queue, reason=DB_MIGRATION_PENDING)
- Mindset author prompt: `docs/mindset-author.md` (unmodified, v4)
- Mindset anti-tells: `docs/mindset-anti-tells.md` (unmodified)
- Autopilot prompt: `~/.claude/scheduled-tasks/autopilot-queue/SKILL.md`
- Prior fire: `docs/mindset-bulk-001-report.md`
