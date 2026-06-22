-- Phase: cross-craft project + materials planner (phase_pattern_planner_001).
-- Additive only: two new tables + two enums. No changes to any existing
-- table or data. Cross-stitch is the first adapter; the tables carry no
-- craft specifics so crochet / knitting / needlework / sewing reuse them.

-- CreateEnum
CREATE TYPE "PlannerCraft" AS ENUM ('CROSS_STITCH', 'CROCHET', 'KNITTING', 'NEEDLEWORK', 'SEWING');

-- CreateEnum
CREATE TYPE "PlannerProjectStatus" AS ENUM ('QUEUED', 'IN_PROGRESS', 'FINISHED');

-- CreateTable: PlannerProject
CREATE TABLE "PlannerProject" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "craft" "PlannerCraft" NOT NULL,
    "patternId" TEXT NOT NULL,
    "status" "PlannerProjectStatus" NOT NULL DEFAULT 'QUEUED',
    "position" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "targetDate" TIMESTAMP(3),
    "settings" JSONB NOT NULL DEFAULT '{}',
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlannerProject_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PlannerProject_userId_craft_patternId_key" ON "PlannerProject"("userId", "craft", "patternId");
CREATE INDEX "PlannerProject_userId_status_idx" ON "PlannerProject"("userId", "status");
CREATE INDEX "PlannerProject_userId_craft_idx" ON "PlannerProject"("userId", "craft");

ALTER TABLE "PlannerProject"
  ADD CONSTRAINT "PlannerProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: PlannerStashItem
CREATE TABLE "PlannerStashItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "craft" "PlannerCraft" NOT NULL,
    "brand" TEXT,
    "code" TEXT,
    "name" TEXT,
    "colourRgb" TEXT,
    "quantityOwned" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unit" TEXT NOT NULL DEFAULT 'skein',
    "attributes" JSONB NOT NULL DEFAULT '{}',
    "notes" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlannerStashItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PlannerStashItem_userId_craft_brand_code_key" ON "PlannerStashItem"("userId", "craft", "brand", "code");
CREATE INDEX "PlannerStashItem_userId_craft_idx" ON "PlannerStashItem"("userId", "craft");

ALTER TABLE "PlannerStashItem"
  ADD CONSTRAINT "PlannerStashItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
