-- phase_autopilot_single_queue_001
--
-- Switch the autopilot from three per-stream crons (cooking / baking /
-- mindset, each daily) to a single round-robin queue cron that fires every
-- two hours and picks the next READY-and-not-COMPLETE category from a fair
-- round-robin.
--
-- Additive only. Existing categories land with `pipelineStatus = NOT_READY`
-- as the column default; the seed script (`seed-categories.ts`) flips
-- Cooking + Baking + Mindset to READY in the same release.
--
-- The publish path (`packages/db/src/category-publish-hooks.ts`) flips
-- READY → COMPLETE the moment a category's PUBLISHED count reaches its
-- `targetTutorialCount`, so the queue stops picking it.

CREATE TYPE "PipelineStatus" AS ENUM ('NOT_READY', 'READY', 'PAUSED', 'COMPLETE');

ALTER TABLE "Category"
  ADD COLUMN "pipelineStatus"     "PipelineStatus" NOT NULL DEFAULT 'NOT_READY',
  ADD COLUMN "lastAutopilotRunAt" TIMESTAMP(3),
  ADD COLUMN "autopilotWeight"    INTEGER          NOT NULL DEFAULT 1;

CREATE INDEX "Category_pipelineStatus_lastAutopilotRunAt_idx"
  ON "Category" ("pipelineStatus", "lastAutopilotRunAt");

-- Flip the three shipped categories to READY at migration time so the new
-- queue cron has work to pick up on first fire. Placeholder categories
-- (the 14 not-yet-set-up ones) stay at the column default NOT_READY and
-- become READY when their per-category pipeline-setup session lands.
UPDATE "Category"
SET "pipelineStatus" = 'READY'
WHERE "slug" IN ('cooking', 'baking', 'mindset');
