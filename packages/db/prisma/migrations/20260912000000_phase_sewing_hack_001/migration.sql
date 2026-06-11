-- Sewing S-6: SewingPatternHack — saved option set + parent pattern reference.
-- phase_sewing_hack_001 (2026-06-11).
--
-- The visual hack composer at /studio/sewing/hack saves the current
-- option set as a SewingPatternHack row. A hack is essentially a named
-- bookmark of a personalised design with a specific freesewing option
-- combination (e.g. Bella with neckline=scoop, bodyLength=+50mm).
--
-- The row reproduces deterministically: measurementsSnapshot is frozen at
-- save time so a later edit to UserSewingMeasurements doesn't silently
-- re-grade the hack. outputSvg + outputCacheKey cache the most recent
-- render.
--
-- Strictly additive. No existing tables are touched. Idempotent so a
-- partial-apply rerun does not block the migration runner.
-- Category.sewing stays NOT_READY and isPublicVisible stays false per the
-- no-phased-rollout lock; this migration does not flip either flag.
-- Premium gating stays driven by the STUDIO_PREMIUM_GATING_ENABLED config
-- flag (default off). Worker F flips it.

CREATE TABLE IF NOT EXISTS "SewingPatternHack" (
  "id"              TEXT NOT NULL,
  "userId"          TEXT NOT NULL,
  "parentPatternId" TEXT NOT NULL,
  "name"            TEXT,

  -- The hack itself. hackOptions is keyed by freesewing option name with
  -- the same value shape as SewingPatternPersonalisation.designOptions:
  --   { neckline: "vee", bodyLength: 50, sleeveLength: "short" }
  "hackOptions" JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Measurement snapshot at save time so the hack is reproducible if the
  -- user later edits their saved measurements. Same shape as
  -- SewingPatternPersonalisation.measurementsSnapshot.
  "measurementsSnapshot"           JSONB NOT NULL,
  "measurementsPreferenceSnapshot" TEXT NOT NULL,

  -- Output cache. Mirrors SewingPatternPersonalisation: outputSvg holds
  -- the last rendered SVG; outputCacheKey matches the wrapper's content
  -- hash so a re-draft hits SewingPatternDraftCache cleanly.
  "outputSvg"      TEXT,
  "outputCacheKey" TEXT,
  "generatedAt"    TIMESTAMP(3),

  -- Optional promotion to a project. Same FK shape as
  -- SewingPatternPersonalisation.projectId so the user can later attach
  -- a hack to a project they're working on.
  "savedToProjectId" TEXT,

  "notes" TEXT,

  -- Status tracks the wrapper's last attempt. PENDING means no draft
  -- yet; GENERATING is set while the wrapper runs; SUCCESS / FAILED /
  -- REJECTED mirror the personalisation states.
  "status" "PersonalisationStatus" NOT NULL DEFAULT 'PENDING',

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SewingPatternHack_pkey" PRIMARY KEY ("id"),

  CONSTRAINT "SewingPatternHack_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SewingPatternHack_parentPatternId_fkey"
    FOREIGN KEY ("parentPatternId") REFERENCES "SewingPattern"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SewingPatternHack_savedToProjectId_fkey"
    FOREIGN KEY ("savedToProjectId") REFERENCES "SewingPatternProject"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "SewingPatternHack_userId_idx"
  ON "SewingPatternHack"("userId");
CREATE INDEX IF NOT EXISTS "SewingPatternHack_parentPatternId_idx"
  ON "SewingPatternHack"("parentPatternId");
CREATE INDEX IF NOT EXISTS "SewingPatternHack_userId_updatedAt_idx"
  ON "SewingPatternHack"("userId", "updatedAt");
