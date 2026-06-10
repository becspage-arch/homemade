-- Sewing pre-S-2: saved body measurements + printable sewing planner.
-- phase_sewing_measurements_planner_001 (2026-06-10).
--
-- Adds:
--   * SewingPlanStatus enum
--   * UserSewingMeasurements (1:1 with User)
--   * UserSewingPlan (many per User)
--   * User.measurementPreference (nullable; null = default to cm)
--
-- Strictly additive and idempotent. No existing rows are touched.

-- 1. Status enum for sewing plans.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SewingPlanStatus') THEN
    CREATE TYPE "SewingPlanStatus" AS ENUM (
      'DRAFT',
      'ACTIVE',
      'PAUSED',
      'COMPLETED',
      'ARCHIVED'
    );
  END IF;
END$$;

-- 2. User-wide measurement display preference. Canonical storage stays cm/mm
-- per the locked units rule; this column only switches the render-time unit.
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "measurementPreference" TEXT;

-- 3. UserSewingMeasurements: 1:1 with User.
CREATE TABLE IF NOT EXISTS "UserSewingMeasurements" (
  "id"     TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,

  -- 3-5 default profile per the sewing locks.
  "bustChestCm"           DECIMAL(6, 2),
  "waistCm"               DECIMAL(6, 2),
  "hipCm"                 DECIMAL(6, 2),
  "bodyHeightCm"          DECIMAL(6, 2),
  "inseamCm"              DECIMAL(6, 2),

  -- Advanced disclosure fields.
  "bustPointCm"           DECIMAL(6, 2),
  "backWaistLengthCm"     DECIMAL(6, 2),
  "frontWaistLengthCm"    DECIMAL(6, 2),
  "shoulderWidthCm"       DECIMAL(6, 2),
  "armLengthCm"           DECIMAL(6, 2),
  "wristCircumferenceCm"  DECIMAL(6, 2),
  "thighCircumferenceCm"  DECIMAL(6, 2),
  "calfCircumferenceCm"   DECIMAL(6, 2),
  "ankleCircumferenceCm"  DECIMAL(6, 2),
  "neckCircumferenceCm"   DECIMAL(6, 2),

  "notes"         TEXT,
  "lastUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "UserSewingMeasurements_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "UserSewingMeasurements_userId_idx"
  ON "UserSewingMeasurements"("userId");

-- 4. UserSewingPlan: many per User.
CREATE TABLE IF NOT EXISTS "UserSewingPlan" (
  "id"     TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,

  "title"       TEXT NOT NULL,
  "patternId"   TEXT,
  "patternSlug" TEXT,

  -- Materials (free-form JSON at v1; shape sketched in the Prisma model).
  "fabricList"  JSONB,
  "notionsList" JSONB,
  "threadList"  JSONB,

  -- Cutting plan (free-form JSON at v1).
  "cuttingPlan" JSONB,

  -- Steps + progress (free-form JSON at v1).
  "stepsList"   JSONB,

  "notes"  TEXT,

  "status"      "SewingPlanStatus" NOT NULL DEFAULT 'DRAFT',
  "startedAt"   TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),

  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "UserSewingPlan_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "UserSewingPlan_userId_updatedAt_idx"
  ON "UserSewingPlan"("userId", "updatedAt");

CREATE INDEX IF NOT EXISTS "UserSewingPlan_userId_status_idx"
  ON "UserSewingPlan"("userId", "status");
