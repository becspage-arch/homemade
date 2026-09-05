-- How much of a bulk run the planner MODEL wrote, as opposed to the curated
-- pool sampler it falls back to. A batch that quietly fell back looks exactly
-- like a normal batch until you read the subjects, so the run records the count
-- and the admin summary line reports it.
--
-- Additive + idempotent; a re-run is a no-op.
ALTER TABLE "BulkRun" ADD COLUMN IF NOT EXISTS "modelBriefs" INTEGER NOT NULL DEFAULT 0;
