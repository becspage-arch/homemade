-- Additive: how many briefs the constrained planner actually re-dressed rather
-- than copying out of the pool. Defaults to 0, which is honest for every run
-- planned before the count existed.
ALTER TABLE "BulkRun" ADD COLUMN     "dressedBriefs" INTEGER NOT NULL DEFAULT 0;
