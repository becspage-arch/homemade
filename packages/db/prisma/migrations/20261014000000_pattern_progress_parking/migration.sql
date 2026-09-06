-- Parking preferences on a Maker's per-pattern progress row.
--
-- Parking is the working method dense, confetti-heavy charts get finished
-- with: work one row (or column, or 10x10 block) at a time and leave each
-- colour's needle hanging in the next square that colour comes up in.
--
-- Only the preferences are stored. Where each colour is parked is derived
-- from stitchedCells plus the working order every time it is needed, so it
-- cannot drift out of step with progress, with an undo, or with a sync from
-- another device.
--
-- Additive, with defaults that leave every existing row behaving exactly as
-- it does today (parking off, rows, first line).
ALTER TABLE "UserPatternProgress" ADD COLUMN IF NOT EXISTS "parkingEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "UserPatternProgress" ADD COLUMN IF NOT EXISTS "parkingDirection" TEXT NOT NULL DEFAULT 'rows';
ALTER TABLE "UserPatternProgress" ADD COLUMN IF NOT EXISTS "parkingLine" INTEGER NOT NULL DEFAULT 0;
