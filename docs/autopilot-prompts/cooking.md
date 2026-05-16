# Homemade — Cooking autopilot worker

This prompt is read verbatim by the **cooking** scheduled task
(`autopilot-cooking-bulk`). Every fire runs through the pre-flight gates
and either skips, halts, or executes one bulk batch end-to-end.

**Model:** Sonnet (bulk authoring) per `feedback_model_choice.md`.

**Repo + memory.** This is the Homemade build. The repo's `CLAUDE.md` and
Rebecca's auto-memory are loaded — read them first. Key references:

- `BUILD_PROGRESS.md` — entire repo context, especially the Phase 8
  content pipeline section.
- `docs/tutorial-author.md` v5 — the cooking authoring prompt. **Do not
  modify.** The autopilot reads it as-is.
- `docs/voice-editor-prompt.md` — voice-editor pass.
- `docs/common-issues.md` — recurring patterns to check during self-critique.
- `docs/recipe-backlog.md` — cooking backlog.
- `docs/bulk-batch-*-report.md` — prior cooking batch reports.
- `packages/db/scripts/upload-tutorial.ts` — the upload + voice-check gate.
- `packages/db/scripts/category-counts.ts` — current counts helper.
- `feedback_no_api_spend.md`, `feedback_worker_handoff_style.md`,
  `feedback_deploy_verification.md`, `feedback_scope_discipline.md`,
  `feedback_schema_all_fields_upfront.md`, `feedback_model_choice.md`.

**Hard scope.** Cooking bulk authoring only. No schema changes, no
edits to `docs/tutorial-author.md`, no infra, no admin / UI work. If a
needed change falls outside this scope, write a halt signal and exit.

**Hand-off style.** `feedback_worker_handoff_style.md`. Plain English,
outcomes first, no banned phrases, no sign-offs.

---

## Pre-flight — run in order, halt-and-exit on the first trigger

Use `TodoWrite` to track the steps. Walk through them top to bottom on
every fire. Each step has a single decision: skip-and-exit, halt-and-exit,
or continue.

### 0. Environment pause

```bash
if [ "${AUTOPILOT_PAUSED:-}" = "true" ]; then
  pnpm --filter @homemade/db exec tsx scripts/write-halt-signal.ts \
    --stream cooking --reason ENV_PAUSED \
    --detail "AUTOPILOT_PAUSED=true read at preflight"
  echo "[autopilot] cooking — paused via env flag; exiting clean."
  exit 0
fi
```

If paused, exit immediately — do not branch, draft, or upload anything.

### 1. No-double-firing check

A previous autopilot worker may still be running. Look for cooking-stream
activity in the last 2 hours:

```bash
git fetch --quiet origin
RECENT=$(git log --since="2 hours ago" --all --pretty=format:"%H %s" \
  --grep="autopilot-cooking-bulk\|bulk-batch-\|bulk-batch-resume" || true)
ACTIVE_BRANCHES=$(git for-each-ref --sort=-committerdate \
  --format='%(refname:short) %(committerdate:iso) %(subject)' refs/remotes/origin/claude/ \
  | head -20)
```

If a `claude/*` branch has commits in the last 2 hours that touch
`docs/bulk-batch-*-briefs/` or `docs/bulk-batch-*-report.md`, treat the
previous session as still active:

```bash
pnpm --filter @homemade/db exec tsx scripts/write-halt-signal.ts \
  --stream cooking --reason SKIPPED_DOUBLE_FIRE \
  --detail "Detected branch <name> with cooking activity within 2h"
echo "[autopilot] cooking — previous session still active; exiting clean."
exit 0
```

### 2. Auto-determine batch number

List existing cooking batch report files and take the highest N+1:

```bash
NEXT_BATCH=$(ls docs/bulk-batch-*-report.md 2>/dev/null \
  | sed -E 's/.*bulk-batch-0*([0-9]+)-report\.md/\1/' \
  | sort -n | tail -1)
NEXT_BATCH=$((NEXT_BATCH + 1))
BATCH_ID=$(printf "%03d" "$NEXT_BATCH")
echo "[autopilot] cooking — drafting bulk-batch-$BATCH_ID"
```

The new briefs go in `docs/bulk-batch-${BATCH_ID}-briefs/` and the report
in `docs/bulk-batch-${BATCH_ID}-report.md`.

### 3. Backlog-drain check

Build the skip list:

```bash
# Anchors + pilot + personal + every prior batch's brief filenames.
SKIP_FILE=$(mktemp)
{
  ls packages/db/scripts/anchor-tutorials/*.json 2>/dev/null \
    | xargs -n1 basename | sed 's/\.json$//'
  ls docs/pilot-10-briefs/*.json 2>/dev/null \
    | xargs -n1 basename | sed 's/\.json$//'
  ls docs/personal-recipes-briefs/*.json 2>/dev/null \
    | xargs -n1 basename | sed 's/\.json$//'
  ls docs/bulk-batch-*-briefs/*.json 2>/dev/null \
    | xargs -n1 basename | sed 's/\.json$//'
} | sort -u > "$SKIP_FILE"
SKIP_COUNT=$(wc -l < "$SKIP_FILE")
echo "[autopilot] cooking — skip list: $SKIP_COUNT slugs"
```

Read `docs/recipe-backlog.md`. Each bullet is a candidate. Derive a
plausible slug for each entry by title (`kebab-case`, strip articles).
Count candidates whose slug is not in `$SKIP_FILE`. If fewer than **50**
in-scope candidates remain:

```bash
pnpm --filter @homemade/db exec tsx scripts/write-halt-signal.ts \
  --stream cooking --reason BACKLOG_DRAINED \
  --detail "In-scope cooking candidates: $REMAINING. Threshold 50."
```

Then disable the cron via the ScheduledTasks MCP and exit. The taskId
is `autopilot-cooking-bulk`:

```
mcp__scheduled-tasks__update_scheduled_task
  taskId = "autopilot-cooking-bulk"
  enabled = false
```

Do not write any briefs. Exit clean.

### 4. Quality-drift check

Read the last 3 cooking batch reports (`docs/bulk-batch-*-report.md`,
highest 3 by N). Pull the voice-check error counts from each — the
report's "Errors found and fixed" / "Voice-check summary" sections.

If the error count has trended up by more than 50% across the three
reports (e.g. 4 → 7 → 11), write a `QUALITY_DRIFT` signal and skip the
fire **without disabling the cron**:

```bash
pnpm --filter @homemade/db exec tsx scripts/write-halt-signal.ts \
  --stream cooking --reason QUALITY_DRIFT \
  --detail "Error counts last 3: $C1, $C2, $C3 — trending up >50%."
echo "[autopilot] cooking — quality drift; skipping fire, cron stays on."
exit 0
```

If you can't parse a clean count from a report (legitimate ambiguity, not
"close enough"), treat that as a drift signal too — write the halt and
exit. The next fire is 24h away; manual review is cheap.

### 5. Hard chain cap

Count consecutive autopilot batches since the last commit by an actual
user (anyone other than `claude*` / `autopilot*` committers):

```bash
CHAIN=$(git log --pretty=format:"%an %s" main \
  | awk '
      /(^| )Cooking autopilot |bulk-batch-[0-9]+/ { chain++; next }
      { print chain; exit }
    ')
CHAIN=${CHAIN:-0}
```

If chain ≥ 10:

```bash
pnpm --filter @homemade/db exec tsx scripts/write-halt-signal.ts \
  --stream cooking --reason HARD_CAP_REACHED \
  --detail "$CHAIN consecutive autopilot batches without human intervention."
```

Then disable the scheduled task (`autopilot-cooking-bulk`, `enabled = false`)
and exit clean. Rebecca re-enables manually after review.

### 6. Auto-determine slice

Read the cuisine / sub-topic breakdowns from the last 3 batch reports
(the per-section tables under "Recipes published"). Tally the per-cuisine
counts. Pick a slice for this batch that **under-represents** the
running totals — e.g. if British and Italian were heavy in 003/004/005,
weight 006 toward French / Mediterranean / Middle Eastern. The slice is
your call from the in-scope backlog.

Target spread for a 50-recipe slice:

- 3–6 cuisines represented, no single cuisine over ~30% of the batch.
- 60–75% BEGINNER / INTERMEDIATE, 25–40% INTERMEDIATE / ADVANCED.
- A mix of meal types — not all dinners, not all breakfasts.
- Pick by under-represented sub-topics within the cuisine.

Write down the slice — list of 50 backlog titles, their derived slugs —
before drafting. This is your todo list for the run.

---

## Run the batch

Use `TodoWrite` to break the 50-recipe run into trackable chunks. For each
recipe in the slice:

1. Read the backlog entry. Look up any new ingredient / tool slugs against
   `packages/db/scripts/data/ingredients.ts` and `tools.ts`. If a slug is
   missing, add it to the seed file before drafting and reseed
   (`pnpm --filter "@homemade/db" run seed:cooking` is unrelated — for
   ingredients run `tsx scripts/seed-ingredients.ts`; for tools
   `tsx scripts/seed-tools.ts`).
2. Draft the brief JSON following `docs/tutorial-author.md` v5. Self-critique
   against the voice rules AND every entry in `docs/common-issues.md`.
   Write the JSON to `docs/bulk-batch-${BATCH_ID}-briefs/<slug>.json`.
3. Voice-check the draft:
   `pnpm --filter "@homemade/db" run tutorial:voice-check -- docs/bulk-batch-${BATCH_ID}-briefs/<slug>.json`.
   On errors, rewrite — up to **3 retries**. On the 3rd failure, drop the
   recipe and record it in the report's "Dropped" section with the final
   voice-check output.
4. Upload as PUBLISHED:
   `pnpm --filter "@homemade/db" run tutorial:upload -- docs/bulk-batch-${BATCH_ID}-briefs/<slug>.json --status PUBLISHED`.
   On upload failure (missing ingredient slug, season enum, etc.), fix
   the brief and retry — same 3-retry cap. On 3rd failure, drop and log.

Image generation is **deferred** for this phase. Briefs do not set
`hero.localPath`; heroes batch-fill from a separate session.

---

## Close the batch

Once the run is complete (or you've worked through all 50 with drops
counted):

1. **Write the batch report.** `docs/bulk-batch-${BATCH_ID}-report.md`.
   Match the shape of `docs/bulk-batch-005-report.md`:
   - Header (date, target, status).
   - Recipes published, grouped by cuisine / section, with slug + title +
     difficulty.
   - Difficulty mix percentages.
   - Voice-check summary — clean / warn-only / errors-fixed / dropped.
   - Ingredient / tool master-list additions if any.
   - Anti-tells compliance note.

2. **Update `docs/common-issues.md`.** For any pattern that appeared in
   3+ drafts during this batch and isn't already listed, append an entry
   in the right section (Voice / Structural / Metadata / Cross-category)
   with **Pattern**, **Why**, **How to fix**, and a `[block]` or `[warn]`
   severity flag. Match the existing entry shape.

3. **Update `BUILD_PROGRESS.md` § "Multi-category fill plan" grid.** Cooking
   "Current" cell — bump the count to reflect the new PUBLISHED rows. Get
   the truth from `pnpm --filter "@homemade/db" run counts`.

4. **Append an "Autopilot — cooking bulk-${BATCH_ID}" entry** to BUILD_PROGRESS,
   short — date, count published, count dropped, slice headline (e.g.
   "Mediterranean + Middle Eastern weighted batch — 50 PUBLISHED,
   0 dropped, voice-check clean on 47, 3 retries").

5. **Commit + push.** Branch is `claude/<this session's worktree name>` —
   workers merge to main per the existing pattern. Use the worker hand-off
   pattern in the commit message:

   ```
   feat(content): cooking autopilot bulk-${BATCH_ID} — 50 PUBLISHED

   Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
   ```

   Actually push to main per existing worker pattern (not PR — see
   CLAUDE.md "Don't … open a PR and walk away").

---

## Deploy verification (mandatory)

This block is from `CLAUDE.md` and is non-negotiable.

```bash
sleep 15
RUN_ID=$(gh run list --branch main --workflow deploy.yml --limit 1 \
  --json databaseId -q '.[0].databaseId')
gh run watch "$RUN_ID" --exit-status
```

If `gh run watch` exits non-zero:

```bash
gh run view "$RUN_ID" --log-failed
```

Diagnose, fix in code, commit, push, re-run the verification block.
**Cap at 3 retries.** On the third failure, stop. Write a halt signal
with `reason=DEPLOY_FAILED` and the run URL in `--detail`, then exit:

```bash
pnpm --filter @homemade/db exec tsx scripts/write-halt-signal.ts \
  --stream cooking --reason DEPLOY_FAILED \
  --detail "Run <url> failed 3x. Last error: <one line>. Next: <one line>."
```

Once `gh run watch` exits zero:

```bash
curl -sS -o /dev/null -w "%{http_code}\n" https://homemade.education/healthz
```

Must print `200`. If not, investigate the running task in CloudWatch
(`/homemade/web`) before declaring done.

Docs-only commits — none here; this session writes briefs + PUBLISHED
rows which can affect the deployed app via DB. Verify every time.

---

## Hand-off

Plain English to Rebecca in the session log. Cover:

- Bulk-batch-${BATCH_ID} landed: $N PUBLISHED, $D dropped, headline slice.
- Voice-check summary one line.
- Master-list additions one line (if any).
- New common-issues entries one line (if any).
- Deploy status + commit SHA.
- Anything that went wrong and what you did about it.

No "honest", no "I should be transparent", no sign-offs. Outcomes first.

---

## Reminders

- The pre-flight gates exist so this doesn't run forever unsupervised. If
  any check is ambiguous, write a halt signal and exit rather than push
  through.
- Do not modify `docs/tutorial-author.md`. Do not modify
  `docs/voice-editor-prompt.md`. Do not modify the voice-check CLI.
- Do not edit schema. Do not change Inngest cron schedules.
- `feedback_no_api_spend.md`: all AI work is inside this Claude Code
  session. No `@anthropic-ai/sdk` calls.
- `feedback_scope_discipline.md`: "Scope — out" is a hard line. Out-of-
  scope work means stop and surface it as a halt signal or session report.
