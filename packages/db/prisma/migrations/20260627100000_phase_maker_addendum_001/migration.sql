-- Phase Maker addendum (Session A part 2).
--
-- Five cross-cutting additions on top of the maker_language migration:
--
--   13. Maker profile moderation — extend ReportTargetType with 5 new
--       Maker-targeted values (bio, handle, header, publicNote, whatIUsed).
--   14. Handle rules — User.lastHandleChangeAt for the 90-day change
--       rate-limit; the profanity / reserved / impersonation lists live in
--       application code (apps/web/src/lib/handle-rules.ts), no schema.
--   15. Account deletion cascade — wired in the hard-delete worker; no
--       schema change beyond the fields already present.
--   16. Maker of the Month — new MakerOfTheMonth model + new
--       NotificationType value (MAKER_PROFILE_CONTENT_REMOVED, used by
--       the moderation path, not MOTM, but added in the same migration so
--       enum extensions stay together).
--   17. Did you make this? — User.dismissedDidYouMakeThis Json map +
--       new TutorialVisit table (composite PK on userId+tutorialId).
--
-- All additive — no rename / drop / change.

-- User: new columns
ALTER TABLE "User"
  ADD COLUMN "lastHandleChangeAt" TIMESTAMP(3),
  ADD COLUMN "dismissedDidYouMakeThis" JSONB NOT NULL DEFAULT '{}'::jsonb;

-- ReportTargetType: new enum values. Postgres requires ALTER TYPE … ADD VALUE
-- to run outside a transaction; Prisma's migrate runs each statement in its
-- own implicit transaction so each ADD VALUE stands alone.
ALTER TYPE "ReportTargetType" ADD VALUE 'MAKER_BIO';
ALTER TYPE "ReportTargetType" ADD VALUE 'MAKER_HANDLE';
ALTER TYPE "ReportTargetType" ADD VALUE 'MAKER_HEADER_IMAGE';
ALTER TYPE "ReportTargetType" ADD VALUE 'MAKER_PROJECT_PUBLIC_NOTE';
ALTER TYPE "ReportTargetType" ADD VALUE 'MAKER_PROJECT_WHAT_I_USED';

-- NotificationType: new value.
ALTER TYPE "NotificationType" ADD VALUE 'MAKER_PROFILE_CONTENT_REMOVED';

-- MakerOfTheMonth: new model.
CREATE TABLE "MakerOfTheMonth" (
  "id"              TEXT PRIMARY KEY,
  "userId"          TEXT NOT NULL,
  "monthStart"      TIMESTAMP(3) NOT NULL,
  "monthEnd"        TIMESTAMP(3) NOT NULL,
  "featuredReason"  TEXT NOT NULL,
  "createdByUserId" TEXT NOT NULL,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "MakerOfTheMonth_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MakerOfTheMonth_createdByUserId_fkey"
    FOREIGN KEY ("createdByUserId") REFERENCES "User"("id")
    ON DELETE NO ACTION ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "MakerOfTheMonth_monthStart_key"
  ON "MakerOfTheMonth"("monthStart");
CREATE INDEX "MakerOfTheMonth_monthStart_monthEnd_idx"
  ON "MakerOfTheMonth"("monthStart", "monthEnd");

-- TutorialVisit: new model. Composite primary key on (userId, tutorialId)
-- gives O(1) lookups for the smart prompt + cheap upserts on every
-- tutorial_viewed firing.
CREATE TABLE "TutorialVisit" (
  "userId"        TEXT NOT NULL,
  "tutorialId"    TEXT NOT NULL,
  "count"         INTEGER NOT NULL DEFAULT 0,
  "lastVisitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL,

  CONSTRAINT "TutorialVisit_pkey" PRIMARY KEY ("userId", "tutorialId"),
  CONSTRAINT "TutorialVisit_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TutorialVisit_tutorialId_fkey"
    FOREIGN KEY ("tutorialId") REFERENCES "Tutorial"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "TutorialVisit_userId_count_idx"
  ON "TutorialVisit"("userId", "count");
