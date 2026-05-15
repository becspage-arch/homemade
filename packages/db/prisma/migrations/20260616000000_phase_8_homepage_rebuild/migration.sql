-- Phase 8 Homepage rebuild — schema migration.
--
-- All-fields-up-front per feedback_schema_all_fields_upfront.md. Additive
-- only: no column drops, no breaking renames. Existing rows untouched.
--
-- Adds:
--   * User: onboardedAt, primaryCategoryIds[], experienceLevel,
--     homeCountryCode, dietaryFlags[], lastSeenAt
--   * Tutorial: heroImageStrategy
--   * UserProject: nextScheduledStepNumber, nextScheduledAt,
--     scheduledStepsCompleted[]
--   * WeeklyEditorialPick (new table) + EditorialPickStatus enum
--   * ProjectSchedule (new table) + ScheduleSurface enum
--   * Enums: ExperienceLevel, HeroStrategy, EditorialPickStatus,
--     ScheduleSurface
--
-- See `project_ux_review_briefs.md` § Workstream 2 for the brief.

-- ────────────────────────────────────────────────────────────────────────────
-- Enums
-- ────────────────────────────────────────────────────────────────────────────

CREATE TYPE "ExperienceLevel" AS ENUM (
  'BEGINNER',
  'INTERMEDIATE',
  'CONFIDENT'
);

CREATE TYPE "HeroStrategy" AS ENUM (
  'REAL_PHOTO',
  'PROCEDURAL_CARD',
  'PUBLIC_DOMAIN_PLATE',
  'AI_GENERATED',
  'UNSET'
);

CREATE TYPE "EditorialPickStatus" AS ENUM (
  'AUTO_SELECTED',
  'MANUALLY_PINNED',
  'MANUALLY_REPLACED'
);

CREATE TYPE "ScheduleSurface" AS ENUM (
  'HERO',
  'RAIL_CARD',
  'NOTIFICATION_ONLY'
);

-- ────────────────────────────────────────────────────────────────────────────
-- User extensions — onboarding + personalisation + last-seen.
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE "User"
  ADD COLUMN "onboardedAt"        TIMESTAMP(3),
  ADD COLUMN "primaryCategoryIds" TEXT[]    DEFAULT ARRAY[]::TEXT[] NOT NULL,
  ADD COLUMN "experienceLevel"    "ExperienceLevel",
  ADD COLUMN "homeCountryCode"    TEXT,
  ADD COLUMN "dietaryFlags"       TEXT[]    DEFAULT ARRAY[]::TEXT[] NOT NULL,
  ADD COLUMN "lastSeenAt"         TIMESTAMP(3);

CREATE INDEX "User_onboardedAt_idx" ON "User"("onboardedAt");
CREATE INDEX "User_lastSeenAt_idx"  ON "User"("lastSeenAt");

-- ────────────────────────────────────────────────────────────────────────────
-- Tutorial.heroImageStrategy — tracks where the current hero came from so
-- backfills and renderers can decide between procedural cards, real photos,
-- and AI-generated heroes.
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE "Tutorial"
  ADD COLUMN "heroImageStrategy" "HeroStrategy" NOT NULL DEFAULT 'UNSET';

-- ────────────────────────────────────────────────────────────────────────────
-- UserProject — project schedule cursor.
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE "UserProject"
  ADD COLUMN "nextScheduledStepNumber"  INTEGER,
  ADD COLUMN "nextScheduledAt"          TIMESTAMP(3),
  ADD COLUMN "scheduledStepsCompleted"  INTEGER[] DEFAULT ARRAY[]::INTEGER[] NOT NULL;

CREATE INDEX "UserProject_nextScheduledAt_idx" ON "UserProject"("nextScheduledAt");

-- ────────────────────────────────────────────────────────────────────────────
-- WeeklyEditorialPick — five picks per ISO week (Mon 00:00 UTC anchored).
-- The cron seeds rows with status AUTO_SELECTED; admins can flip to
-- MANUALLY_PINNED so future runs leave the row alone, or MANUALLY_REPLACED
-- when overriding a single position.
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE "WeeklyEditorialPick" (
  "id"                 TEXT                    NOT NULL,
  "weekStarting"       TIMESTAMP(3)            NOT NULL,
  "position"           INTEGER                 NOT NULL,
  "tutorialId"         TEXT                    NOT NULL,
  "status"             "EditorialPickStatus"   NOT NULL DEFAULT 'AUTO_SELECTED',
  "selectedBy"         TEXT,
  "selectedAt"         TIMESTAMP(3),
  "replacedAutoPickId" TEXT,
  "reason"             TEXT,
  "createdAt"          TIMESTAMP(3)            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"          TIMESTAMP(3)            NOT NULL,

  CONSTRAINT "WeeklyEditorialPick_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WeeklyEditorialPick_weekStarting_position_key"
  ON "WeeklyEditorialPick"("weekStarting", "position");

CREATE INDEX "WeeklyEditorialPick_weekStarting_idx"
  ON "WeeklyEditorialPick"("weekStarting");

ALTER TABLE "WeeklyEditorialPick"
  ADD CONSTRAINT "WeeklyEditorialPick_tutorialId_fkey"
  FOREIGN KEY ("tutorialId") REFERENCES "Tutorial"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ────────────────────────────────────────────────────────────────────────────
-- ProjectSchedule — per-tutorial multi-day step definitions. Authors register
-- these on tutorials with long real-world arcs (sourdough starters, growing,
-- preserving, fermentation). The engine queues notifications and homepage
-- surface entries from a UserProject's `startedAt` + each step's offsetDays.
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE "ProjectSchedule" (
  "id"                  TEXT              NOT NULL,
  "tutorialId"          TEXT              NOT NULL,
  "stepNumber"          INTEGER           NOT NULL,
  "offsetDays"          INTEGER           NOT NULL,
  "title"               TEXT              NOT NULL,
  "body"                TEXT              NOT NULL,
  "surfaceAs"           "ScheduleSurface" NOT NULL DEFAULT 'RAIL_CARD',
  "requiresUserAction"  BOOLEAN           NOT NULL DEFAULT TRUE,
  "createdAt"           TIMESTAMP(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMP(3)      NOT NULL,

  CONSTRAINT "ProjectSchedule_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProjectSchedule_tutorialId_stepNumber_idx"
  ON "ProjectSchedule"("tutorialId", "stepNumber");

ALTER TABLE "ProjectSchedule"
  ADD CONSTRAINT "ProjectSchedule_tutorialId_fkey"
  FOREIGN KEY ("tutorialId") REFERENCES "Tutorial"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
