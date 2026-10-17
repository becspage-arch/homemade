-- Pattern.flossSummary — the pattern page's floss key, stored at publish.
--
-- The cross-stitch pattern page prints one line per colour (stitch count and
-- skeins) and a skein total. Until now it worked those out on view, with a
-- Postgres count over every cell of the chart; on a 600x408 showpiece the first
-- hit on a fresh server task took about five seconds. The publish path now
-- writes the summary beside `data`, and the page reads it.
--
-- The trigger is what keeps it honest. Many writers rewrite `data` (the Studio
-- save, the chart-fix and backfill scripts, the brand swap) and not all of them
-- know about this column, so any UPDATE that changes `data` without also
-- writing `flossSummary` clears it. A cleared summary is rebuilt by the page on
-- its next view and stored. An INSERT needs nothing: a row that arrives without
-- one simply has none yet.
--
-- Additive and reversible: one nullable JSONB column, one function, one
-- trigger. Existing rows start NULL; scripts/xs-floss-summary-backfill.ts fills
-- the public catalogue.
ALTER TABLE "Pattern" ADD COLUMN IF NOT EXISTS "flossSummary" JSONB;

CREATE OR REPLACE FUNCTION pattern_floss_summary_invalidate() RETURNS trigger AS $$
BEGIN
  IF NEW."data" IS DISTINCT FROM OLD."data"
     AND NEW."flossSummary" IS NOT DISTINCT FROM OLD."flossSummary" THEN
    NEW."flossSummary" := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pattern_floss_summary_invalidate ON "Pattern";
CREATE TRIGGER pattern_floss_summary_invalidate
  BEFORE UPDATE OF "data" ON "Pattern"
  FOR EACH ROW EXECUTE FUNCTION pattern_floss_summary_invalidate();
