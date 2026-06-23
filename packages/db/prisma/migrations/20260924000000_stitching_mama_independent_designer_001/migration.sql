-- Stitching Mama is an INDEPENDENT (non-house) cross-stitch designer — ~38
-- genuine patterns that fund the designer revenue share. The original
-- catalogue import (apps/web/scripts/import-stitching-mama-catalogue.ts)
-- wrongly created/updated the Designer row with isHouseDesigner = true, so by
-- the content-gate rule (isPremiumContent = premium flag OR designer is
-- non-house) every Stitching Mama pattern was reading as FREE on the live
-- surfaces instead of premium.
--
-- Flip the row to non-house. The gate (apps/web/src/lib/entitlements.ts) then
-- marks all of Stitching Mama's patterns premium everywhere it's consulted:
-- the library card badge, the pattern detail preview + "Stitch this" CTA, and
-- the Studio access check. House (Homemade) patterns are unaffected. The
-- designer spotlight also keys on this — only non-house designers are ever
-- featured — so this is what makes cross-stitch spotlight Stitching Mama.
--
-- Idempotent: re-running re-asserts false. The import script has been corrected
-- in the same change so a future catalogue re-run no longer undoes this.

UPDATE "Designer" SET "isHouseDesigner" = false WHERE "slug" = 'stitching-mama';
