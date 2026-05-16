-- Admin overhaul — SavedFilter + AdminCommandHistory.
--
-- Additive only. Both tables are admin-only personal state; cascading on
-- User deletion is the right behaviour (anonymised users shouldn't keep
-- saved filters or palette history).
--
-- See `feedback_schema_all_fields_upfront.md` — the shape covers everything
-- the admin overhaul needs today plus a description / context column for the
-- iterations we already know are coming (named filters, palette tooltips).

-- ────────────────────────────────────────────────────────────────────────────
-- SavedFilter
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE "SavedFilter" (
  "id"          TEXT NOT NULL,
  "userId"      TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "description" TEXT,
  "filterQuery" JSONB NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SavedFilter_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SavedFilter_userId_updatedAt_idx"
  ON "SavedFilter" ("userId", "updatedAt");

ALTER TABLE "SavedFilter"
  ADD CONSTRAINT "SavedFilter_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ────────────────────────────────────────────────────────────────────────────
-- AdminCommandHistory
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE "AdminCommandHistory" (
  "id"         TEXT NOT NULL,
  "userId"     TEXT NOT NULL,
  "command"    TEXT NOT NULL,
  "context"    JSONB,
  "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminCommandHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AdminCommandHistory_userId_executedAt_idx"
  ON "AdminCommandHistory" ("userId", "executedAt");

ALTER TABLE "AdminCommandHistory"
  ADD CONSTRAINT "AdminCommandHistory_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
