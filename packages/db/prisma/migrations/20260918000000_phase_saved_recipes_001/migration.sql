-- Phase: unified Make it list — community recipes can be saved too.
-- Additive only: new SavedRecipe table mirroring SavedPattern / Bookmark.
-- No changes to any existing table or data.

-- CreateTable: SavedRecipe
CREATE TABLE "SavedRecipe" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userRecipeId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedRecipe_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SavedRecipe_userId_userRecipeId_key" ON "SavedRecipe"("userId", "userRecipeId");
CREATE INDEX "SavedRecipe_userId_idx" ON "SavedRecipe"("userId");

ALTER TABLE "SavedRecipe"
  ADD CONSTRAINT "SavedRecipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SavedRecipe"
  ADD CONSTRAINT "SavedRecipe_userRecipeId_fkey" FOREIGN KEY ("userRecipeId") REFERENCES "UserRecipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
