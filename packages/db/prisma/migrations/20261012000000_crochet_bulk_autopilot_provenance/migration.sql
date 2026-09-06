-- Crochet bulk autopilot provenance + the duplicate guard's two signals.
--
-- Additive and nullable throughout: every existing CrochetPattern row (hand
-- authored, imported, or a maker's own design) keeps NULL and reads exactly as
-- it did. Written only by the bulk publisher.
--
--   generationMeta      how an autopilot row came to exist (run, brief, gate
--                       verdict, program fingerprint, attempts) — the crochet
--                       twin of Pattern.generationMeta.
--   subjectKey          the normalised subject phrase: "the same idea, redrawn".
--   programFingerprint  a hash of the stitch program with colours stripped:
--                       "the same construction in another colourway".
--   bulkRunId           the run that published it (a raw id, not a relation, so
--                       a BulkRun row can be pruned without touching the
--                       catalogue).
--
-- IF NOT EXISTS so a re-run (or a hand-applied hotfix) is a no-op.
ALTER TABLE "CrochetPattern" ADD COLUMN IF NOT EXISTS "generationMeta" JSONB;
ALTER TABLE "CrochetPattern" ADD COLUMN IF NOT EXISTS "subjectKey" TEXT;
ALTER TABLE "CrochetPattern" ADD COLUMN IF NOT EXISTS "programFingerprint" TEXT;
ALTER TABLE "CrochetPattern" ADD COLUMN IF NOT EXISTS "bulkRunId" TEXT;

CREATE INDEX IF NOT EXISTS "CrochetPattern_subjectKey_idx" ON "CrochetPattern"("subjectKey");
CREATE INDEX IF NOT EXISTS "CrochetPattern_programFingerprint_idx" ON "CrochetPattern"("programFingerprint");
CREATE INDEX IF NOT EXISTS "CrochetPattern_bulkRunId_idx" ON "CrochetPattern"("bulkRunId");
