-- Phase 8 Mindset library rebalance — genre tagging via the existing
-- Tutorial.mood field, plus a GIN index so category-page genre filters
-- ("show me the magical / manifesting practices") match the speed of
-- the existing practiceTargets GIN index.
--
-- Also extends the PracticeTarget enum with HOME so the Home & lifestyle
-- life-category (one of the 16 planned mindset categories) has a first-class
-- enum value matching the other 15 life categories. Until now Home was the
-- only planned category without an enum slot, so its entries either went
-- untagged or borrowed an adjacent value.
--
-- No data migration required:
--   - `mood` column already exists (defaulted to []), so the new index
--     simply starts indexing the empty arrays.
--   - The HOME enum value is purely additive.
CREATE INDEX "Tutorial_mood_idx" ON "Tutorial" USING GIN ("mood");

ALTER TYPE "PracticeTarget" ADD VALUE 'HOME';
