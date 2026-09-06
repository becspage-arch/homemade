-- phase_xs_candidates_001 — the gate-mode switch and the parked counter.
--
-- Additive and reversible. `gateMode` decides WHO judges a cross-stitch
-- candidate: 'candidates' (a Claude Code session, and nothing on the cron path
-- calls a paid model at all) or 'api' (the September 2026 per-candidate vision
-- gate). `photoGateMode` is the same choice for a member's finished-project
-- photo, defaulting to 'api' so a member still sees a decision straight away.
-- `BulkRun.parked` is what a candidates-mode run actually produced; `published`
-- and `culled` on the same row are then filled in hours later, as a session
-- keeps and rejects.

ALTER TABLE "BulkAutopilotState"
  ADD COLUMN IF NOT EXISTS "gateMode" TEXT NOT NULL DEFAULT 'candidates',
  ADD COLUMN IF NOT EXISTS "photoGateMode" TEXT NOT NULL DEFAULT 'api';

ALTER TABLE "BulkRun"
  ADD COLUMN IF NOT EXISTS "parked" INTEGER NOT NULL DEFAULT 0;
