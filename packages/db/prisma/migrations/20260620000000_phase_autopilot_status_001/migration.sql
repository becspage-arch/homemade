-- Autopilot status admin page + manual pause-state. Additive.
--
-- AutopilotHaltSignal gains `acknowledgedAt` / `acknowledgedById` so the
-- admin page can hide rows after they've been triaged.
--
-- AutopilotPauseState is a per-stream pause flag the admin page toggles.
-- The autopilot SKILL.md preflight reads it and writes a MANUAL_PAUSE halt
-- signal when paused; the cron itself stays enabled.

ALTER TABLE "AutopilotHaltSignal"
  ADD COLUMN "acknowledgedAt"   TIMESTAMP(3),
  ADD COLUMN "acknowledgedById" TEXT;

CREATE INDEX "AutopilotHaltSignal_acknowledgedAt_createdAt_idx"
  ON "AutopilotHaltSignal"("acknowledgedAt", "createdAt");

CREATE TABLE "AutopilotPauseState" (
  "id"         TEXT NOT NULL,
  "streamName" TEXT NOT NULL,
  "pausedAt"   TIMESTAMP(3),
  "pausedById" TEXT,
  "reason"     TEXT,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AutopilotPauseState_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AutopilotPauseState_streamName_key"
  ON "AutopilotPauseState"("streamName");
