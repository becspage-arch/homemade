# Homemade — Baking autopilot worker

This prompt is read verbatim by the **baking** scheduled task
(`autopilot-baking-bulk`). Every fire runs through the pre-flight gates
and either skips, halts, or executes one bulk batch end-to-end.

**Model:** Sonnet (bulk authoring) per `feedback_model_choice.md`.

**Repo + memory.** Homemade build. The repo's `CLAUDE.md` and Rebecca's
auto-memory are auto-loaded — read them first. Key references:

- `BUILD_PROGRESS.md` — Phase 8 content pipeline + the Baking bulk-001
  section.
- `docs/baking-author.md` v2 — the baking authoring prompt. **Do not
  modify.** The autopilot reads it as-is.
- `docs/voice-editor-prompt.md` — voice-editor pass.
- `docs/common-issues.md` — cross-category recurring patterns.
- `docs/baking-anti-tells.md` — baking-specific anti-tells.
- `docs/content-backlog.md` — baking + technique backlog (the baking
  bulks pull from the baking sections of this file plus the recipe-
  adjacent baking entries).
- `docs/baking-bulk-*-report.md` — prior baking batch reports.
- `packages/db/scripts/upload-tutorial.ts`, `voice-check.ts`,
  `category-counts.ts`.
- `feedback_no_api_spend.md`, `feedback_worker_handoff_style.md`,
  `feedback_deploy_verification.md`, `feedback_scope_discipline.md`,
  `feedback_schema_all_fields_upfront.md`, `feedback_model_choice.md`.

**Hard scope.** Baking bulk authoring only. No schema changes, no edits
to `docs/baking-author.md`, no new TipTap blocks, no admin / UI work.
If a needed change falls outside this scope, write a halt signal and exit.

**Hand-off style.** `feedback_worker_handoff_style.md`. Plain English,
outcomes first, no banned phrases, no sign-offs.

---

## Pre-flight — run in order, halt-and-exit on the first trigger

Use `TodoWrite` to track the steps. Walk through them top to bottom on
every fire.

### 0. Environment pause

```bash
if [ "${AUTOPILOT_PAUSED:-}" = "true" ]; then
  pnpm --filter @homemade/db exec tsx scripts/write-halt-signal.ts \
    --stream baking --reason ENV_PAUSED \
    --detail "AUTOPILOT_PAUSED=true read at preflight"
  echo "[autopilot] baking — paused via env flag; exiting clean."
  exit 0
fi
```

### 1. No-double-firing check

```bash
git fetch --quiet origin
ACTIVE_BRANCHES=$(git for-each-ref --sort=-committerdate \
  --format='%(refname:short) %(committerdate:iso) %(subject)' refs/remotes/origin/claude/ \
  | head -20)
```

If a `claude/*` branch has commits in the last 2 hours touching
`docs/baking-bulk-*-briefs/` or `docs/baking-bulk-*-report.md`, treat
the previous session as still active:

```bash
pnpm --filter @homemade/db exec tsx scripts/write-halt-signal.ts \
  --stream baking --reason SKIPPED_DOUBLE_FIRE \
  --detail "Detected branch <name> with baking activity within 2h"
echo "[autopilot] baking — previous session still active; exiting clean."
exit 0
```

### 2. Auto-determine batch number

```bash
NEXT_BATCH=$(ls docs/baking-bulk-*-report.md 2>/dev/null \
  | sed -E 's/.*baking-bulk-0*([0-9]+)-report\.md/\1/' \
  | sort -n | tail -1)
NEXT_BATCH=$((NEXT_BATCH + 1))
BATCH_ID=$(printf "%03d" "$NEXT_BATCH")
echo "[autopilot] baking — drafting baking-bulk-$BATCH_ID"
```

New briefs go in `docs/baking-bulk-${BATCH_ID}-briefs/`, report in
`docs/baking-bulk-${BATCH_ID}-report.md`.

### 3. Backlog-drain check

```bash
SKIP_FILE=$(mktemp)
{
  ls docs/baking-anchor-briefs/*.json 2>/dev/null \
    | xargs -n1 basename | sed 's/\.json$//'
  ls docs/baking-pilot-10-briefs/*.json 2>/dev/null \
    | xargs -n1 basename | sed 's/\.json$//'
  ls docs/baking-bulk-*-briefs/*.json 2>/dev/null \
    | xargs -n1 basename | sed 's/\.json$//'
} | sort -u > "$SKIP_FILE"
SKIP_COUNT=$(wc -l < "$SKIP_FILE")
echo "[autopilot] baking — skip list: $SKIP_COUNT slugs"
```

Read the baking sections of `docs/content-backlog.md` plus the baking
backlog entries in `docs/recipe-backlog.md` § Baking, Desserts, Preserves
(baking-adjacent). Derive slugs, count in-scope (not in `$SKIP_FILE`).
If fewer than **50** in-scope candidates remain:

```bash
pnpm --filter @homemade/db exec tsx scripts/write-halt-signal.ts \
  --stream baking --reason BACKLOG_DRAINED \
  --detail "In-scope baking candidates: $REMAINING. Threshold 50."
```

Disable the cron via the ScheduledTasks MCP:

```
mcp__scheduled-tasks__update_scheduled_task
  taskId = "autopilot-baking-bulk"
  enabled = false
```

Exit clean.

### 4. Quality-drift check

Read the last 3 baking batch reports
(`docs/baking-bulk-*-report.md`, highest 3 by N). Pull voice-check error
counts — the report's "Errors encountered and fixed" or "Voice-check
summary" section.

If error count has trended up by more than 50% across the three reports,
skip this fire without disabling the cron:

```bash
pnpm --filter @homemade/db exec tsx scripts/write-halt-signal.ts \
  --stream baking --reason QUALITY_DRIFT \
  --detail "Error counts last 3: $C1, $C2, $C3 — trending up >50%."
echo "[autopilot] baking — quality drift; skipping fire, cron stays on."
exit 0
```

If only one prior baking batch exists (currently true — `baking-bulk-001`),
require 2 future batches before this check is meaningful. Until then,
treat as pass-through, but log a one-line note in the batch report so
Rebecca knows the check wasn't applicable.

### 5. Hard chain cap

Count consecutive autopilot baking batches since the last commit by a
human:

```bash
CHAIN=$(git log --pretty=format:"%an %s" main \
  | awk '
      /(^| )Baking autopilot |baking-bulk-[0-9]+/ { chain++; next }
      { print chain; exit }
    ')
CHAIN=${CHAIN:-0}
```

If chain ≥ 10:

```bash
pnpm --filter @homemade/db exec tsx scripts/write-halt-signal.ts \
  --stream baking --reason HARD_CAP_REACHED \
  --detail "$CHAIN consecutive autopilot baking batches without human intervention."
```

Disable the scheduled task and exit clean.

### 6. Auto-determine slice

Read the sub-category breakdowns from the last 3 batch reports — the
"What landed" table by sub-category (`bread` / `cakes` / `pastries` /
`pies` / `biscuits` / `scones` / `sweets-confectionery` /
`cake-decorating` / `other`).

Pick a slice that **under-represents** the accumulated distribution.
Baking has 9 active sub-categories — try to land 4–6 of them in each
batch, weighted toward the ones with the lowest cumulative counts.

Target spread for a 50-recipe slice:

- 4–6 sub-categories represented, no single sub over ~30% of the batch.
- A real mix of BEGINNER / INTERMEDIATE / ADVANCED — the baking pilot
  ran 3 / 5 / 2 and bulk-001 ran 8 / 31 / 11. Skew toward more
  BEGINNERs (16–20 of 50) so the library has accessible entry points.
- Mix yeasted, enriched, and unyeasted bakes. Mix sponge and butter
  cakes. Mix shortcrust, puff, and choux pastries.

Write down the slice — list of 50 backlog titles, their derived slugs —
before drafting.

---

## Run the batch

Use `TodoWrite` to chunk the run. For each recipe:

1. Read the backlog entry. Look up new ingredient / tool slugs against
   `packages/db/scripts/data/ingredients.ts` and `tools.ts`. Add missing
   entries to the seed files **before** drafting, then reseed
   (`tsx scripts/seed-ingredients.ts`, `tsx scripts/seed-tools.ts`).
   The Baking bulk-001 report flagged tool-slug ordering as a common
   trap — look up exact slugs, never guess.
2. Draft the brief JSON following `docs/baking-author.md` v2. Self-
   critique against the voice rules AND every entry in
   `docs/common-issues.md` AND `docs/baking-anti-tells.md`. Write to
   `docs/baking-bulk-${BATCH_ID}-briefs/<slug>.json`.
   - `categorySlug: "baking"` is required on every brief.
   - `Season` enum must be uppercase (`AUTUMN` / `WINTER` / `SPRING` /
     `SUMMER`).
   - Sub-category slug for confectionery is `sweets-confectionery`,
     not `confectionery`.
   - Em-dash pairs in `sourceNotes` are the leading failure mode —
     rewrite as colons or split sentences. Never two em-dashes in one
     paragraph; never two in one sentence.
   - Populate `techniqueSlugs[]` and `criticalTechniques[]` per
     `docs/tutorial-author.md` § "Technique linking", and wrap the
     technique words in the body with `techniqueLink` marks (link
     falls back to plain text when the technique tutorial isn't
     authored yet — wrap anyway, the link goes live automatically
     once it is).
3. Voice-check:
   `pnpm --filter "@homemade/db" run tutorial:voice-check -- docs/baking-bulk-${BATCH_ID}-briefs/<slug>.json`.
   3-retry cap on errors; drop and log on the 3rd failure.
4. Upload as PUBLISHED:
   `pnpm --filter "@homemade/db" run tutorial:upload -- docs/baking-bulk-${BATCH_ID}-briefs/<slug>.json --status PUBLISHED`.
   3-retry cap on upload failure; drop and log.

Image generation deferred — `hero.localPath` unset.

---

## Close the batch

1. **Write the batch report.** `docs/baking-bulk-${BATCH_ID}-report.md`,
   matching the shape of `docs/baking-bulk-001-report.md`:
   - Header (date, model, briefs directory, status).
   - "What landed" table by sub-category with slugs.
   - Difficulty spread.
   - New ingredient / tool master-table additions.
   - Errors encountered and fixed.
   - Upload run summary (per-run ok/fail).
   - Patterns to carry forward.

2. **Update `docs/baking-anti-tells.md`.** Any pattern that appeared in
   3+ drafts during this batch and isn't already listed — append in the
   right section with `[block]` or `[warn]` severity and the
   How-to-fix line.

3. **Update `docs/common-issues.md`** for any pattern that's cross-
   category (also recurs in cooking or mindset).

4. **Update `BUILD_PROGRESS.md` § "Multi-category fill plan" grid.** Baking
   "Current" cell. Truth source: `pnpm --filter "@homemade/db" run counts`.

5. **Append an "Autopilot — baking bulk-${BATCH_ID}" entry** to BUILD_PROGRESS
   — short, outcomes first.

6. **Commit + push** to main per the standard worker pattern.

---

## Deploy verification (mandatory)

Same block as CLAUDE.md.

```bash
sleep 15
RUN_ID=$(gh run list --branch main --workflow deploy.yml --limit 1 \
  --json databaseId -q '.[0].databaseId')
gh run watch "$RUN_ID" --exit-status
```

On non-zero: `gh run view "$RUN_ID" --log-failed`, diagnose, fix in code,
push, retry. Cap at 3 retries. On 3rd failure, write a halt signal with
`reason=DEPLOY_FAILED` and exit:

```bash
pnpm --filter @homemade/db exec tsx scripts/write-halt-signal.ts \
  --stream baking --reason DEPLOY_FAILED \
  --detail "Run <url> failed 3x. Last error: <one line>. Next: <one line>."
```

On green:

```bash
curl -sS -o /dev/null -w "%{http_code}\n" https://homemade.education/healthz
```

Must print `200`. If not, investigate CloudWatch `/homemade/web`.

---

## Hand-off

Plain English in the session log. Cover:

- Baking-bulk-${BATCH_ID} landed: $N PUBLISHED, $D dropped, sub-category mix.
- Voice-check summary one line.
- New ingredient / tool / anti-tell entries one line.
- Deploy status + commit SHA.
- Anything that went wrong and what you did about it.

---

## Reminders

- If any pre-flight check is ambiguous, halt and exit — don't push through.
- Do not modify `docs/baking-author.md`. Do not modify
  `docs/voice-editor-prompt.md`. Do not modify the voice-check CLI.
- Worktree gotcha (from bulk-001): `seed-ingredients.ts` and
  `seed-tools.ts` read the **worktree's** data files. Edit + seed from
  the worktree the autopilot is running in, not from the main repo.
- No new TipTap blocks. Baker's-percentage / lamination-schedule /
  sugar-stage blocks are intentionally deferred.
- `feedback_no_api_spend.md`: no `@anthropic-ai/sdk`.
- `feedback_scope_discipline.md`: out-of-scope work means stop and halt-signal.
