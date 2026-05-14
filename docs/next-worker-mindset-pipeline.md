# Worker brief — Mindset pipeline scaffold (schema + backlog)

Drop-in worker prompt for the Master Orchestrator to spin up the next
session. This worker does the two pieces queued after the brainstorm
landed: the Prisma migration for the Mindset schema, and the bulk
`docs/mindset-backlog.md` draft that drives content authoring.

Model: **Opus** (pipeline-setup worker per the BUILD_PROGRESS § Phase 8
Multi-category fill plan).

Estimated session length: large — schema design + applying migration +
drafting ~16 categories of backlog entries pulling from extracted books
and the brainstorm matrix. Budget accordingly.

---

```
# Homemade - Mindset pipeline scaffold (schema migration + backlog draft)

You're a worker session on the Homemade build. Memory and CLAUDE.md
auto-load — read them first. Then read in this order:

- `BUILD_PROGRESS.md` § "Multi-category fill plan" — context for where
  this session sits in the broader plan.
- `docs/mindset-pipeline.md` — pipeline plan for Mindset. Schema
  sketch is in here.
- `docs/mindset-brainstorm.md` — the matrix (16 life categories ×
  stuck-on × practice types). This is the single most important
  input for the backlog draft.
- `.claude/extracted/mindset-source/MONEY-v2.txt` — 84 tapping
  scripts, full content.
- `.claude/extracted/mindset-source/MONEY-Journal.txt` — 84 daily
  reflection prompts + 12 named rituals.
- `.claude/extracted/mindset-source/The-Money-Zone-v1.txt` — anchor
  method (Zone, Sway, Allowing, Releasing).
- `.claude/extracted/mindset-source/SLEEP-v2.txt` — 30-day tapping
  arc.
- `.claude/extracted/mindset-source/WEIGHT-LOSS-v2.txt` — 84-day
  body / weight arc.
- `.claude/extracted/mindset-source/MANIFESTING-v2.txt` — 84-day
  manifesting arc (feeds Self-worth / Joy / Spirituality / Money).
- `feedback_premium_philosophy.md` — build everything free, gate
  later. No premium-only flags upfront.
- `feedback_homemade_voice.md` — voice rules.
- `feedback_worker_handoff_style.md`, `feedback_deploy_verification.md`,
  `feedback_scope_discipline.md`.

Cross-reference the Cooking pipeline as the template:
- `packages/db/scripts/data/ingredients.ts` + `tools.ts` — pattern
  for master entity tables.
- `packages/db/scripts/seed-ingredients.ts` — pattern for idempotent
  seed.
- `packages/db/prisma/schema.prisma` migrations history — additive
  pattern.
- `docs/recipe-backlog.md` — pattern for what a backlog doc looks
  like.

Plan in TodoWrite at the start.

## Scope — in

### Part A — Prisma migration: Mindset schema

Apply as a single additive migration (field-up-front rule per
`feedback_schema_all_fields_upfront.md`).

Add:

- **`TutorialType` enum extension** — add `PRACTICE`, `READING`,
  `PLAN_TEMPLATE` is NOT added (plans aren't a content type per
  mindset-pipeline.md status note). Existing RECIPE / TECHNIQUE
  stay. New rows default to PRACTICE in the Mindset category.
- **`PracticeType` enum** (11 values): `TAPPING`,
  `ENERGY_STATEMENT`, `AFFIRMATION`, `SPELL`, `RITUAL`, `ACTIVITY`,
  `JOURNAL_PROMPT`, `VISUALISATION`, `MEDITATION`, `EMBODIMENT`,
  `READING`.
- **`PracticeTarget` enum** — the 20 targets from
  `mindset-pipeline.md` schema sketch (MONEY, BODY, RELATIONSHIPS,
  SLEEP, ANXIETY, CONFIDENCE, ABUNDANCE, STUCK, GRIEF, FEAR,
  MOTHERHOOD, PURPOSE, TIME, ENERGY, JOY, SPIRITUALITY, HEALTH,
  SELF_WORTH, FORGIVENESS, AGEING). Add as a Prisma enum array on
  Tutorial.
- **`TimeBand` enum**: `THREE_MIN`, `FIVE_MIN`, `TEN_MIN`,
  `TWENTY_MIN`, `THIRTY_PLUS`.
- **`BestTime` enum**: `MORNING`, `EVENING`, `ANYTIME`,
  `AS_NEEDED`.
- **Tutorial column additions** (nullable; only set when
  `type === PRACTICE`):
  - `practiceType` (PracticeType, nullable)
  - `practiceTargets` (PracticeTarget[], default [])
  - `timeBand` (TimeBand, nullable)
  - `bestTime` (BestTime, nullable)
  - `practiceDepth` (Difficulty — reuse existing enum)
  - `whenToUse` (text, nullable) — one-sentence matcher string
  - `whenNotToUse` (text, nullable) — safety note
  - `alternativePracticeIds` (String[] — for "when this isn't working")
- **`UserPlan` table** — fields per mindset-pipeline.md schema
  sketch: user_id (FK), input_text (text, nullable), input_fields
  (Json, nullable), time_morning (Int), time_evening (Int),
  antiTags (String[]), tierAtCreation enum
  (`FREE_DAILY_PICK | PAID_CUSTOM`), status enum
  (`PENDING_GENERATION | ACTIVE | PAUSED | COMPLETED | ABANDONED`),
  startDate, currentDay (Int), createdAt, completedAt,
  generatorIntro (text, nullable).
- **`UserPlanDay` table** — fields per mindset-pipeline.md:
  userPlanId (FK, cascade), dayNumber (Int), three slots
  (morning / evening / anchor) each with source enum
  (`LIBRARY_REF | GENERATED`), practiceId (nullable FK to
  Tutorial), generatedContent (Json — TipTap, nullable), plus
  daily_reflection_prompt_id (nullable), weeklyTheme (text),
  doneAt timestamps per slot, reflectionNote (text, nullable —
  encrypt at rest).
- **`DailyPick` table** — userId (FK), pickDate (Date),
  practiceId (FK), shownAt, viewedAt, markedHelpful (Bool),
  markedDoneAt. Unique on (userId, pickDate).
- **`UserPracticeFavorite` table** — userId, practiceId, addedAt.
  Unique on (userId, practiceId).
- **`UserPracticeUse` table** — userId, practiceId, usedAt,
  contextTarget (PracticeTarget, nullable).
- **`UserFeeling` table** — userIdHashed (String — for anonymised
  analytics), feelingAt, targetAtTime (PracticeTarget),
  matchedPracticeId (FK, nullable).

Indexes:
- `Tutorial(type, practiceType)` for filtering practices
- `Tutorial(practiceTargets)` GIN if Postgres supports array indexes
- `UserPlanDay(userPlanId, dayNumber)` unique
- `DailyPick(userId, pickDate)` unique
- `UserPracticeFavorite(userId, practiceId)` unique

Migration runs additive only — no column drops. Existing tutorials
(Cooking recipes + techniques) stay untouched. Verify the migration
doesn't break the Cooking pipeline — `pnpm --filter @homemade/web
typecheck` and existing recipe queries should still work.

Apply via the GH Actions migrate-on-deploy path (the standard
pattern — `prisma migrate deploy` runs before ECS rollout per the
Phase 1 deploy workflow).

### Part B — `docs/mindset-backlog.md` — the backlog draft

Equivalent of `docs/recipe-backlog.md` for Cooking. This is the
canonical list that bulk-authoring sessions read to pick what to
write next.

For each of the 16 life categories in `docs/mindset-brainstorm.md`:

1. List the category and its sub-categories.
2. For each stuck-on point, write **specific entry titles** for the
   practice types that fit it. Example for Money stuck-on #4
   ("Wanting huge wealth but can't picture yourself in it"):
   - `[TAPPING] Tapping for "this isn't for me"`
   - `[ENERGY_STATEMENT] Aligning with the woman who has it`
   - `[AFFIRMATION] I am the woman with cash and assets pouring in`
   - `[SPELL] Bay-leaf cash spell — the figure on paper`
   - `[RITUAL] The walk-by — driving past the houses`
   - `[ACTIVITY] Selfridges browse without scarcity`
   - `[JOURNAL_PROMPT] What blocks me from picturing it?`
   - `[VISUALISATION] Opening the bank app to seven figures`
   - `[READING] Why huge wealth feels impossible`
3. Where the source is one of Rebecca's books (Money tapping
   scripts, weekly rituals from Money Journal, etc.), note the
   source so the bulk authoring worker can pull from extracted text
   rather than re-synthesizing.
4. Where the source is public-domain expansion, mark `[PD]` so the
   authoring worker knows to synthesize from public-domain sources
   (rather than Rebecca's books).
5. Where the source is Rebecca-original (beyond her books), mark
   `[NEW]` so the authoring worker treats it as net-new content.

Group by category, then by sub-category where the brainstorm has
them. Use the brainstorm's stuck-on numbering as the spine — every
brainstorm stuck-on point gets expanded into 5–10 specific entry
titles.

**Volume target.** The full brainstorm comes out at ~4,300 library
entries. The backlog should enumerate all ~4,300 specific entry
titles (this is the bulk that bulk-authoring sessions consume).
Expect the doc to be long — that's expected. Mirror the structure
of `docs/recipe-backlog.md`.

**Out for Part B:** Writing actual tutorial bodies (no tapping
scripts written, no journal prompts written, no readings written).
Just titles + sources + types. Bulk authoring is its own worker
session pattern, per Phase 8 Step 12.

### Part C — BUILD_PROGRESS update

Update `BUILD_PROGRESS.md` § "Multi-category fill plan" grid:
- Mindset Pipeline status flips to ✅ ready (schema + backlog
  shipped).
- Note the `docs/mindset-backlog.md` deliverable in the row.

Add a new ### section under Phase 8 titled "Step 13 — Mindset
pipeline scaffold" with the standard Goal / Deliverable / Out
shape, marked ✅ landed.

## Scope — out (hard)

- **No content authoring.** No tapping scripts written, no
  rituals written, no readings written. Just schema + backlog.
- **No premium gating logic.** Build everything free; gate later
  per `feedback_premium_philosophy.md`.
- **No Cooking pipeline changes.** Don't touch
  `packages/db/scripts/data/ingredients.ts`, `tools.ts`, or any
  recipe-related code.
- **No admin UI for Mindset yet.** Schema only, no admin pages.
- **No public UI for Mindset yet.** Schema + backlog only.
- **No plan generator code yet.** Schema is in (UserPlan,
  UserPlanDay) but the worker that picks up PENDING_GENERATION
  rows isn't built in this session.
- **No image generation.** Deferred per the standing rule.
- **No master entity tables for Mindset.** Mindset doesn't have
  the equivalent of Ingredients / Tools — practices are
  self-contained. Don't invent one.
- **No backlog content for Cooking, Baking, Garden, or any other
  category.** Mindset only.

If you spot a needed change outside scope, stop and report.

## Deploy verification

Per `feedback_deploy_verification.md` — verbatim:

[Insert the full deploy-verification block from CLAUDE.md here when
copying. The Master Orchestrator should reproduce it inline.]

## Hand-off

Per `feedback_worker_handoff_style.md` — short plain-English summary
in the session when done. Include:
- Migration filename + what it added
- Backlog doc line count
- Sample of 5 entry titles from the backlog for sanity check
- Anything that surfaced that needs a follow-up session
```

---

## Notes for the orchestrator

- This is a single large worker session. Could be split (Part A then
  Part B as separate workers) if the orchestrator's session budget
  prefers smaller chunks. But Part A informs Part B (the backlog
  titles use the schema enum values), so keeping them together is
  cleaner.
- Model: Opus.
- Expected runtime: substantial — schema design is moderate, but the
  backlog draft expanding ~4,300 entries with sources and types is
  the bulk of the work. Plan accordingly.
- Once shipped, the next worker sessions for Mindset are:
  1. Authoring prompt template (`docs/mindset-author.md` —
     equivalent of `docs/tutorial-author.md` for Mindset's shape).
  2. Voice-check CLI extension for Mindset anti-tells.
  3. Anchor batch (3–5 practices across types, Rebecca reviews).
  4. Pilot batch of 10 (auto-publish flow per Phase 8 Step 11–12).
  5. Bulk fill (the standing worker pattern).
  6. Plan generator worker script (reads UserPlan PENDING rows,
     generates plans).
