-- Attempts the deterministic pale guard rejected before the vision gate was
-- called. The guard's whole point is that it is measurable; without a counter
-- its work is invisible (a pale rejection looks like any other repair).
--
-- Additive + idempotent; a re-run is a no-op.
ALTER TABLE "BulkRun" ADD COLUMN IF NOT EXISTS "paleSkips" INTEGER NOT NULL DEFAULT 0;
