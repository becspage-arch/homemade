-- Outlines (phase_xs_outlines_001).
--
-- One additive, nullable JSON column recording what the outline pass did to a
-- cross-stitch row, so the change is REVERSIBLE and auditable:
--
--   { at, mode, modeReason, backstitchSegments, backstitchLength,
--     frenchKnots, addedSymbols, inkCodes,
--     previousThumbnailMediaId, previousDataSha256,
--     before: { totalStitches, colourCount },
--     after:  { totalStitches, colourCount } }
--
-- The old Media row is deliberately NOT deleted — previousThumbnailMediaId
-- still points at it, so a revert is a data restore plus one id swap.
--
-- Null on every row that was never outlined. ADD COLUMN IF NOT EXISTS so a
-- re-run is a no-op.

ALTER TABLE "Pattern" ADD COLUMN IF NOT EXISTS "outlineApplied" JSONB;
