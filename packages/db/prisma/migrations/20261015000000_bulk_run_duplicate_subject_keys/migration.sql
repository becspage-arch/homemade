-- The subject keys a run killed as duplicates. A duplicate kill writes no
-- Pattern row, so the planner had no way to learn from one and re-picked the
-- same subject on the next firing.
ALTER TABLE "BulkRun" ADD COLUMN "duplicateSubjectKeys" TEXT[] DEFAULT ARRAY[]::TEXT[];
