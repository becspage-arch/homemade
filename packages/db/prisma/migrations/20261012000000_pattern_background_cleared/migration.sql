-- Bare fabric (phase_xs_bare_fabric_001).
--
-- One additive, nullable JSON column recording what the background clear did to
-- a cross-stitch row, so the change is REVERSIBLE and auditable:
--
--   { at, reason, removedStitches, droppedSymbols,
--     previousThumbnailMediaId, previousDataSha256,
--     before: { totalStitches, colourCount },
--     after:  { totalStitches, colourCount } }
--
-- The old Media row is deliberately NOT deleted — previousThumbnailMediaId
-- still points at it, so a revert is a data restore plus one id swap.
--
-- Null on every row that was never cleared. ADD COLUMN IF NOT EXISTS so a
-- re-run is a no-op.

ALTER TABLE "Pattern" ADD COLUMN IF NOT EXISTS "backgroundCleared" JSONB;
