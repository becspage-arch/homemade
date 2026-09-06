---
name: Add all schema fields up-front, don't stage migrations
description: When designing schema for a new content type or feature, add every field we plausibly want from the start. Don't stage "add the core fields now, the nice-to-have ones later" — that creates follow-up migration work and risks backfilling data later. Bias toward including the speculative field over deferring it.
type: feedback
originSessionId: 51201880-3837-4738-8a0c-9f582718baa7
---
When designing a schema migration, add every field we plausibly want
from the start. Don't stage "core fields now, nice-to-have fields
later".

**Why:** Rebecca explicitly stated this during the Phase 8 page-design
review on 2026-05-13. The context was a deferred `leftoverTutorialId`
field — I'd recommended waiting until the recipe backlog existed before
adding the column. She overrode: "We want all the fields from the start
so we don't have to redo work." Follow-up migrations to backfill
metadata across thousands of rows is the failure mode she's avoiding.

**How to apply:**

- When scoping a schema migration, list every field that's even
  plausibly useful for the feature. Default to including it.
- Bias toward `field?: Type | null` for fields that can stay null
  until populated, rather than splitting into "add later" migrations.
- For boolean flags (`foundational`, `freezable`, `batchable`,
  `scalable`), default to `false` and let authors flip per row.
- If a field is genuinely speculative and adds complexity (a join
  table, a polymorphic relation), flag it explicitly and ask before
  deferring. Otherwise, include it.
- The exception is fields that imply a new sub-system (e.g. don't
  add a `stripeSubscriptionId` column "just in case" before Stripe is
  wired up). Speculative is fine; orphaning a whole feature isn't.

**Related:** `project_content_pipeline.md` lists the recipe metadata
fields that should land in one Phase 8 Step 2 migration: servings,
prepMinutes, cookMinutes, totalMinutes, scalable, freezable,
freezeNotes, batchable, batchNotes, makeAheadNotes, dietaryFlags[],
cuisine, mealType, mood[], type (RECIPE | TECHNIQUE), foundational,
leftoverTutorialId. None of those land in a follow-up.
