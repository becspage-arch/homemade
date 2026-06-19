-- Phase: unified Make it list — patterns can be saved alongside tutorials.
-- Additive only: new SavedPattern table mirroring Bookmark. No changes to
-- any existing table or data.

-- CreateTable: SavedPattern
CREATE TABLE "SavedPattern" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "patternId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedPattern_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SavedPattern_userId_patternId_key" ON "SavedPattern"("userId", "patternId");
CREATE INDEX "SavedPattern_userId_idx" ON "SavedPattern"("userId");

ALTER TABLE "SavedPattern"
  ADD CONSTRAINT "SavedPattern_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SavedPattern"
  ADD CONSTRAINT "SavedPattern_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "Pattern"("id") ON DELETE CASCADE ON UPDATE CASCADE;
