-- Phase 8 Step 13 — Mindset pipeline schema migration.
--
-- Adds the practice-library taxonomy + user-side surfaces. Everything is
-- additive: no column drops, no breaking renames, existing Cooking rows
-- untouched. Enum values added to `TutorialType` (PRACTICE, READING) so
-- Mindset practices and long-form readings share the Tutorial spine with
-- recipes and techniques.
--
-- See `docs/mindset-pipeline.md` for rationale and page mapping, and
-- `docs/mindset-brainstorm.md` for the matrix that drives the library.

-- TutorialType extension. ALTER TYPE ADD VALUE is safe in a migration
-- transaction on Postgres 12+ as long as the new values are not also used
-- inside the same migration. We never reference 'PRACTICE' / 'READING' in
-- the SQL below, so this is fine.
ALTER TYPE "TutorialType" ADD VALUE IF NOT EXISTS 'PRACTICE';
ALTER TYPE "TutorialType" ADD VALUE IF NOT EXISTS 'READING';

-- New enums for the Mindset taxonomy.
CREATE TYPE "PracticeType" AS ENUM (
  'TAPPING',
  'ENERGY_STATEMENT',
  'AFFIRMATION',
  'SPELL',
  'RITUAL',
  'ACTIVITY',
  'JOURNAL_PROMPT',
  'VISUALISATION',
  'MEDITATION',
  'EMBODIMENT',
  'READING'
);

CREATE TYPE "PracticeTarget" AS ENUM (
  'MONEY',
  'BODY',
  'RELATIONSHIPS',
  'SLEEP',
  'ANXIETY',
  'CONFIDENCE',
  'ABUNDANCE',
  'STUCK',
  'GRIEF',
  'FEAR',
  'MOTHERHOOD',
  'PURPOSE',
  'TIME',
  'ENERGY',
  'JOY',
  'SPIRITUALITY',
  'HEALTH',
  'SELF_WORTH',
  'FORGIVENESS',
  'AGEING'
);

CREATE TYPE "TimeBand" AS ENUM (
  'THREE_MIN',
  'FIVE_MIN',
  'TEN_MIN',
  'TWENTY_MIN',
  'THIRTY_PLUS'
);

CREATE TYPE "BestTime" AS ENUM (
  'MORNING',
  'EVENING',
  'ANYTIME',
  'AS_NEEDED'
);

CREATE TYPE "PlanTier" AS ENUM (
  'FREE_DAILY_PICK',
  'PAID_CUSTOM'
);

CREATE TYPE "PlanStatus" AS ENUM (
  'PENDING_GENERATION',
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'ABANDONED'
);

CREATE TYPE "PlanSlotSource" AS ENUM (
  'LIBRARY_REF',
  'GENERATED'
);

-- Tutorial gets the Mindset practice-metadata columns. All nullable / with
-- safe defaults; existing Cooking rows untouched.
ALTER TABLE "Tutorial"
  ADD COLUMN "practiceType"           "PracticeType",
  ADD COLUMN "practiceTargets"        "PracticeTarget"[] DEFAULT ARRAY[]::"PracticeTarget"[],
  ADD COLUMN "timeBand"               "TimeBand",
  ADD COLUMN "bestTime"               "BestTime",
  ADD COLUMN "practiceDepth"          "Difficulty",
  ADD COLUMN "whenToUse"              TEXT,
  ADD COLUMN "whenNotToUse"           TEXT,
  ADD COLUMN "alternativePracticeIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Mindset-specific indexes on Tutorial. GIN on the targets array supports
-- the "show me everything tagged MONEY" filter the library browse uses.
CREATE INDEX "Tutorial_type_practiceType_idx" ON "Tutorial"("type", "practiceType");
CREATE INDEX "Tutorial_type_timeBand_idx"     ON "Tutorial"("type", "timeBand");
CREATE INDEX "Tutorial_type_bestTime_idx"     ON "Tutorial"("type", "bestTime");
CREATE INDEX "Tutorial_practiceTargets_idx"   ON "Tutorial" USING GIN ("practiceTargets");

-- UserPlan — one row per plan the user creates. Free users get
-- FREE_DAILY_PICK plans (just a daily curation surface — the
-- UserPlanDay rows are created lazily); paid users get PAID_CUSTOM plans
-- with bespoke generated content per day.
CREATE TABLE "UserPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "inputText" TEXT,
    "inputFields" JSONB,
    "timeMorning" INTEGER NOT NULL DEFAULT 5,
    "timeEvening" INTEGER NOT NULL DEFAULT 5,
    "antiTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tierAtCreation" "PlanTier" NOT NULL DEFAULT 'FREE_DAILY_PICK',
    "status" "PlanStatus" NOT NULL DEFAULT 'PENDING_GENERATION',
    "startDate" TIMESTAMP(3),
    "currentDay" INTEGER NOT NULL DEFAULT 1,
    "completedAt" TIMESTAMP(3),
    "generatorIntro" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPlan_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UserPlan_userId_status_idx"   ON "UserPlan"("userId", "status");
CREATE INDEX "UserPlan_status_createdAt_idx" ON "UserPlan"("status", "createdAt");

ALTER TABLE "UserPlan"
  ADD CONSTRAINT "UserPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- UserPlanDay — one row per (plan, dayNumber). Three optional slots
-- (morning / evening / anchor) each independently sourced from the
-- library or generated inline. Reflection note stored ciphertext.
CREATE TABLE "UserPlanDay" (
    "id" TEXT NOT NULL,
    "userPlanId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,

    "morningSource" "PlanSlotSource" NOT NULL DEFAULT 'LIBRARY_REF',
    "morningPracticeId" TEXT,
    "morningGeneratedContent" JSONB,
    "morningDoneAt" TIMESTAMP(3),

    "eveningSource" "PlanSlotSource" NOT NULL DEFAULT 'LIBRARY_REF',
    "eveningPracticeId" TEXT,
    "eveningGeneratedContent" JSONB,
    "eveningDoneAt" TIMESTAMP(3),

    "anchorSource" "PlanSlotSource",
    "anchorPracticeId" TEXT,
    "anchorGeneratedContent" JSONB,
    "anchorDoneAt" TIMESTAMP(3),

    "dailyReflectionPromptId" TEXT,

    "weeklyTheme" TEXT,
    "reflectionNote" TEXT,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPlanDay_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserPlanDay_userPlanId_dayNumber_key" ON "UserPlanDay"("userPlanId", "dayNumber");
CREATE INDEX        "UserPlanDay_userPlanId_dayNumber_idx" ON "UserPlanDay"("userPlanId", "dayNumber");

ALTER TABLE "UserPlanDay"
  ADD CONSTRAINT "UserPlanDay_userPlanId_fkey"             FOREIGN KEY ("userPlanId")             REFERENCES "UserPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "UserPlanDay_morningPracticeId_fkey"      FOREIGN KEY ("morningPracticeId")      REFERENCES "Tutorial"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "UserPlanDay_eveningPracticeId_fkey"      FOREIGN KEY ("eveningPracticeId")      REFERENCES "Tutorial"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "UserPlanDay_anchorPracticeId_fkey"       FOREIGN KEY ("anchorPracticeId")       REFERENCES "Tutorial"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "UserPlanDay_dailyReflectionPromptId_fkey" FOREIGN KEY ("dailyReflectionPromptId") REFERENCES "Tutorial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DailyPick — the free-tier Today view surface. One per (user, day).
CREATE TABLE "DailyPick" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pickDate" DATE NOT NULL,
    "practiceId" TEXT NOT NULL,
    "shownAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewedAt" TIMESTAMP(3),
    "markedHelpful" BOOLEAN NOT NULL DEFAULT false,
    "markedDoneAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyPick_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DailyPick_userId_pickDate_key" ON "DailyPick"("userId", "pickDate");
CREATE INDEX        "DailyPick_userId_pickDate_idx" ON "DailyPick"("userId", "pickDate");

ALTER TABLE "DailyPick"
  ADD CONSTRAINT "DailyPick_userId_fkey"     FOREIGN KEY ("userId")     REFERENCES "User"("id")     ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "DailyPick_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Tutorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- UserPracticeFavorite — saved practices.
CREATE TABLE "UserPracticeFavorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "practiceId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPracticeFavorite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserPracticeFavorite_userId_practiceId_key" ON "UserPracticeFavorite"("userId", "practiceId");
CREATE INDEX        "UserPracticeFavorite_userId_idx"            ON "UserPracticeFavorite"("userId");

ALTER TABLE "UserPracticeFavorite"
  ADD CONSTRAINT "UserPracticeFavorite_userId_fkey"     FOREIGN KEY ("userId")     REFERENCES "User"("id")     ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "UserPracticeFavorite_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Tutorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- UserPracticeUse — "I did this" history.
CREATE TABLE "UserPracticeUse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "practiceId" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contextTarget" "PracticeTarget",

    CONSTRAINT "UserPracticeUse_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UserPracticeUse_userId_usedAt_idx" ON "UserPracticeUse"("userId", "usedAt");
CREATE INDEX "UserPracticeUse_practiceId_idx"    ON "UserPracticeUse"("practiceId");

ALTER TABLE "UserPracticeUse"
  ADD CONSTRAINT "UserPracticeUse_userId_fkey"     FOREIGN KEY ("userId")     REFERENCES "User"("id")     ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "UserPracticeUse_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Tutorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- UserFeeling — anonymised "I'm feeling..." matcher events.
CREATE TABLE "UserFeeling" (
    "id" TEXT NOT NULL,
    "userIdHashed" TEXT NOT NULL,
    "feelingAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetAtTime" "PracticeTarget" NOT NULL,
    "matchedPracticeId" TEXT,

    CONSTRAINT "UserFeeling_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UserFeeling_userIdHashed_feelingAt_idx" ON "UserFeeling"("userIdHashed", "feelingAt");
CREATE INDEX "UserFeeling_targetAtTime_idx"           ON "UserFeeling"("targetAtTime");

ALTER TABLE "UserFeeling"
  ADD CONSTRAINT "UserFeeling_matchedPracticeId_fkey" FOREIGN KEY ("matchedPracticeId") REFERENCES "Tutorial"("id") ON DELETE SET NULL ON UPDATE CASCADE;
