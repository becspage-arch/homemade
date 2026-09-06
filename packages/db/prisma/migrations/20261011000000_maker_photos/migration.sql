-- Maker photos: one photo model for every made thing.
--
-- Additive only. UGCPhoto grows a pattern side, the AI-gate columns, the appeal
-- fields, tester linkage and soft removal; PatternType grows the two missing
-- crafts; User grows the promotion opt-out and the tester-agreement stamp.
-- UserPatternPhoto is left in place, unused, and its rows are copied forward by
-- packages/db/scripts/migrate-user-pattern-photos.ts.

-- ── PatternType: needlework and sewing patterns can carry photos too ────────
ALTER TYPE "PatternType" ADD VALUE IF NOT EXISTS 'NEEDLEWORK';
ALTER TYPE "PatternType" ADD VALUE IF NOT EXISTS 'SEWING';

-- ── UGCPhoto: the unified model ────────────────────────────────────────────
-- A photo now belongs to a tutorial OR a pattern, so tutorialId widens to
-- nullable. Widening a NOT NULL is safe for every existing row.
ALTER TABLE "UGCPhoto" ALTER COLUMN "tutorialId" DROP NOT NULL;

ALTER TABLE "UGCPhoto" ADD COLUMN IF NOT EXISTS "patternId" TEXT;
ALTER TABLE "UGCPhoto" ADD COLUMN IF NOT EXISTS "patternType" "PatternType";
ALTER TABLE "UGCPhoto" ADD COLUMN IF NOT EXISTS "promotionAllowed" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "UGCPhoto" ADD COLUMN IF NOT EXISTS "gateVerdict" JSONB;
ALTER TABLE "UGCPhoto" ADD COLUMN IF NOT EXISTS "gateModel" TEXT;
ALTER TABLE "UGCPhoto" ADD COLUMN IF NOT EXISTS "appealRequestedAt" TIMESTAMP(3);
ALTER TABLE "UGCPhoto" ADD COLUMN IF NOT EXISTS "appealNote" TEXT;
ALTER TABLE "UGCPhoto" ADD COLUMN IF NOT EXISTS "isTesterPhoto" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "UGCPhoto" ADD COLUMN IF NOT EXISTS "testAssignmentId" TEXT;
ALTER TABLE "UGCPhoto" ADD COLUMN IF NOT EXISTS "removedAt" TIMESTAMP(3);
ALTER TABLE "UGCPhoto" ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "UGCPhoto" ADD COLUMN IF NOT EXISTS "isHero" BOOLEAN NOT NULL DEFAULT false;

-- Exactly one target. The application enforces this; the constraint is the
-- backstop that stops a stray write producing an orphan or a two-headed photo.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'UGCPhoto_one_target'
  ) THEN
    ALTER TABLE "UGCPhoto" ADD CONSTRAINT "UGCPhoto_one_target" CHECK (
      ("tutorialId" IS NOT NULL AND "patternId" IS NULL AND "patternType" IS NULL)
      OR ("tutorialId" IS NULL AND "patternId" IS NOT NULL AND "patternType" IS NOT NULL)
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'UGCPhoto_testAssignmentId_fkey'
  ) THEN
    ALTER TABLE "UGCPhoto"
      ADD CONSTRAINT "UGCPhoto_testAssignmentId_fkey"
      FOREIGN KEY ("testAssignmentId") REFERENCES "TestAssignment"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DROP INDEX IF EXISTS "UGCPhoto_tutorialId_status_idx";
CREATE INDEX IF NOT EXISTS "UGCPhoto_tutorialId_status_removedAt_idx"
  ON "UGCPhoto" ("tutorialId", "status", "removedAt");
CREATE INDEX IF NOT EXISTS "UGCPhoto_patternId_patternType_status_removedAt_idx"
  ON "UGCPhoto" ("patternId", "patternType", "status", "removedAt");
CREATE INDEX IF NOT EXISTS "UGCPhoto_appealRequestedAt_idx"
  ON "UGCPhoto" ("appealRequestedAt");
CREATE INDEX IF NOT EXISTS "UGCPhoto_testAssignmentId_idx"
  ON "UGCPhoto" ("testAssignmentId");

-- ── User: promotion opt-out + tester agreement ─────────────────────────────
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "allowPhotoPromotion" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "testerAgreementAt" TIMESTAMP(3);
