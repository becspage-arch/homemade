-- Makeability / completeness gate block reason for the standalone craft-pattern
-- models. Set when the hard-enforcement QC pass un-publishes a row
-- (visibility -> PRIVATE) for failing the locked completeness checklist.
-- Nullable + additive; mirrors Tutorial.qcBlockReason. Existing rows unaffected.
ALTER TABLE "Pattern" ADD COLUMN "qcBlockReason" JSONB;
ALTER TABLE "SewingPattern" ADD COLUMN "qcBlockReason" JSONB;
