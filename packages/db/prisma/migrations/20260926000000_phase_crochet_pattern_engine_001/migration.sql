-- Loom pattern engine (phase_crochet_pattern_engine_001).
--
-- Adds the machine-executable stitch program + its exact-pattern render tracking
-- to CrochetPattern. All additive + idempotent (ADD COLUMN IF NOT EXISTS), so a
-- re-run is a no-op. loomProgram is the single source the loom compiles three
-- ways (geometry / written rows / chart); loomHero is the deterministic
-- fidelity-gated render (distinct from the Fal img2img hero).
ALTER TABLE "CrochetPattern" ADD COLUMN IF NOT EXISTS "loomProgram" JSONB;
ALTER TABLE "CrochetPattern" ADD COLUMN IF NOT EXISTS "loomHeroMediaId" TEXT;
ALTER TABLE "CrochetPattern" ADD COLUMN IF NOT EXISTS "loomRenderStatus" "ImageGenerationStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "CrochetPattern" ADD COLUMN IF NOT EXISTS "loomRenderedAt" TIMESTAMP(3);
ALTER TABLE "CrochetPattern" ADD COLUMN IF NOT EXISTS "loomYarnRadiusMm" DOUBLE PRECISION;
ALTER TABLE "CrochetPattern" ADD COLUMN IF NOT EXISTS "loomFidelityScore" DOUBLE PRECISION;
ALTER TABLE "CrochetPattern" ADD COLUMN IF NOT EXISTS "loomGeometryHash" TEXT;

-- Index the loom-hero FK (mirrors heroMediaId).
CREATE INDEX IF NOT EXISTS "CrochetPattern_loomHeroMediaId_idx" ON "CrochetPattern"("loomHeroMediaId");

-- FK: loomHeroMediaId -> Media(id), SET NULL on media delete (mirrors heroMediaId).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CrochetPattern_loomHeroMediaId_fkey'
  ) THEN
    ALTER TABLE "CrochetPattern"
      ADD CONSTRAINT "CrochetPattern_loomHeroMediaId_fkey"
      FOREIGN KEY ("loomHeroMediaId") REFERENCES "Media"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
