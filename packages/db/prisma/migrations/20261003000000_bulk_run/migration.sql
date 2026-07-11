-- CreateTable
CREATE TABLE "BulkRun" (
    "id" TEXT NOT NULL,
    "craft" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "requested" INTEGER NOT NULL,
    "published" INTEGER NOT NULL DEFAULT 0,
    "culled" INTEGER NOT NULL DEFAULT 0,
    "repaired" INTEGER NOT NULL DEFAULT 0,
    "generations" INTEGER NOT NULL DEFAULT 0,
    "errors" INTEGER NOT NULL DEFAULT 0,
    "gemSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "killReasons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "triggeredById" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BulkRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BulkRun_craft_startedAt_idx" ON "BulkRun"("craft", "startedAt");

-- CreateIndex
CREATE INDEX "BulkRun_startedAt_idx" ON "BulkRun"("startedAt");
