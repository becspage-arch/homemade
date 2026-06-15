-- Content-completeness gate: structured block reason recorded when the publish
-- path downgrades a row to DRAFT for failing its per-category completeness
-- check. Nullable + additive; existing rows are unaffected.
ALTER TABLE "Tutorial" ADD COLUMN "qcBlockReason" JSONB;
