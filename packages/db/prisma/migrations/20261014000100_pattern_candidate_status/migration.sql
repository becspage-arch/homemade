-- phase_xs_candidates_001 — the candidate parking bay on Pattern.
--
-- Additive and reversible; every column is nullable (or defaulted) so existing
-- rows need no backfill and a row that never went through the parking bay keeps
-- a NULL `candidateStatus`. The index is the one the judging CLI and the admin
-- banner read: pending candidates, oldest first.

ALTER TABLE "Pattern"
  ADD COLUMN IF NOT EXISTS "candidateStatus" TEXT,
  ADD COLUMN IF NOT EXISTS "judgedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "judgedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "judgeReasons" JSONB,
  ADD COLUMN IF NOT EXISTS "rerollCount" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "Pattern_candidateStatus_createdAt_idx"
  ON "Pattern" ("candidateStatus", "createdAt");
