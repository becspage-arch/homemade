-- AlterTable: add techniqueSlugs, criticalTechniques, aliases to SewingPattern.
-- Mirrors the same fields on Tutorial (phase_technique_linking_001).
-- Powers "patterns using this technique" rails for the sewing Studio.

ALTER TABLE "SewingPattern" ADD COLUMN "techniqueSlugs" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "SewingPattern" ADD COLUMN "criticalTechniques" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "SewingPattern" ADD COLUMN "aliases" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- GIN indexes for array-containment queries (@> operator).
CREATE INDEX "SewingPattern_techniqueSlugs_idx" ON "SewingPattern" USING GIN ("techniqueSlugs");
CREATE INDEX "SewingPattern_criticalTechniques_idx" ON "SewingPattern" USING GIN ("criticalTechniques");
