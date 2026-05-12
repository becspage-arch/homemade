-- Phase B (analytics) — User acquisition + cohort properties.
--
-- All nullable: existing users predate the capture, that's fine. Captured
-- client-side on first visit (localStorage) and persisted on first signup
-- via the Clerk webhook. See docs/analytics-taxonomy.md for the contract.

ALTER TABLE "User"
  ADD COLUMN "utmSource" TEXT,
  ADD COLUMN "utmMedium" TEXT,
  ADD COLUMN "utmCampaign" TEXT,
  ADD COLUMN "utmContent" TEXT,
  ADD COLUMN "utmTerm" TEXT,
  ADD COLUMN "acquisitionChannel" TEXT,
  ADD COLUMN "signupCohortWeek" TEXT,
  ADD COLUMN "country" TEXT,
  ADD COLUMN "deviceClass" TEXT;
