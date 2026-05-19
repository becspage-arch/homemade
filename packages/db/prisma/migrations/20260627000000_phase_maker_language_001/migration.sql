-- Phase Maker language + public profile (Session A).
--
-- Reframes the platform around the "Maker" identity. Every signed-in user is
-- a Maker; Creators are Makers who have been approved to upload premium
-- content (no separate role table). The public surface at /m/{handle} renders
-- the Maker's Made it log, Make it list, and (for creators) their published
-- tutorials.
--
-- This migration is purely additive — no field renames, no enum changes, no
-- drops. The "rebrand" is a label-only pass on the application layer.
-- Existing routes (/me/bookmarks, /me/projects, /makers/{handle}) stay live
-- so saved links and search-index entries don't break.
--
-- Reused fields rather than duplicated:
--   - User.displayHandle (already unique, already populated for creators) is
--     the Maker handle. The task's literal "User.handle String? @unique"
--     would have orphaned every existing /makers/{handle} URL.
--   - User.bio (already wired through /me/settings, 280-char cap) is the
--     public Maker bio. No duplicate User.makerBio.
--
-- Fields added:
--   User
--     isPublicMakerProfile  — opts the account into /m/{handle}; default false
--     makerHeaderImageId    — optional cover image (Media FK)
--     makerJoinedAt         — public "Maker since" stamp; backfilled to
--                              createdAt for existing rows
--   Bookmark
--     isPublic              — per-bookmark public-on-profile toggle
--   UserProject
--     isPublic              — opts the project into the public Made it log
--     publicNote            — separate from private `notes`; renders on the
--                              public Made it detail page
--     whatIUsed             — JSON array of supply lines
--                              ({ name, note?, productId?, productUrl? });
--                              productId/productUrl reserved for Session K
--     publishedAt           — set the first time isPublic flips true
--     heroPhotoId           — UGCPhoto FK; overrides which photo displays
--                              as the hero on the public Made it page.
--                              SET NULL on photo delete.
--
-- Indexes:
--   User                  (isPublicMakerProfile)        — admin queries +
--                                                          public-profile
--                                                          gate
--   UserProject           (isPublic, publishedAt)       — public Made it
--                                                          feed query
--                                                          (homepage +
--                                                          category rails)
--
-- Backfill (data) — every existing User gets makerJoinedAt = createdAt so
-- the "Maker since" stamp renders correctly without a separate one-off
-- script run. isPublic defaults false on UserProject + Bookmark — existing
-- rows are private until the Maker explicitly publishes one.
--
-- Handle backfill: a separate one-off script
-- (`packages/db/scripts/backfill-maker-handles.ts`) generates handles for
-- existing rows where displayHandle IS NULL. Run after this migration
-- applies.

-- User: new columns
ALTER TABLE "User"
  ADD COLUMN "isPublicMakerProfile" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "makerHeaderImageId" TEXT,
  ADD COLUMN "makerJoinedAt" TIMESTAMP(3);

-- Backfill makerJoinedAt to createdAt for every existing row.
UPDATE "User" SET "makerJoinedAt" = "createdAt" WHERE "makerJoinedAt" IS NULL;

ALTER TABLE "User"
  ADD CONSTRAINT "User_makerHeaderImageId_fkey"
    FOREIGN KEY ("makerHeaderImageId") REFERENCES "Media"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "User_isPublicMakerProfile_idx" ON "User"("isPublicMakerProfile");

-- Bookmark: new column
ALTER TABLE "Bookmark"
  ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false;

-- UserProject: new columns
ALTER TABLE "UserProject"
  ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "publicNote" TEXT,
  ADD COLUMN "whatIUsed" JSONB,
  ADD COLUMN "publishedAt" TIMESTAMP(3),
  ADD COLUMN "heroPhotoId" TEXT;

ALTER TABLE "UserProject"
  ADD CONSTRAINT "UserProject_heroPhotoId_fkey"
    FOREIGN KEY ("heroPhotoId") REFERENCES "UGCPhoto"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "UserProject_isPublic_publishedAt_idx"
  ON "UserProject"("isPublic", "publishedAt");
