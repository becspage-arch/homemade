# Homemade — Mindset autopilot worker

This prompt is read verbatim by the **mindset** scheduled task
(`autopilot-mindset-bulk`). Every fire runs through the pre-flight gates
and either skips, halts, or executes one bulk batch end-to-end.

**Model:** Sonnet (bulk authoring) per `feedback_model_choice.md`.

**Repo + memory.** Homemade build. The repo's `CLAUDE.md` and Rebecca's
auto-memory are auto-loaded — read them first. Key references:

- `BUILD_PROGRESS.md` — Phase 8 content pipeline + the Mindset Steps
  13–16 sections.
- `docs/mindset-author.md` v4 — the mindset authoring prompt. **Do not
  modify.** The autopilot reads it as-is.
- `docs/voice-editor-prompt.md` — voice-editor pass.
- `docs/common-issues.md` — cross-category recurring patterns.
- `docs/mindset-anti-tells.md` — mindset-specific anti-tells (22 entries
  on landing — most `[block]`).
- `docs/mindset-backlog.md` — mindset backlog from the schema worker
  (~2,945 entries).
- `docs/mindset-anchor-briefs/` — the 6 practice + 5 reading anchors.
- `packages/db/scripts/upload-tutorial.ts`, `voice-check.ts`,
  `category-counts.ts`.
- `feedback_no_api_spend.md`, `feedback_worker_handoff_style.md`,
  `feedback_deploy_verification.md`, `feedback_scope_discipline.md`,
  `feedback_schema_all_fields_upfront.md`, `feedback_model_choice.md`,
  `feedback_mindset_voice.md`, `project_mindset_structure.md`.

**Hard scope.** Mindset bulk authoring only — drafting `PRACTICE` and
`READING` tutorials from `docs/mindset-backlog.md`. No schema changes,
no edits to `docs/mindset-author.md`, no new TipTap blocks, no plan-
generator code, no admin / UI work, no voice-check CLI changes. If a
needed change falls outside this scope, write a halt signal and exit.

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
    --stream mindset --reason ENV_PAUSED \
    --detail "AUTOPILOT_PAUSED=true read at preflight"
  echo "[autopilot] mindset — paused via env flag; exiting clean."
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
`docs/mindset-bulk-*-briefs/` or `docs/mindset-bulk-*-report.md`, treat
the previous session as still active:

```bash
pnpm --filter @homemade/db exec tsx scripts/write-halt-signal.ts \
  --stream mindset --reason SKIPPED_DOUBLE_FIRE \
  --detail "Detected branch <name> with mindset activity within 2h"
echo "[autopilot] mindset — previous session still active; exiting clean."
exit 0
```

### 2. Auto-determine batch number

```bash
NEXT_BATCH=$(ls docs/mindset-bulk-*-report.md 2>/dev/null \
  | sed -E 's/.*mindset-bulk-0*([0-9]+)-report\.md/\1/' \
  | sort -n | tail -1)
NEXT_BATCH=${NEXT_BATCH:-0}
NEXT_BATCH=$((NEXT_BATCH + 1))
BATCH_ID=$(printf "%03d" "$NEXT_BATCH")
echo "[autopilot] mindset — drafting mindset-bulk-$BATCH_ID"
```

First run is `mindset-bulk-001`. New briefs go in
`docs/mindset-bulk-${BATCH_ID}-briefs/`, report in
`docs/mindset-bulk-${BATCH_ID}-report.md`.

**First-run note.** Pilot-10 hasn't run yet (see
`BUILD_PROGRESS.md` § "Next Mindset sessions, in order" — pilot-10 is
step 2 in that list). The first autopilot fire effectively replaces the
pilot-10 step: take a smaller slice (target **20** instead of 50) and
weight it across all 11 practice types so the first batch surfaces
patterns the way a pilot would. From `mindset-bulk-002` onward, return
to a 50-entry target.

### 3. Backlog-drain check

```bash
SKIP_FILE=$(mktemp)
{
  ls docs/mindset-anchor-briefs/*.json 2>/dev/null \
    | xargs -n1 basename | sed 's/\.json$//'
  ls docs/mindset-bulk-*-briefs/*.json 2>/dev/null \
    | xargs -n1 basename | sed 's/\.json$//'
} | sort -u > "$SKIP_FILE"
SKIP_COUNT=$(wc -l < "$SKIP_FILE")
echo "[autopilot] mindset — skip list: $SKIP_COUNT slugs"
```

Read `docs/mindset-backlog.md`. Each entry is a candidate. Derive a
plausible slug for each entry by title. Count candidates whose slug is
not in `$SKIP_FILE`. The backlog is large (~2,945 entries), so the
drain threshold is **100** in-scope candidates:

```bash
pnpm --filter @homemade/db exec tsx scripts/write-halt-signal.ts \
  --stream mindset --reason BACKLOG_DRAINED \
  --detail "In-scope mindset candidates: $REMAINING. Threshold 100."
```

Disable the cron:

```
mcp__scheduled-tasks__update_scheduled_task
  taskId = "autopilot-mindset-bulk"
  enabled = false
```

Exit clean.

### 4. Quality-drift check

Read the last 3 mindset batch reports
(`docs/mindset-bulk-*-report.md`, highest 3 by N). Pull voice-check
error counts.

If error count has trended up by more than 50% across the three reports,
skip this fire without disabling the cron:

```bash
pnpm --filter @homemade/db exec tsx scripts/write-halt-signal.ts \
  --stream mindset --reason QUALITY_DRIFT \
  --detail "Error counts last 3: $C1, $C2, $C3 — trending up >50%."
echo "[autopilot] mindset — quality drift; skipping fire, cron stays on."
exit 0
```

Until 3 batch reports exist (currently 0), this check is pass-through.
Log a one-line note in the batch report that the check wasn't applicable.

### 5. Hard chain cap

```bash
CHAIN=$(git log --pretty=format:"%an %s" main \
  | awk '
      /(^| )Mindset autopilot |mindset-bulk-[0-9]+/ { chain++; next }
      { print chain; exit }
    ')
CHAIN=${CHAIN:-0}
```

If chain ≥ 10:

```bash
pnpm --filter @homemade/db exec tsx scripts/write-halt-signal.ts \
  --stream mindset --reason HARD_CAP_REACHED \
  --detail "$CHAIN consecutive autopilot mindset batches without human intervention."
```

Disable the scheduled task and exit clean.

### 6. Auto-determine slice

Mindset spans 16 life categories (Money, Sleep, Body, Self-worth,
Relationships, Motherhood, Business & purpose, Home & lifestyle, Grief,
Trauma, Sexuality, Spiritual, Time, Creativity, Friendship, Big-picture
identity) and 11 practice types (TAPPING, ENERGY_STATEMENT, AFFIRMATION,
SPELL, RITUAL, ACTIVITY, JOURNAL_PROMPT, VISUALISATION, MEDITATION,
EMBODIMENT, READING).

Read the slice breakdowns from the last 3 batch reports if they exist
(life category × practice type tables). On the first run, take a
balanced spread across all 11 practice types (1–3 per type) and at least
4 life categories.

Target spread for a 50-entry slice (or 20 on the first run):

- 8–11 practice types represented, no single type over ~25% of the batch.
- 4–8 life categories represented, no single category over ~30%.
- Mix of `PRACTICE` (the main type) and `READING` (long-form library
  entries — see `docs/mindset-backlog.md` "reading entries" sections).
  Aim for ~80% PRACTICE / ~20% READING on a typical batch.
- Skew under-served life categories — if `Money` has been heavy and
  `Time` light, weight `Time` and the under-represented sub-categories.

For each entry, look up the right `practiceType` for the backlog
section it came from. The mapping is in `docs/mindset-author.md` and
the per-section context. Practice scripts go in the matching sub-category
(`mindset/tapping`, `mindset/ritual`, etc.).

Write down the slice — list of titles, derived slugs, practice type,
life category — before drafting.

---

## Run the batch

Use `TodoWrite` to chunk the run. For each entry:

1. Read the backlog entry plus the relevant type-intro reading (e.g.
   `how-eft-tapping-works` for any TAPPING entry, `how-rituals-work`
   for any RITUAL entry). The intro readings carry the methodology
   once; individual practices assume them and don't restate.
2. Draft the brief JSON following `docs/mindset-author.md` v4 and the
   register rules in `feedback_mindset_voice.md`:
   - Cooking-recipe-factual register. **No ethereal AI-poetry.** No
     "queen / boss / step into your power", no "manifest" overuse, no
     therapeutic-claim verbs, no cosmic-promise framings, no
     future-tense affirmations, no false-intimacy openers.
   - **No safety / medical / clinical commentary anywhere in body.**
     Cut every Scope section, every "consult your therapist", every
     "studies are small". Safety statements live on the legal pages.
   - **No author / book references in body prose.** Subtitle, excerpt,
     intro, body all clean of Rebecca's name and book titles. Bottom
     "Where this practice comes from" section is the only place
     attribution belongs.
   - **Repeat-count signposts in headings** — e.g. `Release (repeat x3)`,
     not just `Release`.
   - **Journal prompt sets open with 1–2 warm-up prompts** before the
     narrow ones. Target 5–6 prompts per set.
   - **Zero em-dashes in titles.** Voice-check doesn't scan titles.
   - **Technique linking does not apply to Mindset.** Leave
     `techniqueSlugs[]` and `criticalTechniques[]` empty (or omit) and
     never wrap practice-type words in `techniqueLink` marks. Mindset
     "techniques" are practice types — sub-categories on the Tutorial
     row, not separate technique tutorials. See
     `docs/mindset-author.md` for the full rationale.
3. Self-critique against the voice rules AND every entry in
   `docs/common-issues.md` AND `docs/mindset-anti-tells.md`. Write to
   `docs/mindset-bulk-${BATCH_ID}-briefs/<slug>.json`.
4. Voice-check:
   `pnpm --filter "@homemade/db" run tutorial:voice-check -- docs/mindset-bulk-${BATCH_ID}-briefs/<slug>.json`.
   3-retry cap on errors; drop and log on 3rd failure.
5. Upload as PUBLISHED:
   `pnpm --filter "@homemade/db" run tutorial:upload -- docs/mindset-bulk-${BATCH_ID}-briefs/<slug>.json --status PUBLISHED`.
   3-retry cap; drop and log.

Mindset has no master ingredient / tool tables to extend. There are no
new TipTap blocks to add — the existing eight blocks plus the Mindset
metadata columns cover the shape. If a backlog entry would clearly
benefit from `tappingScript` / `ritualSteps` / `practiceStatement`
blocks that don't exist yet, draft it with paragraph + ordered-list
nodes and log the gap in the batch report — don't ship a new block
from this session.

Image generation deferred for mindset somatic practices entirely (the
content-integration session decided these skip free image sources and
go to Flux Schnell only at the pre-launch image-fill step). Briefs do
not set `hero.localPath`.

---

## Close the batch

1. **Write the batch report.** `docs/mindset-bulk-${BATCH_ID}-report.md`.
   Match the shape of the cooking and baking reports — header, what
   landed grouped by practice type AND life category, voice-check
   summary, errors fixed, dropped entries, patterns to carry forward,
   any TipTap-block gaps noticed.

2. **Update `docs/mindset-anti-tells.md`.** Any pattern that appeared in
   3+ drafts during this batch and isn't already listed — append in the
   right section with `[block]` or `[warn]` severity.

3. **Update `docs/common-issues.md`** for any cross-category pattern.

4. **Update `BUILD_PROGRESS.md` § "Multi-category fill plan" grid.** Mindset
   "Current" cell. Truth source: `pnpm --filter "@homemade/db" run counts`.

5. **Append an "Autopilot — mindset bulk-${BATCH_ID}" entry** to BUILD_PROGRESS
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
  --stream mindset --reason DEPLOY_FAILED \
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

- Mindset-bulk-${BATCH_ID} landed: $N PUBLISHED, $D dropped, practice-
  type + life-category mix one line.
- Voice-check summary one line.
- New anti-tell entries one line.
- TipTap-block gaps surfaced (if any).
- Deploy status + commit SHA.
- Anything that went wrong and what you did about it.

---

## Reminders

- If any pre-flight check is ambiguous, halt and exit — don't push through.
- Do not modify `docs/mindset-author.md`. Do not modify
  `docs/voice-editor-prompt.md`. Do not modify the voice-check CLI.
- Do not introduce new TipTap blocks from this session. Log gaps in
  the batch report for a separate Mindset-blocks worker.
- Do not write plan-generator code. That's a separate worker.
- `feedback_mindset_voice.md` is non-negotiable. The Rebecca-led v3
  rewrite of the mindset prompt is what makes the body content read
  like Homemade rather than a wellness app — keep the register pinned.
- `feedback_no_api_spend.md`: no `@anthropic-ai/sdk`.
- `feedback_scope_discipline.md`: out-of-scope work means stop and halt-signal.
