-- Cross-stitch autopilot hardening (phase_xs_autopilot_dedupe_001).
--
-- Two additions, both additive + idempotent (ADD COLUMN IF NOT EXISTS), so a
-- re-run is a no-op and no existing row is touched:
--
--   1. Pattern gains the duplicate-guard fingerprints the publish path writes
--      and compares before a gem goes PUBLIC (image hashes, thumbnail + source
--      sha256, the chart fingerprint, the normalised subject key) plus the
--      generation provenance and the bulk run that made it.
--   2. BulkRun gains the outcomes the fan-out could not record (duplicates,
--      skipped, pro generations) and the finaliser's fields (finishedAt,
--      summary, alerted, skipReason).

ALTER TABLE "Pattern" ADD COLUMN IF NOT EXISTS "imageHash64" TEXT;
ALTER TABLE "Pattern" ADD COLUMN IF NOT EXISTS "imageHash256" TEXT;
ALTER TABLE "Pattern" ADD COLUMN IF NOT EXISTS "thumbnailSha256" TEXT;
ALTER TABLE "Pattern" ADD COLUMN IF NOT EXISTS "sourceImageSha256" TEXT;
ALTER TABLE "Pattern" ADD COLUMN IF NOT EXISTS "chartFingerprint" JSONB;
ALTER TABLE "Pattern" ADD COLUMN IF NOT EXISTS "subjectKey" TEXT;
ALTER TABLE "Pattern" ADD COLUMN IF NOT EXISTS "generationMeta" JSONB;
ALTER TABLE "Pattern" ADD COLUMN IF NOT EXISTS "bulkRunId" TEXT;

CREATE INDEX IF NOT EXISTS "Pattern_imageHash64_idx" ON "Pattern"("imageHash64");
CREATE INDEX IF NOT EXISTS "Pattern_subjectKey_idx" ON "Pattern"("subjectKey");

ALTER TABLE "BulkRun" ADD COLUMN IF NOT EXISTS "duplicates" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "BulkRun" ADD COLUMN IF NOT EXISTS "skipped" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "BulkRun" ADD COLUMN IF NOT EXISTS "proGenerations" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "BulkRun" ADD COLUMN IF NOT EXISTS "finishedAt" TIMESTAMP(3);
ALTER TABLE "BulkRun" ADD COLUMN IF NOT EXISTS "summary" TEXT;
ALTER TABLE "BulkRun" ADD COLUMN IF NOT EXISTS "alerted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "BulkRun" ADD COLUMN IF NOT EXISTS "skipReason" TEXT;

CREATE INDEX IF NOT EXISTS "BulkRun_craft_finishedAt_idx" ON "BulkRun"("craft", "finishedAt");
